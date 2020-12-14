package sixpanv3

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"../data"
	"../utils"
	"github.com/tidwall/gjson"
)

func UserLoginByPhonePwd(country string, phone string, password string) (logincookie string, err error) {

	password = ToMd5(password)
	refurl := AccountURL("login?appid=3a5654a9ccc9&destination=https%3A%2F%2Fv3-beta.6pan.cn%2Ffiles%2Fall%2F&response=redirect&scope=&state=7go9cgga6&lang=zh-CN")
	url := AccountURL("v3/oauth/login")
	header := "Content-Type: application/json\nUser-Agent: " + data.Config.SixPanApiAgent + "\nReferer: " + refurl + "\n"
	postdata := BodyString(Body{"countryCode": country, "user": phone, "password": password})

	code, head, body := utils.PostHTTPString(url, header, postdata)

	info := gjson.Parse(body)
	if info.Get("success").Exists() && info.Get("success").Bool() == false {
		message := info.Get("message").String()
		return "", errors.New(message)
	}
	if code != 200 {
		return "", errors.New(body)
	}

	if info.Get("success").Exists() && info.Get("success").Bool() == true {
		status := head[strings.Index(head, "login-status="):]
		status = status[0:strings.Index(status, "\n")]
		if strings.Index(status, ";") > 0 {
			status = status[0:strings.Index(status, ";")]
		}
		return CheckLoginStatus(status)
	}
	return "", errors.New("UserLoginByPhonePwd Error")
}

func UserLoginByName(name string, password string) (logincookie string, err error) {

	password = ToMd5(password)
	refurl := AccountURL("login?appid=3a5654a9ccc9&destination=https%3A%2F%2Fv3-beta.6pan.cn%2Ffiles%2Fall%2F&response=redirect&scope=&state=7go9cgga6&lang=zh-CN")
	url := AccountURL("v3/oauth/login")

	header := "Content-Type: application/json\nUser-Agent: " + data.Config.SixPanApiAgent + "\nReferer: " + refurl + "\n"
	postdata := BodyString(Body{"user": name, "password": password})

	code, head, body := utils.PostHTTPString(url, header, postdata)

	info := gjson.Parse(body)
	if info.Get("success").Exists() && info.Get("success").Bool() == false {
		message := info.Get("message").String()
		return "", errors.New(message)
	}
	if code != 200 {
		return "", errors.New(body)
	}

	if info.Get("success").Exists() && info.Get("success").Bool() == true {
		status := head[strings.Index(head, "login-status="):]
		status = status[0:strings.Index(status, "\n")]
		if strings.Index(status, ";") > 0 {
			status = status[0:strings.Index(status, ";")]
		}
		return CheckLoginStatus(status)
	}
	return "", errors.New("UserLoginByPhonePwd Error")
}

func CheckLoginStatus(statuscookie string) (logincookie string, err error) {
	refurl := AccountURL("login?appid=3a5654a9ccc9&destination=https%3A%2F%2Fv3-beta.6pan.cn%2Ffiles%2Fall%2F&response=redirect&scope=&state=7go9cgga6&lang=zh-CN")
	url := AccountURL("v3/oauth/checkCookie?appid=3a5654a9ccc9&destination=https%3A%2F%2Fv3-beta.6pan.cn%2Ffiles%2Fall%2F&lang=zh-CN&scope=&state=7go9cgga6&response=redirect")
	header := "User-Agent: " + data.Config.SixPanApiAgent + "\nReferer: " + refurl + "\nCookie: " + statuscookie
	_, head, _ := utils.GetHTTPString(url, header)
	if strings.Index(head, "token=") > 0 {
		token := head[strings.Index(head, "token="):]
		token = token[0:strings.Index(token, "\n")]
		if strings.Index(token, ";") > 0 {
			token = token[0:strings.Index(token, ";")]
		}

		tokensig := head[strings.Index(head, "token.sig="):]
		tokensig = tokensig[0:strings.Index(tokensig, "\n")]
		if strings.Index(tokensig, ";") > 0 {
			tokensig = tokensig[0:strings.Index(tokensig, ";")]
		}

		logincookie = "Cookie: locale=zh-cn; " + token + "; " + tokensig
		return logincookie, nil
	}
	return "", errors.New("loginstatus Error")
}

func UserLoginByCookie(cookie string) (userid string, err error) {

	url := APIURL("v3/user/info")

	header := "Content-Type: application/json\nUser-Agent: " + data.Config.SixPanApiAgent + "\n" + cookie
	postdata := BodyString(Body{"ts": time.Now().Unix()})

	code, _, body := utils.PostHTTPString(url, header, postdata)

	if code == 200 {
		info := gjson.Parse(body)
		if info.Get("identity").Exists() {
			identity := info.Get("identity").Int()
			return strconv.FormatInt(identity, 10), nil
		}
	}
	return "", errors.New("UserLoginByCookie Error")
}
