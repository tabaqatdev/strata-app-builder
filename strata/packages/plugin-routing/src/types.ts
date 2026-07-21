/**
 * @strata/plugin-routing — routing / directions types.
 *
 * A `RoutingProvider` turns an ordered list of waypoints into a single `RouteResult`
 * (a GeoJSON LineString plus distance/duration). Providers use the global `fetch`; the Esri
 * provider is optional and loaded lazily so nothing forces an Esri dependency.
 */

/** A single waypoint as [lng, lat] (EPSG:4326). */
export type Waypoint = [number, number];

/** Travel profile. Public OSRM demo servers effectively only support "driving". */
export type RouteProfile = "driving" | "walking" | "cycling";

/** The computed route. `geometry` is a GeoJSON LineString in [lng, lat] order. */
export interface RouteResult {
  geometry: GeoJSON.LineString;
  distanceMeters: number;
  durationSeconds: number;
}

/** Options accepted by a provider's `route`. */
export interface RouteOptions {
  profile?: RouteProfile;
}

/** A pluggable routing backend. */
export interface RoutingProvider {
  name: string;
  route(waypoints: Waypoint[], opts?: RouteOptions): Promise<RouteResult>;
}
