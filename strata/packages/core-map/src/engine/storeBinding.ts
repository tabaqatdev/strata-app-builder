/**
 * storeBinding — reflect a @strata/state store onto a live MapLibre map (MIT).
 *
 * Subscribes to a vanilla @strata/state store and diffs each change against the last applied
 * snapshot, driving the `LayerRegistry` + `applyBaseMap` to keep the map in sync:
 *   - add / remove operational layers
 *   - visibility, opacity
 *   - layer order (restack)
 *   - basemap switch
 *   - highlight/select by OID (from `selection`)
 *   - zoom-to-layer (via an imperative signal, not stored state)
 *
 * Returns a disposer plus a small imperative API (`zoomToLayer`) for signals that aren't part of the
 * declarative store state. Back-compat: `<StrataMap>` only creates this when a `store` prop is given.
 */
import type { OperationalLayer } from "@strata/schema";
import type { StrataStore, StrataState } from "@strata/state";
import type { ActionBus, FeatureSelectPayload, HoverPayload } from "@strata/actions";
import { LayerRegistry } from "./layers.js";
import { applyBaseMap } from "./basemaps.js";
import { queryExtent, type DataClient } from "./arcgisSource.js";
import type { MapController } from "./MapController.js";

export interface StoreBindingOptions {
  controller: MapController;
  registry: LayerRegistry;
  store: StrataStore;
  client: DataClient;
  /** Applies the interaction mode (cursor) whenever it changes. */
  onInteractionMode?: (mode: StrataState["interactionMode"]) => void;
  /** Applies the active layer whenever it changes. */
  onActiveLayer?: (id: string | null) => void;
  /**
   * When provided, the map also acts as a **bus sink** (WIF W4): `featureSelect`/`rowSelect` highlight the
   * features (and zoom when the payload asks), `flash` shows a transient highlight. This is what makes a
   * selection elsewhere (a table row, a chart bar, a data-action) light up on the map.
   */
  bus?: ActionBus;
  /** The map's own id, so it ignores echoes of triggers it emitted itself. */
  mapId?: string;
}

export interface StoreBinding {
  dispose: () => void;
  /** Fit the map to a layer's extent (server extent query, else source-data bounds). */
  zoomToLayer: (layerId: string) => Promise<void>;
}

/** Shallow-equal by id list + a per-layer signature (visibility/opacity/renderer/url/definitionExpression). */
function layerSignature(l: OperationalLayer): string {
  return [
    l.id,
    l.visibility === false ? 0 : 1,
    l.opacity ?? 1,
    l.url ?? l.source?.url ?? "",
    JSON.stringify(l.layerDefinition?.drawingInfo?.renderer ?? null),
    l.layerDefinition?.definitionExpression ?? "",
  ].join("|");
}

