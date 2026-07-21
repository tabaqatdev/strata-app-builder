# @strata/core-map

The React + **MapLibre GL JS** map component at the heart of every Strata GIS app. It is driven entirely
by an **ESRI Web Map JSON** `layers.json` (from `@strata/schema`) and renders **genuine ESRI
`drawingInfo` renderers and `popupInfo` popups** — no custom styling DSL.

## Quick use

```tsx
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { StrataMap } from "@strata/core-map";
import config from "./layers.json";

export default function App() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <StrataMap maplibregl={maplibregl} config={config} dataClient={{ proxyUrl: "/proxy/featureserver" }} />
    </div>
  );
}
```

`maplibre-gl` and `react` are **peer dependencies** — the app provides them, and you pass the `maplibregl`
module into `<StrataMap>` (keeps the template free of a hard build-time map dependency).

## What's in this package

| Module | Status | What it does |
|---|---|---|
| `engine/styleCompiler` | **implemented** | ESRI renderer → MapLibre paint (simple / uniqueValue / classBreaks / heatmap / visual variables / labels). Pure functions. |
| `engine/arcgisSource` | **implemented** | ArcGIS REST → paged GeoJSON with progressive load + proxy/token fallback. |
| `engine/MapController` | **implemented** | Owns the MapLibre map, the `ready` promise, RTL/Arabic text, the view API. |
| `engine/layers` | core flow implemented | Logical-layer registry (namespaced sub-layers, mutation queue, renderer apply). |
| `engine/basemaps` | raster implemented | Apply `baseMap.baseMapLayers` (WebTiledLayer). |
| `engine/popups` | basic implemented | Click → `popupInfo` field table. |
| `react/StrataMap` | **implemented** | The embeddable component (renders a `layers.json`). |
| `layout/*` | FullPage implemented | Layout presets (MapInScroll / SplitDashboard / MultiMap next). |
| `react/controls/*`, `react/panels/*` | scaffold | On-map controls + advanced panels (next release). |

See `../../docs/guide/style-compiler.md` for the renderer→paint mapping and
`../../docs/guide/anatomy.md` for how this package fits the whole.
