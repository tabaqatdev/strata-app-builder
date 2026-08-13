/**
 * BasemapPanel — store-driven basemap management (MIT).
 *
 * Lists candidate basemaps and highlights the one that matches the store's current
 * `baseMap`. Selecting one builds a genuine ESRI Web Map `BaseMap` (a VectorTileLayer
 * when a style URL is given, otherwise a WebTiledLayer template) and pushes it to the
 * store via `setBaseMap`, then hands the same object to `onApplyBasemap` so the live map
 * can restyle. An "Add basemap" row appends a user-supplied tile/style URL to the list.
 *
 * **A basemap is a radio, not a checklist** — exactly one is in force, so each row carries a round
 * box and `role="radio"`, and the list is a `radiogroup`. Two rules the shipped build paid for:
 *
 *  - **Tick the EFFECTIVE basemap, not just an explicitly chosen one.** With "Follow the theme" on
 *    — the default — an id-only test ticks nothing, so the panel offers five options and shows none
 *    in force, leaving no way to tell which basemap you are looking at. "Follow the theme" says
 *    HOW the choice is made; it does not stop there being a choice. Both rows tick.
 *  - **The thumbnail is a live tile of the current area in that style.** A colour swatch cannot
 *    tell Positron from Voyager.
 *
 * Layout: renders inside a PanelShell, so it can be `mode="fixed"` (docked, default) or
 * `mode="floating"` (draggable overlay) with the Open / Remove context menu.
 */
import React, { useSyncExternalStore, useState } from "react";
import type { BaseMap, BaseMapLayer } from "@strata/schema";
import type { StrataStore } from "@strata/state";
import { PanelShell, type PanelMode } from "./PanelShell.js";
import { OPEN_BASEMAPS } from "../../engine/basemaps.js";

/** A selectable basemap entry (either a vector `style` URL or a raster `templateUrl`). */
export interface BasemapOption {
  id: string;
  title: string;
  /** Vector-tile style JSON URL (maps to a VectorTileLayer). */
  style?: string;
  /** Raster XYZ template, e.g. `https://…/{z}/{x}/{y}.png` (maps to a WebTiledLayer). */
  templateUrl?: string;
  thumbnail?: string;
  copyright?: string;
}

