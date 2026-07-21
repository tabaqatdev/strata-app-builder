/**
 * MeasureControl — distance/area measurement via Terra Draw + Turf (MIT).
 *
 * Renders a small on-map button that arms a line (distance) or polygon (area) measurement. While
 * armed it sets the store's `interactionMode` to `"measure"` and switches the cursor to a crosshair;
 * on finish (a completed geometry) or when the control is toggled off / unmounted, it **reverts the
 * mode to `"identify"`** and restores the default cursor — the fix for the "control doesn't return
 * the cursor to identify" bug.
 *
 * Terra Draw + Turf + the maplibre adapter are OPTIONAL peer deps, lazy-loaded; when missing the
 * control renders disabled and warns (see terraDraw.ts).
 */
import React, { useEffect, useRef, useState } from "react";
import type { StrataStore } from "@strata/state";
import { loadTerraDraw, type TerraDrawModules } from "./terraDraw.js";
import type { ControlContext } from "./NativeControls.js";

export interface MeasureControlProps extends ControlContext {
  /** Store whose `interactionMode` this control drives (set → "measure", reset → "identify"). */
  store: StrataStore;
  /** Distance/area units for the readout. Defaults to metric (km / km²). */
  units?: "metric" | "imperial";
  className?: string;
  style?: React.CSSProperties;
}

type MeasureKind = "distance" | "area" | null;

export function MeasureControl(props: MeasureControlProps): React.ReactElement {
  const { map, maplibregl, store } = props;
  const [kind, setKind] = useState<MeasureKind>(null);
  const [readout, setReadout] = useState<string>("");
  const drawRef = useRef<any>(null);
  const modsRef = useRef<TerraDrawModules | null>(null);
  const unavailableRef = useRef(false);
  // Optional peers (terra-draw / @turf/turf) may be absent. Probe once; hide the control if missing so
  // the buttons aren't a confusing no-op. Optimistic until the probe resolves.
  const [available, setAvailable] = useState(true);

  // Reset mode + cursor whenever measuring stops (toggle off, finish, or unmount).
  const stop = (): void => {
    const draw = drawRef.current;
    if (draw) {
      try {
        draw.stop();
      } catch {
        /* already stopped */
      }
    }
    drawRef.current = null;
    setDefaultCursor(map);
    store.getState().setInteractionMode("identify");
  };

  useEffect(() => () => stop(), []); // cleanup on unmount

  useEffect(() => {
    let alive = true;
    void loadTerraDraw().then((m) => {
      if (!alive) return;
      modsRef.current = m;
      setAvailable(!!m);
    });
    return () => { alive = false; };
  }, []);

  const start = async (which: Exclude<MeasureKind, null>): Promise<void> => {
    if (unavailableRef.current) return;
    const mods = modsRef.current ?? (await loadTerraDraw());
    if (!mods) {
      unavailableRef.current = true;
      return;
    }
    modsRef.current = mods;
    stop(); // clear any prior session

    const { TerraDraw, modes, adapterFactory, turf } = mods;
    const draw = new TerraDraw({
      adapter: adapterFactory({ map, maplibregl }),
      modes: [new modes.TerraDrawLineStringMode(), new modes.TerraDrawPolygonMode()],
    });
    drawRef.current = draw;
    draw.start();
    draw.setMode(which === "distance" ? "linestring" : "polygon");
    setCrosshair(map);
    store.getState().setInteractionMode("measure");

    // On a finished geometry, compute + show the measurement, then return to identify.
    draw.on("finish", () => {
      try {
        const snapshot = draw.getSnapshot?.() ?? [];
        const feature = snapshot[snapshot.length - 1];
        if (feature) setReadout(measure(feature, which, turf, props.units ?? "metric"));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[strata] measure compute failed", e);
      }
      setKind(null);
      stop();
    });
  };

  const toggle = (which: Exclude<MeasureKind, null>): void => {
    if (kind === which) {
      setKind(null);
      stop();
    } else {
      setKind(which);
      setReadout("");
      void start(which);
    }
  };

  if (!available) return <></>; // optional peers absent — don't show dead buttons

  return (
    <div className={props.className} style={{ ...wrapStyle, ...props.style }}>
      <button
        type="button"
        style={{ ...btnStyle, ...(kind === "distance" ? activeStyle : null) }}
        title="Measure distance"
        onClick={() => toggle("distance")}
      >
        ↔ Distance
      </button>
      <button
        type="button"
        style={{ ...btnStyle, ...(kind === "area" ? activeStyle : null) }}
        title="Measure area"
        onClick={() => toggle("area")}
      >
        ▱ Area
      </button>
      {readout && <span style={readoutStyle}>{readout}</span>}
    </div>
  );
}

/** Compute a distance/area readout for a finished GeoJSON feature using Turf. */
function measure(feature: any, which: "distance" | "area", turf: any, units: "metric" | "imperial"): string {
  if (which === "distance") {
    const km = turf.length(feature, { units: "kilometers" });
    return units === "imperial"
      ? `${(km * 0.621371).toFixed(2)} mi`
      : km < 1
        ? `${(km * 1000).toFixed(0)} m`
        : `${km.toFixed(2)} km`;
  }
  const m2 = turf.area(feature); // square meters
  return units === "imperial"
    ? `${(m2 / 2_589_988.11).toFixed(3)} mi²`
    : m2 < 1_000_000
      ? `${m2.toFixed(0)} m²`
      : `${(m2 / 1_000_000).toFixed(2)} km²`;
}

function setCrosshair(map: any): void {
  if (map?.getCanvas) map.getCanvas().style.cursor = "crosshair";
}
function setDefaultCursor(map: any): void {
  if (map?.getCanvas) map.getCanvas().style.cursor = "";
}

const wrapStyle: React.CSSProperties = { display: "flex", gap: 6, alignItems: "center" };
const btnStyle: React.CSSProperties = {
  font: "12px system-ui, sans-serif",
  padding: "4px 8px",
  border: "1px solid #d5d5d5",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
};
const activeStyle: React.CSSProperties = { background: "#2b6cb0", color: "#fff", borderColor: "#2b6cb0" };
const readoutStyle: React.CSSProperties = { font: "12px system-ui, sans-serif", color: "#333" };

export default MeasureControl;
