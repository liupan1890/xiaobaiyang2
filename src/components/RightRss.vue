<template>
  <div class="right" style="flex-direction: row;" :style="{ display: checkDisplay }">
    <div id="leftcontent" v-bind:style="{ width: leftcontentWidth + 'px' }">
      <div class="rightHeadRow">
        <a-button icon="search"> 搜索 </a-button>
      </div>
      <div class="MenuRow" style="height:40px;">
        <div class="Title">{{ rssSelected.rssname }}</div>
        <div class="desc" style="line-height: 24px;">
          {{ rssSelected.newscount }}
        </div>
      </div>
      <div class="MenuRow" style="height: 8px;min-height:8px;"></div>
      <a-spin :spinning="rssNewsLoading"> </a-spin>
      <RecycleScroller class="rssitemlist" :items="rssNewsList" :item-size="80" key-field="key">
        <template v-if="rssNewsLoading == false && rssNewsList.length == 0" #before>
          <div class="scrollviewhead">
            <div class="iconfont">
              <span class="iconempty"></span>
            </div>
            <div class="emptytip">空的</div>
          </div>
        </template>
        <template v-slot="{ item }">
          <div :class="{ rssitemrow: true, active: item.key == newsSelectedKey }">
            <div :class="{ rssitemtitle: true, read: item.read }" @click="handleClickRssNewsItem(item.key)">
              {{ item.title }}
            </div>
            <ul class="ant-list-item-action">
              <li class="rssitemdays" @click="handleClickRssNewsItem(item.key)">
                <a-icon type="calendar" /><span>{{ item.days }}</span>
              </li>
              <li v-if="item.file">
                <span title="被人成功离线过的文件即可秒传到你网盘里"> {{ item.miaochuan ? "秒传" : "离线" }} </span><em class="ant-list-item-action-split"></em>
              </li>
            </ul>
          </div>
        </template>
      </RecycleScroller>
    </div>
    <div id="midresize" role="presentation" class="Resizer vertical">
      <div class="movebutton">
        <svg class="icon" viewBox="0 0 1600 1024">
          <path d="M1076.132152 0l-127.370167 125.96654 412.810347 382.218473-397.082525 392.475749 119.506257 123.267257 516.624771-510.704344z m0 0M0 513.277661l516.606776 510.650358 119.506256-123.321243-397.064529-392.493744 412.810347-382.146492-127.370167-125.96654zM524.488683 0" />
        </svg>
      </div>
    </div>
    <div id="rightcontent">
      <div v-if="checkPage" class="page">
        <div class="rightHeadRow"></div>
        <div class="pagetitle">文章标题{{ rssNewsSelected.newsname }}</div>
        <div class="pagedesc">
          更新时间{{ rssNewsSelected.newsdate }}<br />
          原始链接{{ rssNewsSelected.newsurl }}<br />
        </div>
        <div class="pagelink">
          <ul>
            <li v-for="item of rssNewsSelected.newslinks" :key="item.key">
              {{ item.title }}
            </li>
          </ul>
        </div>
        <div class="pagecontent" v-html="rssNewsSelected.newscontent"></div>
      </div>

      <div v-if="checkEdit" class="edit">
        <mavon-editor v-model="editValue" fontSize="15px" placeholder="支持MarkDown语法" :shortCut="false" :ishljs="false" :subfield="false" :toolbars="toolbars" :externalLink="false" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RightRss",
  data: function() {
    return {
      leftcontentWidth: 360,
      newsSelectedKey: "",
      editValue: "",
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        strikethrough: true, // 中划线
        mark: true, // 标记
        quote: true, // 引用
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: true, // 图片链接
        fullscreen: true, // 全屏编辑

        subfield: true, // 单双栏模式
        preview: true, // 预览
      },
    };
  },
  components: {},
  computed: {
    checkDisplay: function() {
      return this.$store.state.UI.pagename == "/rss" ? "flex" : "none";
    },
    rssNewsList: function() {
      return this.$store.state.Rss.rssNewsList;
    },
    rssNewsLoading: function() {
      return this.$store.state.Rss.rssNewsLoading;
    },
    rssSelected: function() {
      return this.$store.state.Rss.rssSelected;
    },
    rssNewsSelected: function() {
      return this.$store.state.Rss.rssNewsSelected;
    },
    checkEdit: function() {
      return false;
      //return this.$store.state.Rss.rssNewsSelected.key == "edit";
    },
    checkPage: function() {
      return false;
      //return this.$store.state.Rss.rssNewsSelected.key != "" && this.$store.state.Rss.rssNewsSelected.key != "edit";
    },
  },
  methods: {
    handleClickRssNewsItem: function(newskey) {
      this.newsSelectedKey = newskey;
      this.$store.dispatch("Rss/aSelectNews", newskey); 
      var div = document.getElementById("rightcontent");
      if (div) div.scrollTop = 0;
    },
    handleResizerDrag: function() {
      let data = this;
      let resize = document.getElementById("midresize");
      resize.onmousedown = function(e) {
        let startX = e.clientX;
        resize.left = resize.offsetLeft;
        document.onmousemove = function(e) {
          let endX = e.clientX;
          let moveLen = endX - startX;
          startX = endX;
          let width = data.leftcontentWidth + moveLen;
          if (width < 300) width = 300;
          if (width > 480) width = 480;
          data.leftcontentWidth = width;
        };
        document.onmouseup = function() {
          document.onmousemove = null;
          document.onmouseup = null;
          if (data.leftcontentWidth > 350 && data.leftcontentWidth < 370) {
            data.leftcontentWidth = 360;
          }
          localStorage.setItem("leftcontentWidth", data.leftcontentWidth);
        };
        return false;
      };
    },
  },
  mounted() {
    let width = parseInt(localStorage.getItem("leftcontentWidth"));
    if (width) {
      if (width > 350 && width < 370) width = 360;
      this.leftcontentWidth = width;
    }
    this.handleResizerDrag();
  },
};
</script>

