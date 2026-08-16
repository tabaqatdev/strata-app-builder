/**
 * @strata/actions — a typed **data-action bus** so widgets and panels cross-drive each other, the way
 * ArcGIS Experience Builder's message/action framework and CARTO's widgets do: a widget emits a **trigger**
 * (a row selected, a category clicked, the extent changed) and any subscriber runs an **action** (filter the
 * map, zoom to a feature, view in table, recompute). Framework-agnostic; zero dependencies.
 */

export type StrataTriggerType =
  | "featureSelect"
  | "recordsChange"
  | "categorySelect"
  | "rangeSelect"
  | "brush"
  | "filterChange"
  | "extentChange"
  | "rowSelect"
  | "chartClick"
  | "hover"
  | "flash"
  | "search"
  | "clear"
  // Phase 2 (EB-parity): UI, lifecycle, sketch/map, and data-source triggers.
  | "buttonClick"
  | "timer"
  | "viewChange"
  | "pageChange"
  | "sketchComplete"
  | "mapClick"
  | "countChange";

/** Actions a subscriber (or a declarative connection) can run in response to a trigger. */
export type StrataActionType =
  | "filter"
  | "zoomTo"
  | "panTo"
  | "flash"
  | "viewInTable"
  | "showStatistics"
  | "export"
  | "setUrlParam"
  | "showHide"
  | "message"
  // Phase 2 (EB-parity): navigation, refresh, spatial select, write-back.
  | "navigate"
  | "refresh"
  | "selectByGeometry"
  | "updateRecord";

export interface StrataTrigger<P = unknown> {
  /** a known trigger type or any custom string. */
  type: StrataTriggerType | string;
  /** id of the widget/panel that emitted it (so subscribers can ignore their own echoes). */
  source?: string;
  payload: P;
}

export type ActionHandler<P = any> = (trigger: StrataTrigger<P>) => void;

// --- common payloads ---------------------------------------------------------------------------
/**
 * A feature selection.
 *
 * `oids` are **`number | string`** because an object id is whatever the service says it is: real
 * layers publish string keys, and one reports `objectIdFieldName: null` while carrying a usable id
 * column (`strata/docs/troubleshooting.md` §1). Coercing those to numbers addresses the wrong rows
 * with no error.
 *
 * An **empty `oids` is a release**, not a no-op — the widget that adopted this record has let it
 * go, and every sink should clear: drop the highlight, close the popup, restore the full population.
 */
export interface FeatureSelectPayload {
  layerId: string;
  oids: Array<number | string>;
  /** Fly the map to the record (not to its layer's extent). */
  zoom?: boolean;
  /** Open that record's popup on arrival; a release closes whatever popup is open. */
  popup?: boolean;
}
export interface CategorySelectPayload {
  layerId: string;
  field: string;
  /** the selected category value, or null to clear. */
  value: string | null;
}
export interface RangeSelectPayload {
  layerId: string;
  field: string;
  min: number | null;
  max: number | null;
}
export interface FilterChangePayload {
  layerId: string;
  where: string | null;
}
export interface ExtentChangePayload {
  bbox: [number, number, number, number];
}
/** A hovered/flashed feature (linked highlight across widgets). */
export interface HoverPayload {
  layerId: string;
  oids: Array<number | string>;
}
/** A widget publishing a derived record set others can consume (W2 output data sources). */
export interface RecordsChangePayload {
  /** the publishing widget's id (also the output-registry key). */
  widgetId: string;
  /** the derived records (a GeoJSON FeatureCollection or a plain attribute-row array). */
  records: unknown;
  /** optional originating layer, so consumers can still resolve fields/OIDs. */
  layerId?: string;
}
/** A human-readable message emitted for a `message` action. */
export interface MessagePayload {
  text: string;
  level?: "info" | "warn" | "error";
}

// --- Phase 2 payloads --------------------------------------------------------------------------
/** A UI element (button, menu item, list item) was activated. Carries only its optional value. */
export interface ButtonClickPayload {
  value?: string;
}
/** A timer tick (auto-refresh / live-dashboard driver). */
export interface TimerPayload {
  tick: number;
}
/** A `views` node switched its active view. */
export interface ViewChangePayload {
  viewId: string;
}
/** The app router navigated to a page. */
export interface PageChangePayload {
  pageId: string;
}
/** A sketch/measure interaction finished, yielding a GeoJSON geometry. */
export interface SketchCompletePayload {
  geometry: unknown;
}
/** An empty-map click at a lng/lat. */
export interface MapClickPayload {
  lngLat: [number, number];
}
/** A data source's filtered-record count changed (DS-level trigger; bridged from `@strata/data-source`). */
export interface CountChangePayload {
  sourceId: string;
  count: number;
}

