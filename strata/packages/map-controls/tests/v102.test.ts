// @vitest-environment jsdom
/**
 * 1.0.2 — the gaps the app migration found, one describe per item: Esc order (popup → panels),
 * the resizable drawer, setStyle without diffing, transparency that never unsets and understands
 * expressions, layering / credits tokens, the button-bleed fix, secondary maps, RTL, the small API
 * gaps (getOpenDrawer / syncChrome / onFit(event) / getTheme) and the faint-shading theme pair.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as catalog from "../src/basemaps";
import { mountMapControls, scaleOpacity, closeMapPopups, type LayerDescriptor } from "../src/map-controls";

/** A stub map with a real layer order and paint / layout stores; setStyle fires styledata. */
function stubMap(paint: Record<string, Record<string, unknown>> = {}) {
  const handlers: Record<string, Function[]> = {};
  const order = Object.keys(paint);
  const P: Record<string, Record<string, unknown>> = JSON.parse(JSON.stringify(paint));
  const L: Record<string, Record<string, unknown>> = Object.fromEntries(order.map((id) => [id, {}]));
  const m: any = {
    order, P, L, handlers,
    setStyle: vi.fn(() => { for (const fn of handlers.styledata ?? []) fn({}); }),
    on: vi.fn((t: string, fn: Function) => { (handlers[t] ??= []).push(fn); }),
    off: vi.fn((t: string, fn: Function) => { handlers[t] = (handlers[t] ?? []).filter((f) => f !== fn); }),
    zoomIn: vi.fn(), zoomOut: vi.fn(), resize: vi.fn(),
    getLayer: (id: string) => (order.includes(id) ? { id } : undefined),
    moveLayer: vi.fn((id: string) => { order.splice(order.indexOf(id), 1); order.push(id); }),
    getLayersOrder: () => [...order],
    getLayoutProperty: (id: string, k: string) => L[id]?.[k],
    setLayoutProperty: vi.fn((id: string, k: string, v: unknown) => { L[id][k] = v; }),
    getPaintProperty: (id: string, k: string) => P[id]?.[k],
    setPaintProperty: vi.fn((id: string, k: string, v: unknown) => { P[id][k] = v; }),
    getCanvas: () => ({ style: {} }),
  };
  return m;
}
const box = (attrs: Record<string, string> = {}) => {
  const el = document.createElement("div");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
};
const desc = (id: string, sublayers: LayerDescriptor["sublayers"], vis = { on: true }): LayerDescriptor => ({
  id, title: id, sublayers, get visible() { return vis.on; }, setVisible: (v: boolean) => { vis.on = v; },
} as any);
const key = (el: Element, k: string, extra: Record<string, unknown> = {}) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...extra }));
afterEach(() => { document.body.innerHTML = ""; document.documentElement.removeAttribute("dir"); });

