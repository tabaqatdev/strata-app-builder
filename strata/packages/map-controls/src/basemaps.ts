/**
 * @strata/map-controls/basemaps — the basemap catalog. App-agnostic: no app state, no DOM, no
 * imports. Importable on its own (`@strata/map-controls/basemaps`, or the vendored `basemaps.js`).
 *
 * An app imports it as a namespace (`import * as catalog from …`) and hands it to
 * mountMapControls(); it adds only its own choices (Recommended extras, theme pair) on top.
 *
 * ── Keyless only. Four groups: OpenStreetMap · Esri · USGS · CARTO. ───────────────────────────
 * "Keyless" is a BEHAVIOUR, asserted per entry by `pnpm --filter @strata/map-controls
 * verify:basemaps` (scripts/verify-basemaps.mjs, also run weekly in CI) and the live suite (two different tiles, HTTP 200, image type, CORS, differing bytes, not a placeholder;
 * a GL style parsed and every host it delegates to probed). Verified 2026-10-08.
 *
 * ⚠ CARTO's RASTER CDN (basemaps.cartocdn.com/{light_all,dark_all,rastertiles,…}) is NOT keyless:
 *   it answers HTTP 200 and composites "API KEY REQUIRED" across every tile. Only CARTO's GL VECTOR
 *   styles (basemaps.cartocdn.com/gl/<name>-gl-style/style.json) are offered — their TileJSON,
 *   .mvt tiles, glyphs and sprite on tiles.basemaps.cartocdn.com all answer without a key TODAY.
 *   CARTO's terms (below) nonetheless require a CARTO-issued key and reserve the right to watermark
 *   unauthenticated tiles — the GL styles may go the way of the raster CDN without notice.
 * ⚠ Esri VECTOR basemaps need an API key and are OUT; the Esri entries are the public tiled
 *   MapServers on server.arcgisonline.com (+ Firefly on fly.maptiles.arcgis.com), whose tile path
 *   is /tile/{level}/{row}/{col} — row BEFORE col.
 * USGS The National Map (basemap.nationalmap.gov) — public-domain tiled MapServers, same
 *   /tile/{level}/{row}/{col} path, CORS "*", no key. Their LODs advertise 0–23 but the cache stops
 *   at level 16: level 17+ answers HTTP 404, so maxZoom 16 and MapLibre over-zooms. Coverage is the
 *   United States. USGSShadedReliefOnly is NOT offered (no level 9 at all; stops at 13). USGSHydro-
 *   Cached is a transparent overlay (water only), offered on Esri's neutral Light Gray Base.
 *
 * ── Licence tags (researched 2026-10-08) ─────────────────────────────────────────────────────
 * Every entry carries `license: "commercial-ok" | "non-commercial"`, a one-sentence `licenseNote`
 * for a non-GIS reader, and `licenseUrl`. "commercial-ok" = the provider's terms allow use inside a
 * paid or business product without a contract (attribution and fair-use still apply).
 * "non-commercial" = a business deployment needs the provider's paid plan, key or permission.
 * An entry built from two providers takes the STRICTER tag (usgs-hydro sits on an Esri base).
 *
 *   OSMF tile usage policy — https://operations.osmfoundation.org/policies/tiles/
 *     No commercial ban; heavy use, bulk/offline download and missing attribution are prohibited,
 *     a unique User-Agent is required, no SLA, and "commercial services should be especially aware
 *     that access may be withdrawn at any point". → commercial-ok, LIGHT traffic only.
 *   OpenTopoMap — https://opentopomap.org/about
 *     CC-BY-SA map that the FAQ says explicitly permits commercial use, no fees; the volunteer
 *     server must not be overloaded and has no availability guarantee. → commercial-ok, light use.
 *   OpenStreetMap France (hosts HOT + CyclOSM) — https://www.openstreetmap.fr/fonds-de-carte/
 *     Websites/apps only "sous certaines conditions", otherwise contact them; no availability
 *     guarantee; abuse is throttled or blocked. No commercial grant → non-commercial.
 *     (CyclOSM: https://www.cyclosm.org/ · HOT: https://www.hotosm.org/ — both point to OSM-FR.)
 *   Esri public tiles — https://www.esri.com/en-us/legal/terms/full-master-agreement and the
 *     summary https://downloads2.esri.com/arcgisonline/docs/tou_summary.pdf : Esri content needs an
 *     ArcGIS / developer account; the free tier covers public, non-revenue, non-government apps
 *     with Esri attribution; business or government use needs a paid subscription. → non-commercial.
 *   CARTO — https://carto.com/legal/basemap-terms/ (updated 2026-09-29) and
 *     https://github.com/CartoDB/basemap-styles : "An API key is required to use CARTO basemaps";
 *     the free key covers non-commercial use (5M tiles/month) AND commercial use up to 1M/month;
 *     unauthenticated requests may be watermarked. KEYLESS use (what this catalog does) is not
 *     licensed at all → tagged non-commercial; a production app should register a free key.
 *   USGS The National Map — https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits
 *     USGS-produced data are U.S. public domain; credit requested. → commercial-ok.
 *   VersaTiles — https://docs.versatiles.org/guides/use_tiles_versatiles_org.html
 *     "free and open to everyone", no key, per-IP rate limit, no uptime guarantee; data are OSM
 *     (ODbL) + ESA WorldCover (CC-BY 4.0), which both allow commercial use with credit. → commercial-ok.
 *
 * ── Entry shape (the drawer codes against this) ──────────────────────────────────────────────
 *   { id, title, group, mode: "light"|"dark",
 *     style?        GL style URL (vector)  OR  templateUrl?  raster, ESRI tokens {level}/{col}/{row}
 *     overlay?      a second raster templateUrl (labels/reference) drawn ON TOP of templateUrl
 *     maxZoom?      deepest NATIVE tile level (raster): set the source maxzoom so MapLibre over-zooms
 *     paint?        raster paint for the BASE raster layer only (never the overlay)
 *     copyright, description (1–2 sentences, hover tooltip),
 *     license, licenseNote, licenseUrl,
 *     thumbnail     "<thumb base><id>.png" (default "map-controls/thumbs/"), 200×134, California z4
 *     pair?         id of its opposite-mode partner }
 *
 * Every URL the UI loads (style, templateUrl, overlay) must go through resolveUrl() — the one hook
 * for a tile proxy or self-hosted mirror. It is the identity until setUrlRewrite() is called.
 */

