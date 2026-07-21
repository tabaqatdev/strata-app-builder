import { describe, it, expect, vi, afterEach } from "vitest";
import {
  OPEN_BASEMAPS,
  VECTOR_BASEMAPS,
  defaultBaseMap,
  defaultVectorBaseMap,
  basemapForTheme,
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
  it("keeps OSM as the keyless default and includes the vector gallery", () => {
    expect(OPEN_BASEMAPS[0].id).toBe("osm");
    expect(defaultBaseMap().baseMapLayers[0].layerType).toBe("WebTiledLayer");
    // every vector preset is a keyless https style URL
    for (const p of VECTOR_BASEMAPS) {
      expect(p.style).toMatch(/^https:\/\//);
      expect(p.style).not.toMatch(/apikey|access_token|key=/i);
    }
    // the vector presets are part of the surfaced gallery
    expect(OPEN_BASEMAPS.some((p) => p.id === "carto-dark-gl")).toBe(true);
  });

  it("baseMapFromPreset builds the right ESRI layer type", () => {
    const vec = baseMapFromPreset(VECTOR_BASEMAPS[0]);
    expect(vec.baseMapLayers[0]).toMatchObject({ layerType: "VectorTileLayer", styleUrl: VECTOR_BASEMAPS[0].style });
    const ras = baseMapFromPreset(OPEN_BASEMAPS[0]);
    expect(ras.baseMapLayers[0]).toMatchObject({ layerType: "WebTiledLayer" });
  });

  it("basemapForTheme pairs a dark UI with a dark vector basemap", () => {
    const dark = basemapForTheme("dark");
    expect(dark.mode).toBe("dark");
    expect(dark.style).toBeTruthy(); // prefers a vector preset
    expect(defaultVectorBaseMap("dark").baseMapLayers[0].layerType).toBe("VectorTileLayer");
    expect(basemapForTheme("light").mode).toBe("light");
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
    applyBaseMap(map, defaultBaseMap());
    expect(map._sources["basemap:osm"]).toMatchObject({ type: "raster", tileSize: 256 });
    expect(map._sources["basemap:osm"].tiles[0]).toBe("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
    const call = map._calls.addLayer[0];
    expect(call.layer).toMatchObject({ id: "basemap:osm:raster", type: "raster" });
    expect(call.beforeId).toBe("lyr:cities"); // inserted below operational
  });

  it("removes a previous basemap before applying a new one", () => {
    const map = fakeMap([{ id: "lyr:cities" }]);
    applyBaseMap(map, defaultBaseMap());
    applyBaseMap(map, baseMapFromPreset(OPEN_BASEMAPS[1])); // carto-positron raster
    expect(map._sources["basemap:osm"]).toBeUndefined();
    expect(map._sources["basemap:carto-positron"]).toBeTruthy();
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
});
