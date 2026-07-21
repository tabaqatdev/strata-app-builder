/**
 * NativeControls — thin React wrappers over MapLibre's built-in controls (MIT).
 *
 * Each component mounts a `maplibregl.*Control` onto the map via `map.addControl(...)` on mount and
 * removes it on unmount. They render nothing themselves (MapLibre owns the DOM). The `maplibregl`
 * module and the live `map` are injected (peer-dependency-free template convention).
 *
 * These are wired into `<StrataMap>` through its `controls` prop, but are also exported for direct
 * use when composing a bespoke control bar.
 */
import { useEffect } from "react";

/** A MapLibre map + the injected maplibregl module — shared by every control wrapper. */
export interface ControlContext {
  /** The live maplibre-gl Map instance. */
  map: any;
  /** The maplibre-gl module (peer dependency, injected). */
  maplibregl: any;
}

/** Corner placement passed straight to `map.addControl(control, position)`. */
export type ControlPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/**
 * Generic mount hook: construct a control via `make`, add it at `position`, and remove it on
 * cleanup. Re-runs only when the map or position changes.
 */
function useControl(
  ctx: ControlContext,
  make: (mgl: any) => any,
  position: ControlPosition = "top-right",
): void {
  const { map, maplibregl } = ctx;
  useEffect(() => {
    if (!map || !maplibregl) return;
    let control: any;
    try {
      control = make(maplibregl);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[strata] control unavailable", e);
      return;
    }
    map.addControl(control, position);
    return () => {
      try {
        map.removeControl(control);
      } catch {
        /* already removed with the map */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, maplibregl, position]);
}

export interface NativeControlProps extends ControlContext {
  position?: ControlPosition;
}

/** Zoom in/out + compass reset (MapLibre `NavigationControl`). */
export function NavigationControl(props: NativeControlProps): null {
  useControl(props, (mgl) => new mgl.NavigationControl({ showCompass: true, visualizePitch: false }), props.position);
  return null;
}

/** Locate the user (MapLibre `GeolocateControl`). */
export function GeolocateControl(props: NativeControlProps): null {
  useControl(
    props,
    (mgl) =>
      new mgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
    props.position,
  );
  return null;
}

/** Toggle fullscreen (MapLibre `FullscreenControl`). */
export function FullscreenControl(props: NativeControlProps): null {
  useControl(props, (mgl) => new mgl.FullscreenControl(), props.position);
  return null;
}

export interface ScaleControlProps extends NativeControlProps {
  unit?: "metric" | "imperial" | "nautical";
  maxWidth?: number;
}

/** A scale bar (MapLibre `ScaleControl`). */
export function ScaleControl(props: ScaleControlProps): null {
  useControl(
    props,
    (mgl) => new mgl.ScaleControl({ maxWidth: props.maxWidth ?? 100, unit: props.unit ?? "metric" }),
    props.position ?? "bottom-left",
  );
  return null;
}
