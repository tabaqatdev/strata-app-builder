# DESIGN-CONTEXT — the knowledge pack for bespoke application designs

> **GENERATED — do not edit.** Rebuild with `python recipes/build_design_context.py`.

**Purpose.** Everything Claude needs to produce a **business-bespoke design proposal**, exploiting the
full capability surface of `strata/packages/*`. Attach this file **plus** the target `RECIPE.md` (or a
business brief), and follow `DESIGN-REQUEST-PROMPT.md` in this folder.

**The brief to the model:**

- Design **freestyle under the freestyle charter** (§10 of the Component Manifest, first section below):
  compose bespoke to the business from the **registry widgets and manifest config keys only**. If a needed
  widget does not exist, invoke the **§10.2 escape hatch** — propose it inside the widget contract
  (app-local registry override; props/bus/dataSource/theme rules) **with a named fallback**, documented as
  a §10.3 "New widget" block.
- Obey the design guideline: silhouette first, **≥3 live `connections`**, the signature loop working end
  to end, **verified fields only**, keyless basemaps, EPSG:4326, write paths only on an ESRI backend.
- Stay **distinct** — a new design must not read as a re-skin of a sibling recipe. The silhouettes and the
  visual-differentiation rules are in the template-library section.
- Deliverable shape: purpose sentence · silhouette + ASCII skeleton · `AppLayout` JSON sketch ·
  `connections` table · `ThemeSpec` (with the contrast measurement) · data bindings (layer + field per
  widget) · any "New widget" blocks · which template it descends from, or `open-design`.

**Contents**

1. **The Component Manifest — every widget, node, binding, trigger/action, theme key (+ §10 freestyle charter)**  — `recipes/COMPONENT-MANIFEST.md`
2. **Application design guideline — process, silhouettes, layout/wiring/theme rules, tiers, checklist**  — `strata/docs/guide/app-design.md`
3. **Component inventory — what exists and its status (shipped / partial / backend / planned)**  — `strata/docs/reference/components.md`
4. **Recipe anatomy — the contract a recipe must satisfy, and the Template: protocol**  — `recipes/README.md`
5. **The serialized template roster — AppLayout JSONs shipped in strata/templates/**  — `strata/templates/README.md`
6. **Package READMEs — per-package capability notes (all of strata/packages/*)**  — `strata/packages/*/README.md`
7. **Example A — a wired dashboard template (monitor)**  — `strata/templates/monitor.json`
8. **Example B — a floating-dock template with windows + controller (launchpad)**  — `strata/templates/launchpad.json`
9. **Example C — the kitchen-sink showcase AppLayout (every capability)**  — `recipes/showcase/app.json`


---

# PACK §1 · The Component Manifest — every widget, node, binding, trigger/action, theme key (+ §10 freestyle charter)

> Source: `recipes/COMPONENT-MANIFEST.md`

# strata-app-builder Component Manifest

*The single reference for building apps by recipe. Everything you can drop on a canvas — components, layout nodes, data bindings, interactivity, the map spec, and theming — with exact config. Source‑verified against `@strata/schema`, `@strata/core-map`, `@strata/actions`, `@strata/theme`. When you write a recipe, bind widgets and wire `connections` from this document; don't invent config keys.*

> **This is one of the reference docs sharing a single inventory spine** (see `../strata/docs/REFERENCE-DOCS.md`).
> The **code is the source of truth** — this manifest is source‑verified against it, kept honest by the
> docs‑reconcile test, and lists not‑yet‑built items only as `Planned (Phase N)` callouts. When a component
> is added/renamed, follow the update matrix in `../strata/docs/REFERENCE-DOCS.md`.

---

## 0. Mental model — two objects, never conflated

A strata app is **two JSON objects**:

1. **`layers.json`** — the **map spec** (ESRI Web Map JSON): what layers exist, their styling (`drawingInfo`), popups (`popupInfo`), filters, basemap, initial viewpoint. Drives `<StrataMap>`. See §5.
2. **`AppLayout`** — the **app spec**: pages → layout containers → widgets, plus `connections` (interactivity) and `theme`. Drives `<StrataApp>`. It **references** `layers.json` layers by `layerId`; it never contains map styling. See §1–§4.

The `map` widget is the bridge: it's a widget in the `AppLayout` whose `config` is the `layers.json`. A single shared `store` (passed via `StrataApp.context`) lets panels drive the live map.

```
AppLayout (app spec)                 layers.json (map spec)
 └ pages[]                            └ operationalLayers[]  ← referenced by layerId
    └ root: LayoutNode                └ baseMap
       ├ ContainerNode (row/col/…)    └ initialState.viewpoint
       ├ ViewsNode (tabs/slides)      └ spatialReference (4326)
       └ WidgetNode → WidgetSpec
 └ connections[]  (WIF wiring)
 └ theme          (--strata-* tokens)
