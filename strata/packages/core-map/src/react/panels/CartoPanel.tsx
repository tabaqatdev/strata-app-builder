/**
 * @strata/core-map — CartoPanel (MIT).
 *
 * A CARTO Builder-style **layer + widgets** panel: a compact layer list on top, and a stack of
 * data **widgets** (category · formula · histogram · time-series) bound to a layer that **cross-filter
 * the map** — clicking a category applies a `definitionExpression` filter to the layer (and, if wired,
 * to the other widgets and the map).
 *
 * Framework-light: plain React + inline SVG, reusing `KpiCard`/`Sparkline`. It is data-source-agnostic —
 * the app provides an `onQuery(spec)` that returns aggregated results for a widget (e.g. via
 * `@strata/feature-arcgis` `queryStatistics`, or a client-side group-by). Cross-filtering is emitted via
 * `onFilter(layerId, where)`; pass the `@strata/state` `store` to drive the layer list.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { OperationalLayer } from "@strata/schema";
import { PanelShell, type PanelMode } from "./PanelShell.js";
import { KpiCard } from "../widgets/KpiCard.js";
import { Sparkline } from "../widgets/Sparkline.js";

export type CartoWidgetKind = "category" | "formula" | "histogram" | "timeseries";
export type CartoOperation = "count" | "sum" | "avg" | "min" | "max";

export interface CartoWidgetSpec {
  id: string;
  kind: CartoWidgetKind;
  layerId: string;
  /** category/numeric/date field the widget aggregates on. */
  field: string;
  /** for formula/histogram value aggregation (count if omitted). */
  operation?: CartoOperation;
  /** field to sum/avg (for operation ≠ count). */
  valueField?: string;
  title?: string;
  /** category/histogram bar limit. */
  limit?: number;
}

export interface CartoCategory {
  label: string;
  value: number;
}

export interface CartoPanelProps {
  /** @strata/state store (StoreApi) — used for the layer list + active layer. */
  store?: {
    getState: () => any;
    subscribe: (cb: () => void) => () => void;
  };
  /** the widgets to render (controlled). */
  widgets: CartoWidgetSpec[];
  onWidgetsChange?: (widgets: CartoWidgetSpec[]) => void;
  /**
   * Aggregate for a widget. Return a `number` for `formula`, or `CartoCategory[]` for
   * category/histogram/timeseries. If omitted, widgets show a "no data source" note.
   */
  onQuery?: (spec: CartoWidgetSpec) => Promise<number | CartoCategory[]>;
  /** Cross-filter callback: apply `where` (or clear with null) to the layer + map. */
  onFilter?: (layerId: string, where: string | null) => void;
  /**
   * Optional `@strata/actions` ActionBus. When set, a category click also emits a `categorySelect`
   * trigger `{ layerId, field, value }` so other widgets/panels react (not just the map).
   */
  bus?: { emit: (t: { type: string; source?: string; payload: unknown }) => void };
  /** Toggle a layer's visibility if no store is provided. */
  onToggleVisibility?: (layerId: string, visible: boolean) => void;
  title?: string;
  mode?: PanelMode;
  onClose?: () => void;
}

interface ActiveFilter {
  widgetId: string;
  layerId: string;
  field: string;
  label: string;
}

function sqlLit(v: string): string {
  return `'${v.replace(/'/g, "''")}'`;
}

