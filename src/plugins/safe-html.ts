import type { App, Directive } from 'vue'
import DOMPurify from 'dompurify'

/**
 * Drop-in safer replacement for `v-html`.
 *
 * Sanitizes the bound value with DOMPurify before injecting it as innerHTML,
 * stripping `<script>` tags, inline event handlers, javascript: URLs, etc.
 *
 * Usage: `<p v-safe-html="userContent" />` instead of `v-html="userContent"`.
 */
const sanitize = (raw: unknown): string => {
  if (raw === null || raw === undefined) return ''
  return DOMPurify.sanitize(String(raw))
}

const safeHtml: Directive<HTMLElement, unknown> = {
  mounted(el, binding) {
    el.innerHTML = sanitize(binding.value)
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    el.innerHTML = sanitize(binding.value)
  },
}

export default {
  install(app: App) {
    app.directive('safe-html', safeHtml)
  },
}

export { sanitize }
