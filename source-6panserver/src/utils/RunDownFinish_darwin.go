// +build darwin

package utils

import (
	"errors"
	"log"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/skratchdot/open-golang/open"
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
	if strings.HasPrefix(strings.ToLower(playerpath), "/applications/") == false {
		return errors.New("mac player 必须类似/Applications/xxx.app")
	}
	err := open.StartWith(url, playerpath)
	return err
}
