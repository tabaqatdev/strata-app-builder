# ADR 0001 — React is the default UI layer; the core stays framework-agnostic

- **Status:** Accepted
- **Date:** 2026-07-15
- **Deciders:** strata-app-builder maintainers
- **Applies to:** `@strata/core-map` and any future UI package

## Context

strata-app-builder builds GIS web apps on MapLibre GL JS, driven by ESRI Web Map JSON
(`layers.json`) and an `AppLayout` JSON layout engine. Someone reasonably asked
*"why React, and is it better to have it or not?"* — and the answer was not written
down anywhere. This ADR records the decision and, more importantly, the boundary
that keeps the decision cheap to revisit.

The key architectural fact: **MapLibre GL JS does the actual map rendering.** The
hard, valuable work lives in framework-agnostic packages:

- `@strata/core-map` — the ESRI `drawingInfo`/`popupInfo` → MapLibre style compiler
  (React is only the wrapper around this engine)
- `@strata/state` — a framework-agnostic Zustand store (layers, selection, view, basemap)
- `@strata/actions` — a zero-dependency data-action bus
- `@strata/schema`, `@strata/processing`, `@strata/export`, `@strata/i18n` — plain TS
- `@strata/plugins` and the `@strata/plugin-*` packages — plain-DOM, `app.getMap()` only

React appears in exactly one place: the app/panel/widget UI inside `@strata/core-map`
(`StrataMap.tsx`, the panels, controls, and widgets).

## Decision

1. **React is the default UI layer** for the app shell, panels, controls, and the
   widget/layout engine (`<StrataApp>`, `AppLayout` → `LayoutNode` → `WidgetNode`).
2. **The core is and stays framework-agnostic.** No React (or any UI framework)
   dependency may leak into `@strata/state`, `@strata/actions`, `@strata/schema`,
   `@strata/processing`, `@strata/export`, `@strata/i18n`, `@strata/plugins`, or the
   `@strata/plugin-*` packages. React is a *replaceable skin*, not a foundation.

## Rationale

- **The engine isn't React.** MapLibre renders the map; React only manages the chrome.
  Swapping React for Svelte/Solid would rewrite the skin and gain almost nothing.
- **The layout model is already declarative.** `AppLayout` JSON → component tree → widget
  registry is exactly the "config drives a component tree" shape React was built for.
  Plain DOM would mean hand-writing reconciliation we get for free.
- **Audience fit.** The integrators extending strata-app-builder overwhelmingly already know
  React; it's the default expectation for a GIS-app SDK and lowers the barrier for the
  target user.
- **Cost already paid cleanly.** Because state/actions/schema/plugins are framework-agnostic,
  a future UI-framework change is contained to one package.

## Consequences

- **Positive:** rich, declarative app UI with an idiomatic React ecosystem (Zustand, widget
  registry); the map engine and all data/logic packages remain portable; a UI-framework
  change is a `core-map`-local rewrite, not a rewrite of the project.
- **Negative / cost:** a React runtime is dead weight for a *tiny embeddable* single-map
  widget. strata-app-builder already hedges this — the `plugin-*` packages and status bar are
  plain-DOM (`app.getMap()` only), so the lightweight path exists alongside the React app path.

## When to revisit

- The primary product becomes a **tiny embeddable widget** where React's bundle/hydration
  cost dominates → prefer the existing plain-DOM path or web components.
- We need to **embed into many foreign host frameworks** (Vue, Angular, static sites)
  without shipping a React runtime → consider a web-components core.

Until then: keep React for the UI, and **guard the boundary** — reject any PR that imports
React into a core (non-UI) package.
