import { describe, it, expect, vi, afterEach } from "vitest";
import { nominatimProvider, esriGeocodeProvider } from "../src/providers.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(payload: unknown, ok = true, status = 200): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok,
      status,
      statusText: ok ? "OK" : "Error",
      json: async () => payload,
    })),
  );
}

describe("nominatimProvider", () => {
  it("returns [] for an empty query without calling fetch", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    const res = await nominatimProvider().search("   ");
    expect(res).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("maps rows to results and converts the bounding box order", async () => {
    // Nominatim boundingbox order: [south, north, west, east]
    mockFetch([
      { display_name: "Riyadh", lon: "46.72", lat: "24.63", boundingbox: ["24.0", "25.0", "46.0", "47.0"] },
    ]);
    const [r] = await nominatimProvider().search("Riyadh");
    expect(r.label).toBe("Riyadh");
    expect(r.lng).toBeCloseTo(46.72);
    expect(r.lat).toBeCloseTo(24.63);
    // → [minLng, minLat, maxLng, maxLat] = [west, south, east, north]
    expect(r.bbox).toEqual([46.0, 24.0, 47.0, 25.0]);
  });

  it("drops rows with non-finite coordinates", async () => {
    mockFetch([
      { display_name: "bad", lon: "x", lat: "y" },
      { display_name: "good", lon: "1", lat: "2" },
    ]);
    const res = await nominatimProvider().search("q");
    expect(res.map((r) => r.label)).toEqual(["good"]);
  });

  it("forwards the email param and limit in the request URL", async () => {
    const fetchSpy = vi.fn(async () => ({ ok: true, status: 200, statusText: "OK", json: async () => [] }));
    vi.stubGlobal("fetch", fetchSpy);
    await nominatimProvider({ email: "info@tabaqat.net" }).search("q", { limit: 3 });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain("email=info%40tabaqat.net");
    expect(url).toContain("limit=3");
    expect(url).toContain("q=q");
  });

  it("throws on an HTTP error", async () => {
    mockFetch(null, false, 503);
    await expect(nominatimProvider().search("q")).rejects.toThrow(/HTTP 503/);
  });
});

describe("esriGeocodeProvider", () => {
  it("returns [] for an empty query", async () => {
    const res = await esriGeocodeProvider({ token: "k" }).search("");
    expect(res).toEqual([]);
  });

  it("throws a helpful error when the optional peer dep is absent", async () => {
    await expect(esriGeocodeProvider({ token: "k" }).search("Riyadh")).rejects.toThrow(
      /arcgis-rest-geocoding/,
    );
  });
});
