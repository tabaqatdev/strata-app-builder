/**
 * advancedQuery — the optional "advanced" data path for a map layer, over `@strata/feature-arcgis`.
 *
 * `arcgisSource` (this package) handles the lean read path (paged `f=geojson`). This module adds the
 * heavier feature-service operations — **statistics / group-by, related records, ad-hoc query, and edits** —
 * by delegating to `@strata/feature-arcgis`, which lazy-loads the Esri libs (optional peer deps). So the
 * base bundle stays Esri-free until these functions are actually called.
 *
 * Backend applicability: query/statistics/related work against **Strata and
 * Esri**; `layerApplyEdits` needs a writable + authenticated backend (Esri today, or Strata once its editing
 * + auth land). For Esri auth, build the manager with `@strata/auth-arcgis` (ESRI-only) and pass it as
 * `authentication`.
 */
import type { OperationalLayer } from "@strata/schema";
import {
  queryFeatures,
  queryStatistics,
  queryRelatedRecords,
  applyEdits,
  type StatisticDefinition,
  type FeatureQueryOptions,
} from "@strata/feature-arcgis";

export type { StatisticDefinition } from "@strata/feature-arcgis";

/** Resolve the FeatureServer URL for a layer (arcgis-feature / strata sources). */
function layerUrl(layer: OperationalLayer): string {
  const url = layer.url ?? layer.source?.url;
  if (!url) throw new Error(`advancedQuery: layer "${layer.id}" has no FeatureServer URL`);
  return url;
}

export interface AdvancedAuth {
  /** An ArcGIS auth manager from @strata/auth-arcgis (ESRI backends), or a raw token. */
  authentication?: unknown;
  token?: string;
}

/** Server-side statistics / group-by over a layer (Strata + Esri). */
export function layerStatistics(
  layer: OperationalLayer,
  outStatistics: StatisticDefinition[],
  opts: { where?: string; groupBy?: string[] } & AdvancedAuth = {}
): Promise<any> {
  return queryStatistics({
    url: layerUrl(layer),
    where: opts.where,
    groupByFieldsForStatistics: opts.groupBy,
    outStatistics,
    authentication: opts.authentication,
    token: opts.token,
  });
}

/** Related records for a set of object ids on a layer. */
export function layerRelatedRecords(
  layer: OperationalLayer,
  objectIds: number[],
  relationshipId: number,
  opts: { outFields?: string[] } & AdvancedAuth = {}
): Promise<any> {
  return queryRelatedRecords({
    url: layerUrl(layer),
    objectIds,
    relationshipId,
    outFields: opts.outFields,
    authentication: opts.authentication,
    token: opts.token,
  });
}

/** Ad-hoc advanced query (GeoJSON) — full FeatureQueryOptions except the url (taken from the layer). */
export function layerAdvancedQuery(
  layer: OperationalLayer,
  opts: Omit<FeatureQueryOptions, "url"> = {}
): Promise<any> {
  return queryFeatures({ url: layerUrl(layer), ...opts });
}

/**
 * Apply edits to a layer. Requires a writable + authenticated backend — ESRI today, or Strata once its
 * editing + auth land (Strata Serve is read-only in this release).
 */
export function layerApplyEdits(
  layer: OperationalLayer,
  edits: { adds?: unknown[]; updates?: unknown[]; deletes?: number[] } & AdvancedAuth
): Promise<any> {
  return applyEdits({
    url: layerUrl(layer),
    adds: edits.adds,
    updates: edits.updates,
    deletes: edits.deletes,
    authentication: edits.authentication,
    token: edits.token,
  });
}
