use std::path::PathBuf;
use std::time::Duration;

use base64::Engine as _;
use base64::engine::general_purpose::STANDARD as BASE64;
use futures_util::{SinkExt, StreamExt};
use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use reqwest::Client;
use serde_json::Value;
use tauri::{AppHandle, Emitter};
use tokio::time::timeout;
use tokio_tungstenite::tungstenite::client::IntoClientRequest;
use tokio_tungstenite::tungstenite::http::header::AUTHORIZATION;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::Connector;

use crate::channels;
use crate::{LolConnectEvent, LolConnectionData, LCU_STATE};

// --- Tunables -----------------------------------------------------------

const WS_CONNECT_TIMEOUT: Duration = Duration::from_secs(5);
const HTTP_TIMEOUT: Duration = Duration::from_secs(10);

// --- Internal types -----------------------------------------------------

#[derive(Debug)]
enum LockfileError {
    /// Lockfile missing — LCU is not running, or path is wrong.
    Missing,
    /// Lockfile present but format is unexpected.
    Malformed,
}

#[derive(Debug, Clone)]
struct LockfileContents {
    port: u16,
    password: String,
}

// --- Lockfile helpers ---------------------------------------------------

fn lockfile_path(custom: Option<String>) -> PathBuf {
    if let Some(p) = custom {
        if cfg!(target_os = "macos") {
            PathBuf::from(p).join("Contents/LoL/lockfile")
        } else {
            PathBuf::from(p).join("lockfile")
        }
    } else if cfg!(target_os = "macos") {
        PathBuf::from("/Applications/League of Legends.app/Contents/LoL/lockfile")
    } else {
        PathBuf::from(r"C:\Riot Games\League of Legends\lockfile")
    }
}

fn read_lockfile(path: &PathBuf) -> Result<LockfileContents, LockfileError> {
    let contents = std::fs::read_to_string(path).map_err(|_| LockfileError::Missing)?;
    let parts: Vec<&str> = contents.split(':').collect();
    if parts.len() < 4 {
        return Err(LockfileError::Malformed);
    }
    let port: u16 = parts[2].parse().map_err(|_| LockfileError::Malformed)?;
    Ok(LockfileContents {
        port,
        password: parts[3].to_string(),
    })
}

// --- HTTP / WS helpers --------------------------------------------------

/// Builds a reqwest client that trusts the LCU's self-signed certificate.
fn permissive_client() -> Result<Client, String> {
    Client::builder()
        .danger_accept_invalid_certs(true)
        .timeout(HTTP_TIMEOUT)
        .build()
        .map_err(|e| e.to_string())
}

fn basic_auth_header(password: &str) -> String {
    let raw = format!("riot:{}", password);
    format!("Basic {}", BASE64.encode(raw.as_bytes()))
}

// --- Event emission helpers --------------------------------------------

fn emit_connect_failure(app: &AppHandle, message: &str) {
    let _ = app.emit(
        channels::LOL_CONNECT,
        LolConnectEvent {
            success: false,
            message: Some(message.into()),
            connection_data: None,
            data: None,
        },
    );
}

fn emit_connect_success(app: &AppHandle, port: u16, password: &str, summoner_data: Value) {
    let _ = app.emit(
        channels::LOL_CONNECT,
        LolConnectEvent {
            success: true,
            message: None,
            connection_data: Some(LolConnectionData {
                password: password.into(),
                port,
            }),
            data: Some(summoner_data),
        },
    );
}

fn emit_error(app: &AppHandle, message: impl Into<String>) {
    let _ = app.emit(channels::LOL_ERROR, message.into());
}

// --- Summoner + ranked snapshot ----------------------------------------