/** A tiny typed pub/sub. */
export class ActionBus {
  private handlers = new Map<string, Set<ActionHandler>>();

  /** Subscribe; returns an unsubscribe function. Use type "*" to receive every trigger. */
  on<P = any>(type: StrataTriggerType | string, handler: ActionHandler<P>): () => void {
    let set = this.handlers.get(type);
    if (!set) this.handlers.set(type, (set = new Set()));
    set.add(handler as ActionHandler);
    return () => this.off(type, handler);
  }

  off(type: string, handler: ActionHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  emit<P = any>(trigger: StrataTrigger<P>): void {
    this.handlers.get(trigger.type)?.forEach((h) => h(trigger));
    this.handlers.get("*")?.forEach((h) => h(trigger));
  }

  clear(): void {
    this.handlers.clear();
  }
}

// --- data actions (W3) -------------------------------------------------------------------------

/** The selection a data action operates on. */
export interface DataActionContext {
  bus: ActionBus;
  selection: { layerId: string; oids: Array<number | string> };
}

/**
 * A pluggable **data action** — an entry in the menu surfaced on a feature/row selection (Zoom, Flash,
 * View-in-table, Export, …). `run` performs its effect by emitting a canonical trigger on the bus (tagged
 * `source:"data-action"` so it can't loop a connection), which the bus-aware sinks (map, table) honor.
 */
export interface DataAction {
  id: string;
  label: string;
  /** Optional single-glyph icon for compact menus. */
  icon?: string;
  run(ctx: DataActionContext): void;
}

/** The built-in data actions. Apps extend this list (or replace it) in a `DataActionMenu`. */
export const defaultDataActions: DataAction[] = [
  {
    id: "zoom",
    label: "Zoom to",
    icon: "⤢",
    run: ({ bus, selection }) =>
      bus.emit<FeatureSelectPayload>({
        type: "featureSelect",
        source: "data-action",
        payload: { ...selection, zoom: true },
      }),
  },
  {
    id: "flash",
    label: "Flash",
    icon: "✦",
    run: ({ bus, selection }) =>
      bus.emit<HoverPayload>({ type: "flash", source: "data-action", payload: selection }),
  },
  {
    id: "table",
    label: "View in table",
    icon: "▤",
    run: ({ bus, selection }) =>
      bus.emit<FeatureSelectPayload>({ type: "featureSelect", source: "data-action", payload: selection }),
  },
  {
    id: "export",
    label: "Export selection",
    icon: "⭳",
    run: ({ bus, selection }) => bus.emit({ type: "export", source: "data-action", payload: selection }),
  },
  {
    id: "clear",
    label: "Clear",
    icon: "✕",
    run: ({ bus }) => bus.emit({ type: "clear", source: "data-action", payload: {} }),
  },
];

/** Build an id→DataAction registry, letting apps override/extend the defaults. */
export function dataActionRegistry(extra: DataAction[] = []): Record<string, DataAction> {
  const map: Record<string, DataAction> = {};
  for (const a of [...defaultDataActions, ...extra]) map[a.id] = a;
  return map;
}

// --- output data sources (W2) ------------------------------------------------------------------

/**
 * A registry of **output data sources**: a widget publishes a derived record set under its id, and other
 * widgets consume it via `dataSource: { fromWidget: "<id>" }` (ExB's "use another widget's output"). This
 * unlocks Chart→Table→Map chains that don't route through the map. Framework-agnostic; the React binding
 * lives in `@strata/core-map`.
 */
export class OutputRegistry {
  private data = new Map<string, RecordsChangePayload>();
  private subs = new Map<string, Set<(p: RecordsChangePayload) => void>>();
  private anySubs = new Set<(p: RecordsChangePayload) => void>();

  /** Publish (or replace) the records a widget outputs; notifies subscribers. */
  publish(payload: RecordsChangePayload): void {
    this.data.set(payload.widgetId, payload);
    this.subs.get(payload.widgetId)?.forEach((f) => f(payload));
    this.anySubs.forEach((f) => f(payload));
  }

  /** The latest output for a widget id, or undefined if it has not published. */
  get(widgetId: string): RecordsChangePayload | undefined {
    return this.data.get(widgetId);
  }

  /** Subscribe to one widget's outputs; returns an unsubscribe. */
  subscribe(widgetId: string, fn: (p: RecordsChangePayload) => void): () => void {
    let set = this.subs.get(widgetId);
    if (!set) this.subs.set(widgetId, (set = new Set()));
    set.add(fn);
    return () => set!.delete(fn);
  }

