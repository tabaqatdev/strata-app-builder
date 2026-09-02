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
- **Measure contrast; do not argue about it.** `#f59e0b` as text on a white panel is **2.15:1**, under
  WCAG AA's 4.5 — and it marked one app's biggest finding. Where one hue must serve as both fill and
  text, make it **two tokens** (`#b45309` = 5.02:1 for text). In another build an amber read 3.77:1 light
  vs 7.12:1 dark and looked like proof the app should be dark — until every other state measured
  5.57–8.34:1 and the amber turned out to be the **outlier, not the theme**.
- **Semantic roles must not conflate two different facts.** "An authority answered" and "an authority
  answered, and the answer is a hazard" cannot share ink. Painting *evidenced* in the danger role made a
  plain factual value draw as a full-width blood-red bar. No assertion catches this — the ink is
  internally consistent and semantically inverted.
- **A network-wide verdict is a false statement about a specific asset.** Stamping "unverifiable" on
  every feature because 28 % of the network is unparseable libels the ones that file a plain value.
  Decide per feature and print the reason on the row.
- **Fill opacity must follow the basemap.** Alpha tuned for a pale ground (OpenFreeMap Positron) is invisible on
  OpenTopoMap — the basemap a user picks *precisely* to see terrain context.
- **A renderer field on a MapServer layer needs case tolerance.** `f=geojson` lower-cases every field
  name (FeatureServer preserves case); the style compiler emits a `coalesce` over exact/lower/upper.
- **Data colours are identical in both themes**; only the halo changes. A dark-mode override once painted
  light text onto a light amber fill and made a whole navigation band unreadable.
- Full catalogue: `strata/docs/troubleshooting.md` §8.
