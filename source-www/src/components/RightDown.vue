<template>
  <div class="right" :style="{ display: checkDisplay }" oncontextmenu="return false;">
    <div class="rightHeadRow" style="-webkit-app-region: drag">
      <a-button v-if="checkDoing" :loading="loading" style="-webkit-app-region: none" @click="handleDownStartAll"><span class="iconfont icondownload"></span>全部开始</a-button>
      <a-button v-if="checkDoing" :loading="loading" style="-webkit-app-region: none" @click="handleDownStopAll"><span class="iconfont iconpause"></span>全部暂停</a-button>
      <a-button :loading="loading" title="只删除暂停下载的，跳过下载中的项" style="-webkit-app-region: none" @click="handleDownDeleteAll"><span class="iconfont icondelete"></span>全部删除</a-button>
    </div>
    <a-spin :spinning="downFileLoading">
      <div class="filetable ant-table ant-table-scroll-position-left ant-table-layout-fixed ant-table-default ant-table-empty">
        <div class="ant-table-content">
          <div class="ant-table-body">
            <table>
              <colgroup>
                <col />
                <col style="width: 220px; min-width: 220px" />
              </colgroup>
              <thead class="ant-table-thead">
                <tr>
                  <th key="filename" class="ant-table-row-cell-ellipsis">
                    <span class="ant-table-header-column">
                      <div class="ant-table-column-sorters">
                        <span class="ant-table-column-title">文件名( {{ downFileCount }}条记录 )</span>
                      </div>
                    </span>
                  </th>
                  <th key="key" class="ant-table-row-cell-break-word ant-table-row-cell-last">
                    <span class="ant-table-header-column">
                      <div class="ant-table-column-sorters">
                        <span class="ant-table-column-title">操作</span>
                      </div>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody class="ant-table-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </a-spin>

    <div v-if="downFileLoading == false && downFileList.length === 0" class="scrollviewhead">
      <div class="iconfont">
        <span class="iconempty"></span>
      </div>
      <div class="emptytip">空的</div>
    </div>

    <VxeList id="downitemlist" class="downitemlist" :data="downFileList" :datats="0" :rowHeight="60" :scrollYMinCount="50" oncontextmenu="return false;">
      <template #default="{ items }">
        <div v-for="item in items" :key="item.key" :class="{ filename: true, selected: selectedRow === item.key, active: item.active }" @click="handleClickFileItem(item.key)">
          <div class="iconfont">
            <span :class="item.fileicon"></span>
          </div>
          <div class="title" :title="item.savepath">
            {{ item.name }}
          </div>
          <div class="error">{{ item.error }}</div>
          <div class="info">
            <span class="server">{{ item.server }}</span>
            {{ item.info }}
          </div>
          <div class="dian">-</div>
          <div class="size">{{ item.sizestr }}</div>
          <div class="space"></div>
          <div v-if="checkDoing" class="progress">
            <a-progress :percent="item.progress" size="small" :strokeWidth="3" />
          </div>
          <div v-if="checkDoing" class="speed">{{ item.speedstr }}</div>
          <div v-if="loading == false" class="fileactions" :class="{ doing: checkDoing }">
            <div v-if="checkDoing && item.active == false" class="rightbtn" title="开始下载" @click="handleDownStart(item)">
              <span class="iconfont iconstart"></span>
            </div>
            <div v-if="checkDoing && item.active" class="rightbtn" title="暂停" @click="handleDownStop(item)">
              <span class="iconfont iconpause"></span>
            </div>
            <div v-if="checkDowned" class="rightbtn" title="打开文件夹" @click="handleOpenDir(item)">
              <span class="iconfont iconfolder"></span>
            </div>
            <div class="rightbtn" title="删除记录" @click.stop="handleDownDelete(item)">
              <span class="iconfont icondelete"></span>
            </div>
          </div>
        </div>
      </template>
    </VxeList>

    <div v-if="checkDoing && downFileCount > 499" class="scrollviewfoot">
      当前仅显示了前499条，
      <span class="dcount">{{ downFileCount - 499 }}</span>
      条记录稍后展示
    </div>
    <div v-if="checkDowned" class="scrollviewfoot">仅显示最近10天的下载/上传记录，更早的已被自动删除</div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed, ref } from 'vue'
  import APIDown from '@/api/down'

  import { StoreUI } from '@/store/ui'
  import { IDownItem, StoreDown } from '@/store/down'
  import VxeListComponent from '@/components/vxe-list'
  import { message } from 'ant-design-vue'
  export default defineComponent({
    name: 'RightDown',
    components: { VxeList: VxeListComponent },
    setup() {
      const checkDisplay = computed(() => (StoreUI.PageName === '/down' ? 'flex' : 'none'))
      const selectedRow = ref('')
      const loading = ref(false)
      const downFileLoading = computed(() => StoreDown.downFileLoading)
      const downFileList = computed(() => StoreDown.downFileList)
      const downFileCount = computed(() => StoreDown.downFileCount)
      const downSelectedPage = computed(() => StoreDown.downSelectedPage)
      const checkDoing = computed(() => StoreDown.downSelectedPage === 'downing' || StoreDown.downSelectedPage === 'uploading')
      const checkDowned = computed(() => StoreDown.downSelectedPage === 'downed' || StoreDown.downSelectedPage === 'upload')

      function handleClickFileItem(filekey: string) {
        selectedRow.value = filekey
      }
      function handleDownStartAll() {
        loading.value = true
        APIDown.DownStartAll(downSelectedPage.value).then(() => {
          loading.value = false
          StoreDown.aSelectDown('refresh')
        })
      }
      function handleDownStopAll() {
        loading.value = true
        APIDown.DownStopAll(downSelectedPage.value).then(() => {
          loading.value = false
          StoreDown.aSelectDown('refresh')
        })
      }
      function handleDownDeleteAll() {
        loading.value = true
        APIDown.DownDeleteAll(downSelectedPage.value).then(() => {
          loading.value = false
          StoreDown.aSelectDown('refresh')
        })
      }
      function handleDownStart(item: IDownItem) {
        loading.value = true
        APIDown.DownStart(downSelectedPage.value, item.key).then(() => {
          loading.value = false
          StoreDown.aSelectDown('refresh')
        })
      }
      function handleDownStop(item: IDownItem) {
        loading.value = true
        APIDown.DownStop(downSelectedPage.value, item.key).then(() => {
          loading.value = false
          StoreDown.aSelectDown('refresh')
        })
      }
      function handleDownDelete(item: IDownItem) {
        loading.value = true
        APIDown.DownDelete(downSelectedPage.value, item.key).then(() => {
          loading.value = false
          StoreDown.aSelectDown('refresh')
        })
      }
      function handleOpenDir(item: IDownItem) {
        if (window.WebShowItemInFolder) {
          window.WebShowItemInFolder(item.savepath)
        } else {
          message.error('需要Electron环境支持')
        }
      }

      return {
        checkDisplay,
        selectedRow,
        loading,
        downFileLoading,
        downFileList,
        downFileCount,
        checkDoing,
        checkDowned,
        handleClickFileItem,
        handleDownStartAll,
        handleDownStopAll,
        handleDownDeleteAll,
        handleDownStart,
        handleDownStop,
        handleDownDelete,
        handleOpenDir,
      }
    },
  })
