<template>
  <div class="dataMenu" :style="{ display: checkDisplay }" oncontextmenu="return false;">
    <div class="MenuRow" style="padding: 8px 18px 4px 18px">
      <div class="desc" title="网盘文件已用空间">
        <a-icon type="pie-chart" />
        {{ userSelected.panused }}
      </div>
      <div class="desc" title="免费用户" v-if="userSelected.isvip == false">
        <a-icon type="user" />
        free
      </div>
      <div class="desc" title="VIP用户" v-if="userSelected.isvip == true">
        <a-icon type="crown" />
        {{ userSelected.vipdate }}
      </div>
    </div>
    <div id="dirtreeparent" class="dirtreeparent">
      <a-tree id="dirtree" class="dirtree" show-icon auto-expand-parent default-expand-all :expanded-keys="panDirExpanded" :tree-data="panDirList" :selectedKeys="panDirSelected" @select="onSelectDir" @expand="onExpand" @rightClick="onRightClick" :load-data="onLoadData">
        <span slot="switcherIcon" class="iconfont icondown"></span>
        <span slot="custom" slot-scope="item">
          <span class="iconfont" :class="item.licon"></span>
          <span :id="item.key">{{ item.dirname }}</span>
        </span>
      </a-tree>
      <a-menu v-if="dirSelectedItem.key" class="dirtreemenu" :style="menustyle">
        <a-menu-item key="1" @click="DownFile()">
          <span class="iconfont icondownload">下载文件夹</span>
        </a-menu-item>
        <a-menu-item key="3" @click="DeleteFile()">
          <span class="iconfont iconrest">删除到回收站</span>
        </a-menu-item>
        <a-menu-item key="4" @click="CopytoFile()">
          <span class="iconfont iconcopy">复制/移动</span>
        </a-menu-item>
      </a-menu>
      <div style="width: 100%; height: 84px"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Menu6Pan",
  data: function () {
    return {
      dirSelectedKey: "",
      dirSelectedItem: {},
      menustyle: {
        left: "0px",
        top: "0px",
      },
    };
  },

  mounted: function () {
    document.body.addEventListener("click", this.handleClearMenu);
  },
  beforeDestroy: function () {
    document.body.removeEventListener("click", this.handleClearMenu);
  },

  computed: {
    checkDisplay: function () {
      return this.$store.state.UI.pagename == "/6pan" ? "flex" : "none";
    },
    userSelected: function () {
      return this.$store.state.User.userSelected;
    },
    panDirList: function () {
      return this.$store.state.Pan.panDirList;
    },
    panDirSelected: function () {
      return [this.$store.state.Pan.panDirSelected.dirkey];
    },
    panDirExpanded: function () {
      return ["6pan-root", this.$store.state.Pan.panDirSelected.dirkey];
    },
  },

  methods: {
    handleClearMenu() {
      this.dirSelectedItem = {};
    },
    onLoadData() {
      return new Promise((resolve) => {
        resolve();
      });
    },
    onExpand(expandedKeys, info) {
      let dirkey = info.node.dataRef.key;
      if (this.dirSelectedKey != dirkey) {
        let dirpath = info.node.dataRef.path;
        this.$store.dispatch("Pan/aSelectDir", { dirkey, dirpath });
      }
    },
    onSelectDir(_, e) {
      let dirkey = e.node.dataRef.key;
      let dirpath = e.node.dataRef.path;
      this.dirSelectedKey = dirkey;
      this.$store.dispatch("Pan/aSelectDir", { dirkey, dirpath });
    },
    onRightClick(e) {
      let dirkey = e.node.dataRef.key;
      if (dirkey == "6pan-lixian" || dirkey == "6pan-huishouzhan" || dirkey == "6pan-search" || dirkey == "6pan-root" || dirkey == "") return;
      this.dirSelectedItem = e.node.dataRef;
      let el = e.node.$el;
      this.menustyle = { left: (e.event.x - 16).toString() + "px", top: (el.offsetTop + 32).toString() + "px" };
    },

    DownFile: function () {
      let item = { ...this.dirSelectedItem };
      if (!item.key) return;
      if (this.$store.state.UI.ConfigSavePathEveryTime == true) {
        this.$store.commit("UI/mShowModal", { name: "downfile", data: item });
      } else {
        let hide = this.$message.loading("操作中，请耐心等待...", 0);
        this.$store.dispatch("Pan/aDownFile", item).then((resp) => {
          hide();
          if (resp.code != 0) {
            this.$message.error(resp.message);
          } else {
            this.$message.success("操作成功，创建 " + resp.filecount + " 个文件的下载任务");
          }
        });
      }
    },
    RenameFile: function () {
      let item = { ...this.dirSelectedItem };
      if (!item.key) return;
      console.log(item);
      this.$store.commit("UI/mShowModal", { name: "rename", data: item });
    },
    DeleteFile: function () {
      let item = { ...this.dirSelectedItem };
      if (!item.key) return;
      let hide = () => {};
      if (!item.islixian) hide = this.$message.loading("操作中，请耐心等待...", 0);
      this.$store.dispatch("Pan/aDeleteFile", item).then((resp) => {
        hide();
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          this.$store.dispatch("Pan/aSelectDir", { dirkey: "parent", dirpath: item.path });
          if (resp.async) {
            this.$notification.open({
              message: "操作成功",
              description: "由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果",
              duration: 6,
            });
          } else {
            if (item.isfile) {
              this.$message.success("操作成功，已放入回收站");
            }
          }
        }
      });
    },

    CopytoFile: function () {
      let item = { ...this.dirSelectedItem };
      if (!item.key) return;
      this.$store.commit("UI/mShowModal", { name: "copyto", data: item });
    },
  },
};
</script>

