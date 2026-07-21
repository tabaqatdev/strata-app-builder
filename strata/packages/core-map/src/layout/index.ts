/**
 * @strata/core-map — layout presets (§4.2, MIT).
 *
 * Real, dependency-light composition helpers over `<StrataMap>`. Each preset renders one (or many)
 * `<StrataMap>` plus its layout chrome, accepts the same props as `<StrataMap>` and passes them
 * through, and adds a small set of layout-specific props. Apps can always hand-roll any layout —
 * these are conveniences that cover the common shapes (full page, sized-in-scroll, split dashboard,
 * multi-map compare).
 *
 * Note on `map.resize()`: MapLibre needs a `resize()` after its container's box changes (mount into a
 * new-sized section, splitter drag). `<StrataMap>` surfaces the live map via `onReady` — but only when
 * a `store` is passed. These presets wrap `onReady` to capture the map when available; when no store is
 * given, the map is sized correctly at mount and no resize is required.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StrataMap, type StrataMapProps, type StrataMapHandle } from "../react/StrataMap.js";

/**
 * Wrap a caller's `onReady` so a preset can capture the live map handle without clobbering the
 * caller's own handler. Returns `[wrappedOnReady, mapRef]`.
 */
function useCapturedMap(
  onReady: StrataMapProps["onReady"],
): [NonNullable<StrataMapProps["onReady"]>, React.MutableRefObject<any>] {
  const mapRef = useRef<any>(null);
  const wrapped = useCallback(
    (api: StrataMapHandle) => {
      mapRef.current = api.map;
      onReady?.(api);
    },
    [onReady],
  );
  return [wrapped, mapRef];
}

/** Call `map.resize()` on the captured map if present (next frame, so the DOM has laid out). */
function resizeSoon(mapRef: React.MutableRefObject<any>): void {
  const map = mapRef.current;
  if (map?.resize) requestAnimationFrame(() => map.resize());
}

/* -------------------------------------------------------------------------------------------------
 * FullPageMap
 * ---------------------------------------------------------------------------------------------- */

/** Map fills its container (put the container at 100vh for a true full-page app). */
export function FullPageMap(props: StrataMapProps): React.ReactElement {
  return React.createElement(
    "div",
    { style: { position: "absolute", inset: 0 } },
    React.createElement(StrataMap, props),
  );
}

/* -------------------------------------------------------------------------------------------------
 * MapInScroll
 * ---------------------------------------------------------------------------------------------- */

export interface MapInScrollProps extends StrataMapProps {
  /** Height of the map section (default `"70vh"`). Numbers are treated as pixels. */
  height?: string | number;
  /** When true, the map section is `position: sticky; top: 0` so it pins while the page scrolls. */
  sticky?: boolean;
  /** Page content that flows below (and scrolls past) the map. */
  children?: React.ReactNode;
}

/**
 * The map as a sized section inside a scrollable page. Renders the map at `height`, optionally
 * sticky-pinned to the top, with `children` (page content) flowing below. Calls `map.resize()`
 * after mount so MapLibre picks up its section box.
 */
export function MapInScroll(props: MapInScrollProps): React.ReactElement {
  const { height = "70vh", sticky = false, children, onReady, ...mapProps } = props;
  const [wrappedOnReady, mapRef] = useCapturedMap(onReady);

  useEffect(() => {
    resizeSoon(mapRef);
    // Height changes can alter the section box; resize again.
  }, [height, sticky, mapRef]);

  const sectionStyle: React.CSSProperties = {
    position: sticky ? "sticky" : "relative",
    top: sticky ? 0 : undefined,
    height: typeof height === "number" ? `${height}px` : height,
    width: "100%",
    zIndex: sticky ? 1 : undefined,
  };

  return React.createElement(
    "div",
    { style: { width: "100%" } },
    React.createElement(
      "div",
      { style: sectionStyle },
      React.createElement(StrataMap, { ...mapProps, onReady: wrappedOnReady }),
    ),
    children != null ? React.createElement("div", { style: { width: "100%" } }, children) : null,
  );
}

/* -------------------------------------------------------------------------------------------------
 * SplitDashboard
 * ---------------------------------------------------------------------------------------------- */

export interface SplitDashboardProps extends StrataMapProps {
  /** Which side the panel column sits on (default `"right"`). */
  side?: "right" | "left";
  /** Initial pixel width of the panel column (default `380`). */
  initialPanelWidth?: number;
  /** Minimum panel width in pixels (default `240`). */
  minPanelWidth?: number;
  /** The panel column content (charts / KPIs / tables / controls). */
  panel: React.ReactNode;
}

/**
 * Map + a resizable panel column, with a draggable splitter between them (pointer events). The
 * whole layout fills its container (give it a fixed height, e.g. `100vh`). Dragging the splitter
 * resizes the panel; `map.resize()` is called on drag end.
 */
