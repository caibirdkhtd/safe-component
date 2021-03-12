<template>
  <div style="overflow: auto; height: 490px">
      <el-form
          :label-position="labelPosition"
          :model="formData"
          :rules="rules"
          ref="ruleForm"
          label-width="100px">
          <div style="display: inline-block; float: left; padding-right: 60px;">
              <el-form-item v-show="isShowRountine" label="检查类型" prop="routineId" :required="isCheckTypeRequired">
                  <el-select
                      v-model="formData.routineId"
                      :title="formData.routineName"
                      size="medium"
                      style="width: 440px"
                      clearable
                      filterable
                      @change="changeRoutine"
                      placeholder="请选择">
                      <el-option
                          v-for="item in routines"
                          :key="item.id"
                          :label="item.checkName"
                          :value="item.id"
                          :title="item.checkName"
                          style="width: 440px">
                      </el-option>
                  </el-select>
              </el-form-item>
              <el-form-item label="责任区域" prop="regionId" required>
                  <tree-select
                      :height="260"
                      :width="440"
                      node-key="id"
                      :dropdownWidth="464"
                      :tree-id="'region-item'"
                      class="filter-item region-select"
                      placeholder="请选择"
                      size="medium"
                      :data="regionTree"
                      :defaultProps="regionTreeProps"
                      :checkedKeys="[formData.regionId]"
                      clearable
                      checkStrictly
                      @change="changeRegion">
                  </tree-select>
              </el-form-item>
              <el-form-item label="分包单位" prop="vendorId">
                  <tree-select
                      :height="260"
                      :width="440"
                      node-key="id"
                      :dropdownWidth="440"
                      :tree-id="'vendor-item'"
                      class="filter-item vendor-select"
                      :singleDisabled="teamDisabled"
                      placeholder="请选择"
                      size="medium"
                      :data="teams"
                      :defaultProps="teamTreeProps"
                      clearable
                      checkStrictly
                      @change="changeTeam">
                  </tree-select>
              </el-form-item>
              <el-form-item label="安全隐患" prop="dangerItemId" :required='isMust'>
                  <tree-select
                      :height="260"
                      :width="440"
                      :dropdownWidth="464"
                      :tree-id="'danger-item'"
                      class="filter-item danger-select"
                      :singleDisabled="typeDisabled"
                      placeholder="请选择"
                      size="medium"
                      :data="dangerTypeTree"
                      :defaultProps="dangerTypeTreeProps"
                      :defaultExpandAll="false"
                      :defaultExpandedKeys="defaultExpandedKeys"
                      :checkedKeys="[formData.dangerItemId]"
                      clearable
                      checkStrictly
                      @change="changeDangerItem">
                  </tree-select>
                  <div :style="{'position': 'absolute', 'top': '-10px', 'right': hasStandardPic && isRelated ? '-60px' : '-30px'}">
                      <el-button
                          v-if="hasStandardPic"
                          @click="viewStandardPic"
                          style="cursor: pointer;line-height: 34px;"
                          type="text"
                          title="查看标准图册">
                          <span  class="iconfont icon-qiyeziliaozhongxin_fill"></span>
                      </el-button>
                      <el-button
                          v-if="isRelated"
                          @click="showSpecificationDialog = true"
                          style="cursor: pointer;line-height: 34px;"
                          type="text"
                          title="查看参考依据">
                          <span class="iconfont icon-lxjc"></span>
                      </el-button>
                  </div>
              </el-form-item>
              <el-form-item label="补充说明" prop="dangerDesc">
                  <el-input
                      type="textarea"
                      size="medium"
                      maxlength="500"
                      style="width:440px"
                      :rows="3"
                      show-word-limit
                      v-model="formData.dangerDesc">
                  </el-input>
              </el-form-item>
              <el-form-item label="事故隐患">
                  <el-radio-group size='medium' style="width: 440px" v-model="formData.level">
                      <el-radio :label=1>一般</el-radio>
                      <el-radio :label=2>重大</el-radio>
                  </el-radio-group>
              </el-form-item>
              <div class="upload-content">
                  <el-form-item label="现场照片">
                      <el-image
                          v-if="externalImgUrl || imgInfo.url"
                          style="width: 100px; height: 100px"
                          :src="externalImgUrl || imgInfo.url"
                          fit="fill">
                      </el-image>
                      <el-upload
                          v-else
                          accept='.jpg, .png, .jpeg, .JPG, .PNG, .JPEG'
                          :action="`/safety/safety-common-service/oss/upload/safe/${moduleName}`"
                          :before-upload="handleBefore"
                          :on-progress="handleProgress"
                          :on-success="handleSuccess"
                          :on-exceed="handleExceed"
                          :on-error="handleError"
                          :on-remove="handleRemove"
                          :on-preview="handlePreview"
                          :on-change="handleChange"
                          :disabled="isUploading"
                          :show-file-list="true"
                          :limit="limitCount"
                          multiple
                          list-type="picture-card"
                          name="uploadFile"
                          :class="{hide: hideUpload}"
                          class="add-inspect-record-upload">
                          <i class="el-icon-plus">
                          <span style="display: block; font-size: 12px; position: relative;">点击上传</span>
                          </i>
                      </el-upload>
                  </el-form-item>
              </div>
          </div>

          <div style="display: inline-block; float: left;">
              <el-form-item label="整改人" required>
                  <user-select
                      v-model="rectifyUsers"
                      :data="allPartnerUsers"
                      clearable
                      filterable
                      :width="440"
                      keyCode="rectify"
                      :optionWidth="440"
                      @change="changeRectifyUser">
                  </user-select>
              </el-form-item>
              <el-form-item label="整改时限" prop="changeLimitTime" required>
                  <el-date-picker
                      type="date"
                      style="width: 440px"
                      placeholder="选择日期"
                      v-model="formData.changeLimitTime"
                      :picker-options="pickerOptions"
                      size="medium">
                  </el-date-picker>
              </el-form-item>
              <el-form-item label="整改要求" prop="remark">
                  <el-input
                      type="textarea"
                      size="medium"
                      maxlength="255"
                      style="width: 440px"
                      :rows="3"
                      show-word-limit
                      v-model.trim="formData.remark">
                  </el-input>
              </el-form-item>
              <el-form-item label="通知人" >
                  <user-select
                      v-model="notifyUsers"
                      :data="displayedAllUsers"
                      clearable
                      filterable
                      multiple
                      keyCode="notify"
                      :width="440"
                      :optionWidth="440"
                      @change="changeNotifyUser">
                  </user-select>
              </el-form-item>
              <div v-show="showJoinedUsersSelect">
                  <el-form-item label="参检人员" >
                    <user-select
                      v-model="joinedUsers"
                      :data="canJoinedUsers"
                      clearable
                      filterable
                      multiple
                      :width="440"
                      :optionWidth="440"
                      @change="selectJoinedUsers">
                    </user-select>
                  </el-form-item>
                </div>
              <el-form-item label="复查人">
                  <user-select
                      v-model="reviewUser"
                      :data="allUsers"
                      clearable
                      filterable
                      keyCode="review"
                      :width="440"
                      :optionWidth="440"
                      @change="changeReviewUser">
                  </user-select>
              </el-form-item>
              <el-form-item label="现场整改">
                  <el-radio-group size='medium' style="width: 440px" v-model="formData.recordType">
                      <el-radio :label=0>未完成</el-radio>
                      <el-radio :label=1>已完成</el-radio>
                  </el-radio-group>
              </el-form-item>
          </div>
      </el-form>
      <!-- 查看参考依据 -->
      <view-specification-dialog
          v-if="showSpecificationDialog"
          :temRelationArr="relationArr"
          @close="showSpecificationDialog = false">
      </view-specification-dialog>
      <!-- 图片浏览 -->
      <img-modal-view
          :childImgDlgDisplay="imgDlgDisplay"
          :childInspectAttachs="inspectAttachs"
          :childImageIndex="imageIndex"
          @changeImgDlgDisplay="updateImgDlgDisplay"
          @changeImageIndex="updateImageIndex">
      </img-modal-view>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getWithReject, postWithReject, loadOrgTreeWithUser, hasIdInArr } from 'safe-component'
