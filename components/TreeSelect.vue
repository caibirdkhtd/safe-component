<!--
    /**
     * 树形下拉选择组件，下拉框展示树形结构，提供选择某节点功能，方便其他模块调用
     * 示例:风险管控
     * @author zhanghw-d
     * @date 2019-06-13
     * 调用示例：
     * <tree-select :height="400" // 下拉框中树形高度
     *              :width="200" // 下拉框select的input宽度
     *              :dropdownWidth="400"// 下拉框中树形宽度
     *              size="small"  // 输入框的尺寸: medium/small/mini
     *              :data="data" // 树结构的数据
     *              :defaultProps="defaultProps" // 树结构的props
     *              multiple   // 多选
     *              clearable   // 可清空选择
     *              collapseTags   // 多选时将选中值按文字的形式展示
     *              checkStrictly // 多选时，严格遵循父子不互相关联
     *              :nodeKey="nodeKey"   // 绑定nodeKey，默认绑定'id'
     *               :defaultExpandAll="false"//默认展开全部节点
     *               :defaultExpandedKeys="defaultExpandedKeys"//默认展开指定节点
     *              :checkedKeys="defaultCheckedKeys"  // multiple:true时设置，传递默认选中的节点key组成的数组
     *              @popoverHide="popoverHide"> // 事件有两个参数：第一个是所有选中的节点ID，第二个是所有选中的节点数据
     *              </tree-select>
     */
-->
<template>
    <div class="tree-select">
        <div class="mask" v-show="isShowSelect" @click="isShowSelect = !isShowSelect"></div>
        <el-popover
                placement="bottom-start"
                :width="dropdownWidth"
                trigger="manual"
                v-model="isShowSelect"
                :popper-class="popperClass"
                @show="popoverShow"
                @hide="popoverHide">
            <div :style="popoverStyle">
                <el-input
                        size="small"
                        suffix-icon="el-icon-search"
                        placeholder="输入关键字进行过滤"
                        v-model.trim="filterText">
                </el-input>
                <el-scrollbar class="tree-select-bar" ref="scrollBar" style="height:calc(100% - 40px)">
                    <el-tree
                            :id="treeId"
                            class="common-tree"
                            ref="tree"
                            :data="data"
                            :props="defaultProps"
                            :show-checkbox="multiple"
                            :node-key="nodeKey"
                            :check-strictly="checkStrictly"
                            :default-expanded-keys="defaultExpandedKeys"
                            :default-expand-all="defaultExpandAll"
                            :expand-on-click-node="false"
                            :check-on-click-node="multiple"
                            :highlight-current="true"
                            @node-click="handleNodeClick"
                            @check-change="handleCheckChange"
                            :filter-node-method="filterNode">
                        <template slot-scope="scope">
              <span class="tree-item text-ellipsis"
                    :style="
                  {cursor: (singleDisabled(scope.data)
                  || (checkedIds ? checkedIds.length >= multipleLimit : false)) ? 'not-allowed' : 'pointer',
                  color: (singleDisabled(scope.data)
                  || (checkedIds ? checkedIds.length >= multipleLimit : false))  ? '#ccc' : '#606266'}"
                    :title="filterData(scope.data[defaultProps.label])">
                  <div class="text-ellipsis">
                    <span>{{filterData(scope.data[defaultProps.label])}}</span>
                  </div>
              </span>
                        </template>
                    </el-tree>
                </el-scrollbar>
            </div>
            <el-select
                    :style="selectStyle"
                    :placeholder="placeholder"
                    slot="reference"
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
                    @clear="removeSelectedNode"
                    @change="changeSelectedNodes"
                    class="tree-select">
                <el-option
                        :style="selectStyle"
                        v-for="item in options"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                </el-option>
            </el-select>
        </el-popover>
    </div>
</template>

