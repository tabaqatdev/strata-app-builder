/**
 * layers — the logical-layer registry: one logical layer → one MapLibre source + N namespaced
 * sub-layers (`lyr:{id}:fill|outline|line|circle|symbol|heat|label{n}`), a serialized mutation queue
 * (enqueue) to survive rapid prop changes and save/restore replay, z-order (restack), highlight by OID,
 * and clustering.
 *
 * v0.1.0: interface + the core add-feature flow are defined; the full port is the next release
 * (see docs/guide/layers.md and 2-Strata-Core-Plan-and-Spec.md §4.6). Uses the styleCompiler + arcgisSource.
 */

import type { OperationalLayer } from "@strata/schema";
import type { DataClient } from "./arcgisSource.js";
import { fetchMeta, loadFeatures } from "./arcgisSource.js";
import { compile } from "./styleCompiler.js";
import { imageServerSourceDef, cogSourceDef, registerCogProtocol, vectorTileSourceDef, pmtilesSourceDef, registerPmtilesProtocol, type ImageServerOptions } from "./raster.js";

export interface LayerRegistryOptions {
  map: any; // maplibre-gl Map
  client: DataClient;
  /** The maplibregl module — required to register the COG (`cog://`) protocol for raster COG layers. */
  maplibregl?: any;
}

/** Optional clustering settings, read from `layer.source.cluster*` or a top-level `layer.cluster` flag. */
interface ClusterConfig {
  cluster: boolean;
  clusterRadius: number;
  clusterMaxZoom: number;
}

export class LayerRegistry {
  private map: any;
  private client: DataClient;
  private maplibregl: any;
  private queue: Promise<void> = Promise.resolve();
  /** Live refresh timers per logical layer, cleared on remove()/destroy(). */
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  /**
   * Per-layer load context for feature layers, so in-place filters ({@link setDefinition}) and refresh
   * timers always re-query with the CURRENT `definitionExpression`, not the value captured at add-time.
   */
  private defs = new Map<string, { url: string; kind: string; where?: string }>();
  /** Set by destroy(); guards in-flight async loads from touching a torn-down map. */
  private destroyed = false;

  /** Write a page into a source, unless the registry has been destroyed (StrictMode-safe). */
  private setSourceData(srcId: string, fc: unknown): void {
    if (this.destroyed) return;
    this.map.getSource(srcId)?.setData(fc);
  }

  constructor(opts: LayerRegistryOptions) {
    this.map = opts.map;
    this.client = opts.client;
    this.maplibregl = opts.maplibregl;
  }

