/**
 * PanelShell — a reusable card wrapper for the management panels (MIT).
 *
 * Every panel (Layer / Basemap / AttributeTable / Chart) renders inside a PanelShell so
 * they share one chrome: a title header, an optional context menu, and two layout modes.
 *
 * Modes:
 *   - "fixed"    (default): a docked card in normal document flow — no drag, no overlay.
 *   - "floating": an absolutely-positioned card overlaid on the map; drag the HEADER to
 *                 move it (pointer events, clamped to the viewport), with a close (×) button.
 *
 * Resize: every panel is **resizable by default** (`resizable={false}` locks one). A docked panel
 * gets a width grip on its trailing edge; a floating panel also gets a height grip and a corner.
 * Grips are keyboard-operable (focus, then arrow keys) because a pointer-only affordance is not an
 * affordance for everyone. The size lives in component state for the session — the authored
 * `defaultWidth` stays the source of truth and a remount returns to it. Callers that must react to
 * the new box (a MapLibre map beside the panel needs `map.resize()`) pass `onResize`.
 *
 * Context menu: a `⋯` header button AND right-click on the header open a small menu that
 * always includes "Open" (calls `onOpen`) and "Remove" (calls `onClose`, styled danger),
 * followed by any caller-supplied `contextMenuItems`.
 *
 * The shell owns no data — it is purely presentational, so a panel stays usable without a
 * live map. All map-facing behaviour is passed down by the panel via callbacks.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { resizePanel } from "../app/splitterMath.js";

/** One entry in the header context menu. */
export interface PanelMenuItem {
  label: string;
  onSelect: () => void;
  /** Render in a danger (destructive) style. */
  danger?: boolean;
}

export type PanelMode = "floating" | "fixed";

/** Which edge a resize grip drives: `e` = width, `s` = height, `se` = both (the corner). */
export type ResizeAxis = "e" | "s" | "se";

export interface PanelShellProps {
  /** Header title text. */
  title: React.ReactNode;
  /** Layout mode. Defaults to "fixed" (docked, normal flow). */
  mode?: PanelMode;
  /** Initial left offset in px when floating. */
  initialX?: number;
  /** Initial top offset in px when floating. */
  initialY?: number;
  /** Starting width in px (applies to both modes). The user can resize from here unless locked. */
  defaultWidth?: number;
  /** Starting height in px. Floating only — a docked panel is sized by its container. */
  defaultHeight?: number;
  /** Let the user drag (or arrow-key) the panel's edges. Default true; `false` locks the size. */
  resizable?: boolean;
  /** Smallest width the user can drag to, in px. Default 200. */
  minWidth?: number;
  /** Largest width the user can drag to, in px. Default 960. */
  maxWidth?: number;
  /** Smallest height the user can drag to, in px (floating). Default 120. */
  minHeight?: number;
  /** Largest height the user can drag to, in px (floating). Default 900. */
  maxHeight?: number;
  /**
   * Called after each resize with the new box. Not for persistence — the size is session state — but
   * for side effects the panel cannot know about, above all `map.resize()` on an adjacent MapLibre map.
   */
  onResize?: (size: { width: number; height?: number }) => void;
  /** Called by the "Remove" menu item and the floating close (×) button. */
  onClose?: () => void;
  /** Called by the "Open" menu item. */
  onOpen?: () => void;
  /** Extra context-menu items appended after the built-in Open / Remove. */
  contextMenuItems?: PanelMenuItem[];
  /** Optional header-right controls (e.g. an add button) rendered before the ⋯ button. */
  headerExtra?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

/** Clamp `v` into the inclusive `[min, max]` range. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function PanelShell(props: PanelShellProps): React.ReactElement {
  const mode: PanelMode = props.mode ?? "fixed";
  const floating = mode === "floating";
  const { onClose, onOpen, contextMenuItems } = props;

  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: props.initialX ?? 24,
    y: props.initialY ?? 24,
  });
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  // Session size. Undefined = "as authored / as laid out"; a number = the user has dragged it.
  const [size, setSize] = useState<{ w?: number; h?: number }>({
    w: props.defaultWidth,
    h: props.defaultHeight,
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ axis: ResizeAxis; x: number; y: number; w: number; h: number } | null>(null);

  // --- header drag (floating only), via pointer events -----------------------
  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      if (!floating) return;
      // Don't start a drag from an interactive control inside the header.
      if ((e.target as HTMLElement).closest("button,input,select,a")) return;
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      e.preventDefault();
    },
    [floating],
  );

  const onHeaderPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const drag = dragRef.current;
      if (!drag) return;
      const el = rootRef.current;
      const w = el?.offsetWidth ?? props.defaultWidth ?? 320;
      const h = el?.offsetHeight ?? 200;
      const vw = typeof window !== "undefined" ? window.innerWidth : w;
      const vh = typeof window !== "undefined" ? window.innerHeight : h;
      const nextX = clamp(e.clientX - drag.dx, 0, Math.max(0, vw - w));
      const nextY = clamp(e.clientY - drag.dy, 0, Math.max(0, vh - h));
      setPos({ x: nextX, y: nextY });
    },
    [props.defaultWidth],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>): void => {
    dragRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  }, []);

  // --- resize (both modes; width docked, width + height floating) -------------
  const resizable = props.resizable !== false;
  const minW = props.minWidth ?? 200;
  const maxW = props.maxWidth ?? 960;
  const minH = props.minHeight ?? 120;
  const maxH = props.maxHeight ?? 900;
  const { onResize } = props;

  /** Apply a delta to the axis being dragged and report the new box. */
  const applyResize = useCallback(
    (axis: ResizeAxis, from: { w: number; h: number }, dx: number, dy: number): void => {
      const w = axis === "s" ? from.w : resizePanel(from.w, dx, minW, maxW);
      const h = axis === "e" ? from.h : resizePanel(from.h, dy, minH, maxH);
      setSize({ w, h: floating ? h : undefined });
      onResize?.({ width: w, ...(floating ? { height: h } : null) });
    },
    [floating, minW, maxW, minH, maxH, onResize],
  );

