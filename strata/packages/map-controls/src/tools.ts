/**
 * tools — the OPTIONAL map tools of mountMapControls() (map-controls.ts): search, locate, measure, draw, print.
 *
 * Every tool is OFF unless the app asks for it. An app that passes no `tools` gets no buttons, no
 * listeners, no map sources and no network calls from this file. Enable per app:
 *
 *   mountMapControls(map, { …, tools: {
 *     search:  true | { provider: async (q) => [{ label, lng, lat, bbox?: [w, s, e, n] }],
 *                       attribution?: "text", placeholder?: "Search places" },
 *     locate:  true | { title? },
 *     measure: true | { units?: "metric" | "imperial" },
 *     draw:    true | { filename?: "drawing.geojson" },
 *     print:   true | { title?: "My map", filename?: "map.png" },
 *   }, interaction: { setMode(mode) } });
 *   (A legacy `{ onClick({ map, controls }) }` value still makes a plain custom button.)
 *
 * The buttons form a SECOND group in the cluster, after the default set, always in the order
 * search, locate, measure, draw, print.
 *
 * Interaction modes. The map is in "identify" mode unless Measure or Draw is open; those two own
 * map clicks while they are. The app's own click handlers must ask `controls.isBusy()` (true while
 * a tool owns clicks) and do nothing then; `interaction.setMode(mode)` is told every change
 * ("identify" | "measure" | "draw"). One tool panel at a time: opening another tool, opening the
 * Layers / Basemap drawer, Esc, or the panel's close button ends the active tool and reverts to
 * identify. No global keyboard shortcuts are added: Enter (finish) and Delete (draw: remove the
 * selected shape) are listened for only WHILE Measure or Draw is open.
 *
 * Graphics live in GeoJSON sources prefixed `smc-` and are re-added after a basemap change (the
 * module's restyle path calls restyle(), and raise() after applyLayerState keeps them on top).
 *
 * Print captures the WebGL canvas inside a `render` event (map.once("render") + triggerRepaint),
 * while the drawing buffer is still valid — so the map does NOT need preserveDrawingBuffer. If an
 * app's map renders on demand only and never fires that render, the capture falls back after 3 s;
 * an app that wants a guaranteed capture in that case may create its map with
 * preserveDrawingBuffer: true.
 */

// ── types ────────────────────────────────────────────────────────────────────────────────────
/** [lng, lat] in degrees (EPSG:4326). */
export type LngLat = [number, number];
export type ToolName = "search" | "locate" | "measure" | "draw" | "print";
/** "identify" unless Measure or Draw owns map clicks. */
export type InteractionMode = "identify" | "measure" | "draw";
export type MeasureUnits = "metric" | "imperial";
/** One geocoder hit. bbox = [west, south, east, north]. */
export interface SearchResult { label: string; lng: number; lat: number; bbox?: [number, number, number, number] }
/** A geocoder: query → results. */
export type SearchProvider = (q: string) => Promise<SearchResult[]>;
/** A minimal fetch: a SIMPLE GET (no custom headers). */
export type FetchLike = (input: string, init?: { signal?: AbortSignal }) => Promise<any>;
/** The legacy placeholder hook: any tool value with an onClick renders as a plain custom button. */
export interface CustomToolButton { onClick: (args: { map: any; controls: any }) => void; title?: string }
export interface SearchToolOptions {
  /** Default: the keyless Photon geocoder (OpenStreetMap data). */
  provider?: SearchProvider;
  /** Credit line under the results (Photon's is used when no provider is given). */
  attribution?: string;
  placeholder?: string;
  title?: string;
}
export interface LocateToolOptions { title?: string }
export interface MeasureToolOptions { units?: MeasureUnits; title?: string }
export interface DrawToolOptions { filename?: string; title?: string }
export interface PrintToolOptions { title?: string; filename?: string }
/** Every tool is OFF unless set here. `true` = defaults. */
export interface ToolsOptions {
  search?: boolean | SearchToolOptions | CustomToolButton;
  locate?: boolean | LocateToolOptions | CustomToolButton;
  measure?: boolean | MeasureToolOptions | CustomToolButton;
  draw?: boolean | DrawToolOptions | CustomToolButton;
  print?: boolean | PrintToolOptions | CustomToolButton;
}
/** Told every interaction-mode change. */
export interface InteractionHook { setMode?(mode: InteractionMode): void }
/** A download seam (tests and apps may override the default <a download>). */
export type DownloadFn = (filename: string, payload: { text?: string; type?: string; dataUrl?: string | null }) => void;
export interface GeolocationLike {
  getCurrentPosition(ok: (pos: any) => void, err?: (e: any) => void, opts?: any): void;
}
/** What mountMapControls() hands createTools(). */
export interface ToolsContext {
  getMap: () => any;
  container: any;
  config?: ToolsOptions | null;
  esc: (s: unknown) => string;
  icons: Readonly<Record<string, string>>;
  doc: any;
  closeDrawer?: () => void;
  onError?: (message: string) => void;
  interaction?: InteractionHook;
  fetch: FetchLike;
  download?: DownloadFn;
  geolocation?: GeolocationLike;
  isSecureContext?: boolean;
  title?: string;
}
/** A GeoJSON FeatureCollection (loosely typed — no @types/geojson dependency). */
export interface FeatureCollectionLike { type: "FeatureCollection"; features: any[] }
/** The tool handles (controls.tools). */
export interface ToolsHandle {
  enabled: ToolName[];
  buttonsHtml(): string;
  sync(): void;
  click(tool: string, controls: unknown): unknown;
  attach(cluster: any): void;
  isBusy(): boolean;
  getMode(): InteractionMode;
  /** "identify" ends Measure / Draw; "measure" / "draw" opens that tool (if enabled). */
  setMode(mode: InteractionMode | string): boolean;
  active(): ToolName | null;
  open(tool: ToolName | string): boolean;
  close(opts?: { focus?: boolean }): boolean;
  escape(): boolean;
  restyle(): void;
  raise(): void;
  /** The tool-graphics layer ids currently on the map, bottom → top (what raise() lifts). */
  layerIds(): string[];
  destroy(): void;
  locate(): Promise<boolean>;
  print(): Promise<string | null>;
  toGeoJSON(): FeatureCollectionLike;
  exportGeoJSON(): string | null;
  measure: { kind: "distance" | "area"; units: MeasureUnits; pts: LngLat[]; px: any[]; cursor: LngLat | null; done: boolean };
  measureValues(): { coords: LngLat[]; length?: number; area?: number; perimeter?: number };
  draw: { kind: "point" | "line" | "polygon" | "select"; features: any[]; sketch: LngLat[]; px: any[]; cursor: LngLat | null; selected: number | null; next: number };
  search: { timer: any; seq: number; results: SearchResult[]; active: number; last: Promise<void> | null };
  searchNow(q: string): Promise<void>;
  readonly panelEl: any;
  readonly toastEl: any;
}

