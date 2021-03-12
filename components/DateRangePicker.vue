<!--
日期选择组件， 用法如下
<date-range-picker
          :start.sync="startDate"
          :end.sync="endDate"
          height20
          @change="dateChanged"
        ></date-range-picker>
-->
<template>
  <div class="DateRangePicker-wrap" :class="{'size-height-20': height20}">
    <span v-if="showLabel">选择日期：</span>
    <el-date-picker
      v-model="startDate"
      :size="size || 'mini'"
      :picker-options="leftPickerOptions"
      :clearable="false"
      type="date"
      value-format="yyyy-MM-dd"
      @change="startDateChanged">
    </el-date-picker>
    <label style="font-size: 12px; padding: 0 4px;">—</label>
    <el-date-picker
      v-model="endDate"
      :size="size || 'mini'"
      :clearable="false"
      type="date"
      :picker-options="rightPickerOptions"
      value-format="yyyy-MM-dd"
      @change="endDateChanged">
    </el-date-picker>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
export default {
  name: 'DateRangePicker',
  components: {},
  props: {
    size: {
      type: String,
      required: false,
      default: 'mini'
    },
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    },
    height20: {
      type: Boolean,
      default: false
    },
    startDisabledDate: {
      type: String,
      required: false,
      default: ''
    },
    endDisabledDate: {
      type: String,
      required: false,
      default: ''
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    firstDayOfWeek: { // 周起始日 1-7周一到周日 同element-ui
      type: Number,
      required: false,
      default: 7
    }
  },
  data () {
    return {
      startDate: this.start,
      endDate: this.end
    }
  },
  watch: {
    start (newValue) {
      this.startDate = newValue
    },
    end (newValue) {
      this.endDate = newValue
    }
  },
  computed: {
    ...mapState([]),
    leftPickerOptions () {
      const me = this
      return {
        disabledDate (time) {
          const formatTime = dayjs(time).format('YYYY-MM-DD')
          if (me.startDisabledDate) {
            return formatTime > me.endDate || formatTime < me.startDisabledDate
          } else {
            return formatTime > me.endDate
          }
        },
        firstDayOfWeek: me.firstDayOfWeek
      }
    },
    rightPickerOptions () {
      const me = this
      return {
        disabledDate (time) {
          const formatTime = dayjs(time).format('YYYY-MM-DD')
          if (me.endDisabledDate) {
            return formatTime < me.startDate || formatTime > me.endDisabledDate
          } else {
            return formatTime < me.startDate
          }
        },
        firstDayOfWeek: me.firstDayOfWeek
      }
    }
  },
  methods: {
    startDateChanged (data) {
      this.$emit('update:start', data)
      this.$emit('startDateChange', data)
      this.$emit('change')
    },
    endDateChanged (data) {
      this.$emit('update:end', data)
      this.$emit('endDateChange', data)
      this.$emit('change')
    }
  }
}
</script>
<style lang="less">
.DateRangePicker-wrap{
  display: inline-block;
  .el-date-editor.el-input{
    width: 125px;
    &.el-input--medium{
      width: 140px;
    }
  }
  &.size-height-20{
    font-size: 12px;
    .el-date-editor.el-input{
      width: 110px;
    }
    .el-date-editor.el-input--mini{
      .el-input__inner {
        padding-right: 4px;
        height: 20px;
        line-height: 20px;
      }
      .el-input__icon {
        line-height: 20px;
      }
    }
  }
}
</style>
