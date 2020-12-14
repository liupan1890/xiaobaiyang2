package data

import (
	"strings"

	buntdb "github.com/tidwall/buntdb"
)

func _ValToStr5(val string) (bool, string) {
	if val == "" {
		return false, ""
	}
	v := []byte(val)
	l := len(v)
	for i := 0; i < l; i++ {
		v[i] ^= 5
	}
	return true, string(v)
}

func GetUser(key string) (isget bool, jsonstr string) {
	if strings.HasPrefix(key, "User:") == false {
		key = "User:" + key
	}

	isget = false
	jsonstr = ""
	APPDB.View(func(tx *buntdb.Tx) error {
		val, _ := tx.Get(key)
		isget, jsonstr = _ValToStr5(val)
		return nil
	})
	return isget, jsonstr
}

func GetUserAll() (bool, map[string]string) {

	isget := false
	list := make(map[string]string)
	jsonstr := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("SixUser", func(key, val string) bool {
			isget, jsonstr = _ValToStr5(val)
			if isget {
				list[key] = jsonstr
			}
			return true
		})
		return nil
	})
	return isget, list
}

func SetUser(key string, jsonval string) {
	if strings.HasPrefix(key, "User:") == false {
		key = "User:" + key
	}
	APPDB.Update(func(tx *buntdb.Tx) error {
		v := []byte(jsonval)
		l := len(v)
		for i := 0; i < l; i++ {
			v[i] ^= 5
		}
		sval := string(v)
		val, _ := tx.Get(key)
		if val != sval {
			tx.Set(key, sval, nil)
		}
		return nil
	})
}

func DelUser(key string) {
	if strings.HasPrefix(key, "User:") == false {
		key = "User:" + key
	}
	APPDB.Update(func(tx *buntdb.Tx) error {
		tx.Delete(key)
		return nil
	})
}
