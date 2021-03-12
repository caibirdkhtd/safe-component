import { get } from '../utils/ajax'
import $ from 'jquery'

export function queryReport (parmas, callback) { // 获取报表
  let url = '/report/services/menu/menus?tenantid=0&prdCode=safe&code=' + parmas.code

  get(url).then((result) => {
    let reportIds = {}
    let arr = []
    if (result && result.length > 0) {
      for (let i = 0, l = result.length; i < l; i++) {
        reportIds[result[i].reportId] = result[i]
      }
      for (let prop in reportIds) {
        arr.push(reportIds[prop])
      }
    }
    if (callback) callback(arr)
  })
}
// 同步获取报表，解决chrome弹出窗口被拦截
export function syncQueryReport (parmas) {
  let url = '/report/services/menu/menus?tenantid=0&prdCode=safe&code=' + parmas.code
  $.ajax({
    url: url,
    type: 'GET',
    async: false,
    timeout: 5000, // 超时时间
    dataType: 'json',
    success: function (data, hr) {
      if (data) {
        if (data.success) {
          if (parmas.callback) {
            let reportIds = {}
            let arr = []
            let result = data.data
            if (result && result.length > 0) {
              for (let i = 0, l = result.length; i < l; i++) {
                reportIds[result[i].reportId] = result[i]
              }
              for (let prop in reportIds) {
                arr.push(reportIds[prop])
              }
            }
            parmas.callback(arr)
          }
        } else {
          if (parmas.errorCallback) { parmas.errorCallback(data.errorMsg) }
        }
      }
    }
  })
}
// 批量打印-缓存报表（兼容之前，先不去掉，之后统一掉用doBatchPrint）
export function syncDownLoadReport (params) {
  let url = '/ReportServer/ReportFile?op=download&reportid=' + params.reportId
  $.ajax({
    url: url,
    type: 'GET',
    async: false,
    timeout: 5000, // 超时时间
    dataType: 'json',
    success: function (data, hr) {
      if (data) {
        if (data.success) {
          if (params.callback) {
            params.callback(data.data)
          }

        } else {
          if (params.errorCallback) { params.errorCallback(data.errorMsg) }
        }
      }
    }
  })
}

//批量打印-唯一入口方法
// params:{
//   reportId:报表id
//   selectedIds:报表只有一个入参id，需要打印的记录id 比如:[100002,233332],
//   filterParams:报表多个参数或入参不是id时，不需要传参selectedIds，传递filterParams：filterParams:[{id:1,riskType:2},{id:2,riskType:1},{id:3,riskType:2}]
//   errorCallback:()=>{}需要往外部抛错
// }
export function doBatchPrint (params) {
  let url = '/ReportServer/ReportFile?op=download&reportid=' + params.reportId
  // 批量打印-缓存报表cpt文件
  $.ajax({
    url: url,
    type: 'GET',
    async: false,
    timeout: 5000, // 超时时间
    dataType: 'json',
    success: function (data, hr) {
      if (data) {
        if (data.success) {
          params.url = data.data
          genUrlToPrint(params)

        } else {
          if (params.errorCallback) { params.errorCallback(data.errorMsg) }
        }
      }
    }
  })
}
// 删除缓存中报表
export function delReport (params) {
  get('/ReportServer/ReportFile?op=delete&file=' + encodeURIComponent(params.fileUrl)).then(data => {
    if (params.callback) params.callback(data)
  })
}


//根据平台服务是8.0和10.0判断url
function genUrlToPrint (params) {
  if (!window) {
    return
  }
  let printurl
  get(`/report/versions/getCurrentVersion`)
    .then(res => {
      if (res === '10.0') {
        printurl = window.location.origin + '/decision/view/report'
      } else {
        printurl = window.location.origin + '/ReportServer'
      }
      doURLPDFPrint(params.url, printurl,params)
    }).catch(err => {
      console.log(err)
      printurl = window.location.origin + '/decision/view/report'
      doURLPDFPrint(params.url, printurl,params)
    })
  }

//pdf批量打印
//报表入参为多个参数，需要在传参前拼好filterParams:
// params:{
//   filterParams:[{id:1,riskType:2},{id:2,riskType:1},{id:3,riskType:2}]
// }
// 报表只有一个入参id时，需要在传参前拼装好selectedIds：
// params:{
//   selectedIds:["3345323","44444","1233422"]
// }

function doURLPDFPrint (url, printurl,params) {
  let arr = []
  if(params.filterParams && params.filterParams.length>0){//报表入参为多个参数
    params.filterParams.forEach(ele => {
      let obj = {}
      for(let key in ele){
        obj['filter_'+key] = ele[key]
      }
      arr.push({ reportlet: url,...obj})
    })
  }else if(params.selectedIds){//报表只有一个入参id
      params.selectedIds.forEach(id => {
        arr.push({ reportlet: url, filter_id: id})
      })
  }

  let reportlets = FR.cjkEncode(JSON.stringify(arr))
  let config = {
    url: printurl,
    isPopUp: false,
    data: {
      reportlets: reportlets
    }
  }
  try {
    FR.doURLPDFPrint(config)
  } catch (ex) {
    console.log(ex)
  } finally {
    delReport({ fileUrl: url })
  }
}
