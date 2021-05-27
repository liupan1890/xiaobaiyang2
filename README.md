# 6盘小白羊 第二版


### 我的新项目阿里云盘离线版
[阿里云盘离线版](https://github.com/liupan1890/aliyunpan) 已经上传了第一个开发版本欢迎测试

### 3月12日上线了CD包音乐网镜像  
[点我打开！ 点我打开！ 点我打开！](http://121.5.144.84/https/www.cdbao.net)  

开饭中，最新2.2.0版全部开源代码已上传  

[下载地址 4月10日 v2.2.3  https://wws.lanzous.com/b01npsg8h](https://wws.lanzous.com/b01npsg8h)  

[下载地址 2月23日 v2.2.2 https://wws.lanzous.com/b01nqc4gd](https://wws.lanzous.com/b01nqc4gd)  旧版链接备用

win、linux、mac 均已发布，再接下来要整RSS订阅功能，这是个大项目了。。。。  

#### 2021/04/10
```
1. Fix 回收站文件列表错误
2. Fix /share/web/格式百度分享链接支持

4. Fix 异步操作信息由6秒减少为显示4秒
5. Fix 文件列表按文件排序时部分文件排序错乱的BUG
6. Add 手机登录增加新加坡,立陶宛区号
7. Add 离线任务显示状态码
8. Fix 离线任务超过1998条时返回的离线任务顺序错乱的BUG
9. Fix 上传文件时获取UploadToken失败时一处崩溃BUG
10. Fix 上传文件时UploadBatch头被golang自动转换为小写的BUG
```
### 功能介绍

6盘官方网页版功能已基本覆盖。下面是小白羊第二版特色功能<br />

``` diff
+ [√] 多账号同时登录管理
+ [√] 目录树快捷导航(右键菜单:下载文件夹，复制移动，删除到回收站)
+ [√] 在线预览（预览图片，预览文本，预览PDF，Doc等），在线播放多种格式的视频
+ [√] 文件、文件夹批量重命名，批量删除，批量移动，批量下载
+ [√] 支持批量创建离线任务，支持批量选择BT种子文件离线
+ [√] 一键下载整个文件夹，支持下载队列，多个文件同时下载
+ [√] 一键上传整个文件夹，支持上传队列，多文件同时上传，支持秒传
+ [√] 文件下载支持断点续传，可以下载超大文件，支持出错自动重试
+ [√] 文件下载完支持自动执行脚本文件回调（参照aria2）
+ [√] 支持通过在浏览器输入IP，远程管理操作
- [ ] RSS订阅功能开发中：~~订阅资源秒传~~
```

### 安装说明

##### 1. Windows  
下载 `6盘小白羊版win64.7z` 解压缩，双击运行 `6盘小白羊版.exe` 即可<br />
已内置mpv播放器可以直接在线预览视频<br />
windows10可能会遇到Defender报毒，需要将小白羊的文件夹添加到排除里，参阅：<br />
 https://blog.csdn.net/qq_43453731/article/details/104722165
##### 2. Mac os  
下载 `6盘小白羊版mac64.7z` 解压缩，双击运行 `6盘小白羊版.app` 即可<br />
已内置mpv播放器可以直接在线预览视频
##### 3. Linux  
下载 `6盘小白羊版linux64.7z` 解压缩，修改 `6盘小白羊版` 这个文件的权限为可执行，然后双击运行即可<br />
linux需要自己安装一次mpv播放器，才可以视频在线预览<br />
打开终端，输入命令  <code>sudo apt-get install mpv -y</code>  安装mpv
<br /><br />
注1：mac如果提示启动被阻止，需要在‘系统偏好设置’--‘安全性与隐私’--‘允许从以下位置下载的App’--‘仍要打开’<br />
注2：mac有时会遇到由于程序未签名导致的白屏（6panserver这个文件没正常运行），此问题我还在研究怎么解决<br />

![https://ae03.alicdn.com/kf/Hcf945f61f47741ec847814d8ec05b9d56.jpg](https://img13.360buyimg.com/ddimg/jfs/t1/163140/31/2338/2632698/5ffe922eE612b56ad/c524b567c570f021.gif)
<br /><br />
[运行截图 点击查看 https://ae03.alicdn.com/kf/Hcf945f61f47741ec847814d8ec05b9d56.jpg](https://img13.360buyimg.com/ddimg/jfs/t1/163140/31/2338/2632698/5ffe922eE612b56ad/c524b567c570f021.gif)
<br />

### 版本升级说明

小白羊无需安装，解压后即可使用，升级新版本时，使用新版文件替换旧版文件即可。目录说明：<br />
```
/6盘小白羊版.exe                        启动程序  
/electron/resources/6panserver.exe     6盘服务程序   
/electron/resources/AppData/www.db     html资源  
/electron/resources/AppData/user.db    *用户数据，第一次启动后创建  
/electron/resources/AppData/debug.log  *运行日志，第一次启动后创建  
...其他文件
```
重点只有这/electron/resources/AppData/user.db文件，里面是用户自己的数据。版本升级时要保留，不要删除  


### 版权声明

6盘小白羊版仅是完全免费的个人学习作品，和6盘官方无任何关联。所有功能均基于调用6盘官方开放API，再此感谢6盘的无私<br /><br />
1.6盘(6pan.cn)是一个网盘，其付费用户(10元每月)每天可以离线下载100个任务（电驴、磁力、BT、百度）<br />
2.小白羊版只是美化UI，你离线是保存到6盘下载文件是从6盘下，所有服务、内容均由6盘提供请正确认知<br />
3.小白羊版和6盘官方无任何关联，由我个人开发，不能代表6盘官方，但会长期维护<br />

<img height="200px" alt="liupan1890's Top Langs" src="https://github-readme-stats.vercel.app/api/top-langs/?username=liupan1890&hide_border=true" /> <img height="200px" alt="liupan1890's Github Stats" src="https://github-readme-stats.vercel.app/api?username=liupan1890&show_icons=true&hide_border=true" />
