<template>
  <a-modal key="UploadModal" :visible="checkShowModal" title="" :footer="null" class="UploadModal" width="auto" @cancel="handleCancel">
    <a-divider orientation="left"> 上传文件/文件夹 到当前文件夹 </a-divider>
    <a-form layout="inline" style="margin-bottom: 12px">
      <a-form-item>
        <span style="width: 550px; display: block; line-height: 20px">
          <a>保存到网盘:</a>
          {{ uploadFileToPath }}
        </span>
      </a-form-item>
      <a-form-item style="margin-right: 0px; text-align: right">
        <a-button type="primary" :loading="modalLoading" @click="handleSave">开始上传 ({{ uploadFileCount }}) 个</a-button>
      </a-form-item>
    </a-form>

    <div class="uploaditemlistparent" :style="{ height: dataTreeHeight }">
      <VxeList class="uploaditemlist" :data="uploadFileList.list" :datats="uploadFileList.ts" :rowHeight="32" :scrollYMinCount="100" oncontextmenu="return false;">
        <template #default="{ items }">
          <div v-for="item in items" :key="item.filepath">
            <div class="filename">
              <div class="iconfont">
                <span :class="item.fileicon"></span>
              </div>
              <div class="title">
                <div>{{ item.filepath }}</div>
              </div>
              <div class="del">
                <button class="ant-btn ant-btn-link delbtn" @click="handleDelItem(item.filepath)">删除</button>
              </div>
            </div>
          </div>
        </template>
      </VxeList>
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, reactive, watchEffect } from 'vue'
  import APIFile from '@/api/file'
  import APIFileIcon from '@/api/fileicon'

  import { StoreUI } from '@/store/ui'
  import { StoreUser } from '@/store/user'
  import { message } from 'ant-design-vue'
  import VxeListComponent from '@/components/vxe-list'
  export default defineComponent({
    name: 'UploadModal',
    components: { VxeList: VxeListComponent },
    setup() {
      const modalLoading = ref(false)
      const dataTreeHeight = ref('300px')
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'upload')
      const uploadFileToPath = ref('')
      const uploadFileIsDir = ref(false)
      const uploadFileParentDir = ref('')
      const uploadFileList = reactive({ list: [] as any[], ts: 0 })
      const uploadFileCount = ref(0)

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'upload') {
          modalLoading.value = false
          uploadFileToPath.value = ''
          uploadFileList.list = []
          uploadFileList.ts = new Date().getTime()
          uploadFileCount.value = 0
        } else {
          dataTreeHeight.value = (document.body.clientHeight - 320).toString() + 'px'

          if (StoreUI.Modal.ModalData) {
            const data = StoreUI.Modal.ModalData
            uploadFileToPath.value = data.uploadFileToPath === '' || data.uploadFileToPath === '/' ? '/根目录' : data.uploadFileToPath
            uploadFileIsDir.value = data.uploadFileIsDir
            uploadFileParentDir.value = data.uploadFileParentDir
            const List = []
            const isdir = data.uploadFileIsDir
            for (let i = 0; i < data.filelist.length; i++) {
              const filepath = data.filelist[i]
              if (isdir) List.push({ filepath, fileicon: 'iconfile-folder' })
              else List.push({ filepath, fileicon: APIFileIcon.GetFileIconByPath(filepath) })
            }
            uploadFileList.list = List
            uploadFileList.ts = new Date().getTime()
            uploadFileCount.value = uploadFileList.list.length
            StoreUI.Modal.ModalData = undefined
          }
        }
      })

      function handleDelItem(filepath: string) {
        const List = []
        for (let i = 0; i < uploadFileList.list.length; i++) {
          const item = uploadFileList.list[i]
          if (item.filepath !== filepath) {
            List.push(item)
          }
        }
        if (uploadFileList.list.length !== List.length) {
          uploadFileList.list = List
          uploadFileCount.value = uploadFileList.list.length
        }
      }

      function handleSave() {
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }

        const filelist: string[] = []
        for (let i = 0; i < uploadFileList.list.length; i++) {
          filelist.push(uploadFileList.list[i].filepath)
        }

        if (filelist.length <= 0) {
          message.error('没有选择要上传的文件')
          return
        }

        const model = uploadFileIsDir.value ? 'dir' : 'file'
        modalLoading.value = true
        let savepath = uploadFileToPath.value
        if (savepath === '/根目录') savepath = '/'
        if (savepath === '') savepath = '/'

        APIFile.UploadFile(userid, savepath, model, uploadFileParentDir.value, filelist).then((resp) => {
          modalLoading.value = false
          if (resp.isdown) {
            message.success('操作成功,已添加 ' + resp.filecount + ' 个文件到上传队列中')
            StoreUI.mCloseModal()
          } else message.error('操作失败,没有文件被添加到上传队列中')
        })
      }
      function handleCancel() {
        if (modalLoading.value) {
          message.info('正在执行操作中，等待完成后才能关闭')
          return false
        }
        StoreUI.mCloseModal()
      }

      return {
        checkShowModal,
        modalLoading,
        dataTreeHeight,
        uploadFileToPath,
        uploadFileList,
        uploadFileCount,
        handleDelItem,
        handleSave,
        handleCancel,
      }
    },
  })
</script>

<style>
  .UploadModal.ant-modal {
    max-width: 740px;
    min-width: 520px;
  }

  .uploaditemlistparent {
    min-height: 300px;
    width: 100%;
    overflow: hidden;
    border-top: 1px solid #e8e8e8;
    margin-bottom: 8px;
    position: relative;
    display: flex;
  }
  .uploaditemlist {
    flex: 1 1 0%;
  }
  .uploaditemlist.vxe-list .vxe-list--virtual-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
    transition: all 0.5s ease-in;
    scroll-behavior: smooth;
  }
  .uploaditemlist .filename {
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

  .uploaditemlist .filename:hover {
    background-color: #f7f8fa !important;
  }

  .uploaditemlist .filename .iconfont {
    width: 24px;
    padding-left: 4px;
  }

  .uploaditemlist .filename .title {
    flex: 1 1 0%;
    overflow: hidden;
    cursor: default;
  }
  .uploaditemlist .filename .title > div {
    width: fit-content;
    max-width: 100%;
    height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .uploaditemlist .filename .size {
    padding-left: 8px;
  }
  .uploaditemlist .filename .del {
    width: 50px;
    text-align: center;
  }
  .uploaditemlist .filename .delbtn {
    font-size: 12px;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    min-width: 30px;
    height: 20px;
    line-height: 20px;
    padding: 0 2px;
  }
  .uploaditemlist .filename .delbtn:hover {
    background-color: rgba(207, 86, 89, 0.2);
  }
</style>
