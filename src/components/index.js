export const ImageGroup = {
  functional: !0,
  render: function (e, t) {
    var o = t.props.imgList, r = function (e, r) {
      var n = t.listeners[ 'remove-image' ]
      n && n(o, r)
    }, n = function (e) {
      if (event.target === event.currentTarget) {
        var r = t.listeners[ 'display-image' ]
        r && r(o, e)
      }
    }, a = function (t, o) {
      return 'VIDEO' === t.extensionName ? e('i', {
        class: 'i-play-video-btn',
        on: { click: function () {return n(o)} }
      }, [ e('span', { class: 'iconfont icon-shipinjiankong-right', on: { click: function () {return n(o)} } }) ]) : ''
    }, i = t.props.showDeleteBtn, c = function (t) {
      return i ? e('i', {
        class: 'iconfont icon-guanbi-jiacu1 delete-btn',
        on: { click: function (e) {return r(e, t)} }
      }) : ''
    }
    return o && o.length > 0 ? e('div', [ o.map((function (t, o) {
      return e('div', { class: 'image-super-container' }, [ e('div', { class: 'image-container' }, [ e('img', {
        attrs: { src: t.smallImgUrl },
        on: { click: function () {return n(o)} },
        class: 'img'
      }), a(t, o), c(o) ]) ])
    })) ]) : e('div')
  },
  props: [ 'imgList', 'showDeleteBtn' ]
}
