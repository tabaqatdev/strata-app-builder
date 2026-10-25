// @vitest-environment jsdom
/**
 * scripts/conformance.mjs — the browser conformance an app's own harness runs, unit-tested WITHOUT a
 * browser: the "page" is jsdom with the real controls mounted on a stub map, and the fake
 * `evaluate` simply runs the generated source there. Pass cases prove the checks accept the real
 * DOM; fail cases prove each one can actually fail. (The real-browser proof is
 * `pnpm --filter @strata/map-controls conformance:demo`.)
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import * as catalog from "../src/basemaps";
import { ICONS } from "../src/icons";
import { mountMapControls, type LayerDescriptor } from "../src/map-controls";
// @ts-ignore — plain ESM script, no type declarations
import { runMapControlsConformance, svgSignature, cdpKeyParams, cssAttr, CLUSTER_ORDER, TOOL_ORDER } from "../scripts/conformance.mjs";

function stubMap() {
  return {
    setStyle: vi.fn(), on: vi.fn(), off: vi.fn(), zoomIn: vi.fn(), zoomOut: vi.fn(), resize: vi.fn(),
    getLayer: vi.fn(() => ({})), moveLayer: vi.fn(), getLayoutProperty: vi.fn(), setLayoutProperty: vi.fn(),
    getPaintProperty: vi.fn(), setPaintProperty: vi.fn(), getCanvas: () => ({ style: {} }),
    getCenter: () => ({ lng: 0, lat: 60 }), getZoom: () => 10,
  };
}
const layer = (id: string): LayerDescriptor => {
  let vis = true;
  return { id, title: id.toUpperCase(), sublayers: [{ id: `${id}-pt` }], get visible() { return vis; },
    setVisible: (v: boolean) => { vis = v; }, legend: "<div>legend</div>", zoomTo: () => {} } as any;
};
let controls: any = null;
function mount(opts: Record<string, any> = {}) {
  const box = document.createElement("div");
  document.body.appendChild(box);
  let legend = false;
  controls = mountMapControls(stubMap() as any, { container: box, catalog, initialBasemap: "osm",
    layers: () => [layer("cities"), layer("roads")], onFit: () => {},
    onToggleLegend: () => { legend = !legend; }, legendOpen: () => legend, ...opts });
  return controls;
}
/** The fake harness: run the generated function body in this jsdom "page". */
const evaluate = (src: string) => new Function(src)();
const run = (o: Record<string, any> = {}) => runMapControlsConformance({ evaluate, icons: ICONS, timeout: 400, sleep: () => Promise.resolve(), ...o });
const byName = (r: any, re: RegExp) => r.results.find((x: any) => re.test(x.name));

afterEach(() => { controls?.destroy(); controls = null; document.body.innerHTML = ""; });

describe("runMapControlsConformance — pass", () => {
  it("the real default cluster passes every check (no tools)", async () => {
    mount();
    const r = await run();
    expect(r.results.filter((x: any) => !x.ok)).toEqual([]);
    expect(r.failed).toBe(0);
    expect(r.passed).toBeGreaterThanOrEqual(15);
    // jsdom has no Fullscreen API: the package omits the button and the check says it skipped
    expect(byName(r, /^fullscreen/).detail).toMatch(/skipped/);
  });

  it("all five tools on, declared as enabled — passes, tools in the fixed order", async () => {
    mount({ tools: { search: true, locate: true, measure: true, draw: true, print: true } });
    const r = await run({ tools: { search: true, locate: true, measure: true, draw: true, print: true } });
    expect(r.failed).toBe(0);
    expect(byName(r, /^tools:/).detail).toBe("got [search, locate, measure, draw, print]");
  });

  it("the scale bar on, declared as enabled — passes (metric, imperial, both)", async () => {
    for (const scale of [true, { units: "imperial" }, { units: "both" }]) {
      mount({ scale });
      const r = await run({ expect: { scale } });
      expect(r.results.filter((x: any) => !x.ok)).toEqual([]);
      expect(byName(r, /^scale bar: .smc-scale present/).ok).toBe(true);
      expect(byName(r, /rounded 1 \/ 2 \/ 5/).detail).toBe(
        scale === true ? "2 km" : (scale as any).units === "imperial" ? "2 mi" : "2 km / 2 mi");
      controls.destroy(); controls = null; document.body.innerHTML = "";
    }
  });

  it("no scale bar by default — and the default expectation is 'absent'", async () => {
    mount();
    const r = await run();
    expect(byName(r, /^scale bar: .smc-scale present/)).toMatchObject({ ok: true, detail: "0 .smc-scale element(s)" });
    expect(byName(r, /bottom-left/)).toBeUndefined();
  });

  it("evaluateStyle 'expression' works with a harness that evaluates expressions", async () => {
    mount();
    const r = await run({ evaluate: (src: string) => (0, eval)(src), evaluateStyle: "expression" });
    expect(r.failed).toBe(0);
  });

  it("calls log once per result, and uses the harness's click / key when given", async () => {
    mount();
    const lines: string[] = [], clicks: string[] = [], keys: string[] = [];
    const click = async (sel: string) => { clicks.push(sel); (document.querySelector(sel) as HTMLElement).click(); };
    const key = async (k: string) => { keys.push(k); document.body.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true })); };
    const r = await run({ log: (l: string) => lines.push(l), click, key });
    expect(r.failed).toBe(0);
    expect(lines.length).toBe(r.results.length);
    expect(lines.every((l) => l.includes("✓"))).toBe(true);
    expect(clicks.some((s) => s.includes('[data-ll-act="acts"]'))).toBe(true);
    expect(keys).toEqual(expect.arrayContaining(["l", "b", "Escape"]));
  });

  it("1.0.2 — resets gallery state itself: an open drawer, More expanded, an app on 'none' all still pass, and the basemap is restored", async () => {
    const c = mount({ initialBasemap: "none" });
    c.openDrawer("layers");
    c.state.moreOpen = true;
    const r = await run();
    expect(r.results.filter((x: any) => !x.ok)).toEqual([]);
    expect(byName(r, /collapsed "More basemaps"/).detail).toMatch(/on osm \(the app opened on none\)/);
    expect(c.getBasemap()).toBe("none");               // restored after the check
    expect(c.getOpenDrawer()).toBe(null);
  });

  it("1.0.2 — the drawer grip and credits checks run (credits skip without a laid-out attribution)", async () => {
    mount();
    const r = await run();
    expect(byName(r, /^drawer grip: an ARIA separator/).ok).toBe(true);
    expect(byName(r, /^drawer grip: Home \/ End/).detail).toBe("Home 260 → ArrowLeft 276 → End 520 → ArrowRight 504");
    expect(byName(r, /^credits:/).detail).toMatch(/skipped/);
  });
});

