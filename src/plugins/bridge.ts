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

// Held between `ready-for-update-check` (which downloads) and `install-update`
// (which installs + relaunches) so the user-confirmed install step has access
// to the same Update handle the download was performed on. Only one update
// can be pending at a time — newer checks overwrite this reference.
let pendingUpdate: { install: () => Promise<void> } | null = null

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
    // Auto-update flow via `@tauri-apps/plugin-updater`, mapped onto the
    // legacy synthetic event channels so the existing UI in App.vue works:
    //   - `checking-for-update`         emitted while `check()` is running
    //   - `update-not-available`        no newer version, or browser-only run
    //   - `update-available`            new version found; download starting
    //   - `update-download-progress`    chunk arrived (bytes transferred/total)
    //   - `update-downloaded`           download finished, ready to install
    //   - `update-error`                any failure — UI should not block the user
    //
    // IMPORTANT: download() and install() are deliberately split. Calling
    // downloadAndInstall() runs the NSIS installer as soon as the bytes
    // arrive, and NSIS force-kills the running process during install —
    // so an auto-check in the background would look like a silent crash
    // to the user. By stopping after download, we hold the new bundle in
    // memory until the user explicitly clicks "Reiniciar e instalar",
    // and only then dispatch `install-update` (below) to run the install
    // + relaunch. The UI shows a graceful "Ready" state in between.
    if (!isTauriRuntime) {
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
        await update.download((event) => {
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

        // Hold the Update handle alive until `install-update` fires so we
        // can run the install + relaunch in response to a user click.
        // Stored on a module-scope variable rather than passing through
        // the bridge for simplicity — only one update can be pending at
        // a time anyway.
        pendingUpdate = update
      } catch (err) {
        bridge.emitSynthetic(SYNTHETIC_CHANNELS.updateError, {
          message: err instanceof Error ? err.message : String(err),
        })
        bridge.emitSynthetic(SYNTHETIC_CHANNELS.updateNotAvailable, null)
      }
    })()
  },
  'install-update': () => {
    // Runs the NSIS installer for the bundle we downloaded earlier and then
    // restarts the app on the new binary. NSIS will force-kill the running
    // process partway through install, so we explicitly remove the tray
    // icon first (via the Rust `cleanup_and_relaunch` command, which also
    // performs the restart in case NSIS doesn't auto-launch the new exe).
    if (!isTauriRuntime || !pendingUpdate) return
    void (async () => {
      try {
        await pendingUpdate.install()
      } catch {
        // If install() throws, fall through to cleanup_and_relaunch anyway
        // so we don't end up stuck on a frozen "ready" screen.
      }
      void invoke('cleanup_and_relaunch').catch(() => undefined)
    })()
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
