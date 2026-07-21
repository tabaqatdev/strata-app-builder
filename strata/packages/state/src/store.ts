/**
 * @strata/state — the framework-agnostic app store.
 *
 * A single vanilla Zustand store holding the live authoring state of a Strata map:
 * operational layers, the current selection, the map view, and the basemap. The store
 * round-trips to/from `LayersJson` (the ESRI Web Map JSON-aligned map spec) so the same
 * shapes flow through @strata/core-map and the publishing pipeline unchanged.
 *
 * Undo/redo is a bounded, array-based snapshot history (last ~50 states) of the
 * layers + view + basemap + selection — no extra dependencies.
 */

import { createStore, type StoreApi } from "zustand/vanilla";
import type { OperationalLayer, LayersJson, BaseMap } from "@strata/schema";

/** The current attribute selection: a set of OBJECTIDs within one layer. */
export interface Selection {
  layerId: string;
  oids: number[];
}

/** The map view: center [lng, lat] and zoom. */
export interface MapView {
  center: [number, number];
  zoom: number;
}

/**
 * How a map click is interpreted.
 *  - `identify` (default): click runs identify (queryRenderedFeatures → OID-enrich → popup).
 *  - `measure` / `sketch`: a Terra Draw interaction owns the canvas (crosshair cursor).
 *  - `pan`: plain navigation, clicks do nothing special.
 * Controls flip this to `measure`/`sketch` while active and MUST reset it to `identify`
 * when their interaction finishes or the control closes (see the "return to identify" fix).
 */
export type InteractionMode = "identify" | "measure" | "sketch" | "pan";

/** A snapshot of the undoable slice of state. */
interface Snapshot {
  layers: OperationalLayer[];
  selection: Selection | null;
  view: MapView | null;
  baseMap: BaseMap | null;
}

/** Actions exposed on the store. */
export interface StrataActions {
  addLayer: (layer: OperationalLayer) => void;
  removeLayer: (id: string) => void;
  /** Rename an operational layer (updates its `title`); no-op if the id is unknown. */
  renameLayer: (id: string, title: string) => void;
  /** Reorder the operational layers to match the given id order (unknown/missing ids are ignored). */
  reorderLayers: (ids: string[]) => void;
  /**
   * Set a layer's `layerDefinition.definitionExpression` (a SQL `where`) — the in-place server-side
   * filter that the store binding applies without remounting the map. Pass `undefined`/`""` to clear.
   * No-op if the id is unknown.
   */
  setDefinition: (id: string, where: string | undefined) => void;
  setVisibility: (id: string, visible: boolean) => void;
  setOpacity: (id: string, opacity: number) => void;
  setSelection: (sel: Selection | null) => void;
  /**
   * Set the active layer — the default target for identify + popups. Transient UI state:
   * it is NOT pushed onto the undo/redo history.
   */
  setActiveLayer: (id: string | null) => void;
  /**
   * Set the interaction mode (identify / measure / sketch / pan). Transient UI state:
   * it is NOT pushed onto the undo/redo history.
   */
  setInteractionMode: (mode: InteractionMode) => void;
  setView: (view: MapView | null) => void;
  setBaseMap: (bm: BaseMap | null) => void;
  loadFromLayersJson: (cfg: LayersJson) => void;
  toLayersJson: () => LayersJson;
  undo: () => void;
  redo: () => void;
  /** True when there is a prior snapshot to restore. */
  canUndo: () => boolean;
  /** True when there is a forward snapshot to restore. */
  canRedo: () => boolean;
}

/** The full store state shape (data + actions). */
export interface StrataState extends StrataActions {
  layers: OperationalLayer[];
  selection: Selection | null;
  view: MapView | null;
  baseMap: BaseMap | null;
  /** The active layer id — default target for identify + popups. Transient (not undoable). */
  activeLayerId: string | null;
  /** The current interaction mode. Transient (not undoable). Defaults to `"identify"`. */
  interactionMode: InteractionMode;
  /** Internal undo/redo rings; exposed for tests/inspection only. */
  _past: Snapshot[];
  _future: Snapshot[];
}

export type StrataStore = StoreApi<StrataState>;

const HISTORY_LIMIT = 50;

const DEFAULT_LAYERS_VERSION = "1.0";
const DEFAULT_SPATIAL_REFERENCE = { wkid: 4326, latestWkid: 4326 };

/** A world-extent envelope used when a config carries no initial viewpoint. */
const WORLD_EXTENT = {
  xmin: -180,
  ymin: -90,
  xmax: 180,
  ymax: 90,
  spatialReference: DEFAULT_SPATIAL_REFERENCE,
};

const EMPTY_BASEMAP: BaseMap = { title: "Basemap", baseMapLayers: [] };

/** Shallow structural clone so history snapshots don't alias live state. */
function clone<T>(value: T): T {
  return structuredClone(value);
}

function snapshot(state: StrataState): Snapshot {
  return clone({
    layers: state.layers,
    selection: state.selection,
    view: state.view,
    baseMap: state.baseMap,
  });
}