  /** Serialize all mutations so add/remove/replay never race. */
  enqueue(fn: () => Promise<void> | void): Promise<void> {
    this.queue = this.queue.then(() => fn()).catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[strata] layer mutation failed", e);
    });
    return this.queue;
  }

  add(layer: OperationalLayer): Promise<void> {
    return this.enqueue(async () => {
      const srcId = `lyr:${layer.id}`;
      const kind = layer.source.kind;
      if (kind === "arcgis-feature" || kind === "strata") {
        const url = layer.url || layer.source.url;
        if (!url) return;
        this.defs.set(layer.id, { url, kind, where: layer.layerDefinition?.definitionExpression });
        const cluster = this.clusterConfig(layer);
        this.map.addSource(srcId, this.geojsonSourceDef({ type: "FeatureCollection", features: [] }, cluster));
        this.addSubLayers(layer, cluster);
        const renderer =
          layer.layerDefinition?.drawingInfo?.renderer ||
          (await fetchMeta(url, this.client).catch(() => null))?.drawingInfo?.["renderer" as any];
        if (renderer) this.applyRenderer(layer.id, renderer as any);
        // Progressive load — fire-and-forget so registration/readiness/initial-view don't wait on the
        // full paged feature load. `onPage` streams tiles in; a destroyed map is guarded.
        void loadFeatures(url, this.client, {
          where: layer.layerDefinition?.definitionExpression,
          onPage: (fc) => this.setSourceData(srcId, fc),
        }).catch((e) => console.error(`[strata:${layer.id}] load failed`, e));
        this.scheduleRefresh(layer, url);
      } else if (kind === "geojson") {
        // Inline FeatureCollection (`source.data`) or a URL (`source.url` / `layer.url`) to fetch.
        const url = layer.source.url || layer.url;
        let data: any = layer.source.data;
        if (!data && url) {
          data = await fetch(url)
            .then((r) => r.json())
            .catch((e) => {
              console.error(`[strata:${layer.id}] failed to load geojson ${url}`, e);
              return { type: "FeatureCollection", features: [] };
            });
        }
        if (!data) data = { type: "FeatureCollection", features: [] };
        const cluster = this.clusterConfig(layer);
        this.map.addSource(srcId, this.geojsonSourceDef(data, cluster));
        this.addSubLayers(layer, cluster);
        const renderer = layer.layerDefinition?.drawingInfo?.renderer;
        if (renderer) this.applyRenderer(layer.id, renderer as any);
      } else if (kind === "tile") {
        // XYZ raster tiles: `layer.url` / `source.url` is a `{z}/{x}/{y}` template.
        const url = layer.url || layer.source.url;
        if (!url) return;
        this.map.addSource(srcId, {
          type: "raster",
          tiles: [url],
          tileSize: 256,
          ...(layer.attribution ? { attribution: layer.attribution } : {}),
        });
        this.addRasterLayer(layer);
      } else if (kind === "wms") {
        // WMS GetMap as raster tiles, one request per 256×256 tile in EPSG:3857.
        const base = layer.url || layer.source.url;
        if (!base) return;
        const tileUrl = buildWmsTileUrl(base, layer.source as unknown as Record<string, unknown>);
        this.map.addSource(srcId, {
          type: "raster",
          tiles: [tileUrl],
          tileSize: 256,
          ...(layer.attribution ? { attribution: layer.attribution } : {}),
        });
        this.addRasterLayer(layer);
      } else if (kind === "imageserver") {
        // ESRI ImageServer via exportImage tiles (renderingRule/time supported).
        const base = layer.url || layer.source.url;
        if (!base) return;
        const src = layer.source as unknown as Record<string, unknown>;
        const opts: ImageServerOptions = { renderingRule: src.renderingRule };
        this.map.addSource(srcId, imageServerSourceDef(base, opts, layer.attribution));
        this.addRasterLayer(layer);
      } else if (kind === "cog") {
        // Cloud-optimized GeoTIFF via the optional `cog://` protocol.
        const url = layer.url || layer.source.url;
        if (!url) return;
        const ok = await registerCogProtocol(this.maplibregl);
        if (!ok) {
          console.warn(`[strata:${layer.id}] COG support needs '@geomatico/maplibre-cog-protocol' installed`);
          return;
        }
        this.map.addSource(srcId, cogSourceDef(url, layer.attribution));
        this.addRasterLayer(layer);
      } else if (kind === "vector-tile") {
        // Native MapLibre vector tiles (MVT). `source.sourceLayer` names the layer inside the tiles.
        const url = layer.url || layer.source.url;
        if (!url) return;
        this.map.addSource(srcId, vectorTileSourceDef(url, layer.attribution));
        this.addVectorSubLayers(layer);
      } else if (kind === "pmtiles") {
        // PMTiles archive (offline/edge) via the optional `pmtiles` protocol; vector or raster.
        const url = layer.url || layer.source.url;
        if (!url) return;
        const ok = await registerPmtilesProtocol(this.maplibregl);
        if (!ok) {
          console.warn(`[strata:${layer.id}] PMTiles support needs the 'pmtiles' package installed`);
          return;
        }
        const tileKind = (layer.source as unknown as Record<string, unknown>).tileKind === "raster" ? "raster" : "vector";
        this.map.addSource(srcId, pmtilesSourceDef(url, tileKind as "vector" | "raster", layer.attribution));
        if (tileKind === "raster") this.addRasterLayer(layer);
        else this.addVectorSubLayers(layer);
      }
    });
  }

  /**
   * Sub-layers for a **vector** tile source (`vector-tile`/`pmtiles`). Same `lyr:{id}:fill|outline|line|
   * circle` ids as geojson (so `applyRenderer` styles them identically), but each carries the required
   * `source-layer`. Default paint until the layer's `drawingInfo` renderer is applied.
   */
  private addVectorSubLayers(layer: OperationalLayer): void {
    const srcId = `lyr:${layer.id}`;
    const sl = (layer.source as unknown as Record<string, unknown>).sourceLayer as string | undefined;
    if (!sl) console.warn(`[strata:${layer.id}] vector-tile/pmtiles layer needs source.sourceLayer`);
    const base: Record<string, unknown> = { source: srcId, ...(sl ? { "source-layer": sl } : {}) };
    const geomFilter = (t: string): any[] => ["==", ["geometry-type"], t];
    this.map.addLayer({ id: `${srcId}:fill`, type: "fill", ...base, filter: geomFilter("Polygon"), paint: { "fill-color": "#3b82f6", "fill-opacity": 0.4 } } as any);
    this.map.addLayer({ id: `${srcId}:outline`, type: "line", ...base, filter: geomFilter("Polygon"), paint: { "line-color": "#1e3a5f", "line-width": 1 } } as any);
    this.map.addLayer({ id: `${srcId}:line`, type: "line", ...base, filter: geomFilter("LineString"), paint: { "line-color": "#3b82f6", "line-width": 1.5 } } as any);
    this.map.addLayer({ id: `${srcId}:circle`, type: "circle", ...base, filter: geomFilter("Point"), paint: { "circle-color": "#3b82f6", "circle-radius": 4, "circle-stroke-color": "#fff", "circle-stroke-width": 1 } } as any);
  }

  /** Read clustering settings off the layer (`source.cluster*` or a top-level `layer.cluster` flag). */
  private clusterConfig(layer: OperationalLayer): ClusterConfig {
    const src = layer.source as unknown as Record<string, unknown>;
    const flag = (src.cluster ?? (layer as unknown as Record<string, unknown>).cluster) === true;
    const radius = src.clusterRadius;
    const maxZoom = src.clusterMaxZoom;
    return {
      cluster: flag,
      clusterRadius: typeof radius === "number" ? radius : 50,
      clusterMaxZoom: typeof maxZoom === "number" ? maxZoom : 14,
    };
  }

  /** A MapLibre geojson source definition, applying clustering options when enabled. */
  private geojsonSourceDef(data: unknown, cluster: ClusterConfig): Record<string, unknown> {
    const def: Record<string, unknown> = { type: "geojson", data };
    if (cluster.cluster) {
      def.cluster = true;
      def.clusterRadius = cluster.clusterRadius;
      def.clusterMaxZoom = cluster.clusterMaxZoom;
    }
    return def;
  }

  /** Add a single raster sub-layer (`lyr:{id}:raster`) for tile/wms layers, honoring opacity. */
  private addRasterLayer(layer: OperationalLayer): void {
    const srcId = `lyr:${layer.id}`;
    const paint: Record<string, unknown> = {};
    if (typeof layer.opacity === "number") paint["raster-opacity"] = Math.max(0, Math.min(1, layer.opacity));
    this.map.addLayer({ id: `${srcId}:raster`, type: "raster", source: srcId, paint });
  }

  /**
   * For `arcgis-feature`/`strata` layers with `refreshIntervalSeconds > 0`, re-query the source on that
   * interval and `setData` the geojson source. Timers are tracked and cleared on remove()/destroy().
   */
  private scheduleRefresh(layer: OperationalLayer, url: string): void {
    const secs = layer.refreshIntervalSeconds;
    if (!secs || secs <= 0) return;
    const srcId = `lyr:${layer.id}`;
    const timer = setInterval(() => {
      void loadFeatures(url, this.client, {
        // Read the CURRENT filter so a refresh honors any in-place setDefinition().
        where: this.defs.get(layer.id)?.where ?? layer.layerDefinition?.definitionExpression,
        onPage: (fc) => this.setSourceData(srcId, fc),
      }).catch((e) => console.error(`[strata:${layer.id}] refresh failed`, e));
    }, secs * 1000);
    this.timers.set(layer.id, timer);
  }

  private addSubLayers(layer: OperationalLayer, cluster?: ClusterConfig): void {
    const srcId = `lyr:${layer.id}`;
    const geomFilter = (t: string): any[] => ["==", ["geometry-type"], t];
    this.map.addLayer({ id: `${srcId}:fill`, type: "fill", source: srcId, filter: geomFilter("Polygon"), paint: { "fill-color": "#3b82f6", "fill-opacity": 0.4 } });
    this.map.addLayer({ id: `${srcId}:outline`, type: "line", source: srcId, filter: geomFilter("Polygon"), paint: { "line-color": "#1e3a5f", "line-width": 1 } });
    this.map.addLayer({ id: `${srcId}:line`, type: "line", source: srcId, filter: geomFilter("LineString"), paint: { "line-color": "#3b82f6", "line-width": 1.5 } });
    if (cluster?.cluster) {
      // Clustered points: cluster bubbles + count symbol, with the normal point layer showing only
      // the unclustered features. `point_count` is injected by MapLibre's clustering.
      this.map.addLayer({
        id: `${srcId}:cluster`,
        type: "circle",
        source: srcId,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#3b82f6",
          "circle-radius": ["step", ["get", "point_count"], 14, 25, 18, 100, 24],
          "circle-opacity": 0.7,
        },
      });
      this.map.addLayer({
        id: `${srcId}:cluster-count`,
        type: "symbol",
        source: srcId,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });
      this.map.addLayer({
        id: `${srcId}:circle`,
        type: "circle",
        source: srcId,
        filter: ["all", geomFilter("Point"), ["!", ["has", "point_count"]]],
        paint: { "circle-color": "#3b82f6", "circle-radius": 4 },
      });
    } else {
      this.map.addLayer({ id: `${srcId}:circle`, type: "circle", source: srcId, filter: geomFilter("Point"), paint: { "circle-color": "#3b82f6", "circle-radius": 4 } });
    }
  }

  applyRenderer(layerId: string, renderer: Record<string, unknown>): void {
    const srcId = `lyr:${layerId}`;
    const { patches, heatmap, warnings } = compile(renderer);
    for (const w of warnings) console.warn(`[strata:${layerId}] ${w}`);
    this.setPaint(`${srcId}:fill`, patches.fill);
    this.setPaint(`${srcId}:outline`, patches.outline);
    this.setPaint(`${srcId}:line`, patches.line);
    this.setPaint(`${srcId}:circle`, patches.circle);
    if (heatmap) {
      // TODO(v0.2): add a dedicated heat sub-layer.
    }
  }

  /**
   * Apply a server-side filter **in place** (the WIF W0 dependency). Re-queries an `arcgis-feature` /
   * `strata` layer with a new SQL `where` (`definitionExpression`) and streams the result into the
   * existing geojson source — the source is **not** removed and re-added, so a filter never remounts the
   * map (no flicker, view/selection preserved). No-op for raster/tile/wms/geojson layers. Pass an empty
   * string or `undefined` to clear the filter.
   */
  setDefinition(layerId: string, where: string | undefined): Promise<void> {
    return this.enqueue(async () => {
      const ctx = this.defs.get(layerId);
      if (!ctx || (ctx.kind !== "arcgis-feature" && ctx.kind !== "strata")) return;
      ctx.where = where || undefined;
      const srcId = `lyr:${layerId}`;
      // Clear immediately so the map doesn't show stale features while the filtered page loads.
      this.setSourceData(srcId, { type: "FeatureCollection", features: [] });
      await loadFeatures(ctx.url, this.client, {
        where: ctx.where,
        onPage: (fc) => this.setSourceData(srcId, fc),
      }).catch((e) => console.error(`[strata:${layerId}] setDefinition load failed`, e));
    });
  }

  /** The current in-place filter for a layer (undefined if none / not a feature layer). */
  getDefinition(layerId: string): string | undefined {
    return this.defs.get(layerId)?.where;
  }

  private setPaint(subLayerId: string, paint: Record<string, unknown>): void {
    if (!this.map.getLayer(subLayerId)) return;
    for (const [k, v] of Object.entries(paint)) {
      try {
        this.map.setPaintProperty(subLayerId, k, v as any);
      } catch {
        /* geometry mismatch — ignore */
      }
    }
  }

  remove(layerId: string): Promise<void> {
    return this.enqueue(() => {
      const timer = this.timers.get(layerId);
      if (timer !== undefined) {
        clearInterval(timer);
        this.timers.delete(layerId);
      }
      this.defs.delete(layerId);
      const srcId = `lyr:${layerId}`;
      for (const kind of SUBLAYER_KINDS) {
        const id = `${srcId}:${kind}`;
        if (this.map.getLayer(id)) this.map.removeLayer(id);
      }
      if (this.map.getSource(srcId)) this.map.removeSource(srcId);
    });
  }

  /** Tear down the registry: mark destroyed (stops in-flight loads) + clear every refresh timer. */
  destroy(): void {
    this.destroyed = true;
    for (const timer of this.timers.values()) clearInterval(timer);
    this.timers.clear();
  }

  /** True when this layer's source has been added to the live map. */
  has(layerId: string): boolean {
    return !!this.map.getSource(`lyr:${layerId}`);
  }

  /** Toggle a logical layer's visibility (all its sub-layers). */
  setVisibility(layerId: string, visible: boolean): void {
    const value = visible ? "visible" : "none";
    for (const id of this.subLayerIds(layerId)) {
      if (this.map.getLayer(id)) this.map.setLayoutProperty(id, "visibility", value);
    }
  }

  /**
   * Set a logical layer's opacity (0–1) across its sub-layers, honoring each sub-layer's
   * MapLibre opacity paint property.
   */
  setOpacity(layerId: string, opacity: number): void {
    const o = Math.max(0, Math.min(1, opacity));
    const srcId = `lyr:${layerId}`;
    const props: Array<[string, string]> = [
      [`${srcId}:fill`, "fill-opacity"],
      [`${srcId}:outline`, "line-opacity"],
      [`${srcId}:line`, "line-opacity"],
      [`${srcId}:circle`, "circle-opacity"],
      [`${srcId}:symbol`, "icon-opacity"],
    ];
    for (const [id, prop] of props) {
      if (!this.map.getLayer(id)) continue;
      try {
        this.map.setPaintProperty(id, prop, o);
      } catch {
        /* property not applicable for this layer type */
      }
    }
  }

  /**
   * Restack the live map so sub-layers follow `orderedIds` (index 0 = top-most, matching the
   * ESRI Web Map / LayerPanel convention). Implemented by moving each layer's sub-layers, from
   * bottom-most logical layer up, above all previously placed ones.
   */
  restack(orderedIds: string[]): void {
    // Draw order: last in `orderedIds` is bottom-most on the map. MapLibre draws later layers on
    // top, so we place from the bottom (end of the array) toward the top (start).
    const bottomUp = [...orderedIds].reverse();
    for (const layerId of bottomUp) {
      for (const id of this.subLayerIds(layerId)) {
        if (this.map.getLayer(id)) this.map.moveLayer(id); // moveLayer(id) → top of the stack
      }
    }
  }

  /**
   * Highlight a set of OBJECTIDs on a layer by driving the `feature-state`-free `filter` of an
   * overlay is heavier than we need; instead we set a MapLibre `filter`-based emphasis via a
   * dedicated highlight paint using `case`. Passing an empty `oids` clears the highlight.
   */
  highlight(layerId: string, oids: Array<number | string>, oidField = "OBJECTID"): void {
    const srcId = `lyr:${layerId}`;
    const has = oids.length > 0;
    const inSet: any = has ? ["in", ["get", oidField], ["literal", oids]] : false;
    // Bump stroke/width on selected features; MapLibre `case` keeps the base style for the rest.
    const emphasize = (id: string, prop: string, on: unknown, off: unknown): void => {
      if (!this.map.getLayer(id)) return;
      try {
        this.map.setPaintProperty(id, prop, has ? ["case", inSet, on, off] : off);
      } catch {
        /* not applicable */
      }
    };
    emphasize(`${srcId}:circle`, "circle-stroke-color", "#ffcc00", "rgba(0,0,0,0)");
    emphasize(`${srcId}:circle`, "circle-stroke-width", 3, 0);
    emphasize(`${srcId}:outline`, "line-color", "#ffcc00", "rgba(110,110,110,1)");
    emphasize(`${srcId}:outline`, "line-width", 3, 1);
    emphasize(`${srcId}:line`, "line-color", "#ffcc00", "#3b82f6");
    emphasize(`${srcId}:line`, "line-width", 4, 1.5);
  }

  /** The namespaced sub-layer ids for a logical layer (whether or not each exists yet). */
  subLayerIds(layerId: string): string[] {
    const srcId = `lyr:${layerId}`;
    return SUBLAYER_KINDS.map((k) => `${srcId}:${k}`);
  }
}

