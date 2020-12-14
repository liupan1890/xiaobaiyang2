import { store } from './index'
import { StorePan } from '@/store/pan'
import APIUser from '@/api/user'
import { VuexModule, Module, getModule, Mutation, Action } from 'vuex-module-decorators'
import { FormatDate, FormatSize } from '@/utils/Format'

export interface IUserInfo {
  key: string
  username: string
  countryCode: string
  phone: string
  email: string
  isvip: boolean
  vipdate: string
  panused: string
  createTime: number
  password: string
  salt: string
  loginHead: string
}

export interface IUserLogin {
  mode: string
  country: string
  phone: string
  name: string
  password: string
  cookie: string
}

export interface IUserLoginResult {
  userid: string
  loginHead: string
}

export function DefaultUser(user: any): IUserInfo {
  if (user && user.identity) {
    return {
      key: '' + user.identity,
      username: user.name,
      countryCode: user.countryCode,
      phone: user.phone,
      email: user.email,
      createTime: user.createTime,
      password: user.password,
      salt: user.salt,
      isvip: user.vip > 0,
      vipdate: FormatDate(new Date(user.vipExpireTime), 'YYYY-MM-DD'),
      panused: FormatSize(user.spaceUsed),
      loginHead: '',
    }
  }
  return {
    key: 'add',
    username: '添加一个6盘账号',
    countryCode: '',
    phone: '',
    email: '',
    password: '',
    isvip: false,
    vipdate: '',
    createTime: new Date().getTime(),
    salt: '',
    panused: '',
    loginHead: '',
  }
}

export interface IStateUser {
  UserSelected: IUserInfo
  UserList: IUserInfo[]
  UserRefreshTime: number
}

@Module({ namespaced: true, name: 'User', dynamic: true, store })
class User extends VuexModule implements IStateUser {
  public UserSelected: IUserInfo = DefaultUser(undefined)
  public UserList: IUserInfo[] = []
  public UserRefreshTime: number = new Date().getTime() / 1000

  @Mutation
  mLoadUserList(respUserList: IUserInfo[]): void {
    this.UserList = respUserList
  }

  @Action
  aLoadUserList(userid: string) {
    APIUser.GetUserList()
      .then((userlist) => {
        if (userlist && userlist !== undefined) {
          this.mLoadUserList(userlist)
          this.aSelectUser(userid)
        }
      })
      .catch(() => {})
  }

  @Mutation
  mSelectUser(userid: string) {
    if (userid === '') {
      if (this.UserSelected.key === 'add' && this.UserList.length > 0) {
        this.UserSelected = this.UserList[0]
      }
      return
    }
    if (userid === 'add') {
      this.UserSelected = DefaultUser(undefined)
      return
    }
    for (const item of this.UserList) {
      if (item.key === userid) {
        this.UserSelected = item
        return
      }
    }
  }

  @Action
  async aSelectUser(userid: string) {
    this.mSelectUser(userid)
    if (userid !== '' && userid !== 'add') {
      await this.aRefreshUser({ userid, loginHead: '' })
        .then((result) => {
          if (result) this.mSelectUser(userid)
        })
        .catch(() => {})
    }
    StorePan.aLoadDir()
  }

  @Mutation
  mRefreshUser(user: IUserInfo) {
    this.UserRefreshTime = new Date().getTime() / 1000
    if (this.UserSelected.key === user.key) {
      this.UserSelected = user
    }
    for (let i = 0; i < this.UserList.length; i++) {
      if (this.UserList[i].key === user.key) {
        this.UserList[i] = user
        break
      }
    }
  }

  @Action
  aRefreshUser({ userid, loginHead }: { userid: string; loginHead: string }): Promise<boolean> {
    if (userid === 'add') return Promise.resolve(false)
    if (userid === '' && loginHead === '') return Promise.resolve(false)

    return APIUser.GetUserInfo(userid, loginHead)
      .then((user) => {
        if (user && user !== undefined) {
          this.mRefreshUser(user)
          return true
        } else return false
      })
      .catch(() => {
        return false
      })
  }

  @Mutation
  mDeleteUser(userid: string) {
    for (let i = 0; i < this.UserList.length; i++) {
      if (this.UserList[i].key === userid) {
        this.UserList.splice(i, 1)
        break
      }
    }
    if (this.UserSelected.key === userid) {
      if (this.UserList.length > 0) {
        this.UserSelected = this.UserList[0]
      } else this.UserSelected = DefaultUser(undefined)
    }
  }

  @Action
  aDeleteUser(userid: string) {
    APIUser.DeleteUser(userid)
      .then(() => {
        this.mDeleteUser(userid)
        this.aLoadUserList(this.UserSelected.key)
      })
      .catch(() => {})
  }

  @Action
  aAddUser(login: IUserLogin): Promise<string> {
    return APIUser.AddUser(login)
      .then((result: IUserLoginResult) => {
        if (result.userid !== '') {
          this.aLoadUserList(result.userid)
          return Promise.resolve('success')
        } else {
          return Promise.resolve('账号登录失败')
        }
      })
      .catch(() => {
        return Promise.resolve('未知错误')
      })
  }

  @Action
  aEditUserName({ userid, username }: { userid: string; username: string }): Promise<void> {
    return APIUser.EditUserName(userid, username)
      .then(() => {
        this.aRefreshUser({ userid, loginHead: '' })
      })
      .catch(() => {})
  }

  @Action
  aEditUserPassword({ userid, password, newpassword }: { userid: string; password: string; newpassword: string }): Promise<void> {
    return APIUser.EditUserPassword(userid, password, newpassword)
      .then(() => {
        this.aRefreshUser({ userid, loginHead: '' })
      })
      .catch(() => {})
  }

  @Action
  aRefreshUserByTimer() {
    const subtime = new Date().getTime() / 1000 - this.UserRefreshTime
    if (subtime > 60) {
      this.aRefreshUser({ userid: this.UserSelected.key, loginHead: '' })
    }
  }
}
export const StoreUser = getModule(User)
