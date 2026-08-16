# Recipe — Showcase · the DC Operations Center

> **One-sentence purpose.** A single, coherent, multi-page **civic operations command center** for
> Washington, DC that exercises the *entire* shipped strata-app-builder surface — every control, panel, widget,
> layout node, the `<StrataApp>` engine, the WIF interactivity bus, the DataSource model, analysis, time,
> theming, i18n, and export — as a believable product, not a widget zoo.
>
> `Template: open-design` · **Data:** `WebMaps/dc.json` · **Reference implementation:** [`app.json`](./app.json)

Authored against [`COMPONENT-MANIFEST.md`](../COMPONENT-MANIFEST.md) (config truth) and
[`DESIGN-REQUEST-PROMPT.md`](../DESIGN-REQUEST-PROMPT.md) (method). It is also the **coverage test**: if a
component regresses, a showcase page breaks. Where [`mapviewer`](../mapviewer/RECIPE.md) stacks *every panel*
onto one map, the showcase arranges components *by page* into a designed app — and embeds MapViewer as its
"Map Bench." Same `dc.json`, two lenses.

---

## 1 · Business analysis

| | |
|---|---|
| **Personas** | a **duty officer** watching the live picture; an **analyst** slicing crashes/income by ward and running spatial ops; a **public-information officer** assembling a shareable brief. |
| **Decisions they make** | "Where are incidents concentrating right now?" · "Which wards drive the trend?" · "What's within 500 m of this site?" · "Can I hand this view to the public?" |
| **Purpose sentence** | *One shared map, many lenses — the whole toolbox in a real civic context.* |
| **Data model** | `WebMaps/dc.json`: every geometry type, standalone + **related** tables, a **time-enabled** `dc-crashes` layer, and rich categorical/numeric fields (`WARD`, `SEVERITY`, `MED_HH_INC`, `EMP_RATE`, `REPORTDATE`). CORS-enabled DC open data — no proxy/token, all **EPSG:4326**. Layer ids: `dc-wards`, `dc-zip-codes`, `dc-parcels`, `dc-bike-routes`, `dc-crashes`, `dc-affordable-housing` (+ related `dc-property-assessment`, `dc-crash-details`, `dc-address-table`). |

## 2 · Candidate silhouettes (and the pick)

- **A — Multi-page command center**: a persistent `header` `page-nav` tab bar over one shared map; each page is a **capability family**. **← picked.**
- B — Single scrolling story: elegant for a narrative, but can't showcase docked panels, splitters, or a dashboard grid at once.
- C — One dashboard grid: dense, but flattens the "families" story and has nowhere to demo `views`/`swipe`/layouts.

**Pick A** — a tabbed multi-page shell is the only silhouette that gives *every* family a home while keeping
**one persistent map and one theme**; pages change *which* layers/panels/`connections` are live, never the map
identity.

## 3 · Layout skeleton

```
┌ header: brand · [Command][Panels][Dashboard][Query][Time][Analysis][Layouts][Design] · theme · lang · share ┐
│                                                                                                             │
│  ← per-page body (one shared <StrataMap> + the page's family of panels/widgets) →                           │
│                                                                                                             │
└ footer: attribution · controller (measure · draw · coordinates) ───────────────────────────────────────────┘
  splash on first load: "DC Operations Center"  (once)
```

## 4 · AppLayout sketch (8 pages, one shell)

`<StrataApp config={app.json}>`. Structured theme + `splash` + a `header` with `page-nav`; each page is a
`fixed` layout (the Design page is `scroll`). See [`app.json`](./app.json) for the full tree; the shape:

