import { message } from 'ant-design-vue';

import axios from 'axios';
import base64 from 'base-64';
import utf8 from 'utf8';

//var baseapi = "http://localhost:2020/ui";
var baseapi = "";

export function ToBase64(bytes) {
    var base64str = base64.encode(bytes);
    return base64str;
}

function byteToString(arr) {
    if (typeof arr === 'string') {
        return arr;
    }
    var str = '',
        _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2),
            v = one.match(/^1+?(?=0)/);
        if (v && one.length == 8) {
            var bytesLength = v[0].length;
            var store = _arr[i].toString(2).slice(7 - bytesLength);
            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2);
            }
            str += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1;
        } else {
            str += String.fromCharCode(_arr[i]);
        }
    }
    return str;
}
export function FromBase64(b64str) {
    var bytes = base64.decode(b64str);
    try {
        var respstr = utf8.decode(bytes);
        return respstr;
    } catch (e) {
        return byteToString(bytes);
    }
}
var authpwd = ""
export function CALLAPI(postdata) {
    if (authpwd == "") {
        authpwd = localStorage["RemotePassword"]
    }
    postdata.authpwd = authpwd;
    let base64str = JSON.stringify(postdata);

    var bytes = utf8.encode(base64str);
    base64str = base64.encode(bytes);
    if (baseapi == "") {
        if (location.hostname.length < 5) {
            baseapi = "localhost";
        } else {
            baseapi = location.hostname;
        }
        baseapi = "http://" + baseapi + ":2020/ui";
    }
    return new Promise((resolve) => {
        axios.post(baseapi, base64str, { responseType: "json" }).then(function(response) {
                try {
                    var obj = response.data;
                    if (obj.message && obj.message.indexOf("可能需要登录") > 0) {
                        obj.message = "6盘用户登录状态失效，请重新登录账号!"
                    }
                    resolve(obj);
                } catch (e) {
                    console.log(e, response.data);
                    throw e;
                }
            })
            .catch(function(error) {
                if (error.message.indexOf('Network Error') >= 0) {
                    message.error("无法连接到后台服务程序");
                }
                resolve({ code: -1, message: "网络错误" + error });
            });
    });


}
