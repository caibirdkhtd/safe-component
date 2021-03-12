<!--
    /**
     * 方式2：查看隐患详情对话框：(包括图片浏览弹窗、参考依据弹窗),隐患详情组件使用iframe嵌入
     * 这个和方式1 inspect/inspect-record/components/下的DangerDetailDialog.vue有区别，方式1下有编辑操作
     * 使用场景：任何页面中【查看】-【隐患详情弹窗】
     * @author zhanghw-d
     * @date 2019-08-21
     * 调用示例：
    <danger-detail-dialog
      v-if="showDetailDialog"
      :inspectId="dangerDetail.id"
      @close="closeDetailDialog"
      >
     </danger-detail-dialog>
-->
<template>
    <div>
        <el-dialog
                class="dangerDetailDialog"
                :close-on-click-modal="false"
                title="查看详情"
                top="10vh"
                :visible.sync="showDialog"
                :width="width"
                :before-close="handleDialogClose"
                :append-to-body="appendToBody">
            <iframe
                    :src="detailPage"
                    ref="ifamePage"
                    width="100%"
                    height="600"
                    frameborder="no"
                    border="0"
                    marginwidth="0"
                    marginheight="0"
                    @load="getData"
            >
                <p>您的浏览器不支持iframe标签</p>
            </iframe>
        </el-dialog>
        <!-- 图片浏览组件：小窗口中iframe页面将弹出图片浏览限制在小窗口，因此在该父页面重新定义 -->
        <img-modal-view
                :childImgDlgDisplay="imgDlgDisplay"
                :childInspectAttachs="inspectAttachs"
                :childImageIndex="imageIndex"
                @changeImgDlgDisplay="updateImgDlgDisplay"
                @changeImageIndex="updateImageIndex">
        </img-modal-view>
        <!-- 参考依据组件：小窗口中iframe页面将新弹窗限制在小窗口，因此在该父页面重新定义 -->
        <ViewSpecificationDialog
                v-if="showSpecificationDialog"
                :temRelationArr="temRelationArr"
                @close="closeSpecificationDialog"
        >
        </ViewSpecificationDialog>

    </div>

</template>
<script>
  import ImgModalView from 'safe-component/components/imgModalView.vue'
  import ViewSpecificationDialog from 'safe-component/components/ViewSpecificationDialog.vue'
  export default {
    name: 'DangerDetail',
    components: { ImgModalView, ViewSpecificationDialog },
    props: {
      width: {
        type: [String, Number],
        default: '1000px'
      },
      height: {
        type: [String, Number],
        default: '100%'
      },
      inspectId: {
        type: String,
        required: true,
        default: ''
      },
      recordInfo: {// 之后各个模块排查记录和检查台账区分，因此要传类型,目前定义为和隐患过滤一致
        type: Object,
        required: false
      },
      appendToBody: {
        type: Boolean,
        default: false
      },
    },
    data () {
      return {
        imgDlgDisplay: 'none', // 是否显示浏览图片窗口
        inspectAttachs: [], // 浏览图片时该组图片对象
        imageIndex: 0, // 记录浏览图片时当前是第几张
        showDialog: true,
        showSpecificationDialog: false,
        style: `height:${this.height}px`,
        temRelationArr: []
      }
    },
    mounted () {
      this.$nextTick(() => {
        // 接受子窗口事件，调用父方法
        window['parentViewImgList'] = (params) => {
          this.openImgModal(params)
        }
        window['parentViewLinkSpec'] = (params) => {
          this.openLinkSpecifiDlg(params)
        }
        window['parentDelShare'] = (id) => {
          this.delShare(id)
        }
      })
    },
    computed: {
      detailPage(){
        let url='inspect-detail.html?'+
        (this.inspectId?`id=${this.inspectId}`:'')+
        (this.recordInfo?`&hasRecord=1`:'')+
        `&isIframe=true`
        if(window.location.hostname === 'localhost'){
          return `http://localhost:8080/`+url
        }else{
          return `/safe-static/base-module/`+url
        }
      }
    },
    methods: {
      handleDialogClose () {
        this.$emit('close')
      },
      delShare (id) {
        this.$emit('delShare', id)
      },
      openImgModal (params) {
        this.imgDlgDisplay = 'block'
        this.imageIndex = params.index
        this.inspectAttachs = params.attachs
      },
      updateImgDlgDisplay (style) {
        this.imgDlgDisplay = style
      },
      updateImageIndex (index) {
        this.imageIndex = index
      },
      openLinkSpecifiDlg (params) {
        this.showSpecificationDialog = true
        this.$nextTick(() => {
          this.temRelationArr = params
        })
      },
      closeSpecificationDialog () {
        this.showSpecificationDialog = false
      },
      setIframeHeight() {
        let iframe = this.$refs.ifamePage
        if (iframe) {
          var iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow
          if (iframeWin.document.body) {
            iframe.height = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight
          }
        }
      },
      getData(){
        if(this.recordInfo){
          let parentData = {
          recordInfo:this.recordInfo
        }
        let iframe = this.$refs.ifamePage;
        let win = iframe.contentWindow;
        win.postMessage(JSON.stringify(parentData),"*")
      }

      }
    }
  }
</script>
<style lang="less">
    .dangerDetailDialog{
        .el-dialog__body{
            padding: 16px 20px;
            max-height: 700px;
            overflow-y: auto;
            position: relative;
        }
    }

</style>