```

---

## 1. AppLayout — the top‑level app spec

```ts
interface AppLayout {
  version?: string;
  pages: AppPage[];
  theme?: Record<string, string> | ThemeSpec;  // flat --strata-* map OR a structured theme (see §6)
  connections?: Connection[];            // cross-widget interactivity (see §4)
  splash?: { title?; body?; dismissible?; once? };  // intro overlay on first load (once = localStorage)
}
interface AppPage {
  id: string;
  title?: string;
  type?: "fixed" | "scroll";             // fixed = single viewport; scroll = story page
  root: LayoutNode;
  header?: LayoutNode;                    // persistent region above the body (app-shell)
  footer?: LayoutNode;                    // persistent region below the body
}
type LayoutNode = ContainerNode | ViewsNode | WidgetNode;
```

**Populate `connections` so the app is alive on the first build** — a chart brush should filter the map + table, a category click should cross‑filter every widget, a card click should zoom and filter. An app with widgets but no `connections` is dead.

---

## 2. Layout nodes — structure & responsiveness

### 2.1 ContainerNode — rows, columns, grids, cards, accordions
```ts
interface ContainerNode {
  kind: "row" | "column" | "grid" | "section" | "card" | "accordion" | "flow-row" | "splitter" | "window" | "panel";
  mode?: "fixed" | "flow";               // flow = flex/stack; fixed = position:relative for absolute children
  children: LayoutNode[];
  columns?: number;                      // grid column count
  gap?: number;                          // px between children
  titles?: string[];                     // accordion: per-child header (index-aligned)
  animate?: "fade" | "slide" | "scroll-reveal";
  // splitter only:
  orientation?: "h" | "v";               // h = side-by-side (vertical divider, default) · v = stacked
  sizes?: number[];                      // initial size % per child (sum ~100); default equal
  minSizes?: number[];                   // min % per child while dragging (default 5)
  // splitter + panel:
  resizable?: boolean;                   // user can resize (default TRUE) — splitter: draggable dividers
                                         // · panel: a grip on the inner edge. false locks the size.
  // window / panel:
  id?: string;                           // window: stable id — target of showHide/navigate to open/close
  title?: string;                        // window/panel header title
  modal?: boolean;                       // window: modal backdrop (default true; false = non-modal)
  open?: boolean;                        // window: open on first render (default false) · panel: expanded (default true)
  // panel only:
  dock?: "left" | "right" | "top" | "bottom" | "float";  // dock edge (default "left")
  collapsible?: boolean;                 // show a collapse toggle (default true)
  width?: number;                        // STARTING px along the dock axis (height for top/bottom docks)
  minWidth?: number;                     // smallest the user can drag to (default 120)
  maxWidth?: number;                     // largest the user can drag to (default unbounded)
  style?: Record<string, string | number>;
  responsive?: ResponsiveOverrides;
}
interface ResponsiveOverrides {          // partial node merged per breakpoint
  small?: Partial<LayoutNode>;
  medium?: Partial<LayoutNode>;
  large?: Partial<LayoutNode>;
}
```
Use `row`/`column` for flex stacks, `grid` (+`columns`) for card galleries, `section` for scroll‑page bands, `card` as a bordered container, `accordion` (+`titles`) for collapsible stacks, `flow-row` for wrapping chips, and **`splitter`** (+`orientation`/`sizes`/`minSizes`/`resizable`) for a **resizable** split (ExB Sidebar — drag the divider between panes). A **`window`** (`id`,`title?`,`modal?`,`open?`) is a modal/dialog overlay hosting its children — starts closed, opened/closed by a `showHide`/`navigate` action targeting its `id` (e.g. `{from:"btn",trigger:"buttonClick",to:"win",action:"showHide",options:{hidden:false}}`). A **`panel`** (`dock`,`collapsible?`,`width?`,`title?`,`open?`) is a dockable, collapsible region anchored to an edge (`left`/`right`/`top`/`bottom`) or `float`ing — the general form of the per‑widget floating chrome. Set `mode:"fixed"` on a container to absolutely position children inside (e.g. a floating panel over a full‑bleed map).

> **Panels are resizable by default.** A `panel` node and every `PanelShell`‑based panel widget
> (`layer-panel`, `table`, `chart`, `carto`, `filter`, `feature-info`, …) ship a drag grip — on the edge
> facing the content for a docked panel, plus a height grip and corner when floating — and the grip is
> arrow‑key operable (`Shift` = a bigger step). `width` is therefore a **starting** size, not a fixed one;
> bound it with `minWidth`/`maxWidth` and only set `resizable:false` where a locked size is load‑bearing
> (a swipe pane, a fixed‑ratio chart). The dragged size is **session state** — a reload returns to the
> authored `width`, which stays the single source of truth.

### 2.2 ViewsNode — tabs & slides (ExB Views/Sections)
The dynamic‑content primitive. Swaps both **content** and **map state** when the active view changes.
```ts
interface ViewsNode {
  kind: "views";
  views: ViewDef[];
  nav?: "tabs" | "slides";               // tabs = tab bar; slides = prev/next stepper (an exhibit). default "tabs"
  animate?: "fade" | "slide" | "scroll-reveal";
  style?; responsive?;
}
interface ViewDef {
  id: string;
  title?: string;
  content: LayoutNode;
  mapState?: {                           // applied to the store when this view is shown
    viewpoint?: { center: [number, number]; zoom: number };
    definitionExpression?: Record<string, string>;   // per-layer filters
    activeLayers?: string[];                          // layer ids to show/activate
  };
}
```
Use `nav:"slides"` + `mapState` for map‑driven storytelling (each slide flies the map and filters layers). Use `nav:"tabs"` for a dashboard with switchable panes.

### 2.3 WidgetNode — a component instance
```ts
interface WidgetNode { kind: "widget"; widget: WidgetSpec; }
interface WidgetSpec {
  id?: string;                           // REQUIRED to be a connection/output endpoint (from/to/fromWidget)
  type: string;                          // registry key (§3)
  props?: Record<string, unknown>;       // component config (per-widget in §3)
  dataSource?: {
    layerId?: string;                    // bind to a layers.json operational layer
    where?: string;                      // extra filter
    fields?: string[];
    fromWidget?: string;                 // consume another widget's output records (that widget's id)
  };
}
```
**Every widget is also auto‑injected** with `id`, `widgetId`, `bus`, `outputs`, `dataSource`, and everything in `StrataApp.context` (typically `maplibregl`, a shared `store`, a `dataClient`). So you do **not** put `bus`/`store`/`maplibregl` in `props` — configure via `props` (component fields below) and `dataSource` (binding).

### 2.4 Animation & app‑shell

**Animation (shipped, Phase 7).** Containers and `views` nodes take `animate?: "fade" | "slide" | "scroll-reveal" | "fly" | "zoom" | "rotate"` (an entrance/transition wrapper; `scroll-reveal` fires on scroll‑into‑view) plus `animateOptions?: { delay?, duration?, easing?, direction? "up"|"down"|"left"|"right", distance?, stagger? }` — **`stagger`** (ms) animates a container's children in turn (`index × stagger`). A `views` node also takes **`autoPlay?: { intervalMs, loop? }`** — a self‑running slideshow that emits `viewChange` as it advances. This is authored **content** motion — distinct from the Phase 6 theme layer's hover/focus **state** motion (§6).

**App‑shell (shipped, Phase 7).** A page takes `header?`/`footer?` LayoutNodes (persistent regions around the body); an `AppLayout` takes `splash?: { title?, body?, dismissible?, once? }` — a dismissible intro overlay on first load (`once` remembers dismissal via localStorage).

> **Planned (Phase 7) — remaining.** `animateOptions.exit` is reserved (declared; full exit‑on‑unmount not yet wired), and the last map tools still needing wrappers (`search`/`directions`/`coordinates`/`print`, §3b note).

---

## 3. Widgets — the 46 registry keys

Configure each via `widget.props` (fields below) and `widget.dataSource` (binding). **Bold** = required. Grouped ExB‑style.

### 3a. Layout & structure
| type | component | props | binding | renders |
|---|---|---|---|---|
| `card` | Card | `title?`, `children?`, `href?`, `hoverable?`, `onClick?` | — | bordered content card |
| `divider` | Divider | `orientation?` = `"horizontal"`\|`"vertical"` | — | separator |
| `swipe` | Swipe | **`left`**, **`right`** (ReactNode), `initial?` 0–100 | — | two overlaid panes + draggable divider (compare) |
| `controller` | WidgetController | **`tools`** `{id,label,icon?,content}[]`, `openIds?` | — | floating toolbar toggling tool panels |
| `placeholder` | Placeholder | `label?`, `minHeight?` | — | design‑time slot |

### 3b. Map‑centric
| type | component | props | binding | renders |
|---|---|---|---|---|
| `map` | StrataMap | **`config`** = the `layers.json`; `controls?` (see below); `glyphs?`, `rtlTextPluginUrl?`, `askEnabled?` | reads `config`; `store`/`maplibregl` from context | the MapLibre map |
| `legend` | Legend | **`layers`** = `operationalLayers[]`, `visibleOnly?` (def true), `title?`, `interactive?` (def **true**), `store?`, `bus?`, `counts?` `{label:{n,total?}}`, `onFilterChange?` | reads layers' `drawingInfo`; filters via `store.setDefinition` | swatch+label legend that **filters**: click hides · shift‑click isolates · `Esc` clears. Rows show `n of N`. Emits `categorySelect` |
| `layer-panel` | LayerPanel | **`store`**, `mode?`, `floating?`, `initialX/Y?`, `defaultWidth?`, + callbacks (`onZoomTo`,`onFilter`,`onSymbology`,`onPopup`,`onShowTable`,`onAddLayer`,…) | store‑driven | operational‑layer list (visibility/reorder/actions) |
| `basemap` | BasemapPanel | `basemaps?` (def `OPEN_BASEMAPS`), `defaultId?`, `map?` (for live tile thumbnails), `themeMode?` (adds a **Follow the theme** row), `onApplyBasemap?`, `onLibraryChange?`, `mode?`,`floating?`,… | **`store`** (injected) | basemap **radiogroup** — one always in force and always ticked, each row a live tile of the current area in that style; clicking drives `store.setBaseMap`, restyling the store‑bound map |
| `measure` | MeasureWidget | `mapId?` (def first map), `units?` `"metric"\|"imperial"` | reaches a `map` via the **MapRegistry**; `store`/`maplibregl` injected | distance/area measuring, placeable in a sidebar/panel (not only on the map) |
| `draw` | DrawWidget | `mapId?`, `onChange?(featureCollection)` | MapRegistry + injected `store`/`maplibregl` | sketch/annotation, placeable anywhere; emits the sketched GeoJSON |
| `status-bar` | StatusBar | **`map`** (maplibre Map), `crs?` (def `EPSG:4326`), `precision?` (def 5), `showCoords?`,`showZoom?`,`showScale?` | live map | coords/zoom/scale/CRS bar |
| `bookmarks` | Bookmarks | **`bookmarks`** `{name,viewpoint:{center,zoom}}[]`, `store?`, `title?`, `onSelect?` | store map | saved‑viewpoint buttons (fly on click) |
| `near-me` | NearMe | **`onSearch(center,km)`**, `onLocate?`, `defaultKm?` (def 2), `title?` | callback‑driven | proximity search UI |
| `add-data` | AddDataWidget | **`onAddLayer({url,kind,title})`**, `title?` | callback‑driven | URL box to add a layer |
| `elevation` | ElevationProfile | **`samples`** `{distanceKm,elevation}[]`, `height?` (def 120), `title?` | data prop | elevation profile chart |

`map.props.controls` (all boolean unless noted): `navigation`, `geolocate`, `fullscreen`, `scale`, `measure`, `sketch`, `legend`, `basemapSwitcher`, `layerList`, `cluster?` (default **true**), `position?` (control corner). Today the basemap gallery is `controls.basemapSwitcher`, not a separate widget.

> **The house chrome is the default.** `navigation` + `layerList` + `basemapSwitcher` render as **one
> 32 px cluster** (zoom in · zoom out · fit · layers · basemap · legend) with MapLibre's own zoom
> suppressed and **one drawer** opening beside it — layers as square checkboxes (multi‑select, each row
> stating *off* / *N in view* / *none in this view*), basemaps as **round radios** with a live tile of
> the current area in each style plus a "Follow the theme" row. Keyboard `L`/`B`/`G`/`F`, `Esc` closes.
> `position` moves the cluster and its drawer together; geolocate/fullscreen take the opposite corner.
> Set `cluster:false` only to restore the older always‑open boxes.
>
> **The `legend` control is interactive by default** — click a class to hide it, shift‑click to isolate,
> `Esc` clears; it writes a real `definitionExpression` on the renderer's field via the store, so the
> legend **filters rather than fades**. Pass `counts` to render `n of N`. `interactive:false` for a
> static caption.

> **Map‑tool widgets (Phase 7, all shipped).** Droppable widgets that reach a sibling `map` through the app's **MapRegistry** (`useMapInstance(mapId)`; defaults to the first map, or set `props.mapId`; a `map` publishes its live instance on ready): **`basemap`** (store‑driven), **`measure`**, **`draw`**, **`coordinates`** (live lng/lat/zoom), **`search`** (inject a `provider` — e.g. `@strata/plugin-search`'s `nominatimProvider()`), **`directions`** (inject `search` + `routing` — `@strata/plugin-routing`'s `osrmProvider()`), **`print`** (PNG/PDF via `@strata/export`).

### 3c. Data‑centric
| type | component | props | binding | renders |
|---|---|---|---|---|
| `table` | AttributeTablePanel | `rows?` `Record[]` (omit when source-bound), `columns?`, `fieldAliases?`, `oidField?` (def OBJECTID), `layerId?`, `page?`,`onPageChange?`, `virtualize?` (auto >150 rows), `viewportHeight?` (def 400), `mode?`,`floating?`,… | `rows`, or `dataSource.{layerId\|sourceId\|fromWidget}` | sortable/filterable table + CSV/GeoJSON export. **Source-bound:** shows the live filtered view. A row click **adopts** the record — the map flies to it and opens its popup; **clicking it again releases** it (selection cleared, popup closed). **Emits `rowSelect`** with `{oids,zoom,popup}` — an **empty `oids` is the release** |
| `chart` | ChartPanel | **`charts`** `SavedChart[]` (kind `bar`/`line`/`pie`/`scatter`/`histogram`), `onQueryData?(source)→data`, `store?`, `mode?`,… | `charts` + live query | charts incl. **`histogram`** (auto-binned) + **`scatter`**. **Emits `categorySelect`** |
| `carto` | CartoPanel | **`widgets`** `CartoWidgetSpec[]`, `onQuery?`,`onFilter?`,`onToggleVisibility?`, `title?`, `mode?` | cross‑filtering | CARTO‑style layer list + category/formula/histogram/timeseries. **Emits `categorySelect`** |
| `filter` | FilterPanel | **`layerId`**, **`fields`** `{name,label?,type?}[]`, `onFilter?`, `mode?`,… | layer | query builder → `definitionExpression`. **Emits `filterChange`**. Nested AND/OR via `buildWhereGroups(FilterGroup)` |
| `query` | QueryPanel | **`fields`** `{name,label?,type?}[]`, `onQuery?(where)`, `layerId?`, `title?`, `mode?`,… | `dataSource.{layerId\|sourceId}` (or `onQuery`) | AND/OR where-builder that **runs** against the bound source and **publishes the result rows as an output** (consume via `dataSource.fromWidget`). Reuses `filter`'s `buildWhere` |
| `date-filter` | DateFilter | **`layerId`**, **`field`** (time field), `dateMode?` `"instant"`\|`"range"` (def range), `onFilter?`,… | layer | date/range calendar → time filter. **Emits `filterChange`** |
| `feature-info` | FeatureInfoPanel | `feature?`, `onResolve?(layerId,oid)`, `emptyText?`, `title?`, `mode?`,… | tracks bus `featureSelect`/`rowSelect`, **or a bound source's selection** | pinned feature detail (popup element model) |
| `data-actions` | DataActionMenu | `selection?` (auto‑tracks if omitted), `actions?` (def `defaultDataActions`), `hideWhenEmpty?` (def true) | bus | quick‑actions menu on a selection |

`SavedChart` (bar/line/pie) and `CartoWidgetSpec` (`{id,kind:"category"|"formula"|"histogram"|"timeseries",layerId,field,operation?,valueField?,title?,limit?}`, ops `count|sum|avg|min|max`) are the two data‑widget payloads.

> **Shared panel chrome (`PanelShell`) — every panel widget above takes these**, whichever section it is
> listed in (`layer-panel`, `basemap`, `table`, `chart`, `carto`, `filter`, `query`, `date-filter`,
> `feature-info`, `analysis`, `weighted-overlay`, plus `EditPanel`/`AttachmentViewer`/`AskPanel`/
> `SavedItemsPanel`):
> `mode?` `"fixed"`(def)\|`"floating"` · `initialX?`/`initialY?` (floating placement) ·
> **`defaultWidth?`** / **`defaultHeight?`** (floating) — the **starting** size ·
> **`resizable?`** (def `true`) · **`minWidth?`** (def 200) · **`maxWidth?`** (def 960) ·
> **`minHeight?`** (def 120) · **`maxHeight?`** (def 900) ·
> **`onResize?({width,height?})`** — fires after each resize, for side effects the panel cannot know
> about. You rarely need it beside a `map` widget: `<StrataMap>` observes its own box and calls
> `map.resize()` itself. Docked panels get a width grip; floating panels add a height grip and a corner.
> All grips are arrow‑key operable (`Shift` = larger step). The dragged size is session state.

### 3d. Basic, media & KPI
| type | component | props | renders |
|---|---|---|---|
| `text` | Text | **`content`**, `as?` (def `"p"`) | themed text block |
| `image` | Image | **`src`**, `alt?`, `fit?` `"cover"`\|`"contain"` (def cover) | themed image |
| `embed` | Embed | **`src`**, `title?`, `allow?`, `sandbox?` (def safe set; `null` = none), `aspect?` (e.g. 16/9) | external content in a sandboxed iframe (optional ratio box) |
| `video` | Video | **`src`**, `poster?`, `autoplay?`, `loop?`, `controls?` (def true), `muted?` | media player (auto-muted when `autoplay`) |
| `button` | Button | **`label`**, `onClick?`, `href?`, `variant?` `"primary"`\|`"ghost"` | button/anchor |
| `menu` | Menu | **`items`** `{label,onSelect?,href?}[]` | vertical menu |
| `list` / `gallery` | ListGallery | **`items`**, **`renderItem(item,i)`**, `columns?` (def 1 = list), `gap?` (def 12) | repeated grid/list |
| `kpi` | KpiCard | **`label`**, `value?`, `unit?`, `delta?`,`deltaLabel?`, `status?` `"ok"|"warn"|"critical"`, `sparkline?` `number[]`, **`stat?`** `{field,op}` + a `dataSource` binding | KPI stat card. With `stat` + a bound source (`dataSource.{layerId\|sourceId\|fromWidget}`), the value is computed live and updates on filter/selection with **no `connections`** |
| `gauge` | RadialGauge | **`value`** 0–100 (or **`stat?`** `{field,op}` + a `dataSource` binding for a live value), `label?`, `thresholds?` (def 30/70), `invertColors?`, `size?` (def 120) | 270° arc gauge; with `stat`+source, updates on filter/selection |
| `sparkline` | Sparkline | **`data`** `number[]`, `width?` (def 80), `height?` (def 24), `color?` | inline line chart |
| `stacked-bar` | StackedBar | **`series`** `{label,value,color}[]`, `title?`, `horizontal?` (def true), `thickness?` (def 24) | stacked/grouped bars + legend |
| `share` | SharePanel | `baseUrl?`, `store?`, `state?`, `title?` | deep‑link URL + embed snippet |
| `theme-switch` | ThemeSwitch | `themes?` (def all presets), `initial?` (def `"dark"`), `onChange?` | theme‑preset switcher |
| `lang-switch` | LangSwitch | `locales?` `{code,label?}[]` | locale switcher (RTL‑aware) |
| `page-nav` | PageNav | `variant?` `"tabs"`\|`"breadcrumb"` (def tabs) | multi‑page nav (reads pages + navigates via the app context) — drop in a `header` |

> **Content/media widgets (Phase 7):** `embed` + `video` shipped (see §3d). Optional `icon`/`shape` primitives are still a possible future addition.

### 3e. Analysis (engine‑backed)
| type | component | props | renders |
|---|---|---|---|
| `weighted-overlay` | WeightedOverlayPanel | **`criteria`** `{field,label?,weight}[]`, `onChange?`,`onApply?` | suitability sliders |
| `analysis` | AnalysisPanel | **`registry`** (inject `@strata/processing`'s `registry`), `tools?` `string[]`, `input?` (primary FC), `secondary?` (mask/join FC), `onResult?`,`onAddLayer?` | generic Turf-op shell: pick a tool (buffer/dissolve/clip/spatial-join/…) + param, Run → **publishes result features as an output**. Arg-mapping is the pure `buildToolArgs` |
| `near-me` | (see 3b) | | proximity |
| `elevation` | (see 3b) | | elevation profile |

> Panels sharing the floating/dock chrome (`table`, `chart`, `carto`, `filter`, `date-filter`, `feature-info`, `layer-panel`) all accept: `mode?` (`"fixed"` default), `floating?`, `initialX?`, `initialY?`, `defaultWidth?`, `onClose?`, `onOpen?`, `style?`, `className?`.

---

## 4. Connections — interactivity (the WIF)

Wire widgets to each other declaratively on `AppLayout.connections`. `<StrataApp>` builds the bus and connects it at mount.
```ts
interface Connection {
  from: string;                          // emitting widget id (a WidgetSpec.id)
  trigger: TriggerType | string;
  to?: string;                           // target widget id (omit for global actions: setUrlParam/message)
  action: ActionType | string;
  options?: Record<string, unknown>;     // action-specific (below)
}
```

### 4.1 Triggers (what a widget emits)
`featureSelect` · `recordsChange` · `categorySelect` · `rangeSelect` · `brush` · `filterChange` · `extentChange` · `rowSelect` · `chartClick` · `hover` · `flash` · `search` · `clear`

**Phase 2 (bus layer shipped):** `buttonClick` · `timer` · `viewChange` · `pageChange` · `sketchComplete` · `mapClick` · `countChange`. The trigger types, payloads, `TimerSource`, and the source→bus `countChange` bridge (`connectSourceToBus`) exist and are tested; *pending:* the widget emitters (button/menu → `buttonClick`, map → `mapClick`, sketch → `sketchComplete`, `views` → `viewChange`, router → `pageChange`) and mounting `TimerSource` from a `timer` connection in `<StrataApp>`.

Payloads worth knowing: `featureSelect {layerId,oids,zoom?,popup?}`, `categorySelect {layerId,field,value}`, `rangeSelect {layerId,field,min,max}`, `filterChange {layerId,where}`, `extentChange {bbox}`, `hover {layerId,oids}`, `recordsChange {widgetId,records,layerId?}`.

> **`oids` are `number | string`.** An object id is whatever the service says it is — real layers publish
> string keys (`troubleshooting.md` §1). Never coerce.
>
> **An empty `oids` is a RELEASE, not a no-op.** The widget that adopted the record has let it go, so
> every sink clears: the map drops the highlight, closes the popup and stops flying. `zoom:true` flies to
> the **record** (not its layer's extent); `popup:true` opens that record's `popupInfo` on arrival. This
> is the shipped table gesture — click a row to adopt, click it again to release.

Emitters (from §3): `table`→`rowSelect` (adopt/release); `chart`/`carto`/`legend`→`categorySelect`; `filter`/`date-filter`→`filterChange`; the map→`featureSelect`/`extentChange`; `data-actions`→zoom/flash/table/export/clear.

### 4.2 Actions (what runs on the target)
`filter` · `zoomTo` · `panTo` · `flash` · `viewInTable` · `showStatistics` · `export` · `setUrlParam` · `showHide` · `message`

**Phase 2 (dispatchers shipped):** `navigate` (`{pageId?,viewId?,url?}`) · `refresh` (`{sourceId?,widgetId?}`) · `selectByGeometry` (`{sourceId?,predicate?}`, uses the trigger's geometry) · `updateRecord` (`{sourceId,edits}`). The `defaultDispatchers` route these to host callbacks (`onNavigate`/`onRefresh`/`onSelectByGeometry`/`onUpdateRecord`); *pending:* `<StrataApp>` supplying those callbacks (page/view navigation, source refresh, Turf spatial select, guarded write-back).

`options` keys the dispatchers read:
- `filter`: `where` (string\|null, overrides derived SQL), `layerId` (target; else payload's).
- `zoomTo`/`panTo`/`flash`: `layerId` (target); uses payload `oids`.
- `setUrlParam`: `param` (query‑param key).
- `showHide`: `to` (widget id) + `hidden` (bool, default true).
- `message`: `text`, `level` (`"info"|"warn"|"error"`, default info).

### 4.3 Output data sources (`fromWidget`)
A widget with an `id` that publishes records (a `recordsChange`) becomes a **data source** others bind to via `dataSource: { fromWidget: "<id>" }` — e.g. a `filter`’s result feeding a `table` and a `chart`. `connectOutputToBus` bridges every publish into a `recordsChange` trigger automatically.

> **First‑class DataSource — Phase 1 (core shipped).** `@strata/data-source` provides a unified `DataSource` (kinds `feature-layer | web-map | output | statistics | geometry`) that owns its own selection/filter/statistics. `<StrataApp>` instantiates a `DataSourceManager`, **auto‑wraps** every `dataSource.layerId` / `fromWidget` into a source, and injects the resolved `source` into each widget — so two widgets bound to the same `layerId` (or an explicit `sourceId`) **link with no `connections`**. Consumers: `kpi` + `gauge` (`stat`), `table` (live filtered view + selects into the source), `feature-info` (tracks the source's selection). **`filter`/`date-filter` already drive any bound source** for free — they emit `filterChange` → `<StrataApp>` calls `store.setDefinition`, which updates the source's filtered view and notifies every bound widget. `chart`/`carto` already cross-filter via the bus; wiring them to read a `DataSource` directly is deferred polish, not required for the linking model. **Phase 7 kinds (shipped):** `FileDataSource` (CSV via `parseCsv` / GeoJSON upload), `RestDataSource` (a GeoJSON URL / JSON API — injected `fetchFn`), `StreamDataSource` (real‑time: interval `poll` or websocket‑style `push`) — register on the manager, bind with `dataSource.{ sourceId }`. All additive — `layerId` / `fromWidget` keep working.

### 4.4 Canonical wiring patterns (copy these)
```jsonc
// Chart category → filter map + table
{ "from": "cat-chart", "trigger": "categorySelect", "to": "the-map",   "action": "filter" }
{ "from": "cat-chart", "trigger": "categorySelect", "to": "attr-table","action": "filter" }

// Table row → zoom + flash on map
{ "from": "attr-table", "trigger": "rowSelect", "to": "the-map", "action": "zoomTo", "options": { "layerId": "parcels" } }
{ "from": "attr-table", "trigger": "rowSelect", "to": "the-map", "action": "flash",  "options": { "layerId": "parcels" } }

// Filter panel → drive map + push URL param (deep-link)
{ "from": "flt", "trigger": "filterChange", "to": "the-map", "action": "filter" }
{ "from": "flt", "trigger": "filterChange",                  "action": "setUrlParam", "options": { "param": "where" } }

