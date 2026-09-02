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
| `map` | StrataMap | **`config`** = the `layers.json`; `controls?` (see below); `glyphs?`, `rtlTextPluginUrl?`, `themeMode?` (only when embedded outside a `<StrataApp>`), `askEnabled?` | reads `config`; `store`/`maplibregl` from context | the MapLibre map |
| `legend` | Legend | `layers?` (**omit it** — see below), `visibleOnly?` (def true), `includeUnstyled?` (def **true**), `title?`, `interactive?` (def **true**), `bus?`, `counts?` `{label:{n,total?}}`, `onFilterChange?` | **`store`** (injected) — the layer list is read from it live; filters via `store.setDefinition` | swatch+label legend that **filters**: click hides · shift‑click isolates · `Esc` clears. Rows show `n of N`. Emits `categorySelect` |
| `layer-panel` | LayerPanel | **`store`**, `mode?`, `floating?`, `initialX/Y?`, `defaultWidth?`, + callbacks (`onZoomTo`,`onFilter`,`onSymbology`,`onPopup`,`onShowTable`,`onAddLayer`,…) | store‑driven | operational‑layer list (visibility/reorder/actions), each row carrying the layer's **own symbology** — one swatch, or a class stack + `N ▸` that expands the full class list |
| `basemap` | BasemapPanel | `basemaps?` (def `OPEN_BASEMAPS`), `defaultId?`, `map?` (for live tile thumbnails), `themeMode?` (**read from the app when omitted** — adds a **Follow the theme** row), `onApplyBasemap?`, `onLibraryChange?`, `mode?`,`floating?`,… | **`store`** (injected) | basemap **radiogroup** — one always in force and always ticked, each row previewed by a live tile of the current area (raster) or the style's own ground/road/water read out of its style JSON (vector); clicking drives `store.setBaseMap`, restyling the store‑bound map |
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
> stating *off* / *N in view* / *none in this view*), basemaps as **round radios** with a live preview of
> the current area in each style plus a "Follow the theme" row. Keyboard `L`/`B`/`G`/`F`, `Esc` closes.
> `position` moves the cluster and its drawer together; geolocate/fullscreen take the opposite corner.
> Set `cluster:false` only to restore the older always‑open boxes.
>
> **The `legend` control is interactive by default** — click a class to hide it, shift‑click to isolate,
> `Esc` clears; it writes a real `definitionExpression` on the renderer's field via the store, so the
> legend **filters rather than fades**. Pass `counts` to render `n of N`. `interactive:false` for a
> static caption.
>
> **Do not author `legend.props.layers`.** With the prop omitted the legend reads the **store's** layers
> live, so hiding a layer in the layer panel or the map‑controls drawer drops it from the legend in the
> same frame. A hand‑written array is a snapshot of the spec that can never follow visibility — pass one
> only to list a deliberate subset. The legend also names **every visible layer**, including one whose
> symbology belongs to the service (no authored `drawingInfo`): it gets a neutral swatch and its title,
> because an omitted row reads as an absent layer. `includeUnstyled:false` restores the strict
> symbology‑key reading.

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
| `theme-switch` | ThemeSwitch | `themes?` (def all presets), `initial?` (def `"dark"` — **match it to `theme.mode`**), `onChange?` | theme‑preset switcher; reports the new mode to the app, so **the map's basemap follows the theme** (§6c) |
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

**Rules that bite (from real publishing):** a layer *you publish* always exposes `objectIdField` as `OBJECTID` — but on any service you did not publish, read `objectIdFieldName` instead of assuming it; use `esriSMSCircle/Square`, never `esriSMSPath`; polygon fills need low alpha (~40/255); basemaps default to a keyless OSM‑derived VECTOR style, OpenFreeMap Positron (never default to ESRI/Google/Mapbox — offer only on request; and never to CARTO's raster CDN or tile.openstreetmap.org, which answer 200 with a placeholder); reproject everything to 4326 on the way in.

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

### 6c. The map follows the theme (default — no config needed)

**Switching light↔dark swaps the basemap too.** A theme is not just CSS when there is a map on the page:
a light UI sitting on a dark basemap is the one mismatch a reader always notices. `<StrataApp>` resolves
the app's mode, shares it, and swaps the basemap to the paired one (`basemapForTheme` — CARTO
Dark Matter / Versatiles Eclipse for dark, OpenFreeMap Liberty for light). Three rules keep it honest:

- **The authored basemap wins on mount.** The swap fires on a *change* of mode, never on first paint, so
  a `layers.json` `baseMap` is never silently discarded. Set the `theme-switch`'s `initial` to the app's
  own `theme.mode` so the two agree at load.
- **An explicit pick outranks the theme.** Choosing a basemap in the drawer/panel clears
  `store.baseMapFollowsTheme`, and the theme stops choosing until the map spec is reloaded.
- **The swap is transient** — a theme toggle never enters the undo history or the saved map spec.

Opt out or pin the pair on `theme.basemap`:

```jsonc
"theme": {
  "mode": "dark",
  "colors": { "primary": "#4ea1ff" },
  "basemap": { "follow": true, "light": "openfreemap-positron", "dark": "openfreemap-dark" }
}
```

`follow:false` pins the authored basemap; `light`/`dark` name ids from the built-in open library
(`OPEN_BASEMAPS`). The same resolver (`basemapForThemeFrom`) drives the swap **and** the drawer's tick,
so the drawer always names the basemap that is actually drawn.

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
- Basemap keyless OSM‑derived, vector first (OpenFreeMap Positron); genuine ESRI JSON for symbology; everything EPSG:4326; `OBJECTID` is the OID.
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
