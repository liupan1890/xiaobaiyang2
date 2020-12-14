package localhost

import (
	"encoding/json"
	"log"
	"sync/atomic"
	"unsafe"

	"../data"
	"../sixpanv3"
	"../uploader"
)

func MakeUpload(item *DownFileModel) {
	threadcount := int(4)
	info, err := uploader.NewBigUploadInfoAutoBlock(item.DownID, unsafe.Pointer(item), item.DownSavePath, item.Size, item.Hash, 1024*1024*4, threadcount)
	if err != nil {
		b, _ := json.Marshal(*item)
		log.Println("上传启动失败", string(b))
		log.Println(err)
		UpdateState(item, false, true, false, true, "上传启动失败"+err.Error(), "")
		atomic.AddInt32(&nUpload, -1)
		return
	}

	OnLoadRange := func(worker *uploader.BigUploadWorker) {
		isget, jsonstr := data.GetRange(worker.UploadInfo.BlockHash)
		isget2, jsonstr2 := data.GetRange(worker.UploadInfo.BlockHash + "-token")
		if isget && jsonstr != "" && isget2 && jsonstr2 != "" {
			var token []string
			if err := json.Unmarshal([]byte(jsonstr2), &token); err == nil {
				worker.UploadInfo.UploadToken = token[0]
				worker.UploadInfo.UploadURL = token[1]
			}
			var list []uploader.BigUploadBlock
			if err := json.Unmarshal([]byte(jsonstr), &list); err == nil {
				if len(list) == len(worker.UploadInfo.BlockList) {
					listlen := len(list)
					for i := 0; i < listlen; i++ {
						if list[i].IsBlockCompleted == true {
							worker.UploadInfo.BlockList[i].Ctx = list[i].Ctx
							worker.UploadInfo.BlockList[i].IsBlockCompleted = true
						}
					}
				}
			}
		}
	}
	OnRefreshURL := func(worker *uploader.BigUploadWorker, StatusCode int) {
		fileinfo := (*DownFileModel)(unsafe.Pointer(worker.UploadInfo.DownInfo))
		sixuser := SixUserGet(fileinfo.UserID)
		if sixuser == nil {
			worker.IsFailed = true
			worker.FailedMessage = "需要重新登录账号才能继续，用户ID:" + fileinfo.UserID
			return
		}
		if worker.UploadInfo.FileHash == "" {
			fileinfo.FailedMessage = "正在计算文件hash，大文件会计算很久"
			fileHash, err := sixpanv3.ComputeFileEtagMutil(worker.UploadInfo.FileUpload, true)
			if err != nil || fileHash == "" {
				worker.IsFailed = true
				worker.FailedMessage = "计算文件hash失败" + err.Error()
				return
			}
			worker.UploadInfo.FileHash = fileHash
		}
		if worker.UploadInfo.UploadURL == "" {
			fileinfo.FailedMessage = "正在创建上传任务"
			token := sixpanv3.CreateUploadToken(sixuser.LoginHead, fileinfo.Path, fileinfo.Name, worker.UploadInfo.FileHash)
			worker.FailedMessage = ""
			if token.Created {
				worker.IsCompleted = true
				worker.IsMakeFile = true
				fileinfo.FailedMessage = "秒传成功"
				worker.FailedMessage = "秒传成功"
				return
			}
			if token.UploadToken == "" {
				worker.IsFailed = true
				fileinfo.FailedMessage = "获取UploadToken失败" + err.Error()
				worker.FailedMessage = "获取UploadToken失败" + err.Error()
				return
			}
			worker.UploadInfo.UploadToken = token.UploadToken
			worker.UploadInfo.UploadURL = token.PartUploadURL
		}
		uuid := uploader.ToMd5(worker.UploadInfo.DownID + "-" + worker.UploadInfo.FileHash)
		worker.UploadInfo.UploadBatch = uuid[0:8] + "-" + uuid[8:12] + "-" + uuid[12:16] + "-" + uuid[16:20] + "-" + uuid[20:32]
		worker.UploadInfo.UploadOrigin = data.Config.SixPanUploadUrl

	}
	OnUpdate := func(worker *uploader.BigUploadWorker) {
		fileinfo := (*DownFileModel)(unsafe.Pointer(worker.UploadInfo.DownInfo))
		if fileinfo.IsDowning {
			fileinfo.DownSize = worker.UploadSize
			fileinfo.DownProcess = worker.UploadProcess
			fileinfo.DownSpeed = worker.UploadSpeed
			fileinfo.DownSpeedStr = worker.UploadSpeedStr
			fileinfo.FailedMessage = FailedMessage(worker.FailedMessage)
		}
		mUpload.LoadOrStore(worker.UploadInfo.DownID, worker)
	}

	OnCompleted := func(worker *uploader.BigUploadWorker) {
		fileinfo := (*DownFileModel)(unsafe.Pointer(worker.UploadInfo.DownInfo))
		fileinfo.DownProcess = 100
		UpdateState(fileinfo, false, false, true, false, "", "")
		atomic.AddInt32(&nUpload, -1)
		mUpload.Delete(fileinfo.DownID)
	}
	OnFailed := func(worker *uploader.BigUploadWorker) {
		fileinfo := (*DownFileModel)(unsafe.Pointer(worker.UploadInfo.DownInfo))
		if worker.IsUploading == false {
			UpdateState(fileinfo, false, true, false, false, "", "")
		} else {
			UpdateState(fileinfo, false, true, false, true, FailedMessage(worker.FailedMessage), "")
		}
		atomic.AddInt32(&nUpload, -1)
		mUpload.Delete(fileinfo.DownID)
	}
	cli := uploader.NewBigUploadWorker(info, OnLoadRange, OnRefreshURL, OnUpdate, OnCompleted, OnFailed)
	mUpload.Store(item.DownID, cli)
	cli.StartUploadAsync(false)
}
