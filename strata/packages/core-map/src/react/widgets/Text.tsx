/**
 * @strata/core-map — Text (MIT).
 *
 * A themed text block that renders as any intrinsic element (`p`, `h1`…`h6`, `span`, …). Plain
 * React. Themed via CSS custom properties (`--strata-fg`).
 */
import React from "react";

export interface TextProps {
  /** The text content. */
  content: string;
  /** Intrinsic element to render as (default `"p"`). */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

/** A themed text block rendered as the requested element. */
export function Text(props: TextProps): React.ReactElement {
  const { content, as = "p", className, style } = props;
  return React.createElement(
    as,
    {
      className,
      style: { margin: 0, color: "var(--strata-fg, #e8ecf1)", ...style },
    },
    content,
  );
}

export default Text;
