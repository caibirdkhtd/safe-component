'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

function ajax(method, args, ori, withReject) {
  // axios.defaults.headers.common['endpoint'] = `AJAX`
  args = Array.prototype.slice.call(args, 0);
  var url = args[0];
  var lc = url.indexOf('?') > 0 ? '&' : '?';
  args[0] = url + lc + '__ts=' + new Date().getTime();
  return new Promise(function (resolve, reject) {
    axios[method].apply(axios, args).then(function (response) {
      if (response.status === 401) ; else {
        if (ori !== true) {
          if (response.data.success) {
            resolve(response.data.data || response.data.result);
          } else {
            if (response.data.errorCode === 'HTTP_401') ; else {
              console.error('[fail]: ' + JSON.stringify(response.data));

              if (withReject) {
                reject(response.data);
              } else if (response.data && response.data.errorMsg) {
                // sparrow.showMessage(response.data.errorMsg, 'warn')
                console.log(response.data.errorMsg, 'warn');
              }
            }
          }
        } else resolve(response);
      }
    })["catch"](function (thrown) {
      if (thrown.response && thrown.response.status === 401) {
        if (window && window.location) {
          window.location.replace('/logout');
        }
      } else if (thrown.response && thrown.response.data && thrown.response.data.message) {
        reject(thrown.response.data);
      } else {
        console.error('[error]', thrown.message);
        console.log('从服务器获取数据发生错误！', 'warn');
        reject(thrown);
      }
    });
  });
}
function get() {
  return ajax('get', arguments);
}
function getWithReject() {
  return ajax('get', arguments, false, true);
}

function loadUsers(data, filter, callback) {
  if (data !== undefined && data !== null) {
    var roleUsers = [];
    var projectRoles = [];
    var fullIds = [];
    getAllRoleData(data, roleUsers, fullIds, filter, projectRoles);
    var projectUsers = getProjectUserData(roleUsers, fullIds);
    projectUsers = getFilterUser(filter, projectUsers);

    if (callback) {
      callback({
        count: projectUsers.length,
        data: projectUsers,
        projectRoles: projectRoles
      }); //eslint-disable-line
    }
  } else {
    if (callback) {
      callback({
        count: 0,
        data: []
      }); //eslint-disable-line
    }
  }
}

function getAllRoleData(parent, roleUsers, fullIds, filter, projectRoles) {
  if (String(parent.id) === String(filter.orgId)) {
    if (parent.roles && parent.roles.length > 0) {
      parent.roles.forEach(function (element) {
        projectRoles.push(element);
      });
    } // projectRoles = projectRoles.push(parent.roles || []);


    var fullId = parent.fullId.split('/');

    if (filter.type === 0) {
      fullIds.push(fullId[fullId.length - 1]);
    } else {
      for (var k = 0; k < fullId.length - 1; k++) {
        fullIds.push(fullId[k]);
      }
    }
  }

  if (parent.roles && parent.roles.length > 0) {
    roleUsers.push({
      id: parent.id,
      Org: parent,
      roles: parent.roles
    });
  }

  if (parent.childNodes) {
    var iCount = parent.childNodes.length;

    for (var i = 0; i < iCount; i++) {
      getAllRoleData(parent.childNodes[i], roleUsers, fullIds, filter, projectRoles);
    }
  }
}

function getProjectUserData(roleUsers, ids) {
  var projectUsers = [];
  var userids = [];

  if (roleUsers) {
    for (var i = 0; i < roleUsers.length; i++) {
      if (ids.indexOf(roleUsers[i].id + '') > -1) {
        for (var j = 0; j < roleUsers[i].roles.length; j++) {
          var users = roleUsers[i].roles[j].users;
          var curOrgName = roleUsers[i].Org.name;
          var curOrgId = roleUsers[i].Org.id;

          for (var k = 0; k < users.length; k++) {
            if (userids.indexOf(users[k].id) < 0) {
              userids.push(users[k].id);
              projectUsers.push({
                name: users[k].name,
                id: users[k].id,
                phone: users[k].phone,
                roleId: users[k].roleId,
                orgName: curOrgName,
                orgId: curOrgId,
                remark: users[k].jobNames && users[k].jobNames.length > 0 ? users[k].jobNames.join(',') : '',
                jobNames: users[k].jobNames
              });
            }
          }
        }
      }
    }
  }

  return projectUsers;
}

