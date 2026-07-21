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
 * On-map controls (navigation/geolocate/fullscreen/scale/measure/sketch/legend) are opted-in via the
 * `controls` prop and mounted once the map is ready.
 */
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useStrataAppEnv } from "./app/interactivity.js";
import type { LayersJson, OperationalLayer } from "@strata/schema";
import type { StrataStore, InteractionMode } from "@strata/state";
import type { ActionBus } from "@strata/actions";
import { MapController } from "../engine/MapController.js";
import { LayerRegistry } from "../engine/layers.js";
import { applyBaseMap } from "../engine/basemaps.js";
import { initPopups } from "../engine/popups.js";
import { bindStoreToMap, type StoreBinding } from "../engine/storeBinding.js";
import type { DataClient } from "../engine/arcgisSource.js";
import {
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
  ScaleControl,
  MeasureControl,
  SketchControl,
  Legend,
  type ControlPosition,
} from "./controls/index.js";
import { LayerPanel, BasemapPanel } from "./panels/index.js";

export interface StrataMapControls {
  navigation?: boolean;
  geolocate?: boolean;
  fullscreen?: boolean;
  scale?: boolean;
  measure?: boolean;
  sketch?: boolean;
  legend?: boolean;
  basemapSwitcher?: boolean;
  layerList?: boolean;
  /**
   * Corner for the native navigation/geolocate/fullscreen cluster (default `"top-right"`). Set this so
   * the controls don't collide with a docked/floating panel — e.g. `"top-left"` when panels dock right.
   * The scale bar stays bottom-left.
   */
  position?: ControlPosition;
}

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
  controls?: StrataMapControls;
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
    controls,
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
    let disposePopups: (() => void) | undefined;
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

      // Basemap: prefer the store's basemap when store-driven, else the config's.
      const baseMap = store?.getState().baseMap ?? config.baseMap;
      if (baseMap) applyBaseMap(map, baseMap);

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
        getInteractionMode: store ? () => store.getState().interactionMode : undefined,
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
      {ready && controls && (
        <StrataControls
          map={ready.map}
          maplibregl={maplibregl}
          store={store}
          controls={controls}
          configLayers={config.operationalLayers}
        />
      )}
    </div>
  );
}

/** Mount the opted-in on-map controls once the map is ready. */
function StrataControls(props: {
  map: any;
  maplibregl: any;
  store?: StrataStore;
  controls: StrataMapControls;
  configLayers: OperationalLayer[];
}): React.ReactElement {
  const { map, maplibregl, store, controls, configLayers } = props;
  // Legend must react to layer changes when store-driven; fall back to the static config otherwise.
  const layers = useStoreLayers(store, configLayers);
  return (
    <>
      {controls.navigation && <NavigationControl map={map} maplibregl={maplibregl} position={controls.position} />}
      {controls.geolocate && <GeolocateControl map={map} maplibregl={maplibregl} position={controls.position} />}
      {controls.fullscreen && <FullscreenControl map={map} maplibregl={maplibregl} position={controls.position} />}
      {controls.scale && <ScaleControl map={map} maplibregl={maplibregl} />}
      {controls.measure && store && (
        <div style={measureBarStyle}>
          <MeasureControl map={map} maplibregl={maplibregl} store={store} />
        </div>
      )}
      {controls.sketch && store && (
        <div style={sketchBarStyle}>
          <SketchControl map={map} maplibregl={maplibregl} store={store} />
        </div>
      )}
      {controls.legend && (
        <div style={legendBoxStyle}>
          <Legend layers={layers} title="Legend" />
        </div>
      )}
      {controls.layerList && store && (
        <div style={layerListBoxStyle}>
          <LayerPanel store={store} />
        </div>
      )}
      {controls.basemapSwitcher && store && (
        <div style={basemapBoxStyle}>
          <BasemapPanel store={store} />
        </div>
      )}
    </>
  );
}

/** Subscribe to the store's operational layers (for reactive controls), else use static config. */
function useStoreLayers(store: StrataStore | undefined, fallback: OperationalLayer[]): OperationalLayer[] {
  return useSyncExternalStore(
    (cb) => (store ? store.subscribe(cb) : () => {}),
    () => (store ? store.getState().layers : fallback),
    () => (store ? store.getState().layers : fallback),
  );
}

/** Set the canvas cursor to match the interaction mode. */
function applyCursor(map: any, mode: InteractionMode): void {
  if (!map?.getCanvas) return;
  map.getCanvas().style.cursor = mode === "measure" || mode === "sketch" ? "crosshair" : "";
}

const measureBarStyle: React.CSSProperties = { position: "absolute", top: 8, left: 8, zIndex: 5 };
const sketchBarStyle: React.CSSProperties = { position: "absolute", top: 48, left: 8, zIndex: 5 };
const legendBoxStyle: React.CSSProperties = { position: "absolute", bottom: 24, right: 8, zIndex: 5 };
const layerListBoxStyle: React.CSSProperties = { position: "absolute", top: 8, right: 8, zIndex: 5 };
const basemapBoxStyle: React.CSSProperties = { position: "absolute", bottom: 24, left: 8, zIndex: 5 };

export default StrataMap;
