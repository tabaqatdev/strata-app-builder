# @strata/processing

A [Turf.js](https://turfjs.org/) spatial-analysis registry for strata-app-builder. Pure functions
over GeoJSON `FeatureCollection`s — GeoJSON in, GeoJSON out, no side effects — powering the
COP (common operating picture) analyses. **Distances are in kilometres.**

## Operations

| Function | What it does |
| --- | --- |
| `buffer(fc, distanceKm)` | Buffer each feature by N km. |
| `centroids(fc)` | Centroid of each feature (properties preserved). |
| `dissolve(fc, field?)` | Merge polygons, optionally grouped by a shared field value. |
| `clip(fc, mask)` | Clip features to a polygon mask (intersection). |
| `nearest(fromPoint, candidatesFc)` | Nearest candidate point + distance (km). |
| `pointsWithin(pointsFc, polygonsFc)` | Select-by-location: points inside any polygon. |
| `spatialJoin(targetFc, joinFc, { predicate })` | Left join by `intersects` / `within` / `contains`. |
| `withinDistance(pointsFc, refPointsFc, km)` | Points within X km of any reference point. |

## Registry

`registry` maps `id -> { label, description, run(args) }` so a UI or command can enumerate
and invoke tools uniformly. `listTools()` returns `{ id, label, description }[]` for menus.

```ts
import { registry, listTools } from "@strata/processing";

listTools(); // -> [{ id: "buffer", label: "Buffer", ... }, ...]
const buffered = registry.buffer.run({ fc, distanceKm: 5 });
```

## Worked examples

### Schools within 5 km of any emergency

```ts
import { withinDistance } from "@strata/processing";

// schoolsFc, emergenciesFc are point FeatureCollections
const atRisk = withinDistance(schoolsFc, emergenciesFc, 5);
// atRisk.features -> the schools inside the 5 km radius of at least one emergency
```

### Nearest health facility

```ts
import { nearest } from "@strata/processing";

const incident = { type: "Feature", geometry: { type: "Point", coordinates: [46.68, 24.71] }, properties: {} };
const { feature, distanceKm } = nearest(incident, healthFacilitiesFc);
console.log(feature?.properties?.name, `${distanceKm?.toFixed(1)} km away`);
```

### Districts each incident falls in (spatial join)

```ts
import { spatialJoin } from "@strata/processing";

const tagged = spatialJoin(incidentsFc, districtsFc, { predicate: "within" });
// each incident now carries its district's properties (target keys win on collision)
```

## Notes

- All geometry is assumed **EPSG:4326** (the whole Strata stack is). Reproject on the way in.
- `dissolve` flattens MultiPolygons first (Turf requires flat Polygon collections).
- The `boolean*` predicates can throw on degenerate geometry; `spatialJoin` treats a throw
  as "no match" rather than failing the whole run.
