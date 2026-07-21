---
description: Compose a declarative app layout (AppLayout JSON) for <StrataApp> from a template — dashboard, gallery, or story.
argument-hint: [dashboard|gallery|story] [--map layers.json] [--pages …] [--bilingual]
---

Author a declarative **app layout** for `<StrataApp config={AppLayout}>` (the J.5 layout engine —
strata-app-builder's AI-authored equivalent of Experience Builder's layout+widgets). The **app layout is JSON**
and is **separate from** the ESRI Web Map `layers.json` it references — `/create-map` writes the map,
`/app` writes the app around it.

## The AppLayout shape (`@strata/schema`)
`AppLayout` → `AppPage[]` → `LayoutNode` (containers) → `WidgetNode`:
- **Containers** — `row` · `column` · `grid` · `section` · `card` · **`accordion`** (collapsible stack, per-item
  `titles`) · **`flow-row`** (wrapping row), each with `mode: fixed|flow`, an optional entrance **`animate`**
  (`fade`/`slide`/`scroll-reveal`), and **responsive** `small`/`medium`/`large` overrides.
- **Section + Views** — a **`views`** node (`{ kind:"views", nav:"tabs"|"slides", views:[{id,title,content,mapState}] }`)
  swaps between views; a view's `mapState` (`viewpoint`/`definitionExpression`/`activeLayers`) drives the map
  via the store — this is how you build a **slideshow / exhibit** where each slide sets its own view + filter.
- **Widgets** — a `WidgetSpec` `{ type, props, dataSource }`. `type` resolves through the
  **`defaultWidgetRegistry`** (`map`/`card`/`list`/`text`/`image`/`button`/`menu`/`kpi`/`gauge`/`chart`/
  `table`/`carto`/`legend`/`status-bar`/`layer-panel`/`theme-switch`/`lang-switch`/`data-actions`/`filter`/
  `date-filter`/`feature-info`/`swipe`/`bookmarks`/`controller`/`share`/`near-me`/`add-data`/
  `weighted-overlay`/`elevation`); extend with `mergeRegistry`.

## Theme + header switchers (default polish)
Set `AppLayout.theme = themeTokens(name)` from `@strata/theme` (light/dark/hazard/muted). **When the app is
bilingual or you offer more than one theme, add a small header row with the runtime switchers by default:**
a `theme-switch` widget (`{ type:"theme-switch", props:{ initial:"<name>", themes:[…] } }`) and, if bilingual,
a `lang-switch` widget (`{ type:"lang-switch" }`, inside the `I18nProvider`). They cost nothing and make the
app feel finished on the first build.

## Start from a template
Pick a starter and adapt it (`@strata/core-map/react/app`):
- **dashboard** → `dashboardTemplate` — a `map` widget + KPI/gauge/chart/table widgets in a grid; wire
  cross-filtering via the **`@strata/actions` bus** (a category/row click drives the other widgets + map).
- **gallery** → `cardGalleryTemplate` — a `ListGallery` repeating a `Card` over items (open-data hub /
  portfolio / exhibit); category facets via the actions bus.
- **story** → `scrollingStoryTemplate` — a sticky `map` with `Text`/`Image` sections in flow (scrolling
  exhibit).

## Steps
1. Choose the template; set the `map` widget's `dataSource` to the `layers.json` you built with `/create-map`.
2. Lay out containers (`row`/`column`/`grid`/`section`/`card`), choosing `mode:fixed` for canvas overlays
   and `mode:flow` for page sections; add `small`/`medium`/`large` responsive overrides.
3. Place widgets by `type`; bind data widgets to a layer via `dataSource`. **Give every interactive widget a
   stable `id` and emit a populated `AppLayout.connections` block** so the app is alive on the first build —
   see the `strata-interactivity` skill. `<StrataApp>` reads `connections`, creates a shared `ActionBus`, and
   wires it at mount (e.g. `{from:"chart", trigger:"categorySelect", to:"map", action:"filter", options:{layerId}}`).
   Pass a `store` in the app `context` so `filter` applies **in place** (`setDefinition`, no remount). Add a
   `data-actions` widget for quick actions on a selection, and use `dataSource.fromWidget` to chain a widget's
   output into another (W2).
4. If `--bilingual`, wrap in `I18nProvider` (EN/AR), add a `lang-switch` to the header, and set RTL; keep the
   map the hero. Add a `theme-switch` to the header whenever more than one theme makes sense.
5. Write the `AppLayout` JSON and show where `<StrataApp>` mounts it.

Keep the ESRI Web Map JSON contract intact — the app layout only *references* `layers.json`, never replaces it.
