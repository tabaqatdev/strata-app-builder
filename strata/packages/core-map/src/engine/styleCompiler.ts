/**
 * styleCompiler — ESRI `drawingInfo` renderer JSON → MapLibre paint.
 *
 * Pure functions, no DOM, no MapLibre calls — this is the crown jewel harvested (once) from the
 * Strata GeoAI client and re-owned here. It accepts BOTH:
 *   - ArcGIS REST JSON  (esriSFS / esriSLS / esriSMS / esriPMS, colors [r,g,b,a 0-255], sizes in points)
 *   - JS-API JSON       (simple-fill / simple-line / simple-marker / picture-marker)
 * and emits paint patches for the namespaced MapLibre sub-layers a logical layer is split into.
 *
 * Supported renderers: simple, uniqueValue (single- and multi-field), classBreaks, heatmap,
 * (+ visual variables), and labels. Arcade `valueExpression` on uniqueValue/classBreaks is routed
 * through `@strata/arcade` (the supported subset compiles to a MapLibre expression; anything else
 * warns and falls back to the default symbol).
 * NOT supported (inherited limits): binning, blend modes.
 */

import { transpileArcade } from "@strata/arcade";

const PT2PX = 4 / 3;

export interface StylePatches {
  fill: Record<string, unknown>;
  outline: Record<string, unknown>; // the polygon outline (a line sub-layer)
  line: Record<string, unknown>;
  circle: Record<string, unknown>;
}

export interface IconResult {
  dataUri?: string;
  url?: string;
  sizePx: number;
}

export interface CompileResult {
  patches: StylePatches;
  icon?: IconResult | Record<string, unknown>;
  heatmap?: Record<string, unknown>;
  /** Field names referenced by the renderer — drives lean `outFields` fetching. */
  fields: string[];
  warnings: string[];
}

type AnyObj = Record<string, any>;

/** ESRI [r,g,b,a(0-255)] → CSS rgba(). Passes strings through; default transparent. */
function color(c: unknown): string {
  if (typeof c === "string") return c;
  if (Array.isArray(c) && c.length >= 3) {
    const [r, g, b, a = 255] = c as number[];
    return `rgba(${r},${g},${b},${a / 255})`;
  }
  return "rgba(0,0,0,0)";
}

/** points → pixels with a default. */
function px(v: unknown, def = 1): number {
  const n = typeof v === "number" ? v : def;
  return n * PT2PX;
}

/** Normalize both ESRI-REST and JS-API symbol type names to fill|line|marker|picture. */
function normSymType(t: unknown): "fill" | "line" | "marker" | "picture" | "unknown" {
  const s = String(t || "").toLowerCase();
  if (s === "esrisfs" || s === "simple-fill") return "fill";
  if (s === "esrisls" || s === "simple-line") return "line";
  if (s === "esrisms" || s === "simple-marker") return "marker";
  if (s === "esripms" || s === "picture-marker") return "picture";
  return "unknown";
}

/** Map one ESRI symbol to per-geometry paint fragments (+ optional picture icon). */
function symbolPaint(sym: AnyObj, warnings: string[]): Partial<StylePatches> & { icon?: IconResult } {
  const out: Partial<StylePatches> & { icon?: IconResult } = {};
  const kind = normSymType(sym?.type);

  if (kind === "fill") {
    out.fill = { "fill-color": color(sym.color) };
    const ol = sym.outline;
    out.outline = {
      "line-color": ol ? color(ol.color) : "rgba(110,110,110,1)",
      "line-width": ol ? px(ol.width, 1) : 1,
    };
    if (sym.style && !/solid/i.test(String(sym.style))) {
      warnings.push(`fill style '${sym.style}' not fully supported; rendered as solid`);
    }
  } else if (kind === "line") {
    out.line = { "line-color": color(sym.color), "line-width": px(sym.width, 1.5) };
    if (/dash/i.test(String(sym.style || ""))) out.line["line-dasharray"] = [2, 2];
  } else if (kind === "marker") {
    out.circle = { "circle-color": color(sym.color), "circle-radius": px(sym.size, 8) / 2 };
    const ol = sym.outline;
    if (ol) {
      out.circle["circle-stroke-color"] = color(ol.color);
      out.circle["circle-stroke-width"] = px(ol.width, 0.6);
    }
    if (sym.style && !/circle/i.test(String(sym.style))) {
      warnings.push(`marker style '${sym.style}' approximated as circle`);
    }
  } else if (kind === "picture") {
    const uri = sym.imageData
      ? `data:${sym.contentType || "image/png"};base64,${sym.imageData}`
      : sym.url;
    out.icon = { dataUri: sym.imageData ? uri : undefined, url: sym.imageData ? undefined : sym.url, sizePx: px(sym.width, 16) };
  } else {
    warnings.push(`unknown symbol type '${sym?.type}'`);
  }
  return out;
}

