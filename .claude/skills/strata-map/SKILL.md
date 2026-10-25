# strata-map skill pack

How to author a `layers.json` (the ESRI Web Map JSON map spec) and embed `<StrataMap>`.

## Tool cheatsheet
- `/create-map --layers … --preset …` — generate a spec.
- `/add-layer`, `/remove-layer`, `/reorder-layers`, `/set-extent`, `/set-basemap` — edit the spec.
- `<StrataMap maplibregl={…} config={layers.json} />` — render it (React).

## Recipes
1. **Full-page map from two ArcGIS services.** Verify each `?f=json`; build two `operationalLayers`
   (`arcgis-feature`); set `spatialReference {wkid:4326}`; set `initialState.viewpoint.targetGeometry` to
   the union extent; leave the basemap at the default — **OpenStreetMap (`osm`)**, paired with `osm-dark`
   for a dark theme. Every basemap comes from the **one catalog**, `@strata/map-controls/basemaps`
   (`BASEMAPS`: 33 keyless entries in four groups — OpenStreetMap · Esri · USGS · CARTO). Each entry carries
   a licence tag (`license`: `commercial-ok` | `non-commercial`, plus `licenseNote`/`licenseUrl`): Esri and
   CARTO are **non-commercial** (CARTO's terms need a key for licensed use), so check the tag before a
   business app ships. OpenFreeMap is deny-listed — never offer it. Preset `FullPage`.
2. **Strata-served layer.** `source:{kind:"strata", dataset:"fhsz"}`; the URL resolves on the Serve
   server; pull styling from the metadata bundle.
3. **Near-real-time layer.** Set `refreshIntervalSeconds: 300` on a live incident service.
4. **Raster imagery.** ESRI **ImageServer** → `source:{kind:"imageserver", url, renderingRule?, timeField?}`
   (the engine builds an `exportImage` tile source; `renderingRule` = band combo/stretch). A **COG**
   (cloud-optimized GeoTIFF) → `source:{kind:"cog", url}` rendered via the optional
   `@geomatico/maplibre-cog-protocol` (`cog://`). Add with `/add-data --imageserver` / `--cog`; recipe
   `imagery-viewer`. Time-animate a mosaic by driving the ImageServer `time` param from a `TimeSlider`.

## Reference (ESRI Web Map)
Top-level: `version`, `spatialReference`, `initialState.viewpoint.targetGeometry` (extent envelope),
`baseMap.baseMapLayers[]`, `operationalLayers[]`. Per layer: `id`, `title`, `url`, `layerType`, `source`,
`visibility`, `opacity`, `layerDefinition.definitionExpression`, `layerDefinition.drawingInfo.renderer`,
`popupInfo`, `fields`. App-proprietary data → `strata:extensions`.

## The standard map controls — fixed, mounted, never hand-built
**Layers and basemap belong on the map, not in the page header** — they change what the map shows, and a
reader looking at the map should not travel to the top of the page to change it.

Every Strata map carries the same chrome from one framework-free package, **`@strata/map-controls`**
(user view: `strata/docs/guide/map-controls.md`; full API + `LayerDescriptor` contract:
`strata/packages/map-controls/README.md`). **One cluster, top-right, always:**

```
zoom in · zoom out · home  |  layers · basemap · legend · full screen
```

It is **never reordered, moved or removed**, and there is never a second set of zoom buttons. **One
drawer** opens beside the cluster (never over it, one at a time) holding the Map Viewer-style **layer
list** (eye · legend chevron · drag · "…" → Zoom to layer · Layer information · Move up/down · Show legend ·
Transparency · Reset) or the **basemap gallery** (Follow the theme · Recommended 8 + ≤ 3 app extras · More
basemaps by provider · thumbnails · info tooltips · the basemap in force always ticked). Keyboard `L`
layers · `B` basemap · `G` legend · `F` home · `Esc` closes. Icons are **Lucide** (ISC), stroked in
`currentColor`; Esri's Calcite icons are not redistributed.

**Optional tools are OFF by default** — `search` · `locate` · `measure` · `draw` · `print`. Turn one on
only when the app's job needs it (a second cluster group, always in that order). An app with none gets no
tool buttons, listeners, sources or network calls. While Measure/Draw is open it owns map clicks and every
tool reverts to `identify` when it closes.

**The scale bar is optional too — OFF by default.** `mapControls.scale: true` (metric) or
`{ "units": "metric" | "imperial" | "both" }` adds one, fixed bottom-left (`.smc-scale`). Add it only
when readers need to judge distance off the map (field, site, survey, planning views).

**React path — `props.mapControls`.** `<StrataMap>` mounts the controls (through `MapChrome`, a thin
store-driven wrapper over the package) on every map. Configure it on the map widget — four keys, nothing
else (`MapControlsConfig`, `@strata/schema`; exact keys in `recipes/COMPONENT-MANIFEST.md` §3b):

```json
{ "type": "map", "props": { "mapControls": {
  "tools":   { "measure": { "units": "imperial" } },
  "basemap": { "initial": "osm", "recommendedExtras": ["esri-imagery"],
               "theme": { "follow": true, "light": "osm", "dark": "osm-dark" } },
  "scale":   true,
  "title":   "Parcel Viewer"
} } }
```

Omit `mapControls` entirely for the default cluster with no tools. **The legacy `controls` flags are
deprecated** (`legacyControlsToMapControls`): `navigation`/`basemapSwitcher`/`layerList`/`legend`/
`fullscreen` are always on (ignored) · `measure` → `tools.measure` · `sketch` → `tools.draw` ·
`geolocate` → `tools.locate` · `scale: true` → `mapControls.scale: true` · `cluster`/`position` ignored.
New apps write `mapControls` only; if both are set, `mapControls` wins. The standalone
`MeasureControl`/`SketchControl`/`NativeControls` are deprecated for the same reason — use the tools.

**House (vanilla) path — vendor and mount.** `node strata/packages/map-controls/scripts/vendor.mjs
<appDir>` copies the built package into `<app>/map-controls/` (with a `VENDOR.json`); import
`./map-controls/map-controls.js` + `./map-controls/basemaps.js` and call `mountMapControls(map, {
container, catalog, layers, onRestyle, onFit, theme, scale? })`, handing it one `LayerDescriptor` per layer. Never
hand-edit the vendored copy — `check-drift.mjs <appDir>` fails when it differs from the library. The
construction steps are in the `strata-app-build` skill.

**The tick names the effective basemap.** With "Follow the theme" on — the default — the gallery still
ticks the basemap actually drawn (legacy ids tick as their alias). "Follow the theme" says HOW the choice
is made; it does not stop there being a choice. The package does this; don't re-implement it.

**The basemap follows the theme, by default, in every app.** Flipping light↔dark (a `theme-switch`, or
the OS preference under `theme.mode:"auto"`) swaps the basemap to its pair — **`osm` ↔ `osm-dark`** by
default (the catalog's `THEME_BASEMAP` / `basemapForTheme(mode)`). On the React path `<StrataApp>` shares
the resolved mode and calls `store.setBaseMap(…, {transient:true})`; on the house path call
`controls.setTheme(mode)`. You do not wire the swap; you only respect its three rules: the **authored
`layers.json` basemap wins on mount** (the swap fires on a *change* of mode, never on first paint), an
**explicit pick outranks the theme** (it clears `store.baseMapFollowsTheme`), and the swap **never enters
the undo history or the saved spec**. `theme.basemap` `{follow:false}` pins the authored basemap;
`{light,dark}` names a specific pair of **catalog ids**. Every id resolves through `BASEMAP_ALIASES` /
`resolveBasemapId`, so a retired id (`openfreemap-positron`, `ofm-dark`, `versatiles-eclipse`,
`carto-dark-gl`, …) still renders as its survivor — write current catalog ids in new specs. Never answer
"which basemap for this mode" with your own table: the catalog's `basemapForTheme` is the one answer
(core-map's `basemapForThemeFrom(library, mode)` delegates to it for a custom library), so the gallery's
tick and the applied basemap can never disagree. Inside a `<StrataApp>` the chrome reads the mode itself;
pass `themeMode` only when embedding `<StrataMap>` on its own.

## Known traps
- Extent is an **envelope** `{xmin,ymin,xmax,ymax,spatialReference}`, not a bare `[w,s,e,n]`.
- Always set `spatialReference` explicitly (EPSG:4326).
- Read field names from the service — never invent them.
- **A failed async step during boot must not strand the map.** An unguarded `await` that rejects leaves
  a rendered shell with no data and no error — catch each boot step, report it in the notice bar, and
  keep the rest usable.
- **Open on a view where the app's signature is visible.** One build opened on its hierarchy root, which
  left the signature band empty and zero hatched blocks on screen — every non-visual test was green.
  Confirm by screenshot, not by reasoning.
- **A map built inside a `hidden` container has no size**, so its boot-time `fitBounds` computes against
  nothing and revealing the page resizes but never re-fits. **Fit on first reveal.** A canvas reporting
  `[0, 0]` is a layout problem, not a data one.
- **Fit to the subject, not to the items.** Fitting an item extent zoomed out to a whole region because
  the register publishes some features as city-spanning geometries; the subject was the search ring.
- **An explicit basemap choice must survive a theme swap** — re-pair the basemap only while the user has
  not chosen one. An unknown basemap id (from a stale link) falls back rather than blanking the map.
- **`beforeId` throws when the reference layer is absent** — true on the first hover before the map
  paints, and for a frame after a theme swap wipes the style.
- Full catalogue: `strata/docs/troubleshooting.md` §7.
