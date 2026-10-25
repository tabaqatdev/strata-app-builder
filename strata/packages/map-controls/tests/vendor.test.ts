/**
 * scripts/vendor.mjs + scripts/check-drift.mjs — vendoring the built package into a vanilla app and
 * telling, later, whether that copy still IS the current build. Hermetic: a fake package (its own
 * package.json + dist/) in a temp folder, so these never depend on (or touch) the real build.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
// @ts-ignore — plain ESM scripts, no type declarations
import { vendor, distManifest, isVendorable, resolveDest, MANIFEST } from "../scripts/vendor.mjs";
// @ts-ignore
import { checkDrift, compareVersions, STATUS } from "../scripts/check-drift.mjs";

const SCRIPTS = fileURLToPath(new URL("../scripts/", import.meta.url));
let root: string, dist: string, app: string;

const put = (p: string, body: string | Buffer) => { mkdirSync(join(p, ".."), { recursive: true }); writeFileSync(p, body); };
const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
/** Every file under `dir` with its sha256 — a snapshot to prove nothing else changed. */
function tree(dir: string, skip?: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (d: string) => {
    for (const n of readdirSync(d)) {
      const abs = join(d, n);
      if (skip && (abs === skip || abs.startsWith(skip + sep))) continue;
      if (statSync(abs).isDirectory()) walk(abs); else out[relative(dir, abs)] = sha(abs);
    }
  };
  walk(dir);
  return out;
}
function fakePackage(version = "1.2.0") {
  const pkg = join(root, "pkg");
  put(join(pkg, "package.json"), JSON.stringify({ name: "@strata/map-controls", version }));
  put(join(pkg, "dist", "index.js"), "export * from './map-controls.js';\n");
  put(join(pkg, "dist", "map-controls.js"), "export const mountMapControls = () => {};\n");
  put(join(pkg, "dist", "basemaps.js"), "export const BASEMAPS = [];\n");
  put(join(pkg, "dist", "map-controls.css"), ".smc{}\n");
  put(join(pkg, "dist", "index.d.ts"), "export {};\n");
  put(join(pkg, "dist", "index.js.map"), "{}\n");
  put(join(pkg, "dist", "thumbs", "osm.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47, 1]));
  put(join(pkg, "dist", "thumbs", "osm-dark.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47, 2]));
  return join(pkg, "dist");
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "smc-vendor-test-"));
  dist = fakePackage();
  app = join(root, "app");
  put(join(app, "index.html"), "<!doctype html><title>app</title>\n");
  put(join(app, "layers.mjs"), "export const LAYERS = [];\n");
});
afterEach(() => { rmSync(root, { recursive: true, force: true }); });

describe("vendor.mjs", () => {
  it("copies js, css and thumbs — never .d.ts or source maps — and writes VENDOR.json with sha256 per file", () => {
    const r = vendor(app, { distDir: dist });
    const dest = join(app, "map-controls");
    expect(r.dest).toBe(dest);
    expect(Object.keys(tree(dest)).map((p) => p.split(sep).join("/")).sort()).toEqual(
      ["VENDOR.json", "basemaps.js", "index.js", "map-controls.css", "map-controls.js", "thumbs/osm-dark.png", "thumbs/osm.png"]);
    const man = JSON.parse(readFileSync(join(dest, MANIFEST), "utf8"));
    expect(man.package).toBe("@strata/map-controls");
    expect(man.version).toBe("1.2.0");
    expect(Number.isNaN(Date.parse(man.builtAt))).toBe(false);
    expect(Object.keys(man.files).sort()).toEqual(["basemaps.js", "index.js", "map-controls.css", "map-controls.js", "thumbs/osm-dark.png", "thumbs/osm.png"]);
    for (const [f, h] of Object.entries(man.files)) expect(h).toBe(sha(join(dist, f)));
  });

  it("isVendorable: modules, the stylesheet and thumbnails only", () => {
    expect(isVendorable("index.js")).toBe(true);
    expect(isVendorable("map-controls.css")).toBe(true);
    expect(isVendorable("thumbs/osm.png")).toBe(true);
    expect(isVendorable("index.d.ts")).toBe(false);
    expect(isVendorable("index.js.map")).toBe(false);
    expect(isVendorable("nested/other.js")).toBe(false);
  });

  it("removes stale files a previous vendor left behind", () => {
    vendor(app, { distDir: dist });
    unlinkSync(join(dist, "basemaps.js"));
    unlinkSync(join(dist, "thumbs", "osm-dark.png"));
    put(join(dist, "tools.js"), "export const t = 1;\n");
    const r = vendor(app, { distDir: dist });
    expect(r.removed.map((p: string) => p.split(sep).join("/")).sort()).toEqual(["basemaps.js", "thumbs/osm-dark.png"]);
    expect(existsSync(join(app, "map-controls", "basemaps.js"))).toBe(false);
    expect(existsSync(join(app, "map-controls", "tools.js"))).toBe(true);
    expect(checkDrift(app, dist).status).toBe(STATUS.OK);
  });

  it("never writes outside the dest folder", () => {
    const sibling = join(root, "sibling"); put(join(sibling, "keep.txt"), "keep\n");
    const dest = join(app, "map-controls");
    const before = tree(root, dest);
    vendor(app, { distDir: dist });
    put(join(dist, "extra.js"), "x\n");               // a second vendor over an existing copy
    vendor(app, { distDir: dist });
    // everything outside dest — the app's own files, the sibling, the package — byte-identical,
    // except the one file this test added to the fake dist
    const after = tree(root, dest);
    delete after[join("pkg", "dist", "extra.js")];
    expect(after).toEqual(before);
  });

  it("refuses a --dest that escapes the app folder, and an absolute one", () => {
    expect(() => resolveDest(app, "../elsewhere")).toThrow(/escapes the app folder/);
    expect(() => resolveDest(app, ".")).toThrow(/escapes the app folder/);
    expect(() => resolveDest(app, join(root, "abs"))).toThrow(/relative folder/);
    expect(() => vendor(app, { distDir: dist, dest: "../x" })).toThrow();
    expect(existsSync(join(root, "x"))).toBe(false);
    expect(resolveDest(app, "vendor/mc")).toBe(join(app, "vendor", "mc"));
  });

  it("refuses a non-empty dest without VENDOR.json (a hand-copied fork) unless forced", () => {
    put(join(app, "map-controls", "map-controls.mjs"), "// hand-copied\n");
    expect(() => vendor(app, { distDir: dist })).toThrow(/no VENDOR\.json/);
    expect(existsSync(join(app, "map-controls", "map-controls.mjs"))).toBe(true);   // untouched
    const r = vendor(app, { distDir: dist, force: true });
    expect(r.removed).toEqual(["map-controls.mjs"]);
    expect(checkDrift(app, dist).status).toBe(STATUS.OK);
  });

  it("fails clearly when dist is not built", () => {
    const empty = join(root, "unbuilt", "dist"); mkdirSync(empty, { recursive: true });
    expect(() => vendor(app, { distDir: empty })).toThrow(/not built[\s\S]*pnpm --filter @strata\/map-controls build/);
    expect(existsSync(join(app, "map-controls"))).toBe(false);
  });

  it("fails clearly when the app folder does not exist", () => {
    expect(() => vendor(join(root, "nope"), { distDir: dist })).toThrow(/app folder not found/);
  });

  it("honours --dest", () => {
    vendor(app, { distDir: dist, dest: "vendor/mc" });
    expect(existsSync(join(app, "vendor", "mc", MANIFEST))).toBe(true);
    expect(checkDrift(app, dist, { dest: "vendor/mc" }).status).toBe(STATUS.OK);
  });
});

describe("check-drift.mjs", () => {
  it("OK straight after a vendor", () => {
    vendor(app, { distDir: dist });
    const r = checkDrift(app, dist);
    expect(r.status).toBe("OK");
    expect([r.modified, r.missing, r.extra, r.edited]).toEqual([[], [], [], []]);
    expect(r.vendoredVersion).toBe("1.2.0");
    expect(r.currentVersion).toBe("1.2.0");
  });

  it("DRIFT — a file edited in the app is `modified` and `edited`", () => {
    vendor(app, { distDir: dist });
    writeFileSync(join(app, "map-controls", "map-controls.js"), "// patched in the app\n");
    const r = checkDrift(app, dist);
    expect(r.status).toBe("DRIFT");
    expect(r.modified).toEqual(["map-controls.js"]);
    expect(r.edited).toEqual(["map-controls.js"]);
  });

  it("DRIFT — the package rebuilt (same version) since vendoring is `modified` but not `edited`", () => {
    vendor(app, { distDir: dist });
    writeFileSync(join(dist, "map-controls.css"), ".smc{color:red}\n");
    const r = checkDrift(app, dist);
    expect(r.status).toBe("DRIFT");
    expect(r.modified).toEqual(["map-controls.css"]);
    expect(r.edited).toEqual([]);
  });

  it("DRIFT — a deleted file is `missing`", () => {
    vendor(app, { distDir: dist });
    unlinkSync(join(app, "map-controls", "thumbs", "osm.png"));
    const r = checkDrift(app, dist);
    expect(r.status).toBe("DRIFT");
    expect(r.missing).toEqual(["thumbs/osm.png"]);
  });

  it("DRIFT — a file the build does not ship is `extra`", () => {
    vendor(app, { distDir: dist });
    put(join(app, "map-controls", "local-hack.js"), "x\n");
    const r = checkDrift(app, dist);
    expect(r.status).toBe("DRIFT");
    expect(r.extra).toEqual(["local-hack.js"]);
  });

  it("OUTDATED — vendored from an older package version", () => {
    vendor(app, { distDir: dist });
    const p = join(app, "map-controls", MANIFEST);
    writeFileSync(p, JSON.stringify({ ...JSON.parse(readFileSync(p, "utf8")), version: "1.1.9" }));
    const r = checkDrift(app, dist);
    expect(r.status).toBe("OUTDATED");
    expect(r.vendoredVersion).toBe("1.1.9");
    expect(r.detail).toMatch(/1\.1\.9.*1\.2\.0/);
  });

  it("NOT-VENDORED — no folder, or a folder without VENDOR.json", () => {
    expect(checkDrift(app, dist).status).toBe("NOT-VENDORED");
    put(join(app, "map-controls", "map-controls.mjs"), "// hand-copied\n");
    const r = checkDrift(app, dist);
    expect(r.status).toBe("NOT-VENDORED");
    expect(r.detail).toMatch(/VENDOR\.json/);
  });

  it("compareVersions orders dotted versions numerically, a pre-release below its release", () => {
    expect(compareVersions("1.2.10", "1.2.9")).toBe(1);
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("0.9.0", "1.0.0")).toBe(-1);
    expect(compareVersions("1.0.0-rc.1", "1.0.0")).toBe(-1);
  });

  it("distManifest hashes exactly the vendorable files", () => {
    const m = distManifest(dist);
    expect(m.version).toBe("1.2.0");
    expect(Object.keys(m.files)).not.toContain("index.d.ts");
    expect(m.files["index.js"]).toBe(sha(join(dist, "index.js")));
  });

  it("CLI: exit 0 when every app is OK, 1 on drift, 2 without apps; --json is machine-readable", () => {
    vendor(app, { distDir: dist });
    const other = join(root, "other"); mkdirSync(other);
    const run = (...a: string[]) => spawnSync(process.execPath, [join(SCRIPTS, "check-drift.mjs"), ...a, "--dist", dist], { encoding: "utf8" });
    const ok = run(app);
    expect(ok.status).toBe(0);
    expect(ok.stdout).toMatch(/^OK/m);
    const bad = run(app, other, "--json");
    expect(bad.status).toBe(1);
    const j = JSON.parse(bad.stdout);
    expect(j.ok).toBe(false);
    expect(j.results.map((r: any) => r.status)).toEqual(["OK", "NOT-VENDORED"]);
    expect(run().status).toBe(2);
  });

  it("CLI: vendor.mjs copies and reports; an unbuilt dist exits non-zero with a build hint", () => {
    const r = spawnSync(process.execPath, [join(SCRIPTS, "vendor.mjs"), app, "--dist", dist], { encoding: "utf8" });
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/6 file\(s\) copied/);
    const empty = join(root, "unbuilt", "dist"); mkdirSync(empty, { recursive: true });
    const u = spawnSync(process.execPath, [join(SCRIPTS, "vendor.mjs"), app, "--dist", empty], { encoding: "utf8" });
    expect(u.status).toBe(1);
    expect(u.stderr).toMatch(/not built/);
  });
});
