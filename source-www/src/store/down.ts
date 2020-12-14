import { store } from './index'
import { StoreUser } from './user'
import APIDown from '@/api/down'
import { VuexModule, Module, getModule, Mutation, Action } from 'vuex-module-decorators'
import { IDir } from './pan'
import { StoreUI } from './ui'

export interface IStateDown {
  downSelectedPage: string
  downFileList: IDownItem[]
  downFileCount: number
  downFileLoading: boolean
  downRefreshTime: number
}

export interface IDownItem {
  key: string
  name: string
  path: string
  sizestr: string
  progress: number
  speedstr: string
  active: boolean
  savepath: string
  fileicon: string
  error: string
  info: string
  server: string
  __v_skip: true
}

@Module({ namespaced: true, name: 'Down', dynamic: true, store })
class Down extends VuexModule implements IStateDown {
  public downSelectedPage: string = 'downing'
  public downFileList: IDownItem[] = []
  public downFileCount: number = 0
  public downFileLoading: boolean = false
  public downRefreshTime: number = new Date().getTime() / 1000

  public treeData: IDir[] = [
    {
      name: '正在下载中',
      key: 'downing',
      path: 'downing',
      licon: 'icondownload',
      isLeaf: true,
      slots: { title: 'custom' },
      children: [],
    },
    {
      name: '已下载的文件',
      key: 'downed',
      path: 'downed',
      licon: 'icondesktop',
      isLeaf: true,
      slots: { title: 'custom' },
      children: [],
    },
    {
      name: '正在上传中',
      key: 'uploading',
      path: 'uploading',
      licon: 'iconupload',
      isLeaf: true,
      slots: { title: 'custom' },
      children: [],
    },
    {
      name: '已上传的文件',
      key: 'upload',
      path: 'upload',
      licon: 'iconcloud',
      isLeaf: true,
      slots: { title: 'custom' },
      children: [],
    },
  ]

  @Mutation
  mLoadingFile(loading: boolean) {
    this.downFileLoading = loading
  }

  @Mutation
  mLoadDown({ downpage, filecount, filelist }: { downpage: string; filecount: number; filelist: IDownItem[] }) {
    if (this.downSelectedPage !== downpage) return
    this.downRefreshTime = new Date().getTime() / 1000
    this.downFileList = filelist
    this.downFileCount = filecount
  }

  @Mutation
  mSelectDown(downkey: string) {
    this.downSelectedPage = downkey
    this.downFileList = []
    this.downFileCount = 0
  }

  @Action
  aSelectDown(downpage: string) {
    if (downpage === 'refresh') downpage = this.downSelectedPage
    if (downpage !== 'downing' && downpage !== 'downed' && downpage !== 'upload' && downpage !== 'uploading') return
    if (downpage !== this.downSelectedPage) this.mSelectDown(downpage)
    this.mLoadingFile(true)
    APIDown.DownList(downpage).then((resp) => {
      this.mLoadingFile(false)
      if (resp) {
        this.mLoadDown({ downpage, filecount: resp.filecount, filelist: resp.filelist })
      }
    })
  }

  @Action
  aRefreshDownByTimer() {
    if (StoreUI.PageName !== '/down') return
    if (StoreUser.UserSelected.key === 'add') return
    const downpage = this.downSelectedPage

    const subtime = new Date().getTime() / 1000 - this.downRefreshTime
    if (downpage === 'downing') {
      //downing
    } else if (downpage === 'downed' && subtime < 4) {
      return
    } else if (downpage === 'uploading') {
      //uploading
    } else if (downpage === 'upload' && subtime < 4) {
      return
    }
    APIDown.DownList(downpage).then((resp) => {
      this.mLoadingFile(false)
      if (resp) {
        this.mLoadDown({ downpage, filecount: resp.filecount, filelist: resp.filelist })
      }
    })
  }
}

export const StoreDown = getModule(Down)
