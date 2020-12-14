<template>
  <a-modal key="LiXianModal" :visible="checkShowModal" title="" :footer="null" width="auto" class="LiXianModal" @cancel="handleCancel">
    <a-divider orientation="left">批量创建离线任务(BT、磁力、电驴、百度、B站)</a-divider>
    <p class="code-box-meta">
      您当天还可添加 {{ dataDailyQuota - dataDailyUsed }} / {{ dataDailyQuota }} 个离线任务
      <a-popover title="提交离线任务的帮助">
        <template #content>
          <p>
            一行必须是一个
            <a>完整的链接</a>
            ,多条链接必须用换行(回车)分隔
          </p>
          <p>粘贴链接后,先点击<button>格式化&&预解析</button>，再点击<button>提交离线</button></p>
          <p>留意当天还可添加的任务数，超出的链接会被丢弃</p>
          <p>
            百度必须是以下格式
            <br />
            <a>https://pan.baidu.com/s/1IXXXX2BGQ 提取码: 2569</a>
            <br />
            <a>https://pan.baidu.com/s/1IXXXX2BGQ 2569</a>
            <br />
            <a>https://pan.baidu.com/share/init?surl=IXXXX2BGQ 2569</a>
            <br />
          </p>
          <p>
            B站可以离线部分大会员视频
            <br />
            <a>https://www.bilibili.com/video/BV1i5411L7QL</a>
            <br />
            <a>https://www.bilibili.com/bangumi/play/ep352211</a>
            <br />
          </p>
          <p>链接必须以 http://、https://、ed2k://、magnet:?、ftp:// 开头</p>
        </template>
        <a> 点我看帮助信息 </a>
      </a-popover>
    </p>

    <div class="ant-row ant-form-item" style="margin-bottom: 16px; min-height: 40px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div v-for="item in lixianFileList.files" :key="item.link">
          <div class="lixianrow" :class="{ on: item.hash != '', err: item.errmsg != '' }">
            <a-textarea :value="item.link" spellcheck="false" auto-size />
            <a>{{ item.errmsg }}</a>
            <button class="ant-btn delbtn" @click="handleDelLink(item.link)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="ant-row ant-form-item" style="margin-bottom: 16px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-textarea v-model:value="dataTextLink" placeholder="粘贴完整的链接，多条链接用换行(回车)间隔开" spellcheck="false" :auto-size="{ minRows: 3, maxRows: 4 }" @change="handleTextLinkChange" />
          </span>
        </div>
      </div>
    </div>

    <div class="ant-row ant-form-item" style="margin-bottom: 16px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <span class="ant-form-item-children">
            <a-checkbox v-model:checked="dataLastSavePathChecked" class="lastsavepathcheck">
              <span class="last">最近保存位置:</span>
              {{ dataLastSavePath }}
            </a-checkbox>
          </span>
        </div>
      </div>
    </div>

    <div class="ant-row ant-form-item" style="margin-bottom: 0px">
      <div class="ant-col ant-col-1 ant-form-item-label"></div>
      <div class="ant-col ant-col-22 ant-form-item-control-wrapper">
        <div class="ant-form-item-control">
          <div class="ant-form-item-children" style="clear: both">
            <a-upload name="file" :beforeUpload="handleSelectBT" :multiple="true" :showUploadList="false" accept=".torrent" style="float: left">
              <a-button>
                <span class="iconfont iconupload"></span>
                选择BT种子(可多选)
              </a-button>
            </a-upload>
            <a-button :disabled="lixianCount === 0" :loading="modalLoading" type="danger" style="float: right" @click.stop="handleSave">提交离线({{ lixianCount }}条)</a-button>
            <a-button v-if="lixianCount === 0" :loading="modalLoading" type="primary" style="float: right; margin-right: 24px" @click.stop="handleParse">格式化&&预解析</a-button>
            <div style="clear: both"></div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, reactive, watchEffect } from 'vue'
  import APIOffline from '@/api/offline'
  import { StoreUI } from '@/store/ui'
  import { StoreUser } from '@/store/user'
  import { message } from 'ant-design-vue'
  import VxeListComponent from '@/components/vxe-list'

  export interface ILiXianLink {
    link: string
    hash: string
    errmsg: string
  }

  export default defineComponent({
    name: 'LiXianModal',
    components: { VxeList: VxeListComponent },
    setup() {
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'lixian')
      const modalLoading = ref(false)

      const dataTextLink = ref('')
      const dataLastSavePathChecked = ref(false)
      const dataLastSavePath = ref('')

      const lixianFileList = reactive({ files: [] as ILiXianLink[], ts: 0 })

      const lixianCount = ref(0)

      const dataDailyQuota = ref(0)
      const dataDailyUsed = ref(0)

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'lixian') {
          modalLoading.value = false
          dataTextLink.value = ''
          lixianCount.value = 0
          lixianFileList.files = []
          lixianFileList.ts = new Date().getTime()
        } else {
          if (StoreUser.UserSelected.key) {
            APIOffline.OfflineQuota(StoreUser.UserSelected.key).then((resp) => {
              dataDailyQuota.value = resp.dailyQuota
              dataDailyUsed.value = resp.dailyUsed
            })
          }
          dataTextLink.value = ''
          lixianFileList.files = []
          lixianFileList.ts = new Date().getTime()
          let lastpath = localStorage.getItem('lixiantolastdir') || ''
          if (lastpath === '' || lastpath === '/') lastpath = '/根目录'
          dataLastSavePath.value = lastpath
        }
      })

      function addOneLink(linkstr: string) {
        for (let i = 0; i < lixianFileList.files.length; i++) {
          const item = lixianFileList.files[i]
          if (item.link === linkstr) return
          if (item.link.startsWith(linkstr)) return
          if (linkstr.startsWith(item.link)) {
            item.link = linkstr
            return
          }
        }
        lixianFileList.files.push({ link: linkstr, hash: '', errmsg: '' })
        lixianCount.value = 0
      }
      function handleDelLink(linkstr: string) {
        const List = []
        for (let i = 0; i < lixianFileList.files.length; i++) {
          const item = lixianFileList.files[i]
          if (item.link !== linkstr) {
            List.push(item)
          }
        }
        lixianFileList.files = List

        let count = 0
        for (let k = 0; k < List.length; k++) {
          if (List[k].hash !== '') count++
        }
        lixianCount.value = count
      }
      function formateTypeLink(Link: string, Type: string) {
        const url = Link.match(new RegExp(Type + '(.*)', 'i'))
        if (url == null) return ''
        return url[0].trim()
      }
      function formateBDLink(Link: string) {
        Link = Link.replace(new RegExp('pan.baidu.com/share/init?surl=', 'ig'), 'pan.baidu.com/s/1')
        if (Link.indexOf('复制这段内容') > 0) Link = Link.substr(0, Link.indexOf('复制这段内容'))
        const linklower = Link.toLowerCase()
        if (linklower.indexOf('pan.baidu.com/s/') >= 0) {
          let pwd = Link.substring(linklower.indexOf('pan.baidu.com/s/') + 'pan.baidu.com/s/'.length)
          pwd = pwd.replace(new RegExp('提取码', 'g'), ' 提取码')
          pwd = pwd.replace(new RegExp('提码', 'g'), ' 提取码')
          pwd = pwd.replace(new RegExp('密码', 'g'), ' 提取码')
          pwd = pwd.replace(new RegExp('　', 'g'), '')
          pwd = pwd.replace(new RegExp('：', 'g'), '')
          pwd = pwd.replace(new RegExp(':', 'g'), '')

          let link = 'https://pan.baidu.com/s/' + pwd
          if (pwd.indexOf(' ') >= 0) {
            link = link.substring(0, link.indexOf(' '))
            pwd = pwd.substring(pwd.indexOf(' ') + 1)
            if (pwd.indexOf('提取码') >= 0) pwd = pwd.substring(pwd.indexOf('提取码') + '提取码'.length)
            pwd = pwd.replace(new RegExp(' ', 'g'), '')
            return link + ' 提取码: ' + pwd
          } else return link
        }
        return ''
      }
      function formateOneLink(linkstr: string) {
        linkstr = linkstr.replace(/[\r\t]/g, '')
        if (linkstr === '') return { islink: false, linkstr: '' }

        const bd = formateBDLink(linkstr)
        if (bd !== '') return { islink: true, linkstr: bd }

        const ed2k = formateTypeLink(linkstr, 'ed2k://')
        if (ed2k !== '') return { islink: true, linkstr: ed2k }

        const magnet = formateTypeLink(linkstr, 'magnet:?')
        if (magnet !== '') return { islink: true, linkstr: magnet }

        const ftp = formateTypeLink(linkstr, 'ftp://')
        if (ftp !== '') return { islink: true, linkstr: ftp }

        const https = formateTypeLink(linkstr, 'https://')
        if (https !== '') return { islink: true, linkstr: https }

        const http = formateTypeLink(linkstr, 'http://')
        if (http !== '') return { islink: true, linkstr: http }

        return { islink: false, linkstr: '' }
      }

      function handleTextLinkChange() {
        lixianCount.value = 0
      }
      function formateTextLink() {
        let linkstr = dataTextLink.value
        linkstr = linkstr.replace(new RegExp('\\n提', 'g'), ' 提')
        linkstr = linkstr.replace(new RegExp('\\n 提', 'g'), ' 提')
        let isadd = false
        const linkrows = linkstr.split('\n')
        const List = []
        for (let i = 0; i < linkrows.length; i++) {
          const row = formateOneLink(linkrows[i])
          if (row.islink) List.push(row.linkstr)
        }
        for (let j = 0; j < List.length; j++) {
          addOneLink(List[j])
          isadd = true
        }
        if (isadd === true) {
          dataTextLink.value = ''
        }
      }

      function handleSelectBT(file: File) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            APIOffline.OfflineAddBT(reader.result).then((result) => {
              if (result) {
                addOneLink(result)
              } else {
                message.error('BT转磁力，转换失败')
              }
            })
          }
        }
        return false
      }

      function handleParse() {
        formateTextLink()
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        lixianCount.value = 0
        const List: ILiXianLink[] = []
        for (let i = 0; i < lixianFileList.files.length; i++) {
          const item = lixianFileList.files[i]
          const url = item.link.replace(/[\r\t]/g, '')
          if (item.link !== url) item.link = url

          if (url.startsWith('ftp://') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ed2k://') || url.startsWith('magnet:?')) {
            List.push(item)
          }
        }
        lixianFileList.files = List

        if (List.length === 0) {
          message.info('没有任何链接可以提交解析')
          return
        }
        modalLoading.value = true
        const PList = []
        for (let j = 0; j < List.length; j++) {
          const item = List[j]
          if (item.hash !== '') continue
          let link = item.link
          let password = ''
          if (link.indexOf('提取码') > 0) {
            password = link.substring(link.indexOf('提取码') + '提取码'.length)
            password = password.replace(new RegExp('[: ]', 'g'), '')
            if (password.length > 4) password = password.substr(0, 4)
            link = link.substring(0, link.indexOf('提取码')).trim()
          }
          PList.push(
            APIOffline.OfflineParse(userid, link, '', password)
              .then((resp) => {
                if (typeof resp === 'string') {
                  if (resp.indexOf('请提供用户名密码') >= 0 && link.indexOf('baidu.com') > 0) item.errmsg = '提取码不正确'
                  else item.errmsg = resp
                } else {
                  item.hash = resp.hash
                }
              })
              .catch(() => {
                item.errmsg = '联网失败请重试'
              })
          )
        }
        Promise.all(PList).then(() => {
          modalLoading.value = false

          let count = 0
          for (let k = 0; k < List.length; k++) {
            if (List[k].hash !== '') count++
          }
          lixianCount.value = count
          if (count === 0) {
            message.info('没有任何链接可以提交离线')
          } else {
            message.info('成功解析' + count + '条链接，可以离线了')
          }
        })
      }
      function handleSave() {
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        const hashs: string[] = []
        for (let k = 0; k < lixianFileList.files.length; k++) {
          if (lixianFileList.files[k].hash !== '') hashs.push(lixianFileList.files[k].hash)
        }
        let lastpath = dataLastSavePath.value
        if (lastpath === '/根目录') lastpath = '/'
        if (lastpath === '') lastpath = '/'
        if (dataLastSavePathChecked.value === true) {
          modalLoading.value = true
          APIOffline.OfflineAdd(userid, hashs, lastpath).then((result) => {
            modalLoading.value = false
            if (result > 0) message.success('操作成功，添加了 ' + result + ' 个离线任务')
            else message.error('添加离线任务失败，请重试')
            StoreUI.mCloseModal()
          })
        } else {
          StoreUI.mShowModal({ ModalName: 'copyto', ModalData: { keylist: hashs, path: '/', from: 'lixian' } })
        }
      }
      function handleCancel() {
        if (modalLoading.value === true) {
          message.info('正在执行操作中，等待完成后才能关闭')
          return false
        }
        StoreUI.mCloseModal()
      }

      return {
        checkShowModal,
        modalLoading,
        dataTextLink,
        dataLastSavePathChecked,
        dataLastSavePath,
        lixianFileList,
        lixianCount,
        dataDailyQuota,
        dataDailyUsed,
        addOneLink,
        handleDelLink,
        handleTextLinkChange,
        handleSelectBT,
        handleParse,
        handleSave,
        handleCancel,
      }
    },
  })
