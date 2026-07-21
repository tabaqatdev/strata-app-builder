/**
 * @strata/basemap-arcgis — the OPTIONAL `@esri/maplibre-arcgis` adapter (Phase 5 of the EB-parity plan).
 *
 * The custom `drawingInfo`/`popupInfo` → MapLibre compiler in `@strata/core-map` stays the renderer. This
 * adapter only does the two things the plugin is actually for — **loading ArcGIS basemap styles/sessions**
 * and **fetching ArcGIS services** (feature / vector-tile) — then hands the layer's genuine ESRI
 * `drawingInfo`/`popupInfo` back to that compiler. Keyless‑OSM stays the default; ArcGIS is opt‑in and only
 * appears when a token/session is configured.
 *
 * The Esri plugin is a **lazy optional peer dependency**: it is `import()`-ed only when an ArcGIS path is
 * used, and the module is **injectable** so the fetch→compiler division is unit-testable without it.
 */
export * from "./adapter.js";
