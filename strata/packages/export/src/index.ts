/**
 * @strata/export — map export. Reused by the open-data hub and any app.
 *
 * v0.2.0: `exportSpec` (shareable ESRI Web Map JSON), `exportImage` (MapLibre canvas), `exportLayerData`
 * (GeoJSON/CSV Blobs; GeoParquet is served by the Strata export endpoint), and `exportPDF` (a
 * dependency-free browser print layout → "Save as PDF") are implemented.
 */
import type { LayersJson } from "@strata/schema";
import {
  composePrintHtml,
  composeAtlasHtml,
  featureReportHtml,
  legendHtml,
  scalebarSvg,
  northArrowSvg,
  type LegendLayer,
  type PrintLayout,
  type AtlasPage,
  type FeatureReportOptions,
} from "./compose.js";

export * from "./compose.js";
export * from "./share.js";

/** Serialize the current map spec as a shareable / re-openable ESRI Web Map JSON document. */
export function exportSpec(config: LayersJson): string {
  return JSON.stringify(config, null, 2);
}

export interface ImageOptions {
  format?: "png" | "jpeg";
  /** the maplibre-gl Map instance */
  map: any;
  /** Pixel scale factor for a higher-DPI export (2 = double resolution). Default 1. */
  scale?: number;
}

/** Metres of ground per screen pixel at a latitude + web-mercator zoom (for scalebars). */
export function metresPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

/**
 * Export the current map view as a data URL from the MapLibre canvas. With `scale > 1`, the captured
 * canvas is re-drawn onto a larger canvas for a higher-resolution image (a pragmatic high-DPI export;
 * a true re-render needs the map created at a higher `pixelRatio`). Requires `preserveDrawingBuffer:true`.
 */
export function exportImage(opts: ImageOptions): string {
  const { map, format = "png", scale = 1 } = opts;
  const canvas: HTMLCanvasElement = map.getCanvas();
  if (scale <= 1 || typeof document === "undefined") return canvas.toDataURL(`image/${format}`);
  const out = document.createElement("canvas");
  out.width = canvas.width * scale;
  out.height = canvas.height * scale;
  const ctx = out.getContext("2d");
  if (!ctx) return canvas.toDataURL(`image/${format}`);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, out.width, out.height);
  return out.toDataURL(`image/${format}`);
}

export interface PdfOptions {
  map: any;
  title?: string;
  legend?: boolean;
  scalebar?: boolean;
  northArrow?: boolean;
  attribution?: string;
  /** Layers (title + renderer) to build the legend from when `legend` is true. */
  layers?: LegendLayer[];
  /** Print page layout (default letter/portrait). */
  layout?: PrintLayout;
}

/** Open a print window with `html` and trigger the browser print dialog (Save as PDF). */
function printHtml(html: string, titleForErr = "document"): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const win = typeof window !== "undefined" ? window.open("", "_blank") : null;
    if (!win) {
      reject(new Error(`export: unable to open a print window for the ${titleForErr} (popup blocked?).`));
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    const doPrint = (): void => {
      try {
        win.focus();
        win.print();
      } catch {
        /* headless / print unavailable — window still populated */
      }
      resolve();
    };
    const img = win.document.querySelector("img");
    if (img && !(img as HTMLImageElement).complete) {
      img.addEventListener("load", doPrint, { once: true });
      img.addEventListener("error", doPrint, { once: true });
    } else {
      doPrint();
    }
  });
}

/**
 * Compose a dependency-free print/PDF layout and hand it to the browser's print dialog (where the user
 * can "Save as PDF"). Captures the MapLibre canvas, opens a new window with a title + the map image +
 * attribution, and calls `window.print()`. The map must be created with `preserveDrawingBuffer:true`.
 */
export function exportPDF(opts: PdfOptions): Promise<void> {
  const { map, title, attribution } = opts;
  let image: string;
  try {
    image = (map.getCanvas() as HTMLCanvasElement).toDataURL("image/png");
  } catch (e) {
    return Promise.reject(e instanceof Error ? e : new Error(String(e)));
  }
  const legend = opts.legend && opts.layers ? legendHtml(opts.layers) : undefined;
  let scalebar: string | undefined;
  if (opts.scalebar && typeof map.getZoom === "function" && typeof map.getCenter === "function") {
    const mpp = metresPerPixel(map.getCenter().lat, map.getZoom());
    scalebar = scalebarSvg(mpp * 120, 120);
  }
  const northArrow = opts.northArrow ? northArrowSvg() : undefined;
  const html = composePrintHtml({ title, image, legend, scalebar, northArrow, attribution, layout: opts.layout });
  return printHtml(html, "map");
}

