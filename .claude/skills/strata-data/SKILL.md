# strata-data skill pack

Two jobs, opposite directions: **verify** a service you did not publish before binding an app to it, and
**convert / publish / update** your own data on the Strata Serve server (`wt-server`).

> **The one rule:** a field name never enters an app until a response has shown it. Full method:
> `strata/docs/how-to/find-and-verify-data.md`. Full trap catalogue: `strata/docs/troubleshooting.md`.

## Verify cheatsheet — before binding to a service you did not publish

- `?f=json` → `objectIdFieldName` · `geometryType` · `maxRecordCount` · `capabilities` · `fields` · `extent.spatialReference.wkid`
- `/query?where=1=1&returnCountOnly=true&f=json` — the count
- `/query?where=1=1&returnIdsOnly=true&f=json` — the ids; must agree with the count
- `/query?…&returnIdsOnly=true&resultRecordCount=5000` — **the real page size** is whatever comes back
- `/query?where=F IS NOT NULL AND F <> ''&returnCountOnly=true` — is the field actually populated?
- `/query?where=1=1&outFields=F&returnDistinctValues=true` — is it a measure or a string?
- `/query?where=1=1&returnExtentOnly=true` — does it cover the AOI?
- `curl -s -D- -o /dev/null -H "Origin: http://localhost:8041" …` — **send an Origin**: many hosts
  *reflect* it rather than sending `*`, so a bare `-I` reads as CORS-closed and you proxy needlessly
- Long geometry ⇒ POST as a form body (`--data-urlencode`), never a query string
- Harvest a recipe's verified `external` feeds back into the shared regional catalogue

## Publish cheatsheet
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

## Verify recipes

#### Characterise a layer end to end
Run the seven-step probe in `strata/docs/how-to/find-and-verify-data.md` §2 and paste the literal output into the recipe's §4.
→ Every later assertion cites those numbers.

#### Establish the OID before any selection or highlight
`curl -s "$L?f=json" | jq .objectIdFieldName`
→ `"FID"` on the Cal OES pipeline centerline (which *also* has a column named `OBJECTID`); `"OBJECTID_1"`
on the Cal OES SafeGraph slices; `null` on three geohazard layers ⇒ bind read-only.

#### Detect a truncating page size before it fabricates a share
`curl -s "$L/query?where=1%3D1&returnIdsOnly=true&resultRecordCount=5000&f=json" | jq '.objectIds|length'`
→ 1,000 back from a request for 5,000 means the page size is 1,000. Paging against 5,000 stops at
1,000 of 1,619 and inflates a measured share 11.2 % → 18.0 %.

#### Detect a lying count
`returnCountOnly` → `{"count":0}` with HTTP 200 while `returnIdsOnly` returns 36 ids ⇒ assert both, on
every layer whose count reaches a KPI.

#### Prove a field is real before designing around it
`?where=EventType IS NOT NULL AND EventType <> ''&returnCountOnly=true` → `{"count":0}` of 62,306 rows.
→ The design changes: a map, not a search box. Report the finding; do not work around it silently.

#### Decide measure vs category
`?outFields=Diameter&returnDistinctValues=true` → 84 distinct forms (`8`, `8, 10`, `8.625`, `8"`, ` `).
→ It is a string. Never `SUM` it; parse explicitly and report the unparseable share.

#### Check a padded CHAR column
`?where=ABLIST='OFF'&returnCountOnly=true` → `{"count":0}`; `?where=TRIM(ABLIST)='OFF'` → real rows.
→ Route every comparison through one trim helper.

#### Decide the delivery route
ACAO present ⇒ **browser-direct**. 200 + no ACAO, 403 on preflight ⇒ **narrow allowlisted proxy in
`server.mjs`**, and the app must still work with the route deleted. Bulk file / too large / needs a join
⇒ **`/convert` → `/publish`** to Strata Serve.

#### Confirm a group layer
`?f=json` → `geometryType: null`, and `/query` → HTTP 400. → Use the point/line/polygon children.

#### Confirm a layer is unmappable
No geometry and no coordinate fields ⇒ mark **not mappable**, refuse to toggle it, and say why in the
layer row. Never a checkbox that ticks and paints nothing.

#### Re-probe before declaring an endpoint dead
Three 500s then three `{count:21}` an hour later ⇒ **intermittent**, not broken. Record it as such and
write the assertion to pass either way.

#### Ask a spatial question safely
POST the geometry as a form body with `geometryType` + `spatialRel`; clip geodesically with `make_valid`.
Never `try/except: continue` in a measurement — a swallowed invalid polygon reported 53 of 91 miles when
the answer was 91.05 of 91.05.

#### Find a server nobody crawled
Open the agency's public web map and read its `config.js` / network tab. That is how a 36-service
broadband server — and an entire missing subject area — was found.