export const TOOL_ORDER: readonly ToolName[] = ["search", "locate", "measure", "draw", "print"];
export const TOOL_TITLE: Record<ToolName, string> = { search: "Search places", locate: "Find my location", measure: "Measure", draw: "Draw", print: "Print map (PNG)" };
const PANEL_TOOLS = new Set(["search", "measure", "draw"]);
const MODE_TOOLS = new Set(["measure", "draw"]);

// ── geodesy (spherical earth, IUGG mean radius) ──────────────────────────────────────────────
export const EARTH_RADIUS = 6371008.8;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
/** Great-circle distance in metres between [lng, lat] positions (haversine). */
export function haversine(a: LngLat | number[], b: LngLat | number[]): number {
  const dφ = rad(b[1] - a[1]), dλ = rad(b[0] - a[0]);
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dλ / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(h)));
}
/** Length in metres of a polyline of [lng, lat]. */
export function pathLength(coords: ReadonlyArray<LngLat | number[]>): number {
  let s = 0;
  for (let i = 1; i < coords.length; i++) s += haversine(coords[i - 1], coords[i]);
  return s;
}
/** Area in m² of a ring of [lng, lat] on the sphere (open or closed). Spherical-excess line
 *  integral (Chamberlain & Duquette 2007): exact for edges along parallels and meridians. */
export function ringArea(ring: ReadonlyArray<LngLat | number[]>): number {
  const pts = ring.length > 1 && ring[0][0] === ring.at(-1)![0] && ring[0][1] === ring.at(-1)![1] ? ring.slice(0, -1) : ring;
  if (pts.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % pts.length];
    s += rad(p2[0] - p1[0]) * (2 + Math.sin(rad(p1[1])) + Math.sin(rad(p2[1])));
  }
  return Math.abs((s * EARTH_RADIUS * EARTH_RADIUS) / 2);
}
/** The point `dist` metres from [lng, lat] on bearing `brg` degrees. */
export function destination([lng, lat]: LngLat | number[], dist: number, brg: number): LngLat {
  const δ = dist / EARTH_RADIUS, θ = rad(brg), φ1 = rad(lat), λ1 = rad(lng);
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return [((deg(λ2) + 540) % 360) - 180, deg(φ2)];
}
/** A closed ring approximating a geodesic circle. */
export function circleRing(center: LngLat | number[], radius: number, n = 64): LngLat[] {
  const ring: LngLat[] = [];
  for (let i = 0; i < n; i++) ring.push(destination(center, radius, (360 * i) / n));
  ring.push(ring[0]);
  return ring;
}
const nf = (v: number, d: number) => v.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: 0 });
/** "1.23 km" / "0.76 mi" — metric or imperial. */
export function formatLength(m: number, units: MeasureUnits | string = "metric"): string {
  if (units === "imperial") {
    const mi = m / 1609.344;
    return mi < 0.1 ? `${nf(m * 3.280839895, 0)} ft` : `${nf(mi, mi < 100 ? 2 : 1)} mi`;
  }
  return m < 1000 ? `${nf(m, m < 10 ? 1 : 0)} m` : `${nf(m / 1000, m < 100000 ? 2 : 1)} km`;
}
/** "12.3 km²" / "3.04 ac" — metric or imperial. */
export function formatArea(m2: number, units: MeasureUnits | string = "metric"): string {
  if (units === "imperial") {
    const ac = m2 / 4046.8564224;
    if (ac < 0.1) return `${nf(m2 * 10.7639104, 0)} ft²`;
    return ac < 640 ? `${nf(ac, 2)} ac` : `${nf(m2 / 2589988.110336, 2)} mi²`;
  }
  if (m2 < 10000) return `${nf(m2, 0)} m²`;
  return m2 < 1e6 ? `${nf(m2 / 10000, 2)} ha` : `${nf(m2 / 1e6, 2)} km²`;
}