// ── types ────────────────────────────────────────────────────────────────────────────────────
export type BasemapMode = "light" | "dark";
export type BasemapLicense = "commercial-ok" | "non-commercial";
export type BasemapGroup = "OpenStreetMap" | "Esri" | "USGS" | "CARTO";
/** The licence block every entry carries. */
export interface BasemapLicenseInfo {
  license: BasemapLicense;
  /** One plain sentence for a non-GIS reader. */
  licenseNote: string;
  /** The provider's terms. */
  licenseUrl: string;
}
/** One catalog entry (see "Entry shape" above). Exactly one of `style` / `templateUrl` is set. */
export interface BasemapEntry extends BasemapLicenseInfo {
  id: string;
  title: string;
  group: BasemapGroup | string;
  mode: BasemapMode;
  /** A GL style URL (vector). */
  style?: string;
  /** A raster template in the ESRI Web Map tokens {level}/{col}/{row}. */
  templateUrl?: string;
  /** A second raster template (labels/reference) drawn ON TOP of templateUrl. */
  overlay?: string;
  /** Deepest native tile level (raster): MapLibre over-zooms past it. */
  maxZoom?: number;
  /** Raster paint for the BASE raster layer only (never the overlay). */
  paint?: Record<string, number>;
  copyright: string;
  /** 1–2 sentences, shown as the hover tooltip. */
  description: string;
  /** "<thumb base><id>.png" — a getter, so setThumbBase() relocates every entry at once. */
  readonly thumbnail: string;
  /** Id of its opposite-mode partner. */
  pair?: string;
}
/** The theme pair: which basemap each mode follows to. */
export interface ThemeBasemapPair { light: string; dark: string; follow?: boolean }
/** A URL-rewrite rule for setUrlRewrite(): a function, or a { hostOrPrefix: replacement } map. */
export type UrlRewriteRule = ((url: string) => string) | Record<string, string>;
type EntryInput = Omit<BasemapEntry, "thumbnail" | keyof BasemapLicenseInfo>;

// ── provider helpers ─────────────────────────────────────────────────────────────────────────
const AGOL = "https://server.arcgisonline.com/ArcGIS/rest/services";
const esri = (svc: string) => `${AGOL}/${svc}/MapServer/tile/{level}/{row}/{col}`;
const CARTO_GL = (name: string) => `https://basemaps.cartocdn.com/gl/${name}-gl-style/style.json`;
const CARTO_CR = "© OpenStreetMap contributors · © CARTO";
const OSM_TILES = "https://tile.openstreetmap.org/{level}/{col}/{row}.png";
// VersaTiles: an open, keyless OpenStreetMap vector stack (style + tiles + glyphs + sprite all on
// tiles.versatiles.org). Canonical style names — the old ones (eclipse, graybeard…) now 301 here.
const VT_GL = (name: string) => `https://tiles.versatiles.org/assets/styles/${name}/style.json`;
const VT_CR = "© OpenStreetMap contributors · ESA WorldCover 2021 · style © VersaTiles";
const TNM = "https://basemap.nationalmap.gov/arcgis/rest/services";
const usgs = (svc: string) => `${TNM}/${svc}/MapServer/tile/{level}/{row}/{col}`;
const ESRI_CANVAS_CR = "Esri, HERE, Garmin, (c) OpenStreetMap contributors, and the GIS user community";

