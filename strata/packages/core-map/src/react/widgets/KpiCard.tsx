/**
 * @strata/core-map — KpiCard (MIT).
 *
 * A compact KPI / stat card: a big tabular-number value with an optional unit, a small-caps label,
 * an optional delta chip (▲/▼ colored by sign), a status accent stripe (ok/warn/critical), an
 * optional leading icon slot, and an optional inline `Sparkline`. Dependency-light: plain React +
 * inline SVG. Themed via CSS custom properties (`--strata-panel-bg`, `--strata-fg`, `--strata-muted`,
 * `--strata-ok`, `--strata-warn`, `--strata-critical`).
 */
import React, { useEffect, useState } from "react";
import type { DataSource } from "@strata/data-source";
import { Sparkline } from "./Sparkline.js";
import { useDataSource } from "../app/interactivity.js";

export type KpiStatus = "ok" | "warn" | "critical";

/** A live aggregate to compute from a bound `DataSource` (Phase 1). */
export interface KpiStat {
  field: string;
  op: "count" | "sum" | "avg" | "min" | "max";
}

export interface KpiCardProps {
  /** Small-caps caption above the value. */
  label: string;
  /**
   * The headline value (string or number). Rendered in tabular figures. Optional when `source` + `stat`
   * are provided — the value is then computed live from the data source and updates on filter/selection.
   */
  value?: string | number;
  /** A first-class DataSource (injected by `<StrataApp>` from the widget's `dataSource` binding). */
  source?: DataSource;
  /** When set with `source`, compute the value live from the source's filtered view. */
  stat?: KpiStat;
  /** Optional unit suffix (e.g. `"km²"`, `"%"`). */
  unit?: string;
  /** Signed change; its sign drives the ▲/▼ glyph and chip color. */
  delta?: number;
  /** Text shown next to the delta (e.g. `"vs last week"`). */
  deltaLabel?: string;
  /** Status accent color: green / amber / red. */
  status?: KpiStatus;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Optional inline sparkline series. */
  sparkline?: number[];
  className?: string;
  style?: React.CSSProperties;
}

const STATUS_COLOR: Record<KpiStatus, string> = {
  ok: "var(--strata-ok, #3ecf8e)",
  warn: "var(--strata-warn, #f5b83d)",
  critical: "var(--strata-critical, #f2545b)",
};

/** A single KPI / infographic card. */
export function KpiCard(props: KpiCardProps): React.ReactElement {
  const { label, value, source, stat, unit, delta, deltaLabel, status, icon, sparkline, className, style } =
    props;
  const accent = status ? STATUS_COLOR[status] : undefined;

  // Phase 1: when bound to a DataSource + a stat, compute the value live and recompute on every source
  // event (filterChange/selectionChange/countChange). Falls back to the static `value` prop otherwise.
  const version = useDataSource(source);
  const [computed, setComputed] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!source || !stat) {
      setComputed(undefined);
      return;
    }
    let alive = true;
    Promise.resolve(source.getStatistics([{ field: stat.field, op: stat.op, alias: "v" }])).then((res) => {
      if (alive) setComputed(Number(res.rows?.[0]?.v ?? 0));
    });
    return () => {
      alive = false;
    };
  }, [source, stat?.field, stat?.op, version]);

  const shownValue = computed !== undefined ? computed.toLocaleString() : value ?? "—";

  const hasDelta = typeof delta === "number" && !Number.isNaN(delta);
  const deltaUp = hasDelta && (delta as number) >= 0;
  const deltaColor = deltaUp ? "var(--strata-ok, #3ecf8e)" : "var(--strata-critical, #f2545b)";

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "12px 14px",
        borderRadius: 10,
        background: "var(--strata-panel-bg, #12151b)",
        color: "var(--strata-fg, #e8ecf1)",
        border: "1px solid var(--strata-border, rgba(255,255,255,0.08))",
        overflow: "hidden",
        ...style,
      }}
    >
      {accent ? (
        <span
          aria-hidden="true"
          style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent }}
        />
      ) : null}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon ? (
          <span style={{ display: "inline-flex", color: accent ?? "var(--strata-muted, #8b95a5)" }}>{icon}</span>
        ) : null}
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--strata-muted, #8b95a5)",
          }}
        >
          {label}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: '"tnum" 1',
          }}
        >
          {shownValue}
        </span>
        {unit ? <span style={{ fontSize: 13, color: "var(--strata-muted, #8b95a5)" }}>{unit}</span> : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 20 }}>
        {hasDelta ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 12,
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 999,
              color: deltaColor,
              background: "color-mix(in srgb, currentColor 16%, transparent)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span aria-hidden="true">{deltaUp ? "▲" : "▼"}</span>
            {Math.abs(delta as number)}
          </span>
        ) : null}
        {deltaLabel ? <span style={{ fontSize: 11, color: "var(--strata-muted, #8b95a5)" }}>{deltaLabel}</span> : null}
        {sparkline && sparkline.length > 0 ? (
          <span style={{ marginLeft: "auto" }}>
            <Sparkline data={sparkline} color={accent ?? "var(--strata-accent, #4ea1ff)"} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default KpiCard;