</script>

<style>
  .scrollviewhead {
    width: 100%;
  }
  .scrollviewhead .iconfont {
    width: 100%;
    text-align: center;
  }

  .scrollviewhead .iconfont .iconempty {
    font-size: 80px;
    color: rgba(49, 70, 89, 0.6);
    opacity: 0.4;
  }
  .scrollviewhead .emptytip {
    width: 100%;
    font-size: 14px;
    color: rgba(49, 70, 89, 0.6);
    text-align: center;
  }
  .downitemlist {
    flex: 1 1 0%;
    width: 100%;
    scroll-behavior: smooth;
    transition: all 0.5s ease-in;
    position: relative;
  }
  .downitemlist.vxe-list .vxe-list--virtual-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
    transition: all 0.5s ease-in;
    scroll-behavior: smooth;
  }
  .scrollviewfoot {
    font-size: 12px;
    color: rgba(49, 70, 89, 0.6);
    text-align: center;
    line-height: 16px;
    padding-top: 8px;
  }
  .scrollviewfoot .dcount {
    color: #2d8cf0;
  }

  .downitemlist .filename {
    width: 100%;
    height: 60px;
    display: flex !important;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    color: rgba(0, 0, 0, 0.7);
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 15px;
    line-height: 28px;
    padding-right: 4px;
    position: relative;
    border-bottom: 1px solid #eef2f8 !important;
  }

  .downitemlist .filename.selected,
  .downitemlist .filename:hover {
    background-color: #f7f8fa !important;
  }
  .downitemlist .filename.active .iconfont {
    color: #2d8cf0;
  }

  .downitemlist .filename .title {
    overflow: hidden;
    cursor: default;
    flex-grow: 0;
    flex-shrink: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 4px;
    font-size: 15px;
    line-height: 28px;
  }
  .downitemlist .filename .error {
    position: absolute;
    left: 37px;
    bottom: 4px;
    font-size: 12px;
    line-height: 14px;
    height: 14px;
    color: #ef3450;
    overflow: hidden;
    text-overflow: ellipsis;
    z-index: 5;
  }
  .downitemlist .filename .info {
    position: absolute;
    left: 37px;
    bottom: 4px;
    font-size: 12px;
    line-height: 14px;
    height: 14px;
    color: rgba(0, 0, 0, 0.4);
    overflow: hidden;
    text-overflow: ellipsis;
    z-index: 5;
  }
  .downitemlist .filename .info .server {
    color: rgba(66, 185, 131, 0.6);
  }
  .downitemlist .filename .info .bad {
    color: #fc5531;
  }

  .downitemlist .filename .dian {
    font-size: 16px;
    font-weight: normal;
    flex-grow: 0;
    flex-shrink: 0;
    padding: 0 12px;
    line-height: 28px;
  }
  .downitemlist .filename .size {
    font-size: 12px;
    font-weight: normal;
    flex-grow: 0;
    flex-shrink: 0;
    padding-top: 2px;
    line-height: 26px;
  }
  .downitemlist .filename .space {
    flex-grow: 1;
    flex-shrink: 1;
  }
  .downitemlist .filename .speed {
    color: rgba(0, 0, 0, 0.15);
    font-size: 24px;
    padding: 0 6px 0 0;
    text-align: right;
    flex-grow: 0;
    flex-shrink: 0;
    width: 110px;
    overflow: hidden;
    line-height: 28px;
  }

  .downitemlist .filename .progress {
    width: 100px;
    margin: 0 10px;
    flex-grow: 0;
    flex-shrink: 0;
    line-height: 24px;
    padding-bottom: 4px;
  }

  .downitemlist .fileactions {
    padding: 0 0 0 12px;
    display: flex !important;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    position: absolute;
    right: 0;
    top: 16px;
    min-width: 120px;
    background-color: #f7f8fa;
    opacity: 0;
  }
  .downitemlist .fileactions.doing {
    right: 110px;
  }
  .downitemlist .filename:hover .fileactions {
    opacity: 1;
  }
  .downitemlist .filename .rightbtn {
    min-width: 24px;
    height: 28px;
    width: auto;
    font-size: 22px;
    padding: 0 8px;
    margin-right: 16px;
    cursor: pointer;
    flex-grow: 0;
    flex-shrink: 0;
    background-color: transparent;
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
  }

  .downitemlist .filename .rightbtn > .iconfont::before {
    font-size: 22px;
    line-height: 28px;
    color: #2d8cf0;
  }
  .downitemlist .filename .rightbtn > .iconfont {
    font-size: 14px;
    line-height: 28px;
    color: #2d8cf0;
    padding-left: 0;
    display: inline-flex;
    width: auto;
  }

  .downitemlist .filename:hover .rightbtn:hover {
    background-color: rgba(0, 132, 255, 0.1);
    border-radius: 4px;
  }

  .downitemlist .filename .iconfont {
    width: 34px;
    padding-left: 10px;
    font-size: 24px;
    line-height: 28px;
    color: #928787;
  }
</style>

<style>
  .downtable .filename .iconfont {
    width: 28px;
    font-size: 24px;
    padding-left: 4px;
    display: inline-block;
  }

  .downtable .ant-table-row .rightbtn {
    min-width: 24px;
    height: 28px;
    font-size: 24px;
    padding: 4px 8px;
    margin-right: 16px;
    cursor: pointer;
    display: flex !important;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-grow: 0;
    flex-shrink: 0;
    background-color: transparent;
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
  }

  .downtable .ant-table-row .rightbtn > span {
    font-size: 14px;
    color: #928787;
  }

  .downtable .ant-table-row:hover .rightbtn:hover {
    background-color: rgba(216, 210, 210, 0.6);
    border-radius: 4px;
  }
  .downtable i > svg > path {
    color: #928787;
    fill: #928787;
  }
</style>
