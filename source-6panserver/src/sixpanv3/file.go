package sixpanv3

import (
	"encoding/json"
	"errors"
	"strings"

	"../data"
	"../utils"
	"github.com/tidwall/gjson"
)

type SixFile struct {
	UniqueIdentity string `json:"uniqueIdentity"`
	Identity       string `json:"identity"`
	ETag           string `json:"hash"`
	UserIdentity   int64  `json:"userIdentity"`
	Path           string `json:"path"`
	Name           string `json:"name"`
	Ext            string `json:"ext"`
	Size           int64  `json:"size"`
	Hidden         bool   `json:"hidden"`
	CreateTime     int64  `json:"ctime"`
	Mime           string `json:"mime"`
	ParentIdentity string `json:"parent"`
	IsDir          bool   `json:"directory"`
	Children       int    `json:"children"`
	ChildrenTotal  int    `json:"childrenTotal"`
}

func DownloadAddress(LoginHead string, identity string) (string, int64, error) {

	url := APIURL("v3/newfile/download")
	header := "Content-Type: application/json\nUser-Agent: " + data.Config.SixPanDownAgent + "\n" + LoginHead
	postdata := BodyString(Body{"identity": identity})

	code, _, body := utils.PostHTTPString(url, header, postdata)

	if code != 200 {
		return "", 0, errors.New(body)
	}
	info := gjson.Parse(body)
	if info.Get("success").Exists() && info.Get("success").Bool() == false {
		message := info.Get("message").String()
		return "", 0, errors.New(message)
	}

	downurl := gjson.Parse(body).Get("downloadAddress").Str
	size := gjson.Parse(body).Get("size").Int()
	return downurl, size, nil
}

func FileInfo(LoginHead string, identity string) (*SixFile, error) {

	url := APIURL("v3/newfile/" + identity)
	header := "Content-Type: application/json\nUser-Agent: " + data.Config.SixPanApiAgent + "\n" + LoginHead
	code, _, body := utils.GetHTTPString(url, header)
	if code != 200 {
		return nil, errors.New(body)
	}
	info := gjson.Parse(body)
	if info.Get("success").Exists() && info.Get("success").Bool() == false {
		return nil, errors.New(info.Get("message").Str)
	}
	var file *SixFile
	err := json.Unmarshal([]byte(body), &file)
	if err != nil {
		return nil, err
	}
	return file, nil
}

func FileInfoByHead(Head string, identity string) (*SixFile, error) {

	url := APIURL("v3/newfile/" + identity)
	header := Head
	code, _, body := utils.GetHTTPString(url, header)
	if code != 200 {
		return nil, errors.New(body)
	}
	info := gjson.Parse(body)
	if info.Get("success").Exists() && info.Get("success").Bool() == false {
		return nil, errors.New(info.Get("message").Str)
	}
	var file *SixFile
	err := json.Unmarshal([]byte(body), &file)
	if err != nil {
		return nil, err
	}
	return file, nil
}

func TrashFile(LoginHead string, identitys []string) (async bool, err error) {

	url := APIURL("v3/newfile/trash")
	header := "Content-Type: application/json\nUser-Agent: " + data.Config.SixPanApiAgent + "\n" + LoginHead
	postdata := BodyString(Body{"sourceIdentity": identitys})

	code, _, body := utils.PostHTTPString(url, header, postdata)

	if code != 200 {
		return false, errors.New(body)
	}
	info := gjson.Parse(body)
	if info.Get("identity").Exists() && info.Get("data").Exists() {
		return info.Get("async").Bool(), nil
	}
	return false, errors.New("TrashFile Error")
}

func CreatDir(LoginHead string, identity string, dirname string) error {
	dirname = ClearFileName(dirname, false)

	url := APIURL("v3/newfile")
	header := "Content-Type: application/json\nUser-Agent: " + data.Config.SixPanApiAgent + "\n" + LoginHead
	postdata := BodyString(Body{"parent": identity, "path": dirname})

	code, _, body := utils.PostHTTPString(url, header, postdata)

	if code != 200 {
		return errors.New(body)
	}

	info := gjson.Parse(body)
	if info.Get("identity").Exists() && info.Get("path").Exists() {
		return nil
	}
	return errors.New("CreatDir Error")
}

func ClearFileName(name string, file bool) string {
	name = strings.Replace(name, "<", "", -1)
	name = strings.Replace(name, ">", "", -1)
	name = strings.Replace(name, "|", "", -1)
	name = strings.Replace(name, ":", "", -1)
	name = strings.Replace(name, "*", "", -1)
	name = strings.Replace(name, "?", "", -1)
	name = strings.Replace(name, "\\", "/", -1)
	name = strings.Replace(name, "//", "/", -1)
	name = strings.Replace(name, "//", "/", -1)
	name = strings.Replace(name, "..", ".", -1)
	if file {
		name = strings.Replace(name, "/", "", -1)
	}
	return name
}
