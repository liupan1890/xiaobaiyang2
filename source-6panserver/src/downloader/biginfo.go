package downloader

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"errors"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"unsafe"
)

func ToMd5(str string) string {
	m := md5.New()
	m.Write([]byte(str))
	return hex.EncodeToString(m.Sum(nil))
}

type BigDownInfo struct {
	DownID       string
	DownInfo     unsafe.Pointer    `json:"-"`
	DownURL      string            `json:"-"`
	DownTimeOut  int64             `json:"-"`
	Headers      map[string]string `json:"-"`
	FileSave     string
	FileSize     int64
	FileAutoName bool
	ThreadMax    int
	BlockSize    int64
	BlockHash    string
	BlockList    []*BigDownBlock
}

type BigDownBlock struct {
	BeginOffset      int64
	EndOffset        int64
	DownedSize       int64 `json:"downedsize"`
	IsBlockCompleted bool  `json:"isblockcompleted"`
	cancel           context.CancelFunc
	cancellen        int64
	canceltime       int64
}

func (info *BigDownInfo) GetFileSize() error {
	if info.DownURL == "" {
		return errors.New("DownURL cannot be nil")
	}

	req, err := http.NewRequest("HEAD", info.DownURL, nil)
	if err != nil {
		return err
	}
	if info.Headers != nil {
		for k, v := range info.Headers {
			req.Header[k] = []string{v}
		}
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	resp.Body.Close()
	if resp.StatusCode == 200 {
		info.FileSize = resp.ContentLength
		return nil
	}

	req, err = http.NewRequest("GET", info.DownURL, nil)
	if err != nil {
		return err
	}
	if info.Headers != nil {
		for k, v := range info.Headers {
			req.Header[k] = []string{v}
		}
	}
	req.Header.Add("Range", "bytes=0-0")
	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	resp.Body.Close()
	if resp.StatusCode == 206 {
		crange := resp.Header.Get("Content-Range")
		if strings.Index(crange, "/") > 0 {
			crange = crange[strings.Index(crange, "/")+1:]
			clen, _ := strconv.Atoi(crange)
			if clen > 0 {
				info.FileSize = int64(clen)
				return nil
			}
		}
		bsfilesize := resp.Header.Get("x-bs-file-size")
		if bsfilesize != "" {
			clen, _ := strconv.Atoi(bsfilesize)
			if clen > 0 {
				info.FileSize = int64(clen)
				return nil
			}
		}
	} else if resp.StatusCode == 200 {
		info.FileSize = resp.ContentLength
		return nil
	}

	return errors.New("getFileSize Error")
}

func (info *BigDownInfo) creatBlockList() error {
	if info.FileSize < 0 {
		return errors.New("fileSize cannot be -1")
	}
	info.BlockList = []*BigDownBlock{}
	var temp int64 = 0
	for (temp + info.BlockSize) < info.FileSize {
		info.BlockList = append(info.BlockList, &BigDownBlock{
			BeginOffset: temp,
			EndOffset:   temp + info.BlockSize - 1,
			DownedSize:  0,
		})
		temp += info.BlockSize
	}
	endOffset := int64(0)
	if info.FileSize > 0 {
		endOffset = info.FileSize - 1
	}
	info.BlockList = append(info.BlockList, &BigDownBlock{
		BeginOffset: temp,
		EndOffset:   endOffset,
		DownedSize:  0,
	})

	return nil
}

func NewBigDownInfoAutoBlock(downID string, downInfo unsafe.Pointer, URL string, URLTimeOut int64, fileSave string, fileSize int64, fileAutoName bool, blockMinSize int64, blockMaxSize int64, threadMax int, headers map[string]string) (info *BigDownInfo, err error) {
	if threadMax <= 0 {
		threadMax = 1
	}

	fileSave, _ = filepath.Abs(fileSave)
	info = &BigDownInfo{
		DownID:       downID,
		DownInfo:     downInfo,
		DownURL:      URL,
		DownTimeOut:  URLTimeOut,
		Headers:      headers,
		FileSave:     fileSave,
		FileSize:     fileSize,
		FileAutoName: fileAutoName,
		ThreadMax:    threadMax,
		BlockSize:    1024 * 1024 * 100,
	}
	if info.FileSize < 0 {
		info.GetFileSize()
	}
	if info.FileSize < 0 {
		return nil, errors.New("fileSize cannot be -1")
	}
	info.BlockSize = (info.FileSize/int64(threadMax) + 1)
	if info.BlockSize < blockMinSize {
		info.BlockSize = blockMinSize
	}
	if info.BlockSize > blockMaxSize {
		info.BlockSize = blockMaxSize
	}
	if info.BlockSize > info.FileSize {
		info.BlockSize = info.FileSize
	}

	if err == nil {
		err = info.creatBlockList()
	}
	return info, err

}

func NewBigDownInfo(downID string, downInfo unsafe.Pointer, URL string, URLTimeOut int64, fileSave string, fileSize int64, fileAutoName bool, blockSize int64, threadMax int, headers map[string]string) (info *BigDownInfo, err error) {
	if blockSize <= 0 {
		blockSize = 1024 * 1024 * 100
	}
	if threadMax <= 0 {
		threadMax = 1
	}

	fileSave, _ = filepath.Abs(fileSave)
	info = &BigDownInfo{
		DownID:       downID,
		DownInfo:     downInfo,
		DownURL:      URL,
		DownTimeOut:  URLTimeOut,
		Headers:      headers,
		FileSave:     fileSave,
		FileSize:     fileSize,
		FileAutoName: fileAutoName,
		ThreadMax:    threadMax,
		BlockSize:    blockSize,
	}
	if info.FileSize < 0 {
		info.GetFileSize()
	}
	if info.FileSize < 0 {
		return nil, errors.New("fileSize cannot be -1")
	}
	if err == nil {
		err = info.creatBlockList()
	}
	return info, err
}
