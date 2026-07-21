/**
 * Routing providers + the `nearest` helper.
 *
 * - `osrmProvider` — keyless. Defaults to the **public OSRM demo server**
 *   (https://router.project-osrm.org), which is rate-limited and driving-only. Self-host for
 *   production and pass a custom `endpoint`.
 * - `esriRouteProvider` — optional, lazy stub over `@esri/arcgis-rest-routing`. Esri routing
 *   needs an Esri key / credits / backend.
 * - `nearest` — a dependency-free haversine nearest-candidate helper.
 */

import type {
  RoutingProvider,
  RouteResult,
  RouteOptions,
  Waypoint,
} from "./types.js";

// ---------------------------------------------------------------------------
// Public OSRM (keyless)
// ---------------------------------------------------------------------------

export interface OsrmOptions {
  /**
   * Base OSRM endpoint, without the trailing `/route/v1/...`. Defaults to the public demo
   * server. **Self-host for production** — the public server is rate-limited and driving-only.
   */
  endpoint?: string;
}

const OSRM_DEFAULT_ENDPOINT = "https://router.project-osrm.org";

interface OsrmResponse {
  code?: string;
  routes?: Array<{
    geometry?: GeoJSON.LineString;
    distance?: number; // meters
    duration?: number; // seconds
  }>;
}

/**
 * OSRM routing provider. Keyless. The public demo server only supports the "driving" profile;
 * `opts.profile` is accepted for interface parity but ignored against the default endpoint.
 */
