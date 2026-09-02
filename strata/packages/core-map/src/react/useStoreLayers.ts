/**
 * useStoreLayers — the one subscription to "what layers are on the map right now" (MIT).
 *
 * Every surface that lists layers (the Legend, the MapChrome layers drawer, the LayerPanel) has to
 * answer the same question, and it has to answer it *reactively*: toggling a layer off in one
 * surface must change every other one in the same frame. A component handed a static array cannot —
 * it is a snapshot of the spec at author time, and a legend that disagrees with the map is worse
 * than no legend, because the reader trusts it.
 *
 * So: an explicit `layers` prop still wins (a bespoke control bar may want to list a subset), but
 * when it is absent the store is the source of truth, and `useSyncExternalStore` keeps it live.
 * With neither, the result is an empty array — never `undefined`, so no caller ever has to guard.
 */
import { useSyncExternalStore } from "react";
import type { OperationalLayer } from "@strata/schema";
import type { StrataStore } from "@strata/state";

const EMPTY: OperationalLayer[] = [];
const NO_SUBSCRIBE = (): (() => void) => () => {};

/**
 * The current operational layers: `explicit` when given, else the store's (live), else `[]`.
 *
 * @param store    the `@strata/state` store, when the surface is store-driven
 * @param explicit an authored/static layer list that outranks the store
 */
export function useStoreLayers(
  store: StrataStore | undefined,
  explicit?: OperationalLayer[],
): OperationalLayer[] {
  const snapshot = (): OperationalLayer[] =>
    explicit ?? (store ? store.getState().layers : EMPTY);
  return useSyncExternalStore(
    // Nothing to subscribe to when the list is authored or there is no store.
    explicit || !store ? NO_SUBSCRIBE : store.subscribe,
    snapshot,
    snapshot,
  );
}

export default useStoreLayers;
