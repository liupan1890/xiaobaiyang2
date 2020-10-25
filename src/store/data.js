function DefaultUser() {
    return {
        key: "add",
        username: "添加一个6盘账号",
        phone: "",
        isvip: false,
        vipdate: "",
        panused: "",
        panlixian: "",
    };
}

function DefaultDirList() {
    return [{
            key: "6pan-lixian",
            path: "6pan-lixian",
            dirname: "离线任务",
            licon: "cloud",
            isLeaf: true,
            scopedSlots: { title: "custom" },
        },
        {
            key: "6pan-huishouzhan",
            path: "6pan-huishouzhan",
            dirname: "回收站",
            licon: "rest",
            isLeaf: true,
            scopedSlots: { title: "custom" },
        },
        {
            key: "6pan-root",
            path: "/",
            dirname: "根目录",
            licon: "home",
            scopedSlots: { title: "custom" },
            children: [],
        },
    ];
}

function DefaultRssList() {
    return [{
        rssname: "小白羊使用说明",
        key: "rss-xiaobaiyang",
        licon: "robot",
        newscount: "99+",
        scopedSlots: { title: "custom" },
        children: [{
                rssname: "操作教程",
                key: "rss-xiaobaiyang/help",
                licon: "video-camera",
                newscount: "9",
                scopedSlots: { title: "custom" },
            },
            {
                rssname: "用户反馈区",
                key: "rss-xiaobaiyang/message",
                licon: "wechat",
                newscount: "10+",
                scopedSlots: { title: "custom" },
            },
        ]
    }];
}

