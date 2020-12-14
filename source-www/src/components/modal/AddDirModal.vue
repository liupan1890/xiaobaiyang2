<template>
  <a-modal key="AddDirModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel">
    <a-divider orientation="left">在当前目录下创建一个新的文件夹</a-divider>
    <div class="br"></div>
    <div class="ant-row ant-form-item" style="margin-bottom: 0">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-input-search id="adddirinput" v-model:value="inputValue" placeholder="输入新文件夹名" spellcheck="false" @search="handleSave">
              <template #enterButton>
                <a-button type="primary" :loading="modalLoading" style="line-height: 20px"> <span class="iconfont iconplus"></span>创建 </a-button>
              </template>
            </a-input-search>
          </span>
        </div>
      </div>
    </div>
    <p class="code-box-meta">
      文件夹路径以
      <code>/</code>
      作为分隔符，例如输入aaa/bbb/ccc将创建三级文件夹:
      <br />
      aaa
      <br />
      ....└─bbb
      <br />
      ..............└──ccc
    </p>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, watchEffect } from 'vue'
  import APIFile from '@/api/file'
  import { StoreUI } from '@/store/ui'
  import { StoreUser } from '@/store/user'
  import { StorePan } from '@/store/pan'
  import { message } from 'ant-design-vue'
  export default defineComponent({
    name: 'AddDirModal',

    setup() {
      const modalLoading = ref(false)
      const inputValue = ref('')
      const parentDirKey = ref('')
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'adddir')

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'adddir') {
          modalLoading.value = false
          inputValue.value = ''
          parentDirKey.value = ''
        } else {
          inputValue.value = ''
          parentDirKey.value = StorePan.panDirSelected.key
        }
      })

      function handleSave() {
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        if (parentDirKey.value === '') {
          message.error('父路径错误，请重新选择一个路径')
          return
        }
        if (parentDirKey.value === '6pan-search') {
          message.error('不能在搜索结果里创建文件夹，请重新选择一个路径')
          return
        }
        if (inputValue.value === '') {
          message.error('没填写要创建的文件夹名称')
          return
        }
        modalLoading.value = true
        APIFile.CreatDir(userid, parentDirKey.value, inputValue.value).then((result) => {
          modalLoading.value = false
          if (result) {
            StorePan.aRefreshDir()
            inputValue.value = ''
            message.success('创建文件夹成功')
            StoreUI.mCloseModal()
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
        inputValue,
        parentDirKey,
        handleSave,
        handleCancel,
      }
    },
  })
</script>

<style>
  .ant-divider .ant-divider-inner-text {
    color: #777;
  }
  .ant-divider {
    margin: 10px 0 4px 0;
  }
  .code-box-meta {
    font-size: 12px;
    padding: 0 26px 12px 26px;
    word-break: break-word;
    margin: 0;
    width: 100%;
  }
  .code-box-meta code {
    margin: 0 1px;
    background: #f2f4f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
    border: 1px solid #eee;
  }
</style>
