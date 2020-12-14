// +build linux

package utils

import (
	"log"
	"os/exec"
	"path/filepath"
	"strings"
)

func RunDownFinish(GID, FileNum, FilePath string) {
	shfilepath := filepath.Join(ExePath(), "downfinish.sh")
	if FileExists(shfilepath) {
		cmd := exec.Command("sh", shfilepath, GID, FileNum, FilePath)
		err := cmd.Start()
		if err != nil {
			log.Println("RunDownFinish", err)
		}
	}
}

func RunPlayer(playerpath string, url string, useragent string) error {
	if strings.ToLower(playerpath) == "mpv" {
		useragent = strings.ReplaceAll(useragent, " ", "")
		cmd := exec.Command("sh", "-c", "mpv --force-window=yes --profile=low-latency --user-agent="+useragent+" \""+url+"\"")
		return cmd.Start()
	} else {
		cmd := exec.Command(playerpath, url)
		return cmd.Start()
	}
}
