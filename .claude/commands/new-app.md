---
description: Guided wizard — interview the user, then scaffold a working GIS app on strata-app-builder and install deps.
argument-hint: [optional one-line description of the app]
---

Run a **guided, branching interview** to understand what the user wants, then scaffold the app, wire the
chosen layout/panels/plugins/proxy/auth, install exactly the needed dependencies, and print the run command.

## How to run the interview
- In **Cowork**, ask each group with the multiple-choice question UI (one screen per group).
- In the **CLI**, ask concise numbered questions. Either way: **one group at a time, teach each option with a
  one-line "what this gives you", branch on answers, and offer a recommended default so "accept all" works.**
- **Progressive disclosure:** start with Intent + Data; only ask later groups when relevant.

## Question groups (branch with `→`)
1. **Intent** — What are you building? (COP / situational map · open-data hub / catalog · analytics dashboard
   · public info map · field/asset viewer · other). Primary audience? (operators · public · analysts · mixed).
2. **Data** — Where's your data? (ArcGIS FeatureServer *public* · ArcGIS *secured* · Strata Serve server ·
   local files GeoJSON/GDB/Shapefile/CSV · cloud bucket · **a starter map template** — World / USA / a
   country / a US state from `WebMaps/`, copied in as `layers.json` so the map opens with
   real layers · **the universal sample** — world countries + cities). → if Serve: path to
   `server_config.toml`. → live/near-real-time refresh?
3. **Layout** — Full-page · Map-in-scroll · Split dashboard · Multi-map compare · **declarative app**
   (`<StrataApp>` — dashboard / card-gallery / scrolling-story template). Bilingual **EN/AR + RTL**
   (`@strata/i18n`)? **Theme** — pick a `@strata/theme` preset (**light · dark · hazard · muted**);
   `themeTokens(name)` fills `AppLayout.theme` and the map basemap is paired to it (light → `osm`, dark →
   `osm-dark`). Panels on the map canvas, docked in the page, or both?
   → **Map tools** — *one compact multi-select*: "Every map already has zoom, home, layers, basemap, legend
   and full screen. Which extras does this app need? search · locate · measure · draw · print · scale bar
   — default: none." Write the tool picks to the map widget's `mapControls.tools` and a scale-bar pick as
   `mapControls.scale: true` (ask metric/imperial/both only if it matters); never add one by default.
4. **Connectivity** → *only if cross-origin data* — CORS: Vite dev-proxy · CORS on your Serve server ·
   standalone proxy (Node / Rust / Python-FastAPI, see `strata/reference/proxy-*`). → *if secured*: token ·
   username/password→token · OAuth (arcgis-rest adapter).
5. **Capabilities / plugins** — (place search is the `search` map tool from group 3) · Routing/nearest (none/OSRM/Esri) · Panels
   *(multi)*: attribute table/filter/charts/statistics/list/**carto**/**edit**/**attachment**/swipe/bookmarks ·
   Temporal *(multi)*: **time slider** + **time-series/hydrograph** · Editing (writable+authed **ESRI**
   backend only) · Spatial analysis (Turf, `@strata/processing`) *(multi)*: buffer/spatial-join/nearest/
   select-by-location/dissolve/clip · Extra map widgets *(multi)*: **status bar**/minimap (the map tools were
   asked in group 3) · Widgets *(multi)*: KPI/gauge/sparkline/stat/card/gallery · Cross-filter via the
   **`@strata/actions`** bus · Advanced: SQL workspace / deck.gl.
6. **Export** *(multi)* — image PNG · print PDF · shareable web-map spec · layer data (GeoParquet/GeoJSON/CSV).
7. **Publishing** → *only if Serve / local files* — publish to the Serve server now? (→ run `/publish`).
8. **Delivery** — deployment target (static / Docker / serverless / desktop) · offline PWA? · install deps
   now and scaffold? (default yes).

