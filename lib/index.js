'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));
var dayjs = _interopDefault(require('dayjs'));

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

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
function genQueryString(data) {
  var skipNullAndUndefined = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var str = Object.keys(data).reduce(function (arr, key) {
    var value = data[key];

    if (Array.isArray(value) && value.length > 0) {
      value.forEach(function (val) {
        arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
      });
    } else {
      if (skipNullAndUndefined && value !== null && value !== undefined || !skipNullAndUndefined) {
        arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
    }

    return arr;
  }, []).join('&');
  return '?' + str;
}
function parseQueryString(str) {
  var s = '';
  var baseUrl = '';

  if (str.includes('?')) {
    s = str.split('?')[1];
    baseUrl = str.split('?')[0];
  } else {
    baseUrl = str;
    s = str;
  }

  var params = s ? s.split('&') : [];
  var query = {};

  for (var i = 0; i < params.length; i++) {
    var q = params[i].split('=');
    query[q[0]] = unescape(q[1]);
  }

  return {
    query: query,
    baseUrl: baseUrl
  };
}
function get() {
  return ajax('get', arguments);
}
function getOri() {
  return ajax('get', arguments, true);
}
function getByData(url, data) {
  var query = genQueryString(data);
  var args = [].slice.call(arguments, 2);
  args.unshift(query);
  return get(url + query, args);
}
function getWithReject() {
  return ajax('get', arguments, false, true);
}
function getOriWithReject() {
  return ajax('get', arguments, true, true);
}
function getByDataWithReject(url, data) {
  var query = genQueryString(data);
  var args = [].slice.call(arguments, 2);
  args.unshift(query);
  return getWithReject(url + query, args);
}
function post() {
  return ajax('post', arguments);
}
function postOri() {
  return ajax('post', arguments, true);
}
function postWithReject() {
  return ajax('post', arguments, false, true);
}
function postOriWithReject() {
  return ajax('post', arguments, true, true);
}
function put() {
  return ajax('put', arguments);
}
function deleted() {
  return ajax('delete', arguments);
}
function handleAjax() {
  var apis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var apiName = arguments.length > 1 ? arguments[1] : undefined;
  var data = arguments.length > 2 ? arguments[2] : undefined;
  var api = apis[apiName];

  if (api) {
    var url = api.url || api;

    if (api.method !== 'POST') {
      return getByDataWithReject(url, data || {});
    } else {
      return postWithReject(url, Object.assign({}, api.data || {}, data));
    }
  } else {
    throw Error('no such apiName ' + apiName);
  }
}
var apiMap = {};

var isDevelop = window && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'); // getPercent(1, 3) => '33%'
// getPercent(1, 3, 2) => '33.33%'

function getPercent() {
  var part = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var sum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var precision = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (!part || !sum) {
    return '0%';
  } else {
    var dup = Math.pow(10, precision);
    var res = Math.round(part / sum * dup * 100) / dup;
    return res + '%';
  }
} // ?type=org&id=123  => {type: "org", id: "123"}

function searchQuerys() {
  if (!window) return {};
  var s = window.location.search.substr(1);
  var params = s ? s.split('&') : [];
  var querys = {};

  for (var i = 0; i < params.length; i++) {
    var q = params[i].split('=');
    querys[q[0]] = unescape(q[1]);
  }

  return querys;
} // const ids = [0, 1, 2, 3]
// const idArr = ['0', '1', '2', '3']
// console.log(hasIdInArr('1/2/3', 33))
// console.log(hasIdInArr('1/2/3', 2))
// console.log(hasIdInArr('1/2/3', '2'))
// console.log(hasIdInArr(null, 1)) //  false
// console.log(hasIdInArr(ids, undefined)) // false
// console.log(hasIdInArr(ids, 1)) // true
// console.log(hasIdInArr(ids, '1')) // true
// console.log(hasIdInArr(idArr, 1)) // true
// console.log(hasIdInArr(idArr, '1')) // true
// console.log(indexOfIdInArr('1/2/3', 33)) // -1
// console.log(indexOfIdInArr('1/2/3', 2)) // 2
// console.log(indexOfIdInArr('1/2/3', '2')) // 2
// console.log(indexOfIdInArr(null, 1)) //  -1
// console.log(indexOfIdInArr(ids, undefined)) // -1
// console.log(indexOfIdInArr(ids, 1)) // 1
// console.log(indexOfIdInArr(ids, '1')) // 1
// console.log(indexOfIdInArr(idArr, 1)) // 1
// console.log(indexOfIdInArr(idArr, '1')) // 1

function hasIdInArr(ids, key) {
  if (typeof ids === 'string') {
    return ids.indexOf(String(key)) !== -1;
  }

  if (!ids || ids.length === 0 || key === undefined || key === null) {
    return false;
  }

  var strIds = ids.map(function (id) {
    return String(id);
  });
  return strIds.indexOf(String(key)) !== -1;
}
function indexOfIdInArr(ids, key) {
  if (typeof ids === 'string') {
    return ids.indexOf(String(key));
  }

  if (!ids || ids.length === 0 || key === undefined || key === null) {
    return -1;
  }

  var strIds = ids.map(function (id) {
    return String(id);
  });
  return strIds.indexOf(String(key));
}
function isIE() {
  if (!window) {
    return false;
  }

  return !!window.ActiveXObject || 'ActiveXObject' in window;
}
function validStr(errMsg) {
  return function (rule, value, callback) {
    if (value === '') {
      callback(new Error(errMsg));
    } else {
      callback();
    }
  };
}
function validNumber(item) {
  var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 99;
  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var hasDot = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  var allowMinEqual = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  return function (rule, val, callback) {
    var value = val || '';
    var v = Number(value || 0);

    if (v > max + 0.99 || v < min || val === '' || !allowMinEqual && v === min) {
      callback(new Error("\u8BF7\u8F93\u5165\u5408\u7406\u7684".concat(item, "\uFF08").concat(min, "-").concat(max, "\uFF09\uFF01")));
    }

    var valueStr = value + '';

    if (hasDot) {
      if (valueStr.includes('.') && valueStr.split('.').length > 0) {
        if (valueStr.split('.')[1].length > 2) {
          callback(new Error("".concat(item, "\u6700\u591A\u4E24\u4F4D\u5C0F\u6570\uFF01")));
        }
      }
    } else {
      if (valueStr.includes('.')) {
        callback(new Error("\u8BF7\u8F93\u5165\u6574\u6570\uFF01"));
      }
    }

    callback();
  };
}
function getSessionContext() {
  if (!window) {
    return {};
  }

  var host = window.location.host;
  var pf = host + '$';

  var getFromSession = function getFromSession(k) {
    var s = window.sessionStorage[pf + k];
    var ret;

    try {
      ret = JSON.parse(s);
    } catch (e) {
      ret = s;
    }

    return ret;
  };

  var appStatus = getFromSession('appStatus');
  return {
    projectId: getFromSession('projectId'),
    orgId: getFromSession('orgId'),
    orgName: getFromSession('orgName'),
    curUserId: getFromSession('userId'),
    // 当前登陆用户id
    curUserName: getFromSession('userName'),
    pageReadOnly: getFromSession('pageReadOnly'),
    // 一般用户或业务管理员
    allAppReadOnly: appStatus !== 0,
    // 产品过期
    tenantManager: getFromSession('tenantManager'),
    // 是否是租户管理员
    navOrgNode: getFromSession('navOrgNode'),
    // 是否是租户管理员
    tenantId: getFromSession('tenantId'),
    // 是否是租户管理员
    rootOrgId: getFromSession('rootOrgId'),
    appCode: getFromSession('appCode'),
    sid: getFromSession('sid'),
    orgFullIdList: getFromSession('orgFullIdList'),
    isSecurityGuard: getFromSession('IsSecurityGuard')
  };
} // export function get () {
//   return ajax('get', arguments)
// }
// export function getWithReject () {
//   return ajax('get', arguments, false, true)
// }
// export function post () {
//   return ajax('post', arguments)
// }
// export function postWithReject () {
//   return ajax('post', arguments, false, true)
// }

function deepClone(val) {
  if (isPlainObject(val)) {
    var res = {};

    for (var key in val) {
      res[key] = deepClone(val[key]);
    }

    return res;
  } else if (Array.isArray(val)) {
    return val.slice();
  } else {
    return val;
  }
} // example: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

function formatDate(date, format) {
  if (!date) return '';
  format = format || 'yyyy-MM-dd';

  switch (_typeof(date)) {
    case 'string':
      date = new Date(date.replace(/-/g, '/').replace(/T/g, ' '));
      break;

    case 'number':
      date = new Date(date);
      break;
  }

  if (!(date instanceof Date)) return '';
  var y = date.getFullYear();
  var o = {
    'M+': date.getMonth() + 1,
    // 月
    'd+': date.getDate(),
    // 日
    'h+': date.getHours(),
    // 时
    'm+': date.getMinutes(),
    // 分
    's+': date.getSeconds(),
    // 秒
    'S+': date.getMilliseconds() // 毫秒

  };

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, ('' + y).substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      var v = void 0;

      if (RegExp.$1.length === 2) {
        v = ('00' + o[k]).substr(('' + o[k]).length);
      } else if (RegExp.$1.length === 3) {
        v = ('000' + o[k]).substr(('' + o[k]).length);
      } else {
        v = o[k];
      }

      format = format.replace(RegExp.$1, v);
    }
  }

  return format;
}
/**
 * Get the raw type string of a value, e.g., [object Object].
 */

