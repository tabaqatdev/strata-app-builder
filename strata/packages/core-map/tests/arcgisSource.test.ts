import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { queryCount } from "../src/engine/arcgisSource.js";

/** #2 (auto CORS→proxy fallback) + #6 (token rides through the proxy) — locked in with a mocked fetch. */
describe("arcgisSource fetch: token + CORS→proxy fallback", () => {
  const realFetch = globalThis.fetch;
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => { globalThis.fetch = realFetch; });

  it("#6 includes the token in the request URL", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ count: 5 }) }) as any);
    globalThis.fetch = fetchMock as any;
    const n = await queryCount("https://x/FeatureServer/0", { token: "SECRET" });
    expect(n).toBe(5);
    expect(String(fetchMock.mock.calls[0][0])).toContain("token=SECRET");
  });

  it("#2 retries through the proxy when the direct request fails (CORS)", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch")) // direct (CORS) throws
      .mockResolvedValueOnce({ ok: true, json: async () => ({ count: 7 }) } as any); // proxied
    globalThis.fetch = fetchMock as any;
    const n = await queryCount("https://x/FeatureServer/0", { proxyUrl: "/proxy/featureserver", token: "T" });
    expect(n).toBe(7);
    const proxied = String(fetchMock.mock.calls[1][0]);
    expect(proxied).toContain("/proxy/featureserver?url=");
    // #6: the token (added to the direct URL) is carried inside the proxied url= param.
    expect(decodeURIComponent(proxied)).toContain("token=T");
  });
});
