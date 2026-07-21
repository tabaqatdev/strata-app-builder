# Guide: the style compiler

`packages/core-map/src/engine/styleCompiler.ts` turns an **ESRI `drawingInfo` renderer** into MapLibre
paint. It is pure (no DOM, no MapLibre calls) and accepts both ArcGIS REST JSON (`esriSFS`/`esriSLS`/
`esriSMS`/`esriPMS`, colors `[r,g,b,a 0-255]`, sizes in points) and JS-API JSON.

## API
```ts
import { compile, compileLabels, scaleToZoom } from "@strata/core-map";
const { patches, icon, heatmap, fields, warnings } = compile(renderer);
```
- `patches` — paint for the namespaced sub-layers `{ fill, outline, line, circle }`.
- `icon` — a picture-marker image (data URI or URL) + size.
- `heatmap` — MapLibre heatmap paint.
- `fields` — field names the renderer references (drives lean `outFields` fetching).
- `warnings` — anything approximated or unsupported.

## Mapping
| ESRI renderer | MapLibre |
|---|---|
| `simple` | flat paint via the symbol (fill/line/circle) |
| `uniqueValue` (field1) | `["match", ["to-string",["get",field]], v, out, …, default]` |
| `uniqueValue` (multi-field) | match key is `["concat", f1, delim, f2, …]`; `uniqueValueInfos[].value` joined on `fieldDelimiter` |
| `classBreaks` (field) | `["step", ["to-number",["get",field]], out0, break1, out1, …]` |
| `dotDensity` | expanded **at author time** to a point layer (see below); dots styled as circles |
| `heatmap` | `["interpolate",["linear"],["heatmap-density"], …]` (+ transparent ratio-0 stop) |
| `visualVariables` (color/size) | `["interpolate",["linear"],["to-number",["get",field]], …]` |
| labels (`labelingInfo`) | symbol layers; `$feature.X` / `[FIELD]` → `["concat", …]`; scale → min/maxzoom |

Constants: points→pixels `PT2PX = 4/3`; `scaleToZoom(scale) = log2(591657527.591555 / scale)`.

## Arcade `valueExpression`
A `uniqueValue`/`classBreaks` renderer may carry an Arcade `valueExpression` (e.g. `"$feature.GDP / $feature.POP"`)
instead of a `field`. The compiler routes it through **`@strata/arcade`**, which transpiles the supported
subset (`$feature.X`, arithmetic, string ops, `When`/`Iif`/`Decode`/`Round`/`Text`, comparison/logical) to a
MapLibre expression that drives the `match`/`step` input. Anything outside the subset (unknown function,
non-literal `Decode` key, parse error) falls back to the default symbol and records a `warning` — never a
silent wrong answer. The same package's `evaluate(attrs)` computes a scalar for popup `expressionInfos`.

## Dot density
MapLibre has no native dot-density renderer, so a `dotDensity` renderer is expanded **before** styling by
`@strata/processing` `dotDensity(polygonFC, { field, dotValue })`: it scatters `round(field / dotValue)`
random points inside each polygon (rejection-sampled against the true geometry). The compiler emits the
circle paint for the resulting dots and warns so the loader knows to run the expander.

## Not supported (inherited limits)
Binning, blend modes, field-weighted heatmap. Each emits a `warning` rather than failing.
