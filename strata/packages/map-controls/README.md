# @strata/map-controls

Framework-free map chrome for MapLibre GL JS: one control cluster (zoom · home · layers ·
basemap · legend · full screen), one drawer beside it holding either the **layer list** or the
**basemap gallery**, keyboard shortcuts, **opt-in tools** (search · locate · measure · draw ·
print) and an **opt-in scale bar**. No React, no runtime dependencies (`maplibre-gl` is an optional peer, for your map only).
It works the same from a bundler (the React path) and **vendored as plain browser ES modules**
into a vanilla app with no build step.

The module knows nothing about any app's data. You hand it a map, the basemap catalog and a
function that returns `LayerDescriptor`s; everything app-specific arrives through those.

## Mount

```js
import maplibregl from "maplibre-gl";
import { mountMapControls, basemapTransformRequest, catalog } from "@strata/map-controls";
import "@strata/map-controls/map-controls.css";

const controls = mountMapControls(null, {
  container: document.getElementById("mapwrap"), // REQUIRED: a positioned box around the map
  catalog,                                        // REQUIRED: the basemap catalog namespace
  theme: { mode: "light" },                       // tell it about changes with controls.setTheme()
  layers: () => myLayers.map(toDescriptor),       // omit → no Layers button
  onRestyle: () => { reAddMyLayers(); controls.applyLayerState(); },
  topLayers: ["selection-halo", "selection", "sketch"], // optional: overlays kept above the data
  onFit: () => map.fitBounds(HOME),               // omit → no Home button
});
const map = new maplibregl.Map({
  container: "map",
  style: controls.initialStyle(),
  transformRequest: basemapTransformRequest(catalog), // lets a URL-rewrite rule reach GL-style internals
});
controls.setMap(map);
```

`map` may be passed straight to `mountMapControls(map, …)` if it already exists. A basemap change
calls `map.setStyle(style, { diff: false })` *(1.0.2: a full swap — a diffed GL → GL swap could keep
the old style's glyph URL, so labels 404'd, and might not fire `style.load`)*, which drops every source and layer — re-add yours in `onRestyle`, then call
`controls.applyLayerState()`.