// Map extent → recompute a KPI (via statistics)
{ "from": "the-map", "trigger": "extentChange", "to": "kpi-count", "action": "showStatistics" }
```

---

## 5. The map spec — `layers.json`

The map widget's `config`. Everything is **EPSG:4326**.
```ts
interface LayersJson {
  version: string;
  spatialReference: { wkid: number; latestWkid?: number };   // 4326
  initialState: { viewpoint: { targetGeometry: Extent } };   // Extent = {xmin,ymin,xmax,ymax,spatialReference}
  baseMap: { title: string; baseMapLayers: BaseMapLayer[] };
  operationalLayers: OperationalLayer[];
  "strata:extensions"?: { charts?; tables?; layout?: "FullPage"|"MapInScroll"|"SplitDashboard"|"MultiMap" };
}
interface OperationalLayer {
  id: string; title: string; url?: string;
  layerType: "ArcGISFeatureLayer" | "ArcGISMapServiceLayer" | "GeoJSON" | "WebTiledLayer" | "WMS";
  source: { kind: LayerSourceKind; dataset?; data?; url?; timeField?; sourceLayer?; tileKind? };
  visibility?: boolean; opacity?: number;
  refreshIntervalSeconds?: number;                            // honest near-real-time re-query
  layerDefinition?: {
    definitionExpression?: string;                            // SQL where filter
    drawingInfo?: { renderer?: object; labelingInfo?; transparency? };  // genuine ESRI renderer JSON
    fields?: { name; type; alias? }[];
  };
  popupInfo?: object;                                         // genuine ESRI popupInfo JSON
  attribution?: string;
}
interface BaseMapLayer {
  id: string;
  layerType: "WebTiledLayer" | "VectorTileLayer" | "ArcGISTiledMapServiceLayer";
  templateUrl?: string;                                       // ESRI tokens {level}/{col}/{row}
  styleUrl?: string; copyright?: string;
}
```
`LayerSourceKind`: `arcgis-feature | arcgis-map | strata | geojson | tile | wms | imageserver | cog | vector-tile | pmtiles`.

**Rules that bite (from real publishing):** a layer *you publish* always exposes `objectIdField` as `OBJECTID` — but on any service you did not publish, read `objectIdFieldName` instead of assuming it; use `esriSMSCircle/Square`, never `esriSMSPath`; polygon fills need low alpha (~40/255); basemaps default to keyless OSM‑first (never default to ESRI/Google/Mapbox — offer only on request); reproject everything to 4326 on the way in.

Style/popup authoring: write **genuine ESRI `drawingInfo`/`popupInfo` JSON** — the compiler maps it to MapLibre. Never invent a styling DSL. Supported renderers: simple, uniqueValue (single/multi‑field), classBreaks, heatmap, visual variables, labels; `valueExpression` runs through the Arcade subset.

---

## 6. Theme

### 6a. Today (shipping)

`AppLayout.theme` is a raw `--strata-*` → value map applied as CSS custom properties. Presets: **`dark`** (default), `light`, `hazard`, `muted` (via `theme-switch` or `themeTokens(name)`).

Tokens (set any subset): `--strata-fg`, `--strata-app-bg`, `--strata-panel-bg`, `--strata-border`, `--strata-accent`, `--strata-muted`, `--strata-critical`, `--strata-success`, `--strata-warning`. Widgets also read `--strata-ok`, `--strata-warn`, `--strata-mono` (set if you customize KPI/gauge/status‑bar).

For **symbology/chart palettes** (not app theme) use `@strata/theme/palettes`: `CATEGORICAL` (Okabe‑Ito 8, colorblind‑safe), `SEQUENTIAL` (`viridis|blues|reds|greens|oranges`), `DIVERGING` (`RdBu|PuOr|BrBG`), and `hexToEsri(hex)` to emit `[r,g,b,a]` into `drawingInfo`.

### 6b. Structured theme model (Phase 6 — **shipped**; the ExB visual‑parity upgrade)

> **Status:** shipped. Additive and back‑compat — the flat map in §6a keeps working; the structured `Theme`
> is a superset that `compileTheme` flattens to the same `--strata-*` custom properties **plus** a scoped
> stylesheet for states/motion, which `<StrataApp>` applies + injects automatically when it detects a
> structured theme (a `theme` with `colors`).

`AppLayout.theme` also accepts a structured `Theme` (`@strata/theme`; schema `ThemeSpec`):

```ts
Theme = { mode: "light"|"dark", colors, fonts, variables, overrides? }
```

- **colors** — ExB's 8 semantic **roles**: `primary`, `secondary`, `success`, `info`, `warning`, `danger`, `light`, `dark`. Set **one hex per role**; the compiler derives `--strata-{role}`, `-hover` (brightness), `-active` (saturation), `-contrast` (auto text color). `primary` aliases today's `--strata-accent`; `danger` aliases `--strata-critical`.
- **fonts** — type scale that propagates to every widget: `--strata-font-family`, `-mono`, and steps `--strata-h1…-h3`, `--strata-body1`, `-body2` (size/line‑height/weight). `scale: "compact"|"default"|"spacious"`. The `text` widget's `as` maps to these steps.
- **variables** — design tokens replacing hardcoded numbers: `--strata-space-{0..6}`, `--strata-radius-{sm,md,lg,pill}`, `--strata-elevation-{0..3}` (depth shadows), motion `--strata-motion-{fast,base,slow}` + `--strata-ease`, and surface effects `--strata-surface-blur` (glassmorphism), `--strata-surface-gradient`.
- **overrides** — `{ widgetType: { …token patches } }` restyles one widget type only (e.g. just `kpi`) without touching others.

**States & motion** come from a scoped stylesheet the theme provider injects (inline `style` can't do `:hover`/`:focus`/`:active`): hover shifts brightness, active/selected boosts saturation, `:focus-visible` rings, transitions honoring `--strata-motion-*` and `prefers-reduced-motion`. Theme swaps via `theme-switch` propagate to all widgets instantly through the custom properties; `mode:"auto"` follows `prefers-color-scheme`.

---

## 7. Minimal recipe skeleton

```jsonc
// AppLayout — a live dashboard: map + filter + table + KPI, cross-wired
{
  "version": "1",
  "theme": { "--strata-accent": "#2b6cb0" },
  "pages": [{
    "id": "main", "type": "fixed",
    "root": { "kind": "row", "gap": 0, "children": [
      { "kind": "column", "style": { "width": "320px" }, "children": [
        { "kind": "widget", "widget": { "id": "flt", "type": "filter",
            "props": { "layerId": "parcels", "fields": [{ "name": "zone", "type": "string" }] } } },
        { "kind": "widget", "widget": { "id": "kpi", "type": "kpi",
            "props": { "label": "Parcels", "value": 0 }, "dataSource": { "fromWidget": "flt" } } },
        { "kind": "widget", "widget": { "id": "tbl", "type": "table",
            "props": { "rows": [] }, "dataSource": { "layerId": "parcels", "fromWidget": "flt" } } }
      ]},
      { "kind": "widget", "widget": { "id": "map", "type": "map",
          "props": { "config": { "$ref": "layers.json" }, "controls": { "navigation": true, "legend": true } } } }
    ]}
  }],
  "connections": [
    { "from": "flt", "trigger": "filterChange", "to": "map", "action": "filter" },
    { "from": "tbl", "trigger": "rowSelect",   "to": "map", "action": "zoomTo", "options": { "layerId": "parcels" } }
  ]
}
```

---

## 8. Modernization patterns (parity release)

The Experience‑Builder‑parity work (Phases 1–7) added capabilities every recipe should reach for by
default. Recipe‑by‑recipe opportunities: **`MODERNIZATION.md`**. The high‑leverage patterns:

- **Structured theme → the look, from one hex (§6b).** `"theme": { "mode": "dark", "colors": { "primary":
  "#2b6cb0" }, "fonts": { "scale": "spacious" } }` derives hover/active/contrast per role, propagates a type
  scale, and injects a scoped stylesheet so buttons/panels get real **hover/active/focus states + motion**.
  Existing widgets restyle for free (`--strata-accent`/`-critical` aliases). *Biggest visual‑polish lever.*
- **App‑shell (§1, §2.4).** Page `header`/`footer` regions + an app `splash` intro/disclaimer overlay.
- **Motion (§2.4).** `animate` (`fade`/`slide`/`scroll-reveal`/`fly`/`zoom`/`rotate`) + `animateOptions` on
  containers/views; **Views `autoPlay: { intervalMs }`** for self‑running slideshows (exhibit/slider).
- **DataSource linking (§4.3 note).** Bind widgets with `dataSource.{ sourceId }` (or a bare `layerId`,
  auto‑wrapped) and they link selection/filter with **no `connections`**. `kpi`/`gauge` take a live
  **`stat: { field, op }`**; `table` shows the source's filtered view and selects into it; `feature-info`
  tracks the source's selection. New DS kinds: `FileDataSource` (CSV/GeoJSON upload), `RestDataSource`
  (URL/API), `StreamDataSource` (poll/push).
- **Layout nodes (§2.1).** `splitter` (resizable), `window` (modal opened by `showHide`/`navigate`), `panel`
  (dockable/collapsible) — the general form of the per‑widget floating chrome.
- **Data / analysis widgets (§3).** `query` (where‑builder → output others consume), `analysis` (Turf‑op
  shell → result features as an output). `basemap`, `embed`, `video` round out the map/media catalog.
- **New triggers/actions (§4).** `buttonClick`, `timer`, `viewChange`, `pageChange`, `sketchComplete`,
  `mapClick`, `countChange` → `navigate`, `refresh`, `selectByGeometry`, `updateRecord`. Classic chains now
  declarative: `sketchComplete → selectByGeometry`, `timer → refresh`, `buttonClick → navigate`.

### 8.1 Modern recipe skeleton

```jsonc
// AppLayout — themed, app-shell, resizable sidebar, source-linked (no per-widget wiring)
{
  "version": "1",
  "theme": { "mode": "dark", "colors": { "primary": "#2b6cb0" }, "fonts": { "scale": "spacious" } },
  "splash": { "title": "Parcel Explorer", "body": "Pick a filter to begin.", "dismissible": true },
  "pages": [{
    "id": "main", "type": "fixed",
    "header": { "kind": "widget", "widget": { "type": "text", "props": { "content": "Parcel Explorer", "as": "h3" } } },
    "root": { "kind": "splitter", "orientation": "h", "sizes": [30, 70], "children": [
      { "kind": "panel", "dock": "left", "title": "Filters", "children": [
        { "kind": "widget", "widget": { "id": "flt", "type": "filter",
            "props": { "layerId": "parcels", "fields": [{ "name": "zone", "type": "string" }] } } },
        { "kind": "widget", "widget": { "id": "kpi", "type": "kpi",
            "props": { "label": "Parcels", "stat": { "field": "OBJECTID", "op": "count" } },
            "dataSource": { "sourceId": "parcels" } } },
        { "kind": "widget", "widget": { "id": "tbl", "type": "table",
            "dataSource": { "sourceId": "parcels" } } }
      ]},
      { "kind": "widget", "widget": { "id": "map", "type": "map",
          "props": { "config": { "$ref": "layers.json" }, "controls": { "navigation": true, "legend": true } } } }
    ]}
  }],
  // filter drives the shared "parcels" source via the store; kpi + table update with no wiring.
  "connections": [
    { "from": "flt", "trigger": "filterChange", "to": "map", "action": "filter", "options": { "layerId": "parcels" } }
  ]
}
```

### 8.2 Visual‑appeal checklist

*(Config-level view. The design-principles view — silhouette choice, differentiation rules, complexity
tiers — is `../strata/docs/guide/app-design.md`; don't restate it here.)*

- Use a **structured `theme`** (one `primary` hex) — never leave the default flat map when polish matters.
- Set `fonts.scale` and lean on the type steps (`--strata-h1…-body2`) for hierarchy.
- Prefer tokens over magic numbers: `--strata-radius-*`, `--strata-space-*`, `--strata-elevation-*`.
- Add `animate` to cards/sections and `autoPlay` to storytelling views; keep it subtle (short `duration`).
- Give the app real chrome: a `header`, a `footer`, and a `splash` where the recipe describes an intro.
- Let states do the work — hover/active/focus come free from the theme stylesheet; don't hand‑roll them.

---

## 9. Authoring checklist

- Give every widget that is a `from`/`to`/`fromWidget` endpoint a stable **`id`**.
- Put **map styling in `layers.json`** (`drawingInfo`/`popupInfo`), **app structure in `AppLayout`**. Never mix.
- Ship **`connections`** with the first build — a silent app is a bug (but widgets sharing a `sourceId` link with none).
- Bind data via `dataSource` (`sourceId` / `layerId` / `fromWidget`), not by hand‑passing rows where a source exists.
- Treat every panel size as a **starting** size: bound it with `minWidth`/`maxWidth` and justify each `resizable:false`.
- Basemap keyless OSM‑first; genuine ESRI JSON for symbology; everything EPSG:4326; `OBJECTID` is the OID.
- Reach for the **modernization patterns (§8)** — structured theme, app‑shell, motion, source linking.
- New widget/behavior in a recipe ⇒ add a row here and cover it with a Vitest case.

*On hold (not available): the **Survey/form** widget and **3D/Scene**. Reserved (declared, not yet wired): the `FilterGroup.spatial` predicate (needs the geometry engine, applied client‑side not in SQL) and generic per‑container `animateOptions.exit` on unmount (note: `window`/modal **close** IS animated). Everything else in the parity plan is shipped.*

---

## 10. Freestyle (open‑design) charter

Recipes and design proposals may go **fully bespoke** — no template required — under these rules. When a
recipe declares `Template: open-design`, this section *is* the contract.

**10.1 The composition boundary.** Compose any layout from the §2 nodes and any behavior from the §4
matrix, using **only the §3 registry widgets and only config keys that appear in this manifest**. Items
marked *Planned/On hold* may appear in a design only as `placeholder` widgets, labeled as such. A design
that silently assumes an unshipped capability is invalid.

**10.2 The new‑widget escape hatch.** If no registry widget can express a required behavior, a design MAY
introduce a new widget — provided it **works inside the same contract as every other widget**:

1. **Delivery path.** App‑local first: ship the component with the app and register it via
   `mergeRegistry` / `<StrataApp registry={{ "my-widget": MyWidget }}>` — no core change needed. Promote
   into `@strata/core-map` only after it proves out (then follow `../strata/docs/guide/creating-components.md` and
   the `../strata/docs/REFERENCE-DOCS.md` update matrix: code first → §3 row here → the three reference docs →
   Vitest case → docs‑reconcile green).
2. **Props contract.** A plain React component receiving its `WidgetSpec.props` plus the threaded
   framework props (`id`/`widgetId`, `bus`, `outputs`, `dataSource`, resolved `source`) and the app
   `context` (`maplibregl`, `config`, `store`, `dataClient`). It must drive the map **through the store**,
   never by ad‑hoc map calls.
3. **Interactivity contract.** It emits only known `StrataTriggerType` triggers (with its `id` as the
   trigger source) and honors actions via bus subscription; all cross‑widget behavior is declared in
   `connections` — no hard‑wired coupling to sibling widgets.
4. **Data contract.** It consumes data via `dataSource` resolution (`sourceId` / `layerId` /
   `fromWidget`); it never fetches around an existing source.
5. **Visual contract.** Styled with `--strata-*` tokens only (colors, radius, space, elevation, type
   scale); states come from the theme stylesheet; RTL‑safe.

**10.3 Proposal etiquette.** A design proposal that invokes 10.2 must include a **“New widget”** block per
widget: proposed registry key · one‑line purpose · props · emitted triggers · honored actions ·
`dataSource` shape · and the **fallback** (the nearest existing widget or `placeholder` that stands in
until it's built). Designs should exhaust §3 first — most "missing" widgets are an existing widget plus
the right `connections`.


---

# PACK §2 · Application design guideline — process, silhouettes, layout/wiring/theme rules, tiers, checklist

> Source: `strata/docs/guide/app-design.md`

# Application design guideline

How to design a strata-app-builder application — an [`AppLayout`](../../packages/schema/src/types.ts) rendered by
`<StrataApp>` — so that it is **visually distinct, immediately interactive, and honest about its data**.
This is the guideline the app templates in [`strata/templates/`](../../templates/README.md) follow; use it
whether you start from one of those templates or design from a blank page.

## The design process

Design in this order, and resist skipping ahead to widgets:

1. **Purpose** — write the one sentence the app answers ("which zone am I in?", "how is the network doing
   right now?", "review these field photos"). One app, one sentence.
2. **Silhouette** — pick the archetype whose *shape* matches the purpose (below). The silhouette is chosen
   before any widget is.
3. **Template** — start from the closest file in `strata/templates/` and keep its skeleton and signature
   wiring; or go open-design and obey the same rules.
4. **Slot content** — bind real layers and verified fields into the template's regions.
5. **Wire** — author `connections` until the signature loop works end-to-end.
6. **Theme** — one `ThemeSpec`, one accent, deliberate dark-or-light.
7. **Verify** — the checklist at the end of this page.

## 0 · The house defaults, and when to break them

These are what every app gets unless its business need genuinely conflicts. **They are defaults, not
laws** — a recipe may override any of them, in writing, with the reason. What it may not do is depart
silently: an unexplained deviation is indistinguishable from an oversight, and the next reader cannot
tell which it was.

**Shell.** A header carrying the title and the controls that change the *reading*; a **persistent notice
bar** for anything true as long as the data is on screen; a **status line** for transient progress. Never
put a lasting caveat in the status line — load progress overwrites it and it never reaches anyone.

**Map chrome.** One inline-SVG control cluster, top-right, 32 px buttons on `currentColor` — **zoom in ·
zoom out · fit · layers · basemap · legend**. MapLibre's own zoom control suppressed so there is exactly
one set. Drawers (layers · basemap) open **beside** the cluster, never over it, and **one at a time**.
Layer rows are checkboxes; **basemap rows are radios** carrying a live tile of the current area in that
style, and the tick names the **effective** basemap even when the theme is choosing it. Legend
bottom-left as its own control surface with live counts; coordinate/zoom/CRS readout bottom-right. Layers
and basemap belong **on the map** — a reader looking at the map should not travel to a page header to
change what it shows. On the React path this is `MapChrome`, on by default.

**The legend filters; it does not fade.** Click a class to hide it, shift-click to isolate, `Esc` clears
— applied as a real `definitionExpression`, because a faded class is still clickable and a "hidden"
feature can be selected through it. Every count keeps its denominator, and the panel says in words that
isolating changes the map, not the reading.

**Panels size to the reader.** Every drawer, rail and docked panel carries a resize grip on the edge
facing the content — draggable and arrow-key operable — bounded by a floor at which the panel is still
readable. The authored width is where it *opens*, not where it must stay: the same rail is generous on a
laptop, truncated on a projector, and eats the map on a tablet, and only the reader knows which they have.

**Keyboard.** `L` layers · `B` basemap · `G` legend · `F` fit · `←`/`→` step the signature dimension ·
`Esc` unwinds **one thing at a time** (clear the filter first, only then climb a level). A focused resize
grip takes `←`/`→` (or `↑`/`↓`) to size the panel, `Shift` for a bigger step.

**Interaction floor.** ≥3 live `connections` on first render. The signature loop works end-to-end and
**bidirectionally** where it is master–detail. Whatever adopts also **releases**, with a visible
affordance — a table row is the canonical case: click it and the map flies to *that record* and opens its
popup; click it again and the selection clears and the popup closes. Exactly one population selected at a
time. A deep link round-trips the reading.

**Honesty surfaces.** Every cap visible (`+N more`, `Capped, not complete`). Every filtered count keeps its
denominator (`2 of 7`). Every active filter shown as a labelled chip with an `×` and a **Clear all**.
Layers labelled with their real state — *off* · *N in view* · *none in this view* · *capped* ·
*not mappable*.

**Theme.** One `--strata-*` token set; both modes clear **4.5:1** on every informational state, measured
rather than eyeballed. Data colours identical in both themes. Semantic roles carry meaning, not emphasis.

**Non-negotiable regardless of business need:** keyless basemaps · EPSG:4326 · verified field names only ·
nothing fabricated · read-only unless the recipe names a writable authenticated backend. These are not
defaults; they are the contract.

## 1 · Choose the silhouette first

Apps read as one of four families. Within a product suite or demo gallery, adjacent apps should come from
*different* families whenever possible:

| Family | Shapes | Reach for it when |
|---|---|---|
| **Map-centric** | full map + folding/tabbed panel, floating dock, banner-over-map, minimal embed | the map *is* the product and tools serve it |
| **Dashboard** | KPI strip + boxed map + charts, KPI rail, extent scoreboard, swappable views | numbers are the product and the map is evidence |
| **Web page & narrative** | hero + cards, scroll story with pinned map, guided steps, article with inline maps, time player | the audience reads or is guided, rather than operates |
| **Grid** | synced multi-map, checkerboard, collage, reading-pane + map, destination cards | comparison or parallel views are the point |

Two hard rules from the template roster:

- **Silhouette first.** Two apps shown side by side must differ at a glance — before any color or logo is
  seen. A dashboard next to an editorial scroll-story next to a split-screen compare always works; three
  "map with a left panel" apps in a row never does.
- **Ration the look-alikes.** Sidebar viewers, ranked lists, nearby finders, zone lookups, and chart boards
  all render as "map + left panel". Use at most two of them per suite, and let each lead with its signature
  accent (the buffer ring, the rank numerals, the clickable legend chips, the brushable charts).

### Named archetypes and their signature loops

A silhouette is a shape; an archetype is a shape **plus the one interaction that justifies it**. Pick the
loop first — it is what a client recognises in ten seconds — then the shape follows. Templates marked with
a file are already serialized in [`templates/`](../../templates/README.md); the rest you compose.

| Archetype | The signature loop — the thing that *is* the app | Template |
|---|---|---|
| Sidebar explorer | legend class chip → `filter` via `setDefinition`, with live counts | `foldable` |
| Launchpad | tools open as floating cards over a full-bleed map; nothing docked | `launchpad` |
| Ops command | header selectors → `filter` everything; `extentChange` → recompute KPIs | `monitor` |
| Split dashboard | the general-purpose default — pick something more specific unless nothing fits | `dash`, `collage` |
| Extent scoreboard | every pan/zoom recomputes the stat strip (`extentChange` → `showStatistics`) | `summary` |
| Scroll story | section scrolls into view → apply a map state diff | `parallax` |
| Time player | slider → time `definitionExpression`; `featureSelect` → that feature's series | `timeline` |
| Insets grid | shared `filterChange` → every pane; inset click → main `zoomTo` | `multiverse` |
| Portfolio hub | card → `navigate`; the front door that makes a family of apps a product | `gallery`, `epic` |
| Ranked list | **the rank ORDER is the app**; `rowSelect` ⇄ `featureSelect`, pin-to-compare tray | — |
| Nearby finder | search → geocode → buffer → `selectByGeometry` on N layers; **the ring is the signature** | `leaflet` (partial) |
| Zone lookup | address → point-in-polygon → zoom, dim all others, one result card. One question, one answer | — |
| Chart board | brushable charts cross-filter the map and each other; filters stack into a chip row | — |
| Triage console | `rowSelect` ⇄ `featureSelect` bidirectional; **the table is the protagonist** | `dart` (partial) |
| Media pager | media pane ~70 %, map demoted to a locator; pager steps features | — |
| Compare / swipe | two panes or a draggable divider; `extentChange` syncs the sibling both ways | `checkerboard` (partial) |
| Select & export | sketch → select → accumulating tray → **the output document is the product** | — |
| Exhibit slides | each slide is a saved map state; `pageChange` applies the diff | `vacation`, `ribbon` |
| Atlas workbench | the user composes the view from a catalog panel. The kitchen sink — use sparingly | `tab`, `jewelry-box` |
| Reporter | public submit form + browse. **Capture needs a writable, authenticated ESRI backend** | — |
| Field trio | composite: capture + triage + monitor as three pages behind a hub. Backend caveat as above | — |

Two findings behind this list, from inventorying a large published solutions catalogue: **~151 solutions
collapse to about 14 UI archetypes** — differentiation lives in the data model, not the UI — and nearly
every solution pairs an internal surface (console, dashboard) with a public one (lookup, transparency
page). Reach for that two-persona symmetry before inventing a third shape.

## 2 · Layout rules

The `LayoutNode` tree gives you `row`, `column`, `grid`, `section`, `card`, `accordion`, `flow-row`,
`splitter`, `panel`, `window`, and `views`. Guidance:

- **Fixed vs scroll.** Operational apps are `type:"fixed"` pages (single viewport, `height:100%` chains all
  the way down). Narrative and landing pages are `type:"scroll"`. Don't mix a scrolling body into a fixed
  console; open a second page instead.
- **The map's box.** In fixed pages, put the map in a `section` with `mode:"fixed"` and flex-fill styles so
  overlays (status bars, floating cards, windows) can be absolutely placed inside it. In scroll pages, give
  embedded map sections an explicit height and rounded corners — a full-bleed map inside prose reads as a
  bug, a framed one as a figure.
- **Panels vs splitters.** Use `panel` (dockable, collapsible, resizable) for tool drawers the user may
  dismiss; use `splitter` when both sides are content and neither is subordinate. Both resize — the choice
  is about *what the region is*, not about which one the user can drag.
- **A panel width is a starting position, not a decision.** Panels resize by default, so author `width` as
  where the panel opens and `minWidth`/`maxWidth` as the range it stays useful in. Set the floor at the
  width the panel is still readable at — that is the honest alternative to truncating labels to fit a size
  the user could have fixed. Lock one with `resizable:false` only where the size is load-bearing, and say
  so in the recipe.
- **Windows** are for tools summoned on demand (launchpad pattern): declare them `open:false` and toggle
  them with a `showHide` connection from a `controller` or `button`.
- **`views` is the state machine.** Tabs for facets, `nav:"slides"` for guided sequences; attach a
  `mapState` (viewpoint, per-layer `definitionExpression`, `activeLayers`) to each view so navigation
  *drives the map* — this one primitive powers exhibits, journeys, reveals, and scroll stories.
- **Responsive is not optional.** Every side-by-side `row` needs `responsive.small` collapsing it to a
  column. Panels stack below the map on phones.
- **Animation is seasoning.** `scroll-reveal` on scroll pages and a modest `fly` with `stagger` on
  dashboard rails is plenty. Never animate the map's own container.

## 3 · Interactivity rules

The wiring vocabulary is deliberately small — triggers (`featureSelect`, `rowSelect`, `categorySelect`,
`brush`, `rangeSelect`, `filterChange`, `extentChange`, `search`, `buttonClick`, `sketchComplete`,
`viewChange`, `timer`, …) × actions (`filter`, `zoomTo`, `panTo`, `flash`, `viewInTable`,
`showStatistics`, `showHide`, `export`, `navigate`, `selectByGeometry`, `updateRecord`, `message`). The
power is the wiring matrix, not the vocabulary. Rules:

- **The interactivity floor: three live connections.** An app must demonstrate cross-widget behavior within
  ten seconds of loading, unprompted. If a viewer is intentionally minimal, it still flashes what you click.
- **Wire the signature loop first.** Each archetype has one loop that *is* the app — search→buffer→cards,
  legend-chip→filter, slider→time-filter, row⇄feature, brush→cross-filter, extent→statistics, slide→map
  state. Ship that loop before any secondary wiring.
- **Standard patterns to reuse:**
  - *Cross-filter:* chart `categorySelect` → `filter` on the map **and** every sibling widget (filters
    stack); show removable filter chips.
  - *Master–detail:* table/list `rowSelect` → `zoomTo` + `flash` on the map and `viewInTable` on a
    `feature-info` panel; map `featureSelect` → highlight the row back. Bidirectional or not at all.
  - *Extent stats:* map `extentChange` → `showStatistics` on KPIs — the cheapest way to make an app feel
    live.
  - *Synced maps:* `extentChange` → `zoomTo` between map pairs, wired both ways.
  - *Guided state:* `views` + `mapState`, with `buttonClick` → `navigate`/`zoomTo` for inline calls to
    action.
- **Don't fake it.** Only wire triggers the source widget actually emits (registry source is the truth —
  e.g. `button` emits `buttonClick`; cards don't). A connection that never fires is worse than none.

## 4 · Data binding rules

- Bind widgets with `dataSource.layerId` against layers that exist in the app's `layers.json`; chain
  results with `fromWidget` (a query feeding a table) or share selection state via `sourceId`.
- **Only reference fields you have verified** — from the service schema or the layer's `popupInfo`. A chart
  on a guessed field renders an empty lie. Tables default their columns from popup `fieldInfos`.
- Time-aware layers are filtered by a `definitionExpression` on their real time field (window or instant),
  stacking with any other filter. Pair the slider with a trend chart.
- Reads (query/stats/related/attachment-view) work on both backends; **edits need a writable,
  authenticated ESRI backend** — design write flows (`updateRecord`, reporter forms) to degrade to
  read-only elsewhere.

## 5 · Theme rules

- One structured `ThemeSpec` per app: pick `mode` deliberately — **dark** for control rooms, wall boards
  and cinematic maps; **light** for public, civic, and editorial apps — and one `primary` accent that the
  whole app respects. Set semantic roles (`success`/`warning`/`danger`) when statuses appear.
- Differentiate sibling apps with the *secondary levers*: dark vs light, header vs headerless, floating
  rounded cards vs flush docked panels, boxed vs full-bleed map — not by inventing new component styles.
- Numbers use tabular numerals; KPIs get big and few (3–5, not 9).
- Basemaps are the keyless open set (OSM · CARTO Positron/Voyager/Dark · OpenTopoMap). Never default to a
  keyed provider.

## 6 · Complexity tiers

Match ambition to need — an app should be as simple as its sentence allows:

| Tier | Shape | Examples in the roster |
|---|---|---|
| Trivial | one map, one loop, near-zero chrome | pocket, frame, scenic |
| Simple | map + one panel or strip, 2–3 connections | foldable, billboard, sidebar patterns |
| Interactive | one signature loop as the product | zone-lookup, time player, ranked list, compare |
| Wired | many widgets cross-filtering | monitor, chart boards, triage consoles |
| Composite | multi-page, multi-persona | introduction (onboard → work), field trios, hub landings |

## 7 · Ship checklist

- [ ] The one-sentence purpose is answerable in the first screen.
- [ ] The silhouette differs from its neighbors' at a glance.
- [ ] ≥3 connections fire; the signature loop works end-to-end.
- [ ] Every `layerId` and field name is verified against the webmap.
- [ ] `responsive.small` collapses every side-by-side row; tested at phone width.
- [ ] Every panel resizes, from the pointer **and** the keyboard, within a floor that keeps it readable;
      each `resizable:false` has its reason in the recipe.
- [ ] One control cluster on the map (zoom · fit · layers · basemap · legend), one drawer at a time, and
      MapLibre's own zoom suppressed. The basemap drawer ticks the basemap actually in force.
- [ ] The legend filters rather than fades, isolates on shift-click, clears on `Esc`, and keeps every
      denominator.
- [ ] A table row adopts its record (fly + popup) and **releases it on a second click** — nothing is left
      selected on the map with nothing selected in the table.
- [ ] Theme: one accent, deliberate mode, semantic status colors where statuses exist.
- [ ] Basemap keyless; nothing blocks first paint on a slow tile.
- [ ] Write paths (if any) guarded behind an ESRI backend and degrade to read-only.
- [ ] Layout validates: registry widget types only — or a bespoke widget added under the freestyle
      charter in `recipes/COMPONENT-MANIFEST.md` §10 (app-local `registry` override honoring the
      widget contract), with a named fallback until it ships (`pnpm test` keeps the roster suite green).
- [ ] The app **opens on a view where its own signature is visible.** Confirmed by screenshot, not by
      reasoning — an app has shipped that opened on the one view where its argument was invisible, with
      every non-visual test green.
- [ ] Contrast measured, not eyeballed: every informational state ≥ 4.5:1 **in both themes**. Where one
      hue must serve as both a fill and text, it is two tokens.
- [ ] Nothing synthesized. A lane with no data renders empty with its citation; every cap says so on
      screen (`+N more`, `Capped, not complete`).

*Building the app, rather than designing it, has its own gate — the data-honesty, suite and runtime
checks in [`building-apps.md`](building-apps.md) §7, which starts from this checklist.*

## 8 · Harvest what works

A good layout is an asset. When an open-design app earns reuse, serialize it, add a `strata:template`
metadata block, and drop it into `strata/templates/` — the galleries pick it up automatically and the
validation suite keeps it honest. Templates are just serialized app configs; treat yours as a library, not
as one-offs.


---

# PACK §3 · Component inventory — what exists and its status (shipped / partial / backend / planned)

> Source: `strata/docs/reference/components.md`

# Components, widgets & skills — what each one is, and how they fit together

strata-app-builder is layered: **packages** (the code), **map controls + panels + widgets** (the UI you compose),
**skills** (how Claude authors each thing), and **commands** (what you type). This page is the map of all of
it — the *purpose and scope* of every piece and *how they work together*. For the exact phrase to ask for
each one, see the **[Human Language Reference](human-language.md)**; for the full command list, see
[Command reference](commands.md).

---

## The big picture (how a request flows)

```
You describe a map/app  ─▶  a /command or /recipe  ─▶  Claude follows a skill
        │                                                     │
        ▼                                                     ▼
   layers.json (the map spec, ESRI Web Map JSON)      AppLayout JSON (the app)
        │                                                     │
        ▼                                                     ▼
   <StrataMap> renders it on MapLibre              <StrataApp> renders the widget tree
        │              ▲                                       │
        │              │  the store (@strata/state)           │  the ActionBus (@strata/actions)
        └──────────────┴───────────── cross-drive ────────────┘   + output data sources
