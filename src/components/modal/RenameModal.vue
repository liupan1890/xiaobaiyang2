<template>
  <a-modal key="RenameModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel" class="appmodal">
    <a-divider orientation="left"> 修改文件名 </a-divider>
    <p class="code-box-meta"></p>
    <br />
    <div class="ant-row ant-form-item" style="margin-bottom:0">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-textarea placeholder="输入新文件名" v-model="dataFileName" draggable="false" spellcheck="false" :auto-size="{ minRows: 4, maxRows: 6 }" />

            <span class="ant-form-explain" style="margin-left:10px;color: #f5222d;">{{ modalError }}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="ant-row ant-form-item">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control" style="text-align:right">
          <span class="ant-form-item-children">
            <a-button :loading="modalLoading" slot="enterButton" style="line-height:20px;margin-right:24px" @click="handleMultiSave">
              批量重命名
            </a-button>
            <a-button type="primary" :loading="modalLoading" slot="enterButton" style="line-height:20px" @click="handleSave">
              重命名
            </a-button>
          </span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "RenameModal",
  data: function() {
    return {
      modalLoading: false,
      modalError: "",
      dataFileName: "",
      dataKey: "",
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "rename";
    },
  },
  watch: {
    
    checkShowModal: function(newval) {
      if (newval == true) {
        this.dataKey = this.$store.state.UI.modaldata.key;
        this.dataFileName = this.$store.state.UI.modaldata.filename;
      } else {
        this.dataKey = "";
        this.dataFileName = "";
        this.modalError = "";
        this.modalLoading = false;
      }
    },
  },
  methods: {
    handleMultiSave: function() {
      this.$store.commit("UI/mShowModal", { name: "renamemulti", data: {} });
    },
    
    handleSave: function() {
      this.modalLoading = true;
      let item = { key: this.dataKey, newname: this.dataFileName };
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
    
    handleCancel: function() {
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style></style>
