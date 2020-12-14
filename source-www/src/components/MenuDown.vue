<template>
  <div class="dataMenu" :style="{ display: checkDisplay }" oncontextmenu="return false;">
    <div class="MenuRow" style="padding: 8px 18px 4px 18px">
      <div class="desc">本地下载的文件</div>
    </div>

    <a-tree class="dirtree" show-icon :defaultExpandAll="true" :defaultExpandParent="true" :autoExpandParent="true" :tree-data="treeData" :selectedKeys="downSelectedPage" @select="onSelectDown">
      <template #switcherIcon>
        <span class="ant-tree-switcher-icon">
          <span class="iconfont icondown"></span>
        </span>
      </template>
      <template #custom="item">
        <span class="iconfont" :class="item.licon"></span>
        <span class="dirtreename">{{ item.name }}</span>
      </template>
    </a-tree>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed } from 'vue'
  import { StoreDown } from '@/store/down'
  import { StoreUI } from '@/store/ui'
  export default defineComponent({
    name: 'MenuDown',
    setup() {
      const checkDisplay = computed(() => (StoreUI.PageName === '/down' ? 'flex' : 'none'))
      const downSelectedPage = computed(() => [StoreDown.downSelectedPage])
      const treeData = StoreDown.treeData

      function onSelectDown(_: any, e: any) {
        const downkey = e.node.dataRef.key
        StoreDown.aSelectDown(downkey)
      }

      return {
        checkDisplay,
        downSelectedPage,
        treeData,
        onSelectDown,
      }
    },
  })
</script>

<style></style>
