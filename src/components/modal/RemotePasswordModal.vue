<template>
  <a-modal key="RemotePasswordModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel" class="appmodal">
    <a-divider orientation="left"> 远程管理密码 </a-divider>
    <p class="code-box-meta"></p>
    <br />
    <div class="ant-row ant-form-item">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-input-search placeholder="输入管理密码" @search="handleSave" v-model="dataPassword" spellcheck="false" draggable="false">
              <a-button type="primary" :loading="modalLoading" slot="enterButton" style="line-height:20px">
                确定
              </a-button>
            </a-input-search>

            <span class="ant-form-explain" style="margin-left:10px;color: #f5222d;">{{ modalError }}</span>
          </span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
import md5 from "md5";
export default {
  name: "RemotePasswordModal",
  data: function() {
    return {
      modalLoading: false,
      modalError: "",
      dataPassword: "",
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "remotepassword";
    },
  },
  watch: {
    
    checkShowModal: function(newval) {
      if (newval == true) {
        this.dataPassword = "";
      } else {
        this.dataPassword = "";
        this.modalError = "";
        this.modalLoading = false;
      }
    },
  },
  methods: {
    
    handleSave: function() {
      this.modalLoading = true;
      localStorage["RemotePassword"] = md5(this.dataPassword);
      location.reload();
    },
    
    handleCancel: function() {
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style></style>
