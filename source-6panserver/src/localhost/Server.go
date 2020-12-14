package localhost

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"../data"
)

var quitChan = make(chan os.Signal)

var srv *http.Server = nil

var lastTime = time.Now()

var Port = "29375"

func ListenServer() {
	port := "localhost:" + Port
	if data.Remote.IsRemote {
		port = ":" + Port
	}
	srv = &http.Server{Addr: port, Handler: &Router{}}
	log.Println("Port:", port)
	println("Port:", port)
	err := srv.ListenAndServe()

	if err != nil && err != http.ErrServerClosed {
		log.Println("Start ServerError: ", err)
		quitChan <- os.Interrupt
	}
}

func WaitingUntilStopServer() {

	signal.Notify(quitChan, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	s := <-quitChan
	log.Println("Shutting down server: ", s)
	close(quitChan)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
}

func GetPing() bool {
	response, _ := http.Get("http://localhost:29375/ping")
	if response != nil && response.StatusCode == http.StatusOK {
		if response.Header.Get("x-md-by") == "xiaobaiyang" {
			return true
		}
	}
	return false
}

type Router struct{}

func (mux *Router) ServeHTTP(writer http.ResponseWriter, req *http.Request) {

	local := "localhost:" + Port
	if data.Remote.IsRemote {
		if data.Remote.RemotePassword == "" {
			writer.Header().Set("Content-Type", "text/html; charset=utf-8")
			writer.Header().Set("Access-Control-Allow-Origin", "*")
			writer.Header().Set("x-md-by", "xiaobaiyang")
			writer.WriteHeader(http.StatusForbidden)
			return
		}
	} else {
		if req.Host != local {
			writer.Header().Set("Content-Type", "text/html; charset=utf-8")
			writer.Header().Set("Access-Control-Allow-Origin", "*")
			writer.Header().Set("x-md-by", "xiaobaiyang")
			writer.WriteHeader(http.StatusForbidden)
			return
		}
	}

	path := req.URL.Path
	if strings.Index(path, "?") > 0 {
		path = path[0:strings.Index(path, "?")]
	}
	if strings.Index(path, "/ ") == 0 {
		http.Redirect(writer, req, "http://"+local+"/", http.StatusFound)
		return
	}

	switch path {
	case "/quit":
		ActionPing(writer, req)
		quitChan <- os.Interrupt
	case "/ping":
		ActionPing(writer, req)
	case "/url":
		ActionURL(writer, req)
	default:
		if ActionWWW(writer, req) {
			//成功，返回文件数据
		} else {
			http.NotFound(writer, req)
		}
	}

	lastTime = time.Now()
}