describe("runMapControlsConformance — 1.0.2 fail cases", () => {
  it("a drawer that is not resizable fails the grip check unless declared (expect.resizable:false)", async () => {
    mount({ drawer: { resizable: false } });
    expect(byName(await run(), /^drawer grip/).ok).toBe(false);
    const r = await run({ expect: { resizable: false } });
    expect(byName(r, /^drawer grip: absent/).ok).toBe(true);
  });

  it("an attribution under the open drawer fails the credits check", async () => {
    const c = mount();
    const attrib = document.createElement("div");
    attrib.className = "maplibregl-ctrl-attrib";
    c.elements.container.appendChild(attrib);
    const rect = (l: number, t: number, w: number, h: number) => ({ left: l, top: t, right: l + w, bottom: t + h, width: w, height: h, x: l, y: t, toJSON() {} });
    attrib.getBoundingClientRect = () => rect(600, 560, 300, 20) as any;
    c.elements.drawer.getBoundingClientRect = () => rect(560, 9, 320, 580) as any;
    c.elements.cluster.getBoundingClientRect = () => rect(900, 9, 32, 230) as any;
    const r = await run();
    expect(byName(r, /^credits:/)).toMatchObject({ ok: false, detail: expect.stringMatching(/covered by drawer \(base\)/) });
  });
});

