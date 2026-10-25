/**
 * basemaps — apply a `baseMap.baseMapLayers[]` to the MapLibre style (raster/vector below operational
 * layers), and the **compatibility shim** over the one basemap catalog, `@strata/map-controls`.
 *
 * There is ONE catalog: `@strata/map-controls/basemaps` (33 keyless basemaps in four groups —
 * OpenStreetMap · Esri · USGS · CARTO — each with licence tags, a description and a thumbnail, plus
 * `BASEMAP_ALIASES` for retired ids). Everything here is derived from it:
 *
 *  - `OPEN_BASEMAPS` / `VECTOR_BASEMAPS` / `RASTER_BASEMAPS` are the catalog in the older
 *    {@link BasemapPreset} shape (deprecated — read `basemapCatalog` instead).
 *  - `defaultBaseMap()` is **OpenStreetMap** (`osm`); the theme pair is `osm` / `osm-dark`
 *    (the same tiles, inverted for dark).
 *  - Every basemap **id** resolves through the catalog's aliases, so a saved `layers.json` that names
 *    a retired id (`openfreemap-positron`, `ofm-positron`, `versatiles-colorful`, `carto-dark-gl`, …)
 *    still renders — as the surviving entry the alias names.
 *  - Every URL goes through `catalog.resolveUrl` (the one tile-proxy / mirror hook); pair the map
 *    with `basemapTransformRequest(catalog)` so the rule also reaches a GL style's internals.
 *
 * "Keyless" is asserted by the catalog's own suites (offline host/deny-list guards and the live
 * `verify:basemaps` behaviour check) — see `strata/docs/troubleshooting.md` §5.
 */
import type { BaseMap } from "@strata/schema";
import * as catalog from "@strata/map-controls/basemaps";
import type { BasemapEntry } from "@strata/map-controls/basemaps";

/** The basemap catalog namespace (`@strata/map-controls/basemaps`) — the one source of truth. */
export const basemapCatalog = catalog;

/**
 * A selectable basemap (raster `templateUrl`, or a vector `style` URL) — the older preset shape.
 * Catalog-derived presets also carry the catalog's extra fields (group, description, licence, …).
 */
export interface BasemapPreset {
  id: string;
  title: string;
  /** Raster template using ESRI Web Map tokens `{level}/{col}/{row}` (or `{level}/{row}/{col}`). */
  templateUrl?: string;
  /** Vector-tile GL style JSON URL. */
  style?: string;
  /** Which UI theme this basemap pairs with (dark map ↔ dark UI). Drives {@link basemapForTheme}. */
  mode?: "light" | "dark";
  copyright?: string;
  /** Catalog group ("OpenStreetMap" | "Esri" | "USGS" | "CARTO"). */
  group?: string;
  /** 1–2 sentences for the gallery tooltip. */
  description?: string;
  /** A raster reference overlay (labels) drawn above `templateUrl`. */
  overlay?: string;
  /** Deepest native raster level (MapLibre over-zooms past it). */
  maxZoom?: number;
  /** Raster paint for the base layer (e.g. OpenStreetMap Dark's inversion). */
  paint?: Record<string, number>;
  /** Opposite-mode partner id. */
  pair?: string;
  license?: "commercial-ok" | "non-commercial";
  licenseNote?: string;
  licenseUrl?: string;
  thumbnail?: string;
}

/** A catalog entry as a {@link BasemapPreset}. `thumbnail` stays live (it follows `setThumbBase`). */
function presetFrom(e: BasemapEntry): BasemapPreset {
  const { thumbnail: _thumbnail, ...rest } = e;
  const p = { ...rest } as BasemapPreset;
  Object.defineProperty(p, "thumbnail", { get: () => e.thumbnail, enumerable: true });
  return p;
}

/**
 * Every catalog basemap, in catalog order (OpenStreetMap first), in the {@link BasemapPreset} shape.
 * @deprecated Read `basemapCatalog.BASEMAPS` (`@strata/map-controls/basemaps`). Kept so code that
 * imported the old 10-entry library keeps compiling; it is now the full keyless catalog.
 */
export const OPEN_BASEMAPS: BasemapPreset[] = catalog.BASEMAPS.map(presetFrom);

/** @deprecated The vector (GL style) subset of {@link OPEN_BASEMAPS}. Use `basemapCatalog`. */
export const VECTOR_BASEMAPS: BasemapPreset[] = OPEN_BASEMAPS.filter((p) => !!p.style);

