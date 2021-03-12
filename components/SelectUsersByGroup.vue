<!--
  下拉选择组件，下拉框展示分组列表结构，支持搜索
  示例： 项目层基础设置-通知人
-->
<template>
  <div class="select-user-by-group" ref="wrap" :style="{width: width}">
    <div class="mask" v-show="isShowSelect" @click="isShowSelect = !isShowSelect"></div>
    <el-popover
      placement="bottom-start"
      :width="dropdownWidth"
      trigger="manual"
      v-model="isShowSelect"
      :popper-class="popperClass"
      @show="popoverShow"
      @hide="popoverHide">
      <div :style="style" >
        <el-input
          v-model.trim="searchKey"
          suffix-icon="el-icon-search"
          placeholder="在此搜索"
          size="small">
        </el-input>
        <el-scrollbar class="select-remote-filter-bar" style="height:calc(100% - 40px)">
          <template v-if="filterUsers.length > 0">
            <ul v-for="(item,index) in filterUsers" :key="index" class="sf-select-dropdown__list">
              <template v-if="item.label">
                <li class="label-name" @click="expandItem(item, index)">
                  <i v-if="item.options.length > 0" :class="[item.isExpand ? 'el-icon-arrow-down':'el-icon-arrow-right']"></i>
                  <span>{{item.label}}</span>
                </li>
                <li>
                  <ul v-if="item.isExpand">
                    <li
                      v-for="node in item.options"
                      :key="node.id"
                      class="sf-select-dropdown__item"
                      :class="{selected:checkedIds.indexOf(node.id)>-1 || checkedIds.indexOf(node.id + '')>-1}"
                      @click.stop="handleNodeClick(node)">
                      <span :title="node.name+(node.remark?'('+node.remark+')':'')" class="select-name">
                          {{node.name}}{{node.remark?'('+node.remark+')':''}}
                      </span>
                      <span style="float: right;margin-right: 10px;">{{node.phone}}</span>
                    </li>
                  </ul>
                </li>
                <div v-show="item.options.length <= 0" style="text-align: center">暂无数据</div>
              </template>
              <template v-else>
                <li
                  v-for="node in item"
                  :key="node.id"
                  class="sf-select-dropdown__item"
                  :class="{selected:checkedIds.indexOf(node.id)>-1 || checkedIds.indexOf(node.id + '')>-1}"
                  @click.stop="handleNodeClick(node)">
                  <span :title="node.name" class="overName">
                      {{node.name}}{{node.remark?'('+node.remark+')':''}}
                  </span>
                  <span style="float: right;">{{node.phone}}</span>
                </li>
              </template>
            </ul>
          </template>
          <template v-if="filterUsers.length <= 0 && filterUsers.label">
            <span>暂无数据</span>
          </template>
        </el-scrollbar>
      </div>
      <el-select
        slot="reference"
        style="width : 100%"
        :placeholder="placeholder"
        :size="size"
        v-model="checkedIds"
        :title="titleLabel"
        :multiple="multiple"
        :disabled="disabled"
        :clearable="clearable"
        :collapse-tags="collapseTags"
        popper-class="option-class"
        @click.native="handleSelectClick"
        @remove-tag="removeSelectedNodes"
        @clear="clearAllSelectedNodes"
        @visible-change="visibleChange"
        class="select-remote-filter">
        <el-option-group
          v-for="item in filterUsers"
          :key="item.label"
          :label="item.label">
          <el-option
            v-for="element in item.options"
            :key="element.id"
            :label="element.name"
            :value="checkedIds.indexOf(element.id) > -1 ? element.id : (element.id + '')">
          </el-option>
        </el-option-group>
      </el-select>
  </el-popover>