**`topLayers`** — `string[] | () => string[]`, optional. `applyLayerState()` lifts every descriptor
sublayer to the top of the style, so a layer the app draws but does **not** list in a descriptor
(selection highlight, sketch / draw in progress, labels, a popup's halo) ends up **underneath** the
data. List those ids here, bottom → top, and they are put back above every descriptor layer at the end of
every `applyLayerState()` and after every `styledata` (setStyle / restyle). Ids not on the map are
skipped; a function is re-read on every pass (an overlay that appears mid-session). It is
**idempotent**: when the overlays already are the topmost layers in that order, **no** `moveLayer` is
called — so it cannot feed the `moveLayer` → `styledata` → `onRestyle` loop a hand-rolled
"raise my overlays" in `onRestyle` falls into. The order is read from `map.getLayersOrder()` (MapLibre
≥ 4), else `getStyle().layers`. The package's own tool graphics (measure / draw / locate / search marker)
always stay above even these. `controls.raiseOverlays()` re-asserts it on demand (e.g. right after you add
an overlay layer outside `onRestyle`); `keepOnTop(map, ids)` is the same check as a standalone export.

Other options: `recommendedExtras` (≤ 3 ids appended to the Recommended 8), `themeBasemaps`
(`{ light, dark }`), `initialBasemap` (alias-aware explicit pick), `defaultOrder`, `panelSettings`
(`{ html, onClick }`), `onToggleLegend` + `legendOpen`, `onBasemapChange`, `onError`, `tools`,
`scale`, `interaction`, `title`, `fetch`, `keyboard` (default `true`: L / B / G / F / Esc on `window`),
`labels`, `cluster` (an existing element), `drawer` (an existing element **or** the size options
below), `fullscreenTarget`, *(1.0.2)* `closePopup`, `escapeGuardMs`, `onDrawerResize`, `maps`,
`onLayerStateChange`, `dir`, and *(1.0.3)* `popupStyles` (default `true`), `basemapFallback`
(default `true`), `basemapTimeoutMs` (default `15000`), `onBasemapFallback`. The full contract is the header of `src/map-controls.ts`; every option
and return member is typed (`MapControlsOptions`, `MapControls`).

**Embedding hooks** (all optional — without them nothing changes), for an app whose own state is
the source of truth (the React `@strata/core-map` wrapper uses all three):

- `basemapHost: { apply(id, reason), current?(), onFollowChange?(on) }` — the module never calls
  `map.setStyle()`; it hands every basemap change to `apply` (`reason` = `"pick"` | `"follow"` |
  `"theme"`), ticks whatever `current()` says is drawn (alias-aware), and reports Follow flips.
- `layerState: { order(), opacity(id), setOrder(ids), setOpacity(id, v), resetOpacity?(id) }` — the
  list reads order (top first) and transparency from the owner, reports every change to it, and
  `applyLayerState()` stops writing order / visibility / transparency to the map.
- `themeBasemaps.follow: false` — the chrome re-colours on `setTheme()` but never swaps the basemap.

`mountBasemapGallery(element, { catalog, mode, current, follows, onPick, onFollowChange, … })`
renders the same gallery (Recommended / More, thumbnails, info tooltip, Follow switch) on its own —
e.g. inside a docked Basemap panel; `basemapGalleryHtml(catalog, view)` is its pure HTML.

`controls` exposes `setTheme(mode)`, `setBasemap(id | "auto")`, `getBasemap()`,
`effectiveBasemap()`, `styleFor(id)`, `initialStyle()`, `openDrawer("layers" | "base")`,
`closeAll()`, `escape()`, `handleKey(e)`, `refresh()`, `refreshLayers()`, `renderChrome()`,
`applyLayerState()`, `raiseOverlays()`, `setMap(map)`, `isFullscreen()`, `toggleFullscreen()`, `isBusy()`,
`getMode()`, `setMode(m)`, `tools`, `scale`, `state`, `LL`, `elements`, `destroy()` — and *(1.0.2)*
`closePopups()`, `syncChrome()` (alias `refreshChrome()`), `getOpenDrawer()`, `getTheme()`,
`drawerWidth()`, `setDrawerWidth(px)`, `setSecondaryMaps(maps)`, `getMaps()` — and *(1.0.3)*
`drawerWidth(which?)` / `setDrawerWidth(px, which?)`, `themeBasemap(mode?)`, `basemapFallback()`.

`getMode()` is the **tool** mode (`"identify" | "measure" | "draw"`); the theme is `getTheme()`
(or `state.mode`). `onFit(event)` receives the originating click / keydown, so shift-click on Home
can mean something different. When the app hides its legend from its own ✕, call
`controls.syncChrome()` to re-sync the Legend button's pressed state — no cluster rebuild needed.

**Theme rule.** Following the theme is the default: light → `osm` (OpenStreetMap), dark →
`osm-dark` (the same tiles, inverted). The authored basemap stands until the mode actually
changes; an explicit pick outranks the theme, and a paired pick swaps to its pair on a theme
change and stays explicit.

**The faint-shading pair.** An app whose content is faint — a choropleth, low-alpha shading, thin
outlines — reads better on a quiet ground. Pass
`themeBasemaps: { light: "vt-gray", dark: "vt-gray-dark" }`: both are keyless VersaTiles GL styles
tagged `commercial-ok`, paired with each other, so Follow the theme swaps `vt-gray` ↔ `vt-gray-dark`
(one `setStyle` with the style URL; a GL style keeps its own glyphs, so labels are unaffected).
*(1.0.3)* Both halves of the active theme pair always appear under **Recommended** — a member that is
not among the universal 8 (here `vt-gray-dark`) is appended after the app's extras — so no
`recommendedExtras: ["vt-gray-dark"]` is needed. The universal 8 itself is unchanged.

## Esc — one layer at a time, topmost first *(1.0.2, order refined in 1.0.3)*

One Esc closes **one layer of UI**, in this order, and `controls.escape()` returns `true` when it
consumed the key:

1. the press that exited native full screen is swallowed for `escapeGuardMs` (default 300; `0`
   disables the guard) — the browser owns that Esc. The guard is **time-based**: any Esc inside the
   window is swallowed, whichever key actually left full screen;
2. *(1.0.3)* the app's own popup / card / modal, registered with `closePopup: () => boolean` — when it
   returns `true`, **Esc stops there**. (1.0.2 closed it and every MapLibre popup on the same press.)
   A MapLibre `Popup` **may** be registered here too — and one opened with `closeButton: false`
   should be, since the module can only remove such a popup's element without telling MapLibre;
3. every MapLibre `Popup` on the map(s) — on the **next** press when step 2 closed something;
4. the active **tool** (Measure / Draw / Search…) — the map reverts to `identify`;
5. the **drawer** (Layers / Basemap).

An app modal that must outrank the chrome (a confirm dialog, a full-screen sheet) is checked
**before** `controls.escape()` in the app's chain — or registered as `closePopup`.
`controls.closePopups()` still closes **all** popups (the app's and MapLibre's) in one call.

The standard app chain is therefore `controls.escape()` first, then app-specific steps:

```js
window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (controls.escape()) return;      // popup → tool → drawer (keyboard:false apps call this)
  closeMyFilterSheet() || clearMySelection();
});
```

With `keyboard: true` (the default) the module listens on `window` itself, and an app listener on
the same event cannot tell whether the module consumed it. So an app **with Esc steps of its own**
mounts with `keyboard: false` and routes every key through one listener — `controls.handleKey(e)`
for L / B / G / F, `controls.escape()` first for Esc, as above.

**Closing MapLibre popups** *(1.0.3)*. MapLibre keeps no public list of popups, and MapLibre 4.7.1
has no private `map._popups` either. `closeMapPopups(map)` uses `_popups` where a build has it, then
finds every `.maplibregl-popup` left in the map container's DOM and presses its close button
(MapLibre's own handler: `remove()` + `close`); a popup with no close button has its element removed.

**Testing note — stubbing popups.** An offline harness can stub a popup either way: (a) list it on
`map._popups` with `isOpen()` / `remove()` (what MapLibre builds with the array do), or (b) render
`<div class="maplibregl-popup"><button class="maplibregl-popup-close-button"></button></div>` inside
the element `map.getContainer()` returns and remove it in the button's click handler. Prefer (b) for
MapLibre 4.7.1 fidelity; a stub button that does not remove its popup is removed by the module
anyway, and counted once.

## Popups — above the drawer, themed *(1.0.3)*

The module injects one stylesheet per document (`<style data-smc-popup-css>`, placed right after
`maplibre-gl.css`, else first in `<head>`):

- **always** — a MapLibre popup inside a container with controls stacks at
  `z-index: var(--smc-popup-z, calc(var(--smc-z,40) + 2))`, above the open drawer;
- **with `popupStyles`** (default `true`; `false` opts out) — a themed card keyed to the `--smc-*`
  tokens, so it follows the controls' light / dark mode: background, text, border, close button and
  tip (`--smc-popup-bg` / `--smc-popup-fg` / `--smc-popup-border` override just the popup), the
  layout rules `maplibre-gl.css` would give (for a page without it) and `table{color:inherit}` (for
  quirks-mode pages). Every selector is `:where()`-wrapped down to `.maplibregl-popup-content`'s own
  specificity, so it beats MapLibre's white card but an app's popup CSS that is more specific, or
  later in the page, still wins. App dark-popup CSS written for 1.0.2 becomes redundant.

The z-stack, bottom → top:

| layer | z-index |
| --- | --- |
| the map, app overlays (legends, chips, cards) | < 40 |
| drawer / tool panel (`--smc-z`) | 40 |
| toast | 41 |
| MapLibre popup (`--smc-popup-z`) | 42 |
| cluster + drawer grip | 43 (`--smc-popup-z` + 1) |
| **app modals** | **≥ 50 — use 50 or more** |

The cluster and the grip sit above the popup so a popup can never hide a control (the grip is 8 px
wide; the popup under it stays readable). An app that sets `z-index` on the map element itself
creates a stacking context that traps the popup below the drawer — leave the map element unstacked.

## Scrollers over the map use an image fill *(1.0.4)*

Under **software compositing** — GPU off or blocklisted, RDP, many VMs, headless Chrome with
`--disable-gpu` — Chrome treats an opaque **solid-colour** `overflow:auto|scroll` box that sits over
the MapLibre canvas as an *occluder*, and mis-places the occluded rect (~150–250 px off). The result
is a blank page-background box punched through the map, nowhere near the panel. A one-colour image
fill, `background: linear-gradient(C, C)`, is never an occluder and paints identically.

Since 1.0.4 the two library surfaces that are opaque, sit over the map and scroll use that form:

| surface | fill |
| --- | --- |
| `.smc .smc-drawer` (layer list, basemap gallery, tool panels) | `linear-gradient(var(--smc-panel),var(--smc-panel))` |
| `.maplibregl-popup-content` (the themed card, `popupStyles`) | `linear-gradient(var(--smc-popup-bg,…),var(--smc-popup-bg,…))` |

Colours, light / dark and RTL are unchanged — theme them through the same tokens (`--smc-panel`,
`--smc-popup-bg`, or the house `--panel` / `--bg`). **Override with the `background` shorthand or a
token, not `background-color`**: a `background-color`-only rule now paints *under* the gradient and does
not show. In script, read the colour from `getComputedStyle(el).backgroundImage` (its `backgroundColor`
is `transparent`). Give your **own** scrollers over the map (legends, cards, capped popups) the same
fill. Left solid on purpose: the cluster (`overflow:hidden`, never scrolls), the toast and the basemap
tooltip (not scrollers), the scale bar (translucent), and the rows inside the drawer (not scrollers).
Detecting it, and why a 1×1 screenshot hides it: `strata/docs/troubleshooting.md` §7.

## GL basemaps — loading, fallback, host checks *(1.0.3)*

- **A GL style is asynchronous.** After a basemap swap to a GL style (`vt-*`, `carto-*`),
  `map.getStyle()` and sources you add are **not** there synchronously — wait for the style
  (`map.once("styledata")` / `"style.load"`, or `map.isStyleLoaded()`) before reading it. Your
  `onRestyle` already runs at the right moment.
- **Headless Chrome is slow to paint a vector style** — more than 6 s is common. Wait for `idle` (with
  a generous timeout) before a screenshot or a pixel assertion.
- **Fallback.** A GL basemap whose style fails — an `error` before its style loads, or no style within
  `basemapTimeoutMs` (default 15 000; `0` = errors only) — is replaced **once per session** by the
  theme's raster pair (`osm` light / `osm-dark` dark): `onBasemapFallback({ from, to, reason,
  message })` is told, `onError` gets a line, `controls.basemapFallback()` reports it, and the gallery
  shows a note until the next pick. The pick itself is kept. `basemapFallback: false` opts out; it
  never applies with a `basemapHost`. App-side GL fallbacks become redundant.
  The fallback does **not** call `onBasemapChange` (the pick is kept), so an app that resets state
  there must also handle `onBasemapFallback`.
- **Host checks read the style, not the network log.** A GL basemap's tile, glyph and sprite requests
  run in MapLibre's **worker** and never appear in the page's resource timing. Check the active
  style's URLs instead: `styleDelegateUrls(map.getStyle())` (plus each source's TileJSON `tiles`)
  must all pass `BASEMAP_HOSTS` — which now covers every host the catalog's own GL styles delegate to
  (VersaTiles `assets/{styles,glyphs,sprites}/` + `tiles/osm/`; CARTO `tiles.basemaps.cartocdn.com`
  + `tiles-{a-d}.basemaps.cartocdn.com/vectortiles/`). App allow-list extensions become redundant.

## `refreshLayers()` — only when something changed *(1.0.3)*

`refreshLayers()` re-renders the open layer list **only when its HTML would change**, so a call that
changes nothing leaves the DOM (and a click or slider drag in progress) alone. Still, call it when
your data changes (a count, a filter) — not on every `styledata` / `idle`.

## The drawer — resizable by default *(1.0.2)*

The Layers / Basemap drawer has an **edge grip** on its outer edge (left in LTR, right in RTL): a
focusable ARIA `separator` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax`. Drag it, or
focus it and press ← / → (Shift = 48 px steps), Home / End for min / max.

