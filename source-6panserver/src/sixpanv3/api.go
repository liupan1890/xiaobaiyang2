package sixpanv3

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"strings"

	"../data"
)

func APIURL(path string) string {
	return data.Config.SixPanApiUrl + path
}

func AccountURL(path string) string {
	return data.Config.SixPanAccountUrl + path
}

func ToMd5(str string) string {
	m := md5.New()
	m.Write([]byte(str))
	return hex.EncodeToString(m.Sum(nil))
}

func PathToIdentity(path string) string {
	p := strings.TrimSpace(path)
	if strings.HasSuffix(p, "/") {
		p = p[:len(p)-1]
	}
	if !strings.HasPrefix(p, "/") {
		p = "/" + p
	}
	return ToMd5(p)
}

type Body map[string]interface{}

func BodyString(body Body) string {
	if body == nil {
		return ""
	}
	b, err := json.Marshal(body)
	if err != nil {
		return ""
	}
	return string(b)
}
