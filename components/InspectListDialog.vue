<template>
  <div class="InspectListDialog-wrap">
    <el-dialog width="1100px"
               top="8vh"
               :title="title"
               :visible.sync="visible"
               :before-close="closeDialog">
      <div v-loading="loading"
           element-loading-text="数据加载中"
           style="padding: 0px 20px;"
           :style="{height: divHeight + 'px'}">
        <el-table class="table-wrapper"
                  :data="records"
                  style="width: 100%; padding-top:12px;"
                  @row-click="jumpToDetail"
                  :height="tableHeight">
          <el-table-column type="index"
                           label="序号"
                           align="cente"
                           :index="indexMethod"
                           width="50">
          </el-table-column>
          <el-table-column prop="inspectStatus"
                           width="120"
                           label="检查结果">
            <inspect-status slot-scope="scope"
                            :status="scope.row.status"
                            :overTimeStat="scope.row.overTimeStat"></inspect-status>
          </el-table-column>
          <el-table-column v-if="!isProject"
                           label="项目名称"
                           min-width="100">
            <template slot-scope="scope">
              <div class="text-overflow lines"
                   style="width:100%;"
                   :title="scope.row.projectName">
                {{scope.row.projectName}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="检查人员"
                           width="180">
            <template slot-scope="scope">
              <el-row>
                <el-col :span="24">
                  <div :title="scope.row.creatorName"
                       class="text-overflow"
                       style="width:100%;">{{scope.row.creatorName}}
                  </div>
                </el-col>
                <el-col :span="24">
                  <div class="sub-content">检查时间：{{scope.row.createTime.split(' ')[0]}}</div>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column min-width="200"
                           label="隐患信息">
            <template slot-scope="scope">
              <div :title="scope.row.dangerItemContent"
                   style="width:100%; white-space: nowrap; overflow: hidden;
                  text-overflow: ellipsis; display: block;">
                <span v-if="scope.row.status!==0"
                      class="tag"
                      :class="'level-'+scope.row.level"
                      style="margin-right: 8px;">
                  {{scope.row.levelText}}
                </span>
                {{scope.row.dangerItemContent}}
              </div>
              <div>
                <div v-if="scope.row.attaches && scope.row.attaches.length>0"
                     style="max-width: 30%;"
                     class="tag danger-info-tag text-overflow">
                  <span class="iconfont icon-pic"></span>
                  <span>{{scope.row.attaches.length}}</span>
                </div>
                <div v-if="scope.row.regionName"
                     style="max-width: 40%;"
                     class="tag danger-info-tag text-overflow">
                  <span class="iconfont icon-point"></span>
                  <span :title="scope.row.regionName">{{scope.row.regionName}}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="分包单位"
                           width="130">
            <template slot-scope="scope">
              <div class="text-overflow"
                   style="width:100%;"
                   :title="scope.row.teamName">{{scope.row.teamName}}
              </div>
            </template>
          </el-table-column>
          <el-table-column width="110"
                           label="整改人">
            <template slot-scope="scope">
              <div class="text-overflow lines"
                   style="width:100%;"
                   :title="scope.row.changeName">
                {{scope.row.changeName}}
              </div>
            </template>
          </el-table-column>
          <el-table-column width="110"
                           label="复查人">
            <template slot-scope="scope">
              <div class="text-overflow lines"
                   style="width:100%;"
                   :title="scope.row.reviewName">
                {{scope.row.reviewName}}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <page v-if="pageIndex !== 0 || hasNext"
            :pageIndex="(pageIndex + 1)"
            :hasNext="hasNext"
            :is-loading="loading"
            :isShowShadow="true"
            @pageChange="pageChange">
        <span class="total-count"
              v-if="displayTotalCount">共{{displayTotalCount}}条</span>
      </page>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Page from 'safe-component/components/Pagination.vue'
import { pageProps, postWithReject } from 'safe-component'
import Vue from 'vue'

export default {
  name: 'InspectListDialog',
  mixins: [pageProps(10)],
  components: {
    InspectStatus: Vue.component('InspectStatus', {
      functional: true,
      render(h, context) {
        const statusClass =
          'insp-list-status-circle ' +
          ['wxzg', 'dzg', 'dzg', 'hg', 'bhg', 'dzg'][context.props.status]
        const statusLabel = [
          '无需整改',
          '待整改',
          '待复查',
          '合格',
          '不合格',
          '申请延期'
        ][context.props.status]
        const circleTag = context.props.showCircle ? (
          <span class={statusClass}></span>
        ) : (
          ''
        )
        const overTimeStat = context.props.overTimeStat ? (
          <span class="tag level-2">超期</span>
        ) : (
          ''
        )
        return (
          <div>
            {circleTag}
            <span>{statusLabel}</span>
            {overTimeStat}
          </div>
        )
      },
      props: {
        status: Number,
        showCircle: {
          required: false,
          type: Boolean,
          default: true
        },
        overTimeStat: {
          required: false,
          type: Boolean,
          default: false
        }
      }
    }),
    Page
  },
  data() {
    return {
      visible: true,
      pageIndex: 0,
      loading: false,
      recordsTotalCount: 0,
      divHeight: 380,
      tableHeight: 360
    }
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      default: ''
    },
    endDate: {
      type: String,
      default: ''
    },
    serious: {
      type: Boolean,
      default: false
    },
    totalCount: {
      type: [Number, String],
      default: 0
    },
    inspectType: {
      type: [Number, String],
      default: null
    },
    projectStatus: {
      type: Array,
      default() {
        return []
      }
    },
    instStatus: {
      type: Array,
      default() {
        return []
      }
    },
    instLevels: {
      type: Array,
      default() {
        return []
      }
    },
    curProjectId: {
      type: [String, Number],
      default: ''
    },
    dangerTypeId: {
      type: [String, Number],
      default: ''
    },
    curOrgId: {
      type: [String, Number],
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    params: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapState(['projectId', 'isProject']),
    displayTotalCount() {
      return this.totalCount || this.recordsTotalCount
    }
  },
  mounted() {
    this.loadList()
    this.checkHeight()
  },
  methods: {
    checkHeight() {
      const inLowerContainer = document.body.clientHeight < 780
      this.divHeight = inLowerContainer ? 380 : 600
      this.tableHeight = inLowerContainer ? 360 : 580
    },
    // 序号
    indexMethod: function indexMethod(index) {
      index = index + 1
      if (this.pageIndex > 0) {
        return this.pageIndex * this.pageSize + index
      } else {
        return index
      }
    },
    jumpToDetail(item) {
      this.$eventBus.$emit('open-detail-dialog', item.id)
    },
    loadList() {
      this.loading = true
      let data
      if (this.url) {
        data = this.params
        data.pageIndex = this.pageIndex
        data.pageSize = 10
      } else if (this.dangerTypeId) {
        const typeIds = this.dangerTypeId.split('/')
        data = {
          pageIndex: this.pageIndex + 1,
          pageNum: 10,
          startDate: this.startDate,
          endDate: this.endDate,
          projectId: this.curOrgId ? '' : this.curProjectId || this.projectId,
          orgId: this.curOrgId,
          serious: this.serious,
          inspectType: this.inspectType,
          categoryId: null,
          level: typeIds.length,
          insCategoryId: typeIds.pop(),
          projectStatus: this.projectStatus
        }
      } else {
        data = {
          pageIndex: this.pageIndex,
          pageSize: 10,
          startDate: this.startDate,
          endDate: this.endDate,
          projectId: this.curOrgId ? '' : this.curProjectId || this.projectId,
          orgId: this.curOrgId,
          instStatus: this.instStatus,
          instLevels: this.instLevels
        }
      }
      const url =
        this.url ||
        (this.dangerTypeId
          ? '/safety/safe-inspection/dataCenter/getCategoryStatisInsList'
          : '/safety/safe-inspection/mobileIndex/drillInspections')

      postWithReject(url, data)
        .then(res => {
          res.list = res.list || []
          if (this.dangerTypeId) {
            this.recordsTotalCount = res.count
            this.hasNext =
              this.pageSize * this.pageIndex + res.list.length < res.count
          } else if (this.url) {
            this.recordsTotalCount = res.count
            this.hasNext =
              typeof res.hasNext === 'boolean'
                ? res.hasNext
                : this.calcHasNext(res.count, this.pageIndex)
          } else {
            this.recordsTotalCount = 0
            this.hasNext = res.hasNext
          }

          if (res && res.list.length > 0) {
            res.list.forEach(item => {
              item.teamName =
                (item.teamId ? item.teamName : item.vendorName || '') +
                (item.laborGroup && item.laborGroup.laborGroupId
                  ? '-' + item.laborGroup.laborGroupName
                  : '')
              item.teamName = item.teamName || '-'
              item.levelText = item.level === '1' ? '一般' : '重大'
              if (item.dangerItemContent && item.dangerDesc) {
                item.dangerItemContent = `${item.dangerItemContent},${item.dangerDesc}`
              } else {
                item.dangerItemContent =
                  item.dangerItemContent || item.dangerDesc || ''
              }
            })
          }
          this.records = res.list
          this.loading = false
        })
        .catch(() => {
          this.records = []
          this.loading = false
        })
    },
    calcHasNext(totalCount, pageIndex) {
      if (pageIndex === 0 && totalCount > this.pageSize) {
        return true
      } else if (pageIndex > 0 && totalCount > (pageIndex + 1) * 10) {
        return true
      } else {
        return false
      }
    },
    closeDialog() {
      this.$emit('close-dialog')
    }
  }
}
</script>
<style lang="less">
@import '~safe-component/assets/less/colors.less';

.InspectListDialog-wrap {
  .text-overflow {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .el-dialog__body {
    position: relative;
    padding: 30px 20px 52px;
  }
  .el-table__row {
    td {
      cursor: pointer;
    }
  }
  .el-dialog__header {
    border-bottom: 1px solid #e4e8f4;
    padding: 10px 20px;
  }
  .el-dialog__footer {
    border-top: 1px solid #e4e8f4;
    padding: 10px 20px;
    .footer-tips {
      float: left;
      height: 30px;
      line-height: 30px;
      color: #666;
      font-size: 12px;
      margin-left: 10px;
    }
  }
  .el-dialog__headerbtn {
    top: 10px;
  }
  .insp-list-status-circle {
    display: inline-block;
    height: 8px;
    width: 8px;
    margin-right: 8px;
    border-radius: 50%;
    &.wxzg {
      display: none;
    }
    &.dzg {
      background-color: @dzgColor;
    }

    &.hg {
      background-color: @hgColor;
    }

    &.bhg {
      background-color: @bhgColor;
    }
  }
  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 12px;
    color: #fff;
    line-height: 16px;
  }
  .prj-status {
    background: rgba(153, 153, 153, 1);
  }
  .warn-status {
    background: @Danger;
  }
  .danger-info-tag {
    background: @Grey-2;

    &:not(:last-child) {
      margin-right: 8px;
    }
    span {
      font-size: 12px;
      color: @Grey-0;
    }
    .iconfont {
      font-size: 14px;
    }
  }
  .level-1 {
    background: @Brand;
  }
  .level-2,
  .level-3 {
    background: @Danger;
  }
}
</style>
