# Human Language Reference — how to ask for each component

For every component, widget, panel, control, and skill, this page gives the **natural-language phrase a
person actually uses** to get it. It's the bridge between "what a user says" and "what strata-app-builder builds".

**Who this is for.** Recipe authors and `/recipe` wizards: pull phrasing straight from here into a recipe's
**`## Guided wizard`** questions and **`§ Prompt-script`** so the app makes good, idiomatic UI suggestions.
Claude also reads this to reach for the right component by default. Pair it with
**[Components, widgets & skills](components.md)** (what each one *is*) and
[Command reference](commands.md) (the exact command).

> **Status key:** ✅ shipped · 🔶 needs a writable/authenticated ESRI backend · 🟡 partial.

---

## 1 · Map, layers & basemaps

| Say this | You get |
|---|---|
| "Show these layers on a map." | `<StrataMap>` on the ESRI Web Map JSON `layers.json`. |
| "Add this feature service: `…/FeatureServer/0`." | An ArcGIS REST layer (pulls `drawingInfo` + fields). |
| "Load `cities.geojson`." / "Add this GeoJSON URL." | A GeoJSON layer. |
| "Cluster the points; refresh every minute." | Clustering + a refresh interval. |
| "Use the CARTO dark basemap." / "Give me a crisp vector basemap." | A keyless raster or vector basemap. |
| "Let users switch basemaps." | A BasemapPanel / basemap gallery. |
| "Make it a hazard / control-room look." | The `hazard` theme preset. |
| "Add this ImageServer as an NDVI raster." ✅ | An ESRI ImageServer raster layer (`renderingRule`). |
| "Load this GeoTIFF (COG) directly." ✅ | A cloud-optimized GeoTIFF via the `cog://` protocol. |

## 2 · Symbology (`/symbology`)

| Say this | You get |
|---|---|
| "Make the rivers thin blue lines." | A simple renderer. |
| "Color the countries by continent." | A unique-value renderer (palette from `@strata/theme`). |
| "Shade by population in 5 ranges, light to dark." | A class-breaks (graduated) renderer. |
| "Show the quakes as a heatmap." | A heatmap renderer. |
| "Size the city dots by population." | A size visual variable. |
| "Color by economy **and** income group together." ✅ | A multi-field unique-value renderer. |
| "Show population as dot density — one dot per 100k." ✅ | A dot-density layer (expanded to points). |
| "Color by GDP per capita (GDP ÷ population)." ✅ | An Arcade `valueExpression` renderer. |

## 3 · Popups (`/popup`)

| Say this | You get |
|---|---|
| "Show name, population (comma-separated), and the date." | Title + a formatted field table. |
| "Show the feature's photo in the popup." ✅ | A media image element. |
| "Put a little bar chart of the yearly values in the popup." ✅ | A media chart (bar/line/pie/column). |
| "Let me page through the photos attached to each inspection." ✅ | An attachments strip. |
| "In the popup, list the permits related to this parcel." ✅ | A related-records mini-table. |
| "Add a computed 'density' line." ✅ | An Arcade `expressionInfos` value. |

## 4 · Panels (`/panel`)

| Say this | You get |
|---|---|
| "Add a layer list I can toggle and reorder." | LayerPanel. |
| "Show the data in a sortable table under the map." ✅ | AttributeTablePanel (paging + windowing + CSV/GeoJSON export). |
| "Add a panel of charts beside the map." ✅ | ChartPanel (ECharts/SVG; click cross-filters). |
| "Add CARTO-style widgets that filter the map when I click a category." | CartoPanel. |
| "Add a filter panel so users can narrow by field values." ✅ | FilterPanel (query builder). |
| "Let users pick a date or a date range from a calendar." ✅ | DateFilter. |
| "Show the selected feature's details in a side panel, not a popup." ✅ | FeatureInfoPanel. |
| "When I select a feature, give me quick actions — zoom, flash, view in table, export." ✅ | DataActionMenu. |
| "Let me edit these features' attributes." 🔶 | EditPanel. |
| "Add an attachment viewer to page through photos." 🔶-write / ✅-read | AttachmentViewer. |

## 5 · Map controls & tools

