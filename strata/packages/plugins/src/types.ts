/**
 * @strata/plugins — the plugin contract.
 *
 * Modelled on GeoLibre's plugin API but ESRI Web Map JSON-native: plugins operate on
 * `OperationalLayer`s, genuine ESRI `renderer` / `popupInfo` JSON, and a basemap — never
 * on a bespoke styling DSL. Panels and toolbar menus use a plain-DOM `render` contract so
 * external plugins (which cannot share the host's React tree) can still contribute UI.
 */

import type { OperationalLayer, BaseMap } from "@strata/schema";
import type { StrataStore } from "@strata/state";

/** A bounding box in [minX, minY, maxX, maxY] (EPSG:4326). */
export type BBox = [number, number, number, number];

/**
 * A UI panel contributed by a plugin. The host mounts it by calling `render(container)`;
 * the optional returned function is invoked on unmount for cleanup (listeners, timers…).
 */
export interface StrataPanel {
  id: string;
  title: string;
  /** Preferred dock/slot hint; the host decides final placement. */
  placement?: "left" | "right" | "bottom" | "modal";
  render(container: HTMLElement): void | (() => void);
}

/** A toolbar menu (button + optional items) contributed by a plugin. */
export interface StrataToolbarMenu {
  id: string;
  label: string;
  icon?: string;
  items?: Array<{ id: string; label: string; onSelect(): void }>;
  /** For a plain button menu with no sub-items. */
  onClick?: () => void;
}

/**
 * The surface a plugin is handed on activation. Optional members are forward-compat:
 * a minimal host may omit UI/registration hooks. Renderers and popups are genuine
 * ESRI JSON — no invented DSL.
 */
export interface StrataAppAPI {
  setBaseMap(bm: BaseMap): void;
  /** Add an operational layer; returns the layer id the host registered it under. */
  addOperationalLayer(layer: OperationalLayer): string;
  removeLayer(id: string): void;
  /** Set a layer's ESRI renderer JSON (goes into `layerDefinition.drawingInfo.renderer`). */
  setRenderer(id: string, renderer: Record<string, unknown>): void;
  /** Set a layer's genuine ESRI `popupInfo` JSON. */
  setPopup(id: string, popupInfo: Record<string, unknown>): void;
  fitBounds(bbox: BBox): void;

  /** The live map instance (e.g. a MapLibre `Map`), if the host exposes one. */
  getMap?(): unknown;
  /** The shared @strata/state store. */
  getStore(): StrataStore;

  registerPanel?(panel: StrataPanel): void;
  unregisterPanel?(id: string): void;
  registerToolbarMenu?(menu: StrataToolbarMenu): void;
  unregisterToolbarMenu?(id: string): void;
}

/**
 * A Strata plugin. Lifecycle:
 *   register → (activate on demand or if `activeByDefault`) → deactivate.
 *
 * Project persistence: `getProjectState` / `applyProjectState` let a plugin round-trip its
 * own slice through a saved project. URL sharing: declare `urlParameterNames` and handle
 * them in `handleUrlParameters` (e.g. deep links into a plugin's view).
 */
export interface StrataPlugin {
  id: string;
  name: string;
  version: string;
  /** Activate automatically when registered via a manager that honours the flag. */
  activeByDefault?: boolean;

  /** Return `false` to signal activation failed; anything else (incl. void) is success. */
  activate(app: StrataAppAPI): boolean | void;
  deactivate(app: StrataAppAPI): void;

  getProjectState?(): unknown;
  applyProjectState?(app: StrataAppAPI, state: unknown): void;

  urlParameterNames?: string[];
  handleUrlParameters?(app: StrataAppAPI, params: URLSearchParams): void | Promise<void>;
}
