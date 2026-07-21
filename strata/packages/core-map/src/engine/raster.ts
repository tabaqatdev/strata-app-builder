/**
 * raster — imagery layers: ESRI **ImageServer** (`exportImage`) and cloud-optimized GeoTIFF (**COG**) (#10).
 *
 * Pure builders (`buildImageServerTileUrl`, `imageServerSourceDef`, `cogSourceDef`) so the URL/source shape
 * is testable without a map; `registerCogProtocol` lazily wires the optional `@geomatico/maplibre-cog-protocol`
 * so COGs render directly. Everything stays EPSG:3857 tiles over an EPSG:4326 world (MapLibre reprojects).
 */

export interface ImageServerOptions {
  /** ESRI rendering rule (band combo / stretch) — JSON, sent as `renderingRule`. */
  renderingRule?: unknown;
  /** A mosaic time filter (epoch ms, or `start,end`) → the `time` export param. Drives raster time. */
  time?: number | [number, number];
  /** Output format (default `png32` for transparency). */
  format?: string;
}

/**
 * Build an ESRI **ImageServer** `exportImage` tile template for a MapLibre raster source. Uses the
 * `{bbox-epsg-3857}` token MapLibre substitutes per tile; requests 256×256 PNG with transparency.
 */
export function buildImageServerTileUrl(base: string, opts: ImageServerOptions = {}): string {
  const b = base.replace(/\/+$/, "");
  const params = new URLSearchParams({
    bbox: "{bbox-epsg-3857}",
    bboxSR: "3857",
    imageSR: "3857",
    size: "256,256",
    format: opts.format ?? "png32",
    transparent: "true",
    f: "image",
  });
  if (opts.renderingRule != null) params.set("renderingRule", JSON.stringify(opts.renderingRule));
  if (opts.time != null) params.set("time", Array.isArray(opts.time) ? opts.time.join(",") : String(opts.time));
  // The bbox token must not be URL-encoded, so append it raw rather than via URLSearchParams.
  return `${b}/exportImage?${params.toString().replace(encodeURIComponent("{bbox-epsg-3857}"), "{bbox-epsg-3857}")}`;
}

/** A MapLibre raster source definition for an ESRI ImageServer. */
export function imageServerSourceDef(base: string, opts: ImageServerOptions = {}, attribution?: string): Record<string, unknown> {
  return {
    type: "raster",
    tiles: [buildImageServerTileUrl(base, opts)],
    tileSize: 256,
    ...(attribution ? { attribution } : {}),
  };
}

/** A MapLibre raster source definition for a COG via the `cog://` protocol. */
export function cogSourceDef(url: string, attribution?: string): Record<string, unknown> {
  return {
    type: "raster",
    url: `cog://${url}`,
    tileSize: 256,
    ...(attribution ? { attribution } : {}),
  };
}

/** A native MapLibre **vector-tile** source: a `{z}/{x}/{y}.pbf` template, else a TileJSON `url`. */
export function vectorTileSourceDef(url: string, attribution?: string): Record<string, unknown> {
  const isTemplate = /\{z\}|\{x\}|\{y\}|\.pbf(\?|$)/i.test(url);
  return {
    type: "vector",
    ...(isTemplate ? { tiles: [url] } : { url }),
    ...(attribution ? { attribution } : {}),
  };
}

/** A **PMTiles** source (`pmtiles://…`) — vector (default) or raster. Needs `registerPmtilesProtocol`. */
export function pmtilesSourceDef(url: string, kind: "vector" | "raster" = "vector", attribution?: string): Record<string, unknown> {
  return {
    type: kind,
    url: url.startsWith("pmtiles://") ? url : `pmtiles://${url}`,
    ...(kind === "raster" ? { tileSize: 256 } : {}),
    ...(attribution ? { attribution } : {}),
  };
}

let pmtilesRegistered = false;
const PMTILES_MODULE = "pmtiles";
/**
 * Register the optional `pmtiles` `pmtiles://` protocol on the maplibregl module (idempotent). Returns
 * true when PMTiles support is available, false when the peer dep is not installed.
 */
export async function registerPmtilesProtocol(maplibregl: any): Promise<boolean> {
  if (pmtilesRegistered) return true;
  if (!maplibregl || typeof maplibregl.addProtocol !== "function") return false;
  try {
    const mod: any = await import(/* @vite-ignore */ PMTILES_MODULE);
    const Protocol = mod.Protocol ?? mod.default?.Protocol;
    if (!Protocol) return false;
    const proto = new Protocol();
    maplibregl.addProtocol("pmtiles", proto.tile);
    pmtilesRegistered = true;
    return true;
  } catch {
    return false;
  }
}

let cogRegistered = false;
/**
 * Register the optional `@geomatico/maplibre-cog-protocol` `cog://` handler on the maplibregl module
 * (idempotent). Returns true when COG support is available, false when the peer dep is not installed.
 */
export async function registerCogProtocol(maplibregl: any): Promise<boolean> {
  if (cogRegistered) return true;
  if (!maplibregl || typeof maplibregl.addProtocol !== "function") return false;
  try {
    // Variable specifier so tsc doesn't statically require the optional peer dep.
    const mod: any = await import(/* @vite-ignore */ COG_PROTOCOL_MODULE);
    const handler = mod.cogProtocol ?? mod.default;
    if (!handler) return false;
    maplibregl.addProtocol("cog", handler);
    cogRegistered = true;
    return true;
  } catch {
    return false;
  }
}

const COG_PROTOCOL_MODULE = "@geomatico/maplibre-cog-protocol";
