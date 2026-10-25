#!/usr/bin/env node
/**
 * conformance-demo.mjs — prove scripts/conformance.mjs passes on the REAL package: serve the package
 * folder with a tiny static server, open demo/index.html (the built dist/, every tool and the scale bar ON) in headless
 * Chrome / Edge over the DevTools Protocol, and run runMapControlsConformance against it.
 *
 *   pnpm --filter @strata/map-controls build
 *   pnpm --filter @strata/map-controls conformance:demo        (or: node scripts/conformance-demo.mjs)
 *
 * Passes:
 *   A.  the demo as shipped — all five tools ON, the scale bar ON (metric + imperial) and a legend
 *       toggle: the complete default cluster plus every option;
 *   A+. 1.0.2 behaviour with real MapLibre and real keys: Esc closes the popup + the app card first,
 *       then the drawer; the inset (secondary) map follows basemap picks and layer visibility; an
 *       expression opacity is written back as authored; a hostile global button style leaves the
 *       chrome alone; the drawer resizes under a real drag (light and dark);
 *   A3. 1.0.3 behaviour: a MapLibre popup straddling a wide open drawer is ON TOP of it while the grip
 *       stays on top of the popup (and still drags); the dark-mode popup card is readable (contrast);
 *       ?pair=vt-gray puts vt-gray-dark under Recommended with no recommendedExtras;
 *   C.  demo/index.html?dir=rtl — the mirrored chrome passes the same conformance;
 *   B.  the same page remounted in-page with NO tools and NO scale bar (a legend toggle kept) — the
 *       "tools / scale bar absent when not enabled" branch.
 * SMC_SHOTS=<dir> (or --shots <dir>) writes screenshots: the drawer mid-resize in light, dark and
 * RTL, the RTL layer list, and (1.0.3) the popup over the drawer mid-drag, the dark popup and the
 * vt-gray-dark card under Recommended.
 * Ports: SMC_PORT (static server, default: any free port) and SMC_CDP_PORT (DevTools, default
 * 9600 + pid % 300) — pin them where only some ports may be used.
 *
 * Browser: $CHROME_PATH if set, else the first Chrome / Chromium / Edge found on Windows, macOS or
 * Linux. No dependencies — the WebSocket client is hand-rolled over node:net, as in the reference
 * app harnesses. Exit 0 = every check passed; 1 = a check failed; 2 = could not run (no browser,
 * dist not built).
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { connect } from "node:net";
import { randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { cdpAdapters, runMapControlsConformance } from "./conformance.mjs";

const PKG = fileURLToPath(new URL("../", import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!existsSync(join(PKG, "dist", "map-controls.js"))) {
  console.error("conformance:demo — dist/ is not built. Run: pnpm --filter @strata/map-controls build");
  process.exit(2);
}

// ── find a Chromium-family browser ──────────────────────────────────────────
export function findBrowser(env = process.env) {
  const L = env.LOCALAPPDATA ?? "", PF = env.PROGRAMFILES ?? "C:/Program Files", PF86 = env["PROGRAMFILES(X86)"] ?? "C:/Program Files (x86)";
  const candidates = [
    env.CHROME_PATH, env.PUPPETEER_EXECUTABLE_PATH,
    // Windows
    `${PF}/Google/Chrome/Application/chrome.exe`, `${PF86}/Google/Chrome/Application/chrome.exe`, `${L}/Google/Chrome/Application/chrome.exe`,
    `${PF86}/Microsoft/Edge/Application/msedge.exe`, `${PF}/Microsoft/Edge/Application/msedge.exe`,
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    // Linux
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "/snap/bin/chromium", "/usr/bin/microsoft-edge", "/usr/bin/microsoft-edge-stable",
  ];
  return candidates.find((p) => p && existsSync(p)) ?? null;
}

// ── a tiny static server rooted at the package folder ───────────────────────
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".png": "image/png", ".json": "application/json", ".svg": "image/svg+xml" };
function serve(root) {
  const server = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const abs = normalize(join(root, p));
    if (!abs.startsWith(normalize(root + sep)) && abs !== normalize(root)) { res.writeHead(403).end(); return; }
    if (!existsSync(abs) || !statSync(abs).isFile()) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "content-type": TYPES[extname(abs)] ?? "application/octet-stream", "cache-control": "no-store" });
    res.end(readFileSync(abs));
  });
  return new Promise((r) => server.listen(Number(process.env.SMC_PORT) || 0, "127.0.0.1", () => r(server)));
}

// ── a minimal WebSocket client over node:net (as in the reference drive.mjs) ──
const int16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b; };
const int64 = (n) => { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(n)); return b; };
function ws(url) {
  const u = new URL(url);
  return new Promise((resolveWs, reject) => {
    const sock = connect(Number(u.port), u.hostname, () => {
      sock.write(`GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\n` +
        `Connection: Upgrade\r\nSec-WebSocket-Key: ${randomBytes(16).toString("base64")}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
    });
    let buf = Buffer.alloc(0), up = false;
    const listeners = [];
    const api = {
      onMessage: (fn) => listeners.push(fn),
      send: (s) => {
        const p = Buffer.from(s), mask = randomBytes(4), len = p.length;
        const head = len < 126 ? Buffer.from([0x81, 0x80 | len])
          : len < 65536 ? Buffer.concat([Buffer.from([0x81, 0xfe]), int16(len)])
          : Buffer.concat([Buffer.from([0x81, 0xff]), int64(len)]);
        const masked = Buffer.alloc(len);
        for (let i = 0; i < len; i++) masked[i] = p[i] ^ mask[i % 4];
        sock.write(Buffer.concat([head, mask, masked]));
      },
      close: () => sock.destroy(),
    };
    sock.on("error", reject);
    sock.on("data", (d) => {
      buf = Buffer.concat([buf, d]);
      if (!up) {
        const i = buf.indexOf("\r\n\r\n");
        if (i < 0) return;
        const hdr = buf.subarray(0, i).toString();
        if (!/^HTTP\/1\.1 101/.test(hdr)) return reject(new Error(`handshake failed: ${hdr.split("\r\n")[0]}`));
        buf = buf.subarray(i + 4); up = true; resolveWs(api);
      }
      for (;;) {                                   // server → client frames are not masked
        if (buf.length < 2) return;
        const op = buf[0] & 0x0f, l0 = buf[1] & 0x7f;
        let off = 2, len = l0;
        if (l0 === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
        else if (l0 === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        if (buf.length < off + len) return;
        const payload = buf.subarray(off, off + len);
        buf = buf.subarray(off + len);
        if (op === 1) { const t = payload.toString(); for (const fn of listeners) fn(t); }
        else if (op === 8) { sock.destroy(); return; }
      }
    });
  });
}

// ── run ─────────────────────────────────────────────────────────────────────
const BROWSER = findBrowser();
if (!BROWSER) { console.error("conformance:demo — no Chrome / Chromium / Edge found (set CHROME_PATH)"); process.exit(2); }

const server = await serve(resolve(PKG));
const PORT = server.address().port;
const CDP_PORT = Number(process.env.SMC_CDP_PORT) || 9600 + (process.pid % 300);
const profile = mkdtempSync(join(tmpdir(), "smc-conformance-"));
const browser = spawn(BROWSER, ["--headless=new", `--remote-debugging-port=${CDP_PORT}`, "--disable-gpu", "--no-first-run",
  "--no-default-browser-check", "--disable-extensions", "--hide-scrollbars", "--window-size=1400,900",
  `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let sock = null;
const cleanup = () => {
  try { sock?.close(); } catch {}
  try { browser.kill(); } catch {}
  try { server.close(); } catch {}
  setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }); } catch {} }, 300);
};

let exitCode = 0;
try {
  let target = null;
  for (let i = 0; i < 80 && !target; i++) {
    await sleep(250);
    try { target = (await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).json()).webSocketDebuggerUrl; } catch {}
  }
  if (!target) throw Object.assign(new Error("the browser did not expose a DevTools endpoint"), { code: 2 });
  sock = await ws(target);
  let msgId = 0;
  const waiters = new Map(), pageErrors = [];
  sock.onMessage((raw) => {
    const m = JSON.parse(raw);
    if (m.id && waiters.has(m.id)) { waiters.get(m.id)(m); waiters.delete(m.id); return; }
    if (m.method === "Runtime.exceptionThrown") pageErrors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  });
  const rawSend = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const id = ++msgId;
    waiters.set(id, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
    sock.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    setTimeout(() => { if (waiters.has(id)) { waiters.delete(id); rej(new Error(`${method} timed out`)); } }, 30000);
  });
  const { targetId } = await rawSend("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await rawSend("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => rawSend(method, params, sessionId);
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });

  const { evaluate, click, key } = cdpAdapters(send);
  const url = `http://127.0.0.1:${PORT}/demo/index.html`;
  console.log(`conformance:demo — ${url} in ${BROWSER.split(/[\\/]/).pop()}`);
  await send("Page.navigate", { url });
  let ready = false;
  for (let i = 0; i < 80 && !ready; i++) {
    await sleep(250);
    ready = await evaluate(`return !!(window.__demo && document.querySelector(".smc-ctl button"));`).catch(() => false);
  }
  if (!ready) {
    const has = await evaluate(`return !!document.querySelector(".smc-ctl button");`).catch(() => false);
    if (!has) throw new Error(`the demo did not mount its controls${pageErrors.length ? `: ${pageErrors[0]}` : ""}`);
    console.log("  (window.__demo missing — MapLibre from unpkg probably failed to load; the controls still mounted)");
  }

  const log = (line) => console.log(line);
  console.log("\nA. demo/index.html as shipped — all five tools ON, the scale bar ON (both units), a legend toggle");
  const A = await runMapControlsConformance({ evaluate, click, key, log,
    tools: { search: true, locate: true, measure: true, draw: true, print: true },
    expect: { minLayers: 1, scale: { units: "both" } } });

  // ── 1.0.2 behaviour in a REAL browser: Esc order with a real MapLibre popup + the app's card,
  //    the secondary (inset) map, the hostile button style, the stacking token ──
  console.log("\nA+. 1.0.2 behaviour on the shipped demo (real MapLibre, real keys)");
  let extraPass = 0, extraFail = 0;
  const rec = (name, ok, detail = "") => { ok ? extraPass++ : extraFail++; console.log(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`); };
  let hasMap = false;
  for (let i = 0; i < 60 && !hasMap; i++) {
    hasMap = await evaluate(`const d = window.__demo; return !!(d?.map?.getLayer?.("cities-pt") && d?.inset?.getLayer?.("cities-pt"));`).catch(() => false);
    if (!hasMap) await sleep(250);
  }
  if (hasMap) {
    await evaluate(`const d = window.__demo; d.popup.setLngLat([-122.4194, 37.7749]).setHTML("<b>San Francisco</b>").addTo(d.map);
      d.card.hidden = false; d.controls.openDrawer("layers"); return true;`);
    await sleep(150);
    const st = `const d = window.__demo; return { popup: !!document.querySelector("#map .maplibregl-popup"), card: !d.card.hidden, drawer: d.controls.getOpenDrawer() };`;
    const s0 = await evaluate(st);
    await key("Escape"); await sleep(120);
    const s1 = await evaluate(st);
    await key("Escape"); await sleep(120);
    const s2 = await evaluate(st);
    await key("Escape"); await sleep(120);
    const s3 = await evaluate(st);
    rec("Esc #1 closes ONLY the app card (closePopup → true stops there) — the MapLibre popup and the drawer stay (1.0.3)",
      s0.popup && s0.card && s0.drawer === "layers" && s1.popup && !s1.card && s1.drawer === "layers", JSON.stringify([s0, s1]));
    rec("Esc #2 closes the MapLibre popup (MapLibre 4.7.1 has no map._popups: found in the DOM) — the drawer stays",
      !s2.popup && s2.drawer === "layers", JSON.stringify(s2));
    rec("Esc #3 then closes the drawer", s3.drawer === null, JSON.stringify(s3));
    const two = await evaluate(`return (async () => { const d = window.__demo;
      const was = d.controls.getBasemap();
      const done = (m) => new Promise((r) => { const t = setTimeout(r, 6000); m.once("idle", () => { clearTimeout(t); r(); }); });
      d.controls.setBasemap("vt-gray"); await Promise.all([done(d.map), done(d.inset)]);
      const src = (m) => Object.keys(m.getStyle().sources ?? {}).sort().join(",");
      const out = { main: src(d.map), inset: src(d.inset), insetCities: !!d.inset.getLayer("cities-pt"),
        insetGlyphs: d.inset.getStyle().glyphs ?? null, mainGlyphs: d.map.getStyle().glyphs ?? null };
      d.controls.setBasemap(was); await Promise.all([done(d.map), done(d.inset)]);
      return out; })();`);
    rec("secondary map: a basemap pick restyles the inset too, and onRestyle(inset) re-adds its layer",
      two.main === two.inset && two.insetCities && two.insetGlyphs === two.mainGlyphs, JSON.stringify(two));
    const vis = await evaluate(`const d = window.__demo; d.controls.openDrawer("layers");
      document.querySelector('.smc-drawer .ll-row[data-ll-id="cities"] [data-ll-act="eye"]').click();
      const off = d.inset.getLayoutProperty("cities-pt", "visibility");
      document.querySelector('.smc-drawer .ll-row[data-ll-id="cities"] [data-ll-act="eye"]').click();
      const on = d.inset.getLayoutProperty("cities-pt", "visibility"); d.controls.closeAll();
      return { off, on, last: window.__lastLayerState };`);
    rec("secondary map: the eye hides the layer on the inset too; onLayerStateChange reports it",
      vis.off === "none" && vis.on === "visible" && vis.last?.visible?.cities === true, JSON.stringify(vis));
    const op = await evaluate(`const d = window.__demo; return JSON.stringify(d.map.getPaintProperty("cities-pt", "circle-opacity"));`);
    rec("transparency: the zoom-interpolated circle-opacity is written back as authored at 0 %", op === JSON.stringify(["interpolate", ["linear"], ["zoom"], 3, 0.55, 8, 1]), op);
  } else rec("1.0.2 browser checks need MapLibre (unpkg) — skipped", true, "window.__demo.map not ready");
  const look = await evaluate(`const b = document.querySelector('.smc-ctl [data-act="zin"]'); const cs = getComputedStyle(b);
    const hostile = !!document.getElementById("hostile");
    return { hostile, w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height, bg: cs.backgroundColor, font: cs.fontFamily, radius: cs.borderTopLeftRadius,
      z: getComputedStyle(document.querySelector(".smc-ctl")).zIndex, drawerZ: getComputedStyle(document.querySelector(".smc-drawer")).zIndex,
      gripZ: getComputedStyle(document.querySelector(".smc-dgrip")).zIndex };`);
  rec("button bleed: under a hostile global `button{}` the cluster buttons keep 32×32, no fill, no app font",
    look.hostile && Math.round(look.w) <= 34 && Math.round(look.h) <= 34 && /rgba\(0, 0, 0, 0\)|transparent/.test(look.bg) && !/Georgia/.test(look.font), JSON.stringify(look));
  rec("layering: drawer 40 < popup 42 < cluster + grip 43 (1.0.3)", look.drawerZ === "40" && look.z === "43" && look.gripZ === "43",
    `drawer ${look.drawerZ}, cluster ${look.z}, grip ${look.gripZ}`);

  // ── screenshots (SMC_SHOTS=<dir>): the drawer mid-resize in light and dark, and RTL ──
  const SHOTS = process.env.SMC_SHOTS || (process.argv.includes("--shots") ? process.argv[process.argv.indexOf("--shots") + 1] : null);
  const shoot = async (name) => {
    if (!SHOTS) return;
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    const { writeFileSync, mkdirSync } = await import("node:fs");
    mkdirSync(SHOTS, { recursive: true });
    writeFileSync(join(SHOTS, `${name}.png`), Buffer.from(data, "base64"));
    console.log(`  (screenshot) ${join(SHOTS, `${name}.png`)}`);
  };
  /** Open the gallery and drag the grip 120 px outward with REAL mouse events; shoot mid-drag. */
  const dragShot = async (name) => {
    await evaluate(`const c = window.__demo.controls; c.closeAll(); c.openDrawer("base"); return true;`);
    await sleep(500);
    const g = await evaluate(`const g = document.querySelector(".smc-dgrip"); const r = g.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 200), w: window.__demo.controls.drawerWidth(),
        rtl: document.querySelector(".smc").getAttribute("data-smc-dir") === "rtl" };`);
    const dx = g.rtl ? 120 : -120;
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: g.x, y: g.y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: g.x, y: g.y, button: "left", buttons: 1, clickCount: 1 });
    for (let i = 1; i <= 6; i++) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: g.x + (dx * i) / 6, y: g.y, button: "left", buttons: 1 });
    await sleep(250);
    await shoot(name);
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: g.x + dx, y: g.y, button: "left", buttons: 0, clickCount: 1 });
    const w2 = await evaluate(`return window.__demo.controls.drawerWidth();`);
    rec(`drawer resize by a real drag (${name}): ${g.w}px → ${w2}px`, w2 >= g.w + 100, `dragged ${dx}px`);
  };
  await dragShot("drawer-resize-light");
  await evaluate(`document.documentElement.dataset.theme = "dark"; window.__demo.controls.setTheme("dark"); return true;`);
  await sleep(1500);
  await dragShot("drawer-resize-dark");
  await evaluate(`document.documentElement.dataset.theme = ""; window.__demo.controls.setTheme("light"); window.__demo.controls.closeAll(); return true;`);
  await sleep(800);

  // ── A3. 1.0.3 in a REAL browser: the popup over a wide drawer, the grip above the popup, the dark card ──
  console.log("\nA3. 1.0.3 behaviour — popups above the drawer, the grip above the popup, the themed dark card");
  /** Open the layer list at 400 px with a row's options open (a taller drawer) and drop a popup whose card
   *  straddles the drawer's outer edge (the grip) over its lower rows. */
  const popupOverDrawer = async (name) => {
    await evaluate(`const d = window.__demo; d.card.hidden = true; d.controls.closeAll();
      d.controls.setDrawerWidth(400, "layers"); d.controls.openDrawer("layers");
      if (!d.controls.LL.acts.has("cities")) document.querySelector('.smc-drawer [data-ll-act="acts"]')?.click();
      const dr = document.querySelector(".smc-drawer").getBoundingClientRect(), mr = document.getElementById("map").getBoundingClientRect();
      const rtl = document.querySelector(".smc").getAttribute("data-smc-dir") === "rtl";
      const ll = d.map.unproject([(rtl ? dr.right : dr.left) - mr.left, dr.bottom - mr.top - 12]);   // anchored below the card: the card overlaps the drawer's lower rows
      d.popup.setLngLat(ll).setHTML('<b>San Francisco</b><table><tr><td>Population</td><td>808,437</td></tr><tr><td>County</td><td>San Francisco</td></tr></table>').addTo(d.map);
      return true;`);
    await sleep(400);
    const hit = await evaluate(`const c = document.querySelector("#map .maplibregl-popup-content"), g = document.querySelector(".smc-dgrip");
      if (!c || !g) return null;
      const cr = c.getBoundingClientRect(), gr = g.getBoundingClientRect(), dr = document.querySelector(".smc-drawer").getBoundingClientRect();
      const rtl = document.querySelector(".smc").getAttribute("data-smc-dir") === "rtl";
      const y = cr.top + cr.height / 2, gx = gr.left + gr.width / 2;
      const inside = rtl ? Math.max(cr.left + 8, dr.right - 30) : Math.min(cr.right - 8, dr.left + 30);
      const at = (x) => document.elementFromPoint(x, y);
      const cs = getComputedStyle(c);
      return { overlapsDrawer: rtl ? cr.left < dr.right - 10 : cr.right > dr.left + 10, gripSpan: cr.left < gx && cr.right > gx,
        overDrawer: !!at(inside)?.closest(".maplibregl-popup"), atGrip: at(gx) === g, popupZ: getComputedStyle(c.closest(".maplibregl-popup")).zIndex,
        fg: cs.color, bg: (cs.backgroundImage.match(/rgba?[(][^)]*[)]/) || [cs.backgroundColor])[0], fill: cs.backgroundImage, gx, y, rtl };`);   // 1.0.4: the card's fill is a one-colour gradient (backgroundColor is transparent)
    rec(`${name}: the popup straddles the open drawer and is ON TOP of it (popup z ${hit?.popupZ})`,
      !!hit && hit.overlapsDrawer && hit.overDrawer && hit.popupZ === "42", JSON.stringify(hit));
    rec(`${name}: the drawer grip stays above the popup (elementFromPoint on the grip is the grip)`, !!hit && hit.gripSpan && hit.atGrip, JSON.stringify(hit));
    if (!hit) return null;
    // drag the grip THROUGH the popup with real mouse events; shoot mid-drag
    const w0 = await evaluate(`return window.__demo.controls.drawerWidth();`);
    const dx = hit.rtl ? 80 : -80;
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: hit.gx, y: hit.y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: hit.gx, y: hit.y, button: "left", buttons: 1, clickCount: 1 });
    for (let i = 1; i <= 5; i++) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: hit.gx + (dx * i) / 5, y: hit.y, button: "left", buttons: 1 });
    await sleep(250);
    await shoot(`${name}-popup-over-drawer`);
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: hit.gx + dx, y: hit.y, button: "left", buttons: 0, clickCount: 1 });
    const w1 = await evaluate(`return window.__demo.controls.drawerWidth();`);
    const still = await evaluate(`return !!document.querySelector("#map .maplibregl-popup");`);
    rec(`${name}: the grip still drags while the popup is open (${w0}px → ${w1}px), and the popup stays open`, w1 >= w0 + 60 && still, `dragged ${dx}px`);
    return hit;
  };
  /** WCAG contrast of two computed rgb() colours. */
  const contrast = (a, b) => {
    const L = (c) => { const v = (String(c).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05);
  };
  if (hasMap) {
    const light = await popupOverDrawer("light");
    rec("light: the popup card is readable (contrast ≥ 4.5)", !!light && contrast(light.fg, light.bg) >= 4.5,
      light ? `${light.fg} on ${light.bg} = ${contrast(light.fg, light.bg).toFixed(1)}` : "");
    await evaluate(`document.documentElement.dataset.theme = "dark"; window.__demo.controls.setTheme("dark"); return true;`);
    await sleep(1800);
    const dark = await popupOverDrawer("dark");
    rec("dark: the themed popup card is dark with light text, readable (contrast ≥ 4.5) — no app popup CSS",
      !!dark && contrast(dark.fg, dark.bg) >= 4.5 && contrast("rgb(0,0,0)", dark.bg) < 2,
      dark ? `${dark.fg} on ${dark.bg} = ${contrast(dark.fg, dark.bg).toFixed(1)}` : "");
    await evaluate(`window.__demo.controls.closeAll(); return true;`);
    await sleep(300);
    await shoot("dark-popup");
    await evaluate(`document.documentElement.dataset.theme = ""; window.__demo.controls.setTheme("light"); window.__demo.controls.closeAll(); window.__demo.popup.remove(); return true;`);
    await sleep(800);
  } else rec("1.0.3 popup checks need MapLibre (unpkg) — skipped", true, "window.__demo.map not ready");

  // ?pair=vt-gray: vt-gray-dark under Recommended with no recommendedExtras
  await send("Page.navigate", { url: `${url}?pair=vt-gray` });
  let readyP = false;
  for (let i = 0; i < 80 && !readyP; i++) { await sleep(250); readyP = await evaluate(`return !!(window.__demo && document.querySelector(".smc-ctl button"));`).catch(() => false); }
  await sleep(2500);                      // a vt style can take seconds to paint in headless Chrome
  const pairRec = await evaluate(`const c = window.__demo.controls; c.openDrawer("base");
    const rec = [...document.querySelectorAll('.smc-drawer [data-section="recommended"] [data-base]')].map((b) => b.dataset.base);
    document.querySelector('.smc-drawer [data-section="recommended"] [data-base="vt-gray-dark"]')?.scrollIntoView({ block: "center" });
    return { rec, pair: [c.themeBasemap("light"), c.themeBasemap("dark")], effective: c.effectiveBasemap() };`);
  await sleep(600);
  await shoot("recommended-vt-gray-dark");
  rec("?pair=vt-gray: vt-gray AND vt-gray-dark are under Recommended with no recommendedExtras (1.0.3)",
    pairRec.rec.includes("vt-gray") && pairRec.rec.includes("vt-gray-dark") && pairRec.effective === "vt-gray", JSON.stringify(pairRec));
  await send("Page.navigate", { url });
  let readyQ = false;
  for (let i = 0; i < 80 && !readyQ; i++) { await sleep(250); readyQ = await evaluate(`return !!(window.__demo && document.querySelector(".smc-ctl button"));`).catch(() => false); }
  await sleep(800);

  console.log("\nC. demo/index.html?dir=rtl — the mirrored chrome passes the same checks");
  await send("Page.navigate", { url: `${url}?dir=rtl` });
  let readyR = false;
  for (let i = 0; i < 80 && !readyR; i++) { await sleep(250); readyR = await evaluate(`return !!(window.__demo && document.querySelector(".smc-ctl button"));`).catch(() => false); }
  await sleep(1200);
  const C = await runMapControlsConformance({ evaluate, click, key, log,
    tools: { search: true, locate: true, measure: true, draw: true, print: true },
    expect: { minLayers: 1, scale: { units: "both" } } });
  const rtl = await evaluate(`const c = document.querySelector(".smc-ctl").getBoundingClientRect(), box = document.getElementById("mapwrap").getBoundingClientRect();
    window.__demo.controls.openDrawer("layers");
    const d = document.querySelector(".smc-drawer").getBoundingClientRect(), g = document.querySelector(".smc-dgrip").getBoundingClientRect();
    return { dir: document.querySelector(".smc").getAttribute("data-smc-dir"), ctlLeft: Math.round(c.left - box.left), drawerLeft: Math.round(d.left - box.left),
      drawerRight: Math.round(d.right), gripX: Math.round(g.left + g.width / 2) };`);
  rec("RTL: cluster top-left, drawer opens to its right, grip on the drawer's right edge",
    rtl.dir === "rtl" && rtl.ctlLeft < 20 && rtl.drawerLeft > rtl.ctlLeft && Math.abs(rtl.gripX - rtl.drawerRight) <= 6, JSON.stringify(rtl));
  await sleep(400);
  await shoot("rtl-layers");
  await dragShot("drawer-resize-rtl");
  await send("Page.navigate", { url });
  let readyB = false;
  for (let i = 0; i < 80 && !readyB; i++) { await sleep(250); readyB = await evaluate(`return !!(window.__demo && document.querySelector(".smc-ctl button"));`).catch(() => false); }
  await sleep(800);

  console.log("\nB. remounted in-page — no tools, no scale bar, with a legend toggle (the complete default cluster)");
  const remounted = await evaluate(`return (async () => {
    const { mountMapControls } = await import("/dist/map-controls.js");
    const catalog = await import("/dist/basemaps.js");
    const d = window.__demo; const map = d?.map ?? null;
    d?.controls?.destroy();
    let legend = false, vis = true;
    const c = mountMapControls(map, { container: document.getElementById("mapwrap"), catalog, initialBasemap: "osm",
      layers: () => [{ id: "cities", title: "Cities", sublayers: [{ id: "cities-pt" }], visible: vis,
        setVisible: (v) => { vis = v; try { map?.setLayoutProperty("cities-pt", "visibility", v ? "visible" : "none"); } catch {} },
        legend: '<div class="ll-sq"></div> City', zoomTo: () => {} }],
      onFit: () => {}, onToggleLegend: () => { legend = !legend; }, legendOpen: () => legend });
    window.__conformanceB = c;
    return document.querySelectorAll(".smc-ctl").length; })();`);
  if (remounted !== 1) throw new Error(`remount left ${remounted} clusters`);
  const B = await runMapControlsConformance({ evaluate, click, key, log, tools: {}, expect: { minLayers: 1 } });

  const failed = A.failed + B.failed + C.failed + extraFail, passed = A.passed + B.passed + C.passed + extraPass;
  console.log(`\nconformance:demo — ${passed} passed, ${failed} failed (A ${A.passed}/${A.passed + A.failed}, A+ ${extraPass}/${extraPass + extraFail}, ` +
    `C ${C.passed}/${C.passed + C.failed}, B ${B.passed}/${B.passed + B.failed})`);
  exitCode = failed ? 1 : 0;
} catch (e) {
  console.error(`conformance:demo — could not run: ${e.message ?? e}`);
  exitCode = e.code === 2 ? 2 : 1;
} finally {
  cleanup();
}
setTimeout(() => process.exit(exitCode), 400);
