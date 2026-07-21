/**
 * SketchControl — freehand point/line/polygon drawing via Terra Draw (MIT).
 *
 * A small on-map toolbar to draw point / line / polygon features. While a draw mode is armed it sets
 * the store's `interactionMode` to `"sketch"` and shows a crosshair cursor; when drawing is toggled
 * off, the control is closed, or the component unmounts, it **reverts the mode to `"identify"`** and
 * restores the default cursor. Completed geometries are handed to `onChange` as a GeoJSON
 * FeatureCollection.
 *
 * Terra Draw + the maplibre adapter are OPTIONAL peer deps, lazy-loaded; when missing the control
 * renders disabled and warns (see terraDraw.ts).
 */
import React, { useEffect, useRef, useState } from "react";
import type { StrataStore } from "@strata/state";
import { loadTerraDraw, type TerraDrawModules } from "./terraDraw.js";
import type { ControlContext } from "./NativeControls.js";

export interface SketchControlProps extends ControlContext {
  /** Store whose `interactionMode` this control drives (set → "sketch", reset → "identify"). */
  store: StrataStore;
  /** Notified with the current sketch as a GeoJSON FeatureCollection whenever it changes. */
  onChange?: (featureCollection: { type: "FeatureCollection"; features: any[] }) => void;
  className?: string;
  style?: React.CSSProperties;
}

type SketchTool = "point" | "line" | "polygon" | null;
const MODE_FOR: Record<Exclude<SketchTool, null>, string> = {
  point: "point",
  line: "linestring",
  polygon: "polygon",
};

export function SketchControl(props: SketchControlProps): React.ReactElement {
  const { map, maplibregl, store } = props;
  const [tool, setTool] = useState<SketchTool>(null);
  const drawRef = useRef<any>(null);
  const modsRef = useRef<TerraDrawModules | null>(null);
  const unavailableRef = useRef(false);
  // Optional peers (terra-draw / @turf/turf) may be absent. Probe once; hide the control if missing.
  const [available, setAvailable] = useState(true);

  const emit = (): void => {
    const draw = drawRef.current;
    if (!draw || !props.onChange) return;
    try {
      const features = draw.getSnapshot?.() ?? [];
      props.onChange({ type: "FeatureCollection", features });
    } catch {
      /* ignore */
    }
  };

  // Revert mode + cursor whenever sketching stops (toggle off, close, or unmount).
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

  const arm = async (which: Exclude<SketchTool, null>): Promise<void> => {
    if (unavailableRef.current) return;
    const mods = modsRef.current ?? (await loadTerraDraw());
    if (!mods) {
      unavailableRef.current = true;
      return;
    }
    modsRef.current = mods;

    if (!drawRef.current) {
      const { TerraDraw, modes, adapterFactory } = mods;
      const draw = new TerraDraw({
        adapter: adapterFactory({ map, maplibregl }),
        modes: [
          new modes.TerraDrawPointMode(),
          new modes.TerraDrawLineStringMode(),
          new modes.TerraDrawPolygonMode(),
          new modes.TerraDrawSelectMode(),
        ],
      });
      draw.start();
      draw.on("finish", emit);
      draw.on("change", emit);
      drawRef.current = draw;
    }
    drawRef.current.setMode(MODE_FOR[which]);
    setCrosshair(map);
    store.getState().setInteractionMode("sketch");
  };

  const toggle = (which: Exclude<SketchTool, null>): void => {
    if (tool === which) {
      setTool(null);
      stop();
    } else {
      setTool(which);
      void arm(which);
    }
  };

  const clear = (): void => {
    try {
      drawRef.current?.clear?.();
    } catch {
      /* ignore */
    }
    emit();
    setTool(null);
    stop();
  };

  if (!available) return <></>; // optional peers absent — don't show dead buttons

  return (
    <div className={props.className} style={{ ...wrapStyle, ...props.style }}>
      {(["point", "line", "polygon"] as const).map((t) => (
        <button
          key={t}
          type="button"
          style={{ ...btnStyle, ...(tool === t ? activeStyle : null) }}
          title={`Draw ${t}`}
          onClick={() => toggle(t)}
        >
          {t === "point" ? "•" : t === "line" ? "／" : "▱"}
        </button>
      ))}
      <button type="button" style={btnStyle} title="Clear sketch" onClick={clear}>
        Clear
      </button>
    </div>
  );
}

function setCrosshair(map: any): void {
  if (map?.getCanvas) map.getCanvas().style.cursor = "crosshair";
}
function setDefaultCursor(map: any): void {
  if (map?.getCanvas) map.getCanvas().style.cursor = "";
}

const wrapStyle: React.CSSProperties = { display: "flex", gap: 6, alignItems: "center" };
const btnStyle: React.CSSProperties = {
  font: "13px system-ui, sans-serif",
  minWidth: 28,
  padding: "4px 8px",
  border: "1px solid #d5d5d5",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
};
const activeStyle: React.CSSProperties = { background: "#2b6cb0", color: "#fff", borderColor: "#2b6cb0" };

export default SketchControl;
