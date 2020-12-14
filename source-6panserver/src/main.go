package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"flag"

	"./data"
	"./localhost"
	"./utils"
)

var isremote bool
var password string
var lancher string

func init() {
	flag.BoolVar(&isremote, "isremote", false, "like true/false ,Must be a bool value")
	flag.StringVar(&password, "password", "", "like abcdefghij123456 ,Must be a 16 digit alphanumeric combination")
	flag.StringVar(&lancher, "lancher", "", "Must be electron or enmpty")
}

func UpdateTimeAsync() {
	var UserTime = 0
	for {
		time.Sleep(time.Duration(30) * time.Second)
		UserTime += 30
		if UserTime > 10*60 {
			localhost.AutoRefreshUserInfo()
			UserTime = 0
		}
	}
}

func main() {
	flag.Parse()
	fmt.Println("\n6panserver start ", " lancher=", lancher, " isremote=", isremote, " password=", password)
	fmt.Println(utils.ExePath())
	if isremote {
		password = strings.Trim(password, " ")
		if len(password) < 16 {
			fmt.Println("Start Break RemotePassword too short ", password)
			log.Println("Start Break RemotePassword too short ", password)
			return
		} else {
			data.Remote.IsRemote = isremote
			data.Remote.RemotePassword = password
		}
	}
	utils.OpenLog()
	log.Println("\n6panserver start ", " lancher=", lancher, " isremote=", isremote, " password=", password)

	if localhost.GetPing() {
		fmt.Println("Start Break An instance is already running")
		log.Println("Start Break An instance is already running")
		return
	}
	if data.Open() == false {
		fmt.Println("Start Database Error")
		log.Println("Start Database Error")
		return
	}

	defer func() {
		if err := recover(); err != nil {
			fmt.Println("MainError ", " error=", err)
			log.Println("MainError ", " error=", err)
		}
	}()

	go UpdateTimeAsync()

	localhost.LoadDownedList()
	localhost.LoadDowningList()
	localhost.LoadUploadList()
	localhost.LoadUploadingList()
	log.Println("all userdata loaded")
	go localhost.ListenServer()

	go localhost.StartDowning()
	go localhost.StartUploading()
	localhost.WaitingUntilStopServer()

	localhost.StopDowning()
	localhost.StopUploading()
	data.Close()
	fmt.Println("6panserver exit")
	log.Println("6panserver exit")
	utils.CloseLog()

	os.Exit(0)
}
