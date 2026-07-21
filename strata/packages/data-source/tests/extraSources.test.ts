import { describe, it, expect, vi } from "vitest";
import {
  FileDataSource,
  RestDataSource,
  StreamDataSource,
  parseCsv,
  parseGeoJsonRows,
} from "../src/index.js";

describe("parsers", () => {
  it("parseCsv coerces numbers and honors quoted commas", () => {
    const rows = parseCsv('zone,pop\nA,100\n"B, west",200');
    expect(rows).toEqual([
      { zone: "A", pop: 100 },
      { zone: "B, west", pop: 200 },
    ]);
  });
  it("parseGeoJsonRows extracts feature properties", () => {
    expect(parseGeoJsonRows({ type: "FeatureCollection", features: [{ properties: { a: 1 } }] })).toEqual([{ a: 1 }]);
    expect(parseGeoJsonRows([{ a: 2 }])).toEqual([{ a: 2 }]);
  });
});

describe("FileDataSource", () => {
  it("seeds from CSV and supports query/statistics + load events", async () => {
    const ds = new FileDataSource({ csv: "zone,pop\nA,100\nB,200" });
    expect(ds.kind).toBe("file");
    expect((await ds.query({ where: "pop >= 150" })).rows).toEqual([{ zone: "B", pop: 200 }]);
    expect((await ds.getStatistics([{ field: "pop", op: "sum", alias: "t" }])).rows[0].t).toBe(300);

    const events: string[] = [];
    ds.subscribe((e) => events.push(e.type));
    ds.load([{ pop: 1 }]);
    expect(events).toContain("refresh");
    expect(events).toContain("countChange");
    expect(ds.getFilteredView().rows).toHaveLength(1);
  });
});

describe("RestDataSource", () => {
  it("fetches + parses via an injected fetch, and filters the result", async () => {
    const data = { type: "FeatureCollection", features: [{ properties: { id: 1 } }, { properties: { id: 2 } }] };
    const fetchFn = vi.fn(async () => ({ json: async () => data }));
    const ds = new RestDataSource({ url: "https://x/data.geojson", fetchFn });
    const res = await ds.query({ where: "id = 2" });
    expect(fetchFn).toHaveBeenCalledWith("https://x/data.geojson");
    expect(res.rows).toEqual([{ id: 2 }]);
  });
});

describe("StreamDataSource", () => {
  it("accepts pushed rows and emits events", () => {
    const ds = new StreamDataSource();
    const events: string[] = [];
    ds.subscribe((e) => events.push(e.type));
    ds.push([{ v: 1 }, { v: 2 }]);
    expect(ds.getFilteredView().rows).toHaveLength(2);
    expect(events).toContain("countChange");
  });

  it("polls on start (immediate tick) and stops cleanly", async () => {
    const poll = vi.fn(() => [{ v: 9 }]);
    const ds = new StreamDataSource({ poll, intervalMs: 10000 });
    ds.start();
    await Promise.resolve();
    await Promise.resolve();
    expect(ds.getFilteredView().rows).toEqual([{ v: 9 }]);
    ds.stop();
  });
});