```jsonc
{
  "version": "1",
  "theme": { "mode": "auto", "colors": { "primary": "#38bdf8", "secondary": "#a78bfa",
             "success": "#34d399", "warning": "#fbbf24", "danger": "#f87171" }, "fonts": { "scale": "default" } },
  "splash": { "title": "DC Operations Center", "body": "…", "once": true },
  "pages": [
    { "id": "command",  "type": "fixed",  "header": { /* page-nav + theme-switch + lang-switch + share */ },
      "footer": { /* attribution + controller (measure/draw/coordinates) */ },
      "root": { "kind": "row", "children": [
        { "kind": "panel", "dock": "left", "title": "Layers", "children": [
            { "kind": "widget", "widget": { "id": "layers", "type": "layer-panel" } },
            { "kind": "widget", "widget": { "type": "basemap" } },
            { "kind": "widget", "widget": { "type": "legend" } } ] },
        { "kind": "widget", "widget": { "id": "map", "type": "map",
            "props": { "config": { "$ref": "WebMaps/dc.json" },
                       "controls": { "navigation": true, "geolocate": true, "fullscreen": true, "scale": true } } } },
        { "kind": "widget", "widget": { "type": "feature-info", "props": { "floating": true } } } ] } },

    { "id": "panels",    "type": "fixed",  "root": { "kind": "splitter", "orientation": "h", "sizes": [62, 38],
        "children": [ { /* map + floating carto */ }, { /* filter · date-filter · table · data-actions */ } ] } },

    { "id": "dashboard", "type": "fixed",  "root": { /* kpi row + gauge + wardChart (bar) + severityChart (pie)
        + sparkline + wardTable — all dataSource.sourceId "wards"/"crashes" */ } },

    { "id": "query",     "type": "fixed",  "root": { /* query (nested AND/OR) → map filter + fromWidget table */ } },
    { "id": "time",      "type": "fixed",  "root": { /* date-filter over dc-crashes REPORTDATE + line chart */ } },
    { "id": "analysis",  "type": "fixed",  "root": { /* analysis (buffer/hexbin/hotspot/withinDistance) + near-me
        + weighted-overlay + add-data */ } },
    { "id": "layouts",   "type": "fixed",  "root": { "kind": "views", "nav": "slides",
        "autoPlay": { "intervalMs": 6000 }, "views": [ /* swipe · splitter of two synced maps · bookmarks tour */ ] } },
    { "id": "design",    "type": "scroll", "root": { /* theme-switch · lang-switch · embed · video · gallery of
        cards · a `window` (Map Bench = mapviewer) opened by a button→showHide · a Studio placeholder */ } }
  ],
  "connections": [ /* §5 */ ]
}
```

## 5 · Connections (the WIF — matches `app.json`)

The Dashboard proves **both** linking models: KPIs/gauge/table share a `sourceId` (link with **no**
connections); the chart→map/table cross-filter is explicit:

| from | trigger | to | action | options | behavior |
|---|---|---|---|---|---|
| `wardChart` | `categorySelect` | `map` | `filter` | `{layerId:"dc-wards"}` | click a ward bar → filter the map |
| `wardChart` | `categorySelect` | `wardTable` | `filter` | `{layerId:"dc-wards"}` | …and the table, in place |
| `severityChart` | `categorySelect` | `map` | `filter` | `{layerId:"dc-crashes"}` | pie slice → filter crashes |
| `wardTable` | `rowSelect` | `map` | `zoomTo` | `{layerId:"dc-wards"}` | row → fly the map |
| `wardTable` | `rowSelect` | `featureInfo` | `viewInTable` | — | …and open the row in `feature-info` |
| `queryBuilder` | `filterChange` | `map` | `filter` | — | the nested AND/OR WHERE drives the map |
| `queryBuilder` | `recordsChange` | `queryTable` | `viewInTable` | — | its output rows populate a bound `table` |
| `timeSlider` | `filterChange` | `map` | `filter` | — | the time window animates `dc-crashes` |
| `carto` | `filterChange` | `map` | `filter` | — | CARTO cross-filter → map in place |
| `sketch` | `sketchComplete` | `map` | `selectByGeometry` | — | draw a shape → select the features under it |
| `dataMenu` | `featureSelect` | `map` | `flash` | — | a data-action selection pulses on the map |
| `openBench` | `buttonClick` | `benchWindow` | `showHide` | `{hidden:false}` | open the Map Bench `window` |

## 6 · Theme & visual character

Structured `theme`, **`mode:"auto"`** (follows the OS), a command-center palette — `primary` cyan `#38bdf8`,
`secondary` violet, `warning` amber, `danger` red — with `light` and `hazard` presets reachable from
`theme-switch`, and full **EN/AR RTL** via `lang-switch`. The compiler derives every role's hover/active/
contrast and injects a states+motion stylesheet, so panels/buttons/cards feel alive. Two sentences: *a dark,
high-contrast operations aesthetic where cyan carries the live data and amber/red reserve themselves for
alerts; motion is short and functional, so the app reads as an instrument, not a brochure.*

## 7 · Data bindings

| widget | layer / source | field(s) | verified |
|---|---|---|---|
| `layer-panel` · `legend` · `basemap` | store `operationalLayers` / `baseMap` | — | `WebMaps/dc.json` |
| `wardChart` · KPI · gauge · `wardTable` | `sourceId:"wards"` → `dc-wards` | `WARD`, `MED_HH_INC`, `EMP_RATE` | `dc.layers.notes.md` |
| `severityChart` | `dc-crashes` | `SEVERITY` | ″ |
| `timeSlider` (`date-filter`) · time line chart | `dc-crashes` (`source.timeField`) | `REPORTDATE` | ″ |
| `queryBuilder` → `queryTable` (`fromWidget`) | `dc-crashes` | user-built WHERE | runtime |
| `feature-info` | tracks bus `featureSelect` / active source | popup fields | `popupInfo` |

