# strata-app-builder — conventions for Claude

You are working inside **strata-app-builder**, a Claude Code template for building advanced GIS web apps on
**Strata** or an **ArcGIS Server**, rendered on **MapLibre GL JS** using the **ESRI Web Map JSON**
specification. Your job is to let a GIS admin build and manage maps by command — the work they would
otherwise do in ArcGIS Pro / ArcGIS Online — without writing code.

## Repository layout — keep the root minimal (a rule)

The repo **root is the user's first screen**, so keep it as clean as possible. The things that belong at
the visible root are **`README.md`**, **`llms.txt`**, **`LICENSE`**, **`package.json`** (the root
`pnpm install`/`build`/`test` entrypoint), the **`recipes/`** folder (the user's workspace), the
**`WebMaps/`** starter maps, and the **`strata/`** folder (the library). Everything else lives out of sight:

- **The library — all code, docs, and reference material → `strata/`.** Never add a new top-level file/folder for these.
- **The user works in `recipes/`** (repo root). This is where apps are built; the user does not touch `strata/`.
- **Community-health files → `.github/`** (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, templates,
  workflows). GitHub renders them from there.
- **Authoring layer → `.claude/`.**
- **Private/local material → hidden, gitignored dot-folders:** `.private/strategy/` (internal specs) and
  `.private/solution_recipes/` (proprietary business solution recipes). These live only in a private working
  copy and are never part of the public template. Apps built *from* these recipes are scratch/private too —
  never commit them.
- When you need to add something, ask "does this have to be at the root?" If not, put it under `strata/` (or
  the right dot-folder). Adding a top-level entry should be rare and deliberate.

## Recipes

Recipes live under **`recipes/`** at the repo root — the user's workspace. Two example recipes ship:
**`mapviewer/`** (map-centric authoring app) and **`showcase/`** (the kitchen-sink multi-page app),
alongside **`COMPONENT-MANIFEST.md`** (the component-config reference — bind widgets and wire `connections`
from it). Launch a recipe with **`/recipe <name>`** or scaffold a fresh app with `/new-app`. The
**business solution recipes** are proprietary Strata deliverables that live in the gitignored
**`.private/solution_recipes/`** — **not part of the public template**. Never publish them, and never link
to them from public files (a public clone won't have them).

## Testing

Tests are **Vitest**: each package with logic has a `tests/` dir + its own `vitest.config.ts` + `test`
script, and a root `strata/vitest.workspace.ts` runs everything (`cd strata && pnpm test`; 400+ tests,
`@strata/core-map` alone is 218).
**Add tests for any behavior change**, especially the style/popup compilers, and list any new package in
`strata/vitest.workspace.ts`.

## Docs & the human help site (keep in sync)

`strata/docs/**/*.md` is the **source of truth** and what **you** (Claude) read. A **human-facing HTML help
site** is generated from those same files into `strata/docs/help/` by `strata/docs/help/build_site.py`
(tabaqat-branded). **Rule: whenever you edit any `strata/docs/**/*.md`, regenerate the site** —
`python3 strata/docs/help/build_site.py` (needs `pip install markdown`). Never hand-edit the generated
`*.html`. Add/remove a topic via the `TOPICS` list in `build_site.py`. Policy: `strata/docs/HELP-SITE.md`.

## Reference docs — one spine, four views (keep in sync)

The component surface is described in four docs that share one **inventory** (widgets, nodes, triggers,
actions, commands + status): `docs/reference/components.md` (*what it is*), `docs/reference/human-language.md`
(*what to say*), `docs/reference/commands.md` (*what to type*), and `recipes/COMPONENT-MANIFEST.md`
(*how to configure* — deliberately off the help site). **Code is the source of truth**, never the docs:
`defaultWidgetRegistry` (registry.ts), `StrataTriggerType`/`StrataActionType` (actions/index.ts), the
`LayoutNode` kinds (schema/types.ts). **Rule: adding/renaming a widget, trigger, action, node, or command ⇒
update the code first, then every doc it appears in (follow the update matrix), regenerate the site, and keep
the docs-reconcile Vitest green.** Mark not-yet-built items only as `Planned (Phase N)` callouts (never as
shipped). Full policy + update matrix + status key: `strata/docs/REFERENCE-DOCS.md`.

## First run — greet and orient the user

If this looks like a **first run** — the user hasn't scaffolded an app yet (no app in the workspace, and no
`.strata/onboarded` marker file) — do this **before** anything else:
1. Give a 3-line orientation: what strata-app-builder is, that they build maps by describing them, and the trio
   **`/new-app` to build · `/guide` to decide · `/help` to look up.**
2. **Offer a starter map so the canvas is never empty.** Ask which starting point they want —
   **World · USA · a specific country · a US state** — and **copy the matching template from
   `WebMaps/` into the app as its `layers.json`** (world/usa/country/state), then open it.
   The map renders with **real layers already in the Layer panel** (pastel polygons + cities/airports),
   which proves their setup and the Claude interaction are working. For "a specific country/state," adjust
   the template's `definitionExpression` + `initialState.viewpoint` to their choice (see the folder README).
3. Then ask 2–3 progressive scoping questions (what are you building? where's your data?) **or** offer to run
   `/new-app` to grow the starter into a full app. Don't dump the whole option tree — reveal more as needed.
4. Point to `strata/docs/` for help.
After the user scaffolds or opts out, write a `.strata/onboarded` marker and stop greeting on later runs.

## The core objects

- **The map spec** — `layers.json`, aligned to the ESRI Web Map JSON spec (`operationalLayers`,
  `baseMap`, `spatialReference`, `initialState`). It drives `<StrataMap>`. Schema + types in
  `@strata/schema`. **This is the file most commands read and write.**
- **The catalog record** — the single source of truth for a *published* layer (styling, popup, aliases,
  metadata). Renders into a Strata Serve datasource + metadata bundle.
- **Styling is genuine ESRI `drawingInfo`**; **popups are genuine ESRI `popupInfo`**. Never invent a
  styling DSL — write the ESRI JSON; `@strata/core-map`'s style compiler maps it to MapLibre.
- **Basemaps default to open-source, OpenStreetMap first.** New maps use OSM; the basemap set
  (`@strata/core-map` `OPEN_BASEMAPS` / `defaultBaseMap()`, and `BasemapPanel`'s default) is all keyless
  OSM-derived tiles — OSM · CARTO Positron/Voyager/Dark · OpenTopoMap. Never default to a proprietary or
  API-keyed provider (ESRI/Google/Mapbox); offer those only if the user asks. Basemap `templateUrl` uses the
  ESRI Web Map tokens `{level}/{col}/{row}` (the compiler rewrites them to `{z}/{x}/{y}`).
- **The app layout** — an `AppLayout` JSON (`@strata/schema`) driving **`<StrataApp config={AppLayout}>`**
  (the J.5 layout engine): `AppPage[]` → `LayoutNode` containers (`row`/`column`/`grid`/`section`/`card`,
  `mode:fixed|flow`, responsive) → `WidgetNode`s from `defaultWidgetRegistry`. It is **separate from**
  `layers.json` — the app *references* the map spec, never replaces it. **`/new-app` / `/app` write it**;
  templates: `dashboardTemplate`/`cardGalleryTemplate`/`scrollingStoryTemplate`.

## Map interaction model

- **Active layer** — the layer clicked/highlighted in the Layer panel (`@strata/state` `activeLayerId`). It's
  the default target for **identify** and popups. Prefer acting on the active layer when the user says "this
  layer" without naming one.
- **Interaction modes** — `interactionMode` is `identify` by default; `measure`/`sketch` are set by their
  controls and **must revert to `identify`** when the tool finishes/closes (so the cursor returns to
  identify). Don't leave the map stuck in a tool mode.
- **Identify → popup** — a click in identify mode enriches the top/active feature by OID and shows the
  layer's **`popupInfo`** (genuine ESRI popup). **Define popups** per layer via `layers.json` `popupInfo` or
  the `/popup` command; identify uses whatever is defined (or a default field table).
- **Store-driven map** — when a `store` is passed to `<StrataMap>`, panel actions (visibility/opacity/order/
  remove/basemap/zoom/highlight/**filter**) drive the live map. Wire panels to the store, not ad-hoc map
  calls. In-place server-side filtering is `store.setDefinition(layerId, where)` → the binding calls
  `LayerRegistry.setDefinition` (re-queries the source without remounting the map).
- **Data-action bus + declarative connections** (`@strata/actions` — the WIF) — widgets/panels **cross-drive
  each other**, not just the map. An `ActionBus` carries triggers (`featureSelect`/`categorySelect`/
  `rangeSelect`/`brush`/`rowSelect`/`filterChange`/`extentChange`/`hover`/`flash`/`recordsChange`/…) → actions
  (`filter`/`zoomTo`/`flash`/`viewInTable`/`showStatistics`/`export`/`setUrlParam`/`showHide`/`message`).
  **Author interactivity declaratively**: put a `connections` array on the `AppLayout` (`{from,trigger,to,
  action,options}`); `<StrataApp>` creates the bus and wires it at mount (`wireConnections` +
  `defaultDispatchers`), and threads `id`/`bus`/`outputs` to every widget. A widget can publish an **output
  data source** others consume via `dataSource.fromWidget` (`OutputRegistry`). The map is a **bus sink** when
  given `bus`+`store` (selections/flashes light up). `CartoPanel`/`AttributeTablePanel` emit on the bus; a
  `data-actions` widget (`DataActionMenu`) offers quick actions on a selection. Prefer `connections` over
  ad-hoc panel-to-panel wiring. See the `strata-interactivity` skill.
- **Time filtering** — a time-aware layer is filtered by a **`definitionExpression` on a time field**
  (`instant`: `t <= now`; `window`: `t BETWEEN a AND b`), built by the `TimeSlider` control (play/pause) and
  round-tripping in `layers.json`. Pair with the `TimeSeries` widget (hydrograph). It stacks with any other
  `definitionExpression` filter — read the real time field from the service; never invent it.
- **Editing backend rule** — feature **edits/attachment-writes** (`@strata/feature-arcgis` `applyEdits`) need
  a **writable + authenticated ESRI backend** via `@strata/auth-arcgis` (`assertEsriBackend` **throws** for a
  `strata` backend). **Strata Serve is read-only; Strata editing is planned.** Reads (query/stats/related/
  attachment-view) work on both. Never store or print passwords — mint a short-lived, referer-bound token.

## Two servers, two "add data" paths (do not conflate)

- **Strata GeoAI** (session/orchestrator) — `/add-data`, `/add-layer` add a layer to the *current map*
  (ephemeral).
- **Strata Serve** (`wt-server`, read-only data server) — `/publish` makes a dataset a **permanent
  FeatureServer** endpoint. Started with `wt-server <server_config.toml>` (config is a required arg the
  user provides).

## The publish model (Strata Serve)

Each layer is a DuckDB view over a **GeoParquet** file. To publish:
1. Place the GeoParquet — disk path, or a cloud bucket (`https://…` / `s3://…`).
2. Add a `[[duckdb.datasources]]` block to the config TOML (`id`, `service`, `folder`, `layer_id`,
   `path`, `geometry_column`, `source_wkid=4326`, `layer_metadata_path`).
3. Write a **metadata bundle** at the metadata path: `metadata.toml` (description, `displayField`,
   `[fields.*] alias`, `tile_fields`), `drawingInfo.json`, `popupInfo.json`. Use the `_defaults/` overlay
   for shared symbology.
4. **Restart** `wt-server` (no hot reload) and validate.

URL model: `…/rest/services/{folder}/{service}/FeatureServer/{layer_id}`.

## Restart matrix

`services.json`, `basemaps.json`, the metadata bundles, and the catalog are picked up on a **restart** of
the Serve server (no hot reload). Only touch `config.json`-class settings when necessary. Never read or
print secrets (`llm_keys.json`, tokens).

## Known traps (from real publishing)

- `objectIdField` is **always `OBJECTID`**; `object_id_field` only picks the SOURCE column to cast. A
  string id ⇒ omit it so the OID is synthesised, or points won't render.
- **Do not use `esriSMSPath`** custom markers — use `esriSMSCircle`/`Square`/etc.
- **Polygon fills need low alpha** (~40/255) so overlapping layers stay readable.
- `tile_fields` (vector-tile attributes) ≠ popup fields; keep `tile_fields` small for performance.
- Everything is **EPSG:4326**. Reproject on the way in.

## Style & positioning

Coexistence, never "replace ArcGIS". Use nominative Esri marks with the disclaimer. Keep the GIS admin the
hero. The conversational "Ask the map" AI layer is **off** in this release — do not wire embeddings/LLM
orchestration; the authoring commands here are deterministic.
