# @strata/state

Framework-agnostic app state for strata-app-builder, backed by a **vanilla Zustand** store
(`zustand/vanilla`). It holds the live authoring state of a Strata map and round-trips to and
from the ESRI Web Map JSON-aligned `LayersJson` from `@strata/schema`.

## State shape

```ts
{
  layers: OperationalLayer[],
  selection: { layerId: string; oids: number[] } | null,
  view: { center: [number, number]; zoom: number } | null,
  baseMap: BaseMap | null,
}
```

## Actions

`addLayer`, `removeLayer(id)`, `renameLayer(id, title)`, `reorderLayers(ids)`, `setVisibility(id, bool)`,
`setOpacity(id, n)`, `setSelection(sel)`, `setView(v)`, `setBaseMap(bm)`,
`loadFromLayersJson(cfg)`, `toLayersJson()`, plus undo/redo: `undo()`, `redo()`,
`canUndo()`, `canRedo()`.

## Usage (vanilla)

```ts
import { createStrataStore } from "@strata/state";

const store = createStrataStore();
store.getState().addLayer(myOperationalLayer);
store.getState().setVisibility(myOperationalLayer.id, false);

const cfg = store.getState().toLayersJson(); // -> LayersJson

const unsub = store.subscribe((s) => console.log(s.layers.length));
```

## Usage (React)

A vanilla store carries no React binding on its own. Wrap it with zustand's `useStore`
in a React app:

```ts
import { useStore } from "zustand";
import { createStrataStore } from "@strata/state";

const store = createStrataStore();
export const useLayers = () => useStore(store, (s) => s.layers);
```

## Undo / redo

Every mutating action first pushes a snapshot of the undoable slice
(`layers`, `selection`, `view`, `baseMap`) onto a bounded history (last ~50 states).
`undo()` restores the previous snapshot and moves the current one onto the redo ring;
`redo()` reverses that. A new mutation clears the redo ring. Snapshots are deep-cloned
(via `structuredClone`) so history never aliases live state.