function DefaultFileItem(dirkey, sixitem) {

    let m = {
        filename: sixitem.name,
        title: sixitem.name,
        sizestr: FormatSize(sixitem.size),
        sizeint: sixitem.size,
    };

    if (dirkey == "6pan-lixian") {
        m.key = sixitem.taskIdentity;
        m.path = sixitem.savePath;
        m.title = sixitem.savePath;
        m.textLink = sixitem.textLink;
        m.datestr = FormatDate(new Date(sixitem.createTime), "YYYY-MM-DD");
        m.dateint = sixitem.createTime;
        m.isdir = sixitem.fileMime == "text/directory";
        m.islixian = true;
        m.status = sixitem.status;
        m.filename = "[" + sixitem.progress + "%]" + sixitem.name;


        let status = "";
        if (sixitem.status < 0) {
            status = "下载失败 ";
            m.fileicon = "iconcloud-error"; //-1 下载失败
        } else if (sixitem.status == 0) {
            status = "添加失败 ";
            m.fileicon = "iconcloud-error"; //添加失败
        } else if (sixitem.status == 100) {
            status = "排队中 ";
            m.fileicon = "iconcloud-sync"; //排队中
        } else if (sixitem.status == 309) {
            status = "等待重试 ";
            m.fileicon = "iconcloud-sync"; //重试
        } else if (sixitem.status == 310) {
            status = "错误 ";
            m.fileicon = "iconcloud-error"; //重试
        } else if (sixitem.status == 306 || sixitem.status == 307) {
            status = "失败 ";
            m.fileicon = "iconcloud-error"; //重试2
        } else if (sixitem.status == 400) {
            status = "地址失效 ";
            m.fileicon = "iconcloud-error"; //重试
        } else if (sixitem.status == 406 || sixitem.status == 407) {
            status = "自动重试 ";
            m.fileicon = "iconcloud-sync"; //重试2
        } else if (sixitem.status > 300 && sixitem.status < 400) {
            status = "下载失败 ";
            m.fileicon = "iconcloud-error"; //自己加的额外判断
        } else if (sixitem.status == 1000) {
            status = "success";
            m.fileicon = "iconcloud-success"; //下载完成
        } else {
            status = "";
            m.fileicon = "iconcloud-download"; //下载中
        }

        if (status != "success") {
            m.filename = "[" + status + sixitem.progress + "%]  " + sixitem.name;
        } else {
            m.filename = sixitem.name;
        }
        m.canclick = false;

    } else if (dirkey == "6pan-huishouzhan") {
        m.key = sixitem.identity;
        m.path = sixitem.path;
        m.title = sixitem.path;
        m.datestr = FormatDate(new Date(sixitem.createTime), "YYYY-MM-DD");
        m.dateint = sixitem.createTime;
        m.isdir = sixitem.directory;
        m.fileicon = "iconrest";
        m.ishuishouzhan = true;
        m.canclick = false;
    } else {
        m.key = sixitem.identity;
        m.path = sixitem.path;
        m.datestr = FormatDate(new Date(sixitem.ctime), "YYYY-MM-DD");
        m.dateint = sixitem.ctime;
        m.isdir = sixitem.directory;
        m.isfile = true;

        let ext = (sixitem.name.indexOf('.') >= 0 ? sixitem.name.substring(sixitem.name.lastIndexOf('.')).toLowerCase() : sixitem.ext.toLowerCase());

        if (m.isdir) {
            m.fileicon = "iconfile-folder";
        } else if (ext == ".exe") m.fileicon = "iconfile-exe";
        else if (ext == ".torrent") m.fileicon = "iconfile-bt";
        else if (sixitem.mime.startsWith("application/x-rar")) m.fileicon = "iconfile-rar";
        else if (sixitem.mime == "application/zip") m.fileicon = "iconfile-zip";
        else if (";.c.cpp.java.htm.html.css.js.vue.php.aspx.shtml.asp.jsp.json.url".indexOf(ext) > 0) m.fileicon = "iconfile-html";
        else if (ext == ".txt" || ext == ".md" || ext == ".markdown" || ext == ".xml") m.fileicon = "iconfile-txt";
        else if (";.md5.ini.nfo.info.config.cfg.bat.sh.cmd.log.debug.go".indexOf(ext) > 0) m.fileicon = "iconfile-txt";

        else if (ext == ".pdf") m.fileicon = "iconfile-pdf";
        else if (";.ppt.pptx.pot.potx.pps.dps.dpt".indexOf(ext) > 0) m.fileicon = "iconfile-ppt";
        else if (";.xls.xlt.xlsx.xltx.et.ett".indexOf(ext) > 0) m.fileicon = "iconfile-xsl";
        else if (";.doc.docx.dot.dotx.wps.wpt.rtf".indexOf(ext) > 0) m.fileicon = "iconfile-doc";
        else if (IsZiMu(ext) != "") {
            m.fileicon = IsZiMu(ext);
        } else if (IsZip(ext) != "") {
            m.fileicon = IsZip(ext);
        } else if (IsDisk(ext) != "") {
            m.fileicon = IsDisk(ext);
        } else if (IsVideo(ext, sixitem.mime) != "") {
            m.fileicon = IsVideo(ext, sixitem.mime);
            m.isvideo = true;
        } else if (IsAudio(ext, sixitem.mime) != "") {
            m.fileicon = IsAudio(ext, sixitem.mime);
            m.isaudio = true;
        } else if (IsImage(ext, sixitem.mime) != "") {
            m.fileicon = IsImage(ext, sixitem.mime);
            m.isimg = true;
        } else m.fileicon = "iconfile-file";

        m.istxt = m.fileicon == "iconfile-txt" || m.fileicon == "iconfile-html";

        m.canclick = m.isdir || m.isimg || m.isaudio || m.isvideo || m.istxt;
    }
    return Object.freeze(m);
}

function IsZiMu(ext) {
    let fileicon = "";
    if (ext == ".ssa") fileicon = "iconfile-ssa";
    else if (ext == ".ass") fileicon = "iconfile-ass";
    else if (ext == ".srt") fileicon = "iconfile-srt";
    else if (ext == ".stl") fileicon = "iconfile-stl";
    else if (ext == ".scc") fileicon = "iconfile-scc";
    return fileicon;
}

function IsZip(ext) {
    let fileicon = "";
    if (ext == ".7z" || ext == ".7zip" || ext == ".7-zip") fileicon = "iconfile-7z";
    else if (ext == ".zip") fileicon = "iconfile-zip";
    else if (ext == ".rar" || ext.startsWith(".part")) fileicon = "iconfile-rar";
    else if (ext == ".tar") fileicon = "iconfile-tar";
    else if (ext.startsWith(".z0") || ext.startsWith(".z1") || ext.startsWith(".z2") || ext.startsWith(".z3") || ext.startsWith(".z4") || ext.startsWith(".z5") || ext.startsWith(".z6") || ext.startsWith(".z7") || ext.startsWith(".z8") || ext.startsWith(".z9")) fileicon = "iconfile-zip";
    else if (";.bz2.bzip2.cab.lzma.gz.gzip.tgz.taz.xar.arj.lzh.ace.uue.bz2.jar".indexOf(ext) > 0 || ext.startsWith(".0") || ext.startsWith(".1") || ext.startsWith(".2") || ext.startsWith(".3")) fileicon = "iconfile-zip";
    return fileicon;
}

