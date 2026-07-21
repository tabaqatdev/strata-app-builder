/**
 * DataSourceManager — the registry `<StrataApp>` instantiates once and threads through context (like the
 * store and the action bus). It auto-wraps legacy bindings so no recipe changes: a `dataSource.layerId`
 * becomes a `FeatureLayerDataSource`, a `dataSource.fromWidget` becomes an `OutputDataSource`. New recipes
 * opt into the richer model with `dataSource.sourceId`.
 */
import type { OperationalLayer } from "@strata/schema";
import type { StrataStore } from "@strata/state";
import type { OutputRegistry } from "@strata/actions";
import type { DataSource, Row } from "./types.js";
import { FeatureLayerDataSource, OutputDataSource } from "./sources.js";

export class DataSourceManager {
  private sources = new Map<string, DataSource>();

  /** Register a source under its id (idempotent per id — last registration wins). */
  register(ds: DataSource): DataSource {
    this.sources.set(ds.id, ds);
    return ds;
  }

  get(id: string): DataSource | undefined {
    return this.sources.get(id);
  }

  has(id: string): boolean {
    return this.sources.has(id);
  }

  ids(): string[] {
    return [...this.sources.keys()];
  }

  /**
   * Auto-wrap an operational layer as a `FeatureLayerDataSource` (registered under the layer id). Returns
   * the existing source if one is already registered for that layer id — so repeated calls are cheap.
   */
  fromLayer(layer: OperationalLayer, store: StrataStore, rows?: Row[]): FeatureLayerDataSource {
    const existing = this.sources.get(layer.id);
    if (existing instanceof FeatureLayerDataSource) return existing;
    const ds = new FeatureLayerDataSource({ layerId: layer.id, store, rows });
    this.sources.set(ds.id, ds);
    return ds;
  }

  /** Auto-wrap a widget's output as an `OutputDataSource` (registered under the widget id). */
  fromWidgetOutput(widgetId: string, outputs: OutputRegistry, layerId?: string): OutputDataSource {
    const existing = this.sources.get(widgetId);
    if (existing instanceof OutputDataSource) return existing;
    const ds = new OutputDataSource({ widgetId, outputs, layerId });
    this.sources.set(ds.id, ds);
    return ds;
  }

  /**
   * Resolve a widget's `dataSource` binding to a concrete source, honoring precedence:
   * `sourceId` (explicit) → `layerId` (auto-wrap layer) → `fromWidget` (auto-wrap output).
   * Returns `undefined` when nothing is bound.
   */
  resolve(
    binding: { sourceId?: string; layerId?: string; fromWidget?: string } | undefined,
    ctx: { store?: StrataStore; outputs?: OutputRegistry; layers?: OperationalLayer[] },
  ): DataSource | undefined {
    if (!binding) return undefined;
    if (binding.sourceId) return this.get(binding.sourceId);
    if (binding.layerId && ctx.store) {
      // Return an already-registered source first, so repeated resolves (and widgets sharing a layerId)
      // always get the SAME instance — even when the caller doesn't pass `layers`.
      const existing = this.get(binding.layerId);
      if (existing) return existing;
      const layer = ctx.layers?.find((l) => l.id === binding.layerId);
      if (layer) return this.fromLayer(layer, ctx.store);
      const ds = new FeatureLayerDataSource({ layerId: binding.layerId, store: ctx.store });
      return this.register(ds);
    }
    if (binding.fromWidget && ctx.outputs) {
      return this.fromWidgetOutput(binding.fromWidget, ctx.outputs);
    }
    return undefined;
  }

  clear(): void {
    this.sources.clear();
  }
}
