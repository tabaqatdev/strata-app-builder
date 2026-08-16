# strata-panels skill pack

Advanced layer/table/data panels (§4.7). `/panel <type> <layer|table> [--surface canvas|page --slot …]`.
Every panel runs inside a shared **`PanelShell`** — **floating (draggable)** or **fixed**, with a `⋯`/
right-click context menu (Open, Remove, + custom), a close button, and **resize grips**.

## Sizing — every panel is resizable, by default

```tsx
<AttributeTablePanel defaultWidth={480} minWidth={360} maxWidth={1200} … />   // starts at 480, floor 360
<Legend defaultWidth={220} resizable={false} … />                            // locked: size is load-bearing
```
| prop | default | what it does |
|---|---|---|
| `resizable` | **`true`** | Grips on. `false` renders none and locks the size. |
| `defaultWidth` | — | The **starting** width. The user drags from here. |
| `defaultHeight` | — | Starting height (floating only — a docked panel is sized by its container). |
| `minWidth` / `maxWidth` | 200 / 960 | Clamp the width drag. |
| `minHeight` / `maxHeight` | 120 / 900 | Clamp the height drag (floating). |
| `onResize({width,height?})` | — | Side effects only — **not** persistence. Rarely needed: `<StrataMap>` observes its own box. |

A docked panel gets a width grip on its trailing edge; a floating one adds a height grip and a corner.
Every grip is a focusable `role="separator"` driven by **arrow keys** (`Shift` = 48 px step), because a
pointer-only grip is unusable by keyboard and awkward on touch. The dragged size is **session state** —
the authored `defaultWidth` stays the source of truth and a remount returns to it, so nothing the user
drags can make the app disagree with its own spec.

In a declarative `AppLayout`, the same applies to the **`panel` container node** (`dock` + `width` +
`minWidth`/`maxWidth` + `resizable`) — see the `strata-layout` skill.

Types: **filter** (`FilterPanel` — query builder → definitionExpression, emits `filterChange`),
**date-filter** (`DateFilter` — calendar single/range on a time field → time definitionExpression),
**feature-info** (`FeatureInfoPanel` — docked feature detail, reuses the popup element model; bind to
`featureSelect`), **list** (cards), **table** (`AttributeTablePanel`: sort, header filter, column show/hide,
row→map select, **CSV + GeoJSON** export built-in + `onExport` GeoParquet, **server paging**, **row
windowing**, Show metadata), **statistics** (count/sum/avg/min/max/group-by), **chart** (`ChartPanel`:
bar/line/pie via ECharts-optional/SVG-fallback, drag-reorder, **click → categorySelect** cross-filter),
**carto**, **edit**, **attachment**, **time-series**, **statusbar**, **swipe**, **bookmarks**,
**data-actions** (WIF quick-action menu), **related** records.

The management panels live in `@strata/core-map/react/panels`: `LayerPanel` (visibility/opacity/reorder/
rename/zoom/labels/identify/open-table/remove, drag-to-reorder rows, header "+" add-from-FeatureServer-URL),
`BasemapPanel` (list/switch/add basemaps → genuine ESRI `BaseMap`), `AttributeTablePanel`, `ChartPanel`.

## New panels
- **`CartoPanel`** — a CARTO Builder-style **layer list + data widgets** (category / formula / histogram /
  time-series) bound to a layer that **cross-filter the map** (category click → `definitionExpression` via
  `onFilter`). Store-driven layer list, `onQuery(spec)` for aggregation, reuses `KpiCard`/`Sparkline`. Emits
  `categorySelect` on the **`@strata/actions`** bus. The interactive-legend / cross-filter showcase.
- **`EditPanel`** — attribute form to **update / add / delete** a selected feature via
  `@strata/feature-arcgis` `applyEdits`. **Requires a writable + authenticated ESRI backend**
  (`@strata/auth-arcgis`) — **Strata Serve is read-only; Strata editing is planned.** The banner flags this.
  See `/edit`.
- **`AttachmentViewer`** — page through features and view **image/video/PDF attachments**
  (`queryAttachments()` in `@strata/feature-arcgis`, dependency-light REST, both backends). See `/attachments`.
- **`StatusBar`** (control, `react/controls`) — live cursor **coordinates**, **zoom**, **scale (1:N)**, **CRS**
  (EPSG:4326). Same as `@strata/plugin-statusbar` (+ scalebar) for plain-DOM/non-React hosts.
