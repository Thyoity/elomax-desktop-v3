//! Single source of truth for the channel names that the Rust backend emits
//! to the frontend. The TypeScript counterpart lives at `src/plugins/channels.ts`
//! and must be kept in sync. Centralizing the strings here prevents the
//! typos-that-silently-break-the-app failure mode of magic literals.

/// Emitted on successful LCU handshake AND on disconnect (with `success: false`).
pub const LOL_CONNECT: &str = "lol-connect";

/// Emitted right after the WebSocket subscribes — full summoner + ranked snapshot.
pub const LOL_ACCOUNT_DATA: &str = "lol-account-data";

/// Filtered ready-check event (only fired once per match found, with the initial timer).
pub const LOL_READY_CHECK: &str = "lol-ready-check";

/// Async response to a `lol_get_request` invocation.
pub const LOL_GET_REQUEST: &str = "lol-get-request";

/// Human-readable error pushed to the UI for connection/auth issues.
pub const LOL_ERROR: &str = "lol-error";
