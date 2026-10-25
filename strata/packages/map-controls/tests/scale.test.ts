// @vitest-environment jsdom
/**
 * The optional SCALE BAR (src/scale.ts): OFF by default, `scale: true` = metric, `{ units }` =
 * metric / imperial / both; the nice-number maths at a few latitudes and zooms (high latitude
 * included); it re-measures on move / zoom, survives setStyle and setMap, and destroy() removes it.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as catalog from "../src/basemaps";
import { mountMapControls } from "../src/map-controls";
import { niceNumber, metersPerPixel, scaleLine, scaleLines, scaleOptions, measureMap } from "../src/scale";

/** A stub map with a working event registry, a centre and a zoom. */
function stubMap(center = { lng: 0, lat: 0 }, zoom = 0) {
  const handlers: Record<string, Function[]> = {};
  const m: any = {
    center, zoom,
    on: vi.fn((t: string, fn: Function) => { (handlers[t] ??= []).push(fn); }),
    off: vi.fn((t: string, fn: Function) => { handlers[t] = (handlers[t] ?? []).filter((f) => f !== fn); }),
    emit: (t: string) => (handlers[t] ?? []).forEach((f) => f()),
    count: (t: string) => (handlers[t] ?? []).length,
    getCenter: () => m.center, getZoom: () => m.zoom,
    jumpTo: (o: any) => { if (o.center) m.center = o.center; if (o.zoom != null) m.zoom = o.zoom; m.emit("move"); },
    setStyle: vi.fn(() => { m.emit("styledata"); }),
    zoomIn: vi.fn(), zoomOut: vi.fn(), resize: vi.fn(), getLayer: vi.fn(), moveLayer: vi.fn(),
    getLayoutProperty: vi.fn(), setLayoutProperty: vi.fn(), getPaintProperty: vi.fn(), setPaintProperty: vi.fn(),
  };
  return m;
}
const box = () => { const el = document.createElement("div"); document.body.appendChild(el); return el; };
const mount = (map: any, extra: Record<string, any> = {}) =>
  mountMapControls(map, { container: box(), catalog, keyboard: false, ...extra });
const labels = () => [...document.querySelectorAll(".smc-scale .smc-scale-line")].map((e) => e.textContent);
afterEach(() => { document.body.innerHTML = ""; });