var _toString = Object.prototype.toString;
/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */

function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

function formatFileSize(size) {
  if (size > 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + 'MB';
  } else if (size > 1024) {
    return (size / 1024).toFixed(2) + 'KB';
  } else {
    return size + 'B';
  }
}
function jsonClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
var hyphenateRE = /\B([A-Z])/g;
var camelizeRE = /-(\w)/g;
function hyphenate(str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase();
}
function camelize(str) {
  return str.replace(camelizeRE, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
} // 获取本地图片url

function getObjectURL(file) {
  var url = null;

  if (!window) {
    return '';
  }

  if (window.createObjectURL !== undefined) {
    // basic
    url = window.createObjectURL(file);
  } else if (window.URL !== undefined) {
    // mozilla(firefox)
    url = window.URL.createObjectURL(file);
  } else if (window.webkitURL !== undefined) {
    // webkit or chrome
    url = window.webkitURL.createObjectURL(file);
  }

  return url;
}
function gen(name, mods) {
  if (!mods) {
    return '';
  }

  if (typeof mods === 'string') {
    return " " + name + "--" + mods;
  }

  if (Array.isArray(mods)) {
    return mods.reduce(function (ret, item) {
      return ret + gen(name, item);
    }, '');
  }

  return Object.keys(mods).reduce(function (ret, key) {
    return ret + (mods[key] ? gen(name, key) : '');
  }, '');
}
function createBEM(name) {
  return function (el, mods) {
    if (el && typeof el !== 'string') {
      mods = el;
      el = '';
    }

    el = el ? name + "__" + el : name;
    return "safe-" + el + gen(el, mods);
  };
}

var setProgress = {
  methods: {
    setProgress: function setProgress(v) {
      if (document.getElementById('progress-bar')) {
        document.getElementById('progress-bar').style.width = (v || 0) * 100 + '%';
      }
    }
  }
};

function focus (ref) {
  return {
    methods: {
      focus: function focus() {
        if (this.$refs[ref]) {
          this.$refs[ref].focus();
        }
      }
    }
  };
}

function initBEM (name) {
  return {
    data: function data() {
      return {
        bem: null
      };
    },
    created: function created() {
      this.bem = createBEM(name);
    }
  };
}

/**
 * 获取日期返回：
 * getDayRangeOfLastWeek（），　返回　6天前到今天的日期，　用于最近一周的情况
 * getDayRangeOfLastMonth（），　返回一个月前到今天的日期，　用于查询最近一个月的情况
 * getDayRangeOfLast3Month（），　返回三个月前到今天的日期，　用于查询最近一个月的情况
 * */
var getDayRange = {
  methods: {
    getDayRangeOfLastWeek: function getDayRangeOfLastWeek() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOf7Days: function getDayRangeOf7Days() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLastMonth: function getDayRangeOfLastMonth() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLast7Days: function getDayRangeOfLast7Days() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOf30Days: function getDayRangeOf30Days() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLast30Days: function getDayRangeOfLast30Days() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLast90Days: function getDayRangeOfLast90Days() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(89, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfCurrentMonth: function getDayRangeOfCurrentMonth() {
      var startDate = dayjs().set('date', 1).format('YYYY-MM-DD');
      var endDate = dayjs().set('date', dayjs().daysInMonth()).format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfCurrentMonthToToday: function getDayRangeOfCurrentMonthToToday() {
      var startDate = dayjs().set('date', 1).format('YYYY-MM-DD');
      var endDate = dayjs().format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLast3Month: function getDayRangeOfLast3Month() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(3, 'month').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLastYear: function getDayRangeOfLastYear() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    }
  }
};

/**
 * el-table： 第一列靠左，其余居中样式。
 * getHeaderCellStyle(), headerCell
 * getCellStyle(), bodyCell
 * */
var tableCellStyle = {
  methods: {
    getHeaderCellStyle: function getHeaderCellStyle(_ref) {
      var columnIndex = _ref.columnIndex;
      return {
        'text-align': columnIndex ? 'center' : 'left',
        'font-size': '14px',
        'line-weight': 500
      };
    },
    getCellStyle: function getCellStyle(_ref2) {
      var columnIndex = _ref2.columnIndex;
      return {
        'text-align': columnIndex ? 'center' : 'left'
      };
    }
  }
};

/**
 * el-table： centerIndexArr: 需要局中的列的序列号
 * getHeaderCellStyle(), headerCell
 * getCellStyle(), bodyCell
 * */
function tableMultiCellStyle (centerIndexArr) {
  return {
    methods: {
      getHeaderCellStyle: function getHeaderCellStyle(_ref) {
        var columnIndex = _ref.columnIndex;
        var isCenter = centerIndexArr.indexOf(columnIndex) > -1;
        return {
          'text-align': isCenter ? 'center' : 'left',
          'font-size': '14px',
          'line-weight': 500
        };
      },
      getCellStyle: function getCellStyle(_ref2) {
        var columnIndex = _ref2.columnIndex;
        var isCenter = centerIndexArr.indexOf(columnIndex) > -1;
        return {
          'text-align': isCenter ? 'center' : 'left'
        };
      }
    }
  };
}

/**
 * pageSize: 每页显示数量，默认10
 * loadList: 刷新列表调用的方法
 * */
function pageProps (pageSize) {
  return {
    data: function data() {
      return {
        hasNext: false,
        isLoading: true,
        pageIndex: 1,
        pageSize: pageSize || 10,
        records: []
      };
    },
    methods: {
      pageChange: function pageChange(tmp) {
        this.pageIndex = this.pageIndex + tmp;

        if (this.loadList) {
          this.loadList(tmp);
        }
      },
      // 序号
      indexMethod: function indexMethod(index) {
        index = index + 1;

        if (this.pageIndex > 1) {
          return (this.pageIndex - 1) * this.pageSize + index;
        } else {
          return index;
        }
      }
    }
  };
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

var downLoad = {
  methods: {
    downLoadFile: function downLoadFile(ossKey) {
      var _this = this;

      getFileUrl(ossKey).then(function (data) {
        _this.downloadByIframe(data.result);
      }, function (err) {
        console.log(err);
      });
    },
    // 无闪现下载excel
    downloadByIframe: function downloadByIframe(url) {
      var iframe = document.createElement('iframe');
      iframe.style.display = 'none';

      function iframeLoad() {
        var win = iframe.contentWindow;
        var doc = win.document;

        if (win.location.href === url) {
          if (doc.body.childNodes.length > 0) ;

          iframe.parentNode.removeChild(iframe);
        }
      }

      if ('onload' in iframe) {
        iframe.onload = iframeLoad;
      } else if (iframe.attachEvent) {
        iframe.attachEvent('onload', iframeLoad);
      } else {
        iframe.onreadystatechange = function onreadystatechange() {
          if (iframe.readyState === 'complete') {
            iframeLoad();
          }
        };
      }

      iframe.src = '';
      document.body.appendChild(iframe);
      setTimeout(function () {
        iframe.contentWindow.location.href = url;
      }, 50);
    }
  }
};

var TableHeightMixin = {
  data: function data() {
    return {
      tableHeight: 300,
      diffHeight: 60
    };
  },
  mounted: function mounted() {
    window.addEventListener('resize', this.getTableHeight, false);
    this.getTableHeight();
  },
  destroyed: function destroyed() {
    window.removeEventListener('resize', this.getTableHeight);
  },
  methods: {
    getTableHeight: function getTableHeight() {
      var _this = this;

      this.$nextTick(function () {
        // console.log('this.$refs.content && this.$refs.content.offsetHeight', this.$refs.content && this.$refs.content.offsetHeight)
        _this.tableHeight = _this.$refs.content && _this.$refs.content.offsetHeight - _this.diffHeight;
      });
    }
  }
};

var DialogTableSizeMixin = {
  data: function data() {
    return {
      tableHeight: 300,
      bodyHeight: 500,
      isShortScreen: false,
      isLowScreen: false
    };
  },
  mounted: function mounted() {
    this.checkHeight();
    this.checkWeight();
  },
  methods: {
    checkHeight: function checkHeight() {
      this.bodyHeight = document.body.clientHeight;
      this.isLowScreen = document.body.clientHeight < 780;
      this.tableHeight = this.isLowScreen ? 300 : 480;
    },
    checkWeight: function checkWeight() {
      this.isShortScreen = document.body.clientWidth < 1300;
    }
  }
};

var ImageGroup = {
  functional: !0,
  render: function render(e, t) {
    var o = t.props.imgList,
        r = function r(e, _r) {
      var n = t.listeners['remove-image'];
      n && n(o, _r);
    },
        n = function n(e) {
      if (event.target === event.currentTarget) {
        var r = t.listeners['display-image'];
        r && r(o, e);
      }
    },
        a = function a(t, o) {
      return 'VIDEO' === t.extensionName ? e('i', {
        "class": 'i-play-video-btn',
        on: {
          click: function click() {
            return n(o);
          }
        }
      }, [e('span', {
        "class": 'iconfont icon-shipinjiankong-right',
        on: {
          click: function click() {
            return n(o);
          }
        }
      })]) : '';
    },
        i = t.props.showDeleteBtn,
        c = function c(t) {
      return i ? e('i', {
        "class": 'iconfont icon-guanbi-jiacu1 delete-btn',
        on: {
          click: function click(e) {
            return r(e, t);
          }
        }
      }) : '';
    };

    return o && o.length > 0 ? e('div', [o.map(function (t, o) {
      return e('div', {
        "class": 'image-super-container'
      }, [e('div', {
        "class": 'image-container'
      }, [e('img', {
        attrs: {
          src: t.smallImgUrl
        },
        on: {
          click: function click() {
            return n(o);
          }
        },
        "class": 'img'
      }), a(t, o), c(o)])]);
    })]) : e('div');
  },
  props: ['imgList', 'showDeleteBtn']
};

exports.DialogTableSizeMixin = DialogTableSizeMixin;
exports.ImageGroup = ImageGroup;
exports.TableHeightMixin = TableHeightMixin;
exports.ajax = ajax;
exports.apiMap = apiMap;
exports.camelize = camelize;
exports.createBEM = createBEM;
exports.deepClone = deepClone;
exports.deleted = deleted;
exports.downLoadMixin = downLoad;
exports.findOrgNode = findOrgNode;
exports.focus = focus;
exports.formatDate = formatDate;
exports.formatFileSize = formatFileSize;
exports.gen = gen;
exports.genQueryString = genQueryString;
exports.get = get;
exports.getByData = getByData;
exports.getByDataWithReject = getByDataWithReject;
exports.getDayRange = getDayRange;
exports.getFileUrl = getFileUrl;
exports.getObjectURL = getObjectURL;
exports.getOrgTree = getOrgTree;
exports.getOri = getOri;
exports.getOriWithReject = getOriWithReject;
exports.getPercent = getPercent;
exports.getSessionContext = getSessionContext;
exports.getWithReject = getWithReject;
exports.handleAjax = handleAjax;
exports.hasIdInArr = hasIdInArr;
exports.hyphenate = hyphenate;
exports.indexOfIdInArr = indexOfIdInArr;
exports.initBEM = initBEM;
exports.isDevelop = isDevelop;
exports.isIE = isIE;
exports.jsonClone = jsonClone;
exports.loadOrgTreeWithUser = loadOrgTreeWithUser;
exports.pageProps = pageProps;
exports.parseQueryString = parseQueryString;
exports.post = post;
exports.postOri = postOri;
exports.postOriWithReject = postOriWithReject;
exports.postWithReject = postWithReject;
exports.put = put;
exports.queryRiskClassNo = queryRiskClassNo;
exports.searchQuerys = searchQuerys;
exports.setProgress = setProgress;
exports.tableCellStyle = tableCellStyle;
exports.tableMultiCellStyle = tableMultiCellStyle;
exports.toDecimal2 = toDecimal2;
exports.validNumber = validNumber;
exports.validStr = validStr;