// ── licence presets (one per provider; see the research notes above) ────────────────────────
const LIC: Record<"osm" | "opentopo" | "osmfr" | "versatiles" | "esri" | "usgs" | "carto", BasemapLicenseInfo> = {
  osm: { license: "commercial-ok", licenseUrl: "https://operations.osmfoundation.org/policies/tiles/",
    licenseNote: "Free to use in any app with OpenStreetMap credit, but the volunteer servers only allow light traffic — a busy or commercial app should use its own tile server." },
  opentopo: { license: "commercial-ok", licenseUrl: "https://opentopomap.org/about",
    licenseNote: "Free to use, including commercially, with credit (CC-BY-SA), but it runs on a single volunteer server, so heavy traffic needs its own copy." },
  osmfr: { license: "non-commercial", licenseUrl: "https://www.openstreetmap.fr/fonds-de-carte/",
    licenseNote: "Run by volunteers at OpenStreetMap France for community use; a business app needs their permission or its own tile server." },
  versatiles: { license: "commercial-ok", licenseUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org.html",
    licenseNote: "Free and open to everyone, including businesses, with OpenStreetMap credit; the public server is rate-limited and has no uptime guarantee." },
  esri: { license: "non-commercial", licenseUrl: "https://downloads2.esri.com/arcgisonline/docs/tou_summary.pdf",
    licenseNote: "Free only for public, non-commercial apps that credit Esri; a business or government app needs an ArcGIS subscription." },
  usgs: { license: "commercial-ok", licenseUrl: "https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits",
    licenseNote: "A US government public-domain map — free for any use, including commercial; crediting USGS is requested." },
  carto: { license: "non-commercial", licenseUrl: "https://carto.com/legal/basemap-terms/",
    licenseNote: "Requires a CARTO key for licensed use: CARTO's terms need a free API key for any use (commercial allowed up to 1 million tiles a month); without one the map may be watermarked at any time." },
};

// Thumbnails are a getter so setThumbBase() relocates every entry at once (a vendored copy that
// lives somewhere other than <app>/map-controls/ calls it once at startup).
let THUMB_BASE = "map-controls/thumbs/";
/** The default thumbnail base: a copy vendored at <app>/map-controls/ needs no setThumbBase(). */
export const DEFAULT_THUMB_BASE = "map-controls/thumbs/";
const B = (entry: EntryInput, lic: BasemapLicenseInfo): BasemapEntry => Object.defineProperty({ ...entry, ...lic }, "thumbnail",
  { get(this: { id: string }) { return `${THUMB_BASE}${this.id}.png`; }, enumerable: true }) as BasemapEntry;

