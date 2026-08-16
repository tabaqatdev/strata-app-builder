---
description: Add an advanced layer/table/data panel (filter, list, table, statistics, chart, carto, edit, attachment, time-series, status bar) to a map.
argument-hint: <filter|date-filter|feature-info|list|table|statistics|chart|carto|edit|attachment|time-series|statusbar|swipe|bookmarks|data-actions> <layerId|tableId> [--surface canvas|page --slot <sel>] [--width <px> --min-width <px> --max-width <px> --no-resize]
---

Add an advanced panel (§4.7) bound to a map (`mapId`). Panels run inside a shared **`PanelShell`** —
**floating (draggable)** or **fixed**, with a `⋯`/right-click context menu and a close button. They render on
the map canvas (`--surface canvas`) or in any page slot (`--surface page --slot <css-selector>`), and stay
selection/filter-synced with the map.

**Every panel is resizable, and that is not something you switch on** — the shell ships a drag grip on the
edge (plus a height grip and corner when floating), arrow-key operable for keyboard and touch users. So
`--width` (`defaultWidth`) sets where the panel *starts*, not where it stays. Bound the drag with
`--min-width`/`--max-width` (defaults 200/960 px) when a panel has a floor or ceiling that matters — a table
that is unreadable under ~360 px, a rail that must not eat the map. Pass `--no-resize` (`resizable:false`)
only where a locked size is load-bearing, and say why in the recipe. The dragged size is **session state**:
a reload returns to the authored width, so the app spec stays the source of truth. Beside a `<StrataMap>`
you need no extra wiring — the map observes its own box and calls `map.resize()` itself.

Write the panel as a config object in `strata:extensions` (or app code) and wire its cross-widget actions.
For **cross-panel** cross-filtering (a click in one panel driving *all* others, not just the map), pass the
**`@strata/actions` bus** (`ActionBus`) — `CartoPanel` and `AttributeTablePanel` accept an optional `bus`.
**In a declarative `<StrataApp>`, prefer authoring `AppLayout.connections`** (the WIF — see the
`strata-interactivity` skill) instead of hand-wiring: give the panel a widget `id` and emit connections so its
`categorySelect`/`rowSelect`/`filterChange` cross-filter the map and other widgets **in place**
(`store.setDefinition`, no remount).

Panel types:
- **filter** → **`FilterPanel`**: an interactive query builder (rows of field/operator/value, AND/OR) →
  `definitionExpression`, emits `filterChange` on the bus so it filters the layer **in place**. The friendly,
  always-visible filter UI. Pass `fields` (name/label/type).
- **date-filter** → **`DateFilter`**: a calendar single-date / from–to range on a time field → time
  `definitionExpression` (emits `filterChange`). Stacks with other filters; pair with `/timeslider` for play.
- **feature-info** → **`FeatureInfoPanel`**: a docked feature-detail card (the #4 popup element model, pinned
  beside the map). Bind it to `featureSelect` (bus) with an `onResolve(layerId, oid)`, or pass a `feature`
  prop. Essential for dashboard layouts where detail lives next to the map, not as an on-map popup.
- **list** → card list (title/subtitle/thumbnail; click → highlight + zoom).
- **table** → `AttributeTablePanel`: sort, per-column header filter, column show/hide, **row→map adopt/release**
  (click a row: the map flies to that record and opens its popup; click it again: selection cleared, popup
  closed),
  **CSV + GeoJSON export** built in (pass `geometry(row)` for real geometry; `onExport` still does GeoParquet),
  **server-side paging** (`page`+`onPageChange` → `queryFeatures` `resultOffset`/`resultRecordCount`), and
  auto **row windowing** past ~150 rows. Emits `rowSelect` on the bus.
- **statistics** → count / sum / avg / min / max / group-by over the current filter (expression-backed).
- **chart** → `ChartPanel`: expression-backed bar/line/pie (Apache ECharts when the optional `echarts` dep is
  installed, else a dependency-free SVG fallback; drag-reorder). **Clicking a category emits `categorySelect`
  on the bus** → cross-filters the map + table (author the `connections` so it applies in place).
- **carto** → **`CartoPanel`**: a CARTO Builder-style **layer list + data widgets** (category / formula /
  histogram / time-series) that **cross-filter the map** (category click → `definitionExpression` via
  `onFilter`); emits `categorySelect` on the bus. The interactive-legend / cross-filter showcase.
- **edit** → **`EditPanel`**: update/add/delete a selected feature via `applyEdits`. **Requires a
  writable + authenticated ESRI backend** (`@strata/auth-arcgis`); Strata is read-only (editing planned).
  See `/edit`.
- **attachment** → **`AttachmentViewer`**: page through features, view image/video/PDF attachments
  (`queryAttachments`, both backends). See `/attachments`.
- **time-series** → a **`TimeSeries`** widget: inline-SVG line/area chart with optional threshold **bands**
  (the flood **hydrograph** / acres-trend). Pair with `/timeslider`.
- **statusbar** → the **`StatusBar`** control: live cursor **coordinates**, **zoom**, **scale (1:N)**, **CRS**
  (EPSG:4326). Also available as `@strata/plugin-statusbar` (+ scalebar) for plain-DOM hosts.
- **swipe** → compare two layers or two synced maps.
- **bookmarks** → saved views.
- **data-actions** → **`DataActionMenu`** (WIF W3): quick actions on a selection — Zoom · Flash ·
  View-in-table · Export · Clear (extend via `dataActionRegistry`). Auto-tracks `featureSelect`/`rowSelect`
  on the bus, dispatching through it.

Show the panel config and where it renders.

## Layer-panel rules the built apps settled

- **List the primary layer first**, with a live drawn-count. A panel that omits the map's actual content
  is why one report read "all the layers are hidden".
- **Label every row with its real state** — *off* · *N in view* · *none in this view* · *capped* ·
  *not mappable* — so "switched off" and "empty here" can never be confused. Default the cheap, always-
  present context **on**, and badge how many context layers are actually drawing.
- **A layer that can never draw refuses to toggle**, and says why.
- **A legend counts what it actually filters.** Show the denominator (`8,340 of 12,728`) and state in
  words that isolating changes the map, not the reading.
- **Persistent caveats go in a notice bar, not the status line** — a status message is overwritten by
  load progress and never reaches the user.
- **Never truncate silently** — `+N more` · `Capped, not complete` · `250 of 1,975 rows`.
- **A panel the user can widen is a panel that can show its full row.** Set the floor (`--min-width`) at the
  width the panel is still readable at, rather than truncating labels to fit a size the user could have fixed
  themselves. A table panel earns a larger `--max-width` than a legend rail.
