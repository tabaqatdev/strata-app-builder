import { describe, it, expect } from "vitest";
import { assertEsriBackend, supportsArcGISAuth, createArcGISAuth } from "../src/index.js";

describe("assertEsriBackend", () => {
  it("passes for ESRI Enterprise / Online backends", () => {
    expect(() => assertEsriBackend("esri-enterprise")).not.toThrow();
    expect(() => assertEsriBackend("esri-online")).not.toThrow();
  });

  it("throws for a Strata backend (no portal-grade auth yet)", () => {
    expect(() => assertEsriBackend("strata")).toThrow(/Strata/);
  });
});

describe("supportsArcGISAuth", () => {
  it("is true only for ESRI backends", () => {
    expect(supportsArcGISAuth("esri-enterprise")).toBe(true);
    expect(supportsArcGISAuth("esri-online")).toBe(true);
    expect(supportsArcGISAuth("strata")).toBe(false);
  });
});

describe("createArcGISAuth", () => {
  it("rejects a Strata backend before doing anything else", async () => {
    await expect(createArcGISAuth({ backend: "strata", apiKey: "k" })).rejects.toThrow(
      /ESRI Enterprise\/Online backends only/,
    );
  });

  it("throws a helpful error when the optional peer dep is absent", async () => {
    await expect(createArcGISAuth({ backend: "esri-online", apiKey: "k" })).rejects.toThrow(
      /arcgis-rest-request/,
    );
  });
});
