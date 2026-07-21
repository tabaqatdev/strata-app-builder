/**
 * Shared test fakes for map-coupled component tests (Layer 2).
 *
 * The real store (`createStrataStore`) is cheap and dependency-free, so prefer it. These helpers
 * cover the pieces that DO need faking: a minimal maplibre `Map` (event surface only) and a small
 * OperationalLayer factory.
 */
import type { OperationalLayer } from "@strata/schema";

/** A minimal maplibre-gl Map stub: the exact surface StatusBar/MeasureControl touch. */
export interface FakeMap {
  getZoom(): number;
  getCenter(): { lat: number; lng: number };
  getCanvas(): { style: Record<string, string> };
  on(ev: string, fn: (e: any) => void): void;
  off(ev: string, fn: (e: any) => void): void;
  /** Test-only: invoke every handler registered for `ev`. */
  __emit(ev: string, e: any): void;
}

export function fakeMap(opts: { zoom?: number; lat?: number } = {}): FakeMap {
  const handlers: Record<string, Array<(e: any) => void>> = {};
  const canvasStyle: Record<string, string> = {};
  return {
    getZoom: () => opts.zoom ?? 4.5,
    getCenter: () => ({ lat: opts.lat ?? 40, lng: 0 }),
    getCanvas: () => ({ style: canvasStyle }),
    on(ev, fn) {
      (handlers[ev] ??= []).push(fn);
    },
    off(ev, fn) {
      handlers[ev] = (handlers[ev] ?? []).filter((h) => h !== fn);
    },
    __emit(ev, e) {
      (handlers[ev] ?? []).forEach((fn) => fn(e));
    },
  };
}

/** Build a minimal OperationalLayer for panel tests. */
export function layer(id: string, extra: Partial<OperationalLayer> = {}): OperationalLayer {
  return {
    id,
    title: id,
    layerType: "ArcGISFeatureLayer",
    url: `https://example.com/rest/services/${id}/FeatureServer/0`,
    visibility: true,
    ...extra,
  } as OperationalLayer;
}
