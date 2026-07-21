# @strata/schema

The **shared contract** for strata-app-builder — the connective tissue between the map and the data tooling.

Two interlocking shapes:

1. **`layers.json`** (`layers.schema.json`, `LayersJson`) — the **map specification**, aligned to the
   **ESRI Web Map JSON** spec (`operationalLayers`, `baseMap`, `spatialReference`, `initialState`). It
   drives `<StrataMap>`. Styling is genuine ESRI `drawingInfo`; popups are genuine ESRI `popupInfo`.
2. **`catalog.json`** (`catalog.schema.json`, `CatalogRecord`) — the **single source of truth** for a
   published layer. It renders into a Strata Serve `[[duckdb.datasources]]` block **and** a metadata
   bundle (`metadata.toml` + `drawingInfo.json` + `popupInfo.json`), and also feeds the open-data hub
   (DCAT). Author a layer once here; every app references it by `id`.

## Usage

```ts
import type { LayersJson, CatalogRecord } from "@strata/schema";
import { layersSchema, catalogSchema } from "@strata/schema";
```

Validate with any JSON Schema validator (e.g. Ajv) against `layersSchema` / `catalogSchema`.

## Design rules

- **No custom styling DSL.** Store the exact ESRI renderer/popup JSON — the style compiler in
  `@strata/core-map` maps it to MapLibre paint.
- **`spatialReference` is explicit** (EPSG:4326 throughout).
- **App-proprietary data is namespaced** under `strata:extensions` so the document round-trips through
  ArcGIS Web Map tooling.