```js
drawer: { width: 340, minWidth: 260, maxWidth: 520, resizable: true },   // all optional
onDrawerResize: (width, which) => {},   // side effects only (e.g. re-measure a neighbour)
```

The authored `width` is where the drawer **opens**; the dragged width is **session state** — kept
per drawer (Layers and Basemap separately) until reload, never written to the spec, the map or
storage. `resizable: false` locks it (give a reason in the recipe). The width is also clamped so the
cluster column stays clear (`100% − 56px`). `controls.drawerWidth()` / `setDrawerWidth(px)` read
and set it programmatically. Passing an element as `drawer` (1.0.1) still works.

*(1.0.3)* `aria-valuemax` is the **real** clamp — `min(maxWidth, container width − 56)`, never below
`minWidth` — re-read on every window / drawer resize, and End goes there. ↑ / ↓ on the focused grip
are swallowed (they no longer reach the app's key handlers or scroll the page). The grip stays a
child of the map container, laid over the drawer's edge, as in 1.0.2.
`setDrawerWidth(px, which?)` takes `"layers"` | `"base"` (`"basemap"` is an alias): it sets that
drawer's session width whether or not it is open. Without `which` it is the open drawer, as before —
or, **when no drawer is open, the next drawer to open** (once; `onDrawerResize` is told then).
`drawerWidth(which?)` reads it; it returns `0` without layout (jsdom) unless a width was set or
authored.

## Secondary maps *(1.0.2)*

Side-by-side, inset or swipe layouts pass the other map(s) as `maps: [secondMap]` (or later,
`controls.setSecondaryMaps([…])`):

- a basemap change is **one** `setStyle(style, { diff: false })` on each map, and `onRestyle(map)`
  is called once per map with that map — re-add your layers **to the map you are given**;
- `applyLayerState()` with no argument writes order / visibility / transparency to every map
  (`applyLayerState(map)` targets one); the descriptors' sublayer ids are expected on each map, and
  ids a map lacks are skipped;
- `onLayerStateChange({ order, opacity, visible })` is told after every change made in the layer
  list (eye, move, transparency, Reset, drag) — e.g. to mirror the state into a URL or a store;
- the tools stay on the primary map. With `basemapHost`, the host owns the basemap for all maps.

## RTL *(1.0.2)*

The cluster, drawer and grip use logical properties (`inset-inline-*`), so a page with `dir="rtl"` on
any ancestor mirrors them: the cluster sits top-**left**, the drawer opens to its right, the grip is
on the drawer's right edge (→ widens), and collapsed chevrons point left. The module stamps
`data-smc-dir="rtl" | "ltr"` on the container (read from the nearest `dir` attribute, else the
computed direction; force it with `dir: "rtl"`). Apps no longer mirror the chrome themselves.

## Transparency with expressions *(1.0.2)*

A sublayer's authored opacity may be a **number or an expression**. The layer list's transparency
`k` (1 = opaque) is applied as:

| authored | at transparency k |
|---|---|
| `0.6` | `min(0.6, 0.6 × k)` |
| `["get", "alpha"]`, `["case", …]` (data-driven) | `["*", <authored>, k]` |
| `["interpolate", t, ["zoom"], z0, v0, …]` / `["step", ["zoom"], v0, …]` | the same expression with every **output** multiplied — `["zoom"]` must stay the input of a top-level interpolate / step, so it is never wrapped |
| `{ stops: [[z, v], …] }` | the stop values multiplied |

At 0 % the **authored value is written back as-is** — the package never calls
`setPaintProperty(id, prop, undefined)` (an unset `line-opacity` left a MapLibre 4.7.1 line layer
drawing nothing). `scaleOpacity(authored, k)` is exported.

## The `LayerDescriptor` contract

One per operational layer, top first:

| field | | |
|---|---|---|
| `id` | required | stable across re-renders |
| `title` | required | as the reader knows it (clamped to 2 lines) |
| `sublayers` | required | `[{ id, opacity? }]` — the MapLibre layer ids it draws, bottom → top. `opacity = { "<paint prop>": authoredValue }` — a number or *(1.0.2)* an expression; transparency **multiplies** these, so a layer only ever gets fainter (see *Transparency with expressions*) |
| `visible` / `setVisible(on)` | required | the app owns visibility; the list only asks |
| `sub` | | one line of live state under the title |
| `swatch` / `legend` | | small symbol HTML (helpers `.ll-dots` / `.ll-sq` / `.ll-ramp`) / the inline legend HTML |
| `zoomTo()` | | "Zoom to layer" (disabled when absent) |
| `about` | | `{ what, publisher, current, coverage, inView, note }` — plain sentences ("Layer information") |
| `services` | | `[{ title, url, filter? }]` — "Technical details", read live from `${url}?f=json` once per URL per session (a simple GET, no custom headers) |
| `technical()` | | `[{ title, link?, source?, filter?, rows, fields, noFields? }]` — the same, for local data |

**Layers you don't list go under — use `topLayers` for overlays.** `applyLayerState()` moves every
listed sublayer to the top, in list order, so any MapLibre layer that is not a descriptor sublayer ends
up beneath all of them. That is right for an underlay; for an overlay (selection, sketch, labels, halo)
pass its id in the `topLayers` option instead of re-raising it yourself in `onRestyle`.

Everything a service returns is escaped; the object-id field is read from the service, never
assumed.

## Tools — all OFF by default

An app that passes no `tools` gets no tool buttons, listeners, map sources or network calls.
Enable only what you need; they form a second cluster group, always in the order
search · locate · measure · draw · print:

```js
tools: {
  search: true,   // or { provider: async (q) => [{ label, lng, lat, bbox? }], attribution, placeholder }
  locate: true,
  measure: true,  // or { units: "imperial" }
  draw: true,     // or { filename: "drawing.geojson" }
  print: true,    // or { title, filename }
},
interaction: { setMode: (mode) => { /* "identify" | "measure" | "draw" */ } },
```

The default geocoder is keyless Photon (OpenStreetMap data, credited in the panel). While Measure
or Draw is open they own map clicks: **your own identify/selection click handlers must return
early when `controls.isBusy()` is true.** Esc, the panel's close button, opening another tool or
a drawer all revert to `identify`. Print captures the canvas inside a `render` event, so the map
does not need `preserveDrawingBuffer`.

## Scale bar — OFF by default

Turn it on only for an app that needs it:

```js
scale: true,                    // metric (m below 1 km, else km)
scale: { units: "imperial" },   // ft below 1 mi, else mi
scale: { units: "both" },       // metric over imperial
```

It sits **fixed bottom-left** inside the container (`.smc-scale`, one `.smc-scale-line[data-unit]`
per unit), shows a rounded 1 / 2 / 5 × 10ⁿ distance no wider than 100 px (`maxWidth` to change it),
measured across the middle of the map like MapLibre's own scale (right under pitch), and
re-measures on every move, zoom and resize. It is plain DOM over the map — not a MapLibre control,
not a map layer — so a basemap change (`setStyle`) never drops it, and it re-themes with the rest
of the chrome (`--smc-*` tokens). `controls.scale` is its handle (`element`, `units()`,
`setUnits(u)`, `update()`, `lines()`), or `null` when it is off; `destroy()` removes it. The maths
is exported too: `niceNumber`, `metersPerPixel`, `scaleLine(s)`, `measureMap`.

## The basemap catalog

`@strata/map-controls/basemaps` (or the vendored `basemaps.js`) is DOM-free and imports nothing:

- `BASEMAPS` — **33 keyless basemaps** in four groups: OpenStreetMap · Esri (public tiled
  MapServers) · USGS The National Map · CARTO (GL vector styles only — the raster CDN watermarks).
- Licence tags on every entry: `license` (`"commercial-ok"` | `"non-commercial"`), a one-sentence
  `licenseNote` for a non-GIS reader and the provider's `licenseUrl`. Esri, CARTO and the OSM France
  hosts (HOT, CyclOSM) are `non-commercial`; OSM, OpenTopoMap, VersaTiles and USGS are
  `commercial-ok` (attribution and fair use still apply). Check the tag before shipping a business app.
- `BASEMAP_RECOMMENDED` (the universal 8) and `recommendedWith(extras)` (+ up to 3 app extras,
  alias-resolved, deduped).
- `BASEMAP_ALIASES` / `resolveBasemapId(id)` / `basemapById(id)` — retired and legacy ids
  (`ofm-positron`, `carto-dark`, `osm-fr`, …) map to their survivors; `"none"` means a blank ground.
- `THEME_BASEMAP` / `basemapForTheme(mode)` — the default pair, `osm` / `osm-dark`.
- `setUrlRewrite(fnOrHostMap)` / `resolveUrl(url)` — one hook for a tile proxy or self-hosted
  mirror; every URL the UI loads goes through it.
- `setThumbBase(base)` — where the gallery thumbnails live (default `"map-controls/thumbs/"`).
- `BASEMAP_HOSTS` (allow-list) and `BASEMAP_DENY` (deny-list) — the guards every URL must pass.
- `DEFAULT_GLYPHS` / `DEFAULT_TEXT_FONT` / `DEFAULT_TEXT_FONT_BOLD` *(1.0.1)* — every raster (and
  `"none"`) style `basemapStyle()` builds carries `glyphs: DEFAULT_GLYPHS`, the keyless VersaTiles
  endpoint `https://tiles.versatiles.org/assets/glyphs/{fontstack}/{range}.pbf`, so an app's
  `text-field` layers draw on any basemap (before 1.0.1 a raster style had no `glyphs` and labels
  silently never drew). The endpoint serves **one font per request**: give label layers
  `"text-font": DEFAULT_TEXT_FONT` (`["noto_sans_regular"]`) or `DEFAULT_TEXT_FONT_BOLD` — MapLibre's
  default Open Sans stack and comma-joined stacks 404. A GL basemap keeps its own glyphs; an app with its
  own font server passes `mountMapControls({ glyphs })`, which every raster style then keeps.

## Theming

Everything is scoped under `.smc` (put on the container). Colours are `--smc-*` custom
properties, each falling back to the house token of the same role (`--bg`, `--panel`, `--fg`,
`--muted`, `--border`, `--accent`, `--shadow`, `--motion`), then to a built-in light/dark default
(the module sets `data-smc-mode` from `theme.mode`). Map your own tokens after the stylesheet:

```css
.smc { --smc-bg: var(--my-surface); --smc-accent: var(--my-brand); }
```

*(1.0.4)* The drawer and the themed popup card paint their token as a one-colour gradient (see
*Scrollers over the map use an image fill*), so restyle them through the tokens or the `background`
shorthand — not `background-color`.

Layout tokens *(1.0.2)*, settable on `.smc` or any ancestor:

- `--smc-z` (default `40`) — the drawer's `z-index`, above typical app overlays (legends, status
  chips, floating cards) and below modals. The toast is `+1`, the info tooltip `+10`.
  Apps no longer need z-index hacks to lift the chrome.
