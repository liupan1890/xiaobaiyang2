import { createApp } from 'vue'
import App from './App.vue'
import { store } from './store'
import { Button, Menu, Dropdown, Spin, Tooltip, Input, Select, message, Tabs, Form, Tree, Modal, Checkbox, Divider, Popover, Progress, Badge, Table, Upload, List } from 'ant-design-vue'

message.config({
  duration: 3,
  maxCount: 1,
})
const app = createApp(App)
app.use(store)

app.use(Button).use(Menu).use(Dropdown).use(Spin).use(Tooltip).use(Input).use(Divider).use(Popover).use(Progress)
app.use(Tabs).use(Form).use(Tree).use(Modal).use(Select).use(Checkbox).use(Badge).use(Table).use(Upload).use(List)
app.mount('#body')
