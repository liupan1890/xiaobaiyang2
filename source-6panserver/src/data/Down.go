package data

import (
	buntdb "github.com/tidwall/buntdb"
)

func _ValToStr6(val string) (bool, string) {
	if val == "" {
		return false, ""
	}
	v := []byte(val)
	l := len(v)
	for i := 0; i < l; i++ {
		v[i] ^= 6
	}
	return true, string(v)
}

func GetDownedAll() (bool, map[string]string) {

	isget := false
	list := make(map[string]string)
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("Downed", func(key, val string) bool {

			isget, str = _ValToStr6(val)
			if isget {
				list[key] = str
			}
			return true
		})
		return nil
	})
	return isget, list
}

func GetDowningAll() (bool, map[string]string) {

	isget := false
	list := make(map[string]string)
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("Downing", func(key, val string) bool {
			isget, str = _ValToStr6(val)
			if isget {
				list[key] = str
			}
			return true
		})
		return nil
	})
	return isget, list
}

func SetDown(downid, jsonval string) {
	APPDB.Update(func(tx *buntdb.Tx) error {
		v := []byte(jsonval)
		l := len(v)
		for i := 0; i < l; i++ {
			v[i] ^= 6
		}

		tx.Set(downid, string(v), nil)
		return nil
	})
}

func DeleteDown(downid string) {
	APPDB.Update(func(tx *buntdb.Tx) error {
		tx.Delete(downid)
		return nil
	})
}