// ── 1 ─────────────────────────────────────────────────────────────────────────────────────────
describe("1 · Esc order: popup first, then the tool, then the drawer", () => {
  it("an app popup (closePopup) is closed BEFORE the drawer; the next Esc closes the drawer", () => {
    let popupOpen = true;
    const closePopup = vi.fn(() => { if (!popupOpen) return false; popupOpen = false; return true; });
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, closePopup });
    c.openDrawer("base");
    expect(c.escape()).toBe(true);
    expect(popupOpen).toBe(false);
    expect(c.getOpenDrawer()).toBe("base");          // the drawer is still open
    expect(c.escape()).toBe(true);
    expect(c.getOpenDrawer()).toBe(null);
    expect(c.escape()).toBe(false);                   // nothing left: the app's own chain gets it
    c.destroy();
  });

  it("MapLibre popups on the map are closed by Esc (the map's _popups, else the close button)", () => {
    const map = stubMap();
    const mapBox = box();
    map.getContainer = () => mapBox;
    const remove = vi.fn();
    map._popups = [{ isOpen: () => true, remove }];
    // a popup the map does not list: its close button is pressed
    mapBox.innerHTML = `<div class="maplibregl-popup"><button class="maplibregl-popup-close-button"></button></div>`;
    const x = mapBox.querySelector("button")!;
    const pressed = vi.fn(() => x.closest(".maplibregl-popup")!.remove());
    x.addEventListener("click", pressed);
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false });
    c.openDrawer("layers");
    expect(c.escape()).toBe(true);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(pressed).toHaveBeenCalledTimes(1);
    expect(c.getOpenDrawer()).toBe("layers");        // popups first: the drawer is still open
    map._popups = [];
    expect(c.escape()).toBe(true);
    expect(c.getOpenDrawer()).toBe(null);
    c.destroy();
  });

  it("closeMapPopups() removes a popup without a close button, and counts what it closed", () => {
    const mapBox = box();
    mapBox.innerHTML = `<div class="maplibregl-popup"><p>no button</p></div>`;
    expect(closeMapPopups({ getContainer: () => mapBox } as any)).toBe(1);
    expect(mapBox.querySelector(".maplibregl-popup")).toBeNull();
    expect(closeMapPopups({ getContainer: () => mapBox } as any)).toBe(0);
    expect(closeMapPopups(null)).toBe(0);
  });

  it("the window Esc follows the same order (keyboard: true)", () => {
    let open = true;
    const c = mountMapControls(stubMap(), { container: box(), catalog, closePopup: () => (open ? !(open = false) : false) });
    c.openDrawer("base");
    key(document.body, "Escape");
    expect(open).toBe(false);
    expect(c.getOpenDrawer()).toBe("base");
    key(document.body, "Escape");
    expect(c.getOpenDrawer()).toBe(null);
    c.destroy();
  });

  it("escapeGuardMs: the Esc right after a native full-screen exit is swallowed; 0 disables the guard", () => {
    const fsBox = box();
    const d: any = document;
    Object.defineProperty(d, "fullscreenEnabled", { value: true, configurable: true });
    let fsEl: any = fsBox;
    Object.defineProperty(d, "fullscreenElement", { get: () => fsEl, configurable: true });
    const guarded = mountMapControls(stubMap(), { container: fsBox, catalog, keyboard: false, escapeGuardMs: 10_000 });
    guarded.openDrawer("base");
    fsEl = null; document.dispatchEvent(new Event("fullscreenchange"));
    expect(guarded.escape()).toBe(true);
    expect(guarded.getOpenDrawer()).toBe("base");      // swallowed: nothing unwound
    guarded.destroy();
    fsEl = fsBox;
    const unguarded = mountMapControls(stubMap(), { container: fsBox, catalog, keyboard: false, escapeGuardMs: 0 });
    unguarded.openDrawer("base");
    fsEl = null; document.dispatchEvent(new Event("fullscreenchange"));
    expect(unguarded.escape()).toBe(true);
    expect(unguarded.getOpenDrawer()).toBe(null);      // no guard: the Esc closed the drawer
    unguarded.destroy();
    delete d.fullscreenEnabled; delete d.fullscreenElement;
  });

  it("a throwing closePopup is reported, not fatal", () => {
    const onError = vi.fn();
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, onError, closePopup: () => { throw new Error("boom"); } });
    c.openDrawer("base");
    expect(c.escape()).toBe(true);
    expect(c.getOpenDrawer()).toBe(null);
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/closePopup threw: boom/));
    c.destroy();
  });
});

