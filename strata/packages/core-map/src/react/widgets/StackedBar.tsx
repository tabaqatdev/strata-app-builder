/**
 * @strata/core-map — StackedBar (MIT).
 *
 * A dependency-free stacked (or grouped) bar built from inline SVG, with a small swatch legend.
 * Each series contributes one segment; `horizontal` (default) stacks left→right, otherwise the bar
 * stacks bottom→top. Segment widths/heights are proportional to `value / sum`. Themed via CSS
 * custom properties for chrome; segment colors come from each series' `color`.
 */
import React from "react";

export interface StackedBarSeries {
  label: string;
  value: number;
  /** CSS color for this segment / legend swatch. */
  color: string;
}

export interface StackedBarProps {
  /** The segments to stack. Non-positive values are ignored in the geometry. */
  series: StackedBarSeries[];
  /** Optional title above the bar. */
  title?: string;
  /** Horizontal stack (default true). When false, stacks vertically. */
  horizontal?: boolean;
  /** Bar thickness in pixels (default 24). */
  thickness?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** A stacked bar + legend. */
export function StackedBar(props: StackedBarProps): React.ReactElement {
  const { series, title, horizontal = true, thickness = 24, className, style } = props;
  const positive = series.filter((s) => s.value > 0);
  const total = positive.reduce((sum, s) => sum + s.value, 0) || 1;

  // Build cumulative segments as fractions of the total.
  let offset = 0;
  const segments = positive.map((s) => {
    const frac = s.value / total;
    const seg = { ...s, start: offset, frac };
    offset += frac;
    return seg;
  });

  const LENGTH = 100; // coordinate space along the stacking axis (viewBox units)
  const barLen = LENGTH;

  return (
    <div className={className} style={{ color: "var(--strata-fg, #e8ecf1)", ...style }}>
      {title ? (
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--strata-muted, #8b95a5)",
            marginBottom: 8,
          }}
        >
          {title}
        </div>
      ) : null}

      <svg
        width="100%"
        height={horizontal ? thickness : 140}
        viewBox={horizontal ? `0 0 ${LENGTH} ${thickness}` : `0 0 ${thickness} ${LENGTH}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={title ?? "Stacked bar"}
      >
        {segments.map((s, i) =>
          horizontal ? (
            <rect
              key={i}
              x={s.start * barLen}
              y={0}
              width={s.frac * barLen}
              height={thickness}
              fill={s.color}
            >
              <title>{`${s.label}: ${s.value}`}</title>
            </rect>
          ) : (
            <rect
              key={i}
              // Vertical: draw from the bottom up, so invert the offset.
              x={0}
              y={(1 - s.start - s.frac) * barLen}
              width={thickness}
              height={s.frac * barLen}
              fill={s.color}
            >
              <title>{`${s.label}: ${s.value}`}</title>
            </rect>
          ),
        )}
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8 }}>
        {positive.map((s, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span
              aria-hidden="true"
              style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: "inline-block" }}
            />
            <span style={{ color: "var(--strata-muted, #8b95a5)" }}>{s.label}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default StackedBar;
