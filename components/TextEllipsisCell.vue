<template>
  <el-table-column
          :label="label"
          :prop="prop"
          :width="width ? width : 'auto'"
  >
    <div slot-scope="scope" class="text-overflow" :title="titleProp ? scope.row[titleProp] : scope.row[prop]">
      <slot v-bind="scope.row">{{ scope.row[prop] }}</slot>
    </div>
  </el-table-column>
</template>
<script>
  import { mapState } from 'vuex'
  export default {
    name: 'TextEllipsisCell',
    components: {},
    props: {
      label: String,
      prop: String,
      titleProp: String,
      width: [Number, String]
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
  .TextEllipsisCell-wrap{}
</style>
