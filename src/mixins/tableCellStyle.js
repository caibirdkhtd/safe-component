/**
 * el-table： 第一列靠左，其余居中样式。
 * getHeaderCellStyle(), headerCell
 * getCellStyle(), bodyCell
 * */
export default {
  methods: {
    getHeaderCellStyle ({ columnIndex }) {
      return {
        'text-align': columnIndex ? 'center' : 'left',
        'font-size': '14px',
        'line-weight': 500
      }
    },
    getCellStyle ({ columnIndex }) {
      return {
        'text-align': columnIndex ? 'center' : 'left'
      }
    }
  }
}
