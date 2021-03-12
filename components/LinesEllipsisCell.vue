<!--
<lines-ellipsis-cell prop="orgName" lines="2" label="上传组织"></lines-ellipsis-cell>
table中多行省略样式
lines 支持2和3
-->
<template>
  <el-table-column
    :label="label"
    :prop="prop">
    <div slot-scope="scope" :class="['lines-ellipsis-' + lines ]" :title="scope.row[prop]">
      {{scope.row[prop]}}
    </div>
  </el-table-column>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'LinesEllipsisCell',
  components: {},
  props: {
    label: String,
    prop: String,
    lines: {
      type: String,
      default: '2'
    }
  },
  data () {
    return {}
  },
  computed: {
    ...mapState([])
  },
  methods: {}
}
</script>
<style lang="less">
.lines-ellipsis-2{
  text-overflow: ellipsis;
  word-break: break-all;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.lines-ellipsis-3{
  text-overflow: ellipsis;
  word-break: break-all;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.LinesEllipsisCell-wrap{
}
</style>
