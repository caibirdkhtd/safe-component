
<!-- 提示信息组件
调用示例：
<explain-popover
    :placement="top-start"     top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end
    :title="title"
    :width="width"
    :trigger="trigger"     click/focus/hover/manual
    :content="content"
    :iconClass="'el-icon-info'"
    :fontSize="'16px'">
        <el-table :data="gridData">
            <el-table-column width="150" property="date" label="日期"></el-table-column>
            <el-table-column width="100" property="name" label="姓名"></el-table-column>
            <el-table-column width="300" property="address" label="地址"></el-table-column>
        </el-table>
</explain-popover> -->
<template>
  <div class="popover-wrap">
      <el-popover
          :placement="placement"
          :title="title"
          :width="width"
          :trigger="trigger"
          :content="content"
          v-model="visible">
          <slot></slot>
          <i
              :class="iconClass"
              :style='{fontSize: fontSize}'
              slot="reference"
              @click="handleClick"></i>
      </el-popover>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'ExplainPopover',
  components: {},
  props: {
    placement: {
      type: String,
      required: true,
      default: 'top-start'
    },
    title: {
      type: String,
      required: false,
      default: ''
    },
    width: {
      type: Number,
      required: false,
      default: 200
    },
    trigger: {
      type: String,
      required: false,
      default: 'hover'
    },
    content: {
      type: String,
      required: true,
      default: ''
    },
    iconClass: {
      type: String,
      required: false,
      default: 'iconfont icon-bangzhu'
    },
    fontSize: {
      type: String,
      required: false,
      default: '12px'
    }
  },
  data () {
    return {
      visible: false
    }
  },
  computed: {
    ...mapState([])
  },
  mounted () {

  },
  methods: {
    handleClick () {
      if (this.trigger === 'manual') {
        this.visible = !this.visible
      }
    }
  }
}
</script>
<style lang="less">
.popover-wrap{
  display: inline-block;
}
</style>
