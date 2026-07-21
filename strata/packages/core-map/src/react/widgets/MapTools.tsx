/**
 * @strata/core-map — droppable map-tool widgets (Phase 7, MIT).
 *
 * These wrap the existing map controls so a recipe can place them anywhere in the layout (a sidebar, a
 * panel) instead of only on the map. They reach the live map through the app's `MapRegistry` via
 * `useMapInstance(mapId)` (defaults to the first `map` widget), and pull `store`/`maplibregl` from the
 * injected context. Until the map is ready they render a small placeholder.
 */
import React, { useEffect, useState } from "react";
import type { StrataStore } from "@strata/state";
import { exportImage, exportPDF } from "@strata/export";
import { MeasureControl, SketchControl } from "../controls/index.js";
import { useMapInstance } from "../app/interactivity.js";

/** Structural view of a geocoding provider (inject `@strata/plugin-search`'s `nominatimProvider()`). */
export interface SearchLike {
  search: (query: string, opts?: { limit?: number }) => Promise<Array<{ label: string; lng: number; lat: number; bbox?: [number, number, number, number] }>>;
}
/** Structural view of a routing provider (inject `@strata/plugin-routing`'s `osrmProvider()`). */
export interface RouteLike {
  route: (waypoints: Array<[number, number]>, opts?: { profile?: string }) => Promise<{ geometry: unknown; distanceMeters: number; durationSeconds: number }>;
}

const inputStyle: React.CSSProperties = {
  font: "inherit",
  fontSize: 13,
  padding: "6px 8px",
  border: "1px solid var(--strata-border, rgba(255,255,255,0.16))",
  borderRadius: "var(--strata-radius-sm, 6px)",
  background: "var(--strata-panel-bg, #12151b)",
  color: "var(--strata-fg, #e8ecf1)",
  width: "100%",
  minWidth: 0,
};
const btnStyle: React.CSSProperties = {
  font: "inherit",
  fontSize: 13,
  fontWeight: 600,
  padding: "6px 12px",
  border: "none",
  borderRadius: "var(--strata-radius-sm, 6px)",
  background: "var(--strata-primary, var(--strata-accent, #4ea1ff))",
  color: "var(--strata-primary-contrast, #0b0e13)",
  cursor: "pointer",
};

function ToolPlaceholder(props: { label: string }): React.ReactElement {
  return (
    <div
      style={{
        padding: "8px 10px",
        fontSize: 12,
        color: "var(--strata-muted, #8b95a5)",
        border: "1px dashed var(--strata-border, rgba(255,255,255,0.12))",
        borderRadius: "var(--strata-radius-sm, 6px)",
      }}
    >
      {props.label} — connecting to map…
    </div>
  );
}

export interface MeasureWidgetProps {
  /** Which `map` widget to drive (its id); defaults to the first map. */
  mapId?: string;
  store?: StrataStore;
  maplibregl?: unknown;
  units?: "metric" | "imperial";
  style?: React.CSSProperties;
  className?: string;
}

/** `measure` — distance/area measuring, placeable anywhere; drives a target `map` via the registry. */
export function MeasureWidget(props: MeasureWidgetProps): React.ReactElement {
  const map = useMapInstance(props.mapId);
  if (!map || !props.store) return <ToolPlaceholder label="Measure" />;
  return (
    <MeasureControl
      map={map}
      maplibregl={props.maplibregl}
      store={props.store}
      units={props.units}
      style={props.style}
      className={props.className}
    />
  );
}

export interface DrawWidgetProps {
  mapId?: string;
  store?: StrataStore;
  maplibregl?: unknown;
  onChange?: (featureCollection: { type: "FeatureCollection"; features: unknown[] }) => void;
  style?: React.CSSProperties;
  className?: string;
}

/** `draw` — sketch/annotation, placeable anywhere; drives a target `map` via the registry. */
export function DrawWidget(props: DrawWidgetProps): React.ReactElement {
  const map = useMapInstance(props.mapId);
  if (!map || !props.store) return <ToolPlaceholder label="Draw" />;
  return (
    <SketchControl
      map={map}
      maplibregl={props.maplibregl}
      store={props.store}
      onChange={props.onChange}
      style={props.style}
      className={props.className}
    />
  );
}

