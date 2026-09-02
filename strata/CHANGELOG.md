# Changelog

All notable changes to `strata-app-builder` are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed — the default basemap is a keyless vector style, and "keyless" is now asserted as behaviour

- **`defaultBaseMap()` returns OpenFreeMap Positron.** It used to return raster
  `tile.openstreetmap.org`, which answers **HTTP 200 with an *"Access blocked"* image** to a client it
  judges outside the OSMF tile-usage policy. `OPEN_BASEMAPS` is now `VECTOR_BASEMAPS` (OpenFreeMap
  Positron/Dark/Liberty · Versatiles Colorful/Eclipse · CARTO GL) followed by the new
  **`RASTER_BASEMAPS`** (OSM, OpenTopoMap) — offered, never defaulted to. A GL style is also the only
  form that gives a dark theme a real dark ground rather than a light one dimmed.
- **The three CARTO *raster* presets are gone.** `basemaps.cartocdn.com/{light_all,dark_all,rastertiles}`
  answers HTTP 200, `image/png`, with the real map and **"API KEY REQUIRED · carto.com/basemaps/apikey"
  composited diagonally across every tile**. It passed a host check, a `!key=` check and an
  `img.naturalWidth > 1` check; only a screenshot caught it. The CARTO **GL styles** are a different
  product, re-verified keyless end to end, and are kept — demoted below OpenFreeMap.
- **The basemap drawer previews a vector row.** `BasemapPanel` and `MapChrome` painted an empty box for
  every option without a `templateUrl` — the same wall of grey boxes the live-tile rule exists to
  prevent, arriving through a new door. New `useStyleColors` / `readStyleColors` read the style's own
  background, water and road out of its style document; `tileBackground` takes them and paints a
  gradient. Only a successful fetch is cached, so one bad minute on a tile host cannot blank a row for
  the life of the page.
- **New exports:** `RASTER_BASEMAPS`, `basemapUrl(preset)` (one place for a guard to read a preset's URL
  in whichever form it takes), `useStyleColors`, `readStyleColors`, `type StyleColors`.
- **The guard no longer greps for `key=`.** `tests/basemaps.test.ts` asserts the shape that cannot lie —
  every preset resolves to exactly one keyless https URL and carries exactly one of `style`/`templateUrl`,
  the default is a vector style, every preset credits OpenStreetMap, and a **deny-list** names every host
  already caught serving a placeholder. Positive proof stays behavioural (two different tiles must differ
  in bytes; a style must parse with every host it delegates to keyless too), because a unit test cannot
  see a watermark. Full entry: `docs/troubleshooting.md` §5.
- **Migration:** none required — `defaultBaseMap()` keeps its signature and an authored `layers.json`
  basemap still wins on mount. An app that hard-codes `carto-positron`, `carto-voyager` or `carto-dark`
  (the raster ids) must move to `openfreemap-positron` / `openfreemap-dark` / a `carto-*-gl` style.
  The `WebMaps/` starters and the eleven docs that named CARTO as the keyless house set were updated.

### Fixed — the legend, the layer list, and the popup now agree with the map

- **The popup is readable in a dark theme.** MapLibre paints `.maplibregl-popup-content` white and sets
  no `color`, so the text colour is inherited — `var(--strata-fg)`, which is near-white in every dark
  theme. Clicking a feature opened a popup that rendered white-on-white with a white tip on a dark map,
  and reported as *"the popup doesn't work"*. New **`ensurePopupStyles()`** (`engine/popups.ts`, injected
  by `initPopups`, so no app wires it) takes the card from `--strata-panel-bg`, the text from
  `--strata-fg`, the edge from `--strata-border`, repaints the tip for all four anchors and gives the
  close button an explicit colour. Every token keeps a light fallback, so an unthemed `<StrataMap>` is
  unchanged.
- **The legend follows the store, so showing/hiding a layer reaches it.** `Legend`'s `layers` prop is now
  **optional**: with it omitted the legend subscribes to the store — the same store the layer panel and
  the map-controls drawer write to — via the new shared **`useStoreLayers`** hook. An app-layout
  `{"type":"legend"}` widget previously received no `layers` at all (`<StrataApp>` threads
  `store`/`bus`/`outputs`, never `layers`), and one authored with an explicit array was a snapshot of the
  spec that no toggle could change. Pass an array only to list a deliberate subset.
- **The legend lists every visible layer, not every *styled* one.** A layer whose symbology belongs to
  the service (no authored `drawingInfo`), or one drawn by a renderer with no discrete classes, was
  silently dropped — while still drawing on the map. It now gets a row with its title and a **neutral**
  swatch (never an invented colour), rendered as a caption rather than a filter button since it has no
  classes to hide. `includeUnstyled:false` restores the strict symbology-key reading.
