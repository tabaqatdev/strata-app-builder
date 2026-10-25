#!/usr/bin/env node
// Verify every basemap in the catalog is KEYLESS — as a behaviour, against the live hosts.
//
//   pnpm --filter @strata/map-controls verify:basemaps            all 33
//   node scripts/verify-basemaps.mjs osm esri-topo                just these ids
//
// Needs the built catalog (dist/basemaps.js): run `pnpm --filter @strata/map-controls build` first.
// Exit code: 0 = every entry passed · 1 = at least one failed · 2 = setup problem.
//
// "Keyless" is a behaviour, not a URL (strata/docs/troubleshooting.md §5): CARTO's raster CDN and
// tile.openstreetmap.org can both answer HTTP 200 with a placeholder, and pass a host check, a
// `!key=` check and a size check. So, per entry:
//   both    — every URL passes the host allow-list (BASEMAP_HOSTS) and the deny-list (BASEMAP_DENY).
//   raster  — two DIFFERENT tiles (base and overlay): HTTP 200, an image/tile content type, a CORS
//             header MapLibre can use, > 100 bytes, not Esri's grey "Map data not yet available"
//             placeholder, and the two tiles' bytes differ.
//   GL      — the style parses (v8, has sources, nothing deny-listed inside it), every URL it
//             delegates to (tiles, TileJSON, glyphs, sprite) passes BASEMAP_HOSTS (1.0.3), and every
//             host answers without a key: each source's TileJSON, two of its tiles (differing, as
//             above), one glyph range, the sprite .json + .png.
//   glyphs  — the DEFAULT_GLYPHS every raster style is built with (1.0.1): two DIFFERENT
//             fontstack/range pairs (DEFAULT_TEXT_FONT 0-255, DEFAULT_TEXT_FONT_BOLD 256-511) each
//             answer HTTP 200, no key, a usable CORS header, a non-empty protobuf, and they differ.
// A byte check cannot see a watermark: after a provider change, still LOOK at a tile.
//
// Slow volunteer hosts (CyclOSM, HOT) time out now and then: each request is retried, and an entry
// that fails is re-verified once more after a pause before it counts as a failure.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const DIST = new URL("../dist/basemaps.js", import.meta.url);
if (!existsSync(DIST)) {
  console.error("verify-basemaps: dist/basemaps.js not found — run `pnpm --filter @strata/map-controls build` first.");
  process.exit(2);
}
const { BASEMAPS, BASEMAP_HOSTS, BASEMAP_DENY, basemapUrls, toXyz, styleDelegateUrls,
        DEFAULT_GLYPHS, DEFAULT_TEXT_FONT, DEFAULT_TEXT_FONT_BOLD } = await import(DIST.href);

// Browser-like: an Origin + Referer (some keyless hosts gate by Referer) and an honest agent
// string (some 403 a request with no User-Agent).
export const ORIGIN = process.env.VERIFY_ORIGIN ?? "http://localhost:8041";
const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; strata-map-controls-verify/1.0; node fetch)",
                  Referer: `${ORIGIN}/`, Origin: ORIGIN };
const PLACEHOLDER_MD5 = new Set(["f27d9de7"]);   // Esri "Map data not yet available" (2521 B JPEG)
const KEY = /[?&](access_token|api_?key|token|key)=|\{key\}/i;
const md5 = (b) => createHash("md5").update(b).digest("hex").slice(0, 8);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function get(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
      return { status: r.status, type: r.headers.get("content-type") ?? "", cors: r.headers.get("access-control-allow-origin") ?? "",
               body: Buffer.from(await r.arrayBuffer()) };
    } catch (e) { last = e; await sleep(500 * (i + 1)); }
  }
  return { status: 0, type: String(last?.message ?? last), cors: "", body: Buffer.alloc(0) };
}
const guard = (u) => { if (BASEMAP_DENY.test(u)) throw new Error(`deny-listed URL: ${u}`); };

