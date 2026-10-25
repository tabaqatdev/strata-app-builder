/**
 * `MapChrome` is a thin wrapper over `@strata/map-controls`: it mounts the package on the live map,
 * feeds it LayerDescriptors from the map spec, and — when a store is passed — routes every change
 * through the store (visibility / transparency / order / basemap / interaction mode) so the store
 * binding drives the map. And `<StrataMap>` mounts it by default with the controls resolved by
 * `resolveMapWidgetControls` (`mapControls` > legacy `controls` > defaults).
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, act, waitFor } from "@testing-library/react";
import React from "react";
import { createStrataStore } from "@strata/state";
import type { LayersJson, OperationalLayer } from "@strata/schema";
import type { MapControls } from "@strata/map-controls";
import * as basemapCatalog from "@strata/map-controls/basemaps";
import { MapChrome, toPackageTools, toPackageScale } from "../../src/react/controls/MapChrome.js";
import { StrataMap } from "../../src/react/StrataMap.js";
import { baseMapFromId } from "../../src/engine/basemaps.js";

const simple = { type: "simple", label: "Parcels", symbol: { type: "esriSFS", color: [255, 0, 0, 128] } };
const lyr = (id: string, extra: Partial<OperationalLayer> = {}): OperationalLayer =>
  ({ id, title: id.toUpperCase(), layerType: "GeoJSON", source: { kind: "geojson" }, visibility: true,
     layerDefinition: { drawingInfo: { renderer: simple } }, ...extra }) as OperationalLayer;

function chromeMap() {
  return {
    zoomIn: vi.fn(), zoomOut: vi.fn(), on: vi.fn(), off: vi.fn(), fitBounds: vi.fn(),
    getCenter: () => ({ lng: 0, lat: 0 }), getZoom: () => 3, getCanvas: () => ({ style: {} as Record<string, string> }),
    getStyle: () => ({ sources: {}, layers: [] }), getLayer: vi.fn(() => undefined), getSource: vi.fn(() => undefined),
    addSource: vi.fn(), addLayer: vi.fn(), moveLayer: vi.fn(), setPaintProperty: vi.fn(), setLayoutProperty: vi.fn(),
    getPaintProperty: vi.fn(), getLayoutProperty: vi.fn(),
  };
}
function storeWith(layers: OperationalLayer[]) {
  const store = createStrataStore();
  store.getState().loadFromLayersJson({ operationalLayers: layers, baseMap: baseMapFromId("esri-topo") } as unknown as LayersJson);
  return store;
}
const acts = (c: HTMLElement) => [...c.querySelectorAll(".smc-ctl button[data-act]")].map((b) => (b as HTMLElement).dataset.act);
const row = (c: HTMLElement, id: string) => c.querySelector(`[data-ll-id="${id}"]`) as HTMLElement;

afterEach(() => vi.unstubAllGlobals());

describe("MapChrome — the wrapper mounts and unmounts the package", () => {
  it("mounts @strata/map-controls on the map and takes everything down on unmount", () => {
    let handle: MapControls | null = null;
    const { container, unmount } = render(
      <MapChrome map={chromeMap()} layers={[lyr("a")]} onControls={(c) => { handle = c; }} />,
    );
    expect(handle).not.toBeNull();
    expect(container.querySelector("[data-strata-chrome]")?.classList.contains("smc")).toBe(true);
    expect(container.querySelector(".smc-ctl")).toBeTruthy();
    unmount();
    expect(handle).toBeNull();
    expect(document.querySelector(".smc-ctl")).toBeNull();
    // the package's window keyboard listener went with it
    expect(() => fireEvent.keyDown(window, { key: "l" })).not.toThrow();
  });

  it("is the standard cluster with NO tools by default", () => {
    const { container } = render(<MapChrome map={chromeMap()} layers={[lyr("a")]} onFit={vi.fn()} onToggleLegend={vi.fn()} />);
    expect(acts(container)).toEqual(["zin", "zout", "fit", "layers", "base", "legend"]);
    expect(container.querySelector('[data-act^="tool-"]')).toBeNull();
  });

  it("enables only the tools it is given, in the package's fixed order", () => {
    const { container } = render(
      <MapChrome map={chromeMap()} layers={[]} tools={{ print: { title: "T" }, measure: { units: "imperial" }, locate: true }} />,
    );
    expect(acts(container).filter((a) => a!.startsWith("tool-"))).toEqual(["tool-locate", "tool-measure", "tool-print"]);
  });

  it("has NO scale bar by default; `scale` adds the package's, bottom-left (metric / both)", () => {
    const a = render(<MapChrome map={chromeMap()} layers={[]} />);
    expect(a.container.querySelector(".smc-scale")).toBeNull();
    a.unmount();
    const b = render(<MapChrome map={chromeMap()} layers={[]} scale={{ units: "metric" }} />);
    const el = b.container.querySelector(".smc-scale") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.closest("[data-strata-chrome]")).toBeTruthy();
    expect(el.closest(".smc-ctl")).toBeNull();
    expect([...el.querySelectorAll(".smc-scale-line")].map((l) => (l as HTMLElement).dataset.unit)).toEqual(["metric"]);
    b.unmount();
    expect(document.querySelector(".smc-scale")).toBeNull();
    const c = render(<MapChrome map={chromeMap()} layers={[]} scale={{ units: "both" }} />);
    expect([...c.container.querySelectorAll(".smc-scale-line")].map((l) => (l as HTMLElement).dataset.unit)).toEqual(["metric", "imperial"]);
    c.unmount();
  });

  it("maps the schema's normalized scale onto the package's option", () => {
    expect(toPackageScale(false)).toBe(false);
    expect(toPackageScale(undefined)).toBe(false);
    expect(toPackageScale(null)).toBe(false);
    expect(toPackageScale(true)).toEqual({ units: "metric" });
    expect(toPackageScale({ units: "imperial" })).toEqual({ units: "imperial" });
    expect(toPackageScale({ units: "both" })).toEqual({ units: "both" });
    expect(toPackageScale({ units: "nautical" as "metric" })).toEqual({ units: "metric" });
  });

  it("maps the schema's normalized tools onto the package's options", () => {
    expect(toPackageTools({ search: false, locate: false, measure: false, draw: false, print: false })).toBeNull();
    expect(toPackageTools({
      search: { provider: "photon", placeholder: "Find…" }, locate: true,
      measure: { units: "imperial" }, draw: {}, print: { title: "Parcels" },
    })).toEqual({ search: { placeholder: "Find…" }, locate: true, measure: { units: "imperial" }, draw: true, print: { title: "Parcels" } });
  });
});

describe("MapChrome — @strata/map-controls 1.0.2 options pass through", () => {
  it("closePopup: Esc closes the app's popup first, the drawer on the next Esc", () => {
    let popup = true;
    let handle: MapControls | null = null;
    render(<MapChrome map={chromeMap()} layers={[lyr("a")]} keyboard={false}
      closePopup={() => (popup ? !(popup = false) : false)} onControls={(c) => { handle = c; }} />);
    act(() => handle!.openDrawer("base"));
    expect(handle!.escape()).toBe(true);
    expect(popup).toBe(false);
    expect(handle!.getOpenDrawer()).toBe("base");
    expect(handle!.escape()).toBe(true);
    expect(handle!.getOpenDrawer()).toBe(null);
  });

  it("onFit receives the originating event (shift-click on Home)", () => {
    const onFit = vi.fn();
    const { container } = render(<MapChrome map={chromeMap()} layers={[]} onFit={onFit} />);
    fireEvent.click(container.querySelector('[data-act="fit"]') as HTMLElement, { shiftKey: true });
    expect(onFit.mock.calls[0][0].shiftKey).toBe(true);
  });

  it("the drawer is resizable by default; `drawer` sets where it opens and the clamp; resizable:false locks it", () => {
    let handle: MapControls | null = null;
    const onDrawerResize = vi.fn();
    const a = render(<MapChrome map={chromeMap()} layers={[]} drawer={{ width: 300, minWidth: 280, maxWidth: 360 }}
      onDrawerResize={onDrawerResize} onControls={(c) => { handle = c; }} />);
    act(() => handle!.openDrawer("base"));
    const grip = a.container.querySelector(".smc-dgrip") as HTMLElement;
    expect(grip.getAttribute("role")).toBe("separator");
    expect((handle!.elements.drawer as HTMLElement).style.width).toBe("300px");
    fireEvent.keyDown(grip, { key: "End" });
    expect(onDrawerResize).toHaveBeenLastCalledWith(360, "base");
    a.unmount();
    const b = render(<MapChrome map={chromeMap()} layers={[]} drawer={{ resizable: false }} onControls={(c) => { handle = c; }} />);
    act(() => handle!.openDrawer("base"));
    expect(b.container.querySelector(".smc-dgrip")).toBeNull();
  });

  it("an expression opacity on the map is handed to the package (and restored as authored at 0 %)", () => {
    const authored = ["interpolate", ["linear"], ["zoom"], 4, 0.3, 9, 0.9];
    const m = chromeMap() as any;
    const ids = new Set(["lyr:a:fill"]);
    m.getLayer = vi.fn((id: string) => (ids.has(id) ? { id } : undefined));
    m.getPaintProperty = vi.fn((id: string, prop: string) => (prop === "fill-opacity" ? authored : undefined));
    let handle: MapControls | null = null;
    render(<MapChrome map={m} layers={[lyr("a")]} onControls={(c) => { handle = c; }} />);
    act(() => handle!.applyLayerState());
    const writes = m.setPaintProperty.mock.calls.filter((c: unknown[]) => c[0] === "lyr:a:fill" && c[1] === "fill-opacity");
    expect(writes.every((c: unknown[]) => c[2] !== undefined)).toBe(true);
    expect(m.setPaintProperty.mock.calls.some((c: unknown[]) => c[2] === undefined)).toBe(false);
  });
});

describe("MapChrome — @strata/map-controls 1.0.3 options pass through", () => {
  it("popupStyles: off by default (StrataMap popups are themed by ensurePopupStyles), on when asked; the popup z-index rule is injected either way", () => {
    let handle: MapControls | null = null;
    const a = render(<MapChrome map={chromeMap()} layers={[]} onControls={(c) => { handle = c; }} />);
    expect((handle!.elements.container as HTMLElement).hasAttribute("data-smc-popups")).toBe(false);
    expect(document.querySelector("style[data-smc-popup-css]")?.textContent).toContain("--smc-popup-z");
    a.unmount();
    render(<MapChrome map={chromeMap()} layers={[]} popupStyles onControls={(c) => { handle = c; }} />);
    expect((handle!.elements.container as HTMLElement).hasAttribute("data-smc-popups")).toBe(true);
  });
});

/** A chrome map that keeps a real layer order (getLayersOrder) and records every moveLayer. */
function orderedMap(ids: string[]) {
  const m = chromeMap() as any;
  const order = [...ids];
  const moves: string[] = [];
  m.getLayer = vi.fn((id: string) => (order.includes(id) ? { id } : undefined));
  m.getLayersOrder = () => [...order];
  m.moveLayer = vi.fn((id: string) => { moves.push(id); order.splice(order.indexOf(id), 1); order.push(id); });
  return { m, order, moves };
}

