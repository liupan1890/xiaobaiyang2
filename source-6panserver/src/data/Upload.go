package data

import (
	buntdb "github.com/tidwall/buntdb"
)

func _ValToStr7(val string) (bool, string) {
	if val == "" {
		return false, ""
	}
	v := []byte(val)
	l := len(v)
	for i := 0; i < l; i++ {
		v[i] ^= 7
	}
	return true, string(v)
}

func GetUploadAll() (bool, map[string]string) {

	isget := false
	list := make(map[string]string)
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("Upload", func(key, val string) bool {

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

func GetUploadingAll() (bool, map[string]string) {

	isget := false
	list := make(map[string]string)
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("Uploading", func(key, val string) bool {
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

func SetUpload(downid, jsonval string) {
	APPDB.Update(func(tx *buntdb.Tx) error {
		v := []byte(jsonval)
		l := len(v)
		for i := 0; i < l; i++ {
			v[i] ^= 7
		}

		tx.Set(downid, string(v), nil)
		return nil
	})
}
