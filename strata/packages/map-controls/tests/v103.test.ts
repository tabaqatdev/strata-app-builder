// @vitest-environment jsdom
/**
 * 1.0.3 — the gaps thirty vendored apps found, one describe per item: popups above the drawer, the
 * themed popup card, the theme pair under Recommended, GL-style delegate hosts, the grip's real clamp
 * and its ↑/↓, setDrawerWidth(px, which), the CDP key adapter, Esc one layer at a time, closing
 * MapLibre popups without `_popups`, the GL basemap fallback and refreshLayers() that re-renders only
 * on change.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as catalog from "../src/basemaps";
import {
  mountMapControls, mountBasemapGallery, closeMapPopups, recommendedPlusPair, POPUP_CSS, ensureMapControlsPopupStyles,
  type LayerDescriptor,
} from "../src/map-controls";
// @ts-ignore — plain ESM script, no type declarations
import { cdpKeyParams, cdpAdapters, CDP_KEYS } from "../scripts/conformance.mjs";

/** A stub map whose events can be fired by hand. */
function stubMap(extra: Record<string, unknown> = {}) {
  const handlers: Record<string, Function[]> = {};
  const m: any = {
    handlers,
    fire: (t: string, e: unknown = {}) => { for (const fn of [...(handlers[t] ?? [])]) fn(e); },
    setStyle: vi.fn(), on: vi.fn((t: string, fn: Function) => { (handlers[t] ??= []).push(fn); }),
    off: vi.fn((t: string, fn: Function) => { handlers[t] = (handlers[t] ?? []).filter((f) => f !== fn); }),
    zoomIn: vi.fn(), zoomOut: vi.fn(), resize: vi.fn(),
    getLayer: () => undefined, moveLayer: vi.fn(), getLayoutProperty: () => undefined, setLayoutProperty: vi.fn(),
    getPaintProperty: () => undefined, setPaintProperty: vi.fn(), getCanvas: () => ({ style: {} }),
    ...extra,
  };
  return m;
}
const box = (attrs: Record<string, string> = {}) => {
  const el = document.createElement("div");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
};
const key = (el: Element, k: string, extra: Record<string, unknown> = {}) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...extra }));
const CSS = readFileSync(join(__dirname, "../src/map-controls.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});

// ── 1 · popups above the drawer ──────────────────────────────────────────────────────────────
describe("1 · popups above the drawer", () => {
  it("mount injects ONE popup stylesheet per document with the --smc-popup-z rule (default --smc-z + 2)", () => {
    const a = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false });
    const b = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false });
    const els = document.querySelectorAll("style[data-smc-popup-css]");
    expect(els.length).toBe(1);
    expect(els[0].textContent).toContain(":where(.smc) .maplibregl-popup,:where(.smc) .mapboxgl-popup{z-index:var(--smc-popup-z,calc(var(--smc-z,40) + 2))}");
    a.destroy(); b.destroy();
  });

  it("the z-stack: drawer 40 < popup 42 < cluster + grip 43 (both keyed to --smc-popup-z, so an override moves them together)", () => {
    expect(CSS).toMatch(/\.smc \.smc-drawer\{[^}]*z-index:var\(--smc-z,40\)/);
    const tier = "calc(var(--smc-popup-z,calc(var(--smc-z,40) + 2)) + 1)";
    expect(CSS).toContain(`.smc .smc-ctl{position:absolute;top:9px;inset-inline-end:9px;z-index:${tier};`);
    expect(CSS).toMatch(new RegExp(`\\.smc \\.smc-dgrip\\{[^}]*z-index:${tier.replace(/[()+]/g, "\\$&")}`));
    // resolve the defaults numerically: 40 / 42 / 43
    const z = 40, popup = z + 2;
    expect([z, popup, popup + 1]).toEqual([40, 42, 43]);
  });

  it("placed right AFTER maplibre-gl.css (so it beats MapLibre's card, loses to later app CSS); first in <head> without it", () => {
    document.head.innerHTML = `<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"><style id="app">.x{}</style>`;
    ensureMapControlsPopupStyles(document);
    const kids = [...document.head.children].map((e) => e.getAttribute("id") ?? e.tagName.toLowerCase() + (e.hasAttribute("data-smc-popup-css") ? ":smc" : ""));
    expect(kids).toEqual(["link", "style:smc", "app"]);
    document.head.innerHTML = `<style id="app">.x{}</style>`;
    ensureMapControlsPopupStyles(document);
    expect(document.head.firstElementChild!.hasAttribute("data-smc-popup-css")).toBe(true);
    // an inlined MapLibre copy marked data-maplibre-css counts as the anchor too
    document.head.innerHTML = `<style id="ml" data-maplibre-css>.maplibregl-popup-content{background:#fff}</style><style id="app">.x{}</style>`;
    ensureMapControlsPopupStyles(document);
    expect([...document.head.children].map((e) => e.id || "smc")).toEqual(["ml", "smc", "app"]);
    // the APP's own popup CSS is never the anchor — the themed card must stay BEFORE it and lose to it
    document.head.innerHTML = `<link rel="stylesheet" href="maplibre-gl.css"><style id="app">.maplibregl-popup-content{background:var(--surface)}</style><link id="applink" rel="stylesheet" href="app.css">`;
    ensureMapControlsPopupStyles(document);
    expect([...document.head.children].map((e) => e.id || (e.hasAttribute("data-smc-popup-css") ? "smc" : "link"))).toEqual(["link", "smc", "app", "applink"]);
    document.head.innerHTML = `<style id="app">.maplibregl-popup-content{color:#123}</style>`;
    ensureMapControlsPopupStyles(document);
    expect(document.head.firstElementChild!.hasAttribute("data-smc-popup-css")).toBe(true);
  });

  it("never throws on a DOM stub without <head>", () => {
    expect(ensureMapControlsPopupStyles({ createElement: () => ({}) })).toBeNull();
    expect(ensureMapControlsPopupStyles(null)).toBeNull();
  });
});

