import { createBEM } from '../utils/index'
export default function (name) {
  return {
    data () {
      return {
        bem: null
      }
    },
    created () {
      this.bem = createBEM(name)
    },
  }
}
