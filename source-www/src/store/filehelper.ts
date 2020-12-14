import { StoreUser } from '@/store/user'
import { IFile, StorePan } from '@/store/pan'
import APIOffline from '@/api/offline'
import APITrash from '@/api/trash'
import APIFile from '@/api/file'
import { message, notification } from 'ant-design-vue'

function CheckUser() {
  const userid = StoreUser.UserSelected.key
  if (userid === 'add') {
    message.error('请先登录一个6盘账号')
    return ''
  }
  return userid
}
export function ClearLiXian(cmd: string) {
  const userid = CheckUser()
  if (!userid) return
  const hide = message.loading('操作中，请耐心等待...', 0)
  let type = 0
  let msg = ''
  if (cmd === 'all') {
    type = 10000
    msg = '清除所有任务'
  } else if (cmd === 'ok') {
    type = 1000
    msg = '清除所有已完成任务'
  } else if (cmd === 'unok') {
    type = 100
    msg = '清除所有未完成任务'
  } else if (cmd === 'err') {
    type = -100
    msg = '清除所有错误任务'
  } else return Promise.resolve({ code: 503, message: '不支持的操作' })

  return APIOffline.OfflineClear(userid, type, false).then((result) => {
    hide()
    StorePan.aRefreshDir()
    if (result) {
      message.success(msg + '，成功')
    } else {
      message.error(msg + '，失败')
    }
  })
}
export function ClearHuiShouZhan() {
  const userid = CheckUser()
  if (!userid) return
  const hide = message.loading('操作中，请耐心等待...', 0)
  return APITrash.TrashClear(userid).then((result) => {
    hide()
    StorePan.aSelectDir({ key: 'refresh', path: 'refresh', name: 'refresh', sep: false, chd: 0 })
    if (result) {
      message.success('清空回收站，成功')
    } else {
      message.error('清空回收站成功，失败')
    }
  })
}
export function DeleteFile(item: IFile) {
  if (item.isfromlixian) {
    DeleteFileOffline([item.key])
  } else if (item.isfromhuishouzhan) {
    DeleteFileTrash([item.key])
  } else {
    let path = ''
    if (item.isdir === false) {
      path = item.path
      if (path.indexOf('/') >= 0) path = path.substr(0, path.lastIndexOf('/'))
      if (path === '') path = '/'
    }
    DeleteFileFile([item.key], path)
  }
}
export function DeleteFileMutil(selected: IFile[]) {
  if (selected && selected.length > 0) {
    let path = ''
    const list = []
    for (let i = 0; i < selected.length; i++) {
      list.push(selected[i].key)
      if (selected[i].isdir) path = selected[i].path
    }
    if (selected[0].isfromlixian) {
      DeleteFileOffline(list)
    } else if (selected[0].isfromhuishouzhan) {
      DeleteFileTrash(list)
    } else {
      if (path !== '') {
        if (path.indexOf('/') >= 0) path = path.substr(0, path.lastIndexOf('/'))
        if (path === '') path = '/'
      }
      DeleteFileFile(list, path)
    }
  }
}

export function DeleteFileTrash(list: string[]) {
  const userid = CheckUser()
  if (!userid) return
  const hide = message.loading('操作中，请耐心等待...', 0)
  APITrash.TrashDeleteFile(userid, list).then((resp) => {
    hide()
    if (resp.async) {
      notification.open({
        message: '操作成功',
        description: '由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果',
        duration: 6,
      })
    } else {
      message.success('操作成功，已从回收站删除')
    }
    StorePan.aRefreshDir()
  })
}

export function DeleteFileOffline(list: string[]) {
  const userid = CheckUser()
  if (!userid) return
  const hide = message.loading('操作中，请耐心等待...', 0)
  APIOffline.OfflineDelete(userid, list, false).then((resp) => {
    hide()
    if (resp) {
      message.success('操作成功，已删除离线任务里')
    }
    StorePan.aRefreshDir()
  })
}

export function DeleteFileFile(list: string[], parentDir: string) {
  const userid = CheckUser()
  if (!userid) return
  const hide = message.loading('操作中，请耐心等待...', 0)
  APIFile.TrashFile(userid, list).then((resp) => {
    hide()
    if (resp.async) {
      notification.open({
        message: '操作成功',
        description: '由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果',
        duration: 6,
      })
    } else {
      message.success('操作成功，已放入回收站')
    }
    StorePan.aRefreshDir()
    if (parentDir) StorePan.aModalSelectDir({ key: '', path: parentDir, name: '', sep: false, chd: 0 })
  })
}

export function RecoverFile(item: IFile) {
  const userid = CheckUser()
  if (!userid) return
  const hide = message.loading('操作中，请耐心等待...', 0)
  APITrash.RecoverFile(userid, [item.key]).then((resp) => {
    hide()

    if (resp.async) {
      notification.open({
        message: '操作成功',
        description: '由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果',
        duration: 6,
      })
    } else {
      message.success('操作成功，已恢复文件')
    }

    StorePan.aRefreshDir()
    let parentpath = item.path
    if (parentpath.indexOf('/') >= 0) {
      parentpath = parentpath.substring(0, parentpath.lastIndexOf('/'))
      if (parentpath === '') parentpath = '/'
    } else {
      parentpath = '/'
    }
    StorePan.aModalSelectDir({ key: '', path: parentpath, name: 'refresh', sep: false, chd: 0 })
  })
}
export async function RecoverFileMutil(keylist: string[]) {
  const userid = CheckUser()
  if (!userid) return
  const hide = message.loading('操作中，请耐心等待...', 0)
  let async = false
  for (let i = 0; i < keylist.length; i++) {
    await APITrash.RecoverFile(userid, [keylist[i]]).then((resp) => {
      if (resp.async) async = true
    })
  }
  hide()

  if (async) {
    notification.open({
      message: '操作成功',
      description: '由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果',
      duration: 6,
    })
  } else {
    message.success('操作成功，已恢复文件')
  }

  StorePan.aRefreshDir()
  StorePan.aModalSelectDir({ key: '', path: '/', name: 'refresh', sep: false, chd: 0 })
}
