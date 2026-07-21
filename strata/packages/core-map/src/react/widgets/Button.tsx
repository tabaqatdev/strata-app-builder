/**
 * @strata/core-map — Button (MIT).
 *
 * A themed action button with `primary` / `ghost` variants. Renders as an anchor when `href` is set,
 * else a `<button>`. Plain React. Themed via CSS custom properties (`--strata-accent`, `--strata-fg`,
 * `--strata-border`).
 */
import React from "react";

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  /** Visual variant (default `"primary"`). */
  variant?: "primary" | "ghost";
  className?: string;
  style?: React.CSSProperties;
  // --- injected by <StrataApp> (Phase 2): the button becomes a WIF event source ---
  /** `@strata/actions` bus — a click also emits a `buttonClick` trigger. Injected by `<StrataApp>`. */
  bus?: { emit: (t: { type: string; source?: string; payload: unknown }) => void };
  /** This widget's id (the trigger `source`); injected as `id`/`widgetId`. */
  id?: string;
  widgetId?: string;
  /** Optional value carried on the `buttonClick` payload (defaults to `label`). */
  value?: string;
}

/** A themed button (anchor when `href` is provided). */
export function Button(props: ButtonProps): React.ReactElement {
  const { label, onClick, href, variant = "primary", className, style } = props;
  const primary = variant === "primary";

  const handleClick = (): void => {
    onClick?.();
    props.bus?.emit({
      type: "buttonClick",
      source: props.id ?? props.widgetId,
      payload: { value: props.value ?? label },
    });
  };

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1,
    cursor: "pointer",
    textDecoration: "none",
    border: primary ? "1px solid transparent" : "1px solid var(--strata-border, rgba(255,255,255,0.16))",
    background: primary ? "var(--strata-accent, #4ea1ff)" : "transparent",
    color: primary ? "#0b0e13" : "var(--strata-fg, #e8ecf1)",
    ...style,
  };

  if (href != null) {
    return (
      <a href={href} className={className} style={baseStyle} onClick={handleClick}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" className={className} style={baseStyle} onClick={handleClick}>
      {label}
    </button>
  );
}

export default Button;
