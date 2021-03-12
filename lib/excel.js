'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('file-saver'));
var XLSX = _interopDefault(require('xlsx'));

function exportExcel(json, fields) {
  var filename = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '导出EXCEL.xlsx';
  json.forEach(function (item) {
    for (var i in item) {
      if (fields.hasOwnProperty(i)) {
        item[fields[i]] = item[i];
      }

      delete item[i]; // 删除原先的对象属性
    }
  });
  var sheetName = filename;
  var wb = XLSX.utils.book_new(); // 工作簿对象包含一SheetNames数组，以及一个表对象映射表名称到表对象。XLSX.utils.book_new实用函数创建一个新的工作簿对象。

  var _fields = Object.keys(fields).map(function (key) {
    return fields[key];
  });

  var ws = XLSX.utils.json_to_sheet(json, {
    header: _fields
  }); // 将js对象数组转换为工作表

  wb.SheetNames.push(sheetName);
  wb.Sheets[sheetName] = ws;
  var defaultCellStyle = {
    font: {
      name: 'Verdana',
      sz: 33,
      color: 'FF00FF88'
    },
    fill: {
      fgColor: {
        rgb: 'FFFFAA00'
      }
    }
  }; // 设置表格的样式

  var wopts = {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary',
    cellStyles: true,
    defaultCellStyle: defaultCellStyle,
    showGridLines: false
  }; // 写入的样式

  var wbout = XLSX.write(wb, wopts);
  var blob = new Blob([s2ab(wbout)], {
    type: ''
  });
  fs.saveAs(blob, filename + '.xlsx');
}

function s2ab(s) {
  if (typeof ArrayBuffer !== 'undefined') {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);

    for (var i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xff;
    }

    return buf;
  } else {
    var _buf = new Array(s.length);

    for (var _i = 0; _i !== s.length; ++_i) {
      _buf[_i] = s.charCodeAt(_i) & 0xFF;
    }

    return _buf;
  }
}

exports.exportExcel = exportExcel;
