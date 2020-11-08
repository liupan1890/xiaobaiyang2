<template>
  <a-modal key="DownFileModal" :visible="checkShowModal" :footer="null" @cancel="handleCancel">
    <a-divider orientation="left">每次下载时都要求我选择下载位置</a-divider>

    <a-form layout="vertical" class="settingform">
      <a-form-item label="下载保存位置" help="下载文件会按6盘里完整路径保存，这里选短点例如 D:\Down\">
        <a-input-search v-model="dataSavePath" @search="handleSelectSavePath" spellcheck="false">
          <a-button :loading="SavePathLoading" icon="folder" type="primary" slot="enterButton">选择</a-button>
        </a-input-search>
      </a-form-item>
      <br />
      <a-form-item style="text-align: right; margin-bottom: 0">
        <span class="code-box-meta" style="text-align: left">如果不需要更改下载位置，直接点击 继续</span>
        <a-button :loading="modalLoading" type="primary" @click="handleSettingSave">继续</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
export default {
  name: "DownFileModal",
  data: function () {
    return {
      modalLoading: false,
      dataSavePath: "",
      SavePathLoading: false,
    };
  },
  components: {},
  computed: {
    checkShowModal: function () {
      return this.$store.state.UI.modalname == "downfile";
    },
  },
  watch: {
    checkShowModal: function () {
      if (this.$store.state.UI.modalname == "downfile") {
        this.dataSavePath = this.$store.state.UI.ConfigSavePath;
      }
    },
  },
  methods: {
    handleSelectSavePath: function () {
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
    handleSettingSave: function () {
      let item = { ...this.$store.state.UI.modaldata };
      if (this.dataSavePath == this.$store.state.UI.ConfigSavePath) {
        let hide = this.$message.loading("操作中，请耐心等待...", 0);
        this.$store.dispatch("Pan/aDownFile", item).then((resp) => {
          hide();
          if (resp.code != 0) {
            this.$message.error(resp.message);
          } else {
            this.$message.success("操作成功，创建 " + resp.filecount + " 个文件的下载任务");
          }
          this.$store.commit("UI/mShowModal", { name: "", data: {} });
        });
      } else {
        this.modalLoading = true;
        this.$store.dispatch("UI/aSavePathConfig", { savepath: this.dataSavePath }).then((resp) => {
          this.modalLoading = false;
          if (resp.code == 0) {
            let hide = this.$message.loading("操作中，请耐心等待...", 0);
            this.$store.dispatch("Pan/aDownFile", item).then((resp) => {
              hide();
              if (resp.code != 0) {
                this.$message.error(resp.message);
              } else {
                this.$message.success("操作成功，创建 " + resp.filecount + " 个文件的下载任务");
              }
              this.$store.commit("UI/mShowModal", { name: "", data: {} });
            });
          } else {
            this.$message.error(resp.message);
          }
        });
      }
    },
    handleCancel: function () {
      this.modalLoading = false;
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style></style>