export interface BasemapPanelProps {
  store: StrataStore;
  /** Candidate basemaps to offer. Defaults to `OPEN_BASEMAPS` (open-source, OpenStreetMap first). */
  basemaps?: BasemapOption[];
  /** Apply the built BaseMap to the live map (restyle). */
  onApplyBasemap?: (bm: BaseMap) => void;
  /**
   * The saved *default* basemap id (the one the map opens with). Shown with a ★ in the list. Managed via
   * the "Manage" pill; changes are reported through `onLibraryChange` so the app can persist them into the
   * map spec (e.g. `layers.json` `baseMap` + a `strata:basemaps` library).
   */
  defaultId?: string;
  /**
   * Called whenever the library changes in Manage mode — a basemap is added, removed, or set as default.
   * The app persists `basemaps` (the full effective library) and `defaultId` into the ESRI Map JSON.
   */
  onLibraryChange?: (basemaps: BasemapOption[], defaultId: string | null) => void;
  /**
   * The live MapLibre map. Used only to compute the preview tile, so each row's thumbnail shows
   * **this** area in that basemap's own style.
   */
  map?: any;
  /**
   * The app's theme mode. Offers a "Follow the theme" row that pairs a light UI with a light map;
   * omit it and no such row is shown.
   */
  themeMode?: "light" | "dark";
  /** Layout mode passed through to PanelShell. Defaults to "fixed". */
  mode?: PanelMode;
  /** Convenience alias for `mode="floating"`. */
  floating?: boolean;
  /** Floating-mode placement / sizing (forwarded to PanelShell). */
  initialX?: number;
  initialY?: number;
  defaultWidth?: number;
  /** Close the panel (floating × button and "Remove" menu item). */
  onClose?: () => void;
  /** "Open" menu item. */
  onOpen?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

/** Build a genuine ESRI Web Map BaseMap object from a panel option. */
export function buildBaseMap(opt: BasemapOption): BaseMap {
  const layer: BaseMapLayer = opt.style
    ? { id: opt.id, layerType: "VectorTileLayer", styleUrl: opt.style, copyright: opt.copyright }
    : { id: opt.id, layerType: "WebTiledLayer", templateUrl: opt.templateUrl, copyright: opt.copyright };
  return { title: opt.title, baseMapLayers: [layer] };
}

/**
 * The z/x/y of a tile covering the current view. The thumbnail then **is** the style, here — which
 * is the only way to tell two grey basemaps apart. Falls back to a world tile without a map.
 */
export function previewTile(map: any): { z: number; x: number; y: number } {
  const c = map?.getCenter?.() ?? { lng: 0, lat: 20 };
  const z = Math.max(2, Math.min(14, Math.round((map?.getZoom?.() ?? 4) - 2)));
  const n = 2 ** z;
  const lat = (Math.max(-85.05, Math.min(85.05, c.lat)) * Math.PI) / 180;
  return {
    z,
    x: Math.floor(((c.lng + 180) / 360) * n),
    y: Math.floor(((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * n),
  };
}

/** Background style painting `opt`'s own tile for the current area. ESRI tokens and XYZ both work. */
export function tileBackground(
  opt: BasemapOption,
  t: { z: number; x: number; y: number },
): React.CSSProperties {
  if (!opt.templateUrl) return {};
  const url = opt.templateUrl
    .replace(/\{level\}|\{z\}/g, String(t.z))
    .replace(/\{col\}|\{x\}/g, String(t.x))
    .replace(/\{row\}|\{y\}/g, String(t.y));
  return { backgroundImage: `url('${url}')`, backgroundSize: "cover", backgroundPosition: "center" };
}

/** True when `bm` was built from `opt` (matched by the layer's style/template URL, else title). */
function matches(bm: BaseMap | null, opt: BasemapOption): boolean {
  if (!bm) return false;
  const layer = bm.baseMapLayers[0];
  if (layer) {
    if (opt.style && layer.styleUrl === opt.style) return true;
    if (opt.templateUrl && layer.templateUrl === opt.templateUrl) return true;
    if (layer.id === opt.id) return true;
  }
  return bm.title === opt.title;
}

function useBaseMap(store: StrataStore): BaseMap | null {
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState().baseMap,
    () => store.getState().baseMap,
  );
}

export function BasemapPanel(props: BasemapPanelProps): React.ReactElement {
  const { store, onApplyBasemap } = props;
  const current = useBaseMap(store);
  const [extra, setExtra] = useState<BasemapOption[]>([]);
  const [removed, setRemoved] = useState<Set<string>>(() => new Set());
  const [defaultId, setDefaultId] = useState<string | null>(props.defaultId ?? null);
  const [manage, setManage] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  // "Follow the theme" is the default choice-maker when a themeMode is supplied.
  const [auto, setAuto] = useState<boolean>(props.themeMode != null);

  // The effective library: the supplied/built-in options plus locally-added ones, minus deletions.
  const all = [...(props.basemaps ?? (OPEN_BASEMAPS as BasemapOption[])), ...extra].filter((o) => !removed.has(o.id));

  // The basemap actually in force — explicit choice, or the one the theme is choosing.
  const themed = all.find((o) => (o as any).mode === props.themeMode) ?? all[0];
  const explicit = all.find((o) => matches(current, o));
  const effective = auto ? themed : explicit ?? themed;
  const tile = previewTile(props.map);

  const apply = (opt: BasemapOption): void => {
    const bm = buildBaseMap(opt);
    store.getState().setBaseMap(bm);
    onApplyBasemap?.(bm);
  };

  /** Report the current library + default so the app persists it into the ESRI Map JSON. */
  const emitLibrary = (list: BasemapOption[], def: string | null): void => {
    props.onLibraryChange?.(list, def);
  };

  const addBasemap = (): void => {
    const title = newTitle.trim();
    const url = newUrl.trim();
    if (!title || !url) return;
    // A `.json` URL is treated as a vector style; anything else as a raster XYZ template.
    const isStyle = /\.json(\?|$)/i.test(url) || /style/i.test(url);
    const opt: BasemapOption = { id: `custom-${Date.now()}`, title, ...(isStyle ? { style: url } : { templateUrl: url }) };
    const nextExtra = [...extra, opt];
    setExtra(nextExtra);
    setNewTitle("");
    setNewUrl("");
    apply(opt);
    emitLibrary([...(props.basemaps ?? (OPEN_BASEMAPS as BasemapOption[])), ...nextExtra].filter((o) => !removed.has(o.id)), defaultId);
  };

  const removeBasemap = (opt: BasemapOption): void => {
    const nextRemoved = new Set(removed).add(opt.id);
    setRemoved(nextRemoved);
    const nextExtra = extra.filter((o) => o.id !== opt.id);
    setExtra(nextExtra);
    const nextDefault = defaultId === opt.id ? null : defaultId;
    if (nextDefault !== defaultId) setDefaultId(nextDefault);
    emitLibrary([...(props.basemaps ?? (OPEN_BASEMAPS as BasemapOption[])), ...nextExtra].filter((o) => !nextRemoved.has(o.id)), nextDefault);
  };

  const setDefault = (opt: BasemapOption): void => {
    setDefaultId(opt.id);
    apply(opt); // the default is what the map opens with — apply it now too
    emitLibrary(all, opt.id);
  };

  const headerExtra = (
    <button type="button" style={{ ...pillStyle, ...(manage ? pillOnStyle : null) }}
      title="Add, remove, or set the default basemap"
      onClick={(e) => { e.stopPropagation(); setManage((m) => !m); }}>
      {manage ? "Done" : "Manage"}
    </button>
  );

  return (
    <PanelShell
      title="Basemap"
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth ?? 300}
      onClose={props.onClose}
      onOpen={props.onOpen}
      headerExtra={headerExtra}
      className={props.className}
      style={{ ...panelStyle, ...props.style }}
    >
      <ul style={listStyle} role="radiogroup" aria-label="Basemap">
        {all.map((opt) => {
          const active = opt.id === effective?.id;
          const isDefault = opt.id === defaultId;
          return (
            <li
              key={opt.id}
              role="radio"
              aria-checked={active}
              data-basemap={opt.id}
              style={{ ...rowStyle, ...(active ? activeRowStyle : null) }}
              onClick={() => { if (!manage) { setAuto(false); apply(opt); } }}
            >
              <span style={{ ...radioStyle, ...(active ? radioOnStyle : null) }} aria-hidden>
                {active ? "✓" : ""}
              </span>
              {opt.thumbnail ? (
                <img src={opt.thumbnail} alt="" style={thumbStyle} />
              ) : (
                <div style={{ ...thumbStyle, ...thumbPlaceholderStyle, ...tileBackground(opt, tile) }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: active ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {isDefault ? <span style={starStyle} title="Default basemap">★ </span> : null}{opt.title}
                </div>
                <div style={subtitleStyle}>{opt.style ? "Vector" : "Raster"}</div>
              </div>
              {manage && (
                <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                  <button style={miniBtnStyle} title="Set as default" disabled={isDefault} onClick={() => setDefault(opt)}>Set default</button>
                  <button style={{ ...miniBtnStyle, ...miniDangerStyle }} title="Remove basemap" onClick={() => removeBasemap(opt)}>Delete</button>
                </div>
              )}
            </li>
          );
        })}
        {props.themeMode != null && (
          <li
            role="radio"
            aria-checked={auto}
            data-basemap="auto"
            style={{ ...rowStyle, ...(auto ? activeRowStyle : null) }}
            onClick={() => { setAuto(true); if (themed) apply(themed); }}
          >
            <span style={{ ...radioStyle, ...(auto ? radioOnStyle : null) }} aria-hidden>{auto ? "✓" : ""}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: auto ? 600 : 400 }}>Follow the theme</div>
              <div style={subtitleStyle}>light UI → light map</div>
            </div>
          </li>
        )}
      </ul>
      <p style={houseRuleStyle}>
        No keyed or proprietary provider is offered — that is a house rule, not an omission.
      </p>

      {manage && (
        <div style={addRowStyle}>
          <div style={addTitleStyle}>Add basemap</div>
          <input placeholder="Title" value={newTitle} style={inputStyle} onChange={(e) => setNewTitle(e.target.value)} />
          <input placeholder="Tile template or style URL" value={newUrl} style={inputStyle}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addBasemap(); }} />
          <button style={addBtnStyle} disabled={!newTitle.trim() || !newUrl.trim()} onClick={addBasemap}>Add basemap</button>
        </div>
      )}
    </PanelShell>
  );
}

