/**
 * @strata/plugin-search — geocoding / place-search types.
 *
 * A `SearchProvider` turns a free-text query into ranked `SearchResult`s (label + coords,
 * optionally a bounding box). Providers use the global `fetch`; the Esri provider is optional
 * and loaded lazily so nothing forces an Esri dependency on the lean core.
 */

/** One geocoded place. `bbox` is [minLng, minLat, maxLng, maxLat] (EPSG:4326) when known. */
export interface SearchResult {
  label: string;
  lng: number;
  lat: number;
  bbox?: [number, number, number, number];
}

/** Options accepted by a provider's `search`. */
export interface SearchOptions {
  /** Max results to return. Providers should default to a small number (e.g. 5). */
  limit?: number;
}

/** A pluggable geocoding backend. */
export interface SearchProvider {
  name: string;
  search(query: string, opts?: SearchOptions): Promise<SearchResult[]>;
}
