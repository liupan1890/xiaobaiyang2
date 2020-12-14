package localhost

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"../data"
	utils "../utils"
)

func LoadSetting() string {
	data.LoadSetting()
	config := data.LoadConfig()
	config.ServerIP = ""
	return ToSuccessJSON2("setting", data.Setting, "config", config)
}

func UpdateSetting(key string, value string) string {

	switch key {
	case "RegKey":
		return SettingRegKey(value)
	case "SavePath":
		return SettingSavePath(value)
	case "PlayerPath":
		return SettingPlayerPath(value)
	case "SavePathEveryTime":
		isval, _ := strconv.ParseBool(value)
		return SettingSavePathEveryTime(isval)
	case "TaskCountMax":
		intval, _ := strconv.ParseInt(value, 10, 32)
		return SettingTaskCountMax(int(intval))
	case "ThreadCountMax":
		intval, _ := strconv.ParseInt(value, 10, 32)
		return SettingThreadCountMax(int(intval))
	case "RunDownFinish":
		isval, _ := strconv.ParseBool(value)
		return SettingRunDownFinish(isval)
	case "UseVipVideoUrl":
		isval, _ := strconv.ParseBool(value)
		return SettingUseVipVideoUrl(isval)
	default:
		return ToErrorMessageJSON("不支持的操作")
	}

}

func SettingRegKey(value string) string {
	if value == "" {
		return ToErrorMessageJSON("注册码不能为空")
	}

	if value == data.Setting.RegKey {
		return ToSuccessJSON("", nil)
	}
	data.SetSetting("ConfigRegKey", value)
	data.Setting.RegKey = value
	return ToSuccessJSON("", nil)
}

func SettingSavePath(value string) string {
	if value == "" {
		return ToErrorMessageJSON("下载保存位置不能为空")
	}

	savepath := filepath.Clean(value)
	if len(savepath) < 3 || len(savepath) > 50 {
		return ToErrorMessageJSON("下载保存位置长度必须3--50位")
	}

	if savepath == data.Setting.SavePath {
		return ToSuccessJSON("", nil)
	}
	d := string(os.PathSeparator)
	if strings.HasSuffix(savepath, d) == false {
		savepath = savepath + d
	}

	if utils.IsDir(savepath) == false {
		return ToErrorMessageJSON("下载保存必须是文件夹且必须存在")
	}

	data.SetSetting("ConfigSavePath", savepath)
	data.Setting.SavePath = savepath
	return ToSuccessJSON("", nil)
}

func SettingPlayerPath(value string) string {
	if value == "" {
		return ToErrorMessageJSON("播放器位置不能为空")
	}
	playerpath := filepath.Clean(value)
	if playerpath == data.Setting.PlayerPath {
		return ToSuccessJSON("", nil)
	}

	player := strings.ToLower(playerpath)
	if utils.IsWindows() {
		if player == "mpv" {
			if utils.FileExists(filepath.Join(utils.ExePath(), "MPV", "mpv.exe")) == false {
				return ToErrorMessageJSON("在程序目录下找不到MPV播放器，请重新下载安装包")
			}
		} else if utils.FileExists(playerpath) == false {
			return ToErrorMessageJSON("找不到播放器，必须选择一个播放器.exe文件的完整路径")
		}
	} else if utils.IsDarwin() {
		if player == "mpv" {
			mpvpath := filepath.Join(utils.ExePath(), "mpv")
			if utils.FileExists(mpvpath) == false {
				return ToErrorMessageJSON("在程序目录下找不到MPV播放器，请重新下载安装包")
			}
		} else if player == "vlc" {
			playerpath = "/Applications/VLC.app"
		} else if player == "iina" {
			playerpath = "/Applications/IINA.app"
		}
	}

	data.SetSetting("ConfigPlayerPath", playerpath)
	data.Setting.PlayerPath = playerpath
	return ToSuccessJSON("", nil)
}

func SettingSavePathEveryTime(value bool) string {
	if value != data.Setting.SavePathEveryTime {
		data.SetSetting("ConfigSavePathEveryTime", strconv.FormatBool(value))
		data.Setting.SavePathEveryTime = value
	}
	return ToSuccessJSON("", nil)
}

func SettingTaskCountMax(value int) string {
	if value < 1 {
		value = 1
	}
	if value > 10 {
		value = 10
	}

	valuestr := strconv.FormatInt(int64(value), 10)
	if valuestr != data.Setting.TaskCountMax {
		data.SetSetting("ConfigTaskCountMax", valuestr)
		data.Setting.TaskCountMax = valuestr
	}
	return ToSuccessJSON("", nil)
}

func SettingThreadCountMax(value int) string {
	if value < 1 {
		value = 1
	}
	if value > 4 {
		value = 4
	}
	valuestr := strconv.FormatInt(int64(value), 10)
	if valuestr != data.Setting.ThreadCountMax {
		data.SetSetting("ConfigThreadCountMax", valuestr)
		data.Setting.ThreadCountMax = valuestr
	}
	return ToSuccessJSON("", nil)
}

func SettingRunDownFinish(value bool) string {
	if value != data.Setting.RunDownFinish {
		data.SetSetting("ConfigRunFinish", strconv.FormatBool(value))
		data.Setting.RunDownFinish = value
	}
	return ToSuccessJSON("", nil)
}

func SettingUseVipVideoUrl(value bool) string {
	if value != data.Setting.UseVipVideoUrl {
		data.SetSetting("ConfigUseVipVideoUrl", strconv.FormatBool(value))
		data.Setting.UseVipVideoUrl = value
	}
	return ToSuccessJSON("", nil)
}
