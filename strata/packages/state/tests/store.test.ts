import { describe, it, expect } from "vitest";
import { createStrataStore } from "../src/store.js";
import type { OperationalLayer, LayersJson } from "@strata/schema";

function layer(id: string, extra: Partial<OperationalLayer> = {}): OperationalLayer {
  return {
    id,
    title: id,
    layerType: "GeoJSON",
    source: { kind: "geojson", data: { type: "FeatureCollection", features: [] } },
    ...extra,
  };
}

describe("createStrataStore — layer CRUD", () => {
  it("adds and removes layers", () => {
    const store = createStrataStore();
    store.getState().addLayer(layer("a"));
    store.getState().addLayer(layer("b"));
    expect(store.getState().layers.map((l) => l.id)).toEqual(["a", "b"]);
    store.getState().removeLayer("a");
    expect(store.getState().layers.map((l) => l.id)).toEqual(["b"]);
  });

  it("does not alias the input layer into state (defensive clone)", () => {
    const store = createStrataStore();
    const original = layer("a");
    store.getState().addLayer(original);
    original.title = "MUTATED";
    expect(store.getState().layers[0].title).toBe("a");
  });

  it("renames a layer and no-ops on unknown id", () => {
    const store = createStrataStore();
    store.getState().addLayer(layer("a"));
    store.getState().renameLayer("a", "Alpha");
    store.getState().renameLayer("nope", "X");
    expect(store.getState().layers[0].title).toBe("Alpha");
  });

  it("sets and clears a layer's definitionExpression (in-place filter)", () => {
    const store = createStrataStore();
    store.getState().addLayer(layer("a"));
    store.getState().setDefinition("a", "POP > 1000");
    expect(store.getState().layers[0].layerDefinition?.definitionExpression).toBe("POP > 1000");
    // clearing with "" removes the filter
    store.getState().setDefinition("a", "");
    expect(store.getState().layers[0].layerDefinition?.definitionExpression).toBeUndefined();
    // preserves other layerDefinition fields
    store.getState().addLayer(
      layer("b", { layerDefinition: { drawingInfo: { renderer: { type: "simple" } } } as any }),
    );
    store.getState().setDefinition("b", "STATE = 'CA'");
    expect(store.getState().layers[1].layerDefinition?.drawingInfo).toBeTruthy();
    expect(store.getState().layers[1].layerDefinition?.definitionExpression).toBe("STATE = 'CA'");
    store.getState().setDefinition("nope", "x"); // no-op
  });

  it("reorders layers and appends unnamed ones in original order", () => {
    const store = createStrataStore();
    store.getState().addLayer(layer("a"));
    store.getState().addLayer(layer("b"));
    store.getState().addLayer(layer("c"));
    store.getState().reorderLayers(["c", "a"]);
    expect(store.getState().layers.map((l) => l.id)).toEqual(["c", "a", "b"]);
  });

  it("sets visibility and clamps opacity to [0,1]", () => {
    const store = createStrataStore();
    store.getState().addLayer(layer("a"));
    store.getState().setVisibility("a", false);
    store.getState().setOpacity("a", 5);
    expect(store.getState().layers[0].visibility).toBe(false);
    expect(store.getState().layers[0].opacity).toBe(1);
    store.getState().setOpacity("a", -3);
    expect(store.getState().layers[0].opacity).toBe(0);
  });
});

describe("createStrataStore — selection + transient UI state", () => {
  it("stores and clears a selection", () => {
    const store = createStrataStore();
    store.getState().setSelection({ layerId: "a", oids: [1, 2] });
    expect(store.getState().selection).toEqual({ layerId: "a", oids: [1, 2] });
    store.getState().setSelection(null);
    expect(store.getState().selection).toBeNull();
  });

  it("clears selection when its layer is removed", () => {
    const store = createStrataStore();
    store.getState().addLayer(layer("a"));
    store.getState().setSelection({ layerId: "a", oids: [1] });
    store.getState().removeLayer("a");
    expect(store.getState().selection).toBeNull();
  });

  it("active layer + interaction mode are transient (not undoable)", () => {
    const store = createStrataStore();
    store.getState().setActiveLayer("a");
    store.getState().setInteractionMode("measure");
    expect(store.getState().activeLayerId).toBe("a");
    expect(store.getState().interactionMode).toBe("measure");
    // no snapshot pushed → nothing to undo
    expect(store.getState().canUndo()).toBe(false);
  });

  it("clears the active layer when it is the removed layer", () => {
    const store = createStrataStore();
    store.getState().addLayer(layer("a"));
    store.getState().setActiveLayer("a");
    store.getState().removeLayer("a");
    expect(store.getState().activeLayerId).toBeNull();
  });

  it("defaults interaction mode to identify", () => {
    expect(createStrataStore().getState().interactionMode).toBe("identify");
  });
});

