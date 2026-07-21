# dc.json — recipe test map (notes)

A deliberately complete **District of Columbia** dataset for exercising the strata-app-builder recipes under
`recipes/` (except `mapviewer`). Machine-readable notes are also embedded **inside the map** at
`strata:notes` (so recipe wizards can read them); this file is the human copy.

All sources are public **DC GIS (OCTO)** FeatureServer/MapServer endpoints — CORS-enabled and reprojected
to EPSG:4326 by the `arcgis-feature` source (`outSR=4326`). Native SR is WebMercator (3857); the map is 4326.

## Layers (9)

| id | geometry | source | good for (recipes) |
|---|---|---|---|
| `dc-wards` | polygon · 8 wards | OP/ACS_Economic_Characteristics/57 | choropleth base — interactive-legend, chart-viewer, compare, observer, countdown, gallery, category-gallery, exhibit, zone-lookup, insets, portfolio, data-explorer, sidebar, basic, vector-analysis |
| `dc-zip-codes` | polygon *(off by default)* | Location/4 | zone-lookup, sidebar |
| `dc-parcels` | polygon · downtown (filtered) | Property_and_Land/40 | **related-records origin**, sidebar, zone-lookup |
| `dc-bike-routes` | line | Transportation/6 | line geometry — basic, sidebar, vector-analysis |
| `dc-crashes` | point · ~4,930 · **time** | Public_Safety/24 | **time slider**, nearby, public-notification, observer, clustering |
| `dc-affordable-housing` | point | Property_and_Land/62 | nearby, public-notification, chart-viewer, countdown, gallery |
| `dc-property-assessment` | table (ITSPE) | Property_and_Land/53 | **related to `dc-parcels`** (SSL) |
| `dc-crash-details` | table | Public_Safety/25 | **related to `dc-crashes`** (CRIMEID) |
| `dc-address-table` | table (standalone) | Location/6 | sidebar attribute table |

## The two relationships (for related-records recipes)

- **`dc-parcels` → `dc-property-assessment`** — `relationshipId 11`, key `SSL`, one-to-many. Click a parcel → its tax/assessment record.
- **`dc-crashes` → `dc-crash-details`** — `relationshipId 3`, key `CRIMEID`, one-to-many. Click a crash → the people/details involved.

Both relationships are **live on the server** (discoverable via the layer's `relationships`) and are also
declared in the map under each origin layer's `strata:relatedTables`.

## Time

`dc-crashes` is time-enabled on **`REPORTDATE`** (ArcGIS Date, epoch-millis in queries). The layer is
pre-filtered to **Q4 2024** via `definitionExpression`; the time slider filters within that window.

## Choropleth fields on `dc-wards` (ACS 2018–2022)

- `DP03_0062E` — Median household income ($)
- `DP03_0088E` — Per-capita income ($)
- `DP03_0009P` — Unemployment rate (%)
- `DP03_0119P` — Families below poverty (%)
- `NAMELSAD` — ward name (categorical: "Ward 1"…"Ward 8")

Default renderer is a class-breaks choropleth on median household income.

## Bookmarks

Full District (default) · Downtown (parcels) · National Mall & Monuments · Capitol Hill · Georgetown · Dupont Circle.

## Basemaps

Default **OpenStreetMap**, plus CARTO Positron / Voyager / Dark Matter and OpenTopoMap — all keyless,
OSM-derived (`strata:basemaps`, mirrors `@strata/core-map` `OPEN_BASEMAPS`; the active `baseMap` is OSM).

## Known gaps (cannot be filled from read-only DC/MD open data)

- **Attachments** — 118 DC + Maryland-iMap services were scanned for `hasAttachments:true`; **none exist**.
  Attachments live in hosted Survey123/Field Maps layers, not authoritative FeatureServers. The
  **attachment-viewer** recipe (and the media side of **manager**/**reporter**) needs a dedicated demo/ESRI
  layer with attachments enabled.
- **Editing** — these are read-only services. **manager / web-editor / reporter** need a writable +
  authenticated ESRI FeatureServer (`@strata/auth-arcgis`). Reads (query/stats/related) work here; writes do not.
- **Per-feature time series** (`streamflow`) — no DC layer carries a per-feature `{t,value}` series; use the
  built-in gauges stand-in for that recipe.

## Regenerating / retargeting

Copy this file into an app as `layers.json` (or `/create-map`), then run any recipe. To move the parcels
elsewhere, change the `SQUARE` range in `dc-parcels`' `definitionExpression`; to change the crash window,
edit `dc-crashes`' `REPORTDATE` filter.
