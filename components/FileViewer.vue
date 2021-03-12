<template>
  <div class="FileViewer-Wrapper">
    <img-modal-view
        v-if="!isIframe"
        show-download-btn
        :childImgDlgDisplay="imgDlgDisplay"
        :childInspectAttachs="inspectAttaches"
        :childImageIndex="imageIndex"
        @changeImgDlgDisplay="updateImgDlgDisplay"
        @download-file="downloadFile"
        @changeImageIndex="updateImageIndex">
    </img-modal-view>
    <el-dialog
        :title="fileName"
        custom-class="FileViewer-Wrapper"
        append-to-body
        :visible.sync="showDialog"
        top="1vh"
        width="90%"
        :before-close="handleDialogClose"
    >
      <div slot="title">
        {{fileName}}
        <i class="iconfont icon-download-copy"
           style="padding-left: 20px; cursor: pointer;"
           title="下载" @click="downloadFile"></i>
      </div>
      <iframe
          :title="fileName"
          :src="iframeUrl"
          width="100%"
          border-top-width="0px"
          border-right-width="0px"
          border-bottom-width="0px"
          border-left-width="0px"
          :height="bodyHeight - (isLowScreen ? 0 : 100) + 'px'"
      ></iframe>
    </el-dialog>
  </div>
</template>
<script>
import ImgModalView from 'safe-component/components/imgModalView.vue'
import { DialogTableSizeMixin, downLoadMixin, getFileUrl } from 'safe-component'

export default {
  name: 'FileViewer',
  components: {
    ImgModalView
  },
  mixins: [downLoadMixin, DialogTableSizeMixin],
  props: {
    fileObject: {
      type: Object,
      required: true
    }
  },
  computed: {
    fileOssKey () {
      return this.fileObject.fileOssKey || this.fileObject.ossKey
    },
    fileType () {
      return this.fileObject.fileType
    },
    fileUrl () {
      return this.fileObject.fileUrl
    },
    fileName () {
      return this.fileObject.fileName || this.fileObject.name || '查看Office文件'
    }
  },
  data () {
    return {
      isIframe: false,
      imgDlgDisplay: 'none', // 是否显示浏览图片窗口
      inspectAttaches: [], // 浏览图片时该组图片对象
      imageIndex: 0, // 记录浏览图片时当前是第几张
      showDialog: false,
      iframeUrl: ''
    }
  },
  methods: {
    handleDialogClose () {
      window.parent[ 'closeFullScreen' ] && window.parent[ 'closeFullScreen' ]()
      this.showDialog = false
    },
    checkHeight () {
      this.bodyHeight = document.body.clientHeight
      this.isLowScreen = document.body.clientHeight < 780
      this.tableHeight = this.isLowScreen ? 300 : 480
    },
    checkFileType () {
      const imageVideoType = ['png', 'jpeg', 'jpg', 'mp4']
      const pdfType = ['pdf']
      const officeType = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']
      // const officeType = ['doc', 'docx', 'ppt', 'pptx']
      // const execlType = ['xls', 'xlsx']
      this.$nextTick(() => {
        const allOpenableTypes = imageVideoType.concat(pdfType, officeType)
        if (allOpenableTypes.includes(this.fileType)) {
          if (imageVideoType.includes(this.fileType)) {
            this.checkFileUrl(this.openImageVideoModel)
          }
          if (pdfType.includes(this.fileType)) {
            this.checkFileUrl(this.openPdfFile)
          }
          if (officeType.includes(this.fileType)) {
            this.checkFileUrl(this.openOfficeFile)
          }
        } else {
          this.$message.error('本文件不支持预览，请在下载后自行查看！')
          this.downloadFile()
        }
      })
    },
    openOfficeFile (fileUrl) {
      if (this.isLowScreen) {
        window.parent[ 'openFullScreen' ] && window.parent[ 'openFullScreen' ]()
      }
      this.$nextTick(() => {
        this.iframeUrl = 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(fileUrl)
        this.showDialog = true
      })
    },
    openPdfFile (fileUrl) {
      if (this.isLowScreen) {
        window.parent[ 'openFullScreen' ] && window.parent[ 'openFullScreen' ]()
      }
      this.$nextTick(() => {
        this.iframeUrl = '/safe-static/assets/pdf/web/viewer.html?file=' + encodeURIComponent(fileUrl)
        this.showDialog = true
      })
    },
    openImageVideoModel (fileUrl) {
      const attach = [{
        extensionName: this.fileType === 'mp4' ? 'VIDEO' : 'PICTURE',
        smallImgUrl: fileUrl,
        imageUrl: fileUrl
      }]
      this.inspectAttaches = attach
      this.displayImage()
    },
    checkFileUrl (cb) {
      if (this.fileUrl) {
        cb(this.fileUrl)
      } else {
        getFileUrl(this.fileOssKey).then(data => {
          cb(data.result)
        })
      }
    },
    downloadFile () {
      this.$nextTick(() => {
        this.checkHeight()
        if (this.fileUrl) {
          this.downloadByIframe(this.fileUrl)
        } else {
          this.downLoadFile(this.fileOssKey)
        }
      })
    },
    displayImage () {
      this.imgDlgDisplay = 'block'
    },
    updateImgDlgDisplay (style) {
      if (style === 'none') {
        window.parent[ 'closeFullScreen' ] && window.parent[ 'closeFullScreen' ]()
      }
      this.imgDlgDisplay = style
    },
    updateImageIndex (index) {
      this.imageIndex = index
    }
  }
}
</script>
<style lang="less">
.FileViewer-Wrapper {
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 0;
  }
  &.el-dialog{
    margin: 0 auto;
  }
}
</style>
