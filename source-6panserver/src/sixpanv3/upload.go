package sixpanv3

import (
	"strings"

	"../data"
	"../utils"
	"github.com/tidwall/gjson"
)

type UploadToken struct {
	SixPanPath      string
	SixPanIdentity  string
	UploadToken     string
	PartUploadURL   string
	DirectUploadURL string
	Created         bool
}

func CreateUploadToken(LoginHead string, path, name, hash string) UploadToken {
	path = "/" + strings.Trim(path, "/")
	sixpanpath := path + "/" + name
	sixpanidentity := PathToIdentity(sixpanpath)
	fileinfo, err := FileInfo(LoginHead, sixpanidentity)

	if err == nil && fileinfo.ETag != "" && fileinfo.ETag == hash {
		return UploadToken{Created: true, SixPanPath: fileinfo.Path}
	}
	if err == nil && fileinfo != nil {
		TrashFile(LoginHead, []string{sixpanidentity})
	}
	url := APIURL("v3/file/uploadToken")
	postdata := BodyString(Body{"path": path, "name": name, "hash": hash, "op": 0})
	header := "Content-Type: application/json\nUser-Agent: " + data.Config.SixPanApiAgent + "\n" + LoginHead
	code, _, body := utils.PostHTTPString(url, header, postdata)

	if code == 200 {
		info := gjson.Parse(body)
		if info.Get("created").Bool() {
			return UploadToken{Created: true, SixPanPath: info.Get("path").Str, SixPanIdentity: PathToIdentity(info.Get("path").Str)}
		}
		return UploadToken{
			SixPanPath:      info.Get("filePath").Str,
			SixPanIdentity:  PathToIdentity(info.Get("filePath").Str),
			UploadToken:     info.Get("uploadToken").Str,
			PartUploadURL:   info.Get("partUploadUrl").Str,
			DirectUploadURL: info.Get("directUploadUrl").Str,
		}
	}
	return UploadToken{}
}
