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
  layers.mjs          colour system, the map spec as genuine ESRI Web Map JSON (no basemap
                      list — the catalog owns basemaps; at most APP_RECOMMENDED_EXTRAS, ≤ 3 ids)
  map-controls/       VENDORED @strata/map-controls dist + VENDOR.json — never hand-edited
  server.mjs          zero-dep static server
  test-<domain>.mjs   LIVE      — arithmetic, service contracts, traps inverted
  test-render.mjs     OFFLINE   — node --check, then boot the shipped module against stubs
  drive.mjs           BROWSER   — real headless Chrome over CDP
  README.md           the record (building-apps.md §5)
```

`node strata/packages/map-controls/scripts/vendor.mjs <appDir>` (once, and after any library change) ·
`node server.mjs [port]` · `node test-<domain>.mjs` · `node test-render.mjs` · `node drive.mjs <port>` ·
`node strata/packages/map-controls/scripts/check-drift.mjs <appDir>`

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

### The map chrome — vendor `@strata/map-controls` and mount it (never hand-build it)
Every app gets the same fixed cluster — **zoom in · zoom out · home | layers · basemap · legend · full
screen**, top-right, never reordered or removed — plus one drawer (layer list or basemap gallery) and
`L`/`B`/`G`/`F`/`Esc`. The React path mounts it on every `<StrataMap>` (`props.mapControls`); here you
**vendor the package and mount it**. Do not write glyphs, `.mapctl` CSS, drawer logic or a basemap list —
that is the package's job, and a hand-built copy is what drifts. API + contract:
`strata/packages/map-controls/README.md`; what the reader sees: `strata/docs/guide/map-controls.md`.

**1 · Vendor.** `pnpm --filter @strata/map-controls build`, then
`node strata/packages/map-controls/scripts/vendor.mjs <appDir>` (or `pnpm --filter @strata/map-controls
vendor`) — copies `dist/` into `<app>/map-controls/` and writes `VENDOR.json`. Never edit those files; fix
the library and re-vendor. At that path the gallery thumbnails resolve by default — call
`catalog.setThumbBase("<path>/thumbs/")` only if you relocate them. A tile proxy or mirror is one hook,
`catalog.setUrlRewrite({ host: mirror })`.

**2 · Mount.**
```js
import * as catalog from "./map-controls/basemaps.js";
import { mountMapControls, basemapTransformRequest } from "./map-controls/map-controls.js";
// <link rel="stylesheet" href="map-controls/map-controls.css">
const controls = mountMapControls(null, {
  container: $("mapwrap"),                       // a positioned box around the map
  catalog,
  recommendedExtras: APP_RECOMMENDED_EXTRAS,     // optional, ≤ 3 catalog ids
  theme: { mode: S.mode },                       // later: controls.setTheme(mode) — Follow does the rest
  layers: layerDescriptors,                      // () => LayerDescriptor[], top first
  onRestyle: () => hydrate(),                    // setStyle dropped every source and layer
  onFit: () => fit(),                            // Home / F
  onToggleLegend: () => { $("legend").hidden = !$("legend").hidden; },
  legendOpen: () => !$("legend").hidden,
  fetch: (...a) => S.net.fetch(...a),            // Technical details go through THE seam too
  // tools: { measure: true },                   // ONLY if the recipe needs it — none by default
  // scale: true,                                // optional bottom-left scale bar ({ units: "imperial"|"both" }) — off by default
});
S.map = new maplibregl.Map({ container: "map", style: controls.initialStyle(),
  transformRequest: basemapTransformRequest(catalog) });   // lets a URL rewrite reach GL-style internals
