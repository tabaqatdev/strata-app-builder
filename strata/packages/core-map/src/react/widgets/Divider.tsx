/**
 * @strata/core-map — Divider (MIT).
 *
 * A hairline separator. Plain React. Themed via CSS custom properties (`--strata-border`).
 */
import React from "react";

export interface DividerProps {
  /** Orientation (default `"horizontal"`). */
  orientation?: "horizontal" | "vertical";
  className?: string;
  style?: React.CSSProperties;
}

/** A hairline divider. */
export function Divider(props: DividerProps): React.ReactElement {
  const { orientation = "horizontal", className, style } = props;
  const vertical = orientation === "vertical";
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={className}
      style={{
        flex: "0 0 auto",
        alignSelf: "stretch",
        background: "var(--strata-border, rgba(255,255,255,0.08))",
        width: vertical ? 1 : undefined,
        height: vertical ? undefined : 1,
        margin: vertical ? "0 8px" : "8px 0",
        ...style,
      }}
    />
  );
}

export default Divider;