</script>

<style>
  .LiXianModal.ant-modal {
    max-width: 740px;
    min-width: 520px;
  }
  .LiXianModal .lixianrow {
    padding: 4px 35px 4px 0;
    position: relative;
  }
  .LiXianModal .lixianrow.on textarea {
    border: 1px solid #8bc755;
    color: #5aa816;
  }
  .LiXianModal .lixianrow.err textarea {
    border: 1px solid #df5659;
    color: #ef3450;
  }
  .LiXianModal .delbtn {
    position: absolute;
    right: 0px;
    top: 4px;
    background: #ffffff;
    color: #ef3450;
    font-size: 12px !important;
    border: 1px solid #df5659;
    border-radius: 4px !important;
    height: 32px !important;
    min-width: 32px !important;
    padding: 5px !important;
  }

  .lastsavepathcheck {
    line-height: 16px;
  }
  .lastsavepathcheck .ant-checkbox + span {
    word-break: break-all;
    line-height: 16px;
  }
  .ant-form-explain {
    line-height: 16px;
    display: inline-block;
  }
  .lastsavepathcheck .last {
    color: #ef3450;
  }
  textarea.ant-input {
    word-break: break-all;
  }

  .ant-popover-content p > button {
    line-height: 16px;
    padding: 0 4px;
    margin: 0 3px;
  }
</style>
