/**
 * @strata/plugin-timeslider — a temporal **time slider** with play/pause as a StrataPlugin.
 *
 * On activate it mounts a plain-DOM slider at the bottom of the map container (via `app.getMap()`) with a
 * play/pause button. As the slider moves (or plays), it builds a time `definitionExpression` per configured
 * layer — cumulative in `"instant"` mode (`<timeField> <= <t>`) or a moving window in `"window"` mode
 * (`<timeField> >= <start> AND <timeField> <= <end>`) — and hands it to `onApplyFilter(layerId, where)`
 * (or logs a console note when none is supplied). Time values are epoch-millis. Uses only `app.getMap()`
 * — no map-library import — so it works via the plugin/marketplace route and non-React hosts. (React apps
 * can instead use the `TimeSlider` control in `@strata/core-map`.)
 */
import type { StrataPlugin, StrataAppAPI } from "@strata/plugins";

/** A layer to filter temporally, plus the field the time predicate is written against. */
export interface TimeSliderLayerRef {
  id: string;
  timeField: string;
}

export interface TimeSliderPluginOptions {
  /** Layers to apply the time `definitionExpression` to on each change. */
  layers: TimeSliderLayerRef[];
  /** Start of the time domain (epoch-millis). */
  min: number;
  /** End of the time domain (epoch-millis). */
  max: number;
  /** Step the slider + play animation advance by, in millis (default: 1/60th of the span). */
  step?: number;
  /** "instant" = cumulative (`<= t`); "window" = a moving `[start, end]` window. Default "instant". */
  mode?: "instant" | "window";
  /** Called per configured layer with the built time `where` (or `null` to clear). */
  onApplyFilter?: (layerId: string, where: string | null) => void;
  /** Milliseconds between play frames (default 700). */
  playIntervalMs?: number;
  /** Window width in millis for `mode: "window"` (default: 10× step). */
  windowSize?: number;
}

interface Internals {
  el?: HTMLElement;
  map?: { getContainer?: () => HTMLElement } | null;
  timer?: ReturnType<typeof setInterval>;
}

/** ISO date (`YYYY-MM-DD`) of an epoch-millis value. */
function isoDate(t: number): string {
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? String(t) : d.toISOString().slice(0, 10);
}

/**
 * Build the time predicate for the current position.
 * - instant: `<timeField> <= end`
 * - window:  `<timeField> >= start AND <timeField> <= end`
 */
function buildWhere(timeField: string, mode: "instant" | "window", start: number, end: number): string {
  return mode === "window"
    ? `${timeField} >= ${start} AND ${timeField} <= ${end}`
    : `${timeField} <= ${end}`;
}

export function timeSliderPlugin(options: TimeSliderPluginOptions): StrataPlugin {
  const { layers, min, max, onApplyFilter, playIntervalMs = 700 } = options;
  const mode: "instant" | "window" = options.mode ?? "instant";
  const span = Math.max(1, max - min);
  const step = options.step && options.step > 0 ? options.step : Math.max(1, Math.round(span / 60));
  const windowSize = options.windowSize && options.windowSize > 0 ? options.windowSize : step * 10;

  const s: Internals = {};
  let t = min;
  let playing = false;

  const apply = (): void => {
    const end = t;
    const start = mode === "window" ? Math.max(min, end - windowSize) : min;
    for (const layer of layers) {
      const where = buildWhere(layer.timeField, mode, start, end);
      if (onApplyFilter) onApplyFilter(layer.id, where);
      // eslint-disable-next-line no-console
      else console.info(`[strata-timeslider] ${layer.id}: ${where}`);
    }
  };

  const render = (): void => {
    if (!s.el) return;
    const range = s.el.querySelector<HTMLInputElement>("input[type=range]");
    const label = s.el.querySelector<HTMLElement>("[data-ts-label]");
    const btn = s.el.querySelector<HTMLButtonElement>("[data-ts-play]");
    if (range) range.value = String(t);
    if (label) {
      const start = mode === "window" ? Math.max(min, t - windowSize) : min;
      label.textContent = mode === "window" ? `${isoDate(start)} – ${isoDate(t)}` : isoDate(t);
    }
    if (btn) btn.textContent = playing ? "❚❚" : "►";
  };

  const clearTimer = (): void => {
    if (s.timer !== undefined) {
      clearInterval(s.timer);
      s.timer = undefined;
    }
  };

  const stopPlay = (): void => {
    playing = false;
    clearTimer();
    render();
  };

  const startPlay = (): void => {
    playing = true;
    render();
    s.timer = setInterval(() => {
      t = t + step > max ? min : t + step;
      apply();
      render();
    }, playIntervalMs);
  };

  return {
    id: "strata-timeslider",
    name: "Time slider",
    version: "0.1.0",
    activate(app: StrataAppAPI): boolean {
      const map = app.getMap?.() as { getContainer?: () => HTMLElement } | undefined | null;
      if (!map || typeof map.getContainer !== "function") return false;
      s.map = map;

      const el = document.createElement("div");
      el.setAttribute("data-strata-timeslider", "");
      Object.assign(el.style, {
        position: "absolute",
        left: "12px",
        right: "12px",
        bottom: "12px",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        padding: "6px 10px",
        font: "11px/1.4 ui-monospace, monospace",
        color: "#e8eef5",
        background: "rgba(26,31,39,0.9)",
        border: "1px solid #2a2f3a",
        borderRadius: "6px",
        zIndex: "6",
      } as CSSStyleDeclaration);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-ts-play", "");
      btn.textContent = "►";
      btn.setAttribute("aria-label", "play/pause");
      Object.assign(btn.style, {
        width: "26px",
        height: "24px",
        padding: "0",
        cursor: "pointer",
        color: "inherit",
        background: "transparent",
        border: "1px solid #2a2f3a",
        borderRadius: "4px",
      } as CSSStyleDeclaration);
      btn.addEventListener("click", () => (playing ? stopPlay() : startPlay()));

      const range = document.createElement("input");
      range.type = "range";
      range.min = String(min);
      range.max = String(max);
      range.step = String(step);
      range.value = String(t);
      range.setAttribute("aria-label", "time");
      range.style.flex = "1";
      range.addEventListener("input", () => {
        t = Number(range.value);
        apply();
        render();
      });

      const label = document.createElement("span");
      label.setAttribute("data-ts-label", "");
      Object.assign(label.style, {
        minWidth: "78px",
        textAlign: "right",
        whiteSpace: "nowrap",
      } as CSSStyleDeclaration);

      el.appendChild(btn);
      el.appendChild(range);
      el.appendChild(label);
      map.getContainer!().appendChild(el);
      s.el = el;

      render();
      apply();
      return true;
    },
    deactivate(): void {
      clearTimer();
      s.el?.remove();
      s.el = undefined;
      s.map = undefined;
      playing = false;
    },
  };
}

export default timeSliderPlugin;
