<template>
  <a-modal id="RenameMultiModal" key="RenameMultiModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel" class="appmodal" width="auto">
    <a-divider orientation="left">
      批量修改当前目录下的文件名
      <small>(不包括子文件夹)</small>
    </a-divider>
    <br />
    <a-form layout="inline">
      <a-form-item>
        <a-input-group compact>
          <a-input style="width: 226px" v-model="dataOldVal" @change="handleValueChange" addon-before="把" />
          <a-input style="width: 254px" v-model="dataNewVal" @change="handleValueChange" addon-before="替换成" />
        </a-input-group>
      </a-form-item>
      <a-form-item style="margin-right: 0px; margin-top: -1px; text-align: right">
        <a-button type="primary" :loading="modalLoading" style="min-width: 60px" @click="handleSave">执行替换 ({{ renameFileList.length }}个)</a-button>
      </a-form-item>
    </a-form>
    <br />
    <RecycleScroller class="renameitemlist" :items="renameFileList" :item-size="32" key-field="key" oncontextmenu="return false;">
      <template v-if="renameFileList.length == 0" #before>
        <div class="scrollviewhead">
          <div class="iconfont">
            <span class="iconempty"></span>
          </div>
          <div class="emptytip">空的!注意只显示文件,不显示文件夹!</div>
        </div>
      </template>
      <template v-slot="{ item }">
        <div class="filename">
          <div class="iconfont">
            <span :class="item.fileicon"></span>
          </div>
          <div class="title">
            <div v-html="item.showname"></div>
          </div>
        </div>
      </template>
    </RecycleScroller>

    <div class="texttip" style="text-align: left">
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
  data: function () {
    return {
      modalLoading: false,
      modalError: "",
      renameFileList: [],

      dataOldVal: "",
      dataNewVal: "",
      dataKey: "",
      dataPath: "",

      dataRenameCount: 0,
    };
  },
  components: {},
  computed: {
    checkShowModal: function () {
      return this.$store.state.UI.modalname == "renamemulti";
    },
    renamemultitip: function () {
      return this.$store.state.UI.renamemultitip;
    },
  },
  watch: {
    checkShowModal: function (newval) {
      if (newval == true) {
        this.dataKey = this.$store.state.Pan.panDirSelected.dirkey;
        this.dataPath = this.$store.state.Pan.panDirSelected.dirpath;
        if (this.dataKey == "6pan-search") {
          this.renameFileList = [];
        } else {
          let list = [];
          let panFileList = this.$store.state.Pan.panFileList;
          let LEN = panFileList.length;
          for (let i = 0; i < LEN; i++) {
            let item = panFileList[i];
            if (item.isfile == true && item.isdir == false) {
              list.push({ key: item.key, showname: item.filename, filename: item.filename, fileicon: item.fileicon });
            }
          }
          this.renameFileList = list;
        }
      } else {
        this.renameFileList = [];
        this.modalError = "";
        this.modalLoading = false;
        this.dataKey = "";
        this.dataPath = "";
        this.dataOldVal = "";
        this.dataNewVal = "";
        this.dataRenameCount = 0;
      }
    },
  },
  methods: {
    replace: function (str, olds, news) {
      return str.split(olds).join(news);
    },
    handleValueChange: function () {
      let oldval = this.dataOldVal;
      let newval = this.dataNewVal;

      oldval = oldval.replace(new RegExp("<", "g"), "").replace(new RegExp("/", "g"), "");
      newval = newval.replace(new RegExp("<", "g"), "").replace(new RegExp("/", "g"), "");
      if (oldval != this.dataOldVal) this.dataOldVal = oldval;
      if (newval != this.dataNewVal) this.dataNewVal = newval;

      let LEN = this.renameFileList.length;

      if (oldval == "") {
        for (let i = 0; i < LEN; i++) {
          let item = this.renameFileList[i];
          item.showname = item.filename;
        }
      } else {
        if (newval != "") {
          newval = "<b>" + newval + "</b>";
        } else {
          newval = "<i>" + oldval + "</i>";
        }

        for (let i = 0; i < LEN; i++) {
          let item = this.renameFileList[i];
          item.showname = this.replace(item.filename, oldval, newval);
        }
      }
    },
    handleSave: function () {
      if (this.$store.state.Pan.panDirSelected.dirkey == "6pan-search") {
        this.$message.info("搜索模式下不支持批量改名操作");
        return;
      }

      let oldval = this.dataOldVal;
      let newval = this.dataNewVal;

      oldval = oldval.replace(new RegExp("<", "g"), "").replace(new RegExp("/", "g"), "");
      newval = newval.replace(new RegExp("<", "g"), "").replace(new RegExp("/", "g"), "");
      if (oldval != this.dataOldVal) this.dataOldVal = oldval;
      if (newval != this.dataNewVal) this.dataNewVal = newval;

      if (oldval == "") {
        this.$message.info("没有输入被替换的字符");
        return;
      }

      this.modalLoading = true;
      let FileList = [...this.renameFileList];
      let LEN = FileList.length;
      this.dataRenameCount = 0;

      let PList = [];
      for (let i = 0; i < LEN; i++) {
        let itemfile = FileList[i];
        let newname = this.replace(itemfile.filename, oldval, newval);
        if (newname != "" && newname != itemfile.filename) {
          let item = { key: itemfile.key, newname: newname };
          PList.push(this.$store.dispatch("Pan/aRename", item));
        }
      }

      Promise.all(PList).then((values) => {
        for (let i = 0; i < values.length; i++) {
          if (values[i].code == 0) {
            this.dataRenameCount++;
          } else {
            this.$message.error(values[i].message);
          }
        }
        this.$message.info("批量改名完成，成功修改了 " + this.dataRenameCount + " 个文件");
        this.modalLoading = false;
        this.$store.dispatch("Pan/aSelectDir", { dirkey: "refresh", dirpath: "refresh" });
        this.$store.commit("UI/mShowModal", { name: "", data: {} });
      });
    },
    handleCancel: function () {
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
#RenameMultiModal .ant-modal {
  max-width: 740px;
  min-width: 520px;
}

#RenameMultiModal .renameitemlist {
  max-height: 400px;
  min-height: 200px;
  width: 100%;
  overflow: auto;
  border-top: 1px solid #e8e8e8;
  margin-bottom: 8px;
}

.renameitemlist .filename {
  width: 100%;
  height: 32px;
  display: flex !important;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: rgba(0, 0, 0, 0.7);
  flex-grow: 0;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 24px;
  border-bottom: 1px solid #eef2f8 !important;
}

.renameitemlist .filename:hover {
  background-color: #f7f8fa !important;
}

.renameitemlist .filename .iconfont {
  width: 24px;
  padding-left: 4px;
}

.renameitemlist .filename .title {
  flex: 1 1 0%;
  overflow: hidden;
  cursor: default;
}
.renameitemlist .filename .title > div {
  width: fit-content;
  max-width: 100%;
  height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.renameitemlist .filename .title i {
  color: #b31d28;
  background-color: #ffeef0;
  text-decoration: line-through;
  font-style: normal;
  font-weight: normal;
  padding: 0 2px;
}
.renameitemlist .filename .title b {
  color: #22863a;
  background-color: #f0fff4;
  font-style: normal;
  font-weight: normal;
  padding: 0 2px;
}
</style>