describe("MapChrome — topLayers keeps the app's overlays above the operational layers", () => {
  it("absent: unchanged behaviour (an unlisted overlay is left under the data)", () => {
    const { m, order } = orderedMap(["base", "sel", "lyr:a:fill"]);
    let h: MapControls | null = null;
    render(<MapChrome map={m} layers={[lyr("a")]} onControls={(c) => { h = c; }} />);
    h!.applyLayerState();
    expect(order.indexOf("sel")).toBeLessThan(order.indexOf("lyr:a:fill"));
  });

  it("given: the overlays end on top after applyLayerState, and nothing moves when already right", () => {
    const { m, order, moves } = orderedMap(["base", "sel", "sketch", "lyr:a:fill", "lyr:a:outline"]);
    let h: MapControls | null = null;
    render(<MapChrome map={m} layers={[lyr("a")]} topLayers={["sel", "sketch", "missing"]} onControls={(c) => { h = c; }} />);
    h!.applyLayerState();
    expect(order.slice(-2)).toEqual(["sel", "sketch"]);
    moves.length = 0;
    h!.raiseOverlays();
    expect(moves).toEqual([]);
  });

  it("with a store (layerState owner) the function form is honoured too", () => {
    const { m, order } = orderedMap(["base", "sel", "lyr:a:fill"]);
    let h: MapControls | null = null;
    render(<MapChrome map={m} store={storeWith([lyr("a")])} layers={[]} topLayers={() => ["sel"]} onControls={(c) => { h = c; }} />);
    h!.applyLayerState();
    expect(order.at(-1)).toBe("sel");
  });
});

