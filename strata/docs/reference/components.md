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
| **`@strata/map-controls`** | The standard map controls | Framework-free (no React, no runtime deps): the fixed cluster, the layer-list / basemap-gallery drawer, opt-in tools (search · locate · measure · draw · print), and the one keyless **basemap catalog** (33 entries, licence tags, aliases, URL-rewrite hook). Wrapped by `MapChrome`; vendored by vanilla apps. [Map controls](../guide/map-controls.md). |
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

- ✅ **MapChrome — the standard map controls.** A thin, store-driven React wrapper over
  `@strata/map-controls`, mounted on **every** map: one fixed cluster top-right — **zoom in · zoom out ·
  home | layers · basemap · legend · full screen** (Lucide icons) — that apps cannot reorder, move or
  remove, and **one drawer** opening *beside* it. The drawer holds the Map Viewer-style **layer list**
  (eye · inline legend chevron · drag to reorder · a "…" with Zoom to layer · **Layer information**
  — plain About + Technical details read live from the service · Move up/down · Show legend ·
  Transparency · Reset) or the **basemap gallery** (Follow the theme · Recommended 8 + ≤3 app extras ·
  More basemaps grouped OpenStreetMap/Esri/USGS/CARTO, thumbnails, info tooltips). `L` · `B` · `G` ·
  `F` · `Esc`. Store-driven: visibility/transparency/order/basemap go through the store; a theme swap is
  transient. Configured by `mapControls` (`tools` / `basemap` / `scale` / `title`).
  [Map controls](../guide/map-controls.md).
- ✅ **Optional tools — search · locate · measure · draw · print** — **off by default**; each opted
  into per app via `mapControls.tools`. While measure/draw is open it owns map clicks, and every tool
  reverts to *identify* on close.
- ✅ **Optional scale bar** — **off by default**; `mapControls.scale: true` (metric) or
  `{ "units": "metric" | "imperial" | "both" }`, fixed bottom-left (`.smc-scale`). Enable it only when
  the app's job needs distances read off the map.
- ✅ **Legacy `controls` flags** — deprecated, still honoured (`legacyControlsToMapControls`):
  `measure`/`sketch`/`geolocate` → `tools.measure`/`draw`/`locate`; `scale: true` →
  `mapControls.scale: true`; the rest are always on or ignored.
- **NavigationControl / GeolocateControl / FullscreenControl** (deprecated — `<StrataMap>` no longer
  mounts them), **ScaleControl**, **StatusBar** — MapLibre furniture kept for bespoke control bars.
- **Legend** — swatches from each layer's `drawingInfo`, and **a control surface, not a caption**:
  click a class to hide it · shift-click to isolate · `Esc` clears. Hiding builds a real
  `definitionExpression` on the renderer's own field and applies it in place, because a legend row
  **filters, it does not fade** — a faded class is still clickable, so a "hidden" feature can be
  selected through it. Counts keep their denominator (`8,340 of 12,728`).
  It **reads the store**, so showing/hiding a layer anywhere — the layer panel, the map-controls
  drawer — adds or drops it from the legend in the same frame; and it lists **every visible layer**,
  giving one whose symbology belongs to the service a neutral swatch and its title rather than
  omitting it, because an absent row reads as an absent layer.
- **MeasureControl / SketchControl** (deprecated in favour of `mapControls.tools.measure` / `.draw`;
  kept for bespoke tool bars and the `measure` / `draw` widgets) — revert to *identify* when closed.
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

**Every panel is resizable** — that is chrome, not a per-panel feature. A docked panel carries a width grip
on its trailing edge; a floating one adds a height grip and a corner. Grips are draggable *and* arrow-key
operable, clamped to `minWidth`/`maxWidth` (defaults 200–960 px), and `resizable={false}` locks a panel
whose size is load-bearing. `defaultWidth` is a **starting** size: the drag is session state, so a reload
returns to what the app authored.

