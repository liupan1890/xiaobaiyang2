import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import antd, { message, notification } from 'ant-design-vue';
import App from './App.vue'
import { User, Rss, Pan, Down, UI } from './store/index'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

Vue.use(VueVirtualScroller)
Vue.config.productionTip = false
Vue.use(Vuex);
Vue.use(antd);
Vue.use(mavonEditor)

Vue.prototype.$notification = notification;
Vue.prototype.$message = message;
message.config({
    duration: 4,
    maxCount: 3,
});

const store = new Vuex.Store({
    modules: {
        User,
        Rss,
        Pan,
        Down,
        UI
    },
    actions: {
        aInitStore(context) {
            context.dispatch('Down/aSelectDown', "downing");
            context.dispatch('User/aLoadUserList', "");
            context.dispatch('UI/aNotice', "");
            let refresh = function() {
                context.dispatch('Down/aRefreshDown');
                context.dispatch('Pan/aRefreshPan');
                setTimeout(refresh, 1500);
            };
            setTimeout(refresh, 1500);
        }
    }

});


axios.interceptors.request.use(
    config => {
        store.commit('UI/mLoading', true);
        return config;
    },
    error => {
        return Promise.reject(error)
    }
)

axios.interceptors.response.use(
    response => {
        if (response.data.code == 501 && response.data.message == "需要远程管密码") {
            store.commit("UI/mShowModal", { name: "remotepassword", data: {} });
        }
        store.commit('UI/mLoading', false)
        return response
    },
    error => {
        return Promise.reject(error)
    }
)

new Vue({
    store,
    created: function() {
        store.dispatch("aInitStore");
    },
    render: h => h(App)
}).$mount('#app')