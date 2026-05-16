import Pusher, { type Channel, type Options as PusherOptions } from 'pusher-js'
import type { App } from 'vue'

import { pusherSystemEvents } from '@/config/pusher-channels'

/**
 * Thin wrapper around `pusher-js` exposed as `this.$pusher`. Keeps a single
 * connection alive for the app and centralizes error handling for
 * subscription failures (which `pusher-js` otherwise swallows silently).
 */
export class PusherClient {
  pusher: Pusher | null = null

  initialize(key: string, options: PusherOptions): void {
    if (this.pusher) return
    if (!key) {
      console.error('[pusher] missing key — connection will not be established')
      return
    }
    this.pusher = new Pusher(key, options)
    this.pusher.connection.bind('error', (err: unknown) => {
      console.error('[pusher] connection error:', err)
    })
  }

  reinitialize(key: string, options: PusherOptions): void {
    if (this.pusher) {
      this.pusher.disconnect()
      this.pusher = null
    }
    this.initialize(key, options)
  }

  destroy(): void {
    if (this.pusher) {
      this.pusher.disconnect()
      this.pusher = null
    }
  }

  /**
   * Subscribes to a channel, returning the underlying pusher-js channel.
   *
   * - Throws if called before `initialize()` — silently hanging (the old
   *   behavior) made stuck-mounting components effectively undiagnosable.
   * - Auto-binds `pusher:subscription_error` so auth/permission failures
   *   surface in the console instead of being swallowed.
   * - Subscribing twice to the same channel is a no-op; the existing channel
   *   instance is returned (pusher-js already handles idempotency, we just
   *   avoid duplicate error-bindings on top).
   */
  subscribe(channelName: string): Channel {
    if (!this.pusher) {
      throw new Error(
        `[pusher] cannot subscribe to "${channelName}" — client is not initialized yet`,
      )
    }
    const alreadySubscribed = this.pusher.channel(channelName)
    if (alreadySubscribed) return alreadySubscribed

    const channel = this.pusher.subscribe(channelName)
    channel.bind(pusherSystemEvents.subscriptionError, (status: unknown) => {
      console.error(`[pusher] subscription error on "${channelName}":`, status)
    })
    return channel
  }

  unsubscribe(channelName: string): void {
    this.pusher?.unsubscribe(channelName)
  }
}

export const pusherClient = new PusherClient()

export default {
  install(app: App) {
    app.config.globalProperties.$pusher = pusherClient
  },
}
