/**
 * Customer-data ingest — the pure half.
 *
 * A customer arrives with a spreadsheet, not a FeatureServer: a rent roll, a property schedule, an
 * acquisition shortlist, a development pipeline. This module turns that file into rows a widget can bind,
 * and it does three jobs the raw parsers do not:
 *
 * 1. **Guess the columns** (`inferMapping`) — which column is the identifier, the label, the coordinates,
 *    the address — so the first screen is already right more often than not, and wrong in a way the
 *    reader can see and correct.
 * 2. **Strip identity before anything else touches the rows** (`stripIdentityFields`) — owner names and
 *    natural-person contact columns are dropped by a deny-list, and the caller is told **by name** what
 *    was dropped so it can say so on screen. This is a category rule in the real-estate work
 *    (*"never owner identity in a public template… the recipe names the field it dropped"*) and it is
 *    cheaper to enforce here, once, than in every app.
 * 3. **Place the rows** (`rowsToFeatureCollection`, `geocodeRows`) — from coordinates when the file
 *    carries them, otherwise from an address through an **injected** geocoder, so this file needs no
 *    network and stays testable in Node.
 *
 * Everything here is synchronous and pure except `geocodeRows`, whose network call is a parameter. The
 * React surface (file picking, the mapping editor, progress) lives in `@strata/core-map`.
 */
import type { Row } from "./types.js";
import { parseCsv, parseGeoJsonRows } from "./extraSources.js";

// --- column mapping ----------------------------------------------------------------------------

/** Which of the customer's columns plays which role. Every field is one of *their* header strings. */
export interface ColumnMapping {
  /** Stable identifier for a row. Falls back to the row index when absent. */
  id?: string;
  /** What the reader sees in a list, a popup title or a table's first column. */
  label?: string;
  /** Latitude in decimal degrees (EPSG:4326 — everything in Strata is 4326). */
  lat?: string;
  /** Longitude in decimal degrees. */
  lon?: string;
  /** A street address, used only when `lat`/`lon` are absent or empty on a row. */
  address?: string;
}

