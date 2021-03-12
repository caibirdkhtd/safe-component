<template>
  <div class="CheckTableSelector-wrap">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :custom-class="dialogClass"
      :width="multiple?'1100px':'900px'"
      :append-to-body="true"
      :before-close="handleClose">
      <div class="bind-check-table-dialog-content" >
        <el-row>
          <el-col :span="6">
            <div class="grid-content">
              <div class="grid-content-header textIndent12 ">检查表类别</div>
              <div class="type-tree">
                <el-tree
                  ref="typpTree"
                  :expand-on-click-node="false"
                  node-key="id"
                  :data="typeTreeData"
                  :props="defaultProps"
                  @node-click="handleNodeClick">
                  <span class="custom-tree-node text-ellipsis" slot-scope="{node}" :title="node.label">{{ node.label }}</span>
                </el-tree>
              </div>
            </div>
          </el-col>

          <el-col class="table-list" :span="multiple?12:18">
            <div class="tool-bar textIndent12">
              <span>检查表</span>
              <div style="float: right;margin-right: 12px;">
                <el-input
                  v-model.trim="seachText"
                  size="small"
                  placeholder="按检查表搜索"
                  suffix-icon="el-icon-search"
                  clearable>
                </el-input>
              </div>
            </div>
            <div class="grid-content">
              <el-table
                :data="this.seachText?filterTableList:tableList"
                height="390"
                style="width: 100%"
                @row-click="selectRow"
                >
                <el-table-column
                  v-if="!multiple"
                  width="60"
                  align="center"
                  prop="id">
                  <template slot-scope="scope">
                      <el-radio :value="choosedId" :label="scope.row.id" @change="chooseSingle(scope.row)"></el-radio>
                  </template>
                </el-table-column>
                <el-table-column
                  type="index"
                  label="序号"
                  align="center"
                  width="60">
                </el-table-column>
                <el-table-column
                  prop="name"
                  label="检查表">
                  <template slot-scope="scope">
                    <div class="text-ellipsis" :title="scope.row.name">《{{scope.row.name}}》</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="orgName"
                  label="上传单位">
                  <template slot-scope="scope">
                    <div class="text-ellipsis" :title="scope.row.orgName">{{scope.row.orgName}}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="multiple"
                  prop="phone"
                  width="80"
                  align="center"
                  label="操作">
                  <div slot-scope="scope">
                    <span v-if="choosedCurItem(scope.row.id)">已添加</span>
                    <div class="add-btn" v-else @click="addItem(scope.row)">+</div>
                  </div>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
          <el-col v-if="multiple" :span="6">
            <div class="grid-content">
              <div class="grid-content-header textIndent12">
                <span>已选({{curChoosedDatas.length}}/{{maxNum}})</span>
                <el-button
                  size="small"
                  style="float: right;margin-top: 4px;"
                  @click="handleClear">
                  清空
                </el-button>
              </div>
              <el-table
              :data="curChoosedDatas"
              height="390"
              style="width: 100%"
              :show-header="false">
              <el-table-column
                prop="name"
                label="检查表">
                <template slot-scope="scope">
                  <div class="text-ellipsis" :title="scope.row.name">《{{scope.row.name}}》</div>
                </template>
              </el-table-column>
              <el-table-column
                prop="phone"
                width="50"
                align="center"
                label="删除">
                <div slot-scope="scope">
                  <span class="btn-del iconfont icon-shanchu1" @click="handleDelete(scope.row)"></span>
                </div>
              </el-table-column>
            </el-table>
            </div>
          </el-col>

        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" @click="handleSure">确 定</el-button>
        <el-button size="small" @click="handleClose">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getWithReject, postWithReject } from 'safe-component'
