/**
 * @strata/plugin-search — public surface.
 */
export type { SearchResult, SearchOptions, SearchProvider } from "./types.js";
export {
  nominatimProvider,
  esriGeocodeProvider,
  type NominatimOptions,
  type EsriGeocodeOptions,
} from "./providers.js";
export { searchPlugin } from "./searchPlugin.js";
