/**
 * The adapter surface. Everything here is structural + injectable so it is testable without the real
 * `@esri/maplibre-arcgis` installed; in production `loadMaplibreArcgis()` lazily `import()`s the plugin.
 */

const MODULE = "@esri/maplibre-arcgis";

/** Token / session auth for ArcGIS content (short-lived, referer-bound — never stored or printed). */
export interface ArcgisAuth {
  token?: string;
  /** An `@esri/maplibre-arcgis` basemap *session* (12-hour single-charge tile access). */
  session?: unknown;
}

/** A MapLibre source descriptor the plugin produced (strata renders it; it does NOT re-fetch). */
export interface MapLibreSourceDescriptor {
  type: string;
  [k: string]: unknown;
}

/** What the adapter returns for a service: the plugin FETCHED the source; strata's compiler STYLES it. */
export interface ResolvedArcgisService {
  /** MapLibre source descriptor (the plugin resolved the URL/item id). */
  source: MapLibreSourceDescriptor;
  /** Genuine ESRI `drawingInfo` — hand to `@strata/core-map`'s style compiler. */
  drawingInfo?: Record<string, unknown>;
  /** Genuine ESRI `popupInfo`. */
  popupInfo?: Record<string, unknown>;
  /** Field descriptors, when the service supplies them. */
  fields?: Array<{ name: string; type: string; alias?: string }>;
}

/** Options for loading an ArcGIS basemap style. */
export interface ArcgisBasemapOptions extends ArcgisAuth {
  /** Basemap style enum/id (e.g. "arcgis/streets", "arcgis/navigation"). */
  style: string;
  language?: string;
  worldview?: string;
  places?: string;
}

/**
 * The subset of `@esri/maplibre-arcgis` this adapter uses. The real module is bound to these at the
 * integration seam; kept as an interface so tests inject a mock and the contract is explicit.
 */
export interface MaplibreArcgisModule {
  /** Resolve a feature/vector-tile service (by URL or item id) to a source + its ESRI drawingInfo/popupInfo. */
  resolveService?: (idOrUrl: string, auth: ArcgisAuth) => Promise<ResolvedArcgisService> | ResolvedArcgisService;
  /** Resolve an ArcGIS basemap style to a MapLibre source/style descriptor. */
  basemapStyle?: (opts: ArcgisBasemapOptions) => Promise<MapLibreSourceDescriptor> | MapLibreSourceDescriptor;
}

/** A minimal basemap entry the strata `BasemapPanel` can list (structural — mirrors `BasemapOption`). */
export interface ArcgisBasemapEntry {
  id: string;
  title: string;
  /** Marks this as an ArcGIS (keyed) entry so the UI can badge it and only show it when auth is present. */
  provider: "arcgis";
  style: string;
}

/**
 * Lazily load the Esri plugin. `loader` is injectable for tests; by default this `import()`s the optional
 * peer dependency and throws a clear, actionable error when it is absent.
 */
export async function loadMaplibreArcgis(
  loader?: () => Promise<MaplibreArcgisModule>,
): Promise<MaplibreArcgisModule> {
  try {
    return loader ? await loader() : ((await import(/* @vite-ignore */ MODULE)) as MaplibreArcgisModule);
  } catch {
    throw new Error(
      "@strata/basemap-arcgis requires the optional peer dependency '@esri/maplibre-arcgis'. " +
        "Install it: pnpm add @esri/maplibre-arcgis",
    );
  }
}

export interface ResolveServiceOptions extends ArcgisAuth {
  /** Inject the plugin module (tests / custom binding); defaults to the lazy peer-dep import. */
  module?: MaplibreArcgisModule;
}

/**
 * Resolve an ArcGIS feature/vector-tile service. The plugin fetches the source; the caller hands the
 * returned `drawingInfo`/`popupInfo` to `@strata/core-map`'s compiler — the clean fetch/style division.
 */
export async function resolveArcgisService(
  idOrUrl: string,
  opts: ResolveServiceOptions = {},
): Promise<ResolvedArcgisService> {
  const mod = opts.module ?? (await loadMaplibreArcgis());
  if (typeof mod.resolveService !== "function") {
    throw new Error("@esri/maplibre-arcgis: service resolution is unavailable in this plugin version.");
  }
  return mod.resolveService(idOrUrl, { token: opts.token, session: opts.session });
}

export interface LoadBasemapOptions extends ArcgisBasemapOptions {
  module?: MaplibreArcgisModule;
}

/** Load an ArcGIS basemap style to a MapLibre source descriptor (12-hour session cost model via the plugin). */
export async function loadArcgisBasemap(opts: LoadBasemapOptions): Promise<MapLibreSourceDescriptor> {
  const mod = opts.module ?? (await loadMaplibreArcgis());
  if (typeof mod.basemapStyle !== "function") {
    throw new Error("@esri/maplibre-arcgis: basemap styles are unavailable in this plugin version.");
  }
  return mod.basemapStyle({
    style: opts.style,
    token: opts.token,
    session: opts.session,
    language: opts.language,
    worldview: opts.worldview,
    places: opts.places,
  });
}

/**
 * Build a `BasemapPanel` entry for an ArcGIS basemap. It is only meant to be added to the panel's list when
 * a token/session is configured (per CLAUDE.md: never default to a keyed provider).
 */
export function arcgisBasemapEntry(style: string, title?: string): ArcgisBasemapEntry {
  return { id: `arcgis:${style}`, title: title ?? style, provider: "arcgis", style };
}
