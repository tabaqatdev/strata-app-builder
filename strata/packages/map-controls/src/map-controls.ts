/**
 * @strata/map-controls — the map chrome, framework-free: one control cluster, one drawer beside it
 * holding either the LAYER LIST or the BASEMAP GALLERY, full screen, keyboard.
 *
 * It knows nothing about any app's data. The app hands it a MapLibre map, the basemap catalog
 * (./basemaps.ts) and a function returning LayerDescriptors; everything app-specific arrives
 * through those. Styles: map-controls.css (scoped under `.smc`). Glyphs: ./icons.ts (Lucide).
 *
 * ── API ──────────────────────────────────────────────────────────────────────────────────────
 *   import * as catalog from "@strata/map-controls/basemaps";   // vendored: "./map-controls/basemaps.js"
 *   const controls = mountMapControls(map, {
 *     container,              // REQUIRED. The positioned box around the map (gets class "smc"); it is
 *                             //   also the full-screen target unless `fullscreenTarget` is given.
 *     catalog,                // REQUIRED. The basemaps namespace (BASEMAPS, basemapById,
 *                             //   basemapForTheme, recommendedWith, toXyz, resolveUrl, …).
 *     recommendedExtras: [],  // up to 3 ids appended to the universal Recommended 8.
 *     theme: { mode: "light" },        // the app's theme; tell the module of changes with setTheme().
 *     themeBasemaps: { light, dark },  // optional theme pair (else catalog.THEME_BASEMAP /
 *                             //   catalog.basemapForTheme, else "osm" / "osm-dark").
 *     initialBasemap,         // optional explicit pick (alias-aware); omitted = Follow the theme.
 *     layers: () => [],       // LayerDescriptor[] in default order, top first (contract below).
 *                             //   Omit it and the cluster has no Layers button.
 *     defaultOrder: [...ids], // optional: the default top→bottom order for Reset (else first layers()).
 *     panelSettings: { html: () => "", onClick: (event) => boolean },
 *                             // optional rows under the list ("Panel settings"); onClick returns true
 *                             //   when it handled the click, and the drawer re-renders.
 *     onRestyle: (map) => {}, // a map dropped its sources/layers (styledata) — re-add yours to `map` (the
 *                             //   primary, or one of `maps`) and then call controls.applyLayerState().
 *     topLayers: [...ids] | () => [...ids],   // optional: MapLibre layer ids that are NOT descriptor
 *                             //   sublayers but must stay ABOVE every descriptor layer (selection
 *                             //   highlight, sketch in progress, labels, halos), bottom → top. Applied
 *                             //   at the end of every applyLayerState() and after every styledata;
 *                             //   ids not on the map are skipped, and nothing moves when the order is
 *                             //   already right (so it never feeds a styledata loop). The tools'
 *                             //   graphics (measure / draw / locate / search) stay above even these.
 *     onFit: (event) => {},   // Home / F. Omit it and there is no Home button. Gets the originating
 *                             //   click / keydown event (so shift-click on Home can mean something).
 *     onToggleLegend, legendOpen: () => bool,   // Legend button / G. Omit both and there is none.
 *     onBasemapChange: (id) => {},             // optional notification after a basemap change.
 *     onError: (message) => {},                // optional; e.g. "full screen unavailable: …".
 *     tools: {},              // optional tools (./tools.ts), ALL OFF by default — enable only what the
 *                             //   app needs: { search: true | { provider: async (q) => [{ label, lng, lat,
 *                             //   bbox? }], attribution? }, locate: true, measure: true | { units },
 *                             //   draw: true | { filename }, print: true | { title, filename } }.
 *                             //   A second cluster group after the defaults, order search · locate ·
 *                             //   measure · draw · print. (`{ onClick }` = a plain custom button.)
 *     scale: false,           // optional SCALE BAR, OFF by default: true (= metric) | { units: "metric" |
 *                             //   "imperial" | "both", maxWidth? }. Fixed bottom-left (.smc-scale); it
 *                             //   re-measures on move / zoom / resize and survives setStyle.
 *     glyphs,                 // optional glyph URL for raster / "none" basemap styles (default the
 *                             //   catalog's keyless DEFAULT_GLYPHS — label layers use DEFAULT_TEXT_FONT).
 *     interaction: { setMode(mode) },   // optional: told "identify" | "measure" | "draw" on every change.
 *                             //   The app's own map-click handlers MUST check controls.isBusy() first.
 *     title,                  // optional print title (else tools.print.title, else document.title).
 *     fetch,                  // fetch-like, for Technical details (default globalThis.fetch). A SIMPLE
 *                             //   GET, no custom headers (some ArcGIS hosts 403 a preflight).
 *     keyboard: true,         // true: the module listens on window for L / B / G / F / Esc.
 *                             //   false: the app calls controls.handleKey(e) / controls.escape().
 *     labels: { fit: "Home (F)" },             // optional title overrides.
 *     cluster,                // optional existing element to use (else created inside container).
 *     drawer,                 // optional: an existing element, OR { element?, width?, minWidth: 260,
 *                             //   maxWidth: 520, resizable: true }. The Layers / Basemap drawer has an
 *                             //   edge grip (drag or ←/→, ARIA separator) — the authored width is where it
 *                             //   OPENS; the dragged width is session state (never written anywhere).
 *     onDrawerResize: (width, which) => {},   // optional: told after each drawer resize.
 *     closePopup: () => bool, // optional: close the app's own popup / card / modal (a MapLibre popup may
 *                             //   be registered here too); true = it closed one. Esc asks it FIRST and
 *                             //   stops there; MapLibre popups on the map close on the next Esc.
 *     escapeGuardMs: 300,     // the Esc that exits native full screen is swallowed for this long (a
 *                             //   TIME-based guard: it does not see which key exited full screen).
 *     popupStyles: true,      // themed MapLibre popup cards (--smc-* tokens, light / dark) — false opts
 *                             //   out. The popup z-index (above the drawer) is applied either way.
 *     basemapFallback: true,  // a GL basemap whose style fails to load (an error before style load, or
 *     basemapTimeoutMs: 15000,//   no style within this time) switches ONCE to the theme's raster
 *     onBasemapFallback: (e) => {},   // fallback (osm / osm-dark) and leaves a note in the gallery.
 *     maps: [secondMap, …],   // optional SECONDARY maps (side-by-side / inset): every basemap change is
 *                             //   one setStyle on each (onRestyle(map) is called per map) and layer
 *                             //   order / visibility / transparency are applied to each too.
 *     onLayerStateChange: (state) => {},       // optional: { order, opacity, visible } after a list change.
 *     dir: "auto",            // "ltr" | "rtl" | "auto" (read from the container) — RTL mirrors the
 *                             //   cluster, the drawer, its grip and the chevrons.
 *     fullscreenTarget,       // optional element (default: container).
 *   });
 *   `map` may be null at mount; call controls.setMap(map) once it exists (style it with
 *   controls.initialStyle(), and pass transformRequest: basemapTransformRequest(catalog) so a
 *   URL-rewrite rule also reaches the tiles/glyphs/sprite inside a GL style).
 *
 *   → controls = {
 *       setTheme(mode)      tell it the theme changed: Follow-the-theme restyles to the pair;
 *                           an explicit pick with a pair in that mode swaps and stays explicit.
 *       setBasemap(id)      an explicit pick (alias-aware); "auto" / null = Follow the theme.
 *       getBasemap()        the explicit pick, or null while following the theme.
 *       effectiveBasemap()  the id in force.
 *       styleFor(id), initialStyle()   MapLibre style for a basemap id / for the one in force.
 *       openDrawer(kind)    "layers" | "base" (toggles when it is already open).
 *       closeAll()          close the drawer; true if something closed.
 *       escape()            ONE Esc closes ONE layer, topmost first: swallowed for escapeGuardMs after a
 *                           native full-screen exit; else the app's closePopup() (true = stop); else
 *                           every MapLibre popup on the map(s); else ends the active tool; else closes
 *                           the drawer. true = consumed — the app's own Esc chain stops there.
 *                           The standard app chain: `if (controls.escape()) return;` then app steps
 *                           (an app modal that must outrank the chrome is checked BEFORE escape()).
 *       closePopups()       close ALL open popups at once (closePopup() + MapLibre popups); true if any.
 *       handleKey(e)        L / B / G / F / Esc; true = handled.
 *       refresh()           re-render the open drawer (layer list keeps keyboard focus).
 *       refreshLayers()     re-render the layer list only, if it is the one open — and only when its
 *                           HTML changed (so a click in progress is never lost). Still: call it when
 *                           your data changes, not on every styledata / idle.
 *       renderChrome()      rebuild the cluster (e.g. after Fullscreen API availability changes).
 *       syncChrome()        re-sync the buttons' pressed / expanded state (e.g. the app hid its legend
 *                           itself) without rebuilding the cluster. refreshChrome() is an alias.
 *       getOpenDrawer()     "layers" | "base" | null.
 *       getTheme()          "light" | "dark" (getMode() is the TOOL mode, not the theme).
 *       drawerWidth(which?), setDrawerWidth(px, which?)   a drawer's session width (clamped). `which`
 *                           = "layers" | "base" ("basemap" is an alias). Without `which` it is the open
 *                           drawer — or, with none open, the NEXT drawer to open. drawerWidth() is 0
 *                           without layout (jsdom) unless a width was set or authored.
 *       themeBasemap(mode?) the id the theme pair chooses in a mode (default: the current one).
 *       basemapFallback()   { from, to, reason } once a GL basemap fell back to raster, else null.
 *       setSecondaryMaps(maps), getMaps()   the secondary maps; getMaps() = [primary, …secondary].
 *       applyLayerState()   write order / visibility / transparency to the map — call it after
 *                           anything (re-)adds a layer. Layers it does not know (not a descriptor
 *                           sublayer) end up UNDER the descriptor layers — list overlays in topLayers.
 *       raiseOverlays()     re-assert topLayers + the tools' graphics on top (idempotent: no
 *                           moveLayer when already in order) — e.g. after adding an overlay layer.
 *       setMap(map), destroy(), isFullscreen(), toggleFullscreen(),
       isBusy()            true while Measure or Draw owns map clicks — the app's identify/selection
                           click handlers return early when it is. Always false with no tools.
       getMode(), setMode(m)   "identify" | "measure" | "draw"; setMode("identify") ends the tool.
       tools               the tool handles (tools.ts): open/close/active, locate(), print(),
                           toGeoJSON(), measureValues(), … — see tools.ts.
       scale               the scale bar handle (scale.ts) — element, units(), setUnits(u), update(),
                           lines() — or null when the scale bar is off.
 *       state               { mode, autoBasemap, basemap, moreOpen } (live, read/write)
 *       LL                  the layer list's session state (order, opacity, expanded, …, meta cache)
 *     }
 *
 * ── LayerDescriptor — what every app fills in, one per operational layer ─────────────────────
 *   {
 *     id:        string                REQUIRED, stable across re-renders
 *     title:     string                REQUIRED, as the reader knows it (clamped to 2 lines)
 *     sublayers: [{ id, opacity? }]    REQUIRED: the MapLibre layer ids it draws, bottom → top.
 *                                      opacity = { "<paint prop>": authoredValue } — transparency
 *                                      MULTIPLIES these, so a layer only ever gets fainter. The
 *                                      authored value may be a number OR an expression: a data-driven
 *                                      one becomes ["*", expr, k]; a zoom interpolate / step keeps
 *                                      zoom on top and multiplies its output stops. At 0 % the
 *                                      authored value is written back as-is (never left unset).
 *     visible:   boolean               REQUIRED; the app owns visibility…
 *     setVisible(on)                   REQUIRED; …the list only asks.
 *     sub?:      string                one line of live state under the title
 *     swatch?:   html                  small symbol (helpers: .ll-dots / .ll-sq / .ll-ramp)
 *     legend?:   html                  the inline legend, in the app's own classes
 *     zoomTo?()                        "Zoom to layer" (disabled when absent)
 *     about?: { what, publisher, current, coverage, inView, note }   all optional; PLAIN sentences
 *                                      for a non-GIS reader ("Layer information")
 *     services?: [{ title, url, filter? }]   "Technical details", read LIVE from `${url}?f=json`
 *                                      (once per URL per session; failures cached until Retry), or
 *     technical?(): [{ title, link?, source?, filter?, rows: [[label, text]],
 *                      fields: [[name, alias]], noFields? }]   for local data
 *   }
 *   Everything a service returns is untrusted and escaped; the object-id field is read from the
 *   service, never assumed.
 */
import { ICONS } from "./icons.js";
import { createTools } from "./tools.js";
import { createScaleBar, scaleOptions } from "./scale.js";
import type { ScaleBarOptions, ScaleBarHandle } from "./scale.js";
import { DEFAULT_GLYPHS } from "./basemaps.js";
import type { BasemapEntry, ThemeBasemapPair } from "./basemaps.js";
import type { ToolsOptions, ToolsHandle, InteractionHook, InteractionMode, DownloadFn, GeolocationLike, FetchLike } from "./tools.js";

// ── types ────────────────────────────────────────────────────────────────────────────────────
/** The basemap catalog as mountMapControls() reads it — `import * as catalog` from ./basemaps
 *  satisfies it; an app may also pass its own object of the same shape. */
export interface BasemapCatalog {
  BASEMAPS: readonly BasemapEntry[];
  basemapById: (id: any) => BasemapEntry | null | undefined;
  resolveBasemapId?: (id: any) => string | null;
  recommendedWith?: (extras?: any) => string[];
  BASEMAP_RECOMMENDED?: readonly string[];
  THEME_BASEMAP?: ThemeBasemapPair | null;
  basemapForTheme?: (mode: string) => string;
  toXyz?: (template: string) => string;
  resolveUrl?: (url: any) => any;
  /** The glyph URL a style without its own is given (the catalog's keyless VersaTiles endpoint). */
  DEFAULT_GLYPHS?: string;
}
/** The subset of a MapLibre map the controls call (a maplibregl.Map satisfies it). */
export interface MapLike {
  setStyle?(style: any, options?: any): any;
  on?(type: string, ...args: any[]): any;
  off?(type: string, ...args: any[]): any;
  once?(type: string, ...args: any[]): any;
  zoomIn?(...args: any[]): any;
  zoomOut?(...args: any[]): any;
  resize?(...args: any[]): any;
  getLayer?(id: string): any;
  moveLayer?(id: string, beforeId?: string): any;
  getLayoutProperty?(id: string, name: string): any;
  setLayoutProperty?(id: string, name: string, value: any, options?: any): any;
  getPaintProperty?(id: string, name: string): any;
  setPaintProperty?(id: string, name: string, value: any, options?: any): any;
  getCanvas?(): any;
  getContainer?(): any;
}
/** A MapLibre style object built for a raster catalog entry. */
export interface RasterBasemapStyle { version: 8; glyphs?: string; sources: Record<string, any>; layers: any[] }
/** One MapLibre layer a LayerDescriptor draws. opacity = { "<paint prop>": authoredValue } —
 *  transparency MULTIPLIES these, so a layer only ever gets fainter. */