/** @deprecated The raster subset of {@link OPEN_BASEMAPS}. Use `basemapCatalog`. */
export const RASTER_BASEMAPS: BasemapPreset[] = OPEN_BASEMAPS.filter((p) => !!p.templateUrl);

/**
 * URLs of the presets this package shipped before the shared catalog, keyed to their old ids — so a
 * saved basemap that kept the URL but not a known id still resolves through the aliases.
 */
const LEGACY_URL_IDS: Readonly<Record<string, string>> = Object.freeze({
  "https://tiles.openfreemap.org/styles/positron": "openfreemap-positron",
  "https://tiles.openfreemap.org/styles/dark": "openfreemap-dark",
  "https://tiles.openfreemap.org/styles/liberty": "openfreemap-liberty",
  "https://tiles.versatiles.org/assets/styles/colorful/style.json": "versatiles-colorful",
  "https://tiles.versatiles.org/assets/styles/eclipse/style.json": "versatiles-eclipse",
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json": "carto-positron-gl",
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json": "carto-voyager-gl",
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json": "carto-dark-gl",
});

/**
 * The catalog id for any basemap id — itself, its alias target (`openfreemap-positron` → `vt-gray`),
 * `"none"`, or `null` when the catalog does not know it (a custom basemap).
 */
export function resolveBasemapId(id: string | null | undefined): string | null {
  return catalog.resolveBasemapId(id);
}

/**
 * The catalog id a saved ESRI `BaseMap` draws: by its first layer's id (alias-aware), else by a URL
 * the catalog (or a pre-catalog preset) uses. `null` for a custom basemap the catalog does not know.
 */
export function baseMapCatalogId(bm: BaseMap | null | undefined): string | null {
  const first = bm?.baseMapLayers?.[0];
  if (!first) return null;
  const byId = catalog.resolveBasemapId(first.id);
  if (byId) return byId;
  const url = first.styleUrl ?? first.templateUrl;
  if (!url) return null;
  const legacy = LEGACY_URL_IDS[url];
  if (legacy) return catalog.resolveBasemapId(legacy);
  return catalog.BASEMAPS.find((b) => b.style === url || b.templateUrl === url)?.id ?? null;
}

/** The {@link BasemapPreset} for an id — alias-aware; `undefined` for an unknown id or `"none"`. */
export function basemapPresetById(id: string | null | undefined): BasemapPreset | undefined {
  const rid = catalog.resolveBasemapId(id);
  return rid ? OPEN_BASEMAPS.find((p) => p.id === rid) : undefined;
}

/** Build a genuine ESRI Web Map `BaseMap` from a preset (VectorTileLayer for `style`, else WebTiledLayer). */
export function baseMapFromPreset(p: BasemapPreset): BaseMap {
  return {
    title: p.title,
    baseMapLayers: [
      p.style
        ? { id: p.id, layerType: "VectorTileLayer", styleUrl: p.style, copyright: p.copyright }
        : { id: p.id, layerType: "WebTiledLayer", templateUrl: p.templateUrl, copyright: p.copyright },
    ],
  };
}

/** The ESRI `BaseMap` for a catalog id (alias-aware). `undefined` for an unknown id or `"none"`. */
export function baseMapFromId(id: string | null | undefined): BaseMap | undefined {
  const p = basemapPresetById(id);
  return p ? baseMapFromPreset(p) : undefined;
}

/** Every basemap URL, whichever form the preset takes — ONE place for a keyless guard to read. */
export const basemapUrl = (p: BasemapPreset): string | undefined => p.style ?? p.templateUrl;

/**
 * The default basemap for a new map: **OpenStreetMap** (`osm`, the catalog's light theme basemap).
 * Its dark half is `osm-dark` — the same tiles, inverted on the GPU — so a theme switch is a pair.
 */
export function defaultBaseMap(): BaseMap {
  return baseMapFromPreset(basemapForTheme("light"));
}

/**
 * Pick the basemap **from a given library** that pairs with a UI theme mode: the catalog's theme
 * basemap (`osm` / `osm-dark`) when the library has it, else a vector entry of that mode, else any
 * entry of that mode, else the first entry.
 *
 * This is the one resolver: `<StrataApp>`'s theme→basemap swap and the `BasemapPanel` both call it,
 * so the map that gets applied is the map the panel ticks.
 *
 * With no `mode` there is nothing to follow, so the library's first entry stands in.
 */
