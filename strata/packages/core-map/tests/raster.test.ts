import { describe, it, expect, vi } from "vitest";
import type { OperationalLayer } from "@strata/schema";
import { buildImageServerTileUrl, imageServerSourceDef, cogSourceDef, registerCogProtocol, vectorTileSourceDef, pmtilesSourceDef, registerPmtilesProtocol } from "../src/engine/raster.js";

const { fetchMeta, loadFeatures } = vi.hoisted(() => ({
  fetchMeta: vi.fn(async () => null),
  loadFeatures: vi.fn(async () => {}),
}));
vi.mock("../src/engine/arcgisSource.js", () => ({ fetchMeta, loadFeatures }));
import { LayerRegistry } from "../src/engine/layers.js";

describe("ImageServer builders (#10)", () => {
  it("builds an exportImage tile template with the raw bbox token", () => {
    const url = buildImageServerTileUrl("https://x/ImageServer/");
    expect(url).toContain("/exportImage?");
    expect(url).toContain("bbox={bbox-epsg-3857}"); // NOT url-encoded
    expect(url).toContain("format=png32");
    expect(url).toContain("f=image");
  });

  it("includes a rendering rule and time when given", () => {
    const url = buildImageServerTileUrl("https://x/ImageServer", { renderingRule: { rasterFunction: "NDVI" }, time: [1000, 2000] });
    expect(url).toContain("renderingRule=");
    expect(decodeURIComponent(url)).toContain('"rasterFunction":"NDVI"');
    expect(url).toContain("time=1000%2C2000");
  });

  it("imageServerSourceDef / cogSourceDef produce raster sources", () => {
    expect(imageServerSourceDef("https://x/ImageServer")).toMatchObject({ type: "raster", tileSize: 256 });
    expect(cogSourceDef("https://x/dem.tif")).toMatchObject({ type: "raster", url: "cog://https://x/dem.tif" });
  });
});

describe("registerCogProtocol", () => {
  it("returns false when maplibregl lacks addProtocol", async () => {
    expect(await registerCogProtocol({})).toBe(false);
  });
});

describe("vector-tile / pmtiles builders (#1)", () => {
  it("vectorTileSourceDef uses `tiles` for a template URL and `url` for TileJSON", () => {
    expect(vectorTileSourceDef("https://x/{z}/{x}/{y}.pbf")).toMatchObject({ type: "vector", tiles: ["https://x/{z}/{x}/{y}.pbf"] });
    expect(vectorTileSourceDef("https://x/tiles.json")).toMatchObject({ type: "vector", url: "https://x/tiles.json" });
  });

  it("pmtilesSourceDef prefixes the pmtiles:// protocol (vector default, raster opt-in)", () => {
    expect(pmtilesSourceDef("https://x/a.pmtiles")).toMatchObject({ type: "vector", url: "pmtiles://https://x/a.pmtiles" });
    expect(pmtilesSourceDef("pmtiles://https://x/a.pmtiles", "raster")).toMatchObject({ type: "raster", url: "pmtiles://https://x/a.pmtiles", tileSize: 256 });
  });

  it("registerPmtilesProtocol returns false when maplibregl lacks addProtocol", async () => {
    expect(await registerPmtilesProtocol({})).toBe(false);
  });
});

function fakeMap() {
  const sources: Record<string, any> = {};
  const layers: Record<string, any> = {};
  return {
    _sources: sources,
    getSource: (id: string) => sources[id],
    getLayer: (id: string) => layers[id],
    addSource: (id: string, def: any) => (sources[id] = def),
    addLayer: (l: any) => (layers[l.id] = l),
    removeLayer: (id: string) => delete layers[id],
    removeSource: (id: string) => delete sources[id],
    setPaintProperty: () => {},
  };
}

describe("LayerRegistry — vector-tile layer (#1)", () => {
  it("adds a native vector source + geometry-filtered sub-layers with source-layer", async () => {
    const map = fakeMap();
    const reg = new LayerRegistry({ map, client: {} as any });
    const layer: OperationalLayer = {
      id: "vt",
      title: "Roads (MVT)",
      layerType: "GeoJSON",
      url: "https://x/{z}/{x}/{y}.pbf",
      source: { kind: "vector-tile", url: "https://x/{z}/{x}/{y}.pbf", sourceLayer: "roads" } as any,
    } as OperationalLayer;
    await reg.add(layer);
    expect(map._sources["lyr:vt"]).toMatchObject({ type: "vector" });
    expect(map.getLayer("lyr:vt:line")["source-layer"]).toBe("roads");
    expect(map.getLayer("lyr:vt:circle")).toBeTruthy();
  });
});

describe("LayerRegistry — imageserver layer", () => {
  it("adds an ESRI ImageServer as a raster source + layer", async () => {
    const map = fakeMap();
    const reg = new LayerRegistry({ map, client: {} as any });
    const layer: OperationalLayer = {
      id: "ndvi",
      title: "NDVI",
      layerType: "ArcGISImageServiceLayer",
      url: "https://x/ImageServer",
      source: { kind: "imageserver", url: "https://x/ImageServer", renderingRule: { rasterFunction: "NDVI" } } as any,
    } as OperationalLayer;
    await reg.add(layer);
    expect(map._sources["lyr:ndvi"]).toMatchObject({ type: "raster" });
    expect(map._sources["lyr:ndvi"].tiles[0]).toContain("renderingRule=");
    expect(map.getLayer("lyr:ndvi:raster")).toBeTruthy();
  });
});
