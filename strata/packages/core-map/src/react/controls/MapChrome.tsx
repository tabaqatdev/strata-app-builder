/**
 * MapChrome — the standard Strata map controls, ON the map (MIT).
 *
 * A thin React wrapper over **`@strata/map-controls`** — the one implementation of the house chrome,
 * shared with the vanilla apps: one cluster top-right (zoom in · zoom out · home | layers · basemap ·
 * legend · full screen), one drawer beside it holding the **layer list** or the **basemap gallery**
 * (Recommended / More, thumbnails, info tooltip, Follow the theme), keyboard L / B / G / F / Esc, and
 * the **optional tools** (search · locate · measure · draw · print — all OFF unless enabled), and
 * the optional **scale bar** (bottom-left, OFF unless `scale` enables it).
 *
 * The wrapper mounts `mountMapControls()` on the live MapLibre map in an effect, feeds it one
 * `LayerDescriptor` per operational layer (title, visibility, transparency, order, the legend from
 * the layer's `drawingInfo`, zoom-to, "about" text and the service URL for Technical details), tells
 * it the theme mode, and destroys it on unmount.
 *
 * **Store-driven.** When a `store` is passed, nothing in the chrome writes to the map behind it:
 *  - visibility → `store.setVisibility`, transparency → `store.setOpacity`, order → `store.reorderLayers`
 *    (the package's `layerState` hook), and the store binding drives the map;
 *  - a basemap pick → `store.setBaseMap` (+ `setBaseMapFollowsTheme(false)`); a theme swap →
 *    `store.setBaseMap(…, { transient: true })` — never in the undo history (the `basemapHost` hook);
 *  - the tools' interaction mode → `store.setInteractionMode` ("draw" ↔ "sketch"), and every tool
 *    reverts to `identify` when it closes.
 * Without a store the chrome drives the map itself (visibility/order/transparency on the `lyr:*`
 * sub-layers; the basemap through `applyBaseMap`).
 *
 * Basemap rules (unchanged): the authored `layers.json` basemap wins on mount; the theme swaps it on
 * a *change* of mode; an explicit pick outranks the theme (a paired pick swaps to its pair).
 */
import React, { useEffect, useRef } from "react";
import type { BaseMap, NormalizedMapTools, OperationalLayer } from "@strata/schema";
import type { StrataStore, InteractionMode as StoreInteractionMode } from "@strata/state";
import {
  mountMapControls,
  type LayerDescriptor,
  type MapControls,
  type ToolsOptions,
  type InteractionMode,
  type OpacityValue,
} from "@strata/map-controls";
import * as basemapCatalog from "@strata/map-controls/basemaps";
import "@strata/map-controls/map-controls.css";
import { applyBaseMap, baseMapCatalogId, baseMapFromId } from "../../engine/basemaps.js";
import { SUBLAYER_KINDS } from "../../engine/layers.js";
import type { BasemapOption } from "../panels/BasemapPanel.js";
import { useStrataAppEnv } from "../app/interactivity.js";
import { legendRows, type LegendRow } from "./Legend.js";

/**
 * The glyphs of the pre-package chrome.
 * @deprecated The cluster's icons now come from `@strata/map-controls` (`ICONS`, Lucide). Kept so
 * code that imported them keeps compiling.
 */
export const CHROME_ICONS = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/></svg>',
  layers: '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  base: '<svg viewBox="0 0 24 24"><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z"/><path d="M9 4v13M15 7v13"/></svg>',
  legend: '<svg viewBox="0 0 24 24"><path d="M4 6h4M4 12h4M4 18h4M12 6h8M12 12h8M12 18h8"/></svg>',
} as const;

/** Which drawer is open — only ever one. */
export type DrawerKind = "layers" | "basemap" | null;

