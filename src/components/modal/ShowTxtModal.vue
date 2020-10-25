<template>
  <a-modal key="ShowTxtModal" id="ShowTxtModal" :visible="checkShowModal" :width="dialogWidth" :dialogStyle="dialogStyle" title="" :footer="null" @cancel="handleCancel" class="appmodal">
    <a-button class="fullscreen" type="link" icon="fullscreen" @click="handleFullScreen">
      全屏
    </a-button>
    <a-button class="refresh" type="link" icon="sync" @click="handleRefresh">
      刷新
    </a-button>
    <a-button class="title" type="link">
      {{ txttitle }}
    </a-button>

    <div class="txtmodal">
      <a-spin :spinning="modalLoading" tip="文件加载中..." />
      <div class="txtcontext">{{ txtcontext }}</div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "ShowTxtModal",
  data: function() {
    return {
      modalLoading: false,
      modalError: "",
      txtitem: {},
      txtcontext: "",
      txttitle: "",
      dialogStyle: {},
      dialogWidth: "520px",
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "showtxt";
    },
    modaldata: function() {
      return this.$store.state.UI.modaldata;
    },
  },
  watch: {
    
    modaldata: function() {
      if (this.$store.state.UI.modalname == "showtxt") {
        if (!this.$store.state.UI.modaldata.key) this.$store.commit("UI/mShowModal", { name: "", data: {} });

        if (this.txtitem.key != this.$store.state.UI.modaldata.key) {
          this.txtitem = this.$store.state.UI.modaldata;
          this.txttitle = this.txtitem.filename + "   " + this.txtitem.sizestr;
          this.txtcontext = "";
          this.handleLoadIxt();
        }
      } else {
        this.modalError = "";
        this.modalLoading = false;
      }
    },
  },
  methods: {
    handleFullScreen: function() {
      if (this.dialogWidth != "95%") {
        this.dialogWidth = "95%";
        this.dialogStyle = { top: "20px" };
      } else {
        this.dialogWidth = "520px";
        this.dialogStyle = {};
      }
    },
    handleRefresh: function() {
      this.handleLoadIxt();
    },

    
    handleLoadIxt: function() {
      this.modalLoading = true;
      this.$store.dispatch("Pan/aDownTxt", this.txtitem).then((resp) => {
        this.modalLoading = false;
        if (resp.code != 0) {
          if (resp.message.indexOf("500")) {
            resp.message = "6盘cdn回源拉取中，请稍后再试";
          }
          this.$message.error(resp.message);
        } else {
          this.txtcontext = resp.txtcontext;
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

<style>
#ShowTxtModal .txtmodal {
  width: 100%;
  min-height: 360px;
  padding-top: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#ShowTxtModal .txtcontext {
  line-height: 16px;
  font-size: 13px;
  padding: 13px 20px;
  background-color: #f7f9fc;
  border-radius: 6px;
  min-height: 330px;
  width: 100%;
  word-break: break-all;
  white-space: pre-wrap;
  word-wrap: normal;
  text-align: left;
  overflow-x: auto;
  user-select: text !important;
}

#ShowTxtModal .fullscreen {
  position: absolute;
  top: 12px;
  left: 6px;
}
#ShowTxtModal .refresh {
  position: absolute;
  top: 12px;
  left: 80px;
}
#ShowTxtModal .title {
  position: absolute;
  top: 12px;
  left: 160px;
  overflow: hidden;
  max-width: 60%;
  text-overflow: ellipsis;
}
</style>
