<template>
  <div class="dataMenu" v-bind:style="{ display: checkDisplay }">
    <div class="MenuRow" style="padding:8px 18px 4px 18px">
      <div class="desc">Rss订阅</div>
    </div>
    <div class="MenuRow Add">
      <a-button class="AddRss" icon="plus" @click="handleRssAdd">新增订阅</a-button>
    </div>
    <div class="MenuRow" style="padding-left:18px">
      <div class="desc">我订阅的资源</div>
    </div>
    <a-spin :spinning="rssLoading"> </a-spin>
    <a-tree v-if="rssLoading == false" :treeData="rssList" :defaultExpandAll="true" :defaultExpandParent="true" :autoExpandParent="true" @select="handleSelectRss" :selectedKeys="rssSelected" class="ant-tree-directory rsstree">
      <a-icon slot="switcherIcon" type="down" />
      <template slot="custom" slot-scope="record">
        <div class="lefticon">
          <a-icon v-if="record.licon" :type="record.licon" />
        </div>
        <span class="midtitle">{{ record.rssname }}</span>
        <a-tooltip placement="bottom" title="删除此订阅" overlayClassName="MuiTooltip">
          <div class="rightbtn" v-on:click.stop="handleDeleteRss(record.key)">
            <svg viewBox="64 64 896 896" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
            </svg>
          </div>
        </a-tooltip>
      </template>
    </a-tree>
  </div>
</template>

<script>
export default {
  name: "MenuRss",
  data: function() {
    return {};
  },
  computed: {
    checkDisplay: function() {
      return this.$store.state.UI.pagename == "/rss" ? "flex" : "none";
    },
    rssList: function() {
      return this.$store.state.Rss.rssList;
    },
    rssLoading: function() {
      return this.$store.state.Rss.rssLoading;
    },
    rssSelected: function() {
      return [this.$store.state.Rss.rssSelected.key];
    },
  },
  methods: {
    handleRssAdd: function() {
      this.$store.commit("UI/mShowModal", { name: "addrss", data: {} });
    },
    handleSelectRss: function(_, e) {
      let rsskey = e.node.dataRef.key;
      this.$store.dispatch("Rss/aSelectRss", rsskey); 

      let node = e.node;
      let item = node.dataRef;
      if (item.children && item.children.length > 0) {
        if (node.expanded == false) node.onExpand(); 
      }
    },
    handleDeleteRss: function(rsskey) {
      this.$store.dispatch("Rss/aDeleteRss", rsskey);
    },
  },
};
</script>

<style>
.MenuRow {
  display: flex;
  align-items: center;
  min-height: 24px;
  flex-grow: 0; 
  flex-shrink: 0; 
}
.MenuRow.Add {
  height: 50px;
  justify-content: center;
  padding-top: 10px;
  align-items: flex-start;
}
.MenuRow .Title {
  padding: 0 4px 0 18px;
  text-overflow: ellipsis;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
}
.AddRss {
  height: 28px !important;
  width: 174px !important;
  line-height: 28px !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none;
  color: #df5659;
  font-size: 16px;
  cursor: pointer;
  background-color: rgba(207, 71, 71, 0.1);
}
.AddRss .anticon svg > path {
  color: #df5659 !important;
  fill: #df5659 !important;
}
.AddRss:hover,
.AddRss:active,
.AddRss:focus,
.AddRss:visited {
  color: #df5659;
  background-color: rgba(207, 71, 71, 0.2);
}
</style>
<style>
.rsstree {
  font-size: 16px;
  width: 100%;
  flex: 1 1 0%;
  overflow-x: hidden;
  overflow-y: auto;
}
.rsstree li {
  padding: 0 !important;
  min-height: 32px;
  display: flex !important;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.rsstree .ant-tree-switcher-icon svg {
  font-size: 16px !important;
}

.rsstree li .ant-tree-node-content-wrapper {
  width: calc(100% - 24px);
  min-height: 32px !important;
  border: none !important;
  padding: 0 10px 0 0 !important;
  cursor: pointer !important;
  color: #655757;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms !important;
}

.rsstree li .ant-tree-node-content-wrapper::before {
  height: 32px !important;
}

.rsstree li .ant-tree-node-content-wrapper:hover::before {
  background-color: #eeecec !important;
}
.rsstree li .ant-tree-node-content-wrapper.ant-tree-node-selected::before {
  background-color: rgba(255, 71, 71, 0.1) !important;
  color: #df5659;
}

.rsstree .ant-tree-title {
  height: 32px;
  display: flex !important;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.rsstree .ant-tree-title .lefticon {
  height: 24px;
  display: flex !important;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: #bcb3b3;
  flex-grow: 0; 
  flex-shrink: 0; 
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms !important;
}
.rsstree .ant-tree-title .midtitle {
  flex: 1 1 auto; 
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-left: 6px;
  font-size: 16px;
  height: 24px;
  line-height: 24px;
  color: #655757;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms !important;
}
.rsstree .ant-tree-title .rightbtn {
  width: 24px;
  height: 24px;
  display: flex !important;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-grow: 0; 
  flex-shrink: 0; 
  opacity: 0;
  background-color: transparent;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: top 0.3s ease-in-out, left 0.3s ease-in-out;
  transition: opacity 0.3s;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}

.rightHeadRow svg > path,
.ant-tree-node-content-wrapper svg > path {
  color: #928787;
  fill: #928787;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms !important;
}

.rsstree .anticon-loading svg > path {
  color: #fff;
  fill: #fff;
}

.rsstree .ant-tree-title:hover .rightbtn {
  opacity: 1;
}
.rsstree .ant-tree-title:hover .rightbtn:hover {
  background-color: rgba(216, 210, 210, 0.6);
  border-radius: 4px;
}

.ant-tree-treenode-selected > .ant-tree-switcher path,
.ant-tree-treenode-selected > .ant-tree-node-selected path,
.ant-tree-treenode-selected > .ant-tree-node-selected .rightbtn path {
  color: #df5659;
  fill: #df5659;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms !important;
}
.rsstree .ant-tree-node-selected .ant-tree-title .rightbtn:hover {
  background-color: rgba(207, 86, 89, 0.2);
  border-radius: 4px;
}

.rsstree .ant-tree-node-selected .ant-tree-title .midtitle {
  color: #df5659;
}
.rsstree .ant-tree-child-tree {
  width: calc(100%);
}

.rsshelp {
  line-height: 16px;
  font-size: 13px;
  padding: 13px 20px;
  background-color: #f7f9fc;
  border-radius: 6px;
  word-break: break-all;
}

.rsshelp .tag {
  font-size: 13px;
  display: inline-block;
  padding: 0 1px;
  text-transform: uppercase;
  color: #fff;
  background-color: #6ad1c3;
  border-radius: 2px;
  word-break: keep-all;
  white-space: nowrap;
}
.rsshelp .label {
  font-size: 13px;
  display: inline-block;
  padding: 2px 3px 0 3px;

  color: #7d8899;
  background-color: transparent;
  border: 1px solid #e3e7eb;
  border-radius: 2px;
  margin-right: 8px;
}
</style>
