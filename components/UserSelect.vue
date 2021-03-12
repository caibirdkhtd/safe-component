<!----
<user-select
  v-model="user"
  :data="users"
  clearable
  filterable
  multiple
  @change="userSelectChange">
</user-select>

<user-select
  v-model="user"
  :data="users"
  clearable
  filterable
  multiple
  :width="400" // 选择和下拉框的宽度 默认250
  :multipleLimit="12" // 多选的个数限制
  singleRow // 单行 不写为两行
  @change="selectChange" // 选中的值改变
  @visible-change="selectVisibleChange" // 下拉框显示或隐藏
  @remove-tag="selectRemoveTag" // 多选移除选中tag> // 清除选中
</user-select>

reserveKeyword: { // 搜索选中第一项后保留搜索关键字
  type: Boolean,
  default: true
},
appendToBody: { 是否将弹出框插入至 body 元素。在弹出框的定位出现问题时，可将该属性设置为 false
  type: Boolean,
  default: true
},
defauleFirstOption: { 在输入框按下回车，选择第一个匹配项
  type: Boolean,
  default: false
},
disabled: { 选择框禁用
  type: Boolean,
  default: false
}
----->
<template>
    <div class="user-select-wrapper">
      <el-select
        class="user-select"
        v-model="valueCopy"
        :title="title"
        :filterable="filterable"
        :multiple="multiple"
        :placeholder="placeholder"
        :clearable="clearable"
        :singleRow="singleRow"
        :multiple-limit="multipleLimit"
        :popper-class="popoverClass"
        :reserve-keyword="true"
        :default-first-option="false"
        :popper-append-to-body="true"
        :disabled="disabled"
        :style="{width: width + 'px'}"
        no-match-text="无匹配人员信息"
        size="small"
        @change="selectChange"
        @visible-change="selectVisibleChange"
        @remove-tag="selectRemoveTag"
        @clear="selectClear">
        <el-option
          v-for="(item, index) in data"
          :key="index"
          :label="item[props.label]"
          :value="item[props.value]"
          :style="{width: optionWidth + 'px'}"
          :disabled="item.disabled || false">
          <!--单行-->
          <div
            v-if="singleRow"
            :title="item.name + '(' + item.phone + ')'"
            class="user-single-row text-emphasis">
            <span>{{ item.name }} ({{ item.phone }})</span>
          </div>
          <!--多行-->
          <div v-else class="user-muti-row">
            <div class="miti-item-top text-emphasis"
              :title="item.name + (item.remark ? '(' + item.remark + ')' : '')">
              <span>{{ item.name }} {{ item.remark ? '(' + item.remark + ')' : '' }}</span>
            </div>
            <div class="miti-item-bottom text-emphasis"
            :title="'电话号码:' + item.phone + '(' + (item.type === 2 ? item.companyName : item.type === 0 ? '项目人员' : '上级组织人员') + ')'">
              <span class="ft12">电话号码:{{ item.phone }} </span>
              <span class="ft12" v-if="item.type === 0"> (项目人员)</span>
              <span class="ft12" v-if="item.type === 1"> (上级组织人员)</span>
              <span class="ft12" v-if="item.type === 2">({{item.companyName}})</span>
            </div>
          </div>
        </el-option>
      </el-select>
    </div>
</template>
    
<script>
    export default {
      name: 'user-select',
      data () {
        return {
          valueCopy: this.value,
          popoverClass: '',
          title: ''
        }
      },
      model: {
        prop: 'value',
        event: 'change'
      },
      props: {
        placeholder: {
          type: String,
          default: '请选择人员'
        },
        value: {
          default: ''
        },
        data: {
          type: Array,
          default () {
            return []
          }
        },
        props: {
          type: Object,
          default () {
            return {
              label: 'name',
              value: 'id'
            }
          }
        },
        width: {
          type: Number,
          default: 250
        },
        optionWidth: {
          type: Number,
          default: 244
        },
        multiple: {
          type: Boolean,
          default: false
        },
        multipleLimit: {
          type: Number,
          default: 30
        },
        filterable: {
          type: Boolean,
          default: true
        },
        clearable: {
          type: Boolean,
          default: false
        },
        singleRow: {
          type: Boolean,
          default: false
        },
        // reserveKeyword: {
        //   type: Boolean,
        //   default: true
        // },
        // appendToBody: {
        //   type: Boolean,
        //   default: true
        // },
        // defauleFirstOption: {
        //   type: Boolean,
        //   default: false
        // },
        disabled: {
          type: Boolean,
          default: false
        },
        keyCode: {
            type: String,
            default: ''
        }
      },
      mounted () {
        if (this.singleRow) {
          this.popoverClass = 'single-item-users'
        } else {
          this.popoverClass = 'muti-item-users'
        }
      },
      watch: {
        value (val) {
            console.log(val)
          this.valueCopy = val
          if (!this.multiple) {
            this.title = this.findObjFromArr(this.data, this.props.value, val)[this.props.label]
          } else {
            this.valueCopy = this.getArrEqual(this.valueCopy, this.data)
          }
        }
      },
      methods: {
        selectChange (value) {
          const self = this
          if (!self.multiple) {
            const data = self.findObjFromArr(self.data, self.props.value, self.valueCopy)
            self.title = data[self.props.label]
            self.$emit('change', self.valueCopy, {
              userId: data[self.props.value],
              userName: data[self.props.label]
            })
          } else {
            const userList = value.map(item => {
              const data = self.findObjFromArr(self.data, self.props.value, item)
              return {
                userId: data[self.props.value],
                userName: data[self.props.label]
              }
            })
            self.$emit('change', self.valueCopy, userList)
          }
        },
        selectClear () {
          this.$emit('change', '')
          this.title = ''
        },
        selectVisibleChange (type) {
          this.$emit('visible-change', type)
        },
        selectRemoveTag (tag) {
          this.$emit('remove-tag', tag)
        },
        findObjFromArr (arr, prop, id) {
          let obj = {}
          let index = -1
          arr.forEach((item, itemIndex) => {
            if (item[prop].toString() === id.toString()) {
              index = itemIndex
            }
          })
          if (index !== -1) {
            obj = arr[index]
          }
          return obj
        },
        getArrEqual (arr1, arr2) {
          let newArr = []
          for (let i = 0; i < arr2.length; i++) {
            for (let j = 0; j < arr1.length; j++) {
              if (String(arr1[j]) === String(arr2[i].id)) {
                newArr.push(arr1[j])
              }
            }
          }
          return newArr
        }
      }
    }
</script>
<style>
    .muti-item-users .el-select-dropdown__item {
      height: 50px;
      padding-top: 4px;
    }
    .single-item-users .user-single-row {
      height: 30px;
    }
    .user-muti-row {
      height: 48px;
    }
    .user-muti-row .miti-item-top,.miti-item-bottom {
      height: 22px;
      line-height: 22px;
      width: calc(100% - 10px)
    }
    .text-emphasis {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .user-select-wrapper .el-select__tags-text {
      max-width: 80px;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      vertical-align: middle;
    }
    .user-select-wrapper .el-select .el-tag__close.el-icon-close {
      right: -6px;
      top: 1px;
    }
    .ft12 {
      font-size: 12px;
    }
    .muti-item-users.el-select-dropdown.is-multiple .el-select-dropdown__item.selected::after {
      top: 0px;
    }
    
</style>
    