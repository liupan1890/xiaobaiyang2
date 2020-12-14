<template>
  <a-modal key="RenameModal" :visible="checkShowModal" title="" :footer="null" :destroyOnClose="true" @cancel="handleCancel">
    <a-divider orientation="left">修改文件名</a-divider>
    <br />
    <div class="ant-row ant-form-item" style="margin-bottom: 12px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-textarea v-model:value="dataFileName" placeholder="输入新文件名" draggable="false" spellcheck="false" :auto-size="{ minRows: 4, maxRows: 6 }" />
          </span>
        </div>
      </div>
    </div>
    <div class="ant-row ant-form-item">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control" style="text-align: right">
          <span class="ant-form-item-children">
            <a-button type="primary" :loading="modalLoading" style="line-height: 20px" @click="handleSave"> 重命名 </a-button>
          </span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, watchEffect } from 'vue'
  import APIFile from '@/api/file'
  import { StoreUI } from '@/store/ui'
  import { StoreUser } from '@/store/user'
  import { IFile, StorePan } from '@/store/pan'
  import { message, notification } from 'ant-design-vue'
  export default defineComponent({
    name: 'RenameModal',

    setup() {
      const modalLoading = ref(false)
      const dataFileName = ref('')
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'rename')

      let selectedFile = {} as IFile

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'rename') {
          modalLoading.value = false
          dataFileName.value = ''
        } else {
          selectedFile = StoreUI.Modal.ModalData || ({} as IFile)
          dataFileName.value = selectedFile.name
        }
      })

      function handleSave() {
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return ''
        }
        modalLoading.value = true
        APIFile.RenameFile(userid, selectedFile.key, dataFileName.value).then((resp) => {
          modalLoading.value = false
          StorePan.aRefreshDir()
          StoreUI.mCloseModal()
          if (resp.async) {
            notification.open({
              message: '操作成功',
              description: '由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果',
              duration: 6,
            })
          } else {
            message.success('修改文件名，操作成功')
          }
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
        dataFileName,
        handleSave,
        handleCancel,
      }
    },
  })
</script>

<style></style>