export function SplitDashboard(props: SplitDashboardProps): React.ReactElement {
  const {
    side = "right",
    initialPanelWidth = 380,
    minPanelWidth = 240,
    panel,
    onReady,
    ...mapProps
  } = props;
  const [wrappedOnReady, mapRef] = useCapturedMap(onReady);
  const rootRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>(initialPanelWidth);
  const dragging = useRef(false);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      // Panel width = distance from the panel-side edge to the pointer.
      const raw = side === "right" ? rect.right - e.clientX : e.clientX - rect.left;
      const max = rect.width - 120; // keep at least ~120px for the map
      const next = Math.max(minPanelWidth, Math.min(max, raw));
      setPanelWidth(next);
    },
    [side, minPanelWidth],
  );

  const endDrag = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
    resizeSoon(mapRef);
  }, [onPointerMove, mapRef]);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", endDrag);
    },
    [onPointerMove, endDrag],
  );

  useEffect(() => {
    // Cleanup on unmount if a drag was in flight.
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
    };
  }, [onPointerMove, endDrag]);

  const mapEl = React.createElement(
    "div",
    { key: "map", style: { position: "relative", flex: "1 1 0%", minWidth: 0, height: "100%" } },
    React.createElement(StrataMap, { ...mapProps, onReady: wrappedOnReady }),
  );

  const splitterEl = React.createElement("div", {
    key: "splitter",
    role: "separator",
    "aria-orientation": "vertical",
    onPointerDown: startDrag,
    style: {
      flex: "0 0 6px",
      width: 6,
      height: "100%",
      cursor: "col-resize",
      background: "var(--strata-border, rgba(255,255,255,0.14))",
      touchAction: "none",
      userSelect: "none",
    } as React.CSSProperties,
  });

  const panelEl = React.createElement(
    "div",
    {
      key: "panel",
      style: {
        flex: `0 0 ${panelWidth}px`,
        width: panelWidth,
        height: "100%",
        overflow: "auto",
        background: "var(--strata-panel-bg, #12151b)",
        color: "var(--strata-fg, #e8ecf1)",
      } as React.CSSProperties,
    },
    panel,
  );

  const order =
    side === "right" ? [mapEl, splitterEl, panelEl] : [panelEl, splitterEl, mapEl];

  return React.createElement(
    "div",
    {
      ref: rootRef,
      style: { display: "flex", width: "100%", height: "100%", overflow: "hidden" },
    },
    order,
  );
}

/* -------------------------------------------------------------------------------------------------
 * MultiMap
 * ---------------------------------------------------------------------------------------------- */

export interface MultiMapProps {
  /** One `StrataMapProps` per map instance to render. */
  maps: StrataMapProps[];
  /** Keep the maps' views in sync — moving one `jumpTo`s the others (default false). */
  synced?: boolean;
  /** Number of columns in the grid (default: number of maps, i.e. a single row). */
  columns?: number;
}

/**
 * Render N `<StrataMap>` instances side by side (or in a grid of `columns`). When `synced`, the
 * maps' views are kept in lock-step: a `moveend` on any map `jumpTo`s all the others. A re-entrancy
 * flag guards against the feedback loop the mirrored `jumpTo` would otherwise cause.
 */
export function MultiMap(props: MultiMapProps): React.ReactElement {
  const { maps, synced = false, columns } = props;
  const mapsRef = useRef<any[]>([]);
  const syncing = useRef(false);

  const registerMap = useCallback(
    (index: number, map: any) => {
      mapsRef.current[index] = map;
      if (!synced || !map?.on) return;
      map.on("moveend", () => {
        if (syncing.current) return; // ignore programmatic moves we triggered
        syncing.current = true;
        try {
          const center = map.getCenter();
          const view = { center, zoom: map.getZoom(), bearing: map.getBearing?.() ?? 0, pitch: map.getPitch?.() ?? 0 };
          for (const other of mapsRef.current) {
            if (other && other !== map && other.jumpTo) other.jumpTo(view);
          }
        } finally {
          // Release after the mirrored jumps have dispatched their own (ignored) moveends.
          requestAnimationFrame(() => {
            syncing.current = false;
          });
        }
      });
    },
    [synced],
  );

  const cols = columns ?? maps.length ?? 1;

  const cells = maps.map((mapProps, i) =>
    React.createElement(
      "div",
      {
        key: mapProps.mapId ?? i,
        style: { position: "relative", width: "100%", height: "100%", minWidth: 0, minHeight: 0 },
      },
      React.createElement(StrataMap, {
        ...mapProps,
        onReady: (api: StrataMapHandle) => {
          registerMap(i, api.map);
          mapProps.onReady?.(api);
        },
      }),
    ),
  );

  return React.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${Math.max(1, cols)}, 1fr)`,
        gap: 4,
        width: "100%",
        height: "100%",
      } as React.CSSProperties,
    },
    cells,
  );
}
