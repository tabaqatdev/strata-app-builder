# strata-proxy-python

A small **FastAPI** CORS proxy for CORS-restricted ArcGIS REST services, using **async `httpx`**
streaming.

It implements the one contract expected by
`packages/core-map/src/engine/arcgisSource.ts`:

```
GET /proxy/featureserver?url=<url-encoded ArcGIS REST URL>
```

The proxy fetches the target and streams the response back with permissive CORS headers.

## Run

```bash
pip install -r requirements.txt
export STRATA_PROXY_ALLOWLIST="services.arcgis.com,services1.arcgis.com,127.0.0.1"
uvicorn main:app --port 8787
# for multiple workers: uvicorn main:app --port 8787 --workers 4
```

Point the map client at it:

```ts
const client = { proxyUrl: "http://localhost:8787/proxy/featureserver" };
```

## Environment variables

| Variable                   | Default    | Purpose                                                                 |
| -------------------------- | ---------- | ----------------------------------------------------------------------- |
| `STRATA_PROXY_ALLOWLIST`   | *(empty)*  | **Required.** Comma-separated target hostnames. Empty ⇒ all rejected.   |
| `STRATA_PROXY_MAX_BYTES`   | `52428800` | Max response size (50 MB); streaming is cut off past the cap.           |
| `STRATA_PROXY_TIMEOUT_MS`  | `20000`    | Upstream request timeout (ms) ⇒ `504`.                                  |
| `STRATA_PROXY_TOKEN`       | *(unset)*  | If set, appended as `token=…` to allowlisted targets. Never exposed to the browser. |
| `STRATA_PROXY_CORS_ORIGIN` | `*`        | Value for `Access-Control-Allow-Origin` (via `CORSMiddleware`).         |

Port is set on the `uvicorn` command line (`--port`), not via env.

## Security

- **Host allowlist** — a target host not in `STRATA_PROXY_ALLOWLIST` returns `403`, keeping the proxy
  from becoming an open SSRF relay. Loopback / private ranges (`127.*`, `10.*`, `192.168.*`,
  `169.254.*`, `172.16–31.*`, `::1`, `fc00::/7`, `fd00::/8`) are blocked unless the exact host is
  explicitly listed.
- **GET only** — only `GET /proxy/featureserver` is registered; other methods yield `405` and
  preflight `OPTIONS` is handled by `CORSMiddleware`.
- Only `Content-Type` is forwarded from upstream (hop-by-hop headers dropped).
- **Size cap + timeout** bound resource use; the streaming body enforces the cap even without a
  `Content-Length`.

MIT licensed.
