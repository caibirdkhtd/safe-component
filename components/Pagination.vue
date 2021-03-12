<!--
     　上一页　下一页　分页组件
      <pagination
        :page-index="pageIndex"
        :has-next="hasNext"
        :is-show-shadow="false"
        :is-loading="isLoading"
        page-start-zero　// 页码从０开始，　默认从１开始
        @pageChange="pageChange"　//　1, 表示下一页，　-1,表示上一页
      >
      </pagination>
-->
<template>
<div class="Pagination-wrap" :class="{boxShadow: isShowShadow}">
  <el-button-group>
    <el-button
            :disabled="(pageStartZero ? pageIndex === 0 : pageIndex === 1) || isLoading"
            size="small"
            @click="pageChange(-1)"
            icon="el-icon-arrow-left">上一页
    </el-button>
    <el-button
            :disabled="!hasNext || isLoading"
            @click="pageChange(1)"
            size="small">
      下一页<i class="el-icon-arrow-right el-icon--right"></i>
    </el-button>
  </el-button-group>
  <span class="total-count">当前第{{pageStartZero ? (pageIndex + 1): pageIndex}}页</span>
  <slot></slot>
  <span v-if="showPageSizeSelect">
    <span class="total-count">，每页展示</span>
      <el-select
        v-model="curPageSize"
        size="small"
        style="width: 70px;margin-left: 10px;"
        @change="pageSizeChange"
        placeholder="请选择展示条数">
        <el-option
          v-for="item in pageSizeOptions"
          :key="item"
          :label="item"
          :value="item">
        </el-option>
      </el-select>
      <span class="total-count">条</span>
  </span>
</div>
</template>
<script>
export default {
  name: 'Pagination',
  components: {},
  props: {
    pageIndex: {
      type: Number,
      required: true
    },
    hasNext: {
      type: Boolean,
      required: true
    },
    count: {
      type: Number,
      required: false,
      default: 0
    },
    isShowShadow: {
      type: Boolean,
      required: false,
      default: true
    },
    // 列表是否正在加载
    isLoading: {
      type: Boolean,
      required: false,
      default: false
    },
    pageStartZero: {
      type: Boolean,
      default: false
    },
    showPageSizeSelect: {
      type: Boolean,
      default: false
    },
    pageSizeOptions: {
      type: Array,
      default () {
        return [10, 30, 50, 100]
      }
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data () {
    return {}
  },
  mounted () {
    this.curPageSize = this.pageSize
  },
  methods: {
    pageChange (tmp) {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        if (!this.isLoading) {
          this.$emit('pageChange', tmp)
        }
      }, 500)
    },
    pageSizeChange () {
      this.$emit('pageSizeChange', this.curPageSize)
    }
  }
}
</script>
<style lang="less">
.bg-c(@color: #fff) {
  background-color: @color;
}

.box-shadow (@p, @c) {
  box-shadow: @p @c;
  -webkit-box-shadow: @p @c;
}

.border(@c: @color-ccc) {
  border: 1px solid @c;
}

.base-position (@p: absolute, @l: 0, @r: 0, @t: 0, @b: 0) {
  position: @p;
  left: @l;
  right: @r;
  bottom: @b;
  top: @t;
}

.tx-a(@p: center) {
  text-align: @p;
}

@fs14: 14px;

.Pagination-wrap {
  background-color: #fff;
  .base-position(@t: auto);
  &.boxShadow {
    padding: 12px 20px;
    box-shadow: 0 -2px 8px 0 rgba(49, 49, 49, 0.18);
  }
  .total-count {
    padding-left: 10px;
    font-size: 14px;
  }
}
</style>
