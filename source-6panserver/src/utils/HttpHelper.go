package utils

import (
	"archive/zip"
	"bytes"
	"compress/gzip"
	"crypto/tls"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

func Raw(metho string, url string, header string, postdata *bytes.Reader) (code int, head string, body *[]byte) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("HttpRawError ", " url=", url, " error=", err)
			code = 503
			ebs := []byte("网络错误")
			body = &ebs
		}
	}()

	request, _ := http.NewRequest(metho, url, postdata)
	if header != "" {
		hls := strings.Split(header, "\n")
		for _, v := range hls {

			if i := strings.Index(v, ":"); i > 0 {
				hk := v[0:i]
				hv := v[i+1:]
				hk = strings.Trim(hk, " ")
				hv = strings.Trim(hv, " ")
				request.Header.Set(hk, hv)
			}
		}
	}
	jar, err := NewJar(nil)
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	response, err := (&http.Client{Transport: tr, Jar: jar}).Do(request)
	if response != nil && response.Body != nil {
		defer response.Body.Close()
	}
	if response != nil {
		code = response.StatusCode
		head = ""
		for k, v := range response.Header {
			head += k + ": " + strings.Join(v, ",") + "\n"
		}
		for Name, Value := range jar.CookieList {
			head += "set-cookie: " + Name + "=" + Value + "; path=/\n"
		}

		if response.Body != nil {
			bodybytes, err := ioutil.ReadAll(response.Body)
			if err == nil {
				if strings.Contains(response.Header.Get("Content-Encoding"), "gzip") {
					buffer := bytes.NewBuffer(bodybytes)
					r, _ := gzip.NewReader(buffer)
					unCom, err := ioutil.ReadAll(r)
					if err == nil {
						body = &unCom
					}
				} else {
					body = &bodybytes
				}
			}
		}
	}
	if err != nil && body == nil {
		bodybytes := []byte(err.Error())
		body = &bodybytes
	}
	return code, head, body
}

func GetHTTPString(url string, header string) (code int, head string, body string) {

	var bodybytes *[]byte
	for i := 0; i < 2; i++ {
		code, head, bodybytes = Raw("GET", url, header, bytes.NewReader(nil))
		if bodybytes != nil {
			body = string(*bodybytes)
		}
		if code == 200 || code == 206 {
			return 200, head, body
		}
	}
	return code, head, body
}

func GetHTTPBytes(url string, header string) (code int, head string, body *[]byte) {

	for i := 0; i < 2; i++ {
		code, head, body = Raw("GET", url, header, bytes.NewReader(nil))
		if code == 200 || code == 206 {
			return 200, head, body
		}
	}
	return code, head, body
}

func GetZIPString(url string, header string) (code int, head string, body *[]byte) {
	var bodybytes *[]byte
	for i := 0; i < 3; i++ {
		code, head, bodybytes = Raw("GET", url, header, bytes.NewReader(nil))
		if bodybytes != nil {
			body = bodybytes
		}
		if code != 200 {
			continue
		}
		byteslen := len(*bodybytes)
		for i := 0; i <= 200 && byteslen > i; i++ {
			(*bodybytes)[i] ^= byte(9 + i)
		}

		zipReader, err := zip.NewReader(bytes.NewReader(*bodybytes), int64(byteslen))
		if err == nil {
			for _, f := range zipReader.File {
				if f.Name == "json" {
					inFile, err := f.Open()
					if err == nil {
						defer inFile.Close()
						readbytes, err := ioutil.ReadAll(inFile)
						if err == nil {
							body = &readbytes
							zipReader = nil
							return code, head, body
						}
					}
				}
			}
		}
		zipReader = nil
	}
	return code, head, body
}

func PostHTTPString(url string, header string, postdata string) (code int, head string, body string) {
	var bodybytes *[]byte
	for i := 0; i < 2; i++ {
		body = ""
		bodybytes = nil
		code, head, bodybytes = Raw("POST", url, header, bytes.NewReader([]byte(postdata)))
		if bodybytes != nil {
			body = string(*bodybytes)
			bodybytes = nil
		}
		if code == 200 || code == 206 {
			return 200, head, body
		}
	}
	return code, head, body
}

func NetErrorMessage(msg string) string {
	if strings.Index(msg, "no such host") >= 0 {
		return "Network Error"
	}
	if strings.Index(msg, "context canceled") >= 0 {
		return "Low Speed Error"
	}
	if strings.Index(msg, "timeout awaiting response headers") >= 0 {
		return "Connection Timeout"
	}
	if strings.Index(msg, "An existing connection was forcibly closed by the remote host") >= 0 {
		return "Connection was forcibly closed by the remote host"
	}
	if strings.Index(msg, "the target machine actively refused it") >= 0 {
		return "the target machine actively refused it"
	}

	return msg
}
