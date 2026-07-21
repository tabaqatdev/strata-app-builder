/**
 * @strata/core-map — Menu (MIT).
 *
 * A simple vertical menu of selectable items (link or callback). Plain React. Themed via CSS custom
 * properties (`--strata-fg`, `--strata-muted`, `--strata-border`, `--strata-accent`).
 */
import React, { useState } from "react";

export interface MenuItem {
  label: string;
  onSelect?: () => void;
  href?: string;
}

export interface MenuProps {
  items: MenuItem[];
  className?: string;
  style?: React.CSSProperties;
}

/** A vertical list menu. */
export function Menu(props: MenuProps): React.ReactElement {
  const { items, className, style } = props;
  const [hover, setHover] = useState<number | null>(null);

  return (
    <nav
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid var(--strata-border, rgba(255,255,255,0.08))",
        background: "var(--strata-panel-bg, #12151b)",
        ...style,
      }}
    >
      {items.map((item, i) => {
        const itemStyle: React.CSSProperties = {
          display: "block",
          padding: "9px 14px",
          fontSize: 13,
          textAlign: "left",
          textDecoration: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--strata-fg, #e8ecf1)",
          background: hover === i ? "var(--strata-accent, #4ea1ff)" : "transparent",
          borderTop: i > 0 ? "1px solid var(--strata-border, rgba(255,255,255,0.08))" : undefined,
        };
        const shared = {
          style: itemStyle,
          onMouseEnter: () => setHover(i),
          onMouseLeave: () => setHover((h) => (h === i ? null : h)),
        };
        if (item.href != null) {
          return (
            <a key={i} href={item.href} onClick={item.onSelect} {...shared}>
              {item.label}
            </a>
          );
        }
        return (
          <button key={i} type="button" onClick={item.onSelect} {...shared}>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default Menu;