describe("MapChrome — store-driven: every change goes through the store", () => {
  it("the eye → store.setVisibility; nothing is written to the map by the chrome", () => {
    const store = storeWith([lyr("a"), lyr("b")]);
    const map = chromeMap();
    const { container } = render(<MapChrome map={map} store={store} layers={store.getState().layers} />);
    fireEvent.click(container.querySelector('[data-act="layers"]')!);
    fireEvent.click(row(container, "b").querySelector('[data-ll-act="eye"]')!);
    expect(store.getState().layers.find((l) => l.id === "b")?.visibility).toBe(false);
    expect(map.setLayoutProperty).not.toHaveBeenCalled();
  });

  it("transparency → store.setOpacity", () => {
    const store = storeWith([lyr("a"), lyr("b", { opacity: 0.8 })]);
    const map = chromeMap();
    const { container } = render(<MapChrome map={map} store={store} layers={store.getState().layers} />);
    fireEvent.click(container.querySelector('[data-act="layers"]')!);
    fireEvent.click(row(container, "b").querySelector('[data-ll-act="acts"]')!);
    const slider = row(container, "b").querySelector("[data-ll-opacity]") as HTMLInputElement;
    expect(slider.value).toBe("20"); // the store's 0.8 opacity = 20% transparent
    fireEvent.input(slider, { target: { value: "75" } });
    expect(store.getState().layers.find((l) => l.id === "b")?.opacity).toBeCloseTo(0.25);
    expect(map.setPaintProperty).not.toHaveBeenCalled();
    // Reset restores the AUTHORED opacity, not 1
    fireEvent.click(row(container, "b").querySelector('[data-ll-cmd="reset"]')!);
    expect(store.getState().layers.find((l) => l.id === "b")?.opacity).toBeCloseTo(0.8);
  });

  it("order → store.reorderLayers (top first, as the store holds it)", () => {
    const store = storeWith([lyr("a"), lyr("b"), lyr("c")]);
    const map = chromeMap();
    const { container } = render(<MapChrome map={map} store={store} layers={store.getState().layers} />);
    fireEvent.click(container.querySelector('[data-act="layers"]')!);
    fireEvent.click(row(container, "a").querySelector('[data-ll-act="acts"]')!);
    fireEvent.click(row(container, "a").querySelector('[data-ll-cmd="down"]')!);
    expect(store.getState().layers.map((l) => l.id)).toEqual(["b", "a", "c"]);
    expect(map.moveLayer).not.toHaveBeenCalled();
    const listed = [...container.querySelectorAll(".ll-row")].map((r) => (r as HTMLElement).dataset.llId);
    expect(listed).toEqual(["b", "a", "c"]);
  });

  it("a change made elsewhere (another panel, undo) re-renders the open drawer", () => {
    const store = storeWith([lyr("a")]);
    const { container } = render(<MapChrome map={chromeMap()} store={store} layers={store.getState().layers} />);
    fireEvent.click(container.querySelector('[data-act="layers"]')!);
    act(() => store.getState().setVisibility("a", false));
    expect(row(container, "a").classList.contains("off")).toBe(true);
    act(() => store.getState().undo());
    expect(row(container, "a").classList.contains("off")).toBe(false);
  });

  it("a tool sets the store's interactionMode and reverts it to identify when it closes", () => {
    const store = storeWith([]);
    const { container } = render(
      <MapChrome map={chromeMap()} store={store} layers={[]} tools={{ measure: true, draw: true }} />,
    );
    fireEvent.click(container.querySelector('[data-act="tool-measure"]')!);
    expect(store.getState().interactionMode).toBe("measure");
    fireEvent.click(container.querySelector('[data-act="tool-draw"]')!);
    expect(store.getState().interactionMode).toBe("sketch"); // the package's "draw" is the store's "sketch"
    fireEvent.keyDown(window, { key: "Escape" });
    expect(store.getState().interactionMode).toBe("identify");
  });

  it("identify set elsewhere ends the active tool; unmounting never leaves the map in a tool mode", () => {
    const store = storeWith([]);
    let handle: MapControls | null = null;
    const { container, unmount } = render(
      <MapChrome map={chromeMap()} store={store} layers={[]} tools={{ measure: true }} onControls={(c) => { handle = c; }} />,
    );
    fireEvent.click(container.querySelector('[data-act="tool-measure"]')!);
    act(() => store.getState().setInteractionMode("identify"));
    expect(handle!.getMode()).toBe("identify");
    fireEvent.click(container.querySelector('[data-act="tool-measure"]')!);
    expect(store.getState().interactionMode).toBe("measure");
    unmount();
    expect(store.getState().interactionMode).toBe("identify");
  });
});