/** Normalise a header for matching: lower-case, letters and digits only. */
function key(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Candidate header keys per role, **most specific first**. Order is the whole algorithm: `propertyid`
 * must beat `id`, and `latitude` must beat a bare `y`, or a file with both columns maps the wrong one.
 */
const ROLE_KEYS: Record<keyof ColumnMapping, string[]> = {
  lat: ["latitude", "lat", "latdd", "ycoord", "ycoordinate", "pointy", "y"],
  lon: ["longitude", "long", "lng", "lon", "londd", "xcoord", "xcoordinate", "pointx", "x"],
  address: [
    "propertyaddress",
    "siteaddress",
    "streetaddress",
    "fulladdress",
    "situsaddress",
    "situs",
    "address1",
    "address",
    "addr",
    "street",
    "location",
  ],
  id: [
    // `<thing>ref` is at least as common as `<thing>id` in a property schedule — "Asset Ref" is the
    // ordinary spelling in a UK or Gulf rent roll — and leaving it out made the widget report "not
    // mapped" on a column a reader can plainly see is the identifier.
    "propertyid",
    "assetid",
    "buildingid",
    "parcelid",
    "leaseid",
    "assetref",
    "propertyref",
    "buildingref",
    "siteref",
    "leaseref",
    "assetcode",
    "propertycode",
    "apn",
    "ain",
    "assetnumber",
    "assetno",
    "propertyno",
    "reference",
    "ref",
    "code",
    "id",
  ],
  label: [
    "propertyname",
    "buildingname",
    "assetname",
    "sitename",
    "schemename",
    "name",
    "label",
    "title",
    "property",
    "building",
    "asset",
    "description",
  ],
};

/**
 * Guess a mapping from the file's headers. Returns only the roles it is confident about — an absent role
 * is an honest "you tell me", not a bad guess, and the widget renders it as an unset dropdown.
 *
 * A header already dropped as identity must not be offered, so pass the **scrubbed** headers.
 */
export function inferMapping(headers: string[]): ColumnMapping {
  const byKey = new Map<string, string>();
  for (const h of headers) {
    const k = key(h);
    // First header wins for a given key, so a duplicate column cannot silently replace the first.
    if (!byKey.has(k)) byKey.set(k, h);
  }
  const out: ColumnMapping = {};
  const taken = new Set<string>();
  for (const role of ["lat", "lon", "address", "id", "label"] as (keyof ColumnMapping)[]) {
    for (const candidate of ROLE_KEYS[role]) {
      const header = byKey.get(candidate);
      if (header && !taken.has(header)) {
        out[role] = header;
        taken.add(header);
        break;
      }
    }
  }
  // A single column cannot be both the identifier and the label; prefer it as the label, which is the
  // one the reader actually sees, and let the row index carry identity.
  if (out.id && out.id === out.label) delete out.id;
  return out;
}

// --- identity scrubbing ------------------------------------------------------------------------

/**
 * Header keys dropped on sight. These are person-identifying in the property context: an owner, a
 * lessor, a taxpayer or a party to a transfer is very often a natural person, and a mailing address is
 * a home address. Matching is on the **normalised** key, by substring, so `Owner Name`, `OWNER_NAME`
 * and `ownernme` all fall to `owner`.
 *
 * `tenant` is deliberately **not** here — a tenant *category* is legitimate retail analysis — so the
 * name-bearing variants are listed explicitly instead.
 */
const IDENTITY_KEYS: string[] = [
  "owner",
  "lessor",
  "lessee",
  "taxpayer",
  "grantor",
  "grantee",
  "occupantname",
  "residentname",
  "tenantname",
  "landlordname",
  "contactname",
  "firstname",
  "lastname",
  "middlename",
  "surname",
  "fullname",
  "personname",
  "mailingaddress",
  "mailaddress",
  "mailaddr",
  "careof",
  "email",
  "phone",
  "mobile",
  "telephone",
  "ssn",
  "nationalid",
  "dateofbirth",
  "dob",
];

/** What a scrub removed, so the app can print it. */
export interface IdentityScrubResult {
  /** The rows with every matched column removed. */
  rows: Row[];
  /** The customer's own header strings that were dropped, in the order they appeared. */
  dropped: string[];
}

export interface StripIdentityOptions {
  /**
   * Headers to keep even though they match the deny-list. This is the explicit allow-list the category
   * rule requires: keeping one is a deliberate, named act, never a default.
   */
  allow?: string[];
  /** Extra header keys to drop, on top of the built-in list. Normalised and substring-matched. */
  deny?: string[];
}

/** True when a header looks person-identifying. Exported so a widget can flag before it drops. */
export function isIdentityField(header: string, extraDeny: string[] = []): boolean {
  const k = key(header);
  const list = [...IDENTITY_KEYS, ...extraDeny.map(key)];
  return list.some((needle) => k.includes(needle));
}

/**
 * Remove person-identifying columns from every row. **Run this before anything else sees the rows** —
 * before inferring a mapping, before geocoding, before publishing. The dropped names come back so the
 * caller can say *which* field it dropped rather than claiming a general policy.
 */
export function stripIdentityFields(rows: Row[], opts: StripIdentityOptions = {}): IdentityScrubResult {
  if (rows.length === 0) return { rows: [], dropped: [] };
  const allow = new Set((opts.allow ?? []).map(key));
  const headers = Object.keys(rows[0]);
  const dropped = headers.filter((h) => !allow.has(key(h)) && isIdentityField(h, opts.deny ?? []));
  if (dropped.length === 0) return { rows, dropped: [] };
  const drop = new Set(dropped);
  const cleaned = rows.map((r) => {
    const out: Row = {};
    for (const [k, v] of Object.entries(r)) if (!drop.has(k)) out[k] = v;
    return out;
  });
  return { rows: cleaned, dropped };
}

// --- reading a file ----------------------------------------------------------------------------

/** What `readIngestFile` understood the file to be. */
export type IngestFormat = "csv" | "geojson" | "json";

export interface ReadIngestResult {
  rows: Row[];
  format: IngestFormat;
  /** Headers of the first row, in file order. Empty when the file produced no rows. */
  headers: string[];
}

/**
 * Parse file **text** into rows. The format follows the filename when one is given and the content
 * otherwise, so a `.txt` holding GeoJSON still reads correctly. Throws on malformed JSON, because a
 * silent empty table is the worse failure — the widget catches and shows the message.
 */
export function readIngestFile(text: string, filename?: string): ReadIngestResult {
  const looksJson = text.trimStart().startsWith("{") || text.trimStart().startsWith("[");
  const ext = (filename ?? "").toLowerCase().split(".").pop() ?? "";
  const isJson = ext === "geojson" || ext === "json" || (ext !== "csv" && looksJson);

  let rows: Row[];
  let format: IngestFormat;
  if (isJson) {
    const json: unknown = JSON.parse(text);
    rows = parseGeoJsonRows(json);
    format =
      json && typeof json === "object" && (json as { type?: string }).type === "FeatureCollection"
        ? "geojson"
        : "json";
    // A FeatureCollection carries its geometry outside `properties`; lift point coordinates in so a
    // file that is already placed does not ask the reader for an address column.
    if (format === "geojson") rows = liftPointGeometry(json, rows);
  } else {
    rows = parseCsv(text);
    format = "csv";
  }
  return { rows, format, headers: rows[0] ? Object.keys(rows[0]) : [] };
}

/** Copy a FeatureCollection's point coordinates onto each row as `longitude`/`latitude`. */
function liftPointGeometry(json: unknown, rows: Row[]): Row[] {
  const feats = (json as { features?: Array<{ geometry?: { type?: string; coordinates?: unknown } }> }).features ?? [];
  return rows.map((r, i) => {
    const g = feats[i]?.geometry;
    if (!g || g.type !== "Point" || !Array.isArray(g.coordinates)) return r;
    const [lon, lat] = g.coordinates as number[];
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return r;
    // Never overwrite a column the file already has.
    return { longitude: r.longitude ?? lon, latitude: r.latitude ?? lat, ...r };
  });
}

// --- placing the rows --------------------------------------------------------------------------

/** A coordinate read off one row, or null when the row carries none. */
export function coordsOf(row: Row, mapping: ColumnMapping): { lon: number; lat: number } | null {
  if (!mapping.lat || !mapping.lon) return null;
  const rawLat = row[mapping.lat];
  const rawLon = row[mapping.lon];
  // `Number("")` is 0, so an empty cell would place the asset at null island. Reject blanks first.
  if (rawLat == null || rawLon == null) return null;
  if (String(rawLat).trim() === "" || String(rawLon).trim() === "") return null;
  const lat = Number(rawLat);
  const lon = Number(rawLon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  // Out-of-range coordinates are a mapping mistake (a swapped pair, or a projected file), not data.
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lon, lat };
}

export interface IngestSummary {
  total: number;
  /** Rows that already carry a usable coordinate pair. */
  placed: number;
  /** Rows with no coordinate but an address to geocode. */
  geocodable: number;
  /** Rows that can never be placed with the current mapping. */
  unplaceable: number;
}

/** Count what the current mapping can and cannot place. This is what the widget prints before loading. */
export function summarise(rows: Row[], mapping: ColumnMapping): IngestSummary {
  let placed = 0;
  let geocodable = 0;
  for (const r of rows) {
    if (coordsOf(r, mapping)) placed++;
    else if (mapping.address && String(r[mapping.address] ?? "").trim()) geocodable++;
  }
  return { total: rows.length, placed, geocodable, unplaceable: rows.length - placed - geocodable };
}

/** A GeoJSON point FeatureCollection. Kept structural so this package needs no GeoJSON dependency. */
export interface PointFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string | number;
    geometry: { type: "Point"; coordinates: [number, number] } | null;
    properties: Row;
  }>;
}

