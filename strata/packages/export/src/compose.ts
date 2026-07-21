/**
 * compose — pure builders for print/PDF composition and per-feature reports (#6 + Feature Report).
 *
 * Dependency-free HTML/SVG string builders so the layout is testable without a browser: a **legend** from
 * each layer's `drawingInfo`, a **scalebar**, a **north-arrow**, print-layout page CSS (Letter/A4 ×
 * portrait/landscape), a composed print document, a **map-series / atlas** (one page per feature), and a
 * **feature report** (attributes + a map inset + a small chart). `exportPDF`/`exportAtlas` feed these to
 * the browser print dialog.
 */

// --- helpers -----------------------------------------------------------------------------------

export function esc(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** ESRI `[r,g,b,a(0-255)]` (or a CSS string) → CSS color. */
function color(c: unknown): string {
  if (typeof c === "string") return c;
  if (Array.isArray(c) && c.length >= 3) {
    const [r, g, b, a = 255] = c as number[];
    return `rgba(${r},${g},${b},${a / 255})`;
  }
  return "transparent";
}

/** Pull the primary fill/marker color out of an ESRI symbol. */
function symbolColor(sym: any): string {
  return color(sym?.color);
}

// --- legend ------------------------------------------------------------------------------------

export interface LegendLayer {
  title: string;
  renderer?: any; // drawingInfo.renderer
}

/** One legend row: a color swatch + a label. */
function swatch(fill: string, label: string): string {
  return `<div style="display:flex;align-items:center;gap:6px;margin:2px 0"><span style="width:14px;height:14px;border-radius:3px;border:1px solid #999;background:${fill};display:inline-block"></span><span>${esc(
    label,
  )}</span></div>`;
}

/** Build legend HTML from layers' `drawingInfo` renderers (simple / uniqueValue / classBreaks). */
export function legendHtml(layers: LegendLayer[]): string {
  const blocks = layers
    .map((l) => {
      const r = l.renderer;
      let rows = "";
      if (!r || r.type === "simple") {
        rows = swatch(symbolColor(r?.symbol), l.title);
        return `<div class="legend-block">${rows}</div>`;
      }
      if (r.type === "uniqueValue") {
        rows = (r.uniqueValueInfos || [])
          .map((i: any) => swatch(symbolColor(i.symbol), i.label ?? String(i.value)))
          .join("");
      } else if (r.type === "classBreaks") {
        rows = (r.classBreakInfos || [])
          .map((i: any) => swatch(symbolColor(i.symbol), i.label ?? `≤ ${i.classMaxValue}`))
          .join("");
      } else {
        rows = swatch("transparent", l.title);
      }
      return `<div class="legend-block"><div style="font-weight:600;margin:4px 0 2px">${esc(l.title)}</div>${rows}</div>`;
    })
    .join("");
  return `<div class="strata-legend" style="font-size:11px">${blocks}</div>`;
}

// --- scalebar + north arrow --------------------------------------------------------------------

/** Round a distance down to a "nice" 1/2/5 × 10ⁿ value (shared with plugin-statusbar's convention). */
export function niceRound(value: number): number {
  if (value <= 0) return 0;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const f = value / pow;
  const nice = f >= 5 ? 5 : f >= 2 ? 2 : 1;
  return nice * pow;
}

/** A scalebar SVG for a given ground distance (metres) drawn at `widthPx`. */
export function scalebarSvg(metres: number, widthPx = 120): string {
  const nice = niceRound(metres);
  const w = metres > 0 ? Math.round((nice / metres) * widthPx) : widthPx;
  const label = nice >= 1000 ? `${nice / 1000} km` : `${nice} m`;
  return `<svg width="${w + 2}" height="22" role="img" aria-label="scale ${esc(label)}"><rect x="1" y="10" width="${w}" height="6" fill="none" stroke="#111"/><rect x="1" y="10" width="${Math.round(
    w / 2,
  )}" height="6" fill="#111"/><text x="1" y="8" font-size="10" fill="#111">${esc(label)}</text></svg>`;
}

/** A north-arrow SVG. */
export function northArrowSvg(size = 36): string {
  const c = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="north arrow"><polygon points="${c},2 ${c - 7},${size - 6} ${c},${size - 12} ${c + 7},${size - 6}" fill="#111"/><text x="${c}" y="${size - 1}" font-size="10" text-anchor="middle" fill="#111">N</text></svg>`;
}

// --- print layouts -----------------------------------------------------------------------------

export type PageSize = "letter" | "a4";
export type Orientation = "portrait" | "landscape";
export interface PrintLayout {
  size: PageSize;
  orientation: Orientation;
}

/** `@page` CSS for a print layout. */
export function printLayoutCss(layout: PrintLayout): string {
  return `@page{size:${layout.size} ${layout.orientation};margin:12mm}`;
}

export interface PrintComposition {
  title?: string;
  /** The map image data URL. */
  image: string;
  legend?: string; // pre-built legend HTML
  scalebar?: string; // pre-built scalebar SVG
  northArrow?: string; // pre-built north-arrow SVG
  attribution?: string;
  layout?: PrintLayout;
}

/** Compose a full print HTML document (title + map + legend/scalebar/north-arrow + attribution). */
export function composePrintHtml(c: PrintComposition): string {
  const layout = c.layout ?? { size: "letter", orientation: "portrait" };
  const overlay =
    c.scalebar || c.northArrow
      ? `<div style="position:absolute;left:8px;bottom:8px;display:flex;align-items:flex-end;gap:12px">${c.scalebar ?? ""}${c.northArrow ?? ""}</div>`
      : "";
  const legend = c.legend ? `<aside style="position:absolute;right:8px;top:8px;background:rgba(255,255,255,.9);padding:6px 8px;border:1px solid #ccc;border-radius:4px">${c.legend}</aside>` : "";
  return (
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(c.title || "Map")}</title>` +
    `<style>${printLayoutCss(layout)}` +
    `body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111}` +
    `h1{font-size:18px;margin:0 0 12px}.map{position:relative}` +
    `img{display:block;width:100%;height:auto;border:1px solid #ddd}footer{margin-top:8px;font-size:11px;color:#555}` +
    `</style></head><body>` +
    (c.title ? `<h1>${esc(c.title)}</h1>` : "") +
    `<div class="map"><img src="${c.image}" alt="${esc(c.title || "Map")}">${legend}${overlay}</div>` +
    (c.attribution ? `<footer>${esc(c.attribution)}</footer>` : "") +
    `</body></html>`
  );
}

