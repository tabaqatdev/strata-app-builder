# CORS and proxying ArcGIS services

The map client (`packages/core-map/src/engine/arcgisSource.ts`) fetches ArcGIS REST layers directly
from the browser. That works only when the target service sends CORS headers. When it doesn't, the
browser blocks the response and the client falls back to a **same-origin proxy** if one is configured:

```ts
const client = {
  proxyUrl: "/proxy/featureserver", // GET ?url=<url-encoded ArcGIS REST URL>
  token: undefined,                 // secured services (prefer server-side injection instead)
};
```

The proxy contract is one endpoint:

```
GET /proxy/featureserver?url=<url-encoded ArcGIS REST URL>
  -> fetch the target, stream the body back with permissive CORS response headers.
```

Fix CORS in **layers**, cheapest first. Reach for a standalone proxy only for third-party services you
don't control.

---

## Layer 1 — Vite dev-server proxy (local development)

For `pnpm dev`, let Vite proxy the request so the browser only ever talks to `localhost` (same
origin). No extra process, no CORS. This is dev-only — the Vite proxy does not exist in a production
build.

```ts
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/proxy/featureserver": {
        // Rewrite /proxy/featureserver?url=<encoded> into a request to the target.
        target: "https://services.arcgis.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          const q = new URLSearchParams(path.split("?")[1] || "");
          const url = q.get("url");
          return url ? new URL(url).pathname + new URL(url).search : path;
        },
        router: (req) => {
          const q = new URLSearchParams((req.url || "").split("?")[1] || "");
          const url = q.get("url");
          return url ? new URL(url).origin : "https://services.arcgis.com";
        },
      },
    },
  },
});
```

Keep the client `proxyUrl` set to `/proxy/featureserver` and Vite handles the rest during dev.

> If you only ever hit one known service, a simpler static `target` + path rewrite is fine. The
> `router` form above lets `?url=` point at any host, matching the standalone proxies below.

---

## Layer 2 — Enable CORS on your own Strata Serve server (best fix for same-stack)

If the layer is served by **your** Strata Serve (`wt-server`) FeatureServer, the correct fix is to
have that server send CORS headers — no proxy needed at all. Add the allowed origin(s) to the server
config and **restart** (`services.json`, `basemaps.json`, metadata bundles and CORS-class settings
are all picked up on restart; there is no hot reload):

```toml
# server_config.toml
[http.cors]
allow_origins = ["https://maps.example.com"]   # or ["*"] for public read-only tiles
allow_methods = ["GET", "OPTIONS"]
```

This is always preferable to a proxy for same-stack data: one fewer hop, no relay to secure, and the
browser talks straight to the FeatureServer.

---

## Layer 3 — A standalone proxy (third-party ArcGIS services without CORS)

When the service is **someone else's** ArcGIS Server / ArcGIS Online item that doesn't send CORS
headers and you can't change it, run one of the reference proxies in `strata/reference/`. They all implement
the identical `GET /proxy/featureserver?url=…` contract, so the client config is the same regardless
of which you pick.

| Implementation                | Stack                         | Reach for it when…                                                        |
| ----------------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| `reference/proxy-node`         | Node 18+, built-in `http`     | You already run Node tooling; want zero dependencies; or want a serverless function (Lambda / Worker / Vercel). |
| `reference/proxy-rust`         | axum + reqwest (rustls)       | You deploy alongside `wt-server` and want a small static binary / sidecar with no runtime. |
| `reference/proxy-python`       | FastAPI + async httpx         | Your ops stack is Python; you want async streaming and familiar `uvicorn` deployment. |

All three are ~100–150 LOC, MIT-licensed, and dependency-light.

### Security — an open proxy is an SSRF / open-relay hole

A naive "fetch whatever `?url=` says" proxy lets anyone use your server to reach internal services and
arbitrary hosts. Every reference implementation enforces the following, all configured by env var:

- **Host allowlist (`STRATA_PROXY_ALLOWLIST`)** — comma-separated hostnames, e.g.
  `services.arcgis.com,services1.arcgis.com,127.0.0.1`. Any target host **not** on the list is
  rejected with `403`. An empty allowlist rejects everything. This is the single most important
  control — keep it tight.
- **Loopback / private ranges blocked** — `127.*`, `10.*`, `192.168.*`, `169.254.*`, `172.16–31.*`,
  `::1`, `fc00::/7`, `fd00::/8` are refused **unless** the exact host is explicitly on the allowlist.
  This stops the proxy from being pivoted at your internal network.
- **GET only** — any other method returns `405`; `OPTIONS` preflight is answered. Hop-by-hop headers
  are stripped; only `Content-Type` is passed through.
- **Size cap (`STRATA_PROXY_MAX_BYTES`, default 50 MB)** and **timeout
  (`STRATA_PROXY_TIMEOUT_MS`, default 20000)** bound resource use, enforced even on chunked responses
  without a `Content-Length`.
- **Optional server-side token injection (`STRATA_PROXY_TOKEN`)** — if set, the proxy appends
  `token=<…>` to the outgoing query for allowlisted targets, so a secured service can be reached
  **without the browser ever seeing the credential**. Prefer this over putting a token in the client
  config.
- **CORS origin (`STRATA_PROXY_CORS_ORIGIN`, default `*`)** — set to your app origin in production
  rather than leaving it wildcard.

### Environment variables (all three proxies)

| Variable                   | Default    | Purpose                                                             |
| -------------------------- | ---------- | ------------------------------------------------------------------ |
| `STRATA_PROXY_ALLOWLIST`   | *(empty)*  | Comma-separated allowed target hostnames. Empty ⇒ all rejected.    |
| `STRATA_PROXY_MAX_BYTES`   | `52428800` | Max response size (50 MB).                                          |
| `STRATA_PROXY_TIMEOUT_MS`  | `20000`    | Upstream request timeout in ms.                                    |
| `STRATA_PROXY_TOKEN`       | *(unset)*  | Server-side token appended to allowlisted targets.                 |
| `STRATA_PROXY_CORS_ORIGIN` | `*`        | Value for `Access-Control-Allow-Origin`.                           |

### Wire it up

```bash
export STRATA_PROXY_ALLOWLIST="services.arcgis.com,services1.arcgis.com"
export STRATA_PROXY_CORS_ORIGIN="https://maps.example.com"
# then run one of:
#   node reference/proxy-node/server.js
#   (cd reference/proxy-rust && cargo run --release)
#   (cd reference/proxy-python && uvicorn main:app --port 8787)
```

```ts
// client config in your app
const client = { proxyUrl: "https://proxy.example.com/proxy/featureserver" };
```

---

## Which layer do I use?

| Situation                                                        | Use                                            |
| --------------------------------------------------------------- | ---------------------------------------------- |
| Local `pnpm dev`, any target                                    | **Layer 1** — Vite `server.proxy`.             |
| Production, the layer is on **your** Strata Serve               | **Layer 2** — enable CORS on `wt-server`.      |
| Production, the layer is a **third-party** service without CORS | **Layer 3** — a standalone proxy from `strata/reference/`. |
| Third-party **secured** service (token)                         | **Layer 3** with `STRATA_PROXY_TOKEN`.         |

Coexistence, never "replace ArcGIS": these proxies just make third-party Esri services reachable from
the browser — they read data, they don't own it.
