import type { App } from 'vue'
import VueToast, { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-default.css'

interface LegacyToastOptions {
  position?: string
  timeout?: number
  duration?: number
}

function normalizeOpts(arg1?: string | LegacyToastOptions, arg2?: LegacyToastOptions): any {
  // Legacy izitoast signature: error(message, title, options) -> we drop title and forward options.
  const opts = typeof arg1 === 'string' ? arg2 : (arg1 as LegacyToastOptions | undefined)
  if (!opts) return {}
  const out: any = {}
  if (opts.position) {
    out.position = opts.position
      .replace('topCenter', 'top')
      .replace('topRight', 'top-right')
      .replace('topLeft', 'top-left')
      .replace('bottomCenter', 'bottom')
      .replace('bottomRight', 'bottom-right')
      .replace('bottomLeft', 'bottom-left')
  }
  if (opts.timeout !== undefined) out.duration = opts.timeout
  if (opts.duration !== undefined) out.duration = opts.duration
  return out
}

class LegacyToastAdapter {
  private inner = useToast({ duration: 5000 })

  show(message: string, _title?: string, options?: LegacyToastOptions) {
    this.inner.default(message, normalizeOpts(_title, options))
  }
  info(message: string, _title?: string, options?: LegacyToastOptions) {
    this.inner.info(message, normalizeOpts(_title, options))
  }
  success(message: string, _title?: string, options?: LegacyToastOptions) {
    this.inner.success(message, normalizeOpts(_title, options))
  }
  warning(message: string, _title?: string, options?: LegacyToastOptions) {
    this.inner.warning(message, normalizeOpts(_title, options))
  }
  error(message: string, _title?: string, options?: LegacyToastOptions) {
    this.inner.error(message, normalizeOpts(_title, options))
  }
}

export default {
  install(app: App) {
    app.use(VueToast, { position: 'top', duration: 5000 })
    const adapter = new LegacyToastAdapter()
    // `globalProperties` is typed as readonly for augmented members in
    // recent @vue/runtime-core; cast to assign at runtime (Vue itself does
    // the same internally — the readonly is a consumer-side marker).
    ;(app.config.globalProperties as any).$toast = adapter
  },
}
