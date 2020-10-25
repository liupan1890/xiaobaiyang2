<template>
  <div class="navUser">
    <a-spin :spinning="loading">
      <div class="icon6">
        6
      </div>
    </a-spin>
    <div class="user">
      <a-dropdown>
        <div class="ant-dropdown-link" @click="(e) => e.preventDefault()" :trigger="['hover', 'click']">
          <span class="username">{{ userSelected.username }}</span>
          <a-icon type="down" />
        </div>
        <a-menu slot="overlay" @click="handleNavUserClick">
          <template v-for="item in userList">
            <a-menu-item :key="item.key">
              <a-icon :type="item.isvip ? 'crown' : 'user'" />
              <span style="padding-right:12px;">{{ item.username }}</span>
              <a-icon v-if="item.key == userSelected.key" type="check" />
            </a-menu-item>
          </template>

          <a-menu-divider v-if="userList.length" />
          <a-menu-item key="add">
            <a-icon type="plus" />
            <span>添加一个6盘账号</span>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <div class="sep"></div>
    <div class="loginoff">
      <a-tooltip placement="bottom" title="修改此账号的设置" overlayClassName="MuiTooltip">
        <div class="loginoffbtn" v-on:click.stop="handleEditUser">
          <a-icon type="edit" />
        </div>
      </a-tooltip>
      <a-tooltip placement="bottom" title="删除此账号" overlayClassName="MuiTooltip">
        <div class="loginoffbtn" v-on:click.stop="handleDeleteUser">
          <a-icon type="delete" />
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: "NavUser",
  data: function() {
    return {};
  },
  components: {},

  computed: {
    loading: function() {
      return this.$store.state.UI.loading;
    },
    userSelected: function() {
      return this.$store.state.User.userSelected;
    },
    userList: function() {
      return this.$store.state.User.userList;
    },
  },
  methods: {
    handleNavUserClick: function(e) {
      let key = e.key;
      if (key == "add") {
        this.$store.commit("UI/mShowModal", { name: "adduser", data: {} });
      } else {
        this.$store.dispatch("User/aSelectUser", key);
      }
    },
    handleEditUser: function() {
      let key = this.userSelected.key;
      if (key == "add") {
        this.$message.error("请先登录一个6盘账号");
        return;
      }
      this.$store.dispatch("User/aRefreshUser", key);
      this.$store.commit("UI/mShowModal", { name: "edituser", data: { key } });
    },
    handleDeleteUser: function() {
      let key = this.userSelected.key;
      if (key == "add") {
        this.$message.error("请先登录一个6盘账号");
        return;
      }
      this.$store.dispatch("User/aDeleteUser", key);
    },
  },
};
</script>

<style>
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
