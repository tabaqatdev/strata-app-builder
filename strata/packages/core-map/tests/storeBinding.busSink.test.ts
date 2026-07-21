import { describe, it, expect, vi } from "vitest";
import { createStrataStore } from "@strata/state";
import { ActionBus } from "@strata/actions";
import { bindStoreToMap } from "../src/engine/storeBinding.js";

function fakeController() {
  return {
    map: { getStyle: () => ({ layers: [], sources: {} }), on: () => {} },
    fitBounds: vi.fn(),
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
