# strata-popups skill pack

Author genuine ESRI `popupInfo` (rendered by `@strata/core-map`'s popup engine — full element model).

**Default rich, not a bare table.** When the data has a photo/attachment field or a set of related numeric
fields, lead with a **media element** (image or chart), then the key fields. A plain field table is the
fallback.

## Cheatsheet
`/popup <id> "…"` (map spec) · `/update-popup <id>` (published layer bundle + restart).

## Shape
`{ title:"{field}",
   expressionInfos:[{name:"percap", title:"GDP per capita", expression:"$feature.GDP / $feature.POP"}],
   fieldInfos:[{fieldName,label,visible,format:{digitSeparator,places}}, {fieldName:"expression/percap"}],
   description:"HTML with {field}/{expression/name} tokens",
   mediaInfos:[{type:"image", value:{sourceURL:"…/{PHOTO}.jpg"}},
               {type:"columnchart", value:{fields:["JAN","FEB","MAR"]}}],
   showAttachments:true,
   relatedRecords:{relationshipId:0, title:"Permits"} }`

## Recipes
1. **Media-first.** Image field → `mediaInfos image`; monthly/period fields → `columnchart`; category counts
   → `piechart`. Chart colors come from `@strata/theme` automatically.
2. **Derived value.** Add an `expressionInfos` Arcade line (GDP per capita, density) and surface it with a
   `fieldName:"expression/<name>"` row or `{expression/<name>}` in the title/description.
3. **Attachments / related.** `showAttachments:true` for a photo strip; `relatedRecords` for a child table
   (both read-only, work on Strata + ESRI, lazy-loaded).
4. Title from name field; show 4–6 fields with aliases; hide OID/id. Numeric: `format:{digitSeparator:true}`.
   Bilingual labels (AR + EN) via field aliases.

## Traps
Read real field names from the service. `format` applies to numeric fields only. Keep Arcade to the supported
subset (`$feature.X`, arithmetic, `When/Iif/Decode/Round/Text`, comparisons) — anything else shows blank.

- **Labels render but every value is blank on a MapServer layer.** `f=geojson` lower-cases every field
  name while FeatureServer preserves case, so a canonically-cased `popupInfo` resolves to `undefined`
  throughout. Core resolves exact-case then case-insensitively (`engine/popups.ts` `propValue`) — but any
  lookup **you** write needs the same tolerance.
- **A field can be published and empty on every row.** Profile `WHERE f IS NOT NULL AND f <> ''` before
  putting a field in a popup: one register's two headline fields are blank on all 62,306 rows.
- **A popup must name the caveat it inherits.** If a value is banded, apportioned or advertised rather
  than measured, say so in the popup — not only in the panel that produced it.
