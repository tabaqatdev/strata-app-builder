/**
 * materialize — the "expression, not snapshot" re-run helpers (Analysis §3.4).
 *
 * A saved chart/table stores a tiny re-runnable **descriptor** (`source.layer_id` + field/where) and
 * DROPS the data; on open you `materialize*` it live against the current service, so saved maps stay
 * small and always-fresh. `isLive*` tells whether an item is descriptor-backed (re-run) vs. a baked
 * sourceless snapshot.
 */
import type { SavedChart, SavedTable } from "@strata/schema";
import { loadFeatures, type DataClient } from "./arcgisSource.js";

export interface MaterializedDatum { label: string; value: number }

/** A saved chart is "live" when it carries a re-runnable source (vs. an ad-hoc sourceless snapshot). */
export function isLiveChart(c: SavedChart): boolean {
  return !!c.source?.layer_id;
}
export function isLiveTable(t: SavedTable): boolean {
  return !!t.source?.layer_id;
}

type Rows = Array<Record<string, unknown>>;

/** Aggregate rows by `field`, combining `valueField` with `stat` (count when no value field). */
export function aggregate(rows: Rows, field: string, valueField?: string | null, stat = "sum"): MaterializedDatum[] {
  const groups = new Map<string, number[]>();
  for (const r of rows) {
    const k = String(r[field] ?? "—");
    const arr = groups.get(k) ?? [];
    if (valueField) arr.push(Number(r[valueField]) || 0);
    else arr.push(1);
    groups.set(k, arr);
  }
  const reduce = (vals: number[]): number => {
    if (!valueField) return vals.length; // count
    switch (stat) {
      case "avg": case "mean": return vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
      case "min": return Math.min(...vals);
      case "max": return Math.max(...vals);
      case "count": return vals.length;
      default: return vals.reduce((s, v) => s + v, 0); // sum
    }
  };
  return [...groups.entries()].map(([label, vals]) => ({ label, value: reduce(vals) })).sort((a, b) => b.value - a.value);
}

/**
 * Re-materialize a saved chart against `layerUrl` (the FeatureServer for `source.layer_id`). Returns the
 * grouped `{label,value}[]` ready for the chart renderer. Client-side group-by over a lean fetch (only
 * the field + value field), mirroring the server-side `outStatistics` path.
 */
export async function materializeChart(chart: SavedChart, layerUrl: string, client: DataClient): Promise<MaterializedDatum[]> {
  const src = chart.source;
  if (!src?.field) return [];
  const outFields = [src.field, src.value_field].filter(Boolean).join(",") || "*";
  const fc = await loadFeatures(layerUrl, client, { outFields, cap: 4000 });
  const rows = fc.features.map((f: any) => ({ ...(f.properties || {}) }));
  return aggregate(rows, src.field, src.value_field, src.stat).slice(0, 50);
}

/**
 * Re-materialize a saved table against `layerUrl`: re-query with the saved `where` + `columns` and return
 * flat attribute rows. Paging/windowing is handled by the AttributeTablePanel.
 */
export async function materializeTable(table: SavedTable, layerUrl: string, client: DataClient, cap = 5000): Promise<Rows> {
  const where = table.source?.where || "1=1";
  const outFields = table.columns?.length ? table.columns.join(",") : "*";
  const fc = await loadFeatures(layerUrl, client, { where, outFields, cap });
  return fc.features.map((f: any) => ({ ...(f.properties || {}) }));
}
