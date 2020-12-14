import { CALLCommand, ParseJsonData } from '@/api/axios'
import { IDownItem } from '@/store/down'
import { FormatSize } from '@/utils/Format'
export interface IDownList {
  filecount: number
  filelist: IDownItem[]
}

class Down {
  public static readonly Instance: Down = new Down()

  public DownStartAll(DownPage: string): Promise<void> {
    return CALLCommand('DownStart', { DownPage, DownID: 'all' }).then((resp) => {
      ParseJsonData('开始全部任务', resp, false)
    })
  }

  public DownStopAll(DownPage: string): Promise<void> {
    return CALLCommand('DownStop', { DownPage, DownID: 'all' }).then((resp) => {
      ParseJsonData('暂停全部任务', resp, false)
    })
  }

  public DownDeleteAll(DownPage: string): Promise<void> {
    return CALLCommand('DownDelete', { DownPage, DownID: 'all' }).then((resp) => {
      ParseJsonData('删除全部任务', resp, false)
    })
  }

  public DownStart(DownPage: string, DownID: string): Promise<void> {
    return CALLCommand('DownStart', { DownPage, DownID }).then((resp) => {
      ParseJsonData('开始任务', resp, false)
    })
  }

  public DownStop(DownPage: string, DownID: string): Promise<void> {
    return CALLCommand('DownStop', { DownPage, DownID }).then((resp) => {
      ParseJsonData('暂停任务', resp, false)
    })
  }

  public DownDelete(DownPage: string, DownID: string): Promise<void> {
    return CALLCommand('DownDelete', { DownPage, DownID }).then((resp) => {
      ParseJsonData('删除任务', resp, false)
    })
  }

  private GetDownItem(downpage: string, downitem: any): IDownItem {
    const m: IDownItem = {
      key: downitem.DownID,
      name: downitem.name,
      path: downitem.path,
      sizestr: FormatSize(downitem.size),
      progress: downitem.DownProcess,
      speedstr: downitem.DownSpeedStr,
      active: downitem.IsStop === false && downitem.IsFailed === false,
      savepath: downitem.DownSavePath,
      fileicon: '',
      error: '',
      info: '',
      server: '',
      __v_skip: true,
    }

    if (downpage === 'downing') {
      m.fileicon = 'icondownload'
      m.error = downitem.FailedMessage
      if (m.error === '' && m.active) {
        const lasttime = (downitem.size - downitem.DownSize + 1) / downitem.DownSpeed
        if (lasttime < 60) m.info = '剩余' + lasttime.toFixed(1) + '秒'
        else if (lasttime < 3600) m.info = '剩余' + (lasttime / 60).toFixed(1) + '分钟'
        else m.info = '剩余' + (lasttime / 3600).toFixed(1) + '小时'
        if (downitem.DownServer === 'cdn2.qiecdn.com') {
          m.server = '高速 ' + downitem.DownServer
        } else if (downitem.DownServer.indexOf('99store.cn') >= 0 || downitem.DownServer.indexOf('cold') >= 0) {
          m.server = '冷 ' + downitem.DownServer
        } else {
          m.server = downitem.DownServer
        }
      }
    } else if (downpage === 'downed') {
      m.progress = 100
      m.speedstr = ''
      m.active = false
      m.fileicon = 'icondesktop'
    } else if (downpage === 'uploading') {
      m.name = downitem.path + '/' + downitem.name
      m.fileicon = 'iconupload'
      m.error = downitem.FailedMessage
      if (m.error === '' && m.active) {
        const lasttime = (downitem.size - downitem.DownSize + 1) / downitem.DownSpeed
        if (lasttime < 60) m.info = '剩余' + lasttime.toFixed(1) + '秒'
        else if (lasttime < 3600) m.info = '剩余' + (lasttime / 60).toFixed(1) + '分钟'
        else m.info = '剩余' + (lasttime / 3600).toFixed(1) + '小时'
        m.server = downitem.DownServer
      }
    } else if (downpage === 'upload') {
      m.name = downitem.path + '/' + downitem.name
      m.progress = 100
      m.speedstr = ''
      m.active = false
      m.fileicon = 'iconcloud-success'
    }

    return m
  }

  public DownList(DownPage: string): Promise<IDownList | undefined> {
    return CALLCommand('DownList', { DownPage }).then((resp) => {
      const data = ParseJsonData('读取任务列表', resp, false)
      if (data && data.hasOwnProperty('filecount') && data.hasOwnProperty('filelist')) {
        const List: IDownItem[] = []
        for (let i = 0; i < data.filelist.length; i++) {
          List.push(this.GetDownItem(DownPage, data.filelist[i]))
        }
        return { filecount: data.filecount, filelist: List }
      }
      return undefined
    })
  }
}

export default Down.Instance
