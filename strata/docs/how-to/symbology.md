# How do I create or change symbology?

`strata-app-builder` writes **genuine ESRI `drawingInfo` renderers**; the style compiler maps them to MapLibre.
Use `/symbology` for any layer: for a layer in the map spec it edits `layers.json`; for a **published** layer
it rewrites `drawingInfo.json` in the metadata bundle and restarts the Serve server.

## Simple
> "Style parcels as a light-blue fill with a thin outline."
```
/symbology parcels simple
```
→ `esriSFS` solid fill (low alpha) + `esriSLS` outline.

## Graduated (class breaks)
> "Color counties by population in 5 graduated blues."
```
/symbology counties classBreaks --generate field=POP classes=5 ramp=blues
```
→ queries the field range, computes 5 breaks, writes `classBreakInfos`.

## Unique values
> "Give each land-use type its own color."
```
/symbology landuse uniqueValue field=LANDUSE
```
Colors come from the colorblind-safe `@strata/theme` `categorical` palette by default.

## Multi-field unique values
> "Color by economy **and** income group together."
```
/symbology countries uniqueValue field1=ECONOMY field2=INCOME_GRP
```
→ builds a concatenated match key; each `uniqueValueInfos[].value` is the joined pair (e.g. `"Developed, High"`).

## Derived value (Arcade)
> "Color by GDP per capita (GDP ÷ population)."
```
/symbology countries classBreaks --generate valueExpression="$feature.GDP / $feature.POP"
```
→ `@strata/arcade` transpiles the expression; the compiler drives the class breaks off it.

## Dot density
> "Show population as dot density — one dot per 100k people."
```
/symbology tracts dotDensity field=POP dotValue=100000
```
→ the polygon layer is expanded to a point layer at author time (`@strata/processing`), one dot per 100k.

## Heatmap
> "Show incident density as a heatmap."
```
/symbology incidents heatmap
```
→ includes a transparent ratio-0 stop (so the canvas doesn't flood).

## Labels
> "Label cities by name."
```
/symbology cities --labels field=cityname_en
```
→ writes `labelingInfo`; the style compiler emits MapLibre symbol layers.

**Traps:** use `esriSMSCircle` (never `esriSMSPath`); keep polygon fill alpha low; colors are `[r,g,b,a]`
with a 0–255 alpha. See the `strata-symbology` skill.
