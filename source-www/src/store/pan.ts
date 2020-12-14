import { store } from './index'
import { StoreUser } from '@/store/user'
import APIPan from '@/api/pan'
import PanHelper from './panhelper'
import { VuexModule, Module, getModule, Mutation, Action } from 'vuex-module-decorators'
import { message } from 'ant-design-vue'
import { StoreUI } from './ui'

export interface IStatePan {
  panRefreshTime: number
  panDirSelected: IDirKeyPath
  panDirList: IDir[]
  panDirSelectedPath: IDirKeyPath[]
  panFileLoading: boolean
  panFileList: IFile[]
  panFileListCount: number
  panLastSavePath: IDirKeyPath
  panLastSearchValue: string
}

export interface IDirKeyPath {
  key: string
  path: string
  name: string
  sep: boolean
  chd: number
}
export interface IDir {
  key: string
  path: string
  name: string
  licon: string
  isLeaf?: boolean
  slots: { title: 'custom' }
  children: IDir[]
}
export interface IFile {
  key: string
  path: string
  name: string
  fileicon: string
  sizestr: string
  sizeint: number
  datestr: string
  dateint: number
  isdir: boolean
  isfromfile: boolean
  isfromlixian: boolean
  isfromhuishouzhan: boolean
  canclick: boolean
  textLink: string
  status: string
  istxt: boolean
  isdoc: boolean
  isimg: boolean
  isaudio: boolean
  isvideo: boolean
  __v_skip: true
}

function RootPath(): IDirKeyPath {
  return { key: '6pan-root', path: '/', name: '根目录', sep: false, chd: 0 }
}

function DefaultDirList(): IDir[] {
  return [
    {
      key: '6pan-lixian',
      path: '6pan-lixian',
      name: '离线任务',
      licon: 'iconcloud',
      isLeaf: true,
      slots: { title: 'custom' },
      children: [],
    },
    {
      key: '6pan-huishouzhan',
      path: '6pan-huishouzhan',
      name: '回收站',
      licon: 'iconrest',
      isLeaf: true,
      slots: { title: 'custom' },
      children: [],
    },
    {
      key: '6pan-search',
      path: '',
      name: '搜索',
      licon: 'iconsearch',
      isLeaf: true,
      slots: { title: 'custom' },
      children: [],
    },
    {
      key: '6pan-root',
      path: '/',
      name: '根目录',
      licon: 'iconhome',
      slots: { title: 'custom' },
      children: [],
    },
  ]
}

@Module({ namespaced: true, name: 'Pan', dynamic: true, store })
class Pan extends VuexModule implements IStatePan {
  public panRefreshTime: number = new Date().getTime() / 1000
  public panDirList: IDir[] = []
  public panDirSelected: IDirKeyPath = RootPath()
  public panDirSelectedPath: IDirKeyPath[] = []

  public panFileLoading: boolean = false
  public panFileList: IFile[] = []
  public panFileListCount: number = 0

  public panLastSavePath: IDirKeyPath = RootPath()
  public panLastSearchValue: string = ''

  @Mutation
  mLoadDir() {
    this.panDirList = DefaultDirList()
    this.panDirSelected = { key: '', path: '', name: '', sep: false, chd: 0 }
    this.panDirSelectedPath = []
    this.panFileList = []
    this.panFileListCount = 0
  }

  @Mutation
  mLastSavePath(dir: IDirKeyPath) {
    this.panLastSavePath = dir
  }

  @Action
  aLoadDir() {
    this.mLoadDir()
    this.mLastSavePath(RootPath())
    this.aSelectDir(RootPath())
  }

