import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { open as openShell } from '@tauri-apps/plugin-shell'

import { gameLabel } from '@/config/games'
import { LCU_COMMANDS, SYNTHETIC_CHANNELS } from './channels'

export type BridgeHandler = (event: { sender?: unknown }, payload: any) => void

interface Subscription {
  unlisten: Promise<UnlistenFn>
  handler: BridgeHandler
}

/**
 * True when the renderer is hosted by Tauri (production or `tauri dev`).
 * False when running plain `vite` in a browser tab — all native calls are
 * silently no-oped so the UI still boots.
 */
const isTauriRuntime: boolean =
  typeof window !== 'undefined' &&
  (Boolean((window as any).__TAURI_INTERNALS__) || Boolean((window as any).__TAURI__))

const SYNTHETIC_SET: ReadonlySet<string> = new Set(Object.values(SYNTHETIC_CHANNELS))

const isSyntheticChannel = (channel: string): boolean => SYNTHETIC_SET.has(channel)

// Maps legacy `ipcRenderer.send(channel, arg)` calls to the right Tauri
// invocation. Kept as a table (instead of a switch) so adding new bridges is
// one entry rather than a new case.
type SendHandler = (arg: any, ctx: { bridge: Bridge }) => void

const SEND_HANDLERS: Record<string, SendHandler> = {
  'elomax-notification': () => {
    if (isTauriRuntime) void invoke(LCU_COMMANDS.flashWindow).catch(() => undefined)
  },
  'lol-accept-ready-check': () => {
    if (isTauriRuntime) void invoke(LCU_COMMANDS.acceptReadyCheck).catch(() => undefined)
  },
  'lol-get-request': (path) => {
    if (isTauriRuntime) void invoke(LCU_COMMANDS.getRequest, { path }).catch(() => undefined)
  },
  'lol-connect': (path) => {
    if (isTauriRuntime) {
      void invoke(LCU_COMMANDS.connect, { path: path ?? null }).catch(() => undefined)
    }
  },
  'lol-gather-account-data': () => {
    if (isTauriRuntime) void invoke(LCU_COMMANDS.gatherAccountData).catch(() => undefined)
  },
  'show-new-service-notification': (payload) => {
    // Native OS toast for "new service entered the queue" — fires alongside
    // the in-app sound and taskbar flash so the booster gets a visual cue
    // even when the app is in the background or behind another window.
    //
    // `silent: true` because the renderer already plays the per-game sound
    // the user configured. Otherwise the OS would layer its default toast
    // chime on top of our sound.
    if (!isTauriRuntime) return
    const game = (payload as { game?: string } | null | undefined)?.game
    const label = gameLabel(game)
    void (async () => {
      const { sendNotification, isPermissionGranted, requestPermission } = await import(
        '@tauri-apps/plugin-notification'
      )
      let granted = await isPermissionGranted()
      if (!granted) granted = (await requestPermission()) === 'granted'
      if (!granted) return
      sendNotification({
        title: 'Novo serviço na fila',
        body: `Um serviço de ${label} acabou de entrar na fila — aceite agora.`,
        silent: true,
      })
    })().catch(() => undefined)
  },
  'new-window': (url) => {
    if (typeof url !== 'string') return
    if (isTauriRuntime) {
      void openShell(url).catch(() => undefined)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  },
  'ready-for-update-check': (_arg, { bridge }) => {
    // Real auto-update flow via `@tauri-apps/plugin-updater`. We map the
    // promise-based plugin API onto the legacy synthetic event channels so
    // the existing UI in App.vue keeps working without changes:
    //   - `checking-for-update`         emitted while `check()` is running
    //   - `update-not-available`        no newer version, or browser-only run
    //   - `update-available`            new version found; download starting
    //   - `update-download-progress`    chunk arrived (percent / bytes)
    //   - `update-downloaded`           download + install finished, ready to relaunch
    //   - `update-error`                any failure — UI should not block the user
    if (!isTauriRuntime) {
      // Plain `vite dev` in a browser — pretend there's no update so the
      // updates screen dismisses immediately.
      setTimeout(() => bridge.emitSynthetic(SYNTHETIC_CHANNELS.updateNotAvailable, null), 0)
      return
    }
    void (async () => {
      bridge.emitSynthetic(SYNTHETIC_CHANNELS.checkingForUpdate, null)
      try {
        const { check } = await import('@tauri-apps/plugin-updater')
        const update = await check()
        if (!update) {
          bridge.emitSynthetic(SYNTHETIC_CHANNELS.updateNotAvailable, null)
          return
        }
        bridge.emitSynthetic(SYNTHETIC_CHANNELS.updateAvailable, {
          version: update.version,
          notes: update.body,
        })

        let contentLength = 0
        let downloaded = 0
        await update.downloadAndInstall((event) => {
          if (event.event === 'Started') {
            contentLength = event.data.contentLength ?? 0
            bridge.emitSynthetic(SYNTHETIC_CHANNELS.updateDownloadProgress, {
              transferred: 0,
              total: contentLength,
            })
          } else if (event.event === 'Progress') {
            downloaded += event.data.chunkLength
            bridge.emitSynthetic(SYNTHETIC_CHANNELS.updateDownloadProgress, {
              transferred: downloaded,
              total: contentLength,
            })
          } else if (event.event === 'Finished') {
            bridge.emitSynthetic(SYNTHETIC_CHANNELS.updateDownloaded, null)
          }
        })
      } catch (err) {
        bridge.emitSynthetic(SYNTHETIC_CHANNELS.updateError, {
          message: err instanceof Error ? err.message : String(err),
        })
        // Fall through to "not available" so the UI doesn't get stuck on the
        // updates screen when the updater fails for transient reasons (no
        // network, server down, etc.).
        bridge.emitSynthetic(SYNTHETIC_CHANNELS.updateNotAvailable, null)
      }
    })()
  },
  'install-update': () => {
    // `downloadAndInstall` above already installed the new binary; we just
    // need to relaunch the process so Windows picks it up.
    //
    // We invoke the custom `cleanup_and_relaunch` Tauri command instead of
    // plugin-process's `relaunch()`, because the latter exits the process
    // too fast for `TrayIcon`'s Drop impl to run — leaving a phantom icon
    // in the Windows shell tray that lives next to the new process's icon
    // until the user hovers over it. `cleanup_and_relaunch` explicitly
    // removes the tray (NIM_DELETE on Windows) before restarting.
    if (!isTauriRuntime) return
    void invoke('cleanup_and_relaunch').catch(() => undefined)
  },
}

class Bridge {
  private subs = new Map<string, Subscription[]>()
  private syntheticBus = new Map<string, BridgeHandler[]>()

  send(channel: string, arg?: any): void {
    const handler = SEND_HANDLERS[channel]
    if (!handler) {
      console.warn('[bridge] unhandled send channel:', channel)
      return
    }
    handler(arg, { bridge: this })
  }

  on(channel: string, handler: BridgeHandler): void {
    if (isSyntheticChannel(channel) || !isTauriRuntime) {
      // Outside Tauri (plain `vite dev` in a browser), we can only deliver
      // synthetic events. Native LCU / auto-update events simply never fire.
      const arr = this.syntheticBus.get(channel) ?? []
      arr.push(handler)
      this.syntheticBus.set(channel, arr)
      return
    }
    const unlisten = listen(channel, (event) => {
      handler({ sender: undefined }, event.payload)
    })
    const list = this.subs.get(channel) ?? []
    list.push({ unlisten, handler })
    this.subs.set(channel, list)
  }

  removeListener(channel: string, handler: BridgeHandler): void {
    if (isSyntheticChannel(channel) || !isTauriRuntime) {
      const arr = this.syntheticBus.get(channel)
      if (!arr) return
      const idx = arr.indexOf(handler)
      if (idx !== -1) arr.splice(idx, 1)
      return
    }
    const list = this.subs.get(channel)
    if (!list) return
    const idx = list.findIndex((s) => s.handler === handler)
    if (idx !== -1) {
      const [sub] = list.splice(idx, 1)
      sub.unlisten.then((un) => un()).catch(() => undefined)
    }
  }

  emitSynthetic(channel: string, payload: any): void {
    const arr = this.syntheticBus.get(channel)
    if (!arr) return
    for (const h of [...arr]) h({ sender: undefined }, payload)
  }
}

export const bridge = new Bridge()

export interface BridgeAPI {
  ipcRenderer: {
    send: (channel: string, arg?: any) => void
    on: (channel: string, handler: BridgeHandler) => void
    removeListener: (channel: string, handler: BridgeHandler) => void
  }
}

export const electronCompat: BridgeAPI = {
  ipcRenderer: {
    send: (channel, arg) => bridge.send(channel, arg),
    on: (channel, handler) => bridge.on(channel, handler),
    removeListener: (channel, handler) => bridge.removeListener(channel, handler),
  },
}