// ── 2 · the themed popup card ────────────────────────────────────────────────────────────────
describe("2 · dark-mode popup styling (popupStyles)", () => {
  it("on by default: the container carries data-smc-popups; popupStyles:false leaves it off; destroy() removes it", () => {
    const a = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false });
    expect(a.elements.container.hasAttribute("data-smc-popups")).toBe(true);
    a.destroy();
    expect(a.elements.container.hasAttribute("data-smc-popups")).toBe(false);
    const b = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, popupStyles: false });
    expect(b.elements.container.hasAttribute("data-smc-popups")).toBe(false);
    b.destroy();
  });

  it("the card takes its colours from the --smc-* tokens (which flip with data-smc-mode) — background, text, border, close, tip", () => {
    const BG = "var(--smc-popup-bg,var(--smc-bg,#fff))";
    // 1.0.4: the same token, painted as a one-colour gradient (never an occluder — see v104.test.ts)
    expect(POPUP_CSS).toContain(`background:linear-gradient(${BG},${BG});color:var(--smc-popup-fg,var(--smc-fg,#101418));border:1px solid var(--smc-popup-border,var(--smc-border,#C7CED6))`);
    for (const [anchor, side] of [["top", "bottom"], ["top-left", "bottom"], ["top-right", "bottom"], ["bottom", "top"], ["bottom-left", "top"],
      ["bottom-right", "top"], ["left", "right"], ["right", "left"]]) {
      expect(POPUP_CSS, anchor).toMatch(new RegExp(`\\.maplibregl-popup-anchor-${anchor} \\.maplibregl-popup-tip\\{[^}]*border-${side}-color:${BG.replace(/[()]/g, "\\$&")}`));
    }
    expect(POPUP_CSS).toMatch(/\.maplibregl-popup-close-button\{[^}]*color:inherit/);
    expect(POPUP_CSS).toContain(".maplibregl-popup-content table{color:inherit;font-size:inherit");   // quirks mode
    // the layout maplibre-gl.css would give, for a page without it
    expect(POPUP_CSS).toMatch(/\.maplibregl-popup\{position:absolute;top:0;left:0;display:flex;pointer-events:none/);
    // the dark tokens the card resolves to
    const MAIN = readFileSync(join(__dirname, "../src/map-controls.css"), "utf8");
    expect(MAIN).toMatch(/\.smc\[data-smc-mode="dark"\]\{\s*--smc-d-bg:#12161B;[^}]*--smc-d-fg:#E8EDF2/);
  });

  it("low specificity: every themed rule is :where()-wrapped down to MapLibre's own (class) specificity", () => {
    const rules = POPUP_CSS.split("\n").slice(1);
    for (const r of rules) {
      const selectors = r.slice(0, r.indexOf("{")).split(",");
      for (const s of selectors) expect(s.trim(), s).toMatch(/^:where\(\.smc\[data-smc-popups\]\) \.maplibregl-popup/);
    }
  });

  it("in jsdom the card really resolves the dark tokens (computed colour of the popup content)", () => {
    const st = document.createElement("style");
    st.textContent = readFileSync(join(__dirname, "../src/map-controls.css"), "utf8");
    document.head.appendChild(st);
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, theme: { mode: "dark" } });
    const p = document.createElement("div");
    p.className = "maplibregl-popup maplibregl-popup-anchor-bottom";
    p.innerHTML = `<div class="maplibregl-popup-tip"></div><div class="maplibregl-popup-content"><table><tr><td>x</td></tr></table></div>`;
    c.elements.container.appendChild(p);
    const content = p.querySelector(".maplibregl-popup-content")!;
    const cs = getComputedStyle(content);
    // jsdom resolves the custom-property chain far enough to see the rule matched
    expect(cs.getPropertyValue("position")).toBe("relative");
    expect(c.elements.container.getAttribute("data-smc-mode")).toBe("dark");
    c.destroy();
  });
});

