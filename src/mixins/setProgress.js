export default {
  methods: {
    setProgress (v) {
      if (document.getElementById('progress-bar')) {
        document.getElementById('progress-bar').style.width = ((v || 0) * 100) + '%'
      }
    },
  }
}