export interface AtlasOptions {
  /** The features to page over. */
  features: Array<{ title: string; attributes?: Record<string, unknown> }>;
  /** Render a feature to a map-image data URL (the caller drives the map extent per feature). */
  renderPage: (feature: { title: string; attributes?: Record<string, unknown> }, index: number) => Promise<string> | string;
  layout?: PrintLayout;
}

/** Map-series / atlas: iterate a feature set → one print page each, then hand to the print dialog. */
export async function exportAtlas(opts: AtlasOptions): Promise<void> {
  const pages: AtlasPage[] = [];
  for (let i = 0; i < opts.features.length; i++) {
    const f = opts.features[i];
    pages.push({ title: f.title, image: await opts.renderPage(f, i) });
  }
  return printHtml(composeAtlasHtml(pages, opts.layout), "atlas");
}

/** Per-feature report: a titled document (attributes + optional map inset + chart) → print dialog. */
export function exportFeatureReport(attributes: Record<string, unknown>, opts?: FeatureReportOptions): Promise<void> {
  return printHtml(featureReportHtml(attributes, opts), "report");
}

export type LayerDataFormat = "geojson" | "geoparquet" | "csv";

export interface LayerDataOptions {
  format: LayerDataFormat;
  /** the maplibre-gl Map instance — the layer's GeoJSON is read from `map.getSource(lyr:{id})`. */
  map?: any;
  /** An explicit FeatureCollection (or features array), bypassing the map source lookup. */
  data?: unknown;
}

type FeatureCollectionLike = { type?: string; features?: any[] };

/** Resolve a layer's GeoJSON FeatureCollection from an explicit `data` option or the live map source. */
function resolveFeatureCollection(layerId: string, opts: LayerDataOptions): FeatureCollectionLike {
  const raw = opts.data;
  if (raw) {
    if (Array.isArray(raw)) return { type: "FeatureCollection", features: raw };
    const fc = raw as FeatureCollectionLike;
    if (Array.isArray(fc.features)) return fc;
    return { type: "FeatureCollection", features: [] };
  }
  if (opts.map) {
    const src = opts.map.getSource(`lyr:${layerId}`);
    // MapLibre GeoJSONSource keeps the served collection on `_data`.
    const data = src?._data;
    if (data && Array.isArray((data as FeatureCollectionLike).features)) {
      return data as FeatureCollectionLike;
    }
  }
  return { type: "FeatureCollection", features: [] };
}

/** Flatten GeoJSON features to CSV rows: property columns plus WKT-free lon/lat for points. */
function featuresToCsv(features: any[]): string {
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const f of features) {
    for (const key of Object.keys(f?.properties || {})) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }
  const hasPointGeom = features.some((f) => f?.geometry?.type === "Point");
  const header = hasPointGeom ? [...columns, "longitude", "latitude"] : columns;
  const escapeCell = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines: string[] = [header.map(escapeCell).join(",")];
  for (const f of features) {
    const props = f?.properties || {};
    const row = columns.map((c) => escapeCell(props[c]));
    if (hasPointGeom) {
      const coords = f?.geometry?.type === "Point" ? f.geometry.coordinates : [undefined, undefined];
      row.push(escapeCell(coords?.[0]), escapeCell(coords?.[1]));
    }
    lines.push(row.join(","));
  }
  return lines.join("\r\n");
}

/**
 * Export a layer's data as a Blob. `geojson` and `csv` are produced client-side from the layer's live
 * GeoJSON (via `map.getSource` or an explicit `data` option). `geoparquet` is served by the Strata
 * export endpoint (server-side GeoParquet writer) and is not produced in-browser.
 */
export function exportLayerData(layerId: string, opts: LayerDataOptions): Promise<Blob> {
  if (opts.format === "geoparquet") {
    return Promise.reject(
      new Error(
        "exportLayerData: geoparquet is served via the Strata export endpoint (server-side GeoParquet writer)."
      )
    );
  }
  const fc = resolveFeatureCollection(layerId, opts);
  const features = fc.features || [];
  if (opts.format === "csv") {
    return Promise.resolve(new Blob([featuresToCsv(features)], { type: "text/csv;charset=utf-8" }));
  }
  // geojson
  const body = JSON.stringify({ type: "FeatureCollection", features }, null, 2);
  return Promise.resolve(new Blob([body], { type: "application/geo+json" }));
}
