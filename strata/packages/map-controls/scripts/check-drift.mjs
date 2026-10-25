#!/usr/bin/env node
/**
 * check-drift.mjs — is each app's vendored `map-controls/` still exactly the current package build?
 *
 *   node scripts/check-drift.mjs <appDir>... [--json] [--dest map-controls]
 *   pnpm --filter @strata/map-controls check-drift -- <appDir>...
 *
 * Compares `<appDir>/<dest>/` against the current dist/ by sha256 (the app's VENDOR.json plus the
 * files actually on disk) and reports, per app:
 *
 *   OK            every shipped file is present and byte-identical to the current build
 *   DRIFT         same version, but files differ: `modified` (hash ≠ current build), `missing`
 *                 (in the build, not in the app), `extra` (in the app, not in the build);
 *                 `edited` lists files changed locally since they were vendored (≠ VENDOR.json)
 *   OUTDATED      vendored from an OLDER package version — re-run scripts/vendor.mjs
 *   NOT-VENDORED  no `<dest>/` folder, or one with no VENDOR.json (a hand-copied fork)
 *
 * Exit 0 only when every app is OK; 1 otherwise; 2 on a usage error or an unbuilt dist/.
 * Programmatic: `import { checkDrift } from "@strata/map-controls/scripts/check-drift.mjs"`.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  DEFAULT_DEST, DIST_DIR, MANIFEST, PACKAGE_NAME, distManifest, isMainModule, resolveDest, sha256File, walk,
} from "./vendor.mjs";

export const STATUS = Object.freeze({ OK: "OK", DRIFT: "DRIFT", OUTDATED: "OUTDATED", NOT_VENDORED: "NOT-VENDORED" });

/** -1 / 0 / 1 for dotted numeric versions ("1.2.10" > "1.2.9"); a pre-release tag sorts below its release. */
export function compareVersions(a, b) {
  const parse = (v) => {
    const [core, pre] = String(v ?? "0").replace(/^v/, "").split("-", 2);
    return { n: core.split(".").map((x) => Number.parseInt(x, 10) || 0), pre: pre ?? null };
  };
  const A = parse(a), B = parse(b);
  for (let i = 0; i < Math.max(A.n.length, B.n.length); i++) {
    const d = (A.n[i] ?? 0) - (B.n[i] ?? 0);
    if (d) return d < 0 ? -1 : 1;
  }
  if (A.pre === B.pre) return 0;
  if (A.pre == null) return 1;
  if (B.pre == null) return -1;
  return A.pre < B.pre ? -1 : 1;
}

/**
 * Compare one app's vendored copy against `distDir` (default: this package's dist/).
 * `current` may be passed to reuse a `distManifest()` across many apps.
 * @returns {{ app: string, dest: string, status: "OK"|"DRIFT"|"OUTDATED"|"NOT-VENDORED",
 *   vendoredVersion: string|null, currentVersion: string|null, modified: string[], missing: string[],
 *   extra: string[], edited: string[], detail: string }}
 */
export function checkDrift(appDir, distDir = DIST_DIR, { dest = DEFAULT_DEST, current } = {}) {
  const cur = current ?? distManifest(distDir);
  const app = resolve(appDir);
  const out = resolveDest(app, dest);
  const r = { app, dest: out, status: STATUS.OK, vendoredVersion: null, currentVersion: cur.version,
    modified: [], missing: [], extra: [], edited: [], detail: "" };

  if (!existsSync(out) || !statSync(out).isDirectory()) {
    return { ...r, status: STATUS.NOT_VENDORED, detail: `no ${dest}/ folder — run scripts/vendor.mjs` };
  }
  let man = null;
  try { man = JSON.parse(readFileSync(join(out, MANIFEST), "utf8")); } catch { /* missing or unreadable */ }
  if (!man || man.package !== PACKAGE_NAME || typeof man.files !== "object" || !man.files) {
    return { ...r, status: STATUS.NOT_VENDORED,
      detail: `${dest}/ has no valid ${MANIFEST} (a hand-copied fork?) — run scripts/vendor.mjs --force` };
  }
  r.vendoredVersion = man.version ?? null;

  const onDisk = walk(out).filter((f) => f !== MANIFEST);
  const actual = Object.fromEntries(onDisk.map((f) => [f, sha256File(join(out, f))]));
  for (const [f, h] of Object.entries(cur.files)) {
    if (!(f in actual)) r.missing.push(f);
    else if (actual[f] !== h) r.modified.push(f);
  }
  for (const f of onDisk) if (!(f in cur.files)) r.extra.push(f);
  for (const [f, h] of Object.entries(man.files)) if (f in actual && actual[f] !== h) r.edited.push(f);

  const differs = r.modified.length + r.missing.length + r.extra.length > 0;
  if (r.vendoredVersion && cur.version && compareVersions(r.vendoredVersion, cur.version) < 0) {
    r.status = STATUS.OUTDATED;
    r.detail = `vendored ${r.vendoredVersion}, current ${cur.version} — re-run scripts/vendor.mjs`;
  } else if (differs) {
    r.status = STATUS.DRIFT;
    const parts = [];
    if (r.modified.length) parts.push(`${r.modified.length} modified`);
    if (r.missing.length) parts.push(`${r.missing.length} missing`);
    if (r.extra.length) parts.push(`${r.extra.length} extra`);
    r.detail = parts.join(", ") + (r.edited.length ? ` (${r.edited.length} edited in the app since vendoring)`
      : r.modified.length ? " (the package was rebuilt since vendoring)" : "");
  } else {
    r.detail = `${cur.version ?? "?"}, ${onDisk.length} file(s) identical to the current build`;
  }
  return r;
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (isMainModule(import.meta.url)) {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const json = args.includes("--json");
  let dest = DEFAULT_DEST, dist = DIST_DIR;
  const apps = [];
  for (let i = 0; i < args.length; i++) {
    const v = args[i];
    if (v === "--json") continue;
    if (v === "--dest") dest = args[++i];
    else if (v.startsWith("--dest=")) dest = v.slice(7);
    else if (v === "--dist") dist = resolve(args[++i]);
    else apps.push(v);
  }
  if (!apps.length) {
    console.error("usage: node scripts/check-drift.mjs <appDir>... [--json] [--dest map-controls]");
    process.exit(2);
  }
  let current;
  try { current = distManifest(dist); } catch (e) { console.error(String(e.message ?? e)); process.exit(2); }
  const results = apps.map((a) => {
    try { return checkDrift(a, dist, { dest, current }); }
    catch (e) { return { app: resolve(a), status: "ERROR", detail: String(e.message ?? e), modified: [], missing: [], extra: [], edited: [] }; }
  });
  const allOk = results.every((r) => r.status === STATUS.OK);
  if (json) console.log(JSON.stringify({ ok: allOk, package: PACKAGE_NAME, version: current.version, results }, null, 2));
  else {
    for (const r of results) {
      console.log(`${r.status.padEnd(13)} ${r.app}  — ${r.detail}`);
      for (const k of ["modified", "missing", "extra", "edited"]) for (const f of r[k] ?? []) console.log(`${" ".repeat(16)}${k}: ${f}`);
    }
    console.log(allOk ? `all ${results.length} app(s) match ${PACKAGE_NAME}@${current.version}` : `drift found — fix with: node scripts/vendor.mjs <appDir>`);
  }
  process.exit(allOk ? 0 : 1);
}
