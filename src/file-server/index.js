
import { get ,post,getWithReject} from '../utils/index'

export default class FileServer {
  constructor (options) {
    this.options = this.extend({
      bucketName: '',
      isTmpFile: true,
      moduleName: 'reference',
      productType: 'safe',
      isPublic: false,
      autoGenerateKey: true,
      __blockSize: 2 * 1024 * 1024,
      __maxSize: 5 * 1024 * 1024,
      completeCount: 0,
      totalCount: 1,
      allowRepeated: true,
      persistKeys: [],
      fileInfos: []
    }, options)
  }
  extend (old, newData) {
    for (var p in newData) {
      if (newData.hasOwnProperty(p)) { old[p] = newData[p] }
    }
    return old
  }
  uploadAndPersist (files, cb) {
    const me = this
    function callback (keys, filesInfo) {
      me.persistByKey(keys, function (res) {
        cb(keys, filesInfo, res)
      })
    }
    this.upload(files, callback)
  }
  upload (files, cb) {
    const count = files.length
    if (count <= 0) {
      return
    }

    const options = this.options
    options.persistKeys = new Array()
    options.fileInfos = new Array()
    options.totalCount = count
    options.completeCount = 0

    const maxSize = options.__maxSize

    for (let i = 0; i < count; i++) {
      const fileItem = files[i]
      // 大于__maxSize五兆就分块上传
      if (fileItem.size > maxSize) {
        multiPartPreUpload(fileItem, options, cb)
      } else {
        singleUpload(fileItem, options, cb)
      }
    }
  }

  persistByKey (keys, callback) {
    const options = this.options
    if (keys === null) {
      return { success: false, msg: '传入参数非法' }
    }
    if ((keys instanceof Array) === false) {
      const tmpKey = keys
      keys = new Array()
      keys.push(tmpKey)
    }
    if (keys.length <= 0) {
      return { success: false, msg: '传入参数非法' }
    }
    let result = null
    try {
      const postData = {
        keys: keys,
        deleted: true,
        productType: options.productType
      }
      // console.log('postData', JSON.stringify(postData));
      post('/fs/adapter-v2/persist', postData).then((data) => {
        // console.log('in persist res', data);
        const successKeys = new Array()
        if (data.successKeys !== null && data.successKeys.length > 0) {
          for (let i = 0; i < data.successKeys.length; i++) {
            const fileKey = {
              source_key: data.successKeys[i].sourceKey,
              target_key: data.successKeys[i].targetKey
            }
            successKeys.push(fileKey)
          }
        }
        result = {
          success: true,
          success_keys: successKeys,
          fail_keys: data.failKeys
        }
        if (callback) {
          callback(result)
        }
      })
    } catch (e) {
      result = {
        success: false,
        msg: e.message
      }
      if (callback) {
        callback(result)
      }
    }
  }

  deleteByKey (keys, callback) {
    const options = this.options
    if (keys === null) {
      return { success: false, msg: '传入参数非法' }
    }
    if ((keys instanceof Array) === false) {
      const tmpKey = keys
      keys = new Array()
      keys.push(tmpKey)
    }
    if (keys.length <= 0) {
      return { success: false, msg: '传入参数非法' }
    }
    let result = null
    try {
      const postData = {
        keys: keys,
        productType: options.productType
      }
      post('/fs/adapter-v2/delete', postData).then(data => {
        if (data) {
          result = {
            success: data.success,
            msg: data.errorMessage ? data.errorMessage : ''
          }
        } else {
          result = { success: true, msg: '' }
        }
        if (callback) {
          callback(result)
        }
      })
    } catch (e) {
      result = {
        success: false,
        msg: e.message
      }
      if (callback) {
        callback(result)
      }
    }
  }

  persistAllAttachments (attachments) {
    let me =this
    return new Promise((resolve, reject) => {
      let keys = []
      attachments.forEach(ele => { 
        if(!ele.id){keys.push(ele.persistKey)}
      })
      if(keys.length===0){
        resolve()
        return false
      }
      me.persistByKey(keys, (result) => {
        if (result.success && result.success_keys.length === keys.length) {
          resolve(result.success_keys)
        } else {
          reject(new Error('持久化key失败'))
        }
      })
    })
  }
}

