import { get ,getWithReject} from '../utils/index'
import { loadUsers } from '../utils/orgTreeParser'
export function queryRiskClassNo () {
  return get('/safety/risk-control/library/countRiskInCategory')
}

export function loadOrgTreeWithUser (orgId) {
  const suffix = '?product_code=safe&org_id=' + orgId
  return new Promise(resolve => {
    get('/org/load-org-tree-with-user' + suffix).then((data) => {
      let projectUsers = []
      let orgUsers = []
      let allUsers = []
      const orgFilter = {
        orgId: orgId,
        key: '',
        type: 1
      }

      const projectFilter = {
        orgId: orgId,
        key: '',
        type: 0
      }

      const getUserItem = function (user, type) {
        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          remark: user.remark,
          type: type
        }
      }

      const projectCallback = function (res) {
        if (res && res.data && res.data.length >= 1) {
          res.data.forEach(function (user) {
            projectUsers.push(getUserItem(user, projectFilter.type))
          })
        }
      }

      const orgCallback = function (res) {
        if (res && res.data && res.data.length >= 1) {
          res.data.forEach(function (user) {
            orgUsers.push(getUserItem(user, orgFilter.type))
          })
        }
      }

      const getAllUsers = function () {
        let tmpArr = []
        let userIds = []
        tmpArr = tmpArr.concat(projectUsers)
        tmpArr.forEach(function (user) {
          userIds.push(user.id)
        })
        orgUsers.forEach(function (user) {
          if (userIds.indexOf(user.id) < 0) {
            tmpArr.push(getUserItem(user, orgFilter.type))
          }
        })
        allUsers = tmpArr
      }
      loadUsers(data, projectFilter, projectCallback)
      loadUsers(data, orgFilter, orgCallback)
      getAllUsers()
      resolve({ projectUsers, orgUsers, allUsers })
    })
  })
}

// 获取当前组织下的组织树
export function getOrgTree (orgId) {
  return new Promise(resolve => {
    get('/org/navigate-org-tree?product_code=safe&projected=1&bureau=1').then(result => {
      let dest = []
      let fn = function (parent) {
        if (parent && parent.length > 0) {
          parent.forEach(function (item) {
            if (Number(item.id) === Number(orgId)) {
              dest.push(item)
            } else if (item.childNodes && item.childNodes.length > 0) {
              fn(item.childNodes)
            }
          })
        }
      }
      fn(result)
      resolve(dest)
    })
  })
}

// 根据文件key、产品名、过期时间获取图片url
export function getFileUrl (ossKey) {
  ossKey = encodeURI(ossKey)
  return getWithReject(`/safety/safety-common-service/oss/getFileUrlJsonType/safe/100?key=${ossKey}&projectType=safe&expireMinutes=100`)
}

// 保留两位小数
export function toDecimal2 (x) {
  var f = parseFloat(x)
  if (isNaN(f)) {
    return false
  }
  f = Math.round(x * 100) / 100
  var s = f.toString()
  var rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + 2) {
    s += '0'
  }
  return s
}

// 根据当前org在组织树中获取到目标组织节点
export function findOrgNode  ( orgId)  {
  if (!window) return {}
  const host = window.location.host
  const pf = host + '$'
  let navOrgNode =  window.sessionStorage.getItem(pf+'navOrgNode')

  if(!navOrgNode){
    return {}
  }
  navOrgNode = JSON.parse(navOrgNode)
  let orgStack = []
  let org = {}
  let itemNode = {}
  orgStack.push(navOrgNode)
  while (orgStack.length > 0) {
    org = orgStack.shift()
    if (String(org.id) === String(orgId)) {
      itemNode = org
      break
    }
    if (org.childNodes) {
      for (var i = 0; i < org.childNodes.length; i++) {
        orgStack.push(org.childNodes[i]);
      }
    }
  }

  return itemNode
}
