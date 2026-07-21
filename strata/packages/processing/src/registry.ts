/**
 * The tool registry — `id -> { label, run(args) }` so a UI or command can enumerate the
 * available spatial analyses and invoke them uniformly with a single args object.
 */

import {
  buffer,
  centroids,
  dissolve,
  clip,
  nearest,
  pointsWithin,
  spatialJoin,
  withinDistance,
  dotDensity,
  union,
  difference,
  intersect,
  voronoi,
  convexHull,
  concaveHull,
  aggregate,
  hexbinDensity,
  hotspot,
  weightedOverlay,
  type JoinPredicate,
  type NearestResult,
  type WeightedLayer,
} from "./operations.js";
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

/** A registered spatial tool. `run` is intentionally loosely typed for UI dispatch. */
export interface ProcessingTool {
  label: string;
  description: string;
  run(args: Record<string, unknown>): unknown;
}

export const registry: Record<string, ProcessingTool> = {
  buffer: {
    label: "Buffer",
    description: "Buffer every feature by a distance in kilometres.",
    run: (args) => buffer(args.fc as AnyFC, args.distanceKm as number),
  },
  centroids: {
    label: "Centroids",
    description: "Compute the centroid of each feature.",
    run: (args) => centroids(args.fc as AnyFC),
  },
  dissolve: {
    label: "Dissolve",
    description: "Merge polygons, optionally grouping by a shared field value.",
    run: (args) => dissolve(args.fc as PolygonFC, args.field as string | undefined),
  },
  clip: {
    label: "Clip",
    description: "Clip features to a polygon mask (intersection).",
    run: (args) => clip(args.fc as AnyFC, args.mask as PolygonFC),
  },
  nearest: {
    label: "Nearest",
    description: "Find the nearest candidate point to a reference point.",
    run: (args): NearestResult =>
      nearest(args.fromPoint as Feature<Point>, args.candidatesFc as PointFC),
  },
  pointsWithin: {
    label: "Points within (select by location)",
    description: "Select the points that fall inside any polygon.",
    run: (args) => pointsWithin(args.pointsFc as PointFC, args.polygonsFc as PolygonFC),
  },
  spatialJoin: {
    label: "Spatial join",
    description: "Attach join-feature properties to targets by a spatial predicate.",
    run: (args) =>
      spatialJoin(args.targetFc as AnyFC, args.joinFc as AnyFC, {
        predicate: (args.predicate as JoinPredicate) ?? "intersects",
      }),
  },
  withinDistance: {
    label: "Within distance",
    description: "Select points within X km of any reference point.",
    run: (args) =>
      withinDistance(args.pointsFc as PointFC, args.refPointsFc as PointFC, args.km as number),
  },
  dotDensity: {
    label: "Dot density",
    description: "Expand polygons into a derived point layer (round(field / dotValue) dots each).",
    run: (args) =>
      dotDensity(args.fc as PolygonFC, {
        field: args.field as string,
        dotValue: args.dotValue as number,
        maxDots: args.maxDots as number | undefined,
      }),
  },
  union: {
    label: "Union",
    description: "Merge all polygons into one.",
    run: (args) => union(args.fc as PolygonFC),
  },
  difference: {
    label: "Difference (erase)",
    description: "Erase the mask polygons from each feature (a − b).",
    run: (args) => difference(args.fc as PolygonFC, args.mask as PolygonFC),
  },
  intersect: {
    label: "Intersect",
    description: "Keep the overlapping parts of two polygon sets.",
    run: (args) => intersect(args.fc as PolygonFC, args.mask as PolygonFC),
  },
  voronoi: {
    label: "Voronoi (Thiessen)",
    description: "Thiessen polygons around each point.",
    run: (args) => voronoi(args.pointsFc as PointFC, args.bbox as [number, number, number, number] | undefined),
  },
  convexHull: {
    label: "Convex hull",
    description: "Smallest convex polygon enclosing all features.",
    run: (args) => convexHull(args.fc as AnyFC),
  },
  concaveHull: {
    label: "Concave hull",
    description: "Concave boundary of point features (maxEdgeKm limits edge length).",
    run: (args) => concaveHull(args.pointsFc as PointFC, args.maxEdgeKm as number | undefined),
  },
  aggregate: {
    label: "Aggregate (dissolve-with-stats)",
    description: "Group by a field → count/sum/mean/min/max of a value field.",
    run: (args) => aggregate(args.fc as AnyFC, args.groupField as string, args.valueField as string | undefined),
  },
  hexbinDensity: {
    label: "Hexbin density",
    description: "Hex grid over the points, each cell carrying a point count.",
    run: (args) => hexbinDensity(args.pointsFc as PointFC, args.cellSizeKm as number),
  },
  hotspot: {
    label: "Hotspot (Getis-Ord Gi*)",
    description: "Hex-bin count surface with a Gi* z-score per cell.",
    run: (args) => hotspot(args.pointsFc as PointFC, args.cellSizeKm as number),
  },
  weightedOverlay: {
    label: "Weighted overlay (suitability)",
    description: "Combine per-criterion score fields by weight → a suitability field.",
    run: (args) => weightedOverlay(args.fc as AnyFC, args.layers as WeightedLayer[]),
  },
};

/** Enumerate the registered tool ids (for building a UI menu). */
export function listTools(): Array<{ id: string; label: string; description: string }> {
  return Object.entries(registry).map(([id, t]) => ({
    id,
    label: t.label,
    description: t.description,
  }));
}