</div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'SelectUsersByGroup',
  props: {
    // 下拉选择里的所有人员 格式为： [label: '', options: []]
    parentUsers: {
      type: Array,
      required: false,
      default () {
        return []
      }
    },
    // 已选择的用户信息列表 object数组
    selectUsers: {
      type: Array,
      required: true,
      default () {
        return []
      }
    },
    // 已选择的用户ID列表 string数组
    selectedIds: {
      type: Array,
      required: true,
      default () {
        return []
      }
    },
    // 配置是否可多选
    multiple: {
      type: Boolean,
      default () {
        return true
      }
    },
    // 配置是否可清空选择
    clearable: {
      type: Boolean,
      default () {
        return false
      }
    },
    collapseTags: {
      type: Boolean,
      default () {
        return false
      }
    },
    size: {
      type: String,
      default () {
        return 'small'
      }
    },
    isVisible: {
      type: Boolean,
      default () {
        return false
      }
    },
    width: {
      type: String,
      default: '80%'
    },
    height: {
      type: Number,
      default () {
        return 300
      }
    },
    placeholder: {
      type: String,
      default () {
        return '请选择'
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isDivided: {
      type: Boolean,
      default: false
    },
    popperClass: {
      type: String,
      default: 'select-popover'
    },
    max: {
      type: Number,
      default: 0, // 表示无限制
      required: false
    },
    // 展示的标签名字
    labels: {
      type: Array,
      required: false,
      default () {
        return ['项目人员', '上级组织人员']
      }
    },
    onlyProjectUsers: {
      type: Boolean,
      default: false
    },
    // 下拉框最小的宽度
    minWidth: {
      type: Number,
      required: false,
      default: 340
    }
  },
  data () {
    return {
      isShowSelect: false,
      style: '',
      checkedIds: [],
      checkedData: [],
      titleLabel: '',
      element: '',
      dropdownWidth: '',
      searchKey: '',
      wrapWidth: '',
      addNodes: [],
      removeModes: [],
      filterUsers: [],
      checkedName: ''
    }
  },
  computed: {
    ...mapState(['allUsers', 'orgUsers', 'projectUsers']),
    users () {
      let arr = []
      if (this.parentUsers.length > 0) {
        arr = this.parentUsers
      } else {
        arr.push({
          label: this.labels[0],
          options: this.projectUsers,
          isExpand: true
        })
        if (!this.onlyProjectUsers) {
          arr.push({
            label: this.labels[1],
            options: this.orgUsers,
            isExpand: false
          })
        }
      }
      return arr
    }
  },
  watch: {
    users: {
      handler (newVal) {
        this.filterUsers = newVal
      },
      deep: true,
      immediate: true
    },
    wrapWidth (val) {
      this.dropdownWidth = val < this.minWidth ? this.minWidth : val
      this.style = `width:${val};height:${this.height}px;min-width: 300px;`
    },
    selectUsers: {
      handler (val, oldVal) {
        this.checkedData = val
      },
      deep: true,
      immediate: true
    },
    selectedIds: {
      handler (val, oldVal) {
        this.checkedIds = val
      },
      deep: true,
      immediate: true
    },
    searchKey (newVal, oldVal) {
      if (this.searchTimeTicket) {
        clearTimeout(this.searchTimeTicket)
      }
      this.searchTimeTicket = setTimeout(() => {
        this.handleSearch(newVal)
      }, 500)
    },
    checkedData (newVal, oldVal) {
      if (this.isDivided) return
      let nameArr = []
      newVal.forEach(ele => {
        nameArr.push(ele.name || ele.userName)
      })
      this.titleLabel = nameArr.join(',')
    }
  },
  mounted () {
    const that = this
    window.onresize = () => {
      return (() => {
        that.wrapWidth = this.$refs && this.$refs.wrap.offsetWidth - 26
      })()
    }
  },
  methods: {
    expandItem (item, index) {
      this.$set(this.filterUsers[index], 'isExpand', !item.isExpand)
    },
    search (val) {
      this.filterUsers = []
      if (this.parentUsers.length > 0) {
        this.filterUsers = this.parentUsers.filter(item => {
          return item.name.indexOf(val) > -1
        })
      } else {
        let arr = this.allUsers.filter(item => {
          return item.name.indexOf(val) > -1
        })
        let projectUsers = arr.filter(item => {
          return item.type === 0
        })
        let orgUsers = arr.filter(item => {
          return item.type === 1
        })
        this.filterUsers.push({
          label: this.labels[0],
          options: projectUsers,
          isExpand: true
        })
        if (!this.onlyProjectUsers) {
          this.filterUsers.push({
            label: this.labels[1],
            options: orgUsers,
            isExpand: true
          })
        }
      }
    },
    handleSearch (val) {
      val && this.search(val)
      !val && (this.filterUsers = this.parentUsers.length > 0 ? this.parentUsers : this.users)
    },
    visibleChange (val) {
      if (val) {
        let width = this.$refs.wrap.offsetWidth - 26
        this.dropdownWidth = width < this.minWidth ? this.minWidth : width
        this.style = `width:${this.dropdownWidth};height:${this.height}px;min-width: 300px;`
      }
    },
    handleSelectClick () {
      if (this.disabled) {
        return
      }
      this.isShowSelect = !this.isShowSelect
    },
    // 清空所有勾选
    clearAllSelectedNodes () {
      this.initCheckedData()
      this.fireChange()
    },
    initCheckedData () {
      if (this.multiple) {
        this.checkedIds = []
        this.searchKey = ''
      } else {
        this.checkedIds = ''
        this.checkedName = ''
      }
    },
    popoverHide () {
      this.fireChange()
    },
    getCheckedData (node) {
      if (this.multiple) {
        if (this.max === 1) {
          if (String(node.id) !== String(this.checkedIds[0])) {
            this.removeModes.push(this.checkedData[0])
            this.checkedIds.splice(0, 1, node.id)
            this.checkedData.splice(0, 1, node)
            this.addNodes.push(node)
          }
          return
        }
        let destindex = this.checkedIds.indexOf(node.id)
        if(destindex === -1){
          destindex = this.checkedIds.indexOf(node.id + '')
        }
        if (destindex > -1) {
          // let item = this.checkedIds.splice(destindex, 1)
          this.checkedData.splice(destindex, 1)
          this.removeModes.push(node)
        } else {
          if (this.max !== 0 && this.checkedIds.length >= this.max) {
            this.$message({
              message: `最多选择${this.max}个`,
              type: 'error'
            })
            return
          }
          this.addNodes.push(node)
          this.checkedIds.push(node.id)
          this.checkedData.push(node)
        }
      } else {
        this.checkedIds = node.id
        this.checkedName = node.name
      }
    },
    // 节点被点击时的回调,返回被点击的节点数据
    handleNodeClick (node) {
      if (this.multiple && this.max !== 1) {
        this.handleCheckChange(node)
      } else {
        this.handleCheckChange(node)
        this.isShowSelect = !this.isShowSelect
      }
    },
    // 多选，节点勾选状态发生变化时的回调
    handleCheckChange (node) {
      this.getCheckedData(node)
      // this.fireChange()
    },
    removeSelectedNodes (val) {
      this.addNodes = []
      this.removeModes = []
      let destindex = this.checkedData.findIndex((ele) => {
        return ele.id === val || ele.userId === val
      })
      this.removeModes = this.checkedData.slice(destindex, destindex + 1)
      this.checkedData.splice(destindex, 1)
      this.fireChange()
    },
    popoverShow () {
      this.searchKey = ''
      this.removeModes = []
      this.addNodes = []
    },
    fireChange () {
      if (this.multiple) {
        if (this.isDivided) {
          this.$emit('change', this.addNodes, this.removeModes)
        } else {
          this.$emit('change', this.checkedIds, this.checkedData)
        }
      } else {
        this.$emit('change', {
          id: this.checkedIds,
          name: this.checkedName
        })
      }
    }
  }

}
</script>
<style lang="less">
.select-user-by-group{
  cursor: pointer;
  display: inline-block;
  position: relative;
  .mask {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: 11;
  }
  span.el-select__tags-text{
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 55px;
  }
  .el-select .el-tag__close.el-icon-close{
    top:-7px;
  }
}
.label-name{
  font-size: 16px;
  line-height: 40px;
  cursor: pointer;
}
.select-name{
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
.option-class{
  display: none;
}
.overName{
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
.select-remote-filter-bar{
  .sf-select-dropdown__list{
    list-style: none;
    padding: 6px 0;
    margin: 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .sf-select-dropdown__item{
    font-size: 14px;
    padding: 0 20px;
    padding-right: 32px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #606266;
    height: 34px;
    line-height: 34px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    cursor: pointer;
    &.hover, &:hover {
        background-color: #F5F7FA;
    }

    &.selected {
        color: #4888F4;
        background-color: #FFF;
        font-weight: 700;
    }

    &.selected::after{
        position: absolute;
        font-family: element-icons;
        right: 20px;
        content: "\e6da";
        font-size: 12px;
        font-weight: 700;
        -webkit-font-smoothing: antialiased;
    }
  }
}
.select-remote-filter-bar .el-scrollbar__wrap{
  overflow-x: hidden ;
}
</style>