describe("MapChrome — the basemap follows the documented rules", () => {
  const ticked = (c: HTMLElement) => [...c.querySelectorAll('.bm-pick[aria-checked="true"]')].map((b) => (b as HTMLElement).dataset.base);

  it("the authored basemap wins on mount — the gallery ticks it, nothing is swapped", () => {
    const store = storeWith([]);
    const { container } = render(<MapChrome map={chromeMap()} store={store} layers={[]} themeMode="dark" />);
    fireEvent.click(container.querySelector('[data-act="base"]')!);
    expect(ticked(container)).toEqual(["esri-topo"]);
    expect(store.getState().baseMap?.baseMapLayers[0].id).toBe("esri-topo");
  });

  it("a legacy id in the spec ticks its alias's card", () => {
    const store = createStrataStore();
    store.getState().setBaseMap({ title: "OpenFreeMap Positron", baseMapLayers: [{ id: "ofm-positron", layerType: "VectorTileLayer", styleUrl: "https://tiles.openfreemap.org/styles/positron" }] });
    const { container } = render(<MapChrome map={chromeMap()} store={store} layers={[]} />);
    fireEvent.click(container.querySelector('[data-act="base"]')!);
    expect(ticked(container)).toEqual(["vt-gray"]);
  });

  it("a theme change swaps to the pair — transiently (no undo entry, not an edit)", () => {
    const store = storeWith([]);
    const depth = store.getState()._past.length;
    const map = chromeMap();
    const { rerender } = render(<MapChrome map={map} store={store} layers={[]} themeMode="light" />);
    rerender(<MapChrome map={map} store={store} layers={[]} themeMode="light" />);
    // (re-render with the same mode: nothing happens)
    expect(store.getState().baseMap?.baseMapLayers[0].id).toBe("esri-topo");
    rerender(<MapChrome map={map} store={store} layers={[]} themeMode="dark" />);
    expect(store.getState().baseMap?.baseMapLayers[0].id).toBe("osm-dark");
    expect(store.getState()._past.length).toBe(depth);
    rerender(<MapChrome map={map} store={store} layers={[]} themeMode="light" />);
    expect(store.getState().baseMap?.baseMapLayers[0].id).toBe("osm");
  });

  it("an explicit pick outranks the theme (undoable, Follow off) — and a paired pick swaps to its pair", () => {
    const store = storeWith([]);
    const map = chromeMap();
    const { container, rerender } = render(<MapChrome map={map} store={store} layers={[]} themeMode="light" />);
    fireEvent.click(container.querySelector('[data-act="base"]')!);
    const depth = store.getState()._past.length;
    fireEvent.click(container.querySelector('[data-base="esri-light-gray"]')!);
    expect(store.getState().baseMap?.baseMapLayers[0].id).toBe("esri-light-gray");
    expect(store.getState()._past.length).toBe(depth + 1);     // a pick IS an edit
    expect(store.getState().baseMapFollowsTheme).toBe(false);
    expect(container.querySelector('[data-base="__auto"]')?.getAttribute("aria-checked")).toBe("false");
    rerender(<MapChrome map={map} store={store} layers={[]} themeMode="dark" />);
    expect(store.getState().baseMap?.baseMapLayers[0].id).toBe("esri-dark-gray"); // its pair
    fireEvent.click(container.querySelector('[data-base="esri-topo"]')!);         // a pick with no pair
    rerender(<MapChrome map={map} store={store} layers={[]} themeMode="light" />);
    expect(store.getState().baseMap?.baseMapLayers[0].id).toBe("esri-topo");      // left where the reader put it
  });

  it("themeBasemaps names the pair (alias-aware); follow:false pins the basemap", () => {
    const store = storeWith([]);
    const map = chromeMap();
    const pair = { light: "ofm-positron", dark: "carto-dark-gl" };
    const { rerender } = render(<MapChrome map={map} store={store} layers={[]} themeMode="light" themeBasemaps={pair} />);
    rerender(<MapChrome map={map} store={store} layers={[]} themeMode="dark" themeBasemaps={pair} />);
    expect(store.getState().baseMap?.baseMapLayers[0].id).toBe("vt-gray-dark");

    const pinned = storeWith([]);
    const pin = { follow: false };
    const r2 = render(<MapChrome map={map} store={pinned} layers={[]} themeMode="light" themeBasemaps={pin} />);
    r2.rerender(<MapChrome map={map} store={pinned} layers={[]} themeMode="dark" themeBasemaps={pin} />);
    expect(pinned.getState().baseMap?.baseMapLayers[0].id).toBe("esri-topo");
  });
});

