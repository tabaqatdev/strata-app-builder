/**
 * basemaps — apply a `baseMap.baseMapLayers[]` to the MapLibre style (raster/vector below operational
 * layers). Both `WebTiledLayer` (raster XYZ) and `VectorTileLayer` (a keyless GL style URL) are supported.
 */
import type { BaseMap } from "@strata/schema";

/** A selectable open basemap (raster XYZ `templateUrl`, or a vector `style` URL). */
export interface BasemapPreset {
  id: string;
  title: string;
  /** Raster XYZ template using ESRI Web Map tokens `{level}/{col}/{row}`. */
  templateUrl?: string;
  /** Vector-tile GL style JSON URL. */
  style?: string;
  /** Which UI theme this basemap pairs with (dark map ↔ dark UI). Drives {@link basemapForTheme}. */
  mode?: "light" | "dark";
  copyright?: string;
}

/**
 * Curated **vector** basemaps — keyless GL style URLs (OpenFreeMap · Versatiles · CARTO GL), all
 * OSM-derived and openly licensed. Crisp at every zoom and theme-aware. No proprietary/API-keyed
 * provider ever appears here.
 *
 * ⚠ **A "keyless" host can stop being one without any URL here changing**, and it will not announce
 * it. CARTO's RASTER CDN (`basemaps.cartocdn.com/{light_all,dark_all,rastertiles}`) did exactly that:
 * it answers HTTP 200 with `image/png` of the real map, with *"API KEY REQUIRED ·
 * carto.com/basemaps/apikey"* composited diagonally across every tile. It passed a host check, a
 * `!key=` check and an `img.naturalWidth > 1` check; only a screenshot caught it. Those three raster
 * presets are gone. `tile.openstreetmap.org` fails the same way for a different reason — 200 with a
 * fixed *"418 · Access blocked"* image for a client outside the OSMF tile-usage policy — so it is
 * offered but is no longer the default.
 *
 * The CARTO **GL styles** below are a different product from that raster CDN and were re-verified
 * keyless on 2026-09-01 (style JSON, vector tiles, glyphs and sprite). They are kept, and demoted
 * below OpenFreeMap. The guard that watches all of this is behavioural, not textual — see
 * `tests/basemaps.test.ts`.
 */
export const VECTOR_BASEMAPS: BasemapPreset[] = [
  {
    id: "openfreemap-positron",
    title: "OpenFreeMap Positron",
    style: "https://tiles.openfreemap.org/styles/positron",
    mode: "light",
    copyright: "© OpenStreetMap contributors · OpenFreeMap",
  },
  {
    id: "openfreemap-dark",
    title: "OpenFreeMap Dark",
    style: "https://tiles.openfreemap.org/styles/dark",
    mode: "dark",
    copyright: "© OpenStreetMap contributors · OpenFreeMap",
  },
  {
    id: "openfreemap-liberty",
    title: "OpenFreeMap Liberty",
    style: "https://tiles.openfreemap.org/styles/liberty",
    mode: "light",
    copyright: "© OpenStreetMap contributors · OpenFreeMap",
  },
  {
    id: "versatiles-colorful",
    title: "Versatiles Colorful",
    style: "https://tiles.versatiles.org/assets/styles/colorful/style.json",
    mode: "light",
    copyright: "© OpenStreetMap contributors · Versatiles",
  },
  {
    id: "versatiles-eclipse",
    title: "Versatiles Eclipse (dark)",
    style: "https://tiles.versatiles.org/assets/styles/eclipse/style.json",
    mode: "dark",
    copyright: "© OpenStreetMap contributors · Versatiles",
  },
  {
    id: "carto-positron-gl",
    title: "CARTO Positron (vector)",
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    mode: "light",
    copyright: "© OpenStreetMap contributors © CARTO",
  },
  {
    id: "carto-voyager-gl",
    title: "CARTO Voyager (vector)",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    mode: "light",
    copyright: "© OpenStreetMap contributors © CARTO",
  },
  {
    id: "carto-dark-gl",
    title: "CARTO Dark Matter (vector)",
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    mode: "dark",
    copyright: "© OpenStreetMap contributors © CARTO",
  },
];

/**
 * Curated **raster** basemaps — keyless XYZ tile templates, OSM-derived. Offered, never defaulted to:
 * both entries here are volunteer-run or community-run services whose usage policy a product must
 * respect, and a raster ground has no dark half (see the note on {@link VECTOR_BASEMAPS}).
 * `tile.openstreetmap.org` in particular serves a *"418 · Access blocked"* image at HTTP 200 to a
 * client it judges outside that policy, so **probe it the way the app will call it** — a browser
 * user-agent with a referer — or a working host is disqualified by a bare `curl`.
 */
export const RASTER_BASEMAPS: BasemapPreset[] = [
  {
    id: "osm",
    title: "OpenStreetMap",
    templateUrl: "https://tile.openstreetmap.org/{level}/{col}/{row}.png",
    mode: "light",
    copyright: "© OpenStreetMap contributors",
  },
  {
    id: "opentopomap",
    title: "OpenTopoMap",
    templateUrl: "https://tile.opentopomap.org/{level}/{col}/{row}.png",
    mode: "light",
    copyright: "© OpenStreetMap contributors, SRTM · © OpenTopoMap (CC-BY-SA)",
  },
];

