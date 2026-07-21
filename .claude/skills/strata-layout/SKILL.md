# strata-layout skill pack

Compose apps in different layouts. The map is a component (`<StrataMap mapId>`), not a whole app; widgets
render on the canvas or anywhere on the page.

## Presets (§4.2)
- **FullPage** — map fills the viewport. Container `position:absolute; inset:0`.
- **MapInScroll** — map as a sized section inside a scrolling page (optionally `sticky`); charts/tables in
  the page flow.
- **SplitDashboard** — map + a panel region (resizable).
- **MultiMap** — two+ `<StrataMap>` instances, optionally view-synced (linked extent / swipe compare).

## Surfaces
Each widget takes `surface`:
- `surface="canvas"` → floating/dockable panel over the map (`dock="top-right"`).
- `surface="page"` → React portal into any DOM node (`slot="#sidebar"`), in normal page flow.
Both stay bound to `mapId` (selection/filter/zoom stay synced).

## The declarative app layout engine (J.5 — `<StrataApp>`)
For a **whole app** (not just a map + a few widgets), author an **`AppLayout` JSON** and render it with
**`<StrataApp config={AppLayout}>`** (strata-app-builder's Experience-Builder-class layout+widgets). Author it with
`/app`. The app layout is **separate from** the ESRI Web Map `layers.json` — it *references* the map, never
replaces it.
- **Shape** (`@strata/schema`): `AppLayout` → `AppPage[]` → `LayoutNode` (containers `row`/`column`/`grid`/
  `section`/`card`, each with **`mode: fixed|flow`** — absolute overlay vs page flow — and **responsive**
  `small`/`medium`/`large` overrides) → `WidgetNode` (`WidgetSpec` `{ type, props, dataSource }`).
- **Registry** (`react/app/registry.ts`): `defaultWidgetRegistry` maps a `type` → component
  (map/card/list/text/image/button/menu/kpi/gauge/chart/table/carto/legend/status-bar/layer-panel/
  **theme-switch**/**lang-switch**); extend with `mergeRegistry`. The renderer honors fixed vs flow +
  `useBreakpoint`.
- **Theme + switchers**: set `AppLayout.theme = themeTokens(name)` (`@strata/theme`: light/dark/hazard/muted).
  For a bilingual or dual-theme app, put a `theme-switch` and/or `lang-switch` in a header row by default —
  `theme-switch` writes the preset tokens onto the app root at runtime; `lang-switch` toggles the
  `I18nProvider` locale and mirrors RTL. Cheap polish that makes the first build feel finished.
- **Templates** (`react/app`): `dashboardTemplate`, `cardGalleryTemplate`, `scrollingStoryTemplate` — the
  starters behind the Gallery/Portfolio/Exhibit/Attachment recipes.
- **Section + Views + slides** (`kind:"views"`): swap views via `nav:"tabs"|"slides"`; a view's `mapState`
  (`viewpoint`/`definitionExpression`/`activeLayers`) drives the map (store) — build exhibits/slideshows this
  way. **Accordion** (`kind:"accordion"`, `titles[]`) and **Flow Row** (`kind:"flow-row"`) are two more
  container primitives; any container takes an entrance `animate` (`fade`/`slide`/`scroll-reveal`).
- **Design widgets**: `swipe` (two panes + draggable divider — drop two `map`s in to compare), `bookmarks`
  (saved viewpoints → fly-to via the store), `controller` (a tool dock — toggle buttons that show/hide
  panels, so a multi-tool app stays uncluttered; **put secondary panels behind a controller by default**),
  and `share` (deep-link + embed of the current view/basemap/filters).

## The data-action bus (`@strata/actions`)
Cross-drive widgets/panels off each other (not just the map): an `ActionBus` with triggers → actions
(`categorySelect`/`rowSelect`/`filterChange`/`extentChange`), `categoryWhere`/`rangeWhere` helpers, and
`connectBusToStore`. `CartoPanel` (emits `categorySelect`) and `AttributeTablePanel` (emits `rowSelect`)
accept an optional `bus` — pass it to make a category/row click cross-filter *every* widget + the map.

## Recipes
1. **COP wall** — `FullPage` + legend/summary `surface="canvas"` + incident table `surface="page"` drawer.
2. **Scrolling report** — `MapInScroll` (sticky) + charts `surface="page"` flowing beside the map.
3. **Compare** — `MultiMap` two maps, `sync:true`, a `swipe` panel.
4. **Dashboard app** — `<StrataApp>` + `dashboardTemplate`: a `map` widget + KPI/gauge/chart/table widgets in
   a `grid`, cross-filtered through the actions bus.
5. **Gallery / story** — `cardGalleryTemplate` (`ListGallery` of `Card`s + category facets) / `scrollingStoryTemplate`
   (sticky `map` + `Text`/`Image` sections in flow).

## Known traps
- Give MapInScroll a fixed height; call `map.resize()` after layout changes.
- Each map instance owns its own store — pass the right `mapId` to page-side widgets.
- The **app layout JSON is not `layers.json`** — keep them separate; the app references the map spec.
- `mode:fixed` containers position absolutely (canvas overlays); `mode:flow` go in normal page flow.
