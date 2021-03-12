<!--
    /**
     * 下拉选择组件，下拉框展示列表结构（输入关键字查询，从服务器实时搜索数据，
     * 示例：安全检查台账：过滤条件，整改人和检查人
     * @author zhanghw-d
      * @date 2019-08-10
     * 调用示例：
     *     <remote-filter-select
     *                   class="filter-item"
     *                   size="medium" // 输入框大小，和select一致
     *                   :data="checkersList" // 下拉框列表
     *                   multiple // 多选
     *                   clearable // 可清空选择
     *                   collapseTags // 多选时将选中值按文字的形式展示
     *                   placeholder="检查人：全部" //placeholder
     *                   :width="180" // 下拉框select的input宽度
     *                   :dropdownWidth="400" // 下拉框宽度
     *                    :nodeType=""//节点类型，user用户的需要显示phone，其他的仅显示名字         
     *                   @remote-method="remoteGetCheckers" // 根据查询条件从服务器中请求数据的方法
     *                  @change="setSelCheckers" // 选择值变化回调
     *                 >
     *       </remote-filter-select>
     */
-->
<template>
    <div class="select-remote-filter">
        <div class="mask" v-show="isShowSelect" @click="isShowSelect = !isShowSelect"></div>
        <el-popover
            placement="bottom-start"
            :width="dropdownWidth"
            trigger="manual"
            v-model="isShowSelect"
            :popper-class="popperClass"
            @show="popoverShow"
            @hide="popoverHide">
            <div :style="popoverStyle" >
                <el-input
                    v-model.trim="searchKey"
                    suffix-icon="el-icon-search"
                    placeholder="精确搜索可查询更多选项"
                    size="small">
                </el-input>
               <el-scrollbar class="select-remote-filter-bar" style="height:calc(100% - 40px)">
                <ul class="sf-select-dropdown__list">
                    <li
                        v-for="(node,index) in data"
                        :key="index"
                        class="sf-select-dropdown__item"
                        :class="{selected:checkedIds.indexOf(node.id)>-1}"
                        @click.stop="handleNodeClick(node)"
                        >
                        <div v-if="nodeType==='user'" :title="node.name">
                            {{node.name}}({{node.phone?node.phone:'无电话号码'}})
                        </div>
                        <div class="multi-lines" v-else-if="nodeType==='userWithJob'" >
                            <div :title="node.jobNameStr?node.name+`(${node.jobNameStr})`:node.name">{{node.name}}{{node.jobNameStr? `(${node.jobNameStr})`:''}}</div>
                            <div class="sub-title">电话:{{node.phone?node.phone:'无'}}</div>
                        </div>
                        <div v-else :title="node.name">
                          {{node.name}}
                      </div>
                    </li>
                </ul>
                <ul class="el-table__empty-text" 
                    v-if="!data || data.length===0"
                    style="width: 100%;text-align: center;padding: 0;margin: 0;">
                    暂无数据
                </ul>
              </el-scrollbar>
            </div>
            <el-select
              slot="reference"
              :style="selectStyle"
              :placeholder="placeholder"
              ref="select"
              :size="size"
              v-model="selectedData"
              :title="titleLabel"
              :multiple="multiple"
              :disabled="disabled"
              :clearable="clearable"
              :collapse-tags="collapseTags"
              @click.native="handleSelectClick"
              @remove-tag="removeSelectedNodes"
              @clear="clearAllSelectedNodes"
              class="select-remote-filter">
                <el-option
                  v-for="(item,index) in checkedData"
                  :key="index"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
        </el-popover>
    </div>
</template>

