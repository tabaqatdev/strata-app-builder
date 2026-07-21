import { describe, it, expect, vi, afterEach } from "vitest";
import { worksAgainst, queryAttachments, queryFeatures } from "../src/index.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("worksAgainst", () => {
  it("declares the supported backends", () => {
    expect([...worksAgainst]).toEqual(["strata", "esri-enterprise", "esri-online"]);
  });
});

describe("queryAttachments", () => {
  const layerUrl = "https://host/rest/services/f/S/FeatureServer/0";

  it("lists attachments and builds fetchable URLs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          attachmentInfos: [{ id: 3, name: "photo.jpg", contentType: "image/jpeg", size: 100 }],
        }),
      })),
    );
    const [a] = await queryAttachments(layerUrl, 42);
    expect(a).toEqual({
      id: 3,
      name: "photo.jpg",
      contentType: "image/jpeg",
      size: 100,
      url: `${layerUrl}/42/attachments/3`,
    });
  });

  it("appends the token to the list URL and each attachment URL", async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ attachmentInfos: [{ id: 1 }] }),
    }));
    vi.stubGlobal("fetch", fetchSpy);
    const [a] = await queryAttachments(layerUrl, 7, { token: "abc" });
    expect(String(fetchSpy.mock.calls[0][0])).toContain("token=abc");
    expect(a.url).toBe(`${layerUrl}/7/attachments/1?token=abc`);
    // defaults filled in for a sparse attachmentInfo
    expect(a.name).toBe("1");
    expect(a.contentType).toBe("application/octet-stream");
  });

  it("throws on an HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 404, statusText: "Not Found", json: async () => ({}) })),
    );
    await expect(queryAttachments(layerUrl, 1)).rejects.toThrow(/404/);
  });

  it("throws when the server body carries an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ error: { code: 400, message: "bad" } }),
      })),
    );
    await expect(queryAttachments(layerUrl, 1)).rejects.toThrow(/server error/);
  });
});

describe("queryFeatures", () => {
  it("throws a helpful error when the optional Esri peer dep is absent", async () => {
    await expect(queryFeatures({ url: "https://host/FeatureServer/0" })).rejects.toThrow(
      /arcgis-feature-service/,
    );
  });
});
