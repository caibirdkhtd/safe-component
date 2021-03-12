'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
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
function post() {
  return ajax('post', arguments);
}

var FileServer =
/*#__PURE__*/
function () {
  function FileServer(options) {
    _classCallCheck(this, FileServer);

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
    }, options);
  }

  _createClass(FileServer, [{
    key: "extend",
    value: function extend(old, newData) {
      for (var p in newData) {
        if (newData.hasOwnProperty(p)) {
          old[p] = newData[p];
        }
      }

      return old;
    }
  }, {
    key: "uploadAndPersist",
    value: function uploadAndPersist(files, cb) {
      var me = this;

      function callback(keys, filesInfo) {
        me.persistByKey(keys, function (res) {
          cb(keys, filesInfo, res);
        });
      }

      this.upload(files, callback);
    }
  }, {
    key: "upload",
    value: function upload(files, cb) {
      var count = files.length;

      if (count <= 0) {
        return;
      }

      var options = this.options;
      options.persistKeys = new Array();
      options.fileInfos = new Array();
      options.totalCount = count;
      options.completeCount = 0;
      var maxSize = options.__maxSize;

      for (var i = 0; i < count; i++) {
        var fileItem = files[i]; // 大于__maxSize五兆就分块上传

        if (fileItem.size > maxSize) {
          multiPartPreUpload(fileItem, options, cb);
        } else {
          singleUpload(fileItem, options, cb);
        }
      }
    }
  }, {
    key: "persistByKey",
    value: function persistByKey(keys, callback) {
      var options = this.options;

      if (keys === null) {
        return {
          success: false,
          msg: '传入参数非法'
        };
      }

      if (keys instanceof Array === false) {
        var tmpKey = keys;
        keys = new Array();
        keys.push(tmpKey);
      }

      if (keys.length <= 0) {
        return {
          success: false,
          msg: '传入参数非法'
        };
      }

      var result = null;

      try {
        var postData = {
          keys: keys,
          deleted: true,
          productType: options.productType
        }; // console.log('postData', JSON.stringify(postData));

        post('/fs/adapter-v2/persist', postData).then(function (data) {
          // console.log('in persist res', data);
          var successKeys = new Array();

          if (data.successKeys !== null && data.successKeys.length > 0) {
            for (var i = 0; i < data.successKeys.length; i++) {
              var fileKey = {
                source_key: data.successKeys[i].sourceKey,
                target_key: data.successKeys[i].targetKey
              };
              successKeys.push(fileKey);
            }
          }

          result = {
            success: true,
            success_keys: successKeys,
            fail_keys: data.failKeys
          };

          if (callback) {
            callback(result);
          }
        });
      } catch (e) {
        result = {
          success: false,
          msg: e.message
        };

        if (callback) {
          callback(result);
        }
      }
    }
  }, {
    key: "deleteByKey",
    value: function deleteByKey(keys, callback) {
      var options = this.options;

      if (keys === null) {
        return {
          success: false,
          msg: '传入参数非法'
        };
      }

      if (keys instanceof Array === false) {
        var tmpKey = keys;
        keys = new Array();
        keys.push(tmpKey);
      }

      if (keys.length <= 0) {
        return {
          success: false,
          msg: '传入参数非法'
        };
      }

      var result = null;

      try {
        var postData = {
          keys: keys,
          productType: options.productType
        };
        post('/fs/adapter-v2/delete', postData).then(function (data) {
          if (data) {
            result = {
              success: data.success,
              msg: data.errorMessage ? data.errorMessage : ''
            };
          } else {
            result = {
              success: true,
              msg: ''
            };
          }

          if (callback) {
            callback(result);
          }
        });
      } catch (e) {
        result = {
          success: false,
          msg: e.message
        };

        if (callback) {
          callback(result);
        }
      }
    }
  }, {
    key: "persistAllAttachments",
    value: function persistAllAttachments(attachments) {
      var me = this;
      return new Promise(function (resolve, reject) {
        var keys = [];
        attachments.forEach(function (ele) {
          if (!ele.id) {
            keys.push(ele.persistKey);
          }
        });

        if (keys.length === 0) {
          resolve();
          return false;
        }

        me.persistByKey(keys, function (result) {
          if (result.success && result.success_keys.length === keys.length) {
            resolve(result.success_keys);
          } else {
            reject(new Error('持久化key失败'));
          }
        });
      });
    }
  }]);

  return FileServer;
}();

function multiPartUpload(fileItem, uploadId, partNumber, partCount, partETags, options, cb) {
  try {
    var parameters = 'partNumber=' + partNumber + '&uploadId=' + uploadId;
    var postData = {
      key: fileItem.newKey,
      bucketName: options.bucketName,
      method: 'PUT',
      parameters: parameters,
      isTmpFile: options.isTmpFile,
      moduleName: options.moduleName,
      productType: options.productType,
      isPublic: options.isPublic,
      autoGenerateKey: false
    };
    post('/fs/adapter-v2/url-signature', postData).then(function (data) {
      var url = data.signatureUrl;

      var xhr = __createXMLHttpRequest();

      xhr.open('put', url, true);
      var fileSize = fileItem.size;

      xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            var etag = xhr.getResponseHeader('ETag');
            partETags.push({
              part_number: partNumber,
              etag: etag
            });

            if (partCount == partNumber) {
              multiCompleteUpload(fileItem, uploadId, partETags, options, cb);
            } else {
              partNumber += 1;
              multiPartUpload(fileItem, uploadId, partNumber, partCount, partETags, options, cb);
            }
          }
        }
      }; // 计算传送数据


      var start = (partNumber - 1) * options.__blockSize;
      var end = Math.min(fileSize, partNumber * options.__blockSize);
      xhr.send(fileItem.slice(start, end));
    });
  } catch (e) {
    __complete({
      id: fileItem.id,
      success: false
    }, options, cb);
  }
}

