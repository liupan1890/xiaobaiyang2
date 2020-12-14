import { IDir, IDirKeyPath } from './pan'

class PanHelper {
  public static readonly Instance: PanHelper = new PanHelper()

  public GetDirByPath(panDirList: IDir[], dirpath: string): IDir | undefined {
    if (dirpath.endsWith('/') === false) dirpath = dirpath + '/'
    const _FilePath = function (list: IDir[], path: string): IDir | undefined {
      if (!list) return undefined
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        let itempath = item.path
        if (itempath.endsWith('/') === false) itempath = itempath + '/'
        if (itempath === path) return item
        if (path.startsWith(itempath) && item.children && item.children.length > 0) {
          return _FilePath(item.children, path)
        }
      }
      return undefined
    }
    return _FilePath([panDirList[panDirList.length - 1]], dirpath)
  }

  public GetParentDirByPath(panDirList: IDir[], dirpath: string): IDir | undefined {
    if (dirpath.endsWith('/')) dirpath = dirpath.substr(0, dirpath.length - 1)
    dirpath = dirpath.substr(0, dirpath.lastIndexOf('/'))
    if (dirpath === '') dirpath = '/'
    return this.GetDirByPath(panDirList, dirpath)
  }

  public GetAllParentDirPath(dirpath: string): string[] {
    if (!dirpath) return ['']
    if (dirpath.endsWith('/') === false) dirpath = dirpath + '/'
    return dirpath.split('/')
  }

  public GetAllParentDir(panDirList: IDir[], dirpath: string): IDirKeyPath[] {
    const path: IDirKeyPath[] = []
    if (dirpath.endsWith('/') === false) dirpath = dirpath + '/'
    const _FilePath = function (path: IDirKeyPath[], list: IDir[], dirpath: string) {
      if (!list) return
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        let itempath = item.path
        if (itempath.endsWith('/') === false) itempath = itempath + '/'
        if (dirpath.startsWith(itempath)) {
          path.push({ key: item.key, path: item.path, name: item.name, sep: dirpath !== itempath, chd: item.children ? item.children.length : 0 })
          if (item.children && item.children.length > 0) {
            _FilePath(path, item.children, dirpath)
          }
        }
      }
    }
    _FilePath(path, [panDirList[panDirList.length - 1]], dirpath)
    return path
  }
}

export default PanHelper.Instance
