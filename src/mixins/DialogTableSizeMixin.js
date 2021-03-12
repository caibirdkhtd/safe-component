export default {
  data() {
    return {
      tableHeight: 300,
      bodyHeight: 500,
      isShortScreen: false,
      isLowScreen: false
    }
  },
  mounted () {
    this.checkHeight()
    this.checkWeight()
  },
  methods: {
    checkHeight () {
      this.bodyHeight = document.body.clientHeight
      this.isLowScreen = document.body.clientHeight < 780
      this.tableHeight = this.isLowScreen ? 300 : 480
    },
    checkWeight () {
      this.isShortScreen = document.body.clientWidth < 1300
    }
  }
}