<style>
.dirtreeparent {
  flex: 1 1 auto;
  overflow-x: auto;
  overflow-y: auto;
  scroll-behavior: smooth;
  position: relative;
}
.dirtreemenu {
  border-radius: 4px;
  position: absolute;
  top: 0;
  box-sizing: border-box;
  display: block;
  z-index: 1050;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}
.dirtreemenu::before {
  position: absolute;
  display: block;
  width: 16px;
  height: 16px;
  font-size: 16px;
  color: rgba(223, 86, 89, 0.7);
  background: transparent;
  content: "▲";
  top: -6px;
  left: 4px;
  z-index: -1;
}
.dirtreemenu .ant-menu-item {
  margin: 0 0 0 0 !important;
  height: auto !important;
  padding: 2px 12px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px !important;
}

.dirtreemenu .ant-menu-item .iconfont {
  font-weight: 400;
  font-size: 14px;
}
.dirtreemenu .ant-menu-item .iconfont::before {
  font-size: 16px;
}
.dirtreemenu .ant-menu-item:hover {
  color: #df5659 !important;
  background-color: rgba(207, 86, 89, 0.2) !important;
}

.ant-tree li.ant-dropdown-menu-item {
  padding: 5px 12px;
}
.dirtree {
  font-size: 16px !important;
}
.dirtree > li:first-child {
  padding-top: 4px !important;
}
.dirtree li .ant-tree-node-content-wrapper {
  padding: 0 5px 0 0 !important;
}
.dirtree li .ant-tree-node-content-wrapper:hover {
  background-color: #eeecec !important;
}
.dirtree li.ant-tree-treenode-selected > .ant-tree-switcher {
  color: #df5659;
}
.dirtree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
  background-color: rgba(255, 71, 71, 0.1) !important;
  color: #df5659;
}
.dirtree li span.ant-tree-switcher,
.dirtree li span.ant-tree-iconEle {
  width: 20px;
}
.dirtree li .ant-tree-title {
  padding: 0 2px;
}
.dirtree li .ant-tree-title .iconfont {
  font-size: 20px !important;
  line-height: 20px;
  vertical-align: text-bottom !important;
}
.dirtree li span.ant-tree-switcher .ant-tree-switcher-icon {
  font-size: 18px !important;
  font-weight: normal !important;
  transition: transform 0.3s;
  width: 18px;
  height: 18px;
  display: contents !important;
}
.dirtree li span.ant-tree-switcher.ant-tree-switcher_close {
  transform: rotate(-90deg) !important;
}
</style>
