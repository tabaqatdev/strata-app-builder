# @strata/plugin-routing

Routing / directions / nearest-facility plugin for Strata. Ships a **keyless public-OSRM**
provider, a dependency-free **`nearest`** helper (haversine), and an optional, **lazy Esri routing**
provider. `routingPlugin` registers a directions panel and draws the route as a GeoJSON layer via
the app API.

## API

```ts
import {
  routingPlugin,
  osrmProvider,
  esriRouteProvider,
  nearest,
  type RoutingProvider,
  type RouteResult,
  type Waypoint,
} from "@strata/plugin-routing";
```

- `Waypoint = [lng, lat]`
- `RouteResult = { geometry: GeoJSON.LineString; distanceMeters: number; durationSeconds: number }`
- `RoutingProvider = { name; route(waypoints, opts?) => Promise<RouteResult> }`
- `osrmProvider(options?)` — public OSRM (keyless, driving).
- `esriRouteProvider({ token, url? })` — optional, lazy over `@esri/arcgis-rest-routing`.
- `nearest(from, candidates)` — nearest candidate by haversine distance (`null` if none).
- `routingPlugin(provider, { onRoute? })` — the `StrataPlugin`.

## Example

```ts
import { PluginManager } from "@strata/plugins";
import { routingPlugin, osrmProvider, nearest } from "@strata/plugin-routing";

const manager = new PluginManager();
manager.register(routingPlugin(osrmProvider()));
manager.activate("strata.routing", app); // `app` is the host StrataAppAPI

// Nearest facility to a point:
const closest = nearest(
  [-0.1278, 51.5074],
  [
    { id: "depot-a", lng: -0.09, lat: 51.51 },
    { id: "depot-b", lng: -0.2, lat: 51.49 },
  ],
);
// → { id: "depot-a", distanceMeters: ... }
```

The panel takes waypoints (one `lng, lat` per line), solves a route, and adds it as a `GeoJSON`
operational layer (a genuine ESRI simple-line renderer). Pass `onRoute` to react to each result
(e.g. fit bounds to the line).

## OSRM note

The default endpoint is the **public OSRM demo server**
(`https://router.project-osrm.org`). It is a shared, **rate-limited** demo, **driving-only**, with
**no SLA** — fine for prototypes, not for production. Self-host OSRM and pass a custom `endpoint`
for anything real:

```ts
osrmProvider({ endpoint: "https://osrm.your-org.internal" });
```

## Esri routing note

`esriRouteProvider` is a thin, lazy wrapper over Esri's routing REST JS. **Esri routing is not
keyless** — it needs an Esri API key/token, consumes credits, or requires a proxy backend. Install
the optional peer deps only in apps that use it:

```bash
pnpm add @esri/arcgis-rest-routing @esri/arcgis-rest-request
```

A clear error is thrown at call time if the peer dep is missing, so the lean core builds without it.

---

Uses nominative Esri marks under Esri's brand guidelines. Strata coexists with ArcGIS; it does not
replace it.
