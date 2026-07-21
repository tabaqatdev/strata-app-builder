/**
 * share — serialize the current app state into a shareable deep-link URL / embed snippet ([ExB] Share).
 *
 * Pure and reversible: {@link buildShareUrl} encodes view (center/zoom), basemap, active layer, and
 * per-layer filters into query params that {@link parseShareUrl} reads back — the two `@strata/plugins`
 * seams (`urlParameterNames` / `handleUrlParameters`) apply them on load. {@link buildEmbedSnippet} wraps
 * the URL in an iframe for embedding.
 */

export interface ShareState {
  /** Map view center `[lng, lat]`. */
  center?: [number, number];
  zoom?: number;
  /** Basemap id/title. */
  basemap?: string;
  /** Active layer id. */
  active?: string;
  /** Per-layer `definitionExpression` filters. */
  filters?: Record<string, string>;
}

/** The query parameter names this module reads/writes (a plugin declares these as `urlParameterNames`). */
export const SHARE_PARAM_NAMES = ["c", "z", "b", "a", "f"] as const;

/** Build a shareable URL from `baseUrl` + the current state (existing query params are preserved). */
export function buildShareUrl(baseUrl: string, state: ShareState): string {
  const url = new URL(baseUrl);
  const p = url.searchParams;
  // Clear any prior share params so re-sharing doesn't accumulate stale values.
  for (const k of SHARE_PARAM_NAMES) p.delete(k);
  if (state.center) p.set("c", `${round(state.center[0])},${round(state.center[1])}`);
  if (state.zoom != null) p.set("z", String(round(state.zoom, 2)));
  if (state.basemap) p.set("b", state.basemap);
  if (state.active) p.set("a", state.active);
  if (state.filters && Object.keys(state.filters).length) {
    p.set("f", encodeURIComponent(JSON.stringify(state.filters)));
  }
  return url.toString();
}

/** Parse a shareable URL back into a {@link ShareState}. */
export function parseShareUrl(url: string): ShareState {
  const p = new URL(url).searchParams;
  const state: ShareState = {};
  const c = p.get("c");
  if (c) {
    const [lng, lat] = c.split(",").map(Number);
    if (Number.isFinite(lng) && Number.isFinite(lat)) state.center = [lng, lat];
  }
  const z = p.get("z");
  if (z != null && Number.isFinite(Number(z))) state.zoom = Number(z);
  const b = p.get("b");
  if (b) state.basemap = b;
  const a = p.get("a");
  if (a) state.active = a;
  const f = p.get("f");
  if (f) {
    try {
      state.filters = JSON.parse(decodeURIComponent(f));
    } catch {
      /* malformed filter param — ignore */
    }
  }
  return state;
}

export interface EmbedOptions {
  width?: number | string;
  height?: number | string;
  title?: string;
}

/** Wrap a share URL in an `<iframe>` embed snippet. */
export function buildEmbedSnippet(url: string, opts: EmbedOptions = {}): string {
  const w = opts.width ?? "100%";
  const h = opts.height ?? 480;
  const title = (opts.title ?? "Map").replace(/"/g, "&quot;");
  const dim = (v: number | string): string => (typeof v === "number" ? `${v}px` : v);
  return `<iframe src="${url}" width="${dim(w)}" height="${dim(h)}" title="${title}" style="border:0" loading="lazy" allowfullscreen></iframe>`;
}

function round(n: number, places = 5): number {
  const f = Math.pow(10, places);
  return Math.round(n * f) / f;
}
