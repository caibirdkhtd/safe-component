<template>
  <div class="enterprise-user-selector-wrapper">
    <!-- <slot> -->
      <el-select
      v-if="inputtype==='select'"
        v-model="users"
        :placeholder="placeholder"
        multiple
        :style="{width: width + 'px'}"
        :size="size"
        :disabled="disabled"
        :clearable="clearable"
        :popper-class="popperClass"
        @change="handleChange"
        @focus="handleSelectFocus">
        <el-option
          v-for="item in rootAllUser"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
      <div v-else @click="handleSelectFocus">
        <slot>

        </slot>

      </div>
    <!-- </slot> -->
    <el-dialog
      :title="dialogTitle"
      :visible="dialogVisible"
      :custom-class="dialogClass"
      width="1100px"
      :append-to-body="true"
      :fullscreen="false"
      :before-close="handleClose">
      <div class="enterprise-user-dialog-content" >
        <el-row>
          <el-col :span="6">
            <div class="grid-content">
              <div class="grid-content-header textIndent12">组织树</div>
              <div class="org-tree" style="overflow-y: auto;height: 420px;">
                <el-tree
                  ref="EnterpriseUserSelectorOrgTree"
                  :default-expanded-keys="[orgId]"
                  :expand-on-click-node="false"
                  node-key="id"
                  :data="treeData"
                  :props="defaultProps"
                  @node-click="handleNodeClick">
                  <template slot-scope="scope">
                    <span class="text-ellipsis" :title="scope.data[defaultProps.label]">
                      {{scope.data[defaultProps.label]}}
                    </span>
                </template>
                </el-tree>
              </div>
            </div>
          </el-col>
          <el-col :span="13" style="border-left: 1px solid #DCDEE3;border-right: 1px solid #DCDEE3;">
            <div class="textIndent12" style="height: 40px;line-height: 40px;background: #EBECF0;padding-left: 12px;">
              <span>组织用户</span>
              <div style="width: 170px;border-radius:4px;float: right;margin-right: 12px;">
                <el-input
                  v-model.trim="seachText"
                  size="small"
                  placeholder="按姓名、手机号搜索"
                  clearable
                  onkeyup="this.value=this.value.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5]/g,'')"
                  @input="search">
                </el-input>
              </div>
              <div style="float: right;margin-right: 12px;">
                <el-select
                  v-model="choosedPosition"
                  multiple
                  filterable
                  clearable
                  :collapse-tags="true"
                  style="height: 32px;line-height: 32px;width: 220px;"
                  :reserve-keyword="true"
                  placeholder="请选择岗位"
                  size="small"
                  @change="handlePositionChange">
                  <el-option
                    v-for="item in posiontOptions"
                    :key="item.name"
                    :label="item.name"
                    :value="item.code">
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="grid-content">
              <el-table
                :data="curOrgUsers"
                v-loading="loading"
                :height="isHasMore ? 400 : 432"
                style="width: 100%">
                <el-table-column
                  prop="name"
                  label="姓名">
                  <template slot-scope="scope">
                    <div class="text-ellipsis" :title="scope.row.name">{{scope.row.name}}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="phone"
                  width="120"
                  label="手机号">
                  <template slot-scope="scope">
                    <span>{{scope.row.phone || '-'}}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="remark"
                  label="岗位">
                  <template slot-scope="scope">
                    <div class="text-ellipsis" style="width: 100%" :title="scope.row.remark">{{scope.row.remark || '-'}}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="choosedPosition.length > 0 || seachText"
                  prop="orgFullName"
                  label="所属组织">
                  <template slot-scope="scope">
                    <div class="text-ellipsis" :title="scope.row.orgFullName">{{scope.row.orgName || '-'}}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="phone"
                  width="90"
                  align="center"
                  >
                  <template slot="header" slot-scope="scope">
                    <div>
                      <span>全选</span>
                      <div class="add-btn"
                        :class="{'add-btn-disabled': (max && choosedUserData.length >= max)}"
                        style="display: inline-block;margin-left: 4px;padding-right: 20px;"
                        @click="addAllUser">+
                      </div>
                    </div>
                  </template>
                  <template slot-scope="scope">
                    <div v-if="choosedCurUser(scope.row.id)">已添加</div>
                    <div class="add-btn"
                      :class="{'add-btn-disabled': (max && choosedUserData.length >= max)}"
                      v-else
                      @click="addUser(scope.row)">+
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div
              v-if="isHasMore"
              style="text-align:center; line-height:30px; background: #eee;cursor: pointer"
              @click="getMData()">
              点击加载更多
            </div>
          </el-col>
          <el-col :span="5">
            <div class="grid-content">
              <div class="grid-content-header textIndent12">
                <span>已选人员({{choosedUserData.length}}{{max ? `/${max}` : ''}})</span>
                <el-button v-if="choosedUserData.length > 0"  size="small" style="float: right;margin-top: 4px;" @click="handleClear">清空</el-button>
              </div>
              <div style="height: calc(100% - 40px);overflow-y: auto;">
                <el-table
                  :data="choosedUserData"
                  height="430"
                  :show-header="false"
                  style="width: 100%">
                  <el-table-column
                    label="姓名">
                    <template slot-scope="scope">
                      <span class="text-ellipsis" style="padding-left: 8px;" :title="scope.row.name">{{scope.row.name}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    width="40"
                    label="操作">
                    <template slot-scope="scope">
                      <i class="delete iconfont icon-shanchu1" @click="handleDelete(scope.row, scope.$index)"></i>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" :disabled="choosedUserData.length <= 0" type="primary" @click="handleSure">确 定</el-button>
        <el-button size="small" @click="handleClose">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getOrgTree, loadOrgTreeWithUser, getWithReject, postWithReject } from 'safe-component'