export function basemapForThemeFrom<T extends { id?: string; style?: string; mode?: "light" | "dark" }>(
  library: readonly T[],
  mode: "light" | "dark" | undefined,
): T | undefined {
  if (!mode) return library[0];
  const themed = catalog.basemapForTheme(mode);
  return (
    library.find((p) => p.id === themed) ??
    library.find((p) => p.mode === mode && p.style) ??
    library.find((p) => p.mode === mode) ??
    library[0]
  );
}

/**
 * The basemap preset that pairs with a UI theme mode: `osm` (light) / `osm-dark` (dark), from the
 * catalog's `THEME_BASEMAP`. Used by `/create-map` / `/new-app` so a generated app's map matches its
 * theme on the first build, and by the runtime swap when the app names no pair of its own.
 */
export function basemapForTheme(mode: "light" | "dark"): BasemapPreset {
  return basemapPresetById(catalog.basemapForTheme(mode)) ?? OPEN_BASEMAPS[0];
}

/**
 * The default **vector** basemap for a theme mode (a `VectorTileLayer` BaseMap): OSM Gray / OSM Gray
 * Dark (VersaTiles) — keyless GL styles, and what the retired Positron/Dark Matter ids alias to.
 */
export function defaultVectorBaseMap(mode: "light" | "dark" = "light"): BaseMap {
  const want = mode === "dark" ? "vt-gray-dark" : "vt-gray";
  const p =
    VECTOR_BASEMAPS.find((v) => v.id === want) ??
    VECTOR_BASEMAPS.find((v) => v.mode === mode) ??
    VECTOR_BASEMAPS[0];
  return baseMapFromPreset(p);
}

/**
 * Namespace a fetched GL style's sources and layers under a prefix so they can be inserted below the
 * operational layers and later removed cleanly. Pure and testable — the async fetch/mutation lives in
 * {@link applyBaseMap}. Layer `source` references are rewritten to the namespaced source ids.
 */
export function prepareVectorBasemap(
  styleJson: any,
  prefix = "basemap:"
): { sources: Record<string, any>; layers: any[]; glyphs?: string; sprite?: string } {
  const sources: Record<string, any> = {};
  const idMap: Record<string, string> = {};
  for (const [id, src] of Object.entries(styleJson?.sources || {})) {
    const nid = `${prefix}${id}`;
    sources[nid] = src;
    idMap[id] = nid;
  }
  const layers = (styleJson?.layers || []).map((l: any) => {
    const copy = { ...l, id: `${prefix}${l.id}` };
    if (copy.source && idMap[copy.source]) copy.source = idMap[copy.source];
    return copy;
  });
  return { sources, layers, glyphs: styleJson?.glyphs, sprite: styleJson?.sprite };
}

/** Remove any previously-applied `basemap:` sources/layers from the live map. */
function clearBasemap(map: any): void {
  const style = map.getStyle?.();
  (style?.layers || [])
    .filter((l: any) => l.id.startsWith("basemap:"))
    .forEach((l: any) => map.getLayer(l.id) && map.removeLayer(l.id));
  Object.keys(style?.sources || {})
    .filter((s) => s.startsWith("basemap:"))
    .forEach((s) => map.getSource(s) && map.removeSource(s));
}

/** The id of the first operational (`lyr:*`) layer, so a basemap inserts beneath it. */
function firstOperationalLayerId(map: any): string | undefined {
  return (map.getStyle?.().layers || []).find((l: any) => l.id.startsWith("lyr:"))?.id;
}

/**
 * Which basemap application is the current one, per map. A vector basemap loads asynchronously while
 * `clearBasemap` has already run synchronously, so a fast light↔dark toggle can let the *previous*
 * style's fetch resolve last and inject its layers over the new one. Every {@link applyBaseMap} takes
 * the next epoch; a load whose epoch is stale by the time it resolves is dropped.
 */
const basemapEpochs = new WeakMap<object, number>();

/**
 * Fetch a GL style URL and inject its sources + layers below the operational layers. Glyphs/sprite are
 * adopted from the basemap style when the current style lacks them (guarded — older MapLibre lacks the
 * setters). Fire-and-forget from {@link applyBaseMap}, so it rechecks `epoch` after every await.
 */
