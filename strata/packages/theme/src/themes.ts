/**
 * themes — named `AppLayout.theme` presets as `--strata-*` CSS-custom-property token sets.
 *
 * `<StrataApp>` applies `config.theme` verbatim as inline CSS variables, so a preset's `tokens` map
 * drops straight into `AppLayout.theme`. Each preset also carries a `mode` (`light`|`dark`) so authoring
 * commands can pair a dark UI with a dark vector basemap (and vice-versa).
 */

export type ThemeMode = "light" | "dark";

export interface ThemePreset {
  name: string;
  mode: ThemeMode;
  /** `--strata-*` → value; assignable directly to `AppLayout.theme`. */
  tokens: Record<string, string>;
}

const DARK: ThemePreset = {
  name: "dark",
  mode: "dark",
  tokens: {
    "--strata-fg": "#e8ecf1",
    "--strata-app-bg": "#0b0e13",
    "--strata-panel-bg": "#12151b",
    "--strata-border": "rgba(255,255,255,0.08)",
    "--strata-accent": "#4ea1ff",
    "--strata-muted": "#8b96a6",
    "--strata-critical": "#f2545b",
    "--strata-success": "#35c48f",
    "--strata-warning": "#f5a524",
  },
};

const LIGHT: ThemePreset = {
  name: "light",
  mode: "light",
  tokens: {
    "--strata-fg": "#1a2230",
    "--strata-app-bg": "#f6f8fb",
    "--strata-panel-bg": "#ffffff",
    "--strata-border": "rgba(0,0,0,0.10)",
    "--strata-accent": "#2b6cb0",
    "--strata-muted": "#5a6675",
    "--strata-critical": "#d64550",
    "--strata-success": "#1f9d6b",
    "--strata-warning": "#c77d10",
  },
};

const HAZARD: ThemePreset = {
  name: "hazard",
  mode: "dark",
  tokens: {
    "--strata-fg": "#f4f6f8",
    "--strata-app-bg": "#0a0c10",
    "--strata-panel-bg": "#14181f",
    "--strata-border": "rgba(255,120,80,0.18)",
    "--strata-accent": "#ff6b3d",
    "--strata-muted": "#93a0b0",
    "--strata-critical": "#ff3b30",
    "--strata-success": "#34c759",
    "--strata-warning": "#ffb020",
  },
};

const MUTED: ThemePreset = {
  name: "muted",
  mode: "light",
  tokens: {
    "--strata-fg": "#2b3440",
    "--strata-app-bg": "#eef1f4",
    "--strata-panel-bg": "#f8fafb",
    "--strata-border": "rgba(60,70,85,0.12)",
    "--strata-accent": "#5b7a99",
    "--strata-muted": "#7a8797",
    "--strata-critical": "#b56576",
    "--strata-success": "#6a9a78",
    "--strata-warning": "#c9a24b",
  },
};

export const THEME_PRESETS: Record<string, ThemePreset> = {
  dark: DARK,
  light: LIGHT,
  hazard: HAZARD,
  muted: MUTED,
};

export const DEFAULT_THEME = "dark";

/** Look up a preset by name; falls back to the default (dark) preset for unknown names. */
export function getThemePreset(name: string | undefined): ThemePreset {
  return THEME_PRESETS[name ?? DEFAULT_THEME] ?? THEME_PRESETS[DEFAULT_THEME];
}

/** The token map for a named theme — assign to `AppLayout.theme`. */
export function themeTokens(name: string | undefined): Record<string, string> {
  return { ...getThemePreset(name).tokens };
}