function IsDisk(ext) {
    let fileicon = "";
    if (ext == ".vmdk") fileicon = "iconfile-vmdk";
    else if (ext == ".img") fileicon = "iconfile-img2";
    else if (ext == ".nsp") fileicon = "iconfile-nsp";
    else if (ext == ".xci") fileicon = "iconfile-xci";
    else if (ext == ".bin") fileicon = "iconfile-bin";
    else if (ext == ".dmg") fileicon = "iconfile-dmg";
    else if (ext == ".vhd") fileicon = "iconfile-vhd";
    else if (ext == ".mds") fileicon = "iconfile-mds";
    else if (ext == ".iso") fileicon = "iconfile-iso";
    else if (ext == ".gho") fileicon = "iconfile-gho";
    else if (ext == ".god") fileicon = "iconfile-god";
    return fileicon;
}

function IsImage(ext, mime) {
    let fileicon = "";
    if (ext == ".bmp") fileicon = "iconfile-bmp";
    else if (ext == ".jpg" || ext == ".jpeg" || ext == ".jp2" || ext == ".jpeg2000") fileicon = "iconfile-jpg";
    else if (ext == ".png") fileicon = "iconfile-png";
    else if (ext == ".gif") fileicon = "iconfile-gif";
    else if (ext == ".svg") fileicon = "iconfile-svg";
    else if (ext == ".psd") fileicon = "iconfile-psd";
    else if (ext == ".ai") fileicon = "iconfile-ai";
    else if (ext == ".tif" || ext == ".tiff") fileicon = "iconfile-tif";
    else if (ext == ".eps") fileicon = "iconfile-eps";
    else if (ext == ".psd") fileicon = "iconfile-psd";
    else if (";.webp.pcx.tga.exif.fpx.cdr.pcd.dxf.ufo.raw.ico.hdri.wmf".indexOf(ext) > 0) fileicon = "iconfile-image";
    else if (mime.startsWith("image")) fileicon = "iconfile-image";
    return fileicon;
}

function IsVideo(ext, mime) {
    let fileicon = "";
    if (ext == ".avi" || ext == ".avi1") fileicon = "iconfile-avi";
    else if (ext == ".flv" || ext == ".flv1" || ext == ".f4v") fileicon = "iconfile-flv";
    else if (ext == ".mkv" || ext == ".mkv1") fileicon = "iconfile-mkv";
    else if (ext == ".mp4" || ext == ".mp41" || ext == ".m4v") fileicon = "iconfile-mp4";
    else if (ext == ".mov") fileicon = "iconfile-mov";
    else if (ext == ".swf") fileicon = "iconfile-swf";
    else if (ext == ".asf") fileicon = "iconfile-asf";
    else if (ext == ".wmv" || ext == ".wmv1") fileicon = "iconfile-wmv";
    else if (ext == ".ts" || ext == ".ts1" || ext == ".m2ts" || ext == ".mts") fileicon = "iconfile-ts";
    else if (ext == ".rmvb" || ext == ".rm") fileicon = "iconfile-rmvb";
    else if (";.m2t.m2v.mp2v.mpe.mpeg.mpg.mpv2.3g2.3gp.3gp2.3gpp.amr.amv.divx.dpg.dvr-ms.evo.ifo.k3g.m1v.m4b.m4p.mxf.nsr.nsv.ogm.ogv.qt.ram.rpm.skm.tp.tpr.trp.vob.webm.wm.wmo.wtv".indexOf(ext) > 0) fileicon = "iconfile-video";
    else if (mime.startsWith("video")) fileicon = "iconfile-video";

    return fileicon;
}

