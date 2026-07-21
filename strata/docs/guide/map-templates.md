# Guide: sample map templates

`WebMaps/` holds **ready-to-use `layers.json` starter maps** so a first-time user never
faces an empty canvas. On first run — or any time via `/new-app` — Claude offers one of these as a starting
point, **copies it into the new app** as its `layers.json`, and the map opens with **real layers already in
the Layer panel**. That's proof the setup and the Claude interaction are working. From there you restyle, add
data, and build your app.

Each file is genuine **ESRI Web Map JSON** — the same contract `<StrataMap>` renders: `operationalLayers`,
`baseMap`, `spatialReference`, `initialState`. Styling is genuine ESRI `drawingInfo`; popups are genuine ESRI
`popupInfo`.

## The four templates

| File | Start point | Layers | Extent |
|---|---|---|---|
| **`world.json`** | The **world** | World Countries (polygons) · World Cities (points) · Airports (points) | Global |
| **`usa.json`** | The **USA** (national) | States (polygons) · Highways (lines) · Cities (points) | Continental US |
| **`country.json`** | A **specific country** (Saudi Arabia showcase) | Country boundary (polygon) · Cities (points), filtered to the country | Saudi Arabia |
| **`state.json`** | A **specific US state** (California showcase) | Counties (polygons) · Cities (points), filtered to the state | California |

## Styling conventions

- **Polygon layers** use **random pastel fills at 80% transparency** (fill alpha `0.2`), each with an
  **outline two tones darker** than its own fill (opaque). Colors are assigned **per feature** via an ESRI
  `uniqueValue` renderer keyed on the name field (per-country, per-state, per-county), so every polygon gets
  its own pastel — deterministic per name, so they stay stable if regenerated.
- **`OBJECTID` is never shown in popups.** Each layer defines a `popupInfo` listing only meaningful fields
  (name, region, population, …), with a thousands separator on population fields.
- **Points use `esriSMSCircle` / `esriSMSSquare` markers** — never `esriSMSPath` (a known trap; custom-path
  markers don't render).
- **The basemap is OpenStreetMap** — open-source and keyless, the first choice everywhere in strata-app-builder.
  Because the pastel fills are 80% transparent they tint OSM lightly; to make them pop, switch to **CARTO
  Positron (Light)** in the Basemap panel (one of the `OPEN_BASEMAPS` presets).

## Data sources

All sources are public and CORS-enabled, so the templates load directly in the browser:

- **World Countries** — `services2.arcgis.com/ZQ4jTQn6k7VPXEwO/.../World_Countries/FeatureServer/0`.
- **USA states / counties / cities / highways** — the ESRI sample `sampleserver6.../USA/MapServer`
  (layers 2, 3, 0, 1).
- **World Cities** — Esri Living Atlas `services.arcgis.com/P3ePLMYs2RVChkJx/.../World_Cities/FeatureServer/0`.
- **Airports** — Natural Earth `ne_10m_airports` (GeoJSON, public domain), loaded as a `geojson` layer.

> The World_Countries org hosts country boundaries but **not** world cities or airports, so those come from
> canonical public sources — the Living Atlas world cities service and Natural Earth airports.

If a third-party service is CORS-restricted in your environment, route it through a proxy (see
[CORS & proxy](../how-to/cors-and-proxy.md)).

## How first run uses a template

When you start with no scaffolded app, Claude asks which starting point you want — **World**, **USA**, a
**specific country**, or a **US state** — then copies the matching file into your app as its `layers.json` and
opens it. The Layer panel is populated immediately; you're never staring at a blank map.

## Retargeting country & state

`country.json` and `state.json` are filtered with a `definitionExpression`
(`COUNTRYAFF = 'Saudi Arabia'`, `state_name = 'California'`) and framed by `initialState.viewpoint`. To point
one at a different country or state:

1. Change the `definitionExpression` value(s) on the filtered layers.
2. Adjust `initialState.viewpoint` to frame the new extent.

Claude does both for you when you ask for a different country or state during onboarding.

## Reusing

Copy any file into your app as `layers.json`, then use `/symbology`, `/popup`, `/add-data`, `/panel`, and
`/app` to build from there.