```

Two JSON documents drive everything: **`layers.json`** (the map — layers, basemap, symbology, popups) and the
**`AppLayout`** (the app — pages, containers, widgets, and the `connections` that wire them). They are
separate; the app *references* the map. Two runtime buses keep it all in sync: the **store** (map/layer
state) and the **action bus** (cross-widget interactivity, the WIF).

---

## Packages (`strata/packages/*`) — the code, and its scope

| Package | Purpose | Scope |
|---|---|---|
| **`@strata/schema`** | The contract | Types + JSON Schema for `layers.json`, the `AppLayout` (containers, `ViewsNode`, `Connection`), and the catalog record. Everything else conforms to this. |
| **`@strata/state`** | The map/app store | Zustand store: layers, selection, view, basemap, active layer, interaction mode, undo/redo, and **`setDefinition`** (in-place server-side filter). Round-trips `layers.json`. |
| **`@strata/actions`** | The interactivity bus (WIF) | `ActionBus` (triggers → actions), `wireConnections` + `defaultDispatchers` (drive `AppLayout.connections`), `OutputRegistry` (a widget publishes records others consume), and the `DataAction` registry. |
| **`@strata/arcade`** | Arcade-subset evaluator | Transpiles the common ~80% of ESRI Arcade to a **MapLibre expression** (renderers) or a **computed scalar** (popups). Anything outside the subset warns and falls back. |
| **`@strata/theme`** | The visual system | Colorblind-safe **categorical / sequential / diverging** ramps (light+dark) and named **theme presets** (light/dark/hazard/muted). Symbology, charts, and app themes all draw from here. |
| **`@strata/core-map`** | The map + UI engine | React + MapLibre: the style/popup compilers, ArcGIS/GeoJSON/tile/WMS/**ImageServer/COG** loaders, `<StrataMap>`, all controls, all panels, all widgets, and the `<StrataApp>` layout engine. |
| **`@strata/i18n`** | Bilingual UI | Dependency-free EN/AR dictionary + `{var}` interpolation + RTL direction. |
| **`@strata/processing`** | Spatial analysis | Turf-backed pure ops: buffer/dissolve/clip/nearest/within/spatial-join, plus overlay (union/difference/intersect/voronoi/hull), **aggregate** (dissolve-with-stats), **hexbin/hotspot** (Getis-Ord Gi\*), **weighted-overlay** (suitability), and **dot-density**. |
| **`@strata/plugins`** | The plugin spine | `StrataPlugin` + `StrataAppAPI` + `PluginManager` — runtime extensibility (project state, URL params). |
| **`@strata/plugin-search` / `-routing` / `-statusbar` / `-timeslider`** | First-party plugins | Geocode search (Nominatim/Esri), directions (OSRM/Esri) **+ isochrones** (`fetchIsochrone`, Valhalla/ORS), status bar + scalebar, and the temporal slider. |
| **`@strata/feature-arcgis`** | Esri read/write adapter | Lazy: query / statistics / related records / attachments (read on both backends) / `applyEdits` (writable ESRI only). |
| **`@strata/auth-arcgis`** | ESRI auth guard | `assertEsriBackend` throws for a `strata` backend (editing is ESRI-only). |
| **`@strata/data-management`** | Convert + publish | Renders a catalog record into a Serve datasource block + metadata bundle. |
| **`@strata/export`** | Output | Image (+high-DPI), **composed PDF** (legend/scalebar/north-arrow), **atlas** (map-series), **feature report**, **share** (deep-link + embed), web-map spec, and layer data (GeoJSON/CSV). |
| **`@strata/studio`** | Visual editor | A pure `AppLayout` **edit model** (round-trips the JSON) + a `<StrataStudio>` preview/outline/inspector shell — tweak the result visually instead of re-prompting. |

**How they compose:** `schema` defines the JSON → `state` holds it live → `core-map` renders it (pulling
colors from `theme`, expressions from `arcade`, analysis from `processing`, imagery via the raster path) →
`actions` wires widgets to each other → `export`/`studio` are the output/edit surfaces.

---

## The map surface & controls (`<StrataMap>`)

`<StrataMap>` renders `layers.json` on MapLibre and, when given a `store`, reflects live changes
(visibility/opacity/order/basemap/highlight/**filter**). When also given a `bus`, it is a **WIF sink** —
selections and flashes from other widgets light up on it. Controls layered on the canvas:

- **MapChrome — the house control cluster.** One 32 px round-rect stack in the corner (**zoom in ·
  zoom out · fit · layers · basemap · legend**, six inline-SVG glyphs on `currentColor`), with
  MapLibre's own zoom suppressed so there is exactly one set, and **one drawer** opening *beside* the
  cluster — never over it, never two at once. Layers and basemap belong **on the map**: a reader looking
  at the map should not travel to a page header to change what it shows. `L` · `B` · `G` · `F` ·
  `Esc`. It is the default whenever `navigation`, `layerList` or `basemapSwitcher` is on
  (`controls.cluster = false` restores the older always-open boxes).
- **Navigation / Geolocate / Fullscreen / Scalebar / StatusBar** — the standard map furniture. Set
  `controls.position` (`top-left`/`top-right`/…) so the cluster **honors a docked/floating panel**;
  geolocate/fullscreen take the opposite corner.
- **Legend** — swatches from each layer's `drawingInfo`, and **a control surface, not a caption**:
  click a class to hide it · shift-click to isolate · `Esc` clears. Hiding builds a real
  `definitionExpression` on the renderer's own field and applies it in place, because a legend row
  **filters, it does not fade** — a faded class is still clickable, so a "hidden" feature can be
  selected through it. Counts keep their denominator (`8,340 of 12,728`).
- **Measure** (distance/area) and **Sketch** (point/line/polygon) — revert to *identify* when closed.
- **TimeSlider** — play/pause a `definitionExpression` on a time field.
- **Identify → popup** — a click enriches the top/active feature and shows its `popupInfo`.
- **Layer sources** (`source.kind`): `arcgis-feature` · `arcgis-map` · `geojson` · `strata` · `tile` (XYZ) ·
  `wms` · `imageserver` · `cog` (GeoTIFF) · **`vector-tile`** (native MVT + `sourceLayer`) · **`pmtiles`**
  (offline/edge, optional `pmtiles` protocol). Bulk formats (geoparquet/flatgeobuf/zarr) reach the map via
  `/convert` → Strata Serve. The registry serializes mutations, lazy-loads on visibility, clusters, and
  highlights by OID.

---

## Panels (`@strata/core-map/react/panels`) — docked/floating tools

All render inside a shared **`PanelShell`** (fixed or floating, with an Open/Remove menu). Add them with
`/panel <type>`.

**Every panel is resizable** — that is chrome, not a per-panel feature. A docked panel carries a width grip
on its trailing edge; a floating one adds a height grip and a corner. Grips are draggable *and* arrow-key
operable, clamped to `minWidth`/`maxWidth` (defaults 200–960 px), and `resizable={false}` locks a panel
whose size is load-bearing. `defaultWidth` is a **starting** size: the drag is session state, so a reload
returns to what the app authored.

| Panel | Purpose |
|---|---|
| **LayerPanel** | **One-line rows** (drag-reorder, visibility toggle) + a `⋯`/right-click **context menu**: Show table · Zoom · **Filter…** · **Symbology…** · **Popup…** · Rename · Show metadata · Remove. Add-from-URL header button. |
| **BasemapPanel** | Switch basemaps (genuine ESRI `BaseMap`) — a **radiogroup**: one is always in force and always ticked, each row carrying a **live tile of the current area in that style** (a colour swatch cannot tell Positron from Voyager) and an optional **Follow the theme** row. Plus a **Manage** pill: add / remove / **set-default**, persisted to the map spec via `onLibraryChange`. |
| **AttributeTablePanel** | Sortable table: header filters, column show/hide, **CSV / TSV / JSON / GeoJSON export**, **server paging**, auto **row-windowing**. A row click **adopts** that record — the map flies to it and opens its popup; **clicking it again releases it**, clearing the selection and closing the popup. Emits `rowSelect` (an empty `oids` **is** the release). |
| **ChartPanel** | Bar/line/pie via **ECharts** (optional) or an SVG fallback; **clicking a category cross-filters** (emits `categorySelect`). |
| **CartoPanel** | CARTO-style layer list + cross-filter widgets (category/formula/histogram/time). Emits `categorySelect`. |
| **FilterPanel** | Interactive query builder → `definitionExpression` (emits `filterChange`). |
| **DateFilter** | Calendar single/range on a time field → time `definitionExpression`. |
| **FeatureInfoPanel** | Docked feature detail (the popup element model, pinned beside the map); consumes `featureSelect`. |
| **DataActionMenu** | Quick actions on a selection — Zoom/Flash/View-in-table/Export/Clear — dispatched through the bus. |
| **EditPanel** | Update/add/delete features — **needs a writable + authenticated ESRI backend**. |
| **AttachmentViewer** | Page through features and view image/video/PDF attachments (read-only, both backends). |
| **SavedItemsPanel** | One config-driven manager for any saved list (charts / tables / bookmarks) — add / open / rename / remove; pairs with `materializeChart`/`materializeTable` (re-run a saved descriptor live, "expression not snapshot"). |

---

## Layout widgets (`defaultWidgetRegistry`) — the `AppLayout` building blocks

`<StrataApp>` renders a tree of **containers** holding **widgets**. Containers: `row` · `column` · `grid` ·
`section` · `card` · **`accordion`** · **`flow-row`** · **`splitter`** (resizable) · **`window`** (modal
dialog) · **`panel`** (dockable/collapsible/**resizable** — a grip on the edge facing the content drags it
along its dock axis, bounded by `minWidth`/`maxWidth`), plus a **`views`** node (tabs / slide stepper, each view
carrying a saved `mapState`, with optional `autoPlay`) and an `animate`
(`fade`/`slide`/`scroll-reveal`/`fly`/`zoom`/`rotate` + `animateOptions`). Pages also take `header`/`footer`
regions and an app `splash`. Widgets (registry `type`), grouped by what they do:

- **Content / map / media** — `map`, `text`, `image`, `embed` (iframe), `video`, `button`, `menu`, `divider`,
  `card`, `list`/`gallery`.
- **Data viz** — `kpi`, `gauge`, `sparkline`, `stacked-bar`, `chart`, `table`.
- **Map tools** — `legend`, `layer-panel`, `basemap` (gallery), `carto`, `status-bar`, `filter`,
  `date-filter`, `query`, `feature-info`, `data-actions`.
- **App chrome / interactivity** — `theme-switch`, `lang-switch`, `share`, `bookmarks`, `swipe`,
  **`controller`** (a tool dock that shows/hides panels), `placeholder` (design-time slot).
- **Analysis** — `analysis` (a shell over the Turf ops), `near-me` (proximity), `add-data` (runtime layer
  add → "explorer" apps), `weighted-overlay` (suitability sliders), `elevation` (drawn-line profile).

**They work together through the WIF:** every widget gets an `id`, the shared `bus`, and the `outputs`
registry. An `AppLayout.connections` array declares *"when `from` emits `trigger`, run `action` on `to`"* —
`<StrataApp>` wires the bus at mount, so a chart click filters the map + table, a category cross-filters
every widget, a row zooms the map. Filters apply **in place** (`store.setDefinition`, no remount). See the
[`strata-interactivity`](human-language.md#8-widget-interactivity-the-wif) skill.

---

## Skills (`.claude/skills/*`) — how Claude authors each thing

A skill is a cheatsheet + recipes + ESRI reference + traps that Claude loads for a task. Each maps to a
surface above:

| Skill | Authors | Pairs with |
|---|---|---|
| **strata-map** | `layers.json` (the map spec) incl. raster (ImageServer/COG) | `/create-map`, `/add-data` |
| **strata-symbology** | ESRI `drawingInfo` renderers (from `@strata/theme` palettes) | `/symbology` |
| **strata-popups** | ESRI `popupInfo` (media/charts/attachments/related/Arcade) | `/popup` |
| **strata-charts** | Charts (ECharts/SVG) + the depth table | `/panel chart`, `/app` |
| **strata-panels** | Every docked/floating panel | `/panel` |
| **strata-interactivity** | The WIF — `AppLayout.connections` + output data sources | `/app`, `/new-app`, `/panel` |
| **strata-layout** | The `AppLayout` (templates, views/slides, containers, design widgets) | `/app`, `/new-app` |
| **strata-export** | Composed PDF / report / atlas / share / data export | `/export` |
| **strata-data** | Convert / publish / analyze | `/convert`, `/publish`, `/analyze` |
| **strata-brand** | Tokens, theme presets, bilingual + the disclaimer footer | all |

---

## Commands (`.claude/commands/*`) — what you type

Onboarding (`/new-app`, `/guide`, `/help`, `/what-can-i-do`, `/recipe`), map authoring (`/create-map`,
`/add-data`, `/symbology`, `/popup`, `/panel`, `/timeslider`, `/app`, `/edit`, `/attachments`, `/analyze`),
data (`/convert`, `/publish`, `/update-metadata`), and `/export`. Full list with arguments:
[Command reference](commands.md).

---

## See also
- **[Human Language Reference](human-language.md)** — the phrase to ask for each component (recipe fuel).
- **[Creating a new component/widget/plugin](../guide/creating-components.md)** — prerequisites + the recipe.
- **[Repository anatomy](../guide/anatomy.md)** — where every file lives.


---

# PACK §4 · Recipe anatomy — the contract a recipe must satisfy, and the Template: protocol

> Source: `recipes/README.md`

# recipes — your workspace

This is where **you build**. The `strata/` folder is the library (the packages, docs, and reference
proxies) — you don't need to touch it. Work here, in `recipes/`, using the `.claude` commands.

A **recipe** is a reproducible path from an idea to a working app on strata-app-builder: a **spec + a
prompt-script** (successive `.claude` prompts that build and style the app on a fresh project), plus a **UI
design spec** and a **verification** section.

## Layout

```
recipes/                    ← your workspace (this folder)
  README.md               ← you are here
  COMPONENT-MANIFEST.md   ← the component-config reference (how to configure every component/binding/token)
  DESIGN-REQUEST-PROMPT.md ← standing instructions for designing a bespoke app from business requirements
  mapviewer/              ← example recipe: map-centric authoring app
  showcase/               ← example recipe: the kitchen-sink multi-page app
```

## Example recipes

- **[mapviewer](mapviewer/RECIPE.md)** — a map-centric **authoring** SPA that explores ArcGIS FeatureServer
  endpoints, adds GeoParquet / COG / Parquet & feature-service tables, keeps registered ArcGIS server
  connections + credentials at the app root (ArcGIS-Pro/QGIS style), and **opens/authors/saves ESRI Web Map
  JSON** (`layers.json`) for embedding. It embeds as a headerless map control inside any other app.
- **[showcase](showcase/RECIPE.md)** — the **kitchen-sink** multi-page app on the `<StrataApp>` engine that
  exercises the entire shipped surface (every control, panel, widget, layout node, the interactivity bus,
  DataSource model, analysis, time, i18n, theming, export). A living catalogue of what the template can build.


## Recipe anatomy — the contract

**This section is normative.** `/recipe` checks a recipe against it and **refuses to build one whose data
is unverified**.

### Two classes

| | **Reference recipe** | **Solution recipe** |
|---|---|---|
| Binds to | a universal, keyless, stable public source | real agency services chosen for one business problem |
| §3 Data | the source, its licence, and the fields used | role x authority x URL x fields x vintage x trap, per layer |
| §4 Verify | a probe of the live source with its **literal output** | the same, per layer, with traps numbered inline |
| Numbers on screen | illustrative | reproducible from §4 |

**Both classes need §4.** "The source is well known" is not verification — the USGS feed's ids are
*strings* and its `time` is epoch milliseconds, and a recipe that never probed would not know either.

### Three states, and only one is buildable

| State | What it has | May `/recipe` run it? |
|---|---|---|
| **Researched** | §§1–5 complete; endpoints curl-verified; §4 carries literal output | **Yes** |
| **Scaffold** | a name and a `Template:` line; §§1/3/4 are TODOs | **No** |
| **Stub** | a folder and a title | **No** |

A fabricated endpoint or field name is worse than a blank — it produces an app that looks finished and is
wrong.

### Required sections

**§1 Study** the decision this serves, the rules that decide it, and honest scope · **§2 UI design spec**
opening with a `Template:` line, a `ThemeSpec` with its contrast measurement, a capability sweep, and a
connections table (floor 3) · **§3 Data sources** per layer with the trap · **§4 Verify** the commands and
their **literal responses**, traps numbered · **§5 Build steps**, naming which path it targets · **§6
Verify the app** in its own terms · **§7 Harvest** gaps into `../strata/docs/troubleshooting.md` · **§8
Sources**.

*Section **names** are normative; numbering may differ where a recipe carries extra sections.*

### The `Template:` protocol

`Template: <id>` scaffolds from that silhouette; **`Template: open-design`** designs freely under the
freestyle charter ([`COMPONENT-MANIFEST.md`](COMPONENT-MANIFEST.md) §10), naming the silhouette in quotes.
Never fall back to a generic dashboard silently — keep the silhouette, stub the gap, record it in §7.

### If a section is missing

§3 or §4 missing ⇒ **stop**, and offer to run the probe. §1 ⇒ build but flag that the design cannot be
justified. §2 ⇒ ask, or design under `open-design` with confirmation. §5 ⇒ derive and confirm. §6 ⇒ fall
back to the build gate alone. **The builder never invents §3 or §4 content.**

## Building your own

Run **`/new-app`** in Claude Code for a guided build, or **`/recipe <name>`** to run one of the example
recipes' guided wizards. When authoring, configure widgets and wire `connections` from
**[COMPONENT-MANIFEST.md](COMPONENT-MANIFEST.md)** and phrase prompts using the
**[Human Language Reference](../strata/docs/reference/human-language.md)**. Preserve the ESRI Web Map JSON
contract on every path.

To design a bespoke app from business requirements, follow
**[DESIGN-REQUEST-PROMPT.md](DESIGN-REQUEST-PROMPT.md)** — standing instructions that take a solution brief
and produce a full application design (personas → candidate silhouettes → `AppLayout` sketch → connections →
theme → capability sweep).

> **Business solution recipes** (proprietary Strata deliverables) are kept in the gitignored
> `.private/solution_recipes/` and are **not** part of this public repo.


---

# PACK §5 · The serialized template roster — AppLayout JSONs shipped in strata/templates/

> Source: `strata/templates/README.md`

# Strata app templates

**30 ready-to-render app templates, each a serialized [`AppLayout`](../packages/schema/src/types.ts) JSON.**
A template is just a serialized app config: a plain JSON file you can copy into an app, hand to
`<StrataApp config={…}>`, and re-point at your own layers.

Each template is a distinct app **silhouette** — a map-centric layout, a dashboard, a web page, or a grid —
rebuilt on strata-app-builder's widgets, containers, and `connections` wiring, and demonstrated against the
shipped test webmaps [`WebMaps/dc.json`](../../WebMaps/dc.json) (District of Columbia) and
[`WebMaps/md.json`](../../WebMaps/md.json) (Maryland). (The roster will look familiar to anyone who has used
ArcGIS Experience Builder starter templates.)

## Using a template

Each template is a serialized `AppLayout` JSON. Load one into the **`<StrataApp>`** engine
(`@strata/core-map`) with a `layers.json` map to render it, or scaffold an app from one via **`/new-app`** in
Claude Code. The roster is validated against the shipped test webmaps by
`packages/schema/tests/templates.test.ts`.

## The roster

| Template | Category | Webmap | Silhouette |
|---|---|---|---|
| `foldable.json` | map-centric | dc | full map + collapsible left panel (layers/legend/basemap) |
| `jewelry-box.json` | map-centric | dc | fixed left drawer of tabbed tools + map |
| `dart.json` | map-centric | dc | map over a fixed bottom data shelf (chart + table) |
| `billboard.json` | map-centric | md | banner headline over a full-bleed map |
| `pocket.json` | map-centric | md | minimal embeddable map, floating legend only |
| `tab.json` | map-centric | dc | map + right sidebar switched by tabs (About/Layers/Data) |
| `launchpad.json` | map-centric | dc | full-bleed map, floating icon dock, tools as floating windows |
| `monitor.json` | dashboard | dc | dark ops board: KPI strip · boxed map · list · chart shelf |
| `dash.json` | dashboard | dc | light compact dashboard: KPI/chart rail + map |
| `summary.json` | dashboard | dc | huge KPI banner; stats recompute on every extent change |
| `reveal.json` | dashboard | dc | views navigation swaps whole dashboard states |
| `gallery.json` | web-page | md | hero + card gallery + embedded map row |
| `journey.json` | web-page | md | bookmark-driven narrative; each step flies the map |
| `ribbon.json` | web-page | md | horizontal bookmark ribbon over the map |
| `parallax.json` | web-page | dc | scrolling story; sections restyle a pinned map |
| `epic.json` | web-page | md | website home: hero · feature cards · map section · footer |
| `snapshot.json` | web-page | dc | KPI cards + a tabs section swapping map/chart/table |
| `timeline.json` | web-page | dc | time-window player over a time-enabled layer + trend chart |
| `frame.json` | web-page | md | one framed, captioned map with prose — editorial print feel |
| `vacation.json` | web-page | md | self-running fly-through (auto-playing slides) |
| `scenic.json` | web-page | md | cinematic full-bleed map with overlaid hero type |
| `quest.json` | web-page | dc | step-by-step guided task flow staging the map per step |
| `introduction.json` | web-page | dc | two pages: onboarding welcome → working map |
| `illustrator.json` | web-page | dc | media-rich article with live maps inline as figures |
| `avatarboard.json` | grid | dc | big map + feature-profile rail (card, details, neighbors) |
| `checkerboard.json` | grid | md | 2×2 checker of maps and content cards, extents synced |
| `collage.json` | grid | dc | asymmetric splitter collage: map, KPIs, chart, table |
| `leaflet.json` | grid | md | tall reading pane (near-me lookup) beside the map |
| `mapflyer.json` | grid | md | destination cards fly one shared map around |
| `multiverse.json` | grid | md | 2×2 grid of extent-synced maps, different layer mixes |

## Anatomy of a template

Every file is one `AppLayout` with a metadata block the gallery (and recipes) read:

```jsonc
{
  "strata:template": { "id": "monitor", "name": "Monitor",
                       "category": "dashboard", "webmap": "dc", "tier": "advanced", "blurb": "…" },
  "theme":       { /* structured ThemeSpec — mode, colors, variables */ },
  "pages":       [ /* AppPage → LayoutNode tree (row/column/grid/splitter/panel/window/views/widget) */ ],
  "connections": [ /* the interactivity: {from, trigger, to, action, options} */ ]
}
```

Rules the roster follows:

- **Real registry keys only** — every `widget.type` exists in `defaultWidgetRegistry`; every trigger/action
  in `@strata/actions`. Enforced by `packages/schema/tests/templates.test.ts` (part of `pnpm test`), which
  extracts the vocabularies from the source files so drift fails CI.
- **Real layers only** — every `layerId` exists in the template's declared webmap.
- **Alive on first render** — every template ships live `connections` (≥2 unless tier `trivial`), because
  interactivity is the demo.
- **Open basemaps** — the webmaps carry the keyless OSM/CARTO set; templates never reference keyed providers.

## Using a template

1. **In an app:** copy the JSON, delete `strata:template`, swap the `layerIds`/fields for your
   `layers.json`, and render with `<StrataApp config={…} context={{ maplibregl, config, store }} />`.
2. **From a recipe:** a `RECIPE.md` can point its layout at a roster file — the template supplies the
   skeleton, the recipe slots content.
3. **Harvesting:** built a layout worth keeping? Serialize it, add a `strata:template` block, drop it here,
   and the gallery picks it up.

*Design rules (silhouette choice, wiring floor, theme levers) live in one place —
[`docs/guide/app-design.md`](../docs/guide/app-design.md); exact widget/config truth lives in
[`recipes/COMPONENT-MANIFEST.md`](../../recipes/COMPONENT-MANIFEST.md) (freestyle charter: §10). This README
stays a roster.*


---

# PACK §6 · Package READMEs — per-package capability notes (all of strata/packages/*)

> Source: `strata/packages/*/README.md`



## actions  (`strata/packages/actions/README.md`)

# @strata/actions

A typed **data-action bus** so strata-app-builder widgets and panels **cross-drive each other** — the way ArcGIS
Experience Builder's message/action framework and CARTO's widgets do. A widget emits a **trigger**
(`categorySelect`, `rowSelect`, `extentChange`, …); subscribers run an **action** (filter the map, zoom to a
feature, view in table, recompute). Zero dependencies.

```ts
import { ActionBus, connectBusToStore } from "@strata/actions";

const bus = new ActionBus();
// wire the bus to the store + map: category clicks filter the layer, row clicks select/zoom
const off = connectBusToStore(bus, store, {
  onFilter: (layerId, where) => strataMap.setFilter(layerId, where),
  onSelect: (layerId, oids, zoom) => strataMap.highlight(layerId, oids, zoom),
});

// a CartoPanel category click:
bus.emit({ type: "categorySelect", source: "carto-1", payload: { layerId, field: "INCOME_GRP", value: "High income" } });
// a table row click:
bus.emit({ type: "rowSelect", source: "table-1", payload: { layerId, oids: [42], zoom: true } });
```

Now the CartoPanel category filter, the attribute table, and any chart can all react to one another — not
just the map. Use `bus.on("filterChange", …)` in a widget to recompute when the filter changes.

## auth-arcgis  (`strata/packages/auth-arcgis/README.md`)

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

## basemap-arcgis  (`strata/packages/basemap-arcgis/README.md`)

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

## core-map  (`strata/packages/core-map/README.md`)

# @strata/core-map

The React + **MapLibre GL JS** map component at the heart of every Strata GIS app. It is driven entirely
by an **ESRI Web Map JSON** `layers.json` (from `@strata/schema`) and renders **genuine ESRI
`drawingInfo` renderers and `popupInfo` popups** — no custom styling DSL.

## Quick use

```tsx
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { StrataMap } from "@strata/core-map";
import config from "./layers.json";

export default function App() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <StrataMap maplibregl={maplibregl} config={config} dataClient={{ proxyUrl: "/proxy/featureserver" }} />
    </div>
  );
}
```

`maplibre-gl` and `react` are **peer dependencies** — the app provides them, and you pass the `maplibregl`
module into `<StrataMap>` (keeps the template free of a hard build-time map dependency).

## What's in this package

| Module | Status | What it does |
|---|---|---|
| `engine/styleCompiler` | **implemented** | ESRI renderer → MapLibre paint (simple / uniqueValue / classBreaks / heatmap / visual variables / labels). Pure functions. |
| `engine/arcgisSource` | **implemented** | ArcGIS REST → paged GeoJSON with progressive load + proxy/token fallback. |
| `engine/MapController` | **implemented** | Owns the MapLibre map, the `ready` promise, RTL/Arabic text, the view API. |
| `engine/layers` | core flow implemented | Logical-layer registry (namespaced sub-layers, mutation queue, renderer apply). |
| `engine/basemaps` | raster implemented | Apply `baseMap.baseMapLayers` (WebTiledLayer). |
| `engine/popups` | basic implemented | Click → `popupInfo` field table. |
| `react/StrataMap` | **implemented** | The embeddable component (renders a `layers.json`). |
| `layout/*` | FullPage implemented | Layout presets (MapInScroll / SplitDashboard / MultiMap next). |
| `react/controls/*`, `react/panels/*` | scaffold | On-map controls + advanced panels (next release). |

See `../../docs/guide/style-compiler.md` for the renderer→paint mapping and
`../../docs/guide/anatomy.md` for how this package fits the whole.

## data-management  (`strata/packages/data-management/README.md`)

# @strata/data-management

Convert GIS data to GeoParquet and **publish it to the Strata Serve server** (`wt-server`) as a
FeatureServer layer, with a full metadata bundle.

## The publish model

The Serve server is started with `wt-server <server_config.toml>` (the config path is required). Each layer
is a DuckDB view over a **GeoParquet** file (disk, `https://…`, or `s3://…`). Publishing = place the
parquet → add a `[[duckdb.datasources]]` block → write a metadata bundle → **restart** (no hot reload).

The **catalog record** (`@strata/schema`) is the single source of truth; this package **renders** it into
those artifacts:

```bash
strata-data render ./my-layer.record.json
# prints the [[duckdb.datasources]] block, metadata.toml, drawingInfo.json, popupInfo.json, and the URL
```

## Status (v0.1.0)

- **implemented:** `render` — catalog record → datasource block + metadata bundle (`src/publish/render.ts`).
- **scaffolded (next):** `convert` (ogr2ogr / DuckDB wrappers for GDB / Shapefile / GeoJSON both flavors /
  ESRI JSON / CSV / KML), `publish` orchestration (place parquet → write config → write bundle → restart →
  validate), catalog CRUD, and secured-token minting. Today these run via the `.claude/commands` (`/convert`,
  `/publish`) and `.claude/scripts` (`convert.sh`, `write_datasource.sh`, `restart_server.sh`).

See `../../docs/how-to/publish-data.md`.

## data-source  (`strata/packages/data-source/README.md`)

# @strata/data-source

The first-class **DataSource** layer — Phase 1 of the Experience-Builder-parity plan, and its keystone.

A `DataSource` decouples widgets from physical layers. It owns its own **schema**, **query**, **selection**,
**filtered view**, and **statistics**, so any widget bound to the same source links to every other widget
bound to it — the "any widget drives any widget" property EB gets from `jimu-data` — with **zero
`connections`**.

## Implementations

| Kind | Class | Wraps |
|---|---|---|
| `feature-layer` | `FeatureLayerDataSource` | one `layers.json` layer + the `@strata/state` store (selection → `setSelection`, filter → `definitionExpression`) — the **back-compat bridge** |
| `output` | `OutputDataSource` | a widget's `@strata/actions` `OutputRegistry` output (`dataSource.fromWidget`) |
| `statistics` | `StatisticsDataSource` | the aggregate result of another source (drives KPI/gauge/chart) |
| `geometry` | `GeometryDataSource` | a sketch/buffer geometry (feeds spatial filters) |
| `web-map` | `WebMapDataSource` | a whole `layers.json`; delegates to a per-layer source chosen at runtime |

## Manager & back-compat

`DataSourceManager` is instantiated once by `<StrataApp>` and threaded through context. It **auto-wraps**
legacy bindings, so **no recipe changes**:

- `dataSource: { layerId }` → `FeatureLayerDataSource`
- `dataSource: { fromWidget }` → `OutputDataSource`
- `dataSource: { sourceId }` → the explicit source (the new, richer opt-in)

`manager.resolve(binding, ctx)` honors precedence `sourceId → layerId → fromWidget`.

## Query subset

`query.ts` is a pure, node-safe evaluator for the SQL `where` subset the WIF emits (`=`, `<>`, `>`, `>=`,
`<`, `<=`, `IN`, `BETWEEN`, `IS [NOT] NULL`, joined by flat `AND`/`OR`) plus a count/sum/avg/min/max
aggregate engine with optional group-by. Network-backed sources bypass it by injecting a `queryFn`.

## Status

- **Package core** — complete and unit-tested (query engine, five sources, manager).
- **`<StrataApp>` integration** — done: the app instantiates a `DataSourceManager`, pre-registers a source
  for every widget binding (`registerAppDataSources`), and injects the resolved `source` into each widget.
  Widgets sharing a `layerId`/`sourceId` share ONE source, so they link with no `connections`.
- **First widget migrated** — `kpi` (`stat: {field, op}`) computes live from its bound source and updates on
  filter/selection. `useDataSource(source)` in `@strata/core-map` is the hook other widgets adopt.
- **Remaining Phase-1 work** — migrate the other data widgets (`table`, `chart`, `carto`, `filter`, `gauge`,
  `feature-info`) to read `source` the same way. Additive; their current props keep working.

## export  (`strata/packages/export/README.md`)

# @strata/export

Map export for strata-app-builder. Reused by the open-data hub (downloads, thumbnails, "open this map") and any
app.

| Function | Status | Notes |
|---|---|---|
| `exportSpec(config)` | implemented | Shareable ESRI Web Map JSON (`layers.json`) — re-openable, round-trips to ArcGIS tooling. |
| `exportImage({map, format})` | implemented | Data URL from the MapLibre canvas (create the map with `preserveDrawingBuffer:true`). |
| `exportPDF({map, title, attribution})` | implemented | Dependency-free browser print layout (title + map image + attribution) → "Save as PDF". Needs `preserveDrawingBuffer:true`. |
| `exportLayerData(id, {format, map, data})` | implemented | `geojson` / `csv` Blobs from the layer's live GeoJSON. `geoparquet` is served by the Strata export endpoint (server-side). |

Driven by the `/export` command. See `../../docs/how-to/export-maps.md`.

## feature-arcgis  (`strata/packages/feature-arcgis/README.md`)

# @strata/feature-arcgis

Optional adapter over Esri's **`@esri/arcgis-feature-service`** for advanced feature-service operations —
**statistics, related records, and editing** — beyond the lean read path in `@strata/core-map`.

**Works against BOTH backends** (pure ArcGIS REST FeatureServer wire): a **Strata Serve** FeatureServer and
an **ESRI Enterprise/Online** FeatureServer.

The Esri libraries are **optional peer dependencies**, lazy-loaded, so the lean core builds and runs without
them. Install them only in an app that uses this adapter:

```bash
pnpm add @esri/arcgis-feature-service @esri/arcgis-rest-request
```

## API
- `queryFeatures(opts)` → GeoJSON (Strata + Esri).
- `queryStatistics(opts)` → `outStatistics` / group-by (Strata + Esri).
- `queryRelatedRecords(opts)` → related records.
- `applyEdits(opts)` → add/update/delete. **Needs a writable + authenticated backend** — ESRI today, or
  Strata once its editing + auth land (Strata Serve is read-only in this release).

## Backend / auth note
Reads and statistics work on Strata now. For **ESRI** backends that require auth, create the auth manager
with **`@strata/auth-arcgis`** (ESRI-only) and pass it as `authentication`. **Do not** use ArcGIS REST JS
auth against a Strata backend — Strata does not yet implement portal-grade auth (planned); use Strata's own
token flow for Strata when it ships.

## i18n  (`strata/packages/i18n/README.md`)

# @strata/i18n

A tiny, **dependency-free** internationalization helper for strata-app-builder apps. A dictionary is a plain
`locale -> key -> string` map; `createI18n` gives you `{var}` interpolation, key fallback, and RTL
direction detection. Ships a base **EN + AR** UI dictionary (`baseDict`).

```ts
import { createI18n, baseDict, type Dict } from "@strata/i18n";

const i18n = createI18n(baseDict, "en");

i18n.t("layers");            // "Layers"
i18n.setLocale("ar");
i18n.t("layers");            // "الطبقات"
i18n.dir();                  // "rtl"  → set on your root <html dir=…>
i18n.available();            // ["en", "ar"]

// {var} interpolation, with a fallback to the key when a string is missing:
i18n.t("welcome", { name: "Sara" }); // "welcome" (not defined) → falls back to the key
```

## Extending the dictionary

`Dict` is just data — spread `baseDict` and add your own keys or locales:

```ts
const dict: Dict = {
  en: { ...baseDict.en, welcome: "Welcome, {name}" },
  ar: { ...baseDict.ar, welcome: "مرحبًا، {name}" },
  fr: { welcome: "Bienvenue, {name}" },
};
const i18n = createI18n(dict, "fr");
```

`dir()` returns `"rtl"` for locales beginning `ar` / `he` / `fa` / `ur` (e.g. `ar-SA`), else `"ltr"`.

## React binding

A thin React binding — `I18nProvider` + `useI18n()` — lives in `@strata/core-map`. Wrap your tree,
then read `{ t, dir, locale, setLocale }` from the hook and set `dir` on your root element.

## plugin-routing  (`strata/packages/plugin-routing/README.md`)

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

## plugin-search  (`strata/packages/plugin-search/README.md`)

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

## plugin-statusbar  (`strata/packages/plugin-statusbar/README.md`)

# @strata/plugin-statusbar

A GeoLibre-style **map status bar + scalebar** as a `StrataPlugin`: live cursor **coordinates**, **zoom**
level, a graphic **scalebar** with a distance label, and the **coordinate system (CRS)**. Plain-DOM, uses
only `app.getMap()` — works via the plugin/marketplace route and non-React hosts.

```ts
import { PluginManager } from "@strata/plugins";
import { statusBarPlugin } from "@strata/plugin-statusbar";

const manager = new PluginManager();
manager.register(statusBarPlugin({ crs: "EPSG:4326", precision: 5 }));
manager.activate("strata-statusbar", app);
```

Options: `{ crs?, precision?, scalebarTargetPx? }`. React apps can instead use the **`StatusBar`** control in
`@strata/core-map` (`react/controls`), which takes the live `map` and renders the same info.

## plugin-timeslider  (`strata/packages/plugin-timeslider/README.md`)

# @strata/plugin-timeslider

A temporal **time slider** with **play/pause** as a `StrataPlugin`. It mounts a plain-DOM slider at the
bottom of the map container and, as it moves (or plays), builds a time `definitionExpression` per configured
layer and hands it to your `onApplyFilter`. Time values are **epoch-millis**. Plain-DOM, uses only
`app.getMap()` — works via the plugin/marketplace route and non-React hosts.

```ts
import { PluginManager } from "@strata/plugins";
import { timeSliderPlugin } from "@strata/plugin-timeslider";

const manager = new PluginManager();
manager.register(
  timeSliderPlugin({
    layers: [{ id: "flood-gauges", timeField: "reading_time" }],
    min: Date.parse("2026-07-01"),
    max: Date.parse("2026-07-14"),
    mode: "instant", // cumulative: reading_time <= t
    onApplyFilter: (layerId, where) => console.log(layerId, where),
  }),
);
manager.activate("strata-timeslider", app);
```

Options: `{ layers, min, max, step?, mode?, onApplyFilter?, playIntervalMs?, windowSize? }`.

- **`mode: "instant"`** builds a cumulative filter `<timeField> <= <t>`.
- **`mode: "window"`** builds a moving window `<timeField> >= <start> AND <timeField> <= <end>`.
- If `onApplyFilter` is omitted, the built `where` is logged to the console instead.

React apps can instead use the **`TimeSlider`** control in `@strata/core-map` (`react/controls`), which takes
the same options and emits `onApplyFilter` / `onChange`. Pair either with the **`TimeSeries`** widget
(`react/widgets`) to draw the flood **hydrograph** or wildfire acres-trend with threshold bands.

## plugins  (`strata/packages/plugins/README.md`)

# @strata/plugins

The strata-app-builder plugin system. It is modelled on [GeoLibre](https://github.com/)'s plugin API
but **ESRI Web Map JSON-native**: plugins operate on `OperationalLayer`s and genuine ESRI
`renderer` / `popupInfo` JSON, never on a bespoke styling DSL.

## The contract

A plugin implements `StrataPlugin`:

```ts
interface StrataPlugin {
  id: string;
  name: string;
  version: string;
  activeByDefault?: boolean;

  activate(app: StrataAppAPI): boolean | void; // return false to veto
  deactivate(app: StrataAppAPI): void;

  getProjectState?(): unknown;                       // persist a slice into a saved project
  applyProjectState?(app: StrataAppAPI, state: unknown): void;

  urlParameterNames?: string[];                      // deep-link params this plugin owns
  handleUrlParameters?(app: StrataAppAPI, params: URLSearchParams): void | Promise<void>;
}
```

The host hands each plugin a `StrataAppAPI`:

```ts
interface StrataAppAPI {
  setBaseMap(bm): void;
  addOperationalLayer(layer): string;   // -> registered layer id
  removeLayer(id): void;
  setRenderer(id, renderer): void;      // genuine ESRI renderer JSON
  setPopup(id, popupInfo): void;        // genuine ESRI popupInfo JSON
  fitBounds(bbox): void;
  getMap?(): unknown;                    // e.g. the MapLibre Map, if exposed
  getStore(): StrataStore;               // the @strata/state store
  registerPanel?(panel): void;           // plain-DOM panels (see below)
  unregisterPanel?(id): void;
  registerToolbarMenu?(menu): void;
  unregisterToolbarMenu?(id): void;
}
```

### Panels are plain DOM

External plugins can't share the host's React tree, so UI contributions use a plain-DOM
contract — exactly like GeoLibre:

```ts
interface StrataPanel {
  id: string;
  title: string;
  placement?: "left" | "right" | "bottom" | "modal";
  render(container: HTMLElement): void | (() => void); // returned fn runs on unmount
}
```

## Writing a plugin

```ts
import type { StrataPlugin } from "@strata/plugins";

export function measurePlugin(): StrataPlugin {
  return {
    id: "acme.measure",
    name: "Measure",
    version: "1.0.0",
    activate(app) {
      app.registerPanel?.({
        id: "acme.measure.panel",
        title: "Measure",
        placement: "right",
        render(container) {
          container.innerHTML = `<button id="m">Measure</button>`;
          const onClick = () => app.fitBounds([-10, -10, 10, 10]);
          container.querySelector("#m")!.addEventListener("click", onClick);
          return () => container.querySelector("#m")?.removeEventListener("click", onClick);
        },
      });
    },
    deactivate(app) {
      app.unregisterPanel?.("acme.measure.panel");
    },
  };
}
```

## Using the manager

```ts
import { PluginManager, basemapPlugin } from "@strata/plugins";

const manager = new PluginManager();
manager.registerAll([basemapPlugin({ /* basemap */ })]);
manager.activateDefaults(app);            // activates activeByDefault plugins
manager.activate("acme.measure", app);
manager.isActive("acme.measure");         // -> boolean
manager.list();                            // -> StrataPlugin[]
```

## Built-in example: `basemapPlugin`

`basemapPlugin(options?)` sets the map's basemap on activate (and restores the prior one on
deactivate), demonstrating the full lifecycle plus `getProjectState` / `applyProjectState`.

## Future work: external plugin manifests

External, non-bundled plugins will ship a `plugin.json` manifest (id, name, version, entry,
declared `urlParameterNames`, capability grants) that the host loads and validates before
activation. Not implemented in this release — the in-process `StrataPlugin`/`PluginManager`
API above is the supported path today.

## processing  (`strata/packages/processing/README.md`)

# @strata/processing

A [Turf.js](https://turfjs.org/) spatial-analysis registry for strata-app-builder. Pure functions
over GeoJSON `FeatureCollection`s — GeoJSON in, GeoJSON out, no side effects — powering the
COP (common operating picture) analyses. **Distances are in kilometres.**

## Operations

| Function | What it does |
| --- | --- |
| `buffer(fc, distanceKm)` | Buffer each feature by N km. |
| `centroids(fc)` | Centroid of each feature (properties preserved). |
| `dissolve(fc, field?)` | Merge polygons, optionally grouped by a shared field value. |
| `clip(fc, mask)` | Clip features to a polygon mask (intersection). |
| `nearest(fromPoint, candidatesFc)` | Nearest candidate point + distance (km). |
| `pointsWithin(pointsFc, polygonsFc)` | Select-by-location: points inside any polygon. |
| `spatialJoin(targetFc, joinFc, { predicate })` | Left join by `intersects` / `within` / `contains`. |
| `withinDistance(pointsFc, refPointsFc, km)` | Points within X km of any reference point. |

## Registry

`registry` maps `id -> { label, description, run(args) }` so a UI or command can enumerate
and invoke tools uniformly. `listTools()` returns `{ id, label, description }[]` for menus.

```ts
import { registry, listTools } from "@strata/processing";

