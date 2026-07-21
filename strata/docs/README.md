# strata-app-builder documentation

**strata-app-builder is a Claude Code template for building advanced GIS web applications** on Strata or an
ArcGIS Server, rendered on MapLibre GL JS using the ESRI Web Map JSON specification.

> 🌐 **Prefer a browsable site?** Open **[`help/index.html`](help/index.html)** — the same docs as a
> tabaqat-branded HTML help site. These Markdown files are the source (and what Claude reads); the site is
> generated from them (see [HELP-SITE.md](HELP-SITE.md)).

Start here, then dive in:

## Getting started
- [**Getting started**](getting-started.md) — the on-ramp: mental model, install & build, the trio, first
  run, and the build workflow.
- **`/new-app`** — guided wizard: interview → scaffold → install. **`/guide`** — decide. **`/help`** — look
  up. **`/what-can-i-do`** — full capability list.
- Basemaps default to **open-source, OpenStreetMap first** (keyless — OSM · CARTO · OpenTopoMap).

## Guide (how it works, per component)
- [Repository anatomy](guide/anatomy.md) — what every folder/file is.
- [Sample map templates](guide/map-templates.md) — the four starter maps first run copies into your app.
- [The style compiler](guide/style-compiler.md) — ESRI `drawingInfo` → MapLibre paint.
- [Creating a new component/widget/plugin](guide/creating-components.md) — prerequisites + the recipe for
  extending the core.
- [Application design](guide/app-design.md) — silhouette-first design process, layout/wiring/theme rules,
  complexity tiers, ship checklist. Companion assets: the **[app template roster](../templates/README.md)**
  (30 serialized `AppLayout` templates + two galleries) and the **freestyle charter**
  (`../recipes/COMPONENT-MANIFEST.md` §10) for bespoke designs.

## Help (task how-tos)
- [Create an app in a layout](how-to/create-app-layouts.md) — full-page, in-scroll, split, synced multi-map.
- [Create & change symbology](how-to/symbology.md)
- [Publish data to the server](how-to/publish-data.md)
- [Export maps](how-to/export-maps.md)
- [CORS & proxy](how-to/cors-and-proxy.md) — blank layers = CORS; dev-proxy, Serve CORS, or the reference proxies.

## Reference
- [Components, widgets & skills](reference/components.md) — the inventory: purpose/scope of every piece and
  how they work together.
- [Human Language Reference](reference/human-language.md) — the phrase to ask for each component (recipe fuel).
- [Command reference](reference/commands.md)
- Schemas: `../packages/schema/src/layers.schema.json`, `../packages/schema/src/catalog.schema.json`.

## Recipes (build a whole app)
- [**Using recipes**](how-to/using-recipes.md) — launch one like an Instant App: `/recipe <name>` → guided
  wizard → confirm → build.
- [Recipes overview](../../recipes/README.md) — the `recipes/` workspace: the two example recipes
  (`mapviewer`, `showcase`) + the component-config reference. Build your own with `/new-app`.
- **Solution recipes are private.** The proprietary business solution recipes live in the gitignored
  `.private/solution_recipes/` and are **not** part of the public repo.

## Maintainers
- **Contributing + testing:** see [`CONTRIBUTING.md`](../../.github/CONTRIBUTING.md) (Vitest, `pnpm test`).
- Test tooling and coverage live under [`maintainers/testing/`](maintainers/testing/).

## Also
- [FAQ](faq.md) — phrased as the questions people ask an AI.
- [Troubleshooting / known traps](troubleshooting.md)
- [`llms.txt`](../../llms.txt) — for crawlers and LLMs.
