<!--
    /**
     * 查看已关联规范
     * @author zhanghw-d
     * @date 2019-08-23
     * 调用示例：
      <ViewSpecificationDialog
        v-if="showSpecificationDialog"
        :hasPermission="hasPermission"
        :temRelationArr="temRelationArr"
        @close="closeSpecificationDialog"
        >
      </ViewSpecificationDialog>

-->
<template>
  <el-dialog
    class="viewSpecificationDialog"
    append-to-body
    title="已关联规范"
    top="5vh"
    :visible.sync="showDialog"
    :width="width"
    :before-close="handleDialogClose">
      <div class="link-list" v-if="temRelationArr && temRelationArr.length>0">
        <div class="link-box" v-for="(item,index) in temRelationArr" :key ="index" >
          <div class="link-box-item"
          v-if="item.subCategory && item.subCategory.length>0"
          :class="{active:item.categoryId==processId}"
          @click="toStandardbrowse(item)"
          >
              <span class="iconfont icon-guifan" ></span>
              <span v-html="'《'+item.categoryName+'》'" style="margin-right:16px;"></span>
              <span v-html="'('+item.categoryNumber+')'" style="margin-right:16px;"></span>
              <span v-for="(ele,subindex) in item.subCategory"
              :key="subindex"
              v-html="`${ele.name}`+(subindex===item.subCategory.length-1?' ':'、 ')"></span>
              <span v-if="hasPermission" class="iconfont icon-guanbi-jiacu1" @click.stop="deleteLink(item,index)"></span>
          </div>
        </div>
        <div v-if="!temRelationArr || temRelationArr.length===0" class="ct-list-empty">暂无关联数据</div>
      </div>
      <div :style="{height:height}">
        <iframe
        :src="src"
        id="iframeSpecification"
        ref="ifamePage"
        width="100%"
        frameborder="no"
        border="0"
        marginwidth="0"
        marginheight="0"
        height="100%"
        @load="load()"
        >
          <p>您的浏览器不支持iframe标签</p>
        </iframe>
      </div>
      <span v-if="hasPermission" slot="footer" >
        <el-button type="primary" @click="saveLink">保存</el-button>
        <el-button @click="handleDialogClose">取 消</el-button>

      </span>
  </el-dialog>
</template>
<script>

export default {
  name: 'ViewSpecificationDialog',
  components: { 

  },
  mounted () {
      this.$nextTick(() => {
        // 接受子窗口事件，调用父方法
        window['changeRelationArr'] = (temRelationArr) => {
          this.$emit('changeRelationArr',temRelationArr)
        }
      })
    },
  props: {
    hasPermission: {// 基础数据中传true，其他时候不传
      type: Boolean,
      required: false,
      default: false
    },
    width: {
      type: [String, Number],
      default: '90%'
    },
    height: {
      type: [String, Number],
      default: '700px'
    },
    temRelationArr: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      showDialog: true,
      processId: null,
      style: `height:${this.height}px`
    }
  },
  computed:{
    src(){
      if(window.location.hostname === 'localhost'){
        return 'https://xmgl-test.glodon.com/safe-static/dist/process-specification.html'
      }else{
        return "/safe-static/dist/process-specification.html"
      }
    }
  },
  methods: {
    load () {
      if (this.temRelationArr.length > 0) {
        this.postMessageToChild(this.temRelationArr[0])
      }else{
        this.postMessageToChild()
      }
    },
    handleDialogClose () {
      this.$emit('close')
    },
    // 切换关联的规范
    toStandardbrowse (item) {
      this.postMessageToChild(item)
    },
    // 通知子iframe切换
    postMessageToChild (item) {
      if(item){
        this.processId = item.categoryId
      }
    
      this.$nextTick(() => {
        let iframe = document.getElementById('iframeSpecification')
        let win = iframe.contentWindow
        win.postMessage({
          specificationDialog: true,
          processId: this.processId, // 规范id
          temRelationArr: this.temRelationArr, // 关联规范树组
          canChecked: !!this.hasPermission// 勾选章节是否禁用
        }, '*')
      })
    },
    // 删除规范
    deleteLink (item, index) {
      this.$emit('deleteLink',index)

      let iframe = document.getElementById('iframeSpecification')
      let win = iframe.contentWindow
      win.postMessage({
        clearDirectoryChecked: true,
        processId:item.categoryId,
        index:index
      }, '*')
      
    },
    saveLink(){
      this.$emit('saveLink')
    }
  }
}
</script>
<style lang="less">
  .viewSpecificationDialog{
    .el-dialog__body{
      padding: 16px 20px;
    }
    .link-list{
      padding: 8px 16px;
      width: 100%;
      height: 85px;
      background:rgba(246,246,246,1);
      box-shadow:0px 1px 0px 0px rgba(225,225,225,1);
      overflow-y: auto;
      overflow-x: hidden;

      .link-box{
        &:not(:last-child){
          margin-bottom: 8px;
        }
        .link-box-item{
          background: rgba(222,221,221,1);
          border-radius: 18px;
          padding: 5px 8px;
          display: inline-block;
          cursor: pointer;
          &.active{
            background: #1767ef;
            span{
              color: #fff;
            }
          }
        }
      }

    }
  }

</style>