const label = (t: string): React.ReactElement => <b style={{ color: "var(--strata-muted, #8b95a5)", fontWeight: 600 }}>{t}</b>;

export interface CoordinatesWidgetProps {
  mapId?: string;
  precision?: number;
  style?: React.CSSProperties;
  className?: string;
}

/** `coordinates` — a live lng/lat/zoom/CRS readout for a target `map`. */
export function CoordinatesWidget(props: CoordinatesWidgetProps): React.ReactElement {
  const map = useMapInstance(props.mapId) as { getCenter: () => { lng: number; lat: number }; getZoom: () => number; on: (e: string, f: () => void) => void; off: (e: string, f: () => void) => void } | undefined;
  const [c, setC] = useState<{ lng: number; lat: number; zoom: number } | null>(null);
  useEffect(() => {
    if (!map) return;
    const upd = (): void => {
      const ctr = map.getCenter();
      setC({ lng: ctr.lng, lat: ctr.lat, zoom: map.getZoom() });
    };
    upd();
    map.on("move", upd);
    return () => map.off("move", upd);
  }, [map]);
  if (!map || !c) return <ToolPlaceholder label="Coordinates" />;
  const p = props.precision ?? 5;
  return (
    <div style={{ display: "flex", gap: 12, fontSize: 12, fontFamily: "var(--strata-mono, monospace)", color: "var(--strata-fg, #e8ecf1)", ...props.style }} className={props.className}>
      <span>{label("lng")} {c.lng.toFixed(p)}</span>
      <span>{label("lat")} {c.lat.toFixed(p)}</span>
      <span>{label("z")} {c.zoom.toFixed(1)}</span>
      <span>{label("CRS")} EPSG:4326</span>
    </div>
  );
}

export interface SearchWidgetProps {
  mapId?: string;
  /** Inject a geocoding provider (e.g. `@strata/plugin-search`'s `nominatimProvider()`). */
  provider?: SearchLike;
  placeholder?: string;
  limit?: number;
  style?: React.CSSProperties;
  className?: string;
}

