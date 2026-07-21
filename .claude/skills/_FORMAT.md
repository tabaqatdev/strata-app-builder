# Skill-pack format (adopt this structure)

Harvested from the Strata GeoAI `skills/` packs (Analysis-Reuse-Map §9). Every `SKILL.md` in this folder
should follow the same five-part shape so the agent gets a *cheatsheet → worked examples → authoritative
reference → traps* progression, plus a shared question-pattern index for routing.

```
# <name> skill pack
<one-line purpose>

## 1. Cheatsheet
The commands/props at a glance — one line each. `/command <args>` · key prop signatures. No prose.

## 2. Recipes (10–20 worked examples)
The heart of the pack: concrete, copy-pasteable examples with REAL JSON args, each 2–5 lines:
  ### Choropleth by a numeric field
  `/symbology <layer> --class-breaks <field> --classes 5 --ramp blues`
  → writes `drawingInfo.renderer = { type:"classBreaks", field, classBreakInfos:[…] }`
Cover the common asks a person actually phrases (draw from docs/reference/human-language.md).

## 3. Reference (authoritative)
The genuine ESRI/spec JSON this skill emits — renderer/popupInfo/layerDefinition shapes, field types,
enum values — with a link to the canonical spec (developers.arcgis.com / the web-map spec). Curated
excerpts, not a dump.

## 4. Known traps
The mistakes this domain invites, stated as rules (mirror strata-app-builder CLAUDE.md "Known traps"):
  - `objectIdField` is always `OBJECTID`; a string source id ⇒ omit it so the OID is synthesised.
  - Polygon fills need low alpha (~40/255) so overlapping layers stay readable.
  - Don't use `esriSMSPath`; use `esriSMSCircle`/`Square`/…

## 5. Question patterns (routing index)
A short list mapping how a person asks → which recipe answers it, so the router can pick this pack:
  - "colour X by <field>" → §2 Choropleth
  - "show only X where …" → the /filter recipe
```

## Why this shape
- **Cheatsheet** = fast recall; **Recipes with real args** = the biggest quality lever (frontier models
  reproduce concrete JSON far better than prose); **Reference** keeps the emitted JSON spec-correct;
  **Traps** prevent the domain's classic mistakes; **Question patterns** make the pack discoverable.
- Keep each pack **runnable and honest** — every recipe should map to a shipped command/prop, and flag any
  capability that isn't shipped (editing, Ask) rather than implying it works.

## Adopting it
The current packs already have a strong **Cheatsheet** + details; the upgrade is to (a) split the worked
examples into an explicit **§2 Recipes** block with JSON args, (b) add a **§3 Reference** link + shape, and
(c) add a **§5 Question patterns** index. `strata-charts` and `strata-symbology` are good pilots.
