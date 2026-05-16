use once_cell::sync::Lazy;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, WindowEvent};

mod channels;
mod lcu;

/// Connection state shared between the Tauri command handlers and the
/// long-lived WebSocket worker.
#[derive(Default)]
pub struct LcuState {
    pub password: Option<String>,
    pub port: Option<u16>,
    pub connected: bool,
    /// Handle to the WebSocket worker task. Aborted on forced reconnect so we
    /// never run two workers at once.
    pub ws_task: Option<tokio::task::JoinHandle<()>>,
}

// `parking_lot::Mutex` is used (instead of `std::sync::Mutex`) because:
//   - it can't be poisoned (no `.unwrap()` boilerplate everywhere)
//   - the lock is never held across `.await`, so the non-fair scheduling is fine
pub static LCU_STATE: Lazy<Mutex<LcuState>> = Lazy::new(|| Mutex::new(LcuState::default()));

#[derive(Serialize, Deserialize, Clone)]
pub struct LolConnectionData {
    pub password: String,
    pub port: u16,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LolConnectEvent {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub connection_data: Option<LolConnectionData>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
}

// --- Tauri commands ----------------------------------------------------

#[tauri::command]
async fn lol_connect(app: AppHandle, path: Option<String>) -> Result<(), String> {
    lcu::connect(app, path).await
}

#[tauri::command]
async fn lol_accept_ready_check() -> Result<(), String> {
    lcu::accept_ready_check().await
}

#[tauri::command]
async fn lol_get_request(app: AppHandle, path: String) -> Result<(), String> {
    lcu::get_request(app, path).await
}

#[tauri::command]
async fn lol_gather_account_data(app: AppHandle) -> Result<(), String> {
    lcu::gather_account_data(app).await
}

#[tauri::command]
fn flash_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window
            .request_user_attention(Some(tauri::UserAttentionType::Informational))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Cleanly removes the tray icon and then relaunches the app. Called by the
/// updater flow right before the new binary takes over — relying only on the
/// default `relaunch()` left a ghost tray icon behind because the process was
/// torn down too fast for `TrayIcon`'s Drop (which invokes Windows's
/// `Shell_NotifyIcon NIM_DELETE`) to run.
#[tauri::command]
fn cleanup_and_relaunch(app: AppHandle) -> Result<(), String> {
    // Explicitly remove the tray icon we registered in `setup`. `remove_by_id`
    // is the public API equivalent of dropping the handle — it triggers the
    // NIM_DELETE on Windows synchronously, so the icon is gone from the shell
    // tray before we spawn the new process.
    let _ = app.remove_tray_by_id("main");
    app.restart();
}

/// Shows the main window if it's hidden and focuses it.
fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // single-instance MUST be first: it short-circuits the second
        // process before any other plugin gets to allocate handles or
        // touch the filesystem. The callback runs inside the *original*
        // instance and is what we use to focus/raise its window.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app);
        }))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            lol_connect,
            lol_accept_ready_check,
            lol_get_request,
            lol_gather_account_data,
            flash_window,
            cleanup_and_relaunch,
        ])
        .setup(|app| {
            // System tray: clicking the main window's close button hides it
            // to tray; the user explicitly quits via the tray menu.
            let show_item = MenuItem::with_id(app, "show", "Mostrar", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            // Load the tray icon at its target size so Windows doesn't have to
            // downscale a 512px window icon to 16px — that's what made the tray
            // glyph look tiny.
            let tray_icon = tauri::image::Image::from_bytes(include_bytes!(
                "../icons/32x32.png"
            ))?;

            let _tray = TrayIconBuilder::with_id("main")
                .icon(tray_icon)
                .tooltip("ELOMAX")
                .menu(&menu)
                // Right-click menu actions.
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_main_window(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                // Left-click on the tray icon brings the window back.
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray.app_handle());
                    }
                })
                .build(app)?;

            // Filesystem watcher for the LoL lockfile — replaces the
            // renderer's 5-second polling. Sees create/delete events from
            // the OS as soon as they happen, so we react to LoL opening
            // or closing without any idle CPU cost.
            lcu::start_lockfile_watcher(app.handle().clone());

            Ok(())
        })
        // Intercept the main window's close button: hide instead of exit, so
        // the app keeps running in the tray.
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
