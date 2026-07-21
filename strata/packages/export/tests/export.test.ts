import { describe, it, expect } from "vitest";
import { exportSpec, exportLayerData } from "../src/index.js";
import type { LayersJson } from "@strata/schema";

const cfg: LayersJson = {
  version: "1.0",
  spatialReference: { wkid: 4326 },
  initialState: {
    viewpoint: {
      targetGeometry: { xmin: -1, ymin: -1, xmax: 1, ymax: 1, spatialReference: { wkid: 4326 } },
    },
  },
  baseMap: { title: "Streets", baseMapLayers: [] },
  operationalLayers: [],
};

async function blobText(b: Blob): Promise<string> {
  // Node Blob exposes .text()
  return await b.text();
}

describe("exportSpec", () => {
  it("round-trips a LayersJson document", () => {
    const s = exportSpec(cfg);
    expect(JSON.parse(s)).toEqual(cfg);
  });
  it("pretty-prints (indented) JSON", () => {
    expect(exportSpec(cfg)).toContain("\n  ");
  });
});

describe("exportLayerData — geojson", () => {
  it("wraps an explicit features array into a FeatureCollection blob", async () => {
    const data = [
      { type: "Feature", properties: { a: 1 }, geometry: { type: "Point", coordinates: [1, 2] } },
    ];
    const blob = await exportLayerData("lyr", { format: "geojson", data });
    expect(blob.type).toBe("application/geo+json");
    const parsed = JSON.parse(await blobText(blob));
    expect(parsed.type).toBe("FeatureCollection");
    expect(parsed.features).toHaveLength(1);
  });

  it("accepts an explicit FeatureCollection", async () => {
    const fcData = {
      type: "FeatureCollection",
      features: [{ type: "Feature", properties: {}, geometry: null }],
    };
    const blob = await exportLayerData("lyr", { format: "geojson", data: fcData });
    expect(JSON.parse(await blobText(blob)).features).toHaveLength(1);
  });
});

describe("exportLayerData — csv", () => {
  it("emits a header union of all property keys", async () => {
    const data = [
      { type: "Feature", properties: { a: 1, b: 2 }, geometry: null },
      { type: "Feature", properties: { a: 3, c: 4 }, geometry: null },
    ];
    const csv = await blobText(await exportLayerData("lyr", { format: "csv", data }));
    const header = csv.split("\r\n")[0];
    expect(header).toBe("a,b,c");
  });

  it("quotes cells containing commas/quotes/newlines", async () => {
    const data = [{ type: "Feature", properties: { name: 'a,b "c"' }, geometry: null }];
    const csv = await blobText(await exportLayerData("lyr", { format: "csv", data }));
    expect(csv.split("\r\n")[1]).toBe('"a,b ""c"""');
  });

  it("appends longitude/latitude columns for point geometry", async () => {
    const data = [
      { type: "Feature", properties: { name: "P" }, geometry: { type: "Point", coordinates: [10, 20] } },
    ];
    const csv = await blobText(await exportLayerData("lyr", { format: "csv", data }));
    const [header, row] = csv.split("\r\n");
    expect(header).toBe("name,longitude,latitude");
    expect(row).toBe("P,10,20");
  });
});

describe("exportLayerData — geoparquet", () => {
  it("rejects: server-side only", async () => {
    await expect(exportLayerData("lyr", { format: "geoparquet" })).rejects.toThrow(/geoparquet/i);
  });
});
