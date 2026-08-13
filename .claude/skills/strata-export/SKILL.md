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

## Known traps

- **An export carries its caveats with it.** A CSV leaves the app and is read with no chrome around it,
  so any banding, apportionment or "advertised, not measured" qualifier belongs in the **file's own
  header comment** — not only on the screen it came from.
- **Export the current scope, and name it.** If a filter is active, the file is that subset; say which
  in the header and in the filename, or a partial extract will be read as the whole register.
- **`exportImage` returns a blank image** unless the MapLibre map was created with
  `preserveDrawingBuffer: true`.
- **A composed PDF is the default, not a bare screenshot** — legend, scalebar, north arrow, attribution.
- **Never export a figure the suite has not asserted.** Everything in the file should come from the same
  domain module the screen renders from.
