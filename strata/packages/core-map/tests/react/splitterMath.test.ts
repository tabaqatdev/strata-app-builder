import { describe, it, expect } from "vitest";
import { initialSizes, resizePanel, resizeSplit } from "../../src/react/app/splitterMath.js";

const round = (a: number[]): number[] => a.map((v) => Math.round(v * 100) / 100);

describe("initialSizes", () => {
  it("splits equally by default and normalizes explicit sizes", () => {
    expect(round(initialSizes(3))).toEqual([33.33, 33.33, 33.33]);
    expect(round(initialSizes(2, [30, 70]))).toEqual([30, 70]);
    expect(round(initialSizes(2, [1, 3]))).toEqual([25, 75]); // normalized to 100
    expect(round(initialSizes(2, [10, 20, 30]))).toEqual([50, 50]); // length mismatch → equal
  });
});

describe("resizeSplit", () => {
  it("re-apportions two neighbors and clamps at minimums", () => {
    expect(round(resizeSplit([50, 50], 0, 10))).toEqual([60, 40]);
    expect(round(resizeSplit([50, 50], 0, -10))).toEqual([40, 60]);
    expect(round(resizeSplit([50, 50], 0, 100, [5, 5]))).toEqual([95, 5]); // b clamped to minB
    expect(round(resizeSplit([50, 50], 0, -100, [10, 5]))).toEqual([10, 90]); // a clamped to minA
  });
  it("is a no-op for an out-of-range divider", () => {
    expect(round(resizeSplit([50, 50], 1, 10))).toEqual([50, 50]);
  });
});

describe("resizePanel", () => {
  it("grows and shrinks one box by a pixel delta", () => {
    expect(resizePanel(300, 40)).toBe(340);
    expect(resizePanel(300, -40)).toBe(260);
  });

  it("clamps to [min, max]", () => {
    expect(resizePanel(300, 5000, 200, 960)).toBe(960);
    expect(resizePanel(300, -5000, 200, 960)).toBe(200);
    expect(resizePanel(300, 100, 200)).toBe(400); // no max → unbounded above
  });

  it("measures from the drag's start, so a clamped drag comes back with the pointer", () => {
    const start = 300;
    expect(resizePanel(start, 5000, 200, 960)).toBe(960); // dragged past the max…
    expect(resizePanel(start, 10, 200, 960)).toBe(310); // …and back: no accumulated overshoot
  });

  it("survives an unmeasured box and a bad delta", () => {
    expect(resizePanel(NaN, 40, 200, 960)).toBe(240); // no layout yet → drag from the minimum
    expect(resizePanel(300, NaN, 200, 960)).toBe(300); // a delta from a pointer with no coords
    expect(resizePanel(300, 40, 400, 200)).toBe(400); // max below min → min wins
  });
});
