/**
 * Coverage matrix — SOURCE OF TRUTH.
 *
 * Edit this file to update the component × behavior coverage matrix, then run:
 *   node strata/docs/maintainers/testing/gen-coverage.mjs
 * which regenerates both `component-coverage.md` and `coverage-matrix.html` from this data and
 * validates it against the real tests in `packages/core-map/tests/react/*.test.tsx`.
 *
 * Behavior status: "ok" (a direct passing test) · "partial" (indirect/aspirational — see note) ·
 * "browser" (covered by the browser smoke test) · "gap" (no test yet).
 *
 * INVARIANT enforced by the generator: for any component that HAS a dedicated `<Name>.test.tsx`
 * file, the number of "ok" behavior rows must equal the number of `it()` cases in that file. So when
 * you add a test, add its behavior row here (and vice-versa) or the generator fails.
 */

export const meta = {
  title: "Component × Behavior Coverage",
  subject: "@strata/core-map · react layer",
  testDir: "packages/core-map/tests/react",
  mdPath: "strata/docs/maintainers/testing/component-coverage.md",
};

export const tiers = [
  {
    name: "Widgets",
    tag: "Tier 1 · pure / presentational",
    components: [
      { name: "KpiCard", behaviors: [
        ["ok", "label / value / unit render"],
        ["ok", "positive delta → ▲ glyph + magnitude"],
        ["ok", "negative delta → ▼, magnitude not sign"],
        ["ok", "delta chip omitted when absent / NaN"],
        ["gap", "status accent stripe (ok/warn/critical)"],
        ["gap", "icon slot + inline sparkline"],
      ] },
      { name: "Sparkline", behaviors: [
        ["ok", "one polyline point per datum"],
        ["ok", "empty data degrades to empty box"],
        ["ok", "width / height honored on svg"],
        ["gap", "color prop applied to stroke"],
      ] },
      { name: "StatRow", behaviors: [
        ["ok", "label / value / unit render"],
        ["ok", "divider on by default, off via prop"],
        ["gap", "leading icon slot"],
      ] },
      { name: "Text", behaviors: [
        ["ok", "renders <p> by default"],
        ["ok", "renders requested intrinsic element"],
      ] },
      { name: "Divider", behaviors: [
        ["ok", "role=separator, horizontal default"],
        ["ok", "vertical orientation geometry"],
      ] },
      { name: "Button", behaviors: [
        ["ok", "<button> + onClick fires"],
        ["ok", "renders anchor when href set"],
        ["ok", "ghost variant → transparent bg"],
        ["gap", "primary variant styling"],
      ] },
      { name: "Card", behaviors: [
        ["ok", "title + body children"],
        ["ok", "renders anchor when href set"],
        ["ok", "onClick fires"],
        ["ok", "hover lift when interactive"],
        ["gap", "no hover when non-interactive"],
      ] },
      { name: "Container", behaviors: [
        ["ok", "flex + direction in flow mode"],
        ["ok", "position:relative in fixed mode"],
        ["gap", "gap prop"],
      ] },
      { name: "Image", behaviors: [
        ["ok", "src / alt / default cover fit"],
        ["ok", "contain fit"],
      ] },
      { name: "Menu", behaviors: [
        ["ok", "entry per item + onSelect fires"],
        ["ok", "item with href → link"],
        ["gap", "hover highlight state"],
      ] },
      { name: "RadialGauge", behaviors: [
        ["ok", "rounded value readout"],
        ["ok", "clamps to 0..100"],
        ["ok", "green above critical band"],
        ["ok", "red below warn band"],
        ["ok", "invertColors reverses mapping"],
        ["gap", "amber warn band + label caption"],
      ] },
      { name: "StackedBar", behaviors: [
        ["ok", "rect per positive series + legend"],
        ["ok", "ignores non-positive values"],
        ["ok", "widths proportional to share"],
        ["gap", "vertical orientation + title"],
      ] },
      { name: "ListGallery", behaviors: [
        ["ok", "template rendered per item"],
        ["ok", "item index passed to template"],
        ["ok", "column count layout"],
        ["gap", "gap prop"],
      ] },
      { name: "TimeSeries", behaviors: [
        ["ok", "line + marker per point"],
        ["ok", "threshold band drawn behind"],
        ["ok", "title = accessible label"],
        ["ok", "onPointClick(index) fires"],
        ["ok", "empty data without throwing"],
        ["gap", "hover enlarges marker"],
      ] },
    ],
  },
  {
    name: "Controls",
    tag: "map overlays",
    components: [
      { name: "Legend", behaviors: [
        ["ok", "legendRows: simple renderer + rgba coercion"],
        ["ok", "legendRows: uniqueValue + default row"],
        ["ok", "legendRows: classBreaks rows"],
        ["ok", "legendRows: [] when no renderer"],
        ["ok", "component: group title + row per class"],
        ["ok", "visibleOnly hides non-visible → null"],
        ["ok", "visibleOnly=false includes hidden"],
        ["gap", "heatmap renderer row"],
        ["gap", "swatch shape point / line / fill"],
      ] },
      { name: "StatusBar", behaviors: [
        ["ok", "zoom / CRS / placeholder readout"],
        ["ok", "coordinate updates on mousemove"],
        ["ok", "crs prop honored"],
        ["gap", "scale (1:N) computation"],
        ["gap", "showCoords / showZoom / showScale toggles"],
      ] },
      { name: "TimeSlider", behaviors: [
        ["ok", "instant `<=` clause, fires on mount"],
        ["ok", "window BETWEEN clause"],
        ["ok", "re-applies filter on slider move"],
        ["ok", "play advances + label flips"],
        ["gap", "pause stops / loops at max"],
        ["gap", "custom formatLabel"],
      ] },
      { name: "MeasureControl", status: "partial", behaviors: [
        ["ok", "distance / area buttons render"],
        ["ok", "reverts store to identify on unmount"],
        ["gap", "arm → measure → readout flow"],
        ["gap", "setInteractionMode('measure')"],
      ], note: "Full flow needs a faked lazy TerraDraw module — shared with SketchControl." },
      { name: "NativeControls", status: "browser", untested: true, behaviors: [
        ["browser", "mounts NavigationControl + ScaleControl"],
      ], note: "Imperative maplibre calls — verified via the browser smoke test." },
      { name: "SketchControl", status: "gap", untested: true, behaviors: [
        ["gap", "sketch mode transitions + geometry"],
      ], note: "Same lazy-TerraDraw shape as MeasureControl; unlocked by one shared fake." },
    ],
  },
  {
    name: "Panels",
    tag: "docked / floating UI",
    components: [
      { name: "LayerPanel", behaviors: [
        ["ok", "row per layer + empty state"],
        ["ok", "toggle → store.setVisibility"],
        ["ok", "range → store.setOpacity"],
        ["ok", "row click → setActiveLayer"],
        ["ok", "remove → store.removeLayer"],
        ["gap", "reorder move up / down"],
        ["gap", "rename + add-layer flow"],
      ] },
      { name: "BasemapPanel", behaviors: [
        ["ok", "buildBaseMap: vector (style)"],
        ["ok", "buildBaseMap: raster (tiled)"],
        ["ok", "lists basemap options"],
        ["ok", "click → setBaseMap + onApplyBasemap"],
        ["gap", "active ✓ indicator"],
        ["gap", "add-basemap flow"],
      ] },
      { name: "AttributeTablePanel", behaviors: [
        ["ok", "inferred columns + row count"],
        ["ok", "field aliases on headers"],
        ["ok", "row click → onRowSelect + bus (numeric OID)"],
        ["ok", "per-column filter"],
        ["gap", "sort on header click"],
        ["gap", "column hide/show + CSV export"],
      ] },
      { name: "CartoPanel", behaviors: [
        ["ok", "lists store layers"],
        ["ok", "visibility toggle via store"],
        ["ok", "category widget → onFilter + bus"],
        ["ok", "add-widget spec"],
        ["gap", "remove widget / clear filter"],
        ["gap", "formula / histogram / timeseries widgets"],
      ] },
      { name: "EditPanel", behaviors: [
        ["ok", "advisory + editable fields (not OBJECTID)"],
        ["ok", "disabled when no FeatureServer url"],
        ["ok", "Save → applyEdits update + success"],
        ["gap", "add mode + delete"],
        ["gap", "field-type coercion"],
      ] },
      { name: "PanelShell", status: "partial", behaviors: [
        ["partial", "title / menu / close (via every panel)"],
        ["gap", "drag / resize / floating chrome"],
      ], note: "Exercised indirectly through all panels; no dedicated test." },
      { name: "ChartPanel", status: "gap", untested: true, behaviors: [
        ["gap", "chart over attribute rows"],
      ], note: "EASY next add — static rows like AttributeTablePanel." },
      { name: "AttachmentViewer", status: "gap", untested: true, behaviors: [
        ["gap", "attachment pager + media view"],
      ], note: "Needs a fake DataClient returning attachment infos." },
      { name: "AskPanel", status: "gap", untested: true, behaviors: [
        ["gap", "conversational query UI"],
      ], note: "AI layer is OFF this release — intentionally deprioritized." },
    ],
  },
  {
    name: "Top-level",
    tag: "host + infra",
    components: [
      { name: "StrataMap", status: "browser", behaviors: [
        ["browser", "map renders + layers + controls (smoke)"],
        ["gap", "resize fills late-sized container"],
      ], note: "WebGL host — browser smoke test, not jsdom. Resize fix in progress." },
      { name: "ErrorBoundary", status: "gap", untested: true, behaviors: [
        ["gap", "renders fallback on child throw"],
      ], note: "Trivial jsdom add, high value — guards the whole app." },
      { name: "i18n", status: "gap", untested: true, behaviors: [
        ["gap", "key lookup + {var} + RTL direction"],
      ], note: "Trivial jsdom add." },
    ],
  },
];

export default { meta, tiers };
