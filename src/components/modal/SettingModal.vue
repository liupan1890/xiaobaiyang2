<template>
  <a-modal key="settingModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleSettingCancel">
    <a-divider orientation="left">
      APP设置 <small>{{ exeVer }}</small>
    </a-divider>
    <br />

    <a-form layout="vertical" class="settingform">
      <a-form-item label="远程管理密码" help="默认密码为空，关闭远程管理功能">
        <a-input v-model="dataPassword" spellcheck="false" />
      </a-form-item>
      <br />
      <a-form-item label="下载保存位置" help="下载文件会按6盘里完整路径保存，这里选短点例如 D:\Down\">
        <a-input-search v-model="dataSavePath" @search="handleSelectSavePath" spellcheck="false">
          <a-button :loading="SavePathLoading" icon="folder" type="primary" slot="enterButton">
            选择
          </a-button>
        </a-input-search>
      </a-form-item>
      <br />
      <a-form-item label="播放器文件" help="播放器.exe文件的完整路径">
        <a-input-search v-model="dataPlayerPath" @search="handleSelectPlayerPath" spellcheck="false">
          <a-button :loading="SavePathLoading" icon="folder" type="primary" slot="enterButton">
            选择
          </a-button>
        </a-input-search>
      </a-form-item>
      <br />
      <a-form-item label="同时下载任务数" help="6盘限制最多3任务同时下载，超过会频繁下载出错">
        <a-radio-group v-model="dataTaskCount" button-style="solid" class="taskcount">
          <a-radio-button value="1">
            1
          </a-radio-button>
          <a-radio-button value="2">
            2
          </a-radio-button>
          <a-radio-button value="3">
            3
          </a-radio-button>
          <a-radio-button value="4">
            4
          </a-radio-button>
        </a-radio-group>
      </a-form-item>
      <br />

      <a-form-item style="text-align:right">
        <span class="ant-form-explain" style="color: #f5222d;padding-right:24px">{{ modalError }}</span>
        <a-button :loading="modalLoading" type="primary" @click="handleSettingSave">
          保存设置
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
export default {
  name: "SettingModal",
  data: function() {
    return {
      modalLoading: false,
      modalError: "",
      SavePathLoading: false,
      dataPlayerPath: "",
      dataSavePath: "",
      dataPassword: "",
      dataTaskCount: "",
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "setting";
    },
    exeVer: function() {
      return this.$store.state.UI.exeVer;
    },
  },
  watch: {
    
    checkShowModal: function() {
      if (this.$store.state.UI.modalname == "setting") {
        this.dataTaskCount = this.$store.state.UI.ConfigTaskCountMax + "";
        this.dataPassword = this.$store.state.UI.ConfigRemotePassword;
        this.dataSavePath = this.$store.state.UI.ConfigSavePath;
        this.dataPlayerPath = this.$store.state.UI.ConfigPlayerPath;
      } else {
        this.modalLoading = false;
        this.modalError = "";
        this.SavePathLoading = false;
      }
    },
  },
  methods: {
    handleSelectSavePath: function() {
      this.SavePathLoading = true;
      this.$store.dispatch("UI/aSelectSavePath").then((resp) => {
        this.SavePathLoading = false;
        if (resp.code == 0) {
          this.dataSavePath = resp.selectdir;
        } else {
          this.$message.error(resp.message);
        }
      });
    },
    handleSelectPlayerPath: function() {
      this.SavePathLoading = true;
      this.$store.dispatch("UI/aSelectPlayerPath").then((resp) => {
        this.SavePathLoading = false;
        if (resp.code == 0) {
          this.dataPlayerPath = resp.selectfile;
        } else {
          this.$message.error(resp.message);
        }
      });
    },

    
    handleSettingSave: function() {
      let taskcount = parseInt(this.dataTaskCount);
      if (taskcount > 4) taskcount = this.$store.state.UI.ConfigTaskCountMax;
      if (taskcount < 0) taskcount = this.$store.state.UI.ConfigTaskCountMax;
      this.modalLoading = true;
      this.$store.dispatch("UI/aSaveConfig", { pwd: this.dataPassword, savepath: this.dataSavePath, playerpath: this.dataPlayerPath, taskcount }).then((resp) => {
        this.modalLoading = false;
        if (resp.code == 0) {
          this.$store.dispatch("UI/aNotice");
          this.$message.success("设置保存成功");
          this.$store.commit("UI/mShowModal", { name: "", data: {} });
        } else {
          this.$message.error(resp.message);
        }
      });
    },
    handleSettingCancel: function() {
      this.modalLoading = false;
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style>
.taskcount label {
  padding: 0 20px;
}

.taskcount .ant-radio-button-wrapper.ant-radio-button-wrapper-checked {
  opacity: 0.9;
}

.settingform {
  padding: 0 18px;
}
</style>
