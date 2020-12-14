package uploader

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"hash/crc32"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"../data"
	"../utils"
	"github.com/tidwall/gjson"
)

func ToMd5(str string) string {
	m := md5.New()
	m.Write([]byte(str))
	return hex.EncodeToString(m.Sum(nil))
}

type BigUploadWorker struct {
	UploadInfo       *BigUploadInfo
	client           *http.Client
	filePtr          *os.File
	fileLock         sync.Mutex
	UploadSpeed      int64
	UploadSpeedStr   string
	UploadSize       int64
	UploadSizeStr    string
	UploadProcess    int64
	UploadProcessStr string
	IsUpdateing      int64
	IsUploading      bool
	IsCompleted      bool
	IsMakeFile       bool
	IsFailed         bool
	FailedMessage    string
	WaitUploading    sync.WaitGroup
	OnLoadRange      func(worker *BigUploadWorker)
	OnRefreshURL     func(worker *BigUploadWorker, StatusCode int)
	OnUpdate         func(worker *BigUploadWorker)

	OnCompleted func(worker *BigUploadWorker)
	OnFailed    func(worker *BigUploadWorker)
}

func (worker *BigUploadWorker) chekcAllBlockCompleted() bool {
	for _, block := range worker.UploadInfo.BlockList {
		if block.IsBlockCompleted == false {
			return false
		}
	}
	return true
}

func (worker *BigUploadWorker) openUploadFile() error {
	if utils.IsDir(worker.UploadInfo.FileUpload) {
		return errors.New("UploadFile cannot be dir")
	}

	filePtr, erropen := os.OpenFile(worker.UploadInfo.FileUpload, os.O_RDONLY, 0666)
	if erropen != nil {
		return erropen
	}
	worker.filePtr = filePtr
	return nil
}

func NewBigUploadWorker(info *BigUploadInfo,
	onLoadRange func(worker *BigUploadWorker),
	onRefreshURL func(worker *BigUploadWorker, StatusCode int),
	onUpdate func(worker *BigUploadWorker),
	onCompleted func(worker *BigUploadWorker),
	onFailed func(worker *BigUploadWorker)) *BigUploadWorker {

	client := &BigUploadWorker{
		UploadInfo: info,
		client: &http.Client{
			Transport: &http.Transport{
				DisableKeepAlives:     true,
				ResponseHeaderTimeout: time.Second * 30,
			},
		},
		OnLoadRange:  onLoadRange,
		OnRefreshURL: onRefreshURL,
		OnUpdate:     onUpdate,
		OnCompleted:  onCompleted,
		OnFailed:     onFailed,
	}
	return client
}

func (worker *BigUploadWorker) StopUploadSync() {
	if worker.IsUploading {
		worker.IsUploading = false
	}
	worker.WaitUploading.Wait()
}

func (worker *BigUploadWorker) StopUploadAsync() {
	if worker.IsUploading {
		worker.IsUploading = false
	}
}

func (worker *BigUploadWorker) StartUploadAsync(AutoRange bool) {
	go worker.StartUploadSync(AutoRange)
}

