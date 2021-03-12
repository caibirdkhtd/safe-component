import axios from 'axios'
export function ajax (method, args, ori, withReject) {
  // axios.defaults.headers.common['endpoint'] = `AJAX`
  args = Array.prototype.slice.call(args, 0)
  let url = args[0]
  let lc = url.indexOf('?') > 0 ? '&' : '?'
  args[0] = url + lc + '__ts=' + (new Date().getTime())
  return new Promise((resolve, reject) => {
    axios[method].apply(axios, args).then(function (response) {
      if (response.status === 401) {
        // window.location.href = '/index.jsp'
      } else {
        if (ori !== true) {
          if (response.data.success) {
            resolve(response.data.data || response.data.result)
          } else {
            if (response.data.errorCode === 'HTTP_401') {
              // window.location.href = '/index.jsp'
            } else {
              console.error('[fail]: ' + JSON.stringify(response.data))
              if (withReject) {
                reject(response.data)
              } else if (response.data && response.data.errorMsg) {
                // sparrow.showMessage(response.data.errorMsg, 'warn')
                console.log(response.data.errorMsg, 'warn')
              }
            }
          }
        } else resolve(response)
      }
    }).catch((thrown) => {
      if (thrown.response && thrown.response.status === 401) {
        if (window && window.location) {
          window.location.replace('/logout')
        }
      } else if (thrown.response && thrown.response.data && thrown.response.data.message) {
        reject(thrown.response.data)
      } else {
        console.error('[error]', thrown.message)
        console.log('从服务器获取数据发生错误！', 'warn')
        reject(thrown)
      }
    })
  })
}


export function genQueryString (data, skipNullAndUndefined = false) {
  const str = Object.keys(data).reduce((arr, key) => {
    const value = data[key]
    if (Array.isArray(value) && value.length > 0) {
      value.forEach(val => {
        arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(val))
      })
    } else {
      if ((skipNullAndUndefined && value !== null && value !== undefined) || !skipNullAndUndefined) {
        arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
      }
    }
    return arr
  }, []).join('&')
  return '?' + str
}

export function parseQueryString (str) {
  let s = ''
  let baseUrl = ''
  if (str.includes('?')) {
    s = str.split('?')[1]
    baseUrl = str.split('?')[0]
  } else {
    baseUrl = str
    s = str
  }
  const params = s ? s.split('&') : []
  const query = {}
  for (let i = 0; i < params.length; i++) {
    const q = params[i].split('=')
    query[q[0]] = unescape(q[1])
  }
  return { query, baseUrl }
}

export function get () {
  return ajax('get', arguments)
}

export function getOri () {
  return ajax('get', arguments, true)
}

export function getByData (url, data) {
  const query = genQueryString(data)
  const args = [].slice.call(arguments, 2)
  args.unshift(query)
  return get(url + query, args)
}

export function getWithReject () {
  return ajax('get', arguments, false, true)
}

export function getOriWithReject () {
  return ajax('get', arguments, true, true)
}

export function getByDataWithReject (url, data) {
  const query = genQueryString(data)
  const args = [].slice.call(arguments, 2)
  args.unshift(query)
  return getWithReject(url + query, args)
}

export function post () {
  return ajax('post', arguments)
}

export function postOri () {
  return ajax('post', arguments, true)
}

export function postWithReject () {
  return ajax('post', arguments, false, true)
}

export function postOriWithReject () {
  return ajax('post', arguments, true, true)
}

export function put () {
  return ajax('put', arguments)
}

export function deleted () {
  return ajax('delete', arguments)
}

export function handleAjax (apis = {}, apiName, data) {
  const api = apis[apiName]
  if (api) {
    const url = api.url || api
    if (api.method !== 'POST') {
      return getByDataWithReject(url, data || {})
    } else {
      return postWithReject(url, Object.assign({}, api.data || {}, data))
    }
  } else {
    throw Error('no such apiName ' + apiName)
  }
}

export const apiMap = {}
