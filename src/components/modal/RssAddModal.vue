<template>
  <a-modal key="adduserModal" :visible="checkShowModal" title="新增Rss订阅" :footer="null" :width="660" @cancel="handleRssAddCancel">
    <div style="min-height:200px;min-width: 600px;">
      <div class="ant-row ant-form-item ">
        <div class="ant-col ant-col-3 ant-form-item-label">
          <label title="Rss订阅源">Rss订阅源</label>
        </div>
        <div class="ant-col ant-col-20 ant-form-item-control-wrapper">
          <div class="ant-form-item-control">
            <span class="ant-form-item-children">
              <a-select default-value="lucy" style="width: 240px" @change="handleMenuClick">
                <a-select-option value="jack"> <a-icon type="instagram" /> 电影天堂 </a-select-option>
                <a-select-option value="lucy"> <a-icon type="instagram" /> B站 </a-select-option>
              </a-select>
            </span>
          </div>
        </div>
      </div>

      <div class="ant-row ant-form-item">
        <div class="ant-col ant-col-3 ant-form-item-label">
          <label title="URL">URL</label>
        </div>
        <div class="ant-col ant-col-20 ant-form-item-control-wrapper">
          <div class="ant-form-item-control">
            <span class="ant-form-item-children">
              <a-textarea placeholder="输入一个规范的url" :auto-size="{ minRows: 3, maxRows: 3 }" />
            </span>
          </div>
        </div>
      </div>

      <div class="ant-row ant-form-item">
        <div class="ant-col ant-col-3 ant-form-item-label"></div>
        <div class="ant-col ant-col-20 ant-form-item-control-wrapper">
          <div class="ant-form-item-control">
            <span class="ant-form-item-children">
              <a-button key="submit" type="primary" :loading="modalLoading" @click="handleRssAddSave">
                保存
              </a-button>
              <span class="ant-form-explain" style="margin-left:24px;color: #f5222d;">{{ ressaddError }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="rsshelp" style="margin-top:60px">
        <span>支持的URL格式：</span><br />
        <p><span class="label">个人</span><span>https://www.b.com/user/</span><span class="tag" title="userid">35546546</span><span>/pets</span></p>
        <p><span class="label">个人</span><span>https://www.b.com/user/</span><span class="tag" title="userid">35546546</span><span>/pets</span></p>
        <p><span class="label">个人</span><span>https://www.b.com/user/</span><span class="tag" title="userid">35546546</span><span>/pets</span></p>
        <p><span class="label">个人</span><span>https://www.b.com/user/</span><span class="tag" title="userid">35546546</span><span>/pets</span></p>
        <p><span class="label">个人</span><span>https://www.b.com/user/</span><span class="tag" title="userid">35546546</span><span>/pets</span></p>
        <p><span class="label">个人</span><span>https://www.b.com/user/</span><span class="tag" title="userid">35546546</span><span>/pets</span></p>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "RssAddModal",
  data: function() {
    return {
      modalLoading: false,
      ressaddError: "",
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "addrss";
    },
  },
  methods: {
        handleMenuClick: function() {},

        handleRssAddCancel: function() {
      this.modalLoading = false;
      this.ressaddError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
        handleRssAddSave: function() {
      this.modalLoading = true;
      this.modalLoading = false;
      this.$message.info("Rss订阅功能尚在开发中");
          },
  },
};
</script>

<style></style>
