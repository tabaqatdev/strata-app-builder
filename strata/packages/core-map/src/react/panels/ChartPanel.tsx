/**
 * ChartPanel — expression-backed chart management (MIT).
 *
 * A manager for `SavedChart`s (bar / line / pie) whose data is an expression over a
 * layer (`{ layer_id, field, value_field, stat }`) rather than a snapshot. Charts are
 * added via a small form, removed, and rendered with a compact built-in SVG renderer.
 * Data comes from `onQueryData(source)` (re-materialized live) or a chart's inline
 * `chart.data`. Rendering goes through `<EChart>`, which uses Apache ECharts when the optional `echarts`
 * peer dep is installed and otherwise falls back to the dependency-free `<MiniChart>` SVG renderer (the
 * swap seam). Clicking a category emits `categorySelect` on the `bus` — the chart is a WIF source.
 *
 * Layout: renders inside a PanelShell, so it can be `mode="fixed"` (docked, default) or
 * `mode="floating"` (draggable overlay). Chart cards are drag-to-reorder (native HTML5
 * drag events); the new id order is reported via `onReorderCharts`.
 */
import React, { useEffect, useState } from "react";
import type { SavedChart } from "@strata/schema";
import type { StrataStore } from "@strata/state";
import type { ActionBus, CategorySelectPayload } from "@strata/actions";
import { PanelShell, type PanelMode } from "./PanelShell.js";
import { EChart } from "./EChart.js";
import { histogram } from "./chartTransforms.js";

/** A single category/value datum used by every chart kind. */
export interface ChartDatum {
  label: string;
  value: number;
}

