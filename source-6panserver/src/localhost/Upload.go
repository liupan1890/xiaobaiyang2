package localhost

import (
	"encoding/json"
	"os"
	"strconv"
	"strings"
	"time"

	"../data"
	"../sixpanv3"
	"../uploader"
)

type UploadSelectModel struct {
	Size  int64  `json:"size"`
	Path  string `json:"path"`
	IsDir bool   `json:"isdir"`
}

func UploadingList() string {
	var b strings.Builder
	DataUploading.RLock()
	needAppend := false
	LEN := len(DataUploading.List) - 1
	b.WriteString(`{"code":0,"message":"success","key":"uploading","filecount":` + strconv.Itoa(len(DataUploading.List)) + `,"filelist":[ `)
	for i := LEN; i >= 0; i-- {
		if needAppend {
			b.WriteString(",")
		}
		bs, _ := json.Marshal(DataUploading.List[i])
		b.Write(bs)
		needAppend = true
		if (LEN - i) >= 498 {
			break
		}
	}
	DataUploading.RUnlock()
	b.WriteString("]}")
	jsonstr := b.String()
	b.Reset()
	return jsonstr
}

func UploadList() string {
	var b strings.Builder
	DataUpload.RLock()
	needAppend := false
	LEN := len(DataUpload.List) - 1
	b.WriteString(`{"code":0,"message":"success","key":"upload","filecount":` + strconv.Itoa(len(DataUpload.List)) + `,"filelist":[ `)
	for i := LEN; i >= 0; i-- {
		if needAppend {
			b.WriteString(",")
		}
		bs, _ := json.Marshal(DataUpload.List[i])
		b.Write(bs)
		needAppend = true
	}
	DataUpload.RUnlock()
	b.WriteString("]}")
	jsonstr := b.String()
	b.Reset()
	return jsonstr
}

func UploadFile(userid, uploadToPath, filemodel, fileParentDir string, fileList []string) string {

	if strings.HasSuffix(uploadToPath, "/") == false {
		uploadToPath = uploadToPath + "/"
	}

	dtime := time.Now().UnixNano()
	PthSep := string(os.PathSeparator)
	if strings.HasSuffix(fileParentDir, PthSep) == false {
		fileParentDir = fileParentDir + PthSep
	}
	var SlelectFileList = make([]*UploadSelectModel, 0, len(fileList))
	if filemodel == "dir" {
		for i := 0; i < len(fileList); i++ {
			dir := strings.TrimRight(fileList[i], PthSep)
			Files, err := GetFilesWithDirs(dir)
			if err != nil {
				return ToErrorJSON(err)
			}
			SlelectFileList = append(SlelectFileList, Files...)
		}
	} else {
		SlelectFileList, _ = GetFilesWithFile(fileList)
	}

	LEN := len(SlelectFileList)
	if LEN == 0 {
		return ToSuccessJSON("filecount", 0)
	}
	var DirList []string
	for i := 0; i < LEN; i++ {
		item := SlelectFileList[i]
		if item.IsDir {
			dirname := item.Path[len(fileParentDir):]
			DirList = append(DirList, strings.ReplaceAll(strings.Trim(dirname, PthSep), "\\", "/"))
		}
	}
	var uploadToKey = sixpanv3.PathToIdentity(uploadToPath)
	sixuser := SixUserGet(userid)
	if len(DirList) > 0 {
		UploadFileCreatDir(sixuser.LoginHead, uploadToKey, DirList)
	}
	var FileCount = 0
	DataUploading.Lock()
	for i := 0; i < LEN; i++ {
		item := SlelectFileList[i]
		if item.IsDir == false {

			filename := strings.TrimRight(item.Path, PthSep)
			filename = filename[len(fileParentDir):]
			filename = strings.ReplaceAll(filename, "\\", "/")
			uptopath := uploadToPath + filename
			uptoname := uptopath[strings.LastIndex(uptopath, "/")+1:]
			uptopath = uptopath[0:strings.LastIndex(uptopath, "/")]
			UploadingAdd(userid, item.Path, uptoname, uptopath, item.Size, dtime)
			dtime++
			FileCount++
		}
	}
	DataUploading.Unlock()

	return ToSuccessJSON("filecount", FileCount)
}

func UploadingStartAll() string {
	DataUploading.RLock()
	LEN := len(DataUploading.List)
	for i := 0; i < LEN; i++ {
		if DataUploading.List[i].IsStop {
			UpdateState(DataUploading.List[i], false, false, false, false, "", "")
			DataUploading.List[i].AutoTry = 0
		}
	}
	DataUploading.RUnlock()
	return ToSuccessJSON("", nil)
}

