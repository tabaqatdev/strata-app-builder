/**
 * @strata/schema — the shared contract for strata-app-builder.
 *
 * Two interlocking shapes:
 *   1. `LayersJson`  — the map specification, aligned to the ESRI Web Map JSON spec.
 *   2. `CatalogRecord` — the single source of truth for a published layer (also feeds the open-data hub).
 *
 * Styling and popups are kept as GENUINE ESRI JSON (`drawingInfo` / `popupInfo`) so they round-trip
 * through ArcGIS tooling and are compiled to MapLibre by @strata/core-map's style compiler.
 */

/** A well-known ID spatial reference (EPSG). The whole stack is EPSG:4326. */
export interface SpatialReference {
  wkid: number;
  latestWkid?: number;
}

/** An ESRI extent envelope. */
export interface Extent {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference: SpatialReference;
}

/** How a layer's data is fetched. */
export type LayerSourceKind =
  | "arcgis-feature"
  | "arcgis-map"
  | "strata"
  | "geojson"
  | "tile"
  | "wms"
  | "imageserver"
  | "cog"
  /** Native MapLibre vector tiles (MVT): a `{z}/{x}/{y}.pbf` template or a TileJSON URL + `sourceLayer`. */
  | "vector-tile"
  /** PMTiles archive (offline/edge) via the optional `pmtiles` protocol; vector (`sourceLayer`) or raster. */
  | "pmtiles";
// NOTE: parquet / geoparquet / flatgeobuf / zarr are intentionally NOT source kinds — they are bulk/
// analytics formats reached via `/convert` → EPSG:4326 GeoParquet → Strata Serve (then served as an
// `arcgis-feature` layer). Reference them in `strata:extensions.catalog` until that path runs.

export interface LayerSource {
  kind: LayerSourceKind;
  /** For kind="strata": the dataset id served by the Strata Serve server. */
  dataset?: string;
  /** For kind="geojson": inline FeatureCollection or a URL. */
  data?: unknown;
  url?: string;
  /** For kind="imageserver": rendering rule / mosaic rule / band / format overrides (ESRI ImageServer). */
  renderingRule?: unknown;
  /** For kind="imageserver": a time-field/mosaic date filter driving the raster's time animation. */
  timeField?: string;
  /** For kind="vector-tile"/"pmtiles" (vector): the source-layer name inside the tiles. */
  sourceLayer?: string;
  /** For kind="pmtiles": whether the archive is `"vector"` (default) or `"raster"`. */
  tileKind?: "vector" | "raster";
}

/** ESRI field descriptor (matches the ArcGIS REST `fields[]` shape). */
export interface EsriField {
  name: string;
  type: string; // e.g. "esriFieldTypeString" | "esriFieldTypeDouble" | "esriFieldTypeOID"
  alias?: string;
}

/** ESRI layerDefinition subset we use. `drawingInfo.renderer` is genuine ESRI renderer JSON. */
export interface LayerDefinition {
  definitionExpression?: string;
  drawingInfo?: {
    renderer?: Record<string, unknown>; // ESRI renderer JSON (simple|uniqueValue|classBreaks|heatmap|...)
    labelingInfo?: unknown;
    transparency?: number;
  };
  fields?: EsriField[];
}

/** An operational layer in the map spec (ESRI Web Map `operationalLayers[]`). */
export interface OperationalLayer {
  id: string;
  title: string;
  url?: string;
  layerType:
    | "ArcGISFeatureLayer"
    | "ArcGISMapServiceLayer"
    | "GeoJSON"
    | "WebTiledLayer"
    | "WMS";
  source: LayerSource;
  visibility?: boolean;
  opacity?: number;
  /** Honest near-real-time: re-query the source on this interval. */
  refreshIntervalSeconds?: number;
  layerDefinition?: LayerDefinition;
  popupInfo?: Record<string, unknown>; // genuine ESRI popupInfo JSON
  attribution?: string;
  /** Reserved for the (deferred) conversational AI layer. */
  askable?: boolean;
}