- *(1.0.3)* `--smc-popup-z` (default `calc(var(--smc-z,40) + 2)`) — MapLibre popups in the container;
  the cluster and the drawer grip sit at `--smc-popup-z + 1`. See *Popups* for the whole z-stack —
  app modals belong at 50 or above.
- `--smc-drawer-bottom` (default `44px`) — the space kept free under the drawer, so a long gallery
  stops above the MapLibre attribution and bottom-corner controls. Raise it if your app has a taller
  bottom bar; `runMapControlsConformance` fails when the attribution is covered.

**App button styles do not bleed in** *(1.0.2)*. The package's button reset is `(0,2,1)`
(`.smc .smc-ctl button`, `.smc .smc-drawer button`) instead of zero-specificity, so an app's global
`button {}`, `button[aria-pressed]` or `button:hover` rules (≤ `0,1,1`) no longer restyle the chrome.
A rule with higher specificity (an id, or `button:hover:not(:disabled)` at `0,2,1` loaded after the
package) can still win — scope such rules to your own UI.

Icons are Lucide (ISC), stroked in `currentColor`.

## Vendoring into vanilla apps

A vanilla app (a static `index.html` plus ES modules, no bundler) does not copy or fork the
controls by hand: it **vendors the built package** into `<app>/map-controls/`, checks for drift,
and runs the shared browser conformance from its own harness. Three scripts, all dependency-free
Node (≥ 18.20):

