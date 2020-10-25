<template>
  <a-modal key="DownloadModal" :visible="checkShowModal" title="重命名" :footer="null" @cancel="handleCancel">
    <div class="ant-row ant-form-item">
      <div class="ant-col ant-col-5 ant-form-item-label"></div>
      <div class="ant-col ant-col-17 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-button key="submit" type="primary" :loading="modalLoading" @click="handleSave">
              保存
            </a-button>
          </span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "DownloadModal",
  data: function() {
    return {
      modalLoading: false,
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "download";
    },
  },
  methods: {
    
    handleSave: function() {},
    
    handleCancel: function() {
      this.modalLoading = false;
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style></style>
