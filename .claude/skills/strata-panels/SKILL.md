# strata-panels skill pack

Advanced layer/table/data panels (§4.7). `/panel <type> <layer|table> [--surface canvas|page --slot …]`.
Every panel runs inside a shared **`PanelShell`** — **floating (draggable)** or **fixed**, with a `⋯`/
right-click context menu (Open, Remove, + custom) and a close button.

Types: **filter** (`FilterPanel` — query builder → definitionExpression, emits `filterChange`),
**date-filter** (`DateFilter` — calendar single/range on a time field → time definitionExpression),
**feature-info** (`FeatureInfoPanel` — docked feature detail, reuses the popup element model; bind to
`featureSelect`), **list** (cards), **table** (`AttributeTablePanel`: sort, header filter, column show/hide,
row→map select, **CSV + GeoJSON** export built-in + `onExport` GeoParquet, **server paging**, **row
windowing**, Show metadata), **statistics** (count/sum/avg/min/max/group-by), **chart** (`ChartPanel`:
bar/line/pie via ECharts-optional/SVG-fallback, drag-reorder, **click → categorySelect** cross-filter),
**carto**, **edit**, **attachment**, **time-series**, **statusbar**, **swipe**, **bookmarks**,
**data-actions** (WIF quick-action menu), **related** records.

The management panels live in `@strata/core-map/react/panels`: `LayerPanel` (visibility/opacity/reorder/
rename/zoom/labels/identify/open-table/remove, drag-to-reorder rows, header "+" add-from-FeatureServer-URL),
`BasemapPanel` (list/switch/add basemaps → genuine ESRI `BaseMap`), `AttributeTablePanel`, `ChartPanel`.

## New panels
- **`CartoPanel`** — a CARTO Builder-style **layer list + data widgets** (category / formula / histogram /
  time-series) bound to a layer that **cross-filter the map** (category click → `definitionExpression` via
  `onFilter`). Store-driven layer list, `onQuery(spec)` for aggregation, reuses `KpiCard`/`Sparkline`. Emits
  `categorySelect` on the **`@strata/actions`** bus. The interactive-legend / cross-filter showcase.
- **`EditPanel`** — attribute form to **update / add / delete** a selected feature via
  `@strata/feature-arcgis` `applyEdits`. **Requires a writable + authenticated ESRI backend**
  (`@strata/auth-arcgis`) — **Strata Serve is read-only; Strata editing is planned.** The banner flags this.
  See `/edit`.
- **`AttachmentViewer`** — page through features and view **image/video/PDF attachments**
  (`queryAttachments()` in `@strata/feature-arcgis`, dependency-light REST, both backends). See `/attachments`.
- **`StatusBar`** (control, `react/controls`) — live cursor **coordinates**, **zoom**, **scale (1:N)**, **CRS**
  (EPSG:4326). Same as `@strata/plugin-statusbar` (+ scalebar) for plain-DOM/non-React hosts.
- **time-series** — the `TimeSeries` widget (hydrograph w/ bands); pair with the `TimeSlider` control
  (`/timeslider`).

## Cross-panel actions (`@strata/actions`)
Each panel is a config object in `strata:extensions`, bound to a `mapId`, placeable on canvas or in a page
slot. For cross-widget actions (e.g. chart/category → filter table + map), pass the **`ActionBus`**:
`CartoPanel` and `AttributeTablePanel` accept an optional `bus`, so a category/row click cross-filters
**all** widgets/panels via `categorySelect`/`rowSelect`/`filterChange` (+ `connectBusToStore`) — not just the map.