### 1. Vendor — `scripts/vendor.mjs`

```
cd strata
pnpm --filter @strata/map-controls build
node packages/map-controls/scripts/vendor.mjs <appDir> [--dest map-controls] [--force]
#   or: pnpm --filter @strata/map-controls vendor -- <absolute appDir>
```

It copies `dist/*.js`, `dist/map-controls.css` and `dist/thumbs/*.png` (never `.d.ts` or source
maps) into `<appDir>/map-controls/`, deletes files a previous vendor left there that the current
build no longer ships, and writes `<appDir>/map-controls/VENDOR.json`:

```json
{ "package": "@strata/map-controls", "version": "1.0.4", "builtAt": "…", "vendoredAt": "…",
  "files": { "index.js": "<sha256>", "map-controls.css": "<sha256>", "thumbs/osm.png": "<sha256>" } }
```

It fails clearly when `dist/` is not built, never writes outside the dest folder (`--dest` must be
a relative folder inside the app), and refuses a non-empty dest without a `VENDOR.json` (a
hand-copied fork, or the wrong folder) unless you pass `--force`. Programmatic:
`vendor(appDir, { dest?, distDir?, force? }) → { dest, version, copied, removed, manifest }`.

The app then loads the vendored modules; with the default dest the thumbnail base already matches
(no `setThumbBase()` call needed):