function getFilterUser(filter, projectUsers) {
  var filterUser = projectUsers.filter(function (item) {
    if (filter.type === 0) {
      return String(item.orgId) === String(filter.orgId) && (item.name.indexOf(filter.key) > -1 || item.phone.indexOf(filter.key) > -1 || item.orgName.indexOf(filter.key) > -1);
    } else {
      return String(item.orgId) !== String(filter.orgId) && (item.name.indexOf(filter.key) > -1 || item.phone.indexOf(filter.key) > -1 || item.orgName.indexOf(filter.key) > -1);
    }
  });

  if (filter.type === 1) {
    for (var i = 0; i < filterUser.length; i++) {
      filterUser[i].phone = filterUser[i].phone.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2');
    }
  }

  return filterUser;
}

function queryRiskClassNo() {
  return get('/safety/risk-control/library/countRiskInCategory');
}
function loadOrgTreeWithUser(orgId) {
  var suffix = '?product_code=safe&org_id=' + orgId;
  return new Promise(function (resolve) {
    get('/org/load-org-tree-with-user' + suffix).then(function (data) {
      var projectUsers = [];
      var orgUsers = [];
      var allUsers = [];
      var orgFilter = {
        orgId: orgId,
        key: '',
        type: 1
      };
      var projectFilter = {
        orgId: orgId,
        key: '',
        type: 0
      };

      var getUserItem = function getUserItem(user, type) {
        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          remark: user.remark,
          type: type
        };
      };

      var projectCallback = function projectCallback(res) {
        if (res && res.data && res.data.length >= 1) {
          res.data.forEach(function (user) {
            projectUsers.push(getUserItem(user, projectFilter.type));
          });
        }
      };

      var orgCallback = function orgCallback(res) {
        if (res && res.data && res.data.length >= 1) {
          res.data.forEach(function (user) {
            orgUsers.push(getUserItem(user, orgFilter.type));
          });
        }
      };

      var getAllUsers = function getAllUsers() {
        var tmpArr = [];
        var userIds = [];
        tmpArr = tmpArr.concat(projectUsers);
        tmpArr.forEach(function (user) {
          userIds.push(user.id);
        });
        orgUsers.forEach(function (user) {
          if (userIds.indexOf(user.id) < 0) {
            tmpArr.push(getUserItem(user, orgFilter.type));
          }
        });
        allUsers = tmpArr;
      };

      loadUsers(data, projectFilter, projectCallback);
      loadUsers(data, orgFilter, orgCallback);
      getAllUsers();
      resolve({
        projectUsers: projectUsers,
        orgUsers: orgUsers,
        allUsers: allUsers
      });
    });
  });
} // 获取当前组织下的组织树

function getOrgTree(orgId) {
  return new Promise(function (resolve) {
    get('/org/navigate-org-tree?product_code=safe&projected=1&bureau=1').then(function (result) {
      var dest = [];

      var fn = function fn(parent) {
        if (parent && parent.length > 0) {
          parent.forEach(function (item) {
            if (Number(item.id) === Number(orgId)) {
              dest.push(item);
            } else if (item.childNodes && item.childNodes.length > 0) {
              fn(item.childNodes);
            }
          });
        }
      };

      fn(result);
      resolve(dest);
    });
  });
} // 根据文件key、产品名、过期时间获取图片url

function getFileUrl(ossKey) {
  ossKey = encodeURI(ossKey);
  return getWithReject("/safety/safety-common-service/oss/getFileUrlJsonType/safe/100?key=".concat(ossKey, "&projectType=safe&expireMinutes=100"));
} // 保留两位小数

function toDecimal2(x) {
  var f = parseFloat(x);

  if (isNaN(f)) {
    return false;
  }

  f = Math.round(x * 100) / 100;
  var s = f.toString();
  var rs = s.indexOf('.');

  if (rs < 0) {
    rs = s.length;
    s += '.';
  }

  while (s.length <= rs + 2) {
    s += '0';
  }

  return s;
} // 根据当前org在组织树中获取到目标组织节点

function findOrgNode(orgId) {
  if (!window) return {};
  var host = window.location.host;
  var pf = host + '$';
  var navOrgNode = window.sessionStorage.getItem(pf + 'navOrgNode');

  if (!navOrgNode) {
    return {};
  }

  navOrgNode = JSON.parse(navOrgNode);
  var orgStack = [];
  var org = {};
  var itemNode = {};
  orgStack.push(navOrgNode);

  while (orgStack.length > 0) {
    org = orgStack.shift();

    if (String(org.id) === String(orgId)) {
      itemNode = org;
      break;
    }

    if (org.childNodes) {
      for (var i = 0; i < org.childNodes.length; i++) {
        orgStack.push(org.childNodes[i]);
      }
    }
  }

  return itemNode;
}

exports.findOrgNode = findOrgNode;
exports.getFileUrl = getFileUrl;
exports.getOrgTree = getOrgTree;
exports.loadOrgTreeWithUser = loadOrgTreeWithUser;
exports.queryRiskClassNo = queryRiskClassNo;
exports.toDecimal2 = toDecimal2;
