<template>
  <a-modal key="UserEditModal" id="UserEditModal" :visible="checkShowModal" :footer="null" @cancel="handleCancel">
    <a-tabs default-active-key="1" style="min-height:260px" @change="handleTabChange">
      <a-tab-pane key="1" tab="个人信息" :forceRender="true">
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
          <a-form-item label="用户ID" style="margin:0">
            <span class="ant-form-text">
              {{ dataUserID }}
            </span>
          </a-form-item>
          <a-form-item label="注册时间" style="margin:0">
            <span class="ant-form-text">
              {{ dataCreatTime }}
            </span>
          </a-form-item>
          <a-form-item label="手机" style="margin:0">
            <span class="ant-form-text">
              {{ dataPhone }}
            </span>
          </a-form-item>
          <a-form-item label="订阅" style="margin:0">
            <span class="ant-form-text">
              <a-icon v-if="dataUserIsVIP" type="crown" />
              {{ dataUserVIPDate }}
              <a href="https://v3-beta.6pan.cn/subscribe/plans" target="_blink" style="margin-left:8px">订阅6盘会员</a>
            </span>
          </a-form-item>

          <a-form-item label="用户名">
            <a-input v-model="dataUserName" spellcheck="false" />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 12, offset: 7 }">
            <a-button type="primary" @click.stop="handleSaveUserName">修改</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="修改密码" :forceRender="true">
        <a-form :form="form2" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
          <a-form-item label="原登录密码">
            <a-input
              spellcheck="false"
              v-decorator="[
                'userpassword',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入原登录密码(长6-50位)',
                      whitespace: true,
                      min: 6,
                      max: 50,
                    },
                  ],
                },
              ]"
            />
          </a-form-item>
          <a-form-item label="新登录密码">
            <a-input
              spellcheck="false"
              v-decorator="[
                'usernewpassword',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入新的登录密码(长6-50位)',
                      whitespace: true,
                      min: 6,
                      max: 50,
                    },
                  ],
                },
              ]"
            />
          </a-form-item>

          <a-form-item :wrapper-col="{ span: 12, offset: 7 }">
            <a-button type="primary" @click.stop="handleSaveUserPassword">修改</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="3" tab="WebDav" :forceRender="true">
        <div class="ant-descriptions-title" style="text-align:center">
          只有订阅用户才能使用WebDav功能
          <a href="https://www.cnblogs.com/6pan/p/13546426.html" target="_blink" style="margin-left:16px">使用帮助</a>
        </div>
        <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" @submit="handleSubmit">
          <a-form-item label="地址">
            <a-input spellcheck="false" :defaultValue="webdav" />
          </a-form-item>
          <a-form-item label="用户名" help="部分系统可能不支持中文和特殊字符">
            <a-input spellcheck="false" :value="dataUserName" />
          </a-form-item>
          <a-form-item label="第二用户名" help="如用户名无法登录,尝试使用这个">
            <a-input spellcheck="false" :value="dataUserSalt" />
          </a-form-item>
          <a-form-item label="密码">
            <span class="ant-form-text">
              密码即为您的登录密码
            </span>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="4" tab="其他功能" :forceRender="true">
        <div class="ant-descriptions-title" style="text-align:center">
          涉及短信验证码，需使用6盘官方网页版:
          <a href="https://v3-beta.6pan.cn/settings/profile" target="_blink" style="margin-left:16px">6pan.cn</a>
        </div>
        <ul style="margin-left:15%">
          <li>通过手机验证码修改密码</li>
          <li>更换绑定的手机号</li>
          <li>删除账户</li>
        </ul>
      </a-tab-pane>
    </a-tabs>
    <div class="ant-row ant-form-item" style="margin-bottom:0">
      <div class="ant-col ant-col-7 ant-form-item-label"></div>
      <div class="ant-col ant-col-15 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-explain" style="color: #f5222d;">{{ modalError }}</span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { FormatDate } from "../../store/data.js";
export default {
  name: "UserEditModal",
  data: function() {
    return {
      modalLoading: false,
      modalError: "",
      dataCreatTime: "",
      userkey: "",
      dataUserID: "",
      dataPhone: "",
      dataUserName: "",
      dataUserSalt: "",
      dataUserIsVIP: false,
      dataUserVIPDate: "",
      form2: this.$form.createForm(this, { name: "usereditform2" }),
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "edituser";
    },
    userSelected: function() {
      return this.$store.state.User.userSelected;
    },
    webdav: function() {
      return this.$store.state.UI.webdav;
    },
  },

  watch: {
        userSelected: function(newval) {
      if (newval) {
        let user = this.$store.state.User.userSelected;
        if (user && user.key) {
          this.dataKey = this.$store.state.UI.modaldata.key;
          this.dataCreatTime = FormatDate(new Date(user.createTime), "YYYY年M月D日");
          this.userkey = user.key;
          this.dataUserID = user.key.replace("User:SixUser:", "");
          this.dataPhone = "+" + user.countrycode + " " + user.phone.replace("***", "*****");
          this.dataUserName = user.username;
          this.dataUserSalt = user.salt;
          this.dataUserIsVIP = user.isvip;
          if (user.vipdate == "") {
            this.dataUserVIPDate = "未订阅会员，部分功能不可用";
          } else if (user.isvip) {
            this.dataUserVIPDate = user.vipdate;
          } else {
            this.dataUserVIPDate = user.vipdate + "已过期";
          }
        }
      } else {
        this.dataKey = "";
        this.dataCreatTime = "";
        this.userkey = "";
        this.dataUserID = "";
        this.dataPhone = "";
        this.dataUserName = "";
        this.dataUserSalt = "";
        this.dataUserIsVIP = false;
        this.dataUserVIPDate = "";
        this.modalError = "";
        this.modalLoading = false;
        this.form2.resetFields();
      }
    },
  },
  methods: {
    handleTabChange: function() {
      this.modalError = "";
    },
    handleSubmit: function() {
      return false;
    },
    handleSaveUserName: function() {
      this.modalLoading = true;
      this.modalError = "";
      this.$store
        .dispatch("User/aEditUserName", {
          userkey: this.userkey,
          username: this.dataUserName,
        })
        .then((resp) => {
          this.modalLoading = false;
                    if (resp.code == 0) {
            this.$message.success("操作成功，用户名已更新");
          } else {
            this.modalError = resp.message;
          }
        });
    },
    handleSaveUserPassword: function() {
      this.form2.validateFields((err, values) => {
        if (!err) {
          this.modalLoading = true;
          this.modalError = "";
          this.$store
            .dispatch("User/aEditUserPassword", {
              userkey: this.userkey,
              password: values.userpassword,
              newpassword: values.usernewpassword,
            })
            .then((resp) => {
              this.modalLoading = false;
                            if (resp.code == 0) {
                this.$message.success("操作成功，登录密码已更新");
              } else {
                this.modalError = resp.message;
              }
            });
        }
      });
    },

        handleCancel: function() {
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style>
#UserEditModal .ant-tabs-nav .ant-tabs-tab {
  margin-right: 8px;
}
.ant-descriptions-title {
  margin-bottom: 20px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 700;
  line-height: 1.5;
}
</style>
