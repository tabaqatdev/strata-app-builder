/**
 * DataSource implementations.
 *
 * - `FeatureLayerDataSource` — wraps one `layers.json` layer + the Zustand store (the back-compat bridge:
 *   selection → `store.setSelection`, filter → the layer's `definitionExpression`).
 * - `OutputDataSource` — wraps a widget's `OutputRegistry` output (`dataSource.fromWidget`).
 * - `StatisticsDataSource` — rows ARE the aggregate result of another source (drives KPI/gauge/chart).
 * - `GeometryDataSource` — holds a sketch/buffer geometry (feeds spatial filters).
 * - `WebMapDataSource` — a source over a whole `layers.json` (multi-layer; picks a layer at runtime).
 */
import type { EsriField, LayersJson, OperationalLayer } from "@strata/schema";
import type { StrataStore, Selection } from "@strata/state";
import type { OutputRegistry } from "@strata/actions";
import type {
  DataSource,
  DataSourceEvent,
  DataSourceKind,
  DataSourceView,
  FeatureSet,
  FieldSchema,
  QuerySpec,
  Row,
  StatDefinition,
  StatResult,
} from "./types.js";
import { applyWhere, computeStatistics } from "./query.js";

let _seq = 0;
const nextId = (prefix: string): string => `${prefix}-${++_seq}`;

type Sub = (evt: DataSourceEvent) => void;

/** A tiny local emitter shared by the implementations. */
class Emitter {
  private subs = new Set<Sub>();
  subscribe(fn: Sub): () => void {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  }
  emit(evt: DataSourceEvent): void {
    for (const fn of this.subs) fn(evt);
  }
}

function fieldSchema(fields?: EsriField[], rows?: Row[]): FieldSchema[] {
  if (fields?.length) return fields.map((f) => ({ name: f.name, type: f.type, alias: f.alias }));
  const first = rows?.[0];
  if (!first) return [];
  return Object.keys(first).map((k) => ({
    name: k,
    type: typeof first[k] === "number" ? "esriFieldTypeDouble" : "esriFieldTypeString",
  }));
}

function project(rows: Row[], outFields?: string[]): Row[] {
  if (!outFields || outFields.length === 0 || outFields.includes("*")) return rows;
  return rows.map((r) => {
    const o: Row = {};
    for (const f of outFields) o[f] = r[f];
    return o;
  });
}

function order(rows: Row[], orderBy?: string): Row[] {
  if (!orderBy) return rows;
  const [field, dir] = orderBy.trim().split(/\s+/);
  const sign = /desc/i.test(dir ?? "") ? -1 : 1;
  return rows.slice().sort((a, b) => {
    const av = a[field] as never;
    const bv = b[field] as never;
    if (av < bv) return -1 * sign;
    if (av > bv) return 1 * sign;
    return 0;
  });
}

function paginate(rows: Row[], page?: { offset: number; size: number }): Row[] {
  if (!page) return rows;
  return rows.slice(page.offset, page.offset + page.size);
}

export type QueryFn = (q: QuerySpec, where?: string) => Promise<FeatureSet>;

export interface FeatureLayerDataSourceOptions {
  id?: string;
  layerId: string;
  store: StrataStore;
  /** In-memory backing rows (GeoJSON-derived attribute rows). Optional when `queryFn` is set. */
  rows?: Row[];
  /** Network path: delegate `query` to a real backend (advancedQuery / feature-arcgis). */
  queryFn?: QueryFn;
  /** Field descriptors when the layer carries none in `layerDefinition.fields`. */
  fields?: EsriField[];
}

/** Wraps one operational layer + the store. Selection and filter round-trip through the store. */
export class FeatureLayerDataSource implements DataSource {
  readonly id: string;
  readonly kind: DataSourceKind = "feature-layer";
  private layerId: string;
  private store: StrataStore;
  private rows: Row[];
  private queryFn?: QueryFn;
  private fields?: EsriField[];
  private emitter = new Emitter();

  constructor(opts: FeatureLayerDataSourceOptions) {
    this.id = opts.id ?? opts.layerId ?? nextId("feature-layer");
    this.layerId = opts.layerId;
    this.store = opts.store;
    this.rows = opts.rows ?? [];
    this.queryFn = opts.queryFn;
    this.fields = opts.fields;
    this.wireStore();
  }

  private layer(): OperationalLayer | undefined {
    return this.store.getState().layers.find((l) => l.id === this.layerId);
  }

  private currentWhere(): string | undefined {
    return this.layer()?.layerDefinition?.definitionExpression;
  }

