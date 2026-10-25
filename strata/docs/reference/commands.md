# Command reference

All commands live in `.claude/commands/`. They read/write the map spec (`layers.json`), the app layout
(`AppLayout`), the catalog record, and the Strata Serve config + metadata bundle.

## Onboarding & discovery
| Command | Purpose |
|---|---|
| `/new-app [description]` | Guided wizard — interview, then scaffold a working app (layout/panels/plugins/proxy/auth) and install deps. |
| `/guide <goal>` | Decision helper — state a goal, get routed to the exact command / plugin / doc. |
| `/what-can-i-do` | Full capability list (no scaffold). |
| `/help` | Capabilities + task how-tos. |

## Map authoring
| Command | Purpose |
|---|---|
| `/create-map --layers … [--extent --basemap --preset]` | Generate a `layers.json`. `--basemap` takes a basemap-catalog id (retired ids resolve through `BASEMAP_ALIASES`); the default is OpenStreetMap (`osm`). |
| *(no command — on every map)* standard map controls | The fixed cluster (zoom in · zoom out · home \| layers · basemap · legend · full screen), the layer list with its "…" actions (Zoom to layer · Layer information · Move up/down · Show legend · Transparency · Reset) and the basemap gallery ship on every map; nothing to add. Opt into tools (search · locate · measure · draw · print — all off by default), extra recommended basemaps and the print title with `mapControls` on the `map` widget, via `/app`. See [Map controls](../guide/map-controls.md). |
| `/add-data --url <FeatureServer/N> [--secured] \| --geojson <file\|url> \| --imageserver <ImageServer> \| --cog <geotiff-url>` | Add a layer to the current map (session) — ArcGIS service, GeoJSON, ESRI ImageServer, or a COG. |
| *(no command — an authored widget)* `upload` | **The customer's own file**, chosen in the running app rather than authored into the map: a CSV or GeoJSON from their machine, identity columns dropped by name, columns mapped, addresses optionally looked up, published as an output source. Add it to an `AppLayout` with `/app`; configure it from `recipes/COMPONENT-MANIFEST.md`. |
| `/symbology <id> simple\|classBreaks\|uniqueValue\|dotDensity\|heatmap [--generate field=… \| valueExpression=…]` | Author an ESRI renderer (multi-field unique-value, Arcade `valueExpression`, and dot-density supported; palettes from `@strata/theme`). |
| `/popup <id> "…"` | Author an ESRI `popupInfo` (media images/charts, attachments, related records, Arcade `expressionInfos`). |
| `/panel <filter\|date-filter\|feature-info\|list\|table\|statistics\|chart\|carto\|edit\|attachment\|time-series\|statusbar\|swipe\|bookmarks\|data-actions> <layer> [--surface --slot --width --min-width --max-width --no-resize]` | Add an advanced panel (`filter`/`date-filter` query UIs, `feature-info` docked detail, `data-actions` = WIF quick-action menu). Panels are **resizable by default**: `--width` is the starting size, `--min-width`/`--max-width` bound the drag, `--no-resize` locks it. |
| `/timeslider <id> --field <t> [--mode instant\|window --range --step]` | Animate a time-aware layer via a time `definitionExpression`. |
| `/analyze <op> <id> [--field --cell-km --minutes …]` | Run a Turf-backed spatial analysis (overlay / aggregate / hexbin / hotspot / weighted-overlay / isochrone) and add the result as a layer. |

## Declarative apps
| Command | Purpose |
|---|---|
| `/app [dashboard\|gallery\|story] [--map --pages --bilingual]` | Compose an `AppLayout` JSON for `<StrataApp>` (J.5 layout engine: pages → row/column/grid/section/card → widgets). Emits a `connections` block (WIF) so the app cross-filters on the first build — see the `strata-interactivity` skill. |

## Editing & attachments (writable + authenticated ESRI backend)
| Command | Purpose |
|---|---|
| `/edit <id> [--fields --allow add,update,delete]` | Add an `EditPanel` (update/add/delete features via `applyEdits`). Requires a writable, authenticated ESRI backend; Strata Serve is read-only. Placeable in an `AppLayout` as `edit`. **Recording a decision that persists between sessions is a different thing and is not available** — see [Writes & editing](../guide/writes-and-editing.md). |
| `/attachments <id>` | Add an `AttachmentViewer` — page through features and view image/video/PDF attachments (read-only; works on both backends). |

## Data — convert & publish (Strata Serve)
| Command | Purpose |
|---|---|
| `/convert <path>` | GDB / Shapefile / GeoJSON (both flavors) / ESRI JSON / CSV / KML → EPSG:4326 GeoParquet. |
| `/publish <path> --config <server_config.toml> [--service --folder --layer-id --data-dir]` | Full publish → FeatureServer. |
| `/update-metadata <id> [--description --alias --display-field --tile-fields]` | Edit `metadata.toml` in the bundle + restart. |

Symbology/popup for a *published* layer are rewritten in the metadata bundle by `/symbology` / `/popup`
(they target `drawingInfo.json` / `popupInfo.json` when the layer is Strata-served), then restart.

## Export
| Command | Purpose |
|---|---|
| `/export image [--format --scale]` | View → PNG/JPEG (`--scale 2` for higher-DPI). |
| `/export pdf [--legend --scalebar --north-arrow --layout --title]` | Composed print/PDF (legend/scalebar/north-arrow, Letter/A4). |
| `/export report` | Per-feature report (attributes + map inset + chart). |
| `/export atlas` | Map-series — one page per feature. |
| `/export share` | Deep-link + embed snippet of the current state. |
| `/export map` | Shareable ESRI Web Map spec. |
| `/export layer <id> --format geoparquet\|geojson\|csv` | Layer data download (GeoJSON/CSV real; GeoParquet is server-side). |

Programmatic equivalents live in `@strata/data-management` (`strata-data render`) and `@strata/export`.

## Reference
| Doc | Purpose |
|---|---|
| [Components, widgets & skills](components.md) | Purpose/scope of every package, panel, widget, and skill — and how they fit together. |
| [Human Language Reference](human-language.md) | The phrase to ask for each component (recipe fuel). |
| [Map controls](../guide/map-controls.md) | The standard map controls, `mapControls`, the basemap catalog and its licences. |
| [Creating a new component/widget/plugin](../guide/creating-components.md) | Prerequisites + the recipe for extending the core. |