## 7b · Verify each source first (terminal)

**Reference recipe** (`../README.md` -> Two classes) — universal keyless sources, still probed.
Literal output recorded **2026-08-11**.

```bash
B=https://maps2.dcgis.dc.gov/dcgis/rest/services

#  layer                  path                                            oidField   geom      wkid    count
#  dc-wards               OP/ACS_Economic_Characteristics/MapServer/57    null (!)   Polygon   26985       8
#  dc-zip-codes           DCGIS_DATA/Location_WebMercator/FS/4            OBJECTID   Polygon    3857     172
#  dc-bike-routes         DCGIS_DATA/Transportation_WebMercator/FS/6      OBJECTID   Polyline   3857   1,024
#  dc-crashes             DCGIS_DATA/Public_Safety_WebMercator/FS/24      OBJECTID   Point      3857 352,414
#  dc-affordable-housing  DCGIS_DATA/Property_and_Land_WebMercator/FS/62  OBJECTID   Point      3857     923
#  dc-crash-details       DCGIS_DATA/Public_Safety_WebMercator/FS/25      OBJECTID   null      -      897,159

# TRAP D1 - dc-wards reports objectIdField: null though an OBJECTID field exists. Bind READ-ONLY.
# TRAP D2 - dc-wards is wkid 26985 (NAD83 / MD State Plane); its siblings are 3857. One server does
#           NOT mean one spatial reference. Reproject on the way in; everything renders 4326.
# TRAP D3 - dc-crashes is 352,414 features at maxRecordCount=1000 -> 353 pages. The map's
#           definitionExpression narrows it to one quarter; never load it whole.
curl -s "$B/DCGIS_DATA/Public_Safety_WebMercator/FeatureServer/24/query?where=1%3D1&returnCountOnly=true&f=json"
#  -> {"count":352414}
# TRAP D4 - dc-crash-details is a TABLE (geometryType null), 897,159 rows. Related records only.
# TRAP D5 - dc-wards publishes 147 fields. A popup or table MUST name an explicit subset.
# TRAP D6 - CORS REFLECTS THE ORIGIN; it does not send "*".
curl -sI "$B/.../FeatureServer/24?f=json" | grep -i access-control
#  -> (nothing)                      <- a HEAD with no Origin looks CORS-CLOSED
curl -s -D- -o /dev/null -H "Origin: http://localhost:8042" "$B/.../FeatureServer/24?f=json" | grep -i access-control
#  -> Access-Control-Allow-Origin: http://localhost:8042
#     Always probe with an Origin header, or you will proxy a host that never needed one.
```

**Vintage:** DC open data refreshes continuously. Assert the *shape* — oid field, geometry type, spatial
reference, field presence — and treat counts as order-of-magnitude.

> The **universal adjuncts** (Natural Earth, USGS earthquakes) are probed in
> [`../nearby/RECIPE.md`](../nearby/RECIPE.md) §4 — the USGS feed's ids are **strings** and its
> `time` is epoch **milliseconds**. Do not re-derive; cite it.

## 8 · Capability sweep — every registry key → a page

| Family | Widgets / nodes exercised | Page |
|---|---|---|
| Map & controls | `map` · `measure` · `draw` · `coordinates` · `search` · `print` · `legend` · `status-bar` | Command |
| Panels | `layer-panel` · `basemap` · `table` · `chart` · `carto` · `data-actions` · `filter` · `date-filter` · `query` · `analysis` · `feature-info` | Command/Panels/Query |
| Charts & KPIs | `kpi` · `gauge` · `sparkline` · `stacked-bar` · `chart` (bar/line/pie/histogram/scatter) | Dashboard/Time |
| Content & chrome | `card` · `list`/`gallery` · `text` · `image` · `embed` · `video` · `button` · `menu` · `divider` · `page-nav` · `swipe` · `bookmarks` · `controller` · `share` · `theme-switch` · `lang-switch` · `placeholder` | Design/Layouts |
| Analysis | `analysis` · `near-me` · `weighted-overlay` · `add-data` · `elevation` | Analysis |
| Layout nodes | `row`/`column`/`grid`/`section`/`card`/`accordion`/`flow-row` · **`splitter`** · **`window`** · **`panel`** · **`views`** (tabs+slides) · `header`/`footer` · `splash` | all |
| Interactivity | `connections` (§5) **and** DataSource `sourceId` linking + `dataSource.fromWidget` | Dashboard/Query |

## 9 · Guided wizard