describe("the maths", () => {
  it("niceNumber is the largest 1 / 2 / 5 × 10^n not above x", () => {
    expect([1, 1.9, 2, 4.99, 5, 9.99, 10, 38.2, 7827, 0.074, 0.3].map(niceNumber)).toEqual([1, 1, 2, 2, 5, 5, 10, 20, 5000, 0.05, 0.2]);
    expect([0, -3, NaN, Infinity].map(niceNumber)).toEqual([0, 0, 0, 0]);
  });

  it("metersPerPixel: 512-px tiles, halves per zoom, shrinks with cos(latitude)", () => {
    expect(metersPerPixel(0, 0)).toBeCloseTo(78271.517, 2);
    expect(metersPerPixel(0, 1)).toBeCloseTo(78271.517 / 2, 2);
    expect(metersPerPixel(60, 0)).toBeCloseTo(78271.517 / 2, 2);
  });

  it("equator z0: 5000 km over 64 px; metric switches to m below 1 km", () => {
    const max = metersPerPixel(0, 0) * 100;
    expect(scaleLine(max, 100, "metric")).toMatchObject({ label: "5000 km", meters: 5_000_000, width: 64 });
    expect(scaleLine(999, 100, "metric")).toMatchObject({ label: "500 m", width: 50 });
    expect(scaleLine(1000, 100, "metric")).toMatchObject({ label: "1 km", width: 100 });
  });

  it("60°N z10: 2 km (52 px) and 2 mi (84 px)", () => {
    const max = metersPerPixel(60, 10) * 100;          // ≈ 3822 m
    expect(scaleLine(max, 100, "metric")).toMatchObject({ label: "2 km", width: 52 });
    expect(scaleLine(max, 100, "imperial")).toMatchObject({ label: "2 mi", width: 84 });
  });

  it("high latitude — 80°N z15: 20 m and 100 ft", () => {
    const max = metersPerPixel(80, 15) * 100;          // ≈ 41.5 m
    expect(scaleLine(max, 100, "metric")).toMatchObject({ label: "20 m", width: 48 });
    expect(scaleLine(max, 100, "imperial")).toMatchObject({ label: "100 ft", width: 73 });
  });

  it("street level — equator z20: 5 m and 20 ft; feet switch to miles at 5280 ft", () => {
    const max = metersPerPixel(0, 20) * 100;           // ≈ 7.46 m
    expect(scaleLine(max, 100, "metric")!.label).toBe("5 m");
    expect(scaleLine(max, 100, "imperial")!.label).toBe("20 ft");
    expect(scaleLine(5279 * 0.3048, 100, "imperial")!.label).toBe("5000 ft");
    expect(scaleLine(5280 * 0.3048, 100, "imperial")!.label).toBe("1 mi");
  });

  it("scaleLines: metric, imperial or both (metric first); widths never exceed maxWidth", () => {
    expect(scaleLines(3822, 100).map((l) => l.unit)).toEqual(["metric"]);
    expect(scaleLines(3822, 100, "imperial").map((l) => l.unit)).toEqual(["imperial"]);
    expect(scaleLines(3822, 100, "both").map((l) => l.label)).toEqual(["2 km", "2 mi"]);
    for (let z = 0; z <= 22; z += 0.7) for (const lat of [0, 45, 70, 84])
      for (const l of scaleLines(metersPerPixel(lat, z) * 100, 100, "both")) {
        expect(l.width).toBeLessThanOrEqual(100);
        expect(l.width).toBeGreaterThanOrEqual(39);       // a 1/2/5 step is never below max / 2.5
      }
    expect(scaleLines(0, 100)).toEqual([]);
  });

  it("scaleOptions: off for falsy, true = metric, unknown units fall back to metric", () => {
    expect(scaleOptions(undefined)).toBeNull();
    expect(scaleOptions(false)).toBeNull();
    expect(scaleOptions(true)).toEqual({ units: "metric", maxWidth: 100 });
    expect(scaleOptions({ units: "both" })).toEqual({ units: "both", maxWidth: 100 });
    expect(scaleOptions({ units: "nautical" as any })).toEqual({ units: "metric", maxWidth: 100 });
  });

  it("measureMap measures across the middle with unproject() when the map can, else centre + zoom", () => {
    // 1 px = 0.001° of longitude at the equator → 100 px ≈ 11.12 km
    const m = { getContainer: () => ({ clientHeight: 400 }), unproject: ([x]: number[]) => ({ lng: x * 0.001, lat: 0 }) };
    expect(measureMap(m, 100)).toBeCloseTo(11119.5, 0);
    expect(measureMap(stubMap({ lng: 0, lat: 60 }, 10), 100)).toBeCloseTo(metersPerPixel(60, 10) * 100, 6);
    expect(measureMap(null, 100)).toBeNull();
    expect(measureMap({}, 100)).toBeNull();
  });
});

