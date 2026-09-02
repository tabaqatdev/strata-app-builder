/**
 * @strata/core-map — the app interactivity context (WIF, MIT).
 *
 * `<StrataApp>` provides an `ActionBus` + an `OutputRegistry` (and the widget show/hide setter) to the whole
 * tree, so widgets and panels can emit triggers, honor actions, and consume each other's *output data
 * sources* without prop-drilling. Widgets also receive `bus` / `id` / `outputs` directly as props (the
 * existing panel contract), so either access style works.
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import { ActionBus, OutputRegistry, type RecordsChangePayload } from "@strata/actions";
import type { DataSource, DataSourceManager } from "@strata/data-source";

export interface StrataAppEnv {
  bus: ActionBus;
  outputs: OutputRegistry;
  /** The first-class DataSource registry (Phase 1). Widgets resolve `sourceId` bindings through it. */
  dataSources?: DataSourceManager;
  /** Show/hide a widget by id (drives the `showHide` action). */
  setHidden: (widgetId: string, hidden: boolean) => void;
  /** True when a widget id is currently hidden. */
  isHidden: (widgetId: string) => boolean;
  /** The app's pages (for a `page-nav` widget). */
  pages?: Array<{ id: string; title?: string }>;
  /** The currently-shown page id. */
  activePageId?: string;
  /** Navigate to a page by id (drives the `page-nav` widget + the `navigate` action). */
  navigateToPage?: (pageId: string) => void;
  /** Live maplibre maps by widget id (Phase 7) — lets sibling map-tool widgets reach a `map` widget. */
  maps?: MapRegistry;
  /**
   * The app's **resolved** theme mode (`"auto"` already resolved against the OS preference), or
   * undefined when the app's theme does not declare one and nothing has switched it. This is what
   * "Follow the theme" follows: the map chrome ticks against it and the basemap swaps with it.
   */
  themeMode?: "light" | "dark";
  /**
   * Report a new theme mode to the app (the `theme-switch` widget calls this). Without it a switcher
   * would repaint the UI while the map kept the old mode's basemap — the two would disagree.
   */
  setThemeMode?: (mode: "light" | "dark") => void;
}

/** A registry of live maplibre `Map` instances keyed by the `map` widget's id (see `useMapInstance`). */
export class MapRegistry {
  private maps = new Map<string, unknown>();
  private subs = new Set<() => void>();
  register(id: string, map: unknown): void {
    this.maps.set(id, map);
    this.subs.forEach((f) => f());
  }
  unregister(id: string): void {
    this.maps.delete(id);
    this.subs.forEach((f) => f());
  }
  /** Get a map by id, or the first registered map when `id` is omitted. */
  get(id?: string): unknown {
    return id ? this.maps.get(id) : this.maps.values().next().value;
  }
  subscribe(fn: () => void): () => void {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  }
}

const StrataAppContext = createContext<StrataAppEnv | null>(null);

export function StrataAppProvider(props: {
  env: StrataAppEnv;
  children: React.ReactNode;
}): React.ReactElement {
  return <StrataAppContext.Provider value={props.env}>{props.children}</StrataAppContext.Provider>;
}

/** Read the app interactivity env (bus/outputs/show-hide). Null outside a `<StrataApp>`. */
export function useStrataAppEnv(): StrataAppEnv | null {
  return useContext(StrataAppContext);
}

/**
 * Consume another widget's **output data source** (W2). Returns the latest records published under
 * `fromWidget`, re-rendering whenever it changes. Returns `undefined` when there is no such output (or no
 * `<StrataApp>` provider). Widgets bind this via `dataSource.fromWidget`.
 */
export function useOutputData(fromWidget: string | undefined): RecordsChangePayload | undefined {
  const env = useStrataAppEnv();
  const [payload, setPayload] = useState<RecordsChangePayload | undefined>(() =>
    fromWidget && env ? env.outputs.get(fromWidget) : undefined,
  );
  useEffect(() => {
    if (!fromWidget || !env) return;
    setPayload(env.outputs.get(fromWidget));
    return env.outputs.subscribe(fromWidget, setPayload);
  }, [fromWidget, env]);
  return payload;
}

/**
 * Get the live maplibre `Map` for a `map` widget by id (or the first registered map when `mapId` is
 * omitted), re-rendering when maps register/unregister. Used by the map-tool widgets (measure/draw/…) to
 * reach a sibling `map`. Returns `undefined` until the map is ready.
 */
export function useMapInstance(mapId?: string): unknown {
  const env = useStrataAppEnv();
  const reg = env?.maps;
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!reg) return;
    return reg.subscribe(() => setTick((t) => t + 1));
  }, [reg]);
  return reg ? reg.get(mapId) : undefined;
}

/**
 * Subscribe to a first-class `DataSource` (Phase 1). Returns a version counter that increments on every
 * source event (`refresh`/`selectionChange`/`filterChange`/`countChange`), so a widget re-renders and can
 * re-read `source.getFilteredView()` / `getSelection()` / `getStatistics()`. Returns `0` when no source.
 */
export function useDataSource(source: DataSource | undefined): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!source) return;
    return source.subscribe(() => setVersion((v) => v + 1));
  }, [source]);
  return version;
}
