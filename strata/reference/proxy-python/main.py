# SPDX-License-Identifier: MIT
# strata-app-builder CORS/proxy reference — Python (FastAPI + async httpx streaming).
#
# Contract (see packages/core-map/src/engine/arcgisSource.ts):
#   GET /proxy/featureserver?url=<url-encoded ArcGIS REST URL>
#   -> fetches the target and streams the response back with permissive CORS headers.
#
# Security: host allowlist, GET-only, size cap, timeout, optional token injection.
#
# Run:  uvicorn main:app --port 8787

import os
import re
from urllib.parse import urlparse, urlencode, parse_qsl, urlunparse

import httpx
from fastapi import FastAPI, Query, Request
from fastapi.responses import PlainTextResponse, StreamingResponse
from starlette.middleware.cors import CORSMiddleware

ALLOWLIST = {
    h.strip().lower()
    for h in os.environ.get("STRATA_PROXY_ALLOWLIST", "").split(",")
    if h.strip()
}
MAX_BYTES = int(os.environ.get("STRATA_PROXY_MAX_BYTES", 50 * 1024 * 1024))
TIMEOUT_MS = int(os.environ.get("STRATA_PROXY_TIMEOUT_MS", 20000))
TOKEN = os.environ.get("STRATA_PROXY_TOKEN") or None
CORS_ORIGIN = os.environ.get("STRATA_PROXY_CORS_ORIGIN", "*")

# Loopback / private ranges are blocked unless the exact host is explicitly allowlisted.
_PRIVATE_RE = re.compile(
    r"^(127\.|10\.|192\.168\.|169\.254\.|::1$|fc00:|fd00:|172\.(1[6-9]|2\d|3[0-1])\.)",
    re.IGNORECASE,
)

app = FastAPI(title="strata-proxy-python")

# Preflight + permissive CORS response headers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if CORS_ORIGIN == "*" else [CORS_ORIGIN],
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,
)

_client = httpx.AsyncClient(
    timeout=httpx.Timeout(TIMEOUT_MS / 1000.0),
    follow_redirects=True,
    limits=httpx.Limits(max_connections=50),
)


def _host_blocked(host: str) -> bool:
    h = host.lower()
    if _PRIVATE_RE.match(h) and h not in ALLOWLIST:
        return True
    return h not in ALLOWLIST


def _inject_token(url: str) -> str:
    if not TOKEN:
        return url
    parts = urlparse(url)
    q = dict(parse_qsl(parts.query, keep_blank_values=True))
    if "token" not in q:
        q["token"] = TOKEN
    return urlunparse(parts._replace(query=urlencode(q)))


@app.get("/proxy/featureserver")
async def proxy(request: Request, url: str = Query(default="")):
    if not url:
        return PlainTextResponse("Missing ?url", status_code=400)

    parts = urlparse(url)
    if parts.scheme not in ("http", "https") or not parts.hostname:
        return PlainTextResponse("Bad target URL", status_code=400)

    host = parts.hostname.lower()
    if _PRIVATE_RE.match(host) and host not in ALLOWLIST:
        return PlainTextResponse("Target host blocked (private range)", status_code=403)
    if host not in ALLOWLIST:
        return PlainTextResponse(
            f"Target host not in STRATA_PROXY_ALLOWLIST: {host}", status_code=403
        )

    target = _inject_token(url)

    try:
        req = _client.build_request("GET", target, headers={"accept": "application/json,*/*"})
        upstream = await _client.send(req, stream=True)
    except httpx.TimeoutException:
        return PlainTextResponse("Upstream timeout", status_code=504)
    except httpx.HTTPError as e:
        return PlainTextResponse(f"Proxy error: {e}", status_code=502)

    declared = upstream.headers.get("content-length")
    if declared and int(declared) > MAX_BYTES:
        await upstream.aclose()
        return PlainTextResponse(
            "Upstream response exceeds STRATA_PROXY_MAX_BYTES", status_code=502
        )

    async def body():
        sent = 0
        try:
            async for chunk in upstream.aiter_raw():
                sent += len(chunk)
                if sent > MAX_BYTES:
                    break  # cut off oversized (possibly chunked) responses
                yield chunk
        finally:
            await upstream.aclose()

    headers = {}
    ct = upstream.headers.get("content-type")
    if ct:
        headers["content-type"] = ct

    # CORS response headers are added by CORSMiddleware.
    return StreamingResponse(body(), status_code=upstream.status_code, headers=headers)


@app.on_event("shutdown")
async def _shutdown():
    await _client.aclose()