func UploadingStopAll() string {
	list := []string{}
	DataUploading.RLock()
	LEN := len(DataUploading.List)
	for i := 0; i < LEN; i++ {
		if DataUploading.List[i].IsDowning {
			list = append(list, DataUploading.List[i].DownID)
			cli, ok := mUpload.Load(DataUploading.List[i].DownID)
			if ok && cli != nil {
				cli.(*uploader.BigUploadWorker).StopUploadAsync()
			}
		}
	}
	DataUploading.RUnlock()

	for j := 0; j < len(list); j++ {
		cli, ok := mUpload.Load(list[j])
		if ok && cli != nil {
			cli.(*uploader.BigUploadWorker).StopUploadSync()
			mUpload.Delete(list[j])
		}
	}

	return ToSuccessJSON("", nil)
}

func UploadDeleteAll() string {

	DataUpload.Lock()
	List := make([]*DownFileModel, 0, 100)
	LEN := len(DataUpload.List)
	for i := 0; i < LEN; i++ {
		data.DeleteDown(DataUpload.List[i].DownID)
	}
	DataUpload.List = List
	DataUpload.Unlock()

	return ToSuccessJSON("", nil)
}

func UploadingDeleteAll() string {

	DataUploading.Lock()
	List := make([]*DownFileModel, 0, 100)
	LEN := len(DataUploading.List)
	for i := 0; i < LEN; i++ {
		if DataUploading.List[i].IsStop {
			data.DeleteDown(DataUploading.List[i].DownID)
		} else {
			List = append(List, DataUploading.List[i])
		}
	}
	DataUploading.List = List
	DataUploading.Unlock()

	return ToSuccessJSON("", nil)
}

func UploadingStart(DownID string) string {
	isfind := false
	DataUploading.RLock()
	LEN := len(DataUploading.List)
	for i := 0; i < LEN; i++ {
		if DataUploading.List[i].DownID == DownID {
			isfind = true
			if DataUploading.List[i].IsDowning || DataUploading.List[i].IsCompleted {
				//正在上传或已完成 跳过
			} else {
				UpdateState(DataUploading.List[i], false, false, false, false, "", "")
				DataUploading.List[i].AutoTry = 0
			}
			break
		}
	}
	DataUploading.RUnlock()
	if isfind {
		return ToSuccessJSON("DownID", DownID)
	}
	return ToErrorMessageJSON("找不到上传中记录")
}

func UploadingStop(DownID string) string {
	isfind := false
	for i := 0; i < len(DataUploading.List); i++ {
		item := DataUploading.List[i]
		if item.DownID == DownID {
			isfind = true
			if item.IsDowning {
				cli, ok := mUpload.Load(DownID)
				if ok && cli != nil {
					cli.(*uploader.BigUploadWorker).StopUploadSync()
					mUpload.Delete(DownID)
				}
			}
			UpdateState(item, false, true, false, false, "", "")
			break
		}
	}
	if isfind {
		return ToSuccessJSON("DownID", DownID)
	}
	return ToErrorMessageJSON("找不到上传中记录")
}

func UploadingDelete(DownID string) string {
	UploadingStop(DownID)
	isfind := false
	DataUploading.Lock()
	LEN := len(DataUploading.List)
	for i := 0; i < LEN; i++ {
		if DataUploading.List[i].DownID == DownID {
			isfind = true
			if DataUploading.List[i].IsStop {
				data.DeleteDown(DownID)
				if i == LEN-1 {
					DataUploading.List = DataUploading.List[:LEN-1]
				} else {
					DataUploading.List = append(DataUploading.List[:i], DataUploading.List[i+1:]...)
				}
			}
			break
		}
	}
	DataUploading.Unlock()
	if isfind {
		return ToSuccessJSON("DownID", DownID)
	}
	return ToErrorMessageJSON("找不到上传中记录")
}

func UploadDelete(DownID string) string {
	isfind := false
	DataUpload.Lock()
	LEN := len(DataUpload.List)
	for i := 0; i < LEN; i++ {
		if DataUpload.List[i].DownID == DownID {
			isfind = true

			data.DeleteDown(DownID)
			if i == LEN-1 {
				DataUpload.List = DataUpload.List[:LEN-1]
			} else {
				DataUpload.List = append(DataUpload.List[:i], DataUpload.List[i+1:]...)
			}

			break
		}
	}
	DataUpload.Unlock()
	if isfind {
		return ToSuccessJSON("DownID", DownID)
	}
	return ToErrorMessageJSON("找不到已上传记录")
}
