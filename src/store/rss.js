import AppData from './AppData.vue'
import { DefaultRssList } from './data.js'
const moduleRss = {
    namespaced: true,
    state: () => ({
        rssSelected: {},
        rssList: [],
        rssLoading: false,
        rssNewsList: [],
        rssNewsLoading: false,
        rssNewsSelected: {},
    }),
    mutations: {

        mSelectRss(state, rsskey) {
            let _Find = function(rsskey, rssList) {
                for (var i = 0; i < rssList.length; i++) {
                    if (rssList[i].key == rsskey) {
                        return rssList[i];
                    }
                    if (rssList[i].children && rssList[i].children.length > 0) {
                        let f = _Find(rsskey, rssList[i].children);
                        if (f) return f;
                    }
                }
                return null;
            };
            let f = _Find(rsskey, state.rssList);
            if (f) {
                state.rssSelected = f;
                state.rssNewsList = [];
                state.rssNewsSelected = {};
            }
        },
        mDeleteRss(state, rsskey) {
            let _del = function(rsskey, rssList) {
                for (var i = 0; i < rssList.length; i++) {
                    if (rssList[i].key == rsskey) {
                        rssList.splice(i, 1);
                        break;
                    }
                    if (rssList[i].children && rssList[i].children.length > 0) _del(rsskey, rssList[i].children);
                }
            };
            _del(rsskey, state.rssList);

            if (state.rssSelected && state.rssSelected.key == rsskey) {
                state.rssSelected = {};
                state.rssNewsList = [];
                state.rssNewsSelected = {};
            }
        },
        mLoadingRss(state, loading) {
            state.rssLoading = loading;
        },
        mLoadRss(state, respRssList) {
            let list = DefaultRssList();
            for (let rssitem of respRssList) {
                list.push(rssitem);
            }
            state.rssList = list;
            state.rssSelected = {};
            state.rssNewsList = [];
            state.rssNewsSelected = {};
        },
        mLoadRssNews(state, { respNewsList, rsskey }) {
            if (rsskey != state.rssSelected.key) return
            state.rssNewsSelected = {};
            state.rssNewsList = respNewsList;

        },
        mLoadingRssNews(state, loading) {
            state.rssNewsLoading = loading;
        },
        mLoadRssNewsContent(state, respNewsItem) {
            state.rssNewsSelected = respNewsItem;
        },
    },
    actions: {
        aSelectRss(context, rsskey) {
            context.commit('mSelectRss', rsskey);
            context.commit('mLoadingRssNews', true);
            AppData.TestAjax(() => {
                context.commit('mLoadRssNews', { rsskey, respNewsList: AppData.TestNewsList(rsskey) });
                context.commit('mLoadingRssNews', false);
            });
        },
        aDeleteRss(context, rsskey) {
            let userkey = context.state.userSelected.key;
            context.commit('mDeleteRss', rsskey);
            AppData.TestAjax((res) => {
                console.log("联网删除Rss ", userkey, rsskey, res.results);
            });
        },
        aSelectNews(context, newskey) {
            if (newskey == "") return;
            AppData.TestAjax(() => {
                context.commit('mLoadRssNewsContent', AppData.TestNewsItem(newskey));
            });
        },
    },
    getters: {

    }
};
export default moduleRss