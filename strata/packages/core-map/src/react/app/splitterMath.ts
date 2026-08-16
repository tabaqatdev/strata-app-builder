/**
 * Pure geometry for the resizable containers (no React), so the resize math is unit-testable.
 *
 * Two shapes share this file:
 *  - `resizeSplit` — the `splitter` container. Sizes are percentages of the container along the split
 *    axis. Dragging divider `index` (between child `index` and `index+1`) grows one pane by `deltaPct`
 *    and shrinks its neighbor by the same, clamped so neither pane drops below its minimum.
 *  - `resizePanel` — a single panel sized in **pixels** along one axis (the `panel` container node and
 *    every `PanelShell`). There is no neighbor to trade against: the drag simply grows or shrinks one
 *    box, clamped to `[min, max]`.
 */

/** Equal-split percentages for `n` children, unless explicit `sizes` are given (normalized to 100). */
export function initialSizes(n: number, sizes?: number[]): number[] {
  if (n <= 0) return [];
  if (sizes && sizes.length === n) {
    const total = sizes.reduce((a, b) => a + b, 0) || 1;
    return sizes.map((s) => (s / total) * 100);
  }
  return Array.from({ length: n }, () => 100 / n);
}

/**
 * Apply a drag delta (in percentage points) to the divider between panes `index` and `index+1`.
 * Positive `deltaPct` grows pane `index`. Returns a new sizes array; out-of-range indexes are a no-op.
 */
export function resizeSplit(
  sizes: number[],
  index: number,
  deltaPct: number,
  minSizes: number[] = [],
): number[] {
  const out = sizes.slice();
  const a = index;
  const b = index + 1;
  if (a < 0 || b >= out.length) return out;
  const minA = minSizes[a] ?? 5;
  const minB = minSizes[b] ?? 5;
  // Clamp so pane a can't fall below minA (delta too negative) and pane b can't below minB (delta too positive).
  let d = deltaPct;
  d = Math.max(d, minA - out[a]);
  d = Math.min(d, out[b] - minB);
  out[a] += d;
  out[b] -= d;
  return out;
}

/**
 * Apply a drag delta (in px) to a single panel sized along one axis, clamped to `[min, max]`.
 *
 * `start` is the size captured when the drag began — never the live size — so a pointer dragged past a
 * clamp and back returns to where the pointer is, instead of accumulating the clamped-off remainder.
 * A non-finite `start` (an unmeasured box) or a `max` below `min` yields the clamped `min`.
 */
export function resizePanel(start: number, deltaPx: number, min = 120, max = Infinity): number {
  const lo = Math.max(0, min);
  const hi = Math.max(lo, max);
  const base = Number.isFinite(start) ? start : lo;
  return Math.max(lo, Math.min(hi, base + (Number.isFinite(deltaPx) ? deltaPx : 0)));
}
