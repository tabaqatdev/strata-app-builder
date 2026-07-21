/**
 * arcgisSource — read-only ArcGIS REST (GeoServices) client producing GeoJSON FeatureCollections.
 *
 * Paged `f=geojson` with progressive delivery (onPage) and a same-origin proxy fallback for CORS.
 * Harvested (once) from the Strata GeoAI client and re-owned here; framework-agnostic.
 */

const PAGE_SIZE_CAP = 2000;
const FEATURE_CAP = 60000;
const PRECISION = 6; // ~10cm; halves payload

export interface DataClient {
  /** Same-origin proxy for CORS-restricted services, e.g. "/proxy/featureserver". */
  proxyUrl?: string;
  /** Token for secured services. */
  token?: string;
}

export interface LayerMeta {
  geometryType: string;
  oidField: string;
  maxRecordCount: number;
  supportsPagination: boolean;
  fields: Array<{ name: string; type: string; alias?: string }>;
  name: string;
  isTable: boolean;
  drawingInfo?: Record<string, unknown>;
}

type FC = { type: "FeatureCollection"; features: any[] };

/**
 * An ArcGIS REST endpoint answers rate-limits / invalid queries with HTTP 200 and an `{ "error": … }`
 * body (no `features`). Treating that as "0 features" silently overwrites good data with empty on the
 * next refresh, so surface it as a throw — callers (loadFeatures / scheduleRefresh) then keep the
 * previously loaded data instead of blanking the layer.
 */
function assertNotArcgisError(j: any): any {
  if (j && j.error) {
    const msg = j.error.message || j.error.code || "ArcGIS query error";
    throw new Error(`ArcGIS: ${msg}`);
  }
  return j;
}

async function fetchJson(url: string, client: DataClient): Promise<any> {
  try {
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) throw new Error(String(res.status));
    return assertNotArcgisError(await res.json());
  } catch (e) {
    if (client.proxyUrl) {
      const proxied = `${client.proxyUrl}?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxied, { credentials: "omit" });
      return assertNotArcgisError(await res.json());
    }
    throw e;
  }
}

function withParams(base: string, params: Record<string, string | number>, client: DataClient): string {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  if (client.token) u.searchParams.set("token", client.token);
  return u.toString();
}

/** Fetch layer metadata (`?f=json`). */
export async function fetchMeta(layerUrl: string, client: DataClient): Promise<LayerMeta> {
  const j = await fetchJson(withParams(layerUrl, { f: "json" }, client), client);
  return {
    geometryType: j.geometryType,
    oidField: j.objectIdField || "OBJECTID",
    maxRecordCount: j.maxRecordCount || 1000,
    supportsPagination: !!(j.advancedQueryCapabilities?.supportsPagination),
    fields: j.fields || [],
    name: j.name,
    isTable: j.type === "Table",
    drawingInfo: j.drawingInfo,
  };
}

/** Query the WGS84 extent of a layer. */
export async function queryExtent(
  layerUrl: string,
  client: DataClient,
  where = "1=1"
): Promise<[number, number, number, number] | null> {
  const j = await fetchJson(
    withParams(`${layerUrl}/query`, { where, returnExtentOnly: "true", outSR: 4326, f: "json" }, client),
    client
  );
  const e = j.extent;
  return e ? [e.xmin, e.ymin, e.xmax, e.ymax] : null;
}

export async function queryCount(layerUrl: string, client: DataClient, where = "1=1"): Promise<number> {
  const j = await fetchJson(
    withParams(`${layerUrl}/query`, { where, returnCountOnly: "true", f: "json" }, client),
    client
  );
  return j.count ?? 0;
}

export interface LoadOptions {
  where?: string;
  outFields?: string;
  cap?: number;
  onPage?: (fc: FC, done: boolean) => void;
}

/**
 * Page a FeatureServer layer as GeoJSON. Calls `onPage` with the accumulated collection as each page
 * lands (progressive rendering), and resolves with the full collection.
 */
export async function loadFeatures(
  layerUrl: string,
  client: DataClient,
  opts: LoadOptions = {}
): Promise<FC> {
  const { where = "1=1", outFields = "*", cap = FEATURE_CAP, onPage } = opts;
  const meta = await fetchMeta(layerUrl, client).catch(() => null);
  const pageSize = Math.min(meta?.maxRecordCount || 1000, PAGE_SIZE_CAP);
  const acc: FC = { type: "FeatureCollection", features: [] };

  async function fetchPage(offset: number): Promise<any[]> {
    const j = await fetchJson(
      withParams(
        `${layerUrl}/query`,
        {
          where,
          outFields,
          outSR: 4326,
          f: "geojson",
          resultOffset: offset,
          resultRecordCount: pageSize,
          geometryPrecision: PRECISION,
        },
        client
      ),
      client
    );
    return j.features || [];
  }

  let offset = 0;
  // Sequential exceededTransferLimit walk (robust; the GeoAI client parallelizes — a later optimization).
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const feats = await fetchPage(offset);
    acc.features.push(...feats);
    const done = feats.length < pageSize || acc.features.length >= cap;
    onPage?.(acc, done);
    if (done) break;
    offset += pageSize;
  }
  if (acc.features.length >= cap) {
    // eslint-disable-next-line no-console
    console.warn(`[strata] feature cap ${cap} reached for ${layerUrl}`);
  }
  return acc;
}