function emptyPatches(): StylePatches {
  return { fill: {}, outline: {}, line: {}, circle: {} };
}

function applySymbol(patches: StylePatches, frag: Partial<StylePatches>): void {
  if (frag.fill) Object.assign(patches.fill, frag.fill);
  if (frag.outline) Object.assign(patches.outline, frag.outline);
  if (frag.line) Object.assign(patches.line, frag.line);
  if (frag.circle) Object.assign(patches.circle, frag.circle);
}

/** simple renderer → flat paint for all geometry buckets. */
function compileSimple(r: AnyObj, res: CompileResult): void {
  const frag = symbolPaint(r.symbol || {}, res.warnings);
  applySymbol(res.patches, frag);
  if ((frag as any).icon) res.icon = (frag as any).icon;
}

/** The paint props that vary per class, per geometry. */
const VARYING: Array<[keyof StylePatches, string, (s: AnyObj) => unknown]> = [
  ["fill", "fill-color", (s) => color(s.color)],
  ["outline", "line-color", (s) => (s.outline ? color(s.outline.color) : undefined)],
  ["line", "line-color", (s) => color(s.color)],
  ["line", "line-width", (s) => px(s.width, 1.5)],
  ["circle", "circle-color", (s) => color(s.color)],
  ["circle", "circle-radius", (s) => px(s.size, 8) / 2],
];

/**
 * Case-tolerant property lookup. ESRI renderer/label fields keep their canonical case (e.g. `HAZ_CLASS`,
 * `DP03_0062E`), but an ArcGIS **MapServer** `f=geojson` response lowercases property keys, so a bare
 * `["get", field]` silently misses and the layer falls back to its default symbol. Try the field as
 * authored, then lowercase, then uppercase.
 */
function getField(field: string): any {
  const variants = Array.from(new Set([field, field.toLowerCase(), field.toUpperCase()]));
  return variants.length === 1 ? ["get", field] : ["coalesce", ...variants.map((f) => ["get", f])];
}

/**
 * Compile an Arcade `valueExpression` to a MapLibre expression (case-tolerant field access), collecting
 * referenced fields and warnings onto `res`. Returns null when the expression is outside the supported
 * Arcade subset — the caller then falls back to the default symbol rather than mis-render.
 */
function arcadeExpression(valueExpression: string, res: CompileResult): any | null {
  const t = transpileArcade(valueExpression, (name) => getField(name));
  for (const f of t.fields) res.fields.push(f);
  res.warnings.push(...t.warnings);
  if (t.expression == null) {
    res.warnings.push(
      "Arcade valueExpression outside the supported subset; falling back to default symbol"
    );
    return null;
  }
  return t.expression;
}

/** uniqueValue renderer → MapLibre ["match", input, v0, out0, ..., fallback].
 *
 * Supports **multi-field** unique-value (`field1`/`field2`/`field3`, ESRI joins values with
 * `fieldDelimiter`, default `", "`): the match input is a concatenation of the fields on the same
 * delimiter, and each `uniqueValueInfos[].value` is normalized to the same joined key (ESRI stores
 * a multi-field value either as an already-joined string or as a delimited list). */
