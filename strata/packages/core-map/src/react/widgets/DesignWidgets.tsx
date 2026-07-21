/**
 * DesignWidgets — Swipe, Bookmarks, and the Widget Controller dock ([ExB] Phase 3, MIT).
 *
 * - **Swipe** — two overlaid panes with a draggable vertical divider (the right pane is clipped). Drop two
 *   `map` widgets in for a compare view.
 * - **Bookmarks** — saved viewpoints; clicking flies the store's map there (`setView`) and/or calls
 *   `onSelect`.
 * - **WidgetController** — a floating launcher of toggle buttons that show/hide tool panels, so a
 *   multi-tool app isn't cluttered.
 */
import React, { useState } from "react";

// --- Placeholder (design-time) -----------------------------------------------------------------

export interface PlaceholderProps {
  /** Label shown in the reserved slot. */
  label?: string;
  /** Min height of the reserved area (px). */
  minHeight?: number;
  style?: React.CSSProperties;
  className?: string;
}

/** A design-time placeholder that reserves a layout slot (used in the studio editor). */
export function Placeholder(props: PlaceholderProps): React.ReactElement {
  return (
    <div
      className={props.className}
      data-strata-placeholder=""
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: props.minHeight ?? 80,
        border: "1px dashed var(--strata-border, rgba(255,255,255,0.3))",
        borderRadius: 8,
        color: "var(--strata-muted, #8b96a6)",
        fontSize: 13,
        ...props.style,
      }}
    >
      {props.label ?? "Placeholder"}
    </div>
  );
}

// --- Swipe -------------------------------------------------------------------------------------

export interface SwipeProps {
  left: React.ReactNode;
  right: React.ReactNode;
  /** Initial divider position as a percent 0–100 (default 50). */
  initial?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function Swipe(props: SwipeProps): React.ReactElement {
  const [pos, setPos] = useState(props.initial ?? 50);
  const ref = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const setFromClientX = (clientX: number): void => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = rect.width ? ((clientX - rect.left) / rect.width) * 100 : 50;
    setPos(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div
      ref={ref}
      className={props.className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...props.style }}
      onMouseMove={(e) => dragging.current && setFromClientX(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
    >
      <div style={{ position: "absolute", inset: 0 }}>{props.left}</div>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${pos}%)` }}>{props.right}</div>
      <div
        role="slider"
        aria-label="Swipe divider"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onMouseDown={() => (dragging.current = true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 2));
          if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 2));
        }}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${pos}%`,
          width: 4,
          marginLeft: -2,
          cursor: "ew-resize",
          background: "var(--strata-accent, #4ea1ff)",
          zIndex: 2,
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: -10,
            width: 24,
            height: 24,
            marginTop: -12,
            borderRadius: "50%",
            background: "var(--strata-accent, #4ea1ff)",
            color: "#0b0e13",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
          }}
        >
          ⇔
        </span>
      </div>
    </div>
  );
}

// --- Bookmarks ---------------------------------------------------------------------------------

export interface Bookmark {
  name: string;
  viewpoint: { center: [number, number]; zoom: number };
}

export interface BookmarksProps {
  bookmarks: Bookmark[];
  /** Optional store — clicking a bookmark applies its viewpoint via `setView`. */
  store?: { getState: () => any };
  /** Called with the chosen bookmark (in addition to the store). */
  onSelect?: (b: Bookmark) => void;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function Bookmarks(props: BookmarksProps): React.ReactElement {
  const pick = (b: Bookmark): void => {
    props.store?.getState().setView?.({ center: b.viewpoint.center, zoom: b.viewpoint.zoom });
    props.onSelect?.(b);
  };
  return (
    <div className={props.className} style={{ display: "flex", flexDirection: "column", gap: 4, ...props.style }}>
      {props.title ? <div style={{ fontWeight: 600, fontSize: 12, opacity: 0.8 }}>{props.title}</div> : null}
      {props.bookmarks.map((b) => (
        <button
          key={b.name}
          type="button"
          onClick={() => pick(b)}
          style={{
            textAlign: "start",
            font: "inherit",
            fontSize: 13,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid var(--strata-border, rgba(255,255,255,0.12))",
            background: "var(--strata-panel-bg, transparent)",
            color: "var(--strata-fg, #e8ecf1)",
            cursor: "pointer",
          }}
        >
          📍 {b.name}
        </button>
      ))}
    </div>
  );
}

// --- WidgetController (tool dock) --------------------------------------------------------------

export interface ControllerTool {
  id: string;
  label: string;
  icon?: string;
  /** The panel/content shown when this tool is toggled on. */
  content: React.ReactNode;
}

export interface WidgetControllerProps {
  tools: ControllerTool[];
  /** Tool ids open initially. */
  openIds?: string[];
  style?: React.CSSProperties;
  className?: string;
}

export function WidgetController(props: WidgetControllerProps): React.ReactElement {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries((props.openIds ?? []).map((id) => [id, true])),
  );
  const toggle = (id: string): void => setOpen((s) => ({ ...s, [id]: !s[id] }));
  return (
    <div className={props.className} style={{ display: "flex", flexDirection: "column", gap: 8, ...props.style }}>
      <div role="toolbar" aria-label="Tools" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {props.tools.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={!!open[t.id]}
            title={t.label}
            onClick={() => toggle(t.id)}
            style={{
              font: "inherit",
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid var(--strata-border, rgba(255,255,255,0.16))",
              cursor: "pointer",
              color: open[t.id] ? "#0b0e13" : "var(--strata-fg, #e8ecf1)",
              background: open[t.id] ? "var(--strata-accent, #4ea1ff)" : "transparent",
            }}
          >
            {t.icon ? <span aria-hidden>{t.icon} </span> : null}
            {t.label}
          </button>
        ))}
      </div>
      {props.tools.filter((t) => open[t.id]).map((t) => (
        <div key={t.id} data-tool={t.id}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
