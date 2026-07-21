// SPDX-License-Identifier: MIT
// strata-app-builder CORS/proxy reference — Node (built-in http + global fetch, Node 18+).
//
// Contract (see packages/core-map/src/engine/arcgisSource.ts):
//   GET /proxy/featureserver?url=<url-encoded ArcGIS REST URL>
//   -> fetches the target and streams the response back with permissive CORS headers.
//
// Security: host allowlist, GET-only, size cap, timeout, optional token injection.

import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 8787);
const ALLOWLIST = new Set(
  (process.env.STRATA_PROXY_ALLOWLIST || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
);
const MAX_BYTES = Number(process.env.STRATA_PROXY_MAX_BYTES || 50 * 1024 * 1024);
const TIMEOUT_MS = Number(process.env.STRATA_PROXY_TIMEOUT_MS || 20000);
const TOKEN = process.env.STRATA_PROXY_TOKEN || "";
const CORS_ORIGIN = process.env.STRATA_PROXY_CORS_ORIGIN || "*";

// Hop-by-hop headers must never be forwarded (RFC 7230 §6.1).
const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade", "host",
]);

const PRIVATE_RE =
  /^(127\.|10\.|192\.168\.|169\.254\.|::1$|fc00:|fd00:|172\.(1[6-9]|2\d|3[0-1])\.)/i;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

function send(res, status, body, extra = {}) {
  res.writeHead(status, { ...corsHeaders(), ...extra });
  res.end(body);
}

/** true if host is allowed. Loopback/private ranges are blocked unless explicitly listed. */
function hostAllowed(host) {
  const h = host.toLowerCase();
  if (!ALLOWLIST.has(h)) return false;
  return true; // an explicit allowlist entry (even a private IP) is trusted.
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "OPTIONS") return send(res, 204, "");

  if (reqUrl.pathname !== "/proxy/featureserver") return send(res, 404, "Not found");
  if (req.method !== "GET") return send(res, 405, "Method Not Allowed");

  const target = reqUrl.searchParams.get("url");
  if (!target) return send(res, 400, "Missing ?url");

  let t;
  try {
    t = new URL(target);
  } catch {
    return send(res, 400, "Bad target URL");
  }
  if (t.protocol !== "https:" && t.protocol !== "http:")
    return send(res, 400, "Only http(s) targets allowed");

  // Block private/loopback ranges unless the exact host is on the allowlist.
  if (PRIVATE_RE.test(t.hostname) && !ALLOWLIST.has(t.hostname.toLowerCase()))
    return send(res, 403, "Target host blocked (private range)");
  if (!hostAllowed(t.hostname))
    return send(res, 403, `Target host not in STRATA_PROXY_ALLOWLIST: ${t.hostname}`);

  // Optional server-side token injection (browser never sees credentials).
  if (TOKEN && !t.searchParams.has("token")) t.searchParams.set("token", TOKEN);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(t.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { accept: "application/json,*/*" },
    });

    const headers = { ...corsHeaders() };
    const ct = upstream.headers.get("content-type");
    if (ct) headers["Content-Type"] = ct;

    // Enforce size cap even when Content-Length is absent (chunked).
    const declared = Number(upstream.headers.get("content-length") || 0);
    if (declared && declared > MAX_BYTES) {
      clearTimeout(timer);
      return send(res, 502, "Upstream response exceeds STRATA_PROXY_MAX_BYTES");
    }

    res.writeHead(upstream.status, headers);
    let sent = 0;
    const reader = upstream.body?.getReader();
    if (!reader) {
      res.end();
      clearTimeout(timer);
      return;
    }
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      sent += value.byteLength;
      if (sent > MAX_BYTES) {
        controller.abort();
        res.destroy();
        break;
      }
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    const status = err?.name === "AbortError" ? 504 : 502;
    if (!res.headersSent) send(res, status, `Proxy error: ${err?.message || err}`);
    else res.destroy();
  } finally {
    clearTimeout(timer);
  }
});

server.listen(PORT, () => {
  const filtered = ALLOWLIST.size ? [...ALLOWLIST].join(", ") : "(none — all rejected!)";
  console.log(`[strata-proxy] listening on :${PORT}  allowlist: ${filtered}`);
});
