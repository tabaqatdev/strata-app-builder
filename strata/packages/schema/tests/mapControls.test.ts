import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_DARK_BASEMAP,
  DEFAULT_LIGHT_BASEMAP,
  DEFAULT_SCALE_UNITS,
  LEGACY_CONTROLS_MAPPING,
  MAP_SCALE_POSITION,
  MAP_SCALE_UNITS,
  MAP_CONTROLS_CLUSTER,
  MAP_CONTROLS_POSITION,
  isMapControlsConfig,
  legacyControlsToMapControls,
  normalizeMapControls,
  resolveMapWidgetControls,
  validateAppLayout,
  validateLegacyControls,
  validateMapControls,
  type AppLayout,
  type MapControlsConfig,
  type MapWidgetSpec,
  type WidgetSpec,
} from "../src/index.js";

const ALL_OFF = { search: false, locate: false, measure: false, draw: false, print: false };

function appWithMap(props: Record<string, unknown>): AppLayout {
  return {
    pages: [
      {
        id: "p1",
        root: {
          kind: "row",
          children: [
            { kind: "widget", widget: { type: "kpi" } },
            {
              kind: "views",
              views: [{ id: "v1", content: { kind: "widget", widget: { id: "map", type: "map", props } } }],
            },
          ],
        },
      },
    ],
  };
}

describe("normalizeMapControls — defaults", () => {
  it("gives the fixed cluster, all tools off and the osm / osm-dark theme pair for no input", () => {
    for (const input of [undefined, null, {}]) {
      const n = normalizeMapControls(input as MapControlsConfig | undefined);
      expect(n.cluster).toEqual(["zoom-in", "zoom-out", "home", "layers", "basemap", "legend", "fullscreen"]);
      expect(n.position).toBe("top-right");
      expect(n.tools).toEqual(ALL_OFF);
      expect(n.scale).toBe(false);
      expect(n.basemap).toEqual({ recommendedExtras: [], theme: { follow: true, light: "osm", dark: "osm-dark" } });
      expect(n.title).toBeUndefined();
    }
    expect(DEFAULT_LIGHT_BASEMAP).toBe("osm");
    expect(DEFAULT_DARK_BASEMAP).toBe("osm-dark");
    expect(MAP_CONTROLS_CLUSTER).toHaveLength(7);
    expect(MAP_CONTROLS_POSITION).toBe("top-right");
  });

  it("resolves `true` tools to their default options", () => {
    const n = normalizeMapControls({ tools: { search: true, locate: true, measure: true, draw: true, print: true } });
    expect(n.tools).toEqual({
      search: { provider: "photon" },
      locate: true,
      measure: { units: "metric" },
      draw: {},
      print: {},
    });
  });

  it("keeps explicit options, and print.title falls back to the top-level title", () => {
    const n = normalizeMapControls({
      title: "Parcels",
      tools: {
        search: { provider: "nominatim", placeholder: "Find…" },
        measure: { units: "imperial" },
        draw: { filename: "sketch.geojson" },
        print: { filename: "out.pdf" },
      },
    });
    expect(n.title).toBe("Parcels");
    expect(n.tools.search).toEqual({ provider: "nominatim", placeholder: "Find…" });
    expect(n.tools.measure).toEqual({ units: "imperial" });
    expect(n.tools.draw).toEqual({ filename: "sketch.geojson" });
    expect(n.tools.print).toEqual({ title: "Parcels", filename: "out.pdf" });
    expect(normalizeMapControls({ title: "A", tools: { print: { title: "B" } } }).tools.print).toEqual({ title: "B" });
  });

  it("the scale bar: off by default; true / {} = metric; explicit units kept; bad units → metric", () => {
    expect(normalizeMapControls({}).scale).toBe(false);
    expect(normalizeMapControls({ scale: false }).scale).toBe(false);
    expect(normalizeMapControls({ scale: true }).scale).toEqual({ units: "metric" });
    expect(normalizeMapControls({ scale: {} }).scale).toEqual({ units: "metric" });
    expect(normalizeMapControls({ scale: { units: "imperial" } }).scale).toEqual({ units: "imperial" });
    expect(normalizeMapControls({ scale: { units: "both" } }).scale).toEqual({ units: "both" });
    expect(normalizeMapControls({ scale: { units: "nautical" as "metric" } }).scale).toEqual({ units: "metric" });
    expect(normalizeMapControls({ scale: "yes" as unknown as boolean }).scale).toBe(false);
    expect(DEFAULT_SCALE_UNITS).toBe("metric");
    expect(MAP_SCALE_UNITS).toEqual(["metric", "imperial", "both"]);
    expect(MAP_SCALE_POSITION).toBe("bottom-left");
  });

  it("treats `false` tools as off", () => {
    expect(normalizeMapControls({ tools: { search: false, measure: false } }).tools).toEqual(ALL_OFF);
  });

  it("normalizes the basemap block", () => {
    const n = normalizeMapControls({
      basemap: { initial: "esri-imagery", recommendedExtras: ["a", "b"], theme: { follow: false, light: "x", dark: "y" } },
    });
    expect(n.basemap).toEqual({
      initial: "esri-imagery",
      recommendedExtras: ["a", "b"],
      theme: { follow: false, light: "x", dark: "y" },
    });
  });

  it("is lenient: dedupes and caps recommendedExtras at 3, drops invalid values", () => {
    const n = normalizeMapControls({
      basemap: { recommendedExtras: ["a", "a", "b", "", "c", "d"] as string[], initial: "" },
      tools: { measure: { units: "furlongs" as "metric" } },
    });
    expect(n.basemap.recommendedExtras).toEqual(["a", "b", "c"]);
    expect(n.basemap.initial).toBeUndefined();
    expect(n.tools.measure).toEqual({ units: "metric" });
  });

  it("falls back to the app theme.basemap, which mapControls.basemap.theme overrides", () => {
    const themeBasemap = { follow: false, light: "openfreemap-positron", dark: "openfreemap-dark" };
    expect(normalizeMapControls({}, { themeBasemap }).basemap.theme).toEqual(themeBasemap);
    expect(
      normalizeMapControls({ basemap: { theme: { light: "osm" } } }, { themeBasemap }).basemap.theme,
    ).toEqual({ follow: false, light: "osm", dark: "openfreemap-dark" });
  });
});

