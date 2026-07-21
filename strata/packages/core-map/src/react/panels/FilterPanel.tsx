/**
 * FilterPanel — an interactive query builder → `definitionExpression` (WIF/[ExB], MIT).
 *
 * Rows of `{ field, operator, value }` combined with AND/OR build a SQL `where`; "Apply" emits a
 * `filterChange` trigger on the bus (and calls `onFilter`), which — with `store.setDefinition` wired via
 * the WIF — filters the layer **in place** (no map remount). "Clear" resets to no filter. This is the
 * friendlier, always-visible filter UI ExB users expect, distinct from the CARTO category widgets.
 */
import React, { useState } from "react";
import { PanelShell, type PanelMode } from "./PanelShell.js";

export type FilterOperator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "starts";

export interface FilterField {
  name: string;
  label?: string;
  type?: "string" | "number" | "date";
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string;
}

/** SQL-escape a string literal (double single-quotes). */
function sqlStr(v: string): string {
  return `'${v.replace(/'/g, "''")}'`;
}

/** Build a single condition's SQL, quoting by field type. Returns "" for an empty value. */
export function conditionSql(cond: FilterCondition, fields: FilterField[]): string {
  const v = cond.value.trim();
  if (v === "") return "";
  const type = fields.find((f) => f.name === cond.field)?.type ?? "string";
  const numeric = type === "number";
  const lit = (s: string): string => (numeric && Number.isFinite(Number(s)) ? String(Number(s)) : sqlStr(s));
  switch (cond.operator) {
    case "contains":
      return `${cond.field} LIKE ${sqlStr(`%${v}%`)}`;
    case "starts":
      return `${cond.field} LIKE ${sqlStr(`${v}%`)}`;
    default:
      return `${cond.field} ${cond.operator} ${lit(v)}`;
  }
}

/** Combine conditions into a `definitionExpression`, or null when none are complete. */
export function buildWhere(conditions: FilterCondition[], combinator: "AND" | "OR", fields: FilterField[]): string | null {
  const parts = conditions.map((c) => conditionSql(c, fields)).filter(Boolean);
  return parts.length ? parts.join(` ${combinator} `) : null;
}

/**
 * A nested AND/OR group of conditions (Phase 3 upgrade). A group's `conditions` may themselves be groups,
 * so `(zone = 'A' AND (pop > 1000 OR area > 5))` is expressible. `spatial` is a reserved predicate applied
 * client-side against a `GeometryDataSource` (it is NOT part of the SQL `definitionExpression`).
 */
export interface FilterGroup {
  combinator: "AND" | "OR";
  conditions: Array<FilterCondition | FilterGroup>;
  /** Reserved: a spatial predicate against a geometry source (applied client-side, not in SQL). */
  spatial?: { predicate: "intersects" | "within"; sourceId: string };
}

function isGroup(x: FilterCondition | FilterGroup): x is FilterGroup {
  return typeof (x as FilterGroup).combinator === "string" && Array.isArray((x as FilterGroup).conditions);
}

/** Build a parenthesized SQL `where` from a nested AND/OR group. Returns null when nothing is complete. */
export function buildWhereGroups(group: FilterGroup, fields: FilterField[]): string | null {
  const parts = group.conditions
    .map((c) => (isGroup(c) ? buildWhereGroups(c, fields) : conditionSql(c, fields)))
    .filter((s): s is string => !!s);
  if (parts.length === 0) return null;
  const joined = parts.join(` ${group.combinator} `);
  return parts.length > 1 ? `(${joined})` : joined;
}

export interface FilterPanelProps {
  layerId: string;
  /** Fields offered in the builder. */
  fields: FilterField[];
  /** `@strata/actions` bus — "Apply" emits a `filterChange`. Injected by `<StrataApp>`. */
  bus?: { emit: (t: { type: string; source?: string; payload: unknown }) => void };
  /** This widget's id (trigger source); injected as `id`/`widgetId`. */
  widgetId?: string;
  id?: string;
  /** Direct filter callback (in addition to the bus). */
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

const OPERATORS: FilterOperator[] = ["=", "!=", ">", "<", ">=", "<=", "contains", "starts"];

export function FilterPanel(props: FilterPanelProps): React.ReactElement {
  const { fields, layerId } = props;
  const widgetId = props.widgetId ?? props.id ?? "filter";
  const [conditions, setConditions] = useState<FilterCondition[]>([
    { field: fields[0]?.name ?? "", operator: "=", value: "" },
  ]);
  const [combinator, setCombinator] = useState<"AND" | "OR">("AND");

  const update = (i: number, patch: Partial<FilterCondition>): void =>
    setConditions((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const addRow = (): void => setConditions((cs) => [...cs, { field: fields[0]?.name ?? "", operator: "=", value: "" }]);
  const removeRow = (i: number): void => setConditions((cs) => cs.filter((_, j) => j !== i));

  const apply = (): void => {
    const where = buildWhere(conditions, combinator, fields);
    props.onFilter?.(layerId, where);
    props.bus?.emit({ type: "filterChange", source: widgetId, payload: { layerId, where } });
  };
  const clear = (): void => {
    setConditions([{ field: fields[0]?.name ?? "", operator: "=", value: "" }]);
    props.onFilter?.(layerId, null);
    props.bus?.emit({ type: "filterChange", source: widgetId, payload: { layerId, where: null } });
  };

  return (
    <PanelShell
      title="Filter"
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
              onKeyDown={(e) => e.key === "Enter" && apply()}
            />
            {conditions.length > 1 && (
              <button style={miniBtn} title="Remove" onClick={() => removeRow(i)}>
                ✕
              </button>
            )}
          </div>
        ))}
        <div style={{ display: "flex", gap: 6 }}>
          <button style={ghostBtn} onClick={addRow}>
            + Condition
          </button>
          <div style={{ flex: 1 }} />
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

export default FilterPanel;

const selectStyle: React.CSSProperties = { font: "inherit", fontSize: 12, padding: "4px 6px", border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 4, background: "var(--strata-panel-bg,#fff)", color: "var(--strata-fg,inherit)" };
const opStyle: React.CSSProperties = { ...selectStyle, width: 74 };
const inputStyle: React.CSSProperties = { font: "inherit", fontSize: 12, padding: "4px 6px", border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 4, minWidth: 0, background: "var(--strata-panel-bg,#fff)", color: "var(--strata-fg,inherit)" };
const miniBtn: React.CSSProperties = { font: "inherit", width: 24, border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 4, background: "transparent", color: "var(--strata-fg,inherit)", cursor: "pointer" };
const ghostBtn: React.CSSProperties = { font: "inherit", fontSize: 12, padding: "5px 10px", border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 6, background: "transparent", color: "var(--strata-fg,inherit)", cursor: "pointer" };
const primaryBtn: React.CSSProperties = { font: "inherit", fontSize: 12, fontWeight: 600, padding: "5px 12px", border: "none", borderRadius: 6, background: "var(--strata-accent,#2b6cb0)", color: "#fff", cursor: "pointer" };
