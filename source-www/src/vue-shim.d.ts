declare module '*.vue' {
  import { Component } from 'vue'
  const _default: Component
  export default _default
}

declare module 'base-64'
declare module 'utf8'
declare module 'md5'

declare interface Window {
  WebToElectron: any
  WebToElectronCB: any
  WebShowOpenDialogSync: any
  WebShowSaveDialogSync: any
  WebShowItemInFolder:any
  WebSpawnSync:any
}
