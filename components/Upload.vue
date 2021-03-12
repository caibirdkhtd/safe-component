<!-- 上传组件封装 -->
<template>
  <el-upload
      ref="uploadFile"
      name="uploadFile"
      action=""
      :http-request="handleUploadFile"
      :before-upload="handleBefore"
      :on-progress="handleProgress"
      :on-exceed="handleExceed"
      :on-error="handleError"
      :before-remove="handleBeforeRemove"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :on-change="handleChange"
      :disabled="isUploading"
      :show-file-list="showFileList"
      :file-list="fileList"
      :limit="limitCount"
      :multiple="multiple"
      :list-type="listType"
      :drag="drag"
      :class="{'hide-upload': canEdit}"
      class="safe-upload">
    <slot>
      <div v-loading="isUploading" v-if="drag" class="safe-upload-wrapper">
        <div class="el-upload__text">
          <i class="el-icon-upload"></i>
          <div class="sf-tip">将文件拖到此处，或<em>点击上传</em></div>
        </div>
      </div>
      <el-button v-else-if="listType==='text'" size="small" type="primary">点击上传</el-button>
      <i v-else class="el-icon-plus">
        <span style="display: block; font-size: 12px; position: relative;">点击上传</span>
      </i>
    </slot>
  </el-upload>

</template>
<script>
import FileService from '../lib/file-server'
export default {
  name: 'Upload',
  components: {},
  props: {
    moduleName: {
      type: String,
      require: true
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    limitCount: {
      type: Number,
      default: 11
    },
    showFileList: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: false
    },
    listType: {//	text/picture/picture-card
      type: String,
      default: 'text'
    },
    maxSize: {// 文件最大15M
      type: Number,
      default: 15
    },
    fileType: {
      type: String,
      default: 'all'// 支持all全部  ，image：图片格式
    },
    fileTypeArray: {
      type: Array,
      default() {
        return []
      }
    },
    maxFileNameLength: { // 文件名最大长度
      type: Number,
      default: 100
    },
    drag: { // 拖拽
      type: Boolean,
      default: false
    },
    persistKey: { // 上传后直接持久化key
      type: Boolean,
      default: true
    },
    fileList: {
      type: Array,
      default() {
        return []
      }
    },
  },
  data () {
    return {
      // 上传文件
      isUploading: false,
      fileNum: 0,
      successNum: 0, // element上传是一张一张进行的，等待所有文件上传完成后，会一起入库的操作
      uploadfileList: [],
      uploadOssKeyList: [],
      imageTypes: ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG']
    }
  },
  computed: {


  },

  mounted () {
    // this.init()
  },
  methods: {
    init () {
      this.fileNum = 0
      this.successNum = 0
      this.uploadfileList = []
      this.uploadOssKeyList = []
      this.$refs.uploadFile.clearFiles()
    },
    handleBefore (file) {

      this.isUploading = true
      let site = file.name.lastIndexOf('.')
      let fileType = file.name.substring(site + 1, file.name.length)
      if (file.name.length >= this.maxFileNameLength + 5) {
        this.$message({
          showClose: true,
          message: '文件名太长了，请重新上传',
          type: 'error'
        })
        this.$emit('error-upload')
        this.isUploading = false
        return false
      } else if (file.size > this.maxSize * 1024 * 1024) {
        this.$message({
          showClose: true,
          message: `上传文件不能超过${this.maxSize}M!`,
          type: 'error'
        })
        this.$emit('error-upload')
        this.isUploading = false
        return false
      } else if (this.fileType === 'image' && !this.imageTypes.includes(fileType)) {
        this.$message({
          showClose: true,
          message: '请上传.jpg、.jpeg、.png、.JPEG、.JPG、.PNG格式图片',
          type: 'error'
        })
        this.$emit('error-upload')
        this.isUploading = false
        return false
      } else if (this.fileTypeArray.length > 0 && !this.fileTypeArray.includes(fileType)) {
        this.$message({
          showClose: true,
          message: `请上传${this.fileTypeArray.join('、')}格式的文件`,
          type: 'error'
        })
        this.$emit('error-upload')
        this.isUploading = false
        return false
      } else if(this.verifySameName(file.name)){
        this.$message({
          showClose: true,
          message: `已存在名称为${file.name}的附件,不能重复上传!`,
          type: 'error'
        })
        this.$emit('error-upload')
        this.isUploading = false
        return false
      }
      else {
        this.fileNum++
        return true
      }
    },
    verifySameName(name){
      if(this.fileList && this.fileList.length>0){
        let dest = this.fileList.find(ele=>{return name===ele.name})
        if(dest){
          return true
        }
      }
      return false
    },
    handleProgress (event, file, fileList) {
      this.$emit('start-upload')
      this.isUploading = true
    },
    handleError (err, file, fileList) {
      this.isUploading = false
      this.$emit('error-upload')
      this.$message({ showClose: true, message: err, type: 'error' })
    },

    handleBeforeRemove (file, fileList) {

    },
    // 删除文件
    handleRemove (file, fileList) {

    },
    handleExceed (files, fileList) {
      let maxLimitCount = this.limitCount
      if(this.fileList && this.fileList.length>0){
        maxLimitCount = this.limitCount - this.fileList.length
      }
      this.$message.error(`当前限制选择 ${maxLimitCount} 个文件，本次选择了 ${files.length} 个文件！`)
    },
    handlePreview (file, fileList) {

    },
    handleChange (file, fileList) {
      this.$emit('file-change', file, fileList)
    },

    handleUploadFile(fileObj){
      const files = [fileObj.file]
      let fs = new FileService({
        __blockSize: 5 * 1024 * 1024,
        __maxSize: this.maxSize * 1024 * 1024,
        moduleName: this.moduleName,
        curfile: fileObj,
        isUploading: true
      })

      //假的进度条
      let percent = 20
      let step = 20
      if (fileObj.file.size > 50 * 1024 * 1024) {
        percent = 5
        step = 5
      }


      let watchFinished = setInterval(() => {
        if (fs.options.isUploading && (percent+step) < 100) {
          percent += step
          fs.options.curfile.onProgress({ percent: percent })
        } else {
          clearInterval(watchFinished)
        }
      }, 1000)

      let finishCallback = (keys, filesInfo, res) => {
        fs.options.isUploading = false
        clearInterval(watchFinished)
        fs.options.curfile.onProgress({ percent: 100 })

        this.successNum++

        let file = filesInfo[0]
        file.key = file.targetKey
        file.fileName = file.id
        file.id = null
        file.extensionName = file.fileName.split('.').pop()


        this.uploadOssKeyList.push(file.key)
        this.uploadfileList.push(file)

        if (this.fileNum === this.successNum) {
          this.isUploading = false
          this.$emit('uploadFinish', this.uploadOssKeyList,this.uploadfileList)
          this.init()
        }

      }

      if(this.persistKey){
        fs.uploadAndPersist(files, finishCallback )
      }else{
        fs.upload(files, finishCallback)
      }

    }

  }
}
</script>
<style lang="less">
.safe-upload {
  .el-upload-dragger{
    height: 50px !important;
  }

  .safe-upload-wrapper {
    height: 100% !important;
    padding: 5px;

    .el-icon-upload {
      position: relative;
      top: 3px;
      margin: 0 !important;
      margin-right: 4px !important;
      font-size: 28px;
      line-height:1;
    }
    .sf-tip{
      display: inline-block;
      line-height: 28px;
    }
  }
}
</style>
