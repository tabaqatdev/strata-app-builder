import { describe, it, expect } from "vitest";
import { dashboardTemplate } from "../../src/react/app/templates.js";

describe("dashboardTemplate — default WIF connections", () => {
  it("assigns widget ids and emits a populated connections block that cross-filters on the first build", () => {
    const layout = dashboardTemplate({ mapLayerIds: ["parcels", "roads"], kpis: [{ label: "Total", value: 10 }] });
    // connections wire the app alive by default
    expect(layout.connections).toBeTruthy();
    const conns = layout.connections!;
    // chart selection filters the map (in place, targeting the primary layer)
    expect(conns).toContainEqual({
      from: "chart",
      trigger: "categorySelect",
      to: "map",
      action: "filter",
      options: { layerId: "parcels" },
    });
    // a table row zooms the map to it
    expect(conns.some((c) => c.from === "table" && c.action === "zoomTo")).toBe(true);
    // widget ids referenced by the connections actually exist in the tree
    const ids = new Set<string>();
    const walk = (node: any): void => {
      if (node.kind === "widget" && node.widget.id) ids.add(node.widget.id);
      (node.children ?? []).forEach(walk);
    };
    walk(layout.pages[0].root);
    expect(ids.has("map")).toBe(true);
    expect(ids.has("chart")).toBe(true);
    expect(ids.has("table")).toBe(true);
  });

  it("omits connections when there is no primary layer to target", () => {
    const layout = dashboardTemplate({ mapLayerIds: [], kpis: [] });
    expect(layout.connections).toBeUndefined();
  });
});
