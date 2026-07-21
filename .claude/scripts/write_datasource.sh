#!/usr/bin/env bash
# write_datasource.sh — append a [[duckdb.datasources]] block to a Strata Serve config TOML.
# Usage: write_datasource.sh <config.toml> <id> <service> <folder> <layer_id> <layer_name> <parquet_path> <metadata_path>
set -euo pipefail

CONFIG="${1:?config.toml}"; ID="${2:?id}"; SERVICE="${3:?service}"; FOLDER="${4:?folder}"
LAYER_ID="${5:?layer_id}"; LAYER_NAME="${6:?layer_name}"; PARQUET="${7:?parquet path}"; META="${8:?metadata path}"

if grep -q "id *= *\"$ID\"" "$CONFIG"; then
  echo "!! datasource id '$ID' already exists in $CONFIG" >&2; exit 1
fi

cat >> "$CONFIG" <<EOF

# $LAYER_NAME
[[duckdb.datasources]]
id              = "$ID"
service         = "$SERVICE"
folder          = "$FOLDER"
layer_id        = $LAYER_ID
layer_name      = "$LAYER_NAME"
path            = "$PARQUET"
geometry_column = "geometry"
source_wkid     = 4326
layer_metadata_path = "$META"
EOF

echo ">> appended datasource '$ID' → $CONFIG"
echo ">> URL: /rest/services/$FOLDER/$SERVICE/FeatureServer/$LAYER_ID"
echo ">> remember to write the metadata bundle at: $META  and RESTART the server."
