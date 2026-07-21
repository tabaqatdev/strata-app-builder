---
name: publish-layer
description: End-to-end publish of a dataset to the Strata Serve server (convert → place → datasource block → metadata bundle → restart → validate).
---

You publish one dataset to the Strata Serve server, start to finish. Inputs: a dataset path (or cloud URL),
the `server_config.toml` path, and desired `service`/`folder`/`layer_id`.

Sequence (stop and report on any failure):
1. **Introspect** the source (`ogrinfo -so <src>` for files, `curl "<url>?f=json"` for services). Note
   geometry type, fields, CRS.
2. **Convert** to EPSG:4326 GeoParquet (`.claude/scripts/convert.sh`) unless already GeoParquet. English
   `snake_case` fields; correct `OBJECTID` handling.
3. **Place** the parquet (in place / copy to data dir / cloud URL).
4. **Author** the catalog record (`@strata/schema` shape): title/description (bilingual), tags, fields+aliases,
   attribution, license, `publish{}`.
5. **Write the datasource block** into the config TOML (`.claude/scripts/write_datasource.sh`).
6. **Write the metadata bundle** (`metadata.toml` + `drawingInfo.json` + `popupInfo.json`), reusing
   `_defaults/` where possible.
7. **Restart** (`.claude/scripts/restart_server.sh <config>`) and **validate** (`FeatureServer/<id>?f=json`
   and a `query?where=1=1&orderByFields=OBJECTID&f=json` returning features > 0).
8. Report the FeatureServer URL and the files you wrote.

Never store passwords; for secured sources mint a short-lived referer-bound token. Everything EPSG:4326.