/// Fetches the current summoner + ranked stats from the LCU and emits a
/// `lol-account-data` event. Idempotent — safe to call on demand.
async fn fetch_and_emit_account_data(
    app: &AppHandle,
    client: &Client,
    port: u16,
    password: &str,
) -> Result<(), String> {
    let summoner_url = format!(
        "https://127.0.0.1:{}/lol-summoner/v1/current-summoner",
        port
    );
    let ranked_url = format!(
        "https://127.0.0.1:{}/lol-ranked/v1/current-ranked-stats",
        port
    );

    let summoner_data = client
        .get(&summoner_url)
        .basic_auth("riot", Some(password))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    let ranked_data = client
        .get(&ranked_url)
        .basic_auth("riot", Some(password))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;

    let _ = app.emit(
        channels::LOL_ACCOUNT_DATA,
        serde_json::json!([summoner_data, [ranked_data]]),
    );
    Ok(())
}

// --- Public entry: connect to LCU --------------------------------------

pub async fn connect(app: AppHandle, path: Option<String>) -> Result<(), String> {
    let lockfile = lockfile_path(path);

    let lock = match read_lockfile(&lockfile) {
        Ok(l) => l,
        Err(LockfileError::Missing) => {
            emit_connect_failure(&app, "League of Legends não encontrado.");
            return Ok(());
        }
        Err(LockfileError::Malformed) => {
            emit_connect_failure(&app, "League of Legends está fechado.");
            return Ok(());
        }
    };

    // Stale-connection guard: if the cached port/password still match the
    // lockfile AND we believe we're connected, skip the full reconnect.
    // But still re-emit the cached summoner snapshot so a renderer that
    // just mounted and missed the original emit can update its UI.
    {
        let state = LCU_STATE.lock();
        if state.connected
            && state.port == Some(lock.port)
            && state.password.as_deref() == Some(&lock.password)
        {
            let cached = state.summoner_data.clone();
            drop(state);
            if let Some(data) = cached {
                emit_connect_success(&app, lock.port, &lock.password, data);
            }
            return Ok(());
        }
    }

    // Abort any previous WS task before starting a new one — prevents two
    // workers running concurrently after a forced reconnect.
    {
        let mut state = LCU_STATE.lock();
        if let Some(handle) = state.ws_task.take() {
            handle.abort();
        }
        // Reset connected flag — will be flipped to `true` only after the WS
        // handshake succeeds.
        state.connected = false;
        state.password = None;
        state.port = None;
        state.summoner_data = None;
    }

    let client = permissive_client()?;

    // Fetch the summoner snapshot before subscribing to the WS firehose.
    // If the LCU isn't fully logged in yet (state != SUCCEEDED), the WS will
    // eventually emit the current-summoner event when login completes — but
    // we ALSO push lol-connect: success right now if we can, so the UI updates
    // immediately.
    let session_url = format!("https://127.0.0.1:{}/lol-login/v1/session", lock.port);
    if let Ok(resp) = client
        .get(&session_url)
        .basic_auth("riot", Some(&lock.password))
        .send()
        .await
    {
        if let Ok(session) = resp.json::<Value>().await {
            let state_val = session.get("state").and_then(|v| v.as_str()).unwrap_or("");
            if state_val == "SUCCEEDED" && session.get("summonerId").is_some() {
                if let Ok(summoner) = client
                    .get(&format!(
                        "https://127.0.0.1:{}/lol-summoner/v1/current-summoner",
                        lock.port
                    ))
                    .basic_auth("riot", Some(&lock.password))
                    .send()
                    .await
                {
                    if let Ok(data) = summoner.json::<Value>().await {
                        emit_connect_success(&app, lock.port, &lock.password, data.clone());
                        LCU_STATE.lock().summoner_data = Some(data.clone());
                        // Best-effort ranked snapshot.
                        if let Err(msg) =
                            fetch_and_emit_account_data(&app, &client, lock.port, &lock.password)
                                .await
                        {
                            emit_error(
                                &app,
                                format!("Houve um erro ao importar dados ranqueados: {msg}"),
                            );
                        }
                    }
                }
            }
        }
    }

    // Spawn the long-lived WebSocket worker and track its handle in state.
    // The connect-timeout lives INSIDE `run_ws`, around the handshake only —
    // not around the whole task, because the message loop is intentionally
    // long-lived and any outer timeout would cancel it mid-operation (the
    // exact bug that caused isLoLAuthenticated to oscillate every ~5s).
    let app_for_ws = app.clone();
    let password_for_ws = lock.password.clone();
    let port_for_ws = lock.port;
    let handle = tokio::spawn(async move {
        match run_ws(app_for_ws.clone(), port_for_ws, password_for_ws.clone()).await {
            Ok(()) => {
                // WS exited cleanly (LoL closed). Notify the UI.
                let _ = app_for_ws.emit(
                    channels::LOL_CONNECT,
                    LolConnectEvent {
                        success: false,
                        message: Some("LoL fechou.".into()),
                        connection_data: None,
                        data: None,
                    },
                );
            }
            Err(err) => {
                emit_error(&app_for_ws, format!("Erro de conexão LCU: {err}"));
                emit_connect_failure(&app_for_ws, "Falha ao conectar com o LoL.");
            }
        }
        // Whatever the exit reason, mark ourselves disconnected.
        let mut state = LCU_STATE.lock();
        state.connected = false;
        state.password = None;
        state.port = None;
        state.ws_task = None;
    });

    {
        let mut state = LCU_STATE.lock();
        state.password = Some(lock.password);
        state.port = Some(lock.port);
        state.connected = true;
        state.ws_task = Some(handle);
    }

    Ok(())
}

