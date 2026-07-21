# Components, widgets & skills — what each one is, and how they fit together

strata-app-builder is layered: **packages** (the code), **map controls + panels + widgets** (the UI you compose),
**skills** (how Claude authors each thing), and **commands** (what you type). This page is the map of all of
it — the *purpose and scope* of every piece and *how they work together*. For the exact phrase to ask for
each one, see the **[Human Language Reference](human-language.md)**; for the full command list, see
[Command reference](commands.md).

---

## The big picture (how a request flows)

```
You describe a map/app  ─▶  a /command or /recipe  ─▶  Claude follows a skill
        │                                                     │
        ▼                                                     ▼
   layers.json (the map spec, ESRI Web Map JSON)      AppLayout JSON (the app)
        │                                                     │
        ▼                                                     ▼
   <StrataMap> renders it on MapLibre              <StrataApp> renders the widget tree
        │              ▲                                       │
        │              │  the store (@strata/state)           │  the ActionBus (@strata/actions)
        └──────────────┴───────────── cross-drive ────────────┘   + output data sources
```

Two JSON documents drive everything: **`layers.json`** (the map — layers, basemap, symbology, popups) and the
**`AppLayout`** (the app — pages, containers, widgets, and the `connections` that wire them). They are
separate; the app *references* the map. Two runtime buses keep it all in sync: the **store** (map/layer
state) and the **action bus** (cross-widget interactivity, the WIF).

---

## Packages (`strata/packages/*`) — the code, and its scope

