# strata-data skill pack

Convert, publish, and update data on the Strata Serve server (`wt-server`).

## Tool cheatsheet
- `/convert <path>` — GDB/SHP/GeoJSON(both flavors)/ESRI JSON/CSV/KML → EPSG:4326 GeoParquet.
- `/publish <path> --config <server_config.toml> [--service --folder --layer-id --data-dir]` — full publish.
- `/update-symbology|/update-popup|/update-metadata <id>` — edit the metadata bundle + restart.
- `/add-data --url … [--secured] | --geojson … | --imageserver … | --cog …` — session add (not a publish).
- `/analyze <op> <layerId>` — run a Turf-backed spatial analysis (`@strata/processing`) and add the result
  as a layer: overlay (`union`/`difference`/`intersect`/`voronoi`/`convexHull`/`concaveHull`), `aggregate`
  (dissolve-with-stats), `hexbinDensity`/`hotspot` (Getis-Ord Gi*), `weightedOverlay` (suitability), and
  `isochrone` (drive/walk-time via `@strata/plugin-routing` `fetchIsochrone`, keyless Valhalla / keyed ORS).

## The publish model (ground truth)
Start: `wt-server <server_config.toml>` (required arg). Read-only; each layer = DuckDB view over a
GeoParquet file. Publish = place parquet (disk / `https://` / `s3://`) → add `[[duckdb.datasources]]`
block → write metadata bundle → **restart** (no hot reload) → validate.

Datasource block keys: `id` (unique; view `wt_<id>`), `service`, `folder`, `layer_id`, `layer_name`,
`path`, `geometry_column="geometry"`, `source_wkid=4326`, `object_id_field`, `layer_kind`,
`bbox_struct_column`, `layer_metadata_path`. URL: `…/rest/services/{folder}/{service}/FeatureServer/{layer_id}`.

Metadata bundle: `metadata.toml` (`description`, `displayField`, `tile_fields`, `[fields.<col>] alias`),
`drawingInfo.json`, `popupInfo.json`, optional `overrides.json`. Shared styles → `_defaults/{common,point,
line,polygon}/`; precedence: schema → `_defaults/common` → `_defaults/<geometry>` → layer bundle → overrides.

## Advanced feature ops + editing/attachments (`@strata/feature-arcgis`)
For query/statistics/related-records/**edits**/**attachments** against a FeatureServer, use
**`@strata/feature-arcgis`** (`queryFeatures`, `queryStatistics`, `queryRelatedRecords`, `applyEdits`,
`queryAttachments`) over `@esri/arcgis-feature-service`. It **works against BOTH Strata and Esri** (the
FeatureServer wire); Esri libs are **optional, lazy peer deps** so the lean core builds without them.

**Editing backend rule (important):** `applyEdits` needs a **writable + authenticated backend**. Auth is via
**`@strata/auth-arcgis`** (`createArcGISAuth` / `ArcGISIdentityManager` / `ApiKeyManager`) — **ESRI
Enterprise/Online backends ONLY**. `assertEsriBackend` **throws for a `strata` backend** (Strata Serve is
read-only and lacks portal auth; Strata editing is **planned**). Use `supportsArcGISAuth` to branch. So:
edit/attachment-*write* features are ESRI-only today; **read** query/stats/related/attachment-*view* work on
both. See `/edit`, `/attachments`. Never store or print passwords — mint a short-lived, referer-bound token.

## Recipes
1. **Publish a shapefile.** `/convert cities.shp` → `cities.parquet`; choose `service=admin folder=Saudi
   layer_id=0 id=admin_cities`; write block + bundle; restart; `curl .../FeatureServer/0?f=json`.
2. **Publish from a cloud bucket.** `path = "s3://bucket/fhsz.parquet"` (DuckDB httpfs) — no local copy.
3. **Restyle a live layer.** `/update-symbology admin_cities` → edit `drawingInfo.json` → restart.
4. **Edit an ESRI layer.** Confirm edit `capabilities` + auth via `@strata/auth-arcgis` → `EditPanel` →
   `applyEdits`. (Refuse if the target is Strata-served — read-only.)

## Known traps
- `objectIdField` is always `OBJECTID`; `object_id_field` only picks the source column. String id ⇒ omit it.
- No hot reload — always restart after a config/bundle change.
- `tile_fields` (MVT attributes) ≠ popup fields; keep small.
- Everything EPSG:4326.
