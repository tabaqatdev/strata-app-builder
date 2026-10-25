// @vitest-environment jsdom
/**
 * `topLayers` — overlays the app draws that are NOT descriptor sublayers (selection highlight,
 * sketch in progress, labels, halos). applyLayerState() lifts every descriptor layer to the top, so
 * without this option those overlays sink under the data. They must stay above every descriptor
 * layer after applyLayerState / reorder / setStyle, never cost a moveLayer when the order is already
 * right (a moveLayer fires styledata → a loop), and the tools' own graphics stay above even them.
 */
import { describe, expect, it, afterEach } from "vitest";
import * as catalog from "../src/basemaps";
import { mountMapControls, keepOnTop, type LayerDescriptor } from "../src/map-controls";

/** A map stub that keeps a real layer order and counts every moveLayer. setStyle drops everything. */
class OrderMap {
  order: string[] = [];
  moves: string[] = [];
  handlers: Record<string, Array<(e: any) => void>> = {};
  sources: Record<string, any> = {};
  layout: Record<string, Record<string, any>> = {};
  paint: Record<string, Record<string, any>> = {};
  constructor(public readable: "order" | "style" | "none" = "order") {}
  add(...ids: string[]) { for (const id of ids) { this.order.push(id); this.layout[id] = {}; this.paint[id] = {}; } }
  addLayer(def: any) { this.add(def.id); }
  removeLayer(id: string) { this.order = this.order.filter((x) => x !== id); }
  getLayer(id: string) { return this.order.includes(id) ? { id } : undefined; }
  moveLayer(id: string) { this.moves.push(id); this.order = this.order.filter((x) => x !== id); this.order.push(id); }
  getLayersOrder() { return this.readable === "order" ? [...this.order] : undefined; }
  getStyle() { return this.readable === "style" ? { layers: this.order.map((id) => ({ id })), sources: this.sources } : { sources: this.sources }; }
  getLayoutProperty(id: string, k: string) { return this.layout[id]?.[k]; }
  setLayoutProperty(id: string, k: string, v: any) { this.layout[id][k] = v; }
  getPaintProperty(id: string, k: string) { return this.paint[id]?.[k]; }
  setPaintProperty(id: string, k: string, v: any) { if (v === undefined) delete this.paint[id][k]; else this.paint[id][k] = v; }
  addSource(id: string, spec: any) { this.sources[id] = { spec, setData() {} }; }
  getSource(id: string) { return this.sources[id]; }
  setStyle() { this.order = []; this.sources = {}; this.fire("styledata"); }
  on(t: string, fn: any) { (this.handlers[t] ??= []).push(fn); }
  off(t: string, fn: any) { this.handlers[t] = (this.handlers[t] ?? []).filter((f) => f !== fn); }
  once() {}
  fire(t: string) { for (const fn of [...(this.handlers[t] ?? [])]) fn({}); }
  flyTo() {} fitBounds() {} getZoom() { return 5; } zoomIn() {} zoomOut() {} resize() {}
  getCanvas() { return document.createElement("canvas"); } getContainer() { return document.createElement("div"); }
}

const box = () => { const el = document.createElement("div"); document.body.appendChild(el); return el; };
afterEach(() => { document.body.innerHTML = ""; });

const LAYERS = (): LayerDescriptor[] => [
  { id: "a", title: "A", sublayers: [{ id: "a-fill" }, { id: "a-line" }], visible: true, setVisible() {} },
  { id: "b", title: "B", sublayers: [{ id: "b-circle" }], visible: true, setVisible() {} },
];
/** The app's map: basemap, then the overlays added EARLY (as an app would), then the data. */
function appMap(readable: "order" | "style" | "none" = "order") {
  const m = new OrderMap(readable);
  m.add("base", "sel-halo", "sel-line", "labels", "b-circle", "a-fill", "a-line");
  return m;
}
const tail = (m: OrderMap, n: number) => m.order.slice(-n);

