import { describe, it, expect } from "vitest";
import { subLayerIdsFor, logicalLayerId } from "../src/engine/identify.js";

describe("subLayerIdsFor", () => {
  it("namespaces a logical layer into its rendered sub-layer ids", () => {
    expect(subLayerIdsFor("countries")).toEqual([
      "lyr:countries:fill",
      "lyr:countries:outline",
      "lyr:countries:line",
      "lyr:countries:circle",
      "lyr:countries:symbol",
    ]);
  });
});

describe("logicalLayerId", () => {
  it("extracts the logical id from a namespaced sub-layer id", () => {
    expect(logicalLayerId("lyr:countries:fill")).toBe("countries");
    expect(logicalLayerId("lyr:my-cities:circle")).toBe("my-cities");
  });

  it("returns undefined for a non-strata sub-layer id", () => {
    expect(logicalLayerId("basemap:dark")).toBeUndefined();
    expect(logicalLayerId("random")).toBeUndefined();
  });

  it("round-trips with subLayerIdsFor", () => {
    for (const sub of subLayerIdsFor("roads")) {
      expect(logicalLayerId(sub)).toBe("roads");
    }
  });
});