/** A basemap layer (ESRI Web Map `baseMap.baseMapLayers[]`). */
export interface BaseMapLayer {
  id: string;
  layerType: "WebTiledLayer" | "VectorTileLayer" | "ArcGISTiledMapServiceLayer";
  templateUrl?: string;
  styleUrl?: string;
  copyright?: string;
}

export interface BaseMap {
  title: string;
  baseMapLayers: BaseMapLayer[];
}

/** Strata-proprietary extensions, namespaced so the doc round-trips through ArcGIS tooling. */
export interface StrataExtensions {
  charts?: SavedChart[];
  tables?: SavedTable[];
  /** Optional presentation hints (§4.4 of the spec). */
  layout?: LayoutHint;
}

export interface LayoutHint {
  preset?: "FullPage" | "MapInScroll" | "SplitDashboard" | "MultiMap";
  sticky?: boolean;
  sync?: boolean;
  surfaces?: Array<{
    widget: string;
    surface: "canvas" | "page";
    slot?: string;
    dock?: string;
  }>;
}

/** Expression-not-snapshot saved chart (re-materialized live when `source` is present). */
export interface SavedChart {
  id: string;
  title: string;
  kind: "bar" | "column" | "line" | "pie" | "scatter" | "gauge" | "histogram";
  source?: { layer_id: string; field?: string; value_field?: string | null; stat?: string };
  data?: Array<{ label: string; value: number }> | null;
}

/** Expression-not-snapshot saved table. */
export interface SavedTable {
  id: string;
  title: string;
  columns: string[];
  field_aliases?: Record<string, string>;
  source?: { layer_id: string; where?: string };
  rows?: Array<Record<string, unknown>> | null;
}

/** The map specification file — ESRI Web Map JSON aligned. Drives <StrataMap>. */
export interface LayersJson {
  version: string;
  spatialReference: SpatialReference;
  initialState: { viewpoint: { targetGeometry: Extent } };
  baseMap: BaseMap;
  operationalLayers: OperationalLayer[];
  "strata:extensions"?: StrataExtensions;
}

// ---------------------------------------------------------------------------
// App layout — the declarative layout engine (Part J.5).
//
// This is the *app layout*: a page/container/widget tree describing an Experience-Builder-class
// presentation. It is SEPARATE from the ESRI Web Map `LayersJson` (the map spec) and references it
// by `layerId`. `<StrataApp>` renders this tree via a widget registry.
// ---------------------------------------------------------------------------

/** A widget instance in the layout tree: a registry `type` plus its props and optional data binding. */
export interface WidgetSpec {
  /**
   * Stable id for this widget instance. Referenced by `AppLayout.connections` (as `from`/`to`) and by
   * another widget's `dataSource.fromWidget`. Optional, but required to be a connection/output endpoint.
   */
  id?: string;
  /** Registry key resolved against the widget registry (e.g. "map", "kpi", "chart"). */
  type: string;
  /** Arbitrary props forwarded to the resolved component. */
  props?: Record<string, unknown>;
  /** Optional data binding. Bind to a `LayersJson` operational layer, or to another widget's output. */
  dataSource?: {
    layerId?: string;
    where?: string;
    fields?: string[];
    /**
     * Consume another widget's **output data source** (the records it publishes — a
     * filtered/selected/aggregated set) instead of, or in addition to, a layer. See `AppLayout` and the
     * `@strata/actions` output registry. The value is the source widget's `id`.
     */
    fromWidget?: string;
    /**
     * Opt into the first-class DataSource model (`@strata/data-source`): the key of a `DataSource`
     * registered on the app's `DataSourceManager`. A source owns its own selection, filtered view, and
     * statistics, so any widget bound to the same `sourceId` links automatically (no `connections`).
     * Additive and back-compat: `layerId` / `fromWidget` still work and are auto-wrapped into sources.
     */
    sourceId?: string;
  };
}

