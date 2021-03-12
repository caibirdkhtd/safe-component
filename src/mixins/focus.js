export default function(ref) {
  return {
    methods: {
      focus() {
        if (this.$refs[ref]) {
          this.$refs[ref].focus()
        }
      }
    }
  }
}
