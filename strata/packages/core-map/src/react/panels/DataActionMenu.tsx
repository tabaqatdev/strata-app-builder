/**
 * @strata/core-map — DataActionMenu (WIF W3, MIT).
 *
 * The quick-actions menu surfaced on a feature/row selection: Zoom · Flash · View-in-table · Export · Clear
 * (plus any app-supplied actions). Each item dispatches through the shared `ActionBus` (`@strata/actions`
 * `DataAction.run`), so it drives every bus-aware sink — the map zooms/flashes, the table filters — without
 * bespoke wiring.
 *
 * Two modes:
 *   - **controlled** — pass a `selection`; the menu shows for that selection.
 *   - **auto** — omit `selection`; the menu subscribes to `featureSelect`/`rowSelect` on the bus and tracks
 *     the latest selection itself (this is the "surfaces on selection" behavior `<StrataApp>` wires by
 *     default when the widget is dropped in).
 */
import React, { useEffect, useState } from "react";
import {
  type ActionBus,
  type DataAction,
  type FeatureSelectPayload,
  defaultDataActions,
} from "@strata/actions";

export interface DataActionMenuProps {
  /** The shared action bus (injected by `<StrataApp>` as `bus`). */
  bus: ActionBus;
  /** Controlled selection. Omit to auto-track `featureSelect`/`rowSelect` from the bus. */
  selection?: { layerId: string; oids: number[] } | null;
  /** Actions to offer (default: `defaultDataActions`). */
  actions?: DataAction[];
  /** Called after an action runs (e.g. to close a popover). */
  onAction?: (id: string) => void;
  /** Hide when there is no selection (default true). */
  hideWhenEmpty?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function DataActionMenu(props: DataActionMenuProps): React.ReactElement | null {
  const { bus, actions = defaultDataActions, hideWhenEmpty = true } = props;
  const controlled = props.selection !== undefined;
  const [tracked, setTracked] = useState<{ layerId: string; oids: number[] } | null>(null);

  useEffect(() => {
    if (controlled) return;
    const onSel = (t: { payload: FeatureSelectPayload }) =>
      setTracked({ layerId: t.payload.layerId, oids: t.payload.oids });
    const offs = [
      bus.on<FeatureSelectPayload>("featureSelect", onSel),
      bus.on<FeatureSelectPayload>("rowSelect", onSel),
      bus.on("clear", () => setTracked(null)),
    ];
    return () => offs.forEach((o) => o());
  }, [bus, controlled]);

  const selection = controlled ? props.selection ?? null : tracked;
  const hasSelection = !!selection && selection.oids.length > 0;
  if (hideWhenEmpty && !hasSelection) return null;

  return (
    <div role="menu" aria-label="Data actions" style={{ ...menuStyle, ...props.style }} className={props.className}>
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          role="menuitem"
          disabled={!hasSelection}
          style={itemStyle}
          onClick={() => {
            if (selection) a.run({ bus, selection });
            props.onAction?.(a.id);
          }}
        >
          {a.icon ? <span aria-hidden style={{ opacity: 0.85 }}>{a.icon}</span> : null}
          {a.label}
        </button>
      ))}
    </div>
  );
}

export default DataActionMenu;

const menuStyle: React.CSSProperties = {
  display: "inline-flex",
  flexWrap: "wrap",
  gap: 4,
  padding: 6,
  borderRadius: 10,
  background: "var(--strata-panel-bg, #12151b)",
  border: "1px solid var(--strata-border, rgba(255,255,255,0.10))",
};
const itemStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  font: "inherit",
  fontSize: 12,
  fontWeight: 600,
  padding: "5px 10px",
  borderRadius: 7,
  border: "1px solid var(--strata-border, rgba(255,255,255,0.12))",
  background: "transparent",
  color: "var(--strata-fg, #e8ecf1)",
  cursor: "pointer",
};
