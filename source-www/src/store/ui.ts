import { store } from './index'
import { VuexModule, Module, getModule, Mutation } from 'vuex-module-decorators'

export interface IStateUI {
  PageName: string
  Loading: boolean
  Modal: IModal
  WinSize: IWinSize
}

export interface IModal {
  ModalName: string
  ModalData?: any
}

export interface IWinSize {
  width: number
  height: number
}

@Module({ namespaced: true, name: 'UI', dynamic: true, store })
class UI extends VuexModule implements IStateUI {
  public PageName: string = '/6pan'
  public Loading: boolean = false
  public Modal: IModal = { ModalName: '', ModalData: null }
  public WinSize: IWinSize = { width: 0, height: 0 }

  @Mutation
  mGotoPage(pagename: string) {
    this.PageName = pagename
  }

  @Mutation
  mLoading(loading: boolean) {
    this.Loading = loading
  }

  @Mutation
  mShowModal(modal: IModal) {
    this.Modal = modal
  }

  @Mutation
  mCloseModal() {
    this.Modal = { ModalName: '' }
  }

  @Mutation
  mWinSize(size: IWinSize) {
    this.WinSize = size
  }
}

export const StoreUI = getModule(UI)
