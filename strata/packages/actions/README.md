# @strata/actions

A typed **data-action bus** so strata-app-builder widgets and panels **cross-drive each other** — the way ArcGIS
Experience Builder's message/action framework and CARTO's widgets do. A widget emits a **trigger**
(`categorySelect`, `rowSelect`, `extentChange`, …); subscribers run an **action** (filter the map, zoom to a
feature, view in table, recompute). Zero dependencies.

```ts
import { ActionBus, connectBusToStore } from "@strata/actions";

const bus = new ActionBus();
// wire the bus to the store + map: category clicks filter the layer, row clicks select/zoom
const off = connectBusToStore(bus, store, {
  onFilter: (layerId, where) => strataMap.setFilter(layerId, where),
  onSelect: (layerId, oids, zoom) => strataMap.highlight(layerId, oids, zoom),
});

// a CartoPanel category click:
bus.emit({ type: "categorySelect", source: "carto-1", payload: { layerId, field: "INCOME_GRP", value: "High income" } });
// a table row click:
bus.emit({ type: "rowSelect", source: "table-1", payload: { layerId, oids: [42], zoom: true } });
```

Now the CartoPanel category filter, the attribute table, and any chart can all react to one another — not
just the map. Use `bus.on("filterChange", …)` in a widget to recompute when the filter changes.