export interface SublayerRef { id: string; opacity?: Record<string, OpacityValue> }
/** An authored *-opacity: a number, a MapLibre expression (data-driven, or a zoom interpolate / step),
 *  or a legacy `{ stops }` function. */
export type OpacityValue = number | readonly unknown[] | { stops: [number, number][]; [k: string]: unknown };
/** The Layers / Basemap drawer's size options (MapControlsOptions.drawer). */
export interface DrawerOptions {
  /** An existing element to use as the drawer (else one is created inside the container). */
  element?: HTMLElement;
  /** The width (px) the drawer OPENS at. Default: the stylesheet's (≈ 316–320 px). */
  width?: number;
  /** Clamp for the grip. Default 260. */
  minWidth?: number;
  /** Clamp for the grip. Default 520 (and never wider than the container allows). */
  maxWidth?: number;
  /** false locks the width (no grip). Default true — panels are resizable by default. */
  resizable?: boolean;
}
/** What onLayerStateChange() is told after a change made in the layer list. Opacity 0–1, order top first. */
export interface LayerStateSnapshot { order: string[]; opacity: Record<string, number>; visible: Record<string, boolean> }
/** "Layer information": PLAIN sentences for a non-GIS reader. All optional. */
export interface LayerAbout { what?: string; publisher?: string; current?: string; coverage?: string; inView?: string; note?: string }
/** A service whose `${url}?f=json` is read LIVE for "Technical details". */
export interface LayerService { title?: string; url: string; filter?: string | null }
/** One "Technical details" block (local data, or what serviceBlock() derives from a service). */
export interface TechnicalBlock {
  title?: string;
  link?: string;
  source?: string;
  filter?: string | null;
  rows?: [string, string][];
  fields?: [string, string][];
  noFields?: string;
}
/** What every app fills in, one per operational layer (see the contract in the header). */
export interface LayerDescriptor {
  /** Stable across re-renders. */
  id: string;
  /** As the reader knows it (clamped to 2 lines). */
  title: string;
  /** The MapLibre layer ids it draws, bottom → top. */
  sublayers: SublayerRef[];
  /** The app owns visibility… */
  visible: boolean;
  /** …the list only asks. */
  setVisible(on: boolean): void;
  /** One line of live state under the title. */
  sub?: string;
  /** Small symbol HTML (helpers: .ll-dots / .ll-sq / .ll-ramp). */
  swatch?: string;
  /** The inline legend HTML, in the app's own classes. */
  legend?: string;
  /** "Zoom to layer" (disabled when absent). */
  zoomTo?(): void;
  about?: LayerAbout;
  services?: LayerService[];
  technical?(): TechnicalBlock[];
}
/** The options of mountMapControls() — see the header for each one. */
export interface MapControlsOptions {
  /** REQUIRED. The positioned box around the map (gets class "smc"). */
  container: HTMLElement;
  /** REQUIRED. The basemap catalog namespace. */
  catalog: BasemapCatalog;
  /** Up to 3 ids appended to the universal Recommended 8. */
  recommendedExtras?: string[];
  theme?: { mode?: "light" | "dark" | string };
  themeBasemaps?: ThemeBasemapPair | { light: string; dark: string };
  /** Explicit pick (alias-aware); omitted / "auto" = Follow the theme. */
  initialBasemap?: string | null;
  /** LayerDescriptor[] in default order, top first. Omit it and there is no Layers button. */
  layers?: () => LayerDescriptor[] | null | undefined;
  defaultOrder?: string[];
  panelSettings?: { html?: () => string; onClick?: (event: any) => boolean };
  /** A map dropped its sources / layers (styledata). Called once per map — the primary and each of
   *  `maps` — with that map; re-add your layers to it, then call applyLayerState(). */
  onRestyle?: (map?: MapLike) => void;
  /**
   * MapLibre layer ids kept ABOVE every descriptor layer, bottom → top — overlays that are not in the
   * layer list (selection highlight, sketch in progress, labels, halos). A function is re-read on
   * every pass. Re-applied after every applyLayerState() and every styledata; ids not on the map are
   * skipped and nothing is moved when the order is already right. The tools' graphics stay above.
   */
  topLayers?: string[] | (() => string[] | null | undefined) | null;
  /** Home / F. Gets the originating click or keydown event (e.g. shift-click on Home). */
  onFit?: (event?: any) => void;
  onToggleLegend?: () => void;
  legendOpen?: () => boolean;
  onBasemapChange?: (id: string) => void;
  onError?: (message: string) => void;
  /** Optional tools — ALL OFF by default. */
  tools?: ToolsOptions | null;
  /**
   * The glyph (font) URL every raster / "none" basemap style is built with, so app symbol layers with
   * a `text-field` draw on any basemap. Default: the catalog's keyless DEFAULT_GLYPHS (VersaTiles —
   * use DEFAULT_TEXT_FONT as the layers' `text-font`). Pass your own to keep your fonts across basemap
   * changes (a `map.setGlyphs()` call is dropped by every `setStyle`). A GL basemap keeps its own glyphs.
   */
  glyphs?: string | null;
  /** Optional scale bar, bottom-left — OFF by default. `true` = metric. */
  scale?: boolean | ScaleBarOptions | null;
  interaction?: InteractionHook;
  /** Print title. */
  title?: string;
  /** fetch-like, for Technical details (a SIMPLE GET). Default globalThis.fetch. */
  fetch?: FetchLike | typeof fetch;
  /** true (default): listen on window for L / B / G / F / Esc. */
  keyboard?: boolean;
  labels?: { fit?: string };
  cluster?: HTMLElement;
  /** An existing drawer element, or the drawer's size options (see DrawerOptions). */
  drawer?: HTMLElement | DrawerOptions;
  /** Told after each drawer resize (drag or arrow key) — for side effects, not persistence. */
  onDrawerResize?: (width: number, which: "layers" | "base") => void;
  fullscreenTarget?: HTMLElement;
  /**
   * Esc closes a POPUP first, ONE layer per press, topmost first: this callback is asked first — an
   * app's own HTML popup, card, side sheet or modal, or a MapLibre popup the app tracks (one with
   * `closeButton: false` should be registered here) — and when it returns true Esc stops there.
   * Otherwise the module closes every MapLibre popup on its map(s) itself. Only when no popup closed
   * does Esc go on to the tool, then the drawer.
   */
  closePopup?: () => boolean;
  /** How long (ms) after a native full-screen exit an Esc is swallowed. Default 300; 0 disables.
   *  Time-based: any Esc inside the window is swallowed, whichever key left full screen. */
  escapeGuardMs?: number;
  /**
   * Themed MapLibre popup cards: background, text, border, close button and tip from the --smc-*
   * tokens (or --smc-popup-bg / --smc-popup-fg / --smc-popup-border), light / dark with the controls'
   * theme, and the layout rules a page without maplibre-gl.css needs. Low specificity — an app's own
   * popup CSS (anything more specific than `.maplibregl-popup-content`, or later in the page) wins.
   * Default true; false opts out. The popup z-index (`--smc-popup-z`, above the drawer) is applied
   * either way.
   */
  popupStyles?: boolean;
  /**
   * A GL basemap whose style fails to load — an `error` before its style loads, or no style within
   * `basemapTimeoutMs` — is replaced ONCE per session by the theme's raster fallback (osm in light,
   * osm-dark in dark), `onBasemapFallback` is told, and the gallery shows a note. Default true.
   * Ignored when `basemapHost` owns the basemap.
   */
  basemapFallback?: boolean;
  /** How long (ms) a GL basemap style may take to load before the fallback. Default 15000; 0 = only
   *  an error triggers it. */
  basemapTimeoutMs?: number;
  /** Told once when a GL basemap fell back to raster. */
  onBasemapFallback?: (event: BasemapFallbackEvent) => void;
  /**
   * SECONDARY maps (side-by-side, inset, swipe): every basemap change is one setStyle on each (with
   * `onRestyle(map)` per map), and applyLayerState() writes order / visibility / transparency to each
   * — the descriptors' sublayer ids are expected to exist on them too (ids missing are skipped).
   * The tools stay on the primary map. Ignored for the basemap when `basemapHost` owns it.
   */
  maps?: (MapLike | null | undefined)[] | null;
  /** Told after every change made in the layer list (order, visibility, transparency, Reset). */
  onLayerStateChange?: (state: LayerStateSnapshot) => void;
  /** Text direction: "auto" (default) reads it from the container (dir attribute / computed style). */
  dir?: "ltr" | "rtl" | "auto";
  /** Seams for tests / embedding (tools). */
  download?: DownloadFn;
  geolocation?: GeolocationLike;
  isSecureContext?: boolean;
  /**
   * Optional: the app owns the basemap. Without it a basemap change is `map.setStyle()` (which drops
   * every source and layer). With it, the module calls `apply(id, reason)` instead and never touches
   * the style — e.g. an app that draws its basemap as layers beneath its own, or one whose state
   * store is the source of truth. `reason`: "pick" (the reader chose it), "follow" (Follow the theme
   * switched back on) or "theme" (a theme change swapped it). `current()` names the basemap actually
   * drawn (alias-aware; null/unknown = none of the catalog's), so the gallery ticks what is on the
   * map even before the first theme change. `onFollowChange(on)` is told when the reader flips
   * "Follow the theme".
   */
  basemapHost?: BasemapHost;
  /**
   * Optional: the app owns layer ORDER and TRANSPARENCY (e.g. a state store that drives the map).
   * The list then reads them from here and reports every change here, and applyLayerState() stops
   * writing order / visibility / transparency to the map — the owner drives the map itself.
   */
  layerState?: LayerStateHost;
}
/** What onBasemapFallback() is told: the GL basemap that failed, the raster drawn instead, and why. */
export interface BasemapFallbackEvent { from: string; to: string; reason: "error" | "timeout"; message?: string }
/** See MapControlsOptions.basemapHost. */
export interface BasemapHost {
  apply(id: string, reason: "pick" | "follow" | "theme"): void;
  current?(): string | null | undefined;
  onFollowChange?(follow: boolean): void;
}
/** See MapControlsOptions.layerState. Opacity is 0–1 (1 = opaque); order is top first. */
export interface LayerStateHost {
  order(): string[];
  opacity(id: string): number;
  setOrder(ids: string[]): void;
  setOpacity(id: string, opacity: number): void;
  /** Restore a layer's authored opacity ("Reset"). Default: setOpacity(id, 1). */
  resetOpacity?(id: string): void;
}
/** A drawer kind for drawerWidth() / setDrawerWidth(): "basemap" is an alias of "base". */
export type DrawerWhich = "layers" | "base" | "basemap";
/** Live module state (read/write). */
export interface MapControlsState { mode: "light" | "dark"; autoBasemap: boolean; basemap: string | null; moreOpen: boolean }
/** The layer list's session state. */
export interface LayerListState {
  defaults: string[];
  order: string[];
  opacity: Record<string, number>;
  expanded: Set<string>;
  acts: Set<string>;
  info: Set<string>;
  tech: Set<string>;
  allFields: Set<string>;
  meta: Map<string, { state: "loading" | "ok" | "err"; json?: any; err?: string }>;
  drag: string | null;
}
/** What mountMapControls() returns. */
export interface MapControls {
  state: MapControlsState;
  LL: LayerListState;
  setTheme(mode: string): void;
  setBasemap(id: string | null | undefined): void;
  getBasemap(): string | null;
  effectiveBasemap(): string;
  styleFor(id: string | null | undefined): string | RasterBasemapStyle;
  initialStyle(): string | RasterBasemapStyle;
  recommendedIds(): string[];
  openDrawer(which: "layers" | "base" | string): void;
  closeAll(): boolean;
  /** One Esc, one layer: full-screen guard → closePopup() → MapLibre popups → tool → drawer. true = consumed. */
  escape(): boolean;
  /** Close ALL open popups at once (closePopup() + every MapLibre popup on the map(s)); true if any closed. */
  closePopups(): boolean;
  /** The id the theme pair chooses in `mode` (default: the current theme mode). */
  themeBasemap(mode?: string): string;
  /** { from, to, reason } once a GL basemap fell back to its raster pair; null otherwise. */
  basemapFallback(): BasemapFallbackEvent | null;
  handleKey(e: { key: string }): boolean;
  refresh(): void;
  refreshLayers(): void;
  renderDrawer(): void;
  renderChrome(): void;
  /** Re-sync the cluster buttons' pressed / expanded state (e.g. after the app hid its legend itself). */
  syncChrome(): void;
  /** Alias of syncChrome(). */
  refreshChrome(): void;
  /** Which drawer is open, or null. */
  getOpenDrawer(): "layers" | "base" | null;
  /** The theme mode — getMode() is the TOOL mode. */
  getTheme(): "light" | "dark";
  /** A drawer's width in px: the session width, else its rendered width, else the authored width; 0
   *  when unknown (e.g. no layout in jsdom). No `which` = the open drawer (or a pending width). */
  drawerWidth(which?: DrawerWhich): number;
  /**
   * Set a drawer's session width (clamped to minWidth / maxWidth and the container); returns the width
   * applied. `which` = "layers" | "base" ("basemap" is an alias). Without `which` it applies to the open
   * drawer — or, when none is open, to the NEXT drawer that opens.
   */
  setDrawerWidth(px: number, which?: DrawerWhich): number;
  /** Replace the secondary maps (see MapControlsOptions.maps). */
  setSecondaryMaps(maps: (MapLike | null | undefined)[] | null | undefined): void;
  /** [primary, …secondary] — the primary omitted while it is null. */
  getMaps(): MapLike[];
  applyLayerState(map?: MapLike | null, descs?: LayerDescriptor[]): void;
  /** Re-assert topLayers + the tools' graphics on top of the map; idempotent (no moveLayer when in order). */
  raiseOverlays(map?: MapLike | null): void;
  llMoveTo(descs: LayerDescriptor[] | null | undefined, id: string, index: number): boolean;
  setMap(map: MapLike | null | undefined): void;
  getMap(): MapLike | null;
  isFullscreen(): boolean;
  toggleFullscreen(): void;
  destroy(): void;
  isBusy(): boolean;
  getMode(): InteractionMode;
  setMode(mode: InteractionMode | string): boolean;
  tools: ToolsHandle;
  /** The scale bar, or null when it is off. */
  scale: ScaleBarHandle | null;
  elements: { container: HTMLElement; cluster: HTMLElement; drawer: HTMLElement };
}

export { ICONS };
export const esc = (s: unknown): string => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[c]);