// ── 2 ─────────────────────────────────────────────────────────────────────────────────────────
describe("2 · the resizable drawer", () => {
  const grip = (c: any) => c.elements.container.querySelector(".smc-dgrip") as HTMLElement;
  it("an ARIA separator grip shows while a drawer is open — focusable, aria-valuemin / max, controls the drawer", () => {
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false });
    const g = grip(c);
    expect(g).toBeTruthy();
    expect(g.hidden).toBe(true);
    c.openDrawer("base");
    expect(g.hidden).toBe(false);
    expect(g.getAttribute("role")).toBe("separator");
    expect(g.getAttribute("tabindex")).toBe("0");
    expect(g.getAttribute("aria-orientation")).toBe("vertical");
    expect(g.getAttribute("aria-valuemin")).toBe("260");
    expect(g.getAttribute("aria-valuemax")).toBe("520");
    expect(g.getAttribute("aria-controls")).toBe(c.elements.drawer.id);
    c.closeAll();
    expect(g.hidden).toBe(true);
    c.destroy();
    expect(document.querySelector(".smc-dgrip")).toBeNull();
  });

  it("arrow keys resize (LTR: ← widens — the grip is on the outer, left edge), Shift steps ×3, clamped to min / max", () => {
    const onDrawerResize = vi.fn();
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, drawer: { width: 300, minWidth: 280, maxWidth: 400 }, onDrawerResize });
    c.openDrawer("layers");
    const d = c.elements.drawer, g = grip(c);
    expect(d.style.width).toBe("300px");               // the authored width is where it OPENS
    key(g, "ArrowLeft");
    expect(d.style.width).toBe("316px");
    expect(g.getAttribute("aria-valuenow")).toBe("316");
    expect(onDrawerResize).toHaveBeenLastCalledWith(316, "layers");
    key(g, "ArrowRight", { shiftKey: true });
    expect(d.style.width).toBe("280px");               // 316 − 48 = 268 → clamped to 280
    key(g, "End");
    expect(d.style.width).toBe("400px");
    key(g, "ArrowLeft");
    expect(d.style.width).toBe("400px");               // clamped at max
    key(g, "Home");
    expect(c.drawerWidth()).toBe(280);
    c.destroy();
  });

  it("a drag on the grip resizes; the dragged width is SESSION state — it survives close / reopen, per drawer, and touches no map or spec", () => {
    const map = stubMap();
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, drawer: { minWidth: 260, maxWidth: 520 } });
    c.openDrawer("base");
    const g = grip(c);
    vi.spyOn(c.elements.drawer, "getBoundingClientRect").mockReturnValue({ width: 316 } as DOMRect);
    g.dispatchEvent(new MouseEvent("pointerdown", { clientX: 500, bubbles: true }) as any);
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 440 }) as any);   // 60 px to the left
    window.dispatchEvent(new MouseEvent("pointerup", {}) as any);
    expect(c.elements.drawer.style.width).toBe("376px");
    c.closeAll(); c.openDrawer("layers");
    expect(c.elements.drawer.style.width).toBe("");      // the layer list keeps ITS width
    c.closeAll(); c.openDrawer("base");
    expect(c.elements.drawer.style.width).toBe("376px"); // the gallery reopens where it was dragged
    expect(map.setStyle).not.toHaveBeenCalled();
    expect(map.setPaintProperty).not.toHaveBeenCalled();
    c.destroy();
  });

  it("RTL: the grip sits on the other edge, so → widens", () => {
    const c = mountMapControls(stubMap(), { container: box({ dir: "rtl" }), catalog, keyboard: false, drawer: { width: 300 } });
    c.openDrawer("base");
    key(grip(c), "ArrowRight");
    expect(c.drawerWidth()).toBe(316);
    key(grip(c), "ArrowLeft");
    expect(c.drawerWidth()).toBe(300);
    c.destroy();
  });

  it("resizable:false — no grip (the width is locked); a drawer ELEMENT is still accepted as in 1.0.1", () => {
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, drawer: { resizable: false } });
    c.openDrawer("base");
    expect(c.elements.container.querySelector(".smc-dgrip")).toBeNull();
    c.destroy();
    const own = document.createElement("div");
    const host = box(); host.appendChild(own);
    const d = mountMapControls(stubMap(), { container: host, catalog, keyboard: false, drawer: own });
    expect(d.elements.drawer).toBe(own);
    d.openDrawer("base");
    expect(own.querySelector(".bm-follow")).toBeTruthy();
    d.destroy();
    expect(own.innerHTML).toBe("");
  });

  it("the stylesheet anchors the drawer with a logical inset and styles the grip", () => {
    const CSS = readFileSync(join(__dirname, "../src/map-controls.css"), "utf8");
    expect(CSS).toMatch(/\.smc \.smc-drawer\{position:absolute;top:9px;inset-inline-end:47px;/);
    expect(CSS).toMatch(/\.smc \.smc-dgrip\{[^}]*cursor:col-resize;touch-action:none/);
  });
});

