package localhost

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/tidwall/gjson"

	"../data"
	"../downloader"
	"../sixpanv3"
)

func DowningList() string {
	var b strings.Builder
	DataDowning.RLock()
	needAppend := false
	LEN := len(DataDowning.List) - 1
	b.WriteString(`{"code":0,"message":"success","key":"downing","filecount":` + strconv.Itoa(len(DataDowning.List)) + `,"filelist":[ `)
	for i := LEN; i >= 0; i-- {
		if needAppend {
			b.WriteString(",")
		}
		bs, _ := json.Marshal(DataDowning.List[i])
		b.Write(bs)
		needAppend = true
		if (LEN - i) >= 498 {
			break
		}
	}
	DataDowning.RUnlock()
	b.WriteString("]}")
	jsonstr := b.String()
	b.Reset()
	return jsonstr
}

func DownedList() string {
	var b strings.Builder
	DataDowned.RLock()
	needAppend := false
	LEN := len(DataDowned.List) - 1
	b.WriteString(`{"code":0,"message":"success","key":"downed","filecount":` + strconv.Itoa(len(DataDowned.List)) + `,"filelist":[ `)
	for i := LEN; i >= 0; i-- {
		if needAppend {
			b.WriteString(",")
		}
		bs, _ := json.Marshal(DataDowned.List[i])
		b.Write(bs)
		needAppend = true
	}
	DataDowned.RUnlock()
	b.WriteString("]}")
	jsonstr := b.String()
	b.Reset()
	return jsonstr
}

func DownFile(userid, identity string) string {
	if identity == "6pan-root" || identity == "" {
		identity = sixpanv3.PathToIdentity("/")
	}
	sixuser := SixUserGet(userid)
	finfo, err := sixpanv3.FileInfo(sixuser.LoginHead, identity)
	if err != nil || finfo == nil {
		return ToErrorJSON(err)
	}
	if finfo == nil {
		return ToErrorMessageJSON("要下载的文件不存在")
	}
	var list []string
	if finfo.IsDir == false {
		fstr, _ := json.Marshal(finfo)
		list = []string{string(fstr)}
	} else {
		list, _ = sixpanv3.FilesListAllDir(sixuser.LoginHead, finfo.Path)
	}
	filecount := len(list)

	if data.Setting.SavePath == "" {
		return ToErrorMessageJSON("还没有设置下载保存位置，请点击设置按钮")
	}

	errmk := os.MkdirAll(data.Setting.SavePath, 0777)
	if errmk != nil {
		return ToErrorMessageJSON("下载保存位置错误，请重新设置")
	}

	dtime := time.Now().UnixNano()
	DataDowning.Lock()
	for i := 0; i < filecount; i++ {
		info := gjson.Parse(list[i])
		identity := info.Get("identity").Str
		name := info.Get("name").Str
		path := info.Get("path").Str
		hash := info.Get("hash").Str
		size := info.Get("size").Int()
		directory := info.Get("directory").Bool()
		if directory == false {
			hash = ""
			DowningAdd(userid, data.Setting.SavePath, identity, name, path, hash, size, dtime)
			dtime++
		} else {
			path = filepath.Clean(path)
			SavePathFull := filepath.Join(data.Setting.SavePath, path)
			os.MkdirAll(SavePathFull, 0777)
		}
	}
	DataDowning.Unlock()
	return ToSuccessJSON2("filecount", filecount, "directory", finfo.IsDir)

}

func DowningStartAll() string {
	DataDowning.RLock()
	LEN := len(DataDowning.List)
	for i := 0; i < LEN; i++ {
		if DataDowning.List[i].IsStop {
			UpdateState(DataDowning.List[i], false, false, false, false, "", "")
			DataDowning.List[i].AutoTry = 0
		}
	}
	DataDowning.RUnlock()
	return ToSuccessJSON("", nil)
}