describe("validateMapControls — accepts", () => {
  it.each<[string, unknown]>([
    ["undefined", undefined],
    ["empty", {}],
    ["all tools true", { tools: { search: true, locate: true, measure: true, draw: true, print: true } }],
    ["all tools false", { tools: { search: false, locate: false, measure: false, draw: false, print: false } }],
    [
      "full config",
      {
        title: "T",
        tools: {
          search: { provider: "photon", placeholder: "p" },
          measure: { units: "imperial" },
          draw: { filename: "d.geojson" },
          print: { title: "x", filename: "y.pdf" },
        },
        basemap: { initial: "osm", recommendedExtras: ["a", "b", "c"], theme: { follow: true, light: "osm", dark: "osm-dark" } },
      },
    ],
    ["unknown-but-string basemap ids", { basemap: { initial: "legacy-carto-positron", recommendedExtras: ["whatever"] } }],
    ["scale true", { scale: true }],
    ["scale false", { scale: false }],
    ["scale {}", { scale: {} }],
    ["scale metric", { scale: { units: "metric" } }],
    ["scale imperial", { scale: { units: "imperial" } }],
    ["scale both", { scale: { units: "both" } }],
  ])("%s", (_name, input) => {
    const r = validateMapControls(input);
    expect(r.errors).toEqual([]);
    expect(r.valid).toBe(true);
  });

  it("isMapControlsConfig is a matching type guard", () => {
    expect(isMapControlsConfig({ tools: { locate: true } })).toBe(true);
    expect(isMapControlsConfig({ tools: { zoom: true } })).toBe(false);
    expect(isMapControlsConfig(null)).toBe(false);
  });
});