describe("runMapControlsConformance — fail", () => {
  it("no cluster on the page fails, and stops early", async () => {
    const r = await run();
    expect(r.failed).toBe(1);
    expect(r.results.length).toBe(1);
    expect(r.results[0].name).toMatch(/exactly one/);
  });

  it("two clusters fail 'exactly one'", async () => {
    mount();
    const second = document.createElement("div");
    document.body.appendChild(second);
    const c2 = mountMapControls(stubMap() as any, { container: second, catalog, keyboard: false });
    const r = await run();
    expect(byName(r, /exactly one/).ok).toBe(false);
    c2.destroy();
  });

  it("a missing legend toggle breaks the fixed order", async () => {
    mount({ onToggleLegend: undefined, legendOpen: undefined });
    const r = await run();
    const o = byName(r, /fixed order/);
    expect(o.ok).toBe(false);
    expect(o.detail).toMatch(/got \[zin, zout, fit, layers, base\]/);
  });

  it("tools enabled but not declared (and vice versa) fail the tools check", async () => {
    mount({ tools: { measure: true } });
    expect(byName(await run(), /^tools:/).ok).toBe(false);
    expect(byName(await run({ tools: { measure: true } }), /^tools:/).ok).toBe(true);
    expect(byName(await run({ tools: { measure: true, print: true } }), /^tools:/).ok).toBe(false);
  });

  it("a scale bar enabled but not declared (and vice versa) fails; wrong units fail", async () => {
    mount({ scale: true });
    expect(byName(await run(), /^scale bar: .smc-scale present/).ok).toBe(false);
    expect(byName(await run({ expect: { scale: { units: "both" } } }), /rounded/).ok).toBe(false);
    controls.destroy(); document.body.innerHTML = "";
    mount();
    const r = await run({ expect: { scale: true } });
    expect(byName(r, /^scale bar: .smc-scale present/).ok).toBe(false);
  });

  it("a scale bar label that is not a nice distance fails", async () => {
    mount({ scale: true });
    // the bar re-renders on move only — the stub map never moves, so a tampered label stays
    document.querySelector(".smc-scale-line span")!.textContent = "3.7 km";
    const r = await run({ expect: { scale: true } });
    expect(byName(r, /rounded/).ok).toBe(false);
    expect(byName(r, /rounded/).detail).toMatch(/not a nice metric distance/);
  });

  it("a foreign icon fails the icon check", async () => {
    mount();
    document.querySelector('.smc-ctl [data-act="base"]')!.innerHTML = ICONS.layers;   // wrong glyph
    const r = await run();
    const i = byName(r, /^icons:/);
    expect(i.ok).toBe(false);
    expect(i.detail).toMatch(/base: glyph is not ICONS\.basemap/);
  });

  it("a non-package SVG (no .smc-i) fails even without the ICONS map", async () => {
    mount();
    document.querySelector('.smc-ctl [data-act="zin"]')!.innerHTML = '<svg viewBox="0 0 16 16"><path d="M0 0h16"/></svg>';
    const i = byName(await run({ icons: null }), /^icons:/);
    expect(i.ok).toBe(false);
    expect(i.detail).toMatch(/zin: not one svg\.smc-i/);
  });

  it("drawers that never open fail the drawer checks", async () => {
    mount({ keyboard: false });                          // the shortcuts are off: L / B do nothing
    const r = await run();
    expect(byName(r, /L opens/).ok).toBe(false);
    expect(byName(r, /B opens/).ok).toBe(false);
  });

  it("a layer row without the '…' actions fails the row checks; minLayers is enforced", async () => {
    mount({ layers: () => [] });
    const r = await run({ expect: { minLayers: 1 } });
    expect(byName(r, /^layers: rows/).ok).toBe(false);
    controls.destroy(); document.body.innerHTML = "";
    mount();
    // every render of the list loses its "…" buttons
    const strip = () => document.querySelectorAll('[data-ll-act="acts"]').forEach((b) => b.remove());
    const obs = new MutationObserver(strip);
    obs.observe(document.body, { childList: true, subtree: true });
    const r2 = await run();
    obs.disconnect();
    expect(byName(r2, /has an eye/).ok).toBe(false);
    expect(byName(r2, /opens an inline actions section/).ok).toBe(false);
  });
});

describe("conformance helpers", () => {
  it("svgSignature ignores serialisation (self-closing vs closed tags, attribute order, spacing)", () => {
    expect(svgSignature('<svg a="1"><path d="M5 12h14"/><rect x="1" y="2"/></svg>'))
      .toBe(svgSignature('<svg><path d="M5  12h14"></path><rect y="2" x="1"></rect></svg>'));
    expect(svgSignature(ICONS.zoomIn)).not.toBe(svgSignature(ICONS.zoomOut));
  });

  it("the exported orders are the package's fixed orders", () => {
    expect(CLUSTER_ORDER).toEqual(["zin", "zout", "fit", "layers", "base", "legend", "fullscreen"]);
    expect(TOOL_ORDER).toEqual(["search", "locate", "measure", "draw", "print"]);
  });

  it("cdpKeyParams / cssAttr", () => {
    expect(cdpKeyParams("Escape")).toEqual({ key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    expect(cdpKeyParams("l")).toEqual({ key: "l", code: "KeyL", windowsVirtualKeyCode: 76, text: "l" });
    expect(cssAttr('a"b\\c')).toBe('a\\"b\\\\c');
  });

  it("1.0.3: the theme-pair check passes for a vt-gray / vt-gray-dark app with NO recommendedExtras — and no OSM detour", async () => {
    mount({ initialBasemap: undefined, themeBasemaps: { light: "vt-gray", dark: "vt-gray-dark" } });
    const r = await run();
    expect(byName(r, /theme pair are under Recommended/)).toMatchObject({ ok: true, detail: "pair vt-gray / vt-gray-dark" });
    expect(byName(r, /collapsed "More basemaps"/).detail).not.toMatch(/the app opened on/);
    expect(r.failed).toBe(0);
  });

  it("1.0.3: the theme-pair check fails when a pair member is missing from Recommended", async () => {
    mount({ themeBasemaps: { light: "vt-gray", dark: "vt-gray-dark" } });
    // fake a pre-1.0.3 gallery: the vt-gray-dark card is not under Recommended
    const r0 = await run({ evaluate: (src: string) => { document.querySelectorAll('[data-section="recommended"] [data-base="vt-gray-dark"]').forEach((e) => e.remove()); return new Function(src)(); } });
    expect(byName(r0, /theme pair are under Recommended/)).toMatchObject({ ok: false, detail: "not under Recommended: vt-gray-dark" });
  });

  it("throws only when evaluate is missing", async () => {
    await expect(runMapControlsConformance({} as any)).rejects.toThrow(/evaluate/);
  });
});
