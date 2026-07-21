// SPDX-License-Identifier: MIT
// strata-app-builder CORS/proxy reference — Rust (axum + reqwest/rustls).
//
// Contract (see packages/core-map/src/engine/arcgisSource.ts):
//   GET /proxy/featureserver?url=<url-encoded ArcGIS REST URL>
//   -> fetches the target and streams the response back with permissive CORS headers.
//
// Security: host allowlist, GET-only (router), size cap, timeout, optional token injection.

use std::{collections::HashSet, env, sync::Arc, time::Duration};

use axum::{
    body::Body,
    extract::{Query, State},
    http::{HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use futures_util::StreamExt;
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone)]
struct Cfg {
    allowlist: Arc<HashSet<String>>,
    max_bytes: u64,
    timeout: Duration,
    token: Option<String>,
    client: reqwest::Client,
}

#[derive(serde::Deserialize)]
struct Q {
    url: Option<String>,
}

fn env_u64(key: &str, default: u64) -> u64 {
    env::var(key).ok().and_then(|v| v.parse().ok()).unwrap_or(default)
}

fn is_private(host: &str) -> bool {
    let h = host.to_ascii_lowercase();
    h == "::1"
        || h.starts_with("127.")
        || h.starts_with("10.")
        || h.starts_with("192.168.")
        || h.starts_with("169.254.")
        || h.starts_with("fc00:")
        || h.starts_with("fd00:")
        || (h.starts_with("172.")
            && h.split('.')
                .nth(1)
                .and_then(|o| o.parse::<u8>().ok())
                .map(|o| (16..=31).contains(&o))
                .unwrap_or(false))
}

async fn proxy(State(cfg): State<Cfg>, Query(q): Query<Q>) -> Response {
    let target = match q.url {
        Some(u) if !u.is_empty() => u,
        _ => return (StatusCode::BAD_REQUEST, "Missing ?url").into_response(),
    };

    let mut url = match reqwest::Url::parse(&target) {
        Ok(u) => u,
        Err(_) => return (StatusCode::BAD_REQUEST, "Bad target URL").into_response(),
    };
    if !matches!(url.scheme(), "http" | "https") {
        return (StatusCode::BAD_REQUEST, "Only http(s) targets allowed").into_response();
    }

    let host = url.host_str().unwrap_or("").to_ascii_lowercase();
    if is_private(&host) && !cfg.allowlist.contains(&host) {
        return (StatusCode::FORBIDDEN, "Target host blocked (private range)").into_response();
    }
    if !cfg.allowlist.contains(&host) {
        return (
            StatusCode::FORBIDDEN,
            format!("Target host not in STRATA_PROXY_ALLOWLIST: {host}"),
        )
            .into_response();
    }

    // Optional server-side token injection.
    if let Some(tok) = &cfg.token {
        let has = url.query_pairs().any(|(k, _)| k == "token");
        if !has {
            url.query_pairs_mut().append_pair("token", tok);
        }
    }

    let resp = match cfg
        .client
        .get(url)
        .timeout(cfg.timeout)
        .header("accept", "application/json,*/*")
        .send()
        .await
    {
        Ok(r) => r,
        Err(e) if e.is_timeout() => return (StatusCode::GATEWAY_TIMEOUT, "Upstream timeout").into_response(),
        Err(e) => return (StatusCode::BAD_GATEWAY, format!("Proxy error: {e}")).into_response(),
    };

    if let Some(len) = resp.content_length() {
        if len > cfg.max_bytes {
            return (StatusCode::BAD_GATEWAY, "Upstream response exceeds STRATA_PROXY_MAX_BYTES")
                .into_response();
        }
    }

    let status = resp.status();
    let mut headers = HeaderMap::new();
    if let Some(ct) = resp.headers().get(http::header::CONTENT_TYPE) {
        headers.insert(http::header::CONTENT_TYPE, ct.clone());
    }

    // Stream with a running size cap (protects against chunked responses without Content-Length).
    let max = cfg.max_bytes;
    let mut sent: u64 = 0;
    let stream = resp.bytes_stream().map(move |chunk| match chunk {
        Ok(bytes) => {
            sent += bytes.len() as u64;
            if sent > max {
                Err(std::io::Error::new(std::io::ErrorKind::Other, "size cap exceeded"))
            } else {
                Ok(bytes)
            }
        }
        Err(e) => Err(std::io::Error::new(std::io::ErrorKind::Other, e)),
    });

    let mut out = Response::builder().status(status);
    for (k, v) in headers.iter() {
        out = out.header(k, v);
    }
    out.body(Body::from_stream(stream))
        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}

#[tokio::main]
async fn main() {
    let allowlist: HashSet<String> = env::var("STRATA_PROXY_ALLOWLIST")
        .unwrap_or_default()
        .split(',')
        .map(|s| s.trim().to_ascii_lowercase())
        .filter(|s| !s.is_empty())
        .collect();

    let cors_origin = env::var("STRATA_PROXY_CORS_ORIGIN").unwrap_or_else(|_| "*".into());
    let cors = if cors_origin == "*" {
        CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any)
    } else {
        CorsLayer::new()
            .allow_origin(cors_origin.parse::<HeaderValue>().expect("bad STRATA_PROXY_CORS_ORIGIN"))
            .allow_methods(Any)
            .allow_headers(Any)
    };

    let cfg = Cfg {
        allowlist: Arc::new(allowlist),
        max_bytes: env_u64("STRATA_PROXY_MAX_BYTES", 50 * 1024 * 1024),
        timeout: Duration::from_millis(env_u64("STRATA_PROXY_TIMEOUT_MS", 20000)),
        token: env::var("STRATA_PROXY_TOKEN").ok().filter(|s| !s.is_empty()),
        client: reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::limited(5))
            .build()
            .expect("reqwest client"),
    };

    let port: u16 = env::var("PORT").ok().and_then(|p| p.parse().ok()).unwrap_or(8787);
    let app = Router::new()
        // Router restricts this path to GET; other methods -> 405 automatically.
        .route("/proxy/featureserver", get(proxy))
        .layer(cors)
        .with_state(cfg.clone());

    let n = cfg.allowlist.len();
    let listener = tokio::net::TcpListener::bind(("0.0.0.0", port)).await.expect("bind");
    println!("[strata-proxy] listening on :{port}  allowlist entries: {n}");
    axum::serve(listener, app).await.expect("serve");
}
