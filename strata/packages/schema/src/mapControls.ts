/**
 * Map controls — the typed, validated contract for the **standard Strata map controls**.
 *
 * Every Strata map ships one fixed control cluster, top-right, in this order:
 *
 *     zoom in · zoom out · home  |  layers · basemap · legend · fullscreen
 *
 * Apps **cannot** reorder, move or remove these. What an app *can* configure is:
 *  - the **optional tools** (all OFF by default): `search`, `locate`, `measure`, `draw`, `print`;
 *  - the optional **scale bar** (OFF by default; fixed bottom-left): `scale`;
 *  - the **basemap** choices: the initial basemap, up to 3 extra recommended basemaps, and the
 *    light/dark pair the map follows when the theme changes;
 *  - the **print title**.
 *
 * Author it on a map widget as `props.mapControls` (see {@link MapWidgetProps}). The old free-form
 * `props.controls` flags ({@link LegacyMapControls}) are still accepted but deprecated; they are mapped
 * by {@link legacyControlsToMapControls}.
 *
 * This module is dependency-free (it does not import the basemap catalog). Basemap ids are therefore
 * validated only as non-empty strings — legacy ids are resolved to current ones by the catalog's
 * aliases at render time.
 */

// ---------------------------------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------------------------------

/**
 * The fixed default control cluster, in render order. Always present on every Strata map; apps cannot
 * reorder, move or remove these. `"|"` in the docs marks the visual divider between `home` and `layers`.
 */
export const MAP_CONTROLS_CLUSTER = [
  "zoom-in",
  "zoom-out",
  "home",
  "layers",
  "basemap",
  "legend",
  "fullscreen",
] as const;

/** One control in the fixed default cluster. */
export type MapClusterControl = (typeof MAP_CONTROLS_CLUSTER)[number];

/** Where the fixed cluster is placed. Not configurable. */
export const MAP_CONTROLS_POSITION = "top-right" as const;

/** The optional tool keys an app may opt into. Any other key under `tools` is rejected. */
export const MAP_CONTROLS_TOOL_KEYS = ["search", "locate", "measure", "draw", "print"] as const;

/** One optional tool key. */
export type MapToolKey = (typeof MAP_CONTROLS_TOOL_KEYS)[number];

/** Maximum number of `basemap.recommendedExtras` an app may add to the universal Recommended set. */
export const MAX_RECOMMENDED_EXTRAS = 3;

/** Basemap the map uses in light mode when nothing else is configured. */
export const DEFAULT_LIGHT_BASEMAP = "osm";

/** Basemap the map uses in dark mode when nothing else is configured. */
export const DEFAULT_DARK_BASEMAP = "osm-dark";

/** Geocoder used by `tools.search` when no `provider` is given. */
export const DEFAULT_SEARCH_PROVIDER = "photon";

/** Units used by `tools.measure` when none are given. */
export const DEFAULT_MEASURE_UNITS = "metric";

/** Where the optional scale bar is placed. Not configurable. */
export const MAP_SCALE_POSITION = "bottom-left" as const;

/** The unit systems the scale bar can draw (`"both"` = metric over imperial). */
export const MAP_SCALE_UNITS = ["metric", "imperial", "both"] as const;

/** One scale-bar unit setting. */
export type MapScaleUnits = (typeof MAP_SCALE_UNITS)[number];

/** Units used by `scale` when it is `true` or `{}`. */
export const DEFAULT_SCALE_UNITS = "metric";

// ---------------------------------------------------------------------------------------------------
// Authoring types (what an app author writes)
// ---------------------------------------------------------------------------------------------------

/** Options for the optional **search** tool (a place/address search box). */
export interface MapSearchOptions {
  /**
   * Geocoding provider. `"photon"` (the default) is the keyless, OpenStreetMap-based Photon geocoder.
   * Any other string names a provider registered by the host app.
   */
  provider?: "photon" | (string & {});
  /** Placeholder text shown in the empty search box, e.g. `"Search places…"`. */
  placeholder?: string;
}

/** Options for the optional **measure** tool (distance / area). */
export interface MapMeasureOptions {
  /** Unit system for measurements. Default `"metric"`. */
  units?: "metric" | "imperial";
}

/** Options for the optional **draw** tool (sketch points/lines/polygons, export as GeoJSON). */
export interface MapDrawOptions {
  /** File name used when the user downloads their drawing, e.g. `"site-sketch.geojson"`. */
  filename?: string;
}

