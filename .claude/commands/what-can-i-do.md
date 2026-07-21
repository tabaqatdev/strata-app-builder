---
description: List everything strata-app-builder can do — commands, packages, plugins, analysis, export (no scaffold).
---

Pure discovery — list capabilities so the user learns what's here. Do **not** scaffold anything; end by
pointing to `/new-app` (to build) and `/guide` (to decide).

Summarize, grouped:
- **Map & authoring:** `/create-map`, `/add-data`, `/add-geojson`, `/symbology` (simple/classBreaks/uniqueValue/heatmap),
  `/popup`, `/panel`, `/labels`. Rendering by `@strata/core-map` (`<StrataMap>` + the ESRI→MapLibre style compiler).
  LayerRegistry handles arcgis-feature, geojson, strata, **tile/XYZ**, **WMS**, **clustering**, and **refresh intervals**.
- **Layouts:** full-page, map-in-scroll, split dashboard, multi-map — widgets on the map canvas or the page.
- **Declarative apps (J.5 layout engine):** `/app` → an **`AppLayout`** JSON for **`<StrataApp>`**
  (pages → row/column/grid/section/card containers, `mode:fixed|flow`, responsive) rendered from a widget
  registry — templates: **dashboard / card-gallery / scrolling-story**.
- **Widgets (`@strata/core-map/react/widgets`):** `KpiCard`, `RadialGauge`, `Sparkline`, `StackedBar`, `StatRow`,
  **`TimeSeries`** (hydrograph w/ bands), and content widgets `Card`, `ListGallery`, `Text`, `Image`, `Button`, `Menu`, `Container`.
- **Panels (`react/panels`, in a floating/fixed `PanelShell`):** `LayerPanel`, `BasemapPanel`,
  `AttributeTablePanel`, `ChartPanel`, **`CartoPanel`** (CARTO-style layer + cross-filter widgets),
  **`EditPanel`** (writable+authed ESRI backend), **`AttachmentViewer`**.
- **Controls (`react/controls`):** Navigation/Geolocate/Fullscreen/Scale, Measure/Sketch (revert-to-identify),
  **`Legend`**, **`StatusBar`** (coords/zoom/scale/CRS), **`TimeSlider`** (play/pause time filter).
- **Data-action bus (`@strata/actions`):** `ActionBus` + `categorySelect`/`rowSelect`/`filterChange` +
  `connectBusToStore` — widgets/panels cross-drive each other, not just the map.
- **Data & publish:** `/convert` (GDB/SHP/GeoJSON both flavors/CSV/KML→GeoParquet), `/publish` to the Strata
  Serve server, `/update-symbology`/`/update-popup`/`/update-metadata`. Advanced feature ops via
  **`@strata/feature-arcgis`** (query/statistics/related/**edits**/**attachments**), auth via
  **`@strata/auth-arcgis`** (ESRI backend only).
- **Editing & attachments:** `/edit` (update/add/delete — writable+authed ESRI backend; Strata planned),
  `/attachments` (view image/video/PDF attachments — both backends).
- **Temporal:** `/timeslider` (animate time-aware layers via a `definitionExpression` on a time field) +
  the `TimeSeries` hydrograph.
- **Analysis (`@strata/processing`, Turf):** buffer, nearest, within-distance, spatial join, select-by-location,
  dissolve, clip, centroids.
- **Plugins (`@strata/plugins`):** search (`@strata/plugin-search` OSM/Esri), routing (`@strata/plugin-routing`
  OSRM/Esri + nearest), **`@strata/plugin-statusbar`**, **`@strata/plugin-timeslider`**, and any external plugin.
- **State (`@strata/state`):** layer/selection/view/active-layer store with undo/redo.
- **Export (`@strata/export`):** image, **PDF (real)**, shareable web-map spec, **layer data GeoJSON/CSV (real)**.
- **i18n (`@strata/i18n`):** EN/AR + RTL via `I18nProvider`/`useI18n`; plus `ErrorBoundary`.
- **Connectivity:** CORS via Vite dev-proxy, CORS on the Serve server, or `strata/reference/proxy-{node,rust,python}`.
- **Docs:** `strata/docs/` (guide, help, reference, faq, troubleshooting).

Close with: **`/new-app` to build · `/guide` to decide · `/help` to look up.**
