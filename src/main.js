import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { Button, message, Icon, Tooltip, List, Tree, Progress, Dropdown, Menu, Table, Empty, Modal, Tabs, Form, Input, Select, Spin, Upload, Divider, Steps, Badge, notification, Checkbox, Radio } from 'ant-design-vue';
import App from './App.vue'
import { User, Rss, Pan, Down, UI } from './store/index'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

Vue.use(VueVirtualScroller)


Vue.config.productionTip = false

Vue.use(Vuex);
Vue.use(mavonEditor)

Vue.use(Radio);
Vue.use(Checkbox);
Vue.use(Badge);
Vue.use(Steps);
Vue.use(Divider);
Vue.use(Upload);
Vue.use(Spin);
Vue.use(Select);
Vue.use(Input);
Vue.use(Form);
Vue.use(Tabs);
Vue.use(Modal);
Vue.use(Empty);
Vue.use(Table);
Vue.use(Menu);
Vue.use(Dropdown);
Vue.use(Progress);
Vue.use(Tree);
Vue.use(List);
Vue.use(Tooltip);
Vue.use(Icon);
Vue.use(Button);

Vue.prototype.$notification = notification;
Vue.prototype.$message = message;
message.config({
    duration: 4,
    maxCount: 6,
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
        //程序启动后初始化
        aInitStore(context) {
            context.dispatch('Down/aSelectDown', "downing");
            context.dispatch('User/aLoadUserList', "");
            context.dispatch('UI/aNotice', "");
            let refresh = function() {
                context.dispatch('Down/aRefreshDown');
                context.dispatch('Pan/aRefreshPan');
                setTimeout(refresh, 2000);
            };
            setTimeout(refresh, 3000);
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
    //在 response 拦截器实现

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