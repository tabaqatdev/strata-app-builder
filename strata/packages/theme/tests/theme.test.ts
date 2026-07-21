import { describe, it, expect } from "vitest";
import {
  categorical,
  sequential,
  diverging,
  sampleRamp,
  hexToEsri,
  CATEGORICAL,
  themeTokens,
  getThemePreset,
  THEME_PRESETS,
} from "../src/index.js";

const HEX = /^#[0-9a-f]{6}$/i;

describe("palettes", () => {
  it("categorical returns n colorblind-safe hex colors and cycles past the palette length", () => {
    expect(categorical(3)).toEqual([CATEGORICAL[0], CATEGORICAL[1], CATEGORICAL[2]]);
    const ten = categorical(10);
    expect(ten).toHaveLength(10);
    expect(ten[8]).toBe(CATEGORICAL[0]); // wraps at 8
    ten.forEach((c) => expect(c).toMatch(HEX));
  });

  it("sequential samples n colors from a ramp, endpoints preserved", () => {
    const cols = sequential(5, "blues");
    expect(cols).toHaveLength(5);
    expect(cols[0].toLowerCase()).toBe("#f7fbff");
    expect(cols[4].toLowerCase()).toBe("#08306b");
    cols.forEach((c) => expect(c).toMatch(HEX));
  });

  it("sequential falls back to viridis for an unknown ramp name", () => {
    expect(sequential(3, "nope" as any)).toEqual(sequential(3, "viridis"));
  });

  it("diverging returns a symmetric-length ramp with a neutral middle", () => {
    const cols = diverging(7, "RdBu");
    expect(cols).toHaveLength(7);
    // middle of RdBu is near-white #f7f7f7
    expect(cols[3].toLowerCase()).toBe("#f7f7f7");
  });

  it("sampleRamp interpolates a midpoint", () => {
    // halfway between black and white ≈ mid-grey
    const [mid] = sampleRamp(["#000000", "#ffffff"], 3).slice(1, 2);
    expect(mid.toLowerCase()).toBe("#808080");
  });

  it("sampleRamp handles n=1 and n=0", () => {
    expect(sampleRamp(["#000000", "#ffffff"], 0)).toEqual([]);
    expect(sampleRamp(["#111111", "#222222", "#333333"], 1)).toEqual(["#222222"]);
  });

  it("hexToEsri converts to [r,g,b,a]", () => {
    expect(hexToEsri("#0072B2")).toEqual([0, 114, 178, 255]);
    expect(hexToEsri("#ffffff", 100)).toEqual([255, 255, 255, 100]);
  });
});

describe("theme presets", () => {
  it("exposes light/dark/hazard/muted, each a full --strata-* token set", () => {
    for (const name of ["light", "dark", "hazard", "muted"]) {
      const preset = getThemePreset(name);
      expect(preset.name).toBe(name);
      expect(preset.tokens["--strata-fg"]).toMatch(HEX);
      expect(preset.tokens["--strata-accent"]).toMatch(HEX);
      expect(Object.keys(preset.tokens).every((k) => k.startsWith("--strata-"))).toBe(true);
    }
  });

  it("carries a mode so a dark UI can pair with a dark basemap", () => {
    expect(THEME_PRESETS.dark.mode).toBe("dark");
    expect(THEME_PRESETS.hazard.mode).toBe("dark");
    expect(THEME_PRESETS.light.mode).toBe("light");
    expect(THEME_PRESETS.muted.mode).toBe("light");
  });

  it("themeTokens is a fresh copy assignable to AppLayout.theme", () => {
    const t = themeTokens("light");
    t["--strata-fg"] = "#000";
    expect(getThemePreset("light").tokens["--strata-fg"]).not.toBe("#000");
  });

  it("unknown theme name falls back to dark", () => {
    expect(getThemePreset("bogus").name).toBe("dark");
  });
});
