#!/usr/bin/env bash
# convert.sh — convert a GIS dataset to EPSG:4326 GeoParquet (Strata-ready).
# Usage: convert.sh <source> <out.parquet> [rename.sql]
# Handles: File Geodatabase (.gdb), Shapefile (.shp), GeoJSON (standard/ESRI), GeoPackage, CSV, KML.
# Requires GDAL (ogr2ogr). Everything is reprojected to EPSG:4326 with a WKB `geometry` column.
set -euo pipefail

SRC="${1:?source required}"
OUT="${2:?output .parquet path required}"
SQL="${3:-}"

echo ">> inspecting: $SRC"
ogrinfo -so "$SRC" || true

ARGS=(-f Parquet "$OUT" "$SRC"
  -t_srs EPSG:4326
  -lco GEOMETRY_NAME=geometry
  -lco GEOMETRY_ENCODING=WKB
  -lco FID=objectid
  -dim XY)

if [[ -n "$SQL" ]]; then
  # Field-rename SELECT in a file (dodges shell-quoting of non-ASCII field names).
  ARGS+=(-sql "@$SQL")
fi

echo ">> ogr2ogr ${ARGS[*]}"
ogr2ogr "${ARGS[@]}"
echo ">> wrote: $OUT"
# NOTE: for ESRI JSON (esriGeometry rings/paths) that ogr can't read directly, normalize to GeoJSON first.
