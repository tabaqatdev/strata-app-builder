/**
 * @strata/map-controls — framework-free MapLibre map chrome: one control cluster, a drawer with
 * the layer list or the basemap gallery, full screen, keyboard, and optional tools (search,
 * locate, measure, draw, print — all OFF by default) and an optional scale bar (OFF by default). No React, no runtime dependencies.
 *
 *   import { mountMapControls, catalog } from "@strata/map-controls";
 *   import "@strata/map-controls/map-controls.css";
 *   const controls = mountMapControls(map, { container, catalog, layers: () => [...] });
 *
 * The catalog alone (no DOM): `import * as catalog from "@strata/map-controls/basemaps"`.
 */
export * from "./map-controls.js";
export * from "./tools.js";
export * from "./scale.js";
export * from "./icons.js";
export * from "./basemaps.js";
export * as catalog from "./basemaps.js";