/** Options for the optional **print** tool (export the current view). */
export interface MapPrintOptions {
  /** Title printed on the page. Falls back to {@link MapControlsConfig.title}. */
  title?: string;
  /** File name used for the exported document, e.g. `"parcels-map.pdf"`. */
  filename?: string;
}

/**
 * Optional map tools. **All are OFF by default** — set a tool to `true` (or an options object) to add
 * it to the map. Unknown keys are rejected.
 */
export interface MapControlsTools {
  /** Place/address search box. `true` uses the keyless Photon geocoder. */
  search?: boolean | MapSearchOptions;
  /** "Show my location" (browser geolocation). */
  locate?: boolean;
  /** Distance/area measurement. `true` measures in metric units. */
  measure?: boolean | MapMeasureOptions;
  /** Sketch points/lines/polygons and download them as GeoJSON. */
  draw?: boolean | MapDrawOptions;
  /** Print/export the current map view. */
  print?: boolean | MapPrintOptions;
}

/** Options for the optional **scale bar** (bottom-left, fixed). */
export interface MapScaleOptions {
  /** `"metric"` (m / km, the default), `"imperial"` (ft / mi) or `"both"` (metric over imperial). */
  units?: MapScaleUnits;
}

/**
 * The light/dark basemap pair the map follows when the app theme changes. Overrides the app-level
 * `theme.basemap` (see `ThemeSpec.basemap`) for this map.
 */
export interface MapControlsBasemapTheme {
  /** Swap the basemap when the theme switches light↔dark. Default `true`. */
  follow?: boolean;
  /** Basemap id used in light mode. Default `"osm"`. */
  light?: string;
  /** Basemap id used in dark mode. Default `"osm-dark"`. */
  dark?: string;
}

/** Basemap configuration for the basemap control. */
export interface MapControlsBasemap {
  /**
   * Basemap id shown when the map first loads. When omitted, the basemap authored in `layers.json`
   * (or the theme's light/dark default) is used. Legacy ids are resolved by the basemap catalog.
   */
  initial?: string;
  /**
   * Up to **3** extra basemap ids appended to the universal "Recommended" list in the basemap picker
   * (e.g. a satellite or terrain map relevant to this app). More than 3 is rejected.
   */
  recommendedExtras?: string[];
  /** Light/dark basemap pair the map follows when the theme changes. */
  theme?: MapControlsBasemapTheme;
}

/**
 * Per-app configuration of the **standard Strata map controls**.
 *
 * The default cluster (zoom in · zoom out · home | layers · basemap · legend · fullscreen, top-right)
 * is always present and cannot be changed; this object only opts into optional tools and tunes the
 * basemap control. An empty object (or omitting it) gives the standard set with no extra tools.
 *
 * @example
 * { "tools": { "search": true, "measure": { "units": "imperial" } },
 *   "scale": { "units": "both" },
 *   "basemap": { "recommendedExtras": ["esri-imagery"] },
 *   "title": "Parcel Viewer" }
 */
export interface MapControlsConfig {
  /** Optional tools — all OFF by default. */
  tools?: MapControlsTools;
  /**
   * Optional **scale bar**, fixed bottom-left — OFF by default; enable it only for an app that needs
   * it. `true` = `{ units: "metric" }`; `{ units: "imperial" | "both" }` for feet/miles or both.
   */
  scale?: boolean | MapScaleOptions;
  /** Basemap control configuration (initial basemap, extra recommendations, theme pair). */
  basemap?: MapControlsBasemap;
  /** Default title for printed maps (used when `tools.print.title` is not set). */
  title?: string;
}

/**
 * The **legacy** free-form map-control flags (formerly `StrataMapControls` in `@strata/core-map`).
 *
 * @deprecated Use {@link MapControlsConfig} via `props.mapControls`. Mapping:
 * `navigation`/`basemapSwitcher`/`layerList`/`legend`/`fullscreen` → always on (ignored);
 * `measure` → `tools.measure`; `sketch` → `tools.draw`; `geolocate` → `tools.locate`;
 * `scale` → `mapControls.scale` (`true` = a metric scale bar, bottom-left);
 * `cluster`/`position` → ignored (the cluster is fixed, top-right). See {@link LEGACY_CONTROLS_MAPPING}.
 */
