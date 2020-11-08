<template>
  <a-modal id="LiXianModal" key="LiXianModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel" width="auto">
    <a-divider orientation="left">批量创建离线任务(BT、磁力、电驴、百度、B站)</a-divider>
    <p class="code-box-meta">
      您当天还可添加 {{ dataDailyQuota - dataDailyUsed }} / {{ dataDailyQuota }} 个离线任务，{{ lixiantip }}
      <a-popover title="提交离线任务的帮助">
        <template slot="content">
          <p>
            一行必须是一个
            <a>完整的链接</a>
            ,多条链接必须用换行(回车)分隔
          </p>
          <p>粘贴后会自动识别链接并格式化,先点击预解析，再点击提交离线</p>
          <p>留意当天还可添加的任务数，超出的链接会被丢弃</p>
          <p>
            百度必须是以下格式
            <br />
            <a>https://pan.baidu.com/s/1IXXXX2BGQ 提取码: 2569</a>
            <br />
            <a>https://pan.baidu.com/s/1IXXXX2BGQ 2569</a>
            <br />
            <a>https://pan.baidu.com/share/init?surl=IXXXX2BGQ 2569</a>
            <br />
          </p>
          <p>
            B站可以离线部分大会员视频
            <br />
            <a>https://www.bilibili.com/video/BV1i5411L7QL</a>
            <br />
            <a>https://www.bilibili.com/bangumi/play/ep352211</a>
            <br />
          </p>
          <p>链接必须以 http://、https://、ed2k://、magnet:?、ftp:// 开头</p>
        </template>
        <a>
          点我看帮助信息
        </a>
      </a-popover>
    </p>

    <div class="ant-row ant-form-item" style="margin-bottom:16px;min-height:40px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <DynamicScroller :items="lixianFileList" key-field="linkstr" :min-item-size="40">
          <template v-slot="{ item, index, active }">
            <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.linkstr, item.error]" :data-index="index">
              <div class="lixianrow" :class="{ on: item.hash != '', err: item.error != '' }">
                <a-textarea spellcheck="false" placeholder="空的链接不会被提交" auto-size v-model="item.linkstr" />
                <a>{{ item.error }}</a>
                <button class="ant-btn delbtn" @click="handleDelLink(item.linkstr)">删除</button>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
    </div>

    <div class="ant-row ant-form-item" style="margin-bottom:16px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-textarea spellcheck="false" v-model="dataTextLink" placeholder="粘贴完整的链接，多条链接用换行(回车)间隔开，粘贴后会自动格式化" :auto-size="{ minRows: 3, maxRows: 4 }" @change="handleTextLinkChange" />
          </span>
        </div>
      </div>
    </div>

    <div class="ant-row ant-form-item" style="margin-bottom:16px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-checkbox v-model="dataLastSavePathChecked" class="lastsavepathcheck">
              <span class="last">最近保存位置:</span>
              {{ panLastSavePath.dirpath }}
            </a-checkbox>
          </span>
        </div>
      </div>
    </div>

    <div class="ant-row ant-form-item" style="margin-bottom:0px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <div class="ant-form-item-children" style="display: flex;justify-content: space-between;align-items:center;">
            <a-upload name="file" :beforeUpload="handleSelectBT" :multiple="true" :showUploadList="false" accept=".torrent">
              <a-button>
                <a-icon type="upload" />
                选择BT种子(可多选)
              </a-button>
            </a-upload>
            <span class="ant-form-explain" style="color: #f5222d;line-height: 40px; flex:1 auto;text-align:right;padding-right:24px">{{ modalError }}</span>
            <a-button v-if="lixianCount == 0" :loading="modalLoading" type="primary" @click.stop="handleParse">预解析({{ lixianFileList.length }}条)</a-button>
            <a-button v-if="lixianCount > 0" :loading="modalLoading" type="danger" @click.stop="handleSave">提交离线({{ lixianHashList.length }}条)</a-button>
          </div>
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
      dataLastSavePathChecked: false,

      lixianFileList: [],
      lixianHashList: [],
      lixianCount: 0,

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
        this.lixianFileList = [];
        this.lixianCount = 0;
        this.modalLoading = false;
      }
    },
  },

  methods: {
        addOneLink(linkstr) {
      let LEN = this.lixianFileList.length;
      for (let i = 0; i < LEN; i++) {
        let item = this.lixianFileList[i];
        if (item.linkstr == linkstr) return;
        if (item.linkstr.startsWith(linkstr)) return;
        if (linkstr.startsWith(item.linkstr)) {
          item.linkstr = linkstr;
          return;
        }
      }
      this.lixianFileList.push({ linkstr, hash: "", error: "" });
      this.lixianCount = 0;
    },
    handleDelLink(linkstr) {
      let List2 = [];
      let hash = "";
      let LEN = this.lixianFileList.length;
      for (let i = 0; i < LEN; i++) {
        let item = this.lixianFileList[i];
        if (item.linkstr != linkstr) {
          List2.push(item);
        } else if (item.hash != "") {
          hash = item.hash;
        }
      }
      this.lixianFileList = List2;
      if (hash == "") return;
      let Hashs2 = [];
      let LEN2 = this.lixianHashList.length;
      for (let j = 0; j < LEN2; j++) {
        let item = this.lixianHashList[j];
        if (item != hash) {
          Hashs2.push(item);
        }
      }
      if (Hashs2.length != LEN2) {
        this.lixianHashList = Hashs2;
      }
    },
    formateTypeLink(Link, Type) {
      let url = Link.match(new RegExp(Type + "(.*)", "i"));
      console.log(Link, Type, url);
      if (url == null) return "";
      return url[0].trim();
    },
    formateBDLink(Link) {
      Link = Link.replace(new RegExp("pan.baidu.com/share/init?surl=", "ig"), "pan.baidu.com/s/1");
      let linklower = Link.toLowerCase();
      if (linklower.indexOf("pan.baidu.com/s/") >= 0) {
                
        let pwd = Link.substring(linklower.indexOf("pan.baidu.com/s/") + "pan.baidu.com/s/".length);
        pwd = pwd.replace(new RegExp("提取码", "g"), " 提取码");
        pwd = pwd.replace(new RegExp("提码", "g"), " 提取码");
        pwd = pwd.replace(new RegExp("密码", "g"), " 提取码");
        pwd = pwd.replace(new RegExp("　", "g"), "");
        pwd = pwd.replace(new RegExp("：", "g"), "");
        pwd = pwd.replace(new RegExp(":", "g"), "");

        let link = "https://pan.baidu.com/s/" + pwd;
        if (pwd.indexOf(" ") >= 0) {
          link = link.substring(0, link.indexOf(" "));
          pwd = pwd.substring(pwd.indexOf(" ") + 1);
          if (pwd.indexOf("提取码") >= 0) pwd = pwd.substring(pwd.indexOf("提取码") + "提取码".length);
          pwd = pwd.replace(new RegExp(" ", "g"), "");
          return link + " 提取码: " + pwd;
        } else return link;
      }
      return "";     },
        formateOneLink(linkstr) {
      linkstr = linkstr.replace(/[\r\t]/g, "");
      if (linkstr == "") return { islink: false, linkstr: "" };

      let bd = this.formateBDLink(linkstr);
      if (bd != "") return { islink: true, linkstr: bd };

      let ed2k = this.formateTypeLink(linkstr, "ed2k://");
      if (ed2k != "") return { islink: true, linkstr: ed2k };

      let magnet = this.formateTypeLink(linkstr, "magnet:?");
      if (magnet != "") return { islink: true, linkstr: magnet };

      let ftp = this.formateTypeLink(linkstr, "ftp://");
      if (ftp != "") return { islink: true, linkstr: ftp };

      let https = this.formateTypeLink(linkstr, "https://");
      if (https != "") return { islink: true, linkstr: https };

      let http = this.formateTypeLink(linkstr, "http://");
      if (http != "") return { islink: true, linkstr: http };

      return { islink: false, linkstr: "" };
    },

        handleTextLinkChange: function() {
      this.lixianCount = 0;
      let linkstr = this.dataTextLink;
      linkstr = linkstr.replace(new RegExp("\\n提", "g"), " 提");
      linkstr = linkstr.replace(new RegExp("\\n 提", "g"), " 提");
      let isadd = false;
            let linkrows = linkstr.split("\n");
      let LEN = linkrows.length;
      let List = [];
            for (let i = 0; i < LEN; i++) {
        let row = this.formateOneLink(linkrows[i]);
        if (row.islink) List.push(row.linkstr);
      }
            let LE = List.length;
      for (let j = 0; j < LE; j++) {
        this.addOneLink(List[j]);
        isadd = true;
      }
      if (isadd == true) {
        this.dataTextLink = "";
        return;
      }
    },

    handleSelectBT: function(file) {
      this.lixianCount = 0;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.$store.dispatch("Pan/aLiXianBT", reader.result).then((resp) => {
                    if (resp.code == 0) {
            this.modalError = "";
            this.addOneLink(resp.textlink);
          } else {
            this.modalError = resp.message;
          }
        });
      };
      return false;
    },

        handleParse: function() {
      let List = [];
            let LEN = this.lixianFileList.length;
      for (let i = 0; i < LEN; i++) {
        let item = this.lixianFileList[i];
        let url = item.linkstr.replace(/[\r\t]/g, "");
        if (item.linkstr != url) item.linkstr = url;

        if (url.startsWith("ftp://") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("ed2k://") || url.startsWith("magnet:?")) {
          List.push(item);
        }
      }
      this.lixianFileList = List;
            LEN = List.length;
      if (LEN == 0) {
        this.$message.info("没有任何链接可以提交解析");
        return;
      }

      let hashs = [];
      this.modalLoading = true;
      let PList = [];
      for (let j = 0; j < LEN; j++) {
        this.lixianCount = j;
        let item = List[j];
        if (item.hash != "") {
          hashs.push(item.hash);           continue;
        }
        let link = item.linkstr;
        let password = "";
        if (link.indexOf("提取码") > 0) {
                    password = link.substring(link.indexOf("提取码") + "提取码".length);
          password = password.replace(new RegExp("[: ]", "g"), "");
          link = link.substring(0, link.indexOf("提取码")).trim();
        }
        PList.push(this.$store.dispatch("Pan/aLiXianLink", { link, password, item }));       }
      Promise.all(PList).then((values) => {
        for (let i = 0; i < values.length; i++) {
          if (values[i].code == 0) {
            hashs.push(values[i].hash);           }
        }
        this.modalLoading = false;
        this.lixianHashList = hashs;
        this.lixianCount = hashs.length;
        if (hashs.length == 0) {
          this.$message.info("没有任何链接可以提交离线");
        } else {
          this.$message.info("成功解析" + this.lixianCount + "条链接，可以离线了");
        }
      });
    },
    handleSave: function() {
      let hashs = [...this.lixianHashList];

            if (this.dataLastSavePathChecked) {
                this.$store.dispatch("Pan/aLiXianTo", { list: hashs, parentpath: this.$store.state.Pan.panLastSavePath.dirpath, cmd: "lixian" }).then((resp2) => {
          this.modalLoading = false;
                    if (resp2.code == 0) {
            this.modalError = "";
            this.$store.commit("UI/mShowModal", { name: "", data: {} });
            if (resp2.successCount > 0) {
              this.$message.success("操作成功，添加了 " + resp2.successCount + " 个离线任务");
            } else {
              this.$message.error("操作失败，添加离线任务失败请重试");
            }
          } else {
            this.modalError = resp2.message;
          }
        });
      } else {
                this.modalLoading = false;
        this.modalError = "";
        this.$store.commit("UI/mShowModal", { name: "copyto", data: { list: hashs, islixian: true } });
      }
    },
        handleCancel: function() {
      if (this.modalLoading) {
        this.$message.error("正在执行操作中，完成后自动关闭");
        return false;
      }

      this.modalLoading = false;
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style>
#LiXianModal .ant-modal {
  max-width: 740px;
  min-width: 520px;
}
#LiXianModal .lixianrow {
  padding: 4px 35px 4px 0;
  position: relative;
}
#LiXianModal .lixianrow.on textarea {
  border: 1px solid #8bc755;
  color: #5aa816;
}
#LiXianModal .lixianrow.err textarea {
  border: 1px solid #df5659;
  color: #ef3450;
}
#LiXianModal .delbtn {
  position: absolute;
  right: 0px;
  top: 4px;
  background: #ffffff;
  color: #ef3450;
  font-size: 12px;
  border: 1px solid #df5659;
  border-radius: 4px;
  height: 32px;
  min-width: 32px;
  padding: 5px;
}

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
