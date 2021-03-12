<!-- 批量导入
<file-import 
:templateUrl="templateUrl" 
:action="action" 
@watchUpload="getUploadResult">
</file-import> -->
<template>
  <div>
      <el-button-group>
          <el-button type="primary" @click="importFile" size="medium" >批量导入</el-button>
          <el-button @click="downloadFile" size="medium">下载模版</el-button>
      </el-button-group>
      <div id="containerId" style="display: none">
          <iframe id="frame-import-file" name="frameId">
          </iframe>
          <form id="formId" :action="actionPath" method="post" enctype="multipart/form-data" target="frameId">
              <input id="btnImport-file" class="fileClass" type="file" name="uploadFile" accept=".xls,.xlsx"
                     @change="uploadFile">
              <input id="btnImport-file-submit" type="submit" name="submit" style="display: none">
              <input id="btnImport-file-reset" type="reset" name="reset" style="display: none">
              <button id="btnImport-file-progress-btn" type="button" modal-action="open"
                      modal-target="#import-result-dialog" style="display: none" />
          </form>
      </div>

  </div>
</template>

<script>
export default {
name: 'FileImport',
data () {
  return {
    actionPath: ''
  }
},
props: {
  templateUrl: {
    required: true,
    type: String
  },
  action: {
    required: true,
    type: String
  },
  isPrivateLib: {
    required: false,
    type: Boolean,
    default:true
  },
  pubMessage: {
    required: false,
    type: String,
    default:'当前正在使用公有库, 是否继续导入?'
  },
  privateMessage: {
    required: false,
    type: String,
    default:'此操作可能会影响已存在的数据, 是否继续导入?'
  },
},
methods: {
  downloadFile () {
    window.open(this.templateUrl)
  },
  importFile () {
    this.$confirm(this.isPrivateLib?this.privateMessage:this.pubMessage, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      this.uuid = this.generateUUID()
      this.actionPath = this.action + this.uuid
      this.$nextTick(() => {
        (document.getElementById('btnImport-file-reset')).click()
        ;(document.getElementById('btnImport-file')).click()
      })
    })
  },
  generateUUID () {
    let d = new Date().getTime()
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      let r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    return uuid
  },
  uploadFile (e) {
    let fileObj = e.target.files[ 0 ]
    let fileSize = fileObj.size
    if (fileSize > 1 * 1024 * 1024) {
      this.$message.error('上传文件不能大于1M')
      return
    }
    this.$message('正在导入，请稍候。。。')
    this.isLoading = true
    ;(document.getElementById('btnImport-file-submit')).click()
    ;(document.getElementById('btnImport-file-progress-btn')).click()
    this.getUploadResult()
  },

  getUploadResult () {
    this.$emit('watchUpload', this.uuid)
  }
}

}
</script>
<style>
</style>
