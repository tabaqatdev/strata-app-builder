/**
 * Search providers.
 *
 * - `nominatimProvider` — keyless OSM Nominatim. Respect the usage policy
 *   (https://operations.osmfoundation.org/policies/nominatim/): identify yourself with an
 *   `email` / custom UA, keep request volume low, and prefer a self-hosted `endpoint` at scale.
 * - `esriGeocodeProvider` — optional, lazy stub over `@esri/arcgis-rest-geocoding`. Esri
 *   geocoding needs an Esri API key / token or a proxy backend.
 */

import type { SearchProvider, SearchResult, SearchOptions } from "./types.js";

// ---------------------------------------------------------------------------
// OSM Nominatim (keyless)
// ---------------------------------------------------------------------------

export interface NominatimOptions {
  /**
   * Contact email forwarded to Nominatim per its usage policy. Also used to build a
   * descriptive User-Agent note. Strongly recommended when using the public endpoint.
   */
  email?: string;
  /** Override the base search endpoint (self-hosted Nominatim recommended for production). */
  endpoint?: string;
}

const NOMINATIM_DEFAULT_ENDPOINT = "https://nominatim.openstreetmap.org/search";

interface NominatimRow {
  display_name?: string;
  lon?: string;
  lat?: string;
  /** Nominatim order: [south, north, west, east] as strings. */
  boundingbox?: [string, string, string, string];
}

/**
 * OpenStreetMap Nominatim geocoder. Keyless. Please read and respect the usage policy —
 * set `email` (and ideally self-host `endpoint`) for anything beyond light interactive use.
 */
export function nominatimProvider(options: NominatimOptions = {}): SearchProvider {
  const endpoint = options.endpoint ?? NOMINATIM_DEFAULT_ENDPOINT;

  return {
    name: "nominatim",
    async search(query: string, opts?: SearchOptions): Promise<SearchResult[]> {
      const q = query.trim();
      if (!q) return [];

      const limit = opts?.limit ?? 5;
      const url = new URL(endpoint);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("q", q);
      url.searchParams.set("limit", String(limit));
      if (options.email) url.searchParams.set("email", options.email);

      // A descriptive UA is required by the OSM usage policy. Browsers forbid setting
      // User-Agent, so we send Referer-friendly identification where we can; the `email`
      // query param above is the primary policy-compliant identifier.
      const headers: Record<string, string> = { Accept: "application/json" };
      if (options.email) headers["X-Requested-With"] = `strata-plugin-search (${options.email})`;

      const res = await fetch(url.toString(), { headers });
      if (!res.ok) {
        throw new Error(`nominatim: HTTP ${res.status} ${res.statusText}`);
      }

      const rows = (await res.json()) as NominatimRow[];
      if (!Array.isArray(rows)) return [];

      return rows
        .map((r): SearchResult | null => {
          const lng = Number(r.lon);
          const lat = Number(r.lat);
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

          const result: SearchResult = {
            label: r.display_name ?? `${lat}, ${lng}`,
            lng,
            lat,
          };

          // boundingbox: [south, north, west, east] → bbox [minLng, minLat, maxLng, maxLat]
          if (r.boundingbox && r.boundingbox.length === 4) {
            const south = Number(r.boundingbox[0]);
            const north = Number(r.boundingbox[1]);
            const west = Number(r.boundingbox[2]);
            const east = Number(r.boundingbox[3]);
            if ([south, north, west, east].every(Number.isFinite)) {
              result.bbox = [west, south, east, north];
            }
          }
          return result;
        })
        .filter((r): r is SearchResult => r !== null);
    },
  };
}

// ---------------------------------------------------------------------------
// Esri geocoding (optional, lazy)
// ---------------------------------------------------------------------------

export interface EsriGeocodeOptions {
  /** Esri API key / token. Esri geocoding needs an Esri key or a backend proxy. */
  token?: string;
  /** Override the geocoding service URL (defaults to Esri's World Geocoding Service). */
  url?: string;
}

// Variable specifiers so TypeScript does not statically resolve these optional peer deps.
const ESRI_GEOCODING = "@esri/arcgis-rest-geocoding";
const ESRI_REST_REQUEST = "@esri/arcgis-rest-request";

async function loadGeocoding(): Promise<any> {
  try {
    return await import(/* @vite-ignore */ ESRI_GEOCODING);
  } catch {
    throw new Error(
      "@strata/plugin-search esriGeocodeProvider requires the optional peer dependency " +
        "'@esri/arcgis-rest-geocoding'. Install it: pnpm add @esri/arcgis-rest-geocoding @esri/arcgis-rest-request",
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
 * Esri World Geocoding provider (optional). NOTE: Esri geocoding needs an Esri API key/token
 * or a proxy backend — it is not keyless. The `@esri/arcgis-rest-geocoding` peer dep is loaded
 * lazily; a clear error is thrown if it is not installed.
 */
export function esriGeocodeProvider(options: EsriGeocodeOptions): SearchProvider {
  return {
    name: "esri-geocode",
    async search(query: string, opts?: SearchOptions): Promise<SearchResult[]> {
      const q = query.trim();
      if (!q) return [];

      const geocoding = await loadGeocoding();
      const authentication = await resolveAuth(options.token);
      const limit = opts?.limit ?? 5;

      const params: Record<string, unknown> = {
        singleLine: q,
        maxLocations: limit,
        outFields: "*",
      };
      if (options.url) params.endpoint = options.url;
      if (authentication) params.authentication = authentication;
      else if (options.token) params.params = { token: options.token };

      const response: any = await geocoding.geocode(params);
      const candidates: any[] = Array.isArray(response?.candidates) ? response.candidates : [];

      return candidates
        .slice(0, limit)
        .map((c): SearchResult | null => {
          const lng = Number(c?.location?.x);
          const lat = Number(c?.location?.y);
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

          const result: SearchResult = {
            label: String(c?.address ?? `${lat}, ${lng}`),
            lng,
            lat,
          };

          const e = c?.extent;
          if (e && [e.xmin, e.ymin, e.xmax, e.ymax].every((n: unknown) => Number.isFinite(Number(n)))) {
            result.bbox = [Number(e.xmin), Number(e.ymin), Number(e.xmax), Number(e.ymax)];
          }
          return result;
        })
        .filter((r): r is SearchResult => r !== null);
    },
  };
}
