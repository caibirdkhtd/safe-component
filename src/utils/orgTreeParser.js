export function loadUsers (data, filter, callback) {
  if (data !== undefined && data !== null) {
    var roleUsers = []
    var projectRoles = []
    var fullIds = []
    getAllRoleData(data, roleUsers, fullIds, filter, projectRoles)
    var projectUsers = getProjectUserData(roleUsers, fullIds)
    projectUsers = getFilterUser(filter, projectUsers)
    if (callback) {
      callback({ count: projectUsers.length, data: projectUsers, projectRoles: projectRoles })//eslint-disable-line
    }
  } else {
    if (callback) {
      callback({ count: 0, data: [] })//eslint-disable-line
    }
  }
}

function getAllRoleData (parent, roleUsers, fullIds, filter, projectRoles) {
  if (String(parent.id) === String(filter.orgId)) {
    if (parent.roles && parent.roles.length > 0) {
      parent.roles.forEach(function (element) {
        projectRoles.push(element)
      })
    }
    // projectRoles = projectRoles.push(parent.roles || []);
    var fullId = parent.fullId.split('/')
    if (filter.type === 0) {
      fullIds.push(fullId[ fullId.length - 1 ])
    } else {
      for (let k = 0; k < fullId.length - 1; k++) {
        fullIds.push(fullId[ k ])
      }
    }
  }
  if (parent.roles && parent.roles.length > 0) {
    roleUsers.push({ id: parent.id, Org: parent, roles: parent.roles })
  }
  if (parent.childNodes) {
    var iCount = parent.childNodes.length
    for (var i = 0; i < iCount; i++) {
      getAllRoleData(parent.childNodes[ i ], roleUsers, fullIds, filter, projectRoles)
    }
  }
}

function getProjectUserData (roleUsers, ids) {
  var projectUsers = []
  var userids = []
  if (roleUsers) {
    for (var i = 0; i < roleUsers.length; i++) {
      if (ids.indexOf(roleUsers[ i ].id + '') > -1) {
        for (var j = 0; j < roleUsers[ i ].roles.length; j++) {
          var users = roleUsers[ i ].roles[ j ].users
          var curOrgName = roleUsers[ i ].Org.name
          var curOrgId = roleUsers[ i ].Org.id
          for (var k = 0; k < users.length; k++) {
            if (userids.indexOf(users[ k ].id) < 0) {
              userids.push(users[ k ].id)
              projectUsers.push({
                name: users[ k ].name,
                id: users[ k ].id,
                phone: users[ k ].phone,
                roleId: users[ k ].roleId,
                orgName: curOrgName,
                orgId: curOrgId,
                remark: (users[ k ].jobNames && users[ k ].jobNames.length > 0) ? users[ k ].jobNames.join(',') : '',
                jobNames: users[ k ].jobNames,
              })
            }
          }
        }
      }
    }
  }
  return projectUsers
}

function getFilterUser (filter, projectUsers) {
  var filterUser = projectUsers.filter(function (item) {
    if (filter.type === 0) {
      return String(item.orgId) === String(filter.orgId) && (item.name.indexOf(filter.key) > -1 || item.phone.indexOf(filter.key) > -1 || item.orgName.indexOf(filter.key) > -1)
    } else {
      return String(item.orgId) !== String(filter.orgId) && (item.name.indexOf(filter.key) > -1 || item.phone.indexOf(filter.key) > -1 || item.orgName.indexOf(filter.key) > -1)
    }
  })
  if (filter.type === 1) {
    for (var i = 0; i < filterUser.length; i++) {
      filterUser[ i ].phone = filterUser[ i ].phone.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2')
    }
  }
  return filterUser
}
