import { CALLCommand, ParseJsonData } from '@/api/axios'
import { IRSS, IRSSItem, IRSSItemContent } from '@/store/rss'

class Rss {
  public static readonly Instance: Rss = new Rss()

  public LoadRssList(): Promise<IRSS[] | undefined> {
    return CALLCommand('LoadRssList', '').then((resp) => {
      const data = ParseJsonData('拉取Rss数据', resp, false)
      if (data && data.rsslist) return data.rsslist
      return undefined
    })
  }

  public LoadRssItemList(rsskey: string): Promise<IRSSItem[] | undefined> {
    return CALLCommand('LoadRssItemList', { rsskey }).then((resp) => {
      const data = ParseJsonData('拉取RssItemList数据', resp, false)
      if (data && data.rssitemlist) return data.rssitemlist
      return undefined
    })
  }

  public LoadRssItemListSearch(searchkey: string): Promise<IRSSItem[] | undefined> {
    return CALLCommand('LoadRssItemListSearch', { searchkey }).then((resp) => {
      const data = ParseJsonData('拉取RssItemList数据', resp, false)
      if (data && data.rssitemlist) return data.rssitemlist
      return undefined
    })
  }

  public LoadRssItemContent(rssitemkey: string): Promise<IRSSItemContent | undefined> {
    return CALLCommand('LoadRssItemContent', { rssitemkey }).then((resp) => {
      const data = ParseJsonData('拉取RssItemContent数据', resp, false)
      if (data && data.rssitemcontent) return data.rssitemcontent
      return undefined
    })
  }
}

export default Rss.Instance
