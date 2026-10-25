---
description: Create a new map specification (layers.json) from a set of layers, with an optional layout preset.
argument-hint: --layers <ids|urls> [--extent <bbox>] [--basemap <catalog id>] [--preset FullPage|MapInScroll|SplitDashboard|MultiMap]
---

Create or update a `layers.json` (the ESRI Web Map JSON map spec — see `@strata/schema`).

Steps:
1. Resolve each requested layer to an `operationalLayer`:
   - An ArcGIS `FeatureServer/N` URL → `layerType:"ArcGISFeatureLayer"`, `source.kind:"arcgis-feature"`.
     Verify it with `curl "<url>?f=json"` (confirm it returns JSON; note `geometryType`, `extent`, fields).
   - A Strata-served dataset id → `source.kind:"strata"`, `dataset:"<id>"`.
   - Pull the service's `drawingInfo` into `layerDefinition.drawingInfo` and `fields` into `layerDefinition.fields`.
2. Set `spatialReference` to `{ "wkid": 4326 }` and `initialState.viewpoint.targetGeometry` to the
   combined extent of the layers (or `--extent`), as an ESRI extent envelope.
3. Set `baseMap.baseMapLayers` from the **one basemap catalog**, `@strata/map-controls/basemaps` (33 keyless
   basemaps: OpenStreetMap · Esri · USGS · CARTO). **Default: OpenStreetMap** — `osm` for a light UI,
   `osm-dark` for a dark one (the same tiles, inverted). `@strata/core-map` builds the ESRI `BaseMap`:
   `baseMapFromPreset(basemapForTheme(mode))` (or `defaultBaseMap()` for light). With `--basemap <catalog id>`
   use `baseMapFromId(id)` — retired/legacy ids are accepted and resolve through `BASEMAP_ALIASES`
   (`resolveBasemapId`); write the resolved id. A vector entry becomes a `VectorTileLayer` + `styleUrl`, a
   raster one a `WebTiledLayer` + `templateUrl`.
   **Check the entry's licence tag** (`license` `commercial-ok` | `non-commercial`, `licenseNote`). Esri and
   CARTO entries are `non-commercial`: use one **only when the user asks for it and accepts the
   non-commercial terms** (CARTO needs an API key for licensed use) — say so before writing it. Never
   default to a keyed or proprietary provider; OpenFreeMap is deny-listed and must never be written.
   Licences and aliases: `strata/docs/guide/map-controls.md`.
   What you write here is the **authored** basemap: it wins on mount, and the app swaps to the paired
   basemap only when the reader actually changes theme mode.
4. If `--preset` is given, add a `strata:extensions.layout` hint (`preset`, `surfaces`).
5. Validate against `strata/packages/schema/src/layers.schema.json`. Write `layers.json` and show the result.

Never invent field names — read them from the service. Keep everything EPSG:4326.
