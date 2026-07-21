/**
 * MapController — owns the single MapLibre map instance and exposes a small imperative view API.
 *
 * Ported (once) from the Strata GeoAI client's map_core.js. Keeps the `ready` promise as the sync
 * primitive, enables RTL text (Arabic), and self-hosts glyphs. Engine-isolation boundary: only this
 * module, `layers`, `basemaps`, and `popups` touch `maplibregl.*` directly.
 *
 * NOTE (v0.1.0): typed against `any` for the maplibre map to avoid a hard build-time dependency in the
 * template scaffold. Wire `maplibre-gl` as a peer dependency in the app and pass the constructor in.
 */

import type { LayersJson } from "@strata/schema";

export interface MapControllerOptions {
  container: HTMLElement;
  /** The maplibre-gl module (injected so the template has no hard dependency at build time). */
  maplibregl: any;
  glyphs?: string;
  rtlTextPluginUrl?: string;
}

const HOME = { center: [0, 20] as [number, number], zoom: 2 };

export class MapController {
  readonly map: any;
  readonly ready: Promise<void>;

  constructor(opts: MapControllerOptions) {
    const { maplibregl, container, glyphs, rtlTextPluginUrl } = opts;
    if (rtlTextPluginUrl && maplibregl.setRTLTextPlugin) {
      try {
        maplibregl.setRTLTextPlugin(rtlTextPluginUrl, true);
      } catch {
        /* already set */
      }
    }
    this.map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: glyphs || "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
      },
      center: HOME.center,
      zoom: HOME.zoom,
      dragRotate: false,
      pitchWithRotate: false,
      // Required so @strata/export exportImage() can capture the canvas to a data URL.
      preserveDrawingBuffer: true,
    });
    this.ready = new Promise((resolve) => this.map.on("load", () => resolve()));
  }

  getCenter(): [number, number] {
    const c = this.map.getCenter();
    return [c.lng, c.lat];
  }

  getZoom(): number {
    return this.map.getZoom();
  }

  getBoundsArray(): [number, number, number, number] {
    const b = this.map.getBounds();
    return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
  }

  flyTo(center: [number, number], zoom?: number, animate = true): void {
    const opts: any = { center, zoom: zoom ?? this.getZoom() };
    animate ? this.map.flyTo(opts) : this.map.jumpTo(opts);
  }

  fitBounds(bbox: [number, number, number, number], padding = 40, animate = true): void {
    this.map.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding, animate }
    );
  }

  home(): void {
    this.map.easeTo({ center: HOME.center, zoom: HOME.zoom });
  }

  resize(): void {
    this.map.resize();
  }

  /** Fly to a layers.json initialState viewpoint (an ESRI extent envelope). */
  applyInitialState(config: LayersJson): void {
    const g = config.initialState?.viewpoint?.targetGeometry;
    if (g) this.fitBounds([g.xmin, g.ymin, g.xmax, g.ymax]);
  }

  destroy(): void {
    this.map.remove();
  }
}
