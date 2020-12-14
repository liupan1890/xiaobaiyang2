package utils

import (
	"bytes"
	"crypto/sha1"
	"errors"
	"fmt"
	"log"
	"strconv"
)

type BItem struct {
	s   string           // string type
	i   int64            // integer type
	l   []BItem          // list type
	d   map[string]BItem // dictionary strings => bItems
	raw []byte           // this contains the raw string that was decoded into this bItem
}

func bdecodeInt(p []byte) (int64, error) {
	if p == nil || len(p) == 0 || string(p) == "" {
		return int64(0), nil
	}
	i, err := strconv.ParseInt(string(p), 10, 64)
	if err != nil {
		return 0, errors.New("bdecodeIntError " + string(p))
	}
	return int64(i), nil
}

func bdecodeString(p []byte) string {
	return string(p)
}

func Bdecode(p []byte) (*BItem, int, error) {
	bi := new(BItem)
	progress := 0
	end := 0
	switch p[0] {
	case 'e':
		// reached the end of an item, do nothing except advance
		progress = 1
	case 'i':
		// number goes until the first e
		end = bytes.IndexByte(p[0:], 'e')
		var err error
		bi.i, err = bdecodeInt(p[1:end])
		if err != nil {
			return nil, progress, err
		}
		progress = end + 1
	case 'l':
		// parse list until we reach empty item
		bi.l = (make([]BItem, 0))
		start := 1
		q := 0
		var err error
		var i *BItem
		for {
			i, q, err = Bdecode(p[start:])
			start += q
			if i == nil {
				return nil, progress, err
			}
			if q == 1 {
				// reached empty item; stop
				break
			}
			bi.l = append(bi.l, *i)
		}
		progress = start
	case 'd':
		// parse dictionary until we reach empty item
		bi.d = make(map[string]BItem)
		start := 1
		for {
			i, q, err := Bdecode(p[start:])
			start += q
			if i == nil {
				return nil, progress, err
			}
			if q == 1 {
				break
			}
			j, r, err := Bdecode(p[start:])
			start += r
			if j == nil {
				return nil, progress, err
			}
			// dict[i.string] = j
			bi.d[i.s] = *j
		}
		progress = start
	default:
		// String
		end = bytes.IndexByte(p[0:], ':')
		length, err := bdecodeInt(p[0:end])
		if err != nil {
			return nil, progress, err
		}
		end++
		bi.s = bdecodeString(p[end : end+int(length)])
		progress = end + int(length)
	}
	bi.raw = p[0:progress]
	return bi, progress, nil
}

func InfoHash(info BItem) string {
	h := sha1.New()
	h.Write(info.raw)
	infohash := fmt.Sprintf("%x", h.Sum(nil))
	return infohash
}

func TorrentToMagnet(btbytes []byte) (string, error) {
	binfo, p, err := Bdecode(btbytes)
	if err != nil {
		log.Println("Bdecode", p, err)
		return "", err
	}
	if binfo == nil {
		return "", nil
	}
	hash := InfoHash(binfo.d["info"])
	name := binfo.d["info"].d["name"].s

	return "magnet:?xt=urn:btih:" + hash + "&dn=" + name, nil
}
