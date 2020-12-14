import { message } from 'ant-design-vue'
import axios, { AxiosResponse } from 'axios'
import { StoreUI } from '@/store/ui'
import { StoreUser } from '@/store/user'
import { StoreConfig } from '@/store/config'
import APIUser from '@/api/user'
import base64 from 'base-64'
import utf8 from 'utf8'

axios.interceptors.request.use(
  (config) => {
    StoreUI.mLoading(true)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    StoreUI.mLoading(false)
    if (response.status === 200 && response.data.code === 501 && response.data.message === '需要远程管密码') {
      StoreUI.mShowModal({ ModalName: 'remotepassword' })
    }
    return response
  },
  (error) => {
    StoreUI.mLoading(false)
    return Promise.reject(error)
  }
)

let baseapi = ''
let hostname = ''
export async function CALLPort(): Promise<void> {
  if (baseapi !== '' && hostname !== '') return Promise.resolve()

  if (location.hostname.length < 7) {
    hostname = 'localhost'
  } else {
    hostname = location.hostname
  }
  if (location.port === '29375') {
    baseapi = 'http://' + hostname + ':' + location.port + '/'
    return Promise.resolve()
  }

  await axios
    .get('http://' + hostname + ':29375/ping')
    .then((response) => {
      if (response.headers['x-md-by'] === 'xiaobaiyang') baseapi = 'http://' + hostname + ':29375/'
      if (response.data === 'success') baseapi = 'http://' + hostname + ':29375/'
    })
    .catch(() => {
      baseapi = ''
    })

  if (baseapi === '') setTimeout(TimerPort, 10000)

  return Promise.resolve()
}

function TimerPort() {
  CALLPort().then(() => {
    if (baseapi !== '') location.reload()
  })
}

export interface IUrlRespData {
  code: number
  header: string
  body: string
}

let authpwd = ''
let lasterr = new Date().getTime() / 1000

export async function CALLURL(method: string, url: string, header: string, postdata: string): Promise<IUrlRespData> {
  const urldata = {
    url,
    method,
    header,
    postdata,
    authpwd: '',
    islocalhost: true,
  }
  console.log(new Date().getTime(), url)
  if (baseapi === '') {
    await CALLPort()
  }
  if (baseapi === '') {
    console.log('无法连接到后台服务程序')
    return { code: -2, header: '', body: '无法连接到后台服务程序 PortError' }
  }

  if (hostname !== 'localhost') {
    if (authpwd === '') authpwd = localStorage['RemotePassword']
    urldata.authpwd = authpwd
  }

  let base64str = JSON.stringify(urldata)
  const bytes = utf8.encode(base64str)
  base64str = base64.encode(bytes)

  return axios
    .post(baseapi + 'url', base64str, { responseType: 'json' })
    .then((response: AxiosResponse<IUrlRespData>) => {
      return response.data
    })
    .catch(function (error) {
      console.log('CALLURLError ', error)
      if (error.message.indexOf('Network Error') >= 0) {
        if (new Date().getTime() / 1000 - lasterr > 3) {
          message.error('无法连接到后台服务程序')
          lasterr = new Date().getTime() / 1000
        }
      }
      return { code: -3, header: '', body: 'Network ' + error.message }
    })
}

export function CALLCommand(cmd: string, postdata: any): Promise<IUrlRespData> {
  return CALLURL('', cmd, '', postdata === '' ? '' : JSON.stringify(postdata))
}

export function ParseJsonData(msg: string, resp: IUrlRespData, showsuccess: boolean): any {
  let respmessage = ''

  try {
    const data = JSON.parse(resp.body)
    if (data) {
      if (data.hasOwnProperty('message')) respmessage = ': ' + data.message
      if (data.hasOwnProperty('code') && data.code !== 0) {
        if (msg !== '') message.error(msg + '失败' + respmessage)
        return data
      } else if (data.hasOwnProperty('success') && data.success === false) {
        if (msg !== '') message.error(msg + '失败' + respmessage)
        return data
      } else if (data.hasOwnProperty('state') && data.state === 'error') {
        if (msg !== '') message.error(msg + '失败' + respmessage)
        return data
      }
    }
    if (resp.code !== 200) {
      message.error(msg + '出错' + respmessage)
    } else if (showsuccess) {
      message.success(msg + '，操作成功')
    }
    return data
  } catch {
    //catch
  }
  if (resp.code !== 200) {
    message.error(msg + '出错' + respmessage)
  }
  return undefined
}

export function GetLoginHead(userid: string): string {
  if (userid === '') return ''
  try {
    for (let i = 0; i < StoreUser.UserList.length; i++) {
      if (StoreUser.UserList[i].key === userid) {
        return StoreUser.UserList[i].loginHead
      }
    }
  } catch {
    //catch
  }
  return ''
}

function GetHeader(api: string, loginHead: string, header: string): string {
  let realheader = 'Content-Type: application/json\n'

  let useragent = ''
  if (api.indexOf('download') >= 0) useragent = StoreConfig.ServerConfig.SixPanDownAgent.trim()
  else useragent = StoreConfig.ServerConfig.SixPanApiAgent.trim()
  if (useragent) {
    realheader = realheader + 'User-Agent: ' + useragent + '\n'
  }
  if (loginHead && loginHead !== '') {
    realheader = realheader + loginHead.trim() + '\n'
  }
  realheader = realheader + header
  realheader = realheader.trim()
  return realheader
}

export async function CALLSixPan(userid: string, loginHead: string, api: string, header: string, postdata: any): Promise<IUrlRespData> {
  if (loginHead === '') loginHead = GetLoginHead(userid)
  if (loginHead === '') return Promise.resolve({ code: -4, header: '', body: '错误的userid' } as IUrlRespData)

  const realurl = StoreConfig.ServerConfig.SixPanApiUrl.trim() + api
  const realmethod = 'post'
  let realheader = GetHeader(api, loginHead, header)
  let resp = await CALLURL(realmethod, realurl, realheader, postdata === '' ? '' : JSON.stringify(postdata))
  if (resp.code !== 200) {
    try {
      const data = JSON.parse(resp.body)
      if (data.reference && data.reference === 'UNAUTHORIZED') {
        if (api === 'v3/user/logout') {
          return { code: 200, header: '', body: '{"success":true,"ts":1606378726618}' } as IUrlRespData
        }
        const user = await APIUser.ReLogin(userid)
        if (user && user.userid !== '') {
          const islogin = await StoreUser.aRefreshUser({ userid: user.userid, loginHead: user.loginHead })
          if (islogin) {
            realheader = GetHeader(api, user.loginHead, header)
            resp = await CALLURL(realmethod, realurl, realheader, postdata === '' ? '' : JSON.stringify(postdata))
          }
        } else {
          StoreUI.mCloseModal()
          StoreUser.aDeleteUser(userid)
        }
      }
    } catch {
      //catch
    }
  }
  return resp
}
