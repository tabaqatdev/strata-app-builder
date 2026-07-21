---
description: Add a layer to the current map from an ArcGIS service (public or secured), a GeoJSON file/URL, an ESRI ImageServer, or a COG.
argument-hint: --url <FeatureServer/N> [--secured] | --geojson <file|url> | --imageserver <ImageServer> | --cog <geotiff-url>
---

Add a layer to the current map's `layers.json` (a *session* add — not a permanent publish; use `/publish`
for that).

- `--url <FeatureServer/N>` → validate with `curl "<url>?f=json"`, then add an `operationalLayer`
  (`source.kind:"arcgis-feature"`), pulling in `drawingInfo` + `fields`.
- `--secured` → for a token-protected service, mint a short-lived token via `{portal}/generateToken`
  (referer-bound). **Never send or store the password**; attach only the token.
- `--geojson <file|url>` → add a `source.kind:"geojson"` layer (inline data or URL).
- `--imageserver <ImageServer>` → **raster imagery** from an ESRI ImageServer (`source.kind:"imageserver"`,
  `url`). Optional `renderingRule` (band combo/stretch) and `timeField` for a time-animated mosaic; the
  engine builds an `exportImage` tile source (`buildImageServerTileUrl`).
- `--cog <geotiff-url>` → a **cloud-optimized GeoTIFF** (`source.kind:"cog"`, `url`) rendered directly via the
  optional `@geomatico/maplibre-cog-protocol` (`cog://`). Install that peer dep for COG support.

End-users can also add layers at runtime via the **`add-data` widget**. Set/extend `initialState.viewpoint`
to include the new layer's extent. Everything is EPSG:4326. Show the updated spec.
