/**
 * @strata/core-map — TimeSeries (MIT).
 *
 * A dependency-light inline-SVG line/area chart over a `{ t, value }[]` series, with optional horizontal
 * **threshold bands** (e.g. flood-stage or acres-burned severity bands). This is the flood **hydrograph**
 * and the wildfire acres-trend widget. Auto-scales to the data, draws a faint filled area under the line,
 * and offers light hover with a per-point callback. Themed via CSS custom properties (dark defaults):
 * `--strata-panel-bg`, `--strata-fg`, `--strata-muted`, `--strata-border`, `--strata-accent`.
 */
import React, { useState } from "react";

/** A single sample: `t` is an x-axis value (typically epoch-millis); `value` is the y measurement. */
export interface TimeSeriesPoint {
  t: number;
  value: number;
}

/** A horizontal threshold band drawn behind the series between `min` and `max` on the y-axis. */
export interface TimeSeriesBand {
  label: string;
  color: string;
  min: number;
  max: number;
}

export interface TimeSeriesProps {
  /** The series to plot, drawn left→right in array order and auto-scaled to the box. */
  data: TimeSeriesPoint[];
  /** Optional horizontal threshold bands (flood stage / severity), drawn behind the line. */
  bands?: TimeSeriesBand[];
  /** Optional heading shown above the chart. */
  title?: string;
  /** SVG width in pixels (default 320). */
  width?: number;
  /** SVG height in pixels (default 120). */
  height?: number;
  /** Line + area stroke color (default `var(--strata-accent)`). */
  color?: string;
  /** Called with the point index when a marker is clicked. */
  onPointClick?: (i: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** Inline-SVG time-series line/area chart with optional threshold bands. */
export function TimeSeries(props: TimeSeriesProps): React.ReactElement {
  const {
    data,
    bands,
    title,
    width = 320,
    height = 120,
    color = "var(--strata-accent, #4ea1ff)",
    onPointClick,
    className,
    style,
  } = props;
  const [hover, setHover] = useState<number | null>(null);

  const padX = 6;
  const padTop = 6;
  const padBottom = 6;
  const w = Math.max(1, width - padX * 2);
  const h = Math.max(1, height - padTop - padBottom);

  // Y domain spans the data and every band, so bands are always visible on the same scale.
  const values = data.map((d) => d.value);
  const bandMins = (bands ?? []).map((b) => b.min);
  const bandMaxs = (bands ?? []).map((b) => b.max);
  const allLo = [...values, ...bandMins];
  const allHi = [...values, ...bandMaxs];
  const yMin = allLo.length > 0 ? Math.min(...allLo) : 0;
  const yMax = allHi.length > 0 ? Math.max(...allHi) : 1;
  const ySpan = yMax - yMin || 1;

  const xAt = (i: number): number =>
    padX + (data.length > 1 ? (i / (data.length - 1)) * w : w / 2);
  const yAt = (v: number): number => padTop + h - ((v - yMin) / ySpan) * h;

  const linePoints = data.map((d, i) => `${xAt(i).toFixed(2)},${yAt(d.value).toFixed(2)}`).join(" ");
  const areaPath =
    data.length > 0
      ? `M ${xAt(0).toFixed(2)} ${(padTop + h).toFixed(2)} ` +
        data.map((d, i) => `L ${xAt(i).toFixed(2)} ${yAt(d.value).toFixed(2)}`).join(" ") +
        ` L ${xAt(data.length - 1).toFixed(2)} ${(padTop + h).toFixed(2)} Z`
      : "";

  return (
    <div className={className} style={{ color: "var(--strata-fg, #e8eef5)", ...style }}>
      {title != null && (
        <div style={{ font: "12px/1.4 var(--strata-sans, system-ui, sans-serif)", marginBottom: 4, opacity: 0.9 }}>
          {title}
        </div>
      )}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
        role="img"
        aria-label={title ?? "time series"}
      >
        {(bands ?? []).map((b, i) => {
          const top = yAt(b.max);
          const bottom = yAt(b.min);
          return (
            <g key={`band-${i}`}>
              <rect
                x={padX}
                y={Math.min(top, bottom)}
                width={w}
                height={Math.abs(bottom - top)}
                fill={b.color}
                opacity={0.16}
              />
              <line x1={padX} x2={padX + w} y1={top} y2={top} stroke={b.color} strokeWidth={1} strokeDasharray="3 3" opacity={0.55} />
              <title>{b.label}</title>
            </g>
          );
        })}
        {areaPath && <path d={areaPath} fill={color} opacity={0.12} />}
        {linePoints && (
          <polyline
            points={linePoints}
            fill="none"
            stroke={color}
            strokeWidth={1.75}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {data.map((d, i) => (
          <circle
            key={`pt-${i}`}
            cx={xAt(i)}
            cy={yAt(d.value)}
            r={hover === i ? 4 : 2.25}
            fill={color}
            stroke="var(--strata-panel-bg, #1a1f27)"
            strokeWidth={hover === i ? 1.5 : 0}
            style={{ cursor: onPointClick ? "pointer" : "default" }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((cur) => (cur === i ? null : cur))}
            onClick={onPointClick ? () => onPointClick(i) : undefined}
          >
            <title>{`${d.t}: ${d.value}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

export default TimeSeries;