// Two California tiles at z5, side by side — they must differ.
const TILES = [[5, 5, 12], [5, 6, 12]];
const fill = (t, [z, x, y]) => t.replace("{z}", z).replace("{x}", x).replace("{y}", y);
async function twoTiles(xyz, label) {
  if (KEY.test(xyz)) throw new Error(`${label} tile URL carries a key: ${xyz}`);
  const got = [];
  for (const t of TILES) {
    const u = fill(xyz, t); guard(u);
    const r = await get(u);
    if (r.status !== 200) throw new Error(`${label} ${u} → HTTP ${r.status}${r.status ? "" : ` (${r.type})`}`);
    if (!/^image\/|protobuf|octet-stream|vector-tile/.test(r.type)) throw new Error(`${label} ${u} → ${r.type}`);
    // MapLibre fetches tiles cross-origin: no CORS header = a blank map in the browser, even at 200.
    if (r.cors !== "*" && r.cors !== ORIGIN) throw new Error(`${label} ${u} → no usable Access-Control-Allow-Origin (got "${r.cors}")`);
    if (r.body.length < 100) throw new Error(`${label} ${u} → ${r.body.length} B`);
    if (PLACEHOLDER_MD5.has(md5(r.body))) throw new Error(`${label} ${u} → Esri "Map data not yet available" placeholder`);
    got.push(r.body);
  }
  if (got[0].equals(got[1])) throw new Error(`${label}: two different tiles returned identical bytes (a placeholder)`);
  return got;
}

/** Verify one catalog entry. Resolves to a one-line summary; throws with the reason on failure. */
export async function verifyBasemap(b) {
  for (const u of basemapUrls(b)) {
    if (!BASEMAP_HOSTS.test(u)) throw new Error(`host not allowed: ${u}`);
    guard(u);
  }
  if (b.templateUrl) {
    await twoTiles(toXyz(b.templateUrl), "base");
    if (b.overlay) await twoTiles(toXyz(b.overlay), "overlay");
    return "2 tiles differ" + (b.overlay ? " (+ overlay)" : "");
  }
  const s = await get(b.style);
  if (s.status !== 200) throw new Error(`style → HTTP ${s.status}`);
  let j;
  try { j = JSON.parse(s.body.toString()); } catch { throw new Error("style is not JSON"); }
  if (j.version !== 8 || !j.sources || !Object.keys(j.sources).length) throw new Error("not a v8 GL style with sources");
  guard(JSON.stringify(j));
  const tileJson = {};
  for (const [name, src] of Object.entries(j.sources)) {
    let tiles = src.tiles;
    if (src.url) {
      guard(src.url);
      const tj = await get(src.url);
      if (tj.status !== 200) throw new Error(`source ${name} TileJSON → HTTP ${tj.status}`);
      try { tiles = JSON.parse(tj.body.toString()).tiles; } catch { throw new Error(`source ${name} TileJSON is not JSON`); }
      tileJson[src.url] = { tiles };
    }
    if (!tiles?.length) continue;           // e.g. a geojson source
    await twoTiles(tiles[0], `source ${name}`);
  }
  // 1.0.3: every host / path the style DELEGATES to (tiles, TileJSON, glyphs, sprite) must pass the
  // allow-list too — a GL basemap's requests run in the worker, so an app's host check reads these.
  if (styleDelegateUrls) {
    const off = styleDelegateUrls(j, tileJson).filter((u) => !BASEMAP_HOSTS.test(u));
    if (off.length) throw new Error(`style delegates to URL(s) BASEMAP_HOSTS does not cover: ${off.join(", ")}`);
  }
  if (j.glyphs) {
    // the font the style actually asks for (VersaTiles serves noto_sans_*, not Open Sans)
    const font = (j.layers ?? []).map((l) => l.layout?.["text-font"]).find((f) => Array.isArray(f) && typeof f[0] === "string");
    const u = j.glyphs.replace("{fontstack}", encodeURIComponent((font ?? ["Open Sans Regular"]).join(","))).replace("{range}", "0-255");
    guard(u);
    const g = await get(u);
    if (g.status !== 200 || g.body.length < 100) throw new Error(`glyphs → HTTP ${g.status} ${g.body.length} B`);
  }
  for (const sp of [j.sprite].flat().filter(Boolean)) {          // a string, or VersaTiles' [{id,url}] array
    const base = typeof sp === "string" ? sp : sp.url;
    for (const ext of [".json", ".png"]) {
      guard(base + ext);
      const r = await get(base + ext);
      if (r.status !== 200) throw new Error(`sprite${ext} → HTTP ${r.status}`);
    }
  }
  return `style + ${Object.keys(j.sources).length} source(s)${j.glyphs ? ", glyphs" : ""}${j.sprite ? ", sprite" : ""}`;
}

