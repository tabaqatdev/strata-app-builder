# Getting started

Welcome to **strata-app-builder** — a Claude Code template for building advanced GIS web apps without writing code.
You describe the map you want; Claude authors it. This page is the on-ramp: the mental model, how to run the
example, the commands you'll live in, and the day-to-day build workflow.

## The mental model

Three ideas carry everything:

- **You describe, Claude authors.** The work a GIS admin would do in ArcGIS Pro / ArcGIS Online — add layers,
  style them, write popups, assemble panels — you do here by *describing it*. Claude writes the JSON.
- **The map is a component, not an app.** `<StrataMap>` (React + MapLibre GL JS) renders a map spec. The same
  map can become a full-page operations wall, a scrolling report, a split dashboard, or two synced maps.
- **ESRI Web Map JSON is the contract.** The map spec (`layers.json`) is genuine ESRI Web Map JSON —
  `operationalLayers`, `baseMap`, `spatialReference`, `initialState`. Styling is genuine ESRI `drawingInfo`;
  popups are genuine ESRI `popupInfo`. Nothing here is a home-grown DSL — it round-trips with ArcGIS tooling.

Data comes from **ArcGIS REST** services (public or secured FeatureServer / MapServer) and/or the **Strata
Serve** server (your own GeoParquet published as a FeatureServer). Basemaps default to **open-source,
OpenStreetMap first** (keyless).

## Install & build

Everything runs from inside `strata/`:

```bash
cd strata
pnpm install     # installs the workspace
pnpm -r build    # build all packages
pnpm test        # run the unit suites
```

Once the workspace builds, scaffold your first app with **`/new-app`** in Claude Code (below) — it interviews
you, generates a working `layers.json`, and wires up the app.

## The trio

Three commands orient you at any moment:

- **`/new-app`** — *to build.* A guided wizard: it interviews you, scaffolds a working app (layout, panels,
  plugins, proxy, auth), and installs dependencies.
- **`/guide`** — *to decide.* State a goal ("I want two synced maps") and it routes you to the exact command,
  plugin, or doc.
- **`/help`** — *to look up.* Capabilities plus task how-tos. (`/what-can-i-do` is the full capability list.)

## First run: a starter map

The canvas is never empty. On your first run — or any time via `/new-app` — Claude offers a **starting
point**: **World**, **USA**, a **specific country**, or a **US state**. Pick one and Claude **copies the
matching template from `WebMaps/` into your app as its `layers.json`**, so the Layer panel opens
already populated with real layers (pastel polygons plus cities and airports). That proves your setup and the
Claude interaction are working before you've done anything else.

For a specific country or state, Claude retargets the template's `definitionExpression` and
`initialState.viewpoint` to your choice. See **[the map templates guide](guide/map-templates.md)** for the
four templates, their data sources, and the styling conventions.

## The build workflow

This is where GIS admins spend most of their time — turning raw data into a styled, queryable map:

1. **Get data** — `/add-data` adds a layer to the current map from an ArcGIS FeatureServer/MapServer URL
   (public or secured) or a GeoJSON file/URL.
2. **Convert** — `/convert` turns a GDB / Shapefile / GeoJSON / ESRI JSON / CSV / KML into **EPSG:4326
   GeoParquet** (everything in strata-app-builder is 4326 — reproject on the way in).
3. **Publish** — `/publish` makes that GeoParquet a permanent FeatureServer endpoint on **Strata Serve**
   (adds a `[[duckdb.datasources]]` block + a metadata bundle; restart the server, no hot reload).
4. **Symbolize** — `/symbology` authors a genuine ESRI renderer (`simple` / `classBreaks` / `uniqueValue` /
   `heatmap`), compiled to MapLibre paint.
5. **Advanced popups** — `/popup` authors a genuine ESRI `popupInfo` (field lists, aliases, formatting).
6. **Assemble** — `/panel` adds advanced panels (filter, table, statistics, chart, carto, edit, attachments,
   time series, swipe, bookmarks…), and `/app` composes a whole declarative `<StrataApp>` layout
   (dashboard / gallery / story).

You don't have to do all six — reach for the step you need. Reads (query, statistics, related, attachment
viewing) work on both ArcGIS and Strata Serve backends; **feature editing and attachment writes require a
writable, authenticated ESRI backend** (Strata Serve is read-only today; Strata editing is planned).

## Start from a recipe

You don't have to start blank. A **recipe** is a complete app template — a spec, a prompt-script, and a
**guided wizard** — that Claude runs like an ArcGIS Instant App. Launch one with `/recipe <name>` (e.g.
`/recipe showcase`) or just describe the app; Claude runs the wizard to collect your app's properties, confirms,
then builds it and prompts you to finish. See **[using recipes](how-to/using-recipes.md)**.

## Export & share

When the map is ready, `/export` gets it out:

- `/export image` — PNG / JPEG of the current view.
- `/export pdf` — a real print layout (legend, scale bar, title).
- `/export map` — a shareable ESRI Web Map spec that round-trips to ArcGIS tooling.
- `/export layer <id>` — the layer's data as GeoJSON or CSV.

The interface is bilingual (English / Arabic, RTL-aware) throughout.

## Where to next

- **[Repository anatomy](guide/anatomy.md)** — what every folder and file is.
- **[Command reference](reference/commands.md)** — every command at a glance.
- **[The style compiler](guide/style-compiler.md)** — how ESRI `drawingInfo` becomes MapLibre paint.
- **[Help](README.md#help-task-how-tos)** — task how-tos (layouts, symbology, publishing, export, CORS).