/** The map's layer ids bottom → top, or null when the map cannot say (getLayersOrder, else getStyle). */
function layerOrder(m: any): string[] | null {
  try {
    const o = m?.getLayersOrder?.();
    if (Array.isArray(o)) return o;
    const ls = m?.getStyle?.()?.layers;
    if (Array.isArray(ls)) return ls.map((l: any) => l?.id);
  } catch { /* a style not loaded yet */ }
  return null;
}
/**
 * Put `ids` (bottom → top) on the very top of the map, in that order. Ids not on the map are skipped
 * and duplicates count once. Idempotent: when they already are the topmost layers in that order,
 * NOTHING is moved (a moveLayer fires styledata, so an unconditional one inside a styledata handler
 * loops). When the map cannot report its order, they are moved. Returns how many layers moved.
 */
export function keepOnTop(m: MapLike | null | undefined, ids: readonly string[]): number {
  if (!m?.getLayer || !m.moveLayer || RAISING.has(m)) return 0;
  const want = ids.filter((id, i) => typeof id === "string" && id && ids.indexOf(id) === i && m.getLayer!(id));
  if (!want.length) return 0;
  const order = layerOrder(m);
  if (order && order.length >= want.length && want.every((id, i) => order[order.length - want.length + i] === id)) return 0;
  // A map that fires styledata SYNCHRONOUSLY from moveLayer would re-enter here half-way through the
  // sequence (order still wrong) and recurse; the pass in progress finishes the job, so skip.
  RAISING.add(m);
  try { for (const id of want) m.moveLayer(id); } finally { RAISING.delete(m); }
  return want.length;
}
const RAISING = new WeakSet<object>();

const isZoomInput = (x: unknown) => Array.isArray(x) && x.length === 1 && x[0] === "zoom";
const mulOut = (v: unknown, k: number): unknown => (typeof v === "number" ? v * k : ["*", v, k]);
/**
 * An authored *-opacity faded by transparency factor `k` (0–1, 1 = opaque). k = 1 returns the
 * authored value UNCHANGED (the same reference for an expression), so Reset restores it exactly.
 *   number                        → min(v, v·k)  (a layer only ever gets fainter)
 *   ["interpolate", t, ["zoom"], z0, v0, …] / ["step", ["zoom"], v0, z1, v1, …]
 *                                 → the same expression with every OUTPUT multiplied — MapLibre
 *                                   only accepts ["zoom"] as the input of a TOP-LEVEL interpolate /
 *                                   step, so it cannot be wrapped
 *   any other expression          → ["*", expr, k]   (data-driven: ["get", …], ["case", …], …)
 *   { stops: [[z, v], …] }        → the stops' values multiplied (legacy function)
 */
export function scaleOpacity(base: OpacityValue | unknown, k: number): unknown {
  const f = Math.max(0, Math.min(1, Number.isFinite(k) ? k : 1));
  if (typeof base === "number") return f === 1 ? base : Math.min(base, base * f);
  if (f === 1 || base == null) return base;
  if (Array.isArray(base)) {
    const op = base[0];
    if (typeof op === "string" && /^interpolate(-hcl|-lab)?$/.test(op) && isZoomInput(base[2]))
      return base.map((v, i) => (i >= 4 && i % 2 === 0 ? mulOut(v, f) : v));       // [op, type, input, z0, v0, z1, v1, …]
    if (op === "step" && isZoomInput(base[1]))
      return base.map((v, i) => (i >= 2 && i % 2 === 0 ? mulOut(v, f) : v));       // [step, input, v0, z1, v1, …]
    return ["*", base, f];
  }
  if (typeof base === "object" && Array.isArray((base as any).stops))
    return { ...(base as any), stops: (base as any).stops.map((s: any) => (Array.isArray(s) && typeof s[1] === "number" ? [s[0], s[1] * f] : s)) };
  return base;
}
const sameValue = (a: unknown, b: unknown) => a === b || (typeof a === "object" && typeof b === "object" && a != null && b != null && JSON.stringify(a) === JSON.stringify(b));

/**
 * Close every open MapLibre popup on a map. MapLibre keeps no public list of popups: some builds
 * have a private `_popups` array (Popup.remove() fires "close"), MapLibre 4.7.1 has none. So, in
 * order: (1) every popup on `_popups` where the build has one; (2) every `.maplibregl-popup` still in
 * the map container's DOM — its close button is pressed (MapLibre's own handler: remove() + "close");
 * (3) a popup with NO close button (`closeButton: false`) has its element taken out of the container
 * — MapLibre is not told, so an app that opens such popups should close them through `closePopup`.
 * Returns how many closed.
 */
export function closeMapPopups(m: MapLike | null | undefined): number {
  if (!m) return 0;
  let n = 0;
  const list: any[] = Array.isArray((m as any)._popups) ? [...(m as any)._popups] : [];
  for (const p of list) {
    try { if (p?.isOpen ? p.isOpen() : true) { p.remove?.(); n++; } } catch { /* a half-removed popup */ }
  }
  let box: any = null;
  try { box = m.getContainer?.(); } catch { box = null; }
  let els: any[] = [];
  try { els = box?.querySelectorAll ? [...box.querySelectorAll(".maplibregl-popup,.mapboxgl-popup")] : []; } catch { els = []; }
  for (const el of els) {
    if (el.isConnected === false) continue;                  // closed by step (1), or by a sibling's handler
    try {
      const x = el.querySelector?.(".maplibregl-popup-close-button,.mapboxgl-popup-close-button");
      if (x && typeof x.click === "function") x.click();
      // a close button whose handler did not take the popup away (a detached / stubbed one): remove it
      if ((!x || el.isConnected) && el.isConnected !== false) el.remove ? el.remove() : el.parentNode?.removeChild(el);
      n++;
    } catch { /* a popup mid-teardown */ }
  }
  return n;
}

/**
 * The popup stylesheet mountMapControls() injects once per document (`<style data-smc-popup-css>`).
 * Two parts:
 *  1. ALWAYS: a MapLibre popup inside a map with controls stacks ABOVE the cluster tier's drawer —
 *     `z-index: var(--smc-popup-z, calc(var(--smc-z,40) + 2))` — so an open drawer never hides it.
 *  2. With `popupStyles` (default; the container carries data-smc-popups): a themed card keyed to the
 *     --smc-* tokens (so it follows the controls' light / dark mode) — background (a one-colour gradient
 *     since 1.0.4 — see POPUP_CSS), text, border,
 *     close button and tip — plus the layout rules maplibre-gl.css would give, for a page without it,
 *     and `table{color:inherit}` for quirks-mode pages (whose tables do not inherit colour / size).
 * Every selector is `:where(...)`-wrapped down to MapLibre's own specificity, and the element is placed
 * right AFTER maplibre-gl.css (else first in <head>), so it beats MapLibre's white card but loses to
 * an app's own popup CSS — anything more specific, or later in the page.
 */
export const POPUP_CSS = (() => {
  const W = ":where(.smc[data-smc-popups])";
  const BG = "var(--smc-popup-bg,var(--smc-bg,#fff))", FG = "var(--smc-popup-fg,var(--smc-fg,#101418))";
  // 1.0.4: the card's fill is a ONE-COLOUR GRADIENT of the same token, never a plain colour. Apps make this card
  // scroll (max-height + overflow:auto), and an opaque solid-colour scroller over the map is an occluder that
  // Chrome's software compositor (GPU off / blocklisted, RDP, VMs, headless --disable-gpu) mis-places, punching a
  // blank box through the map. An image fill is never an occluder; the colour is identical. The tip keeps BG
  // (a border colour, not a scroller). See strata/docs/troubleshooting.md §7.
  const FILL = `linear-gradient(${BG},${BG})`;
  const sel = (s: string) => s.split(",").map((x) => `${W} ${x.trim()}`).join(",");
  const tip = (anchors: string[], css: string) => sel(anchors.map((a) => `.maplibregl-popup-anchor-${a} .maplibregl-popup-tip`).join(",")) + `{${css}}`;
  return [
    `:where(.smc) .maplibregl-popup,:where(.smc) .mapboxgl-popup{z-index:var(--smc-popup-z,calc(var(--smc-z,40) + 2))}`,
    `${sel(".maplibregl-popup")}{position:absolute;top:0;left:0;display:flex;pointer-events:none;will-change:transform}`,
    `${sel(".maplibregl-popup-anchor-top,.maplibregl-popup-anchor-top-left,.maplibregl-popup-anchor-top-right")}{flex-direction:column}`,
    `${sel(".maplibregl-popup-anchor-bottom,.maplibregl-popup-anchor-bottom-left,.maplibregl-popup-anchor-bottom-right")}{flex-direction:column-reverse}`,
    `${sel(".maplibregl-popup-anchor-left")}{flex-direction:row}`,
    `${sel(".maplibregl-popup-anchor-right")}{flex-direction:row-reverse}`,
    `${sel(".maplibregl-popup-tip")}{width:0;height:0;border:10px solid transparent;z-index:1}`,
    tip(["top"], `align-self:center;border-top:none;border-bottom-color:${BG}`),
    tip(["top-left"], `align-self:flex-start;border-top:none;border-left:none;border-bottom-color:${BG}`),
    tip(["top-right"], `align-self:flex-end;border-top:none;border-right:none;border-bottom-color:${BG}`),
    tip(["bottom"], `align-self:center;border-bottom:none;border-top-color:${BG}`),
    tip(["bottom-left"], `align-self:flex-start;border-bottom:none;border-left:none;border-top-color:${BG}`),
    tip(["bottom-right"], `align-self:flex-end;border-bottom:none;border-right:none;border-top-color:${BG}`),
    tip(["left"], `align-self:center;border-left:none;border-right-color:${BG}`),
    tip(["right"], `align-self:center;border-right:none;border-left-color:${BG}`),
    `${sel(".maplibregl-popup-content")}{position:relative;pointer-events:auto;padding:10px 26px 10px 12px;border-radius:8px;` +
      `background:${FILL};color:${FG};border:1px solid var(--smc-popup-border,var(--smc-border,#C7CED6));` +
      `box-shadow:var(--smc-shadow,0 6px 20px rgba(0,0,0,.18));font-size:12.5px;line-height:1.45}`,
    `${sel(".maplibregl-popup-anchor-top-left .maplibregl-popup-content")}{border-top-left-radius:0}`,
    `${sel(".maplibregl-popup-anchor-top-right .maplibregl-popup-content")}{border-top-right-radius:0}`,
    `${sel(".maplibregl-popup-anchor-bottom-left .maplibregl-popup-content")}{border-bottom-left-radius:0}`,
    `${sel(".maplibregl-popup-anchor-bottom-right .maplibregl-popup-content")}{border-bottom-right-radius:0}`,
    `${sel(".maplibregl-popup-close-button")}{position:absolute;top:2px;right:2px;width:22px;height:22px;padding:0;border:0;border-radius:5px;` +
      `min-width:0;min-height:0;margin:0;box-shadow:none;text-transform:none;letter-spacing:normal;` +
      `background:transparent;color:inherit;opacity:.7;font:16px/1 system-ui,sans-serif;cursor:pointer}`,
    `${sel(".maplibregl-popup-close-button:hover")}{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}`,
    `${sel(".maplibregl-popup-close-button:focus-visible")}{opacity:1;outline:2px solid var(--smc-accent,#0B5FA5);outline-offset:0}`,
    `${sel(".maplibregl-popup-content table")}{color:inherit;font-size:inherit;line-height:inherit;border-collapse:collapse}`,
    `${sel(".maplibregl-popup-content td")},${sel(".maplibregl-popup-content th")}{padding:1px 0;vertical-align:top}`,
    `${sel(".maplibregl-popup-content td + td")},${sel(".maplibregl-popup-content th + td")}{padding-left:10px}`,
    `${sel(".maplibregl-popup-content a")}{color:var(--smc-accent,#0B5FA5)}`,
  ].join("\n");
})();

/**
 * Inject POPUP_CSS once into `doc` (idempotent; never throws — a DOM stub without <head> is skipped).
 * Placed right after the last MapLibre stylesheet — a <link> whose href names maplibre / mapbox-gl, or a
 * <style data-maplibre-css> holding an inlined copy — else first in <head>. It never anchors on the app's
 * own CSS, so it beats MapLibre's defaults and loses to the app's own popup CSS. Returns the element, or null.
 */
export function ensureMapControlsPopupStyles(doc: any = globalThis.document): any {
  try {
    if (!doc?.createElement || !doc.head) return null;
    const have = doc.querySelector?.("style[data-smc-popup-css]");
    if (have) return have;
    const el = doc.createElement("style");
    el.setAttribute("data-smc-popup-css", "");
    el.textContent = POPUP_CSS;
    let anchor: any = null;
    const nodes: any[] = doc.querySelectorAll ? [...doc.querySelectorAll('link[rel~="stylesheet"],style')] : [];
    for (const n of nodes) {
      if (n === el) continue;
      // Only MapLibre's OWN sheet is an anchor — never the app's CSS that merely mentions .maplibregl-popup
      // (anchoring after it would make the themed card override the app's own popup design).
      const hit = n.tagName === "LINK"
        ? /maplibre|mapbox-gl/i.test(n.getAttribute?.("href") ?? "")
        : !!n.hasAttribute?.("data-maplibre-css");
      if (hit) anchor = n;
    }
    if (anchor?.parentNode) anchor.parentNode.insertBefore(el, anchor.nextSibling);
    else doc.head.insertBefore(el, doc.head.firstChild ?? null);
    return el;
  } catch { return null; }
}

/** A MapLibre style for one catalog entry. Every URL passes through catalog.resolveUrl.
 *  A raster (or "none") style carries `glyphs` — `opts.glyphs`, else the catalog's DEFAULT_GLYPHS,
 *  else the package's own — so an app's `text-field` layers draw on it. A GL style is returned as
 *  its URL and keeps its own glyphs. */
export function basemapStyle(catalog: BasemapCatalog, id: string | null | undefined,
                             opts: { glyphs?: string | null } = {}): string | RasterBasemapStyle {
  const b = catalog.basemapById(id);
  const url = (u: any) => (catalog.resolveUrl ? catalog.resolveUrl(u) : u);
  const xyz = (u: any) => (catalog.toXyz ? catalog.toXyz(url(u)) : url(u));
  const glyphs: string = url(opts.glyphs || catalog.DEFAULT_GLYPHS || DEFAULT_GLYPHS);
  if (!b) return { version: 8, glyphs, sources: {}, layers: [] };    // "none": a blank ground
  // A vector preset IS a style — hand MapLibre the URL. A raster one becomes a one-source style,
  // so there is ONE code path: always setStyle, always re-hydrate on styledata afterwards.
  if (b.style) return url(b.style);
  // maxzoom = the deepest level the service really has; past it MapLibre over-zooms the last real
  // tiles instead of fetching a grey "Map data not yet available" placeholder.
  const mz = b.maxZoom ? { maxzoom: b.maxZoom } : {};
  const style: RasterBasemapStyle = { version: 8, glyphs, sources: { base: { type: "raster", tiles: [xyz(b.templateUrl)], tileSize: 256, attribution: b.copyright, ...mz } },
                  // an optional `paint` (e.g. OpenStreetMap Dark's inversion) styles the BASE raster only
                  layers: [{ id: "base", type: "raster", source: "base", ...(b.paint ? { paint: { ...b.paint } } : {}) }] };
  // an optional raster OVERLAY (the reference labels of a "hybrid") sits directly above the base
  if (b.overlay) {
    style.sources.overlay = { type: "raster", tiles: [xyz(b.overlay)], tileSize: 256, attribution: b.copyright, ...mz };
    style.layers.push({ id: "overlay", type: "raster", source: "overlay" });
  }
  return style;
}

