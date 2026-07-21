import { describe, it, expect } from "vitest";
import { histogram, scatterPairs } from "../../src/react/panels/chartTransforms.js";
import { buildWhereGroups, type FilterGroup, type FilterField } from "../../src/react/panels/FilterPanel.js";

describe("histogram", () => {
  it("bins numeric values into equal-width buckets", () => {
    const h = histogram([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
    expect(h).toHaveLength(5);
    expect(h.reduce((a, b) => a + b.value, 0)).toBe(10);
    expect(h[0].value).toBe(2);
    expect(h[0].label).toContain("–");
  });
  it("handles empty and single-value inputs", () => {
    expect(histogram([])).toEqual([]);
    expect(histogram([5, 5, 5])).toEqual([{ label: "5.0", value: 3 }]);
  });
});

describe("scatterPairs", () => {
  it("maps rows to points, defaulting x to the index", () => {
    expect(scatterPairs([{ label: "a", value: 10 }, { label: "b", value: 20, x: 5 }])).toEqual([
      { x: 0, y: 10, label: "a" },
      { x: 5, y: 20, label: "b" },
    ]);
  });
});

describe("buildWhereGroups", () => {
  const fields: FilterField[] = [
    { name: "zone", type: "string" },
    { name: "pop", type: "number" },
  ];
  it("nests AND/OR with parentheses", () => {
    const g: FilterGroup = {
      combinator: "AND",
      conditions: [
        { field: "zone", operator: "=", value: "A" },
        { combinator: "OR", conditions: [
          { field: "pop", operator: ">", value: "1000" },
          { field: "pop", operator: "<", value: "10" },
        ] },
      ],
    };
    expect(buildWhereGroups(g, fields)).toBe("(zone = 'A' AND (pop > 1000 OR pop < 10))");
  });
  it("drops empty conditions and returns null when nothing is complete", () => {
    expect(buildWhereGroups({ combinator: "AND", conditions: [{ field: "zone", operator: "=", value: "" }] }, fields)).toBeNull();
  });
});
