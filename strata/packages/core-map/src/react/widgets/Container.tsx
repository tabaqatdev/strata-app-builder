/**
 * @strata/core-map — Container (MIT).
 *
 * The layout primitive: a flex box arranged in a `row` or `column`. In `flow` mode it is a normal
 * flex container; in `fixed` mode it is `position:relative` so children can be absolutely positioned
 * (Experience-Builder fixed layout). Plain React.
 */
import React from "react";

export interface ContainerProps {
  /** Main axis. */
  direction: "row" | "column";
  /** "flow" = flex; "fixed" = position:relative for absolute children (default "flow"). */
  mode?: "fixed" | "flow";
  /** Gap between children (px, default 12). */
  gap?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** A flex/positioned layout container. */
export function Container(props: ContainerProps): React.ReactElement {
  const { direction, mode = "flow", gap = 12, children, className, style } = props;
  const fixed = mode === "fixed";

  const baseStyle: React.CSSProperties = fixed
    ? { position: "relative", width: "100%", height: "100%", ...style }
    : { display: "flex", flexDirection: direction, gap, minWidth: 0, ...style };

  return (
    <div className={className} style={baseStyle}>
      {children}
    </div>
  );
}

export default Container;
