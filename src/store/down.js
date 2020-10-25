import { CALLAPI } from '../api/callapi.js'
import { DefaultDownItem } from './data';
const moduleDown = {
    namespaced: true,
    state: () => ({
        downSelected: "",
        downFileList: [],
        downFileCount: 0,
        downFileLoading: false,
        downRefreshTime: 0,
    }),
    mutations: {
        mSelectDown(state, downkey) {
            state.downSelected = downkey;
            state.downFileList = [];
        },
        mLoadingFile(state, loading) {
            state.downFileLoading = loading;
        },
        mLoadDown(state, { downkey, respDownCount, respDownList }) {
            if (state.downSelected != downkey) return;
            let list = [];
            let LEN = respDownList.length;
            for (let i = 0; i < LEN; i++) {
                list.push(DefaultDownItem(downkey, respDownList[i]));
            }
            state.downFileList = Object.freeze(list);
            state.downFileCount = respDownCount;
        },
    },
    actions: {
        aSelectDown(context, downkey) {
            if (downkey == "refresh") downkey = context.state.downSelected;
            if (downkey != "downing" && downkey != "downed" && downkey != "upload" && downkey != "uploading") return;
            context.commit('mSelectDown', downkey);
            context.commit('mLoadingFile', true);
            let userkey = context.rootState.User.userSelected.key;

            CALLAPI({ cmd: "DownList", userkey, downkey }).then(resp => {
                context.commit('mLoadingFile', false);
                if (resp.code == 0 && resp.filelist) {
                    context.commit('mLoadDown', { downkey: downkey, respDownCount: resp.filecount, respDownList: resp.filelist });
                }
            });
        },
        aRefreshDown(context, downkey) {
            let pagename = context.rootState.UI.pagename;
            if (pagename != "/down") return;
            let isrefresh = downkey == "refresh"
            downkey = context.state.downSelected;
            let userkey = context.rootState.User.userSelected.key;
            if (userkey == "add") return;
            if (isrefresh == false) {
                let subtime = new Date().getTime() / 1000 - this.downRefreshTime;
                if (downkey == "downing" && subtime < 2) {
                    return;
                } else if (downkey == "downed" && subtime < 8) {
                    return;
                } else if (downkey == "uploading" && subtime < 2) {
                    return;
                } else if (downkey == "upload" && subtime < 8) {
                    return;
                }
            }
            this.downRefreshTime = new Date().getTime() / 1000;
            CALLAPI({ cmd: "DownList", userkey, downkey }).then(resp => {
                if (resp.code == 0 && resp.filelist) {
                    context.commit('mLoadDown', { downkey: downkey, respDownCount: resp.filecount, respDownList: resp.filelist });
                }
            });
        },
        aDownStartAll(context, downkey) {
            return CALLAPI({ cmd: "DownStartAll", downkey });
        },
        aDownStopAll(context, downkey) {
            return CALLAPI({ cmd: "DownStopAll", downkey });
        },
        aDownDeleteAll(context, downkey) {
            return CALLAPI({ cmd: "DownDeleteAll", downkey });
        },
        aDownStart(context, { downkey, DownID }) {
            return CALLAPI({ cmd: "DownStart", downkey, DownID }).then(resp => {
                return resp;
            });
        },
        aDownStop(context, { downkey, DownID }) {
            return CALLAPI({ cmd: "DownStop", downkey, DownID }).then(resp => {
                return resp;
            });
        },
        aDownDelete(context, { downkey, DownID }) {
            return CALLAPI({ cmd: "DownDelete", downkey, DownID });
        },
        aOpenDir(context, { downkey, savepath }) {
            return CALLAPI({ cmd: "OpenDir", downkey, savepath });
        },
    },
    getters: {

    }
};
export default moduleDown