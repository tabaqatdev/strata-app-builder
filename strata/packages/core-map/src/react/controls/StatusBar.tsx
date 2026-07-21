/**
 * @strata/core-map — StatusBar (MIT).
 *
 * A GeoLibre-style map **status bar**: live cursor **coordinates**, **zoom** level, map **scale** (1:N),
 * and the **coordinate system** (CRS) label. Reads the MapLibre map's `mousemove` + `move`/`zoom` events.
 * A thin, dependency-free React overlay; pass the live `map` (e.g. from `useStrataMap`/`StrataMapHandle`).
 *
 * Also available as a plugin: `@strata/plugin-statusbar` (plain-DOM, for the plugin/marketplace route and
 * non-React hosts).
 */
import React, { useEffect, useState } from "react";

export interface StatusBarProps {
  /** the maplibre-gl Map instance. */
  map: any;
  /** CRS label shown at the end. Default "EPSG:4326". */
  crs?: string;
  /** decimal places for lng/lat. Default 5 (~1 m). */
  precision?: number;
  showCoords?: boolean;
  showZoom?: boolean;
  showScale?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Web-Mercator scale denominator (1:N) at a given latitude + zoom, ~96 dpi. */
function scaleDenominator(lat: number, zoom: number): number {
  const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
  return Math.round(metersPerPixel * 3779.5275591); // px/m at 96 dpi
}

export function StatusBar(props: StatusBarProps): React.ReactElement | null {
  const {
    map,
    crs = "EPSG:4326",
    precision = 5,
    showCoords = true,
    showZoom = true,
    showScale = true,
  } = props;
  const [lngLat, setLngLat] = useState<{ lng: number; lat: number } | null>(null);
  const [zoom, setZoom] = useState<number>(() => (map?.getZoom ? map.getZoom() : 0));

  useEffect(() => {
    if (!map) return;
    const onMove = (e: any) => setLngLat({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    const onLeave = () => setLngLat(null);
    const onZoom = () => setZoom(map.getZoom());
    map.on("mousemove", onMove);
    map.on("mouseout", onLeave);
    map.on("zoom", onZoom);
    map.on("move", onZoom);
    setZoom(map.getZoom());
    return () => {
      map.off("mousemove", onMove);
      map.off("mouseout", onLeave);
      map.off("zoom", onZoom);
      map.off("move", onZoom);
    };
  }, [map]);

  const centerLat = lngLat?.lat ?? (map?.getCenter ? map.getCenter().lat : 0);
  const scale = showScale ? scaleDenominator(centerLat, zoom) : 0;

  return (
    <div
      className={props.className}
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "2px 10px",
        font: "11px/1.6 var(--strata-mono, ui-monospace, monospace)",
        color: "var(--strata-fg, #e8eef5)",
        background: "var(--strata-panel-bg, #1a1f27)cc",
        borderTop: "1px solid var(--strata-border, #2a2f3a)",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        ...props.style,
      }}
      data-strata-statusbar
    >
      {showCoords && (
        <span title="cursor coordinates">
          {lngLat
            ? `${lngLat.lng.toFixed(precision)}, ${lngLat.lat.toFixed(precision)}`
            : "—, —"}
        </span>
      )}
      {showZoom && <span title="zoom level">z {zoom.toFixed(2)}</span>}
      {showScale && <span title="map scale">1:{scale.toLocaleString()}</span>}
      <span style={{ marginLeft: "auto", opacity: 0.75 }} title="coordinate system">
        {crs}
      </span>
    </div>
  );
}

export default StatusBar;
