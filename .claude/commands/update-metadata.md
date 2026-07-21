---
description: Update a published layer's metadata bundle (description, aliases, displayField, tile_fields).
argument-hint: <layerId> [--description "…"] [--alias field=alias ...] [--display-field <f>] [--tile-fields a,b,c]
---

Edit the `metadata.toml` in the layer's metadata bundle (`layer_metadata_path`):
- `description` — bilingual, use-case-first ("what would someone ask to find this?").
- `displayField` — the field used as the feature title.
- `[fields.<col>] alias = "…"` — per-field aliases (bilingual is fine).
- `tile_fields` — the small set baked into vector tiles (keep it short for performance; NOT the popup).
- Optional `copyrightText`, `minScale`/`maxScale`.

Then **restart** the Serve server (`.claude/scripts/restart_server.sh <config>`) and validate. Sibling
commands `/update-symbology` and `/update-popup` edit `drawingInfo.json` / `popupInfo.json` in the same
bundle (see `/symbology`, `/popup`).
