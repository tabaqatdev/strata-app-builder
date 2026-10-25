import { describe, it, expect, vi } from "vitest";
import {
  readIngestFile,
  inferMapping,
  stripIdentityFields,
  isIdentityField,
  coordsOf,
  summarise,
  rowsToFeatureCollection,
  geocodeRows,
  type ColumnMapping,
  type Row,
} from "../src/index.js";

const noSleep = (): Promise<void> => Promise.resolve();

describe("readIngestFile", () => {
  it("reads CSV into rows and headers", () => {
    const r = readIngestFile("Asset ID,Property Name,Latitude,Longitude\nA1,Tower,34.05,-118.24", "estate.csv");
    expect(r.format).toBe("csv");
    expect(r.headers).toEqual(["Asset ID", "Property Name", "Latitude", "Longitude"]);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0]["Latitude"]).toBe(34.05);
  });

  it("reads a GeoJSON FeatureCollection and lifts point coordinates onto the row", () => {
    const fc = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", geometry: { type: "Point", coordinates: [-118.24, 34.05] }, properties: { name: "Tower" } },
      ],
    };
    const r = readIngestFile(JSON.stringify(fc), "estate.geojson");
    expect(r.format).toBe("geojson");
    expect(r.rows[0].longitude).toBe(-118.24);
    expect(r.rows[0].latitude).toBe(34.05);
    expect(r.rows[0].name).toBe("Tower");
  });

  it("does not overwrite a coordinate column the file already carries", () => {
    const fc = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", geometry: { type: "Point", coordinates: [-1, 1] }, properties: { latitude: 99, name: "X" } },
      ],
    };
    expect(readIngestFile(JSON.stringify(fc), "a.geojson").rows[0].latitude).toBe(99);
  });

  it("detects JSON from content when the extension does not say so", () => {
    expect(readIngestFile('[{"a":1}]', "notes.txt").format).toBe("json");
  });

  it("throws on malformed JSON rather than returning an empty table", () => {
    expect(() => readIngestFile("{ not json", "a.geojson")).toThrow();
  });
});

describe("inferMapping", () => {
  it("prefers the specific header over the generic one", () => {
    const m = inferMapping(["id", "Property ID", "Latitude", "y", "Longitude", "x"]);
    expect(m.id).toBe("Property ID");
    expect(m.lat).toBe("Latitude");
    expect(m.lon).toBe("Longitude");
  });

  it("matches through punctuation and case", () => {
    const m = inferMapping(["ASSET_ID", "Property Name", "lat_dd", "lon_dd"]);
    expect(m.id).toBe("ASSET_ID");
    expect(m.label).toBe("Property Name");
    expect(m.lat).toBe("lat_dd");
    expect(m.lon).toBe("lon_dd");
  });

  it("finds an address when there are no coordinates", () => {
    const m = inferMapping(["Ref", "Site Address", "Sq Ft"]);
    expect(m.address).toBe("Site Address");
    expect(m.lat).toBeUndefined();
  });

  it("leaves a role unset rather than guessing", () => {
    expect(inferMapping(["alpha", "beta"])).toEqual({});
  });

  it("never assigns one column to two roles", () => {
    const m = inferMapping(["name"]);
    expect(m.label).toBe("name");
    expect(m.id).toBeUndefined();
  });

  it("keeps the first of two columns with the same normalised key", () => {
    expect(inferMapping(["Latitude", "latitude"]).lat).toBe("Latitude");
  });

  it("recognises a `<thing> Ref` identifier, which is the ordinary spelling in a rent roll", () => {
    expect(inferMapping(["Asset Ref", "Latitude", "Longitude"]).id).toBe("Asset Ref");
    expect(inferMapping(["Property Ref"]).id).toBe("Property Ref");
    expect(inferMapping(["Site Ref"]).id).toBe("Site Ref");
    expect(inferMapping(["Asset No"]).id).toBe("Asset No");
    expect(inferMapping(["Asset Code"]).id).toBe("Asset Code");
  });

  it("still prefers the more specific identifier when both spellings are present", () => {
    expect(inferMapping(["Ref", "Asset Ref"]).id).toBe("Asset Ref");
  });
});