describe("validateMapControls — rejects", () => {
  const cases: Array<[string, unknown, string]> = [
    ["non-object config", "yes", "mapControls"],
    ["array config", [], "mapControls"],
    ["unknown top-level key", { controls: {} }, "mapControls.controls"],
    ["non-string title", { title: 5 }, "mapControls.title"],
    ["tools not an object", { tools: true }, "mapControls.tools"],
    ["unknown tool key", { tools: { zoom: true } }, "mapControls.tools.zoom"],
    ["default-cluster key as a tool", { tools: { fullscreen: false } }, "mapControls.tools.fullscreen"],
    ["tool wrong type (string)", { tools: { search: "photon" } }, "mapControls.tools.search"],
    ["tool wrong type (number)", { tools: { print: 1 } }, "mapControls.tools.print"],
    ["locate with options object", { tools: { locate: { high: true } } }, "mapControls.tools.locate"],
    ["unknown tool option", { tools: { search: { engine: "x" } } }, "mapControls.tools.search.engine"],
    ["non-string search provider", { tools: { search: { provider: 3 } } }, "mapControls.tools.search.provider"],
    ["empty search provider", { tools: { search: { provider: " " } } }, "mapControls.tools.search.provider"],
    ["bad measure units", { tools: { measure: { units: "nautical" } } }, "mapControls.tools.measure.units"],
    ["non-string draw filename", { tools: { draw: { filename: true } } }, "mapControls.tools.draw.filename"],
    ["non-string print title", { tools: { print: { title: [] } } }, "mapControls.tools.print.title"],
    ["basemap not an object", { basemap: "osm" }, "mapControls.basemap"],
    ["unknown basemap key", { basemap: { default: "osm" } }, "mapControls.basemap.default"],
    ["non-string initial id", { basemap: { initial: 7 } }, "mapControls.basemap.initial"],
    ["recommendedExtras not an array", { basemap: { recommendedExtras: "a" } }, "mapControls.basemap.recommendedExtras"],
    [">3 recommendedExtras", { basemap: { recommendedExtras: ["a", "b", "c", "d"] } }, "mapControls.basemap.recommendedExtras"],
    ["non-string recommended id", { basemap: { recommendedExtras: ["a", 2] } }, "mapControls.basemap.recommendedExtras.1"],
    ["empty recommended id", { basemap: { recommendedExtras: [""] } }, "mapControls.basemap.recommendedExtras.0"],
    ["theme not an object", { basemap: { theme: true } }, "mapControls.basemap.theme"],
    ["unknown theme key", { basemap: { theme: { auto: true } } }, "mapControls.basemap.theme.auto"],
    ["non-boolean follow", { basemap: { theme: { follow: "yes" } } }, "mapControls.basemap.theme.follow"],
    ["non-string light id", { basemap: { theme: { light: 1 } } }, "mapControls.basemap.theme.light"],
    ["non-string dark id", { basemap: { theme: { dark: null } } }, "mapControls.basemap.theme.dark"],
    ["scale as a string", { scale: "metric" }, "mapControls.scale"],
    ["scale null", { scale: null }, "mapControls.scale"],
    ["scale as an array", { scale: ["metric"] }, "mapControls.scale"],
    ["bad scale units", { scale: { units: "nautical" } }, "mapControls.scale.units"],
    ["unknown scale key (position is fixed)", { scale: { position: "top-left" } }, "mapControls.scale.position"],
    ["scale under tools", { tools: { scale: true } }, "mapControls.tools.scale"],
  ];
  it.each(cases)("%s", (_name, input, path) => {
    const r = validateMapControls(input);
    expect(r.valid).toBe(false);
    expect(r.errors.map((e) => e.path)).toContain(path);
  });

  it("warns (does not fail) on duplicate recommendedExtras", () => {
    const r = validateMapControls({ basemap: { recommendedExtras: ["a", "a"] } });
    expect(r.valid).toBe(true);
    expect(r.warnings.map((w) => w.path)).toEqual(["mapControls.basemap.recommendedExtras.1"]);
  });

  it("uses the supplied path prefix", () => {
    expect(validateMapControls({ tools: { x: 1 } }, "props.mapControls").errors[0].path).toBe("props.mapControls.tools.x");
  });
});