| Say this | You get |
|---|---|
| "Add zoom buttons / a scale bar / a status bar with live coordinates." | Navigation / ScaleControl / StatusBar. |
| "Add a legend." | Legend. |
| "Let me measure distances and areas." / "Let me draw shapes." | Measure / Sketch. |
| "Add a time slider that animates the data over the month." | TimeSlider (`/timeslider`). |
| "Put all the tools behind a toolbar so it's not cluttered." ✅ | The `controller` tool dock. |
| "Add saved places I can jump between." ✅ | The `bookmarks` widget. |
| "Add a swipe tool to compare two layers." ✅ | The `swipe` widget. |

## 6 · Layout widgets (for `<StrataApp>`, via `/app`)

| Say this | You get (`type`) |
|---|---|
| "Put the map on the left." | `map` |
| "Add KPI cards for total population and country count." | `kpi` |
| "Add a gauge showing % affected." / "a trend sparkline" / "a stacked bar by continent." | `gauge` / `sparkline` / `stacked-bar` |
| "Add a bar chart of GDP by region — let me brush it to filter." ✅ | `chart` |
| "Add the attribute table as a widget." ✅ | `table` |
| "Add a query builder that returns the matching records." ✅ | `query` (publishes results as an output others consume). |
| "Add a spatial-analysis tool — buffer / dissolve / clip / spatial-join." ✅ | `analysis` (a shell over `@strata/processing`). |
| "Let users switch basemaps from a panel." ✅ | `basemap` (basemap gallery as a widget; store-driven). |
| "Show the items as a filterable gallery of cards." | `gallery` / `list` / `card` |
| "Add a heading and a paragraph." / "a banner image" / "a button" / "a nav menu" / "a divider." | `text` / `image` / `button` / `menu` / `divider` |
| "Embed this web page / dashboard." / "Play this video." ✅ | `embed` (sandboxed iframe) / `video` |
| "Add a light/dark toggle." / "an English/Arabic switcher." ✅ | `theme-switch` / `lang-switch` |
| "Give me a link that reopens the app as I have it now." ✅ | `share` |
| "Add a 'find what's near me' tool." ✅ | `near-me` |
| "Let users add their own layer at runtime." ✅ | `add-data` |
| "Find the best site weighting slope, roads, and land use." ✅ | `weighted-overlay` |
| "Add an elevation profile for a drawn line." ✅ | `elevation` |
| "Reserve a slot here for now." ✅ | `placeholder` |

## 7 · Layout engine & containers (`/app`, `/new-app`)

| Say this | You get |
|---|---|
| "Two columns: map left, KPIs and a chart stacked right." | `row`/`column`/`grid` containers. |
| "Stack these panels in an accordion." ✅ | An `accordion` container. |
| "Lay these out in a wrapping row." ✅ | A `flow-row` container. |
| "Make a section with several views the user can flip between." ✅ | A `views` node (tabs). |
| "Build a slideshow where each slide sets its own map view and filter." ✅ | A `views` node (slides) with per-view `mapState`. |
| "Fade / fly / zoom sections in as I scroll." ✅ | An `animate` (`fade`/`slide`/`scroll-reveal`/`fly`/`zoom`/`rotate`) container + `animateOptions`. |
| "Auto-advance the slideshow every few seconds." ✅ | A `views` node with `autoPlay: { intervalMs }`. |
| "Split the screen with a draggable divider." ✅ | A `splitter` container (resizable). |
| "Pop up a modal window when I click this." ✅ | A `window` node (opened by a `showHide`/`navigate` action). |
| "Dock a collapsible panel on the left." ✅ | A `panel` node (`dock` left/right/top/bottom/float). |
| "Add a header and footer." / "Show a splash intro on load." ✅ | Page `header`/`footer` regions + an app `splash`. |
| "Give it my brand colors / a spacious type scale." ✅ | A structured `theme` (`{ mode, colors, fonts, variables, overrides }`) compiled to `--strata-*` + states. |
| "Make it bilingual EN/AR, right-to-left." | i18n + RTL. |
| "Build a split dashboard / a card gallery / a scrolling story." | `dashboardTemplate` / `cardGalleryTemplate` / `scrollingStoryTemplate`. |

## 8 · Widget interactivity (the WIF)

The framework that makes an app **alive on the first build** — author it declaratively via
`AppLayout.connections`. These phrases should "just work":

