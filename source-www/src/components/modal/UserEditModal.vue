<template>
  <a-modal key="UserEditModal" :visible="checkShowModal" :footer="null" :destroyOnClose="true" @cancel="handleCancel">
    <a-tabs default-active-key="1" style="min-height: 340px" class="useredittabs" @change="handleTabChange">
      <a-tab-pane key="1" tab="个人信息" :forceRender="true">
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <a-form-item label="用户ID" style="margin: 0">
            <span class="ant-form-text">
              {{ userData.userID }}
            </span>
          </a-form-item>
          <a-form-item label="注册时间" style="margin: 0">
            <span class="ant-form-text">
              {{ userData.userCreatTime }}
            </span>
          </a-form-item>
          <a-form-item label="手机" style="margin: 0">
            <span class="ant-form-text">
              {{ userData.userPhone }}
            </span>
          </a-form-item>
          <a-form-item label="订阅" style="margin: 0">
            <span class="ant-form-text">
              <span v-if="userData.isvip" class="iconfont iconcrown"></span>
              {{ userData.userVIPDate }}
              <a href="https://v3-beta.6pan.cn/subscribe/plans" target="_blink" style="margin-left: 8px">订阅6盘会员</a>
            </span>
          </a-form-item>

          <a-form-item label="用户名">
            <a-input v-model:value="userData.userName" spellcheck="false" />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 15, offset: 7 }" style="margin-bottom: 8px">
            <a-button type="primary" @click.stop="handleSaveUserName">修改</a-button>
            <span class="ant-form-explain" style="padding-left: 16px; color: #f5222d; display: inline-block; line-height: 14px">{{ usereditError }}</span>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="修改密码" :forceRender="true">
        <br />
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <a-form-item label="原登录密码">
            <a-input-password v-model:value="userPassword" spellcheck="false" />
          </a-form-item>
          <a-form-item label="新登录密码">
            <a-input-password v-model:value="userNewPassword" spellcheck="false" />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 15, offset: 7 }">
            <a-button type="primary" @click.stop="handleSaveUserPassword">修改</a-button>
            <span class="ant-form-explain" style="padding-left: 16px; color: #f5222d; display: inline-block; line-height: 14px">{{ usereditError }}</span>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="3" tab="WebDav" :forceRender="true">
        <div class="ant-descriptions-title" style="text-align: center">
          只有6盘的订阅用户才能使用WebDav功能
          <a href="https://www.cnblogs.com/6pan/p/13546426.html" target="_blink" style="margin-left: 16px">使用帮助</a>
        </div>
        <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-form-item label="地址">
            <a-input spellcheck="false" :defaultValue="webDav" />
          </a-form-item>
          <a-form-item label="用户名" help="部分系统可能不支持中文和特殊字符">
            <a-input spellcheck="false" :value="userData.userName2" />
          </a-form-item>
          <a-form-item label="第二用户名" help="如用户名无法登录,尝试使用这个">
            <a-input spellcheck="false" :value="userData.userSalt" />
          </a-form-item>
          <a-form-item label="密码" style="margin-bottom: 0">
            <span class="ant-form-text"> 密码即为您的登录密码 </span>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="4" tab="其他功能" :forceRender="true">
        <div class="ant-descriptions-title" style="text-align: center">
          涉及短信验证码，需使用6盘官方网页版:
          <a href="https://v3-beta.6pan.cn/settings/profile" target="_blink" style="margin-left: 16px">6pan.cn</a>
        </div>
        <ul style="margin-left: 15%">
          <li>通过手机验证码修改密码</li>
          <li>更换绑定的手机号</li>
          <li>删除账户</li>
        </ul>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script lang="ts">
  import { FormatDate } from '@/utils/Format'
  import { defineComponent, computed, ref, reactive, watchEffect } from 'vue'
  import { StoreUser } from '@/store/user'
  import { StoreUI } from '@/store/ui'
  import { StoreConfig } from '@/store/config'
  export default defineComponent({
    name: 'UserEditModal',
    setup() {
      const modalLoading = ref(false)
      const usereditError = ref('')

      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'edituser')

      const userPassword = ref('')
      const userNewPassword = ref('')

      const userData = reactive({
        userName: '',
        userName2: '',
        userCreatTime: '',
        userPhone: '',
        userID: '',
        userVIPDate: '',
        isvip: false,
        userSalt: '',
      })

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'edituser') {
          modalLoading.value = false
        }

        userData.userID = StoreUser.UserSelected.key
        userData.userName = StoreUser.UserSelected.username
        userData.userName2 = StoreUser.UserSelected.username
        userData.userCreatTime = FormatDate(new Date(StoreUser.UserSelected.createTime), 'YYYY年M月D日')
        userData.userPhone = '+' + StoreUser.UserSelected.countryCode + ' ' + StoreUser.UserSelected.phone.replace('***', '*****')
        userData.isvip = StoreUser.UserSelected.isvip
        userData.userSalt = StoreUser.UserSelected.salt
        userData.userVIPDate = StoreUser.UserSelected.vipdate === '' ? '未订阅会员' : StoreUser.UserSelected.vipdate + (StoreUser.UserSelected.isvip ? '' : '已过期')
      })

      const webDav = computed(() => StoreConfig.ServerConfig.ServerWebDav)

      function handleSaveUserName() {
        const username = userData.userName.trim()
        if (username === userData.userName2.trim()) {
          usereditError.value = '新用户名不能和原用户名相同'
          return
        }
        modalLoading.value = true
        StoreUser.aEditUserName({ userid: userData.userID, username }).then(() => {
          modalLoading.value = false
        })
      }

      function handleSaveUserPassword() {
        const password = userPassword.value.trim()
        const newpassword = userNewPassword.value.trim()
        if (password === newpassword) {
          usereditError.value = '新密码不能和原密码相同'
          return
        }
        modalLoading.value = true
        StoreUser.aEditUserPassword({ userid: userData.userID, password, newpassword }).then(() => {
          modalLoading.value = false
        })
      }

      function handleTabChange() {
        usereditError.value = ''
        userPassword.value = ''
        userNewPassword.value = ''
      }
      function handleCancel() {
        if (modalLoading.value === true) return
        usereditError.value = ''
        userPassword.value = ''
        userNewPassword.value = ''
        StoreUI.mCloseModal()
      }

      return {
        checkShowModal,
        modalLoading,
        usereditError,
        userData,
        webDav,
        userPassword,
        userNewPassword,
        handleSaveUserName,
        handleSaveUserPassword,
        handleTabChange,
        handleCancel,
      }
    },
  })
</script>

<style>
  .useredittabs .ant-tabs-nav .ant-tabs-tab {
    margin-right: 8px;
  }
</style>
