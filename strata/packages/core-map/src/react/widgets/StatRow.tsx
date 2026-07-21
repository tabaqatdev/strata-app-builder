/**
 * @strata/core-map — StatRow (MIT).
 *
 * A compact label/value row for lists (feature attribute readouts, summary stacks). Label on the
 * left in muted small caps, value on the right in tabular figures, with a hairline separator.
 * Dependency-light: plain React. Themed via CSS custom properties.
 */
import React from "react";

export interface StatRowProps {
  /** Left-hand caption. */
  label: string;
  /** Right-hand value (string or number). */
  value: React.ReactNode;
  /** Optional unit suffix after the value. */
  unit?: string;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Draw a hairline bottom border (default true). */
  divider?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** A single label/value list row. */
export function StatRow(props: StatRowProps): React.ReactElement {
  const { label, value, unit, icon, divider = true, className, style } = props;
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 0",
        borderBottom: divider ? "1px solid var(--strata-border, rgba(255,255,255,0.08))" : undefined,
        color: "var(--strata-fg, #e8ecf1)",
        ...style,
      }}
    >
      {icon ? <span style={{ display: "inline-flex", color: "var(--strata-muted, #8b95a5)" }}>{icon}</span> : null}
      <span style={{ fontSize: 12, color: "var(--strata-muted, #8b95a5)" }}>{label}</span>
      <span
        style={{
          marginLeft: "auto",
          fontSize: 13,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        {unit ? <span style={{ marginLeft: 3, fontWeight: 400, color: "var(--strata-muted, #8b95a5)" }}>{unit}</span> : null}
      </span>
    </div>
  );
}

export default StatRow;
