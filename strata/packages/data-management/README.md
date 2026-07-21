# @strata/data-management

Convert GIS data to GeoParquet and **publish it to the Strata Serve server** (`wt-server`) as a
FeatureServer layer, with a full metadata bundle.

## The publish model

The Serve server is started with `wt-server <server_config.toml>` (the config path is required). Each layer
is a DuckDB view over a **GeoParquet** file (disk, `https://…`, or `s3://…`). Publishing = place the
parquet → add a `[[duckdb.datasources]]` block → write a metadata bundle → **restart** (no hot reload).

The **catalog record** (`@strata/schema`) is the single source of truth; this package **renders** it into
those artifacts:

```bash
strata-data render ./my-layer.record.json
# prints the [[duckdb.datasources]] block, metadata.toml, drawingInfo.json, popupInfo.json, and the URL
```

## Status (v0.1.0)

- **implemented:** `render` — catalog record → datasource block + metadata bundle (`src/publish/render.ts`).
- **scaffolded (next):** `convert` (ogr2ogr / DuckDB wrappers for GDB / Shapefile / GeoJSON both flavors /
  ESRI JSON / CSV / KML), `publish` orchestration (place parquet → write config → write bundle → restart →
  validate), catalog CRUD, and secured-token minting. Today these run via the `.claude/commands` (`/convert`,
  `/publish`) and `.claude/scripts` (`convert.sh`, `write_datasource.sh`, `restart_server.sh`).

See `../../docs/how-to/publish-data.md`.
