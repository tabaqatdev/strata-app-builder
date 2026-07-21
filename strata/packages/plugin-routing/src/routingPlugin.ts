/**
 * routingPlugin — a simple directions panel that lets the user enter waypoints, solves a route
 * via the provider, and draws it as a GeoJSON line layer through the app API.
 *
 * UI is plain DOM (via `StrataPanel.render` when the host exposes `registerPanel`, else a
 * floating panel on the document body). The drawn route is added with `app.addOperationalLayer`
 * as a `GeoJSON` operational layer; an optional `onRoute` callback also receives every result.
 */

import type { StrataPlugin, StrataAppAPI } from "@strata/plugins";
import type { OperationalLayer } from "@strata/schema";
import type { RoutingProvider, RouteResult, Waypoint } from "./types.js";

const PANEL_ID = "strata.routing.panel";
const ROUTE_LAYER_ID = "strata.routing.route";

export interface RoutingPluginOptions {
  /** Called with each solved route (in addition to drawing it), e.g. to fit bounds / show a UI. */
  onRoute?: (result: RouteResult) => void;
}

/** Parse "lng,lat" lines (one waypoint per line) into a Waypoint[]. */
function parseWaypoints(text: string): Waypoint[] {
  const out: Waypoint[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/[,\s]+/).map(Number);
    if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      out.push([parts[0], parts[1]]);
    }
  }
  return out;
}

/** Wrap a route geometry as a GeoJSON operational layer. */
function routeToLayer(result: RouteResult): OperationalLayer {
  return {
    id: ROUTE_LAYER_ID,
    title: "Route",
    layerType: "GeoJSON",
    source: {
      kind: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              distanceMeters: result.distanceMeters,
              durationSeconds: result.durationSeconds,
            },
            geometry: result.geometry,
          },
        ],
      },
    },
    layerDefinition: {
      drawingInfo: {
        // Genuine ESRI simple line renderer.
        renderer: {
          type: "simple",
          symbol: {
            type: "esriSLS",
            style: "esriSLSSolid",
            color: [0, 122, 194, 255],
            width: 4,
          },
        },
      },
    },
  };
}

function renderRoutingUI(
  container: HTMLElement,
  app: StrataAppAPI,
  provider: RoutingProvider,
  options: RoutingPluginOptions,
): () => void {
  const root = document.createElement("div");
  root.className = "strata-routing";

  const help = document.createElement("p");
  help.className = "strata-routing-help";
  help.textContent = "Waypoints — one per line as: lng, lat";

  const input = document.createElement("textarea");
  input.className = "strata-routing-waypoints";
  input.rows = 4;
  input.placeholder = "-0.1278, 51.5074\n-0.0754, 51.5085";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Route";

  const status = document.createElement("div");
  status.className = "strata-routing-status";
  status.setAttribute("aria-live", "polite");

  root.append(help, input, button, status);
  container.append(root);

  let drawn = false;
  let busy = false;

  const solve = async () => {
    if (busy) return;
    const waypoints = parseWaypoints(input.value);
    if (waypoints.length < 2) {
      status.textContent = "Enter at least two waypoints (lng, lat).";
      return;
    }
    busy = true;
    button.disabled = true;
    status.textContent = "Routing…";
    try {
      const result = await provider.route(waypoints);
      if (drawn) app.removeLayer(ROUTE_LAYER_ID);
      app.addOperationalLayer(routeToLayer(result));
      drawn = true;
      const km = (result.distanceMeters / 1000).toFixed(1);
      const min = Math.round(result.durationSeconds / 60);
      status.textContent = `${km} km · ${min} min`;
      options.onRoute?.(result);
    } catch (err) {
      status.textContent = err instanceof Error ? err.message : "Routing failed";
    } finally {
      busy = false;
      button.disabled = false;
    }
  };

  const onClick = () => void solve();
  button.addEventListener("click", onClick);

  return () => {
    button.removeEventListener("click", onClick);
    if (drawn) {
      try {
        app.removeLayer(ROUTE_LAYER_ID);
      } catch {
        /* host may have removed it already */
      }
    }
    root.remove();
  };
}

/**
 * A Strata plugin that adds a directions panel backed by `provider`.
 * Prefer `osrmProvider()` (keyless) or `esriRouteProvider({ token })`.
 */
export function routingPlugin(
  provider: RoutingProvider,
  options: RoutingPluginOptions = {},
): StrataPlugin {
  let panelCleanup: (() => void) | null = null;
  let floatingHost: HTMLElement | null = null;

  return {
    id: "strata.routing",
    name: "Routing",
    version: "0.3.0",

    activate(app) {
      if (app.registerPanel) {
        app.registerPanel({
          id: PANEL_ID,
          title: "Directions",
          placement: "left",
          render: (container) => renderRoutingUI(container, app, provider, options),
        });
        return;
      }

      if (typeof document === "undefined") return; // headless host
      floatingHost = document.createElement("div");
      floatingHost.className = "strata-routing-floating";
      floatingHost.style.position = "absolute";
      floatingHost.style.top = "12px";
      floatingHost.style.right = "12px";
      floatingHost.style.zIndex = "1000";
      document.body.append(floatingHost);
      panelCleanup = renderRoutingUI(floatingHost, app, provider, options);
    },

    deactivate(app) {
      if (app.unregisterPanel) app.unregisterPanel(PANEL_ID);
      if (panelCleanup) {
        panelCleanup();
        panelCleanup = null;
      }
      if (floatingHost) {
        floatingHost.remove();
        floatingHost = null;
      }
    },
  };
}