export function osrmProvider(options: OsrmOptions = {}): RoutingProvider {
  const base = (options.endpoint ?? OSRM_DEFAULT_ENDPOINT).replace(/\/+$/, "");

  return {
    name: "osrm",
    async route(waypoints: Waypoint[], _opts?: RouteOptions): Promise<RouteResult> {
      if (waypoints.length < 2) {
        throw new Error("osrm: at least two waypoints are required");
      }

      const coords = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(";");
      const url = new URL(`${base}/route/v1/driving/${coords}`);
      url.searchParams.set("overview", "full");
      url.searchParams.set("geometries", "geojson");

      const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
      if (!res.ok) {
        throw new Error(`osrm: HTTP ${res.status} ${res.statusText}`);
      }

      const body = (await res.json()) as OsrmResponse;
      const first = body.routes?.[0];
      if (body.code !== "Ok" || !first || !first.geometry) {
        throw new Error(`osrm: no route (code=${body.code ?? "unknown"})`);
      }

      return {
        geometry: first.geometry,
        distanceMeters: Number(first.distance ?? 0),
        durationSeconds: Number(first.duration ?? 0),
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Esri routing (optional, lazy)
// ---------------------------------------------------------------------------

export interface EsriRouteOptions {
  /** Esri API key / token. Esri routing needs a key, credits, or a backend proxy. */
  token?: string;
  /** Override the route service URL (defaults to Esri's World Route Service). */
  url?: string;
}

// Variable specifiers so TypeScript does not statically resolve these optional peer deps.
const ESRI_ROUTING = "@esri/arcgis-rest-routing";
const ESRI_REST_REQUEST = "@esri/arcgis-rest-request";

async function loadRouting(): Promise<any> {
  try {
    return await import(/* @vite-ignore */ ESRI_ROUTING);
  } catch {
    throw new Error(
      "@strata/plugin-routing esriRouteProvider requires the optional peer dependency " +
        "'@esri/arcgis-rest-routing'. Install it: pnpm add @esri/arcgis-rest-routing @esri/arcgis-rest-request",
    );
  }
}

async function resolveAuth(token?: string): Promise<unknown> {
  if (!token) return undefined;
  try {
    const req: any = await import(/* @vite-ignore */ ESRI_REST_REQUEST);
    return req.ApiKeyManager.fromKey(token);
  } catch {
    return undefined; // token may still be forwarded via params by the Esri lib
  }
}

/**
 * Esri World Route Service provider (optional). NOTE: Esri routing needs an Esri API
 * key/token, credits, or a proxy backend — it is not keyless. The `@esri/arcgis-rest-routing`
 * peer dep is loaded lazily; a clear error is thrown if it is not installed.
 */
export function esriRouteProvider(options: EsriRouteOptions): RoutingProvider {
  return {
    name: "esri-route",
    async route(waypoints: Waypoint[], _opts?: RouteOptions): Promise<RouteResult> {
      if (waypoints.length < 2) {
        throw new Error("esri-route: at least two waypoints are required");
      }

      const routing = await loadRouting();
      const authentication = await resolveAuth(options.token);

      const params: Record<string, unknown> = {
        // Esri `solveRoute` accepts [lng, lat] stop pairs.
        stops: waypoints.map(([lng, lat]) => [lng, lat]),
      };
      if (options.url) params.endpoint = options.url;
      if (authentication) params.authentication = authentication;
      else if (options.token) params.params = { token: options.token };

      const response: any = await routing.solveRoute(params);
      const route = response?.routes?.features?.[0];
      const geometry = esriPathsToLineString(route?.geometry?.paths);
      if (!geometry) throw new Error("esri-route: response contained no route geometry");

      const attrs = route?.attributes ?? {};
      // Esri returns miles/minutes by default under Total_Miles / Total_TravelTime.
      const distanceMeters = Number(attrs.Total_Kilometers ?? 0) * 1000
        || Number(attrs.Total_Miles ?? 0) * 1609.344;
      const durationSeconds = Number(attrs.Total_TravelTime ?? 0) * 60;

      return { geometry, distanceMeters, durationSeconds };
    },
  };
}

/** Flatten an Esri polyline `paths` array into a single GeoJSON LineString. */
function esriPathsToLineString(paths: unknown): GeoJSON.LineString | null {
  if (!Array.isArray(paths) || paths.length === 0) return null;
  const coordinates: GeoJSON.Position[] = [];
  for (const path of paths) {
    if (!Array.isArray(path)) continue;
    for (const pt of path) {
      if (Array.isArray(pt) && pt.length >= 2) {
        coordinates.push([Number(pt[0]), Number(pt[1])]);
      }
    }
  }
  if (coordinates.length < 2) return null;
  return { type: "LineString", coordinates };
}

// ---------------------------------------------------------------------------
// nearest — haversine, no dependency
// ---------------------------------------------------------------------------

export interface NearestCandidate {
  id: string;
  lng: number;
  lat: number;
}

const EARTH_RADIUS_M = 6_371_008.8; // mean Earth radius (meters)

/** Great-circle distance in meters between two [lng, lat] points. */
export function haversineMeters(a: Waypoint, b: Waypoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * Nearest candidate to `from` by straight-line (haversine) distance — e.g. "nearest facility".
 * Returns `null` for an empty candidate list.
 */
export function nearest(
  from: Waypoint,
  candidates: NearestCandidate[],
): { id: string; distanceMeters: number } | null {
  let best: { id: string; distanceMeters: number } | null = null;
  for (const c of candidates) {
    const d = haversineMeters(from, [c.lng, c.lat]);
    if (best === null || d < best.distanceMeters) {
      best = { id: c.id, distanceMeters: d };
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Isochrones / service areas (drive/walk-time polygons)
// ---------------------------------------------------------------------------

export interface IsochroneOptions {
  /**
   * Isochrone service endpoint. A **self-hosted Valhalla** `/isochrone` is keyless; OpenRouteService is
   * keyed (`apiKey`). No public keyless default is assumed — pass your endpoint.
   */
  endpoint: string;
  /** "valhalla" (default) or "ors" request/response shape. */
  format?: "valhalla" | "ors";
  /** Travel profile. */
  profile?: "auto" | "pedestrian" | "bicycle";
  /** OpenRouteService API key (omit for keyless Valhalla). */
  apiKey?: string;
}

/** Map a generic profile to a provider costing/profile string. */
function isoProfile(format: "valhalla" | "ors", profile: string): string {
  if (format === "ors") {
    return profile === "pedestrian" ? "foot-walking" : profile === "bicycle" ? "cycling-regular" : "driving-car";
  }
  return profile === "pedestrian" ? "pedestrian" : profile === "bicycle" ? "bicycle" : "auto";
}

/**
 * Fetch drive/walk-time **isochrone** polygons around a point for the given `minutes` breaks — the missing
 * service-area capability. Returns a GeoJSON `FeatureCollection` of polygons (add it as a layer). Works with
 * a keyless self-hosted Valhalla or a keyed OpenRouteService; the request/response shape is selected by
 * `format`. Uses the global `fetch`.
 */
export async function fetchIsochrone(
  center: Waypoint,
  minutes: number[],
  options: IsochroneOptions,
): Promise<GeoJSON.FeatureCollection> {
  const format = options.format ?? "valhalla";
  const profile = isoProfile(format, options.profile ?? "auto");
  const [lng, lat] = center;

  let url = options.endpoint;
  let body: unknown;
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };

  if (format === "ors") {
    // OpenRouteService: POST {locations:[[lng,lat]], range:[seconds], range_type:"time"}.
    url = `${options.endpoint.replace(/\/+$/, "")}/${profile}`;
    if (options.apiKey) headers.Authorization = options.apiKey;
    body = { locations: [[lng, lat]], range: minutes.map((m) => m * 60), range_type: "time" };
  } else {
    // Valhalla: POST {locations:[{lat,lon}], costing, contours:[{time:min}], polygons:true}.
    body = {
      locations: [{ lat, lon: lng }],
      costing: profile,
      contours: minutes.map((time) => ({ time })),
      polygons: true,
    };
  }

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`isochrone: HTTP ${res.status} ${res.statusText}`);
  const json = (await res.json()) as GeoJSON.FeatureCollection;
  if (!json || json.type !== "FeatureCollection") throw new Error("isochrone: unexpected response (not a FeatureCollection)");
  return json;
}
