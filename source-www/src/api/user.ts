import { IUserInfo, IUserLogin, DefaultUser, IUserLoginResult } from '@/store/user'
import { CALLCommand, ParseJsonData, CALLSixPan, GetLoginHead } from '@/api/axios'
import md5 from 'md5'

class User {
  public static readonly Instance: User = new User()

  public GetUserList(): Promise<IUserInfo[] | undefined> {
    return CALLCommand('LoadUserList', '').then((resp) => {
      const data = ParseJsonData('拉取用户列表', resp, false)
      if (data && data.userlist) return data.userlist
      return undefined
    })
  }

  public AddUser(login: IUserLogin): Promise<IUserLoginResult> {
    return CALLCommand('AddUser', { ...login }).then((resp) => {
      const data = ParseJsonData('账号登录', resp, false)
      if (data && data.userid) {
        return this.GetUserInfo(data.userid, data.loginHead).then(() => {
          return Promise.resolve({ userid: data.userid, loginHead: data.loginHead } as IUserLoginResult)
        })
      } else {
        return Promise.resolve({ userid: '', loginHead: '' } as IUserLoginResult)
      }
    })
  }

  public ReLogin(userid: string): Promise<IUserLoginResult> {
    return CALLCommand('ReLogin', { userid }).then((resp) => {
      const data = ParseJsonData('账号登录状态失效', resp, false)
      if (data && data.userid) {
        return Promise.resolve({ userid: data.userid, loginHead: data.loginHead } as IUserLoginResult)
      } else {
        return Promise.resolve({ userid: '', loginHead: '' } as IUserLoginResult)
      }
    })
  }

  public GetUserInfo(userid: string, loginHead: string): Promise<IUserInfo | undefined> {
    return CALLSixPan(userid, loginHead, 'v3/user/info', '', { ts: new Date().getTime() / 1000 }).then((resp) => {
      const data = ParseJsonData('拉取用户信息', resp, false)
      if (data) {
        const user = DefaultUser(data)
        user.loginHead = loginHead ? loginHead : GetLoginHead(userid)
        return CALLCommand('UserSave', user).then(() => {
          return user
        })
      }
      return undefined
    })
  }

  public DeleteUser(userid: string): Promise<void> {
    CALLSixPan(userid, '', 'v3/user/logout', '', '')
    return CALLCommand('UserDelete', { userid }).then((resp) => {
      ParseJsonData('删除用户', resp, true)
    })
  }

  public EditUserName(userid: string, name: string): Promise<void> {
    return CALLSixPan(userid, '', 'v3/user/update', '', { name }).then((resp) => {
      ParseJsonData('修改用户名', resp, true)
    })
  }

  public EditUserPassword(userid: string, oldPassword: string, newPassword: string): Promise<void> {
    oldPassword = md5(oldPassword)
    newPassword = md5(newPassword)

    return CALLSixPan(userid, '', 'v3/user/changePassword', '', { oldPassword, newPassword }).then((resp) => {
      const data = ParseJsonData('修改用户密码', resp, true)
      if (data.code === 0) {
        CALLCommand('EditUserPassword', { userid, newPassword })
      }
    })
  }
}

export default User.Instance
