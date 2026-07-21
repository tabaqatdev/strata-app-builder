/**
 * @strata/core-map — TimeSlider (MIT).
 *
 * A dependency-light **temporal control**: a range slider with **play/pause** animation that drives a time
 * `definitionExpression` onto one or more layers. Time values are epoch-millis. In `"instant"` mode it
 * builds a cumulative filter (`<timeField> <= <t>`); in `"window"` mode a moving window
 * (`<timeField> >= <start> AND <timeField> <= <end>`). Each change calls `onApplyFilter(layerId, where)`
 * per configured layer, and `onChange` with the active range. `formatLabel` renders the tick label
 * (default: ISO date). Themed via CSS custom properties (dark defaults): `--strata-panel-bg`,
 * `--strata-fg`, `--strata-muted`, `--strata-border`, `--strata-accent`.
 *
 * Also available as a plugin: `@strata/plugin-timeslider` (plain-DOM, for the plugin/marketplace route).
 */
import React, { useEffect, useRef, useState } from "react";

/** A layer to filter temporally, plus the field the time predicate is written against. */
export interface TimeSliderLayer {
  id: string;
  timeField: string;
}

export interface TimeSliderProps {
  /** Start of the time domain (epoch-millis). */
  min: number;
  /** End of the time domain (epoch-millis). */
  max: number;
  /** Step the slider + play animation advance by, in millis (default: 1/60th of the span). */
  step?: number;
  /** "instant" = cumulative (`<= t`); "window" = a moving `[start, end]` window. Default "instant". */
  mode?: "instant" | "window";
  /** Window width in millis for `mode: "window"` (default: 10× step). */
  windowSize?: number;
  /** Milliseconds between play frames (default 700). */
  playIntervalMs?: number;
  /** Layers to apply the time `definitionExpression` to on each change. */
  layers?: TimeSliderLayer[];
  /** Called with the active range whenever the slider moves or plays. */
  onChange?: (range: { start: number; end: number }) => void;
  /** Called per configured layer with the built time `where` (or `null` to clear). */
  onApplyFilter?: (layerId: string, where: string | null) => void;
  /** Renders a tick value into a label (default: ISO date, `YYYY-MM-DD`). */
  formatLabel?: (t: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

/** Default tick label: the ISO date (`YYYY-MM-DD`) of an epoch-millis value. */
function defaultFormatLabel(t: number): string {
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? String(t) : d.toISOString().slice(0, 10);
}

/**
 * Build the time predicate for the current position.
 * - instant: `<timeField> <= end`
 * - window:  `<timeField> >= start AND <timeField> <= end`
 */
function buildWhere(timeField: string, mode: "instant" | "window", start: number, end: number): string {
  if (mode === "window") {
    return `${timeField} >= ${start} AND ${timeField} <= ${end}`;
  }
  return `${timeField} <= ${end}`;
}

export function TimeSlider(props: TimeSliderProps): React.ReactElement {
  const {
    min,
    max,
    mode = "instant",
    playIntervalMs = 700,
    layers,
    onChange,
    onApplyFilter,
    formatLabel = defaultFormatLabel,
    className,
    style,
  } = props;

  const span = Math.max(1, max - min);
  const step = props.step && props.step > 0 ? props.step : Math.max(1, Math.round(span / 60));
  const windowSize = props.windowSize && props.windowSize > 0 ? props.windowSize : step * 10;

  const [t, setT] = useState<number>(min);
  const [playing, setPlaying] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Latest values the play tick / apply effect need, kept in a ref so the interval closure stays stable.
  const applyRef = useRef({ mode, windowSize, step, min, max, layers, onChange, onApplyFilter });
  applyRef.current = { mode, windowSize, step, min, max, layers, onChange, onApplyFilter };

  const apply = (end: number): void => {
    const cfg = applyRef.current;
    const start = cfg.mode === "window" ? Math.max(cfg.min, end - cfg.windowSize) : cfg.min;
    cfg.onChange?.({ start, end });
    for (const layer of cfg.layers ?? []) {
      cfg.onApplyFilter?.(layer.id, buildWhere(layer.timeField, cfg.mode, start, end));
    }
  };

  // Apply whenever the position moves (initial mount included).
  useEffect(() => {
    apply(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const clearTimer = (): void => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Play loop: advance by `step`, looping back to `min` at the end. Cleaned up on stop/unmount.
  useEffect(() => {
    if (!playing) {
      clearTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      setT((cur) => {
        const cfg = applyRef.current;
        const next = cur + cfg.step;
        return next > cfg.max ? cfg.min : next;
      });
    }, playIntervalMs);
    return clearTimer;
  }, [playing, playIntervalMs]);

  // Clear any live timer on unmount.
  useEffect(() => clearTimer, []);

  const onSlider = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setT(Number(e.target.value));
  };

  const windowStart = mode === "window" ? Math.max(min, t - windowSize) : min;

  return (
    <div
      className={className}
      data-strata-timeslider
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 10px",
        font: "11px/1.4 var(--strata-mono, ui-monospace, monospace)",
        color: "var(--strata-fg, #e8eef5)",
        background: "var(--strata-panel-bg, #1a1f27)",
        border: "1px solid var(--strata-border, #2a2f3a)",
        borderRadius: 6,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "pause" : "play"}
        title={playing ? "Pause" : "Play"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          padding: 0,
          cursor: "pointer",
          color: "inherit",
          background: "transparent",
          border: "1px solid var(--strata-border, #2a2f3a)",
          borderRadius: 4,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
          {playing ? (
            <>
              <rect x={2} y={1.5} width={3} height={9} fill="currentColor" />
              <rect x={7} y={1.5} width={3} height={9} fill="currentColor" />
            </>
          ) : (
            <path d="M2.5 1.5 L10 6 L2.5 10.5 Z" fill="currentColor" />
          )}
        </svg>
      </button>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={t}
        onChange={onSlider}
        aria-label="time"
        style={{ flex: 1, accentColor: "var(--strata-accent, #4ea1ff)" }}
      />
      <span title="current time" style={{ minWidth: 78, textAlign: "right", whiteSpace: "nowrap" }}>
        {mode === "window" ? `${formatLabel(windowStart)} – ${formatLabel(t)}` : formatLabel(t)}
      </span>
    </div>
  );
}

export default TimeSlider;
