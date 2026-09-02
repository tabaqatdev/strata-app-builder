# WebMaps — ESRI Web Map JSON specs

Genuine **ESRI Web Map JSON** documents (`operationalLayers`, `baseMap`, `spatialReference`, `initialState`)
that `<StrataMap>` renders directly. Styling is genuine ESRI `drawingInfo`; popups are genuine `popupInfo`.
Two kinds of file live here:

- **Starter templates** (`world.json` · `usa.json` · `country.json` · `state.json`) — ready-to-use starter
  maps so a first-time user never faces an empty canvas. On first run (or via `/new-app`), Claude **copies
  one into the new app** as its `layers.json`, and the map opens with **real layers already in the Layer
  panel** — proof the setup + Claude interaction work. From there the user restyles, adds data, and builds.
- **Regional WebMaps** (`dc.json`, `md.json`, `ca.json`) — richer maps that also carry a namespaced
  **`strata:extensions`** section (a server registry + a multi-format source catalog incl.
  cog/geoparquet/pmtiles + per-app config) that ESRI clients ignore and Strata apps read. See the design
  spec in `.private/WEBMAP-EXTENSIONS_design_spec.md` (private). `dc.json` is the recipe test map (notes in
  `dc.layers.notes.md`).

## The templates

| File | Start point | Layers | Extent |
|---|---|---|---|
| **`world.json`** | The **world** | World Countries (polygons) · World Cities (points) · Airports (points) | Global |
| **`usa.json`** | The **USA** (national) | States (polygons) · Highways (lines) · Cities (points) | Continental US |
| **`country.json`** | A **specific country** (Saudi Arabia showcase) | Country boundary (polygon) · Cities (points), filtered to the country | Saudi Arabia |
| **`state.json`** | A **specific US state** (California showcase) | Counties (polygons) · Cities (points), filtered to the state | California |

## Styling conventions (as requested)
- **Polygon layers** use **random pastel fills at 80% transparency** (fill alpha `0.2`), each with an
  **outline two tones darker** than its own fill (opaque). Colors are assigned **per feature** via an ESRI
  `uniqueValue` renderer keyed on the name field (per-country, per-state, per-county), so every polygon gets
  its own pastel — deterministic per name, so they stay stable if regenerated.
- **`OBJECTID` is never shown in popups** — each layer defines a `popupInfo` that lists only meaningful
  fields (name, region, population, …). Population fields use a thousands separator.
- Points use `esriSMSCircle`/`esriSMSSquare` markers (never `esriSMSPath`). The default basemap is
  **OpenFreeMap Positron** — a keyless GL style over OpenStreetMap data, the first choice everywhere in
  strata-app-builder. Because the pastel fills are 80% transparent they tint a pale ground lightly; to make
  them pop, switch to **Versatiles Colorful** or **OpenFreeMap Liberty** in the Basemap panel (both
  `OPEN_BASEMAPS` presets). These starters opened on raster OpenStreetMap until 2026-09-01; that host now
  answers HTTP 200 with an *"Access blocked"* image to a client outside its usage policy, which would have
  made the greeting map — whose whole job is to prove the setup works — arrive as a placeholder.

## Data sources
- **World Countries** — `services2.arcgis.com/ZQ4jTQn6k7VPXEwO/.../World_Countries/FeatureServer/0` (as requested).
- **USA states / counties / cities / highways** — the ESRI sample `sampleserver6.../USA/MapServer` (layers 2, 3, 0, 1).
- **World Cities** — Esri Living Atlas `services.arcgis.com/P3ePLMYs2RVChkJx/.../World_Cities/FeatureServer/0`.
  *(The requested org hosts country boundaries but not world cities/airports, so canonical public sources are used for those.)*
- **Airports** — Natural Earth `ne_10m_airports` (GeoJSON, public domain), loaded as a `geojson` layer.

All are public and CORS-enabled, so the templates load directly in the browser. If a third-party service is
CORS-restricted in your environment, route it through a proxy (see `strata/docs/how-to/cors-and-proxy.md`).

## Reusing / swapping
- **`country.json`** and **`state.json`** are filtered with a `definitionExpression`
  (`COUNTRYAFF = 'Saudi Arabia'`, `state_name = 'California'`) and framed by `initialState.viewpoint`.
  To retarget, change the `definitionExpression` value(s) and the extent — Claude does this for you when you
  ask for a different country or state.
- Copy any file to your app as `layers.json`, then use `/symbology`, `/popup`, `/add-data`, `/panel`, `/app`
  to build from there.
