import { describe, it, expect } from "vitest";
import { buildToolArgs, resultRecords, TOOL_ARGS } from "../../src/react/panels/analysisArgs.js";

const fc = { type: "FeatureCollection", features: [{ a: 1 }] };
const mask = { type: "FeatureCollection", features: [{ b: 2 }] };

describe("buildToolArgs", () => {
  it("maps the primary FC + scalar param (buffer)", () => {
    expect(buildToolArgs("buffer", { input: fc, param: 5 })).toEqual({ fc, distanceKm: 5 });
    expect(buildToolArgs("buffer", { input: fc })).toEqual({ fc });
  });
  it("maps a group field (dissolve) and a secondary FC (clip, pointsWithin)", () => {
    expect(buildToolArgs("dissolve", { input: fc, field: "zone" })).toEqual({ fc, field: "zone" });
    expect(buildToolArgs("clip", { input: fc, secondary: mask })).toEqual({ fc, mask });
    expect(buildToolArgs("pointsWithin", { input: fc, secondary: mask })).toEqual({ pointsFc: fc, polygonsFc: mask });
  });
  it("maps predicate + renamed primary/secondary (spatialJoin, withinDistance)", () => {
    expect(buildToolArgs("spatialJoin", { input: fc, secondary: mask, predicate: "within" })).toEqual({ targetFc: fc, joinFc: mask, predicate: "within" });
    expect(buildToolArgs("withinDistance", { input: fc, secondary: mask, param: 3 })).toEqual({ pointsFc: fc, refPointsFc: mask, km: 3 });
  });
  it("falls back to { fc: input } for an unknown tool", () => {
    expect(buildToolArgs("nope", { input: fc })).toEqual({ fc });
  });
});

describe("resultRecords", () => {
  it("unwraps a FeatureCollection to its features, else wraps in an array", () => {
    expect(resultRecords({ type: "FeatureCollection", features: [{}, {}] })).toEqual([{}, {}]);
    expect(resultRecords([1, 2, 3])).toEqual([1, 2, 3]);
    expect(resultRecords(42)).toEqual([42]);
  });
});

describe("TOOL_ARGS", () => {
  it("knows the curated tool set", () => {
    expect(Object.keys(TOOL_ARGS)).toContain("buffer");
    expect(Object.keys(TOOL_ARGS).length).toBe(13);
  });
});