/** Trigger types a widget can emit (mirrors `@strata/actions` `StrataTriggerType`). */
export type ConnectionTrigger =
  | "featureSelect"
  | "recordsChange"
  | "categorySelect"
  | "rangeSelect"
  | "brush"
  | "filterChange"
  | "extentChange"
  | "rowSelect"
  | "chartClick"
  | "hover"
  | "flash"
  | "search"
  | "clear"
  | (string & {});

/** Actions a connection can run on its target (mirrors `@strata/actions` `StrataActionType`). */
export type ConnectionAction =
  | "filter"
  | "zoomTo"
  | "panTo"
  | "flash"
  | "viewInTable"
  | "showStatistics"
  | "export"
  | "setUrlParam"
  | "showHide"
  | "message"
  | (string & {});

/**
 * A declarative cross-widget wire: "when `from` emits `trigger`, run `action` on `to`". `<StrataApp>` reads
 * `AppLayout.connections` and wires the action bus automatically at mount, so an app is interactive on the
 * first build without the user having to ask. This is the ExB message/action framework, authored as JSON.
 */
export interface Connection {
  /** Emitting widget id (matches a `WidgetSpec.id`). */
  from: string;
  /** The trigger to listen for. */
  trigger: ConnectionTrigger;
  /** Target widget id (omit for global actions like `setUrlParam` / `message`). */
  to?: string;
  /** The action to run on the target. */
  action: ConnectionAction;
  /** Action-specific options (e.g. `{ field, layerId, param, zoom }`). */
  options?: Record<string, unknown>;
}

/** Which breakpoint a `responsive` override applies to. */
export interface ResponsiveOverrides {
  small?: Partial<LayoutNode>;
  medium?: Partial<LayoutNode>;
  large?: Partial<LayoutNode>;
}

/** Optional entrance animation applied to a container's content. */
export type AnimateKind = "fade" | "slide" | "scroll-reveal" | "fly" | "zoom" | "rotate";

/** Fine-tuning for an entrance/transition animation. */
export interface AnimateOptions {
  /** Delay before the animation starts (ms). */
  delay?: number;
  /** Animation duration (ms, default 400). */
  duration?: number;
  /** CSS easing (default "ease"). */
  easing?: string;
  /** Direction the element flies/slides in FROM (for `fly`/`slide`). Default "up". */
  direction?: "up" | "down" | "left" | "right";
  /** Travel distance in px for `fly`/`slide` (default 16). */
  distance?: number;
  /** Per-child stagger (ms): on a container, each child's entrance is delayed by `index * stagger`. */
  stagger?: number;
  /** Exit animation kind (reserved for presence-aware containers; entrance still uses `animate`). */
  exit?: AnimateKind;
}

