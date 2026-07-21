/**
 * @strata/plugin-routing — public surface.
 */
export type {
  Waypoint,
  RouteProfile,
  RouteResult,
  RouteOptions,
  RoutingProvider,
} from "./types.js";
export {
  osrmProvider,
  esriRouteProvider,
  nearest,
  haversineMeters,
  fetchIsochrone,
  type OsrmOptions,
  type EsriRouteOptions,
  type NearestCandidate,
  type IsochroneOptions,
} from "./providers.js";
export { routingPlugin, type RoutingPluginOptions } from "./routingPlugin.js";
