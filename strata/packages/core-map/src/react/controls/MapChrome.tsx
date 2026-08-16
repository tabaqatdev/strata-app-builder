/**
 * MapChrome — the house control vocabulary, ON the map (MIT).
 *
 * One 32px round-rect cluster top-right (zoom in · zoom out · fit · layers · basemap · legend),
 * MapLibre's own zoom suppressed so there is exactly one set, and **one** drawer opening *beside*
 * the cluster — never over it, never two at once. Layers and basemap belong on the map: a reader
 * looking at the map should not travel to a page header to change what it shows.
 *
 * Ported from the shipped broadband-gap build so a client moving between apps meets the same
 * controls — the six inline-SVG glyphs, the 32px cluster, the drawer at `right:47px`, and the
 * `.opt` row (square box = a layer you can multi-select, round box = a basemap radio).
 *
 * The stylesheet is injected once and every rule is scoped under `.strata-chrome`, so the reference
 * class vocabulary (`mapctl` / `drawer` / `opt` / `box` / `thumb`) cannot collide with an app's own.
 *
 * Honesty rules this control inherits (see `strata/docs/troubleshooting.md`):
 *  - The **primary layer is listed first** and counted — a layer list that omits the map's actual
 *    content is why one build read "everything is hidden".
 *  - Every row says which *kind* of nothing it is: *off* · *N in view* · *none in this view*.
 *  - The basemap ticks the **effective** basemap, including when "Follow the theme" is choosing it.
 *    "Follow the theme" says HOW the choice is made; it does not stop there being a choice.
 */
import React, { useCallback, useEffect, useState } from "react";
import type { BaseMap, OperationalLayer } from "@strata/schema";
import type { StrataStore } from "@strata/state";
import { OPEN_BASEMAPS } from "../../engine/basemaps.js";
import { buildBaseMap, previewTile, tileBackground, type BasemapOption } from "../panels/BasemapPanel.js";
import { legendRows } from "./Legend.js";

/** The six glyphs, verbatim from the reference build. 24×24 stroke paths on `currentColor`. */
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
  /** The live MapLibre map (for zoom in/out and the basemap preview tile). */
  map?: any;
  /** Store — drives the layer rows and the basemap choice. Without it the drawers are read-only. */
  store?: StrataStore;
  /** Operational layers to list (pass the reactive set; the primary layer first). */
  layers: OperationalLayer[];
  /** Candidate basemaps. Defaults to `OPEN_BASEMAPS` — keyless, OpenStreetMap-derived. */
  basemaps?: BasemapOption[];
  /** Apply a chosen basemap to the live map (restyle). */
  onApplyBasemap?: (bm: BaseMap) => void;
  /** The app's theme mode — what "Follow the theme" follows. */
  themeMode?: "light" | "dark";
  /** Is the legend showing? Controlled; pair with `onToggleLegend`. */
  showLegend?: boolean;
  onToggleLegend?: (next: boolean) => void;
  /** "Fit" (the home glyph) — zoom to the reading. Omit and the button is not rendered. */
  onFit?: () => void;
  /** Which corner the cluster occupies. Default `top-right` (the drawer opens on its inner side). */
  position?: "top-right" | "top-left";
  /** Keyboard shortcuts L/B/G/F and `Esc`. Default true. */
  keyboard?: boolean;
  className?: string;
}

