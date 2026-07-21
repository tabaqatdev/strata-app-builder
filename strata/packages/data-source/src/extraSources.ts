/**
 * Phase 7 DataSource kinds — `file` (CSV / GeoJSON upload), `rest` (a GeoJSON URL / JSON API), and
 * `stream` (real-time: interval polling or pushed updates). All build on the same pure query/stats engine;
 * network and timers are injected so the sources stay unit-testable in Node.
 */
import type { Selection } from "@strata/state";
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

type Sub = (evt: DataSourceEvent) => void;

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

function schemaFromRows(rows: Row[]): FieldSchema[] {
  const first = rows[0];
  if (!first) return [];
  return Object.keys(first).map((k) => ({
    name: k,
    type: typeof first[k] === "number" ? "esriFieldTypeDouble" : "esriFieldTypeString",
  }));
}

// --- parsers -----------------------------------------------------------------------------------

/** Split one CSV line, honoring double-quoted fields (with `""` escapes). */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

/** Parse CSV text into rows; numeric-looking cells become numbers. First line is the header. */
export function parseCsv(text: string): Row[] {
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Row = {};
    headers.forEach((h, i) => {
      const raw = (cells[i] ?? "").trim();
      const n = Number(raw);
      row[h] = raw !== "" && !Number.isNaN(n) ? n : raw;
    });
    return row;
  });
}

/** Rows from a GeoJSON FeatureCollection (feature `properties`), or a plain row array. */
export function parseGeoJsonRows(json: unknown): Row[] {
  if (json && typeof json === "object" && (json as { type?: string }).type === "FeatureCollection") {
    const feats = (json as { features?: Array<{ properties?: Row }> }).features ?? [];
    return feats.map((f) => ({ ...(f.properties ?? {}) }));
  }
  return Array.isArray(json) ? (json as Row[]) : [];
}

// --- shared in-memory base ---------------------------------------------------------------------

/** Common in-memory selectable behavior for file/rest/stream (rows held locally). */
abstract class InMemorySource implements DataSource {
  abstract readonly id: string;
  abstract readonly kind: DataSourceKind;
  protected rows: Row[] = [];
  protected selection: Selection | null = null;
  protected emitter = new Emitter();

  protected setRows(rows: Row[]): void {
    const changed = rows.length !== this.rows.length;
    this.rows = rows;
    this.emitter.emit({ type: "refresh", sourceId: this.id });
    if (changed) this.emitter.emit({ type: "countChange", sourceId: this.id, count: rows.length });
  }

  async schema(): Promise<FieldSchema[]> {
    return schemaFromRows(this.rows);
  }
  async query(q: QuerySpec = {}): Promise<FeatureSet> {
    return { rows: applyWhere(this.rows, q.where), oidField: "OBJECTID" };
  }
  getSelection(): Selection | null {
    return this.selection;
  }
  setSelection(sel: Selection | null): void {
    this.selection = sel;
    this.emitter.emit({ type: "selectionChange", sourceId: this.id });
  }
  getFilteredView(): DataSourceView {
    return { rows: this.rows.slice() };
  }
  async getStatistics(defn: StatDefinition[]): Promise<StatResult> {
    return computeStatistics(this.rows, defn);
  }
  subscribe(fn: Sub): () => void {
    return this.emitter.subscribe(fn);
  }
}

let _seq = 0;
const nextId = (p: string): string => `${p}-${++_seq}`;

// --- file --------------------------------------------------------------------------------------

export interface FileDataSourceOptions {
  id?: string;
  rows?: Row[];
  csv?: string;
  geojson?: unknown;
}

/** A source seeded from an uploaded CSV or GeoJSON file. */
export class FileDataSource extends InMemorySource {
  readonly id: string;
  readonly kind: DataSourceKind = "file";
  constructor(opts: FileDataSourceOptions = {}) {
    super();
    this.id = opts.id ?? nextId("file");
    this.rows = opts.rows ?? (opts.csv != null ? parseCsv(opts.csv) : opts.geojson != null ? parseGeoJsonRows(opts.geojson) : []);
  }
  /** Replace the rows (e.g. a new file was chosen). */
  load(rows: Row[]): void {
    this.setRows(rows);
  }
}

// --- rest --------------------------------------------------------------------------------------

export type FetchLike = (url: string) => Promise<{ json: () => Promise<unknown> }>;

export interface RestDataSourceOptions {
  id?: string;
  url: string;
  /** Injected fetch (defaults to global `fetch`). */
  fetchFn?: FetchLike;
  /** Parse the response into rows (defaults to GeoJSON/array). */
  parse?: (json: unknown) => Row[];
}

/** A source backed by a GeoJSON URL / JSON API. `query`/`refresh` fetch and re-parse. */
export class RestDataSource extends InMemorySource {
  readonly id: string;
  readonly kind: DataSourceKind = "rest";
  private url: string;
  private fetchFn: FetchLike;
  private parse: (json: unknown) => Row[];

  constructor(opts: RestDataSourceOptions) {
    super();
    this.id = opts.id ?? nextId("rest");
    this.url = opts.url;
    this.fetchFn = opts.fetchFn ?? ((url: string) => fetch(url) as unknown as ReturnType<FetchLike>);
    this.parse = opts.parse ?? parseGeoJsonRows;
  }

  /** Fetch + parse, updating the cached rows. */
  async refresh(): Promise<void> {
    const res = await this.fetchFn(this.url);
    const json = await res.json();
    this.setRows(this.parse(json));
  }

  override async query(q: QuerySpec = {}): Promise<FeatureSet> {
    if (this.rows.length === 0) await this.refresh();
    return { rows: applyWhere(this.rows, q.where), oidField: "OBJECTID" };
  }
}

// --- stream ------------------------------------------------------------------------------------

export interface StreamDataSourceOptions {
  id?: string;
  /** Poll function invoked every `intervalMs` (real-time via polling). */
  poll?: () => Promise<Row[]> | Row[];
  intervalMs?: number;
}

/** A real-time source: poll on an interval, or receive pushed updates via `push` (websocket-style). */
export class StreamDataSource extends InMemorySource {
  readonly id: string;
  readonly kind: DataSourceKind = "stream";
  private poll?: () => Promise<Row[]> | Row[];
  private intervalMs: number;
  private handle: ReturnType<typeof setInterval> | null = null;

  constructor(opts: StreamDataSourceOptions = {}) {
    super();
    this.id = opts.id ?? nextId("stream");
    this.poll = opts.poll;
    this.intervalMs = opts.intervalMs ?? 5000;
  }

  /** Feed new rows (e.g. a websocket message). */
  push(rows: Row[]): void {
    this.setRows(rows);
  }

  private async tick(): Promise<void> {
    if (this.poll) this.setRows(await this.poll());
  }

  start(): void {
    if (this.handle != null || !this.poll) return;
    void this.tick();
    this.handle = setInterval(() => void this.tick(), this.intervalMs);
  }

  stop(): void {
    if (this.handle != null) {
      clearInterval(this.handle);
      this.handle = null;
    }
  }
}