  private wireStore(): void {
    let prevWhere = this.currentWhere();
    let prevSel = this.store.getState().selection;
    let prevCount = this.getFilteredView().rows.length;
    this.store.subscribe((state) => {
      const where = this.layer()?.layerDefinition?.definitionExpression;
      if (where !== prevWhere) {
        prevWhere = where;
        this.emitter.emit({ type: "filterChange", sourceId: this.id });
        const count = this.getFilteredView().rows.length;
        if (count !== prevCount) {
          prevCount = count;
          this.emitter.emit({ type: "countChange", sourceId: this.id, count });
        }
      }
      const sel = state.selection;
      if (sel !== prevSel) {
        prevSel = sel;
        this.emitter.emit({ type: "selectionChange", sourceId: this.id });
      }
    });
  }

  async schema(): Promise<FieldSchema[]> {
    return fieldSchema(this.layer()?.layerDefinition?.fields ?? this.fields, this.rows);
  }

  async query(q: QuerySpec = {}): Promise<FeatureSet> {
    const where = q.where ?? this.currentWhere();
    if (this.queryFn) return this.queryFn(q, where);
    let rows = applyWhere(this.rows, where);
    rows = order(rows, q.orderBy);
    rows = project(rows, q.outFields);
    rows = paginate(rows, q.page);
    return { rows, fields: await this.schema(), oidField: "OBJECTID" };
  }

  getSelection(): Selection | null {
    const sel = this.store.getState().selection;
    return sel && sel.layerId === this.layerId ? sel : null;
  }

  setSelection(sel: Selection | null): void {
    this.store.getState().setSelection(sel);
  }

  getFilteredView(): DataSourceView {
    const where = this.currentWhere();
    return { where, rows: applyWhere(this.rows, where) };
  }

  async getStatistics(defn: StatDefinition[]): Promise<StatResult> {
    return computeStatistics(this.getFilteredView().rows, defn);
  }

  subscribe(fn: Sub): () => void {
    return this.emitter.subscribe(fn);
  }

  /** Force a refresh event (e.g. after a `refreshIntervalSeconds` re-query). */
  refresh(rows?: Row[]): void {
    if (rows) this.rows = rows;
    this.emitter.emit({ type: "refresh", sourceId: this.id });
  }
}

/** Normalize a widget's published `records` (a FeatureCollection or a row array) to plain rows. */
export function recordsToRows(records: unknown): Row[] {
  if (Array.isArray(records)) return records as Row[];
  if (records && typeof records === "object" && (records as { type?: string }).type === "FeatureCollection") {
    const feats = (records as { features?: Array<{ properties?: Row }> }).features ?? [];
    return feats.map((f) => ({ ...(f.properties ?? {}) }));
  }
  return [];
}

export interface OutputDataSourceOptions {
  id?: string;
  widgetId: string;
  outputs: OutputRegistry;
  layerId?: string;
}

/** Wraps a widget's output (`dataSource.fromWidget`) as a first-class source. */
export class OutputDataSource implements DataSource {
  readonly id: string;
  readonly kind: DataSourceKind = "output";
  private widgetId: string;
  private outputs: OutputRegistry;
  private layerId?: string;
  private selection: Selection | null = null;
  private emitter = new Emitter();

  constructor(opts: OutputDataSourceOptions) {
    this.id = opts.id ?? opts.widgetId ?? nextId("output");
    this.widgetId = opts.widgetId;
    this.outputs = opts.outputs;
    this.layerId = opts.layerId;
    let prevCount = this.rows().length;
    this.outputs.subscribe(this.widgetId, () => {
      this.emitter.emit({ type: "refresh", sourceId: this.id });
      const count = this.rows().length;
      if (count !== prevCount) {
        prevCount = count;
        this.emitter.emit({ type: "countChange", sourceId: this.id, count });
      }
    });
  }

  private rows(): Row[] {
    return recordsToRows(this.outputs.get(this.widgetId)?.records);
  }

  async schema(): Promise<FieldSchema[]> {
    return fieldSchema(undefined, this.rows());
  }

  async query(q: QuerySpec = {}): Promise<FeatureSet> {
    let rows = applyWhere(this.rows(), q.where);
    rows = order(rows, q.orderBy);
    rows = project(rows, q.outFields);
    rows = paginate(rows, q.page);
    return { rows, oidField: "OBJECTID" };
  }

  getSelection(): Selection | null {
    return this.selection;
  }

  setSelection(sel: Selection | null): void {
    this.selection = sel;
    this.emitter.emit({ type: "selectionChange", sourceId: this.id });
  }

  getFilteredView(): DataSourceView {
    return { rows: this.rows() };
  }

  async getStatistics(defn: StatDefinition[]): Promise<StatResult> {
    return computeStatistics(this.rows(), defn);
  }

  subscribe(fn: Sub): () => void {
    return this.emitter.subscribe(fn);
  }
}

export interface StatisticsDataSourceOptions {
  id?: string;
  source: DataSource;
  defs: StatDefinition[];
}

/** A source whose rows ARE the statistics of another source. Recomputes when the base source changes. */
export class StatisticsDataSource implements DataSource {
  readonly id: string;
  readonly kind: DataSourceKind = "statistics";
  private source: DataSource;
  private defs: StatDefinition[];
  private cache: Row[] = [];
  private emitter = new Emitter();

