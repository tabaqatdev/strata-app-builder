/**
 * QueryPanel — an interactive query builder that RETURNS a result set (WIF/[ExB], MIT).
 *
 * Where `FilterPanel` narrows a layer in place (a `definitionExpression` → `filterChange`), the query
 * widget *runs* a where-clause against a bound `DataSource` and **publishes the resulting rows as an
 * output data source** (a `recordsChange`), so other widgets (`table`, `chart`, `feature-info`) consume
 * the results via `dataSource.fromWidget`. It reuses `FilterPanel`'s condition model + `buildWhere` so the
 * two share one predicate builder.
 */
import React, { useState } from "react";
import type { DataSource } from "@strata/data-source";
import { PanelShell, type PanelMode } from "./PanelShell.js";
import {
  buildWhere,
  type FilterField,
  type FilterCondition,
  type FilterOperator,
} from "./FilterPanel.js";

const OPERATORS: FilterOperator[] = ["=", "!=", ">", "<", ">=", "<=", "contains", "starts"];

/** The output a query publishes (also the shape `onQuery` must return). */
export interface QueryResult {
  rows: Record<string, unknown>[];
}

export interface QueryPanelProps {
  /** Fields offered in the builder. */
  fields: FilterField[];
  /** A first-class DataSource to run the query against (injected by `<StrataApp>` from `dataSource`). */
  source?: DataSource;
  /** Fallback query runner when no `source` is bound (e.g. a REST query the app owns). */
  onQuery?: (where: string | null) => Promise<QueryResult> | QueryResult;
  /** Originating layer id (carried on the published output so consumers can resolve fields/OIDs). */
  layerId?: string;
  /** Output registry — the query publishes its result rows here (injected by `<StrataApp>`). */
  outputs?: { publish: (p: { widgetId: string; records: unknown; layerId?: string }) => void };
  /** This widget's id (the output key + trigger source); injected as `id`/`widgetId`. */
  widgetId?: string;
  id?: string;
  title?: string;
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

export function QueryPanel(props: QueryPanelProps): React.ReactElement {
  const { fields } = props;
  const widgetId = props.widgetId ?? props.id ?? "query";
  const [conditions, setConditions] = useState<FilterCondition[]>([
    { field: fields[0]?.name ?? "", operator: "=", value: "" },
  ]);
  const [combinator, setCombinator] = useState<"AND" | "OR">("AND");
  const [count, setCount] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  const update = (i: number, patch: Partial<FilterCondition>): void =>
    setConditions((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const addRow = (): void =>
    setConditions((cs) => [...cs, { field: fields[0]?.name ?? "", operator: "=", value: "" }]);
  const removeRow = (i: number): void => setConditions((cs) => cs.filter((_, j) => j !== i));

  const run = async (): Promise<void> => {
    const where = buildWhere(conditions, combinator, fields);
    setRunning(true);
    try {
      let rows: Record<string, unknown>[] = [];
      if (props.source) rows = (await props.source.query({ where: where ?? undefined })).rows;
      else if (props.onQuery) rows = (await props.onQuery(where)).rows;
      props.outputs?.publish({ widgetId, records: rows, layerId: props.layerId });
      setCount(rows.length);
    } finally {
      setRunning(false);
    }
  };

  return (
    <PanelShell
      title={props.title ?? "Query"}
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth ?? 300}
      onClose={props.onClose}
      onOpen={props.onOpen}
      className={props.className}
      style={props.style}
    >
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {conditions.length > 1 && (
          <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            Match
            <select value={combinator} style={selectStyle} onChange={(e) => setCombinator(e.target.value as "AND" | "OR")}>
              <option value="AND">all (AND)</option>
              <option value="OR">any (OR)</option>
            </select>
          </label>
        )}
        {conditions.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 4 }}>
            <select style={selectStyle} value={c.field} onChange={(e) => update(i, { field: e.target.value })} aria-label="Field">
              {fields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.label ?? f.name}
                </option>
              ))}
            </select>
            <select style={opStyle} value={c.operator} onChange={(e) => update(i, { operator: e.target.value as FilterOperator })} aria-label="Operator">
              {OPERATORS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={c.value}
              placeholder="Value"
              aria-label="Value"
              onChange={(e) => update(i, { value: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && void run()}
            />
            {conditions.length > 1 && (
              <button style={miniBtn} title="Remove" onClick={() => removeRow(i)}>
                ✕
              </button>
            )}
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button style={ghostBtn} onClick={addRow}>
            + Condition
          </button>
          <div style={{ flex: 1 }} />
          {count != null && (
            <span style={{ fontSize: 12, color: "var(--strata-muted,#8b95a5)" }} data-testid="query-count">
              {count} result{count === 1 ? "" : "s"}
            </span>
          )}
          <button style={primaryBtn} disabled={running} onClick={() => void run()}>
            {running ? "Running…" : "Run"}
          </button>
        </div>
      </div>
    </PanelShell>
  );
}

export default QueryPanel;

const selectStyle: React.CSSProperties = { font: "inherit", fontSize: 12, padding: "4px 6px", border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 4, background: "var(--strata-panel-bg,#fff)", color: "var(--strata-fg,inherit)" };
const opStyle: React.CSSProperties = { ...selectStyle, width: 74 };
const inputStyle: React.CSSProperties = { font: "inherit", fontSize: 12, padding: "4px 6px", border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 4, minWidth: 0, background: "var(--strata-panel-bg,#fff)", color: "var(--strata-fg,inherit)" };
const miniBtn: React.CSSProperties = { font: "inherit", width: 24, border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 4, background: "transparent", color: "var(--strata-fg,inherit)", cursor: "pointer" };
const ghostBtn: React.CSSProperties = { font: "inherit", fontSize: 12, padding: "5px 10px", border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 6, background: "transparent", color: "var(--strata-fg,inherit)", cursor: "pointer" };
const primaryBtn: React.CSSProperties = { font: "inherit", fontSize: 12, fontWeight: 600, padding: "5px 12px", border: "none", borderRadius: 6, background: "var(--strata-accent,#2b6cb0)", color: "#fff", cursor: "pointer" };
