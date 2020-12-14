import { CALLCommand, ParseJsonData } from '@/api/axios'

class Config {
  public static readonly Instance: Config = new Config()

  public LoadConfig(): Promise<any> {
    return CALLCommand('LoadSetting', '').then((resp) => {
      const data = ParseJsonData('拉取用户设置', resp, false)
      if (data && data.setting && data.config) return data
      return data
    })
  }

  public UpdateSetting({ key, value }: { key: string; value: string | boolean }): Promise<string> {
    return CALLCommand('UpdateSetting', { key, value }).then((resp) => {
      const data = ParseJsonData('保存用户设置', resp, true)
      if (data && data.code === 0) return 'success'
      return data.message
    })
  }
}

export default Config.Instance
