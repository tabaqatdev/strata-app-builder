# strata-proxy-node

A ~130-line, dependency-free CORS proxy for CORS-restricted ArcGIS REST services, using Node's
built-in `http` module and global `fetch` (Node 18+).

It implements the one contract expected by
`packages/core-map/src/engine/arcgisSource.ts`:

```
GET /proxy/featureserver?url=<url-encoded ArcGIS REST URL>
```

The proxy fetches the target and streams the response back with permissive CORS headers.

## Run

```bash
export STRATA_PROXY_ALLOWLIST="services.arcgis.com,services1.arcgis.com,127.0.0.1"
npm start          # or: node server.js
# -> [strata-proxy] listening on :8787
```

Point the map client at it:

```ts
const client = { proxyUrl: "http://localhost:8787/proxy/featureserver" };
```

## Environment variables

| Variable                   | Default        | Purpose                                                                 |
| -------------------------- | -------------- | ----------------------------------------------------------------------- |
| `PORT`                     | `8787`         | Listen port.                                                            |
| `STRATA_PROXY_ALLOWLIST`   | *(empty)*      | **Required.** Comma-separated hostnames allowed as targets. Empty ⇒ everything is rejected. |
| `STRATA_PROXY_MAX_BYTES`   | `52428800`     | Max response size (50 MB). Larger upstream responses are cut off.       |
| `STRATA_PROXY_TIMEOUT_MS`  | `20000`        | Upstream request timeout (ms) ⇒ `504`.                                  |
| `STRATA_PROXY_TOKEN`       | *(unset)*      | If set, appended as `token=…` to allowlisted targets. Never exposed to the browser. |
| `STRATA_PROXY_CORS_ORIGIN` | `*`            | Value for `Access-Control-Allow-Origin`.                                |

## Security

- **Host allowlist** — a target host not in `STRATA_PROXY_ALLOWLIST` gets `403`. This is what keeps
  the proxy from becoming an open SSRF relay. Loopback / private ranges (`127.*`, `10.*`,
  `192.168.*`, `169.254.*`, `172.16–31.*`, `::1`, `fc00::/7`) are blocked unless the exact host is
  explicitly listed.
- **GET only** — other methods return `405`; preflight `OPTIONS` returns `204`.
- **Hop-by-hop headers** are stripped; only `Content-Type` is forwarded from upstream.
- **Size cap + timeout** bound resource use.

## Serverless note

The same handler maps cleanly onto serverless platforms. Rather than `http.createServer`, export the
core logic as the request handler (e.g. an AWS Lambda function URL, a Cloudflare Worker `fetch`, or a
Vercel/Netlify function). Keep the allowlist in the platform's environment config, and note that
serverless response/time limits may be tighter than `STRATA_PROXY_MAX_BYTES` /
`STRATA_PROXY_TIMEOUT_MS`.

MIT licensed.
