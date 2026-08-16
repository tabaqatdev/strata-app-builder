# strata-app-build skill pack

Construct and verify a finished app: the file layout, the injectable seam, and **how to write** the three
harnesses. Nothing here is a library to import — write these into the app you are building.

**Load this whenever an app is being built, not merely a map authored.** What a finished app *is* and the
gate it must pass: `strata/docs/guide/building-apps.md`. Traps: `strata/docs/troubleshooting.md`.

## 1. Cheatsheet

```
app/
  index.html          the app — theme tokens, the shell, ONE inline module ending in
                      globalThis.__app = api; if (!globalThis.__NO_AUTOBOOT) boot();
  <domain>.mjs        the domain. DOM-free. Every fetch through an injectable seam.
  layers.mjs          basemaps, colour system, the map spec as genuine ESRI Web Map JSON
  server.mjs          zero-dep static server
  test-<domain>.mjs   LIVE      — arithmetic, service contracts, traps inverted
  test-render.mjs     OFFLINE   — node --check, then boot the shipped module against stubs
  drive.mjs           BROWSER   — real headless Chrome over CDP
  README.md           the record (building-apps.md §5)
```

`node server.mjs [port]` · `node test-<domain>.mjs` · `node test-render.mjs` · `node drive.mjs <port>`

## 2. Recipes — write these

### The injectable seam (do this first; everything else depends on it)
The domain takes `net` as a parameter and the app keeps it **in state**, never as a module default.
```js
// <domain>.mjs — DOM-free
export async function fetchThing(net, url) {
  const r = await net.fetch(url, { ...deadline() });      // deadline: see below
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return assertShape(await r.json());
}
// index.html
const S = { net: { fetch: (...a) => fetch(...a) }, /* … */ };
async function boot(opts = {}) { S.net = opts.net ?? S.net; /* … */ }
// EVERY call site uses S.net. One that reaches for the module default makes the
// "offline" suite silently hit the internet — and its green then means nothing.
```

### Deadlines on every external call
```js
export const TIMEOUT_MS = 12000;
const deadline = (ms = TIMEOUT_MS) =>
  (typeof AbortSignal !== "undefined" && AbortSignal.timeout) ? { signal: AbortSignal.timeout(ms) } : {};
```
A dependency that neither answers nor refuses leaves a permanent "loading…" with nothing to report.

### The resizable panel — one helper, every drawer and rail
Panels size to the reader, not to the author (`building-apps.md` §1b). In the React path this is free;
here you write it once and call it per panel.
```js
// index.html — CSS: .panel{position:relative} .grip{position:absolute;inset-block:0;inset-inline-end:0;
//   width:6px;cursor:col-resize;touch-action:none} .grip:focus-visible{background:var(--accent)}
function resizable(panel, { min = 200, max = 960, onResize } = {}) {
  const grip = panel.querySelector(".grip");
  grip.tabIndex = 0; grip.setAttribute("role", "separator");
  grip.setAttribute("aria-label", `Resize ${panel.dataset.title ?? "panel"}`);
  const apply = (start, dx) => {                        // clamp from the START of the gesture, never
    const w = Math.max(min, Math.min(max, start + dx)); // the live width — else a clamped drag banks
    panel.style.width = `${w}px`;                       // the overshoot and lags the pointer coming back
    onResize?.(w);
  };
  grip.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const start = panel.getBoundingClientRect().width, from = e.clientX;
    const move = (ev) => apply(start, ev.clientX - from);
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  });
  grip.addEventListener("keydown", (e) => {             // a pointer-only grip is not an affordance
    const step = (e.shiftKey ? 48 : 16) * (e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0);
    if (!step) return;
    e.preventDefault();
    apply(panel.getBoundingClientRect().width, step);
  });
}
resizable(document.querySelector("#reading"), { min: 260, onResize: () => map.resize() });
```
**`map.resize()` after the box changes, or the canvas keeps the old width** — MapLibre does not watch its
container. Call it on every resize (it is cheap) or on the gesture's end; a canvas narrower than its
container is the visible symptom, and only the browser harness sees it.

Set `min` at the width the panel is still *readable* at. A floor is the honest version of truncating a
label to fit a size the user could have fixed themselves.

