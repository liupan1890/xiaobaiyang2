<template>
  <a-modal key="settingModal" :visible="checkShowModal" title="" :footer="null" @cancel="handleSettingCancel">
    <a-divider orientation="left">
      APP设置
      <small>{{ exeVer }}</small>
    </a-divider>
    <br />
    <a-form layout="vertical" class="settingform">
      <a-form-item label="远程管理密码" help="默认密码为空，关闭远程管理功能">
        <a-input v-model="dataPassword" spellcheck="false" />
      </a-form-item>
      <br />
      <a-form-item label="下载保存位置" help="下载文件会按6盘里完整路径保存，这里选短点例如 D:\Down\">
        <a-input-search v-model="dataSavePath" @search="handleSelectSavePath" spellcheck="false">
          <a-button :loading="SavePathLoading" icon="folder" type="primary" slot="enterButton">
            选择
          </a-button>
        </a-input-search>
      </a-form-item>
      <a-form-item style="margin-bottom:5px;">
        <a-popover title="下载完成后调用命令帮助">
          <template slot="content">
            <p>勾选后，每次点击下载按钮，都会弹窗显示选择下载保存位置</p>
            <p>不勾选，每次点击下载按钮，直接下载保存到上面的路径</p>
            <p>推荐不勾选</p>
          </template>
          <a-checkbox v-model="dataSavePathEveryTime" style="color:#df5659">
            每次下载时都要求我选择下载位置
          </a-checkbox>
        </a-popover>
      </a-form-item>
      <br />
      <a-form-item label="播放器文件">
        <a-input-search v-model="dataPlayerPath" @search="handleSelectPlayerPath" spellcheck="false">
          <a-button :loading="SavePathLoading" icon="folder" type="primary" slot="enterButton">
            选择
          </a-button>
        </a-input-search>
        <br />
        <a-popover title="播放器文件帮助">
          <template slot="content">
            <p>windows=播放器.exe文件的完整路径,下载自带VLC的版本已自动填好了</p>
            <p>linux=vlc或smlpayer,其他的播放器填写播放器名</p>
            <p>
              mac=vlc或iina或omniplayer,其他的播放器填
              <a>/Applications/xxx.app</a>
              完整路径
            </p>
            <p>
              程序底层是调用命令
              <a>"你填的" + "视频下载URL"</a>
              需要自己先装一个视频播放软件
            </p>
          </template>
          <a>
            点我看帮助信息
          </a>
        </a-popover>
      </a-form-item>
      <a-form-item label="同时上传/下载任务数">
        <a-select v-model="dataTaskCount" style="width: 190px">
          <a-select-option value="1">
            1个文件同时启动
          </a-select-option>
          <a-select-option value="2">
            2个文件同时启动
          </a-select-option>
          <a-select-option value="3">
            3个文件同时启动(推荐)
          </a-select-option>
          <a-select-option value="4">
            4个文件同时启动
          </a-select-option>
        </a-select>

        <a-select v-model="dataThreadCount" style="width: 196px;margin-left:50px">
          <a-select-option value="1">
            每个文件1个线程
          </a-select-option>
          <a-select-option value="5">
            每个文件5个线程(推荐)
          </a-select-option>
          <a-select-option value="10">
            每个文件10个线程(推荐)
          </a-select-option>
          <a-select-option value="15">
            每个文件15个线程
          </a-select-option>
        </a-select>
        <br />
        <a-popover title="同时下载任务数帮助">
          <template slot="content">
            <p>6盘限制最多3个文件同时下载，每个文件最多5个线程，下载中不能换IP</p>
            <p>超过限制会被限速或403或连接被拒绝，要等几分钟或几小时后才恢复正常</p>
            <p>免费用户走免费线路，VIP走专属线路，下载速度有差异，具体限制也不同</p>
            <p>免费用户更容易触发限速！所以有时候下载速度很慢，可能是被限速了</p>
            <p>PS:触发限速，重启下光猫换个IP,一般就复活了</p>
          </template>
          <a>
            点我看帮助信息
          </a>
        </a-popover>
      </a-form-item>
      <a-form-item style="margin-bottom:15px;">
        <a-popover title="VIP账号优先使用m3u8预览链接帮助">
          <template slot="content">
            <p>勾选后，VIP账号点击视频文件的预览按钮时</p>
            <p>1. 如果有对应的m3u8预览链接,返回m3u8</p>
            <p>2. 找不到，则返回原始视频文件的链接</p>
            <p></p>
            <p>
              部分视频6盘会提供m3u8预览链接，理论上更适合在线观看
              <br />
              加载速度快，跳播不卡，但此功能仅对6盘VIP用户开放
            </p>
          </template>
          <a-checkbox v-model="dataUseVipVideoUrl" style="color:#df5659">
            VIP账号优先使用m3u8预览链接(推荐)
          </a-checkbox>
        </a-popover>
      </a-form-item>
      <a-form-item style="margin-bottom:5px;">
        <a-popover title="下载完成后调用命令帮助">
          <template slot="content">
            <p>勾选后，会按照aria2的方式，每下载完一个文件后都自动调用脚本命令</p>
            <p><a>默认不勾选，且大部分用户用不到此功能，请直接忽略此项</a></p>
            <p>1. 默认没有脚本文件，需要用户自己创建脚本文件</p>
            <p>2. 脚本文件必须命名为downfinish.sh(linux,mac)/downfinish.cmd(win)</p>
            <p>3. 脚本文件必须放在6panserver(.exe)文件同一目录</p>
            <p>4. aria2返回的参数为#1 GID,#2 FileNum,#3 FilePath</p>
            <p>5. 自动调用执行脚本操作,可能会被安全软件报告为病毒!请悉知</p>
          </template>
          <a-checkbox v-model="dataRunDownFinish" style="color:#df5659">
            下载完成后调用脚本命令downfinish(.sh/.cmd)
          </a-checkbox>
        </a-popover>
      </a-form-item>
      <br />
      <a-form-item style="text-align:right;margin-bottom:0">
        <span class="ant-form-explain" style="color: #f5222d;padding-right:24px">{{ modalError }}</span>
        <a-button :loading="modalLoading" type="primary" @click="handleSettingSave">
          保存设置
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
export default {
  name: "SettingModal",
  data: function() {
    return {
      modalLoading: false,
      modalError: "",
      SavePathLoading: false,
      dataPlayerPath: "",
      dataSavePath: "",
      dataSavePathEveryTime: false,
      dataPassword: "",
      dataTaskCount: "",
      dataThreadCount: "",
      dataRunDownFinish: false,
      dataUseVipVideoUrl: false,
    };
  },
  components: {},
  computed: {
    checkShowModal: function() {
      return this.$store.state.UI.modalname == "setting";
    },
    exeVer: function() {
      return this.$store.state.UI.exeVer;
    },
  },
  watch: {
        checkShowModal: function() {
      if (this.$store.state.UI.modalname == "setting") {
        this.dataTaskCount = this.$store.state.UI.ConfigTaskCountMax + "";
        this.dataThreadCount = this.$store.state.UI.ConfigThreadCountMax + "";
        this.dataPassword = this.$store.state.UI.ConfigRemotePassword;
        this.dataSavePath = this.$store.state.UI.ConfigSavePath;
        this.dataSavePathEveryTime = this.$store.state.UI.ConfigSavePathEveryTime;
        this.dataPlayerPath = this.$store.state.UI.ConfigPlayerPath;
        this.dataRunDownFinish = this.$store.state.UI.ConfigRunDownFinish;
        this.dataUseVipVideoUrl = this.$store.state.UI.ConfigUseVipVideoUrl;
      } else {
        this.modalLoading = false;
        this.modalError = "";
        this.SavePathLoading = false;
      }
    },
  },
  methods: {
    handleSelectSavePath: function() {
      this.SavePathLoading = true;
      this.$store.dispatch("UI/aSelectSavePath").then((resp) => {
                this.SavePathLoading = false;
        if (resp.code == 0) {
          this.dataSavePath = resp.selectdir;
        } else {
          this.$message.error(resp.message);
        }
      });
    },
    handleSelectPlayerPath: function() {
      this.SavePathLoading = true;
      this.$store.dispatch("UI/aSelectPlayerPath").then((resp) => {
                this.SavePathLoading = false;
        if (resp.code == 0) {
          this.dataPlayerPath = resp.selectfile;
        } else {
          this.$message.error(resp.message);
        }
      });
    },

        handleSettingSave: function() {
      let taskcount = parseInt(this.dataTaskCount);
      if (taskcount > 4) taskcount = this.$store.state.UI.ConfigTaskCountMax;
      if (taskcount < 0) taskcount = this.$store.state.UI.ConfigTaskCountMax;
      let threadcount = parseInt(this.dataThreadCount);
      if (threadcount > 15) threadcount = this.$store.state.UI.ConfigThreadCountMax;
      if (threadcount < 0) threadcount = this.$store.state.UI.ConfigThreadCountMax;
      let everytime = this.dataSavePathEveryTime;
      let runfinish = this.dataRunDownFinish;
      let usevipvideo = this.dataUseVipVideoUrl;
      this.modalLoading = true;
      this.$store.dispatch("UI/aSaveConfig", { pwd: this.dataPassword, savepath: this.dataSavePath, everytime, playerpath: this.dataPlayerPath, taskcount, threadcount, runfinish, usevipvideo }).then((resp) => {
                this.modalLoading = false;
        if (resp.code == 0) {
          this.$store.dispatch("UI/aNotice");
          this.$message.success("设置保存成功");
          this.$store.commit("UI/mShowModal", { name: "", data: {} });
        } else {
          this.$message.error(resp.message);
        }
      });
    },
        handleSettingCancel: function() {
      if (this.modalLoading) {
        this.$message.error("正在执行操作中，完成后自动关闭");
        return false;
      }
      this.modalLoading = false;
      this.modalError = "";
      this.$store.commit("UI/mShowModal", { name: "", data: {} });
    },
  },
};
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
</style>