export default {
name: 'CheckTableSelector',
props: {
  dialogTitle: {
    type: String,
    default: '选择检查表'
  },
  dialogClass: {
    type: String,
    default: 'bind-check-table-dialog'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  maxNum: {
    type: Number,
    default: 5
  },
  chooseData: {//单选
    type: Object,
    default () {
      return {}
    }
  },
  chooseDatas: {//多选
    type: Array,
    default () {
      return []
    }
  },
},
watch: {
  seachText (newData, oldData) {
    if (!newData) {
      return false
    }
    if (this.queryTimer) { clearTimeout(this.queryTimer) }
    this.queryTimer = setTimeout(() => {
      this.filterTable()
    }, 500)
  }

},
data () {
  return {
    typeTreeData: [],//类别树
    tableList: [],//检查表
    filterTableList: [],//按过滤条件过滤后检查表
    choosedId: null,//单选选中的id
    curChooseData: null,//单选选中的对象
    choosedIds: [],//多选选中的ids
    curChoosedDatas: [],//多选选中的对象数组
    dialogVisible: true,
    seachText: '',
    // 树形组件
    defaultProps: {
      children: 'children',
      label: 'name'
    },
    posiontOptions: []
  }
},
computed: {
  ...mapState(['orgId', 'orgFullId', 'orgFullName'])
},
mounted () {
  this.init()
},
methods: {
  init () {
    if (!this.multiple && this.chooseData) {
      this.choosedId = this.chooseData.id
      this.curChooseData = this.chooseData
    }
    if(this.multiple && this.chooseDatas && this.chooseDatas.length>0){
      this.curChoosedDatas = this.chooseDatas
      let ids = []
      this.chooseDatas.forEach(ele=>{
        ids.push(ele.id)
      })
      this.choosedIds = ids
    }
    this.loadCheckTableTypeTree()
  },
  handleClose () {
    this.$emit('close')
  },
  handleNodeClick (node) {
    this.getCheckTableList(node.id)
  },
  choosedCurItem (id) {
    return this.choosedIds.indexOf(id) > -1
  },
  // ------------------------------------------基础交互------------------------------------------

  handleSure () {
    if (this.multiple) {
      if (this.choosedIds.length === 0) {
        this.$message.error(`未选择检查表`)
        return false
      }
      this.$emit('change', this.choosedIds, this.curChoosedDatas)
    } else {
      if (!this.choosedId) {
        this.$message.error(`未选择检查表`)
        return false
      }
      this.$emit('change', this.choosedId, this.curChooseData)
    }
  },
  addItem (data) {
    if (this.choosedIds && this.choosedIds.length >= this.maxNum) {
      this.$message.error(`最多支持选择${this.maxNum}张检查表`)
      return false
    }
    this.choosedIds.push(data.id)
    this.curChoosedDatas.push(data)
  },
  handleClear () {
    this.curChoosedDatas = []
    this.choosedIds = []
  },
  handleDelete (id) {
    let destIndex = this.curChoosedDatas.indexOf(id)
    this.curChoosedDatas.splice(destIndex, 1)
    this.choosedIds.splice(destIndex, 1)
  },
  filterTable () {
    this.filterTableList = this.tableList.filter(table => {
      return table.name.includes(this.seachText)
    })
  },
  chooseSingle (data) {
    this.choosedId = data.id
    this.curChooseData = data
  },
  // ------------------------------------------数据方法------------------------------------------
  loadCheckTableTypeTree () {
    getWithReject(`/safety/safety-large-machinery/generic/type/2/loadTypeTree`)
      .then(res => {
        this.typeTreeData = res || []
        this.$nextTick(() => {
          if (this.typeTreeData && this.typeTreeData.length > 0) {
            this.$refs.typpTree.setCurrentKey(this.typeTreeData[0].id)
            this.getCheckTableList(this.typeTreeData[0].id)
          }
        })
      })
  },
  // 获取检查表
  getCheckTableList (typeId) {
    let params = {
      pageIndex: 1,
      pageSize: 9999,
      orgId: this.orgId,
      typeId: typeId,
      fullId: this.orgFullId,
      fullName: this.orgFullName
    }
    postWithReject(`/safety/safety-large-machinery/checkTableLib/table/paging`, params)
      .then(data => {
        this.tableList = data.list || []
        if (this.seachText) {
          this.filterTable()
        }
      }, (errordata) => {
        this.tableList = []
        this.$message.error(errordata.message || '查询失败')
      })
  },

  selectRow(row, column, event){
    if(!this.multiple){
      this.choosedId = row.id
      this.curChooseData = row
    }
  }

}
}
</script>
<style lang="less">
.CheckTableSelector-wrap {

}
.bind-check-table-dialog {
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
  .type-tree{
    overflow-y: auto;
    height: calc(~'100% - 40px');
  }
  .el-tree {
    overflow: hidden;
  }
  .table-list{
    border-left: 1px solid #DCDEE3;
    border-right: 1px solid #DCDEE3;
    .tool-bar{
      height: 40px;
      line-height: 40px;
      background: #EBECF0;
      padding-left: 12px;
    }
  }
  .bind-check-table-dialog-content,.el-row,.el-col {
    height: 100%;
    overflow: hidden;
  }
  .bind-check-table-dialog-content {
    border: 1px solid rgba(220,222,227,1);
    border-radius: 2px;
  }
  .el-input__icon.el-input__validateIcon.el-icon-circle-close {
    display: none;
  }
  .grid-content {
    height: 100%;
    .grid-content-header {
      height: 40px;
      background: #EBECF0;
      line-height: 40px;
      padding-right: 12px;
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
  }
  .text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .el-table th {
    background-color: transparent;
  }
  .btn-del{
    color: #333;
    cursor: pointer;
  }
  .el-radio{
    line-height: 34px ;
     .el-radio__input{
      line-height: 34px ;
     }
     .el-radio__label{
       display: none;
     }
  }
}

</style>
