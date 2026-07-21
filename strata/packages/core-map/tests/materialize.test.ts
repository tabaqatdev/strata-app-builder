import { describe, it, expect, vi } from "vitest";
import type { SavedChart, SavedTable } from "@strata/schema";

const { loadFeatures } = vi.hoisted(() => ({ loadFeatures: vi.fn() }));
vi.mock("../src/engine/arcgisSource.js", () => ({ loadFeatures }));
import { aggregate, isLiveChart, isLiveTable, materializeChart, materializeTable } from "../src/engine/materialize.js";

const rows = [
  { ZONING: "R", ACRES: 10 }, { ZONING: "R", ACRES: 30 }, { ZONING: "C", ACRES: 5 },
];
const fc = { type: "FeatureCollection", features: rows.map((r) => ({ type: "Feature", properties: r, geometry: null })) };

describe("aggregate (#5 expression-not-snapshot)", () => {
  it("counts by field when no value field", () => {
    expect(aggregate(rows, "ZONING")).toEqual([{ label: "R", value: 2 }, { label: "C", value: 1 }]);
  });
  it("sums / averages a value field", () => {
    expect(aggregate(rows, "ZONING", "ACRES", "sum")).toEqual([{ label: "R", value: 40 }, { label: "C", value: 5 }]);
    expect(aggregate(rows, "ZONING", "ACRES", "avg")[0]).toEqual({ label: "R", value: 20 });
  });
});

describe("isLive* ", () => {
  it("is live only when a source.layer_id is present", () => {
    expect(isLiveChart({ id: "c", title: "", kind: "bar", source: { layer_id: "x", field: "Z" } } as SavedChart)).toBe(true);
    expect(isLiveChart({ id: "c", title: "", kind: "bar" } as SavedChart)).toBe(false);
    expect(isLiveTable({ id: "t", title: "", columns: [], source: { layer_id: "x" } } as SavedTable)).toBe(true);
  });
});

describe("materializeChart / materializeTable re-run the descriptor", () => {
  it("re-queries and groups a saved chart", async () => {
    loadFeatures.mockResolvedValueOnce(fc);
    const out = await materializeChart({ id: "c", title: "", kind: "bar", source: { layer_id: "x", field: "ZONING", value_field: "ACRES", stat: "sum" } } as SavedChart, "https://x/0", {} as any);
    expect(out).toEqual([{ label: "R", value: 40 }, { label: "C", value: 5 }]);
  });
  it("re-queries a saved table with its where + columns", async () => {
    loadFeatures.mockResolvedValueOnce(fc);
    const out = await materializeTable({ id: "t", title: "", columns: ["ZONING", "ACRES"], source: { layer_id: "x", where: "ZONING='R'" } } as SavedTable, "https://x/0", {} as any);
    expect(loadFeatures).toHaveBeenLastCalledWith("https://x/0", {}, { where: "ZONING='R'", outFields: "ZONING,ACRES", cap: 5000 });
    expect(out).toHaveLength(3);
  });
});
