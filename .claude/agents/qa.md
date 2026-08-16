---
name: qa
description: Verify a strata-app-builder app or a published layer — build, validate the map spec, check the FeatureServer, confirm rendering.
---

Quality gate. Run the relevant checks and report pass/fail with specifics:
- **Build/typecheck** the packages (`pnpm -r typecheck`).
- **Validate** every `layers.json` against `strata/packages/schema/src/layers.schema.json`.
- **Service check** — each ArcGIS/Strata layer URL returns JSON; read `objectIdFieldName` from the
  response (**a service you did not publish may use `FID`, `OBJECTID_1`, or report `null`** — see
  `strata/docs/troubleshooting.md` §1), then confirm
  `query?where=1=1&orderByFields=<that field>&f=json` returns features (points render only if this
  succeeds). Also assert the count agrees with a `returnIdsOnly` fetch.
- **IP/brand** — MIT `LICENSE` + `DISCLAIMER.md` present; no Esri marks used as product/repo names; no
  secrets committed.
- **Docs** — every command has a `strata/docs/reference` entry and a `strata/docs/help` how-to.

## When the target is a built app, not a package

The gate is `strata/docs/guide/app-design.md` §7 (design) and `strata/docs/guide/building-apps.md` §7
(build). Walk both line by line and report the counts:

- **Three suites, all green** — `test-<domain>.mjs` (live) · `test-render.mjs` (offline) ·
  `drive.mjs` (real headless Chrome). They are blind to different classes of defect: a green offline
  suite has reported **99/99 on an app that was a blank shell**, and **297 green assertions once missed
  four defects a single screenshot made obvious**. Two suites is not a pass.
- **`test-render.mjs` must `node --check` the shipped module first**, and that guard must itself be
  negative-tested.
- **No hardcoded counts** — every figure derived from state.
- **Data honesty** — every field name traced to a real response; every headline number reproducible from
  a command in the recipe's §4; nothing synthesized; every cap visible on screen.
- **Contrast measured in both themes**, not eyeballed.
- **It runs** — busy port steps rather than crashing, path traversal refused, console clean, and the app
  opens on a view where its own signature is visible (confirm by screenshot).

Flag any failure; do not mark complete while a check fails. **Never report a partial pass as a pass** —
say which section failed and why.
