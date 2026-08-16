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

## Verify before you bind — not after

`?f=json` alone is not verification. Before a field name from this layer reaches the app, run the probe in
`strata/docs/how-to/find-and-verify-data.md` §2 and confirm:

- **The OID** — read `objectIdFieldName`; never assume `OBJECTID`. Real services answer `FID` while
  carrying a *different* column named `OBJECTID`, or report `null` (bind read-only).
- **Count *and* ids agree** — `returnCountOnly` can return `{"count":0}` with HTTP 200 against real rows.
- **The real page size** — ask above `maxRecordCount` and use whatever comes back. Paging against the
  size you *requested* truncates silently, always in the flattering direction.
- **The fields are populated** — `WHERE f IS NOT NULL AND f <> ''`. A published field can be blank on
  every row, and that finding often reshapes the app rather than being worked around.
- **CORS posture** — no `Access-Control-Allow-Origin`, or a 403 on preflight, means curl works and the
  browser will not. That decides browser-direct vs proxy vs convert-and-publish (§3 of the same doc).
- **Group layers** (`geometryType: null`, `/query` → 400) are not addable — use their children. A service
  that publishes no coordinates is **not mappable**: say so rather than adding a layer that paints nothing.

Report anything that disqualifies the layer instead of quietly routing around it.
