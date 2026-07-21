/**
 * @strata/core-map — PageNav (`page-nav`) widget (Phase 7, MIT).
 *
 * A multi-page navigation control — a tab bar or a breadcrumb — over the app's pages. It reads the page
 * list, the active page, and the navigate callback from the `<StrataApp>` context, so dropping it into a
 * `header` gives real page navigation. Emits nothing itself; navigation flows through the app.
 */
import React from "react";
import { useStrataAppEnv } from "../app/interactivity.js";

export interface PageNavProps {
  /** `"tabs"` (default) = a segmented tab bar; `"breadcrumb"` = slash-separated crumbs. */
  variant?: "tabs" | "breadcrumb";
  style?: React.CSSProperties;
  className?: string;
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    font: "inherit",
    fontSize: 13,
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    color: active ? "var(--strata-primary-contrast, #0b0e13)" : "var(--strata-fg, #e8ecf1)",
    background: active ? "var(--strata-primary, var(--strata-accent, #4ea1ff))" : "transparent",
  };
}

function crumbStyle(active: boolean): React.CSSProperties {
  return {
    font: "inherit",
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    padding: "2px 4px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: active ? "var(--strata-fg, #e8ecf1)" : "var(--strata-muted, #8b95a5)",
  };
}

/** Multi-page navigation (tabs or breadcrumb), driven by the app context. */
export function PageNav(props: PageNavProps): React.ReactElement | null {
  const env = useStrataAppEnv();
  const pages = env?.pages ?? [];
  if (pages.length === 0) return null;
  const active = env?.activePageId;
  const breadcrumb = props.variant === "breadcrumb";
  const go = (id: string): void => env?.navigateToPage?.(id);

  return (
    <nav
      aria-label="Pages"
      className={props.className}
      style={{ display: "inline-flex", alignItems: "center", gap: breadcrumb ? 2 : 4, ...props.style }}
    >
      {pages.map((p, i) => (
        <React.Fragment key={p.id}>
          {breadcrumb && i > 0 ? <span style={{ color: "var(--strata-muted, #8b95a5)" }}>/</span> : null}
          <button
            type="button"
            aria-current={p.id === active ? "page" : undefined}
            disabled={!env?.navigateToPage}
            onClick={() => go(p.id)}
            style={breadcrumb ? crumbStyle(p.id === active) : tabStyle(p.id === active)}
          >
            {p.title ?? p.id}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

export default PageNav;
