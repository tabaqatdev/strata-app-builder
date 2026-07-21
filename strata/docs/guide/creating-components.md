# Creating a new component, widget, panel, or plugin

The prerequisites and the exact recipe for extending strata-app-builder — a new **widget** (an `AppLayout` block), a
**panel** (a docked tool), a **plugin** (runtime extensibility), or a whole **package**. Everything here is
enforced by the conventions in `.claude/CLAUDE.md` and verified by the Vitest gate.

---

## Prerequisites (read before you add anything)

1. **Work inside `strata/`.** Run tooling from there: `cd strata && pnpm install` (pnpm workspace, Node ≥ 18).
2. **Know the two documents.** UI conforms to the **`AppLayout`** and maps to **`layers.json`** — both typed
   in **`@strata/schema`**. Never invent a parallel format; extend the schema if you need a new shape.
3. **Reuse the runtime rails, don't rebuild them.** Colors come from **`@strata/theme`**, cross-widget
   interactivity from the **`@strata/actions`** bus (the WIF), map/layer state from the **`@strata/state`**
   store, spatial ops from **`@strata/processing`**, Arcade from **`@strata/arcade`**. A new component *uses*
   these; it doesn't re-implement them.
4. **Keep the core dependency-light.** Heavy libraries (`echarts`, `@tanstack/react-virtual`,
   `@geomatico/maplibre-cog-protocol`, `maplibre-gl`) are **optional peer dependencies**, lazy-loaded with a
   graceful fallback. Add a hard dependency only inside a dedicated package.
5. **Two halves or it isn't done.** Ship the **runtime** (the component) *and* the **authoring default** (the
   `.claude` skill/command that makes Claude reach for it) — plus **Vitest tests** and a
   **[Human Language Reference](../reference/human-language.md)** row so recipes can suggest it.
6. **Theme with tokens, be bilingual-safe.** Style via the `--strata-*` CSS variables (so a theme swap
   restyles you); don't hard-code colors. Wrap user strings for `@strata/i18n` where relevant.

---

## Add a **widget** (an `AppLayout` block)

A widget is a React component registered by a `type` string, rendered by `<StrataApp>`.

1. **Write the component** in `packages/core-map/src/react/widgets/` (or `.../panels/` for a docked tool).
   It receives, automatically from `<StrataApp>`: its `id`/`widgetId`, the shared `bus`, the `outputs`
   registry, its `dataSource`, plus anything in the app `context` (e.g. `store`, `maplibregl`).
   - **To emit** (be a WIF *source*): `bus.emit({ type: "categorySelect", source: widgetId, payload })`.
   - **To react** (be a WIF *sink*): `bus.on("featureSelect", …)`, or consume another widget's output with
     the `useOutputData(dataSource.fromWidget)` hook.
2. **Export it** from the package `index.ts` and **register it** in
   `packages/core-map/src/react/app/registry.ts` under a kebab-case `type`.
3. **Add tests** in `packages/core-map/tests/react/` (render + interaction).
4. **Authoring half:** add a row to the `/app` and/or `/panel` command's widget list and the relevant skill
   (`strata-layout` / `strata-panels` / `strata-interactivity`), and a
   **[Human Language Reference](../reference/human-language.md)** entry.

## Add a **panel** (a docked/floating tool)

Same as a widget, but render inside **`PanelShell`** (it supplies the card chrome, fixed/floating layout, and
the Open/Remove menu) and accept a `bus` so it cross-filters. Register it as a `/panel <type>` and in the
widget registry if it should also work as an `AppLayout` widget.

## Add a **plugin** (runtime extensibility)

Use the `@strata/plugins` spine when the extension needs a lifecycle, project state, or URL parameters
(rather than being a layout block). Implement the `StrataPlugin` contract:

```ts
const myPlugin: StrataPlugin = {
  id: "my-plugin", name: "My plugin", version: "0.1.0",
  activate(app) { /* app.registerPanel / registerToolbarMenu / … */ },
  deactivate(app) { /* tear down */ },
  getProjectState() { return { … }; },          // optional: saved with the project
  applyProjectState(app, state) { /* restore */ },
  urlParameterNames: ["myparam"],                 // optional: deep-linkable
  handleUrlParameters(app, params) { /* read them on load */ },
};
```

Register it with the `PluginManager`. The bundled `plugin-search` / `plugin-routing` / `plugin-statusbar` /
`plugin-timeslider` are the reference implementations.

## Add a whole **package**

For a new capability that isn't UI (an evaluator, an analysis set, an exporter), add a package —
`@strata/arcade` / `@strata/theme` / `@strata/studio` are the recent examples:

1. `packages/<name>/` with `package.json` (name `@strata/<name>`, `type: "module"`, `main`/`types` → `dist`,
   `build`/`typecheck`/`test` scripts), a `tsconfig.json` extending `../../tsconfig.base.json`, a
   `vitest.config.ts`, and `src/` + `tests/`.
2. Keep **runtime dependency-free** where possible; declare heavy libs as **optional peer dependencies**.
3. **Register it in `strata/vitest.workspace.ts`** so its tests run in the suite.
4. Reference it from its consumers via `"workspace:*"`; run `pnpm install` to link.

---

## Definition of done (the gate)

- `pnpm build` clean · `pnpm test` green (new tests added; new package registered in the workspace).
- **Both halves** landed: runtime + the `.claude` authoring default.
- Docs updated: this repo's [`components.md`](../reference/components.md),
  [`human-language.md`](../reference/human-language.md), and any affected `strata/docs/**/*.md` — then
  **regenerate the help site** (`python3 strata/docs/help/build_site.py`).

## See also
- [Components, widgets & skills](../reference/components.md) — the inventory you're extending.
- [The style compiler](style-compiler.md) — how a renderer becomes MapLibre paint (the pattern for compilers).
- [Repository anatomy](anatomy.md) — where everything lives.
