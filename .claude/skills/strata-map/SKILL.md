# strata-map skill pack

How to author a `layers.json` (the ESRI Web Map JSON map spec) and embed `<StrataMap>`.

## Tool cheatsheet
- `/create-map --layers … --preset …` — generate a spec.
- `/add-layer`, `/remove-layer`, `/reorder-layers`, `/set-extent`, `/set-basemap` — edit the spec.
- `<StrataMap maplibregl={…} config={layers.json} />` — render it (React).

## Recipes
1. **Full-page map from two ArcGIS services.** Verify each `?f=json`; build two `operationalLayers`
   (`arcgis-feature`); set `spatialReference {wkid:4326}`; set `initialState.viewpoint.targetGeometry` to
   the union extent; use the default **OpenStreetMap** (open, keyless) basemap — open-source basemaps are the
default, OSM first (`OPEN_BASEMAPS`: OSM · CARTO Positron/Voyager/Dark · OpenTopoMap). Preset `FullPage`.
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

## Known traps
- Extent is an **envelope** `{xmin,ymin,xmax,ymax,spatialReference}`, not a bare `[w,s,e,n]`.
- Always set `spatialReference` explicitly (EPSG:4326).
- Read field names from the service — never invent them.
