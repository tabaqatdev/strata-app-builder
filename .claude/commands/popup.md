---
description: Author or update a layer's popup (ESRI popupInfo) from a natural description.
argument-hint: <layerId> "<what to show>"
---

Write a **genuine ESRI `popupInfo`** into the layer's `popupInfo` (map spec) — or into `popupInfo.json` in
the metadata bundle for a published layer (then restart).

**Default to a rich popup, not a bare field table.** When the data supports it, lead with a **media element**
— an image if there's an image-URL/attachment field, or a **chart** over related numeric fields (e.g. monthly
columns, a category breakdown) — then the key fields. `@strata/core-map`'s popup renderer supports the full
element model:

- `title` — a `{field}` template (e.g. `"{cityname_en}"`). May also use `{expression/<name>}` tokens.
- `fieldInfos[]` — one per field: `fieldName`, `label` (use the field alias; bilingual is fine), `visible`
  (hide OID/id fields), and `format` for numbers (`digitSeparator`, `places`). A `fieldName` of
  `"expression/<name>"` shows a computed value.
- `expressionInfos[]` — `{ name, title, expression }` **Arcade** (via `@strata/arcade`) for derived values,
  e.g. `"$feature.GDP / $feature.POP"` for GDP per capita. Reference as `{expression/<name>}`.
- `description` — an HTML template with `{field}`/`{expression/…}` tokens (data values are auto-escaped).
  When present it replaces the field table.
- `mediaInfos[]` — **image** (`{ type:"image", value:{ sourceURL:"…/{PHOTO}.jpg", linkURL } }`) or a
  **chart** (`{ type:"barchart"|"linechart"|"piechart"|"columnchart", value:{ fields:["JAN","FEB",…] } }`)
  rendered inline over the feature's own field values, colored from the `@strata/theme` palette.
- `showAttachments: true` — lazy thumbnail strip via `queryAttachments` (read-only; Strata + ESRI).
- `relatedRecords: { relationshipId, title?, fields? }` — a nested mini-table via `queryRelatedRecords`.

Read the real field names + aliases from the service (`.../<layer>?f=json`). Show the `popupInfo` JSON.

## Traps

- **Labels show, values are blank** — on a **MapServer** layer `f=geojson` lower-cases every field name
  (FeatureServer preserves case), so a canonically-cased `popupInfo` resolves to `undefined` throughout.
  Core resolves case-insensitively; any lookup you write needs the same tolerance.
- **Profile a field before you show it.** `WHERE f IS NOT NULL AND f <> ''` — a published field can be
  blank on every row, and a popup of empty labels reads as a broken app.
- **The popup carries the caveat it inherits.** If the value is banded, apportioned, or advertised rather
  than measured, say so in the popup — not only in the panel that produced it.
