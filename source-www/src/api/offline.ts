import { IFile } from '@/store/pan'
import { ParseJsonData, CALLSixPan, CALLCommand } from '@/api/axios'
import { FormatDate, FormatSize } from '@/utils/Format'

export interface IOfflineParse {
  hash: string
  name: string
  size: number
  type: number
}
export interface IOfflineQuota {
  dailyQuota: number
  dailyUsed: number
}

class Offline {
  public static readonly Instance: Offline = new Offline()

  public GetFile(item: any): IFile {
    const file: IFile = {
      key: item.taskIdentity,
      path: item.savePath,
      name: item.name,
      sizestr: FormatSize(item.size),
      sizeint: item.size,
      datestr: FormatDate(new Date(item.createTime), 'YYYY-MM-DD'),
      dateint: item.createTime,
      fileicon: '',
      isdir: item.fileMime === 'text/directory',

      isfromfile: false,
      isfromlixian: true,
      isfromhuishouzhan: false,
      canclick: false,
      textLink: item.textLink,
      status: item.status,
      istxt: false,
      isdoc: false,
      isimg: false,
      isaudio: false,
      isvideo: false,
      __v_skip: true,
    }

    let status = ''
    if (item.status < 0) {
      status = '下载失败 '
      file.fileicon = 'iconcloud-error' //-1 下载失败
    } else if (item.status === 0) {
      status = '添加失败 '
      file.fileicon = 'iconcloud-error' //添加失败
    } else if (item.status === 100) {
      status = '排队中 '
      file.fileicon = 'iconcloud-sync' //排队中
    } else if (item.status === 309) {
      status = '等待重试 '
      file.fileicon = 'iconcloud-sync' //重试
    } else if (item.status === 310) {
      status = '错误 '
      file.fileicon = 'iconcloud-error' //重试
    } else if (item.status === 306 || item.status === 307) {
      status = '失败 '
      file.fileicon = 'iconcloud-error' //重试2
    } else if (item.status === 400) {
      status = '地址失效 '
      file.fileicon = 'iconcloud-error' //重试
    } else if (item.status === 406 || item.status === 407) {
      status = '自动重试 '
      file.fileicon = 'iconcloud-sync' //重试2
    } else if (item.status > 300 && item.status < 400) {
      status = '下载失败 '
      file.fileicon = 'iconcloud-error' //自己加的额外判断
    } else if (item.status === 1000) {
      status = 'success'
      file.fileicon = 'iconcloud-success' //下载完成
    } else {
      status = ''
      file.fileicon = 'iconcloud-download' //下载中
    }

    if (status !== 'success') {
      file.name = '[' + status + item.progress + '%]  ' + item.name
    } else {
      file.name = item.name
    }

    return Object.freeze(file)
  }

  public async LoadFileList(userid: string): Promise<IFile[]> {
    const fileList: IFile[] = []
    for (let i = 0; i < 2; i++) {
      const list = await CALLSixPan(userid, '', 'v3/offline/list', '', {
        skip: i * 999,
        limit: 999,
        orderby: [
          ['ctime', 'desc'],
          ['directory', 'desc'],
        ],
      })
        .then((resp) => {
          const data = ParseJsonData('拉取离线任务列表', resp, false)
          return data.dataList
        })
        .catch(() => {
          return []
        })

      for (let j = 0; j < list.length; j++) {
        fileList.push(this.GetFile(list[j]))
      }
      if (list.length < 999) break
    }
    return Promise.resolve(fileList)
  }

  public OfflineDelete(userid: string, taskIdentity: string[], deleteFile: boolean): Promise<boolean> {
    return CALLSixPan(userid, '', 'v3/offline/delete', '', { taskIdentity, deleteFile }).then((resp) => {
      const data = ParseJsonData('删除离线任务', resp, false)
      return data && data.successCount > 0
    })
  }

  public OfflineClear(userid: string, type: number, deleteFile: boolean): Promise<boolean> {
    return CALLSixPan(userid, '', 'v3/offline/clear', '', { type, deleteFile }).then((resp) => {
      const data = ParseJsonData('清理离线任务', resp, false)
      return data && data.successCount >= 0
    })
  }

  public OfflineQuota(userid: string): Promise<IOfflineQuota> {
    return CALLSixPan(userid, '', 'v3/offline/quota', '', { ts: new Date().getTime() }).then((resp) => {
      const data = ParseJsonData('查询离线配额', resp, false)
      if (data && data.hasOwnProperty('dailyQuota')) {
        return { dailyQuota: data.dailyQuota, dailyUsed: data.dailyUsed }
      }
      return { dailyQuota: 0, dailyUsed: 0 }
    })
  }

  public OfflineParse(userid: string, textLink: string, username: string, password: string): Promise<IOfflineParse | string> {
    return CALLSixPan(userid, '', 'v3/offline/parse', '', { textLink, username, password }).then((resp) => {
      const data = ParseJsonData('', resp, false)
      if (data && data.hasOwnProperty('hash')) {
        return { hash: data.hash, name: data.info.name, size: data.info.size, type: data.info.type }
      }
      return data.message
    })
  }

  public OfflineAddBT(dataurl: string): Promise<string> {
    return CALLCommand('OfflineAddBT', dataurl).then((resp) => {
      const data = ParseJsonData('BT转磁力链接', resp, false)
      if (data && data.hasOwnProperty('textlink')) {
        return data.textlink
      }
      Promise.resolve('')
    })
  }

  public OfflineAdd(userid: string, hashlist: string[], savePath: string): Promise<number> {
    if (savePath === '6pan-root' || savePath === '') savePath = '/'

    const task = []
    for (let i = 0; i < hashlist.length; i++) {
      task.push({ hash: hashlist[i] })
    }
    return CALLSixPan(userid, '', 'v3/offline/add', '', { task, savePath }).then((resp) => {
      const data = ParseJsonData('添加离线任务', resp, false)
      return data.successCount || 0
    })
  }
}
export default Offline.Instance
