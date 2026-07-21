/**
 * basemapPlugin — a minimal example built-in plugin.
 *
 * On activation it sets the map's basemap to the one it was configured with. Serves as the
 * canonical reference for how a plugin is shaped (id/name/version + activate/deactivate) and
 * how it round-trips a bit of state through a saved project.
 */

import type { BaseMap } from "@strata/schema";
import type { StrataPlugin } from "./types.js";

/** A sensible default basemap — **OpenStreetMap** (open-source, keyless). */
const DEFAULT_BASEMAP: BaseMap = {
  title: "OpenStreetMap",
  baseMapLayers: [
    {
      id: "osm",
      layerType: "WebTiledLayer",
      templateUrl: "https://tile.openstreetmap.org/{level}/{col}/{row}.png",
      copyright: "© OpenStreetMap contributors",
    },
  ],
};

export interface BasemapPluginOptions {
  basemap?: BaseMap;
}

export function basemapPlugin(options: BasemapPluginOptions = {}): StrataPlugin {
  let current: BaseMap = options.basemap ?? DEFAULT_BASEMAP;
  let previous: BaseMap | null = null;

  return {
    id: "strata.basemap",
    name: "Basemap",
    version: "0.3.0",
    activeByDefault: true,

    activate(app) {
      previous = app.getStore().getState().baseMap;
      app.setBaseMap(current);
    },

    deactivate(app) {
      // Restore whatever basemap was in place before we activated.
      if (previous) app.setBaseMap(previous);
    },

    getProjectState() {
      return { basemap: current };
    },

    applyProjectState(app, state) {
      const s = state as { basemap?: BaseMap } | null;
      if (s?.basemap) {
        current = s.basemap;
        app.setBaseMap(current);
      }
    },
  };
}