export default {
  name: 'EnterpriseUserSelector',
  props: {
    // 文案类
    placeholder: {
      type: String,
      default: '请选择人员'
    },
    dialogTitle: {
      type: String,
      default: '请选择人员'
    },
    // 样式类
    width: {
      type: Number,
      default: 200
    },
    size: {
      type: String,
      default: 'small'
    },
    popperClass: {
      type: String,
      default: 'enterprise-user-selector-dropdown'
    },
    dialogClass: {
      type: String,
      default: 'enterprise-user-dialog'
    },
    fullscreen: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    max: {
      type: Number
    },
    // 数据类
    userData: {
      type: Array,
      default () {
        return []
      }
    },
    tenantId: {
      type: [String, Number],
      require: true
    },
    orgId: {
      type: [String, Number],
      require: true
    },
    inputtype: {
      type: String,
      default: 'select'
    },
  },
  watch: {
    dialogVisible (val) {
      if (val) {
        this.initParams()
        this.getOrgTree(this.orgId)
        this.getPositionByTenantId()
      }
    }
  },
  data () {
    return {
      users: [],
      userTableData: [],
      rootAllUser: [],
      choosedUsers: [],
      choosedPosition: [],
      seachText: '',
      treeData: [],
      dialogVisible: false,
      // 树形组件
      defaultProps: {
        children: 'childNodes',
        label: 'name'
      },
      posiontOptions: [],
      expandedKeys: [],
      choosedUserData: [],
      timer: null,
      jobNames: '',
      curOrgUsers: [],
      curNodeOrgId: '',
      pageIndex: 1,
      pageSize: 200,
      loading: false,
      isHasMore: false
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    getMData () {
      this.pageIndex++;
      this.loading = true;
      if (this.seachText || this.choosedPosition.length > 0) {
          this.searchResult(true, 2)
        } else {
          this.searchResult(true, 0)
        }
    },
    initParams () {
      this.curNodeOrgId = this.orgId
      this.choosedUserData = JSON.parse(JSON.stringify(this.userData))
      this.pageIndex = 1
      this.searchResult(false, 0)
    },
    handleChange (data) {
      if (data.length === 0) {
        this.$emit('change', {
          userIds: [],
          userData: []
        })
      } else {
        const userData = this.rootAllUser.filter(item => {
          return data.indexOf(item.id) > -1
        })
        this.$emit('change', {
          userIds: data,
          userData: userData
        })
      }
    },
    init () {
      this.loading = true
      this.users = this.userData.map(item => {
        return item.id
      })
      this.rootAllUser = JSON.parse(JSON.stringify(this.userData))
      this.curNodeOrgId= this.orgId
      this.pageIndex = 1
      this.searchResult(false, 0)
    },
    handleSelectFocus () {
      this.dialogVisible = true
    },
    handleClose () {
      this.clear()
      this.dialogVisible = false
    },
    clear () {
      this.seachText = ''
      this.choosedUsers = []
      this.choosedUserData = []
      this.choosedPosition = []
      this.jobNames = ''
      this.curNodeOrgId = ''
    },
    handleNodeClick (node) {
      // 局指项目 使用realId
      this.loading = true
      const id = node.realId ? node.realId : node.id
      if (id !== this.curNodeOrgId) {
        this.curNodeOrgId = id
        this.pageIndex = 1
        if (this.seachText || this.choosedPosition.length > 0) {
          this.searchResult(false, 2)
        } else {
          this.searchResult(false, 0)
        }
      }
    },
    // ------------------------------------------数据加工------------------------------------------
    choosedCurUser (id) {
      return this.choosedUserData.some(item => {
        return item.id === id
      })
    },
    choosedUserTitle (data) {
      return data.name + (data.remark ? `(${data.remark})` : '')
    },
    expandedLevel (data) {
      for (let i = 0; i < data.length; i++) {
        this.expandedKeys.push(data[i].id)
      }
    },
    searchResult (flag, structType) {
      let params = {
        orgId: this.curNodeOrgId,
        filter: this.seachText,
        structType,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        jobCodeStr: this.jobNames
      }
      this.isHasMore = false
      const url = `/safety/containing-box-server/cloudt/user/getPageUsersByOrgIdAndFilter`
      postWithReject(url, params).then(res => {
        let arr = []
        res.list.length > 0 && res.list.forEach(item => {
          item.orgDeptJobs.forEach(element => {
            element.jobs = element.jobs || []
            let jobs = element.jobs.map(i => {
              return i.jobName
            }).join(',')
            element.orgFullName = element.orgFullName.indexOf('/') === 0 ? element.orgFullName.replace(/\//, '') : element.orgFullName
            arr.push({
              id: item.id + '',
              name: item.name,
              phone: item.mobileNumber || '',
              remark: jobs,
              orgFullName: element.orgFullName,
              orgId: element.orgId,
              projectId: element.projectId,
              orgName: element.orgName
            })
          })
        })
        if (flag) {
          this.curOrgUsers = this.curOrgUsers.concat(arr)
        } else {
          this.curOrgUsers = arr
        }
        this.isHasMore = res.hasNext
        this.loading = false
      }).catch(res => {
        this.curOrgUsers = []
        this.loading = false
      })
    },
    // ------------------------------------------基础交互------------------------------------------
    debounce () {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.pageIndex = 1
        if (this.seachText || this.choosedPosition.length > 0) {
          this.searchResult(false, 2)
        } else {
          this.searchResult(false, 0)
          this.loading = false
        }
      }, 300)
    },
    search () {
      this.loading = true
      this.debounce()
    },
    handlePositionChange (value) {
      this.loading = true
      this.jobNames = value.join(',')
      this.debounce()
    },
    handleSure () {
      const choosedUserIds = this.choosedUserData.map(item => {
        return item.id
      })
      this.users = choosedUserIds
      this.rootAllUser = this.choosedUserData
      this.$emit('change', {
        userIds: choosedUserIds,
        userData: this.choosedUserData
      })
      this.handleClose()
    },
    addUser (data) {
     if(!data.orgId){
      const currentOrgNode = this.$refs.EnterpriseUserSelectorOrgTree.getCurrentNode()
        data.orgId = currentOrgNode.id,
        data.orgName=currentOrgNode.name,
        data.orgFullName=currentOrgNode.fullName
     }
      if (this.max && this.choosedUserData.length >= this.max) {
        return
      }
      this.choosedUserData.unshift(data)
    },
    addAllUser(){
      this.curOrgUsers.forEach(ele=>{
        if (this.max && this.choosedUserData.length >= this.max) {
          return
        }
        if(this.choosedCurUser(ele.id)){
          return
        }
        this.addUser(ele)

      })

    },
    handleClear () {
      this.choosedUserData = []
    },
    handleDelete (data, index) {
      this.choosedUserData.splice(index, 1)
    },
    // ------------------------------------------数据方法------------------------------------------
    // 获取岗位
    getPositionByTenantId () {
      const url = `/safety/containing-box-server/common/post_list?tid=${this.tenantId}`
      getWithReject(url).then(res => {
        this.posiontOptions = res
      })
    },
    // 获取组织树
    getOrgTree (orgId) {
      getOrgTree(orgId).then(res => {
        this.treeData = res || []
        this.expandedLevel(res[0].childNodes)
        this.$nextTick(() => {
          this.$refs.EnterpriseUserSelectorOrgTree.setCurrentKey(res[0].id)
        })
      })
    },
    // 获取选中组织的人员
    getUsersByOrgId (orgId) {
      loadOrgTreeWithUser(orgId).then(res => {
        // 本层级人员
        res.projectUsers.forEach(item => {
          item.id = String(item.id)
        })
        this.userTableData = res.projectUsers || []
        this.curOrgUsers = this.userTableData
        this.loading = false
      })
    }
  }
}
</script>
<style lang="less">
.enterprise-user-selector-wrapper {
  .el-select__caret.el-icon-arrow-up {
    display: none;
  }
}
.enterprise-user-dialog {
  .el-dialog__header {
    border-bottom: 1px solid #E4E8F4;
    padding: 10px 20px;
  }
  .el-dialog__body {
    padding: 20px;
    height: 470px;
  }
  .el-dialog__footer {
    border-top: 1px solid #E4E8F4;
    padding: 10px 20px;
  }
  .el-dialog__headerbtn {
    top: 13px;
  }
  .enterprise-user-dialog-content,.el-row,.el-col {
    height: 100%;
    overflow: hidden;
  }
  .enterprise-user-dialog-content {
    border: 1px solid rgba(220,222,227,1);
    border-radius: 2px;
  }
  .el-input__icon.el-input__validateIcon.el-icon-circle-close {
    display: none;
  }
  .el-table th {
    background-color: #fff;
  }
  .el-tree .el-tree-node__content {
    font-size: 14px;
    height: 34px;
    color: #333;
  }
  .el-tree .el-tree-node.is-current > .el-tree-node__content {
    background-color: #4888F4;
  }
  .el-tree .el-tree-node.is-current > .el-tree-node__content span {
    color: #fff;
  }
  .el-tree span.el-tree-node__expand-icon {
    font-size: 14px;
    color: #000;
  }
  .el-tree span.el-tree-node__expand-icon.is-leaf {
    color: transparent;
    cursor: default;
  }
  .el-tree .el-tree-node.is-current>.el-tree-node__content span.el-tree-node__expand-icon.is-leaf {
    color: transparent;
    cursor: default;
  }
  .el-input__icon.el-input__validateIcon.el-icon-circle-check {
    display: none;
  }
  .grid-content {
    /* height: 100%; */
    .grid-content-header {
      height: 40px;
      background: #EBECF0;
      line-height: 40px;
      padding-right: 12px;
    }
    .org-users {
      -height: 40px;
      -background: #EBECF0;
      -line-height: 40px;
    }
    .el-tree-node__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .textIndent12 {
      text-indent: 12px;
    }
    .add-btn {
      display: inline-block;
      width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      color: #fff;
      background: #4888F4;
      cursor: pointer;
      border-radius: 2px;
      &:hover {
        background: #6da0f6;
      }
    }
    .add-btn-disabled {
      background: #ccc;
      cursor: not-allowed;
      &:hover {
        background: #ccc;
      }
    }
    .delete {
      cursor: pointer;
      &:hover {
        color: #4888F4;
      }
    }
  }
  ::-webkit-scrollbar,
  ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
  }
  ::-webkit-scrollbar-thumb,
  ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background: #dddddd;
  }
  ::-webkit-scrollbar-track,
  ::-webkit-scrollbar-track {
      border-radius: 5px;
  }
  .text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.enterprise-user-selector-dropdown {
  display: none;
}
</style>