```html
<link rel="stylesheet" href="map-controls/map-controls.css">
<script type="module">
  import * as catalog from "./map-controls/basemaps.js";
  import { mountMapControls, basemapTransformRequest } from "./map-controls/map-controls.js";
  // catalog.setThumbBase("vendor/mc/thumbs/");   // only if you vendored with --dest vendor/mc
</script>
```

`demo/index.html` does exactly this against `../dist/` with every tool on: build, then serve the
package folder (`cd strata/packages/map-controls && python -m http.server 8080`, or `npx serve .`)
and open `http://localhost:8080/demo/`.

### 2. Check drift — `scripts/check-drift.mjs`

```
node packages/map-controls/scripts/check-drift.mjs <appDir>... [--json] [--dest map-controls]
#   or: pnpm --filter @strata/map-controls check-drift -- <absolute appDir>...
```

Compares each app's `map-controls/` with the current `dist/` by sha256 (its `VENDOR.json` plus the
files actually on disk). One line per app:

| status | meaning | fix |
|---|---|---|
| `OK` | every shipped file present and byte-identical to the current build | — |
| `DRIFT` | same version, files differ: `modified` / `missing` / `extra`; `edited` = changed in the app since vendoring | re-vendor; put app-specific behaviour in mount options, never in the vendored files |
| `OUTDATED` | vendored from an older package version | re-vendor |
| `NOT-VENDORED` | no `map-controls/` folder, or one without `VENDOR.json` | vendor (`--force` over a hand-copied fork) |

