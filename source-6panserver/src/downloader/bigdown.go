package downloader

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"../data"
	"../utils"
)

type BigDownWorker struct {
	DownInfo       *BigDownInfo
	client         *http.Client
	filePtr        *os.File
	fileLock       sync.Mutex
	DownSpeed      int64
	DownSpeedStr   string
	DownSize       int64
	DownSizeStr    string
	DownProcess    int64
	DownProcessStr string
	IsUpdateing    int64
	IsDowning      bool
	IsCompleted    bool
	IsFailed       bool
	FailedMessage  string
	WaitDowning    sync.WaitGroup
	OnLoadRange    func(worker *BigDownWorker)
	OnRefreshURL   func(worker *BigDownWorker, StatusCode int)
	RefreshTime    int64
	OnUpdate       func(worker *BigDownWorker)

	OnCompleted func(worker *BigDownWorker)
	OnFailed    func(worker *BigDownWorker)
}

func (worker *BigDownWorker) chekcAllBlockCompleted() bool {
	for _, block := range worker.DownInfo.BlockList {
		if block.IsBlockCompleted == false {
			return false
		}
	}
	return true
}

func (worker *BigDownWorker) openSaveFile() (bool, bool, error) {
	if utils.IsDir(worker.DownInfo.FileSave) {
		return false, false, errors.New("SaveFile cannot be dir")
	}
	fileSave := worker.DownInfo.FileSave
	fileAuto := worker.DownInfo.FileSave

	for i := 1; i < 10; i++ {
		isexist, issame, err := utils.CheckFileAndLen(fileAuto, worker.DownInfo.FileSize)
		if err != nil {
			return false, false, err
		} else if issame {
			worker.DownInfo.FileSave = fileAuto
			return true, false, nil
		} else if isexist {
			if worker.DownInfo.FileAutoName {
				dir, file := filepath.Split(fileSave)
				ext := filepath.Ext(file)
				if ext == "" {
					fileAuto = dir + file + "(" + strconv.Itoa(i) + ")"
				} else {
					filelen := len(file)
					extlen := len(ext)
					fileAuto = dir + file[0:filelen-extlen-1] + "(" + strconv.Itoa(i) + ")" + ext
				}
			} else {
				return false, false, errors.New("SaveFile Exist")
			}
		} else {
			worker.DownInfo.FileSave = fileAuto
			dir, _ := filepath.Split(fileAuto)
			errmk := os.MkdirAll(dir, 0777)
			if errmk != nil {
				return false, false, errmk
			}
			fileTD := fileAuto + ".td"
			filePtr, erropen := os.OpenFile(fileTD, os.O_WRONLY|os.O_CREATE, 0666)
			if erropen != nil {
				return false, false, erropen
			}
			worker.filePtr = filePtr

			stat, err := filePtr.Stat()
			fileTDExist := false
			if err == nil {
				fileTDExist = (stat.Size() == worker.DownInfo.FileSize)
				if stat.Size() != worker.DownInfo.FileSize {
					utils.DFallocate(filePtr, worker.DownInfo.FileSize)
				}
			}

			return false, fileTDExist, nil
		}
	}
	return false, false, errors.New("SaveFile OpenError")
}

func (worker *BigDownWorker) writeToFile(pos int64, b []byte) error {
	worker.fileLock.Lock()
	_, werr := worker.filePtr.Seek(pos, 0)
	if werr == nil {
		_, werr = worker.filePtr.Write(b)
		if werr == nil {
			werr = worker.filePtr.Sync()
		}
	}
	worker.fileLock.Unlock()
	return werr
}

func NewBigDownWorker(info *BigDownInfo,
	onLoadRange func(worker *BigDownWorker),
	onRefreshURL func(worker *BigDownWorker, StatusCode int),
	onUpdate func(worker *BigDownWorker),
	onCompleted func(worker *BigDownWorker),
	onFailed func(worker *BigDownWorker)) *BigDownWorker {
	timeUnix := time.Now().Unix()
	client := &BigDownWorker{
		DownInfo: info,
		client: &http.Client{
			Transport: &http.Transport{
				ResponseHeaderTimeout: time.Second * 20,
			},
		},
		RefreshTime:  timeUnix,
		OnLoadRange:  onLoadRange,
		OnRefreshURL: onRefreshURL,
		OnUpdate:     onUpdate,
		OnCompleted:  onCompleted,
		OnFailed:     onFailed,
	}
	return client
}

func (worker *BigDownWorker) StopDownSync() {
	if worker.IsDowning {
		worker.IsDowning = false
	}
	worker.WaitDowning.Wait()
}

func (worker *BigDownWorker) StopDownAsync() {
	if worker.IsDowning {
		worker.IsDowning = false
	}
}

