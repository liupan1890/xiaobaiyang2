import { store } from './index'
import { VuexModule, Module, getModule, Mutation, Action } from 'vuex-module-decorators'
import APIRss from '@/api/rss'

export interface IStateRSS {
  RssSelected: IRSS
  RssList: IRSS[]
  RssLoading: boolean
  RssItemList: IRSSItem[]
  RssItemLoading: boolean
  RssItemSelected: IRSSItem
  RssItemContentSelected: IRSSItemContent
  RssItemContentLoading: boolean
}

export interface IRSS {
  key: string
  name: string
  url: string
  licon: string
  isActive: boolean
  isLeaf?: boolean
  slots: { title: 'custom' }
  children: IRSS[]
}

export interface IRSSItem {
  key: string
  name: string
  url: string
  days: string
  LinkBT: number
  LinkED: number
  LinkBD: number
}
export interface IRSSItemContent {
  key: string
  contenthtml: string
}

@Module({ namespaced: true, name: 'RSS', dynamic: true, store })
class RSS extends VuexModule implements IStateRSS {
  public RssSelected: IRSS = { key: '', name: '', url: '', licon: '', isLeaf: true, isActive: true, children: [], slots: { title: 'custom' } }
  public RssList: IRSS[] = []
  public RssLoading: boolean = false
  public RssItemList: IRSSItem[] = []
  public RssItemLoading: boolean = false
  public RssItemSelected: IRSSItem = { key: '', name: '', url: '', days: '', LinkBT: 0, LinkED: 0, LinkBD: 0 }
  public RssItemContentSelected: IRSSItemContent = { key: '', contenthtml: '' }
  public RssItemContentLoading: boolean = false
  public FirstLoad: boolean = true

  public RssRefreshTime: number = new Date().getTime() / 1000
  @Action
  aLoadRssList() {
    this.mLoadingRss(true)
    APIRss.LoadRssList()
      .then((rsslist) => {
        this.mLoadingRss(false)
        if (rsslist && rsslist !== undefined) {
          this.mLoadRssList(rsslist)
          if (this.FirstLoad) {
            this.aSelectRss(rsslist[0].key)
          }
        }
      })
      .catch(() => {
        this.mLoadingRss(false)
      })
  }
  @Mutation
  mLoadRssList(rsslist: IRSS[]) {
    this.RssRefreshTime = new Date().getTime() / 1000
    for (let i = 0; i < rsslist.length; i++) {
      rsslist[i].slots = { title: 'custom' }
      if (rsslist[i].children) {
        const chdlist = rsslist[i].children
        for (let j = 0; j < chdlist.length; j++) {
          chdlist[j].slots = { title: 'custom' }
        }
      }
    }
    this.RssList = rsslist
  }
  @Mutation
  mLoadingRss(loading: boolean) {
    this.RssLoading = loading
  }

  @Action
  aSelectRss(key: string) {
    this.mLoadingRssItemList(true)
    APIRss.LoadRssItemList(key)
      .then((rssitemlist) => {
        this.mLoadingRssItemList(false)
        if (rssitemlist && rssitemlist !== undefined) {
          this.mLoadRssItemList({ key, rssitemlist })
        }
      })
      .catch(() => {
        this.mLoadingRssItemList(false)
      })
  }
  @Mutation
  mLoadRssItemList({ key, rssitemlist }: { key: string; rssitemlist: IRSSItem[] }) {
    for (let i = 0; i < this.RssList.length; i++) {
      if (this.RssList[i].key === key) {
        this.RssSelected = this.RssList[i]
        this.RssItemList = rssitemlist
        this.FirstLoad = false
      }
    }
  }
  @Mutation
  mLoadingRssItemList(loading: boolean) {
    this.RssItemLoading = loading
  }

  @Action
  aSelectRssItem(key: string) {
    this.mLoadingRssItemContent(true)
    APIRss.LoadRssItemContent(key)
      .then((content) => {
        this.mLoadingRssItemContent(false)
        if (content && content !== undefined) {
          this.mLoadRssItemContent({ key, content })
        }
      })
      .catch(() => {
        this.mLoadingRssItemContent(false)
      })
  }

  @Mutation
  mLoadRssItemContent({ key, content }: { key: string; content: IRSSItemContent }) {
    for (let i = 0; i < this.RssItemList.length; i++) {
      if (this.RssItemList[i].key === key) {
        this.RssItemSelected = this.RssItemList[i]
        this.RssItemContentSelected = content
      }
    }
  }
  @Mutation
  mLoadingRssItemContent(loading: boolean) {
    this.RssItemContentLoading = loading
  }

  @Action
  aSearchRss(searchkey: string) {
    this.mLoadingRssItemList(true)
    APIRss.LoadRssItemListSearch(searchkey)
      .then((rssitemlist) => {
        this.mLoadingRssItemList(false)
        if (rssitemlist && rssitemlist !== undefined) {
          this.mLoadRssItemListSearch({ searchkey, rssitemlist })
        }
      })
      .catch(() => {
        this.mLoadingRssItemList(false)
      })
  }
  @Mutation
  mLoadRssItemListSearch({ searchkey, rssitemlist }: { searchkey: string; rssitemlist: IRSSItem[] }) {
    this.RssSelected = { key: 'search', name: '搜索 ' + searchkey, url: '', licon: '', isActive: false, slots: { title: 'custom' }, children: [] }
    this.RssItemList = rssitemlist
  }

  @Action
  aRefreshRssByTimer() {
    const subtime = new Date().getTime() / 1000 - this.RssRefreshTime
    if (subtime > 3600) {
      this.aLoadRssList()
    }
  }
}

export const StoreRss = getModule(RSS)
