---
description: Author or change a layer's symbology (ESRI drawingInfo renderer) from a natural description.
argument-hint: <layerId> <simple|classBreaks|uniqueValue|dotDensity|heatmap> [--generate field=<f> classes=<n> ramp=<name>]
---

Write a **genuine ESRI renderer** into the layer's `layerDefinition.drawingInfo.renderer` (in the map
spec) — or into `drawingInfo.json` in the metadata bundle for a *published* layer (then restart).

**Default rich, not flat.** Unless the user explicitly asks for one flat color, reach for a *data-driven*
renderer: a **class-breaks** ramp for a numeric field or a **unique-value** scheme for a categorical field.
Draw colors from the validated **`@strata/theme`** palettes (`sequential`/`diverging` for graduated,
`categorical` for unique-value — all colorblind-safe, light+dark) via `hexToEsri(hex, alpha)`, so the layer
is coherent with the app theme on the first pass. A single-symbol `simple` renderer is the fallback, not the
default.

Renderer types:
- **simple** — one symbol. Polygons: `esriSFS` solid fill with LOW alpha (~40/255) + `esriSLS` outline.
  Points: `esriSMS` `esriSMSCircle` (never `esriSMSPath`). Lines: `esriSLS`.
- **classBreaks** — numeric field → graduated. Compute sensible breaks (quantile/natural) over the field's
  range; ramp from `@strata/theme` `sequential(n, "blues"|"viridis"|…)` (or `diverging` for above/below a
  midpoint). Set `field`, `classBreakInfos[]` with `classMaxValue` + `symbol`.
- **uniqueValue** — categorical field → one color per value from `@strata/theme` `categorical(n)`. Set
  `field1`, `uniqueValueInfos[]`, and a `defaultSymbol`. **Multi-field:** to color by two/three fields
  together, set `field1`+`field2`(+`field3`) and `fieldDelimiter` (default `", "`); each
  `uniqueValueInfos[].value` is the joined key (e.g. `"Developed, High"`). The compiler builds a concatenated
  match key.
- **dotDensity** — one dot per N units of a field. Set `type:"dotDensity"`, `dotValue` (units/dot),
  `dotSize`, and `attributes:[{field, color:[r,g,b,a]}]`. The polygon layer is **expanded at author time**
  into a derived point layer by `@strata/processing` `dotDensity(polygonFC, {field, dotValue})`; the compiler
  styles the resulting dots. Use when the user asks for "dot density / N people per dot".
- **heatmap** — density. Set `colorStops` (ensure a ratio-0 transparent stop) and `blurRadius`.

**Arcade `valueExpression`.** A uniqueValue/classBreaks renderer may carry a `valueExpression` (Arcade)
instead of a `field` — e.g. `"$feature.GDP / $feature.POP"` for GDP per capita, or
`'Iif($feature.POP > 1000, "big", "small")'`. `@strata/arcade` transpiles the supported subset to a MapLibre
expression automatically; anything outside the subset falls back to the default symbol with a warning.

For `--generate`, you may query distinct values / statistics from the service (`.../query?...&f=json`) to
choose classes/breaks. Confirm the field exists first. Show the renderer JSON you wrote and note that
`@strata/core-map`'s style compiler maps it to MapLibre paint.
