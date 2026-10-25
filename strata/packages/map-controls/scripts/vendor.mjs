#!/usr/bin/env node
/**
 * vendor.mjs — copy the BUILT @strata/map-controls into a vanilla app (static index.html + ES
 * modules, no bundler), so the app runs the one standard map chrome instead of a hand-copied fork.
 *
 *   node scripts/vendor.mjs <appDir> [--dest map-controls] [--force]
 *   pnpm --filter @strata/map-controls vendor -- <appDir>
 *
 * Copies dist/*.js, dist/*.css and dist/thumbs/** (never .d.ts or source maps) into
 * `<appDir>/<dest>/` (default `map-controls/`), removes every file a previous vendor left there
 * that the current dist no longer has, and writes `<dest>/VENDOR.json`:
 *
 *   { package: "@strata/map-controls", version, builtAt, vendoredAt, files: { "<relPath>": "<sha256>" } }
 *
 * `scripts/check-drift.mjs` reads that manifest to tell OK / DRIFT / OUTDATED / NOT-VENDORED.
 *
 * Safety: it never writes or deletes outside `<appDir>/<dest>/` (`--dest` must stay inside the app),
 * never follows a symlink when deleting, and refuses a NON-EMPTY dest that has no VENDOR.json
 * (a hand-copied fork, or the wrong folder) unless `--force` is passed. Fails clearly when dist/
 * has not been built.
 */
import { createHash } from "node:crypto";
import {
  copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmdirSync, statSync,
  unlinkSync, writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const PACKAGE_NAME = "@strata/map-controls";
export const MANIFEST = "VENDOR.json";
export const DEFAULT_DEST = "map-controls";
/** The package root and its dist/, resolved from this script's own location. */
export const PKG_DIR = fileURLToPath(new URL("../", import.meta.url));
export const DIST_DIR = join(PKG_DIR, "dist");

/** The files an app needs at runtime: compiled modules, the stylesheet, the thumbnails. */
export function isVendorable(rel) {
  const p = rel.split(sep).join("/");
  if (/\.d\.ts$/.test(p) || /\.map$/.test(p)) return false;
  if (p.startsWith("thumbs/")) return true;
  return !p.includes("/") && /\.(m?js|css)$/.test(p);
}

/** Every file under `dir`, as forward-slash paths relative to it (symlinks are not followed). */
export function walk(dir, base = dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const st = lstatSync(abs);
    if (st.isDirectory()) out.push(...walk(abs, base));
    else out.push(relative(base, abs).split(sep).join("/"));
  }
  return out.sort();
}

export function sha256File(abs) {
  return createHash("sha256").update(readFileSync(abs)).digest("hex");
}

/** The version in the package.json next to `distDir` (`<pkg>/dist` → `<pkg>/package.json`). */
export function packageVersion(distDir = DIST_DIR) {
  const pj = join(distDir, "..", "package.json");
  try { return JSON.parse(readFileSync(pj, "utf8")).version ?? null; } catch { return null; }
}

/**
 * The manifest of what a vendor of `distDir` would ship: { version, builtAt, files: { rel: sha256 } }.
 * Throws a readable error when dist/ is missing or incomplete (not built).
 */
export function distManifest(distDir = DIST_DIR) {
  if (!existsSync(join(distDir, "index.js")) || !existsSync(join(distDir, "map-controls.css"))) {
    throw new Error(`${PACKAGE_NAME} is not built: ${distDir} has no index.js / map-controls.css.\n` +
      `  Build it first:  cd strata && pnpm --filter ${PACKAGE_NAME} build`);
  }
  const files = {};
  let newest = 0;
  for (const rel of walk(distDir).filter(isVendorable)) {
    const abs = join(distDir, rel);
    files[rel] = sha256File(abs);
    newest = Math.max(newest, statSync(abs).mtimeMs);
  }
  return { version: packageVersion(distDir), builtAt: new Date(newest).toISOString(), files };
}

/** `<appDir>/<dest>`, refusing anything that is not strictly inside the app folder. */
export function resolveDest(appDir, dest = DEFAULT_DEST) {
  if (!appDir) throw new Error("vendor: <appDir> is required");
  if (!dest || isAbsolute(dest)) throw new Error(`vendor: --dest must be a relative folder inside the app (got ${JSON.stringify(dest)})`);
  const app = resolve(appDir);
  const out = resolve(app, dest);
  const rel = relative(app, out);
  if (!rel || rel.startsWith("..") || isAbsolute(rel)) throw new Error(`vendor: --dest ${JSON.stringify(dest)} escapes the app folder`);
  return out;
}