// --- WebSocket worker --------------------------------------------------

async fn run_ws(app: AppHandle, port: u16, password: String) -> Result<(), String> {
    let url = format!("wss://127.0.0.1:{}/", port);
    let mut request = url.into_client_request().map_err(|e| e.to_string())?;
    request
        .headers_mut()
        .insert(AUTHORIZATION, basic_auth_header(&password).parse().unwrap());

    let tls_connector = native_tls::TlsConnector::builder()
        .danger_accept_invalid_certs(true)
        .danger_accept_invalid_hostnames(true)
        .build()
        .map_err(|e| e.to_string())?;
    let connector = Connector::NativeTls(tls_connector);

    // Timeout the handshake only — once connected, the message loop below is
    // long-lived and must not be wrapped in a timeout.
    let (ws_stream, _) = timeout(
        WS_CONNECT_TIMEOUT,
        tokio_tungstenite::connect_async_tls_with_config(request, None, false, Some(connector)),
    )
    .await
    .map_err(|_| "Tempo esgotado conectando ao LoL (5s).".to_string())?
    .map_err(|e| e.to_string())?;

    let (mut write, mut read) = ws_stream.split();
    write
        .send(Message::Text("[5,\"OnJsonApiEvent\"]".into()))
        .await
        .map_err(|e| e.to_string())?;

    while let Some(msg) = read.next().await {
        let msg = match msg {
            Ok(m) => m,
            Err(_) => break,
        };
        let text = match msg {
            Message::Text(t) => t,
            Message::Close(_) => break,
            _ => continue,
        };
        if text.is_empty() {
            continue;
        }
        let parsed: Value = match serde_json::from_str(&text) {
            Ok(v) => v,
            Err(_) => continue,
        };
        let arr = match parsed.as_array() {
            Some(a) => a,
            None => continue,
        };
        if arr.len() < 3 {
            continue;
        }
        let to_emit = &arr[2];
        let uri = to_emit.get("uri").and_then(|v| v.as_str()).unwrap_or("");

        // Only forward events we actually consume. The legacy `lol-event`
        // firehose was an unused no-op on the frontend; keeping it would just
        // burn CPU serializing every single LCU event.
        if uri == "/lol-summoner/v1/current-summoner" {
            // The WS event payload is shaped `{ uri, eventType, data: <summoner> }`.
            // We emit ONLY the inner `data` so the frontend gets the same
            // shape as the initial HTTP-fetched snapshot (i.e. summoner fields
            // at the top level: `gameName`, `displayName`, `summonerLevel`, …).
            let summoner = to_emit.get("data").cloned().unwrap_or(Value::Null);
            emit_connect_success(&app, port, &password, summoner.clone());
            // Refresh the cache so a stale-but-matching `connect()` call from
            // the renderer's heartbeat can still re-emit current data.
            LCU_STATE.lock().summoner_data = Some(summoner);
        } else if uri == "/lol-matchmaking/v1/ready-check" {
            let data = to_emit.get("data").cloned().unwrap_or(Value::Null);
            let player_response = data
                .get("playerResponse")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let state_val = data.get("state").and_then(|v| v.as_str()).unwrap_or("");
            let timer = data.get("timer").and_then(|v| v.as_f64()).unwrap_or(0.0);
            // Fire only once per match — when the ready-check first appears.
            if player_response == "None"
                && state_val == "InProgress"
                && (timer - 5.0).abs() < 0.5
            {
                let _ = app.emit(channels::LOL_READY_CHECK, to_emit.clone());
            }
        }
    }
    Ok(())
}