  @Mutation
  mSelectDir({ key, path }: { key: string; path: string }) {
    if (key === '6pan-lixian') {
      this.panDirSelectedPath = [{ key, path: key, name: '离线任务', sep: false, chd: 0 }]
      this.panDirSelected = { key, path: key, name: '离线任务', sep: false, chd: 0 }
    } else if (key === '6pan-huishouzhan') {
      this.panDirSelectedPath = [{ key, path: key, name: '回收站', sep: false, chd: 0 }]
      this.panDirSelected = { key, path: key, name: '回收站', sep: false, chd: 0 }
    } else if (key === '6pan-search') {
      this.panDirSelectedPath = [{ key, path, name: '搜索[ ' + path + ' ]', sep: false, chd: 0 }]
      this.panDirSelected = { key, path, name: '搜索[ ' + path + ' ]', sep: false, chd: 0 }
      this.panLastSearchValue = path
    } else if (key === '6pan-root') {
      this.panDirSelectedPath = [{ key, path: '/', name: '根目录', sep: false, chd: 0 }]
      this.panDirSelected = { key, path: '/', name: '根目录', sep: false, chd: 0 }
    } else {
      const pathlist = PanHelper.GetAllParentDir(this.panDirList, path)
      if (pathlist.length > 1) {
        this.panDirSelectedPath = pathlist
        this.panDirSelected = pathlist[pathlist.length - 1]
      }
    }
    if (this.panDirSelected.key === key) {
      this.panFileList = []
      this.panFileListCount = 0
    }
  }

  @Action
  aSelectDir(dir: IDirKeyPath) {
    if (dir.key === this.panDirSelected.key && dir.key !== '6pan-search') return

    let scrolltree = true
    let scrollfile = true
    const refresh = dir.key === 'refresh'

    if (dir.key === '6pan-search') {
      scrolltree = false
      if (refresh) return
      if (dir.path === '') {
        dir.path = this.panLastSearchValue
        dir.name = '搜索[ ' + dir.path + ' ]'
      }
    } else if (dir.key === 'parent') {
      scrolltree = false
      scrollfile = false
      if (this.panDirSelected.key === '6pan-search') {
        dir.key = '6pan-search'
        dir.path = this.panLastSearchValue
        dir.name = '搜索[ ' + dir.path + ' ]'
      } else {
        let parentdirpath = dir.path
        if (parentdirpath.lastIndexOf('/') >= 0) parentdirpath = parentdirpath.substring(0, parentdirpath.lastIndexOf('/'))
        const f = PanHelper.GetDirByPath(this.panDirList, parentdirpath)
        if (!f) return
        dir.key = f.key
        dir.path = f.path
        dir.name = f.name
      }
    } else if (dir.key === 'refresh') {
      scrolltree = false
      scrollfile = false
      dir.key = this.panDirSelected.key
      dir.path = this.panDirSelected.path
      dir.name = this.panDirSelected.name
    }

    if (scrollfile) {
      const d = document.getElementById('fileitemlist')
      if (d) d.scrollTop = 0
    }
    this.mSelectDir({ key: dir.key, path: dir.path })
    this.aLoadFileList({ dir, scrolltree })
  }

  @Action
  aRefreshDir() {
    this.aSelectDir({ key: 'refresh', path: 'refresh', name: 'refresh', sep: false, chd: 0 })
  }

  @Action
  aModalSelectDir(dir: IDirKeyPath) {
    const userid = StoreUser.UserSelected.key
    if (userid === 'add') return

    const getdir = PanHelper.GetDirByPath(this.panDirList, dir.path)
    if (getdir !== undefined) getdir.licon = 'loading'
    APIPan.LoadFileList(userid, dir.key, dir.path).then((filelist) => {
      if (getdir !== undefined) getdir.licon = 'iconfolder'
      this.mLoadPanFileList({ key: dir.key, filelist })
      this.mLoadPanDirList({ scrolltree: false, key: dir.key, path: dir.path, filelist })
    })
  }

  @Mutation
  mLoadingFile({ path, loading }: { path: string; loading: boolean }) {
    this.panFileLoading = loading
    const dir = PanHelper.GetDirByPath(this.panDirList, path)
    if (dir !== undefined) dir.licon = loading ? 'loading' : 'iconfolder'
  }
  @Mutation
  mLoadPanFileList({ key, filelist }: { key: string; filelist: IFile[] }) {
    if (key !== this.panDirSelected.key) return
    this.panRefreshTime = new Date().getTime() / 1000
    this.panFileList = filelist
    this.panFileListCount = filelist.length
  }

