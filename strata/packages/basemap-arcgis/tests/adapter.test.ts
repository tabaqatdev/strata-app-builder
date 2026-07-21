import { describe, it, expect, vi } from "vitest";
import {
  loadMaplibreArcgis,
  resolveArcgisService,
  loadArcgisBasemap,
  arcgisBasemapEntry,
  type MaplibreArcgisModule,
} from "../src/index.js";

const mockMod: MaplibreArcgisModule = {
  resolveService: async (idOrUrl, auth) => ({
    source: { type: "geojson", data: { type: "FeatureCollection", features: [] }, _id: idOrUrl, _token: auth.token },
    drawingInfo: { renderer: { type: "simple" } },
    popupInfo: { title: "{NAME}" },
  }),
  basemapStyle: (opts) => ({ type: "style", url: `arcgis://${opts.style}`, _token: opts.token }),
};

describe("resolveArcgisService", () => {
  it("returns the plugin-fetched source and passes drawingInfo/popupInfo through to the compiler", async () => {
    const svc = await resolveArcgisService("abc123", { token: "T", module: mockMod });
    expect(svc.source.type).toBe("geojson");
    expect(svc.source._id).toBe("abc123");
    expect(svc.drawingInfo).toEqual({ renderer: { type: "simple" } });
    expect(svc.popupInfo).toEqual({ title: "{NAME}" });
  });

  it("throws a clear error when the plugin version lacks service resolution", async () => {
    await expect(resolveArcgisService("x", { module: {} })).rejects.toThrow(/unavailable/);
  });
});

describe("loadArcgisBasemap", () => {
  it("resolves a basemap style descriptor via the plugin", async () => {
    const bm = await loadArcgisBasemap({ style: "arcgis/navigation", token: "T", module: mockMod });
    expect(bm.type).toBe("style");
    expect(bm.url).toBe("arcgis://arcgis/navigation");
  });
});

describe("loadMaplibreArcgis (lazy optional peer dep)", () => {
  it("returns the module via an injected loader", async () => {
    const loader = vi.fn(async () => mockMod);
    expect(await loadMaplibreArcgis(loader)).toBe(mockMod);
  });

  it("throws an actionable install error when the plugin is absent", async () => {
    await expect(
      loadMaplibreArcgis(async () => {
        throw new Error("Cannot find module");
      }),
    ).rejects.toThrow(/optional peer dependency '@esri\/maplibre-arcgis'/);
  });
});

describe("arcgisBasemapEntry", () => {
  it("builds a badged, keyed BasemapPanel entry", () => {
    expect(arcgisBasemapEntry("arcgis/streets", "Streets")).toEqual({
      id: "arcgis:arcgis/streets",
      title: "Streets",
      provider: "arcgis",
      style: "arcgis/streets",
    });
  });
});