func (worker *BigUploadWorker) StartUploadSync(AutoRange bool) {
	worker.IsUploading = true
	err := worker.openUploadFile()
	if err != nil {
		worker.IsFailed = true
		worker.FailedMessage = err.Error()
		worker.IsCompleted = false
		worker.finishUpload()
		return
	}
	worker.UploadInfo.BlockHash = worker.UploadInfo.DownID + "|" + ToMd5(strconv.FormatInt(worker.UploadInfo.BlockSize, 10)+"|"+strconv.FormatInt(worker.UploadInfo.FileSize, 10)+"|"+worker.UploadInfo.FileUpload)
	if AutoRange && worker.OnLoadRange != nil {
		worker.OnLoadRange(worker)
	}
	listlen := len(worker.UploadInfo.BlockList)
	worker.UploadSize = 0
	for i := 0; i < listlen; i++ {
		block := worker.UploadInfo.BlockList[i]
		blockLen := block.EndOffset - block.BeginOffset + 1
		if block.EndOffset == block.BeginOffset {
			blockLen = 0
		}
		if block.IsBlockCompleted == true {
			block.UploadSize = blockLen
		} else {
			block.UploadSize = 0
		}
		worker.UploadSize += block.UploadSize
	}
	if worker.UploadInfo.UploadURL == "" {
		if worker.OnRefreshURL != nil {
			worker.OnRefreshURL(worker, 0)
		}
	}
	if worker.IsFailed || worker.IsCompleted {
		worker.finishUpload()
		return
	}
	if worker.UploadInfo.UploadURL == "" {
		worker.IsFailed = true
		worker.FailedMessage = "上传地址不能为空"
		worker.IsCompleted = false
		worker.finishUpload()
		return
	}
	worker.IsUpdateing = 1
	go func() {
		rangeprocess := worker.UploadProcess
		oldSize := worker.UploadSize
		time.Sleep(time.Duration(1) * time.Second)
		for worker.IsUpdateing > 0 {
			worker.IsUpdateing++
			worker.UploadSpeed = (worker.UploadSize - oldSize + worker.UploadSpeed) / 2
			worker.UploadSpeedStr = utils.FormateSizeString(worker.UploadSpeed) + "/s"
			worker.UploadProcess = oldSize * 100 / (worker.UploadInfo.FileSize + 1)
			if worker.UploadProcess > 99 {
				worker.UploadProcess = 99
			}
			oldSize = worker.UploadSize
			if AutoRange && (worker.UploadProcess-rangeprocess) >= 2 {
				if b, err := json.Marshal(worker.UploadInfo.BlockList); err == nil {
					data.SetRange(worker.UploadInfo.BlockHash, string(b))
				}
				if b2, err2 := json.Marshal([]string{worker.UploadInfo.UploadToken, worker.UploadInfo.UploadURL}); err2 == nil {
					data.SetRange(worker.UploadInfo.BlockHash+"-token", string(b2))
				}
				rangeprocess = worker.UploadProcess
			}

			if worker.OnUpdate != nil {
				worker.OnUpdate(worker)
			}
			time.Sleep(time.Duration(1) * time.Second)
		}
	}()

	threadMax := int(math.Min(float64(worker.UploadInfo.ThreadMax), float64(len(worker.UploadInfo.BlockList))))
	blockIndex := make(chan int)
	for i := 0; i < threadMax; i++ {
		go blockWorker(worker, blockIndex)
	}
	for i := 0; i < listlen; i++ {
		block := worker.UploadInfo.BlockList[i]
		if worker.IsUploading == false || worker.IsFailed {
			break
		}

		if block.IsBlockCompleted == false {
			worker.WaitUploading.Add(1)
			blockIndex <- i
		}
	}

	worker.WaitUploading.Wait()
	close(blockIndex)
	worker.IsUpdateing = 0

	worker.finishUpload()
}

func (worker *BigUploadWorker) finishUpload() {

	if worker.filePtr != nil {
		worker.filePtr.Close()
		worker.filePtr = nil
	}

	if worker.IsFailed == false && worker.IsCompleted == false && worker.chekcAllBlockCompleted() {
		worker.IsCompleted = true
	}

	if worker.IsCompleted && worker.IsMakeFile == false {
		worker.FailedMessage = "正在合并文件"
		errmk := makeFile(worker)
		worker.FailedMessage = ""

		if errmk != nil {
			worker.IsFailed = true
			worker.FailedMessage = errmk.Error()
			worker.IsCompleted = false
		} else {
			worker.IsMakeFile = true
		}
		data.DelRange(worker.UploadInfo.BlockHash)
	}

	if worker.IsCompleted {

		worker.UploadSize = worker.UploadInfo.FileSize
		worker.UploadSizeStr = utils.FormateSizeString(worker.UploadInfo.FileSize)
	}
	if worker.IsCompleted && worker.IsMakeFile && worker.OnCompleted != nil {
		worker.OnCompleted(worker)
		return
	}
	if worker.IsFailed {
		worker.FailedMessage = utils.NetErrorMessage(worker.FailedMessage)
	}
	if worker.OnFailed != nil {
		worker.OnFailed(worker)
	}
	worker.IsUploading = false
}

func blockWorker(worker *BigUploadWorker, blockIndex <-chan int) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("UPblockWorkerError ", " error=", err)
			worker.IsFailed = true
			worker.FailedMessage = utils.NetErrorMessage("异常崩溃")
			worker.IsCompleted = false
		}
	}()

	for i := range blockIndex {

		var err error = nil
		for t := 0; t < 5; t++ {
			err = blockWorkerUpload(worker, i)
			if err == nil {
				break
			}
		}
		if err != nil && worker.IsFailed == false {
			worker.IsFailed = true
			worker.FailedMessage = utils.NetErrorMessage(err.Error())
			worker.IsCompleted = false
		}
		worker.WaitUploading.Done()
	}
}

func blockWorkerUpload(worker *BigUploadWorker, blockIndex int) error {
	if worker.IsUploading == false {
		return nil
	}

	block := worker.UploadInfo.BlockList[blockIndex]

	readed := false
	blockSize := block.EndOffset - block.BeginOffset + 1
	if block.EndOffset == block.BeginOffset {
		blockSize = 0
	}
	buff := make([]byte, blockSize)
	worker.fileLock.Lock()
	_, werr := worker.filePtr.Seek(block.BeginOffset, 0)
	if werr == nil {
		n, werr := worker.filePtr.Read(buff)
		if werr == nil && n == len(buff) {
			readed = true
		}
	}
	worker.fileLock.Unlock()
	if readed == false {
		return errors.New("Upload Read Buff From File Error")
	}
	mkbuff := buff[0:]
	if blockSize > 1024*1024 {
		mkbuff = buff[0 : 1024*1024]
	}
	ctx, offset, err := makeBlock(worker, blockSize, block.ID, mkbuff)
	if err != nil {
		return err
	}
	worker.UploadSize += int64(len(mkbuff))

	chunkstart := int64(1024 * 1024)
	for chunkstart < blockSize {

		if worker.IsUploading == false {
			block.IsBlockCompleted = false
			return nil
		}

		cklen := blockSize - chunkstart
		if cklen > 1024*1024 {
			cklen = 1024 * 1024
		}
		ckbuff := buff[chunkstart : chunkstart+cklen]
		ctx, offset, err = makeChunk(worker, ctx, offset, ckbuff)
		if err != nil {
			return err
		}
		worker.UploadSize += cklen
		chunkstart += cklen
	}

	block.Ctx = ctx
	block.IsBlockCompleted = true

	return nil
}