// ── 3 ─────────────────────────────────────────────────────────────────────────────────────────
describe("3 · setStyle without diffing", () => {
  it("a pick, Follow the theme and a theme swap each call setStyle(style, { diff: false })", () => {
    const map = stubMap();
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false });
    c.setBasemap("vt-colorful");
    expect(map.setStyle).toHaveBeenLastCalledWith(c.styleFor("vt-colorful"), { diff: false });
    c.setBasemap(null);
    c.setTheme("dark");
    expect(map.setStyle).toHaveBeenLastCalledWith(c.styleFor("osm-dark"), { diff: false });
    for (const call of map.setStyle.mock.calls) expect(call[1]).toEqual({ diff: false });
    c.destroy();
  });
});

// ── 4 ─────────────────────────────────────────────────────────────────────────────────────────
describe("4 · transparency: never unset, expressions understood", () => {
  it("scaleOpacity: numbers multiply; k = 1 returns the authored value untouched", () => {
    expect(scaleOpacity(0.5, 0.4)).toBeCloseTo(0.2);
    expect(scaleOpacity(1, 1)).toBe(1);
    const e = ["get", "alpha"];
    expect(scaleOpacity(e, 1)).toBe(e);
  });
  it("a data-driven expression is wrapped [\"*\", expr, k]", () => {
    expect(scaleOpacity(["case", [">", ["get", "n"], 5], 0.9, 0.3], 0.5)).toEqual(["*", ["case", [">", ["get", "n"], 5], 0.9, 0.3], 0.5]);
  });
  it("a zoom interpolate keeps zoom top-level and multiplies its OUTPUT stops (numbers and expressions)", () => {
    expect(scaleOpacity(["interpolate", ["linear"], ["zoom"], 5, 0.2, 10, 0.8], 0.5))
      .toEqual(["interpolate", ["linear"], ["zoom"], 5, 0.1, 10, 0.4]);
    expect(scaleOpacity(["interpolate", ["exponential", 2], ["zoom"], 5, ["get", "a"], 12, 1], 0.5))
      .toEqual(["interpolate", ["exponential", 2], ["zoom"], 5, ["*", ["get", "a"], 0.5], 12, 0.5]);
  });
  it("a zoom step multiplies its outputs; an interpolate on a PROPERTY is simply wrapped", () => {
    expect(scaleOpacity(["step", ["zoom"], 0.3, 8, 0.6, 12, 1], 0.5)).toEqual(["step", ["zoom"], 0.15, 8, 0.3, 12, 0.5]);
    const byProp = ["interpolate", ["linear"], ["get", "pop"], 0, 0.2, 1e6, 0.9];
    expect(scaleOpacity(byProp, 0.5)).toEqual(["*", byProp, 0.5]);
  });
  it("a legacy { stops } function multiplies its stop values", () => {
    expect(scaleOpacity({ stops: [[5, 0.4], [10, 1]] }, 0.5)).toEqual({ stops: [[5, 0.2], [10, 0.5]] });
  });

  it("applyLayerState never writes undefined: an unset line-opacity at 0 % is WRITTEN as its authored 1", () => {
    const map = stubMap({ line: {}, fill: { "fill-opacity": 0.4 } });
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false,
      layers: () => [desc("roads", [{ id: "line", opacity: { "line-opacity": 1 } }]), desc("areas", [{ id: "fill", opacity: { "fill-opacity": 0.4 } }])] });
    c.applyLayerState();
    expect(map.P.line["line-opacity"]).toBe(1);
    expect(map.setPaintProperty.mock.calls.every((call: unknown[]) => call[2] !== undefined)).toBe(true);
    // 60 % transparency on roads, then back to 0 %
    c.openDrawer("layers");
    const slider = () => c.elements.drawer.querySelector('[data-ll-opacity="roads"]') as HTMLInputElement;
    (c.elements.drawer.querySelector('.ll-row[data-ll-id="roads"] [data-ll-act="acts"]') as HTMLElement).click();
    slider().value = "60"; slider().dispatchEvent(new Event("input", { bubbles: true }));
    expect(map.P.line["line-opacity"]).toBeCloseTo(0.4);
    slider().value = "0"; slider().dispatchEvent(new Event("input", { bubbles: true }));
    expect(map.P.line["line-opacity"]).toBe(1);
    expect(map.setPaintProperty.mock.calls.every((call: unknown[]) => call[2] !== undefined)).toBe(true);
    c.destroy();
  });

  it("an expression opacity is faded through the list and RESTORED exactly at 0 %", () => {
    const authored = ["interpolate", ["linear"], ["zoom"], 4, 0.3, 9, 0.9];
    const map = stubMap({ shade: { "fill-opacity": authored } });
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false,
      layers: () => [desc("shade", [{ id: "shade", opacity: { "fill-opacity": authored } }])] });
    c.openDrawer("layers");
    (c.elements.drawer.querySelector('[data-ll-act="acts"]') as HTMLElement).click();
    const s = c.elements.drawer.querySelector("[data-ll-opacity]") as HTMLInputElement;
    s.value = "50"; s.dispatchEvent(new Event("input", { bubbles: true }));
    expect(map.P.shade["fill-opacity"]).toEqual(["interpolate", ["linear"], ["zoom"], 4, 0.15, 9, 0.45]);
    s.value = "0"; s.dispatchEvent(new Event("input", { bubbles: true }));
    expect(map.P.shade["fill-opacity"]).toEqual(authored);
    c.destroy();
  });
});