  @Mutation
  mLoadPanDirList({ scrolltree, key, path, filelist }: { scrolltree: boolean; key: string; path: string; filelist: IFile[] }) {
    if (scrolltree && key !== this.panDirSelected.key) return
    if (key === '6pan-lixian' || key === '6pan-huishouzhan' || key === '6pan-search') return

    const f = PanHelper.GetDirByPath(this.panDirList, path)
    if (!f) return

    const child: IDir[] = []
    const LEN = filelist.length
    for (let i = 0; i < LEN; i++) {
      const item = filelist[i]
      if (item.isdir) {
        const m: IDir = {
          key: item.key,
          path: item.path,
          name: item.name,
          licon: 'iconfolder',
          slots: { title: 'custom' },
          children: [],
        }
        child.push(m)
      }
    }
    let needdel = f.children.length !== child.length
    if (f.children.length > 0 && needdel === false) {
      let a1, a2
      for (let i = 0; i < child.length; i++) {
        a1 = f.children[i]
        a2 = child[i]
        if (a1.key !== a2.key || a1.name !== a2.name || a1.path !== a2.path) {
          needdel = true
          break
        }
      }
    }
    if (needdel) {
      if (f.children.length > 0) f.children.splice(0, f.children.length)
      for (let i = 0; i < child.length; i++) {
        f.children.splice(f.children.length, 0, child[i])
      }
    }
    if (scrolltree) {
      setTimeout(
        (fid: string) => {
          const tree = document.getElementById('dirtreeparent')
          const row = document.getElementById(fid)
          if (tree && row) {
            if (tree.scrollTop > row.offsetTop - 32) tree.scrollTop = row.offsetTop - 114 - 32
            if (tree.scrollTop + tree.offsetHeight < row.offsetTop) tree.scrollTop = row.offsetTop - tree.offsetHeight + 64
          }
        },
        600,
        f.key
      )
    }
  }
  @Action
  async aLoadFileList({ dir, scrolltree }: { dir: IDirKeyPath; scrolltree: boolean }) {
    const userid = StoreUser.UserSelected.key
    if (userid === 'add') {
      message.error('请先登录一个6盘账号')
      return
    }
    this.mLoadingFile({ path: dir.path, loading: true })

    if (dir.key !== '6pan-search' && dir.path.startsWith('/')) {
      let parentpath = dir.path.trim()
      if (parentpath.endsWith('/')) parentpath = parentpath.substr(0, parentpath.length - 1)
      if (parentpath.lastIndexOf('/') >= 0) parentpath = parentpath.substr(0, parentpath.lastIndexOf('/'))
      if (parentpath !== '') {
        const parentpathlist = PanHelper.GetAllParentDirPath(parentpath)
        const parentpathdir = PanHelper.GetAllParentDir(this.panDirList, parentpath)
        const plen = parentpathlist.length - 1
        const dlen = parentpathdir.length
        let ppath = '/'
        for (let p = 0; p < plen; p++) {
          if (ppath.endsWith('/') === false) ppath = ppath + '/'
          ppath = ppath + parentpathlist[p]
          if (dlen > p && parentpathdir[p].path === ppath && parentpathdir[p].chd > 0) continue
          await APIPan.LoadFileList(userid, '', ppath).then((filelist) => {
            this.mLoadPanDirList({ scrolltree: false, key: APIPan.PathToIdentity(ppath), path: ppath, filelist })
          })
        }
      }
    }

    await APIPan.LoadFileList(userid, dir.key, dir.path).then((filelist) => {
      this.mSelectDir({ key: dir.key, path: dir.path })
      this.mLoadPanFileList({ key: dir.key, filelist })
      this.mLoadPanDirList({ scrolltree, key: dir.key, path: dir.path, filelist })
    })

    this.mLoadingFile({ path: dir.path, loading: false })
  }

  @Action
  aRefreshPanByTimer() {
    if (StoreUI.PageName !== '/6pan') return
    const dir = this.panDirSelected
    const userid = StoreUser.UserSelected.key
    if (userid === 'add') return

    const subtime = new Date().getTime() / 1000 - this.panRefreshTime

    if (dir.key === '6pan-lixian') {
      if (subtime < 4) return
    } else if (dir.key === '6pan-huishouzhan') {
      if (subtime < 10) return
    } else if (dir.key === '6pan-search') {
      return
    } else if (subtime < 40) {
      return
    }
    APIPan.LoadFileList(userid, dir.key, dir.path).then((filelist) => {
      this.mLoadPanFileList({ key: dir.key, filelist })
      this.mLoadPanDirList({ scrolltree: false, key: dir.key, path: dir.path, filelist })
    })
  }
}

export const StorePan = getModule(Pan)
