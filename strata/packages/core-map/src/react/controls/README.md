# controls

On-map controls for `<StrataMap>` (§4.5). Thin React wrappers that mount MapLibre's native controls
(or a Terra Draw interaction) onto the live map. They render nothing of their own (MapLibre owns the
control DOM) except the measure/sketch toolbars and the Legend overlay.

Opt in via the `<StrataMap controls={{ … }}>` prop, or import a control directly to compose a bespoke
bar. Every control takes the injected `maplibregl` module and the live `map`; the Terra Draw controls
also take the `@strata/state` `store`.

## Implemented

- **`NavigationControl`** — zoom in/out + compass (`maplibregl.NavigationControl`).
- **`GeolocateControl`** — locate + track the user (`maplibregl.GeolocateControl`).
- **`FullscreenControl`** — toggle fullscreen (`maplibregl.FullscreenControl`).
- **`ScaleControl`** — scale bar (`maplibregl.ScaleControl`; `unit`, `maxWidth`, `position`).
- **`MeasureControl`** — distance / area via **Terra Draw + Turf**. Arming a measurement sets the
  store's `interactionMode` to `"measure"` and the crosshair cursor; on finish (or toggle-off /
  unmount) it **reverts the mode to `"identify"`** and restores the cursor.
- **`SketchControl`** — draw point / line / polygon via **Terra Draw**. Same mode discipline as
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
