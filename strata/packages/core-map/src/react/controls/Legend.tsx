/**
 * Legend — a swatch+label legend built from each layer's ESRI renderer classes (MIT).
 *
 * Reads the genuine ESRI `drawingInfo.renderer` on each operational layer and lists one row per
 * class: `simple` → a single row, `uniqueValue` → one row per value (+ optional default),
 * `classBreaks` → one row per break. Swatch colors reuse the same color coercion as the style
 * compiler (ESRI `[r,g,b,a 0-255]` → CSS). Heatmap/unsupported renderers show a note.
 *
 * This is a plain React overlay (not a MapLibre `IControl`) so it can live in a panel or on the
 * canvas; pass the operational layers and it renders reactively.
 */
import React from "react";
import type { OperationalLayer } from "@strata/schema";

export interface LegendProps {
  layers: OperationalLayer[];
  /** Only include visible layers (default true). */
  visibleOnly?: boolean;
  title?: string;
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
  const { layers, visibleOnly = true } = props;
  const entries = layers
    .filter((l) => (visibleOnly ? l.visibility !== false : true))
    .map((l) => ({ layer: l, rows: legendRows(l) }))
    .filter((e) => e.rows.length > 0);

  if (!entries.length) return null;

  return (
    <div className={props.className} style={{ ...wrapStyle, ...props.style }}>
      {props.title && <div style={titleStyle}>{props.title}</div>}
      {entries.map(({ layer, rows }) => (
        <div key={layer.id} style={groupStyle}>
          <div style={groupTitleStyle}>{layer.title}</div>
          {rows.map((r, i) => (
            <div key={i} style={rowStyle}>
              <Swatch color={r.swatch} shape={r.shape} />
              <span style={labelStyle}>{r.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
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
const labelStyle: React.CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const swatchBase: React.CSSProperties = { display: "inline-block", width: 14, height: 14, flex: "0 0 auto" };

export default Legend;
