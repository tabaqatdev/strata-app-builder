# Reference-doc system & sync policy

> **Owner's note (why this exists).** strata-app-builder describes its component surface — every widget, node,
> trigger, action, command — in **four reference documents**, each answering a *different* question for a
> *different* reader. They necessarily share one **inventory** (the list of things that exist and their
> status). That shared list is the only thing that can silently drift. This page is the map of the four
> docs, the rule for where each lives, and the mechanism that keeps them honest: **code is the source of
> truth, and drift is a failing test.**

---

## 1. The four reference docs (the map)

| Doc | Path | Question it answers | Audience | On help site? |
|---|---|---|---|---|
| **Components & widgets** | `docs/reference/components.md` | *What is it?* (purpose/scope of every package, panel, widget, skill) | humans + Claude | ✅ yes (TOPICS) |
| **Human Language Reference** | `docs/reference/human-language.md` | *What do I say?* ("say this → you get" + status) | humans + Claude | ✅ yes (TOPICS) |
| **Command reference** | `docs/reference/commands.md` | *What do I type?* (every `/command`) | humans + Claude | ✅ yes (TOPICS) |
| **Component Manifest** | `../recipes/COMPONENT-MANIFEST.md` | *How do I configure it?* (exact props, bindings, triggers/actions, tokens) | Claude + recipe authors | ❌ no (by design) |

A fifth layer sits *behind* these — the **strategy / plan** docs (`.private/strategy/experience-builder-parity*.md`) answer *why / what's next* (roadmap, phases, on-hold items). They are private and out of the public repo; they feed the manifest via the **status convention** in §5.

**They do not overlap on content** — a glossary, a phrasebook, a command list, and a spec sheet are four different things. They overlap only on the **spine**: the enumerated set of components and each one's status.

---

## 2. The shared spine — and why it's allowed to be shared

The spine is: **the list of widgets, layout-node kinds, triggers, actions, and commands, plus each one's status** (shipped / partial / backend-needed / planned).

Duplicating the *spine* across four docs is fine **as long as it is never the source of truth.** The source of truth is the **code**:

| Spine element | Source of truth in code |
|---|---|
| Widget registry keys | `packages/core-map/src/react/app/registry.ts` → `defaultWidgetRegistry` |
| Triggers | `packages/actions/src/index.ts` → `StrataTriggerType` |
| Actions | `packages/actions/src/index.ts` → `StrataActionType` |
| Layout-node kinds | `packages/schema/src/types.ts` → `ContainerNode.kind` / `ViewsNode` / `AnimateKind` |
| Commands | `.claude/commands/*` |

Every doc is a **view** of that code, never an independent list. When code changes, the views must follow — enforced by §4.

---

## 3. Where each doc lives — and why

Storage is deliberate; **do not move these without reason.**