/** For new maplibregl.Map({ transformRequest }): catalog.resolveUrl does not reach the URLs INSIDE a
 *  GL style (its tiles, glyphs, sprite) — this does. Identity (undefined) unless a rewrite rule is set. */
export const basemapTransformRequest = (catalog: BasemapCatalog) => (url: string): { url: string } | undefined => {
  const u = catalog.resolveUrl ? catalog.resolveUrl(url) : url;
  return u && u !== url ? { url: u } : undefined;
};

const LL_ABOUT: [keyof LayerAbout, string][] = [["what", "What it shows"], ["publisher", "Who publishes it"], ["current", "How current"],
                  ["coverage", "Coverage"], ["inView", "In this view"], ["note", "Good to know"]];
const LL_FIELDS_SHOWN = 12;
const llDate = (ms: number) => new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

/** ArcGIS REST layer / image-service JSON → a technical block. Generic: it knows the REST spec,
 *  nothing about any app. Missing values are SAID to be missing, never filled in. */
export function serviceBlock(j: any): { rows: [string, string][]; fields: [string, string][]; noFields: string } {
  const rows: [string, string][] = [];
  const sr = j.extent?.spatialReference ?? j.spatialReference ?? j.sourceSpatialReference ?? {};
  const wkid = sr.latestWkid ?? sr.wkid;
  rows.push(["Spatial reference", wkid != null ? `EPSG:${wkid}${sr.wkid != null && sr.wkid !== wkid ? ` (wkid ${sr.wkid})` : ""}` : "Not provided by the service"]);
  const e = j.extent;
  if (e && [e.xmin, e.ymin, e.xmax, e.ymax].every(Number.isFinite)) {
    const deg = Math.max(Math.abs(e.xmin), Math.abs(e.xmax)) <= 180 && Math.max(Math.abs(e.ymin), Math.abs(e.ymax)) <= 90;
    const r = (v: number) => (deg ? v.toFixed(3) : Math.round(v).toLocaleString("en-US"));
    rows.push(["Extent", `${r(e.xmin)}, ${r(e.ymin)} → ${r(e.xmax)}, ${r(e.ymax)}`]);
  } else rows.push(["Extent", "Not provided by the service"]);
  const raster = j.pixelType != null || j.bandCount != null;
  if (raster) {
    rows.push(["Pixel type", j.pixelType ?? "Not provided by the service"]);
    const cs = [j.pixelSizeX, j.pixelSizeY].filter(Number.isFinite);
    rows.push(["Cell size", cs.length ? cs.map((v) => +v.toFixed(3)).join(" × ") : "Not provided by the service"]);
    rows.push(["Bands", j.bandCount != null ? String(j.bandCount) : "Not provided by the service"]);
    if (Array.isArray(j.minValues) && Array.isArray(j.maxValues) && j.minValues.length)
      rows.push(["Value range", j.minValues.map((v, k) => `${+Number(v).toFixed(2)} – ${+Number(j.maxValues[k]).toFixed(2)}`).join("; ")]);
  } else rows.push(["Geometry type", j.geometryType ? String(j.geometryType).replace(/^esriGeometry/, "") + ` (${j.geometryType})` : "Not provided by the service"]);
  // the object-id field, READ from the service (never assume OBJECTID)
  const fields = Array.isArray(j.fields) ? j.fields : [];
  const declared = j.objectIdField ?? j.objectIdFieldName;
  const typed = fields.find((f) => f?.type === "esriFieldTypeOID")?.name;
  rows.push(["Object ID field", declared ? String(declared) + " (declared by the service)"
    : typed ? `${typed} (not declared; the field typed OID)` : "None declared by the service"]);
  const ed = j.editingInfo ?? {}, fmt = (ms: number) => (Number.isFinite(ms) ? llDate(ms) : null);
  const data = fmt(ed.dataLastEditDate), any = fmt(ed.lastEditDate);
  rows.push(["Last updated", data ? `${data} (data last edited)${any && any !== data ? ` · service edited ${any}` : ""}`
    : any ? `${any} (service last edited)` : "Not provided by the service"]);
  const plain = (s: unknown) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  rows.push(["Copyright", plain(j.copyrightText) || "None stated by the service"]);
  const use = [plain(j.licenseInfo), plain(j.accessInformation)].filter(Boolean).join(" · ");
  if (use) rows.push(["Use constraints", use]);
  return { rows, fields: fields.filter((f: any) => f?.name).map((f: any): [string, string] => [String(f.name), f.alias == null ? "" : String(f.alias)]),
           noFields: raster ? "None — an image service carries pixel values, not attribute fields" : "None listed by the service" };
}

/** What the basemap gallery shows — see basemapGalleryHtml(). */
export interface BasemapGalleryView {
  /** The id in force (ticked). */
  effective: string;
  /** Is "Follow the theme" on? */
  auto: boolean;
  mode: "light" | "dark" | string;
  /** Recommended ids, in order (already filtered to the catalog). */
  recommended: string[];
  moreOpen: boolean;
  /** The id the theme would choose in this mode (named on the Follow switch). */
  themeBasemap: string;
  /** Prefix for the element ids (default "bm") — set it when two galleries share a page. */
  idPrefix?: string;
  /** false hides the Follow-the-theme switch (default true). */
  showFollow?: boolean;
}

/** The gallery: a Follow-the-theme switch, a "Recommended" section (always open) and a
 *  collapsible "More basemaps" holding every OTHER basemap grouped by `group` in catalog order —
 *  no basemap appears twice. The card is a radio; the info icon is its SIBLING, so hovering or
 *  clicking it never selects. Collapsed More cards stay in the DOM, so the radio set is whole.
 *  Pure: one HTML string, shared by the drawer and mountBasemapGallery(). */
export function basemapGalleryHtml(catalog: BasemapCatalog, view: BasemapGalleryView): string {
  const { effective: eff, recommended: rec, moreOpen, mode } = view;
  const p = view.idPrefix ?? "bm";
  const groups: { name: string; items: BasemapEntry[] }[] = [];
  for (const b of catalog.BASEMAPS) {
    if (rec.includes(b.id)) continue;
    const g = b.group ?? "Basemaps";
    let e = groups.find((x) => x.name === g);
    if (!e) groups.push((e = { name: g, items: [] }));
    e.items.push(b);
  }
  const moreN = groups.reduce((n, g) => n + g.items.length, 0);
  const card = (b: any) => {
    const on = eff === b.id;
    // NOT loading="lazy": the drawer is its own scroller, and a lazy image below its fold never
    // loads. A failed thumbnail hides itself and the neutral block behind it shows.
    const img = b.thumbnail ? `<img alt="" src="${esc(b.thumbnail)}" decoding="async" onerror="this.hidden=true">` : "";
    return `<div class="bm-card">` +
      `<button class="bm-pick" data-base="${esc(b.id)}" role="radio" aria-checked="${on}" aria-label="${esc(b.title)}">` +
      `<span class="bm-img">${img}<span class="bm-check">${ICONS.check}</span></span>` +
      `<span class="bm-title">${esc(b.title)}</span></button>` +
      `<span class="bm-info" tabindex="0" role="img" aria-label="${esc(b.description ?? "")}" data-tip="${esc(b.description ?? "")}">${ICONS.info}</span>` +
      `</div>`;
  };
  return `<h3>Basemap</h3>` +
    (view.showFollow === false ? "" :
      `<button class="bm-follow" data-base="__auto" role="switch" aria-checked="${view.auto}">` +
      `<span>Follow the theme<span class="now">${esc(catalog.basemapById(view.themeBasemap)?.title ?? "")} in ${esc(mode)} mode</span></span>` +
      `<span class="bm-sw" aria-hidden="true"></span></button>`) +
    `<div role="radiogroup" aria-label="Basemaps">` +
    (rec.length ? `<div class="bm-sec" id="${p}-rec-h">Recommended</div>` +
      `<div class="bm-grid" data-section="recommended" aria-labelledby="${p}-rec-h">${rec.map((id) => card(catalog.basemapById(id))).join("")}</div>` : "") +
    (moreN ? `<button class="bm-more" data-bmmore aria-expanded="${moreOpen}" aria-controls="${p}-more-body">${ICONS.chevron}` +
      `<span>More basemaps <span class="n">(${moreN})</span></span></button>` +
      `<div id="${p}-more-body" class="bm-more-body" data-section="more"${moreOpen ? "" : " hidden"}>` +
      groups.map((g) => `<div class="bm-group">${esc(g.name)}</div><div class="bm-grid">${g.items.map(card).join("")}</div>`).join("") +
      `</div>` : "") +
    `</div><div class="bm-tip" id="${p}-tip" role="tooltip" hidden></div>`;
}

/** Options of mountBasemapGallery(). */
export interface BasemapGalleryOptions {
  /** REQUIRED. The basemap catalog namespace. */
  catalog: BasemapCatalog;
  /** The app's theme mode (what Follow the theme follows). Default "light". */
  mode?: "light" | "dark" | string;
  /** The theme pair (else catalog.THEME_BASEMAP / basemapForTheme, else "osm" / "osm-dark"). */
  themeBasemaps?: { light: string; dark: string } | null;
  /** Up to 3 ids appended to the universal Recommended 8. */
  recommendedExtras?: string[];
  /** The basemap actually drawn (alias-aware). Omitted / unknown → the theme's choice is ticked. */
  current?: () => string | null | undefined;
  /** Is Follow the theme on? Default: true until the reader picks. */
  follows?: () => boolean;
  /** false hides the Follow-the-theme switch. */
  showFollow?: boolean;
  /** A card was picked (resolved id). */
  onPick?: (id: string) => void;
  /** The Follow switch flipped; `themeId` is the basemap the theme chooses now. */
  onFollowChange?: (follow: boolean, themeId: string) => void;
  /** Element-id prefix (default: a unique "bmg<n>"). */
  idPrefix?: string;
}
/** What mountBasemapGallery() returns. */
export interface BasemapGallery {
  /** Re-render; pass a new mode when the theme changed. */
  update(next?: { mode?: string }): void;
  destroy(): void;
  readonly element: HTMLElement;
}
/**
 * The Recommended ids, in order: the universal 8 + the app's extras (≤ 3), then each member of the
 * active THEME PAIR that is not already there (so a vt-gray / vt-gray-dark app finds both halves under
 * Recommended with no `recommendedExtras`). Aliases resolved, unknown ids and duplicates dropped.
 */
export function recommendedPlusPair(catalog: BasemapCatalog, extras: readonly unknown[] | null | undefined,
                                    pair: readonly (string | null | undefined)[] = []): string[] {
  const has = (id: string) => catalog.BASEMAPS.some((b) => b.id === id);
  const rec = catalog.recommendedWith ? catalog.recommendedWith(extras ?? []) : [...(catalog.BASEMAP_RECOMMENDED ?? [])];
  const out = rec.filter((id, i, a) => a.indexOf(id) === i && has(id));
  for (const raw of pair) {
    const id = raw == null ? null : (catalog.resolveBasemapId ? catalog.resolveBasemapId(raw) : raw);
    if (id && !out.includes(id) && has(id)) out.push(id);
  }
  return out;
}

let galleryN = 0;
/** The basemap gallery ON ITS OWN — the same cards, sections, thumbnails, info tooltip and Follow
 *  switch as the drawer, rendered into any element (e.g. a docked Basemap panel). The host owns the
 *  basemap: it is told picks and Follow flips and answers current() / follows(). */
export function mountBasemapGallery(element: HTMLElement, opts: BasemapGalleryOptions): BasemapGallery {
  const { catalog } = opts;
  if (!catalog?.basemapById) throw new Error("mountBasemapGallery: `catalog` is required");
  const el: any = element;
  const p = opts.idPrefix ?? `bmg${++galleryN}`;
  let mode = opts.mode === "dark" ? "dark" : "light";
  let moreOpen = false;
  let localAuto = true, localPick: string | null = null;
  const resolve = (id: any): string | null => (catalog.resolveBasemapId ? catalog.resolveBasemapId(id) : id) ?? null;
  const pair = opts.themeBasemaps ?? catalog.THEME_BASEMAP ?? null;
  const themeId = () => (pair ? (mode === "dark" ? pair.dark : pair.light)
    : catalog.basemapForTheme ? catalog.basemapForTheme(mode) : (mode === "dark" ? "osm-dark" : "osm"));
  const auto = () => (opts.follows ? opts.follows() : localAuto);
  const effective = () => {
    const cur = opts.current?.();
    if (cur != null) return resolve(cur) ?? String(cur);
    return auto() ? themeId() : localPick ?? themeId();
  };
  const recommended = () => recommendedPlusPair(catalog, opts.recommendedExtras,
    pair ? [pair.light, pair.dark] : [themeIdFor("light"), themeIdFor("dark")]);
  function themeIdFor(m: string) { return catalog.basemapForTheme ? catalog.basemapForTheme(m) : (m === "dark" ? "osm-dark" : "osm"); }
  // `.smc` scopes the stylesheet (and its --smc-* tokens); `.smc-gallery` lays the gallery out in flow.
  el.classList.add("smc"); el.classList.add("smc-gallery");
  function render() {
    el.setAttribute("data-smc-mode", mode);
    // Opening on a basemap that lives in "More" expands More so the selected card is visible.
    el.innerHTML = basemapGalleryHtml(catalog, { effective: effective(), auto: auto(), mode, recommended: recommended(),
      moreOpen, themeBasemap: themeId(), idPrefix: p, showFollow: opts.showFollow });
  }
  if (!recommended().includes(effective())) moreOpen = true;
  const tip = () => el.querySelector(".bm-tip");
  const showTip = (i: any) => {
    const t = tip(); if (!t) return;
    t.textContent = i.dataset.tip ?? ""; t.hidden = !t.textContent;
    if (t.hidden || !t.getBoundingClientRect || !i.getBoundingClientRect) return;
    const r = i.getBoundingClientRect(), b = t.getBoundingClientRect();
    const vw = globalThis.innerWidth ?? 1200, vh = globalThis.innerHeight ?? 800;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), vw - b.width - 8);
    let top = r.bottom + 6; if (top + b.height > vh - 8) top = r.top - b.height - 6;
    t.style.left = `${Math.round(left)}px`; t.style.top = `${Math.round(top)}px`;
  };
  const hideTip = () => { const t = tip(); if (t) t.hidden = true; };
  const L: [string, any][] = [];
  const on = (t: string, fn: any) => { el.addEventListener(t, fn); L.push([t, fn]); };
  on("click", (e: any) => {
    const M = e.target.closest?.("[data-bmmore]");
    if (M) {
      moreOpen = !moreOpen;
      M.setAttribute("aria-expanded", String(moreOpen));
      const body = el.querySelector(`#${p}-more-body`); if (body) body.hidden = !moreOpen;
      hideTip(); return;
    }
    const B = e.target.closest?.("[data-base]");
    if (!B) return;
    const id = B.dataset.base;
    if (id === "__auto") {
      const next = !auto();
      if (!next) localPick = effective();
      localAuto = next;
      opts.onFollowChange?.(next, themeId());
    } else {
      localAuto = false; localPick = id;
      opts.onPick?.(id);
    }
    hideTip(); render();
    el.querySelector(`[data-base="${id}"]`)?.focus?.();
  });
  const tipOn = (e: any) => { const i = e.target.closest?.(".bm-info"); if (i) showTip(i); };
  const tipOff = (e: any) => { const i = e.target.closest?.(".bm-info"); if (i && !(e.relatedTarget && i.contains?.(e.relatedTarget))) hideTip(); };
  on("mouseover", tipOn); on("focusin", tipOn); on("mouseout", tipOff); on("focusout", tipOff);
  render();
  return {
    element,
    update(next) { if (next?.mode) mode = next.mode === "dark" ? "dark" : "light"; render(); },
    destroy() { for (const [t, fn] of L) el.removeEventListener(t, fn); L.length = 0; el.innerHTML = ""; el.classList.remove("smc-gallery"); el.classList.remove("smc"); el.removeAttribute?.("data-smc-mode"); },
  };
}