// --- Other public commands ---------------------------------------------

pub async fn accept_ready_check() -> Result<(), String> {
    let creds = LCU_STATE.lock().credentials();
    let Some((password, port)) = creds else {
        return Ok(());
    };
    let client = permissive_client()?;
    let url = format!(
        "https://127.0.0.1:{}/lol-matchmaking/v1/ready-check/accept",
        port
    );
    let _ = client
        .post(&url)
        .basic_auth("riot", Some(&password))
        .json(&serde_json::json!({}))
        .send()
        .await;
    Ok(())
}

pub async fn get_request(app: AppHandle, path: String) -> Result<(), String> {
    let creds = LCU_STATE.lock().credentials();
    let Some((password, port)) = creds else {
        let _ = app.emit(
            channels::LOL_GET_REQUEST,
            serde_json::json!({
                "error": "LCU não está conectado.",
                "response": null,
                "body": null,
            }),
        );
        return Ok(());
    };
    let client = permissive_client()?;
    let url = format!("https://127.0.0.1:{}{}", port, path);
    match client
        .get(&url)
        .basic_auth("riot", Some(&password))
        .send()
        .await
    {
        Ok(resp) => {
            let status = resp.status().as_u16();
            let body = resp.json::<Value>().await.ok();
            let _ = app.emit(
                channels::LOL_GET_REQUEST,
                serde_json::json!({
                    "error": null,
                    // `response.req.path` mirrors the shape the legacy frontend
                    // expects from the Electron version of this bridge.
                    "response": { "statusCode": status, "req": { "path": &path } },
                    "body": body,
                }),
            );
        }
        Err(err) => {
            let _ = app.emit(
                channels::LOL_GET_REQUEST,
                serde_json::json!({
                    "error": err.to_string(),
                    "response": null,
                    "body": null,
                }),
            );
        }
    }
    Ok(())
}

/// Forces a one-off summoner + ranked snapshot. Used when the frontend wants
/// to refresh account data without waiting for a WebSocket event.
pub async fn gather_account_data(app: AppHandle) -> Result<(), String> {
    let creds = LCU_STATE.lock().credentials();
    let Some((password, port)) = creds else {
        emit_error(&app, "LCU não está conectado.");
        return Ok(());
    };
    let client = permissive_client()?;
    if let Err(msg) = fetch_and_emit_account_data(&app, &client, port, &password).await {
        emit_error(&app, format!("Falha ao importar conta: {msg}"));
    }
    Ok(())
}

// --- Lockfile watcher --------------------------------------------------

/// Spawns a long-lived task that watches the LoL lockfile via the OS-native
/// filesystem-events API (ReadDirectoryChangesW on Windows, FSEvents on macOS,
/// inotify on Linux). When the lockfile appears, we connect. When it
/// disappears, we tear the connection down. This replaces the renderer's
/// previous 5s polling — same observable behaviour, ~zero idle cost.
///
/// Caveats handled here:
///   * The lockfile's parent dir might not exist yet (League not installed).
///     We retry every 30s in that case so we eventually pick up an install.
///   * fs-event APIs can occasionally miss events. The frontend keeps a 30s
///     defensive heartbeat (`lolConnectionInterval` in App.vue) as a safety
///     net. That heartbeat is also how users with a custom `lolPath` get
///     reconciled, since this watcher only watches the default install path.
///   * If the watcher itself errors out, the outer loop restarts it after a
///     short backoff.
pub fn start_lockfile_watcher(app: AppHandle) {
    // `tauri::async_runtime::spawn` instead of `tokio::spawn` because this is
    // called from the Builder::setup closure, which runs on the main thread
    // before any tokio runtime context is entered there. Tauri exposes its
    // own (tokio-backed) runtime for exactly this kind of bootstrap task —
    // calling tokio::spawn directly here panics with "there is no reactor
    // running, must be called from the context of a Tokio 1.x runtime".
    tauri::async_runtime::spawn(watcher_loop(app));
}