/**
 * Turn mapped rows into a point FeatureCollection. Rows with no coordinate are kept with a **null
 * geometry** rather than dropped: the reader uploaded them, they belong in the table, and silently
 * losing rows is how an estate register starts under-reporting.
 */
export function rowsToFeatureCollection(rows: Row[], mapping: ColumnMapping): PointFeatureCollection {
  return {
    type: "FeatureCollection",
    features: rows.map((row, i) => {
      const c = coordsOf(row, mapping);
      const id = mapping.id != null ? (row[mapping.id] as string | number | undefined) : undefined;
      return {
        type: "Feature" as const,
        id: id ?? i,
        geometry: c ? { type: "Point" as const, coordinates: [c.lon, c.lat] as [number, number] } : null,
        properties: row,
      };
    }),
  };
}

// --- geocoding ---------------------------------------------------------------------------------

/** An injected geocoder. Returns null when the address could not be resolved. */
export type GeocodeFn = (address: string) => Promise<{ lon: number; lat: number } | null>;

export interface GeocodeRowsOptions {
  /** Column names written back onto each located row. Defaults to `longitude` / `latitude`. */
  lonField?: string;
  latField?: string;
  /** Stop after this many lookups. Guards a 50,000-row file against a public geocoder. */
  limit?: number;
  /** Pause between lookups, in milliseconds. Public Nominatim asks for no more than one per second. */
  delayMs?: number;
  /** Injected sleep, so tests do not wait. */
  sleep?: (ms: number) => Promise<void>;
  /** Called after each attempt, for a progress bar. */
  onProgress?: (done: number, total: number) => void;
}

