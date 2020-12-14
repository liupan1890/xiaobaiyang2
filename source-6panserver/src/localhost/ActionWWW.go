package localhost

import (
	"mime"
	"net/http"
	"path"
	"path/filepath"
	"strings"

	"../data"
)

func ActionPing(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("x-md-by", "xiaobaiyang")
	w.WriteHeader(200)
	w.Write([]byte("success"))
}

func ActionWWW(w http.ResponseWriter, req *http.Request) bool {
	url := req.URL.Path

	if strings.Index(url, "?") > 0 {
		url = url[0:strings.Index(url, "?")]
	}
	cmime := ""
	if url == "" || url == "/" {
		url = "/index.html"
		cmime = "text/html; charset=utf-8"
	}
	url = strings.TrimLeft(url, "/")
	isget, buff := data.GetWWW(url)

	if isget == false && url == "index.html" {
		isget = true
		html := `<html><title>6盘小白羊版</title><body><h1>程序文件损坏，请重新下载压缩包解压替换</h1><br/><br/><a target="_blink" href="https://github.com/liupan1890/xiaobaiyang2"><h2>https://github.com/liupan1890/xiaobaiyang2</h2></a></body></html>`
		*buff = []byte(html)
	}

	urllow := strings.ToLower(url)
	ext := filepath.Ext(urllow)

	if cmime == "" {
		if ext == ".js" {
			cmime = "application/javascript; charset=utf-8"
		} else if ext == ".css" {
			cmime = "text/css; charset=utf-8"
		} else if ext == ".html" {
			cmime = "text/html; charset=utf-8"
		} else if ext == ".json" {
			cmime = "application/json"
		} else if ext == ".svg" {
			cmime = "image/svg+xml"
		} else if ext == ".woff" {
			cmime = "application/x-font-woff"
		} else if ext == ".woff2" {
			cmime = "application/x-font-woff2"
		} else if ext == ".ico" {
			cmime = "image/x-icon"
		}
	}
	if cmime == "" {
		if strings.Contains(urllow, ".js") {
			cmime = "application/javascript; charset=utf-8"
		} else if strings.Contains(urllow, ".css") {
			cmime = "text/css; charset=utf-8"
		} else if strings.Contains(urllow, ".html") {
			cmime = "text/html; charset=utf-8"
		} else if strings.Contains(urllow, ".json") {
			cmime = "application/json"
		} else if strings.Contains(urllow, ".woff") {
			cmime = "application/x-font-woff"
		} else if strings.Contains(urllow, ".woff2") {
			cmime = "application/x-font-woff2"
		} else if strings.Contains(urllow, ".ico") {
			cmime = "image/x-icon"
		}
	}

	if cmime == "" {
		cmime = mime.TypeByExtension(path.Ext(urllow))
	}

	if isget {

		w.Header().Set("Content-Type", cmime)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("x-md-by", "xiaobaiyang")
		w.WriteHeader(200)
		w.Write(*buff)

		return true
	}
	return false
}