Exit code 0 only when every app is `OK` (1 otherwise, 2 for a usage error or an unbuilt `dist/`), so
it drops straight into CI or an app's pre-ship gate. Programmatic:

```js
import { checkDrift } from "<repo>/strata/packages/map-controls/scripts/check-drift.mjs";
const r = checkDrift(appDir, distDir);   // distDir defaults to the package's dist/
// → { app, dest, status, vendoredVersion, currentVersion, modified, missing, extra, edited, detail }
```

### 3. Browser conformance — `scripts/conformance.mjs`

The same checks for every app, run from the app's **own** browser harness (framework-agnostic: the
harness supplies the page access):

```js
export async function runMapControlsConformance({
  evaluate,          // REQUIRED (jsSource) => Promise<any> — runs a function BODY ending in `return …`
  click,             // optional (selector) => Promise — a real click; default: element.click() in-page
  key,               // optional (k) => Promise, k ∈ "l" | "b" | "Escape"; default: a dispatched keydown
                     //   (cdpAdapters' key(k, { shift }) also knows ArrowLeft / Right / Up / Down,
                     //   Home, End, Shift — proper key / code / windowsVirtualKeyCode, no text)
  sleep,             // optional (ms) => Promise
  tools = {},        // the tools the app ENABLES: { search, locate, measure, draw, print }
  log,               // optional (line, result) => void, once per check
  expect = {},       // { home, layers, legend, fullscreen: true by default; minLayers: 0;
                     //   scale: false — true | { units } exactly when the app enables the scale bar;
                     //   resizable: true — false when the app mounts drawer: { resizable: false } }
  timeout = 5000,    // every wait polls until true or timeout — no fixed sleeps decide a result
  evaluateStyle = "body",   // "expression" if your evaluate takes an expression
}) // → { passed, failed, results: [{ name, ok, detail }] }
```

It asserts: exactly one `.smc-ctl` cluster; the default buttons in the fixed order zoom in · zoom
out · home | layers · basemap · legend · full screen, each drawing the package's own Lucide SVG;
tool buttons present **iff** enabled, after the defaults, in the order search · locate · measure ·
draw · print; **L** opens the layer list, **B** the basemap gallery, only one drawer is ever open,
**Esc** closes it, and the buttons do the same by click; the gallery opens with *Recommended*
(`osm`, `osm-dark` first), a collapsed *More basemaps* and a *Follow the theme* switch; when the
app has a layer, its row has the eye, the legend chevron (which toggles the inline legend) and the
"…" that toggles an inline section with zoom · info · up · down · legend · reset plus a
transparency slider; the full-screen button toggles `aria-pressed` (a browser that refuses full
screen in headless mode is tolerated, as long as the button never claims a state it is not in);
the scale bar `.smc-scale` is present **iff** `expect.scale` says it is enabled — and then it sits
bottom-left inside `.smc`, outside the cluster, with one line per expected unit, each a nice
1 / 2 / 5 × 10ⁿ distance. *(1.0.2)* The open drawer carries a focusable `.smc-dgrip` separator whose
Home / End / arrow keys resize it within `aria-valuemin`…`aria-valuemax` (iff `expect.resizable`), and
the MapLibre attribution is **not covered** by the cluster or the open gallery (skipped when the page
lays out no attribution).