  /** Subscribe to every widget's outputs; returns an unsubscribe. */
  subscribeAll(fn: (p: RecordsChangePayload) => void): () => void {
    this.anySubs.add(fn);
    return () => this.anySubs.delete(fn);
  }

  clear(): void {
    this.data.clear();
    this.subs.clear();
    this.anySubs.clear();
  }
}

/**
 * Bridge an output registry to the bus: every publish also emits a `recordsChange` trigger (so a widget can
 * react to outputs through the same bus it already listens on). Returns a teardown.
 */
export function connectOutputToBus(outputs: OutputRegistry, bus: ActionBus): () => void {
  return outputs.subscribeAll((payload) =>
    bus.emit<RecordsChangePayload>({ type: "recordsChange", source: payload.widgetId, payload }),
  );
}

/** Build a SQL `definitionExpression` from a category selection (null clears). */
export function categoryWhere(field: string, value: string | null): string | null {
  return value == null ? null : `${field} = '${value.replace(/'/g, "''")}'`;
}

/**
 * Derive a SQL `where` (a `definitionExpression`) from a filter-like trigger, so a `filter` action can be
 * wired declaratively without the connection restating the field. Returns `null` to clear the filter, or
 * `undefined` when the trigger carries nothing filterable.
 */
export function whereFromTrigger(trigger: StrataTrigger): string | null | undefined {
  switch (trigger.type) {
    case "categorySelect": {
      const p = trigger.payload as CategorySelectPayload;
      return categoryWhere(p.field, p.value);
    }
    case "rangeSelect":
    case "brush": {
      const p = trigger.payload as RangeSelectPayload;
      return rangeWhere(p.field, p.min, p.max);
    }
    case "filterChange": {
      const p = trigger.payload as FilterChangePayload;
      return p.where;
    }
    case "clear":
      return null;
    default:
      return undefined;
  }
}

/** Build a SQL range clause (null bounds are open). */
export function rangeWhere(field: string, min: number | null, max: number | null): string | null {
  const parts: string[] = [];
  if (min != null) parts.push(`${field} >= ${min}`);
  if (max != null) parts.push(`${field} <= ${max}`);
  return parts.length ? parts.join(" AND ") : null;
}

// --- declarative connections (W1) --------------------------------------------------------------

/**
 * A declarative cross-widget wire: "when `from` emits `trigger`, run `action` on `to`". Structurally
 * identical to `@strata/schema`'s `Connection` (kept local so this package stays dependency-free).
 */
export interface Connection {
  from: string;
  trigger: StrataTriggerType | string;
  to?: string;
  action: StrataActionType | string;
  options?: Record<string, unknown>;
}

/** The context handed to a dispatcher when a connection fires. */
export interface DispatchContext {
  connection: Connection;
  trigger: StrataTrigger;
}

/** A concrete implementation of one action (filter/zoomTo/flash/…), supplied by the host. */
export type ActionDispatcher = (ctx: DispatchContext) => void;

/**
 * Wire an `AppLayout.connections` array onto the bus (the W1 runtime). For each connection, subscribe to
 * its `trigger`; when the emitter matches `from` (echoes and unrelated sources are ignored), invoke the
 * host-provided `dispatch[action]`. The dispatchers hold the concrete effects (filter the layer, zoom the
 * map, publish to the URL) so this stays framework-agnostic. Returns a teardown.
 */
export function wireConnections(
  bus: ActionBus,
  connections: Connection[] | undefined,
  dispatch: Partial<Record<StrataActionType | string, ActionDispatcher>>,
): () => void {
  const offs = (connections ?? []).map((connection) =>
    bus.on(connection.trigger, (trigger) => {
      if (connection.from && trigger.source && trigger.source !== connection.from) return;
      const fn = dispatch[connection.action];
      if (fn) fn({ connection, trigger });
    }),
  );
  return () => offs.forEach((o) => o());
}

export interface StoreLike {
  getState: () => any;
}

/** Host effects the default dispatchers need beyond the store + bus. */
export interface DispatcherDeps {
  store?: StoreLike;
  bus: ActionBus;
  /** Show/hide a widget by id (for the `showHide` action). */
  setHidden?: (widgetId: string, hidden: boolean) => void;
  /** Surface a `message` action to the app (toast/log). */
  onMessage?: (m: MessagePayload) => void;
  /** Write a URL query param (for `setUrlParam`). */
  setUrlParam?: (key: string, value: string) => void;
  // --- Phase 2 host effects (all optional) ---
  /** Go to a page / switch a view / open a URL (for `navigate`). */
  onNavigate?: (target: { pageId?: string; viewId?: string; url?: string }) => void;
  /** Force a source/widget re-query (for `refresh`). */
  onRefresh?: (target: { sourceId?: string; widgetId?: string }) => void;
  /** Spatial-select a source using the trigger's geometry (for `selectByGeometry`). */
  onSelectByGeometry?: (arg: { sourceId?: string; geometry: unknown; predicate?: string }) => void;
  /** Write-back an edit to a source (for `updateRecord`; guarded by a writable ESRI backend). */
  onUpdateRecord?: (arg: { sourceId?: string; edits: unknown }) => void;
}

/** Best-effort scalar from a trigger payload, for `setUrlParam`. */
function valueFromTrigger(trigger: StrataTrigger): string {
  const p = trigger.payload as any;
  if (p == null) return "";
  if (typeof p.value === "string") return p.value;
  if (typeof p.where === "string") return p.where;
  if (Array.isArray(p.oids)) return p.oids.join(",");
  return "";
}

/**
 * The default action dispatchers for {@link wireConnections}. Store-expressible actions (`filter`,
 * `showHide`, `setUrlParam`, `message`) run their effect directly; selection/zoom/stats actions re-emit a
 * **canonical** trigger on the bus with `source:"wif"` so any bus-aware sink (map, table) reacts — and
 * because no connection's `from` is `"wif"`, this can't loop. Hosts pass a `store`, the `bus`, and the few
 * side-effect callbacks they own.
 */
export function defaultDispatchers(
  deps: DispatcherDeps,
): Partial<Record<StrataActionType | string, ActionDispatcher>> {
  const { store, bus } = deps;
  const targetLayer = (ctx: DispatchContext): string | undefined =>
    (ctx.connection.options?.layerId as string) ?? (ctx.trigger.payload as any)?.layerId;

  return {
    filter: (ctx) => {
      const where =
        (ctx.connection.options?.where as string | null | undefined) ?? whereFromTrigger(ctx.trigger);
      const layerId = targetLayer(ctx);
      if (layerId != null && store) store.getState().setDefinition?.(layerId, where ?? undefined);
      bus.emit<FilterChangePayload>({
        type: "filterChange",
        source: "wif",
        payload: { layerId: layerId ?? "", where: where ?? null },
      });
    },
    zoomTo: (ctx) => {
      const oids = (ctx.trigger.payload as any)?.oids ?? [];
      const layerId = targetLayer(ctx);
      if (layerId != null && store) store.getState().setSelection?.({ layerId, oids });
      bus.emit<FeatureSelectPayload>({
        type: "featureSelect",
        source: "wif",
        payload: { layerId: layerId ?? "", oids, zoom: true },
      });
    },
    panTo: (ctx) => {
      bus.emit({ type: "featureSelect", source: "wif", payload: { ...(ctx.trigger.payload as any), zoom: false } });
    },
    flash: (ctx) => {
      bus.emit<HoverPayload>({
        type: "flash",
        source: "wif",
        payload: { layerId: targetLayer(ctx) ?? "", oids: (ctx.trigger.payload as any)?.oids ?? [] },
      });
    },
    viewInTable: (ctx) => {
      bus.emit({ type: "featureSelect", source: "wif", payload: { ...(ctx.trigger.payload as any) } });
    },
    showStatistics: (ctx) => {
      bus.emit({ type: "extentChange", source: "wif", payload: ctx.trigger.payload as any });
    },
    setUrlParam: (ctx) => {
      const param = String(ctx.connection.options?.param ?? "");
      if (param) deps.setUrlParam?.(param, valueFromTrigger(ctx.trigger));
    },
    showHide: (ctx) => {
      if (!ctx.connection.to) return;
      const explicit = ctx.connection.options?.hidden;
      deps.setHidden?.(ctx.connection.to, typeof explicit === "boolean" ? explicit : true);
    },
    message: (ctx) => {
      deps.onMessage?.({
        text: String(ctx.connection.options?.text ?? valueFromTrigger(ctx.trigger)),
        level: (ctx.connection.options?.level as MessagePayload["level"]) ?? "info",
      });
    },
    // --- Phase 2 actions ---
    navigate: (ctx) => {
      const o = ctx.connection.options ?? {};
      deps.onNavigate?.({
        pageId: o.pageId as string | undefined,
        viewId: o.viewId as string | undefined,
        url: o.url as string | undefined,
      });
    },
    refresh: (ctx) => {
      const o = ctx.connection.options ?? {};
      deps.onRefresh?.({
        sourceId: o.sourceId as string | undefined,
        widgetId: (o.widgetId as string | undefined) ?? ctx.connection.to,
      });
    },
    selectByGeometry: (ctx) => {
      const geometry = (ctx.trigger.payload as any)?.geometry;
      deps.onSelectByGeometry?.({
        sourceId: ctx.connection.options?.sourceId as string | undefined,
        geometry,
        predicate: ctx.connection.options?.predicate as string | undefined,
      });
    },
    updateRecord: (ctx) => {
      deps.onUpdateRecord?.({
        sourceId: ctx.connection.options?.sourceId as string | undefined,
        edits: ctx.connection.options?.edits ?? (ctx.trigger.payload as any),
      });
    },
  };
}

export interface ConnectOptions {
  /** apply a `definitionExpression` to a layer + the live map (usually a `LayerRegistry`/StrataMap call). */
  onFilter?: (layerId: string, where: string | null) => void;
  /** zoom/highlight a set of features. */
  onSelect?: (layerId: string, oids: Array<number | string>, zoom?: boolean) => void;
}

/**
 * Wire the bus to a `@strata/state` store + the map: `categorySelect`/`rangeSelect` → filter the layer and
 * re-emit `filterChange` (so other widgets recompute); `featureSelect`/`rowSelect` → set the store selection
 * and highlight/zoom. Returns a teardown.
 */
export function connectBusToStore(bus: ActionBus, store: StoreLike, opts: ConnectOptions = {}): () => void {
  const offs: Array<() => void> = [];

  const doFilter = (layerId: string, where: string | null) => {
    opts.onFilter?.(layerId, where);
    store.getState().setActiveLayer?.(layerId);
    bus.emit<FilterChangePayload>({ type: "filterChange", source: "actions", payload: { layerId, where } });
  };

  offs.push(
    bus.on<CategorySelectPayload>("categorySelect", (t) =>
      doFilter(t.payload.layerId, categoryWhere(t.payload.field, t.payload.value))
    )
  );
  offs.push(
    bus.on<RangeSelectPayload>("rangeSelect", (t) =>
      doFilter(t.payload.layerId, rangeWhere(t.payload.field, t.payload.min, t.payload.max))
    )
  );
  const onSel = (t: StrataTrigger<FeatureSelectPayload>) => {
    store.getState().setSelection?.({ layerId: t.payload.layerId, oids: t.payload.oids });
    opts.onSelect?.(t.payload.layerId, t.payload.oids, t.payload.zoom);
  };
  offs.push(bus.on<FeatureSelectPayload>("featureSelect", onSel));
  offs.push(bus.on<FeatureSelectPayload>("rowSelect", onSel));
  offs.push(
    bus.on("clear", () => {
      store.getState().setSelection?.(null);
    })
  );

  return () => offs.forEach((o) => o());
}

// --- Phase 2: timer source + data-source count bridge ------------------------------------------

/**
 * A wall-clock ticker that emits a `timer` trigger on the bus every `intervalMs`. `<StrataApp>` mounts one
 * when a `timer` connection exists (live-dashboard / auto-refresh). Call `start()`/`stop()` to control it.
 */
export class TimerSource {
  private handle: ReturnType<typeof setInterval> | null = null;
  private tick = 0;
  private bus: ActionBus;
  private intervalMs: number;
  private sourceId: string;

