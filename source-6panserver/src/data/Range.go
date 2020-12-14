package data

import (
	"strings"

	buntdb "github.com/tidwall/buntdb"
)

func GetRange(key string) (isget bool, jsonstr string) {
	key = strings.Replace(key, "Down:", "", -1)
	key = strings.Replace(key, "Downing:", "", -1)
	isget = false
	jsonstr = ""

	APPDB.View(func(tx *buntdb.Tx) error {
		jsonstr, _ = tx.Get("Range:" + key)
		if jsonstr != "" {
			isget = true
		}
		return nil
	})
	return isget, jsonstr
}

func SetRange(key string, jsonval string) {
	key = strings.Replace(key, "Down:", "", -1)
	key = strings.Replace(key, "Downing:", "", -1)

	APPDB.Update(func(tx *buntdb.Tx) error {
		tx.Set("Range:"+key, jsonval, nil)
		return nil
	})
}

func DelRange(key string) {
	key = strings.Replace(key, "Down:", "", -1)
	key = strings.Replace(key, "Downing:", "", -1)
	APPDB.Update(func(tx *buntdb.Tx) error {
		tx.Delete("Range:" + key)
		return nil
	})
}
