/**
 * @strata/core-map — Sparkline (MIT).
 *
 * A tiny inline SVG line chart with no dependencies. Renders `data` as a normalized polyline in a
 * fixed box; useful inside a KpiCard or a StatRow. Flat/empty data degrades to a mid-line.
 */
import React from "react";

export interface SparklineProps {
  /** The series to plot; drawn left→right, auto-scaled to the box. */
  data: number[];
  /** SVG width in pixels (default 80). */
  width?: number;
  /** SVG height in pixels (default 24). */
  height?: number;
  /** Stroke color (default `var(--strata-accent)`). */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** A minimal inline SVG sparkline. */
export function Sparkline(props: SparklineProps): React.ReactElement {
  const { data, width = 80, height = 24, color = "var(--strata-accent, #4ea1ff)", className, style } = props;
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  let points = "";
  if (data.length > 0) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const step = data.length > 1 ? w / (data.length - 1) : 0;
    points = data
      .map((v, i) => {
        const x = pad + i * step;
        const y = pad + h - ((v - min) / span) * h;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: "block", ...style }}
      role="img"
      aria-hidden="true"
    >
      {points ? (
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

export default Sparkline;
