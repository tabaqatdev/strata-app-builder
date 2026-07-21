# @strata/auth-arcgis

Optional ArcGIS authentication adapter over Esri's **`@esri/arcgis-rest-request`**
(`ArcGISIdentityManager` / `ApiKeyManager`).

## ⚠️ ESRI Enterprise / ArcGIS Online backends ONLY

The **Strata Serve server does not yet implement the ArcGIS Enterprise Portal auth/authorization/token
model** (it is planned). This adapter therefore **only** supports ESRI backends — `createArcGISAuth` and
`assertEsriBackend` **throw** for a `strata` backend. For Strata secured services, use Strata's own token
flow when it ships. Re-evaluate once Strata Serve gains portal-grade authentication.

The Esri library is an **optional peer dependency**, lazy-loaded:

```bash
pnpm add @esri/arcgis-rest-request
```

## API
```ts
import { createArcGISAuth, assertEsriBackend, supportsArcGISAuth } from "@strata/auth-arcgis";

// ESRI backend only — throws for backend "strata"
const auth = await createArcGISAuth({
  backend: "esri-enterprise",
  portalUrl: "https://your.enterprise/portal/sharing/rest",
  username: "…", password: "…",         // or { apiKey } or { token }
});
// pass `auth` as `authentication` to @strata/feature-arcgis calls
```

`supportsArcGISAuth(backend)` returns `false` for Strata so callers can branch (e.g. fall back to Strata's
token flow or OSM/OSRM providers).