| Panel | Purpose |
|---|---|
| **LayerPanel** | **One-line rows** (drag-reorder, visibility toggle) each carrying the layer's **own symbology** — one swatch for a single-class renderer, a class stack plus an `N ▸` that expands the full class list for `uniqueValue`/`classBreaks` — drawn from the same `legendRows()` the Legend reads, so the two surfaces cannot disagree. Then a `⋯`/right-click **context menu**: Show table · Zoom · **Filter…** · **Symbology…** · **Popup…** · Rename · Show metadata · Remove. Add-from-URL header button. |
| **BasemapPanel** | Switch basemaps (genuine ESRI `BaseMap`). By default it renders the **same gallery as the map's basemap drawer** (`@strata/map-controls` `mountBasemapGallery`: Follow the theme · Recommended · More basemaps · thumbnails · info tooltips); the basemap in force is always ticked, and legacy ids tick as their alias. A custom `basemaps` library switches to the radiogroup row list, and the **Manage** pill opens it for editing: add / remove / **set-default**, persisted to the map spec via `onLibraryChange`. |
| **AttributeTablePanel** | Sortable table: header filters, column show/hide, **CSV / TSV / JSON / GeoJSON export**, **server paging**, auto **row-windowing**. A row click **adopts** that record — the map flies to it and opens its popup; **clicking it again releases it**, clearing the selection and closing the popup. Emits `rowSelect` (an empty `oids` **is** the release). |
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
dialog) · **`panel`** (dockable/collapsible/**resizable** — a grip on the edge facing the content drags it
along its dock axis, bounded by `minWidth`/`maxWidth`), plus a **`views`** node (tabs / slide stepper, each view
carrying a saved `mapState`, with optional `autoPlay`) and an `animate`
(`fade`/`slide`/`scroll-reveal`/`fly`/`zoom`/`rotate` + `animateOptions`). Pages also take `header`/`footer`
regions and an app `splash`. Widgets (registry `type`), grouped by what they do:

- **Content / map / media** — `map`, `text`, `image`, `embed` (iframe), `video`, `button`, `menu`, `divider`,
  `card`, `list`/`gallery`.
- **Data viz** — `kpi`, `gauge`, `sparkline`, `stacked-bar`, `chart`, `table`.
- **Map tools** — `legend`, `layer-panel`, `basemap` (gallery), `carto`, `status-bar`, `filter`,
  `date-filter`, `query`, `feature-info`, `data-actions`.
- **App chrome / interactivity** — `theme-switch` (light↔dark; **the basemap follows it**),
  `lang-switch`, `share`, `bookmarks`, `swipe`,
  **`controller`** (a tool dock that shows/hides panels), `placeholder` (design-time slot).
- **Analysis** — `analysis` (a shell over the Turf ops), `near-me` (proximity), `add-data` (runtime layer
  add → "explorer" apps), `weighted-overlay` (suitability sliders), `elevation` (drawn-line profile).
- **Writes** — `edit` (an attribute form that saves, adds and deletes through `applyEdits`; needs a
  **writable + authenticated ESRI backend** and says so on its own face) and `attachment` (paging and
  viewing a feature's attachments — a **read**, so it works on Strata Serve too). Strata Serve is
  read-only; see [Writes & editing](../guide/writes-and-editing.md) for what an app can and cannot
  change, and for the **Planned (Phase 8)** annotation store.
- **Customer data** — `upload` (**a file from the reader's machine**, not a service URL: CSV/GeoJSON in,
  identity columns dropped by name, a mapping editor for identifier/label/coordinates/address, optional
  address lookup, published as an output source others bind with `dataSource.fromWidget`). This is how a
  customer's own portfolio, pipeline or shortlist enters an app; `add-data` takes a URL and is not the
  same job.

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
- **[Map controls](../guide/map-controls.md)** — the standard map controls and the basemap catalog.
