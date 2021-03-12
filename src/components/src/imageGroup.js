import Vue from 'vue'
// 任务状态

export const ImageGroup = Vue.component('ImageGroup', {
  functional: true,
  render (h, context) {
    const imgList = context.props.imgList
    const onDeleteClick = (event, idx) => {
      const func = context.listeners['remove-image']
      if (func) {
        func(imgList, idx)
      }
    }
    const onClick = (idx) => {
      if (event.target !== event.currentTarget) return
      const func = context.listeners['display-image']
      if (func) {
        func(imgList, idx)
      }
    }
    const showPlayBtn = (item, idx) => {
      if (item.extensionName === 'VIDEO') {
        return <i class="i-play-video-btn" onclick={() => onClick(idx)}>
          <span class="iconfont icon-shipinjiankong-right" onclick={() => onClick(idx)}></span>
        </i>
      } else {
        return ''
      }
    }
    const showDeleteBtn = context.props.showDeleteBtn
    const deleteBtn = (idx) => {
      return showDeleteBtn ? (
        <i class="iconfont icon-guanbi-jiacu1 delete-btn" onclick={(event) => onDeleteClick(event, idx)}></i>
      ) : ''
    }
    if (imgList && imgList.length > 0) {
      return <div >
        {imgList.map((item, idx) => (
          <div class="image-super-container">
            <div class="image-container" >
              <img src={item.smallImgUrl} onclick={() => onClick(idx)} class="img" />
              {showPlayBtn(item, idx)}
              {deleteBtn(idx)}
            </div>
          </div>
        ))}
      </div>
    } else {
      return <div></div>
    }
  },
  props: ['imgList', 'showDeleteBtn']
})
