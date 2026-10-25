// @ts-nocheck — a behaviour-exact port of the reference suite (test-map-controls.mjs): plain JS
// against a stub DOM and a stub map, run top to bottom as ONE scenario (each step builds on the
// state the previous one left). Every ok()/eq() becomes its own Vitest test below.
/**
 * The map controls ALONE: mountMapControls() against a stub DOM and a stub map, with a tiny fake
 * LayerDescriptor list and the real basemap catalog. No app, no network.
 */
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import * as catalog from "../src/basemaps";
import { ICONS } from "../src/icons";
import { mountMapControls, basemapStyle, serviceBlock, basemapTransformRequest } from "../src/map-controls";

const RESULTS = [];
let SECTION = "0";
const ok = (l, c, d = "") => { RESULTS.push({ section: SECTION, label: l, pass: !!c, detail: d }); };
const eq = (l, a, b) => ok(l, JSON.stringify(a) === JSON.stringify(b), `got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
const head = (t) => { SECTION = t; };
const tick = () => new Promise((r) => setTimeout(r, 0));

// ═══ a stub DOM — one stack-based parser for every innerHTML ═══
const VOID = new Set(["br", "hr", "img", "input", "meta", "link", "path", "rect", "circle", "line"]);
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
class El {
  constructor(tag = "div") {
    this.tag = String(tag).toLowerCase(); this.children = []; this.parent = null;
    this.attrs = {}; this.text = ""; this._html = ""; this.handlers = {}; this.style = {};
    this._rect = { width: 100, height: 30, top: 0, left: 0, bottom: 30 };
    this.dataset = new Proxy({}, {
      get: (_, k) => this.attrs[`data-${kebab(String(k))}`],
      set: (_, k, v) => { this.attrs[`data-${kebab(String(k))}`] = String(v); return true; },
      has: (_, k) => `data-${kebab(String(k))}` in this.attrs,
    });
    this.classList = {
      add: (c) => { const s = new Set(this.cls()); s.add(c); this.attrs.class = [...s].join(" "); },
      remove: (c) => { const s = new Set(this.cls()); s.delete(c); this.attrs.class = [...s].join(" "); },
      contains: (c) => this.cls().includes(c),
      toggle: (c, on) => { const want = on ?? !this.cls().includes(c); want ? this.classList.add(c) : this.classList.remove(c); },
    };
  }
  cls() { return (this.attrs.class ?? "").split(/\s+/).filter(Boolean); }
  get hidden() { return this.attrs.hidden === true || this.attrs.hidden === "true"; }
  set hidden(v) { if (v) this.attrs.hidden = true; else delete this.attrs.hidden; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  removeAttribute(k) { delete this.attrs[k]; }
  set innerHTML(v) { this._html = String(v); this.children = parse(String(v), this); }
  get innerHTML() { return this._html; }
  set textContent(v) { this.text = String(v); this.children = []; }
  get textContent() { return this.children.map((c) => c.textContent).join("") + this.text; }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter((x) => x !== this); this.parent = null; }
  addEventListener(t, fn) { (this.handlers[t] ??= []).push(fn); }
  removeEventListener(t, fn) { this.handlers[t] = (this.handlers[t] ?? []).filter((f) => f !== fn); }
  getBoundingClientRect() { return this._rect; }
  scrollIntoView() { this._scrolled = true; }
  focus() { globalThis.document.activeElement = this; }
  matches(sel) { return sel.split(",").some((s) => matchOne(this, s.trim())); }
  closest(sel) { let e = this; while (e) { if (e.matches?.(sel)) return e; e = e.parent; } return null; }
  all(sel) {
    const parts = sel.trim().split(/\s+/), last = parts.at(-1), out = [];
    walk(this, (e) => { if (matchOne(e, last) && ancestryOk(e, parts, this)) out.push(e); });
    return out;
  }
  querySelector(sel) { return this.all(sel)[0] ?? null; }
  querySelectorAll(sel) { return this.all(sel); }
}
function walk(e, fn) { for (const c of e.children) { fn(c); walk(c, fn); } }
function ancestryOk(el, parts, root) {
  let i = parts.length - 2, p = el.parent;
  while (p && i >= 0 && p !== root.parent) { if (matchOne(p, parts[i])) i--; p = p.parent; }
  return i < 0;
}
function matchOne(el, sel) {
  const m = sel.match(/^([a-zA-Z0-9]+)?((?:[#.][\w-]+|\[[^\]]+\])*)$/);
  if (!m) return false;
  if (m[1] && el.tag !== m[1].toLowerCase()) return false;
  for (const part of m[2].match(/[#.][\w-]+|\[[^\]]+\]/g) ?? []) {
    if (part[0] === "#") { if (el.attrs.id !== part.slice(1)) return false; }
    else if (part[0] === ".") { if (!el.cls().includes(part.slice(1))) return false; }
    else {
      const kv = part.slice(1, -1).match(/^([\w-]+)(?:="?([^"]*)"?)?$/);
      if (!kv || !(kv[1] in el.attrs)) return false;
      if (kv[2] != null && String(el.attrs[kv[1]]) !== kv[2]) return false;
    }
  }
  return true;
}
function parse(html, parent) {
  const root = new El("#frag"), stack = [root];
  const re = /<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)((?:\s+[a-zA-Z-]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[5] != null) { stack.at(-1).text += m[5]; continue; }
    if (m[1]) { if (stack.length > 1) stack.pop(); continue; }
    const el = new El(m[2]);
    for (const a of m[3]?.match(/[a-zA-Z-]+(?:="[^"]*")?/g) ?? []) {
      const i = a.indexOf("=");
      if (i < 0) el.attrs[a] = true; else el.attrs[a.slice(0, i)] = a.slice(i + 2, -1);
    }
    stack.at(-1).appendChild(el);
    if (!VOID.has(el.tag) && !m[4]) stack.push(el);
  }
  for (const k of root.children) k.parent = parent;
  return root.children;
}
function dispatch(target, type, init = {}) {
  const ev = { type, target, key: "", preventDefault() {}, stopPropagation() { ev._stop = true; }, ...init };
  for (let e = target; e && !ev._stop; e = e.parent) for (const fn of e.handlers[type] ?? []) fn.call(e, ev);
  return ev;
}
const click = (el) => dispatch(el, "click", { target: el });

const body = new El("body");
const DOC_HANDLERS = {};
globalThis.document = {
  body, activeElement: null, fullscreenEnabled: true, fullscreenElement: null,
  createElement: (t) => new El(t),
  addEventListener: (t, fn) => (DOC_HANDLERS[t] ??= []).push(fn),
  removeEventListener: (t, fn) => { DOC_HANDLERS[t] = (DOC_HANDLERS[t] ?? []).filter((f) => f !== fn); },
};
const fireDoc = (t) => { for (const fn of DOC_HANDLERS[t] ?? []) fn({ type: t }); };
El.prototype.requestFullscreen = function () { document.fullscreenElement = this; fireDoc("fullscreenchange"); return Promise.resolve(); };
document.exitFullscreen = () => { document.fullscreenElement = null; fireDoc("fullscreenchange"); return Promise.resolve(); };
const WIN = {};
globalThis.addEventListener = (t, fn) => (WIN[t] ??= []).push(fn);
globalThis.removeEventListener = (t, fn) => { WIN[t] = (WIN[t] ?? []).filter((f) => f !== fn); };
const winKey = (k) => { for (const fn of WIN.keydown ?? []) fn({ key: k, target: body, preventDefault() {} }); };

// ═══ a stub map: layer order, paint, layout, setStyle, on/off ═══
class MapStub {
  constructor() { this.order = []; this.paint = {}; this.layout = {}; this.handlers = {}; this.styles = []; this.calls = []; }
  addLayer(id, paint = {}) { this.order.push(id); this.paint[id] = { ...paint }; this.layout[id] = {}; }
  getLayer(id) { return this.order.includes(id) ? { id } : undefined; }
  moveLayer(id) { this.order = this.order.filter((x) => x !== id); this.order.push(id); }
  getLayoutProperty(id, k) { return this.layout[id]?.[k]; }
  setLayoutProperty(id, k, v) { this.layout[id][k] = v; }
  getPaintProperty(id, k) { return this.paint[id]?.[k]; }
  setPaintProperty(id, k, v) { if (v === undefined) delete this.paint[id][k]; else this.paint[id][k] = v; }
  setStyle(s) { this.styles.push(s); this.fire("styledata"); }
  on(t, fn) { (this.handlers[t] ??= []).push(fn); }
  off(t, fn) { this.handlers[t] = (this.handlers[t] ?? []).filter((f) => f !== fn); }
  fire(t) { for (const fn of this.handlers[t] ?? []) fn({}); }
  zoomIn() { this.calls.push("zoomIn"); } zoomOut() { this.calls.push("zoomOut"); }
  resize() { this.calls.push("resize"); }
}

// ═══ a tiny fake app: three layers, the app owns visibility ═══
const VIS = { pts: true, polys: true, grid: true };
const zooms = [];
const LAYERS = () => [
  { id: "pts", title: "Points", sub: "3 in view", swatch: '<span class="ll-dots"><i></i></span>', legend: '<div class="lg">points legend</div>',
    sublayers: [{ id: "pts-circle", opacity: { "circle-opacity": 1 } }], visible: VIS.pts, setVisible: (v) => { VIS.pts = v; },
    zoomTo: () => zooms.push("pts"), about: { what: "Some points.", publisher: "Me." }, technical: () => [{ title: "Local", source: "pts.geojson", rows: [["Features", "3"]], fields: [["id", ""]] }] },
  { id: "polys", title: "Polygons <b>&</b>", sublayers: [{ id: "polys-fill", opacity: { "fill-opacity": 0.5 } }, { id: "polys-line", opacity: { "line-opacity": 0.75 } }],
    visible: VIS.polys, setVisible: (v) => { VIS.polys = v; }, zoomTo: () => zooms.push("polys"),
    about: { what: "Some areas." }, services: [{ title: "Svc A", url: "https://a.example/FeatureServer/0", filter: "1=1" }, { title: "Svc B", url: "https://b.example/MapServer/2" }] },
  { id: "grid", title: "Grid", sublayers: [{ id: "grid-raster", opacity: { "raster-opacity": 0.5 } }], visible: VIS.grid, setVisible: (v) => { VIS.grid = v; } },
];
const metaHits = [], failing = new Set();
const fetchStub = async (u) => {
  metaHits.push(String(u));
  if ([...failing].some((f) => String(u).includes(f))) return { ok: false, status: 503, json: async () => ({}) };
  return { ok: true, json: async () => ({ geometryType: "esriGeometryPolygon", objectIdField: "FID", fields: [{ name: "FID", type: "esriFieldTypeOID" }],
    extent: { xmin: -120, ymin: 30, xmax: -110, ymax: 40, spatialReference: { wkid: 4326 } }, copyrightText: "<b>Someone</b>" }) };
};
const map = new MapStub();
for (const [id, p] of [["base", {}], ["grid-raster", { "raster-opacity": 0.5 }], ["polys-fill", { "fill-opacity": 0.5 }], ["polys-line", { "line-opacity": 0.75 }], ["pts-circle", {}]]) map.addLayer(id, p);
const container = new El("section"); body.appendChild(container);
let legendOpen = true, fits = 0, restyles = 0, panelClicks = 0, extentOn = false;
const EXTRAS = ["esri-hillshade", "usgs-imagery-topo"];
const opts = {
  container, catalog, recommendedExtras: EXTRAS, theme: { mode: "light" },
  layers: LAYERS, defaultOrder: ["pts", "polys", "grid"],
  panelSettings: { html: () => `<button class="opt" data-set="x" aria-checked="${extentOn}">Toggle</button>`,
                   onClick: (e) => { if (!e.target.closest("[data-set]")) return false; extentOn = !extentOn; panelClicks++; return true; } },
  onRestyle: () => { restyles++; }, onFit: () => { fits++; },
  onToggleLegend: () => { legendOpen = !legendOpen; }, legendOpen: () => legendOpen,
  fetch: fetchStub,
};
const C = mountMapControls(map, opts);
const ctl = C.elements.cluster, D = C.elements.drawer;
const acts = () => ctl.all("button").map((b) => b.attrs["data-act"]);

head("1 · Mount and the cluster");
ok("the container is the scoped root (.smc) with the theme mode on it", container.cls().includes("smc") && container.attrs["data-smc-mode"] === "light");
ok("the cluster and the drawer are created inside it", container.children.includes(ctl) && container.children.includes(D) && ctl.cls().includes("smc-ctl") && D.cls().includes("smc-drawer"));
eq("cluster order: zoom in, zoom out, home, layers, basemap, legend, full screen", acts(), ["zin", "zout", "fit", "layers", "base", "legend", "fullscreen"]);
ok("every button is labelled and titled", ctl.all("button").every((b) => b.attrs["aria-label"] && b.attrs.title));
ok("the legend button reflects legendOpen()", ctl.querySelector('[data-act="legend"]').attrs["aria-expanded"] === "true");
click(ctl.querySelector('[data-act="zin"]')); click(ctl.querySelector('[data-act="zout"]')); click(ctl.querySelector('[data-act="fit"]'));
ok("zoom in / zoom out drive the map, home calls onFit", map.calls.join() === "zoomIn,zoomOut" && fits === 1);
click(ctl.querySelector('[data-act="legend"]'));
ok("legend calls onToggleLegend and re-syncs aria-expanded", legendOpen === false && ctl.querySelector('[data-act="legend"]').attrs["aria-expanded"] === "false");
{
  const c2 = new El("div"); body.appendChild(c2);
  const bare = mountMapControls(null, { container: c2, catalog, keyboard: false });
  eq("an app that passes no layers / onFit / legend gets just zoom, basemap, full screen", bare.elements.cluster.all("button").map((b) => b.attrs["data-act"]), ["zin", "zout", "base", "fullscreen"]);
  bare.destroy();
  const c3 = new El("div"); body.appendChild(c3);
  let measured = 0;
  const t = mountMapControls(null, { container: c3, catalog, keyboard: false, tools: { measure: { onClick: () => measured++ }, print: { title: "Print map", onClick() {} } } });
  const ta = t.elements.cluster.all("button").map((b) => b.attrs["data-act"]);
  ok("a legacy { onClick } tool still renders as a plain custom button, in the tools group after full screen", ta.join() === "zin,zout,base,fullscreen,tool-measure,tool-print", ta.join());
  click(t.elements.cluster.querySelector('[data-act="tool-measure"]'));
  ok("…a custom tool button calls its onClick and takes over no mode", measured === 1 && t.getMode() === "identify" && t.elements.cluster.querySelector('[data-act="tool-print"]').attrs.title === "Print map");
  t.destroy();
}

head("2 · One icon family (icons.ts)");
const SRC = readFileSync(new URL("../src/icons.ts", import.meta.url), "utf8");
ok("icons.ts carries the Lucide ISC licence notice", /ISC License/.test(SRC) && /Lucide Contributors/.test(SRC));
ok("…and no Calcite glyph remains anywhere in the module", !/calcite/i.test(readFileSync(new URL("../src/map-controls.ts", import.meta.url), "utf8")));
const NEED = ["zoomIn", "zoomOut", "home", "layers", "basemap", "legend", "fsEnter", "fsExit", "eye", "eyeOff", "chevron", "more", "grip",
  "zoomTo", "info", "up", "down", "legendList", "reset", "check", "external", "locate", "measure", "draw", "search", "print"];
ok("every required glyph exists", NEED.every((k) => typeof ICONS[k] === "string"), NEED.filter((k) => !ICONS[k]).join());
ok("every glyph: one 24×24 stroked svg.smc-i, aria-hidden, no inline fill/stroke/size (CSS themes it in currentColor)",
   Object.values(ICONS).every((s) => /^<svg class="smc-i" viewBox="0 0 24 24" aria-hidden="true"/.test(s) && !/\b(fill|stroke|stroke-width|width|height)=/.test(s.replace(/<rect[^>]*>/g, ""))));
const svgsIn = (html) => html.match(/<svg[\s\S]*?<\/svg>/g) ?? [];
const known = new Set(Object.values(ICONS));
C.openDrawer("layers");
for (const id of ["pts", "polys"]) click(D.querySelector(`.ll-row[data-ll-id="${id}"] [data-ll-act="acts"]`));
const layersSvgs = svgsIn(D.innerHTML);
C.openDrawer("base");
const allSvgs = [...svgsIn(ctl.innerHTML), ...layersSvgs, ...svgsIn(D.innerHTML)];
ok(`every glyph on screen (${allSvgs.length}: cluster, layer list with actions, gallery) comes from icons.ts`, allSvgs.length > 30 && allSvgs.every((s) => known.has(s)));
const CSS = readFileSync(new URL("../src/map-controls.css", import.meta.url), "utf8");
/** Split a selector list on its TOP-LEVEL commas only (not those inside :is() / :where()). */
const topLevelCommas = (sel) => { const out = []; let d = 0, cur = ""; for (const ch of sel) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && d === 0) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; };
ok("map-controls.css strokes every .smc-i in currentColor at 1.7", /\.smc svg\.smc-i\{fill:none;stroke:currentColor;stroke-width:1\.7/.test(CSS));
ok("…and every rule is scoped under .smc (or a zero-specificity :where)", CSS.replace(/\/\*[\s\S]*?\*\//g, "").split("}").map((r) => r.trim()).filter((r) => r.includes("{"))
   .every((r) => topLevelCommas(r.split("{")[0]).every((sel) => /^\s*(\.smc\b|:where\(\.smc)/.test(sel))));

head("3 · Drawers are exclusive; Esc");
C.closeAll();
C.openDrawer("layers");
ok("Layers opens the drawer, aria-expanded on its button", !D.hidden && D.dataset.which === "layers" && ctl.querySelector('[data-act="layers"]').attrs["aria-expanded"] === "true");
click(ctl.querySelector('[data-act="base"]'));
ok("Basemap replaces it — one drawer at a time", D.dataset.which === "base" && ctl.querySelector('[data-act="layers"]').attrs["aria-expanded"] === "false" &&
   ctl.querySelector('[data-act="base"]').attrs["aria-expanded"] === "true");
click(ctl.querySelector('[data-act="base"]'));
ok("pressing it again closes it", D.hidden === true && ctl.querySelector('[data-act="base"]').attrs["aria-expanded"] === "false");
winKey("l");
ok("L opens the layers (window keyboard, keyboard: true)", !D.hidden && D.dataset.which === "layers");
winKey("b");
ok("B switches to the basemap gallery", D.dataset.which === "base");
winKey("Escape");
ok("Esc closes the drawer", D.hidden === true);
eq("…and a second Esc is not consumed (the app's own chain gets it)", C.escape(), false);
winKey("g"); ok("G toggles the legend", legendOpen === true);
winKey("f"); ok("F calls onFit", fits === 2);
C.openDrawer("layers");
click(ctl.querySelector('[data-act="fullscreen"]'));
await tick();
ok("full screen targets the container; the button flips; the map resizes", document.fullscreenElement === container &&
   ctl.querySelector('[data-act="fullscreen"]').attrs["aria-pressed"] === "true" && map.calls.includes("resize"));
document.exitFullscreen();
ok("a native exit resets the button…", ctl.querySelector('[data-act="fullscreen"]').attrs["aria-pressed"] === "false");
ok("…and the Esc that caused it is swallowed: consumed, drawer still open", C.escape() === true && D.hidden === false);
C.closeAll();
{
  const row = () => D.querySelector('.ll-row[data-ll-id="pts"]');
  C.openDrawer("layers");
  if (D.querySelector('.ll-row[data-ll-id="pts"] .ll-acts').hidden) click(row().querySelector('[data-ll-act="acts"]'));
  const z = row().querySelector('[data-ll-cmd="zoom"]'); z.focus();
  const ev = dispatch(z, "keydown", { target: z, key: "Escape" });
  ok("Esc inside an actions section collapses it, focus back on its '…', and stops there", row().querySelector(".ll-acts").hidden === true &&
     document.activeElement === row().querySelector('[data-ll-act="acts"]') && ev._stop === true && !D.hidden);
  C.closeAll();
}

head("4 · Theme follow and the pair swap");
eq("Follow the theme by default: light → the light theme basemap", [C.state.autoBasemap, C.effectiveBasemap()], [true, "osm"]);
const n0 = map.styles.length;
C.setTheme("light");
ok("the same mode again changes nothing", map.styles.length === n0);
C.setTheme("dark");
ok("dark → its pair, via setStyle, and onRestyle fires on styledata", C.effectiveBasemap() === "osm-dark" && map.styles.length === n0 + 1 &&
   JSON.stringify(map.styles.at(-1)) === JSON.stringify(basemapStyle(catalog, "osm-dark")) && restyles >= 1);
ok("…and the root carries data-smc-mode=dark", container.attrs["data-smc-mode"] === "dark");
C.setTheme("light");
const paired = catalog.BASEMAPS.find((b) => b.pair && b.mode === "light" && catalog.BASEMAPS.find((x) => x.id === b.pair)?.mode === "dark");
C.setBasemap(paired.id);
ok(`an explicit pick outranks the theme (${paired.id})`, C.state.autoBasemap === false && C.getBasemap() === paired.id);
let n = map.styles.length;
C.setTheme("dark");
ok(`…a paired pick swaps to its pair on a theme change (→ ${paired.pair}), stays explicit, one restyle`,
   C.getBasemap() === paired.pair && C.state.autoBasemap === false && map.styles.length === n + 1);
C.setTheme("light");
const lone = catalog.BASEMAPS.find((b) => !b.pair);
C.setBasemap(lone.id); n = map.styles.length;
C.setTheme("dark");
ok(`…an unpaired pick (${lone.id}) is left alone`, C.getBasemap() === lone.id && map.styles.length === n);
C.setTheme("light");
C.setBasemap("osm-fr");
ok("setBasemap resolves aliases (osm-fr → osm)", C.getBasemap() === "osm");
C.setBasemap("auto");
ok("setBasemap('auto') follows the theme again", C.state.autoBasemap === true && C.getBasemap() === null);
{
  C.openDrawer("base");
  const sw = () => D.querySelector('[data-base="__auto"]');
  n = map.styles.length;
  click(sw());
  ok("the Follow switch off keeps the basemap in force as an explicit pick, with no restyle",
     C.state.autoBasemap === false && C.state.basemap === "osm" && map.styles.length === n && sw().attrs["aria-checked"] === "false");
  click(sw());
  ok("…and back on restyles to the theme's basemap", C.state.autoBasemap === true && map.styles.length === n + 1);
  const info = D.all(".bm-info")[1];
  dispatch(info, "mouseover", { target: info }); click(info);
  ok("the info icon shows its tooltip and selects nothing", D.querySelector("#bm-tip").hidden === false && C.state.autoBasemap === true);
  C.closeAll();
}
{
  const c4 = new El("div"); body.appendChild(c4);
  const m4 = new MapStub();
  const i4 = mountMapControls(m4, { container: c4, catalog, keyboard: false, initialBasemap: "esri-topo", themeBasemaps: { light: "carto-positron", dark: "carto-dark-matter" } });
  ok("initialBasemap is an explicit pick; themeBasemaps overrides the pair", i4.effectiveBasemap() === "esri-topo" && i4.state.autoBasemap === false);
  i4.setBasemap("auto");
  ok("…following the theme then uses that pair", i4.effectiveBasemap() === "carto-positron");
  i4.destroy();
}

head("5 · Recommended / More, with the app's extras");
const REC = catalog.recommendedWith(EXTRAS);
C.state.moreOpen = false;
C.openDrawer("base");
const sec = (s) => D.all(`[data-section="${s}"] .bm-pick`).map((p) => p.attrs["data-base"]);
eq("Recommended = the universal 8 + the app's extras, in order", sec("recommended"), REC);
ok("…which is 10 here, and the extras are last", REC.length === 10 && REC.slice(-2).join() === EXTRAS.join());
const MORE = catalog.BASEMAPS.filter((b) => !REC.includes(b.id));
eq("More holds every other basemap, in catalog order, none repeated", sec("more"), MORE.map((b) => b.id));
ok("More carries the count and is collapsed by default", D.querySelector("[data-bmmore] .n").textContent === `(${MORE.length})` &&
   D.querySelector("#bm-more-body").hidden === true && D.querySelector("[data-bmmore]").attrs["aria-expanded"] === "false");
eq("More's group headings follow the catalog groups", D.all(".bm-group").map((g) => g.textContent), [...new Set(MORE.map((b) => b.group))]);
click(D.querySelector("[data-bmmore]"));
ok("clicking More expands it in place", D.querySelector("#bm-more-body").hidden === false && C.state.moreOpen === true);
click(D.querySelector("[data-bmmore]"));
const far = MORE.at(-1);
click(D.all(".bm-pick").find((p) => p.attrs["data-base"] === far.id));
ok(`picking a More basemap (${far.id}) applies it`, C.effectiveBasemap() === far.id && D.all(".bm-pick").filter((p) => p.attrs["aria-checked"] === "true").map((p) => p.attrs["data-base"]).join() === far.id);
C.closeAll(); C.state.moreOpen = false;
C.openDrawer("base");
ok("reopening with a More basemap selected auto-expands More and scrolls the card into view",
   D.querySelector("#bm-more-body").hidden === false && D.all(".bm-pick").find((p) => p.attrs["aria-checked"] === "true")?._scrolled === true);
ok("every card: thumbnail from the catalog, title, a sibling info icon with the description",
   D.all(".bm-card").every((c) => { const b = catalog.basemapById(c.querySelector(".bm-pick").attrs["data-base"]);
     return c.querySelector("img")?.attrs.src === b.thumbnail && c.querySelector(".bm-title").textContent === b.title && !c.querySelector(".bm-pick .bm-info"); }));
C.setBasemap("auto"); C.closeAll(); C.state.moreOpen = false;

head("6 · resolveUrl is applied to every basemap URL");
{
  catalog.setUrlRewrite({ "server.arcgisonline.com": "https://mirror.example/esri", "tiles.versatiles.org": "https://mirror.example/vt", "tile.openstreetmap.org": "https://mirror.example/osm" });
  const ov = catalog.BASEMAPS.find((b) => b.templateUrl && b.overlay && b.templateUrl.includes("server.arcgisonline.com"));
  const st = C.styleFor(ov.id);
  ok(`a raster base AND its overlay go through resolveUrl (${ov.id}), then the ESRI tokens are rewritten`,
     st.sources.base.tiles[0].startsWith("https://mirror.example/esri/") && st.sources.overlay.tiles[0].startsWith("https://mirror.example/esri/") &&
     !/\{level\}|\{row\}|\{col\}/.test(st.sources.base.tiles[0] + st.sources.overlay.tiles[0]));
  const vec = catalog.BASEMAPS.find((b) => b.style?.includes("tiles.versatiles.org"));
  ok(`a vector style URL goes through it too (${vec?.id})`, !vec || C.styleFor(vec.id).startsWith("https://mirror.example/vt/"));
  n = map.styles.length;
  C.setTheme("dark"); C.setTheme("light");
  ok("…and so does the theme swap's setStyle", map.styles.slice(n).every((s) => JSON.stringify(s).includes("mirror.example")));
  const tr = basemapTransformRequest(catalog);
  ok("basemapTransformRequest rewrites a URL inside a GL style (MapLibre transformRequest)",
     tr("https://tiles.versatiles.org/tiles/osm/1/2/3")?.url === "https://mirror.example/vt/tiles/osm/1/2/3" && tr("https://other.example/x") === undefined);
  catalog.setUrlRewrite(null);
  ok("…and is the identity with no rule", tr("https://tiles.versatiles.org/tiles/osm/1/2/3") === undefined);
  ok("with no rule it is the identity", C.styleFor("osm").sources.base.tiles[0] === catalog.toXyz(catalog.basemapById("osm").templateUrl));
  eq("'none' is a blank ground (with glyphs, so app labels still draw), not a crash", basemapStyle(catalog, "none"),
     { version: 8, glyphs: catalog.DEFAULT_GLYPHS, sources: {}, layers: [] });
  ok("a raster basemap style carries the catalog's keyless glyphs (labels draw on it)", C.styleFor("osm").glyphs === catalog.DEFAULT_GLYPHS);
  {
    const cg = new El("div"); body.appendChild(cg);
    const own = "https://fonts.example.org/{fontstack}/{range}.pbf";
    const g = mountMapControls(null, { container: cg, catalog, keyboard: false, glyphs: own });
    ok("opts.glyphs: the app's own glyph URL is kept on every raster style (not clobbered)",
       g.styleFor("osm").glyphs === own && g.styleFor("esri-imagery-hybrid").glyphs === own && g.initialStyle().glyphs === own);
    g.destroy();
  }
}

head("7 · The layer list and its actions");
C.openDrawer("layers");
const rows = () => D.all(".ll-row").map((r) => r.attrs["data-ll-id"]);
const row = (id) => D.querySelector(`.ll-row[data-ll-id="${id}"]`);
const act = (id, a) => row(id).querySelector(`[data-ll-act="${a}"]`);
const tool = (id, c) => row(id).querySelector(`.ll-acts [data-ll-cmd="${c}"]`);
const openActs = (id) => { if (row(id).querySelector(".ll-acts").hidden) click(act(id, "acts")); };
const cmd = (id, c) => { openActs(id); click(tool(id, c)); };
const above = (a, b) => map.order.indexOf(a) > map.order.indexOf(b);
C.applyLayerState();
eq("one row per descriptor, in the default order", rows(), ["pts", "polys", "grid"]);
ok("…and the map's drawing order follows the list (top row on top, sublayers bottom → top)",
   above("pts-circle", "polys-line") && above("polys-line", "polys-fill") && above("polys-fill", "grid-raster") && map.order[0] === "base");
ok("titles are escaped", row("polys").querySelector(".ll-name .t").attrs.title === "Polygons &lt;b&gt;&amp;&lt;/b&gt;");
ok("the basemap row names the basemap in force", /Basemap: OpenStreetMap/.test(D.querySelector(".ll-base").textContent));
ok("the panel settings render under a 'Panel settings' heading", D.querySelector(".ll-set h3")?.textContent === "Panel settings" && !!D.querySelector('.ll-set [data-set="x"]'));
click(D.querySelector('.ll-set [data-set="x"]'));
ok("…and a click the app handles re-renders the drawer", panelClicks === 1 && D.querySelector('.ll-set [data-set="x"]').attrs["aria-checked"] === "true");
cmd("polys", "up");
eq("Move up", rows(), ["polys", "pts", "grid"]);
ok("…the map follows", above("polys-fill", "pts-circle") && above("polys-line", "polys-fill"));
ok("…at the top Move up is disabled and focus falls to Move down", tool("polys", "up").attrs.disabled != null && document.activeElement === tool("polys", "down"));
cmd("grid", "down");
eq("a disabled Move down at the bottom does nothing", rows(), ["polys", "pts", "grid"]);
cmd("polys", "down");
eq("Move down", rows(), ["pts", "polys", "grid"]);
cmd("grid", "up"); cmd("grid", "up");
eq("Move up twice puts the grid on top", rows(), ["grid", "pts", "polys"]);
ok("…and on top of the map", map.order.at(-1) === "grid-raster");
{
  const s = row("polys").querySelector("[data-ll-opacity]");
  s.attrs.value = "60"; s.value = "60";
  dispatch(s, "input", { target: s });
  ok("transparency 60 % multiplies the authored opacity (0.5 → 0.2, 0.75 → 0.3)",
     Math.abs(map.getPaintProperty("polys-fill", "fill-opacity") - 0.2) < 1e-9 && Math.abs(map.getPaintProperty("polys-line", "line-opacity") - 0.3) < 1e-9);
  ok("…the label and aria-valuetext follow", row("polys").querySelector("[data-ll-pct]").textContent === "60%" && s.attrs["aria-valuetext"] === "60% transparent");
  s.value = "-40"; dispatch(s, "input", { target: s });
  ok("…a value below 0 is clamped: the layer never gets MORE opaque than authored", map.getPaintProperty("polys-fill", "fill-opacity") === 0.5 && map.getPaintProperty("polys-line", "line-opacity") === 0.75);
  const p = row("pts").querySelector("[data-ll-opacity]");
  p.value = "0"; dispatch(p, "input", { target: p });
  ok("…an authored 1 at 0 % is WRITTEN as 1 — never left unset (an unset line-opacity drew nothing in MapLibre 4.7)", map.getPaintProperty("pts-circle", "circle-opacity") === 1);
  p.value = "100"; dispatch(p, "input", { target: p });
  ok("…and 100 % is fully transparent", map.getPaintProperty("pts-circle", "circle-opacity") === 0);
  s.value = "60"; dispatch(s, "input", { target: s });
}
click(act("polys", "eye"));
ok("the eye asks the app (setVisible) and hides every sublayer; the row dims; focus stays", VIS.polys === false &&
   map.getLayoutProperty("polys-fill", "visibility") === "none" && map.getLayoutProperty("polys-line", "visibility") === "none" &&
   row("polys").cls().includes("off") && document.activeElement === act("polys", "eye"));
click(act("pts", "expand"));
ok("the chevron opens the inline legend only", !row("pts").querySelector(".ll-legend").hidden && /points legend/.test(row("pts").querySelector(".ll-legend").textContent));
openActs("pts");
ok("…and the actions' legend button reads Hide legend (one state)", /Hide legend/.test(tool("pts", "legend").textContent));
cmd("pts", "legend");
ok("Show legend / Hide legend drives the same legend", row("pts").querySelector(".ll-legend").hidden === true && act("pts", "expand").attrs["aria-expanded"] === "false");
cmd("pts", "zoom");
ok("Zoom to layer calls the descriptor's zoomTo", zooms.at(-1) === "pts");
openActs("grid");
ok("a descriptor without zoomTo gets a disabled Zoom to layer", tool("grid", "zoom").attrs.disabled != null);
cmd("polys", "reset");
eq("Reset puts the layer back in its default place relative to the others", rows(), ["grid", "pts", "polys"].filter((x) => x !== "polys").concat("polys"));
ok("…restores its opacity and makes it visible again", map.getPaintProperty("polys-fill", "fill-opacity") === 0.5 && VIS.polys === true &&
   map.getLayoutProperty("polys-fill", "visibility") === "visible");
cmd("grid", "reset");
eq("…and Reset on the grid returns it to the bottom", rows(), ["pts", "polys", "grid"]);
{
  // the state survives a re-render and a restyle — order, transparency, expanded rows
  cmd("polys", "up");
  const s = row("polys").querySelector("[data-ll-opacity]"); s.value = "50"; dispatch(s, "input", { target: s });
  C.refresh();
  ok("the list's state survives a re-render (order, open sections, transparency)", rows().join() === "polys,pts,grid" &&
     !row("polys").querySelector(".ll-acts").hidden && row("polys").querySelector("[data-ll-pct]").textContent === "50%");
  // a restyle drops every layer; the app re-adds them, then applyLayerState() re-applies the reader's choices
  map.order = ["base"]; for (const id of ["grid-raster", "polys-fill", "polys-line", "pts-circle"]) map.addLayer(id, id === "polys-fill" ? { "fill-opacity": 0.5 } : {});
  C.applyLayerState();
  ok("…and a restyle, once applyLayerState() runs", above("polys-line", "pts-circle") && map.getPaintProperty("polys-fill", "fill-opacity") === 0.25);
  cmd("polys", "reset");
}
{
  rows().forEach((id, i) => { row(id)._rect = { top: 100 + i * 40, height: 40, left: 0, width: 300 }; });
  const g = act("grid", "grip");
  dispatch(g, "pointerdown", { target: g, clientY: 190 });
  for (const fn of WIN.pointermove ?? []) fn({ clientY: 90 });
  ok("dragging a grip marks the row and shows the drop line", row("grid").cls().includes("dragging") && row("pts").cls().includes("drop-before"));
  for (const fn of [...(WIN.pointerup ?? [])]) fn({ clientY: 90 });
  eq("…dropping reorders the list and the map", rows(), ["grid", "pts", "polys"]);
  ok("…and removes its window listeners", !(WIN.pointermove ?? []).length && !(WIN.pointerup ?? []).length);
  cmd("grid", "reset");
}

head("8 · Layer information and Technical details");
{
  const info = (id) => row(id).querySelector(".ll-info");
  const techBtn = (id) => row(id).querySelector('[data-ll-cmd="tech"]');
  const blocks = (id) => row(id).all(".ll-tech .ll-svc");
  openActs("polys");
  click(tool("polys", "info"));
  ok("Layer information opens inline with the plain answers, in the fixed order", !info("polys").hidden &&
     info("polys").all(".ll-about dt").map((x) => x.textContent).join("|") === "What it shows");
  eq("…and nothing is fetched until Technical details is opened", metaHits.length, 0);
  click(techBtn("polys"));
  ok("opening it fetches each service's ?f=json ONCE and shows Loading…", metaHits.length === 2 && metaHits.every((u) => u.endsWith("?f=json")) &&
     blocks("polys").every((b) => /Loading…/.test(b.textContent)));
  ok("…focus stays on the disclosure", document.activeElement === techBtn("polys"));
  await tick(); await tick();
  ok("then renders what the service says, escaped (FID declared, 4326, copyright stripped of tags)",
     /FID \(declared by the service\)/.test(blocks("polys")[0].textContent) && /EPSG:4326/.test(blocks("polys")[0].textContent) &&
     /Someone/.test(blocks("polys")[0].textContent) && !blocks("polys")[0].all("b").length && /none \(every feature\)/.test(blocks("polys")[0].textContent));
  click(techBtn("polys")); click(techBtn("polys"));
  ok("closing and reopening is served from the session cache — no refetch", metaHits.length === 2 && !/Loading…/.test(row("polys").querySelector(".ll-tech").textContent));
  C.LL.meta.clear(); failing.add("b.example");
  click(techBtn("polys")); click(techBtn("polys"));
  await tick(); await tick();
  const errBlock = blocks("polys")[1];
  ok("a failing service says so, with Retry, while the other renders", /Couldn't load technical details/.test(errBlock.textContent) &&
     !!errBlock.querySelector('[data-ll-cmd="tech-retry"]') && /EPSG:4326/.test(blocks("polys")[0].textContent));
  const before = metaHits.length;
  failing.clear();
  click(row("polys").querySelector("[data-ll-cmd=\"tech-retry\"]"));
  ok("…the failure was cached (no refetch on re-render) until Retry refetches only that service", metaHits.length === before + 1 && metaHits.at(-1).includes("b.example") &&
     document.activeElement === techBtn("polys"));
  await tick(); await tick();
  ok("…and then renders it", /EPSG:4326/.test(blocks("polys")[1].textContent));
  openActs("pts"); click(tool("pts", "info")); click(techBtn("pts"));
  ok("local technical() blocks render without any fetch", metaHits.length === before + 1 && /pts\.geojson/.test(row("pts").querySelector(".ll-tech").textContent));
  const sb = serviceBlock({ pixelType: "F32", bandCount: 1, pixelSizeX: 100, pixelSizeY: 100 });
  ok("serviceBlock reads an image service as pixels, and never invents an OID field",
     sb.rows.some(([k, v]) => k === "Pixel type" && v === "F32") && sb.rows.some(([k, v]) => k === "Object ID field" && v === "None declared by the service"));
}

head("9 · destroy()");
{
  const winBefore = (WIN.keydown ?? []).length;
  C.destroy();
  ok("removes the elements it created", !container.children.includes(ctl) && !container.children.includes(D));
  ok("takes every listener off: cluster, drawer, document, window, map", Object.values(ctl.handlers).every((a) => !a.length) &&
     Object.values(D.handlers).every((a) => !a.length) && Object.values(DOC_HANDLERS).every((a) => !a.length) &&
     (WIN.keydown ?? []).length === winBefore - 1 && !(map.handlers.styledata ?? []).length);
  ok("…and un-scopes the container", !container.cls().includes("smc") && container.attrs["data-smc-mode"] == null);
  const r0 = restyles; map.fire("styledata");
  ok("…so a later restyle no longer reaches onRestyle", restyles === r0);
  const html = D.innerHTML, which = D.dataset.which;
  winKey("b");
  ok("…and the keyboard no longer reaches it", D.innerHTML === html && D.dataset.which === which);
  // with app-supplied elements, destroy() leaves them in place, empty
  const own = new El("div"), dr = new El("div"), box = new El("section"); box.appendChild(own); box.appendChild(dr);
  const x = mountMapControls(new MapStub(), { container: box, catalog, cluster: own, drawer: dr, keyboard: false });
  x.openDrawer("base"); x.destroy();
  ok("app-supplied cluster/drawer are emptied, hidden and kept", box.children.length === 2 && own.innerHTML === "" && dr.innerHTML === "" && dr.hidden === true);
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// 10 · the OPTIONAL tools (tools.ts) — off by default, each on only when an app asks
// ═══════════════════════════════════════════════════════════════════════════════════════════
const T = await import("../src/tools");
/** A richer map stub: sources, events with payloads, canvas, camera calls, render. */
class ToolMap extends MapStub {
  constructor() {
    super();
    this.sources = {}; this.cam = []; this.qrf = []; this.zoom = 5; this.center = { lng: 0, lat: 0 };
    this.canvas = new El("canvas"); Object.assign(this.canvas, { width: 1600, height: 1000, clientWidth: 800 });
    this.box = new El("div"); this.box.innerHTML = '<div class="maplibregl-ctrl-attrib-inner">© OpenStreetMap contributors</div>';
    const dz = { on: true }; this.doubleClickZoom = { isEnabled: () => dz.on, enable: () => { dz.on = true; }, disable: () => { dz.on = false; } };
  }
  addLayer(def, paint) { if (typeof def === "string") return super.addLayer(def, paint); this.order.push(def.id); this.paint[def.id] = { ...(def.paint ?? {}) }; this.layout[def.id] = {}; }
  removeLayer(id) { this.order = this.order.filter((x) => x !== id); }
  addSource(id, spec) { const s = { spec, data: spec.data, setData(d) { this.data = d; } }; this.sources[id] = s; }
  getSource(id) { return this.sources[id]; }
  removeSource(id) { delete this.sources[id]; }
  setStyle(s) { this.styles.push(s); this.sources = {}; this.order = this.order.filter((id) => !id.startsWith("smc-")); this.fire("styledata"); }
  fire(t, ev = {}) { for (const fn of [...(this.handlers[t] ?? [])]) fn(ev); }
  once(t, fn) { const w = (e) => { this.off(t, w); fn(e); }; this.on(t, w); }
  triggerRepaint() { this.fire("render"); }
  getCanvas() { return this.canvas; }
  getContainer() { return this.box; }
  getZoom() { return this.zoom; }
  getCenter() { return this.center; }
  flyTo(o) { this.cam.push(["flyTo", o]); }
  fitBounds(b, o) { this.cam.push(["fitBounds", b, o]); }
  queryRenderedFeatures() { return this.qrf; }
  getStyle() { return { sources: {} }; }
}
// a 2D-canvas stub for print
const drawn = [];
const realCreate = document.createElement;
document.createElement = (t) => {
  const el = realCreate(t);
  if (String(t).toLowerCase() === "canvas") {
    el.getContext = () => ({ fillRect() {}, drawImage: (src) => drawn.push(["image", src]), fillText: (s) => drawn.push(["text", s]),
      measureText: (s) => ({ width: String(s).length * 6 }), set font(v) {}, set fillStyle(v) {}, set textAlign(v) {}, set textBaseline(v) {} });
    el.toDataURL = (type) => `data:${type};base64,iVBORw0KGgoAAAANSUhEUg==`;
  }
  return el;
};
const toolActs = (c) => c.elements.cluster.all("button").filter((b) => b.attrs["data-tool"]).map((b) => b.attrs["data-tool"]);
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const mapEv = (lng, lat, x = lng * 10, y = lat * 10) => ({ lngLat: { lng, lat }, point: { x, y }, preventDefault() { this.prevented = true; } });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

head("10 · Optional tools: off by default, on only when asked, in a fixed order");
{
  const box = new El("section"); body.appendChild(box);
  const m = new ToolMap();
  const c = mountMapControls(m, { container: box, catalog, keyboard: false, layers: LAYERS, onFit() {}, onToggleLegend() {}, legendOpen: () => false });
  eq("a default mount renders NO tool buttons — exactly zoom, zoom, home, layers, basemap, legend, full screen",
     c.elements.cluster.all("button").map((b) => b.attrs["data-act"]), ["zin", "zout", "fit", "layers", "base", "legend", "fullscreen"]);
  ok("…no tools separator, no tool panel, no toast, and no smc- source on the map",
     !c.elements.cluster.querySelector(".smc-sep") && !box.querySelector(".smc-tpanel") && !box.querySelector(".smc-toast") && Object.keys(m.sources).length === 0);
  ok("…and the map stays in identify mode: isBusy() false, getMode() identify", c.isBusy() === false && c.getMode() === "identify");
  ok("…and no map click / dblclick / mousemove listener is added", !(m.handlers.click ?? []).length && !(m.handlers.dblclick ?? []).length && !(m.handlers.mousemove ?? []).length);
  c.destroy();

  for (const t of T.TOOL_ORDER) {
    const b2 = new El("section"); body.appendChild(b2);
    const x = mountMapControls(new ToolMap(), { container: b2, catalog, keyboard: false, tools: { [t]: true } });
    eq(`tools: { ${t}: true } renders only the ${t} button`, toolActs(x), [t]);
    x.destroy();
  }
  const b3 = new El("section"); body.appendChild(b3);
  const all = mountMapControls(new ToolMap(), { container: b3, catalog, keyboard: false, onFit() {}, tools: { print: true, draw: true, measure: true, locate: true, search: true, bogus: true } });
  eq("all on (given in any key order): a second group AFTER the defaults, always search · locate · measure · draw · print",
     all.elements.cluster.all("button").map((b) => b.attrs["data-act"]), ["zin", "zout", "fit", "base", "fullscreen", "tool-search", "tool-locate", "tool-measure", "tool-draw", "tool-print"]);
  const kids = all.elements.cluster.children.map((k) => k.attrs["data-act"] ?? k.cls().join());
  ok("…separated from the defaults by one separator, right after full screen", kids.indexOf("smc-sep") === kids.indexOf("fullscreen") + 1 && kids.filter((k) => k === "smc-sep").length === 1, kids.join());
  const tb = all.elements.cluster.all("button").filter((b) => b.attrs["data-tool"]);
  ok("…every tool button is titled and labelled, with its Lucide glyph from icons.ts",
     tb.length === 5 && tb.every((b) => b.attrs.title && b.attrs["aria-label"]) &&
     T.TOOL_ORDER.every((t) => all.elements.cluster.innerHTML.split("<button").some((seg) => seg.includes(`data-tool="${t}"`) && seg.includes(`>${ICONS[t]}</button>`))));
  const q = (t) => all.elements.cluster.querySelector(`[data-tool="${t}"]`);
  ok("…panel tools expose aria-expanded + aria-controls; locate is a toggle (aria-pressed); print is an action",
     ["search", "measure", "draw"].every((t) => q(t).attrs["aria-expanded"] === "false" && q(t).attrs["aria-controls"]) &&
     q("locate").attrs["aria-pressed"] === "false" && q("print").attrs["aria-pressed"] == null);
  all.destroy();
  const b4 = new El("section"); body.appendChild(b4);
  const evil = mountMapControls(null, { container: b4, catalog, keyboard: false, tools: { print: { title: '<img src=x onerror="alert(1)">' } } });
  ok("a tool title is escaped in the cluster", !/<img/.test(evil.elements.cluster.innerHTML) && /&lt;img/.test(evil.elements.cluster.innerHTML));
  evil.destroy();
}

head("11 · Measure math (spherical earth, R = 6 371 008.8 m)");
{
  const d1 = T.haversine([0, 0], [0, 1]);
  ok("1° of latitude ≈ 111.2 km", near(d1 / 1000, 111.2, 0.05), `${(d1 / 1000).toFixed(3)} km`);
  const lp = T.haversine([-0.1278, 51.5074], [2.3522, 48.8566]);
  ok("London → Paris ≈ 343.5 km (great circle)", near(lp / 1000, 343.5, 1), `${(lp / 1000).toFixed(1)} km`);
  ok("a polyline's length is the sum of its legs", near(T.pathLength([[0, 0], [0, 1], [0, 2]]), 2 * d1, 1e-6));
  const cell = T.ringArea([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]);
  const exact = T.EARTH_RADIUS ** 2 * (Math.PI / 180) * Math.sin(Math.PI / 180);
  ok("a 1°×1° cell at the equator equals the exact spherical area R²·Δλ·sin 1°", near(cell, exact, exact * 1e-9), `${(cell / 1e6).toFixed(1)} km²`);
  ok("…and is within 0.5 % of the WGS84 ellipsoidal area (12 308.8 km²)", Math.abs(cell / 1e6 - 12308.8) / 12308.8 < 0.005, `${((cell / 1e6 / 12308.8 - 1) * 100).toFixed(2)} %`);
  const co = T.ringArea([[-109.0452, 37], [-102.0416, 37], [-102.0416, 41], [-109.0452, 41]]);
  ok("Colorado (37–41°N, 102°03′–109°03′W) is within 0.5 % of its official 269,837 km²", Math.abs(co / 1e6 - 269837) / 269837 < 0.005, `${(co / 1e6).toFixed(0)} km², ${((co / 1e6 / 269837 - 1) * 100).toFixed(2)} %`);
  ok("ring orientation and an open ring do not change the area", near(T.ringArea([[0, 1], [1, 1], [1, 0], [0, 0]]), cell, 1e-3));
  ok("fewer than 3 vertices is zero area", T.ringArea([[0, 0], [1, 1]]) === 0);
  eq("formatLength metric", [T.formatLength(5.25), T.formatLength(742), T.formatLength(111195)], ["5.3 m", "742 m", "111.2 km"]);
  eq("formatLength imperial", [T.formatLength(100, "imperial"), T.formatLength(111195, "imperial")], ["328 ft", "69.09 mi"]);
  eq("formatArea metric / imperial", [T.formatArea(500), T.formatArea(50000), T.formatArea(2.5e9), T.formatArea(40468.564224, "imperial"), T.formatArea(2.589988110336e9, "imperial")],
     ["500 m²", "5 ha", "2,500 km²", "10 ac", "1,000 mi²"]);
  const ring = T.circleRing([10, 50], 1000, 32);
  ok("an accuracy circle is closed and every vertex is at the radius", ring[0] === ring.at(-1) && ring.slice(0, -1).every((p) => near(T.haversine([10, 50], p), 1000, 0.01)));
}

// one mount with every tool, used for 12–18
const tbox = new El("section"); body.appendChild(tbox);
const tm = new ToolMap();
const modes = [], errors = [], downloads = [];
let appClicks = 0;
let searchImpl = async () => [];
const geo = { next: null, getCurrentPosition(okFn, errFn) { const n = this.next; n.error ? errFn(n.error) : okFn(n.pos); } };
const TC = mountMapControls(tm, {
  container: tbox, catalog, keyboard: false, layers: LAYERS, title: "Demo map",
  tools: { search: { provider: (q) => searchImpl(q), attribution: "Test geocoder" }, locate: true, measure: true, draw: true, print: true },
  interaction: { setMode: (m) => modes.push(m) }, onError: (m) => errors.push(m),
  download: (name, d) => downloads.push({ name, ...d }), geolocation: geo, isSecureContext: true,
});
// the APP's identify handler, wired the way index.html wires its asset click
tm.on("click", () => { if (TC.isBusy()) return; appClicks++; });
const tbtn = (t) => TC.elements.cluster.querySelector(`[data-act="tool-${t}"]`);
const TP = () => tbox.querySelector(".smc-tpanel");
const tp = (sel) => TP()?.querySelector(sel);
const readout = () => tp("[data-tp-read]")?.textContent ?? "";

head("12 · Measure: modes, clicks, live readout, units, finish, clear");
{
  tm.fire("click", mapEv(5, 5));
  ok("in identify mode the app's own click handler runs", appClicks === 1);
  click(tbtn("measure"));
  ok("Measure opens its panel and takes the map: mode measure, isBusy(), interaction.setMode told",
     TP() && !TP().hidden && TP().attrs["data-which"] === "tool-measure" && TC.getMode() === "measure" && TC.isBusy() && modes.at(-1) === "measure");
  ok("…the cluster button reads expanded; the cursor is a crosshair; double-click zoom is off",
     tbtn("measure").attrs["aria-expanded"] === "true" && tm.canvas.style.cursor === "crosshair" && tm.doubleClickZoom.isEnabled() === false);
  tm.fire("click", mapEv(0, 0));
  ok("while Measure is active the app's identify click is SUPPRESSED", appClicks === 1);
  tm.fire("mousemove", mapEv(0, 1));
  ok("a live readout follows the cursor (rubber band) in metric with imperial beneath", /111\.2 km/.test(readout()) && /69\.09 mi/.test(readout()), readout());
  tm.fire("click", mapEv(0, 1)); tm.fire("click", mapEv(0, 1));           // a double-click: two clicks at one pixel…
  const dbl = mapEv(0, 1); tm.fire("dblclick", dbl);                       // …then dblclick
  ok("double-click finishes; its second click adds no duplicate vertex", TC.tools.measure.pts.length === 2 && TC.tools.measure.done && dbl.prevented, JSON.stringify(TC.tools.measure.pts));
  ok("…and the measured line is drawn in the smc-measure source", tm.sources["smc-measure"]?.data.features.some((f) => f.geometry.type === "LineString"));
  click(tp('[data-tp="units"]'));
  ok("the unit toggle makes imperial primary", /^69\.09 mi/.test(readout()) && tp('[data-tp="units"]').attrs["aria-pressed"] === "true", readout());
  click(tp('[data-tp="units"]'));
  click(tp('[data-tp="kind"][data-v="area"]'));
  tm.fire("click", mapEv(0, 0)); tm.fire("click", mapEv(1, 0)); tm.fire("click", mapEv(1, 1)); tm.fire("click", mapEv(0, 1));
  winKey("Enter");
  ok("Area: a new measurement after a finished one; Enter finishes", TC.tools.measure.pts.length === 4 && TC.tools.measure.done);
  ok("…the readout is the spherical area (1°×1° ≈ 12,363.6 km²) with mi² and a perimeter", /12,363\.\d+ km²/.test(readout()) && /mi²/.test(readout()) && /Perimeter 444\.\d km/.test(readout()), readout());
  ok("…drawn as a polygon", tm.sources["smc-measure"].data.features.some((f) => f.geometry.type === "Polygon"));
  click(tp('[data-tp="clear"]'));
  ok("Clear empties the measurement", TC.tools.measure.pts.length === 0 && /—/.test(readout()) && !tm.sources["smc-measure"].data.features.length);
}

head("13 · Draw: point, line, polygon, select & delete, export GeoJSON, survives setStyle");
{
  click(tbtn("draw"));
  ok("opening Draw ends Measure (one tool at a time) and takes the map in draw mode",
     TC.getMode() === "draw" && TP().attrs["data-which"] === "tool-draw" && tbtn("measure").attrs["aria-expanded"] === "false" && tbtn("draw").attrs["aria-expanded"] === "true" && modes.slice(-2).join() === "identify,draw", modes.join());
  ok("…and the measurement graphics are gone", !tm.sources["smc-measure"].data.features.length);
  ok("…Export is disabled with nothing drawn", tp('[data-tp="export"]').attrs.disabled != null);
  tm.fire("click", mapEv(10, 10));
  click(tp('[data-tp="kind"][data-v="line"]'));
  tm.fire("click", mapEv(0, 0)); tm.fire("click", mapEv(1, 1)); tm.fire("click", mapEv(2, 0)); tm.fire("click", mapEv(2, 0)); tm.fire("dblclick", mapEv(2, 0));
  click(tp('[data-tp="kind"][data-v="polygon"]'));
  tm.fire("click", mapEv(5, 5)); tm.fire("click", mapEv(6, 5)); tm.fire("click", mapEv(6, 6));
  winKey("Enter");
  ok("app clicks stay suppressed throughout drawing", appClicks === 1);
  const gj = TC.tools.toGeoJSON();
  eq("a point, a 3-vertex line (double-click deduped) and a closed triangle", gj.features.map((f) => `${f.geometry.type}:${f.geometry.type === "Polygon" ? f.geometry.coordinates[0].length : f.geometry.type === "LineString" ? f.geometry.coordinates.length : 1}`),
     ["Point:1", "LineString:3", "Polygon:4"]);
  click(tp('[data-tp="export"]'));
  const dl = downloads.at(-1);
  let parsed = null; try { parsed = JSON.parse(dl.text); } catch {}
  const pos = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
  const validGeom = (g) => g.type === "Point" ? pos(g.coordinates) : g.type === "LineString" ? g.coordinates.length >= 2 && g.coordinates.every(pos)
    : g.type === "Polygon" ? g.coordinates.every((r) => r.length >= 4 && r.every(pos) && JSON.stringify(r[0]) === JSON.stringify(r.at(-1))) : false;
  ok("Export downloads drawing.geojson as application/geo+json", dl?.name === "drawing.geojson" && dl.type === "application/geo+json");
  ok("…and it is valid GeoJSON: a FeatureCollection of Features with valid geometries, no internal flags",
     parsed?.type === "FeatureCollection" && parsed.features.length === 3 && parsed.features.every((f) => f.type === "Feature" && validGeom(f.geometry) && !("_id" in f.properties) && !("_sel" in f.properties)));
  click(tp('[data-tp="kind"][data-v="select"]'));
  tm.qrf = [{ properties: { _id: gj.features[1].id } }];
  tm.fire("click", mapEv(1, 1));
  ok("Select picks the shape under the click and enables Delete", TC.tools.draw.selected === gj.features[1].id && tp('[data-tp="delete"]').attrs.disabled == null &&
     tm.sources["smc-draw"].data.features.find((f) => f.properties._id === gj.features[1].id)?.properties._sel === true);
  click(tp('[data-tp="delete"]'));
  ok("Delete selected removes only that shape", TC.tools.toGeoJSON().features.map((f) => f.geometry.type).join() === "Point,Polygon");
  tm.qrf = [];
  const before = TC.tools.toGeoJSON().features.length;
  TC.setBasemap("osm-dark");                           // setStyle drops every source…
  ok("the drawing survives a basemap change (re-added on the module's restyle path)", tm.sources["smc-draw"]?.data.features.filter((f) => !f.properties._sketch).length === before &&
     ["smc-draw-fill", "smc-draw-line", "smc-draw-pt"].every((id) => tm.getLayer(id)));
  tm.addLayer("app-layer-added-later");
  TC.applyLayerState();
  ok("…and the tool graphics are raised above the app's layers by applyLayerState", tm.order.slice(-3).join() === "smc-draw-fill,smc-draw-line,smc-draw-pt", tm.order.slice(-4).join());
  click(tp('[data-tp="clear"]'));
  ok("Clear all empties the drawing", TC.tools.toGeoJSON().features.length === 0);
}

head("14 · Esc, closing, and other panels all revert to identify");
{
  ok("Esc (controls.escape) ends Draw: identify, not busy, panel hidden, double-click zoom restored, cursor cleared",
     TC.escape() === true && TC.getMode() === "identify" && !TC.isBusy() && TP().hidden && tm.doubleClickZoom.isEnabled() && tm.canvas.style.cursor === "" && modes.at(-1) === "identify");
  tm.fire("click", mapEv(3, 3));
  ok("…and the app's identify click works again", appClicks === 2);
  ok("…tool map listeners are gone (only the app's click remains)", (tm.handlers.click ?? []).length === 1 && !(tm.handlers.dblclick ?? []).length && !(tm.handlers.mousemove ?? []).length);
  click(tbtn("measure"));
  TC.openDrawer("layers");
  ok("opening the Layers drawer ends Measure", TC.getMode() === "identify" && TP().hidden && TC.elements.drawer.hidden === false);
  click(tbtn("measure"));
  ok("…and opening a tool closes the drawer", TC.elements.drawer.hidden === true && TC.getMode() === "measure");
  dispatch(tp('[data-tp="units"]'), "keydown", { key: "Escape" });
  ok("Esc inside the panel ends the tool and returns focus to its cluster button", TC.getMode() === "identify" && document.activeElement === tbtn("measure"));
  click(tbtn("draw")); click(tp('[data-tp="close"]'));
  ok("the panel's close button ends the tool", TC.getMode() === "identify" && TP().hidden);
  click(tbtn("draw")); click(tbtn("draw"));
  ok("the cluster button toggles its tool off", TC.getMode() === "identify");
  TC.setMode("measure");
  ok("interaction hook: setMode('measure') opens Measure…", TC.getMode() === "measure" && TC.tools.active() === "measure");
  TC.setMode("identify");
  ok("…setMode('identify') ends it", TC.getMode() === "identify" && TC.tools.active() === null);
  ok("no global shortcut was added: with no tool open, no window keydown listener exists", (WIN.keydown ?? []).length === 0, `${(WIN.keydown ?? []).length} window keydown listeners`);
}

head("15 · Search: min chars, 300 ms debounce, keyboard, escaping, failure");
{
  click(tbtn("search"));
  const inp = tp(".tp-input");
  ok("Search opens a combobox input (focused) with the provider's attribution, and is not a click mode", inp && inp.attrs.role === "combobox" && document.activeElement === inp && /Test geocoder/.test(TP().textContent) && TC.getMode() === "identify");
  const calls = [];
  searchImpl = async (q) => { calls.push(q); return [
    { label: '<img src=x onerror="alert(1)">, Paris, France', lng: 2.35, lat: 48.85, bbox: [2.2, 48.8, 2.5, 48.9] },
    { label: "Paris, Texas, United States", lng: -95.55, lat: 33.66 },
    { label: "bad", lng: "x", lat: null }]; };
  const type = (v) => { inp.value = v; dispatch(inp, "input"); };
  type("pa");
  await wait(360);
  ok("fewer than 3 characters: no request, and a hint", calls.length === 0 && /at least 3/.test(tp("[data-tp-msg]").textContent));
  type("par"); type("pari"); type("paris");
  await wait(150);
  ok("typing is debounced: nothing sent within 300 ms", calls.length === 0);
  await wait(250); await TC.tools.search.last;
  eq("…then ONE request, for the last value", calls, ["paris"]);
  const lis = () => tp(".tp-results").all("li");
  ok("results render as options; an invalid coordinate is dropped", lis().length === 2 && lis().every((l) => l.attrs.role === "option") && inp.attrs["aria-expanded"] === "true");
  ok("…result labels are escaped (no markup injected)", !/<img/.test(tp(".tp-results").innerHTML) && /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/.test(tp(".tp-results").innerHTML));
  dispatch(inp, "keydown", { key: "ArrowDown" });
  ok("ArrowDown selects the first result (aria-selected + aria-activedescendant)", lis()[0].attrs["aria-selected"] === "true" && inp.attrs["aria-activedescendant"] === lis()[0].attrs.id);
  dispatch(inp, "keydown", { key: "ArrowDown" }); dispatch(inp, "keydown", { key: "ArrowDown" });
  ok("…wraps around", lis()[0].attrs["aria-selected"] === "true");
  dispatch(inp, "keydown", { key: "ArrowUp" });
  ok("ArrowUp moves back (wrapping to the last)", lis()[1].attrs["aria-selected"] === "true");
  dispatch(inp, "keydown", { key: "ArrowUp" });
  dispatch(inp, "keydown", { key: "Enter" });
  const cam = tm.cam.at(-1);
  ok("Enter picks it: fit to its bbox and a temporary marker in smc-search", cam[0] === "fitBounds" && JSON.stringify(cam[1]) === "[[2.2,48.8],[2.5,48.9]]" &&
     JSON.stringify(tm.sources["smc-search"].data.features[0].geometry.coordinates) === "[2.35,48.85]" && lis().length === 0);
  type("texas"); await wait(330); await TC.tools.search.last;
  click(lis()[1]);
  ok("clicking a result with no bbox flies to it at street zoom", tm.cam.at(-1)[0] === "flyTo" && tm.cam.at(-1)[1].zoom >= 14);
  searchImpl = async () => { throw new Error("network down"); };
  type("london"); await wait(330); await TC.tools.search.last;
  ok("a provider failure shows a graceful message and no results", /unavailable right now/.test(tp("[data-tp-msg]").textContent) && lis().length === 0);
  searchImpl = async () => [];
  type("zzzzqq"); await wait(330); await TC.tools.search.last;
  ok("no results is said, not left blank", /No places found/.test(tp("[data-tp-msg]").textContent));
  TC.escape();
  ok("closing Search removes its temporary marker", !tm.sources["smc-search"].data.features.length && TP().hidden);
  // the default provider: Photon, keyless
  const photonCalls = [];
  const photon = T.photonProvider(async (u) => { photonCalls.push(u); return { ok: true, json: async () => ({ features: [
    { geometry: { type: "Point", coordinates: [13.38, 52.52] }, properties: { name: "Berlin", state: "Berlin", country: "Germany", extent: [13.08, 52.67, 13.76, 52.33] } },
    { geometry: { type: "Point", coordinates: [1, 2] }, properties: { street: "Main St", housenumber: "5", city: "Springfield" } }] }) }; });
  const pr = await photon("ber lin&x");
  ok("the default provider calls https://photon.komoot.io/api with the query encoded", photonCalls[0] === "https://photon.komoot.io/api/?q=ber%20lin%26x&limit=6", photonCalls[0]);
  eq("…and maps Photon features to { label, lng, lat, bbox [w,s,e,n] }", pr, [{ label: "Berlin, Germany", lng: 13.38, lat: 52.52, bbox: [13.08, 52.33, 13.76, 52.67] }, { label: "5 Main St, Springfield", lng: 1, lat: 2 }]);
  const dup = await T.photonProvider(async () => ({ ok: true, json: async () => ({ features: [
    { geometry: { type: "Point", coordinates: [-121.89, 36.6] }, properties: { name: "Monterey", state: "California", country: "United States", type: "city" } },
    { geometry: { type: "Point", coordinates: [-121.3, 36.2] }, properties: { name: "Monterey", state: "California", country: "United States", type: "county" } }] }) }))("monterey");
  eq("…and a label that repeats (city vs county) carries its kind", dup.map((r) => r.label), ["Monterey, California, United States · city", "Monterey, California, United States · county"]);
  let threw = false; try { await T.photonProvider(async () => ({ ok: false, status: 503 }))("x"); } catch { threw = true; }
  ok("…and throws on an HTTP failure (so the panel shows its message)", threw);
  const pb = new El("section"); body.appendChild(pb);
  const px = mountMapControls(new ToolMap(), { container: pb, catalog, keyboard: false, tools: { search: true }, fetch: async () => ({ ok: true, json: async () => ({ features: [] }) }) });
  click(px.elements.cluster.querySelector('[data-act="tool-search"]'));
  ok("with search: true the panel credits “Search by Photon · © OpenStreetMap contributors”", pb.querySelector(".tp-attr")?.textContent === "Search by Photon · © OpenStreetMap contributors");
  px.destroy();
}

head("16 · Locate: denied, insecure, unavailable, found, toggled off");
{
  geo.next = { error: { code: 1, message: "User denied Geolocation" } };
  const r1 = await TC.tools.locate();
  ok("permission denied: a plain message (toast + onError), nothing drawn, button not pressed",
     r1 === false && /permission was denied/.test(tbox.querySelector(".smc-toast").textContent) && /denied/.test(errors.at(-1)) &&
     !tm.sources["smc-locate"] && tbtn("locate").attrs["aria-pressed"] === "false");
  geo.next = { pos: { coords: { longitude: -122.42, latitude: 37.77, accuracy: 150 } } };
  click(tbtn("locate")); await tick();
  const lf = tm.sources["smc-locate"]?.data.features ?? [];
  ok("found: a dot and an accuracy circle, the map fits the circle, the button reads pressed",
     lf.map((f) => f.geometry.type).join() === "Polygon,Point" && tm.cam.at(-1)[0] === "fitBounds" && tbtn("locate").attrs["aria-pressed"] === "true");
  ok("…and the accuracy circle has the reported radius", near(T.haversine([-122.42, 37.77], lf[0].geometry.coordinates[0][5]), 150, 0.01));
  ok("…locate is not a mode: identify still works", TC.getMode() === "identify" && !TC.isBusy());
  click(tbtn("locate")); await tick();
  ok("clicking again toggles it off and clears it", !tm.sources["smc-locate"].data.features.length && tbtn("locate").attrs["aria-pressed"] === "false");
  const ib = new El("section"); body.appendChild(ib);
  const insec = mountMapControls(new ToolMap(), { container: ib, catalog, keyboard: false, tools: { locate: true }, isSecureContext: false, geolocation: geo });
  await insec.tools.locate();
  ok("an insecure (http) page says location needs https", /secure \(https\)/.test(ib.querySelector(".smc-toast").textContent));
  insec.destroy();
  const ub = new El("section"); body.appendChild(ub);
  const unav = mountMapControls(new ToolMap(), { container: ub, catalog, keyboard: false, tools: { locate: true }, isSecureContext: true, geolocation: {} });
  await unav.tools.locate();
  ok("no Geolocation API says it is not available", /not available/.test(ub.querySelector(".smc-toast").textContent));
  unav.destroy();
}

head("17 · Print: a PNG of the current view with a footer");
{
  drawn.length = 0;
  const url = await TC.tools.print();
  ok("print resolves to a PNG data URL", typeof url === "string" && url.startsWith("data:image/png;base64,"));
  ok("…captured from the map canvas inside a render (no preserveDrawingBuffer needed)", drawn.some(([k, s]) => k === "image" && s === tm.canvas) && !(tm.handlers.render ?? []).length);
  const texts = drawn.filter(([k]) => k === "text").map(([, s]) => s);
  ok("…the footer carries the title, the date, the attribution and a scale bar label",
     texts.includes("Demo map") && texts.some((t) => /\d{4}/.test(t) && /© OpenStreetMap contributors/.test(t)) && texts.some((t) => /^\d[\d,.]* (m|km)$/.test(t)), texts.join(" | "));
  ok("…and it is downloaded as map-YYYY-MM-DD.png", /^map-\d{4}-\d{2}-\d{2}\.png$/.test(downloads.at(-1).name) && downloads.at(-1).dataUrl === url);
  const ob = new El("section"); body.appendChild(ob);
  const prev = document.createElement;
  document.createElement = (t) => { const el = prev(t); if (t === "canvas") el.toDataURL = () => { throw new Error("SecurityError: tainted canvas"); }; return el; };
  const pm = mountMapControls(new ToolMap(), { container: ob, catalog, keyboard: false, tools: { print: true }, download: () => {} });
  const bad = await pm.tools.print();
  document.createElement = prev;
  ok("a tainted canvas fails gracefully with a message, not a throw", bad === null && /blocked/.test(ob.querySelector(".smc-toast").textContent));
  pm.destroy();
}

head("18 · destroy() with tools");
{
  click(tbtn("draw")); tm.fire("click", mapEv(1, 1));
  const winN = (WIN.keydown ?? []).length;
  TC.destroy();
  ok("destroy ends the active tool, removes the panel and toast", !tbox.querySelector(".smc-tpanel") && !tbox.querySelector(".smc-toast") && modes.at(-1) === "identify");
  ok("…takes the tool listeners off the map and window (only the app's own click stays)", (tm.handlers.click ?? []).length === 1 && !(tm.handlers.dblclick ?? []).length &&
     !(tm.handlers.mousemove ?? []).length && (WIN.keydown ?? []).length === winN - 1 && !(tm.handlers.styledata ?? []).length);
  ok("…and removes every smc- source and layer it added", !Object.keys(tm.sources).some((k) => k.startsWith("smc-")) && !tm.order.some((id) => id.startsWith("smc-")));
  tm.fire("click", mapEv(2, 2));
  ok("…after which the app's identify runs normally", appClicks === 3);
}


// ═══ every assertion of the scenario above, one Vitest test each, grouped by section ═══
const SECTIONS = [...new Set(RESULTS.map((r) => r.section))];
for (const s of SECTIONS) {
  describe(s, () => {
    RESULTS.filter((r) => r.section === s).forEach((r, i) => {
      test(`${i + 1}. ${r.label}`, () => { expect(r.pass, r.detail || r.label).toBe(true); });
    });
  });
}
test("the scenario ran every assertion (207)", () => { expect(RESULTS.length).toBe(207); });