### The map chrome — one cluster, one drawer (the six glyphs, verbatim)
The React path ships this as `MapChrome`; here you write it. Keep the class vocabulary so the two look
identical: `.mapctl` (32px column, `top:9px right:9px`) · `.drawer` (`right:47px`, width 270) · `.opt`
rows · `.box` square (layers, multi-select) vs `.box.round` radio (basemap, one in force) · `.thumb`.
```js
const ICON = {
  plus:   '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  minus:  '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
  home:   '<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/></svg>',
  layers: '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  base:   '<svg viewBox="0 0 24 24"><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z"/><path d="M9 4v13M15 7v13"/></svg>',
  legend: '<svg viewBox="0 0 24 24"><path d="M4 6h4M4 12h4M4 18h4M12 6h8M12 12h8M12 18h8"/></svg>',
};
// .mapctl svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;
//   stroke-linecap:round;stroke-linejoin:round}   ← inherits the theme for free
// .maplibregl-ctrl-top-right{display:none}        ← exactly one set of zoom buttons
function openDrawer(which) {                       // ONE drawer: the same button closes it
  const d = $("drawer");
  if (d.dataset.which === which && !d.hidden) { d.hidden = true; d.dataset.which = ""; }
  else { d.dataset.which = which; d.hidden = false; renderDrawer(); }
  syncChromeState();
}
```
**Basemap rows are radios, and the tick names the EFFECTIVE basemap.** `b.id === chosen && !auto` ticks
nothing while "Follow the theme" is on — which is the default — so the drawer shows five options and none
selected, and the reader cannot tell which basemap they are looking at. Both rows tick.