| Say this | You get |
|---|---|
| "When I click a category, filter the whole app." ✅ | A `categorySelect → filter` connection. |
| "Selecting a bar filters the map and the table; clearing resets everything." ✅ | Chart→map/table connections + `clear`. |
| "Let me drag-select a range on the chart to filter." 🟡 (click ✅; drag-range needs `echarts`) | A `rangeSelect`/`brush → filter` connection. |
| "Feed the filtered list into the table and the chart." ✅ | An output data source (`dataSource.fromWidget`). |
| "Highlight the same feature everywhere when I select it." ✅ | Linked selection (map bus-sink). |
| "Clicking a card should zoom the map and filter the table." ✅ | `rowSelect → zoomTo` + `filter` connections. |
| "Update the KPIs to whatever is currently in view." ✅ | Extent-driven stats (`extentChange`). |

## 9 · Spatial analysis (`/analyze`)

| Say this | You get |
|---|---|
| "Buffer the schools by 500 m." / "Find the nearest hospital." / "Which incidents are in the flood zone?" | buffer / nearest / points-within. |
| "Merge the districts into regions." / "Clip the roads to the boundary." | dissolve / clip. |
| "Sum the population per region." ✅ | `aggregate` (dissolve-with-stats). |
| "Erase the water from the parcels." / "Combine these polygons." ✅ | difference / union / intersect. |
| "Draw service areas around each station (Thiessen)." ✅ | voronoi. |
| "Show a 10-minute drive-time area." ✅ | isochrone (`fetchIsochrone`). |
| "Where are the statistically significant crime hotspots?" / "Where are the fraud clusters?" ✅ | hotspot (Getis-Ord Gi\*) / hexbin density. |
| "Find the best site weighting slope, roads, and land use." ✅ | weighted overlay (suitability). |
| "How much of our portfolio is in the flood zone?" ✅ | points-within a hazard polygon, then sum a `$` field (the exposure number). |
| "Which tracts have no branch within 2 miles?" / "Who's within 3 km of a major-flood gauge?" ✅ | within-distance flag (banking-desert / at-risk). |

## 10 · Export & share (`/export`)

| Say this | You get |
|---|---|
| "Export the map as a PNG." / "…at higher resolution." ✅ | Image (with `scale`). |
| "Make a proper map PDF with a legend and scale bar." ✅ | A composed PDF (legend/scalebar/north-arrow). |
| "Print one page per district." ✅ | An atlas / map-series. |
| "Generate a one-page report for the selected parcel / incident." ✅ | A feature report. |
| "Make a climate-risk (TCFD / IFRS-S2) disclosure map + a per-region packet." 🟡 | A composed PDF + a per-region atlas (a multi-section disclosure-report *template* is a gap — logged). |
| "Give me a link that opens the app exactly as I have it now." ✅ | A share deep-link + embed. |
| "Give me a shareable web map I can re-open." | The ESRI Web Map JSON spec. |
| "Export this layer as GeoJSON / CSV." | Layer data. |

## 11 · Data, convert & publish

| Say this | You get |
|---|---|
| "Show only countries where population > 10 million." | A `definitionExpression` filter. |
| "What's the total and average population by continent?" | `queryStatistics` (group-by). |
| "Convert this shapefile to GeoParquet in 4326." | `/convert`. |
| "Publish `crashes.parquet` as a FeatureServer." | `/publish` (Strata Serve). |
| "Change the display field and add field aliases." | `/update-metadata`. |

## 12 · Visual editing (`@strata/studio`)

| Say this | You get |
|---|---|
| "Let me see the app and click things to edit them." ✅ | `<StrataStudio>` (preview + outline + inspector). |
| "Move this panel, rename it, and pick a theme — visually." ✅ | The property inspector + theme picker (round-trips the JSON). |

---

## 13 · Composite app patterns (whole patterns to suggest)

When a user describes a **goal** (not a widget), map it to a whole pattern and assemble the blocks above —
this is how a recipe makes a *good UI suggestion* instead of a bare map. Each defaults to the WIF, so it's
alive on the first build.

