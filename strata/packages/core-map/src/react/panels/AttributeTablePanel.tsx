/**
 * AttributeTablePanel — feature-service / attribute table management (MIT).
 *
 * A lightweight, dependency-free table: sortable headers, a per-column text filter
 * row, a show/hide column menu, row-click selection (delegated to `onRowSelect(oid)`
 * so the app highlights + zooms on the live map), and a CSV export built inline.
 * `onExport` is exposed for richer GeoJSON/GeoParquet export handled by the app.
 *
 * Virtualization note: rows are a fixed ~40px tall inside a scroll container with an
 * explicit max height, so a windowing lib (react-window / TanStack Virtual) can be
 * dropped in later without changing the row markup. TanStack Table / Tabulator can
 * likewise replace the sort/filter logic below — kept inline to avoid a hard dep.
 *
 * Layout: renders inside a PanelShell, so it can be `mode="fixed"` (docked, default) or
 * `mode="floating"` (draggable overlay). A "Show metadata" context-menu item opens the
 * table's Feature Service URL (`onShowMetadata` else `window.open`).
 */
import React, { useMemo, useState } from "react";
import type { DataSource } from "@strata/data-source";
export const ATTR_VIRTUALIZE_THRESHOLD = 150;
import { PanelShell, type PanelMode, type PanelMenuItem } from "./PanelShell.js";
import { useDataSource } from "../app/interactivity.js";