<script>
  export default {
    name: 'tree-select',
    props: {
      // 树结构数据
      data: {
        type: Array,
        default () {
          return []
        }
      },
      // 树形标识
      defaultProps: {
        type: Object,
        default () {
          return {
            children: 'childNodes',
            label: 'name',
            value: 'id',
            fullName: 'fullName'
          }
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
      nodeKey: {
        type: String,
        default () {
          return 'id'
        }
      },
      // 显示复选框情况下，是否严格遵循父子不互相关联
      checkStrictly: {
        type: Boolean,
        default () {
          return false
        }
      },
      // 默认选中的节点key数组
      checkedKeys: {
        type: Array,
        default () {
          return []
        }
      },
      size: {
        type: String,
        default () {
          return 'small'
        }
      },
      width: {// select组件输入框宽度
        type: [ Number, String ]
      },
      dropdownWidth: {// 下拉框宽度
        type: [ Number, String ],
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
      scrollHidePopELeSelector: {
        type: String,
        default: ''
      },
      singleDisabled: {
        type: Function,
        default () {
          return false
        }
      },
      filterData: {
        type: Function,
        default (data) {
          return data
        }
      },
      disabled: {
        type: Boolean,
        default: false
      },
      popperClass: {
        type: String,
        default: 'tree-select-popover'
      },
      defaultExpandAll: { // 默认展开全部节点
        type: Boolean,
        required: false,
        default: false
      },
      defaultExpandedKeys: { // 默认展开的节点
        type: Array,
        required: false,
        default () {
          return []
        }
      },
      treeId: {
        type: String,
        required: false,
        default:''
      },
      showChildNodes: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    data () {
      return {
        isShowSelect: false, // 是否显示树状选择器
        options: [],
        selectedData: this.multiple ? [] : '', // 选中的节点
        checkedIds: [],
        checkedData: [],
        titleLabel: '',
        showTree: false,
        element: '',
        filterText: '' // 通过关键字过滤树节点
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
      }
    },
    watch: {
      isShowSelect (val) {
        // 隐藏select自带的下拉框
        this.$refs.select.blur()
        if (val && this.$refs.scrollBar) {
          this.$refs.scrollBar.moveY = 0
        }
      },
      filterText (val) {
        this.$refs.tree.filter(val)
      },
      checkedKeys (val) {
        if (!val) return
        this.checkedKeys = val
        this.initCheckedData()
      },
      checkedData (val) {
        if (this.collapseTags) {
          let titles = []
          if (val && val.length > 0) {
            val.forEach((ele) => {
              titles.push(ele[ this.defaultProps.label ])
            })
          }
          this.titleLabel = titles.join(',')
        }
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
      // 单选时点击tree节点，设置select选项
      setSelectOption (node) {
        let tmpMap = {}
        if (node && node.data) {
          tmpMap.id = node.data[ this.defaultProps.value ]
          tmpMap.name = node.data[ this.defaultProps.label ]
          this.options = []
          this.options.push(tmpMap)
          this.selectedData = node.data[ this.defaultProps.value ]
          this.titleLabel = node.data[ this.defaultProps.label ] || ''
        } else {
          this.options = []
          this.selectedData = ''
          this.titleLabel = ''
        }
      },
      // 单选，选中传进来的节点
      checkSelectedNode (checkedKeys) {
        var item = checkedKeys[ 0 ]
        this.$refs.tree.setCurrentKey(item)
        var node = this.$refs.tree.getNode(item)
        this.setSelectOption(node)
      },
      // 多选，勾选上传进来的节点
      checkSelectedNodes (checkedKeys) {
        this.$refs.tree.setCheckedKeys(checkedKeys)
      },
      // 单选，清空选中
      clearSelectedNode () {
        this.$refs.tree.setCurrentKey(null)
        this.selectedData = ''
      },
      // 多选，清空所有勾选
      clearSelectedNodes () {
        var checkedKeys = this.$refs.tree.getCheckedKeys() // 所有被选中的节点的 key 所组成的数组数据
        for (let i = 0; i < checkedKeys.length; i++) {
          this.$refs.tree.setChecked(checkedKeys[ i ], false)
        }
      },
      initCheckedData () {
        if (this.multiple) {
          // 多选
          if (this.checkedKeys.length > 0) {
            this.checkSelectedNodes(this.checkedKeys)
          } else {
            this.clearSelectedNodes()
          }
        } else {
          // 单选
          if (this.checkedKeys.length > 0) {
            this.checkSelectedNode(this.checkedKeys)
          } else {
            this.clearSelectedNode()
          }
        }
      },
      popoverHide () {
        this.filterText = ''
        this.getCheckedData()
        if (this.scrollHidePopELeSelector) {
          this.removeHandler(this.element, 'scroll', this.hideSelector)
        }
        this.$emit('popoverHide', this.checkedIds, this.checkedData)
      },
      getCheckedData () {
        if (this.multiple) {
          this.checkedIds = this.$refs.tree.getCheckedKeys() // 所有被选中的节点的 key 所组成的数组数据
          this.checkedData = this.$refs.tree.getCheckedNodes() // 所有被选中的节点所组成的数组数据
        } else {
          this.checkedIds = this.$refs.tree.getCurrentKey()
          this.checkedData = this.$refs.tree.getCurrentNode()
        }
      },
      // 单选，节点被点击时的回调,返回被点击的节点数据
      handleNodeClick (data, node) {
        if (this.singleDisabled(data)) {
          return
        }
        if (!this.multiple) {
          this.setSelectOption(node)
          this.getCheckedData()
          this.isShowSelect = !this.isShowSelect
          this.$emit('change', this.selectedData, this.checkedData)
        }
      },
      // 多选，节点勾选状态发生变化时的回调
      handleCheckChange () {
        this.getCheckedData()
        this.options = this.checkedData.map((node) => {
          let tmpMap = {}
          tmpMap.id = node[ this.defaultProps.value ]
          tmpMap.name = node[ this.defaultProps.label ]
          return tmpMap
        })
        this.selectedData = this.options.map((item) => {
          return item.id
        })
        this.$emit('change', this.selectedData, this.checkedData)
      },
      // 多选,删除任一select选项的回调
      removeSelectedNodes (val) {
        if (this.multiple) {
          this.getCheckedData()
          this.$refs.tree.setChecked(val, false)
          var node = this.$refs.tree.getNode(val)
          if (!this.checkStrictly && node.childNodes.length > 0) {
            this.treeToList(node).map(item => {
              if (item.childNodes.length <= 0) {
                this.$refs.tree.setChecked(item, false)
              }
            })
            this.handleCheckChange()
          }
          this.$emit('change', this.selectedData, this.checkedData)
        }
      },
      treeToList (tree) {
        var queen = []
        var out = []
        queen = queen.concat(tree)
        while (queen.length) {
          var first = queen.shift()
          if (first.childNodes) {
            queen = queen.concat(first.childNodes)
          }
          out.push(first)
        }
        return out
      },
      // 单选,清空select输入框的回调
      removeSelectedNode () {
        if (!this.multiple) {
          this.clearSelectedNode()
          this.$emit('change', this.selectedData)
        }
      },
      // 选中的select选项改变的回调
      changeSelectedNodes (selectedData) {
        // 多选,清空select输入框时，清除树勾选
        if (this.multiple && selectedData.length <= 0) {
          this.clearSelectedNodes()
        }
        this.getCheckedData()
        this.$emit('change', this.selectedData, this.checkedData)
      },
      popoverShow () {
        // 传scrollHidePopELeSelector后，添加滚动监听，滚动隐藏弹窗
        if (this.scrollHidePopELeSelector) {
          this.onScroll()
        }
      },
      onScroll () {
        const self = this
        const element = document.querySelector(this.scrollHidePopELeSelector)
        self.element = element
        self.addHandler(element, 'scroll', this.hideSelector)
      },
      hideSelector (e) {
        this.isShowSelect = false
      },
      addHandler (element, type, handler) {
        if (element.addEventListener) {
          element.addEventListener(type, handler, false)
        } else if (element.attachEvent) {
          element.attachEvent('on' + type, handler)
        } else {
          element[ 'on' + type ] = handler
        }
      },
      removeHandler (element, type, handler) {
        if (element.removeEventListener) {
          element.removeEventListener(type, handler, false)
        } else if (element.detachEvent) {
          element.detachEvent('on' + type, handler)
        } else {
          element[ 'on' + type ] = null
        }
      },
      filterNode (value, data) {
        console.log('this.showChildNodes', this.showChildNodes)
        if (!value) return true
        if (this.showChildNodes) {
          return data[ this.defaultProps.fullName ].indexOf(value) !== -1
        } else {
          return data[ this.defaultProps.label ].indexOf(value) !== -1
        }
      },
      resetTitleLabel () {
        this.titleLabel = ''
        this.$refs.select.deleteSelected({stopPropagation: () => {}})
      }
    }
  }

</script>

<style lang='less'>
    .tree-select {
        .mask {
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            left: 0;
            opacity: 0;
            z-index: 1000;
        }
        span.el-select__tags-text {
            display: inline-block;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            max-width: 55px;
        }
        .el-select .el-tag__close.el-icon-close {
            top: -7px;
        }
    }

    .tree-select-bar {
        .el-scrollbar__wrap {
            overflow-x: hidden;
        }
        span.tree-item.text-ellipsis {
            padding-left: 4px;
        }
    }

    .tree-select {
        z-index: 111;
    }

    .tree-item {
        width: 100%;
    }

</style>