export const BASEMAP_GROUPS: BasemapGroup[] = ["OpenStreetMap", "Esri", "USGS", "CARTO"];
export const BASEMAPS: BasemapEntry[] = [
  // ── OpenStreetMap ────────────────────────────────────────────────────────────────────────
  B({ id: "osm", title: "OpenStreetMap", group: "OpenStreetMap", mode: "light",
    templateUrl: OSM_TILES, maxZoom: 19,
    copyright: "© OpenStreetMap contributors",
    description: "The standard OpenStreetMap map, drawn from the community-built open map of the world: roads, places, land use and points of interest.",
    pair: "osm-dark" }, LIC.osm),
  // The SAME standard tiles, inverted on the GPU: brightness min/max swapped flips lightness, and
  // the 180° hue rotation applied before it puts every hue back (water stays blue, parks green).
  B({ id: "osm-dark", title: "OpenStreetMap Dark", group: "OpenStreetMap", mode: "dark",
    templateUrl: OSM_TILES, maxZoom: 19,
    paint: { "raster-brightness-min": 1, "raster-brightness-max": 0.1, "raster-hue-rotate": 180, "raster-saturation": -0.5, "raster-contrast": 0.15 },
    copyright: "© OpenStreetMap contributors",
    description: "The standard OpenStreetMap map rendered dark — the same tiles, inverted in the browser so roads and labels read light on a dark ground.",
    pair: "osm" }, LIC.osm),
  B({ id: "opentopomap", title: "OpenTopoMap", group: "OpenStreetMap", mode: "light",
    templateUrl: "https://tile.opentopomap.org/{level}/{col}/{row}.png", maxZoom: 17,
    copyright: "© OpenStreetMap contributors, SRTM · © OpenTopoMap (CC-BY-SA)",
    description: "A topographic map in the style of a printed survey sheet, drawn from OpenStreetMap with SRTM contours and hillshading." }, LIC.opentopo),
  B({ id: "osm-hot", title: "Humanitarian (HOT)", group: "OpenStreetMap", mode: "light",
    templateUrl: "https://a.tile.openstreetmap.fr/hot/{level}/{col}/{row}.png", maxZoom: 20,
    copyright: "© OpenStreetMap contributors · tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France",
    description: "The Humanitarian OpenStreetMap Team style — soft colours that emphasise roads, settlements, water and facilities used in disaster response." }, LIC.osmfr),
  B({ id: "cyclosm", title: "CyclOSM", group: "OpenStreetMap", mode: "light",
    templateUrl: "https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{level}/{col}/{row}.png", maxZoom: 20,
    copyright: "© OpenStreetMap contributors · CyclOSM, tiles hosted by OpenStreetMap France",
    description: "A cycling-oriented OpenStreetMap style: bike lanes and routes, with shaded relief beneath the roads and places." }, LIC.osmfr),
  B({ id: "vt-colorful", title: "OSM Colorful (VersaTiles)", group: "OpenStreetMap", mode: "light",
    style: VT_GL("colorful"), copyright: VT_CR,
    description: "A colourful general-purpose OpenStreetMap vector map from the open VersaTiles project.",
    pair: "vt-colorful-dark" }, LIC.versatiles),
  B({ id: "vt-colorful-dark", title: "OSM Colorful Dark (VersaTiles)", group: "OpenStreetMap", mode: "dark",
    style: VT_GL("colorful-dark"), copyright: VT_CR,
    description: "The dark version of VersaTiles Colorful (formerly Eclipse) — OpenStreetMap vector data on a dark ground.",
    pair: "vt-colorful" }, LIC.versatiles),
  B({ id: "vt-gray", title: "OSM Gray (VersaTiles)", group: "OpenStreetMap", mode: "light",
    style: VT_GL("gray"), copyright: VT_CR,
    description: "A gray OpenStreetMap vector map from VersaTiles (formerly Graybeard) — a quiet backdrop for coloured data.",
    pair: "vt-gray-dark" }, LIC.versatiles),
  B({ id: "vt-gray-dark", title: "OSM Gray Dark (VersaTiles)", group: "OpenStreetMap", mode: "dark",
    style: VT_GL("gray-dark"), copyright: VT_CR,
    description: "A dark gray OpenStreetMap vector map from VersaTiles (formerly Shadow).",
    pair: "vt-gray" }, LIC.versatiles),
  B({ id: "vt-muted", title: "OSM Muted (VersaTiles)", group: "OpenStreetMap", mode: "light",
    style: VT_GL("muted"), copyright: VT_CR,
    description: "A softly coloured OpenStreetMap vector map from VersaTiles (formerly Neutrino), between Colorful and Gray.",
    pair: "vt-muted-dark" }, LIC.versatiles),
  B({ id: "vt-muted-dark", title: "OSM Muted Dark (VersaTiles)", group: "OpenStreetMap", mode: "dark",
    style: VT_GL("muted-dark"), copyright: VT_CR,
    description: "The dark version of VersaTiles Muted — OpenStreetMap vector data in low-saturation colours on a dark ground.",
    pair: "vt-muted" }, LIC.versatiles),
  // ── Esri (public tiled MapServers) ───────────────────────────────────────────────────────
  B({ id: "esri-imagery", title: "World Imagery", group: "Esri", mode: "dark",
    templateUrl: esri("World_Imagery"), maxZoom: 23,
    copyright: "Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community",
    description: "Satellite and aerial imagery of the world — 15 m TerraColor at small scales and one-metre or better imagery across the United States and many other areas." }, LIC.esri),
  B({ id: "esri-imagery-hybrid", title: "Imagery Hybrid", group: "Esri", mode: "dark",
    templateUrl: esri("World_Imagery"), overlay: esri("Reference/World_Boundaries_and_Places"), maxZoom: 23,
    copyright: "Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community · Esri, HERE, Garmin, (c) OpenStreetMap contributors, and the GIS user community",
    description: "World Imagery with country, state and county boundaries and place names drawn on top." }, LIC.esri),
  B({ id: "esri-imagery-firefly", title: "Imagery (Firefly)", group: "Esri", mode: "dark",
    templateUrl: "https://fly.maptiles.arcgis.com/arcgis/rest/services/World_Imagery_Firefly/MapServer/tile/{level}/{row}/{col}", maxZoom: 23,
    copyright: "Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community",
    description: "A de-saturated, darkened version of World Imagery, designed as a neutral imagery backdrop that lets brightly styled data stand out." }, LIC.esri),
  B({ id: "esri-streets", title: "World Street Map", group: "Esri", mode: "light",
    templateUrl: esri("World_Street_Map"), maxZoom: 23,
    copyright: "Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, (c) OpenStreetMap contributors, and the GIS User Community",
    description: "A worldwide street map: highways, major and minor roads, railways, water features, administrative boundaries and landmarks." }, LIC.esri),
  B({ id: "esri-topo", title: "World Topographic", group: "Esri", mode: "light",
    templateUrl: esri("World_Topo_Map"), maxZoom: 23,
    copyright: "Sources: Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), (c) OpenStreetMap contributors, and the GIS User Community",
    description: "A general reference map: boundaries, cities, water, parks, landmarks and transport drawn over land cover and shaded relief." }, LIC.esri),
  B({ id: "esri-light-gray", title: "Light Gray Canvas", group: "Esri", mode: "light",
    templateUrl: esri("Canvas/World_Light_Gray_Base"), overlay: esri("Canvas/World_Light_Gray_Reference"), maxZoom: 23,
    copyright: ESRI_CANVAS_CR,
    description: "A neutral light-gray background with minimal colour and labels, so your data comes to the foreground.",
    pair: "esri-dark-gray" }, LIC.esri),
  B({ id: "esri-dark-gray", title: "Dark Gray Canvas", group: "Esri", mode: "dark",
    templateUrl: esri("Canvas/World_Dark_Gray_Base"), overlay: esri("Canvas/World_Dark_Gray_Reference"), maxZoom: 23,
    copyright: ESRI_CANVAS_CR,
    description: "A neutral dark-gray background with minimal colour and labels; it supports bright colours for your data.",
    pair: "esri-light-gray" }, LIC.esri),
  B({ id: "esri-oceans", title: "Oceans", group: "Esri", mode: "light",
    templateUrl: esri("Ocean/World_Ocean_Base"), overlay: esri("Ocean/World_Ocean_Reference"), maxZoom: 16,
    copyright: "Esri, Garmin, GEBCO, NOAA NGDC, and other contributors",
    description: "A marine basemap featuring ocean-floor bathymetry and undersea feature names, with land shown as shaded relief and land cover." }, LIC.esri),
  B({ id: "esri-terrain", title: "Terrain with Labels", group: "Esri", mode: "light",
    templateUrl: esri("World_Terrain_Base"), overlay: esri("Reference/World_Reference_Overlay"), maxZoom: 13,
    copyright: "Sources: Esri, USGS, NOAA · Esri, Garmin, USGS, NPS",
    description: "Shaded relief and bathymetry as a neutral backdrop, with boundaries, places and water features on top." }, LIC.esri),
  B({ id: "esri-shaded-relief", title: "Shaded Relief", group: "Esri", mode: "light",
    templateUrl: esri("World_Shaded_Relief"), maxZoom: 13,
    copyright: "(c) 2014 Esri",
    description: "Surface elevation portrayed as shaded relief — 30 m resolution in the United States." }, LIC.esri),
  B({ id: "esri-hillshade", title: "Hillshade", group: "Esri", mode: "light",
    templateUrl: esri("Elevation/World_Hillshade"), maxZoom: 23,
    copyright: "Sources: Esri, Vantor, Airbus DS, USGS, NGA, NASA, CGIAR, N Robinson, NCEAS, NLS, OS, NMA, Geodatastyrelsen, Rijkswaterstaat, GSA, Geoland, FEMA, Intermap, and the GIS user community",
    description: "Elevation rendered as an artistic hillshade — a backdrop for topographic, hydrologic or land-cover maps.",
    pair: "esri-hillshade-dark" }, LIC.esri),
  B({ id: "esri-hillshade-dark", title: "Hillshade (Dark)", group: "Esri", mode: "dark",
    templateUrl: esri("Elevation/World_Hillshade_Dark"), maxZoom: 23,
    copyright: "Sources: Esri, Vantor, Airbus DS, USGS, NGA, NASA, CGIAR, N Robinson, NCEAS, NLS, OS, NMA, Geodatastyrelsen, Rijkswaterstaat, GSA, Geoland, FEMA, Intermap, and the GIS user community",
    description: "A dark terrain hillshade from 24 m elevation data globally and 10 m or better in many places.",
    pair: "esri-hillshade" }, LIC.esri),
  // ── USGS The National Map (public domain; United States coverage; cache ends at level 16) ──
  B({ id: "usgs-topo", title: "USGS Topo", group: "USGS", mode: "light",
    templateUrl: usgs("USGSTopo"), maxZoom: 16,
    copyright: "USGS The National Map: National Boundaries Dataset, 3DEP Elevation Program, Geographic Names Information System, National Hydrography Dataset, National Land Cover Database, National Structures Dataset, and National Transportation Dataset; USGS Global Ecosystems; U.S. Census Bureau TIGER/Line data; USFS Road data; Natural Earth Data; U.S. Department of State HIU; NOAA National Centers for Environmental Information",
    description: "The USGS topographic reference map of the United States: contours, shaded relief, water, roads, boundaries and place names from The National Map." }, LIC.usgs),
  B({ id: "usgs-imagery", title: "USGS Imagery", group: "USGS", mode: "dark",
    templateUrl: usgs("USGSImageryOnly"), maxZoom: 16,
    copyright: "USDA, USGS The National Map: Orthoimagery",
    description: "Aerial orthoimagery of the United States from The National Map, without labels." }, LIC.usgs),
  B({ id: "usgs-imagery-topo", title: "USGS Imagery Topo", group: "USGS", mode: "dark",
    templateUrl: usgs("USGSImageryTopo"), maxZoom: 16,
    copyright: "USGS The National Map: Orthoimagery and US Topo",
    description: "USGS aerial imagery of the United States with US Topo roads, boundaries, water and place names drawn on top." }, LIC.usgs),
  // Public-domain water on an ESRI base → the stricter (Esri) tag, with its own note.
  B({ id: "usgs-hydro", title: "USGS Hydrography", group: "USGS", mode: "light",
    templateUrl: esri("Canvas/World_Light_Gray_Base"), overlay: usgs("USGSHydroCached"), maxZoom: 16,
    copyright: `USGS The National Map: National Hydrography Dataset · ${ESRI_CANVAS_CR}`,
    description: "Rivers, streams, lakes and coastal water from the USGS National Hydrography Dataset, drawn over a neutral light-gray canvas." },
    { ...LIC.esri, licenseNote: "The USGS water layer is public domain, but it is drawn on an Esri gray base that is free only for non-commercial apps." }),
  // ── CARTO (GL vector styles only — the raster CDN is watermarked) ───────────────────────
  B({ id: "carto-positron", title: "Positron", group: "CARTO", mode: "light",
    style: CARTO_GL("positron"), copyright: CARTO_CR,
    description: "CARTO's light, low-contrast basemap from OpenStreetMap data — built to sit quietly under thematic data.",
    pair: "carto-dark-matter" }, LIC.carto),
  B({ id: "carto-dark-matter", title: "Dark Matter", group: "CARTO", mode: "dark",
    style: CARTO_GL("dark-matter"), copyright: CARTO_CR,
    description: "CARTO's dark basemap from OpenStreetMap data — makes bright data colours glow.",
    pair: "carto-positron" }, LIC.carto),
  B({ id: "carto-voyager", title: "Voyager", group: "CARTO", mode: "light",
    style: CARTO_GL("voyager"), copyright: CARTO_CR,
    description: "CARTO's colourful general-purpose basemap from OpenStreetMap data, with clear roads and labels." }, LIC.carto),
  B({ id: "carto-positron-nolabels", title: "Positron (no labels)", group: "CARTO", mode: "light",
    style: CARTO_GL("positron-nolabels"), copyright: CARTO_CR,
    description: "Positron without place or road labels — the quietest light background.",
    pair: "carto-dark-matter-nolabels" }, LIC.carto),
  B({ id: "carto-dark-matter-nolabels", title: "Dark Matter (no labels)", group: "CARTO", mode: "dark",
    style: CARTO_GL("dark-matter-nolabels"), copyright: CARTO_CR,
    description: "Dark Matter without place or road labels — the quietest dark background.",
    pair: "carto-positron-nolabels" }, LIC.carto),
  B({ id: "carto-voyager-nolabels", title: "Voyager (no labels)", group: "CARTO", mode: "light",
    style: CARTO_GL("voyager-nolabels"), copyright: CARTO_CR,
    description: "Voyager without place or road labels." }, LIC.carto),
];

