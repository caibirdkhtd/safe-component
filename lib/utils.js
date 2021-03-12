'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

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

exports.ajax = ajax;
exports.apiMap = apiMap;
exports.camelize = camelize;
exports.createBEM = createBEM;
exports.deepClone = deepClone;
exports.deleted = deleted;
exports.formatDate = formatDate;
exports.formatFileSize = formatFileSize;
exports.gen = gen;
exports.genQueryString = genQueryString;
exports.get = get;
exports.getByData = getByData;
exports.getByDataWithReject = getByDataWithReject;
exports.getObjectURL = getObjectURL;
exports.getOri = getOri;
exports.getOriWithReject = getOriWithReject;
exports.getPercent = getPercent;
exports.getSessionContext = getSessionContext;
exports.getWithReject = getWithReject;
exports.handleAjax = handleAjax;
exports.hasIdInArr = hasIdInArr;
exports.hyphenate = hyphenate;
exports.indexOfIdInArr = indexOfIdInArr;
exports.isDevelop = isDevelop;
exports.isIE = isIE;
exports.jsonClone = jsonClone;
exports.parseQueryString = parseQueryString;
exports.post = post;
exports.postOri = postOri;
exports.postOriWithReject = postOriWithReject;
exports.postWithReject = postWithReject;
exports.put = put;
exports.searchQuerys = searchQuerys;
exports.validNumber = validNumber;
exports.validStr = validStr;
