# Strata app templates

**30 ready-to-render app templates, each a serialized [`AppLayout`](../packages/schema/src/types.ts) JSON.**
A template is just a serialized app config: a plain JSON file you can copy into an app, hand to
`<StrataApp config={…}>`, and re-point at your own layers.

Each template is a distinct app **silhouette** — a map-centric layout, a dashboard, a web page, or a grid —
rebuilt on strata-app-builder's widgets, containers, and `connections` wiring, and demonstrated against the
shipped test webmaps [`WebMaps/dc.json`](../../WebMaps/dc.json) (District of Columbia) and
[`WebMaps/md.json`](../../WebMaps/md.json) (Maryland). (The roster will look familiar to anyone who has used
ArcGIS Experience Builder starter templates.)

## Using a template

Each template is a serialized `AppLayout` JSON. Load one into the **`<StrataApp>`** engine
(`@strata/core-map`) with a `layers.json` map to render it, or scaffold an app from one via **`/new-app`** in
Claude Code. The roster is validated against the shipped test webmaps by
`packages/schema/tests/templates.test.ts`.

## The roster

| Template | Category | Webmap | Silhouette |
|---|---|---|---|
| `foldable.json` | map-centric | dc | full map + collapsible left panel (layers/legend/basemap) |
| `jewelry-box.json` | map-centric | dc | fixed left drawer of tabbed tools + map |
| `dart.json` | map-centric | dc | map over a fixed bottom data shelf (chart + table) |
| `billboard.json` | map-centric | md | banner headline over a full-bleed map |
| `pocket.json` | map-centric | md | minimal embeddable map, floating legend only |
| `tab.json` | map-centric | dc | map + right sidebar switched by tabs (About/Layers/Data) |
| `launchpad.json` | map-centric | dc | full-bleed map, floating icon dock, tools as floating windows |
| `monitor.json` | dashboard | dc | dark ops board: KPI strip · boxed map · list · chart shelf |
| `dash.json` | dashboard | dc | light compact dashboard: KPI/chart rail + map |
| `summary.json` | dashboard | dc | huge KPI banner; stats recompute on every extent change |
| `reveal.json` | dashboard | dc | views navigation swaps whole dashboard states |
| `gallery.json` | web-page | md | hero + card gallery + embedded map row |
| `journey.json` | web-page | md | bookmark-driven narrative; each step flies the map |
| `ribbon.json` | web-page | md | horizontal bookmark ribbon over the map |
| `parallax.json` | web-page | dc | scrolling story; sections restyle a pinned map |
| `epic.json` | web-page | md | website home: hero · feature cards · map section · footer |
| `snapshot.json` | web-page | dc | KPI cards + a tabs section swapping map/chart/table |
| `timeline.json` | web-page | dc | time-window player over a time-enabled layer + trend chart |
| `frame.json` | web-page | md | one framed, captioned map with prose — editorial print feel |
| `vacation.json` | web-page | md | self-running fly-through (auto-playing slides) |
| `scenic.json` | web-page | md | cinematic full-bleed map with overlaid hero type |
| `quest.json` | web-page | dc | step-by-step guided task flow staging the map per step |
| `introduction.json` | web-page | dc | two pages: onboarding welcome → working map |
| `illustrator.json` | web-page | dc | media-rich article with live maps inline as figures |
| `avatarboard.json` | grid | dc | big map + feature-profile rail (card, details, neighbors) |
| `checkerboard.json` | grid | md | 2×2 checker of maps and content cards, extents synced |
| `collage.json` | grid | dc | asymmetric splitter collage: map, KPIs, chart, table |
| `leaflet.json` | grid | md | tall reading pane (near-me lookup) beside the map |
| `mapflyer.json` | grid | md | destination cards fly one shared map around |
| `multiverse.json` | grid | md | 2×2 grid of extent-synced maps, different layer mixes |

## Anatomy of a template

Every file is one `AppLayout` with a metadata block the gallery (and recipes) read:

```jsonc
{
  "strata:template": { "id": "monitor", "name": "Monitor",
                       "category": "dashboard", "webmap": "dc", "tier": "advanced", "blurb": "…" },
  "theme":       { /* structured ThemeSpec — mode, colors, variables */ },
  "pages":       [ /* AppPage → LayoutNode tree (row/column/grid/splitter/panel/window/views/widget) */ ],
  "connections": [ /* the interactivity: {from, trigger, to, action, options} */ ]
}
```

Rules the roster follows:

- **Real registry keys only** — every `widget.type` exists in `defaultWidgetRegistry`; every trigger/action
  in `@strata/actions`. Enforced by `packages/schema/tests/templates.test.ts` (part of `pnpm test`), which
  extracts the vocabularies from the source files so drift fails CI.
- **Real layers only** — every `layerId` exists in the template's declared webmap.
- **Alive on first render** — every template ships live `connections` (≥2 unless tier `trivial`), because
  interactivity is the demo.
- **Open basemaps** — the webmaps carry the keyless OSM/CARTO set; templates never reference keyed providers.

## Using a template

1. **In an app:** copy the JSON, delete `strata:template`, swap the `layerIds`/fields for your
   `layers.json`, and render with `<StrataApp config={…} context={{ maplibregl, config, store }} />`.
2. **From a recipe:** a `RECIPE.md` can point its layout at a roster file — the template supplies the
   skeleton, the recipe slots content.
3. **Harvesting:** built a layout worth keeping? Serialize it, add a `strata:template` block, drop it here,
   and the gallery picks it up.

*Design rules (silhouette choice, wiring floor, theme levers) live in one place —
[`docs/guide/app-design.md`](../docs/guide/app-design.md); exact widget/config truth lives in
[`recipes/COMPONENT-MANIFEST.md`](../../recipes/COMPONENT-MANIFEST.md) (freestyle charter: §10). This README
stays a roster.*
