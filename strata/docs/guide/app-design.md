# Application design guideline

How to design a strata-app-builder application — an [`AppLayout`](../../packages/schema/src/types.ts) rendered by
`<StrataApp>` — so that it is **visually distinct, immediately interactive, and honest about its data**.
This is the guideline the app templates in [`strata/templates/`](../../templates/README.md) follow; use it
whether you start from one of those templates or design from a blank page.

## The design process

Design in this order, and resist skipping ahead to widgets:

1. **Purpose** — write the one sentence the app answers ("which zone am I in?", "how is the network doing
   right now?", "review these field photos"). One app, one sentence.
2. **Silhouette** — pick the archetype whose *shape* matches the purpose (below). The silhouette is chosen
   before any widget is.
3. **Template** — start from the closest file in `strata/templates/` and keep its skeleton and signature
   wiring; or go open-design and obey the same rules.
4. **Slot content** — bind real layers and verified fields into the template's regions.
5. **Wire** — author `connections` until the signature loop works end-to-end.
6. **Theme** — one `ThemeSpec`, one accent, deliberate dark-or-light.
7. **Verify** — the checklist at the end of this page.

## 1 · Choose the silhouette first

Apps read as one of four families. Within a product suite or demo gallery, adjacent apps should come from
*different* families whenever possible:

| Family | Shapes | Reach for it when |
|---|---|---|
| **Map-centric** | full map + folding/tabbed panel, floating dock, banner-over-map, minimal embed | the map *is* the product and tools serve it |
| **Dashboard** | KPI strip + boxed map + charts, KPI rail, extent scoreboard, swappable views | numbers are the product and the map is evidence |
| **Web page & narrative** | hero + cards, scroll story with pinned map, guided steps, article with inline maps, time player | the audience reads or is guided, rather than operates |
| **Grid** | synced multi-map, checkerboard, collage, reading-pane + map, destination cards | comparison or parallel views are the point |

Two hard rules from the template roster:

- **Silhouette first.** Two apps shown side by side must differ at a glance — before any color or logo is
  seen. A dashboard next to an editorial scroll-story next to a split-screen compare always works; three
  "map with a left panel" apps in a row never does.
- **Ration the look-alikes.** Sidebar viewers, ranked lists, nearby finders, zone lookups, and chart boards
  all render as "map + left panel". Use at most two of them per suite, and let each lead with its signature
  accent (the buffer ring, the rank numerals, the clickable legend chips, the brushable charts).

## 2 · Layout rules

The `LayoutNode` tree gives you `row`, `column`, `grid`, `section`, `card`, `accordion`, `flow-row`,
`splitter`, `panel`, `window`, and `views`. Guidance:

- **Fixed vs scroll.** Operational apps are `type:"fixed"` pages (single viewport, `height:100%` chains all
  the way down). Narrative and landing pages are `type:"scroll"`. Don't mix a scrolling body into a fixed
  console; open a second page instead.
- **The map's box.** In fixed pages, put the map in a `section` with `mode:"fixed"` and flex-fill styles so
  overlays (status bars, floating cards, windows) can be absolutely placed inside it. In scroll pages, give
  embedded map sections an explicit height and rounded corners — a full-bleed map inside prose reads as a
  bug, a framed one as a figure.
- **Panels vs splitters.** Use `panel` (dockable, collapsible, fixed width) for tool drawers the user may
  dismiss; use `splitter` when both sides are content the user will want to resize.
- **Windows** are for tools summoned on demand (launchpad pattern): declare them `open:false` and toggle
  them with a `showHide` connection from a `controller` or `button`.
- **`views` is the state machine.** Tabs for facets, `nav:"slides"` for guided sequences; attach a
  `mapState` (viewpoint, per-layer `definitionExpression`, `activeLayers`) to each view so navigation
  *drives the map* — this one primitive powers exhibits, journeys, reveals, and scroll stories.
- **Responsive is not optional.** Every side-by-side `row` needs `responsive.small` collapsing it to a
  column. Panels stack below the map on phones.
- **Animation is seasoning.** `scroll-reveal` on scroll pages and a modest `fly` with `stagger` on
  dashboard rails is plenty. Never animate the map's own container.

## 3 · Interactivity rules

The wiring vocabulary is deliberately small — triggers (`featureSelect`, `rowSelect`, `categorySelect`,
`brush`, `rangeSelect`, `filterChange`, `extentChange`, `search`, `buttonClick`, `sketchComplete`,
`viewChange`, `timer`, …) × actions (`filter`, `zoomTo`, `panTo`, `flash`, `viewInTable`,
`showStatistics`, `showHide`, `export`, `navigate`, `selectByGeometry`, `updateRecord`, `message`). The
power is the wiring matrix, not the vocabulary. Rules:

- **The interactivity floor: three live connections.** An app must demonstrate cross-widget behavior within
  ten seconds of loading, unprompted. If a viewer is intentionally minimal, it still flashes what you click.
- **Wire the signature loop first.** Each archetype has one loop that *is* the app — search→buffer→cards,
  legend-chip→filter, slider→time-filter, row⇄feature, brush→cross-filter, extent→statistics, slide→map
  state. Ship that loop before any secondary wiring.
- **Standard patterns to reuse:**
  - *Cross-filter:* chart `categorySelect` → `filter` on the map **and** every sibling widget (filters
    stack); show removable filter chips.
  - *Master–detail:* table/list `rowSelect` → `zoomTo` + `flash` on the map and `viewInTable` on a
    `feature-info` panel; map `featureSelect` → highlight the row back. Bidirectional or not at all.
  - *Extent stats:* map `extentChange` → `showStatistics` on KPIs — the cheapest way to make an app feel
    live.
  - *Synced maps:* `extentChange` → `zoomTo` between map pairs, wired both ways.
  - *Guided state:* `views` + `mapState`, with `buttonClick` → `navigate`/`zoomTo` for inline calls to
    action.
- **Don't fake it.** Only wire triggers the source widget actually emits (registry source is the truth —
  e.g. `button` emits `buttonClick`; cards don't). A connection that never fires is worse than none.

## 4 · Data binding rules

- Bind widgets with `dataSource.layerId` against layers that exist in the app's `layers.json`; chain
  results with `fromWidget` (a query feeding a table) or share selection state via `sourceId`.
- **Only reference fields you have verified** — from the service schema or the layer's `popupInfo`. A chart
  on a guessed field renders an empty lie. Tables default their columns from popup `fieldInfos`.
- Time-aware layers are filtered by a `definitionExpression` on their real time field (window or instant),
  stacking with any other filter. Pair the slider with a trend chart.
- Reads (query/stats/related/attachment-view) work on both backends; **edits need a writable,
  authenticated ESRI backend** — design write flows (`updateRecord`, reporter forms) to degrade to
  read-only elsewhere.

## 5 · Theme rules

- One structured `ThemeSpec` per app: pick `mode` deliberately — **dark** for control rooms, wall boards
  and cinematic maps; **light** for public, civic, and editorial apps — and one `primary` accent that the
  whole app respects. Set semantic roles (`success`/`warning`/`danger`) when statuses appear.
- Differentiate sibling apps with the *secondary levers*: dark vs light, header vs headerless, floating
  rounded cards vs flush docked panels, boxed vs full-bleed map — not by inventing new component styles.
- Numbers use tabular numerals; KPIs get big and few (3–5, not 9).
- Basemaps are the keyless open set (OSM · CARTO Positron/Voyager/Dark · OpenTopoMap). Never default to a
  keyed provider.

## 6 · Complexity tiers

Match ambition to need — an app should be as simple as its sentence allows:

| Tier | Shape | Examples in the roster |
|---|---|---|
| Trivial | one map, one loop, near-zero chrome | pocket, frame, scenic |
| Simple | map + one panel or strip, 2–3 connections | foldable, billboard, sidebar patterns |
| Interactive | one signature loop as the product | zone-lookup, time player, ranked list, compare |
| Wired | many widgets cross-filtering | monitor, chart boards, triage consoles |
| Composite | multi-page, multi-persona | introduction (onboard → work), field trios, hub landings |

## 7 · Ship checklist

- [ ] The one-sentence purpose is answerable in the first screen.
- [ ] The silhouette differs from its neighbors' at a glance.
- [ ] ≥3 connections fire; the signature loop works end-to-end.
- [ ] Every `layerId` and field name is verified against the webmap.
- [ ] `responsive.small` collapses every side-by-side row; tested at phone width.
- [ ] Theme: one accent, deliberate mode, semantic status colors where statuses exist.
- [ ] Basemap keyless; nothing blocks first paint on a slow tile.
- [ ] Write paths (if any) guarded behind an ESRI backend and degrade to read-only.
- [ ] Layout validates: registry widget types only — or a bespoke widget added under the freestyle
      charter in `recipes/COMPONENT-MANIFEST.md` §10 (app-local `registry` override honoring the
      widget contract), with a named fallback until it ships (`pnpm test` keeps the roster suite green).

## 8 · Harvest what works

A good layout is an asset. When an open-design app earns reuse, serialize it, add a `strata:template`
metadata block, and drop it into `strata/templates/` — the galleries pick it up automatically and the
validation suite keeps it honest. Templates are just serialized app configs; treat yours as a library, not
as one-offs.
