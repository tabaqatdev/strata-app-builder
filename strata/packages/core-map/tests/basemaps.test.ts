import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { BaseMap } from "@strata/schema";
import * as basemapCatalog from "@strata/map-controls/basemaps";
import {
  OPEN_BASEMAPS,
  VECTOR_BASEMAPS,
  RASTER_BASEMAPS,
  basemapUrl,
  defaultBaseMap,
  defaultVectorBaseMap,
  basemapForTheme,
  basemapForThemeFrom,
  baseMapFromPreset,
  prepareVectorBasemap,
  applyBaseMap,
  resolveBasemapId,
  basemapPresetById,
  baseMapFromId,
  baseMapCatalogId,
} from "../src/engine/basemaps.js";

/** A minimal MapLibre-like stub recording source/layer mutations. */
function fakeMap(initialLayers: Array<{ id: string }> = []) {
  const sources: Record<string, any> = {};
  let layers: Array<{ id: string; [k: string]: any }> = [...initialLayers];
  const calls = { addLayer: [] as any[], setGlyphs: [] as any[], setSprite: [] as any[] };
  return {
    _sources: sources,
    _layers: () => layers,
    _calls: calls,
    getStyle: () => ({ sources, layers }),
    getSource: (id: string) => sources[id],
    getLayer: (id: string) => layers.find((l) => l.id === id),
    addSource: (id: string, src: any) => {
      sources[id] = src;
    },
    addLayer: (layer: any, beforeId?: string) => {
      calls.addLayer.push({ layer, beforeId });
      const idx = beforeId ? layers.findIndex((l) => l.id === beforeId) : -1;
      if (idx >= 0) layers.splice(idx, 0, layer);
      else layers.push(layer);
    },
    removeLayer: (id: string) => {
      layers = layers.filter((l) => l.id !== id);
    },
    removeSource: (id: string) => {
      delete sources[id];
    },
    setGlyphs: (g: string) => calls.setGlyphs.push(g),
    setSprite: (s: string) => calls.setSprite.push(s),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("basemap gallery (the compatibility shim over @strata/map-controls)", () => {
  it("defaults to OpenStreetMap — osm / osm-dark is the theme pair", () => {
    // Until 2026-10-08 the default was OpenFreeMap Positron (a GL style) and OPEN_BASEMAPS was a
    // 10-entry vector-first library. There is ONE catalog now — `@strata/map-controls` — and its
    // theme pair is OpenStreetMap / OpenStreetMap Dark (the same tiles, inverted on the GPU).
    expect(defaultBaseMap().baseMapLayers[0]).toMatchObject({ id: "osm", layerType: "WebTiledLayer" });
    expect(OPEN_BASEMAPS[0].id).toBe("osm");
    expect(basemapForTheme("light").id).toBe("osm");
    expect(basemapForTheme("dark").id).toBe("osm-dark");
    expect(basemapForTheme("dark").mode).toBe("dark");
  });

  it("OPEN_BASEMAPS is the whole catalog, in catalog order, split into vector + raster", () => {
    expect(OPEN_BASEMAPS.map((p) => p.id)).toEqual(basemapCatalog.BASEMAPS.map((b) => b.id));
    expect(OPEN_BASEMAPS.length).toBe(33);
    expect([...VECTOR_BASEMAPS, ...RASTER_BASEMAPS].map((p) => p.id).sort()).toEqual(OPEN_BASEMAPS.map((p) => p.id).sort());
    // every preset resolves to exactly one keyless https URL, in whichever form it takes
    for (const p of OPEN_BASEMAPS) {
      const url = basemapUrl(p);
      expect(url).toMatch(/^https:\/\//);
      expect(Boolean(p.style) !== Boolean(p.templateUrl)).toBe(true); // one form, never both/neither
    }
  });

  it("names no host that is gated, watermarked or keyed — every URL is on the catalog's allow-list", () => {
    // A URL-pattern guard cannot see a keyed basemap; this is the offline half (allow-list + a
    // DENY-list of hosts already caught serving a watermark at HTTP 200). The behavioural half — two
    // different tiles must differ in bytes; a style must parse and every host it delegates to must
    // itself be keyless — is `pnpm --filter @strata/map-controls verify:basemaps`.
    for (const p of OPEN_BASEMAPS) {
      for (const u of [basemapUrl(p), p.overlay].filter(Boolean) as string[]) {
        expect(u).toMatch(basemapCatalog.BASEMAP_HOSTS);
        expect(u).not.toMatch(basemapCatalog.BASEMAP_DENY);
        expect(u).not.toMatch(/basemaps\.cartocdn\.com\/(light_all|dark_all|rastertiles)/i); // 200 + "API KEY REQUIRED"
        expect(u).not.toMatch(/openfreemap|maps\.wikimedia\.org|mapbox|googleapis|maptiler|stadiamaps|[?&](api_?key|access_token|token|key)=/i);
      }
    }
  });

  it("every preset carries attribution, a licence tag and declares the theme half it serves", () => {
    for (const p of OPEN_BASEMAPS) {
      expect(p.copyright && p.copyright.length).toBeGreaterThan(4);
      expect(["commercial-ok", "non-commercial"]).toContain(p.license);
      expect(["light", "dark"]).toContain(p.mode);
    }
    // the OpenStreetMap entries credit OSM, as the licence requires
    for (const p of OPEN_BASEMAPS.filter((x) => x.group === "OpenStreetMap")) expect(p.copyright).toMatch(/OpenStreetMap/i);
    // both halves of a theme pair exist, or "follow the theme" has nothing to resolve to
    expect(VECTOR_BASEMAPS.some((p) => p.mode === "light")).toBe(true);
    expect(VECTOR_BASEMAPS.some((p) => p.mode === "dark")).toBe(true);
  });

  it("a raster preset uses the ESRI Web Map tokens; a vector preset never does", () => {
    for (const p of RASTER_BASEMAPS) {
      expect(p.templateUrl).toContain("{level}");
      expect(p.templateUrl).toContain("{col}");
      expect(p.templateUrl).toContain("{row}");
    }
    for (const p of VECTOR_BASEMAPS) expect(p.style).not.toMatch(/\{level\}|\{z\}/);
  });

  it("baseMapFromPreset builds the right ESRI layer type", () => {
    const vec = baseMapFromPreset(VECTOR_BASEMAPS[0]);
    expect(vec.baseMapLayers[0]).toMatchObject({ layerType: "VectorTileLayer", styleUrl: VECTOR_BASEMAPS[0].style });
    const ras = baseMapFromPreset(RASTER_BASEMAPS[0]);
    expect(ras.baseMapLayers[0]).toMatchObject({ layerType: "WebTiledLayer", templateUrl: RASTER_BASEMAPS[0].templateUrl });
  });

  it("defaultVectorBaseMap gives a keyless GL style for each theme half", () => {
    expect(defaultVectorBaseMap("light").baseMapLayers[0]).toMatchObject({ id: "vt-gray", layerType: "VectorTileLayer" });
    expect(defaultVectorBaseMap("dark").baseMapLayers[0]).toMatchObject({ id: "vt-gray-dark", layerType: "VectorTileLayer" });
  });

  it("basemapForThemeFrom is the ONE resolver — the panel ticks the map that gets applied", () => {
    expect(basemapForThemeFrom(OPEN_BASEMAPS, "dark")).toBe(basemapForTheme("dark"));
    expect(basemapForThemeFrom(OPEN_BASEMAPS, "light")).toBe(basemapForTheme("light"));
  });

  it("basemapForThemeFrom resolves against an app's own basemap library", () => {
    const library = [
      { id: "house-light", title: "House light", templateUrl: "https://t/{z}/{x}/{y}.png", mode: "light" as const },
      { id: "house-dark", title: "House dark", templateUrl: "https://t/d/{z}/{x}/{y}.png", mode: "dark" as const },
    ];
    expect(basemapForThemeFrom(library, "dark")?.id).toBe("house-dark");
    // No mode to follow, and no entry of that mode: the library's first entry stands in rather than
    // the panel ticking nothing.
    expect(basemapForThemeFrom(library, undefined)?.id).toBe("house-light");
    expect(basemapForThemeFrom([library[0]], "dark")?.id).toBe("house-light");
    expect(basemapForThemeFrom([], "dark")).toBeUndefined();
  });
});

describe("legacy basemap ids resolve through the catalog's aliases", () => {
  const LEGACY: Record<string, string> = {
    "openfreemap-positron": "vt-gray",
    "openfreemap-dark": "osm-dark",
    "openfreemap-liberty": "osm",
    "ofm-positron": "vt-gray",
    "ofm-dark": "osm-dark",
    "versatiles-colorful": "vt-colorful",
    "versatiles-eclipse": "vt-colorful-dark",
    "carto-positron-gl": "vt-gray",
    "carto-voyager-gl": "vt-colorful",
    "carto-dark-gl": "vt-gray-dark",
    osm: "osm",
    opentopomap: "opentopomap",
  };

  it("every id the old library (and the starter maps) shipped names a surviving entry", () => {
    for (const [old, now] of Object.entries(LEGACY)) {
      expect(resolveBasemapId(old)).toBe(now);
      expect(basemapPresetById(old)?.id).toBe(now);
      expect(baseMapFromId(old)?.baseMapLayers[0].id).toBe(now);
    }
    expect(resolveBasemapId("none")).toBe("none");
    expect(resolveBasemapId("my-house-tiles")).toBeNull(); // a custom basemap is not guessed at
  });

  it("a saved basemap that kept only an old URL still resolves", () => {
    const saved: BaseMap = {
      title: "OpenFreeMap Positron",
      baseMapLayers: [{ id: "my-ground", layerType: "VectorTileLayer", styleUrl: "https://tiles.openfreemap.org/styles/positron" }],
    };
    expect(baseMapCatalogId(saved)).toBe("vt-gray");
  });

  it("renders a layers.json that names a retired id — as the entry its alias names", async () => {
    const vtGray = basemapCatalog.basemapById("vt-gray")!.style!;
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ sources: { s: { type: "vector" } }, layers: [{ id: "bg", type: "background" }] }) });
    vi.stubGlobal("fetch", fetchSpy);
    const map = fakeMap([{ id: "lyr:cities" }]);
    applyBaseMap(map, {
      title: "OpenFreeMap Positron",
      baseMapLayers: [{ id: "openfreemap-positron", layerType: "VectorTileLayer", styleUrl: "https://tiles.openfreemap.org/styles/positron" }],
    });
    await new Promise((r) => setTimeout(r, 0));
    // the catalog's keyless style, never the retired (deny-listed) host
    expect(fetchSpy).toHaveBeenCalledWith(vtGray);
    expect(map._layers().some((l) => l.id === "basemap:bg")).toBe(true);
  });

  it("every starter map in WebMaps/ resolves to a catalog basemap", () => {
    const dir = fileURLToPath(new URL("../../../../WebMaps/", import.meta.url));
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const spec = JSON.parse(readFileSync(join(dir, f), "utf8"));
      const id = baseMapCatalogId(spec.baseMap);
      expect(id, `${f}: ${spec.baseMap?.baseMapLayers?.[0]?.id}`).not.toBeNull();
      expect(basemapCatalog.basemapById(id)).toBeTruthy();
    }
  });

  it("every starter map in WebMaps/ opens on the catalog's osm, authored exactly as baseMapFromId would", () => {
    const dir = fileURLToPath(new URL("../../../../WebMaps/", import.meta.url));
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      const spec = JSON.parse(readFileSync(join(dir, f), "utf8"));
      // A current catalog id, not a retired alias — and the same ESRI JSON the shim writes, so it round-trips.
      expect(spec.baseMap, f).toEqual(baseMapFromId("osm"));
      expect(spec["strata:basemaps"], `${f}: no per-map basemap library`).toBeUndefined();
    }
  });
});

