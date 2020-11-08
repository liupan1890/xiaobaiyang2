<template>
  <a-modal key="CopytoModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleCancel" class="appmodal" id="CopytoModal" width="auto">
    <a-divider orientation="left">请选择要保存到的位置</a-divider>

    <a-tree class="dirtree" show-icon auto-expand-parent default-expand-all :tree-data="treeData" :expanded-keys="dirExpanded" :selectedKeys="dirSelected" @select="onSelectDir">
      <span slot="switcherIcon" class="iconfont icondown"></span>
      <span slot="custom" slot-scope="item">
        <span class="iconfont" :class="item.licon"></span>
        <span>{{ item.dirname }}</span>
      </span>
    </a-tree>

    <div class="footbtn">
      <span style="margin-left: 10px; color: #f5222d; text-align: left">{{ modalError }}</span>
      <a-button type="primary" v-if="dataIsFile" :loading="modalLoading" icon="copy" title="把文件复制到选中的目录下" @click="handleSave('copy')">复制到...</a-button>
      <a-button type="primary" v-if="dataIsFile" :loading="modalLoading" icon="scissor" title="把文件剪切到选中的目录下" @click="handleSave('cut')">剪切到...</a-button>
      <a-button type="primary" v-if="dataIsLiXian" :loading="modalLoading" icon="cloud-download" title="把离线文件保存到选中的目录下" @click="handleSave('lixian')">离线保存到...</a-button>
    </div>
    <div class="texttip" style="text-align: left; margin-top: -42px">
      <a-badge dot>
        <a-icon type="notification" />
      </a-badge>
      {{ dataIsFile ? copytotip : "下次勾选 最近保存位置 更快捷" }}
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "CopytoModal",
  data: function () {
    return {
      modalLoading: false,
      modalError: "",
      dirSelected: ["6pan-root"],
      dirSelectedDir: { dirkey: "6pan-root", dirpath: "/", dirname: "根目录" },
      dirExpanded: ["6pan-root"],
      treeData: [],
      dataIsFile: false,
      dataIsLiXian: false,
      dataKey: "",
      dataList: [],
      dataPath: "",
    };
  },
  components: {},
  computed: {
    checkShowModal: function () {
      return this.$store.state.UI.modalname == "copyto";
    },
    copytotip: function () {
      return this.$store.state.UI.copytotip;
    },
    userkey: function () {
      return this.$store.state.User.userSelected.key;
    },
  },
  watch: {
    checkShowModal: function (newval) {
      if (newval == true) {
        this.treeData = [this.$store.state.Pan.panDirList[this.$store.state.Pan.panDirList.length - 1]];
        this.dataKey = this.$store.state.UI.modaldata.key;
        this.dataList = this.$store.state.UI.modaldata.list;
        this.dataPath = this.$store.state.UI.modaldata.path;
        this.dataIsFile = this.$store.state.UI.modaldata.isfile == true;
        this.dataIsLiXian = this.$store.state.UI.modaldata.islixian == true;
      } else {
        this.treeData = [];
        this.modalError = "";
        this.modalLoading = false;
        this.dataKey = "";
        this.dataList = [];
        this.dataPath = "";
        this.dataIsFile = false;
        this.dataIsLiXian = false;
        this.dirSelected = ["6pan-root"];
        this.dirSelectedDir = { dirkey: "6pan-root", dirpath: "/", dirname: "根目录" };
      }
    },
  },
  methods: {
    handleSave: function (cmd) {
      this.modalLoading = true;
      let item = { key: this.dataKey, list: this.dataList, path: this.dataPath, parentkey: this.dirSelectedDir.dirkey, parentpath: this.dirSelectedDir.dirpath, cmd };

      if (!this.dirSelectedDir.dirkey || this.dirSelectedDir.dirkey == "") {
        this.modalError = "没有选择任何文件夹";
        return;
      }

      this.$store.commit("Pan/mLastSavePath", this.dirSelectedDir);

      let action = this.dataIsFile ? "Pan/aCopyTo" : "Pan/aLiXianTo";
      this.$store.dispatch(action, item).then((resp) => {
        if (resp.code == 0) {
          this.modalError = "";
          this.modalLoading = false;

          if (action == "Pan/aCopyTo") {
            this.$store.dispatch("Pan/aSelectDir", { dirkey: "parent", dirpath: item.path });
            if (resp.async) {
              this.$notification.open({
                message: "操作成功",
                description: "由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果",
                duration: 6,
              });
            } else {
              this.$message.success("操作成功");
            }
          }

          if (action == "Pan/aLiXianTo") {
            if (resp.successCount > 0) {
              this.$message.success("操作成功，添加了 " + resp.successCount + " 个离线任务");
            } else {
              this.$message.error("操作失败，添加离线任务失败请重试");
            }
          }
          this.$store.commit("UI/mShowModal", { name: "", data: {} });
        } else {
          this.modalError = resp.message;
          this.modalLoading = false;
        }
      });
    },
    handleCancel: function () {
      if (this.modalLoading) {
        this.$message.error("正在执行操作中，完成后自动关闭");
        return false;
      }
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },

    onSelectDir(_, e) {
      let dirkey = e.node.dataRef.key;
      let dirpath = e.node.dataRef.path;
      let dirname = e.node.dataRef.dirname;
      this.dirSelectedDir = { dirkey, dirpath, dirname };
      this.$store.dispatch("Pan/aModalSelectDir", { dirkey, dirpath });
      this.dirSelected = [dirkey];
      this.dirExpanded = ["6pan-root", dirkey];
    },
  },
};
</script>

<style>
#CopytoModal .ant-modal {
  max-width: 740px;
  min-width: 520px;
}

#CopytoModal .dirtree {
  max-height: 400px;
  min-height: 200px;
  overflow: auto;
  border-bottom: 1px solid #e8e8e8;
}

#CopytoModal .footbtn {
  padding: 16px 0;
  text-align: right;
}
#CopytoModal button {
  margin-left: 16px;
}
</style>
