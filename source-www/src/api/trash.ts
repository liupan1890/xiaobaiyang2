import { IFile } from '@/store/pan'
import { ParseJsonData, CALLSixPan } from '@/api/axios'
import { FormatDate, FormatSize } from '@/utils/Format'
import { IResultAsync } from './pan'

class Trash {
  public static readonly Instance: Trash = new Trash()

  public GetFile(item: any): IFile {
    const file: IFile = {
      key: item.identity,
      path: item.path,
      name: item.name,
      sizestr: FormatSize(item.size),
      sizeint: item.size,
      datestr: FormatDate(new Date(item.createTime), 'YYYY-MM-DD'),
      dateint: item.createTime,
      fileicon: 'iconrest',
      isdir: item.directory,

      isfromfile: false,
      isfromlixian: false,
      isfromhuishouzhan: true,
      canclick: false,
      textLink: '',
      status: '',
      istxt: false,
      isdoc: false,
      isimg: false,
      isaudio: false,
      isvideo: false,
      __v_skip: true,
    }

    return Object.freeze(file)
  }

  public async LoadFileList(userid: string): Promise<IFile[]> {
    const fileList: IFile[] = []
    for (let i = 0; i < 2; i++) {
      const list = await CALLSixPan(userid, '', 'v3/newtrash/list', '', {
        skip: i * 999,
        limit: 999,
        orderby: [
          ['ctime', 'desc'],
          ['directory', 'desc'],
        ],
      })
        .then((resp) => {
          const data = ParseJsonData('拉取回收站内文件列表', resp, false)
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

  public RecoverFile(userid: string, sourceIdentity: string[]): Promise<IResultAsync> {
    return CALLSixPan(userid, '', 'v3/newtrash/recover', '', { sourceIdentity }).then((resp) => {
      const data = ParseJsonData('恢复文件到原位', resp, false)
      if (data && data.hasOwnProperty('identity') && data.hasOwnProperty('data')) {
        return { success: true, async: data.async }
      } else return { success: false, async: false }
    })
  }

  public RecoverFileToPath(userid: string, sourceIdentity: string[], path: string): Promise<IResultAsync> {
    if (path === '6pan-root' || path === '') path = '/'
    return CALLSixPan(userid, '', 'v3/newtrash/recover', '', { sourceIdentity, path }).then((resp) => {
      const data = ParseJsonData('恢复文件到指定位置', resp, false)
      if (data && data.hasOwnProperty('identity') && data.hasOwnProperty('data')) {
        return { success: true, async: data.async }
      } else return { success: false, async: false }
    })
  }

  public TrashDeleteFile(userid: string, sourceIdentity: string[]): Promise<IResultAsync> {
    return CALLSixPan(userid, '', 'v3/newtrash/delete', '', { sourceIdentity }).then((resp) => {
      const data = ParseJsonData('从回收站彻底删除文件', resp, false)
      if (data && data.hasOwnProperty('identity') && data.hasOwnProperty('data')) {
        return { success: true, async: data.async }
      } else return { success: false, async: false }
    })
  }

  public TrashClear(userid: string): Promise<IResultAsync> {
    return CALLSixPan(userid, '', 'v3/newtrash/clear', '', { t: new Date().getTime() }).then((resp) => {
      const data = ParseJsonData('清空回收站', resp, false)
      if (data && data.hasOwnProperty('identity') && data.hasOwnProperty('data')) {
        return { success: true, async: data.async }
      } else return { success: false, async: false }
    })
  }
}
export default Trash.Instance
