# @strata/basemap-arcgis

The **optional** `@esri/maplibre-arcgis` adapter — Phase 5 of the Experience-Builder-parity plan.

strata renders MapLibre from **genuine ESRI `drawingInfo`/`popupInfo`** via its own compiler
(`@strata/core-map`). That compiler stays the renderer. This package only does the two things the Esri
plugin is actually for, then hands the result back to that compiler:

- **`loadArcgisBasemap({ style, token|session, … })`** — load an ArcGIS **basemap style** (and the 12-hour
  basemap-*session* cost model) → a MapLibre source descriptor.
- **`resolveArcgisService(idOrUrl, { token })`** — fetch a **feature / vector-tile service** by item id or
  URL → `{ source, drawingInfo, popupInfo, fields }`. You pass `drawingInfo` to strata's style compiler and
  `popupInfo` to its popup compiler. **The plugin fetches; strata styles.**

## Opt-in, keyless-first

Per `CLAUDE.md`, keyless OpenStreetMap basemaps stay the default. ArcGIS entries only appear when a
token/session is configured — use `arcgisBasemapEntry(style)` to add one to the `BasemapPanel` list.

## Lazy optional peer dependency

`@esri/maplibre-arcgis` is a **lazy optional peer dependency**. `loadMaplibreArcgis()` `import()`s it only
when an ArcGIS path is used and throws an actionable install error when it's absent:

```
pnpm add @esri/maplibre-arcgis
```

Every entry point also accepts an injected `module` (the plugin, or a mock), so the fetch→compiler division
is unit-tested without the plugin installed. Auth (short-lived, referer-bound tokens) reuses
`@strata/auth-arcgis`; tokens are never stored or printed.
