/**
 * DateFilter — a calendar single-date / range → time `definitionExpression` (WIF/[ExB], MIT).
 *
 * Friendlier than a raw time slider: pick a date (or a from/to range) and the panel builds a SQL clause on
 * a time field and emits `filterChange` on the bus. Stacks with any other `definitionExpression` filter.
 */
import React, { useState } from "react";
import { PanelShell, type PanelMode } from "./PanelShell.js";

/** Build a time `where` on `field` from a from/to (either bound may be empty). `to` is inclusive to end-of-day. */
export function buildDateWhere(field: string, from: string, to: string): string | null {
  const parts: string[] = [];
  if (from) parts.push(`${field} >= TIMESTAMP '${from} 00:00:00'`);
  if (to) parts.push(`${field} <= TIMESTAMP '${to} 23:59:59'`);
  return parts.length ? parts.join(" AND ") : null;
}

export interface DateFilterProps {
  layerId: string;
  /** The time/date field to filter. */
  field: string;
  /** "instant" = a single date; "range" = from/to (default "range"). */
  dateMode?: "instant" | "range";
  bus?: { emit: (t: { type: string; source?: string; payload: unknown }) => void };
  widgetId?: string;
  id?: string;
  onFilter?: (layerId: string, where: string | null) => void;
  mode?: PanelMode;
  floating?: boolean;
  initialX?: number;
  initialY?: number;
  defaultWidth?: number;
  onClose?: () => void;
  onOpen?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function DateFilter(props: DateFilterProps): React.ReactElement {
  const { layerId, field, dateMode = "range" } = props;
  const widgetId = props.widgetId ?? props.id ?? "date-filter";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const emit = (where: string | null): void => {
    props.onFilter?.(layerId, where);
    props.bus?.emit({ type: "filterChange", source: widgetId, payload: { layerId, where } });
  };
  const apply = (): void => {
    // instant mode filters to the single chosen day (from == to).
    const hi = dateMode === "instant" ? from : to;
    emit(buildDateWhere(field, from, hi));
  };
  const clear = (): void => {
    setFrom("");
    setTo("");
    emit(null);
  };

  return (
    <PanelShell
      title="Date filter"
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth ?? 260}
      onClose={props.onClose}
      onOpen={props.onOpen}
      className={props.className}
      style={props.style}
    >
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={rowStyle}>
          <span style={labelStyle}>{dateMode === "instant" ? "Date" : "From"}</span>
          <input type="date" aria-label="From" value={from} style={inputStyle} onChange={(e) => setFrom(e.target.value)} />
        </label>
        {dateMode === "range" && (
          <label style={rowStyle}>
            <span style={labelStyle}>To</span>
            <input type="date" aria-label="To" value={to} style={inputStyle} onChange={(e) => setTo(e.target.value)} />
          </label>
        )}
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button style={ghostBtn} onClick={clear}>
            Clear
          </button>
          <button style={primaryBtn} onClick={apply}>
            Apply
          </button>
        </div>
      </div>
    </PanelShell>
  );
}

export default DateFilter;

const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8 };
const labelStyle: React.CSSProperties = { fontSize: 12, width: 44, color: "var(--strata-muted,#666)" };
const inputStyle: React.CSSProperties = { font: "inherit", fontSize: 12, padding: "4px 6px", border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 4, flex: 1, background: "var(--strata-panel-bg,#fff)", color: "var(--strata-fg,inherit)" };
const ghostBtn: React.CSSProperties = { font: "inherit", fontSize: 12, padding: "5px 10px", border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 6, background: "transparent", color: "var(--strata-fg,inherit)", cursor: "pointer" };
const primaryBtn: React.CSSProperties = { font: "inherit", fontSize: 12, fontWeight: 600, padding: "5px 12px", border: "none", borderRadius: 6, background: "var(--strata-accent,#2b6cb0)", color: "#fff", cursor: "pointer" };