export interface MapChromeProps {
  /** The live MapLibre map. */
  map?: any;
  /** Store — the source of truth for layers, basemap and interaction mode. Without it the chrome drives the map. */
  store?: StrataStore;
  /** Operational layers to list when there is no store (top first). With a store, the store's layers are listed. */
  layers: OperationalLayer[];
  /** The authored basemap (no-store mode) — what the gallery ticks before anything is picked. */
  baseMap?: BaseMap | null;
  /** @deprecated The gallery is the `@strata/map-controls` catalog; a custom library is ignored here (use `BasemapPanel`). */
  basemaps?: BasemapOption[];
  /** Apply a chosen basemap to the live map (no-store mode). Default: `applyBaseMap(map, bm)`. */
  onApplyBasemap?: (bm: BaseMap) => void;
  /** The app's theme mode. Read from the surrounding `<StrataApp>` when not given. */
  themeMode?: "light" | "dark";
  /** The light/dark basemap pair (catalog ids, alias-aware) and whether the theme swaps it. Default osm / osm-dark, follow. */
  themeBasemaps?: { follow?: boolean; light?: string; dark?: string };
  /** Up to 3 ids appended to the universal Recommended 8 in the gallery. */
  recommendedExtras?: string[];
  /** Optional tools — all OFF by default. Accepts the schema's normalized tools or the package's own options. */
  tools?: Partial<NormalizedMapTools> | ToolsOptions | null;
  /** Print title (the print tool). */
  title?: string;
  /**
   * The optional scale bar, fixed bottom-left — OFF by default. Accepts the schema's normalized
   * `scale` (`false | { units }`) or the package's own option (`true` = metric).
   */
  scale?: boolean | { units?: "metric" | "imperial" | "both" } | null;
  /** Is the legend showing? Controlled; pair with `onToggleLegend`. */
  showLegend?: boolean;
  onToggleLegend?: (next: boolean) => void;
  /** Home — fit the map to the reading. Omit and the button is not rendered. Gets the originating
   *  click / keydown event (e.g. shift-click on Home). */
  onFit?: (event?: any) => void;
  /**
   * Esc closes a popup first (MapLibre popups on the map are closed by the package). Register the
   * app's own HTML popup / card here: return true when it closed one.
   */
  closePopup?: () => boolean;
  /**
   * The package's themed MapLibre popup card (`popupStyles`, @strata/map-controls 1.0.3). Default
   * false here: a `<StrataMap>` popup is already themed by `ensurePopupStyles` (the --strata-* tokens).
   * The popup z-index above the drawer (`--smc-popup-z`) applies either way. The package's GL basemap
   * fallback (`basemapFallback`) does not apply: the chrome hands the basemap to the store / map.
   */
  popupStyles?: boolean;
  /** The Layers / Basemap drawer: where it opens and the grip's clamp. Resizable by default. */
  drawer?: { width?: number; minWidth?: number; maxWidth?: number; resizable?: boolean };
  /** Told after each drawer resize (e.g. to re-measure a neighbour). Not for persistence. */
  onDrawerResize?: (width: number, which: "layers" | "base") => void;
  /** How long (ms) an Esc is swallowed after a native full-screen exit. Default 300. */
  escapeGuardMs?: number;
  /** "Zoom to layer" in the layer list (e.g. the store binding's server extent query). Else the layer's declared extent. */
  onZoomToLayer?: (layerId: string) => void;
  /** @deprecated The cluster is fixed top-right (`MAP_CONTROLS_POSITION`); this is ignored. */
  position?: "top-right" | "top-left";
  /** Keyboard shortcuts L / B / G / F and Esc on `window`. Default true. */
  keyboard?: boolean;
  /** Told when a tool takes or releases map clicks (no-store mode; the store's `interactionMode` otherwise). */
  onInteractionMode?: (mode: InteractionMode) => void;
  /**
   * MapLibre layer ids kept ABOVE every operational layer, bottom → top — overlays that are not in the
   * layer list (selection highlight, sketch in progress, labels, halos). Passed to the package's
   * `topLayers`; a function is re-read on every pass. Omit it and nothing changes.
   */
  topLayers?: string[] | (() => string[] | null | undefined);
  /** Hands the mounted controls out (tests, bespoke chrome). */
  onControls?: (controls: MapControls | null) => void;
  className?: string;
}

/** Store mode ↔ package mode: the package's "draw" is the store's "sketch". */
const toStoreMode = (m: InteractionMode): StoreInteractionMode => (m === "draw" ? "sketch" : m);

