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

## Measurement traps — a wrong number here is invisible

- **Never report length from `Shape__Length` on a Web-Mercator (102100) layer.** It is Mercator metres,
  inflated by 1/cos(latitude) — one network measured 21 % long that way. Compute geodesically.
- **Never measure on generalised geometry.** Drawing tolerance (~0.0005° ≈ 55 m) is for paint only;
  fetch full resolution for any measurement.
- **`make_valid` before an overlay, and never swallow a failure.** A probe with a bare
  `except: continue` silently dropped 5 of 13 polygons and published *53 of 91 miles* when the answer was
  **91.05 of 91.05**. A caught-and-continued measurement is data corruption that reports success.
- **Cumulative fields do not sum.** Upstream drainage area double-counts every confluence — ask what a
  field accumulates before aggregating it, and reconcile the total against a published figure.
- **Do not snap boundaries to vertices.** Snapping band edges to the nearest vertex manufactured a
  hairline "evaluated, and not zoned" sliver between two abutting unevaluated polygons — painting *an
  authority looked and found nothing* onto ground nobody had looked at. Refine by bisection.
- **POST long geometries as a form body** — a 1,352-vertex polyline exceeds the shell's `ARG_MAX`.
- **Reproduce the result independently** in the suite, and assert it. A figure the app computes and
  nothing checks is a figure nobody can defend.
