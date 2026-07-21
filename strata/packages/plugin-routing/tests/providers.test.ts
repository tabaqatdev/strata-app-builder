import { describe, it, expect, vi, afterEach } from "vitest";
import { haversineMeters, nearest, osrmProvider, esriRouteProvider } from "../src/providers.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("haversineMeters", () => {
  it("is zero for identical points", () => {
    expect(haversineMeters([10, 20], [10, 20])).toBe(0);
  });

  it("≈111 km for one degree of latitude", () => {
    const d = haversineMeters([0, 0], [0, 1]);
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it("is symmetric", () => {
    const a = haversineMeters([0, 0], [3, 4]);
    const b = haversineMeters([3, 4], [0, 0]);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe("nearest", () => {
  it("returns null for an empty candidate list", () => {
    expect(nearest([0, 0], [])).toBeNull();
  });

  it("picks the closest candidate", () => {
    const res = nearest([0, 0], [
      { id: "far", lng: 10, lat: 0 },
      { id: "close", lng: 0.5, lat: 0 },
      { id: "mid", lng: 3, lat: 0 },
    ]);
    expect(res?.id).toBe("close");
    expect(res?.distanceMeters).toBeGreaterThan(0);
  });
});

describe("osrmProvider", () => {
  it("requires at least two waypoints", async () => {
    await expect(osrmProvider().route([[0, 0]])).rejects.toThrow(/two waypoints/);
  });

  it("parses a successful OSRM response", async () => {
    const geometry = { type: "LineString", coordinates: [[0, 0], [1, 1]] };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ code: "Ok", routes: [{ geometry, distance: 1234, duration: 60 }] }),
      })),
    );
    const res = await osrmProvider().route([[0, 0], [1, 1]]);
    expect(res.geometry).toEqual(geometry);
    expect(res.distanceMeters).toBe(1234);
    expect(res.durationSeconds).toBe(60);
  });

  it("throws when OSRM reports no route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ code: "NoRoute", routes: [] }),
      })),
    );
    await expect(osrmProvider().route([[0, 0], [1, 1]])).rejects.toThrow(/no route/);
  });

  it("throws on an HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500, statusText: "Server Error", json: async () => ({}) })),
    );
    await expect(osrmProvider().route([[0, 0], [1, 1]])).rejects.toThrow(/HTTP 500/);
  });

  it("builds the coordinate path in lng,lat order", async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ code: "Ok", routes: [{ geometry: { type: "LineString", coordinates: [] }, distance: 0, duration: 0 }] }),
    }));
    vi.stubGlobal("fetch", fetchSpy);
    await osrmProvider().route([[46.7, 24.6], [39.8, 21.4]]);
    expect(String(fetchSpy.mock.calls[0][0])).toContain("46.7,24.6;39.8,21.4");
  });
});

describe("esriRouteProvider", () => {
  it("requires at least two waypoints", async () => {
    await expect(esriRouteProvider({ token: "k" }).route([[0, 0]])).rejects.toThrow(/two waypoints/);
  });

  it("throws a helpful error when the optional peer dep is absent", async () => {
    await expect(esriRouteProvider({ token: "k" }).route([[0, 0], [1, 1]])).rejects.toThrow(
      /arcgis-rest-routing/,
    );
  });
});

describe("fetchIsochrone", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts a Valhalla request and returns the FeatureCollection", async () => {
    const { fetchIsochrone } = await import("../src/providers.js");
    let captured: any;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: any) => {
        captured = JSON.parse(init.body);
        return { ok: true, json: async () => ({ type: "FeatureCollection", features: [{ type: "Feature", geometry: { type: "Polygon", coordinates: [] }, properties: {} }] }) };
      }),
    );
    const fc = await fetchIsochrone([10, 20], [5, 10], { endpoint: "http://valhalla/isochrone", profile: "pedestrian" });
    expect(fc.type).toBe("FeatureCollection");
    expect(captured.locations).toEqual([{ lat: 20, lon: 10 }]);
    expect(captured.costing).toBe("pedestrian");
    expect(captured.contours).toEqual([{ time: 5 }, { time: 10 }]);
  });

  it("posts an ORS request with range in seconds + Authorization header", async () => {
    const { fetchIsochrone } = await import("../src/providers.js");
    let capturedInit: any;
    let capturedUrl = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: any) => {
        capturedUrl = url;
        capturedInit = init;
        return { ok: true, json: async () => ({ type: "FeatureCollection", features: [] }) };
      }),
    );
    await fetchIsochrone([1, 2], [10], { endpoint: "https://ors/iso", format: "ors", apiKey: "KEY", profile: "auto" });
    expect(capturedUrl).toBe("https://ors/iso/driving-car");
    expect(capturedInit.headers.Authorization).toBe("KEY");
    expect(JSON.parse(capturedInit.body).range).toEqual([600]);
  });

  it("throws on a non-ok response", async () => {
    const { fetchIsochrone } = await import("../src/providers.js");
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 502, statusText: "Bad Gateway" })));
    await expect(fetchIsochrone([0, 0], [5], { endpoint: "http://x" })).rejects.toThrow(/502/);
  });
});
