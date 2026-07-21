/**
 * @strata/core-map — RadialGauge (MIT).
 *
 * An SVG arc gauge for a 0–100 value. The arc fills proportionally and is colored by thresholds.
 * By default lower is worse (`value < warn` → critical/red, `warn..critical` → warn/amber,
 * `> critical` → ok/green). Many map metrics are "higher is better" (e.g. % contained, coverage),
 * so `invertColors` flips the mapping without changing the fill geometry. Dependency-light: inline
 * SVG only. Themed via CSS custom properties.
 */
import React, { useEffect, useState } from "react";
import type { DataSource } from "@strata/data-source";
import { useDataSource } from "../app/interactivity.js";

/** A live aggregate to compute from a bound `DataSource` (Phase 1). */
export interface GaugeStat {
  field: string;
  op: "count" | "sum" | "avg" | "min" | "max";
}

export interface GaugeThresholds {
  /** Below/above this (per `invertColors`) is the warn band boundary. */
  warn: number;
  /** Below/above this (per `invertColors`) is the critical band boundary. */
  critical: number;
}

export interface RadialGaugeProps {
  /** The value to display, clamped to 0–100. Optional when `source` + `stat` compute it live. */
  value?: number;
  /** A first-class DataSource (injected by `<StrataApp>` from the widget's `dataSource` binding). */
  source?: DataSource;
  /** When set with `source`, compute the value live from the source's filtered view. */
  stat?: GaugeStat;
  /** Caption under the value. */
  label?: string;
  /**
   * Band boundaries on the 0–100 scale (default `{ warn: 30, critical: 70 }` reads as: below 30 is
   * critical, 30–70 is warn, above 70 is ok — i.e. higher is better).
   */
  thresholds?: GaugeThresholds;
  /**
   * When true, higher is worse: color mapping is reversed (below `warn` → ok, above `critical` →
   * critical). Default false (higher is better).
   */
  invertColors?: boolean;
  /** Square SVG size in pixels (default 120). */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const OK = "var(--strata-ok, #3ecf8e)";
const WARN = "var(--strata-warn, #f5b83d)";
const CRITICAL = "var(--strata-critical, #f2545b)";

/** Pick the arc color for `value` given the thresholds and orientation. */
function gaugeColor(value: number, t: GaugeThresholds, invert: boolean): string {
  // Non-inverted (higher is better): >=critical → ok, >=warn → warn, else critical.
  if (!invert) {
    if (value >= t.critical) return OK;
    if (value >= t.warn) return WARN;
    return CRITICAL;
  }
  // Inverted (higher is worse): >=critical → critical, >=warn → warn, else ok.
  if (value >= t.critical) return CRITICAL;
  if (value >= t.warn) return WARN;
  return OK;
}

/** Convert a polar point on the gauge circle (angle in degrees) to SVG coordinates. */
function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/** Build an SVG arc `d` between two angles (degrees, sweeping clockwise). */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const [sx, sy] = polar(cx, cy, r, startDeg);
  const [ex, ey] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

/** A 270° open-bottom radial gauge. */
export function RadialGauge(props: RadialGaugeProps): React.ReactElement {
  const {
    value,
    source,
    stat,
    label,
    thresholds = { warn: 30, critical: 70 },
    invertColors = false,
    size = 120,
    className,
    style,
  } = props;

  // Phase 1: compute the value live from a bound DataSource + stat, recomputing on every source event.
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

  const raw = computed !== undefined ? computed : value ?? 0;
  const clamped = Math.max(0, Math.min(100, Number.isFinite(raw) ? raw : 0));
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  // Sweep 270°: start at 135° (bottom-left) clockwise to 45° (bottom-right) = 405°.
  const START = 135;
  const SWEEP = 270;
  const endDeg = START + (clamped / 100) * SWEEP;
  const color = gaugeColor(clamped, thresholds, invertColors);
  const stroke = Math.max(6, Math.round(size * 0.08));

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        color: "var(--strata-fg, #e8ecf1)",
        ...style,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `Gauge ${clamped}`}>
        {/* Track */}
        <path
          d={arcPath(cx, cy, r, START, START + SWEEP)}
          fill="none"
          stroke="var(--strata-border, rgba(255,255,255,0.12))"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {clamped > 0 ? (
          <path d={arcPath(cx, cy, r, START, endDeg)} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        ) : null}
        {/* Center readout */}
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.26}
          fontWeight={700}
          fill="var(--strata-fg, #e8ecf1)"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(clamped)}
        </text>
      </svg>
      {label ? (
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--strata-muted, #8b95a5)",
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

export default RadialGauge;
