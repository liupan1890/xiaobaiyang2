<template>
  <a-modal key="LiXianModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel">
    <a-divider orientation="left"> 创建离线任务(BT、磁力、电驴、百度) </a-divider>
    <p class="code-box-meta">您当天还可添加 {{ dataDailyQuota - dataDailyUsed }} / {{ dataDailyQuota }} 个离线任务，{{ lixiantip }}</p>
    <div class="ant-row ant-form-item" style="margin-bottom:16px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-textarea spellcheck="false" v-model="dataTextLink" placeholder="只能输入一条链接！" :auto-size="{ minRows: 4, maxRows: 6 }" @change="handleTextLinkChange" />
          </span>
        </div>
      </div>
    </div>

    <div v-if="dataIsTextPassword" class="ant-row ant-form-item" style="margin-bottom:16px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-input v-model="dataTextPassword" placeholder="4位提取码" style="width:120px" spellcheck="false" />
          </span>
        </div>
      </div>
    </div>

    <div class="ant-row ant-form-item" style="margin-bottom:16px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-checkbox v-model="dataLastSavePathChecked" class="lastsavepathcheck"> <span class="last">最近保存位置:</span>{{ panLastSavePath.dirpath }} </a-checkbox>
          </span>
        </div>
      </div>
    </div>

    <div class="ant-row ant-form-item" style="margin-bottom:16px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <div class="ant-form-item-children" style="display: flex;justify-content: space-between;">
            <a-upload name="file" :beforeUpload="handleSelectBT" :showUploadList="false" accept=".torrent">
              <a-button> <a-icon type="upload" />选择BT种子文件 </a-button>
            </a-upload>
            <a-button :loading="modalLoading" type="primary" @click.stop="handleSave"> 创建 </a-button>
          </div>
        </div>
      </div>
    </div>
    <div class="ant-row ant-form-item" style="margin-bottom:16px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <span class="ant-form-explain" style="color: #f5222d;">{{ modalError }}</span>
          </span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "LiXianModal",
  data: function() {
    return {
      modalLoading: false,
      modalError: "",
      dataTextLink: "",
      dataIsTextPassword: false,
      dataTextPassword: "",
      dataLastSavePathChecked: false,

      dataDailyQuota: 0,
      dataDailyUsed: 0,
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "lixian";
    },
    modaldata: function() {
      return this.$store.state.UI.modaldata;
    },
    panLastSavePath: function() {
      return this.$store.state.Pan.panLastSavePath;
    },
    lixiantip: function() {
      return this.$store.state.UI.lixiantip;
    },
  },
  watch: {
    
    modaldata: function() {
      if (this.$store.state.UI.modalname == "lixian") {
        this.$store.dispatch("Pan/aLiXianQuery").then((resp) => {
          this.dataDailyQuota = resp.dailyQuota;
          this.dataDailyUsed = resp.dailyUsed;
        });
      } else {
        this.modalError = "";
        this.dataTextLink = "";
        this.dataIsTextPassword = false;
        this.dataTextPassword = "";
        this.modalLoading = false;
      }
    },
  },

  methods: {
    handleTextLinkChange: function() {
      let Link = this.dataTextLink;
      if (Link.indexOf("\n") >= 0) Link = Link.substring(0, Link.indexOf("\n"));
      Link = Link.replace("\r", "").replace("\t", " ");

      let linklower = Link.toLowerCase();
      if (linklower.indexOf("pan.baidu.com/s/") >= 0) {
      

        let pwd = Link.substring(linklower.indexOf("pan.baidu.com/s/") + "pan.baidu.com/s/".length);
        pwd = pwd.replace("提取码", " 提取码").replace("密码", " 密码");
        let link = "https://pan.baidu.com/s/" + pwd;
        if (pwd.indexOf(" ") >= 0) {
          link = link.substring(0, link.indexOf(" "));
          pwd = pwd.substring(pwd.indexOf(" ") + 1);
          if (pwd.indexOf("提取码") >= 0) pwd = pwd.substring(pwd.indexOf("提取码") + "提取码".length);
          else if (pwd.indexOf("密码") >= 0) pwd = pwd.substring(pwd.indexOf("密码") + "密码".length);
          else if (pwd.indexOf("PW") >= 0) pwd = pwd.substring(pwd.indexOf("PW") + "PW".length);
          else if (pwd.indexOf("pw") >= 0) pwd = pwd.substring(pwd.indexOf("pw") + "pw".length);
          pwd = pwd.replace(" ", "").replace("　", "");
          pwd = pwd.replace(":", "").replace("：", "");
          if (pwd.length < 4) pwd = "";
          else pwd = pwd.substring(0, 4);
          if (pwd != "") {
            var f = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            if (f.indexOf(pwd[0]) < 0 || f.indexOf(pwd[1]) < 0 || f.indexOf(pwd[2]) < 0 || f.indexOf(pwd[3]) < 0) pwd = "";
            this.dataTextPassword = pwd;
          }
        }
        if (this.dataTextLink != link) this.dataTextLink = link;
        this.dataIsTextPassword = true;
      } else {
        this.dataTextPassword = "";
        this.dataIsTextPassword = false;
      }
      let url = this.dataTextLink;
      if (url.startsWith("ftp://") || url.startsWith("ftp://") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("ed2k://") || url.startsWith("magnet:?")) {
        this.modalError = ""; 
      } else {
        this.modalError = "输入的链接格式有误，必读http://、https://、ed2k://、magnet:?、ftp://开头";
      }
    },

    handleSelectBT: function(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.$store.dispatch("Pan/aLiXianBT", reader.result).then((resp) => {
          this.modalError = "";
          this.dataTextLink = resp.textlink;
        });
      };
      return false;
    },

    
    handleSave: function() {
      let url = this.dataTextLink;
      if (url.startsWith("ftp://") || url.startsWith("ftp://") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("ed2k://") || url.startsWith("magnet:?")) {
        this.modalError = ""; 
      } else {
        this.modalError = "输入的链接格式有误，必读http://、https://、ed2k://、magnet:?、ftp://开头";
        return;
      }

      this.modalLoading = true;
      this.$store.dispatch("Pan/aLiXianLink", { link: this.dataTextLink, password: this.dataTextPassword }).then((resp) => {
        if (resp.code == 0) {
          this.dataTextLink = "";
          this.dataTextPassword = "";
          if (this.dataLastSavePathChecked) {
            this.$store.dispatch("Pan/aLiXianTo", { key: resp.hash, parentpath: this.$store.state.Pan.panLastSavePath.dirpath, cmd: "lixian" }).then((resp2) => {
              this.modalLoading = false;
              if (resp2.code == 0) {
                this.modalError = "";
                this.$store.commit("UI/mShowModal", { name: "", data: {} });
                if (resp2.successCount > 0) {
                  this.$message.success("操作成功，添加了 " + resp2.successCount + " 个离线任务");
                } else {
                  this.$message.error("操作失败，离线任务失败请重试");
                }
              } else {
                if (resp2.message.indexOf("请提供用户名密码") > 0) resp2.message = "提取码不正确";
                this.modalError = resp2.message;
              }
            });
          } else {
            this.modalLoading = false;
            this.modalError = "";
            this.$store.commit("UI/mShowModal", { name: "copyto", data: { key: resp.hash, islixian: true } });
          }
        } else {
          if (resp.message.indexOf("请提供用户名密码") > 0) resp.message = "提取码不正确";
          this.modalLoading = false;
          this.modalError = resp.message;
        }
      });
    },
    
    handleCancel: function() {
      this.modalLoading = false;
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style>
.lastsavepathcheck {
  line-height: 16px;
}
.lastsavepathcheck .ant-checkbox + span {
  word-break: break-all;
  line-height: 16px;
}
.ant-form-explain {
  line-height: 16px;
  display: inline-block;
}
.lastsavepathcheck .last {
  color: #ef3450;
}
textarea.ant-input {
  word-break: break-all;
}
</style>