## Publish recipes
1. **Publish a shapefile.** `/convert cities.shp` → `cities.parquet`; choose `service=admin folder=Saudi
   layer_id=0 id=admin_cities`; write block + bundle; restart; `curl .../FeatureServer/0?f=json`.
2. **Publish from a cloud bucket.** `path = "s3://bucket/fhsz.parquet"` (DuckDB httpfs) — no local copy.
3. **Restyle a live layer.** `/update-symbology admin_cities` → edit `drawingInfo.json` → restart.
4. **Edit an ESRI layer.** Confirm edit `capabilities` + auth via `@strata/auth-arcgis` → `EditPanel` →
   `applyEdits`. (Refuse if the target is Strata-served — read-only.)

## Service metadata reference

Service metadata (`?f=json`) — the fields that decide a binding:

```jsonc
{
  "objectIdFieldName": "FID",        // authoritative; do NOT assume OBJECTID
  "geometryType": "esriGeometryPolyline",  // null ⇒ group layer
  "maxRecordCount": 1000,            // a claim; verify with step 3 of the probe
  "capabilities": "Query",           // needs Create/Update/Delete for any edit path
  "extent": { "spatialReference": { "wkid": 102100 } },  // 102100 ⇒ never measure Shape__Length
  "fields": [{ "name": "…", "type": "esriFieldTypeString", "alias": "…" }]
}
```

Query parameters that matter: `where` · `outFields` · `returnCountOnly` · `returnIdsOnly` ·
`returnDistinctValues` · `returnExtentOnly` · `resultRecordCount` · `resultOffset` ·
`exceededTransferLimit` (response) · `outSR` · `geometry` + `geometryType` + `spatialRel` ·
`f=json|geojson`.

Canonical spec: <https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer/>

## Known traps
> Full catalogue with status markers: `../../../strata/docs/troubleshooting.md`.
- **Publishing:** a Strata-served layer's `objectIdField` is always `OBJECTID`; `object_id_field` only
  picks the source column. String id ⇒ omit it.
- **Consuming:** never assume the OID — read `objectIdFieldName` from the service. Layers exist whose OID
  is `FID` while a *different* column is named `OBJECTID`; selecting on the wrong one hits the wrong
  feature with no error.
- No hot reload — always restart after a config/bundle change.
- `tile_fields` (MVT attributes) ≠ popup fields; keep small.
- Everything EPSG:4326.
- **The real page size is what the server returns, not what you asked for.** Comparing against the
- **ArcGIS answers errors with HTTP 200 + `{error}`.** `j.features || []` reads that as zero features and
- **`returnCountOnly` can lie** — assert it against ids.
- **A published field can be blank on every row.** Profile before designing.
- **Numeric-looking columns are often strings**; `CHAR` columns are space-padded.
- **Identifiers are strings** — coercing `"0274"` to `274` matches nothing and reports "0 matched".
- **Cumulative fields do not sum** (upstream drainage area double-counts every confluence).
- **`Shape__Length` on a 102100 layer is Mercator metres** — inflated by 1/cos(latitude), a 21 % error.
- **Generalised geometry is for drawing only.** Never measure on it.
- **The geocoder's default `outSR` is Web Mercator** — omit it and coordinates land in the Gulf of Guinea.
- **MapServer `f=geojson` lower-cases every field name**; FeatureServer preserves case.
- **A GeoJSON ring repeats its first vertex** — averaging it twice drags every centroid.
- **Public demo endpoints have hard limits**: Overpass 406 to an unidentified User-Agent (and its mirrors
- **A capped denominator inflates every share computed from it.** Compare against the true count.
- **One probe is not enough to declare an endpoint dead.**
- **Every external call carries a deadline.** A service that neither answers nor refuses leaves the app
  in a permanent "loading…" with nothing to report — worse than an error. `AbortSignal.timeout`, and
  surface a timeout like any other failure.
- **Browsers forbid setting `User-Agent` on `fetch`.** A politeness header that satisfies a provider's
  usage policy applies only from Node — the request you verified with curl is not the request the app
  sends.
- **Never fabricate.** No source ⇒ render empty with the citation.

## Question patterns (routing)

- "add this layer / use this service" → §2 Characterise a layer end to end
- "why is my selection highlighting the wrong feature" → §2 Establish the OID
- "the totals look too small / the share looks too high" → §2 Detect a truncating page size · capped denominator
- "the map is empty but the count is fine" → §2 Detect a lying count · group layer · not mappable
- "search doesn't return anything" → §2 Prove a field is real
- "sum / average this column" → §2 Decide measure vs category · cumulative fields
- "how long is this feature" → §4 `Shape__Length` · generalised geometry
- "it works in curl but not in the browser" → §2 Decide the delivery route
- "the service is down" → §2 Re-probe before declaring an endpoint dead
- "there's no data for this vertical" → §2 Find a server nobody crawled · structural gaps (`DATA.md` §1)
- "should I publish this to Strata?" → §2 Decide the delivery route (third route)