function multiPartUpload (fileItem, uploadId, partNumber, partCount, partETags, options, cb) {
  try {
    const parameters = 'partNumber=' + partNumber + '&uploadId=' + uploadId
    const postData = {
      key: fileItem.newKey,
      bucketName: options.bucketName,
      method: 'PUT',
      parameters: parameters,
      isTmpFile: options.isTmpFile,
      moduleName: options.moduleName,
      productType: options.productType,
      isPublic: options.isPublic,
      autoGenerateKey: false
    }

    post('/fs/adapter-v2/url-signature', postData).then(data => {
      const url = data.signatureUrl
      const xhr = __createXMLHttpRequest()
      xhr.open('put', url, true)
      const fileSize = fileItem.size

      xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            const etag = xhr.getResponseHeader('ETag')
            partETags.push({ part_number: partNumber, etag: etag })
            if (partCount == partNumber) {
              multiCompleteUpload(fileItem, uploadId, partETags, options, cb)
            } else {
              partNumber += 1
              multiPartUpload(fileItem, uploadId, partNumber, partCount, partETags, options, cb)
            }
          }
        }
      }

      // 计算传送数据
      const start = (partNumber - 1) * options.__blockSize
      const end = Math.min(fileSize, partNumber * options.__blockSize)

      xhr.send(fileItem.slice(start, end))
    })
  } catch (e) {
    __complete({
      id: fileItem.id, success: false
    }, options, cb)
  }
}

function multiCompleteUpload (fileItem, uploadId, partETags, options, cb) {
  try {
    const parameters = 'uploadId=' + uploadId
    const postData = {
      key: fileItem.newKey,
      bucketName: options.bucketName,
      method: 'POST',
      parameters: parameters,
      contentType: 'text/plain;charset=UTF-8',
      isTmpFile: options.isTmpFile,
      moduleName: options.moduleName,
      productType: options.productType,
      isPublic: options.isPublic,
      autoGenerateKey: false
    }
    post('/fs/adapter-v2/url-signature', postData).then(data => {
      const url = data.signatureUrl
      const xhr = __createXMLHttpRequest()
      xhr.onreadystatechange = function (e) {
        // console.log('upload complete state change: readyState:' + xhr.readyState + ",status:" + xhr.status);
        // console.log('xhr.responseText:' + xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == 200) {
          __complete({
            id: fileItem.name,
            success: true,
            persistKey: data.persistKey,
            targetKey: data.targetKey,
            size: fileItem.size,
            type: fileItem.type
          }, options, cb)
        }
      }
      xhr.open('post', url, true)
      xhr.send(__convertEtagToXml(partETags))
    })
  } catch (e) {
    __complete({ id: fileItem.name, success: false }, options, cb)
  }
}

function multiPartPreUpload (fileItem, options, cb) {
  try {
    const fileKey = fileItem.name
    const postData = {
      key: fileKey,
      bucketName: options.bucketName,
      method: 'POST',
      parameters: 'uploads',
      isTmpFile: options.isTmpFile,
      moduleName: options.moduleName,
      productType: options.productType,
      isPublic: options.isPublic,
      autoGenerateKey: options.autoGenerateKey
    }

    post('/fs/adapter-v2/url-signature', postData).then(data => {
      const url = data.signatureUrl
      fileItem.newKey = fileKey.replace(new RegExp(/(\\)/g), '/')
      if (options.allowRepeated) {
        const index = fileItem.newKey.lastIndexOf('/')
        if (index > -1) {
          fileItem.newKey = fileItem.newKey.substring(0, fileItem.newKey.lastIndexOf('/')) + '/' + data.uploadKey.substring(data.uploadKey.lastIndexOf('/') + 1)
        } else {
          fileItem.newKey = data.uploadKey.substring(data.uploadKey.lastIndexOf('/') + 1)
        }
      }
      const xhr = __createXMLHttpRequest()
      xhr.open('post', url, true)
      xhr.setRequestHeader('Content-Disposition', 'attachment;filename=' + encodeURIComponent(fileItem.name))
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            const xmlDoc = xhr.responseXML
            const uploadId = xmlDoc.getElementsByTagName('UploadId')[0].textContent
            // window.$CloudTFileServiceClient._partETags = new Array();
            const fileSize = fileItem.size
            const partCount = Math.ceil(fileSize / options.__blockSize)
            // 阿里云上传partNumber从1开始
            multiPartUpload(fileItem, uploadId, 1, partCount, new Array(), options, cb)
          }
        }
      }
      xhr.send()
    })
  } catch (e) {
    console.log('multiPartPreUpload', e)
  }
}

