# @strata/plugin-search

Geocoding / place-search plugin for Strata. Ships a **keyless OSM Nominatim** provider and an
optional, **lazy Esri geocoding** provider. `searchPlugin` registers a search box and fits the map
to the chosen result via the app API.

## API

```ts
import {
  searchPlugin,
  nominatimProvider,
  esriGeocodeProvider,
  type SearchProvider,
  type SearchResult,
} from "@strata/plugin-search";
```

- `SearchResult = { label: string; lng: number; lat: number; bbox?: [minLng, minLat, maxLng, maxLat] }`
- `SearchProvider = { name; search(query, opts?) => Promise<SearchResult[]> }`
- `nominatimProvider(options?)` — OSM Nominatim (keyless).
- `esriGeocodeProvider({ token, url? })` — optional, lazy over `@esri/arcgis-rest-geocoding`.
- `searchPlugin(provider)` — the `StrataPlugin`.

## Example

```ts
import { PluginManager } from "@strata/plugins";
import { searchPlugin, nominatimProvider } from "@strata/plugin-search";

const manager = new PluginManager();
manager.register(
  searchPlugin(nominatimProvider({ email: "you@example.org" })),
);
manager.activate("strata.search", app); // `app` is the host StrataAppAPI
```

Selecting a result calls `app.fitBounds(...)` — with the result's `bbox` when present, else a
small box around its point.

## OSM Nominatim usage policy — please read

The default endpoint (`https://nominatim.openstreetmap.org/search`) is a shared community service
governed by the [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/):

- **Identify yourself.** Pass an `email` so requests carry a contact address. Browsers forbid
  setting a custom `User-Agent`, so `email` is the primary policy-compliant identifier here.
- **Keep volume low** — no heavy/bulk/autocomplete-on-every-keystroke usage on the public server.
  The plugin searches on Enter (not per keystroke) and defaults to `limit = 5`.
- **Self-host at scale.** For production, run your own Nominatim and pass `endpoint`:

```ts
nominatimProvider({ endpoint: "https://nominatim.your-org.internal/search" });
```

## Esri geocoding note

`esriGeocodeProvider` is a thin, lazy wrapper over Esri's geocoding REST JS. **Esri geocoding is
not keyless** — it needs an Esri API key/token or a proxy backend. Install the optional peer deps
only in apps that use it:

```bash
pnpm add @esri/arcgis-rest-geocoding @esri/arcgis-rest-request
```

A clear error is thrown at call time if the peer dep is missing, so the lean core builds without it.

---

Uses nominative Esri marks under Esri's brand guidelines. Strata coexists with ArcGIS; it does not
replace it.