describe("prepareVectorBasemap", () => {
  it("namespaces sources/layers and rewrites source references", () => {
    const style = {
      glyphs: "https://g/{fontstack}/{range}.pbf",
      sprite: "https://s/sprite",
      sources: { osm: { type: "vector", url: "https://t/tiles.json" } },
      layers: [
        { id: "bg", type: "background" },
        { id: "roads", type: "line", source: "osm", "source-layer": "transportation" },
      ],
    };
    const out = prepareVectorBasemap(style);
    expect(Object.keys(out.sources)).toEqual(["basemap:osm"]);
    expect(out.layers.map((l) => l.id)).toEqual(["basemap:bg", "basemap:roads"]);
    expect(out.layers[1].source).toBe("basemap:osm"); // reference rewritten
    expect(out.glyphs).toBe(style.glyphs);
    expect(out.sprite).toBe(style.sprite);
  });
});

describe("applyBaseMap", () => {
  it("raster: adds a raster source + layer beneath the first operational layer", () => {
    const map = fakeMap([{ id: "lyr:cities" }]);
    applyBaseMap(map, defaultBaseMap()); // the default — raster OpenStreetMap
    expect(map._sources["basemap:osm"]).toMatchObject({ type: "raster", tileSize: 256 });
    expect(map._sources["basemap:osm"].tiles[0]).toBe("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
    const call = map._calls.addLayer[0];
    expect(call.layer).toMatchObject({ id: "basemap:osm:raster", type: "raster" });
    expect(call.beforeId).toBe("lyr:cities"); // inserted below operational
  });

  it("removes a previous basemap before applying a new one", () => {
    const map = fakeMap([{ id: "lyr:cities" }]);
    applyBaseMap(map, baseMapFromId("osm")!);                       // osm raster
    applyBaseMap(map, baseMapFromId("opentopomap")!);               // opentopomap raster
    expect(map._sources["basemap:osm"]).toBeUndefined();
    expect(map._sources["basemap:opentopomap"]).toBeTruthy();
  });

  it("vector: fetches the GL style and injects namespaced layers below operational layers", async () => {
    const styleJson = {
      glyphs: "https://g/{fontstack}/{range}.pbf",
      sources: { carto: { type: "vector", url: "https://t/tiles.json" } },
      layers: [{ id: "water", type: "fill", source: "carto", "source-layer": "water" }],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => styleJson })
    );
    const map = fakeMap([{ id: "lyr:cities" }]);
    applyBaseMap(map, defaultVectorBaseMap("dark"));
    // let the fire-and-forget promise settle
    await new Promise((r) => setTimeout(r, 0));

    expect(map._sources["basemap:carto"]).toMatchObject({ type: "vector" });
    expect(map._calls.setGlyphs[0]).toBe(styleJson.glyphs);
    const injected = map._calls.addLayer.find((c) => c.layer.id === "basemap:water");
    expect(injected).toBeTruthy();
    expect(injected.beforeId).toBe("lyr:cities");
  });

  it("drops a vector style that lost the race — a fast theme flip cannot resurrect the old basemap", async () => {
    // `clearBasemap` is synchronous but the style fetch is not, so a light↔dark flip could let the
    // superseded style resolve last and paint itself over the basemap that won.
    const loser = { sources: { old: { type: "vector" } }, layers: [{ id: "old", type: "fill", source: "old" }] };
    const winner = { sources: { new: { type: "vector" } }, layers: [{ id: "new", type: "fill", source: "new" }] };
    let releaseLoser: (v: unknown) => void = () => {};
    const loserJson = new Promise((r) => {
      releaseLoser = r;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: () => (String(url).includes("dark") ? loserJson : Promise.resolve(winner)),
        }),
      ),
    );

    const map = fakeMap([{ id: "lyr:cities" }]);
    applyBaseMap(map, defaultVectorBaseMap("dark")); // in flight…
    applyBaseMap(map, defaultVectorBaseMap("light")); // …superseded here
    await new Promise((r) => setTimeout(r, 0));
    releaseLoser(loser); // the loser resolves last
    await new Promise((r) => setTimeout(r, 0));

    expect(map._sources["basemap:new"]).toBeTruthy();
    expect(map._sources["basemap:old"]).toBeUndefined();
    expect(map._layers().some((l) => l.id === "basemap:old")).toBe(false);
  });

  it("draws a catalog entry's raster paint (OpenStreetMap Dark = the same tiles, inverted) and native max zoom", () => {
    const map = fakeMap([{ id: "lyr:cities" }]);
    applyBaseMap(map, baseMapFromId("osm-dark")!);
    expect(map._sources["basemap:osm-dark"]).toMatchObject({ type: "raster", maxzoom: 19 });
    const call = map._calls.addLayer.find((c) => c.layer.id === "basemap:osm-dark:raster");
    expect(call.layer.paint).toMatchObject({ "raster-brightness-min": 1, "raster-hue-rotate": 180 });
  });

  it("draws a hybrid's reference overlay ABOVE its base, both beneath the operational layers", () => {
    const map = fakeMap([{ id: "lyr:cities" }]);
    applyBaseMap(map, baseMapFromId("esri-imagery-hybrid")!);
    const ids = map._layers().map((l) => l.id);
    expect(ids).toEqual(["basemap:esri-imagery-hybrid:raster", "basemap:esri-imagery-hybrid:overlay:raster", "lyr:cities"]);
    // Esri's /tile/{level}/{row}/{col} becomes /tile/{z}/{y}/{x}
    expect(map._sources["basemap:esri-imagery-hybrid"].tiles[0]).toMatch(/\/tile\/\{z\}\/\{y\}\/\{x\}$/);
  });

  it("routes every URL through the catalog's resolveUrl (the tile-proxy hook)", () => {
    basemapCatalog.setUrlRewrite({ "tile.openstreetmap.org": "https://tiles.example.com/osm" });
    try {
      const map = fakeMap([]);
      applyBaseMap(map, defaultBaseMap());
      expect(map._sources["basemap:osm"].tiles[0]).toBe("https://tiles.example.com/osm/{z}/{x}/{y}.png");
    } finally {
      basemapCatalog.setUrlRewrite(null);
    }
  });

  it("'none' is a blank ground; an unknown (custom) basemap is drawn from its own URL", () => {
    const map = fakeMap([]);
    applyBaseMap(map, { title: "None", baseMapLayers: [{ id: "none", layerType: "WebTiledLayer" }] });
    expect(Object.keys(map._sources)).toEqual([]);
    applyBaseMap(map, { title: "House", baseMapLayers: [{ id: "house", layerType: "WebTiledLayer", templateUrl: "https://house/{level}/{col}/{row}.png" }] });
    expect(map._sources["basemap:house"].tiles[0]).toBe("https://house/{z}/{x}/{y}.png");
  });
});