export interface AttributeTablePanelProps {
  title?: string;
  /** Explicit column order; inferred from the first rows when omitted. */
  columns?: string[];
  /** The rows to show. Optional when a `source` is bound — the rows then come from its filtered view. */
  rows?: Record<string, unknown>[];
  /**
   * A first-class DataSource (Phase 1). When bound (and `rows` is omitted), the table shows the source's
   * live filtered view and a row click selects into the source — so it links to every widget sharing it.
   */
  source?: DataSource;
  /** field name -> human alias for headers. */
  fieldAliases?: Record<string, string>;
  /** The OBJECTID field name (defaults to "OBJECTID"). */
  oidField?: string;
  /** Called with the row's OID on row click (highlight + zoom on the map). */
  onRowSelect?: (oid: number | string) => void;
  /** the layer id these rows belong to (for the actions bus payload). */
  layerId?: string;
  /** optional `@strata/actions` ActionBus — a row click also emits a `rowSelect` trigger. */
  bus?: { emit: (t: { type: string; source?: string; payload: unknown }) => void };
  /** App-handled export for formats beyond the built-ins (e.g. "geoparquet"). */
  onExport?: (format: string) => void;
  /**
   * Per-row geometry accessor for the built-in **GeoJSON export**. When omitted, exported features have
   * null geometry (attributes only). Return a GeoJSON `Geometry` (or undefined).
   */
  geometry?: (row: Record<string, unknown>) => unknown;
  /**
   * Server-side paging (WIF/#5). When `onPageChange` is provided, the panel shows pager controls and calls
   * it with the next `resultOffset`/`resultRecordCount`; wire it to `queryFeatures`. `total` is the full
   * server count (for "X–Y of total"); `rows` are just the current page. Omit for all-client-side rows.
   */
  page?: { offset: number; pageSize: number; total?: number };
  onPageChange?: (offset: number, pageSize: number) => void;
  /**
   * Row windowing. Auto-enables past ~150 rows (renders only the visible window — dependency-free
   * virtualization). Set explicitly to force on/off. `viewportHeight` sizes the window (default 400).
   */
  virtualize?: boolean;
  viewportHeight?: number;
  /** The layer/table Feature Service URL, used by the "Show metadata" action. */
  serviceUrl?: string;
  /** "Show metadata" action — falls back to `window.open` when omitted. */
  onShowMetadata?: (url: string) => void;
  /** Layout mode passed through to PanelShell. Defaults to "fixed". */
  mode?: PanelMode;
  /** Convenience alias for `mode="floating"`. */
  floating?: boolean;
  /** Floating-mode placement / sizing (forwarded to PanelShell). */
  initialX?: number;
  initialY?: number;
  defaultWidth?: number;
  /** Close the panel (floating × button and "Remove" menu item). */
  onClose?: () => void;
  /** "Open" menu item. */
  onOpen?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

type SortDir = "asc" | "desc";

/** Infer column keys from the union of keys across the first ~50 rows. */
function inferColumns(rows: Record<string, unknown>[]): string[] {
  const seen = new Set<string>();
  for (const row of rows.slice(0, 50)) for (const k of Object.keys(row)) seen.add(k);
  return [...seen];
}

/** Render a cell value as a string (dates/objects stringified defensively). */
function toText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** Escape one CSV field per RFC 4180. */
function csvField(v: unknown): string {
  const s = toText(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build CSV text from columns + rows. */
function toCsv(columns: string[], rows: Record<string, unknown>[]): string {
  const head = columns.map(csvField).join(",");
  const body = rows.map((r) => columns.map((c) => csvField(r[c])).join(",")).join("\n");
  return `${head}\n${body}`;
}

/** Build a GeoJSON FeatureCollection from visible columns + rows (geometry via the accessor, else null). */
export function toGeoJson(
  columns: string[],
  rows: Record<string, unknown>[],
  geometry?: (row: Record<string, unknown>) => unknown,
): string {
  const features = rows.map((r) => {
    const properties: Record<string, unknown> = {};
    for (const c of columns) properties[c] = r[c];
    return { type: "Feature", properties, geometry: (geometry?.(r) ?? null) as unknown };
  });
  return JSON.stringify({ type: "FeatureCollection", features });
}

/** Trigger a browser download of `text` as a file (no-op outside the browser). */
function download(filename: string, text: string, mime = "text/csv"): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AttributeTablePanel(props: AttributeTablePanelProps): React.ReactElement {
  const { fieldAliases = {}, oidField = "OBJECTID", onRowSelect, onExport } = props;

  // Phase 1: re-render on source events and read the live filtered view when no explicit `rows` are given.
  useDataSource(props.source);
  const rows = props.rows ?? props.source?.getFilteredView().rows ?? [];

  const allColumns = useMemo(
    () => props.columns ?? inferColumns(rows),
    [props.columns, rows],
  );

  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [menuOpen, setMenuOpen] = useState(false);
  // The adopted row. Held here so the row can be released by clicking it again, and so the table
  // shows *which* record the map is flying to — a selection with no visible anchor reads as a bug.
  const [selectedOid, setSelectedOid] = useState<number | string | null>(null);

  const columns = useMemo(() => allColumns.filter((c) => !hidden[c]), [allColumns, hidden]);

  const view = useMemo(() => {
    let out = rows;
    // Per-column case-insensitive substring filters.
    const active = Object.entries(filters).filter(([, v]) => v.trim() !== "");
    if (active.length) {
      out = out.filter((row) =>
        active.every(([col, q]) => toText(row[col]).toLowerCase().includes(q.toLowerCase())),
      );
    }
    if (sortKey) {
      const key = sortKey;
      const dir = sortDir === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        // Numeric compare when both parse as finite numbers, else locale string compare.
        const an = typeof av === "number" ? av : Number(av);
        const bn = typeof bv === "number" ? bv : Number(bv);
        if (Number.isFinite(an) && Number.isFinite(bn)) return (an - bn) * dir;
        return toText(av).localeCompare(toText(bv)) * dir;
      });
    }
    return out;
  }, [rows, filters, sortKey, sortDir]);

  const toggleSort = (col: string): void => {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir("asc");
    }
  };

  const exportCsv = (): void => {
    download(`${props.title || "table"}.csv`, toCsv(columns, view));
  };

  const exportGeoJson = (): void => {
    download(`${props.title || "table"}.geojson`, toGeoJson(columns, view, props.geometry), "application/geo+json");
  };

  const exportTsv = (): void => {
    const head = columns.join("\t");
    const body = view.map((r) => columns.map((c) => String(r[c] ?? "").replace(/[\t\n\r]/g, " ")).join("\t")).join("\n");
    download(`${props.title || "table"}.tsv`, `${head}\n${body}`, "text/tab-separated-values");
  };

  const exportJson = (): void => {
    const out = view.map((r) => Object.fromEntries(columns.map((c) => [c, r[c]])));
    download(`${props.title || "table"}.json`, JSON.stringify(out, null, 2), "application/json");
  };

