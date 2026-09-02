import { describe, it, expect, vi, afterEach } from "vitest";
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

describe("basemap gallery", () => {
  it("defaults to the keyless VECTOR pair, with the raster gallery behind it", () => {
    // Until 2026-09-01 this asserted `OPEN_BASEMAPS[0].id === "osm"` and a WebTiledLayer default.
    // Both raster hosts that used to lead now answer HTTP 200 with a placeholder — CARTO's raster
    // CDN composites "API KEY REQUIRED" over the real map, tile.openstreetmap.org serves an
    // "Access blocked" image — so a new map's default ground is a GL style, which is also the only
    // form that gives a dark theme a real dark ground rather than a light one dimmed.
    expect(OPEN_BASEMAPS[0].id).toBe("openfreemap-positron");
    expect(defaultBaseMap().baseMapLayers[0].layerType).toBe("VectorTileLayer");
    expect(OPEN_BASEMAPS[0]).toBe(VECTOR_BASEMAPS[0]);
    // every preset resolves to exactly one keyless https URL, in whichever form it takes
    for (const p of OPEN_BASEMAPS) {
      const url = basemapUrl(p);
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/apikey|access_token|key=/i);
      expect(Boolean(p.style) !== Boolean(p.templateUrl)).toBe(true); // one form, never both/neither
    }
    // the vector gallery leads, the raster one follows, and nothing is lost between them
    expect(OPEN_BASEMAPS).toEqual([...VECTOR_BASEMAPS, ...RASTER_BASEMAPS]);
    expect(OPEN_BASEMAPS.some((p) => p.id === "carto-dark-gl")).toBe(true);
  });

  it("names no host that is gated, watermarked, or off an English-only language boundary", () => {
    // A URL-pattern guard cannot see a keyed basemap — this is a DENY-list of hosts already caught
    // doing it, so a preset can never quietly come back. The positive proof that a host is still
    // keyless is behavioural and lives in the live suites (two different tiles must differ in
    // bytes; a style must parse and every host it delegates to must itself be keyless), because
    // only bytes and a human eye can see a watermark composited onto real map data.
    const GATED = [
      /basemaps\.cartocdn\.com\/(light_all|dark_all|rastertiles)/i, // 200 + "API KEY REQUIRED"
      /^https:\/\/tile\.openstreetmap\.org/i,                       // 200 + "418 Access blocked"
      /maps\.wikimedia\.org/i,                                       // 403 to any other origin
      /tile\.openstreetmap\.de/i,                                    // keyless, but German exonyms
      /mapbox|arcgisonline|googleapis|api\.maptiler\.com|stadiamaps/i, // keyed providers
    ];
    // The raster OSM host is still OFFERED — a product that honours the tile policy may use it —
    // but it must never be the default, which is what the deny-list is scoped to here.
    const defaulted = [OPEN_BASEMAPS[0], basemapForTheme("light"), basemapForTheme("dark")];
    for (const p of defaulted) {
      for (const re of GATED) expect(basemapUrl(p)).not.toMatch(re);
    }
    // and no preset at all may name a host that serves a watermark or a keyed provider
    const WATERMARKED = GATED.filter((_, i) => i !== 1);
    for (const p of OPEN_BASEMAPS) {
      for (const re of WATERMARKED) expect(basemapUrl(p)).not.toMatch(re);
    }
  });

  it("every preset carries attribution and declares the theme half it serves", () => {
    for (const p of OPEN_BASEMAPS) {
      expect(p.copyright && p.copyright.length).toBeGreaterThan(10);
      expect(p.copyright).toMatch(/OpenStreetMap/i);   // OSM data, credited as the licence requires
    }
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

  it("basemapForTheme pairs a dark UI with a dark vector basemap", () => {
    const dark = basemapForTheme("dark");
    expect(dark.mode).toBe("dark");
    expect(dark.style).toBeTruthy(); // prefers a vector preset
    expect(defaultVectorBaseMap("dark").baseMapLayers[0].layerType).toBe("VectorTileLayer");
    expect(basemapForTheme("light").mode).toBe("light");
  });

  it("basemapForThemeFrom is the ONE resolver — the drawer ticks the map that gets applied", () => {
    // The chrome/panel used to take the first entry of the mode while basemapForTheme preferred the
    // vector one, so the drawer ticked one basemap and the map drew another.
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
    // The DEFAULT is a GL style now, so the raster path is driven from the raster gallery.
    applyBaseMap(map, baseMapFromPreset(RASTER_BASEMAPS[0]));
    expect(map._sources["basemap:osm"]).toMatchObject({ type: "raster", tileSize: 256 });
    expect(map._sources["basemap:osm"].tiles[0]).toBe("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
    const call = map._calls.addLayer[0];
    expect(call.layer).toMatchObject({ id: "basemap:osm:raster", type: "raster" });
    expect(call.beforeId).toBe("lyr:cities"); // inserted below operational
  });

  it("removes a previous basemap before applying a new one", () => {
    const map = fakeMap([{ id: "lyr:cities" }]);
    applyBaseMap(map, baseMapFromPreset(RASTER_BASEMAPS[0]));       // osm raster
    applyBaseMap(map, baseMapFromPreset(RASTER_BASEMAPS[1]));       // opentopomap raster
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
});
