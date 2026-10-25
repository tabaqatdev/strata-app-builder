/**
 * scale.ts — the optional SCALE BAR of @strata/map-controls. OFF by default: an app turns it on with
 * `mountMapControls(map, { …, scale: true | { units } })`. Fixed bottom-left inside the controls'
 * container (`.smc`), styled by map-controls.css (`.smc .smc-scale`, --smc-* tokens, both themes).
 *
 * It is plain DOM over the map, not a MapLibre control and not a map layer, so `map.setStyle()` (a
 * basemap change) never touches it. It re-measures on every `move` (zoom included) and `resize`.
 *
 * The distance is a rounded "nice" number — 1, 2 or 5 × 10^n — no wider than `maxWidth` pixels:
 *   metric   m below 1 km, else km
 *   imperial ft below 1 mi, else mi
 *   both     metric over imperial, two bars sharing the left edge
 */
import { haversine } from "./tools.js";

/** Which unit lines the scale bar draws. */
export type ScaleUnits = "metric" | "imperial" | "both";
/** `mountMapControls({ scale })` options. */
export interface ScaleBarOptions {
  /** Default "metric". */
  units?: ScaleUnits;
  /** The widest a bar may be, in CSS pixels (default 100). */
  maxWidth?: number;
}
/** One drawn bar: its label, its distance in metres and its width in px. */
export interface ScaleLine { unit: "metric" | "imperial"; label: string; meters: number; width: number }
/** What mountMapControls() exposes as `controls.scale` (null when the scale bar is off). */
export interface ScaleBarHandle {
  element: HTMLElement;
  units(): ScaleUnits;
  setUnits(units: ScaleUnits): void;
  /** Re-measure now (it already does on move / zoom / resize). */
  update(): void;
  /** The bars as last drawn. */
  lines(): ScaleLine[];
  /** Point it at another map (setMap does this). */
  bind(map: any): void;
  destroy(): void;
}

/** Earth's circumference at the equator (m), Web Mercator. */
const EARTH_CIRCUMFERENCE = 2 * Math.PI * 6378137;
const M_PER_FT = 0.3048, FT_PER_MI = 5280;

/** The largest 1 / 2 / 5 × 10^n that is ≤ x (x > 0); 0 for anything else. */
export function niceNumber(x: number): number {
  if (!(x > 0) || !Number.isFinite(x)) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  const f = x / p;
  const d = f >= 5 ? 5 : f >= 2 ? 2 : 1;
  return +(d * p).toPrecision(12);
}

/** Metres per CSS pixel at a latitude and (MapLibre, 512-px tile) zoom. */
export function metersPerPixel(lat: number, zoom: number, tileSize = 512): number {
  return (EARTH_CIRCUMFERENCE * Math.cos((lat * Math.PI) / 180)) / (tileSize * Math.pow(2, zoom));
}

const fmt = (n: number) => String(+n.toPrecision(12));

/** One bar for `maxMeters` across `maxWidth` px: the nice distance, its label and its width. */
export function scaleLine(maxMeters: number, maxWidth: number, unit: "metric" | "imperial"): ScaleLine | null {
  if (!(maxMeters > 0) || !(maxWidth > 0)) return null;
  let meters: number, label: string;
  if (unit === "imperial") {
    const feet = maxMeters / M_PER_FT;
    if (feet >= FT_PER_MI) { const mi = niceNumber(feet / FT_PER_MI); meters = mi * FT_PER_MI * M_PER_FT; label = `${fmt(mi)} mi`; }
    else { const ft = niceNumber(feet); meters = ft * M_PER_FT; label = `${fmt(ft)} ft`; }
  } else if (maxMeters >= 1000) { const km = niceNumber(maxMeters / 1000); meters = km * 1000; label = `${fmt(km)} km`; }
  else { const m = niceNumber(maxMeters); meters = m; label = `${fmt(m)} m`; }
  if (!(meters > 0)) return null;
  return { unit, label, meters, width: Math.round((maxWidth * meters) / maxMeters) };
}

