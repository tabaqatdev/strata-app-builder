/**
 * palettes — colorblind-safe color ramps shared by symbology (`drawingInfo`) and charts.
 *
 * - Categorical: the Okabe-Ito 8-color palette (deuteranopia/protanopia/tritanopia-safe), reordered so
 *   the strongest, most-distinct hues come first. Cycles for n > 8.
 * - Sequential / diverging: perceptually-ordered anchor ramps (viridis, single-hue ColorBrewer, RdBu,
 *   PuOr) sampled to n classes by linear RGB interpolation. All read on both light and dark backgrounds.
 *
 * Everything returns `#rrggbb` hex so it drops straight into ESRI `[r,g,b,a]` (via {@link hexToEsri})
 * or a CSS color for charts.
 */

/** Okabe-Ito colorblind-safe categorical palette (chromatic 8; grey last). */
export const CATEGORICAL: readonly string[] = [
  "#0072B2", // blue
  "#E69F00", // orange
  "#009E73", // bluish green
  "#CC79A7", // reddish purple
  "#56B4E9", // sky blue
  "#D55E00", // vermillion
  "#F0E442", // yellow
  "#999999", // grey
];

/** Named sequential ramps (low → high). */
export const SEQUENTIAL: Record<string, readonly string[]> = {
  viridis: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"],
  blues: ["#f7fbff", "#c6dbef", "#6baed6", "#2171b5", "#08306b"],
  reds: ["#fff5f0", "#fcbba1", "#fb6a4a", "#cb181d", "#67000d"],
  greens: ["#f7fcf5", "#c7e9c0", "#74c476", "#238b45", "#00441b"],
  oranges: ["#fff5eb", "#fdd0a2", "#fd8d3c", "#d94801", "#7f2704"],
};

/** Named diverging ramps (low ↔ mid ↔ high). RdBu + PuOr are the colorblind-safest pairs. */
export const DIVERGING: Record<string, readonly string[]> = {
  RdBu: ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"],
  PuOr: ["#b35806", "#f1a340", "#fee0b6", "#f7f7f7", "#d8daeb", "#998ec3", "#542788"],
  BrBG: ["#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac", "#01665e"],
};

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function toHex(rgb: [number, number, number]): string {
  return "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

/** Sample `n` evenly-spaced colors from a list of anchor stops via linear RGB interpolation. */
export function sampleRamp(anchors: readonly string[], n: number): string[] {
  if (n <= 0) return [];
  if (anchors.length === 0) return [];
  if (n === 1) return [anchors[Math.floor((anchors.length - 1) / 2)]];
  const rgbs = anchors.map(parseHex);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * (rgbs.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(lo + 1, rgbs.length - 1);
    const f = t - lo;
    const c: [number, number, number] = [
      rgbs[lo][0] + (rgbs[hi][0] - rgbs[lo][0]) * f,
      rgbs[lo][1] + (rgbs[hi][1] - rgbs[lo][1]) * f,
      rgbs[lo][2] + (rgbs[hi][2] - rgbs[lo][2]) * f,
    ];
    out.push(toHex(c));
  }
  return out;
}

/** `n` distinct categorical colors (cycles the Okabe-Ito palette past 8). */
export function categorical(n: number): string[] {
  return Array.from({ length: Math.max(0, n) }, (_, i) => CATEGORICAL[i % CATEGORICAL.length]);
}

/** `n` sequential colors from a named ramp (default viridis). */
export function sequential(n: number, ramp: keyof typeof SEQUENTIAL | (string & {}) = "viridis"): string[] {
  return sampleRamp(SEQUENTIAL[ramp as string] ?? SEQUENTIAL.viridis, n);
}

/** `n` diverging colors from a named ramp (default RdBu). */
export function diverging(n: number, ramp: keyof typeof DIVERGING | (string & {}) = "RdBu"): string[] {
  return sampleRamp(DIVERGING[ramp as string] ?? DIVERGING.RdBu, n);
}

/** `#rrggbb` → ESRI `[r,g,b,a]` (a in 0-255, default 255) for `drawingInfo` symbols. */
export function hexToEsri(hex: string, alpha = 255): [number, number, number, number] {
  const [r, g, b] = parseHex(hex);
  return [r, g, b, alpha];
}