// ── 5 + 6 ─────────────────────────────────────────────────────────────────────────────────────
describe("5 · layering & credits tokens · 6 · button style bleed", () => {
  const CSS = readFileSync(join(__dirname, "../src/map-controls.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  it("the drawer stacks at var(--smc-z,40), the cluster one above the popup tier (1.0.3); the drawer stops var(--smc-drawer-bottom,44px) above the bottom", () => {
    expect(CSS).toMatch(/\.smc \.smc-ctl\{[^}]*z-index:calc\(var\(--smc-popup-z,calc\(var\(--smc-z,40\) \+ 2\)\) \+ 1\)/);
    expect(CSS).toMatch(/\.smc \.smc-drawer\{[^}]*z-index:var\(--smc-z,40\)/);
    expect(CSS).toMatch(/\.smc \.smc-drawer\{[^}]*max-height:calc\(100% - 9px - var\(--smc-drawer-bottom,44px\)\)/);
    expect(CSS).not.toMatch(/z-index:5\b/);
  });
  it("the button reset is (0,2,1), not zero-specificity — app button rules no longer bleed in", () => {
    expect(CSS).not.toMatch(/:where\([^)]*\) button\{/);
    expect(CSS).toMatch(/\.smc \.smc-ctl button,\.smc \.smc-drawer button,\.smc\.smc-gallery button\{font:inherit;color:inherit;background:none;border:none/);
  });
  it("every package rule that styles a button class is element-qualified so it stays above the reset", () => {
    for (const cls of ["ll-ib", "ll-tool", "ll-techbtn", "ll-mini", "ll-base", "bm-follow", "bm-more", "bm-pick", "tp-x", "tp-btn"]) {
      expect(CSS, cls).toMatch(new RegExp(`\\.smc button\\.${cls}\\{`));
      expect(CSS, cls).not.toMatch(new RegExp(`\\.smc \\.${cls}\\{`));
    }
  });
});

// ── 7 ─────────────────────────────────────────────────────────────────────────────────────────
describe("7 · secondary maps", () => {
  const twoMaps = () => [stubMap({ a: { "fill-opacity": 0.5 }, b: {} }), stubMap({ a: { "fill-opacity": 0.5 }, b: {} })];
  it("a basemap change is ONE setStyle per map (diff:false), and onRestyle is called with each map", () => {
    const [m1, m2] = twoMaps();
    const onRestyle = vi.fn();
    const c = mountMapControls(m1, { container: box(), catalog, keyboard: false, maps: [m2], onRestyle });
    c.setBasemap("vt-gray");
    expect(m1.setStyle).toHaveBeenCalledTimes(1);
    expect(m2.setStyle).toHaveBeenCalledTimes(1);
    expect(m2.setStyle).toHaveBeenCalledWith(c.styleFor("vt-gray"), { diff: false });
    expect(onRestyle.mock.calls.map((x) => x[0])).toEqual([m1, m2]);
    expect(c.getMaps()).toEqual([m1, m2]);
    c.destroy();
    expect(m2.handlers.styledata).toEqual([]);
  });

  it("order / visibility / transparency reach every map; onLayerStateChange reports each list change", () => {
    const [m1, m2] = twoMaps();
    const vis = { on: true };
    const onLayerStateChange = vi.fn();
    const c = mountMapControls(m1, { container: box(), catalog, keyboard: false, maps: [m2], onLayerStateChange,
      layers: () => [desc("A", [{ id: "a", opacity: { "fill-opacity": 0.5 } }], vis), desc("B", [{ id: "b" }])] });
    c.openDrawer("layers");
    const row = (id: string) => c.elements.drawer.querySelector(`.ll-row[data-ll-id="${id}"]`)!;
    (row("A").querySelector('[data-ll-act="eye"]') as HTMLElement).click();
    expect(m1.L.a.visibility).toBe("none");
    expect(m2.L.a.visibility).toBe("none");
    expect(onLayerStateChange).toHaveBeenLastCalledWith({ order: ["A", "B"], opacity: { A: 1, B: 1 }, visible: { A: false, B: true } });
    (row("A").querySelector('[data-ll-act="acts"]') as HTMLElement).click();
    const s = row("A").querySelector("[data-ll-opacity]") as HTMLInputElement;
    s.value = "50"; s.dispatchEvent(new Event("input", { bubbles: true }));
    expect(m1.P.a["fill-opacity"]).toBeCloseTo(0.25);
    expect(m2.P.a["fill-opacity"]).toBeCloseTo(0.25);
    (row("A").querySelector('[data-ll-cmd="down"]') as HTMLElement).click();
    expect(m2.order.indexOf("b")).toBeGreaterThan(m2.order.indexOf("a"));
    expect(onLayerStateChange.mock.calls.at(-1)![0].order).toEqual(["B", "A"]);
    c.destroy();
  });

  it("setSecondaryMaps() swaps them later; applyLayerState(map) still targets one map", () => {
    const [m1, m2] = twoMaps();
    const c = mountMapControls(m1, { container: box(), catalog, keyboard: false, layers: () => [desc("A", [{ id: "a" }])] });
    c.setSecondaryMaps([m2]);
    c.setBasemap("osm-dark");
    expect(m2.setStyle).toHaveBeenCalledTimes(1);
    m2.moveLayer.mockClear(); m1.moveLayer.mockClear();
    c.applyLayerState(m1);
    expect(m1.moveLayer).toHaveBeenCalled();
    expect(m2.moveLayer).not.toHaveBeenCalled();
    c.setSecondaryMaps([]);
    c.setBasemap("osm");
    expect(m2.setStyle).toHaveBeenCalledTimes(1);
    c.destroy();
  });
});

// ── 8 ─────────────────────────────────────────────────────────────────────────────────────────
describe("8 · RTL", () => {
  it("dir=rtl on an ancestor (or opts.dir) marks the container data-smc-dir=rtl; ltr otherwise", () => {
    document.documentElement.setAttribute("dir", "rtl");
    const a = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false });
    expect(a.elements.container.getAttribute("data-smc-dir")).toBe("rtl");
    a.destroy();
    document.documentElement.removeAttribute("dir");
    const b = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false });
    expect(b.elements.container.getAttribute("data-smc-dir")).toBe("ltr");
    b.destroy();
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, dir: "rtl" });
    expect(c.elements.container.getAttribute("data-smc-dir")).toBe("rtl");
    c.destroy();
    expect(c.elements.container.getAttribute("data-smc-dir")).toBeNull();
  });
  it("the stylesheet mirrors: logical insets for the cluster / drawer, and RTL rules for the chevrons", () => {
    const CSS = readFileSync(join(__dirname, "../src/map-controls.css"), "utf8");
    expect(CSS).toMatch(/\.smc \.smc-ctl\{position:absolute;top:9px;inset-inline-end:9px;/);
    expect(CSS).toMatch(/\.smc:is\(\[dir="rtl"\],\[dir="rtl"\] \*,\[data-smc-dir="rtl"\]\) \.ll-ib\[data-ll-act="expand"\]:not\(\[aria-expanded="true"\]\) svg/);
    expect(CSS).toMatch(/\.smc:is\([^)]*\) \.bm-more:not\(\[aria-expanded="true"\]\) svg/);
    expect(CSS).not.toMatch(/text-align:left/);
  });
});

