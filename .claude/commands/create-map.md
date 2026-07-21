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
3. Set `baseMap.baseMapLayers`. Default to an **open-source, keyless** basemap. Prefer a **vector** basemap
   from `@strata/core-map` `VECTOR_BASEMAPS` (OpenFreeMap · CARTO GL · Versatiles — crisp at every zoom) and
   **match it to the app theme**: for a dark UI use a dark vector style (`basemapForTheme("dark")` →
   CARTO Dark Matter / Versatiles Eclipse), for a light UI a light one. `baseMapFromPreset(basemapForTheme(mode))`
   builds the ESRI `BaseMap` (a `VectorTileLayer` with `styleUrl`). Raster `OPEN_BASEMAPS` (OSM first) remain
   the safe fallback. Only use `--basemap` to override; never default to a proprietary/keyed provider.
4. If `--preset` is given, add a `strata:extensions.layout` hint (`preset`, `surfaces`).
5. Validate against `strata/packages/schema/src/layers.schema.json`. Write `layers.json` and show the result.

Never invent field names — read them from the service. Keep everything EPSG:4326.
