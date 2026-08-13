/**
 * Legend — a swatch+label legend built from each layer's ESRI renderer classes (MIT).
 *
 * Reads the genuine ESRI `drawingInfo.renderer` on each operational layer and lists one row per
 * class: `simple` → a single row, `uniqueValue` → one row per value (+ optional default),
 * `classBreaks` → one row per break. Swatch colors reuse the same color coercion as the style
 * compiler (ESRI `[r,g,b,a 0-255]` → CSS). Heatmap/unsupported renderers show a note.
 *
 * **The legend is a control surface, not a caption** (default `interactive`): click a row to hide
 * that class · shift-click to isolate it · `Esc` clears. Hiding builds a real
 * `definitionExpression` on the renderer's own field and applies it in place through the store — a
 * legend row **filters, it does not fade**, because a faded class is still clickable and a
 * "hidden" feature can then be selected through it.
 *
 * Two rules the shipped builds paid for:
 *  - **Isolating changes the map, not the reading** — say so on screen, or a filtered count reads
 *    as the whole.
 *  - **A count keeps its denominator** (`8,340 of 12,728`). Pass `counts` and the rows carry it.
 *
 * This is a plain React overlay (not a MapLibre `IControl`) so it can live in a panel or on the
 * canvas; pass the operational layers and it renders reactively.
 */
import React, { useCallback, useEffect, useState } from "react";
import type { OperationalLayer } from "@strata/schema";
import type { StrataStore } from "@strata/state";