listTools(); // -> [{ id: "buffer", label: "Buffer", ... }, ...]
const buffered = registry.buffer.run({ fc, distanceKm: 5 });
```

## Worked examples

### Schools within 5 km of any emergency

```ts
import { withinDistance } from "@strata/processing";

// schoolsFc, emergenciesFc are point FeatureCollections
const atRisk = withinDistance(schoolsFc, emergenciesFc, 5);
// atRisk.features -> the schools inside the 5 km radius of at least one emergency
```

### Nearest health facility

```ts
import { nearest } from "@strata/processing";

const incident = { type: "Feature", geometry: { type: "Point", coordinates: [46.68, 24.71] }, properties: {} };
const { feature, distanceKm } = nearest(incident, healthFacilitiesFc);
console.log(feature?.properties?.name, `${distanceKm?.toFixed(1)} km away`);
```

### Districts each incident falls in (spatial join)

```ts
import { spatialJoin } from "@strata/processing";

const tagged = spatialJoin(incidentsFc, districtsFc, { predicate: "within" });
// each incident now carries its district's properties (target keys win on collision)
```

## Notes

- All geometry is assumed **EPSG:4326** (the whole Strata stack is). Reproject on the way in.
- `dissolve` flattens MultiPolygons first (Turf requires flat Polygon collections).
- The `boolean*` predicates can throw on degenerate geometry; `spatialJoin` treats a throw
  as "no match" rather than failing the whole run.

## schema  (`strata/packages/schema/README.md`)

# @strata/schema

The **shared contract** for strata-app-builder — the connective tissue between the map and the data tooling.

Two interlocking shapes:

1. **`layers.json`** (`layers.schema.json`, `LayersJson`) — the **map specification**, aligned to the
   **ESRI Web Map JSON** spec (`operationalLayers`, `baseMap`, `spatialReference`, `initialState`). It
   drives `<StrataMap>`. Styling is genuine ESRI `drawingInfo`; popups are genuine ESRI `popupInfo`.
2. **`catalog.json`** (`catalog.schema.json`, `CatalogRecord`) — the **single source of truth** for a
   published layer. It renders into a Strata Serve `[[duckdb.datasources]]` block **and** a metadata
   bundle (`metadata.toml` + `drawingInfo.json` + `popupInfo.json`), and also feeds the open-data hub
   (DCAT). Author a layer once here; every app references it by `id`.

## Usage

```ts
import type { LayersJson, CatalogRecord } from "@strata/schema";
import { layersSchema, catalogSchema } from "@strata/schema";
```

Validate with any JSON Schema validator (e.g. Ajv) against `layersSchema` / `catalogSchema`.

## Design rules

- **No custom styling DSL.** Store the exact ESRI renderer/popup JSON — the style compiler in
  `@strata/core-map` maps it to MapLibre paint.
- **`spatialReference` is explicit** (EPSG:4326 throughout).
- **App-proprietary data is namespaced** under `strata:extensions` so the document round-trips through
  ArcGIS Web Map tooling.

## state  (`strata/packages/state/README.md`)

# @strata/state

Framework-agnostic app state for strata-app-builder, backed by a **vanilla Zustand** store
(`zustand/vanilla`). It holds the live authoring state of a Strata map and round-trips to and
from the ESRI Web Map JSON-aligned `LayersJson` from `@strata/schema`.

## State shape

```ts
{
  layers: OperationalLayer[],
  selection: { layerId: string; oids: number[] } | null,
  view: { center: [number, number]; zoom: number } | null,
  baseMap: BaseMap | null,
}
```

## Actions

`addLayer`, `removeLayer(id)`, `renameLayer(id, title)`, `reorderLayers(ids)`, `setVisibility(id, bool)`,
`setOpacity(id, n)`, `setSelection(sel)`, `setView(v)`, `setBaseMap(bm)`,
`loadFromLayersJson(cfg)`, `toLayersJson()`, plus undo/redo: `undo()`, `redo()`,
`canUndo()`, `canRedo()`.

## Usage (vanilla)

```ts
import { createStrataStore } from "@strata/state";

