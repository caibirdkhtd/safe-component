import fs from 'file-saver'
import XLSX from 'xlsx'

export function exportExcel (json, fields, filename = '导出EXCEL.xlsx') {
  json.forEach(item => {
    for (let i in item) {
      if (fields.hasOwnProperty(i)) {
        item[fields[i]] = item[i]
      }
      delete item[i] // 删除原先的对象属性
    }
  })
  let sheetName = filename
  let wb = XLSX.utils.book_new() // 工作簿对象包含一SheetNames数组，以及一个表对象映射表名称到表对象。XLSX.utils.book_new实用函数创建一个新的工作簿对象。
  let _fields = Object.keys(fields).map(key => fields[key])
  let ws = XLSX.utils.json_to_sheet(json, { header: _fields }) // 将js对象数组转换为工作表
  wb.SheetNames.push(sheetName)
  wb.Sheets[sheetName] = ws
  const defaultCellStyle = { font: { name: 'Verdana', sz: 33, color: 'FF00FF88' }, fill: { fgColor: { rgb: 'FFFFAA00' } } }// 设置表格的样式
  let wopts = { bookType: 'xlsx', bookSST: false, type: 'binary', cellStyles: true, defaultCellStyle: defaultCellStyle, showGridLines: false } // 写入的样式
  let wbout = XLSX.write(wb, wopts)
  let blob = new Blob([s2ab(wbout)], { type: '' })
  fs.saveAs(blob, filename + '.xlsx')
}
function s2ab (s) {
  if (typeof ArrayBuffer !== 'undefined') {
    let buf = new ArrayBuffer(s.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
    return buf
  } else {
    let buf = new Array(s.length)
    for (let i = 0; i !== s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF
    return buf
  }
}