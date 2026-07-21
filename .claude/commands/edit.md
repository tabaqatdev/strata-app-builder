---
description: Enable editing on a layer (update/add/delete features) via an EditPanel — requires a writable, authenticated ESRI backend.
argument-hint: <layerId> [--fields a,b,c] [--allow add,update,delete]
---

Add an **`EditPanel`** (`@strata/core-map/react/panels`) so the user can edit a selected feature — an
attribute form that **updates / adds / deletes** features via `@strata/feature-arcgis` `applyEdits`.

## Backend rule (read first)
Editing **requires a writable, authenticated backend**. Today that means an **ESRI Enterprise/Online
FeatureServer** with edit capability, authenticated through **`@strata/auth-arcgis`** (`createArcGISAuth` /
`ArcGISIdentityManager` / `ApiKeyManager`). **Strata Serve is read-only** — `@strata/auth-arcgis` throws for
a `strata` backend (`assertEsriBackend`). **Strata editing is planned**, not shipped. If the target layer is
Strata-served, tell the user and stop — don't scaffold an edit form that can't write.

## Steps
1. Verify the layer is an **ESRI FeatureServer** with edit capability (check `capabilities` in `?f=json`).
2. Set up auth via `@strata/auth-arcgis` (token / API key / OAuth); **never store or print passwords** — mint
   a short-lived, referer-bound token.
3. Configure the `EditPanel`: which `--fields` are editable, which operations `--allow`
   (add/update/delete). Read the real field names + types from the service.
4. Wire it: select a feature (identify) → the form loads its attributes → save calls `applyEdits`. The panel
   banner flags **writable + authenticated backend required**.

Report the panel config and the auth path used (never the secret).
