---
name: qa
description: Verify a strata-app-builder app or a published layer — build, validate the map spec, check the FeatureServer, confirm rendering.
---

Quality gate. Run the relevant checks and report pass/fail with specifics:
- **Build/typecheck** the packages (`pnpm -r typecheck`).
- **Validate** every `layers.json` against `strata/packages/schema/src/layers.schema.json`.
- **Service check** — each ArcGIS/Strata layer URL returns JSON; `objectIdField` is `OBJECTID`; a
  `query?where=1=1&orderByFields=OBJECTID&f=json` returns features (points render only if this succeeds).
- **IP/brand** — MIT `LICENSE` + `DISCLAIMER.md` present; no Esri marks used as product/repo names; no
  secrets committed.
- **Docs** — every command has a `strata/docs/reference` entry and a `strata/docs/help` how-to.

Flag any failure; do not mark complete while a check fails.