func DowningStopAll() string {
	list := []string{}
	DataDowning.RLock()
	LEN := len(DataDowning.List)
	for i := 0; i < LEN; i++ {
		if DataDowning.List[i].IsDowning {
			list = append(list, DataDowning.List[i].DownID)
			cli, ok := mDown.Load(DataDowning.List[i].DownID)
			if ok && cli != nil {
				cli.(*downloader.BigDownWorker).StopDownAsync()
			}
		}
	}
	DataDowning.RUnlock()

	for j := 0; j < len(list); j++ {
		cli, ok := mDown.Load(list[j])
		if ok && cli != nil {
			cli.(*downloader.BigDownWorker).StopDownSync()
			mDown.Delete(list[j])
		}
	}

	return ToSuccessJSON("", nil)
}

func DownedDeleteAll() string {

	DataDowned.Lock()
	List := make([]*DownFileModel, 0, 100)
	LEN := len(DataDowned.List)
	for i := 0; i < LEN; i++ {
		data.DeleteDown(DataDowned.List[i].DownID)
	}
	DataDowned.List = List
	DataDowned.Unlock()

	return ToSuccessJSON("", nil)
}

func DowningDeleteAll() string {

	DataDowning.Lock()
	List := make([]*DownFileModel, 0, 100)
	LEN := len(DataDowning.List)
	for i := 0; i < LEN; i++ {
		if DataDowning.List[i].IsStop {
			data.DeleteDown(DataDowning.List[i].DownID)
		} else {
			List = append(List, DataDowning.List[i])
		}
	}
	DataDowning.List = List
	DataDowning.Unlock()

	return ToSuccessJSON("", nil)
}

func DowningStart(DownID string) string {
	isfind := false
	DataDowning.RLock()
	LEN := len(DataDowning.List)
	for i := 0; i < LEN; i++ {
		if DataDowning.List[i].DownID == DownID {
			isfind = true
			if DataDowning.List[i].IsDowning || DataDowning.List[i].IsCompleted {
				//正在下载或已完成 跳过
			} else {
				UpdateState(DataDowning.List[i], false, false, false, false, "", "")
				DataDowning.List[i].AutoTry = 0
			}
			break
		}
	}
	DataDowning.RUnlock()
	if isfind {
		return ToSuccessJSON("DownID", DownID)
	}
	return ToErrorMessageJSON("找不到下载中记录")
}

func DowningStop(DownID string) string {
	isfind := false
	for i := 0; i < len(DataDowning.List); i++ {
		item := DataDowning.List[i]
		if item.DownID == DownID {
			isfind = true
			if item.IsDowning {
				cli, ok := mDown.Load(DownID)
				if ok && cli != nil {
					cli.(*downloader.BigDownWorker).StopDownSync()
					mDown.Delete(DownID)
				}
			}
			UpdateState(item, false, true, false, false, "", "")
			break
		}
	}
	if isfind {
		return ToSuccessJSON("DownID", DownID)
	}
	return ToErrorMessageJSON("找不到下载中文件")
}

func DowningDelete(DownID string) string {

	DowningStop(DownID)
	isfind := false
	DataDowning.Lock()
	LEN := len(DataDowning.List)
	for i := 0; i < LEN; i++ {
		if DataDowning.List[i].DownID == DownID {
			isfind = true
			if DataDowning.List[i].IsStop {
				data.DeleteDown(DownID)
				if i == LEN-1 {
					DataDowning.List = DataDowning.List[:LEN-1]
				} else {
					DataDowning.List = append(DataDowning.List[:i], DataDowning.List[i+1:]...)
				}
			}
			break
		}
	}
	DataDowning.Unlock()
	if isfind {
		return ToSuccessJSON("DownID", DownID)
	}
	return ToErrorMessageJSON("找不到下载中记录")
}

func DownedDelete(DownID string) string {
	isfind := false
	DataDowned.Lock()
	LEN := len(DataDowned.List)
	for i := 0; i < LEN; i++ {
		if DataDowned.List[i].DownID == DownID {
			isfind = true

			data.DeleteDown(DownID)
			if i == LEN-1 {
				DataDowned.List = DataDowned.List[:LEN-1]
			} else {
				DataDowned.List = append(DataDowned.List[:i], DataDowned.List[i+1:]...)
			}

			break
		}
	}
	DataDowned.Unlock()
	if isfind {
		return ToSuccessJSON("DownID", DownID)
	}
	return ToErrorMessageJSON("找不到已下载记录")
}