function multiCompleteUpload(fileItem, uploadId, partETags, options, cb) {
  try {
    var parameters = 'uploadId=' + uploadId;
    var postData = {
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
    };
    post('/fs/adapter-v2/url-signature', postData).then(function (data) {
      var url = data.signatureUrl;

      var xhr = __createXMLHttpRequest();

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
          }, options, cb);
        }
      };

      xhr.open('post', url, true);
      xhr.send(__convertEtagToXml(partETags));
    });
  } catch (e) {
    __complete({
      id: fileItem.name,
      success: false
    }, options, cb);
  }
}

function multiPartPreUpload(fileItem, options, cb) {
  try {
    var fileKey = fileItem.name;
    var postData = {
      key: fileKey,
      bucketName: options.bucketName,
      method: 'POST',
      parameters: 'uploads',
      isTmpFile: options.isTmpFile,
      moduleName: options.moduleName,
      productType: options.productType,
      isPublic: options.isPublic,
      autoGenerateKey: options.autoGenerateKey
    };
    post('/fs/adapter-v2/url-signature', postData).then(function (data) {
      var url = data.signatureUrl;
      fileItem.newKey = fileKey.replace(new RegExp(/(\\)/g), '/');

      if (options.allowRepeated) {
        var index = fileItem.newKey.lastIndexOf('/');

        if (index > -1) {
          fileItem.newKey = fileItem.newKey.substring(0, fileItem.newKey.lastIndexOf('/')) + '/' + data.uploadKey.substring(data.uploadKey.lastIndexOf('/') + 1);
        } else {
          fileItem.newKey = data.uploadKey.substring(data.uploadKey.lastIndexOf('/') + 1);
        }
      }

      var xhr = __createXMLHttpRequest();

      xhr.open('post', url, true);
      xhr.setRequestHeader('Content-Disposition', 'attachment;filename=' + encodeURIComponent(fileItem.name));

      xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            var xmlDoc = xhr.responseXML;
            var uploadId = xmlDoc.getElementsByTagName('UploadId')[0].textContent; // window.$CloudTFileServiceClient._partETags = new Array();

            var fileSize = fileItem.size;
            var partCount = Math.ceil(fileSize / options.__blockSize); // 阿里云上传partNumber从1开始

            multiPartUpload(fileItem, uploadId, 1, partCount, new Array(), options, cb);
          }
        }
      };

      xhr.send();
    });
  } catch (e) {
    console.log('multiPartPreUpload', e);
  }
}

function singleUpload(fileItem, options, cb) {
  try {
    var postData = {
      bucketName: options.bucketName,
      key: fileItem.name,
      isTmpFile: options.isTmpFile,
      moduleName: options.moduleName,
      productType: options.productType,
      isPublic: options.isPublic,
      autoGenerateKey: options.autoGenerateKey
    }; // console.log('postData', JSON.stringify(postData));

    post(' /fs/adapter-v2/fs-form-signature', postData).then(function (data) {
      // console.log("__singleUpload", data);
      var action = data.host || 'https://' + data.bucketName + '.' + data.endPoint;
      var formData = new FormData();
      var accessIdName = data.accessIdName ? data.accessIdName : 'OSSAccessKeyId'; // formData.append('Content-Type', 'multipart/form-data')

      formData.append(accessIdName, data.accessId);
      formData.append('policy', data.policy);
      formData.append('signature', data.signature);
      formData.append('key', data.uploadKey); // formData.append('Content-Disposition', 'attachment;filename=' + encodeURIComponent(fileItem.name))

      formData.append('Content-Disposition', data.contentDisposition);
      formData.append('success_action_status', 200);
      formData.append('file', fileItem);

      var xhr = __createXMLHttpRequest(); // 数据加载完成事件


      xhr.upload.addEventListener('load', function (e) {
        __complete({
          id: fileItem.name,
          success: true,
          persistKey: data.key,
          targetKey: data.targetKey,
          size: fileItem.size,
          type: fileItem.type
        }, options, cb);
      }, false);
      xhr.open('post', action, true); // xhr.setRequestHeader("Content-Disposition", ('attachment;filename=' + encodeURIComponent(fileItem.name)));

      xhr.send(formData);
    });
  } catch (e) {
    __complete({
      id: fileItem.name,
      success: false
    }, options, cb);
  }
}

function __createXMLHttpRequest() {
  if (window.XMLHttpRequest) {
    // 非IE浏览器
    return new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    // 如果是IE浏览器
    return new ActiveXObject('Microsoft.XMLHTTP');
  }
}

function __complete(e, options, cb) {
  options.persistKeys.push(e.persistKey);
  options.fileInfos.push(e); // console.log('upload file with detail: ', e);

  options.completeCount += 1;

  if (options.completeCount == options.totalCount) {
    if (cb) {
      cb(options.persistKeys, options.fileInfos);
    } // console.log('upload complete', options.fileInfos);
    // console.log("upload complete with persistKeys:", options.persistKeys);

  }
}

function __convertEtagToXml(partETags) {
  if (!partETags || partETags.length <= 0) {
    return null;
  }

  var xmlContent = '<CompleteMultipartUpload>';

  for (var i = 0; i < partETags.length; i++) {
    xmlContent += '<Part>';
    xmlContent += '<PartNumber>' + partETags[i].part_number + '</PartNumber>';
    xmlContent += '<ETag>' + partETags[i].etag + '</ETag>';
    xmlContent += '</Part>';
  }

  xmlContent += '</CompleteMultipartUpload>';
  return xmlContent;
}

module.exports = FileServer;
