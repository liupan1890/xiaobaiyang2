package localhost

import (
	"encoding/json"
	"log"
	"os"
	"strconv"
	"strings"
	"sync/atomic"
	"time"
	"unsafe"

	"../data"
	"../downloader"
	"../sixpanv3"

	utils "../utils"
)

func MakeDownload(item *DownFileModel) {

	ThreadCountMax, terr := strconv.ParseInt(data.Setting.ThreadCountMax, 10, 32)
	if terr != nil {
		ThreadCountMax = 1
	}
	threadcount := int(ThreadCountMax)
	if item.FailedCode == 503 || item.FailedCode == 403 {
		threadcount = 1
	}
	sixuser := SixUserGet(item.UserID)
	if sixuser != nil && sixuser.IsVip == false {
		threadcount = 1
	}
	minsize := int64(100) * 1024 * 1024
	maxsize := int64(200) * 1024 * 1024

	info, err := downloader.NewBigDownInfoAutoBlock(item.DownID, unsafe.Pointer(item), "",
		0, item.DownSavePath, item.Size, false, minsize, maxsize, threadcount, map[string]string{"Accept": "*/*", "User-Agent": data.Config.SixPanDownAgent})

	if err != nil {
		b, _ := json.Marshal(*item)
		log.Println("下载启动失败", string(b))
		log.Println(err)
		UpdateState(item, false, true, false, true, "联网请求文件大小出错"+err.Error(), "")
		atomic.AddInt32(&nDown, -1)
		return
	}

	OnLoadRange := func(worker *downloader.BigDownWorker) {
		isget, jsonstr := data.GetRange(worker.DownInfo.DownID)
		if isget && jsonstr != "" {
			var info downloader.BigDownInfo
			if err := json.Unmarshal([]byte(jsonstr), &info); err == nil {
				if info.BlockHash == worker.DownInfo.BlockHash {
					listlen := len(info.BlockList)
					for i := 0; i < listlen; i++ {
						worker.DownInfo.BlockList[i].DownedSize = info.BlockList[i].DownedSize
					}
				}
			}
		}
	}
	OnRefreshURL := func(worker *downloader.BigDownWorker, StatusCode int) {
		fileinfo := (*DownFileModel)(unsafe.Pointer(worker.DownInfo.DownInfo))
		sixuser := SixUserGet(fileinfo.UserID)
		if sixuser == nil {
			worker.IsFailed = true
			worker.FailedMessage = "需要重新登录账号才能继续，用户ID:" + fileinfo.UserID
			return
		}
		url := ""
		var err error
		for i := 0; i < 40; i++ {
			url, _, err = sixpanv3.DownloadAddress(sixuser.LoginHead, fileinfo.Identity)
			if err != nil {
				if strings.Contains(err.Error(), "文件系统忙") {
					fileinfo.FailedMessage = "等待获取下载链接"
					err = nil
					time.Sleep(time.Duration(5) * time.Second)
					continue
				}
				if strings.Contains(err.Error(), "可能需要登录") {
					fileinfo.FailedMessage = "等待获取下载链接"
					_, islogin := ReAddUser(fileinfo.UserID)
					if islogin {
						err = nil
						continue
					} else {
						break
					}
				}
			}
			break
		}
		fileinfo.FailedMessage = ""
		if url == "" || err != nil {
			if strings.Contains(err.Error(), "可能需要登录") {
				worker.IsFailed = true
				worker.FailedMessage = "需要重新登录账号才能继续，用户名:" + sixuser.UserName
			} else {
				worker.IsFailed = true
				worker.FailedMessage = "获取下载地址失败"
			}
			return
		}
		worker.DownInfo.DownURL = url

	}
	OnUpdate := func(worker *downloader.BigDownWorker) {
		fileinfo := (*DownFileModel)(unsafe.Pointer(worker.DownInfo.DownInfo))
		if fileinfo.IsDowning {
			url := worker.DownInfo.DownURL
			url = strings.ToLower(url)
			if strings.Contains(url, "//") {
				url = url[strings.Index(url, "//")+2:]
				url = url[0:strings.Index(url, "/")]
				fileinfo.DownServer = url
			}

			fileinfo.DownSize = worker.DownSize
			fileinfo.DownProcess = worker.DownProcess
			fileinfo.DownSpeed = worker.DownSpeed
			fileinfo.DownSpeedStr = worker.DownSpeedStr
			fileinfo.FailedMessage = FailedMessage(worker.FailedMessage)
		}
		mDown.LoadOrStore(worker.DownInfo.DownID, worker)
	}

	OnCompleted := func(worker *downloader.BigDownWorker) {
		fileinfo := (*DownFileModel)(unsafe.Pointer(worker.DownInfo.DownInfo))
		fileinfo.DownProcess = 100
		if fileinfo.Hash != "" {
			fileinfo.DownSpeedStr = ""
			fileinfo.FailedMessage = "正在校验Hash"
			h2, _ := sixpanv3.ComputeFileEtagMutil(worker.DownInfo.FileSave, true)
			issame := fileinfo.Hash == h2 || strings.Contains(worker.DownInfo.DownURL, h2)
			log.Println("校验结果", issame, worker.DownInfo.FileSave)
			if issame {
				UpdateState(fileinfo, false, false, true, false, "", "")
			} else {
				os.Remove(worker.DownInfo.FileSave)
				UpdateState(fileinfo, false, true, false, true, "文件Hash校验失败", "")
			}
		} else {
			UpdateState(fileinfo, false, false, true, false, "", "")
		}
		atomic.AddInt32(&nDown, -1)
		mDown.Delete(fileinfo.DownID)
		if data.Setting.RunDownFinish {
			GID := md5str(fileinfo.DownID)
			utils.RunDownFinish(GID[0:16], "1", worker.DownInfo.FileSave)
		}
	}
	OnFailed := func(worker *downloader.BigDownWorker) {
		fileinfo := (*DownFileModel)(unsafe.Pointer(worker.DownInfo.DownInfo))
		if worker.IsDowning == false {
			UpdateState(fileinfo, false, true, false, false, "", "")
		} else if worker.FailedMessage == "response status error:500" {
			UpdateState(fileinfo, false, true, false, true, "6盘cdn回源拉取中，请稍后再试", "")
		} else if worker.FailedMessage == "response status error:503" {
			fileinfo.FailedCode = 503
			fileinfo.AutoTry = time.Now().Add(1 * time.Minute).Unix()
			UpdateState(fileinfo, false, true, false, true, "503错误,1分钟后会自动单线程重试", "")
		} else if worker.FailedMessage == "response status error:403" {
			fileinfo.FailedCode = 403
			fileinfo.AutoTry = time.Now().Add(3 * time.Minute).Unix()
			UpdateState(fileinfo, false, true, false, true, "403错误,3分钟后会自动单线程重试", "")
		} else {
			fileinfo.AutoTry = time.Now().Add(1 * time.Minute).Unix()
			UpdateState(fileinfo, false, true, false, true, FailedMessage(worker.FailedMessage)+"稍后会自动重试", "")
		}

		atomic.AddInt32(&nDown, -1)
		mDown.Delete(fileinfo.DownID)
	}
	cli := downloader.NewBigDownWorker(info, OnLoadRange, OnRefreshURL, OnUpdate, OnCompleted, OnFailed)
	mDown.Store(item.DownID, cli)
	cli.StartDownAsync(true)
}
