/**
 * Pure color math for the theme system — hex parsing, luminance/contrast (WCAG), brightness mixing, and
 * HSL saturation — plus {@link deriveRamp}, which turns one role hex into the interaction ramp the compiler
 * emits (`base` / `hover` / `active` / `contrast`). No dependencies; fully unit-testable.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parse `#rgb` or `#rrggbb` (with or without `#`) to RGB. Unknown input → black. */
export function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return { r: 0, g: 0, b: 0 };
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const clamp = (v: number, lo = 0, hi = 255): number => Math.max(lo, Math.min(hi, v));

export function rgbToHex({ r, g, b }: Rgb): string {
  const h = (v: number): string => clamp(Math.round(v)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Relative luminance (WCAG 2.1), 0 (black) … 1 (white). */
export function luminance({ r, g, b }: Rgb): number {
  const ch = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/** WCAG contrast ratio between two colors (1 … 21). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Linear blend of two colors; `amount` 0 = `a`, 1 = `b`. */
export function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  const t = Math.max(0, Math.min(1, amount));
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

/** Lighten (positive) or darken (negative) by mixing toward white/black. */
export function brighten(c: Rgb, amount: number): Rgb {
  return amount >= 0 ? mix(c, WHITE, amount) : mix(c, BLACK, -amount);
}

/** Increase (positive) or decrease saturation by moving channels away from their mean. */
export function saturate(c: Rgb, amount: number): Rgb {
  const mean = (c.r + c.g + c.b) / 3;
  return {
    r: clamp(mean + (c.r - mean) * (1 + amount)),
    g: clamp(mean + (c.g - mean) * (1 + amount)),
    b: clamp(mean + (c.b - mean) * (1 + amount)),
  };
}

/** The interaction ramp derived from one role color. */
export interface ColorRamp {
  base: string;
  /** brighter on hover (EB "hover modifies brightness"). */
  hover: string;
  /** more saturated + slightly deeper on active/selected (EB "active boosts saturation"). */
  active: string;
  /** an accessible text color to place ON the base (near-black or near-white by luminance). */
  contrast: string;
}

const NEAR_BLACK = "#0b0e13";
const NEAR_WHITE = "#ffffff";

/**
 * Derive the hover/active/contrast variants for a role color. In dark mode hover brightens; in light mode
 * hover darkens slightly (so the shift is always perceptible against the surface). `contrast` is chosen for
 * WCAG legibility against the base.
 */
export function deriveRamp(hex: string, mode: "light" | "dark" = "dark"): ColorRamp {
  const base = hexToRgb(hex);
  const hover = mode === "dark" ? brighten(base, 0.14) : brighten(base, -0.1);
  const active = brighten(saturate(base, 0.18), -0.04);
  const contrastCandidate = hexToRgb(NEAR_BLACK);
  const contrast =
    contrastRatio(base, contrastCandidate) >= contrastRatio(base, hexToRgb(NEAR_WHITE))
      ? NEAR_BLACK
      : NEAR_WHITE;
  return { base: rgbToHex(base), hover: rgbToHex(hover), active: rgbToHex(active), contrast };
}
