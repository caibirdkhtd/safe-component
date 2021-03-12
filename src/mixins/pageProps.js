/**
 * pageSize: 每页显示数量，默认10
 * loadList: 刷新列表调用的方法
 * */
export default function (pageSize) {
  return {
    data () {
      return {
        hasNext: false,
        isLoading: true,
        pageIndex: 1,
        pageSize: pageSize || 10,
        records: []
      }
    },
    methods: {
      pageChange (tmp) {
        this.pageIndex = this.pageIndex + tmp
        if (this.loadList) {
          this.loadList(tmp)
        }
      },
      // 序号
      indexMethod (index) {
        index = index + 1
        if (this.pageIndex > 1) {
          return ((this.pageIndex - 1) * this.pageSize) + index
        } else {
          return index
        }
      }
    }
  }
}
