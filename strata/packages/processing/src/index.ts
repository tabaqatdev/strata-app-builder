/**
 * @strata/processing — public surface.
 */
export {
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
  type DotDensityOptions,
  type AggregateStat,
  type AggregateRow,
  type WeightedLayer,
} from "./operations.js";
export { registry, listTools, type ProcessingTool } from "./registry.js";