/** The schema's normalized tools (or the package's options) → the package's ToolsOptions. */
export function toPackageTools(t: MapChromeProps["tools"]): ToolsOptions | null {
  if (!t) return null;
  const out: ToolsOptions = {};
  const src = t as Record<string, any>;
  if (src.search) {
    const s = src.search;
    // "photon" is the package default; any other named provider has no registry yet → the default.
    out.search = typeof s === "object" && (s.placeholder || typeof s.provider === "function")
      ? { ...(s.placeholder ? { placeholder: s.placeholder } : {}), ...(typeof s.provider === "function" ? { provider: s.provider } : {}) }
      : true;
  }
  if (src.locate) out.locate = src.locate === true ? true : src.locate;
  if (src.measure) out.measure = typeof src.measure === "object" ? { units: src.measure.units } : true;
  if (src.draw) out.draw = typeof src.draw === "object" && src.draw.filename ? { filename: src.draw.filename } : true;
  if (src.print) out.print = typeof src.print === "object" ? { ...src.print } : true;
  return Object.keys(out).length ? out : null;
}

/** The schema's normalized `scale` (or the package's option) → the package's `scale` option. */
export function toPackageScale(s: MapChromeProps["scale"]): false | { units: "metric" | "imperial" | "both" } {
  if (!s) return false;
  const u = typeof s === "object" ? s.units : undefined;
  return { units: u === "imperial" || u === "both" ? u : "metric" };
}

const escHtml = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[c]);

/** Small symbol HTML for a layer row (the package's `.ll-sq` / `.ll-dots` helpers). */
function swatchHtml(rows: LegendRow[]): string {
  if (!rows.length) return "";
  if (rows.length === 1) {
    const r = rows[0];
    return r.shape === "point"
      ? `<span class="ll-dots"><i style="background:${escHtml(r.swatch)}"></i></span>`
      : `<span class="ll-sq" style="background:${escHtml(r.swatch)};border-color:${escHtml(r.swatch)}"></span>`;
  }
  return `<span class="ll-dots">${rows.slice(0, 4).map((r) => `<i style="background:${escHtml(r.swatch)}"></i>`).join("")}</span>`;
}

/** The inline legend for a layer row: EVERY class it draws, not just the first. */
function legendHtml(rows: LegendRow[]): string {
  if (!rows.length) return `<p class="strata-mc-none">No legend — this layer has no renderer.</p>`;
  return `<ul class="strata-mc-legend">${rows
    .map((r) => `<li><span class="sw ${r.shape}" style="background:${escHtml(r.swatch)}"></span>${escHtml(r.label)}</li>`)
    .join("")}</ul>`;
}

/** A layer's declared extent ([[w,s],[e,n]]), if any. */
export function layerExtent(l: OperationalLayer): [[number, number], [number, number]] | undefined {
  const e = (l.layerDefinition as any)?.extent ?? (l as any).fullExtent;
  if (!e || e.xmin == null) return undefined;
  return [[e.xmin, e.ymin], [e.xmax, e.ymax]];
}

/** The ArcGIS REST layer URL behind a layer, for "Technical details" — only a real REST endpoint. */
function serviceUrl(l: OperationalLayer): string | undefined {
  const u = l.url ?? l.source?.url;
  return typeof u === "string" && /\/(FeatureServer|MapServer|ImageServer)(\/\d+)?\/?$/i.test(u) ? u.replace(/\/$/, "") : undefined;
}

/** The opacity paint properties of each sub-layer kind (no-store mode). */
const OPACITY_PROPS: Record<string, string[]> = {
  fill: ["fill-opacity"],
  outline: ["line-opacity"],
  line: ["line-opacity"],
  circle: ["circle-opacity"],
  symbol: ["icon-opacity", "text-opacity"],
  raster: ["raster-opacity"],
  cluster: ["circle-opacity"],
  "cluster-count": ["text-opacity"],
};

