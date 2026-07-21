/**
 * Pure animation styling (no React) — maps an `AnimateKind` + `AnimateOptions` to the inline style for the
 * hidden and shown states, so the `Animated` wrapper is a thin shell and the math is unit-testable.
 */
import type { AnimateKind, AnimateOptions } from "@strata/schema";

/** The `transform` an element animates FROM (its hidden state). `fade`/`scroll-reveal` don't move. */
export function hiddenTransform(kind: AnimateKind, opts?: AnimateOptions): string {
  const dist = opts?.distance ?? 16;
  const dir = opts?.direction ?? "up";
  switch (kind) {
    case "slide":
      return `translateY(${dist}px)`;
    case "fly": {
      const by: Record<string, string> = {
        up: `translateY(${dist}px)`,
        down: `translateY(${-dist}px)`,
        left: `translateX(${dist}px)`,
        right: `translateX(${-dist}px)`,
      };
      return by[dir] ?? `translateY(${dist}px)`;
    }
    case "zoom":
      return "scale(0.92)";
    case "rotate":
      return "rotate(-6deg) scale(0.96)";
    default:
      return "none"; // fade, scroll-reveal
  }
}

export interface AnimatedStyle {
  transition: string;
  opacity: number;
  transform: string;
}

/** The inline style for the current `shown` state, honoring duration/easing/delay. */
export function animatedStyle(kind: AnimateKind, shown: boolean, opts?: AnimateOptions): AnimatedStyle {
  const dur = opts?.duration ?? 400;
  const ease = opts?.easing ?? "ease";
  const delay = opts?.delay ?? 0;
  return {
    transition: `opacity ${dur}ms ${ease} ${delay}ms, transform ${dur}ms ${ease} ${delay}ms`,
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : hiddenTransform(kind, opts),
  };
}

/** Next index for an auto-advancing views node. Wraps when `loop` (default true); else clamps at the end. */
export function nextViewIndex(current: number, count: number, loop = true): number {
  if (count <= 0) return 0;
  const n = current + 1;
  if (n < count) return n;
  return loop ? 0 : count - 1;
}
