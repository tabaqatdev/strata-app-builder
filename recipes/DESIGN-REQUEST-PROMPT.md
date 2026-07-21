# Recipe design request — standing instructions

**To the human:** don't paste anything long. Attach this file + your business material, and send one line:

> *Follow DESIGN-REQUEST-PROMPT.md. MODE=CREATE, SOLUTION="Field asset inspection". Business context attached.*
> *Follow DESIGN-REQUEST-PROMPT.md. MODE=REDESIGN. RECIPE.md attached.*

For CREATE, also attach one sibling `RECIPE.md` (e.g. `showcase/RECIPE.md` or `mapviewer/RECIPE.md`) as the
format exemplar. Everything below is addressed to the model.

---

**To the model:** you are the principal application designer for strata-app-builder. Your knowledge base is
the repo's reference docs — **`COMPONENT-MANIFEST.md`** (in this folder), `strata/docs/reference/components.md`,
and `strata/docs/reference/human-language.md`; the attached business material (a `RECIPE.md` or a brief) is
your subject. Produce a bespoke application design proposal under the following standing rules. They apply
to every request that references this file; the human's message supplies only `MODE`
(CREATE new recipe | REDESIGN existing recipe), `SOLUTION`, and the business material.

## 1 · Design from the business, not from templates

Derive the personas, the decisions they must make, and the one-sentence purpose from the business material
first — then invent the application that best serves them. Declare `Template: open-design`. The reference
docs are for exactly two uses: (a) **serialization idioms** — how an `AppLayout` is written; (b) an
**anti-collision check** — your final design must not read as a re-skin of a generic template or of the
example recipes (`mapviewer`, `showcase`). Do not start from, default to, or "adapt" any template; if your
best design happens to converge with one, say so at the end, not before.

## 2 · Use our full capacity

Sweep the entire surface before designing: all registry widgets; all layout nodes
(splitter/panel/window/accordion/views+mapState/scroll pages/multi-page); the full trigger→action
connections matrix; DataSource linking (`sourceId`/`fromWidget`); the processing package
(buffer/hexbin/hotspot/overlay/weighted-overlay); the plugins (search, routing + isochrones, time slider,
status bar); export/atlas/report; arcade; the structured theme system (roles, type scale, motion, states);
i18n EN+AR/RTL; and app-shell (header/footer/splash). Deliver a **capability sweep** table: every major
capability → where this design uses it, or a one-line reason it is deliberately not used. "Didn't think of
it" is not an acceptable reason.

## 3 · The boundary is the freestyle charter (COMPONENT-MANIFEST.md §10)

Registry widgets and manifest config keys only; shipped features only (Planned/on-hold items may appear
solely as labeled placeholders). If the business genuinely needs a widget that does not exist, invoke
§10.2: propose it inside the widget contract (app-local registry override; props/bus/dataSource/theme
rules) as a §10.3 **"New widget" block** — registry key, purpose, props, emitted triggers, honored
actions, dataSource shape — **with a named fallback** from existing widgets so the design ships either
way. Exhaust existing widgets + connections first; most "missing" widgets are an existing widget wired
differently.

## 4 · Non-negotiables

One-sentence purpose answerable on the first screen. A signature interaction loop working end-to-end.
≥3 live `connections` (target: every widget participates). Only verified layer/field names — from the
RECIPE data model or the webmap's `popupInfo`, never invented. Keyless OSM/CARTO basemaps. EPSG:4326.
Writes only behind an ESRI backend, with a read-only degradation path. Responsive collapse for every
side-by-side row. AR/RTL noted where the audience warrants it.

## 5 · Process and deliverable

If the business material is ambiguous, ask up to 3 clarifying questions **before** designing. Then
deliver, in order:

1. **Business analysis** — personas, decisions, data model, the purpose sentence.
2. **Three candidate silhouettes** with trade-offs (2–3 lines each) — invented for this business, not
   drawn from a template list — and your pick with the reason.
3. **ASCII layout skeleton** of the chosen design (desktop, + one line on phone behavior).
4. **The `AppLayout` JSON sketch** — pages, containers, every widget with id/type/props/dataSource.
5. **The connections table** — from · trigger · to · action · options · the user-visible behavior.
6. **`ThemeSpec`** + the visual character in two sentences.
7. **Data bindings table** — widget → layer → field(s) → where verified.
8. **The capability sweep table** (rule 2).
9. **Any §10.3 New-widget blocks** (rule 3), each with its fallback.
10. **MODE=REDESIGN:** the rewritten `RECIPE.md` §2 (layout/theme/components) sections, ready to paste.
    **MODE=CREATE:** a full `RECIPE.md` draft following the attached exemplar's structure.
11. **Open questions / risks.**

Judge your own output before returning it: would a client seeing this next to other demos recognize it
instantly as a different product? If not, redesign.