/** Relocate every entry's `thumbnail` (a vendored copy at another path calls this once).
 *  `base` is prepended to "<id>.png"; a trailing slash is added if missing. */
export function setThumbBase(base: string = DEFAULT_THUMB_BASE): string {
  THUMB_BASE = base === "" || base.endsWith("/") ? base : `${base}/`;
  return THUMB_BASE;
}

// ── ids: aliases and resolution ──────────────────────────────────────────────────────────────
/** "No basemap" — a real choice some apps offer. Deliberately NOT aliased to anything: it resolves
 *  to itself and basemapById("none") is null, so the caller draws a blank ground. */
export const BASEMAP_NONE = "none";
/** Retired or legacy ids → the surviving entry that best replaces them. Pruned from this catalog
 *  (2026-10-08) plus the ids the other recipe apps shipped before the shared catalog existed
 *  (OpenFreeMap was rejected; VersaTiles/OpenTopo/CARTO had other spellings). */
export const BASEMAP_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  // pruned from this catalog
  "esri-physical": "esri-shaded-relief",
  "esri-usa-topo": "usgs-topo",
  "esri-natgeo": "esri-topo",
  "esri-nav-charts": "esri-topo",
  "osm-fr": "osm",
  "osm-de": "osm",
  // legacy ids in the other apps. None point at CARTO: CARTO's terms require an API key for any
  // use, so legacy positron/voyager/dark ids land on the keyless, commercial-ok VersaTiles styles.
  "ofm-positron": "vt-gray",
  "ofm-dark": "osm-dark",
  "ofm-liberty": "osm",
  "openfreemap-positron": "vt-gray",
  "openfreemap-dark": "osm-dark",
  "openfreemap-liberty": "osm",
  "versatiles-colorful": "vt-colorful",
  "versatiles-eclipse": "vt-colorful-dark",
  "opentopo": "opentopomap",
  "carto-positron-gl": "vt-gray",
  "carto-voyager-gl": "vt-colorful",
  "carto-dark-gl": "vt-gray-dark",
  "carto-dark": "vt-gray-dark",        // atm-cash-service-routing
  "osm-muted": "vt-muted",                  // resilience-disclosure-pack
});
const BY_ID = new Map<string, BasemapEntry>(BASEMAPS.map((b) => [b.id, b]));
/** Canonical id for any id: itself if in the catalog, its alias target if retired/legacy,
 *  "none" for "none", otherwise null (unknown). Tolerates a "basemap-" layer-id prefix. */