describe("topLayers — app overlays stay above every descriptor layer", () => {
  it("without topLayers, applyLayerState sinks unlisted layers under the data (the bug)", () => {
    const m = appMap();
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS });
    c.applyLayerState();
    expect(m.order.indexOf("sel-line")).toBeLessThan(m.order.indexOf("b-circle"));
    c.destroy();
  });

  it("after applyLayerState the overlays are the topmost layers, in the given order (bottom → top)", () => {
    const m = appMap();
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: ["sel-halo", "sel-line", "labels"] });
    c.applyLayerState();
    expect(tail(m, 3)).toEqual(["sel-halo", "sel-line", "labels"]);
    expect(m.order.indexOf("a-line")).toBeLessThan(m.order.indexOf("sel-halo"));
    c.destroy();
  });

  it("after a reorder from the layer list they are still on top", () => {
    const m = appMap();
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: ["sel-halo", "sel-line"] });
    c.applyLayerState();
    c.llMoveTo(null, "b", 0);              // B to the top of the list
    c.applyLayerState();
    expect(m.order.indexOf("b-circle")).toBeGreaterThan(m.order.indexOf("a-line"));   // the reorder landed
    expect(tail(m, 2)).toEqual(["sel-halo", "sel-line"]);
    c.destroy();
  });

  it("after setStyle (styledata → onRestyle re-adds layers) they are on top again", () => {
    const m = appMap();
    let c: any;
    c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: ["sel-halo", "sel-line"],
      // the app re-adds its overlays FIRST and its data after — the overlays would end up underneath
      onRestyle: () => { if (!m.getLayer("sel-halo")) m.add("sel-halo", "sel-line", "b-circle", "a-fill", "a-line"); } });
    m.setStyle();
    expect(tail(m, 2)).toEqual(["sel-halo", "sel-line"]);
    // and an onRestyle that calls applyLayerState itself gives the same end state
    const m2 = appMap();
    const c2 = mountMapControls(m2 as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: ["sel-halo", "sel-line"],
      onRestyle: () => { if (!m2.getLayer("sel-halo")) { m2.add("sel-halo", "sel-line", "b-circle", "a-fill", "a-line"); c2.applyLayerState(); } } });
    m2.setStyle();
    expect(tail(m2, 2)).toEqual(["sel-halo", "sel-line"]);
    c.destroy(); c2.destroy();
  });

  it("no moveLayer at all when the order is already right — the styledata loop cannot start", () => {
    const m = appMap();
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: ["sel-halo", "sel-line"] });
    c.applyLayerState();
    m.moves = [];
    // a styledata (what every moveLayer fires in MapLibre) must not move anything now
    for (let i = 0; i < 5; i++) m.fire("styledata");
    expect(m.moves).toEqual([]);
    c.raiseOverlays();
    expect(m.moves).toEqual([]);
    expect(keepOnTop(m as any, ["sel-halo", "sel-line"])).toBe(0);
    // the same through getStyle().layers when the map has no getLayersOrder
    const s = appMap("style"); s.order = ["base", "b-circle", "sel-halo", "sel-line"];
    expect(keepOnTop(s as any, ["sel-halo", "sel-line"])).toBe(0);
    expect(s.moves).toEqual([]);
    c.destroy();
  });

  it("a wrong order costs exactly one moveLayer per overlay, then none", () => {
    const m = appMap();
    expect(keepOnTop(m as any, ["sel-halo", "sel-line", "labels"])).toBe(3);
    expect(m.moves).toEqual(["sel-halo", "sel-line", "labels"]);
    m.moves = [];
    expect(keepOnTop(m as any, ["sel-halo", "sel-line", "labels"])).toBe(0);
    expect(m.moves).toEqual([]);
    // the right members in the wrong order still count as wrong
    m.order = ["base", "labels", "sel-line"];
    expect(keepOnTop(m as any, ["sel-line", "labels"])).toBe(2);
    expect(tail(m, 2)).toEqual(["sel-line", "labels"]);
  });

  it("ids not on the map are ignored (no moveLayer for them, the rest still applied)", () => {
    const m = appMap();
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: ["nope", "sel-line", "also-missing"] });
    c.applyLayerState();
    expect(m.moves).not.toContain("nope");
    expect(m.moves).not.toContain("also-missing");
    expect(tail(m, 1)).toEqual(["sel-line"]);
    expect(keepOnTop(m as any, ["ghost"])).toBe(0);
    c.destroy();
  });

  it("the function form is re-read on every pass", () => {
    const m = appMap();
    let ids = ["sel-halo"];
    let reads = 0;
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: () => { reads++; return ids; } });
    c.applyLayerState();
    expect(tail(m, 1)).toEqual(["sel-halo"]);
    const before = reads;
    ids = ["sel-halo", "labels"];            // a sketch layer appears mid-session
    c.applyLayerState();
    expect(reads).toBeGreaterThan(before);
    expect(tail(m, 2)).toEqual(["sel-halo", "labels"]);
    c.destroy();
  });

  it("a map that fires styledata synchronously from moveLayer does not recurse", () => {
    const m = appMap();
    const move = m.moveLayer.bind(m);
    m.moveLayer = (id: string) => { move(id); m.fire("styledata"); };
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: ["sel-halo", "sel-line", "labels"] });
    expect(() => c.applyLayerState()).not.toThrow();
    expect(tail(m, 3)).toEqual(["sel-halo", "sel-line", "labels"]);
    m.moves = [];
    m.fire("styledata");
    expect(m.moves).toEqual([]);
    c.destroy();
  });

  it("with no map order available it still moves them (the old unconditional path)", () => {
    const m = appMap("none");
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS, topLayers: ["sel-line"] });
    c.applyLayerState();
    expect(tail(m, 1)).toEqual(["sel-line"]);
    c.destroy();
  });

  it("works with an external layerState owner too (applyLayerState only raises the overlays)", () => {
    const m = appMap();
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: ["sel-line"],
      layerState: { order: () => ["a", "b"], opacity: () => 1, setOrder() {}, setOpacity() {} } });
    c.applyLayerState();
    expect(m.moves).toEqual(["sel-line"]);
    expect(tail(m, 1)).toEqual(["sel-line"]);
    c.destroy();
  });

  it("the tools' graphics stay above even the app's topLayers", async () => {
    const m = appMap();
    const geolocation = { getCurrentPosition: (ok: any) => ok({ coords: { longitude: 10, latitude: 20, accuracy: 10 } }) };
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: ["sel-halo", "sel-line"], tools: { locate: true }, geolocation, isSecureContext: true });
    expect(await c.tools.locate()).toBe(true);
    const toolIds = c.tools.layerIds();
    expect(toolIds.length).toBeGreaterThan(0);
    c.applyLayerState();
    expect(tail(m, toolIds.length + 2)).toEqual(["sel-halo", "sel-line", ...toolIds]);
    // a later styledata (fired by any moveLayer) finds everything in place
    m.moves = [];
    m.fire("styledata");
    expect(m.moves).toEqual([]);           // already right: nothing moves
    c.destroy();
  });

  it("the tools' graphics stay above topLayers after setStyle re-adds everything", async () => {
    const m = appMap();
    const geolocation = { getCurrentPosition: (ok: any) => ok({ coords: { longitude: 10, latitude: 20, accuracy: 10 } }) };
    const c = mountMapControls(m as any, { container: box(), catalog, keyboard: false, layers: LAYERS,
      topLayers: ["sel-halo", "sel-line"], tools: { locate: true }, geolocation, isSecureContext: true,
      onRestyle: () => { if (!m.getLayer("a-fill")) { m.add("b-circle", "a-fill", "a-line", "sel-halo", "sel-line"); } } });
    await c.tools.locate();
    m.setStyle();
    const toolIds = c.tools.layerIds();
    expect(toolIds.length).toBeGreaterThan(0);
    expect(tail(m, toolIds.length + 2)).toEqual(["sel-halo", "sel-line", ...toolIds]);
    c.destroy();
  });
});
