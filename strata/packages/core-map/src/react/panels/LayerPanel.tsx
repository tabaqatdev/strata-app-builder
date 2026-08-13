/**
 * LayerPanel — store-driven feature-layer management (MIT).
 *
 * A vertical list of the map's operational layers (top-most first, matching ESRI Web Map draw order where
 * index 0 renders on top). Each layer is a **single row** — a drag handle, a visibility checkbox, a type
 * icon, the title, and a `⋯` actions button — and everything else lives in the row's **context menu**
 * (also reachable by right-clicking the row). Reorder is **drag-only** (no ↑/↓ buttons); there is no
 * inline opacity slider and no inline remove `✕` — "Remove layer" is a menu item.
 *
 * The menu delegates the rich editors to optional callbacks so the panel stays dependency-light while an
 * app can wire real UIs:
 *   - Show table    → `onShowTable` / `onOpenTable`
 *   - Zoom to       → `onZoomTo`
 *   - Filter…       → `onFilter` (else a built-in prompt → `store.setDefinition`)
 *   - Symbology…    → `onSymbology`  (shown only when provided)
 *   - Popup…        → `onPopup`      (shown only when provided)
 *   - Rename        → inline
 *   - Show metadata → `onShowMetadata` (else opens the service URL)
 *   - Remove layer  → `store.removeLayer`
 *
 * Layout: renders inside a PanelShell, so it can be `mode="fixed"` (docked, default) or `mode="floating"`.
 */
import React, { useSyncExternalStore, useState } from "react";
import { createPortal } from "react-dom";
import type { OperationalLayer } from "@strata/schema";
import type { StrataStore } from "@strata/state";
import { PanelShell, type PanelMode } from "./PanelShell.js";

export interface LayerPanelProps {
  /** The vanilla Zustand store (from `createStrataStore()`). */
  store: StrataStore;
  /** Fit/zoom the live map to a layer's extent. */
  onZoomTo?: (layerId: string) => void;
  /** Highlight a set of OBJECTIDs on the live map. */
  onHighlight?: (layerId: string, oids: Array<number | string>) => void;
  /** Open the attribute table for a layer (app decides how to render it). */
  onOpenTable?: (layerId: string) => void;
  /** "Show table" per-row action — falls back to `onOpenTable` when omitted. */
  onShowTable?: (layerId: string) => void;
  /**
   * "Filter…" per-row action — receives the layer id. When omitted, the panel falls back to a built-in
   * prompt that sets the layer's `definitionExpression` via `store.setDefinition`.
   */
  onFilter?: (layerId: string) => void;
  /** "Symbology…" per-row action — shown only when provided (app supplies the renderer editor). */
  onSymbology?: (layerId: string) => void;
  /** "Popup…" per-row action — shown only when provided (app supplies the popupInfo editor). */
  onPopup?: (layerId: string) => void;
  /** "Show metadata" per-row action — receives the layer's service URL (else opened in a new tab). */
  onShowMetadata?: (url: string) => void;
  /** Add a layer from a Feature/Map Server URL. When omitted, builds an OperationalLayer + `store.addLayer`. */
  onAddLayer?: (url: string, title?: string) => void;
  /** Layout mode passed through to PanelShell. Defaults to "fixed". */
  mode?: PanelMode;
  /** Convenience alias for `mode="floating"`. */
  floating?: boolean;
  initialX?: number;
  initialY?: number;
  defaultWidth?: number;
  onClose?: () => void;
  onOpen?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

/** Matches a Feature/Map Server layer endpoint ending in `/{layerId}`. */
const FEATURE_URL_RE = /(Feature|Map)Server\/\d+\/?$/i;

/** The service URL for a layer (explicit `url` first, else the source url). */
function layerUrl(layer: OperationalLayer): string | undefined {
  return layer.url ?? layer.source?.url;
}

const LAYER_ICON = "▤";
const TABLE_ICON = "▦";

function useLayers(store: StrataStore): OperationalLayer[] {
  return useSyncExternalStore(store.subscribe, () => store.getState().layers, () => store.getState().layers);
}
function useSelectedLayerId(store: StrataStore): string | null {
  return useSyncExternalStore(store.subscribe, () => store.getState().selection?.layerId ?? null, () => store.getState().selection?.layerId ?? null);
}
function useActiveLayerId(store: StrataStore): string | null {
  return useSyncExternalStore(store.subscribe, () => store.getState().activeLayerId, () => store.getState().activeLayerId);
}

interface MenuItem { label: string; run?: () => void; disabled?: boolean; sep?: boolean; danger?: boolean }

export function LayerPanel(props: LayerPanelProps): React.ReactElement {
  const { store, onZoomTo, onOpenTable } = props;
  const layers = useLayers(store);
  const selectedLayerId = useSelectedLayerId(store);
  const activeLayerId = useActiveLayerId(store);

  const [renaming, setRenaming] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  // The ⋯ menu renders in a portal at these viewport coords so it is never clipped by the panel's
  // overflow. Opened from the ⋯ button (anchored under it) or a right-click (at the pointer).
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null);
  const openMenu = (id: string, x: number, y: number): void => {
    setRowMenu((cur) => (cur === id ? null : id));
    setMenuAt({ x, y });
  };
  const [showAdd, setShowAdd] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const actions = store.getState();

