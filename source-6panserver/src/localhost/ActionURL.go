package localhost

import (
	"encoding/base64"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"../data"
	"../utils/"
	"github.com/tidwall/gjson"
)

func ActionURL(w http.ResponseWriter, req *http.Request) {

	jsonstr := ""
	defer func() {
		if err := recover(); err != nil {
			log.Println("ActionURLError ", " input=", jsonstr, " error=", err)
		}
	}()

	var jsonbs []byte
	if req.Body != nil {
		bodyBytes, _ := ioutil.ReadAll(req.Body)
		decodeBytes, _ := base64.StdEncoding.DecodeString(string(bodyBytes))
		jsonstr = string(decodeBytes)

		url := gjson.Get(jsonstr, "url").String()
		method := gjson.Get(jsonstr, "method").String()
		header := gjson.Get(jsonstr, "header").String()
		postdata := gjson.Get(jsonstr, "postdata").String()
		authpwd := gjson.Get(jsonstr, "authpwd").String()

		islocal := strings.Contains(req.Host, "localhost:")

		if islocal == false && data.Remote.IsRemote && (authpwd == "" || strings.ToLower(authpwd) != md5str(data.Remote.RemotePassword)) {
			log.Println("authpwd=", authpwd, " RemotePassword=", md5str(data.Remote.RemotePassword), "  "+data.Remote.RemotePassword)
			jsonbs = []byte(ToSuccessJSON3("code", 200, "header", "", "body", ToErrorMessageJSON("远程管理密码错误")))
		} else {
			if strings.HasPrefix(strings.ToLower(url), "http") {
				jsonbs = []byte(HookURL(url, method, header, postdata, req.UserAgent()))
			} else {
				ishook, hookresult := HookAction(islocal, url, postdata)
				if ishook {
					jsonbs = []byte(ToSuccessJSON3("code", 200, "header", "", "body", hookresult))
				} else {
					jsonbs = []byte(ToSuccessJSON3("code", 200, "header", jsonstr, "body", ToErrorMessageJSON("不支持的操作")))
				}
			}
		}
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("x-md-by", "xiaobaiyang")
	w.WriteHeader(200)
	if len(jsonbs) > 0 {
		w.Write(jsonbs)
	}
}

func HookURL(url string, method string, header string, postdata string, useragent string) string {

	if useragent != "" && strings.Contains(header, "User-Agent") == false {
		header = "User-Agent: " + useragent + "\n" + header
	}
	if strings.ToLower(method) == "get" {
		respcode, resphead, respbody := utils.GetHTTPString(url, header)
		if respcode != 200 {
			resphead = url + header
		}
		return ToSuccessJSON3("code", respcode, "header", resphead, "body", respbody)
	}
	respcode, resphead, respbody := utils.PostHTTPString(url, header, postdata)
	if respcode != 200 {
		resphead = url + header + postdata
	}

	return ToSuccessJSON3("code", respcode, "header", resphead, "body", respbody)

}

func HookAction(islocal bool, url string, postdata string) (bool, string) {
	if strings.Contains(postdata, "DownPage") == false {
		//fmt.Println(postdata)
	}
	userid := gjson.Get(postdata, "userid").String()

	switch url {
	case "LoadSetting":
		return true, LoadSetting()
	case "UpdateSetting":
		key := gjson.Get(postdata, "key").String()
		value := gjson.Get(postdata, "value").String()
		return true, UpdateSetting(key, value)
	case "LoadUserList":
		return true, LoadUserList()
	case "AddUser":
		return true, AddUser(postdata)
	case "ReLogin":
		resultadduser, _ := ReAddUser(userid)
		return true, resultadduser
	case "UserSave":
		return true, SixUserSave(postdata)
	case "UserDelete":
		return true, SixUserDelete(userid)
	case "EditUserPassword":
		newPassword := gjson.Get(postdata, "newPassword").String()
		return true, EditUserPassword(userid, newPassword)
	case "OfflineAddBT":
		return true, OfflineAddBT(postdata)
	case "DownloadTxt":
		downloadAddress := gjson.Get(postdata, "downloadAddress").String()
		size := gjson.Get(postdata, "size").Int()
		return true, DownloadTxt(downloadAddress, size)
	case "PlayFile":
		link := gjson.Get(postdata, "link").String()
		return true, PlayFile(islocal, link)
	case "DownFile":
		identity := gjson.Get(postdata, "identity").String()
		return true, DownFile(userid, identity)
	case "DownList":
		DownPage := gjson.Get(postdata, "DownPage").String()
		return true, DownList(DownPage)
	case "DownStart":
		DownPage := gjson.Get(postdata, "DownPage").String()
		DownID := gjson.Get(postdata, "DownID").String()
		return true, DownStart(DownPage, DownID)
	case "DownStop":
		DownPage := gjson.Get(postdata, "DownPage").String()
		DownID := gjson.Get(postdata, "DownID").String()
		return true, DownStop(DownPage, DownID)
	case "DownDelete":
		DownPage := gjson.Get(postdata, "DownPage").String()
		DownID := gjson.Get(postdata, "DownID").String()
		return true, DownDelete(DownPage, DownID)
	case "UploadFile":
		uploadToPath := gjson.Get(postdata, "uploadToPath").String()
		filemodel := gjson.Get(postdata, "filemodel").String()
		fileParentDir := gjson.Get(postdata, "fileParentDir").String()
		list := gjson.Get(postdata, "fileList").Array()
		var filelist []string
		for i := 0; i < len(list); i++ {
			filelist = append(filelist, list[i].String())
		}
		upfileresult := UploadFile(userid, uploadToPath, filemodel, fileParentDir, filelist)
		return true, upfileresult

	case "LoadRssList":
		return true, LoadRssList()
	case "LoadRssItemList":
		rsskey := gjson.Get(postdata, "rsskey").String()
		return true, LoadRssItemList(rsskey)
	case "LoadRssItemListSearch":
		searchkey := gjson.Get(postdata, "searchkey").String()
		return true, LoadRssItemListSearch(searchkey)
	case "LoadRssItemContent":
		rssitemkey := gjson.Get(postdata, "rssitemkey").String()
		return true, LoadRssItemContent(rssitemkey)
	}

	return false, ""
}