export function MapChrome(props: MapChromeProps): React.ReactElement {
  const { map, store } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<MapControls | null>(null);
  const env = useStrataAppEnv();
  const themeMode = props.themeMode ?? env?.themeMode ?? "light";
  // Latest props for the callbacks the package holds (it is mounted once per map/store).
  const propsRef = useRef(props);
  propsRef.current = props;
  const modeRef = useRef(themeMode);
  modeRef.current = themeMode;

  const tools = toPackageTools(props.tools);
  const scale = toPackageScale(props.scale);
  const toolsKey = JSON.stringify([tools ?? null, scale]);
  const tb = props.themeBasemaps;
  const pairKey = `${tb?.follow !== false}|${tb?.light ?? ""}|${tb?.dark ?? ""}|${(props.recommendedExtras ?? []).join(",")}|${props.title ?? ""}|${props.keyboard !== false}|${JSON.stringify(props.drawer ?? null)}|${props.escapeGuardMs ?? ""}|${props.popupStyles === true}`;

  useEffect(() => {
    ensureChromeStyles();
    const host = hostRef.current;
    if (!host) return;
    const p = () => propsRef.current;
    const resolve = (id?: string, fallback?: string): string =>
      (id && basemapCatalog.resolveBasemapId(id)) || (fallback as string);

    // ── layers ──────────────────────────────────────────────────────────────
    const localVis = new Map<string, boolean>();
    const authoredOpacity = new Map<string, number>();
    for (const l of store ? store.getState().layers : p().layers) authoredOpacity.set(l.id, l.opacity ?? 1);
    const baseOpacity = new Map<string, Record<string, OpacityValue>>();
    /** No-store mode: the authored opacity of each sub-layer, read once, so transparency multiplies it. */
    const sublayersOf = (id: string) =>
      SUBLAYER_KINDS.map((k) => {
        const sid = `lyr:${id}:${k}`;
        if (store) return { id: sid };
        if (!baseOpacity.has(sid) && map?.getLayer?.(sid)) {
          const o: Record<string, OpacityValue> = {};
          for (const prop of OPACITY_PROPS[k] ?? []) {
            let v: unknown;
            try { v = map.getPaintProperty?.(sid, prop); } catch { v = undefined; }
            if (v === undefined) o[prop] = 1;
            // a number OR an expression (data-driven / zoom): the package fades either kind
            else if (typeof v === "number" || Array.isArray(v)) o[prop] = v as OpacityValue;
          }
          baseOpacity.set(sid, o);
        }
        return { id: sid, opacity: baseOpacity.get(sid) };
      });
    let selfChange = false;
    const asSelf = (fn: () => void): void => { selfChange = true; try { fn(); } finally { selfChange = false; } };
    const currentLayers = (): OperationalLayer[] => (store ? store.getState().layers : p().layers);
    const descriptors = (): LayerDescriptor[] =>
      currentLayers().map((l) => {
        const rows = legendRows(l);
        const visible = store ? l.visibility !== false : localVis.get(l.id) ?? l.visibility !== false;
        const ext = layerExtent(l);
        const svc = serviceUrl(l);
        const what = (l as any).description ?? (l as any).snippet;
        return {
          id: l.id,
          title: l.title || l.id,
          sublayers: sublayersOf(l.id),
          visible,
          setVisible: (on: boolean) => {
            if (store) asSelf(() => store.getState().setVisibility(l.id, on));
            else localVis.set(l.id, on);
          },
          swatch: swatchHtml(rows),
          legend: legendHtml(rows),
          zoomTo: p().onZoomToLayer
            ? () => p().onZoomToLayer!(l.id)
            : ext && map?.fitBounds
              ? () => map.fitBounds(ext, { padding: 40 })
              : undefined,
          about: what || l.attribution
            ? { ...(what ? { what: String(what) } : {}), ...(l.attribution ? { publisher: String(l.attribution) } : {}) }
            : undefined,
          services: svc
            ? [{ title: l.title || l.id, url: svc, filter: l.layerDefinition?.definitionExpression ?? null }]
            : undefined,
        };
      });

    // ── basemap ─────────────────────────────────────────────────────────────
    let localBasemap: string | null = baseMapCatalogId(p().baseMap ?? null) ?? p().baseMap?.baseMapLayers?.[0]?.id ?? null;
    const currentBasemap = (): string | null => {
      if (!store) return localBasemap;
      const bm = store.getState().baseMap;
      if (!bm?.baseMapLayers?.length) return null;
      // A custom basemap the catalog does not know keeps its own id, so no card is ticked for it.
      return baseMapCatalogId(bm) ?? bm.baseMapLayers[0].id;
    };
    const bmFor = (id: string): BaseMap =>
      baseMapFromId(id) ?? { title: "None", baseMapLayers: [{ id: basemapCatalog.BASEMAP_NONE, layerType: "WebTiledLayer" }] };

    const controls = mountMapControls(map ?? null, {
      container: host,
      catalog: basemapCatalog,
      fullscreenTarget: map?.getContainer?.() ?? undefined,
      theme: { mode: modeRef.current },
      themeBasemaps: {
        follow: tb?.follow !== false,
        light: resolve(tb?.light, basemapCatalog.THEME_BASEMAP.light),
        dark: resolve(tb?.dark, basemapCatalog.THEME_BASEMAP.dark),
      },
      recommendedExtras: props.recommendedExtras ?? [],
      layers: descriptors,
      onFit: props.onFit ? (e) => p().onFit?.(e) : undefined,
      closePopup: props.closePopup ? () => p().closePopup?.() === true : undefined,
      drawer: props.drawer ? { ...props.drawer } : undefined,
      onDrawerResize: (w, which) => p().onDrawerResize?.(w, which),
      escapeGuardMs: props.escapeGuardMs,
      popupStyles: props.popupStyles === true,
      onToggleLegend: props.onToggleLegend ? () => p().onToggleLegend?.(!(p().showLegend !== false)) : undefined,
      legendOpen: () => p().showLegend !== false,
      tools,
      scale,
      // Read through propsRef so a new array / function is honoured without remounting the package.
      topLayers: props.topLayers
        ? () => { const t = p().topLayers; return (typeof t === "function" ? t() : t) ?? []; }
        : undefined,
      title: props.title,
      keyboard: props.keyboard !== false,
      interaction: {
        setMode: (m) => {
          if (store) {
            if (store.getState().interactionMode !== toStoreMode(m)) asSelf(() => store.getState().setInteractionMode(toStoreMode(m)));
          }
          p().onInteractionMode?.(m);
        },
      },
      onError: (message) => {
        // eslint-disable-next-line no-console
        console.warn(`[strata] map controls: ${message}`);
      },
      basemapHost: {
        current: currentBasemap,
        apply: (id, reason) => {
          const bm = bmFor(id);
          if (store) {
            const s = store.getState();
            if (reason === "pick") {
              asSelf(() => s.setBaseMap(bm));
            } else {
              // A theme-driven swap (or Follow switched back on) is not an edit to the map spec.
              if (baseMapCatalogId(s.baseMap) === id) return;
              asSelf(() => s.setBaseMap(bm, { transient: true }));
            }
          } else {
            localBasemap = id;
            const apply = p().onApplyBasemap;
            try {
              if (apply) apply(bm);
              else if (map) applyBaseMap(map, bm);
            } catch (err) {
              // A basemap that fails to apply must never take the chrome down with it.
              // eslint-disable-next-line no-console
              console.warn(`[strata] basemap '${id}' could not be applied:`, err);
            }
          }
        },
        onFollowChange: (follow) => {
          if (store) asSelf(() => store.getState().setBaseMapFollowsTheme?.(follow));
        },
      },
      layerState: store
        ? {
            order: () => store.getState().layers.map((l) => l.id),
            opacity: (id) => store.getState().layers.find((l) => l.id === id)?.opacity ?? 1,
            setOrder: (ids) => asSelf(() => store.getState().reorderLayers(ids)),
            setOpacity: (id, v) => asSelf(() => store.getState().setOpacity(id, v)),
            resetOpacity: (id) => asSelf(() => store.getState().setOpacity(id, authoredOpacity.get(id) ?? 1)),
          }
        : undefined,
    });
    // The reader's "Follow the theme" lives on the store (shared with BasemapPanel and the app).
    const syncFollow = (): void => {
      if (!store) return;
      const follows = store.getState().baseMapFollowsTheme !== false;
      if (controls.state.autoBasemap !== follows) {
        controls.state.autoBasemap = follows;
        controls.state.basemap = follows ? null : currentBasemap();
      }
    };
    syncFollow();
    controlsRef.current = controls;
    p().onControls?.(controls);

    // Store → chrome: a change made elsewhere (LayerPanel, undo, another widget) re-renders the open
    // drawer. A change the chrome made itself does not — re-rendering under a dragged slider would
    // drop the drag.
    let lastMode = store?.getState().interactionMode;
    let lastSeen: readonly unknown[] = store
      ? [store.getState().layers, store.getState().baseMap, store.getState().baseMapFollowsTheme]
      : [];
    const unsub = store?.subscribe((state) => {
      const modeChanged = state.interactionMode !== lastMode;
      lastMode = state.interactionMode;
      if (selfChange) return;
      syncFollow();
      // Another control (or Esc elsewhere) put the map back in identify: end the active tool.
      if (modeChanged && state.interactionMode === "identify" && controls.getMode() !== "identify") controls.setMode("identify");
      // Only what the drawers show: the layers, the basemap and who is choosing it.
      const seen = [state.layers, state.baseMap, state.baseMapFollowsTheme] as const;
      if (seen.some((v, i) => v !== lastSeen[i])) controls.refresh();
      lastSeen = seen;
    });

    return () => {
      unsub?.();
      // Never leave the map stuck in a tool mode.
      if (controls.getMode() !== "identify") controls.setMode("identify");
      controls.destroy();
      controlsRef.current = null;
      propsRef.current.onControls?.(null);
    };
    // Remount only when the map/store or the configuration the package reads at mount changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, store, toolsKey, pairKey, !!props.onFit, !!props.onToggleLegend]);

  // The theme mode → the chrome's colours, and (following) the basemap pair.
  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    c.setTheme(themeMode);
    c.refresh();
  }, [themeMode]);

  // No store: a new layer list / legend visibility re-renders the open drawer and the cluster.
  useEffect(() => {
    if (!store) controlsRef.current?.refresh();
  }, [store, props.layers]);
  useEffect(() => {
    // re-sync the Legend button's pressed state in place (no cluster rebuild)
    controlsRef.current?.syncChrome();
  }, [props.showLegend]);

  return (
    <div
      ref={hostRef}
      className={`strata-mc${props.className ? ` ${props.className}` : ""}`}
      data-strata-chrome=""
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3 }}
    />
  );
}

