import { store } from './index'
import APIConfig from '@/api/config'
import { VuexModule, Module, getModule, Mutation, Action } from 'vuex-module-decorators'
import { StoreUI } from './ui'

export interface IStateConfig {
  ServerConfig: IConfig
  UserSetting: ISetting
  ConfigRefreshTime: number
  ShowVerUpdate: number
}
export interface IConfig {
  LocalExeVer: string
  ServerExeVer: string
  ServerExeVerUrl: string
  LocalUIVer: string
  ServerUIVer: string
  ServerUIVerUrl: string
  ServerWebDav: string
  SixPanDownAgent: string
  SixPanApiAgent: string
  SixPanApiUrl: string
  SixPanAccountUrl: string
  SixPanUploadUrl: string
}

export interface ISetting {
  [key: string]: string | boolean
  PlayerPath: string
  SavePath: string
  SavePathEveryTime: boolean
  RemotePassword: string
  TaskCountMax: string
  ThreadCountMax: string
  RunDownFinish: boolean
  UseVipVideoUrl: boolean
}

@Module({ namespaced: true, name: 'Config', dynamic: true, store })
class Config extends VuexModule implements IStateConfig {
  public ServerConfig: IConfig = {
    LocalExeVer: '2.2.0.0',
    ServerExeVer: '',
    ServerExeVerUrl: '',
    LocalUIVer: '',
    ServerUIVer: '',
    ServerUIVerUrl: '',
    ServerWebDav: '',
    SixPanDownAgent: '',
    SixPanApiAgent: '',
    SixPanApiUrl: 'https://api.2dland.cn/',
    SixPanAccountUrl: 'https://account.2dland.cn/',
    SixPanUploadUrl: 'https://2dland.cn',
  }
  public UserSetting: ISetting = {
    PlayerPath: '',
    SavePath: '',
    SavePathEveryTime: false,
    RemotePassword: '',
    TaskCountMax: '3',
    ThreadCountMax: '10',
    RunDownFinish: false,
    UseVipVideoUrl: false,
  }

  public ConfigRefreshTime: number = new Date().getTime() / 1000
  public ShowVerUpdate: number = 0

  @Mutation
  mUpdateSetting({ key, value }: { key: string; value: string | boolean }) {
    this.UserSetting[key] = value
  }

  @Action
  aUpdateSetting({ key, value }: { key: string; value: string | boolean }) {
    return APIConfig.UpdateSetting({ key, value })
      .then((result) => {
        if (result === 'success') this.mUpdateSetting({ key, value })
      })
      .catch(() => {})
  }

  @Mutation
  mRefreshSetting(data: any) {
    this.UserSetting = data as ISetting
  }

  @Mutation
  mRefreshConfig(data: any) {
    this.ConfigRefreshTime = new Date().getTime() / 1000
    this.ServerConfig = data as IConfig
  }
  @Mutation
  mRefreshVerUpdate() {
    this.ShowVerUpdate++
  }

  @Action
  aRefresh(): Promise<void> {
    return APIConfig.LoadConfig()
      .then((data) => {
        if (data && data.config && data.setting) {
          this.mRefreshConfig(data.config)
          this.mRefreshSetting(data.setting)
          document.title = '6盘小白羊版 v' + this.ServerConfig.LocalUIVer
          if (data.config.ServerExeVer !== '' && data.config.ServerExeVer !== data.config.LocalExeVer) {
            if (this.ShowVerUpdate < 1) {
              this.mRefreshVerUpdate()
              StoreUI.mShowModal({ ModalName: 'verupdate' })
            }
          }
        } else if (data && data.message === '远程管理密码错误') {
          StoreUI.mShowModal({ ModalName: 'remotepassword' })
        }
      })
      .catch(() => {})
  }

  @Action
  aRefreshConfigByTimer() {
    const subtime = new Date().getTime() / 1000 - this.ConfigRefreshTime
    if (subtime > 60) {
      this.aRefresh()
    }
  }
}

export const StoreConfig = getModule(Config)
