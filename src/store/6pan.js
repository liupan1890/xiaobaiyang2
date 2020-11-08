import { DefaultDirList, DefaultFileItem, GetDir, GetAllParentDir, GetAllParentDirPath } from './data.js'
import { message } from 'ant-design-vue';
import { CALLAPI, FromBase64 } from '../api/callapi.js'
import { Object } from 'core-js';
const module6Pan = {
    namespaced: true,
    state: () => ({
        panDirSelected: { dirkey: "", dirpath: "" },
        panDirList: [],
        panFilePath: [],
        panFileLoading: false,
        panFileList: [],
        panFileCount: 0,
        panDownUrlCache: { cachetime: new Date().getTime() },
        panLastSavePath: { dirkey: "6pan-root", dirpath: "/", dirname: "根目录" },
        panRefreshTime: 0,
        panLastSearchValue: "",
    }),
    mutations: {
        mLoadDir(state) {
            state.panDirList = DefaultDirList();
            state.panDirSelected = { dirkey: "", dirpath: "" };
            state.panFilePath = [];
            state.panFileList = [];
            state.panFileCount = 0;
        },
        mSelectDir(state, { dirkey, dirpath }) {

            if (dirkey == "6pan-lixian") {
                state.panFilePath = [{ key: dirkey, path: dirkey, dirname: "离线任务", sep: false }];
                state.panFileList = [];
                state.panFileCount = 0;
                state.panDirSelected = { dirkey, dirpath };
            } else if (dirkey == "6pan-huishouzhan") {
                state.panFilePath = [{ key: dirkey, path: dirkey, dirname: "回收站", sep: false }];
                state.panFileList = [];
                state.panFileCount = 0;
                state.panDirSelected = { dirkey, dirpath };
            } else if (dirkey == "6pan-search") {
                state.panFilePath = [{ key: dirkey, path: dirkey, dirname: "搜索[ " + dirpath + " ]", sep: false }];
                state.panFileList = [];
                state.panFileCount = 0;
                state.panDirSelected = { dirkey, dirpath };
                state.panLastSearchValue = dirpath
            } else if (dirkey == "6pan-root") {
                state.panFilePath = [{ key: dirkey, path: "/", dirname: "根目录", sep: false }];
                state.panFileList = [];
                state.panFileCount = 0;
                state.panDirSelected = { dirkey, dirpath };
            } else {
                let path = GetAllParentDir(state.panDirList, dirpath)
                if (path.length > 1) {
                    state.panFilePath = Object.freeze(path);
                    state.panFileList = [];
                    state.panFileCount = 0;
                    state.panDirSelected = { dirkey, dirpath };
                }
            }
        },
        mLoadingFile(state, loading) {
            state.panFileLoading = loading;
        },
        mLoadPanFileList(state, { dirkey, respFileList }) {
            if (dirkey != state.panDirSelected.dirkey) return
            let filelist = [];
            let LEN = respFileList.length;
            for (let i = 0; i < LEN; i++) {
                let item = respFileList[i];
                filelist.push(DefaultFileItem(dirkey, item));
            }
            state.panFileList = filelist;
            state.panFileCount = filelist.length;
        },

        mLoadPanDirList(state, { scrolltree, dirkey, dirpath, respFileList }) {
            if (scrolltree && dirkey != state.panDirSelected.dirkey) return

            if (dirkey == "6pan-lixian" || dirkey == "6pan-huishouzhan" || dirkey == "6pan-search") return;

            let child = [];
            let LEN = respFileList.length;
            for (let i = 0; i < LEN; i++) {
                let item = respFileList[i];
                if (item.directory) {
                    let m = {
                        key: item.identity,
                        path: item.path,
                        dirname: item.name,
                        isdir: true,
                        isfile: true,
                        licon: "iconfolder",
                        scopedSlots: { title: "custom" },
                        children: [],
                    };
                    if (m.dirname.length > 50) m.dirname = m.dirname.substr(0, 47) + "...";
                    child.push(m);
                }
            }

            let f = GetDir(state.panDirList, dirpath);
            if (!f) return;
            let needdel = f.children.length != child.length;
            if (f.children.length > 0 && needdel == false) {
                let LEN = child.length;
                let a1, a2;
                for (let i = 0; i < LEN; i++) {
                    a1 = f.children[i];
                    a2 = child[i];
                    if (a1.key != a2.key || a1.dirname != a2.dirname) {
                        needdel = true;
                        break;
                    }
                }
            }
            if (needdel) {
                if (f.children.length > 0) f.children.splice(0, f.children.length);
                let LEN = child.length;
                for (let i = 0; i < LEN; i++) {
                    f.children.splice(f.children.length, 0, child[i]);
                }
            }
            if (scrolltree) {
                setTimeout((fid) => {
                    let tree = document.getElementById("dirtreeparent");
                    let row = document.getElementById(fid);
                    if (tree && row) {
                        if (tree.scrollTop > (row.offsetTop - 32)) tree.scrollTop = row.offsetTop - 114 - 32;
                        if ((tree.scrollTop + tree.offsetHeight) < row.offsetTop) tree.scrollTop = row.offsetTop - tree.offsetHeight + 84;

                    }
                }, 800, f.key);
            }
        },

        mLastSavePath(state, { dirkey, dirpath, dirname }) {
            state.panLastSavePath = { dirkey, dirpath, dirname };
        },
    },
    actions: {
        aLoadDir(context) {
            context.commit('mLoadDir');
            context.commit("mLastSavePath", { dirkey: "6pan-root", dirpath: "/", dirname: "根目录" });
            context.dispatch("aSelectDir", { dirkey: "6pan-root", dirpath: "/" });
        },
        async aSelectDir(context, { dirkey, dirpath }) {
            if (dirkey == context.state.panDirSelected.dirkey && dirkey != "6pan-search") return;
            let userkey = context.rootState.User.userSelected.key;
            if (userkey == "add") {
                message.error("请先登录一个6盘账号");
                return
            }

            let scrolltree = true;
            let scrollfile = true;
            let refresh = dirkey == "refresh";

            if (dirkey == "6pan-search") {
                scrolltree = false;
                if (refresh) return;
                if (dirpath == "") {
                    dirpath = context.state.panLastSearchValue;
                }
            } else if (dirkey == "parent") {
                scrolltree = false;
                scrollfile = false;
                if (context.state.panDirSelected.dirkey == "6pan-search") {
                    dirkey = "6pan-search";
                    dirpath = context.state.panLastSearchValue;
                } else {
                    if (dirpath.lastIndexOf("/") >= 0) dirpath = dirpath.substring(0, dirpath.lastIndexOf("/"))
                    let f = GetDir(context.state.panDirList, dirpath);
                    if (!f) return;
                    dirkey = f.key;
                    dirpath = f.path;
                }
            } else if (dirkey == "refresh") {
                scrolltree = false;
                scrollfile = false;
                dirkey = context.state.panDirSelected.dirkey;
                dirpath = context.state.panDirSelected.dirpath;
            }

            if (scrollfile) {
                let d = document.getElementById('fileitemlist');
                if (d) d.scrollTop = 0;
            }

            context.commit('mLoadingFile', true);
            if (dirkey != "6pan-search") {
                let parentpathlist = GetAllParentDirPath(dirpath);
                let parentpathdir = GetAllParentDir(context.state.panDirList, dirpath);
                let plen = parentpathlist.length - 1;
                let dlen = parentpathdir.length;
                let ppath = "/";
                for (let p = 0; p < plen; p++) {
                    if (ppath.endsWith('/') == false) ppath = ppath + "/";
                    ppath = ppath + parentpathlist[p];
                    if (dlen > p && parentpathdir[p].path == ppath && parentpathdir[p].hasChild == true) continue;
                    await CALLAPI({ cmd: "FileList", userkey, dirkey: "", dirpath: ppath, refresh: false }).then(resp => {
                        if (resp.code == 0 && resp.filelist) {
                            context.commit('mLoadPanDirList', { dirtree: false, dirkey: resp.key, dirpath: resp.path, respFileList: resp.filelist });
                        }
                    });
                }
            }
            CALLAPI({ cmd: "FileList", userkey, dirkey, dirpath, refresh }).then(resp => {
                context.commit('mLoadingFile', false);
                let respFileList = [];
                if (resp.code == 0) {
                    respFileList = resp.filelist;
                    context.commit('mSelectDir', { dirkey: resp.key, dirpath: resp.path });

                    context.commit('mLoadPanFileList', { dirkey: resp.key, respFileList });
                    context.commit('mLoadPanDirList', { scrolltree: scrolltree, dirkey: resp.key, dirpath: resp.path, respFileList });
                } else {
                    message.error(resp.message)
                }
            });
        },
        aRefresh(context, { dirkey, dirpath }) {
            let userkey = context.rootState.User.userSelected.key;
            CALLAPI({ cmd: "FileRefresh", userkey, dirkey, dirpath });
        },
        aModalSelectDir(context, { dirkey, dirpath }) {
            let userkey = context.rootState.User.userSelected.key;

            CALLAPI({ cmd: "FileList", userkey, dirkey, dirpath, refresh: false }).then(resp => {
                let respFileList = [];
                if (resp.code == 0 && resp.filelist) respFileList = resp.filelist;
                context.commit('mLoadPanDirList', { dirtree: false, dirkey, dirpath, respFileList });
            });
        },
        aDownFile(context, { key }) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "DownFile", userkey, identity: key });

        },
        aRename(context, { key, newname }) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "FileRename", userkey, identity: key, newname });
        },
        aAddDir(context, { dirkey, dirname }) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "FileAddDir", userkey, identity: dirkey, dirname });
        },
        aClearTrash(context) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "TrashClear", userkey });
        },
        aClearLiXian(context, cmd) {
            let userkey = context.rootState.User.userSelected.key;
            let type = 0;
            if (cmd == "ok") type = 1000;
            else if (cmd == "err") type = -100;
            else return Promise.resolve({ code: 503, message: "不支持的操作" });
            return CALLAPI({ cmd: "OfflineClear", userkey, type, deleteFile: false });
        },
        aDeleteFile(context, { key, isfile, islixian, ishuishouzhan }) {
            let userkey = context.rootState.User.userSelected.key;
            if (isfile) {
                return CALLAPI({ cmd: "FileTrash", userkey, identity: key });
            }
            if (ishuishouzhan) {
                return CALLAPI({ cmd: "TrashDelete", userkey, identity: key });
            }
            if (islixian) {
                return CALLAPI({ cmd: "OfflineDelete", userkey, identity: key });
            }
        },
        aRecoverFile(context, { key }) {
            let userkey = context.rootState.User.userSelected.key;
            let parentpath = key;
            if (parentpath.indexOf('/') >= 0) {
                parentpath = parentpath.substring(0, parentpath.lastIndexOf('/'))
                if (parentpath == "") parentpath = "/"
            } else {
                parentpath = "/";
            }
            return CALLAPI({ cmd: "TrashRecover", userkey, identity: key });
        },
        aDownLink(context, { key, isimg, isvideo }) {
            let userkey = context.rootState.User.userSelected.key;

            if (context.state.panDownUrlCache[key]) {
                let t = new Date().getTime() - context.state.panDownUrlCache[key].cachetime;
                if (t / 1000 < 3600) {
                    if (isimg || isvideo) {
                        return new Promise((resolve) => {
                            resolve(context.state.panDownUrlCache[key].resp);
                        });
                    }
                }
            }

            return CALLAPI({ cmd: "FileDownLink", userkey, identity: key }).then(resp => {
                if (resp.code == 0) {
                    if (isimg || isvideo) context.state.panDownUrlCache[key] = { resp, cachetime: new Date().getTime() };
                } else if (resp.message.indexOf("文件系统忙") > 0) {
                    console.log(resp);
                    resp.message = "6盘文件系统忙，请稍后再试";
                }
                return resp;
            });
        },
        aDownLinkPreview(context, { key, isvideo }) {
            let userkey = context.rootState.User.userSelected.key;

            return CALLAPI({ cmd: "FilePreviewLink", userkey, identity: key, isvideo }).then(resp => {
                if (resp.message.indexOf("文件系统忙") > 0) {
                    console.log(resp);
                    resp.message = "6盘文件系统忙，请稍后再试";
                }
                return resp;
            });
        },
        aDownTxt(context, { key, sizeint }) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "FileDownTxt", userkey, identity: key, sizeint }).then(resp => {
                if (resp.code == 0) {
                    resp.txtcontext = FromBase64(resp.txtcontext);
                }
                return resp;
            });
        },
        aCopyTo(context, { key, parentkey, cmd }) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "FileCopyTo", userkey, identity: key, parentIdentity: parentkey, copy: cmd });
        },
        aLiXianTo(context, { list, parentpath }) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "OfflineAdd", userkey, hashs: list, savePath: parentpath });
        },
        aLiXianBT(context, dataurl) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "OfflineAddBT", userkey, dataurl });
        },
        aLiXianLink(context, { link, password, item }) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "OfflineAddLink", userkey, link, password }).then(resp => {
                if (resp.code == 0) {
                    item.hash = resp.hash;
                } else {
                    if (resp.message.indexOf("请提供用户名密码") > 0 && link.indexOf("baidu.com") > 0) item.error = "提取码不正确";
                    else item.error = resp.message;
                }
                resp.item = item;
                return resp;
            });
        },
        aLiXianQuery(context) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "OfflineQuota", userkey });
        },
        aRefreshPan(context) {
            let pagename = context.rootState.UI.pagename;
            if (pagename != "/6pan") return;
            let dirkey = context.state.panDirSelected.dirkey;
            let dirpath = context.state.panDirSelected.dirpath;
            let userkey = context.rootState.User.userSelected.key;

            if (userkey == "add") return;

            let subtime = new Date().getTime() / 1000 - this.panRefreshTime;
            if (dirkey == "6pan-lixian") {
                if (subtime < 5) return;
            } else if (dirkey == "6pan-huishouzhan") {
                if (subtime < 20) return;
            } else if (dirkey == "6pan-search") {
                this.panRefreshTime = new Date().getTime() / 1000;
                return;
            } else if (subtime < 20) {
                return;
            }
            context.commit('UI/mNoticeSelect', null, { root: true });

            this.panRefreshTime = new Date().getTime() / 1000;
            CALLAPI({ cmd: "FileList", userkey, dirkey, dirpath, refresh: true }).then(resp => {
                let respFileList = [];
                if (resp.code == 0 && resp.filelist) respFileList = resp.filelist;
                context.commit('mLoadPanFileList', { dirkey: resp.key, respFileList });
            });
        },
        aPotPlayer(context, url) {
            return CALLAPI({ cmd: "PotPlayer", url });
        },
        aUploadSelect(context, key) {
            return CALLAPI({ cmd: "UploadSelect", key });
        },
        aUploadFile(context, { uploadtokey, uploadtopath, filedir, filelist }) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "UploadFile", userkey, uploadtokey, uploadtopath, filedir, filelist });
        },
    }
};
export default module6Pan