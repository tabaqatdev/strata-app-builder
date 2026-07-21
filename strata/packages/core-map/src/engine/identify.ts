/**
 * identify — the click→feature resolution used by interaction mode `"identify"` (MIT).
 *
 * Flow: `queryRenderedFeatures` at the click point, preferring the ACTIVE layer's rendered
 * sub-layers (fallback: the topmost hit across all operational layers) → OID-enrich the hit
 * (fetch the full attribute row via `arcgisSource`, `outFields=*`) → hand back the layer +
 * enriched properties so the caller can render the layer's ESRI `popupInfo`.
 *
 * OID enrichment only fires for server-backed layers (arcgis-feature / strata) that expose a
 * queryable URL; inline GeoJSON layers already carry all their attributes, so their rendered
 * properties are returned as-is.
 */
import type { OperationalLayer } from "@strata/schema";
import type { DataClient } from "./arcgisSource.js";
import { fetchMeta, loadFeatures } from "./arcgisSource.js";

/** The namespaced sub-layer ids a logical layer is split into (see layers.ts). */
export function subLayerIdsFor(layerId: string): string[] {
  const src = `lyr:${layerId}`;
  return [`${src}:fill`, `${src}:outline`, `${src}:line`, `${src}:circle`, `${src}:symbol`];
}

/** Extract the logical layer id from a namespaced sub-layer id (`lyr:{id}:{kind}`). */
export function logicalLayerId(subLayerId: string): string | undefined {
  const parts = subLayerId.split(":");
  return parts[0] === "lyr" ? parts[1] : undefined;
}

export interface IdentifyOptions {
  map: any; // maplibre-gl Map
  point: { x: number; y: number };
  layers: OperationalLayer[];
  client?: DataClient;
  /** Prefer hits on this layer; falls back to the topmost hit when absent or not hit. */
  activeLayerId?: string | null;
}

export interface IdentifyResult {
  layer: OperationalLayer;
  /** The (OID-enriched, when possible) attribute row for the hit feature. */
  properties: Record<string, unknown>;
  /** The raw MapLibre rendered feature. */
  feature: any;
}

/**
 * Resolve the feature under `point`. Returns `null` when nothing is hit.
 * Prefers the active layer's sub-layers; otherwise takes the topmost rendered hit.
 */
export async function identify(opts: IdentifyOptions): Promise<IdentifyResult | null> {
  const { map, point, layers, client = {}, activeLayerId } = opts;
  const known = new Set(layers.map((l) => l.id));

  const queryable = (ids: string[]): string[] => ids.filter((id) => map.getLayer(id));

  // 1) Prefer the active layer's rendered features.
  let hits: any[] = [];
  if (activeLayerId && known.has(activeLayerId)) {
    hits = map.queryRenderedFeatures(point, { layers: queryable(subLayerIdsFor(activeLayerId)) });
  }
  // 2) Fallback: topmost hit across all operational layers (draw order → first is on top).
  if (!hits.length) {
    const all = layers.flatMap((l) => subLayerIdsFor(l.id));
    hits = map.queryRenderedFeatures(point, { layers: queryable(all) });
  }
  if (!hits.length) return null;

  const feature = hits[0];
  const layerId = logicalLayerId(String(feature.layer?.id ?? ""));
  const layer = layers.find((l) => l.id === layerId);
  if (!layer) return null;

  const rendered: Record<string, unknown> = feature.properties || {};
  const properties = await enrichByOid(layer, rendered, client);
  return { layer, properties, feature };
}

/**
 * Fetch the full attribute row for a hit by its OBJECTID (`outFields=*`). Falls back to the
 * rendered (tile) properties on any failure or when the layer isn't server-backed.
 */
export async function enrichByOid(
  layer: OperationalLayer,
  rendered: Record<string, unknown>,
  client: DataClient,
): Promise<Record<string, unknown>> {
  const serverBacked = layer.source.kind === "arcgis-feature" || layer.source.kind === "strata";
  const url = layer.url || layer.source.url;
  if (!serverBacked || !url) return rendered;

  try {
    const meta = await fetchMeta(url, client).catch(() => null);
    const oidField = meta?.oidField || "OBJECTID";
    const oid = rendered[oidField] ?? rendered.OBJECTID ?? rendered.objectid ?? rendered.FID;
    // OBJECTIDs are integers; a non-numeric value means no reliable OID to re-query on.
    const oidNum = Number(oid);
    if (oid == null || !Number.isFinite(oidNum)) return rendered;
    const fc = await loadFeatures(url, client, {
      where: `${oidField} = ${oidNum}`,
      outFields: "*",
      cap: 1,
    });
    const full = fc.features[0]?.properties;
    return full ? { ...rendered, ...full } : rendered;
  } catch {
    return rendered;
  }
}
