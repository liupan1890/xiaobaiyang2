package localhost

import (
	"archive/zip"
	"bytes"
	"io"
	"net/http"
	"strconv"
	"time"

	data "../data"
	utils "../utils"
)

func Get(url string, urldata string) string {
	if data.Config.ServerIP == "" {
		return ""
	}
	regkey := utils.B64encode(utils.ToMd5("s"+strconv.FormatInt(time.Now().UnixNano(), 10)) + "," + data.Setting.RegKey)
	code, _, body := utils.PostHTTPString(data.Config.ServerIP+url, "User-Agent: XiaoBaiYang\nContent-Type: application/x-www-form-urlencoded\n", "regkey="+regkey+urldata)
	if code == http.StatusOK {
		bodybs := []byte(body)
		for i := 0; i <= 200 && i < len(bodybs); i++ {
			bodybs[i] ^= (byte)(9 + i)
		}
		reader := bytes.NewReader(bodybs)
		r, err := zip.NewReader(reader, reader.Size())
		if err == nil {
			for _, f := range r.File {
				if f.Name == "json" {
					rc, err := f.Open()
					if err == nil {
						outbuff := bytes.NewBuffer([]byte{})
						_, err = io.CopyN(outbuff, rc, int64(f.UncompressedSize64))
						if err == nil {
							body = string(outbuff.Bytes())
						}
						rc.Close()
					}
				}
			}
		}
		return body
	}
	return ""
}

func LoadRssList() string {
	body := Get("pdgo/rsslist", "")
	if body != "" {
		return body
	}
	return ToErrorMessageJSON("加载失败网络错误")
}

func LoadRssItemList(rssid string) string {
	rssid = utils.B64encode(utils.ToMd5(strconv.FormatInt(time.Now().UnixNano(), 10)) + "," + rssid)
	body := Get("pdgo/rssitemlist", "&rssid="+rssid)
	if body != "" {
		return body
	}
	return ToErrorMessageJSON("加载失败网络错误")
}

func LoadRssItemListSearch(searchkey string) string {
	searchkey = utils.B64encode(utils.ToMd5(strconv.FormatInt(time.Now().UnixNano(), 10)) + "," + searchkey)
	body := Get("pdgo/rssitemlistsearch", "&searchkey="+searchkey)
	if body != "" {
		return body
	}
	return ToErrorMessageJSON("加载失败网络错误")
}

func LoadRssItemContent(rssitemid string) string {
	rssitemid = utils.B64encode(utils.ToMd5(strconv.FormatInt(time.Now().UnixNano(), 10)) + "," + rssitemid)
	body := Get("pdgo/rssitemcontent", "&rssitemid="+rssitemid)
	if body != "" {
		return body
	}
	return ToErrorMessageJSON("加载失败网络错误")
}
