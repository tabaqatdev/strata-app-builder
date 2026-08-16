# Changelog

All notable changes to `strata-app-builder` are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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

