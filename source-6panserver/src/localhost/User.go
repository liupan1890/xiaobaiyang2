package localhost

import (
	"encoding/json"
	"fmt"
	"log"
	"sort"
	"strings"
	"sync"
	"time"

	"../data"
	"../sixpanv3"
	"github.com/tidwall/gjson"
)

type UIUserLogin struct {
	Mode      string `json:"mode"`
	Country   string `json:"country"`
	Phone     string `json:"phone"`
	Password  string `json:"password"`
	Name      string `json:"name"`
	Cookie    string `json:"cookie"`
	Logintime int64  `json:"logintime"`
}

type UIUser struct {
	UserID      string `json:"key"`
	UserName    string `json:"username"`
	CountryCode string `json:"countryCode"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	IsVip       bool   `json:"isvip"`
	VipDate     string `json:"vipdate"`
	PanUsed     string `json:"panused"`

	CreateTime int64  `json:"createTime"`
	Password   string `json:"password"`
	Salt       string `json:"salt"`

	LoginHead string `json:"loginHead"`
}

func AddUser(jsonstr string) string {

	loginuser := &UIUserLogin{}
	err := json.Unmarshal([]byte(jsonstr), &loginuser)
	if err == nil {
		var logincookie string
		if loginuser.Mode == "phone" {
			logincookie, err = sixpanv3.UserLoginByPhonePwd(loginuser.Country, loginuser.Phone, loginuser.Password)
		} else if loginuser.Mode == "user" {
			logincookie, err = sixpanv3.UserLoginByName(loginuser.Name, loginuser.Password)
		} else if loginuser.Mode == "cookie" {
			logincookie = loginuser.Cookie
		}

		if err == nil {
			var userid string
			userid, err = sixpanv3.UserLoginByCookie(logincookie)
			if err == nil {
				if loginuser.Mode != "cookie" {
					loginuser.Logintime = time.Now().Unix() * 1000
					loginuserbs, _ := json.Marshal(*loginuser)
					data.SetUser("Login:"+userid, string(loginuserbs))
				}
				return ToSuccessJSON2("userid", userid, "loginHead", logincookie)
			}
		}
	}
	if err != nil {
		return ToErrorJSON(err)
	}
	return ToErrorMessageJSON("不支持的操作")
}

var UserLoginLock = struct {
	sync.RWMutex
}{}

func ReAddUser(userid string) (string, bool) {
	UserLoginLock.Lock()
	islogin := false
	result := ""
	sixuser := SixUserGet(userid)
	_, err := sixpanv3.UserLoginByCookie(sixuser.LoginHead)
	if err == nil {
		islogin = true
		result = ToSuccessJSON2("userid", sixuser.UserID, "loginHead", sixuser.LoginHead)
		fmt.Println("跳过登录" + userid)
	} else {
		fmt.Println("重新登录" + userid)
		log.Println("重新登录" + userid)
		isget, jsonstr := data.GetUser("Login:" + userid)
		if isget {
			result = AddUser(jsonstr)
			if gjson.Get(result, "code").Exists() && gjson.Get(result, "code").Int() == 0 {
				islogin = true
			} else {
				data.DelUser("Login:" + userid)
			}
		}
	}
	UserLoginLock.Unlock()
	if islogin == false {
		result = ToErrorMessageJSON("自动登录失败")
	}
	return result, islogin
}

func LoadUserList() string {
	isget, list := data.GetUserAll()
	if isget == false || len(list) == 0 {
		return `{"code":0,"message":"success","userlist":[]}`
	}

	var b strings.Builder
	b.WriteString(`{"code":0,"message":"success","userlist":[ `)
	needAppend := false
	for userkey := range list {
		if needAppend {
			b.WriteString(",")
		}
		b.Write([]byte(list[userkey]))
		needAppend = true
	}
	b.WriteString("]}")
	resp := b.String()
	b.Reset()
	return resp
}

func SixUserGet(userid string) *UIUser {
	if userid == "" {
		return nil
	}
	_, jsonstr := data.GetUser("SixUser:" + userid)
	sixuser := &UIUser{}
	err := json.Unmarshal([]byte(jsonstr), &sixuser)
	if err != nil {
		return nil
	}
	return sixuser
}

func SixUserDelete(userid string) string {
	data.DelUser("SixUser:" + userid)
	return ToSuccessJSON("", nil)
}

func SixUserSave(sixuserstr string) string {
	sixuser := &UIUser{}
	err := json.Unmarshal([]byte(sixuserstr), &sixuser)
	if err == nil {
		userid := sixuser.UserID
		if userid != "add" && sixuser.LoginHead != "" {
			data.SetUser("SixUser:"+userid, sixuserstr)
		}
	}
	return ToSuccessJSON("", nil)
}

func EditUserPassword(userid string, newPassword string) string {
	isget, jsonstr := data.GetUser("Login:" + userid)
	if isget {
		loginuser := &UIUserLogin{}
		err := json.Unmarshal([]byte(jsonstr), &loginuser)
		if err == nil {
			loginuser.Password = newPassword
			loginuser.Logintime = time.Now().Unix() * 1000
			loginuserbs, _ := json.Marshal(*loginuser)
			data.SetUser("Login:"+userid, string(loginuserbs))
		}
	}
	return ToSuccessJSON("", nil)
}

var AUI = 0

func AutoRefreshUserInfo() {
	defer func() {
		if err := recover(); err != nil {
			log.Println("ARUserError ", " error=", err)
		}
	}()

	isget, list := data.GetUserAll()
	if isget && len(list) > 0 {
		var sceneList []string
		for k := range list {
			sceneList = append(sceneList, k)
		}
		sort.Strings(sceneList)
		if AUI >= len(sceneList) {
			AUI = 0
		}
		if AUI <= len(sceneList) {
			userkey := sceneList[AUI]
			userid := strings.Replace(userkey, "User:SixUser:", "", -1)
			sixuser := SixUserGet(userid)
			sixpanv3.UserLoginByCookie(sixuser.LoginHead)
		}
		AUI++
	}
}
