<template>
  <a-modal key="ShowImageModal" :visible="checkShowModal" :width="dialogWidth" :dialogStyle="dialogStyle" title="" class="ShowImageModal" :footer="null" @cancel="handleCancel">
    <a-button class="fullscreen" type="link" @click="handleFullScreen"> <span class="iconfont iconfullscreen"></span>全屏 </a-button>
    <a-button class="refresh" type="link" @click="handleRefresh"> <span class="iconfont iconsync"></span>刷新 </a-button>
    <a-button class="title" type="link">
      {{ imagepage + imagetitle }}
    </a-button>

    <div class="goleft" @click="handleGoLeft"><span class="iconfont iconleft-circle"></span></div>
    <div class="goright" @click="handleGoRight"><span class="iconfont iconright-circle"></span></div>
    <div class="imgmodal">
      <a-spin :spinning="modalLoading" tip="图片加载中...  图片体积>5MB时加载非常慢" />
      <img id="shigmodal" :src="imagesrc" referrerpolicy="no-referrer" rel="no-referrer" />
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, watchEffect } from 'vue'
  import APIFile from '@/api/file'
  import APIPreview from '@/api/preview'
  import { StoreUI } from '@/store/ui'
  import { StoreUser } from '@/store/user'
  import { message } from 'ant-design-vue'
  import { StorePan } from '@/store/pan'
  import { SortNumber1 } from '@/store/sorterhelper'
  export default defineComponent({
    name: 'ShowImageModal',
    setup() {
      const checkShowModal = computed(() => StoreUI.Modal.ModalName === 'showimage')
      const modalLoading = ref(false)
      let fileItem = { key: '', path: '', name: '', sizestr: '' }
      let imagelist: any[] = []
      const imagetitle = ref('')
      const imagepage = ref('')
      const imagesrc = ref('')
      const imageindex = ref(0)
      const dialogWidth = ref('520px')
      const dialogStyle = ref({})

      watchEffect(() => {
        if (StoreUI.Modal.ModalName !== 'showimage') {
          modalLoading.value = false
        } else if (StoreUI.Modal.ModalData) {
          if (fileItem.key === StoreUI.Modal.ModalData.key) return
          fileItem = { ...StoreUI.Modal.ModalData }
          imagetitle.value = fileItem.name + '   ' + fileItem.sizestr
          imagelist = StorePan.panFileList.filter((it) => it.isimg && it.sizeint < 31457280).sort(SortNumber1)

          FindIndex()
          imagesrc.value = ''
          handleRefresh()
        } else {
          fileItem = { key: '', path: '', name: '', sizestr: '' }
          imagetitle.value = ''
          imagepage.value = ''
        }
      })
      function handleFullScreen() {
        if (dialogWidth.value !== '98%') {
          dialogWidth.value = '98%'
          dialogStyle.value = { top: '20px' }
        } else {
          dialogWidth.value = '520px'
          dialogStyle.value = {}
        }
      }
      function handleRefresh() {
        const userid = StoreUser.UserSelected.key
        if (userid === 'add') {
          message.error('请先登录一个6盘账号')
          return
        }
        modalLoading.value = true
        const ftest = () => {
          const img = document.getElementById('shigmodal') as any
          if (img && img.complete) {
            modalLoading.value = false
          } else {
            setTimeout(ftest, 500)
          }
        }
        APIPreview.PreviewImage(userid, fileItem.key).then((result) => {
          if (result) {
            imagesrc.value = result
            setTimeout(ftest, 500)
          } else {
            APIFile.DownloadAddress(userid, fileItem.key).then((resp) => {
              if (resp && resp.downloadAddress) {
                imagesrc.value = resp.downloadAddress
                setTimeout(ftest, 500)
              } else {
                imagesrc.value = ''
                modalLoading.value = false
              }
            })
          }
        })
      }

      function FindIndex() {
        imageindex.value = -1
        for (let i = 0; i < imagelist.length; i++) {
          if (imagelist[i].key === fileItem.key) {
            imageindex.value = i
            break
          }
        }
        if (imageindex.value >= 0) {
          imagepage.value = '[ ' + (imageindex.value + 1) + '/' + imagelist.length + ' ]'
        } else {
          imagepage.value = ''
        }
      }

      function handleGoLeft() {
        const index = imageindex.value
        if (index <= 0) {
          message.info('已经是第一张图片')
          return
        }
        StoreUI.mShowModal({ ModalName: 'showimage', ModalData: imagelist[index - 1] })
      }
      function handleGoRight() {
        let index = imageindex.value
        if (index < 0) index = 0
        const max = imagelist.length - 1
        if (index >= max) {
          message.info('已经是最后一张图片')
          return
        }
        StoreUI.mShowModal({ ModalName: 'showimage', ModalData: imagelist[index + 1] })
      }
      function handleCancel() {
        StoreUI.mCloseModal()
      }

      return {
        checkShowModal,
        modalLoading,
        imagetitle,
        imagepage,
        imagesrc,
        imageindex,
        dialogWidth,
        dialogStyle,
        handleFullScreen,
        handleRefresh,
        handleCancel,
        handleGoLeft,
        handleGoRight,
      }
    },
  })
</script>

<style>
  .ShowImageModal .imgmodal {
    width: 100%;
    min-height: 360px;
    padding-top: 32px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .ShowImageModal .imgmodal img {
    width: 100%;
    margin: auto;
    object-fit: contain;
  }
  .ShowImageModal .fullscreen {
    position: absolute;
    top: 12px;
    left: 6px;
    line-height: 18px;
  }
  .ShowImageModal .fullscreen > span {
    line-height: 18px;
  }
  .ShowImageModal .refresh {
    position: absolute;
    top: 12px;
    left: 80px;
    line-height: 18px;
  }
  .ShowImageModal .refresh > span {
    line-height: 18px;
  }

  .ShowImageModal .title {
    position: absolute;
    top: 12px;
    left: 160px;
    overflow: hidden;
    max-width: 60%;
    text-overflow: ellipsis;
    line-height: 18px;
  }
  .ShowImageModal .fulls {
    width: 100%;
    top: 0;
  }
  .ShowImageModal .ant-modal-body {
    position: relative;
  }
  .ShowImageModal .goleft {
    left: 1px;
  }
  .ShowImageModal .goright {
    right: 1px;
  }

  .ShowImageModal .goleft,
  .ShowImageModal .goright {
    width: 35px;
    height: 35px;
    font-size: 35px;
    line-height: 35px;
    color: #df5659;
    background-color: rgb(255, 255, 255);
    border-radius: 35px;
    opacity: 0.8;

    position: absolute;
    top: 50%;
    display: block;
    padding: 0;
    border: 0;
    cursor: pointer;
    z-index: 9;
  }
  .ShowImageModal .goleft .iconfont,
  .ShowImageModal .goright .iconfont {
    font-size: 35px;
    line-height: 35px;
    color: #df5659;
  }
</style>
