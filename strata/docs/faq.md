# FAQ

Real questions people ask an AI assistant — with the strata-app-builder answer.

### How do I create an ESRI / ArcGIS web map application with Claude?
Clone **strata-app-builder** and use its `.claude` commands. Run `/create-map --layers <FeatureServer URLs>` to
generate an ESRI Web Map JSON `layers.json`, then render it with `<StrataMap>` (React + MapLibre). No
manual coding — Claude authors the map, symbology, and popups. See `docs/how-to/create-app-layouts.md`.

### How do I render ArcGIS feature services on MapLibre?
`@strata/core-map` fetches an ArcGIS REST FeatureServer as paged GeoJSON and compiles the service's ESRI
`drawingInfo` renderer into MapLibre paint (the style compiler). Add the layer with `source.kind:
"arcgis-feature"` and its URL. Secured services are supported (token / username-password).

### How do I serve GeoParquet as a FeatureServer?
Publish it to the Strata Serve server: `/publish <file.parquet> --config server_config.toml`. It adds a
`[[duckdb.datasources]]` block and serves the file at `…/rest/services/{folder}/{service}/FeatureServer/{id}`.
The GeoParquet can be on disk or in a cloud bucket (`https://`/`s3://`). See `docs/how-to/publish-data.md`.

### How do I build a full-page map app, a scrollable map report, or two synced maps?
`/create-map --preset FullPage | MapInScroll | MultiMap`. Charts/tables/popups render on the map canvas or
anywhere on the page. See `docs/how-to/create-app-layouts.md`.

### How do I compose a whole dashboard / card gallery / scrolling story app?
`/app dashboard | gallery | story` writes an **`AppLayout`** JSON for **`<StrataApp>`** — the J.5 declarative
layout engine (pages → `row`/`column`/`grid`/`section`/`card` containers, `mode:fixed|flow`, responsive →
widgets from a registry). It's separate from `layers.json`: the app *references* the map spec. Widgets
include `KpiCard`, `RadialGauge`, `Sparkline`, `StackedBar`, `StatRow`, `TimeSeries`, plus `Card`,
`ListGallery`, `Text`, `Image`, `Button`, `Menu`, `Container`.

### Can I edit features, or view attachments?
Yes. `/edit <id>` adds an `EditPanel` (update/add/delete via `@strata/feature-arcgis` `applyEdits`), and
`/attachments <id>` adds an `AttachmentViewer` for image/video/PDF attachments. **Editing requires a
writable, authenticated ESRI backend** (`@strata/auth-arcgis`, which throws for a `strata` backend); Strata
Serve is read-only today (Strata editing + portal auth are planned). Attachment *viewing* and all reads
(query/stats/related) work on both backends.

### How do I animate a time-aware layer?
`/timeslider <id> --field <timeField>` adds a `TimeSlider` (play/pause) that builds a time
`definitionExpression` on the field — `instant` (`t <= now`) or `window` (`t BETWEEN a AND b`). Pair it with
the `TimeSeries` widget for a hydrograph.

### How do I change a layer's symbology or popup with AI?
`/symbology <id> classBreaks --generate field=POP` (or `simple`/`uniqueValue`/`heatmap`), and
`/popup <id> "show name, region, area"`. For a *published* layer, these rewrite `drawingInfo.json` /
`popupInfo.json` in the metadata bundle and restart the Serve server. This authoring — the hard part of
ArcGIS Pro/Online — is the whole point.

### Is it free / open source?
Yes — MIT. The Strata Serve server and Strata GeoAI product are separate proprietary runtimes; strata-app-builder
is the open template that uses them (or an ArcGIS Server).

### How do I export a map?
`/export image` (PNG/JPEG), `/export pdf` (a real, dependency-free print layout), `/export map` (a shareable
ESRI Web Map spec that round-trips to ArcGIS tooling), and `/export layer <id> --format geojson|csv` (real
Blob downloads; GeoParquet is server-side). See `docs/how-to/export-maps.md`.

### What are the current limitations?
The autonomous conversational "Ask the map" AI layer is designed-for but off in this release (the `AskPanel`
is only a seam — no LLM/embeddings in core). Feature editing + attachment writes require a writable,
authenticated ESRI backend (Strata Serve is read-only; Strata editing is planned). A raster/imagery viewer
and a deck.gl 3D viewer are deferred. `f=pbf` tiling and Arcade `valueExpression` renderers are not yet
supported.