// ── 9 ─────────────────────────────────────────────────────────────────────────────────────────
describe("9 · small API gaps", () => {
  it("getOpenDrawer(), getTheme()", () => {
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, theme: { mode: "dark" }, layers: () => [] });
    expect(c.getOpenDrawer()).toBe(null);
    c.openDrawer("layers"); expect(c.getOpenDrawer()).toBe("layers");
    c.openDrawer("base"); expect(c.getOpenDrawer()).toBe("base");
    expect(c.getTheme()).toBe("dark");
    expect(c.getMode()).toBe("identify");             // getMode() is the TOOL mode
    c.setTheme("light"); expect(c.getTheme()).toBe("light");
    c.destroy();
  });
  it("syncChrome() / refreshChrome() re-sync the Legend button after the app hid its legend itself — without rebuilding", () => {
    let legend = true;
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, onToggleLegend: () => { legend = !legend; }, legendOpen: () => legend });
    const btn = c.elements.cluster.querySelector('[data-act="legend"]')!;
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    legend = false;                                   // the app closed it from its own ✕
    c.syncChrome();
    expect(c.elements.cluster.querySelector('[data-act="legend"]')).toBe(btn);   // same element
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    legend = true; c.refreshChrome();
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    c.destroy();
  });
  it("onFit receives the originating event — shift-click on Home, and the F keydown", () => {
    const onFit = vi.fn();
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, onFit });
    const home = c.elements.cluster.querySelector('[data-act="fit"]') as HTMLElement;
    home.dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: true }));
    expect(onFit.mock.calls[0][0].shiftKey).toBe(true);
    const e = { key: "f", shiftKey: false };
    c.handleKey(e);
    expect(onFit.mock.calls[1][0]).toBe(e);
    c.destroy();
  });
  it("the instance sits on its container (non-enumerable) for browser harnesses, and leaves with destroy()", () => {
    const el = box();
    const c = mountMapControls(stubMap(), { container: el, catalog, keyboard: false });
    expect((el as any).__smc).toBe(c);
    expect(Object.keys(el)).not.toContain("__smc");
    c.destroy();
    expect((el as any).__smc).toBeUndefined();
  });
});

