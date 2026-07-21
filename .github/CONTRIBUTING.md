# Contributing to strata-app-builder

Thanks for your interest in improving **strata-app-builder** — a template for building advanced GIS web apps on
Strata / ArcGIS Server, rendered on MapLibre GL JS via the ESRI Web Map JSON specification.

## Getting set up

This is a **pnpm** workspace. The code lives under `strata/` and the publishable packages live in
`strata/packages`.

```bash
# from the repo root
pnpm install:all      # -> pnpm -C strata install
pnpm build            # -> pnpm -C strata build
pnpm typecheck        # -> pnpm -C strata typecheck
pnpm test             # -> pnpm -C strata test
```

You can also work directly inside `strata/` with the usual `pnpm -r <script>` commands.

- **Node 20** and **pnpm 9** (see `packageManager` in `package.json`).
- Every package must pass `typecheck`, `build`, and `test` before a PR is merged. CI runs all three.

## Repository layout — keep the root minimal (a rule)

The repo **root is the first thing a user sees**, so keep it clean. The things that belong at the
visible root are `README.md`, `llms.txt`, `LICENSE`, `package.json`, the `recipes/` workspace, and the
`strata/` library. Put everything else out of sight: **the library — all code/docs/reference — under
`strata/`** (users build in the root `recipes/`); community-health files and CI here in **`.github/`**; the
authoring layer in **`.claude/`**. Before adding a top-level entry, ask whether it truly must live at the
root — if not, it goes under `strata/`. Private/local material lives in
gitignored dot-folders (`.private/strategy/`, `.private/solution_recipes/`) and must never be committed.

## Testing

Tests use **Vitest**. Each package with testable logic has a `tests/` directory and its own
`vitest.config.ts` + `test` script; a root `strata/vitest.workspace.ts` runs the whole suite at once.

```bash
cd strata
pnpm test                                   # every package (166 tests today)
pnpm --filter @strata/core-map test         # one package
pnpm --filter @strata/core-map exec vitest  # watch mode for one package
```

Coverage today spans the deterministic core: the style compiler, the state store (undo/redo, round-trip),
the actions bus, i18n, Turf processing, export (CSV/GeoJSON/spec), the publish renderer, schema validation
(ajv), the plugin manager, the search/routing providers (mocked `fetch`), the ArcGIS adapters, and the
identify/popup helpers. **Add tests for any behavior change**, especially the style/popup compilers, and
keep the new package listed in `strata/vitest.workspace.ts`.

## Docs: Markdown for Claude, HTML for humans

`strata/docs/**/*.md` is the source of truth (also read by Claude). The **human help site** under
`strata/docs/help/` is **generated** from those Markdown files. **When you change any doc Markdown,
regenerate the site** so it doesn't drift:

```bash
pip install --user markdown
python3 strata/docs/help/build_site.py
```

Never hand-edit `strata/docs/help/*.html`. To add/remove a page, edit the `TOPICS` list in `build_site.py`.
See `strata/docs/HELP-SITE.md` for the full policy.

## The one non-negotiable rule: the ESRI Web Map spec

strata-app-builder is built on the **ESRI Web Map JSON specification**. This is not a style suggestion — it is
the contract the whole system depends on:

- The map spec (`layers.json`) is aligned to the ESRI Web Map JSON spec (`operationalLayers`, `baseMap`,
  `spatialReference`, `initialState`).
- **Styling is genuine ESRI `drawingInfo`**; **popups are genuine ESRI `popupInfo`**. Do **not** invent a
  styling DSL. Write the ESRI JSON and let `@strata/core-map`'s style compiler map it to MapLibre.
- The style compiler (`strata/packages/core-map/src/engine/styleCompiler.ts`) is the crown jewel. If you
  extend renderer support, add unit tests in `strata/packages/core-map/tests/` alongside it.

Everything is **EPSG:4326**. Reproject on the way in.

## Building a plugin / package

New capabilities are added as packages under `strata/packages`. To add one:

1. Create `strata/packages/<your-package>/` with its own `package.json`, `tsconfig.json`, and `src/`.
2. Depend on siblings with the pnpm `workspace:*` protocol (e.g. `"@strata/schema": "workspace:*"`).
3. Wire scripts (`build`, `typecheck`, and `test` where applicable) so the `-r` recursive commands and CI
   pick it up automatically.
4. Add an example or docs entry so users can discover it.

## Pull requests

- Keep PRs focused; one logical change per PR.
- Include tests for behavior changes, especially anything touching the style/popup compilers.
- Make sure `pnpm -r typecheck`, `pnpm -r build`, and `pnpm -r test` pass locally.
- Fill out the PR template.

## Conduct & security

Participation is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). For security issues, please
follow the [Security Policy](./SECURITY.md) rather than opening a public issue.
