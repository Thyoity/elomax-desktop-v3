/**
 * Single source of truth for the channel names that the Rust backend emits.
 * Mirrors `src-tauri/src/channels.rs` — keep both files in sync.
 */

export const LCU_CHANNELS = {
  connect: 'lol-connect',
  accountData: 'lol-account-data',
  readyCheck: 'lol-ready-check',
  getRequest: 'lol-get-request',
  error: 'lol-error',
} as const

/** Tauri commands invoked from the frontend. */
export const LCU_COMMANDS = {
  connect: 'lol_connect',
  acceptReadyCheck: 'lol_accept_ready_check',
  getRequest: 'lol_get_request',
  gatherAccountData: 'lol_gather_account_data',
  flashWindow: 'flash_window',
} as const

/** Synthetic events fired by the bridge itself (no Rust counterpart). */
export const SYNTHETIC_CHANNELS = {
  devModeSignal: 'dev-mode-signal',
  checkingForUpdate: 'checking-for-update',
  updateAvailable: 'update-available',
  updateNotAvailable: 'update-not-available',
  updateDownloadProgress: 'update-download-progress',
  updateDownloaded: 'update-downloaded',
  updateError: 'update-error',
} as const
