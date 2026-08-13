# strata-map skill pack

How to author a `layers.json` (the ESRI Web Map JSON map spec) and embed `<StrataMap>`.

## Tool cheatsheet
- `/create-map --layers … --preset …` — generate a spec.
- `/add-layer`, `/remove-layer`, `/reorder-layers`, `/set-extent`, `/set-basemap` — edit the spec.
- `<StrataMap maplibregl={…} config={layers.json} />` — render it (React).

## Recipes
1. **Full-page map from two ArcGIS services.** Verify each `?f=json`; build two `operationalLayers`
   (`arcgis-feature`); set `spatialReference {wkid:4326}`; set `initialState.viewpoint.targetGeometry` to
   the union extent; use the default **OpenStreetMap** (open, keyless) basemap — open-source basemaps are the
default, OSM first (`OPEN_BASEMAPS`: OSM · CARTO Positron/Voyager/Dark · OpenTopoMap). Preset `FullPage`.
2. **Strata-served layer.** `source:{kind:"strata", dataset:"fhsz"}`; the URL resolves on the Serve
   server; pull styling from the metadata bundle.
3. **Near-real-time layer.** Set `refreshIntervalSeconds: 300` on a live incident service.
4. **Raster imagery.** ESRI **ImageServer** → `source:{kind:"imageserver", url, renderingRule?, timeField?}`
   (the engine builds an `exportImage` tile source; `renderingRule` = band combo/stretch). A **COG**
   (cloud-optimized GeoTIFF) → `source:{kind:"cog", url}` rendered via the optional
   `@geomatico/maplibre-cog-protocol` (`cog://`). Add with `/add-data --imageserver` / `--cog`; recipe
   `imagery-viewer`. Time-animate a mosaic by driving the ImageServer `time` param from a `TimeSlider`.

## Reference (ESRI Web Map)
Top-level: `version`, `spatialReference`, `initialState.viewpoint.targetGeometry` (extent envelope),
`baseMap.baseMapLayers[]`, `operationalLayers[]`. Per layer: `id`, `title`, `url`, `layerType`, `source`,
`visibility`, `opacity`, `layerDefinition.definitionExpression`, `layerDefinition.drawingInfo.renderer`,
`popupInfo`, `fields`. App-proprietary data → `strata:extensions`.

## Map chrome — shipped as `MapChrome`, and the vocabulary to hand-build
**Layers and basemap belong on the map, not in the page header** — they change what the map shows, and a
reader looking at the map should not travel to the top of the page to change it.
One **inline-SVG control cluster**, top-right, 32 px buttons on `currentColor` (so they invert with the
theme for free), with MapLibre's own zoom control **suppressed** so there is never a second set. Drawers
(layers · basemap · legend) open **beside** the cluster, never over it, and **only one at a time** — a
second request switches mode rather than stacking. The **legend is its own panel bottom-left** with live
counts; the **EPSG:4326 status readout sits bottom-right**. Shortcuts: `L` layers · `B` basemap ·
`G` legend · `F` fit, `Esc` closes. Basemap options carry a **live tile of the current area** — a colour
swatch cannot tell Positron from Voyager.

**On the React path you get all of it by default.** `<StrataMap controls={{navigation:true,
layerList:true, basemapSwitcher:true, legend:true}}/>` renders `MapChrome` (`@strata/core-map`
`react/controls/MapChrome.tsx`): the six glyphs (`CHROME_ICONS` — plus · minus · home · layers · base ·
legend), the drawer at `right:47px`, layer rows as **square** checkboxes and basemap rows as **round**
radios with live tiles and a "Follow the theme" row. `controls.position` moves cluster and drawer
together; `controls.cluster:false` restores the older always-open boxes. **On the house (vanilla) path
you write it** — the same class vocabulary (`mapctl` / `drawer` / `opt` / `box` / `box.round` / `thumb`),
which is why the two look identical.

**The tick must name the effective basemap.** With "Follow the theme" on — the default — an
`id === chosenId` test ticks nothing, so the drawer offers five options and shows none in force, leaving
no way to tell which basemap you are looking at. "Follow the theme" says HOW the choice is made; it does
not stop there being a choice. **Both rows tick.**

## Known traps
- Extent is an **envelope** `{xmin,ymin,xmax,ymax,spatialReference}`, not a bare `[w,s,e,n]`.
- Always set `spatialReference` explicitly (EPSG:4326).
- Read field names from the service — never invent them.
- **A failed async step during boot must not strand the map.** An unguarded `await` that rejects leaves
  a rendered shell with no data and no error — catch each boot step, report it in the notice bar, and
  keep the rest usable.
- **Open on a view where the app's signature is visible.** One build opened on its hierarchy root, which
  left the signature band empty and zero hatched blocks on screen — every non-visual test was green.
  Confirm by screenshot, not by reasoning.
- **A map built inside a `hidden` container has no size**, so its boot-time `fitBounds` computes against
  nothing and revealing the page resizes but never re-fits. **Fit on first reveal.** A canvas reporting
  `[0, 0]` is a layout problem, not a data one.
- **Fit to the subject, not to the items.** Fitting an item extent zoomed out to a whole region because
  the register publishes some features as city-spanning geometries; the subject was the search ring.
- **An explicit basemap choice must survive a theme swap** — re-pair the basemap only while the user has
  not chosen one. An unknown basemap id (from a stale link) falls back rather than blanking the map.
- **`beforeId` throws when the reference layer is absent** — true on the first hover before the map
  paints, and for a frame after a theme swap wipes the style.
- Full catalogue: `strata/docs/troubleshooting.md` §7.
