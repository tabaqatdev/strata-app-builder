# Recipe — MapViewer

> **One-sentence purpose.** An embeddable, header-less map that fills its container and exposes *every*
> strata-app-builder component as on-demand floating panels — the reference **bench** that proves a
> `layers.json` renders end-to-end, and the drop-in **map control** any other app can embed.
>
> `Template: open-design` · **Data:** any `layers.json` (default `WebMaps/dc.json`)

Authored against [`COMPONENT-MANIFEST.md`](../COMPONENT-MANIFEST.md) (config truth) and
[`DESIGN-REQUEST-PROMPT.md`](../DESIGN-REQUEST-PROMPT.md) (method). Every `type`, prop, trigger, action, and
token below is a real registry key.

---

## 1 · Business analysis

| | |
|---|---|
| **Personas** | (a) a **developer/QA** embedding a fully-featured map who must confirm every component renders against a given spec; (b) an **app author** who wants a ready-made, full-bleed map control to drop into a page without rebuilding the chrome. |
| **Decisions they make** | "Does this `layers.json` render correctly in *every* component?" · "Which panel exposes capability X?" · "Can I embed this map and share its store?" |
| **Purpose sentence** | *See it all against one spec, and reuse the whole thing as a control.* |
| **Data model** | One `layers.json`. Panels read the shared `@strata/state` **store** (visibility/opacity/order/basemap/highlight/**active layer**/interaction mode). The **active layer** (set by clicking a layer row) is the default target for identify, table, edit, and attachments. |

## 2 · Candidate silhouettes (and the pick)

- **A — Full-bleed map + top-left control stack + hamburger → floating windows** *(the ArcGIS Map Viewer shape)*. Header-less, so it embeds cleanly. **← picked.**
- B — Map + a fixed left dock (`panel`). Cleaner on desktop, but the dock is outer chrome that fights embedding.
- C — Map + bottom sheet (mobile-first). Great on phones, weak as a desktop bench.

**Pick A** — it's the only silhouette that stays *header-less and container-filling*, which is the whole
reuse claim. All chrome is an **overlay** (`mode:"fixed"` container → absolutely-positioned children).

## 3 · Layout skeleton (desktop; phone below)

```
┌───────────────────────────────────────────────┐
│ ☰  ← controller (hamburger → floating panels)  │   panels open as
│ ⊕⊖⌖  navigation                                │   draggable windows:
│ 📏✏️  measure · draw · coordinates · search     │   ┌── Layers ──┐
│                                                │   │ …          │
│                 «  full-bleed map  »           │   └────────────┘
│                                                │
│ 📍 lng,lat · z · scale · CRS · active: <layer> │ ← status-bar overlay (bottom-left)
└───────────────────────────────────────────────┘
```
**Phone:** the control stack collapses to the `☰` only; panels open full-width as bottom sheets
(`panel` `responsive.small → dock:"bottom"`).

## 4 · AppLayout sketch (manifest-grounded)

One `fixed` page; the root is a `mode:"fixed"` container so the `map` fills `inset:0` and every control is an
overlay. The **`controller`** widget *is* the hamburger → floating-panel dock (its `tools[]` are the panels).

