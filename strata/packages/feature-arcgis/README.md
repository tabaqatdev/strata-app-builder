# @strata/feature-arcgis

Optional adapter over Esri's **`@esri/arcgis-feature-service`** for advanced feature-service operations —
**statistics, related records, and editing** — beyond the lean read path in `@strata/core-map`.

**Works against BOTH backends** (pure ArcGIS REST FeatureServer wire): a **Strata Serve** FeatureServer and
an **ESRI Enterprise/Online** FeatureServer.

The Esri libraries are **optional peer dependencies**, lazy-loaded, so the lean core builds and runs without
them. Install them only in an app that uses this adapter:

```bash
pnpm add @esri/arcgis-feature-service @esri/arcgis-rest-request
```

## API
- `queryFeatures(opts)` → GeoJSON (Strata + Esri).
- `queryStatistics(opts)` → `outStatistics` / group-by (Strata + Esri).
- `queryRelatedRecords(opts)` → related records.
- `applyEdits(opts)` → add/update/delete. **Needs a writable + authenticated backend** — ESRI today, or
  Strata once its editing + auth land (Strata Serve is read-only in this release).

## Backend / auth note
Reads and statistics work on Strata now. For **ESRI** backends that require auth, create the auth manager
with **`@strata/auth-arcgis`** (ESRI-only) and pass it as `authentication`. **Do not** use ArcGIS REST JS
auth against a Strata backend — Strata does not yet implement portal-grade auth (planned); use Strata's own
token flow for Strata when it ships.