// --- the wrapper's stylesheet (injected once) ------------------------------
// The package's own CSS (`@strata/map-controls/map-controls.css`) styles the chrome. This adds only
// what the React embedding needs: the overlay host lets map gestures through while its controls stay
// clickable, the package's tokens follow Strata's `--strata-*` theme, and the inline legend rows.
const CHROME_CSS = `
.strata-mc > *{pointer-events:auto}
.strata-mc.smc{
  --smc-bg:var(--strata-panel-bg,var(--smc-d-bg)); --smc-panel:var(--strata-panel-bg,var(--smc-d-panel));
  --smc-fg:var(--strata-fg,var(--smc-d-fg)); --smc-muted:var(--strata-muted,var(--smc-d-muted));
  --smc-border:var(--strata-border,var(--smc-d-border)); --smc-accent:var(--strata-primary,var(--smc-d-accent));
  font:13px/1.4 system-ui,sans-serif;color:var(--smc-fg)}
.smc .strata-mc-legend{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px;font-size:11.6px}
.smc .strata-mc-legend li{display:flex;align-items:center;gap:6px}
.smc .strata-mc-legend .sw{flex:none;width:12px;height:12px;border-radius:3px;border:1px solid rgba(0,0,0,.25)}
.smc .strata-mc-legend .sw.point{border-radius:50%}
.smc .strata-mc-legend .sw.line{height:3px;border:0;border-radius:2px}
.smc .strata-mc-none{margin:0;font-size:11px;color:var(--smc-muted)}
`;

/** Inject the wrapper stylesheet once per document (the package CSS is imported as a module). */
export function ensureChromeStyles(doc?: Document): void {
  const d = doc ?? (typeof document !== "undefined" ? document : undefined);
  if (!d || d.querySelector("style[data-strata-chrome-css]")) return;
  const el = d.createElement("style");
  el.setAttribute("data-strata-chrome-css", "");
  el.textContent = CHROME_CSS;
  d.head.appendChild(el);
}

export default MapChrome;