  /** Reorder so `sourceId` lands directly before `targetId`. */
  const reorderTo = (sourceId: string, targetId: string): void => {
    if (sourceId === targetId) return;
    const ids = layers.map((l) => l.id).filter((id) => id !== sourceId);
    const at = ids.indexOf(targetId);
    if (at < 0) return;
    ids.splice(at, 0, sourceId);
    actions.reorderLayers(ids);
  };

  const commitRename = (id: string): void => {
    const title = draftTitle.trim();
    if (title) actions.renameLayer(id, title);
    setRenaming(null);
    setDraftTitle("");
  };

  const showTable = (layerId: string): void => {
    if (props.onShowTable) props.onShowTable(layerId);
    else if (onOpenTable) onOpenTable(layerId);
  };

  const showMetadata = (layer: OperationalLayer): void => {
    const url = layerUrl(layer);
    if (!url) return;
    if (props.onShowMetadata) props.onShowMetadata(url);
    else if (typeof window !== "undefined") window.open(url, "_blank", "noopener");
  };

  /** Built-in filter fallback: prompt for a WHERE clause and push it as the definitionExpression. */
  const builtinFilter = (layer: OperationalLayer): void => {
    if (typeof window === "undefined") return;
    const cur = layer.layerDefinition?.definitionExpression ?? "";
    const where = window.prompt(`Filter "${layer.title}" — SQL WHERE (blank clears):`, cur);
    if (where === null) return;
    actions.setDefinition(layer.id, where.trim() || undefined);
  };

  const submitAdd = (): void => {
    const url = addUrl.trim();
    const title = addTitle.trim();
    if (!FEATURE_URL_RE.test(url)) {
      setAddError("Enter a …/FeatureServer/{n} or …/MapServer/{n} URL.");
      return;
    }
    if (props.onAddLayer) props.onAddLayer(url, title || undefined);
    else {
      actions.addLayer({
        id: `layer-${Date.now()}`,
        title: title || url.replace(/\/+$/, "").split("/").slice(-3).join("/"),
        url,
        layerType: "ArcGISFeatureLayer",
        source: { kind: "arcgis-feature", url },
        visibility: true,
      });
    }
    setAddUrl(""); setAddTitle(""); setAddError(null); setShowAdd(false);
  };
  const addValid = FEATURE_URL_RE.test(addUrl.trim());

  const menuFor = (layer: OperationalLayer): MenuItem[] => {
    const url = layerUrl(layer);
    const items: MenuItem[] = [
      { label: "Show table", run: () => showTable(layer.id) },
      { label: "Zoom to", disabled: !onZoomTo, run: () => onZoomTo?.(layer.id) },
      { label: "Filter…", disabled: !url, run: () => (props.onFilter ? props.onFilter(layer.id) : builtinFilter(layer)) },
    ];
    if (props.onSymbology) items.push({ label: "Symbology…", run: () => props.onSymbology!(layer.id) });
    if (props.onPopup) items.push({ label: "Popup…", run: () => props.onPopup!(layer.id) });
    items.push({ label: "Rename", run: () => { setRenaming(layer.id); setDraftTitle(layer.title); } });
    items.push({ label: "Show metadata", disabled: !url, run: () => showMetadata(layer) });
    items.push({ sep: true, label: "" });
    items.push({ label: "Remove layer", danger: true, run: () => actions.removeLayer(layer.id) });
    return items;
  };