/**
 * Default basemaps — **open-source only, OpenStreetMap data first.** Every entry is OSM-derived /
 * openly licensed and keyless; no proprietary or API-keyed provider is ever a default. These populate
 * the `BasemapPanel` and back {@link defaultBaseMap}.
 *
 * **Vector presets come first, and the first of them is the default.** Until 2026-09-01 a raster
 * preset led and `defaultBaseMap()` returned `tile.openstreetmap.org`; both of the raster hosts that
 * led have since started serving a placeholder at HTTP 200 (see {@link VECTOR_BASEMAPS}). A GL style
 * is also the only form that gives a theme a real *dark* ground rather than a light one dimmed.
 * Respect each provider's tile-usage policy — self-host for heavy production traffic
 * (see `docs/how-to/cors-and-proxy.md`).
 */
export const OPEN_BASEMAPS: BasemapPreset[] = [...VECTOR_BASEMAPS, ...RASTER_BASEMAPS];

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

/** Every basemap URL, whichever form the preset takes — ONE place for a keyless guard to read. */
export const basemapUrl = (p: BasemapPreset): string | undefined => p.style ?? p.templateUrl;

/**
 * The default basemap for a new map: **OpenFreeMap Positron** — a keyless GL style, OSM data,
 * keyless end to end (style JSON, vector tiles, natural-earth underlay, glyphs and sprite).
 *
 * It used to be raster OpenStreetMap. That host now answers HTTP 200 with an *"Access blocked"*
 * image to a client outside its usage policy, so the old default could hand a new map a placeholder
 * that every URL-shaped check called healthy.
 */
export function defaultBaseMap(): BaseMap {
  return baseMapFromPreset(OPEN_BASEMAPS[0]);
}

/**
 * Pick the basemap **from a given library** that pairs with a UI theme mode. Prefers a vector entry
 * of the matching mode (crisp, theme-coherent), then any entry of that mode, then the first entry.
 *
 * This is the one resolver: `<StrataApp>`'s theme→basemap swap, the `MapChrome` basemap drawer, and
 * the `BasemapPanel` all call it, so the map that gets applied is the map the drawer ticks. They used
 * to answer differently — the panels took the first entry of the mode (raster OSM) while
 * {@link basemapForTheme} preferred the vector one — which ticked one basemap and drew another.
 *
 * With no `mode` there is nothing to follow, so the library's first entry stands in.
 */
export function basemapForThemeFrom<T extends { style?: string; mode?: "light" | "dark" }>(
  library: readonly T[],
  mode: "light" | "dark" | undefined,
): T | undefined {
  if (!mode) return library[0];
  return (
    library.find((p) => p.mode === mode && p.style) ??
    library.find((p) => p.mode === mode) ??
    library[0]
  );
}

/**
 * Pick a basemap preset that pairs with a UI theme mode (dark map ↔ dark UI), from the built-in open
 * library. Used by `/create-map` / `/new-app` so a generated app's map matches its theme on the first
 * build, and by the runtime swap when the app has no basemap library of its own.
 */
export function basemapForTheme(mode: "light" | "dark"): BasemapPreset {
  return basemapForThemeFrom(OPEN_BASEMAPS, mode) ?? OPEN_BASEMAPS[0];
}

/** The default **vector** basemap for a theme mode (a `VectorTileLayer` BaseMap). */
export function defaultVectorBaseMap(mode: "light" | "dark" = "light"): BaseMap {
  return baseMapFromPreset(basemapForTheme(mode));
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

export function applyBaseMap(map: any, baseMap: BaseMap): void {
  // Claim this application before anything async can start, so an in-flight vector load from the
  // previous basemap knows it has been superseded.
  const epoch = (basemapEpochs.get(map) ?? 0) + 1;
  basemapEpochs.set(map, epoch);
  clearBasemap(map);

  const first = (baseMap.baseMapLayers || [])[0];
  if (!first) return;
  const srcId = `basemap:${first.id}`;

  if (first.layerType === "WebTiledLayer" && first.templateUrl) {
    const tiles = [
      first.templateUrl.replace("{level}", "{z}").replace("{col}", "{x}").replace("{row}", "{y}"),
    ];
    map.addSource(srcId, { type: "raster", tiles, tileSize: 256, attribution: first.copyright || "" });
    map.addLayer({ id: `${srcId}:raster`, type: "raster", source: srcId }, firstOperationalLayerId(map));
    return;
  }

  if (first.layerType === "VectorTileLayer" && (first.styleUrl || first.templateUrl)) {
    const url = (first.styleUrl || first.templateUrl) as string;
    // Async: fetch the GL style and inject it. Errors are swallowed so a bad basemap never breaks the map.
    void loadVectorBasemap(map, url, epoch).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn(`[strata] vector basemap '${first.id}' failed to load:`, err);
    });
  }
}