<script>
export default {
  name: 'select-remote-filter',
  props: {
    // 列表数据
    data: {
      type: Array,
      default () {
        return []
      }
    },
    // 配置是否可多选
    multiple: {
      type: Boolean,
      default () {
        return false
      }
    },
    multipleLimit: {
      type: Number,
      default: 100
    },
    // 配置是否可清空选择
    clearable: {
      type: Boolean,
      default () {
        return false
      }
    },
    // 配置多选时是否将选中值按文字的形式展示
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

    width: {// select组件输入框宽度
      type: [Number, String],
      default: 250
    },
    dropdownWidth: {// 下拉框宽度
      type: [Number, String],
      default () {
        return this.width
      }
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
    popperClass: {
      type: String,
      default: 'select-popover'
    },
    // 默认选中的节点key数组
    checkedKeys: {
      type: Array,
      default () {
        return []
      }
    },
    checkedOptions: {
      type: Array,
      default () {
        return []
      }
    },
    nodeType:{//节点类型，user用户的需要显示phone，userWithJob:显示岗位名字，其他的仅显示名字
      type: String,
      default:'user'
    }

  },
  data () {
    return {
      isShowSelect: false, // 是否显示选择器
      checkedIds: [], // 所有被选中的节点的 key 所组成的数组数据
      checkedData: [], // 所有被选中的节点所组成的数组数据
      titleLabel: '',
      element: '',
      searchKey: '' // 过滤条件
    }
  },
  computed: {
    popoverStyle () {
      let width
      if (typeof this.dropdownWidth === 'number') {
        width = (this.dropdownWidth - 24) + 'px'
      } else {
        width = this.dropdownWidth
      }
      return `width:${width};height:${this.height}px`
    },
    selectStyle () {
      return typeof this.width === 'number' ? ('width:' + this.width + 'px;') : ('width:' + this.width + ';')
    },
    selectedData(){
      let selectedData
      if(this.multiple){
        selectedData =  this.checkedIds
      }else{
        if(this.checkedIds && this.checkedIds.length>0){
          selectedData = this.checkedIds[0]
        
        }else{
          selectedData = null
        }
      }
      return selectedData
    }

  },
  mounted () {
    this.initCheckedData()
  },
  methods: {
    handleSelectClick () {
      if (this.disabled) {
        return
      }
      this.isShowSelect = !this.isShowSelect
    },
    // 清空所有勾选
    clearAllSelectedNodes () {
      this.checkedIds =  []
      this.checkedData =  []
      this.searchKey = ''
      this.fireChange()
    },
    initCheckedData () {
      this.checkedIds = this.checkedKeys || []
      this.checkedData = this.checkedOptions || []
      this.searchKey = ''
    },
    popoverHide () {
      this.searchKey = ''
    },
    getCheckedData (node) {
      let destindex = this.checkedIds.indexOf(node.id)
      
      if (destindex > -1) { // 删除
        this.checkedIds.splice(destindex, 1)
        this.checkedData.splice(destindex, 1)
      } else { // 添加
        if(this.multiple){
          this.checkedIds.push(node.id)
          this.checkedData.push(node)
        }else{
          this.checkedIds = [node.id]
          this.checkedData = [node]
        }

      }
    },
    // 节点被点击时的回调,返回被点击的节点数据
    handleNodeClick (node) {
      if (this.multiple) {
        this.handleCheckChange(node)
      } else {
        this.handleCheckChange(node)
        this.isShowSelect = !this.isShowSelect
      }
    },
    // 多选，节点勾选状态发生变化时的回调
    handleCheckChange (node) {
      this.getCheckedData(node)
      this.fireChange()
    },
    // 多选，节点勾选状态发生变化时的回调
    handleSingleCheckChange (node) {
      this.getCheckedData(node)
      this.fireChange()
    },
    // 多选,删除任一select选项的回调
    removeSelectedNodes (val) {
      this.getCheckedData({id:val})
      this.fireChange()
    },
    popoverShow () {
      this.searchKey = ''
    },
    fireChange () {
      this.$emit('change', {checkedIds:this.checkedIds, checkedData:this.checkedData})
    }
  },
  watch: {
    isShowSelect (val) {
      // 隐藏select自带的下拉框
      this.$refs.select.blur()
    },

    searchKey (newVal, oldVal) {
      if (this.searchTimeTicket) {
        clearTimeout(this.searchTimeTicket)
      }
      this.searchTimeTicket = setTimeout(() => {
        this.$emit('remote-method', newVal)
      }, 500)
    },
    checkedKeys (val) {
      if (!val) return
      this.checkedIds = val
    },
    checkedOptions (val) {
      if (!val) return
      this.checkedData = val
    },
    checkedData (newVal, oldVal) {
      let nameArr = []
      newVal.forEach(ele => {
        nameArr.push(ele.name)
      })

      this.titleLabel = nameArr.join(',')
    }
  }
}

</script>
<style lang="less">
@import '../assets/less/colors.less';
.select-remote-filter{
    .mask {
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        opacity: 0;
        z-index: 1000;
    }
    span.el-select__tags-text{
        display: inline-block;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        max-width: 55px;
    }

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
        line-height: 34px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        cursor: pointer;

        &>*{
          display: inline-block;
        }


        &.hover, &:hover {
            background-color: #F5F7FA;
        }

        &.selected {
            color: @Brand;
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

        .multi-lines{
          width: calc(100% - 20px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          .sub-title{
            font-size: 12px;
            line-height: 20px;
          }

        }
    }
}
.select-remote-filter-bar .el-scrollbar__wrap{
  overflow-x: hidden ;
}

.select-remote-filter {
    z-index: 111;
    .el-select .el-tag__close.el-icon-close{
        top:-7px;
    }
}

</style>
