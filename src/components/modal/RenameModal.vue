<template>
  <a-modal key="RenameModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel" class="appmodal">
    <a-divider orientation="left">修改文件名</a-divider>
    <br />
    <div class="ant-row ant-form-item" style="margin-bottom: 12px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-textarea placeholder="输入新文件名" v-model="dataFileName" draggable="false" spellcheck="false" :auto-size="{ minRows: 4, maxRows: 6 }" />
          </span>
        </div>
      </div>
    </div>
    <div class="ant-row ant-form-item">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control" style="text-align: right">
          <span class="ant-form-explain" style="margin-right: 10px; color: #f5222d; position: absolute; left: 0; top: 12px">{{ modalError }}</span>
          <span class="ant-form-item-children">
            <a-button v-if="checkSearch" :loading="modalLoading" slot="enterButton" style="line-height: 20px; margin-right: 24px" @click="handleMultiSave">批量重命名</a-button>
            <a-button type="primary" :loading="modalLoading" slot="enterButton" style="line-height: 20px" @click="handleSave">重命名</a-button>
          </span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "RenameModal",
  data: function () {
    return {
      modalLoading: false,
      modalError: "",
      dataFileName: "",
      dataKey: "",
      dataPath: "",
    };
  },
  components: {},
  computed: {
    checkShowModal: function () {
      return this.$store.state.UI.modalname == "rename";
    },
    checkSearch: function () {
      return this.$store.state.Pan.panDirSelected.dirkey != "6pan-search";
    },
  },
  watch: {
    checkShowModal: function () {
      if (this.$store.state.UI.modalname == "rename") {
        this.dataKey = this.$store.state.UI.modaldata.key;
        this.dataPath = this.$store.state.UI.modaldata.path;
        if (this.$store.state.UI.modaldata.filename) {
          this.dataFileName = this.$store.state.UI.modaldata.filename;
        }
        if (this.$store.state.UI.modaldata.dirname) {
          this.dataFileName = this.$store.state.UI.modaldata.dirname;
        }
      } else {
        this.dataKey = "";
        this.dataPath = "";
        this.dataFileName = "";
        this.modalError = "";
        this.modalLoading = false;
      }
    },
  },
  methods: {
    handleMultiSave: function () {
      this.$store.commit("UI/mShowModal", { name: "renamemulti", data: {} });
    },
    handleSave: function () {
      this.modalLoading = true;
      let item = { key: this.dataKey, path: this.dataPath, newname: this.dataFileName };
      this.$store.dispatch("Pan/aRename", item).then((resp) => {
        if (resp.code == 0) {
          this.modalError = "";
          this.modalLoading = false;
          this.$store.dispatch("Pan/aSelectDir", { dirkey: "refresh", dirpath: "refresh" });
          this.$store.commit("UI/mShowModal", { name: "", data: {} });
          if (resp.async) {
            this.$notification.open({
              message: "操作成功",
              description: "由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果",
              duration: 6,
            });
          } else {
            this.$message.success("操作成功");
          }
        } else {
          this.modalError = resp.message;
          this.modalLoading = false;
        }
      });
    },
    handleCancel: function () {
      if (this.modalLoading) {
        this.$message.error("正在执行操作中，完成后自动关闭");
        return false;
      }
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style></style>
