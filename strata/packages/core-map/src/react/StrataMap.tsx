/**
 * <StrataMap> — the reusable, embeddable, presentation-flexible map component.
 *
 * Map-centric but NOT a whole app: mount one or many (`mapId`), place it full-page, inside a scrollable
 * page, in a split dashboard, or as synced multi-maps. Auxiliary widgets (charts/tables/popups) render on
 * the canvas or anywhere on the page and stay data-bound to this map's id.
 *
 * Two drive modes:
 *   - **config-driven** (back-compat): pass `config` (a `LayersJson`); the map renders it once.
 *   - **store-driven** (P0): also pass a `store` (`@strata/state`). The map subscribes and reflects
 *     store changes live — visibility, opacity, order (restack), add/remove, basemap switch,
 *     zoom-to-layer, highlight/select by OID, plus `interactionMode` (cursor + click) and
 *     `activeLayerId` (the default identify + popup target).
 *
 * On-map controls: every map carries the **standard Strata map controls** (`@strata/map-controls`,
 * wrapped by `MapChrome`) — one cluster top-right: zoom in · zoom out · home | layers · basemap ·
 * legend · full screen. Optional tools (search · locate · measure · draw · print) are OFF unless
 * `mapControls.tools` enables them. Resolution: `mapControls` > the legacy `controls` flags (mapped
 * by `legacyControlsToMapControls`: measure→tools.measure, sketch→tools.draw, geolocate→tools.locate)
 * > defaults. The optional scale bar (bottom-left, OFF by default) is `mapControls.scale`; the legacy
 * `scale` flag maps onto it (scale→mapControls.scale) and renders the same package scale bar.
 */
import React, { useEffect, useRef, useState } from "react";
import { useStrataAppEnv } from "./app/interactivity.js";
import { useStoreLayers } from "./useStoreLayers.js";
import {
  resolveMapWidgetControls,
  type LayersJson,
  type LegacyMapControls,
  type MapControlsConfig,
  type NormalizedMapControls,
  type OperationalLayer,
} from "@strata/schema";
import type { StrataStore, InteractionMode } from "@strata/state";
import type { ActionBus } from "@strata/actions";
import { MapController } from "../engine/MapController.js";
import { LayerRegistry } from "../engine/layers.js";
import { applyBaseMap, baseMapFromId } from "../engine/basemaps.js";
import * as basemapCatalog from "@strata/map-controls/basemaps";
import { initPopups, type PopupSurface } from "../engine/popups.js";
import { bindStoreToMap, type StoreBinding } from "../engine/storeBinding.js";
import type { DataClient } from "../engine/arcgisSource.js";
import { Legend, MapChrome } from "./controls/index.js";

/**
 * The legacy free-form control flags.
 * @deprecated Use `mapControls` (`MapControlsConfig` from `@strata/schema`). The standard cluster is
 * always on; `measure` → `tools.measure`, `sketch` → `tools.draw`, `geolocate` → `tools.locate`;
 * `scale` → `mapControls.scale` (the package scale bar, bottom-left); `navigation` / `fullscreen` / `legend` /
 * `basemapSwitcher` / `layerList` / `cluster` / `position` are ignored (the cluster is fixed top-right).
 */
export type StrataMapControls = LegacyMapControls;

export interface StrataMapProps {
  /** The maplibre-gl module (peer dependency — injected so the template has no hard build dep). */
  maplibregl: any;
  mapId?: string;
  config: LayersJson;
  /**
   * Optional `@strata/state` store. When provided, the map subscribes and reflects store changes
   * live (visibility/opacity/order/add/remove/basemap/highlight/mode/active). When omitted, the map
   * is purely config-driven (back-compat).
   */
  store?: StrataStore;
  /**
   * Optional `@strata/actions` bus. When provided with a `store`, the map is a WIF sink: it highlights
   * (and zooms/flashes) in response to `featureSelect`/`rowSelect`/`flash` triggers from other widgets, so
   * a selection elsewhere lights up on the map. `<StrataApp>` injects its shared bus automatically.
   */
  bus?: ActionBus;
  /**
   * The standard map controls' configuration: optional tools, basemap choices (initial, ≤3
   * recommended extras, the light/dark pair) and the print title. See `MapControlsConfig`.
   */
  mapControls?: MapControlsConfig;
  /** @deprecated Legacy flags — see {@link StrataMapControls}. Ignored when `mapControls` is set. */
  controls?: StrataMapControls;
  /**
   * The app's theme mode, for the basemap drawer's "Follow the theme" row. Inside a `<StrataApp>` the
   * mode is read from the app automatically; set this only when embedding the map on its own.
   */
  themeMode?: "light" | "dark";
  dataClient?: DataClient;
  glyphs?: string;
  rtlTextPluginUrl?: string;
  style?: React.CSSProperties;
  className?: string;
  onFeatureSelect?: (feature: unknown) => void;
  onViewChange?: (view: { center: [number, number]; zoom: number; bbox: [number, number, number, number] }) => void;
  /**
   * Called once the live map is ready with an imperative handle. `zoomToLayer` fits the map to a
   * layer's extent — wire it to e.g. `<LayerPanel onZoomTo>`. Only present when a `store` is given.
   */
  onReady?: (api: StrataMapHandle) => void;
  /** Reserved for the deferred conversational AI layer. */
  askEnabled?: boolean;
}

