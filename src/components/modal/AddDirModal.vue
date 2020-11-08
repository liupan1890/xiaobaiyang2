<template>
  <a-modal key="AddDirModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel" class="appmodal">
    <a-divider orientation="left">在当前目录下创建一个新的文件夹</a-divider>
    <br />
    <br />
    <div class="ant-row ant-form-item" style="margin-bottom: 0">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-input-search id="adddirinput" placeholder="输入新文件夹名" v-model="inputValue" @search="handleSave" spellcheck="false">
              <a-button icon="plus" type="primary" :loading="modalLoading" slot="enterButton" style="line-height: 20px">创建</a-button>
            </a-input-search>
            <span class="ant-form-explain" style="margin-left: 10px; color: #f5222d">{{ modalError }}</span>
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

<script>
export default {
  name: "AddDirModal",
  data: function () {
    return {
      modalLoading: false,
      modalError: "",
      inputValue: "",
      parentDirKey: "",
    };
  },
  components: {},
  computed: {
    checkShowModal: function () {
      return this.$store.state.UI.modalname == "adddir";
    },
  },
  watch: {
    checkShowModal: function (newval) {
      if (newval == true) {
        this.inputValue = "";
        this.parentDirKey = this.$store.state.Pan.panDirSelected.dirkey;
      } else {
        this.inputValue = "";
        this.parentDirKey = "";
        this.modalError = "";
        this.modalLoading = false;
      }
    },
  },
  methods: {
    handleSave: function () {
      this.modalLoading = true;
      let item = {
        dirkey: this.parentDirKey,
        dirname: this.inputValue,
      };

      this.$store.dispatch("Pan/aAddDir", item).then((resp) => {
        if (resp.code == 0) {
          this.inputValue = "";
          this.modalError = "";
          this.modalLoading = false;
          this.$store.dispatch("Pan/aSelectDir", { dirkey: "refresh", dirpath: "refresh" });
          this.$store.commit("UI/mShowModal", { name: "", data: {} });
          this.$message.success("操作成功");
        } else {
          this.modalError = resp.message;
          this.modalLoading = false;
        }
      });
    },
    handleCancel: function () {
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style>
.appmodal .ant-divider .ant-divider-inner-text {
  color: #777;
}
.appmodal .ant-divider {
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