| Say this (a goal) | Suggest this → what it composes |
|---|---|
| "Build me a dashboard for this data." | **Dashboard** — KPI row + `chart` + paged `table` + `map`, cross-filtered by `connections`. |
| "Let people explore and filter this layer." | **Explorer** — map + `filter` + `date-filter` + `feature-info` + `data-actions` + `add-data`. |
| "Make a scrolling story / a briefing." | **Story** — a `views` node (slides) with per-slide `mapState` + `animate`. |
| "Show these as a filterable gallery." | **Gallery** — `cardGalleryTemplate` + a category rail; card click zooms + filters. |
| "Compare two layers / two dates." | **Compare** — a `swipe` over two `map`s, or `views` flipping saved `mapState`s. |
| "Find what's near me / a drive-time area." | **Proximity** — `near-me` + `/analyze isochrone` + search/routing. |
| "Find the best site for X." | **Suitability** — `/analyze weighted-overlay` + the `weighted-overlay` sliders → a choropleth. |
| "A control-room / situational picture." | **Ops picture** — `hazard` theme + `LayerPanel` + `Legend` + KPI/`gauge` + `TimeSlider` + `controller`. |
| "An imagery viewer." | **Imagery** — `/add-data --imageserver`/`--cog` + `swipe` + a `TimeSlider` on the ImageServer `time`. |
| "Make it shareable / printable." | **Publish-out** — a `share` deep-link + composed PDF + a per-feature `report`. |

**Rule:** open with the composite pattern (so the app is whole), then let the wizard tune the blocks; always
emit the WIF `connections`.

---

## 14 · Domain solution patterns (banking & emergency)

When a user names a **domain outcome** (not a widget or a generic pattern), map it to a whole **solution
recipe** and open with its composite, then run *that recipe's* guided wizard (whose answers assign the app's
defaults). Each is an "ops picture" / "dashboard" composite tuned to the domain; all default to the WIF.

| Say this (a domain goal) | Suggest this recipe → what it composes |
|---|---|
| "Map our loan collateral against flood/quake/wildfire — how much is in the flood zone?" | **Collateral & Portfolio Risk** — hazard overlays + `pointsWithin` collateral × hazard + `$`-exposure KPIs + a TCFD/IFRS-S2 report. |
| "Show our portfolio's climate risk for the regulator/board." | **Regulatory & Climate-Risk Reporting** — hazard exposure + IFRS-S2/TCFD framing + composed report + per-jurisdiction atlas. |
| "Where is our credit / real-estate exposure concentrated?" | **Portfolio Concentration & Exposure** — hexbin/hotspot + group-by stats + concentration KPIs. |
| "Where should we open (or close) the next branch/ATM?" | **Site Selection & Expansion** — FDIC competitors + ACS catchment (`buffer`/`isochrone`) + `weighted-overlay` suitability + banking-desert gaps. |
| "Map the branch/ATM network with performance KPIs." | **Branch & ATM Dashboard** — points + KPI row + charts + paged table, cross-filtered. |
| "Where are the fraud clusters this week?" | **Fraud/AML Dashboard** — hotspot + hexbin + a time filter (sovereign/on-prem is the pitch). |
| "Which communities are underserved / unbanked?" | **Financial Inclusion** — coverage gaps vs. CRA / low-moderate-income tracts. |
| "One live map of incidents, assets, and hazards I can ask in plain language." | **Common Operating Picture** — `hazard` theme + live feeds + KPIs + `TimeSlider` + `controller`. |
| "Who and what is inside the hazard zone?" | **Hazard & Impact Analyzer** — draw/import the zone + `pointsWithin`/`intersect` × population + facilities. |
| "Which units are nearest the incident, and where are they now?" | **AVL / Resource Tracker** — live AVL points (refresh) + nearest-resource (`/analyze nearest`). |
| "Show evacuation zones, routes, and shelters with capacity/status." | **Evacuation & Shelter** — zones/routes/shelters + closures (internal + public variants). |
| "Are the hospitals / power / schools affected by this event?" | **Critical Infrastructure Monitor** — facilities × event footprint + status/dependencies. |
| "Post-event: response times, hotspots, resource utilization." | **After-Action Analytics** — bins/stats/timelines + printable reports. |
| "A public map of what's happening — closures, shelters, safety info." | **Public Crisis Map** — an Atlas public instance over live incident/closure/shelter feeds. |

**Rule:** name the recipe, open with its composite, then run its wizard. Full specs (data + default-assigning
prompts) live in the solution recipes; benchmark to the incumbent (Esri Business Analyst / ArcGIS COP) and
**coexist** — never "replace ArcGIS."

---

## How a recipe uses this page

1. In the recipe's **`## Guided wizard`**, phrase each option so the **default maps to a row above** — e.g.
   *"Symbology? → graduated color by population"* (class-breaks).
2. In the **`§ Prompt-script`**, use the command column verbatim (`/symbology`, `/panel`, `/app`, `/analyze`)
   with the natural-language phrase as the instruction.
3. Prefer ✅ phrases; for 🔶/🟡 rows, name the gap (backend requirement or the optional dep).