- **The three human docs live in `docs/reference/`** because they are on the generated, tabaqat-branded **help site** (they're in the `TOPICS` list in `docs/help/build_site.py`). Editing any of them triggers the site-regen rule (see `HELP-SITE.md`).
- **The manifest lives in the root `recipes/` workspace, off the help site, on purpose.** It is authoring fuel for Claude and recipe writers, not end-user help, and keeping it out of `docs/` avoids coupling it to the docs-site regeneration.
- **The strategy/plan docs live in `.private/strategy/`** (gitignored) — internal, never published.

This split is correct. The liability was never *where* they live; it's that the spine was hand-copied with no guard. §4 fixes that.

---

## 4. Keeping them alive — the sync policy

Four mechanisms, in priority order. Together they cover all four change sources (**code**, **docs**, **recipes/apps**, **strategy/plan**).

### 4.1 Code is the source of truth
Never "fix" a doc to match a mental model — fix it to match the code enums in §2. If the code and every doc disagree, the code wins.

### 4.2 A reconcile test makes drift fail CI *(the keystone — add this)*
A Vitest reconcile spec reads the enums from code and asserts the docs are complete and have no stale entries. This turns silent drift into a red test, matching the repo rule "add tests for any behavior change."

Spec (to live at `packages/core-map/tests/docs-reconcile.test.ts`, added to `vitest.workspace.ts`):

- **Load code truth:** import `defaultWidgetRegistry` (keys), `StrataTriggerType`/`StrataActionType` (from a literal array the union is derived from), and the node-kind list.
- **Load doc text:** read `../recipes/COMPONENT-MANIFEST.md` and `docs/reference/human-language.md` as strings.
- **Assert (both directions):**
  1. *No missing entry* — every registry key / trigger / action appears in the manifest, and every shipped widget appears in human-language.md.
  2. *No stale entry* — every widget the manifest documents still exists in the registry (catches renames/removals).
- **Keep it dumb** — substring/regex checks on the doc text are enough; the goal is a tripwire, not a parser.

### 4.3 Regen discipline (the human site)
Any edit to `docs/**/*.md` — including the three reference docs — must be followed by `python3 docs/help/build_site.py` (see `HELP-SITE.md`). The manifest is **exempt** (it's off-site); that exemption is the reason it needs the reconcile test in 4.2 instead.

### 4.4 The update matrix
When you change one thing, update these — in this order:

| You changed… | Update, in order |
|---|---|
| **Added / renamed a widget** | 1. `registry.ts` (code) → 2. `components.md` (what it is) → 3. `human-language.md` (what to say) → 4. `COMPONENT-MANIFEST.md` §3 (config) → 5. regen site → 6. reconcile test green |
| **Added a trigger / action** | 1. `actions/src/index.ts` → 2. `human-language.md` §8 → 3. `COMPONENT-MANIFEST.md` §4 → 4. regen → 5. reconcile green |
| **Added a layout node / animate kind** | 1. `schema/src/types.ts` → 2. `COMPONENT-MANIFEST.md` §2 → 3. `human-language.md` §7 → 4. regen → 5. reconcile green |
| **Added a command** | 1. `.claude/commands/*` → 2. `commands.md` → 3. `human-language.md` command column → 4. regen |
| **Shipped a "planned" item** | flip its status marker (see §5) from planned → shipped in every doc it appears in; reconcile test now requires it |
| **Changed strategy / roadmap** | edit `.private/strategy/*`; if it adds a *planned* component, add it to the manifest **only** as a `Planned (Phase N)` callout (never as shipped) |

### 4.5 One rule in CLAUDE.md
The above is summarized as a single convention in `.claude/CLAUDE.md` (next to the help-site rule) so it's enforced during authoring, not just at review.

---

## 5. Status vocabulary (unify across all docs)

The docs used to mark status three different ways. Use **one** key everywhere:

| Marker | Meaning |
|---|---|
| ✅ **shipped** | in code today; the reconcile test **requires** it in the docs |
| 🟡 **partial** | works with caveats / an optional dep (name the caveat) |
| 🔶 **backend** | needs a writable/authenticated ESRI backend |
| 🔷 **planned (Phase N)** | designed, not built; lives in the manifest **only** as a `Planned (Phase N)` callout and traces to a phase in the parity plan |

A `planned → shipped` transition is then a single, testable edit: build the code, flip 🔷→✅ in each doc, and the reconcile test flips from "ignore" to "require."

---

## 6. The design layer (views *on top of* the spine — not part of it)

A newer set of docs answers *"how should an app look and behave?"* rather than *"what exists?"*. They may
**cite** spine items but must never re-enumerate them (the reconcile test does not guard them):

| Doc | Question it answers |
|---|---|
| `docs/guide/app-design.md` | *How do I design a distinct, alive app?* (process, silhouette, wiring, theme rules) |
| `templates/README.md` + `templates/*.json` | *What ready-made shapes exist?* (the 30 serialized `AppLayout` templates, validated by `packages/schema/tests/templates.test.ts`) |
| `../recipes/COMPONENT-MANIFEST.md` **§10** | *How far may a bespoke design go?* (the freestyle charter + new-widget escape hatch) |

Rule: design guidance lives in `app-design.md`; exact config lives in the manifest; the roster lives in
`templates/`. When tempted to restate one inside another, cross-reference instead.

## 7. Related

- `HELP-SITE.md` — the Markdown→HTML site policy (the regen half of §4.3).
- `docs/reference/{components,human-language,commands}.md` — the three human reference docs.
- `../recipes/COMPONENT-MANIFEST.md` — the config manifest.
- `.private/strategy/experience-builder-parity*.md` — the roadmap that feeds 🔷 planned items.
- `.claude/CLAUDE.md` — where the one-line rule (§4.5) lives.