describe("legacy controls", () => {
  it("documents a mapping for every legacy flag", () => {
    expect(LEGACY_CONTROLS_MAPPING).toEqual({
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
    });
  });

  it("maps measure/sketch/geolocate onto tools, scale onto the scale bar, and drops the rest", () => {
    expect(legacyControlsToMapControls({ measure: true, sketch: true, geolocate: true })).toEqual({
      tools: { measure: true, draw: true, locate: true },
    });
    expect(legacyControlsToMapControls({ scale: true })).toEqual({ scale: true });
    expect(legacyControlsToMapControls({ measure: true, scale: true })).toEqual({ tools: { measure: true }, scale: true });
    expect(
      legacyControlsToMapControls({
        navigation: true, fullscreen: true, legend: true, basemapSwitcher: true, layerList: true,
        scale: false, cluster: false, position: "top-left", measure: false,
      }),
    ).toEqual({});
    expect(legacyControlsToMapControls(undefined)).toEqual({});
    expect(legacyControlsToMapControls(null)).toEqual({});
  });

  it("legacy-mapped output is itself valid", () => {
    const out = legacyControlsToMapControls({ measure: true, sketch: true, geolocate: true, scale: true });
    expect(validateMapControls(out).valid).toBe(true);
  });

  it("validateLegacyControls: deprecation + dropped flags are warnings, wrong types are errors", () => {
    const ok = validateLegacyControls({ navigation: true, scale: true, position: "top-left", foo: 1 });
    expect(ok.valid).toBe(true);
    const wp = ok.warnings.map((w) => w.path);
    expect(wp).toEqual(expect.arrayContaining(["controls", "controls.position", "controls.foo"]));
    // `scale` is no longer dropped — it maps to mapControls.scale, so it draws no "dropped" warning
    expect(wp).not.toContain("controls.scale");

    const bad = validateLegacyControls({ measure: "yes", position: "middle" });
    expect(bad.valid).toBe(false);
    expect(bad.errors.map((e) => e.path)).toEqual(["controls.measure", "controls.position"]);
    expect(validateLegacyControls(42).valid).toBe(false);
  });

  it("resolveMapWidgetControls prefers mapControls, then legacy controls, then defaults", () => {
    expect(resolveMapWidgetControls({ controls: { measure: true } }).tools.measure).toEqual({ units: "metric" });
    expect(
      resolveMapWidgetControls({ controls: { measure: true }, mapControls: { tools: { locate: true } } }).tools,
    ).toEqual({ ...ALL_OFF, locate: true });
    expect(resolveMapWidgetControls(undefined)).toEqual(normalizeMapControls());
    expect(resolveMapWidgetControls({ controls: { scale: true } }).scale).toEqual({ units: "metric" });
    expect(resolveMapWidgetControls({ controls: { scale: true }, mapControls: {} }).scale).toBe(false);
    expect(resolveMapWidgetControls({ mapControls: { scale: { units: "both" } } }).scale).toEqual({ units: "both" });
  });
});