function compileUniqueValue(r: AnyObj, res: CompileResult): void {
  const delim: string = r.fieldDelimiter || ", ";

  // Arcade valueExpression drives the match input directly (no field1 needed).
  if (r.valueExpression && !(r.field1 || r.field)) {
    const expr = arcadeExpression(r.valueExpression, res);
    if (expr == null) return;
    compileUniqueValueMatch(["to-string", expr], (v) => (v == null ? null : String(v)), r, res);
    return;
  }

  const fields: string[] = [r.field1 || r.field, r.field2, r.field3].filter(Boolean);
  if (!fields.length) {
    res.warnings.push("uniqueValue renderer has no field1");
    return;
  }
  for (const f of fields) res.fields.push(f);

  // Build the match input: single field → to-string; multi-field → concat(f1, delim, f2, ...).
  let input: any;
  if (fields.length === 1) {
    input = ["to-string", getField(fields[0])];
  } else {
    const concat: any[] = ["concat"];
    fields.forEach((f, i) => {
      if (i > 0) concat.push(delim);
      concat.push(["to-string", getField(f)]);
    });
    input = concat;
  }

  // Normalize an info's `value` to the joined key that `input` produces.
  const joinValue = (val: unknown): string | null => {
    if (val == null) return null;
    if (fields.length === 1) return String(val);
    // ESRI may give the value already joined, or as a delimiter-separated / array form.
    if (Array.isArray(val)) return val.map((v) => String(v)).join(delim);
    return String(val);
  };

  compileUniqueValueMatch(input, joinValue, r, res);
}

/** Emit the per-geometry ["match", input, key, out, ..., fallback] patches for a uniqueValue renderer. */
function compileUniqueValueMatch(
  input: any,
  joinValue: (val: unknown) => string | null,
  r: AnyObj,
  res: CompileResult
): void {
  const infos: AnyObj[] = r.uniqueValueInfos || [];
  const def = r.defaultSymbol || {};

  for (const [bucket, prop, extract] of VARYING) {
    const fallback = extract(def.symbol ? def.symbol : def);
    const match: any[] = ["match", input];
    let any = false;
    for (const info of infos) {
      const key = joinValue(info.value);
      const v = extract(info.symbol || {});
      if (v === undefined || key == null) continue;
      match.push(key, v);
      any = true;
    }
    if (!any) continue;
    match.push(fallback ?? null);
    res.patches[bucket][prop] = match;
  }
}

/** classBreaks renderer → MapLibre ["step", input, out0, threshold1, out1, ...]. */
function compileClassBreaks(r: AnyObj, res: CompileResult): void {
  let input: any;
  if (r.valueExpression && !r.field) {
    const expr = arcadeExpression(r.valueExpression, res);
    if (expr == null) return;
    input = ["to-number", expr];
  } else {
    const field = r.field;
    if (!field) {
      res.warnings.push("classBreaks renderer has no field");
      return;
    }
    res.fields.push(field);
    input = ["to-number", getField(field)];
  }
  const infos: AnyObj[] = [...(r.classBreakInfos || [])].sort(
    (a, b) => (a.classMaxValue ?? 0) - (b.classMaxValue ?? 0)
  );
  if (!infos.length) return;

  for (const [bucket, prop, extract] of VARYING) {
    const first = extract(infos[0].symbol || {});
    if (first === undefined) continue;
    const step: any[] = ["step", input, first];
    for (let i = 1; i < infos.length; i++) {
      const threshold = infos[i - 1].classMaxValue;
      const out = extract(infos[i].symbol || {});
      if (threshold == null || out === undefined) continue;
      step.push(threshold, out);
    }
    res.patches[bucket][prop] = step;
  }
}

function dedupeStops(stops: Array<[number, string]>): Array<[number, string]> {
  const out: Array<[number, string]> = [];
  let last = -Infinity;
  for (const [ratio, col] of stops.sort((a, b) => a[0] - b[0])) {
    const r = ratio <= last ? last + 1e-6 : ratio;
    out.push([r, col]);
    last = r;
  }
  return out;
}