// ── 3 · the theme pair under Recommended ─────────────────────────────────────────────────────
describe("3 · both halves of the theme pair under Recommended", () => {
  it("themeBasemaps vt-gray / vt-gray-dark: vt-gray-dark joins Recommended with no recommendedExtras; the universal 8 is untouched", () => {
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, themeBasemaps: { light: "vt-gray", dark: "vt-gray-dark" } });
    expect(c.recommendedIds().slice(0, 8)).toEqual([...catalog.BASEMAP_RECOMMENDED]);
    expect(c.recommendedIds()).toContain("vt-gray-dark");
    expect(catalog.BASEMAP_RECOMMENDED).not.toContain("vt-gray-dark");
    expect(c.themeBasemap("dark")).toBe("vt-gray-dark");
    expect(c.themeBasemap()).toBe("vt-gray");
    c.openDrawer("base");
    const rec = [...c.elements.drawer.querySelectorAll('[data-section="recommended"] [data-base]')].map((b: any) => b.dataset.base);
    expect(rec).toContain("vt-gray-dark");
    expect(c.elements.drawer.querySelectorAll('[data-base="vt-gray-dark"]').length).toBe(1);   // never twice
    c.destroy();
  });

  it("the default pair (osm / osm-dark) changes nothing; extras still come first and a pair member is not duplicated", () => {
    expect(recommendedPlusPair(catalog, [], ["osm", "osm-dark"])).toEqual([...catalog.BASEMAP_RECOMMENDED]);
    expect(recommendedPlusPair(catalog, ["opentopomap"], ["vt-gray", "carto-dark"])).toEqual([...catalog.recommendedWith(["opentopomap"]), "vt-gray-dark"]);
    expect(recommendedPlusPair(catalog, ["vt-gray-dark"], ["vt-gray", "vt-gray-dark"]).filter((x) => x === "vt-gray-dark").length).toBe(1);
    expect(recommendedPlusPair(catalog, [], ["nope", null])).toEqual([...catalog.BASEMAP_RECOMMENDED]);
  });

  it("mountBasemapGallery follows the same rule", () => {
    const el = box();
    const g = mountBasemapGallery(el, { catalog, themeBasemaps: { light: "vt-muted", dark: "vt-muted-dark" } });
    const rec = [...el.querySelectorAll('[data-section="recommended"] [data-base]')].map((b: any) => b.dataset.base);
    expect(rec.slice(-2)).toEqual(["vt-muted", "vt-muted-dark"]);
    g.destroy();
  });
});

