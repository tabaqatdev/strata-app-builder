/**
 * @strata/core-map — Card (MIT).
 *
 * A content container (CARTO / Experience-Builder card): optional title, optional link, and an
 * optional hover state. Dependency-light: plain React. Themed via CSS custom properties with dark
 * defaults (`--strata-panel-bg`, `--strata-fg`, `--strata-border`, `--strata-accent`).
 */
import React, { useState } from "react";

export interface CardProps {
  /** Optional heading rendered at the top of the card. */
  title?: string;
  /** Card body. */
  children?: React.ReactNode;
  /** When set, the card renders as an anchor to this href. */
  href?: string;
  /** Enable a lift/border-accent hover affordance. */
  hoverable?: boolean;
  /** Click handler (also used when there is no `href`). */
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/** A content container card with an optional link and hover state. */
export function Card(props: CardProps): React.ReactElement {
  const { title, children, href, hoverable, onClick, className, style } = props;
  const [hover, setHover] = useState(false);
  const interactive = hoverable || href != null || onClick != null;

  const baseStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "14px 16px",
    borderRadius: 10,
    background: "var(--strata-panel-bg, #12151b)",
    color: "var(--strata-fg, #e8ecf1)",
    border: "1px solid var(--strata-border, rgba(255,255,255,0.08))",
    textDecoration: "none",
    cursor: interactive ? "pointer" : "default",
    transition: "transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
    transform: hover && interactive ? "translateY(-2px)" : undefined,
    borderColor: hover && interactive ? "var(--strata-accent, #4ea1ff)" : undefined,
    boxShadow: hover && interactive ? "0 6px 18px rgba(0,0,0,0.35)" : undefined,
    ...style,
  };

  const inner = (
    <>
      {title != null ? (
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--strata-fg, #e8ecf1)" }}>{title}</span>
      ) : null}
      {children}
    </>
  );

  const shared = {
    className,
    style: baseStyle,
    onMouseEnter: interactive ? () => setHover(true) : undefined,
    onMouseLeave: interactive ? () => setHover(false) : undefined,
    onClick,
  };

  if (href != null) {
    return (
      <a href={href} {...shared}>
        {inner}
      </a>
    );
  }
  return <div {...shared}>{inner}</div>;
}

export default Card;
