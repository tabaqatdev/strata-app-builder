// @vitest-environment jsdom
/**
 * The embedding hooks — what lets an app with its OWN source of truth (a state store, a basemap
 * drawn as layers under its own) use the controls without the module writing to the map behind its
 * back: `basemapHost`, `layerState`, `themeBasemaps.follow:false`, and the standalone gallery
 * (`mountBasemapGallery`). All optional; without them the module behaves exactly as before.
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import * as catalog from "../src/basemaps";
import { mountMapControls, mountBasemapGallery, basemapGalleryHtml, type LayerDescriptor } from "../src/map-controls";

function stubMap() {
  return {
    setStyle: vi.fn(), on: vi.fn(), off: vi.fn(), zoomIn: vi.fn(), zoomOut: vi.fn(), resize: vi.fn(),
    getLayer: vi.fn(() => ({})), moveLayer: vi.fn(), getLayoutProperty: vi.fn(), setLayoutProperty: vi.fn(),
    getPaintProperty: vi.fn(), setPaintProperty: vi.fn(),
  };
}
const box = () => { const el = document.createElement("div"); document.body.appendChild(el); return el; };
afterEach(() => { document.body.innerHTML = ""; });

describe("basemapHost — the app owns the basemap", () => {
  it("a pick is handed to the host, never to map.setStyle", () => {
    const map = stubMap();
    const apply = vi.fn();
    const onFollowChange = vi.fn();
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, basemapHost: { apply, onFollowChange } });
    c.openDrawer("base");
    (c.elements.drawer.querySelector('[data-base="esri-topo"]') as HTMLElement).click();
    expect(apply).toHaveBeenCalledWith("esri-topo", "pick");
    expect(onFollowChange).toHaveBeenCalledWith(false);
    expect(map.setStyle).not.toHaveBeenCalled();
    c.destroy();
  });

  it("Follow the theme back on applies the theme's basemap with reason 'follow'", () => {
    const apply = vi.fn(), onFollowChange = vi.fn();
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, initialBasemap: "esri-topo",
      theme: { mode: "dark" }, basemapHost: { apply, onFollowChange } });
    c.openDrawer("base");
    (c.elements.drawer.querySelector('[data-base="__auto"]') as HTMLElement).click();
    expect(apply).toHaveBeenCalledWith("osm-dark", "follow");
    expect(onFollowChange).toHaveBeenCalledWith(true);
    c.destroy();
  });

  it("current() is what the gallery ticks — the authored basemap, alias-resolved, before any theme change", () => {
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false,
      basemapHost: { apply: vi.fn(), current: () => "ofm-positron" } });
    expect(c.effectiveBasemap()).toBe("vt-gray");
    c.openDrawer("base");
    const ticked = [...c.elements.drawer.querySelectorAll('.bm-pick[aria-checked="true"]')].map((b) => (b as HTMLElement).dataset.base);
    expect(ticked).toEqual(["vt-gray"]);
    c.destroy();
  });

  it("a theme change swaps through the host with reason 'theme' (and pairs an explicit pick)", () => {
    const apply = vi.fn();
    let drawn: string | null = "esri-light-gray";
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false,
      basemapHost: { apply: (id, r) => { drawn = id; apply(id, r); }, current: () => drawn } });
    c.setTheme("dark");                     // following: the theme chooses
    expect(apply).toHaveBeenLastCalledWith("osm-dark", "theme");
    c.setBasemap("esri-light-gray");          // explicit pick with a dark pair
    c.setTheme("light");
    c.setTheme("dark");
    expect(apply).toHaveBeenLastCalledWith("esri-dark-gray", "theme");
    c.destroy();
  });

  it("themeBasemaps.follow:false — the theme re-colours the chrome but never swaps the basemap", () => {
    const apply = vi.fn();
    const container = box();
    const c = mountMapControls(stubMap(), { container, catalog, keyboard: false,
      themeBasemaps: { light: "osm", dark: "osm-dark", follow: false }, basemapHost: { apply } });
    c.setTheme("dark");
    expect(apply).not.toHaveBeenCalled();
    expect(container.getAttribute("data-smc-mode")).toBe("dark");
    c.destroy();
  });

  it("without a host, a pick is still map.setStyle (unchanged behaviour)", () => {
    const map = stubMap();
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false });
    c.setBasemap("esri-topo");
    expect(map.setStyle).toHaveBeenCalledTimes(1);
    c.destroy();
  });
});

describe("layerState — the app owns order and transparency", () => {
  function setup() {
    const store = { order: ["a", "b", "c"], opacity: { a: 1, b: 0.5, c: 1 } as Record<string, number>, vis: { a: true, b: true, c: true } as Record<string, boolean> };
    const descs = (): LayerDescriptor[] => store.order.map((id) => ({
      id, title: id.toUpperCase(), sublayers: [{ id: `lyr:${id}:fill`, opacity: { "fill-opacity": 1 } }],
      visible: store.vis[id], setVisible: (on: boolean) => { store.vis[id] = on; },
    }));
    const setOrder = vi.fn((ids: string[]) => { store.order = ids.filter((x) => x in store.vis); });
    const setOpacity = vi.fn((id: string, v: number) => { store.opacity[id] = v; });
    const resetOpacity = vi.fn((id: string) => { store.opacity[id] = 1; });
    const map = stubMap();
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, layers: descs,
      layerState: { order: () => store.order, opacity: (id) => store.opacity[id], setOrder, setOpacity, resetOpacity } });
    return { store, c, map, setOrder, setOpacity, resetOpacity };
  }
  const row = (c: any, id: string) => c.elements.drawer.querySelector(`[data-ll-id="${id}"]`) as HTMLElement;

  it("lists in the owner's order and shows the owner's transparency", () => {
    const { c, store } = setup();
    store.order = ["c", "a", "b"];
    c.openDrawer("layers");
    const ids = [...c.elements.drawer.querySelectorAll(".ll-row")].map((r) => (r as HTMLElement).dataset.llId);
    expect(ids).toEqual(["c", "a", "b"]);
    const slider = row(c, "b").querySelector("[data-ll-opacity]") as HTMLInputElement;
    expect(slider.value).toBe("50");          // 0.5 opacity = 50% transparent
    c.destroy();
  });

  it("Move down / the transparency slider report to the owner, and nothing is written to the map", () => {
    const { c, store, map, setOrder, setOpacity } = setup();
    c.openDrawer("layers");
    (row(c, "a").querySelector('[data-ll-cmd="down"]') as HTMLElement).click();
    expect(setOrder).toHaveBeenLastCalledWith(["b", "a", "c"]);
    expect(store.order).toEqual(["b", "a", "c"]);
    const slider = row(c, "c").querySelector("[data-ll-opacity]") as HTMLInputElement;
    slider.value = "25";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    expect(setOpacity).toHaveBeenLastCalledWith("c", 0.75);
    expect(map.moveLayer).not.toHaveBeenCalled();
    expect(map.setPaintProperty).not.toHaveBeenCalled();
    expect(map.setLayoutProperty).not.toHaveBeenCalled();
    c.destroy();
  });

  it("the eye asks the descriptor (the owner) — and Reset restores the owner's opacity and order", () => {
    const { c, store, resetOpacity, setOrder } = setup();
    c.openDrawer("layers");
    (row(c, "b").querySelector('[data-ll-act="eye"]') as HTMLElement).click();
    expect(store.vis.b).toBe(false);
    store.order = ["c", "b", "a"];
    (row(c, "a").querySelector('[data-ll-cmd="reset"]') as HTMLElement).click();
    expect(resetOpacity).toHaveBeenCalledWith("a");
    expect(setOrder).toHaveBeenLastCalledWith(["a", "c", "b"]);
    c.destroy();
  });
});

describe("mountBasemapGallery — the gallery on its own", () => {
  it("renders the same Recommended / More gallery, ticks current(), and reports picks", () => {
    const el = box();
    const onPick = vi.fn();
    const g = mountBasemapGallery(el, { catalog, mode: "light", current: () => "osm", follows: () => false, onPick });
    expect(el.classList.contains("smc")).toBe(true);
    expect(el.querySelector('[data-section="recommended"]')).toBeTruthy();
    expect(el.querySelector('[data-section="more"]')).toBeTruthy();
    expect(el.querySelectorAll(".bm-pick").length).toBe(catalog.BASEMAPS.length);
    expect(el.querySelector('.bm-pick[aria-checked="true"]')?.getAttribute("data-base")).toBe("osm");
    expect(el.querySelector(".bm-pick img")?.getAttribute("src")).toMatch(/osm\.png$/);
    (el.querySelector('[data-base="esri-imagery"]') as HTMLElement).click();
    expect(onPick).toHaveBeenCalledWith("esri-imagery");
    g.destroy();
    expect(el.innerHTML).toBe("");
  });

  it("the Follow switch reports the theme's basemap; update() follows a mode change", () => {
    const el = box();
    let follows = false;
    const onFollowChange = vi.fn((on: boolean) => { follows = on; });
    const g = mountBasemapGallery(el, { catalog, mode: "light", follows: () => follows, onFollowChange });
    (el.querySelector('[data-base="__auto"]') as HTMLElement).click();
    expect(onFollowChange).toHaveBeenCalledWith(true, "osm");
    g.update({ mode: "dark" });
    expect(el.querySelector('.bm-pick[aria-checked="true"]')?.getAttribute("data-base")).toBe("osm-dark");
    expect(el.getAttribute("data-smc-mode")).toBe("dark");
    g.destroy();
  });

  it("the info icon shows the description in a tooltip and never selects", () => {
    const el = box();
    const onPick = vi.fn();
    const g = mountBasemapGallery(el, { catalog, onPick });
    const info = el.querySelector(".bm-info") as HTMLElement;
    info.dispatchEvent(new Event("mouseover", { bubbles: true }));
    const tip = el.querySelector(".bm-tip") as HTMLElement;
    expect(tip.hidden).toBe(false);
    expect(tip.textContent).toBe(catalog.basemapById("osm")!.description);
    info.click();
    expect(onPick).not.toHaveBeenCalled();
    g.destroy();
  });

  it("basemapGalleryHtml keeps the drawer's element ids by default", () => {
    const html = basemapGalleryHtml(catalog, { effective: "osm", auto: true, mode: "light", recommended: ["osm"], moreOpen: false, themeBasemap: "osm" });
    expect(html).toContain('id="bm-more-body"');
    expect(html).toContain('id="bm-tip"');
  });
});
