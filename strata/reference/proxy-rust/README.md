# strata-proxy-rust

A tiny [axum](https://github.com/tokio-rs/axum) CORS proxy for CORS-restricted ArcGIS REST services.
Uses `reqwest` with **rustls** (no OpenSSL) and `tower-http`'s CORS layer, so it drops in alongside
`wt-server` (Strata Serve) as a small static binary.

It implements the one contract expected by
`packages/core-map/src/engine/arcgisSource.ts`:

```
GET /proxy/featureserver?url=<url-encoded ArcGIS REST URL>
```

The proxy fetches the target and **streams** the response back with permissive CORS headers.

## Run

```bash
export STRATA_PROXY_ALLOWLIST="services.arcgis.com,services1.arcgis.com,127.0.0.1"
cargo run --release        # binary: target/release/strata-proxy
# -> [strata-proxy] listening on :8787  allowlist entries: 3
```

Deploy alongside `wt-server`: run the release binary as its own service (systemd unit, container
sidecar, etc.) and point the map client at it:

```ts
const client = { proxyUrl: "http://localhost:8787/proxy/featureserver" };
```

## Environment variables

| Variable                   | Default    | Purpose                                                                 |
| -------------------------- | ---------- | ----------------------------------------------------------------------- |
| `PORT`                     | `8787`     | Listen port.                                                            |
| `STRATA_PROXY_ALLOWLIST`   | *(empty)*  | **Required.** Comma-separated target hostnames. Empty ⇒ all rejected.   |
| `STRATA_PROXY_MAX_BYTES`   | `52428800` | Max response size (50 MB); streaming is aborted past the cap.           |
| `STRATA_PROXY_TIMEOUT_MS`  | `20000`    | Upstream request timeout (ms) ⇒ `504`.                                  |
| `STRATA_PROXY_TOKEN`       | *(unset)*  | If set, appended as `token=…` to allowlisted targets. Never exposed to the browser. |
| `STRATA_PROXY_CORS_ORIGIN` | `*`        | Value for `Access-Control-Allow-Origin`.                                |

## Security

- **Host allowlist** — a target host not in `STRATA_PROXY_ALLOWLIST` returns `403`, which is what
  stops the proxy from being an open SSRF relay. Loopback / private ranges (`127.*`, `10.*`,
  `192.168.*`, `169.254.*`, `172.16–31.*`, `::1`, `fc00::/7`, `fd00::/8`) are blocked unless the
  exact host is explicitly listed.
- **GET only** — the router registers only `GET /proxy/featureserver`; other methods yield `405` and
  preflight is handled by the CORS layer.
- Only `Content-Type` is forwarded from upstream (hop-by-hop headers dropped).
- **Size cap + timeout** bound resource use (the streaming body enforces the cap even without a
  `Content-Length`).

MIT licensed.
