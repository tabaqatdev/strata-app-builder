# controls

On-map controls for `<StrataMap>` (§4.5).

**Every map carries the standard Strata map controls**, from the framework-free
[`@strata/map-controls`](../../../../map-controls/README.md) package: one fixed cluster top-right (zoom in ·
zoom out · home | layers · basemap · legend · full screen), one drawer beside it (the layer list or the
basemap gallery), keyboard `L`/`B`/`G`/`F`/`Esc`, and optional tools (search · locate · measure · draw ·
print) that are **off unless `mapControls.tools` enables them**, plus an optional scale bar (bottom-left,
**off unless `mapControls.scale` enables it**). `<StrataMap>` mounts it on every map; it
is configured by the map's `mapControls` prop (`MapControlsConfig` from `@strata/schema`). The legacy
`controls` flags are deprecated and mapped by `legacyControlsToMapControls` (`measure` → `tools.measure`,
`sketch` → `tools.draw`, `geolocate` → `tools.locate`, `scale` → `mapControls.scale` (the package scale
bar); the rest are always on or ignored). User-facing guide: `strata/docs/guide/map-controls.md`.

## The standard controls

- **`MapChrome`** — a thin React wrapper over `mountMapControls()`. It feeds the package one
  `LayerDescriptor` per operational layer (title, visibility, transparency, order, the legend from
  `drawingInfo`, zoom-to, the "about" text and the service URL for Layer information → Technical
  details), tells it the theme mode, and destroys it on unmount. **Store-driven** when given a `store`:
  visibility → `store.setVisibility`, transparency → `store.setOpacity`, order → `store.reorderLayers`
  (the package's `layerState` hook); a basemap pick → `store.setBaseMap` + `setBaseMapFollowsTheme(false)`,
  a theme swap → `store.setBaseMap(…, { transient: true })` (the `basemapHost` hook); a tool's mode →
  `store.setInteractionMode`, reverting to `identify` on close. Without a store it drives the map itself.
  Props: `{ map, store?, layers, baseMap?, themeMode?, themeBasemaps?, recommendedExtras?, tools?,
  title?, showLegend?, onToggleLegend?, onFit?, onZoomToLayer?, keyboard?, onInteractionMode?,
  topLayers?, onControls?, closePopup?, drawer?, onDrawerResize?, escapeGuardMs?, popupStyles? }`.
  `popupStyles` (map-controls 1.0.3) defaults to **false** here — `ensurePopupStyles` already themes
  `<StrataMap>` popups; the popup z-index above the drawer applies either way. `topLayers` (ids, bottom → top, or a function) keeps the app's own
  overlays — selection highlight, sketch, labels — above every operational layer (the package option). `basemaps` and `position` are **deprecated** and ignored (the gallery is the catalog;
  the cluster is fixed top-right); `CHROME_ICONS` is a deprecated export (icons now come from the
  package, Lucide).
- **`Legend`** — see below. On `<StrataMap>` it sits bottom-right, open by default; the cluster's legend
  button (`G`) hides it.

## Other controls (bespoke bars, back-compat)

Thin React wrappers that mount MapLibre's native controls (or a Terra Draw interaction) onto the live
map. They render nothing of their own (MapLibre owns the control DOM) except the measure/sketch toolbars
and the Legend overlay. Import one directly to compose a bespoke bar. Every control takes the injected
`maplibregl` module and the live `map`; the Terra Draw controls also take the `@strata/state` `store`.

- **`NavigationControl`** — *deprecated*: `<StrataMap>` no longer mounts it (the standard cluster owns
  zoom). Zoom in/out + compass (`maplibregl.NavigationControl`).
- **`GeolocateControl`** — *deprecated*: use `mapControls.tools.locate`. Locate + track the user
  (`maplibregl.GeolocateControl`).
- **`FullscreenControl`** — *deprecated*: full screen is in the standard cluster
  (`maplibregl.FullscreenControl`).
- **`ScaleControl`** — *deprecated*: `<StrataMap>` no longer mounts it — the scale bar is
  `mapControls.scale` (the `@strata/map-controls` scale bar), and the legacy `controls.scale` maps onto
  it. Scale bar (`maplibregl.ScaleControl`; `unit`, `maxWidth`, `position`).
- **`MeasureControl`** — *deprecated in favour of `mapControls.tools.measure`*; kept for bespoke tool
  bars and the `measure` widget. Distance / area via **Terra Draw + Turf**. Arming a measurement sets the
  store's `interactionMode` to `"measure"` and the crosshair cursor; on finish (or toggle-off /
  unmount) it **reverts the mode to `"identify"`** and restores the cursor.
- **`SketchControl`** — *deprecated in favour of `mapControls.tools.draw`*; kept for bespoke tool bars
  and the `draw` widget. Draw point / line / polygon via **Terra Draw**. Same mode discipline as
  measure (`"sketch"` while armed → `"identify"` on stop). Emits a GeoJSON `FeatureCollection` via
  `onChange`.
- **`Legend`** — swatch + label per renderer class, read from each layer's ESRI
  `drawingInfo.renderer` (`simple` / `uniqueValue` / `classBreaks`, plus a heatmap note). Exported
  helper `legendRows(layer)` returns the rows for custom layouts; `Swatch` / `shapeForRenderer` /
  `shapeForGeometryType` draw them.
  **`layers` is optional** — omit it and the legend reads the store's layers live (`useStoreLayers`),
  so any show/hide reaches it; a static array is a snapshot that cannot follow visibility. It lists
  **every visible layer**, giving one with no legendable renderer a neutral swatch and its title
  rather than dropping it (`includeUnstyled:false` opts out).

## Optional dependencies

`MeasureControl` / `SketchControl` need `terra-draw`, `terra-draw-maplibre-gl-adapter`, and
`@turf/turf` — declared as **optional peer dependencies** and **lazy-loaded** (see `terraDraw.ts`).
If any is missing the control degrades to a no-op with a single console warning; the rest of the map
is unaffected.

## The "return to identify" fix

The measure/sketch controls always route their teardown through a single `stop()` that resets both
the interaction mode (→ `"identify"`) and the canvas cursor (→ default) on finish, toggle-off, close,
and unmount. `<StrataMap>` also mirrors the store's `interactionMode` onto the cursor, so the map can
never be left stuck in a crosshair after a control closes.
