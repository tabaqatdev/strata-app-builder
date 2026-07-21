/**
 * @strata/processing — pure Turf.js spatial operations over GeoJSON FeatureCollections.
 *
 * Every function is side-effect free: it takes GeoJSON in and returns new GeoJSON (or a
 * plain result object) out. Distances are in kilometres. These power the COP (common
 * operating picture) analyses — "schools within 5 km of any emergency", "nearest health
 * facility", select-by-location, spatial joins, and so on.
 */

import {
  buffer as turfBuffer,
  centroid as turfCentroid,
  dissolve as turfDissolve,
  featureCollection,
  intersect as turfIntersect,
  booleanIntersects,
  booleanWithin,
  booleanContains,
  booleanPointInPolygon,
  distance as turfDistance,
  nearestPoint,
  pointsWithinPolygon,
  bbox as turfBbox,
  point as turfPoint,
  flatten,
  union as turfUnion,
  difference as turfDifference,
  intersect as turfIntersect2,
  voronoi as turfVoronoi,
  convex as turfConvex,
  concave as turfConcave,
  hexGrid as turfHexGrid,
  centroid as turfCentroid2,
} from "@turf/turf";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
  Point,
  Polygon,
  MultiPolygon,
} from "geojson";

type AnyFC = FeatureCollection<Geometry, GeoJsonProperties>;
type PointFC = FeatureCollection<Point, GeoJsonProperties>;
type PolygonFC = FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties>;

/** Spatial predicate for {@link spatialJoin}. */
export type JoinPredicate = "intersects" | "within" | "contains";

/**
 * Buffer every feature by `distanceKm` (kilometres). Empty/degenerate buffers are dropped.
 */
export function buffer(fc: AnyFC, distanceKm: number): PolygonFC {
  const out: Array<Feature<Polygon | MultiPolygon>> = [];
  for (const f of fc.features) {
    const buffered = turfBuffer(f, distanceKm, { units: "kilometers" });
    if (buffered && buffered.geometry) {
      out.push(buffered as Feature<Polygon | MultiPolygon>);
    }
  }
  return featureCollection(out);
}

/** Options for {@link dotDensity}. */
export interface DotDensityOptions {
  /** Numeric attribute whose magnitude each polygon's dot count represents. */
  field: string;
  /** Units of `field` represented by one dot (e.g. 100000 → one dot per 100k people). */
  dotValue: number;
  /** Safety cap on dots generated per polygon (default 2000) — keeps huge counts renderable. */
  maxDots?: number;
  /** Injectable RNG (default `Math.random`) so tests can produce deterministic output. */
  rng?: () => number;
  /** Property name to stamp on each dot with the source field name (default `_dotField`). */
  markProp?: string;
}

/**
 * Dot-density expander. MapLibre has no native dot-density renderer, so strata-app-builder expands an ESRI
 * `dotDensity` renderer **at author time** into a derived point layer: `round(field / dotValue)` random
 * points scattered within each polygon (rejection-sampled inside the true geometry, not just the bbox).
 * The result is styled with a plain `esriSMSCircle` symbol by the caller.
 *
 * Each dot carries only `{ [markProp]: field }` — dots are visually identical, so copying every source
 * attribute onto potentially thousands of points is avoided.
 */
export function dotDensity(polygons: PolygonFC, opts: DotDensityOptions): PointFC {
  const { field, dotValue, maxDots = 2000, rng = Math.random, markProp = "_dotField" } = opts;
  const out: Array<Feature<Point>> = [];
  if (!(dotValue > 0)) return featureCollection(out);

  for (const poly of polygons.features) {
    const raw = Number((poly.properties ?? {})[field]);
    if (!isFinite(raw) || raw <= 0) continue;
    const n = Math.min(maxDots, Math.round(raw / dotValue));
    if (n <= 0) continue;

    const [minX, minY, maxX, maxY] = turfBbox(poly);
    let placed = 0;
    let attempts = 0;
    const maxAttempts = n * 60 + 200; // bounded so a sliver polygon can't spin forever
    while (placed < n && attempts < maxAttempts) {
      attempts++;
      const lng = minX + rng() * (maxX - minX);
      const lat = minY + rng() * (maxY - minY);
      const pt = turfPoint([lng, lat], { [markProp]: field });
      if (booleanPointInPolygon(pt, poly)) {
        out.push(pt as Feature<Point>);
        placed++;
      }
    }
  }
  return featureCollection(out);
}