describe("stripIdentityFields", () => {
  const rows: Row[] = [
    { "Owner Name": "A Person", "Lessor name": "Another", Asset: "Tower", "Mailing Address": "1 Home St", Rent: 100 },
  ];

  it("drops owner and lessor names and names what it dropped", () => {
    const r = stripIdentityFields(rows);
    expect(r.dropped).toEqual(["Owner Name", "Lessor name", "Mailing Address"]);
    expect(Object.keys(r.rows[0])).toEqual(["Asset", "Rent"]);
  });

  it("keeps a denied column only when explicitly allowed", () => {
    const r = stripIdentityFields(rows, { allow: ["Owner Name"] });
    expect(r.dropped).not.toContain("Owner Name");
    expect(r.rows[0]["Owner Name"]).toBe("A Person");
  });

  it("accepts an extra deny list", () => {
    const r = stripIdentityFields([{ Broker: "X", Rent: 1 }], { deny: ["broker"] });
    expect(r.dropped).toEqual(["Broker"]);
  });

  it("leaves a tenant category alone but drops a tenant name", () => {
    expect(isIdentityField("Tenant Category")).toBe(false);
    expect(isIdentityField("Tenant Name")).toBe(true);
  });

  it("returns the rows untouched when nothing matches", () => {
    const clean: Row[] = [{ Asset: "Tower" }];
    const r = stripIdentityFields(clean);
    expect(r.dropped).toEqual([]);
    expect(r.rows).toBe(clean);
  });

  it("handles an empty file", () => {
    expect(stripIdentityFields([])).toEqual({ rows: [], dropped: [] });
  });
});

describe("coordsOf", () => {
  const m: ColumnMapping = { lat: "Latitude", lon: "Longitude" };

  it("reads a coordinate pair", () => {
    expect(coordsOf({ Latitude: 34.05, Longitude: -118.24 }, m)).toEqual({ lat: 34.05, lon: -118.24 });
  });

  it("rejects an out-of-range pair rather than placing it wrongly", () => {
    expect(coordsOf({ Latitude: 6400000, Longitude: -13100000 }, m)).toBeNull();
  });

  it("rejects blanks and non-numbers", () => {
    expect(coordsOf({ Latitude: "", Longitude: "" }, m)).toBeNull();
    expect(coordsOf({ Latitude: "n/a", Longitude: "n/a" }, m)).toBeNull();
  });

  it("is null when the mapping has no coordinate role", () => {
    expect(coordsOf({ Latitude: 1, Longitude: 2 }, {})).toBeNull();
  });
});

describe("summarise", () => {
  it("counts placed, geocodable and unplaceable rows", () => {
    const rows: Row[] = [
      { lat: 34, lon: -118, addr: "" },
      { lat: "", lon: "", addr: "1 Main St" },
      { lat: "", lon: "", addr: "" },
    ];
    expect(summarise(rows, { lat: "lat", lon: "lon", address: "addr" })).toEqual({
      total: 3,
      placed: 1,
      geocodable: 1,
      unplaceable: 1,
    });
  });
});

describe("rowsToFeatureCollection", () => {
  const mapping: ColumnMapping = { lat: "lat", lon: "lon", id: "ref" };

  it("builds point features and uses the mapped id", () => {
    const fc = rowsToFeatureCollection([{ ref: "A1", lat: 34, lon: -118 }], mapping);
    expect(fc.features[0].id).toBe("A1");
    expect(fc.features[0].geometry).toEqual({ type: "Point", coordinates: [-118, 34] });
  });

  it("keeps an unplaced row with a null geometry rather than dropping it", () => {
    const fc = rowsToFeatureCollection([{ ref: "A1", lat: "", lon: "" }], mapping);
    expect(fc.features).toHaveLength(1);
    expect(fc.features[0].geometry).toBeNull();
  });

  it("falls back to the row index when no id column is mapped", () => {
    expect(rowsToFeatureCollection([{ lat: 1, lon: 2 }], { lat: "lat", lon: "lon" }).features[0].id).toBe(0);
  });
});