describe("createStrataStore — undo/redo", () => {
  it("undoes and redoes layer additions", () => {
    const store = createStrataStore();
    store.getState().addLayer(layer("a"));
    store.getState().addLayer(layer("b"));
    expect(store.getState().canUndo()).toBe(true);
    store.getState().undo();
    expect(store.getState().layers.map((l) => l.id)).toEqual(["a"]);
    store.getState().redo();
    expect(store.getState().layers.map((l) => l.id)).toEqual(["a", "b"]);
  });

  it("a new commit clears the redo ring", () => {
    const store = createStrataStore();
    store.getState().addLayer(layer("a"));
    store.getState().addLayer(layer("b"));
    store.getState().undo();
    store.getState().addLayer(layer("c"));
    expect(store.getState().canRedo()).toBe(false);
    expect(store.getState().layers.map((l) => l.id)).toEqual(["a", "c"]);
  });

  it("undo/redo are no-ops at the ends of history", () => {
    const store = createStrataStore();
    expect(() => store.getState().undo()).not.toThrow();
    expect(() => store.getState().redo()).not.toThrow();
    expect(store.getState().layers).toEqual([]);
  });

  it("caps history at 50 snapshots", () => {
    const store = createStrataStore();
    for (let i = 0; i < 60; i++) store.getState().addLayer(layer(`l${i}`));
    expect(store.getState()._past.length).toBe(50);
  });
});

describe("createStrataStore — LayersJson round-trip", () => {
  const cfg: LayersJson = {
    version: "1.0",
    spatialReference: { wkid: 4326 },
    initialState: {
      viewpoint: {
        targetGeometry: { xmin: -10, ymin: -20, xmax: 30, ymax: 40, spatialReference: { wkid: 4326 } },
      },
    },
    baseMap: { title: "Streets", baseMapLayers: [] },
    operationalLayers: [layer("a"), layer("b")],
  };

  it("loads layers + basemap + derives a centered view", () => {
    const store = createStrataStore();
    store.getState().loadFromLayersJson(cfg);
    expect(store.getState().layers.map((l) => l.id)).toEqual(["a", "b"]);
    expect(store.getState().baseMap?.title).toBe("Streets");
    expect(store.getState().view).toEqual({ center: [10, 10], zoom: 3 });
    // transient state reset
    expect(store.getState().activeLayerId).toBeNull();
    expect(store.getState().interactionMode).toBe("identify");
  });

  it("serializes back to a valid LayersJson shape", () => {
    const store = createStrataStore();
    store.getState().loadFromLayersJson(cfg);
    const out = store.getState().toLayersJson();
    expect(out.version).toBe("1.0");
    expect(out.spatialReference.wkid).toBe(4326);
    expect(out.operationalLayers.map((l) => l.id)).toEqual(["a", "b"]);
    expect(out.baseMap.title).toBe("Streets");
    expect(out.initialState.viewpoint.targetGeometry).toBeDefined();
  });
});

describe("createStrataStore — the basemap follows the theme", () => {
  const bm = (title: string) => ({ title, baseMapLayers: [{ id: title, layerType: "WebTiledLayer" as const }] });

  it("follows the theme by default, and an explicit pick turns that off", () => {
    const store = createStrataStore();
    expect(store.getState().baseMapFollowsTheme).toBe(true);
    store.getState().setBaseMapFollowsTheme(false);
    expect(store.getState().baseMapFollowsTheme).toBe(false);
  });

  it("does not push the follow flag onto the undo history — it is not an edit", () => {
    const store = createStrataStore();
    store.getState().setBaseMapFollowsTheme(false);
    expect(store.getState().canUndo()).toBe(false);
  });

  it("a transient basemap swap changes the map without filling the undo stack", () => {
    const store = createStrataStore();
    // An authored pick IS undoable.
    store.getState().setBaseMap(bm("Authored"));
    const depth = store.getState()._past.length;
    expect(depth).toBe(1);

    // The theme-driven swap is not: flipping light↔dark must not read as an edit to the map spec.
    store.getState().setBaseMap(bm("Dark"), { transient: true });
    expect(store.getState().baseMap?.title).toBe("Dark");
    expect(store.getState()._past.length).toBe(depth);

    // Undo still lands on the state before the authored pick, not on a theme flip.
    store.getState().undo();
    expect(store.getState().baseMap).toBeNull();
  });

  it("a fresh map spec restores following — its basemap is an authored starting point", () => {
    const store = createStrataStore();
    store.getState().setBaseMapFollowsTheme(false);
    store.getState().loadFromLayersJson({
      version: "1.0",
      spatialReference: { wkid: 4326 },
      initialState: { viewpoint: { targetGeometry: { xmin: 0, ymin: 0, xmax: 1, ymax: 1, spatialReference: { wkid: 4326 } } } },
      baseMap: { title: "Streets", baseMapLayers: [] },
      operationalLayers: [],
    } as LayersJson);
    expect(store.getState().baseMapFollowsTheme).toBe(true);
  });
});
