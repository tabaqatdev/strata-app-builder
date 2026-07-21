import { describe, it, expect } from "vitest";
import { initialSizes, resizeSplit } from "../../src/react/app/splitterMath.js";

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
