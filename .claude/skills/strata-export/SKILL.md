# strata-export skill pack

Export via `@strata/export`. `/export image|pdf|report|atlas|share|map|layer …`.

- **image** — `exportImage({format:'png'|'jpeg', scale})` — `scale>1` for higher-DPI output.
- **pdf** — `exportPDF({map, title, legend, scalebar, northArrow, layers, layout, attribution})` — a
  **composed** print doc (default to legend + scalebar + north-arrow, not a bare image). Composition builders
  are pure + testable: `legendHtml`, `scalebarSvg`, `northArrowSvg`, `printLayoutCss`, `composePrintHtml`.
- **report** — `exportFeatureReport(attributes, {title, fields, mapImage, chartFields})` → per-feature doc.
- **atlas** — `exportAtlas({features, renderPage, layout})` → one page per feature (map-series).
- **share** — `buildShareUrl(baseUrl, state)` + `buildEmbedSnippet(url)` (reversible via `parseShareUrl`;
  `SHARE_PARAM_NAMES` for the plugin's `urlParameterNames`). Also the `share` widget.
- **map** — `exportSpec()` → the shareable ESRI Web Map JSON (`layers.json`).
- **layer** — `exportLayerData(id, {format:'geoparquet'|'geojson'|'csv'})`.

Used by the open-data hub for downloads, thumbnails, "open this map", and shareable deep-links.
