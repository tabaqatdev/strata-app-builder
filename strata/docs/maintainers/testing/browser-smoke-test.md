# Browser smoke test — `@strata/core-map` (Layer 3)

The jsdom suites (Layers 1–2, `strata/packages/core-map/tests/react/`) prove component *logic* and
store↔component wiring, but they cannot render a real MapLibre map (no WebGL, no layout). This runbook
is the **feature-complete** check: drive the real app in a browser and confirm the map actually paints.

## Run it

Run this against any Strata app you have scaffolded (via `/new-app`) or any Vite app that mounts
`<StrataMap>` / `<StrataApp>`. Point the commands below at that app's directory.

Dev server:

```
cd <your-strata-app>
./node_modules/.bin/vite            # http://localhost:5173
```

Production build (removes React StrictMode's dev double-mount — use this to judge real render behavior):

```
cd <your-strata-app>
./node_modules/.bin/vite build && ./node_modules/.bin/vite preview   # http://localhost:4173
```

Then open the URL in a browser (or the in-app Browser pane).

## What to verify

| Check | How | Pass criteria |
|---|---|---|
| App boots, no crash | Browser console | No errors (React DevTools / vite HMR info lines are fine) |
| Bundle builds | `vite build` exit code | `exit=0`, one `dist/assets/index-*.js` emitted |
| Operational data loads | Network panel | The app's operational layer requests return `200` |
| MapLibre initializes | DOM | `canvas.maplibregl-canvas` exists; `.maplibregl-map` present |
| Layers render | Screenshot | The app's operational layers are visibly painted (styled per `drawingInfo`) |
| Chrome renders | Screenshot | Nav control (＋／－／compass), scale bar, "© OpenStreetMap \| MapLibre" attribution |
| Map fills container | JS below | canvas CSS size ≈ container size (see finding ⚠️ below) |
| Panels resize | Drag a panel's edge grip, then re-run the probe | The panel width changes, and the canvas **still** matches its (now different) container — the `ResizeObserver` did its job |
| Grips are keyboard-operable | `Tab` to a grip, then `←`/`→` (`↑`/`↓` on a top/bottom dock) | The panel resizes in 16 px steps, 48 px with `Shift` |

Canvas-vs-container probe (paste in the console):

```js
const c = document.querySelector('canvas.maplibregl-canvas');
const m = document.querySelector('.maplibregl-map');
({ canvas: [c.clientWidth, c.clientHeight], container: [m.clientWidth, m.clientHeight] });
// PASS when canvas ≈ container. FAIL if canvas is stuck at 400×300 in a larger container.
```

## Resolved finding ✅ — the map does not fill a late-sized container

**Fixed. Verified against `packages/core-map` on 2026-08-11 — do not re-apply the old workaround.**
`StrataMap.tsx` now observes its container and calls `controller.resize()` on every size change, plus once
after the first paint. Keep the check in the runbook: the *symptom* still appears when a map is built
inside a `hidden` container, where the boot-time `fitBounds` computes against nothing and revealing the
page resizes but never re-fits — **fit on first reveal**. A canvas reporting `[0, 0]` is a layout problem,
not a data one. Other core defects this runbook once tracked (StrictMode double-mount, `onReady` blocking,
MapServer field-case) are also fixed — see [`../../troubleshooting.md`](../../troubleshooting.md) §11.

The original finding, for the record:

Observed during the first Layer-3 run: the MapLibre canvas stayed at **400×300** (MapLibre's default for a
zero-size container at construction) inside a full-size `.maplibregl-map` container, so the map only painted
the top-left region.

Root cause is a real robustness gap in core-map, confirmed in code (not just this environment):

- `StrataMap` constructs the map once in an effect and wires **no `ResizeObserver`**.
- `MapController.resize()` exists (`engine/MapController.ts`) but **has no callers** — it's dead code.

So if the container has no measured size when the map is constructed and gets its real size *later*, the
canvas never recovers. This bites real scenarios: a map mounted in an initially-hidden tab / modal /
accordion, late flex/grid layout, or mobile late layout. (In this repo's headless Browser pane the effect is
amplified because a freshly-navigated tab can report `window.innerWidth === 0`.)

**Suggested fix (not yet applied — product change, needs sign-off):** in `StrataMap`, attach a
`ResizeObserver` on the map container that calls `controller.resize()` (debounced via
`requestAnimationFrame`), and call `controller.resize()` once after the first paint. Add a Layer-2 test that
asserts the observer is created and `resize()` is invoked on a size change.

## Toward automation

This runbook is semi-manual because WebGL can't run in jsdom. **The app side has already solved it without
adding a dependency:** the most recent builds ship a `drive.mjs` that talks to headless Chrome over the
DevTools Protocol with a hand-rolled client — roughly 200 lines, no Playwright, no Puppeteer — and asserts
the loop, the map-chrome geometry, both themes and the console. One build's driver runs 89 assertions
against the live page.

That is now the house standard, alongside a live suite and an offline render suite: see
[`../../guide/building-apps.md`](../../guide/building-apps.md) §3. The case for it is
blunt — in one build **297 passing assertions missed four defects that a single screenshot made obvious**,
all of them semantic or spatial. The static and render harnesses catch wiring and arithmetic; only
rendering catches meaning.

For CI-gating `@strata/core-map` itself, the same CDP approach applies: launch `vite preview`, assert the
canvas fills its container, that the GeoJSON requests return 200, and that the console is clean.
