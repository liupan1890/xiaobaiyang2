<template>
  <div class="right" :style="{ display: checkDisplay }">
    <div class="rightHeadRow">
      <a-button class="borderbtn" icon="sync" @click="handleClickRefresh">刷新</a-button>
      <a-button v-if="showHuiShouZhan == false" class="borderbtn" icon="cloud-download" @click="handleClickLiXian">离线下载</a-button>
      <a-button v-if="showFile" class="borderbtn" icon="folder-add" @click="handleClickAddDir" title="新建文件夹">新建</a-button>
      <a-dropdown v-if="showFile" :disabled="uploadLoading">
        <a-menu slot="overlay" @click="handleClickUpload">
          <a-menu-item key="uploadfile">上传文件</a-menu-item>
          <a-menu-item key="uploaddir">上传文件夹</a-menu-item>
        </a-menu>
        <a-button :loading="uploadLoading" icon="upload" class="borderbtn">上传</a-button>
      </a-dropdown>
      <a-input-search v-if="showFile" placeholder="搜索文件" style="width: 200px" @search="handleClickSearch" />

      <a-button v-if="showLiXian" class="borderbtn" icon="delete" @click="handleClickLiXianClear('ok')" title="只删除记录,不会删除文件">删除所有已完成任务</a-button>
      <a-button v-if="showHuiShouZhan" class="borderbtn" icon="delete" @click="handleClickClearHuiShouZhan">清空回收站</a-button>
      <div v-if="showHuiShouZhan" class="texttip">
        <a-badge dot>
          <a-icon type="notification" />
        </a-badge>
        注意：回收站中的文件保留30天，30天后将自动删除，webdav中删除文件不进回收站
      </div>

      <div v-if="showFile && notice.title" class="texttip">
        <a-badge dot>
          <a-icon type="notification" />
        </a-badge>
        <a :href="notice.url" target="_blink">{{ notice.title }}</a>
      </div>
    </div>

    <div class="filepath">
      <template v-for="item in panFilePath">
        <div :key="'fp-n-' + item.key" class="desc" @click="handleClickFilePath(item.key, item.path)">
          {{ item.dirname }}
        </div>
        <div :key="'fp-s-' + item.key" class="sep" v-if="item.sep">/</div>
      </template>
    </div>
    <a-spin :spinning="panFileLoading">
      <div class="filetable ant-table ant-table-scroll-position-left ant-table-layout-fixed ant-table-default ant-table-empty" oncontextmenu="return false;">
        <div class="ant-table-content">
          <div class="ant-table-body">
            <table class="">
              <colgroup>
                <col />
                <col style="width: 90px; min-width: 90px" />
                <col style="width: 100px; min-width: 100px" />
              </colgroup>
              <thead class="ant-table-thead">
                <tr>
                  <th key="filename" class="ant-table-column-has-actions ant-table-column-has-sorters ant-table-column-sort ant-table-row-cell-ellipsis">
                    <span class="ant-table-header-column">
                      <div class="ant-table-column-sorters" title="点击按文件名排序，正序/倒序" @click="handleSorter('filename')">
                        <span class="ant-table-column-title" :class="sorterclassfilename">文件名</span>
                        <span class="iconfont" :class="sorterclassfilename"></span>
                        <span class="ant-table-column-title" style="padding-left: 24px">共{{ panFileListCount }}条记录</span>
                      </div>
                    </span>
                  </th>
                  <th key="sizestr" class="ant-table-column-has-actions ant-table-column-has-sorters ant-table-row-cell-break-word">
                    <span class="ant-table-header-column">
                      <div class="ant-table-column-sorters" title="点击按文件大小排序，正序/倒序" @click="handleSorter('sizestr')">
                        <span class="ant-table-column-title" :class="sorterclasssize">大小</span>
                        <span class="iconfont" :class="sorterclasssize"></span>
                      </div>
                    </span>
                  </th>
                  <th key="datestr" class="ant-table-column-has-actions ant-table-column-has-sorters ant-table-row-cell-break-word ant-table-row-cell-last">
                    <span class="ant-table-header-column">
                      <div class="ant-table-column-sorters" title="点击按时间排序，正序/倒序" @click="handleSorter('datestr')">
                        <span class="ant-table-column-title" :class="sorterclassdate">时间</span>
                        <span class="iconfont" :class="sorterclassdate"></span>
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

    <RecycleScroller id="fileitemlist" class="fileitemlist" :items="panFileList" :item-size="50" key-field="key" oncontextmenu="return false;">
      <template v-if="panFileLoading == false && panFileList.length == 0" #before>
        <div class="scrollviewhead">
          <div class="iconfont">
            <span class="iconempty"></span>
          </div>
          <div class="emptytip">空的</div>
        </div>
      </template>
      <template v-slot="{ item }">
        <div :class="{ filename: true, selected: item.key == selectedKey }" @click="handleClickFileItem(item.key)">
          <div class="iconfont">
            <span :class="item.fileicon"></span>
          </div>
          <div :class="{ title: true, canclick: item.canclick }" :title="item.path">
            <div @click="handleClickFileName(item)">{{ item.filename }}</div>
          </div>
          <div class="size">
            {{ item.sizestr }}
          </div>
          <div class="date">
            {{ item.datestr }}
          </div>

          <div class="fileactions">
            <div v-if="item.istxt" class="rightbtn" v-on:click="ShowTxt(item)" title="预览文本">
              <span class="iconfont iconfile-txt2"></span>
            </div>
            <div v-if="item.isimg" class="rightbtn" v-on:click="ShowImage(item)" title="预览图片">
              <span class="iconfont iconfile-img"></span>
            </div>
            <div v-if="item.isaudio" class="rightbtn" v-on:click="ShowAudio(item)" title="在线播放音频">
              <span class="iconfont iconfile-audio"></span>
            </div>
            <div v-if="item.isvideo" class="rightbtn" v-on:click="ShowVideo(item)" title="在线播放视频">
              <span class="iconfont iconfile-video"></span>
            </div>
            <div v-if="showFile && item.isdir == false" class="rightbtn" v-on:click="DownLink(item)" title="复制文件下载链接">
              <span class="iconfont iconlink2"></span>
            </div>
            <div v-if="showFile" class="rightbtn" v-on:click="DownFile(item)" title="下载文件/文件夹">
              <span class="iconfont icondownload">下载</span>
            </div>
            <div v-if="showFile" class="rightbtn" v-on:click="RenameFile(item)" title="重命名">
              <span class="iconfont iconedit-square"></span>
            </div>
            <div v-if="showFile" class="rightbtn" v-on:click.stop="DeleteFile(item)" title="删除(放入回收站)">
              <span class="iconfont iconrest"></span>
            </div>
            <div v-if="showFile" class="rightbtn" v-on:click="CopytoFile(item)" title="复制/移动">
              <span class="iconfont iconcopy"></span>
            </div>
            <div v-if="showHuiShouZhan" class="rightbtn" v-on:click.stop="RecoverFile(item)" title="恢复到网盘">
              <span class="iconfont iconrecover"></span>
            </div>
            <div v-if="showLiXian" class="rightbtn" v-on:click="LiXianLink(item)" title="复制离线链接">
              <span class="iconfont iconlink2"></span>
            </div>
            <div v-if="showFile == false" class="rightbtn" v-on:click.stop="DeleteFile(item)" title="删除">
              <span class="iconfont icondelete"></span>
            </div>
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<script>
function copyToClipboard(value) {
  var tempInput = document.createElement("input");
  tempInput.style = "position: absolute; left: -100px; top: -100px";
  tempInput.value = value;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}
