# panels

Store-driven management panels (§4.7), placeable `surface="canvas"` or `surface="page"` and
cross-linked to a `mapId`. Each subscribes to the vanilla `@strata/state` store via React's
`useSyncExternalStore` and **drives store actions** for the state it owns (visibility, opacity,
order, rename, basemap, selection), while delegating live-map-only actions to **optional callback
props** (`onZoomTo`, `onApplyBasemap`, `onHighlight`, `onToggleLabels`, `onIdentifyToggle`,
`onOpenTable`, `onRowSelect`, `onQueryData`, `onExport`). They are dependency-light — no
TanStack/Tabulator/ECharts — with inline notes marking where those can be swapped in.

## Implemented

- **`LayerPanel`** — feature-layer management. **One-line rows**: drag-handle reorder, a visibility
  checkbox, the layer's **own symbology** (one swatch, or a class stack plus an `N ▸` that expands the
  full class list — drawn from the same `legendRows()` the `Legend` reads, so the panel and the legend
  cannot disagree), the title, and a `⋯` / right-click menu (show table · zoom-to · filter · symbology ·
  popup · rename · metadata · remove). Inline rename goes through the store's `renameLayer`; the
  active/selected layer is highlighted. Props: `{ store, onZoomTo?, onHighlight?, onOpenTable?,
  onShowTable?, onFilter?, onSymbology?, onPopup?, onShowMetadata?, onAddLayer?, … }`.
- **`BasemapPanel`** — basemap management. **By default it renders the `@strata/map-controls`
  basemap gallery** (`mountBasemapGallery` — the same component as the map's basemap drawer: Follow the
  theme, Recommended 8 + `recommendedExtras` (≤ 3), More basemaps grouped by provider, thumbnails, info
  tooltips; legacy ids tick as their alias). A pick builds a genuine ESRI `BaseMap` →
  `store.setBaseMap` + `onApplyBasemap`. Passing a `basemaps` library, or opening **Manage** (add a
  tile/style URL, remove, set default → `onLibraryChange`), switches to the radiogroup row list, whose
  default library is the full catalog (the deprecated `OPEN_BASEMAPS` shim). Props: `{ store,
  basemaps?, recommendedExtras?, themeMode?, onApplyBasemap?, onLibraryChange? }` — `themeMode` falls
  back to the surrounding `<StrataApp>`'s mode, which is what **Follow the theme** follows. An explicit
  pick clears `store.baseMapFollowsTheme` so the theme stops choosing. Exports `buildBaseMap` and
  `useFollowsTheme`.
- **`AttributeTablePanel`** — attribute table. Sortable headers, per-column filter row, column
  show/hide menu, row-click select (`onRowSelect(oid)`), inline **CSV export** (plus `onExport` for
  GeoJSON/GeoParquet). Columns inferred from rows when omitted. Props: `{ title?, columns?, rows,
  fieldAliases?, oidField?, onRowSelect?, onExport? }`.
- **`ChartPanel`** — expression-backed chart management (bar/line/pie) with a compact built-in SVG
  renderer (`MiniChart`). Add via a small form, remove, data via `onQueryData(source)` or inline
  `chart.data`. Props: `{ store?, charts, onAddChart?, onRemoveChart?, onQueryData? }`.

## Still scaffolded

- **FilterPanel** (WhereBuilder) · **List/Cards** · **Multi-sheet Table**
- **Statistics/Summary** · **Chart-linked Table** (cross-widget actions) · **Related Records**
- **Bookmarks** · **Swipe/Compare** · **Time**