function singleUpload (fileItem, options, cb) {
  try {
    const postData = {
      bucketName: options.bucketName,
      key: fileItem.name,
      isTmpFile: options.isTmpFile,
      moduleName: options.moduleName,
      productType: options.productType,
      isPublic: options.isPublic,
      autoGenerateKey: options.autoGenerateKey
    }
    // console.log('postData', JSON.stringify(postData));
    post(' /fs/adapter-v2/fs-form-signature', postData).then((data) => {
      // console.log("__singleUpload", data);
      const action = data.host || ('https://' + data.bucketName + '.' + data.endPoint)
      const formData = new FormData()
      var accessIdName = data.accessIdName ? data.accessIdName:'OSSAccessKeyId'
      // formData.append('Content-Type', 'multipart/form-data')
      formData.append(accessIdName, data.accessId)
      formData.append('policy', data.policy)
      formData.append('signature', data.signature)
      formData.append('key', data.uploadKey)
      // formData.append('Content-Disposition', 'attachment;filename=' + encodeURIComponent(fileItem.name))
      formData.append('Content-Disposition', data.contentDisposition)
      formData.append('success_action_status', 200)
      formData.append('file', fileItem)
      const xhr = __createXMLHttpRequest()
      // 数据加载完成事件
      xhr.upload.addEventListener('load', function (e) {
        __complete({
          id: fileItem.name,
          success: true,
          persistKey: data.key,
          targetKey: data.targetKey,
          size: fileItem.size,
          type: fileItem.type
        }, options, cb)
      }, false)
      xhr.open('post', action, true)
      // xhr.setRequestHeader("Content-Disposition", ('attachment;filename=' + encodeURIComponent(fileItem.name)));
      xhr.send(formData)
    })
  } catch (e) {
    __complete({ id: fileItem.name, success: false }, options, cb)
  }
}

function __createXMLHttpRequest () {
  if (window.XMLHttpRequest) { // 非IE浏览器
    return new XMLHttpRequest()
  } else if (window.ActiveXObject) { // 如果是IE浏览器
    return new ActiveXObject('Microsoft.XMLHTTP')
  }
}

function __complete (e, options, cb) {
  options.persistKeys.push(e.persistKey)
  options.fileInfos.push(e)
  // console.log('upload file with detail: ', e);
  options.completeCount += 1
  if (options.completeCount == options.totalCount) {
    if (cb) {
      cb(options.persistKeys, options.fileInfos)
    }
    // console.log('upload complete', options.fileInfos);
    // console.log("upload complete with persistKeys:", options.persistKeys);
  }
}

function __convertEtagToXml (partETags) {
  if (!partETags || partETags.length <= 0) {
    return null
  }
  let xmlContent = '<CompleteMultipartUpload>'
  for (let i = 0; i < partETags.length; i++) {
    xmlContent += '<Part>'
    xmlContent += '<PartNumber>' + partETags[i].part_number + '</PartNumber>'
    xmlContent += '<ETag>' + partETags[i].etag + '</ETag>'
    xmlContent += '</Part>'
  }
  xmlContent += '</CompleteMultipartUpload>'
  return xmlContent
}
