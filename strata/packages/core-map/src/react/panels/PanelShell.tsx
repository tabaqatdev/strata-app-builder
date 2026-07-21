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
 * Context menu: a `⋯` header button AND right-click on the header open a small menu that
 * always includes "Open" (calls `onOpen`) and "Remove" (calls `onClose`, styled danger),
 * followed by any caller-supplied `contextMenuItems`.
 *
 * The shell owns no data — it is purely presentational, so a panel stays usable without a
 * live map. All map-facing behaviour is passed down by the panel via callbacks.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";

/** One entry in the header context menu. */
export interface PanelMenuItem {
  label: string;
  onSelect: () => void;
  /** Render in a danger (destructive) style. */
  danger?: boolean;
}

export type PanelMode = "floating" | "fixed";

export interface PanelShellProps {
  /** Header title text. */
  title: React.ReactNode;
  /** Layout mode. Defaults to "fixed" (docked, normal flow). */
  mode?: PanelMode;
  /** Initial left offset in px when floating. */
  initialX?: number;
  /** Initial top offset in px when floating. */
  initialY?: number;
  /** Fixed width in px (applies to both modes). */
  defaultWidth?: number;
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

  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

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
    width: props.defaultWidth,
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
