<template>
  <a-modal key="RenameMultiModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel" class="appmodal">
    <a-divider orientation="left"> 批量修改当前目录下的文件名<small>(不包括子文件夹)</small> </a-divider>
    <p class="code-box-meta"></p>
    <br />

    <a-form :label-col="{ span: 16 }">
      <a-form-item label="功能开发中，尚未实现..."> </a-form-item>
    </a-form>

    <div class="texttip">
      <a-badge dot>
        <a-icon type="notification" />
      </a-badge>
      {{ renamemultitip }}
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "RenameMultiModal",
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
      return this.$store.state.UI.modalname == "renamemulti";
    },
    renamemultitip: function() {
      return this.$store.state.UI.renamemultitip;
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