export function MapChrome(props: MapChromeProps): React.ReactElement {
  const { map, store, layers, onApplyBasemap, onFit, onToggleLegend } = props;
  const left = props.position === "top-left";
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [auto, setAuto] = useState(true); // "Follow the theme" is the default choice-maker
  const legendOn = props.showLegend !== false;

  useEffect(() => {
    ensureChromeStyles();
  }, []);

  /** Open `which`, or close it when it is already the open one — one drawer, never two. */
  const openDrawer = useCallback((which: Exclude<DrawerKind, null>): void => {
    setDrawer((cur) => (cur === which ? null : which));
  }, []);

  // Keyboard: L layers · B basemap · G legend · F fit · Esc closes one thing.
  useEffect(() => {
    if (props.keyboard === false || typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent): void => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return; // don't steal typing
      if (e.key === "Escape") {
        setDrawer(null);
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "l") openDrawer("layers");
      else if (k === "b") openDrawer("basemap");
      else if (k === "g") onToggleLegend?.(!legendOn);
      else if (k === "f") onFit?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.keyboard, openDrawer, onToggleLegend, onFit, legendOn]);

  // A badge on the layers button when context layers are drawing, so the drawer's state is legible
  // from the map without opening it.
  const visibleCount = layers.filter((l) => l.visibility !== false).length;

  const btn = (
    icon: string,
    title: string,
    onClick: () => void,
    key: string,
    on = false,
    badge = "",
  ): React.ReactElement => (
    <button
      type="button"
      data-key={key}
      className={on ? "on" : undefined}
      title={title}
      aria-label={title}
      aria-pressed={on}
      data-badge={badge || undefined}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      dangerouslySetInnerHTML={{ __html: icon }}
    />
  );

  return (
    <div className={`strata-chrome${props.className ? ` ${props.className}` : ""}`} data-strata-chrome="">
      <div className="mapctl" data-side={left ? "left" : "right"}>
        {btn(CHROME_ICONS.plus, "Zoom in", () => map?.zoomIn?.(), "zin")}
        {btn(CHROME_ICONS.minus, "Zoom out", () => map?.zoomOut?.(), "zout")}
        {onFit && btn(CHROME_ICONS.home, "Zoom to the reading (F)", () => onFit(), "fit")}
        <div className="sep" />
        {btn(
          CHROME_ICONS.layers,
          "Layers (L)",
          () => openDrawer("layers"),
          "layers",
          drawer === "layers",
          visibleCount ? String(visibleCount) : "",
        )}
        {btn(CHROME_ICONS.base, "Basemap (B)", () => openDrawer("basemap"), "basemap", drawer === "basemap")}
        {onToggleLegend &&
          btn(CHROME_ICONS.legend, "Show or hide the legend (G)", () => onToggleLegend(!legendOn), "legend", !legendOn)}
      </div>

      {drawer && (
        <div className="drawer" data-which={drawer} data-side={left ? "left" : "right"}>
          {drawer === "layers" ? (
            <LayersDrawer layers={layers} store={store} map={map} />
          ) : (
            <BasemapDrawer
              map={map}
              store={store}
              basemaps={props.basemaps ?? (OPEN_BASEMAPS as BasemapOption[])}
              themeMode={props.themeMode ?? "light"}
              auto={auto}
              onPick={(opt, isAuto) => {
                setAuto(isAuto);
                if (!opt) return;
                const bm = buildBaseMap(opt);
                store?.getState().setBaseMap?.(bm);
                onApplyBasemap?.(bm);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The layers drawer. Every row states which kind of nothing it is — *off*, *N in view*, *none in
 * this view* — because "switched off" and "empty here" look identical on a map and are not the same
 * problem. Counts come from what is actually rendered; when that cannot be known the row says
 * nothing rather than inventing a number.
 */
function LayersDrawer(props: {
  layers: OperationalLayer[];
  store?: StrataStore;
  map?: any;
}): React.ReactElement {
  const { layers, store, map } = props;
  return (
    <>
      <h5>Layers</h5>
      {layers.map((l, i) => {
        const on = l.visibility !== false;
        const swatch = legendRows(l)[0]?.swatch;
        const n = on ? renderedCount(map, l.id) : null;
        const tally = !on ? "off" : n == null ? "" : n === 0 ? "none in this view" : `${n.toLocaleString()} in view`;
        return (
          <React.Fragment key={l.id}>
            <button
              type="button"
              className={`opt${on ? " on" : ""}`}
              data-layer={l.id}
              aria-pressed={on}
              onClick={() => store?.getState().setVisibility?.(l.id, !on)}
            >
              <span className="box">{on ? "✓" : ""}</span>
              {swatch && <span className="sw2" style={{ background: swatch }} />}
              <span className="tx">
                <span className="tl">
                  {l.title || l.id}
                  {tally ? ` — ${tally}` : ""}
                </span>
                <span className="ts">{i === 0 ? "the reading" : "context — does not change the reading"}</span>
              </span>
            </button>
            {i === 0 && layers.length > 1 && <hr />}
          </React.Fragment>
        );
      })}
      {layers.length === 0 && <p className="note">No operational layers in this map.</p>}
    </>
  );
}

/**
 * The basemap drawer — a radio list (round box: exactly one is in force), each row carrying a live
 * tile of the current area in that style, because a colour swatch cannot tell Positron from Voyager.
 */
function BasemapDrawer(props: {
  map?: any;
  store?: StrataStore;
  basemaps: BasemapOption[];
  themeMode: "light" | "dark";
  auto: boolean;
  onPick: (opt: BasemapOption | null, auto: boolean) => void;
}): React.ReactElement {
  const { basemaps, auto, themeMode, map, onPick } = props;
  const tile = previewTile(map);
  // Tick the EFFECTIVE basemap, not just an explicitly chosen one: with "Follow the theme" on (the
  // default) an id-only test ticks nothing, so the drawer offers five options and shows none in
  // force — leaving no way to tell which basemap you are looking at.
  const themed = basemaps.find((b) => (b as any).mode === themeMode) ?? basemaps[0];
  const explicit = basemaps.find((b) => matchesCurrent(props.store, b));
  const active = auto ? themed : explicit ?? themed;

  return (
    <>
      <h5>Basemap — keyless, OpenStreetMap-derived</h5>
      {basemaps.map((b) => {
        const on = b.id === active?.id;
        return (
          <button
            type="button"
            key={b.id}
            className={`opt${on ? " on" : ""}`}
            data-basemap={b.id}
            role="radio"
            aria-checked={on}
            onClick={() => onPick(b, false)}
          >
            <span className="box round">{on ? "✓" : ""}</span>
            <span className="thumb" style={tileBackground(b, tile)} />
            <span className="tx">
              <span className="tl">{b.title}</span>
              <span className="ts">{b.style ? "vector" : "raster"}</span>
            </span>
          </button>
        );
      })}
      <hr />
      <button
        type="button"
        className={`opt${auto ? " on" : ""}`}
        data-basemap="auto"
        role="radio"
        aria-checked={auto}
        onClick={() => onPick(themed ?? null, true)}
      >
        <span className="box round">{auto ? "✓" : ""}</span>
        <span className="tx">
          <span className="tl">Follow the theme</span>
          <span className="ts">light UI → light map</span>
        </span>
      </button>
      <p className="note">
        No keyed or proprietary provider is offered — that is a house rule, not an omission.
      </p>
    </>
  );
}

// --- helpers ---------------------------------------------------------------

/** Does the store's current basemap come from this option? */
function matchesCurrent(store: StrataStore | undefined, opt: BasemapOption): boolean {
  const bm = store?.getState().baseMap;
  const layer = bm?.baseMapLayers?.[0];
  if (!layer) return false;
  if (opt.style && layer.styleUrl === opt.style) return true;
  if (opt.templateUrl && layer.templateUrl === opt.templateUrl) return true;
  return layer.id === opt.id;
}

/** Best-effort count of a layer's features currently on screen; `null` when it cannot be known. */
function renderedCount(map: any, layerId: string): number | null {
  try {
    if (!map?.queryRenderedFeatures || !map.getLayer?.(`lyr:${layerId}`)) return null;
    return map.queryRenderedFeatures({ layers: [`lyr:${layerId}`] }).length;
  } catch {
    return null;
  }
}

// --- the stylesheet (injected once) ----------------------------------------
// Ported from the reference build. Every rule is scoped under `.strata-chrome` so the class
// vocabulary matches the house pattern without being able to collide with an app's own CSS.
const CHROME_CSS = `
.strata-chrome .mapctl{position:absolute;top:9px;z-index:3;display:flex;flex-direction:column;gap:4px}
.strata-chrome .mapctl[data-side="right"]{right:9px}
.strata-chrome .mapctl[data-side="left"]{left:9px}
.strata-chrome .mapctl button{position:relative;width:32px;height:32px;padding:0;display:flex;
  align-items:center;justify-content:center;background:var(--strata-panel-bg,#fff);
  border:1px solid var(--strata-border,rgba(0,0,0,.14));border-radius:8px;color:var(--strata-fg,#1a1a1a);
  box-shadow:var(--strata-elev-1,0 1px 3px rgba(0,0,0,.16));transition:120ms;cursor:pointer}
.strata-chrome .mapctl button:hover{border-color:var(--strata-primary,#2f6fed);color:var(--strata-primary,#2f6fed)}
.strata-chrome .mapctl button.on{background:var(--strata-primary,#2f6fed);
  border-color:var(--strata-primary,#2f6fed);color:#fff}
.strata-chrome .mapctl .sep{height:5px}
.strata-chrome .mapctl button[data-badge]::after{content:attr(data-badge);position:absolute;
  transform:translate(11px,-11px);min-width:14px;height:14px;padding:0 3px;border-radius:7px;
  background:var(--strata-secondary,#7c5cff);color:#fff;font-size:9.5px;line-height:14px;
  text-align:center;font-weight:650}
.strata-chrome .mapctl svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;
  stroke-linecap:round;stroke-linejoin:round}
.strata-chrome .drawer{position:absolute;top:9px;z-index:4;width:270px;max-height:calc(100% - 18px);
  overflow:auto;background:var(--strata-panel-bg,#fff);border:1px solid var(--strata-border,rgba(0,0,0,.14));
  border-radius:10px;box-shadow:var(--strata-elev-2,0 6px 20px rgba(0,0,0,.18));padding:9px 10px;
  font:13px/1.4 system-ui,sans-serif;color:var(--strata-fg,#1a1a1a)}
.strata-chrome .drawer[data-side="right"]{right:47px}
.strata-chrome .drawer[data-side="left"]{left:47px}
.strata-chrome .drawer h5{font-size:10px;letter-spacing:.07em;text-transform:uppercase;
  color:var(--strata-muted,#6b7280);font-weight:600;margin:0 0 7px}
.strata-chrome .opt{display:flex;gap:8px;align-items:flex-start;padding:5px 4px;border-radius:7px;
  cursor:pointer;width:100%;text-align:left;border:1px solid transparent;background:none;
  color:var(--strata-fg,#1a1a1a);font:inherit}
.strata-chrome .opt:hover{background:color-mix(in srgb,var(--strata-primary,#2f6fed) 10%,transparent)}
.strata-chrome .opt.on{background:color-mix(in srgb,var(--strata-primary,#2f6fed) 15%,transparent);
  border-color:color-mix(in srgb,var(--strata-primary,#2f6fed) 42%,transparent)}
.strata-chrome .opt .box{flex:0 0 15px;height:15px;margin-top:2px;
  border:1.5px solid var(--strata-muted,#6b7280);border-radius:3px;display:flex;align-items:center;
  justify-content:center;font-size:11px;line-height:1}
.strata-chrome .opt .box.round{border-radius:50%}
.strata-chrome .opt.on .box{background:var(--strata-primary,#2f6fed);
  border-color:var(--strata-primary,#2f6fed);color:#fff}
.strata-chrome .opt .sw2{flex:0 0 15px;height:15px;margin-top:2px;border-radius:3px;
  border:1px solid var(--strata-border,rgba(0,0,0,.14))}
.strata-chrome .opt .thumb{flex:0 0 42px;height:42px;margin-top:1px;border-radius:5px;
  border:1px solid var(--strata-border,rgba(0,0,0,.14));background-size:cover;background-position:center;
  background-color:var(--strata-app-bg,#eef1f5);box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}
.strata-chrome .opt.on .thumb{border-color:var(--strata-primary,#2f6fed);
  box-shadow:0 0 0 1px var(--strata-primary,#2f6fed)}
.strata-chrome .opt .tx{min-width:0}
.strata-chrome .opt .tl{font-size:12.5px;font-weight:550;display:block}
.strata-chrome .opt .ts{font-size:11px;color:var(--strata-muted,#6b7280);line-height:1.35;display:block}
.strata-chrome .drawer hr{border:0;border-top:1px solid var(--strata-border,rgba(0,0,0,.14));margin:7px 2px}
.strata-chrome .drawer .note{font-size:10.5px;color:var(--strata-muted,#6b7280);line-height:1.4;margin:7px 2px 0}
`;

/** Inject the chrome stylesheet once per document. */
export function ensureChromeStyles(doc?: Document): void {
  const d = doc ?? (typeof document !== "undefined" ? document : undefined);
  if (!d || d.querySelector("style[data-strata-chrome-css]")) return;
  const el = d.createElement("style");
  el.setAttribute("data-strata-chrome-css", "");
  el.textContent = CHROME_CSS;
  d.head.appendChild(el);
}

export default MapChrome;
