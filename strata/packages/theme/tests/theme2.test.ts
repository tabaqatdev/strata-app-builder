import { describe, it, expect } from "vitest";
import { deriveRamp, hexToRgb, luminance, contrastRatio, rgbToHex, compileTheme, resolveThemeMode, presetTheme, STRUCTURED_PRESETS } from "../src/index.js";

describe("resolveThemeMode + presets", () => {
  it("resolves auto by prefers-dark and passes concrete modes through", () => {
    expect(resolveThemeMode("auto", true)).toBe("dark");
    expect(resolveThemeMode("auto", false)).toBe("light");
    expect(resolveThemeMode("light", true)).toBe("light");
  });
  it("exposes structured presets and falls back to dark", () => {
    expect(Object.keys(STRUCTURED_PRESETS)).toEqual(["dark", "light", "hazard", "muted"]);
    expect(presetTheme("hazard").colors.danger).toBe("#ff3b30");
    expect(presetTheme("nope").mode).toBe("dark");
  });
  it("compileTheme treats auto as dark (host resolves it first)", () => {
    expect(compileTheme({ mode: "auto", colors: { primary: "#2b6cb0" } }).vars["--strata-app-bg"]).toBe("#0b0e13");
  });
});

describe("color math", () => {
  it("computes WCAG contrast (white vs black = 21)", () => {
    expect(Math.round(contrastRatio(hexToRgb("#ffffff"), hexToRgb("#000000")))).toBe(21);
  });
  it("normalizes a 3-digit hex", () => {
    expect(rgbToHex(hexToRgb("#abc"))).toBe("#aabbcc");
  });
});

describe("deriveRamp", () => {
  it("brightens hover in dark mode and darkens it in light mode", () => {
    const dark = deriveRamp("#2b6cb0", "dark");
    const light = deriveRamp("#2b6cb0", "light");
    expect(dark.base).toBe("#2b6cb0");
    expect(luminance(hexToRgb(dark.hover))).toBeGreaterThan(luminance(hexToRgb(dark.base)));
    expect(luminance(hexToRgb(light.hover))).toBeLessThan(luminance(hexToRgb(light.base)));
  });
  it("picks a WCAG-legible contrast color (≥3:1)", () => {
    const ramp = deriveRamp("#2b6cb0", "dark");
    expect(["#0b0e13", "#ffffff"]).toContain(ramp.contrast);
    expect(contrastRatio(hexToRgb(ramp.base), hexToRgb(ramp.contrast))).toBeGreaterThanOrEqual(3);
  });
});

describe("compileTheme", () => {
  const compiled = compileTheme({
    mode: "dark",
    colors: { primary: "#2b6cb0", danger: "#e11d48" },
    fonts: { scale: "spacious" },
    variables: { "--strata-radius-md": "12px" },
    overrides: { kpi: { "--strata-panel-bg": "#111111" } },
  });

  it("emits role vars with hover/active/contrast and legacy aliases", () => {
    const { vars } = compiled;
    expect(vars["--strata-primary"]).toBe("#2b6cb0");
    expect(vars["--strata-accent"]).toBe(vars["--strata-primary"]); // legacy alias
    expect(vars["--strata-critical"]).toBe(vars["--strata-danger"]);
    expect(vars["--strata-primary-hover"]).toBeTruthy();
    expect(vars["--strata-primary-active"]).toBeTruthy();
    expect(vars["--strata-primary-contrast"]).toBeTruthy();
    expect(vars["--strata-secondary"]).toBeTruthy(); // defaulted role
    expect(vars["--strata-info"]).toBeTruthy();
  });

  it("applies the type scale and merges variable overrides over defaults", () => {
    expect(compiled.vars["--strata-h1"]).toBe("32px"); // round(28 * 1.15)
    expect(compileTheme({ mode: "dark", colors: { primary: "#2b6cb0" } }).vars["--strata-h1"]).toBe("28px");
    expect(compiled.vars["--strata-radius-md"]).toBe("12px"); // override wins
    expect(compiled.vars["--strata-space-2"]).toBe("8px"); // default kept
  });

  it("generates a scoped stylesheet with states, focus ring, reduced-motion, and overrides", () => {
    const { css } = compiled;
    expect(css).toContain(":hover");
    expect(css).toContain("brightness");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain('[data-strata-widget="kpi"]');
    expect(css).toContain("#111111");
  });
});
