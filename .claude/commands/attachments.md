---
description: Add an attachment viewer to a layer — page through features and view image/video/PDF attachments.
argument-hint: <layerId>
---

Add an **`AttachmentViewer`** panel (`@strata/core-map/react/panels`) so the user can page through a layer's
features and view their **image / video / PDF attachments**. Backed by `queryAttachments()` in
`@strata/feature-arcgis` (a dependency-light REST fetch; works against **both Strata and Esri**
FeatureServer backends — read-only, no auth needed for public services).

## Steps
1. Confirm the FeatureServer layer **has attachments enabled** (`hasAttachments: true` in `?f=json`).
2. Configure the `AttachmentViewer` bound to the layer (`mapId` + `layer_id`); optionally pair it with
   identify so selecting a feature on the map jumps the viewer to that feature.
3. The viewer pages feature-by-feature and renders each attachment by MIME type (image/video/PDF).

Note this is **viewing only** — to *edit* attachments (add/remove) you need a writable, authenticated ESRI
backend (see `/edit`). Keep everything EPSG:4326.