/** A container node — a flex/grid box that holds child layout nodes. */
export interface ContainerNode {
  kind: "row" | "column" | "grid" | "section" | "card" | "accordion" | "flow-row" | "splitter" | "window" | "panel";
  /** "flow" = normal flex/stack; "fixed" = position:relative so children can be absolutely placed. */
  mode?: "fixed" | "flow";
  children: LayoutNode[];
  /** For `kind:"splitter"`: split axis — `"h"` = side-by-side (vertical divider), `"v"` = stacked. Default `"h"`. */
  orientation?: "h" | "v";
  /** For `kind:"splitter"`: initial size percentages per child (should sum ~100). Defaults to an equal split. */
  sizes?: number[];
  /** For `kind:"splitter"`: minimum size percentage per child while dragging. Default 5. */
  minSizes?: number[];
  /**
   * Whether the user can resize this container. Default **true**.
   *  - `kind:"splitter"`: the divider(s) can be dragged.
   *  - `kind:"panel"`: a grip on the panel's inner edge drags it along its dock axis.
   * Set `false` to lock a size the design depends on.
   */
  resizable?: boolean;
  /** For `kind:"window"`: a stable id so a `showHide`/`navigate` action can open/close it. */
  id?: string;
  /** For `kind:"window"`: header title. */
  title?: string;
  /** For `kind:"window"`: render a modal backdrop (default true; `false` = a non-modal floating window). */
  modal?: boolean;
  /** For `kind:"window"`: open on first render (default false — opened later by a `showHide`/`navigate`).
   *  For `kind:"panel"`: expanded on first render (default true). */
  open?: boolean;
  /** For `kind:"panel"`: dock edge — `left`/`right`/`top`/`bottom`, or `"float"`. Default `"left"`. */
  dock?: "left" | "right" | "top" | "bottom" | "float";
  /** For `kind:"panel"`: show a collapse toggle in the header. Default true. */
  collapsible?: boolean;
  /** For `kind:"panel"`: starting size in px (width for left/right docks, height for top/bottom).
   *  The user can resize from here unless `resizable:false`; the drag is session state, so a reload
   *  returns to this authored value. */
  width?: number;
  /** For `kind:"panel"`: smallest size the user can drag to, in px (along the dock axis). Default 120. */
  minWidth?: number;
  /** For `kind:"panel"`: largest size the user can drag to, in px (along the dock axis). Default none. */
  maxWidth?: number;
  /** Column count for `kind:"grid"`. */
  columns?: number;
  /** Gap between children (px). */
  gap?: number;
  /** Per-child header titles for `kind:"accordion"` (index-aligned with `children`). */
  titles?: string[];
  /** Entrance animation for this container's content (fade/slide/scroll-reveal/fly/zoom/rotate). */
  animate?: AnimateKind;
  /** Fine-tune the entrance animation (delay/duration/easing/direction/distance). */
  animateOptions?: AnimateOptions;
  /** Extra inline style merged onto the container element. */
  style?: Record<string, string | number>;
  /** Per-breakpoint partial overrides merged into this node. */
  responsive?: ResponsiveOverrides;
}

/** A saved map-state applied when a view/slide becomes active (drives the store when one is provided). */
export interface MapState {
  /** `{ center:[lng,lat], zoom }` viewpoint. */
  viewpoint?: { center: [number, number]; zoom: number };
  /** Per-layer `definitionExpression` filters to apply. */
  definitionExpression?: Record<string, string>;
  /** Layer ids to make active / shown. */
  activeLayers?: string[];
}

/** One view/slide inside a `views` node: a layout plus an optional saved map-state. */
export interface ViewDef {
  id: string;
  title?: string;
  content: LayoutNode;
  /** Applied to the map (via the store) when this view is shown — the slides/exhibit driver. */
  mapState?: MapState;
}

/**
 * A Section + Views node — ExB's dynamic-content primitive. Swaps between `views` via tabs or a slide
 * stepper; each view can carry a saved `mapState`, so a slideshow/exhibit sets its own view + filters.
 */
export interface ViewsNode {
  kind: "views";
  views: ViewDef[];
  /** "tabs" = a tab bar; "slides" = a prev/next stepper (an exhibit). Default "tabs". */
  nav?: "tabs" | "slides";
  /** Transition between views. */
  animate?: AnimateKind;
  /** Fine-tune the transition (delay/duration/easing/direction/distance). */
  animateOptions?: AnimateOptions;
  /** Auto-advance the views on an interval (a self-running slideshow). `loop` wraps at the end (default true). */
  autoPlay?: { intervalMs: number; loop?: boolean };
  style?: Record<string, string | number>;
  responsive?: ResponsiveOverrides;
}

/** A leaf node — a single widget. */
export interface WidgetNode {
  kind: "widget";
  widget: WidgetSpec;
}

/** A node in the app layout tree: a container, a views/slides node, or a widget leaf. */
export type LayoutNode = ContainerNode | ViewsNode | WidgetNode;

/** A page of the app layout. */
export interface AppPage {
  id: string;
  title?: string;
  /** "fixed" = single-viewport layout; "scroll" = scrolling story page. */
  type?: "fixed" | "scroll";
  root: LayoutNode;
  /** Optional persistent header region rendered above the page body (app-shell). */
  header?: LayoutNode;
  /** Optional persistent footer region rendered below the page body (app-shell). */
  footer?: LayoutNode;
}

