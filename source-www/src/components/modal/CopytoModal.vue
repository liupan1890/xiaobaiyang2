<template>
  <a-modal key="CopytoModal" :visible="checkShowModal" title="" :footer="null" class="CopytoModal" width="auto" @cancel="handleCancel">
    <a-divider orientation="left">请选择要保存到的位置</a-divider>

    <a-tree class="dirtree" :style="{ height: dataTreeHeight }" show-icon auto-expand-parent default-expand-all :tree-data="treeDataList.list" :expanded-keys="dirExpandedKeys" :selectedKeys="dirSelectedKeys" @select="onSelectDir">
      <template #switcherIcon>
        <span class="ant-tree-switcher-icon">
          <span class="iconfont icondown"></span>
        </span>
      </template>
      <template #custom="item">
        <span v-if="item.licon === 'loading'" class="iconfont iconsync ant-spin-dot ant-spin-dot-spin"></span>
        <span v-else class="iconfont" :class="item.licon"></span>
        <span class="dirtreename">{{ item.name }}</span>
      </template>
    </a-tree>

    <div class="footbtn">
      <a-button v-if="dataModalIsFile" type="primary" :loading="modalLoading" title="把文件复制到选中的目录下" @click="handleSave('copy')"> <span class="iconfont iconcopy"></span>复制到... </a-button>
      <a-button v-if="dataModalIsFile" type="primary" :loading="modalLoading" title="把文件移动到选中的目录下" @click="handleSave('cut')"> <span class="iconfont iconscissor"></span>移动到... </a-button>
      <a-button v-if="dataModalIsLiXian" type="primary" :loading="modalLoading" title="把离线文件保存到选中的目录下" @click="handleSave('lixian')"> <span class="iconfont iconcloud"></span>离线保存到... </a-button>
    </div>
    <div class="texttip" style="text-align: left; margin-top: -42px">
      <a-badge dot>
        <span class="iconfont iconnotification"></span>
      </a-badge>
      {{ dataModalIsFile ? '复制、剪切操作可能需要数分钟才能完成，请耐心等待' : '下次勾选 最近保存位置 更快捷' }}
    </div>
    <div class="br"></div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, reactive, watchEffect } from 'vue'
  import APIFile from '@/api/file'
  import APIOffline from '@/api/offline'
  import PanHelper from '@/store/panhelper'
  import { StoreUI } from '@/store/ui'
  import { StoreUser } from '@/store/user'
  import { IDir, StorePan } from '@/store/pan'
  import { message, notification } from 'ant-design-vue'
  export default defineComponent({
    name: 'CopytoModal',
    setup() {
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'copyto')

      const modalLoading = ref(false)
      const dirExpandedKeys = ref([] as string[])
      const dirSelectedItem = ref({} as IDir)
      const dirSelectedKeys = ref([] as string[])
      const treeDataList = reactive({ list: [] as IDir[], ts: 0 })
      const dataModalIsFile = ref(false)
      const dataModalIsLiXian = ref(false)
      const dataModalPath = ref('')
      const dataTreeHeight = ref('200px')
      const dataModalKeyList = ref([] as string[])

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'copyto') {
          modalLoading.value = false
          dirExpandedKeys.value = ['6pan-root']
          dirSelectedKeys.value = ['6pan-root']
          dirSelectedItem.value = { key: '6pan-root', path: '/', name: '根目录', licon: 'iconhome', slots: { title: 'custom' }, children: [] }
          treeDataList.list = [{ key: '6pan-root', path: '/', name: '根目录', licon: 'iconhome', slots: { title: 'custom' }, children: [] }]
          treeDataList.ts = new Date().getTime()
          dataModalIsFile.value = false
          dataModalIsLiXian.value = false
          dataModalKeyList.value = []
          dataModalPath.value = '/'
        } else {
          dataTreeHeight.value = (document.body.clientHeight - 300).toString() + 'px'

          if (StoreUI.Modal.ModalData) {
            dataModalKeyList.value = StoreUI.Modal.ModalData.keylist
            dataModalIsFile.value = StoreUI.Modal.ModalData.from === 'file'
            dataModalIsLiXian.value = StoreUI.Modal.ModalData.from === 'lixian'
            dataModalPath.value = StoreUI.Modal.ModalData.path
          } else {
            dataModalKeyList.value = []
            dataModalIsFile.value = false
            dataModalIsLiXian.value = false
            dataModalPath.value = '/'
          }

          treeDataList.list = [StorePan.panDirList[StorePan.panDirList.length - 1]]
          treeDataList.ts = new Date().getTime()
          if (treeDataList.list.length > 0) {
            let lastpath = ''
            let lastdir = treeDataList.list[0]
            if (localStorage) {
              if (dataModalIsFile.value) {
                lastpath = localStorage.getItem('copytolastdir') || ''
              } else if (dataModalIsLiXian.value) {
                lastpath = localStorage.getItem('lixiantolastdir') || ''
              }
            }
            if (lastpath) {
              const finddir = PanHelper.GetDirByPath(treeDataList.list, lastpath)
              if (finddir) lastdir = finddir
            }

            dirExpandedKeys.value = [treeDataList.list[0].key, lastdir.key]
            dirSelectedKeys.value = [lastdir.key]
            dirSelectedItem.value = lastdir
          }
        }
      })

      function handleSave(cmd: string) {
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }

        if (!dirSelectedItem.value.key || !dirSelectedItem.value.path || !dirSelectedItem.value.name) {
          message.error('没有选择任何文件夹')
          return
        }

        if (dataModalKeyList.value.length <= 0) {
          message.error('数据错误，没有选择要操作的文件')
          return
        }

        if (localStorage) {
          if (dataModalIsFile.value) {
            localStorage.setItem('copytolastdir', dirSelectedItem.value.path)
          } else if (dataModalIsLiXian.value) {
            localStorage.setItem('lixiantolastdir', dirSelectedItem.value.path)
          }
        }

        if (dataModalIsFile.value && cmd === 'copy') {
          modalLoading.value = true
          APIFile.CopyFileToDir(userid, dataModalKeyList.value, dirSelectedItem.value.key).then((resp) => {
            modalLoading.value = false
            if (resp.success) {
              if (resp.async) {
                notification.open({
                  message: '复制文件操作成功',
                  description: '由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果',
                  duration: 6,
                })
              } else message.success('复制文件操作成功')
              const todir = dirSelectedItem.value
              StorePan.aModalSelectDir({ key: todir.key, path: todir.path, name: todir.name, sep: false, chd: 0 })
              StoreUI.mCloseModal()
            }
          })
        }
        if (dataModalIsFile.value && cmd === 'cut') {
          modalLoading.value = true
          APIFile.MoveFileToDir(userid, dataModalKeyList.value, dirSelectedItem.value.key).then((resp) => {
            modalLoading.value = false
            if (resp.success) {
              if (resp.async) {
                notification.open({
                  message: '移动文件操作成功',
                  description: '由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果',
                  duration: 6,
                })
              } else message.success('移动文件操作成功')

              const parentdir = PanHelper.GetParentDirByPath(StorePan.panDirList, dataModalPath.value)
              if (parentdir) {
                StorePan.aModalSelectDir({ key: parentdir.key, path: parentdir.path, name: parentdir.name, sep: false, chd: 0 })
              }
              const todir = dirSelectedItem.value
              StorePan.aModalSelectDir({ key: todir.key, path: todir.path, name: todir.name, sep: false, chd: 0 })
              StoreUI.mCloseModal()
            }
          })
        }

        if (dataModalIsLiXian.value && cmd === 'lixian') {
          modalLoading.value = true
          APIOffline.OfflineAdd(userid, dataModalKeyList.value, dirSelectedItem.value.path).then((result) => {
            modalLoading.value = false
            if (result > 0) message.success('操作成功，添加了 ' + result + ' 个离线任务')
            else message.error('操作失败，添加离线任务失败请重试')
            StoreUI.mCloseModal()
          })
        }
      }

      function onSelectDir(_: any, e: any) {
        const dir = e.node.dataRef as IDir
        dirSelectedItem.value = dir
        dirExpandedKeys.value = [treeDataList.list[0].key, dir.key]
        dirSelectedKeys.value = [dir.key]

        StorePan.aModalSelectDir({ key: dir.key, path: dir.path, name: dir.name, sep: false, chd: 0 })
      }

      function handleCancel() {
        if (modalLoading.value === true) {
          message.info('正在执行操作中，等待完成后才能关闭')
          return false
        }
        StoreUI.mCloseModal()
      }

      return {
        checkShowModal,
        modalLoading,
        dataTreeHeight,
        dirSelectedKeys,
        dirExpandedKeys,
        treeDataList,
        dataModalIsFile,
        dataModalIsLiXian,
        onSelectDir,
        handleSave,
        handleCancel,
      }
    },
  })
</script>

<style>
  .CopytoModal {
    max-width: 740px;
    min-width: 520px;
  }

  .CopytoModal .dirtree {
    min-height: 200px;
    overflow: auto;
    border-bottom: 1px solid #e8e8e8;
  }

  .CopytoModal .footbtn {
    padding: 16px 0;
    text-align: right;
  }
  .CopytoModal button.ant-btn {
    margin-left: 16px !important;
  }
</style>
