package localhost

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"os"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"../data"
	"../sixpanv3"
)

func GetFilesWithDirs(dirPath string) (files []*UploadSelectModel, err error) {
	dir, err := ioutil.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}
	files = make([]*UploadSelectModel, 0, len(dir))
	PthSep := string(os.PathSeparator)
	parent := strings.TrimRight(dirPath, PthSep)

	for _, fi := range dir {
		m := UploadSelectModel{
			Size:  fi.Size(),
			Path:  parent + PthSep + fi.Name(),
			IsDir: fi.IsDir(),
		}
		if m.IsDir {
			m.Path = m.Path + PthSep
		}
		files = append(files, &m)
		if fi.IsDir() {
			childfiles, _ := GetFilesWithDirs(parent + PthSep + fi.Name())
			if childfiles != nil {
				files = append(files, childfiles...)
			}
		}
		if len(files) >= 11000 {
			return nil, errors.New("文件夹内文件总数不能超过 10000")
		}
	}
	return files, nil
}

func GetFilesWithFile(filelist []string) (files []*UploadSelectModel, err error) {
	files = make([]*UploadSelectModel, 0, len(filelist))
	LEN := len(filelist)
	for i := 0; i < LEN; i++ {
		fi, err := os.Stat(filelist[i])
		if err == nil && fi != nil && fi.IsDir() == false {
			m := UploadSelectModel{
				Size:  fi.Size(),
				Path:  filelist[i],
				IsDir: false,
			}
			files = append(files, &m)
		}
	}
	return files, nil
}

var DataUpload = struct {
	sync.RWMutex
	List []*DownFileModel
}{List: make([]*DownFileModel, 0, 100)}

var DataUploading = struct {
	sync.RWMutex
	List []*DownFileModel
}{List: make([]*DownFileModel, 0, 100)}

func LoadUploadList() {
	isget, list := data.GetUploadAll()
	if isget == false || len(list) == 0 {
		return
	}
	WeekAgo := time.Now().Add(-10 * 24 * time.Hour).UnixNano()
	List := make([]*DownFileModel, 0, 100)
	for DownID := range list {
		DownItem := &DownFileModel{}
		err := json.Unmarshal([]byte(list[DownID]), &DownItem)
		if err == nil {
			if DownItem.DownTime < WeekAgo {
				data.DeleteDown(DownID)
			} else {
				DownItem.AutoTry = 0
				DownItem.IsDowning = false
				DownItem.IsCompleted = true
				List = append(List, DownItem)
			}
		}
	}
	sort.Sort(DownFileOrder(List))
	DataUpload.Lock()
	DataUpload.List = List
	DataUpload.Unlock()
}

func LoadUploadingList() {
	isget, list := data.GetUploadingAll()
	if isget == false || len(list) == 0 {
		return
	}

	List := make([]*DownFileModel, 0, 100)
	for DownID := range list {
		DownItem := &DownFileModel{}
		err := json.Unmarshal([]byte(list[DownID]), &DownItem)
		if err == nil {
			DownItem.IsStop = true
			DownItem.IsDowning = false
			DownItem.IsCompleted = false
			DownItem.IsFailed = false
			DownItem.FailedMessage = ""
			DownItem.AutoTry = 0
			List = append(List, DownItem)
		}
	}
	sort.Sort(DownFileOrder(List))
	DataUploading.Lock()
	DataUploading.List = List
	DataUploading.Unlock()
}

func UploadAdd(downitem *DownFileModel) error {
	timenow := time.Now().UnixNano()
	DowningID := downitem.DownID
	DownedID := strings.Replace(downitem.DownID, "Uploading:", "Upload:", -1) + ":" + strconv.FormatInt(timenow, 10)
	downitem.DownID = DownedID
	downitem.DownTime = timenow
	DataUpload.List = append(DataUpload.List, downitem)

	b, _ := json.Marshal(downitem)
	data.SetDown(DownedID, string(b))
	data.DeleteDown(DowningID)
	return nil
}

