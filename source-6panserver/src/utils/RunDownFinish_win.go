// +build windows

package utils

import (
	"log"
	"os/exec"
	"path/filepath"
	"syscall"
)

func RunDownFinish(GID, FileNum, FilePath string) {
	shfilepath := filepath.Join(ExePath(), "downfinish.cmd")
	if FileExists(shfilepath) {
		cmd := exec.Command("cmd.exe")
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: false, CmdLine: "/c \"\"" + shfilepath + "\" " + GID + " " + FileNum + " \"" + FilePath + "\"\""}
		err := cmd.Start()
		if err != nil {
			log.Println("RunDownFinish", err)
		}
	}
}

func RunPlayer(playerpath string, url string, useragent string) error {
	if playerpath == "mpv" {
		playerpath = filepath.Join(ExePath(), "MPV", "mpv.exe")
		cmd := exec.Command("cmd.exe")
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: false, CmdLine: "/c \"\"" + playerpath + "\" --user-agent=\"" + useragent + "\" --force-window=yes --profile=low-latency " + " \"" + url + "\"\""}
		return cmd.Start()
	} else {
		cmd := exec.Command(playerpath, url)
		return cmd.Start()
	}
}