  // Dependency-free row windowing: past the threshold (or when forced), render only the visible window.
  const virtualize = props.virtualize ?? view.length > ATTR_VIRTUALIZE_THRESHOLD;
  const viewportHeight = props.viewportHeight ?? 400;
  const [scrollTop, setScrollTop] = useState(0);
  const overscan = 8;
  const windowStart = virtualize ? Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - overscan) : 0;
  const windowEnd = virtualize
    ? Math.min(view.length, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + overscan)
    : view.length;
  const windowRows = virtualize ? view.slice(windowStart, windowEnd) : view;
  const topPad = windowStart * ROW_HEIGHT;
  const bottomPad = Math.max(0, (view.length - windowEnd) * ROW_HEIGHT);

  const label = (c: string): string => fieldAliases[c] ?? c;

  const showMetadata = (): void => {
    const url = props.serviceUrl;
    if (!url) return;
    if (props.onShowMetadata) props.onShowMetadata(url);
    else if (typeof window !== "undefined") window.open(url, "_blank", "noopener");
  };

  const contextMenuItems: PanelMenuItem[] = props.serviceUrl
    ? [{ label: "Show metadata", onSelect: showMetadata }]
    : [];

  return (
    <PanelShell
      title={props.title ?? "Attributes"}
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth}
      onClose={props.onClose}
      onOpen={props.onOpen}
      contextMenuItems={contextMenuItems}
      className={props.className}
      style={{ ...panelStyle, ...props.style }}
    >
      <div style={headerBarStyle}>
        <span style={countStyle}>
          {props.page?.total != null ? `${view.length} shown · ${props.page.total} total` : `${view.length} / ${rows.length}`}
        </span>
        {props.serviceUrl && (
          <button style={toolBtnStyle} onClick={showMetadata}>
            Show metadata
          </button>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative" }}>
          <button style={toolBtnStyle} onClick={() => setMenuOpen((o) => !o)}>
            Columns ▾
          </button>
          {menuOpen && (
            <div style={menuStyle}>
              {allColumns.map((c) => (
                <label key={c} style={menuItemStyle}>
                  <input
                    type="checkbox"
                    checked={!hidden[c]}
                    onChange={(e) => setHidden((s) => ({ ...s, [c]: !e.target.checked }))}
                  />
                  {label(c)}
                </label>
              ))}
            </div>
          )}
        </div>
        <button style={toolBtnStyle} onClick={exportCsv}>
          Export CSV
        </button>
        <button style={toolBtnStyle} onClick={exportTsv}>
          TSV
        </button>
        <button style={toolBtnStyle} onClick={exportJson}>
          JSON
        </button>
        <button style={toolBtnStyle} onClick={exportGeoJson}>
          GeoJSON
        </button>
        {onExport && (
          <>
            <button style={toolBtnStyle} onClick={() => onExport("geoparquet")}>
              GeoParquet
            </button>
          </>
        )}
      </div>

      <div
        style={virtualize ? { ...scrollStyle, maxHeight: viewportHeight } : scrollStyle}
        onScroll={virtualize ? (e) => setScrollTop((e.target as HTMLDivElement).scrollTop) : undefined}
      >
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} style={thStyle} onClick={() => toggleSort(c)} title="Click to sort">
                  {label(c)}
                  {sortKey === c ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
            <tr>
              {columns.map((c) => (
                <th key={c} style={filterThStyle}>
                  <input
                    value={filters[c] ?? ""}
                    placeholder="Filter…"
                    style={filterInputStyle}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setFilters((s) => ({ ...s, [c]: e.target.value }))}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topPad > 0 && (
              <tr aria-hidden style={{ height: topPad }}>
                <td colSpan={Math.max(1, columns.length)} style={{ padding: 0, border: 0 }} />
              </tr>
            )}
            {windowRows.map((row, i) => {
              const oid = (row[oidField] as number | string | undefined) ?? windowStart + i;
              const isSelected = selectedOid != null && String(selectedOid) === String(oid);
              return (
                <tr
                  key={String(oid)}
                  style={{ ...trStyle, ...(isSelected ? trSelectedStyle : null) }}
                  data-oid={String(oid)}
                  aria-selected={isSelected}
                  onClick={() => {
                    // A row is a toggle. Clicking the selected row again releases it — whatever
                    // adopts must also release, with the same gesture that adopted it, or a user
                    // who selected by accident has no way back to the whole population.
                    const next = isSelected ? null : oid;
                    setSelectedOid(next);
                    onRowSelect?.(oid);
                    const oids = next == null ? [] : [next];
                    props.bus?.emit({
                      type: "rowSelect",
                      source: "table",
                      payload: { layerId: props.layerId ?? "", oids, zoom: next != null, popup: next != null },
                    });
                    // Also select into the bound source so linked widgets react — and clear it on release.
                    props.source?.setSelection({ layerId: props.layerId ?? "", oids });
                  }}
                >
                  {columns.map((c) => (
                    <td key={c} style={tdStyle} title={toText(row[c])}>
                      {toText(row[c])}
                    </td>
                  ))}
                </tr>
              );
            })}
            {bottomPad > 0 && (
              <tr aria-hidden style={{ height: bottomPad }}>
                <td colSpan={Math.max(1, columns.length)} style={{ padding: 0, border: 0 }} />
              </tr>
            )}
            {view.length === 0 && (
              <tr>
                <td style={{ ...tdStyle, color: "#999" }} colSpan={Math.max(1, columns.length)}>
                  No matching rows.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {props.onPageChange && props.page && (
        <div style={pagerStyle}>
          <button
            style={toolBtnStyle}
            disabled={props.page.offset <= 0}
            onClick={() => props.onPageChange!(Math.max(0, props.page!.offset - props.page!.pageSize), props.page!.pageSize)}
          >
            ‹ Prev
          </button>
          <span style={countStyle}>
            {props.page.offset + 1}–{props.page.offset + view.length}
            {props.page.total != null ? ` of ${props.page.total}` : ""}
          </span>
          <button
            style={toolBtnStyle}
            disabled={props.page.total != null && props.page.offset + props.page.pageSize >= props.page.total}
            onClick={() => props.onPageChange!(props.page!.offset + props.page!.pageSize, props.page!.pageSize)}
          >
            Next ›
          </button>
        </div>
      )}
    </PanelShell>
  );
}

export default AttributeTablePanel;

// --- inline styles ---------------------------------------------------------
const ROW_HEIGHT = 40; // fixed row height for future virtualization windows.
// PanelShell supplies the card chrome (border, radius, font); this keeps the table's
// scroll behaviour and max height.
const panelStyle: React.CSSProperties = {
  maxHeight: 480,
};
const headerBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderBottom: "1px solid #eee",
};
const countStyle: React.CSSProperties = { fontSize: 11, color: "#888" };
const pagerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  justifyContent: "center",
  padding: "6px 12px",
  borderTop: "1px solid #eee",
};
const toolBtnStyle: React.CSSProperties = {
  font: "12px system-ui, sans-serif",
  padding: "4px 8px",
  border: "1px solid #d5d5d5",
  borderRadius: 4,
  background: "#fafafa",
  cursor: "pointer",
};
const menuStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  right: 0,
  zIndex: 10,
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 6,
  boxShadow: "0 4px 12px rgba(0,0,0,.12)",
  padding: 6,
  maxHeight: 240,
  overflow: "auto",
  minWidth: 160,
};
const menuItemStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, padding: "3px 4px" };
const scrollStyle: React.CSSProperties = { overflow: "auto", flex: 1 };
const tableStyle: React.CSSProperties = { borderCollapse: "collapse", width: "100%", tableLayout: "fixed" };
const thStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  background: "#f7f7f7",
  textAlign: "left",
  padding: "6px 8px",
  borderBottom: "1px solid #e2e2e2",
  cursor: "pointer",
  whiteSpace: "nowrap",
  userSelect: "none",
};
const filterThStyle: React.CSSProperties = {
  position: "sticky",
  top: 30,
  background: "#fbfbfb",
  padding: "2px 4px",
  borderBottom: "1px solid #eee",
};
const filterInputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  font: "12px system-ui, sans-serif",
  padding: "2px 4px",
  border: "1px solid #ddd",
  borderRadius: 3,
};
const trStyle: React.CSSProperties = { height: ROW_HEIGHT, cursor: "pointer" };
const trSelectedStyle: React.CSSProperties = { background: "#eef5ff", outline: "1px solid #b7d3ff" };
const tdStyle: React.CSSProperties = {
  padding: "6px 8px",
  borderBottom: "1px solid #f2f2f2",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
