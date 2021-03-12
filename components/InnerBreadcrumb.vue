
<!--
innerPath 指定跳转页面标识key
path 多组页面的集合 例如：[ { label: '一级'}, {label: '二级'}, ...]
label-args 动态页面名称 例如：{tableName}检查表 -> 消防检查表  （tableName: '消防'）
isMore 是两级还是多级
goPage 跳转到具体页面函数
<inner-breadcrumb
  :innerPath="innerPath"
  :path="path"
  @goPage="goPage">
</inner-breadcrumb>
-->
<template>
    <div class="inner-breadcrumb"
        v-show="innerPath!=root">
        <el-button
            v-if="!isMore"
            class="back-btn"
            type="text"
            @click="back">
            <i class="iconfont icon-fanhui"></i>
            <span class="back-text">返回</span>
        </el-button>
        <el-breadcrumb class="breadcrumb" :separator="isMore ? '/' : '|'">
            <el-breadcrumb-item v-for="(node, index) in pathArr" :key="index">
              <a
                  v-if="isMore === false && index === 1 && !node.disable"
                  class="text-overflow max-width"
                  :class="{'last':index==pathArr.length-1}"
                  :title="parse(node.label)"
                  href="javascript:;"
                  @click="change(node)">
                  {{parse(node.label)}}
              </a>
              <a
                  v-if="isMore === true && !node.disable  "
                  class="text-overflow max-width"
                  :class="{'last':index==pathArr.length-1}"
                  :title="parse(node.label)"
                  href="javascript:;"
                  @click="change(node)">
                  {{parse(node.label)}}
              </a>
              <span
                v-if="node.disable "
                class="text-overflow max-width"
                :class="{'last':index==pathArr.length-1}"
                :title="parse(node.label)">
                  {{parse(node.label)}}
              </span>
            </el-breadcrumb-item>
        </el-breadcrumb>
    </div>
</template>
<script>
  export default {
  name: 'InnerBreadcrumb',
  props: {
    innerPath: {
      type: [Number,String],
      default: 0
    },
    path: {
      type: Array,
      required: true,
      default: () => {
        return []
      }
    },
    labelArgs: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isMore: { // 是否为超过两层级页面跳转
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      pathMap: null,
      root: null,
      pathArr: []
    }
  },
  watch: {
    innerPath (val) {
      this.buildPath(val)
    }
  },
  created () {},
  mounted () {
    this.init()
    this.buildPath(this.innerPath)
  },
  methods: {
    init () {
      let path = this.path
      let pathMap = {}
      if (path[0].key) { // path中带有key
        this.root = path[0].key
        if (this.isObjArr(this.path) === 1) {
          path.forEach((v, i) => {
            this.$set(v, 'disable', false)
            if (i === 0) {
              this.$set(v, 'parentKey', 'undefined')
            } else {
              this.$set(v, 'parentKey', path[i - 1].key)
              if (i === (path.length - 1)) {
                this.$set(v, 'disable', true)
              }
            }
            pathMap[v.key] = v
          })
        }
      } else { // path中无key
        path.forEach((v, i) => {
          let tempObj = {
            label: v,
            key: i,
            parentKey: '',
            disable: false
          }
          if (i === 0) {
            this.root = tempObj.key
            tempObj.parentKey = 'undefined'
          } else {
            tempObj.parentKey = i - 1
            if (i === (path.length - 1)) {
              tempObj.disable = true
            }
          }
          pathMap[i] = tempObj
        })
      }
      this.pathMap = pathMap
    },
    buildPath (key) {
      if (!key) { return }
      // 建立路径数组
      let node = this.pathMap[key]
      if (!node) {
        return
      }
      let arr = []
      while (node) {
        arr.push(node)
        node = this.pathMap[node.parentKey]
      }
      arr.reverse()
      this.pathArr = arr
    },
    parse (label) {
      const reg = /\{[^\}]+\}/g
      let labelCopy = label
      let match
      while ((match = reg.exec(label)) != null) {
        let key = match[0].substr(1, match[0].length - 2)
        let value = this.labelArgs[key]
        if (value) {
          labelCopy = labelCopy.replace(match[0], value)
        }
      }
      return labelCopy
    },
    change (node) {
      if (node.disable) return
      if (this.path[0].key) {
        this.$emit('go-page', node)
      } else {
        this.$emit('go-page', node.key)
      }
    },
    back () {
      if (this.pathArr && this.pathArr.length > 1) {
        for (let i = this.pathArr.length - 2; i >= 0; i--) {
          const node = this.pathArr[i]
          if (!node.disable) {
            this.change(node)
            return
          }
        }
      }
    },
    isObjArr (value) {
      if (Object.prototype.toString.call(value) === "[object Array]") {
          return 1
      } else if(Object.prototype.toString.call(value)==='[object Object]'){
          return 2
      } else{
          console.log('value不是数组也不是对象')
      }
    }
  }
}
</script>
<style lang="less">
  .inner-breadcrumb {
    height: 24px;
    padding: 0 3px 10px;
    .el-breadcrumb {
      line-height: 1.2 !important;
    }
    .back-btn {
      float: left;
      padding: 0;
      color: #999;
      &:hover {
        color: #1767EF;
      }
      .back-text {
        margin-left: 5px;
      }
    }
    .iconfont {
        font-size: 14px;
    }
    .breadcrumb{
        float:left;
        span {
            color: #999;
        }
        a {
            font-weight: normal;
            color: #999;
            text-decoration:none;
        }
        a:hover{
            color: #1767EF;
            text-decoration: none;
        }
        .last{
            color: #4888F4!important;
            cursor: default!important;
        }
        .disable{
            cursor: default!important;
        }
        .el-breadcrumb__separator {
            color: #ccc;
            font-weight: 400;
            vertical-align: top;
        }
        .max-width {
            max-width: 260px;
        }
    }
  }
</style>