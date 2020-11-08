<template>
  <div class="dataMenu" :style="{ display: checkDisplay }" oncontextmenu="return false;">
    <div class="MenuRow" style="padding: 8px 18px 4px 18px">
      <div class="desc">本地下载的文件</div>
    </div>

    <a-tree class="dirtree" show-icon :defaultExpandAll="true" :defaultExpandParent="true" :autoExpandParent="true" :tree-data="treeData" @select="onSelectDown" :selectedKeys="downSelected">
      <a-icon slot="switcherIcon" type="down" />
      <span slot="custom" slot-scope="record">
        <a-icon :type="record.licon" />
        <span>{{ record.title }}</span>
      </span>
    </a-tree>
  </div>
</template>

<script>
const treeData = [
  {
    title: "正在下载中",
    key: "downing",
    licon: "download",
    scopedSlots: { title: "custom" },
  },
  {
    title: "已下载的文件",
    key: "downed",
    licon: "desktop",
    scopedSlots: { title: "custom" },
  },
  {
    title: "正在上传中",
    key: "uploading",
    licon: "upload",
    scopedSlots: { title: "custom" },
  },
  {
    title: "已上传的文件",
    key: "upload",
    licon: "cloud",
    scopedSlots: { title: "custom" },
  },
];
export default {
  name: "MenuDown",
  data: function () {
    return { treeData };
  },
  computed: {
    checkDisplay: function () {
      return this.$store.state.UI.pagename == "/down" ? "flex" : "none";
    },
    downSelected: function () {
      return [this.$store.state.Down.downSelected];
    },
  },
  methods: {
    onSelectDown(_, e) {
      let downkey = e.node.dataRef.key;
      this.$store.dispatch("Down/aSelectDown", downkey);
    },
  },
};
</script>

<style></style>
