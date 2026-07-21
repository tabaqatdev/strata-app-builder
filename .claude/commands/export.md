---
description: Export a map as a composed print PDF, an image, a feature report, an atlas, a share link, a web-map spec, or layer data.
argument-hint: image|pdf|report|atlas|share|map|layer [--format png|jpeg|geoparquet|geojson|csv] [--scale 2] [--legend --scalebar --north-arrow --layout letter|a4 --title "…"]
---

Use `@strata/export` (all really implemented — no stubs):
- **image** — `exportImage({ format, scale })` → PNG/JPEG of the current extent. `scale > 1` re-draws at
  higher resolution (pragmatic high-DPI; a true re-render needs the map at a higher `pixelRatio`).
  `preserveDrawingBuffer` must be on.
- **pdf** — `exportPDF({ map, title, attribution, legend, scalebar, northArrow, layers, layout })` → a
  **composed** print layout: map image + a **legend** (built from each layer's `drawingInfo`), a
  **scalebar**, a **north-arrow**, on a Letter/A4 × portrait/landscape page → Save as PDF. **Default to a
  composed PDF** (legend + scalebar + north-arrow), not a bare image.
- **report** — `exportFeatureReport(attributes, { title, fields, mapImage, chartFields })` → a titled,
  one-feature document (attributes + a map inset + a small bar chart). Offered by the reporter/manager recipes.
- **atlas** — `exportAtlas({ features, renderPage, layout })` → a **map-series**: one page per feature (the
  caller re-extents the map per page), page-broken for print.
- **share** — `buildShareUrl(baseUrl, state)` / `buildEmbedSnippet(url)` → a deep-link that reopens the app at
  the current view/basemap/active-layer/filters (round-trips via `parseShareUrl`; a plugin declares the
  `SHARE_PARAM_NAMES` as `urlParameterNames`). Also surfaced as the **`share` widget** in `<StrataApp>`.
- **map** — `exportSpec()` → the ESRI Web Map JSON `layers.json` (shareable / re-openable).
- **layer** — `exportLayerData(id, { format })` → GeoJSON / CSV `Blob` download; GeoParquet is server-side.

Report the output path/URL.