func (worker *BigDownWorker) StartDownAsync(AutoRange bool) {
	go worker.StartDownSync(AutoRange)
}

func (worker *BigDownWorker) StartDownSync(AutoRange bool) {
	worker.IsDowning = true
	issame, istdexist, err := worker.openSaveFile()
	if err != nil {
		worker.IsFailed = true
		worker.FailedMessage = err.Error()
		worker.IsCompleted = false
		worker.finishDown()
		return
	}

	if issame || worker.DownInfo.FileSize == 0 {
		worker.IsFailed = false
		worker.FailedMessage = ""
		worker.IsCompleted = true
		worker.finishDown()
		return
	}

	worker.DownInfo.BlockHash = worker.DownInfo.DownID + "|" + ToMd5(strconv.FormatInt(worker.DownInfo.BlockSize, 10)+"|"+strconv.FormatInt(worker.DownInfo.FileSize, 10)+"|"+worker.DownInfo.FileSave)
	if istdexist == false {
		data.DelRange(worker.DownInfo.DownID)
	}

	if AutoRange && istdexist && worker.OnLoadRange != nil {
		worker.OnLoadRange(worker)
	}
	listlen := len(worker.DownInfo.BlockList)
	worker.DownSize = 0
	for i := 0; i < listlen; i++ {
		block := worker.DownInfo.BlockList[i]

		if block.DownedSize < 0 {
			block.DownedSize = 0
		}
		blockLen := block.EndOffset - block.BeginOffset + 1
		if block.EndOffset == block.BeginOffset {
			blockLen = 0
		}
		if block.DownedSize > blockLen {
			block.DownedSize = 0
		}
		if block.DownedSize == blockLen {
			block.IsBlockCompleted = true
		}

		worker.DownSize += block.DownedSize
	}

	if worker.DownInfo.DownURL == "" {
		if worker.OnRefreshURL != nil {
			worker.OnRefreshURL(worker, 0)
			worker.RefreshTime = time.Now().Unix()
		}
	}
	if worker.IsFailed {
		worker.finishDown()
		return
	}
	if worker.DownInfo.DownURL == "" {
		worker.IsFailed = true
		worker.FailedMessage = "下载地址不能为空"
		worker.IsCompleted = false
		worker.finishDown()
		return
	}

	worker.IsUpdateing = 1
	go func() {
		rangeprocess := worker.DownProcess
		oldSize := worker.DownSize
		time.Sleep(time.Duration(1) * time.Second)
		for worker.IsUpdateing > 0 {
			worker.IsUpdateing++
			worker.DownSpeed = worker.DownSize - oldSize
			worker.DownSpeedStr = utils.FormateSizeString(worker.DownSpeed) + "/s"
			worker.DownProcess = oldSize * 100 / (worker.DownInfo.FileSize + 1)
			if worker.DownProcess > 99 {
				worker.DownProcess = 99
			}
			oldSize = worker.DownSize
			if AutoRange && (worker.DownProcess-rangeprocess) >= 2 {
				rangb, rangerr := json.Marshal(worker.DownInfo)
				if rangerr == nil {
					data.SetRange(worker.DownInfo.DownID, string(rangb))
				}
				rangeprocess = worker.DownProcess
			}

			if worker.OnUpdate != nil {
				worker.OnUpdate(worker)
			}

			time.Sleep(time.Duration(1) * time.Second)
		}
	}()

	threadMax := int(math.Min(float64(worker.DownInfo.ThreadMax), float64(len(worker.DownInfo.BlockList))))
	blockIndex := make(chan int)
	for i := 0; i < threadMax; i++ {
		go blockWorker(worker, blockIndex)
	}
	for i := 0; i < listlen; i++ {
		block := worker.DownInfo.BlockList[i]
		if worker.IsDowning == false || worker.IsFailed {
			break
		}

		if block.IsBlockCompleted == false {

			worker.WaitDowning.Add(1)
			blockIndex <- i
		}
	}

	worker.WaitDowning.Wait()
	close(blockIndex)
	worker.IsUpdateing = 0

	worker.finishDown()
}

func (worker *BigDownWorker) finishDown() {

	if worker.filePtr != nil {
		worker.filePtr.Close()
		worker.filePtr = nil
	}
	if worker.IsFailed == false && worker.IsCompleted == false && worker.chekcAllBlockCompleted() {
		worker.IsCompleted = true
	}

	if worker.IsCompleted {
		worker.DownSize = worker.DownInfo.FileSize
		worker.DownSizeStr = utils.FormateSizeString(worker.DownInfo.FileSize)
		data.DelRange(worker.DownInfo.BlockHash)
		fileSaveTD := worker.DownInfo.FileSave + ".td"
		fileSave := worker.DownInfo.FileSave
		if utils.PathExists(fileSave) == false {
			err := os.Rename(fileSaveTD, fileSave)
			if err != nil {
				worker.IsFailed = true
				worker.FailedMessage = err.Error()
				worker.IsCompleted = false
			}
		} else if utils.PathExists(fileSaveTD) {
			os.Remove(fileSaveTD)
		}

	}
	if worker.IsCompleted && worker.OnCompleted != nil {
		worker.OnCompleted(worker)
		return
	}
	if worker.IsFailed {
		worker.FailedMessage = utils.NetErrorMessage(worker.FailedMessage)
	}

	if worker.OnFailed != nil {
		worker.OnFailed(worker)
	}
	worker.IsDowning = false
}