/** Compute the centroid of each feature, carrying its properties through. */
export function centroids(fc: AnyFC): PointFC {
  const out: Array<Feature<Point>> = [];
  for (const f of fc.features) {
    const c = turfCentroid(f, { properties: f.properties ?? {} });
    out.push(c as Feature<Point>);
  }
  return featureCollection(out);
}

/**
 * Dissolve (merge) adjacent/overlapping polygons. If `field` is given, only polygons
 * sharing the same value for that property are merged together. Turf's dissolve requires
 * a flat FeatureCollection of Polygons, so MultiPolygons are flattened first.
 */
export function dissolve(fc: PolygonFC, field?: string): FeatureCollection<Polygon | MultiPolygon> {
  const flat = flatten(fc) as FeatureCollection<Polygon>;
  const dissolved = turfDissolve(flat, field ? { propertyName: field } : undefined);
  return dissolved as FeatureCollection<Polygon | MultiPolygon>;
}

/**
 * Clip every feature in `fc` to the polygon(s) in `mask` (intersection). Non-overlapping
 * features are dropped. Result properties are inherited from the source feature.
 */
export function clip(fc: AnyFC, mask: PolygonFC): FeatureCollection<Polygon | MultiPolygon> {
  const maskParts = flatten(mask).features as Array<Feature<Polygon>>;
  const out: Array<Feature<Polygon | MultiPolygon>> = [];
  for (const f of fc.features) {
    if (f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon") continue;
    for (const part of maskParts) {
      const clipped = turfIntersect(
        featureCollection([f as Feature<Polygon | MultiPolygon>, part]),
      );
      if (clipped && clipped.geometry) {
        clipped.properties = { ...(f.properties ?? {}) };
        out.push(clipped as Feature<Polygon | MultiPolygon>);
      }
    }
  }
  return featureCollection(out);
}

/** Result of {@link nearest}: the closest candidate feature and its distance (km). */
export interface NearestResult {
  feature: Feature<Point> | null;
  distanceKm: number | null;
}

/**
 * Find the candidate point nearest to `fromPoint`. Returns the feature and the great-circle
 * distance in kilometres, or nulls when there are no candidates.
 */
export function nearest(fromPoint: Feature<Point>, candidatesFc: PointFC): NearestResult {
  if (candidatesFc.features.length === 0) return { feature: null, distanceKm: null };
  const found = nearestPoint(fromPoint, candidatesFc);
  const distanceKm = turfDistance(fromPoint, found, { units: "kilometers" });
  return { feature: found as Feature<Point>, distanceKm };
}

/**
 * Select-by-location: return the points that fall inside any polygon in `polygonsFc`.
 */
export function pointsWithin(pointsFc: PointFC, polygonsFc: PolygonFC): PointFC {
  const result = pointsWithinPolygon(pointsFc, polygonsFc);
  return result as PointFC;
}

/**
 * Spatial join: for each target feature, attach the properties of the FIRST join feature
 * that satisfies `predicate`. Targets with no match are kept with their own properties
 * unchanged (a left join). The join feature's properties are merged under the target's,
 * so target keys win on collision.
 */
export function spatialJoin(
  targetFc: AnyFC,
  joinFc: AnyFC,
  options: { predicate: JoinPredicate },
): AnyFC {
  const test = predicateFn(options.predicate);
  const out: Array<Feature<Geometry, GeoJsonProperties>> = [];
  for (const target of targetFc.features) {
    let joined: GeoJsonProperties = null;
    for (const candidate of joinFc.features) {
      if (test(target, candidate)) {
        joined = candidate.properties ?? {};
        break;
      }
    }
    out.push({
      ...target,
      properties: { ...(joined ?? {}), ...(target.properties ?? {}) },
    });
  }
  return featureCollection(out);
}

/**
 * Return the points in `pointsFc` that lie within `km` kilometres of ANY point in
 * `refPointsFc` — e.g. "schools within X km of any emergency". Uses point-to-point
 * great-circle distance (no buffering, so it's exact and cheap).
 */
export function withinDistance(pointsFc: PointFC, refPointsFc: PointFC, km: number): PointFC {
  const out: Array<Feature<Point>> = [];
  for (const p of pointsFc.features) {
    for (const ref of refPointsFc.features) {
      if (turfDistance(p, ref, { units: "kilometers" }) <= km) {
        out.push(p);
        break;
      }
    }
  }
  return featureCollection(out);
}

/** Map a {@link JoinPredicate} to a boolean test between two features. */
function predicateFn(
  predicate: JoinPredicate,
): (a: Feature<Geometry>, b: Feature<Geometry>) => boolean {
  switch (predicate) {
    case "within":
      // target geometry is within the join geometry
      return (a, b) => safeBoolean(() => booleanWithin(a, b));
    case "contains":
      // target geometry contains the join geometry
      return (a, b) => safeBoolean(() => booleanContains(a, b));
    case "intersects":
    default:
      return (a, b) => safeBoolean(() => booleanIntersects(a, b));
  }
}

/** Turf boolean* helpers can throw on degenerate geometry; treat throws as `false`. */
function safeBoolean(fn: () => boolean): boolean {
  try {
    return fn();
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------------------------
// Overlay + aggregation + density (Phase 4 #11). Turf-backed, pure GeoJSON in/out.
// ---------------------------------------------------------------------------------------------

/** Union all polygons into one (dissolve without a group field). Returns an empty FC if none. */
export function union(fc: PolygonFC): PolygonFC {
  const polys = fc.features.filter((f) => f.geometry);
  if (!polys.length) return featureCollection([]);
  let acc: any = polys[0];
  for (let i = 1; i < polys.length; i++) {
    const u = turfUnion(featureCollection([acc, polys[i]] as any));
    if (u) acc = u;
  }
  return featureCollection([acc as Feature<Polygon | MultiPolygon>]);
}

/** Erase `mask` polygons from each `fc` polygon (a − b). Empty results are dropped. */
export function difference(fc: PolygonFC, mask: PolygonFC): PolygonFC {
  const maskUnion = union(mask).features[0];
  if (!maskUnion) return fc;
  const out: Array<Feature<Polygon | MultiPolygon>> = [];
  for (const f of fc.features) {
    const d = turfDifference(featureCollection([f, maskUnion] as any));
    if (d && d.geometry) out.push({ ...(d as any), properties: f.properties ?? {} });
  }
  return featureCollection(out);
}

/** Intersect each `fc` polygon with `mask` (keeps overlapping parts, carrying `fc` properties). */
export function intersect(fc: PolygonFC, mask: PolygonFC): PolygonFC {
  const out: Array<Feature<Polygon | MultiPolygon>> = [];
  for (const f of fc.features) {
    for (const m of mask.features) {
      const i = turfIntersect2(featureCollection([f, m] as any));
      if (i && i.geometry) out.push({ ...(i as any), properties: { ...(f.properties ?? {}), ...(m.properties ?? {}) } });
    }
  }
  return featureCollection(out);
}

/** Voronoi / Thiessen polygons around each point (clipped to the points' bbox by default). */
export function voronoi(pointsFc: PointFC, bbox?: [number, number, number, number]): PolygonFC {
  const box = bbox ?? (turfBbox(pointsFc) as [number, number, number, number]);
  const v = turfVoronoi(pointsFc as any, { bbox: box });
  const out = (v.features || []).filter((f: any) => f && f.geometry) as Array<Feature<Polygon | MultiPolygon>>;
  return featureCollection(out);
}

/** Convex hull of all features. */
export function convexHull(fc: AnyFC): PolygonFC {
  const h = turfConvex(fc as any);
  return featureCollection(h ? [h as Feature<Polygon | MultiPolygon>] : []);
}

/** Concave hull of point features (`maxEdgeKm` limits edge length). */
export function concaveHull(pointsFc: PointFC, maxEdgeKm?: number): PolygonFC {
  const h = turfConcave(pointsFc as any, maxEdgeKm ? { maxEdge: maxEdgeKm, units: "kilometers" } : undefined);
  return featureCollection(h ? [h as Feature<Polygon | MultiPolygon>] : []);
}

export type AggregateStat = "count" | "sum" | "mean" | "min" | "max";

/** One aggregated group row from {@link aggregate}. */
export interface AggregateRow {
  group: string;
  count: number;
  sum?: number;
  mean?: number;
  min?: number;
  max?: number;
}

/**
 * Dissolve-with-stats: group features by `groupField` and compute count (+ sum/mean/min/max of `valueField`).
 * The missing "statistics" half of dissolve — returns plain rows (attach to geometry via {@link dissolve}).
 */
export function aggregate(fc: AnyFC, groupField: string, valueField?: string): AggregateRow[] {
  const groups = new Map<string, number[]>();
  for (const f of fc.features) {
    const key = String((f.properties ?? {})[groupField] ?? "");
    const arr = groups.get(key) ?? [];
    if (valueField) {
      const v = Number((f.properties ?? {})[valueField]);
      if (Number.isFinite(v)) arr.push(v);
    } else {
      arr.push(0);
    }
    groups.set(key, arr);
  }
  const rows: AggregateRow[] = [];
  for (const [group, values] of groups) {
    const row: AggregateRow = { group, count: values.length };
    if (valueField && values.length) {
      const sum = values.reduce((a, b) => a + b, 0);
      row.sum = sum;
      row.mean = sum / values.length;
      row.min = Math.min(...values);
      row.max = Math.max(...values);
    }
    rows.push(row);
  }
  return rows;
}

/** A hex-bin density surface: a hex grid over the points' extent, each cell carrying a point `count`. */
export function hexbinDensity(pointsFc: PointFC, cellSizeKm: number): PolygonFC {
  const raw = turfBbox(pointsFc) as [number, number, number, number];
  // Pad the extent by ~one cell (in degrees) so points on the bbox edge/corners are still covered.
  const padDeg = cellSizeKm / 111;
  const box: [number, number, number, number] = [raw[0] - padDeg, raw[1] - padDeg, raw[2] + padDeg, raw[3] + padDeg];
  const grid = turfHexGrid(box, cellSizeKm, { units: "kilometers" });
  const cells: Array<Feature<Polygon | MultiPolygon>> = [];
  for (const cell of grid.features as Array<Feature<Polygon>>) {
    let count = 0;
    for (const p of pointsFc.features) {
      if (p.geometry && booleanPointInPolygon(p as any, cell as any)) count++;
    }
    cells.push({ ...(cell as any), properties: { ...(cell.properties ?? {}), count } });
  }
  return featureCollection(cells);
}

/**
 * Hotspot analysis (a Getis-Ord Gi*-style z-score) over a hex-bin count surface: cells whose neighborhood
 * count is unusually high (z > 0) or low (z < 0). Simplified — uses first-order (touching) neighbors and the
 * global mean/stddev of counts. Adds a `gi_z` score to each cell of {@link hexbinDensity}.
 */
export function hotspot(pointsFc: PointFC, cellSizeKm: number): PolygonFC {
  const cells = hexbinDensity(pointsFc, cellSizeKm).features;
  const counts = cells.map((c) => Number((c.properties as any).count) || 0);
  const n = counts.length || 1;
  const mean = counts.reduce((a, b) => a + b, 0) / n;
  const variance = counts.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance) || 1;
  // neighborhood sum via centroid distance ≤ 1.9 × cell size (touching hexes)
  const centroids = cells.map((c) => turfCentroid2(c as any));
  const out = cells.map((cell, i) => {
    let sum = 0;
    let k = 0;
    for (let j = 0; j < cells.length; j++) {
      const d = turfDistance(centroids[i], centroids[j], { units: "kilometers" });
      if (d <= cellSizeKm * 1.9) {
        sum += counts[j];
        k++;
      }
    }
    const expected = mean * k;
    const denom = sd * Math.sqrt((n * k - k * k) / (n - 1 || 1));
    const gi_z = denom !== 0 ? (sum - expected) / denom : 0;
    return { ...(cell as any), properties: { ...(cell.properties as any), gi_z: Number(gi_z.toFixed(3)) } };
  });
  return featureCollection(out);
}

export interface WeightedLayer {
  /** A field on each feature carrying a 0–1 (or arbitrary) suitability score. */
  field: string;
  /** Relative weight (need not sum to 1; normalized internally). */
  weight: number;
}

/**
 * Weighted-overlay / suitability: for a feature set already carrying per-criterion score fields, compute a
 * combined `suitability` = Σ(normalizedWeight × field). A keyless alternative to Esri's Suitability Modeler
 * (the UI panel drives the weights). Values are used as-is; normalize your criteria to a common scale first.
 */
export function weightedOverlay(fc: AnyFC, layers: WeightedLayer[]): AnyFC {
  const total = layers.reduce((a, l) => a + Math.abs(l.weight), 0) || 1;
  const out = fc.features.map((f) => {
    const props = f.properties ?? {};
    let score = 0;
    for (const l of layers) {
      const v = Number(props[l.field]);
      if (Number.isFinite(v)) score += (l.weight / total) * v;
    }
    return { ...f, properties: { ...props, suitability: Number(score.toFixed(4)) } };
  });
  return featureCollection(out as any);
}
