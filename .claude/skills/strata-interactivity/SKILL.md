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

## The selection contract (`featureSelect` / `rowSelect`)

```ts
{ layerId, oids: Array<number|string>, zoom?: boolean, popup?: boolean }
```
- **`oids` are `number | string`** — an object id is whatever the service says it is
  (`troubleshooting.md` §1). Never coerce; a string key coerced to a number selects the wrong row.
- **`zoom:true` flies to the RECORD**, not to its layer's extent. Fitting a whole layer for one row is a
  non-answer: the user asked to see one feature and got the extent they already had.
- **`popup:true` opens that record's `popupInfo`** on arrival, the same popup identify would show.
- **An empty `oids` is a RELEASE, not a no-op.** Every sink clears: the map drops the highlight and
  closes the popup. This is what makes "click the row again to clear it" work for free — the table emits
  the release, and the map already knows what to do with it.

The shipped `table` does exactly this: click a row to adopt (fly + popup), click it again to release.

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

## Known traps

- **Master–detail is bidirectional or it is not wired.** If a row drives the map, the map must drive the
  row. Shipping one direction reads as a bug to everyone except the person who wrote it.
- **A signature loop needs a release.** Whatever adopts must also clear — clicking the same cell, row or
  KPI again returns to the parent scope, `aria-pressed` flips back, and the chip disappears. Carry a
  visible affordance (an `×`, a ring) so the user can see which click will clear.
- **Exactly one population at a time.** Two stacked selections name a set nobody asked for; selecting a
  second releases the first.
- **`Esc` unwinds one thing at a time** — clear the filter first, and only then climb a level. A single
  `Esc` that discards everything loses work.
- **Enumerating the redraws by hand is the bug.** One adopt-handler refreshed five things and not the
  filter chips, so they went stale the moment the signature loop ran. Call one `redraw()`.
- **A deep link must round-trip the reading**, so a colleague can be sent the exact state
  (`setUrlParam` ⇄ parse on boot).
- **Show the filter chips.** Every active filter (KPI, legend isolate, table search) gets a labelled chip
  with an `×`, plus **Clear all** — otherwise a narrowed view is indistinguishable from an empty one.
- Full catalogue: `strata/docs/troubleshooting.md` §7.
