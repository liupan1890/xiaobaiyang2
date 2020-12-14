import { IFile } from '@/store/pan'
import Offline from './offline'
import Trash from './trash'
import File from './file'
import md5 from 'md5'
export interface IResultAsync {
  success: boolean
  async: boolean
}
class Pan {
  public static readonly Instance: Pan = new Pan()

  public PathToIdentity(path: string): string {
    if (path === '') return ''
    path = path.trim()
    if (path.endsWith('/')) path = path.substr(0, path.length - 1)
    if (path.startsWith('/') === false) path = '/' + path
    return md5(path)
  }

  public LoadFileList(userid: string, dirkey: string, dirpath: string): Promise<IFile[]> {
    if (dirkey === '6pan-search') {
      return File.LoadFileListSearch(userid, dirpath)
    } else if (dirkey === '6pan-lixian') {
      return Offline.LoadFileList(userid)
    } else if (dirkey === '6pan-huishouzhan') {
      return Trash.LoadFileList(userid)
    } else {
      if (dirpath === '/') dirkey = '6pan-root'
      if (dirkey === '' && dirpath === '') {
        dirkey = '6pan-root'
        dirpath = '/'
      }
      if (dirkey === '') {
        dirkey = this.PathToIdentity(dirpath)
      }
      return File.LoadFileList(userid, dirpath)
    }
  }
}

export default Pan.Instance