export default {
  name: "Right6Pan",
  data: function () {
    return {
      selectedKey: "",
      uploadLoading: false,

      cachesortfile: ["filename", "ascend"],
      cachesortlixian: ["datestr", "descend"],
      cachesorthuishouzhan: ["datestr", "descend"],
      cachesortsearch: ["datestr", "descend"],

      sorterfield: "filename",
      sorterorder: "ascend",
      sorterclassfilename: "iconsort-ascend",
      sorterclasssize: "iconsort",
      sorterclassdate: "iconsort",
    };
  },

  computed: {
    checkDisplay: function () {
      return this.$store.state.UI.pagename == "/6pan" ? "flex" : "none";
    },
    panFilePath: function () {
      return this.$store.state.Pan.panFilePath;
    },
    panFileListCount: function () {
      return this.$store.state.Pan.panFileCount;
    },
    panFileList: function () {
      let arr = this.$store.state.Pan.panFileList;
      let sorterfield = this.sorterfield == "datestr" ? "dateint" : this.sorterfield == "sizestr" ? "sizeint" : "filename";
      let sorterorder = this.sorterorder;
      if (sorterfield == "filename") {
        if (sorterorder == "ascend") {
          return arr.sort(this.SortLikeWin1);
        } else {
          return arr.sort(this.SortLikeWin2);
        }
      } else {
        if (sorterorder == "ascend") {
          return arr.sort(function (a, b) {
            return a[sorterfield] - b[sorterfield];
          });
        } else {
          return arr.sort(function (a, b) {
            return b[sorterfield] - a[sorterfield];
          });
        }
      }
    },
    panFileLoading: function () {
      return this.$store.state.Pan.panFileLoading;
    },
    notice: function () {
      return this.$store.state.UI.noticeSelected;
    },

    panDirSelecteddirkey: function () {
      return this.$store.state.Pan.panDirSelected.dirkey;
    },

    showFile: function () {
      let dirkey = this.$store.state.Pan.panDirSelected.dirkey;
      return dirkey != "6pan-lixian" && dirkey != "6pan-huishouzhan";
    },
    showLiXian: function () {
      return this.$store.state.Pan.panDirSelected.dirkey == "6pan-lixian";
    },
    showHuiShouZhan: function () {
      return this.$store.state.Pan.panDirSelected.dirkey == "6pan-huishouzhan";
    },
  },
  watch: {
    panDirSelecteddirkey: function (newval, oldval) {
      if (newval == oldval) return;
      let oldfield = this.sorterfield;
      let oldorder = this.sorterorder;

      if (oldval == "6pan-lixian") {
        this.cachesortlixian[0] = oldfield;
        this.cachesortlixian[1] = oldorder;
      } else if (oldval == "6pan-huishouzhan") {
        this.cachesorthuishouzhan[0] = oldfield;
        this.cachesorthuishouzhan[1] = oldorder;
      } else if (oldval == "6pan-search") {
        this.cachesortsearch[0] = oldfield;
        this.cachesortsearch[1] = oldorder;
      } else {
        this.cachesortfile[0] = oldfield;
        this.cachesortfile[1] = oldorder;
      }

      let sorterfield = "";
      let sorterorder = "";
      if (newval == "6pan-lixian") {
        sorterfield = this.cachesortlixian[0];
        sorterorder = this.cachesortlixian[1];
      } else if (newval == "6pan-huishouzhan") {
        sorterfield = this.cachesorthuishouzhan[0];
        sorterorder = this.cachesorthuishouzhan[1];
      } else if (newval == "6pan-search") {
        sorterfield = this.cachesortsearch[0];
        sorterorder = this.cachesortsearch[1];
      } else {
        sorterfield = this.cachesortfile[0];
        sorterorder = this.cachesortfile[1];
      }
      this.handleSorter(sorterfield, sorterorder);
    },
  },

  methods: {
    SortLikeWin1(v1, v2) {
      var a = v1.filename;
      var b = v2.filename;
      var reg = /[0-9]+/g;
      var lista = a.match(reg);
      var listb = b.match(reg);
      if (!lista || !listb) {
        return a.localeCompare(b);
      }
      for (var i = 0, minLen = Math.min(lista.length, listb.length); i < minLen; i++) {
        var indexa = a.indexOf(lista[i]);
        var indexb = b.indexOf(listb[i]);
        var prefixa = a.substring(0, indexa);
        var prefixb = a.substring(0, indexb);
        var stra = lista[i];
        var strb = listb[i];
        var numa = parseInt(stra);
        var numb = parseInt(strb);
        if (indexa != indexb || prefixa != prefixb) {
          return a.localeCompare(b);
        } else {
          if (stra === strb) {
            if (i == minLen - 1) {
              return a.substring(indexa).localeCompare(b.substring(indexb));
            } else {
              a = a.substring(indexa + stra.length);
              b = b.substring(indexa + stra.length);
            }
          } else if (numa == numb) {
            return strb.lastIndexOf(numb + "") - stra.lastIndexOf(numa + "");
          } else {
            return numa - numb;
          }
        }
      }
    },
    SortLikeWin2(v1, v2) {
      var a = v2.filename;
      var b = v1.filename;
      var reg = /[0-9]+/g;
      var lista = a.match(reg);
      var listb = b.match(reg);
      if (!lista || !listb) {
        return a.localeCompare(b);
      }
      for (var i = 0, minLen = Math.min(lista.length, listb.length); i < minLen; i++) {
        var indexa = a.indexOf(lista[i]);
        var indexb = b.indexOf(listb[i]);
        var prefixa = a.substring(0, indexa);
        var prefixb = a.substring(0, indexb);
        var stra = lista[i];
        var strb = listb[i];
        var numa = parseInt(stra);
        var numb = parseInt(strb);
        if (indexa != indexb || prefixa != prefixb) {
          return a.localeCompare(b);
        } else {
          if (stra === strb) {
            if (i == minLen - 1) {
              return a.substring(indexa).localeCompare(b.substring(indexb));
            } else {
              a = a.substring(indexa + stra.length);
              b = b.substring(indexa + stra.length);
            }
          } else if (numa == numb) {
            return strb.lastIndexOf(numb + "") - stra.lastIndexOf(numa + "");
          } else {
            return numa - numb;
          }
        }
      }
    },

    handleClickRefresh() {
      this.$store.dispatch("Pan/aSelectDir", { dirkey: "refresh", dirpath: "refresh" });
    },
    handleClickFileItem(filekey) {
      this.selectedKey = filekey;
    },
    handleClickFilePath(key, path) {
      this.$store.dispatch("Pan/aSelectDir", { dirkey: key, dirpath: path });
    },
    handleClickFileName(item) {
      if (item.isfile) {
        if (item.isdir) {
          this.$store.dispatch("Pan/aSelectDir", { dirkey: item.key, dirpath: item.path });
        } else if (item.isimg) {
          this.ShowImage(item);
        } else if (item.isaudio || item.isvideo) {
          this.ShowVideo(item);
        } else if (item.istxt) {
          this.ShowTxt(item);
        }
      }
    },
    handleSorter(sorter, order) {
      if (order) {
        this.sorterorder = order;
      } else {
        this.sorterorder = this.sorterorder == "descend" ? "ascend" : "descend";
      }
      this.sorterfield = sorter;

      if (this.sorterfield == "filename") {
        this.sorterclassfilename = this.sorterorder == "descend" ? "iconsort-descend" : "iconsort-ascend";
        this.sorterclasssize = "iconsort";
        this.sorterclassdate = "iconsort";
      } else if (this.sorterfield == "sizestr") {
        this.sorterclassfilename = "iconsort";
        this.sorterclasssize = this.sorterorder == "descend" ? "iconsort-descend" : "iconsort-ascend";
        this.sorterclassdate = "iconsort";
      } else if (this.sorterfield == "datestr") {
        this.sorterclassfilename = "iconsort";
        this.sorterclasssize = "iconsort";
        this.sorterclassdate = this.sorterorder == "descend" ? "iconsort-descend" : "iconsort-ascend";
      }
    },
    handleClickUpload(e) {
      let key = e.key;
      if (this.$store.state.Pan.panDirSelected.dirkey == "6pan-search") {
        this.$message.error("请先切换到一个网盘文件夹，再点击上传");
        return;
      }
      this.uploadLoading = true;
      this.$store.dispatch("Pan/aUploadSelect", key).then((resp) => {
        this.uploadLoading = false;
        if (resp.code == 0) {
          this.$store.commit("UI/mShowModal", { name: "upload", data: { ...this.$store.state.Pan.panDirSelected, ...resp } });
        } else {
          this.$message.error(resp.message);
        }
      });
      return false;
    },
    handleClickSearch(value) {
      this.$store.dispatch("Pan/aSelectDir", { dirkey: "6pan-search", dirpath: value });
    },
    handleClickAddDir() {
      this.$store.commit("UI/mShowModal", { name: "adddir", data: {} });
    },

    handleClickLiXian() {
      if (this.$store.state.User.userSelected.key == "add") {
        this.$message.error("请先登录一个6盘账号");
        return;
      }
      this.$store.commit("UI/mShowModal", { name: "lixian", data: {} });
    },
    handleClickLiXianClear(cmd) {
      if (this.$store.state.User.userSelected.key == "add") {
        this.$message.error("请先登录一个6盘账号");
        return;
      }
      let hide = this.$message.loading("操作中，请耐心等待...", 0);
      this.$store.dispatch("Pan/aClearLiXian", cmd).then((resp) => {
        hide();
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          this.$store.dispatch("Pan/aSelectDir", { dirkey: "refresh", dirpath: "refresh" });
          if (cmd == "ok") {
            this.$message.success("删除所有已完成任务成功");
          }
          if (cmd == "err") {
            this.$message.success("删除所有已完成任务成功");
          }
        }
      });
    },
    handleClickClearHuiShouZhan() {
      if (this.$store.state.User.userSelected.key == "add") {
        this.$message.error("请先登录一个6盘账号");
        return;
      }
      let hide = this.$message.loading("操作中，请耐心等待...", 0);
      this.$store.dispatch("Pan/aClearTrash").then((resp) => {
        hide();
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          this.$store.dispatch("Pan/aSelectDir", { dirkey: "refresh", dirpath: "refresh" });
          if (resp.async) {
            this.$notification.open({
              message: "操作成功",
              description: "由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果",
              duration: 6,
            });
          } else {
            this.$message.success("清空回收站成功");
          }
        }
      });
    },
    ShowTxt: function (item) {
      if (item.isfile && item.istxt) {
        if (item.sizeint < 524288) {
          this.$store.commit("UI/mShowModal", { name: "showtxt", data: item });
        } else {
          this.$message.info("文本体积太大(>512KB)，暂不支持预览");
        }
      }
    },
    ShowImage: function (item) {
      if (item.isfile && item.isimg) {
        if (item.sizeint < 31457280) {
          this.$store.commit("UI/mShowModal", { name: "showimage", data: item });
        } else {
          this.$message.info("图片体积太大(>30MB)，暂不支持预览");
        }
      }
    },
    ShowAudio: function (item) {
      if (item.isaudio) {
        if (item.sizeint < 16106127360) {
          let hide = this.$message.loading("操作中，请耐心等待...", 0);
          this.$store.dispatch("Pan/aDownLink", item).then((resp) => {
            hide();
            if (resp.code != 0) {
              this.$message.error(resp.message);
            } else {
              this.$store.dispatch("Pan/aPotPlayer", resp.downlink).then((resp) => {
                if (resp.code != 0) {
                  this.$message.error(resp.message);
                }
              });
            }
          });
        } else {
          this.$message.info("音频体积太大(>15GB)，暂不支持预览");
        }
      }
    },
    ShowVideo: function (item) {
      if (item.isvideo) {
        let hide = this.$message.loading("操作中，请耐心等待...", 0);
        this.$store.dispatch("Pan/aDownLinkPreview", item).then((resp) => {
          hide();
          if (resp.code != 0) {
            this.$message.error(resp.message);
          } else {
            this.$store.dispatch("Pan/aPotPlayer", resp.downlink).then((resp) => {
              if (resp.code != 0) {
                this.$message.error(resp.message);
              }
            });
          }
        });
      }
    },
    DownFile: function (item) {
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
    RenameFile: function (item) {
      this.$store.commit("UI/mShowModal", { name: "rename", data: item });
    },
    DeleteFile: function (item) {
      let hide = () => {};
      if (!item.islixian) hide = this.$message.loading("操作中，请耐心等待...", 0);
      this.$store.dispatch("Pan/aDeleteFile", item).then((resp) => {
        hide();
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          this.$store.dispatch("Pan/aSelectDir", { dirkey: "refresh", dirpath: "refresh" });
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
            if (item.ishuishouzhan) {
              this.$message.success("操作成功，已彻底删除文件");
            }
            if (item.islixian) {
              this.$message.success("操作成功，已删除离线任务");
            }
          }
        }
      });
    },
    RecoverFile: function (item) {
      let hide = this.$message.loading("操作中，请耐心等待...", 0);
      this.$store.dispatch("Pan/aRecoverFile", item).then((resp) => {
        hide();
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          this.$store.dispatch("Pan/aSelectDir", { dirkey: "refresh", dirpath: "refresh" });
          let parentpath = item.path;
          if (parentpath.indexOf("/") >= 0) {
            parentpath = parentpath.substring(0, parentpath.lastIndexOf("/"));
            if (parentpath == "") parentpath = "/";
          } else {
            parentpath = "/";
          }
          this.$store.dispatch("Pan/aModalSelectDir", { dirkey: "", dirpath: parentpath });
          if (resp.async) {
            this.$notification.open({
              message: "操作成功",
              description: "由于文件较多，此操作正在异步处理中，请几分钟后再刷新页面查看结果",
              duration: 6,
            });
          } else {
            this.$message.success("操作成功，已恢复文件");
          }
        }
      });
    },

    DownLink: function (item) {
      if (item.isfile == false || item.isdir) return;
      this.$store.dispatch("Pan/aDownLink", item).then((resp) => {
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          copyToClipboard(resp.downlink);
          let wsTime = resp.downlink.substring(resp.downlink.indexOf("&wsTime=") + 8);
          wsTime = wsTime.substring(0, wsTime.indexOf("&"));
          var tsTime = Math.ceil((parseInt(wsTime, 16) - new Date().getTime() / 1000) / 60);
          if (tsTime < 60) {
            this.$message.success("操作成功，已经复制文件的下载链接到剪切板，" + tsTime + "分钟内有效");
          } else {
            tsTime = tsTime / 60;
            this.$message.success("操作成功，已经复制文件的下载链接到剪切板，" + tsTime.toFixed(1) + "小时内有效");
          }
          if (resp.isremote == true) {
            this.$message.info("远程模式下警告：6盘限制下载IP必须和创建链接的IP一致，可能导致此链接被403");
          }
        }
      });
    },
    LiXianLink: function (item) {
      copyToClipboard(item.textLink);
      this.$message.success("操作成功，已经复制离线链接到剪切板");
    },

    CopytoFile: function (item) {
      this.$store.commit("UI/mShowModal", { name: "copyto", data: item });
    },
  },
};
</script>

