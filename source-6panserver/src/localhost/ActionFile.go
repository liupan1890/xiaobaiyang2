package localhost

import (
	"encoding/base64"
	"log"
	"path/filepath"
	"strings"

	"../data"
	"../utils"
	"github.com/chennqqi/chardet"
)

func OfflineAddBT(dataurl string) string {

	slen := strings.Index(dataurl, "base64,")
	if slen == -1 {
		log.Println("读取BT种子文件出错", dataurl)
		return ToErrorMessageJSON("读取BT种子文件出错")
	}
	slen = slen + 7
	btdata := dataurl[slen:]
	if strings.HasSuffix(btdata, "\"") {
		btdata = btdata[0 : len(btdata)-1]
	}
	decodeBytes, err := base64.StdEncoding.DecodeString(btdata)
	if err == nil {
		textlink, err := utils.TorrentToMagnet(decodeBytes)
		if textlink == "" {
			log.Println("格式化BT种子文件出错", err)
			return ToErrorMessageJSON("格式化BT种子文件出错")
		}
		return ToSuccessJSON("textlink", textlink)
	}
	return ToErrorJSON(err)
}

func PlayFile(islocal bool, url string) string {
	if islocal == false {
		return ToErrorMessageJSON("远程管理时不支持此操作")
	}

	playerpath := data.Setting.PlayerPath
	if playerpath != "" {
		if strings.HasPrefix(playerpath, "./") {
			exepath := utils.ExePath()
			playerpath = filepath.Join(exepath, playerpath[2:])
		}
		var err = utils.RunPlayer(playerpath, url, data.Config.SixPanDownAgent)
		if err == nil {
			return ToSuccessJSON("playerpath", playerpath)
		}
		log.Println("player", err)
		return ToErrorJSON(err)
	}
	return ToErrorMessageJSON("未设置播放器路径")
}

func DownloadTxt(downloadAddress string, size int64) string {
	header := "User-Agent: " + data.Config.SixPanDownAgent + "\n"
	if size > 20480 { //20kb
		header = "User-Agent: " + data.Config.SixPanDownAgent + "\nRange: bytes=0-20480\n"
	}
	code, _, body := utils.GetHTTPString(downloadAddress, header)
	if code != 200 && code != 206 {
		return body
	}

	bodybs := []byte(body)
	if bodybs[0] == 0xFF && bodybs[1] == 0xFE {
		conbs, err := utils.UTF16LEToUtf8(bodybs)
		if err == nil {
			bodybs = conbs
		}
	} else if bodybs[0] == 0xFE && bodybs[1] == 0xFF {
		conbs, err := utils.UTF16BEToUtf8(bodybs)
		if err == nil {
			bodybs = conbs
		}
	} else if bodybs[0] == 0xEF && bodybs[1] == 0xBB && bodybs[2] == 0xBF {
		//utf8
	} else {
		plist := chardet.Possible(bodybs)
		if utils.IsContain(plist, "gb18030") {
			conbs, err := utils.GB18030ToUtf8(bodybs)
			if err == nil {
				bodybs = conbs
			}
		} else if utils.IsContain(plist, "gbk") {
			conbs, err := utils.GbkToUtf8(bodybs)
			if err == nil {
				bodybs = conbs
			}
		} else if utils.IsContain(plist, "big5") {
			conbs, err := utils.Big5ToUtf8(bodybs)
			if err == nil {
				bodybs = conbs
			}
		}
	}
	return string(bodybs)
}
