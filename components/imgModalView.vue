<!--
    /**
     * 图片浏览组件
     * @author zhanghw-d
     * @date 2019-08-13
     * 调用示例：
     * <img-modal-view
     *   :childImgDlgDisplay="imgDlgDisplay"  //是否显示图片浏览组件
     *   :childInspectAttachs="inspectAttachs" //图片集合
     *   :childImageIndex="imageIndex" // 当前选中图片索引
     *   @changeImgDlgDisplay="updateImgDlgDisplay" //关闭组件
     *   @changeImageIndex="updateImageIndex"> //修改选中图片
     * </img-modal-view>
-->
<template id="imgDlg">
  <!-- 图片展示组件 -->

  <div class="imgmodal" :style="{display: imgDlgDisplay}">
    <div class="modal-bg"></div>
    <div class="modal-hear-bar">
      <span class="btn-pswp iconfont icon-guanbi1" title="关闭" @click="closeImgModal"></span>
      <span v-show="isImage && rotate" class="btn-pswp iconfont icon-rotate-left" title="左旋转" @click="rotateLeft"></span>
      <span v-show="isImage && rotate" class="btn-pswp iconfont icon-rotate-right" title="右旋转" @click="rotateRight"></span>
      <span v-show="isImage"  class="btn-pswp iconfont icon-pic-enlarge" :title="scaleRatio>6?btnScaleTitle:''" :style="{cursor: scaleRatio>6 ?'not-allowed':'pointer'}" @click="scaleLarge" :disabled="scaleRatio>6"></span>
      <span v-show="isImage"  class="btn-pswp iconfont icon-pic-shrink" :title="scaleRatio<0.8?btnScaleTitle:''" :style="{cursor: scaleRatio<0.8? 'not-allowed':'pointer'}" @click="scaleSmall" :disabled="scaleRatio<0.8"></span>
      <span v-if="showDownloadBtn" class="btn-pswp iconfont icon-xiazai1" title="下载" @click="downloadFile"></span>
    </div>
    <div class="modal-body" style="overflow: hidden;" >
      <!--前期数据没有extensionName属性-->
      <img ref="activeImg" class="pic" v-show="isImage" onerror='javascript:this.src="/safe-static/assets/images/image.png"' :src="inspectAttachs.length==0?'':inspectAttachs[imageIndex].imageUrl" :style="rotateStyle" @mousedown="dragImage($event)">
      <video v-if="!isImage && !isAudio" :src="inspectAttachs.length==0?'':inspectAttachs[imageIndex].imageUrl" controls autoplay>
        您的浏览器不支持
        <code>video</code>标签!
      </video>
      <audio v-if="!isImage && isAudio" :src="inspectAttachs.length==0?'':inspectAttachs[imageIndex].imageUrl" type="audio/AUDIO"  controls="controls" autoplay>
        您的浏览器不支持 audio 标签。
      </audio>
      <div class="imgmodal-arrow-left"
           style="transform: rotate(180deg)"
           v-if="inspectAttachs&&inspectAttachs.length>1"
           @click="viewPrev">
        <span class="iconfont icon-youjiantou"> </span>
      </div>
      <div class="imgmodal-arrow-right"
           v-if="inspectAttachs&&inspectAttachs.length>1"
           @click="viewNext">
        <span class="iconfont icon-youjiantou"> </span>
      </div>
      <div class="img-remark" v-if="inspectAttachs[imageIndex] && (inspectAttachs[imageIndex].remark || inspectAttachs[imageIndex].source)">
        <div class="img-remark-mark" v-if="inspectAttachs[imageIndex].remark || inspectAttachs[imageIndex].source==1" v-text="inspectAttachs[imageIndex].remark!='' || inspectAttachs[imageIndex].source==1?'外部导入':''"></div>
      </div>
    </div>
    <div class="modal-bottom-bar" v-if="inspectAttachs && inspectAttachs.length>1">
      <div class="images-areas" v-for="(attach,index) in inspectAttachs" v-bind:key="attach.id">
        <div style="display: block;position: relative;">
          <div class="short-img-div">
            <div style="dispaly:block;position:relative;" @click="nickNext(index)">
              <img :src="attach.smallImgUrl" onerror='javascript:this.src="/safe-static/assets/images/image.png"'  :style="{border:index==imageIndex?'2px solid red':'none'}">
              <div v-if="attach.extensionName && attach.extensionName=='VIDEO'" class="i-play-video">
                <span class="iconfont icon-shipinjiankong-right"></span>
              </div>
              <div v-if="attach.extensionName && attach.extensionName=='AUDIO'" class="i-play-video">
                <span class="iconfont icon-shengyin"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'imgDlg',
  data: function () {
    return {
      rotateScale: 0,
      scaleRatio: 1,
      imgDlgDisplay: this.childImgDlgDisplay,
      inspectAttachs: this.childInspectAttachs,
      imageIndex: this.childImageIndex,
      offX: 0,
      offY: 0,
      left: 0,
      top: 0
    }
  },
  props: {
    appendToBody: {
      type: Boolean,
      required: false,
      default: true
    },
    childImgDlgDisplay: {
      required: true,
      type: String
    },
    childInspectAttachs: {
      required: true,
      type: Array
    },
    childImageIndex: {
      required: false,
      type: Number,
      default: 0
    },
    rotate: {
      required: false,
      default: true,
      type: Boolean
    },
    showDownloadBtn: {
      required: false,
      default: false,
      type: Boolean
    }
  },
  computed: {
    isImage: function () {
      let me = this
      let inspectAttachs = me.inspectAttachs
      let imageIndex = me.imageIndex
      if (inspectAttachs && inspectAttachs[imageIndex] && inspectAttachs[imageIndex].extensionName &&
          (inspectAttachs[imageIndex].extensionName === 'VIDEO' || inspectAttachs[imageIndex].extensionName === 'AUDIO')) {
        return false
      } else {
        return true
      }
    },
    isAudio (state) {
      let me = this
      let inspectAttachs = me.inspectAttachs
      let imageIndex = me.imageIndex
      if (inspectAttachs && inspectAttachs[imageIndex] && inspectAttachs[imageIndex].extensionName && inspectAttachs[imageIndex].extensionName === 'AUDIO') {
        return true
      } else {
        return false
      }
    },
    rotateStyle: function () {
      let me = this
      return {
        transform: `rotate(${me.rotateScale * 90}deg)`,
        height: me.scaleRatio * 100 + '%',
        left: me.left,
        top: me.top
      }
    },
    btnScaleTitle: function () {
      let me = this
      if (me.scaleRatio > 6) {
        return '已放到最大'
      } else if (me.scaleRatio < 0.8) {
        return '已缩至最小'
      } else {
        return ''
      }
    }
  },
  watch: {
    childImgDlgDisplay: function () {
      let me = this
      if (this.appendToBody) {
        document.body.appendChild(this.$el);
      }
      me.imgDlgDisplay = me.childImgDlgDisplay
      if (me.imgDlgDisplay === 'block') {
        me.initData()
      }
    },
    childInspectAttachs: function () {
      let me = this
      me.inspectAttachs = me.childInspectAttachs
    },
    childImageIndex: function () {
      let me = this
      me.imageIndex = me.childImageIndex
    },
    imageIndex: function () {
      this.$emit('changeImageIndex', this.imageIndex)
    },
    imgDlgDisplay: function () {
      this.$emit('changeImgDlgDisplay', this.imgDlgDisplay)
    }
  },
  methods: {
    downloadFile () {
      this.$emit('download-file')
    },
    initData: function () {
      this.rotateScale = 0
      this.scaleRatio = 1
      this.offX = 0
      this.offY = 0
      this.left = 0
      this.top = 0
    },
    closeImgModal: function () {
      this.imgDlgDisplay = 'none'
      this.stopAudioPlay()
    },
    stopAudioPlay () {
      var videos = document.getElementsByTagName('video')
      if (videos && videos.length > 0) {
        for (let i = 0; i < videos.length; i++) {
          videos[i].pause()
          videos[i].currentTime = 0.0
        }
      }
    },
    viewNext: function () {
      let me = this
      let index = me.imageIndex
      index += 1
      if (index > me.inspectAttachs.length - 1) {
        index = 0
      }
      me.imageIndex = index
      me.initData()
    },
    viewPrev: function () {
      let me = this
      let index = me.imageIndex
      index -= 1
      if (index < 0) {
        index = me.inspectAttachs.length - 1
      }
      me.imageIndex = index
      me.initData()
    },
    nickNext: function (index) {
      this.imageIndex = index
      this.initData()
    },
    setImgRatio(){
      let img = this.$refs.activeImg
      let ratio = img.height/img.width
      if(ratio < 1 && this.scaleRatio===1){
        this.scaleRatio = ratio
      }

    },
    rotateLeft: function () {
      this.rotateScale -= 1
    },
    rotateRight: function () {
      this.rotateScale += 1
    },
    scaleLarge: function () {
      if(this.scaleRatio< 6){
        this.scaleRatio = this.scaleRatio * 1.2
      }

    },
    scaleSmall: function () {
      if(this.scaleRatio> 0.8){
        this.scaleRatio = this.scaleRatio / 1.2
      }

    },
    dragImage: function (ev) {
      let me = this
      ev.preventDefault()
      let div1 = document.querySelector('.modal-body')
      let img = document.querySelector('.pic')
      let distanceX = ev.clientX
      let distanceY = ev.clientY
      document.onmousemove = function (ev) {
        var oevent = ev || window.event
        let x1 = oevent.clientX - distanceX// oevent.clientX是鼠标移动到的x位置，oevent.clientX-distanceX是移动的距离
        let y1 = oevent.clientY - distanceY
        distanceX = oevent.clientX // 更新distanceX的位置信息。这一步非常重要非常重要非常重要，因为mousemove事件在鼠标移动时触发，而不是鼠标停止移动后触发
        distanceY = oevent.clientY
        let diffx = div1.clientWidth - img.clientWidth
        let diffy = div1.clientHeight - img.clientHeight
        if (!((diffx >= 0 && img.offsetLeft <= 0 && x1 <= 0) ||
            (diffx < 0 && x1 <= 0 && img.offsetLeft <= diffx) ||
            (diffx >= 0 && img.offsetLeft >= diffx && x1 >= 0) ||
            (diffx < 0 && img.offsetLeft >= 0 && x1 >= 0))) {
          me.left = (x1 + me.offX) + 'px' // 若x1为正，则鼠标向右移动，设置图片的margin-left为正，向右偏移；为负同理向左偏移。
          me.offX = x1 + me.offX // 记录此时图片的偏移位置
        }

        if (!((diffy >= 0 && img.offsetTop <= 0 && y1 <= 0) ||
            (diffy < 0 && y1 <= 0 && img.offsetTop <= diffy) ||
            (diffy >= 0 && img.offsetTop >= diffy && y1 >= 0) ||
            (diffy < 0 && img.offsetTop >= 0 && y1 >= 0))) {
          me.top = (y1 + me.offY) + 'px' // offX和offY为前一次的偏移，本次移动是在前一次的基础上发生的，要加上偏移值才是鼠标本次移动后图片的位置。
          me.offY = y1 + me.offY
        }
      }
      document.onmouseup = function () { // 鼠标抬起后，就取消document的mousemove事件
        document.onmousemove = null
      }
    }
  }
}
</script>
<style lang="less">
.imgmodal {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: #000000;
  background: rgba(0, 0, 0, 0.8);
  z-index: 3000;
  display: none;
}

.imgmodal .modal-bg {
  background-color: #111;
  opacity: 0.8;
  position: absolute;
  width: 100%;
  height: 100%;
}

.imgmodal .modal-hear-bar {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  height: 50px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  text-align: right;
  padding: 3px;
  z-index: 10;
}

.imgmodal .modal-bottom-bar {
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  height: 80px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  text-align: center;
}

.imgmodal .modal-body {
  position: absolute;
  bottom: 80px;
  top: 50px;
  left: 50px;
  right: 50px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  text-align: right;
}

.imgmodal .modal-bottom-bar .short-img-div {
  width: 64px;
  height: 64px;
  margin-left: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.imgmodal .modal-bottom-bar .images-areas {
  text-align: center;
  display: inline-block;
}

.imgmodal .modal-body img,
.imgmodal .modal-body video {
  position: absolute;
  margin: auto;
  top: 0;
  left: 0;
  right: 0;
  border: 2px solid #fff;
  animation: enlarger 0.5s;
  -ms-animation: enlarger 0.5s;
  vertical-align: middle;
  height: 100%;
  cursor: move;
}

.btn-pswp {
  cursor: pointer;
  padding: 10px;
  color: #fff;
  font-size: 24px;
  width: 44px;
  float: right;
}

.imgmodal .imgmodal-arrow-left,
.imgmodal .imgmodal-arrow-right {
  position: absolute;
  height: 100px;
  width: 100px;
  top: 50%;
  margin-top: -50px;
  cursor: pointer;
  transition: transform 0.5s;
  text-align: center;

  .iconfont{
    line-height: 100px;
    color: #fff;
    font-size: 36px;
  }
}

.imgmodal .imgmodal-arrow-right {
  right: 0;
}



.imgmodal .short-img-div img {
  width: 64px;
  height: 64px;
}

.i-play-video {
  position: absolute;
  width: 28px;
  height: 28px;
  transition: all 0.5s;
  top: 50%;
  left: 50%;
  margin-left: -14px;
  margin-top: -14px;
  background-color: rgba(0,0,0,0.3);
  border-radius: 14px;
  text-align: center;
  line-height: 28px;
}
.i-play-video .iconfont{
  color: #fff;
  font-size: 16px;
}

.img-remark {
  position: absolute;
  bottom: 8px;
  width: 100%;
  text-align: center;
  color: #fff;
}

.img-remark-mark {
  color: #fff;
  background-color: rgba(255, 153, 0, 1);
  padding: 2px;
  width: 80px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.imgmodal .modal-body audio{
  margin: auto;
  display: block;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
</style>
