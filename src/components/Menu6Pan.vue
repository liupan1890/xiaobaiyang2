<template>
  <div class="dataMenu" :style="{ display: checkDisplay }">
    <div class="MenuRow" style="padding:8px 18px 4px 18px">
      <div class="desc" title="网盘文件已用空间"><a-icon type="pie-chart" />{{ userSelected.panused }}</div>
      <div class="desc" title="免费用户" v-if="userSelected.isvip == false"><a-icon type="user" />free</div>
      <div class="desc" title="VIP用户" v-if="userSelected.isvip == true"><a-icon type="crown" />{{ userSelected.vipdate }}</div>
    </div>
    <a-tree id="dirtree" class="dirtree" show-icon auto-expand-parent default-expand-all :expanded-keys="panDirExpanded" :tree-data="panDirList" :selectedKeys="panDirSelected" @select="onSelectDir" @expand="onExpand" :load-data="onLoadData">
      <a-icon slot="switcherIcon" type="down" />
      <span slot="custom" slot-scope="item">
        <a-icon :type="item.licon" />
        <span :id="item.key">{{ item.dirname }}</span>
      </span>
    </a-tree>
  </div>
</template>

<script>
export default {
  name: "Menu6Pan",
  data: function() {
    return {
      dirSelectedKey: "",
    };
  },

  computed: {
    checkDisplay: function() {
      return this.$store.state.UI.pagename == "/6pan" ? "flex" : "none";
    },
    userSelected: function() {
      return this.$store.state.User.userSelected;
    },
    panDirList: function() {
      return this.$store.state.Pan.panDirList;
    },
    panDirSelected: function() {
      return [this.$store.state.Pan.panDirSelected.dirkey];
    },
    panDirExpanded: function() {
      return ["6pan-root", this.$store.state.Pan.panDirSelected.dirkey];
    },
  },

  methods: {
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
  },
};
</script>

<style>
.dirtree {
  font-size: 16px !important;
  flex: 1 1 auto; 
  overflow-x: auto;
  overflow-y: auto;
  scroll-behavior: smooth;
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
.dirtree .ant-tree-switcher .ant-tree-switcher-icon {
  font-size: 16px !important;
}
.dirtree .ant-tree-icon__customize {
  font-size: 16px !important;
}
.dirtree .ant-tree-title .anticon {
  width: 24px;
}

.dirtree li span.ant-tree-switcher,
.dirtree li span.ant-tree-iconEle {
  width: 18px;
}
</style>