func UploadingAdd(userid, localpath, uptoname, uptopath string, size int64, dtime int64) (string, error) {
	var identity = sixpanv3.PathToIdentity(uptopath + "/" + uptoname)
	if uptopath == "" {
		uptopath = "/"
	}
	var DownID = "Down:Uploading:" + userid + ":" + identity

	var m = DownFileModel{
		DownID:       DownID,
		UserID:       userid,
		DownSavePath: localpath,

		Name:     uptoname,
		Size:     size,
		Identity: identity,
		Path:     uptopath,
		Hash:     "",

		DownTime:      dtime,
		DownSpeedStr:  "",
		DownProcess:   0,
		IsStop:        false,
		IsDowning:     false,
		IsCompleted:   false,
		IsFailed:      false,
		FailedMessage: "",
		AutoTry:       0,
	}

	LEN := len(DataUploading.List)
	for i := 0; i < LEN; i++ {
		if DataUploading.List[i].DownID == DownID {
			return "", errors.New("已存在重复任务")
		}
	}
	DataUploading.List = append(DataUploading.List, &m)
	b, _ := json.Marshal(m)
	data.SetDown(DownID, string(b))
	return DownID, nil
}

func UploadFileCreatDir(LoginHead, uploadtokey string, DirList []string) {

	var MKList []string
	var LEN = len(DirList)
	for i := 0; i < LEN; i++ {
		var path = DirList[i]
		var add = false
		for j := 0; j < len(MKList); j++ {
			if strings.HasPrefix(path, MKList[j]) {
				MKList[j] = path
				add = true
				break
			}
		}
		if add == false {
			MKList = append(MKList, path)
		}
	}

	for k := 0; k < len(MKList); k++ {
		var path = MKList[k]
		go sixpanv3.CreatDir(LoginHead, uploadtokey, path)
	}
}

var tUpload = time.NewTicker(time.Second * 2)

var nUpload int32 = 0

var mUpload sync.Map

func StartUploading() {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("UploadingError ", " error=", errr)
		}
	}()
	for {
		select {
		case <-tUpload.C:
			TaskCountMax, terr := strconv.ParseInt(data.Setting.TaskCountMax, 10, 32)
			if terr != nil {
				TaskCountMax = 1
			}
			count := atomic.LoadInt32(&nUpload)
			if count < int32(TaskCountMax) {
				DataUploading.RLock()
				LEN := len(DataUploading.List)
				for i := LEN - 1; i >= 0; i-- {
					item := DataUploading.List[i]
					if item.IsStop == false && item.IsDowning == false && item.IsFailed == false && item.IsCompleted == false {
						newcount := atomic.AddInt32(&nUpload, 1)
						item.IsStop = false
						item.IsDowning = true
						MakeUpload(item)

						if newcount >= int32(TaskCountMax) {
							break
						}
					}
				}
				DataUploading.RUnlock()
			}

			DataUploading.Lock()
			DataUpload.Lock()
			DowningCount := atomic.LoadInt32(&nUpload)
			LEN := len(DataUploading.List)
			ErrorCount := 0
			for i := LEN - 1; i >= 0; i-- {
				if DataUploading.List[i].IsCompleted {
					aerr := UploadAdd(DataUploading.List[i])
					if aerr == nil {
						if i == LEN-1 {
							DataUploading.List = DataUploading.List[:LEN-1]
						} else {
							DataUploading.List = append(DataUploading.List[:i], DataUploading.List[i+1:]...)
						}
						LEN = len(DataUploading.List)
					}
				} else if DataUploading.List[i].IsFailed && DataUploading.List[i].AutoTry < 5 && DataUploading.List[i].IsDowning == false {
					ErrorCount++
				}
			}

			if DowningCount == 0 && ErrorCount > 0 {
				LEN = len(DataUploading.List)
				for i := LEN - 1; i >= 0; i-- {
					if DataUploading.List[i].IsFailed && DataUploading.List[i].AutoTry < 5 && DataUploading.List[i].IsDowning == false { //对出错的自动重试5遍
						DataUploading.List[i].IsStop = false
						DataUploading.List[i].IsFailed = false
						DataUploading.List[i].FailedMessage = ""
						DataUploading.List[i].AutoTry = DataUploading.List[i].AutoTry + 1
					}
				}
			}
			DataUpload.Unlock()
			DataUploading.Unlock()
		}
	}
}

func StopUploading() {
	tUpload.Stop()
}