  /** The box a drag starts from — the measured element, so an unsized panel resizes from where it is. */
  const startBox = useCallback((): { w: number; h: number } => {
    const rect = rootRef.current?.getBoundingClientRect();
    return { w: size.w ?? rect?.width ?? minW, h: size.h ?? rect?.height ?? minH };
  }, [size.w, size.h, minW, minH]);

  const onGripPointerDown = useCallback(
    (axis: ResizeAxis) =>
      (e: React.PointerEvent<HTMLDivElement>): void => {
        if (!resizable) return;
        const from = startBox();
        resizeRef.current = { axis, x: e.clientX, y: e.clientY, w: from.w, h: from.h };
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        e.preventDefault();
        e.stopPropagation();
      },
    [resizable, startBox],
  );

  const onGripPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const r = resizeRef.current;
      if (!r) return;
      applyResize(r.axis, { w: r.w, h: r.h }, e.clientX - r.x, e.clientY - r.y);
    },
    [applyResize],
  );

  const endResize = useCallback((e: React.PointerEvent<HTMLDivElement>): void => {
    resizeRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  }, []);

  /** Arrow keys resize a focused grip — a pointer-only grip is unusable by keyboard and touch alike. */
  const onGripKeyDown = useCallback(
    (axis: ResizeAxis) =>
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (!resizable) return;
        const step = e.shiftKey ? 48 : 16;
        const dx = e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0;
        const dy = e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0;
        if (!dx && !dy) return;
        e.preventDefault();
        applyResize(axis, startBox(), dx, dy);
      },
    [resizable, applyResize, startBox],
  );

  /** One grip: an edge (or corner) separator that is draggable and arrow-key operable. */
  const grip = (axis: ResizeAxis): React.ReactElement => (
    <div
      role="separator"
      tabIndex={0}
      data-strata-panel-resize={axis}
      aria-orientation={axis === "s" ? "horizontal" : "vertical"}
      aria-label={axis === "e" ? "Resize panel width" : axis === "s" ? "Resize panel height" : "Resize panel"}
      onPointerDown={onGripPointerDown(axis)}
      onPointerMove={onGripPointerMove}
      onPointerUp={endResize}
      onPointerCancel={endResize}
      onKeyDown={onGripKeyDown(axis)}
      style={gripStyle(axis)}
    />
  );

  // --- context menu ----------------------------------------------------------
  const openMenuAt = useCallback((x: number, y: number): void => {
    setMenu({ x, y });
  }, []);

  const onHeaderContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      e.preventDefault();
      openMenuAt(e.clientX, e.clientY);
    },
    [openMenuAt],
  );

  const toggleMenuButton = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.stopPropagation();
      if (menu) {
        setMenu(null);
        return;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      openMenuAt(rect.right, rect.bottom);
    },
    [menu, openMenuAt],
  );

  // Close the menu on any outside click / Escape.
  useEffect(() => {
    if (!menu) return;
    const onDown = (): void => setMenu(null);
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === "Escape") setMenu(null);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const items: PanelMenuItem[] = [
    ...(onOpen ? [{ label: "Open", onSelect: onOpen }] : []),
    ...(contextMenuItems ?? []),
    ...(onClose ? [{ label: "Remove", onSelect: onClose, danger: true }] : []),
  ];

  const rootStyle: React.CSSProperties = {
    ...baseShellStyle,
    // position:relative so the edge grips have this card as their containing block when docked.
    position: "relative",
    width: size.w ?? props.defaultWidth,
    // An explicit height must beat the shell's `maxHeight:100%`, or a dragged-taller panel snaps back.
    ...(floating && size.h ? { height: size.h, maxHeight: "none" } : null),
    ...(floating
      ? { position: "absolute", left: pos.x, top: pos.y, zIndex: 1000, boxShadow: "0 8px 28px rgba(0,0,0,.18)" }
      : null),
    ...props.style,
  };

  return (
    <div ref={rootRef} className={props.className} style={rootStyle}>
      <div
        style={{ ...headerStyle, cursor: floating ? "move" : "default", touchAction: floating ? "none" : undefined }}
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onContextMenu={onHeaderContextMenu}
      >
        <span style={titleStyle}>{props.title}</span>
        <div style={{ flex: 1 }} />
        {props.headerExtra}
        {items.length > 0 && (
          <button type="button" style={headerBtnStyle} title="Menu" aria-label="Panel menu" onClick={toggleMenuButton}>
            ⋯
          </button>
        )}
        {floating && onClose && (
          <button
            type="button"
            style={headerBtnStyle}
            title="Close"
            aria-label="Close panel"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>
        )}
      </div>

      <div style={bodyStyle}>{props.children}</div>

      {/* Width on both modes; height and the corner only where the card owns its own box. */}
      {resizable && grip("e")}
      {resizable && floating && grip("s")}
      {resizable && floating && grip("se")}

      {menu && items.length > 0 && (
        <div
          style={{ ...menuStyle, left: menu.x, top: menu.y }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {items.map((it, i) => (
            <button
              key={`${it.label}-${i}`}
              type="button"
              style={{ ...menuItemStyle, ...(it.danger ? menuItemDangerStyle : null) }}
              onClick={() => {
                setMenu(null);
                it.onSelect();
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PanelShell;

// --- inline styles ---------------------------------------------------------
const baseShellStyle: React.CSSProperties = {
  font: "13px/1.4 system-ui, sans-serif",
  color: "#1a1a1a",
  background: "#fff",
  border: "1px solid #e2e2e2",
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  maxHeight: "100%",
  overflow: "hidden",
};
const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  borderBottom: "1px solid #eee",
  userSelect: "none",
};
const titleStyle: React.CSSProperties = {
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const headerBtnStyle: React.CSSProperties = {
  font: "14px system-ui, sans-serif",
  minWidth: 24,
  height: 24,
  padding: "0 6px",
  border: "1px solid #d5d5d5",
  borderRadius: 4,
  background: "#fafafa",
  cursor: "pointer",
  lineHeight: 1,
};
const bodyStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "auto",
};
/**
 * A resize grip: a thin hit target on the edge it drives, transparent until hovered or focused so the
 * card's chrome stays clean. `touchAction:"none"` is required or a touch drag scrolls the page instead.
 */
function gripStyle(axis: ResizeAxis): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    touchAction: "none",
    background: "transparent",
    zIndex: 1,
  };
  if (axis === "e") {
    return { ...base, top: 0, bottom: 0, right: 0, width: 6, cursor: "col-resize" };
  }
  if (axis === "s") {
    return { ...base, left: 0, right: 0, bottom: 0, height: 6, cursor: "row-resize" };
  }
  // The corner sits above both edge grips so a diagonal drag is not stolen by whichever edge is on top.
  return { ...base, right: 0, bottom: 0, width: 14, height: 14, cursor: "nwse-resize", zIndex: 2 };
}

const menuStyle: React.CSSProperties = {
  position: "fixed",
  zIndex: 2000,
  minWidth: 160,
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 6,
  boxShadow: "0 6px 20px rgba(0,0,0,.16)",
  padding: 4,
  display: "flex",
  flexDirection: "column",
};
const menuItemStyle: React.CSSProperties = {
  font: "13px system-ui, sans-serif",
  textAlign: "left",
  padding: "6px 10px",
  border: "none",
  borderRadius: 4,
  background: "transparent",
  color: "#1a1a1a",
  cursor: "pointer",
};
const menuItemDangerStyle: React.CSSProperties = { color: "#c53030" };