// ── search: the keyless default provider (Photon, OpenStreetMap data) ────────────────────────
export const PHOTON_ATTRIBUTION = "Search by Photon · © OpenStreetMap contributors";
/** Photon → [{ label, lng, lat, bbox? }]. Photon's `extent` is [west, north, east, south]. */
export function photonProvider(fetchFn: FetchLike): SearchProvider {
  return async (q: string) => {
    const r = await fetchFn(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6`);
    if (!r?.ok) throw new Error(`Photon answered HTTP ${r?.status}`);
    const j = await r.json();
    const out = (j?.features ?? []).filter((f) => f?.geometry?.type === "Point").map((f) => {
      const p = f.properties ?? {}, [lng, lat] = f.geometry.coordinates;
      const street = [p.housenumber, p.street].filter(Boolean).join(" ");
      const parts = [p.name || street, p.name ? street : "", p.city, p.state, p.country]
        .map((s) => (s == null ? "" : String(s))).filter((s, i, a) => s && a.indexOf(s) === i);
      const e = p.extent;
      return { label: parts.join(", ") || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lng, lat,
               ...(Array.isArray(e) && e.length === 4 ? { bbox: [e[0], e[3], e[2], e[1]] } : {}),
               _kind: String(p.type ?? p.osm_value ?? "").replace(/_/g, " ") };
    });
    // "Monterey, California" the city and "Monterey, California" the county read the same:
    // a label that repeats carries its kind ("· county"), so the reader can tell them apart
    const seen: Record<string, number> = {};
    for (const r of out) seen[r.label] = (seen[r.label] ?? 0) + 1;
    return out.map(({ _kind, ...r }) => (seen[r.label] > 1 && _kind ? { ...r, label: `${r.label} · ${_kind}` } : r));
  };
}

// ── colours of the graphics (MapLibre paint cannot read CSS variables) ───────────────────────
const C: Record<string, string> = { measure: "#C2255C", draw: "#E8590C", sel: "#1C7ED6", locate: "#1C7ED6", search: "#D6336C", halo: "#FFFFFF" };
const isPoly: any[] = ["==", ["geometry-type"], "Polygon"], isLine = ["==", ["geometry-type"], "LineString"], isPt = ["==", ["geometry-type"], "Point"];
const LAYERS: Record<string, any[]> = {
  "smc-locate": [
    { id: "smc-locate-acc", type: "fill", filter: isPoly, paint: { "fill-color": C.locate, "fill-opacity": 0.14 } },
    { id: "smc-locate-acc-line", type: "line", filter: isPoly, paint: { "line-color": C.locate, "line-width": 1.2, "line-opacity": 0.6 } },
    { id: "smc-locate-pt", type: "circle", filter: isPt, paint: { "circle-radius": 7, "circle-color": C.locate, "circle-stroke-color": C.halo, "circle-stroke-width": 2.5 } },
  ],
  "smc-search": [
    { id: "smc-search-pt", type: "circle", paint: { "circle-radius": 8, "circle-color": C.search, "circle-stroke-color": C.halo, "circle-stroke-width": 3 } },
  ],
  "smc-measure": [
    { id: "smc-measure-fill", type: "fill", filter: isPoly, paint: { "fill-color": C.measure, "fill-opacity": 0.12 } },
    { id: "smc-measure-line", type: "line", filter: ["any", isLine, isPoly], paint: { "line-color": C.measure, "line-width": 2.5, "line-dasharray": [2, 1.2] } },
    { id: "smc-measure-pt", type: "circle", filter: isPt, paint: { "circle-radius": 4.5, "circle-color": C.halo, "circle-stroke-color": C.measure, "circle-stroke-width": 2 } },
  ],
  "smc-draw": [
    { id: "smc-draw-fill", type: "fill", filter: isPoly, paint: { "fill-color": ["case", ["==", ["get", "_sel"], true], C.sel, C.draw], "fill-opacity": 0.16 } },
    { id: "smc-draw-line", type: "line", filter: ["any", isLine, isPoly],
      paint: { "line-color": ["case", ["==", ["get", "_sel"], true], C.sel, C.draw], "line-width": ["case", ["==", ["get", "_sel"], true], 3.5, 2.5] } },
    { id: "smc-draw-pt", type: "circle", filter: isPt,
      paint: { "circle-radius": ["case", ["==", ["get", "_v"], true], 4, 6.5], "circle-color": ["case", ["==", ["get", "_sel"], true], C.sel, ["==", ["get", "_v"], true], C.halo, C.draw],
               "circle-stroke-color": ["case", ["==", ["get", "_v"], true], C.draw, C.halo], "circle-stroke-width": 2 } },
  ],
};
const DRAW_HIT = ["smc-draw-fill", "smc-draw-line", "smc-draw-pt"];
const fc = (features: any[] = []): FeatureCollectionLike => ({ type: "FeatureCollection", features });
const feat = (geometry: any, properties: any = {}) => ({ type: "Feature", properties, geometry });
let uid = 0;

/**
 * createTools(ctx) — called once by mountMapControls.
 * ctx: { getMap, container, config, esc, icons, doc, closeDrawer, onError, interaction, fetch,
 *        download?, geolocation?, isSecureContext?, title? }
 */
export function createTools(ctx: ToolsContext): ToolsHandle {
  const { esc, icons, doc, container } = ctx;
  const map = () => ctx.getMap();
  const cfg: Record<string, any> = {};
  for (const t of TOOL_ORDER) {
    const v = ctx.config?.[t];
    if (v) cfg[t] = v === true ? {} : v;
  }
  const enabled: ToolName[] = TOOL_ORDER.filter((t) => cfg[t]);
  const custom = (t) => typeof cfg[t]?.onClick === "function";     // the legacy placeholder hook
  const n = ++uid;
  const pid = `smc-tp-${n}`;

  let panelEl: any = null, toastEl: any = null, toastTimer: any = 0;
  let panel: any = null;              // the open panel tool (search | measure | draw) or null
  let mode: InteractionMode = "identify";
  const timers = new Set<any>();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const cancel = (id) => { clearTimeout(id); timers.delete(id); };

  // ── graphics: sources added lazily, remembered, re-added after setStyle ──
  const data = new Map<string, FeatureCollectionLike>();        // source id → FeatureCollection, for every source we have added
  function ensure(src) {
    const m = map();
    if (!m?.addSource) return false;
    try {
      if (!m.getSource(src)) m.addSource(src, { type: "geojson", data: data.get(src) ?? fc() });
      for (const L of LAYERS[src]) if (!m.getLayer(L.id)) m.addLayer({ ...L, source: src });
      return true;
    } catch { return false; }    // a styledata before the style exists — the next one lands
  }
  function setData(src, collection) {
    data.set(src, collection);
    if (!ensure(src)) return;
    map()?.getSource(src)?.setData?.(collection);
  }
  function removeData(src) {
    if (!data.has(src)) return;
    data.set(src, fc());
    map()?.getSource?.(src)?.setData?.(fc());
  }
  function restyle() { for (const [src, d] of data) if (d.features.length && ensure(src)) map()?.getSource(src)?.setData?.(d); }
  function layerIds(): string[] {
    const m = map();
    const ids: string[] = [];
    if (!m?.getLayer) return ids;
    for (const src of ["smc-locate", "smc-measure", "smc-draw", "smc-search"])
      if (data.has(src)) for (const L of LAYERS[src]) if (m.getLayer(L.id)) ids.push(L.id);
    return ids;
  }
  function raise() {
    const m = map();
    if (!m?.moveLayer) return;
    for (const id of layerIds()) m.moveLayer(id);
  }

  // ── messages ──
  function toast(msg, { error = false } = {}) {
    if (!toastEl) {
      toastEl = doc.createElement("div");
      toastEl.setAttribute("class", "smc-toast");
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      container.appendChild(toastEl);
    }
    toastEl.textContent = String(msg);
    toastEl.hidden = false;
    if (error) ctx.onError?.(String(msg));
    if (toastTimer) cancel(toastTimer);
    toastTimer = later(() => { if (toastEl) toastEl.hidden = true; toastTimer = 0; }, 5000);
  }

  // ── the cluster's second group ──
  const title = (t) => String(cfg[t]?.title ?? TOOL_TITLE[t]);
  function buttonsHtml() {
    if (!enabled.length) return "";
    return `<span class="smc-sep" role="separator" aria-hidden="true"></span>` + enabled.map((t) => {
      const T = esc(title(t));
      const state = custom(t) ? "" : PANEL_TOOLS.has(t) ? ` aria-expanded="${panel === t}" aria-controls="${pid}"`
        : t === "locate" ? ` aria-pressed="${!!loc.on}"` : "";
      return `<button data-act="tool-${t}" data-tool="${t}" title="${T}" aria-label="${T}"${state}>${icons[t]}</button>`;
    }).join("");
  }
  let clusterEl: any = null;
  function sync() {
    if (!clusterEl) return;
    for (const b of clusterEl.querySelectorAll("button")) {
      const t = b.dataset?.tool;
      if (!t || custom(t)) continue;
      if (PANEL_TOOLS.has(t)) b.setAttribute("aria-expanded", String(panel === t));
      if (t === "locate") b.setAttribute("aria-pressed", String(!!loc.on));
    }
  }
  const btnOf = (t) => clusterEl?.querySelector(`[data-act="tool-${t}"]`);

  function click(t, controls) {
    if (!cfg[t]) return;
    if (custom(t)) { cfg[t].onClick({ map: map(), controls }); return; }
    if (PANEL_TOOLS.has(t)) return panel === t ? close() : open(t);
    if (t === "locate") return locate();
    if (t === "print") return print();
  }

  // ── modes ──
  let dblWasOn: boolean | null = null;
  function setMode(m) {
    if (m === mode) return;
    mode = m;
    const mp = map();
    const cv = mp?.getCanvas?.();
    if (cv?.style) cv.style.cursor = m === "identify" ? "" : "crosshair";
    const dz = mp?.doubleClickZoom;
    if (m !== "identify") { if (dz && dblWasOn == null) { dblWasOn = dz.isEnabled?.() ?? true; dz.disable?.(); } }
    else if (dz && dblWasOn != null) { if (dblWasOn) dz.enable?.(); dblWasOn = null; }
    if (m === "identify") container.removeAttribute?.("data-smc-tool"); else container.setAttribute("data-smc-tool", m);
    ctx.interaction?.setMode?.(m);
  }

  // map + window listeners, bound only while Measure or Draw is open
  const bound: [string, string, any][] = [];
  function bindMap(handlers) {
    const mp = map();
    for (const [t, fn] of Object.entries(handlers)) { mp?.on?.(t, fn); bound.push(["map", t, fn]); }
    if (globalThis.addEventListener) {
      const onKey = (e) => {
        if (e.target?.matches?.("input,textarea,select,[contenteditable]")) return;
        if (e.key === "Enter") { e.preventDefault?.(); handlers.__finish?.(); }
        else if ((e.key === "Delete" || e.key === "Backspace") && panel === "draw") { if (draw.selected != null) { e.preventDefault?.(); drawDelete(); } }
      };
      globalThis.addEventListener("keydown", onKey);
      bound.push(["win", "keydown", onKey]);
    }
  }
  function unbind() {
    const mp = map();
    for (const [k, t, fn] of bound) k === "map" ? mp?.off?.(t, fn) : globalThis.removeEventListener?.(t, fn);
    bound.length = 0;
  }

  // ── the panel ──
  function ensurePanel() {
    if (panelEl) return panelEl;
    panelEl = doc.createElement("div");
    panelEl.setAttribute("class", "smc-drawer smc-tpanel");
    panelEl.setAttribute("id", pid);
    panelEl.setAttribute("role", "region");
    panelEl.hidden = true;
    container.appendChild(panelEl);
    panelEl.addEventListener("click", onPanelClick);
    panelEl.addEventListener("keydown", onPanelKey);
    panelEl.addEventListener("input", onPanelInput);
    return panelEl;
  }
  const head = (t) => `<div class="tp-head"><h3 id="${pid}-h">${esc(title(t).replace(/ \(PNG\)$/, ""))}</h3>` +
    `<button class="tp-x" data-tp="close" title="Close" aria-label="Close ${esc(title(t))}">${icons.close}</button></div>`;
  function open(t) {
    if (!cfg[t] || !PANEL_TOOLS.has(t)) return false;
    if (panel === t) return true;
    close({ focus: false });
    ctx.closeDrawer?.();
    panel = t;
    const el = ensurePanel();
    el.setAttribute("aria-labelledby", `${pid}-h`);
    el.dataset.which = `tool-${t}`;
    el.hidden = false;
    if (t === "measure") { measureReset(); el.innerHTML = head(t) + measureHtml(); bindMap(measureHandlers); setMode("measure"); measureRender(); }
    else if (t === "draw") { draw.sketch = []; draw.cursor = null; el.innerHTML = head(t) + drawHtml(); bindMap(drawHandlers); setMode("draw"); drawRender(); }
    else { el.innerHTML = head(t) + searchHtml(); el.querySelector(".tp-input")?.focus?.(); }
    sync();
    return true;
  }
  /** End the active tool; true if one was open. */
  function close({ focus = true } = {}) {
    if (!panel) return false;
    const was = panel;
    unbind();
    if (was === "measure") { measureReset(); removeData("smc-measure"); }
    if (was === "draw") { if (draw.sketch.length) drawFinish(); draw.sketch = []; draw.cursor = null; draw.selected = null; drawRender(); }
    if (was === "search") { cancel(srch.timer); srch.seq++; srch.results = []; removeData("smc-search"); }
    panel = null;
    if (panelEl) { panelEl.hidden = true; panelEl.innerHTML = ""; panelEl.dataset.which = ""; }
    setMode("identify");
    sync();
    if (focus) btnOf(was)?.focus?.();
    return true;
  }
  function onPanelClick(e) {
    const b = e.target.closest?.("[data-tp]");
    if (b) {
      if (b.getAttribute?.("disabled") != null) return;
      const a = b.dataset.tp, v = b.dataset.v;
      if (a === "close") return void close();
      if (panel === "measure") measureCmd(a, v);
      else if (panel === "draw") drawCmd(a, v);
      return;
    }
    const li = e.target.closest?.("[data-idx]");
    if (li && panel === "search") searchPick(Number(li.dataset.idx));
  }
  function onPanelKey(e) {
    if (e.key === "Escape") { e.preventDefault?.(); e.stopPropagation?.(); close(); return; }
    if (panel === "search" && e.target.closest?.(".tp-input")) searchKey(e);
  }
  function onPanelInput(e) { if (panel === "search" && e.target.closest?.(".tp-input")) searchInput(String(e.target.value ?? "")); }

  // ════ measure ════
  const meas: any = { kind: "distance", units: cfg.measure?.units === "imperial" ? "imperial" : "metric", pts: [], px: [], cursor: null, done: false };
  function measureReset() { meas.pts = []; meas.px = []; meas.cursor = null; meas.done = false; }
  const samePx = (a, b) => a && b && Math.abs(a.x - b.x) <= 4 && Math.abs(a.y - b.y) <= 4;
  const ll = (e): LngLat => [e.lngLat.lng, e.lngLat.lat];
  function measureValues(): any {
    const c = meas.done || !meas.cursor ? meas.pts : [...meas.pts, meas.cursor];
    if (meas.kind === "area") {
      const ring = c.length >= 3 ? [...c, c[0]] : null;
      return { coords: c, area: ring ? ringArea(ring) : 0, perimeter: ring ? pathLength(ring) : pathLength(c) };
    }
    return { coords: c, length: pathLength(c) };
  }
  function measureHtml() {
    const seg = (k, l) => `<button role="radio" data-tp="kind" data-v="${k}" aria-checked="${meas.kind === k}">${l}</button>`;
    return `<div class="tp-seg" role="radiogroup" aria-label="Measure">${seg("distance", "Distance")}${seg("area", "Area")}</div>` +
      `<div class="tp-read" data-tp-read aria-live="polite"></div>` +
      `<div class="tp-hint">Click the map to add points. Double-click or press Enter to finish.</div>` +
      `<div class="tp-row"><button class="tp-btn" data-tp="units" aria-pressed="${meas.units === "imperial"}">Imperial units</button>` +
      `<button class="tp-btn" data-tp="finish">Finish</button>` +
      `<button class="tp-btn" data-tp="clear">${icons.trash}Clear</button></div>`;
  }
  function measureRender() {
    const v = measureValues(), other = meas.units === "metric" ? "imperial" : "metric";
    const read = panelEl?.querySelector?.("[data-tp-read]");
    if (read) {
      let html;
      if (meas.kind === "area") {
        html = v.coords.length < 3
          ? `<div class="big">—</div><div class="sub">Add at least 3 points to measure an area.</div>`
          : `<div class="big">${esc(formatArea(v.area, meas.units))}</div><div class="alt">${esc(formatArea(v.area, other))}</div>` +
            `<div class="sub">Perimeter ${esc(formatLength(v.perimeter, meas.units))}</div>`;
      } else {
        html = v.coords.length < 2
          ? `<div class="big">—</div><div class="sub">Add at least 2 points to measure a distance.</div>`
          : `<div class="big">${esc(formatLength(v.length, meas.units))}</div><div class="alt">${esc(formatLength(v.length, other))}</div>` +
            `<div class="sub">${meas.pts.length} point${meas.pts.length === 1 ? "" : "s"}${meas.done ? " · finished" : ""}</div>`;
      }
      read.innerHTML = html;
    }
    const f: any[] = [];
    if (meas.kind === "area" && v.coords.length >= 3) f.push(feat({ type: "Polygon", coordinates: [[...v.coords, v.coords[0]]] }));
    else if (v.coords.length >= 2) f.push(feat({ type: "LineString", coordinates: v.coords }));
    for (const p of meas.pts) f.push(feat({ type: "Point", coordinates: p }));
    if (f.length || data.has("smc-measure")) setData("smc-measure", fc(f));
  }
  function measureFinish() { if (meas.pts.length) { meas.done = true; meas.cursor = null; measureRender(); } }
  const measureHandlers = {
    click: (e) => {
      if (!e?.lngLat) return;
      if (meas.done) measureReset();
      if (meas.pts.length && e.point && samePx(meas.px.at(-1), e.point)) return;   // the 2nd click of a double-click
      meas.pts.push(ll(e)); meas.px.push(e.point ?? null);
      measureRender();
    },
    dblclick: (e) => { e?.preventDefault?.(); measureFinish(); },
    mousemove: (e) => { if (!meas.done && meas.pts.length && e?.lngLat) { meas.cursor = ll(e); measureRender(); } },
    __finish: () => measureFinish(),
  };
  function measureCmd(a, v) {
    if (a === "kind" && (v === "distance" || v === "area")) {
      meas.kind = v;
      for (const b of panelEl.querySelectorAll('[data-tp="kind"]')) b.setAttribute("aria-checked", String(b.dataset.v === v));
    } else if (a === "units") {
      meas.units = meas.units === "metric" ? "imperial" : "metric";
      panelEl.querySelector('[data-tp="units"]')?.setAttribute("aria-pressed", String(meas.units === "imperial"));
    } else if (a === "finish") return measureFinish();
    else if (a === "clear") measureReset();
    measureRender();
  }

  // ════ draw ════
  const draw: any = { kind: "point", features: [], sketch: [], px: [], cursor: null, selected: null, next: 1 };
  function drawHtml() {
    const seg = (k, l) => `<button role="radio" data-tp="kind" data-v="${k}" aria-checked="${draw.kind === k}">${l}</button>`;
    return `<div class="tp-seg" role="radiogroup" aria-label="Draw">${seg("point", "Point")}${seg("line", "Line")}${seg("polygon", "Polygon")}${seg("select", "Select")}</div>` +
      `<div class="tp-read" data-tp-read aria-live="polite"></div>` +
      `<div class="tp-hint" data-tp-hint></div>` +
      `<div class="tp-row"><button class="tp-btn" data-tp="delete">${icons.trash}Delete selected</button>` +
      `<button class="tp-btn" data-tp="clear">Clear all</button>` +
      `<button class="tp-btn" data-tp="export">${icons.download}Export GeoJSON</button></div>`;
  }
  const DRAW_HINT: Record<string, string> = {
    point: "Click the map to place a point.",
    line: "Click to add vertices. Double-click or press Enter to finish the line.",
    polygon: "Click to add vertices. Double-click or press Enter to close the polygon.",
    select: "Click a shape to select it, then Delete selected (or press Delete).",
  };
  function drawRender() {
    if (panelEl && panel === "draw") {
      const read = panelEl.querySelector("[data-tp-read]");
      const nF = draw.features.length;
      if (read) read.innerHTML = `<div class="sub">${nF} shape${nF === 1 ? "" : "s"}${draw.selected != null ? " · 1 selected" : ""}${draw.sketch.length ? ` · drawing (${draw.sketch.length} vert${draw.sketch.length === 1 ? "ex" : "ices"})` : ""}</div>`;
      const hint = panelEl.querySelector("[data-tp-hint]");
      if (hint) hint.textContent = DRAW_HINT[draw.kind];
      const del = panelEl.querySelector('[data-tp="delete"]');
      if (del) draw.selected == null ? del.setAttribute("disabled", "") : del.removeAttribute("disabled");
      const exp = panelEl.querySelector('[data-tp="export"]');
      if (exp) nF ? exp.removeAttribute("disabled") : exp.setAttribute("disabled", "");
    }
    const f: any[] = draw.features.map((x) => ({ ...x, properties: { ...x.properties, _sel: x.properties._id === draw.selected } }));
    const sk = draw.cursor ? [...draw.sketch, draw.cursor] : draw.sketch;
    if (draw.kind === "polygon" && sk.length >= 3) f.push(feat({ type: "Polygon", coordinates: [[...sk, sk[0]]] }, { _sketch: true }));
    else if (sk.length >= 2) f.push(feat({ type: "LineString", coordinates: sk }, { _sketch: true }));
    for (const p of draw.sketch) f.push(feat({ type: "Point", coordinates: p }, { _v: true, _sketch: true }));
    if (f.length || data.has("smc-draw")) setData("smc-draw", fc(f));
  }
  function drawAdd(kind, geometry) {
    const id = draw.next++;
    draw.features.push({ type: "Feature", id, properties: { _id: id, kind }, geometry });
  }
  function drawFinish() {
    const s = draw.sketch;
    if (draw.kind === "line" && s.length >= 2) drawAdd("line", { type: "LineString", coordinates: [...s] });
    else if (draw.kind === "polygon" && s.length >= 3) drawAdd("polygon", { type: "Polygon", coordinates: [[...s, s[0]]] });
    draw.sketch = []; draw.px = []; draw.cursor = null;
    drawRender();
  }
  function drawDelete() {
    if (draw.selected == null) return;
    draw.features = draw.features.filter((f) => f.properties._id !== draw.selected);
    draw.selected = null;
    drawRender();
  }
  const drawHandlers = {
    click: (e) => {
      if (!e?.lngLat) return;
      if (draw.kind === "point") { drawAdd("point", { type: "Point", coordinates: ll(e) }); drawRender(); return; }
      if (draw.kind === "select") {
        let hits: any[] = [];
        try { hits = map()?.queryRenderedFeatures?.(e.point, { layers: DRAW_HIT.filter((id) => map()?.getLayer?.(id)) }) ?? []; } catch {}
        const hit = hits.find((h) => h.properties?._id != null && !h.properties?._sketch);
        draw.selected = hit ? Number(hit.properties._id) : null;
        drawRender();
        return;
      }
      if (draw.sketch.length && e.point && samePx(draw.px.at(-1), e.point)) return;
      draw.sketch.push(ll(e)); draw.px.push(e.point ?? null);
      drawRender();
    },
    dblclick: (e) => { e?.preventDefault?.(); if (draw.kind === "line" || draw.kind === "polygon") drawFinish(); },
    mousemove: (e) => { if (draw.sketch.length && e?.lngLat) { draw.cursor = ll(e); drawRender(); } },
    __finish: () => drawFinish(),
  };
  /** The drawing as clean GeoJSON (internal flags stripped). */
  function toGeoJSON() {
    return fc(draw.features.map((f) => ({ type: "Feature", id: f.id, properties: { kind: f.properties.kind },
      geometry: JSON.parse(JSON.stringify(f.geometry)) })));
  }
  function drawCmd(a, v) {
    if (a === "kind" && ["point", "line", "polygon", "select"].includes(v)) {
      if (draw.sketch.length) drawFinish();
      draw.kind = v;
      if (v !== "select") draw.selected = null;
      for (const b of panelEl.querySelectorAll('[data-tp="kind"]')) b.setAttribute("aria-checked", String(b.dataset.v === v));
      const cv = map()?.getCanvas?.();
      if (cv?.style) cv.style.cursor = v === "select" ? "pointer" : "crosshair";
    } else if (a === "delete") return drawDelete();
    else if (a === "clear") { draw.features = []; draw.sketch = []; draw.px = []; draw.cursor = null; draw.selected = null; }
    else if (a === "export") return drawExport();
    drawRender();
  }
  function drawExport() {
    if (!draw.features.length) { toast("Nothing to export yet — draw a shape first."); return null; }
    const text = JSON.stringify(toGeoJSON(), null, 2);
    download(String(cfg.draw?.filename ?? "drawing.geojson"), { text, type: "application/geo+json" });
    toast(`Exported ${draw.features.length} shape${draw.features.length === 1 ? "" : "s"} as GeoJSON.`);
    return text;
  }

  // ── a download, through one seam (ctx.download overrides it, e.g. in tests) ──
  function download(filename: string, { text, type, dataUrl }: { text?: string; type?: string; dataUrl?: string | null }) {
    if (ctx.download) return ctx.download(filename, { text, type, dataUrl });
    let href: any = dataUrl, revoke: (() => void) | null = null;
    if (!href) {
      const blob = new Blob([text as string], { type });
      href = URL.createObjectURL(blob);
      revoke = () => URL.revokeObjectURL(href as string);
    }
    const a = doc.createElement("a");
    a.setAttribute("href", href); a.setAttribute("download", filename);
    if (a.style) a.style.display = "none";
    doc.body?.appendChild?.(a);
    a.click?.();
    a.remove?.();
    if (revoke) later(revoke, 1000);
  }

  // ════ search ════
  const srch: any = { timer: 0, seq: 0, results: [], active: -1, last: null };
  const provider = () => cfg.search?.provider ?? photonProvider((...a) => ctx.fetch(...a));
  const attribution = () => (cfg.search?.provider ? cfg.search.attribution ?? "" : PHOTON_ATTRIBUTION);
  function searchHtml() {
    const attr = attribution();
    return `<input class="tp-input" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${pid}-list" ` +
      `aria-label="${esc(cfg.search?.placeholder ?? "Search places")}" placeholder="${esc(cfg.search?.placeholder ?? "Search places")}" autocomplete="off" spellcheck="false">` +
      `<div class="tp-msg" data-tp-msg role="status" aria-live="polite"></div>` +
      `<ul class="tp-results" id="${pid}-list" role="listbox" aria-label="Results"></ul>` +
      (attr ? `<div class="tp-attr">${esc(attr)}</div>` : "");
  }
  function searchMsg(t) { const m = panelEl?.querySelector?.("[data-tp-msg]"); if (m) m.textContent = t; }
  function searchList() {
    const ul = panelEl?.querySelector?.(".tp-results"), inp = panelEl?.querySelector?.(".tp-input");
    if (!ul) return;
    ul.innerHTML = srch.results.map((r, i) => {
      const [main, ...rest] = String(r.label ?? "").split(", ");
      return `<li id="${pid}-o${i}" role="option" data-idx="${i}" aria-selected="${i === srch.active}">${esc(main)}` +
        (rest.length ? `<span class="sub">${esc(rest.join(", "))}</span>` : "") + `</li>`;
    }).join("");
    inp?.setAttribute("aria-expanded", String(srch.results.length > 0));
    if (srch.active >= 0) inp?.setAttribute("aria-activedescendant", `${pid}-o${srch.active}`);
    else inp?.removeAttribute?.("aria-activedescendant");
  }
  function searchInput(value) {
    const q = value.trim();
    cancel(srch.timer);
    srch.seq++;                      // whatever is in flight is now stale
    if (q.length < 3) {
      srch.results = []; srch.active = -1; searchList();
      searchMsg(q.length ? "Type at least 3 characters." : "");
      return;
    }
    srch.timer = later(() => runSearch(q), 300);
  }
  function runSearch(q) {
    const seq = ++srch.seq;
    searchMsg("Searching…");
    srch.last = (async () => {
      let res: any;
      try { res = await provider()(q); }
      catch {
        if (seq !== srch.seq) return;
        srch.results = []; srch.active = -1; searchList();
        searchMsg("Search is unavailable right now. Check the connection and try again.");
        return;
      }
      if (seq !== srch.seq || panel !== "search") return;
      srch.results = (Array.isArray(res) ? res : []).filter((r) => Number.isFinite(Number(r?.lng)) && Number.isFinite(Number(r?.lat))).slice(0, 8);
      srch.active = -1;
      searchList();
      searchMsg(srch.results.length ? `${srch.results.length} result${srch.results.length === 1 ? "" : "s"}` : `No places found for “${q}”.`);
    })();
    return srch.last;
  }
  function searchKey(e) {
    const nR = srch.results.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!nR) return;
      e.preventDefault?.();
      srch.active = e.key === "ArrowDown" ? (srch.active + 1) % nR : (srch.active <= 0 ? nR - 1 : srch.active - 1);
      searchList();
    } else if (e.key === "Enter") {
      if (!nR) return;
      e.preventDefault?.();
      searchPick(srch.active >= 0 ? srch.active : 0);
    }
  }
  function searchPick(i) {
    const r = srch.results[i];
    const mp = map();
    if (!r) return;
    const lng = Number(r.lng), lat = Number(r.lat);
    setData("smc-search", fc([feat({ type: "Point", coordinates: [lng, lat] }, { label: String(r.label ?? "") })]));
    const b = r.bbox;
    if (Array.isArray(b) && b.length === 4 && b.every(Number.isFinite) && (b[2] - b[0] > 1e-6 || b[3] - b[1] > 1e-6))
      mp?.fitBounds?.([[b[0], b[1]], [b[2], b[3]]], { padding: 48, maxZoom: 16, duration: 900 });
    else mp?.flyTo?.({ center: [lng, lat], zoom: Math.max(mp.getZoom?.() ?? 0, 14), duration: 900 });
    srch.results = []; srch.active = -1; searchList();
    const inp = panelEl?.querySelector?.(".tp-input");
    if (inp) inp.value = String(r.label ?? "");
    searchMsg(`Showing ${String(r.label ?? "")}`);
  }

  // ════ locate ════
  const loc = { on: false, pending: false };
  function clearLocate() { loc.on = false; removeData("smc-locate"); sync(); }
  function locate() {
    if (loc.on) { clearLocate(); return Promise.resolve(false); }
    if (loc.pending) return Promise.resolve(false);
    const fail = (m) => { toast(m, { error: true }); return false; };
    const secure = ctx.isSecureContext ?? globalThis.isSecureContext;
    if (secure === false) return Promise.resolve(fail("Find my location needs a secure (https) page."));
    const geo = ctx.geolocation ?? globalThis.navigator?.geolocation;
    if (!geo?.getCurrentPosition) return Promise.resolve(fail("Location is not available in this browser."));
    loc.pending = true;
    btnOf("locate")?.setAttribute("aria-busy", "true");
    return new Promise<boolean>((resolve) => {
      const done = () => { loc.pending = false; btnOf("locate")?.removeAttribute?.("aria-busy"); };
      geo.getCurrentPosition((pos) => {
        done();
        const lng = Number(pos?.coords?.longitude), lat = Number(pos?.coords?.latitude), acc = Math.max(0, Number(pos?.coords?.accuracy) || 0);
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) return resolve(fail("Your location is unavailable right now."));
        const f: any[] = [feat({ type: "Point", coordinates: [lng, lat] })];
        if (acc > 0) f.unshift(feat({ type: "Polygon", coordinates: [circleRing([lng, lat], acc)] }));
        setData("smc-locate", fc(f));
        loc.on = true; sync();
        const mp = map();
        if (acc > 30) {
          const r = circleRing([lng, lat], acc, 16);
          const xs = r.map((p) => p[0]), ys = r.map((p) => p[1]);
          mp?.fitBounds?.([[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]], { padding: 60, maxZoom: 16, duration: 900 });
        } else mp?.flyTo?.({ center: [lng, lat], zoom: Math.max(mp.getZoom?.() ?? 0, 15), duration: 900 });
        toast(`You are here${acc ? ` (within about ${formatLength(acc)})` : ""}.`);
        resolve(true);
      }, (err) => {
        done();
        const m = err?.code === 1 ? "Location permission was denied. Allow location for this site to use Find my location."
          : err?.code === 3 ? "Finding your location timed out. Try again."
          : "Your location is unavailable right now.";
        resolve(fail(m));
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    });
  }

  // ════ print ════
  function attributionText(mp) {
    const box = mp?.getContainer?.()?.querySelector?.(".maplibregl-ctrl-attrib-inner");
    let t = box?.textContent ?? "";
    if (!t) {
      try {
        const srcs: any[] = Object.values(mp?.getStyle?.()?.sources ?? {});
        t = [...new Set(srcs.map((s) => s?.attribution).filter(Boolean))].join(" · ");
      } catch {}
    }
    return String(t).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  }
  /** A round scale-bar length (1-2-5) ≤ maxM metres. */
  function niceMetres(maxM) {
    const p = 10 ** Math.floor(Math.log10(maxM)), d = maxM / p;
    return (d >= 5 ? 5 : d >= 2 ? 2 : 1) * p;
  }
  function compose(mp, docTitle) {
    const src = mp.getCanvas();
    const W = src.width, H = src.height;
    const cssW = src.clientWidth || src.getBoundingClientRect?.().width || W;
    const r = W / cssW || 1;
    const F = Math.round(58 * r);
    const out = doc.createElement("canvas");
    out.width = W; out.height = H + F;
    const g = out.getContext("2d");
    g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, W, H + F);
    g.drawImage(src, 0, 0);
    g.fillStyle = "#C7CED6"; g.fillRect(0, H, W, Math.max(1, Math.round(r)));
    const pad = Math.round(12 * r);
    // the scale bar, right-aligned: metres per CSS pixel at the centre (512-px tiles)
    const c = mp.getCenter?.() ?? { lat: 0 };
    const z = mp.getZoom?.() ?? 0;
    const mpp = (40075016.686 * Math.cos(rad(c.lat))) / (512 * 2 ** z);
    const m = niceMetres(mpp * 110), barCss = m / mpp, bar = Math.round(barCss * r);
    const bx = W - pad - bar, by = H + Math.round(36 * r);
    g.fillStyle = "#101418";
    g.fillRect(bx, by, bar, Math.max(2, Math.round(3 * r)));
    g.fillRect(bx, by - Math.round(5 * r), Math.max(1, Math.round(r)), Math.round(8 * r));
    g.fillRect(bx + bar - Math.max(1, Math.round(r)), by - Math.round(5 * r), Math.max(1, Math.round(r)), Math.round(8 * r));
    g.font = `${Math.round(11 * r)}px system-ui, sans-serif`;
    g.textAlign = "right"; g.textBaseline = "alphabetic";
    g.fillText(formatLength(m), W - pad, by - Math.round(9 * r));
    // title, then date · attribution, left-aligned and clipped to the space the bar leaves
    g.textAlign = "left";
    const maxW = bx - pad * 2;
    const fit = (s) => { let t = s; while (t.length > 1 && g.measureText(t).width > maxW) t = t.slice(0, -2) + "…"; return t; };
    g.font = `600 ${Math.round(14 * r)}px system-ui, sans-serif`;
    g.fillText(fit(docTitle), pad, H + Math.round(23 * r));
    g.fillStyle = "#4A5560";
    g.font = `${Math.round(11 * r)}px system-ui, sans-serif`;
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const at = attributionText(mp);
    g.fillText(fit(at ? `${date} · ${at}` : date), pad, H + Math.round(43 * r));
    return out.toDataURL("image/png");
  }
  let printing = false;
  function print() {
    const mp = map();
    if (!mp?.getCanvas) { toast("The map is not ready to print yet.", { error: true }); return Promise.resolve(null); }
    if (printing) return Promise.resolve(null);
    printing = true;
    btnOf("print")?.setAttribute("aria-busy", "true");
    const docTitle = String(cfg.print?.title ?? ctx.title ?? doc.title ?? "Map") || "Map";
    return new Promise<string | null>((resolve) => {
      let settled = false, fallback: any = 0;
      const run = () => {
        if (settled) return;
        settled = true;
        if (fallback) cancel(fallback);
        mp.off?.("render", run);
        printing = false;
        btnOf("print")?.removeAttribute?.("aria-busy");
        let url: string | null = null;
        try { url = compose(mp, docTitle); }
        catch (e: any) {
          toast(/secur|taint/i.test(String(e?.message ?? e)) ? "Print was blocked: a map layer's host does not allow image export." : `Print failed: ${e?.message ?? e}`, { error: true });
          return resolve(null);
        }
        const stamp = new Date().toISOString().slice(0, 10);
        download(String(cfg.print?.filename ?? `map-${stamp}.png`), { dataUrl: url });
        toast("Map saved as PNG.");
        resolve(url);
      };
      // inside the render event the WebGL drawing buffer is still intact — no preserveDrawingBuffer needed
      if (mp.once) mp.once("render", run); else mp.on?.("render", run);
      fallback = later(run, 3000);
      mp.triggerRepaint?.();
    });
  }

  function destroy() {
    close({ focus: false });
    unbind();
    for (const id of timers) clearTimeout(id);
    timers.clear();
    const mp = map();
    for (const src of data.keys()) {
      try { for (const L of LAYERS[src]) if (mp?.getLayer?.(L.id)) mp.removeLayer(L.id); if (mp?.getSource?.(src)) mp.removeSource(src); } catch {}
    }
    data.clear();
    if (panelEl) { panelEl.removeEventListener("click", onPanelClick); panelEl.removeEventListener("keydown", onPanelKey); panelEl.removeEventListener("input", onPanelInput); panelEl.remove?.(); panelEl = null; }
    toastEl?.remove?.(); toastEl = null;
  }

  return {
    enabled, buttonsHtml, sync, click,
    attach: (cluster) => { clusterEl = cluster; },
    isBusy: () => mode !== "identify",
    getMode: () => mode,
    /** "identify" ends Measure / Draw; "measure" / "draw" opens that tool (if enabled). */
    setMode: (m: any) => (m === "identify" ? (MODE_TOOLS.has(panel) ? close({ focus: false }) : false) : MODE_TOOLS.has(m) ? open(m) : false),
    active: () => panel,
    open, close: close as ToolsHandle["close"], escape: () => close(),
    restyle, raise, layerIds, destroy,
    // direct handles (for apps and tests)
    locate, print, toGeoJSON, exportGeoJSON: drawExport,
    measure: meas, measureValues, draw, search: srch, searchNow: (q: string) => runSearch(q) as Promise<void>,
    get panelEl() { return panelEl; }, get toastEl() { return toastEl; },
  };
}