export function bindStoreToMap(opts: StoreBindingOptions): StoreBinding {
  const { controller, registry, store, client } = opts;
  const map = controller.map;

  // Last-applied snapshot for diffing. Seed from the CURRENT store state: StrataMap has already
  // added these layers on `ready`, so the binding must not re-add them on the first change.
  const seed = store.getState();
  let prevById = new Map<string, OperationalLayer>(seed.layers.map((l) => [l.id, l] as const));
  let prevOrder: string[] = seed.layers.map((l) => l.id);
  let prevBaseMap = seed.baseMap;
  let prevSelectionKey = seed.selection
    ? `${seed.selection.layerId}:${seed.selection.oids.join(",")}`
    : "";
  let prevMode = seed.interactionMode;
  let prevActive = seed.activeLayerId;

  const apply = (state: StrataState): void => {
    const layers = state.layers;
    const nextById = new Map(layers.map((l) => [l.id, l] as const));
    const nextOrder = layers.map((l) => l.id);

    // Removed layers.
    for (const id of prevById.keys()) {
      if (!nextById.has(id)) void registry.remove(id);
    }

    // Added / changed layers.
    for (const layer of layers) {
      const before = prevById.get(layer.id);
      if (!before) {
        // New layer: add unless hidden (visibility is applied post-add below anyway).
        void registry.add(layer).then(() => {
          registry.setVisibility(layer.id, layer.visibility !== false);
          if (layer.opacity != null) registry.setOpacity(layer.id, layer.opacity);
        });
        continue;
      }
      if (layerSignature(before) === layerSignature(layer)) continue;
      // Cheap per-property updates for the common cases.
      if ((before.visibility !== false) !== (layer.visibility !== false)) {
        registry.setVisibility(layer.id, layer.visibility !== false);
      }
      if ((before.opacity ?? 1) !== (layer.opacity ?? 1)) {
        registry.setOpacity(layer.id, layer.opacity ?? 1);
      }
      const beforeRenderer = JSON.stringify(before.layerDefinition?.drawingInfo?.renderer ?? null);
      const afterRenderer = JSON.stringify(layer.layerDefinition?.drawingInfo?.renderer ?? null);
      const beforeUrl = before.url ?? before.source?.url ?? "";
      const afterUrl = layer.url ?? layer.source?.url ?? "";
      if (beforeUrl !== afterUrl) {
        // Source changed — re-add from scratch.
        void registry.remove(layer.id).then(() => registry.add(layer));
      } else {
        // Same source: apply renderer and definitionExpression changes IN PLACE (no remount).
        if (beforeRenderer !== afterRenderer && layer.layerDefinition?.drawingInfo?.renderer) {
          registry.applyRenderer(layer.id, layer.layerDefinition.drawingInfo.renderer);
        }
        const beforeDef = before.layerDefinition?.definitionExpression ?? "";
        const afterDef = layer.layerDefinition?.definitionExpression ?? "";
        if (beforeDef !== afterDef) {
          void registry.setDefinition(layer.id, afterDef || undefined);
        }
      }
    }

    // Order change → restack.
    if (nextOrder.join(",") !== prevOrder.join(",")) {
      registry.restack(nextOrder);
    }

    // Basemap switch.
    if (state.baseMap !== prevBaseMap && state.baseMap) {
      applyBaseMap(map, state.baseMap);
      prevBaseMap = state.baseMap;
    }

    // Highlight / select by OID (from the selection slice).
    const selKey = state.selection ? `${state.selection.layerId}:${state.selection.oids.join(",")}` : "";
    if (selKey !== prevSelectionKey) {
      if (state.selection && state.selection.oids.length) {
        registry.highlight(state.selection.layerId, state.selection.oids);
      } else if (state.selection) {
        registry.highlight(state.selection.layerId, []); // clear
      }
      prevSelectionKey = selKey;
    }

    // Interaction mode (cursor + click behavior is applied by StrataMap via the callback).
    if (state.interactionMode !== prevMode) {
      opts.onInteractionMode?.(state.interactionMode);
      prevMode = state.interactionMode;
    }

    // Active layer.
    if (state.activeLayerId !== prevActive) {
      opts.onActiveLayer?.(state.activeLayerId);
      prevActive = state.activeLayerId;
    }

    prevById = nextById;
    prevOrder = nextOrder;
  };

  const unsub = store.subscribe(apply);

  // --- Bus sink (WIF W4): react to selection/flash triggers from other widgets. ---
  const busOffs: Array<() => void> = [];
  const flashTimers = new Set<ReturnType<typeof setTimeout>>();
  if (opts.bus) {
    const bus = opts.bus;
    const onSelect = (t: { source?: string; payload: FeatureSelectPayload }): void => {
      if (t.source && opts.mapId && t.source === opts.mapId) return; // ignore own echoes
      if (!t.payload?.layerId) return;
      store.getState().setSelection?.({ layerId: t.payload.layerId, oids: t.payload.oids });
      if (t.payload.zoom) void zoomToLayer(t.payload.layerId);
    };
    busOffs.push(bus.on<FeatureSelectPayload>("featureSelect", onSelect));
    busOffs.push(bus.on<FeatureSelectPayload>("rowSelect", onSelect));
    busOffs.push(
      bus.on<HoverPayload>("flash", (t) => {
        if (!t.payload?.layerId) return;
        registry.highlight(t.payload.layerId, t.payload.oids);
        const timer = setTimeout(() => {
          flashTimers.delete(timer);
          const sel = store.getState().selection;
          registry.highlight(
            t.payload.layerId,
            sel && sel.layerId === t.payload.layerId ? sel.oids : [],
          );
        }, 900);
        flashTimers.add(timer);
      }),
    );
  }

  const zoomToLayer = async (layerId: string): Promise<void> => {
    const layer = store.getState().layers.find((l) => l.id === layerId);
    if (!layer) return;
    const url = layer.url || layer.source?.url;
    if (url && (layer.source.kind === "arcgis-feature" || layer.source.kind === "strata")) {
      const bbox = await queryExtent(url, client).catch(() => null);
      if (bbox) {
        controller.fitBounds(bbox);
        return;
      }
      // fall through to source-data bounds
    }
    // GeoJSON / already-loaded source: derive bounds from rendered features.
    const bbox = boundsFromSource(map, `lyr:${layerId}`);
    if (bbox) controller.fitBounds(bbox);
  };

  return {
    dispose: () => {
      unsub();
      busOffs.forEach((o) => o());
      flashTimers.forEach((t) => clearTimeout(t));
      flashTimers.clear();
    },
    zoomToLayer,
  };
}

/** Compute a [w,s,e,n] bbox from a GeoJSON source's current data. Returns null when unavailable. */
function boundsFromSource(map: any, srcId: string): [number, number, number, number] | null {
  const src = map.getSource?.(srcId);
  const data = src?._data ?? src?.serialize?.()?.data;
  const fc = typeof data === "object" ? data : null;
  if (!fc?.features?.length) return null;
  let w = Infinity,
    s = Infinity,
    e = -Infinity,
    n = -Infinity;
  const visit = (coords: any): void => {
    if (typeof coords[0] === "number") {
      const [x, y] = coords;
      if (x < w) w = x;
      if (x > e) e = x;
      if (y < s) s = y;
      if (y > n) n = y;
    } else {
      for (const c of coords) visit(c);
    }
  };
  for (const f of fc.features) {
    if (f.geometry?.coordinates) visit(f.geometry.coordinates);
  }
  return Number.isFinite(w) ? [w, s, e, n] : null;
}