export interface LegacyMapControls {
  /** @deprecated Zoom buttons are always on. */
  navigation?: boolean;
  /** @deprecated Use `tools.locate`. */
  geolocate?: boolean;
  /** @deprecated Fullscreen is always on. */
  fullscreen?: boolean;
  /** @deprecated Use `mapControls.scale`. */
  scale?: boolean;
  /** @deprecated Use `tools.measure`. */
  measure?: boolean;
  /** @deprecated Use `tools.draw`. */
  sketch?: boolean;
  /** @deprecated The legend is always on. */
  legend?: boolean;
  /** @deprecated The basemap control is always on. */
  basemapSwitcher?: boolean;
  /** @deprecated The layers control is always on. */
  layerList?: boolean;
  /** @deprecated The cluster is always used. */
  cluster?: boolean;
  /** @deprecated The cluster is fixed top-right. */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * Props of a `{ type: "map" }` widget that the schema knows about. Other props are passed through to
 * the map component unchanged.
 */
export interface MapWidgetProps {
  /** Standard map controls configuration (optional tools + basemap control). */
  mapControls?: MapControlsConfig;
  /**
   * @deprecated Legacy free-form control flags. Still accepted; ignored when `mapControls` is set.
   * Use `mapControls` instead — see {@link legacyControlsToMapControls}.
   */
  controls?: LegacyMapControls;
  /** Operational layer ids (from `layers.json`) this map shows. */
  layerIds?: string[];
  [prop: string]: unknown;
}

// ---------------------------------------------------------------------------------------------------
// Normalized types (what renderers consume)
// ---------------------------------------------------------------------------------------------------

/** Fully-defaulted search options. */
export interface NormalizedSearchOptions {
  provider: string;
  placeholder?: string;
}

/** Fully-defaulted tool set: each tool is `false` (off) or its resolved options (on). */
export interface NormalizedMapTools {
  search: false | NormalizedSearchOptions;
  locate: boolean;
  measure: false | { units: "metric" | "imperial" };
  draw: false | { filename?: string };
  print: false | { title?: string; filename?: string };
}

/** Fully-defaulted map controls, as produced by {@link normalizeMapControls}. */
export interface NormalizedMapControls {
  /** The fixed cluster, in render order. */
  cluster: readonly MapClusterControl[];
  /** The fixed cluster position. */
  position: typeof MAP_CONTROLS_POSITION;
  tools: NormalizedMapTools;
  /** The optional scale bar: `false` (off, the default) or its resolved units (fixed bottom-left). */
  scale: false | { units: MapScaleUnits };
  basemap: {
    initial?: string;
    recommendedExtras: string[];
    theme: { follow: boolean; light: string; dark: string };
  };
  title?: string;
}

// ---------------------------------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------------------------------

/** One validation finding. `path` is a dotted path into the validated value. */
export interface SchemaIssue {
  path: string;
  message: string;
}

/** Result of a validation run. `valid` is `errors.length === 0`; warnings never fail validation. */
export interface ValidationResult {
  valid: boolean;
  errors: SchemaIssue[];
  warnings: SchemaIssue[];
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const typeName = (v: unknown): string => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

function checkKeys(obj: Record<string, unknown>, allowed: readonly string[], path: string, out: SchemaIssue[]) {
  for (const k of Object.keys(obj)) {
    if (!allowed.includes(k)) {
      out.push({ path: `${path}.${k}`, message: `unknown key '${k}' (allowed: ${allowed.join(", ")})` });
    }
  }
}

function checkOptionalString(obj: Record<string, unknown>, key: string, path: string, out: SchemaIssue[]) {
  if (!(key in obj) || obj[key] === undefined) return;
  const v = obj[key];
  if (typeof v !== "string") out.push({ path: `${path}.${key}`, message: `must be a string, got ${typeName(v)}` });
  else if (v.trim() === "") out.push({ path: `${path}.${key}`, message: "must be a non-empty string" });
}

function checkOptionalBoolean(obj: Record<string, unknown>, key: string, path: string, out: SchemaIssue[]) {
  if (!(key in obj) || obj[key] === undefined) return;
  if (typeof obj[key] !== "boolean") {
    out.push({ path: `${path}.${key}`, message: `must be a boolean, got ${typeName(obj[key])}` });
  }
}

/** Tool option shapes: allowed keys + per-key checker. */
const TOOL_OPTION_KEYS: Record<Exclude<MapToolKey, "locate">, readonly string[]> = {
  search: ["provider", "placeholder"],
  measure: ["units"],
  draw: ["filename"],
  print: ["title", "filename"],
};

function validateTool(key: MapToolKey, v: unknown, path: string, out: SchemaIssue[]) {
  if (v === undefined || typeof v === "boolean") return;
  if (key === "locate") {
    out.push({ path, message: `must be a boolean, got ${typeName(v)}` });
    return;
  }
  if (!isPlainObject(v)) {
    out.push({ path, message: `must be a boolean or an options object, got ${typeName(v)}` });
    return;
  }
  const allowed = TOOL_OPTION_KEYS[key];
  checkKeys(v, allowed, path, out);
  for (const k of allowed) {
    if (key === "measure" && k === "units") continue;
    checkOptionalString(v, k, path, out);
  }
  if (key === "measure" && v.units !== undefined && v.units !== "metric" && v.units !== "imperial") {
    out.push({ path: `${path}.units`, message: `must be "metric" or "imperial", got ${JSON.stringify(v.units)}` });
  }
}

/**
 * Validate a {@link MapControlsConfig}. Rejects: a non-object, unknown keys at any level (including
 * unknown tool keys), wrong value types, a `measure.units` other than metric/imperial, a `scale` that
 * is not a boolean or `{ units }` (units metric/imperial/both), more than
 * {@link MAX_RECOMMENDED_EXTRAS} `recommendedExtras`, and non-string/empty basemap ids. Duplicate
 * `recommendedExtras` are a warning.
 *
 * @param input The value to check (typically `widget.props.mapControls`).
 * @param path  Path prefix used in issue messages. Default `"mapControls"`.
 */
export function validateMapControls(input: unknown, path = "mapControls"): ValidationResult {
  const errors: SchemaIssue[] = [];
  const warnings: SchemaIssue[] = [];
  if (input === undefined) return { valid: true, errors, warnings };
  if (!isPlainObject(input)) {
    errors.push({ path, message: `must be an object, got ${typeName(input)}` });
    return { valid: false, errors, warnings };
  }
  checkKeys(input, ["tools", "scale", "basemap", "title"], path, errors);
  checkOptionalString(input, "title", path, errors);

  if (input.scale !== undefined && typeof input.scale !== "boolean") {
    const sp = `${path}.scale`;
    if (!isPlainObject(input.scale)) {
      errors.push({ path: sp, message: `must be a boolean or { units }, got ${typeName(input.scale)}` });
    } else {
      checkKeys(input.scale, ["units"], sp, errors);
      const u = input.scale.units;
      if (u !== undefined && !(MAP_SCALE_UNITS as readonly unknown[]).includes(u)) {
        errors.push({ path: `${sp}.units`, message: `must be ${MAP_SCALE_UNITS.map((x) => `"${x}"`).join(", ")}, got ${JSON.stringify(u)}` });
      }
    }
  }

  if (input.tools !== undefined) {
    const tp = `${path}.tools`;
    if (!isPlainObject(input.tools)) {
      errors.push({ path: tp, message: `must be an object, got ${typeName(input.tools)}` });
    } else {
      checkKeys(input.tools, MAP_CONTROLS_TOOL_KEYS, tp, errors);
      for (const key of MAP_CONTROLS_TOOL_KEYS) validateTool(key, input.tools[key], `${tp}.${key}`, errors);
    }
  }

  if (input.basemap !== undefined) {
    const bp = `${path}.basemap`;
    const b = input.basemap;
    if (!isPlainObject(b)) {
      errors.push({ path: bp, message: `must be an object, got ${typeName(b)}` });
    } else {
      checkKeys(b, ["initial", "recommendedExtras", "theme"], bp, errors);
      checkOptionalString(b, "initial", bp, errors);
      if (b.recommendedExtras !== undefined) {
        const rp = `${bp}.recommendedExtras`;
        const r = b.recommendedExtras;
        if (!Array.isArray(r)) {
          errors.push({ path: rp, message: `must be an array of basemap ids, got ${typeName(r)}` });
        } else {
          if (r.length > MAX_RECOMMENDED_EXTRAS) {
            errors.push({ path: rp, message: `at most ${MAX_RECOMMENDED_EXTRAS} basemap ids allowed, got ${r.length}` });
          }
          const seen = new Set<string>();
          r.forEach((id, i) => {
            if (typeof id !== "string") errors.push({ path: `${rp}.${i}`, message: `must be a string basemap id, got ${typeName(id)}` });
            else if (id.trim() === "") errors.push({ path: `${rp}.${i}`, message: "must be a non-empty string" });
            else if (seen.has(id)) warnings.push({ path: `${rp}.${i}`, message: `duplicate basemap id '${id}'` });
            else seen.add(id);
          });
        }
      }
      if (b.theme !== undefined) {
        const thp = `${bp}.theme`;
        if (!isPlainObject(b.theme)) {
          errors.push({ path: thp, message: `must be an object, got ${typeName(b.theme)}` });
        } else {
          checkKeys(b.theme, ["follow", "light", "dark"], thp, errors);
          checkOptionalBoolean(b.theme, "follow", thp, errors);
          checkOptionalString(b.theme, "light", thp, errors);
          checkOptionalString(b.theme, "dark", thp, errors);
        }
      }
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

/** Type guard: `true` when `input` is a valid {@link MapControlsConfig}. */
export function isMapControlsConfig(input: unknown): input is MapControlsConfig {
  return isPlainObject(input) && validateMapControls(input).valid;
}

const LEGACY_KEYS = [
  "navigation", "geolocate", "fullscreen", "scale", "measure", "sketch", "legend",
  "basemapSwitcher", "layerList", "cluster", "position",
] as const;
const LEGACY_POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"];

/**
 * Validate the deprecated {@link LegacyMapControls} flags. Wrong types are errors (they were never
 * valid); unknown keys, the deprecation itself, and flags that are dropped by the mapping
 * (a non-default `position`) are warnings, so existing apps keep validating.
 */
export function validateLegacyControls(input: unknown, path = "controls"): ValidationResult {
  const errors: SchemaIssue[] = [];
  const warnings: SchemaIssue[] = [];
  if (input === undefined) return { valid: true, errors, warnings };
  if (!isPlainObject(input)) {
    errors.push({ path, message: `must be an object, got ${typeName(input)}` });
    return { valid: false, errors, warnings };
  }
  warnings.push({ path, message: "'controls' is deprecated; use 'mapControls' (see legacyControlsToMapControls)" });
  for (const k of Object.keys(input)) {
    if (!(LEGACY_KEYS as readonly string[]).includes(k)) {
      warnings.push({ path: `${path}.${k}`, message: `unknown legacy control '${k}' (ignored)` });
    }
  }
  for (const k of LEGACY_KEYS) {
    if (k === "position") continue;
    checkOptionalBoolean(input, k, path, errors);
  }
  if (input.position !== undefined) {
    if (typeof input.position !== "string" || !LEGACY_POSITIONS.includes(input.position)) {
      errors.push({ path: `${path}.position`, message: `must be one of ${LEGACY_POSITIONS.join(", ")}` });
    } else if (input.position !== MAP_CONTROLS_POSITION) {
      warnings.push({ path: `${path}.position`, message: `ignored: the control cluster is fixed ${MAP_CONTROLS_POSITION}` });
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

// ---------------------------------------------------------------------------------------------------
// Legacy mapping
// ---------------------------------------------------------------------------------------------------

/**
 * How each legacy `controls` flag maps onto {@link MapControlsConfig}.
 *  - `"always-on"`: part of the fixed cluster; the flag is ignored.
 *  - `"ignored"`: layout knob that no longer applies.
 *  - a `tools.*` path: `true` turns that optional tool on.
 *  - `"scale"`: `true` turns on the optional scale bar (`mapControls.scale: true`, metric).
 */
export const LEGACY_CONTROLS_MAPPING: Readonly<Record<keyof LegacyMapControls, string>> = {
  navigation: "always-on",
  basemapSwitcher: "always-on",
  layerList: "always-on",
  legend: "always-on",
  fullscreen: "always-on",
  measure: "tools.measure",
  sketch: "tools.draw",
  geolocate: "tools.locate",
  scale: "scale",
  cluster: "ignored",
  position: "ignored",
};

/**
 * Convert deprecated {@link LegacyMapControls} flags to a {@link MapControlsConfig}. Only flags that
 * turn on an optional tool (`measure`, `sketch`, `geolocate`) or the scale bar (`scale` →
 * `scale: true`) produce output; everything else is always-on or ignored (see
 * {@link LEGACY_CONTROLS_MAPPING}). Non-object input yields `{}`.
 */
export function legacyControlsToMapControls(controls: LegacyMapControls | null | undefined): MapControlsConfig {
  if (!isPlainObject(controls)) return {};
  const tools: MapControlsTools = {};
  if (controls.measure === true) tools.measure = true;
  if (controls.sketch === true) tools.draw = true;
  if (controls.geolocate === true) tools.locate = true;
  const out: MapControlsConfig = {};
  if (Object.keys(tools).length) out.tools = tools;
  if (controls.scale === true) out.scale = true;
  return out;
}

// ---------------------------------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------------------------------

/** Options for {@link normalizeMapControls}. */
export interface NormalizeMapControlsOptions {
  /**
   * The app-level `theme.basemap` (from `ThemeSpec`). Used as the fallback for the light/dark pair and
   * `follow` when `mapControls.basemap.theme` does not set them. Precedence:
   * `mapControls.basemap.theme` > app `theme.basemap` > defaults (`osm` / `osm-dark`, follow `true`).
   */
  themeBasemap?: { follow?: boolean; light?: string; dark?: string };
}

const optObj = <T extends object>(v: unknown): T => (isPlainObject(v) ? (v as T) : ({} as T));
const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() !== "" ? v : undefined);

/**
 * Produce a fully-defaulted {@link NormalizedMapControls}: every tool resolved to `false` or its
 * options (search provider `"photon"`, measure units `"metric"`, print title falling back to `title`),
 * the scale bar `false` unless enabled (`true` / `{}` → `{ units: "metric" }`),
 * basemap theme `light:"osm"`, `dark:"osm-dark"`, `follow:true`, and `recommendedExtras` capped at 3.
 *
 * Normalization is lenient: invalid values are replaced by defaults rather than throwing. Call
 * {@link validateMapControls} first to report problems to the author.
 */
export function normalizeMapControls(
  input?: MapControlsConfig | null,
  options: NormalizeMapControlsOptions = {},
): NormalizedMapControls {
  const cfg = optObj<MapControlsConfig>(input);
  const t = optObj<MapControlsTools>(cfg.tools);
  const title = str(cfg.title);

  const on = (v: unknown) => v === true || isPlainObject(v);

  const searchOpts = optObj<MapSearchOptions>(t.search);
  const search: NormalizedMapTools["search"] = on(t.search)
    ? {
        provider: str(searchOpts.provider) ?? DEFAULT_SEARCH_PROVIDER,
        ...(str(searchOpts.placeholder) ? { placeholder: searchOpts.placeholder } : {}),
      }
    : false;

  const measureOpts = optObj<MapMeasureOptions>(t.measure);
  const measure: NormalizedMapTools["measure"] = on(t.measure)
    ? { units: measureOpts.units === "imperial" ? "imperial" : DEFAULT_MEASURE_UNITS }
    : false;

  const drawOpts = optObj<MapDrawOptions>(t.draw);
  const draw: NormalizedMapTools["draw"] = on(t.draw)
    ? str(drawOpts.filename) ? { filename: drawOpts.filename } : {}
    : false;

  const printOpts = optObj<MapPrintOptions>(t.print);
  const printTitle = str(printOpts.title) ?? title;
  const print: NormalizedMapTools["print"] = on(t.print)
    ? {
        ...(printTitle ? { title: printTitle } : {}),
        ...(str(printOpts.filename) ? { filename: printOpts.filename } : {}),
      }
    : false;

  const scaleOpts = optObj<MapScaleOptions>(cfg.scale);
  const scale: NormalizedMapControls["scale"] = on(cfg.scale)
    ? { units: (MAP_SCALE_UNITS as readonly unknown[]).includes(scaleOpts.units) ? (scaleOpts.units as MapScaleUnits) : DEFAULT_SCALE_UNITS }
    : false;

  const b = optObj<MapControlsBasemap>(cfg.basemap);
  const bt = optObj<MapControlsBasemapTheme>(b.theme);
  const app = optObj<NonNullable<NormalizeMapControlsOptions["themeBasemap"]>>(options.themeBasemap);
  const extras = Array.isArray(b.recommendedExtras)
    ? [...new Set(b.recommendedExtras.filter((id): id is string => !!str(id)))].slice(0, MAX_RECOMMENDED_EXTRAS)
    : [];
  const initial = str(b.initial);

  return {
    cluster: MAP_CONTROLS_CLUSTER,
    position: MAP_CONTROLS_POSITION,
    tools: { search, locate: t.locate === true, measure, draw, print },
    scale,
    basemap: {
      ...(initial ? { initial } : {}),
      recommendedExtras: extras,
      theme: {
        follow: typeof bt.follow === "boolean" ? bt.follow : typeof app.follow === "boolean" ? app.follow : true,
        light: str(bt.light) ?? str(app.light) ?? DEFAULT_LIGHT_BASEMAP,
        dark: str(bt.dark) ?? str(app.dark) ?? DEFAULT_DARK_BASEMAP,
      },
    },
    ...(title ? { title } : {}),
  };
}

/**
 * Resolve a map widget's effective controls: `props.mapControls` when present, otherwise the legacy
 * `props.controls` mapped via {@link legacyControlsToMapControls}, otherwise the defaults — always
 * returned fully normalized.
 */
export function resolveMapWidgetControls(
  props: MapWidgetProps | Record<string, unknown> | null | undefined,
  options: NormalizeMapControlsOptions = {},
): NormalizedMapControls {
  const p = optObj<MapWidgetProps>(props);
  if (p.mapControls !== undefined) return normalizeMapControls(p.mapControls, options);
  return normalizeMapControls(legacyControlsToMapControls(p.controls), options);
}

// ---------------------------------------------------------------------------------------------------
// App-layout validation
// ---------------------------------------------------------------------------------------------------

function* walk(node: unknown, path: string): Generator<[Record<string, unknown>, string]> {
  if (!isPlainObject(node)) return;
  yield [node, path];
  if (node.kind === "views" && Array.isArray(node.views)) {
    for (let i = 0; i < node.views.length; i++) {
      const v = node.views[i];
      if (isPlainObject(v)) yield* walk(v.content, `${path}.views.${i}.content`);
    }
  } else if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) yield* walk(node.children[i], `${path}.children.${i}`);
  }
}

/**
 * Validate an `AppLayout`. Checks that `pages` is a non-empty array of pages with an `id` and a
 * `root`, and validates every `{ type: "map" }` widget's `props.mapControls` (errors) and deprecated
 * `props.controls` (warnings, plus errors for wrong types). Other widget props are not checked.
 */
export function validateAppLayout(app: unknown): ValidationResult {
  const errors: SchemaIssue[] = [];
  const warnings: SchemaIssue[] = [];
  if (!isPlainObject(app)) {
    errors.push({ path: "", message: `app layout must be an object, got ${typeName(app)}` });
    return { valid: false, errors, warnings };
  }
  if (!Array.isArray(app.pages) || app.pages.length === 0) {
    errors.push({ path: "pages", message: "must be a non-empty array" });
    return { valid: false, errors, warnings };
  }
  app.pages.forEach((page, i) => {
    const pp = `pages.${i}`;
    if (!isPlainObject(page)) {
      errors.push({ path: pp, message: `must be an object, got ${typeName(page)}` });
      return;
    }
    if (typeof page.id !== "string") errors.push({ path: `${pp}.id`, message: "must be a string" });
    if (!isPlainObject(page.root)) errors.push({ path: `${pp}.root`, message: "must be a layout node" });
    for (const part of ["root", "header", "footer"] as const) {
      for (const [node, np] of walk(page[part], `${pp}.${part}`)) {
        if (node.kind !== "widget" || !isPlainObject(node.widget) || node.widget.type !== "map") continue;
        const props = node.widget.props;
        if (!isPlainObject(props)) continue;
        const wp = `${np}.widget.props`;
        const m = validateMapControls(props.mapControls, `${wp}.mapControls`);
        const l = validateLegacyControls(props.controls, `${wp}.controls`);
        errors.push(...m.errors, ...l.errors);
        warnings.push(...m.warnings, ...l.warnings);
        if (props.mapControls !== undefined && props.controls !== undefined) {
          warnings.push({ path: `${wp}.controls`, message: "ignored because 'mapControls' is set" });
        }
      }
    }
  });
  return { valid: errors.length === 0, errors, warnings };
}
