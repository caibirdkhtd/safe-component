<!--
    /**
     * 返回　组件
     * 调用示例：
     * 　<back-title
     *   　:title="'班组问题统计'"
     *   　@back="back"
     *　></back-title>
-->
<template>
  <div class='back-title'>
    <span class="back" @click="back">
      <i class="iconfont icon-fanhui" style="font-size: 14px;"></i>
      <span>返回</span>
      <span style="padding-left: 8px;">/</span>
    </span>
    <span class="label text-overflow" :title="title" :class="{disable: subTitle}">{{title}}</span>
    <template v-if="subTitle">
      <span style="padding-left: 8px;">/</span>
      <span class="label text-overflow" :title="subTitle">{{subTitle}}</span>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'BackTitle',
    props: {
      title: {
        required: true,
        type: String
      },
      subTitle: {
        type: String,
        default: ''
      }
    },
    methods: {
      back () {
        this.$emit('back')
      }
    }
  }
</script>

<style lang="less">
  .back-title {
    height:25px;
    padding: 8px 24px;
    line-height:25px;
    display: inline-flex;
    .back {
      color: #666;
      font-size: 14px;
      cursor: pointer;
      i {
        padding-right: 8px;
      }
    }
    .label {
      padding-left: 8px;
      font-size:14px;
      color:#4888F4;
      max-width: 200px;
    }
    .label.disable{
      color: #666;
    }
  }
</style>
