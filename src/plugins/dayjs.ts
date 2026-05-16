/**
 * One-time dayjs configuration: pt-br locale + the plugins the app uses.
 * Importing this file (which `main.ts` does on startup) is enough — every
 * `import dayjs from 'dayjs'` elsewhere shares the configured singleton.
 *
 * Also installs `$dayjs` as a global property for Options-API templates that
 * need to format dates inline.
 */
import type { App } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(customParseFormat)
dayjs.locale('pt-br')

export default {
  install(app: App) {
    app.config.globalProperties.$dayjs = dayjs
  },
}