/** Imperative handle surfaced via `onReady` for signals that aren't declarative store state. */
export interface StrataMapHandle {
  map: any;
  /** Fit the map to a layer's extent (server extent query, else source bounds). */
  zoomToLayer: (layerId: string) => Promise<void>;
}

export function StrataMap(props: StrataMapProps): React.ReactElement {
  const {
    maplibregl,
    config,
    store,
    dataClient = {},
    glyphs,
    rtlTextPluginUrl,
    style,
    className,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<MapController | null>(null);
  const registryRef = useRef<LayerRegistry | null>(null);
  const bindingRef = useRef<StoreBinding | null>(null);
  // Once ready, expose the live map + registry so control components can mount.
  const [ready, setReady] = useState<{ map: any; registry: LayerRegistry } | null>(null);

  // Phase 7: publish the live map to the app's MapRegistry so sibling tool widgets (measure/draw/…) reach it.
  const appEnv = useStrataAppEnv();
  // The standard map controls: `mapControls` > legacy `controls` > defaults, with the app's
  // `theme.basemap` as the fallback light/dark pair.
  const resolved = resolveMapWidgetControls(props as unknown as Record<string, unknown>, {
    themeBasemap: appEnv?.themeBasemap,
  });
  const themeMode = props.themeMode ?? appEnv?.themeMode ?? "light";
  const initRef = useRef({ initialBasemap: resolved.basemap.initial, themeMode, pair: resolved.basemap.theme });
  initRef.current = { initialBasemap: resolved.basemap.initial, themeMode, pair: resolved.basemap.theme };
  // While a chrome tool (measure/draw) owns map clicks, identify must not answer them — the store's
  // interactionMode carries that when store-driven; this ref carries it when not.
  const chromeModeRef = useRef<"identify" | "measure" | "draw">("identify");
  useEffect(() => {
    const p = props as { mapId?: string; widgetId?: string; id?: string };
    const id = p.mapId ?? p.widgetId ?? p.id ?? "default";
    if (ready && appEnv?.maps) {
      appEnv.maps.register(id, ready.map);
      return () => appEnv.maps?.unregister(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, appEnv]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    // Guards every async continuation below so a StrictMode unmount (or any teardown mid-load) can't
    // touch a destroyed map. Set true in cleanup.
    let disposed = false;
    const controller = new MapController({
      container,
      maplibregl,
      glyphs,
      rtlTextPluginUrl,
    });
    controllerRef.current = controller;
    let disposePopups: PopupSurface | undefined;
    let binding: StoreBinding | undefined;

    // The map is often constructed before its flex/late-sized container has laid out (MapLibre then
    // sticks at its 400×300 default). Re-fit on any container size change, and once after first paint.
    const ro = new ResizeObserver(() => controller.resize());
    ro.observe(container);

    controller.ready.then(async () => {
      if (disposed) return;
      const map = controller.map;
      const registry = new LayerRegistry({ map, client: dataClient, maplibregl });
      registryRef.current = registry;

      // Basemap: `mapControls.basemap.initial` when set, else the store's (store-driven) or the
      // config's authored basemap — that one wins on mount. A spec with no basemap at all gets the
      // theme's (osm / osm-dark). Every id resolves through the catalog's aliases.
      const { initialBasemap, themeMode: mode0, pair } = initRef.current;
      const authored = store?.getState().baseMap ?? config.baseMap;
      const hasAuthored = !!authored?.baseMapLayers?.length;
      const startBm =
        (initialBasemap ? baseMapFromId(initialBasemap) : undefined) ??
        (hasAuthored
          ? authored
          : baseMapFromId(mode0 === "dark" ? pair.dark : pair.light) ??
            baseMapFromId(basemapCatalog.basemapForTheme(mode0)));
      // Not an edit to the map spec: the store records it without an undo entry.
      if (store && startBm && startBm !== authored) store.getState().setBaseMap(startBm, { transient: true });
      if (startBm) applyBaseMap(map, startBm);

      // Initial layers: from the store when present (it is the source of truth), else the config.
      const initialLayers = store ? store.getState().layers : config.operationalLayers;
      for (const layer of initialLayers) {
        await registry.add(layer);
        registry.setVisibility(layer.id, layer.visibility !== false);
        if (layer.opacity != null) registry.setOpacity(layer.id, layer.opacity);
      }
      controller.applyInitialState(config);

      // Popups / identify. Store-driven maps honor active layer + interaction mode.
      disposePopups = initPopups({
        map,
        maplibregl,
        layers: store ? () => store.getState().layers : config.operationalLayers,
        client: dataClient,
        getActiveLayerId: store ? () => store.getState().activeLayerId : undefined,
        getInteractionMode: store
          ? () => store.getState().interactionMode
          : () => (chromeModeRef.current === "identify" ? "identify" : "measure"),
        onFeatureSelect: props.onFeatureSelect,
      });

      // Store binding: reflect subsequent store changes onto the live map.
      if (store) {
        binding = bindStoreToMap({
          controller,
          registry,
          store,
          client: dataClient,
          onInteractionMode: (mode) => applyCursor(map, mode),
          bus: props.bus,
          mapId: props.mapId,
          // So a row adopting a record opens that record's popup, and releasing it closes it.
          popups: disposePopups,
        });
        bindingRef.current = binding;
        applyCursor(map, store.getState().interactionMode);
        props.onReady?.({ map, zoomToLayer: (id: string) => binding!.zoomToLayer(id) });
      }

      map.on("moveend", () => {
        props.onViewChange?.({
          center: controller.getCenter(),
          zoom: controller.getZoom(),
          bbox: controller.getBoundsArray(),
        });
      });

      // Fit to the container once it has laid out (covers the 0-size-at-mount case).
      requestAnimationFrame(() => { if (!disposed) controller.resize(); });

      setReady({ map, registry });
    });

    return () => {
      disposed = true;
      ro.disconnect();
      disposePopups?.();
      binding?.dispose();
      bindingRef.current = null;
      registryRef.current?.destroy();
      registryRef.current = null;
      controller.destroy();
      controllerRef.current = null;
      setReady(null);
    };
    // Re-init on a config change only when there is no store (store-driven maps update in place).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store ? store : config]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", position: "relative", ...style }}
      data-strata-map={props.mapId || "default"}
    >
      {ready && (
        <StrataControls
          map={ready.map}
          maplibregl={maplibregl}
          store={store}
          resolved={resolved}
          themeMode={themeMode}
          config={config}
          onHome={() => {
            const ext = fullExtentOf(store ? store.getState().layers : config.operationalLayers);
            if (ext) ready.map?.fitBounds?.(ext, { padding: 40 });
            else if (config.initialState?.viewpoint?.targetGeometry) controllerRef.current?.applyInitialState(config);
            else controllerRef.current?.home();
          }}
          onZoomToLayer={store ? (id) => void bindingRef.current?.zoomToLayer(id) : undefined}
          onInteractionMode={(m) => { chromeModeRef.current = m; }}
        />
      )}
    </div>
  );
}

/** Mount the standard map controls (with the optional scale bar) and the legend once the map is ready. */
function StrataControls(props: {
  map: any;
  maplibregl: any;
  store?: StrataStore;
  resolved: NormalizedMapControls;
  themeMode: "light" | "dark";
  config: LayersJson;
  onHome: () => void;
  onZoomToLayer?: (layerId: string) => void;
  onInteractionMode: (mode: "identify" | "measure" | "draw") => void;
}): React.ReactElement {
  const { map, maplibregl, store, resolved, config } = props;
  // Legend/chrome must react to layer changes when store-driven; fall back to the static config only
  // when there is no store to follow.
  const layers = useStoreLayers(store, store ? undefined : config.operationalLayers);
  // The legend is part of the standard cluster: open by default, the cluster's Legend button (G) hides it.
  const [legendOn, setLegendOn] = React.useState(true);

  return (
    <>
      <MapChrome
        map={map}
        store={store}
        layers={layers}
        baseMap={config.baseMap}
        themeMode={props.themeMode}
        themeBasemaps={resolved.basemap.theme}
        recommendedExtras={resolved.basemap.recommendedExtras}
        tools={resolved.tools}
        scale={resolved.scale}
        title={resolved.title}
        showLegend={legendOn}
        onToggleLegend={setLegendOn}
        onFit={props.onHome}
        onZoomToLayer={props.onZoomToLayer}
        onInteractionMode={props.onInteractionMode}
      />
      {/* The legend is a control surface, bottom-right; the cluster's legend button hides it. */}
      {legendOn && (
        <div style={legendBoxStyle}>
          <Legend layers={layers} title="Legend" store={store} />
        </div>
      )}
    </>
  );
}

/**
 * The union of every layer's declared `fullExtent` — what the cluster's fit button flies to.
 * Returns `undefined` when no layer declares one, so `fitBounds` is simply not called rather than
 * being handed a fabricated world extent.
 */
function fullExtentOf(layers: OperationalLayer[]): [[number, number], [number, number]] | undefined {
  let box: [number, number, number, number] | null = null;
  for (const l of layers) {
    const e = (l.layerDefinition as any)?.extent ?? (l as any).fullExtent;
    if (!e || e.xmin == null) continue;
    box = box
      ? [Math.min(box[0], e.xmin), Math.min(box[1], e.ymin), Math.max(box[2], e.xmax), Math.max(box[3], e.ymax)]
      : [e.xmin, e.ymin, e.xmax, e.ymax];
  }
  return box ? [[box[0], box[1]], [box[2], box[3]]] : undefined;
}

/** Set the canvas cursor to match the interaction mode. */
function applyCursor(map: any, mode: InteractionMode): void {
  if (!map?.getCanvas) return;
  map.getCanvas().style.cursor = mode === "measure" || mode === "sketch" ? "crosshair" : "";
}

const legendBoxStyle: React.CSSProperties = { position: "absolute", bottom: 24, right: 8, zIndex: 2 };

export default StrataMap;
