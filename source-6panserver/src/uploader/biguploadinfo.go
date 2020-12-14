package uploader

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"unsafe"

	tsgutils "github.com/typa01/go-utils"
)

type BigUploadInfo struct {
	DownID   string
	DownInfo unsafe.Pointer

	UploadToken  string
	UploadURL    string
	UploadBatch  string
	UploadOrigin string
	FileUpload   string
	FileSize     int64
	FileHash     string
	ThreadMax    int
	BlockSize    int64
	BlockHash    string
	BlockList    []*BigUploadBlock
}

type BigUploadBlock struct {
	ID               int
	BeginOffset      int64
	EndOffset        int64
	UploadSize       int64
	Ctx              string `json:"ctx"`
	IsBlockCompleted bool   `json:"isblockcompleted"`
	cancel           context.CancelFunc
	cancellen        int64
	canceltime       int64
}

func (info *BigUploadInfo) getFileSize() error {
	if info.FileUpload == "" {
		return errors.New("UploadFile cannot be nil")
	}
	file, err := os.Stat(info.FileUpload)
	if err != nil {
		return err
	}
	info.FileSize = file.Size()
	return nil
}

func (info *BigUploadInfo) creatBlockList() error {
	if info.FileSize < 0 {
		return errors.New("fileSize cannot be -1")
	}
	info.BlockList = []*BigUploadBlock{}
	var temp int64 = 0
	for (temp + info.BlockSize) < info.FileSize {
		info.BlockList = append(info.BlockList, &BigUploadBlock{
			ID:          len(info.BlockList),
			BeginOffset: temp,
			EndOffset:   temp + info.BlockSize - 1,
			UploadSize:  0,
		})
		temp += info.BlockSize
	}
	endOffset := int64(0)
	if info.FileSize > 0 {
		endOffset = info.FileSize - 1
	}
	info.BlockList = append(info.BlockList, &BigUploadBlock{
		ID:          len(info.BlockList),
		BeginOffset: temp,
		EndOffset:   endOffset,
		UploadSize:  0,
	})
	return nil
}

func NewBigUploadInfoAutoBlock(downID string, downInfo unsafe.Pointer, fileUpload string, fileSize int64, fileHash string, blockSize int64, threadMax int) (info *BigUploadInfo, err error) {
	if blockSize <= 0 {
		blockSize = 1024 * 1024 * 4
	}
	if threadMax <= 0 {
		threadMax = 1
	}

	fileUpload, _ = filepath.Abs(fileUpload)
	info = &BigUploadInfo{
		DownID:      downID,
		DownInfo:    downInfo,
		UploadBatch: tsgutils.UUID(),
		FileUpload:  fileUpload,
		FileSize:    fileSize,
		FileHash:    fileHash,
		ThreadMax:   threadMax,
		BlockSize:   blockSize,
	}
	if info.FileSize <= 0 {
		info.getFileSize()
	}

	if err == nil {
		err = info.creatBlockList()
	}
	return info, err
}
