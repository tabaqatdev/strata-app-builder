# How do I publish data to the server?

You publish to the **Strata Serve server** (`wt-server`), which is started with a **required config file**:
`wt-server <server_config.toml>`. Each layer is a DuckDB view over a **GeoParquet** file. Publishing =
place the parquet → add a `[[duckdb.datasources]]` block → write a metadata bundle → **restart** (no hot
reload) → validate.

## Publish a shapefile
> "Publish this shapefile to the server under the Saudi/admin service."
```
/publish ./cities.shp --config server_config.toml --service admin --folder Saudi --layer-id 0
```
1. Converts to EPSG:4326 GeoParquet (`ogr2ogr`, English `snake_case` fields).
2. Appends the datasource block → `…/rest/services/Saudi/admin/FeatureServer/0`.
3. Writes the metadata bundle (`metadata.toml` + `drawingInfo.json` + `popupInfo.json`).
4. Restarts and validates.

## Publish a GeoParquet from a cloud bucket
> "Publish a GeoParquet that lives in an S3 bucket."
```
/publish s3://my-bucket/fhsz.parquet --config server_config.toml --service hazards
```
The `path` points straight at `s3://…` (DuckDB httpfs) — no local copy.

## Update a published layer (the differentiator)
```
/symbology admin_cities …            # rewrites drawingInfo.json + restart
/popup admin_cities "…"              # rewrites popupInfo.json + restart
/update-metadata admin_cities --alias cityname_en="City (EN)" --display-field cityname_en
```
For a published layer, `/symbology` and `/popup` target `drawingInfo.json` / `popupInfo.json` in the metadata
bundle (not `layers.json`) and restart the Serve server.

## Datasource block (what gets written)
```toml
[[duckdb.datasources]]
id              = "admin_cities"
service         = "admin"
folder          = "Saudi"
layer_id        = 0
layer_name      = "Admin Cities"
path            = "/data/ADMIN_Cities.parquet"   # or https://… or s3://…
geometry_column = "geometry"
source_wkid     = 4326
layer_metadata_path = "/config/metadata/admin_cities"
```

**Traps:** `OBJECTID` is always the OID (a string id ⇒ omit `object_id_field`); no hot reload (always
restart); `tile_fields` ≠ popup fields. See the `strata-data` skill and `docs/troubleshooting.md`.
