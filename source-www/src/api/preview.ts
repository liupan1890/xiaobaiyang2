import { ParseJsonData, CALLSixPan } from '@/api/axios'
export interface IResultAsync {
  success: boolean
  async: boolean
}
class Preview {
  public static readonly Instance: Preview = new Preview()

  public PreviewVideo(userid: string, identity: string): Promise<string | undefined> {
    return CALLSixPan(userid, '', 'v3/preview/video', '', { identity }).then((resp) => {
      const data = ParseJsonData('', resp, false)
      if (data && data.hasOwnProperty('playAddress')) {
        return data.playAddress === '' ? undefined : data.playAddress
      } else return undefined
    })
  }

  public PreviewAudio(userid: string, identity: string): Promise<string | undefined> {
    return CALLSixPan(userid, '', 'v3/preview/audio', '', { identity }).then((resp) => {
      const data = ParseJsonData('', resp, false)
      if (data && data.hasOwnProperty('playAddress')) {
        return data.playAddress === '' ? undefined : data.playAddress
      } else return undefined
    })
  }

  public PreviewImage(userid: string, identity: string): Promise<string | undefined> {
    return CALLSixPan(userid, '', 'v3/preview/image', '', { identity }).then((resp) => {
      const data = ParseJsonData('', resp, false)
      if (data && data.hasOwnProperty('playAddress')) {
        return data.playAddress === '' ? undefined : data.playAddress
      } else return undefined
    })
  }

  public PreviewDocument(userid: string, identity: string): Promise<string | undefined> {
    return CALLSixPan(userid, '', 'v3/preview/document', '', { identity }).then((resp) => {
      const data = ParseJsonData('', resp, false)
      if (data && data.hasOwnProperty('playAddress')) {
        return data.playAddress === '' ? undefined : data.playAddress
      } else return undefined
    })
  }

  public PreviewScreenshot(userid: string, identity: string, duration: number): Promise<string | undefined> {
    return CALLSixPan(userid, '', 'v3/preview/screenshot', '', { identity, duration }).then((resp) => {
      const data = ParseJsonData('', resp, false)
      if (data && data.hasOwnProperty('downloadAddress')) {
        return data.downloadAddress === '' ? undefined : data.downloadAddress
      } else return undefined
    })
  }
}
export default Preview.Instance
