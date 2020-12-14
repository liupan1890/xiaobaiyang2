package localhost

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	"io"
	"strings"
)

func ToErrorJSON(err error) string {
	return ToErrorMessageJSON(err.Error())

}

func ToErrorMessageJSON(message string) string {
	if strings.Contains(message, "No connection could be made") {
		message = "联网失败,请重试"
	}
	mapInstance := make(map[string]interface{})
	mapInstance["message"] = message
	mapInstance["code"] = 503
	jsonStr, _ := json.Marshal(mapInstance)
	return string(jsonStr)
}

func ToSuccessJSON(key string, val interface{}) string {
	mapInstance := make(map[string]interface{})
	mapInstance["message"] = "success"
	mapInstance["code"] = 0
	if key != "" {
		mapInstance[key] = val
	}
	jsonStr, _ := json.Marshal(mapInstance)
	return string(jsonStr)
}

func ToSuccessJSON2(key string, val interface{}, key2 string, val2 interface{}) string {
	mapInstance := make(map[string]interface{})
	mapInstance["message"] = "success"
	mapInstance["code"] = 0
	if key != "" {
		mapInstance[key] = val
	}
	if key2 != "" {
		mapInstance[key2] = val2
	}
	jsonStr, _ := json.Marshal(mapInstance)
	return string(jsonStr)
}

func ToSuccessJSON3(key string, val interface{}, key2 string, val2 interface{}, key3 string, val3 interface{}) string {
	mapInstance := make(map[string]interface{})
	mapInstance["message"] = "success"
	mapInstance["code"] = 0
	if key != "" {
		mapInstance[key] = val
	}
	if key2 != "" {
		mapInstance[key2] = val2
	}
	if key3 != "" {
		mapInstance[key3] = val3
	}
	jsonStr, _ := json.Marshal(mapInstance)
	return string(jsonStr)
}

func ToSuccessJSON4(key string, val interface{}, key2 string, val2 interface{}, key3 string, val3 interface{}, key4 string, val4 interface{}) string {
	mapInstance := make(map[string]interface{})
	mapInstance["message"] = "success"
	mapInstance["code"] = 0
	if key != "" {
		mapInstance[key] = val
	}
	if key2 != "" {
		mapInstance[key2] = val2
	}
	if key3 != "" {
		mapInstance[key3] = val3
	}
	if key4 != "" {
		mapInstance[key4] = val4
	}
	jsonStr, _ := json.Marshal(mapInstance)
	return string(jsonStr)
}

func ToJSONString(str string) string {
	str = strings.Replace(str, `\`, `\\`, -1)
	str = strings.Replace(str, `"`, `\"`, -1)
	str = strings.Replace(str, `\r`, `\\r`, -1)
	str = strings.Replace(str, `\n`, `\\n`, -1)
	return str
}

func md5str(str string) string {
	w := md5.New()
	io.WriteString(w, str)
	md5str := fmt.Sprintf("%x", w.Sum(nil))
	return md5str
}
