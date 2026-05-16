import type { App } from 'vue'
import { bridge, electronCompat } from './bridge'

export default {
  install(app: App) {
    app.config.globalProperties.$bridge = bridge
    app.config.globalProperties.$electron = electronCompat
  },
}