- **The layer panel shows each layer's symbology.** `LayerPanel` rows carried a generic `▤` glyph, so
  identifying which of five polygon layers was the blue one meant reading the legend. Rows now render the
  layer's own swatch — a class stack plus an `N ▸` that expands the full class list for
  `uniqueValue`/`classBreaks` — from the same `legendRows()` the Legend reads, so the two surfaces cannot
  disagree. `MapChrome`'s layers drawer likewise shows every class (capped, then `+N`) instead of only
  the first, which had named one of a renderer's ten colours and implied the layer was that colour.
- `Legend` now exports `Swatch`, `shapeForRenderer`, `shapeForGeometryType` and the `LegendRow` type, and
  memoizes its entries (they were a dependency of the `Esc` listener, re-subscribing it every render).

### Added — the map follows the theme
- **Switching light↔dark now swaps the basemap.** `<StrataApp>` resolves the app's theme mode once
  (`theme.mode`, with `"auto"` following `prefers-color-scheme`), shares it on `StrataAppEnv.themeMode`,
  and swaps the basemap to its pair when the mode changes. `theme-switch` reports every switch, so the
  UI and the map can no longer drift apart. Applies to every app with no wiring or config.
  - **The authored basemap wins on mount** — the swap fires on a *change* of mode, never on first paint,
    so a `layers.json` `baseMap` is never silently discarded.
  - **An explicit pick outranks the theme** — the basemap drawer and `BasemapPanel` now share **one**
    flag, `store.baseMapFollowsTheme`, instead of a local `auto` each.
  - **The swap is transient** — `setBaseMap(bm, { transient: true })` keeps a theme toggle out of the
    undo history and out of `toLayersJson()`.
  - `theme.basemap` (`ThemeSpec`) opts out or pins the pair: `{ follow:false }` / `{ light, dark }`.
- **`basemapForThemeFrom(library, mode)`** — the single resolver for "which basemap pairs with this
  mode", now used by the swap, `MapChrome`'s drawer and `BasemapPanel`. They previously disagreed (the
  drawer took the first preset of the mode, `basemapForTheme` preferred the vector one), so the drawer
  could tick one basemap while the map drew another.
- **`MapChrome`/`BasemapPanel` read the theme mode from the app** when no `themeMode` prop is given; the
  drawer used to default to `"light"` and tick the light basemap inside a dark app. `<StrataMap>` takes an
  explicit `themeMode` for use outside a `<StrataApp>`.
- **`applyBaseMap` is race-safe.** Vector basemaps load asynchronously while `clearBasemap` is
  synchronous, so a fast theme flip could let a superseded style paint over the winner; each application
  now takes an epoch per map and stale loads are dropped.

### Added — the house map chrome, an interactive legend, and the row gesture
- **`MapChrome` (`@strata/core-map` `react/controls/MapChrome.tsx`)** — the control vocabulary the shipped
  builds converged on, now in the library: one 32 px cluster (**zoom in · zoom out · fit · layers ·
  basemap · legend**, the six inline-SVG glyphs), MapLibre's own zoom suppressed, and **one** drawer
  opening beside the cluster. Layer rows are square checkboxes stating *off* / *N in view* / *none in
  this view*; basemap rows are **round radios** with a live tile of the current area in each style and a
  "Follow the theme" row. Keyboard `L`/`B`/`G`/`F`, `Esc` closes. **On by default** whenever
  `controls.navigation`, `layerList` or `basemapSwitcher` is set — `controls.cluster:false` restores the
  older always-open boxes. `controls.position` moves cluster and drawer together; geolocate/fullscreen
  move to the opposite corner.
- **The `Legend` is a control surface, not a caption** (`interactive`, default true): click a class to
  hide it, shift-click to isolate, `Esc` clears. It builds a genuine `definitionExpression` on the
  renderer's own field (`legendWhere` — `IN`/`NOT IN` for `uniqueValue`, range predicates for
  `classBreaks`) and applies it through `store.setDefinition`, so a legend row **filters rather than
  fades**. `counts` renders `n of N`, and the hint states that isolating changes the map, not the reading.
- **`BasemapPanel` is a radiogroup** — one basemap always in force and always ticked (including under
  "Follow the theme", where **both** rows tick), live tile thumbnails via `previewTile`/`tileBackground`,
  the new `map` and `themeMode` props, and the keyless house rule stated on the panel.