/** Remove empty directories under `root` (deepest first); `root` itself stays. */
function pruneEmptyDirs(root) {
  for (const name of readdirSync(root)) {
    const abs = join(root, name);
    const st = lstatSync(abs);
    if (!st.isDirectory()) continue;
    pruneEmptyDirs(abs);
    if (readdirSync(abs).length === 0) rmdirSync(abs);
  }
}

/**
 * Vendor the built dist into `<appDir>/<dest>/`.
 * @returns {{ dest: string, version: string|null, copied: string[], removed: string[], manifest: object }}
 */
export function vendor(appDir, { dest = DEFAULT_DEST, distDir = DIST_DIR, force = false, now = new Date() } = {}) {
  const app = resolve(appDir ?? "");
  if (!appDir || !existsSync(app) || !statSync(app).isDirectory()) throw new Error(`vendor: app folder not found: ${app}`);
  const out = resolveDest(app, dest);
  const dm = distManifest(distDir);

  if (existsSync(out)) {
    if (lstatSync(out).isSymbolicLink() || !lstatSync(out).isDirectory()) throw new Error(`vendor: ${out} exists and is not a plain folder`);
    const existing = walk(out);
    if (existing.length && !existsSync(join(out, MANIFEST)) && !force) {
      throw new Error(`vendor: ${out} already holds ${existing.length} file(s) and no ${MANIFEST} — a hand-copied fork, or the wrong folder.\n` +
        `  Nothing was changed. Re-run with --force to replace its contents with the package build.`);
    }
  }
  mkdirSync(out, { recursive: true });

  // 1. stale files: anything in dest the new build does not ship (the manifest is rewritten below)
  const removed = [];
  for (const rel of walk(out)) {
    if (rel === MANIFEST || dm.files[rel]) continue;
    unlinkSync(join(out, rel));                           // unlink never follows a symlink
    removed.push(rel);
  }
  // 2. copy
  const copied = [];
  for (const rel of Object.keys(dm.files)) {
    const to = join(out, rel);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(join(distDir, rel), to);
    copied.push(rel);
  }
  pruneEmptyDirs(out);
  // 3. the manifest — hashes of what was actually written
  const files = {};
  for (const rel of copied) files[rel] = sha256File(join(out, rel));
  const manifest = { package: PACKAGE_NAME, version: dm.version, builtAt: dm.builtAt, vendoredAt: now.toISOString(), files };
  writeFileSync(join(out, MANIFEST), JSON.stringify(manifest, null, 2) + "\n");
  return { dest: out, version: dm.version, copied, removed, manifest };
}

// ── CLI ─────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { positional: [], dest: DEFAULT_DEST, force: false, dist: DIST_DIR };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--") continue;
    if (v === "--dest") a.dest = argv[++i];
    else if (v.startsWith("--dest=")) a.dest = v.slice(7);
    else if (v === "--dist") a.dist = resolve(argv[++i]);
    else if (v === "--force") a.force = true;
    else if (v === "-h" || v === "--help") a.help = true;
    else a.positional.push(v);
  }
  return a;
}

/** true when the file at `metaUrl` is the script node was asked to run (case-insensitive on Windows). */
export function isMainModule(metaUrl) {
  if (!process.argv[1]) return false;
  const b = pathToFileURL(resolve(process.argv[1])).href;
  return process.platform === "win32" ? metaUrl.toLowerCase() === b.toLowerCase() : metaUrl === b;
}
const isMain = isMainModule(import.meta.url);
if (isMain) {
  const a = parseArgs(process.argv.slice(2));
  if (a.help || a.positional.length !== 1) {
    console.error("usage: node scripts/vendor.mjs <appDir> [--dest map-controls] [--force]");
    process.exit(a.help ? 0 : 2);
  }
  try {
    const r = vendor(a.positional[0], { dest: a.dest, force: a.force, distDir: a.dist });
    console.log(`vendor: ${PACKAGE_NAME}@${r.version} → ${r.dest}`);
    console.log(`  ${r.copied.length} file(s) copied` + (r.removed.length ? `, ${r.removed.length} stale file(s) removed: ${r.removed.join(", ")}` : "") +
      `; ${MANIFEST} written`);
  } catch (e) {
    console.error(String(e.message ?? e));
    process.exit(1);
  }
}