// ── <StrataMap> with a fake maplibre ─────────────────────────────────────────────────────────
class FakeGLMap {
  static last: FakeGLMap | null = null;
  container: HTMLElement;
  handlers: Record<string, Array<(e?: any) => void>> = {};
  sources: Record<string, any> = {};
  layers: any[] = [];
  controls: Array<{ control: any; position: string }> = [];
  opts: any;
  constructor(opts: any) {
    this.opts = opts;
    this.container = opts.container;
    FakeGLMap.last = this;
    setTimeout(() => this.emit("load"), 0);
  }
  on(t: string, a: any, b?: any) { (this.handlers[t] ??= []).push(typeof a === "function" ? a : b); }
  off() {}
  once() {}
  emit(t: string, e?: any) { for (const fn of this.handlers[t] ?? []) fn(e); }
  getStyle() { return { sources: this.sources, layers: this.layers }; }
  addSource(id: string, s: any) { this.sources[id] = s; }
  getSource(id: string) { return this.sources[id]; }
  removeSource(id: string) { delete this.sources[id]; }
  addLayer(l: any, before?: string) { const i = before ? this.layers.findIndex((x) => x.id === before) : -1; i >= 0 ? this.layers.splice(i, 0, l) : this.layers.push(l); }
  getLayer(id: string) { return this.layers.find((l) => l.id === id); }
  removeLayer(id: string) { this.layers = this.layers.filter((l) => l.id !== id); }
  moveLayer() {}
  setLayoutProperty() {}
  getLayoutProperty() { return undefined; }
  setPaintProperty() {}
  getPaintProperty() { return undefined; }
  getCanvas() { return { style: {} as Record<string, string> }; }
  getCanvasContainer() { return this.container; }
  getContainer() { return this.container; }
  resize() {}
  fitBounds = vi.fn();
  easeTo = vi.fn();
  zoomIn = vi.fn();
  zoomOut = vi.fn();
  getCenter() { return { lng: 0, lat: 0 }; }
  getZoom() { return 2; }
  getBounds() { return { getWest: () => -1, getSouth: () => -1, getEast: () => 1, getNorth: () => 1 }; }
  addControl(control: any, position: string) { this.controls.push({ control, position }); }
  removeControl() {}
  remove() {}
  queryRenderedFeatures() { return []; }
}
class FakeScale { constructor(public o: any) {} }
const fakeMaplibre = { Map: FakeGLMap, ScaleControl: FakeScale, Popup: class {} };
const SPEC = (baseMap?: any): LayersJson =>
  ({ operationalLayers: [], baseMap, spatialReference: { wkid: 4326 } }) as unknown as LayersJson;

