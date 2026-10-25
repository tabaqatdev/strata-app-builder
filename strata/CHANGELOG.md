# Changelog

All notable changes to `strata-app-builder` are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed — `@strata/map-controls` 1.0.4: no blank box through the map under software compositing (2026-10-14)

- **The drawer and the themed popup card paint a one-colour gradient, not a solid colour.** Under
  software compositing (GPU off / blocklisted, RDP, VMs, headless `--disable-gpu`) Chrome treats an opaque
  solid-colour `overflow:auto|scroll` box over the MapLibre canvas as an occluder and mis-places the
  occluded rect (~150–250 px off), punching a blank page-background box through the map. `.smc .smc-drawer`
  (layer list, basemap gallery, tool panels) is now `background:linear-gradient(var(--smc-panel),var(--smc-panel))`
  and the `popupStyles` card (`POPUP_CSS`) `linear-gradient(var(--smc-popup-bg,…),…)` — the same colour,
  never an occluder. Light / dark and RTL unchanged.
- **One behaviour note:** an app rule that sets only `background-color` on the drawer or the popup card now
  paints *under* the gradient and does not show — restyle through the tokens (`--smc-panel`,
  `--smc-popup-bg`) or the `background` shorthand. `getComputedStyle(…).backgroundColor` on those two is
  `transparent`; read `backgroundImage` (the package's own `conformance:demo` now does).
- Left solid on purpose (not scrollers, or not opaque): the cluster (`overflow:hidden`), toast, basemap
  tooltip, scale bar (translucent), and the rows inside the drawer.
- Regression tests (`tests/v104.test.ts`) assert both surfaces use the gradient and never a plain `var()`
  fill. Trap entry: `docs/troubleshooting.md` §7. No app is re-vendored — `check-drift` reports vendored
  1.0.3 apps as `OUTDATED`, which is expected; the apps that hit it carry the same fix app-side.

### Changed — `@strata/map-controls` 1.0.3: what thirty vendored apps found (2026-10-13)

Backward compatible in API: every new option is optional and `setDrawerWidth(px)` keeps its 1.0.2
meaning with a drawer open. Two behaviour changes need a look when re-vendoring (Esc order, z-stack).

- **Popups above the drawer.** The module injects one `<style data-smc-popup-css>` per document (right
  after the MapLibre stylesheet — a `maplibre-gl.css` / mapbox-gl `<link>`, or a `<style data-maplibre-css>`
  inlined copy — else first in `<head>`; never after the app's own CSS, so app popup rules still win): a MapLibre popup inside the container stacks at
  `var(--smc-popup-z, calc(var(--smc-z,40) + 2))` — above the open drawer. The cluster and the drawer grip
  move to `--smc-popup-z + 1` (43) so neither is ever hidden by a popup. The z-stack is documented: map <
  app overlays < drawer 40 < toast 41 < popup 42 < cluster + grip 43 < app modals (≥ 50).
- **Themed popup cards in vanilla** — new `popupStyles` (default `true`): background, text, border, close
  button and tip from the `--smc-*` tokens (light / dark with the controls; `--smc-popup-bg/-fg/-border`
  override), the layout rules `maplibre-gl.css` would give, and `table{color:inherit}` for quirks mode.
  `:where()`-wrapped to MapLibre's own specificity, so an app's more specific or later popup CSS wins.
  New exports `POPUP_CSS`, `ensureMapControlsPopupStyles(doc)`.
- **The theme pair is always under Recommended.** A pair member outside the universal 8 (e.g.
  `vt-gray-dark`) is appended after the extras — no `recommendedExtras` needed; the universal 8 is
  unchanged. New `controls.themeBasemap(mode?)`, export `recommendedPlusPair()`; `mountBasemapGallery`
  follows the same rule. Conformance: a new check asserts the pair is under Recommended, so a
  `vt-gray` app no longer takes the OpenStreetMap detour in the collapsed-More check.
- **`BASEMAP_HOSTS` covers what the catalog's GL styles delegate to** — VersaTiles `assets/sprites/` and
  `tiles/osm/`, CARTO `tiles.basemaps.cartocdn.com/{gl,fonts,vector}/` and
  `tiles-{a-d}.basemaps.cartocdn.com/vectortiles/` (read from the live style JSONs' `sources`, TileJSON
  `tiles` and `sprite`). New export `styleDelegateUrls(style, tileJson?)`; an offline test checks every
  delegated URL of a recorded copy (`tests/fixtures/gl-style-delegates.json`), and `verify:basemaps`
  checks the live styles the same way.
- **Grip.** `aria-valuemax` is the real clamp, `min(maxWidth, container width − 56)` (≥ minWidth), updated
  on resize; End goes there. ↑ / ↓ on the focused grip are swallowed. The grip stays in the map container
  (thirty apps' tests find it there).
- **`setDrawerWidth(px, which?)`** — `"layers"` | `"base"` (`"basemap"` alias) sets that drawer's width
  open or not; with no drawer open and no `which` it applies to the next drawer to open (1.0.2 wrote it to
  the gallery's slot). `drawerWidth(which?)`; it is `0` without layout unless set or authored.
- **Esc closes one popup layer per press.** The app's `closePopup()` first — `true` stops there; MapLibre
  popups close on the next Esc (1.0.2 closed both at once). `closePopups()` still closes all.
- **`closeMapPopups` without `map._popups`** (MapLibre 4.7.1): popups are found in the map container's DOM
  and their close button pressed; a stub button that does not remove its popup is removed anyway.
- **GL basemap fallback** — new `basemapFallback` (default `true`), `basemapTimeoutMs` (15000),
  `onBasemapFallback({ from, to, reason, message })`, `controls.basemapFallback()`: a GL style that errors
  before loading (or does not load in time, on a real map) switches once to `osm` / `osm-dark`, with a
  note in the gallery. Never with a `basemapHost`; timers are `unref`'d in Node.
- **`refreshLayers()` re-renders only when the list's HTML changes**, so a click or slider drag in progress
  survives an app that calls it on every `idle`.
- **Conformance:** `cdpKeyParams` / `cdpAdapters().key(k, { shift })` know ArrowLeft / Right / Up / Down,
  Home, End, Shift (CDP `key`, `code`, `windowsVirtualKeyCode`, no `text` — sent as `rawKeyDown`); new
  `CDP_KEYS`. `conformance:demo` adds real-browser checks (Esc order, popup over a wide drawer with the
  grip above it and still dragging, readable dark popup, `?pair=vt-gray`), screenshots, and
  `SMC_PORT` / `SMC_CDP_PORT`.
- **React:** `MapChrome` passes `popupStyles` (default **false** there — `ensurePopupStyles` already
  themes `<StrataMap>` popups); the popup z-index applies either way.
- **Docs:** after a GL basemap swap `map.getStyle()` / new sources are not there synchronously (wait for
  `styledata` / `style.load`); headless Chrome can take > 6 s to paint a vt style; the z-stack (app modals
  ≥ 50); the full-screen Esc guard is time-based; a MapLibre popup may be registered as `closePopup`; an
  app modal that must outrank the chrome is checked before `controls.escape()`; GL tile requests run in
  the worker, so host checks read the style's URLs; `drawerWidth()` is 0 without layout; do not call
  `refreshLayers()` on every `styledata` / `idle`.
- **Migration (re-vendor with `scripts/vendor.mjs`):**
  - *Esc:* an app that relied on one Esc closing its card **and** the MapLibre popup now needs two;
    update driver / test expectations (`Esc #1` card, `#2` popup, `#3` drawer). Register a
    `closeButton:false` popup as `closePopup`.
  - *z-index:* the cluster is now 43 (was 40). App overlays above 40 that should cover the cluster, and
    app modals below 50, move to ≥ 50. Delete popup z-index overrides such as
    `.maplibregl-popup{z-index:calc(var(--smc-z,40) + 2)}`.
  - *Popup CSS:* app dark-popup CSS keyed to the theme becomes redundant — delete it, or keep it if it is
    the app's own look (more specific / later rules still win). A fixed `color` on
    `.maplibregl-popup-content` written for light mode now wins over the themed card and turns dark
    popups unreadable — remove it. Or pass `popupStyles: false`.
  - *Basemaps:* delete `recommendedExtras: ["vt-gray-dark"]` (or the pair's other half), app host
    allow-list extensions for VersaTiles / CARTO GL internals, and app GL → raster fallbacks.
  - *Drawer:* code that called `setDrawerWidth(px)` with no drawer open to preset the gallery width now
    presets whichever drawer opens next — pass `"base"` to keep 1.0.2's effect.
  - *Tests:* app tests asserting `aria-valuemax` "520" keep passing without layout; in a browser on a
    container narrower than 576 px it is now the real clamp.

### Changed — `@strata/map-controls` 1.0.2: the gaps the vanilla-app migration found (2026-10-13)

Backward compatible: every new option is optional, and a `drawer` element (1.0.1) is still accepted.

- **Esc closes a popup first, then panels.** `escape()` now runs: the post-full-screen guard (now
  `escapeGuardMs`, default 300, `0` disables) → every open MapLibre popup on the map(s) **and** the app's
  own popup via the new `closePopup?: () => boolean` → the active tool → the drawer. New
  `controls.closePopups()` and export `closeMapPopups(map)`. The standard app chain is
  `if (controls.escape()) return;` then app steps.
- **The Layers / Basemap drawer is resizable by default** — an edge grip on its outer edge (left in LTR,
  right in RTL), draggable and arrow-key operable (Shift ×3, Home / End), an ARIA `separator` with
  `aria-valuenow/min/max`. `drawer` now also takes `{ element?, width?, minWidth: 260, maxWidth: 520,
  resizable: true }`; the authored width is where it opens, the dragged width is session state (per
  drawer, never persisted). New `onDrawerResize(width, which)`, `controls.drawerWidth()` /
  `setDrawerWidth(px)`.
- **Basemap changes are `setStyle(style, { diff: false })`** — a GL → GL diff could keep the old glyph URL
  (labels 404) and skip `style.load`.
- **Transparency never unsets and understands expressions.** `applyLayerState()` writes the authored value
  back at 0 % instead of `setPaintProperty(…, undefined)` (which left a MapLibre 4.7.1 line layer drawing
  nothing); a data-driven opacity becomes `["*", expr, k]`, a zoom `interpolate` / `step` gets its output
  stops multiplied (zoom stays top-level), a legacy `{ stops }` function its stop values. New export
  `scaleOpacity(authored, k)`; `SublayerRef.opacity` values may be expressions (`OpacityValue`).
- **Layering & credits.** The cluster and drawer stack at `var(--smc-z, 40)` (was 5; toast +1, tooltip
  +10); the drawer's max-height stops `var(--smc-drawer-bottom, 44px)` above the bottom so it never covers
  the attribution. `runMapControlsConformance` checks that the attribution is not covered.
- **App button styles no longer bleed in.** The button reset is `(0,2,1)` (`.smc .smc-ctl button`, …)
  instead of zero-specificity `:where()`; every package rule styling a button class is element-qualified.
- **Secondary maps.** New `maps: [secondMap, …]` / `controls.setSecondaryMaps()` / `getMaps()`: one
  `setStyle` per map with `onRestyle(map)` called per map, and order / visibility / transparency applied to
  each. New `onLayerStateChange({ order, opacity, visible })`.
- **RTL.** Logical insets mirror the cluster, drawer and grip on a `dir="rtl"` page; chevrons flip; the
  module stamps `data-smc-dir` (option `dir: "ltr" | "rtl" | "auto"`). The scale bar's text stays LTR.
- **Small API gaps.** `getOpenDrawer()`, `syncChrome()` (alias `refreshChrome()`) to re-sync the Legend
  button without a rebuild, `getTheme()` (`getMode()` is the tool mode), and `onFit(event)` receives the
  originating click / keydown.
- **Conformance resets state itself** — closes drawers and popups, collapses *More*, and runs the
  collapsed-More check on a Recommended basemap (restoring the app's basemap) even when "none" is in force.
  New checks: the drawer grip (`expect.resizable`, default true) and the attribution. The demo now carries
  a hostile global button style, an inset secondary map, an app card registered as `closePopup`, a
  zoom-interpolated opacity and `?dir=rtl` / `?theme=dark`; `conformance:demo` adds real-browser checks
  for all of it, an RTL pass, and `SMC_SHOTS=<dir>` screenshots.
- **Faint-shading pair documented:** `themeBasemaps: { light: "vt-gray", dark: "vt-gray-dark" }` (keyless,
  commercial-ok, paired) for choropleth / low-alpha apps.
- **React:** `MapChrome` passes `closePopup`, `drawer`, `onDrawerResize`, `escapeGuardMs` and
  `onFit(event)` through, hands expression opacities to the package, and re-syncs the Legend button with
  `syncChrome()`.
- **Migration (re-vendor with `scripts/vendor.mjs`):** delete `setStyle` wrappers forcing `{ diff: false }`;
  replace `0.999` opacity workarounds with the authored value; drop z-index / max-height hacks on
  `.smc-ctl` / `.smc-drawer` (use `--smc-z` / `--smc-drawer-bottom`) and app button resets scoped to `.smc`;
  register HTML popups as `closePopup` and start the app Esc handler with `controls.escape()`; replace
  hand-rolled two-map mirroring with `maps`; delete app RTL mirroring of the chrome; replace
  `renderChrome()` legend re-syncs with `syncChrome()`; drop harness pre-resets before
  `runMapControlsConformance` (pass `expect.resizable:false` only if the app locks the drawer). Docs:
  the package README, `docs/guide/map-controls.md`, `docs/troubleshooting.md` §7 / §11.

### Fixed — `@strata/map-controls` 1.0.1: labels draw on raster basemaps (2026-10-12)

- **Every raster (and `"none"`) style `basemapStyle()` builds now carries `glyphs`.** Before, a raster
  style (`osm`, `osm-dark`, Esri, USGS, OpenTopoMap, OSM France…) had no `glyphs` property, so MapLibre
  refused any app symbol layer with a `text-field` and the labels silently never drew. The default is the
  new export **`DEFAULT_GLYPHS`** — the keyless VersaTiles endpoint
  `https://tiles.versatiles.org/assets/glyphs/{fontstack}/{range}.pbf` the catalog's VersaTiles GL styles
  already use. A GL basemap is still handed to MapLibre as its URL and keeps its own glyphs. The glyph URL
  goes through `setUrlRewrite` like every other basemap URL.
- **New exports `DEFAULT_TEXT_FONT` (`["noto_sans_regular"]`) and `DEFAULT_TEXT_FONT_BOLD`
  (`["noto_sans_bold"]`)** — the endpoint serves one font per request, so label layers must name one of
  them; MapLibre's default Open Sans stack and comma-joined stacks 404.
- **New option `mountMapControls({ glyphs })`** (and `basemapStyle(catalog, id, { glyphs })`): an app with
  its own font server keeps it on every raster style instead of having it clobbered by a basemap change.
- **`verify:basemaps`** also probes `DEFAULT_GLYPHS` as keyless: two different fontstack/range pairs, each
  HTTP 200 with CORS and a non-empty glyph protobuf, bytes differ.
- **Migration:** re-vendor (`scripts/vendor.mjs`); delete any app-side `map.setGlyphs()` / `LABEL_GLYPHS`
  workaround and use `DEFAULT_TEXT_FONT` as `text-font`. The React path (`MapController`) always created
  its map with glyphs and never `setStyle`s, so it is unchanged. Docs: `docs/troubleshooting.md` §7/§11.

### Added — the standard map controls (`@strata/map-controls`) and one basemap catalog

- **New package `@strata/map-controls`** — framework-free (no React, no runtime deps) map chrome:
  `mountMapControls`, a fixed cluster top-right (zoom in · zoom out · home | layers · basemap · legend ·
  full screen, Lucide icons), a Map Viewer-style layer list (eye, inline legend, drag, "…" → Zoom to
  layer · Layer information [plain About + Technical details read from the service] · Move up/down ·
  Show legend · Transparency · Reset), the basemap gallery (Follow the theme · Recommended 8 + ≤ 3 app
  extras · More basemaps grouped OpenStreetMap/Esri/USGS/CARTO · thumbnails · info tooltips;
  `mountBasemapGallery`), and opt-in tools — search · locate · measure · draw · print — **all off by
  default**. Embedding hooks `basemapHost` / `layerState`. Vendorable as plain ES modules (`dist/`).
- **One basemap catalog** (`@strata/map-controls/basemaps`): 33 keyless basemaps, each with `license` /
  `licenseNote` / `licenseUrl`; default `osm`, theme pair `osm` / `osm-dark`; `BASEMAP_ALIASES` for
  retired ids; `setUrlRewrite` / `resolveUrl` + `basemapTransformRequest` for a tile proxy or mirror;
  `setThumbBase`. CARTO GL entries are in *More*, tagged non-commercial ("requires a CARTO key for
  licensed use"), with no alias pointing at them; Esri entries are non-commercial; **OpenFreeMap is
  removed and deny-listed**. Weekly live keyless check: `verify:basemaps` +
  `.github/workflows/basemaps-keyless.yml`.
- **`@strata/schema`:** `MapControlsConfig` (`tools` / `basemap` / `title`) as the map widget's
  `mapControls` prop, `normalizeMapControls`, `validateMapControls`, `validateAppLayout`,
  `resolveMapWidgetControls`, and `legacyControlsToMapControls` + `LEGACY_CONTROLS_MAPPING` for the
  deprecated `controls` flags (`measure` → `tools.measure`, `sketch` → `tools.draw`, `geolocate` →
  `tools.locate`, `scale` → MapLibre's scale bar only; the rest always on or ignored).
- **`@strata/core-map`:** `MapChrome` is a thin store-driven wrapper over the package and `<StrataMap>`
  always mounts it; `BasemapPanel` renders the package gallery by default; `defaultBaseMap()` is `osm`.
  **Deprecated:** `OPEN_BASEMAPS` / `VECTOR_BASEMAPS` / `RASTER_BASEMAPS` (now a shim over the catalog),
  `NavigationControl` / `GeolocateControl` / `FullscreenControl`, `MeasureControl` / `SketchControl`,
  `CHROME_ICONS`, `MapChrome`'s `basemaps` / `position`.
- **Migration:** none required — legacy `controls` flags and retired basemap ids keep working. New apps
  author `mapControls`. Docs: `docs/guide/map-controls.md`. This supersedes the OpenFreeMap default
  described in the next entry.

### Changed — the default basemap is a keyless vector style, and "keyless" is now asserted as behaviour

> *Superseded by the entry above: the default is now OpenStreetMap (`osm`) from the one catalog, and
> OpenFreeMap is no longer offered.*

- **`defaultBaseMap()` returns OpenFreeMap Positron.** It used to return raster
  `tile.openstreetmap.org`, which answers **HTTP 200 with an *"Access blocked"* image** to a client it
  judges outside the OSMF tile-usage policy. `OPEN_BASEMAPS` is now `VECTOR_BASEMAPS` (OpenFreeMap
  Positron/Dark/Liberty · Versatiles Colorful/Eclipse · CARTO GL) followed by the new
  **`RASTER_BASEMAPS`** (OSM, OpenTopoMap) — offered, never defaulted to. A GL style is also the only
  form that gives a dark theme a real dark ground rather than a light one dimmed.
- **The three CARTO *raster* presets are gone.** `basemaps.cartocdn.com/{light_all,dark_all,rastertiles}`
  answers HTTP 200, `image/png`, with the real map and **"API KEY REQUIRED · carto.com/basemaps/apikey"
  composited diagonally across every tile**. It passed a host check, a `!key=` check and an
  `img.naturalWidth > 1` check; only a screenshot caught it. The CARTO **GL styles** are a different
  product, re-verified keyless end to end, and are kept — demoted below OpenFreeMap.
- **The basemap drawer previews a vector row.** `BasemapPanel` and `MapChrome` painted an empty box for
  every option without a `templateUrl` — the same wall of grey boxes the live-tile rule exists to
  prevent, arriving through a new door. New `useStyleColors` / `readStyleColors` read the style's own
  background, water and road out of its style document; `tileBackground` takes them and paints a
  gradient. Only a successful fetch is cached, so one bad minute on a tile host cannot blank a row for
  the life of the page.
- **New exports:** `RASTER_BASEMAPS`, `basemapUrl(preset)` (one place for a guard to read a preset's URL
  in whichever form it takes), `useStyleColors`, `readStyleColors`, `type StyleColors`.
- **The guard no longer greps for `key=`.** `tests/basemaps.test.ts` asserts the shape that cannot lie —
  every preset resolves to exactly one keyless https URL and carries exactly one of `style`/`templateUrl`,
  the default is a vector style, every preset credits OpenStreetMap, and a **deny-list** names every host
  already caught serving a placeholder. Positive proof stays behavioural (two different tiles must differ
  in bytes; a style must parse with every host it delegates to keyless too), because a unit test cannot
  see a watermark. Full entry: `docs/troubleshooting.md` §5.
- **Migration:** none required — `defaultBaseMap()` keeps its signature and an authored `layers.json`
  basemap still wins on mount. An app that hard-codes `carto-positron`, `carto-voyager` or `carto-dark`
  (the raster ids) must move to `openfreemap-positron` / `openfreemap-dark` / a `carto-*-gl` style.
  The `WebMaps/` starters and the eleven docs that named CARTO as the keyless house set were updated.

### Fixed — the legend, the layer list, and the popup now agree with the map

- **The popup is readable in a dark theme.** MapLibre paints `.maplibregl-popup-content` white and sets
  no `color`, so the text colour is inherited — `var(--strata-fg)`, which is near-white in every dark
  theme. Clicking a feature opened a popup that rendered white-on-white with a white tip on a dark map,
  and reported as *"the popup doesn't work"*. New **`ensurePopupStyles()`** (`engine/popups.ts`, injected
  by `initPopups`, so no app wires it) takes the card from `--strata-panel-bg`, the text from
  `--strata-fg`, the edge from `--strata-border`, repaints the tip for all four anchors and gives the
  close button an explicit colour. Every token keeps a light fallback, so an unthemed `<StrataMap>` is
  unchanged.
- **The legend follows the store, so showing/hiding a layer reaches it.** `Legend`'s `layers` prop is now
  **optional**: with it omitted the legend subscribes to the store — the same store the layer panel and
  the map-controls drawer write to — via the new shared **`useStoreLayers`** hook. An app-layout
  `{"type":"legend"}` widget previously received no `layers` at all (`<StrataApp>` threads
  `store`/`bus`/`outputs`, never `layers`), and one authored with an explicit array was a snapshot of the
  spec that no toggle could change. Pass an array only to list a deliberate subset.
- **The legend lists every visible layer, not every *styled* one.** A layer whose symbology belongs to
  the service (no authored `drawingInfo`), or one drawn by a renderer with no discrete classes, was
  silently dropped — while still drawing on the map. It now gets a row with its title and a **neutral**
  swatch (never an invented colour), rendered as a caption rather than a filter button since it has no
  classes to hide. `includeUnstyled:false` restores the strict symbology-key reading.
- **The layer panel shows each layer's symbology.** `LayerPanel` rows carried a generic `▤` glyph, so
  identifying which of five polygon layers was the blue one meant reading the legend. Rows now render the
  layer's own swatch — a class stack plus an `N ▸` that expands the full class list for
  `uniqueValue`/`classBreaks` — from the same `legendRows()` the Legend reads, so the two surfaces cannot
  disagree. `MapChrome`'s layers drawer likewise shows every class (capped, then `+N`) instead of only
  the first, which had named one of a renderer's ten colours and implied the layer was that colour.
- `Legend` now exports `Swatch`, `shapeForRenderer`, `shapeForGeometryType` and the `LegendRow` type, and
  memoizes its entries (they were a dependency of the `Esc` listener, re-subscribing it every render).

### Added — the map follows the theme
- **Switching light↔dark now swaps the basemap.** `<StrataApp>` resolves the app's theme mode once
  (`theme.mode`, with `"auto"` following `prefers-color-scheme`), shares it on `StrataAppEnv.themeMode`,
  and swaps the basemap to its pair when the mode changes. `theme-switch` reports every switch, so the
  UI and the map can no longer drift apart. Applies to every app with no wiring or config.
  - **The authored basemap wins on mount** — the swap fires on a *change* of mode, never on first paint,
    so a `layers.json` `baseMap` is never silently discarded.
  - **An explicit pick outranks the theme** — the basemap drawer and `BasemapPanel` now share **one**
    flag, `store.baseMapFollowsTheme`, instead of a local `auto` each.
  - **The swap is transient** — `setBaseMap(bm, { transient: true })` keeps a theme toggle out of the
    undo history and out of `toLayersJson()`.
  - `theme.basemap` (`ThemeSpec`) opts out or pins the pair: `{ follow:false }` / `{ light, dark }`.
- **`basemapForThemeFrom(library, mode)`** — the single resolver for "which basemap pairs with this
  mode", now used by the swap, `MapChrome`'s drawer and `BasemapPanel`. They previously disagreed (the
  drawer took the first preset of the mode, `basemapForTheme` preferred the vector one), so the drawer
  could tick one basemap while the map drew another.
- **`MapChrome`/`BasemapPanel` read the theme mode from the app** when no `themeMode` prop is given; the
  drawer used to default to `"light"` and tick the light basemap inside a dark app. `<StrataMap>` takes an
  explicit `themeMode` for use outside a `<StrataApp>`.
- **`applyBaseMap` is race-safe.** Vector basemaps load asynchronously while `clearBasemap` is
  synchronous, so a fast theme flip could let a superseded style paint over the winner; each application
  now takes an epoch per map and stale loads are dropped.

### Added — the house map chrome, an interactive legend, and the row gesture
- **`MapChrome` (`@strata/core-map` `react/controls/MapChrome.tsx`)** — the control vocabulary the shipped
  builds converged on, now in the library: one 32 px cluster (**zoom in · zoom out · fit · layers ·
  basemap · legend**, the six inline-SVG glyphs), MapLibre's own zoom suppressed, and **one** drawer
  opening beside the cluster. Layer rows are square checkboxes stating *off* / *N in view* / *none in
  this view*; basemap rows are **round radios** with a live tile of the current area in each style and a
  "Follow the theme" row. Keyboard `L`/`B`/`G`/`F`, `Esc` closes. **On by default** whenever
  `controls.navigation`, `layerList` or `basemapSwitcher` is set — `controls.cluster:false` restores the
  older always-open boxes. `controls.position` moves cluster and drawer together; geolocate/fullscreen
  move to the opposite corner.
- **The `Legend` is a control surface, not a caption** (`interactive`, default true): click a class to
  hide it, shift-click to isolate, `Esc` clears. It builds a genuine `definitionExpression` on the
  renderer's own field (`legendWhere` — `IN`/`NOT IN` for `uniqueValue`, range predicates for
  `classBreaks`) and applies it through `store.setDefinition`, so a legend row **filters rather than
  fades**. `counts` renders `n of N`, and the hint states that isolating changes the map, not the reading.
- **`BasemapPanel` is a radiogroup** — one basemap always in force and always ticked (including under
  "Follow the theme", where **both** rows tick), live tile thumbnails via `previewTile`/`tileBackground`,
  the new `map` and `themeMode` props, and the keyless house rule stated on the panel.
- **The table row is a toggle.** Clicking a row adopts the record — the map flies to **that feature**
  (not its layer's extent) and opens its `popupInfo`; clicking it again releases it, clearing the
  selection and closing the popup. The row carries `aria-selected`.
- **`initPopups` now returns a `PopupSurface`** — still callable as the dispose function, plus
  `showFeature(layerId, oid)` and `close()`, and it tracks one popup instance instead of leaking one per
  click. New exports `featureByOid` and `centroidOf`.
- **+38 tests** (`Legend.test.tsx` +20 incl. `MapChrome`, `BasemapPanel.test.tsx` +11,
  `AttributeTablePanel.test.tsx` +4, `storeBinding.busSink.test.ts` +3).

### Changed — the selection contract
- **`oids` are now `Array<number | string>`** across `@strata/state` (`Selection`), `@strata/actions`
  (`FeatureSelectPayload`, `HoverPayload`, `DataActionContext`, `ConnectOptions.onSelect`) and
  `LayerRegistry.highlight`. An object id is whatever the service says it is — real layers publish string
  keys (`troubleshooting.md` §1), and coercing them addressed the wrong rows with no error.
- **An empty `oids` is a RELEASE, not a no-op.** The map's bus sink clears the store selection, drops the
  highlight and closes the popup. `FeatureSelectPayload` gained `popup?`, and `zoom:true` now means *fly
  to the record*.

### Added — resizable panels
- **Every panel is now resizable, by default.** The dragged size is session state, so the authored width
  stays the source of truth and a reload returns to it.
  - **`PanelShell`** (the chrome under `LayerPanel`, `BasemapPanel`, `AttributeTablePanel`, `ChartPanel`,
    `CartoPanel`, `FilterPanel`, `QueryPanel`, `DateFilter`, `FeatureInfoPanel`, `AnalysisPanel`,
    `EditPanel`, `AttachmentViewer`, `AskPanel`, `SavedItemsPanel`) gained `resizable` (default `true`),
    `defaultHeight`, `minWidth`/`maxWidth` (200/960), `minHeight`/`maxHeight` (120/900) and `onResize`.
    A docked panel gets a width grip; a floating one adds a height grip and a corner.
  - **The `panel` container node** (`<StrataApp>`) gained the same behaviour plus `minWidth`/`maxWidth`
    in `@strata/schema`; `width` is now the **starting** size. The grip sits on the edge facing the
    content, so a right-docked panel grows leftward.
  - **Grips are keyboard-operable** — a focusable `role="separator"` sized with the arrow keys
    (`Shift` = 48 px step), because a 6 px pointer target excludes keyboard and touch users.
  - **`resizePanel`** — the pure, unit-tested clamp behind both surfaces (`react/app/splitterMath.ts`),
    which measures from the gesture's start so a drag past a clamp returns with the pointer.
  - Authoring surface updated to match: `/panel` (`--width`/`--min-width`/`--max-width`/`--no-resize`),
    the `strata-panels`, `strata-layout` and `strata-app-build` skills, `COMPONENT-MANIFEST.md`, all four
    reference views, `app-design.md` (house default + ship checklist) and `building-apps.md` (the shell,
    the harness assertions). The house pattern gets a vanilla `resizable()` recipe, since those apps have
    no React.
  - **+21 tests** (`PanelShell.test.tsx` 11 · `panel.test.tsx` +6 · `splitterMath.test.ts` +4).

### Added — the build pipeline
- **`/recipe` now builds a finished app**, not a scaffold: it checks the recipe against the contract in
  `recipes/README.md`, verifies every service before any code is written, builds, runs three harnesses
  (live · offline render · real headless Chrome over CDP), drives the result, and walks both gates.
- **`strata/docs/guide/building-apps.md`** — what a finished app is, the three-harness standard, the
  build gate, and the shipped interaction bar.
- **`strata/docs/how-to/find-and-verify-data.md`** — the house data defaults and the seven-step probe.
- **`.claude/skills/strata-app-build/`** — how to write the server, the injectable seam and all three
  harnesses. Instructions, not a library.
- **`strata/docs/troubleshooting.md`** grew from 30 to 535 lines: every trap that has cost a rebuild,
  status-marked, with §11 listing core defects whose old workarounds are now obsolete.

### Fixed
- The **OID rule** was stated absolutely in five places (`CLAUDE.md`, `agents/qa.md`, two skills, the
  component manifest). It is directional: guaranteed only on layers *you* publish; on any other service
  read `objectIdFieldName`. Real layers use `FID` while carrying a different column named `OBJECTID`.
- Test and package counts corrected everywhere: **796 tests**, verified by running them
  (`pnpm install && pnpm -r build && pnpm test` — the build step is required). The repo has **20
  packages**, of which **18 carry suites**; the count had been stated as 737/18 and 769/20 in different
  files, and none of the three matched the runner.
- **A resized panel no longer claims to be remembered.** The `strata-layout` skill said splitter and rail
  gutters persist to `localStorage` and reset on double-click; neither was implemented. The rule is now
  stated as it is built — session state, and an app that wants persistence owns it.

