/**
 * Pure chart data transforms (no React) — histogram binning and scatter-point mapping, so the `chart`
 * widget can render `histogram`/`scatter` kinds. Unit-testable in isolation.
 */

export interface Bin {
  label: string;
  value: number;
}

const fmt = (n: number): string => (Math.abs(n) >= 100 ? Math.round(n).toString() : n.toFixed(1));

/** Bin numeric `values` into `binCount` equal-width buckets → `{label:"lo–hi", value:count}` bars. */
export function histogram(values: number[], binCount = 10): Bin[] {
  const nums = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  if (nums.length === 0) return [];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (min === max) return [{ label: fmt(min), value: nums.length }];
  const n = Math.max(1, Math.floor(binCount));
  const width = (max - min) / n;
  const counts = new Array<number>(n).fill(0);
  for (const v of nums) {
    let idx = Math.floor((v - min) / width);
    if (idx >= n) idx = n - 1;
    if (idx < 0) idx = 0;
    counts[idx] += 1;
  }
  return counts.map((count, i) => ({ label: `${fmt(min + i * width)}–${fmt(min + (i + 1) * width)}`, value: count }));
}

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
}

/** Map `{label,value,x?}` rows to scatter points (x defaults to the row index). */
export function scatterPairs(data: Array<{ label?: string; value: number; x?: number }>): ScatterPoint[] {
  return data.map((d, i) => ({ x: typeof d.x === "number" ? d.x : i, y: d.value, label: d.label }));
}
