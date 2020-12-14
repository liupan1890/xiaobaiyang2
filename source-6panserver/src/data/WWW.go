package data

import (
	"encoding/base64"
	"strings"

	buntdb "github.com/tidwall/buntdb"
)

func GetWWW(key string) (bool, *[]byte) {

	isget := false
	data := []byte("")

	WWWDB.View(func(tx *buntdb.Tx) error {
		key = strings.ToLower(key)
		str, _ := tx.Get("WWW:" + key)

		if str != "" {
			isget = true
			v, err := base64.StdEncoding.DecodeString(str)
			if err == nil {
				data = v
			}
		}
		return nil
	})
	return isget, &data
}
