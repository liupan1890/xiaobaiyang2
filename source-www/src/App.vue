<template>
  <div id="app">
    <div id="appleft">
      <NavUser />
      <NavMenu />
      <MenuRss />
      <Menu6Pan />
      <MenuDown />
    </div>
    <div id="appright">
      <RightRss />
      <Right6Pan />
      <RightDown />
    </div>
    <UserAddModal />
    <UserEditModal />
    <SettingModal />
    <RenameModal />
    <RenameMultiModal />
    <AddDirModal />
    <CopytoModal />
    <SavePathModal />
    <LiXianModal />
    <UploadModal />
    <ShowTxtModal />
    <ShowDocModal />
    <ShowImageModal />
    <RemotePasswordModal />
    <VerUpdateModal />
    <div v-if="iselectron" id="appdrag" title="按下鼠标左键拖动，移动窗口位置">
      <button class="appbtn borderbtn ant-btn" title="最小化" @click="handleMinSize">
        <span class="iconfont iconzuixiaohua"></span>
      </button>
      <button class="appbtn borderbtn ant-btn" title="关闭" @click="handleClose">
        <span class="iconfont iconclose"></span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue'
  import { StoreUser } from './store/user'
  import { StoreConfig } from '@/store/config'
  import { StoreDown } from '@/store/down'
  import { StorePan } from '@/store/pan'
  import { StoreRss } from '@/store/rss'
  import NavUser from './components/NavUser.vue'
  import UserEditModal from './components/modal/UserEditModal.vue'
  import UserAddModal from './components/modal/UserAddModal.vue'
  import NavMenu from './components/NavMenu.vue'
  import SettingModal from './components/modal/SettingModal.vue'
  import MenuRss from './components/MenuRss.vue'
  import RightRss from './components/RightRss.vue'
  import Menu6Pan from './components/Menu6Pan.vue'
  import Right6Pan from './components/Right6Pan.vue'
  import MenuDown from './components/MenuDown.vue'
  import RightDown from './components/RightDown.vue'
  import RenameModal from './components/modal/RenameModal.vue'
  import RenameMultiModal from './components/modal/RenameMultiModal.vue'
  import AddDirModal from './components/modal/AddDirModal.vue'
  import CopytoModal from './components/modal/CopytoModal.vue'
  import SavePathModal from './components/modal/SavePathModal.vue'
  import LiXianModal from './components/modal/LiXianModal.vue'
  import UploadModal from './components/modal/UploadModal.vue'
  import ShowTxtModal from './components/modal/ShowTxtModal.vue'
  import ShowDocModal from './components/modal/ShowDocModal.vue'
  import ShowImageModal from './components/modal/ShowImageModal.vue'
  import RemotePasswordModal from './components/modal/RemotePasswordModal.vue'
  import VerUpdateModal from './components/modal/VerUpdateModal.vue'

  export default defineComponent({
    components: {
      NavUser,
      UserAddModal,
      UserEditModal,
      NavMenu,
      SettingModal,
      MenuRss,
      RightRss,
      Menu6Pan,
      Right6Pan,
      MenuDown,
      RightDown,
      RenameModal,
      RenameMultiModal,
      AddDirModal,
      CopytoModal,
      SavePathModal,
      LiXianModal,
      UploadModal,
      ShowTxtModal,
      ShowDocModal,
      ShowImageModal,
      RemotePasswordModal,
      VerUpdateModal,
    },

    setup() {
      const iselectron = ref(false)
      onMounted(() => {
        StoreConfig.aRefresh().then(() => {
          StoreUser.aLoadUserList('')
          StoreRss.aLoadRssList()
        })
        if (window.WebToElectron) iselectron.value = true

        const refresh = function () {
          try {
            StoreDown.aRefreshDownByTimer()
          } catch {
            //catch
          }
          try {
            StorePan.aRefreshPanByTimer()
          } catch {
            //catch
          }
          try {
            StoreRss.aRefreshRssByTimer()
          } catch {
            //catch
          }
          setTimeout(refresh, 1000)
        }
        setTimeout(refresh, 2000)
      })

      function handleMinSize() {
        if (window.WebToElectron) window.WebToElectron({ cmd: 'minsize' })
      }

      function handleClose() {
        if (window.WebToElectron) window.WebToElectron({ cmd: 'close' })
      }
      return {
        iselectron,
        handleMinSize,
        handleClose,
      }
    },
  })
</script>
<style src="./components/assets/app.css"></style>
<style src="./components/assets/right.css"></style>
<style src="./components/assets/icon.css"></style>
<style src="./components/assets/github-markdown.min.css"></style>
<style>
  #app {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  #appleft {
    width: 279px;
    top: 1px;
    left: 1px;
    bottom: 1px;
    transition: left 0.3s ease-in-out 0s;
    position: absolute;
    background: #f9f8f8;
    padding: 16px 6px 6px 8px;

    /*border-right: dashed 1px rgba(38, 22, 22, 0.1);*/
    /**#F7F8FA */
  }
  #appright {
    top: 1px;
    left: 280px;
    right: 1px;
    bottom: 1px;
    transition: left 0.3s ease-in-out 0s;
    position: absolute;
    background: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #202d40;
    /*margin: 16px 6px 16px 0;*/
    /*min-width: 1041px;*/
  }
  #appdrag {
    -webkit-app-region: drag;
    top: 1px;
    left: 1px;
    right: 1px;
    height: 22px;
    background: transparent;
    position: absolute;
    cursor: default;
    text-align: right;
    overflow: visible;
  }

  #appdrag .appbtn {
    height: 24px;
    line-height: 22px;
    border: 0;
    padding: 0 4px;
    margin-right: 8px;
    -webkit-app-region: none;
  }
  #appdrag .appbtn > .iconfont {
    font-size: 22px;
    height: 22px;
    line-height: 22px;
  }
  #appdrag .appbtn > .iconfont::before {
    font-size: 22px;
    height: 22px;
    line-height: 22px;
  }
</style>

<style>
  .dataMenu {
    font-size: 16px !important;
    width: 100%;
    height: calc(100% - 80px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    /*  border-right:dashed 1px  rgba(38, 22, 22, 0.1);*/
  }
  .desc {
    font-size: 14px;
    line-height: 22px;
    color: #8a9ca5;
    cursor: default;
    padding: 0 5px;
    border-radius: 3px;
    margin-right: 10px;
    display: inline-block;
    flex-grow: 0;
    flex-shrink: 0;
  }
  .desc > i {
    margin-right: 2px;
  }

  .desctip {
    font-size: 12px;
    color: #7d8899;
    cursor: default;
  }

  .ant-modal .ant-btn {
    outline: none;
    font-size: 14px;
    line-height: 14px;
    padding: 5px 14px;
    border-radius: 4px;
    width: -webkit-fit-content;
    width: -moz-fit-content;
    width: fit-content;
    min-width: 63px;
    margin: 0px;
  }
</style>