  constructor(bus: ActionBus, intervalMs: number, sourceId = "timer") {
    this.bus = bus;
    this.intervalMs = intervalMs;
    this.sourceId = sourceId;
  }

  start(): void {
    if (this.handle != null) return;
    this.handle = setInterval(() => {
      this.tick += 1;
      this.bus.emit<TimerPayload>({ type: "timer", source: this.sourceId, payload: { tick: this.tick } });
    }, this.intervalMs);
  }

  stop(): void {
    if (this.handle != null) {
      clearInterval(this.handle);
      this.handle = null;
    }
  }
}

/** A minimal structural view of a `@strata/data-source` source — kept structural so this package stays dep-free. */
export interface CountEventSource {
  id: string;
  subscribe: (fn: (evt: { type: string; count?: number }) => void) => () => void;
}

/**
 * Bridge a `@strata/data-source` source's `countChange` events onto the bus as `countChange` triggers, so
 * connections can react to a filtered-count change (the DS-level trigger). Returns a teardown.
 */
export function connectSourceToBus(source: CountEventSource, bus: ActionBus): () => void {
  return source.subscribe((evt) => {
    if (evt.type === "countChange") {
      bus.emit<CountChangePayload>({
        type: "countChange",
        source: source.id,
        payload: { sourceId: source.id, count: evt.count ?? 0 },
      });
    }
  });
}