```jsonc
{
  "version": "1",
  "theme": { "mode": "auto", "colors": { "primary": "#2b6cb0" },
             "variables": { "--strata-surface-blur": "8px" } },   // glassy floating panels
  "pages": [{
    "id": "bench", "type": "fixed",
    "root": { "kind": "column", "mode": "fixed", "children": [
      { "kind": "widget", "widget": { "id": "map", "type": "map",
          "props": { "config": { "$ref": "layers.json" },
                     "controls": { "navigation": true, "geolocate": true, "fullscreen": true, "scale": true },
                     "askEnabled": true },
          "style": { "position": "absolute", "inset": "0" } } },

      // top-left overlay stack: map-tool widgets that reach the map via the MapRegistry
      { "kind": "column", "style": { "position": "absolute", "top": "12px", "left": "12px", "gap": "8px" },
        "children": [
          { "kind": "widget", "widget": { "id": "measure", "type": "measure", "props": { "units": "metric" } } },
          { "kind": "widget", "widget": { "id": "draw",    "type": "draw" } },
          { "kind": "widget", "widget": { "id": "coords",  "type": "coordinates" } },
          { "kind": "widget", "widget": { "id": "search",  "type": "search" } }        // inject nominatimProvider()
      ]},

      // the hamburger dock: each tool's `content` is a strata panel widget
      { "kind": "widget", "style": { "position": "absolute", "top": "12px", "left": "12px" },
        "widget": { "id": "dock", "type": "controller", "props": {
          "openIds": ["layers", "legend"],
          "tools": [
            { "id": "layers",   "label": "Layers",      "content": { "type": "layer-panel" } },
            { "id": "basemap",  "label": "Basemap",     "content": { "type": "basemap" } },
            { "id": "legend",   "label": "Legend",      "content": { "type": "legend" } },
            { "id": "table",    "label": "Table",       "content": { "type": "table",  "dataSource": { "sourceId": "active" } } },
            { "id": "chart",    "label": "Charts",      "content": { "type": "chart" } },
            { "id": "carto",    "label": "Cross-filter","content": { "type": "carto" } },
            { "id": "time",     "label": "Time",        "content": { "type": "date-filter" } },
            { "id": "query",    "label": "Query (SQL)", "content": { "type": "query" } },
            { "id": "analysis", "label": "Analysis",    "content": { "type": "analysis" } },
            { "id": "bookmarks","label": "Bookmarks",   "content": { "type": "bookmarks" } },
            { "id": "ask",      "label": "Ask the map", "content": { "type": "feature-info" } },
            { "id": "edit",     "label": "Edit",        "content": { "type": "table" } },   // EditPanel when a writable ESRI backend is supplied
            { "id": "attach",   "label": "Attachments", "content": { "type": "feature-info" } }
          ] } } },

      { "kind": "widget", "style": { "position": "absolute", "left": "12px", "bottom": "12px" },
        "widget": { "id": "status", "type": "status-bar", "props": { "crs": "EPSG:4326", "precision": 5 } } }
    ]}
  }],
  "connections": [ /* §5 */ ]
}
```

## 5 · Connections (the WIF)

Most linking is free via **DataSource** (`sourceId`/`layerId`): the `table`/`chart`/`kpi` bound to the active
layer stay in sync with **no connections**. The explicit wiring makes the map the shared canvas:

| from | trigger | to | action | options | behavior |
|---|---|---|---|---|---|
| `table` | `rowSelect` | `map` | `zoomTo` | `{layerId:"<active>"}` | click a row → fly + select on the map |
| `table` | `rowSelect` | `map` | `flash` | `{layerId:"<active>"}` | the selected feature pulses |
| `chart` | `categorySelect` | `map` | `filter` | — | click a bar → `definitionExpression` on the map |
| `carto` | `categorySelect` | `map` | `filter` | — | CARTO category → cross-filter the map in place |
| `query` | `filterChange` | `map` | `filter` | — | the AND/OR builder's WHERE drives the map; its output rows feed the `table` via `dataSource.fromWidget:"query"` |
| `date-filter` | `filterChange` | `map` | `filter` | — | the time window filters a time-enabled layer |
| `draw` | `sketchComplete` | `map` | `selectByGeometry` | `{predicate:"intersects"}` | sketch a polygon → select features under it |

## 6 · Theme & visual character

Structured `theme`, `mode:"auto"` (follows the OS), a single `primary` hex — so the bench shows **real
hover/active/focus states + motion** (from the injected theme stylesheet) instead of a flat look. A small
`--strata-surface-blur` gives the floating panels a glassy, modern feel over the map. Two sentences: *a quiet,
neutral shell that lets the map and its data carry the color; the only chrome is a translucent control stack
and status strip, so the component reads as "just a map" until you open a tool.*

## 7 · Data bindings

| widget | layer / source | field(s) | verified against |
|---|---|---|---|
| `layer-panel` · `legend` · `basemap` | the store's `operationalLayers` / `baseMap` | — | `layers.json` |
| `table` (active) | `dataSource.sourceId:"active"` (the clicked layer) | all | live via `loadFeatures` |
| `chart` · `carto` | aggregated attribute fields | categorical/numeric | the spec's `fields` |
| `date-filter` | a layer with `source.timeField` | that time field | `WebMaps/dc.json` `dc-crashes` `REPORTDATE` |
| `status-bar` | live map view | lng/lat/zoom/scale | runtime |

## 8 · Capability sweep