async function loadVectorBasemap(map: any, url: string, epoch: number): Promise<void> {
  const isCurrent = (): boolean => basemapEpochs.get(map) === epoch;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`basemap style fetch failed: ${res.status}`);
  const styleJson = await res.json();
  if (!isCurrent()) return; // a newer basemap won while this one was in flight
  const { sources, layers, glyphs, sprite } = prepareVectorBasemap(styleJson);

  const current = map.getStyle?.() || {};
  if (glyphs && !current.glyphs && typeof map.setGlyphs === "function") {
    try {
      map.setGlyphs(glyphs);
    } catch {
      /* older MapLibre — labels fall back to whatever glyphs the map already has */
    }
  }
  if (sprite && !current.sprite && typeof map.setSprite === "function") {
    try {
      map.setSprite(sprite);
    } catch {
      /* sprite is optional; icons degrade gracefully */
    }
  }

  for (const [id, src] of Object.entries(sources)) {
    if (!map.getSource(id)) map.addSource(id, src);
  }
  const beforeId = firstOperationalLayerId(map);
  for (const layer of layers) {
    if (!map.getLayer(layer.id)) map.addLayer(layer, beforeId);
  }
}

/**
 * Apply a basemap beneath the operational layers. The first `baseMapLayers[]` entry is resolved
 * through the catalog first — by id (alias-aware, so a retired id still renders as its survivor) or
 * by a known URL — and drawn from the CATALOG entry (its raster paint, reference overlay and native
 * max zoom included). A basemap the catalog does not know (a custom tile or style URL) is drawn from
 * its own URL. `"none"` clears the ground. Every URL passes through `catalog.resolveUrl`.
 */
export function applyBaseMap(map: any, baseMap: BaseMap): void {
  // Claim this application before anything async can start, so an in-flight vector load from the
  // previous basemap knows it has been superseded.
  const epoch = (basemapEpochs.get(map) ?? 0) + 1;
  basemapEpochs.set(map, epoch);
  clearBasemap(map);

  const first = (baseMap.baseMapLayers || [])[0];
  if (!first) return;
  const rid = baseMapCatalogId(baseMap);
  if (rid === catalog.BASEMAP_NONE) return; // a blank ground is a real choice
  const entry = rid ? catalog.basemapById(rid) : null;
  const url = (u: string): string => catalog.resolveUrl(u);
  const xyz = (u: string): string => catalog.toXyz(url(u));
  const beforeId = firstOperationalLayerId(map);

  if (entry) {
    const srcId = `basemap:${entry.id}`;
    if (entry.style) {
      void loadVectorBasemap(map, url(entry.style), epoch).catch((err) => {
        // eslint-disable-next-line no-console
        console.warn(`[strata] vector basemap '${entry.id}' failed to load:`, err);
      });
      return;
    }
    const mz = entry.maxZoom ? { maxzoom: entry.maxZoom } : {};
    map.addSource(srcId, { type: "raster", tiles: [xyz(entry.templateUrl as string)], tileSize: 256, attribution: entry.copyright || "", ...mz });
    map.addLayer({ id: `${srcId}:raster`, type: "raster", source: srcId, ...(entry.paint ? { paint: { ...entry.paint } } : {}) }, beforeId);
    if (entry.overlay) {
      map.addSource(`${srcId}:overlay`, { type: "raster", tiles: [xyz(entry.overlay)], tileSize: 256, attribution: entry.copyright || "", ...mz });
      map.addLayer({ id: `${srcId}:overlay:raster`, type: "raster", source: `${srcId}:overlay` }, beforeId);
    }
    return;
  }

  const srcId = `basemap:${first.id}`;
  if (first.layerType === "WebTiledLayer" && first.templateUrl) {
    map.addSource(srcId, { type: "raster", tiles: [xyz(first.templateUrl)], tileSize: 256, attribution: first.copyright || "" });
    map.addLayer({ id: `${srcId}:raster`, type: "raster", source: srcId }, beforeId);
    return;
  }

  if (first.layerType === "VectorTileLayer" && (first.styleUrl || first.templateUrl)) {
    const styleUrl = url((first.styleUrl || first.templateUrl) as string);
    // Async: fetch the GL style and inject it. Errors are swallowed so a bad basemap never breaks the map.
    void loadVectorBasemap(map, styleUrl, epoch).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn(`[strata] vector basemap '${first.id}' failed to load:`, err);
    });
  }
}
