import AppData from './AppData.vue'
import { DefaultUser } from './data.js'
import { CALLAPI } from '../api/callapi.js'



const moduleUser = {
    namespaced: true,
    state: () => ({
        userSelected: DefaultUser(),
        userList: [],

    }),
    mutations: {
        mLoadUserList(state, respUserList) {
            if (!respUserList) respUserList = [];
            state.userList = respUserList;
        },
        mSelectUser(state, userkey) {
            if (userkey == "add") {
                state.userSelected = DefaultUser();
                return;
            }
            for (var item of state.userList) {
                if (item.key == userkey) {
                    state.userSelected = item;
                    break;
                }
            }
        },
        mRefreshUser(state, user) {
            let LEN = state.userList.length;
            for (let i = 0; i < LEN; i++) {
                let item = state.userList[i];
                if (item.key == user.key) {
                    item.username = user.username;
                }
            }

            if (state.userSelected.key == user.key) {
                state.userSelected = user;
            }
        },
        mDeleteUser(state, userkey) {
            for (var i = 0; i < state.userList.length; i++) {
                if (state.userList[i].key == userkey) {
                    state.userList.splice(i, 1);
                    break;
                }
            }
        },

    },
    actions: {
        aAddUser(context, data) {
            return CALLAPI({ cmd: "AddUser", ...data }).then(resp => {
                if (resp.code == 0) {
                    context.dispatch('aLoadUserList', resp.userkey);
                }
                return resp;
            });
        },
        aRefreshUser(context, userkey) {

            return CALLAPI({ cmd: "UserRefresh", userkey }).then(resp => {
                if (resp.code == 0) {
                    context.commit('mRefreshUser', resp.user);
                }
                return resp;
            });
        },
        aLoadUserList(context, userkey) {

            CALLAPI({ cmd: "LoadUserList" }).then(resp => {
                if (resp.code == 0) {
                    context.commit('mLoadUserList', resp.userlist);
                }
                if (context.state.userList.length <= 0) {
                    context.dispatch('aSelectUser', "add");
                } else if (userkey == "") {
                    context.dispatch('aSelectUser', context.state.userList[0].key);
                } else {
                    context.dispatch('aSelectUser', userkey);
                }
            });
        },
        aSelectUser(context, userkey) {
            context.commit('mSelectUser', userkey);
            let newkey = context.state.userSelected.key;
            context.dispatch("aRefreshUser", newkey);

            context.dispatch('Pan/aLoadDir', null, { root: true });
            if (newkey == "add") {
                context.commit('Rss/mLoadRss', [], { root: true });
            } else {
                context.commit('Rss/mLoadingRss', true, { root: true });
                AppData.TestAjax(() => {
                    context.commit('Rss/mLoadRss', AppData.TestRssList(userkey), { root: true });
                    context.commit('Rss/mLoadingRss', false, { root: true });
                    let showhelpstr = localStorage.getItem("showhelp");
                    let showhelp = parseInt(showhelpstr ? showhelpstr : "0");
                    if (showhelp < 50000 && context.state.userList.length > 0) {
                        context.dispatch('Rss/aSelectRss', "rss-xiaobaiyang/help", { root: true });
                        showhelp++;
                    }
                });
            }
        },
        aDeleteUser(context, userkey) {
            context.commit('mDeleteUser', userkey);
            CALLAPI({ cmd: "UserDelete", userkey }).then(() => {
                context.dispatch("aLoadUserList", "");
            });
        },
        aEditUserName(context, { userkey, username }) {
            return CALLAPI({ cmd: "UserEditName", userkey, username }).then(resp => {
                if (resp.code == 0) {
                    context.dispatch("aLoadUserList", userkey);
                }
                return resp;
            });
        },
        aEditUserPassword(context, { userkey, password, newpassword }) {
            return CALLAPI({ cmd: "UserEditPassword", userkey, password, newpassword }).then(resp => {
                if (resp.code == 0) {
                    context.dispatch("aSelectUser", userkey);
                }
                return resp;
            });
        },


    },
    getters: {

    }
};
export default moduleUser