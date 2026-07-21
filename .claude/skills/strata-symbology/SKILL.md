# strata-symbology skill pack

Author genuine ESRI `drawingInfo` renderers (compiled to MapLibre by `@strata/core-map`).

**Default to data-driven, palette-backed symbology** (class-breaks / unique-value), never a flat single
color, unless the user asks for one. Pull colors from **`@strata/theme`** so the layer matches the app
theme and stays colorblind-safe:
- `import { sequential, diverging, categorical, hexToEsri } from "@strata/theme"`
- graduated → `sequential(n, "blues")` (or `diverging(n, "RdBu")` around a midpoint)
- unique-value → `categorical(n)`
- each hex → ESRI color with `hexToEsri(hex, alpha)` (use alpha ~40 for polygon fills).

## Tool cheatsheet
- `/symbology <id> simple|classBreaks|uniqueValue|dotDensity|heatmap [--generate field=…]`
- `/update-symbology <id>` — write `drawingInfo.json` in a published layer's bundle + restart.

## Recipes
1. **Graduated (class breaks).** Query stats: `.../query?where=1=1&outStatistics=[{statisticType:"min"...}]&f=json`
   (or `returnDistinctValues`). Choose 5 breaks; ramp `sequential(5,"blues")`. Build
   `{type:"classBreaks", field:"POP", classBreakInfos:[{classMaxValue, symbol:{type:"esriSFS",...}}]}`.
2. **Unique values.** Distinct on the category field; `categorical(k)` for the swatches;
   `{type:"uniqueValue", field1:"LANDUSE", uniqueValueInfos:[…], defaultSymbol:{…}}`.
3. **Multi-field unique value.** Two/three categorical fields together:
   `{type:"uniqueValue", field1:"ECONOMY", field2:"INCOME_GRP", fieldDelimiter:", ",
   uniqueValueInfos:[{value:"Developed, High", symbol:{…}}, …], defaultSymbol:{…}}`.
4. **Arcade valueExpression.** Derive the value instead of naming a field:
   `{type:"classBreaks", valueExpression:"$feature.GDP / $feature.POP", classBreakInfos:[…]}` — `@strata/arcade`
   transpiles it. Keep to the subset (`$feature.X`, arithmetic, `When/Iif/Decode/Round/Text`, comparisons).
5. **Dot density.** `{type:"dotDensity", dotValue:100000, dotSize:2, attributes:[{field:"POP", color:[200,40,40,255]}]}`.
   The polygon layer is expanded to points at author time via `@strata/processing` `dotDensity(fc,{field,dotValue})`.
6. **Heatmap.** `{type:"heatmap", colorStops:[{ratio:0,color:[…,0]}, …], blurRadius:10}` — include the
   ratio-0 transparent stop.

## ESRI reference (symbols)
- Polygon fill: `esriSFS`/`esriSFSSolid`, `color:[r,g,b, ~40]` (LOW alpha), `outline:{esriSLS,...}`.
- Point: `esriSMS`/`esriSMSCircle`, `size` (points), `outline`.
- Line: `esriSLS`/`esriSLSSolid|Dash`, `width` (points).

## Known traps
- Never `esriSMSPath` (won't render) — use `esriSMSCircle`/`Square`/`Diamond`/`Triangle`.
- Low polygon alpha so layers don't block each other.
- Colors are `[r,g,b,a]` with a **0–255** alpha.