/** heatmap renderer → MapLibre heatmap paint, with the density-0-transparent fix. */
function compileHeatmap(r: AnyObj, res: CompileResult): void {
  const stops: Array<[number, string]> = (r.colorStops || []).map((s: AnyObj) => [
    s.ratio ?? 0,
    color(s.color),
  ]);
  // Density 0 MUST be transparent or the canvas floods.
  if (!stops.some(([ratio]) => ratio === 0)) stops.unshift([0, "rgba(0,0,0,0)"]);
  const clean = dedupeStops(stops);
  const heatmapColor: any[] = ["interpolate", ["linear"], ["heatmap-density"]];
  for (const [ratio, col] of clean) heatmapColor.push(ratio, col);

  res.heatmap = {
    "heatmap-color": heatmapColor,
    "heatmap-radius": px(r.blurRadius, 10),
    "heatmap-opacity": typeof r.opacity === "number" ? r.opacity : 1,
  };
  // Field weighting: each point contributes by its `field` value (ESRI weighted heatmap). When the
  // renderer carries `maxPixelIntensity`, normalize [0..max] → [0..1]; otherwise use the raw value.
  if (r.field) {
    res.fields.push(r.field);
    const w: any = ["coalesce", ["to-number", ["get", getField(r.field)]], 0];
    res.heatmap["heatmap-weight"] =
      typeof r.maxPixelIntensity === "number" && r.maxPixelIntensity > 0
        ? ["interpolate", ["linear"], w, 0, 0, r.maxPixelIntensity, 1]
        : w;
  }
}

/**
 * dotDensity renderer → MapLibre has no native dot-density, so the polygon layer is expanded at author
 * time into a derived point layer by `@strata/processing`'s `dotDensity()`. Here we warn (so the loader
 * knows to run the expander) and emit the circle paint used to draw the resulting dots — colored from the
 * first `attributes[]` entry (ESRI dot-density colours each dot by its attribute).
 */
function compileDotDensity(r: AnyObj, res: CompileResult): void {
  res.warnings.push(
    "dotDensity renderer must be expanded to a point layer at author time via @strata/processing dotDensity(); styling the derived dots"
  );
  const attr = (r.attributes || [])[0];
  const dotColor = attr?.color ?? r.dotColor ?? [80, 80, 80, 255];
  const size = px(r.dotSize, 1.5);
  res.patches.circle["circle-color"] = color(dotColor);
  res.patches.circle["circle-radius"] = Math.max(1, size / 2);
  if (attr?.field) res.fields.push(attr.field);
}

/** visual variables (color/size) layered on top of the base renderer. */
function compileVisualVariables(vvs: AnyObj[], res: CompileResult): void {
  for (const vv of vvs || []) {
    const field = vv.field;
    if (!field) continue;
    res.fields.push(field);
    const input: any = ["to-number", getField(field)];
    if (vv.type === "colorInfo" || vv.type === "color") {
      const expr: any[] = ["interpolate", ["linear"], input];
      for (const st of vv.stops || []) expr.push(st.value, color(st.color));
      res.patches.fill["fill-color"] = expr;
      res.patches.line["line-color"] = expr;
      res.patches.circle["circle-color"] = expr;
    } else if (vv.type === "sizeInfo" || vv.type === "size") {
      const expr: any[] = ["interpolate", ["linear"], input];
      for (const st of vv.stops || []) expr.push(st.value, px(st.size, 8) / 2);
      res.patches.circle["circle-radius"] = expr;
      const lineExpr: any[] = ["interpolate", ["linear"], input];
      for (const st of vv.stops || []) lineExpr.push(st.value, px(st.size, 1.5));
      res.patches.line["line-width"] = lineExpr;
    }
  }
}

/**
 * Compile an ESRI renderer to MapLibre paint patches.
 * @param renderer ESRI renderer JSON (from layerDefinition.drawingInfo.renderer or a service's drawingInfo).
 */