/** `search` — a geocode box; picking a result flies/fits a target `map`. */
export function SearchWidget(props: SearchWidgetProps): React.ReactElement {
  const map = useMapInstance(props.mapId) as { fitBounds: (b: unknown, o?: unknown) => void; flyTo: (o: unknown) => void } | undefined;
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Array<{ label: string; lng: number; lat: number; bbox?: [number, number, number, number] }>>([]);
  const [busy, setBusy] = useState(false);
  if (!props.provider) return <ToolPlaceholder label="Search — inject a provider" />;
  const run = async (): Promise<void> => {
    if (!q.trim()) return;
    setBusy(true);
    try {
      setResults(await props.provider!.search(q, { limit: props.limit ?? 5 }));
    } finally {
      setBusy(false);
    }
  };
  const pick = (r: { lng: number; lat: number; bbox?: [number, number, number, number] }): void => {
    if (!map) return;
    if (r.bbox) map.fitBounds([[r.bbox[0], r.bbox[1]], [r.bbox[2], r.bbox[3]]], { padding: 40, maxZoom: 16 });
    else map.flyTo({ center: [r.lng, r.lat], zoom: 13 });
    setResults([]);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...props.style }} className={props.className}>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          style={inputStyle}
          value={q}
          aria-label="Search"
          placeholder={props.placeholder ?? "Search places…"}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void run()}
        />
        <button style={btnStyle} disabled={busy} onClick={() => void run()}>
          {busy ? "…" : "Go"}
        </button>
      </div>
      {results.length > 0 ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, border: "1px solid var(--strata-border, rgba(255,255,255,0.12))", borderRadius: "var(--strata-radius-sm, 6px)", overflow: "hidden" }}>
          {results.map((r, i) => (
            <li key={i}>
              <button
                style={{ display: "block", width: "100%", textAlign: "left", font: "inherit", fontSize: 12, padding: "6px 8px", border: "none", background: "transparent", color: "var(--strata-fg, #e8ecf1)", cursor: "pointer" }}
                onClick={() => pick(r)}
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export interface DirectionsWidgetProps {
  mapId?: string;
  /** Inject a geocoding provider (for the from/to text) and a routing provider. */
  search?: SearchLike;
  routing?: RouteLike;
  profile?: "driving" | "walking" | "cycling";
  style?: React.CSSProperties;
  className?: string;
}

/** `directions` — geocode a from/to, route between them, and draw the line on a target `map`. */
export function DirectionsWidget(props: DirectionsWidgetProps): React.ReactElement {
  const map = useMapInstance(props.mapId) as any;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!props.search || !props.routing) return <ToolPlaceholder label="Directions — inject search + routing" />;
  const geocode = async (t: string): Promise<[number, number] | null> => {
    const r = await props.search!.search(t, { limit: 1 });
    return r[0] ? [r[0].lng, r[0].lat] : null;
  };
  const run = async (): Promise<void> => {
    if (!from.trim() || !to.trim() || !map) return;
    setBusy(true);
    setInfo(null);
    try {
      const a = await geocode(from);
      const b = await geocode(to);
      if (!a || !b) {
        setInfo("Couldn't geocode one of the places.");
        return;
      }
      const route = await props.routing!.route([a, b], { profile: props.profile ?? "driving" });
      const data = { type: "Feature", geometry: route.geometry, properties: {} };
      if (map.getSource("strata-route")) map.getSource("strata-route").setData(data);
      else {
        map.addSource("strata-route", { type: "geojson", data });
        map.addLayer({ id: "strata-route", type: "line", source: "strata-route", paint: { "line-color": "#4ea1ff", "line-width": 4, "line-opacity": 0.85 } });
      }
      map.fitBounds([a, b], { padding: 60 });
      setInfo(`${(route.distanceMeters / 1000).toFixed(1)} km · ${Math.round(route.durationSeconds / 60)} min`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...props.style }} className={props.className}>
      <input style={inputStyle} value={from} aria-label="From" placeholder="From…" onChange={(e) => setFrom(e.target.value)} />
      <input style={inputStyle} value={to} aria-label="To" placeholder="To…" onChange={(e) => setTo(e.target.value)} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button style={btnStyle} disabled={busy} onClick={() => void run()}>
          {busy ? "Routing…" : "Route"}
        </button>
        {info ? <span style={{ fontSize: 12, color: "var(--strata-muted, #8b95a5)" }}>{info}</span> : null}
      </div>
    </div>
  );
}

function downloadDataUrl(url: string, name: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

export interface PrintWidgetProps {
  mapId?: string;
  title?: string;
  /** High-DPI scale for the PNG (default 2). */
  scale?: number;
  style?: React.CSSProperties;
  className?: string;
}

/** `print` — export the target `map` as a PNG or a composed PDF (via `@strata/export`). */
export function PrintWidget(props: PrintWidgetProps): React.ReactElement {
  const map = useMapInstance(props.mapId);
  if (!map) return <ToolPlaceholder label="Print / Export" />;
  const png = (): void => {
    try {
      downloadDataUrl(exportImage({ map, scale: props.scale ?? 2 }), "map.png");
    } catch (e) {
      console.warn("[strata] PNG export failed (map may need preserveDrawingBuffer):", e);
    }
  };
  const pdf = (): void => {
    void exportPDF({ map, title: props.title, legend: false, scalebar: true, northArrow: true }).catch((e) =>
      console.warn("[strata] PDF export failed:", e),
    );
  };
  return (
    <div style={{ display: "flex", gap: 6, ...props.style }} className={props.className}>
      <button style={btnStyle} onClick={png}>
        Export PNG
      </button>
      <button
        style={{ ...btnStyle, background: "transparent", color: "var(--strata-fg, #e8ecf1)", border: "1px solid var(--strata-border, rgba(255,255,255,0.16))" }}
        onClick={pdf}
      >
        Export PDF
      </button>
    </div>
  );
}