<style>
.rightHeadRow {
  flex-grow: 0;
  flex-shrink: 0;
  width: 100%;
  overflow: hidden;
  height: 40px;
  padding-left: 24px;
  margin: 0;
  display: flex;
  align-items: center;
}
.rightHeadRow input {
  height: 24px;
  line-height: 22px;
  padding: 0 8px;
  font-size: 14px;
  border: 1px solid rgba(207, 86, 89, 0.4);
}
.rightHeadRow .ant-input-search {
  margin-right: 12px;
}
.rightHeadRow .ant-input-suffix {
  right: 2px;
}
.rightHeadRow .ant-input-suffix > i {
  display: inline-block;
  padding: 5px 8px;
}
.rightHeadRow .ant-input-suffix > i > svg > path {
  color: #df5659;
  fill: #df5659;
}

.texttip {
  font-size: 14px;
  color: rgba(49, 70, 89, 0.6);
}
.texttip > a {
  margin-left: 4px;
}
.texttip > a:hover {
  text-decoration: underline;
}

.gonggao.texttip {
  top: 81px;
  left: 120px;
  right: 190px;
  height: 43px;
  padding: 11px 30px 11px 0;
  text-align: center;
  overflow: hidden;
  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: absolute;
  z-index: 1;
}

.filepath {
  flex-grow: 0;
  flex-shrink: 0;
  width: 90%;
  height: 40px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  padding-left: 8px !important;
}
.filepath .sep {
  flex-grow: 0;
  flex-shrink: 0;
  width: 10px;
  text-align: center;
  font-size: 12px;
  color: #bcb3b3;
}
.filepath .desc {
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: auto;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin: 0;
  font-size: 12px;
  color: rgba(49, 70, 89, 0.6);
  cursor: pointer;
}
.filepath .desc:hover {
  background-color: rgba(0, 132, 255, 0.1);
}
.filepath .desc:first-child {
  flex-grow: 0;
  flex-shrink: 0;
}
.filepath .desc:last-child {
  flex-grow: 0;
  flex-shrink: 0;
}
</style>
<style>
.filetable {
  width: 100%;
  flex-grow: 0;
  flex-shrink: 0;
  height: 45px;
  overflow: hidden;
  border-top: 1px solid #eef2f8 !important;
}

