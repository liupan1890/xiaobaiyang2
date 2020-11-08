<template>
  <div id="app">
    <div id="leftmenu">
      <NavUser key="NavUser" />
      <NavMenu key="NavMenu" />

      <Menu6Pan key="Menu6Pan" />
      <MenuDown key="MenuDown" />
      <MenuRss key="MenuRss" />
    </div>

    <Right6Pan key="Right6Pan" />
    <RightDown key="RightDown" />
    <RightRss key="RightRss" />

    <UserAddModal key="UserAddModal" />
    <UserEditModal key="UserEditModal" />
    <RssAddModal key="RssAddModal" />
    <SettingModal key="SettingModal" />

    <AddDirModal key="AddDirModal" />
    <ShowImageModal key="ShowImageModal" />
    <ShowTxtModal key="ShowTxtModal" />
    <CopytoModal key="CopytoModal" />
    <DownFileModal key="DownFileModal" />
    <UploadModal key="UploadModal" />
    <LiXianModal key="LiXianModal" />
    <RenameModal key="RenameModal" />
    <RenameMultiModal key="RenameMultiModal" />
    <RemotePasswordModal key="RemotePasswordModal" />
    <VerUpdateModal key="VerUpdateModal" />
  </div>
</template>

<script>
import NavUser from "./components/NavUser.vue";
import NavMenu from "./components/NavMenu.vue";
import UserAddModal from "./components/modal/UserAddModal.vue";
import UserEditModal from "./components/modal/UserEditModal.vue";
import SettingModal from "./components/modal/SettingModal.vue";
import RssAddModal from "./components/modal/RssAddModal.vue";

import AddDirModal from "./components/modal/AddDirModal.vue";
import ShowImageModal from "./components/modal/ShowImageModal.vue";
import ShowTxtModal from "./components/modal/ShowTxtModal.vue";
import CopytoModal from "./components/modal/CopytoModal.vue";
import DownFileModal from "./components/modal/DownFileModal.vue";
import UploadModal from "./components/modal/UploadModal.vue";
import LiXianModal from "./components/modal/LiXianModal.vue";
import RenameModal from "./components/modal/RenameModal.vue";
import RenameMultiModal from "./components/modal/RenameMultiModal.vue";
import RemotePasswordModal from "./components/modal/RemotePasswordModal.vue";
import VerUpdateModal from "./components/modal/VerUpdateModal.vue";

import Menu6Pan from "./components/Menu6Pan.vue";
import MenuDown from "./components/MenuDown.vue";
import MenuRss from "./components/MenuRss.vue";

import Right6Pan from "./components/Right6Pan.vue";
import RightDown from "./components/RightDown.vue";
import RightRss from "./components/RightRss.vue";

export default {
  name: "App",
  data: function () {
    return {};
  },
  components: {
    NavUser,
    NavMenu,
    UserAddModal,
    UserEditModal,
    RssAddModal,
    SettingModal,
    AddDirModal,
    ShowImageModal,
    ShowTxtModal,
    CopytoModal,
    DownFileModal,
    UploadModal,
    LiXianModal,
    RenameModal,
    RenameMultiModal,
    RemotePasswordModal,
    VerUpdateModal,
    Menu6Pan,
    MenuDown,
    MenuRss,
    Right6Pan,
    RightDown,
    RightRss,
  },
  methods: {},
};
</script>
<style src="./assets/app.css"></style>
<style src="./assets/icon.css"></style>
<style src="./assets/github-markdown.min.css"></style>
<style>
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

#leftmenu {
  width: 320px;
  top: 0px;
  left: 0px;
  transition: left 0.3s ease-in-out 0s;
  height: 100vh;
  position: absolute;
  background: #f9f8f8;
}
.right {
  top: 0px;
  left: 320px;
  right: 5px;

  transition: left 0.3s ease-in-out 0s;
  height: 100vh;
  position: absolute;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #202d40;
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
}
.desc {
  font-size: 14px;
  line-height: 22px;
  color: #bcb3b3;
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

.desc:hover {
  background-color: #eeecec;
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
  min-width: 85px;
  margin: 0px;
}
</style>