export default BasemapPanel;

// --- inline styles ---------------------------------------------------------
// PanelShell supplies the card chrome (border, radius, font, title header).
const panelStyle: React.CSSProperties = {};
const listStyle: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0 };
const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  cursor: "pointer",
  borderBottom: "1px solid #f5f5f5",
};
const activeRowStyle: React.CSSProperties = { background: "#eef5ff" };
// Round box = exactly one is in force. A square box would promise multi-select the map cannot honour.
const radioStyle: React.CSSProperties = {
  flex: "0 0 15px",
  height: 15,
  borderRadius: "50%",
  border: "1.5px solid #9aa3af",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  lineHeight: 1,
};
const radioOnStyle: React.CSSProperties = { background: "#2b6cb0", borderColor: "#2b6cb0", color: "#fff" };
const houseRuleStyle: React.CSSProperties = {
  fontSize: 10.5,
  color: "#888",
  lineHeight: 1.4,
  margin: "7px 12px 10px",
};
const thumbStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 4, objectFit: "cover", flexShrink: 0 };
const thumbPlaceholderStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#dfe7f1,#b9c7dd)",
};
const subtitleStyle: React.CSSProperties = { fontSize: 11, color: "#888" };
const checkStyle: React.CSSProperties = { color: "#2b6cb0", fontWeight: 700 };
const starStyle: React.CSSProperties = { color: "#e0a400" };
const pillStyle: React.CSSProperties = {
  font: "12px system-ui, sans-serif", padding: "3px 10px", borderRadius: 999,
  border: "1px solid #cfe0ff", background: "#eef4ff", color: "#2f6fed", cursor: "pointer", fontWeight: 600,
};
const pillOnStyle: React.CSSProperties = { background: "#2f6fed", color: "#fff", borderColor: "#2f6fed" };
const miniBtnStyle: React.CSSProperties = {
  font: "11px system-ui, sans-serif", padding: "3px 7px", borderRadius: 5,
  border: "1px solid #d5d5d5", background: "#fff", cursor: "pointer", whiteSpace: "nowrap",
};
const miniDangerStyle: React.CSSProperties = { color: "#c53030", borderColor: "#f0c2c2" };
const addRowStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  padding: 12,
  borderTop: "1px solid #eee",
  background: "#fafafa",
};
const addTitleStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "#666" };
const inputStyle: React.CSSProperties = {
  font: "inherit",
  padding: "5px 7px",
  border: "1px solid #d5d5d5",
  borderRadius: 4,
};
const addBtnStyle: React.CSSProperties = {
  font: "inherit",
  padding: "6px 10px",
  border: "1px solid #2b6cb0",
  borderRadius: 4,
  background: "#2b6cb0",
  color: "#fff",
  cursor: "pointer",
};
