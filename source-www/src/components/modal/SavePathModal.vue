<template>
  <a-modal key="SavePathModal" :visible="checkShowModal" :footer="null" @cancel="handleCancel">
    <a-divider orientation="left">每次下载时都要求我选择下载位置</a-divider>

    <a-form layout="vertical" class="settingform">
      <a-form-item label="下载保存位置" help="下载文件会按6盘里完整路径保存，选短点例如 D:\Down\">
        <a-input-search v-model:value="dataSavePath" spellcheck="false" @search="handleSelectSavePath">
          <template #enterButton>
            <a-button :loading="modalLoading"> <span class="iconfont iconfolder"></span>选择 </a-button>
          </template>
        </a-input-search>
      </a-form-item>
      <br />
      <a-form-item style="text-align: right; margin-bottom: 0">
        <span class="code-box-meta" style="text-align: left">如果不需要更改下载位置，直接点击 继续</span>
        <a-button :loading="modalLoading" type="primary" @click="handleDownFiles"> 继续 </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, watchEffect } from 'vue'
  import APIFile from '@/api/file'
  import { StoreConfig } from '@/store/config'
  import { StoreUI } from '@/store/ui'
  import { message } from 'ant-design-vue'
  import { StoreUser } from '@/store/user'
  export default defineComponent({
    name: 'VerUpdateModal',
    setup() {
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'savepath')
      const modalLoading = ref(false)
      const dataSavePath = ref('')
      const dataDownFileKey = ref('')
      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'savepath') {
          modalLoading.value = false
          dataSavePath.value = ''
        } else {
          dataSavePath.value = StoreConfig.UserSetting.SavePath
          dataDownFileKey.value = StoreUI.Modal.ModalData || ''
        }
      })
      function handleSelectSavePath() {
        if (window.WebShowOpenDialogSync) {
          modalLoading.value = true
          window.WebShowOpenDialogSync({ title: '选择一个文件夹，把所有文件下载到此文件夹内', buttonLabel: '选择', properties: ['openDirectory'] }, (result: string[] | undefined) => {
            if (result && result[0]) {
              StoreConfig.aUpdateSetting({ key: 'SavePath', value: result[0] }).then(() => {
                StoreConfig.aRefresh().then(() => {
                  modalLoading.value = false
                  dataSavePath.value = StoreConfig.UserSetting.SavePath
                })
              })
            } else {
              message.error('没有选择任何文件')
              modalLoading.value = false
            }
          })
        } else {
          message.error('需要Electron环境支持')
        }
      }
      function handleDownFiles() {
        if (StoreConfig.UserSetting.SavePath === '') {
          message.error('下载保存位置不能为空')
          return
        }
        if (dataDownFileKey.value === '') {
          message.error('找不到要下载的文件')
          return
        }
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        const hide = message.loading('操作中，请耐心等待...', 0)
        APIFile.DownFile(userid, dataDownFileKey.value).then((resp) => {
          hide()
          if (resp.isdown) {
            message.success('操作成功，创建 ' + resp.filecount + ' 个文件的下载任务')
          }
          StoreUI.mCloseModal()
        })
      }
      function handleCancel() {
        StoreUI.mCloseModal()
      }

      return {
        checkShowModal,
        modalLoading,
        dataSavePath,
        handleSelectSavePath,
        handleDownFiles,
        handleCancel,
      }
    },
  })
</script>

<style></style>