func blockWorker(worker *BigDownWorker, blockIndex <-chan int) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("blockWorkerError ", " error=", err)
			worker.IsFailed = true
			worker.FailedMessage = utils.NetErrorMessage("异常崩溃")
			worker.IsCompleted = false
		}
	}()

	for i := range blockIndex {

		var err error = nil
		for t := 0; t < 5; t++ {
			err = blockWorkerDown(worker, i)

			if err == nil {
				break
			}
			time.Sleep(time.Duration(5) * time.Second)
		}
		if err != nil && worker.IsFailed == false {
			worker.IsFailed = true
			worker.FailedMessage = utils.NetErrorMessage(err.Error())
			worker.IsCompleted = false
		}
		worker.WaitDowning.Done()
	}
}

func blockWorkerDown(worker *BigDownWorker, blockIndex int) error {
	if worker.IsDowning == false {
		return nil
	}

	block := worker.DownInfo.BlockList[blockIndex]

	wpos := block.BeginOffset + block.DownedSize + 3
	if block.EndOffset > block.BeginOffset && wpos < (block.EndOffset-1) {
		werr0 := worker.writeToFile(wpos, []byte{0})
		if werr0 != nil {
			return werr0
		}
	}
	req, err := http.NewRequest("GET", worker.DownInfo.DownURL, nil)
	if err != nil {
		return err
	}

	if worker.DownInfo.Headers != nil {
		for k, v := range worker.DownInfo.Headers {
			req.Header[k] = []string{v}
		}
	}
	req.Header.Set("range", "bytes="+strconv.FormatInt(block.BeginOffset+block.DownedSize, 10)+"-"+strconv.FormatInt(block.EndOffset, 10))

	ctx, cancel := context.WithCancel(context.TODO())
	block.cancel = cancel
	defer func() {
		block.cancel = nil
		cancel()
	}()
	req = req.WithContext(ctx)
	resp, err := worker.client.Do(req)
	if resp != nil {
		defer resp.Body.Close()
	}

	if err != nil {
		fmt.Println("request", " error=", err)
		return err
	}

	if resp.StatusCode != 200 && resp.StatusCode != 206 {
		fmt.Println("StatusCode", resp.StatusCode)
		return errors.New("response status error:" + strconv.FormatInt(int64(resp.StatusCode), 10))
	}

	var BUFFSIZE = 1024*1024*4 + 1024*10

	var readbuff = make([]byte, 1024*10)
	var writebuff = make([]byte, BUFFSIZE)

	var writelen = 0
	block.cancellen = 0
	block.canceltime = worker.IsUpdateing
	for worker.IsDowning && worker.IsFailed == false {

		rlen, err := resp.Body.Read(readbuff)

		if rlen == 0 && err == nil {
			continue
		}

		if err != nil && err != io.EOF {
			fmt.Println("Body.Read", " error=", err)
			writebuff = nil
			return err
		}

		if rlen > 0 {
			block.cancellen += int64(rlen)
			if (rlen + writelen) >= BUFFSIZE {
				werr := worker.writeToFile(block.BeginOffset+block.DownedSize, writebuff[0:writelen])
				if werr != nil {
					writebuff = nil
					return werr
				}
				block.DownedSize += int64(writelen)
				writelen = 0
			}

			wlen := copy(writebuff[writelen:], readbuff[0:rlen])
			if wlen != rlen {
				writebuff = nil
				return errors.New("copy buffer error")
			}
			writelen += rlen
			worker.DownSize += int64(rlen)
		}
		if err == io.EOF {
			if writelen > 0 {
				werr := worker.writeToFile(block.BeginOffset+block.DownedSize, writebuff[0:writelen])
				if werr != nil {
					writebuff = nil
					return werr
				}
				block.DownedSize += int64(writelen)
				writelen = 0
			}
			writebuff = nil
			blockLen := block.EndOffset - block.BeginOffset + 1
			if block.EndOffset == block.BeginOffset {
				blockLen = 0
			}
			if block.DownedSize == blockLen {
				block.IsBlockCompleted = true
				return nil
			}
			return errors.New("DownedSize > BlockSize")

		}
	}

	return nil
}
