/**
 * AnalysisWidgets — Near Me, Add Data, Weighted Overlay, and Elevation Profile ([ExB] Phase 4, MIT).
 *
 * UI-only widgets that drive analysis via callbacks (the app runs the actual query / `@strata/processing`
 * op / loader), so `@strata/core-map` stays dependency-light. Each is registered for `<StrataApp>`.
 */
import React, { useState } from "react";
import { MiniChart } from "../panels/ChartPanel.js";

// --- Near Me -----------------------------------------------------------------------------------

export interface NearMeResult {
  label: string;
  distanceKm?: number;
  oid?: number;
}

export interface NearMeProps {
  /** Run the proximity search around a center for a radius (km); return matches. */
  onSearch: (center: [number, number], km: number) => Promise<NearMeResult[]> | NearMeResult[];
  /** Resolve the user's location; defaults to the browser Geolocation API. */
  onLocate?: () => Promise<[number, number]>;
  /** A result was clicked (zoom/highlight). */
  onSelect?: (r: NearMeResult) => void;
  defaultKm?: number;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

function browserLocate(): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return reject(new Error("no geolocation"));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve([p.coords.longitude, p.coords.latitude]),
      (e) => reject(e),
    );
  });
}

export function NearMe(props: NearMeProps): React.ReactElement {
  const [km, setKm] = useState(props.defaultKm ?? 2);
  const [results, setResults] = useState<NearMeResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const center = await (props.onLocate ?? browserLocate)();
      setResults(await props.onSearch(center, km));
    } catch (e) {
      setError((e as Error)?.message ?? "search failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={props.className} style={{ display: "flex", flexDirection: "column", gap: 8, ...props.style }}>
      {props.title ? <div style={{ fontWeight: 600, fontSize: 12, opacity: 0.8 }}>{props.title}</div> : null}
      <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
        Within
        <input type="range" min={0.5} max={25} step={0.5} value={km} onChange={(e) => setKm(Number(e.target.value))} style={{ flex: 1 }} />
        <span style={{ width: 52, textAlign: "end" }}>{km} km</span>
      </label>
      <button type="button" onClick={run} disabled={busy} style={primaryBtn}>
        {busy ? "Searching…" : "📍 Find near me"}
      </button>
      {error && <div style={{ color: "var(--strata-critical,#e53e3e)", fontSize: 12 }}>{error}</div>}
      {results && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {results.length === 0 && <li style={{ fontSize: 12, opacity: 0.6 }}>Nothing within {km} km.</li>}
          {results.map((r, i) => (
            <li key={i}>
              <button type="button" onClick={() => props.onSelect?.(r)} style={rowBtn}>
                {r.label}
                {r.distanceKm != null ? <span style={{ opacity: 0.6 }}> · {r.distanceKm.toFixed(1)} km</span> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Add Data (runtime) ------------------------------------------------------------------------

export interface AddDataWidgetProps {
  /** Add a layer from a user-supplied source. `kind` is inferred from the URL. */
  onAddLayer: (spec: { url: string; kind: "arcgis-feature" | "geojson"; title: string }) => void;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function AddDataWidget(props: AddDataWidgetProps): React.ReactElement {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const add = (): void => {
    const u = url.trim();
    if (!u) return;
    // A FeatureServer/MapServer layer URL → arcgis-feature; anything else (.geojson/.json) → geojson.
    const kind: "arcgis-feature" | "geojson" = /FeatureServer|MapServer/i.test(u) ? "arcgis-feature" : "geojson";
    props.onAddLayer({ url: u, kind, title: title.trim() || u.split("/").filter(Boolean).pop() || "Layer" });
    setUrl("");
    setTitle("");
  };

  return (
    <div className={props.className} style={{ display: "flex", flexDirection: "column", gap: 6, ...props.style }}>
      {props.title ? <div style={{ fontWeight: 600, fontSize: 12, opacity: 0.8 }}>{props.title}</div> : null}
      <input placeholder="Layer title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
      <input
        placeholder="FeatureServer/0 or GeoJSON URL"
        value={url}
        aria-label="Data URL"
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
        style={inputStyle}
      />
      <button type="button" onClick={add} disabled={!url.trim()} style={primaryBtn}>
        Add layer
      </button>
    </div>
  );
}

// --- Weighted Overlay (suitability) ------------------------------------------------------------

export interface WeightedCriterion {
  field: string;
  label?: string;
  weight: number;
}

export interface WeightedOverlayPanelProps {
  criteria: WeightedCriterion[];
  /** Called with the current weights whenever a slider moves (the app runs `weightedOverlay`). */
  onChange?: (criteria: WeightedCriterion[]) => void;
  /** "Apply" button — run the suitability computation. */
  onApply?: (criteria: WeightedCriterion[]) => void;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function WeightedOverlayPanel(props: WeightedOverlayPanelProps): React.ReactElement {
  const [criteria, setCriteria] = useState<WeightedCriterion[]>(props.criteria);
  const total = criteria.reduce((a, c) => a + Math.abs(c.weight), 0) || 1;

  const setWeight = (i: number, weight: number): void => {
    const next = criteria.map((c, j) => (j === i ? { ...c, weight } : c));
    setCriteria(next);
    props.onChange?.(next);
  };

  return (
    <div className={props.className} style={{ display: "flex", flexDirection: "column", gap: 8, ...props.style }}>
      {props.title ? <div style={{ fontWeight: 600, fontSize: 12, opacity: 0.8 }}>{props.title}</div> : null}
      {criteria.map((c, i) => (
        <label key={c.field} style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{c.label ?? c.field}</span>
            <span style={{ opacity: 0.6 }}>{Math.round((Math.abs(c.weight) / total) * 100)}%</span>
          </span>
          <input type="range" min={0} max={10} step={1} value={c.weight} aria-label={c.label ?? c.field} onChange={(e) => setWeight(i, Number(e.target.value))} />
        </label>
      ))}
      <button type="button" onClick={() => props.onApply?.(criteria)} style={primaryBtn}>
        Compute suitability
      </button>
    </div>
  );
}

// --- Elevation Profile -------------------------------------------------------------------------

/**
 * Decode a Mapzen/AWS **terrarium** RGB terrain pixel to metres of elevation:
 * `(R*256 + G + B/256) − 32768`. Pure — the app samples terrarium tiles along a line and passes the
 * decoded elevations to {@link ElevationProfile}.
 */
export function terrariumToElevation(r: number, g: number, b: number): number {
  return r * 256 + g + b / 256 - 32768;
}

export interface ElevationSample {
  /** Cumulative distance along the line (km). */
  distanceKm: number;
  elevation: number;
}

export interface ElevationProfileProps {
  samples: ElevationSample[];
  title?: string;
  height?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function ElevationProfile(props: ElevationProfileProps): React.ReactElement {
  const { samples } = props;
  const data = samples.map((s) => ({ label: s.distanceKm.toFixed(1), value: s.elevation }));
  const gain = samples.reduce((acc, s, i) => (i > 0 ? acc + Math.max(0, s.elevation - samples[i - 1].elevation) : 0), 0);
  const last = samples[samples.length - 1];
  return (
    <div className={props.className} style={{ display: "flex", flexDirection: "column", gap: 4, ...props.style }}>
      {props.title ? <div style={{ fontWeight: 600, fontSize: 12, opacity: 0.8 }}>{props.title}</div> : null}
      {samples.length ? (
        <>
          <MiniChart kind="line" data={data} height={props.height ?? 120} />
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            {last ? `${last.distanceKm.toFixed(1)} km` : ""} · +{Math.round(gain)} m gain
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, opacity: 0.6 }}>Draw a line to see its elevation profile.</div>
      )}
    </div>
  );
}

// --- shared styles -----------------------------------------------------------------------------

const inputStyle: React.CSSProperties = {
  font: "inherit",
  fontSize: 12,
  padding: "5px 7px",
  border: "1px solid var(--strata-border, #d5d5d5)",
  borderRadius: 4,
  background: "var(--strata-panel-bg, #fff)",
  color: "var(--strata-fg, inherit)",
};
const primaryBtn: React.CSSProperties = {
  font: "inherit",
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 10px",
  border: "none",
  borderRadius: 6,
  background: "var(--strata-accent, #2b6cb0)",
  color: "#fff",
  cursor: "pointer",
};
const rowBtn: React.CSSProperties = {
  width: "100%",
  textAlign: "start",
  font: "inherit",
  fontSize: 13,
  padding: "5px 8px",
  borderRadius: 6,
  border: "1px solid var(--strata-border, rgba(255,255,255,0.10))",
  background: "transparent",
  color: "var(--strata-fg, inherit)",
  cursor: "pointer",
};