function IsAudio(ext, mime) {
    let fileicon = "";
    if (ext == ".mp3") fileicon = "iconfile-mp3";
    else if (ext == ".flac") fileicon = "iconfile-flac";
    else if (ext == ".wav") fileicon = "iconfile-wav";
    else if (ext == ".cue") fileicon = "iconfile-cue";
    else if (ext == ".ogg") fileicon = "iconfile-ogg";
    else if (ext == ".ape") fileicon = "iconfile-ape";
    else if (";.aac.ac3.aiff.cda.dsf.dts.dtshd.eac3.m1a.m2a.m4a.mka.mod.mp2.mpa.mpc.ogg.opus.ra.tak.tta.wma.wv".indexOf(ext) > 0) fileicon = "iconfile-audio";
    else if (mime.startsWith("audio")) fileicon = "iconfile-audio";
    return fileicon;
}


function DefaultDownItem(downkey, downitem) {


    let m = {
        key: downitem.DownID,
        filename: downitem.name,
        path: downitem.path,
        sizestr: FormatSize(downitem.size),
        progress: downitem.DownProcess,
        speedstr: downitem.DownSpeedStr,
        active: downitem.IsStop == false && downitem.IsFailed == false,
        savepath: downitem.DownSavePath,
    };



    if (downkey == "downing") {
        m.fileicon = "icondownload";
        m.error = downitem.FailedMessage;
    } else if (downkey == "downed") {
        m.progress = 100;
        m.speedstr = "";
        m.active = false;
        m.fileicon = "icondesktop";
    } else if (downkey == "uploading") {
        m.fileicon = "iconupload";
        m.error = downitem.FailedMessage;
    } else if (downkey == "upload") {
        m.progress = 100;
        m.speedstr = "";
        m.active = false;
        m.fileicon = "iconcloud-success";
    }
    return Object.freeze(m);
}

function DefaultLastSavePath() {
    try {
        if (localStorage) {
            var p = localStorage["panLastSavePath"]
            if (p && p != "") {
                var o = JSON.parse(p);
                if (o && o.dirkey && o.dirpath && o.dirname) return o;
            }
        }
    } catch {
        return { dirkey: "6pan-root", dirpath: "/", dirname: "根目录" };
    }
    return { dirkey: "6pan-root", dirpath: "/", dirname: "根目录" };
}

function dedupe(array) {
    return [...new Set(array)]
}


function FormatSize(size) {
    var string;
    if (size >= 1024 * 1024 * 1024 * 1024 / 10 * 9) {
        size = size / (1024 * 1024 * 1024 * 1024 / 10);
        string = "TB";
    } else if (size >= 1024 * 1024 * 1024 / 10 * 9) {
        size = size / (1024 * 1024 * 1024 / 10);
        string = "GB";
    } else if (size >= 1024 * 1024 / 10 * 9) {
        size = size / (1024 * 1024 / 10);
        string = "MB";
    } else if (size >= 1024 / 10 * 9) {
        size = size / (1024 / 10);
        string = "KB";
    } else {
        size = size * 10;
        string = "b";
    }
    if (size > 30) return (Math.round(size) / 10).toFixed(0) + string;
    return (Math.round(size) / 10) + string;
}

function FormatDate(date, format) {
    if (arguments.length < 2 && !date.getTime) {
        format = date;
        date = new Date();
    }
    var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', '日', '一', '二', '三', '四', '五', '六'];
    return format.replace(/YYYY|YY|MM|M|DD|D|hh|mm|ss|www|week/g, function(a) {
        switch (a) {
            case "YYYY":
                return date.getFullYear();
            case "YY":
                return (date.getFullYear() + "").slice(2);
            case "MM":
                return (date.getMonth() + 1 + "").length < 2 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
            case "M":
                return date.getMonth() + 1;
            case "DD":
                return (date.getDate() + "").length < 2 ? "0" + date.getDate() : date.getDate();
            case "D":
                return date.getDate();
            case "hh":
                return (date.getHours() + "").length < 2 ? "0" + date.getHours() : date.getHours();
            case "mm":
                return (date.getMinutes() + "").length < 2 ? "0" + date.getMinutes() : date.getMinutes();
            case "ss":
                return (date.getSeconds() + "").length < 2 ? "0" + date.getSeconds() : date.getSeconds();
            case "星期":
                return "星期" + week[date.getDay() + 7];
            case "week":
                return week[date.getDay()];
            case "www":
                return week[date.getDay()].slice(0, 3);
        }
    });
}

export { DefaultLastSavePath, DefaultUser, DefaultDirList, DefaultRssList, DefaultFileItem, DefaultDownItem, dedupe, FormatSize, FormatDate }