/** Verify the default glyph URL is keyless as a behaviour: two different fontstack/range pairs,
 *  each 200 + CORS + a non-empty protobuf (a glyph PBF opens with field 1 = 0x0a), bytes differ. */
export async function verifyGlyphs(template = DEFAULT_GLYPHS) {
  if (!template || !template.includes("{fontstack}") || !template.includes("{range}")) throw new Error(`not a glyph template: ${template}`);
  if (KEY.test(template)) throw new Error(`glyph URL carries a key: ${template}`);
  if (template === DEFAULT_GLYPHS && !BASEMAP_HOSTS.test(template)) throw new Error(`glyph host not allowed: ${template}`);
  guard(template);
  const pairs = [[DEFAULT_TEXT_FONT ?? ["noto_sans_regular"], "0-255"], [DEFAULT_TEXT_FONT_BOLD ?? ["noto_sans_bold"], "256-511"]];
  const got = [];
  for (const [font, range] of pairs) {
    const u = template.replace("{fontstack}", encodeURIComponent(font.join(","))).replace("{range}", range);
    const r = await get(u);
    if (r.status !== 200) throw new Error(`glyphs ${u} → HTTP ${r.status}${r.status ? "" : ` (${r.type})`}`);
    if (r.cors !== "*" && r.cors !== ORIGIN) throw new Error(`glyphs ${u} → no usable Access-Control-Allow-Origin (got "${r.cors}")`);
    if (r.body.length < 100 || r.body[0] !== 0x0a) throw new Error(`glyphs ${u} → not a glyph protobuf (${r.body.length} B)`);
    got.push(r.body);
  }
  if (got[0].equals(got[1])) throw new Error("glyphs: two different fontstack/range requests returned identical bytes");
  return `${pairs.map(([f, r]) => `${f[0]}/${r}`).join(" + ")} differ (${got.map((b) => b.length).join(" / ")} B)`;
}

/** Verify a list; each failing entry gets one more full attempt after a pause. Returns the failures. */
export async function verifyAll(list, { log = console.log, retryDelay = 5000 } = {}) {
  const failed = [];
  log(`verifying ${list.length} basemap(s) as a behaviour (origin ${ORIGIN})…`);
  for (const b of list) {
    let msg = null, err = null;
    for (let attempt = 1; attempt <= 2 && msg == null; attempt++) {
      try { msg = await verifyBasemap(b); if (attempt > 1) msg += " (passed on retry)"; }
      catch (e) { err = e; if (attempt === 1) await sleep(retryDelay); }
    }
    if (msg != null) log(`  ✓ ${b.id.padEnd(28)} ${msg}`);
    else { failed.push({ id: b.id, reason: err?.message ?? String(err) }); log(`  ✗ ${b.id.padEnd(28)} ${err?.message ?? err}`); }
  }
  log(failed.length ? `${failed.length} of ${list.length} basemap(s) FAILED: ${failed.map((f) => f.id).join(", ")}`
                    : `all ${list.length} basemap(s) keyless`);
  return failed;
}

export { BASEMAPS };

// run directly (not when imported by build-thumbs.mjs)
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const unknown = only.filter((id) => !BASEMAPS.some((b) => b.id === id));
  if (unknown.length) { console.error(`unknown basemap id(s): ${unknown.join(", ")}`); process.exit(2); }
  const list = only.length ? BASEMAPS.filter((b) => only.includes(b.id)) : BASEMAPS;
  let glyphsOk = true;
  try { console.log(`  ✓ ${"glyphs (DEFAULT_GLYPHS)".padEnd(28)} ${await verifyGlyphs()}`); }
  catch (e) { glyphsOk = false; console.log(`  ✗ ${"glyphs (DEFAULT_GLYPHS)".padEnd(28)} ${e?.message ?? e}`); }
  const failed = await verifyAll(list);
  process.exit(failed.length || !glyphsOk ? 1 : 0);
}
