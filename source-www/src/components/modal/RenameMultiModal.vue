<template>
  <a-modal key="RenameMultiModal" :visible="checkShowModal" title="" :footer="null" width="auto" class="RenameMultiModal" :destroyOnClose="true" @cancel="handleCancel">
    <a-divider orientation="left"> 批量修改文件名 </a-divider>

    <a-form layout="inline">
      <a-form-item>
        <a-input-group compact>
          <a-input v-model:value="dataOldVal" style="width: 226px" addon-before="把" @change="handleValueChange" />
          <a-input v-model:value="dataNewVal" style="width: 254px" addon-before="替换成" @change="handleValueChange" />
        </a-input-group>
      </a-form-item>
      <a-form-item style="margin-right: 0px; margin-top: -1px; text-align: right">
        <a-button type="primary" :loading="modalLoading" style="min-width: 60px" @click="handleSave">执行替换 ({{ dataMatchCount }}个)</a-button>
      </a-form-item>
    </a-form>
    <div class="br"></div>
    <div class="renameitemlistparent" :style="{ height: dataTreeHeight }">
      <VxeList class="renameitemlist" :data="renameFileList.list" :datats="renameFileList.ts" :rowHeight="32" :scrollYMinCount="100" oncontextmenu="return false;">
        <template #default="{ items }">
          <div v-for="item in items" :key="item.key">
            <div class="filename">
              <div class="iconfont">
                <span :class="item.fileicon"></span>
              </div>
              <div class="title" @click="handleSelect(item.name)">
                <div v-html="item.showname"></div>
              </div>
            </div>
          </div>
        </template>
      </VxeList>
    </div>

    <div class="texttip" style="text-align: left">
      <a-badge dot>
        <span class="iconfont iconnotification"></span>
      </a-badge>
      自动<a>一个一个</a>的重命名，文件较多时要耐心等待
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, reactive, watchEffect } from 'vue'
  import APIFile from '@/api/file'
  import { StoreUI } from '@/store/ui'
  import { StoreUser } from '@/store/user'
  import { IFile, StorePan } from '@/store/pan'
  import { message, notification } from 'ant-design-vue'
  import VxeListComponent from '@/components/vxe-list'
  export default defineComponent({
    name: 'RenameModal',
    components: { VxeList: VxeListComponent },
    setup() {
      const modalLoading = ref(false)
      const dataOldVal = ref('')
      const dataNewVal = ref('')
      const dataTreeHeight = ref('300px')
      const dataMatchCount = ref(0)
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'renamemulti')
      const renameFileList = reactive({ list: [] as any[], ts: 0 })

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'renamemulti') {
          modalLoading.value = false
          dataOldVal.value = ''
          dataNewVal.value = ''
          dataMatchCount.value = 0
          renameFileList.list = []
          renameFileList.ts = new Date().getTime()
        } else {
          dataTreeHeight.value = (document.body.clientHeight - 300).toString() + 'px'
          const selectedFile = StoreUI.Modal.ModalData || ({} as IFile)
          const list = []
          for (let i = 0; i < selectedFile.length; i++) {
            const item = selectedFile[i]
            if (item.isfromfile === true) {
              list.push({ key: item.key, showname: item.name, name: item.name, fileicon: item.fileicon })
            }
          }
          dataOldVal.value = ''
          dataNewVal.value = ''
          dataMatchCount.value = 0
          renameFileList.list = list
          renameFileList.ts = new Date().getTime()
        }
      })
      function replace(str: string, olds: string, news: string) {
        return str.split(olds).join(news)
      }

      function handleSelect(name: string) {
        dataOldVal.value = name
      }

      function handleValueChange() {
        let oldval = dataOldVal.value
        let newval = dataNewVal.value

        oldval = oldval.replace(new RegExp('<', 'g'), '').replace(new RegExp('/', 'g'), '')
        newval = newval.replace(new RegExp('<', 'g'), '').replace(new RegExp('/', 'g'), '')
        if (oldval !== dataOldVal.value) dataOldVal.value = oldval
        if (newval !== dataNewVal.value) dataNewVal.value = newval

        const LEN = renameFileList.list.length

        if (oldval === '') {
          for (let i = 0; i < LEN; i++) {
            renameFileList.list[i].showname = renameFileList.list[i].name
          }
        } else {
          if (newval !== '') {
            newval = '<b>' + newval + '</b>'
          } else {
            newval = '<i>' + oldval + '</i>'
          }
          dataMatchCount.value = 0
          for (let i = 0; i < LEN; i++) {
            const item = renameFileList.list[i]
            const newname = replace(item.name, oldval, newval)
            item.showname = newname
            if (newname !== item.name) dataMatchCount.value++
          }
        }
      }
      function handleSave() {
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return ''
        }

        let oldval = dataOldVal.value
        let newval = dataNewVal.value

        oldval = oldval.replace(new RegExp('<', 'g'), '').replace(new RegExp('/', 'g'), '')
        newval = newval.replace(new RegExp('<', 'g'), '').replace(new RegExp('/', 'g'), '')
        if (oldval !== dataOldVal.value) dataOldVal.value = oldval
        if (newval !== dataNewVal.value) dataNewVal.value = newval

        if (oldval === '') {
          message.info('没有输入被替换的字符')
          return
        }

        modalLoading.value = true
        const FileList = [...renameFileList.list]
        const LEN = FileList.length

        const PList = []
        for (let i = 0; i < LEN; i++) {
          const itemfile = FileList[i]
          const newname = replace(itemfile.name, oldval, newval)
          if (newname !== '' && newname !== itemfile.name) {
            PList.push(
              APIFile.RenameFile(userid, itemfile.key, newname)
                .then((resp) => {
                  if (dataMatchCount.value > 0) dataMatchCount.value--
                  return resp
                })
                .catch(() => {
                  return { async: false, success: false }
                })
            )
          }
        }

        Promise.all(PList).then((values) => {
          let isasync = false
          let dataRenameCount = 0
          for (let i = 0; i < values.length; i++) {
            if (values[i].async) isasync = true
            if (values[i].success) dataRenameCount++
          }
          if (isasync) {
            notification.open({
              message: '操作成功',
              description: '由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果',
              duration: 6,
            })
          } else {
            message.info('批量改名完成，成功修改了 ' + dataRenameCount + ' 个文件')
          }
          modalLoading.value = false
          StorePan.aRefreshDir()
          if (StorePan.panDirSelected.key === '6pan-search') {
            StorePan.aModalSelectDir({ key: '', path: '/', name: 'refresh', sep: false, chd: 0 })
          }
          StoreUI.mCloseModal()
        })
      }
      function handleCancel() {
        if (modalLoading.value === true) {
          message.info('正在执行操作中，等待完成后才能关闭')
          return false
        }
        modalLoading.value = false
        StoreUI.mCloseModal()
      }

      return {
        modalLoading,
        checkShowModal,
        dataTreeHeight,
        dataOldVal,
        dataNewVal,
        dataMatchCount,
        renameFileList,
        handleSelect,
        handleValueChange,
        handleSave,
        handleCancel,
      }
    },
  })
