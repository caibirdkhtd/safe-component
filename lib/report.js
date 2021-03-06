'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));
var $ = _interopDefault(require('jquery'));

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
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
        console.log('???????????????????????????????????????', 'warn');
        reject(thrown);
      }
    });
  });
}
function get() {
  return ajax('get', arguments);
}

function queryReport(parmas, callback) {
  // ????????????
  var url = '/report/services/menu/menus?tenantid=0&prdCode=safe&code=' + parmas.code;
  get(url).then(function (result) {
    var reportIds = {};
    var arr = [];

    if (result && result.length > 0) {
      for (var i = 0, l = result.length; i < l; i++) {
        reportIds[result[i].reportId] = result[i];
      }

      for (var prop in reportIds) {
        arr.push(reportIds[prop]);
      }
    }

    if (callback) callback(arr);
  });
} // ???????????????????????????chrome?????????????????????

function syncQueryReport(parmas) {
  var url = '/report/services/menu/menus?tenantid=0&prdCode=safe&code=' + parmas.code;
  $.ajax({
    url: url,
    type: 'GET',
    async: false,
    timeout: 5000,
    // ????????????
    dataType: 'json',
    success: function success(data, hr) {
      if (data) {
        if (data.success) {
          if (parmas.callback) {
            var reportIds = {};
            var arr = [];
            var result = data.data;

            if (result && result.length > 0) {
              for (var i = 0, l = result.length; i < l; i++) {
                reportIds[result[i].reportId] = result[i];
              }

              for (var prop in reportIds) {
                arr.push(reportIds[prop]);
              }
            }

            parmas.callback(arr);
          }
        } else {
          if (parmas.errorCallback) {
            parmas.errorCallback(data.errorMsg);
          }
        }
      }
    }
  });
} // ????????????-???????????????????????????????????????????????????????????????doBatchPrint???

function syncDownLoadReport(params) {
  var url = '/ReportServer/ReportFile?op=download&reportid=' + params.reportId;
  $.ajax({
    url: url,
    type: 'GET',
    async: false,
    timeout: 5000,
    // ????????????
    dataType: 'json',
    success: function success(data, hr) {
      if (data) {
        if (data.success) {
          if (params.callback) {
            params.callback(data.data);
          }
        } else {
          if (params.errorCallback) {
            params.errorCallback(data.errorMsg);
          }
        }
      }
    }
  });
} //????????????-??????????????????
// params:{
//   reportId:??????id
//   selectedIds:????????????????????????id????????????????????????id ??????:[100002,233332],
//   filterParams:?????????????????????????????????id?????????????????????selectedIds?????????filterParams???filterParams:[{id:1,riskType:2},{id:2,riskType:1},{id:3,riskType:2}]
//   errorCallback:()=>{}?????????????????????
// }

function doBatchPrint(params) {
  var url = '/ReportServer/ReportFile?op=download&reportid=' + params.reportId; // ????????????-????????????cpt??????

  $.ajax({
    url: url,
    type: 'GET',
    async: false,
    timeout: 5000,
    // ????????????
    dataType: 'json',
    success: function success(data, hr) {
      if (data) {
        if (data.success) {
          params.url = data.data;
          genUrlToPrint(params);
        } else {
          if (params.errorCallback) {
            params.errorCallback(data.errorMsg);
          }
        }
      }
    }
  });
} // ?????????????????????

function delReport(params) {
  get('/ReportServer/ReportFile?op=delete&file=' + encodeURIComponent(params.fileUrl)).then(function (data) {
    if (params.callback) params.callback(data);
  });
} //?????????????????????8.0???10.0??????url

function genUrlToPrint(params) {
  if (!window) {
    return;
  }

  var printurl;
  get("/report/versions/getCurrentVersion").then(function (res) {
    if (res === '10.0') {
      printurl = 'https://' + window.location.host + '/decision/view/report';
    } else {
      printurl = 'https://' + window.location.host + '/ReportServer';
    }

    doURLPDFPrint(params.url, printurl, params);
  })["catch"](function (err) {
    console.log(err);
    printurl = 'https://' + window.location.host + '/decision/view/report';
    doURLPDFPrint(params.url, printurl, params);
  });
} //pdf????????????
//??????????????????????????????????????????????????????filterParams:
// params:{
//   filterParams:[{id:1,riskType:2},{id:2,riskType:1},{id:3,riskType:2}]
// }
// ????????????????????????id?????????????????????????????????selectedIds???
// params:{
//   selectedIds:["3345323","44444","1233422"]
// }


function doURLPDFPrint(url, printurl, params) {
  var arr = [];

  if (params.filterParams && params.filterParams.length > 0) {
    //???????????????????????????
    params.filterParams.forEach(function (ele) {
      var obj = {};

      for (var key in ele) {
        obj['filter_' + key] = ele[key];
      }

      arr.push(_objectSpread2({
        reportlet: url
      }, obj));
    });
  } else if (params.selectedIds) {
    //????????????????????????id
    params.selectedIds.forEach(function (id) {
      arr.push({
        reportlet: url,
        filter_id: id
      });
    });
  }

  var reportlets = FR.cjkEncode(JSON.stringify(arr));
  var config = {
    url: printurl,
    isPopUp: false,
    data: {
      reportlets: reportlets
    }
  };

  try {
    FR.doURLPDFPrint(config);
  } catch (ex) {
    console.log(ex);
  } finally {
    delReport({
      fileUrl: url
    });
  }
}

exports.delReport = delReport;
exports.doBatchPrint = doBatchPrint;
exports.queryReport = queryReport;
exports.syncDownLoadReport = syncDownLoadReport;
exports.syncQueryReport = syncQueryReport;
