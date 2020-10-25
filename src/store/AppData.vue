<script>
export default {
  TestAjax: function(callback) {
    setTimeout(function() {
      callback({ code: 0, message: "success" });
    }, 3000);
  },

  TestRssList: function(username) {
    if (username != "8") return [];

    return [
      {
        rssname: "B站" + username,
        key: "rss-20",
        licon: "cluster",
        newscount: "99+",
        scopedSlots: { title: "custom" },
        children: [
          {
            rssname: "进击的金厂长" + username,
            key: "rss-20/20-1-0-0",
            licon: "",
            newscount: "99+",
            scopedSlots: { title: "custom" },
          },
          {
            rssname: "让桥本环奈大火的舞蹈视频" + username,
            key: "rss-20/20-1-0-1",
            licon: "",
            newscount: "99+",
            scopedSlots: { title: "custom" },
          },
        ],
      },
    ];
  },
  TestNewsList: function(username) {
    let list = [];

    if (username != "8") return [];

    let n = Math.round(Math.random() * 15) + 5;

    for (let i = 0; i < n; i++) {
      list.push({
        key: "news-0-0-0-" + i,
        href: "https://www.antdv.com/",
        title: `ant design vue part` + username + " - " + i,
        days: "19",
        read: i % 2 == 1,
        miaochuan: i % 2 == 1,
        file: i % 3 == 1,
      });
    }
    return list;
  },

  TestNewsItem: function(newskey) {
    return {
      newsname: "文章标题" + newskey,
      key: "news-xxx",
      newsurl: "https://www.dy2018.com/i/102437.html",
      newsdate: "2020-09-09 12:00:00",
      newslinks: [
        {
          key: "link-xxx",
          title: "[电影天堂www.dytt89.com]词典BD韩语中字.mp4",
          link: "magnet:?xt=urn:btih:9e4c8feddf5356acdbfed4934ff51dca2f1349ef&dn=[电影天堂www.dytt89.com]词典BD韩语中字.mp4&tr=http://t.t789.me:2710/announce&tr=http://t.t789.co:2710/announce&tr=http://t.t789.vip:2710/announce",
        },
      ],
      newscontent: '<img alt="" src="https://www.dy2018.com/d/file/html/gndy/dyzz/2020-09-25/8631de1ba1d1a3e75b8a7be1370a10f9.jpg" style="width: 518px; height: 740px;" /><br />&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;◎译　　名　义笔容辞(港)/机密行动：我们的辞典(台)/辞典/Mal-Mo-E: The&nbsp;Secret Mission<br />◎片　　名　&#47568;&#47784;&#51060;<br />◎年　　代　2019<br />◎产　　地　韩国<br />◎类　　别　剧情/历史<br />◎语　　言　韩语<br />◎字　　幕　中文字幕<br />◎上映日期　2019-01-09(韩国)<br />◎豆瓣评分　7.7/10 from 5068 users<br />◎IMDb评分　6.2/10 from 224 users<br />◎文件格式　x264 + ACC<br />◎视频尺寸　1280 x 720<br />◎文件大小　1650 MB<br />◎片　　长　136 Mins<br />◎导　　演　严宥娜<br />◎主　　演　柳海真<br />　　　　　　尹启相<br />　　　　　　金弘波<br />　　　　　　禹贤<br />　　　　　　金太勋<br />　　　　　　艺秀晶<br />　　　　　　赵贤哲<br />◎简　　介<br />　　日本殖民统治时期为了编制朝鲜语词典走遍全国，秘密搜集朝鲜语的两个男人的故事。<br />◎影片截图<br /><img alt="" src="https://www.dy2018.com/d/file/html/gndy/dyzz/2020-09-25/23027769caab94ae3e442e7cb00ab5d1.jpg" style="width: 926px; height: 850px;" />',
    };
  },
};
</script>
