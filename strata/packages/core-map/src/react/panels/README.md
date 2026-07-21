# panels

Store-driven management panels (§4.7), placeable `surface="canvas"` or `surface="page"` and
cross-linked to a `mapId`. Each subscribes to the vanilla `@strata/state` store via React's
`useSyncExternalStore` and **drives store actions** for the state it owns (visibility, opacity,
order, rename, basemap, selection), while delegating live-map-only actions to **optional callback
props** (`onZoomTo`, `onApplyBasemap`, `onHighlight`, `onToggleLabels`, `onIdentifyToggle`,
`onOpenTable`, `onRowSelect`, `onQueryData`, `onExport`). They are dependency-light — no
TanStack/Tabulator/ECharts — with inline notes marking where those can be swapped in.

## Implemented

- **`LayerPanel`** — feature-layer management. Visibility, opacity, reorder (up/down), inline
  rename (via the store's `renameLayer`), zoom-to, labels, identify, open attribute table, remove;
  highlights the active/selected layer. Props: `{ store, onZoomTo?, onHighlight?, onToggleLabels?,
  onIdentifyToggle?, onOpenTable? }`.
- **`BasemapPanel`** — basemap management. Lists basemaps (active highlighted), builds a genuine
  ESRI `BaseMap` on click → `store.setBaseMap` + `onApplyBasemap`; "Add basemap" row appends a
  tile/style URL. Props: `{ store, basemaps?, onApplyBasemap? }` — `basemaps` defaults to `OPEN_BASEMAPS`
  (open-source, **OpenStreetMap first**). Exports `buildBaseMap`.
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
