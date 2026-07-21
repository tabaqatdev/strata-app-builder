import { describe, it, expect, vi, beforeEach } from "vitest";
import type { OperationalLayer } from "@strata/schema";

// Mock the data layer so no network is touched. `loadFeatures` records its `where` and streams one page.
// `vi.hoisted` runs before the hoisted `vi.mock` factory, so the spies exist when the mock is registered.
const { loadFeatures, fetchMeta } = vi.hoisted(() => ({
  loadFeatures: vi.fn(async (_url: string, _client: unknown, opts: any) => {
    opts.onPage({ type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: null }] });
  }),
  fetchMeta: vi.fn(async () => null),
}));
vi.mock("../src/engine/arcgisSource.js", () => ({ loadFeatures, fetchMeta }));

import { LayerRegistry } from "../src/engine/layers.js";

/** A minimal MapLibre-like stub tracking sources and setData calls. */
function fakeMap() {
  const sources: Record<string, any> = {};
  const layers: Record<string, any> = {};
  const setData = vi.fn();
  return {
    _sources: sources,
    _setData: setData,
    getSource: (id: string) => sources[id],
    getLayer: (id: string) => layers[id],
    addSource: (id: string, def: any) => {
      sources[id] = { ...def, setData };
    },
    addLayer: (l: any) => {
      layers[l.id] = l;
    },
    removeLayer: (id: string) => delete layers[id],
    removeSource: (id: string) => delete sources[id],
    setPaintProperty: () => {},
    setFilter: () => {},
    setLayoutProperty: () => {},
  };
}

function featureLayer(id: string, where?: string): OperationalLayer {
  return {
    id,
    title: id,
    layerType: "ArcGISFeatureLayer",
    url: "https://example.com/FeatureServer/0",
    source: { kind: "arcgis-feature", url: "https://example.com/FeatureServer/0" },
    layerDefinition: where ? ({ definitionExpression: where } as any) : undefined,
  } as OperationalLayer;
}

describe("LayerRegistry.setDefinition (in-place server-side filter, WIF W0)", () => {
  beforeEach(() => {
    loadFeatures.mockClear();
    fetchMeta.mockClear();
  });

  it("re-queries with the new where and updates the existing source without remounting", async () => {
    const map = fakeMap();
    const reg = new LayerRegistry({ map, client: {} as any });
    await reg.add(featureLayer("a"));
    // initial load ran with no filter
    expect(loadFeatures).toHaveBeenCalledTimes(1);
    expect(loadFeatures.mock.calls[0][2].where).toBeUndefined();

    const removeSource = vi.spyOn(map, "removeSource");
    await reg.setDefinition("a", "POP > 1000");

    // the source was NOT removed/re-added — it stayed mounted
    expect(removeSource).not.toHaveBeenCalled();
    expect(map.getSource("lyr:a")).toBeTruthy();
    // a fresh query ran with the new filter
    expect(loadFeatures).toHaveBeenCalledTimes(2);
    expect(loadFeatures.mock.calls[1][2].where).toBe("POP > 1000");
    expect(reg.getDefinition("a")).toBe("POP > 1000");
  });

  it("clears immediately (empty FC) before the filtered page arrives", async () => {
    const map = fakeMap();
    const reg = new LayerRegistry({ map, client: {} as any });
    await reg.add(featureLayer("a"));
    map._setData.mockClear();
    await reg.setDefinition("a", "STATE = 'CA'");
    // first setData after setDefinition is the immediate clear (empty features)
    const firstCall = map._setData.mock.calls[0][0];
    expect(firstCall.features).toEqual([]);
  });

  it("clears the filter with an empty string", async () => {
    const map = fakeMap();
    const reg = new LayerRegistry({ map, client: {} as any });
    await reg.add(featureLayer("a", "POP > 1000"));
    expect(reg.getDefinition("a")).toBe("POP > 1000");
    await reg.setDefinition("a", "");
    expect(reg.getDefinition("a")).toBeUndefined();
    expect(loadFeatures.mock.calls.at(-1)![2].where).toBeUndefined();
  });

  it("no-ops for a non-feature (geojson) layer", async () => {
    const map = fakeMap();
    const reg = new LayerRegistry({ map, client: {} as any });
    await reg.add({
      id: "g",
      title: "g",
      layerType: "GeoJSON",
      source: { kind: "geojson", data: { type: "FeatureCollection", features: [] } },
    } as OperationalLayer);
    loadFeatures.mockClear();
    await reg.setDefinition("g", "X > 1");
    expect(loadFeatures).not.toHaveBeenCalled();
    expect(reg.getDefinition("g")).toBeUndefined();
  });
});
