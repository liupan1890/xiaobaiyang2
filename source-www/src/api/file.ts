import { IFile } from '@/store/pan'
import FileIcon from '@/api/fileicon'
import { ParseJsonData, CALLSixPan, CALLCommand } from '@/api/axios'

import { FormatDate, FormatSize } from '@/utils/Format'
import APIPan, { IResultAsync } from './pan'

export interface IDownloadAddress {
  downloadAddress: string
  size: number
  isremote: boolean
}

export interface IDownFile {
  isdown: boolean
  filecount: number
}

class File {
  public static readonly Instance: File = new File()

  public GetFile(item: any): IFile | undefined {
    if (item.name.indexOf('请升级到BitComet') > 0) return undefined
    const file: IFile = {
      key: item.identity,
      path: item.path,
      name: item.name,
      sizestr: FormatSize(item.size),
      sizeint: item.size,
      datestr: FormatDate(new Date(item.ctime), 'YYYY-MM-DD'),
      dateint: item.ctime,
      fileicon: '',
      isdir: item.directory,

      isfromfile: true,
      isfromlixian: false,
      isfromhuishouzhan: false,
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
    const ext = item.name.indexOf('.') >= 0 ? item.name.substring(item.name.lastIndexOf('.')).toLowerCase() : item.ext.toLowerCase()
    FileIcon.FixFileIcon(file, ext, item.mime)
    return Object.freeze(file)
  }

  public async FileList(userid: string, props: any, maxpage: number) {
    const fileList: IFile[] = []
    for (let i = 0; i < maxpage; i++) {
      props.skip = i * 999
      const list = await CALLSixPan(userid, '', 'v3/newfile/list', '', props)
        .then((resp) => {
          const data = ParseJsonData('拉取文件夹内文件列表', resp, false)
          return data.dataList
        })
        .catch(() => {
          return []
        })

      for (let j = 0; j < list.length; j++) {
        const f = this.GetFile(list[j])
        if (f) fileList.push(f)
      }
      if (list.length < 999) break
    }
    return Promise.resolve(fileList)
  }

  public LoadFileList(userid: string, dirpath: string): Promise<IFile[]> {
    return this.FileList(
      userid,
      {
        parentPath: dirpath,
        skip: 0,
        limit: 999,
        hidden: false,
        orderby: [
          ['ctime', 'desc'],
          ['directory', 'desc'],
        ],
      },
      5
    )
  }

  public LoadFileListSearch(userid: string, searchkey: string): Promise<IFile[]> {
    searchkey = searchkey.trim()
    if (searchkey.endsWith('/')) searchkey = searchkey.substr(0, searchkey.length - 1)

    return this.FileList(
      userid,
      {
        name: searchkey,
        parentIdentity: '',
        skip: 0,
        limit: 999,
        search: true,
        hidden: false,
        orderby: [
          ['ctime', 'desc'],
          ['directory', 'desc'],
        ],
      },
      1
    )
  }

  public DownloadAddress(userid: string, identity: string): Promise<IDownloadAddress | undefined> {
    return CALLSixPan(userid, '', 'v3/newfile/download', '', { identity }).then((resp) => {
      const data = ParseJsonData('获取文件下载链接', resp, false)
      if (data.downloadAddress && data.downloadAddress !== '') {
        return { downloadAddress: data.downloadAddress, size: data.size, isremote: data.isremote }
      }
      return undefined
    })
  }

  public CopyFileToDir(userid: string, sourceIdentity: string[], identity: string): Promise<IResultAsync> {
    if (identity === '6pan-root' || identity === '') {
      identity = APIPan.PathToIdentity('/')
    }
    return CALLSixPan(userid, '', 'v3/newfile/copy', '', { sourceIdentity, identity }).then((resp) => {
      const data = ParseJsonData('复制文件', resp, false)
      if (data && data.hasOwnProperty('identity') && data.hasOwnProperty('data')) {
        return { success: true, async: data.async }
      } else return { success: false, async: false }
    })
  }

  public MoveFileToDir(userid: string, sourceIdentity: string[], identity: string): Promise<IResultAsync> {
    if (identity === '6pan-root' || identity === '') {
      identity = APIPan.PathToIdentity('/')
    }
    return CALLSixPan(userid, '', 'v3/file/move', '', { sourceIdentity, identity }).then((resp) => {
      const data = ParseJsonData('移动文件', resp, false)
      if (data && data.hasOwnProperty('successCount')) {
        return { success: true, async: false }
      }
      if (data && data.hasOwnProperty('identity') && data.hasOwnProperty('data')) {
        return { success: true, async: data.async }
      } else return { success: false, async: false }
    })
  }

  public RenameFile(userid: string, identity: string, name: string): Promise<IResultAsync> {
    return CALLSixPan(userid, '', 'v3/newfile/rename', '', { identity, name }).then((resp) => {
      const data = ParseJsonData('重命名文件', resp, false)
      if (data && data.hasOwnProperty('identity') && data.hasOwnProperty('data')) {
        return { success: true, async: data.async }
      } else return { success: false, async: false }
    })
  }

  public TrashFile(userid: string, sourceIdentity: string[]): Promise<IResultAsync> {
    return CALLSixPan(userid, '', 'v3/newfile/trash', '', { sourceIdentity }).then((resp) => {
      const data = ParseJsonData('删除文件到回收站', resp, false)
      if (data && data.hasOwnProperty('identity') && data.hasOwnProperty('data')) {
        return { success: true, async: data.async }
      } else return { success: false, async: false }
    })
  }

  public CreatDir(userid: string, parentIdentity: string, dirname: string): Promise<boolean> {
    if (parentIdentity === '6pan-root' || parentIdentity === '') {
      parentIdentity = APIPan.PathToIdentity('/')
    }

    dirname = this.ClearFileName(dirname, false)
    return CALLSixPan(userid, '', 'v3/newfile', '', { parent: parentIdentity, path: dirname }).then((resp) => {
      const data = ParseJsonData('创建文件夹', resp, false)
      if (data && data.hasOwnProperty('identity') && data.hasOwnProperty('path')) {
        return true
      } else return false
    })
  }

  public ClearFileName(name: string, file: boolean) {
    name = name.replace('<', '')
    name = name.replace('>', '')
    name = name.replace('|', '')
    name = name.replace(':', '')
    name = name.replace('*', '')
    name = name.replace('?', '')
    name = name.replace('\\', '/')
    name = name.replace('//', '/')
    name = name.replace('//', '/')
    name = name.replace('..', '.')
    if (file) {
      name = name.replace('/', '')
    }
    return name
  }

  public DownTxt(userid: string, identity: string): Promise<string> {
    return this.DownloadAddress(userid, identity).then((resp) => {
      if (resp) {
        return CALLCommand('DownloadTxt', { downloadAddress: resp.downloadAddress, size: resp.size }).then((resp2) => {
          if (resp2.body) return Promise.resolve(resp2.body)
          return Promise.resolve('预览失败')
        })
      }
      return Promise.resolve('预览失败')
    })
  }

  public PlayFile(link: string) {
    CALLCommand('PlayFile', { link }).then((resp) => {
      const data = ParseJsonData('在线预览视频', resp, false)
      if (data && data.hasOwnProperty('playerpath')) {
        return true
      } else return false
    })
  }

  public DownFile(userid: string, identity: string): Promise<IDownFile> {
    return CALLCommand('DownFile', { userid, identity }).then((resp) => {
      const data = ParseJsonData('下载文件', resp, false)
      if (data && data.hasOwnProperty('filecount')) {
        return Promise.resolve({ isdown: true, filecount: data.filecount })
      }
      return Promise.resolve({ isdown: true, filecount: 0 })
    })
  }

  public UploadFile(userid: string, uploadToPath: string, filemodel: string, fileParentDir: string, fileList: string[]): Promise<IDownFile> {
    return CALLCommand('UploadFile', { userid, uploadToPath, filemodel, fileParentDir, fileList }).then((resp) => {
      const data = ParseJsonData('上传文件', resp, false)
      if (data && data.hasOwnProperty('filecount')) {
        return Promise.resolve({ isdown: true, filecount: data.filecount })
      }
      return Promise.resolve({ isdown: true, filecount: 0 })
    })
  }
}
export default File.Instance
