/**
 * @strata/core-map — DataSource wiring for `<StrataApp>` (Phase 1).
 *
 * Pure helpers (no React) so they're unit-testable in Node: walk an `AppLayout` for every widget binding,
 * and register the matching `DataSource` on the app's `DataSourceManager` up-front. Registration is
 * idempotent (the manager keys sources by layer/widget id), so two widgets bound to the same `layerId`
 * share ONE source — which is what makes selection/filter link between them with no `connections`.
 *
 * Only TYPES are imported from the sibling packages, so this module stays dependency-free at runtime and
 * can be exercised without spinning up the store/bus.
 */
import type { AppPage, LayoutNode, WidgetSpec, OperationalLayer } from "@strata/schema";
import type { DataSourceManager } from "@strata/data-source";
import type { StrataStore } from "@strata/state";
import type { OutputRegistry } from "@strata/actions";

/** A widget's id + its data binding, flattened out of the layout tree. */
export interface WidgetBinding {
  id?: string;
  type: string;
  binding: NonNullable<WidgetSpec["dataSource"]>;
}

/** Depth-first walk of a layout node, collecting every widget that carries a `dataSource` binding. */
export function collectBindings(pages: AppPage[]): WidgetBinding[] {
  const out: WidgetBinding[] = [];
  const visit = (node: LayoutNode | undefined): void => {
    if (!node) return;
    if (node.kind === "widget") {
      const w = node.widget;
      if (w.dataSource) out.push({ id: w.id, type: w.type, binding: w.dataSource });
      return;
    }
    if (node.kind === "views") {
      for (const v of node.views) visit(v.content);
      return;
    }
    for (const child of node.children) visit(child);
  };
  for (const page of pages) visit(page.root);
  return out;
}

export interface RegisterContext {
  store?: StrataStore;
  outputs?: OutputRegistry;
  layers?: OperationalLayer[];
}

/**
 * Pre-register a source for every widget binding in the layout. `sourceId` bindings are assumed to be
 * registered by the app already; `layerId` auto-wraps a `FeatureLayerDataSource`; `fromWidget` auto-wraps
 * an `OutputDataSource`. Returns the number of sources registered (handy for tests/inspection).
 */
export function registerAppDataSources(
  manager: DataSourceManager,
  pages: AppPage[],
  ctx: RegisterContext,
): number {
  const layers = ctx.layers ?? ctx.store?.getState().layers ?? [];
  let registered = 0;
  for (const { binding } of collectBindings(pages)) {
    if (binding.sourceId) continue; // owned by the app / another registrant
    if (binding.layerId && ctx.store) {
      const layer = layers.find((l) => l.id === binding.layerId);
      if (layer) {
        manager.fromLayer(layer, ctx.store);
        registered += 1;
      }
    } else if (binding.fromWidget && ctx.outputs) {
      manager.fromWidgetOutput(binding.fromWidget, ctx.outputs);
      registered += 1;
    }
  }
  return registered;
}
