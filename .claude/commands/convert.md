---
description: Convert a GIS dataset to EPSG:4326 GeoParquet (File GDB, Shapefile, GeoJSON, ESRI JSON, CSV, KML).
argument-hint: <path> [--out <file.parquet>] [--sql <rename.sql>]
---

Convert a source dataset to a Strata-ready GeoParquet using `.claude/scripts/convert.sh` (GDAL/ogr2ogr,
and/or DuckDB spatial):

- **File Geodatabase / Shapefile** → `ogr2ogr -f Parquet out.parquet <src> -t_srs EPSG:4326
  -lco GEOMETRY_NAME=geometry -lco GEOMETRY_ENCODING=WKB -lco FID=objectid -dim XY`.
- **GeoJSON (standard, RFC 7946)** → direct.
- **GeoJSON (ESRI)** / **ESRI JSON** (`esriGeometry*`) → detect and normalize rings/winding to standard
  GeoJSON first, then to GeoParquet.
- **CSV (lon/lat)** / **KML** → build points / convert via GDAL.

Rules: reproject to **EPSG:4326**; rename field NAMES to English `snake_case` (keep values); drop junk like
`__index_level_0__`. List the source first with `ogrinfo -so <src>`. Report the output path + feature count.
