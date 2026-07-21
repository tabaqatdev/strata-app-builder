/**
 * The structured Theme model (Phase 6) and its compiler.
 *
 * `Theme` mirrors Experience Builder's four pillars — **colors** (semantic roles), **fonts** (a type scale),
 * **variables** (spacing/radius/elevation/motion design tokens), and **overrides** (per-widget-type token
 * patches). {@link compileTheme} flattens it to `--strata-*` CSS custom properties (the same surface the
 * existing widgets already read, so it is back-compat) **plus** a scoped stylesheet that carries the
 * interaction states (`:hover`/`:active`/`:focus-visible`) and motion that inline styles can't express.
 */
import { deriveRamp } from "./color.js";
import type { ThemeMode } from "./themes.js";

/** The `mode` a recipe may set: a concrete mode, or `"auto"` (follow `prefers-color-scheme`). */
export type ThemeInputMode = ThemeMode | "auto";

/** Resolve `"auto"` to a concrete mode given the OS preference; concrete modes pass through. */
export function resolveThemeMode(mode: ThemeInputMode, prefersDark: boolean): ThemeMode {
  if (mode === "light" || mode === "dark") return mode;
  return prefersDark ? "dark" : "light";
}

/** ExB's 8 semantic color roles. Only `primary` is required; the rest fall back to sensible defaults. */
export interface ColorRoles {
  primary: string;
  secondary?: string;
  success?: string;
  info?: string;
  warning?: string;
  danger?: string;
  light?: string;
  dark?: string;
}

export interface TypeSystem {
  family?: string;
  mono?: string;
  /** Multiplies the type ramp. */
  scale?: "compact" | "default" | "spacious";
}

export interface Theme {
  /** Concrete mode, or `"auto"` (resolved via `resolveThemeMode` before compiling). */
  mode: ThemeInputMode;
  colors: ColorRoles;
  fonts?: TypeSystem;
  /** Raw `--strata-*` design-token overrides (full token names), merged over the defaults. */
  variables?: Record<string, string>;
  /** Per-widget-type token patches: `{ kpi: { "--strata-panel-bg": "#111" } }`. */
  overrides?: Record<string, Record<string, string>>;
}

interface Surface {
  fg: string;
  appBg: string;
  panelBg: string;
  border: string;
  muted: string;
}

const SURFACES: Record<ThemeMode, Surface> = {
  dark: { fg: "#e8ecf1", appBg: "#0b0e13", panelBg: "#12151b", border: "rgba(255,255,255,0.08)", muted: "#8b96a6" },
  light: { fg: "#1a2230", appBg: "#f6f8fb", panelBg: "#ffffff", border: "rgba(0,0,0,0.10)", muted: "#5a6675" },
};

/** Role → sensible default hex when the recipe omits it (mode-aware for light/dark). */
function roleDefaults(mode: ThemeMode): Required<Omit<ColorRoles, "primary">> {
  return {
    secondary: mode === "dark" ? "#8b5cf6" : "#7c3aed",
    success: mode === "dark" ? "#35c48f" : "#1f9d6b",
    info: mode === "dark" ? "#4ea1ff" : "#2b6cb0",
    warning: mode === "dark" ? "#f5a524" : "#c77d10",
    danger: mode === "dark" ? "#f2545b" : "#d64550",
    light: "#f6f8fb",
    dark: "#0b0e13",
  };
}

const SCALE_FACTOR: Record<NonNullable<TypeSystem["scale"]>, number> = {
  compact: 0.9,
  default: 1,
  spacious: 1.15,
};

const DEFAULT_VARIABLES: Record<string, string> = {
  "--strata-space-1": "4px",
  "--strata-space-2": "8px",
  "--strata-space-3": "12px",
  "--strata-space-4": "16px",
  "--strata-radius-sm": "6px",
  "--strata-radius-md": "10px",
  "--strata-radius-lg": "16px",
  "--strata-radius-pill": "999px",
  "--strata-elevation-1": "0 1px 2px rgba(0,0,0,0.20)",
  "--strata-elevation-2": "0 4px 12px rgba(0,0,0,0.28)",
  "--strata-motion-fast": "120ms",
  "--strata-motion-base": "200ms",
  "--strata-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
};

export interface CompiledTheme {
  vars: Record<string, string>;
  css: string;
}

