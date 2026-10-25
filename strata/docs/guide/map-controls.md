# The standard map controls

Every Strata map carries the same controls, in the same place, with the same behaviour — in a React
`<StrataApp>` and in a vanilla app alike. They come from one framework-free package,
**`@strata/map-controls`**; `@strata/core-map`'s `MapChrome` is a thin, store-driven wrapper over it.
This page is the user-facing view: what a reader sees, what an app may configure, and the rules around
basemaps. The full API — every option, return member and the `LayerDescriptor` contract — is the
package README, [`strata/packages/map-controls/README.md`](../../packages/map-controls/README.md).

## What a reader sees

**One cluster, top-right, always:**

```
zoom in · zoom out · home  |  layers · basemap · legend · full screen
```

It cannot be reordered, moved or removed — a map that looks the same in every app is a map nobody has to
learn twice. One **drawer** opens beside the cluster (never over it, one at a time) holding either the
layer list or the basemap gallery. Keyboard: `L` layers · `B` basemap · `G` legend · `F` home · `Esc`
closes (in a fixed order — below). Icons are Lucide (ISC licence); Esri's Calcite icons are
Esri-licensed and are not redistributed.

**Esc closes one thing at a time, topmost first (1.0.2; refined in 1.0.3).** One press closes, in this
order: the app's own popup, card or modal if it registered one (`closePopup`) → the map's popups (on the
next press, if the first closed the app's) → the active **tool** → the **drawer** → then whatever the
app adds after that (a filter sheet, a selection). The press that exits browser full screen does nothing
else — a short, **time-based** guard (`escapeGuardMs`, 300 ms) swallows any Esc in that window. An app
with Esc steps of its own calls `controls.escape()` first and runs its steps only when that returns
`false`; an app modal that must outrank the chrome is checked **before** `controls.escape()` (or
registered as `closePopup` — a MapLibre popup may be registered there too).

**Popups sit above the drawer (1.0.3).** A map popup is never hidden under an open drawer: it stacks at
`--smc-popup-z` (default 42), the cluster and the drawer grip one above it (43), so the controls stay
usable. In a vanilla app the popup card is themed to match the controls in light and dark
(`popupStyles`, on by default; an app's own popup CSS still wins). The stacking order, bottom → top:
map < app overlays (< 40) < drawer 40 < toast 41 < popup 42 < cluster + grip 43 < **app modals ≥ 50**.

**The drawer is resizable (1.0.2).** Like every Strata panel, the drawer has an edge grip on its outer
edge: drag it, or focus it and use ← / → (Shift for bigger steps, Home / End for the limits). The width
an app authors is where the drawer **opens**; the dragged width lasts for the session and is never saved
into the spec. Default limits 260–520 px; an app may lock it (`resizable: false`) only with a reason.
The grip announces the **real** limit (never wider than the map allows, 1.0.3), and ↑ / ↓ on it do
nothing (they no longer leak into the app's own key handling).

**Right-to-left pages (1.0.2).** On a `dir="rtl"` page the chrome mirrors itself: the cluster sits
top-**left**, the drawer opens to its right with the grip on the right edge, and chevrons point left.

**It stays on top and off the credits (1.0.2).** The cluster and drawer stack above typical app overlays
(`--smc-z`, default 40), the drawer stops short of the bottom so it never covers the map attribution
(`--smc-drawer-bottom`, default 44px), and an app's own global `button` styles no longer leak into it.

**The layer list** (Map Viewer style). Each row has an **eye** (visibility), a **legend chevron** (the
layer's own classes inline), a drag handle (order), and a **"…"** that opens inline actions:

| Action | What it does |
|---|---|
| **Zoom to layer** | Fits the map to the layer (disabled when the app gives the layer no zoom target). |
| **Layer information** | A plain-language **About** (what it is, who publishes it, how current, coverage) and **Technical details** read live from the service's own `?f=json` — fields, spatial reference, the object-id field *as the service declares it*, the active filter. |
| **Move up / Move down** | Keyboard-reachable reorder. |
| **Show / Hide legend** | The inline legend for that row. |
| **Transparency** | A slider; it multiplies the authored opacity, so a layer only ever gets fainter. The authored opacity may be a number or an expression (data-driven, or zoom-interpolated — 1.0.2); at 0 % the authored value is restored exactly. |
| **Reset** | Restores the authored transparency and order. |

**The basemap gallery.** A **Follow the theme** switch (on by default), a **Recommended** section — the
universal 8 plus up to 3 per-app extras, plus both halves of the app's theme pair when one is not among
them (1.0.3: a `vt-gray` / `vt-gray-dark` app sees both) — and a collapsible **More basemaps** grouped by provider
(OpenStreetMap · Esri · USGS · CARTO). Every card has a thumbnail and an info tooltip with a plain
description; the card in force is always ticked, even while the theme is choosing.

**The legend** — on `<StrataMap>` it sits bottom-right, open by default, and the cluster's legend button
(`G`) hides it. It is the interactive legend described in
[Components & widgets](../reference/components.md). (A vanilla app wires the button to its own legend
through `onToggleLegend`.)

## Optional tools — all OFF by default

`search` · `locate` · `measure` · `draw` · `print`. An app that enables none gets no tool buttons, no
listeners, no map sources and no network calls. Turn on only what the app's job needs; they form a second
cluster group, always in that order. While Measure or Draw is open it owns map clicks (identify pauses),
and every tool reverts to *identify* when it closes. The default geocoder is keyless Photon
(OpenStreetMap data).

## Optional scale bar — OFF by default

A **scale bar** is available on any map, fixed **bottom-left**, but no map gets one unless its app asks:
enable it only when readers need to judge distances off the map (field maps, site plans, survey and
planning views). Units: `metric` (the default, and what `true` means), `imperial`, or `both` (two stacked
bars). It is plain DOM (`.smc-scale`), follows the theme, and updates as the map zooms and pans.

## Configuring it — `mapControls`

An app configures the controls on its map widget as **`props.mapControls`** (`MapControlsConfig` in
`@strata/schema`, validated by `validateMapControls` / `validateAppLayout`). Four keys, nothing else:

```json
{ "type": "map", "props": { "mapControls": {
  "tools":   { "search": true, "measure": { "units": "imperial" } },
  "basemap": { "initial": "osm", "recommendedExtras": ["esri-imagery"],
               "theme": { "follow": true, "light": "osm", "dark": "osm-dark" } },
  "scale":   { "units": "both" },
  "title":   "Parcel Viewer"
} } }
```

- `tools` — opt in per tool (`true` or an options object). Unknown keys are rejected.
- `basemap.initial` — the basemap on first load (else the `layers.json` basemap, else the theme's).
  `basemap.recommendedExtras` — at most 3 ids added to Recommended. `basemap.theme` — the light/dark pair
  for this map; it overrides the app-level `theme.basemap`.
- `scale` — the optional scale bar: `true` (metric) or `{ "units": "metric" | "imperial" | "both" }`.
  Default `false`.
- `title` — the print title.

Exact keys and precedence: [`recipes/COMPONENT-MANIFEST.md`](../../../recipes/COMPONENT-MANIFEST.md) §3b
and §6c.

**The legacy `controls` flags still work but are deprecated** (`legacyControlsToMapControls`): `navigation`,
`basemapSwitcher`, `layerList`, `legend`, `fullscreen` are always on (ignored) · `measure` → `tools.measure`
· `sketch` → `tools.draw` · `geolocate` → `tools.locate` · `scale: true` → `mapControls.scale: true` (metric,
bottom-left) · `cluster` / `position` are ignored. When both are present, `mapControls`
wins.

## Basemaps — one catalog

The catalog (`@strata/map-controls/basemaps`, DOM-free) holds **33 keyless basemaps** in four groups. The
default is **OpenStreetMap (`osm`)**; the theme pair is **`osm` / `osm-dark`** (the same tiles, inverted
for dark). The authored basemap wins on mount, an explicit pick outranks the theme, and a theme swap is
never an undoable edit — see [Application design](app-design.md) for the theme rules.

**Licences.** Every entry carries `license` (`commercial-ok` | `non-commercial`), a one-sentence
`licenseNote` and the provider's `licenseUrl`. Check the tag before shipping a business app:

| Provider | Tag | The catch |
|---|---|---|
| OpenStreetMap, OpenTopoMap, VersaTiles | commercial-ok | Credit + fair use; the public servers are volunteer-run and rate-limited — heavy traffic needs its own tile server. |
| USGS The National Map | commercial-ok | Public domain; crediting USGS is requested. |
| Esri (public tiled MapServers) | non-commercial | Free only for public, non-commercial apps that credit Esri. |
| CARTO (GL styles only) | non-commercial | CARTO's terms require an API key for licensed use — so CARTO lives in *More*, never in Recommended, and no legacy id aliases to it. |
| OSM France (HOT, CyclOSM) | non-commercial | Community servers; a business app needs permission. |

OpenFreeMap is **not** offered and is on the deny-list. Never add a keyed or proprietary provider as a
default; offer one only when a user asks.

**The pair for faint shading — `vt-gray` / `vt-gray-dark`.** When an app's content is faint — a
choropleth, low-alpha (~40/255) fills, thin outlines — OpenStreetMap's colourful ground competes with it.
Set the theme pair to the quiet VersaTiles grays: `basemap.theme: { "light": "vt-gray", "dark":
"vt-gray-dark" }` in `mapControls` (or `themeBasemaps: { light: "vt-gray", dark: "vt-gray-dark" }` in a
vanilla app). Both are keyless, `commercial-ok`, and paired with each other, so Follow the theme swaps
them on a mode change; they are GL styles with their own fonts, so labels draw as usual. This is the
recommended pair for faint-shading apps.

**Retired ids keep working.** `BASEMAP_ALIASES` maps every retired or legacy id to its survivor —
`openfreemap-*` / `ofm-*` → `vt-gray` / `osm-dark` / `osm`, `versatiles-*` → `vt-colorful*`,
`carto-*-gl` → the VersaTiles styles, `opentopo` → `opentopomap`. A saved `layers.json` or
`theme.basemap` that names one still renders. `"none"` means a blank ground.

**Keyless is asserted as a behaviour** — offline host/deny-list guards in `pnpm test`, and a live two-tile
check (`pnpm --filter @strata/map-controls verify:basemaps`) that CI runs weekly
(`.github/workflows/basemaps-keyless.yml`). Why a URL check is not enough:
[Troubleshooting](../troubleshooting.md) §5.

**A tile proxy or self-hosted mirror** is one hook: `setUrlRewrite({ "tile.openstreetmap.org":
"https://tiles.example.com/osm" })` (or a function). Every URL the gallery loads goes through it; give
the map `transformRequest: basemapTransformRequest(catalog)` so it also reaches a GL style's tiles,
glyphs and sprite.

**Labels draw on every basemap (1.0.1).** A raster style has no fonts of its own, so before 1.0.1 an
app's `text-field` layers silently drew nothing on `osm`, Esri or USGS. Every raster (and `"none"`)
style the package builds now carries `glyphs: DEFAULT_GLYPHS` — the keyless VersaTiles endpoint the
VersaTiles GL styles already use; a GL basemap keeps its own. Give label layers
`"text-font": DEFAULT_TEXT_FONT` (`["noto_sans_regular"]`, or `DEFAULT_TEXT_FONT_BOLD`): the endpoint
serves one font per request, and MapLibre's default Open Sans stack 404s. An app with its own font server
passes `mountMapControls({ glyphs })`. Delete any app-side `map.setGlyphs()` workaround —
[Troubleshooting](../troubleshooting.md) §7.

**A basemap change is a full style swap (1.0.2).** The package calls `setStyle(style, { diff: false })`:
MapLibre's default diff could keep the previous style's font URL across a GL → GL swap (labels 404'd)
and sometimes skipped `style.load`. Remove any app wrapper that forced this —
[Troubleshooting](../troubleshooting.md) §7.

## Theming

Everything is scoped under `.smc`. Colours are `--smc-*` custom properties that fall back to the house
tokens of the same role (`--bg`, `--panel`, `--fg`, `--muted`, `--border`, `--accent`, `--shadow`,
`--motion`), so an app themed with the house tokens needs nothing extra. To map your own:

```css
.smc { --smc-bg: var(--my-surface); --smc-accent: var(--my-brand); }
```

Layout tokens, settable on `.smc` or any ancestor: **`--smc-z`** (default `40`, 1.0.2) — the
drawer's stacking order, above legends and status chips, below modals; **`--smc-popup-z`** (default
`--smc-z + 2`, 1.0.3) — map popups, with the cluster and grip one above; and
**`--smc-drawer-bottom`** (default `44px`) — the room kept under the drawer for the attribution and any
bottom-corner controls. Raise the second if the app has a taller bottom bar; the browser conformance
fails when the attribution is covered.

**Scrollers over the map paint an image fill (1.0.4).** The drawer and the themed popup card fill with a
one-colour gradient of their token — `linear-gradient(var(--smc-panel),var(--smc-panel))` — instead of a
plain colour. It looks identical; it stops Chrome's software compositor (GPU off, RDP, VMs, headless
`--disable-gpu`) from punching a blank box through the map, which it does for an opaque solid-colour
scroller over the canvas. Restyle those two through the tokens (`--smc-panel`, `--smc-popup-bg`) or the
`background` shorthand — a `background-color`-only override paints *under* the gradient and does not
show. Give the app's **own** scrollers over the map (legend, floating card, a popup capped with
`max-height` + `overflow:auto`) the same `linear-gradient(C, C)` fill. Symptom, cause and how to detect
it: [Troubleshooting §7](../troubleshooting.md).

## Vanilla apps — vendor the package

A no-build app **mounts** the package instead of hand-writing chrome: build it, copy `dist/` to
`<app>/map-controls/`, import `./map-controls/map-controls.js` and `./map-controls/basemaps.js`, and call
`mountMapControls` (pass `scale: true` or `scale: { units }` for the optional scale bar). Copied to that path the gallery thumbnails already resolve; anywhere else, call
`setThumbBase()` once. The app hands the module one `LayerDescriptor` per layer — how in
[Building an app](building-apps.md) and the package README.

**Overlays stay on top — `topLayers`.** The layer list re-stacks every layer it lists on top of the map,
so anything the app draws but does not list — a selection highlight, a sketch in progress, labels, a
halo — would sink beneath the data. Name those MapLibre layer ids (bottom → top) in the `topLayers`
option (`string[]` or a function re-read each time) and the package keeps them above every listed layer
after every reorder and every basemap change. It only moves them when they are actually out of order, so
it never sets off a redraw loop; the package's own measure / draw / locate / search graphics stay above
even these. In React, `MapChrome` takes the same `topLayers` prop. Details: the package README.

**Popups and Esc — `closePopup` (1.0.2).** MapLibre popups are closed by the package's Esc on its own.
If the app shows its own HTML popup or card, register it: `closePopup: () => { if (card.hidden) return
false; card.hidden = true; return true; }`. Then one Esc chain serves the whole app:
`if (controls.escape()) return;` followed by the app's own steps (mount with `keyboard: false` and route
keys through `controls.handleKey(e)` when the app has Esc steps of its own).

**Two maps — `maps` (1.0.2).** A side-by-side, inset or swipe layout passes its other map(s) as
`maps: [secondMap]` (or `controls.setSecondaryMaps()` later). A basemap change then restyles every map
(one `setStyle` each, `onRestyle(map)` called with the map that was restyled — re-add layers to that
map), and the layer list's order, visibility and transparency reach every map.
`onLayerStateChange({ order, opacity, visible })` reports each change made in the list. Drop any
hand-rolled two-map mirroring.

**Other 1.0.2 additions.** `controls.getOpenDrawer()`, `controls.getTheme()` (`getMode()` is the *tool*
mode), `controls.syncChrome()` to re-sync the Legend button after the app hides its legend itself (no
`renderChrome()` rebuild), and `onFit(event)` — Home receives the click, so shift-click can fit a wider
view. `runMapControlsConformance` now resets the chrome itself (drawers, *More basemaps*, popups) and
checks the drawer grip and that the attribution is uncovered.

**What 1.0.3 changes for a vanilla app.**

- *Esc is one layer per press:* when `closePopup` closes something, that press stops — the MapLibre popup
  closes on the next one. `controls.closePopups()` still closes everything at once. A popup opened with
  `closeButton: false` should be closed through `closePopup` (the package can only remove its element).
- *Popups:* themed and above the drawer with no app CSS; delete app dark-popup CSS and popup z-index
  overrides. Modals go at z-index 50 or more.
- *GL basemaps are asynchronous:* after a swap to a `vt-*` style, `map.getStyle()` and the sources you add
  are not there until the style has loaded — wait for `styledata` / `style.load` (your `onRestyle` already
  runs then). Headless Chrome can take more than 6 s to paint one; wait for `idle` before a screenshot.
  If the style never loads, the package falls back once to `osm` / `osm-dark` (`basemapFallback`,
  `basemapTimeoutMs`, `onBasemapFallback`) — delete app-side GL fallbacks.
- *Host checks:* a GL basemap's tiles, fonts and sprite are fetched in MapLibre's worker, so they never
  show in the page's network log — check `styleDelegateUrls(map.getStyle())` against `BASEMAP_HOSTS`,
  which now covers every host the catalog's GL styles use. Delete app allow-list extensions.
- *Drawer width:* `setDrawerWidth(px, "layers" | "base")` targets one drawer; without a drawer open and
  without `which`, it presets the next one to open. `drawerWidth()` is 0 without layout (jsdom).
- *`refreshLayers()`* re-renders only when the list changed — but call it when data changes, not on every
  `styledata` / `idle`.

---
*Esri, ArcGIS and CARTO are used nominatively to identify their services; strata-app-builder is not
affiliated with or endorsed by them.*
