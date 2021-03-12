<!--
日期范围选择控件， 可以指定是否有快捷选项。
快捷选项目前默认是最近7天，最近1个月，最近3个月
可以传入start，end，来对应开始结束如期，不传默认3个月
可以传入maxDays，最多可以选择的日期跨多，默认92天提示信息3个月。
<date-picker-with-options
  :show-shortcuts="false"
  :max-days="6"
  :start="startDate"
  :end="endDate"
  :err-msg="'最多选择一周'"
  @date-changed="dateChanged"
></date-picker-with-options>
-->
<template>
  <div>
    <el-date-picker
        v-model="dates"
        ref="picker"
        type="daterange"
        align="right"
        size="small"
        :clearable="clearable"
        unlink-panels
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="dateChanged"
        :picker-options="showShortcuts ? pickerOptions : {}"
    >
    </el-date-picker>
  </div>
</template>
<script>
import { getDayRange } from "safe-component";
import dayjs from "dayjs";
const MS_IN_DAY = 3600 * 1000 * 24;

export default {
  name: "DatePickerWithOptions",
  mixins: [getDayRange],
  props: {
    maxDays: {
      type: Number,
      default: 91
    },
    errMsg: {
      type: String,
      default: "最多选择3个月"
    },
    showShortcuts: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    start: {
      type: String,
      default: ""
    },
    end: {
      type: String,
      default: ""
    },
    isDatesEmpty: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const startDate = this.isDatesEmpty
        ? ""
        : this.start || this.getDayRangeOfLast90Days().startDate;
    const endDate = this.isDatesEmpty
        ? ""
        : this.end || this.getDayRangeOfLast90Days().endDate;
    return {
      startDate: startDate,
      endDate: endDate,
      pickerOptions: {
        shortcuts: [
          {
            text: "最近7天",
            onClick(picker) {
              console.log("picker", picker);
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - MS_IN_DAY * 6);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近1个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - MS_IN_DAY * 29);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近3个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - MS_IN_DAY * 89);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      dates: [startDate, endDate]
    };
  },
  methods: {
    dateChanged(dates) {
      if (dates !== null && dates && dates.length > 1) {
        const [startDate, endDate] = dates;
        const diffDays = dayjs(endDate).diff(dayjs(startDate), "day");
        if (this.maxDays && diffDays > this.maxDays) {
          this.$message.error(this.errMsg);
          this.dates = [this.startDate, this.endDate];
          return;
        }
        this.startDate = dates[0];
        this.endDate = dates[1];
      }
      this.$emit("date-changed", dates);
    },
    changeData(startDate, endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.dates = [startDate, endDate];
    }
  }
};
</script>
<style lang="less"></style>
