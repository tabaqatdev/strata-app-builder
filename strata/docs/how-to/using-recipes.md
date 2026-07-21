# How do I use recipes?

A **recipe** is a complete, reproducible path from an app idea to a working app on strata-app-builder. You launch one
the way you'd launch an **ArcGIS Instant App**: pick a template, answer a short wizard, confirm, and Claude
builds it — ESRI Web Map JSON preserved throughout.

## What a recipe is

Three parts:

- **A spec** — the app's purpose, UI design, data sources, and verification criteria.
- **A prompt-script** — consecutive `/…` commands that, run in order on a fresh project, create the map, add /
  convert / publish layers, style them, write popups, assemble panels and widgets, apply the layout and theme,
  and export.
- **A guided wizard** — an Instant-App-style configuration wizard (a short, grouped set of questions with
  sensible defaults) that Claude runs *before* the prompt-script to collect your app's properties.

## Launch one like an Instant App

```
/recipe showcase
```

Or just describe the app — *"build the showcase app"* — and Claude finds the recipe. Either way the flow is:

1. **Wizard** — Claude reads the recipe's `## Guided wizard` section and asks each group of questions (in
   Cowork, one multiple-choice screen per group; in the CLI, a short numbered interview). Every wizard shares
   four common steps — **App title · Data source · Theme/language · Export** — plus the **template-specific**
   settings that mirror that Instant App's options.
2. **Confirm** — Claude echoes a one-line summary of your choices and waits for a go-ahead.
3. **Build** — Claude runs the recipe's prompt-script with your answers, then prints the run command and works
   through the recipe's verification checklist.

The wizard **only collects properties** — it never invents data or scope beyond the recipe, and it surfaces
any side-effecting step (like publish or install) for confirmation first. Run `/recipe` with no argument to
list the available recipes and pick one.

## The Instant Apps program

Two example recipes ship and show the pattern end to end: **`mapviewer`** (a map-centric authoring app) and
**`showcase`** (a kitchen-sink multi-page app that exercises *every* strata-app-builder panel, plugin, widget,
layout, and data path). Use them as startup templates and as a reference for how a recipe is written. They
live in the **`recipes/`** workspace at the repo root, alongside `COMPONENT-MANIFEST.md` (the
component-config reference).

## Public vs private recipes

- **Public** — the two example recipes **`mapviewer`** and **`showcase`**, under `recipes/` at the repo root.
- **Private** — the **business solution recipes** are proprietary Strata deliverables kept in the gitignored
  `.private/solution_recipes/` at the repo root. They are **not** in the public repo; a public clone won't
  have them.

## Anatomy of a recipe

Every recipe follows six stages plus the wizard:

1. **Research** — the domain and the reference apps (cited).
2. **UI design spec** — layout, KPIs, charts, tables, infographics, theme, typography (front-loaded).
3. **Data sources** — the exact feature-service URLs and how each maps to the app.
4. **Prompt-script** — the consecutive `/…` prompts that build and style the app.
5. **Verify** — pass criteria, benchmarked against the reference app.
6. **Harvest** — any gaps found become strata-app-builder issues/PRs.

And the **`## Guided wizard`** section — the configuration questions Claude runs at launch.
