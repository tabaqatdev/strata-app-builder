---
description: Publish a dataset to the Strata Serve server as a FeatureServer layer.
argument-hint: <dataset-path|s3://…|https://…> --config <server_config.toml> [--service <name>] [--folder <name>] [--layer-id <n>] [--data-dir <dir>]
---

Publish a dataset to the Strata Serve server (`wt-server`). The config TOML path is REQUIRED.

Steps:
1. **Convert if needed** → EPSG:4326 GeoParquet, English `snake_case` fields. Use `.claude/scripts/convert.sh`
   (ogr2ogr for File GDB / Shapefile; direct for GeoParquet; normalize ESRI GeoJSON / ESRI JSON).
   Keep `OBJECTID` semantics correct (a string id ⇒ omit `object_id_field`).
2. **Place the parquet** — leave in place, copy to `--data-dir`, or reference a cloud URL (`https://…`, `s3://…`).
3. **Choose** a globally-unique `id`, plus `service`/`folder`/`layer_id` (URL becomes
   `…/rest/services/{folder}/{service}/FeatureServer/{layer_id}`).
4. **Write the `[[duckdb.datasources]]` block** into the config TOML (use `.claude/scripts/write_datasource.sh`):
   `id`, `service`, `folder`, `layer_id`, `layer_name`, `path`, `geometry_column="geometry"`,
   `source_wkid=4326`, `layer_metadata_path=<metadata-root>/<id>`.
5. **Write the metadata bundle** at `layer_metadata_path`: `metadata.toml` (description, `displayField`,
   `[fields.*] alias`, `tile_fields`), `drawingInfo.json`, `popupInfo.json`. Reuse `_defaults/` for shared
   styles. (Author these with `/update-symbology`, `/update-popup`, `/update-metadata` or inline.)
6. **Restart** the server: `.claude/scripts/restart_server.sh <config>` (no hot reload).
7. **Validate**: `curl ".../FeatureServer/<layer_id>?f=json"` and a `query?where=1=1&orderByFields=OBJECTID&f=json`
   returning features.

Report the FeatureServer URL. Never store passwords — for secured *sources*, mint a short-lived token.
