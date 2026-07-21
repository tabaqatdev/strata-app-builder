# Repository anatomy

What every part of strata-app-builder is, when you touch it, and the command that drives it.

## Root layout (kept minimal)

The repository root holds only the essentials so a newcomer isn't overwhelmed:
`README.md`, `llms.txt`, `LICENSE`, `package.json`, the **`recipes/`** workspace, the **`WebMaps/`** starter
maps, and the hidden **`.claude/`** (the authoring commands Claude Code loads). **The library — code, docs,
reference material, and build config — lives in `strata/`**; you build in **`recipes/`**.

```
strata-app-builder-main/
├── README.md · llms.txt · LICENSE · package.json   # visible files at root
├── recipes/                            # your workspace — mapviewer/ · showcase/ · COMPONENT-MANIFEST.md
├── WebMaps/                            # ready-to-use layers.json starter maps
├── .claude/                            # the authoring brain (hidden; loaded by Claude Code)
└── strata/                             # the library: code, docs, reference material, tooling
    ├── packages/ · docs/ · reference/
    └── pnpm-workspace.yaml · tsconfig.base.json · CHANGELOG.md · DISCLAIMER.md
```

Run tooling from inside `strata/` (e.g. `cd strata && pnpm install`).

## `.claude/` — the authoring brain (at root)
- **`commands/`** — the slash commands: onboarding `/new-app`, `/guide`, `/help`, `/what-can-i-do`;
  authoring `/create-map`, `/add-data`, `/symbology`, `/popup`, `/panel`, `/timeslider`, `/app`, `/edit`,
  `/attachments`, `/analyze`; data `/convert`, `/publish`, `/update-metadata`; `/export`; and `/recipe`
  (launch a recipe like an Instant App via its guided wizard).
- **`skills/`** — skill packs (cheatsheet → recipes → ESRI reference → traps): `strata-map`,
  `strata-symbology`, `strata-popups`, `strata-charts`, `strata-panels`, `strata-interactivity`,
  `strata-data`, `strata-layout`, `strata-export`, `strata-brand`.
- **`scripts/`** — the shell the commands call: `convert.sh`, `write_datasource.sh`, `restart_server.sh`.
- **`agents/`** — `publish-layer` (end-to-end publish), `qa` (verify).
- **`CLAUDE.md`** — load-bearing conventions (map spec, publish model, restart matrix, known traps).
- **`settings.json`** — tool permissions (secrets denied).

## `strata/templates/` — the app template roster

30 serialized `AppLayout` JSONs — ready-to-render app silhouettes (map-centric, dashboard, web-page, grid) —
demonstrated against `WebMaps/dc.json` / `md.json` and validated by `packages/schema/tests/templates.test.ts`.
See [`templates/README.md`](../../templates/README.md) and the
[application design guideline](app-design.md).

## `strata/packages/` — the code (18 packages)
See **[Components, widgets & skills](../reference/components.md)** for the purpose/scope of each and how they
compose.
- **`@strata/schema`** — the contract: `layers.json` (ESRI Web Map) + the `AppLayout` (containers, `ViewsNode`,
  `Connection`) + the catalog record (JSON Schema + TS).
- **`@strata/state`** — Zustand store (layers/selection/view/basemap/active-layer) with undo/redo,
  **`setDefinition`** (in-place filter), and `layers.json` round-trip.
- **`@strata/core-map`** — React + MapLibre: `engine/` (style/popup compilers, ArcGIS REST + GeoJSON + tile/WMS
  + **ImageServer/COG** loaders, MapController, basemaps, storeBinding), `react/` (StrataMap, controls, all
  panels, all widgets, the `<StrataApp>` layout engine, i18n binding, ErrorBoundary).
- **`@strata/actions`** — the data-action bus + the **WIF**: triggers → actions, `wireConnections` +
  `defaultDispatchers` (drive `AppLayout.connections`), the `OutputRegistry`, and the `DataAction` registry.