| Capability | Where MapViewer uses it |
|---|---|
| **Map + controls** | `map` (`navigation`/`geolocate`/`fullscreen`/`scale`) + `measure` · `draw` · `coordinates` · `search` widgets |
| **Panels** | `layer-panel` · `basemap` · `legend` · `table` · `chart` · `carto` · `filter`/`query` · `date-filter` · `feature-info` · `analysis` — all in the dock |
| **KPIs/charts** | `chart` (bar/line/pie/histogram/scatter); KPI/gauge are inherited by embedding apps, not shown on the bare bench |
| **Layout nodes** | `mode:"fixed"` container (overlays), `controller` (floating tool dock) |
| **Interactivity** | DataSource `sourceId` linking + the §5 `connections` |
| **Theme / i18n** | structured `theme` (`auto`), RTL-safe widgets (add a `lang-switch` when embedded in a bilingual host) |
| **Deliberately *not* here** | `header`/`footer`/`splash`, `page-nav`, `views`/`swipe` — MapViewer is **header-less and single-surface by design** (that's the reuse claim). Those belong to a host app like the [`showcase`](../showcase/RECIPE.md). |

## 9 · Guided wizard

| # | Question | Options → **default** | Feeds |
|---|---|---|---|
| 1 · Data | Which `layers.json`? | sample DC map · your FeatureServer URL(s) · a saved spec → **sample DC map** | `map.config` |
| 2 · Dock | Which panels in the `☰` dock? `[multi]` | Layers · Basemap · Legend · Table · Charts · Cross-filter · Time · Query · Analysis · Bookmarks · Ask · Edit · Attachments → **all** | `controller.tools` |
| 3 · Tools | Top-left map tools? `[multi]` | measure · draw · coordinates · search → **all** | overlay stack |
| 4 · Open | Panels open on launch? | any → **Layers + Legend** | `controller.openIds` |
| 5 · Embed | Standalone, or embedded in another app? | standalone · **embed** | mount |
| 6 · Theme | Theme + language? | `auto`/light/dark · EN / EN+AR (RTL) → **auto / EN** | `theme` |

## 10 · Prompt-script (run in order)

```
A. /new-app — an embeddable, header-less "MapViewer". One fixed page whose root is a mode:"fixed" container
   so <StrataMap> fills inset:0. Structured theme mode:"auto", one primary hex, --strata-surface-blur for
   glassy panels. Start from WebMaps/dc.json (or the user's layers.json). Install deps + run command.
B. Overlay a top-left stack of map-tool widgets: measure, draw, coordinates, search (inject nominatimProvider).
   Add a bottom-left status-bar (crs EPSG:4326).
C. Add a `controller` widget as the ☰ dock; each tool's content is a panel: layer-panel, basemap, legend,
   table (dataSource.sourceId "active"), chart, carto, date-filter, query, analysis, bookmarks, feature-info.
   openIds: layers, legend.
D. Active-layer concept: clicking a layer-panel row sets store.activeLayerId; the table/edit/attachments/
   identify target it and the status-bar names it.
E. Wire §5 connections (table rowSelect → zoomTo/flash; chart/carto categorySelect → filter; query/date-filter
   filterChange → filter; draw sketchComplete → selectByGeometry). Bind the table to the active source so it
   links with no connections.
F. /popup each layer so identify shows genuine popupInfo. For draw/measure add terra-draw +
   terra-draw-maplibre-gl-adapter + @turf/turf to Vite optimizeDeps.include so the lazy imports resolve.
G. Embed: because MapViewer has no outer chrome and fills its container, other apps mount it as their map
   control (share the store to keep panels in sync). The showcase embeds it as its "Map Bench" window.
```

## 11 · Verify · gaps · risks

**Verify:** every dock panel opens as a floating window with no console errors · the active layer drives
table/identify · measure/draw revert to `identify` when done · a table row zooms+flashes the map · a chart
category filters it · the status-bar tracks the view · the whole component embeds in a parent and shares its
store.

**Honest gaps (unchanged from the platform):** `edit`/attachments need a **writable, authenticated ESRI**
backend (Strata Serve is read-only; the panels render read-only otherwise); agentic "Ask the map" is a
**deterministic** parser this release, so `feature-info` + `query` cover structured questions; `directions`
needs an external routing service you inject.

**Risks:** the dock can crowd on small screens → the `responsive.small` rule collapses panels to bottom
sheets; too many open panels over the map hurts readability → default `openIds` to just Layers + Legend.