let drawerN = 0;
export function mountMapControls(mapArg: MapLike | null | undefined, opts: MapControlsOptions = {} as MapControlsOptions): MapControls {
  const doc: any = globalThis.document;
  const { catalog, container } = opts as { catalog: BasemapCatalog; container: any };
  if (!catalog?.basemapById) throw new Error("mountMapControls: `catalog` (basemaps.mjs) is required");
  if (!container) throw new Error("mountMapControls: `container` is required");
  let map: any = mapArg ?? null;
  const getMap = () => map;
  /** The secondary maps (opts.maps / setSecondaryMaps). */
  let mirrors: any[] = [];
  /** Every map the controls write to: the primary first, then the secondaries. */
  const allMaps = (): any[] => [map, ...mirrors].filter((m, i, a) => m && a.indexOf(m) === i);
  const labels = { fit: "Home (F)", ...(opts.labels ?? {}) };
  const doFetch = (...a: any[]) => ((opts.fetch ?? globalThis.fetch) as any)(...a);

  // ── elements ─────────────────────────────────────────────────────────────
  const created: any[] = [];
  const make = (cls: string) => { const el = doc.createElement("div"); container.appendChild(el); created.push(el); return el; };
  const ctl: any = opts.cluster ?? make("smc-ctl");
  // `drawer` is an existing element (1.0.1) or the size options { element?, width?, minWidth?, … }
  const drawerArg: any = opts.drawer ?? null;
  const drawerIsEl = !!drawerArg && (typeof drawerArg.appendChild === "function" || drawerArg.nodeType === 1);
  const DW: DrawerOptions = drawerIsEl ? {} : (drawerArg ?? {});
  const drawerEl: any = drawerIsEl ? drawerArg : DW.element ?? null;
  const drawer: any = drawerEl ?? make("smc-drawer");
  container.classList.add("smc");
  ctl.classList.add("smc-ctl");
  drawer.classList.add("smc-drawer");
  if (!drawerEl) drawer.hidden = true;
  const drawerIdSet = !drawer.getAttribute?.("id");
  if (drawerIdSet) drawer.setAttribute("id", `smc-drawer-${++drawerN}`);
  // the optional tools — inert (no buttons, listeners, sources or requests) unless opts.tools enables them
  const T = createTools({ getMap: () => map, container, config: opts.tools, esc, icons: ICONS, doc,
    closeDrawer: () => closeAll(), onError: (m) => opts.onError?.(m), interaction: opts.interaction,
    fetch: (...a) => doFetch(...a), download: opts.download, geolocation: opts.geolocation,
    isSecureContext: opts.isSecureContext, title: opts.title });
  T.attach(ctl);
  // the optional scale bar — no element, no listeners unless opts.scale enables it
  const scaleCfg = scaleOptions(opts.scale);
  const S: ScaleBarHandle | null = scaleCfg ? createScaleBar({ doc, container, map, options: scaleCfg }) : null;

  // ── state ────────────────────────────────────────────────────────────────
  const state: MapControlsState = { mode: opts.theme?.mode === "dark" ? "dark" : "light", autoBasemap: true, basemap: null, moreOpen: false };
  if (opts.initialBasemap && opts.initialBasemap !== "auto") {
    const id = catalog.resolveBasemapId ? catalog.resolveBasemapId(opts.initialBasemap) : opts.initialBasemap;
    if (id) { state.autoBasemap = false; state.basemap = id; }
  }
  container.setAttribute("data-smc-mode", state.mode);
  // MapLibre popups: above the drawer always; themed cards unless the app opts out (popupStyles:false)
  ensureMapControlsPopupStyles(doc);
  if (opts.popupStyles !== false) container.setAttribute("data-smc-popups", "");
  /* The layer list's own state. Expanded state is per layer id and survives every re-render:
       expanded — the inline legend (the chevron)      acts — the inline actions section (the "…")
       info     — "Layer information"                  tech — its "Technical details" disclosure
       allFields — "show all" on a long field list, per `${layerId}|${service index}`
     meta is the per-SESSION service-metadata cache, keyed by URL: { state: loading|ok|err, json?, err? }. */
  const LL: LayerListState = { defaults: [], order: [], opacity: {}, expanded: new Set(), acts: new Set(), info: new Set(),
               tech: new Set(), allFields: new Set(), meta: new Map(), drag: null };
  const descriptors = (): LayerDescriptor[] => (opts.layers ? opts.layers() ?? [] : []);
  const ext = opts.layerState ?? null;
  {
    const ids = opts.defaultOrder ?? descriptors().map((d) => d.id);
    LL.defaults = [...ids]; LL.order = [...ids];
  }
  let destroyed = false;

  // ── basemaps ─────────────────────────────────────────────────────────────
  // the theme pair: opts.themeBasemaps, else the catalog's own, else OpenStreetMap / OpenStreetMap Dark
  const pairOf = opts.themeBasemaps ?? catalog.THEME_BASEMAP ?? null;
  const themeBasemap = (m: string): string => (pairOf ? (m === "dark" ? pairOf.dark : pairOf.light)
    : catalog.basemapForTheme ? catalog.basemapForTheme(m) : (m === "dark" ? "osm-dark" : "osm"));
  const host = opts.basemapHost;
  /** What the host says is drawn, alias-resolved; undefined when there is no host (or it does not say). */
  const hostCurrent = (): string | undefined => {
    if (!host?.current) return undefined;
    const raw = host.current();
    if (raw == null) return undefined;
    return (catalog.resolveBasemapId ? catalog.resolveBasemapId(raw) : raw) ?? raw;
  };
  const effectiveBasemap = (): string => hostCurrent() ??
    (state.autoBasemap ? themeBasemap(state.mode) : (state.basemap ?? themeBasemap(state.mode)));
  const styleFor = (id: string | null | undefined) => basemapStyle(catalog, id, { glyphs: opts.glyphs });
  const restyle = (id: string, reason: "pick" | "follow" | "theme" = "pick") => {
    // { diff: false }: a FULL style swap. MapLibre's default diff can keep the old style's glyphs /
    // sprite URLs across a GL → GL swap (labels then request fonts from the wrong host and 404) and
    // may skip style.load; a full swap always rebuilds and always fires it. One setStyle per map.
    if (host) host.apply(id, reason);
    else {
      for (const m of allMaps()) m.setStyle?.(styleFor(id), { diff: false });
      if (fbNote && reason === "pick") fbNote = null;      // a new pick: the note has said its piece
      watchBasemap(map, id);
    }
    opts.onBasemapChange?.(id);
  };

  // ── the GL basemap fallback: a style that never loads becomes the theme's raster, ONCE ──
  const fbOn = opts.basemapFallback !== false && !host;
  const fbMs = Number.isFinite(opts.basemapTimeoutMs as number) ? Math.max(0, opts.basemapTimeoutMs as number) : 15000;
  let fellBack: BasemapFallbackEvent | null = null;
  /** The gallery footer note (cleared by the next explicit pick). */
  let fbNote: BasemapFallbackEvent | null = null;
  let fbDisarm: (() => void) | null = null;
  /** Has `m` parsed a style? MapLibre's own flag where it has one, else isStyleLoaded(). */
  const styleParsed = (m: any): boolean => {
    try { if (m?.style && typeof m.style._loaded === "boolean") return m.style._loaded; return !!m?.isStyleLoaded?.(); } catch { return false; }
  };
  /** Watch the primary map's GL style `id` until it loads; an error first (or the timeout) falls back. */
  function watchBasemap(m: any, id: string) {
    fbDisarm?.(); fbDisarm = null;
    if (!fbOn || fellBack || destroyed || !m?.on || typeof styleFor(id) !== "string") return;
    let timer: any = null;
    const ok = () => disarm();
    const onErr = (e: any) => { disarm(); fallBack(id, "error", String(e?.error?.message ?? e?.message ?? "style error")); };
    const disarm = () => {
      for (const t of ["style.load", "styledata", "load"]) m.off?.(t, ok);
      m.off?.("error", onErr);
      if (timer) clearTimeout(timer);
      timer = null; if (fbDisarm === disarm) fbDisarm = null;
    };
    for (const t of ["style.load", "styledata", "load"]) m.on(t, ok);
    m.on("error", onErr);
    // the timeout only for a real map (one that can say whether its style loaded)
    if (fbMs > 0 && typeof m.isStyleLoaded === "function") {
      timer = setTimeout(() => { const loaded = styleParsed(m); disarm(); if (!loaded) fallBack(id, "timeout", `no style after ${fbMs} ms`); }, fbMs);
      timer?.unref?.();                                   // never keeps a node test process alive
    }
    fbDisarm = disarm;
  }
  function fallBack(from: string, reason: "error" | "timeout", message: string) {
    if (fellBack || destroyed) return;
    const to = state.mode === "dark" ? "osm-dark" : "osm";
    if (to === from || !catalog.basemapById(to) || catalog.basemapById(to)?.id !== to) return;
    fellBack = { from, to, reason, message };
    fbNote = fellBack;
    for (const m of allMaps()) m.setStyle?.(styleFor(to), { diff: false });
    opts.onError?.(`basemap "${from}" did not load (${reason}: ${message}) — showing "${to}" instead`);
    try { opts.onBasemapFallback?.({ ...fellBack }); } catch (e: any) { opts.onError?.(`onBasemapFallback threw: ${e?.message ?? e}`); }
    if (getOpenDrawer() === "base") renderDrawer();
  }
  /** themeBasemaps.follow === false: the theme never swaps the basemap (the chrome still re-themes). */
  const followsTheme = () => (pairOf as ThemeBasemapPair | null)?.follow !== false;
  /** The recommended ids, in order, that really exist in the catalog — the universal 8, the app's
   *  extras, then any member of the theme pair not already among them. */
  const recommendedIds = (): string[] =>
    recommendedPlusPair(catalog, opts.recommendedExtras, [themeBasemap("light"), themeBasemap("dark")]);
  function setTheme(m: string) {
    const mode = m === "dark" ? "dark" : "light";
    const changed = mode !== state.mode;
    state.mode = mode;
    container.setAttribute("data-smc-mode", mode);
    if (!changed || (!allMaps().length && !host) || !followsTheme()) return;
    // The AUTHORED basemap stands until the mode actually changes; an explicit pick outranks it.
    if (state.autoBasemap) restyle(themeBasemap(mode), "theme");
    // An explicit pick that HAS a pair in the new mode swaps to it and stays an explicit pick;
    // one with no pair (or a pair in the other mode) is left exactly where the reader put it.
    else {
      const curId = hostCurrent() ?? state.basemap;
      const cur = curId ? catalog.BASEMAPS.find((b) => b.id === curId) : undefined;
      const pair = cur?.pair && catalog.BASEMAPS.find((b) => b.id === cur.pair);
      if (pair && pair.mode === mode) { state.basemap = pair.id; restyle(pair.id, "theme"); }
    }
  }
  function setBasemap(id: string | null | undefined) {
    if (id == null || id === "auto") {
      if (!state.autoBasemap) { state.autoBasemap = true; state.basemap = null; restyle(themeBasemap(state.mode), "follow"); }
    } else {
      const rid = (catalog.resolveBasemapId ? catalog.resolveBasemapId(id) : id) ?? id;
      const same = !state.autoBasemap && state.basemap === rid;
      state.autoBasemap = false; state.basemap = rid;
      if (!same) restyle(rid, "pick");
    }
    refresh();
  }

  // ── the cluster ──────────────────────────────────────────────────────────
  const FS = {
    target: () => opts.fullscreenTarget ?? container,
    supported: () => !!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled),
    element: () => doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null,
    exitedAt: 0,
  };
  const isFullscreen = () => !!FS.element() && FS.element() === FS.target();
  const btn = (act: string, title: string, icon: string, extra = "") => `<button data-act="${act}" title="${esc(title)}" aria-label="${esc(title.replace(/ \([A-Z]\)$/, ""))}"${extra}>${icon}</button>`;
  function fullscreenButtonHtml() {
    if (!FS.supported()) return "";
    const on = isFullscreen(), t = on ? "Exit full screen" : "Full screen";
    return `<button data-act="fullscreen" title="${t}" aria-label="${t}" aria-pressed="${on}">${on ? ICONS.fsExit : ICONS.fsEnter}</button>`;
  }
  function renderChrome() {
    ctl.innerHTML =
      btn("zin", "Zoom in", ICONS.zoomIn) +
      btn("zout", "Zoom out", ICONS.zoomOut) +
      (opts.onFit ? `<button data-act="fit" title="${esc(labels.fit)}" aria-label="Fit">${ICONS.home}</button>` : "") +
      (opts.layers ? btn("layers", "Layers (L)", ICONS.layers, ` aria-expanded="false"`) : "") +
      btn("base", "Basemap (B)", ICONS.basemap, ` aria-expanded="false"`) +
      (opts.onToggleLegend ? btn("legend", "Legend (G)", ICONS.legend, ` aria-expanded="${!!opts.legendOpen?.()}"`) : "") +
      fullscreenButtonHtml() +
      T.buttonsHtml();                       // the optional tools: a second group, after the defaults
    syncChrome();
  }
  function syncChrome() {
    syncDir();
    for (const b of ctl.querySelectorAll("button")) {
      const a = b.dataset.act;
      if (a === "layers" || a === "base") b.setAttribute("aria-expanded", String(!drawer.hidden && drawer.dataset.which === a));
      if (a === "legend") b.setAttribute("aria-expanded", String(!!opts.legendOpen?.()));
    }
    placeGrip();
  }
  // ── direction: RTL mirrors the cluster, the drawer, its grip and the chevrons (CSS keys off
  //    [dir=rtl] ancestors and data-smc-dir, which this keeps current) ──
  const isRtl = (): boolean => {
    if (opts.dir === "rtl") return true;
    if (opts.dir === "ltr") return false;
    const attr = container.closest?.("[dir]")?.getAttribute?.("dir");
    if (attr === "rtl" || attr === "ltr") return attr === "rtl";
    try { return globalThis.getComputedStyle?.(container)?.direction === "rtl"; } catch { return false; }
  };
  function syncDir() { const d = isRtl() ? "rtl" : "ltr"; if (container.getAttribute("data-smc-dir") !== d) container.setAttribute("data-smc-dir", d); }
  function toggleLegend() { if (!opts.onToggleLegend) return; opts.onToggleLegend(); syncChrome(); }
  function toggleFullscreen() {
    const el = FS.target();
    if (!el || !FS.supported()) return;
    try {
      const p = isFullscreen()
        ? (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc)
        : (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el);
      p?.catch?.((e) => opts.onError?.(`full screen unavailable: ${e.message}`));
    } catch (e: any) { opts.onError?.(`full screen unavailable: ${e.message}`); }
  }
  /** One handler for the API's own event — so Esc, F11 or the button all land in the same state. */
  function onFullscreenChange() {
    if (!isFullscreen()) FS.exitedAt = Date.now();
    const b = ctl.querySelector('[data-act="fullscreen"]');
    if (b) {
      const on = isFullscreen(), t = on ? "Exit full screen" : "Full screen";
      b.setAttribute("aria-pressed", String(on)); b.setAttribute("title", t); b.setAttribute("aria-label", t);
      b.innerHTML = on ? ICONS.fsExit : ICONS.fsEnter;
    }
    map?.resize();
  }

  // ── the drawer ───────────────────────────────────────────────────────────
  function openDrawer(which) {
    if (drawer.dataset.which === which && !drawer.hidden) { drawer.hidden = true; drawer.dataset.which = ""; }
    else {
      // Opening the gallery on a basemap that lives in "More" expands More so the selected card is
      // visible. Only on OPEN — a reader who collapses More afterwards is not overruled.
      if (which === "base" && !recommendedIds().includes(effectiveBasemap())) state.moreOpen = true;
      T.close({ focus: false });             // one panel at a time: a drawer ends the active tool
      drawer.dataset.which = which; drawer.hidden = false; applyDrawerWidth(); renderDrawer();
    }
    syncChrome();
  }
  function closeAll() {
    if (drawer.hidden) return false;
    drawer.hidden = true; drawer.dataset.which = ""; syncChrome();
    return true;
  }
  const getOpenDrawer = (): "layers" | "base" | null =>
    (!drawer.hidden && (drawer.dataset.which === "layers" || drawer.dataset.which === "base") ? drawer.dataset.which : null);

  // ── the drawer's resize grip — resizable by default; the dragged width is SESSION state ──
  const resizable = DW.resizable !== false;
  const minW = Math.max(120, Number(DW.minWidth) || 260);
  const maxW = Math.max(minW, Number(DW.maxWidth) || 520);
  /** The session width per drawer kind (what the reader dragged to); undefined = the authored width. */
  const sessionW: Record<string, number> = {};
  /** The widest the drawer may be inside the container (the cluster column + gutters stay clear). */
  const roomW = (): number => {
    const w = container.getBoundingClientRect?.().width ?? 0;
    return w > 0 ? Math.max(minW, w - 56) : maxW;
  };
  const clampW = (w: number) => Math.round(Math.max(minW, Math.min(maxW, roomW(), w)));
  /** The widest the grip may take the drawer right now: min(maxWidth, container width − 56), ≥ minWidth. */
  const maxNow = (): number => Math.round(Math.max(minW, Math.min(maxW, roomW())));
  /** "layers" | "base" for a public `which` ("basemap" is an alias); null for anything else. */
  const kindOf = (w: unknown): "layers" | "base" | null => (w === "layers" ? "layers" : w === "base" || w === "basemap" ? "base" : null);
  /** setDrawerWidth() with no drawer open and no `which`: the width the NEXT drawer opens at. */
  let pendingW: number | null = null;
  function applyDrawerWidth() {
    const which = drawer.dataset.which;
    const k = kindOf(which);
    if (pendingW != null && k) { sessionW[k] = pendingW; pendingW = null; opts.onDrawerResize?.(sessionW[k], k); }
    const w = sessionW[which] ?? (Number(DW.width) > 0 ? clampW(Number(DW.width)) : null);
    if (drawer.style) drawer.style.width = w ? `${w}px` : "";
  }
  function drawerWidth(which?: DrawerWhich): number {
    const open = getOpenDrawer();
    const k = which == null ? open : kindOf(which);
    if (!k) return pendingW ?? 0;
    if (sessionW[k]) return sessionW[k];
    const r = open === k ? drawer.getBoundingClientRect?.() : null;
    return r?.width ? Math.round(r.width) : (Number(DW.width) > 0 ? clampW(Number(DW.width)) : 0);
  }
  function setDrawerWidth(px: number, which?: DrawerWhich): number {
    const w = clampW(Number(px) || minW);
    const open = getOpenDrawer();
    const k = kindOf(which) ?? open;
    if (!k) { pendingW = w; return w; }                    // nothing open, nothing named: the next drawer
    sessionW[k] = w;
    if (open === k) { if (drawer.style) drawer.style.width = `${w}px`; placeGrip(); }
    opts.onDrawerResize?.(w, k);
    return w;
  }
  let grip: any = null;
  if (resizable) {
    grip = doc.createElement("div");
    grip.setAttribute("class", "smc-dgrip");
    grip.setAttribute("role", "separator");
    grip.setAttribute("tabindex", "0");
    grip.setAttribute("aria-orientation", "vertical");
    grip.setAttribute("aria-label", "Resize panel width");
    grip.setAttribute("aria-controls", drawer.getAttribute("id"));
    grip.setAttribute("aria-valuemin", String(minW));
    grip.setAttribute("aria-valuemax", String(maxW));
    grip.hidden = true;
    container.appendChild(grip); created.push(grip);
  }
  /** Lay the grip over the drawer's OUTER edge (left in LTR, right in RTL) and sync its ARIA values. */
  function placeGrip() {
    if (!grip) return;
    const open = !!getOpenDrawer();
    grip.hidden = !open;
    if (!open) return;
    const w = drawerWidth();
    // the REAL clamp: the container may allow less than maxWidth (re-read on every resize)
    const mx = String(maxNow());
    if (grip.getAttribute("aria-valuemax") !== mx) grip.setAttribute("aria-valuemax", mx);
    if (w) grip.setAttribute("aria-valuenow", String(w));
    grip.setAttribute("aria-valuetext", `${w || "auto"} pixels wide`);
    const s = grip.style; if (!s) return;
    const top = drawer.offsetTop ?? 0, h = drawer.offsetHeight ?? 0, left = drawer.offsetLeft ?? 0, dw = drawer.offsetWidth ?? 0;
    s.top = `${top}px`; s.height = h ? `${h}px` : "";
    s.left = `${Math.round((isRtl() ? left + dw : left) - 4)}px`;
  }
  /** + = wider. The grip is on the outer edge, so in LTR dragging LEFT widens, in RTL dragging RIGHT. */
  const widen = (dx: number) => (isRtl() ? dx : -dx);
  /** The HTML last written into the layer list (refreshLayers() skips a re-render that changes nothing). */
  let lastLayersHtml: string | null = null;
  function layersDrawerHtml(): string {
    const ps = opts.panelSettings?.html?.() ?? "";
    return layerListHtml(descriptors(), { basemapTitle: catalog.basemapById(effectiveBasemap())?.title ?? "None" }) +
      (ps ? `<div class="ll-set"><h3>Panel settings</h3>${ps}</div>` : "");
  }
  function renderDrawer() {
    if (drawer.dataset.which === "layers") {
      drawer.innerHTML = lastLayersHtml = layersDrawerHtml();
    } else {
      lastLayersHtml = null;
      drawer.innerHTML = basemapGallery() + (fbNote ? `<p class="bm-note" role="status">` +
        `Couldn't load ${esc(catalog.basemapById(fbNote.from)?.title ?? fbNote.from)} — showing ${esc(catalog.basemapById(fbNote.to)?.title ?? fbNote.to)} instead.</p>` : "");
      drawer.querySelector('.bm-pick[aria-checked="true"]')?.scrollIntoView?.({ block: "nearest" });
    }
    placeGrip();
  }
  /** Re-render whichever drawer is open; the layer list keeps keyboard focus where it was. */
  function refresh() { if (!drawer.hidden) drawer.dataset.which === "layers" ? refreshLayers() : renderDrawer(); }

  /** The gallery: a Follow-the-theme switch, a "Recommended" section (always open) and a
   *  collapsible "More basemaps" holding every OTHER basemap grouped by `group` in catalog order —
   *  no basemap appears twice. The card is a radio; the info icon is its SIBLING, so hovering or
   *  clicking it never selects. Collapsed More cards stay in the DOM, so the radio set is whole. */
  function basemapGallery() {
    return basemapGalleryHtml(catalog, { effective: effectiveBasemap(), auto: state.autoBasemap, mode: state.mode,
      recommended: recommendedIds(), moreOpen: state.moreOpen, themeBasemap: themeBasemap(state.mode) });
  }
  function showTip(el) {
    const tip = drawer.querySelector(".bm-tip"); if (!tip) return;
    tip.textContent = el.dataset.tip ?? "";
    tip.hidden = !tip.textContent;
    if (tip.hidden || !tip.getBoundingClientRect || !el.getBoundingClientRect) return;
    // position:fixed escapes the drawer's overflow clip; keep it inside the viewport.
    const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
    const vw = globalThis.innerWidth ?? 1200, vh = globalThis.innerHeight ?? 800;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), vw - t.width - 8);
    let top = r.bottom + 6;
    if (top + t.height > vh - 8) top = r.top - t.height - 6;
    tip.style.left = `${Math.round(left)}px`; tip.style.top = `${Math.round(top)}px`;
  }
  function hideTip() { const tip = drawer.querySelector(".bm-tip"); if (tip) tip.hidden = true; }

  // ── the layer list ───────────────────────────────────────────────────────
  /** Descriptors in list order, top first. An id the list has never seen joins at the bottom. */
  function llOrdered(descs) {
    if (ext) LL.order = [...(ext.order() ?? [])];               // the owner's order is the truth
    for (const d of descs) if (!LL.order.includes(d.id)) LL.order.push(d.id);
    return [...descs].sort((a, b) => LL.order.indexOf(a.id) - LL.order.indexOf(b.id));
  }
  /** Move a PRESENT layer to `index` (top = 0). Absent layers keep their slots in the full order. */
  function llMoveTo(descs, id, index) {
    const ids = llOrdered(descs).map((d) => d.id);
    const from = ids.indexOf(id);
    const to = Math.max(0, Math.min(ids.length - 1, index));
    if (from < 0 || to === from) return false;
    const next = ids.filter((x) => x !== id);
    next.splice(to, 0, id);
    const slots = LL.order.map((x, i) => (ids.includes(x) ? i : -1)).filter((i) => i >= 0);
    slots.forEach((slot, k) => { LL.order[slot] = next[k]; });
    ext?.setOrder([...LL.order]);
    return true;
  }
  const llMove = (descs, id, delta) => llMoveTo(descs, id, llOrdered(descs).findIndex((d) => d.id === id) + delta);
  const llOpacity = (id) => (ext ? ext.opacity(id) ?? 1 : LL.opacity[id] ?? 1);
  const llSetOpacity = (id, m) => {
    const v = Math.max(0, Math.min(1, Number(m) || 0));
    if (ext) ext.setOpacity(id, v); else LL.opacity[id] = v;
  };
  /** Restore ONE layer's default opacity and its default place relative to the others. */
  function llReset(id) {
    if (ext) { llOrdered(descriptors()); ext.resetOpacity ? ext.resetOpacity(id) : ext.setOpacity(id, 1); }
    delete LL.opacity[id];
    LL.order = LL.order.filter((x) => x !== id);
    // just below the lowest layer that sits ABOVE it by default (or on top, if none does)
    const above = LL.defaults.slice(0, Math.max(0, LL.defaults.indexOf(id)));
    const at = Math.max(-1, ...above.map((x) => LL.order.indexOf(x)));
    LL.order.splice(at + 1, 0, id);
    ext?.setOrder([...LL.order]);
  }
  /** Write order, visibility and transparency to the map — with no map argument, to the primary AND
   *  every secondary map. Layers not yet on a map are skipped. */
  function applyLayerState(m?: any, descs: LayerDescriptor[] = descriptors()) {
    if (m === undefined) { for (const x of allMaps()) applyLayerStateTo(x, descs); return; }
    applyLayerStateTo(m, descs);
  }
  function applyLayerStateTo(m: any, descs: LayerDescriptor[]) {
    if (!m?.getLayer) return;
    // An external owner (opts.layerState) drives order / visibility / transparency on the map itself.
    if (ext) { raiseOverlays(m); return; }
    for (const d of llOrdered(descs).reverse()) {               // bottom → top
      for (const s of d.sublayers ?? []) {
        if (!m.getLayer(s.id)) continue;
        m.moveLayer(s.id);                                       // no beforeId: onto the top, in sequence
        const vis = d.visible ? "visible" : "none";
        if ((m.getLayoutProperty(s.id, "visibility") ?? "visible") !== vis) m.setLayoutProperty(s.id, "visibility", vis);
        for (const [prop, base] of Object.entries(s.opacity ?? {})) {
          if (base == null) continue;
          // NEVER setPaintProperty(…, undefined): an unset line-opacity left a MapLibre 4.7 line layer
          // drawing nothing. At 0 % the AUTHORED value (number or expression) is written back as-is.
          const v = scaleOpacity(base, llOpacity(d.id));
          let cur: unknown;
          try { cur = m.getPaintProperty?.(s.id, prop); } catch { cur = undefined; }
          if (!sameValue(cur, v)) m.setPaintProperty(s.id, prop, v);
        }
      }
    }
    raiseOverlays(m);                         // the app's topLayers, then the tools' graphics, on top
  }
  /** Tell opts.onLayerStateChange what the list holds now. */
  function emitLayerState() {
    if (!opts.onLayerStateChange) return;
    const descs = llOrdered(descriptors());
    const opacity: Record<string, number> = {}, visible: Record<string, boolean> = {};
    for (const d of descs) { opacity[d.id] = llOpacity(d.id); visible[d.id] = !!d.visible; }
    try { opts.onLayerStateChange({ order: descs.map((d) => d.id), opacity, visible }); }
    catch (e: any) { opts.onError?.(`onLayerStateChange threw: ${e?.message ?? e}`); }
  }
  /** opts.topLayers (bottom → top), re-read on every pass. */
  const topLayerIds = (): string[] => {
    const t = opts.topLayers;
    const ids = typeof t === "function" ? t() : t;
    return Array.isArray(ids) ? ids : [];
  };
  /** The app's topLayers above every other layer, the tools' graphics above those — idempotently. */
  function raiseOverlays(m: any = map) {
    if (!m?.getLayer) return;
    keepOnTop(m, m === map ? [...topLayerIds(), ...T.layerIds()] : topLayerIds());
  }
  function layerListHtml(descs: LayerDescriptor[], { basemapTitle = "" } = {}) {
    const list = llOrdered(descs);
    return `<h3 id="ll-h">Layers</h3><ul class="ll-list" aria-labelledby="ll-h">` +
      list.map((d, i) => llRowHtml(d, i, list.length)).join("") +
      (basemapTitle ? `<li class="ll-base-row"><button class="ll-base" data-ll-act="basemap" title="Change the basemap (B)">` +
        `${ICONS.basemap}<span class="t">Basemap: ${esc(basemapTitle)}<span class="sub">always drawn underneath</span></span>${ICONS.chevron}</button></li>` : "") +
      `</ul>`;
  }
  function llRowHtml(d, i, n) {
    const id = esc(d.id), t = esc(d.title), open = LL.expanded.has(d.id), acts = LL.acts.has(d.id);
    return `<li class="ll-row${d.visible ? "" : " off"}" data-ll-id="${id}">` +
      `<div class="ll-main">` +
      `<span class="ll-grip" data-ll-act="grip" title="Drag to reorder">${ICONS.grip}</span>` +
      `<button class="ll-ib" data-ll-act="expand" aria-expanded="${open}" aria-controls="ll-leg-${id}" aria-label="Legend: ${t}" title="${open ? "Hide" : "Show"} legend">${ICONS.chevron}</button>` +
      `<span class="ll-swatch" aria-hidden="true">${d.swatch ?? ""}</span>` +
      `<span class="ll-name"><span class="t" title="${t}">${t}</span>${d.sub ? `<span class="sub">${esc(d.sub)}</span>` : ""}</span>` +
      `<button class="ll-ib" data-ll-act="eye" aria-pressed="${!!d.visible}" aria-label="Show ${t}" title="${d.visible ? "Hide layer" : "Show layer"}">${d.visible ? ICONS.eye : ICONS.eyeOff}</button>` +
      `<button class="ll-ib" data-ll-act="acts" aria-expanded="${acts}" aria-controls="ll-acts-${id}" aria-label="Options: ${t}" title="${acts ? "Hide" : "Show"} options">${ICONS.more}</button>` +
      `</div>` +
      llActsHtml(d, i, n, acts) +
      `<div class="ll-legend" id="ll-leg-${id}"${open ? "" : " hidden"}>${d.legend ?? ""}</div>` +
      `</li>`;
  }
  /** The "…" section: plain buttons in tab order, the transparency slider always shown, info inline. */
  function llActsHtml(d, i, n, acts) {
    const id = esc(d.id), pct = Math.round((1 - llOpacity(d.id)) * 100), info = LL.info.has(d.id), leg = LL.expanded.has(d.id);
    const tool = (cmd: string, icon: string, label: string, extra = "") =>
      `<button class="ll-tool" data-ll-cmd="${cmd}"${extra}>${icon}<span>${label}</span></button>`;
    return `<div class="ll-acts" id="ll-acts-${id}" role="group" aria-label="Options: ${esc(d.title)}"${acts ? "" : " hidden"}>` +
      `<div class="ll-tools">` +
      // two columns: Zoom / Info, Move up / Move down, Show legend / Reset
      tool("zoom", ICONS.zoomTo, "Zoom to layer", d.zoomTo ? "" : " disabled") +
      tool("info", ICONS.info, "Layer information", ` aria-expanded="${info}" aria-controls="ll-info-${id}"`) +
      tool("up", ICONS.up, "Move up", i === 0 ? " disabled" : "") +
      tool("down", ICONS.down, "Move down", i === n - 1 ? " disabled" : "") +
      // the same legend the chevron opens: one state (LL.expanded), so the two can never disagree
      tool("legend", ICONS.legendList, leg ? "Hide legend" : "Show legend", ` aria-expanded="${leg}" aria-controls="ll-leg-${id}"`) +
      tool("reset", ICONS.reset, "Reset") +
      `</div>` +
      `<div class="ll-op"><label for="ll-op-${id}">Transparency <b data-ll-pct>${pct}%</b></label>` +
      `<input type="range" id="ll-op-${id}" min="0" max="100" step="1" value="${pct}" data-ll-opacity="${id}" aria-valuetext="${pct}% transparent"></div>` +
      llInfoHtml(d, info) +
      `</div>`;
  }
  /** "Layer information": the plain section, always; "Technical details" collapsed beneath it. */
  function llInfoHtml(d, open) {
    const id = esc(d.id), a = d.about ?? {}, tech = LL.tech.has(d.id);
    const hasTech = !!(d.services?.length || d.technical);
    return `<div class="ll-info" id="ll-info-${id}"${open ? "" : " hidden"}>` +
      `<dl class="ll-about">` +
      LL_ABOUT.filter(([k]) => a[k]).map(([k, label]) => `<div data-ll-about="${k}"><dt>${label}</dt><dd>${esc(a[k])}</dd></div>`).join("") +
      `</dl>` +
      (hasTech
        ? `<button class="ll-techbtn" data-ll-cmd="tech" aria-expanded="${tech}" aria-controls="ll-tech-${id}">${ICONS.chevron}<span>Technical details</span></button>` +
          // built only while actually on screen, so nothing is fetched for a section nobody can see
          `<div class="ll-tech" id="ll-tech-${id}"${tech ? "" : " hidden"}>${tech && open && LL.acts.has(d.id) ? llTechHtml(d) : ""}</div>`
        : "") +
      `</div>`;
  }
  /** One block per service (or per local source). Only rendered while the disclosure is open. */
  function llTechHtml(d) {
    if (d.technical) return d.technical().map((b, i) => llBlockHtml(d, b, i)).join("");
    llLoadMeta(d);              // a no-op for every URL already cached (or in flight) this session
    return (d.services ?? []).map((s, i) => {
      const m = LL.meta.get(s.url), head = `<h4>${esc(s.title ?? "Service")}</h4>`;
      if (!m || m.state === "loading")
        return `<section class="ll-svc" data-ll-svc-block="${i}" aria-busy="true">${head}<div class="ll-wait" role="status">Loading…</div></section>`;
      if (m.state === "err")
        return `<section class="ll-svc" data-ll-svc-block="${i}">${head}<div class="ll-err" role="status"><span>Couldn't load technical details.</span>` +
          `<button class="ll-mini" data-ll-cmd="tech-retry" data-ll-svc="${i}">Retry</button></div></section>`;
      return llBlockHtml(d, { ...serviceBlock(m.json), title: s.title, link: s.url, filter: s.filter }, i);
    }).join("");
  }
  function llBlockHtml(d, b, i) {
    const kv = (k: string, v: string) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`;
    const all = LL.allFields.has(`${d.id}|${i}`), fields = b.fields ?? [];
    const shown = all ? fields : fields.slice(0, LL_FIELDS_SHOWN);
    const safeLink: string | null = /^https?:\/\//i.test(b.link ?? "") ? b.link : null;
    return `<section class="ll-svc" data-ll-svc-block="${i}"><h4>${esc(b.title ?? "Source")}</h4><dl class="ll-kv">` +
      (safeLink ? kv("Service", `<a class="ll-link" href="${esc(safeLink)}" target="_blank" rel="noopener noreferrer" data-ll-link="${i}">${esc(safeLink)}</a>`)
                : b.source ? kv("Source", esc(b.source)) : "") +
      (b.filter != null ? kv("Filter applied", `<code>${esc(b.filter)}</code>${String(b.filter).trim() === "1=1" ? " — none (every feature)" : ""}`)
        : safeLink ? kv("Filter applied", "None — the whole service is drawn") : "") +
      (b.rows ?? []).map(([k, v]) => kv(k, esc(v))).join("") +
      kv(`Fields (${fields.length})`, fields.length
        ? `<ul class="ll-fields">${shown.map(([n, al]) => `<li><code>${esc(n)}</code>${al && al !== n ? ` <span class="al">→ ${esc(al)}</span>` : ""}</li>`).join("")}</ul>` +
          (fields.length > LL_FIELDS_SHOWN ? `<button class="ll-mini" data-ll-cmd="fields" data-ll-svc="${i}" aria-expanded="${all}">${all ? "Show fewer" : `Show all ${fields.length}`}</button>` : "")
        : (b.noFields ?? "None")) +
      `</dl></section>`;
  }
  /** Fetch each service's metadata ONCE per session. A failure is cached as such until Retry. */
  function llLoadMeta(d) {
    for (const s of d.services ?? []) {
      if (!s.url || LL.meta.has(s.url)) continue;
      LL.meta.set(s.url, { state: "loading" });
      // a SIMPLE GET with no custom headers: some ArcGIS hosts 403 any preflight
      (async () => {
        try {
          const r = await doFetch(`${s.url}?f=json`, { signal: AbortSignal.timeout(14000) });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const j = await r.json();
          if (!j || typeof j !== "object" || j.error) throw new Error(j?.error?.message ?? "service error");
          LL.meta.set(s.url, { state: "ok", json: j });
        } catch (e: any) { LL.meta.set(s.url, { state: "err", err: String(e?.message ?? e) }); }
        if (!destroyed) refreshLayers();
      })();
    }
  }
  /** Drag a row by its grip: pointer events, a drop line, and `onDrop(id, index)` on release. */
  function llDragStart(e, grip, onDrop) {
    const row = grip.closest("[data-ll-id]"), list = row?.closest(".ll-list");
    if (!row || !list) return;
    e.preventDefault?.();
    const id = row.dataset.llId;
    const others = () => [...list.querySelectorAll(".ll-row")].filter((r) => r !== row);
    let index = [...list.querySelectorAll(".ll-row")].indexOf(row);
    LL.drag = id; row.classList.add("dragging");
    const move = (ev) => {
      const rest = others();
      index = rest.filter((r) => { const b = r.getBoundingClientRect(); return b.top + b.height / 2 < ev.clientY; }).length;
      rest.forEach((r, k) => {
        r.classList.toggle("drop-before", k === index);
        r.classList.toggle("drop-after", index === rest.length && k === rest.length - 1);
      });
    };
    const up = () => {
      globalThis.removeEventListener("pointermove", move); globalThis.removeEventListener("pointerup", up);
      LL.drag = null; row.classList.remove("dragging");
      onDrop(id, index);
    };
    globalThis.addEventListener("pointermove", move); globalThis.addEventListener("pointerup", up);
  }
  /** Re-render the open layer list in place, keeping keyboard focus where it was. */
  function refreshLayers() {
    if (drawer.hidden || drawer.dataset.which !== "layers" || LL.drag) return;
    // Nothing changed → no re-render: an app that calls this on every idle / styledata must not
    // replace the buttons under the reader's pointer (a click between pointerdown and up is lost).
    const next = layersDrawerHtml();
    if (next === lastLayersHtml && drawer.firstChild) { placeGrip(); return; }
    const a = doc.activeElement, row = a?.closest?.("[data-ll-id]");
    const svc = a?.dataset?.llSvc != null ? `[data-ll-svc="${a.dataset.llSvc}"]` : "";
    const key = row && (a.dataset?.llAct ? `[data-ll-act="${a.dataset.llAct}"]` : a.dataset?.llCmd ? `[data-ll-cmd="${a.dataset.llCmd}"]${svc}` :
      a.dataset?.llLink != null ? `[data-ll-link="${a.dataset.llLink}"]` : a.dataset?.llOpacity ? "[data-ll-opacity]" : null);
    renderDrawer();
    if (key) llFocus(row.dataset.llId, key);
  }
  function llFocus(id, sel) {
    const row = [...drawer.querySelectorAll(".ll-row")].find((r) => r.dataset.llId === id);
    row?.querySelector(sel)?.focus?.();
  }
  /** Collapse a row's actions section and put focus back on its "…". */
  function llCloseActs(id) {
    LL.acts.delete(id);
    renderDrawer();
    llFocus(id, '[data-ll-act="acts"]');
  }
  function llAct(id, act) {
    if (act === "basemap") { openDrawer("base"); return; }
    const d = descriptors().find((x) => x.id === id);
    if (!d) return;
    const flip = (set: Set<string>) => (set.has(id) ? set.delete(id) : set.add(id));
    if (act === "eye") d.setVisible(!d.visible);
    else if (act === "expand") flip(LL.expanded);              // the legend only
    else if (act === "acts") flip(LL.acts);                     // the actions only
    else return;
    applyLayerState();
    if (act === "eye") emitLayerState();
    renderDrawer();
    llFocus(id, `[data-ll-act="${act}"]`);
  }
  function llCommand(id, cmd, svc) {
    const descs = descriptors(), d = descs.find((x) => x.id === id);
    if (!d) return;
    // "Technical details" and its insides change nothing on the map, so no applyLayerState()
    if (cmd === "tech" || cmd === "tech-retry" || cmd === "fields") {
      const k = `${id}|${svc}`;
      if (cmd === "tech") { LL.tech.has(id) ? LL.tech.delete(id) : LL.tech.add(id); if (LL.tech.has(id)) llLoadMeta(d); }
      else if (cmd === "tech-retry") { const u = d.services?.[Number(svc)]?.url; if (u) LL.meta.delete(u); llLoadMeta(d); }
      else LL.allFields.has(k) ? LL.allFields.delete(k) : LL.allFields.add(k);
      renderDrawer();
      // Retry turns into "Loading…": focus goes back to the disclosure that owns it
      llFocus(id, cmd === "fields" ? `[data-ll-cmd="fields"][data-ll-svc="${svc}"]` : '[data-ll-cmd="tech"]');
      return;
    }
    if (cmd === "zoom") d.zoomTo?.();
    else if (cmd === "up") llMove(descs, id, -1);
    else if (cmd === "down") llMove(descs, id, 1);
    else if (cmd === "info") LL.info.has(id) ? LL.info.delete(id) : LL.info.add(id);
    else if (cmd === "legend") LL.expanded.has(id) ? LL.expanded.delete(id) : LL.expanded.add(id);
    else if (cmd === "reset") { llReset(id); if (!d.visible) d.setVisible(true); }
    applyLayerState();
    if (cmd === "up" || cmd === "down" || cmd === "reset") emitLayerState();
    renderDrawer();
    // Keep focus on the button pressed; a move that lands at an end disables it, so fall to its partner.
    const row = [...drawer.querySelectorAll(".ll-row")].find((r) => r.dataset.llId === id);
    const live = (c: string) => row?.querySelector(`.ll-acts [data-ll-cmd="${c}"]`) ?? null;
    const usable = (b: any) => (b && b.getAttribute("disabled") == null ? b : null);
    const target = usable(live(cmd)) ??
      (cmd === "up" ? usable(live("down")) : cmd === "down" ? usable(live("up")) : null) ??
      row?.querySelector('[data-ll-act="acts"]');
    target?.focus?.();
  }

  // ── events ───────────────────────────────────────────────────────────────
  const L: [any, string, any][] = [];                      // every listener we add, so destroy() can take them all off
  const on = (el, t, fn) => { el.addEventListener(t, fn); L.push([el, t, fn]); };

  on(ctl, "click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const a = b.dataset.act;
    if (a === "zin") map?.zoomIn();
    else if (a === "zout") map?.zoomOut();
    else if (a === "fit") opts.onFit?.(e);
    else if (a === "legend") toggleLegend();
    else if (a === "fullscreen") toggleFullscreen();
    else if (a.startsWith("tool-")) T.click(a.slice(5), controls);
    else openDrawer(a);
  });
  for (const t of ["fullscreenchange", "webkitfullscreenchange"]) on(doc, t, onFullscreenChange);
  on(drawer, "click", (e) => {
    // ── the layer list: an inline action, else a row gesture
    const C = e.target.closest("[data-ll-cmd]");
    if (C) { if (C.getAttribute("disabled") == null) llCommand(C.closest("[data-ll-id]")?.dataset.llId, C.dataset.llCmd, C.dataset.llSvc); return; }
    const A = e.target.closest("[data-ll-act]");
    if (A) { if (A.dataset.llAct !== "grip") llAct(A.closest("[data-ll-id]")?.dataset.llId, A.dataset.llAct); return; }
    if (e.target.closest(".ll-set") && opts.panelSettings?.onClick?.(e)) { renderDrawer(); return; }
    // "More basemaps": expand/collapse IN PLACE (no re-render, so the scroll position holds).
    const M = e.target.closest("[data-bmmore]");
    if (M) {
      state.moreOpen = !state.moreOpen;
      M.setAttribute("aria-expanded", String(state.moreOpen));
      const body = drawer.querySelector("#bm-more-body");
      if (body) body.hidden = !state.moreOpen;
      if (state.moreOpen) M.scrollIntoView?.({ block: "start", behavior: "smooth" });
      hideTip(); placeGrip();
      return;
    }
    const B = e.target.closest("[data-base]");
    if (B) {
      const id = B.dataset.base;
      const wasAuto = state.autoBasemap;
      if (id === "__auto") {
        // A switch: on → off keeps the basemap in force as an explicit pick (no restyle).
        if (state.autoBasemap) { state.basemap = effectiveBasemap(); state.autoBasemap = false; }
        else { state.autoBasemap = true; state.basemap = null; restyle(themeBasemap(state.mode), "follow"); }
      } else {
        const same = !state.autoBasemap && (hostCurrent() ?? state.basemap) === id;
        state.autoBasemap = false; state.basemap = id;
        if (!same) restyle(id, "pick");
      }
      if (wasAuto !== state.autoBasemap) host?.onFollowChange?.(state.autoBasemap);
      hideTip();
      renderDrawer();
      drawer.querySelector(`[data-base="${id}"]`)?.focus?.();   // keep keyboard focus on the control
    }
  });
  // The info tooltip: hover AND keyboard focus show the description; neither selects anything.
  const tipOn = (e) => { const i = e.target.closest?.(".bm-info"); if (i) showTip(i); };
  const tipOff = (e) => { const i = e.target.closest?.(".bm-info"); if (i && !(e.relatedTarget && i.contains?.(e.relatedTarget))) hideTip(); };
  on(drawer, "mouseover", tipOn);
  on(drawer, "focusin", tipOn);
  on(drawer, "mouseout", tipOff);
  on(drawer, "focusout", tipOff);
  on(drawer, "scroll", hideTip);
  // Esc inside an expanded actions section collapses it and returns focus to its "…"; anywhere
  // else Esc travels on to the window (escape()).
  on(drawer, "keydown", (e) => {
    if (e.key !== "Escape") return;
    const sec = e.target.closest?.(".ll-acts");
    if (!sec) return;
    e.preventDefault(); e.stopPropagation();
    llCloseActs(sec.closest("[data-ll-id]")?.dataset.llId);
  });
  on(drawer, "input", (e) => {
    const s = e.target.closest?.("[data-ll-opacity]");
    if (!s) return;
    const pct = Math.max(0, Math.min(100, Number(s.value) || 0));
    llSetOpacity(s.dataset.llOpacity, 1 - pct / 100);
    applyLayerState();
    emitLayerState();
    const lab = s.closest(".ll-op")?.querySelector("[data-ll-pct]");
    if (lab) lab.textContent = `${pct}%`;
    s.setAttribute("aria-valuetext", `${pct}% transparent`);
    // the DOM now shows this state: a refreshLayers() mid-drag finds nothing to re-render (and keeps the drag)
    if (drawer.dataset.which === "layers") lastLayersHtml = layersDrawerHtml();
  });
  on(drawer, "pointerdown", (e) => {
    const g = e.target.closest?.('[data-ll-act="grip"]');
    if (g) llDragStart(e, g, (id, index) => {
      const moved = llMoveTo(descriptors(), id, index);
      applyLayerState(); renderDrawer();
      if (moved) emitLayerState();
    });
  });

  // the grip: pointer drag + arrow keys (Shift = bigger steps, Home / End = min / max)
  if (grip) {
    on(grip, "pointerdown", (e) => {
      if (!getOpenDrawer()) return;
      e.preventDefault?.();
      const x0 = e.clientX, w0 = drawerWidth() || minW;
      grip.classList.add("dragging");
      try { grip.setPointerCapture?.(e.pointerId); } catch { /* synthetic pointer */ }
      const move = (ev) => { setDrawerWidth(w0 + widen(ev.clientX - x0)); };
      const up = () => {
        globalThis.removeEventListener("pointermove", move); globalThis.removeEventListener("pointerup", up);
        globalThis.removeEventListener("pointercancel", up);
        grip.classList.remove("dragging");
      };
      globalThis.addEventListener("pointermove", move); globalThis.addEventListener("pointerup", up);
      globalThis.addEventListener("pointercancel", up);
    });
    on(grip, "keydown", (e) => {
      if (!getOpenDrawer()) return;
      // ↑ / ↓ mean nothing to a vertical separator — but they must not reach the app's key handlers
      // (or scroll the page) while the grip has focus.
      if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault?.(); e.stopPropagation?.(); return; }
      const step = e.shiftKey ? 48 : 16, w = drawerWidth() || minW;
      let next: number | null = null;
      if (e.key === "ArrowLeft") next = w + widen(-step);
      else if (e.key === "ArrowRight") next = w + widen(step);
      else if (e.key === "Home") next = minW;
      else if (e.key === "End") next = maxNow();
      if (next == null) return;
      e.preventDefault?.(); e.stopPropagation?.();
      setDrawerWidth(next);
    });
  }
  if (typeof (globalThis as any).addEventListener === "function") on(globalThis, "resize", () => placeGrip());
  let RO: any = null;
  if (grip && typeof (globalThis as any).ResizeObserver === "function") {
    RO = new (globalThis as any).ResizeObserver(() => placeGrip());
    try { RO.observe(drawer); } catch { RO = null; }
  }

  const guardMs = Number.isFinite(opts.escapeGuardMs as number) ? Math.max(0, opts.escapeGuardMs as number) : 300;
  /** The app's own popup / card / modal (opts.closePopup); true if it closed one. */
  function closeAppPopup(): boolean {
    try { return opts.closePopup?.() === true; } catch (e: any) { opts.onError?.(`closePopup threw: ${e?.message ?? e}`); return false; }
  }
  /** Every MapLibre popup on the map(s); true if any closed. */
  function closeAllMapPopups(): boolean {
    let closed = false;
    for (const m of allMaps()) if (closeMapPopups(m) > 0) closed = true;
    return closed;
  }
  /** Close ALL open popups at once: the app's own (opts.closePopup) and every MapLibre popup. */
  function closePopups(): boolean {
    const a = closeAppPopup();
    const b = closeAllMapPopups();
    return a || b;
  }
  /** One Esc closes ONE layer, topmost first. The browser owns Esc in full screen — the press that
   *  exited it must not ALSO unwind anything here (for escapeGuardMs). Then the app's closePopup()
   *  (its card / modal sits above the map's popups), then the MapLibre popups, then the active tool,
   *  then the drawer. true = consumed; the app's own chain runs only on false. */
  function escape() {
    if (guardMs > 0 && Date.now() - FS.exitedAt < guardMs) return true;
    if (closeAppPopup()) return true;        // the app's popup / card first — and only it
    if (closeAllMapPopups()) return true;    // then MapLibre's popups, on the next press
    if (T.escape()) return true;             // then an open tool: Esc reverts to identify
    return closeAll();                       // then the drawer
  }
  function handleKey(e: { key: string; [k: string]: any }) {
    const k = e.key;
    if (k === "l" || k === "L") { if (!opts.layers) return false; openDrawer("layers"); return true; }
    if (k === "b" || k === "B") { openDrawer("base"); return true; }
    if (k === "g" || k === "G") { if (!opts.onToggleLegend) return false; toggleLegend(); return true; }
    if (k === "f" || k === "F") { if (!opts.onFit) return false; opts.onFit(e); return true; }
    if (k === "Escape") return escape();
    return false;
  }
  if (opts.keyboard !== false && globalThis.addEventListener) {
    const onKey = (e) => {
      if (e.target?.matches?.("input,textarea,select,[contenteditable]") || e.target?.isContentEditable) return;
      handleKey(e);
    };
    globalThis.addEventListener("keydown", onKey);
    L.push([globalThis, "keydown", onKey]);
  }

  // ── the map ──────────────────────────────────────────────────────────────
  const onStyle = () => { opts.onRestyle?.(map); T.restyle(); raiseOverlays(); };
  function setMap(m: MapLike | null | undefined) {
    if (map && map !== m) map.off?.("styledata", onStyle);
    const changed = map !== (m ?? null);
    map = m ?? null;
    map?.on?.("styledata", onStyle);       // setStyle drops every source and layer
    S?.bind(map);
    // a map whose (GL) initial style has not loaded yet is watched like a pick
    if (changed && map && !styleParsed(map)) watchBasemap(map, effectiveBasemap());
  }
  if (map) { setMap(map); if (!styleParsed(map)) watchBasemap(map, effectiveBasemap()); }
  /** Each secondary map gets its own styledata handler: onRestyle(thatMap), then its overlays. */
  const mirrorHandlers = new Map<any, () => void>();
  function setSecondaryMaps(list: (MapLike | null | undefined)[] | null | undefined) {
    for (const [m, fn] of mirrorHandlers) m.off?.("styledata", fn);
    mirrorHandlers.clear();
    mirrors = (list ?? []).filter((m, i, a) => !!m && m !== map && a.indexOf(m) === i);
    for (const m of mirrors) {
      const fn = () => { opts.onRestyle?.(m); raiseOverlays(m); };
      m.on?.("styledata", fn);
      mirrorHandlers.set(m, fn);
    }
  }
  if (opts.maps) setSecondaryMaps(opts.maps);

  function destroy() {
    destroyed = true;
    fbDisarm?.();
    T.destroy();
    S?.destroy();
    for (const [el, t, fn] of L) el.removeEventListener(t, fn);
    L.length = 0;
    try { RO?.disconnect?.(); } catch { /* gone */ }
    map?.off?.("styledata", onStyle);
    setSecondaryMaps([]);
    hideTip();
    for (const el of created) (el.remove ? el.remove() : el.parentNode?.removeChild(el));
    if (opts.cluster) ctl.innerHTML = "";
    if (drawerEl) { drawer.innerHTML = ""; drawer.hidden = true; drawer.dataset.which = ""; if (drawer.style) drawer.style.width = ""; }
    if (drawerIdSet && drawerEl) drawer.removeAttribute?.("id");
    if ((container as any).__smc === controls) { try { delete (container as any).__smc; } catch { /* sealed */ } }
    container.classList.remove("smc");
    container.removeAttribute?.("data-smc-mode");
    container.removeAttribute?.("data-smc-dir");
    container.removeAttribute?.("data-smc-popups");
  }

  const controls: MapControls = {
    state, LL,
    setTheme, setBasemap,
    getBasemap: () => (state.autoBasemap ? null : state.basemap),
    effectiveBasemap, styleFor, initialStyle: () => styleFor(effectiveBasemap()),
    recommendedIds,
    openDrawer, closeAll, escape, closePopups, handleKey,
    themeBasemap: (m?: string) => themeBasemap(m === "dark" || m === "light" ? m : state.mode),
    basemapFallback: () => (fellBack ? { ...fellBack } : null),
    refresh, refreshLayers, renderDrawer, renderChrome,
    syncChrome, refreshChrome: syncChrome, getOpenDrawer, getTheme: () => state.mode,
    drawerWidth, setDrawerWidth,
    setSecondaryMaps, getMaps: allMaps,
    applyLayerState, raiseOverlays: (m?: MapLike | null) => raiseOverlays(m ?? map), llMoveTo: (descs: LayerDescriptor[] | null | undefined, id: string, index: number) => llMoveTo(descs ?? descriptors(), id, index),
    setMap, getMap, isFullscreen, toggleFullscreen, destroy,
    isBusy: T.isBusy, getMode: T.getMode, setMode: T.setMode, tools: T, scale: S,
    elements: { container, cluster: ctl, drawer },
  };
  // The live instance on its container (non-enumerable), so a browser harness — conformance.mjs —
  // can reset gallery state without every app exposing its controls. Not an app API: hold the
  // return value instead.
  try { Object.defineProperty(container, "__smc", { value: controls, configurable: true, writable: true, enumerable: false }); } catch { /* frozen host */ }
  renderChrome();
  return controls;
}
