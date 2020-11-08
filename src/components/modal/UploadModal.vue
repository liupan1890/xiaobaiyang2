<template>
  <a-modal id="UploadModal" key="UploadModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel" class="appmodal" width="auto">
    <a-divider orientation="left">
      上传文件/文件夹 到当前文件夹
    </a-divider>
    <a-form layout="inline" style="margin-bottom:12px;">
      <a-form-item>
        <span style="width:550px;display: block;line-height: 20px;">
          <a>保存到网盘:</a>
          {{ uploadToDirPath }}
        </span>
        <span style="width:550px;display: block;line-height: 20px;">已选择 {{ uploadFileCount }} 个文件，共 {{ uploadFileSizeStr }}</span>
      </a-form-item>
      <a-form-item style="margin-right:0px;margin-top:-1px;text-align:right">
        <a-button type="primary" :loading="modalLoading" style="min-width:60px;" @click="handleSave">开始上传</a-button>
      </a-form-item>
    </a-form>
    <RecycleScroller class="uploaditemlist" :items="uploadFileList" :item-size="32" key-field="filepath" oncontextmenu="return false;">
      <template v-if="uploadFileList.length == 0" #before>
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
            <div>{{ item.filepath }}</div>
          </div>
          <div class="size">
            {{ item.sizestr }}
          </div>
          <div class="del">
            <button v-if="uploadFileList.length > 1" class="ant-btn ant-btn-link delbtn" @click="handleDelItem(item.filepath)">删除</button>
          </div>
        </div>
      </template>
    </RecycleScroller>
  </a-modal>
</template>

<script>
import { DefaultUploadSelectItem, FormatSize } from "../../store/data.js";
export default {
  name: "RenameMultiModal",
  data: function() {
    return {
      modalLoading: false,
      modalError: "",
      uploadFileList: [],
      uploadFileCount: 0,
      uploadFileSize: 0,
      uploadFileDir: "",

      uploadToDirKey: "",
      uploadToDirPath: "",
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "upload";
    },
    uploadFileSizeStr: function() {
      return FormatSize(this.uploadFileSize);
    },
  },
  watch: {
        checkShowModal: function(newval) {
      if (newval == true) {
        let data = { ...this.$store.state.UI.modaldata };
        this.uploadToDirKey = data.dirkey;
        this.uploadToDirPath = data.dirpath;
        let LEN = data.filelist.length;
        let List = [];
        for (let i = 0; i < LEN; i++) {
          List.push(DefaultUploadSelectItem(data.filelist[i]));
        }
        this.uploadFileList = List;
        this.uploadFileCount = data.filecount;
        this.uploadFileSize = data.filesize;
        this.uploadFileDir = data.filedir;
      } else {
        this.uploadFileList = [];
        this.uploadFileCount = 0;
        this.uploadFileSize = 0;
        this.uploadFileDir = "";
        this.modalError = "";
        this.modalLoading = false;
      }
    },
  },
  methods: {
    handleDelItem: function(filepath) {
      if (this.uploadFileList.length < 2) return;       let List2 = [];
      let LEN = this.uploadFileList.length;
      for (let i = 0; i < LEN; i++) {
        let item = this.uploadFileList[i];
        if (item.filepath != filepath) {
          List2.push(item);
        } else if (item.isdir == false) {
          this.uploadFileCount--;
          this.uploadFileSize -= item.sizeint;
        }
      }
      if (List2.length != LEN) {
        this.uploadFileList = List2;
      }
    },

        handleSave: function() {
      this.modalLoading = true;
      let filelist = [];
      for (let i = 0; i < this.uploadFileList.length; i++) {
        filelist.push(this.uploadFileList[i].filepath);
      }
      let data = { uploadtokey: this.uploadToDirKey, uploadtopath: this.uploadToDirPath, filedir: this.uploadFileDir, filelist };
      this.$store.dispatch("Pan/aUploadFile", data).then((resp) => {
        if (resp.code == 0) {
          this.modalError = "";
          this.modalLoading = false;
          this.$store.commit("UI/mShowModal", { name: "", data: {} });
          this.$message.success("操作成功,已添加 " + resp.filecount + " 个文件到上传队列中");
        } else {
          this.modalError = resp.message;
          this.modalLoading = false;
        }
      });
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
#UploadModal .ant-modal {
  max-width: 740px;
  min-width: 520px;
}

#UploadModal .uploaditemlist {
  max-height: 400px;
  min-height: 200px;
  width: 100%;
  overflow: auto;
  border-top: 1px solid #e8e8e8;
  margin-bottom: 8px;
}

.uploaditemlist .filename {
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

.uploaditemlist .filename:hover {
  background-color: #f7f8fa !important;
}

.uploaditemlist .filename .iconfont {
  width: 24px;
  padding-left: 4px;
}

.uploaditemlist .filename .title {
  flex: 1 1 0%; 
  overflow: hidden;
  cursor: default;
}
.uploaditemlist .filename .title > div {
  width: fit-content;
  max-width: 100%;
  height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.uploaditemlist .filename .size {
  padding-left: 8px;
}
.uploaditemlist .filename .del {
  width: 50px;
  text-align: center;
}
.uploaditemlist .filename .delbtn {
  font-size: 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-width: 30px;
  height: 20px;
  line-height: 20px;
  padding: 0 2px;
}
.uploaditemlist .filename .delbtn:hover {
  background-color: rgba(207, 86, 89, 0.2);
}
</style>
