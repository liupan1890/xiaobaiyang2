<template>
  <div class="right" :style="{ display: checkDisplay }">
    <div class="rightHeadRow">
      <a-button v-if="checkDoing" :loading="loading" icon="download" @click="handleDownStartAll"> 全部开始 </a-button>
      <a-button v-if="checkDoing" :loading="loading" icon="pause" @click="handleDownStopAll"> 全部暂停 </a-button>
      <a-button icon="delete" :loading="loading" @click="handleDownDeleteAll"> 全部删除 </a-button>
    </div>
    <a-table :loading="downFileLoading" :columns="columns" :pagination="false" class="filetable"> </a-table>

    <RecycleScroller class="downitemlist" :items="downFileList" :item-size="60" key-field="key">
      <template v-if="downFileLoading == false && downFileList.length == 0" #before>
        <div class="scrollviewhead">
          <div class="iconfont">
            <span class="iconempty"></span>
          </div>
          <div class="emptytip">空的</div>
        </div>
      </template>

      <template v-slot="{ item }">
        <div :class="{ filename: true, selected: item.key == selectedKey, active: item.active }" @click="handleClickFileItem(item.key)">
          <div class="iconfont">
            <span :class="item.fileicon"></span>
          </div>
          <div class="title" :title="item.path">
            {{ item.filename }}
          </div>
          <div class="error">{{ item.error }}</div>
          <div class="dian">-</div>
          <div class="size">{{ item.sizestr }}</div>
          <div class="space"></div>
          <div v-if="checkDoing" class="progress">
            <a-progress :percent="item.progress" size="small" :strokeWidth="3" />
          </div>
          <div v-if="checkDoing" class="speed">{{ item.speedstr }}</div>
          <div v-if="loading == false" class="fileactions">
            <div v-if="checkDoing && item.active == false" class="rightbtn" v-on:click="handleDownStart(item)" title="开始下载">
              <span class="iconfont iconstart"></span>
            </div>
            <div v-if="checkDoing && item.active" class="rightbtn" v-on:click="handleDownStop(item)" title="暂停">
              <span class="iconfont iconpause"></span>
            </div>
            <div v-if="checkDowned" class="rightbtn" v-on:click="handleOpenDir(item)" title="打开文件夹">
              <span class="iconfont iconfolder"></span>
            </div>
            <div class="rightbtn" v-on:click.stop="handleDownDelete(item)" title="删除记录">
              <span class="iconfont icondelete"></span>
            </div>
          </div>
        </div>
      </template>

      <template #after>
        <div v-if="checkDoing && downFileCount > 499" class="scrollviewfoot">
          当前仅显示了前499条，<span class="dcount">{{ downFileCount - 499 }}</span
          >条记录稍后展示
        </div>
        <div v-if="checkDowned" class="scrollviewfoot">
          仅显示最近7天的下载记录，更早的已被自动删除
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<script>
const columns = [
  {
    title: "文件名",
    dataIndex: "filename",
    ellipsis: true,
  },
  {
    title: "操作",
    dataIndex: "key",
    width: "220px",
  },
];

export default {
  name: "RightDown",
  data: function() {
    return {
      columns,
      selectedKey: "",
      loading: false,
    };
  },
  components: {},
  computed: {
    checkDisplay: function() {
      return this.$store.state.UI.pagename == "/down" ? "flex" : "none";
    },
    downFileLoading: function() {
      return this.$store.state.Down.downFileLoading;
    },
    downFileList: function() {
      return this.$store.state.Down.downFileList;
    },
    downFileCount: function() {
      return this.$store.state.Down.downFileCount;
    },
    downSelected: function() {
      return this.$store.state.Down.downSelected;
    },
    checkDoing: function() {
      return this.$store.state.Down.downSelected == "downing" || this.$store.state.Down.downSelected == "uploading";
    },
    checkDowned: function() {
      return this.$store.state.Down.downSelected == "downed";
    },
  },
  methods: {
    handleClickFileItem(filekey) {
      this.selectedKey = filekey;
    },
    handleDownStartAll() {
      this.loading = true;
      this.$store.dispatch("Down/aDownStartAll", this.downSelected).then((resp) => {
        this.loading = false;
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          this.$store.dispatch("Down/aRefreshDown", "refresh"); 
        }
      });
    },
    handleDownStopAll() {
      this.loading = true;
      this.$store.dispatch("Down/aDownStopAll", this.downSelected).then((resp) => {
        this.loading = false;
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          this.$store.dispatch("Down/aRefreshDown", "refresh"); 
        }
      });
    },
    handleDownDeleteAll() {
      this.loading = true;
      this.$store.dispatch("Down/aDownDeleteAll", this.downSelected).then((resp) => {
        this.loading = false;
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          this.$store.dispatch("Down/aRefreshDown", "refresh"); 
        }
      });
    },
    handleDownStart(item) {
      this.loading = true;
      this.$store.dispatch("Down/aDownStart", { downkey: this.downSelected, DownID: item.key }).then((resp) => {
        this.loading = false;
        if (resp.code != 0) {
          this.$message.error(resp.message);
        }
      });
    },
    handleDownStop(item) {
      this.loading = true;
      this.$store.dispatch("Down/aDownStop", { downkey: this.downSelected, DownID: item.key }).then((resp) => {
        this.loading = false;
        if (resp.code != 0) {
          this.$message.error(resp.message);
        }
      });
    },
    handleDownDelete(item) {
      this.loading = true;
      this.$store.dispatch("Down/aDownDelete", { downkey: this.downSelected, DownID: item.key }).then((resp) => {
        this.loading = false;
        if (resp.code != 0) {
          this.$message.error(resp.message);
        } else {
          this.$store.dispatch("Down/aRefreshDown", "refresh"); 
        }
      });
    },
    handleOpenDir(item) {
      this.$store.dispatch("Down/aOpenDir", { savepath: item.savepath }).then((resp) => {
        if (resp.code != 0) {
          this.$message.error(resp.message);
        }
      });
    },
  },
};
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
}
.downitemlist .scrollviewfoot {
  font-size: 14px;
  color: rgba(49, 70, 89, 0.6);
  text-align: center;
  line-height: 60px;
}
.downitemlist .scrollviewfoot .dcount {
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
  font-size: 16px;
  line-height: 28px;
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
  line-height: 28px;
}
.downitemlist .filename .error {
  position: absolute;
  left: 48px;
  bottom: 4px;
  font-size: 12px;
  line-height: 14px;
  height: 14px;
  color: #ef3450;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 5;
}

.downitemlist .filename .dian {
  font-size: 16px;
  font-weight: normal;
  flex-grow: 0; 
  flex-shrink: 0; 
  padding: 0 14px;
  line-height: 28px;
}
.downitemlist .filename .size {
  font-size: 14px;
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
  padding: 0 16px 0 0;
  text-align: right;
  flex-grow: 0; 
  flex-shrink: 0; 
  width: 100px;
  overflow: hidden;
  line-height: 28px;
}

.downitemlist .filename .progress {
  width: 100px;
  margin: 0 20px;
  flex-grow: 0; 
  flex-shrink: 0; 
  line-height: 24px;
  padding-bottom: 4px;
}

.downitemlist .fileactions {
  padding: 0 12px;
  display: flex !important;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  right: 100px;
  top: 16px;
  min-width: 140px;
  background-color: #f7f8fa;
  opacity: 0;
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
  width: 44px;
  padding-left: 10px;
  font-size: 28px;
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