/** Flatten a structured `Theme` to CSS custom properties + a scoped stylesheet. */
export function compileTheme(theme: Theme): CompiledTheme {
  // `auto` is resolved by the host (`<StrataApp>`) before compiling; fall back to dark if it slips through.
  const mode: ThemeMode = theme.mode === "light" ? "light" : "dark";
  const surface = SURFACES[mode];
  const vars: Record<string, string> = {
    "--strata-fg": surface.fg,
    "--strata-app-bg": surface.appBg,
    "--strata-panel-bg": surface.panelBg,
    "--strata-border": surface.border,
    "--strata-muted": surface.muted,
  };

  const defaults = roleDefaults(mode);
  const roles: ColorRoles = { ...defaults, ...theme.colors };
  for (const [role, hex] of Object.entries(roles)) {
    if (!hex) continue;
    const ramp = deriveRamp(hex, mode);
    vars[`--strata-${role}`] = ramp.base;
    vars[`--strata-${role}-hover`] = ramp.hover;
    vars[`--strata-${role}-active`] = ramp.active;
    vars[`--strata-${role}-contrast`] = ramp.contrast;
  }

  // Legacy aliases so existing widgets restyle from the roles without changes.
  vars["--strata-accent"] = vars["--strata-primary"];
  vars["--strata-critical"] = vars["--strata-danger"];
  vars["--strata-success"] = vars["--strata-success"] ?? roles.success!;
  vars["--strata-warning"] = vars["--strata-warning"] ?? roles.warning!;
  vars["--strata-ok"] = vars["--strata-success"];
  vars["--strata-warn"] = vars["--strata-warning"];

  // Type scale.
  const m = SCALE_FACTOR[theme.fonts?.scale ?? "default"];
  if (theme.fonts?.family) vars["--strata-font-family"] = theme.fonts.family;
  if (theme.fonts?.mono) vars["--strata-font-family-mono"] = theme.fonts.mono;
  vars["--strata-h1"] = `${Math.round(28 * m)}px`;
  vars["--strata-h2"] = `${Math.round(22 * m)}px`;
  vars["--strata-h3"] = `${Math.round(17 * m)}px`;
  vars["--strata-body1"] = `${Math.round(14 * m)}px`;
  vars["--strata-body2"] = `${Math.round(12 * m)}px`;

  // Design tokens (defaults merged with overrides).
  Object.assign(vars, DEFAULT_VARIABLES, theme.variables ?? {});

  return { vars, css: buildCss(theme.overrides) };
}

/** The scoped stylesheet: interaction states + motion (honoring reduced-motion) + per-widget overrides. */
function buildCss(overrides?: Record<string, Record<string, string>>): string {
  const lines: string[] = [
    `[data-strata-app] button, [data-strata-app] a[role="button"], [data-strata-app] [data-strata-interactive] {`,
    `  transition: filter var(--strata-motion-fast, 120ms) var(--strata-ease, ease), background-color var(--strata-motion-fast, 120ms) var(--strata-ease, ease);`,
    `}`,
    `[data-strata-app] button:hover, [data-strata-app] [data-strata-interactive]:hover { filter: brightness(1.08); }`,
    `[data-strata-app] button:active, [data-strata-app] [data-strata-interactive]:active { filter: brightness(0.96) saturate(1.12); }`,
    `[data-strata-app] :focus-visible { outline: 2px solid var(--strata-primary-hover, var(--strata-accent, #4ea1ff)); outline-offset: 2px; }`,
    `@media (prefers-reduced-motion: reduce) { [data-strata-app] * { transition: none !important; animation: none !important; } }`,
  ];
  for (const [type, patch] of Object.entries(overrides ?? {})) {
    const body = Object.entries(patch)
      .map(([k, v]) => `${k}: ${v};`)
      .join(" ");
    lines.push(`[data-strata-app] [data-strata-widget="${type}"] { ${body} }`);
  }
  return lines.join("\n");
}

/**
 * Structured-theme presets (the superset of the flat `THEME_PRESETS`) — for the `theme-switch` widget and
 * recipes that want to swap whole `Theme` objects. Each is one hex per lead role; the compiler derives the
 * rest. `light`/`dark` are the mode pair; `hazard`/`muted` are branded variants.
 */
export const STRUCTURED_PRESETS: Record<string, Theme> = {
  dark: { mode: "dark", colors: { primary: "#4ea1ff" } },
  light: { mode: "light", colors: { primary: "#2b6cb0" } },
  hazard: { mode: "dark", colors: { primary: "#ff6b3d", danger: "#ff3b30", warning: "#ffb020", success: "#34c759" } },
  muted: { mode: "light", colors: { primary: "#5b7a99" } },
};

/** Look up a structured preset by name (falls back to `dark`). */
export function presetTheme(name: string | undefined): Theme {
  return STRUCTURED_PRESETS[name ?? "dark"] ?? STRUCTURED_PRESETS.dark;
}