- **The table row is a toggle.** Clicking a row adopts the record — the map flies to **that feature**
  (not its layer's extent) and opens its `popupInfo`; clicking it again releases it, clearing the
  selection and closing the popup. The row carries `aria-selected`.
- **`initPopups` now returns a `PopupSurface`** — still callable as the dispose function, plus
  `showFeature(layerId, oid)` and `close()`, and it tracks one popup instance instead of leaking one per
  click. New exports `featureByOid` and `centroidOf`.
- **+38 tests** (`Legend.test.tsx` +20 incl. `MapChrome`, `BasemapPanel.test.tsx` +11,
  `AttributeTablePanel.test.tsx` +4, `storeBinding.busSink.test.ts` +3).

### Changed — the selection contract
- **`oids` are now `Array<number | string>`** across `@strata/state` (`Selection`), `@strata/actions`
  (`FeatureSelectPayload`, `HoverPayload`, `DataActionContext`, `ConnectOptions.onSelect`) and
  `LayerRegistry.highlight`. An object id is whatever the service says it is — real layers publish string
  keys (`troubleshooting.md` §1), and coercing them addressed the wrong rows with no error.
- **An empty `oids` is a RELEASE, not a no-op.** The map's bus sink clears the store selection, drops the
  highlight and closes the popup. `FeatureSelectPayload` gained `popup?`, and `zoom:true` now means *fly
  to the record*.

### Added — resizable panels
- **Every panel is now resizable, by default.** The dragged size is session state, so the authored width
  stays the source of truth and a reload returns to it.
  - **`PanelShell`** (the chrome under `LayerPanel`, `BasemapPanel`, `AttributeTablePanel`, `ChartPanel`,
    `CartoPanel`, `FilterPanel`, `QueryPanel`, `DateFilter`, `FeatureInfoPanel`, `AnalysisPanel`,
    `EditPanel`, `AttachmentViewer`, `AskPanel`, `SavedItemsPanel`) gained `resizable` (default `true`),
    `defaultHeight`, `minWidth`/`maxWidth` (200/960), `minHeight`/`maxHeight` (120/900) and `onResize`.
    A docked panel gets a width grip; a floating one adds a height grip and a corner.
  - **The `panel` container node** (`<StrataApp>`) gained the same behaviour plus `minWidth`/`maxWidth`
    in `@strata/schema`; `width` is now the **starting** size. The grip sits on the edge facing the
    content, so a right-docked panel grows leftward.
  - **Grips are keyboard-operable** — a focusable `role="separator"` sized with the arrow keys
    (`Shift` = 48 px step), because a 6 px pointer target excludes keyboard and touch users.
  - **`resizePanel`** — the pure, unit-tested clamp behind both surfaces (`react/app/splitterMath.ts`),
    which measures from the gesture's start so a drag past a clamp returns with the pointer.
  - Authoring surface updated to match: `/panel` (`--width`/`--min-width`/`--max-width`/`--no-resize`),
    the `strata-panels`, `strata-layout` and `strata-app-build` skills, `COMPONENT-MANIFEST.md`, all four
    reference views, `app-design.md` (house default + ship checklist) and `building-apps.md` (the shell,
    the harness assertions). The house pattern gets a vanilla `resizable()` recipe, since those apps have
    no React.
  - **+21 tests** (`PanelShell.test.tsx` 11 · `panel.test.tsx` +6 · `splitterMath.test.ts` +4).

### Added — the build pipeline
- **`/recipe` now builds a finished app**, not a scaffold: it checks the recipe against the contract in
  `recipes/README.md`, verifies every service before any code is written, builds, runs three harnesses
  (live · offline render · real headless Chrome over CDP), drives the result, and walks both gates.
- **`strata/docs/guide/building-apps.md`** — what a finished app is, the three-harness standard, the
  build gate, and the shipped interaction bar.
- **`strata/docs/how-to/find-and-verify-data.md`** — the house data defaults and the seven-step probe.
- **`.claude/skills/strata-app-build/`** — how to write the server, the injectable seam and all three
  harnesses. Instructions, not a library.
- **`strata/docs/troubleshooting.md`** grew from 30 to 535 lines: every trap that has cost a rebuild,
  status-marked, with §11 listing core defects whose old workarounds are now obsolete.

### Fixed
- The **OID rule** was stated absolutely in five places (`CLAUDE.md`, `agents/qa.md`, two skills, the
  component manifest). It is directional: guaranteed only on layers *you* publish; on any other service
  read `objectIdFieldName`. Real layers use `FID` while carrying a different column named `OBJECTID`.
- Test and package counts corrected everywhere: **796 tests**, verified by running them
  (`pnpm install && pnpm -r build && pnpm test` — the build step is required). The repo has **20
  packages**, of which **18 carry suites**; the count had been stated as 737/18 and 769/20 in different
  files, and none of the three matched the runner.
- **A resized panel no longer claims to be remembered.** The `strata-layout` skill said splitter and rail
  gutters persist to `localStorage` and reset on double-click; neither was implemented. The rule is now
  stated as it is built — session state, and an app that wants persistence owns it.