// ── 11 ────────────────────────────────────────────────────────────────────────────────────────
describe("11 · the faint-shading pair: vt-gray ↔ vt-gray-dark", () => {
  it("both are keyless, commercial-ok GL styles that pair with each other", () => {
    for (const id of ["vt-gray", "vt-gray-dark"]) {
      const b: any = catalog.basemapById(id);
      expect(b.style).toMatch(/^https:\/\/tiles\.versatiles\.org\//);
      expect(b.license).toBe("commercial-ok");
    }
    expect((catalog.basemapById("vt-gray") as any).pair).toBe("vt-gray-dark");
    expect((catalog.basemapById("vt-gray-dark") as any).pair).toBe("vt-gray");
  });
  it("Follow the theme swaps vt-gray ↔ vt-gray-dark as GL style URLs (they keep their own glyphs)", () => {
    const map = stubMap();
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, themeBasemaps: { light: "vt-gray", dark: "vt-gray-dark" } });
    expect(c.initialStyle()).toBe((catalog.basemapById("vt-gray") as any).style);
    c.setTheme("dark");
    expect(c.effectiveBasemap()).toBe("vt-gray-dark");
    expect(map.setStyle).toHaveBeenLastCalledWith((catalog.basemapById("vt-gray-dark") as any).style, { diff: false });
    c.setTheme("light");
    expect(map.setStyle).toHaveBeenLastCalledWith((catalog.basemapById("vt-gray") as any).style, { diff: false });
    c.openDrawer("base");
    expect(c.elements.drawer.querySelector(".bm-follow .now")!.textContent).toMatch(/OSM Gray \(VersaTiles\) in light mode/);
    c.destroy();
  });
});
