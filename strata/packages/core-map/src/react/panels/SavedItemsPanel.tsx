/**
 * SavedItemsPanel — one config-driven panel for any list of saved items (charts, tables, bookmarks, …).
 *
 * Harvested from the Strata GeoAI `makeManagerPanel(cfg)` factory (Analysis §3.5): a single reusable
 * panel drives Charts and Tables (and anything else) with `{ label, items, onAdd, open, rename, remove }`.
 * Pairs with the "expression, not snapshot" model (`materializeChart`/`materializeTable`) so a saved item
 * is a tiny re-runnable descriptor, not baked data.
 */
import React, { useState } from "react";
import { PanelShell, type PanelMode } from "./PanelShell.js";

export interface SavedItem {
  id: string;
  title: string;
  /** Optional one-line subtitle (e.g. "bar · by ZONING" or "42 rows"). */
  subtitle?: string;
}

export interface SavedItemsPanelProps {
  /** Panel title (e.g. "Charts", "Tables", "Bookmarks"). */
  title: string;
  /** The saved items to list. */
  items: SavedItem[];
  /** Header "+" — add a new item. When omitted, the add button is hidden. */
  onAdd?: () => void;
  /** Open / apply an item (row click). */
  onOpen?: (id: string) => void;
  /** Rename an item — receives the new title. */
  onRename?: (id: string, title: string) => void;
  /** Remove an item. */
  onRemove?: (id: string) => void;
  /** Optional custom trailing content per row (e.g. a live/stale badge). */
  renderMeta?: (item: SavedItem) => React.ReactNode;
  /** Empty-state text. */
  emptyText?: string;
  mode?: PanelMode;
  floating?: boolean;
  initialX?: number;
  initialY?: number;
  defaultWidth?: number;
  onClose?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function SavedItemsPanel(props: SavedItemsPanelProps): React.ReactElement {
  const { items, onAdd, onOpen, onRename, onRemove } = props;
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const commit = (id: string): void => {
    const t = draft.trim();
    if (t && onRename) onRename(id, t);
    setRenaming(null);
    setDraft("");
  };

  const headerExtra = onAdd ? (
    <button type="button" style={addBtn} title={`Add to ${props.title}`} aria-label={`Add to ${props.title}`}
      onClick={(e) => { e.stopPropagation(); onAdd(); }}>+</button>
  ) : undefined;

  return (
    <PanelShell
      title={props.title}
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth ?? 300}
      onClose={props.onClose}
      headerExtra={headerExtra}
      className={props.className}
      style={props.style}
    >
      {items.length === 0 && <div style={empty}>{props.emptyText ?? `No saved ${props.title.toLowerCase()}.`}</div>}
      <ul style={list}>
        {items.map((it) => (
          <li key={it.id} style={row} onClick={() => onOpen?.(it.id)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {renaming === it.id ? (
                <input autoFocus value={draft} style={renameInput}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commit(it.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") commit(it.id); if (e.key === "Escape") { setRenaming(null); setDraft(""); } }} />
              ) : (
                <>
                  <div style={titleStyle}>{it.title}</div>
                  {it.subtitle ? <div style={subtitle}>{it.subtitle}</div> : null}
                </>
              )}
            </div>
            {props.renderMeta ? <span onClick={(e) => e.stopPropagation()}>{props.renderMeta(it)}</span> : null}
            <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
              {onRename && <button style={miniBtn} title="Rename" onClick={() => { setRenaming(it.id); setDraft(it.title); }}>✎</button>}
              {onRemove && <button style={{ ...miniBtn, ...dangerBtn }} title="Remove" onClick={() => onRemove(it.id)}>✕</button>}
            </div>
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}

export default SavedItemsPanel;

const empty: React.CSSProperties = { padding: 12, color: "#888" };
const list: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0 };
const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid #f2f2f2", cursor: "pointer" };
const titleStyle: React.CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const subtitle: React.CSSProperties = { fontSize: 11, color: "#8b95a5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const renameInput: React.CSSProperties = { width: "100%", font: "inherit", padding: "2px 4px" };
const miniBtn: React.CSSProperties = { minWidth: 24, height: 24, border: "1px solid #d5d5d5", borderRadius: 4, background: "#fafafa", cursor: "pointer", font: "12px system-ui" };
const dangerBtn: React.CSSProperties = { color: "#c53030", borderColor: "#f0c2c2" };
const addBtn: React.CSSProperties = { ...miniBtn, fontSize: 16, lineHeight: 1 };
