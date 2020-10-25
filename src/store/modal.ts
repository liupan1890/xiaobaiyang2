export interface IRssModel {
  key: string
  rssname: string
  licon: string
  newscount: string
}
export interface IRssNewsModel {
  key: string
  title: string
  date: string
  filesizestr: string
  isread: boolean
  ismiaochuan: boolean
}
export interface IRssNewsItemLinkModel {
  key: string
  title: string
  link: string
}
export interface IRssNewsItemModel {
  key: string
  title: string
  newsurl: string
  newsdate: string
  newslinks: IRssNewsItemLinkModel[]
  newscontent: string
}