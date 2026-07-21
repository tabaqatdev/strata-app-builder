/**
 * @strata/data-source — the first-class DataSource contract.
 *
 * A `DataSource` decouples widgets from physical layers: it owns its own schema, query, selection,
 * filtered view, and statistics. Widgets bind to a source id; selecting/filtering in one widget flows to
 * every other widget bound to the same source — the "any widget drives any widget" property EB gets from
 * `jimu-data`. `Selection` is reused from `@strata/state` (a set of OBJECTIDs within one layer).
 */
import type { Selection } from "@strata/state";

export type { Selection };

/** What a source is backed by. */
export type DataSourceKind =
  | "feature-layer"
  | "web-map"
  | "output"
  | "statistics"
  | "geometry"
  // Phase 7 kinds:
  | "file"
  | "rest"
  | "stream";

/** A field descriptor (mirrors the ArcGIS REST `fields[]` shape, kept minimal). */
export interface FieldSchema {
  name: string;
  type: string;
  alias?: string;
}

/** A plain attribute row. */
export type Row = Record<string, unknown>;

/** The result of a query: rows plus the schema needed to interpret them. */
export interface FeatureSet {
  rows: Row[];
  fields?: FieldSchema[];
  oidField?: string;
}

/** A query against a source. All fields optional; an empty query returns the filtered view. */
export interface QuerySpec {
  where?: string;
  outFields?: string[];
  /** A GeoJSON geometry for spatial filters (used by `GeometryDataSource`-driven predicates). */
  geometry?: unknown;
  orderBy?: string;
  page?: { offset: number; size: number };
}

/** One aggregate to compute. `groupBy` produces one row per distinct group value. */
export interface StatDefinition {
  field: string;
  op: "count" | "sum" | "avg" | "min" | "max";
  groupBy?: string;
  alias?: string;
}

/** The result of `getStatistics`: one row per group (or a single row when no `groupBy`). */
export interface StatResult {
  rows: Row[];
}

/** The current filtered view of a source: the active `where` and the rows it selects. */
export interface DataSourceView {
  where?: string;
  rows: Row[];
}

export type DataSourceEventType =
  | "refresh"
  | "selectionChange"
  | "filterChange"
  | "countChange";

/** An event a source emits to its subscribers. `count` is set on `countChange`. */
export interface DataSourceEvent {
  type: DataSourceEventType;
  sourceId: string;
  count?: number;
}

/**
 * The unified contract every widget binds to. Selection, filter, and statistics are properties of the
 * SOURCE, not of a layer — that is the whole point.
 */
export interface DataSource {
  readonly id: string;
  readonly kind: DataSourceKind;
  /** Fields + types + aliases. */
  schema(): Promise<FieldSchema[]>;
  /** Run a query (where / outFields / geometry / orderBy / page). Empty query = the filtered view. */
  query(q?: QuerySpec): Promise<FeatureSet>;
  /** The current selection (OBJECTIDs) — a property of the source. */
  getSelection(): Selection | null;
  setSelection(sel: Selection | null): void;
  /** The rows the current `definitionExpression`/filter selects. */
  getFilteredView(): DataSourceView;
  /** Aggregates (count/sum/avg/min/max, optional group-by) over the filtered view. */
  getStatistics(defn: StatDefinition[]): Promise<StatResult>;
  /** Subscribe to refresh / selectionChange / filterChange / countChange. Returns an unsubscribe. */
  subscribe(fn: (evt: DataSourceEvent) => void): () => void;
}