export interface LegendProps {
  layers: OperationalLayer[];
  /** Only include visible layers (default true). */
  visibleOnly?: boolean;
  title?: string;
  /**
   * Rows respond to clicks (hide / shift-click isolate / `Esc` clear). Default **true**.
   * `false` renders a static caption.
   */
  interactive?: boolean;
  /** Store — hiding/isolating applies a `definitionExpression` in place (no remount). */
  store?: StrataStore;
  /** `@strata/actions` bus — a click also emits `categorySelect` so other widgets can follow. */
  bus?: { emit: (t: { type: string; source?: string; payload: unknown }) => void };
  /** Live counts per row label: the numerator, and the denominator that keeps it honest. */
  counts?: Record<string, { n: number; total?: number }>;
  /** Called after every change with the classes currently hidden / isolated. */
  onFilterChange?: (state: { layerId: string; hidden: string[]; isolated: string | null; where: string | null }) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface LegendRow {
  label: string;
  swatch: string;
  /** point | line | fill — controls the swatch shape. */
  shape: "point" | "line" | "fill";
}

export function Legend(props: LegendProps): React.ReactElement | null {
  const { layers, visibleOnly = true, store, bus, counts, onFilterChange } = props;
  const interactive = props.interactive !== false;
  // Per layer: the classes hidden, and the one isolated (they are exclusive — isolating clears hides).
  const [state, setState] = useState<Record<string, { hidden: string[]; isolated: string | null }>>({});

  const entries = layers
    .filter((l) => (visibleOnly ? l.visibility !== false : true))
    .map((l) => ({ layer: l, rows: legendRows(l) }))
    .filter((e) => e.rows.length > 0);

  /** Apply a layer's new hidden/isolated set: build the where, push it in place, tell everyone. */
  const applyFilter = useCallback(
    (layer: OperationalLayer, next: { hidden: string[]; isolated: string | null }): void => {
      setState((s) => ({ ...s, [layer.id]: next }));
      const where = legendWhere(layer, next.hidden, next.isolated);
      store?.getState().setDefinition?.(layer.id, where ?? undefined);
      bus?.emit({
        type: "categorySelect",
        source: "legend",
        payload: { layerId: layer.id, field: rendererField(layer), values: next.isolated ? [next.isolated] : [], where },
      });
      onFilterChange?.({ layerId: layer.id, hidden: next.hidden, isolated: next.isolated, where });
    },
    [store, bus, onFilterChange],
  );

  /** `Esc` clears every legend filter — one key, one meaning, across the app. */
  useEffect(() => {
    if (!interactive || typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== "Escape") return;
      let touched = false;
      for (const { layer } of entries) {
        const cur = state[layer.id];
        if (cur && (cur.hidden.length || cur.isolated)) {
          touched = true;
          applyFilter(layer, { hidden: [], isolated: null });
        }
      }
      if (touched) e.stopPropagation();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interactive, entries, state, applyFilter]);

  if (!entries.length) return null;

  return (
    <div className={props.className} style={{ ...wrapStyle, ...props.style }} data-strata-legend="">
      {props.title && <div style={titleStyle}>{props.title}</div>}
      {entries.map(({ layer, rows }) => {
        const cur = state[layer.id] ?? { hidden: [], isolated: null };
        return (
          <div key={layer.id} style={groupStyle}>
            <div style={groupTitleStyle}>{layer.title}</div>
            {rows.map((r, i) => {
              const off = cur.hidden.includes(r.label);
              const iso = cur.isolated === r.label;
              const c = counts?.[r.label];
              const row = (
                <>
                  <Swatch color={r.swatch} shape={r.shape} />
                  <span style={labelStyle}>{r.label}</span>
                  {c && (
                    <span style={countStyle}>
                      {c.n.toLocaleString()}
                      {c.total != null && <span style={{ opacity: 0.55 }}> of {c.total.toLocaleString()}</span>}
                    </span>
                  )}
                </>
              );
              if (!interactive) {
                return (
                  <div key={i} style={rowStyle}>
                    {row}
                  </div>
                );
              }
              return (
                <button
                  key={i}
                  type="button"
                  data-strata-legend-row={r.label}
                  aria-pressed={iso}
                  title={`${r.label} — click to hide, shift-click to isolate`}
                  style={{
                    ...rowStyle,
                    ...interactiveRowStyle,
                    ...(off ? offRowStyle : null),
                    ...(iso ? isoRowStyle : null),
                  }}
                  onClick={(e) => {
                    if (e.shiftKey) {
                      applyFilter(layer, { hidden: [], isolated: iso ? null : r.label });
                      return;
                    }
                    const hidden = off ? cur.hidden.filter((h) => h !== r.label) : [...cur.hidden, r.label];
                    applyFilter(layer, { hidden, isolated: null });
                  }}
                >
                  {row}
                </button>
              );
            })}
          </div>
        );
      })}
      {interactive && (
        <div style={hintStyle}>
          Click to hide · shift-click to isolate · <kbd>Esc</kbd> clears. Isolating changes the map,{" "}
          <b>not</b> the reading.
        </div>
      )}
    </div>
  );
}

/** The field a renderer classifies on — what a legend filter has to be written against. */
export function rendererField(layer: OperationalLayer): string | null {
  const r = layer.layerDefinition?.drawingInfo?.renderer as any;
  return r?.field ?? r?.field1 ?? r?.attributeField ?? null;
}

/**
 * Build the `definitionExpression` for a legend selection — genuine SQL against the renderer's own
 * field, so the filter runs server-side like every other filter.
 *
 * `uniqueValue` → `field IN (…)` / `field NOT IN (…)`; `classBreaks` → the isolated break's range.
 * Returns `null` when nothing is filtered, or when the renderer classifies on no single field (a
 * legend cannot honestly filter what it cannot name).
 */
export function legendWhere(
  layer: OperationalLayer,
  hidden: string[],
  isolated: string | null,
): string | null {
  const renderer = layer.layerDefinition?.drawingInfo?.renderer as any;
  const field = rendererField(layer);
  if (!renderer || !field || (!hidden.length && !isolated)) return null;
  const type = String(renderer.type);

  if (type === "uniqueValue") {
    const valueFor = (label: string): string | null => {
      const info = (renderer.uniqueValueInfos || []).find(
        (u: any) => String(u.label ?? u.value) === label,
      );
      return info ? String(info.value) : null;
    };
    const q = (v: string): string => (/^-?\d+(\.\d+)?$/.test(v) ? v : `'${v.replace(/'/g, "''")}'`);
    if (isolated) {
      const v = valueFor(isolated);
      return v == null ? null : `${field} IN (${q(v)})`;
    }
    const vs = hidden.map(valueFor).filter((v): v is string => v != null);
    return vs.length ? `${field} NOT IN (${vs.map(q).join(", ")})` : null;
  }

  if (type === "classBreaks") {
    const breakFor = (label: string): any =>
      (renderer.classBreakInfos || []).find((b: any) => String(b.label ?? `≤ ${b.classMaxValue}`) === label);
    const range = (b: any, negate: boolean): string | null => {
      if (!b) return null;
      const lo = b.classMinValue;
      const hi = b.classMaxValue;
      if (lo == null && hi == null) return null;
      const clause =
        lo != null && hi != null ? `(${field} >= ${lo} AND ${field} <= ${hi})`
          : lo != null ? `${field} >= ${lo}`
            : `${field} <= ${hi}`;
      return negate ? `NOT ${clause}` : clause;
    };
    if (isolated) return range(breakFor(isolated), false);
    const parts = hidden.map((h) => range(breakFor(h), true)).filter((p): p is string => p != null);
    return parts.length ? parts.join(" AND ") : null;
  }

  return null;
}

/** Derive legend rows from a layer's ESRI renderer. */
export function legendRows(layer: OperationalLayer): LegendRow[] {
  const renderer = layer.layerDefinition?.drawingInfo?.renderer as any;
  if (!renderer) return [];
  const shape = shapeForRenderer(renderer);
  switch (String(renderer.type)) {
    case "simple":
      return [{ label: renderer.label || layer.title, swatch: symbolColor(renderer.symbol), shape }];
    case "uniqueValue": {
      const rows: LegendRow[] = (renderer.uniqueValueInfos || []).map((info: any) => ({
        label: String(info.label ?? info.value ?? ""),
        swatch: symbolColor(info.symbol),
        shape,
      }));
      if (renderer.defaultSymbol) {
        rows.push({ label: renderer.defaultLabel || "Other", swatch: symbolColor(renderer.defaultSymbol), shape });
      }
      return rows;
    }
    case "classBreaks":
      return (renderer.classBreakInfos || []).map((info: any) => ({
        label: String(info.label ?? `≤ ${info.classMaxValue}`),
        swatch: symbolColor(info.symbol),
        shape,
      }));
    case "heatmap":
      return [{ label: "Density (heatmap)", swatch: heatmapSwatch(renderer), shape: "fill" }];
    default:
      return [];
  }
}

/** A tiny colored swatch whose shape matches the geometry the renderer targets. */
function Swatch({ color, shape }: { color: string; shape: "point" | "line" | "fill" }): React.ReactElement {
  if (shape === "point") {
    return <span style={{ ...swatchBase, background: color, borderRadius: "50%" }} />;
  }
  if (shape === "line") {
    return <span style={{ ...swatchBase, height: 3, background: color, borderRadius: 2 }} />;
  }
  return <span style={{ ...swatchBase, background: color, borderRadius: 2, border: "1px solid rgba(0,0,0,.25)" }} />;
}

/** Best-effort geometry→swatch shape from the renderer's (default) symbol type. */
function shapeForRenderer(renderer: any): "point" | "line" | "fill" {
  const sym =
    renderer.symbol ||
    renderer.defaultSymbol ||
    renderer.uniqueValueInfos?.[0]?.symbol ||
    renderer.classBreakInfos?.[0]?.symbol;
  const t = String(sym?.type || "").toLowerCase();
  if (t === "esrisls" || t === "simple-line") return "line";
  if (t === "esrisms" || t === "simple-marker" || t === "esripms" || t === "picture-marker") return "point";
  return "fill";
}

/** ESRI `[r,g,b,a(0-255)]` (or a CSS string) → CSS color. Mirrors styleCompiler's `color()`. */
function symbolColor(sym: any): string {
  const c = sym?.color;
  if (typeof c === "string") return c;
  if (Array.isArray(c) && c.length >= 3) {
    const [r, g, b, a = 255] = c as number[];
    return `rgba(${r},${g},${b},${a / 255})`;
  }
  // Fall back to a fill/outline color when a marker/line nests it.
  if (sym?.outline?.color) return symbolColor({ color: sym.outline.color });
  return "#3b82f6";
}

/** A representative mid-density swatch color for a heatmap renderer. */
function heatmapSwatch(renderer: any): string {
  const stops = renderer.colorStops || [];
  const mid = stops[Math.floor(stops.length / 2)] || stops[stops.length - 1];
  return mid ? symbolColor({ color: mid.color }) : "#f59e0b";
}

const wrapStyle: React.CSSProperties = {
  font: "12px system-ui, sans-serif",
  background: "rgba(255,255,255,.95)",
  border: "1px solid #e2e2e2",
  borderRadius: 6,
  padding: "8px 10px",
  boxShadow: "0 2px 8px rgba(0,0,0,.12)",
  maxWidth: 240,
};
const titleStyle: React.CSSProperties = { fontWeight: 600, marginBottom: 6 };
const groupStyle: React.CSSProperties = { marginBottom: 8 };
const groupTitleStyle: React.CSSProperties = { fontWeight: 600, marginBottom: 4, opacity: 0.85 };
const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, padding: "1px 0" };
// A row you can click has to look like one — and a hidden class dims, while the isolated one is
// marked. Dimming is the *label's* state; the features themselves are filtered, never faded.
const interactiveRowStyle: React.CSSProperties = {
  width: "100%",
  font: "inherit",
  color: "inherit",
  textAlign: "left",
  background: "none",
  border: "1px solid transparent",
  borderRadius: 7,
  padding: "3px 4px",
  cursor: "pointer",
};
const offRowStyle: React.CSSProperties = { opacity: 0.42 };
const isoRowStyle: React.CSSProperties = {
  background: "rgba(47,111,237,.15)",
  borderColor: "rgba(47,111,237,.42)",
};
const countStyle: React.CSSProperties = {
  marginLeft: "auto",
  fontVariantNumeric: "tabular-nums",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 11.5,
  opacity: 0.75,
};
const hintStyle: React.CSSProperties = { fontSize: 10.5, opacity: 0.7, marginTop: 5, lineHeight: 1.35 };
const labelStyle: React.CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const swatchBase: React.CSSProperties = { display: "inline-block", width: 14, height: 14, flex: "0 0 auto" };

export default Legend;