| # | Question | Options → **default** | Feeds |
|---|---|---|---|
| 1 · App | Title & subtitle? | free text → **"DC Operations Center"** | header/splash |
| 2 · Pages | Which families? `[multi]` | Command · Panels · Dashboard · Query · Time · Analysis · Layouts · Design → **all** | pages |
| 3 · Data | Base map spec? | DC test map · your `layers.json` → **DC test map** | `map.config` |
| 4 · Theme | Theme + language? | dark · light · **auto** · hazard · EN / **EN+AR (RTL)** | `theme` |
| 5 · Linking | Cross-filtering? | `connections` · `sourceId` · **both** | §5 |
| 6 · Bench | Embed the MapViewer Map Bench? | **yes** / no | Design |
| 7 · Export | Offer image/PDF/report/atlas/data/share? | **yes** / no | export |

## 10 · Prompt-script (run in order)

```
A. /new-app — "DC Operations Center" on <StrataApp>. Structured theme mode:"auto" (primary cyan, secondary
   violet, warning amber, danger red; light + hazard presets via theme-switch; EN/AR RTL), a header with a
   page-nav tab bar + theme-switch + lang-switch + share, a per-page footer (attribution + a controller with
   measure/draw/coordinates), and a splash (once). Reference WebMaps/dc.json. Install deps + run command.
B. Command page: a docked left `panel` (`width:300`, `minWidth:240`, `maxWidth:560` — resizable, as every
   panel is by default; layer-panel with context menu: table/zoom/filter/symbology/popup/rename/remove;
   basemap gallery with Manage→set-default; legend) + the shared map (navigation/geolocate/fullscreen/scale
   + measure/draw/coordinates/search/print) + a floating feature-info. /popup each layer.
C. Panels page: a resizable splitter — map + floating carto on one side; filter, date-filter, a paging table
   (CSV/GeoJSON), and a data-actions menu on the other.
D. Dashboard page: kpi row + gauge + wardChart (bar, income by ward) + severityChart (pie, crashes by
   severity) + sparkline + wardTable — bind them all to ONE sourceId ("wards"/"crashes") so they link with no
   connections; ALSO author the §5 connections so a chart category filters map+table and a row zooms the map.
E. Query page: a query widget (nested AND/OR) → apply WHERE to dc-crashes on the map; consume its output in a
   fromWidget table.
F. Time page: a date-filter (play/pause) over dc-crashes REPORTDATE + a line chart with threshold bands.
G. Analysis page: an analysis widget (buffer/hexbinDensity/hotspot/withinDistance) + near-me +
   weighted-overlay + add-data; each op adds a result layer.
H. Layouts page: a `views` node in slides mode (autoPlay, per-slide mapState) with a swipe compare, a splitter
   of two synced maps, and a bookmarks tour.
I. Design page (scroll): theme-switch + lang-switch, an embed + video, a gallery of cards, and a `window`
   (the Map Bench = the mapviewer recipe) opened by a button→showHide; a placeholder for Studio. Wire /export
   image, pdf, report, atlas, spec, layer-data + a share deep-link.
```

## 11 · Verify · gaps · risks

**Verify:** every page renders its family with **no console errors** · controls function and measure/draw
**revert to identify** · panels dock *and* float **and resize** — drag the left rail's grip and the map
follows without a reload, then `Tab` to the grip and size it with the arrow keys · **one** control cluster
on the map (zoom · fit · layers · basemap · legend) with **one** drawer beside it, the basemap drawer
ticking what is actually in force and each row showing a live tile · the legend **filters** on click,
isolates on shift-click and clears on `Esc` · a **table row flies the map to that record and opens its
popup, and the same row clicked again clears both** · the table exports CSV/GeoJSON · KPIs/gauge/table on one
`sourceId` link with **no connections** · a chart category **cross-filters the map + table in place** (no
remount) and a row zooms+flashes · the nested AND/OR query builds a real WHERE and feeds a `fromWidget` table
· `date-filter` play animates crashes · `views` slides + `swipe` + `splitter` + `bookmarks` work ·
`theme-switch` (dark/light/**auto**/hazard) + `lang-switch` (AR/RTL) flip the whole app · a `button→showHide`
opens the Map Bench `window` · export produces the artifacts and the share deep-link round-trips.

**Honest gaps (the app labels these, never fakes them):** feature **editing/writes** need a writable,
authenticated **ESRI** backend (Strata Serve is read-only; Strata editing is planned) → the EditPanel renders
read-only; **attachments** need a `hasAttachments` layer → pages features and shows "no attachments"; agentic
**Ask the map** is a deterministic parser this release → the query/SQL builder covers structured filtering;
**imagery-through-time** is partial → the time slider drives vector layers; **directions** need an external
routing service you inject; **3D/scenes** are not built.

**Risks:** eight pages is a lot of surface — keep one **shared** map/store/theme so pages stay cheap and
consistent; guard the gap pages with an inline note so a reader never mistakes a limitation for a bug.
