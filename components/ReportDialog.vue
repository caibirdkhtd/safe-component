<!--
    /**
     * 选择报表组件：当有多张报表时调用
     * @author zhanghw-d
     * @date 2019-08-10
     * 调用示例：
      <report-dialog
      v-if="showReportDialog"
      :reportData="reportData" // 报表列表
      :height="200" // 内容区域高度
      @close="reportDialogClose"> // 关闭时的回调（this.$emit('close', this.radio)）
      </report-dialog>
-->
<template>
<el-dialog
  title="选择报表"
  :visible.sync="showDialog"
  width="30%"
  :before-close="handleReportDialogClose">
  <div>
    <el-scrollbar class="tree-select-bar" :style="style">
      <el-radio-group v-model="radio">
        <div class="report-radio-item" v-for="(item, index) in reportData" :key="index">
          <el-radio :label="index" :title="item.name">
            {{ item.name }}
          </el-radio>
        </div>
      </el-radio-group>
    </el-scrollbar>

  </div>
  <span slot="footer" class="dialog-footer">
    <el-button size="small" type="primary" @click="print">确 定</el-button>
    <el-button size="small" @click="handleReportDialogClose">取 消</el-button>
  </span>
</el-dialog>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'ReportDialog',
  components: {},
  props: {
    height: {
      type: Number,
      default: 200
    },
    reportData: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      radio: 0,
      showDialog: true,
      style: `height:${this.height}px`
    }
  },
  computed: {
    ...mapState([])
  },
  methods: {
    handleReportDialogClose () {
      this.$emit('close')
    },
    print () {
      this.$emit('close', this.radio)
    }
  }
}
</script>
<style lang="less" >
  .el-radio-group{
    width: 100%;
  }
  .report-radio-item {
    margin-bottom: 12px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
