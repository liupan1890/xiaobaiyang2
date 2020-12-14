<template>
  <a-modal key="ShowDocModal" :visible="checkShowModal" title="" :footer="null" class="ShowDocModal" @cancel="handleCancel">
    <a-button class="refresh" type="link" @click="handleRefresh"> <span class="iconfont iconsync"></span>刷新 </a-button>
    <a-button class="title" type="link">
      {{ doctitle }}
    </a-button>

    <div class="docmodal">
      <a-spin :spinning="modalLoading" tip="文件加载中...文件体积>10MB时加载非常慢" />
      <div v-if="doccontext" class="doccontext"><a :href="doccontext" class="doclink" referrerpolicy="no-referrer" rel="no-referrer" target="_blink">点击打开预览</a></div>
      <div v-if="!modalLoading && !doccontext" class="doccontext">此文件暂无预览</div>
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, watchEffect } from 'vue'
  import APIPreview from '@/api/preview'
  import { StoreUI } from '@/store/ui'
  import { StoreUser } from '@/store/user'
  import { message } from 'ant-design-vue'
  export default defineComponent({
    name: 'ShowDocModal',
    setup() {
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'showdoc')
      const modalLoading = ref(false)
      let fileItem = { key: '', path: '', name: '', sizestr: '' }
      const doccontext = ref('')
      const doctitle = ref('')

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'showdoc') {
          modalLoading.value = false
        } else if (StoreUI.Modal.ModalData) {
          if (fileItem.key === StoreUI.Modal.ModalData.key) return
          fileItem = { ...StoreUI.Modal.ModalData }
          doctitle.value = fileItem.name + '   ' + fileItem.sizestr
          doccontext.value = ''
          handleRefresh()
        } else {
          fileItem = { key: '', path: '', name: '', sizestr: '' }
          doctitle.value = ''
          doccontext.value = ''
        }
      })

      function handleRefresh() {
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        modalLoading.value = true
        APIPreview.PreviewDocument(userid, fileItem.key).then((result) => {
          modalLoading.value = false
          if (result) {
            doccontext.value = result
          } else {
            doccontext.value = ''
          }
        })
      }
      function handleCancel() {
        StoreUI.mCloseModal()
      }

      return {
        checkShowModal,
        modalLoading,
        doctitle,
        doccontext,

        handleRefresh,
        handleCancel,
      }
    },
  })
</script>

<style>
  .ShowDocModal .docmodal {
    width: 100%;
    min-height: 360px;
    padding-top: 32px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .ShowDocModal .refresh {
    position: absolute;
    top: 12px;
    left: 6px;
    line-height: 18px;
  }
  .ShowDocModal .refresh > span {
    line-height: 18px;
  }
  .ShowDocModal .title {
    position: absolute;
    top: 12px;
    left: 86px;
    overflow: hidden;
    max-width: 75%;
    text-overflow: ellipsis;
    line-height: 18px;
  }
  .ShowDocModal .doclink {
    font-size: 24px;
    text-decoration: underline;
  }
</style>