describe("geocodeRows", () => {
  const mapping: ColumnMapping = { address: "addr", lat: "lat", lon: "lon" };

  it("geocodes only the rows that need it", async () => {
    const geocode = vi.fn(async () => ({ lon: -118, lat: 34 }));
    const rows: Row[] = [
      { addr: "1 Main St", lat: 10, lon: 20 },
      { addr: "2 Main St", lat: "", lon: "" },
    ];
    const r = await geocodeRows(rows, mapping, geocode, { delayMs: 0, sleep: noSleep });
    expect(geocode).toHaveBeenCalledTimes(1);
    expect(geocode).toHaveBeenCalledWith("2 Main St");
    expect(r.located).toBe(1);
    expect(r.rows[0].lat).toBe(10);
    expect(r.rows[1].latitude).toBe(34);
  });

  it("counts a miss as failed and keeps the row", async () => {
    const r = await geocodeRows([{ addr: "nowhere" }], mapping, async () => null, { delayMs: 0, sleep: noSleep });
    expect(r.failed).toBe(1);
    expect(r.located).toBe(0);
    expect(r.rows).toHaveLength(1);
  });

  it("survives a thrown lookup without losing the file", async () => {
    const geocode = vi.fn().mockRejectedValue(new Error("HTTP 429"));
    const r = await geocodeRows([{ addr: "a" }, { addr: "b" }], mapping, geocode, { delayMs: 0, sleep: noSleep });
    expect(r.failed).toBe(2);
    expect(r.rows).toHaveLength(2);
  });

  it("stops at the limit and reports what it skipped", async () => {
    const geocode = vi.fn(async () => ({ lon: 1, lat: 2 }));
    const rows: Row[] = [{ addr: "a" }, { addr: "b" }, { addr: "c" }];
    const r = await geocodeRows(rows, mapping, geocode, { limit: 2, delayMs: 0, sleep: noSleep });
    expect(geocode).toHaveBeenCalledTimes(2);
    expect(r.skipped).toBe(1);
  });

  it("sleeps between lookups but not after the last one", async () => {
    const sleep = vi.fn(async () => {});
    await geocodeRows([{ addr: "a" }, { addr: "b" }], mapping, async () => ({ lon: 1, lat: 2 }), {
      delayMs: 1000,
      sleep,
    });
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(1000);
  });

  it("does nothing without an address column", async () => {
    const geocode = vi.fn();
    const r = await geocodeRows([{ a: 1 }], { lat: "lat", lon: "lon" }, geocode, { sleep: noSleep });
    expect(geocode).not.toHaveBeenCalled();
    expect(r.located).toBe(0);
  });

  it("reports progress once per attempt", async () => {
    const onProgress = vi.fn();
    await geocodeRows([{ addr: "a" }, { addr: "b" }], mapping, async () => ({ lon: 1, lat: 2 }), {
      delayMs: 0,
      sleep: noSleep,
      onProgress,
    });
    expect(onProgress).toHaveBeenNthCalledWith(1, 1, 2);
    expect(onProgress).toHaveBeenNthCalledWith(2, 2, 2);
  });

  it("returns a mapping pointed at the written coordinate columns", async () => {
    const r = await geocodeRows([{ addr: "a" }], { address: "addr" }, async () => ({ lon: 1, lat: 2 }), {
      delayMs: 0,
      sleep: noSleep,
    });
    expect(r.mapping.lon).toBe("longitude");
    expect(r.mapping.lat).toBe("latitude");
  });
});