describe("round-trip", () => {
  const configs: MapControlsConfig[] = [
    {},
    { tools: { search: { provider: "photon", placeholder: "Find" }, locate: true, measure: { units: "imperial" } } },
    { scale: true },
    { scale: { units: "both" }, tools: { measure: true } },
    { title: "T", tools: { draw: { filename: "a.geojson" }, print: { title: "P", filename: "p.pdf" } },
      basemap: { initial: "osm", recommendedExtras: ["a", "b", "c"], theme: { follow: false, light: "l", dark: "d" } } },
  ];
  it.each(configs.map((c, i) => [i, c] as const))("config %i survives JSON and normalization is idempotent", (_i, cfg) => {
    const parsed = JSON.parse(JSON.stringify(cfg));
    expect(parsed).toEqual(cfg);
    expect(validateMapControls(parsed).valid).toBe(true);
    const n = normalizeMapControls(parsed);
    // A normalized config, re-expressed as authoring input, normalizes to itself.
    const { cluster: _c, position: _p, ...asInput } = JSON.parse(JSON.stringify(n));
    expect(validateMapControls(asInput).valid).toBe(true);
    expect(normalizeMapControls(asInput)).toEqual(n);
  });
});

describe("validateAppLayout", () => {
  it("validates map widgets anywhere in the tree (incl. views)", () => {
    expect(validateAppLayout(appWithMap({ mapControls: { tools: { search: true } } })).valid).toBe(true);
    const r = validateAppLayout(appWithMap({ mapControls: { tools: { compass: true } } }));
    expect(r.valid).toBe(false);
    expect(r.errors[0].path).toBe("pages.0.root.children.1.views.0.content.widget.props.mapControls.tools.compass");
  });

  it("accepts legacy controls with a deprecation warning, and warns when both are set", () => {
    const legacy = validateAppLayout(appWithMap({ controls: { navigation: true, legend: true } }));
    expect(legacy.valid).toBe(true);
    expect(legacy.warnings.some((w) => /deprecated/.test(w.message))).toBe(true);
    const both = validateAppLayout(appWithMap({ controls: { navigation: true }, mapControls: {} }));
    expect(both.valid).toBe(true);
    expect(both.warnings.some((w) => /ignored because 'mapControls'/.test(w.message))).toBe(true);
  });

  it("ignores controls props on non-map widgets", () => {
    const app: AppLayout = { pages: [{ id: "p", root: { kind: "widget", widget: { type: "kpi", props: { mapControls: 5 } } } }] };
    expect(validateAppLayout(app).valid).toBe(true);
  });

  it("rejects structurally broken layouts", () => {
    expect(validateAppLayout(null).valid).toBe(false);
    expect(validateAppLayout({ pages: [] }).valid).toBe(false);
    expect(validateAppLayout({ pages: [{ root: { kind: "row", children: [] } }] }).errors[0].path).toBe("pages.0.id");
  });

  it("typed MapWidgetSpec is assignable to WidgetSpec", () => {
    const w: MapWidgetSpec = { type: "map", props: { mapControls: { tools: { print: { title: "x" } } }, layerIds: ["a"] } };
    const asWidget: WidgetSpec = w;
    expect(asWidget.type).toBe("map");
  });

  describe("existing AppLayout fixtures still validate unchanged", () => {
    const templatesDir = fileURLToPath(new URL("../../../templates/", import.meta.url));
    const files = readdirSync(templatesDir).filter((f) => f.endsWith(".json")).map((f) => templatesDir + f);
    files.push(fileURLToPath(new URL("../../../../recipes/showcase/app.json", import.meta.url)));
    it("found the fixtures", () => expect(files.length).toBeGreaterThanOrEqual(31));
    it.each(files.map((f) => [f.split(/[\\/]/).slice(-2).join("/"), f]))("%s", (_name, file) => {
      const raw = readFileSync(file, "utf8");
      const app = JSON.parse(raw);
      const r = validateAppLayout(app);
      expect(r.errors).toEqual([]);
      expect(r.valid).toBe(true);
      // validation never mutates the document
      expect(JSON.stringify(app)).toBe(JSON.stringify(JSON.parse(raw)));
    });
  });
});