.filetable table tr th {
  padding: 0 0 0 12px;
  margin: 0;
  color: #202d40;
  height: 44px;
  background: #fff;

  border-bottom: 1px solid #eef2f8 !important;
  border-collapse: collapse !important;
}

.filetable .ant-table-thead > tr > th.ant-table-column-sort,
.filetable .ant-table-thead > tr > th.ant-table-column-has-actions.ant-table-column-has-sorters:hover {
  background: #fff !important;
  border-radius: 0;
}

.filetable .ant-table-column-sorters .iconfont {
  line-height: 32px;
  display: inline-block;
  margin-left: 6px;
  font-size: 30px;
  color: #928787;
}
.filetable .ant-table-column-sorters .iconsort-descend,
.filetable .ant-table-column-sorters .iconsort-ascend {
  color: #df5659 !important;
}

.filetable .ant-table-column-sorters .ant-table-column-title::before {
  display: none;
}
</style>
<style>
.fileitemlist {
  flex: 1 1 0%;
  width: 100%;
}

.fileitemlist .filename {
  width: 100%;
  height: 50px;
  display: flex !important;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: rgba(0, 0, 0, 0.7);
  flex-grow: 0;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 28px;
  border-bottom: 1px solid #eef2f8 !important;
}

.fileitemlist .filename.selected,
.fileitemlist .filename:hover {
  background-color: #f7f8fa !important;
}

