package utils

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

func PathExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil || os.IsExist(err)
}

func FileExists(path string) bool {
	info, err := os.Stat(path)

	if err != nil && os.IsExist(err) == false {
		return false
	}
	if info != nil {
		return info.IsDir() == false
	}
	return false
}

func IsDir(path string) bool {
	info, _ := os.Stat(path)
	if info != nil {
		return info.IsDir()
	}
	return false
}

func FileSize(path string) int64 {
	info, _ := os.Stat(path)

	if info != nil {
		return info.Size()
	}

	return -1
}

func CheckFileAndLen(filePath string, fileSize int64) (isexist bool, issame bool, err error) {
	info, err := os.Stat(filePath)

	if info != nil {
		isexist = true
		if info.Size() == fileSize {
			issame = true
		}
		err = nil
	}

	if err != nil && os.IsNotExist(err) {
		isexist = false
		issame = false
		err = nil
	}
	return isexist, issame, err
}

func FormateSizeString(size int64) string {
	s := int64(0)
	switch {
	case size <= 0:
		return "0B"
	case size <= 1024: // B
		return fmt.Sprintf("%dB", size)
	case size < 1024*1024: // KB
		s = size / 1024
		if s > 99 {
			return strconv.FormatInt(s, 10) + "kb"
		}
		return fmt.Sprintf("%.1fKB", float64(size)/float64(1024))
	case size < 1024*1024*1024: // MB
		s = size / 1024 / 1024
		if s > 99 {
			return strconv.FormatInt(s, 10) + "mb"
		}
		return fmt.Sprintf("%.1fMB", float64(size)/float64(1024*1024))
	case size < 1024*1024*1024*1024: //GB
		s = size / 1024 / 1024 / 1024
		if s > 99 {
			return strconv.FormatInt(s, 10) + "GB"
		}
		return fmt.Sprintf("%.1fGB", float64(size)/float64(1024*1024*1024))
	default:
		s = size / 1024 / 1024 / 1024 / 1024
		if s > 99 {
			return strconv.FormatInt(s, 10) + "TB"
		}
		return fmt.Sprintf("%.1fTB", float64(size)/float64(1024*1024*1024*1024))
	}
}

func ExePath() string {
	file, err := exec.LookPath(os.Args[0])
	if err == nil {
		file, _ = filepath.Split(file)
	} else {
		file, err = os.Getwd()
	}
	if err != nil {
		err = nil
		file = "./"
	}
	path, err := filepath.Abs(file)

	fi, err := os.Lstat(path)
	if err == nil {
		if fi.Mode()&os.ModeSymlink == os.ModeSymlink {
			path2, err := os.Readlink(path)
			if err == nil {
				path = path2
			}
		}
	}
	var pathchar = string(os.PathSeparator)

	if strings.HasSuffix(path, pathchar) == false {
		path = path + pathchar
	}

	return path
}