async function renderMap(props: Record<string, unknown>) {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  const utils = render(<StrataMap maplibregl={fakeMaplibre} config={SPEC(props.baseMap)} {...props} />);
  await waitFor(() => expect(utils.container.querySelector(".smc-ctl")).toBeTruthy());
  return utils;
}

describe("<StrataMap> mounts the standard controls by default", () => {
  it("no controls prop → the standard cluster, top-right, no tools, no scale bar, no MapLibre native controls", async () => {
    const { container } = await renderMap({});
    expect(acts(container)).toEqual(["zin", "zout", "fit", "layers", "base", "legend"]);
    expect(container.querySelector('[data-act^="tool-"]')).toBeNull();
    expect(container.querySelector(".smc-scale")).toBeNull();     // the scale bar is OFF by default
    expect(FakeGLMap.last!.controls).toEqual([]); // the duplicate nav/fullscreen are retired
  });

  it("mapControls.scale renders the package scale bar (and no MapLibre ScaleControl)", async () => {
    const { container } = await renderMap({ mapControls: { scale: { units: "imperial" } } });
    const lines = [...container.querySelectorAll(".smc-scale .smc-scale-line")] as HTMLElement[];
    expect(lines.map((l) => l.dataset.unit)).toEqual(["imperial"]);
    expect(lines[0].textContent).toMatch(/^\d+ (ft|mi)$/);
    expect(FakeGLMap.last!.controls).toEqual([]);
  });

  it("legacy flags keep working: measure→measure, sketch→draw, geolocate→locate; scale → the package scale bar", async () => {
    const { container } = await renderMap({
      controls: { navigation: true, fullscreen: true, measure: true, sketch: true, geolocate: true, scale: true, position: "top-left" },
    });
    expect(acts(container).filter((a) => a!.startsWith("tool-"))).toEqual(["tool-locate", "tool-measure", "tool-draw"]);
    const lines = [...container.querySelectorAll(".smc-scale .smc-scale-line")] as HTMLElement[];
    expect(lines.map((l) => l.dataset.unit)).toEqual(["metric"]);
    expect(FakeGLMap.last!.controls).toEqual([]);     // the old MapLibre ScaleControl path is gone
  });

  it("mapControls wins over the legacy flags", async () => {
    const { container } = await renderMap({
      mapControls: { tools: { print: true } },
      controls: { measure: true, scale: true },
    });
    expect(acts(container).filter((a) => a!.startsWith("tool-"))).toEqual(["tool-print"]);
    expect(container.querySelector(".smc-scale")).toBeNull();
    expect(FakeGLMap.last!.controls).toEqual([]);
  });

  it("draws a layers.json basemap that names a retired id — as its alias, from the catalog", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ sources: {}, layers: [] }) });
    vi.stubGlobal("fetch", fetchSpy);
    await renderMap({
      baseMap: { title: "OpenFreeMap Positron", baseMapLayers: [{ id: "ofm-positron", layerType: "VectorTileLayer", styleUrl: "https://tiles.openfreemap.org/styles/positron" }] },
    });
    expect(fetchSpy).toHaveBeenCalledWith(basemapCatalog.basemapById("vt-gray")!.style);
    expect(fetchSpy.mock.calls.some((c) => String(c[0]).includes("openfreemap"))).toBe(false);
  });

  it("a spec with no basemap gets the theme's — OpenStreetMap — and mapControls.basemap.initial outranks the spec", async () => {
    await renderMap({});
    expect(FakeGLMap.last!.sources["basemap:osm"]).toBeTruthy();
    await renderMap({ mapControls: { basemap: { initial: "esri-topo" } }, baseMap: baseMapFromId("osm") });
    expect(FakeGLMap.last!.sources["basemap:esri-topo"]).toBeTruthy();
    expect(FakeGLMap.last!.sources["basemap:osm"]).toBeUndefined();
  });

  it("the map gets the catalog's transformRequest (the tile-proxy hook reaches GL style internals)", async () => {
    await renderMap({});
    const tr = FakeGLMap.last!.opts.transformRequest;
    expect(typeof tr).toBe("function");
    expect(tr("https://tile.openstreetmap.org/1/0/0.png")).toBeUndefined(); // identity until a rule is set
    basemapCatalog.setUrlRewrite({ "tile.openstreetmap.org": "https://mirror.example/osm" });
    try {
      expect(tr("https://tile.openstreetmap.org/1/0/0.png")).toEqual({ url: "https://mirror.example/osm/1/0/0.png" });
    } finally {
      basemapCatalog.setUrlRewrite(null);
    }
  });
});
