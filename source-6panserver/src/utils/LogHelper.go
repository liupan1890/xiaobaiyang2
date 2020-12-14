package utils

import (
	"log"
	"os"
	"path/filepath"
)

var logFile *os.File = nil

func OpenLog() {
	if logFile != nil {
		return
	}

	exepath := ExePath()
	dbpath := filepath.Join(exepath, "AppData")
	errmk := os.MkdirAll(dbpath, 0777)
	if errmk != nil {
		return
	}
	debuglog := filepath.Join(dbpath, "debug.log")
	fi, err := os.Stat(debuglog)
	if err == nil && fi != nil {
		if fi.Size() > int64(3*1024*1024) {
			os.Remove(debuglog)
		}
	}
	logFile, _ = os.OpenFile(debuglog, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0766)
	log.SetOutput(logFile)
	log.SetPrefix("\r\n")
	log.SetFlags(log.LstdFlags | log.Lshortfile | log.Ldate)
}

func CloseLog() {
	if logFile != nil {
		logFile.Sync()
		logFile.Close()
		logFile = nil
	}
}
