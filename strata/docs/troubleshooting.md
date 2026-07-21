# Troubleshooting & known traps

Hard-won lessons — most come from real publishing to the Strata Serve server.

- **Points don't render.** The `objectIdField` must be `OBJECTID`. `object_id_field` only picks the SOURCE
  column to cast; a string id (GERS, ministry number) can't be the OID — **omit `object_id_field`** so it's
  synthesised. The ArcGIS JS/MapLibre snapshot query uses `orderByFields=<OID>`; a wrong OID returns 0
  features and points silently don't draw (polygons/lines use the tiled path and are unaffected).
- **Custom markers don't show.** Don't use `esriSMSPath`. Use `esriSMSCircle` / `Square` / `Diamond` /
  `Triangle`. Vary colour per layer.
- **Overlapping polygons hide each other.** Use a **low fill alpha** (~40/255).
- **Changes don't take effect.** The Serve server has **no hot reload** — restart after any config /
  datasource / metadata change (`/restart` or `.claude/scripts/restart_server.sh`).
- **Vector tiles are huge.** `tile_fields` controls which attributes are baked into vector tiles — keep it
  to a handful. It is **not** the popup field list (FeatureServer `/query` always returns all fields).
- **A stray field appears.** pandas-written GeoParquet can carry `__index_level_0__` — drop it on convert
  (`SELECT * EXCLUDE(__index_level_0__)`).
- **Everything must be EPSG:4326.** Reproject on the way in (`-t_srs EPSG:4326`).
- **`exportImage` returns a blank image.** Create the MapLibre map with `preserveDrawingBuffer:true`.
- **Heatmap floods the canvas.** Ensure a ratio-0 transparent colour stop (the style compiler adds one if
  missing).
- **Secured services.** Never send or store the password — mint a short-lived, referer-bound token via
  `{portal}/generateToken` and attach only the token.
- **`/edit` won't save (Strata layer).** Editing/attachment writes need a **writable, authenticated ESRI
  backend**; `@strata/auth-arcgis` `assertEsriBackend` **throws** for a `strata` backend. Strata Serve is
  read-only (Strata editing is planned). Reads — query / statistics / related / attachment *viewing* — work
  on both backends.
- **Time slider filters nothing.** Read the **real time field** from the service (`?f=json`) — don't invent
  it. The `TimeSlider` builds a `definitionExpression` on that field (`instant`: `t <= now`; `window`:
  `t BETWEEN a AND b`), stacking with any other `definitionExpression` filter.