export interface ChartPanelProps {
  /** Optional store (reserved for future layer-id pickers / linked selection). */
  store?: StrataStore;
  /**
   * Shared action bus (WIF). When present, clicking a category emits `categorySelect` (a second click on
   * the same category clears it) so the chart cross-filters the map + other widgets. `<StrataApp>` injects
   * this automatically, and `id`/`widgetId` becomes the trigger source.
   */
  bus?: ActionBus;
  /** This widget's id (the trigger `source`); injected by `<StrataApp>` as `id`/`widgetId`. */
  widgetId?: string;
  id?: string;
  charts: SavedChart[];
  /** Persist a newly configured chart (app owns the SavedChart list / layers.json). */
  onAddChart?: (cfg: SavedChart) => void;
  onRemoveChart?: (id: string) => void;
  /** Persist a new chart order after a drag-to-reorder (app owns the SavedChart list). */
  onReorderCharts?: (ids: string[]) => void;
  /** Resolve a chart's data from its expression source. */
  onQueryData?: (source: NonNullable<SavedChart["source"]>) => Promise<ChartDatum[]>;
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

const RENDERABLE_KINDS = ["bar", "line", "pie", "scatter"] as const;
type RenderKind = (typeof RENDERABLE_KINDS)[number];

/** Coerce any SavedChart kind to one this renderer supports. */
function renderKind(kind: SavedChart["kind"]): RenderKind {
  if (kind === "line") return "line";
  if (kind === "pie") return "pie";
  if (kind === "scatter") return "scatter";
  return "bar"; // bar | column | gauge → bars; histogram is pre-binned to bars upstream.
}

const PALETTE = ["#2b6cb0", "#38a169", "#dd6b20", "#805ad5", "#d53f8c", "#319795", "#e53e3e", "#718096"];

/** A dependency-free SVG renderer for bar / line / pie. Clicking a mark fires `onSelect` (WIF source). */
export function MiniChart(props: {
  kind: RenderKind;
  data: ChartDatum[];
  width?: number;
  height?: number;
  /** The currently-selected category label (highlighted). */
  selected?: string | null;
  /** Fired when a mark is clicked — the panel maps it to a `categorySelect` on the bus. */
  onSelect?: (d: ChartDatum, index: number) => void;
}): React.ReactElement {
  const { kind, data, onSelect, selected } = props;
  const w = props.width ?? 260;
  const h = props.height ?? 140;
  const clickable = !!onSelect;
  const markCursor = clickable ? "pointer" : "default";
  const dim = (label: string): number => (selected == null || selected === label ? 1 : 0.35);
  if (data.length === 0) return <div style={{ color: "#999", fontSize: 12 }}>No data.</div>;

  if (kind === "pie") {
    const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
    const r = Math.min(w, h) / 2 - 4;
    const cx = h / 2;
    const cy = h / 2;
    let angle = -Math.PI / 2;
    const arcs = data.map((d, i) => {
      const frac = Math.max(0, d.value) / total;
      const start = angle;
      const end = angle + frac * Math.PI * 2;
      angle = end;
      const large = end - start > Math.PI ? 1 : 0;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
      return (
        <path
          key={i}
          d={path}
          fill={PALETTE[i % PALETTE.length]}
          opacity={dim(d.label)}
          style={{ cursor: markCursor }}
          onClick={onSelect ? () => onSelect(d, i) : undefined}
        >
          <title>{`${d.label}: ${d.value}`}</title>
        </path>
      );
    });
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img">
        {arcs}
        {data.map((d, i) => (
          <g key={i} transform={`translate(${h + 8}, ${14 + i * 16})`}>
            <rect width={10} height={10} fill={PALETTE[i % PALETTE.length]} />
            <text x={14} y={9} fontSize={11} fill="#333">
              {d.label}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  const pad = 20;
  const max = Math.max(...data.map((d) => d.value), 0) || 1;
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;
  const y = (v: number): number => pad + plotH - ((v - min) / range) * plotH;

  if (kind === "line") {
    const step = data.length > 1 ? plotW / (data.length - 1) : 0;
    const points = data.map((d, i) => `${pad + i * step},${y(d.value)}`).join(" ");
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img">
        <line x1={pad} y1={y(min < 0 ? 0 : min)} x2={w - pad} y2={y(min < 0 ? 0 : min)} stroke="#eee" />
        <polyline points={points} fill="none" stroke={PALETTE[0]} strokeWidth={2} />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={pad + i * step}
            cy={y(d.value)}
            r={clickable ? 4 : 2.5}
            fill={PALETTE[0]}
            opacity={dim(d.label)}
            style={{ cursor: markCursor }}
            onClick={onSelect ? () => onSelect(d, i) : undefined}
          >
            <title>{`${d.label}: ${d.value}`}</title>
          </circle>
        ))}
      </svg>
    );
  }

  if (kind === "scatter") {
    const step = data.length > 1 ? plotW / (data.length - 1) : 0;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img">
        <line x1={pad} y1={y(min < 0 ? 0 : min)} x2={w - pad} y2={y(min < 0 ? 0 : min)} stroke="#eee" />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={pad + i * step}
            cy={y(d.value)}
            r={clickable ? 5 : 4}
            fill={PALETTE[i % PALETTE.length]}
            opacity={dim(d.label)}
            style={{ cursor: markCursor }}
            onClick={onSelect ? () => onSelect(d, i) : undefined}
          >
            <title>{`${d.label}: ${d.value}`}</title>
          </circle>
        ))}
      </svg>
    );
  }

  // bar
  const gap = 4;
  const barW = data.length ? (plotW - gap * (data.length - 1)) / data.length : 0;
  const base = y(min < 0 ? 0 : min);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img">
      <line x1={pad} y1={base} x2={w - pad} y2={base} stroke="#eee" />
      {data.map((d, i) => {
        const bx = pad + i * (barW + gap);
        const by = y(d.value);
        const bh = Math.abs(base - by);
        return (
          <rect
            key={i}
            x={bx}
            y={Math.min(by, base)}
            width={Math.max(1, barW)}
            height={bh}
            fill={PALETTE[i % PALETTE.length]}
            opacity={dim(d.label)}
            style={{ cursor: markCursor }}
            onClick={onSelect ? () => onSelect(d, i) : undefined}
          >
            <title>{`${d.label}: ${d.value}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

/** One chart card: resolves its data (async or inline) and renders it. */
function ChartCard(props: {
  chart: SavedChart;
  onQueryData?: ChartPanelProps["onQueryData"];
  onRemove?: (id: string) => void;
  selected?: string | null;
  onSelect?: (chart: SavedChart, d: ChartDatum) => void;
}): React.ReactElement {
  const { chart, onQueryData, onRemove, onSelect, selected } = props;
  const [data, setData] = useState<ChartDatum[]>(chart.data ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (chart.data && chart.data.length) {
      setData(chart.data);
      return;
    }
    if (chart.source && onQueryData) {
      setLoading(true);
      setError(null);
      onQueryData(chart.source)
        .then((d) => {
          if (alive) setData(d);
        })
        .catch((e) => {
          if (alive) setError(String(e?.message ?? e));
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    }
    return () => {
      alive = false;
    };
  }, [chart, onQueryData]);

  return (
    <div style={cardStyle}>
      <div style={cardHeadStyle}>
        <span style={{ fontWeight: 600 }}>{chart.title}</span>
        <span style={kindBadgeStyle}>{chart.kind}</span>
        <div style={{ flex: 1 }} />
        {onRemove && (
          <button style={miniBtnStyle} title="Remove chart" onClick={() => onRemove(chart.id)}>
            ✕
          </button>
        )}
      </div>
      {loading ? (
        <div style={mutedStyle}>Loading…</div>
      ) : error ? (
        <div style={{ ...mutedStyle, color: "#c53030" }}>{error}</div>
      ) : (
        <EChart
          kind={renderKind(chart.kind)}
          data={chart.kind === "histogram" ? histogram(data.map((d) => Number(d.value))) : data}
          selected={selected}
          onSelect={onSelect ? (d) => onSelect(chart, d) : undefined}
          fallback={(p) => <MiniChart {...p} />}
        />
      )}
    </div>
  );
}

export function ChartPanel(props: ChartPanelProps): React.ReactElement {
  const { charts, onAddChart, onRemoveChart, onReorderCharts, onQueryData, bus } = props;
  const widgetId = props.widgetId ?? props.id;
  // The currently cross-filtered category (per chart id), so the panel highlights it and can toggle-clear.
  const [selectedByChart, setSelectedByChart] = useState<Record<string, string | null>>({});
  const [showForm, setShowForm] = useState(false);

  /** Emit `categorySelect` on the bus for a datum click; clicking the active category again clears it. */
  const onSelectDatum = (chart: SavedChart, d: ChartDatum): void => {
    const field = chart.source?.field;
    const layerId = chart.source?.layer_id;
    if (!bus || !field || !layerId) return;
    const current = selectedByChart[chart.id] ?? null;
    const next = current === d.label ? null : d.label;
    setSelectedByChart((s) => ({ ...s, [chart.id]: next }));
    bus.emit<CategorySelectPayload>({
      type: "categorySelect",
      source: widgetId,
      payload: { layerId, field, value: next },
    });
  };
  const [title, setTitle] = useState("");
  const [layerId, setLayerId] = useState("");
  const [field, setField] = useState("");
  const [valueField, setValueField] = useState("");
  const [stat, setStat] = useState("count");
  const [kind, setKind] = useState<RenderKind>("bar");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  /** Reorder so `sourceId` lands directly before `targetId`, then report the new order. */
  const reorderTo = (sourceId: string, targetId: string): void => {
    if (sourceId === targetId || !onReorderCharts) return;
    const ids = charts.map((c) => c.id).filter((id) => id !== sourceId);
    const at = ids.indexOf(targetId);
    if (at < 0) return;
    ids.splice(at, 0, sourceId);
    onReorderCharts(ids);
  };

  const submit = (): void => {
    if (!layerId.trim() || !onAddChart) return;
    const cfg: SavedChart = {
      id: `chart-${Date.now()}`,
      title: title.trim() || `${stat}(${field || "*"})`,
      kind,
      source: {
        layer_id: layerId.trim(),
        field: field.trim() || undefined,
        value_field: valueField.trim() || null,
        stat,
      },
      data: null,
    };
    onAddChart(cfg);
    setShowForm(false);
    setTitle("");
    setLayerId("");
    setField("");
    setValueField("");
    setStat("count");
    setKind("bar");
  };

  const headerExtra = onAddChart ? (
    <button style={toolBtnStyle} onClick={() => setShowForm((s) => !s)}>
      {showForm ? "Cancel" : "+ Add"}
    </button>
  ) : null;

  return (
    <PanelShell
      title="Charts"
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth ?? 320}
      onClose={props.onClose}
      onOpen={props.onOpen}
      headerExtra={headerExtra}
      className={props.className}
      style={{ ...panelStyle, ...props.style }}
    >
      {showForm && (
        <div style={formStyle}>
          <input style={inputStyle} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input
            style={inputStyle}
            placeholder="Layer id"
            value={layerId}
            onChange={(e) => setLayerId(e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="Category field"
            value={field}
            onChange={(e) => setField(e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="Value field (optional)"
            value={valueField}
            onChange={(e) => setValueField(e.target.value)}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <select style={selectStyle} value={stat} onChange={(e) => setStat(e.target.value)}>
              {["count", "sum", "avg", "min", "max"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select style={selectStyle} value={kind} onChange={(e) => setKind(e.target.value as RenderKind)}>
              {RENDERABLE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <button style={submitBtnStyle} disabled={!layerId.trim()} onClick={submit}>
            Add chart
          </button>
        </div>
      )}

      <div style={cardsStyle}>
        {charts.length === 0 && <div style={mutedStyle}>No charts yet.</div>}
        {charts.map((c) => {
          const isDragOver = onReorderCharts && dragOverId === c.id && dragId !== c.id;
          return (
            <div
              key={c.id}
              draggable={!!onReorderCharts}
              style={{
                ...(isDragOver ? cardDragOverStyle : null),
                ...(dragId === c.id ? cardDraggingStyle : null),
              }}
              onDragStart={(e) => {
                if (!onReorderCharts) return;
                setDragId(c.id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", c.id);
              }}
              onDragOver={(e) => {
                if (!onReorderCharts) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverId !== c.id) setDragOverId(c.id);
              }}
              onDragLeave={() => {
                if (dragOverId === c.id) setDragOverId(null);
              }}
              onDrop={(e) => {
                if (!onReorderCharts) return;
                e.preventDefault();
                const sourceId = dragId ?? e.dataTransfer.getData("text/plain");
                if (sourceId) reorderTo(sourceId, c.id);
                setDragId(null);
                setDragOverId(null);
              }}
              onDragEnd={() => {
                setDragId(null);
                setDragOverId(null);
              }}
            >
              <ChartCard
                chart={c}
                onQueryData={onQueryData}
                onRemove={onRemoveChart}
                selected={bus ? selectedByChart[c.id] ?? null : null}
                onSelect={bus ? onSelectDatum : undefined}
              />
            </div>
          );
        })}
      </div>
    </PanelShell>
  );
}

export default ChartPanel;

// --- inline styles ---------------------------------------------------------
// PanelShell supplies the card chrome (border, radius, font, title header).
const panelStyle: React.CSSProperties = {};
const toolBtnStyle: React.CSSProperties = {
  font: "12px system-ui, sans-serif",
  padding: "4px 8px",
  border: "1px solid #d5d5d5",
  borderRadius: 4,
  background: "#fafafa",
  cursor: "pointer",
};
const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  padding: 12,
  borderBottom: "1px solid #eee",
  background: "#fafafa",
};
const inputStyle: React.CSSProperties = {
  font: "inherit",
  padding: "5px 7px",
  border: "1px solid #d5d5d5",
  borderRadius: 4,
};
const selectStyle: React.CSSProperties = { ...inputStyle, flex: 1 };
const submitBtnStyle: React.CSSProperties = {
  font: "inherit",
  padding: "6px 10px",
  border: "1px solid #2b6cb0",
  borderRadius: 4,
  background: "#2b6cb0",
  color: "#fff",
  cursor: "pointer",
};
const cardsStyle: React.CSSProperties = { padding: 12, display: "flex", flexDirection: "column", gap: 12, overflow: "auto" };
const cardStyle: React.CSSProperties = { border: "1px solid #eee", borderRadius: 6, padding: 10 };
const cardDragOverStyle: React.CSSProperties = { boxShadow: "inset 0 2px 0 #2b6cb0", borderRadius: 6 };
const cardDraggingStyle: React.CSSProperties = { opacity: 0.5 };
const cardHeadStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 };
const kindBadgeStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  background: "#eef2f7",
  color: "#555",
  padding: "1px 5px",
  borderRadius: 3,
};
const miniBtnStyle: React.CSSProperties = {
  font: "12px system-ui, sans-serif",
  width: 22,
  height: 22,
  border: "1px solid #f0c2c2",
  color: "#c53030",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
};
const mutedStyle: React.CSSProperties = { color: "#999", fontSize: 12 };