  const headerExtra = (
    <button type="button" style={addHeaderBtnStyle} title="Add layer from a Feature Service URL" aria-label="Add layer"
      onClick={(e) => { e.stopPropagation(); setShowAdd((s) => !s); setAddError(null); }}>+</button>
  );

  return (
    <PanelShell
      title="Layers"
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth ?? 300}
      onClose={props.onClose}
      onOpen={props.onOpen}
      headerExtra={headerExtra}
      className={props.className}
      style={props.style}
    >
      {showAdd && (
        <div style={addFormStyle} onClick={(e) => e.stopPropagation()}>
          <input autoFocus style={inputStyle} placeholder="…/FeatureServer/0" value={addUrl}
            onChange={(e) => { setAddUrl(e.target.value); setAddError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter" && addValid) submitAdd(); }} />
          <input style={inputStyle} placeholder="Title (optional)" value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && addValid) submitAdd(); }} />
          {addError && <div style={errorStyle}>{addError}</div>}
          <div style={{ display: "flex", gap: 6 }}>
            <button style={submitBtnStyle} disabled={!addValid} onClick={submitAdd}>Add layer</button>
            <button style={cancelBtnStyle} onClick={() => { setShowAdd(false); setAddError(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {layers.length === 0 && <div style={emptyStyle}>No layers in this map.</div>}
      <ul style={listStyle}>
        {layers.map((layer) => {
          const selected = layer.id === selectedLayerId;
          const active = layer.id === activeLayerId;
          const visible = layer.visibility !== false;
          const isTable = layer.source?.kind === "strata" && !layer.url;
          const isDragOver = dragOverId === layer.id && dragId !== layer.id;
          return (
            <li key={layer.id} draggable={renaming !== layer.id} aria-current={active ? "true" : undefined}
              title={layer.title}
              style={{
                ...rowStyle,
                ...(selected ? selectedRowStyle : null),
                ...(active ? activeRowStyle : null),
                ...(isDragOver ? dragOverStyle : null),
                ...(dragId === layer.id ? draggingStyle : null),
              }}
              onClick={() => { actions.setActiveLayer(layer.id); actions.setSelection({ layerId: layer.id, oids: [] }); }}
              onContextMenu={(e) => { e.preventDefault(); openMenu(layer.id, e.clientX, e.clientY); }}
              onDragStart={(e) => { setDragId(layer.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", layer.id); }}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dragOverId !== layer.id) setDragOverId(layer.id); }}
              onDragLeave={() => { if (dragOverId === layer.id) setDragOverId(null); }}
              onDrop={(e) => { e.preventDefault(); const s = dragId ?? e.dataTransfer.getData("text/plain"); if (s) reorderTo(s, layer.id); setDragId(null); setDragOverId(null); }}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
            >
              <span style={dragHandleStyle} title="Drag to reorder" aria-hidden>⠿</span>
              <input type="checkbox" aria-label={`Toggle ${layer.title}`} checked={visible}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => actions.setVisibility(layer.id, e.target.checked)} />
              <span style={typeIconStyle} aria-hidden>{isTable ? TABLE_ICON : LAYER_ICON}</span>
              {renaming === layer.id ? (
                <input autoFocus value={draftTitle} style={renameInputStyle}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onBlur={() => commitRename(layer.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") commitRename(layer.id); if (e.key === "Escape") { setRenaming(null); setDraftTitle(""); } }} />
              ) : (
                <span style={titleStyle}>{layer.title}</span>
              )}
              <button style={btnStyle} title="Layer actions" aria-label={`Actions for ${layer.title}`}
                onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); openMenu(layer.id, r.right, r.bottom + 2); }}>⋯</button>
            </li>
          );
        })}
      </ul>

      {/* The ⋯ menu — portaled to <body> at fixed coords so the panel's overflow never clips it. */}
      {rowMenu && menuAt && typeof document !== "undefined" && (() => {
        const layer = layers.find((l) => l.id === rowMenu);
        if (!layer) return null;
        const items = menuFor(layer);
        const W = 176, H = 8 + items.length * 30;
        const left = Math.max(8, Math.min(menuAt.x - W, window.innerWidth - W - 8));
        const top = Math.max(8, Math.min(menuAt.y, window.innerHeight - H - 8));
        return createPortal(
          <>
            <div style={menuBackdropStyle} onClick={() => setRowMenu(null)} />
            <div style={{ ...portalMenuStyle, left, top }} onClick={(e) => e.stopPropagation()}>
              {items.map((it, i) => it.sep ? (
                <hr key={`s${i}`} style={menuSepStyle} />
              ) : (
                <button key={it.label} style={{ ...rowMenuItemStyle, ...(it.danger ? menuDangerStyle : null), ...(it.disabled ? menuDisabledStyle : null) }}
                  disabled={it.disabled}
                  onClick={() => { setRowMenu(null); it.run?.(); }}>{it.label}</button>
              ))}
            </div>
          </>,
          document.body,
        );
      })()}
    </PanelShell>
  );
}

export default LayerPanel;

// --- inline styles (dependency-light; swap for your design system) ---------
const emptyStyle: React.CSSProperties = { padding: 12, color: "#888" };
const listStyle: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0 };
const rowStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "6px 10px", borderBottom: "1px solid #f2f2f2", cursor: "pointer", height: 34,
};
const selectedRowStyle: React.CSSProperties = { background: "#eef5ff" };
const activeRowStyle: React.CSSProperties = { background: "#e6f0ff", boxShadow: "inset 3px 0 0 #2b6cb0" };
const dragOverStyle: React.CSSProperties = { boxShadow: "inset 0 2px 0 #2b6cb0" };
const draggingStyle: React.CSSProperties = { opacity: 0.5 };
const dragHandleStyle: React.CSSProperties = { color: "#bbb", cursor: "grab", fontSize: 13, lineHeight: 1, flex: "0 0 auto" };
const typeIconStyle: React.CSSProperties = { color: "#8b95a5", fontSize: 12, flex: "0 0 auto" };
const titleStyle: React.CSSProperties = { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const renameInputStyle: React.CSSProperties = { flex: 1, font: "inherit", padding: "2px 4px" };
const btnStyle: React.CSSProperties = {
  font: "14px system-ui, sans-serif", minWidth: 24, height: 24, padding: "0 6px",
  border: "1px solid #d5d5d5", borderRadius: 4, background: "#fafafa", cursor: "pointer", flex: "0 0 auto",
};
const addHeaderBtnStyle: React.CSSProperties = { ...btnStyle, fontSize: 16, lineHeight: 1 };
const addFormStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, padding: 12, borderBottom: "1px solid #eee", background: "#fafafa" };
const inputStyle: React.CSSProperties = { font: "inherit", padding: "5px 7px", border: "1px solid #d5d5d5", borderRadius: 4 };
const errorStyle: React.CSSProperties = { fontSize: 11, color: "#c53030" };
const submitBtnStyle: React.CSSProperties = { font: "inherit", padding: "6px 10px", border: "1px solid #2b6cb0", borderRadius: 4, background: "#2b6cb0", color: "#fff", cursor: "pointer" };
const cancelBtnStyle: React.CSSProperties = { font: "inherit", padding: "6px 10px", border: "1px solid #d5d5d5", borderRadius: 4, background: "#fff", cursor: "pointer" };
const menuBackdropStyle: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 999 };
const portalMenuStyle: React.CSSProperties = {
  position: "fixed", zIndex: 1000, minWidth: 176,
  background: "#fff", border: "1px solid #ddd", borderRadius: 6, boxShadow: "0 6px 20px rgba(0,0,0,.16)",
  padding: 4, display: "flex", flexDirection: "column",
};
const rowMenuItemStyle: React.CSSProperties = { font: "13px system-ui, sans-serif", textAlign: "left", padding: "6px 10px", border: "none", borderRadius: 4, background: "transparent", cursor: "pointer", color: "#1a1f27" };
const menuDangerStyle: React.CSSProperties = { color: "#c53030" };
const menuDisabledStyle: React.CSSProperties = { color: "#b8bfc9", cursor: "default" };
const menuSepStyle: React.CSSProperties = { border: "none", borderTop: "1px solid #eef1f6", margin: "4px 0" };
