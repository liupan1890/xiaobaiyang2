<template>
  <a-modal key="ShowTxtModal" :visible="checkShowModal" :width="dialogWidth" :dialogStyle="dialogStyle" title="" :footer="null" class="ShowTxtModal" @cancel="handleCancel">
    <a-button class="fullscreen" type="link" @click="handleFullScreen"> <span class="iconfont iconfullscreen"></span>全屏 </a-button>
    <a-button class="refresh" type="link" @click="handleRefresh"> <span class="iconfont iconsync"></span>刷新 </a-button>
    <a-button class="title" type="link">
      {{ txttitle }}
    </a-button>

    <div class="txtmodal">
      <a-spin :spinning="modalLoading" tip="文件加载中..." />
      <div class="txtcontext">{{ txtcontext }}</div>
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, watchEffect } from 'vue'
  import APIFile from '@/api/file'
  import { StoreUI } from '@/store/ui'
  import { StoreUser } from '@/store/user'
  import { message } from 'ant-design-vue'
  export default defineComponent({
    name: 'ShowTxtModal',
    setup() {
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'showtxt')
      const modalLoading = ref(false)
      let fileItem = { key: '', path: '', name: '', sizestr: '' }
      const txtcontext = ref('')
      const txttitle = ref('')
      const dialogWidth = ref('520px')
      const dialogStyle = ref({})

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'showtxt') {
          modalLoading.value = false
        } else if (StoreUI.Modal.ModalData) {
          if (fileItem.key === StoreUI.Modal.ModalData.key) return
          fileItem = { ...StoreUI.Modal.ModalData }
          txttitle.value = fileItem.name + '   ' + fileItem.sizestr
          txtcontext.value = 'loading'
          handleRefresh()
        } else {
          fileItem = { key: '', path: '', name: '', sizestr: '' }
          txttitle.value = ''
          txtcontext.value = ''
        }
      })
      function handleFullScreen() {
        if (dialogWidth.value !== '98%') {
          dialogWidth.value = '98%'
          dialogStyle.value = { top: '20px' }
        } else {
          dialogWidth.value = '520px'
          dialogStyle.value = {}
        }
      }
      function handleRefresh() {
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        modalLoading.value = true
        APIFile.DownTxt(userid, fileItem.key).then((result) => {
          modalLoading.value = false
          txtcontext.value = result
        })
      }
      function handleCancel() {
        StoreUI.mCloseModal()
      }

      return {
        checkShowModal,
        modalLoading,
        txttitle,
        txtcontext,
        dialogWidth,
        dialogStyle,
        handleFullScreen,
        handleRefresh,
        handleCancel,
      }
    },
  })
</script>

<style>
  .ShowTxtModal .txtmodal {
    width: 100%;
    min-height: 360px;
    padding-top: 32px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .ShowTxtModal .txtcontext {
    line-height: 16px;
    font-size: 13px;
    padding: 13px 20px;
    background-color: #f7f9fc;
    border-radius: 6px;
    min-height: 330px;
    width: 100%;
    word-break: break-all;
    white-space: pre-wrap;
    word-wrap: normal;
    text-align: left;
    overflow-x: auto;
    user-select: text !important;
  }

  .ShowTxtModal .fullscreen {
    position: absolute;
    top: 12px;
    left: 6px;
    line-height: 18px;
  }
  .ShowTxtModal .fullscreen > span {
    line-height: 18px;
  }
  .ShowTxtModal .refresh {
    position: absolute;
    top: 12px;
    left: 80px;
    line-height: 18px;
  }
  .ShowTxtModal .refresh > span {
    line-height: 18px;
  }
  .ShowTxtModal .title {
    position: absolute;
    top: 12px;
    left: 160px;
    overflow: hidden;
    max-width: 60%;
    text-overflow: ellipsis;
    line-height: 18px;
  }
</style>
