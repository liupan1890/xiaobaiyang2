import { StoreUser } from '@/store/user'
import { StoreUI } from '@/store/ui'
import { StoreConfig } from '@/store/config'
import { IFile } from '@/store/pan'
import APIFile from '@/api/file'
import APIPreview from '@/api/preview'
import { message } from 'ant-design-vue'

function CheckUser() {
  const userid = StoreUser.UserSelected.key
  if (userid === 'add') {
    message.error('请先登录一个6盘账号')
    return ''
  }
  return userid
}

function copyToClipboard(value: string) {
  const tempInput = document.createElement('input')
  tempInput.style.position = 'absolute'
  tempInput.style.left = '-100px'
  tempInput.style.top = '-100px'
  tempInput.value = value
  document.body.appendChild(tempInput)
  tempInput.select()
  document.execCommand('copy')
  document.body.removeChild(tempInput)
}
export function ShowTxt(item: IFile) {
  const userid = CheckUser()
  if (!userid) return
  StoreUI.mShowModal({ ModalName: 'showtxt', ModalData: { ...item } })
}
export function ShowDoc(item: IFile) {
  const userid = CheckUser()
  if (!userid) return
  StoreUI.mShowModal({ ModalName: 'showdoc', ModalData: { ...item } })
}
export function ShowImage(item: IFile) {
  const userid = CheckUser()
  if (!userid) return
  StoreUI.mShowModal({ ModalName: 'showimage', ModalData: { ...item } })
}
export function ShowVideo(item: IFile) {
  const userid = CheckUser()
  if (!userid) return
  const hide = message.loading('操作中，请耐心等待...', 8)
  if (StoreConfig.UserSetting.UseVipVideoUrl === false && item.sizeint < 16106127360) {
    APIFile.DownloadAddress(userid, item.key).then((result) => {
      if (result) PlayFile(result.downloadAddress)
    })
  } else {
    APIPreview.PreviewVideo(userid, item.key).then((result) => {
      if (result) {
        PlayFile(result)
        return
      }
      if (item.sizeint < 16106127360) {
        APIFile.DownloadAddress(userid, item.key).then((result) => {
          if (result) PlayFile(result.downloadAddress)
        })
      } else {
        hide()
        message.info('文件体积太大(>15GB)，且m3u8不存在，暂不支持预览')
      }
    })
  }
}
export function ShowAudio(item: IFile) {
  const userid = CheckUser()
  if (!userid) return
  if (item.sizeint < 1610612736) {
    const hide = message.loading('操作中，请耐心等待...', 0)
    APIFile.DownloadAddress(userid, item.key).then((result) => {
      hide()
      if (result) PlayFile(result.downloadAddress)
    })
  } else {
    message.info('文件体积太大(>1.5GB)，暂不支持预览')
  }
}
export function DownFile(key: string) {
  const userid = CheckUser()
  if (!userid) return
  if (StoreConfig.UserSetting.SavePath.length < 3 || StoreConfig.UserSetting.SavePathEveryTime) {
    StoreUI.mShowModal({ ModalName: 'savepath', ModalData: key })
  } else {
    const hide = message.loading('操作中，请耐心等待...', 0)
    APIFile.DownFile(userid, key).then((resp) => {
      hide()
      if (resp.isdown) {
        message.success('操作成功，创建 ' + resp.filecount + ' 个文件的下载任务')
      }
    })
  }
}

export function DownFileMutil(keylist: string[]) {
  console.log(keylist)
  //1. 修改savepathModal的ModalData为数组
  //2. for APIFile.DownFile(userid, key)
  //3. Promise.all等待结果
  //4. 提示结果
  //因性能原因(可能选择的是一堆文件夹，遍历再遍历)不做了
}

export function RenameFile(item: IFile) {
  const userid = CheckUser()
  if (!userid) return
  StoreUI.mShowModal({ ModalName: 'rename', ModalData: { ...item } })
}
export function RenameFileMutil(selected: IFile[]) {
  const list = []
  for (let i = 0; i < selected.length; i++) {
    list.push({ ...selected[i] })
  }
  StoreUI.mShowModal({ ModalName: 'renamemulti', ModalData: list })
}

export function DownLink(item: IFile) {
  const userid = CheckUser()
  if (!userid) return
  if (item.isfromfile === false || item.isdir) return
  APIFile.DownloadAddress(userid, item.key).then((resp) => {
    if (!resp) return

    copyToClipboard(resp.downloadAddress)
    if (resp.isremote === true) {
      message.info('下载链接已复制，远程管理下警告：6盘限制下载和创建时的IP必须一样，否则会报错403')
      return
    }
    let tsTime = 0
    if (resp.downloadAddress.indexOf('&wsTime=') > 0) {
      let wsTime = resp.downloadAddress.substring(resp.downloadAddress.indexOf('&wsTime=') + 8)
      wsTime = wsTime.substring(0, wsTime.indexOf('&'))
      tsTime = Math.ceil((parseInt(wsTime, 16) - new Date().getTime() / 1000) / 60)
    }
    if (tsTime === 0) {
      message.success('下载链接已复制到剪切板')
    } else if (tsTime < 60) {
      message.success('下载链接已复制到剪切板，' + tsTime + '分钟内有效')
    } else {
      tsTime = tsTime / 60
      message.success('下载链接已复制到剪切板，' + tsTime.toFixed(1) + '小时内有效')
    }
  })
}

export function LiXianLink(item: IFile) {
  copyToClipboard(item.textLink)
  message.success('离线链接已复制到剪切板')
}
export function CopytoFile(key: string, path: string) {
  const userid = CheckUser()
  if (!userid) return
  StoreUI.mShowModal({ ModalName: 'copyto', ModalData: { keylist: [key], path, from: 'file' } })
}
export function CopytoFileMutil(keylist: string[], path: string, from: string) {
  const userid = CheckUser()
  if (!userid) return
  StoreUI.mShowModal({ ModalName: 'copyto', ModalData: { keylist, path, from } })
}

export function PlayFile(link: string) {
  if (window.WebSpawnSync) {
    let command = StoreConfig.UserSetting.PlayerPath
    let args = [link]
    const options = {}
    if (StoreConfig.UserSetting.PlayerPath === '' || StoreConfig.UserSetting.PlayerPath.toLowerCase() === 'mpv') {
      command = 'mpv'
      const ua = StoreConfig.ServerConfig.SixPanDownAgent.replaceAll(' ', '')
      args = ['--force-window=yes', '--profile=low-latency', '--user-agent=' + ua, link]
    }
    if (command === 'mpv') {
      window.WebSpawnSync({ command, args, options }, function callback(backdata: any) {
        console.log('WebSpawnSync', backdata)
      })
    } else {
      APIFile.PlayFile(link)
    }
  } else {
    message.error('在线预览视频需要Electron环境支持')
  }
}
