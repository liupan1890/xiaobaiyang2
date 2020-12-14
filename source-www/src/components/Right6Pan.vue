<template>
  <div class="right" :style="{ display: checkDisplay }" oncontextmenu="return false;">
    <div style="-webkit-app-region: drag">
      <transition name="bottom-fade" mode="out-in">
        <div v-if="panFileListSelected.count > 1" class="rightHeadRow">
          <a-button v-if="showFile === false" class="borderbtn" style="-webkit-app-region: none" @click="handleDeleteFileMutil()"><span class="iconfont icondelete"></span>批量删除</a-button>
          <a-button v-if="false" class="borderbtn" style="-webkit-app-region: none" @click="handleDownFileMutil()"><span class="iconfont icondownload"></span>批量下载</a-button>
          <a-button v-if="showFile" class="borderbtn" style="-webkit-app-region: none" @click="handleDeleteFileMutil()"><span class="iconfont iconrest"></span>批量删除</a-button>
          <a-button v-if="showFile" class="borderbtn" style="-webkit-app-region: none" @click="handleRenameFileMutil()"><span class="iconfont iconedit-square"></span>批量改名</a-button>
          <a-button v-if="showFile" class="borderbtn" style="-webkit-app-region: none" @click="handleCopytoFileMutil()"><span class="iconfont iconcopy"></span>批量移动</a-button>
          <a-button v-if="showHuiShouZhan" class="borderbtn" style="-webkit-app-region: none" @click="handleRecoverFileMutil()"><span class="iconfont iconrecover"></span>批量还原</a-button>
        </div>
        <div v-else class="filepath">
          <template v-for="item in panDirSelectedPath" :key="'fp-n-' + item.key">
            <div class="desc" style="-webkit-app-region: none" @click="handleClickFilePath(item.key, item.path, item.name)">
              {{ item.name }}
            </div>
            <div v-if="item.sep" class="sep">/</div>
          </template>

          <div v-if="showHuiShouZhan" class="texttip">
            <a-badge dot>
              <span class="iconfont iconnotification"></span>
            </a-badge>
            这里的文件保留30天，6盘有BUG部分文件还原时文件名会变成一堆字母
          </div>
        </div>
      </transition>
    </div>
    <div class="rightHeadRow">
      <a-button class="borderbtn" @click="handleClickRefresh"><span class="iconfont iconsync"></span>刷新</a-button>
      <a-button v-if="showHuiShouZhan == false" class="borderbtn" @click="handleClickLiXian"> <span class="iconfont iconcloud-download"></span>新建离线下载 </a-button>
      <a-button v-if="showFile" class="borderbtn" title="新建文件夹" @click="handleClickAddDir"> <span class="iconfont iconfolder-add"></span>新建文件夹 </a-button>
      <a-dropdown v-if="showFile" :disabled="uploadLoading">
        <template #overlay>
          <a-menu @click="handleClickUpload">
            <a-menu-item key="uploadfile"> 上传文件 </a-menu-item>
            <a-menu-item key="uploaddir"> 上传文件夹 </a-menu-item>
          </a-menu>
        </template>
        <a-button :loading="uploadLoading" class="borderbtn"><span v-if="uploadLoading === false" class="iconfont iconupload"></span>上传</a-button>
      </a-dropdown>
      <a-input-search v-if="showFile" placeholder="搜索文件" style="width: 200px" @search="handleClickSearch" />

      <a-button v-if="showLiXian" class="borderbtn" title="只删除离线记录,不会删除文件" @click="ClearLiXian('all')"> <span class="iconfont icondelete"></span>清除所有任务 </a-button>
      <a-button v-if="showLiXian" class="borderbtn" title="只删除离线记录,不会删除文件" @click="ClearLiXian('ok')"> <span class="iconfont icondelete"></span>清除所有已完成任务 </a-button>

      <a-button v-if="showHuiShouZhan" class="borderbtn" @click="ClearHuiShouZhan"> <span class="iconfont icondelete"></span>清空回收站 </a-button>
    </div>
    <a-spin :spinning="panFileLoading">
      <div class="filetable ant-table ant-table-scroll-position-left ant-table-layout-fixed ant-table-default ant-table-empty" oncontextmenu="return false;">
        <div class="ant-table-content">
          <div class="ant-table-body">
            <table>
              <colgroup>
                <col style="width: 36px; min-width: 36px" />
                <col />
                <col style="width: 90px; min-width: 90px" />
                <col style="width: 100px; min-width: 100px" />
              </colgroup>
              <thead class="ant-table-thead">
                <tr>
                  <th key="fileselect" class="ant-table-column-has-actions ant-table-row-cell-ellipsis" style="padding-left: 10px">
                    <span class="ant-table-header-column">
                      <span class="ant-table-column-title">
                        <a-checkbox v-model:checked="panFileListSelectAll" @change.stop="handleSelectAll"> </a-checkbox>
                      </span>
                    </span>
                  </th>
                  <th key="filename" class="ant-table-column-has-actions ant-table-column-has-sorters ant-table-column-sort ant-table-row-cell-ellipsis">
                    <span class="ant-table-header-column">
                      <div class="ant-table-column-sorters" title="点击按文件名排序，正序/倒序" @click="handleSorter('filename')">
                        <span class="ant-table-column-title" :class="sorter.classfilename"> 文件名( {{ panFileListSelected.count }} / {{ panFileListCount }}个 )</span>
                        <span class="iconfont" :class="sorter.classfilename"></span>
                      </div>
                    </span>
                  </th>
                  <th key="sizestr" class="ant-table-column-has-actions ant-table-column-has-sorters ant-table-row-cell-break-word">
                    <span class="ant-table-header-column">
                      <div class="ant-table-column-sorters" title="点击按文件大小排序，正序/倒序" @click="handleSorter('sizestr')">
                        <span class="ant-table-column-title" :class="sorter.classsize">大小</span>
                        <span class="iconfont" :class="sorter.classsize"></span>
                      </div>
                    </span>
                  </th>
                  <th key="datestr" class="ant-table-column-has-actions ant-table-column-has-sorters ant-table-row-cell-break-word ant-table-row-cell-last">
                    <span class="ant-table-header-column">
                      <div class="ant-table-column-sorters" title="点击按时间排序，正序/倒序" @click="handleSorter('datestr')">
                        <span class="ant-table-column-title" :class="sorter.classdate">时间</span>
                        <span class="iconfont" :class="sorter.classdate"></span>
                      </div>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody class="ant-table-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </a-spin>
    <div v-if="panFileLoading == false && panFileList.list.length === 0" class="scrollviewhead">
      <div class="iconfont">
        <span class="iconempty"></span>
      </div>
      <div class="emptytip">空的</div>
    </div>
    <VxeList id="fileitemlist" class="fileitemlist" :data="panFileList.list" :datats="panFileList.ts" :rowHeight="50" :scrollYMinCount="50" oncontextmenu="return false;">
      <template #default="{ items }">
        <div v-for="item in items" :key="item.key" :class="{ filename: true, selected: panFileListSelected[item.key] === 1 }">
          <label class="ant-checkbox-wrapper ant-checkbox-wrapper-checked" @click="handleClickFileItem(item.key, $event)">
            <span :class="{ 'ant-checkbox': true, 'ant-checkbox-checked': panFileListSelected[item.key] === 1 }">
              <span class="ant-checkbox-inner"></span>
            </span>
          </label>
          <div class="iconfont" @click="handleClickFileItem(item.key, $event)">
            <span :class="item.fileicon"></span>
          </div>
          <div :class="{ title: true, canclick: item.canclick }" :title="item.path">
            <div @click="handleClickFileName(item, $event)">{{ item.name }}</div>
          </div>
          <div class="size">
            {{ item.sizestr }}
          </div>
          <div class="date">
            {{ item.datestr }}
          </div>
          <div class="fileactions" @click.stop="handleClickFileItemActions(item.key)">
            <div v-if="item.isfromfile">
              <div v-if="item.istxt" class="rightbtn" title="预览文本" @click="ShowTxt(item)">
                <span class="iconfont iconfile-txt2"></span>
              </div>
              <div v-if="item.isdoc" class="rightbtn" title="预览doc,pdf,xls,ppt,rtf等" @click="ShowDoc(item)">
                <span class="iconfont iconfile-pdf"></span>
              </div>
              <div v-if="item.isimg" class="rightbtn" title="预览图片" @click="ShowImage(item)">
                <span class="iconfont iconfile-img"></span>
              </div>
              <div v-if="item.isaudio" class="rightbtn" title="在线播放音频" @click="ShowAudio(item)">
                <span class="iconfont iconfile-audio"></span>
              </div>
              <div v-if="item.isvideo" class="rightbtn" title="在线播放视频" @click="ShowVideo(item)">
                <span class="iconfont iconfile-video"></span>
              </div>
              <div v-if="item.isdir == false" class="rightbtn" title="复制文件下载链接" @click="DownLink(item)">
                <span class="iconfont iconlink2"></span>
              </div>
              <div class="rightbtn" title="下载文件/文件夹" @click="DownFile(item.key)">
                <span class="iconfont icondownload"></span>
              </div>
              <div class="rightbtn" title="重命名" @click="RenameFile(item)">
                <span class="iconfont iconedit-square"></span>
              </div>
              <div class="rightbtn" title="删除(放入回收站)" @click.stop="DeleteFile(item)">
                <span class="iconfont iconrest"></span>
              </div>
              <div class="rightbtn" title="复制/移动" @click="CopytoFile(item.key, item.path)">
                <span class="iconfont iconcopy"></span>
              </div>
            </div>
            <div v-if="item.isfromhuishouzhan" class="rightbtn" title="还原到网盘" @click.stop="RecoverFile(item)">
              <span class="iconfont iconrecover"></span>
            </div>
            <div v-if="item.isfromlixian" class="rightbtn" title="复制离线链接" @click="LiXianLink(item)">
              <span class="iconfont iconlink2"></span>
            </div>
            <div v-if="item.isfromfile === false" class="rightbtn" title="删除" @click.stop="DeleteFile(item)">
              <span class="iconfont icondelete"></span>
            </div>
          </div>
        </div>
      </template>
    </VxeList>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, reactive, ref, watch } from 'vue'
  import { IFile, StorePan } from '@/store/pan'
  import { GetSorterFileList } from '@/store/sorterhelper'
  import { ClearLiXian, ClearHuiShouZhan, DeleteFile, DeleteFileMutil, RecoverFile, RecoverFileMutil } from '@/store/filehelper'
  import { ShowTxt, ShowDoc, ShowImage, ShowVideo, ShowAudio, DownFile, DownFileMutil, RenameFile, RenameFileMutil, DownLink, LiXianLink, CopytoFile, CopytoFileMutil } from '@/store/filehelper2'
  import { StoreUser } from '@/store/user'
  import { StoreUI } from '@/store/ui'
  import { message } from 'ant-design-vue'
  import VxeListComponent from './vxe-list'

  export default defineComponent({
    name: 'NavMenu',
    components: { VxeList: VxeListComponent },
    setup() {
      const checkDisplay = computed(() => (StoreUI.PageName === '/6pan' ? 'flex' : 'none'))
      const panDirSelectedPath = computed(() => StorePan.panDirSelectedPath)

      const showFile = computed(() => StorePan.panDirSelected.key !== '6pan-lixian' && StorePan.panDirSelected.key !== '6pan-huishouzhan')
      const showLiXian = computed(() => StorePan.panDirSelected.key === '6pan-lixian')
      const showHuiShouZhan = computed(() => StorePan.panDirSelected.key === '6pan-huishouzhan')
      const panFileListCount = computed(() => StorePan.panFileListCount)
      const sorter = ref({ field: 'filename', orderasc: true, classfilename: 'iconsort-ascend', classsize: 'iconsort', classdate: 'iconsort' })
      const sorterFile = ref({ field: 'filename', orderasc: true, classfilename: 'iconsort-ascend', classsize: 'iconsort', classdate: 'iconsort' })
      const sorterLiXian = ref({ field: 'datestr', orderasc: false, classfilename: 'iconsort', classsize: 'iconsort', classdate: 'iconsort-descend' })
      const sorterHuiShouZhan = ref({ field: 'datestr', orderasc: false, classfilename: 'iconsort', classsize: 'iconsort', classdate: 'iconsort-descend' })

      const panFileList = reactive({ list: [] as IFile[], ts: 0 })
      const panFileListSelected = ref({ count: 0 } as any)
      const panFileListSelectAll = ref(false)
      let panDirSelectedKey = ''
      let LastFileItemKey = ''

      watch(
        () => StorePan.panFileList,
        () => {
          if (panDirSelectedKey !== StorePan.panDirSelected.key) {
            panDirSelectedKey = StorePan.panDirSelected.key
            LastFileItemKey = ''
            panFileListSelected.value = { count: 0 } as any
            panFileListSelectAll.value = false
            if (showLiXian.value) sorter.value = sorterLiXian.value
            else if (showHuiShouZhan.value) sorter.value = sorterHuiShouZhan.value
            else sorter.value = sorterFile.value
          } else {
            const select = { count: 0 } as any
            for (let i = 0; i < StorePan.panFileList.length; i++) {
              if (panFileListSelected.value[StorePan.panFileList[i].key] === 1) {
                select[StorePan.panFileList[i].key] = 1
                select.count++
              }
            }
            panFileListSelected.value = select
            panFileListSelectAll.value = select.count > 0 && select.count === StorePan.panFileList.length
          }
          panFileList.list = GetSorterFileList(StorePan.panFileList, sorter.value.field, sorter.value.orderasc)
          panFileList.ts = new Date().getTime()
        }
      )
      function handleSelectAll() {
        if (panFileListSelectAll.value === true) {
          for (let i = 0; i < panFileList.list.length; i++) {
            panFileListSelected.value[panFileList.list[i].key] = 1
          }
          panFileListSelected.value.count = panFileList.list.length
        } else {
          panFileListSelected.value = { count: 0 } as any
        }
      }
      const panFileLoading = computed(() => StorePan.panFileLoading)

      function handleClickFilePath(key: string, path: string, name: string) {
        StorePan.aSelectDir({ key, path, name, sep: false, chd: 0 })
      }
      function handleClickRefresh() {
        StorePan.aSelectDir({ key: 'refresh', path: 'refresh', name: '', sep: false, chd: 0 })
      }
      function handleClickFileItem(filekey: string, event: any) {
        if (event.shiftKey) {
          handleClickFileItemShift(filekey)
          return
        }

        if (panFileListSelected.value[filekey] === 1) {
          panFileListSelected.value[filekey] = 0
          panFileListSelected.value.count--
          panFileListSelectAll.value = false
        } else {
          panFileListSelected.value[filekey] = 1
          panFileListSelected.value.count++
          LastFileItemKey = filekey
          if (panFileListSelected.value.count >= panFileList.list.length) {
            for (let i = 0; i < panFileList.list.length; i++) {
              panFileListSelected.value[panFileList.list[i].key] = 1
            }
            panFileListSelectAll.value = true
          }
        }
      }
      function handleClickFileItemShift(filekey: string) {
        let LastIndex = -1
        for (let l = 0; l < panFileList.list.length; l++) {
          if (panFileList.list[l].key === LastFileItemKey) {
            LastIndex = l
            break
          }
        }
        if (LastIndex === -1) return
        let ThisIndex = -1
        for (let t = 0; t < panFileList.list.length; t++) {
          if (panFileList.list[t].key === filekey) {
            ThisIndex = t
            break
          }
        }
        if (ThisIndex === -1) return
        const start = LastIndex > ThisIndex ? ThisIndex : LastIndex
        const end = LastIndex > ThisIndex ? LastIndex : ThisIndex
        for (let s = start; s <= end; s++) {
          const skey = panFileList.list[s].key
          if (panFileListSelected.value[skey] !== 1) {
            panFileListSelected.value[skey] = 1
            panFileListSelected.value.count++
          }
        }
        if (panFileListSelected.value.count >= panFileList.list.length) {
          for (let i = 0; i < panFileList.list.length; i++) {
            panFileListSelected.value[panFileList.list[i].key] = 1
          }
          panFileListSelectAll.value = true
        }
      }
      function handleSorter(sorterfield: string, order: boolean | undefined) {
        let value
        if (showLiXian.value) value = sorterLiXian.value
        else if (showHuiShouZhan.value) value = sorterHuiShouZhan.value
        else value = sorterFile.value

        if (order !== undefined) {
          value.orderasc = order
        } else {
          value.orderasc = !value.orderasc
        }
        value.field = sorterfield

        value.classfilename = 'iconsort'
        value.classsize = 'iconsort'
        value.classdate = 'iconsort'
        if (value.field === 'filename') {
          value.classfilename = value.orderasc ? 'iconsort-ascend' : 'iconsort-descend'
        } else if (sorter.value.field === 'sizestr') {
          value.classsize = value.orderasc ? 'iconsort-ascend' : 'iconsort-descend'
        } else {
          value.classdate = value.orderasc ? 'iconsort-ascend' : 'iconsort-descend'
        }
        sorter.value = value
        if (showLiXian.value) sorterLiXian.value = value
        else if (showHuiShouZhan.value) sorterHuiShouZhan.value = value
        else sorterFile.value = value
        panFileList.list = GetSorterFileList(StorePan.panFileList, value.field, value.orderasc)
        panFileList.ts = new Date().getTime()
      }
      const uploadLoading = ref(false)
      function handleClickUpload(e: any) {
        const key = e.key
        if (StorePan.panDirSelected.key === '6pan-search') {
          message.error('请先切换到一个网盘文件夹，再点击上传')
          return
        }

        if (key === 'uploaddir') {
          if (window.WebShowOpenDialogSync) {
            uploadLoading.value = true
            window.WebShowOpenDialogSync({ title: '选择多个文件夹上传到网盘', buttonLabel: '上传文件夹', properties: ['openDirectory', 'multiSelections'] }, (result: string[] | undefined) => {
              uploadLoading.value = false
              if (result && result.length > 0) {
                let uploadFileParentDir = result[0]
                if (uploadFileParentDir.indexOf('/') >= 0) uploadFileParentDir = uploadFileParentDir.substr(0, uploadFileParentDir.lastIndexOf('/'))
                else if (uploadFileParentDir.indexOf('\\') >= 0) uploadFileParentDir = uploadFileParentDir.substr(0, uploadFileParentDir.lastIndexOf('\\'))
                else {
                  message.error('选择的路径不支持,请重新选择')
                  return
                }
                const data = { uploadFileToPath: StorePan.panDirSelected.path, uploadFileIsDir: true, uploadFileParentDir, filelist: result }
                StoreUI.mShowModal({ ModalName: 'upload', ModalData: data })
              }
            })
          } else {
            message.error('需要Electron环境支持')
          }
        } else if (key === 'uploadfile') {
          if (window.WebShowOpenDialogSync) {
            uploadLoading.value = true
            window.WebShowOpenDialogSync({ title: '选择多个文件上传到网盘', buttonLabel: '上传选中的文件', properties: ['openFile', 'multiSelections'] }, (result: string[] | undefined) => {
              uploadLoading.value = false
              if (result && result.length > 0) {
                let uploadFileParentDir = result[0]
                if (uploadFileParentDir.indexOf('/') >= 0) uploadFileParentDir = uploadFileParentDir.substr(0, uploadFileParentDir.lastIndexOf('/'))
                else if (uploadFileParentDir.indexOf('\\') >= 0) uploadFileParentDir = uploadFileParentDir.substr(0, uploadFileParentDir.lastIndexOf('\\'))
                else {
                  message.error('选择的路径不支持,请重新选择')
                  return
                }
                const data = { uploadFileToPath: StorePan.panDirSelected.path, uploadFileIsDir: false, uploadFileParentDir, filelist: result }
                StoreUI.mShowModal({ ModalName: 'upload', ModalData: data })
              }
            })
          } else {
            message.error('需要Electron环境支持')
          }
        }
        return false
      }
      function handleClickSearch(value: string) {
        StorePan.aSelectDir({ key: '6pan-search', path: value, name: '', sep: false, chd: 0 })
      }
      function handleClickAddDir() {
        if (StoreUser.UserSelected.key === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        StoreUI.mShowModal({ ModalName: 'adddir' })
      }
      function handleClickLiXian() {
        if (StoreUser.UserSelected.key === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        StoreUI.mShowModal({ ModalName: 'lixian' })
      }

      function handleClickFileItemActions(filekey: string) {
        panFileListSelected.value = { count: 0 } as any
        panFileListSelected.value[filekey] = 1
        panFileListSelected.value.count++
      }

      function handleClickFileName(item: IFile, event: Event) {
        if (item.isfromfile) {
          event.stopPropagation()
          handleClickFileItemActions(item.key)
          if (item.isdir) {
            StorePan.aSelectDir({ key: item.key, path: item.path, name: item.name, sep: false, chd: 0 })
          } else if (item.isimg) {
            ShowImage(item)
          } else if (item.isaudio || item.isvideo) {
            ShowVideo(item)
          } else if (item.istxt) {
            ShowTxt(item)
          } else if (item.isdoc) {
            ShowDoc(item)
          }
        }
      }
      function handleDownFileMutil() {
        const list = []
        for (let i = 0; i < panFileList.list.length; i++) {
          if (panFileListSelected.value[panFileList.list[i].key] === 1) {
            list.push(panFileList.list[i].key)
          }
        }
        DownFileMutil(list)
      }

      function handleDeleteFileMutil() {
        const list = []
        for (let i = 0; i < panFileList.list.length; i++) {
          if (panFileListSelected.value[panFileList.list[i].key] === 1) {
            list.push(panFileList.list[i])
          }
        }
        DeleteFileMutil(list)
      }
      function handleRenameFileMutil() {
        const list = []
        for (let i = 0; i < panFileList.list.length; i++) {
          if (panFileListSelected.value[panFileList.list[i].key] === 1) {
            list.push(panFileList.list[i])
          }
        }
        RenameFileMutil(list)
      }
      function handleCopytoFileMutil() {
        const list = []
        let path = '/'
        for (let i = 0; i < panFileList.list.length; i++) {
          if (panFileListSelected.value[panFileList.list[i].key] === 1) {
            list.push(panFileList.list[i].key)
            path = panFileList.list[i].path
          }
        }
        CopytoFileMutil(list, path, 'file')
      }
      function handleRecoverFileMutil() {
        const list = []
        for (let i = 0; i < panFileList.list.length; i++) {
          if (panFileListSelected.value[panFileList.list[i].key] === 1) {
            list.push(panFileList.list[i].key)
          }
        }
        RecoverFileMutil(list)
      }

      return {
        checkDisplay,
        showFile,
        showLiXian,
        showHuiShouZhan,
        sorter,
        panDirSelectedPath,
        panFileListCount,
        panFileList,
        panFileListSelected,
        panFileListSelectAll,
        handleSelectAll,
        panFileLoading,
        uploadLoading,
        handleClickRefresh,
        handleClickFileItem,
        handleClickFileItemActions,
        handleClickFilePath,
        handleClickFileName,
        handleSorter,
        handleClickUpload,
        handleClickSearch,
        handleClickAddDir,
        handleClickLiXian,

        ClearLiXian,
        ClearHuiShouZhan,
        ShowTxt,
        ShowDoc,
        ShowImage,
        ShowVideo,
        ShowAudio,
        DownFile,
        handleDownFileMutil,
        DownLink,
        LiXianLink,
        RenameFile,
        handleRenameFileMutil,
        DeleteFile,
        handleDeleteFileMutil,
        RecoverFile,
        handleRecoverFileMutil,
        CopytoFile,
        handleCopytoFileMutil,
      }
    },
  })
</script>

<style>
  .gonggao.texttip {
    top: 81px;
    left: 120px;
    right: 190px;
    height: 43px;
    padding: 11px 30px 11px 0;
    text-align: center;
    overflow: hidden;
    word-break: keep-all;
    white-space: nowrap;
    text-overflow: ellipsis;
    position: absolute;
    z-index: 1;
  }

  .uploadparent {
    position: relative;
    overflow: hidden;
  }
  .uploadinput {
    position: absolute;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    min-height: 40px;
    line-height: 40px;
    font-size: 24px;
    opacity: 0;
    cursor: pointer;
  }

  /*******       filepath      ******** */
  .filepath {
    flex-grow: 0;
    flex-shrink: 0;
    width: 90%;
    height: 40px;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    padding-left: 8px !important;
  }
  .filepath .sep {
    flex-grow: 0;
    flex-shrink: 0;
    width: 10px;
    text-align: center;
    font-size: 12px;
    color: #bcb3b3;
  }
  .filepath .desc {
    flex-grow: 0;
    flex-shrink: 1;
    flex-basis: auto;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin: 0;
    font-size: 12px;
    color: #00a4ffcc;
    cursor: pointer;
    max-width: 150px;
    padding: 0 4px;
  }
  .filepath .desc:hover {
    color: #00a4ff;
    background-color: rgba(0, 132, 255, 0.1);
  }
  .filepath .desc:first-child {
    flex-grow: 0;
    flex-shrink: 0;
  }
</style>
<style>
  /*******       filetable      ******** */
  .filetable {
    width: 100%;
    flex-grow: 0;
    flex-shrink: 0;
    height: 45px;
    overflow: hidden;
    border-top: 1px solid #e5e8ed;
    border-bottom: 1px solid #e5e8ed;
    box-shadow: 0 2px 4px 0 rgba(3, 27, 78, 0.06);
  }
  .filetable table {
    table-layout: fixed;
    width: 100%;
    text-align: left;
    border-radius: 4px 4px 0 0;
    border-collapse: separate;
    border-spacing: 0;
  }
  .filetable table tr th {
    padding: 0 0 0 12px;
    margin: 0;
    color: #202d40;
    height: 44px;
    background: #fff;

    border-bottom: 1px solid #e5e8ed !important;
    border-collapse: collapse !important;
  }

  .filetable .ant-table-thead > tr > th.ant-table-column-sort,
  .filetable .ant-table-thead > tr > th.ant-table-column-has-actions.ant-table-column-has-sorters:hover {
    background: #fff !important;
    border-radius: 0;
  }

  .filetable .ant-table-column-sorters .iconfont {
    line-height: 32px;
    display: inline-block;
    margin-left: 6px;
    font-size: 30px;
    color: #928787;
  }
  .filetable .ant-table-column-sorters .iconsort-descend,
  .filetable .ant-table-column-sorters .iconsort-ascend {
    color: #df5659 !important;
  }

  .filetable .ant-table-column-sorters .ant-table-column-title::before {
    display: none;
  }
</style>
<style>
  /***=========       fileitemlist         =========== */
  .fileitemlist {
    flex: 1 1 0%;
    width: 100%;
    scroll-behavior: smooth;
    transition: all 0.5s ease-in;
    position: relative;
  }

  .fileitemlist.vxe-list .vxe-list--virtual-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
    transition: all 0.5s ease-in;
    scroll-behavior: smooth;
  }

  .fileitemlist .filename {
    width: 100%;
    height: 50px;
    display: flex !important;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    color: rgba(0, 0, 0, 0.7);
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 14px;
    line-height: 28px;
    border-bottom: 1px solid #eef2f8 !important;
    position: relative;
  }

  .fileitemlist .filename.selected,
  .fileitemlist .filename:hover {
    background-color: #f7f8fa !important;
  }

  .fileitemlist .filename .title {
    flex: 1 1 0%;
    overflow: hidden;
    cursor: default;
  }
  .fileitemlist .filename .title > div {
    width: fit-content;
    max-width: 100%;
    height: 28px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .fileitemlist .filename .title.canclick > div {
    cursor: pointer;
  }

  .fileitemlist .filename .size {
    padding: 0 8px 0 0;
    text-align: right;
    width: 90px;
  }

  .fileitemlist .filename .date {
    padding: 0 8px 0 0;
    text-align: right;
    width: 100px;
  }

  .fileitemlist .fileactions {
    padding-left: 8px;
    margin-right: 8px;
    display: flex !important;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    position: absolute;
    right: 0;
    top: 11px;
    min-width: 100px;
    background-color: #f7f8fa;
    opacity: 0;
  }
  .fileitemlist .fileactions > div {
    display: flex !important;
    flex-direction: row;
  }

  .fileitemlist .filename:hover .fileactions {
    opacity: 1;
  }
  .fileitemlist .filename .rightbtn {
    min-width: 24px;
    height: 28px;
    width: auto;
    font-size: 22px;
    padding: 0 8px;
    margin-right: 8px;
    cursor: pointer;
    flex-grow: 0;
    flex-shrink: 0;
    background-color: transparent;
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
  }

  .fileitemlist .filename .rightbtn > .iconfont::before {
    font-size: 22px;
    line-height: 28px;
    color: #2d8cf0;
  }
  .fileitemlist .filename .rightbtn > .iconfont {
    font-size: 14px;
    line-height: 28px;
    color: #2d8cf0;
    padding-left: 0;
    display: inline-flex;
    width: auto;
  }

  .fileitemlist .filename:hover .rightbtn:hover {
    background-color: rgba(0, 132, 255, 0.1);
    border-radius: 4px;
  }
</style>
<style>
  .fileitemlist .filename .ant-checkbox-wrapper {
    padding-left: 10px;
    padding-top: 17px;
    line-height: 100%;
    height: 100%;
  }
  /******==========   iconfont    ======== */
  .fileitemlist .filename > .iconfont {
    width: 44px;
    padding-left: 8px;
    padding-top: 11px;
    font-size: 28px;
    color: #928787;
    line-height: 100%;
    height: 100%;
  }
  .iconcloud-download {
    color: #3482f0;
  }

  .iconcloud-success {
    color: #8bc755;
  }
  .iconcloud-error {
    color: #ef3450;
  }

  .iconfile-video,
  .iconfile-mkv,
  .iconfile-avi,
  .iconfile-flv,
  .iconfile-mp4,
  .iconfile-mov,
  .iconfile-asf,
  .iconfile-wmv,
  .iconfile-ts,
  .iconfile-rmvb,
  .iconfile-swf {
    color: #3482f0;
  }
  .iconfile-audio,
  .iconfile-flac,
  .iconfile-ape,
  .iconfile-wav,
  .iconfile-cue,
  .iconfile-ogg,
  .iconfile-mp3 {
    color: #474de2;
  }
  .iconfile-image,
  .iconfile-ai,
  .iconfile-bmp,
  .iconfile-eps,
  .iconfile-gif,
  .iconfile-png,
  .iconfile-jpg,
  .iconfile-psd,
  .iconfile-svg,
  .iconfile-tif {
    color: #ff8400;
  }
  .iconfile-bt,
  .iconfile-txt,
  .iconfile-ssa,
  .iconfile-ass,
  .iconfile-srt,
  .iconfile-stl,
  .iconfile-scc,
  .iconfile-doc,
  .iconfile-html,
  .iconfile-pdf,
  .iconfile-ppt,
  .iconfile-xsl,
  .iconfile-wps {
    color: #8bc755;
  }
  .iconfile-7z,
  .iconfile-rar,
  .iconfile-zip,
  .iconfile-tar {
    color: #8d51db;
  }

  .iconfile-img2,
  .iconfile-xci,
  .iconfile-nsp,
  .iconfile-bin,
  .iconfile-dmg,
  .iconfile-vmdk,
  .iconfile-iso,
  .iconfile-gho,
  .iconfile-mds,
  .iconfile-vhd,
  .iconfile-god {
    color: #713cbe;
  }
  .iconfile-exe {
    color: #da3c09;
  }
  .iconfile-folder {
    color: rgb(244, 210, 110);
  }
</style>
