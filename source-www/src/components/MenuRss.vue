<template>
  <div class="dataMenu" :style="{ display: checkDisplay }">
    <div class="MenuRow" style="padding: 8px 18px 4px 18px">
      <div class="desc">Rss订阅资源</div>
    </div>
    <a-spin :spinning="RssLoading"> </a-spin>
    <a-tree class="ant-tree-directory rsstree" :treeData="RssList" :defaultExpandAll="true" :defaultExpandParent="true" :autoExpandParent="true" :selectedKeys="RssSelected" @select="handleSelectRss">
      <template #switcherIcon>
        <span class="ant-tree-switcher-icon">
          <span class="iconfont icondown"></span>
        </span>
      </template>
      <template #custom="item">
        <div class="lefticon">
          <span class="iconfont" :class="item.licon"></span>
        </div>
        <span class="midtitle"
          >{{ item.name }}<s>{{ item.url }}</s></span
        >
        <div class="rightbtn">
          <span v-if="item.isActive" class="iconfont icon141" style="color: rgb(66, 185, 131)" title="更新中"></span>
          <span v-else class="iconfont icon122" title="已停更"></span>
        </div>
      </template>
    </a-tree>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed } from 'vue'
  import { StoreUI } from '@/store/ui'
  import { StoreRss } from '@/store/rss'
  export default defineComponent({
    name: 'MenuRss',
    setup() {
      const checkDisplay = computed(() => (StoreUI.PageName === '/rss' ? 'flex' : 'none'))
      const RssList = computed(() => StoreRss.RssList)
      const RssLoading = computed(() => StoreRss.RssLoading)
      const RssSelected = computed(() => {
        return [StoreRss.RssSelected.key]
      })

      function handleSelectRss(_: any, e: any) {
        const rsskey = e.node.dataRef.key
        StoreRss.aSelectRss(rsskey)
        const node = e.node
        const item = node.dataRef
        if (item.children && item.children.length > 0) {
          if (node.expanded === false) node.onExpand()
        }
      }

      return {
        checkDisplay,
        RssList,
        RssLoading,
        RssSelected,
        handleSelectRss,
      }
    },
  })
</script>

<style>
  /******       AddRss         **** */
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
  .RefreshRss {
    height: 28px !important;
    width: 28px !important;
    min-width: 28px !important;
    line-height: 28px !important;
    color: #df5659;
    background-color: rgba(207, 86, 89, 0.1);
    border: 1px solid rgba(207, 86, 89, 0.4);
  }
  .RefreshRss:hover,
  .RefreshRss:active,
  .RefreshRss:focus,
  .RefreshRss:visited {
    color: #df5659;
    background-color: rgba(207, 71, 71, 0.2);
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
  .rsstree li span.ant-tree-switcher,
  .rsstree li span.ant-tree-iconEle {
    width: 20px;
  }
  .rsstree .ant-tree-title .lefticon {
    height: 24px;
    font-size: 18px !important;
    line-height: 24px;
    display: flex !important;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    color: #bcb3b3;
    flex-grow: 0;
    flex-shrink: 0;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms !important;
  }
  .rsstree .ant-tree-title .lefticon .iconfont {
    font-size: 18px !important;
    line-height: 24px;
  }
  .rsstree .ant-tree-title .midtitle {
    flex: 1 1 auto;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin-left: 6px;
    font-size: 14px;
    height: 24px;
    line-height: 24px;
    color: #655757;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms !important;
  }

  .rsstree .ant-tree-title .midtitle > s {
    font-size: 12px;
    line-height: 24px;
    color: #bcb3b3;
    padding-left: 8px;
    text-decoration: none;
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
  .ant-tree-treenode-selected > .ant-tree-node-selected .lefticon .iconfont,
  .ant-tree-treenode-selected > .ant-tree-node-selected .midtitle > s,
  .ant-tree-treenode-selected > .ant-tree-node-selected .rightbtn .iconfont,
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
