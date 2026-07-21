# How do I create an app in different layouts?

The map is a **component** (`<StrataMap mapId>`), not a whole app. The same map yields many app shapes.
Widgets (charts, tables, popups, legends) render **on the map canvas** (`surface="canvas"`) or **anywhere
on the page** (`surface="page" slot="#..."`) and stay synced to the map.

## Full-page operations app (e.g. a wall / COP)
> "Build a full-page map over these layers."
```
/create-map --layers incidents,perimeters,facilities --preset FullPage
```
Container at `position:absolute; inset:0`. Float the legend/summary on the canvas.

## Map inside a scrollable page (report / story)
> "Put the map as a section in a scrolling report, with the incident chart and table below it."
```
/create-map --preset MapInScroll --layers incidents
/panel chart incidents --surface page --slot #report
/panel table incidents --surface page --slot #report
```
The map is one sized (optionally sticky) section; the chart and table flow in the page.

## Split dashboard
> "Map on the left, KPIs and charts on the right."
```
/create-map --preset SplitDashboard --layers incidents
/panel statistics incidents --surface page --slot #right
/panel chart incidents --surface page --slot #right
```

## Two synced maps (compare)
> "Show two maps side by side, synced — 2020 vs 2024 perimeters."
```
/create-map --preset MultiMap --layers perimeters_2020,perimeters_2024
/panel swipe perimeters_2024
```
Two `<StrataMap>` instances with a linked extent and a swipe handle.

## Widgets on canvas vs page
> "Float the legend on the map, but put the full table in a bottom drawer."
```
/panel table incidents --surface page --slot #drawer     # in the page
# legend stays surface=canvas (default)
```

## Make it interactive on the first build (WIF)
> "Selecting a bar should filter the map and the table; clicking a row should zoom the map."

Author an `AppLayout.connections` block and `<StrataApp>` wires the shared action bus at mount — no manual
plumbing. Each entry is `{ from, trigger, to, action, options }`:
```json
{
  "connections": [
    { "from": "chart", "trigger": "categorySelect", "to": "map",   "action": "filter", "options": { "layerId": "parcels" } },
    { "from": "table", "trigger": "rowSelect",       "to": "map",   "action": "zoomTo", "options": { "layerId": "parcels" } }
  ]
}
```
Give each interactive widget a stable `id`; pass a `store` in the app context so `filter` applies **in place**
(no map reload). The `dashboardTemplate` emits a starter block for you. A `data-actions` widget adds quick
actions (zoom/flash/view-in-table/export) on any selection, and `dataSource.fromWidget` chains one widget's
output into another. Full reference: the **`strata-interactivity`** skill.

See also `docs/guide/anatomy.md` and the `strata-layout` skill.