controls.setMap(S.map);
```
Default basemap is `osm` (light) / `osm-dark` (dark), following the theme; pass `initialBasemap` or
`themeBasemaps` only when the recipe names others. **Tools (`search` · `locate` · `measure` · `draw` ·
`print`) are OFF unless the recipe's job needs one** — never enable them by default. If the app has its own
key handler, pass `keyboard:false` and delegate to `controls.handleKey(e)` / `controls.escape()`.

**3 · One `LayerDescriptor` per operational layer, top first.** Required: `id` (stable) · `title` (as the
reader knows it) · `sublayers: [{ id, opacity? }]` (the MapLibre layer ids it draws, bottom → top, with
their **authored** paint opacity — transparency multiplies it) · `visible` + `setVisible(on)` (the app owns
visibility; the list only asks). Optional: `sub` (one line of live state) · `swatch` / `legend` HTML
(`.ll-dots` / `.ll-sq` / `.ll-ramp`) · `zoomTo()` · `about` · `services` · `technical()`.
- **`about` = `{ what, publisher, current, coverage, inView, note }`, plain sentences for a non-GIS
  reader, taken only from the app's own recipe, README and the services it reads.** If the recipe does not
  say how current a layer is, **omit `current`** — an absent field is honest, an invented one is not. A
  layer with no single date is *said* to have none.
- **`services: [{ title, url, filter? }]`** feeds "Technical details", read live from `${url}?f=json`
  (one simple GET per URL per session — no custom headers). The object-id field shown is the service's
  own. For local files, `technical()` returns the same blocks derived from data the app already holds.

**4 · Re-add data after every restyle.** A basemap change is `map.setStyle()`, which drops **every**
source and layer. `onRestyle` must re-add each one **with its current data and filter** — not an empty
source, and not only the layers that exist at boot (a conditional underlay, a raster added later) — then
call `controls.applyLayerState()` so the reader's order, visibility and transparency survive. Also call
`applyLayerState()` after anything else (re-)adds a layer. The reference build lost its hazard polygons
this way: `hydrate()` re-created the hazard source empty, so after a basemap switch the polygons vanished
until the next pan while the status line still reported them drawn. Keep the last data in state
(`S.hazardFeats`) and `setData` it back on restyle. Guard `hydrate()` so it
does nothing when the style is intact (`setPaintProperty`/`setFilter` also fire `styledata`; an
unconditional repaint loops). **Overlays the list does not know (selection highlight, sketch, labels,
halo) go under the data after `applyLayerState()` — pass their ids as `topLayers: [...]` (bottom → top)
at mount; never hand-roll a "raise overlays" in `onRestyle`.**

**5 · `isBusy()` guards your clicks.** While Measure or Draw is open it owns map clicks: every identify,
selection and hover-cursor handler returns early when `controls?.isBusy?.()` is true. (Always false with
no tools — write the guard anyway, so turning a tool on later cannot break selection.)

**"Follow the theme" is the package's.** Resolve the mode in one place and tell it `controls.setTheme(mode)`;
the package keeps the authored basemap until the mode changes, swaps `osm` ↔ `osm-dark` (or the app's
pair), stops following on an explicit pick, and ticks the effective basemap. Don't keep a second resolver.

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
The vendored controls also call `getLayer` · `moveLayer` · `get/setLayoutProperty` · `get/setPaintProperty`
· `getCanvas` · `getContainer` · `zoomIn/Out` · `resize` — answer them (record, don't emulate).
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
| **offline** | `node --check` + its negative test · the signature loop · scope change recomputes the **reading** before repainting · selection survives its own click and releases · isolate changes the map, not the reading · caps stated · deep link round-trips · `Esc` unwinds one thing · **every panel has a grip, the drag clamps to its floor and ceiling, and the arrow keys size it** · **a row click adopts (flies + popup) and the same row clicked again releases (selection cleared, popup gone)** · **a legend click filters the layer rather than fading it, shift-click isolates, `Esc` clears** · **the vendored map controls boot against the stub, and after a `setStyle` every data layer is back with its data** (the `onRestyle` proof) · **identify/selection clicks are ignored while `isBusy()`** |
| **browser** | canvas non-zero **and** matching its container · **`runMapControlsConformance({ evaluate, tools, expect, log })`** from `strata/packages/map-controls/scripts/conformance.mjs` — the standard cluster in order, one drawer open at a time, the layer list and basemap gallery, exactly the recipe's `tools` and no others · a scale bar (`.smc-scale`) only when the recipe enables one (`expect: { scale: true }`), else none · **`check-drift.mjs <appDir>` passes** (the vendored copy is the library's) · a basemap switch keeps every data layer drawn · legend bottom-left · the app opens on a view where its signature is visible · both themes · console clean · **after dragging a panel the canvas still matches its container** (the `map.resize()` proof) · **basemap thumbnails actually load** (a 404 leaves identical grey boxes and every non-visual test green) |

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
- "the map controls / layer list / basemap gallery" → §2 The map chrome (vendor + mount); legend → The legend as a control surface
- "click a row to zoom to it" → §2 The row gesture (React path: shipped — `strata-panels`)
- "the data vanished after a basemap/theme switch" → §2 The map chrome, step 4 (`onRestyle` + `applyLayerState`)
- "clicking the map selects while measuring" → §2 The map chrome, step 5 (`isBusy()`)
- "the vendored controls look different / are stale" → re-vendor (`vendor.mjs`), then `check-drift.mjs`
- "how do I know it's done" → `strata/docs/guide/building-apps.md` §7
