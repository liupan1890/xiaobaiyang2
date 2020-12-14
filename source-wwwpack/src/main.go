package main

import (
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/tidwall/buntdb"
)

func main() {
	PackWWW()
}

//IsDir 检测路径是否是文件夹
func IsDir(path string) bool {
	info, _ := os.Stat(path)
	if info != nil {
		return info.IsDir()
	}
	return false
}

//PackWWW 打包www.db
func PackWWW() {

	wwwpath := "D:\\DGO\\antdv\\dist\\" //这里应该修改为正确的路径

	if IsDir(wwwpath) == false {
		return
	}
	Open()

	LEN := len(wwwpath)
	var files []string
	filepath.Walk(wwwpath, func(path string, info os.FileInfo, err error) error {
		if info.IsDir() {
			//文件夹跳过
		} else if filepath.Ext(path) == ".map" {
			//map文件跳过
		} else {
			key := path[LEN:]
			key = strings.ReplaceAll(key, "\\", "/")
			key = strings.ToLower(key)

			files = append(files, key)
			f, _ := ioutil.ReadFile(path)
			SetWWW(key, f)
		}
		return nil
	})
	for _, file := range files {
		fmt.Println(file)
	}
}

var WWWDB *buntdb.DB = nil

func Open() {
	exepath := ExePath()
	dbpath := filepath.Join(exepath, "www.db")
	os.Remove(dbpath)
	WWWDB, _ = buntdb.Open(dbpath)
}

func SetWWW(key string, val []byte) {
	WWWDB.Update(func(tx *buntdb.Tx) error {
		b64str := base64.StdEncoding.EncodeToString(val)
		tx.Set("WWW:"+key, b64str, nil)
		return nil
	})
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