export interface GeocodeRowsResult {
  rows: Row[];
  /** Rows newly given a coordinate. */
  located: number;
  /** Rows attempted and not resolved. */
  failed: number;
  /** Rows not attempted because `limit` was reached. */
  skipped: number;
  /** The mapping to use afterwards — the caller's mapping, pointed at the written coordinate columns. */
  mapping: ColumnMapping;
}

const defaultSleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Geocode only the rows that need it, **one at a time**. Sequential by design: the keyless geocoders are
 * community infrastructure with a published rate policy, and a parallel burst from a browser is how an
 * app gets blocked. Rows that already carry coordinates are never sent anywhere.
 */
export async function geocodeRows(
  rows: Row[],
  mapping: ColumnMapping,
  geocode: GeocodeFn,
  opts: GeocodeRowsOptions = {},
): Promise<GeocodeRowsResult> {
  const lonField = opts.lonField ?? "longitude";
  const latField = opts.latField ?? "latitude";
  const sleep = opts.sleep ?? defaultSleep;
  const delayMs = opts.delayMs ?? 1000;
  const outMapping: ColumnMapping = { ...mapping, lon: mapping.lon ?? lonField, lat: mapping.lat ?? latField };

  if (!mapping.address) return { rows, located: 0, failed: 0, skipped: 0, mapping: outMapping };

  const pending: number[] = [];
  rows.forEach((r, i) => {
    if (!coordsOf(r, mapping) && String(r[mapping.address!] ?? "").trim()) pending.push(i);
  });

  const limit = opts.limit ?? pending.length;
  const out = rows.slice();
  let located = 0;
  let failed = 0;

  for (let n = 0; n < pending.length && n < limit; n++) {
    const i = pending[n];
    const address = String(out[i][mapping.address]).trim();
    try {
      const hit = await geocode(address);
      if (hit) {
        out[i] = { ...out[i], [lonField]: hit.lon, [latField]: hit.lat };
        located++;
      } else failed++;
    } catch {
      // A single failed lookup must not lose the whole file.
      failed++;
    }
    opts.onProgress?.(n + 1, Math.min(pending.length, limit));
    if (delayMs > 0 && n < Math.min(pending.length, limit) - 1) await sleep(delayMs);
  }

  return { rows: out, located, failed, skipped: Math.max(0, pending.length - limit), mapping: outMapping };
}
