/**
 * @strata/feature-arcgis — optional adapter over Esri's `@esri/arcgis-feature-service`.
 *
 * Advanced feature-service operations (statistics, related records, editing) beyond the lean read path in
 * `@strata/core-map`'s `arcgisSource`. Works against **BOTH** a Strata Serve FeatureServer and an ESRI
 * Enterprise/Online FeatureServer — it is pure ArcGIS REST wire.
 *
 * The Esri libraries are **optional peer dependencies**, loaded lazily, so the lean core builds and runs
 * without them; install them only in an app that uses this adapter:
 *   pnpm add @esri/arcgis-feature-service @esri/arcgis-rest-request
 *
 * Backend note: query & statistics work on Strata today. `applyEdits` needs a writable + authenticated
 * backend — that means ESRI today, or Strata once its editing + auth land. Auth for ESRI backends should be
 * created with `@strata/auth-arcgis` (ESRI-only); pass its result as `authentication`, or pass a `token`.
 */

/** Which backends the feature-service wire works against. */
export const worksAgainst = ["strata", "esri-enterprise", "esri-online"] as const;

export type StatisticType = "count" | "sum" | "avg" | "min" | "max" | "stddev" | "var";

export interface FeatureQueryOptions {
  /** A FeatureServer layer URL, e.g. `.../rest/services/{folder}/{service}/FeatureServer/{id}`. */
  url: string;
  where?: string;
  outFields?: string[];
  returnGeometry?: boolean;
  resultRecordCount?: number;
  resultOffset?: number;
  /** An ArcGIS auth manager (from `@strata/auth-arcgis`) or a raw token string. Esri backends only. */
  authentication?: unknown;
  token?: string;
}

export interface StatisticDefinition {
  statisticType: StatisticType;
  onStatisticField: string;
  outStatisticFieldName: string;
}

export interface StatisticsQueryOptions {
  url: string;
  where?: string;
  groupByFieldsForStatistics?: string[];
  outStatistics: StatisticDefinition[];
  authentication?: unknown;
  token?: string;
}

export interface RelatedRecordsOptions {
  url: string;
  objectIds: number[];
  relationshipId: number;
  outFields?: string[];
  authentication?: unknown;
  token?: string;
}

export interface EditOptions {
  url: string;
  adds?: unknown[];
  updates?: unknown[];
  deletes?: number[];
  authentication?: unknown;
  token?: string;
}

/** One attachment attached to a feature, resolved to a fetchable URL. */
export interface FeatureAttachment {
  id: number;
  name: string;
  contentType: string;
  size?: number;
  /** `${layerUrl}/${objectId}/attachments/${id}` — append a token yourself if the layer is secured. */
  url: string;
}

/** The `attachmentInfos[]` entries returned by the REST `.../{oid}/attachments` endpoint. */
interface AttachmentInfo {
  id: number;
  name?: string;
  contentType?: string;
  size?: number;
}

// Import via a variable specifier so TypeScript does not statically resolve the optional peer dep
// (it stays a runtime-only, lazily-loaded module — the lean core builds without it installed).
const ESRI_FEATURE_SERVICE = "@esri/arcgis-feature-service";
const ESRI_REST_REQUEST = "@esri/arcgis-rest-request";

async function loadFeatureService(): Promise<any> {
  try {
    return await import(/* @vite-ignore */ ESRI_FEATURE_SERVICE);
  } catch {
    throw new Error(
      "@strata/feature-arcgis requires the optional peer dependency '@esri/arcgis-feature-service'. " +
        "Install it: pnpm add @esri/arcgis-feature-service @esri/arcgis-rest-request"
    );
  }
}

/** Resolve an auth manager from an explicit manager or a raw token (Esri backends). */
async function resolveAuth(authentication?: unknown, token?: string): Promise<unknown> {
  if (authentication) return authentication;
  if (!token) return undefined;
  try {
    const req: any = await import(/* @vite-ignore */ ESRI_REST_REQUEST);
    return req.ApiKeyManager.fromKey(token);
  } catch {
    return undefined; // token still forwarded by the Esri lib via params in most cases
  }
}

/** Query features (returns GeoJSON). Works on Strata and Esri. */
export async function queryFeatures(opts: FeatureQueryOptions): Promise<any> {
  const fs = await loadFeatureService();
  return fs.queryFeatures({
    url: opts.url,
    where: opts.where ?? "1=1",
    outFields: opts.outFields ?? ["*"],
    returnGeometry: opts.returnGeometry ?? true,
    resultRecordCount: opts.resultRecordCount,
    resultOffset: opts.resultOffset,
    f: "geojson",
    authentication: await resolveAuth(opts.authentication, opts.token),
  });
}

/** Server-side statistics / group-by (outStatistics). Works on Strata and Esri. */
export async function queryStatistics(opts: StatisticsQueryOptions): Promise<any> {
  const fs = await loadFeatureService();
  return fs.queryFeatures({
    url: opts.url,
    where: opts.where ?? "1=1",
    groupByFieldsForStatistics: opts.groupByFieldsForStatistics,
    outStatistics: opts.outStatistics,
    returnGeometry: false,
    authentication: await resolveAuth(opts.authentication, opts.token),
  });
}

/** Related records for a set of object ids. */
export async function queryRelatedRecords(opts: RelatedRecordsOptions): Promise<any> {
  const fs = await loadFeatureService();
  return fs.queryRelated({
    url: opts.url,
    objectIds: opts.objectIds,
    relationshipId: opts.relationshipId,
    outFields: opts.outFields ?? ["*"],
    authentication: await resolveAuth(opts.authentication, opts.token),
  });
}

/**
 * Add / update / delete features. Requires a writable + authenticated backend:
 * ESRI today, or Strata once its editing + auth land (Strata Serve is read-only in this release).
 */
export async function applyEdits(opts: EditOptions): Promise<any> {
  const fs = await loadFeatureService();
  return fs.applyEdits({
    url: opts.url,
    adds: opts.adds,
    updates: opts.updates,
    deletes: opts.deletes,
    authentication: await resolveAuth(opts.authentication, opts.token),
  });
}

/**
 * List a feature's attachments. A dependency-light `fetch` of the REST attachments endpoint
 * (`.../{objectId}/attachments?f=json`) — works on both a Strata Serve and an ESRI FeatureServer,
 * with no Esri peer dep required. Each returned `url` points at the raw attachment bytes; when
 * `token` is given it is appended to every attachment `url` too, so a secured layer's blobs load.
 */
export async function queryAttachments(
  layerUrl: string,
  objectId: number,
  opts?: { token?: string },
): Promise<FeatureAttachment[]> {
  const token = opts?.token;
  const base = `${layerUrl}/${objectId}/attachments`;
  const listUrl = token
    ? `${base}?f=json&token=${encodeURIComponent(token)}`
    : `${base}?f=json`;
  const res = await fetch(listUrl);
  if (!res.ok) {
    throw new Error(`queryAttachments: ${res.status} ${res.statusText} for ${base}`);
  }
  const body = (await res.json()) as { attachmentInfos?: AttachmentInfo[]; error?: unknown };
  if (body.error) {
    throw new Error(`queryAttachments: server error for ${base}: ${JSON.stringify(body.error)}`);
  }
  const infos = body.attachmentInfos ?? [];
  const tokenSuffix = token ? `?token=${encodeURIComponent(token)}` : "";
  return infos.map((a): FeatureAttachment => ({
    id: a.id,
    name: a.name ?? String(a.id),
    contentType: a.contentType ?? "application/octet-stream",
    size: a.size,
    url: `${base}/${a.id}${tokenSuffix}`,
  }));
}
