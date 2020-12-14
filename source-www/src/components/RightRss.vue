<template>
  <div class="right" style="flex-direction: row" :style="{ display: checkDisplay }" oncontextmenu="return false;">
    <div id="leftcontent">
      <div class="rightHeadRow reelisttopbd" style="padding-left: 50px">
        <a-input-search v-model:value="searchkey" placeholder="搜索RSS资源" style="width: 200px" @search="handleRssSearch" />
      </div>
      <a-spin :spinning="RssItemLoading"> </a-spin>
      <div v-if="RssItemLoading == false && RssItemList.length === 0" class="scrollviewhead">
        <div class="iconfont">
          <span class="iconempty"></span>
        </div>
        <div class="emptytip">空的</div>
      </div>

      <VxeList id="rssitemlist" class="rssitemlist" :data="RssItemList" :datats="0" :rowHeight="60" :scrollYMinCount="50" oncontextmenu="return false;">
        <template #default="{ items }">
          <div v-for="item in items" :key="item.key" :class="{ rssitemrow: true, active: item.key == RssItemSelected.key }" @click="handleClickRssItem(item.key)">
            <div class="rssitemtitle">
              {{ item.name }}
            </div>
            <ul class="ant-list-item-action">
              <li class="rssitemdays">
                <span class="iconfont iconcalendar"></span>
                <span>{{ item.days }}</span>
              </li>
              <li v-if="item.LinkBT > 0"><span class="rss-bt"> bt </span><em class="ant-list-item-action-split"></em></li>
              <li v-if="item.LinkED > 0"><span class="rss-ed2k"> ed2k </span><em class="ant-list-item-action-split"></em></li>
              <li v-if="item.LinkBD > 0"><span class="rss-baidu"> baidu </span><em class="ant-list-item-action-split"></em></li>
            </ul>
          </div>
        </template>
      </VxeList>
    </div>
    <div id="leftcontentafter"></div>
    <div id="rightcontent">
      <div class="page">
        <h1>{{ RssItemSelected.name }}</h1>
        <div v-if="RssItemSelected.url" class="pageinfo">来源 {{ RssItemSelected.url }}</div>
        <div class="pagecontent" v-html="RssItemContentSelected.contenthtml"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed, ref } from 'vue'
  import { StoreUI } from '@/store/ui'
  import { StoreRss } from '@/store/rss'
  import VxeListComponent from '@/components/vxe-list'
  export default defineComponent({
    name: 'RightRss',
    components: { VxeList: VxeListComponent },
    setup() {
      const checkDisplay = computed(() => (StoreUI.PageName === '/rss' ? 'flex' : 'none'))

      const RssItemList = computed(() => StoreRss.RssItemList)
      const RssItemLoading = computed(() => StoreRss.RssItemLoading)
      const RssItemSelected = computed(() => StoreRss.RssItemSelected)
      const RssItemContentLoading = computed(() => StoreRss.RssItemContentLoading)
      const RssItemContentSelected = computed(() => StoreRss.RssItemContentSelected)

      const searchkey = ref('')

      function handleClickRssItem(itemkey: string) {
        StoreRss.aSelectRssItem(itemkey)
        const div = document.getElementById('rightcontent')
        if (div) div.scrollTop = 0
      }

      function handleRssSearch() {
        StoreRss.aSearchRss(searchkey.value)
        const div = document.getElementById('rightcontent')
        if (div) div.scrollTop = 0
      }

      return {
        checkDisplay,
        searchkey,
        RssItemList,
        RssItemLoading,
        RssItemSelected,
        RssItemContentLoading,
        RssItemContentSelected,
        handleClickRssItem,
        handleRssSearch,
      }
    },
  })
</script>