*(1.0.2)* **The run resets the chrome itself** — it closes the drawer and any popup and collapses
*More basemaps* through the instance the package leaves on its container — and runs the
collapsed-More check on a **Recommended** basemap even when the app opened on `"none"` or a More
basemap (it picks OpenStreetMap for the check, then restores the app's basemap). Harnesses can drop
their own pre-run resets (`closeAll()`, `state.moreOpen = false`, a temporary basemap switch).
*(1.0.3)* Both halves of the theme pair are under Recommended, so an app on `vt-gray` / `vt-gray-dark`
no longer triggers that OpenStreetMap detour — and a new check asserts the pair is there.

It relies only on the package's stable DOM contract — `.smc-ctl button[data-act]` (`zin`, `zout`,
`fit`, `layers`, `base`, `legend`, `fullscreen`, `tool-<name>` + `data-tool`), `svg.smc-i`,
`.smc-drawer[data-which]`, `.bm-follow[role=switch]`, `[data-section="recommended"] [data-base]`,
`button[data-bmmore]`, `.ll-row[data-ll-id]` with `[data-ll-act="eye"|"expand"|"acts"]`,
`.ll-acts [data-ll-cmd]`, `input[data-ll-opacity]` and `.smc-scale[data-units] .smc-scale-line[data-unit]`. Changing any of these is a breaking change.

**Calling it from an app's `drive.mjs`** (the CDP harness pattern — `send` is the harness's
`send(method, params, sessionId)`; `cdpAdapters` turns it into real clicks and key presses):

```js
import { runMapControlsConformance, cdpAdapters } from "../../../strata/packages/map-controls/scripts/conformance.mjs";

head("Map controls conformance");
const { click, key } = cdpAdapters((method, params) => send(method, params, sessionId));
const mc = await runMapControlsConformance({
  evaluate,                                   // the harness's own: Runtime.evaluate of (function(){src})()
  click, key,
  tools: { search: true, measure: true },     // exactly what this app's mountMapControls enables
  expect: { minLayers: 1 },
  log: (line) => console.log(line),
});
pass += mc.passed; fail += mc.failed;
```

Adjust the import path to where the app sits relative to the repo. `scripts/conformance-demo.mjs`
(`pnpm --filter @strata/map-controls conformance:demo`, after a build) proves the checks on the
real package: it serves the package folder, opens `demo/index.html` in headless Chrome / Chromium /
Edge (`$CHROME_PATH`, else found on Windows, macOS or Linux) and runs the conformance twice — the
demo as shipped (all five tools, the scale bar in both units and a legend toggle: the complete
default cluster plus every option), then remounted in-page with no tools and no scale bar.
*(1.0.3)* It also proves, in real Chrome: Esc closes the app card, then the MapLibre popup, then the
drawer; a popup straddling a wide open drawer is on top of it while the grip stays on top of the
popup and still drags; the dark popup card is readable; `?pair=vt-gray` lists `vt-gray-dark` under
Recommended. `SMC_SHOTS=<dir>` writes screenshots; `SMC_PORT` / `SMC_CDP_PORT` pin the ports.

## Keyless policy

Every basemap must load without an API key, token or account. **Keyless is a behaviour, not a
URL**: some hosts answer HTTP 200 with a watermarked or "access blocked" placeholder that passes
every host, key-param and size check (`strata/docs/troubleshooting.md` §5). So:

- `pnpm test` asserts it offline — every URL on the host allow-list, none on the deny-list, no key
  params, no CARTO raster paths.
- `pnpm --filter @strata/map-controls verify:basemaps` asserts it live (needs a build): per raster,
  two **different** tiles — HTTP 200, image type, a usable CORS header, not a known placeholder;
  per GL style, the style parses and every host it delegates to (TileJSON, tiles, glyphs, sprite)
  answers without a key. Exits non-zero on any failure; a failing entry is retried once. CI runs it
  weekly and on PRs touching this package (`.github/workflows/basemaps-keyless.yml`).
- `pnpm --filter @strata/map-controls thumbs` re-verifies, then renders `thumbs/<id>.png`
  (200×134, California z4) through MapLibre in a local headless Chrome. **Look at a few tiles**
  before shipping a new provider — bytes cannot see a watermark.

Never add a keyed or proprietary provider as a default; offer one only when a user asks for it.

## Scripts

| script | |
|---|---|
| `build` | `tsc` → `dist/`, then `scripts/copy-assets.mjs` copies the CSS and thumbnails |
| `typecheck` / `test` | `tsc --noEmit` / Vitest (stub DOM + stub map; no network) |
| `verify:basemaps` | the live keyless check above |
| `thumbs` | verify, then re-render the thumbnails |
| `vendor` | `scripts/vendor.mjs <appDir>` — copy the build into `<appDir>/map-controls/` + `VENDOR.json` |
| `check-drift` | `scripts/check-drift.mjs <appDir>...` — OK / DRIFT / OUTDATED / NOT-VENDORED |
| `conformance:demo` | the browser conformance against `demo/index.html` in headless Chrome / Edge |

MIT. Esri, ArcGIS, CARTO and other marks are used nominatively to identify the services; this
package is not affiliated with or endorsed by their owners.