func makeBlock(worker *BigUploadWorker, blockSize int64, blockID int, buff []byte) (ctx string, offset int64, err error) {
	url := worker.UploadInfo.UploadURL + "/mkblk/" + strconv.FormatInt(blockSize, 10) + "/" + strconv.FormatInt(int64(blockID), 10)
	postdata := bytes.NewReader(buff)
	header := "Origin: " + worker.UploadInfo.UploadOrigin + "\nContent-Type: application/octet-stream\nAuthorization: " + worker.UploadInfo.UploadToken + "\nUploadBatch: " + worker.UploadInfo.UploadBatch
	code, _, body := utils.Raw("POST", url, header, postdata)
	if code != 200 {
		return ctx, offset, errors.New("Upload Network Error")
	}
	token := gjson.ParseBytes(*body)
	if token.Get("code").Exists() {
		return ctx, offset, errors.New("Upload Error" + token.Get("message").Str)
	}
	blockcrc32 := token.Get("crc32").Int()
	checkcrc32 := crc32.ChecksumIEEE(buff)
	if blockcrc32 != int64(checkcrc32) {
		return ctx, offset, errors.New("Upload blockCrc32 Error ")
	}
	ctx = token.Get("ctx").Str
	offset = token.Get("offset").Int()
	return ctx, offset, nil
}

func makeChunk(worker *BigUploadWorker, mkctx string, mkoffset int64, buff []byte) (ctx string, offset int64, err error) {
	url := worker.UploadInfo.UploadURL + "/bput/" + mkctx + "/" + strconv.FormatInt(mkoffset, 10)
	postdata := bytes.NewReader(buff)
	header := "Origin: " + worker.UploadInfo.UploadOrigin + "\nContent-Type: application/octet-stream\nAuthorization: " + worker.UploadInfo.UploadToken + "\nUploadBatch: " + worker.UploadInfo.UploadBatch
	code, _, body := utils.Raw("POST", url, header, postdata)
	if code != 200 {
		return ctx, offset, errors.New("Upload Network Error")
	}
	token := gjson.ParseBytes(*body)
	if token.Get("code").Exists() {
		return ctx, offset, errors.New("Upload Error" + token.Get("message").Str)
	}
	blockcrc32 := token.Get("crc32").Int()
	checkcrc32 := crc32.ChecksumIEEE(buff)
	if blockcrc32 != int64(checkcrc32) {
		return ctx, offset, errors.New("Upload blockCrc32 Error ")
	}
	ctx = token.Get("ctx").Str
	offset = token.Get("offset").Int()
	return ctx, offset, nil
}

func makeFile(worker *BigUploadWorker) error {
	worker.UploadSize = worker.UploadInfo.FileSize
	worker.UploadProcess = 99
	worker.UploadSpeed = 0
	worker.UploadSpeedStr = "0b"
	ctxs := ""
	for i := range worker.UploadInfo.BlockList {
		ctxs += "," + worker.UploadInfo.BlockList[i].Ctx
	}
	ctxs = ctxs[1:]
	bodystr := ""
	for t := 0; t < 2; t++ {
		url := worker.UploadInfo.UploadURL + "/mkfile/" + strconv.FormatInt(worker.UploadInfo.FileSize, 10)
		postdata := bytes.NewReader([]byte(ctxs))
		header := "Origin: " + worker.UploadInfo.UploadOrigin + "\nContent-Type: text/plain;charset=UTF-8\nAuthorization: " + worker.UploadInfo.UploadToken + "\nUploadBatch: " + worker.UploadInfo.UploadBatch
		code, _, body := utils.Raw("POST", url, header, postdata)
		if body != nil {
			if strings.Index(string(*body), "FILE_ALREADY_EXISTS") > 0 {
				return errors.New("MakeFile FILE_ALREADY_EXISTS Error")
			}
		}
		if code == 200 {
			bodystr = string(*body)
			break
		}
	}
	if bodystr == "" {
		return errors.New("MakeFile Network Error")
	}
	token := gjson.Parse(bodystr)
	respToken := gjson.Parse(token.Get("response").Str)
	hash := respToken.Get("hash").Str

	if hash != worker.UploadInfo.FileHash {
		return errors.New("MakeFile Hash Error")
	}
	return nil
}