</script>

<style>
  .RenameMultiModal {
    max-width: 740px;
    min-width: 520px;
  }
  .renameitemlistparent {
    min-height: 300px;
    width: 100%;
    overflow: hidden;
    border-top: 1px solid #e8e8e8;
    margin-bottom: 8px;
    position: relative;
    display: flex;
  }
  .renameitemlist {
    flex: 1 1 0%;
  }
  .renameitemlist.vxe-list .vxe-list--virtual-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
    transition: all 0.5s ease-in;
    scroll-behavior: smooth;
  }

  .renameitemlist .filename {
    width: 100%;
    height: 32px;
    display: flex !important;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    color: rgba(0, 0, 0, 0.7);
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 14px;
    line-height: 24px;
    border-bottom: 1px solid #eef2f8 !important;
  }

  .renameitemlist .filename:hover {
    background-color: #f7f8fa !important;
  }

  .renameitemlist .filename .iconfont {
    width: 24px;
    padding-left: 4px;
    padding-top: 2px;
  }

  .renameitemlist .filename .title {
    flex: 1 1 0%;
    overflow: hidden;
    cursor: default;
  }
  .renameitemlist .filename .title > div {
    width: fit-content;
    max-width: 100%;
    height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .renameitemlist .filename .title i {
    color: #b31d28;
    background-color: #ffeef0;
    text-decoration: line-through;
    font-style: normal;
    font-weight: normal;
    padding: 0 2px;
  }
  .renameitemlist .filename .title b {
    color: #22863a;
    background-color: #f0fff4;
    font-style: normal;
    font-weight: normal;
    padding: 0 2px;
  }
</style>
