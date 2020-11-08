<template>
  <a-modal key="ShowImageModal" id="ShowImageModal" :visible="checkShowModal" :width="dialogWidth" :dialogStyle="dialogStyle" title="" :footer="null" @cancel="handleCancel" class="appmodal">
    <a-button class="fullscreen" type="link" icon="fullscreen" @click="handleFullScreen">
      全屏
    </a-button>
    <a-button class="refresh" type="link" icon="sync" @click="handleRefresh">
      刷新
    </a-button>
    <a-button class="title" type="link">
      {{ imagepage + imagetitle }}
    </a-button>

    <div class="goleft" @click="handleGoLeft"><a-icon type="left-circle" /></div>
    <div class="goright" @click="handleGoRight"><a-icon type="right-circle" /></div>
    <div class="imgmodal">
      <a-spin :spinning="modalLoading" tip="图片加载中...  图片体积>5MB时加载非常慢" />
      <img id="shigmodal" :src="imagesrc" referrerpolicy="no-referrer" rel="no-referrer" />
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "ShowImageModal",
  data: function() {
    return {
      modalLoading: false,
      modalError: "",
      imageitem: {},
      imagelist: [],
      imagesrc: "",
      imagetitle: "",
      imageindex: 0,
      imagepage: "",
      dialogStyle: {},
      dialogWidth: "520px",
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "showimage";
    },
    modaldata: function() {
      return this.$store.state.UI.modaldata;
    },
  },
  watch: {
        modaldata: function() {
      if (this.$store.state.UI.modalname == "showimage") {
        if (!this.$store.state.UI.modaldata.key) this.$store.commit("UI/mShowModal", { name: "", data: {} });
        if (this.imageitem.key != this.$store.state.UI.modaldata.key) {
          this.imageitem = this.$store.state.UI.modaldata;
          this.imagetitle = this.imageitem.filename + "   " + this.imageitem.sizestr;
          this.imagelist = this.$store.state.Pan.panFileList.filter((it) => it.isimg && it.sizeint < 31457280).sort(this.SortLikeWin1);
          this.FindIndex();
          this.imagesrc = "";
          this.handleLoadImage();
        }
      } else {
        this.modalError = "";
        this.modalLoading = false;
      }
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
            }             else {
              a = a.substring(indexa + stra.length);
              b = b.substring(indexa + stra.length);
            }
          }           else if (numa == numb) {
                        return strb.lastIndexOf(numb + "") - stra.lastIndexOf(numa + "");
          } else {
                        return numa - numb;
          }
        }
      }
    },
    handleFullScreen: function() {
      if (this.dialogWidth != "95%") {
        this.dialogWidth = "95%";
        this.dialogStyle = { top: "20px" };
      } else {
        this.dialogWidth = "520px";
        this.dialogStyle = {};
      }
    },
    handleRefresh: function() {
      this.handleLoadImage();
    },
        FindIndex: function() {
      let LEN = this.imagelist.length;
      let key = this.imageitem.key;
      this.imageindex = -1;
      for (let i = 0; i < LEN; i++) {
        let item = this.imagelist[i];
        if (item.key == key) {
          this.imageindex = i;
          break;
        }
      }
      if (this.imageindex >= 0) {
        this.imagepage = "[ " + (this.imageindex + 1) + "/" + LEN + " ]";
      } else {
        this.imagepage = "";       }
    },
    handleGoLeft: function() {
      let index = this.imageindex;
      if (index <= 0) {
        this.$message.info("已经是第一张图片");
        return;
      }
      this.$store.commit("UI/mShowModal", { name: "showimage", data: this.imagelist[index - 1] });
    },
    handleGoRight: function() {
      let LEN = this.imagelist.length;
      let index = this.imageindex;
      if (index < 0) index = 0;
      if (index >= LEN - 1) {
        this.$message.info("已经是最后一张图片");
        return;
      }
      this.$store.commit("UI/mShowModal", { name: "showimage", data: this.imagelist[index + 1] });
    },
        handleLoadImage: function() {
      this.modalLoading = true;
      this.$store.dispatch("Pan/aDownLink", this.imageitem).then((resp) => {
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          this.imagesrc = resp.downlink;
        }
        let ftest = () => {
          if (document.getElementById("shigmodal").complete) {
            this.modalLoading = false;
          } else {
            setTimeout(ftest, 500);
          }
        };
        setTimeout(ftest, 500);
      });
    },
        handleCancel: function() {
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
</script>

<style>
#ShowImageModal .imgmodal {
  width: 100%;
  min-height: 360px;
  padding-top: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
#ShowImageModal .imgmodal img {
  width: 100%;
  margin: auto;
  object-fit: contain;
}
#ShowImageModal .fullscreen {
  position: absolute;
  top: 12px;
  left: 6px;
}
#ShowImageModal .refresh {
  position: absolute;
  top: 12px;
  left: 80px;
}
#ShowImageModal .title {
  position: absolute;
  top: 12px;
  left: 160px;
  overflow: hidden;
  max-width: 60%;
  text-overflow: ellipsis;
}
#ShowImageModal .fulls {
  width: 100%;
  top: 0;
}
#ShowImageModal .ant-modal-body {
  position: relative;
}
#ShowImageModal .goleft {
  left: 1px;
}
#ShowImageModal .goright {
  right: 1px;
}

#ShowImageModal .goleft,
#ShowImageModal .goright {
  width: 35px;
  height: 35px;
  font-size: 35px;
  line-height: 35px;
  color: #df5659;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 35px;
  opacity: 0.8;

  position: absolute;
  top: 50%;
  display: block;
  padding: 0;
  border: 0;
  cursor: pointer;
  z-index: 9;
}
</style>