export function CartoPanel(props: CartoPanelProps): React.ReactElement {
  const { store, widgets, onWidgetsChange, onQuery, onFilter, onToggleVisibility } = props;

  // ---- layer list from the store -------------------------------------------------------------
  const snapshot = useSyncExternalStore(
    store ? store.subscribe : () => () => {},
    () => (store ? store.getState() : null),
    () => (store ? store.getState() : null)
  );
  const layers: OperationalLayer[] = snapshot?.layers ?? [];
  const activeLayerId: string | null = snapshot?.activeLayerId ?? null;

  const setActive = useCallback(
    (id: string) => store?.getState().setActiveLayer?.(id),
    [store]
  );
  const setVisible = useCallback(
    (id: string, vis: boolean) => {
      if (store) store.getState().setVisibility?.(id, vis);
      else onToggleVisibility?.(id, vis);
    },
    [store, onToggleVisibility]
  );

  const [filter, setFilter] = useState<ActiveFilter | null>(null);

  const applyCategoryFilter = useCallback(
    (spec: CartoWidgetSpec, label: string) => {
      // toggle off if the same category is clicked
      if (filter && filter.widgetId === spec.id && filter.label === label) {
        setFilter(null);
        onFilter?.(spec.layerId, null);
        props.bus?.emit({ type: "categorySelect", source: "carto", payload: { layerId: spec.layerId, field: spec.field, value: null } });
        return;
      }
      const where = `${spec.field} = ${sqlLit(label)}`;
      setFilter({ widgetId: spec.id, layerId: spec.layerId, field: spec.field, label });
      onFilter?.(spec.layerId, where);
      props.bus?.emit({ type: "categorySelect", source: "carto", payload: { layerId: spec.layerId, field: spec.field, value: label } });
    },
    [filter, onFilter, props.bus]
  );

  const clearFilter = useCallback(() => {
    if (filter) {
      onFilter?.(filter.layerId, null);
      props.bus?.emit({ type: "categorySelect", source: "carto", payload: { layerId: filter.layerId, field: filter.field, value: null } });
    }
    setFilter(null);
  }, [filter, onFilter, props.bus]);

  const removeWidget = useCallback(
    (id: string) => onWidgetsChange?.(widgets.filter((w) => w.id !== id)),
    [widgets, onWidgetsChange]
  );

  const addWidget = useCallback(
    (kind: CartoWidgetKind) => {
      const layerId = activeLayerId ?? layers[0]?.id;
      if (!layerId) return;
      const id = `w-${Date.now().toString(36)}`;
      onWidgetsChange?.([...widgets, { id, kind, layerId, field: "", title: `New ${kind}` }]);
    },
    [widgets, onWidgetsChange, activeLayerId, layers]
  );

  return (
    <PanelShell
      title={props.title ?? "Layers & widgets"}
      mode={props.mode}
      onClose={props.onClose}
      defaultWidth={340}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Layer list */}
        <section>
          <div style={sectionLabel}>Layers</div>
          {layers.length === 0 && <div style={muted}>No layers.</div>}
          {layers.map((l) => (
            <div
              key={l.id}
              onClick={() => setActive(l.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 6px",
                borderRadius: 4,
                cursor: "pointer",
                background: l.id === activeLayerId ? "var(--strata-accent, #2b6cb0)22" : "transparent",
                borderLeft: `3px solid ${l.id === activeLayerId ? "var(--strata-accent, #2b6cb0)" : "transparent"}`,
              }}
            >
              <input
                type="checkbox"
                checked={l.visibility !== false}
                onChange={(e) => setVisible(l.id, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {l.title}
              </span>
            </div>
          ))}
        </section>

        {/* Filter status */}
        {filter && (
          <div style={{ ...muted, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              Filter: {filter.field} = {filter.label}
            </span>
            <button style={linkBtn} onClick={clearFilter}>
              clear
            </button>
          </div>
        )}

        {/* Widgets */}
        <section>
          <div style={{ ...sectionLabel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Widgets</span>
            <span>
              {(["category", "formula", "histogram", "timeseries"] as CartoWidgetKind[]).map((k) => (
                <button key={k} style={addBtn} title={`Add ${k} widget`} onClick={() => addWidget(k)}>
                  +{k[0].toUpperCase()}
                </button>
              ))}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {widgets.map((w) => (
              <CartoWidget
                key={w.id}
                spec={w}
                onQuery={onQuery}
                onRemove={() => removeWidget(w.id)}
                activeCategory={filter?.widgetId === w.id ? filter.label : null}
                onPickCategory={(label) => applyCategoryFilter(w, label)}
              />
            ))}
            {widgets.length === 0 && <div style={muted}>Add a widget (category, formula, histogram, time-series).</div>}
          </div>
        </section>
      </div>
    </PanelShell>
  );
}

// ---- one widget --------------------------------------------------------------------------------

function CartoWidget(props: {
  spec: CartoWidgetSpec;
  onQuery?: CartoPanelProps["onQuery"];
  onRemove: () => void;
  activeCategory: string | null;
  onPickCategory: (label: string) => void;
}): React.ReactElement {
  const { spec, onQuery, onRemove, activeCategory, onPickCategory } = props;
  const [num, setNum] = useState<number | null>(null);
  const [rows, setRows] = useState<CartoCategory[] | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error" | "nosource">("idle");
  const reqRef = useRef(0);

  useEffect(() => {
    if (!onQuery || !spec.field) {
      setState("nosource");
      return;
    }
    const req = ++reqRef.current;
    setState("loading");
    onQuery(spec)
      .then((res) => {
        if (req !== reqRef.current) return;
        if (typeof res === "number") setNum(res);
        else setRows(res.slice(0, spec.limit ?? 12));
        setState("idle");
      })
      .catch(() => req === reqRef.current && setState("error"));
  }, [onQuery, spec]);

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
      <span style={{ fontWeight: 600, fontSize: 12 }}>{spec.title ?? spec.field ?? spec.kind}</span>
      <button style={linkBtn} onClick={onRemove} title="Remove widget">
        ×
      </button>
    </div>
  );

  const body = () => {
    if (state === "loading") return <div style={muted}>Loading…</div>;
    if (state === "error") return <div style={{ ...muted, color: "var(--strata-critical,#e53e3e)" }}>Query failed.</div>;
    if (state === "nosource") return <div style={muted}>Set a field + onQuery to populate.</div>;

    if (spec.kind === "formula")
      return (
        <KpiCard
          label={spec.field}
          value={num == null ? "—" : num.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        />
      );

    if (spec.kind === "timeseries")
      return <Sparkline data={(rows ?? []).map((r) => r.value)} width={280} height={40} />;

    // category + histogram → clickable bars
    const data = rows ?? [];
    const max = Math.max(1, ...data.map((d) => d.value));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {data.map((d) => {
          const active = activeCategory === d.label;
          return (
            <div
              key={d.label}
              onClick={spec.kind === "category" ? () => onPickCategory(d.label) : undefined}
              style={{ cursor: spec.kind === "category" ? "pointer" : "default", opacity: activeCategory && !active ? 0.5 : 1 }}
              title={`${d.label}: ${d.value}`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                  {d.label}
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{d.value.toLocaleString()}</span>
              </div>
              <div style={{ height: 6, background: "var(--strata-border,#2a2f3a)", borderRadius: 3 }}>
                <div
                  style={{
                    width: `${(d.value / max) * 100}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: active ? "var(--strata-accent,#2b6cb0)" : "var(--strata-accent,#2b6cb0)cc",
                  }}
                />
              </div>
            </div>
          );
        })}
        {data.length === 0 && <div style={muted}>No results.</div>}
      </div>
    );
  };

  return (
    <div
      style={{
        border: "1px solid var(--strata-border,#2a2f3a)",
        borderRadius: 6,
        padding: 8,
        background: "var(--strata-panel-bg,#1a1f27)",
      }}
    >
      {header}
      {body()}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  color: "var(--strata-muted,#8b96a6)",
  margin: "2px 0 4px",
};
const muted: React.CSSProperties = { fontSize: 11, color: "var(--strata-muted,#8b96a6)" };
const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--strata-muted,#8b96a6)",
  cursor: "pointer",
  fontSize: 12,
};
const addBtn: React.CSSProperties = {
  background: "var(--strata-border,#2a2f3a)",
  border: "none",
  color: "var(--strata-fg,#e8eef5)",
  cursor: "pointer",
  fontSize: 10,
  borderRadius: 3,
  padding: "1px 4px",
  marginLeft: 3,
};

export default CartoPanel;
