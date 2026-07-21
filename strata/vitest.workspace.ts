/**
 * Vitest workspace — run every package's suite from the repo root with a single `vitest` invocation.
 * Each package also carries its own `vitest.config.ts` and a `pnpm test` script, so suites can be run
 * per-package too. Add a package here when it gains a `tests/` directory.
 */
export default [
  "packages/schema",
  "packages/state",
  "packages/actions",
  "packages/data-source",
  "packages/arcade",
  "packages/theme",
  "packages/studio",
  "packages/i18n",
  "packages/processing",
  "packages/export",
  "packages/data-management",
  "packages/plugins",
  "packages/plugin-search",
  "packages/plugin-routing",
  "packages/feature-arcgis",
  "packages/auth-arcgis",
  "packages/basemap-arcgis",
  "packages/core-map",
];
