# @strata/data-source

The first-class **DataSource** layer — Phase 1 of the Experience-Builder-parity plan, and its keystone.

A `DataSource` decouples widgets from physical layers. It owns its own **schema**, **query**, **selection**,
**filtered view**, and **statistics**, so any widget bound to the same source links to every other widget
bound to it — the "any widget drives any widget" property EB gets from `jimu-data` — with **zero
`connections`**.

## Implementations

| Kind | Class | Wraps |
|---|---|---|
| `feature-layer` | `FeatureLayerDataSource` | one `layers.json` layer + the `@strata/state` store (selection → `setSelection`, filter → `definitionExpression`) — the **back-compat bridge** |
| `output` | `OutputDataSource` | a widget's `@strata/actions` `OutputRegistry` output (`dataSource.fromWidget`) |
| `statistics` | `StatisticsDataSource` | the aggregate result of another source (drives KPI/gauge/chart) |
| `geometry` | `GeometryDataSource` | a sketch/buffer geometry (feeds spatial filters) |
| `web-map` | `WebMapDataSource` | a whole `layers.json`; delegates to a per-layer source chosen at runtime |

## Manager & back-compat

`DataSourceManager` is instantiated once by `<StrataApp>` and threaded through context. It **auto-wraps**
legacy bindings, so **no recipe changes**:

- `dataSource: { layerId }` → `FeatureLayerDataSource`
- `dataSource: { fromWidget }` → `OutputDataSource`
- `dataSource: { sourceId }` → the explicit source (the new, richer opt-in)

`manager.resolve(binding, ctx)` honors precedence `sourceId → layerId → fromWidget`.

## Query subset

`query.ts` is a pure, node-safe evaluator for the SQL `where` subset the WIF emits (`=`, `<>`, `>`, `>=`,
`<`, `<=`, `IN`, `BETWEEN`, `IS [NOT] NULL`, joined by flat `AND`/`OR`) plus a count/sum/avg/min/max
aggregate engine with optional group-by. Network-backed sources bypass it by injecting a `queryFn`.

## Status

- **Package core** — complete and unit-tested (query engine, five sources, manager).
- **`<StrataApp>` integration** — done: the app instantiates a `DataSourceManager`, pre-registers a source
  for every widget binding (`registerAppDataSources`), and injects the resolved `source` into each widget.
  Widgets sharing a `layerId`/`sourceId` share ONE source, so they link with no `connections`.
- **First widget migrated** — `kpi` (`stat: {field, op}`) computes live from its bound source and updates on
  filter/selection. `useDataSource(source)` in `@strata/core-map` is the hook other widgets adopt.
- **Remaining Phase-1 work** — migrate the other data widgets (`table`, `chart`, `carto`, `filter`, `gauge`,
  `feature-info`) to read `source` the same way. Additive; their current props keep working.
