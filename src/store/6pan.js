import { DefaultLastSavePath, DefaultDirList, DefaultFileItem } from './data.js'
import { message } from 'ant-design-vue';
import { CALLAPI, FromBase64 } from '../api/callapi.js'
const module6Pan = {
    namespaced: true,
    state: () => ({
        panDirSelected: { dirkey: "", dirpath: "" },
        panDirList: [],
        panFilePath: [],
        panFileLoading: false,
        panFileList: [],
        panDownUrlCache: { cachetime: new Date().getTime() },
        panLastSavePath: DefaultLastSavePath(),
        panRefreshTime: 0,
    }),
    mutations: {
        mLoadDir(state) {
            state.panDirList = DefaultDirList();
            state.panDirSelected = { dirkey: "", dirpath: "" };
            state.panFilePath = [];
            state.panFileList = [];
        },
        mSelectDir(state, { dirkey, dirpath }) {

            if (dirkey == "6pan-lixian") {
                state.panFilePath = [{ key: dirkey, path: dirkey, dirname: "离线任务", sep: false }];
                state.panFileList = [];
                state.panDirSelected = { dirkey, dirpath };
            } else if (dirkey == "6pan-huishouzhan") {
                state.panFilePath = [{ key: dirkey, path: dirkey, dirname: "回收站", sep: false }];
                state.panFileList = [];
                state.panDirSelected = { dirkey, dirpath };
            } else if (dirkey == "6pan-root") {
                state.panFilePath = [{ key: dirkey, path: "/", dirname: "根目录", sep: false }];
                state.panFileList = [];
                state.panDirSelected = { dirkey, dirpath };
            } else {
                let path = [];
                if (dirpath.endsWith("/") == false) dirpath = dirpath + "/";
                let _FilePath = function(path, parent, dirpath) {
                    if (!parent) return;
                    let LEN = parent.length;
                    for (let i = 0; i < LEN; i++) {
                        let item = parent[i];
                        let itempath = item.path;
                        if (itempath.endsWith("/") == false) itempath = itempath + "/";
                        if (dirpath.startsWith(itempath)) {
                            path.push({ key: item.key, path: item.path, dirname: item.dirname, sep: dirpath != itempath });
                            if (item.children && item.children.length > 0) {
                                _FilePath(path, item.children, dirpath);
                            }
                        }
                    }
                };
                _FilePath(path, state.panDirList, dirpath);
                if (path.length > 1) {
                    state.panFilePath = Object.freeze(path);
                    state.panFileList = [];
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
        },

        mLoadPanDirList(state, { dirtree, dirkey, dirpath, respFileList }) {
            if (dirtree && dirkey != state.panDirSelected.dirkey) return

            if (dirkey == "6pan-lixian" || dirkey == "6pan-huishouzhan") return;

            let child = [];
            let LEN = respFileList.length;
            for (let i = 0; i < LEN; i++) {
                let item = respFileList[i];
                if (item.directory) {
                    let m = {
                        key: item.identity,
                        path: item.path,
                        dirname: item.name,
                        licon: "folder",
                        scopedSlots: { title: "custom" },
                        children: [],
                    };
                    if (m.dirname.length > 50) m.dirname = m.dirname.substr(0, 47) + "...";

                    child.push(m);
                }
            }

            if (dirpath.endsWith("/") == false) dirpath = dirpath + "/";
            let _FilePath = function(parent, dirpath) {
                if (!parent) return null;
                let LEN = parent.length;
                for (let i = 0; i < LEN; i++) {
                    let item = parent[i];
                    let itempath = item.path;
                    if (itempath.endsWith("/") == false) itempath = itempath + "/";
                    if (itempath == dirpath) return item;
                    if (dirpath.startsWith(itempath) && item.children && item.children.length > 0) {
                        return _FilePath(item.children, dirpath);
                    }
                }
                return null;
            };
            let f = _FilePath(state.panDirList, dirpath);
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
            if (dirtree) {
                setTimeout((fid) => {
                    let tree = document.getElementById("dirtree");
                    let row = document.getElementById(fid);
                    if (tree && row) {
                        if (tree.scrollTop > (row.offsetTop - 32)) tree.scrollTop = row.offsetTop - 114 - 32;
                        if ((tree.scrollTop + tree.offsetHeight) < row.offsetTop) tree.scrollTop = row.offsetTop - tree.offsetHeight;

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
            context.dispatch("aSelectDir", { dirkey: "6pan-root", dirpath: "/" });
        },
        aSelectDir(context, { dirkey, dirpath }) {
            if (dirkey == context.state.panDirSelected.dirkey) return;
            let refresh = dirkey == "refresh";
            if (refresh) {
                dirkey = context.state.panDirSelected.dirkey;
                dirpath = context.state.panDirSelected.dirpath;
            } else {
                let d = document.getElementById('fileitemlist')
                if (d) d.scrollTop = 0;
            }
            let userkey = context.rootState.User.userSelected.key;

            if (userkey == "add") {
                message.error("请先登录一个6盘账号");
                return
            }
            context.commit('mLoadingFile', true);
            CALLAPI({ cmd: "FileList", userkey, dirkey, dirpath, refresh }).then(resp => {
                context.commit('mLoadingFile', false);
                let respFileList = [];
                if (resp.code == 0) {
                    respFileList = resp.filelist;
                    context.commit('mSelectDir', { dirkey: resp.key, dirpath: resp.path });

                    context.commit('mLoadPanFileList', { dirkey: resp.key, respFileList });
                    context.commit('mLoadPanDirList', { dirtree: true, dirkey: resp.key, dirpath: resp.path, respFileList });
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
            return CALLAPI({ cmd: "FileDown", userkey, identity: key });

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
            return CALLAPI({ cmd: "TrashRecover", userkey, identity: key });

        },
        aDownLink(context, { key, isimg, isvideo }) {
            let userkey = context.rootState.User.userSelected.key;

            if (!context.state.panDownUrlCache.cachetime) context.state.panDownUrlCache.cachetime = 1;
            let t = new Date().getTime() - context.state.panDownUrlCache.cachetime;
            if (t / 1000 > 3600) context.state.panDownUrlCache = { cachetime: new Date().getTime() };
            if ((isimg || isvideo) && context.state.panDownUrlCache[key]) {
                return new Promise((resolve) => {
                    resolve(context.state.panDownUrlCache[key]);
                });
            }
            return CALLAPI({ cmd: "FileDownLink", userkey, identity: key }).then(resp => {
                if (resp.code == 0) {
                    if (isimg || isvideo) context.state.panDownUrlCache[key] = resp;
                } else if (resp.message.indexOf("文件系统忙") > 0) {
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
        aLiXianTo(context, { key, parentpath }) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "OfflineAdd", userkey, hashs: [key], savePath: parentpath });
        },
        aLiXianBT(context, dataurl) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "OfflineAddBT", userkey, dataurl });
        },
        aLiXianLink(context, { link, password }) {
            let userkey = context.rootState.User.userSelected.key;
            return CALLAPI({ cmd: "OfflineAddLink", userkey, link, password });
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
    }
};
export default module6Pan