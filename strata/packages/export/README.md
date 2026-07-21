# @strata/export

Map export for strata-app-builder. Reused by the open-data hub (downloads, thumbnails, "open this map") and any
app.

| Function | Status | Notes |
|---|---|---|
| `exportSpec(config)` | implemented | Shareable ESRI Web Map JSON (`layers.json`) — re-openable, round-trips to ArcGIS tooling. |
| `exportImage({map, format})` | implemented | Data URL from the MapLibre canvas (create the map with `preserveDrawingBuffer:true`). |
| `exportPDF({map, title, attribution})` | implemented | Dependency-free browser print layout (title + map image + attribution) → "Save as PDF". Needs `preserveDrawingBuffer:true`. |
| `exportLayerData(id, {format, map, data})` | implemented | `geojson` / `csv` Blobs from the layer's live GeoJSON. `geoparquet` is served by the Strata export endpoint (server-side). |

Driven by the `/export` command. See `../../docs/how-to/export-maps.md`.