const store = createStrataStore();
store.getState().addLayer(myOperationalLayer);
store.getState().setVisibility(myOperationalLayer.id, false);

const cfg = store.getState().toLayersJson(); // -> LayersJson

const unsub = store.subscribe((s) => console.log(s.layers.length));
```

## Usage (React)

A vanilla store carries no React binding on its own. Wrap it with zustand's `useStore`
in a React app:

```ts
import { useStore } from "zustand";
import { createStrataStore } from "@strata/state";

const store = createStrataStore();
export const useLayers = () => useStore(store, (s) => s.layers);
```

## Undo / redo

Every mutating action first pushes a snapshot of the undoable slice
(`layers`, `selection`, `view`, `baseMap`) onto a bounded history (last ~50 states).
`undo()` restores the previous snapshot and moves the current one onto the redo ring;
`redo()` reverses that. A new mutation clears the redo ring. Snapshots are deep-cloned
(via `structuredClone`) so history never aliases live state.


---

# PACK §7 · Example A — a wired dashboard template (monitor)

> Source: `strata/templates/monitor.json`

```jsonc
{
  "version": "1.0",
  "//": "Strata template 'monitor' — a genuine <StrataApp> AppLayout. Demo data: WebMaps/dc.json. See strata/templates/README.md.",
  "strata:template": {
    "id": "monitor",
    "name": "Monitor",
    "category": "dashboard",
    "webmap": "dc",
    "tier": "advanced",
    "blurb": "The dark ops board: KPI strip, boxed center map, priority list, chart shelf — wall-readable."
  },
  "theme": {
    "mode": "dark",
    "colors": {
      "primary": "#38bdf8",
      "secondary": "#f59e0b"
    },
    "variables": {
      "--strata-app-bg": "#0b1220",
      "--strata-panel-bg": "#111a2b"
    }
  },
  "pages": [
    {
      "id": "main",
      "title": "Main",
      "type": "fixed",
      "root": {
        "kind": "column",
        "children": [
          {
            "kind": "grid",
            "children": [
              {
                "kind": "widget",
                "widget": {
                  "type": "kpi",
                  "id": "kpiCrashes",
                  "props": {
                    "label": "Crashes (Q4)",
                    "stat": "count",
                    "status": "warn"
                  },
                  "dataSource": {
                    "layerId": "dc-crashes"
                  }
                }
              },
              {
                "kind": "widget",
                "widget": {
                  "type": "kpi",
                  "id": "kpiVehicles",
                  "props": {
                    "label": "Vehicles involved",
                    "field": "TOTAL_VEHICLES",
                    "stat": "sum"
                  },
                  "dataSource": {
                    "layerId": "dc-crashes"
                  }
                }
              },
              {
                "kind": "widget",
                "widget": {
                  "type": "kpi",
                  "id": "kpiWards",
                  "props": {
                    "label": "Wards",
                    "stat": "count",
                    "status": "ok"
                  },
                  "dataSource": {
                    "layerId": "dc-wards"
                  }
                }
              },
              {
                "kind": "widget",
                "widget": {
                  "type": "kpi",
                  "id": "kpiProjects",
                  "props": {
                    "label": "Housing projects",
                    "stat": "count"
                  },
                  "dataSource": {
                    "layerId": "dc-affordable-housing"
                  }
                }
              }
            ],
            "columns": 4,
            "gap": 10,
            "style": {
              "padding": "12px 12px 0"
            }
          },
          {
            "kind": "row",
            "children": [
              {
                "kind": "section",
                "children": [
                  {
                    "kind": "widget",
                    "widget": {
                      "type": "map",
                      "id": "map",
                      "props": {
                        "layerIds": [
                          "dc-wards",
                          "dc-crashes"
                        ],
                        "controls": {
                          "navigation": true,
                          "scale": true,
                          "position": "top-right"
                        }
                      }
                    }
                  }
                ],
                "mode": "fixed",
                "style": {
                  "flex": "1 1 0%",
                  "minWidth": 0,
                  "height": "100%",
                  "padding": "12px"
                }
              },
              {
                "kind": "column",
                "children": [
                  {
                    "kind": "widget",
                    "widget": {
                      "type": "text",
                      "props": {
                        "content": "Latest crashes",
                        "as": "h3"
                      }
                    }
                  },
                  {
                    "kind": "widget",
                    "widget": {
                      "type": "table",
                      "id": "crashList",
                      "props": {
                        "paging": true
                      },
                      "dataSource": {
                        "layerId": "dc-crashes"
                      }
                    }
                  }
                ],
                "gap": 8,
                "style": {
                  "flex": "0 0 320px",
                  "padding": "12px",
                  "overflow": "auto"
                }
              }
            ],
            "style": {
              "flex": "1 1 0%",
              "minHeight": 0
            },
            "responsive": {
              "small": {
                "kind": "column"
              }
            }
          },
          {
            "kind": "row",
            "children": [
              {
                "kind": "widget",
                "widget": {
                  "type": "chart",
                  "id": "wardChart",
                  "props": {
                    "kind": "bar",
                    "category": "WARD",
                    "title": "Crashes by ward"
                  },
                  "dataSource": {
                    "layerId": "dc-crashes"
                  }
                }
              },
              {
                "kind": "widget",
                "widget": {
                  "type": "chart",
                  "id": "trend",
                  "props": {
                    "kind": "line",
                    "category": "REPORTDATE",
                    "title": "Crashes over time"
                  },
                  "dataSource": {
                    "layerId": "dc-crashes"
                  }
                }
              }
            ],
            "gap": 12,
            "style": {
              "flex": "0 0 220px",
              "padding": "0 12px 12px"
            },
            "responsive": {
              "small": {
                "kind": "column"
              }
            }
          }
        ],
        "style": {
          "height": "100%"
        }
      },
      "header": {
        "kind": "row",
        "children": [
          {
            "kind": "widget",
            "widget": {
              "type": "text",
              "props": {
                "content": "Monitor",
                "as": "h3"
              }
            }
          },
          {
            "kind": "widget",
            "widget": {
              "type": "text",
              "props": {
                "content": "operations board",
                "style": {
                  "opacity": "0.65",
                  "fontSize": "12px"
                }
              }
            }
          },
          {
            "kind": "widget",
            "widget": {
              "type": "text",
              "props": {
                "content": "",
                "style": {
                  "flex": "1"
                }
              }
            }
          },
          {
            "kind": "widget",
            "widget": {
              "type": "theme-switch",
              "id": "themeSwitch",
              "props": {
                "presets": [
                  "light",
                  "dark"
                ]
              }
            }
          },
          {
            "kind": "widget",
            "widget": {
              "type": "share"
            }
          }
        ],
        "gap": 12,
        "style": {
          "alignItems": "center",
          "padding": "10px 16px"
        }
      }
    }
  ],
  "connections": [
    {
      "from": "wardChart",
      "trigger": "categorySelect",
      "to": "map",
      "action": "filter",
      "options": {
        "layerId": "dc-crashes"
      }
    },
    {
      "from": "wardChart",
      "trigger": "categorySelect",
      "to": "crashList",
      "action": "filter",
      "options": {
        "layerId": "dc-crashes"
      }
    },
    {
      "from": "crashList",
      "trigger": "rowSelect",
      "to": "map",
      "action": "zoomTo",
      "options": {
        "layerId": "dc-crashes"
      }
    },
    {
      "from": "crashList",
      "trigger": "rowSelect",
      "to": "map",
      "action": "flash"
    },
    {
      "from": "map",
      "trigger": "extentChange",
      "to": "kpiCrashes",
      "action": "showStatistics"
    }
  ]
}
```


---

# PACK §8 · Example B — a floating-dock template with windows + controller (launchpad)

> Source: `strata/templates/launchpad.json`

```jsonc
{
  "version": "1.0",
  "//": "Strata template 'launchpad' — a genuine <StrataApp> AppLayout. Demo data: WebMaps/dc.json. See strata/templates/README.md.",
  "strata:template": {
    "id": "launchpad",
    "name": "Launchpad",
    "category": "map-centric",
    "webmap": "dc",
    "tier": "simple",
    "blurb": "Full-bleed map with a floating icon dock; every tool opens as a floating card. Zero docked panels."
  },
  "theme": {
    "mode": "dark",
    "colors": {
      "primary": "#0ea5e9"
    },
    "variables": {
      "--strata-app-bg": "#0b1220"
    }
  },
  "pages": [
    {
      "id": "main",
      "title": "Main",
      "type": "fixed",
      "root": {
        "kind": "section",
        "children": [
          {
            "kind": "widget",
            "widget": {
              "type": "map",
              "id": "map",
              "props": {
                "layerIds": [
                  "dc-wards",
                  "dc-parcels",
                  "dc-bike-routes",
                  "dc-crashes",
                  "dc-affordable-housing"
                ],
                "controls": {
                  "navigation": true,
                  "geolocate": true,
                  "position": "top-right"
                }
              }
            }
          },
          {
            "kind": "column",
            "children": [
              {
                "kind": "widget",
                "widget": {
                  "type": "measure",
                  "id": "measure"
                }
              },
              {
                "kind": "widget",
                "widget": {
                  "type": "draw",
                  "id": "sketch"
                }
              },
              {
                "kind": "widget",
                "widget": {
                  "type": "coordinates"
                }
              },
              {
                "kind": "widget",
                "widget": {
                  "type": "search"
                }
              }
            ],
            "mode": "flow",
            "style": {
              "position": "absolute",
              "top": "12px",
              "left": "12px",
              "gap": "8px",
              "zIndex": "5"
            }
          },
          {
            "kind": "row",
            "children": [
              {
                "kind": "widget",
                "widget": {
                  "type": "controller",
                  "id": "dock"
                }
              }
            ],
            "mode": "flow",
            "style": {
              "position": "absolute",
              "bottom": "18px",
              "left": "50%",
              "transform": "translateX(-50%)",
              "zIndex": "6"
            }
          },
          {
            "kind": "window",
            "children": [
              {
                "kind": "column",
                "children": [
                  {
                    "kind": "widget",
                    "widget": {
                      "type": "legend"
                    }
                  }
                ],
                "style": {
                  "padding": "8px"
                }
              }
            ],
            "id": "legendWin",
            "title": "Legend",
            "modal": false,
            "open": false
          },
          {
            "kind": "window",
            "children": [
              {
                "kind": "column",
                "children": [
                  {
                    "kind": "widget",
                    "widget": {
                      "type": "layer-panel",
                      "id": "layers"
                    }
                  }
                ],
                "style": {
                  "padding": "8px"
                }
              }
            ],
            "id": "layersWin",
            "title": "Layers",
            "modal": false,
            "open": false
          },
          {
            "kind": "window",
            "children": [
              {
                "kind": "column",
                "children": [
                  {
                    "kind": "widget",
                    "widget": {
                      "type": "basemap"
                    }
                  }
                ],
                "style": {
                  "padding": "8px"
                }
              }
            ],
            "id": "basemapWin",
            "title": "Basemap",
            "modal": false,
            "open": false
          }
        ],
        "mode": "fixed",
        "style": {
          "flex": "1 1 0%",
          "minWidth": 0,
          "minHeight": 0,
          "height": "100%"
        }
      }
    }
  ],
  "connections": [
    {
      "from": "dock",
      "trigger": "buttonClick",
      "to": "legendWin",
      "action": "showHide"
    },
    {
      "from": "dock",
      "trigger": "buttonClick",
      "to": "layersWin",
      "action": "showHide"
    },
    {
      "from": "sketch",
      "trigger": "sketchComplete",
      "to": "map",
      "action": "selectByGeometry"
    },
    {
      "from": "map",
      "trigger": "featureSelect",
      "to": "map",
      "action": "flash"
    }
  ]
}
```


---

# PACK §9 · Example C — the kitchen-sink showcase AppLayout (every capability)

> Source: `recipes/showcase/app.json`

```jsonc
{
  "version": "1.0",
  "//": "Strata Showcase — the DC Operations Center. A genuine <StrataApp> AppLayout that exercises the whole shipped strata-app-builder surface against WebMaps/dc.json. Every `type` is a real defaultWidgetRegistry key; every `layerId` is a real dc.json operational layer. Themed as a civic command center (structured dark theme + light/auto). See RECIPE.md.",

  "theme": {
    "mode": "auto",
    "colors": {
      "primary": "#38bdf8",
      "secondary": "#a78bfa",
      "success": "#34d399",
      "info": "#38bdf8",
      "warning": "#fbbf24",
      "danger": "#f87171",
      "dark": "#0b1220",
      "light": "#f4f7fb"
    },
    "fonts": { "family": "Inter, system-ui, sans-serif", "mono": "ui-monospace, Menlo, monospace", "scale": "default" },
    "variables": {
      "--strata-app-bg": "#0b1220",
      "--strata-panel-bg": "#111a2b",
      "--strata-radius-md": "10px"
    },
    "overrides": {
      "kpi": { "borderRadius": "12px" },
      "status-bar": { "backdropFilter": "blur(6px)" }
    }
  },

  "splash": {
    "title": "DC Operations Center",
    "body": "A living catalogue of strata-app-builder — every panel, widget, layout, chart, filter, and interaction, wired live against District of Columbia open data (ESRI Web Map JSON on MapLibre). Use the tab bar to tour each capability family.",
    "dismissible": true,
    "once": true
  },

  "connections": [
    { "from": "wardChart", "trigger": "categorySelect", "to": "map", "action": "filter", "options": { "layerId": "dc-wards" } },
    { "from": "wardChart", "trigger": "categorySelect", "to": "wardTable", "action": "filter", "options": { "layerId": "dc-wards" } },
    { "from": "severityChart", "trigger": "categorySelect", "to": "map", "action": "filter", "options": { "layerId": "dc-crashes" } },
    { "from": "wardTable", "trigger": "rowSelect", "to": "map", "action": "zoomTo", "options": { "layerId": "dc-wards" } },
    { "from": "wardTable", "trigger": "rowSelect", "to": "featureInfo", "action": "viewInTable", "options": { "layerId": "dc-wards" } },
    { "from": "carto", "trigger": "filterChange", "to": "map", "action": "filter" },
    { "from": "queryBuilder", "trigger": "filterChange", "to": "map", "action": "filter", "options": { "layerId": "dc-crashes" } },
    { "from": "queryBuilder", "trigger": "recordsChange", "to": "queryTable", "action": "viewInTable" },
    { "from": "timeSlider", "trigger": "filterChange", "to": "map", "action": "filter", "options": { "layerId": "dc-crashes" } },
    { "from": "sketch", "trigger": "sketchComplete", "to": "map", "action": "selectByGeometry" },
    { "from": "openBench", "trigger": "buttonClick", "to": "benchWindow", "action": "showHide", "options": { "hidden": false } },
    { "from": "dataMenu", "trigger": "featureSelect", "to": "map", "action": "flash" }
  ],

  "pages": [
    {
      "id": "command",
      "title": "Command",
      "type": "fixed",
      "header": {
        "kind": "row",
        "gap": 12,
        "style": { "alignItems": "center", "padding": "10px 16px" },
        "children": [
          { "kind": "widget", "widget": { "type": "text", "props": { "content": "DC Operations Center", "as": "h3" } } },
          { "kind": "widget", "widget": { "type": "page-nav", "props": { "style": "tabs" } } },
          { "kind": "widget", "widget": { "type": "text", "props": { "content": "", "style": { "flex": "1" } } } },
          { "kind": "widget", "widget": { "id": "themeSwitch", "type": "theme-switch", "props": { "presets": ["dark", "light", "hazard"] } } },
          { "kind": "widget", "widget": { "id": "langSwitch", "type": "lang-switch", "props": { "langs": ["en", "ar"] } } },
          { "kind": "widget", "widget": { "type": "share" } }
        ]
      },
      "root": {
        "kind": "row",
        "mode": "fixed",
        "style": { "height": "100%" },
        "children": [
          {
            "kind": "panel",
            "dock": "left",
            "width": 300,
            "minWidth": 240,
            "maxWidth": 560,
            "collapsible": true,
            "open": true,
            "children": [
              { "kind": "widget", "widget": { "id": "layers", "type": "layer-panel", "props": { "reorder": true, "contextMenu": ["table", "zoom", "filter", "symbology", "popup", "rename", "remove"] } } },
              { "kind": "widget", "widget": { "id": "basemaps", "type": "basemap", "props": { "manage": true } } },
              { "kind": "widget", "widget": { "id": "legend", "type": "legend" } }
            ]
          },
          {
            "kind": "section",
            "mode": "fixed",
            "style": { "flex": "1 1 0%", "minWidth": 0, "height": "100%" },
            "children": [
              { "kind": "widget", "widget": { "id": "map", "type": "map", "props": { "layerIds": ["dc-wards", "dc-zip-codes", "dc-parcels", "dc-bike-routes", "dc-crashes", "dc-affordable-housing"], "controls": { "navigation": true, "geolocate": true, "fullscreen": true, "scale": true, "position": "top-right" } } } },
              {
                "kind": "column",
                "mode": "flow",
                "style": { "position": "absolute", "top": "12px", "left": "12px", "gap": "8px", "zIndex": "5" },
                "children": [
                  { "kind": "widget", "widget": { "id": "measure", "type": "measure" } },
                  { "kind": "widget", "widget": { "id": "sketch", "type": "draw" } },
                  { "kind": "widget", "widget": { "id": "coords", "type": "coordinates" } },
                  { "kind": "widget", "widget": { "type": "search" } },
                  { "kind": "widget", "widget": { "type": "print" } }
                ]
              },
              { "kind": "widget", "widget": { "id": "featureInfo", "type": "feature-info", "dataSource": { "layerId": "dc-wards" } } },
              { "kind": "widget", "widget": { "id": "status", "type": "status-bar", "props": { "fields": ["coordinates", "zoom", "scale", "crs", "activeLayer"] } } }
            ]
          }
        ]
      }
    },

    {
      "id": "panels",
      "title": "Panels",
      "type": "fixed",
      "root": {
        "kind": "splitter",
        "orientation": "h",
        "sizes": [58, 42],
        "children": [
          {
            "kind": "section",
            "mode": "fixed",
            "style": { "height": "100%" },
            "children": [
              { "kind": "widget", "widget": { "type": "map", "props": { "layerIds": ["dc-wards", "dc-crashes", "dc-affordable-housing"] } } },
              { "kind": "widget", "widget": { "id": "cartoFloat", "type": "carto", "dataSource": { "layerId": "dc-crashes" }, "props": { "mode": "floating" } } }
            ]
          },
          {
            "kind": "column",
            "gap": 12,
            "style": { "padding": "12px", "overflow": "auto", "height": "100%" },
            "children": [
              { "kind": "widget", "widget": { "type": "filter", "dataSource": { "layerId": "dc-crashes" } } },
              { "kind": "widget", "widget": { "type": "date-filter", "dataSource": { "layerId": "dc-crashes", "fields": ["REPORTDATE"] } } },
              { "kind": "widget", "widget": { "type": "table", "dataSource": { "layerId": "dc-crashes" }, "props": { "paging": true, "export": ["csv", "geojson"] } } },
              { "kind": "widget", "widget": { "id": "dataMenu", "type": "data-actions", "dataSource": { "layerId": "dc-crashes" } } }
            ]
          }
        ]
      }
    },

    {
      "id": "dashboard",
      "title": "Dashboard",
      "type": "fixed",
      "root": {
        "kind": "row",
        "style": { "height": "100%" },
        "responsive": { "small": { "kind": "column" } },
        "children": [
          {
            "kind": "section",
            "mode": "fixed",
            "style": { "flex": "1 1 0%", "minWidth": 0, "height": "100%" },
            "children": [{ "kind": "widget", "widget": { "type": "map", "props": { "layerIds": ["dc-wards", "dc-crashes"] } } }]
          },
          {
            "kind": "column",
            "gap": 12,
            "animate": "fly",
            "animateOptions": { "stagger": 70 },
            "style": { "flex": "0 0 400px", "width": 400, "padding": "12px", "overflow": "auto" },
            "children": [
              {
                "kind": "grid",
                "columns": 3,
                "gap": 10,
                "children": [
                  { "kind": "widget", "widget": { "id": "kpiWards", "type": "kpi", "dataSource": { "sourceId": "wards" }, "props": { "label": "Wards", "stat": "count" } } },
                  { "kind": "widget", "widget": { "id": "kpiIncome", "type": "kpi", "dataSource": { "sourceId": "wards" }, "props": { "label": "Median income", "field": "MED_HH_INC", "stat": "avg", "unit": "$", "status": "ok" } } },
                  { "kind": "widget", "widget": { "id": "kpiCrashes", "type": "kpi", "dataSource": { "sourceId": "crashes" }, "props": { "label": "Crashes", "stat": "count", "status": "warn" } } }
                ]
              },
              { "kind": "widget", "widget": { "id": "gauge", "type": "gauge", "dataSource": { "sourceId": "wards" }, "props": { "label": "Employment rate", "field": "EMP_RATE", "min": 0, "max": 100 } } },
              { "kind": "widget", "widget": { "id": "wardChart", "type": "chart", "dataSource": { "sourceId": "wards" }, "props": { "kind": "bar", "category": "WARD", "value": "MED_HH_INC", "title": "Median income by ward" } } },
              { "kind": "widget", "widget": { "id": "severityChart", "type": "chart", "dataSource": { "sourceId": "crashes" }, "props": { "kind": "pie", "category": "SEVERITY", "title": "Crashes by severity" } } },
              { "kind": "widget", "widget": { "type": "sparkline", "dataSource": { "sourceId": "crashes" }, "props": { "field": "REPORTDATE" } } },
              { "kind": "widget", "widget": { "id": "wardTable", "type": "table", "dataSource": { "sourceId": "wards" }, "props": { "paging": true } } }
            ]
          }
        ]
      }
    },

    {
      "id": "query",
      "title": "Query & SQL",
      "type": "fixed",
      "root": {
        "kind": "splitter",
        "orientation": "h",
        "sizes": [40, 60],
        "children": [
          {
            "kind": "column",
            "gap": 12,
            "style": { "padding": "12px", "overflow": "auto", "height": "100%" },
            "children": [
              { "kind": "widget", "widget": { "type": "text", "props": { "content": "Advanced query builder", "as": "h3" } } },
              { "kind": "widget", "widget": { "id": "queryBuilder", "type": "query", "dataSource": { "layerId": "dc-crashes" }, "props": { "groups": true, "combinators": ["AND", "OR"], "output": "queryResult" } } },
              { "kind": "widget", "widget": { "id": "queryTable", "type": "table", "dataSource": { "fromWidget": "queryBuilder" }, "props": { "paging": true, "export": ["csv"] } } }
            ]
          },
          {
            "kind": "section",
            "mode": "fixed",
            "style": { "height": "100%" },
            "children": [
              { "kind": "widget", "widget": { "type": "map", "props": { "layerIds": ["dc-crashes", "dc-wards"] } } },
              { "kind": "widget", "widget": { "type": "legend", "props": { "mode": "floating" } } }
            ]
          }
        ]
      }
    },

    {
      "id": "time",
      "title": "Time",
      "type": "fixed",
      "root": {
        "kind": "column",
        "style": { "height": "100%" },
        "children": [
          {
            "kind": "section",
            "mode": "fixed",
            "style": { "flex": "1 1 0%", "minHeight": 0 },
            "children": [{ "kind": "widget", "widget": { "type": "map", "props": { "layerIds": ["dc-crashes", "dc-wards"] } } }]
          },
          {
            "kind": "column",
            "gap": 8,
            "style": { "flex": "0 0 auto", "padding": "12px", "borderTop": "1px solid var(--strata-border)" },
            "children": [
              { "kind": "widget", "widget": { "id": "timeSlider", "type": "date-filter", "dataSource": { "layerId": "dc-crashes", "fields": ["REPORTDATE"] }, "props": { "play": true, "mode": "window" } } },
              { "kind": "widget", "widget": { "type": "chart", "dataSource": { "sourceId": "crashes" }, "props": { "kind": "line", "category": "REPORTDATE", "title": "Crashes over time", "bands": true } } }
            ]
          }
        ]
      }
    },

    {
      "id": "analysis",
      "title": "Analysis",
      "type": "fixed",
      "root": {
        "kind": "splitter",
        "orientation": "h",
        "sizes": [34, 66],
        "children": [
          {
            "kind": "column",
            "gap": 12,
            "style": { "padding": "12px", "overflow": "auto", "height": "100%" },
            "children": [
              { "kind": "widget", "widget": { "type": "analysis", "dataSource": { "layerId": "dc-crashes" }, "props": { "ops": ["buffer", "hexbinDensity", "hotspot", "withinDistance"] } } },
              { "kind": "widget", "widget": { "type": "near-me", "dataSource": { "layerId": "dc-affordable-housing" } } },
              { "kind": "widget", "widget": { "type": "weighted-overlay", "props": { "layers": ["dc-wards", "dc-crashes"] } } },
              { "kind": "widget", "widget": { "type": "add-data" } }
            ]
          },
          {
            "kind": "section",
            "mode": "fixed",
            "style": { "height": "100%" },
            "children": [{ "kind": "widget", "widget": { "type": "map", "props": { "layerIds": ["dc-crashes", "dc-affordable-housing", "dc-wards"] } } }]
          }
        ]
      }
    },

    {
      "id": "layouts",
      "title": "Layouts & Compare",
      "type": "fixed",
      "root": {
        "kind": "views",
        "nav": "slides",
        "animate": "fly",
        "autoPlay": { "intervalMs": 9000, "loop": true },
        "views": [
          {
            "id": "swipe",
            "title": "Swipe compare",
            "content": { "kind": "widget", "widget": { "type": "swipe", "props": { "left": ["dc-wards"], "right": ["dc-crashes"] } } },
            "mapState": { "viewpoint": { "center": [-77.03, 38.9], "zoom": 11 }, "activeLayers": ["dc-wards"] }
          },
          {
            "id": "split",
            "title": "Split maps",
            "content": {
              "kind": "splitter",
              "orientation": "h",
              "sizes": [50, 50],
              "children": [
                { "kind": "widget", "widget": { "type": "map", "props": { "layerIds": ["dc-wards"] } } },
                { "kind": "widget", "widget": { "type": "map", "props": { "layerIds": ["dc-crashes"] } } }
              ]
            },
            "mapState": { "viewpoint": { "center": [-77.02, 38.91], "zoom": 12 } }
          },
          {
            "id": "bookmarks",
            "title": "Bookmarks tour",
            "content": { "kind": "widget", "widget": { "type": "bookmarks" } },
            "mapState": { "viewpoint": { "center": [-77.0, 38.89], "zoom": 12 }, "definitionExpression": { "dc-crashes": "SEVERITY = 'Fatal'" } }
          }
        ]
      }
    },

    {
      "id": "design",
      "title": "Design & Embed",
      "type": "scroll",
      "footer": {
        "kind": "row",
        "style": { "padding": "8px 16px", "justifyContent": "space-between" },
        "children": [
          { "kind": "widget", "widget": { "type": "text", "props": { "content": "tabaqat · Strata — coexistence with ArcGIS, not replacement. Data © District of Columbia (OCTO).", "style": { "opacity": "0.7" } } } },
          { "kind": "widget", "widget": { "type": "controller" } }
        ]
      },
      "root": {
        "kind": "column",
        "gap": 20,
        "animate": "scroll-reveal",
        "style": { "padding": "20px", "maxWidth": "1100px", "margin": "0 auto" },
        "children": [
          { "kind": "widget", "widget": { "type": "text", "props": { "content": "Design system & embedded objects", "as": "h2" } } },
          {
            "kind": "grid",
            "columns": 2,
            "gap": 16,
            "children": [
              { "kind": "widget", "widget": { "type": "card", "props": { "title": "Theme roles", "content": "primary · secondary · success · info · warning · danger — each with hover/active/contrast, a type scale, and a scoped state/motion stylesheet." } } },
              { "kind": "widget", "widget": { "type": "card", "props": { "title": "Bilingual", "content": "EN + AR with full RTL via lang-switch — the whole shell mirrors." } } },
              { "kind": "widget", "widget": { "id": "openBench", "type": "button", "props": { "label": "Open the Map Bench (MapViewer) ↗", "variant": "primary" } } },
              { "kind": "widget", "widget": { "type": "embed", "props": { "src": "https://opendata.dc.gov/", "title": "DC Open Data portal", "height": 260 } } }
            ]
          },
          { "kind": "widget", "widget": { "type": "video", "props": { "src": "https://www.youtube.com/embed/aircAruvnKk", "title": "How maps drive decisions" } } },
          { "kind": "widget", "widget": { "type": "gallery", "props": { "columns": 3, "items": [ { "title": "Ward 1", "content": "Median income $95k" }, { "title": "Ward 6", "content": "Median income $110k" }, { "title": "Ward 8", "content": "Median income $42k" } ] } } },
          { "kind": "widget", "widget": { "type": "divider" } },
          { "kind": "widget", "widget": { "type": "text", "props": { "content": "Studio", "as": "h3" } } },
          { "kind": "widget", "widget": { "type": "placeholder", "props": { "label": "StrataStudio — edit this AppLayout live (outline · preview · inspector), round-tripping the same JSON." } } },
          {
            "kind": "window",
            "id": "benchWindow",
            "title": "Map Bench — MapViewer (embeddable)",
            "modal": false,
            "open": false,
            "children": [
              { "kind": "widget", "widget": { "type": "embed", "props": { "src": "mapviewer", "note": "The mapviewer recipe embedded as a headerless, full-bleed control — every panel a click away against the same dc.json." } } }
            ]
          }
        ]
      }
    }
  ]
}
```


---

*Generated 2026-08-12 from 9 sections by build_design_context.py.*
