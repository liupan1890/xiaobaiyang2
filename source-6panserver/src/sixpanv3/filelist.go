package sixpanv3

import (
	"errors"
	"strings"

	"../data"
	"../utils"
	"github.com/tidwall/gjson"
)

func FilesListAllDirByHead(Head string, path string) ([]string, error) {
	list, err := FilesList(Head, path, 0)

	if err == nil && len(list) > 0 {
		childlist := make([]string, 0, 100)
		LEN := len(list)
		for i := 0; i < LEN; i++ {
			if gjson.Get(list[i], "directory").Bool() {
				cpath := gjson.Get(list[i], "path").String()
				clist, cerr := FilesListAllDirByHead(Head, cpath)
				if cerr == nil && len(clist) > 0 {
					childlist = append(childlist, clist...)
				}
			}
		}
		if len(childlist) > 0 {
			list = append(list, childlist...)
		}
	}

	return list, err
}

func FilesListAllDir(LoginHead string, path string) ([]string, error) {
	header := "Content-Type: application/json\nUser-Agent: " + data.Config.SixPanApiAgent + "\n" + LoginHead
	list, err := FilesList(header, path, 0)

	if err == nil && len(list) > 0 {
		childlist := make([]string, 0, 100)
		LEN := len(list)
		for i := 0; i < LEN; i++ {
			if gjson.Get(list[i], "directory").Bool() {
				cpath := gjson.Get(list[i], "path").String()
				clist, cerr := FilesListAllDir(LoginHead, cpath)
				if cerr == nil && len(clist) > 0 {
					childlist = append(childlist, clist...)
				}
			}
		}
		if len(childlist) > 0 {
			list = append(list, childlist...)
		}
	}

	return list, err
}

func FilesList(header string, path string, page int) ([]string, error) {

	url := APIURL("v3/newfile/list")

	postdata := BodyString(Body{"parentPath": path, "skip": page * 999, "limit": 999, "orderby": [][]string{
		[]string{"ctime", "desc"},
		[]string{"directory", "desc"},
	}})

	code, _, body := utils.PostHTTPString(url, header, postdata)

	if code != 200 {
		return nil, errors.New(body)
	}

	info := gjson.Parse(body)
	arr := parseString(info.Get("dataList").Array())
	if page == 0 {
		haschildren := info.Get("parent").Get("children").Exists()
		children := info.Get("parent").Get("children").Int() - 1
		if haschildren == false || children > 899 {
			for int64(len(arr)) < children {
				page++
				arr2, err := FilesList(header, path, page)
				if err != nil || arr2 == nil || len(arr2) == 0 {
					break
				}
				arr = append(arr, arr2...)
				arr2 = nil
			}
		}
	}
	body = ""
	return arr, nil
}

func parseString(list []gjson.Result) []string {
	var fl = len(list)
	var res = make([]string, 0, fl+10)
	for i := 0; i < fl; i++ {
		if strings.Contains(list[i].Raw, "_如果您看到此文件，请升级到") {
			continue
		}
		res = append(res, list[i].Raw)
	}
	return res
}