// ── 4 · GL-style delegate hosts ─────────────────────────────────────────────────────────────
describe("4 · BASEMAP_HOSTS covers every host a catalog GL style delegates to", () => {
  const FIX = JSON.parse(readFileSync(join(__dirname, "fixtures/gl-style-delegates.json"), "utf8"));
  it("the recorded fixture has every catalog GL style (re-record it when one is added)", () => {
    const gl = catalog.BASEMAPS.filter((b) => b.style);
    expect(Object.keys(FIX.styles).sort()).toEqual(gl.map((b) => b.id).sort());
    for (const b of gl) expect(FIX.styles[b.id].style, b.id).toBe(b.style);
  });
  it("every delegated URL (tiles, TileJSON + its tiles, glyphs, sprite) passes BASEMAP_HOSTS and is not deny-listed", () => {
    let n = 0;
    for (const [id, s] of Object.entries<any>(FIX.styles)) {
      const urls = catalog.styleDelegateUrls(s, s.tileJson);
      expect(urls.length, id).toBeGreaterThanOrEqual(3);
      for (const u of urls) {
        expect(catalog.BASEMAP_HOSTS.test(u), `${id}: ${u}`).toBe(true);
        expect(catalog.BASEMAP_DENY.test(u), `${id}: ${u}`).toBe(false);
        n++;
      }
    }
    expect(n).toBeGreaterThan(30);
  });
  it("the versatiles tile and sprite paths are admitted, a stray path on the same host is not", () => {
    expect(catalog.BASEMAP_HOSTS.test("https://tiles.versatiles.org/tiles/osm/{z}/{x}/{y}")).toBe(true);
    expect(catalog.BASEMAP_HOSTS.test("https://tiles.versatiles.org/assets/sprites/base")).toBe(true);
    expect(catalog.BASEMAP_HOSTS.test("https://tiles.versatiles.org/somewhere/else")).toBe(false);
    expect(catalog.BASEMAP_HOSTS.test("https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/1/0/0.mvt")).toBe(true);
    expect(catalog.BASEMAP_HOSTS.test("https://tiles-a.basemaps.cartocdn.com/light_all/1/0/0.png")).toBe(false);
  });
  it("CARTO's versioned layout (2026-10) is admitted for tiles, glyphs and sprite only", () => {
    const v = "https://tiles.basemaps.cartocdn.com/v/20261001-03";
    expect(catalog.BASEMAP_HOSTS.test(`${v}/vectortiles/carto.streets/v2/{z}/{x}/{y}.mvt`)).toBe(true);
    expect(catalog.BASEMAP_HOSTS.test(`${v}/fonts/{fontstack}/{range}.pbf`)).toBe(true);
    expect(catalog.BASEMAP_HOSTS.test(`${v}/gl/positron-gl-style/sprite`)).toBe(true);
    expect(catalog.BASEMAP_HOSTS.test(`${v}/light_all/1/0/0.png`)).toBe(false);
    expect(catalog.BASEMAP_HOSTS.test("https://tiles.basemaps.cartocdn.com/v/x/y/somewhere")).toBe(false);
  });
  it("styleDelegateUrls: sources, TileJSON tiles, glyphs, string or array sprite; deduped", () => {
    expect(catalog.styleDelegateUrls({ sources: { a: { url: "https://x/tj", tiles: ["https://x/t"] }, g: { type: "geojson", data: {} } },
      glyphs: "https://x/g", sprite: [{ id: "base", url: "https://x/s" }, { id: "b", url: "https://x/s" }] }, { "https://x/tj": { tiles: ["https://x/t", "https://y/t"] } }))
      .toEqual(["https://x/tj", "https://x/t", "https://y/t", "https://x/g", "https://x/s"]);
    expect(catalog.styleDelegateUrls(null)).toEqual([]);
  });
});

// ── 5 / 6 · the grip ────────────────────────────────────────────────────────────────────────
describe("5 · grip ARIA reflects the real clamp · 6 · grip swallows ↑ / ↓", () => {
  const grip = (c: any) => c.elements.container.querySelector(".smc-dgrip") as HTMLElement;
  it("aria-valuemax = min(maxWidth, container width − 56), re-read on resize; End goes there", () => {
    const container = box();
    let w = 400;
    vi.spyOn(container, "getBoundingClientRect").mockImplementation(() => ({ width: w, height: 600 } as DOMRect));
    const c = mountMapControls(stubMap(), { container, catalog, keyboard: false });
    c.openDrawer("base");
    expect(grip(c).getAttribute("aria-valuemax")).toBe("344");          // 400 − 56
    key(grip(c), "End");
    expect(c.drawerWidth()).toBe(344);
    w = 1200; window.dispatchEvent(new Event("resize"));
    expect(grip(c).getAttribute("aria-valuemax")).toBe("520");          // maxWidth wins
    w = 250; window.dispatchEvent(new Event("resize"));
    expect(grip(c).getAttribute("aria-valuemax")).toBe("260");          // never below minWidth
    c.destroy();
  });

  it("no layout (jsdom without a mocked rect): aria-valuemax is maxWidth, as before", () => {
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, drawer: { maxWidth: 480 } });
    c.openDrawer("layers");
    expect(grip(c).getAttribute("aria-valuemax")).toBe("480");
    c.destroy();
  });

  it("↑ / ↓ on the focused grip are swallowed (default prevented, never reach a window handler); the width is unchanged", () => {
    const appKeys = vi.fn();
    window.addEventListener("keydown", appKeys);
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, drawer: { width: 300 } });
    c.openDrawer("base");
    for (const k of ["ArrowUp", "ArrowDown"]) {
      const e = new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true });
      grip(c).dispatchEvent(e);
      expect(e.defaultPrevented, k).toBe(true);
    }
    expect(appKeys).not.toHaveBeenCalled();
    expect(c.drawerWidth()).toBe(300);
    window.removeEventListener("keydown", appKeys);
    c.destroy();
  });

  it("the grip stays in the map container (where 30 vendored apps' tests look for it), not inside the drawer", () => {
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false });
    expect(grip(c).parentElement).toBe(c.elements.container);
    c.destroy();
  });
});