/**
 * A structured theme (Phase 6). `<StrataApp>` compiles it via `@strata/theme`'s `compileTheme` into
 * `--strata-*` custom properties **plus** a scoped stylesheet (hover/active/focus states + motion). Set one
 * hex per semantic role; the rest default. Structurally compatible with `@strata/theme`'s `Theme` (kept
 * here so `@strata/schema` stays dependency-free, mirroring how `Connection` is duplicated).
 */
export interface ThemeSpec {
  mode: "light" | "dark" | "auto";
  colors: {
    primary: string;
    secondary?: string;
    success?: string;
    info?: string;
    warning?: string;
    danger?: string;
    light?: string;
    dark?: string;
  };
  fonts?: { family?: string; mono?: string; scale?: "compact" | "default" | "spacious" };
  variables?: Record<string, string>;
  overrides?: Record<string, Record<string, string>>;
  /**
   * How the **map** follows the theme. On by default: switching light↔dark (via a `theme-switch`, or
   * via the OS preference under `mode:"auto"`) swaps the basemap to the paired one, so a light UI is
   * never left sitting on a dark map.
   *
   * The basemap authored in `layers.json` **wins on mount** — the swap happens on a *change* of mode,
   * never on first paint, so an authored choice is never silently discarded. An explicit pick in the
   * basemap drawer/panel also turns following off for the session.
   *
   *  - `follow:false` — pin the authored basemap; the theme never touches it.
   *  - `light`/`dark` — basemap ids to use for each mode instead of the paired defaults. Ids name
   *    entries of the built-in open library (`OPEN_BASEMAPS`), e.g. `"openfreemap-positron"`.
   */
  basemap?: { follow?: boolean; light?: string; dark?: string };
}

/** The declarative app layout rendered by `<StrataApp>`. References `LayersJson` by `layerId`. */
export interface AppLayout {
  version?: string;
  pages: AppPage[];
  /**
   * App theme. Either a flat `--strata-*` → value map (applied verbatim as custom properties) **or** a
   * structured {@link ThemeSpec} (compiled to vars + a scoped stylesheet). Both are additive/back-compat.
   */
  theme?: Record<string, string> | ThemeSpec;
  /**
   * Declarative cross-widget interactivity (the WIF pillar). Each entry wires a `from` widget's trigger to
   * an `action` on a `to` widget; `<StrataApp>` reads this and connects the action bus at mount. Populate it
   * so the app is *alive on the first build* — a chart brush filters the map + table, a category click
   * cross-filters every widget, a card click zooms and filters.
   */
  connections?: Connection[];
  /** A splash / intro overlay shown on first load (app-shell). `once` remembers dismissal (localStorage). */
  splash?: { title?: string; body?: string; dismissible?: boolean; once?: boolean };
}

// ---------------------------------------------------------------------------
// Catalog record — the single source of truth for a published layer.
// Renders into (a) a wt-server [[duckdb.datasources]] block and (b) a metadata bundle.
// ---------------------------------------------------------------------------

export interface CatalogRecord {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  geometry: "point" | "polyline" | "polygon" | "table";
  category?: string;
  tags?: string[];
  source: LayerSource;
  secured?: boolean;
  drawingInfo?: { renderer?: Record<string, unknown> };
  popupInfo?: Record<string, unknown>;
  fields?: EsriField[];
  attribution?: string;
  license?: string;
  /** How the dataset lands in the Strata Serve server. */
  publish?: {
    target: "strata";
    serviceName: string;
    folder?: string;
    layerId?: number;
    format: "geoparquet";
    /** disk path, https://… or s3://… */
    path?: string;
    sourceFormat?:
      | "filegdb"
      | "shapefile"
      | "geojson"
      | "esri-geojson"
      | "esri-json"
      | "csv"
      | "kml"
      | "geoparquet";
  };
  dcat?: {
    publisher?: string;
    accessLevel?: "public" | "restricted" | "private";
    issued?: string;
    modified?: string;
    spatial?: string;
    spatialReference?: SpatialReference;
  };
}