| Package | Purpose | Scope |
|---|---|---|
| **`@strata/schema`** | The contract | Types + JSON Schema for `layers.json`, the `AppLayout` (containers, `ViewsNode`, `Connection`), and the catalog record. Everything else conforms to this. |
| **`@strata/state`** | The map/app store | Zustand store: layers, selection, view, basemap, active layer, interaction mode, undo/redo, and **`setDefinition`** (in-place server-side filter). Round-trips `layers.json`. |
| **`@strata/actions`** | The interactivity bus (WIF) | `ActionBus` (triggers → actions), `wireConnections` + `defaultDispatchers` (drive `AppLayout.connections`), `OutputRegistry` (a widget publishes records others consume), and the `DataAction` registry. |
| **`@strata/arcade`** | Arcade-subset evaluator | Transpiles the common ~80% of ESRI Arcade to a **MapLibre expression** (renderers) or a **computed scalar** (popups). Anything outside the subset warns and falls back. |
| **`@strata/theme`** | The visual system | Colorblind-safe **categorical / sequential / diverging** ramps (light+dark) and named **theme presets** (light/dark/hazard/muted). Symbology, charts, and app themes all draw from here. |
| **`@strata/core-map`** | The map + UI engine | React + MapLibre: the style/popup compilers, ArcGIS/GeoJSON/tile/WMS/**ImageServer/COG** loaders, `<StrataMap>`, all controls, all panels, all widgets, and the `<StrataApp>` layout engine. |
| **`@strata/i18n`** | Bilingual UI | Dependency-free EN/AR dictionary + `{var}` interpolation + RTL direction. |
| **`@strata/processing`** | Spatial analysis | Turf-backed pure ops: buffer/dissolve/clip/nearest/within/spatial-join, plus overlay (union/difference/intersect/voronoi/hull), **aggregate** (dissolve-with-stats), **hexbin/hotspot** (Getis-Ord Gi\*), **weighted-overlay** (suitability), and **dot-density**. |
| **`@strata/plugins`** | The plugin spine | `StrataPlugin` + `StrataAppAPI` + `PluginManager` — runtime extensibility (project state, URL params). |
| **`@strata/plugin-search` / `-routing` / `-statusbar` / `-timeslider`** | First-party plugins | Geocode search (Nominatim/Esri), directions (OSRM/Esri) **+ isochrones** (`fetchIsochrone`, Valhalla/ORS), status bar + scalebar, and the temporal slider. |
| **`@strata/feature-arcgis`** | Esri read/write adapter | Lazy: query / statistics / related records / attachments (read on both backends) / `applyEdits` (writable ESRI only). |
| **`@strata/auth-arcgis`** | ESRI auth guard | `assertEsriBackend` throws for a `strata` backend (editing is ESRI-only). |
| **`@strata/data-management`** | Convert + publish | Renders a catalog record into a Serve datasource block + metadata bundle. |
| **`@strata/export`** | Output | Image (+high-DPI), **composed PDF** (legend/scalebar/north-arrow), **atlas** (map-series), **feature report**, **share** (deep-link + embed), web-map spec, and layer data (GeoJSON/CSV). |
| **`@strata/studio`** | Visual editor | A pure `AppLayout` **edit model** (round-trips the JSON) + a `<StrataStudio>` preview/outline/inspector shell — tweak the result visually instead of re-prompting. |

**How they compose:** `schema` defines the JSON → `state` holds it live → `core-map` renders it (pulling
colors from `theme`, expressions from `arcade`, analysis from `processing`, imagery via the raster path) →
`actions` wires widgets to each other → `export`/`studio` are the output/edit surfaces.

---

## The map surface & controls (`<StrataMap>`)

`<StrataMap>` renders `layers.json` on MapLibre and, when given a `store`, reflects live changes
(visibility/opacity/order/basemap/highlight/**filter**). When also given a `bus`, it is a **WIF sink** —
selections and flashes from other widgets light up on it. Controls layered on the canvas:

- **Navigation / Geolocate / Fullscreen / Scalebar / StatusBar** — the standard map furniture. Set
  `controls.position` (`top-left`/`top-right`/…) so the native cluster **honors a docked/floating panel**.
- **Legend** — swatches from each layer's `drawingInfo`.
- **Measure** (distance/area) and **Sketch** (point/line/polygon) — revert to *identify* when closed.
- **TimeSlider** — play/pause a `definitionExpression` on a time field.
- **Identify → popup** — a click enriches the top/active feature and shows its `popupInfo`.
- **Layer sources** (`source.kind`): `arcgis-feature` · `arcgis-map` · `geojson` · `strata` · `tile` (XYZ) ·
  `wms` · `imageserver` · `cog` (GeoTIFF) · **`vector-tile`** (native MVT + `sourceLayer`) · **`pmtiles`**
  (offline/edge, optional `pmtiles` protocol). Bulk formats (geoparquet/flatgeobuf/zarr) reach the map via
  `/convert` → Strata Serve. The registry serializes mutations, lazy-loads on visibility, clusters, and
  highlights by OID.

---

## Panels (`@strata/core-map/react/panels`) — docked/floating tools

All render inside a shared **`PanelShell`** (fixed or floating, with an Open/Remove menu). Add them with
`/panel <type>`.

| Panel | Purpose |
|---|---|
| **LayerPanel** | **One-line rows** (drag-reorder, visibility toggle) + a `⋯`/right-click **context menu**: Show table · Zoom · **Filter…** · **Symbology…** · **Popup…** · Rename · Show metadata · Remove. Add-from-URL header button. |
| **BasemapPanel** | Switch basemaps (genuine ESRI `BaseMap`), plus a **Manage** pill: add / remove / **set-default**, persisted to the map spec via `onLibraryChange`. |
| **AttributeTablePanel** | Sortable table: header filters, column show/hide, row→map select, **CSV / TSV / JSON / GeoJSON export**, **server paging**, auto **row-windowing**. Emits `rowSelect`. |
| **ChartPanel** | Bar/line/pie via **ECharts** (optional) or an SVG fallback; **clicking a category cross-filters** (emits `categorySelect`). |
| **CartoPanel** | CARTO-style layer list + cross-filter widgets (category/formula/histogram/time). Emits `categorySelect`. |
| **FilterPanel** | Interactive query builder → `definitionExpression` (emits `filterChange`). |
| **DateFilter** | Calendar single/range on a time field → time `definitionExpression`. |
| **FeatureInfoPanel** | Docked feature detail (the popup element model, pinned beside the map); consumes `featureSelect`. |
| **DataActionMenu** | Quick actions on a selection — Zoom/Flash/View-in-table/Export/Clear — dispatched through the bus. |
| **EditPanel** | Update/add/delete features — **needs a writable + authenticated ESRI backend**. |
| **AttachmentViewer** | Page through features and view image/video/PDF attachments (read-only, both backends). |
| **SavedItemsPanel** | One config-driven manager for any saved list (charts / tables / bookmarks) — add / open / rename / remove; pairs with `materializeChart`/`materializeTable` (re-run a saved descriptor live, "expression not snapshot"). |

---

## Layout widgets (`defaultWidgetRegistry`) — the `AppLayout` building blocks

`<StrataApp>` renders a tree of **containers** holding **widgets**. Containers: `row` · `column` · `grid` ·
`section` · `card` · **`accordion`** · **`flow-row`** · **`splitter`** (resizable) · **`window`** (modal
dialog) · **`panel`** (dockable/collapsible), plus a **`views`** node (tabs / slide stepper, each view
carrying a saved `mapState`, with optional `autoPlay`) and an `animate`
(`fade`/`slide`/`scroll-reveal`/`fly`/`zoom`/`rotate` + `animateOptions`). Pages also take `header`/`footer`
regions and an app `splash`. Widgets (registry `type`), grouped by what they do:

- **Content / map / media** — `map`, `text`, `image`, `embed` (iframe), `video`, `button`, `menu`, `divider`,
  `card`, `list`/`gallery`.
- **Data viz** — `kpi`, `gauge`, `sparkline`, `stacked-bar`, `chart`, `table`.
- **Map tools** — `legend`, `layer-panel`, `basemap` (gallery), `carto`, `status-bar`, `filter`,
  `date-filter`, `query`, `feature-info`, `data-actions`.
- **App chrome / interactivity** — `theme-switch`, `lang-switch`, `share`, `bookmarks`, `swipe`,
  **`controller`** (a tool dock that shows/hides panels), `placeholder` (design-time slot).
- **Analysis** — `analysis` (a shell over the Turf ops), `near-me` (proximity), `add-data` (runtime layer
  add → "explorer" apps), `weighted-overlay` (suitability sliders), `elevation` (drawn-line profile).

**They work together through the WIF:** every widget gets an `id`, the shared `bus`, and the `outputs`
registry. An `AppLayout.connections` array declares *"when `from` emits `trigger`, run `action` on `to`"* —
`<StrataApp>` wires the bus at mount, so a chart click filters the map + table, a category cross-filters
every widget, a row zooms the map. Filters apply **in place** (`store.setDefinition`, no remount). See the
[`strata-interactivity`](human-language.md#8-widget-interactivity-the-wif) skill.

---

## Skills (`.claude/skills/*`) — how Claude authors each thing

A skill is a cheatsheet + recipes + ESRI reference + traps that Claude loads for a task. Each maps to a
surface above:

| Skill | Authors | Pairs with |
|---|---|---|
| **strata-map** | `layers.json` (the map spec) incl. raster (ImageServer/COG) | `/create-map`, `/add-data` |
| **strata-symbology** | ESRI `drawingInfo` renderers (from `@strata/theme` palettes) | `/symbology` |
| **strata-popups** | ESRI `popupInfo` (media/charts/attachments/related/Arcade) | `/popup` |
| **strata-charts** | Charts (ECharts/SVG) + the depth table | `/panel chart`, `/app` |
| **strata-panels** | Every docked/floating panel | `/panel` |
| **strata-interactivity** | The WIF — `AppLayout.connections` + output data sources | `/app`, `/new-app`, `/panel` |
| **strata-layout** | The `AppLayout` (templates, views/slides, containers, design widgets) | `/app`, `/new-app` |
| **strata-export** | Composed PDF / report / atlas / share / data export | `/export` |
| **strata-data** | Convert / publish / analyze | `/convert`, `/publish`, `/analyze` |
| **strata-brand** | Tokens, theme presets, bilingual + the disclaimer footer | all |

---

## Commands (`.claude/commands/*`) — what you type

Onboarding (`/new-app`, `/guide`, `/help`, `/what-can-i-do`, `/recipe`), map authoring (`/create-map`,
`/add-data`, `/symbology`, `/popup`, `/panel`, `/timeslider`, `/app`, `/edit`, `/attachments`, `/analyze`),
data (`/convert`, `/publish`, `/update-metadata`), and `/export`. Full list with arguments:
[Command reference](commands.md).

---

## See also
- **[Human Language Reference](human-language.md)** — the phrase to ask for each component (recipe fuel).
- **[Creating a new component/widget/plugin](../guide/creating-components.md)** — prerequisites + the recipe.
- **[Repository anatomy](../guide/anatomy.md)** — where every file lives.
