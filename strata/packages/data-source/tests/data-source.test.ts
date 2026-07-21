import { describe, it, expect } from "vitest";
import { createStrataStore } from "@strata/state";
import { OutputRegistry } from "@strata/actions";
import type { OperationalLayer } from "@strata/schema";
import {
  matchesWhere,
  applyWhere,
  computeStatistics,
  FeatureLayerDataSource,
  OutputDataSource,
  StatisticsDataSource,
  GeometryDataSource,
  WebMapDataSource,
  DataSourceManager,
  recordsToRows,
} from "../src/index.js";

const ROWS = [
  { OBJECTID: 1, zone: "A", pop: 100, region: "N" },
  { OBJECTID: 2, zone: "A", pop: 200, region: "S" },
  { OBJECTID: 3, zone: "B", pop: 300, region: "N" },
  { OBJECTID: 4, zone: "C", pop: 400, region: "S" },
];

function layer(id: string): OperationalLayer {
  return { id, title: id, layerType: "GeoJSON", source: { kind: "geojson" } };
}

function storeWithLayer(id: string) {
  const store = createStrataStore();
  store.getState().addLayer(layer(id));
  return store;
}

describe("query engine — matchesWhere", () => {
  it("handles equality with quoted strings", () => {
    expect(matchesWhere("zone = 'A'", ROWS[0])).toBe(true);
    expect(matchesWhere("zone = 'B'", ROWS[0])).toBe(false);
  });
  it("handles numeric comparisons", () => {
    expect(matchesWhere("pop >= 200", ROWS[1])).toBe(true);
    expect(matchesWhere("pop >= 200", ROWS[0])).toBe(false);
  });
  it("handles the WIF range clause (>= AND <=)", () => {
    expect(matchesWhere("pop >= 150 AND pop <= 350", ROWS[2])).toBe(true);
    expect(matchesWhere("pop >= 150 AND pop <= 350", ROWS[3])).toBe(false);
  });
  it("handles IN and BETWEEN and OR", () => {
    expect(matchesWhere("zone IN ('A','C')", ROWS[3])).toBe(true);
    expect(matchesWhere("pop BETWEEN 250 AND 450", ROWS[2])).toBe(true);
    expect(matchesWhere("zone = 'B' OR zone = 'C'", ROWS[3])).toBe(true);
  });
  it("handles IS NULL / IS NOT NULL", () => {
    expect(matchesWhere("region IS NULL", { region: null })).toBe(true);
    expect(matchesWhere("region IS NOT NULL", ROWS[0])).toBe(true);
  });
  it("empty where matches everything", () => {
    expect(applyWhere(ROWS, "")).toHaveLength(4);
    expect(applyWhere(ROWS, undefined)).toHaveLength(4);
  });
});

describe("statistics engine", () => {
  it("aggregates without groupBy", () => {
    const res = computeStatistics(ROWS, [
      { field: "OBJECTID", op: "count", alias: "n" },
      { field: "pop", op: "sum", alias: "total" },
    ]);
    expect(res.rows[0]).toEqual({ n: 4, total: 1000 });
  });
  it("groups by a field", () => {
    const res = computeStatistics(ROWS, [{ field: "pop", op: "sum", groupBy: "zone", alias: "total" }]);
    const a = res.rows.find((r) => r.zone === "A");
    expect(a?.total).toBe(300);
    expect(res.rows).toHaveLength(3);
  });
});

describe("FeatureLayerDataSource", () => {
  it("filters through the store definitionExpression", () => {
    const store = storeWithLayer("parcels");
    const ds = new FeatureLayerDataSource({ layerId: "parcels", store, rows: ROWS });
    expect(ds.getFilteredView().rows).toHaveLength(4);
    store.getState().setDefinition("parcels", "zone = 'A'");
    expect(ds.getFilteredView().rows).toHaveLength(2);
  });

  it("round-trips selection through the store", () => {
    const store = storeWithLayer("parcels");
    const ds = new FeatureLayerDataSource({ layerId: "parcels", store, rows: ROWS });
    ds.setSelection({ layerId: "parcels", oids: [2, 3] });
    expect(ds.getSelection()).toEqual({ layerId: "parcels", oids: [2, 3] });
    expect(store.getState().selection).toEqual({ layerId: "parcels", oids: [2, 3] });
  });

  it("computes statistics over the filtered view", async () => {
    const store = storeWithLayer("parcels");
    const ds = new FeatureLayerDataSource({ layerId: "parcels", store, rows: ROWS });
    store.getState().setDefinition("parcels", "region = 'N'");
    const res = await ds.getStatistics([{ field: "pop", op: "sum", alias: "total" }]);
    expect(res.rows[0].total).toBe(400); // 100 + 300
  });

  it("emits filterChange, countChange, and selectionChange", () => {
    const store = storeWithLayer("parcels");
    const ds = new FeatureLayerDataSource({ layerId: "parcels", store, rows: ROWS });
    const events: string[] = [];
    ds.subscribe((e) => events.push(e.type));
    store.getState().setDefinition("parcels", "zone = 'A'");
    store.getState().setSelection({ layerId: "parcels", oids: [1] });
    expect(events).toContain("filterChange");
    expect(events).toContain("countChange");
    expect(events).toContain("selectionChange");
  });

  it("supports query projection, ordering, and paging", async () => {
    const store = storeWithLayer("parcels");
    const ds = new FeatureLayerDataSource({ layerId: "parcels", store, rows: ROWS });
    const res = await ds.query({ outFields: ["zone", "pop"], orderBy: "pop DESC", page: { offset: 0, size: 2 } });
    expect(res.rows).toEqual([
      { zone: "C", pop: 400 },
      { zone: "B", pop: 300 },
    ]);
  });
});

