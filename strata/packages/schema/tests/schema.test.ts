import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import layersSchema from "../src/layers.schema.json";
import catalogSchema from "../src/catalog.schema.json";

const ajv = new Ajv({ allErrors: true, strict: false });
const validateLayers = ajv.compile(layersSchema as object);
const validateCatalog = ajv.compile(catalogSchema as object);

function readJson(relToTest: string): unknown {
  return JSON.parse(readFileSync(fileURLToPath(new URL(relToTest, import.meta.url)), "utf8"));
}

const minimalLayers = {
  version: "1.0",
  spatialReference: { wkid: 4326 },
  initialState: {
    viewpoint: {
      targetGeometry: { xmin: -1, ymin: -1, xmax: 1, ymax: 1, spatialReference: { wkid: 4326 } },
    },
  },
  baseMap: { title: "Streets", baseMapLayers: [] },
  operationalLayers: [
    { id: "a", title: "A", layerType: "GeoJSON", source: { kind: "geojson", url: "./a.geojson" } },
  ],
};

describe("layers.schema.json", () => {
  it("is a compilable JSON Schema", () => {
    expect(typeof validateLayers).toBe("function");
  });

  it("accepts a minimal valid document", () => {
    expect(validateLayers(minimalLayers)).toBe(true);
  });

  it("accepts a full real-world layers.json fixture", () => {
    const fixture = readJson("./fixtures/quickstart-layers.json");
    const ok = validateLayers(fixture);
    if (!ok) console.error(validateLayers.errors);
    expect(ok).toBe(true);
  });

  it("rejects a document missing a required top-level key", () => {
    const { baseMap, ...noBasemap } = minimalLayers;
    expect(validateLayers(noBasemap)).toBe(false);
  });

  it("rejects an operational layer with an unknown layerType", () => {
    const bad = {
      ...minimalLayers,
      operationalLayers: [{ id: "x", title: "X", layerType: "NopeLayer", source: { kind: "geojson" } }],
    };
    expect(validateLayers(bad)).toBe(false);
  });

  it("rejects an extent that is missing a spatialReference", () => {
    const bad = JSON.parse(JSON.stringify(minimalLayers));
    delete bad.initialState.viewpoint.targetGeometry.spatialReference;
    expect(validateLayers(bad)).toBe(false);
  });
});

describe("catalog.schema.json", () => {
  it("accepts a minimal valid catalog record", () => {
    const rec = {
      id: "roads",
      title: "Roads",
      description: "Road network",
      geometry: "polyline",
      source: { kind: "strata", dataset: "roads" },
    };
    const ok = validateCatalog(rec);
    if (!ok) console.error(validateCatalog.errors);
    expect(ok).toBe(true);
  });

  it("rejects a record missing required fields", () => {
    expect(validateCatalog({ id: "roads", title: "Roads" })).toBe(false);
  });

  it("rejects an invalid geometry enum value", () => {
    const bad = { id: "x", title: "X", description: "d", geometry: "raster", source: { kind: "strata" } };
    expect(validateCatalog(bad)).toBe(false);
  });
});