- **`@strata/arcade`** — Arcade-subset evaluator → a MapLibre expression (renderers) or a scalar (popups).
- **`@strata/theme`** — the visual system: colorblind-safe categorical/sequential/diverging ramps + named
  theme presets (light/dark/hazard/muted).
- **`@strata/i18n`** — dependency-free EN/AR RTL-aware i18n (`createI18n`/`t`/`dir`/`baseDict`).
- **`@strata/processing`** — Turf spatial analysis: buffer/nearest/within/spatial-join/dissolve/clip, overlay
  (union/difference/intersect/voronoi/hull), aggregate, hexbin/hotspot, weighted-overlay, dot-density.
- **`@strata/plugins`** — the plugin spine: `StrataPlugin` + `StrataAppAPI` + `PluginManager`.
- **`@strata/plugin-search` · `plugin-routing` · `plugin-statusbar` · `plugin-timeslider`** — first-party
  plugins (search/geocode, routing **+ isochrones**, status bar, time slider) built on the spine.
- **`@strata/feature-arcgis`** — optional, lazy Esri adapter: query / statistics / related / `applyEdits` / `queryAttachments`.
- **`@strata/auth-arcgis`** — ESRI-backend-only auth (`assertEsriBackend` throws for a `strata` backend).
- **`@strata/data-management`** — convert + publish (renders a catalog record into a datasource block +
  metadata bundle); `strata-data` CLI.
- **`@strata/export`** — image (+high-DPI) / composed PDF (legend/scalebar/north-arrow) / atlas / feature
  report / share (deep-link+embed) / web-map spec / layer-data (GeoJSON + CSV).
- **`@strata/studio`** — a light visual `AppLayout` editor (pure edit model + preview/inspector shell).

## Tests
- **Vitest**, ~410 unit tests across the packages. Each package has its own `vitest.config.ts`; a root
  `strata/vitest.workspace.ts` runs them all. Run from inside `strata/`: `pnpm test`. Add tests for behavior
  changes — see [Creating a new component/widget/plugin](creating-components.md).

## `strata/reference/` — runnable references
- **`proxy-node` · `proxy-rust` · `proxy-python`** — three reference CORS proxies (one allowlisted contract).

## `WebMaps/` — starter maps
- Four ready-to-use `layers.json` maps (`world` · `usa` · `country` · `state`) that **first run copies into a
  new app** so the Layer panel is never empty. Genuine ESRI Web Map JSON, pastel-styled, OSM basemap. See
  [`guide/map-templates.md`](map-templates.md).

## `recipes/` — your workspace (repo root)
- This is where you build; you don't touch `strata/`. Two **example recipes** ship: `recipes/mapviewer/`
  (map-centric authoring) and `recipes/showcase/` (the kitchen-sink multi-page app), plus
  `recipes/COMPONENT-MANIFEST.md` (the component-config reference) and `recipes/README.md`. Each recipe is a
  spec + prompt-script + **guided wizard**; launch one with `/recipe <name>`, or scaffold a fresh app with
  `/new-app`.
- **Solution recipes are private.** The proprietary business solution recipes are kept in the gitignored
  `.private/solution_recipes/` at the repo root — **not** in the public repo.

## The map spec & the publish artifacts
- **`layers.json`** — the ESRI Web Map JSON map spec (drives `<StrataMap>`).
- **`server_config.toml` + metadata bundle** — how a layer is published to the Strata Serve server: a
  `[[duckdb.datasources]]` block (service/folder/layer_id/path) + a folder with `metadata.toml`,
  `drawingInfo.json`, `popupInfo.json` (and a shared `_defaults/` overlay).

## `strata/docs/`
- **`strata/docs/`** — `getting-started.md` (the on-ramp), `guide/` (per-component), `how-to/` (task
  how-tos), `reference/`, `help/` (the generated, browsable HTML help site), `faq.md`, `troubleshooting.md`.
- Sample `layers.json` maps live under `WebMaps/`.

## Deriving a solution app
A downstream repo (e.g. a Common Operating Picture, or an open-data hub) pulls `strata-app-builder` (submodule or
copy), inherits the whole `.claude` and all packages, and adds only its layers, layout, theme, and data.
