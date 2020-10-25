<template>
  <a-modal key="useraddModal" :visible="checkShowModal" :footer="null" @cancel="handleUserAddCancel">
    <a-tabs :default-activeKey="activeKey" style="min-height:260px" @change="handletabChange">
      <a-tab-pane key="1" tab="手机号" :forceRender="true">
        <a-form :form="form1" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
          <a-form-item label="国家/地区">
            <a-select
              v-decorator="[
                'phonecode',
                {
                  initialValue: '86',
                  rules: [{ required: true, message: '请选择区号', whitespace: true }],
                },
              ]"
            >
              <a-select-option value="86">中国大陆 (+86)</a-select-option>
              <a-select-option value="852">中国香港 (+852)</a-select-option>
              <a-select-option value="853">中国澳门 (+853)</a-select-option>
              <a-select-option value="886">中国臺灣 (+886)</a-select-option>
              <a-select-option value="44">United Kiongdom (+44)</a-select-option>
              <a-select-option value="1">U.S.A (+1)</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="手机号">
            <a-input
              spellcheck="false"
              v-decorator="[
                'phone',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入手机号',
                      whitespace: true,
                      min: 6,
                    },
                  ],
                },
              ]"
            />
          </a-form-item>
          <a-form-item label="登录密码">
            <a-input
              spellcheck="false"
              v-decorator="[
                'phonepassword',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入登录密码(长6-14位)',
                      whitespace: true,
                      min: 6,
                      max: 14,
                    },
                  ],
                },
              ]"
            />
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="用户名" :forceRender="true">
        <a-form :form="form2" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
          <a-form-item label="用户名">
            <a-input spellcheck="false" v-decorator="['username', { rules: [{ required: true, message: '请输入用户名' }] }]" />
          </a-form-item>
          <a-form-item label="登录密码">
            <a-input
              spellcheck="false"
              v-decorator="[
                'userpassword',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入登录密码(长6-14位)',
                      whitespace: true,
                      min: 6,
                      max: 14,
                    },
                  ],
                },
              ]"
            />
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="3" tab="Cookies" :forceRender="true">
        <a-form :form="form3" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" @submit="handleSubmit">
          <div class="ant-row ant-form-item" style="line-height: 20px;margin:0 0 12px 0;">
            <div class="ant-col ant-col-5 ant-form-item-label"></div>
            <div class="ant-col ant-col-17 ant-form-item-control-wrapper">
              <div class="ant-form-item-control" style="line-height: 20px;">
                <span class="ant-form-item-children"> <span class="desctip">怎样获得浏览器cookie请去看[操作教程]</span><br /> </span>
              </div>
            </div>
          </div>
          <a-form-item label="Cookies">
            <a-textarea
              spellcheck="false"
              placeholder="Cookie: token=......; token.sig=......"
              v-decorator="[
                'cookie',
                {
                  rules: [
                    {
                      required: true,

                      message: '请完整粘贴[Cookie: token=......; token.sig=......]',
                      whitespace: true,
                      min: 500,
                      max: 700,
                    },
                  ],
                },
              ]"
              :auto-size="{ minRows: 6, maxRows: 6 }"
            />
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
    <div class="ant-row ant-form-item">
      <div class="ant-col ant-col-5 ant-form-item-label"></div>
      <div class="ant-col ant-col-17 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <a-button key="submit" type="primary" :loading="modalLoading" @click.stop="handleUserAddLogin">
            登录
          </a-button>
          <span class="ant-form-explain" style="margin-left:24px;color: #f5222d;">{{ useraddError }}</span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "UserAddModal",
  data: function() {
    return {
      modalLoading: false,
      useraddError: "",
      activeKey: "1",
      form1: this.$form.createForm(this, { name: "useraddform1" }),
      form2: this.$form.createForm(this, { name: "useraddform2" }),
      form3: this.$form.createForm(this, { name: "useraddform3" }),
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "adduser";
    },
  },
  methods: {
    handleSubmit: function() {
      return false;
    },
    handletabChange: function(key) {
      this.activeKey = key;
      this.useraddError = "";
    },
    handleUserAddCancel: function() {
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
      this.modalLoading = false;
      this.useraddError = "";
      this.form1.resetFields();
      this.form2.resetFields();
      this.form3.resetFields();
    },
    handleUserAddLogin: function() {
      if (this.activeKey == "1") {
        this.form1.validateFields((err, values) => {
          if (!err) {
            this.modalLoading = true;
            this.$store
              .dispatch("User/aAddUser", {
                mode: "phone",
                country: values.phonecode,
                phone: values.phone,
                password: values.phonepassword,
              })
              .then((data) => {
                if (data.code == 0) {
                  this.handleUserAddCancel();
                } else {
                  this.modalLoading = false;
                  this.useraddError = data.message;
                }
              });
          }
        });
      }
      if (this.activeKey == "2") {
        this.form2.validateFields((err, values) => {
          if (!err) {
            this.modalLoading = true;
            this.$store
              .dispatch("User/aAddUser", {
                mode: "user",
                name: values.username,
                password: values.userpassword,
              })
              .then((data) => {
                if (data.code == 0) {
                  this.$store.dispatch("User/aSelectUser", data.userid);
                  this.handleUserAddCancel();
                } else {
                  this.modalLoading = false;
                  this.useraddError = data.message;
                }
              });
          }
        });
      }
      if (this.activeKey == "3") {
        this.form3.validateFields((err, values) => {
          if (!err) {
            if (values.cookie.indexOf("token=") < 0 || values.cookie.indexOf("token.sig=") < 0) {
              this.useraddError = "token=......; token.sig=......";
              return;
            }
            this.useraddError = "";
            this.modalLoading = true;

            this.$store
              .dispatch("User/aAddUser", {
                mode: "cookie",
                cookie: values.cookie,
              })
              .then((data) => {
                if (data.code == 0) {
                  this.handleUserAddCancel();
                } else {
                  this.modalLoading = false;
                  this.useraddError = data.message;
                }
              });
          }
        });
      }
    },
  },
};
</script>

<style></style>