<style>
.Resizer {
  position: relative;
  background: rgba(38, 22, 22, 0.1);
  /*box-shadow: 0 0 10px rgba(0, 0, 0, 0.1), 0 0 4px rgba(0, 0, 0, 0.06);*/
  z-index: 101;
}

.Resizer:hover,
.Resizer:active,
.Resizer:focus {
  transition: all 0.3s ease;
  background: rgba(207, 86, 88, 0.4);
}

.Resizer.horizontal {
  padding-top: 1px;
  cursor: e-resize;
  width: 100%;
}

.Resizer.vertical {
  padding-left: 1px;
  cursor: e-resize;
  height: 100%;
}

.Resizer .movebutton {
  top: -10px;
  left: -13px;
  width: 28px;
  height: 28px;
  display: block;
  position: absolute;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.1), 0 0 4px rgba(0, 0, 0, 0.06);
}
.Resizer .movebutton .icon {
  width: 16px;
  height: 28px;
  margin: 0 auto;
  display: block;
}
.Resizer .movebutton .icon path {
  color: #df5659;
  fill: #df5659;
}

#leftcontent {
  flex-grow: 0; 
  flex-shrink: 0; 
  position: relative;
  outline: none;
  width: 300px;
  height: 100vh;
  /*background: #f9f8f8;*/
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
#rightcontent {
  height: 100vh;
  min-width: 600px;
  flex: 1 1 0%; 
  position: relative;
  background: #fff;
  overflow: auto;
}

.rightHeadRow .ant-btn {
  height: 24px;
  line-height: 22px;
  padding: 0 8px;
  border: none;
  color: #df5659;
  font-size: 14px;
  cursor: pointer;
  background-color: rgba(207, 86, 89, 0.1);
  margin-right: 12px;
}

.rightHeadRow .ant-btn svg > path {
  color: #df5659;
  fill: #df5659;
}

.rightHeadRow .ant-btn.borderbtn {
  background-color: transparent;
  border: 1px solid rgba(207, 86, 89, 0.4);
}

.rightHeadRow .ant-btn:hover,
.rightHeadRow .ant-btn:active,
.rightHeadRow .ant-btn:focus,
.rightHeadRow .ant-btn:visited {
  color: #df5659;
  background-color: rgba(207, 86, 89, 0.2);
}
</style>

<style>
.rssitemlist {
  font-size: 16px;
  width: 100%;
  flex: 1 1 0%;
  overflow-x: hidden;
  overflow-y: auto;
}

.rssitemlist .rssitemrow {
  padding: 8px 8px 0 18px;
  height: 80px;
  border-top: 1px solid rgba(38, 22, 22, 0.1) !important;
}
.rssitemlist .hover > .rssitemrow,
.rssitemlist .rssitemrow.active {
  background-color: #f7f8fa;
}

.rssitemlist .ant-list-item-action {
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.rssitemlist .ant-list-item-action li {
  cursor: default !important;
  padding: 0 8px !important;
}
.rssitemlist .ant-list-item-action li span {
  cursor: pointer !important;
  padding: 0 8px !important;
}
.rssitemlist .ant-list-item-action span,
.rssitemlist .ant-list-item-action i {
  color: #df5659;
}
.rssitemlist .ant-list-item-action li.rssitemdays {
  flex: 1 1 0%;
  text-align: left !important;
  cursor: default !important;
  padding: 0 !important;
}
.rssitemlist .ant-list-item-action li.rssitemdays span {
  font-size: 12px;
  line-height: 21px;
  cursor: default !important;
  padding: 0 2px !important;
}
.rssitemtitle {
  width: 100%;
  font-size: 14px;
  line-height: 36px;
  height: 36px;
  color: #251e1e;

  text-overflow: ellipsis !important;
  overflow: hidden;
  word-break: keep-all !important;
  white-space: nowrap;
  cursor: pointer !important;
  margin: 0;
}
.rssitemtitle.read {
  color: #8590a6;
}
</style>

<style>
.edit .op-image.popup-dropdown > div.dropdown-item:last-child {
  display: none !important;
}

.v-note-wrapper {
  z-index: 100 !important;
}

.page {
  padding: 0 64px 64px 64px;
}
.pagetitle {
  width: 100%;
  text-align: center;
  line-height: 48px;
  font-size: 28px;
  font-weight: bold;
  color: #202d40;
  -webkit-transition: color 0.3s ease-out;
  transition: color 0.3s ease-out;
}
.pagecontent {
  width: 100%;
}
</style>
