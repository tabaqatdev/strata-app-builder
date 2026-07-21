/**
 * @strata/plugin-statusbar — a GeoLibre-style map **status bar** + **scalebar** as a StrataPlugin.
 *
 * On activate it attaches a bottom bar to the map container showing live cursor **coordinates**, the
 * **zoom** level, a graphic **scalebar** with a distance label, and the **coordinate system** (CRS). Uses
 * only `app.getMap()` — no map-library import — so it works with the plugin/marketplace route and non-React
 * hosts. (React apps can instead use the `StatusBar` control in `@strata/core-map`.)
 */
import type { StrataPlugin, StrataAppAPI } from "@strata/plugins";

export interface StatusBarOptions {
  crs?: string; // default "EPSG:4326"
  precision?: number; // lng/lat decimals, default 5
  scalebarTargetPx?: number; // desired scalebar width, default 90
}

interface Internals {
  el?: HTMLElement;
  map?: any;
  handlers?: Array<[string, (e: any) => void]>;
}

function metersPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

/** Round to a "nice" 1/2/5 × 10^n number ≤ target. */
function niceDistance(meters: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(meters)));
  const f = meters / pow;
  const nice = f >= 5 ? 5 : f >= 2 ? 2 : 1;
  return nice * pow;
}

function fmtDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toLocaleString()} km` : `${Math.round(m)} m`;
}

export function statusBarPlugin(options: StatusBarOptions = {}): StrataPlugin {
  const { crs = "EPSG:4326", precision = 5, scalebarTargetPx = 90 } = options;
  const s: Internals = {};

  const update = (lng?: number, lat?: number): void => {
    if (!s.el || !s.map) return;
    const c = s.map.getCenter();
    const z = s.map.getZoom();
    const coord = lng != null && lat != null ? `${lng.toFixed(precision)}, ${lat.toFixed(precision)}` : "—, —";
    const mpp = metersPerPixel(lat ?? c.lat, z);
    const dist = niceDistance(mpp * scalebarTargetPx);
    const barPx = Math.round(dist / mpp);
    s.el.innerHTML =
      `<span title="coordinates">${coord}</span>` +
      `<span title="zoom">z ${z.toFixed(2)}</span>` +
      `<span class="strata-scalebar" title="scale">` +
      `<i style="display:inline-block;width:${barPx}px;height:6px;border:1px solid currentColor;border-top:none;vertical-align:middle"></i> ${fmtDistance(dist)}</span>` +
      `<span style="margin-left:auto;opacity:.75" title="CRS">${crs}</span>`;
  };

  return {
    id: "strata-statusbar",
    name: "Status bar",
    version: "0.3.0",
    activate(app: StrataAppAPI): boolean {
      const map: any = app.getMap?.();
      if (!map || !map.getContainer) return false;
      s.map = map;
      const el = document.createElement("div");
      el.setAttribute("data-strata-statusbar", "");
      Object.assign(el.style, {
        position: "absolute",
        left: "0",
        right: "0",
        bottom: "0",
        display: "flex",
        gap: "14px",
        alignItems: "center",
        padding: "2px 10px",
        font: "11px/1.6 ui-monospace, monospace",
        color: "#e8eef5",
        background: "rgba(26,31,39,0.8)",
        borderTop: "1px solid #2a2f3a",
        pointerEvents: "none",
        zIndex: "5",
      } as CSSStyleDeclaration);
      map.getContainer().appendChild(el);
      s.el = el;
      s.handlers = [
        ["mousemove", (e: any) => update(e.lngLat.lng, e.lngLat.lat)],
        ["mouseout", () => update()],
        ["move", () => update()],
        ["zoom", () => update()],
      ];
      for (const [ev, fn] of s.handlers) map.on(ev, fn);
      update();
      return true;
    },
    deactivate(): void {
      if (s.map && s.handlers) for (const [ev, fn] of s.handlers) s.map.off(ev, fn);
      s.el?.remove();
      s.el = undefined;
      s.handlers = undefined;
      s.map = undefined;
    },
  };
}

export default statusBarPlugin;