// ── 7 · setDrawerWidth(px, which) ────────────────────────────────────────────────────────────
describe("7 · setDrawerWidth(px, which?)", () => {
  it("which = 'layers' while the gallery is open sets the LAYER list's width only; 'basemap' aliases 'base'", () => {
    const onDrawerResize = vi.fn();
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, layers: () => [], onDrawerResize });
    c.openDrawer("base");
    expect(c.setDrawerWidth(400, "layers")).toBe(400);
    expect(c.elements.drawer.style.width).toBe("");                     // the open gallery is untouched
    expect(onDrawerResize).toHaveBeenLastCalledWith(400, "layers");
    expect(c.drawerWidth("layers")).toBe(400);
    c.setDrawerWidth(350, "basemap");
    expect(c.elements.drawer.style.width).toBe("350px");                // the open one, by its alias
    c.openDrawer("layers");
    expect(c.elements.drawer.style.width).toBe("400px");
    c.destroy();
  });

  it("no drawer open and no `which`: the width applies to the NEXT drawer that opens (once), and drawerWidth() reports it meanwhile", () => {
    const onDrawerResize = vi.fn();
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, layers: () => [], onDrawerResize });
    expect(c.setDrawerWidth(100)).toBe(260);                            // clamped, as in 1.0.2
    expect(c.setDrawerWidth(333)).toBe(333);
    expect(c.drawerWidth()).toBe(333);
    expect(onDrawerResize).not.toHaveBeenCalled();
    c.openDrawer("layers");
    expect(c.elements.drawer.style.width).toBe("333px");
    expect(onDrawerResize).toHaveBeenLastCalledWith(333, "layers");
    c.closeAll(); c.openDrawer("base");
    expect(c.elements.drawer.style.width).toBe("");                     // consumed by the first one
    c.destroy();
  });

  it("with a drawer open and no `which`, it is the open drawer — exactly as 1.0.2", () => {
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false });
    c.openDrawer("base");
    expect(c.setDrawerWidth(2000)).toBe(520);
    expect(c.elements.drawer.style.width).toBe("520px");
    expect(c.drawerWidth()).toBe(520);
    c.destroy();
  });
});

