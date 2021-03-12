export * from './ajax'

// export * from './reportCommonAction'

export const isDevelop = window && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

// getPercent(1, 3) => '33%'
// getPercent(1, 3, 2) => '33.33%'
export function getPercent (part = 0, sum = 0, precision = 0) {
  if (!part || !sum) {
    return '0%'
  } else {
    const dup = Math.pow(10, precision)
    const res = Math.round((part / sum) * dup * 100) / dup
    return res + '%'
  }
}

// ?type=org&id=123  => {type: "org", id: "123"}
export function searchQuerys () {
  if (!window) return {}
  let s = window.location.search.substr(1)
  let params = s ? s.split('&') : []
  let querys = {}
  for (let i = 0; i < params.length; i++) {
    let q = params[ i ].split('=')
    querys[ q[ 0 ] ] = unescape(q[ 1 ])
  }
  return querys
}

// const ids = [0, 1, 2, 3]
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
export function hasIdInArr (ids, key) {
  if (typeof(ids) === 'string') {
    return ids.indexOf(String(key)) !== -1
  }
  if (!ids || ids.length === 0 || key === undefined || key === null) {
    return false
  }
  const strIds = ids.map(id => String(id))
  return strIds.indexOf(String(key)) !== -1
}

export function indexOfIdInArr (ids, key) {
  if (typeof(ids) === 'string') {
    return ids.indexOf(String(key))
  }
  if (!ids || ids.length === 0 || key === undefined || key === null) {
    return -1
  }
  const strIds = ids.map(id => String(id))
  return strIds.indexOf(String(key))
}

export function isIE () {
  if (!window) {
    return false
  }
  return !!window.ActiveXObject || 'ActiveXObject' in window
}

export function validStr (errMsg) {
  return (rule, value, callback) => {
    if (value === '') {
      callback(new Error(errMsg))
    } else {
      callback()
    }
  }
}

export function validNumber (item, max = 99, min = 0, hasDot = true, allowMinEqual = true) {
  return (rule, val, callback) => {
    const value = val || ''
    const v = Number(value || 0)
    if (v > max + 0.99 || v < min || val === '' || (!allowMinEqual && v === min)) {
      callback(new Error(`请输入合理的${item}（${min}-${max}）！`))
    }
    const valueStr = value + ''
    if (hasDot) {
      if (valueStr.includes('.') && valueStr.split('.').length > 0) {
        if (valueStr.split('.')[1].length > 2) {
          callback(new Error(`${item}最多两位小数！`))
        }
      }
    } else {
      if (valueStr.includes('.')) {
        callback(new Error(`请输入整数！`))
      }
    }
    callback()
  }
}

export function getSessionContext () {
  if (!window) {
    return {}
  }
  const host = window.location.host
  const pf = host + '$'
  let getFromSession = (k) => {
    let s = window.sessionStorage[pf + k]
    let ret
    try {
      ret = JSON.parse(s)
    } catch (e) {
      ret = s
    }
    return ret
  }
  let appStatus = getFromSession('appStatus')
  return {
    projectId: getFromSession('projectId'),
    orgId: getFromSession('orgId'),
    orgName: getFromSession('orgName'),
    curUserId: getFromSession('userId'), // 当前登陆用户id
    curUserName: getFromSession('userName'),
    pageReadOnly: getFromSession('pageReadOnly'), // 一般用户或业务管理员
    allAppReadOnly: appStatus !== 0, // 产品过期
    tenantManager: getFromSession('tenantManager'), // 是否是租户管理员
    navOrgNode: getFromSession('navOrgNode'), // 是否是租户管理员
    tenantId: getFromSession('tenantId'), // 是否是租户管理员
    rootOrgId: getFromSession('rootOrgId'),
    appCode: getFromSession('appCode'),
    sid: getFromSession('sid'),
    orgFullIdList: getFromSession('orgFullIdList'),
    isSecurityGuard: getFromSession('IsSecurityGuard')
  }
}

// export function get () {
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

export function deepClone (val) {
  if (isPlainObject(val)) {
    var res = {};
    for (var key in val) {
      res[key] = deepClone(val[key]);
    }
    return res
  } else if (Array.isArray(val)) {
    return val.slice()
  } else {
    return val
  }
}

// example: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');
export function formatDate (date, format) {
  if (!date) return ''
  format = format || 'yyyy-MM-dd';
  switch (typeof date) {
    case 'string':
      date = new Date(date.replace(/-/g, '/').replace(/T/g, ' '))
      break
    case 'number':
      date = new Date(date)
      break
  }
  if (!(date instanceof Date)) return ''
  const y = date.getFullYear();
  const o = {
    'M+': date.getMonth() + 1, // 月
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'S+': date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, ('' + y).substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      let v = (void 0);
      if (RegExp.$1.length === 2) {
        v = ('00' + o[k]).substr(('' + o[k]).length);
      } else if (RegExp.$1.length === 3) {
        v = ('000' + o[k]).substr(('' + o[k]).length);
      } else { v = o[k]; }
      format = format.replace(RegExp.$1, v);
    }
  }
  return format;
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
let _toString = Object.prototype.toString;

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

export function formatFileSize (size) {
  if (size > 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  } else if (size > 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else {
    return size + 'B'
  }
}

export function jsonClone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

const hyphenateRE = /\B([A-Z])/g
const camelizeRE = /-(\w)/g

export function hyphenate (str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
}

export function camelize (str) {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
}

// 获取本地图片url
export function getObjectURL (file) {
  let url = null
  if (!window) {
    return ''
  }
  if (window.createObjectURL !== undefined) { // basic
    url = window.createObjectURL(file)
  } else if (window.URL !== undefined) { // mozilla(firefox)
    url = window.URL.createObjectURL(file)
  } else if (window.webkitURL !== undefined) { // webkit or chrome
    url = window.webkitURL.createObjectURL(file)
  }
  return url
}

export function gen(name, mods) {
  if (!mods) {
    return '';
  }
  if (typeof mods === 'string') {
    return " " + name + "--" + mods;
  }
  if (Array.isArray(mods)) {
    return mods.reduce(function (ret, item) { return ret + gen(name, item); }, '');
  }
  return Object.keys(mods).reduce(function (ret, key) { return ret + (mods[key] ? gen(name, key) : ''); }, '');
}
export function createBEM(name) {
  return function (el, mods) {
    if (el && typeof el !== 'string') {
      mods = el;
      el = '';
    }
    el = el ? name + "__" + el : name;
    return "safe-" + el + gen(el, mods);
  };
}