export function resolveBasemapId(id: unknown): string | null {
  if (typeof id !== "string" || !id) return null;
  const k = id.startsWith("basemap-") && !BY_ID.has(id) ? id.slice(8) : id;
  if (k === BASEMAP_NONE) return BASEMAP_NONE;
  if (BY_ID.has(k)) return k;
  const a = BASEMAP_ALIASES[k];
  return a && BY_ID.has(a) ? a : null;
}
/** The entry for an id (resolved through aliases); null for "none"; BASEMAPS[0] for an unknown id. */
export function basemapById(id: unknown): BasemapEntry | null {
  const r = resolveBasemapId(id);
  if (r === BASEMAP_NONE) return null;
  return (r ? BY_ID.get(r) : undefined) ?? BASEMAPS[0];
}

// ── Recommended ──────────────────────────────────────────────────────────────────────────────
/** The universal Recommended section every app opens with, in order. */
export const BASEMAP_RECOMMENDED: readonly string[] = Object.freeze(["osm", "osm-dark", "esri-light-gray", "esri-dark-gray",
  "vt-gray", "esri-streets", "esri-imagery-hybrid", "esri-topo"]);
/** The universal 8, then up to 3 app extras — resolved through aliases, unknown ids dropped,
 *  duplicates (of the 8 or of each other) dropped, order kept. */