// ── 8 · the CDP key adapter ─────────────────────────────────────────────────────────────────
describe("8 · conformance cdpKeyParams / cdpAdapters().key()", () => {
  it("non-printing keys carry key, code and windowsVirtualKeyCode — and no text", () => {
    expect(cdpKeyParams("ArrowLeft")).toEqual({ key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37 });
    expect(cdpKeyParams("ArrowUp")).toEqual({ key: "ArrowUp", code: "ArrowUp", windowsVirtualKeyCode: 38 });
    expect(cdpKeyParams("ArrowRight")).toEqual({ key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    expect(cdpKeyParams("ArrowDown")).toEqual({ key: "ArrowDown", code: "ArrowDown", windowsVirtualKeyCode: 40 });
    expect(cdpKeyParams("Home")).toEqual({ key: "Home", code: "Home", windowsVirtualKeyCode: 36 });
    expect(cdpKeyParams("End")).toEqual({ key: "End", code: "End", windowsVirtualKeyCode: 35 });
    expect(cdpKeyParams("Shift")).toEqual({ key: "Shift", code: "ShiftLeft", windowsVirtualKeyCode: 16 });
    for (const k of Object.keys(CDP_KEYS)) expect(cdpKeyParams(k).text, k).toBeUndefined();
    expect(cdpKeyParams("l")).toEqual({ key: "l", code: "KeyL", windowsVirtualKeyCode: 76, text: "l" });
    expect(cdpKeyParams("ArrowLeft", { shift: true })).toMatchObject({ modifiers: 8 });
  });
  it("key() sends rawKeyDown (no text) + keyUp for a non-printing key, keyDown with text for a letter, and holds Shift on request", async () => {
    const sent: any[] = [];
    const { key: press } = cdpAdapters(async (method: string, params: any) => { sent.push({ method, ...params }); return {}; });
    await press("ArrowRight");
    expect(sent.map((s) => [s.type, s.key, s.text])).toEqual([["rawKeyDown", "ArrowRight", undefined], ["keyUp", "ArrowRight", undefined]]);
    sent.length = 0;
    await press("b");
    expect(sent.map((s) => [s.type, s.key, s.text])).toEqual([["keyDown", "b", "b"], ["keyUp", "b", undefined]]);
    sent.length = 0;
    await press("ArrowLeft", { shift: true });
    expect(sent.map((s) => [s.type, s.key, s.modifiers ?? 0])).toEqual([["rawKeyDown", "Shift", 8], ["rawKeyDown", "ArrowLeft", 8], ["keyUp", "ArrowLeft", 8], ["keyUp", "Shift", 0]]);
  });
});

// ── 9 · Esc one layer at a time ─────────────────────────────────────────────────────────────
describe("9 · Esc closes one popup layer at a time; closePopups() still closes all", () => {
  function setup() {
    const map = stubMap();
    const mapBox = box();
    map.getContainer = () => mapBox;
    const remove = vi.fn(() => { map._popups = []; });
    map._popups = [{ isOpen: () => true, remove }];
    let card = true;
    const closePopup = vi.fn(() => { if (!card) return false; card = false; return true; });
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, closePopup });
    return { map, remove, closePopup, c, cardOpen: () => card, reopen: () => { card = true; map._popups = [{ isOpen: () => true, remove }]; } };
  }
  it("Esc #1 closes ONLY the app's popup (closePopup → true stops there); #2 the MapLibre popup; #3 the drawer; #4 is the app's", () => {
    const { c, remove, cardOpen } = setup();
    c.openDrawer("layers");
    expect(c.escape()).toBe(true);
    expect(cardOpen()).toBe(false);
    expect(remove).not.toHaveBeenCalled();           // the map's popup is still open
    expect(c.escape()).toBe(true);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(c.getOpenDrawer()).toBe("layers");
    expect(c.escape()).toBe(true);
    expect(c.getOpenDrawer()).toBe(null);
    expect(c.escape()).toBe(false);
    c.destroy();
  });
  it("closePopup returning false lets the same Esc close the MapLibre popups", () => {
    const map = stubMap(); const mapBox = box(); map.getContainer = () => mapBox;
    const remove = vi.fn(); map._popups = [{ isOpen: () => true, remove }];
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, closePopup: () => false });
    expect(c.escape()).toBe(true);
    expect(remove).toHaveBeenCalledTimes(1);
    c.destroy();
  });
  it("closePopups() (the public API) closes the app's AND the map's popups in one call", () => {
    const { c, remove, cardOpen } = setup();
    expect(c.closePopups()).toBe(true);
    expect(cardOpen()).toBe(false);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(c.closePopups()).toBe(false);
    c.destroy();
  });
  it("a MapLibre popup registered AS closePopup is closed by the first Esc", () => {
    const map = stubMap(); const mapBox = box(); map.getContainer = () => mapBox;
    const popup = { open: true, isOpen() { return this.open; }, remove() { this.open = false; } };
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false,
      closePopup: () => { if (!popup.isOpen()) return false; popup.remove(); return true; } });
    expect(c.escape()).toBe(true);
    expect(popup.open).toBe(false);
    expect(c.escape()).toBe(false);
    c.destroy();
  });
});

