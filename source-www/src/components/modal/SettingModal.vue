<template>
  <a-modal key="SettingModal" :visible="checkShowModal" title="" :footer="null" :destroyOnClose="true" @cancel="handleCancel">
    <a-divider orientation="left">
      <div class="exever">
        APP设置<small>{{ LocalExeVer }}<a-spin :spinning="modalLoading"> </a-spin></small>
      </div>
    </a-divider>
    <div class="br"></div>
    <a-form layout="vertical" class="settingform">
      <a-form-item style="margin-bottom: 0; padding-bottom: 5px">
        <template #label>
          ░ 下载保存位置
          <a-popover>
            <template #content>
              <p><a>选择一个文件夹，所有文件默认都下载保存到此文件夹内</a></p>
              <p></p>
              <p>下载的文件会按6盘里的完整路径保存，所以这里选短一点例如 D:\Down\</p>
              <p>windows文件路径一般最长只允许250个字符</p>
              <p>当文件保存路径过长时会被迫自动截短</p>
            </template>
            <a> <span class="iconfont iconbulb"></span> </a>
          </a-popover>
        </template>

        <a-input-search v-model:value="settingData.SavePath" spellcheck="false" style="width: calc(100% - 80px); margin-right: 15px" @search="handleSavePath">
          <template #enterButton>
            <a-button :loading="modalLoading"> <span class="iconfont iconfolder"></span>选择 </a-button>
          </template>
        </a-input-search>
        <a-button :loading="modalLoading" type="primary" style="width: 63px" @click="handleSavePathSave"> 保存 </a-button>
      </a-form-item>
      <a-form-item style="margin-bottom: 0; padding-bottom: 5px">
        <a-checkbox v-model:checked="settingData.SavePathEveryTime" style="color: #df5659" @change="handleSavePathEveryTime"> 每次下载时都要求我选择下载位置 </a-checkbox>
        <a-popover>
          <template #content>
            <p><a>推荐不勾选</a></p>
            <p></p>
            <p>勾选后，每次点击下载按钮，都会弹窗显示选择下载保存位置</p>
            <p>不勾选，每次点击下载按钮，直接下载保存到上面的路径</p>
          </template>
          <a> <span class="iconfont iconbulb"></span> </a>
        </a-popover>
      </a-form-item>
      <div class="br"></div>
      <a-form-item style="margin-bottom: 0; padding-bottom: 5px">
        <template #label>
          ░ 播放器文件
          <a-popover>
            <template #content>
              <p><a>设置了播放器后才能在线预览所有视频音频</a></p>
              <p></p>
              <p>windows=填<a>MPV</a> 或 选择一个播放器.exe -- 点击保存</p>
              <p>linux=填<a>MPV</a> 或 填一个播放器的名称 -- 点击保存</p>
              <p>mac=填<a>MPV</a> 或 填 /Applications/xxx.app 这样的路径 -- 点击保存</p>
              <p>
                <br />
                程序底层是调用命令
                <a>"你填的" + "视频下载URL"</a>
                需要自己先装一个播放软件
              </p>
              <p>6盘已屏蔽vlc播放器，<a>使用其他播放器替代即可</a>，推荐mpv不会被屏蔽</p>
            </template>
            <a> <span class="iconfont iconbulb"></span> </a>
          </a-popover>
        </template>

        <a-input-search v-model:value="settingData.PlayerPath" spellcheck="false" style="width: calc(100% - 80px); margin-right: 15px" @search="handlePlayerPath">
          <template #enterButton>
            <a-button :loading="modalLoading"> <span class="iconfont iconfolder"></span>选择 </a-button>
          </template>
        </a-input-search>
        <a-button :loading="modalLoading" type="primary" style="width: 63px" @click="handlePlayerPathSave"> 保存 </a-button>
        <br />
      </a-form-item>
      <div class="br"></div>
      <a-form-item style="margin-bottom: 0; padding-bottom: 5px">
        <template #label>
          ░ 同时上传/下载任务数
          <a-popover>
            <template #content>
              <p><a>出现403,502,链接被中断,都是6盘的限制</a></p>
              <p></p>
              <p>6盘限制最多3文件同时下载,每文件最多5线程,下载中不能换IP,每日1T流量</p>
              <p>超过限制会被限速或503或403或被拒绝</p>
              <p>实测单个文件1线程8MB/s,2线程15MB/s,推荐多文件2线程同时下载</p>
              <p>部分冷文件6盘存储在境外,下载时6盘cdn需要去境外拉取</p>
              <p>所以有的文件下载速度就是很慢(1-2MB/s),并不是受限或性能有问题</p>
            </template>
            <a> <span class="iconfont iconbulb"></span> </a>
          </a-popover>
        </template>

        <a-select v-model:value="settingData.TaskCountMax" style="width: 190px" @change="handleTaskCountMax">
          <a-select-option value="1"> 1个文件同时启动 </a-select-option>
          <a-select-option value="3"> 3个文件同时启动(推荐) </a-select-option>
          <a-select-option value="5"> 5个文件同时启动 </a-select-option>
          <a-select-option value="10"> 10个文件同时启动 </a-select-option>
        </a-select>

        <a-select v-model:value="settingData.ThreadCountMax" style="width: 206px; margin-left: 34px" @change="handleThreadCountMax">
          <a-select-option value="1"> 每个文件1个线程 </a-select-option>
          <a-select-option value="2"> 每个文件2个线程(推荐) </a-select-option>
          <a-select-option value="3"> 每个文件3个线程 </a-select-option>
          <a-select-option value="4"> 每个文件4个线程 </a-select-option>
        </a-select>
        <br />
      </a-form-item>
      <div class="br"></div>
      <a-form-item style="margin-bottom: 8px">
        <a-checkbox v-model:checked="settingData.UseVipVideoUrl" style="color: #df5659" @change="handleUseVipVideoUrl"> 在线预览视频时优先使用m3u8格式链接 </a-checkbox>
        <a-popover>
          <template #content>
            <p><a>默认不勾选</a></p>
            <p></p>
            <p>勾选后，在线预览视频时</p>
            <p>1. 如果有该视频转码后的m3u8格式链接,返回m3u8</p>
            <p>2. 如果没有m3u8链接，则返回原始视频文件的链接</p>
            <p></p>
            <p>部分视频，6盘会提供m3u8预览链接，理论上更适合在线观看(流畅)</p>
            <p>但相比转码后的m3u8，原始视频文件画质更清晰</p>
          </template>
          <a> <span class="iconfont iconbulb"></span> </a>
        </a-popover>
      </a-form-item>

      <a-form-item style="margin-bottom: 5px">
        <a-checkbox v-model:checked="settingData.RunDownFinish" style="color: #df5659" @change="handleRunDownFinish"> 下载完成后调用脚本downfinish(.sh/.cmd) </a-checkbox>
        <a-popover>
          <template #content>
            <p><a>默认不勾选，且大部分用户用不到此功能，请直接忽略此项</a></p>
            <p></p>
            <p>勾选后，会按照aria2的方式，每下载完一个文件后都自动调用脚本命令</p>
            <p>1. 默认没有脚本文件，需要用户自己创建脚本文件</p>
            <p>2. 脚本文件必须命名为downfinish.sh(linux,mac)/downfinish.cmd(win)</p>
            <p>3. 脚本文件必须放在6panserver(.exe)文件同一目录</p>
            <p>4. aria2返回的参数为#1 GID,#2 FileNum,#3 FilePath</p>
            <p>5. 自动调用执行脚本操作,可能会被安全软件报告为病毒!请悉知</p>
          </template>
          <a> <span class="iconfont iconbulb"></span> </a>
        </a-popover>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
  import { message } from 'ant-design-vue'
  import { defineComponent, computed, ref, reactive, watchEffect } from 'vue'
  import { StoreUI } from '@/store/ui'
  import { ISetting, StoreConfig } from '@/store/config'
  export default defineComponent({
    name: 'SettingModal',
    setup() {
      const modalLoading = ref(false)
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'setting')
      const LocalExeVer = computed(() => StoreConfig.ServerConfig.LocalExeVer)
      const settingData: ISetting = reactive({
        PlayerPath: '',
        SavePath: '',
        SavePathEveryTime: false,
        RemotePassword: '',
        TaskCountMax: '3',
        ThreadCountMax: '3',
        RunDownFinish: false,
        UseVipVideoUrl: false,
      })

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'setting') {
          modalLoading.value = false
        } else {
          settingData.PlayerPath = StoreConfig.UserSetting.PlayerPath
          settingData.SavePath = StoreConfig.UserSetting.SavePath
          settingData.SavePathEveryTime = StoreConfig.UserSetting.SavePathEveryTime
          settingData.RemotePassword = StoreConfig.UserSetting.RemotePassword
          settingData.TaskCountMax = StoreConfig.UserSetting.TaskCountMax
          settingData.ThreadCountMax = StoreConfig.UserSetting.ThreadCountMax
          settingData.RunDownFinish = StoreConfig.UserSetting.RunDownFinish
          settingData.UseVipVideoUrl = StoreConfig.UserSetting.UseVipVideoUrl
        }
      })

      function handlePlayerPath() {
        if (window.WebShowOpenDialogSync) {
          modalLoading.value = true
          window.WebShowOpenDialogSync({ title: '选择一个播放器可执行文件(.exe)', buttonLabel: '选择', properties: ['openFile'] }, (result: string[] | undefined) => {
            modalLoading.value = false
            if (result && result[0]) {
              settingData.PlayerPath = result[0]
            } else {
              message.error('没有选择任何文件')
            }
          })
        } else {
          message.error('需要Electron环境支持')
        }
      }
      function handlePlayerPathSave() {
        modalLoading.value = true
        if (settingData.PlayerPath === '') settingData.PlayerPath = 'mpv'
        StoreConfig.aUpdateSetting({ key: 'PlayerPath', value: settingData.PlayerPath }).then(() => {
          StoreConfig.aRefresh()
          modalLoading.value = false
        })
      }
      function handleSavePath() {
        if (window.WebShowOpenDialogSync) {
          modalLoading.value = true
          window.WebShowOpenDialogSync({ title: '选择一个文件夹，把所有文件下载到此文件夹内', buttonLabel: '选择', properties: ['openDirectory'] }, (result: string[] | undefined) => {
            modalLoading.value = false
            if (result && result[0]) {
              settingData.SavePath = result[0]
            } else {
              message.error('没有选择任何文件')
            }
          })
        } else {
          message.error('没有检测到Electron， 请手动填写或粘贴')
        }
      }
      function handleSavePathSave() {
        modalLoading.value = true
        StoreConfig.aUpdateSetting({ key: 'SavePath', value: settingData.SavePath }).then(() => {
          StoreConfig.aRefresh()
          modalLoading.value = false
        })
      }

      function handleSavePathEveryTime() {
        modalLoading.value = true
        StoreConfig.aUpdateSetting({ key: 'SavePathEveryTime', value: settingData.SavePathEveryTime }).then(() => {
          modalLoading.value = false
        })
      }
      function handleRemotePassword() {
        modalLoading.value = true
        StoreConfig.aUpdateSetting({ key: 'RemotePassword', value: settingData.RemotePassword }).then(() => {
          modalLoading.value = false
        })
      }
      function handleTaskCountMax() {
        modalLoading.value = true
        StoreConfig.aUpdateSetting({ key: 'TaskCountMax', value: settingData.TaskCountMax }).then(() => {
          modalLoading.value = false
        })
      }
      function handleThreadCountMax() {
        console.log(settingData.ThreadCountMax)
        modalLoading.value = true
        StoreConfig.aUpdateSetting({ key: 'ThreadCountMax', value: settingData.ThreadCountMax }).then(() => {
          modalLoading.value = false
        })
      }
      function handleRunDownFinish() {
        modalLoading.value = true
        StoreConfig.aUpdateSetting({ key: 'RunDownFinish', value: settingData.RunDownFinish }).then(() => {
          modalLoading.value = false
        })
      }

      function handleUseVipVideoUrl() {
        modalLoading.value = true
        StoreConfig.aUpdateSetting({ key: 'UseVipVideoUrl', value: settingData.UseVipVideoUrl }).then(() => {
          modalLoading.value = false
        })
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
        settingData,
        LocalExeVer,
        handlePlayerPath,
        handlePlayerPathSave,
        handleSavePath,
        handleSavePathSave,
        handleSavePathEveryTime,
        handleRemotePassword,
        handleTaskCountMax,
        handleThreadCountMax,
        handleRunDownFinish,
        handleUseVipVideoUrl,
        handleCancel,
      }
    },
  })
</script>

<style>
  .taskcount label {
    padding: 0 20px;
  }

  .taskcount .ant-radio-button-wrapper.ant-radio-button-wrapper-checked {
    opacity: 0.9;
  }

  .settingform {
    padding: 0 18px;
  }
  div.br {
    line-height: 20px;
    height: 20px;
    width: auto;
  }

  .settingform .iconbulb {
    font-size: 14px;
    color: #faad14;
    margin-left: 8px;
  }

  .ant-popover-inner-content p {
    margin-bottom: 4px;
  }
  .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
    color: #df5659;
  }

  .ant-checkbox-wrapper .ant-checkbox-inner,
  .ant-checkbox .ant-checkbox-inner,
  .ant-checkbox-input + .ant-checkbox-inner {
    border-color: #df5659;
  }

  .settingform .ant-input-search-button {
    color: #df5659;
    border-color: #df5659;
  }
  .settingform .ant-input-search-button:hover,
  .settingform .ant-input-search-button:active {
    color: #df5659;
    background-color: rgba(207, 86, 89, 0.2);
  }

  .exever {
    display: inline-block;
    overflow: hidden;
    height: 25px;
  }
</style>