async fn watcher_loop(app: AppHandle) {
    let lockfile = lockfile_path(None);
    let parent = match lockfile.parent() {
        Some(p) => p.to_path_buf(),
        None => return,
    };

    // Snapshot state once before the watcher is up so launches where LoL is
    // already running don't have to wait for the first heartbeat.
    sync_lockfile_state(&app, &lockfile).await;

    loop {
        let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<notify::Result<Event>>();
        let watcher: notify::Result<RecommendedWatcher> = RecommendedWatcher::new(
            move |res| {
                let _ = tx.send(res);
            },
            Config::default(),
        );

        let mut watcher = match watcher {
            Ok(w) => w,
            Err(_) => {
                tokio::time::sleep(Duration::from_secs(30)).await;
                continue;
            }
        };

        if watcher.watch(&parent, RecursiveMode::NonRecursive).is_err() {
            // Parent missing (no install at default path). The frontend's
            // 30s heartbeat will still trigger connect attempts if the user
            // configured a custom path elsewhere.
            tokio::time::sleep(Duration::from_secs(30)).await;
            continue;
        }

        // Re-sync once the watcher is established, in case the lockfile
        // appeared during the gap between the snapshot above and now.
        sync_lockfile_state(&app, &lockfile).await;

        while let Some(res) = rx.recv().await {
            match res {
                Ok(event) => {
                    if event.paths.iter().any(|p| p.ends_with("lockfile")) {
                        sync_lockfile_state(&app, &lockfile).await;
                    }
                }
                Err(_) => break,
            }
        }

        // The watcher's send half dropped (error or external shutdown).
        // Brief pause then rebuild — keeps us resilient to transient
        // failures (LoL folder moved/recreated, permissions blip, etc.).
        tokio::time::sleep(Duration::from_secs(5)).await;
    }
}

/// Reconciles in-memory LCU state with what the lockfile says on disk.
/// Idempotent: calling it repeatedly with the same disk state is a no-op.
async fn sync_lockfile_state(app: &AppHandle, lockfile: &PathBuf) {
    if lockfile.exists() {
        // `connect()` is itself idempotent (stale-credential guard at the top
        // returns early when already connected with the same port/password).
        let _ = connect(app.clone(), None).await;
        return;
    }

    // Lockfile gone — tear down any active connection so the renderer doesn't
    // sit on a stale "connected" state. Doing this explicitly (vs. relying on
    // the WS task to notice the socket close) makes the transition snappy and
    // deterministic.
    let was_connected = {
        let mut state = LCU_STATE.lock();
        let was = state.connected;
        if let Some(handle) = state.ws_task.take() {
            handle.abort();
        }
        state.connected = false;
        state.password = None;
        state.port = None;
        state.summoner_data = None;
        was
    };

    if was_connected {
        let _ = app.emit(
            channels::LOL_CONNECT,
            LolConnectEvent {
                success: false,
                message: Some("LoL fechou.".into()),
                connection_data: None,
                data: None,
            },
        );
    }
}

// --- Extension trait on the global state -------------------------------

trait LcuStateExt {
    fn credentials(&self) -> Option<(String, u16)>;
}

impl LcuStateExt for parking_lot::MutexGuard<'_, crate::LcuState> {
    fn credentials(&self) -> Option<(String, u16)> {
        match (self.password.clone(), self.port) {
            (Some(p), Some(prt)) => Some((p, prt)),
            _ => None,
        }
    }
}
