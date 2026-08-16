# strata-charts skill pack

Expression-backed charts (ECharts) bound to a layer. Persist a re-runnable descriptor, not a data snapshot.

## Cheatsheet
`/add-chart <layerId> --kind bar|line|pie --field <cat> [--value <field> --stat sum]`

## Save model (expression, not snapshot)
`{ id, title, kind, source:{ layer_id, field, value_field, stat } }` — re-aggregated live on open. Only
snapshot (`data:[{label,value}]`) when there is no source layer.

The `ChartPanel` renders via **Apache ECharts** when the optional `echarts` peer dep is installed (richer,
canvas-rendered, brush/zoom events), falling back to a dependency-free SVG bar/line/pie renderer otherwise —
same `{kind,data}` interface either way. Charts are **interactive by default**: clicking a category emits
`categorySelect` on the `@strata/actions` bus (a second click on the same category clears it), so a chart
cross-filters the map + table the moment it's dropped into a dashboard (`<StrataApp>` injects the bus and the
`dashboardTemplate` already wires the `connections`). Charts are drag-reorderable.

## Time series / hydrograph (`TimeSeries` widget)
For a **temporal** chart use the **`TimeSeries`** widget (`@strata/core-map/react/widgets`) — an inline-SVG
**line/area** chart over a time series with optional threshold **bands** (the flood **hydrograph** / wildfire
acres-trend). Feed it `[{ t, value }]` (epoch millis) plus band thresholds. Pair it with the **`TimeSlider`**
control (`/timeslider`) so animating the slider filters the same time-aware layer via a `definitionExpression`
on the time field.

## Widgets (infographics) — non-chart
Alongside charts, dependency-light inline-SVG widgets live in `@strata/core-map/react/widgets`: `KpiCard`
(value/delta/status/icon/sparkline), `RadialGauge`, `Sparkline`, `StackedBar`, `StatRow`. Use them in a
`CartoPanel` or an `<StrataApp>` dashboard.

## Recipes
1. Count by category → `source:{layer_id, field:"STATUS"}` (no value_field ⇒ COUNT).
2. Sum of a field by category → `value_field:"ACRES", stat:"sum"`.
3. Cross-filter: click a bar → filter the map layer + linked table (via the **`@strata/actions`** bus, this
   also cross-filters other widgets/panels, not just the map).
4. Hydrograph → `TimeSeries` with bands over a gauge-height series + a `TimeSlider` over the same range.

## Table depth (`AttributeTablePanel`)
The table auto-**windows** rows past ~150 (dependency-free virtualization; `@tanstack/react-virtual` is an
optional upgrade). It supports **server-side paging** — pass `page:{offset,pageSize,total}` + `onPageChange`
wired to `queryFeatures` `resultOffset`/`resultRecordCount` — and built-in **CSV + GeoJSON** export (pass a
`geometry(row)` accessor for real geometry; `onExport` still handles GeoParquet). It emits `rowSelect` on the
bus, so a row click zooms/highlights the map via the WIF.

## Dashboard default (rich first build)
Default a dashboard to **KPI row + real chart + paged table**, all wired to the bus so they cross-filter on
the first build. Use `dashboardTemplate` (it emits the `connections`); palettes come from `@strata/theme`.

## Traps
Aggregate server-side (ArcGIS `outStatistics` / `groupByFieldsForStatistics`); the chart renders returned
`[{label,value}]`. `TimeSeries` expects a sorted `t`-ordered series (epoch millis). ECharts is optional —
don't assume it's installed; the SVG fallback keeps everything working.

- **Recompute the reading before you repaint.** One app's adopt-handler repainted the map and re-scoped
  the table but left the derived reading stale, so the headline number and both KPIs kept the *previous*
  selection's figures. The map looked right, the table looked right, and the big number lied. Recompute
  the reading **first**, in the same handler.
- **Derive every count from state; never hardcode one.** A hardcoded total meant adding a category
  silently moved the number on the splash screen — and the test asserting the constant was itself wrong.
- **Two similar numbers are often not parameterised the same way.** A published share and a locally
  computed one may respond to different inputs; conflating them made a toggle appear to move a figure it
  has no business moving. Keep them separate fields and assert the distinction.
- **A KPI that filters must say what it filtered** — pair it with a labelled chip and a visible
  denominator (`2 of 7`), so a narrowed view never reads as the whole.
- Use tabular numerals (`font-variant-numeric: tabular-nums`) wherever figures stack in a column.
