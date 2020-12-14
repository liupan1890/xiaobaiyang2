package localhost

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"
	"unicode/utf8"

	"../data"
)

type DownFileModel struct {
	DownID       string `json:"DownID"`
	UserID       string `json:"UserID"`
	DownSavePath string `json:"DownSavePath"`
	DownServer   string `json:"DownServer"`
	Identity     string `json:"identity"`
	Name         string `json:"name"`
	Size         int64  `json:"size"`
	Path         string `json:"path"`
	Hash         string `json:"hash"`

	DownTime      int64  `json:"DownTime"`
	DownSize      int64  `json:"DownSize"`
	DownSpeed     int64  `json:"DownSpeed"`
	DownSpeedStr  string `json:"DownSpeedStr"`
	DownProcess   int64  `json:"DownProcess"`
	IsStop        bool   `json:"IsStop"`
	IsDowning     bool   `json:"IsDowning"`
	IsCompleted   bool   `json:"IsCompleted"`
	IsFailed      bool   `json:"IsFailed"`
	FailedMessage string `json:"FailedMessage"`
	AutoTry       int64
	FailedCode    int64
}

type DownFileOrder []*DownFileModel

func (a DownFileOrder) Len() int           { return len(a) }
func (a DownFileOrder) Less(i, j int) bool { return a[i].DownTime < a[j].DownTime }
func (a DownFileOrder) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

var DataDowned = struct {
	sync.RWMutex
	List []*DownFileModel
}{List: make([]*DownFileModel, 0, 100)}

var DataDowning = struct {
	sync.RWMutex
	List []*DownFileModel
}{List: make([]*DownFileModel, 0, 100)}

func LoadDownedList() {
	isget, list := data.GetDownedAll()
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
	DataDowned.Lock()
	DataDowned.List = List
	DataDowned.Unlock()
}

func LoadDowningList() {
	isget, list := data.GetDowningAll()
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
	DataDowning.Lock()
	DataDowning.List = List
	DataDowning.Unlock()
}

func DownedAdd(downitem *DownFileModel) error {
	timenow := time.Now().UnixNano()
	DowningID := downitem.DownID
	DownedID := strings.Replace(downitem.DownID, "Downing:", "Downed:", -1) + ":" + strconv.FormatInt(timenow, 10)
	downitem.DownID = DownedID
	downitem.DownTime = timenow
	DataDowned.List = append(DataDowned.List, downitem)

	b, _ := json.Marshal(downitem)
	data.SetDown(DownedID, string(b))
	data.DeleteDown(DowningID)
	return nil
}

func DowningAdd(userid, savepath, identity, name, path, hash string, size int64, dtime int64) (string, error) {
	var DownID = "Down:Downing:" + userid + ":" + identity

	path = filepath.Clean(path)
	d := string(os.PathSeparator)
	dlist := strings.Split(path, d)
	lendlist := len(dlist) - 1
	fname := dlist[lendlist]
	SavePathFull := savepath
	for i := 0; i < lendlist; i++ {
		tname := filepath.Join(SavePathFull, dlist[i], fname)
		if utf8.RuneCountInString(tname) > 254 {
			break
		}
		SavePathFull = filepath.Join(SavePathFull, dlist[i])
	}
	SavePathFull = filepath.Join(SavePathFull, fname)

	var m = DownFileModel{
		DownID:       DownID,
		UserID:       userid,
		DownSavePath: SavePathFull,

		Name:     name,
		Size:     size,
		Identity: identity,
		Path:     path,
		Hash:     hash,

		DownTime:      dtime,
		DownSize:      0,
		DownSpeed:     0,
		DownSpeedStr:  "",
		DownProcess:   0,
		IsStop:        false,
		IsDowning:     false,
		IsCompleted:   false,
		IsFailed:      false,
		FailedMessage: "",
		AutoTry:       0,
		FailedCode:    0,
	}

	LEN := len(DataDowning.List)
	for i := 0; i < LEN; i++ {
		if DataDowning.List[i].DownID == DownID {
			return "", errors.New("已存在重复任务")
		}
	}
	DataDowning.List = append(DataDowning.List, &m)
	b, _ := json.Marshal(m)
	data.SetDown(DownID, string(b))
	return DownID, nil
}

