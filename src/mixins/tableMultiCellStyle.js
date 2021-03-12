/**
 * el-table： centerIndexArr: 需要局中的列的序列号
 * getHeaderCellStyle(), headerCell
 * getCellStyle(), bodyCell
 * */
export default function (centerIndexArr) {
  return {
    methods: {
      getHeaderCellStyle ({ columnIndex }) {
        const isCenter = centerIndexArr.indexOf(columnIndex) > -1
        return {
          'text-align': isCenter ? 'center' : 'left',
          'font-size': '14px',
          'line-weight': 500
        }
      },
      getCellStyle ({ columnIndex }) {
        const isCenter = centerIndexArr.indexOf(columnIndex) > -1
        return {
          'text-align': isCenter ? 'center' : 'left'
        }
      }
    }
  }
}