export function recommendedWith(extras: readonly unknown[] | null | undefined = []): string[] {
  const out = [...BASEMAP_RECOMMENDED];
  let added = 0;
  for (const x of extras ?? []) {
    if (added >= 3) break;
    const id = resolveBasemapId(x);
    if (!id || id === BASEMAP_NONE || out.includes(id)) continue;
    out.push(id); added++;
  }
  return out;
}

// ── the theme pair ───────────────────────────────────────────────────────────────────────────
/** The default theme pair (light ↔ dark), followed unless the app passes its own `themeBasemaps`:
 *  OpenStreetMap / OpenStreetMap Dark — the same keyless tiles, inverted for dark. */
export const THEME_BASEMAP: Readonly<ThemeBasemapPair> = Object.freeze({ follow: true, light: "osm", dark: "osm-dark" });
/** The basemap id a theme mode follows to. */
export const basemapForTheme = (mode: string): string => (mode === "dark" ? THEME_BASEMAP.dark : THEME_BASEMAP.light);

// ── URLs ─────────────────────────────────────────────────────────────────────────────────────
/** ESRI Web Map tile tokens → MapLibre XYZ. */
export const toXyz = (t: string): string => t.replace("{level}", "{z}").replace("{col}", "{x}").replace("{row}", "{y}");
/** The keyless glyph (font) endpoint every catalog style without its own `glyphs` is given — the
 *  same VersaTiles endpoint the catalog's VersaTiles GL styles already use. Without a `glyphs`
 *  property MapLibre refuses any symbol layer with a `text-field` ("text-field requires a style
 *  glyphs property") and the labels silently never draw.
 *  It serves ONE font per request: a `text-font` must name exactly one fontstack it has (see
 *  DEFAULT_TEXT_FONT) — a comma-joined stack, and MapLibre's default "Open Sans Regular", 404. */
export const DEFAULT_GLYPHS = "https://tiles.versatiles.org/assets/glyphs/{fontstack}/{range}.pbf";
/** A `text-font` that DEFAULT_GLYPHS serves (regular weight). Use it on every app label layer. */
export const DEFAULT_TEXT_FONT: readonly string[] = Object.freeze(["noto_sans_regular"]);
/** …and the bold weight. */
export const DEFAULT_TEXT_FONT_BOLD: readonly string[] = Object.freeze(["noto_sans_bold"]);
/** Every basemap URL, whichever form it takes — ONE place for the keyless guard to read. */
export const basemapUrl = (b: Partial<BasemapEntry>): string | undefined => b.style ?? b.templateUrl;
/** …and every URL an entry loads, overlay included, for a guard that must see all of them. */
export const basemapUrls = (b: Partial<BasemapEntry>): string[] => [basemapUrl(b), b.overlay].filter(Boolean) as string[];

/** Tile-host override — the hook for a corporate proxy or a self-hosted mirror.
 *  setUrlRewrite(fn)    fn(url) → url, applied to every style/template/overlay URL.
 *  setUrlRewrite(map)   { "tile.openstreetmap.org": "https://tiles.example.com/osm", … }:
 *                       a key is a host (https:// assumed) or a full URL prefix; the longest
 *                       matching prefix is replaced by its value, the rest of the URL kept.
 *  setUrlRewrite(null)  back to the identity.
 *  Note: a GL style's own internal URLs (tiles, glyphs, sprite) are not rewritten — mirror the
 *  style.json itself, or use MapLibre's transformRequest, for those. */