func UpdateState(item *DownFileModel, IsDowning, IsStop, IsCompleted, IsFailed bool, FailedMessage, DownSpeedStr string) {
	item.IsCompleted = IsCompleted
	item.FailedMessage = FailedMessage
	item.DownSpeedStr = DownSpeedStr
	item.IsFailed = IsFailed
	item.IsDowning = IsDowning
	item.IsStop = IsStop
}

func FailedMessage(FailedMessage string) string {
	if strings.Index(FailedMessage, "unexpected EOF") > 0 {
		return "链接被中断"
	}
	if strings.Index(FailedMessage, "target machine actively refused") > 0 {
		return "链接被拒绝"
	}
	if strings.Index(FailedMessage, "closed by the remote host") > 0 {
		return "链接被拒绝"
	}
	if strings.Index(FailedMessage, "certificate") > 0 {
		return "ssl证书错误"
	}
	if strings.HasPrefix(FailedMessage, "Get") && strings.HasSuffix(FailedMessage, "EOF") {
		return "链接被拒绝"
	}
	return FailedMessage
}

var tDown = time.NewTicker(time.Second * 2)

var nDown int32 = 0

var mDown sync.Map

func StartDowning() {

	defer func() {
		if errr := recover(); errr != nil {
			log.Println("DowningError ", " error=", errr)
		}
	}()

	for {
		select {
		case <-tDown.C:
			TaskCountMax, terr := strconv.ParseInt(data.Setting.TaskCountMax, 10, 32)
			if terr != nil {
				TaskCountMax = 1
			}

			count := atomic.LoadInt32(&nDown)
			if count < int32(TaskCountMax) {
				DataDowning.RLock()
				LEN := len(DataDowning.List)
				for i := LEN - 1; i >= 0; i-- {
					item := DataDowning.List[i]
					if item.IsStop == false && item.IsDowning == false && item.IsFailed == false && item.IsCompleted == false { //没下载没出错没暂停
						newcount := atomic.AddInt32(&nDown, 1)
						item.FailedMessage = ""
						item.IsStop = false
						item.IsDowning = true
						MakeDownload(item)
						if newcount >= int32(TaskCountMax) {
							break
						}
					}
				}
				DataDowning.RUnlock()
			}
			DataDowning.Lock()
			DataDowned.Lock()
			DowningCount := atomic.LoadInt32(&nDown)
			LEN := len(DataDowning.List)
			ErrorCount := 0
			for i := LEN - 1; i >= 0; i-- {
				if DataDowning.List[i].IsCompleted {
					aerr := DownedAdd(DataDowning.List[i])
					if aerr == nil {
						if i == LEN-1 {
							DataDowning.List = DataDowning.List[:LEN-1]
						} else {
							DataDowning.List = append(DataDowning.List[:i], DataDowning.List[i+1:]...)
						}
						LEN = len(DataDowning.List)
					}
				} else if DataDowning.List[i].IsFailed && DataDowning.List[i].IsDowning == false {
					ErrorCount++
				}
			}
			AutoTime := time.Now().Unix()
			if DowningCount < 2 && ErrorCount > 0 {
				LEN = len(DataDowning.List)
				for i := LEN - 1; i >= 0; i-- {
					if DataDowning.List[i].IsFailed && DataDowning.List[i].AutoTry < AutoTime && DataDowning.List[i].IsDowning == false { //对出错的自动重试5遍
						DataDowning.List[i].IsStop = false
						DataDowning.List[i].IsFailed = false
						DataDowning.List[i].FailedMessage = ""
						DataDowning.List[i].AutoTry = time.Now().Add(24 * time.Hour).Unix()
					}
				}
			}
			DataDowned.Unlock()
			DataDowning.Unlock()
		}
	}
}

func StopDowning() {
	tDown.Stop()
}
