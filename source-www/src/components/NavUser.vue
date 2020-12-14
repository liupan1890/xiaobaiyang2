<template>
  <div class="navUser">
    <a-spin :spinning="loading">
      <div class="icon6">6</div>
    </a-spin>
    <div class="user">
      <a-dropdown>
        <div class="ant-dropdown-link" :trigger="['hover', 'click']" @click="(e) => e.preventDefault()">
          <span class="username">{{ userSelected.username }}</span>
          <span class="iconfont icondown"></span>
        </div>
        <template #overlay>
          <a-menu @click="handleNavUserClick">
            <a-menu-item v-for="item in userList" :key="item.key">
              <span v-if="item.isvip" class="iconfont iconcrown"></span>
              <span v-else class="iconfont iconuser"></span>
              <span style="padding-right: 12px">{{ item.username }}</span>
              <span v-if="item.key === userSelected.key" class="iconfont iconcheck"></span>
            </a-menu-item>

            <a-menu-divider v-if="userList.length" />
            <a-menu-item key="add">
              <span class="iconfont iconplus"></span>
              <span>添加一个6盘账号</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="sep"></div>
    <div class="loginoff">
      <a-tooltip placement="bottom" title="修改此账号的设置" overlayClassName="MuiTooltip">
        <div class="loginoffbtn" @click.stop="handleEditUser">
          <span class="iconfont iconedit-square"></span>
        </div>
      </a-tooltip>
      <a-tooltip placement="bottom" title="删除此账号" overlayClassName="MuiTooltip">
        <div class="loginoffbtn" @click.stop="handleDeleteUser">
          <span class="iconfont icondelete"></span>
        </div>
      </a-tooltip>
    </div>
  </div>
</template>
<script lang="ts">
  import { message } from 'ant-design-vue'
  import { defineComponent, computed } from 'vue'
  import { StoreUser } from '@/store/user'
  import { StoreUI } from '@/store/ui'
  export default defineComponent({
    name: 'NavUser',
    setup() {
      const loading = computed(() => StoreUI.Loading)
      const userSelected = computed(() => StoreUser.UserSelected)
      const userList = computed(() => StoreUser.UserList)

      function handleNavUserClick(e: any) {
        const key = e.key
        if (key === 'add') {
          StoreUI.mShowModal({ ModalName: 'adduser' })
        } else {
          StoreUser.aSelectUser(key)
        }
      }

      function handleEditUser() {
        const key = StoreUser.UserSelected.key
        if (key === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        StoreUser.aRefreshUser({ userid: key, loginHead: '' })
        StoreUI.mShowModal({ ModalName: 'edituser' })
      }

      function handleDeleteUser() {
        const key = StoreUser.UserSelected.key
        if (key === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        StoreUser.aDeleteUser(key)
      }

      return {
        loading,
        userSelected,
        userList,
        handleNavUserClick,
        handleEditUser,
        handleDeleteUser,
      }
    },
  })
</script>

<style>
  /**                navUser            */
  .navUser {
    width: 100%;
    height: 40px;
    padding: 8px 18px;

    display: flex;
    align-items: center;
    justify-content: center;
  }
  .navUser .icon6 {
    background: #df5659;
    width: 24px;
    height: 24px;
    border-radius: 3px;
    overflow: hidden;
    display: -webkit-box;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    font-size: 21px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 24px;
    position: relative;
  }
  .navUser .user {
    flex-grow: 0;
    flex-shrink: 1;

    margin-left: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 24px;
    font-size: 16px;
    font-weight: bold;
    color: #312727;
    cursor: pointer;
  }
  .navUser .user .username {
    min-width: 60px;
    max-width: 157px;
    height: 24px;
    line-height: 24px;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-flex;
  }
  .navUser .user .anticon.anticon-down {
    height: 24px;
    line-height: 24px;
  }

  .navUser .user svg {
    font-size: 16px;
  }
  .navUser .sep {
    flex: 1 1 0%;
  }
  .navUser:hover {
    background: #eeecec;
  }
  .navUser .loginoff {
    display: flex;
  }
  .navUser .loginoffbtn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    opacity: 0;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms !important;
    cursor: pointer;
    margin-left: 8px;
  }
  .navUser:hover .loginoffbtn {
    opacity: 1;
  }
  .navUser:hover .loginoffbtn:hover {
    background-color: rgba(216, 210, 210, 0.6);
  }
</style>