export function createStrataStore(): StrataStore {
  return createStore<StrataState>((set, get) => {
    /**
     * Apply a producer that mutates the undoable slice, pushing the pre-change
     * snapshot onto the past ring and clearing the redo ring.
     */
    const commit = (producer: (draft: Snapshot) => Snapshot | void): void => {
      const state = get();
      const before = snapshot(state);
      const working = clone(before);
      const produced = producer(working) ?? working;
      const past = [...state._past, before];
      if (past.length > HISTORY_LIMIT) past.shift();
      set({
        layers: produced.layers,
        selection: produced.selection,
        view: produced.view,
        baseMap: produced.baseMap,
        _past: past,
        _future: [],
      });
    };

    return {
      layers: [],
      selection: null,
      view: null,
      baseMap: null,
      activeLayerId: null,
      interactionMode: "identify",
      _past: [],
      _future: [],

      addLayer: (layer) =>
        commit((draft) => {
          draft.layers = [...draft.layers, clone(layer)];
        }),

      removeLayer: (id) => {
        commit((draft) => {
          draft.layers = draft.layers.filter((l) => l.id !== id);
          if (draft.selection?.layerId === id) draft.selection = null;
        });
        // Clear the active layer if it pointed at the removed one (transient — not undoable).
        if (get().activeLayerId === id) set({ activeLayerId: null });
      },

      renameLayer: (id, title) =>
        commit((draft) => {
          draft.layers = draft.layers.map((l) =>
            l.id === id ? { ...l, title } : l,
          );
        }),

      setDefinition: (id, where) =>
        commit((draft) => {
          draft.layers = draft.layers.map((l) =>
            l.id === id
              ? {
                  ...l,
                  layerDefinition: {
                    ...(l.layerDefinition ?? {}),
                    definitionExpression: where || undefined,
                  },
                }
              : l,
          );
        }),

      reorderLayers: (ids) =>
        commit((draft) => {
          const byId = new Map(draft.layers.map((l) => [l.id, l] as const));
          const ordered: OperationalLayer[] = [];
          for (const id of ids) {
            const found = byId.get(id);
            if (found) {
              ordered.push(found);
              byId.delete(id);
            }
          }
          // Preserve any layers not named in `ids` at the tail, in original order.
          for (const l of draft.layers) if (byId.has(l.id)) ordered.push(l);
          draft.layers = ordered;
        }),

      setVisibility: (id, visible) =>
        commit((draft) => {
          draft.layers = draft.layers.map((l) =>
            l.id === id ? { ...l, visibility: visible } : l,
          );
        }),

      setOpacity: (id, opacity) =>
        commit((draft) => {
          const clamped = Math.max(0, Math.min(1, opacity));
          draft.layers = draft.layers.map((l) =>
            l.id === id ? { ...l, opacity: clamped } : l,
          );
        }),

      setSelection: (sel) =>
        commit((draft) => {
          draft.selection = sel ? clone(sel) : null;
        }),

      // Transient UI state: plain `set`, no snapshot — deliberately outside `commit`
      // so these never enter the undo/redo history.
      setActiveLayer: (id) => set({ activeLayerId: id }),

      setInteractionMode: (mode) => set({ interactionMode: mode }),

      setView: (view) =>
        commit((draft) => {
          draft.view = view ? clone(view) : null;
        }),

      setBaseMap: (bm) =>
        commit((draft) => {
          draft.baseMap = bm ? clone(bm) : null;
        }),

      loadFromLayersJson: (cfg) => {
        commit((draft) => {
          draft.layers = clone(cfg.operationalLayers ?? []);
          draft.baseMap = clone(cfg.baseMap ?? EMPTY_BASEMAP);
          draft.selection = null;
          const extent = cfg.initialState?.viewpoint?.targetGeometry;
          if (extent) {
            draft.view = {
              center: [(extent.xmin + extent.xmax) / 2, (extent.ymin + extent.ymax) / 2],
              zoom: 3,
            };
          }
        });
        // Reset transient UI state on a fresh load (not undoable).
        set({ activeLayerId: null, interactionMode: "identify" });
      },

      toLayersJson: (): LayersJson => {
        const state = get();
        return {
          version: DEFAULT_LAYERS_VERSION,
          spatialReference: DEFAULT_SPATIAL_REFERENCE,
          initialState: { viewpoint: { targetGeometry: clone(WORLD_EXTENT) } },
          baseMap: clone(state.baseMap ?? EMPTY_BASEMAP),
          operationalLayers: clone(state.layers),
        };
      },

      undo: () => {
        const state = get();
        if (state._past.length === 0) return;
        const past = [...state._past];
        const previous = past.pop()!;
        const present = snapshot(state);
        set({
          layers: previous.layers,
          selection: previous.selection,
          view: previous.view,
          baseMap: previous.baseMap,
          _past: past,
          _future: [present, ...state._future].slice(0, HISTORY_LIMIT),
        });
      },

      redo: () => {
        const state = get();
        if (state._future.length === 0) return;
        const [next, ...rest] = state._future;
        const present = snapshot(state);
        const past = [...state._past, present];
        if (past.length > HISTORY_LIMIT) past.shift();
        set({
          layers: next.layers,
          selection: next.selection,
          view: next.view,
          baseMap: next.baseMap,
          _past: past,
          _future: rest,
        });
      },

      canUndo: () => get()._past.length > 0,
      canRedo: () => get()._future.length > 0,
    };
  });
}