describe("OutputDataSource", () => {
  it("reads a widget's published records and reacts to updates", () => {
    const outputs = new OutputRegistry();
    outputs.publish({ widgetId: "flt", records: ROWS.slice(0, 2) });
    const ds = new OutputDataSource({ widgetId: "flt", outputs });
    expect(ds.getFilteredView().rows).toHaveLength(2);
    let refreshed = false;
    ds.subscribe((e) => {
      if (e.type === "refresh") refreshed = true;
    });
    outputs.publish({ widgetId: "flt", records: ROWS });
    expect(refreshed).toBe(true);
    expect(ds.getFilteredView().rows).toHaveLength(4);
  });

  it("normalizes a FeatureCollection to rows", () => {
    const fc = { type: "FeatureCollection", features: [{ properties: { a: 1 } }, { properties: { a: 2 } }] };
    expect(recordsToRows(fc)).toEqual([{ a: 1 }, { a: 2 }]);
  });
});

describe("StatisticsDataSource", () => {
  it("holds the aggregate of a base source and recomputes on filter change", async () => {
    const store = storeWithLayer("parcels");
    const base = new FeatureLayerDataSource({ layerId: "parcels", store, rows: ROWS });
    const stats = new StatisticsDataSource({ source: base, defs: [{ field: "pop", op: "sum", groupBy: "zone", alias: "total" }] });
    await Promise.resolve();
    expect(stats.getFilteredView().rows.length).toBe(3);
    store.getState().setDefinition("parcels", "zone = 'A'");
    await Promise.resolve();
    await Promise.resolve();
    expect(stats.getFilteredView().rows.length).toBe(1);
  });
});

describe("GeometryDataSource", () => {
  it("holds a geometry and emits on change", () => {
    const ds = new GeometryDataSource();
    let refreshed = false;
    ds.subscribe((e) => (refreshed = e.type === "refresh"));
    const geom = { type: "Polygon", coordinates: [] };
    ds.setGeometry(geom);
    expect(ds.getGeometry()).toBe(geom);
    expect(refreshed).toBe(true);
  });
});

describe("WebMapDataSource", () => {
  it("lists layers and delegates to a chosen layer source", () => {
    const store = createStrataStore();
    store.getState().addLayer(layer("a"));
    store.getState().addLayer(layer("b"));
    const wm = new WebMapDataSource({
      layersJson: {
        version: "1.0",
        spatialReference: { wkid: 4326 },
        initialState: { viewpoint: { targetGeometry: { xmin: -180, ymin: -90, xmax: 180, ymax: 90, spatialReference: { wkid: 4326 } } } },
        baseMap: { title: "b", baseMapLayers: [] },
        operationalLayers: [layer("a"), layer("b")],
      },
      store,
    });
    expect(wm.layerIds()).toEqual(["a", "b"]);
    expect(wm.layer("a")).toBeInstanceOf(FeatureLayerDataSource);
  });
});

describe("DataSourceManager", () => {
  it("auto-wraps a layer and is idempotent", () => {
    const store = storeWithLayer("parcels");
    const mgr = new DataSourceManager();
    const a = mgr.fromLayer(layer("parcels"), store);
    const b = mgr.fromLayer(layer("parcels"), store);
    expect(a).toBe(b);
    expect(mgr.get("parcels")).toBe(a);
  });

  it("resolves binding precedence sourceId > layerId > fromWidget", () => {
    const store = storeWithLayer("parcels");
    const outputs = new OutputRegistry();
    outputs.publish({ widgetId: "flt", records: ROWS });
    const mgr = new DataSourceManager();
    const custom = mgr.register(new FeatureLayerDataSource({ id: "custom", layerId: "parcels", store }));
    const layers = [layer("parcels")];

    expect(mgr.resolve({ sourceId: "custom" }, { store, outputs, layers })).toBe(custom);
    expect(mgr.resolve({ layerId: "parcels" }, { store, outputs, layers })?.kind).toBe("feature-layer");
    expect(mgr.resolve({ fromWidget: "flt" }, { store, outputs, layers })?.kind).toBe("output");
    expect(mgr.resolve(undefined, { store })).toBeUndefined();
  });
});
