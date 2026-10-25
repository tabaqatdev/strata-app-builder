/**
 * The basemap catalog, OFFLINE: shape, groups, pairs, aliases, licence tags, Recommended, the
 * URL hooks and the keyless guards (host allow-list + deny-list). No network — the live,
 * behavioural keyless check is `pnpm --filter @strata/map-controls verify:basemaps`.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import * as MC from "../src/basemaps";
import {
  BASEMAPS, BASEMAP_GROUPS, BASEMAP_RECOMMENDED, BASEMAP_ALIASES, BASEMAP_NONE, BASEMAP_HOSTS, BASEMAP_DENY,
  THEME_BASEMAP, DEFAULT_THUMB_BASE, basemapForTheme, basemapById, resolveBasemapId, recommendedWith, toXyz,
  basemapUrl, basemapUrls, resolveUrl, setUrlRewrite, setThumbBase,
} from "../src/basemaps";

const BM_URLS = (b: Parameters<typeof basemapUrls>[0]) => basemapUrls(b);
const BM_KEY = /[?&](access_token|api_?key|token|key)=|\{key\}/i;
// CARTO's RASTER CDN composites "API KEY REQUIRED" onto an HTTP 200 tile, so its absence is
// asserted by PATH — no status, type or size check can see the watermark.
const CARTO_RASTER = /cartocdn\.com\/(light_all|dark_all|light_nolabels|dark_nolabels|light_only_labels|dark_only_labels|rastertiles)/;
const byId = (id: string) => BASEMAPS.find((b) => b.id === id);
const PKG = new URL("../", import.meta.url);

afterEach(() => { setUrlRewrite(null); setThumbBase(); });

describe("keyless: every URL, by construction", () => {
  it("no key, token or apikey in any URL an entry loads (overlays included)", () => {
    expect(BASEMAPS.flatMap(BM_URLS).filter((u) => BM_KEY.test(u))).toEqual([]);
  });
  it("every URL loads only from the allowed keyless hosts (BASEMAP_HOSTS)", () => {
    expect(BASEMAPS.flatMap(BM_URLS).filter((u) => !BASEMAP_HOSTS.test(u))).toEqual([]);
  });
  it("no URL matches the deny-list (BASEMAP_DENY)", () => {
    expect(BASEMAPS.flatMap(BM_URLS).filter((u) => BASEMAP_DENY.test(u))).toEqual([]);
  });
  it("the deny-list catches the known gated / keyed hosts and key params", () => {
    for (const u of [
      "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      "https://api.mapbox.com/styles/v1/x", "https://mt1.google.com/vt", "https://tiles.openfreemap.org/styles/positron",
      "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png", "https://tiles.stadiamaps.com/x", "https://tile.thunderforest.com/x",
      "https://api.maptiler.com/maps/x", "https://basemapstyles-api.arcgis.com/x", "https://example.com/t?key=abc",
      "https://example.com/t?access_token=abc", "https://example.com/t?apikey=abc", "https://example.com/t?token=abc",
    ]) expect(BASEMAP_DENY.test(u), u).toBe(true);
  });
  it("the allow-list rejects a host it does not name", () => {
    expect(BASEMAP_HOSTS.test("https://tiles.example.com/{z}/{x}/{y}.png")).toBe(false);
    expect(BASEMAP_HOSTS.test("http://tile.openstreetmap.org/1/2/3.png")).toBe(false);   // https only
  });
  it("no keyed provider is offered at all (mapbox · google · bing · here · tomtom · Esri basemap-styles API)", () => {
    expect(BASEMAPS.some((b) => BM_URLS(b).some((u) => /mapbox|google|bingmaps|here\.com|tomtom|basemapstyles-api/i.test(u)))).toBe(false);
  });
  it("the CARTO raster CDN appears nowhere — it serves a watermark at HTTP 200", () => {
    expect(BASEMAPS.some((b) => BM_URLS(b).some((u) => CARTO_RASTER.test(u)))).toBe(false);
  });
  it("CARTO is offered only as GL vector styles", () => {
    expect(BASEMAPS.filter((b) => b.group === "CARTO").every((b) => b.style && !b.templateUrl)).toBe(true);
  });
  it("no OpenFreeMap entry, and no referer-gated or keyed OSM host (Wikimedia · Stadia · Thunderforest · MapTiler)", () => {
    expect(BASEMAPS.some((b) => BM_URLS(b).some((u) => /openfreemap|maps\.wikimedia\.org|stadiamaps|thunderforest|maptiler/i.test(u)))).toBe(false);
  });
});

describe("catalog shape", () => {
  it("holds 33 basemaps with unique ids", () => {
    expect(BASEMAPS.length).toBe(33);
    expect(new Set(BASEMAPS.map((b) => b.id)).size).toBe(BASEMAPS.length);
  });
  it("the first basemap is OpenStreetMap", () => { expect(BASEMAPS[0].id).toBe("osm"); });
  it("BASEMAP_GROUPS is OpenStreetMap, Esri, USGS, CARTO — in that order, contiguous, none split", () => {
    expect(BASEMAP_GROUPS.join(",")).toBe("OpenStreetMap,Esri,USGS,CARTO");
    expect([...new Set(BASEMAPS.map((b) => b.group))].join(",")).toBe(BASEMAP_GROUPS.join(","));
    for (const g of BASEMAP_GROUPS) {
      const ix = BASEMAPS.map((b, i) => (b.group === g ? i : -1)).filter((i) => i >= 0);
      expect(ix.length > 0 && ix[ix.length - 1] - ix[0] === ix.length - 1, g).toBe(true);
    }
  });
  it("every entry has a group, a mode, a title, a copyright and a one-or-two-sentence description", () => {
    expect(BASEMAPS.filter((b) => !(BASEMAP_GROUPS.includes(b.group as never) && ["light", "dark"].includes(b.mode) &&
      b.title && b.copyright && typeof b.description === "string" && b.description.length > 20 && b.description.length < 300)).map((b) => b.id)).toEqual([]);
  });
  it("every entry is exactly one of style / templateUrl, and only rasters carry an overlay", () => {
    expect(BASEMAPS.every((b) => !!b.style !== !!b.templateUrl && (!b.overlay || !!b.templateUrl))).toBe(true);
  });
  it("VersaTiles entries are OpenStreetMap themes: OpenStreetMap group, GL styles, titled as OSM", () => {
    expect(BASEMAPS.filter((b) => /versatiles/.test(basemapUrl(b) ?? "")).every((b) =>
      b.group === "OpenStreetMap" && b.style && /^OSM .*\(VersaTiles\)$/.test(b.title))).toBe(true);
  });
  it("a `paint` is only ever carried by a raster entry, and holds only raster-* properties", () => {
    expect(BASEMAPS.filter((b) => b.paint).every((b) => b.templateUrl && Object.keys(b.paint!).every((k) => k.startsWith("raster-")))).toBe(true);
  });
  it("raster templateUrls (and overlays) use the ESRI Web Map tokens and rewrite cleanly to XYZ", () => {
    expect(BASEMAPS.filter((b) => b.templateUrl).every((b) => [b.templateUrl, b.overlay].filter(Boolean)
      .every((t) => t!.includes("{level}") && /\{z\}/.test(toXyz(t!)) && /\{x\}/.test(toXyz(t!)) && /\{y\}/.test(toXyz(t!))))).toBe(true);
  });
  it("no entry carries a separate `labels` raster — an overlay is only ever drawn in its own style", () => {
    expect(BASEMAPS.filter((b) => "labels" in b).map((b) => b.id)).toEqual([]);
  });
  it("every thumbnail is <base><id>.png, and the PNG ships in the package", () => {
    expect(BASEMAPS.filter((b) => b.thumbnail !== `map-controls/thumbs/${b.id}.png` ||
      !existsSync(new URL(`thumbs/${b.id}.png`, PKG))).map((b) => b.id)).toEqual([]);
    expect(readdirSync(new URL("thumbs/", PKG)).filter((f) => f.endsWith(".png")).sort()).toEqual(BASEMAPS.map((b) => `${b.id}.png`).sort());
  });
  it("basemaps.ts imports nothing (app-agnostic, vendorable, no DOM)", () => {
    expect(/^\s*import\s/m.test(readFileSync(new URL("src/basemaps.ts", PKG), "utf8"))).toBe(false);
  });
});

describe("theme pairs", () => {
  it("every declared pair names an existing basemap of the OPPOSITE mode, symmetrically", () => {
    expect(BASEMAPS.filter((b) => b.pair && byId(b.pair)?.mode === b.mode).map((b) => b.id)).toEqual([]);
    expect(BASEMAPS.filter((b) => b.pair && byId(b.pair!)?.pair !== b.id).map((b) => b.id)).toEqual([]);
  });
  it("the default theme pair is OpenStreetMap / OpenStreetMap Dark, followed by default", () => {
    expect(THEME_BASEMAP).toEqual({ follow: true, light: "osm", dark: "osm-dark" });
    expect([basemapForTheme("light"), basemapForTheme("dark")]).toEqual(["osm", "osm-dark"]);
  });
  it("OpenStreetMap pairs with OpenStreetMap Dark — the very same tiles, inverted", () => {
    expect(byId("osm")!.pair).toBe("osm-dark");
    expect(basemapUrl(byId("osm-dark")!)).toBe(basemapUrl(BASEMAPS[0]));
  });
});

describe("USGS The National Map", () => {
  const U = BASEMAPS.filter((b) => b.group === "USGS");
  const TNM = /^https:\/\/basemap\.nationalmap\.gov\/arcgis\/rest\/services\/USGS\w+\/MapServer\/tile\/\{level\}\/\{row\}\/\{col\}$/;
  it("offers Topo, Imagery, Imagery Topo and Hydrography", () => {
    expect(U.map((b) => b.id).join(",")).toBe("usgs-topo,usgs-imagery,usgs-imagery-topo,usgs-hydro");
  });
  it("every entry is a raster from basemap.nationalmap.gov, capped at maxZoom 16, crediting USGS", () => {
    expect(U.every((b) => b.templateUrl && !b.style && [b.templateUrl, b.overlay].some((t) => TNM.test(t ?? "")))).toBe(true);
    expect(U.every((b) => b.maxZoom === 16)).toBe(true);
    expect(U.every((b) => b.copyright.includes("USGS The National Map"))).toBe(true);
  });
  it("Shaded Relief is NOT offered; Hydrography is only an overlay on Esri's Light Gray Base", () => {
    expect(BASEMAPS.some((b) => BM_URLS(b).some((u) => /USGSShadedReliefOnly/.test(u)))).toBe(false);
    expect(BASEMAPS.filter((b) => BM_URLS(b).some((u) => /USGSHydroCached/.test(u)))
      .every((b) => /USGSHydroCached/.test(b.overlay ?? "") && /Canvas\/World_Light_Gray_Base/.test(b.templateUrl ?? ""))).toBe(true);
  });
});

describe("aliases and id resolution", () => {
  const PRUNED = ["esri-nav-charts", "esri-natgeo", "esri-physical", "esri-usa-topo", "osm-fr", "osm-de"];
  const ALIASES = { "esri-physical": "esri-shaded-relief", "esri-usa-topo": "usgs-topo", "esri-natgeo": "esri-topo", "esri-nav-charts": "esri-topo",
    "osm-fr": "osm", "osm-de": "osm", "ofm-positron": "vt-gray", "ofm-dark": "osm-dark", "ofm-liberty": "osm",
    "openfreemap-positron": "vt-gray", "openfreemap-dark": "osm-dark", "openfreemap-liberty": "osm",
    "versatiles-colorful": "vt-colorful", "versatiles-eclipse": "vt-colorful-dark", "opentopo": "opentopomap",
    "carto-positron-gl": "vt-gray", "carto-voyager-gl": "vt-colorful", "carto-dark-gl": "vt-gray-dark",
    "carto-dark": "vt-gray-dark", "osm-muted": "vt-muted" };
  it("the pruned six are gone (entries, pairs, thumbnails, services)", () => {
    expect(PRUNED.filter((id) => byId(id))).toEqual([]);
    expect(BASEMAPS.filter((b) => b.pair && PRUNED.includes(b.pair)).map((b) => b.id)).toEqual([]);
    expect(PRUNED.filter((id) => existsSync(new URL(`thumbs/${id}.png`, PKG)))).toEqual([]);
    expect(BASEMAPS.some((b) => BM_URLS(b).some((u) => /openstreetmap\.fr\/osmfr|openstreetmap\.de|NatGeo|World_Physical|USA_Topo|Navigation_Charts/.test(u)))).toBe(false);
  });
  it("BASEMAP_ALIASES is exactly the agreed table", () => {
    expect(Object.entries(BASEMAP_ALIASES).sort()).toEqual(Object.entries(ALIASES).sort());
  });
  it("every alias target exists and no alias shadows a live id", () => {
    expect(Object.values(BASEMAP_ALIASES).filter((t) => !byId(t))).toEqual([]);
    expect(Object.keys(BASEMAP_ALIASES).filter((k) => byId(k))).toEqual([]);
  });
  it("basemapById(legacy) resolves to its survivor, and resolveBasemapId agrees", () => {
    for (const [k, v] of Object.entries(ALIASES)) {
      expect(basemapById(k)!.id, k).toBe(v);
      expect(resolveBasemapId(k), k).toBe(v);
    }
  });
  it("resolveBasemapId: a live id is itself, 'basemap-<id>' is unwrapped, unknown / non-string is null", () => {
    expect(resolveBasemapId("esri-topo")).toBe("esri-topo");
    expect(resolveBasemapId("basemap-ofm-dark")).toBe("osm-dark");
    expect(resolveBasemapId("nope")).toBeNull();
    expect(resolveBasemapId(undefined)).toBeNull();
  });
  it("'none' stays unaliased: it resolves to itself and basemapById('none') is null", () => {
    expect(BASEMAP_NONE).toBe("none");
    expect("none" in BASEMAP_ALIASES).toBe(false);
    expect(resolveBasemapId("none")).toBe("none");
    expect(basemapById("none")).toBeNull();
  });
  it("an unknown id falls back to the first basemap", () => { expect(basemapById("no-such-basemap")!.id).toBe("osm"); });
});

describe("licence tags", () => {
  const tag = (id: string) => byId(id)?.license;
  it("every entry carries a tag, a plain one-sentence note and an https terms URL", () => {
    expect(BASEMAPS.filter((b) => !(["commercial-ok", "non-commercial"].includes(b.license) && typeof b.licenseNote === "string" &&
      b.licenseNote.length > 30 && b.licenseNote.length < 220 && !/[.!?]\s/.test(b.licenseNote) && b.licenseNote.endsWith(".") &&
      /^https:\/\//.test(b.licenseUrl ?? ""))).map((b) => b.id)).toEqual([]);
  });
  it("USGS (public domain) and VersaTiles are commercial-ok; Esri and CARTO are non-commercial", () => {
    expect(["usgs-topo", "usgs-imagery", "usgs-imagery-topo"].every((id) => tag(id) === "commercial-ok")).toBe(true);
    expect(BASEMAPS.filter((b) => /versatiles/.test(basemapUrl(b) ?? "")).every((b) => b.license === "commercial-ok")).toBe(true);
    expect(BASEMAPS.filter((b) => b.group === "Esri" || b.group === "CARTO").every((b) => b.license === "non-commercial")).toBe(true);
  });
  it("OSM France-hosted styles (HOT, CyclOSM) are non-commercial; OSM and OpenTopoMap are commercial-ok", () => {
    expect([tag("osm-hot"), tag("cyclosm")]).toEqual(["non-commercial", "non-commercial"]);
    expect([tag("osm"), tag("osm-dark"), tag("opentopomap")]).toEqual(["commercial-ok", "commercial-ok", "commercial-ok"]);
  });
  it("USGS Hydrography takes the STRICTER tag of its Esri base", () => { expect(tag("usgs-hydro")).toBe("non-commercial"); });
});

describe("Recommended", () => {
  it("BASEMAP_RECOMMENDED is the universal 8, all existing, no repeats, opening with OSM then OSM Dark", () => {
    expect(BASEMAP_RECOMMENDED.join(",")).toBe("osm,osm-dark,esri-light-gray,esri-dark-gray,vt-gray,esri-streets,esri-imagery-hybrid,esri-topo");
    expect(BASEMAP_RECOMMENDED.filter((id) => !byId(id))).toEqual([]);
    expect(new Set(BASEMAP_RECOMMENDED).size).toBe(BASEMAP_RECOMMENDED.length);
  });
  it("recommendedWith() with no extras is the universal 8", () => {
    expect(recommendedWith()).toEqual([...BASEMAP_RECOMMENDED]);
    expect(recommendedWith(null)).toEqual([...BASEMAP_RECOMMENDED]);
  });
  it("recommendedWith dedupes, resolves aliases, drops unknowns and 'none', caps extras at 3", () => {
    expect(recommendedWith(["osm", "esri-hillshade", "esri-hillshade", "opentopo", "nope", "none", "vt-gray", "usgs-topo"]).slice(8).join(","))
      .toBe("esri-hillshade,opentopomap,usgs-topo");
  });
  it("two app extras append in order (relief + US imagery → the ten)", () => {
    expect(recommendedWith(["esri-hillshade", "usgs-imagery-topo"]).join(","))
      .toBe("osm,osm-dark,esri-light-gray,esri-dark-gray,vt-gray,esri-streets,esri-imagery-hybrid,esri-topo,esri-hillshade,usgs-imagery-topo");
  });
});

describe("URL hooks", () => {
  const u = BASEMAPS[0].templateUrl!, topo = byId("esri-topo")!.templateUrl!;
  it("resolveUrl is the identity by default (and passes non-strings through)", () => {
    expect(BASEMAPS.every((b) => BM_URLS(b).every((x) => resolveUrl(x) === x))).toBe(true);
    expect(resolveUrl(undefined)).toBeUndefined();
  });
  it("setUrlRewrite(host map) rewrites that host's prefix, keeping the path, and leaves other hosts alone", () => {
    setUrlRewrite({ "tile.openstreetmap.org": "https://tiles.example.com/osm/" });
    expect(resolveUrl(u)).toBe("https://tiles.example.com/osm/{level}/{col}/{row}.png");
    expect(resolveUrl(topo)).toBe(topo);
  });
  it("the longest matching prefix wins; a full-URL key works", () => {
    setUrlRewrite({ "server.arcgisonline.com": "https://a.example", "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map": "https://b.example/topo" });
    expect(resolveUrl(topo)).toBe("https://b.example/topo/MapServer/tile/{level}/{row}/{col}");
  });
  it("setUrlRewrite(fn) applies the function; setUrlRewrite(null) restores the identity", () => {
    setUrlRewrite((x) => x.replace("https://", "https://proxy.example.com/"));
    expect(resolveUrl(u)).toBe("https://proxy.example.com/tile.openstreetmap.org/{level}/{col}/{row}.png");
    setUrlRewrite(null);
    expect(resolveUrl(u)).toBe(u);
  });
  it("setThumbBase relocates every thumbnail (trailing slash added); setThumbBase() restores the default", () => {
    expect(setThumbBase("vendor/mc/thumbs")).toBe("vendor/mc/thumbs/");
    expect(BASEMAPS[0].thumbnail).toBe("vendor/mc/thumbs/osm.png");
    expect(BASEMAPS.every((b) => b.thumbnail === `vendor/mc/thumbs/${b.id}.png`)).toBe(true);
    setThumbBase("");
    expect(BASEMAPS[0].thumbnail).toBe("osm.png");
    setThumbBase();
    expect(DEFAULT_THUMB_BASE).toBe("map-controls/thumbs/");
    expect(BASEMAPS[0].thumbnail).toBe("map-controls/thumbs/osm.png");
  });
  it("the namespace exposes the whole catalog API a mount needs", () => {
    for (const k of ["BASEMAPS", "basemapById", "resolveBasemapId", "recommendedWith", "BASEMAP_RECOMMENDED", "THEME_BASEMAP",
      "basemapForTheme", "toXyz", "resolveUrl"]) expect(k in MC, k).toBe(true);
  });
});

describe("vendorable as plain browser ES modules", () => {
  it("every relative import in src/ carries an explicit .js extension", () => {
    const bad: string[] = [];
    for (const f of readdirSync(new URL("src/", PKG)).filter((x) => x.endsWith(".ts"))) {
      const src = readFileSync(new URL(`src/${f}`, PKG), "utf8");
      for (const m of src.matchAll(/(?:from|import)\s*\(?\s*["'](\.[^"']+)["']/g)) if (!m[1].endsWith(".js")) bad.push(`${f}: ${m[1]}`);
    }
    expect(bad).toEqual([]);
  });
});

describe("glyphs — every basemap can carry app labels (1.0.1)", () => {
  // MapLibre rejects a symbol layer with a `text-field` on a style that has no `glyphs`, and the
  // labels silently never draw. A raster/"none" style is built here, so it must carry them.
  it("exports a keyless VersaTiles glyph URL and the fontstacks it serves", () => {
    expect(MC.DEFAULT_GLYPHS).toBe("https://tiles.versatiles.org/assets/glyphs/{fontstack}/{range}.pbf");
    expect(MC.DEFAULT_GLYPHS).toMatch(/\{fontstack\}/);
    expect(MC.DEFAULT_GLYPHS).toMatch(/\{range\}/);
    expect(BM_KEY.test(MC.DEFAULT_GLYPHS)).toBe(false);
    expect(BASEMAP_DENY.test(MC.DEFAULT_GLYPHS)).toBe(false);
    expect(BASEMAP_HOSTS.test(MC.DEFAULT_GLYPHS)).toBe(true);
    expect(MC.DEFAULT_TEXT_FONT).toEqual(["noto_sans_regular"]);
    expect(MC.DEFAULT_TEXT_FONT_BOLD).toEqual(["noto_sans_bold"]);
  });
  it("every catalog entry's style has glyphs (raster: built in; GL: the style's own)", async () => {
    const { basemapStyle } = await import("../src/map-controls");
    for (const b of BASEMAPS) {
      const st = basemapStyle(MC, b.id);
      if (typeof st === "string") { expect(b.style, b.id).toBeTruthy(); expect(st, b.id).toBe(b.style); continue; }
      expect(st.glyphs, b.id).toBe(MC.DEFAULT_GLYPHS);
    }
    expect((basemapStyle(MC, BASEMAP_NONE) as any).glyphs).toBe(MC.DEFAULT_GLYPHS);
  });
  it("a raster style uses the default; an app's own glyphs win; a GL style passes through untouched", async () => {
    const { basemapStyle } = await import("../src/map-controls");
    const osm = basemapStyle(MC, "osm") as any;
    expect(osm.glyphs).toBe(MC.DEFAULT_GLYPHS);
    expect(osm.sources.base.type).toBe("raster");
    const own = "https://fonts.example.org/{fontstack}/{range}.pbf";
    expect((basemapStyle(MC, "osm-dark", { glyphs: own }) as any).glyphs).toBe(own);
    expect((basemapStyle(MC, "none", { glyphs: own }) as any).glyphs).toBe(own);
    const vt = BASEMAPS.find((b) => b.style?.includes("tiles.versatiles.org"))!;
    expect(basemapStyle(MC, vt.id)).toBe(vt.style);                       // a URL: MapLibre loads its own glyphs
    expect(basemapStyle(MC, vt.id, { glyphs: own })).toBe(vt.style);      // …never overridden
    // a catalog without DEFAULT_GLYPHS (an older vendored copy) still gets the package default
    const { DEFAULT_GLYPHS: _omit, ...older } = MC as any;
    expect((basemapStyle(older, "osm") as any).glyphs).toBe(MC.DEFAULT_GLYPHS);
  });
  it("the glyph URL follows the URL-rewrite hook (a mirror reaches the fonts too)", async () => {
    const { basemapStyle } = await import("../src/map-controls");
    setUrlRewrite({ "tiles.versatiles.org": "https://mirror.example/vt" });
    try {
      expect((basemapStyle(MC, "osm") as any).glyphs).toBe("https://mirror.example/vt/assets/glyphs/{fontstack}/{range}.pbf");
    } finally { setUrlRewrite(null); }
  });
});