// --- atlas / map-series ------------------------------------------------------------------------

export interface AtlasPage {
  title: string;
  image: string;
}

/** Compose a multi-page atlas document — one page per feature, page-broken for print. */
export function composeAtlasHtml(pages: AtlasPage[], layout?: PrintLayout): string {
  const l = layout ?? { size: "letter", orientation: "portrait" };
  const body = pages
    .map(
      (p, i) =>
        `<section style="${i > 0 ? "page-break-before:always;" : ""}"><h1>${esc(p.title)}</h1><img src="${p.image}" alt="${esc(
          p.title,
        )}"></section>`,
    )
    .join("");
  return (
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Atlas</title>` +
    `<style>${printLayoutCss(l)}body{margin:0;font-family:system-ui,sans-serif;color:#111}h1{font-size:16px;margin:0 0 8px}img{display:block;width:100%;border:1px solid #ddd}</style>` +
    `</head><body>${body}</body></html>`
  );
}

// --- feature report ----------------------------------------------------------------------------

export interface FeatureReportOptions {
  title?: string;
  /** Ordered fields to show (label + value); defaults to every attribute. */
  fields?: Array<{ name: string; label?: string }>;
  /** A map-inset image data URL (the feature located on the map). */
  mapImage?: string;
  /** Numeric fields to chart as a small bar chart. */
  chartFields?: string[];
  attribution?: string;
}

/** A tiny inline-SVG bar chart for the report (dependency-free). */
function reportBarChart(labels: string[], values: number[]): string {
  const W = 320;
  const H = 120;
  const pad = 8;
  const max = Math.max(1, ...values.map((v) => Math.abs(v)));
  const bw = (W - pad * 2) / Math.max(values.length, 1);
  const bars = values
    .map((v, i) => {
      const h = (Math.abs(v) / max) * (H - pad * 2);
      return `<rect x="${(pad + bw * i + bw * 0.15).toFixed(1)}" y="${(H - pad - h).toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${h.toFixed(1)}" fill="#2b6cb0"><title>${esc(labels[i] ?? "")}: ${v}</title></rect>`;
    })
    .join("");
  return `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" role="img">${bars}</svg>`;
}

/** Build a per-feature report document (title + map inset + attribute table + optional chart). */
export function featureReportHtml(attributes: Record<string, unknown>, opts: FeatureReportOptions = {}): string {
  const fields: Array<{ name: string; label?: string }> =
    opts.fields ?? Object.keys(attributes).map((name) => ({ name }));
  const rows = fields
    .map(
      (f) =>
        `<tr><th style="text-align:start;padding:3px 10px;opacity:.7;white-space:nowrap">${esc(f.label ?? f.name)}</th><td style="padding:3px 10px">${esc(
          String(attributes[f.name] ?? ""),
        )}</td></tr>`,
    )
    .join("");
  const chart =
    opts.chartFields && opts.chartFields.length
      ? `<div style="margin-top:12px">${reportBarChart(
          opts.chartFields,
          opts.chartFields.map((f) => Number(attributes[f]) || 0),
        )}</div>`
      : "";
  const inset = opts.mapImage ? `<img src="${opts.mapImage}" alt="location" style="width:100%;border:1px solid #ddd;margin-bottom:12px">` : "";
  return (
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(opts.title || "Feature report")}</title>` +
    `<style>@page{margin:14mm}body{margin:0;font-family:system-ui,sans-serif;color:#111}h1{font-size:20px;margin:0 0 12px}table{border-collapse:collapse;width:100%}tr:nth-child(even){background:#f6f8fb}footer{margin-top:10px;font-size:11px;color:#555}</style>` +
    `</head><body>` +
    (opts.title ? `<h1>${esc(opts.title)}</h1>` : "") +
    inset +
    `<table>${rows}</table>${chart}` +
    (opts.attribution ? `<footer>${esc(opts.attribution)}</footer>` : "") +
    `</body></html>`
  );
}
