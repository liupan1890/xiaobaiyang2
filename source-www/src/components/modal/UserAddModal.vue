<template>
  <a-modal id="useraddModal" key="useraddModal" :visible="checkShowModal" :footer="null" :destroyOnClose="true" @cancel="handleCancel">
    <a-tabs :default-activeKey="activeKey" style="min-height: 260px" @change="handletabChange">
      <a-tab-pane key="1" tab="手机号" :forceRender="true">
        <a-form ref="refform1" :model="form1" :rules="rules1" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-form-item label="国家/地区" name="phonecode">
            <a-select v-model:value="form1.phonecode">
              <a-select-option value="86">中国大陆 (+86)</a-select-option>
              <a-select-option value="852">中国香港 (+852)</a-select-option>
              <a-select-option value="853">中国澳门 (+853)</a-select-option>
              <a-select-option value="886">中国臺灣 (+886)</a-select-option>
              <a-select-option value="44">United Kiongdom (+44)</a-select-option>
              <a-select-option value="1">U.S.A (+1)</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="手机号" name="phone">
            <a-input v-model:value="form1.phone" spellcheck="false" />
          </a-form-item>
          <a-form-item label="登录密码" name="phonepassword">
            <a-input v-model:value="form1.phonepassword" spellcheck="false" />
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="用户名" :forceRender="true">
        <br />
        <a-form ref="refform2" :model="form2" :rules="rules2" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-form-item label="用户名" name="username">
            <a-input v-model:value="form2.username" spellcheck="false" />
          </a-form-item>
          <a-form-item label="登录密码" name="userpassword">
            <a-input v-model:value="form2.userpassword" spellcheck="false" />
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="3" tab="Cookies" :forceRender="true">
        <a-form ref="refform3" :model="form3" :rules="rules3" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <div class="ant-row ant-form-item" style="line-height: 20px; margin: 0 0 12px 0">
            <div class="ant-col ant-col-5 ant-form-item-label"></div>
            <div class="ant-col ant-col-17 ant-form-item-control-wrapper">
              <div class="ant-form-item-control" style="line-height: 20px">
                <span class="ant-form-item-children"> <span class="desctip">怎样获得浏览器cookie请去看[操作教程]</span><br /> </span>
              </div>
            </div>
          </div>
          <a-form-item label="Cookies" name="cookie" style="margin-bottom: 8px">
            <a-textarea v-model:value="form3.cookie" :auto-size="{ minRows: 6, maxRows: 6 }" spellcheck="false" placeholder="Cookie: token=......; token.sig=......" />
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
    <div class="ant-row ant-form-item" style="margin-bottom: 16px">
      <div class="ant-col ant-col-5 ant-form-item-label"></div>
      <div class="ant-col ant-col-17 ant-form-item-control-wrapper">
        <div class="ant-form-item-control" style="line-height: 32px">
          <a-button key="submit" type="primary" :loading="modalLoading" @click.stop="handleUserAddLogin"> 登录 </a-button>
          <span class="ant-form-explain" style="padding-left: 16px; color: #f5222d; display: inline-block; line-height: 14px; max-width: 270px">{{ useraddError }}</span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, unref, reactive, watchEffect } from 'vue'
  import { IUserLogin, StoreUser } from '@/store/user'
  import { StoreUI } from '@/store/ui'
  export default defineComponent({
    name: 'UserAddModal',
    setup() {
      const modalLoading = ref(false)
      const useraddError = ref('')
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'adduser')

      const activeKey = ref('1')
      const refform1 = ref<any>(null)
      const form1 = reactive({ phonecode: '86', phone: '', phonepassword: '' })
      const rules1 = {
        phonecode: [{ required: true, message: '请选择区号', whitespace: true, trigger: 'change' }],
        phone: [
          { required: true, message: '请输入手机号', whitespace: true, trigger: 'change' },
          { min: 6, message: '手机号最短也要有6位', trigger: 'change' },
        ],
        phonepassword: [
          { required: true, message: '请输入登录密码', whitespace: true, trigger: 'change' },
          { min: 6, message: '登录密码最短也要有6位', trigger: 'change' },
        ],
      }
      const refform2 = ref<any>(null)
      const form2 = reactive({ username: '', userpassword: '' })
      const rules2 = {
        username: [{ required: true, message: '请输入用户名', whitespace: true, trigger: 'change' }],
        userpassword: [
          { required: true, message: '请输入登录密码', whitespace: true, trigger: 'change' },
          { min: 6, message: '登录密码最短也要有6位', trigger: 'change' },
        ],
      }
      const refform3 = ref<any>(null)
      const form3 = reactive({ cookie: '' })
      const rules3 = {
        cookie: [
          { required: true, message: '请完整粘贴[Cookie: token=......; token.sig=......]', whitespace: true, trigger: 'change' },
          { min: 400, max: 700, message: 'Cookie: token=......最短400字符，最长700字符', trigger: 'change' },
        ],
      }
      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'adduser') {
          modalLoading.value = false
          useraddError.value = ''
          form1.phonecode = '86'
          form1.phone = ''
          form1.phonepassword = ''
          form2.username = ''
          form2.userpassword = ''
          form3.cookie = ''
        }
      })
      function handletabChange(key: string) {
        activeKey.value = key
        useraddError.value = ''
        const r1 = unref(refform1)
        if (r1) r1.resetFields()
        const r2 = unref(refform2)
        if (r2) r2.resetFields()
        const r3 = unref(refform3)
        if (r3) r3.resetFields()
      }
      function handleCancel() {
        if (modalLoading.value === true) return
        useraddError.value = ''
        const r1 = unref(refform1)
        if (r1) r1.resetFields()
        const r2 = unref(refform2)
        if (r2) r2.resetFields()
        const r3 = unref(refform3)
        if (r3) r3.resetFields()
        StoreUI.mCloseModal()
      }

      function login(form: any, login: IUserLogin) {
        if (login.mode === 'cookie') {
          if (login.cookie.indexOf('Cookie:') < 0 || login.cookie.indexOf('token=') < 0 || login.cookie.indexOf('token.sig=') < 0) {
            useraddError.value = '格式错误 [Cookie: token=......'
            return
          }
        }

        form
          .validate()
          .then(() => {
            modalLoading.value = true
            StoreUser.aAddUser(login).then((result) => {
              modalLoading.value = false
              if (result === 'success') {
                handleCancel()
              } else {
                useraddError.value = result
              }
            })
          })
          .catch(() => {
            modalLoading.value = false
            useraddError.value = '请检查你填写的内容'
          })
      }
      function handleUserAddLogin() {
        if (activeKey.value === '1') {
          const from = unref(refform1)
          if (from) {
            login(from, { mode: 'phone', country: form1.phonecode, phone: form1.phone, password: form1.phonepassword, name: '', cookie: '' })
          }
        } else if (activeKey.value === '2') {
          const from = unref(refform2)
          if (from) {
            login(from, { mode: 'user', country: '', phone: '', password: form2.userpassword, name: form2.username, cookie: '' })
          }
        } else if (activeKey.value === '3') {
          const from = unref(refform3)
          if (from) {
            login(from, { mode: 'cookie', country: '', phone: '', password: '', name: '', cookie: form3.cookie })
          }
        }
      }

      return {
        checkShowModal,
        modalLoading,
        useraddError,
        activeKey,
        refform1,
        form1,
        rules1,
        refform2,
        form2,
        rules2,
        refform3,
        form3,
        rules3,
        handletabChange,
        handleCancel,
        handleUserAddLogin,
      }
    },
  })
</script>

<style></style>
