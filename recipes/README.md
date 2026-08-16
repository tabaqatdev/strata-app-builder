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


## Recipe anatomy — the contract

**This section is normative.** `/recipe` checks a recipe against it and **refuses to build one whose data
is unverified**.

### Two classes

| | **Reference recipe** | **Solution recipe** |
|---|---|---|
| Binds to | a universal, keyless, stable public source | real agency services chosen for one business problem |
| §3 Data | the source, its licence, and the fields used | role x authority x URL x fields x vintage x trap, per layer |
| §4 Verify | a probe of the live source with its **literal output** | the same, per layer, with traps numbered inline |
| Numbers on screen | illustrative | reproducible from §4 |

**Both classes need §4.** "The source is well known" is not verification — the USGS feed's ids are
*strings* and its `time` is epoch milliseconds, and a recipe that never probed would not know either.

### Three states, and only one is buildable

| State | What it has | May `/recipe` run it? |
|---|---|---|
| **Researched** | §§1–5 complete; endpoints curl-verified; §4 carries literal output | **Yes** |
| **Scaffold** | a name and a `Template:` line; §§1/3/4 are TODOs | **No** |
| **Stub** | a folder and a title | **No** |

A fabricated endpoint or field name is worse than a blank — it produces an app that looks finished and is
wrong.

### Required sections

**§1 Study** the decision this serves, the rules that decide it, and honest scope · **§2 UI design spec**
opening with a `Template:` line, a `ThemeSpec` with its contrast measurement, a capability sweep, and a
connections table (floor 3) · **§3 Data sources** per layer with the trap · **§4 Verify** the commands and
their **literal responses**, traps numbered · **§5 Build steps**, naming which path it targets · **§6
Verify the app** in its own terms · **§7 Harvest** gaps into `../strata/docs/troubleshooting.md` · **§8
Sources**.

*Section **names** are normative; numbering may differ where a recipe carries extra sections.*

### The `Template:` protocol

`Template: <id>` scaffolds from that silhouette; **`Template: open-design`** designs freely under the
freestyle charter ([`COMPONENT-MANIFEST.md`](COMPONENT-MANIFEST.md) §10), naming the silhouette in quotes.
Never fall back to a generic dashboard silently — keep the silhouette, stub the gap, record it in §7.

### If a section is missing

§3 or §4 missing ⇒ **stop**, and offer to run the probe. §1 ⇒ build but flag that the design cannot be
justified. §2 ⇒ ask, or design under `open-design` with confirmation. §5 ⇒ derive and confirm. §6 ⇒ fall
back to the build gate alone. **The builder never invents §3 or §4 content.**

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