/** The namespaced sub-layer kinds a logical layer is split into. */
const SUBLAYER_KINDS = [
  "fill",
  "outline",
  "line",
  "circle",
  "symbol",
  "raster",
  "cluster",
  "cluster-count",
] as const;

/**
 * Build a WMS 1.3.0 `GetMap` tile URL template from a base endpoint plus the layer's source params.
 * Uses EPSG:3857 with MapLibre's `{bbox-epsg-3857}` token and 256×256 tiles. `layers` may live under
 * `source.layers` or `source.wmsLayers`; `styles`/`format`/`version` are optional with sane defaults.
 */
function buildWmsTileUrl(base: string, source: Record<string, unknown>): string {
  const layersParam = String(source.layers ?? source.wmsLayers ?? "");
  const styles = source.styles !== undefined ? String(source.styles) : "";
  const format = source.format !== undefined ? String(source.format) : "image/png";
  const version = source.version !== undefined ? String(source.version) : "1.3.0";
  const params: Record<string, string> = {
    service: "WMS",
    request: "GetMap",
    version,
    layers: layersParam,
    styles,
    format,
    transparent: "true",
    // WMS 1.3.0 uses CRS; 1.1.1 uses SRS — supply both harmlessly.
    crs: "EPSG:3857",
    srs: "EPSG:3857",
    width: "256",
    height: "256",
  };
  const sep = base.includes("?") ? "&" : "?";
  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  // `{bbox-epsg-3857}` is a MapLibre-expanded token; keep it unencoded.
  return `${base}${sep}${query}&bbox={bbox-epsg-3857}`;
}