// ── 10 · closeMapPopups without map._popups ─────────────────────────────────────────────────
describe("10 · closeMapPopups without map._popups (MapLibre 4.7.1)", () => {
  it("finds popups in the container's DOM and presses their close button (MapLibre's handler)", () => {
    const mapBox = box();
    mapBox.innerHTML = `<div class="maplibregl-popup"><button class="maplibregl-popup-close-button"></button></div>` +
      `<div class="maplibregl-popup"><button class="maplibregl-popup-close-button"></button></div>`;
    const handler = vi.fn(function (this: HTMLElement) { this.closest(".maplibregl-popup")!.remove(); });
    for (const b of mapBox.querySelectorAll("button")) b.addEventListener("click", handler);
    expect(closeMapPopups({ getContainer: () => mapBox } as any)).toBe(2);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(mapBox.querySelector(".maplibregl-popup")).toBeNull();
  });
  it("a close button whose handler does not remove the popup (a stub): the element is taken out anyway, counted once", () => {
    const mapBox = box();
    mapBox.innerHTML = `<div class="maplibregl-popup"><button class="maplibregl-popup-close-button"></button></div>`;
    expect(closeMapPopups({ getContainer: () => mapBox } as any)).toBe(1);
    expect(mapBox.querySelector(".maplibregl-popup")).toBeNull();
  });
  it("a popup already closed through _popups is not counted twice; a throwing getContainer is survived", () => {
    const mapBox = box();
    mapBox.innerHTML = `<div class="maplibregl-popup" id="p"></div>`;
    const m: any = { getContainer: () => mapBox, _popups: [{ remove: () => mapBox.querySelector("#p")!.remove() }] };
    expect(closeMapPopups(m)).toBe(1);
    expect(closeMapPopups({ getContainer: () => { throw new Error("gone"); } } as any)).toBe(0);
  });
});

// ── 11 · the GL basemap fallback ────────────────────────────────────────────────────────────
describe("11 · GL basemap fallback", () => {
  const osmStyle = (c: any, id: string) => JSON.stringify(c.styleFor(id));
  it("a GL pick whose style errors before loading switches ONCE to the theme raster (osm), tells onBasemapFallback, notes it in the gallery", () => {
    const map = stubMap();
    const onBasemapFallback = vi.fn();
    const onError = vi.fn();
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, onBasemapFallback, onError });
    c.setBasemap("vt-gray");
    expect(map.setStyle).toHaveBeenLastCalledWith(catalog.basemapById("vt-gray")!.style, { diff: false });
    map.fire("error", { error: new Error("Failed to fetch") });
    expect(JSON.stringify(map.setStyle.mock.lastCall[0])).toBe(osmStyle(c, "osm"));
    expect(onBasemapFallback).toHaveBeenCalledWith({ from: "vt-gray", to: "osm", reason: "error", message: "Failed to fetch" });
    expect(c.basemapFallback()).toMatchObject({ from: "vt-gray", to: "osm" });
    expect(onError.mock.lastCall[0]).toMatch(/vt-gray.*osm/);
    c.openDrawer("base");
    expect(c.elements.drawer.querySelector(".bm-note")?.textContent).toMatch(/Couldn't load OSM Gray \(VersaTiles\) — showing OpenStreetMap/);
    // ONCE: a second failing GL style is left alone
    c.setBasemap("vt-muted");
    map.fire("error", { error: new Error("again") });
    expect(map.setStyle).toHaveBeenLastCalledWith(catalog.basemapById("vt-muted")!.style, { diff: false });
    expect(onBasemapFallback).toHaveBeenCalledTimes(1);
    expect(c.elements.drawer.querySelector(".bm-note")).toBeNull();     // the new pick cleared the note
    c.destroy();
  });

  it("dark mode falls back to osm-dark; a style that loads first disarms the watch (a later error is ignored)", () => {
    const map = stubMap();
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, theme: { mode: "dark" } });
    c.setBasemap("vt-gray-dark");
    map.fire("style.load");
    map.fire("error", { error: new Error("a tile") });
    expect(c.basemapFallback()).toBeNull();
    c.setBasemap("vt-colorful-dark");
    map.fire("error", {});
    expect(c.basemapFallback()).toMatchObject({ from: "vt-colorful-dark", to: "osm-dark", reason: "error" });
    c.destroy();
  });

  it("the timeout (basemapTimeoutMs) falls back only for a real map whose style really did not load", () => {
    vi.useFakeTimers();
    const map = stubMap({ isStyleLoaded: () => false });
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, basemapTimeoutMs: 1000 });
    c.setBasemap("vt-gray");
    vi.advanceTimersByTime(999);
    expect(c.basemapFallback()).toBeNull();
    vi.advanceTimersByTime(2);
    expect(c.basemapFallback()).toMatchObject({ from: "vt-gray", to: "osm", reason: "timeout" });
    c.destroy();
    // a style parsed in time (MapLibre's own flag) → no fallback even with no event seen
    const m2 = stubMap({ isStyleLoaded: () => false, style: { _loaded: true } });
    const c2 = mountMapControls(m2, { container: box(), catalog, keyboard: false, basemapTimeoutMs: 1000 });
    c2.setBasemap("vt-gray");
    vi.advanceTimersByTime(1500);
    expect(c2.basemapFallback()).toBeNull();
    c2.destroy();
    // a stub without isStyleLoaded gets no timer at all
    const m3 = stubMap();
    const c3 = mountMapControls(m3, { container: box(), catalog, keyboard: false, basemapTimeoutMs: 1000 });
    c3.setBasemap("vt-gray");
    expect(vi.getTimerCount()).toBe(0);
    c3.destroy();
  });

  it("basemapFallback:false, a raster pick, or a basemapHost: no watch, no fallback", () => {
    const map = stubMap();
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, basemapFallback: false });
    c.setBasemap("vt-gray"); map.fire("error", {});
    expect(c.basemapFallback()).toBeNull();
    c.destroy();
    const m2 = stubMap();
    const c2 = mountMapControls(m2, { container: box(), catalog, keyboard: false });
    c2.setBasemap("esri-topo"); m2.fire("error", {});
    expect(c2.basemapFallback()).toBeNull();
    c2.destroy();
    const m3 = stubMap();
    const apply = vi.fn();
    const c3 = mountMapControls(m3, { container: box(), catalog, keyboard: false, basemapHost: { apply } });
    c3.setBasemap("vt-gray"); m3.fire("error", {});
    expect(c3.basemapFallback()).toBeNull();
    expect(m3.setStyle).not.toHaveBeenCalled();
    c3.destroy();
  });

  it("the initial GL style of a map handed to mount (not yet loaded) is watched too", () => {
    const map = stubMap();
    const c = mountMapControls(map, { container: box(), catalog, keyboard: false, initialBasemap: "vt-gray" });
    map.fire("error", { error: { message: "style 404" } });
    expect(c.basemapFallback()).toMatchObject({ from: "vt-gray", to: "osm", message: "style 404" });
    c.destroy();
  });
});

