package data

import (
	"path/filepath"
	"strconv"
	"strings"

	utils "../utils"
	buntdb "github.com/tidwall/buntdb"
)

func GetSetting(key string) (bool, string) {

	isget := false
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		val, _ := tx.Get("Config:" + key)

		if val != "" {
			v := []byte(val)
			l := len(v)
			for i := 0; i < l; i++ {
				v[i] ^= 2
			}
			str = string(v)
			isget = true
		}
		return nil
	})
	return isget, str
}

func SetSetting(key string, val string) {
	APPDB.Update(func(tx *buntdb.Tx) error {

		v := []byte(val)
		l := len(v)
		for i := 0; i < l; i++ {
			v[i] ^= 2
		}

		tx.Set("Config:"+key, string(v), nil)
		return nil
	})
}

type ISettingModel struct {
	PlayerPath        string
	SavePath          string
	SavePathEveryTime bool
	TaskCountMax      string
	ThreadCountMax    string
	RunDownFinish     bool
	UseVipVideoUrl    bool
	RegKey            string
}

var Setting = ISettingModel{
	PlayerPath:        "",
	SavePath:          "",
	SavePathEveryTime: false,
	TaskCountMax:      "3",
	ThreadCountMax:    "5",
	RunDownFinish:     false,
	UseVipVideoUrl:    false,
	RegKey:            "",
}

type IConfigModel struct {
	ServerIP         string
	LocalExeVer      string
	ServerExeVer     string
	ServerExeVerUrl  string
	LocalUIVer       string
	ServerUIVer      string
	ServerUIVerUrl   string
	ServerWebDav     string
	SixPanDownAgent  string
	SixPanApiAgent   string
	SixPanApiUrl     string
	SixPanAccountUrl string
	SixPanUploadUrl  string
}

type IRemote struct {
	IsRemote       bool
	RemotePassword string
}

var Remote = IRemote{
	IsRemote:       false,
	RemotePassword: "",
}

const LocalExeVer = "2.2.0.0"

var Config = IConfigModel{
	ServerIP:         "",
	LocalExeVer:      LocalExeVer,
	ServerExeVer:     LocalExeVer,
	ServerExeVerUrl:  "",
	LocalUIVer:       LocalExeVer,
	ServerUIVer:      LocalExeVer,
	ServerUIVerUrl:   "",
	ServerWebDav:     "https://webdav.2dland.cn",
	SixPanDownAgent:  "Accelerider-Lite download engine",
	SixPanApiAgent:   "Accelerider-Lite",
	SixPanApiUrl:     "https://api.2dland.cn/",
	SixPanAccountUrl: "https://account.2dland.cn/",
	SixPanUploadUrl:  "https://2dland.cn",
}

func LoadSetting() {
	isval := false

	_, RegKey := GetSetting("ConfigRegKey")
	if RegKey != "" {
		Setting.RegKey = RegKey
	} else {
		Setting.RegKey = ""
	}

	_, SavePath := GetSetting("ConfigSavePath")
	if utils.IsDir(SavePath) {
		Setting.SavePath = SavePath
	} else {
		Setting.SavePath = ""
	}

	_, Player := GetSetting("ConfigPlayerPath")
	player := strings.ToLower(Player)
	if utils.IsWindows() {
		if player == "" || player == "mpv" {
			mpvpath := filepath.Join(utils.ExePath(), "MPV", "mpv.exe")
			if utils.FileExists(mpvpath) {
				Player = "mpv"
			} else {
				Player = ""
			}
		}
	} else if utils.IsDarwin() {
		if player == "" || player == "mpv" {
			mpvpath := filepath.Join(utils.ExePath(), "mpv")
			if utils.FileExists(mpvpath) {
				Player = "mpv"
			} else {
				Player = ""
			}
		}
	} else if utils.IsLinux() {
		if player == "" {
			Player = "mpv"
		}
	}
	Setting.PlayerPath = Player

	_, SavePathEveryTime := GetSetting("ConfigSavePathEveryTime")
	isval, _ = strconv.ParseBool(SavePathEveryTime)
	Setting.SavePathEveryTime = isval

	_, TaskCountMax := GetSetting("ConfigTaskCountMax")
	if TaskCountMax == "" {
		TaskCountMax = "5"
	}
	Setting.TaskCountMax = TaskCountMax

	_, ThreadCountMax := GetSetting("ConfigThreadCountMax")
	if ThreadCountMax == "" {
		ThreadCountMax = "2"
	}
	if ThreadCountMax != "1" && ThreadCountMax != "2" && ThreadCountMax != "3" && ThreadCountMax != "4" {
		ThreadCountMax = "2"
	}
	Setting.ThreadCountMax = ThreadCountMax

	_, RunFinish := GetSetting("ConfigRunFinish")
	isval, _ = strconv.ParseBool(RunFinish)
	Setting.RunDownFinish = isval

	_, UseVipVideoURL := GetSetting("ConfigUseVipVideoUrl")
	isval, _ = strconv.ParseBool(UseVipVideoURL)
	Setting.UseVipVideoUrl = isval

	Config = LoadConfig()
}

func LoadConfig() IConfigModel {

	config := IConfigModel{}
	config.ServerIP = "http://45.117.103.60:443/"
	config.LocalExeVer = LocalExeVer
	config.ServerExeVer = LocalExeVer
	config.ServerExeVerUrl = ""
	config.LocalUIVer = LocalExeVer
	config.ServerUIVer = LocalExeVer
	config.ServerUIVerUrl = ""
	config.ServerWebDav = "https://webdav.2dland.cn"
	config.SixPanDownAgent = "Accelerider-Lite download engine"
	config.SixPanApiAgent = "Accelerider-Lite"
	config.SixPanApiUrl = "https://api.2dland.cn/"
	config.SixPanAccountUrl = "https://account.2dland.cn/"
	config.SixPanUploadUrl = "https://2dland.cn"
	return config
}

func GetLocalUIVer() string {
	_, ServerConfigLocalUIVer := GetSetting("ServerConfigLocalUIVer")
	if ServerConfigLocalUIVer != "" {
		return ServerConfigLocalUIVer
	}
	return LocalExeVer
}
