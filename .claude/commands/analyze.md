---
description: Run a spatial analysis on a layer (Turf-backed) and add the result as a new layer.
argument-hint: <buffer|dissolve|clip|nearest|within|union|difference|intersect|voronoi|hull|aggregate|hexbin|hotspot|weighted-overlay|isochrone> <layerId> [--field --distance --cell-km --minutes …]
---

Run a spatial analysis via **`@strata/processing`** (pure Turf.js GeoJSON in/out; the registry is
`import { registry, listTools } from "@strata/processing"`), then **add the result as a new operational
layer** in `layers.json` (with sensible `@strata/theme` symbology) and report it.

## Operations (registry ids)
- **Geometry / proximity** — `buffer` (km) · `centroids` · `dissolve` (optional group `field`) · `clip`
  (to a `mask`) · `nearest` · `pointsWithin` (select-by-location) · `spatialJoin` · `withinDistance` (km).
- **Overlay** — `union` (merge all) · `difference` (erase a `mask`) · `intersect` (keep overlap) ·
  `voronoi` (Thiessen) · `convexHull` / `concaveHull` (`maxEdgeKm`).
- **Aggregation** — `aggregate` (dissolve-with-stats: `groupField` → count/sum/mean/min/max of `valueField`,
  the missing statistics half) → attach rows to dissolved geometry for a choropleth.
- **Density / hotspot** — `hexbinDensity` (`cellSizeKm` → per-cell point `count`) · `hotspot`
  (Getis-Ord Gi* z-score per hex `gi_z` — style diverging red/blue).
- **Suitability** — `weightedOverlay` (per-criterion score `field`s + `weight`s → a `suitability` field; the
  keyless alternative to Esri's Suitability Modeler — pair with the weighted-overlay panel).
- **Service areas** — `isochrone` (drive/walk-time polygons): `fetchIsochrone(center, minutes, { endpoint,
  format:"valhalla"|"ors", profile, apiKey })` in `@strata/plugin-routing` — keyless self-hosted **Valhalla**
  or keyed **OpenRouteService**; returns polygons to add as a layer.

## Steps
1. Resolve the input layer's features (query the service to GeoJSON, or use the loaded source).
2. Run the op from the registry (`registry[id].run({ fc, … })`) or the named function.
3. Add the result as a new `operationalLayer` (`source.kind:"geojson"` with the returned FeatureCollection),
   style it (choropleth for aggregate, diverging for hotspot, graduated for suitability), and — if useful —
   drop a **statistics/analysis panel** (`/panel statistics`) bound to it.

Everything is EPSG:4326. Recipe: **`vector-analysis`**.
