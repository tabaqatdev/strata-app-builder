# recipes — your workspace

This is where **you build**. The `strata/` folder is the library (the packages, docs, and reference
proxies) — you don't need to touch it. Work here, in `recipes/`, using the `.claude` commands.

A **recipe** is a reproducible path from an idea to a working app on strata-app-builder: a **spec + a
prompt-script** (successive `.claude` prompts that build and style the app on a fresh project), plus a **UI
design spec** and a **verification** section.

## Layout

```
recipes/                    ← your workspace (this folder)
  README.md               ← you are here
  COMPONENT-MANIFEST.md   ← the component-config reference (how to configure every component/binding/token)
  DESIGN-REQUEST-PROMPT.md ← standing instructions for designing a bespoke app from business requirements
  mapviewer/              ← example recipe: map-centric authoring app
  showcase/               ← example recipe: the kitchen-sink multi-page app
```

## Example recipes

- **[mapviewer](mapviewer/RECIPE.md)** — a map-centric **authoring** SPA that explores ArcGIS FeatureServer
  endpoints, adds GeoParquet / COG / Parquet & feature-service tables, keeps registered ArcGIS server
  connections + credentials at the app root (ArcGIS-Pro/QGIS style), and **opens/authors/saves ESRI Web Map
  JSON** (`layers.json`) for embedding. It embeds as a headerless map control inside any other app.
- **[showcase](showcase/RECIPE.md)** — the **kitchen-sink** multi-page app on the `<StrataApp>` engine that
  exercises the entire shipped surface (every control, panel, widget, layout node, the interactivity bus,
  DataSource model, analysis, time, i18n, theming, export). A living catalogue of what the template can build.

## Building your own

Run **`/new-app`** in Claude Code for a guided build, or **`/recipe <name>`** to run one of the example
recipes' guided wizards. When authoring, configure widgets and wire `connections` from
**[COMPONENT-MANIFEST.md](COMPONENT-MANIFEST.md)** and phrase prompts using the
**[Human Language Reference](../strata/docs/reference/human-language.md)**. Preserve the ESRI Web Map JSON
contract on every path.

To design a bespoke app from business requirements, follow
**[DESIGN-REQUEST-PROMPT.md](DESIGN-REQUEST-PROMPT.md)** — standing instructions that take a solution brief
and produce a full application design (personas → candidate silhouettes → `AppLayout` sketch → connections →
theme → capability sweep).

> **Business solution recipes** (proprietary Strata deliverables) are kept in the gitignored
> `.private/solution_recipes/` and are **not** part of this public repo.
