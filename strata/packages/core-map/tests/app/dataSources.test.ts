import { describe, it, expect } from "vitest";
import type { AppPage } from "@strata/schema";
import { createStrataStore } from "@strata/state";
import { OutputRegistry } from "@strata/actions";
import { DataSourceManager } from "@strata/data-source";
import { collectBindings, registerAppDataSources } from "../../src/react/app/dataSources.js";

function pagesFixture(): AppPage[] {
  return [
    {
      id: "main",
      root: {
        kind: "row",
        children: [
          { kind: "widget", widget: { id: "map", type: "map" } }, // no binding
          {
            kind: "column",
            children: [
              { kind: "widget", widget: { id: "kpi", type: "kpi", dataSource: { layerId: "parcels" } } },
              { kind: "widget", widget: { id: "tbl", type: "table", dataSource: { layerId: "parcels" } } },
              {
                kind: "views",
                views: [
                  {
                    id: "v1",
                    content: {
                      kind: "widget",
                      widget: { id: "chart", type: "chart", dataSource: { fromWidget: "flt" } },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ] as AppPage[];
}

describe("collectBindings", () => {
  it("flattens every bound widget across containers and views", () => {
    const found = collectBindings(pagesFixture());
    expect(found.map((b) => b.id).sort()).toEqual(["chart", "kpi", "tbl"]);
    expect(found.find((b) => b.id === "chart")?.binding.fromWidget).toBe("flt");
  });
});

describe("registerAppDataSources", () => {
  it("registers a shared feature-layer source per layerId and an output source per fromWidget", () => {
    const store = createStrataStore();
    store.getState().addLayer({ id: "parcels", title: "Parcels", layerType: "GeoJSON", source: { kind: "geojson" } });
    const outputs = new OutputRegistry();
    const mgr = new DataSourceManager();

    const count = registerAppDataSources(mgr, pagesFixture(), { store, outputs });
    expect(count).toBe(3); // kpi + tbl (same layer, idempotent instance) + chart output

    const parcels = mgr.get("parcels");
    expect(parcels?.kind).toBe("feature-layer");
    // kpi and tbl resolve to the SAME instance → they link with no connections
    expect(mgr.resolve({ layerId: "parcels" }, { store })).toBe(parcels);
    expect(mgr.get("flt")?.kind).toBe("output");
  });

  it("skips sourceId bindings (owned by the app)", () => {
    const store = createStrataStore();
    const mgr = new DataSourceManager();
    const pages: AppPage[] = [
      {
        id: "p",
        root: { kind: "widget", widget: { id: "k", type: "kpi", dataSource: { sourceId: "preregistered" } } },
      },
    ] as AppPage[];
    expect(registerAppDataSources(mgr, pages, { store })).toBe(0);
  });
});