import TreeSelect from './TreeSelect'
import UserSelect from './UserSelect'
import ViewSpecificationDialog from './ViewSpecificationDialog.vue'
import ImgModalView from './imgModalView.vue'
import dayjs from 'dayjs'

export default {
name: 'CreateInspect',
components: { TreeSelect, ViewSpecificationDialog, ImgModalView, UserSelect },
props: {
  isShowRountine: {
      type: Boolean,
      default: false
  },
  curImage: {
    type: Object,
    default: () => {
      return {}
    }
  },
  externalImgUrl: {
      type: String,
      default: ''
  },
  inspectType: {
    type: Number,
    default: undefined
  },
  problemItem: {
    type: Object,
    default: () => {
      return {}
    }
  },
  recordId: {
      type: String,
      default: ''
  },
  orgId: {
      type: [String, Number],
      default: ''
  },
  projectId: {
      type: [String, Number],
      default: ''
  },
  rootOrgId: {
      type: [String, Number],
      default: ''
  },
  curUserId: {
      type: [String, Number],
      default: ''
  },
  curUserName: {
      type: String,
      default: ''
  }
},
data () {
  let checkDangerItem = (rule, value, callback) => {
    if (!this.isMust) {
      callback()
    }
    if (value === '') {
      callback(new Error('请选择安全隐患'))
    } else {
      callback()
    }
  }
  let checkRoutineItem = (rule, value, callback) => {
    if (!this.isCheckTypeRequired) {
      callback()
    }
    if (value === '') {
      callback(new Error('请选择检查类型'))
    } else {
      callback()
    }
  }
  let rules = {
    changeLimitTime: [
      { type: 'date', required: true, message: '请选择整改时限', trigger: 'blur' },
      { required: true, message: '请选择整改时限', trigger: 'change' }
    ],
    regionId: [
      { required: true, message: '请选择责任区域', trigger: 'change' },
      { required: true, message: '请选择责任区域', trigger: 'blur' }
    ],
    changeId: [
      { required: true, message: '请选择整改人', trigger: 'change' }
    ],
    routineId: [
      { validator: checkRoutineItem, trigger: 'change' },
      { validator: checkRoutineItem, trigger: 'blur' }
    ],
    dangerItemId: [
      { validator: checkDangerItem, trigger: 'change' },
      { validator: checkDangerItem, trigger: 'blur' }
    ],
    remark: [
      { required: true, min: 1, max: 255, message: '请输入 1 到 255 个字符', trigger: 'change' },
      { required: true, min: 1, max: 255, message: '请输入 1 到 255 个字符', trigger: 'blur' }
    ]
  }
  return {
    labelPosition: 'right',
    pickerOptions: {
      disabledDate (time) {
        return time.getTime() < Date.now() - 8.64e7
      }
    },
    rules: rules,
    dangerTypeTreeProps: {
      value: 'id',
      label: 'name',
      children: 'childNodes'
    },
    regionTreeProps: {
      value: 'id',
      label: 'regionName',
      children: 'childNodes'
    },
    teamTreeProps: {
      value: 'id',
      label: 'label',
      children: 'childrens'
    },
    imageTypes: ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG'],
    isMust: false,
    moduleName: 'Inspection',
    isRelated: false, // 是否关联参考依据
    hasStandardPic: false, // 是否参考标准图册
    temprocessId: '', // 暂存的规范id
    maxSize: 10,
    isUploading: false,
    hideUpload: false,
    limitCount: 10,
    allUsers: [], // 通知人、复查人列表
    allPartnerUsers: [], // 带有参与方人员
    partnerUsers: [], // 参与方人员
    regionTree: [], // 责任区域
    teams: [], // 分包单位
    dangerTypeTree: [], // 安全隐患
    formData: {
      routineId: '', // 检查类型id
      routineName: '', // 检查类型名称
      regionId: '-1', // 责任区域
      teamId: '', // 队长id
      teamName: '', // 分包商名称+队长名称
      vendorId: '', // 分包商id
      vendorName: '',
      laborGroupId: '', // 班组id
      laborGroupName: '', // 班组名称
      dangerItemId: '', // 安全隐患
      dangerDesc: '', // 补充说明
      level: 1, // 事故隐患
      changeId: '', // 整改人id
      changeName: '', // 整改人姓名
      changeLimitTime: Date.now(), // 整改时限
      remark: '', // 整改要求
      notifyList: [], // 通知人
      reviewId: '', // 复查人Id
      reviewName: '', // 复查人姓名
      recordType: 0 // 整改完成情况
    },
    notifyUsers: [], // 默认选中通知人
    rectifyUsers: '',
    reviewUser: '',
    routines: [],
    timer: null,
    showSpecificationDialog: false, // 参考依据
    relationArr: [],
    joinedUsers: [], // 参检人员
    attaches: [],
    images: [],
    defaultExpandedKeys: [], // 默认展开的树节点
    imgDlgDisplay: 'none', // 是否显示浏览图片窗口
    inspectAttachs: [], // 浏览图片时该组图片对象
    imageIndex: 0, // 记录浏览图片时当前是第几张
    creditCode: '',
    copyChangeId: '',
    copyChangeName: '',
    dangerItemCopy: '',
    dangerTitleCopy: '',
    regionItemCopy: '',
    regionTitleCopy: '',
    vendorItemCopy: '',
    vendorTitleCopy: '',
    isCheckTypeRequired: false,
    isInit: true,
    isMatch: false,
    imgInfo: {}
  }
},
computed: {
  displayedAllUsers () {
    if (this.showJoinedUsersSelect) {
      const filteredUsers = this.allUsers.filter(user => !this.joinedUsers.includes(user.id))
      return filteredUsers
    } else {
      return this.allUsers
    }
  },
  canJoinedUsers () {
    const filteredUsers = this.allUsers.filter(user => !this.notifyUsers.includes(user.id))
    return filteredUsers
  },
  showJoinedUsersSelect () {
    return this.formData.routineName === '多人检查'
  }
},
created () {
  this.isMustFn()
  this.queryCheckTypeConfig()
},
mounted () {
  this.$nextTick(() => {
    this.init()
    setTimeout(() => {
      if (this.externalImgUrl) {
          this.uploadImageByUrlAndGetOssInfo(this.externalImgUrl)
      } else {
          this.imgInfo = this.curImage
      }
    }, 2000)
  })
},
methods: {
  saveForm () {
    if (this.imgInfo.ossKey) {
        this.attaches.push({ 'extensionName': 'PICTURE', 'key': this.imgInfo.ossKey })
    }
    this.formData.regionId = this.formData.regionId === '-1' ? '' : this.formData.regionId
    this.$refs.ruleForm.validate((valid) => {
      if (valid) {
        let params = {
          aiProblemId: this.isMatch ? this.problemItem.id : null,
          projectId: String(this.projectId),
          creatorId: String(this.curUserId),
          creatorName: this.curUserName,
          level: Number(this.formData.level),
          regionId: String(this.formData.regionId),
          routineId: String(this.formData.routineId),
          teamId: this.formData.teamId || null,
          teamName: this.formData.teamName || null, // 分包商名称+队长名称
          vendorId: String(this.formData.vendorId) || null,
          vendorName: this.formData.vendorName || null,
          laborGroup: this.formData.laborGroupId
            ? {
              'laborGroupId': String(this.formData.laborGroupId),
              'laborGroupName': this.formData.laborGroupName
            } : null,
          dangerItemId: this.formData.dangerItemId.toString(),
          dangerDesc: this.formData.dangerDesc,
          changeId: String(this.formData.changeId),
          changeName: this.formData.changeName,
          remark: this.formData.remark,
          changeLimitTime: dayjs(this.formData.changeLimitTime).format('YYYY-MM-DD') + ' 23:59:00',
          attaches: this.attaches,
          notifyList: this.formData.notifyList,
          attendList: this.formData.attendList,
          reviewId: String(this.formData.reviewId),
          reviewName: this.formData.reviewName,
          recordId: this.recordId || this.generateUUID(),
          createTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
          recordType: this.formData.recordType,
          inspectType: this.inspectType
        }
        postWithReject(`/safety/safe-inspection/safeInspection/addInspection`, params)
          .then((res) => {
            this.$message.success('创建隐患成功')
            this.$refs.ruleForm.resetFields()
            this.$emit('close', { linkId: res, isMatch: this.isMatch, flag: 1 })
          })
          .catch((err) => {
            this.$emit('close', { flag: 2 })
            this.$message.error(err.message)
          })
      } else {
        this.$emit('close', { flag: 2 })
        return false
      }
    })
  },
  closeForm () {
    this.$refs.ruleForm.resetFields()
    this.$emit('close', { flag: 3 })
  },
  uploadImageByUrlAndGetOssInfo (url) {
      const data = {
          imgUrl: url,
          suffix: 'jpg'
      }
      postWithReject(`/safety/containing-box-server/ossFileMobile/uploadImageAndGetOssInfo`, data)
      .then(res => {
          this.imgInfo.ossKey = res.key
          this.imgInfo.url = res.thumbUrl
          console.log(res)
      })
  },
  isMustFn () {
      getWithReject(`/safety/safe-inspection/sysInspectSet/getSwitch/inspect_detail/${this.rootOrgId}`)
      .then((res) => {
          this.isMust = !!res
      })
  },
  init () {
    this.formData.dangerDesc = this.curImage.explain || ''
    this.queryWebAllRegion()
    this.loadOrgTreeWithUsers()
    this.queryRoutineInspectSets()
    this.queryProjectTeam()
    this.hiddenDangersDefinite()
  },
  // 获取检查类型数据
  queryRoutineInspectSets () {
      let params = {
          projectId: this.projectId,
          orgId: this.orgId
      }
      postWithReject('/safety/safe-inspection/routineSysInspect/queryRoutineInspectSets', params).then((data) => {
          this.routines = data
      })
  },
  queryCheckTypeConfig () {
    const params = {
      orgId: this.rootOrgId,
      module: 'safe-inspect',
      key: 'checkTypeRequire'
    }
    postWithReject(`/safety/containing-box-server/publicConfig/getConfig`, params).then(res => {
      this.isCheckTypeRequired = (res && (res.value === '1')) || false
    })
  },
  // 获取人员列表
  loadOrgTreeWithUsers () {
      loadOrgTreeWithUser(this.orgId).then(res => {
          if (res && res.allUsers && res.allUsers.length > 0) {
              res.allUsers.forEach(v => {
                  v.id = String(v.id)
              })
              this.allUsers = res.allUsers
              this.allPartnerUsers = res.allUsers
              let obj = []
              obj = this.allUsers.filter(v => {
                  return String(v.id) === String(this.curUserId)
              })
              this.formData.reviewId = obj[0].id
              this.formData.reviewName = obj[0].name
              this.reviewUser = obj[0].id
          } else {
              this.allUsers = []
              this.allPartnerUsers = []
          }
          getWithReject(`/org/load-org-tree-with-user?product_code=safe&org_id=${this.orgId}&participant=1&children=1`)
          .then(result => {
              if (result && result.childNodes && result.childNodes.length > 0) {
                  this.checkForPartner(result.childNodes)
              }
          })
      })
  },
  checkForPartner (childNodes) {
    if (childNodes && childNodes.length > 0) {
      childNodes.forEach(child => {
        if (String(child.projectId) === String(this.projectId)) {
          this.parsePartner(child.childNodes)
        } else {
          this.checkForPartner(child.childNodes)
        }
      })
    }
  },
  parsePartner (childNodes) {
    let allPartner = []
    if (childNodes && childNodes.length > 0) {
      childNodes.forEach(child => {
        const users = this.parseRoles(child)
        if (users && users.length > 0) {
          allPartner = allPartner.concat(users)
        }
      })
    }
    this.partnerUsers = allPartner
    if (this.partnerUsers.length > 0 && this.allPartnerUsers.length > 0) {
      for (let i = 0, len = this.partnerUsers.length; i < len; i++) {
        for (let j = 0, lens = this.allPartnerUsers.length; j < lens; j++) {
          if (this.allPartnerUsers[j] && this.allPartnerUsers[j].id && String(this.partnerUsers[i].id) === String(this.allPartnerUsers[j].id)) {
            this.allPartnerUsers.splice(j, 1)
          }
        }
      }
    }
    this.allPartnerUsers = this.allPartnerUsers.concat(this.partnerUsers)
  },
  parseRoles (nodes) {
    const userids = []
    const projectUsers = []
    if (nodes.creditCode) {
      if (nodes.roles && nodes.roles.length > 0) {
        nodes.roles.forEach(role => {
          let users = role.users
          for (let k = 0; k < users.length; k++) {
            if (!hasIdInArr(userids, users[k].id)) {
              userids.push(users[k].id)
              projectUsers.push({
                companyName: nodes.name,
                type: 2,
                name: users[k].name,
                id: users[k].id,
                phone: users[k].phone,
                creditCode: nodes.creditCode,
                remark: (users[k].jobNames && users[k].jobNames.length > 0) ? users[k].jobNames.join(',') : ''
              })
            }
          }
        })
      }
    }
    return projectUsers
  },
  // 选择检查类型项
  changeRoutine (val) {
    let obj = {}
    obj = this.routines.find((item) => {
      return String(item.id) === String(val)
    })
    this.formData.routineName = (obj && obj.checkName) || ''
    this.formData.attendList = []
    this.joinedUsers = []
  },
  // 选择复查人信息
  changeReviewUser (val) {
    let obj = {}
    obj = this.allUsers.find((item) => {
      return String(item.id) === String(val)
    })
    this.formData.reviewName = (obj && obj.name) || ''
    this.formData.reviewId = (obj && obj.id) || ''
  },
  // 选择通知人信息
  changeNotifyUser (addSel, selList) {
    this.formData.notifyList = []
    selList.length > 0 && selList.forEach(v => {
      this.formData.notifyList.push({
        id: String(v.userId),
        name: v.userName
      })
    })
  },
  // 选择参检人员
  selectJoinedUsers (addSel, selList) {
    this.formData.attendList = selList.map(item => {
      return {
        id: String(item.userId),
        name: item.userName
      }
    })
  },
  // 选择整改人信息
  changeRectifyUser (val) {
    let obj = {}
    obj = this.allPartnerUsers.find((item) => {
      return String(item.id) === String(val)
    })
    if (this.creditCode && obj && obj.creditCode && (this.creditCode !== obj.creditCode)) {
      this.$confirm('整改人所在分包单位与所选分包单位不一致，是否继续？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.formData.changeName = (obj && obj.name) || ''
        this.formData.changeId = (obj && obj.id) || ''
      }).catch(() => {
        this.formData.changeId = this.copyChangeId
        this.formData.changeName = this.copyChangeName
      })
    } else {

      this.formData.changeName = (obj && obj.name) || ''
      this.formData.changeId = (obj && obj.id) || ''
      this.copyChangeId = (obj && obj.id) || ''
      this.copyChangeName = (obj && obj.name) || ''
    }
  },
  // 获取责任区域
  queryWebAllRegion () {
      postWithReject('/safety/safe-inspection/safeRegion/queryWebAllRegion', { projectId: this.projectId })
      .then((res) => {
        this.regionTree = res
      })
  },
  // 选择责任区域
  changeRegion (val, item) {
    this.formData.regionId = val
    let intendanceIds = []
    this.notifyUsers = []
    this.rectifyUsers = ''
    // 选中责任区域更新该责任区域绑定的整改人和通知人信息
    if (item && item.dutyId) {
      this.rectifyUsers = item.dutyId
      this.formData.changeId = (item && item.dutyId)
      this.formData.changeName = (item && item.dutyName)
    }
    if (item && item.intendanceIds) {
      this.formData.notifyList = []
      intendanceIds = item.intendanceIds.split(',') || []
      intendanceIds.length > 0 && intendanceIds.forEach((v, i) => {
        this.notifyUsers.push(v)
        this.formData.notifyList.push({
          id: v,
          name: item.intendanceNameList[i]
        })
      })
    }
    this.isSameNode(val, item, 'region-select', 'region-item')
  },
  // 选择分包单位
  changeTeam (id, obj) {
    this.formData.vendorId = (obj && obj.vendorId) || null
    this.formData.vendorName = (obj && obj.vendorName) || null
    this.formData.teamId = (obj && obj.teamId) || null
    this.formData.teamName = (obj && obj.teamName ? (obj.vendorName + '-' + obj.teamName) : '') || null
    this.formData.laborGroupId = (obj && obj.laborGroupId) || null
    this.formData.laborGroupName = (obj && obj.laborGroupName) || null
    if (obj && obj.creditCode) {
      this.creditCode = String(obj.creditCode)
    } else {
      this.creditCode = ''
    }
    this.isSameNode(id, obj, 'vendor-select', 'vendor-item')
  },
  // 获取分包单位数据
  queryProjectTeam () {
      postWithReject(`/safety/safe-inspection/safeLaborTeam/queryCloudtVendorTree`, { projectId: this.projectId, vendorClassCode: '' })
      .then((res) => {
        this.teams = res && res.length > 0 && res.filter(item => {
          if (item.id && (item.classCode === 'Labor' || item.classCode === 'Professional')) {
            item.classCode === 'Labor' && this.$set(item, 'classCodeName', '劳务')
            item.classCode === 'Professional' && this.$set(item, 'classCodeName', '专业')
            this.$set(item, 'label', item.name)
            this.$set(item, 'vendorName', item.name)
            this.$set(item, 'vendorId', item.id)
            if (item.teamDTOs && item.teamDTOs.length > 0) {
              this.$set(item, 'childrens', item.teamDTOs)
              item.teamDTOs.forEach(v => {
                this.$set(v, 'label', v.captain)
                this.$set(v, 'vendorName', item.name)
                this.$set(v, 'teamName', v.captain)
                this.$set(v, 'teamId', v.id)
                if (v.groupDTOs && v.groupDTOs.length > 0) {
                  this.$set(v, 'childrens', v.groupDTOs)
                  v.groupDTOs.forEach(_v => {
                    this.$set(_v, 'label', _v.name)
                    this.$set(_v, 'vendorName', item.name)
                    this.$set(_v, 'teamName', v.captain)
                    this.$set(_v, 'laborGroupName', _v.name)
                    this.$set(_v, 'laborGroupId', _v.id)
                  })
                }
              })
            } else if (item.groupDTOs && item.groupDTOs.length > 0) {
              this.$set(item, 'childrens', item.groupDTOs)
              item.groupDTOs.forEach(v => {
                this.$set(v, 'label', v.name)
                this.$set(v, 'vendorName', item.name)
                this.$set(v, 'vendorId', item.id)
                this.$set(v, 'laborGroupName', v.name)
                this.$set(v, 'laborGroupId', v.id)
              })
            }
            return item
          }
        })
      }).catch((err) => {
        this.$message.error(err.message)
      })
  },
  // 安全隐患的禁用
  typeDisabled (data) {
    return data.childNodes
  },
  // 分包单位的禁用
  teamDisabled (data) {
    return !data.id
  },
  // 设置安全隐患
  changeDangerItem (val, selectItem) {
    
    if (!this.isInit) {
      this.formData.dangerDesc = ''
    }
    this.isInit = false
    if (!selectItem) {
      this.isRelated = false
      this.formData.dangerItemId = ''
    } else {
      this.formData.dangerItemId = val
      this.queryLinkSpecificationInfo(val)
    }

    if (selectItem && selectItem.standardPicVOList && selectItem.standardPicVOList.length > 0) {
      this.hasStandardPic = true
    } else {
      this.hasStandardPic = false
    }
    this.formData.changeLimitTime = selectItem && selectItem.changeLimit ? Date.now() + Number(selectItem.changeLimit) * 24 * 60 * 60 * 1000 : Date.now()
    this.formData.remark = (selectItem && selectItem.remark) || ''
    this.isSameNode(val, selectItem, 'danger-select', 'danger-item')
  },
  filter (item) {
    if (item && item.childNodes && item.childNodes.length !== 0) {
      item.childNodes.forEach((subItem) => {
        this.filter(subItem)
      })
    } else if (item.dangerItems && item.dangerItems.length > 0) {
      item.childNodes = item.dangerItems
      item.childNodes.forEach((subItem) => {
        this.$set(subItem, 'name', subItem.content)
      })
    }
  },
  matchCode (problemItem, item) {
    if (item && item.childNodes && item.childNodes.length > 0) {
        for(let i=0;i<item.childNodes.length;i++){
          this.matchCode(problemItem, item.childNodes[i])
          if(this.isMatch){
            break
          }
        }
    }
    if (item && item.dangerItems && item.dangerItems.length > 0) {
      let findMatchVal = item.dangerItems.find(danger => {
        return problemItem.problemType === danger.identify
      })
      if (findMatchVal) {
        this.isMatch = true
        this.changeDangerItem(findMatchVal.id, findMatchVal)
      } else {
     
        this.isMatch = false
      }
    }


  },
  matchName (textArr, item,problemItemStr) {
    if (item && item.childNodes && item.childNodes.length !== 0) {
      item.childNodes.forEach(subItem => {
        this.matchName(textArr, subItem,problemItemStr)
      })
    }

    if (item.dangerItems && item.dangerItems.length > 0) {
      for (let i = 0; i < textArr.length; i++) {
        for (let j = 0; j < item.dangerItems.length; j++) {
          if (textArr[i] === item.dangerItems[j].content) {
            this.isMatch = true
            
            if(JSON.stringify(this.problemItem) !== "{}" && !this.formData.dangerDesc){this.formData.dangerDesc = ''}
            this.changeDangerItem(item.dangerItems[j].id, item.dangerItems[j])
            break
          }
        }
        if (!this.isMatch) this.formData.dangerDesc = problemItemStr
        break
      }
    }
  },
  // 按照片识别隐患进行文字识别
  toTextClassificate (problemItemStr) {
    
    let matchItem = null
    if (problemItemStr.length > 4) {
      matchItem = problemItemStr
    }
    if (matchItem && matchItem.length > 20) {
      // 因为性能问题，只取前20个字符
      matchItem = matchItem.substring(0, 20)
    }
    getWithReject(`/safety/text-classification/?key=0fd03262-3bc0-11e8-9c47-00efaccd1222&text=${encodeURIComponent(matchItem)}`)
    .then(
      (result) => {
        if (result && result.length > 5) { // 因为性能问题，只取前5个结果
          result = result.slice(0, 5)
        }
        if (result && result.length > 0) {
          this.dangerTypeTree.forEach(item => {
            this.matchName(result, item,problemItemStr)
          })
        }
      })
  },
  // 安全隐患
  hiddenDangersDefinite () {
    let me = this
      getWithReject('/safety/safe-inspection/dangerType/index')
      .then((res) => {
        if (res && res.length > 0) {
          res.forEach((item) => {
            this.filter(item)
          })
          
          if (JSON.stringify(this.problemItem) !== "{}") {
            for(let i=0;i<res.length;i++){
              this.matchCode(this.problemItem, res[i])
              if(this.isMatch){
                break
              }
            }
   
            if (!me.isMatch) {
              
              this.toTextClassificate(this.problemItem.problemTypeName)
            }
          }else if(this.formData.dangerDesc!==''){
            this.toTextClassificate(this.formData.dangerDesc)
          }
          this.setDefaultExpandKeys(res[0])
          this.dangerTypeTree = res
        } else {
          this.dangerTypeTree = []
        }
      })
      .catch((err) => {
        this.$message.error(err.message)
      })
  },
  // 获取第一个节点下需要展开的id
  setDefaultExpandKeys (data) {
    let dest = []
    let firstNode = data
    if (data && data.childNodes && data.childNodes.length > 0) {
      firstNode = data.childNodes[0]
    }
    let fn = (o) => {
      if (o.childNodes && o.childNodes.length > 0) {
        dest.push(o.id)
        o.childNodes.forEach((child) => {
          fn(child)
        })
      }
    }
    fn(firstNode)
    this.defaultExpandedKeys = dest
  },
  // 获取对应的安全隐患id关联的规范
  queryLinkSpecificationInfo (dangerItemId) {
    if (!this.formData.dangerItemId) { return false }
    getWithReject(`/safety/safe-inspection/dangerItem/getRelations?dangerItemId=${dangerItemId}`)
    .then((result) => {
        this.isRelated = result && result.length > 0
        this.relationArr = result || []
      },
      (errordata) => {
        this.$message.error(errordata.errorMsg || errordata.message)
      })
  },
  // 生成本地预览路径
  getObjectURL (file) {
    let url = null
    if (window.URL !== undefined) { // basic
      url = window.URL.createObjectURL(file)
    } else if (window.webkitURL !== undefined) { // webkit or chrome
      url = window.webkitURL.createObjectURL(file)
    } else if (window.URL !== undefined) { // mozilla(firefox)
      url = window.URL.createObjectURL(file)
    }
    return url
  },
  handleBefore (file) {
    let site = file.name.lastIndexOf('.')
    let fileType = file.name.substring(site + 1, file.name.length)
    this.isUploading = true
    if (file.name.length >= 50) {
      this.$message({
        showClose: true,
        message: '文件名太长了，请重新上传',
        type: 'error'
      })
      this.isUploading = false
      return false
    } else if (file.size > this.maxSize * 1024 * 1024) {
      this.$message({
        showClose: true,
        message: '附件不能超过10M!',
        type: 'error'
      })
      this.isUploading = false
      return false
    } else if (!this.imageTypes.includes(fileType)) {
      this.$message({
        showClose: true,
        message: '请上传.jpg、.jpeg、.png、.JPEG、.JPG、.PNG格式图片',
        type: 'error'
      })
      this.isUploading = false
      return false
    }
  },
  // 照片上传时
  handleProgress (event, file, fileList) {
    this.isUploading = true
  },
  // 照片上传成功
  handleSuccess (response, file, fileList) {
    this.isUploading = false
    response[0].name = response[0].fileName
    response[0].uid = file.uid
    this.attaches.push({ 'extensionName': 'PICTURE', 'key': response[0].key })
    this.images = []
    if (this.imageTypes.includes(response[0].extensionName)) {
      for (let i = 0; i < fileList.length; i++) {
        this.images.push({ 'uid': fileList[i].uid, 'smallImgUrl': this.getObjectURL(fileList[i].raw), 'imageUrl': this.getObjectURL(fileList[i].raw) })
      }
    }
  },
  // 照片超出个数限制
  handleExceed (files, fileList) {
    this.$message.warning(`最多只能上传 10 张照片`)
  },
  // 照片上传失败
  handleError (err, file, fileList) {
    this.isUploading = false
    this.$message.error(err)
  },
  // 删除文件
  handleRemove (file, fileList) {
    this.hideUpload = fileList.length >= this.limitCount
    let arr = this.attaches.filter(item => item.key !== file.response[0].key)
    this.attaches = arr
    this.images = []
    for (let i = 0; i < fileList.length; i++) {
      this.images.push({ 'uid': fileList[i].uid, 'smallImgUrl': this.getObjectURL(fileList[i].raw), 'imageUrl': this.getObjectURL(fileList[i].raw) })
    }
  },
  // 预览照片
  handlePreview (file) {
    this.images.forEach((item, index) => {
      if (String(file.uid) === String(item.uid)) {
        this.openImgModal({ 'index': index, 'attachs': this.images })
      }
    })
  },
  handleChange (file, fileList) {
    this.hideUpload = fileList.length >= this.limitCount
  },
  // 查看大图
  openImgModal (params) {
    this.$store.commit('updateImgDlgDisplay', 'block')
    this.$store.commit('updateImageIndex', params.index)
    this.$store.commit('updateInspectAttachs', params.attachs)
  },
  updateImgDlgDisplay (style) {
    if (style === 'none') {
      window.parent['closeFullScreen']()
    }
    this.imgDlgDisplay = style
  },
  updateImageIndex (index) {
    this.imageIndex = index
  },
  // 查看关联的标准图册
  viewStandardPic () {
    let attachs = []
    if (!this.formData.dangerItemId) { return false }
    postWithReject(`/safety/safe-inspection/standardPic/selectByDangerItemId?`, { dangerItemId: this.formData.dangerItemId })
      .then(data => {
        attachs = data || []
        attachs.forEach(ele => {
          ele.imageUrl = ele.imgUrl
          ele.smallImgUrl = ele.imgUrl
        })
        this.openImgModal({ 'index': 0, 'attachs': attachs })
      })
      .catch(err => {
        this.$message.error(err)
      })
  },
  generateUUID: function () {
    var d = new Date().getTime()
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    return uuid
  },
  isSameNode (val, selectItem, className, elementId) {
    if (val) {
      let itemCopy = null
      if (className === 'danger-select') {
        itemCopy = this.dangerItemCopy
      } else if (className === 'region-select') {
        itemCopy = this.regionItemCopy
      } else if (className === 'vendor-select') {
        itemCopy = this.vendorItemCopy
      }
      if (itemCopy === val) {
        const sameNode = document.getElementsByClassName(`same-${className}`)[0]
        const levelSelect = document.getElementsByClassName(className)[0]
        if (sameNode) {
          sameNode.className = 'el-tree-node is-expanded is-focusable is-current'
          const TreeSelect = levelSelect.getElementsByClassName('tree-select')[0]
          if (className === 'danger-select') {
            TreeSelect.title = selectItem.name
          } else if (className === 'region-select') {
            TreeSelect.title = selectItem.regionName
          } else if (className === 'vendor-select') {
            TreeSelect.title = selectItem.name
          }
        }
      }
      if (className === 'danger-select') {
        this.dangerItemCopy = val
        this.dangerTitleCopy = selectItem.name
      } else if (className === 'region-select') {
        this.regionItemCopy = val
        this.regionTitleCopy = selectItem.regionName
      } else if (className === 'vendor-select') {
        this.vendorItemCopy = val
        this.vendorTitleCopy = selectItem.regionName
      }
    } else {
      const currentNodeId = document.getElementById(elementId)
      const currentNode = currentNodeId.getElementsByClassName('is-current')[0]
      const levelSelect = document.getElementsByClassName(className)[0]
      if (currentNode) {
        currentNode.className = `el-tree-node is-expanded is-focusable same-${className}`
        const TreeSelect = levelSelect.getElementsByClassName('tree-select')[0]
        TreeSelect.title = ''
      }
    }
  }
}
}
</script>
<style lang="less">
.el-select {
  width: 260px;
}
.upload-content {
  height: auto;
  margin-bottom: 22px;
  .img-show {
      height: auto;
      display: inline-block;
      span {
          display: inline-block;
          position: relative;
          .img-content {
              border: 1px solid #ccc;
              margin: 0 10px 10px 0;
          }
          .close-img {
              width: 23px;
              height: 23px;
              position: absolute;
              right: 10px;
          }
      }
  }
  .add-inspect-record-upload {
      width: 440px;
      margin-top: 0;
      display: inline-block;
      .el-upload--picture-card {
          width: 100px;
          height: 100px;
          line-height: 100px;
          i {
              margin-top: 25px;
          }
      }
      .el-upload-list__item {
          width: 100px;
          height: 100px;
      }
  }
  .hide .el-upload--picture-card {
      display: none;
  }
}

.el-select-dropdown__item {
.el-select-dropdown__item {
  width: 440px !important;
}
.name {
  display: block;
  font-size: 14px;
  width: 380px;
}
.phone {
  display: block;
  font-size: 12px;
}
}
</style>
