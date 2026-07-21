/**
 * Pure geometry for the `splitter` container (no React), so the resize math is unit-testable.
 *
 * Sizes are percentages of the container along the split axis. Dragging divider `index` (between child
 * `index` and `index+1`) grows one pane by `deltaPct` and shrinks its neighbor by the same, clamped so
 * neither pane drops below its minimum.
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