.fileitemlist .filename .title {
  flex: 1 1 0%;
  overflow: hidden;
  cursor: default;
}
.fileitemlist .filename .title > div {
  width: fit-content;
  max-width: 100%;
  height: 28px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.fileitemlist .filename .title.canclick > div {
  cursor: pointer;
}

.fileitemlist .filename .size {
  padding: 0 8px 0 0;
  text-align: right;
  width: 90px;
}

.fileitemlist .filename .date {
  padding: 0 8px 0 0;
  text-align: right;
  width: 100px;
}

.fileitemlist .fileactions {
  padding: 0 12px;
  display: flex !important;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  right: 0;
  top: 11px;
  min-width: 250px;
  background-color: #f7f8fa;
  opacity: 0;
}
.fileitemlist .filename:hover .fileactions {
  opacity: 1;
}
.fileitemlist .filename .rightbtn {
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

.fileitemlist .filename .rightbtn > .iconfont::before {
  font-size: 22px;
  line-height: 28px;
  color: #2d8cf0;
}
.fileitemlist .filename .rightbtn > .iconfont {
  font-size: 14px;
  line-height: 28px;
  color: #2d8cf0;
  padding-left: 0;
  display: inline-flex;
  width: auto;
}

.fileitemlist .filename:hover .rightbtn:hover {
  background-color: rgba(0, 132, 255, 0.1);
  border-radius: 4px;
}
</style>
<style>
.fileitemlist .filename .iconfont {
  width: 44px;
  padding-left: 10px;
  font-size: 28px;
  line-height: 28px;
  color: #928787;
}
.iconcloud-download {
  color: #3482f0;
}
.iconcloud-sync {
}
.iconcloud-success {
  color: #8bc755;
}
.iconcloud-error {
  color: #ef3450;
}

.iconfile-video,
.iconfile-mkv,
.iconfile-avi,
.iconfile-flv,
.iconfile-mp4,
.iconfile-mov,
.iconfile-asf,
.iconfile-wmv,
.iconfile-ts,
.iconfile-rmvb,
.iconfile-swf {
  color: #3482f0;
}
.iconfile-audio,
.iconfile-flac,
.iconfile-ape,
.iconfile-wav,
.iconfile-cue,
.iconfile-ogg,
.iconfile-mp3 {
  color: #474de2;
}
.iconfile-image,
.iconfile-ai,
.iconfile-bmp,
.iconfile-eps,
.iconfile-gif,
.iconfile-png,
.iconfile-jpg,
.iconfile-psd,
.iconfile-svg,
.iconfile-tif {
  color: #ff8400;
}
.iconfile-bt,
.iconfile-txt,
.iconfile-ssa,
.iconfile-ass,
.iconfile-srt,
.iconfile-stl,
.iconfile-scc,
.iconfile-doc,
.iconfile-html,
.iconfile-pdf,
.iconfile-ppt,
.iconfile-xsl,
.iconfile-wps {
  color: #8bc755;
}
.iconfile-7z,
.iconfile-rar,
.iconfile-zip,
.iconfile-tar {
  color: #8d51db;
}

.iconfile-img2,
.iconfile-xci,
.iconfile-nsp,
.iconfile-bin,
.iconfile-dmg,
.iconfile-vmdk,
.iconfile-iso,
.iconfile-gho,
.iconfile-mds,
.iconfile-vhd,
.iconfile-god {
  color: #713cbe;
}
.iconfile-exe {
  color: #da3c09;
}
.iconfile-folder {
  color: rgb(244, 210, 110);
}
</style>