**Each basemap row carries a live tile of the current view** in that style (`previewTile()` → z/x/y →
the row's own template URL). A colour swatch cannot tell Positron from Voyager.

### The legend as a control surface
```js
el.addEventListener("click", (e) => {
  if (e.shiftKey) S.isolated = S.isolated === row ? null : row;       // shift = isolate, toggling
  else { S.hidden.has(row) ? S.hidden.delete(row) : S.hidden.add(row); S.isolated = null; }
  renderLegend(); paint();                                            // one redraw, not five
});
```
Rows read `n of N` (never a bare filtered count), and the panel says in words that **isolating changes
the map, not the reading**. A legend row **filters, it does not fade** — a faded class is still
clickable, so a "hidden" feature can be selected through it.

### The row gesture — adopt, then release
```js
tr.onclick = () => {
  if (S.selected === id) { S.selected = null; popup.remove(); paint(); return; }  // release
  S.selected = id;
  const f = featureById(id);
  map.flyTo({ center: centroidOf(f), zoom: Math.max(map.getZoom(), 12) });        // the RECORD…
  popup.setLngLat(centroidOf(f)).setHTML(popupHtml(f.properties)).addTo(map);     // …and its popup
  paint();
};
```
Fly to the **record**, not to its layer extent — the user asked to see one feature. Keep **one** popup
instance so the release can close it, and mark the row (`aria-selected`) so the table shows which record
the map flew to.

### The zero-dependency server
```js
import { createServer } from "node:http"; import { readFile } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
const DIR = resolve(fileURLToPath(new URL(".", import.meta.url)));
// traversal guard: normalise AFTER decoding, then confirm containment
const target = resolve(join(DIR, normalize(decodeURIComponent(pathname))));
if (!target.startsWith(DIR)) { res.writeHead(403).end("forbidden"); return; }
// …and step past a busy port instead of dying on the demo's first command
server.on("error", (e) => { if (e.code === "EADDRINUSE" && ++tries <= 20) server.listen(++port); });
```
Import only `fs`/`http`/`path`/`url`. Open no sockets.

### `node --check` the shipped module — and negative-test the guard
```js
const html = readFileSync("index.html", "utf8");
const inline = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
function checkSyntax(src, tmp) {
  writeFileSync(tmp, src);
  try { execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" }); return { okay: true }; }
  catch (e) { return { okay: false, msg: String(e.stderr) }; } finally { unlinkSync(tmp); }
}
ok("the shipped module parses", checkSyntax(inline, ".__s.mjs").okay);
ok("…and the guard FAILS on a duplicate const",                       // negative test — required
   !checkSyntax(inline.replace("const S = {", "const S = 1; const S = {"), ".__n.mjs").okay);
```
A duplicate `const` has made an app a blank shell while a markup-grepping suite reported 99/99.

### The DOM stub — one stack-based parser for the body *and* every `innerHTML`
Support what the app actually uses: `#id` · `.class` · `tag` · descendant selectors (match the **last**
part) · `innerHTML` set/get (re-parse on set) · `textContent` · `firstElementChild` · `hidden` ·
`value` · `dataset` · `on*` handlers.
```js
class El {
  get textContent() { return this.children.length
      ? this.children.map(c => c.textContent).join("") + this.text : this.text; }
  set innerHTML(v) { this._html = String(v); this.children = parse(String(v)); this.text = ""; }
  all(sel) { const o = []; walk(this, e => matches(e, sel) && o.push(e)); return o; }
  querySelector(sel) { return this.all(sel.trim().split(/\s+/).pop())[0] ?? null; }
}
function parse(html) {           // stack-based; VOID tags never push
  const stack = [new El("#frag")];
  const re = /<\/?([a-zA-Z0-9]+)((?:\s+[a-zA-Z-]+(?:="[^"]*")?)*)\s*\/?>|([^<]+)/g;
  /* text → stack.at(-1).text; open → push unless void/self-closing; close → pop */
}
```
Mount the page's **real `<body>`**, not just what the script creates, and set `globalThis.window =
globalThis` — a separate `window` swallows the app's export hook.

### The MapLibre stub — dumb, except where the bugs live
```js
class MapStub {
  constructor(o) { this.sources = new Map(); this.handlers = {};
    for (const [id, s] of Object.entries(o.style.sources)) this.sources.set(id, new Src(s.data));
    setTimeout(() => this.fire("load"), 0); }
  setStyle(s) { this.fire("styledata"); this.sources.clear(); /* re-add */ }  // SYNC, then drops
  finishRender() { this.fire("idle"); }                                      // idle is real
  getSource(id) { return this.sources.get(id); }
  fitBounds(b, o) { this.calls.push(["fitBounds", b, o]); }                   // record, don't emulate
}
```
A stub that fires `idle` once from a timer reproduces neither the `idle → hydrate → paint → idle` loop nor
the source-drop on restyle.

### The CDP driver — headless Chrome over the DevTools Protocol, no dependencies
Node 20 has no global `WebSocket`, so hand-roll one over `net.Socket`:
```js
// handshake: send Sec-WebSocket-Key, then accept on "HTTP/1.1 101" + "Upgrade: websocket".
// Do NOT recompute Sec-WebSocket-Accept — that check defends against caching proxies, and you
// spawned this Chrome on loopback seconds ago. (Getting the magic GUID wrong costs an hour.)
// frames: client→server MUST be masked (0x81, 0x80|len, mask[4], payload^mask);
//         server→client are not. len 126 ⇒ readUInt16BE(2); 127 ⇒ readBigUInt64BE(2).
spawn(CHROME, ["--headless=new", `--remote-debugging-port=${P}`, "--disable-gpu",
               "--no-first-run", "--window-size=1440,900", `--user-data-dir=${tmp}`, "about:blank"]);
// poll http://127.0.0.1:P/json/version for webSocketDebuggerUrl, then:
//   Target.createTarget → Target.attachToTarget {flatten:true} → Page.enable, Runtime.enable, Log.enable
const evaluate = (expr) => send("Runtime.evaluate",
  { expression: `(function(){${expr}})()`, returnByValue: true, awaitPromise: true }, sessionId);
```
Collect `Log.entryAdded` (level `error`) and `Runtime.exceptionThrown` for the clean-console assertion.
**Wait for boot-time async work to settle** before judging — poll the status line until it stops saying
"loading"/"geocoding", or you assert against a half-booted page.

### What each harness must assert
| Harness | Must cover |
|---|---|
| **live** | the arithmetic · every trap **inverted** (a numeric id *must* throw) · service contracts (count agrees with ids, CORS posture) · the server opens no sockets · presentation contracts (keyless basemaps, no `esriSMSPath`, 4326) |
| **offline** | `node --check` + its negative test · the signature loop · scope change recomputes the **reading** before repainting · selection survives its own click and releases · isolate changes the map, not the reading · caps stated · deep link round-trips · `Esc` unwinds one thing · **every panel has a grip, the drag clamps to its floor and ceiling, and the arrow keys size it** · **a row click adopts (flies + popup) and the same row clicked again releases (selection cleared, popup gone)** · **a legend click filters the layer rather than fading it, shift-click isolates, `Esc` clears** · **exactly one basemap row is ticked, including under Follow-the-theme** |
| **browser** | canvas non-zero **and** matching its container · exactly one control cluster (six glyphs, MapLibre's own zoom gone) · the drawer clears the cluster geometrically and **only one is open** · legend bottom-left · the app opens on a view where its signature is visible · both themes · console clean · **after dragging a panel the canvas still matches its container** (the `map.resize()` proof) · **basemap thumbnails actually load a tile** (a 404 leaves five identical grey boxes and every non-visual test green) |

## 3. Reference

**Assertion helper** — the same three lines in every suite:
```js
let pass = 0, fail = 0;
const ok = (l, c, d = "") => { c ? pass++ : fail++;
  console.log(`  ${c ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗"} ${l}${d ? ` — ${d}` : ""}${c ? "" : "\x1b[0m"}`); };
const eq = (l, a, b) => ok(l, a === b, `got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
// end: console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
```

**Booting the shipped module offline** — write the extracted inline script to a temp `.mjs` beside the app
so its relative imports resolve, import it with a cache-busting query, then `unlink`:
```js
writeFileSync(tmp, inline);
try { await import(pathToFileURL(tmp).href + "?t=" + Date.now()); } finally { unlinkSync(tmp); }
const api = globalThis.__app;            // set globalThis.__NO_AUTOBOOT = true before importing
```

**Globals the stub must provide:** `document` · `window` (= globalThis) · `maplibregl` · `matchMedia` ·
`history.replaceState` · `location` · `addEventListener`.

## 4. Known traps

- **A guard can match the file it guards.** Strip comments before any textual scan — this has bitten twice,
  on `proxy` and on `createConnection`, both matched in the sentence saying the file does *not* use them.
  Prefer asserting behaviour over scanning text at all.
- **An "offline" suite is only offline if every call routes through the seam.** One stray module-level
  `net` returned a real place for a synthetic fixture.
- **A markup-grepping suite cannot see whether the app runs.** Hence `node --check`.
- **Two green suites can still ship a dead app.** 99 passing assertions have coexisted with a page stuck at
  "loading…" forever — no deadline on an external call. Only the browser found it.
- **A boot-time `await` that rejects strands the app** — catch each step, report it, keep the rest usable.
- **The harness accommodates the app, not the reverse.** If a selector breaks the stub, fix the stub.
- **A resize that clamps against the live width lags the pointer.** Drag past the ceiling and back and the
  panel trails by however far you overshot, because each step re-clamps an already-clamped number. Measure
  once at `pointerdown` and apply the total delta to *that*.
- **A resized panel leaves the map canvas at its old size** until something calls `map.resize()`. Both
  non-visual harnesses report green — the DOM width is right, the arithmetic is right, and the map is
  visibly wrong. This is one of the defects only the browser suite can see.
- **Assert shape, not fixed counts,** against a live feed that changes between runs.
- **Derive every count from state.** A hardcoded total moves silently when a category is added.
- **Never fabricate.** No data ⇒ render empty with the citation.

## 5. Question patterns

- "build the app / run this recipe" → §1 layout, then `/recipe`
- "how do I test it" → §2 What each harness must assert
- "the offline test hits the network" → §2 The injectable seam
- "the page is blank but tests pass" → §2 `node --check`
- "it works in the test but not the browser" → §2 The CDP driver · deadlines
- "the map is empty / wrong size" → browser harness · `troubleshooting.md` §7
- "make the panels resizable" → §2 The resizable panel (React path: it already is — `strata-panels`)
- "the map controls / legend / basemap panel" → §2 The map chrome · The legend as a control surface
- "click a row to zoom to it" → §2 The row gesture (React path: shipped — `strata-panels`)
- "the basemap drawer shows nothing selected" → §2, the effective-basemap tick
- "how do I know it's done" → `strata/docs/guide/building-apps.md` §7