## Then scaffold
- **Apply the chosen theme coherently.** Set `AppLayout.theme = themeTokens(name)` (`@strata/theme`) and pair
  the map to it with `baseMapFromPreset(basemapForTheme(mode))` — a light UI gets `osm`, a dark UI `osm-dark`
  (OpenStreetMap; Esri/CARTO only if the user asks and accepts their non-commercial terms). This
  one choice makes the whole app read as designed on the first build. At runtime the pairing **keeps
  itself**: switching the theme swaps the basemap to its pair, so give any `theme-switch` an `initial`
  matching `theme.mode` (the authored basemap wins on mount, so a mismatch shows until the first click).
- **Every map gets the standard map controls** (`@strata/map-controls`) — never hand-build zoom/layers/
  basemap/legend chrome. React apps get it through the `map` widget / `MapChrome`; set `mapControls.tools`
  to exactly the tools picked in group 3 (none ⇒ omit `tools`), and `mapControls.scale` only if a scale
  bar was picked. A **vanilla (no-build) scaffold vendors the
  package** — `node strata/packages/map-controls/scripts/vendor.mjs <appDir>` — then mounts it with
  `mountMapControls`, and must pass the conformance check (`runMapControlsConformance` in
  `strata/packages/map-controls/scripts/conformance.mjs`) and the drift check
  (`node strata/packages/map-controls/scripts/check-drift.mjs <appDir>`). Details:
  `strata/docs/guide/map-controls.md`.
- Write `layers.json` (ESRI Web Map JSON — always) via `/create-map`; set symbology/popups via `/symbology`
  and `/popup`; add panels via `/panel`; wire the chosen plugins. **Default symbology to data-driven,
  palette-backed renderers** (`@strata/theme` `categorical`/`sequential`), not a flat single color.
- If the user picked the **declarative app** layout, also emit an **`AppLayout` JSON** for `<StrataApp>`
  via `/app` (a dashboard/gallery/story template) — this app layout is **separate from** `layers.json` and
  only *references* it. Register widgets from `defaultWidgetRegistry` (extend with `mergeRegistry`).
- **Wire cross-widget interactivity by default** — emit an `AppLayout.connections` block (the WIF; see the
  `strata-interactivity` skill) so the app cross-filters on the first build (chart brush → filter map+table,
  category → cross-filter, card/row → zoom). Pass a `store` in the app context so filters apply in place.
- **Keep it uncluttered** — put secondary panels behind a **`controller`** tool dock by default; add a
  **`share`** button, and **`bookmarks`** when there are notable places. For compare apps use a **`swipe`**;
  for exhibits use a **`views`** node with per-slide `mapState`.
- If **bilingual**, wrap the app in `I18nProvider` (`@strata/i18n`, EN/AR) and enable **RTL**.
- Install exactly the deps implied (`maplibre-gl`, `@strata/core-map`, `@strata/schema`,
  `@strata/map-controls`, and any of
  `@strata/processing`, `@strata/plugins`, `@strata/plugin-search`, `@strata/plugin-routing`,
  `@strata/plugin-timeslider`, `@strata/plugin-statusbar`, `@strata/state`, `@strata/actions`,
  `@strata/i18n`, `@strata/feature-arcgis`, `@strata/auth-arcgis`, a proxy, `echarts`…).
- Print the run command, then a **capabilities summary**: what you enabled **and what else is available**
  (point to `/guide` and `/help`).

Preserve the ESRI Web Map JSON contract on every path. Never invent a styling DSL.

## Scaffolded is not finished

`/new-app` produces a working app; it does not produce a *defensible* one. Before calling it done:

- **Verify every service before binding to it** — the probe in
  `strata/docs/how-to/find-and-verify-data.md` §2. A field name must never enter the app until a response
  has shown it. This is the rule the others exist to protect.
- **Walk the design checklist** — `strata/docs/guide/app-design.md` §7.
- **Walk the build gate** — `strata/docs/guide/building-apps.md` §7: three suites green (live, offline
  render, real headless Chrome), no hardcoded counts, contrast measured in both themes, nothing
  synthesized, every cap visible on screen.
- **Look at it.** Screenshot the first paint and confirm the app opens on a view where its own signature
  is visible. Suites that grep markup cannot see what a screen means — 297 green assertions once missed
  four defects one screenshot made obvious.

When the user has a **recipe**, use **`/recipe`** instead: it runs this whole path in order, refuses to
build a recipe whose data section is unverified, and reports the assertion counts at the end.
