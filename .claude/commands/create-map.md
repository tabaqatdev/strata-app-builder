---
description: Create a new map specification (layers.json) from a set of layers, with an optional layout preset.
argument-hint: --layers <ids|urls> [--extent <bbox>] [--basemap <key>] [--preset FullPage|MapInScroll|SplitDashboard|MultiMap]
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
3. Set `baseMap.baseMapLayers`. Default to an **open-source, keyless** basemap, and prefer a **vector** one
   from `@strata/core-map` `VECTOR_BASEMAPS` (OpenFreeMap · Versatiles · CARTO GL — crisp at every zoom, and
   the only form with a real dark half). **Match it to the app theme**: for a dark UI use a dark vector style
   (`basemapForTheme("dark")` → OpenFreeMap Dark / Versatiles Eclipse), for a light UI a light one.
   `baseMapFromPreset(basemapForTheme(mode))` builds the ESRI `BaseMap` (a `VectorTileLayer` with `styleUrl`).
   `RASTER_BASEMAPS` (OSM, OpenTopoMap) are offered but are **not** a safe default: both answer HTTP 200 with
   a placeholder to a client they judge outside their usage policy. Only use `--basemap` to override; never
   default to a proprietary/keyed provider.
   What you write here is the **authored** basemap: it wins on mount, and the app swaps to the paired
   basemap only when the reader actually changes theme mode.
4. If `--preset` is given, add a `strata:extensions.layout` hint (`preset`, `surfaces`).
5. Validate against `strata/packages/schema/src/layers.schema.json`. Write `layers.json` and show the result.

Never invent field names — read them from the service. Keep everything EPSG:4326.