  constructor(opts: StatisticsDataSourceOptions) {
    this.id = opts.id ?? nextId("statistics");
    this.source = opts.source;
    this.defs = opts.defs;
    void this.recompute();
    this.source.subscribe(() => void this.recompute());
  }

  private async recompute(): Promise<void> {
    const res = await this.source.getStatistics(this.defs);
    this.cache = res.rows;
    this.emitter.emit({ type: "refresh", sourceId: this.id });
    this.emitter.emit({ type: "countChange", sourceId: this.id, count: this.cache.length });
  }

  async schema(): Promise<FieldSchema[]> {
    return fieldSchema(undefined, this.cache);
  }

  async query(): Promise<FeatureSet> {
    return { rows: this.cache };
  }

  getSelection(): Selection | null {
    return null;
  }

  setSelection(): void {
    /* statistics sources are not selectable */
  }

  getFilteredView(): DataSourceView {
    return { rows: this.cache };
  }

  async getStatistics(defn: StatDefinition[]): Promise<StatResult> {
    return computeStatistics(this.cache, defn);
  }

  subscribe(fn: Sub): () => void {
    return this.emitter.subscribe(fn);
  }
}

export interface GeometryDataSourceOptions {
  id?: string;
  geometry?: unknown;
}

/** Holds a sketch/buffer geometry (GeoJSON). Feeds spatial filters (`selectByGeometry` in Phase 2). */
export class GeometryDataSource implements DataSource {
  readonly id: string;
  readonly kind: DataSourceKind = "geometry";
  private geometry: unknown;
  private emitter = new Emitter();

  constructor(opts: GeometryDataSourceOptions = {}) {
    this.id = opts.id ?? nextId("geometry");
    this.geometry = opts.geometry;
  }

  getGeometry(): unknown {
    return this.geometry;
  }

  setGeometry(geometry: unknown): void {
    this.geometry = geometry;
    this.emitter.emit({ type: "refresh", sourceId: this.id });
  }

  async schema(): Promise<FieldSchema[]> {
    return [];
  }

  async query(): Promise<FeatureSet> {
    return { rows: this.geometry ? [{ geometry: this.geometry }] : [] };
  }

  getSelection(): Selection | null {
    return null;
  }

  setSelection(): void {
    /* geometry sources are not selectable */
  }

  getFilteredView(): DataSourceView {
    return { rows: this.geometry ? [{ geometry: this.geometry }] : [] };
  }

  async getStatistics(): Promise<StatResult> {
    return { rows: [] };
  }

  subscribe(fn: Sub): () => void {
    return this.emitter.subscribe(fn);
  }
}

export interface WebMapDataSourceOptions {
  id?: string;
  layersJson: LayersJson;
  store: StrataStore;
}

/** A source over a whole `layers.json`; delegates to a per-layer `FeatureLayerDataSource` chosen at runtime. */
export class WebMapDataSource implements DataSource {
  readonly id: string;
  readonly kind: DataSourceKind = "web-map";
  private store: StrataStore;
  private children = new Map<string, FeatureLayerDataSource>();
  private ids: string[];
  private active: string;

  constructor(opts: WebMapDataSourceOptions) {
    this.id = opts.id ?? nextId("web-map");
    this.store = opts.store;
    this.ids = (opts.layersJson.operationalLayers ?? []).map((l) => l.id);
    this.active = this.ids[0] ?? "";
  }

  layerIds(): string[] {
    return this.ids.slice();
  }

  /** Get (or lazily create) the child feature-layer source for a layer id. */
  layer(layerId: string): FeatureLayerDataSource {
    let child = this.children.get(layerId);
    if (!child) {
      child = new FeatureLayerDataSource({ layerId, store: this.store });
      this.children.set(layerId, child);
    }
    return child;
  }

  /** Choose which layer this source delegates to. */
  setActiveLayer(layerId: string): void {
    if (this.ids.includes(layerId)) this.active = layerId;
  }

  private delegate(): FeatureLayerDataSource {
    return this.layer(this.active);
  }

  schema(): Promise<FieldSchema[]> {
    return this.delegate().schema();
  }
  query(q?: QuerySpec): Promise<FeatureSet> {
    return this.delegate().query(q);
  }
  getSelection(): Selection | null {
    return this.delegate().getSelection();
  }
  setSelection(sel: Selection | null): void {
    this.delegate().setSelection(sel);
  }
  getFilteredView(): DataSourceView {
    return this.delegate().getFilteredView();
  }
  getStatistics(defn: StatDefinition[]): Promise<StatResult> {
    return this.delegate().getStatistics(defn);
  }
  subscribe(fn: Sub): () => void {
    return this.delegate().subscribe(fn);
  }
}