describe("mountMapControls({ scale })", () => {
  it("is OFF by default: no .smc-scale, no move listener, controls.scale null", () => {
    const map = stubMap();
    const c = mount(map);
    expect(document.querySelector(".smc-scale")).toBeNull();
    expect(c.scale).toBeNull();
    expect(map.count("move")).toBe(0);
    for (const v of [false, null]) {
      const c2 = mount(stubMap(), { scale: v });
      expect(c2.scale).toBeNull();
      c2.destroy();
    }
    expect(document.querySelector(".smc-scale")).toBeNull();
    c.destroy();
  });

  it("true = one metric bar, inside the .smc container, outside the cluster", () => {
    const c = mount(stubMap({ lng: 0, lat: 60 }, 10), { scale: true });
    const el = document.querySelector(".smc-scale") as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.parentElement).toBe(c.elements.container);
    expect(el.closest(".smc")).toBe(c.elements.container);
    expect(el.closest(".smc-ctl")).toBeNull();
    expect(labels()).toEqual(["2 km"]);
    expect((el.querySelector(".smc-scale-line") as HTMLElement).style.width).toBe("52px");
    expect(el.getAttribute("aria-label")).toBe("Scale: 2 km");
    expect(el.dataset.units).toBe("metric");
    expect(c.scale!.units()).toBe("metric");
    c.destroy();
  });

  it("{ units: 'imperial' } and { units: 'both' }", () => {
    const a = mount(stubMap({ lng: 0, lat: 60 }, 10), { scale: { units: "imperial" } });
    expect(labels()).toEqual(["2 mi"]);
    a.destroy();
    const b = mount(stubMap({ lng: 0, lat: 60 }, 10), { scale: { units: "both" } });
    expect(labels()).toEqual(["2 km", "2 mi"]);
    expect([...document.querySelectorAll(".smc-scale-line")].map((e) => (e as HTMLElement).dataset.unit)).toEqual(["metric", "imperial"]);
    b.scale!.setUnits("metric");
    expect(labels()).toEqual(["2 km"]);
    b.destroy();
  });

  it("re-measures on move / zoom", () => {
    const map = stubMap({ lng: 0, lat: 0 }, 0);
    const c = mount(map, { scale: true });
    expect(labels()).toEqual(["5000 km"]);
    map.jumpTo({ zoom: 20 });
    expect(labels()).toEqual(["5 m"]);
    map.jumpTo({ center: { lng: 0, lat: 80 }, zoom: 15 });
    expect(labels()).toEqual(["20 m"]);
    map.zoom = 10; map.center = { lng: 0, lat: 60 }; map.emit("resize");
    expect(labels()).toEqual(["2 km"]);
    c.destroy();
  });

  it("survives setStyle (a basemap change) — still there, still updating", () => {
    const map = stubMap({ lng: 0, lat: 60 }, 10);
    const c = mount(map, { scale: true });
    c.setBasemap("osm-dark");
    expect(map.setStyle).toHaveBeenCalled();
    expect(document.querySelectorAll(".smc-scale")).toHaveLength(1);
    expect(labels()).toEqual(["2 km"]);
    map.jumpTo({ zoom: 11 });
    expect(labels()).toEqual(["1 km"]);
    c.destroy();
  });

  it("a map given later (setMap) is measured and followed; the old one is let go", () => {
    const c = mount(null, { scale: true });
    const el = document.querySelector(".smc-scale") as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.hidden).toBe(true);                     // nothing to measure yet
    const m1 = stubMap({ lng: 0, lat: 60 }, 10);
    c.setMap(m1);
    expect(el.hidden).toBe(false);
    expect(labels()).toEqual(["2 km"]);
    const m2 = stubMap({ lng: 0, lat: 0 }, 0);
    c.setMap(m2);
    expect(labels()).toEqual(["5000 km"]);
    expect(m1.count("move")).toBe(0);
    m1.jumpTo({ zoom: 3 });
    expect(labels()).toEqual(["5000 km"]);
    c.destroy();
  });

  it("destroy() removes the element and every listener", () => {
    const map = stubMap({ lng: 0, lat: 60 }, 10);
    const c = mount(map, { scale: { units: "both" } });
    expect(map.count("move")).toBe(1);
    c.destroy();
    expect(document.querySelector(".smc-scale")).toBeNull();
    expect(map.count("move")).toBe(0);
    expect(map.count("resize")).toBe(0);
  });

  it("the stylesheet scopes it under .smc, bottom-left, on --smc-* tokens", () => {
    const css = readFileSync(join(__dirname, "..", "src", "map-controls.css"), "utf8");
    const rule = css.match(/\.smc \.smc-scale\{[^}]*\}/)?.[0] ?? "";
    expect(rule).toMatch(/position:absolute/);
    expect(rule).toMatch(/left:10px/);
    expect(rule).toMatch(/bottom:10px/);
    expect(rule).toMatch(/var\(--smc-fg\)/);
    expect(css).toMatch(/\.smc \.smc-scale-line\{[^}]*var\(--smc-panel\)/);
  });
});
