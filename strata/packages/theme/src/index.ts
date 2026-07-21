/**
 * @strata/theme — the single validated visual system for strata-app-builder.
 *
 * Symbology, charts, and app themes all draw from here so a generated app is coherent on the first build:
 *   - {@link categorical} / {@link sequential} / {@link diverging} — colorblind-safe color ramps.
 *   - {@link hexToEsri} — bridge ramp colors into ESRI `drawingInfo` `[r,g,b,a]`.
 *   - {@link themeTokens} / {@link getThemePreset} — named `AppLayout.theme` presets (light/dark/hazard/muted).
 */

export * from "./palettes.js";
export * from "./themes.js";
export * from "./color.js";
export * from "./theme2.js";