let REWRITE: ((url: string) => string) | null = null;
export function setUrlRewrite(rule: UrlRewriteRule | null | undefined): void {
  if (rule == null) { REWRITE = null; return; }
  if (typeof rule === "function") { REWRITE = rule; return; }
  const pairs = Object.entries(rule)
    .map(([from, to]): [string, string] => [/^[a-z]+:\/\//i.test(from) ? from : `https://${from}`, String(to)])
    .sort((a, b) => b[0].length - a[0].length);
  REWRITE = (u: string) => {
    for (const [from, to] of pairs) {
      if (u === from || u.startsWith(from.endsWith("/") ? from : `${from}/`)) return to.replace(/\/$/, "") + u.slice(from.replace(/\/$/, "").length);
    }
    return u;
  };
}
/** Identity unless setUrlRewrite() installed a rule. The UI calls this for EVERY basemap URL. */
export const resolveUrl = <T>(url: T): T => (REWRITE && typeof url === "string" ? (REWRITE(url) as unknown as T) : url);

// ── guards ───────────────────────────────────────────────────────────────────────────────────
/** Hosts a basemap may load from (DEFAULT_GLYPHS included) — AND every host / path the catalog's GL
 *  styles delegate to (their vector tiles, TileJSON, glyphs and sprite). A GL basemap's own requests
 *  run in MapLibre's worker and do not show in the page's network log, so a host check must read the
 *  active style's URLs (styleDelegateUrls) — and those must pass here too. Checked offline against a
 *  recorded copy of every catalog style (tests/fixtures/gl-style-delegates.json) and live by
 *  `verify:basemaps`. VersaTiles: assets/{styles,glyphs,sprites}/ + tiles/osm/. CARTO GL:
 *  tiles.basemaps.cartocdn.com/{gl,fonts,vector}/ + tiles-{a..d}.basemaps.cartocdn.com/vectortiles/, and
 *  (since 2026-10) the versioned layout tiles.basemaps.cartocdn.com/v/<release>/{gl,fonts,vectortiles}/. */
export const BASEMAP_HOSTS = /^https:\/\/(tile\.openstreetmap\.org|tile\.opentopomap\.org|a\.tile\.openstreetmap\.fr\/hot\/|a\.tile-cyclosm\.openstreetmap\.fr\/cyclosm\/|tiles\.versatiles\.org\/(assets\/(styles|glyphs|sprites)\/|tiles\/osm\/)|server\.arcgisonline\.com|services\.arcgisonline\.com|fly\.maptiles\.arcgis\.com|basemap\.nationalmap\.gov\/arcgis\/rest\/services\/|basemaps\.cartocdn\.com\/gl\/|tiles\.basemaps\.cartocdn\.com\/(gl|fonts|vector)\/|tiles\.basemaps\.cartocdn\.com\/v\/[\w.-]+\/(gl|fonts|vectortiles)\/|tiles-[a-d]\.basemaps\.cartocdn\.com\/vectortiles\/)/;
/**
 * Every URL a parsed GL style delegates to: each source's `url` (TileJSON) and `tiles`, `glyphs`, and the
 * sprite (a string, or VersaTiles' [{ id, url }] array). Pass a source's TileJSON as `tileJson[url]` to
 * include the tile URLs it lists. Pure — feed it the style of the map in force (`map.getStyle()`, once
 * the style has loaded) to check the hosts a GL basemap really uses.
 */
export function styleDelegateUrls(style: any, tileJson: Record<string, { tiles?: string[] } | null | undefined> = {}): string[] {
  const out: string[] = [];
  const add = (u: unknown) => { if (typeof u === "string" && u && !out.includes(u)) out.push(u); };
  for (const src of Object.values<any>(style?.sources ?? {})) {
    if (!src || typeof src !== "object") continue;
    add(src.url);
    for (const t of Array.isArray(src.tiles) ? src.tiles : []) add(t);
    for (const t of (typeof src.url === "string" ? tileJson[src.url]?.tiles : null) ?? []) add(t);
  }
  add(style?.glyphs);
  for (const sp of [style?.sprite].flat()) add(typeof sp === "string" ? sp : sp?.url);
  return out;
}
/** What must never appear: keyed providers, key params, and the CARTO RASTER paths that serve a
 *  watermark at HTTP 200. */
export const BASEMAP_DENY = /cartocdn\.com\/(light_all|dark_all|light_nolabels|dark_nolabels|light_only_labels|dark_only_labels|rastertiles)|mapbox|google|bingmaps|here\.com|tomtom|basemapstyles-api|openfreemap|maps\.wikimedia\.org|stadiamaps|thunderforest|maptiler|[?&](access_token|api_?key|token|key)=/i;
