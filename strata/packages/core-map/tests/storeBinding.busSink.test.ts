import { describe, it, expect, vi } from "vitest";
import { createStrataStore } from "@strata/state";
import { ActionBus } from "@strata/actions";
import { bindStoreToMap } from "../src/engine/storeBinding.js";

/** A GeoJSON-backed layer whose single feature sits at [10,20] — the record the map must fly to. */
function geoLayer(): any {
  return {
    id: "L",
    title: "Blocks",
    source: { kind: "geojson" },
    layerType: "GeoJSONLayer",
  };
}

/** A source carrying that one feature, so `featureByOid` can resolve it without a network call. */
const SOURCE_DATA = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", id: 42, properties: { OBJECTID: 42, name: "block" }, geometry: { type: "Point", coordinates: [10, 20] } },
  ],
};

function fakeController() {
  return {
    map: {
      getStyle: () => ({ layers: [], sources: {} }),
      on: () => {},
      getSource: (id: string) => (id === "lyr:L" ? { _data: SOURCE_DATA } : undefined),
    },
    fitBounds: vi.fn(),
    flyTo: vi.fn(),
    getZoom: () => 8,
  } as any;
}

describe("bindStoreToMap — bus sink (WIF W4 linked selection)", () => {
  it("featureSelect from the bus sets the store selection", () => {
    const store = createStrataStore();
    const bus = new ActionBus();
    const registry = { highlight: vi.fn() } as any;
    const binding = bindStoreToMap({
      controller: fakeController(),
      registry,
      store,
      client: {} as any,
      bus,
      mapId: "map1",
    });
    bus.emit({ type: "featureSelect", source: "table1", payload: { layerId: "L", oids: [5, 6] } });
    expect(store.getState().selection).toEqual({ layerId: "L", oids: [5, 6] });
    binding.dispose();
  });

  it("ignores echoes of triggers the map itself emitted", () => {
    const store = createStrataStore();
    const bus = new ActionBus();
    const binding = bindStoreToMap({
      controller: fakeController(),
      registry: { highlight: vi.fn() } as any,
      store,
      client: {} as any,
      bus,
      mapId: "map1",
    });
    bus.emit({ type: "featureSelect", source: "map1", payload: { layerId: "L", oids: [1] } });
    expect(store.getState().selection).toBeNull();
    binding.dispose();
  });

  it("flash highlights transiently then restores the current selection", () => {
    vi.useFakeTimers();
    const store = createStrataStore();
    store.getState().setSelection({ layerId: "L", oids: [1] });
    const bus = new ActionBus();
    const highlight = vi.fn();
    const binding = bindStoreToMap({
      controller: fakeController(),
      registry: { highlight } as any,
      store,
      client: {} as any,
      bus,
      mapId: "map1",
    });
    bus.emit({ type: "flash", source: "menu", payload: { layerId: "L", oids: [7, 8] } });
    expect(highlight).toHaveBeenLastCalledWith("L", [7, 8]);
    vi.advanceTimersByTime(900);
    // restored to the store's real selection
    expect(highlight).toHaveBeenLastCalledWith("L", [1]);
    binding.dispose();
    vi.useRealTimers();
  });

  it("flies to the RECORD and opens its popup — not the layer extent", async () => {
    const store = createStrataStore();
    store.getState().addLayer(geoLayer());
    const bus = new ActionBus();
    const controller = fakeController();
    const popups = { showFeature: vi.fn().mockResolvedValue(true), close: vi.fn() };
    const binding = bindStoreToMap({
      controller,
      registry: { highlight: vi.fn() } as any,
      store,
      client: {} as any,
      bus,
      mapId: "map1",
      popups,
    });

    bus.emit({
      type: "rowSelect",
      source: "table",
      payload: { layerId: "L", oids: [42], zoom: true, popup: true },
    });
    await vi.waitFor(() => expect(controller.flyTo).toHaveBeenCalled());

    // The record's own centroid — fitBounds (the whole-layer answer) is never used.
    expect(controller.flyTo).toHaveBeenCalledWith([10, 20], expect.any(Number));
    expect(controller.fitBounds).not.toHaveBeenCalled();
    expect(popups.showFeature).toHaveBeenCalledWith("L", 42);
    binding.dispose();
  });

  it("treats an EMPTY selection as a release: clears the store, the highlight and the popup", () => {
    const store = createStrataStore();
    store.getState().setSelection({ layerId: "L", oids: [42] });
    const bus = new ActionBus();
    const highlight = vi.fn();
    const popups = { showFeature: vi.fn(), close: vi.fn() };
    const binding = bindStoreToMap({
      controller: fakeController(),
      registry: { highlight } as any,
      store,
      client: {} as any,
      bus,
      mapId: "map1",
      popups,
    });

    bus.emit({ type: "rowSelect", source: "table", payload: { layerId: "L", oids: [] } });

    expect(store.getState().selection).toBeNull();
    expect(highlight).toHaveBeenLastCalledWith("L", []);
    expect(popups.close).toHaveBeenCalled();
    expect(popups.showFeature).not.toHaveBeenCalled();
    binding.dispose();
  });

  it("carries a string object id through unchanged — the OID is whatever the service says", () => {
    const store = createStrataStore();
    const bus = new ActionBus();
    const binding = bindStoreToMap({
      controller: fakeController(),
      registry: { highlight: vi.fn() } as any,
      store,
      client: {} as any,
      bus,
      mapId: "map1",
    });
    bus.emit({ type: "rowSelect", source: "table", payload: { layerId: "L", oids: ["06019001100"] } });
    expect(store.getState().selection).toEqual({ layerId: "L", oids: ["06019001100"] });
    binding.dispose();
  });

  it("does not subscribe to the bus when none is given (no throw, no selection change)", () => {
    const store = createStrataStore();
    const binding = bindStoreToMap({
      controller: fakeController(),
      registry: { highlight: vi.fn() } as any,
      store,
      client: {} as any,
    });
    expect(store.getState().selection).toBeNull();
    binding.dispose();
  });
});