// ── 12 · refreshLayers() re-renders only on change ──────────────────────────────────────────
describe("12 · refreshLayers() skips the re-render when nothing changed", () => {
  it("same HTML → the same DOM nodes (a click in progress survives); a changed `sub` → re-rendered", () => {
    let sub = "3 in view";
    const d = (): LayerDescriptor => ({ id: "a", title: "A", sublayers: [{ id: "a-pt" }], visible: true, setVisible: () => {}, sub } as any);
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false, layers: () => [d()] });
    c.openDrawer("layers");
    const eye = c.elements.drawer.querySelector('[data-ll-act="eye"]');
    c.refreshLayers(); c.refreshLayers();
    expect(c.elements.drawer.querySelector('[data-ll-act="eye"]')).toBe(eye);
    expect(eye!.isConnected).toBe(true);
    sub = "4 in view";
    c.refreshLayers();
    expect(c.elements.drawer.querySelector('[data-ll-act="eye"]')).not.toBe(eye);
    expect(c.elements.drawer.textContent).toContain("4 in view");
    c.destroy();
  });

  it("a transparency drag then a refreshLayers() keeps the same slider element (the drag is not dropped)", () => {
    const c = mountMapControls(stubMap(), { container: box(), catalog, keyboard: false,
      layers: () => [{ id: "a", title: "A", sublayers: [{ id: "a-pt" }], visible: true, setVisible: () => {} } as any] });
    c.openDrawer("layers");
    (c.elements.drawer.querySelector('[data-ll-act="acts"]') as HTMLElement).click();
    const s = c.elements.drawer.querySelector("[data-ll-opacity]") as HTMLInputElement;
    s.value = "40";
    s.dispatchEvent(new Event("input", { bubbles: true }));
    c.refreshLayers();
    expect(c.elements.drawer.querySelector("[data-ll-opacity]")).toBe(s);
    c.destroy();
  });
});
