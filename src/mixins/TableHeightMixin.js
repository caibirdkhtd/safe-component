export default {
  data () {
    return {
      tableHeight: 300,
      diffHeight: 60
    }
  },
  mounted () {
    window.addEventListener(
      'resize', this.getTableHeight, false
    )
    this.getTableHeight()
  },
  destroyed () {
    window.removeEventListener('resize', this.getTableHeight)
  },
  methods: {
    getTableHeight () {
      this.$nextTick(() => {
        // console.log('this.$refs.content && this.$refs.content.offsetHeight', this.$refs.content && this.$refs.content.offsetHeight)
        this.tableHeight = this.$refs.content && this.$refs.content.offsetHeight - this.diffHeight
      })
    }
  }
}
