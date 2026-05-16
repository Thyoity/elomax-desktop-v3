/**
 * Tiny app-wide event emitter, exposed as `this.$bus`. Replaces the Vue 2
 * `this.$root.$emit/$on/$off` pattern that the legacy code relied on.
 *
 * Usage:
 *   this.$bus.on('reload-services', handler)
 *   this.$bus.off('reload-services', handler)
 *   this.$bus.emit('reload-services')
 */
import type { App } from 'vue'

type EventHandler = (...args: any[]) => void

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>()

  on(event: string, handler: EventHandler): void {
    let set = this.handlers.get(event)
    if (!set) {
      set = new Set()
      this.handlers.set(event, set)
    }
    set.add(handler)
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler)
  }

  emit(event: string, ...args: any[]): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const handler of [...set]) handler(...args)
  }
}

export const eventBus = new EventBus()

export default {
  install(app: App) {
    app.config.globalProperties.$bus = eventBus
  },
}