<style>
  #leftcontent {
    flex-grow: 0;
    flex-shrink: 0;
    position: relative;
    outline: none;
    width: 280px;
    height: 100%;
    /*background: #f9f8f8;*/
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  #leftcontentafter {
    display: block;
    width: 1px;
    border-right: 1px solid #e5e8ed;
    overflow: visible;
    margin-top: -8px;
    margin-bottom: -8px;
  }
  #rightcontent {
    height: 100%;

    flex: 1 1 0%;
    position: relative;
    background: transparent;
    overflow: scroll;
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
  .reelisttopbd {
    border-bottom: 1px solid #e5e8ed;
    box-shadow: 0 2px 4px 0 rgba(3, 27, 78, 0.06);
  }
  .rssitemlist {
    font-size: 16px;
  }

  .rssitemlist {
    flex: 1 1 0%;
    width: 100%;
    scroll-behavior: smooth;
    transition: all 0.5s ease-in;
    position: relative;
  }
  .rssitemlist.vxe-list .vxe-list--virtual-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
    transition: all 0.5s ease-in;
    scroll-behavior: smooth;
  }

  .rssitemlist .rssitemrow {
    padding: 6px 8px 0 18px;
    height: 60px;
    border-bottom: 1px solid rgba(38, 22, 22, 0.1) !important;
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
  .rssitemlist .ant-list-item-action li span.rss-bt {
    padding: 0 !important;
    color: #8bc755;
  }
  .rssitemlist .ant-list-item-action li span.rss-ed2k {
    padding: 0 !important;
    color: #8d51db;
  }
  .rssitemlist .ant-list-item-action li span.rss-baidu {
    padding: 0 !important;
    color: #3482f0;
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
    line-height: 30px;
    height: 30px;
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
  .page {
    margin: 40px;
    min-width: 380px;
    min-height: calc(100% - 80px);
    font-family: -apple-system-font, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB, Microsoft YaHei UI, Microsoft YaHei, Arial, sans-serif;
    word-break: break-all;
    word-wrap: break-word;
  }
  .page > h1,
  .page .pagecontent h1 {
    text-align: center;
    color: #3f3f3f;
    line-height: 1.75;
    font-size: 17px;
    font-weight: bold;
    display: table;
    margin: 2em auto 1em;
    padding: 0 1em;
    border-bottom: 2px solid rgba(250, 81, 81, 1);
    margin-top: 0;
  }

  .page .pagecontent h2 {
    text-align: center;
    color: #fff;
    line-height: 1.75;
    font-size: 16.5px;
    font-weight: bold;
    display: table;
    margin: 4em auto 2em;
    padding: 0 0.2em;
    background: rgba(250, 81, 81, 1);
  }
  .page .pagecontent h3 {
    text-align: left;
    color: #3f3f3f;
    line-height: 1.2;
    font-size: 15px;
    font-weight: bold;
    margin: 2em 8px 0.75em 0;
    padding-left: 8px;
    border-left: 3px solid rgba(250, 81, 81, 1);
  }
  .page .pagecontent h4 {
    text-align: left;
    color: rgba(250, 81, 81, 1);
    line-height: 1.75;
    font-size: 15px;
    font-weight: bold;
    margin: 2em 8px 0.5em;
  }
  .page .pagecontent p {
    text-align: left;
    color: #3f3f3f;
    line-height: 1.75;
    font-size: 15px;
    margin: 1.5em 8px;
    letter-spacing: 0.1em;
  }
  .page .pagecontent img {
    text-align: left;
    line-height: 1.75;
    font-size: 15px;
    border-radius: 4px;
    display: block;
    margin: 0.1em auto 0.5em;
    width: 100% !important;
  }

  .page .pagecontent blockquote {
    text-align: left;
    color: rgba(0, 0, 0, 0.54);
    line-height: 1.75;
    font-size: 15px;
    font-style: normal;
    border-left: none;
    padding: 1em;
    border-radius: 4px;
    background: #f2f7fb;
    margin: 2em 8px;
  }
  .page .pagecontent strong {
    text-align: left;
    color: rgba(250, 81, 81, 1);
    line-height: 1.75;
    font-size: 15px;
    font-weight: bold;
  }

  .page .pagecontent a {
    color: #0088f5 !important;
    text-align: left;
    color: #576b95;
    line-height: 1.75;
    font-size: 15px;
    text-decoration: none;
  }
  .page .pagecontent code {
    text-align: left;
    color: #d14;
    line-height: 1.75;
    font-size: 90%;
    white-space: pre;
    background: rgba(27, 31, 35, 0.05);
    padding: 3px 5px;
    border-radius: 4px;
  }

  .page .pagecontent ol {
    display: block;
    list-style-type: decimal;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    padding-inline-start: 40px;

    padding-left: 2em;
    margin-top: 0;
    margin-bottom: 16px;

    font-size: 15px;
    line-height: 1.5;
    word-wrap: break-word;
  }
  .page .pagecontent ol > li {
    display: list-item;
    text-align: -webkit-match-parent;
  }

  .page .pagecontent pre {
    display: block;
    white-space: pre;
    margin: 1em 8px;

    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 6px;
    word-wrap: normal;
    margin-top: 0;
    margin-bottom: 16px;
  }

  .page .pagecontent pre > code {
    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
    display: inline;
    padding: 0;
    margin: 0;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
    background-color: initial;
    border: 0;
    font-size: 100%;
    word-break: normal;
    white-space: pre;
    background: transparent;
    border-radius: 6px;
    color: #6f42c1;
  }

  .page .pagecontent .label {
    display: inline-block;
    background: rgba(33, 179, 81, 0.1);
    border-radius: 3px;
    color: #21b351;
    font-size: 14px;
    line-height: 20px;
    padding: 0 8px;
  }

  .page .pagecontent .tag {
    display: inline-block;
    padding: 3px 12px;
    background: #ecedee;
    border-radius: 12px;
    color: #888;
    font-size: 13px;
    line-height: 18px;
    margin-right: 8px;
    margin-bottom: 8px;
  }

  .page .pageinfo {
    color: #888;
    font-size: 13px;
    line-height: 16px;
    display: block;
    background: #f6f6f6;
    border-radius: 5px;
    padding: 8px 12px 8px 8px;
  }

  .pagecontent {
    width: 100%;
  }
</style>