/** The bars for `units` given the ground distance `maxMeters` spanned by `maxWidth` px. */
export function scaleLines(maxMeters: number, maxWidth: number, units: ScaleUnits = "metric"): ScaleLine[] {
  const want: ("metric" | "imperial")[] = units === "both" ? ["metric", "imperial"] : units === "imperial" ? ["imperial"] : ["metric"];
  return want.map((u) => scaleLine(maxMeters, maxWidth, u)).filter((l): l is ScaleLine => !!l);
}

/** Normalise the `scale` option: null = off. */
export function scaleOptions(v: unknown): Required<ScaleBarOptions> | null {
  if (!v) return null;
  const o = (typeof v === "object" ? v : {}) as ScaleBarOptions;
  const units: ScaleUnits = o.units === "imperial" || o.units === "both" ? o.units : "metric";
  const maxWidth = Number.isFinite(o.maxWidth) && (o.maxWidth as number) > 20 ? (o.maxWidth as number) : 100;
  return { units, maxWidth };
}

/**
 * The ground distance (m) that `maxWidth` px span on this map, measured as MapLibre's own
 * ScaleControl does — across the middle of the map with unproject() (right under pitch) — else from
 * the centre latitude and zoom. null when the map cannot say yet.
 */
export function measureMap(map: any, maxWidth: number): number | null {
  if (!map) return null;
  try {
    const box = map.getContainer?.();
    const h = box?.clientHeight;
    if (typeof map.unproject === "function" && h > 0) {
      const y = h / 2;
      const a = map.unproject([0, y]), b = map.unproject([maxWidth, y]);
      if (a && b && Number.isFinite(a.lat) && Number.isFinite(b.lat)) {
        const d = haversine([a.lng, a.lat], [b.lng, b.lat]);
        if (d > 0) return d;
      }
    }
    const c = map.getCenter?.(), z = map.getZoom?.();
    if (c && Number.isFinite(c.lat) && Number.isFinite(z)) return metersPerPixel(c.lat, z) * maxWidth;
  } catch { /* a map mid-teardown */ }
  return null;
}

/** Build the scale bar inside `container` (the `.smc` root). Internal to mountMapControls(). */
export function createScaleBar({ doc, container, map: initialMap, options }: {
  doc: any; container: any; map: any; options: Required<ScaleBarOptions>;
}): ScaleBarHandle {
  const el = doc.createElement("div");
  el.setAttribute("class", "smc-scale");
  el.setAttribute("role", "img");
  container.appendChild(el);
  let units = options.units;
  let map: any = null;
  let drawn: ScaleLine[] = [];
  let destroyed = false;

  function update() {
    if (destroyed) return;
    const max = measureMap(map, options.maxWidth);
    drawn = max ? scaleLines(max, options.maxWidth, units) : [];
    el.setAttribute("data-units", units);
    el.innerHTML = drawn.map((l) => `<div class="smc-scale-line" data-unit="${l.unit}" style="width:${l.width}px"><span>${l.label}</span></div>`).join("");
    if (drawn.length) el.setAttribute("aria-label", `Scale: ${drawn.map((l) => l.label).join(" / ")}`);
    else el.removeAttribute("aria-label");
    el.hidden = !drawn.length;
  }
  const onMove = () => update();
  function bind(m: any) {
    if (map && map !== m) { map.off?.("move", onMove); map.off?.("resize", onMove); map.off?.("load", onMove); }
    const same = map === m;
    map = m ?? null;
    if (map && !same) { map.on?.("move", onMove); map.on?.("resize", onMove); map.on?.("load", onMove); }
    update();
  }
  bind(initialMap);

  return {
    element: el,
    units: () => units,
    setUnits(u: ScaleUnits) { units = u === "imperial" || u === "both" ? u : "metric"; update(); },
    update,
    lines: () => drawn.map((l) => ({ ...l })),
    bind,
    destroy() {
      destroyed = true;
      if (map) { map.off?.("move", onMove); map.off?.("resize", onMove); map.off?.("load", onMove); }
      map = null;
      el.remove ? el.remove() : el.parentNode?.removeChild(el);
    },
  };
}
