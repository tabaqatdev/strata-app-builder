# strata-interactivity skill pack

Make a generated app **alive on the first build** — the ExB message/action framework, authored declaratively
so cross-widget interactivity ships without the user asking twice. This is the WIF pillar (`@strata/actions`
+ `<StrataApp>`).

## The one thing to do: emit a `connections` block

`AppLayout.connections` is an array of wires. Each: **"when `from` emits `trigger`, run `action` on `to`."**
`<StrataApp>` reads it, creates a shared `ActionBus`, and wires everything at mount. Give every interactive
widget a stable `id`, then connect them:

```json
{
  "connections": [
    { "from": "chart", "trigger": "categorySelect", "to": "map",   "action": "filter",  "options": { "layerId": "parcels" } },
    { "from": "chart", "trigger": "rangeSelect",    "to": "map",   "action": "filter",  "options": { "layerId": "parcels" } },
    { "from": "table", "trigger": "rowSelect",      "to": "map",   "action": "zoomTo",  "options": { "layerId": "parcels" } },
    { "from": "legend","trigger": "categorySelect", "to": "map",   "action": "filter",  "options": { "layerId": "parcels" } }
  ]
}
```

**Default to emitting these** in `/app`, `/new-app`, and `/panel`: a dashboard's chart brush filters the map +
table; a sidebar legend category cross-filters; a gallery card click zooms + filters. `dashboardTemplate`
already emits a starter block — extend it, don't strip it.

## Triggers (what a widget emits)
`featureSelect` · `rowSelect` · `categorySelect` · `rangeSelect` · `brush` · `chartClick` · `filterChange` ·
`extentChange` · `hover` · `flash` · `search` · `clear` · `recordsChange` (output published).

## Actions (what runs on the target)
`filter` (in-place server-side `setDefinition` — needs a `store` in the app context) · `zoomTo` · `panTo` ·
`flash` · `viewInTable` · `showStatistics` · `export` · `setUrlParam` (`options.param`) · `showHide`
(`options.hidden`) · `message` (`options.text`).

`filter` derives the `where` from the trigger automatically (`whereFromTrigger`) — a `categorySelect` becomes
`FIELD = 'value'`, a `rangeSelect`/`brush` becomes a `>=`/`<=` clause. Override with `options.where`.

## Wiring for it to actually apply
- Pass a `store` in the `<StrataApp context={{ store, maplibregl }}>` so `filter` applies **in place**
  (`store.setDefinition` → no map remount). Pass the shared `bus` to the map (`<StrataMap bus>` — StrataApp
  threads it) so the map is a **sink**: selections/flashes from other widgets light up on it.
- Every widget receives `id`, `bus`, and `outputs` as props automatically. Source panels (`carto`,
  `table`) already emit; the map honors `featureSelect`/`rowSelect`/`flash`.

## Output data sources (W2) — chain widgets without the map
A widget can publish a derived record set that another consumes, via `dataSource.fromWidget`:
```json
{ "id": "tbl", "type": "table", "dataSource": { "fromWidget": "query1" } }
```
The producer calls `outputs.publish({ widgetId, records })`; the consumer reads it with the `useOutputData`
hook. Use for Chart→Table→Map chains that don't route through the map.

## Data-action menu (W3)
Drop a `data-actions` widget for quick actions on a selection (Zoom · Flash · View-in-table · Export · Clear).
It auto-tracks `featureSelect`/`rowSelect` on the bus, or takes a controlled `selection`. Extend with custom
actions via `dataActionRegistry([...])`.

## Recipe gate
The interactive recipes (`interactive-legend`, `category-gallery`, `chart-viewer`, `data-explorer`, `slider`)
must cross-filter **in place** (no map remount) — that is exactly what `connections` + `store.setDefinition`
deliver. Don't hand-roll panel-to-panel wiring; author `connections`.