export function compile(renderer: AnyObj | null | undefined): CompileResult {
  const res: CompileResult = { patches: emptyPatches(), fields: [], warnings: [] };
  if (!renderer || typeof renderer !== "object") {
    res.warnings.push("no renderer provided");
    return res;
  }
  switch (String(renderer.type)) {
    case "simple":
      compileSimple(renderer, res);
      break;
    case "uniqueValue":
      compileUniqueValue(renderer, res);
      break;
    case "classBreaks":
      compileClassBreaks(renderer, res);
      break;
    case "heatmap":
      compileHeatmap(renderer, res);
      break;
    case "dotDensity":
      compileDotDensity(renderer, res);
      break;
    default:
      res.warnings.push(`renderer type '${renderer.type}' not supported`);
  }
  if (renderer.visualVariables) compileVisualVariables(renderer.visualVariables, res);
  // de-dup referenced fields
  res.fields = Array.from(new Set(res.fields));
  return res;
}

/** ESRI min/maxScale → MapLibre min/maxzoom. */
export function scaleToZoom(scale: number): number {
  return Math.log2(591657527.591555 / scale);
}

/**
 * Compile ESRI labelingInfo → MapLibre symbol layer definitions.
 * Handles Arcade `$feature.X` / REST `[FIELD]` expressions → ["concat", ...].
 */
export function compileLabels(labelingInfo: AnyObj[] | null | undefined): {
  layers: Array<Record<string, unknown>>;
  fields: string[];
  warnings: string[];
} {
  const layers: Array<Record<string, unknown>> = [];
  const fields: string[] = [];
  const warnings: string[] = [];
  for (const lc of labelingInfo || []) {
    const expr = labelExpression(lc, fields, warnings);
    if (!expr) continue;
    const sym = lc.symbol || {};
    const layer: Record<string, unknown> = {
      layout: {
        "text-field": expr,
        "text-size": px(sym.font?.size, 11),
        "text-font": ["Noto Sans Regular"],
      },
      paint: {
        "text-color": color(sym.color) || "#333",
        "text-halo-color": sym.haloColor ? color(sym.haloColor) : "rgba(255,255,255,1)",
        "text-halo-width": px(sym.haloSize, 1),
      },
    };
    if (lc.minScale) (layer as any).maxzoom = scaleToZoom(lc.minScale);
    if (lc.maxScale) (layer as any).minzoom = scaleToZoom(lc.maxScale);
    layers.push(layer);
  }
  return { layers, fields: Array.from(new Set(fields)), warnings };
}

function labelExpression(lc: AnyObj, fields: string[], warnings: string[]): any {
  const raw: string = lc.labelExpressionInfo?.expression || lc.labelExpression || "";
  if (!raw) return null;
  // Arcade $feature.X / $feature["X"]
  const arcade = raw.match(/\$feature(?:\.(\w+)|\["([^"]+)"\])/g);
  if (arcade) {
    const parts: any[] = ["concat"];
    // simple single-field case
    const single = raw.match(/^\s*\$feature(?:\.(\w+)|\["([^"]+)"\])\s*$/);
    if (single) {
      const f = single[1] || single[2];
      fields.push(f);
      return ["to-string", getField(f)];
    }
    warnings.push("complex Arcade label expression approximated");
    for (const m of arcade) {
      const f = (m.match(/\.(\w+)/) || m.match(/\["([^"]+)"\]/) || [])[1];
      if (f) {
        fields.push(f);
        parts.push(["to-string", getField(f)]);
      }
    }
    return parts.length > 1 ? parts : null;
  }
  // REST [FIELD]
  const rest = raw.match(/\[(\w+)\]/g);
  if (rest) {
    const parts: any[] = ["concat"];
    for (const m of rest) {
      const f = m.slice(1, -1);
      fields.push(f);
      parts.push(["to-string", getField(f)]);
    }
    // A single [FIELD] needs no concat wrapper (mirrors the Arcade single-field case).
    return rest.length > 1 ? parts : ["to-string", getField(rest[0].slice(1, -1))];
  }
  warnings.push("unrecognized label expression");
  return null;
}