- **time-series** — the `TimeSeries` widget (hydrograph w/ bands); pair with the `TimeSlider` control
  (`/timeslider`).

## The row gesture — adopt, then release

A table row is a **toggle**, and this is shipped behaviour, not something to wire per app:

```
click a row      → rowSelect {oids:[id], zoom:true, popup:true}
                   → map flies to THAT RECORD (not the layer extent) and opens its popupInfo
                   → the row is marked aria-selected, so the table shows what the map flew to
click it again   → rowSelect {oids:[], zoom:false, popup:false}
                   → selection cleared · highlight dropped · popup closed
click another    → the selection moves; exactly one record at a time
```

**Whatever adopts must also release, with the same gesture.** A row that selects but cannot deselect
leaves a user who clicked by accident with no way back to the whole population — and a popup left open
over a cleared selection is the app disagreeing with itself. The sink half lives in the map's bus
binding, so the same contract holds for a chart, a card or a data action: **an empty `oids` is a
release**, never a no-op.

`oids` are `number | string`: an object id is whatever the service says it is (`troubleshooting.md` §1).

## Legend and basemap — the two control surfaces

- **`Legend` is interactive by default** — click a class to hide it, shift-click to isolate, `Esc`
  clears. It writes a genuine `definitionExpression` on the renderer's own field through
  `store.setDefinition`, so it **filters rather than fades**: a faded class is still clickable, and a
  "hidden" feature can then be selected through it. Pass `counts` to render `n of N` — a filtered count
  without its denominator reads as the whole. The panel says in words that isolating changes the map,
  not the reading. `interactive:false` gives a static caption.
- **`BasemapPanel` is a radiogroup** — round boxes, one always in force and always ticked, each row a
  live tile of the current area in that style. Pass `map` for the thumbnails and `themeMode` for the
  "Follow the theme" row.

## Cross-panel actions (`@strata/actions`)
Each panel is a config object in `strata:extensions`, bound to a `mapId`, placeable on canvas or in a page
slot. For cross-widget actions (e.g. chart/category → filter table + map), pass the **`ActionBus`**:
`CartoPanel` and `AttributeTablePanel` accept an optional `bus`, so a category/row click cross-filters
**all** widgets/panels via `categorySelect`/`rowSelect`/`filterChange` (+ `connectBusToStore`) — not just the map.

## Known traps

- **A fixed panel width is a decision you made for the user, and it is usually wrong for someone.** The
  same 320 px rail that is generous on a laptop truncates every label on a projector and swallows the map
  on a tablet. Ship the starting width, then set the *floor* at the width the panel is still readable at
  and let the user take it from there — `minWidth` is the honest version of truncating to fit.
- **`resizable:false` needs a reason in the recipe.** Locking a panel is occasionally right (a swipe pane,
  a fixed-ratio chart) and is otherwise a fixed width wearing a flag.
- **A layer panel must distinguish four kinds of nothing.** One report — "all the layers are hidden" —
  had three causes at once: the panel never listed the **primary** layer, all context defaulted off, and
  of five context layers one could never draw, one had nothing in that county, and one silently capped.
  List the primary layer **first** with a live drawn-count, default the cheap context **on**, and label
  every row *off* · *N in view* · *none in this view* · *capped* · *not mappable*. Carry a badge with how
  many context layers are actually drawing.
- **A layer that can never draw must refuse to toggle.** One service publishes no coordinates at all;
  a checkbox that ticks and paints nothing is worse than an absent row.
- **A caveat that outlives a toast belongs in a persistent notice, not the status line.** A vintage
  field-rename warning written to `#status` was overwritten by load progress and never reached anyone.
- **A legend counts what it actually filters.** One legend read "Served 8,340" while 12,728 features were
  Served, because it counts *rows in the current roll-up*, not the source class. It now reads
  `8,340 of 12,728` and says why. Keep the denominator visible — a filtered count must never read as the
  whole.
- **Isolating on the legend changes the map, not the reading** — and the panel should say so in words.
- **A legend row filters, it does not fade.** A faded class is still clickable, so a "hidden" feature can
  be selected straight through it.
- **A table row that acts on click can remove itself**, making a toggle impossible: if the table lists
  the *children* of the adopted node, adopting deletes the row you would click again. Separate the
  gestures — **click selects** (and survives), **double-click descends**.
- **Never truncate silently.** `+N more` · `Capped, not complete` · `250 of 1,975 rows`.
- Full catalogue: `strata/docs/troubleshooting.md` §7.
