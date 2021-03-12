<template>
<div class="safe-upload-image-wrapper">
  <el-upload
    accept='.jpg, .png, .jpeg, .JPG, .PNG, .JPEG'
    :action="`/safety/safety-common-service/oss/upload/safe/${moduleName}`"
    :before-upload="handleBefore"
    :on-progress="handleProgress"
    :on-success="handleSuccess"
    :on-exceed="handleExceed"
    :on-error="handleError"
    :on-remove="handleRemove"
    :on-preview="handlePreview"
    :on-change="handleChange"
    :disabled="isUploading"
    :show-file-list="true"
    :file-list="fileListCopy"
    :limit="limitCount"
    multiple
    list-type="picture-card"
    name="uploadFile"
    :class="{'safe-hide-upload': hideUpload}"
    class="safe-upload-image">
    <span class="el-icon-plus">
      <span style="display: block; font-size: 12px; position: relative;">点击上传</span>
    </span>
  </el-upload>
  <span v-if="disabled && fileListCopy.length === 0">未上传照片</span>
</div>
</template>

<script>
export default {
  name: 'UploadImage',
  props: {
    fileList: { // 回显需要，把后端返回的格式直接传入就行
      type: Array,
      default () {
        return []
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    maxSize: {
      type: Number,
      default: 10
    },
    moduleName: {
      type: String,
      default: 'ContingencyManage'
    },
    fileNameLength: {
      type: Number,
      default: 50
    },
    limitCount: {
      type: Number,
      default: 10
    }
  },
  watch: {
    fileList (val) {
      this.attaches = val
      this.fileListCopy = []
      val.forEach(item => {
        const smallImgUrl = item.smallImgUrl ? item.smallImgUrl : this.getObjectURL(item.raw)
        const imageUrl = item.fileUrl ? item.fileUrl : this.getObjectURL(item.raw)
        const uid = item.id ? item.id : item.uid
        this.chkImgs.push({
          uid: uid,
          smallImgUrl: smallImgUrl,
          imageUrl: imageUrl
        })
        this.fileListCopy.push({
          name: item.name,
          url: smallImgUrl,
          key: item.key,
          id: item.id
        })
      })
      this.hideUpload = this.fileListCopy.length >= this.limitCount || this.disabled
    }
  },
  data () {
    return {
      isUploading: false,
      hideUpload: false,
      imageTypes: ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG'],
      chkImgs: [],
      attaches: [],
      timer: null,
      fileListCopy: []
    }
  },
  computed: {
  },
  methods: {
    handleBefore (file) {
      let site = file.name.lastIndexOf('.')
      let fileType = file.name.substring(site + 1, file.name.length)
      this.isUploading = true
      if (file.name.length > this.fileNameLength) {
        this.$message({
          showClose: true,
          message: `图片名称超出${this.fileNameLength}字，请重新上传`,
          type: 'error'
        })
        this.isUploading = false
        return false
      } else if (file.size > this.maxSize * 1024 * 1024) {
        this.$message({
          showClose: true,
          message: `附件不能超过${this.maxSize}M!`,
          type: 'error'
        })
        this.isUploading = false
        return false
      } else if (!this.imageTypes.includes(fileType)) {
        this.$message({
          showClose: true,
          message: '请上传.jpg、.jpeg、.png、.JPEG、.JPG、.PNG格式图片',
          type: 'error'
        })
        this.isUploading = false
        return false
      } else {
        return true
      }
    },
    // 照片上传时
    handleProgress (event, file, fileList) {
      this.isUploading = true
    },
    // 照片上传成功
    handleSuccess (response, file, fileList) {
      this.isUploading = false
      response[0].name = response[0].fileName
      response[0].uid = file.uid
      response[0].url = this.getObjectURL(file.raw)
      this.attaches.push(response[0])
      this.chkImgs = []

      if (this.imageTypes.includes(response[0].extensionName)) {
        fileList.forEach(item => {
          const smallImgUrl = item.url ? item.url : this.getObjectURL(item.raw)
          const imageUrl = item.url ? item.url : this.getObjectURL(item.raw)
          const uid = item.id ? item.id : item.uid
          this.chkImgs.push({
            uid: uid,
            smallImgUrl: smallImgUrl,
            imageUrl: imageUrl
          })
        })
      }
      this.emitChange()
    },
    // 生成本地预览路径
    getObjectURL (file) {
      let url = null
      if (window.URL !== undefined) { // basic
        url = window.URL.createObjectURL(file)
      } else if (window.webkitURL !== undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file)
      } else if (window.URL !== undefined) { // mozilla(firefox)
        url = window.URL.createObjectURL(file)
      }
      return url
    },
    // 照片超出个数限制
    handleExceed (files, fileList) {
      this.$message.warning(`最多只能上传 ${this.limitCount} 张照片`)
    },
    // 照片上传失败
    handleError (err, file, fileList) {
      this.isUploading = false
      this.$message.error(err)
    },
    // 删除文件
    handleRemove (file, fileList) {
      this.hideUpload = fileList.length >= this.limitCount
      let arr = this.attaches.filter(item => {
        return item.key !== (file.response ? file.response[0].key : file.key)
      })
      this.attaches = arr
      this.chkImgs = []
      fileList.forEach(item => {
        const smallImgUrl = item.url ? item.url : this.getObjectURL(item.raw)
        const imageUrl = item.url ? item.url : this.getObjectURL(item.raw)
        const uid = item.id ? item.id : item.uid
        this.chkImgs.push({
          uid: uid,
          smallImgUrl: smallImgUrl,
          imageUrl: imageUrl
        })
      })
      this.emitChange()
    },
    // 预览照片
    handlePreview (file) {
      this.chkImgs.forEach((item, index) => {
        if (String(file.uid) === String(item.uid) || String(file.id) === String(item.uid)) {
          this.openImgModal({
            index: index,
            attachs: this.chkImgs
          })
        }
      })
    },
    handleChange (file, fileList) {
      this.hideUpload = fileList.length >= this.limitCount
    },
    emitChange () {
      this.$emit('file-change', this.attaches)
    },
    // 查看大图
    openImgModal (params) {
      this.$emit('img-pre-view', params)
    }
  }
}
</script>

<style lang="less">
#app .el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
  i {
    margin-top: 25px;
  }
}
.safe-hide-upload .el-upload--picture-card {
  display: none;
}
.safe-upload-image {
  .el-upload--picture-card {
    width: 100px;
    height: 100px;
    line-height: 100px;
    i {
      margin-top: 25px;
    }
  }
  .el-upload-list__item {
    width: 100px;
    height: 100px;
  }
  .el-icon-plus {
    font-size: 16px;
  }
}
</style>
