<template>
  <div class="dataMenu" :style="{ display: checkDisplay }" oncontextmenu="return false;">
    <div class="MenuRow" style="padding: 8px 18px 4px 18px">
      <div class="desc">
        <span class="iconfont iconpiechart"></span>
        {{ userSelected.panused }}
      </div>
      <div v-if="userSelected.isvip == false" class="desc">
        <span class="iconfont iconuser"></span>
        free
      </div>
      <div v-if="userSelected.isvip == true" class="desc">
        <span class="iconfont iconcrown"></span>
        {{ userSelected.vipdate }}
      </div>
    </div>
    <div id="dirtreeparent" class="dirtreeparent">
      <a-tree id="dirtree" :expandedKeys="panDirExpanded" :selectedKeys="panDirSelected" class="dirtree" show-icon auto-expand-parent default-expand-all :tree-data="panDirList" :load-data="onLoadData" @select="onSelectDir" @expand="onExpand" @rightClick="onRightClick">
        <template #switcherIcon>
          <span class="ant-tree-switcher-icon">
            <span class="iconfont icondown"></span>
          </span>
        </template>
        <template #custom="item">
          <span v-if="item.licon === 'loading'" class="iconfont iconsync ant-spin-dot ant-spin-dot-spin"></span>
          <span v-else class="iconfont" :class="item.licon"></span>
          <span :id="item.key" class="dirtreename">{{ item.name }}</span>
        </template>
      </a-tree>
      <a-menu v-if="rightMenuSelectedDir.key" class="dirtreemenu" :style="rightMenuPosition">
        <a-menu-item key="1" @click="rightDownFile()">
          <span class="iconfont icondownload">下载文件夹</span>
        </a-menu-item>
        <a-menu-item key="3" @click="rightDeleteFile()">
          <span class="iconfont iconrest">删到回收站</span>
        </a-menu-item>
        <a-menu-item key="4" @click="rightCopytoFile()">
          <span class="iconfont iconcopy">复制/移动</span>
        </a-menu-item>
      </a-menu>
      <div style="width: 100%; height: 84px"></div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed, reactive, onMounted, onBeforeUnmount, ref } from 'vue'
  import { StoreUser } from '@/store/user'
  import { StorePan } from '@/store/pan'
  import { StoreUI } from '@/store/ui'
  import { DeleteFileFile } from '@/store/filehelper'
  import { DownFile, CopytoFile } from '@/store/filehelper2'
  export default defineComponent({
    name: 'Menu6Pan',
    setup() {
      const checkDisplay = computed(() => (StoreUI.PageName === '/6pan' ? 'flex' : 'none'))
      const userSelected = computed(() => StoreUser.UserSelected)
      const panDirList = computed(() => StorePan.panDirList)
      const panDirSelected = computed(() => [StorePan.panDirSelected.key])
      const panDirExpanded = computed(() => ['6pan-root', StorePan.panDirSelected.key])

      const dirSelectedKey = ref('')

      function onLoadData() {
        return Promise.resolve()
      }

      function onExpand(_: any, e: any) {
        const key = e.node.dataRef.key

        dirSelectedKey.value = key
        const path = e.node.dataRef.path
        const name = e.node.dataRef.name
        StorePan.aSelectDir({ key, path, name, sep: false, chd: 0 })
      }
      function onSelectDir(_: any, e: any) {
        const key = e.node.dataRef.key

        dirSelectedKey.value = key
        const path = e.node.dataRef.path
        const name = e.node.dataRef.name
        StorePan.aSelectDir({ key, path, name, sep: false, chd: 0 })
      }
      const rightMenuSelectedDir = reactive({ key: '', path: '' })
      const rightMenuPosition = reactive({ left: '', top: '' })

      function handleClearMenu() {
        rightMenuSelectedDir.key = ''
        rightMenuSelectedDir.path = ''
        const x = document.getElementsByClassName('dirtreename onright')
        for (let i = 0; i < x.length; i++) {
          x[i].className = 'dirtreename'
        }
      }
      function handleResize() {
        StoreUI.mWinSize({ width: document.body.offsetWidth, height: document.body.offsetHeight })
      }
      onMounted(() => {
        document.body.addEventListener('click', handleClearMenu)
        window.addEventListener('resize', handleResize)
      })
      onBeforeUnmount(() => {
        document.body.removeEventListener('click', handleClearMenu)
        window.removeEventListener('resize', handleResize)
      })

      function onRightClick(e: any) {
        const key = e.node.dataRef.key
        if (key === '6pan-lixian' || key === '6pan-huishouzhan' || key === '6pan-search' || key === '6pan-root' || key === '') return
        rightMenuSelectedDir.key = e.node.dataRef.key
        rightMenuSelectedDir.path = e.node.dataRef.path
        const el = e.node.$el
        const dirtree = document.getElementById('dirtreeparent')
        let sl = 0
        if (dirtree) sl = dirtree.scrollLeft
        let left = e.event.x - 16
        if (left > 180) left = 180
        if (left < 64) left = 64
        if (left < sl) left = sl

        rightMenuPosition.left = left.toString() + 'px'
        rightMenuPosition.top = (el.offsetTop + 32).toString() + 'px'
        const x = document.getElementsByClassName('dirtreename onright')
        for (let i = 0; i < x.length; i++) {
          x[i].className = 'dirtreename'
        }
        const id = document.getElementById(key)
        if (id) id.className = 'dirtreename onright'
      }

      function rightDownFile() {
        const key = rightMenuSelectedDir.key
        if (!key) return
        DownFile(key)
      }
      function rightDeleteFile() {
        const key = rightMenuSelectedDir.key
        if (!key) return
        let path = rightMenuSelectedDir.path
        if (!path) return
        if (path.indexOf('/') >= 0) path = path.substr(0, path.lastIndexOf('/'))
        if (path === '') path = '/'
        DeleteFileFile([key], path)
      }
      function rightCopytoFile() {
        const key = rightMenuSelectedDir.key
        if (!key) return
        const path = rightMenuSelectedDir.path
        if (!path) return
        CopytoFile(key, path)
      }

      return {
        checkDisplay,
        userSelected,
        panDirList,
        panDirSelected,
        panDirExpanded,
        dirSelectedKey,
        rightMenuSelectedDir,
        rightMenuPosition,
        onLoadData,
        onExpand,
        onSelectDir,
        onRightClick,
        handleClearMenu,
        rightDownFile,
        rightDeleteFile,
        rightCopytoFile,
      }
    },
  })
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
    color: #2d96fa;
    background: transparent;
    content: '▲';
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
    color: #2d96fa !important;
    background-color: rgba(45, 150, 250, 0.2) !important;
  }
  .dirtreename.onright {
    color: #2d96fa;
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
    height: 24px;
    display: inline-block;
  }
  .dirtree li .ant-tree-title .iconfont {
    font-size: 20px !important;
    line-height: 24px;
    height: 24px;
    vertical-align: top !important;
    display: inline-block;
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
  .dirtreename {
    display: inline-block;
    max-width: 480px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    padding-left: 2px;
  }
</style>
