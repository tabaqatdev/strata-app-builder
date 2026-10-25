#!/usr/bin/env node
// Render the basemap gallery thumbnails — AFTER verifying every entry is keyless.
//
//   pnpm --filter @strata/map-controls thumbs              verify all, then render thumbs/<id>.png
//   node scripts/build-thumbs.mjs osm esri-topo            just these ids
//
// Needs the built catalog (dist/basemaps.js) and a local Chrome / Chromium / Edge (headless, driven
// over the DevTools Protocol — no npm dependencies). Writes the package's thumbs/ folder; the next
// `pnpm build` copies them into dist/thumbs/.
//
// One uniform render per entry through real MapLibre, all framing California / the US West at z4,
// 200×134. Then LOOK at a few — a placeholder passes every byte check in verify-basemaps.mjs.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Node 20 ships WebSocket behind a flag — re-exec once with it rather than hand-rolling a client.
if (typeof WebSocket === "undefined") {
  const r = spawn(process.execPath, ["--experimental-websocket", ...process.argv.slice(1)], { stdio: "inherit" });
  r.on("exit", (c) => process.exit(c ?? 1));
} else await main();

async function main() {
const { BASEMAPS, verifyAll } = await import("./verify-basemaps.mjs");
const { toXyz } = await import(new URL("../dist/basemaps.js", import.meta.url).href);
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const list = only.length ? BASEMAPS.filter((b) => only.includes(b.id)) : BASEMAPS;
const OUT = new URL("../thumbs/", import.meta.url);

const failed = await verifyAll(list);
if (failed.length) { console.log("not rendering: fix (or remove) the failing basemap(s) first"); process.exit(1); }

// ── render ──────────────────────────────────────────────────────────────────────────────────
const W = 200, H = 134, CENTER = [-118.6, 37.4], ZOOM = 4;
const styleFor = (b) => b.style ?? {
  version: 8,
  sources: {
    base: { type: "raster", tiles: [toXyz(b.templateUrl)], tileSize: 256, maxzoom: b.maxZoom ?? 19 },
    ...(b.overlay ? { ref: { type: "raster", tiles: [toXyz(b.overlay)], tileSize: 256, maxzoom: b.maxZoom ?? 19 } } : {}),
  },
  layers: [{ id: "base", type: "raster", source: "base", ...(b.paint ? { paint: b.paint } : {}) }, ...(b.overlay ? [{ id: "ref", type: "raster", source: "ref" }] : [])],
};
const page = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css">
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<style>html,body{margin:0;background:#fff}#m{width:${W}px;height:${H}px}</style><div id="m"></div>
<script>
window.render = (style) => new Promise((res) => {
  if (window.map) window.map.remove();
  const map = window.map = new maplibregl.Map({ container: "m", style, center: ${JSON.stringify(CENTER)}, zoom: ${ZOOM},
    attributionControl: false, interactive: false, fadeDuration: 0 });
  const t = setTimeout(() => res("timeout"), 30000);
  map.on("error", (e) => console.log("maplibre error", e.error?.message));
  map.once("idle", () => { clearTimeout(t); setTimeout(() => res(map.areTilesLoaded() ? "idle" : "idle-partial"), 400); });
});
</script>`;
const srv = createServer((q, r) => { r.writeHead(200, { "content-type": "text/html" }); r.end(page); });
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const pageUrl = `http://127.0.0.1:${srv.address().port}/`;

const CHROME = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
].filter(Boolean).find((p) => existsSync(p));
if (!CHROME) { console.error("no Chrome/Chromium/Edge found (set CHROME_PATH)"); srv.close(); process.exit(2); }
const prof = mkdtempSync(join(tmpdir(), "thumbs-"));
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${prof}`,
  "--no-first-run", "--hide-scrollbars", "--force-device-scale-factor=1", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "about:blank"], { stdio: "ignore" });
let port;
for (let i = 0; i < 100 && !port; i++) {
  await new Promise((s) => setTimeout(s, 150));
  try { port = readFileSync(join(prof, "DevToolsActivePort"), "utf8").split("\n")[0].trim(); } catch {}
}
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const sock = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => sock.addEventListener("open", r, { once: true }));
let seq = 0; const waiting = new Map();
sock.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && waiting.has(m.id)) { const w = waiting.get(m.id); waiting.delete(m.id); m.error ? w.rej(new Error(m.error.message)) : w.res(m.result); }
  if (m.method === "Runtime.consoleAPICalled") console.log("    page:", m.params.args.map((a) => a.value).join(" "));
});
const cdp = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; waiting.set(id, { res, rej }); sock.send(JSON.stringify({ id, method, params })); });

try {
  await cdp("Runtime.enable");
  await cdp("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await cdp("Page.navigate", { url: pageUrl });
  for (let i = 0; i < 100; i++) {
    const r = await cdp("Runtime.evaluate", { expression: "typeof maplibregl !== 'undefined' && typeof render === 'function'", returnByValue: true });
    if (r.result.value) break;
    await new Promise((s) => setTimeout(s, 200));
  }
  mkdirSync(OUT, { recursive: true });
  for (const b of list) {
    const r = await cdp("Runtime.evaluate", { expression: `render(${JSON.stringify(styleFor(b))})`, awaitPromise: true, returnByValue: true });
    const shot = await cdp("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
    const png = Buffer.from(shot.data, "base64");
    writeFileSync(new URL(`${b.id}.png`, OUT), png);
    console.log(`  ${r.result.value === "idle" ? "✓" : "!"} thumbs/${b.id}.png  ${png.length} B  (${r.result.value})`);
  }
} finally {
  sock.close(); chrome.kill(); srv.close();
  await new Promise((s) => setTimeout(s, 500));
  try { rmSync(prof, { recursive: true, force: true }); } catch {}
}
}
