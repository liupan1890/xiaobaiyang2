<template>
  <a-modal key="RemotePasswordModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel">
    <a-divider orientation="left"> 远程管理密码 </a-divider>
    <p class="code-box-meta"></p>
    <br />
    <div class="ant-row ant-form-item">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-input-search v-model:value="dataPassword" placeholder="输入管理密码" spellcheck="false" draggable="false" @search="handleSave">
              <template #enterButton>
                <a-button type="primary" :loading="modalLoading" style="line-height: 20px"> 确定 </a-button>
              </template>
            </a-input-search>

            <span class="ant-form-explain" style="margin-left: 10px; color: #f5222d">{{ modalError }}</span>
          </span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, watchEffect } from 'vue'
  import { StoreUI } from '@/store/ui'
  import md5 from 'md5'
  export default defineComponent({
    name: 'RemotePasswordModal',
    setup() {
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'remotepassword')
      const modalError = ref('')
      const dataPassword = ref('')
      const ts = ref(0)

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'remotepassword') {
          modalError.value = ''
          dataPassword.value = ''
        } else {
          modalError.value = ''
          dataPassword.value = ''
          ts.value = new Date().getTime()
        }
      })
      function handleSave() {
        if (dataPassword.value === '') {
          modalError.value = '请输入远程管理密码'
          return
        }
        localStorage['RemotePassword'] = md5(dataPassword.value)
        location.reload()
      }
      function handleCancel() {
        modalError.value = ''
        dataPassword.value = ''
        StoreUI.mCloseModal()
      }

      return {
        checkShowModal,
        dataPassword,
        modalError,
        handleCancel,
        handleSave,
      }
    },
  })
</script>

<style></style>
