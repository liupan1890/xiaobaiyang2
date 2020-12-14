package data

import (
	"log"
	"os"
	"path/filepath"

	"../utils"
	buntdb "github.com/tidwall/buntdb"
)

var WWWDB *buntdb.DB = nil

var APPDB *buntdb.DB = nil

func Open() bool {
	exepath := utils.ExePath()
	dbpath := filepath.Join(exepath, "AppData")
	log.Println("Start Path", dbpath)
	errmk := os.MkdirAll(dbpath, 0777)
	if errmk != nil {
		log.Println(errmk)
		return false
	}
	if WWWDB != nil {
		return true
	}
	var err error
	WWWDB, err = buntdb.Open(filepath.Join(dbpath, "www.db"))
	if WWWDB == nil || err != nil {
		return false
	}

	if APPDB != nil {
		return true
	}
	APPDB, err = buntdb.Open(filepath.Join(dbpath, "user.db"))
	if APPDB != nil && err == nil {
		initData()
	}
	return APPDB != nil && WWWDB != nil
}

func Close() {
	if APPDB != nil {
		APPDB.Close()
		APPDB = nil
	}
	if WWWDB != nil {
		WWWDB.Close()
		WWWDB = nil
	}
}

func initData() {

	var config buntdb.Config
	config.SyncPolicy = buntdb.Always
	APPDB.SetConfig(config)

	APPDB.Update(func(tx *buntdb.Tx) error {
		tx.CreateIndex("SixUser", "User:SixUser:*", buntdb.IndexString)
		tx.CreateIndex("Downing", "Down:Downing:*", buntdb.IndexJSON("DownTime"))
		tx.CreateIndex("Downed", "Down:Downed:*", buntdb.IndexJSON("DownTime"))
		tx.CreateIndex("Uploading", "Down:Uploading:*", buntdb.IndexJSON("DownTime"))
		tx.CreateIndex("Upload", "Down:Upload:*", buntdb.IndexJSON("DownTime"))
		return nil
	})

	LoadSetting()
}
