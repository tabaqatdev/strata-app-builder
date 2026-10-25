# Troubleshooting & known traps

Hard-won lessons. Every entry cost a rebuild, a wrong number on a screen, or a shipped defect.

**Read the reading traps (§1–§5) before binding an app to any service you did not publish yourself, and
the publishing traps (§6) before running `/publish`.**

## How to read an entry

| Marker | Meaning |
|---|---|
| `[core: fixed]` | Was a defect in `strata/packages`. **Fixed — do not apply the old workaround.** Kept because the symptom looks identical when it comes from elsewhere. |
| `[core: open]` | A current limitation. The workaround is live. |
| `[data]` | External service behaviour. Will never be "fixed" — guard against it. |
| `[app]` | A mistake an app made. Structural: easy to repeat. |
| `[browser]` | Platform, CSS or runtime behaviour. |

Where two entries disagree, the newer wins. Sources, newest first: the **live-position build** (22 Oct — the a-layer-named-AVL-is-not-a-position-feed, an-event-log-is-not-a-position-feed, an-unconditional-query-answers-304, an-initial-attack-feed-mixes-reports, a-statewide-station-layer-is-not-every-station, showHide-cannot-toggle, no-nearest-of-a-type, four-more-widgets-ship-app-local, a-click-delegate-catches-the-vendored-controls, a-submit-button-fires-twice and a-theme-switch-surfaces-AbortError entries; extensions to the-feed-is-up-but-the-number-is-old (poll vs receipt vs fix time), renamed-service-499 (withdrawn by unsharing), blank-during-its-own-reload, freshness-is-re-implemented-per-app, a-trigger-nothing-emits, a-generated-lane-drawn-at-the-same-weight, setStyle-drops-your-layers, refreshLayers-on-every-idle, the gallery-licence-tag reopening, queryRenderedFeatures-in-flight, Windows-traversal and the loopback bind collision), the **data compact build** (22 Oct — the OpenFEMA-silently-returns-1000, a-stated-rebuild-schedule-is-not-a-stamp, a-record-that-never-publishes-an-end, a-cumulative-layer-counts-history, a-standard's-element-names-from-memory, a-bounding-box-is-not-the-county and five-more-widgets-ship-app-local entries; extensions to long-GET-answers-HTML, metadata-and-rows-from-different-cache-fills, freshness-is-re-implemented-per-app and export-has-no-dispatcher), the **lifeline board build** (21 Oct — the one-water-system-several-polygons, a-POU-layer-mixes-CCAs, intersects-is-not-served, co-location-is-not-dependency, truncated-200-JSON, cadence-from-two-reads, metadata-and-rows-from-different-cache-fills and three-widgets-ship-app-local entries; the gallery-does-not-render-the-licence-tag reopening; extensions to two-feeds-spell-counties-in-different-cases, no-retrievable-vintage, point-in-polygon-ignores-holes, no-setLayerVisibility, no-geometry-for-a-vanilla-app, freshness-is-re-implemented-per-app and timer-never-fires), the **impact zone build** (21 Oct — the empty-statistic-is-a-row-of-nulls, statewide-group-by-is-a-coin-toss, footprints-pre-date-the-fire, occupancy-class-is-not-what-it-says, edit-stamp-moves-without-the-data, divided-highways-counted-twice, buffering-a-published-perimeter-costs-seconds, URL-changes-every-school-year, draw-tool-emits-no-finish, no-setLayerVisibility and no-geometry-for-a-vanilla-app entries; extensions to long-GET-answers-HTML, a-perimeter-layer-keeps-every-version and a-trigger-nothing-emits), the **incident situation map build** (21 Oct — the two-id-forms-for-one-evacuation-zone, an-order-that-never-expires, a-camera-image-that-loads-is-not-a-working-camera, lane-closures-are-mostly-planned-work, a-current-incidents-layer-carries-prescribed-burns, one-incident-two-sizes, a-perimeter-layer-keeps-every-version, NWS-alerts-carry-no-geometry, shelter-registers-that-must-not-be-summed, a-4326-distance-query-rejected-without-outSR, an-app-owned-drawer-must-start-hidden, no-action-adds-a-layer, freshness-is-re-implemented-per-app and a-static-server-cannot-reach-a-no-CORS-feed entries; extensions to blank-during-its-own-reload, the-feed-is-up-but-the-number-is-old and AttributionControl-renders-expanded), the **watch wall build** (21–22 Oct — the Year-to-Date-holds-this-year-only and one-dropped-basemap-request-is-a-permanent-failure entries, an extension to areaDesc-is-zones-not-counties for SAME codes across a state line, the alerts-history-carries-Test-messages, the two-feeds-spell-counties-in-different-cases, a-feed-that-has-not-answered-is-not-a-zero, areaDesc-is-zones-not-counties and a-token-gated-layer-shows-its-499-only-as-JSON entries, and a second occurrence of a-display-rule-outranks-[hidden]), the **watch wall research** (21 Oct — the long-GET-answers-404-HTML, blank-during-its-own-reload, rolling-window-count-falls, current-layer-drops-the-finished and the-feed-is-up-but-the-number-is-old entries), the **facilities & space utilisation build** (7 Sep - the unique-identifier-is-not-unique-and-is-unique-one-scope-down, null-class-bigger-than-every-reported-class, publishes-a-value-has-two-honest-readings, two-registers-of-one-publisher-disagree-on-the-same-feature, a-ratio-not-bounded-by-1, identity-fields-empty-today-on-a-weekly-service, one-bad-coordinate-poisons-the-published-extent, the-largest-class-is-the-least-visible-mark, marks-rasterised-once-from-one-palette, a-capped-scrollable-popup-paints-a-slab, dataset-must-write-through-to-the-attribute and a-deliberate-navigate-reads-as-a-failed-request entries, an-ungated-styledata-retry-reports-failure-over-a-drawn-map, a-WebGL-canvas-cannot-be-pixel-probed, a-preview-zoomed-too-far-in-is-blank-too, an-unencoded-traversal-never-reaches-the-server and two-panels-one-helper-disagree-about-direction entries, and a second occurrence of reinstalling-from-styledata-runs-too-early), the **property hazard exposure build** (7 Sep — the Socrata-number-is-a-JSON-string, Socrata-default-page-is-1000-with-no-flag, a-drawing-tolerance-is-not-a-measurement-frame, a-membership-test-accepts-the-class-that-means-none, point-in-polygon-ignores-holes, three-failure-modes-in-one-estate, keyless-and-still-unlicensed, a-regex-drops-rows-whose-optional-cell-is-empty, a-bare-CR-desynchronises-a-PDF-walker and derive-a-population-bound-the-app-can-contradict entries, and second occurrences of load-and-isStyleLoaded-never-fire and flex-basis-beats-width), the **valuation & taxation base map build** (7 Sep — the objectIdField-null-and-the-neighbour's-decoy, offset-paging-is-quadratic, group-by-caps-and-resultOffset-will-not-page-it, two-counting-paths-disagree, returnDistinctValues+returnCountOnly-is-intermittent, sentinel-size-depends-on-the-filter, integer-sum-returns-an-empty-array, three-reserved-outStatisticFieldNames, String-year-and-only-two-casts-work, ordinal-ranks-over-ties-are-order-dependent, STArea-is-in-the-storage-projection's-units, published-centroid-is-Null-Island, cached-tiles-are-row-before-column, the-rejected-sources-table-decays-too, three-declarative-wires-that-do-not-work, state-hue-lookup-throws-on-the-rare-row, seven-previews-were-one-tile, a-transcribed-count-goes-stale-in-days, per-scope-quantiles-are-not-the-shipped-answer and a-harness-that-spawns-browsers-is-a-load-generator entries, and a second occurrence of pointer-and-keyboard-disagree-about-direction), the **development pipeline tracker build** (7 Sep — the row-is-not-the-thing-you-are-counting, join-key-identifies-a-filing-not-a-project, date-field-named-for-a-different-stage, empty-string-in-a-nullable-column, lexicographic-and-numeric-differ-by-one-row, name-join-fails-on-a-diacritic, DateOnly-serialises-as-a-string, objectIdFieldName-null-but-the-ids-endpoint-names-it, has-data/no-data-is-not-enough-states, a-cohort-rule-moves-a-percentile-more-than-the-data-does, an-epoch-cancels-in-a-subtraction, load-and-isStyleLoaded-never-fire, a-display-rule-outranks-[hidden], canvas-sized-before-the-flex-box-settled, a-status-line-that-reports-intention and pointer-and-keyboard-disagree-about-direction entries), the **portfolio & asset register build**
(7 Sep — the break-right-that-is-not-a-break-right, keyless-host-403s-a-request-with-no-User-Agent,
two-layers-of-one-map-in-different-spatial-references, greedy-attribute-regex-swallows-the-next-cell,
guard-matches-its-own-prose-three-times, zero-byte-tile-at-200, service-name-misspelled-while-the-layer-is-not,
a-name-is-not-a-vintage, absence-in-a-partial-coverage-layer-is-a-jurisdiction, documented-field-name-is-not-the-served-one,
suppression-zeroes-one-column-not-the-other, one-table-two-readings-2.1x-apart, spreadsheet-is-a-service-with-worse-manners
moveend-refetch-loops-through-MapLibre's-own-ResizeObserver, column-flex-splitter-collapses-to-zero,
nowrap-title-widens-the-layout-viewport and the `TimeSlider`-is-not-a-registry-widget
gap), the **tenant mix & catchment build** (3 Sep — the drawn-ring-and-its-stated-radius, DBSCAN-cluster-smaller-than-min_samples, keyless-is-not-unmetered, label-over-a-bar-fill and paint-before-sources-is-dropped entries), the **parcel record coverage build** (3 Sep — the distinct-values-cap-silently, dozens-of-layers-share-one-name, ArcGIS-error-arrives-as-200, preview-endpoint-does-not-exist, preview-at-parent-zoom-is-a-swatch, rect-cannot-see-overflow-clipping, always-visible-cannot-be-scrolled-to, privacy-scanner-hits-the-protocol, live-suite-dies-on-a-timeout and threshold-stated-twice entries), the **transaction evidence build** (3 Sep — the row-count-is-not-an-event-count, distinct-count-impossible-server-side, range-is-not-a-series, key-is-a-composite, two-columns-one-measurement, population-per-class-not-per-layer, undocumented-flag-is-not-a-filter, ZIP-cell-frame-costs-four-things and no-evidence-note-composer entries from its research; and from building the app, the universe-from-the-rows-loaded-so-far, clipper-corrupts-the-edges-it-is-walking, inline-width-beats-the-breakpoint, coverage-state-reads-as-empty-ground and two second occurrences — areTilesLoaded-answers-about-the-old-style and floating-overlay-covers-the-map-on-a-phone), the **resilience disclosure pack**
(30 Aug — the four-live-releases, citation-resolves-but-the-sentence-is-absent, OID-differs-between-reads,
flag-is-a-courtesy-not-a-contract, field-name-is-a-property-of-the-release, two-authorities-half-apart and
queryable-but-undated entries, all from re-running a verified §4 twelve days later), the **hospital network planning
build** (26 Aug -- the both-keyless-basemaps-now-serve-a-placeholder, two-id-systems-on-one-row,
suppression-by-row-omission, a-one-class-rating-is-not-a-scale, open-licensed-and-still-403,
a-raster-style-has-no-glyphs, a-data-driven-icon-image-fails-the-whole-tile,
a-hairline-outline-becomes-a-wash, one-accent-hex-cannot-clear-both-basemaps and
Log.entryAdded-is-blind-to-console.error entries), the **facility capacity & catchment
build** (26 Aug — the partial-page-with-no-flag, suppression-sentinel-is-a-literal-asterisk,
same-identifier-padded-in-one-file-and-not-the-other, impossible-figure-shown-as-filed,
a-block-changes-form-but-stays-a-block, a-trap-goes-stale, catalogue-API-disappears,
`glyphs: undefined`-invalidates-the-whole-style, an-expression-may-not-compare-to-null,
`flex-basis`-beats-`width`, a-container-query-cannot-style-its-own-container,
`aria-pressed`-paints-a-legend-label-white-on-white, the-house-alpha-has-a-reason-that-may-not-apply,
data-hues-that-pass-on-a-panel-vanish-on-a-dark-basemap, `\s`-in-a-template-literal-is-the-letter-s,
headless-Chrome-can-freeze-`requestAnimationFrame`, a-recipe-can-specify-one-number-three-ways and
a-largest-heuristic-opens-on-the-invisible-view entries), the **humanitarian response map
build** (26 Aug — the query-parameter-identifier-is-not-a-credential, header-form-preflights-into-a-wall,
ACAO-is-the-publisher's-own-origin, host-that-no-longer-resolves, 422-instead-of-a-clamp,
filter-parameter-is-a-substring-match, two-releases-in-one-response, lane-exploded-by-a-free-text-dimension,
standardised-lane-is-not-the-publisher's-file, CSV-and-JSON-differ-by-two-columns,
boundary-file-has-no-OID, `queryRenderedFeatures`-counts-what-your-chrome-covers,
`idle`-lands-after-the-move-stops, overlay-strip-collapses-the-map-on-a-phone,
`loaded()`-is-true-while-the-old-style-is-painted and four-states-told-apart-only-by-hue entries),
the **mission impact map build**
(25 Aug — the one-name-column-two-widths, rounds-for-display-then-aggregated,
two-flags-collapsed-into-one and sticky-with-no-background entries; and second occurrences of
`setTiles`-does-not-repaint, constant-width-stub, reading-below-the-fold and grey-thumbnail,
each of which was already recorded here and was hit anyway), the **public health preparedness
build** (25 Aug — the 96%-attribute-less-rows-on-one-coordinate, single-space-is-not-a-null,
two-strings-that-both-mean-no, key-on-14%-of-rows, register-outlives-its-rows, two-county-name-forms,
unadvertised-returnCentroid, plain-text-body-at-200, dead-CDN-node-reads-as-CORS, two-vintages-one-
readable, national-feed-empty-for-one-state, popup-under-the-map-chrome, tile-error-seizes-the-status-
line, retry-in-the-build-script-not-the-domain, denominator-smaller-than-its-numerator,
sovereignty-asserted-as-prose and contrast-never-actually-measured entries), the
**housing & homelessness services build** (24 Aug — the names-drift-on-one-key, Total-row-keyed-blank, footnote-in-the-key-column, published-zero-means-not-counted, carried-forward-from-another-night, duplicate-headers-that-agree, string-in-a-numeric-column, one-prefix-two-universes, description-is-not-a-field, antimeridian-bbox, NAD83-4269, 202-as-a-challenge, no-ACAO-is-a-build-input, returnDistinctValues-empty-or-slow, synced-panes-oscillate, break-edge-lands-low, hide-and-isolate-disagree, blank-panes-with-321-green and traversal-cannot-403-on-Windows entries, and on 25 Aug the second occurrence of map-corner-collision), the **health equity overlay build**
(24 Aug — the vintage-join-that-succeeds, code-order-cannot-be-inferred-from-prose, range-is-a-class,
designation-is-a-set, absent-ACAO-on-a-200, truncated-enumeration, invalid-style-key-paints-nothing,
ground-so-calm-it-reads-as-absence, fitBounds-pads-the-viewport-not-the-app, guard-matches-its-own-
hostname, prohibition-as-behaviour-not-string, stub-loses-interleaved-text and stub-ignores-boolean-
attributes entries), the **shortage-area explorer build**
(24 Aug — the sibling-layers-differ-on-the-OID-name, geometry-rows-are-not-record-rows,
null-on-every-row-is-a-tautology, non-additive-universes, renamed-service-499 and
invalid-outFields-returns-empty entries from its research; and from building the app, the
case-insensitive-request/case-sensitive-response, score-without-its-inputs, full-resolution-is-120x,
ambiguous-400, legend-reads-0-of-0, summary-below-its-list, zero-dash-round-cap,
double-dispatched-keydown, inverted-grip, traversal-test-inside-the-root and poll-do-not-sleep
entries), the **access to care build**
(23 Aug — the whole-estate-omits-`objectIdFieldName`, ids-vs-features-page-channel, documented-cap-is-
the-wrong-constraint, sibling-layers-differ, enriched-layer-keys-on-`ID`, fixed-band-zooms-the-map-out,
overflowing-KPI-grid, map-corner-collision, lazy-thumbnail, constant-width-stub, fixture-winding,
default-hides-the-finding and disabled-option-never-restored entries), the **climate scenario explorer
build** (23 Aug — the constant-timestamp, two-raster-encodings, field-type-changes-with-the-query,
`units: null`, `crs`-member, unfaithful-cell-footprint, model-years-vs-climatological-windows,
uncomparable-ensembles, break-sensitive-change-count, difference-below-the-internal-spread, soft-404,
no-anonymous-machine-route, silently-ignored-parameter and unreconciled-sub-totals entries), the
**fraud / AML geo-dashboard
build** (20 Aug — the container-observation, absolute-panel-height, phone-shell, grip-overflow,
early-return-stale-count, disclaimer-guard, script-as-markup, last-paint and
live-register-reproducibility entries), the
**asset-level exposure scoring build** (20 Aug — the even-odd ring classification, the ids-vs-features page-size channel, the
`getSamples` time budget, the `styledata` hydrate loop, the stale-underlay token, the declared-comparison
and two-sort-orders entries, and the loopback bind collision), the **branch & ATM network operations
build** (20 Aug — the popup-half-a-theme, popup-taller-than-its-map, absent-OID, `Number(null)`,
overlay-collision, drill-isolation and stub-order entries), the **financial inclusion & coverage
build** (20 Aug — the `queryRenderedFeatures`, fixed-viewport-clipping, computed-colour, style-stub and
NUL-byte entries), the **branch & ATM network operations centre** (18 Aug — the marker-shape, `stacked-bar`, `timer`/`navigate` and estate-register entries), the **climate-risk regulatory
reporting pack** (17 Aug — the Esri-ring, GeoJSON-tiler and vintage entries, and the four `[core: open]`
gaps in the interactivity surface), the concentration & exposure analyzer and the collateral & portfolio
risk map (16–17 Aug), the catchment & market-share analyzer (13 Aug), the **`nearby` reference build**
(11 Aug — the first app built end-to-end from a recipe under this guidance), the watershed portal
(10 Aug), the broadband gap matrix and the public-information map (9 Aug), and the pipeline evidence
pack (6 Aug).

---

## Three rules that govern the rest

**A trap is a property of a service, not a law of nature.** Test, never inherit. The pipeline build was
burned by zero-padded identifiers (`PLINEID` as `String(4)`); the watershed build checked the same trap
against its HUC codes and found all 8,194 rows full-width strings. Inheriting the guard is harmless;
inheriting the *conclusion* would have been wrong.

**One probe is not enough to declare an endpoint dead.** A basins layer returned three consecutive 500s
during research and three consecutive `{count:21}` an hour later. Intermittent is not broken — sample more
than once, and write suites that pass on either outcome.

**Assert the rule, not the victims.** When one cascade bug hit a splash overlay and then a radius control,
the fix was not a second per-component guard — it was one global rule plus an assertion on *that rule*. A
guard that enumerates the victims found so far keeps finding the next one by hand.

---

## 1 · Identity — which row is this?

**A field named "Unique Identifier" is NOT unique — and it IS unique one scope down, which is the half
that rescues the join.** `[data]`
*(2026-09-07, facilities & space utilisation)* The federal real-property inventory publishes `Real_Property_Unique_Identifier` on every row,
with **zero nulls and zero blanks**, which is exactly what a trustworthy key looks like. Across the 13,001
California buildings it carries **12,806 distinct values: 193 identifiers repeat over 388 rows**, and the
three rows sharing `90027` are a warehouse in Alameda reported by Energy, a restroom in Riverside reported
by Interior, and an "All Other" in Alameda reported by Transportation. De-duplicating on it merges
unrelated buildings; joining on it across services attaches the wrong vacancy figure to the wrong
building — silently, because the field is fully populated. **But scoped to a single `Reporting_Agency` it
has zero duplicates** (707 GSA buildings, 707 distinct ids), and that is what makes a cross-register join
safe here at all. **Guard:** probe distinctness before treating any field as a key, whatever it is called,
and when it fails, **look for the scope in which it holds rather than abandoning it** — a published key is
often unique inside the publishing unit and repeats across units. Key the application itself on the OID;
use the natural key only inside its proven scope. Belongs beside the OID entries above: same failure,
different field, and a fuller name is not more trustworthy.


**A layer document can report `objectIdFieldName: null` while carrying an OID-typed field — and the ids
endpoint will name it for you.** `[data]`
@@STAMP@@ California HCD's `TableA2` publishes `objectIdFieldName: null` on its layer document while its field
list plainly contains `OBJECTID` of type `esriFieldTypeOID`. The catalogued advice for a null OID is *bind
read-only*, and that would have been the wrong call here: a `returnIdsOnly=true` query answers
`objectIdFieldName: 'OBJECTID'` **alongside its 78,381 ids**, which is an authoritative read rather than an
inference from the field list. The same call also reveals the true unbounded population, because
`maxRecordCount` governs feature paging and **not** the ids endpoint. **Guard:** when the document reports
null, ask the ids endpoint before concluding there is no stable id — and take the name from that response,
never from the field list, because a service can carry a column literally named `OBJECTID` that is not the
object id.

**`objectIdField` can be ABSENT from the response, not merely `null` — and a `=== null` guard passes for the
wrong reason.** `[data]`
*(2026-09-02, site selection - the swing slate)* Census TIGERweb's tract layer is recorded in more than one
recipe as reporting `objectIdField: null`. It does not: the key is **not present in the layer document at
all**, and neither is `objectIdFieldName`. Python's `d.get('objectIdField')` returns `None` and reads as
`null`, which is how the wrong shape got written down; JavaScript's `meta.objectIdField === null` is then
`false` for an `undefined`, so a build gate written from that record **fails on a layer that is behaving
exactly as documented**. The conclusion is unchanged — no declared object id, bind read-only, key on a
natural identifier such as `GEOID` — but the test is `== null`, covering absent and null together.
**Guard:** assert *"there is no usable object id"* (`objectIdField == null && objectIdFieldName == null`),
never `=== null`; and when transcribing a probe from one language into a guard in another, re-run the guard
against the live service rather than against the note.

**A service's `objectIdField` can differ between two reads of the same URL — and between releases of the same
dataset.** `[data]`
*(2026-08-30, resilience disclosure pack)* The FEMA NRI census-tract layer document reported
`"objectIdField": null` on **2026-08-18** and `'objectIdField': 'OBJECTID'` on **2026-08-30** — same URL,
twelve days apart, no reissue, `serverGen` unchanged at 187760764 — while `returnIdsOnly` reported
`objectIdFieldName='OBJECTID'` on **both** reads. Meanwhile a **sibling release from the same publisher**
(`NRI_CensusTracts_v117`, the October 2020 edition) reports `objectIdField: 'FID'` and carries **no
`OBJECTID` column at all** (`has FID: True | has OBJECTID: False`), so `count(OBJECTID)` returns
`'Invalid field: OBJECTID' parameter is invalid` on that one release and succeeds on the other three.
**Guard:** the OID is a **per-read, per-release** fact, not a dataset fact. Read it from `returnIdsOnly` on
every build — that channel was right on both dates while the layer document disagreed with itself — and
re-read it whenever the bound release changes. This strengthens rather than replaces the house rule: never
assume the OID on a service you did not publish; here the layer document was not merely wrong once, it was
**inconsistent with itself over time**.

**A join across two census-tract vintages SUCCEEDS, and the partial case is far worse than the empty
one.** `[data]`
*(2026-08-24, health equity overlay)* This file already says a join that silently returns nothing looks
exactly like a data gap. **Sharpen it: the join that returns most of it does not look like anything at
all.** A GEOID join from a 2010-vintage outcome file (7,516 California tracts) to a 2020-vintage
vulnerability index (9,109 tracts) returns **6,434 rows — 74 % of the state's population — with no
error, no warning, and a plausible statewide map.** `06001402800` became `06001402801` and `06001402802`
in a boundary split; a quarter of California silently drops out and reads as *no data*. The empty join
announces itself; the 74 % join ships. **Guard:** two tract layers that disagree on vintage must not be
joined at all — pin the whole application to **one** vintage, and assert the chain (subset, count and
the named exceptions) in a suite. That app asserts `usaleep 7,516 ⊆ ces4 8,035 ⊆ tracts 8,057 ∪
{06037930401}` and aborts the build on any other orphan. Generalises to every US tract, block-group and
ZCTA binding, not just health.

**The OID is whatever the service says it is.** `[data]`
`objectIdField` is guaranteed to be `OBJECTID` only on a layer **you** published to Strata Serve (§6).
On a pipeline centerline the OID is `FID`, and a *different* column is literally named `OBJECTID` —
`FID 4` is `OBJECTID 7`. On three SafeGraph slices it is `OBJECTID_1`, and both columns exist. Selecting,
highlighting or joining on the assumed field addresses the wrong rows with no error.
**Guard:** read `objectIdFieldName` from the layer metadata; assert it in the suite.

**Some layers report no OID although one exists.** `[data]`
Three geohazard layers returned `objectIdField: null` while carrying a usable OID column.
**Guard:** bind read-only; never build an edit or selection key on it.

**A whole ESTATE can omit `objectIdFieldName`, and the real OID differs per layer.** `[data]`
*(2026-08-23, access to care)* Across the seven layers one app bound — HCAI, HRSA, CDC PLACES and
Cal OES — **not one** published `objectIdFieldName`. The real OID, read from the `esriFieldTypeOID`
field, was `ObjectId` (camelCase) on the facility and health-centre layers, **`FID`** on
`MSSA2024_Tract`, on the PCSA shortage-area layer and on HRSA's HPSA primary-care boundaries, and
`OBJECTID` on the CDC and Cal OES tract layers. **The PCSA layer carries a *different* column literally
named `OBJECTID` beside its `FID` OID** — the §1 trap above, alive in a health estate. A recipe that
opens "`OBJECTID` is the OID throughout" is stating a hope. **Guard:** derive the OID from the field
list by *type*, per layer, and assert each one; never inherit a per-estate claim.

**The OID name can differ between SIBLING LAYERS INSIDE ONE SERVICE.** `[data]`
*(2026-08-24, shortage-area explorer)* On one federal `MapServer` publishing three disciplines of the same
register, layers `/10` and `/2` report `OBJECTID` from `esriFieldTypeOID` and layer **`/6` reports
lower-case `objectid`**. A guard that string-matches the *name* — `"OBJECTID"`, case-sensitively, or a
per-service constant read once — binds correctly on two of the three siblings and silently mis-selects on
the third. **Guard:** derive the OID from the field **type**, per layer, never per service, and never by
name. Related: the estate-wide entry above; this one is narrower and easier to miss, because two of three
layers agree.

**Identifiers are strings; only magnitudes are numbers.** `[app]`
A zero-padded `String(4)` line id coerced to a number makes every row of an operator's upload miss its
line — and report a cheerful "0 matched". **Guard:** refuse to coerce any cell carrying a leading zero.

**Unidentified rows need unique keys.** `[app]`
Collapsing every unbranded outlet onto one empty brand key rolls them up as a single phantom chain,
inventing a major competitor out of missing data.

**A layer can OMIT `objectIdFieldName` rather than report it null — and a `.get()` probe cannot tell.** `[data]`
*(2026-08-20, branch & ATM network operations)* TIGERweb's tract layer does not carry the key at all,
while `returnIdsOnly` names `OBJECTID` and an `OBJECTID` column exists on the layer. A probe written as
`j.get("objectIdFieldName")` — the obvious idiom — returns `None` for an absent key exactly as it does
for a null value, so a recipe recorded `"objectIdFieldName": null` and a suite asserting `=== null`
then went red against a service that had not changed. **Guard:** assert the *finding* (`== null`, which
covers both) and, where the distinction matters, test key presence separately. Record which one you
measured, because the two are different statements about the service.

*Confirmed a second time, on a different layer of the same service, and it **moved** in between:*
*(2026-08-20, fraud / AML geo-dashboard)* TIGERweb's **2020 ZCTA** layer reported `objectIdField: null`
on 18 August and **omits the key entirely** on 20 August, while `returnIdsOnly` answered `OBJECTID`
throughout and an `esriFieldTypeOID` column was in the field list the whole time. So this is not a
stable property of a layer to be recorded once — the *shape* of the absence changes under you. Assert
`== null` (which covers both) **and** test key presence separately, so the next shape-change is visible
rather than silently absorbed by a `?? "OBJECTID"`.

**`objectIdFieldName` can be null in the LAYER DOCUMENT and present in the `/query` response.** `[data]`
*(2026-08-23, property peril report)*
Across all nine services one app bound — two AGOL hosted layers, three ArcGIS Server MapServers and four
more — `objectIdFieldName` was **null in every layer document**, while the `/query` response named it
correctly on all of them (and named it `OBJECTID_1`, beside a `Double` decoy called `OBJECTID`, on one).
Reading the layer document alone concludes there is no OID and binds the wrong column or none at all.
**Guard:** read `objectIdFieldName` from a `/query` response, per layer, every time; fall back to the
field whose `type` is `esriFieldTypeOID` in the field list, and never to the name `OBJECTID`.

**`outFields` is matched case-insensitively; the response keys are not.** `[data]`
*(2026-08-24, shortage-area explorer)* One HRSA service carries `OBJECTID` on two sibling layers and
lower-case `objectid` on the third — and the third has **no column named `OBJECTID` at all**. Requesting
`outFields=OBJECTID` against it nonetheless **succeeds**, because the server matches field names without
regard to case. The divergence surfaces one step later: the returned attribute keys carry the *layer's*
casing, so `row.OBJECTID` is `undefined` on exactly one layer of three while every request looks healthy.
A field-name guard that is stricter than the server also mis-fires here, rejecting a request that works.
**Guard:** validate requested names **case-insensitively** (match the server), but read every value back
through the OID resolved from `esriFieldTypeOID` on that layer. Assert both: that the layer has no column
literally named `OBJECTID`, and that the response keys carry the casing you resolved.

**Two publishers name the same region differently, on the same key.** `[data]`
*(2026-08-24, housing & homelessness services)* Continuum `CA-505` is *Contra Costa County CoC* in HUD's boundary layer and
*Richmond/Contra Costa County CoC* in HUD's own Point-in-Time workbook and in a sibling boundary service.
Nothing is wrong with either; they are different registers of the same publisher. An app that keys on the
name loses rows, and an app that prints whichever name the last-refreshed lane supplied changes its own
labels between builds. **Guard:** join on the **code**, always; **nominate one source for the label** and
say in the UI which one it is; never key on a name. Where one population has no row in the nominated
source — here, the two Continuums with a boundary and no count — name the fallback explicitly rather than
letting it vary.

**Two id systems side by side on the SAME row, and the familiar one returns a clean zero.** `[data]`
*(2026-08-26, hospital network planning)* HCAI's licence register carries **both** `OSHPD_ID` (a 9-digit licence id) and `PERM_ID` (a
5-digit building-permit id) on every row, and they are equal on **0 of 458** hospitals. Every other lane
in that substrate keys on `OSHPD_ID`, so it is the id a builder reaches for first -- and joining the
seismic layer on it resolves **0 of 43**, which reads as *"the seismic layer doesn't cover us"* rather
than *"you used the wrong key"*. The right key, `PERM_ID`, resolves **40 of 43**. This is the sibling of
the cross-type `PERM_ID` entry above: that one is about casting, this one is about **choosing**.
**Guard:** when a join returns zero, prove the key before you doubt the source -- join both ways on a
sample and print both counts. Assert that the wrong key **keeps failing**, so a later refactor cannot
quietly switch back to the familiar one; this build's suite asserts `PERM_ID -> 40` and `OSHPD_ID -> 0`
side by side.

**Second occurrence — a layer can declare `objectIdField: null` and still publish a working `OBJECTID`,
and the neighbouring county is why you may still not infer it.** `[data]`
*(2026-09-07, valuation & taxation base map; first recorded 2026-09-07, development pipeline tracker)*
Los Angeles County's parcel service — 2,432,918 rows — reports no object-id field on its layer document
while carrying an `esriFieldTypeOID` column literally named `OBJECTID`, and `where OBJECTID=1` answers
`{"count":1}`. So far this is the catalogued shape. What this build adds is the reason the obvious
shortcut is still wrong: a **neighbouring California county's** parcel layer keys on `FID` and carries a
**decoy column also called `OBJECTID`** beside it. So *"the document is silent, therefore use the column
named `OBJECTID`"* is a rule that works on one service and selects the wrong feature on the next — and it
fails silently, because a wrong id highlights a real parcel. **Guard:** bind the id **explicitly and
read-only**, per layer, from a probe of that layer — never infer it from the field list, and never inherit
it from a sibling service in the same vertical. Where the ids endpoint will name it, take the name from
there (the entry at the head of this section); where it will not, record the chosen column in the app's own
map spec so a reviewer can see which id was bound and why.

**Two feeds of one state spell its counties in different cases — and a baseline taken before the reference
layer loaded keeps the other spelling.** `[data]` `[app]`
*(2026-10-21, watch wall build)* Cal OES's power-outage layers name counties in **UPPER CASE** (`ORANGE`, in
both the incident points and the by-county totals), while the state's own county boundary layer and the
national wildfire feed use `Orange`. The app joined the outage totals to the boundary names case-folded — but
its shift **baseline** was captured on the first outage read, which landed before the 58 county polygons had
loaded, so the baseline kept `ORANGE` and every later read said `Orange`. One minute into a live shift the
by-county reading said **"17 of 58 counties changed — outages changed"** while statewide customers out read
±0. Only a screenshot caught it: every suite was green, because each fixture loaded counties first.
**Guard:** compare join keys **case-folded at the comparison**, not only when the reference happens to be
loaded; and never let the order in which feeds answer decide what a stored baseline contains — assert the
mixed-case baseline against a later proper-case read in the suite.
*(2026-10-21, lifeline board build)* Confirmed on a second pair. Joining the same Cal OES outage incidents to
the California Geoportal county layer by name gave **0 of 58 exact matches and 58 of 58 once case-folded**.
The by-county layer also spells a field `Impacted_Cutomers_Not_Planned` (sic). Bind it literally, and never
"correct" a field name in a query.

**One evacuation zone, two id forms, two row sets.** `[data]`
*(2026-10-21, incident situation map build)* Cal OES's statewide evacuation aggregation and CAL FIRE's
statewide evacuation-status view describe the same zones, but key them differently: the aggregation carries
`PVL-E042`, the status view `US-CA-XTU-PVL-E042`. Neither id is a prefix-free match for the other, and the
join that works is on the **last segment of the status view's `url`** field, not on any id column. And the
two layers are not the same population: each carries zones the other lacks, so a join in either direction
silently drops rows. **Guard:** normalise both sides to the shared zone code before joining, assert the
normalisation on a known pair in the suite, and report the unmatched rows on **both** sides as their own
count ("in the status view only", "in the aggregation only") rather than letting the join discard them.

**One water system, several polygons: counting polygons double-counts systems.** `[data]`
*(2026-10-21, lifeline board build)*
- *Symptom:* the State Water Board's drinking-water System Area Boundary Layer, queried for the service areas
  that intersect today's outage areas, returned **16 polygons for 14 water systems**. The same
  `WATER_SYSTEM_NUMBER` appeared under two `OBJECTID_1` values (one system, two disjoint service areas). A
  count of features said 16 systems were exposed. Every hospital, population figure or cascade item chained
  from those rows was duplicated.
- *Cause:* the layer is keyed by polygon, not by system.
- *Guard:* group by the publisher's system identifier (`WATER_SYSTEM_NUMBER`) before counting or chaining.
  Print *"n systems (m service-area polygons)"* when the two differ, and assert the grouping in the live suite
  on a known multi-polygon system.

The same layer's OID is `OBJECTID_1`, beside an ordinary Integer column named `OBJECTID` (8890801 vs 133 on
one row; see the head of this section). Its statistics aliases come back **upper-cased** (`"n"` → `"N"`). It
also carries contact fields (`AC_PHONE_NUMBER`, `AC_EMAIL`) that an app should never request.

## 2 · Counting and paging — is this all of it?

**A row is not a record of the thing you are counting, and a longitudinal register will not tell you
so.** `[data]`
@@STAMP@@ California's statutory housing return publishes **464,059 rows that are 313,397 distinct projects**:
a project entitled in 2019 is reported again in the 2020 and 2021 filings, so **32.5 % of all rows are a
re-filing of something already counted**. Nothing in the response says this. The composite key
`UniqueID + YEAR` is unique on every row and `UniqueID` alone is not, and the only way to see it is to ask
for **both** distinct counts and compare them to the row count. De-duplicating to each project's first
reporting year moved the headline ninetieth percentile by **191 days (1,425 → 1,234)**, moved the
over-two-years share from 17.1 % to 15.0 %, and cut the jurisdictions carrying a hundred or more measurable
projects from **83 to 62**. **Guard:** before reporting any count from a periodic return, ask for the
distinct count of its natural key **and** of that key plus the period; if the second equals the row count
and the first does not, the row is a filing rather than a thing. Print the grain beside every figure. A
second sting here: the only reliable project key in this record is an **identity field** (its values are the
jurisdiction name concatenated with a street address), so the de-duplication has to happen inside the build
script and the key must never reach an artifact.

**"Has data" and "no data" are not enough states, and the biggest publishers are often the ones that
need the third.** `[data]`
@@STAMP@@ Of 521 filing jurisdictions in the California return, **165 filed and support no timing read at
all** — San Jose filed 3,248 rows with 88 carrying an entitlement date and **not one carrying both**, and
Sacramento filed 11,358 rows and reached zero the same way. *Filed and cannot be measured*, *did not file*,
and *outside the frame* are three different facts with three different remedies, and collapsing them into
one blank makes the largest cities look like the smallest. This is the same shape as the already-catalogued
*absence-in-a-partial-coverage-layer-is-a-jurisdiction* entry, arriving from the other direction: there the
gap was coverage, here it is measurability. **Guard:** where an app reports a **derived** measure across a
published register, count the entities that filed and cannot support the measure, render that as its own
map class, and refuse to print a figure for them. Four states plus a thin-denominator state, never two.

**Absence in a PARTIAL-COVERAGE layer is a jurisdiction, not a zero.** `[data]`
*(2026-09-07, portfolio & asset register)* CAL FIRE's State Responsibility Area hazard layer covers
**only** State Responsibility Area, so most of urban Los Angeles County has no polygon at all — and that
absence means *"this is Local Responsibility Area, read the other map,"* **not** *"no hazard."* Binding one
half and reading a blank as safe is the worst error available in a hazard lane, and it is silent: the join
succeeds, the column fills with a plausible value, and nothing is null. The two halves also carry
**different class vocabularies** — the local one adds `NonWildland`, which the service codes `FHSZ = -3`,
a sentinel rather than a severity — so they cannot be unioned into one legend without saying so. The same
shape recurs wherever coverage is split by administrative responsibility rather than by geography.
**Guard:** bind every half, render what neither covers as **`not mapped`** rather than as a class or a
zero, name the responsibility area beside the class in the legend, and assert that an uncovered record
reads `not mapped` and never `None`.

**`returnDistinctValues` caps at `maxRecordCount` and reports it only in `exceededTransferLimit`.** `[data]`
*(2026-09-03, parcel record coverage)* A recipe recorded this parameter as returning **HTTP 400** on a
county assessment-roll service. Re-probed, it does not fail at all: it returned 76 distinct land-use
descriptions and 58 distinct base years without complaint. Asking the same service for distinct parcel
keys returned exactly **1,000** values — the layer's `maxRecordCount` — with `exceededTransferLimit: true`
and nothing else to mark the truncation. So the trap is real and the recorded symptom was the wrong one:
the call succeeds, and a chip list built from it silently becomes a chip list of the first thousand.
**Guard:** read `exceededTransferLimit` on **every** distinct-value response, not only on feature pages,
and treat a returned count equal to `maxRecordCount` as *presumed truncated* until proved otherwise. And
when a recipe records a capability as failing, re-run it before building the workaround — a symptom
recorded once is a claim about one day.

**Duplication is not uniform, so never divide a row count to get an entity count.** `[data]`
*(2026-09-02, site selection - the swing slate)* Caltrans' statewide AADT layer serves 13,919 rows, and the
duplication is real and well known: probe any station and it comes back exactly twice. Two recipes therefore
record "13,919 rows for roughly 6,960 stations" — 13,919 divided by 2. Measured across the whole layer, the
rows-per-`(RTE, PM)` histogram runs **1x to 28x**: 6,444 keys appear twice, 156 once, 95 four times, 29 six
times, and a tail beyond. The real count is **6,754**, and the halving is wrong by 205. **Guard:** derive an
entity count by **de-duplicating on the key and taking the size of the set**, never by dividing. Probing two
or three rows establishes that duplication exists; it establishes nothing about its multiplicity. Print the
histogram once during research — it costs one query, and it is the difference between a measured number and
an assumed one.

**A join between two layers of the same publisher can cover a MINORITY of rows — and a licensed fallback
makes that invisible.** `[data]`
*(2026-09-02, site selection - the swing slate)* Caltrans' AADT layer carries no vintage field, and the
documented workaround is to take the count year from its Truck Volumes sibling, joining on route and
postmile: *"where the join fails the exposure figure renders count year unknown, never a guess."* Measured:
only **2,362 of 6,754** stations have any match — **35 %**. "Unknown" is the majority state, not the
exception, and where the join does resolve, the year is frequently ancient: the spread across matched
stations runs **1972 to 2024**, with two stations at 2024 and 120 at 1996. **Guard:** measure the join rate
before designing around the join, and design the *miss* as an ordinary value with its own rendering rather
than as an error state. The danger compounds whenever a recipe already licenses a graceful fallback: a
coverage of 35 %, of 5 % and of 0 % all render identically as "unknown", so the fallback conceals both a
sparse join and a completely broken one. Assert the ratio, and print it on screen.

**A `{"count":0}` from a spatial query is three different answers, and only one of them is "no."** `[app]`
*(2026-09-02, land bank & acquisition screening)* It may be a real absence, a gap in a surface whose own
coverage is unknown, or a geography the layer does not cover at all. Measured: one 225-acre footprint in
San Bernardino County returned `{"count":0}` from **six** layers, and three of those zeros meant three
different things — the wildfire zero was a true absence, the liquefaction zero meant **never evaluated**
(its companion "unevaluated areas" layer returned 1 for the same geometry), and the parcel zero meant
**this county is not bound at all**. Rendering all six identically is the worst defect available to a
constraint screen, because it converts a coverage gap into an all-clear on the ground a buyer is about
to option.

**Guard: resolve the containing administrative unit BEFORE reading any count**, and render *NOT COVERED*
rather than zero wherever the layer's own frame excludes the query geometry. Where a register publishes a
companion "unevaluated" or "not mapped" surface, query it in the same breath and let it separate *clear*
from *never looked*.

**A published layer whose title claims a whole jurisdiction may cover unincorporated territory only.** `[data]`
*(2026-09-02, land bank & acquisition screening)* Santa Clara County's `Zoning` service holds **1,087
polygons for a county of 504,648 parcels**; its published title is *"Santa Clara County Unincorporated
Zoning Districts"*, and the service name is not. Sacramento County's `County Zoning` (`PLANNING/16`) is
the same shape and gives itself away only in the data: `JURISDICTION` has exactly **one** distinct value,
`UNINCORPORATED`, across all 3,296 polygons. So **two of the three counties** in one bound set publish
county zoning that answers nothing inside a city — and an empty result there is a gap, not an absence of
constraint.

**Guard: check the polygon count against the parcel count, and read the distinct values of any
jurisdiction column.** A ratio of 1,087 to 504,648 is not a zoning atlas. Where the layer is
territory-limited, an empty answer must render as *unknowable / not covered*, naming the reason, never as
*no constraint*.


**Whether a service SETS `exceededTransferLimit` is not stable between reads — so no guard may depend on its
presence or its absence.** `[data]`
*(2026-08-30, resilience disclosure pack)* On the FEMA NRI census-tract service, `resultRecordCount=20000`
truncated to **2,000 rows with no `exceededTransferLimit` flag** on 2026-08-18. Twelve days later the same
query, the same query with no `resultRecordCount`, and three `returnDistinctValues` queries **all** returned
2,000 rows with `exceededTransferLimit=True`:

```
2026-08-18  asked 50000, features : returned=9106  exceededTransferLimit=None
2026-08-30  asked 20000, features : returned=2000  exceededTransferLimit=True
2026-08-30  no resultRecordCount  : returned=2000  exceededTransferLimit=True
2026-08-30  distinct TRACTFIPS    : returned=2000  exceededTransferLimit=True
2026-08-30  returnIdsOnly=true    : objectIdFieldName='OBJECTID'  len=9106
```

The cap never moved; only the service's honesty about it did. A guard written against the flag being present
would have shipped truncated numbers on the first date; a guard written against it being absent is dead code
on the second. **Guard:** neither. Treat any count that lands **exactly on `maxRecordCount`** as *"at least
N"* and page — and note that `returnIdsOnly` returned all 9,106 ids in one response on both dates, which is
the escape here. Joins the existing *paging silently stops short* and *ids-vs-features are different
channels* entries: the flag is a **courtesy, not a contract**.

**Paging silently stops short when the server caps below your page size.** `[data]` `[app]`
A paging helper compared the returned page against the *requested* size. The flowline layer caps at
1,000; asking for 2,000 returned exactly 1,000 — no error, no `exceededTransferLimit` — so the loop halted
at 1,000 of 1,619 reaches. That **understated the stream network and inflated the measured share from
11.2 % to 18.0 %**, in the flattering direction. **Guard:** the effective page size is whatever the server
actually returns at its widest, not what you asked for. *The most expensive entry in this file.*

**`returnIdsOnly` and a feature query are DIFFERENT channels, and only one of them is capped.** `[data]`
*(2026-08-20, asset-level exposure scoring)* The house probe measures "the real page size" with
`returnIdsOnly=true&resultRecordCount=50000`. On Cal OES's `FEMA_Flood_Hazard_Areas/3` that returns
**50,000 ids** — the id channel ignores `maxRecordCount` entirely — while the same request asking for
*features* returns **2,000 with `exceededTransferLimit: true`**. Believing the id probe, you would page
70,856 polygons in two requests instead of thirty-six and silently ingest 3 % of the layer.
**Guard:** measure the page size on the channel you will actually page — ask for `outFields` and read
`features.length`, not `objectIds.length`.

**A capped denominator inflates every share computed from it.** `[data]`
A 2,985-row register returned exactly 2,000 without complaint. **Guard:** compare against
`returnCountOnly` and fail loudly on equality with `maxRecordCount`.

**`returnCountOnly` itself can lie.** `[data]`
One boundaries layer returns `{"count":0}` with HTTP 200 against 36 real object ids. **Guard:** on any
layer whose count reaches a KPI, assert the count *and* a fetch of ids.

**A host can answer HTTP 200 with a challenge page instead of data.** `[data]`
A WAF (Imperva/Incapsula and friends) returns an HTML interstitial **with a 200 status**, so
`curl -w '%{http_code}'` reports success and a naive fetch stores markup as if it were JSON — and it does
this *intermittently*, so one clean probe proves nothing. **Guard:** assert the response **parses** and
carries the field you expect, never just that the status was 200.

**Some services publish hundreds of layers — never enumerate them.** `[data]`
One drilldown MapServer exposes 855 layers (one per provider × technology). Walking the catalogue is a
self-inflicted outage. **Guard:** use the service's identify/summary endpoint instead, and cap any
catalogue crawl.

**`returnIdsOnly` ignores the feature page size, so pacing a fetch off it truncates.** `[data]`
*(2026-08-13, catchment & market-share)* One layer advertises `maxRecordCount: 2000`. Asking for 5,000
**ids** returns exactly **5,000**; asking for 5,000 **features** returns **2,000** with
`exceededTransferLimit: true`. A pager that establishes its stride from an ids-only probe therefore
believes it has a 5,000-row page and drops 60 % of every subsequent one. **Guard:** the stride is what
the server returns *for the request you actually make* — measure it with features, not ids.

**A capped fetch does not SAMPLE the viewport — it slices off a REGION of it.** `[app]` `[data]`
*(2026-08-16, collateral & portfolio risk)* ArcGIS returns features in object-id order, and
object-id order correlates with geography. A viewport query capped at 1,500 of 2,806 published
polygons therefore paints one part of the view and leaves the rest bare: the first statewide
screenshot showed unevaluated-quadrangle hazard across the north-east and south-east and **none
along the dense coastal corridor**, which is exactly backwards — that corridor is where the
portfolio was. Every assertion was green, and the layer panel honestly said *capped*. A caption
cannot undo a map that makes a false **spatial** claim. **Guard:** page to completeness; ask
`returnCountOnly` first and, where a layer cannot be completed within the page budget, **draw
nothing** and say *too dense to draw here, zoom in*. Assert that nothing is drawn from an
incomplete fetch, and that what *is* drawn spans the view rather than a corner of it.

**A stride probe can return HTTP 200 with an `{error}` body instead of a short page.** `[data]`
*(2026-08-16, collateral & portfolio risk)* Asking TIGERweb's tract layer — `maxRecordCount`
**100,000** — for 50,000 features *with geometry* returns 200 carrying
`{"code":500,"message":"Error performing query operation"}`. Not a short page, and not a
transport error. A pager that reads it as "this layer is dead" abandons a healthy layer; one
that reads it as transient retries a request that fails identically forever. **Guard:** step a
ladder of page sizes down and take the first the server will actually serve **for the request
you are going to make** — the widest request is not always answerable, and the failure arrives
dressed as a permanent server fault.

**The stride is what the server RETURNS, and writing that down does not make you do it.**
`[app]` *(2026-08-16, collateral & portfolio risk)* A paging helper carried a comment
explaining this exact trap and then compared each page against the **requested** size anyway:
a 1,000-row page against a 2,000-row request ended the loop, declaring a 1,041-row layer
complete at 1,000 and a 2,806-row layer complete at 1,000. **Guard:** measure the stride from
the first page, and reconcile the total against the server's own `returnCountOnly` before
calling a fetch complete. A comment is not a guard; an assertion is.

**A computational halo must never reach a number on screen.** `[app]`
*(2026-08-13, catchment & market-share)* Outlets were deliberately fetched on a box ~9 km wider than
the study area, so a nearest-neighbour distance at the edge would not be wrong for want of a feature
just outside the frame. That halo then leaked into the legend (362 against the register chip's 113 for
the same layer) and, worse, into a *decision*: the default subject brand was chosen as the largest on
the halo rather than the largest in the market, naming a different company. **Guard:** clip to the
study area for every displayed count **and every derived choice**; let the halo feed geometry only,
and say on screen that the map draws context the counts exclude.

**Never truncate silently.** `[app]`
Every cap says so on screen: `+N more`, `Capped, not complete`, `250 of 1,975 rows`.

**ArcGIS answers errors with HTTP 200 and an `{error}` body.** `[core: fixed]` `[data]`
Rate limits and bad queries return 200 plus `{"error": …}` and no `features`. Code doing
`j.features || []` reads that as **zero features** and overwrites good data on the next refresh tick.
Fixed in `engine/arcgisSource.ts` (`assertNotArcgisError` throws). **Still applies to any fetch you write
yourself.**

**`returnIdsOnly` and `returnGeometry=false` features are DIFFERENT page-size channels.** `[data]`
*(2026-08-23, access to care)* On HCAI's facility layer (`maxRecordCount: 1000`), asking
`returnIdsOnly=true&resultRecordCount=5000` returns **5,000 ids** with `exceededTransferLimit: true`,
while the same request for *features* returns exactly **1,000**. Sizing a feature pager from the ids
probe therefore reads one page and stops, losing 90 % of the layer with no error and no flag.
**Guard:** measure the page size on the channel you will actually page — features, with the
`outFields` you will actually request — and page until a short page comes back, not until a count you
computed elsewhere is reached.

**A layer with one row per GEOMETRY is not a layer with one row per RECORD, and the ratio can be 110:1.**
`[data]` *(2026-08-24, shortage-area explorer)* A "component boundaries" publication of a federal register
returned **1,131 rows for one state on the dental layer and 2,363 on the mental-health layer** — which read
as 1,131 and 2,363 designations. They are **93** and **135**: one designation is sliced into one row per
census tract it touches, and the largest single record occupied **110 rows**. Quoting the row count
overstates the record count by an order of magnitude, and the error is invisible because every row is
individually correct. The publisher's own *perimeter* publication of the same register carries exactly one
row per record — and its designated count matched `COUNT(DISTINCT <sourceId>)` on the component layer
**exactly**. **Guard:** before any count reaches a screen, compare `returnCountOnly` against
`COUNT(DISTINCT <the record id>)`; where they differ, the layer is a geometry table and the headline number
must come from the distinct count or from a different publication.

**A `Total` row inside the data — and the sibling sheet keys the same row BLANK.** `[data]`
*(2026-08-24, housing & homelessness services)* The 2025 Housing Inventory Count sheet's last data row is keyed `'Total'` and carries the
**national** roll-up: 488,985 crisis beds. Read naively it becomes a 388th "region" whose inventory is the
whole country's, sitting at the top of every class break and doubling every statewide sum. The
Point-in-Time sheet carries the same roll-up **with an empty key column** and the word `Total` in the
*name* column, followed by two blank rows. A build that dropped "the last row", or dropped "the row keyed
`Total`", is wrong on one of the two sheets. **Guard:** validate the key against the identifier's own
pattern (`^[A-Z]{2}-\d{3}[a-z]?$` here) and **assert the surviving row count** — 386, not 387, on both
sheets. Never drop by position, and never drop by one publisher's sentinel word.

**A footnote paragraph in the key column, and a footnote marker ON a key.** `[data]`
*(2026-08-24, housing & homelessness services)* The same count sheet ends with a **paragraph of prose in the key column** ("a MO-604 covers territory
in both Missouri and Kansas…"), and keys Kansas City **`MO-604a`** where the inventory workbook and both
boundary services say `MO-604`. A straight key join drops that region from the comparison without a word —
and the prose row, if the regex is loose, becomes a region too. **Guard:** a key regex *and* normalisation
of a trailing footnote marker, *and* a symmetric-difference report **printed on screen** rather than
logged. Without the normalisation the difference carries both `MO-604a` and `MO-604`, and one more region
falls out silently.

**A layer where 96 % of rows carry no attributes and every one of them shares a single coordinate.**
`[data]` *(2026-08-25, public health preparedness)* A state alternate-care-site register returned
`{"count":955}` and looked healthy. **919 of those rows carried no attributes at all** — `FacilityName`,
`FacilityType`, `County` and `TotalBeds` all null — and all 919 sat on the *same* point
(`-122.429655, 37.728171`), which would have rendered as a 919-deep stack of markers on one San
Francisco block. Of the 36 rows that did carry attributes, 13 were `Demobilized` and **exactly one** had
`OperationalBeds > 0`; the layer was last edited five years earlier. A count check, an ids-vs-features
check and a geometry-not-null check all pass on this layer. **Guard:** two cheap tests disqualify it —
count rows where the layer's *primary* attribute is null, and count **distinct geometries** against the
row count. Where they disagree by an order of magnitude the source has disqualified itself, and that is
a finding to render (the lane stays empty with its citation), not a rendering problem to solve. Belongs
beside the existing *count that disagrees with its ids* test.

**A hard page cap that 422s instead of clamping - and the tail is one whole province.** `[data]`
*(2026-08-26, humanitarian response map)* `limit=20000` returns
`HTTP 422 {"detail":[{"type":"less_than_equal", ... "ctx":{"le":10000}}]}` - a schema validation error, not
a truncated page. **Cause:** the cap is declared on the query parameter, so asking above it is a malformed
request rather than a large one. **Guard:** this is good news dressed as an error - **prefer it to a silent
clamp** - but still page, and still assert the total. The lane here returned 10,000 + 97, and those 97 rows
were one entire province (Nimroz). A build that requests one page and stops loses a province without a
single error.

**A server-side equality filter that is really a case-insensitive substring match.** `[data]`
*(2026-08-26, humanitarian response map)* `&category=total` on a people-in-need lane returns rows whose
category is `Total - Iran (District of Return)`, `Total - Pakistan (District of Return)`,
`Total - Border / EC` and `Total - Temporary Sites` **alongside** the `total` row actually wanted. Summing
the response double-counts every returnee and displacement sub-population into the denominator.
**Cause:** the filter is implemented as a `LIKE`, and nothing in the parameter name says so. The same API
does it again on `sector_code=PRO`, which returns `PRO`, `PRO-CPN`, `PRO-GBV`, `PRO-HLP` and `PRO-MIN`.
**Guard:** **never trust a filter parameter to mean equality - assert the returned distinct values against
what you asked for, and re-filter client-side.** This is the most dangerous entry of its build: it is
silent, it inflates rather than empties, and the inflated result still looks plausible.

**Two releases of the same annual figure served in one response.** `[data]`
*(2026-08-26, humanitarian response map)* A needs lane returned both the 2024 and the 2025 humanitarian
needs overview for the same districts and sectors, distinguished only by a `resource_hdx_id` and a
reference period - 107,971 rows against 100,591. Summing produces roughly double, and every cell looks
duplicated for no visible reason. **Cause:** the API is a union over published resources, not a current
view. **Guard:** **pin the release id, fail the build if more than one survives the pin, and print the
pinned id on screen.** With the release pinned the cells were unique (`cells with >1 row: 0`), which is the
assertion that proves the pin worked rather than merely ran.

**A lane exploded by a free-text dimension: 208,562 rows describing 4,693 cells.** `[data]`
*(2026-08-26, humanitarian response map)* A per-sector, per-district population lane returned forty times
more rows than it has cells, because each cell repeats once per `category` - a free-text column mixing age
band, gender, disability status and population group, carrying two competing spellings of the same idea
(`Adult`/`Adults`, `Children`/`Boys`+`Girls`). A build that sums `population` over the response inflates its
denominator roughly **forty-fold**. **Guard:** count the distinct keys before trusting a row count as a cell
count; select the one aggregate row **exactly** rather than by filter; and treat a free-text dimension as a
reason **not** to offer slicing by it - thin cells sliced by an uncontrolled demographic vocabulary are
demographically identifiable, not analysis.

**A JSON API can honour an over-large page size PARTIALLY, with no error and no flag.** `[data]`
*(2026-08-26, facility capacity & catchment)* `data.cms.gov/data-api/v1/dataset/<id>/data?size=10000`
returns **6,500** rows. Not an error, not a 400, not a documented `maxRecordCount` — just fewer rows than
asked for, silently. A pager that stops when `rows < size` ends at 6,500 of **1,175,708** and reports
success. **Guard:** the house rule ("the effective page size is whatever the server returns at its
widest") applies to plain JSON APIs and not only to ArcGIS — probe the ceiling once, page at or below it,
and assert the total against the endpoint's own `/stats` `found_rows` when it publishes one.

**A row count is not an event count, and the register usually counts rows.** `[data]`
*(2026-09-03, transaction evidence)* A county assessor's recorded-transfer file published **57,357 rows**;
those rows are **48,119 distinct recorded instruments**, because one deed can convey many parcels and the
file lists each parcel it touched. The overstatement is **19.2 %** across the file and **239.2 % on one
class** — 3,975 vacant-land rows are 1,172 deals — and a single deed recorded on one day conveys **614
parcels**. The duplicate check ran first and came back clean: **zero identical `(key, date, amount,
document)` signatures**, so this is a *grain* error, not a duplication error, and no de-duplication pass
would have caught it. The same shape appears wherever one document, permit, claim, order or invoice touches
many features.

**Guard: establish the event key and count distinct on it before reporting any count as a count of
events** — then say on screen which of the two numbers is showing. A count labelled "sales" that is really
"parcels conveyed" turns one transaction into six hundred pieces of evidence, which is the opposite of what
the reader is trying to establish.

**A distinct count may be impossible server-side, and that is an architecture decision rather than a
detail.** `[data]`
*(2026-09-03, transaction evidence)* On an ArcGIS `MapServer`, both routes to a distinct count were closed:
`outStatistics` with `statisticType: "count-distinct"` returned
`{"error":{"code":400,"extendedCode":-2147024809,"message":"Invalid or missing input parameters."}}`, and
`returnDistinctValues=true` together with `returnCountOnly=true` returned *"When returnCountOnly and
returnDistinctValues are true, more than one field specified in outFields is not supported."* So a count
that the whole application reported could only be produced by paging every row and counting in the client —
**29 pages and 44 s for 57,357 rows**, which changed the load budget, the load order and the widget
inventory of the app that needed it.

**Guard:** probe **both** routes before designing a screen around a distinct count. If neither exists, decide
deliberately between paging at load, a build-time bake with a visible staleness state, and dropping the
figure — and make that choice in the design rather than discovering it in the build.

**A min/max range is not a series, and reading one without its distribution is how a three-year file
becomes a fifty-five-year history.** `[data]`
*(2026-09-03, transaction evidence)* `MIN`/`MAX` on a date field returned **1971-02-22 → 2026-08-24** and
was recorded as a 55-year series. The cumulative counts say otherwise: `>= 1990` **57,308**, `>= 2010`
**57,259**, `>= 2023-01-01` **57,243 — 99.80 % of the file**, with only **114 rows** carrying the whole
remaining span and 49 of them predating 1990. It is a **rolling window of about three years**, which is
what the publisher's file is for and is not a history. The consequence is a design, not a number: a time
slider across it would have implied a past that does not exist, and every trend, pace and
period-on-period comparison had to come out.

**Guard:** ask for cumulative counts at several cutoffs before putting any time control on screen. This is
the same class of error as the lexicographic maximum — a range statistic read without its distribution —
but it kills a silhouette rather than a figure.

**A universe derived from the rows loaded SO FAR makes a measured zero disappear instead of rendering
as one.** `[app]`
*(2026-09-03, transaction evidence)* The app bands 55 submarket cells on how many recorded instruments each
holds for the property class in force, and a cell holding **none** is the finding the whole product exists
to show. The cell list was built from the rows already paged, so a submarket with no transfer of that class
was not banded `NONE` — it was **absent from the surface entirely**, and the band counts silently summed to
fewer than 55. It never showed against the live file, where every situs ZIP happens to carry something in
some class; it showed against a synthetic fixture built to contain such a cell, and it would have shown in
production during the **first** of two load phases, when only five of six classes had arrived.
**Cause:** the denominator was taken from the data that had loaded rather than from the data that exists.
**Guard:** get the universe from the register — a `groupByFieldsForStatistics` over the whole file, once —
and iterate **that**, looking each cell's value up rather than reading the keys back out of the rows. Then
assert the sum: **every band count together must equal the universe**, on every class, including during a
partial load. A zero you cannot see is indistinguishable from a geography you never covered, and this file
renders those two states differently on purpose.

**`resultOffset` paging is quadratic on a large ArcGIS layer; keyset paging is flat.** `[data]`
*(2026-09-07, valuation & taxation base map)* The same 1,000-row page — twelve fields, no geometry — measured twice four days apart against a
2.37 M-row roll:

```
offset 0            2.08 s   and 0.80 s on the re-probe
offset 500,000     22.35 s
offset 1,200,000   46.61 s   and 44.29 s on the re-probe
```

A full walk by offset is about **15.6 hours**, because the server counts past every skipped row. The same
page taken by **key** — `where AIN > '<last AIN seen>'` with `orderByFields=AIN` and **no**
`resultOffset` — is flat at **0.5–1.9 s wherever it starts** and 25 % smaller on the wire. Partitioned
into seven disjoint leading-digit key ranges and run in parallel, the whole roll walked in **310 s**.
**Guard:** page by key on anything above a few tens of thousands of rows, and assert the **flatness**
rather than the total — an offset walk that is merely slow today is a walk that trips a timeout tomorrow,
and the failure arrives as a short walk rather than as an error. The key must be unique for the cursor not
to skip or repeat a row; prove that with a count on one value before trusting it.

**A group-by statistics query caps at `maxRecordCount` groups, and `resultOffset` does not page it.**
`[data]`
*(2026-09-07, valuation & taxation base map)* A count per `UseCode` over a 2,372,107-row roll returned exactly **1,000 groups** with
`exceededTransferLimit: true` against **1,075** distinct values, and the returned group counts summed to
**2,372,032** — **75 rows missing from a total that looks complete**. `resultOffset=1000` on the same
query returns the *same first page again*, starting at `0100`, so the tail is unreachable by paging. This
is the group-by sibling of the `returnDistinctValues`-caps-at-`maxRecordCount` entry above: same cap,
same flag, and no offset that will get past it. **Guard:** never consume a group-by without reading
`exceededTransferLimit`, and never let a group-by total stand as a population — cross-check it against a
plain count of the same predicate and print both if they differ. To reach a capped tail, slice by an
explicit predicate until each slice fits under the cap.

**`returnCountOnly` and an `outStatistics` count disagree on the same spatial query, and neither path is
reliably the larger.** `[data]`
*(2026-09-07, valuation & taxation base map)* One envelope over Los Angeles, `esriSpatialRelIntersects`, same `where`: `returnCountOnly`
answers **61,429** and `count(AIN)` through `outStatistics` answers **61,506**. Reproducible, and not a
null-field artefact — `count(OBJECTID)` on a non-null object id returns the same 61,506, and `AIN IS NULL`
on the roll returns zero. The two code paths apply the spatial predicate differently. The sting is in the
direction: an earlier probe of a **different** envelope on the same layer had `returnCountOnly` **higher**
(39,590 against 39,587), so neither path can even be characterised as the generous one and no constant
offset reconciles them. **Guard:** pick **one** counting path and use it for every number on the screen —
this build uses the statistics path everywhere, the same one that produces its headline share — because a
readout saying *"61,429 parcels in view"* beside a table listing 61,506 is a contradiction the reader finds
before you do.

**`returnDistinctValues` paired with `returnCountOnly` can be refused INTERMITTENTLY, for tens of
minutes, while the layer's advertised capabilities never change.** `[data]`
*(2026-09-07, valuation & taxation base map)* This route answered on 2026-09-03 and was written into a recipe as the honesty cross-check its
distinct-page count depended on. On the morning of 2026-09-07 it returned HTTP 400 *"Failed to execute
query."* with an **empty `details` array on every field tried** — `Assr_Map`, `UseCode`, `UseType`,
`Roll_Year`, `Roll_LandBaseYear` — on **five consecutive attempts across two separate processes over
twenty minutes**. Throughout, `advancedQueryCapabilities` went on reporting `supportsDistinct: true` and
`supportsCountDistinct: true`, and `returnDistinctValues=true` **without** `returnCountOnly` still
answered normally, capped at 1,000 rows. A `LIKE` predicate breaks the distinct query even while it is up.
An hour later it answered **twelve times out of twelve**, with the same **87,640** it had given four days
earlier. It was never dead; every symptom pointed at a permanent removal.

**Guard, in two halves.** First, the house rule about declaring an endpoint dead applies to a *parameter
combination* as much as to a host: probe more than once, spaced, before recording that a query shape is
gone — and write the suite to pass on **either** outcome and **say which it saw**, so a reader learns the
shape is unreliable rather than learning to ignore a red line. Second, and the more important half: **an
honesty cross-check may not depend on a route that can vanish.** The replacement built here is a group-by
over a key prefix, sliced narrow enough to stay under the 1,000-group cap and recursing into a longer
prefix wherever `exceededTransferLimit` says a slice was capped — every slice checked, nothing summed that
was truncated. It reproduced **87,640 exactly, in 517 requests and 67 s**. Keep the cheap route as the fast
path, fall back to the resilient one, and cross-check the cheap answer against one slice of the resilient
one, so a route that answers with a *wrong* number is caught as well as one that refuses.

**A sentinel's size depends on the filter you have not applied yet.** `[data]`
*(2026-09-07, valuation & taxation base map)* A `'0000'` base-year sentinel appears on **53,283 rows** of a parcel layer — and on **124** rows
of the current roll. The other 53,159 sit in a roll-year-null population that also carries **zero value on
every row**, so the sentinel is not a defect inside the register at all: it is the marker of a parcel that
is not on it. Reported unsliced it is a 53,283-row problem nobody would ever check; sliced by the predicate
the product actually applies it is a **129-row list a person can work through**, which is a smaller
headline and a better product. **Guard:** slice every sentinel by the filter the application itself
applies before reporting its size, and then check what the rows **outside** that filter have in common —
here, all of them valueless. That shared property is usually the real finding.

**A GET over ~2,048 characters answers HTTP 404 with an HTML page, and a join reads it as "no match".** `[data]`
*(2026-10-21, watch wall research)* An `IrwinID IN (…)` query against a national ArcGIS Online wildfire layer,
sent as GET in chunks of 40 GUIDs, joined **12 of 92** records that were all there. The chunks whose URL ran to
**2,213 characters** came back **HTTP 404** with an XHTML error page — not 414, not an ArcGIS `{error}` — and
a client that treats any unparseable body as "no rows" counted them as misses; 1,703 characters answered 200,
and the same 40 ids by **POST** answered `{"count":40}`. **Guard:** send IN-lists and long `where` clauses by
POST (`application/x-www-form-urlencoded`), treat a non-JSON body as a **failed request** that stops the join,
and assert in the suite that the joined count equals the ids you sent.
*(2026-10-21, impact zone build)* The same failure on a different host answers **HTTP 400**, still with an HTML body: a polygon query to a federal-data ArcGIS Online host whose zone ring ran past 2,048 characters returned `HTTP 400 <!DOCTYPE HTML PUBLIC …`, and the identical query by form-encoded POST answered. The status code is not the signal — **a non-JSON body is**. Send every geometry query by POST (one real perimeter's rings reached **409 KB**).
*(2026-10-22, data compact build)* The same ~2,150-character county-polygon count was JSON on `services.arcgis.com`, `services5` and `services7` and a **404 `text/html`** page on `services1` and `services3` — so a GET that works against one ArcGIS Online host is no evidence for the next. Re-measured 2026-10-22: unchanged. Every geometry query is now a form-encoded POST (a CORS simple request; `*` came back on every host).

**A feed that blanks during its own reload is indistinguishable from "nothing here".** `[data]`
*(2026-10-21, watch wall research)* The NWS watch / warning / advisory MapServer rebuilds about every two
minutes, and for **5–10 seconds** of each rebuild it answers HTTP 200, CORS intact, `count 0` and
`features: []` — on 4 of 44 reads taken 4 s apart, and on both layers at once in a separate probe. A live
display that renders each poll literally goes blank every couple of minutes, and an alerting rule on "the
count fell to zero" fires on the service's housekeeping. A statewide evacuation aggregation documents the same
shape in its own item description ("a brief period (10 sec) where the service is rebuilding and not all
features are visible"). **Guard:** keep the last good set; accept a zero that follows a non-zero only when a
second read **≥ 15 s later** agrees; never alert on a disappearance.
*(2026-10-21, incident situation map build)* Applied to the evacuation aggregation (whose ~10 s rebuild
window is stated in its own item description): a drop to 0 is re-read after 15 s before it is shown as
"none". **Status:** the guard is tested with an injected network that answers non-zero, then empty, then
non-zero; the live window itself was not caught on the day, so the suite asserts the guard, not the outage.
*(2026-10-22, live-position build)* Seen once on a live vehicle-position layer (San Diego MTS `MTS_AVL/0`, a
transit fleet): **0 rows on two polls 30 s apart**, between reads of 41–68 vehicles. Not reproduced, so not
explained — but two empty reads were not enough to call the fleet empty. Show such an answer as the feed's
answer ("answered with 0 units"), never as "no units out".

**A rolling-window feed's count falls with no event ending.** `[data]`
*(2026-10-21, watch wall research)* USGS's "past day" earthquake summary went **172 → 168 → 166 → 162** over
two hours while no new California event arrived — rows age out of the 24-hour window. A KPI that reports the
change in that count, or a rule that treats a drop as something resolving, is reading the window, not the
world. **Guard:** count events by their own `time` against your own window (since a handover, since a date),
never by the feed's length; a falling length is never a change.

**A feed that has not answered yet is not a zero — a "quiet" headline needs every counted feed.** `[app]`
*(2026-10-21, watch wall build)* The wall's first live paint said **"Quiet since 06:00"** while its NWS alert
feed still read *"grey: no data yet"* — the seven-day `/alerts` history paginates and takes seconds longer
than the other feeds, and the quiet rule only checked that the incident feed had answered. Every other count
was a real zero; the warnings count was an **absent** one, rendered as `0` and folded into an all-clear. The
offline suite could not see it, because every fixture answers at once. **Guard:** an all-clear is a
conjunction over **every** feed it counts — compute the list of feeds still pending, refuse the quiet
headline while it is non-empty, and say on screen which feed is still being read ("not counted as zero").
Test it with one feed failing while the rest are empty.

**A perimeter layer that keeps every mapped version counts versions, not fires.** `[data]`
*(2026-10-21, incident situation map build)* The FIRIS intel perimeter layer returned **493 rows, 60 of
them `Active`** — every perimeter ever mapped for an incident stays in the layer beside its successors. A
count of rows is a count of mapping flights; drawn as-is, the map stacks a fire's old outlines under its
current one. **Guard:** dedupe to the **newest row per (`incident_name`, `source`)** before counting or
drawing, and assert in the suite that no key appears twice after the dedupe. Keep the history rather than
discarding it: the versions are what make an honest growth replay possible, each frame dated by its own
row.
*(2026-10-21, impact zone build)* The dedupe key needs an **upper-cased** `incident_name`: one fire is spelled `Timber` by one source and `TIMBER` by another. And `returnDistinctValues` on that host **folds case** (7 distinct names) where reading the rows gives 8 spellings — so a distinct-values probe hides the very split the dedupe must handle. Print each perimeter's own `poly_DateCurrent` and `source` too: the "Active" version adopted as a zone was **21.9 days old**, while the interagency layer held a newer outline of the same fire.

**Socrata's default page is 1,000 rows, and it carries no flag, no total and no `Link` header.** `[data]`
*(2026-09-07, property hazard exposure)* An unbounded read of a 13,277-row register returns exactly **1,000 rows** and looks complete.
Unlike an ArcGIS service there is no `exceededTransferLimit` to check and no `count` beside the page, so
nothing in the response distinguishes "this is all of it" from "this is the first 4 %". The platform hosts
thousands of municipal datasets, so this is not one register's quirk. **Guard:** send an explicit
`$limit` above the count you got from `$select=count(1)`, then **assert the returned length against
that count and fail loudly** — a short read is a stop, not a warning, because every figure downstream is
wrong by an unknown amount and nothing on screen would say so.

**OpenFEMA silently returns 1,000 rows when a query has no `$top`, and `metadata.count` reads 0 unless `$count=true`.** `[data]`
*(2026-10-22, data compact build)*
- *Symptom:* FEMA's `DisasterDeclarationsSummaries` v2 for California, all years, came back as **1,000 rows** with
  `metadata.top 1000` and `metadata.count 0`. Nothing said 691 rows were missing; `$count=true` reports **1,691**.
- *Cause:* OpenFEMA's default page is 1,000 and the total is computed only when asked for.
- *Guard:* always send `$top` **and** `$count=true`, compare the rows to `metadata.count`, and print
  *"capped at n of N — not complete"* when they differ. The live suite asserts the trap is still there.

**An ungrouped statistic over an empty selection returns one row of nulls, not an empty list.** `[data]`
*(2026-10-21, impact zone build)* A `min`/`max` of `IMAGE_DATE` over a zone with no footprints (an offshore box) came back as **one feature whose attributes are all `null`**, while the grouped count over the same zone returned `features: []`. A reader that takes "one row" as "found something" prints an imagery range of `null → null`. **Guard:** a statistic row whose values are all null is *none*; assert it in the live suite against a known-empty geometry.

**A statewide group-by on a 135-million-row layer is a coin toss; the same query scoped to a zone answers in a second.** `[data]`
*(2026-10-21, impact zone build)* `groupByFieldsForStatistics=OCC_CLS,PRIM_OCC` over every California footprint (`STATE_FIPS='06'`, 10.9 million rows of a national layer) failed with a generic 400 after **56 s** in the recipe's probe, answered in **38.6 s** on a re-run, then in **0.2 s** from the server's cache. Scoped to a county it answers in ~1.3 s; scoped to a zone polygon, in under a second. **Guard:** never group a national layer statewide from a browser; scope by geometry or a small attribute filter, and treat a fast answer as an accident of the cache, not a contract.

## 3 · Field semantics — does this field mean what it is called?

**A nullable class field can be null on MORE ROWS THAN ANY REPORTED CLASS, and a renderer without a
labelled default is then a map of the minority.** `[data]` `[app]`
*(2026-09-07, facilities & space utilisation)* `Utilization` on the federal inventory is null on **7,015 of 13,001 California buildings —
54.0 %**, against 5,637 `Utilized`, 290 `Unutilized` and 59 `Underutilized`. **The largest utilisation
class in California is the absence of one.** A three-value `uniqueValue` renderer draws the 46 % and
leaves the majority to a default symbol that, unlabelled, reads as "other" or as nothing at all.
**Guard:** whenever a symbolised field is nullable, the renderer needs a `defaultSymbol` with a **label
that says `NOT REPORTED`** — never "Other" — and the null class must appear in the legend, in the split,
and in every count with its own denominator. Generalise the house rule: *a geography with no data renders
NOT COVERED and never zero* now has a sibling — **a silence renders NOT REPORTED and never zero**. The
second half is the one that bites inside a covered geography.

**"Publishes a value" has two honest readings, and a source can encode a silence AS A ZERO.** `[data]`
*(2026-09-07, facilities & space utilisation)* `Owned_and_Otherwise_Managed_Annual_Operations_Cost` is non-null on **7,088** California
buildings and greater than zero on **6,597**: **491 standing buildings publish an annual operating cost of
exactly `$0.00`**. Every headline in the recipe — the tri-lane count, the unused-area total, the
per-county denominators — reconciles only on the `> 0` population, while the recipe's own prose quoted the
non-null one, so the same document described the lane with one number and computed it with another. A `$0`
operating cost for a standing building is not a measurement; it is a non-report written as a number, and
averaging it in drags a cost-per-square-foot toward zero. **Guard:** for any money or measure column,
count `IS NOT NULL` **and** `> 0` and compare them before quoting either. Where they differ, say so on
screen and report the zero-publishing population as its own state, folded into neither side. This is the
mirror of the *published-zero-means-not-counted* entry: there the zero was a suppression, here it is a
silence, and in both the fix is to refuse to let it become arithmetic.

**Two official registers from the SAME publisher publish two different values for the same feature on the
same day.** `[data]`
*(2026-09-07, facilities & space utilisation)* The federal inventory and the federal owned-and-leased register both publish a floor area per
building. 613 California buildings join across them — **by identifier and, independently, by coordinate,
returning the same 613**, which is how the join was asserted rather than assumed. Of the 612 pairs with
two positive areas, **483 agree EXACTLY and 65 differ by more than 5 %**, the worst by **99 %**: one
downtown address is published as 120,149 rentable square feet in one register and 42,471 in the other.
This is not an error to correct. It is **ANSI/BOMA Z65.1** (rentable area, measured for leasing) against
**ASTM E1836 / IFMA** (measured for facility management) in live data: both correct, both published, and
not the same number. **Guard:** reconcile before you join; report the disagreement per feature rather than
picking a side; and **never average two measurement standards**. Note the shape of the evidence —
**78.9 % agreeing exactly is what makes the 10.6 % that do not worth flagging.** A disagreement rate near
100 % means you joined the wrong things.

**A ratio is not bounded by 1, and the source will not tell you before you have drawn the gauge.**
`[data]`
*(2026-09-07, facilities & space utilisation)* On the federal owned-and-leased register, **`BLD_VACANT_RSF` exceeds `BUILDING_RSF` on 14 of
the 65 California rows that report any vacancy.** Nine overrun by 2 % or less, which is two measurement
standards applied to one floor; five do not, and one San Francisco building publishes **120,577 vacant
square feet in a building of 49,410 — 244 %**. A 270-degree arc cannot draw 244 % honestly: it pins, and a
pinned gauge reads as "full" rather than as "impossible". **Guard:** probe a ratio's actual range before
choosing a gauge, a percentage or a progress bar, and where the source cannot guarantee the bound,
**report the two measured quantities and let the reader see that one is larger than the other.**

**Identity fields that are empty today, on a service that refreshes weekly, are not a safeguard.**
`[data]` `[app]`
*(2026-09-07, facilities & space utilisation)* The federal owned-and-leased building layer carries **nine named-person and personal-email
fields** in its schema — two points of contact and their addresses, a second contact pair, two senators
and a representative — and all nine are **populated on 0 of the 628 California rows** today. An inspection
of today's values would conclude there is nothing to protect. The service is refreshed **weekly**.
**Guard:** enforce an **allow-list of requested fields**, never a deny-list and never an inspection, and
assert **by name** that each forbidden field is absent from the compiled spec, from every popup, column
and export header. A field that is empty this week is a field that is populated next week, and by then the
leak is in a PDF somebody has emailed.


**A join key can identify a FILING rather than a thing, and the symptom is a distribution with a
suspiciously tidy ceiling.** `[data]`
@@STAMP@@ A regional agency republishes the same statutory return as three services joined on a GUID
(`apr_uuid`). All **9,046** entitlement-to-permit joins came back with a reporting-year difference of
**exactly zero** — because the GUID identifies a *project-year filing*, not a project. A project whose
permit landed in a later cycle has an entitlement row in one service and a permit row in another under a
**different** GUID, and nothing joins them. The consequence is fatal for a timing read and invisible without
this check: the frame **cannot express an interval longer than one reporting cycle**, so its maximum
measurable lag is **355 days** and its over-two-years share is **0.0 % by construction** — which reads as a
fast, well-run region and is an artefact of survivorship. **Guard:** when a join yields a suspiciously
bounded distribution, group the joined pairs by the difference in their period column. A single-valued
result means the key is period-scoped and the whole population is survivors. The right response is to bar
that frame from producing the figure at all, not to caveat it.

**A date field named for one stage can hold the date of a different one.** `[data]`
@@STAMP@@ The same republish carries `issue_date` on its **entitlements** service, and it is not the
entitlement date — it is the date of the **furthest stage the project reached**, equal to `ent_approve_dt1`
on the 12,627 of 21,880 rows still at entitlement and equal to the permit date on the rest. A naive
`issue_date − ent_approve_dt1` therefore returns zero on **58 %** of the table and drags any median it feeds
toward nothing. The metadata says only "issue date". **Guard:** where a service carries both a stage-specific
column and a generic date column, prove which stage the generic one belongs to by comparing it against the
stage column **on rows in each stage separately**. Equality on exactly the rows in one stage is the tell.

**A missing value can be an empty string in a column that also accepts nulls, and `IS NOT NULL` will
then return the whole table.** `[data]`
@@STAMP@@ `ENT_APPROVE_DT IS NOT NULL` returned **464,059** — every row in the table — while
`ENT_APPROVE_DT <> ''` returned **78,381**. Both are valid SQL and only one is a measurement; the wrong one
overstates the measurable population by **5.9×** and does it silently, because a count of every row looks
like a healthy answer rather than a failed predicate. **Guard:** test **both** forms of the emptiness
predicate on every String column before building a population on it, and record the pair in the recipe. If
they differ, the column uses empty strings and every subsequent `WHERE` must say `<> ''`.

**A String column holding numbers can differ by exactly ONE row between a lexicographic and a numeric
comparison, which is the size of error that passes review.** `[data]`
@@STAMP@@ `ENT_APPROVE_DT > '44000'` returned **32,874**; `CAST(ENT_APPROVE_DT AS INTEGER) > 44000` returned
**32,875**. The single differing row held a six-digit value where every other row held five, and
lexicographic order put `'335719'` **below** `'44000'` because `'3' < '4'` — while numerically it is eight
times larger. `orderBy DESC` on the same column did not surface it either, because the true maximum is not
at the top of a lexicographic sort. This library already records a case where the same trap understated a
maximum by 117×; **the small-delta version is more dangerous, because a one-row difference reads as a
rounding artefact rather than a bug.** **Guard:** cast, always, and check the **value-length distribution**
of any String column you compare — a column that is 45,744 five-digit values and one six-digit value is
exactly the shape that hides this.

**A name join between two public agency layers can be 460 of 465, and every one of the five failures can
be a real, active entity — one differing only by a diacritic.** `[data]`
@@STAMP@@ Filing jurisdictions named `ANGELS CAMP`, `CARMEL`, `CATHEDRAL`, `SAINT HELENA` and
`LA CANADA FLINTRIDGE` do not match the boundary layer's `Angels`, `Carmel-by-the-Sea`, `Cathedral City`,
`St. Helena` and `La Cañada Flintridge`. The last differs **only by a diacritic**, so whether the join
reports 460 or 461 matches depends on whether the fold normalises Unicode — and a build that folds
diacritics will find four failures where a build that does not finds five, with neither number wrong. A
naive join renders five cities that filed as blank ground, indistinguishable from cities that filed nothing.
**Guard:** assert the **resolved count** against the expected count and stop the build on a mismatch. A
fuzzy fallback that silently succeeds is worse than a hard failure, because nothing on screen would show it
fired. Note also that the boundary layer's names are **mixed case** while the return's are upper — case
folding is required before the aliases are even reachable.

**An `esriFieldTypeDateOnly` column serialises as an ISO date STRING under `f=json`, not as epoch
milliseconds.** `[data]`
@@STAMP@@ `ent_approve_dt1`, `bp_issue_dt1`, `co_issue_dt1` and `report_last_updated` are all typed
`esriFieldTypeDateOnly` on the regional services, and they come back as `"2021-05-11"`. Arithmetic written
for the ordinary `esriFieldTypeDate` — which does return epoch milliseconds — throws `unsupported operand`
on the subtraction rather than returning a wrong number, which is the merciful outcome and only because
subtracting two strings is an error rather than a coercion. In a language that coerces, it would be a
silent `NaN` in a duration. **Guard:** read the field **type** from the layer document, not just the name,
and branch on `DateOnly` versus `Date`. Assert the parsed value round-trips to the string the service sent.

**A published aggregate's DOCUMENTED field name may not be the field name it serves.** `[data]`
*(2026-09-07, portfolio & asset register)* The BLS QCEW annual CSV layout names `annual_avg_estabs_count`;
the API returns **`annual_avg_estabs`**. A build that trusts the published layout gets a `KeyError` at best
and a silent zero at worst — and a silent zero in an establishment count propagates into every share
computed from it. **Guard:** a field name may not enter a design until a **response** has shown it, and
that includes a bulk file's own published layout. Assert both directions — that the documented name is
absent and the served one present — so the day the layout starts matching its documentation you are told.

**A suppression flag can zero ONE column and leave another intact, and the zero looks like a
measurement.** `[data]`
*(2026-09-07, portfolio & asset register)* Every one of QCEW's **221 suppressed rows reports employment as
`0`** while still publishing an establishment count, so a mean, a share or a mix computed without reading
`disclosure_code` is quietly wrong — and wrong exactly where an industry has few enough employers to be
identifiable, which at county grain is a large share of the interesting cells. At six-digit industry detail
the suppressed share is **14.4 %**. Same class as the `-999` and `-666666666` sentinels already catalogued,
but harder to spot because **the sentinel is a plausible value**. **Guard:** read the disclosure flag,
exclude the cell, and **render the suppression** — never impute across it, and never let a suppressed zero
into a mean, a share or a mix. Pick the aggregation level whose suppression you can live with: here the
NAICS sector level is the one level with **zero** suppressed rows, which is why the mix is drawn there
rather than deeper.

**The SAME published table can support two defensible readings that differ by 2.1x on the largest
class.** `[data]`
*(2026-09-07, portfolio & asset register)* QCEW establishment counts for Los Angeles County are dominated
by NAICS 62, which is **284,456 of 565,948 private establishments — 50.3 % — at 2.9 employees each**,
because it counts individual practitioners and home-health registrations rather than occupied commercial
floorspace. An establishment-weighted use-class mix therefore reads **54.8 % specialist** and an
employment-weighted mix of the same table reads **26.4 %**. Neither is wrong. **Guard:** where a published
table supports more than one weighting, **pick one, print which you picked, and print the alternative
beside it.** A figure that does not say which reading it is, is the wrong one.

**A published break-right column can be populated on 99.99 % of rows and mean nothing on a fifth of them,
because the date is set EQUAL to the expiry it is supposed to precede.** `[data]`
*(2026-09-07, portfolio & asset register)* GSA's Current Lease Inventory carries `Termination Right Date`
on **7,367 of 7,368** leases, which reads as *"almost every federal lease carries a break right."* It does
not. On **1,299 rows the date is exactly the lease expiration date** — a right to terminate on the last day
of the term, which is not a right to terminate at all — and on **2,726** more it has already passed. Only
**3,342** are live. The recipe's own §4 had counted a break right as *"a termination date inside the
horizon"*, and on that reading the five-year roll-off splits **43.4 % optional / 56.6 % contractual**.
Excluding the equality rows, **767 of those 1,559 "options" evaporate** and the honest split is
**26.5 % / 73.5 %** — fewer than one in four of a real estate's five-year roll-off is a decision the
occupier owns, not fewer than half. Nothing errors, nothing is null, and every count is reproducible; the
column is simply not a sentinel you can spot by type or by null-rate. Same class as the `-999` and
`-666666666` entries in this section, but harder, because the sentinel here **is a valid date** and it is
the *relationship between two columns* that is the tell. **Guard:** where a column is defined relative to
another (a break before an expiry, a review before a renewal, a start before an end), assert the
**relationship** on ingest and count the degenerate cases — equal-to, after, and already-past — before any
share is computed off it. And where a corrected figure moves a headline, print both and say which is
which: this one moved the design's way, and burying the correction would have been the same sin as
inventing it.

**One service can carry dozens of layers with the *same name*, and only some of them carry the field you
came for.** `[data]`
*(2026-09-03, parcel record coverage)* A recipe recorded a census boundary service as having *"four layers
named exactly Counties, and only layer 55 carries `POP100`"*. It has **28** layers named `Counties`, every
one returning the same 58 California rows, and **seven** of them carry `POP100` and `HU100` — the whole
group under one parent layer. Name and row count cannot tell them apart; only `parentLayerId` and the
field list can. A sibling service one level down has four layers named `Census Tracts`, all returning
9,129 rows, and there **exactly one** carries the population. A reader who binds by name has, in the worse
of the two cases, a one-in-four chance of a layer with no population on it at all, and nothing errors —
the join simply produces nulls. **Guard:** bind a census-style layer **by id**, state the vintage beside
it, and assert the field you depend on is present in the layer document before the build proceeds. Do not
trust a recorded count of identically named layers either; enumerate them.

**A year column can be a TWO-DIGIT year, in an Integer field, with no hint in the metadata.** `[data]`
*(2026-09-02, site selection - the swing slate)* Caltrans' `EST_YEAR` is `esriFieldTypeInteger` and is
documented as the count year. Its distinct values are `0..24` and `72..99`. Rendered as read it prints
"count year 22"; compared as a year, `EST_YEAR = 2024` matches **nothing** while `EST_YEAR = 24` matches
rows, so a filter for recent counts silently returns an empty set. **Guard:** read the **distinct values**
of any date-like column before binding it, not merely its type; window a two-digit year explicitly
(`<= 30` is 2000s, else 1900s) and assert both directions — that the four-digit form matches nothing, and
that the windowed value lands inside a plausible range.

**Two layers from the same agency, meant to be joined, type the same join key differently — silent in one
direction and a 400 in the other.** `[data]`
*(2026-09-02, site selection - the swing slate)* Caltrans' AADT layer types `RTE` and `PM` as `String(254)`;
its Truck Volumes sibling — the layer the first is documented to join to — types `RTE` as `Integer` and
`POSTMILE` as `Double`. A string predicate against the truck layer **errors 400** (the String-typed-numeric
trap running in reverse: here the column really is numeric and the *query* is the string), and a
client-side join comparing `'5'` with `5` matches **zero rows** with no error at all. **Guard:** read the
field types on **both** sides of a join, not only the side you query first, and normalise the key
explicitly before comparing. Where the join has a licensed fallback, a total type mismatch is
indistinguishable from a sparse source — the app renders "unknown" everywhere and looks correct.

**Two layers in ONE FeatureServer can carry two entirely different schemas, and the mismatch surfaces as
HTTP 200 with an `outFields` error.** `[data]`
*(2026-09-02, land bank & acquisition screening)* DTSC's `Envirostor_Public_Data_Export` FeatureServer
publishes three layers presented as one register. Layer 0 (`cleanupsites`, 13,996 rows) carries
`project_name` · `status` · `status_date` · `restricted_use` · `envirostor_id`. Layers 1 and 2
(`hazardouswastesites` 906, `ICEsites` 280) carry **none of them** — they are `facility_name` ·
`facility_status` · `facility_type` · `epa_id`, with no status date at all. Sending layer 0's field list
to either returns:

```
{"error":{"code":400,"message":"Cannot perform query. Invalid query parameters.",
          "details":["'outFields' parameter is invalid"]}}
```

A client that treats that 400 as "no features here" silently drops **1,186 sites** from a contamination
screen, and reports the ground clean.

**Guard: read the fields array of EVERY layer you bind, even siblings in the same service.** One service
document is not one schema. And never let a `/query` error fall through to an empty-result path — surface
it as its own visible state.

**The documented class field may not exist on the service, and the recipe that recorded it can be wrong.** `[data]`
*(2026-09-02, land bank & acquisition screening)* CAL FIRE's Fire Hazard Severity Zone layers were
recorded — in a verified recipe, with counts that still reproduce exactly — as carrying `HAZ_CLASS`.
They do not:

```
FHSZSRA_23_3/FeatureServer/0   fields: OBJECTID  SRA:String  FHSZ:SmallInteger  FHSZ_Description:String
HAZ_CLASS  ->  {"error":{"code":400,"details":["'Invalid field: HAZ_CLASS' parameter is invalid"]}}
```

Everything else in the record held: 18,423 and 9,752 rows, and the fourth `NonWildland` class at exactly
1,954. Only the field NAME had moved. **A verified §4 ages field-by-field, not layer-by-layer**, and a
count that still reproduces is not evidence that a field still exists.

**Guard: re-read the fields array at build time even when the recipe is verified and its counts match.**
Bind field names from the response, never from the prose.

**Two flavours of empty are two different things, and `IS NOT NULL` is the wrong populated-check.** `[data]`
*(2026-09-02, land bank & acquisition screening)* On DTSC EnviroStor, `acres IS NOT NULL` returns **all
13,996 rows**, because 3,983 of them hold `''` rather than NULL. On Sacramento County's street
centerlines, `CONSTRUCTION_STATUS` is NULL on 45,192 rows **and** `''` on 3,800 more, leaving it genuinely
populated on **32.5 %** of a 72,559-row network. Both fields look fully populated to the obvious check and
are mostly blank.

**Guard: test `field IS NOT NULL AND field <> ''`, and report the unpopulated share on screen.** A value
that is blank renders as *not published*, never as `0`.

**A String-typed number has three failure modes, not one, and the workarounds do not transfer.** `[data]`
*(2026-09-02, land bank & acquisition screening)* Three services, three different answers for the same
question. One needs `CAST(... AS INTEGER)`. A second errors on that and needs `CAST(... AS FLOAT)`. A
third — DTSC's `acres` — **rejects both**:

```
acres > 10                  {"error":{"code":400,"details":["Unable to perform query..."]}}
CAST(acres AS FLOAT) > 10   {"error":{"code":400,"details":["Unable to perform query..."]}}
restricted_use = 'YES'      {"count":936}          <- a string predicate works fine
```

It can only be pulled and parsed client-side, counting the blanks rather than dropping them.

**Guard: probe the cast against the actual service. Do not assume the idiom that worked last time**, and
where no cast works, parse client-side and say on screen how many rows had no value.

**A String date in US `M/D/YYYY` form sorts on its first character, so `ORDER BY … DESC` hides every
October, November and December.** `[data]`
*(2026-09-02, land bank & acquisition screening)* On a contamination register current to **2026-08-26**,
a descending sort on `status_date` reports **`9/9/2025`** as the maximum. 2,841 rows (**20.3 %**) begin
`10/`, `11/` or `12/` and are invisible to that sort, and 251 rows fall in 2026. The field that decides
whether a case is open or closed is the one that cannot be sorted.

**Guard: parse the value and take the maximum by date, never by the column order.** Same class as the
lexicographic numeric maximum, and it bites hardest on exactly the field a reader will quote.

**A road centerline layer is not a public-road layer.** `[data]`
*(2026-09-02, land bank & acquisition screening)* Sacramento County flags **10,180 of 72,559** centerlines
(**14.0 %**) as `PRIVATE='Y'`, and `CONSTRUCTION_STATUS` includes 25 rows marked `PLANNED` — roads that do
not exist yet. The national fallback, Census TIGER, carries **no ownership attribute at all**. So a
"does this site front a mapped road?" check answers *yes* on a private driveway roughly one time in seven
where ownership is published, and cannot ask the question at all where it is not.

**Guard: state the weaker claim wherever the stronger one is unsupported** — *"fronts a mapped road"*, not
*"fronts a public road"* — and say plainly that neither is legal access. Easements and rights of way are a
title matter and are not published as data.


**A field name can be a property of the RELEASE, not of the dataset — and the mismatch surfaces as HTTP 400,
not as an empty result.** `[data]`
*(2026-08-30, resilience disclosure pack)* FEMA's National Risk Index documentation and CSV distributions use
`RFLD_*` for riverine flooding. Querying `RFLD_RISKS` on the published feature layer returns
`{"code": 400, "details": ["'Invalid field: RFLD_RISKS' parameter is invalid"]}`. The obvious reading —
*the documentation disagrees with the service* — is not the useful one. Measured across all four live NRI
census-tract releases: `RFLD_EVNTS` / `RFLD_AFREQ` exist on the **October 2020, November 2021 and March 2023**
releases, and on **none** of the current release's 469 fields, which carry `IFLD_*` ("Inland Flooding")
instead. **The documentation was right for three releases and is wrong for the fourth.** So code that queries
`RFLD_*` works perfectly, passes every suite, and 400s the instant someone repoints it at the undated title.
**Guard:** never carry a field list across a release boundary. Read field names from the service you are
actually bound to, on every build; assert the names you depend on; and **fail loudly when one disappears**
rather than falling back to a sibling service that happens to have it. Sharpens the existing *read field
names from the service, never from the vendor's data dictionary* rule: the dictionary is not wrong, it is
**versioned**, and it does not say so.

**Two published authorities can report the same measure for the same extent and disagree by half, with
neither service mentioning the other.** `[data]`
*(2026-08-18, re-confirmed 2026-08-30, resilience disclosure pack)* California annual earthquake loss:
FEMA National Risk Index `SUM(ERQK_EALT)` over 9,106 tracts = **14,853,244,103.03 USD/yr**; California
Geological Survey Map Sheet 48 `SUM(AEL)` over 58 counties = **9,614,543,798.00 USD/yr**. Ratio **1.545 : 1**,
identical to the cent on both reads. Both are published, both are current, neither is wrong — one is a
tract-level federal index and the other a county-level Hazus study — and **nothing in either service tells
you the other exists.** **Guard:** when two authorities publish the same measure for the same extent, carry
**both**, name both, and never sum, average or silently prefer one. Reconciling them manufactures a consensus
that neither publisher asserts. **And the harder sibling:** disagreement between two publishers is the
*visible* case. Disagreement between a publisher and its own back catalogue (see the four-live-releases entry
in §5) is the invisible one, because there is only one service name and it happens to be undated.

**A service can publish a perfectly queryable figure with no retrievable vintage at all.** `[data]`
*(2026-08-18, re-confirmed 2026-08-30, resilience disclosure pack)* CGS Map Sheet 48 answers every query,
returns 58 clean rows and a stable statewide total — and carries **no date anywhere**: `copyrightText` is the
empty string, `description` is the empty string, `editingInfo` is null, and a schema query for date-typed
fields returns `[]`. The whole layer is `OBJECTID`, `CountyName`, `StateName`, `AEL`, `Shape__Area`,
`Shape__Length`. The *2023* in the service name `MS48_AEL_2023` is a **name, not metadata**. **Guard:**
*undated evidence* is a **first-class state**, distinct from *missing* and from *current*. An app that prints
a date it inferred from a service name has **invented provenance** — carry the null, print
*"vintage: none retrievable"*, and let the number be used with that caveat attached rather than laundered.
Same layer, second caution: it advertises `capabilities: Query,Create,Update,Delete,Uploads,Editing` on a
**public read endpoint**. Bind read-only.
*(2026-10-21, lifeline board build)* The same two findings, on a different publisher:
- **Undated baseline.** The California Geoportal county layer's `Population` carries no vintage and sums to
  **38,340,074**. FEMA's NRI gives 39,501,350 for the same state, about 3 % apart. *Guard:* use one
  baseline per rate, label it *undated* on screen and in every export, and never put a numerator from one
  baseline over a denominator from the other.
- **Write capabilities on a public listing.** HCAI's Current Healthcare Facility Listing advertises
  `Create,Delete,Query,Update,Editing`. The capability is not an invitation. Bind it read-only, and have any
  write path refuse a public layer by rule rather than by omission.

**A coded field's code ORDER cannot be inferred from prose — and guessing it can invert the app.**
`[data]`
*(2026-08-24, health equity overlay)* NCHS USALEEP publishes an `Abridged life table flag` on every
tract. Its landing page describes the categories as *"exclusively observed, a combination of observed
and predicted values, or exclusively predicted"* — which reads as a code order making **3** the
fully-predicted class. On the California file that is **6,051 of 7,516 tracts, 80.5 %**. The published
record layout says the opposite: `1 = Observed …, 2 = PREDICTED …, 3 = Combination`. The fully-predicted
class is **1,049 tracts, 14.0 %**. An app that inferred the order from the sentence would either have
excluded four fifths of the state or — reading it the other way — kept every modelled tract in its
headline. **It gets worse:** on this file the fully-predicted class carries the **smallest** mean
standard error of the three (1.65 years against 2.03), so those rows are the **most** likely to pass a
significance test. The least-measured rows are the ones a naive gate promotes. **Guard:** never infer a
code order from descriptive prose, however plainly it is written; retrieve the record layout, pin the
mapping in code beside the data that depends on it, and assert the mapping in the suite so a silent edit
cannot invert the product. If the code book cannot be retrieved, display the raw code with its
distribution and let it gate nothing.

**A column named "Range" is a class, not an interval.** `[data]`
*(2026-08-24, health equity overlay)* CDC's Socrata copy of USALEEP carries `le_range` beside
`le` — and it takes **five values across all 8,058 California rows** (`56.9-75.1`, `75.2-77.5`, …),
because it is a national quintile band, not a confidence interval. The real uncertainty is a separate
per-row `se_le`. Binding by column name on an app whose entire honesty device is the interval would have
rendered a fabricated one. **Guard:** before rendering any field as an interval, **count its distinct
values** — a handful over thousands of rows means it is a class. `looksLikeAnInterval()` in that build is
three lines and is asserted in both directions: it must reject `le_range` and accept `se_le`.

**A designation layer is a membership SET, not a flag over the region.** `[data]`
*(2026-08-24, health equity overlay)* `Disadvantaged_Communities_CES4` carries `DAC = 'Yes'` on **all
2,310** rows. There is no `'No'` anywhere: a tract's "no" is its **absence** from the layer. Reading a
missing row as `'No'` works by accident until somebody filters on the field, and reading a null as a
negative is how an absence becomes a measurement. **Guard:** when a categorical field holds one value on
every row, it is a set — join it against the full universe and write the negative case **explicitly on
every feature** (`dac_status = 'inside' | 'outside'`, asserted populated on all 8,057).

**A field can be published and empty on every row — and `IS NOT NULL` will not tell you.** `[data]`
One field looks like the USGS quadrangle name a study must cover; it is whitespace on all 2,806 rows, as
are the two coordinate fields beside it. `EventType` and `StreetName` are blank on all 62,306 rows of a
works registry — which is why that app is a map and not a search box. *(2026-08-16, collateral &
portfolio risk)* Re-measured on that same CGS layer: `MAPNAME_1 IS NOT NULL` returns **2,806 of 2,806**
and `MAPNAME_1 IS NOT NULL AND MAPNAME_1 <> ''` returns **0** — the null check reports a fully
populated field and the empty check reports an empty one, on the same column in the same second.
So a recipe that binds the field and promises "the quadrangle name where there is one" is describing
something that never happens. **Guard:** profile `WHERE field IS NOT NULL AND field <> ''` — never
`IS NOT NULL` alone — before designing around a field, and make the consumer degrade to a bare label
rather than printing a dangling separator.

**A descriptive sub-label can contradict the regulatory flag on its own row.** `[data]`
*(2026-08-16, collateral & portfolio risk)* On the NFHL `S_FLD_HAZ_AR` schema, all **6,257** polygons
whose `ZONE_SUBTY` reads *"Area of Minimal Flood Hazard"* carry `SFHA_TF = 'T'` — inside a Special
Flood Hazard Area, the class that triggers the NFIP mandatory-purchase obligation on a federally
backed mortgage — and **none** of them carries `FLD_ZONE = 'X'`. The plain-English sub-label says
*minimal*; the regulatory flag on the same row says *in the zone*. A recipe had recorded the two
subtypes as the split **within** Zone X, which they are not. Reading the sub-label as
"analysed, found low" moves 6,257 polygons out of a class that is a credit attribute on a loan file.
**Guard:** identify which column the regulator's line is actually drawn on (`SFHA_TF` here), key every
classification on that, and treat a descriptive sub-label as decoration that may never downgrade a
class. Assert the contradiction so it cannot be re-inferred.

**Numeric-looking columns are often strings.** `[data]`
`naics_code` is a String; use `LIKE '4451%'` or cast. A "diameter" field has **84 distinct forms**
(`8`, `8, 10`, `8.625`, `8"`, `` ``) and is not a plain number on 28.3 % of the network. **Guard:**
profile distinct values before treating a column as a measure.

**A numeric comparison against a string code column is silently COERCED, not rejected.** `[data]`
*(2026-08-13, catchment & market-share)* This entry previously said `naics_code = 445110` **errors**.
It does not, and the truth is worse. On the same service, in the same second: `= 445110` returns the
correct **323**; `= 4451` — the obvious way to ask for the *category* — returns a silent **0**; and
`> 445000` returns **1,686** categorically meaningless rows. A wrong query comes back as a plausible
number instead of a failure, and the silent zero reads as *"no competitors here"*, which sends any
share computed from it to infinity. **Guard:** never write an ordering comparison against a code
column, use `=` only on a full-width code and `LIKE` on a prefix, and assert the *prefix* count
against the `LIKE` count in the suite — the two disagreeing is the whole trap.

**An identifier need not join across two registers of the same thing.** `[data]` `[app]`
*(2026-08-13, catchment & market-share)* Comparing a brand's share under two POI registers assumes the
brand exists in both. The largest grocery operator under NAICS 4451 (69 outlets) appears in **no other
grocery register at all**, so every cross-register comparison for it was empty — and an app that picks
"the largest operator" as its default subject silently collapses to a single source. **Guard:** when a
design compares an entity across sources, choose the default subject from entities the sources
**agree exist**, and name the sources that cannot see it rather than rendering a zero.

**A ratio can be degenerate by construction, and it will look like a triumph.** `[app]`
*(2026-08-13, catchment & market-share)* A catchment defined as *"ground nearer to one of ours than to
any competitor's"* contains, necessarily, none of their outlets — a competitor's own site is always
nearest to itself. The share therefore reads **100 %** whatever the market does. Every arithmetic
assertion passed, because the arithmetic was right. **Guard:** for any ratio, ask what its denominator
is *forbidden* to contain; where the answer is "the thing that would make it move", refuse to print the
ratio, say why on screen, and keep the measure the construction *can* support (here, the demand it
holds). Found by looking at the first screenshot, not by a test.

**A field can be filterable but not selectable.** `[data]`
One service drives its own renderer from a field and accepts it in a `WHERE` clause, but omits it from
`fields[]` — so `outFields=<that field>` returns **HTTP 400**. **Guard:** a field proven to work in a
filter still has to be proven in `outFields` before a popup or table binds to it.

**One code, two meanings.** `[data]`
A band labelled `0` meant *"0 % **or** no data"* — a sentinel that conflates a measured zero with an
absent measurement. Colouring it as a gap silently invents a finding. **Guard:** find the sentinel before
designing the scale; render it as its own class, off by default, with the ambiguity named on screen.

**Two names, one measurement.** `[data]`
Two differently-titled services published byte-identical bands — offering both as choices implies a
comparison that does not exist. **Guard:** prove two sources differ before letting the user pick between
them.

**A field renamed between vintages fails silently.** `[data]`
`ACAT_100_20` became `ACAT_10020` between two years of the same product. A hard-coded name returns an
**empty groupBy with no error**, which reads as *"no data here"* rather than *"wrong field"*. **Guard:**
resolve field names per vintage from `?f=json`, and make an empty result assert loudly.

**Never derive a number from geometry the register does not publish.** `[app]`
A points-only register carries an area attribute as a string; computing area from the points, or drawing a
boundary the publisher never issued, manufactures authority. If the shape is not published, the app does
not draw it and does not measure it.

**Exclude or label the class your measure cannot describe.** `[data]`
One stream order read 89 % "never gaged" — because it is tidal channel, where a discharge gage is not the
instrument. Left in the headline it reads as a damning finding about neglect. **Guard:** identify the
classes where the metric does not apply, and either exclude them with the reason on screen or label them.

**Layers of ONE service need not share a schema.** `[data]` *(2026-08-12, broadband gap matrix)*
`CPUC_EOY_2024_Broadband_Grants` publishes five layers: layer 0 (*Proposed*) carries
`PROP_SPEED`/`APPDATE`, layers 1–3 (*Approved*) carry `FRN`/`DOWNSTREAM`/`UPSTREAM`/`GRANTAMT`, and
layer 4 keys on **`FID`**, not `OBJECTID`. Reading the service's layer 0 and binding layer 1 from it
yields `outFields` that **400** on the layer you actually query — and the recipe that recorded the
schema "for the grants service" was describing only one of its five. **Guard:** read `?f=json` per
**layer**, never per service, and assert the bound `outFields` against that layer's own `fields[]`.

**Padded `CHAR` columns never match an untrimmed comparison.** `[data]`
A space-padded `CHAR(6)` status flag: `=== 'OFF'` matches zero rows. Trim centrally.

**Cumulative fields do not sum.** `[app]`
Cumulative upstream drainage area double-counts every confluence. **Guard:** ask what a field accumulates
before aggregating it; prefer a measure that reconciles with a published total.

**Changing scope must clear everything derived from the old scope.** `[app]`
Switching campus left the previous campus's inventory in place, so the panel reported one institution's
24,400 ASF under whatever institution you had just selected. The same class of bug bit a second app from
the other direction: adopting a new cell repainted the map and re-scoped the table but left the reading
stale, so the headline number and both KPIs kept the *previous* cell's figures — the map looked right,
the table looked right, and the big number lied. **Guard:** one scope-change handler that invalidates
every derived value, and recomputes the reading *before* repainting.

**Two similar numbers are often not parameterised the same way.** `[app]`
A published "gaged share" of stream length is *not* affected by the app's own definition of "measured";
only gage presence is. Conflating them made a toggle appear to move a number it has no business moving.
*(2026-08-12, broadband gap matrix)* The same class, one level up: a recipe quoted a **statewide**
ratio of 20.4× beside a **county** ratio of 16.8× — computed under *different* rules for an ambiguous
"0% or no data" band, which it disclosed once in §1 and not again beside the figures. A suite pinning
the statewide constant against the app's (correctly band-0-excluding) default went red at 19.7×.
**Guard:** carry the rule with the figure everywhere it appears, and pin **both** readings in the
suite. The arithmetic that settles such a dispute is usually a containment check — here, any "≤60%"
gap larger than the whole 1–3 band range must be counting band 0.

**Completeness varies by geometry type.** `[data]`
0.09 % of polygons lack a contact email against **75.2 % of lines**. Sampling one layer generalises
wrongly by two orders of magnitude.

**A registry with no retirement policy carries the dead.** `[data]`
539 sentinel values and in-progress rows dated 1999. State the vintage on screen.

**Time slider filters nothing.** `[app]`
Read the **real time field** from the service (`?f=json`) — don't invent it. `TimeSlider` builds a
`definitionExpression` on that field (`instant`: `t <= now`; `window`: `t BETWEEN a AND b`), stacking with
any other `definitionExpression`.

**A hazard layer's complement is three things, and one of them is usually published.** `[data]`
*Inside the zone*, *analysed and cleared*, and *never analysed* are three different answers, and a simple
`WHERE` that asks only the first folds the other two together. Agencies increasingly publish the third as
its own geometry — a California seismic-hazard service serves an **"Unevaluated Areas"** layer that is
**3.8× larger than the zone layer it accompanies** (2,806 polygons against 738), and a flood service
carries a zone code whose published definition is *"no analysis of flood hazards has been conducted."*
Measured on 9,129 tract interior points, **54.9 % of a state's published building value sat in the
never-analysed class** — a majority answer that a two-state model reports as "not at risk". **Guard:**
before treating "outside the polygon" as "no hazard", look for the complement layer and the *undetermined*
class code, and carry them as their own state in the data, in the legend and in every export.

**A "No Rating" is not a low rating, and a composite index will not tell you which it is.** `[data]`
A national multi-peril index returned `No Rating` for wildfire on **3,984 of 9,106 tracts — 33.9 % of
building value** — with the peril's exposure field at exactly `0`, and with **zero** `Not Applicable` and
**zero** `Insufficient Data` rows in that state, so "the hazard cannot occur here" and "we have no data"
wore one label. On 85 of those tracts the *state's own* fire agency published *High* or *Very High*.
**Guard:** read the reason field rather than the rating; never merge a composite index into a class a
regulator publishes; and if the index drops a peril from its own summation, say how many perils actually
entered the score.

**A trailing marker followed by whitespace defeats a strip-then-trim.** `[data]`
*(2026-08-17, concentration & exposure analyzer)*
Every sector title in the published 2022 NAICS structure carries a trilateral-agreement **`T`** glued to
the text (`"UtilitiesT"`, `"ConstructionT"`), and the legend for that marker lives in a free-text note in
row 2 rather than in a column. One of the twenty — sector 55 — is published as `"Management of Companies
and EnterprisesT "`, with the marker followed by a **space**, so `title.replace(/[T*]+$/, "").trim()`
strips nothing and *"…EnterprisesT"* reaches a board pack. **Guard:** trim, *then* strip the marker, then
trim again — and keep the raw title in a second field so the strip is auditable.

**A published code list and the published data keyed to it need not agree.** `[data]`
*(2026-08-17, concentration & exposure analyzer)*
The 2022 NAICS structure publishes **20** sectors including `31-33`, `44-45`, `48-49` and `92 Public
Administration`. County Business Patterns publishes **19** for the same state, keyed `31----`, `44----`,
`48----`, **omits 92 entirely**, and adds **`99` Industries not classified**, which is not a NAICS sector
at all. A list assembled from the code list and populated from the data has twenty rows, one permanently
empty and one silently missing. Three of the twenty codes also arrive as **strings** (`"31-33"`) while the
other seventeen arrive as **integers**, so a numeric sector key breaks on exactly three sectors.
**Guard:** read the code column as text and normalise on the way in; reconcile the two lists explicitly;
render the missing member as a **named absence** rather than a zero; and print what was excluded, with its
count.

**A national per-county file can contain a pseudo-county.** `[data]`
*(2026-08-17, concentration & exposure analyzer)*
County Business Patterns 2023 carries **59** county codes for California's 58 — a `999` "statewide" row
holding 1,663 establishments. Summing "by county" without excluding it overstates the total by an amount
small enough to read as rounding. **Guard:** reconcile the per-county sum against the file's own
all-sectors row, and exclude the pseudo-code by name rather than assuming every code is a real place.

**An .xlsx cell regex that requires a closing tag swallows the next cell.** `[data]`
*(2026-08-17, concentration & exposure analyzer)*
An `.xlsx` sheet writes empty cells self-closing — `<c r="A4" s="27"/>` — so a cell pattern of
`<c r="…"…>(.*?)</c>` matches the self-closing tag's own `>` and then runs on to the *following* cell's
`</c>`, consuming it whole. The parse reported 2,147 rows, read the header correctly (its first cell is
not empty), and found **zero** data rows. **Guard:** make the closing half optional —
`<c r="…"…?(?:/>|>(.*?)</c>)` — and assert a non-zero row count before using the parse.

**Two fields on the same record carry the precision and the confidence, and they are confused constantly.** `[data]`
*(2026-08-18, branch & ATM network operations)* A geocode-quality filter that passed every row was reading
the wrong column. FDIC Summary of Deposits publishes **`SIMS_PROJECTION`** — the precision *vocabulary*
(`EXACT`, `StreetAddress`, `POSTAL`, `M`, `T`, …) — **and `SIMS_DESCRIPTION`**, a free-form numeric
confidence *score* (`'100'` on 5,358 California rows, `'99.900000000000006'`, `'89.640000000000001'`, and
`None` on 53). Worse, the vocabulary **splits by case inside a single year**: CA 2025 carries
`StreetAddress` 428 alongside `STREETADDRESS` 6, and `PointAddress` 5 alongside `POINTADDRESS` 4 — the
same value, two spellings, one file. **Guard:** filter on the vocabulary field, upper-cased, and profile
the distinct values *per year* before writing the filter. A quality rule written against a plausible
neighbouring column fails open and silently.

**A public register records a charter, not whether the thing is open — and its identifiers are not all stable.** `[data]`
*(2026-08-18, branch & ATM network operations)* The FDIC branch register's 2026-08-14 index still lists
eight full-service brick-and-mortar offices in two California communities that burned in January 2025 and
that a federal regulator issued a closure proclamation for. That is not a defect in the register; it is
what a register *is*, and an app that reads presence as "open" will be confidently wrong. Separately, a
year-over-year estate diff keyed on the branch number reports **199** removals where the stable office
identifier reports **152** — 47 offices were renumbered, not closed, a 31 % over-count that looks
entirely plausible. **Guard:** take *existence and position* from a register and *state* from the
operator's own feed; and before diffing two vintages of any register, test which identifier is stable by
diffing on both and comparing the net against the published totals.

**A national register can be authoritative and still be silent about the thing your app is named after.** `[data]`
*(2026-08-18, branch & ATM network operations)* There is no public register of US bank ATMs — the federal
locations endpoint returns `{"total":0}` nationally for any ATM service type and has no ATM route. The
obvious crowd-sourced substitute disqualifies itself on **measurement, not opinion**: 1,896
`amenity=atm` nodes across California, the machine reference an operations desk keys telemetry to present
on **4 of them (0.2 %)**, and 152 ATMs listed for an operator that has 855 branches in the same state —
under a fifth of what the branch estate alone implies before a single off-premise machine. **Guard:** say
the lane is absent and cite the probe; render it from the customer's own register; and where a template
must show something, generate it seeded and labelled and keep it out of every measured figure. **Never
merge two classes of thing into one broader class to hide the gap** — the merged count is wrong in a way
nobody can see.

**"No match" and "matched but unstated" are two findings, and merging them hides which.** `[app]`
*(2026-08-20, branch & ATM network operations)* Inheriting a geocode-precision flag across two registers
produced three weak classes — 63 offices with no match in the other register at all, 58 matched but
carrying a code the vocabulary does not resolve to a location, and 3 at a postal centroid. Bucketing all
124 as "unstated" is defensible and useless: it cannot tell a reader whether the estate is unverifiable
because the join failed or because the source says so. **Guard:** keep the classes separate, name each in
the popup, and report the union only as a total. The same shape appears wherever one dataset inherits a
quality flag from another.

**A timestamp field can be constant across an entire time series.** `[data]`
*(2026-08-23, climate scenario explorer)* Every raster in a 94-year Cal-Adapt LOCA series reports
`event: "2006-01-01"` — the **series** begin date, not the raster's year. The 2085 raster says 2006. Sort
or label by it and every horizon of a horizon-stepping app collapses onto one year, with no error
anywhere; the year exists only in the slug and the filename. **Guard:** before binding a time axis to a
field, assert that the field **varies** across at least two members of the series. A constant timestamp
is indistinguishable from a working one until somebody reads the labels.

**One API can serve two raster encodings with two nodata conventions, and its own document can be
wrong about both.** `[data]` *(2026-08-23, climate scenario explorer)* In one product family:
`tasmax` is **float32, striped, nodata `1.00000001504746622e+30`**; `exheat` is **float64, tiled
256×256, nodata `nan`** — and the service document reports `nodata: null` for the file whose own
`GDAL_NODATA` tag is `nan`. Pillow opens one and refuses the other. A `> 1e29` mask alone silently keeps
every NaN cell; an `isNaN` mask alone silently keeps every `1e30` cell as a value of one thousand
billion billion billion degrees. **Guard:** read nodata from the **raster**, never from the service
document; handle sentinel **and** NaN in the same predicate; and accept both striped and tiled layouts
before deciding an ingest works.

**A field's TYPE can change with the query that asks for it.** `[data]`
*(2026-08-23, climate scenario explorer)* The same `image` field is a **GeoTIFF URL** when the raster is
requested plainly and a **float — the sampled value at that point** when a `g=` geometry is added. Code
that assumes one shape fails silently on the other: `298.038` used as a URL and a URL used as a value
both fail without throwing. **Guard:** type-check the field at the seam, and pin the query shape the
ingest actually uses in a suite assertion, so a convenience parameter added later cannot change it.

**`units: null` arrives exactly on the variables that most need a definition.** `[data]`
*(2026-08-23, climate scenario explorer)* Three unit regimes in one variable list: `tasmax` in **Kelvin**
(an unconverted legend reads 279–308), `pr` in **kg m⁻² s⁻¹** (a California range of 1.16 × 10⁻⁶ to
1.25 × 10⁻⁴, which must be multiplied by 86400 × 365.25 to become the 36.6–3,938.2 mm/yr a reader can
use), and day-count variables with **`units: null`**. **Guard:** convert on ingest, print the unit in the
legend title, and treat a variable whose *definition* cannot be retrieved as **withheld with its
reason on screen** rather than shipped with a guessed one — a figure whose definition cannot be cited
cannot carry a disclosure.

**An ESRI polygon is a MultiPolygon, and collapsing it to a `Polygon` renders almost nothing.** `[app]`
*(2026-08-23, property peril report)*
`geometry.rings` is a **flat** list of rings: every *clockwise* ring starts a new part, and the
counter-clockwise rings that follow are that part's holes. Mapping the whole list into one GeoJSON
`Polygon` makes every part after the first a **hole**. The legend counted 47 flood polygons, the GeoJSON
source held 47, the layer was present and `visibility: visible` — and `queryRenderedFeatures` returned
**0**. Every non-visual assertion was green; only a screenshot showed it. **Guard:** group rings by the
sign of their shoelace area into a real `MultiPolygon` (negative = a new exterior part, positive = a hole
of the current part), reverse each ring for GeoJSON's right-hand rule, and assert the *type* and the
*part count*, not merely that the source has features.

**`geometryPrecision` is coordinate rounding, not generalisation — and it is safe to measure on.** `[data]`
*(2026-08-23, property peril report)*
`maxAllowableOffset` drops vertices and is for paint only, but `geometryPrecision=6` merely rounds each
coordinate to ~0.11 m and removes no vertex at all. It is the right way to cut a large geometry payload
without touching what the numbers mean. Say which one you used.

**A published date field that is NULL on 100 % of rows makes its question a tautology, not a data gap.**
`[data]` *(2026-08-24, shortage-area explorer)* A federal register publishes a "withdrawn date" column on
every one of its layers, on two independent hosts, and it is **NULL on every single row of the state
subset** — because a withdrawn record is *removed* from the published set rather than flagged in it.
Asking "what share of these are still current?" from that column therefore returns **100 % by
construction**. An app that built a date-range control over it would ship a control over a permanently
empty field, and a dashboard that reported the 100 % would be reporting the shape of the publication rather
than a fact about the world. **Guard:** measure a date field's null rate over the actual subset **before**
designing a control or a metric on it; where it is total, say so and find the real signal — here a status
column plus staleness against a fixed statutory calendar.

**Counts over overlapping universes are not additive, and nothing in the response says so.** `[data]`
*(2026-08-24, shortage-area explorer)* Three sibling layers each publish a population per record for the
same geography under three different disciplines. The three state totals are 4.6 M, 1.0 M and 8.2 M, and
they invite a 13.9 M headline — but the same person sits inside a record on all three layers at once, so
the sum has no referent. **Guard:** where sibling layers partition by *category* rather than by *place*,
carry the category with every aggregate, refuse a cross-category total in the UI and in the export, and put
the reason on the card rather than in a footnote.

**A published score whose inputs are published as NULL on every row.** `[data]`
*(2026-08-24, shortage-area explorer)* HRSA's auto-HPSA *facility* layers publish `HPSA_SCORE` on
**1,423 of 1,423** California rows and publish `HPSA_POVERTY` and `HPSA_FORMAL_RATIO` on **zero** of them.
The score is real; the two fields an app would decompose it from are empty by construction, because these
designations are conferred by statute rather than earned on the score. An app that derives contribution
columns "for every row" therefore writes a 0-point ratio and a 0-point poverty contribution for 1,423
records and presents fabrication as arithmetic — the numbers even *look* plausible, because 0 is a
legitimate band. **Guard:** before deriving any per-record breakdown, count the population of every input
field **per sub-family, not per service**; where an input is absent on all of them, report the whole value
as an unrecovered remainder and say why on the record. Absence is not a measurement.

**A published zero that means "not counted", with the method column sitting right beside it.** `[data]`
*(2026-08-24, housing & homelessness services)* HUD's served 2021 Point-in-Time table carries `Unsheltered_Homeless__2021 = 0` for **36 of
California's 44** Continuums — and `Type_of_Count = 'Sheltered-Only Count'` for exactly those 36; 167
nationally. A choropleth built on the value column reports that a third of the state has nobody
unsheltered, which is the strongest and most quotable claim the data could make and is the opposite of
true. **Guard:** wherever a dataset carries a **method** column beside a **value** column, read the method
first and render the value as its own named state — `not counted` — never as a number. **Absence is not a
measurement.** Generalises far beyond this register: survey waivers, suppressed cells and
not-yet-collected periods all publish as `0`.

**A flag that means the number is from a DIFFERENT NIGHT.** `[data]`
*(2026-08-24, housing & homelessness services)* Sharper than the entry above, and easier to miss because the value is not zero. In the **2025**
workbook a `Sheltered-Only Count` row still carries a non-zero unsheltered figure — San Francisco reads
4,354 — because the publisher **carries the previous count forward**: that half is collected biennially
while the other half is annual. **14 of California's 44**, 29 of 386 nationally. Two halves of one row,
from two different Januaries, differenced as if simultaneous. **Guard:** a `carried forward` state
distinct from both a value and an absence, and **both vintages on screen beside every number**. The flag
is not a footnote — it changes what the row means.

**Duplicate column headers whose two copies AGREE.** `[data]`
*(2026-08-24, housing & homelessness services)* `Total Year-Round Beds (ES)` appears at index **5 and 14** of one published sheet, `(TH)` at 6 and 26,
`(SH)` at 7 and 36 — a summary block and the head of each per-type detail block. `pandas` renames the
second to `...(ES).1`; a hand-written `{header: index}` dict silently keeps whichever it saw last. The
trap is that on this sheet the two copies are **byte-identical on all 386 rows**, so a header-keyed read
is wrong *by luck* rather than wrong *in value* — it passes every spot check, and breaks the day the
publisher's two blocks diverge. **Guard:** read by **index**, and **assert the header text at that index**
in the suite, so a re-ordered republication goes red instead of quietly wrong.

**A string in a numeric column that means "undefined", not "zero".** `[data]`
*(2026-08-24, housing & homelessness services)* 447 cells across one published sheet hold the literal string `'.'`, every one an HMIS participation
*rate* over a zero denominator — the region has no beds of that project type, so a rate does not exist.
Coerced through `Number()` it becomes `0`, and **"0% data coverage" is a completely different claim from
"this region has no safe-haven beds"**: one is a data-quality alarm, the other is an inventory fact.
**Guard:** census the non-numeric values in every numeric column before binding, and map each sentinel to
a **named state**, never through a numeric cast. And check *which* columns hold them — here every one of
the 447 sits in the six per-project-type rate columns, so a design that imports only the summary rate has
the state in its code and no data that can ever trigger it.

**The same prefix meaning two different things in one table.** `[data]`
*(2026-08-24, housing & homelessness services)* In HUD's served schema `SH_CN_*` is **Safe Haven** bed counts and `SH_PERS_*` is **Sheltered** person
counts — one table, one prefix, two universes. Grouped by name into "the SH family", an inventory figure
is compared against a whole-system count and the answer inverts. **Guard:** expand every abbreviated
prefix against the publisher's own dictionary before grouping fields by name, and never infer a family
from a shared prefix.

**The catalogue's claim about a field is not a field.** `[data]`
*(2026-08-24, housing & homelessness services)* HUD's item description for its Continuum boundary layer says it *"includes funding status information,
as well as select Housing Inventory Count and Point-In-Time variables, as available."* The layer carries
**ten fields** and not one of them is a count. A sibling layer *does* publish the whole 33-field inventory
and count schema — **blank on all 387 rows**, with a blank `YEAR`, and the only populated bed columns
being beds *under development*. **Guard:** the field-reality step is not optional. Census every field the
design depends on **against the row count** before designing, and treat a blank vintage column on a
vintage-bearing dataset as disqualifying on its own. A description is a promise; a response is evidence.

**A single space is not a null, and `IS NOT NULL` will swear the column is fully populated.** `[data]`
*(2026-08-25, public health preparedness)* On a state heliport register `FACILITY`, `COUNTY`, `AGL_FT`,
`URL` and `FAACODE` each reported **170 of 170 populated** under `IS NOT NULL` — while
`FAACODE = ' '` returned **44** and `COUNTY = ' '` returned **1**. A county roll-up silently loses a pad;
an "FAA-coded" filter silently passes 44 uncoded ones. **Guard:** the house rule "check field population
before binding" is not enough. Check `IS NOT NULL` **and** `= ' '` **and** `= ''`, and treat the
single-space form as the default suspicion on any register maintained in a desktop GIS.

**Two strings that both look like "no" mean opposite things, and conflating them is wrong by two orders
of magnitude.** `[data]` *(2026-08-25, public health preparedness)* A licensed-facility register carried
`ER_SERVICE_LEVEL_DESC` with five values, of which **`None` (123 rows)** and **`Not Applicable`
(10,503 rows)** both read as absence to a careless filter. They are not the same fact: `None` is *a
licensed hospital with no emergency service* — a real capability finding — while `Not Applicable` is *a
dialysis clinic*, a row the attribute does not apply to at all. The field is populated only on the 458
General Acute Care Hospitals; `IS NULL` returns **0**, so absence here is a *string*, not a null. An app
treating the two as one value reports 10,626 facilities with "no emergency capability" instead of 123.
**Guard:** `groupBy` the field and read **every** distinct value before writing a predicate on it; where
two values could both mean "no", find the row population each one actually describes.

**A join key present on 14 % of rows, and mistyped across the two layers that share it.** `[data]`
*(2026-08-25, public health preparedness)* `PERM_ID` existed on **1,562 of 10,961** rows on one layer
(it identifies only facilities under a particular regulatory jurisdiction) and was null on 8 of the 458
rows the join actually needed. It was `esriFieldTypeInteger` on one side and `esriFieldTypeString` on
the other, so an uncast join returns **nothing** while looking exactly like a data gap. **Guard:** before
any join, count the key's population on **both** sides, assert the overlap you expect, and cast both
sides explicitly. A join that silently returns zero is indistinguishable from a source with no matches —
and this is the class of bug that ships as "no estimate" across a whole map.

**A register outlives its own rows: three-way join outcomes, not two.** `[data]`
*(2026-08-25, public health preparedness)* A 2021 ratings layer named 43 facilities; **40** still
existed on the current licence register. An inner join **silently drops** the other three; an outer join
renders **three phantom facilities** carrying capability they no longer have. One of the three was still
findable by name, with a null key and a `Suspense` status — which is the tell. **Guard:** a join against
a register with its own lifecycle has **three** outcomes, not two — *joined*, *delicensed* and
*phantom* — and the delicensed set must be named on screen and counted in **neither** total. Assert the
size of all three.

**Two published county-name forms, and exactly one layer reconciles them.** `[data]`
*(2026-08-25, public health preparedness)* A licence register said `Trinity`; the tract layer joined to
it said `Trinity County`. Asking the register for `COUNTY_NAME='Trinity County'` returns
**`{"count":0}`** — and a join that silently returns nothing renders every area as "no estimate", which
reads as missing data rather than as a bug. The reconciliation key turned out to be a third layer
carrying **both** forms on the same row (`NAME20` = `Yuba`, `NAMELSAD20` = `Yuba County`). **Guard:**
before any name join, probe **both** name forms against **both** sides and assert the mapping is total
and one-to-one; where it is not, bind a layer that carries both forms as the key rather than
string-munging one side into the other.

**One name column, two widths — a national file truncated at 20 characters for five year-spans only.**
`[data]`
*(2026-08-25, mission impact map)* County Health Rankings' 2025 **trend** file carries **60 distinct
county names for California's 58 counties**. `San Bernardino County` and `San Luis Obispo County` appear
as `San Bernardino Count` and `San Luis Obispo Coun` — cut at exactly 20 characters — for the spans
**2013-2015 through 2017-2019** and nowhere else. Nationally 53 names are cut at exactly 20 while the
longest name in the same file is 33 characters, so it is not a column width: one release's rows were
written through a narrower field and the publisher never went back. The **annual** file for the same
release carries all 58 names in full. This is not the two-name-forms trap two entries above — there the
two forms live in different layers; here they live in the same column of the same file, and a
`GROUP BY name` looks merely like two extra counties. Had the app joined or labelled on that column it
would have split two counties in half **in the very span the headline is computed from**. **Guard:** join
on the code, never the name; take every display name from the boundary layer; and assert the *distinct
name count equals the distinct code count* on the built layer — the cheap assertion that finds this.

**A field that rounds for display cannot also be the field you aggregate.** `[app]`
*(2026-08-25, mission impact map)* The change layer stored `value_a`/`value_b` at one decimal, because
that is how they are printed. The domain then took medians of those and subtracted, and the app's headline
read **+1,027.8** where the build's full-precision path gave **+1,027.9** — a difference that survived
into the differential and into every export. It was caught only because the domain **recomputes** the
reading from the layer instead of printing the build's own `figures.json`, so two independent paths
existed to disagree. **Guard:** the layer carries the **published** precision and display rounding lives
in a separate `*_text` field; and have the suite compute the headline a second way, from the shipped
layer, rather than asserting the build's own constant against itself.

**Two independent publisher flags collapsed into one field, and the second disappeared.** `[app]`
*(2026-08-25, mission impact map)* A county had **no published value for the base span** *and* was flagged
**Unreliable** on its most recent value in a different file of the same release. A single
`publisher_flag` column resolved to `suppressed` and the Unreliable state — the disclosure this category
names first — never reached the screen, the popup, the table or the CSV. Both states are real, they are
about **different spans**, and neither implies the other. **Guard:** one field per publisher state, never
a precedence chain that silently drops the loser; render every non-clean state that applies, and assert
the count of *each* rather than the count of "flagged". Only the browser pass found this — the offline
suite was asserting the word it had been told to expect.

**A standardised lane and the publisher's own file are not interchangeable, and swapping them silently breaks the join.** `[data]`
*(2026-08-26, humanitarian response map)* A build developed against a standardised API is "optimised" to
read the publisher's raw country CSV directly - same data, same publisher, 10,097 rows either way - and the
join to a second lane silently returns nothing. **Cause:** three differences at once. The raw file's
**second line is a HXL hashtag row** (`#adm1+name`, `#org+acronym`, ...), which a naive CSV reader ingests
as a record whose every value begins with `#`; its sector vocabulary is the country's own (`EDUCATION_OP`,
`ESNFI_OP`, `FSAC_OP`, `WASH_OP`) where the standard says `EDU`/`SHL`/`FSC`/`WSH`, so it will not join to
any other standardised lane; and its key columns are `DIST_CODE`/`PROV_CODE` rather than the standard
names. **Guard:** read the standardised lane. If the raw file must be read, skip the HXL row, map the
vocabulary explicitly, and **assert the mapped values against the standard's own list**. The corollary is
worth as much as the warning: the two agreeing row for row (10,097 rows / 401 districts / 309
organisations, every per-sector count identical) is exactly the corroboration a single probe cannot give.

**The same endpoint's CSV and JSON do not return the same schema.** `[data]`
*(2026-08-26, humanitarian response map)* One endpoint's `output_format=csv` carries **18** columns and its
JSON carries **16**; the two extra are the reporting partner's own spelling of the place name, and they are
not clean - one row reads `admin2_name = Chakhansur` beside `provider_admin2_name = ChAKAHnsur`.
**Cause:** the CSV serialiser exposes provider-supplied columns the JSON model drops. **Guard:** a recipe
that develops against the JSON and deploys from the CSV gains two unexpected columns, and anything tempted
to name-match on them will mismatch. **Join on the code, never on a name** - and probe both formats of any
endpoint you will design against in one and read in the other.

**A published boundary file has no object-id field, lower-case property names, and four name columns of which one is English.** `[data]`
*(2026-08-26, humanitarian response map)* A standard COD-AB admin-2 set ships `adm2_pcode`, not the
upper-case `ADM2_PCODE` its own documentation uses - a build that writes the documented name binds nothing
and renders an empty map. There is **no `OBJECTID` column and no `objectIdFieldName` to read**, because it
is a file and not a feature service; the nearest stable key, `adm2_pcode`, is a **string**. It carries
`adm2_name` (English, `lang = en`) beside `adm2_name1` (Dari, `lang1 = prs`), so an English-only app that
binds the wrong one produces an application that is neither English nor properly bilingual. And
`center_lat`/`center_lon` are **null on all 401 features** - there is no published centroid. **Guard:**
read the property names out of the file rather than out of the convention's documentation; **synthesise the
OID in the derived layer you publish and select on that**, never on an assumed one; bind the column whose
sibling `lang` field says `en`; and if you need a point, either compute one and say you did, or design so
you never need one.

**A disclosure suppression sentinel can be a literal `"*"` inside a column that otherwise holds integers — and be the MAJORITY of the file.** `[data]`
*(2026-08-26, facility capacity & catchment)* CMS's Hospital Service Area file encodes a withheld cell as
the string `"*"` in `TOTAL_CASES`; **96,880 of 110,295** California rows (87.8 %) carry it. `int()` throws,
`float()` throws, and any loader with `try/except: 0` or `Number(x) || 0` around the cast **publishes a
withheld cell as a zero** — which states that no patients came from that place. On a map that draws a
rural hospital with almost no catchment. This is the **fourth** distinct suppression encoding now
recorded here, after `-999`, a null, and an omitted row. **Guard, generalised: classify before you cast,
and never wrap a cast in a swallow.** Give every cell an explicit state field, carry that state to the
screen, the popup and the CSV, and assert in the suite that no cell in the withheld state carries a
number and that no cell in the measured state carries a zero.

**The same identifier is zero-padded in one of a publisher's files and unpadded in its sibling, and the join fails at a plausible-looking rate.** `[data]`
*(2026-08-26, facility capacity & catchment)* CMS's Hospital **Enrollments** file spells a provider number
`50002`; CMS's Hospital **Service Area** file spells the same one `050002`. Joining naively resolved
**13 of 442 (2.9 %)**; padding both sides to six characters resolved **290**. The failure is silent and
looks exactly like sparse federal coverage rather than like a bug — 2.9 % is low enough to be believed of
a register nobody promised was complete. **Guard: assert a join rate against an expected floor**, and when
a rate looks plausible-but-low, test the key's **width** before you test its content. Related to the
existing `String(4)` line-id entry (§1), but distinct: there the coercion destroyed the key; here both
files are strings and the publisher simply disagrees with itself.

**A publisher's own figure can be impossible on its face, and repairing it is worse than printing it.** `[data]` `[app]`
*(2026-08-26, facility capacity & catchment)* Three California hospital cost reports publish more patient
days than bed-days available — a stated occupancy of up to **119.3 %** — and 46 of 329 filings report more
beds than the facility's licence record carries, because a Medicare bed count and a licensed bed count are
not the same measure. The temptation in both cases is to clamp or to suppress. **Guard: render the
publisher's number AS FILED, flag it on its face, and never repair it.** A repaired number cannot be
traced back to its source, which is the only thing that makes a provenance-first application defensible —
and the flag is more informative than the repair, because it tells the reader that two measures are being
compared, not that the data is broken.

**A fifth suppression encoding: suppression by ROW OMISSION, with nothing in the response to notice.** `[data]`
*(2026-08-26, hospital network planning)* After `-999`, `null`, the omitted geography and the literal `"*"`, this substrate adds one more:
CMS's *Medicare Inpatient Hospitals by Provider and Service* simply **does not emit a row** for a DRG a
hospital performed fewer than eleven of. Across all **13,302** California rows the minimum `Tot_Dschrgs`
is exactly **11** and **nothing sits below it**. Every value parses, no cell is blank, no flag is set --
and every provider total computed from the file is a **floor**, not a total. **Guard:** probe `min()` on
any count column. If it equals a round floor (11, 10, 5) with nothing beneath it, the file suppresses by
omission; label every total from it a floor, on screen and in the export. This is the most dangerous
encoding recorded here precisely because **there is nothing to detect at parse time**.

**A one-class "rating" field is a membership set -- and absence is NOT the good class.** `[data]`
*(2026-08-26, hospital network planning)* HCAI's `SPC_Buildings` publishes `SPC_Rating_Display` with exactly **one** distinct value (`SPC-1`)
across all **43** rows: it is the at-risk subset of the Alquist Act's 1-5 structural scale, not the
scale. Two failures follow, and the second is the serious one. A five-class legend over a one-class field
is merely wrong; reading a hospital's **absence** from those 43 rows as *compliant* is a safety claim the
layer never made -- the 2030-compliant categories are SPC 3, 4, 4D and 5, and none of them appears
anywhere in the machine-readable substrate. This generalises the *designation layer is a membership SET*
entry above: there, absence meant `'No'`; here, absence means **"this layer says nothing"**, and the UI
has to say so. **Guard:** `returnDistinctValues` on any status or rating field before designing its
legend, and where there is one value, render the negative case as *unknown*, never as the favourable one.

**The event key is usually a composite, and the obvious single field recycles.** `[data]`
*(2026-09-03, transaction evidence)* A document-page number looked like an instrument identifier: never
null, never empty, present on all 57,357 rows. It carried only **1,849 distinct values**, because the
publisher restarts the numbering; counting distinct on it alone disagreed with the `(date, page)` pair in
**101 of 279** groups, silently merging unrelated events into one.

**Guard:** test the candidate key against the composite on a real subset before trusting it. A key that
collides does not error — it under-counts, and the under-count looks like a finding.

**Two columns that look like independent measurements can be one measurement.** `[data]`
*(2026-09-03, transaction evidence)* A recorded consideration and a statutory tax sat side by side on the
same row and invited a reconciliation view. They reproduce each other exactly:
`|price − tax / rate| > $1` on **0 of 57,357** rows, and `> $0.005` on five. The publisher derived one from
the other. A "spread" panel built on them would have displayed a structural zero and been read as
corroboration by every viewer.

**Guard:** measure the disagreement before designing a cross-check. If it is always zero, one column is
derived from the other, and the pair corroborates nothing.

**One layer, two fields for the same concept, each empty on the other's rows.** `[data]`
*(2026-09-03, transaction evidence)* A building-area field was populated on **89.7 % of commercial rows but
2.9 % of the layer**; a living-area field was the reverse — 51,038 rows overall and **22 of 1,237**
commercial. A lot-size field was populated on 50,095 rows overall and **329 of 3,975 (8.3 %) of the class
where lot size matters most**, so the app could print no price per unit area for exactly that class. A
layer-level population check would have called all three fields healthy.

**Guard:** measure field population **per class**, not per layer, wherever the app subsets by a category
field — and where the subset that matters is empty, say so on screen rather than rendering a blank cell.

**A flag that splits a file cleanly and has no published definition is not a filter.** `[data]`
*(2026-09-03, transaction evidence)* An `ACTIVE_DOC_FLAG` split 57,357 rows **43,524 / 13,833** and read
exactly like a supersession marker. It is not one: **321 features had a single record and it was flagged
0**, and **4,894** rows flagged 0 were dated in the most recent year. The publisher documents nothing.
Filtering on it would have removed a quarter of the evidence base on a guess, and no screen would have said
so.

**Guard:** an undocumented flag is provenance, not a predicate. Carry it in the export's provenance block,
name it as unstated, and leave the count alone. Filtering on a flag you cannot explain turns a count into a
claim.

**`sum` on an `esriFieldTypeInteger` column silently returns `"features": []` above 2³¹−1.** `[data]`
*(2026-09-07, valuation & taxation base map)* HTTP 200, no error, no warning — an empty features array, which an indicator renders as a blank or
a zero, and a zero here was a lie about a trillion dollars. The same statistic on the same field over a
smaller population answers perfectly normally (`Roll_LandValue < 20000` → **1,075,814,358**), which is
exactly what hides it: the query shape is right, the field is right, and it works until the total crosses
the ceiling. The declared output type is `esriFieldTypeInteger` and the ceiling is 2,147,483,647;
`sum(CAST(field AS FLOAT))` returns the real figure — **1,252,597,197,055** — and cross-checks against
`avg × count`. **Guard:** cast **every** money sum to `FLOAT`, and make an empty statistics response a
**thrown error** rather than a rendered dash — one helper that asserts `features[0].attributes` exists,
called on every statistics read, so the app fails loudly instead of printing something plausible.

**Three `outStatisticFieldName` values are reserved, and they fail with the signature of a completely
different bug.** `[data]`
*(2026-09-07, valuation & taxation base map)* Same statistic, same field, same `where`, only the output *name* changing: `avg`, `count` and
`sum` each return HTTP 400 *"Unable to complete operation."* with an **empty `details` array**, while
`n`, `total`, `value`, `mx` and every other non-keyword name work — including seven statistics in one
request. That empty-`details` 400 is the same response this service gives for a type error and for several
unrelated failures, so a builder who hits it inspects the field, the cast and the predicate before ever
suspecting the label. **Guard:** never name an output statistic after its own aggregate function. When a
statistics request suddenly 400s with nothing in `details`, rename the outputs to `o0…oN` as the first
bisection step — it costs one request and eliminates the cheapest cause.

**A year column stored as a String errors on a numeric predicate, and only two of three casts work.**
`[data]`
*(2026-09-07, valuation & taxation base map)* On the single most important field in a Proposition 13 product, `where Roll_LandBaseYear < 1978`
returns HTTP 400 with an empty `details` array — nothing in the response names the field or the cause.
`CAST(... AS INTEGER)` and `CAST(... AS FLOAT)` both return **248,133** and agree; `CAST(... AS DECIMAL)`
returns the same 400. The money columns on the same layer are properly typed Integers and behave normally,
which is what makes the trap easy to miss. And the workaround does not transfer: a neighbouring county's
sale-price column fails on `CAST AS INTEGER` and works on `AS FLOAT`. **Guard:** probe both casts against
the actual service and record which one it accepts; then cast **every** predicate, sort, class break and
histogram over that column, server-side and client-side, rather than casting only at the call site where
the error first surfaced.

**A rank correlation taken with ORDINAL ranks over a tied column is order-dependent, so the figure it
reports is a draw rather than a measurement.** `[app]`
*(2026-09-07, valuation & taxation base map)* On a 27-parcel block whose base-year column carries heavy ties — one year three times, five more
twice each — Spearman computed with **midranks** is **0.923266** under all 200 shuffles of the row order.
The same correlation computed with **ordinal** (first-seen) ranks wanders from **0.9121 to 0.9322** on the
same 27 rows, purely on the order they arrive in. This build's own research pass had published **0.9255**
for that block; it sits inside that wander, so it was not a different dataset and not a different
definition — it was one draw from a method that has no single answer. A year column over millions of rows
is almost all ties, so this is the ordinary case rather than an edge. **Guard:** use midranks for every
published rank statistic, and prove it in the suite by **shuffling** — assert that the midrank figure is
invariant under reordering *and* that the ordinal one is not. An assertion that only checks the value
against a recorded constant cannot tell a correct method from a lucky ordering.

**A Socrata field declared `number` is serialised as a JSON STRING in every representation, while the
server aggregates and sorts it numerically.** `[data]`
*(2026-09-07, property hazard exposure)* `valuation` on a municipal permit register is declared `number`; `avg(valuation)` returns
`53338.53` and `$order=valuation desc` puts `775000` on top, so every server-side check says the
column is numeric. It arrives as `"25000"` in `.json`, quoted in `.csv` **and** as a string in the
`.geojson` `properties` — so `feature.properties.valuation > 1000` is a **lexical** comparison, and
`"9000" > "80000"` is `true`. A client-side filter on the raw property therefore keeps the cheap rows
and silently drops the expensive ones, which is the opposite of the intended filter and moves a median
without moving a count. **Guard:** cast once at the data-source boundary into a differently named field
(`valuation_num`), let no widget read the raw property, and put the demonstration in the suite —
`ok("9000" > "80000")` beside `ok(!(Number("9000") > Number("80000")))` — so the bug is asserted as
present rather than described. Probe the *type in the response*, never the type in the schema.

**A "Current" layer drops the incidents that just finished, and a one-letter status means "final".** `[data]`
*(2026-10-21, watch wall research)* The national "current" wildfire incident layer carries **0 of 92**
California rows with a containment time — an incident leaves the layer as it is declared contained, so a
display that tracks changes over a shift sees a fire simply vanish. Its year-to-date sibling holds **every**
current incident (92 of 92, joined on `UniqueFireIdentifier`) and the departed ones, with
`ContainmentDateTime` on 4,097 of 9,324. Separately, `ICS209ReportStatus` is one letter — `U` update, `F`
final — and all six `F` rows were at 100 % contained: a final report has **no next report due**, so a clock
that judges every report against "daily" calls a correctly closed incident months overdue. **Guard:** keep a
baseline of what was there; look a departed record up in the year-to-date layer before saying anything about
it; read the status code before applying a reporting cadence.

**A "current incidents" layer carries prescribed burns and contained fires, and "not reported" is not 0.**
`[data]`
*(2026-10-21, incident situation map build)* Of **92** California rows in WFIGS Incident Locations
Current, **20** were `IncidentTypeCategory = 'RX'` — prescribed burns, planned work — and several were at
100 % contained. `IncidentSize` was populated on **41 of 92** and `PercentContained` on **10 of 92**. A
"wildfires burning now" count that takes the layer's length counts planned burns as emergencies; a sum of
acres or an average containment that coerces null to 0 reports a state that is less burned and less
contained than any report says. **Guard:** filter or separately label `RX` (and read the category, never
the name); show null size and containment as **"not reported"**, never 0, and state the reported count
beside any aggregate ("acres across the 41 incidents that report a size").

**An initial-attack feed mixes confirmed incidents with unconfirmed reports, and spells the incident id
differently from WFIGS.** `[data]`
*(2026-10-22, live-position build)* Cal OES's WFTIIC initial-attack layer is live and keyless, but most of
its rows are PulsePoint, CHP CAD or satellite-detection **reports** with no IRWIN id; and where it does carry
one, the IRWIN id is bare lower-case while WFIGS wraps it in braces, upper-case. A count of the layer reports
every unconfirmed report as a fire, and a dedupe against WFIGS matches nothing. **Guard:** label the source
of every point and never call a report a fire; normalise the id on both sides (strip braces, upper-case)
before any join or dedupe, and assert the normalisation on a known pair. Same family as *one evacuation
zone, two id forms* (§1) and the `RX` rows above.

**One incident, two sizes — the situation report's and the perimeter's.** `[data]`
*(2026-10-21, incident situation map build)* The same fire read **1,365 ac** from the ICS 209
`IncidentSize` on the incident layer and **1,370.23 ac** from `poly_GISAcres` on its perimeter. Neither is
wrong: one is a figure filed in a report, the other is the area of a mapped polygon, and they are dated by
different clocks. An app that shows one in a card and the other in a popup looks inconsistent; one that
silently picks shows a number without its basis. **Guard:** print both, each labelled with its source
("reported 1,365 ac · mapped 1,370.23 ac") and its own time, and never difference them as if one were a
correction of the other.

**An evacuation order that was never lifted is still published as current.** `[data]`
*(2026-10-21, incident situation map build)* In the statewide evacuation aggregation on 2026-10-21, **8 of
9** orders had last been edited more than 30 days earlier — the oldest on **2023-09-21** — and some rows
carry `EDIT_DATE` **null**. Nothing in the layer distinguishes an order in force from one that nobody
withdrew, so an app that shows the layer as "current orders" tells a reader to stay out of a neighbourhood
reopened years ago. **Guard:** age every status by its own date; beyond a threshold the app states on
screen (e.g. 30 days), label the row **"unverified — check the issuer"** rather than dropping or asserting
it; where the source date is null, say **"source date not published"**, never a blank and never the fetch
time.

**The feed being up does not mean the number is current: a record has its own reporting clock.** `[data]`
*(2026-10-21, watch wall research)* The same incident layer is refreshed every few minutes, yet its
situation-report numbers (acres, containment, personnel) come from a report filed once a day — the four
California updates landed between 17:10 and 17:57 Pacific — and its row-modified time moves without a new
report (one incident modified on 20 Oct carried a report dated 17 May). A freshness dot driven by the last
successful poll is green over a number that may be days old; and a dot driven by `lastEditDate` is worse, since
some layers tick it hourly with no data change. **Guard:** show two clocks — the feed's (last successful fetch
against its cadence) and the record's (the report's own time field against the obligation to report) — and
never infer one from the other.
*(2026-10-21, incident situation map build)* Measured for both WFIGS Incident Locations Current and WFIGS
Interagency Perimeters Current: `editingInfo.dataLastEditDate` (and `lastEditDate`, now equal to it) ticks
**about every 10 minutes** while the query body stays **byte-identical** — the SHA-1 of the response was
the same across two reads ten minutes apart, either side of a tick. So neither field is a time of record,
nor even evidence of a change. (The FIRIS perimeter layer and the Cal OES evacuation aggregation were
stable over the same window — this is per-layer behaviour, not per-host.) **Guard, sharpened:** the time of
record is the **newest record time in the body** (`ModifiedOnDateTime_dt` for incidents, `poly_DateCurrent`
for perimeters); detect "something changed" by a **hash of the body**, not by `editingInfo`.
*(2026-10-22, live-position build)* **For a vehicle-position feed the split is three clocks: the poll, the
server's receipt and the device's fix.** Esri's Velocity documentation warns that polled data may be older
than the poll that fetched it, and Esri's location-sharing schema stores the device's fix time
(`location_timestamp`) apart from the server's receipt (`created_date`). An app that ages a unit from the
fetch — or from the receipt — shows a unit that stopped reporting as fresh. **Guard:** age every unit from
its own fix-time field, band the age against a stated cadence, and treat a null fix time as **stale, never
fresh**. A feed that stamps its upload time into the fix field hides its own staleness; say so wherever the
age is shown.

**A layer named "AVL" or "Last Known Location" is often not a live position feed.** `[data]`
*(2026-10-22, live-position build)* Cal OES's public "Fire Resource AVL" layer is a 2022 assignment roster
of 258 engines geocoded to their host departments — no fix time and no position fix. Its sibling "Fire and
Rescue Fleet" is a one-time August 2024 vendor dump whose `Status` is a numeric vendor code (`0`/`2`/`3`),
not a state. Across California's public ArcGIS Online layers named "AVL" or "Last Known Location(s)", one
was live (a transit fleet), one was frozen at 2024, one was empty and one held a single undated point. A
"live units" lane bound by name shows a roster, a dump or nothing as if it were positions. **Guard:** a
vehicle-position layer is live only if it carries a fix-time field whose newest value is minutes old at
**two probes ten minutes apart**; a name is not evidence (the same rule as *a service can carry your
category's name and be a superseded vintage*, §5). Decode a numeric status from the publisher's domain, or
not at all.

**An event log is not a position feed — and a quiet window is not a stalled pipeline.** `[data]`
*(2026-10-22, live-position build)* CAL FIRE's helicopter water-drop layer is live, dense and keyless, and it
holds drop **events**, not aircraft positions: full history since 2024-06, 255 rows with no time, and drops
outside California. A morning probe saw it unchanged for 34 minutes with the newest drop 13 h old and
recorded it as batch-updated; an afternoon probe watched one drop land in the layer **64 s** after it
happened — the quiet had been no flying. **Guard:** window by the event time (`IS NOT NULL` first), label the
lane *"events, not positions"* (an aircraft between events is invisible), show the event time and the
layer's write time separately, and never infer a pipeline cadence from a quiet window — measure it from
consecutive changes (§5 *a cadence "measured" from two reads*).

**A statewide station layer is not every station, and its labels live only in its own domain.** `[data]`
*(2026-10-22, live-position build)* CAL FIRE's facilities layer holds CAL FIRE and contract-county
facilities only, not municipal stations: 1,617 rows, 51 decommissioned, 30 `TYPE` codes, 931 active fire
stations, stored in EPSG:3310. Its `TYPE` labels exist only in the layer's coded-value domain (no other
document lists them), and its `COUNTY` values break their own domain (`'Kern'` beside
`'Los Angeles County'`). A map titled "fire stations" undercounts every city with its own department, and a
county join drops every row spelled the other way. **Guard:** filter `FACILITY_STATUS='Active'` and the
station types; read labels from the domain in the layer document; strip `' County'` and case-fold before a
join (§1 *two feeds of one state spell its counties in different cases*); request `outSR=4326`; and state
the coverage on every figure that counts stations.

**An NWS alert's `areaDesc` is forecast-zone names, not counties — the county is in `geocode.SAME`.** `[data]`
*(2026-10-21, watch wall build)* Counting California warnings by county from `api.weather.gov` alerts, the
readable `areaDesc` ("West Side Mountains South of 198; Buttonwillow - Lost Hills - I5; …") names NWS
**forecast zones**, which do not nest in counties and match no county name. The county is carried in
`properties.geocode.SAME`: six digits, a leading `0` + the two-digit state FIPS + the three-digit county
FIPS (`006051` = Mono), joined exactly to `"006" + FIPS` of the state's county layer. A text match on
`areaDesc` silently finds nothing — or worse, matches a zone that merely shares a county's name.
**Guard:** join alerts to counties on `geocode.SAME`, never on `areaDesc`; assert in the live suite that
every SAME code in the response resolves to a county and that `areaDesc` does not.
*(2026-10-22, watch wall build)* **Not every SAME code in a state's alerts is that state's.** One alert can
cross a state line: an NWS Las Vegas Flood Advisory in `?area=CA` carried `006027` (Inyo, CA) **and**
`032023` (Nye, NV). A suite asserting "every code starts `006`" failed on a correct app. Assert instead
that every `006` code resolves and that another state's code resolves to **no** county, so the alert counts
against its California counties only.

**A "Year-to-Date" incident layer holds this year's fires only, while "Current" still carries last year's.** `[data]`
*(2026-10-22, watch wall build)* WFIGS Year-to-Date held **43,128 of 43,128** incidents numbered `2026-…`
(earliest discovered 1 Jan 2026), while WFIGS Current still listed a California fire numbered
`2025-CACDD-018002`, discovered in December 2025. Looking up why a Current fire left by finding it in
Year-to-Date therefore finds nothing for an earlier year's fire, and a bare *"not found"* reads like a
missing record. A suite that checked "the first five Current fires are found" passed for a day and then
failed, because the unordered query happened to return the 2025 fire first. **Guard:** read the year from
the `UniqueFireIdentifier` prefix; for an earlier-year id that is not found, say that Year-to-Date holds
this year only; and test with this year's ids, plus a separate check on any earlier-year ones.

**NWS `/alerts` (the history) carries Test messages that `/alerts/active` leaves out — a test tsunami
warning escalated the wall.** `[data]`
*(2026-10-21, watch wall build)* At 09:31 PDT NWS sent a **Tsunami Warning, severity Extreme**, for the whole
coast from San Diego to Alaska. It was a test: CAP `status: "Test"`. `/alerts/active?area=CA` does not list
it, but `/alerts?area=CA`, which an app reads for what changed since a point in time (it alone carries
`Cancel`s), does. A wall that took "issued since the handover" from the history put a red coast-wide
tsunami escalation on the glass with every suite green, because each check filtered on `messageType` and
`event` and none read `status`. CAP 1.2 `status` is `Actual` · `Exercise` · `System` · `Test` · `Draft`;
only `Actual` is a warning. **Guard:** keep only `status == "Actual"` where alerts enter the app, from both
endpoints, and count the rest instead of dropping them silently; give every synthetic alert in a test a
`status`, since a strict filter otherwise drops it; and assert in the live suite that the history the app
uses holds only `Actual`.

**A lane-closure feed is mostly planned work, and one district's file is 14 MB.** `[data]`
*(2026-10-21, incident situation map build)* Caltrans' Lane Closure System files
(`cwwp2.dot.ca.gov/…/lcsStatusD{NN}.json`, one per district) list closures **scheduled**, not closures in
place: most rows start in the future. A closure in place **now** is `code1097` true with `code1098` and
`code1022` false; counting rows reports the week's plan as today's disruption. The District 7 file alone
is **~14.2 MB / 4,677 rows**. The host answers `OPTIONS` with **405**, so any request that preflights dies
in the browser — send a plain GET with **no custom headers**. Epochs are **UTC seconds, as strings**, so
`new Date(value)` is wrong twice (string, and seconds not milliseconds). And `end.endLatitude` /
`end.endLongitude` are populated, so a closure is a segment: drawing only the begin point is a choice the
app should state, not a limit of the data. **Guard:** fetch only the districts the area of interest touches;
filter to in-place on the three code flags and show planned work as a separate, labelled count; parse
`Number(s) * 1000`; keep every request CORS-simple (the §5 rule).

**Two shelter registers cannot be summed, and the federal one keys on lower-case `objectid`.** `[data]`
*(2026-10-21, incident situation map build)* FEMA's ESF-6 Open Shelters layer reports
`objectIdField: "objectid"` — lower-case (the §1 *derive the OID by type, never by name* rule); its
Cloudflare edge sends the CORS header as lower-case **`access-control-allow-origin`**, which a
case-sensitive `grep Access-Control-Allow-Origin` in a probe misses and records as "no CORS" (use
`grep -i`, as the §5 probe does); and several text fields hold a single space `" "` meaning blank (the
single-space entry above). California's CHHS Open Shelters layer is **rebuilt daily around 07:00 PT** and
its count means **"open as of the previous day"**. The two overlap without a shared key, so their sum
double-counts and mixes two dates. **Guard:** show the registers side by side, each with its own as-of
line ("FEMA: live · CHHS: open as of yesterday"); never add them; trim and blank-test text fields before
display; bind the OID per layer from its own metadata.

**Building footprints can pre-date the fire that burned them, and a "structures exposed" count then counts a town that is gone.** `[data]`
*(2026-10-21, impact zone build)* In a drawn zone over Paradise, **9,074 of 9,075** FEMA USA Structures footprints were imaged on or before **2018-09-10** and lie inside the CAMP perimeter (alarm **2018-11-08**). Every count reads as current; nothing says the buildings burned two months after the imagery. **Guard:** print the footprints' `IMAGE_DATE` range on every count, and flag any historic perimeter whose **`ALARM_DATE` is later than the newest `IMAGE_DATE`** in the zone — a test on `YEAR_` alone returns 0 for a fire in the imagery's own year (it missed CAMP). The historic-perimeter release is annual, so the current season must come from the live perimeter layers.

**An occupancy class that is not the class its name says.** `[data]`
*(2026-10-21, impact zone build)* USA Structures `OCC_CLS='Residential'` contains `PRIM_OCC` *Temporary Lodging*, *Nursing Home* and *Institutional Dormitory*, and `Residential` × `Unclassified` is **2,241 of 9,075** footprints (25 %) in Paradise and absent from a Monterey zone. Mapping on `OCC_CLS` alone puts a hotel among "single residences". **Guard:** crosswalk on the **(`OCC_CLS`, `PRIM_OCC`) pair**, give the residential-type-unknown rows their own line rather than splitting them, keep `Unclassified` visible, and make the live suite **fail on any pair the table does not map** (a statewide re-run found `'Veterinary/Pet '`, with a trailing space).

**An edit stamp that moves without the data moving.** `[data]`
*(2026-10-21, impact zone build)* The interagency current-perimeters layer advanced `dataLastEditDate` three times in 25 minutes while California's rows and their newest `poly_DateCurrent` did not change — the layer is national, and another state's edit moves the stamp. A freshness dot driven by the stamp reads "updated a minute ago" over a day-old perimeter. **Guard:** time of record from the row's own date field (`poly_DateCurrent`), within your scope; the service stamp is at most a liveness hint. (See also *the feed is up but the number is old*.)

**A stated rebuild schedule is not a stamp — classify each layer's stamp as *refresh* or *on change* by two reads.** `[data]`
*(2026-10-22, data compact build)*
- *Symptom:* Cal OES's evacuation aggregation states *"fully updated every 5 minutes"*, yet its edit stamp sat on
  2026-10-19 14:51Z across reads on 21 and 22 October. A freshness rule built from the statement calls it two days
  late. CHHS's daily open-shelter layer, by contrast, writes its stamp at every 07:00 PT rebuild **even with 0 rows** —
  delivery is provable and empty is a state.
- *Cause:* an aggregator that rewrites only on change cannot be told apart, from outside, from one that ran and
  found nothing new. (A stated cadence can also be missed: NIFC's WFIGS item does state *"refreshed from IRWIN every
  5 minutes"* further down its description than a two-hit regex reads.) The interagency incident-locations stamp (WFIGS) ticked ~10 min by day on the 21st but sat
  still **06:05 → 06:22Z** overnight on the 22nd — a "refresh" stamp is not guaranteed to move either.
- *Guard:* take two reads at least one claimed interval apart (the live suite waits 16 min) and assert movement only
  on feeds measured to refresh (here the Caltrans LCS file and the outage query); show an on-change layer as
  *in force · cadence not verifiable*, never *stale*; report an unreliable ticker as an observation, not a pass.

**A record that never publishes an end — fire-management declarations carry no `incidentEndDate`.** `[data]`
*(2026-10-22, data compact build)*
- *Symptom:* every California FM declaration since 2025 (9 of 9 on 2026-10-21) has `incidentEndDate` null, while the
  EM and DR rows carry one. An app that waits for the end to compute a stand-down never stands down.
- *Guard:* treat "no end" as a designed state — take the date by hand, label it MANUAL, derive every window from it,
  and say how many listed declarations of that type carry an end (*"none of the 9 FM declarations listed carries one"*).
  It is a property of the rows, not of the type: in a 24-month window, **FM-5545-CA and FM-5548-CA (Nov–Dec 2024)
  do carry an end** — so derive the sentence from the list, never write "FM declarations carry no end" as a rule.

**A cumulative layer counts history as current.** `[data]`
*(2026-10-22, data compact build)* CAL FIRE's DINS master holds every structure inspected since 2013, so "inspections in the declared county"
read **1,282** for Calaveras with no inspection this year (newest incident 2025-11-23). **Guard:** filter on the
event's own start date (`INCIDENTSTARTDATE >= DATE '<declaration incidentBeginDate>'`) and print the older count
apart (*"1,282 older ones not counted"*); the live suite asserts the cumulative count exceeds the filtered one.

**A standard's element names, sketched from memory, are not the standard's.** `[app]`
*(2026-10-22, data compact build)* The recipe's EDXL-RM `RequestInformation` sketch used `SenderID` and `DateTimeSent` — EDXL-**DE** envelope
names that do not occur in the EDXL-RM 1.0 (errata) text — and omitted `OriginatingMessageID`, which §3.8.3 says
MUST be present. RM's names are `SentDateTime` and `ContactInformation` (`rm:ContactRole` *Sender*). **Guard:**
keep the emitted element list in code (`EDXL_RM_ELEMENTS`), have the live suite fetch the OASIS text and find
every name in it, and have the offline suite fail on any element not in the list.

**A "publicly owned utilities" layer mixes wires utilities with CCAs and joint powers authorities, and one
row is typed as investor-owned.** `[data]`
*(2026-10-21, lifeline board build)*
- *Symptom:* California's non-investor-owned electric service territory layer (Cal OES, CEC-derived, edited
  2024-08-28) was used to ask which counties are served only by the utilities that report to the outage feed.
  Treating every row as a distribution utility produced the wrong set.
- *Cause:* the layer holds municipal and irrigation-district utilities alongside **community choice
  aggregators** (`Type = 'CCA'`, which buy power but own no wires) and **joint powers authorities**. One row
  inside it is typed `IOU`. Acronym fields are `""`, `" "` or null.
- *Guard:* use an **explicit reporting list** matched on names, not on the `Type` field. Exclude CCAs as not
  distribution. Treat everything else as *outside the feed*. Make the rule **conservative** on purpose: a
  wrong exclusion should only withhold a favourable answer, never create one. Print the layer's edit date
  beside every result that depends on it.

## 4 · Geometry and measurement

**ONE bad coordinate poisons a service's own published extent, and any viewpoint computed from it opens on
the ocean.** `[data]` `[app]`
*(2026-09-07, facilities & space utilisation)* The federal inventory's California building extent is published as `xmin -124.24 … xmax
-3.697` — across the Atlantic — because **one row of 13,001** carries longitude **-3.696511**. `LAX
TERMINAL 4`, reported by Homeland Security with a `County_Name` of `LOS ANGELES`, is plotted in Madrid,
and the error is in the **source rather than in a projection**: the geometry agrees exactly with the row's
own `Latitude`/`Longitude` columns, so every consistency check passes. A viewpoint computed from
`returnExtentOnly` centres the map at longitude -64. **Guard:** never compute an initial viewpoint from a
service extent. Clip to a **stated** envelope, and then — this is the half that is easy to get wrong —
**keep the row in every count and every total**, rendering it as `coordinate out of range` rather than
dropping it. A silently dropped row makes the counts stop reconciling, which is a worse bug than a
building in the wrong country.


**A percentile's COHORT RULE can move the published figure more than the data does.** `[data]`
@@STAMP@@ On the same 20,157 rows carrying three stage dates, requiring only that the certificate follow the
entitlement gave **n = 19,826, p90 = 1,874 days**; requiring the full monotonic order — entitlement ≤ permit
≤ certificate — gave **n = 17,997, p90 = 2,118 days**. A **244-day** difference from a choice, not from a
measurement, and neither rule is wrong: the first keeps projects whose permit is mis-dated but whose
certificate is not, the second discards them. **Guard:** any published percentile must carry its cohort rule
**and the count each rule excludes**, on screen, or the reader cannot check it. Print the alternative rule's
figure beside it, exactly as the already-catalogued *one-table-two-readings* entry requires for weightings.

**A wrong date epoch shifts absolute dates and leaves every INTERVAL untouched — so an epoch test that
expects "every figure to move" hides a real bug.** `[app]`
@@STAMP@@ The stage dates in this return are Strings holding 1900-epoch spreadsheet serials, and the recipe's
own verification step asked the builder to change the epoch to `1900-01-01` and confirm that "every figure
moves by two days". It does not. Every lag in the application is a **subtraction of two serials**, so a
constant offset cancels exactly; only an absolute date on screen could move, and this app prints none. A
build that trusted the stated check would have found it "failing" and gone looking for a defect that was
not there — or worse, "fixed" the arithmetic until the check passed. **Guard:** state what an epoch actually
controls before testing it. Assert the two properties separately: that a shifted epoch moves a rendered
**date** by the offset, and that it leaves a rendered **interval** identical. Also worth recording: the
serial-to-date convention that puts Excel serial 61 at `1900-03-01` (past the phantom 1900-02-29) is
`1899-12-30 + serial`, and two of the recipe's own worked examples were off by one and by twelve days
against it.

**A centroid-in-polygon test and an areal intersection give opposite readings of the same site.** `[app]`
*(2026-09-02, land bank & acquisition screening)* Measured against a real regulatory zone: a **225.46-acre**
footprint straddling a delineated Alquist-Priolo earthquake fault zone has **49.62 acres (22.0 %) inside**
and **175.84 acres outside** — while the centroid test returns `True`, implying the whole site is
constrained.

```
footprint      =   225.46 acres
inside AP zone =    49.62 acres
outside        =   175.84 acres
share inside   =    22.0 %
centroid-in-zone verdict = True
```

The centroid says *call a consultant*; the fraction says *the building goes there*. Every product that
answers hazard questions at an address point produces the first reading.

**Guard: where a decision depends on HOW MUCH of a site is affected, intersect and report the fraction —
and reproject to an equal-area CRS first.** An area taken in degrees is a function of latitude and is not
an area. This build reprojects to EPSG:3310 (California Albers) before any area is taken, and the whole
computation is dependency-free: an ellipsoidal Albers forward transform plus an exact polygon-intersection
area by signed triangle fans, which handles holes and non-convex rings without a general clipping library.
One trap inside it: Sutherland–Hodgman keeps the half-plane to the LEFT of each directed edge, so a
**clockwise** clip triangle keeps the complement and silently returns nothing. Normalise the clip
orientation, or every intersection quietly measures zero.


**`Shape__Length` on a Web-Mercator layer is not ground distance.** `[data]`
It is Mercator metres, inflated by 1/cos(latitude). A network measured 12,042,671 m (7,483 mi) against a
true geodesic 6,093.1 mi — a 21 % "discrepancy" that is pure projection. **Never report mileage from
`Shape__Length` on a 102100 layer.**

**Everything must be EPSG:4326.** Reproject on the way in (`-t_srs EPSG:4326`).

**Generalised geometry is for drawing only.** `[data]`
Drawing tolerance (~0.0005° ≈ 55 m) is correct for paint. Never measure on it.

**The geocoder's default output SR is Web Mercator.** `[data]`
Omit `outSR` and you get `x: -13162802` — metres. Fed to a 4326 map it lands in the Gulf of Guinea. The
response declares its own `spatialReference`, so this is silent only if you don't read it.

**A computed ring does not close itself — floating point will not do it for you.** `[app]`
Sweeping `i = 0 … steps` and taking `sin(2π)` yields `-2.4e-16`, not `0`, so the last vertex misses the
first by an epsilon and the polygon is technically open. Some consumers accept it, some reject it, and the
failure is invisible on screen. **Guard:** generate `steps` vertices and push a copy of the first as the
last. Assert the two are identical, not merely close. *(nearby)*

**For CLASSIFICATION, do not parent holes at all — use even-odd across every ring.** `[app]`
*(2026-08-20, asset-level exposure scoring)* The two entries above fix an Esri→GeoJSON *converter*, and
they are right for drawing. For answering *is this point inside?* there is a simpler and stronger
reading. Measured on California's statutory 200-year floodplain (2 features, **1,247 rings = 183
exterior + 1,064 holes**) against 2,000 sample points, one ring array gives **three** answers:

| Reading | Points inside |
|---|---|
| union every ring as its own polygon | **45** |
| parent each hole to the most recent exterior | **42** |
| **even-odd across all rings, orientation ignored** | **41** — equals the server, exactly |

Even-odd needs no orientation test and no containment test, so neither can be got wrong: a point inside
a hole crosses its exterior once and the hole once, which is even, which is outside. The failure the
middle row hides is precise — hole 821 belongs to exterior 795, but exterior 818 sits between them in
the array, so most-recent parenting hangs it on the wrong polygon and it never subtracts.
**Guard:** classify with even-odd over the whole ring array; parent by containment only for the
GeoJSON you hand to a renderer. And assert **by consequence**: classify the same sample locally *and*
server-side with `esriSpatialRelIntersects`, and fail the build on a one-feature disagreement. That
gate caught exactly one asset in 2,000 — 106 m from the nearest edge, so not even a boundary case.

**A GeoJSON ring repeats its first vertex as its last.** `[app]`
Averaging it twice drags every centroid toward that vertex — on a square, `[4,4]` instead of `[5,5]`.

**Snapping band edges to vertices manufactures states that must never be manufactured.** `[app]`
Two abutting unevaluated polygons each lost their shared edge, drawing a hairline "evaluated, and not
zoned" sliver — painting *an authority looked and found nothing* onto ground nobody has looked at.
**Guard:** refine edges by bisection; reproduce an independent geodesic clip in the suite.

**A bare `except` in a measurement script is data corruption that reports success.** `[app]`
A probe silently swallowed 5 of 13 polygons that failed validity, publishing 53 of 91 miles when the truth
was 91.05 of 91.05 — 100 %. The figure reached the recipe, the design proposal and the catalogue before
the app disagreed with it.

**A multipart feature has no single linear axis.** `[app]`
A third of one network is discontinuous, so any milepost ruler drawn straight across it is fiction.
**Guard:** break the axis at the gap, label the gap in real units, and never interpolate across it.

**Overlay throws "side location conflict" on invalid geometry.** `[data]`
GEOS/Turf refuse self-intersecting rings. `make_valid` before every intersection — and see §4's rule on
bare excepts: swallowing the throw is worse than the crash.

**A long geometry exceeds the shell's `ARG_MAX`.** `[data]`
A 1,352-vertex polyline cannot go in a query string. POST it as a form body.

**Esri ring orientation is the whole of an Esri→GeoJSON converter, and inverting it is silent.** `[app]`
*(2026-08-17, climate-risk regulatory reporting)* In Esri JSON an **outer ring is clockwise** and a hole
is counter-clockwise; with the standard shoelace formula clockwise is **negative**, so `area > 0` is the
hole, not the outer ring. Getting that backwards does not throw and looks perfectly correct on a
single-ring polygon — it turns every subsequent **part** of a multipart feature into a **hole cut out of
the first part**. The features still draw, the feature count still reconciles against `returnCountOnly`,
and only a point-in-polygon measurement against a second source shows it: on CAL FIRE's FHSZ surfaces it
put **1,000+ of 9,129 census-tract points "outside" a hazard surface that covers them**, in the
flattering direction. **Guard:** assert orientation by consequence, not by reading the code — for every
polygon with holes, check the hole's first vertex is **inside** its outer ring, and fail if more than a
handful are not.

**…and a hole belongs to the ring that CONTAINS it, not to the one that came last.** `[app]`
*(2026-08-17, climate-risk regulatory reporting)* Esri emits the rings of a multipart polygon in no
guaranteed order, so "attach each hole to the most recent outer ring" punches a void through a part the
hole has nothing to do with. After the orientation fix above, **175 of 9,658 holes** were still
mis-assigned, one of them into an 814-ring `Very High` polygon. **Guard:** assign each hole to the
**smallest outer ring that contains it**, and keep an orphan as its own part rather than dropping
geometry. The containment check in the previous entry catches both mistakes.

**Generalise to draw, but measure the drawing copy and you have moved the answer.** `[app]`
*(2026-08-17, climate-risk regulatory reporting)* A coverage measurement run against the *display*
copies of two seismic layers instead of the full-resolution ones moved every class boundary by the
generalisation tolerance. Re-run at full resolution the same code reproduced an independently-published
measurement **to the dollar**. **Guard:** name the full-resolution file and the drawing copy differently
(`x.geojson` / `x.display.geojson`), and have the measurement script say in its header which it reads.

**A population-weighted centre is not a centroid, and a BOM is not nothing.** `[app]`
*(2026-08-18, branch & ATM network operations)* Two ways to get a coverage figure that is plausible and
wrong. First: the published distance conventions measure from a tract's **population-weighted** centre,
which the census publishes as its own file; substituting the geometric centroid moves the measuring point
into empty land and silently changes who counts as outside the band, with no error anywhere. Second: that
file is **UTF-8 with a BOM** (`EF BB BF`), so a naive CSV reader names the first column with a leading
U+FEFF — the printed header looks perfect and every join on it returns nothing. **Guard:** read it as
`utf-8-sig`, use the weighted centre, and **assert the published state total before computing anything**
(California 2020: 39,538,223 across 9,129 tracts, and the file reconciles with diff 0). An assertion that
reconciles to a published total is the cheapest proof a pipeline is right.

**A three-way standard with no reproducible three-way classifier moves the answer by 3×.** `[app]`
*(2026-08-18, branch & ATM network operations)* The same arithmetic, the same 5,384 points and the same
9,129 tracts, under two honest readings of one published convention: a tract-level urban/mixed/rural flag
gives **317 tracts / 1,149,470 people** beyond the distance band; a county-level metropolitan/micropolitan
classification gives **926 tracts / 3,568,904**. Neither is a mistake — the convention names *urban /
suburban / rural* and no published classifier produces exactly those three. **Guard:** pick one
classifier, **print it on screen and in every export**, and never put a control in the app that changes
it — an app whose own headline depends on a standard must not let its user move the standard.

**The GeoJSON `crs` member is back, and it lies by omission.** `[data]`
*(2026-08-23, climate scenario explorer)* RFC 7946 **removed** the `crs` member, so most readers ignore
it — and one API returns **EPSG:4326** from `/locagrid/` and **EPSG:3857** from `/states/` and
`/counties/`, declaring each only in that member. A pipeline that loads both and assumes one CRS treats
metres as degrees; the failure is silent, and the symptom is a mask that returns **zero** features, which
looks exactly like a filter bug. **Guard:** when a GeoJSON response carries a `crs` member, read it; when
it does not, assert the first coordinate is plausibly degrees. Then assert the **expected feature count**
after masking — a mask that returns 0 must fail loudly, not render an empty map.

**A published cell layer is not necessarily a faithful footprint of the raster it describes.** `[data]`
*(2026-08-23, climate scenario explorer)* The publisher's own grid layer holds **26,517** polygons
against **26,518** non-nodata raster cells: at one latitude two raster cells have no polygon and one
polygon has no cell, offset by half a cell. The polygons key on a **centre-coordinate string** with no
row/column index, and the numeric ids are sparse. **Guard:** rebuild the cell boxes from the raster's own
**affine** (origin, pixel size, width, height) rather than joining to the published footprint. The
affected row here was outside the study area, which is precisely why looking at it would never have
caught it.

**Stepping single model-years makes a climate signal non-monotonic, and the app then reports a
re-convergence that did not happen.** `[app]` *(2026-08-23, climate scenario explorer)* On single annual
rasters the share of cells differing between two pathways ran 7.00 % (2030) → 6.26 % → 8.96 % → **4.65 %
(2045)** → 6.82 %, because one year carries interannual variability, not a climate. A horizon stepper
built on those years tells a risk officer the pathways converge in the 2040s. On **30-year centred
climatological windows** the same measurement rises monotonically at every step (3.45 % → 30.93 %).
**Guard:** step windows, not years; record `n_years` per window and **print the truncation** where the
series ends short (here 2085 is a 29-year window, because the data stops at 2099).

**Before comparing two model scenarios, count the members on each side.** `[data]`
*(2026-08-23, climate scenario explorer)* One published downscaling carries **33 / 62 / 34
model-members** across three SSPs, with a *different* model missing from each and one model contributing
ten members to one pathway and none to another. An unqualified "SSP2-4.5 vs SSP3-7.0" ensemble mean over
them compares **who is in the ensemble** as much as the forcing. **Guard:** fix a common
model-and-member set across both sides, print it, and treat "the ensembles are not comparable as
published" as a design requirement rather than a caveat.

**A count of features that changed class is a function of the breaks as much as of the data, and it can
FALL while the underlying difference rises.** `[app]` *(2026-08-23, climate scenario explorer)* With a
fixed break set, the moved-cell share ran 30.55 % (2040) → **24.97 %** (2045) → 24.63 % → 31.44 % while
the continuous gap rose monotonically — because both sides crossed a shared break together. **Guard:**
publish the break set beside every change count, render the **continuous difference** next to it, and
never let the count travel into an export alone. A movement count without its breaks is not a
reproducible number.

**A difference that is smaller than the disagreement inside either thing being compared is not a
finding — and reporting it as one is the defect.** `[app]` *(2026-08-23, climate scenario explorer)*
Across 10,667 cells at twelve horizons, the gap between two emissions pathways never exceeded the spread
between the 32 models **inside** a single pathway: 5.4 % of that spread at the near horizon, 48.4 % at
the far one, and **0.00 % of cells** exceeding it anywhere. An app that had shown class-movement counts
without the spread would have published model noise as a scenario result. **Guard:** wherever a
comparison has a measurable internal spread, make the ratio *difference / spread* a first-class figure on
the page and in the export — and let it, not the raw count, carry the verdict.

**`esriSpatialRelContains` and `esriSpatialRelWithin` are expressed from the INPUT geometry's side.** `[data]`
*(2026-08-23, property peril report)*
To ask *"which polygons contain this parcel"* the relation is **`esriSpatialRelWithin`**.
`esriSpatialRelContains` returned an **empty set for every parcel**, on both an ArcGIS Online hosted
layer and an ArcGIS Server MapServer. Nothing errored. In an app that distinguishes *wholly inside a
zone* from *the boundary crosses this parcel*, that silently inverted the more consequential of the two
on every single reading. **Guard:** verify the relation against a feature you already know contains your
geometry, before trusting either name.

**One spatial query can return 46 MB.** `[data]`
*(2026-08-23, property peril report)*
A 5 km envelope over Sacramento against a statewide dam-failure inundation surface returned
**45,973,504 bytes** and timed out at 120 s; `geometryPrecision=6` only brought it to 37 MB. The polygons
are few but enormous, so a feature *count* is no guard at all. **Guard:** put a deadline on the geometry
fetch and have a fallback that never downloads geometry — ask the service for the verdict
(`spatialRel=Intersects`, `returnGeometry=false`) and let it measure distance for you with buffered
`distance` + `units` + `returnCountOnly` probes. Each probe is a few bytes however large the polygons
are, and the distance is computed by the service in its own projection rather than in degree space.

**Bisect a radius in parallel: the predicate is monotone.** `[app]`
*(2026-08-23, property peril report)*
*"Is there a feature within R?"* is monotone in R, so a whole ladder of radii can be fired **together**
and the answer read off the first true — one round trip instead of nine. Two further parallel rounds of
seven evenly spaced probes narrow the bracket 64x. What comes back is a **bracket**, not a point value,
and the reading must say so and print a tolerance. Bound the whole thing with a budget: a fallback that
never returns is worse than one that reports it could not measure.

**A failed measurement must never render as a finding of absence.** `[app]`
*(2026-08-23, property peril report)*
When the fallback measurement failed, the row printed *"no differing boundary within 5 km"* — which reads
as a **result**. An error and an answer must never be indistinguishable on screen. **Guard:** carry the
failure as its own state (`{failed: true}`) all the way to the render, and word it as *"could not be
measured — the service did not answer"*.

**Full-resolution geometry can be two orders of magnitude larger than the same features drawn.** `[data]`
*(2026-08-24, shortage-area explorer)* 215 California HPSA perimeter polygons are **23.35 MB** at native
resolution and **0.19 MB** at `maxAllowableOffset=0.005` (≈550 m) — 120×, with all 215 features intact.
Over a hospital or agency network the raw payload makes first paint unusable, and nothing in the service
metadata warns you: `maxRecordCount` counts *records*, not vertices, so a layer with a small record count
can still be enormous. **Guard:** the house default *full resolution to measure, generalised to draw* is
load-bearing, not advisory. Request a drawing tolerance whenever the app does not measure, assert the
generalised payload's size in the live suite, and **state the tolerance on screen** — a reader who does not
know the boundaries were simplified may take an edge literally.

**A national bounding box that spans the antimeridian fits the WHOLE WORLD.** `[data]`
*(2026-08-24, housing & homelessness services)* The US Continuum of Care footprint includes American Samoa at −170° and the Northern Marianas at
+145°, so its true bounding box is −179.9 → +179.9. `fitBounds` on it gives a view of the entire planet
with no region legible on it — while every non-visual assertion (388 in scope, 387 drawn, the correct
totals, the correct cap message) stays green. **One screenshot made it obvious and nothing else could
have.** **Guard:** for any national footprint with offshore territories, fit the **contiguous** extent and
**say on screen** which in-scope features lie outside the opening view. Applies to the US, France, Spain,
Portugal, the Netherlands, New Zealand, Chile and Ecuador at minimum — never derive an opening viewport
from `min`/`max` longitude without asking whether the set crosses ±180°.

**NAD83 geographic (4269) on an ArcGIS Online feature service.** `[data]`
*(2026-08-24, housing & homelessness services)* `extent.spatialReference.wkid` is **4269** — neither 4326 nor 3857, the two values a reader checks
for. Layers land offset from every sibling, and `Shape__Area` / `Shape__Length` are in the source CRS and
mean nothing measured. **Guard:** read the wkid rather than assuming one of the two usual values, request
`outSR=4326` unconditionally on every query, and never measure a `Shape__*` field.

**`returnCentroid=true` works on layers that do not advertise it — and honours the layer's SR, not
yours.** `[data]` *(2026-08-25, public health preparedness)* A tract layer reported
`supportsReturnGeometryCentroid = None` (and `supportsPagination = None`), yet `returnCentroid=true` was
honoured on every one of 9,109 rows. Two traps, in opposite directions: a build that **trusts the
capability flag** hand-computes centroids it never needed to; and a build that trusts the parameter but
**forgets `outSR`** gets the centroid back in the layer's own **Web Mercator** — roughly
`(-13179351, 4050474)` for every row — which, fed to a nearest-site assignment, puts every tract in the
state at the same distance from the same site and produces a plausible, uniform, entirely wrong answer.
**Guard:** try the parameter regardless of the flag, and **always** set `outSR=4326`; then assert the
returned x lies inside the expected lon range before using a single one of them.

**A ZIP-code cell frame costs four things, and all four are measurable before you draw it.** `[data]`
*(2026-09-03, transaction evidence)* Binding a postal code as an analysis cell, against the Census ZIP Code
Tabulation Areas: **60 situs strings resolved to 55 codes** (five codes carried two place names each, so a
place-keyed cell would have double-counted); **one code had no tabulation area at all**, so a
`GEOID IN (…)` list of 55 returned 54 and the missing cell would have vanished rather than shown; **seven of
the 54 straddled the county line** — `esriSpatialRelIntersects` returned 54 against
`esriSpatialRelContains` 47 — so an unclipped cell colours ground the data never covered; and a postal code
is a **mail-delivery construct**, not an area, which a reader will take for a market boundary unless told.

**Guard:** run the `IN` list against the frame and the frame against the data's own coverage boundary before
committing to the geography. **Clip every cell to the coverage boundary**, render the un-drawable cell as a
labelled state that still counts toward every total, and say on screen what the substitute geography costs.

**A polygon clipper that weaves each intersection into the lists it is still testing against corrupts the
very edges it is walking — and reports success.** `[app]`
*(2026-09-03, transaction evidence)* Seven of 54 ZIP Code Tabulation Areas straddle the county line and must
be clipped to it, because the transfer file stops at the boundary and an unclipped cell colours ground the
data never measured. A textbook Greiner–Hormann implementation found intersections and spliced them into the
subject and clip linked lists **inside the same loop**, so every later edge test read an endpoint that was
now an intersection node rather than the original vertex. The result: one cell returned **100 % unclipped**,
one at **negative area**, three **empty** — and the function returned `ok` for all seven, because the
algorithm's own success condition (an even crossing count, a closed trace) was still satisfied.
**Cause:** phase 1 of the algorithm is defined over the ORIGINAL edges; mutating the lists during it is not
an optimisation, it is a different algorithm.
**Guard, in two parts.** Collect every intersection first as plain data — `{subjectEdge, t, clipEdge, u,
point}` — and build both lists afterwards from that. Then **verify the output geometrically instead of
trusting the return value**: every vertex of a clipped ring must lie inside the clip polygon or within
epsilon of its boundary, the clipped area must be strictly between zero and the original, and a polygon the
clip does not touch must come back byte-identical. Measured here, the worst stray across all seven cells was
**7.1 x 10⁻¹⁵ degrees**. Detect degenerate intersections (a parameter within 1e-9 of a vertex — two layers
built on a shared TIGER edge base produce them) and nudge the subject by a fraction of a millimetre and
retry, rather than emitting a shape whose wrongness nothing downstream can see.

**A drawn ring and its stated radius are two different boundaries, and a feature can sit between
them.** `[app]` *(2026-09-03, tenant mix & catchment)* A "6.0 mi straight-line buffer" was drawn as an
inscribed 64-segment polygon and then used for three jobs at once: painting the ring, selecting the peer
set inside it, and intersecting tracts to apportion households. An inscribed polygon is smaller than its
circle by a sagitta of `r x (1 - cos(pi/n))` — **11.63 m at n = 64 on a 6-mile radius** — and **two of
1,919 derived centres fell in that gap**, 6.4 m and 8.4 m inside the true circle and outside the drawn
one. Selecting by distance gave 64 peers; selecting by the drawn polygon gave 63. The recipe being built
had itself recorded 64 peers (selected by radius) beside an apportionment measured against the drawn
polygon, so its own two numbers disagreed by exactly those two centres and neither figure was wrong on
its own terms.

**Guard:** have **one** catchment object, and draw it finely enough that the drawn edge and the stated
definition are the same boundary. At **n = 256** the sagitta is **0.73 m**, below the coordinate precision
of the register itself; the drawn area moves from 292.45 km2 to 292.89 km2 against a true 292.92 km2.
Then assert the sagitta directly in the suite — not the equal-area radius, which is smaller and
understates the gap. The general rule: **if a polygon is both the picture and the predicate, its
resolution is a correctness parameter, not a drawing one.**

**DBSCAN can return a cluster smaller than `min_samples`, and that is correct behaviour, not a bug.**
`[app]` *(2026-09-03, tenant mix & catchment)* Clustering 47,394 points at eps 150 m with
`min_samples = 5` produced **19 clusters of 3 or 4 members** out of 1,919. The reasoning that says the
minimum must be 5 — a core point plus its four neighbours — omits **border-point stealing**: a core
point's neighbours may already belong to an earlier cluster, and they are not reassigned, so the cluster
that core point seeds can be smaller than the threshold that made it a core point. **Guard:** do not
"correct" small clusters or raise `min_samples` to remove them, and do not assert a floor of
`min_samples` on cluster size. Assert the reproduced distribution instead. Where the clusters are an
analytical unit, this matters twice: those 19 centres fell **below every published size band**, and the
honest handling is a labelled "below the published bands" class that still counts toward the
denominator.

**`Shape.STArea()` is in the storage projection's units, which need not be the units the declared extent
implies.** `[data]`
*(2026-09-07, valuation & taxation base map)* A county parcel layer declares `latestWkid: 3857` in its extent and returns `Shape.STArea()` in
**square feet on a State Plane foot projection**. Read as Web Mercator square metres, every area in the
application would have been wrong by a factor of about ten — and a latitude correction would then have been
applied that does not belong. The test that settles it is **latitude invariance**: the ratio of the
published area to the true ground area held constant to within 0.001 — about **10.737**, near the 10.7639
square feet in a square metre — from latitude **33.83 to 34.63**, where a Web Mercator reading would have
varied by roughly 2 % across the same range. **Guard:** measure two features far apart in latitude and
compare the ratio before trusting any published area column. A constant ratio proves a projected unit; a
ratio that tracks `1/cos²(lat)` proves Web Mercator. Never take the unit from the extent's spatial
reference — it describes how the extent is expressed, not how the geometry is stored.

**A published centroid column can contain Null Island.** `[data]`
*(2026-09-07, valuation & taxation base map)* **26 of 2.37 M** parcels publish `CENTER_LAT` / `CENTER_LON` of exactly `(0, 0)`; every other
row is populated and in range, so nothing about the column's completeness or its type gives it away. An
aggregate that averages those centroids without a bounds gate drags a whole group's position into the Gulf
of Guinea, and the group is then **drawn there** rather than dropped — which is worse, because it looks
like data. **Guard:** gate published coordinates to the layer's **own extent** before aggregating, and
**count what the gate dropped**, because a dropped row is a statement. Here the gate cost exactly one
assessor map page its position out of 87,634 — a number worth printing rather than a number worth hiding.

**A drawing tolerance is not a measurement frame: `maxAllowableOffset` geometry answers a different
question, and the answer looks reasonable.** `[app]`
*(2026-09-07, property hazard exposure)* The app fetched hazard-zone polygons with `maxAllowableOffset` — correct, for painting — and then
ran point-in-polygon against the same features to count buildings inside the zone. It reported **9,425 of
9,429** buildings in the frame against a true statewide population of **710**. A generalised polygon covers
ground the real one does not, so a point outside the zone falls inside its simplified outline. Every suite
was green and every figure was internally consistent, because the arithmetic was right about the wrong
shape. **Guard:** the house rule is *full resolution to measure, generalised to draw* — make it structural.
Have the fetch return a flag saying whether a tolerance was applied, refuse to compute against a
generalised read, and **withhold the count with its reason** at zoom levels where full resolution is too
expensive. "Not counted at this zoom, and here is why" is a correct answer; a plausible number is not.

**A membership test that accepts every class a layer carries will accept the class that means "none".**
`[app]`
*(2026-09-07, property hazard exposure)* A statutory duty attaches in the State Responsibility Area at any hazard class, but in the Local
Responsibility Area **only at Very High**. The in-frame test accepted every polygon the map had drawn — so
Moderate, High and, worst, **`NonWildland`**, which is the layer's *mapped finding of no wildland hazard*.
The result put a statutory obligation on buildings the regulation does not reach, silently, with the count
still smaller than the total in view and therefore not obviously wrong. This is the known "a fourth class
the sibling layer does not have" trap committed in the **arithmetic** rather than in the renderer, where
nobody is looking for it. **Guard:** write the qualifying predicate as its own named function derived from
the *rule*, not from the layer's class list; unit-test it against every distinct value the layer publishes,
including the one that means absence; and never let "what the map drew" stand in for "what the rule
covers".

**A point-in-polygon that tests only the outer ring counts holes as inside.** `[app]`
*(2026-09-07, property hazard exposure)* `inRing(pt, rings[0])` on each polygon put buildings standing in unzoned enclaves inside the
hazard frame. It was caught only because the in-view count reached **726** against a statewide population
of **710** — an impossibility the app could state, and would not otherwise have noticed, since the error is
a few per cent and every figure stays plausible. **Guard:** test the outer ring, then every interior ring,
and reject a point that falls in any of them; handle `Polygon` and `MultiPolygon` nesting explicitly
rather than indexing to a fixed depth. And derive a **population bound** during research so the application
has something it can contradict.
*(2026-10-21, lifeline board build)* `[data]` **The same mistake in an area share, made by the reference
tool.**
- *Symptom:* a research script measured utility-territory shares of each county in EPSG:3310 with shapely. It
  built every territory polygon from its rings as if each ring were an outer ring, then unioned them. The
  Los Angeles Department of Water & Power came out at **11.83 %** of Los Angeles County.
- *Cause:* the territory has hole rings. With the holes kept, shapely gives **11.519 %**, and the app's
  grid-sampled share gives 11.54 %. The filled-ring figure was the one written into the spec, so the app's
  correct answer first looked like the defect.
- *Guard:* build reference polygons with interior rings as holes (parent each hole to its shell, or use
  even-odd, as in §4). When a build check compares against a reference value, say which hole rule the
  reference used, and print both values for any polygon that has holes.

**NWS alerts almost never carry a geometry — ask by point, and remember what disappeared.** `[data]`
*(2026-10-21, incident situation map build)* Of **256** California alerts from `api.weather.gov` over seven
days, **254** had `geometry: null` — and so did all **6** active ones. An app that draws alert polygons
draws a nearly empty map and reads as "no warnings". The zone-based alerts are located through their
zones (see the `geocode.SAME` entry in §3), and for "is this place under an alert?" the API answers
directly: **`/alerts/active?point=lat,lon`**. Separately, a cancelled alert simply **vanishes** from
`/alerts/active`, so a display that only renders the current list cannot say "no longer in effect" — it
just loses a row. Times arrive with mixed local offsets. **Guard:** query by point (or by zone/SAME) rather
than relying on polygons; keep the last-seen set and label a departed alert "no longer in effect" with its
last-seen time; normalise every time to UTC before comparing or sorting, and display in one stated zone.

**Divided highways are drawn once per carriageway, so a summed length doubles.** `[data]`
*(2026-10-21, impact zone build)* Caltrans' State Highway Network carries each direction of a route as its own line (`Direction` NB/SB, `AlignCode` Right/Left): Route 1 through a buffered perimeter read **15.014 km** each way, **30.028 km** summed. The functional-classification layer does the same with `SHS_…._P` / `._S` route ids. **Guard:** report **route-km** — per route, the mean of its per-direction clipped lengths — and drop the `._S` side of state-highway rows from centreline totals; say on screen that the network is undated.

**Buffering and self-intersection checks on a published perimeter cost seconds, and the perimeter is already invalid.** `[app]` `[data]`
*(2026-10-21, impact zone build)* A real fire perimeter (12 parts, ~10,500 vertices) took Turf **~22 s** to buffer by 1 km, and `turf.kinks` took **15 s** to report that the published outline has **6 self-intersections**. **Guard:** simplify the core to ~1 % of the buffer distance before buffering, then union back the exact core (area change < 0.05 %; record the tolerance on the zone); refuse self-intersection only for operator-drawn or imported geometry, and take a published footprint as published.

**"Intersects" a utility territory is not "served by" it: boundary slivers.** `[data]`
*(2026-10-21, lifeline board build)*
- *Symptom:* a server-side `esriSpatialRelIntersects` test of the California electric service territories
  (Cal OES's CEC-derived investor-owned and publicly-owned layers, edited 2024-08-28) against each county
  reported the **Los Angeles Department of Water & Power inside Fresno County**. The overlap is a **0.016 %**
  boundary sliver. Other counties had slivers of the same kind, at 0.002 % and 0.005 %.
- *Cause:* two independently digitised boundary sets never share edges exactly, so *intersects* is true for
  almost every neighbour.
- *Guard:* use an **area share with a stated floor** (equal-area projection or grid sampling; this build used
  0.5 %), computed at build time and printed beside any claim that depends on it. Re-measure any share near
  the floor at a finer resolution. Solano / City of Pittsburg measured **0.498 %**, within 0.002 pt of the
  floor, where grid noise alone flips the answer between runs. A grid-sampled share also needs a **minimum
  sample count**: a small target (a little water system) under a coarse step holds a handful of points, so
  re-sample it to ≥ 2,000 rather than report "no samples". The step must be fine enough to meet the check's
  tolerance (bbox/200 missed a 0.25-pt check by resolution alone; bbox/400 met it).

**Co-location is not dependency: a cascade chained by intersection explodes.** `[data]`
*(2026-10-21, lifeline board build)*
- *Symptom:* a one-customer power outage area intersects the service area of a **545,970-person** water
  system (State Water Board service areas). The overlap is **0.005 %** of the service area. Chained naively
  (outage → water system → hospitals inside its service area), that one customer "reaches" **nine
  hospitals**, and a population sum over the hop says half a million people are affected.
- *Cause:* geographic co-location is one of the CISA dependency kinds, and the weakest. An intersection says
  nothing about which feeder serves which pump.
- *Guard:* compute an **overlap share** (the share of the downstream area inside the upstream one) and tier
  it (e.g. *large* ≥ 25 % · *partial* 5–25 % · *touches* < 5 %). Chain the next hop only under
  *large/partial*; under *touches*, **count** the downstream items without listing them. **Never sum a
  population** across a hop. Label every edge *inferred — validate with the operator*.

**A bounding box is not the county.** `[data]`
*(2026-10-22, data compact build)* Counting "in the declared county" with the county's envelope overstated every layer tried: HCAI facilities
**22 vs 5** (polygon), DINS inspections **1,604 vs 1,282**, WFIGS incidents **2 vs 1**. **Guard:** intersect the
county **polygon** (`esriGeometryPolygon`, `inSR=4326`, by POST — §2 *a GET over ~2,048 characters*) and never a
box; the live suite asserts box > polygon on two layers so the guard's reason stays on record.

## 5 · Services and hosts

**A SERVICE name can be misspelled while the LAYER inside it is not, so the natural URL 400s.** `[data]`
*(2026-09-07, portfolio & asset register)* CAL FIRE serves **`FHSALRA25_v1_All`** (FHS**A**) containing a
layer that reports its own `name` as **`FHSZLRA25_v1_All`** (FHS**Z**). Building the URL from the layer
name — the obvious move, and the one a catalogue entry or a colleague's note invites — returns
`{"error":{"code":400,"message":"Invalid URL"}}`, and so does every plausible correction (`FHSZLRA25`,
`FHSZ_LRA_25`). Nothing in the layer document points back at the service that carries it. **Guard:**
enumerate the server root and read the name it publishes; never infer a service name from a layer name,
and record the service path in the recipe rather than the layer's self-description.

**A service can carry your category's name and be a superseded vintage.** `[data]`
*(2026-09-07, portfolio & asset register)* A CAL FIRE service called **"FHSZ FOR REAL ESTATE INSPECTIONS"**
sits on the same server as the current hazard layers, looks purpose-built for a real-estate recipe, and its
Local Responsibility Area half is a **2007–2011** map superseded across every local jurisdiction by the
2025 adopted maps. **Guard:** a name is not a vintage. Read the vintage, and where a look-alike is
rejected, name it in the recipe so the next reader does not rediscover it as a find.

**A keyless tile host can answer HTTP 403 to a request that carries no `User-Agent`, so a server-side
probe reports a perfectly healthy basemap as dead.** `[data]`
*(2026-09-07, portfolio & asset register)* `tiles.openfreemap.org` served its style, its TileJSON, its
glyphs and its sprite to `curl` and to a browser, and returned **403 Forbidden** to Python's `urllib`,
whose default agent string is `Python-urllib/3.12`. A browser always sends a `User-Agent`; a server-side
fetch does not unless told to, and several federal file hosts behave the same way. The failure is
indistinguishable from a gated host, an outage, or a blocked network — and it arrives at exactly the
moment a §4 probe is deciding whether a basemap is bindable. **Guard:** send an honest `User-Agent` on
every server-side fetch in a bake, a probe and a live suite, and name the tool in it. When a host 403s,
re-probe **with** an agent string before recording it as unreachable. *(OpenFreeMap has since been removed
from the basemap catalog for other reasons; the lesson applies to any host.)*

**Two layers published by one agency, in one server, meant to be read together, can be in DIFFERENT
spatial references.** `[data]`
*(2026-09-07, portfolio & asset register)* CAL FIRE's Fire Hazard Severity Zone layers report
`FHSZSRA_23_3` at **wkid 3857** and `FHSALRA25_v1_All` at **wkid 3310** (California Albers), on the same
host, with identical field lists, and documented as the two halves of one map. A client that asks for one
in `outSR=4326` and takes the other's default gets two layers that do not overlay — and because both draw
*somewhere*, the symptom is a hazard band in the wrong place rather than an error. **Guard:** read
`extent.spatialReference` per layer, never per server, and put `outSR=4326` on every request rather than
on the requests you remembered.

**An ArcGIS rejection arrives as `HTTP 200` carrying an error whose *code* is 400 — so `response.ok` is
`true` for a query that never ran.** `[data]`
*(2026-09-03, parcel record coverage)* Two recipe traps recorded a rejected predicate as *"returns HTTP
400"*. What the wire actually carries is:

```
$ curl -s -o body.json -w "HTTP %{http_code}\n" \
    "$LAYER/query?where=Roll_LandBaseYear%20%3E%202000&returnCountOnly=true&f=json"
HTTP 200
$ cat body.json
{"error":{"code":400,"extendedCode":-2147220985,"message":"Unable to complete operation.","details":[]}}
```

The **error code** is 400; the **status line** is 200. Every `if (!r.ok) throw` wrapper — which is the
idiom this repository's own injectable seam recommends — sails straight past it and hands the caller a
body with no `count` in it, so the failure surfaces later as an `undefined` in arithmetic rather than as a
network error. The `details` array is empty, so there is nothing to print either. This is *sharper* than
the trap as recorded, not softer: a genuine HTTP 400 would at least have been caught.
**Guard:** in any ArcGIS fetch helper, check the **body** as well as the status — throw when
`body.error` is present, naming `body.error.code` and `body.error.message` — and when a recipe records an
HTTP status for a failure, re-observe it with `curl -w "%{http_code}"` rather than inferring it from the
error object inside the body.

**A 4326 `distance` query against a projected layer is rejected as an invalid SRID — unless you send
`outSR`.** `[data]`
*(2026-10-21, incident situation map build)* CAL FIRE's DINS (damage inspection) master FeatureServer is
stored in **wkid 102962** (California Albers). A `query` with a 4326 point `geometry`, `inSR=4326`,
`distance` and `units` returned **HTTP 200** carrying
`{"error":{"code":400,…"24204: The spatial reference identifier (SRID) is not valid…"}}` — the shape of the
entry above, so a status-only client reads it as **zero damaged structures** near the fire. The same query
with **`outSR=4326` added** returned `{"count":133}` and the features. So the rejection is not "this layer
cannot do 4326 buffers"; it is a missing parameter. **Guard:** send `outSR=4326` on every query (the §4
rule), including count-only and distance queries where no geometry is returned; treat any 200 body with
an `error` object as a **failed read**, never as zero rows. A fallback that avoids server-side buffering
also works: an envelope query in 4326, then a haversine distance filter on the client.

**An HTTP 200 is not a success — check the content type, and check for an empty body.** `[data]`
*(2026-09-02, land bank & acquisition screening)* A California state host serves **two ArcGIS roots** and
only one carries the data: `gispublic.waterboards.ca.gov/portalserver/` answers JSON, while
`.../arcgis/` answers **HTTP 200 with an Incapsula bot-wall HTML body**. In a hazard or contamination
screen, a client that treats a parse failure as "no features" converts a transport error into a verdict of
**clear** on ground somebody is about to buy.

Two refinements this build measured, both of which defeat the obvious guard:

- **The wall fires per PATH, not per host.** On re-probe the `/arcgis/rest/services` root answered clean
  JSON five times running — 15 folders, a real ArcGIS root — while `/arcgis/rest/services/USTCUF_2025/MapServer/42`
  on that same root still returned the Incapsula HTML. Probing the root and concluding "this host is fine"
  passes, and then the layer request walks into the wall.
- **The failure mode is not stable.** The same wrong path has also answered HTTP 200 with a JSON
  `{"error":{"code":404,"message":"Service not found"}}`. A guard written against the HTML shape alone
  goes green on the day the host returns the JSON one.

**Guard: assert JSON, assert a non-empty body, AND assert the payload carries what a layer document
carries** (`fields`, or `features`) rather than merely parsing. Surface the failure as its own visible
state — *"the source did not answer"* — which is neither a finding nor an all-clear. A sibling entry
records the same class from the other direction: HTTP 200 with a zero-byte body, one request in seven.

**An unconditional query can answer HTTP 304 with an empty body.** `[data]`
*(2026-10-22, live-position build)* CAL FIRE's water-drop layer answered one query with **`304 Not
Modified` and no body** (11:31Z), although the request carried no `If-None-Match` or `If-Modified-Since`;
three later reads of the same URL were 200. A client that treats "not an error status" as success parses
nothing and shows zero rows, and one that reads 304 as "unchanged" has nothing of its own to reuse.
**Guard:** a 304 to a request that sent no validator, or any empty body, is a **failed read** — keep the last
good set (as for *truncated JSON* below) and retry on the next cycle; never read it as zero rows.

**An ArcGIS JSON response can arrive truncated: HTTP 200, the right content type, and invalid JSON.** `[data]`
*(2026-10-21, lifeline board build)*
- *Symptom:* a geometry query against the State Water Board's drinking-water service-area layer (several MB
  of polygons) returned **HTTP 200, `application/json`, about 9.4 MB, and a body that did not parse**. It
  stopped mid-coordinate. The same request succeeded on retry.
- *Cause:* the transfer was cut short. The status and headers had already been sent, so nothing in them says
  so. It is rare and not reproducible on demand.
- *Guard:* treat a **parse failure as a failed refresh**, exactly like a timeout or a 200 carrying `{error}`.
  Keep the **last good** payload, degrade only the freshness indicator, and retry on the next cycle. Never
  read a parse failure as "no features", and never let it blank a layer that was drawn a minute ago. Test
  it offline by serving a body cut in half through the injected fetch.

**A cadence "measured" from two reads can be a sampling artefact.** `[data]`
*(2026-10-21, lifeline board build)*
- *Symptom:* two reads of Cal OES's statewide power-outage layer, at 11:09 and 11:30, saw `lastEditDate` jump
  10:56 → 11:26, and the feed was recorded as publishing every **30 min**. Reads at 13:04, 13:10, 13:12 and
  13:17 saw 12:56:10 → 13:11:12 → (later) 13:26:12: **every 15 min**. The morning reads could not see the
  11:11 publish between them.
- *Cause:* two reads further apart than the true interval measure an upper bound, not the interval.
- *Guard:* measure cadence from **consecutive changes**, polling at a fraction of the claimed interval (the
  live suite's cadence check waits ≥ 16 min for a 15-min feed). Print the publisher's claim, if any, beside
  the measurement. Derive the stale threshold from the measured cadence plus any CDN cache age; here that is
  2 × 15 min + 5 min cache + slack = 40 min.

**Metadata and rows come from different CDN cache fills, so the layer's edit date can lag the rows.** `[data]`
*(2026-10-21, lifeline board build)*
- *Symptom:* ArcGIS Online answered both `?f=json` and `/query` on Cal OES's outage layers with
  `Cache-Control: public, max-age=300`. At 13:12 a `/query` count had already fallen 30 → 28 while `?f=json`
  still reported the previous edit (12:56:10). An app that took the time of record from the layer document
  labelled the new rows with the old time.
- *Cause:* each URL is cached separately, so the two responses can come from different five-minute fills.
- *Guard:* take the time of record from the **`Last-Modified` header of the response that carried the rows**.
  On this host it equals `editingInfo.lastEditDate` to the second. Never combine the layer document's date
  with a separately fetched row set. State the cache age in the freshness copy (*"served through a 5-min
  cache"*). Related: *the feed is up but the number is old* (§3) and *an edit stamp that moves without the
  data moving* (§3).
*(2026-10-22, data compact build)* A form-encoded **POST** query carries the same `Last-Modified` as the GET (measured on four ArcGIS Online hosts), and the header is CORS-safelisted, so a browser can use it as the delivery stamp of a polygon count. On WFIGS it equalled `editingInfo.lastEditDate` (06:05:38Z), not `dataLastEditDate` (05:26:52Z).

**A folder or service named for a register frequently does not contain it.** `[data]`
*(2026-09-02, land bank & acquisition screening)* A state agency's map server carries a folder literally
named `Geotracker` holding six services — CalEnviroScreen, opportunity zones, disadvantaged communities —
and **not one of them is a GeoTracker site layer**. The register itself is not published as a queryable
service anywhere: the authority's own host 403s under two user agents, and its 47 published feature
services do not include it. What *is* published is a Cleanup Fund claims subset of unknown proportion, on
layer ids 39/40/42, where `/0` returns `Layer not found`.

**Guard: enumerate and read the fields array; never bind by title.** And where the published thing is a
subset of the thing you needed, print the cap beside the finding rather than presenting the subset as the
register.

**Several differently-NAMED sublayers can be one identical dataset, and the name promises a filter the
service does not apply.** `[data]`
*(2026-09-02, land bank & acquisition screening)* CGS `Fault_Lines/MapServer` publishes sublayers `/0`
*Historic Fault*, `/1` *Holocene Fault*, `/2` *Late Quaternary Fault* and `/3` *Quaternary Fault*. All
four return **exactly 10,021 rows** with an identical field list; the age distinction lives in an `AGE`
column the sublayers do not filter on, and the sublayers differ only by renderer. Binding `/1` believing
it holds Holocene traces alone silently widens the finding to every mapped trace of any age. The same
service also carries `/5`, a scale-break group layer whose `/query` 400s, and `/6`, a duplicate of `/4`.

**Guard: count the sublayers against each other before believing a name.** Equal counts across
differently-named siblings means the name is a rendering label, not a filter — carry the discriminating
attribute into the finding instead.


**One publisher can serve several LIVE releases of the same dataset, and the one you bind to by default is
the undated one.** `[data]`
*(2026-08-30, resilience disclosure pack)* FEMA publishes **four** National Risk Index census-tract feature
services from one AGOL account, all owned by `FEMA_NationalRiskIndex`, all modified within two days of each
other (2025-12-16/18), and all answering `STATEABBRV='CA'` today. `SUM(EAL_VALT)` for California:

```
release                       N         EAL_VALT sum        ERQK_EALT sum
current (undated title)    9106       30446966827.95       14853244103.03
March 2023                 9106       16344919094.90       13246704324.34
November 2021              8036        7022567832.48        4570837474.12
October 2020               8036       (count(OBJECTID) fails - the OID is FID)
```

**4.34× apart**, same publisher, same field name, same state — because two things moved at once and neither
is visible in the number: the **model** changed, and the **tract register** changed (the 2010 census-tract
vintage giving way to the 2020 one, 8,036 → 9,106). Every one of the four has an **empty `copyrightText` and
an empty `description`**; the release appears only in the AGOL item *title*, and the service an app reaches
for first — `National_Risk_Index_Census_Tracts` — is the one whose title carries **no date at all**. A figure
of the form *"California expected annual loss is $30.4 bn"* is arithmetically true against the default
binding and arithmetically true at **$7.0 bn** against a release the same publisher serves from the same
account in the same second. **Guard:** bind a **release**, never a dataset — put the release in the layer id,
carry it in whatever descriptor the app saves, and print it on screen and in every export. Treat an undated
service title as a defect rather than a default, and prove the pinning by repointing a second build at a
dated sibling and confirming the two figures differ. **This is the largest measured reproducibility gap in
this file: a vintage choice moving a headline financial figure by 334 %, against the 6.08 % that the CAL FIRE
FHSZ vintage moves a hazard classification.**

**A citation can resolve, return 200, carry the right title — and not contain the sentence it was cited
for.** `[data]` `[app]`
*(2026-08-30, resilience disclosure pack)* An app quoted a requirement from IFRS S2 and cited the standard's
own page. That page returns **HTTP 200, 112,965 bytes**, `<title>IFRS - IFRS S2 Climate-related
Disclosures</title>`, and carries the objective and the effective date — and the words **`resilience` and
`scenario` appear zero times on it** (`"climate-related risks"`=10, `"scenario"`=0, `"resilien"`=0). The
quoted requirement lives on a **supporting-materials** page one level away, where those words appear 11 and
12 times. So the natural build step — *"re-verify the quoted text against the source page on every build"* —
**passes while verifying none of the quoted sentence**, because it checks that the page is reachable rather
than that the string is there. **Guard:** store the **quoted string, the URL that carries it, and the read
date** as one object; assert the string is **present** at that URL; and make the build fail when it is
**absent**, not only when it differs. Falsify the assertion deliberately by pointing it at the parent page
and confirming it fails. **A status code plus the right domain is not a verification** — this is the
document-side twin of the soft-404 entry above, and it is worse, because here the page genuinely is the
right page.

**`Access-Control-Allow-Origin` absent on a host that answers 200 to everything else.** `[data]`
*(2026-08-24, health equity overlay)* `ftp.cdc.gov` serves the authoritative USALEEP tract file at
**HTTP 200, 305,984 bytes**, with a correct `Last-Modified` — and sends **no ACAO header at all**, with
or without an `Origin`. `curl` works; the browser cannot. This joins the file's existing family of
*a status code is not an availability verdict* findings. **Guard:** probe CORS **with an `Origin`
header** on every host a browser will call, and treat an absent ACAO as a **build-time-fetch
requirement** rather than a bug to work around at run time. Every ArcGIS host in that same app answered
`*` on both GET and preflight, so the difference is per-host and must be measured per-host.

**A service enumeration truncated with an ellipsis hides the newest services.** `[data]`
*(2026-08-24, health equity overlay)* A recipe recorded, from a listing abbreviated with `...`, that a
publisher's ArcGIS organisation carried "no service whose name contains a FINAL CalEnviroScreen 5.0 or a
2026 designation". Both existed. On a 100-plus service organisation the newest items sort to the end,
which is exactly where an ellipsis lands. The finding did not change the app — both are on the wrong
tract vintage — but it was recorded as an absence, and an absence is a claim. **Guard:** search the
enumeration programmatically for the thing you are claiming is missing, print the match or the miss, and
never conclude absence from a listing you truncated for readability.

**A soft 404: every unknown path resolves to the 404 page and is served with HTTP 200.** `[data]`
*(2026-08-23, climate scenario explorer)* `/terms-of-use`, `/about`, `/data`, `/guidance` and
`/help/faqs` on one publisher's site each returned **HTTP 200, 16,563 bytes**, final URL `/404.html`,
body *"Sorry, we couldn't find the page you're looking for."* A link checker passes every one. It cost
two things that mattered: **the licence page** (so redistribution rights for the derived data became an
open item to be cleared, not an assumption) and **the definition of a variable** (so that variable ships
as a visibly *withheld* option naming its reason rather than as a number nobody can cite). **Guard:** a
status code is not an availability verdict — check the **final URL** and the **body**. Joins the
403-with-a-244-KB-CAPTCHA-body and the 302-to-a-key-page patterns already recorded here.

**A designated source can have no anonymous machine route at all, and its disqualifying notice can sit
behind a redirect.** `[data]` *(2026-08-23, climate scenario explorer)* The scenario source a solution
was specified on answered **HTTP 200 with the same 1,847-byte single-page-application shell** at every
path, and every API route 404'd — there is nothing a build job or an in-perimeter deployment can fetch.
Separately, the notice retracting the physical-risk basis of the named release was reachable only with
`-L`: without it the probe records **266 bytes at HTTP 301** and never sees the text. A pipeline asking
only "2xx or 3xx, and some bytes?" files both sources as healthy. **Guard:** follow redirects in every
probe and read the body; and treat *"this source cannot be obtained"* as a **finding to render on
screen** — the lane stays empty with its citation, and the app says which family it is actually running
instead of borrowing the unavailable source's label.

**An unsupported query parameter can be silently ignored and the ungrouped total returned at HTTP 200.**
`[data]` *(2026-08-23, climate scenario explorer)* Adding `&variables=loan_to_value_ratio` to a public
aggregations endpoint returned a **byte-identical** response to the request without it, at 200, with
`"servedFrom":"cache"` — there is no such breakdown published behind that endpoint. A silent 200 carrying
the wrong aggregation is exactly how an unanchored number reaches a disclosure looking anchored.
**Guard:** assert that a grouping parameter **changed** the response before believing it grouped
anything; where it did not, carry the absence into the data model (here: a register with no LTV and no
valuation, only the published mean) rather than assuming a distribution.

**A RENAMED ArcGIS Online service answers `499 Token Required`, not `404`.** `[data]`
*(2026-08-24, shortage-area explorer)* A previously-published FeatureServer path began returning
`{"error":{"code":499,"message":"Token Required","messageCode":"GWM_0003"}}` on its **root, its layer
document and its query** alike. It reads exactly like an expired credential or a layer that went private —
and it was neither: the service had been **renamed**, while the *layer* inside it kept its original name.
The host was answering normally throughout, and `…/rest/services?f=json` listed the new service name
immediately. An hour can disappear into an authentication bug that does not exist. **Guard:** on a `499`,
crawl `…/rest/services?f=json` **before** concluding anything about credentials; search the listing for the
old *layer* name, which usually survives the rename.
*(2026-10-22, live-position build)* **A view withdrawn by unsharing answers the same way.** CAL FIRE's public
aircraft-tracking view (three sparse rows in July) now answers HTTP 200 + `{"error":{"code":499}}`, and —
unlike a rename — it is **absent** from the org's anonymous `…/rest/services?f=json` listing. **Guard,
extended:** a 499 plus a vanished directory entry means *withdrawn*, not *renamed* and not *expired
credential*; render the lane gated with its citation (as for *a token-gated layer* below) rather than
substituting a neighbouring feed.

**A token-gated layer shows its `499` only when asked for JSON — without `?f=json` it answers an HTML page.**
`[data]`
*(2026-10-21, watch wall build)* The statewide "current" PSPS layer answers
`{"error":{"code":499,"message":"Token Required"}}` at **HTTP 200** when the request carries `f=json`; the
same URL without it returns the ArcGIS Online HTML sign-in/landing page, also at 200. A liveness probe that
fetches the bare layer URL and checks the status (or "did it return something") reports the gated lane as
up, and a parser that tries the body as JSON first and falls back to text reports "unreadable", not "gated".
**Guard:** always probe ArcGIS layers with `?f=json`, read the body for an `error` object before trusting a
200, and treat any HTML body as a failed read — then render the lane grey with its citation rather than
substituting a neighbouring feed.

**An invalid `outFields` can return an empty feature array with no `error` object at all.** `[data]`
*(2026-08-24, shortage-area explorer)* Paging a federal `MapServer` with two mistyped field names returned
`{"features": [], "exceededTransferLimit": null}` at HTTP 200 — no error, no message, no hint. The same
`where` clause with `returnCountOnly` reported 215 rows. **The failure is indistinguishable from "this
state has no records"**, which is a conclusion a build will happily render as an empty map with a citation.
(An AGOL FeatureServer, by contrast, raises `'Invalid field: X' parameter is invalid` — so the behaviour
is host-dependent and cannot be inherited.) **Guard:** read the field list from one `outFields=*` response
per layer and assert every requested name against it before paging; and treat a zero-row page whose
`returnCountOnly` disagrees as a bug in the request, never as a finding about the data.

**Sub-totals need not reconcile to the published total, and the residual is usually not random.**
`[data]` *(2026-08-23, climate scenario explorer)* Statewide **433,460 / $231.676 bn**; the 58 counties
sum to **431,473 / $228.875 bn**. The 1,987 unmatched records are 0.46 % by count but **1.21 % by
amount** — systematically larger. **Guard:** fetch both levels, compute the residual, and print what
share of the published total the derived figure actually represents (here 99.54 % by count).

**Group layers are not queryable.** `[data]`
`geometryType: null` and `/query` returns HTTP 400. The data lives in the point/line/polygon children.

**An ImageServer's `identify` and `getSamples` do not answer the same question.** `[data]`
*(2026-08-20, asset-level exposure scoring)* On the same raster and the same point, CGS MS48 returns
`identify` → `"0.205429"` (6 significant figures) with a `location` that is the **snapped pixel centre
in the service's own SR** (102100); `getSamples` → `"0.205428749"` (9 figures), echoing **your**
coordinate in the SR you asked in, plus `locationId` and `resolution`. **Guard:** pick one and record
which. If a card prints a location beside a value, use `getSamples` — otherwise it prints a pixel
centre tens of metres from the feature the reader clicked.

**An ImageServer batch limit can be a TIME budget, and it fails as an HTTP error, not an ArcGIS one.** `[data]`
*(2026-08-20, asset-level exposure scoring)* `getSamples` with a multipoint: on 18 Aug **500 points
succeeded in 25.3 s and 600 failed at 30.9 s**; on 20 Aug the wall had moved to **400 OK at 28.5 s, 500
→ HTTP 504 at 31.1 s**. The constant is a **30-second gateway timeout** at whatever throughput the
server has that day — so a batch size tuned once will fail later, on the same service, with no change
to the data. The response is an HTML 504 page, **not** an `{"error":{…}}` object, so an error-shape
check misses it entirely. **Guard:** batch well under the wall (250 here), treat a 504 as *"too many
points"* and retry smaller rather than *"service down"*, and never put an interactive control over a
raster sampler — budget it as a build-time bake.

**A raster layer answers identify, not query.** `[data]`
An image/MapServer raster has no features to select — `/query` is meaningless on it. Bind it as context
with an identify path, and never expect attributes to join.

**Some services publish no coordinates at all.** `[data]`
**Guard:** mark the layer *not mappable* and refuse to toggle it — never a checkbox that ticks and paints
nothing. Only queryable FeatureServers belong in a catalogue drawer.

**A layer can be mappable and still unjoinable.** `[data]`
OpenStreetMap footprints draw fine but carry no building id, so they can never join to an inventory and
must never produce a derived figure. Label such a layer **context only**, and keep it out of every
calculation.

**Free public endpoints fail often enough to need a retry and a plain-English message.** `[data]`
Overpass returns 429/504 routinely — budget two attempts and a human-readable failure, and never wire it
into boot. *(2026-08-12, broadband gap matrix)* **A reliable host needs this too, once a run is long
enough.** A statewide join — ~330 paged requests over ~25 minutes against an Azure-hosted ArcGIS
server — died on page 102 of 132 when one request passed its 90 s deadline, discarding twenty minutes
of completed paging. **Guard:** bounded retry with backoff on the paging helper, retrying only what is
transient (timeout, network, 5xx, 429) and **never** an ArcGIS `{error}` body or a 4xx — those fail
identically forever, so retrying them only turns a clear failure into a slow one. Return the retry
count rather than hiding it, and keep the bound so a genuinely dead endpoint still fails fast.

**Public demo endpoints have limits worth measuring.** `[data]`
Overpass returns **HTTP 406** to an unidentified client (Node's default User-Agent) — fail fast, don't
retry; its mirrors were *worse*, 504 after ~105 s on a query the main endpoint served in 5.4 s. It also
**504s under load** on an ordinary city-sized bbox, repeatedly, so no app may depend on it at boot.
`api.census.gov` now requires a key — a keyless call answers **200** and redirects to an HTML page
titled *"Missing Key"*, so a naive fetch stores markup as JSON. **Guard:** assert each in the suite so
a catalogue correction cannot rot silently, and let a register that fails degrade to a named absence.

**OSRM `/table`'s ceiling is URL LENGTH, not a coordinate count.** `[data]`
*(2026-08-13, catchment & market-share)* This entry previously said "above ~250 coordinates". Measured:
**300 sources × 33 destinations (333 coords) → 200**, **357 × 33 (390 coords) → HTTP 414**, **1 × 399
(400 coords) → 414** — yet **400 coordinates with a bare `sources=0` → 200**. The `sources=0;1;…;356`
index list is most of the URL. A coordinate-count guard therefore passes every probe and fails in
production the moment you ask for a real matrix. **Guard:** build the URL, measure it, and tile against
a character budget (~6,800 worked); assert that the guard refuses an over-long request *and* that the
server really answers 414 for the same URL sent raw.

**Overpass needs OPPOSITE headers in Node and in the browser.** `[data]` `[browser]`
*(2026-08-13, catchment & market-share)* From Node you **must** send a `User-Agent` or the POST is
**406**. From a browser you must send **no** custom header at all: the `OPTIONS` preflight is answered
**406 with no CORS headers**, so any non-safelisted header kills the call — while a CORS-*simple*
form-urlencoded POST returns `Access-Control-Allow-Origin: *` and works. Note also that Overpass emits
that header only when the request actually carries an `Origin`, so a probe without one reads as a
closed host. **Guard:** keep the User-Agent in the injectable network seam and never in the domain
module, so one module can serve a Node suite and a browser; probe CORS **with** an `Origin`.

**MapServer `f=geojson` lower-cases every field name.** `[core: fixed]` `[data]`
FeatureServer preserves case; MapServer does not, so a canonically-cased `popupInfo` yields `undefined`
for every field. Fixed in `engine/popups.ts` (`propValue`) and `engine/styleCompiler.ts` (`getField`
emits a `coalesce` over exact/lower/upper). **Still applies to any lookup you write yourself.**

**A host can answer a simple GET and refuse every preflight — so make CORS-simple a GLOBAL RULE.** `[data]`
*(2026-08-16, collateral & portfolio risk)* One estate, three postures, measured the same minute with a
full preflight (`Origin` + `Access-Control-Request-Method` + `Access-Control-Request-Headers`):
`services.arcgis.com` answers `*` and allows the preflight **200**; `tigerweb.geo.census.gov` answers the
preflight **200 with no `Access-Control-Allow-Origin` at all**; and `services.gis.ca.gov` — which carried
the app's headline layers — answers the preflight **403** with or without the request-headers line, while
answering a simple GET **200 with the Origin echoed**. A recipe had recorded that last host as 200 on
preflight; it is not, and a preflighted request there dies in the browser having passed every
server-side check. **Guard:** do not carry a per-host workaround. Make it one rule the whole app obeys —
**every request is CORS-simple: GET, no custom headers, ever** — and assert *that rule* rather than the
posture of each host, because the postures change and the rule survives all three.

**Probe CORS with an `Origin` header, or you will misread an open host as closed.** `[data]`
Many ArcGIS hosts **reflect** the request's `Origin` instead of sending `Access-Control-Allow-Origin: *`.
A `curl -I` with no `Origin` therefore returns no CORS header at all, which looks exactly like a host that
forbids the browser — and the conclusion is a proxy nobody needed. **Guard:**
`curl -s -D- -o /dev/null -H "Origin: http://localhost:PORT" "<url>?f=json" | grep -i access-control`,
and check the `OPTIONS` preflight separately. *(DC open data, nearby/showcase verification)*

**One server does not mean one spatial reference.** `[data]`
On the same host, one layer published in NAD83 State Plane (wkid 26985) sat beside siblings in 3857.
Read `spatialReference` per layer, never per server. *(DC open data)*

**A WAF's 403 can be client-dependent, so do not record it as the finding.** `[data]`
*(2026-08-12, broadband gap matrix)*
`broadbandmap.fcc.gov/home` answered **403** (Akamai, "Access Denied") to three consecutive `curl`
probes with a browser UA, and **200** with a real app shell to Node's `fetch` — same URL, same
minute. A recipe had recorded "403 to every non-browser client", and a suite asserting that flaps.
**Guard:** assert the fact that actually disqualifies the source and does not depend on the client —
here the download API's **401 to everyone**. An app shell is not data; a 200 is not access.

**A register can be published, mappable, and still too large to draw.** `[data]`
*(2026-08-12, broadband gap matrix)*
A provider service-area layer returns valid geometry, but its features are statewide multipart
polygons: **60 of them, already generalised to 0.005°, weigh 22.8 MB and take 65 s** — so the ~379
intersecting one county would exceed 100 MB in a browser. **Guard:** measure the payload before
binding a polygon register as a map layer, not just its row count. Bind it **attributes-only** where
it is really a list (54 KB, 21 s for the same query), and give the layer panel a *list only* state
with the measurement — a layer that ticks and then hangs the tab is worse than one that says why.

**A host that answers curl may refuse the browser.** `[data]`
200 with no `Access-Control-Allow-Origin`, and 403 to the preflight, is the class of failure that passes
server-side verification and dies in production. See
[`how-to/cors-and-proxy.md`](how-to/cors-and-proxy.md) for the three-layer decision and the SSRF rules
that any proxy must follow.

**A static house server cannot reach a keyless feed that sends no CORS header.** `[core: open]`
*(2026-10-21, incident situation map build)* Two keyless, public, authoritative feeds answer **HTTP 200
with no `Access-Control-Allow-Origin`**: CAL FIRE's incidents `GeoJsonList` and NASA FIRMS' active-fire
CSV. An app served from a static host cannot read either from the browser, and the template offers no
documented, opt-in way to proxy them — so such a feed is either fetched at build time (stale by the time
it is read, for a live layer) or left out. **Current guard:** leave it out and say so on screen, or bake it
at build time with its fetch time printed. **Fix:** a documented opt-in proxy mode for the house server
that forwards **only an allow-listed set of hosts**, GET only, under the SSRF rules in
`how-to/cors-and-proxy.md`.

**Every external call needs a deadline.** `[app]`
A dependency that neither answers nor refuses is worse than one that fails: in a real browser a geocoder
left the app sitting at *"geocoding…"* **indefinitely**, with no error to show and nothing to retry —
while both offline suites were green, because a stub always answers. **Guard:** every outbound call
carries an `AbortSignal.timeout` (or equivalent), and a timeout is surfaced exactly like any other
failure. *(nearby)*

**Browsers forbid setting `User-Agent` on `fetch`.** `[browser]`
A politeness header added to satisfy a provider's usage policy is silently dropped in the browser and
applies only from Node — so a request verified with curl or a test runner is **not** the request the app
sends. Providers that require identification must be called from a context that can supply it, or through
your own allowlisted route. *(nearby)*

**Secured services.** `[app]`
Never send or store the password — mint a short-lived, referer-bound token via `{portal}/generateToken`
and attach only the token.

**`/edit` won't save on a Strata layer.** `[app]`
Editing and attachment *writes* need a **writable, authenticated ESRI backend**; `@strata/auth-arcgis`
`assertEsriBackend` **throws** for a `strata` backend. Strata Serve is read-only (Strata editing is
planned). Reads — query, statistics, related, attachment *viewing* — work on both backends.

**A superseded surface can outrank the current one, and the best-named one is the worst.** `[data]`
Three live public services carried older vintages of the same statutory hazard map; the one titled
**"…FOR REAL ESTATE INSPECTIONS"** — the exact use case — served a half that had been superseded across
every local jurisdiction, and another was marked deprecated *in its item title only*, serving happily and
anonymously under the undecorated URL with nothing in the service response saying so. Measured against the
current surfaces, the choice between vintages moved **$470.7 bn — 6.1 % of a state's building value** across
the hazard line, more than any modelling choice in the app. **Guard:** bind by endpoint, never by title;
read the vintage out of the layer's own `description` and put it on screen; and when two vintages of one
map are both live, name the superseded ones in the recipe so nobody re-finds them.

**A publication date is not where a service says its dates are — and the machine-readable one is wrong.** `[data]`
*(2026-08-17, climate-risk regulatory reporting)* Across seven layers an app needed to date: **three**
print a real vintage in their own `description` ("map dated September 29, 2023"; "Census Tracts; January
1, 2022 vintage"); **one** prints it only two hops away, in prose inside an AGOL **item's HTML
description on a different host**; **three** print none at all, at any level. Worse, the field that
*looks* machine-readable is not the one you want: `editingInfo.lastEditDate` is an **edit** timestamp and
disagrees with the published map date by up to two years — one layer's map is dated **2023-09-29** with a
`lastEditDate` of **2025-06-27**, another's map is dated **2025-03-24** with a `lastEditDate` of
**2026-02-02**. An app that prints `lastEditDate` as a vintage produces a provenance line that is
confidently wrong. **Guard:** read the vintage out of the layer's own `description`; where it lives only
in an item's prose, **pin the string in the app's own source registry with its read date and re-verify it
on every build** rather than scraping it at runtime; and never print `editingInfo` as a publication date.

**A whole peril can be undatable, and that is a finding about the product, not a gap to paper over.** `[data]`
*(2026-08-17, climate-risk regulatory reporting)* No California flood surface reachable from inside a
perimeter publishes an effective date: not the layer (dateless description, empty `copyrightText`), not
the AGOL item (empty description, empty `accessInformation`, `created == modified`), and not the feature
— `VERSION_ID` is a DFIRM database-spec version (19 distinct values across 70,856 polygons) and
`SOURCE_CIT` is a study key (1,214 distinct, 1,119 of them literally `NP`). Neither is a date. The
authority that would settle it is on a host that refuses every path (below). **Guard:** where a figure's
defensibility depends on a date, make "does this source publish a retrievable publication date?" an
explicit probe of its own, run it **before** designing, and let a lane that fails it render empty with
its citation rather than being dated from an item's creation timestamp.

**A host can block every path at once, including the static download.** `[data]`
`hazards.fema.gov` reset the TLS handshake (`curl` exit 35, ~0.3 s, TCP connects then `Recv failure`) on
**8 of 8** attempts across a session and again on re-probe — and the block covered the REST root, the Map
Service Center **and every static `.zip`**, so "just download it instead" was not an escape. Sibling hosts
on the same domain (`www.fema.gov`, `gis.fema.gov`) answered normally. **Guard:** probe the host, not the
endpoint, before concluding a service is dead; and check whether the agency publishes the same layer from
its own account on a host that answers — FEMA's National Risk Index does, with `Extract` enabled, which
made the AGOL replica the only viable bulk path.

**A bot challenge that fails as an *intermittent* HTTP 403 defeats a one-shot smoke test.** `[data]`
*(2026-08-18, branch & ATM network operations)* A public statistical file behind Cloudflare, measured in
one minute: `HEAD` with a browser user-agent → **200 `application/zip`**; `GET` with the *same* user-agent
at 11:45 → **HTTP 403** with a **244,647-byte HTML CAPTCHA page served in place of the ZIP**; the same
`GET` with a `Referer` and the browser `Accept`/`Sec-Fetch` headers → **200, 95,033,841 B**; a *ranged*
`GET` with the user-agent alone at 11:46 → **206**. A browser user-agent is not a fix, it is a coin flip,
and the failure carries a 200-shaped body under a 403 status. **Guard:** never map 403 → *file missing*;
assert the content type **and** the magic bytes, retry, and keep a checksummed copy inside the perimeter.
Pairs with the rule that one probe is not enough to declare an endpoint dead — here one probe is not
enough to declare it **alive** either.

**A recorded WAF verdict that does not reproduce is a re-verification, not a repeal.** `[data]`
*(2026-08-20, branch & ATM network operations)* The FFIEC flat file was recorded as sitting behind an
intermittent Cloudflare challenge that answered **403 at one minute and 206 at the next** for the same
URL and User-Agent. Re-probed on the build date with the full browser header set (UA + `Referer` +
`Accept` + `Sec-Fetch-*`), it returned **200 on the first attempt**, 95,033,841 B with `PK` magic.
**Guard:** keep the workaround and keep the guard — assert the content type and the magic bytes, never
that the status was 200 — but never hard-code the 403 in an *assertion*, or the suite goes red for a
service that got better. Record the re-verification date beside the original finding.

**A documented request cap can be the wrong constraint entirely.** `[data]`
*(2026-08-23, access to care)* OSRM's demo `/table` endpoint is widely documented — and was recorded in
this recipe's own §4 — as capped at **100 coordinates**. Probed: 100, 150, 200, 256 and **400** all
returned `code: "Ok"`; **500 returned HTTP 414 Request-URI Too Large** and 1,000 dropped the
connection. The binding constraint is the **URL length** (~8 KB at the reverse proxy), not a coordinate
count. An app that batches to the documented number issues four times the requests it needs against a
community instance under fair use — the opposite of the courtesy the cap was assumed to encode.
**Guard:** probe the cap by bisection rather than inheriting it, batch by **bytes** with margin, and
assert the failure mode (the 414) so the day the proxy is retuned you find out.

**Sibling layers of one FeatureServer need not share a schema.** `[data]`
*(2026-08-23, access to care)* CDC PLACES layer 0 (`PlacePoints`) names the settlement `PlaceName`;
layer 1 (`PlaceBoundaries`) names it **`NAME`/`NAMELSAD`** and carries no `PlaceName` at all. Binding
layer 0's field name to layer 1 returns `'outFields' parameter is invalid`. The same service's
HPSA siblings differ further: primary care is 43 fields of *designations* filtered on `PriStNM`, while
mental and dental are 65 fields of *components* filtered on `StAbbr`. **Guard:** probe every layer id
you bind, not the service; "it is the same FeatureServer" is not a schema guarantee.

**An enriched layer may key on none of the names you expect.** `[data]`
*(2026-08-23, access to care)* Cal OES's Esri-enriched tract layer carries 164 fields and joins on
**`ID`** — an 11-digit tract GEOID — with no `FIPS`, `GEOID` or `TRACTCE` column anywhere. The obvious
binding joined zero rows, and because the app renders a missing value as "no estimate" the failure
looked like an honest data gap rather than a bug. **Guard:** assert the join *rate*, not just that the
query returned 200 — a join that matches nothing and a source that covers nothing are indistinguishable
downstream.

**A mistyped field and a sick host return the identical error, so a retry cannot tell them apart.** `[data]`
*(2026-08-24, shortage-area explorer)* `gisportal.hrsa.gov` answers
`{"error":{"code":400,"message":"Failed to execute query.","details":[]}}` **both** when `outFields` names
a column that does not exist **and** when the host is transiently unwell. The same query failed on several
consecutive attempts and then succeeded, unchanged, minutes later. The empty `details` array carries
nothing to distinguish the two, so a backoff loop retries a permanent mistake forever and a field-name bug
reads as an outage. This is a sharper form of the neighbouring *invalid `outFields` returns an empty array
with no error* trap — worse, because it looks like a real fault rather than like no data. **Guard:** make
the check **local** — read the field list from one `?f=json` metadata call and assert every requested name
against it *before* paging, then retry only what survives that check. And probe more than once before
calling a host dead (see *Three rules*).

**HTTP 202 with a zero-byte body, as a bot challenge.** `[data]`
*(2026-08-24, housing & homelessness services)* `huduser.gov` answers a default `curl`/`fetch` User-Agent with **`202 Accepted`,
`Content-Length: 0`** and `x-amzn-waf-action: challenge`. The status line reads as success, the download
"succeeds", and the failure surfaces two steps later as a parsing error on an empty file. A sibling
federal host (`hudexchange.info`) refuses with **404 at every path including the site root**. **Guard:**
send a browser User-Agent to federal document hosts, and **assert `Content-Length`, not the status
line** — `> 1_000_000` on a workbook is the check that actually fails when the WAF wins.

**A data file with NO CORS header is not a lane — it is a build input.** `[data]`
*(2026-08-24, housing & homelessness services)* The same host sends **no `Access-Control-Allow-Origin` at all**, on any method. A design that assumed
it could fetch the publisher's spreadsheet in the browser would have been rewritten after the first paint.
**Guard:** probe CORS with an `Origin` header **before** the design depends on the source, and decide
build-time versus runtime **there**. Note the asymmetry that makes this cheap to get wrong: the same
organisation's ArcGIS host answers `Access-Control-Allow-Origin: *` on both `GET` and the `OPTIONS`
preflight, so one lane is browser-direct and the other can never be.

**`returnDistinctValues=true` that returns an empty body — or takes a hundred seconds.** `[data]`
*(2026-08-24, housing & homelessness services)* On one AGOL layer this parameter returned a **zero-byte body** on two of three attempts during
research; on a later run it returned valid JSON after **more than 100 seconds**. `json.load` then raises
at character 0 and the bug is chased in the parser. **Guard:** sniff the first character for `{`/`[`
before parsing, carry a **deadline** as well (a body sniff alone waits for ever on the slow variant),
retry once with backoff, surface `source unavailable — retrying` on screen, and prefer
`groupByFieldsForStatistics` — which returned the same five classes in under a second, every time.

**A plain-text error body under HTTP 200 surfaces as a parser bug in your code.** `[data]`
*(2026-08-25, public health preparedness)* Under load an ArcGIS Online organisation answered
`outStatistics` calls with the bare string **`The service is unavailable.`** — HTTP-level success, no
JSON error envelope. `response.json()` then raises at character 0, so the failure presents as
*"Unexpected token T in JSON at position 0"*: a **parser** fault in the app rather than a **service**
fault upstream. The same request answered `{"count":0}` three seconds later. **Guard:** every fetch
helper sniffs the first non-space character for an opening brace or bracket before parsing, retries with
a widening backoff, and reports *"source unavailable — retrying"* quoting the body it refused. Fail fast
on a 4xx and on an ArcGIS `error` envelope — those are well-formed answers that say no, and retrying
them only repeats the same wrong request.

**One dead CDN node reads as a CORS error, not as an outage.** `[data]` `[browser]`
*(2026-08-25, public health preparedness)* Two of CARTO's three basemap subdomains (`a.` and `c.`)
answered **HTTP 502** for every request across a sustained period while `b.` served normally. Because a
502 **HTML error page carries no `Access-Control-Allow-Origin` header**, Chrome reported it in the
console as *"has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present"* — so
a plain availability fault presents as a configuration or policy bug, and sends you to look at headers,
origins and the server instead of at the status code. It cost a red browser suite and five cascading
assertion failures before the cause was understood. **Guard:** when a CORS error names a host you do not
control, `curl` the exact URL and read the **status code** before believing the diagnosis. And do not pin
one subdomain: tile hosts publishing `a`/`b`/`c` should be handed to MapLibre as a **`tiles` array**, so
one node's outage degrades the backdrop instead of blanking it. Keep the ESRI Web Map JSON `templateUrl`
single-hosted — it is the spec artifact — and fan out on the way to the renderer. Joins the existing
*absent ACAO on a 200* family, from the opposite direction: there the header was missing on a healthy
response, here it is missing because the response is not healthy at all.

**Two vintages of one dataset, and only the stale one is machine-readable.** `[data]`
*(2026-08-25, public health preparedness)* A statutory ratings dataset existed twice: an ArcGIS
republication last edited **2021-12-29**, and the authoritative CSV behind it, **CC-BY**, refreshed
**2026-08-12** — whose host returned **HTTP 403 to page, CKAN `package_show` API and download alike,
from three different user agents**. The gap is four and a half years, and the readable copy is the stale
one. This shape is not specific to one publisher and will recur. **Guard:** bind the readable copy,
**print its vintage on screen**, assert the `lastEditDate` in the suite so the day it moves you find
out, and document the browser-download-behind-the-perimeter path as the customer's refresh step. Assert
**no column name** from the unreadable copy appears anywhere in the build — if no response has shown a
field, it does not exist yet.

**A national feed can be complete for most states and entirely empty for one.** `[data]`
*(2026-08-25, public health preparedness)* A CDC syndromic feed published 648,179 rows nationally. For
California, **11,774 of 11,977 rows read `Data Unavailable`**, and every row carrying a value was the
statewide roll-up — **zero** county-level values. Texas published **49,735** county-level values on the
same feed on the same day, which is what proves this is a **publication posture, not a dataset
limitation**. Rendering the state's 58 empty counties on a map would have produced a blank surface a
reader takes for *no pressure* — a disclosure defect, not a styling one. **Guard:** a coverage check is
**per reporting unit**, never per dataset. Compare the unit you are binding against a peer unit in the
same feed, and prove a blank map is *absence* before drawing it.

**The identifier that gates an API is not a credential - and it is still an outbound call.** `[data]`
*(2026-08-26, humanitarian response map)* An endpoint refuses every request without an `app_identifier`
(`403 {"error":"Invalid app identifier"}`), so it looks authenticated, and a build stores it like a secret.
**Cause:** it is a base64 `application:email` pair used for usage analytics, and the server **does not
validate it** - an address invented for the probe, never registered, returned real data. **Guard:** treat
it as a usage label. Never store it as a credential and never present it to a customer as access control -
and note **separately** that the endpoint is still an outbound call to a third party **carrying the
customer's query**, which is what fails a perimeter review even though nothing is key-gated. That is a
reason to take a dated snapshot at build time, not a reason to hide the identifier better.

**The query-parameter form of an API identifier is CORS-simple; the documented header form preflights into a wall.** `[data]`
*(2026-08-26, humanitarian response map - a second occurrence of the CORS-simple rule in this section)*
`curl` works and the browser gets a 403 on a request that never reached the endpoint. **Cause:** passing the
identifier as the documented `X-HDX-HAPI-APP-IDENTIFIER` header makes the request non-simple, so the browser
preflights - and the preflight carries no identifier and is rejected **403** before CORS is ever
considered. The query-parameter form answers `Access-Control-Allow-Origin: *` with no preflight at all.
**Guard:** the rule already stated here - **every request is CORS-simple: GET, no custom headers, ever** -
and its sharper corollary: **any API whose auth lives in a custom header and whose 403 fires before CORS
will preflight into a wall**, however correct the credential is.

**`Access-Control-Allow-Origin` set to the publisher's own origin, behind a 302.** `[data]`
*(2026-08-26, humanitarian response map)* A download URL works in a terminal and in a browser address bar
and fails from application code. **Cause:** the response 302-redirects and its `ACAO` names only the
publisher's own host, so a cross-origin `fetch` never gets the bytes. **Guard:** **a 200 in `curl` is not
evidence of a browser-reachable source - probe with an `Origin` header** - and treat such a lane as a file
fetched once at build time, which is usually what a perimeter rule wanted anyway.

**A well-known service host that no longer resolves at all.** `[data]`
*(2026-08-26, humanitarian response map)* The ArcGIS host named in most published guidance for a standard
boundary set returns `curl: (6) Could not resolve host`. **Cause:** the distribution moved to files; the
guidance did not. **Guard:** probe the host before designing a live-service delivery route, and **probe more
than once** - the same estate's dataset *web pages* returned 403 to a machine fetch during the study and
200 to its API the next day, which is bot control varying over time and not an endpoint property. A DNS
failure repeated across a session, though, is a dead host and not an intermittent one.

**A blocked host's block can change form between builds while staying a block — record the conclusion, not the body.** `[data]`
*(2026-08-26, facility capacity & catchment)* A recipe recorded three state hosts returning **HTTP 403 with
a 17-byte `error code: 1009` body** — Cloudflare's *access denied by country/region*, which no user agent,
referer or header defeats. Re-probed five weeks later the same hosts return **403 with an 8 KB Cloudflare
challenge page**, and a fourth returns a 179-byte nginx 403. The mechanism changed; the conclusion did
not. **Guard:** a recipe's §4 should record *the host refuses a scripted request* as the finding and pin
the status, not the body — and the suite should assert the refusal, so the day it lifts you find out. The
correct response to any of these is the same: **stop retrying, rebind onto another source, and say so on
screen.** Distinguishing a country block from a bot challenge matters only for deciding whether to try a
user agent once; after that, both are walls.

**A trap goes STALE, and an un-asserted workaround becomes a lie.** `[data]` `[app]`
*(2026-08-26, facility capacity & catchment)* A recipe recorded that `services.gis.ca.gov` "answers the GET
and fails the CORS preflight with 403", so the layer had to be ingested offline. On re-probe the preflight
answers **200**. The workaround was harmless here (the frame is ingested at build time anyway) but the
record was wrong, and a later recipe reading it would have designed around a constraint that no longer
exists. **Guard:** assert every recorded trap **inverted** in the live suite — the day a service fixes
itself the suite goes red, and a red suite is how a workaround gets retired instead of inherited.

**A federal open-data catalogue's API can disappear entirely; the publisher's own `data.json` is the route that survives.** `[data]`
*(2026-08-26, facility capacity & catchment)* `catalog.data.gov/api/3/action/*` returns **HTTP 404** on
every action and `catalog.data.gov/dataset?q=` **301s to the site root**. The route that worked was
`https://data.cms.gov/data.json` — 3 MB, 159 datasets, with each dataset's `distribution` array carrying
the API and CSV URLs and the `modified` / `temporal` / `accrualPeriodicity` fields a recipe needs.
**Guard: prefer the publisher's own `data.json` to any mirror or aggregator**, and treat a catalogue's
availability as a fact to probe rather than assume.

**A load-balanced service can report two different vintages for byte-identical geometry.** `[data]`
*(2026-08-30, ATM cash & service routing)* `tigerweb.geo.census.gov/.../tigerWMS_Current/MapServer/93`
returned *"Metropolitan Statistical Areas; January 1, **2026** vintage"* on one probe and
*"...January 1, **2025** vintage"* on **54 others within the same hour** — while the GEOID 41740 geometry
was **byte-identical across 24 probes** (1,284 vertices, same SHA-256). The description string is served
per node; the data is not. Two costs: a live suite that pins the vintage string goes red intermittently
for no reason, and a caption pinned from a single read is intermittently wrong about the data actually
shipped. **Guard:** record the vintage the download was **actually served** alongside the file it
describes, print *that*, and assert the **shape** of the claim (an MSA delineation with a dated vintage)
plus the **geometry** (vertex count against the frozen copy) rather than the string itself. Generalises:
a metadata field can be a property of the node that answered, not of the dataset.

**Keyless is not the same as licensed — and the basemap gallery now says which is which.** `[data]` `[core: fixed]`
*(2026-10-08, the standard map controls rollout)* Every basemap the house set offered loaded without a
key, and that was taken to mean *free to use*. It does not. **CARTO's basemap terms require an API key
for licensed use** — the GL styles load keyless today, but without a key an app is outside the terms and
can be watermarked at any time, exactly like the raster CDN below. **Esri's public tiled MapServers** are
free only for public, non-commercial apps that credit Esri; a business or government app needs an ArcGIS
subscription. The OpenStreetMap France hosts (HOT, CyclOSM) are community servers. Only OSM, OpenTopoMap,
VersaTiles and USGS are commercial-ok — and the volunteer-run ones still have usage policies.
**OpenFreeMap was removed and is on the deny-list** (rejected by the user; an `ofm-*` / `openfreemap-*` id still renders, as its alias).
**Fix in core:** there is now **one** basemap catalog, `@strata/map-controls/basemaps` — 33 keyless
entries (OpenStreetMap · Esri · USGS · CARTO), each carrying `license` (`commercial-ok` |
`non-commercial`), a plain `licenseNote` and the provider's `licenseUrl`, shown in the gallery. CARTO
stays in *More basemaps*, tagged non-commercial *"requires a CARTO key for licensed use"*; it is not in
the universal Recommended 8 (VersaTiles' `vt-gray` took that slot), and **no legacy alias points at CARTO**
— retired `carto-*-gl` / `openfreemap-*` / `ofm-*` ids land on VersaTiles or OpenStreetMap. The default is
OpenStreetMap (`osm`), the theme pair `osm` / `osm-dark`. `@strata/core-map`'s `OPEN_BASEMAPS` /
`VECTOR_BASEMAPS` / `RASTER_BASEMAPS` are a deprecated shim over the catalog. **Guard:** read the licence
tag before shipping a business app — keyless answers *can it load*, the tag answers *may it ship*. The
behavioural keyless lesson below still stands and is now enforced twice: offline host/deny-list guards in
`pnpm test`, and the live two-tile + style-delegation check (`pnpm --filter @strata/map-controls
verify:basemaps`) that CI runs weekly. User-facing summary: [Map controls](guide/map-controls.md).
*(2026-10-21, lifeline board build)* `[core: open]` **Reopened in part: the gallery does not render the
tag.**
- *Symptom:* in a vanilla app vendoring `@strata/map-controls` **1.0.4**, the basemap gallery cards show a
  thumbnail and a name only. There is no `commercial-ok` / `non-commercial` mark, although the catalog tags
  **21 of its 33 entries `non-commercial`**. An operator can pick an Esri or CARTO basemap with nothing on
  screen saying it may not ship in a business app.
- *Cause:* the catalog carries `license` / `licenseNote` / `licenseUrl`, but the gallery code never reads
  them. The "shown in the gallery" above is true of the data, not the UI. A spec that requires the tag to be
  visible cannot be met by an app that vendors the controls and may not edit them.
- *Current guard:* keep the default and the theme pair `commercial-ok` (`vt-gray` / `vt-gray-dark`, `osm` /
  `osm-dark`). Say in the recipe and the README that the tag is not shown.
- *Fix:* render the licence tag (and `licenseNote` as its tooltip) on each gallery card in
  `@strata/map-controls`, and assert it in the shared conformance suite.
*(2026-10-22, live-position build)* Still absent in the vendored 1.0.4 gallery; a recipe that asks for visible
`non-commercial` tags again had to record it as a library gap.

**A keyless *vector* light/dark pair still exists, and it is the substitute the raster set no longer
has.** `[data]`
*(2026-08-30, ATM cash & service routing)* Re-confirming the CARTO watermark entry below on this date and
hitting it independently, the useful part is the way out. **OpenFreeMap is keyless end to end** — the
style JSON, the vector tiles, the natural-earth raster underlay, the glyphs *and* the sprite are all on
`tiles.openfreemap.org` with no key anywhere — and it publishes both halves of a theme pair:
`.../styles/dark` and `.../styles/positron`, plus `liberty` and `bright`. `tiles.versatiles.org`
(`.../assets/styles/eclipse/style.json`, `colorful`) is the same. This supersedes the earlier note that
*"there is no keyless dark raster basemap left in the set; the honest substitute is the same keyless
tiles dimmed"* — dimming a light basemap is no longer necessary, because a real keyless dark **style**
is available. The cost is that a GL style means `setStyle`, which drops every source and layer (see §7).
Verified on this date: `tiles.openfreemap.org/styles/{dark,positron,liberty,bright}`,
`tiles.versatiles.org/assets/styles/{eclipse,colorful}/style.json`, `tile.openstreetmap.org` and
`tile.opentopomap.org` — three different tiles returning three different hashes at plausible byte
lengths, which is the behavioural check the entry below asks for.

> **SUPERSEDED 2026-10-08.** OpenFreeMap is no longer offered and is on the catalog's deny-list (see the
> licence entry above). The keyless vector pair in the catalog is now VersaTiles (`vt-gray` /
> `vt-gray-dark`, `vt-colorful` / `vt-colorful-dark`, `vt-muted` / `vt-muted-dark`); the default theme
> pair is raster `osm` / `osm-dark` — the same OpenStreetMap tiles, inverted for dark.

**Both "keyless" default basemaps now answer HTTP 200 with a placeholder -- one watermarked, one blocked
-- and a URL-pattern guard cannot see either.** `[data]` `[app]`
*(2026-08-26, hospital network planning)* Two independent regressions in the house basemap set, found only by **looking at a screenshot**:
`basemaps.cartocdn.com/rastertiles/dark_all` and `.../light_all` return **HTTP 200, `image/png`, ~6.4 KB**
-- the real map with **"API KEY REQUIRED . carto.com/basemaps/apikey"** composited diagonally across every
tile; and `tile.openstreetmap.org` returns **HTTP 200, `image/png`** carrying *"418 -- Access blocked. App
is not following the tile usage policy of OpenStreetMap's volunteer-run servers"*. Both pass a
`/(openstreetmap|cartocdn|opentopomap)/` URL check, both pass a `!/[?&]key=/` check, and both pass an
`img.complete && img.naturalWidth > 1` thumbnail check. This reaches past one app: `OPEN_BASEMAPS` /
`defaultBaseMap()` in `@strata/core-map`, the `BasemapPanel` default and the house set named in
`CLAUDE.md` all still name CARTO as keyless. **Verified keyless and clean on this date:**
`maps.wikimedia.org/osm-intl`, `tile.openstreetmap.de`, `tile.opentopomap.org`. **Guard:** assert
**behaviour, not the URL** -- fetch two *different* tiles and require that they differ (a fixed
placeholder is byte-identical for every z/x/y), require a plausible byte length and `image/*`, keep an
explicit deny-list of hosts known to be gated, and **look at one tile with your own eyes** before
shipping, because a watermark composited onto real map data defeats every automated check in that list.
There is no keyless **dark** raster basemap left in the set; the honest substitute is the same keyless
tiles dimmed with MapLibre's own `raster-brightness-max` / `raster-saturation` / `raster-contrast`, and
labelled on screen as dimmed.

> **Re-confirmed 2026-08-30 (resilience disclosure pack), with two changes to the substitute list.**
> CARTO still watermarks: `a.basemaps.cartocdn.com/light_all/6/10/24.png` returns **HTTP 200, 9,827 bytes,
> `image/png`** with the watermark composited over real map data. **`maps.wikimedia.org/osm-intl` has since
> gone to HTTP 403** (2,278 bytes, `text/html`) and is no longer a substitute — a reminder that a
> verified-clean list is itself perishable. Still clean on this date, checked with the two-tile guard below:
> **`tile.openstreetmap.org`**, **`tile.openstreetmap.de`**, **`a.tile.opentopomap.org`**. Note that
> `tile.openstreetmap.org` serves the *418 Access blocked* image to a bare `curl` User-Agent and a real tile
> to a browser UA with a `Referer` — so **probe it the way the app will call it**, or you will disqualify a
> working host. Note also that `tile.openstreetmap.de` renders **German exonyms** ("Kalifornien"), which
> silently breaks an English-only product's language boundary; a basemap is a text surface too.
>
> **The guard, written out, because a URL check cannot express it.** Fetch **two different z/x/y** and
> require the responses to differ — a gated host returns one byte-identical placeholder for every tile:
>
> ```js
> export function tilesLookReal(bytesA, bytesB, contentType) {
>   if (!/^image\//.test(contentType || "")) return false;   // 403 HTML dressed as a tile
>   if (!bytesA || !bytesB) return false;
>   if (bytesA < 500 || bytesB < 500) return false;          // a placeholder is small
>   return bytesA !== bytesB;                                // …and identical for every tile
> }
> ```
>
> Run it in the **live** suite over every basemap the app offers, and keep the visual check as well: this
> guard catches the 418 block and a byte-identical watermark, but a watermark composited over *real* map
> data still differs tile to tile, so **only a human looking at one tile catches that one**. Both defects
> reached a finished build here with every non-visual assertion green; the screenshot is what found them.
>
> **RESOLVED IN THE CORE, 2026-09-01.** `[core: fixed]` The three watermarked CARTO **raster** presets are
> gone from `@strata/core-map`; `OPEN_BASEMAPS` is now `VECTOR_BASEMAPS` then `RASTER_BASEMAPS`, and
> **`defaultBaseMap()` returns OpenFreeMap Positron** — a keyless GL style, keyless end to end (style JSON,
> vector tiles, natural-earth underlay, glyphs and sprite). It used to return raster
> `tile.openstreetmap.org`, so the *other* half of this entry was shipping as the house default too. The
> raster gallery keeps OSM and OpenTopoMap: offered, never defaulted to.
>
> The guard in `tests/basemaps.test.ts` no longer greps for `key=`. It asserts the shape that cannot lie —
> every preset resolves to exactly one keyless https URL and carries exactly one of `style`/`templateUrl`,
> the default is a vector style, and a **deny-list** names every host already caught serving a placeholder
> so a preset can never quietly return. The positive proof stays behavioural and lives in the live suites,
> because a unit test cannot see a watermark: two different tiles must differ in bytes, and a style must
> parse with every host it delegates to keyless too.
>
> Two things the fix surfaced that this entry had not predicted. **A vector row has no tile to preview** —
> `BasemapPanel`/`MapChrome` painted an empty box for every vector option, which is the same wall of grey
> boxes this trap is about, arriving through the new door. Both now read the style's own background, water
> and road colours out of the style document. And **the OpenFreeMap attribution is longer than CARTO's**,
> which at phone width ran under a corner readout in one app: a licence term covered by chrome, the very
> defect logged two entries above. The chrome moved.
>
> **SUPERSEDED 2026-10-08.** `defaultBaseMap()` now returns **OpenStreetMap (`osm`)** from the one catalog
> in `@strata/map-controls`; OpenFreeMap is gone (deny-listed). `tile.openstreetmap.org` is safe as the
> default *from a browser*: it serves real tiles to a browser request carrying a `Referer`, and the 418
> placeholder to clients outside its usage policy (a bare `curl`) — so probe it the way the app calls it.
> Its licence note says a busy or commercial app should use its own tile server; `setUrlRewrite()` is the
> one hook for pointing it at one. The guards moved with the catalog (`packages/map-controls/tests/
> basemaps.test.ts`, `verify:basemaps`).
>
> The eleven docs that named CARTO as the keyless house set — `CLAUDE.md`, `app-design.md`,
> `building-apps.md`, `find-and-verify-data.md`, `map-templates.md`, `human-language.md`,
> `getting-started.md`, `docs/README.md`, `COMPONENT-MANIFEST.md`, `/create-map`, the `strata-map` and
> `strata-symbology` skills — and the `WebMaps/` starters were updated with it.

**A traffic-camera image that loads is not a working camera — and neither its header nor its caption
dates it.** `[data]` `[browser]`
*(2026-10-21, incident situation map build)* Caltrans CCTV stills answer **HTTP 200 `image/jpeg`** with a
fresh `Last-Modified` while the picture is a **"Temporarily Unavailable"** card: in a District 7 sample of
**80** in-service cameras, **45** were cards. Two things make the obvious checks worthless. A card can carry
a **stale burned-in date** in its footer ("Friday, September 04, 2026 09:18:01 PDT", read on 21 Oct), and one
card's `Last-Modified` was **~1,126 h** old while others were minutes old — so neither the header nor the
caption is evidence the image is live. And cameras answering **HTTP 500** send no
`Access-Control-Allow-Origin`, so the browser reports a **CORS error** for what is an outage (the
dead-CDN-node entry above). This is the keyless-placeholder family above, arriving through a data feed:
a 200 image that is not the thing asked for. **Guard:** decide from the **pixels** — the white fraction of
a card is **> 0.6**, against **0.02–0.13** for real road images in the same sample — and count cards,
500s and CORS failures together as "not showing a live picture"; show the reader the camera's own
status, never a card as if it were a view.

**A dataset can be open-licensed, refreshed the same day, and still unfetchable -- and the mirror will not
save you.** `[data]`
*(2026-08-26, hospital network planning)* HCAI's *Seismic Ratings and Collapse Probabilities of California Hospitals* (SPC **and** NPC per
building, plus a HAZUS collapse probability) is **CC-BY** and was refreshed on the morning of the probe.
Every route to it returns **403**: `hcai.ca.gov` answers a plain nginx 403 from its edge, and
`data.chhs.ca.gov` / `data.ca.gov` answer **403 with a 17-byte `error code: 1009` body** -- a
client-geography rule -- on the dataset page, the CKAN `package_show` API, `datastore_search` **and** the
direct resource download, identically to `curl` and to a full desktop Chrome user agent. A state mirror
(`lab.data.ca.gov`) answers 200 with the package metadata and **no column names and no rows**, and has no
CKAN API. Re-probed on this date and still 403. **Guard:** a geography block is not a bot block -- **no
header defeats it**, so do not spend a pass on user agents. Record the block, bind the readable
substitute, state on screen exactly what the substitute *lacks*, assert **no column name** from the
unreachable file, and name it as the customer's own refresh path -- an organisation inside the admitted
geography can download it in a browser. Keep the 403 as a **live assertion**: the day it flips is the day
the lane can be upgraded, and that is news you want.

**Keyless is not unmetered — and the only request shape a browser can make may cost several times
the quota of the shape `curl` uses.** `[data]` *(2026-09-03, tenant mix & catchment)* The BLS Consumer
Expenditure API v2 needs no key, and a probe found it healthy: a batch `POST` of eight series answered
`HTTP 200` with `Access-Control-Allow-Origin: *`. Both halves of that were misleading.

- **A browser cannot make that call at all.** The batch form is a `POST` with
  `Content-Type: application/json`, which is not a CORS *simple request*, so a browser sends an `OPTIONS`
  preflight first — and the preflight answers **`HTTP 405` with no CORS headers of any kind**, while the
  `POST` it is asking about answers `200` with `ACAO: *`. `curl`, which sends no preflight, sees a
  perfectly healthy endpoint. The failure appears only in a real browser, as
  `blocked by CORS policy: Response to preflight request doesn't pass access control check`.
- **The shape that avoids the preflight is metered.** The per-series `GET` is a simple request and works
  from a browser — at **one request per series**. Eight series is eight requests per page load against an
  unregistered daily threshold, and a few page loads of testing exhausted it. Once spent, the API answers
  **`HTTP 200`** with `"status":"REQUEST_NOT_PROCESSED"` and empty results, so `response.ok` is `true`,
  the status code is clean, and every series silently renders empty.

**Guard:** probe the **preflight** (`OPTIONS` with `Access-Control-Request-Method` and
`Access-Control-Request-Headers`), not only the request — a `curl` probe of a `POST` proves nothing about
a browser. Count how many requests a page load costs before choosing a request shape. Read the body's own
status field, never the HTTP status, on any API that reports application errors inside `200`. And prefer
the programme's **flat file** where one exists: `download.bls.gov/pub/time.series/cx/cx.data.1.AllData`
carries the same values with **no key and no quota** (120.8 MB — stream it and keep the rows you need),
which makes the lane a build-time bake and removes both traps at once. A quota is invisible to a probe
that runs once; it is discovered by exhausting it.

**An ArcGIS cached `MapServer` serves its tiles row-before-column, and a layer-level `minScale` means it
will not draw at all above that scale.** `[data]`
*(2026-09-07, valuation & taxation base map)* Two facts about one service, and both change a design. The tile path is
`/tile/{level}/{row}/{col}` — **row before column** — the reverse of the `{z}/{x}/{y}` order a raster
template is rewritten into, so a template built by pattern-matching the URL fetches transposed tiles that
are all healthy 200s carrying real PNG bytes. And `singleFusedMapCache: true` together with a layer-level
`minScale` of **18,057** means the publisher will not draw that layer above roughly 1:18,000 **however you
ask for it** — not a rendering preference to override but a fact to design around, here by carrying a
second, coarser surface above that scale. **Guard:** read `singleFusedMapCache`, `tileInfo` and every
layer's `minScale`/`maxScale` from the `MapServer` document before promising a picture at any zoom; and
when binding a cached endpoint, fetch two tiles that should differ and confirm that they do.

**A recipe's rejected-sources table is a claim with a date on it, and it decays as fast as the bound ones.**
`[data]`
*(2026-09-07, valuation & taxation base map)* Re-probing a verified §4 four days after it was written, **two of the services recorded there as
verified-live had gone**: one county parcel service now answers HTTP 404 *"Service ... not found"*, and
another answers HTTP 499 *"Token Required"* — so it is not merely unavailable, it is **no longer keyless**,
and the sentence explaining why it had been rejected is now the second reason rather than the first.
Neither was bound, so neither cost this build anything, and that is exactly why it is worth recording:
nobody re-probes the sources they did not use, and the rejected table is where the next builder goes to
avoid repeating a search. **Guard:** re-probe the **rejected** sources on every verification pass, not only
the bound ones, and record the date and the response beside each rejection. A *"considered and rejected"*
row without a fresh date is a rumour about a service — and it is the kind of rumour that sends someone to
spend a day on an endpoint that has since been gated.

**An agency's web estate can present three different failure modes in one day, one of which flips between
consecutive reads — so a recorded `403` may be a burst response, not a policy.** `[data]`
*(2026-09-07, property hazard exposure)* A research pass recorded CAL FIRE's and the Board of Forestry's entire web estate returning
`403 Access Denied` to every non-browser client, including with a full desktop User-Agent, while the same
agency's ArcGIS services answered `200`. Re-probed weeks later: `bof.fire.ca.gov` gave two
`UND_ERR_CONNECT_TIMEOUT`s and then **HTTP 200 within the same minute**, on four different paths;
`osfm.fire.ca.gov` did not connect at all under any User-Agent; `readyforwildfire.org` refused a request
with no User-Agent and answered 200 with one. One estate, three mechanisms — a WAF rate limiter, a dead
host, and a User-Agent filter — and only the middle one is stable. **And the cited deep link had become a
soft 404**: `HTTP 200` carrying a "Page not found" page, which no status check sees. **Guard:** retry
before recording any host as blocked, record *which* failure you saw rather than "403", re-probe on every
build, and assert on the **body** of a page you cite, not its status. The design conclusion is usually the
same either way — transcribe the text and link out rather than fetching at run time — but "this host is
unreliable" is a stronger reason to do that than "this host refuses machines", and only one of them is
true.

**A public, keyless, freely downloadable document can still be unlicensed for your product, and no
automated check can see it.** `[data]`
*(2026-09-07, property hazard exposure)* A research report funded by two public agencies, served over plain HTTPS with no key, no paywall and
no robots restriction, carries terms permitting reproduction on three conditions — the third being that
*"the Materials are only for public policy and educational purposes."* Nothing in the HTTP response, the
licence field of any catalogue, or the file itself expresses that. It is invisible to a CORS probe, a
status check and a keyless-behaviour test alike, and it is a live constraint on a commercial deployment.
**Guard:** read the publisher's terms page as a research step, not a formality — and note that the footer
link may be the only correct path to it (`/terms-of-use/` and `/terms/` both 404'd where
`/about/terms/` served). Then design around it rather than arguing with it: ship the **facts** (a unit
price is a fact) and not the document's expression, print the required attribution beside every figure, and
mount the source **swappably** so a deployment can substitute a licensed one — with the degradation path
(source absent ⇒ that column renders empty with its citation) actually tested. Pairs with
*answering an anonymous request is not a licence*, from the opposite direction.

**A regular expression over a PDF table drops whole rows whose optional cell is empty — silent omission,
not just the fragments you were watching for.** `[data]`
*(2026-09-07, property hazard exposure)* A known trap said a report's cost appendix could not be scraped because measure names wrap across
lines, so a regex returns fragments like `included` and `chimney, etc.)` as measure names with real
prices attached. True, and incomplete: the same regex required a unit cell, and **two priced rows whose
unit is blank in the source vanished entirely** — an omission that leaves a plausible, self-consistent
table with no sign anything is missing. The count was reported as 50; it is **53**. **Extract
positionally instead:** keep each drawn string's x/y from the content stream, group by baseline, read the
column anchors out of the header row, and assign every cell — including tick marks in a scenario grid — to
the column it is actually drawn in. That also recovers wrapped names correctly. Two encodings to expect:
subset fonts emit f-ligatures and prime marks as **control bytes** (`0x1a`–`0x1f`, `0x94`), so
`baffle` extracts as `ba<>e` and `soffit` as `so<>t`; and a body font may be **offset from ASCII**
(here by 29, so `The` extracts as `7 K H`). **Guard:** assert the row count, and assert the *shape* of
every name — a minimum length, an upper-case or digit first character, no leading bracket.

**A PDF stream walker that accepts a bare `\r` after `stream` desynchronises the whole file.** `[app]`
*(2026-09-07, property hazard exposure)* `/stream\r?\n/g` found 218 markers and inflated **150** streams. The apparently more permissive
`/stream(\r\n|\r|\n)/g` found 219 — one spurious early match — and because the loop advances
`lastIndex` from each match's `endstream`, every subsequent boundary was wrong: **150 inflatable streams
became 1**, with no error, just an empty extraction. **Guard:** require the newline, and sanity-check the
inflate success rate against the count of `/Filter /FlateDecode` occurrences in the file before trusting
anything you extracted.

**A "CORS error" in the browser that is really a bot challenge — and it comes and goes with how often
you run your own suite.** A county ArcGIS service that had answered all day began failing in headless
Chrome with *"No 'Access-Control-Allow-Origin' header is present"*, and only for the heavier query the
app makes at zoom 13 and above. Two checks said the obvious diagnosis was wrong: the same host **did**
return `Access-Control-Allow-Origin` for a light query, and the exact failing URL fetched from `curl`
returned **HTTP 200** — with an **HTML bot-protection interstitial** in the body, carrying an injected
`<script src="/pull-purger-…">`, and **no CORS headers on that response**. The browser sees a
cross-origin response with no headers and reports the only thing it can, which points at the wrong
cause entirely. It cleared on its own once the request rate dropped, so it was **rate-triggered
protection reacting to a browser suite run eight times in twenty minutes**, not a policy change.

**Three things follow.** *(a)* This is the **HTTP 200 with a placeholder body** family from §5 wearing a
different hat — assert the **shape of the body**, never the status. *(b)* Before believing a CORS
diagnosis, fetch the **exact failing URL** server-side; if it returns 200 with HTML, the CORS message is
a symptom and the cause is upstream. *(c)* **Your own test loop can be the trigger.** A browser suite
that re-runs a live service a dozen times in an afternoon looks like a scraper, and the resulting red is
about your rate, not your code — pause, re-run once, and see whether it clears before you go changing
anything.

**A dataset whose URL changes every school year.** `[data]`
*(2026-10-21, impact zone build)* The California Department of Education publishes its public-school points as **`SchoolSites2526`** — next year's is a new service, and the older candidates still answering (2015, 2018 and 2022 subsets) carry administrator e-mails on every row. On 2026-10-21 the calendar school year was 2026-27 and **`SchoolSites2627` did not exist** (`{"error":{"code":400,"message":"Invalid URL"}}`). **Guard:** assert in the live suite that the bound service's `Year` is the newest the publisher lists and at most one year behind the calendar, so the suite goes red the day next year's service appears; never request the administrator fields.

## 6 · Publishing to Strata Serve

**Points don't render.** The published layer's `objectIdField` must be `OBJECTID`. `object_id_field` only
picks the SOURCE column to cast; a string id (GERS, ministry number) can't be the OID — **omit
`object_id_field`** so it is synthesised. The snapshot query uses `orderByFields=<OID>`; a wrong OID
returns 0 features and points silently don't draw (polygons and lines use the tiled path and are
unaffected). *This is the publishing half of the §1 rule — it does not license assuming `OBJECTID` on a
service you did not publish.*

**Custom markers don't show, and marker *shape* never carries meaning.** Don't use `esriSMSPath`. Use
`esriSMSCircle`, and vary **colour and size** per layer. `Square` / `Diamond` / `Triangle` are *accepted*
and then **rendered as circles** — `styleCompiler.ts` maps every `esriSMS` symbol to a MapLibre `circle`
layer and emits `marker style '…' approximated as circle` as a warning. *(2026-08-18, branch & ATM network
operations)* A `uniqueValue` renderer that distinguished two device classes by square-versus-circle drew
two identical circle sets while the legend implied a difference the map did not show. **Guard:** encode
categorical difference in colour, radius and legend text; treat that compiler warning as an error in any
build whose meaning depends on shape.

**Overlapping polygons hide each other.** Use a low fill alpha (~40/255).

**Changes don't take effect.** The Serve server has **no hot reload** — restart after any config,
datasource or metadata change (`/restart` or `.claude/scripts/restart_server.sh`).

**Vector tiles are huge.** `tile_fields` controls which attributes are baked into vector tiles — keep it
to a handful. It is **not** the popup field list (FeatureServer `/query` always returns all fields).

**A stray field appears.** pandas-written GeoParquet can carry `__index_level_0__` — drop it on convert
(`SELECT * EXCLUDE(__index_level_0__)`).

## 7 · Rendering and the map

**An ungated `styledata` retry loop exhausts itself and reports a failure over a perfectly drawn map.**
`[app]`
*(2026-09-07, facilities & space utilisation)* The retry that correctly fixes the `setStyle` reinstall above was hooked to `styledata`
with no gate. That event **also fires while tiles load**, so the reinstall ran continuously from first
paint, burned through its own 60-attempt ceiling, and wrote *"the basemap changed but the estate could not
be redrawn"* into the status line — over a map carrying 13,001 points. The fix for one defect produced a
second one that was more alarming than the first, because it accused a working app. **Guard:** gate a
restyle recovery on a flag set **only** by the code that calls `setStyle`, clear it on success, refuse to
re-apply a style already in force, and make the give-up branch check whether the sources are actually
missing before it says so. This is the *status-line-that-reports-intention* trap wearing a retry loop:
report a **state**, never an attempt.

**One dropped basemap request put a permanent "the map failed" on an unattended wall.** `[app]`
*(2026-10-22, watch wall build)* The wall routed every MapLibre `error` event to its failure notice. A single
`net::ERR_CONNECTION_RESET` on the keyless basemap host's **sprite** at first load wrote *"the map failed:
Failed to fetch"* onto the notice bar of a display meant to run a whole shift. Nothing cleared it, and the map
under it drew normally (a later fetch of the same sprite returned 200 three times out of three). It surfaced
as two console failures in the browser suite, 30 minutes before the soak it was attached to. **Guard:** split
map errors by source. An error on one of the app's **own** sources is a real failure and stays up. A basemap
tile, sprite or glyph failure is a third-party blip: show a dated note that clears itself, log it as a
warning, and never let it overwrite a real failure. In the browser suite, count connection-level failures
at known basemap hosts separately and print them, but keep any **HTTP status** from those hosts failing,
because a 403 is what a gated basemap looks like (§5). Same family as the *styledata* entry above: report a
state, not an event.

**A MapLibre canvas cannot be pixel-probed from the page, so the five-identical-thumbnails guard has to
capture the composited frame.** `[browser]`
*(2026-09-07, facilities & space utilisation)* This file already records that a failed basemap thumbnail leaves five identical grey boxes
with every non-visual test green, so the obvious guard is to read each preview canvas back with
`drawImage` and compare. **It cannot work.** MapLibre runs without `preserveDrawingBuffer`, so the drawing
buffer is gone by the time any script reads it: `getImageData` over every preview returned **exactly one
colour for all five**, on a screen where three of them were visibly different maps. A guard that reports
the same answer for a working page and a broken one is worse than no guard. **Guard:** capture the
**composited frame** through `Page.captureScreenshot` with a `clip` box per thumbnail and hash the PNGs —
five identical boxes are then five identical hashes, and the check is decisive. The same applies to any
assertion about what a WebGL map actually painted.

**A preview zoomed too far in is as blank as one not zoomed at all.** `[app]`
*(2026-09-07, facilities & space utilisation)* The recorded advice is to zoom a basemap thumbnail **in** past the parent map, because at the
parent's zoom a 46 px box holds nothing but each style's background paint. Overshooting has the same
result for the opposite reason: at the parent centre plus five zoom levels, a statewide California view
lands in the empty Central Valley and every style is a flat rectangle again. **Guard:** `+3` is the useful
band — far enough in that coastline, water and road colour are in frame, which is the thing that actually
differs between two light styles, and not so far that the frame contains no features at all.


**The largest class on the map can be its least visible mark, and the app then contradicts its own
reading.** `[app]`
*(2026-09-07, facilities & space utilisation)* The design's whole argument is that 54 % of the estate publishes no utilisation class, and
the card said so: the grey band was the widest band on the bar. The **map** showed a green state. The
silent class was drawn as a size-6 hollow ring, which at statewide zoom occupies about **three pixels** —
and a thin ring at three pixels antialiases away to nothing, while a filled circle of the *same* size
reads strongly. Every non-visual assertion was green; only a screenshot showed it. **Guard:** a hollow or
outlined mark needs materially more size and stroke than a filled one to carry the same weight, and the
class that is *most numerous* should be sized **at least** as large as the reported ones, not smallest by
default. Assert the claim visually: this app's browser suite now measures the four bands and requires the
grey one to be the widest at first paint — a rendered check for a statement the card makes in words.

**Marks rasterised once, from one palette, disagree with a themed legend.** `[app]`
*(2026-09-07, facilities & space utilisation)* MapLibre's `circle` layer draws only circles, so honouring an ESRI renderer's triangle and
square means an icon per class — and those icons were generated once, at boot, from the light palette. In
dark mode the legend swatches switched to the measured dark hues while the map still carried the light
ones, so the two surfaces disagreed about what a class looked like. **Guard:** resolve a data colour
through **one** function that takes the mode, use it for both the swatch and the raster, and
**re-rasterise on every mode change** — including the case where the reader has pinned a basemap, which
skips the `setStyle` that would otherwise have rebuilt the images as a side effect. Relying on the restyle
to rebuild them is the bug: the restyle is not guaranteed to happen.

**Reinstalling sources from `styledata` runs too early, and `setStyle` then leaves a correctly themed page
over an EMPTY map.** `[app]`
*(2026-09-07, facilities & space utilisation)* A second occurrence of the family already recorded here for `load`/`isStyleLoaded`, in the
one place it is most likely to ship: the theme toggle. `setStyle` drops every source, layer and image; the
app reinstalled them from `styledata`, which fires **while the new style is still loading**, so
`installLayers` returned early on its own `isStyleLoaded()` guard and put nothing back. The canvas was the
right size, the tokens were right, the reading was right, and there was nothing on the map. **Guard:**
never treat `styledata` as "the style is ready". Reinstall through a small retry that re-checks
`isStyleLoaded()` (and listen to `style.load` as well), and — for the harness — wait for a **positive
feature count**, not for "a source exists": immediately after a restyle the old source is briefly still
there, so an existence check returns instantly and asserts against a map that is about to be emptied.

**A capped, scrollable popup paints a white slab below itself.** `[browser]`
*(2026-09-07, facilities & space utilisation)* Giving `.maplibregl-popup-content` a `max-height` with `overflow-y: auto` produced a clipped
scroll container whose backing store painted as a **white rectangle the width of the popup and roughly the
height of its overflow**, below the popup, over the map. The DOM was correct — the content box measured
exactly its `max-height` and nothing was positioned there — so no geometric assertion could see it; only a
screenshot did. **Guard:** do not make a popup a scroll container. MapLibre re-anchors a tall popup to
keep it in view, which is the mechanism that already solves this; a height cap solves a problem the
library has already solved and introduces a paint artefact instead.

**A solid-colour scroller over the map punches a blank box through it under software compositing.** `[browser]` — library surfaces `[core: fixed]` in `@strata/map-controls` 1.0.4
*(2026-10-14, four vendored map-controls apps)* An opaque panel with a **plain colour** fill and
`overflow:auto|scroll` that sits over the MapLibre canvas — the map-controls drawer, a legend, a floating
card, a popup capped with `max-height` — is painted into Chrome's scrolling-contents layer and used as an
**occluder**. Under **software compositing** (GPU off or blocklisted, RDP, many VMs, headless
`--disable-gpu`) Chrome mis-places the occluded rect, typically **150–250 px** from the panel (often
after the page scrolled and came back), so the map is not drawn there and a **blank page-background box**
shows through it — nowhere near the panel that causes it. Real users on those machines see it; it is not
only a harness artefact (the white-slab entry above and the `--disable-gpu` "unpainted rectangle" entries in
§9 are very likely the same mechanism). The DOM is correct and `elementFromPoint` returns the canvas.
**Fix:** give every opaque scroller over the map a **one-colour image fill** —
`background: linear-gradient(C, C)` (e.g. `linear-gradient(var(--panel),var(--panel))`). An image fill
is never an occluder and paints identically. Do **not** also set an opaque `background-color` under it —
an opaque colour can make the box count as opaque again. Since map-controls **1.0.4** the drawer and the themed popup card
(`popupStyles`) ship that fill; the app's own legend, cards and capped popups are the app's job. A
`background-color`-only override of those two now paints under the gradient and does not show — use the
tokens or the `background` shorthand; read the colour from `backgroundImage`, not `backgroundColor`.
**Detect:** compare a **full-page** screenshot against the map's own pixels (`gl.readPixels`, or
`drawImage` into a 2D canvas) at several points across the map — a blank in the screenshot where the GL
buffer is painted is the box. A **1×1 clipped** screenshot at a probe point hides it;
so does SwiftShader in-process (`--use-angle=swiftshader --in-process-gpu`), which may
not reproduce it at all — run the probe with **`--disable-gpu`** on purpose, open the drawer / popup /
legend, scroll the page away and back, and shoot the whole page. Then keep the normal screenshot harness
off `--disable-gpu` as §9 says.


**`map.on("load")` and `isStyleLoaded()` can BOTH stay false forever while the basemap paints
perfectly — and every operational layer is then never installed, under a status line reporting a full
count.** `[app]`
@@STAMP@@ The app installed its GeoJSON sources and layers from `map.on("load")`, with a
`styledata` handler gated on `map.isStyleLoaded()` as the re-install path after a style swap. In headless
Chrome against an OpenFreeMap style — whose shaded-relief raster source keeps requesting tiles — **`load`
never fired and `isStyleLoaded()` never became true**, so `getStyle().layers` held the basemap's 47 layers
and none of ours. The basemap rendered normally. The canvas was the right size. The console was clean. All
**115 browser assertions passed**, because every one of them checked *application state* — `visibleClasses()
.length === 8` is true whether or not a single polygon exists. Only a screenshot showed an empty map.
**Guard, three parts.** Gate hydration on the **style object existing** (`getStyle()?.layers?.length > 0`),
not on a load event that may never arrive, and retry on `load`, `styledata` **and** `idle`. Assert
`queryRenderedFeatures({layers:[...]}).length > 0` in the browser suite, never app state. And make the
offline MapLibre stub report `isStyleLoaded()` **false on purpose**, so the regression cannot come back.

**A `display` rule in your own stylesheet outranks the browser's `[hidden]{display:none}`, so setting
`hidden` does nothing and a modal stays over the whole app.** `[browser]`
@@STAMP@@ `#splash{position:fixed;inset:0;display:grid}` beats the user-agent stylesheet's
`[hidden]{display:none}` on specificity, so `el.hidden = true` left the splash overlay covering the entire
board. Every element underneath was present, measurable, clickable through `.click()` and assertable — the
suite drove the whole signature loop through it and reported green. **Guard:** ship
`[hidden]{{display:none!important}` in the app's own reset, and assert **`getComputedStyle(el).display ===
"none"`** after dismissing anything dismissible, plus `document.elementFromPoint` over a region that matters
to confirm what the reader is actually looking at. `el.hidden` is not a visibility assertion.

**MapLibre sizes its canvas once, at construction, and a flex shell has not settled by then.** `[app]`
@@STAMP@@ The map was constructed while its flex container was still resolving, so the canvas shipped
**630 px tall inside a 495 px box** and stayed that way — MapLibre does not watch its container. The DOM
width was right, the arithmetic was right, and both non-visual suites were green. **Guard:** attach a
`ResizeObserver` to the map's container and call `map.resize()` from it, rather than only after a known
gesture; a `resize` listener on the window is not enough, because a sibling panel changing width never
resizes the window. Assert in the browser suite that the canvas rectangle **matches its container's**, not
merely that it is non-zero.

**A column-flex splitter inside a scrolling body computes to HEIGHT ZERO, and every band that
follows it paints on top of the map.** `[browser]`
*(2026-09-07, portfolio & asset register)* The desktop shell is `body → main → #split(flex) →
[#stage, #rail]`, with the horizon bar, the filter row and the table as siblings of the splitter.
The phone breakpoint did the usual thing — `#split{flex-direction:column}`, `body{overflow:auto}` —
and `#split` then measured **390 x 0** while `#stage` (464 px) and `#rail` (2,593 px) overflowed
it. Because the splitter had no height, the three bands after it all began at **the stage's own
top**, so the table header and the horizon bar rendered over the map. Measured, at 390 x 844:

```
split      top 298  h    0        <- collapsed
stage      top 298  h  464
horizon    top 298  h  182        <- on top of the map
filters    top 298  h  105        <- on top of the map
tablewrap  top 298  h  320        <- on top of the map
```

Every box is individually correct, the CSS greps in the offline suite passed, and the page is
unusable. **Guard:** at the phone breakpoint take the shell **out of flex sizing** — `body{display:
block}`, `main{display:flex; flex:none}` — and give the splitter `display:contents` so its children
become direct flex items that can be **ordered** against the bands outside it. Then assert the
GEOMETRY in the browser suite: no band may start above the map's bottom edge. A CSS grep cannot see
this, and it is the second time in this library that a phone layout has been green in two harnesses
and broken on screen.

**And in the same breakpoint: one `white-space:nowrap` title widened the LAYOUT VIEWPORT past the
device.** `[browser]`
*(2026-09-07, portfolio & asset register)* `#topbar h1{white-space:nowrap}` is right on a laptop and
is a 458 px element on a 390 px phone. Chrome widened the layout viewport to **470 px** to contain
it, so the whole page rendered inside a band with a dead margin beside it — which reads as a
styling accident rather than as overflow, because nothing is clipped and nothing scrolls
horizontally in an obvious way. A rail table with `white-space:nowrap` on its cells did the same
thing at 793 px, and was merely clipped by the rail's `overflow-x:hidden`, so the source and
vintage of every number on the page was unreadable on a phone with no sign that anything was
missing. **Guard:** at the phone breakpoint let the title and any PROSE table wrap
(`white-space:normal; overflow-wrap:anywhere`), keep `nowrap` only for the data table that scrolls
in its own box, and assert **`document.documentElement.scrollWidth <= window.innerWidth`** and
`window.innerWidth === <device width>` on a real emulated viewport.

**A `moveend` handler that refetches context layers closes a loop through MapLibre's OWN
ResizeObserver, and the application renders perfectly while its main thread is never clear.**
`[browser]`
*(2026-09-07, portfolio & asset register)* The cycle: `moveend` → refetch the context layers →
`setData` on five GeoJSON sources → MapLibre recomputes its own chrome, because the attribution
control's width changes with the sources in the style → **MapLibre's internal ResizeObserver on the
map container** fires → `resize()` → `moveend`. Measured on a camera that was not moving at all:
the stage stayed **1020x404** while the refresh counter climbed **3 → 14 → 30 → 46 → 61** in
fifteen seconds, about six full refreshes a second, each one re-fetching a live county service.

**The symptom is the nastiest kind.** Nothing crashes. The map renders, the counts are right, every
screenshot is correct, and both non-visual suites are green. The main thread is simply never clear,
so `isStyleLoaded()` is almost never true and a scripted `Runtime.evaluate` answers only
intermittently — the browser suite reported *"the application boots and settles"* **red for three
consecutive runs** while every assertion after it passed, which reads exactly like a dead
application and is not one. Detaching the app's own ResizeObserver changed nothing, because the
observer in the cycle belongs to MapLibre.

**Chrome does say so** — `ResizeObserver loop completed with undelivered notifications` — and this
suite's clean-console guard was **filtering that line out** as benign boilerplate. It was the only
report of the defect. **A filter that excuses a warning excuses the defect behind it.**

**Guard:** three things, and the first is the one that matters. (1) **Never let a viewport handler
refetch unconditionally** — key the refresh on the rounded bbox, the zoom and the layer set, and
return immediately when the key is unchanged; debounce on top. That breaks the cycle where it is
yours, rather than chasing a library's internals. (2) In your own ResizeObserver, compare the
`contentRect` against the last one and coalesce to a frame before calling `map.resize()`. (3) **Do
not filter `ResizeObserver loop` out of a console assertion.** And when a readiness helper times
out, make it report **which condition it is still waiting on** — a boolean that says only "not
ready" sends the next reader hunting in the wrong place.

**A keyless vector-tile host can answer HTTP 200, with the CORRECT content type, and ZERO BYTES — and the
map renders as blank ground with nothing in the console.** `[data]`
*(2026-09-07, portfolio & asset register)* This extends the existing *"keyless is a behaviour, not a URL"*
rule with a failure mode none of its checks catch. OpenFreeMap's Positron style names its vector source as
a **TileJSON endpoint** (`.../planet`), not as a tile template, and the real template inside carries a
**build stamp**: `.../planet/20260830_080001_pt/{z}/{x}/{y}.pbf`. The obvious guess — take the source URL
and append `{z}/{x}/{y}.pbf` — returns **200 · `application/vnd.mapbox-vector-tile` · 0 B**. A host check
passes. A status check passes. A content-type check passes. A `!key=` check passes. And the two-tile
*differ* test passes as well if it is run against the guessed path, because two zero-byte bodies compare
equal only when something actually compares them. The stamp changes whenever the planet is rebuilt, so a
hard-coded template also rots on a schedule nobody controls. Measured on the resolved path: **188,679 B**
and **235,658 B**, different hashes, real map. **Guard:** resolve the TileJSON at load and read `tiles[0]`
from it; never construct a tile path from a style's source URL; run the two-tile differ test against the
**resolved** path and require both bodies over a size floor; and look at one tile before shipping.

**A basemap preview pointed at an endpoint that does not exist leaves every row an identical box, and
every non-visual assertion passes.** `[app]`
*(2026-09-03, parcel record coverage)* The basemap drawer built a thumbnail URL by pattern —
`https://<style host>/styles/<name>/{z}/{x}/{y}.png` — on the assumption that a vector-style host also
serves matching raster tiles. It does not. Chrome blocked every request (`ERR_BLOCKED_BY_ORB`), all five
rows showed the same empty box, and the offline suite reported the drawer perfect because the markup was
perfect. This is distinct from the lazy-loading entry in this section: there the tiles were merely late,
here the endpoint never existed. The fix was to stop guessing at a picture of a style and **render the
style** — a small `maplibregl.Map` per row, mounted when the drawer opens and destroyed when it closes.
**Guard:** never synthesise a tile URL from a style URL by pattern. And assert the preview from a
**clipped screenshot** rather than from the canvas: a screenshot is what the reader gets, it does not
depend on the page setting `preserveDrawingBuffer`, and a flat box compresses to a few hundred bytes while
a rendered map does not — so *"all five differ and none is tiny"* is a check that actually bites.

> **Second occurrence, 2026-09-07, portfolio & asset register — and with a sharper edge.** The same
> mistake was made in a new shape: rather than guessing a raster path on the *style's own* host, the
> drawer built a `tile.openstreetmap.org` URL for the ground in view and showed it in an `<img>`. That
> host is one the same application **explicitly refuses as a basemap**, in a comment two hundred lines
> above, because it answers HTTP 200 with an *"Access blocked"* image — so the app ruled the host out
> for the map and then leaned on it for the picture of the map. It was also an external call to a host
> outside the three services the app binds, which a deployment behind a customer's perimeter cannot
> make. Headless Chrome returned `naturalWidth: 0` on all six rows: identical grey boxes, with every
> non-visual assertion green. **The rule is not "do not guess a path on the style's host" — it is
> RENDER THE STYLE**, mounted when the drawer opens and destroyed when it closes. And the assertion is
> on pixels: each preview must paint more than a handful of colours, and the set of them must not all
> be identical.

**A preview rendered at the parent map's zoom shows one flat block of background colour, which is exactly
the swatch it was meant to replace.** `[app]`
*(2026-09-03, parcel record coverage)* With the previews rendering correctly, a 76-pixel box at a
state-wide zoom held nothing but each style's background paint. Two light styles were then
indistinguishable, which defeats the whole reason a preview exists rather than a colour chip. **Guard:**
zoom a style preview **in** past the main map, not out. Coastline, water and road colour are what differ
between styles; background alone is not.

**`styledata` fires ONCE after `setStyle`, while `isStyleLoaded()` is still false, and never fires again —
so a handler gated on `isStyleLoaded()` loses every operational layer permanently.** `[browser]`
*(2026-09-02, site selection - the swing slate)* `setStyle` drops every source and layer, so an app must
re-add its own. The documented hook is `styledata`, and the obvious guard is
`if (map.isStyleLoaded()) { hydrate(); }`, because `addSource` throws while a style is loading. Measured in
headless Chrome across a light-dark swap, polled every few hundred ms for nine seconds: `styledata` fired
**exactly once**, at `isStyleLoaded() === false`; the style reported loaded about a second later;
**`styledata` never fired again**. The guard therefore skipped the only event it would ever receive, and the
app's operational layers were gone for the rest of the session. Both non-visual suites reported it green —
the sources were correct in application state and the canvas was the right size. **Guard:** hydrate on
`styledata` **and** on `idle`, which cannot fire before the style is usable, with an idempotent re-add that
returns immediately once the sources are back, so the repeated `idle` costs nothing. Assert the recovery by
**polling for the layers to come back**, never by sleeping a fixed interval — a fixed sleep turns a
permanent loss into a flaky test.

**A symbol layer needs a `text-font` the CURRENT basemap's glyph host serves, and the name differs between
providers.** `[browser]`
*(2026-09-02, site selection - the swing slate)* A `symbol` layer with `text-field` and no `text-font` gets
MapLibre's default `["Open Sans Regular", "Arial Unicode MS Regular"]`. OpenFreeMap's glyph endpoint does
not serve it: the request 404s, the labels silently do not draw, and only a console line says so.
Hard-coding the fix does not work either — OpenFreeMap publishes `Noto Sans Regular` while Versatiles
publishes `noto_sans_regular`, so one stack breaks half a keyless gallery. **Guard:** read the font out of
the loaded style's own layers (the first `layout["text-font"]` it declares is by definition one its glyph
host serves), re-read it after every basemap change, and assert both that the font is one the style
declares **and** that `queryRenderedFeatures` on the symbol layer returns features. This is the label
sibling of the existing `glyphs: undefined` entry: there the whole style is invalidated, here only your own
labels vanish.

**MapLibre's `AttributionControl` renders EXPANDED on load even with `compact: true`, and prints itself
across the map.** `[browser]`
*(2026-09-02, site selection - the swing slate)* Mounted bottom-right with a multi-agency
`customAttribution`, the control's text ran the full width of the map — underneath the bottom-left legend
and over the coordinate readout, clipping both. This is the map-corner collision already in this file,
arriving from a control the app did not lay out. **Guard:** for anything longer than a short credit, do not
mount the control: render your own single line in the corner stack (short credit visible, full source list
and the no-warranty note in its `title`), and keep the full attribution in a provenance surface and in every
export. Assert that the corners do not overlap — legend against readout against attribution — as geometry,
because a collision is invisible to every DOM assertion.
*(2026-10-21, incident situation map build)* The mechanism, and a lighter guard where the control must stay:
the compact control starts with class **`maplibregl-compact-show`** on its container, and only the user's
first drag removes it; with a long multi-agency credit it spread across the whole bottom of the map,
covering the scale bar, legend rows and the readouts. On the map's `load` event, remove
`maplibregl-compact-show` from `.maplibregl-ctrl-attrib` — exactly what a drag does, and MapLibre does not
re-add it — so the control opens collapsed to its ⓘ button; keep the full credit in every export.

**Each page must reframe the map on its own subject, or it inherits the previous page's view.** `[app]`
*(2026-09-02, site selection - the swing slate)* A three-page app moved one map element between per-page
slots and called `resize()`. The dossier — a page about **one** candidate — opened on wherever the previous
page had last flown, a stretch of map holding no candidate, no trade-area band and no competitor, with every
non-visual assertion green. **Guard:** compute the frame **per page** and fit it whenever the page changes,
then assert per page that the page's own subject is inside `getBounds()` and that its own layers return
features from `queryRenderedFeatures`. Note that `queryRenderedFeatures` reports nothing while a camera
animation is still in flight, so wait for `!isMoving() && areTilesLoaded() && loaded()` before judging — the
same assertion is otherwise flaky for a reason that has nothing to do with the defect.
*(2026-10-22, live-position build)* The same is true one call later: `queryRenderedFeatures` immediately
after a `setFilter` reads the **previous** frame — wait for `idle` before counting.

**MapLibre rejects a data-driven `line-dasharray`, and it tells you through the map's own `error` event,
not the console.** `[browser]`
*(2026-09-02, land bank & acquisition screening)* A single outline layer styled with

```js
"line-dasharray": ["case", ["==", ["get", "verdict"], "unknowable"], ["literal", [4,3]], ["literal", [1,0]]]
```

produces `layers.constraints-outline.paint.line-dasharray: data expressions not supported`. MapLibre
discards the **whole paint property** and draws every outline solid. Nothing throws, nothing reaches
`console.error`, and every DOM and arithmetic assertion stays green — while the dashed-versus-solid
distinction, which was the entire signal separating *a statement about data* from *data*, silently never
rendered. It was found by reading the app's own status line in a screenshot.

**Guard: split into two layers with static dasharrays and a feature `filter` on each.** And accumulate
`map.on("error")` into app state so a harness can assert the list is empty — a defect reported only
through a framework's own event channel is invisible to a console check.

**MapLibre's popup is a white bubble regardless of your theme.** `[browser]`
*(2026-09-02, land bank & acquisition screening)* `.maplibregl-popup-content` ships an unconditional white
background. An app whose dark-mode body colour is near-white inherits into it, and the popup renders
near-white on white — completely unreadable, while passing every structural assertion about its content.

**Guard: style `.maplibregl-popup-content`, `.maplibregl-popup-tip` (per anchor direction) and
`.maplibregl-popup-close-button` from the same tokens as the rest of the shell.** Never rely on inherited
colour inside third-party chrome, and look at the popup in both themes.

**A repeating timer that styles a layer outlives the style that contains it.** `[app]`
*(2026-09-02, land bank & acquisition screening)* A "flash the selected feature" interval checked
`getLayer()` once before starting. A theme change mid-flash calls `setStyle`, which drops every layer, and
the next tick styles a layer that no longer exists — `Cannot style non-existing layer "highlight-line"`.
A `try/catch` does not suppress it, because MapLibre reports it on the map's error event rather than by
throwing.

**Guard: re-check the layer on EVERY tick, not once at the start, and clear the interval when it goes
away.** Anything that repeats across a possible `setStyle` has to re-establish its assumptions each time.


**An invalid style key gives you a Map, a canvas, WebGL — and nothing painted, with an empty console.**
`[app]`
*(2026-08-24, health equity overlay)* A style object carried an explicit `glyphs: undefined`. MapLibre
rejects it in validation, and the failure is **silent unless something is listening**: the `Map` object
existed, the canvas was correctly sized, `getContext("webgl2")` returned a working WebGL 2.0 context,
and `isStyleLoaded()` was `false` while `getStyle()` was `undefined`. Both non-visual harnesses were
green — the arithmetic was right, the DOM was right — and the only symptom was a **white rectangle**.
**Guard:** register `map.on("error", …)` in every app and route it to the status line, so a style
rejection reports itself; omit optional style keys entirely rather than setting them `undefined`; and
have the browser suite assert `isStyleLoaded()` and a non-zero rendered-feature count rather than only
that a canvas exists.

**A calm ground colour can be so calm it reads as "no data".** `[app]`
*(2026-08-24, health equity overlay)* In an app whose whole first message is *most of this map cannot be
separated from noise*, the not-a-finding class covering 64 % of the state measured **1.09:1 against the
CARTO Positron basemap** — so most of the region read as basemap, i.e. as absence, i.e. as the opposite
of what it meant. Darkening does not rescue it: at `#C8D0DA` the ground reaches only 1.30:1 while the
diverging ramp's extreme class falls **below 4.5:1 against it**. A fill cannot be both a quiet ground and
a distinguishable one over a near-white basemap. **Guard:** carry "covered" **categorically** rather than
chromatically — draw the polygon mesh as a zoom-scaled hairline so the field reads as covered ground, put
one calm fill under every non-finding class, and overlay textures for the classes that are refusals.
Same logic as carrying significance on an outline instead of a fill: a categorical cue survives where a
1.1:1 fill cannot.

**`fitBounds` pads the viewport, not the app — so a panel can cover the data it explains.** `[app]`
*(2026-08-24, health equity overlay)* An opening `fitBounds(bounds, {padding: 24})` put coastal
California — the Bay Area, the north coast, a third of the tracts the app exists to show — **underneath
the legend**, which occupies the map's left 290 px. The bounds were correct, the extent assertions
passed, and only a screenshot showed it. **Guard:** compute the fit padding from the app's own chrome
(measure the legend, add a margin), fall back to a plain margin when the pane is too narrow to give the
space, and assert it by **projecting a known landmark and comparing it against the panel's rectangle** —
`map.project([-122.4, 37.77]).x > legend.right` is one line and it cannot pass by accident.

**`element.style.background` is the shorthand — it wipes `background-image`.** `[browser]`
Assigning a fill colour silently erased the hatch carrying an app's entire signature accent. The class was
present, the browser driver counted 8 elements, every suite was green, and **nothing rendered**. Caught
only while building a slide deck that reproduced the markup. **Guard:** use `backgroundColor`.

**Hydrating on `styledata` and repainting inside it is an infinite loop that renders NOTHING.** `[app]`
*(2026-08-20, asset-level exposure scoring)* `setStyle` fires `styledata` and *then* drops every source
and layer, so re-adding them on `styledata` is the documented pattern. But `setPaintProperty` and
`setFilter` **also** fire `styledata` — so a hydrate that repaints unconditionally re-enters itself
forever. `isStyleLoaded()` never becomes true, MapLibre never renders a single tile, and the result is
a **blank white rectangle of exactly the right size, with an empty console**. Canvas-size assertions
pass, container-match assertions pass, the sources and layers are all present in `getStyle()`, and the
GeoJSON source holds all 2,000 features. **Guard:** make hydrate a no-op unless a source is actually
missing (`if (!map.getSource(id)) …` as the *entry* condition, not just per-add), and assert what is on
screen — `map.areTilesLoaded()` plus `queryRenderedFeatures({layers:[…]}).length > 0` — never that the
canvas has a size.

**`loading="lazy"` inside an `overflow-y` drawer never loads.** `[browser]`
*(2026-08-20, asset-level exposure scoring)* The basemap drawer is its own scroll container, so lazy
images below *its* fold are never requested — including, in practice, the ones visibly in view when the
drawer opens. The reader gets five identical blank boxes where the live basemap previews should be, and
every non-visual assertion is green. **Guard:** don't lazy-load inside a drawer you only build on open;
the images are already deferred by the drawer itself. And **poll** for the thumbnails in the browser
suite rather than sampling once — a single sample reported 5-of-5 on one run and 0-of-5 on the next.

**A missing doctype puts the page in quirks mode, where a `<table>` does not inherit `color`.** `[browser]`
*(2026-08-16, collateral & portfolio risk)* An `index.html` that opens with `<meta charset>` and no
`<!DOCTYPE html>` renders in quirks mode, and Chrome's UA stylesheet then applies the legacy
table-colour quirk. Every themed surface on the page was correct; inside the table, `--text` still
resolved to the dark token at every ancestor while the computed `color` reset at the `<table>` element
itself — measured `rgb(232,237,242)` on `#tablescroll` and `rgb(17,24,39)` on `TABLE`. Six unclassed
columns rendered at **1.03 : 1** on the dark ground, i.e. invisible, while the classed columns were fine
because they set their own colour. **Both non-visual suites were green** — the DOM text was present and
correct and only its paint was wrong — and the app was fine in light mode, so it survived every check
that was not a dark-mode screenshot. **Guard:** ship the doctype; assert `document.compatMode ===
"CSS1Compat"`, which is the rule rather than the one victim found so far; and in the browser suite
measure every informational surface against the background **actually painted behind it** (walk
ancestors for the first non-transparent background) in *both* themes, rather than against the token the
author believes is in force.

**An author `display` rule beats the UA stylesheet's `[hidden]{display:none}`.** `[browser]`
`.splash-bg{display:grid}` meant `el.hidden = true` did nothing and the intro overlay sat over the app
forever — then the identical bug reappeared on a radius control. **Guard:** one global
`[hidden]{display:none !important}`, and assert *that rule*.

**One `undefined` in a style object blanks the whole map, silently.** `[app]` `[browser]`
*(2026-08-17, concentration & exposure analyzer)*
A style built as `{ version: 8, glyphs: undefined, sources, layers }` — the `glyphs` key present but
unset — fails MapLibre's style validation with *"glyphs: string expected, undefined found"*. The failure
arrives as an **`error` event**, not a thrown exception, so with no `error` listener attached the map
stays blank, **no tile is ever requested**, `isStyleLoaded()` stays `false`, and the console is clean. The
ledger, the KPIs, the legend and the chrome all rendered perfectly; only the map was missing, and **both
non-visual suites reported green**, because the DOM and the arithmetic were right. Only the browser
harness and the screenshot saw it. **Guard:** three, because one is not enough — (1) never emit an
`undefined` value into a style object, and assert in the suite that the style carries no undefined value
at any depth; (2) always attach `map.on("error", …)`, surface the message and keep it in state so a suite
can assert it is empty; (3) in the browser suite assert a **non-zero `queryRenderedFeatures`** count on
the operational layer, never merely that `addLayer` was called.

**A map-chrome control id can collide with the panel it controls.** `[app]`
*(2026-08-17, concentration & exposure analyzer)*
`<button id="legend">` in the control cluster and `<div id="legend">` for the legend panel:
`getElementById` returns whichever comes first in document order, so every `renderLegend()` wrote into the
button and the panel silently stopped updating. Duplicate ids are not a parse error and nothing warns.
**Guard:** prefix control ids (`ctl-legend`, `ctl-layers`, `ctl-basemap`) so a control can never shadow
the surface it drives, and assert in the offline suite that the panel's own selector finds its rows.

**Two floating map overlays with independent CSS anchors collide at widths nobody authored for.** `[app]`
*(2026-08-17, concentration & exposure analyzer)*
A bucket-detail card anchored `top: 9px` with `max-height: calc(100% - 110px)`, and a legend anchored
`bottom: 62px`, do not overlap at the author's width — and do overlap as soon as the strip below them
wraps to a second line, which depends on the text, the font size and the panel width. The legend then
sits on top of the card and neither is readable. **Guard:** measure the variable-height element after
render and publish its height as a CSS variable the others are positioned from; and assert in the browser
suite that **no two map overlays intersect**, which is the rule rather than a check on the one pair that
happened to collide.

**A map built inside a hidden container has no size.** `[app]`
Its boot-time `fitBounds` computes against nothing; revealing the page resizes but never re-fits.
**Guard:** fit on first reveal. A canvas of `[0,0]` is a layout problem, not a data one.

**A failed async step during boot must not strand the app.** `[app]`
An unguarded `await` in the boot sequence rejected, so everything after it never ran: no centre, no
results, no error on screen — a rendered shell that looks like an app with no data rather than an app that
failed. **Guard:** every boot-time async step is individually caught, reports its failure in the notice
bar, and leaves the rest of the app usable. *(nearby)*

**Open on a view where the app's signature is visible.** `[app]`
Landing on the hierarchy root left a band empty and put **zero hatched blocks** on screen — the app opened
on the one view where its own argument was invisible. Every non-visual suite was green.

**Scoping the map to the selection removes the context the selection stands out from.** `[app]`
The map should draw the whole loaded scope; only an explicit filter narrows it.

**A row that acts on click can remove itself, making a toggle impossible.** `[app]`
A table listing the *children* of the adopted node lost the row that adopted. **Guard:** separate the
gestures — click selects and survives, double-click descends.

**Fit to the subject, not to the items.** `[app]`
Fitting the *item* extent zoomed out to a whole region, because the register publishes some works as
single features spanning the city. The subject was the 300-ft ring.

**Enumerating the redraws by hand is the bug.** `[app]`
One refresh function updated five things and not the filter chips. One `redraw()`.

**Layer panels must distinguish four kinds of nothing.** `[app]`
One report — "all the layers are hidden" — had three causes: the panel never listed the *primary* layer,
all context defaulted off, and of five context layers one could never draw, one had nothing in this county,
and one silently capped. **Guard:** list the primary layer first with a live drawn-count; default cheap
context on; label every row *off* · *N in view* · *none in this view* · *capped* · *not mappable*.

**Top-level `await` puts every `const` below it in the temporal dead zone.** `[browser]`
An arrow-function helper declared after `await load()` threw *"Cannot access … before initialization"* on
first render — and the app showed a confident dash where a number should be, with nothing in the console
until a global error handler was added. **Guard:** hoist helpers as `function` declarations above the boot
block.

**`beforeId` throws when the reference layer is absent.** `[app]`
True on the first legend hover before the map paints, and for a frame after a theme swap wipes the style.

**A container too small to lay out stops the style from ever loading.** `[app]`
Five properties wrapped a header strip onto four rows and squeezed the map to **27 px**, at which MapLibre
never finishes loading a style — so the map was blank, not small. **Guard:** give the map container a
minimum height, and keep single-row strips on one scrolling row rather than letting them wrap.

**A filter carrying thousands of literal values kills the shared GeoJSON worker.** `[app]`
*(2026-08-12, broadband gap matrix)*
Expressing a selection as `["in", ["get","geoid"], ["literal", [ …13,514 ids ]]]` killed MapLibre's
**one** GeoJSON worker while it built the bucket. The failure is not confined to that layer: **every
source parsed afterwards silently produces nothing** — no console error, no `error` event,
`isSourceLoaded` just stays `false` forever. The one context layer that had been parsed *earlier*
still drew, so the map read as merely empty rather than broken, and both non-visual suites were
green. Located by adding a 20-feature copy of the identical data, which rendered instantly.
**Guard:** selection travels **in the data** — flag each feature and filter on that one property
(`["==",["get","sel"],1]`), re-flagging on `setData`. A filter should never carry more than a
constant.

**`setFilter` and `setPaintProperty` fire `styledata` too — so re-hydrating on `styledata` re-enters
itself.** `[app]` *(2026-08-12, broadband gap matrix)*
Hydrating on `styledata` is correct (see below), but *any* style mutation fires it, including the
ones the hydrate itself performs. `styledata → paint → setFilter → styledata` spun forever, and a
source under continuous re-parse **never finishes loading** — the same blank map as above, again with
nothing in the console. **Guard:** one render signature that skips the whole repaint when nothing it
depends on changed, plus a `hydrated` flag so an ordinary `styledata` is a no-op and only a genuine
style swap (layers actually gone) rebuilds. Guarding `setData` alone is not enough.

**Hydrate on `styledata` and `idle`, not only on `load`.** `[app]`
`styledata` can fire while a style is still resolving, leaving nothing to retry; a source added on `load`
alone never arrives. Listen on all three and make hydration idempotent.

**An idempotent hydrate plus a guarded paint means a skipped paint is never retried.** `[app]`
*(2026-08-13, catchment & market-share)* Two individually-correct guards cancel each other. `paint()`
returns early while `isStyleLoaded()` is false; `hydrate()` returns early when it is already hydrated
and nothing is missing. A repaint requested *during* a style swap therefore never happened: the map
came back **empty from a theme switch**, and a table-row selection stayed unhighlighted — both with
every non-visual assertion green, because the DOM and the arithmetic were right. Waiting for the next
`idle` is not a fix either: if the map has already settled, no further `idle` fires. **Guard:** hydrate
always *attempts* a paint even when it rebuilds nothing, and a paint deferred for an unloaded style
**re-arms itself on a timer**. Only the browser suite sees this.

**`min-height:0` is what makes a fixed layout work and what silently clips a collapsed one.** `[app]`
*(2026-08-13, catchment & market-share)* A `responsive.small` rule stacked the columns but left the
flex chain (`flex:1 1 auto` + `min-height:0`) in place, so the container shrank **below its own
content** and the app's headline card was clipped off the top of the page. `getBoundingClientRect()`
still reported a healthy 792×174, so the assertion written specifically to catch this passed, as did a
clipping-aware visibility helper — the element was genuinely rendered, just above the scroll origin.
**Guard:** collapse to plain **block flow** below the breakpoint (`display:block`, `height:auto`,
`overflow:visible`) rather than re-pointing the flex axis, and confirm by **screenshot** that the
signature is on the first screen at the narrow width.

**A basemap that never arrives must not take the data with it.** `[app]`
After a timeout, fall back to a blank style that still draws the operational layers, with a note saying
the basemap is missing and the numbers are unaffected. A tile host having a bad day is not a reason to
show an empty screen.

**Jump, don't fly, when the camera must arrive.** `[app]`
An animation that never runs leaves the camera on the previous subject — so a scope change that *must*
land uses a jump, not `flyTo`.

**An empty state has to look rendered.** `[app]`
A 16 %-opacity wash on a dark basemap made the one campus with published buildings look like the only one
that had drawn at all. **Guard:** step the fill up when there is nothing to read through, add a casing to
the boundary, and put the "no data here" offer *on the map*, where the emptiness is.

**A legend row must filter, not fade.** `[app]`
A faded-out class is still clickable, so a "hidden" feature can still be selected through it. Filter the
layer instead.

**A popup that inherits half a theme is invisible.** `[core: fixed]`
MapLibre's own CSS paints `.maplibregl-popup-content` **white and sets no `color`** — so the text colour
is inherited. A Strata popup mounts inside the map container, inside the `<StrataApp>` root, which sets
`color: var(--strata-fg)`: near-white in every dark theme. The popup opened, rendered, and could not be
read — white on white, with a white tip pointing at a dark map. It reported as *"clicking a point on the
map does nothing"*, which sent the search to identify, `queryRenderedFeatures` and the OID rule, none of
which were involved. **Guard:** `ensurePopupStyles()` (injected by `initPopups`, so no app wires it) takes
the card from `--strata-panel-bg`, the text from `--strata-fg`, the edge from `--strata-border`, and
repaints the tip for all four anchors. Every token keeps a light fallback so an unthemed `<StrataMap>` is
unchanged. **The general rule: never inherit one half of a colour pair.** A component that adopts the
theme's foreground must adopt its background in the same breath, or a theme switch splits it.

**A legend fed a static array cannot follow the map.** `[core: fixed]`
`Legend` required a `layers` prop, and `<StrataApp>` threads `store`/`bus`/`outputs` to every widget but
never `layers` — so an authored `{"type":"legend"}` widget got `undefined` and threw, while one authored
with an explicit `props.layers` was a **snapshot of the spec** that no amount of showing and hiding could
change. A legend that disagrees with the map is worse than no legend, because the reader trusts it.
**Guard:** omit `layers`; the legend subscribes to the store (`useStoreLayers`), which is also what the
layer panel and the map-controls drawer write to. Pass an array only to list a deliberate subset.

**A legend that lists only the *styled* layers reads as a list of the layers.** `[core: fixed]`
The legend dropped any layer whose renderer yielded no classes — no authored `drawingInfo` (the service
owns the symbology), or a renderer type with no discrete classes. Those layers were **drawing on the
map** and absent from the legend, which reads as "that layer isn't on". **Guard:** a layer with nothing
to classify still gets a row — its title and a **neutral** swatch, never an invented colour, since the
legend cannot back up a colour claim it did not read. The row is a caption, not a filter button: there
are no classes to hide, and a control that does nothing is a lie. `includeUnstyled:false` opts out.

**A basemap drawer that ticks nothing leaves the reader unable to name what they see.** `[app]`
The tick tested `b.id === chosen && !auto` — and "Follow the theme" is the **default**, so opening the
drawer for the first time showed five options and none selected. "Follow the theme" says HOW the choice
is made; it does not stop there being a choice. **Guard:** tick the **effective** basemap, so both the
auto row and the basemap it is choosing are marked. Shipped in `BasemapPanel`/`MapChrome`; assert that at
least one row is ticked on first open.

**"Follow the theme" that never learns the theme.** `[core: fixed]`
The basemap drawer took a `themeMode` prop nobody passed, so it defaulted to `"light"`: in a dark app the
row promising to follow the theme ticked — and, once picked, applied — the *light* basemap. The theme
mode existed only as CSS custom properties, which nothing but the stylesheet can read. **Guard:** the app
resolves its mode once and shares it (`StrataAppEnv.themeMode`); the map chrome and `BasemapPanel` read
it from there, and `theme-switch` reports every change back. A mode that only exists as CSS cannot be
followed by anything that is not CSS.

**Two answers to "which basemap pairs with dark?".** `[core: fixed]`
`basemapForTheme` preferred a *vector* preset of the mode while the drawer took the *first* preset of the
mode — so the drawer ticked OpenStreetMap while the app applied OpenFreeMap Liberty. Ticking one basemap
and drawing another is worse than either choice. **Guard:** one resolver, `basemapForThemeFrom(library,
mode)`, used by the swap and by both drawers; the tick and the applied basemap are the same lookup.
*(2026-10-08: the theme pair now lives in the catalog — `THEME_BASEMAP` / `basemapForTheme`, `osm` /
`osm-dark` — and every id, including a `theme.basemap` id, resolves through `BASEMAP_ALIASES`, so a retired
id ticks and draws the same survivor.)*

**A theme flip that the undo stack remembers.** `[core: fixed]`
The theme-driven basemap swap went through the undoable `setBaseMap`, so toggling light/dark three times
buried the reader's real edits under six history entries — and `toLayersJson()` then saved whichever mode
happened to be showing. **Guard:** `setBaseMap(bm, { transient: true })` for anything the reader did not
author. A view preference is not an edit to the map spec.

**A superseded basemap that arrives last and wins.** `[core: fixed]`
A vector basemap is a `fetch` away, but `clearBasemap` is synchronous — so flipping light→dark→light fast
let the middle style resolve after the last one and paint itself on top. **Guard:** every `applyBaseMap`
takes an epoch per map and a load that is no longer current is dropped after every `await`. Any
fire-and-forget style load needs this, not just this one.

**Two open drawers, or a drawer over the cluster.** `[app]`
A second drawer request must *switch* mode, not stack, and the panel opens **beside** the cluster
(`right:47px` against a 32px cluster at `right:9px`) — a drawer covering the buttons that opened it
strands the user. **Guard:** one `drawer` element with a `which` attribute, and a browser assertion that
the drawer's box does not intersect the cluster's.

**An app-owned drawer container must be authored `hidden`, or the first Esc closes an empty drawer.** `[app]`
*(2026-10-21, incident situation map build)* When an app passes its own element to `@strata/map-controls`
as the drawer (`drawer: HTMLElement`), the package uses it as found — it hides only a drawer it creates
itself. Authored visible, the empty container counts as an open drawer, so the reader's **first Esc** is
spent "closing" it and does nothing they can see; the popup or tool they meant to dismiss stays. **Guard:**
author the container with the `hidden` attribute (and keep the global `[hidden]{display:none !important}`
rule above so an author `display` cannot defeat it); assert in the browser suite that the first Esc after
opening a popup closes the popup.

**A row that selects but cannot deselect.** `[app]`
Whatever adopts must also release, by the same gesture — otherwise a user who clicked by accident has no
route back to the whole population. And the release must reach **every** sink: an empty `oids` clears the
store selection, drops the highlight **and closes the popup**. A popup left open over a cleared selection
is the app disagreeing with itself. **Guard:** in the bus contract an empty `oids` is a release, never a
no-op (`@strata/actions` `FeatureSelectPayload`); assert both the adopt and the release.

**Zooming to a selected row fits the whole layer.** `[core: fixed]` `[app]`
`featureSelect{zoom:true}` used to fit the layer's extent, so clicking one row gave the reader the view
they already had. Fixed in `storeBinding` — it flies to the **record's** own geometry, resolved by the
layer's real OID field, and falls back to the layer extent only when the record cannot be located.

**A resized panel leaves the map canvas at its old width.** `[app]`
MapLibre does not watch its container: widen a docked panel and the map's box shrinks while its canvas
keeps the old size — a stripe of dead space, or a canvas overflowing its parent. **Guard:** call
`map.resize()` after the box changes. In the React path `<StrataMap>` observes its own container and does
this itself, so a `panel`/`PanelShell` resize beside it needs no wiring; a hand-built app must call it
(`strata-app-build` §2). Both non-visual harnesses report green while this is broken — the DOM width is
correct and the arithmetic is correct. Assert canvas-matches-container **after** a drag, in the browser
suite.

**A resize that clamps against the live size lags the pointer.** `[app]`
Each move re-clamps an already-clamped number, so a drag past the ceiling and back trails by the whole
overshoot. **Guard:** capture the size once at `pointerdown` and apply the total delta to *that* — the
`resizePanel` helper in `@strata/core-map` takes `start` for exactly this reason, and its suite asserts
the return trip.

**MapLibre measures its container ONCE, and the chrome above it grows after that.** `[app]` `[browser]`
*(2026-08-20, fraud / AML geo-dashboard)* The entry above is about a *drag*; this is the boot case, and
it needs no interaction at all. The map is constructed while the header is one line and the notice bar
is empty; the header then wraps and the notice bar fills, the map's box shrinks by 20 px, and the canvas
keeps the size it was born with. Container-match assertions written after a drag pass, because the drag
calls `resize()`; the *first paint* is the frame that is wrong, and it is the frame every reader sees.
**Guard:** observe the box rather than resizing at chosen moments — one `ResizeObserver` on the map
element covers the chrome growing at boot, a panel drag and a window resize in the same three lines —
and assert canvas-matches-container on **first paint**, not only after a gesture.

**An absolute panel height collapses the hero at laptop height.** `[app]`
*(2026-08-20, fraud / AML geo-dashboard)* A table-protagonist console authored its queue at `420px`.
On the 1440×900 display it was drawn for that is a reasonable half; in an 804 px browser viewport it is
**52 % of the page**, and the map — the app's hero, specified as roughly the upper half — was left a
226 px band in which a state-wide choropleth is unreadable. The authored number is where a panel
*opens*, and an absolute one silently changes what it means on every other screen. **Guard:** author the
split as a **proportion** with a readable floor and a ceiling (`flex: 0 0 39%; min-height: 210px;
max-height: 72%`), let the drag override it, and assert in the browser suite that the hero occupies the
share it was designed to — a range, checked, not a pixel count nobody re-reads.

**A fixed-height app shell clips half of itself at phone width — and freeing the height then makes a
125,000-pixel document.** `[app]` `[browser]`
*(2026-08-20, fraud / AML geo-dashboard)* The desktop shell is `height:100vh; overflow:hidden`, which is
right for a console and wrong for a phone: stacked, the panels are taller than the viewport, and the
ones at the bottom are not scrolled past — they are **clipped away entirely**, present in the DOM and
unreachable. So a "no column is dropped" assertion written against the DOM passes while the reader can
reach neither the detail pane nor the status line. The obvious fix — `height:auto` on the containers —
then let all 5,070 rows of a scrolling table into page flow, producing a **125,000 px** document in
which everything below the table is just as unreachable. **Guard:** at narrow widths let the *page*
scroll and dissolve the nesting containers (`display:contents` plus `order`) so the panels lay out as
one column; keep every long list bounded (`max-height: 55vh`) so it still scrolls inside its own box;
and assert three separate things in the browser — that the stacked panels are all *rendered with
non-zero height*, that `document.scrollHeight` is sane, and that the body never scrolls horizontally.

**A resize grip that hangs outside its own box is the entire horizontal overflow.** `[app]` `[browser]`
*(2026-08-20, fraud / AML geo-dashboard)* `.grip{inset-inline-end:-3px}` puts the grab area just outside
the panel, which is correct and invisible while the panel floats over a map. Give that panel
`width:100%` at phone width and those 3 px are suddenly outside the *body*, and the page scrolls
sideways by 2 px for no reason a reader could ever diagnose. **Guard:** pull the grip inside its box
(`inset-inline-end:0`) wherever the panel becomes full-bleed, and make the horizontal-overflow assertion
**name the offending elements** — collect everything whose rect exceeds `body.clientWidth` — because
"the body scrolls sideways" without a culprit is a half-hour of bisecting CSS.

**A panel built inside a hidden container measures zero.** `[app]`
`getBoundingClientRect()` on a `display:none` ancestor returns 0, so the first drag snaps the panel to its
minimum. **Guard:** measure at the start of the gesture (not at construction), and treat a non-finite
measurement as the floor rather than as zero.

**A pointer-only resize grip is not an affordance for everyone.** `[app]`
A 6 px hit target with no keyboard path excludes keyboard users, is awkward on touch, and is invisible to
a screen reader. **Guard:** `role="separator"`, `tabIndex=0`, an `aria-label` naming the panel, and arrow
keys sizing it (`Shift` for a coarser step). The shipped grips do this; a hand-built one must too.

**Exotic glyphs render as tofu in headless Chrome.** `[browser]`
Circled numerals (①②③) become boxes. Plain digits in a CSS circle look better anyway.

**`exportImage` returns a blank image.** Create the MapLibre map with `preserveDrawingBuffer: true`.

**Heatmap floods the canvas.** Ensure a ratio-0 transparent colour stop (the style compiler adds one if
missing).

**`TimeSlider` and `TimeSeries` ship in `@strata/core-map` but are NOT registered as `AppLayout` widget
types, so a declarative time-player application cannot be authored from the registry alone.** `[core: open]`
*(2026-09-07, portfolio & asset register)* Both components are complete: `TimeSlider` is a range slider with
play/pause, `instant` and `window` modes, and it builds the time predicate and calls back per layer;
`TimeSeries` is an inline-SVG series chart. Neither has a `defaultWidgetRegistry` key. The registry's
nearest offering, `date-filter`, is a **calendar picker** — it emits `filterChange` and drives a bound
source correctly, but it has no play, no step, no window handles and no clock selector, and it is
chrome-sized rather than a page's protagonist. So this is a **registration and wiring gap, not a missing
capability**. **Guard:** close it app-locally under the freestyle charter — a thin wrapper registered with
`mergeRegistry` / `<StrataApp registry={{ "horizon-bar": HorizonBar }}>` — and name `date-filter` as the
shipped fallback so the design ships either way, recording that the reading survives and the **motion**
is what is lost. **If a second recipe registers the same wrapper, promote it into the registry** and follow
the reference-docs update matrix: code first, then the component manifest row, then the three reference
docs, then a Vitest case, keeping the docs-reconcile suite green.

**A `filter` action replaces the layer's filter — cross-widget filters do not stack.** `[core: open]`
`whereFromTrigger` derives **one** clause from the trigger and the dispatcher writes it straight through
`store.setDefinition`, and `CartoPanel` holds exactly one active filter (a second click toggles it off).
So a design promising "filters stack into a chip row" ships as *one classification at a time*. Two scopes
**do** coexist when they target **different layers** — an interactive legend filtering a hazard underlay
plus a chart filtering the point layer is a genuine two-clause reading. **Guard:** put compound scope in a
`filter` widget, which builds a real nested AND/OR `WHERE`; say on screen how many scopes are in force; and
stub an unbuildable chip row with a labelled `placeholder` rather than decorating it to look finished.

**The `map` widget is a bus SINK, not a source.** `[core: open]`
`storeBinding` subscribes to `featureSelect`, `rowSelect` and `flash`; `StrataMap` reports viewport changes
through an `onViewChange` **prop**, not onto the bus, and nothing subscribes to `extentChange` outside
`@strata/actions` itself. So `{from:"the-map", trigger:"extentChange", to:"kpi", action:"showStatistics"}`
— a **documented canonical pattern** — never fires, and neither does `map → featureSelect → viewInTable`.
The cost is two much-promised behaviours: "the KPI follows the view", and the map→detail half of a
master–detail loop. **Guard:** source every wire from a widget that actually emits (`table`→`rowSelect`,
`chart`/`carto`/`legend`→`categorySelect`, `filter`/`date-filter`→`filterChange`); let statistics follow the
**scope** rather than the viewport; and where the loop can only run one way, say so rather than claiming a
bidirectionality the app does not have.

**The `filter` action is layer-scoped, so `to` is decorative and per-consumer duplicates double-write.** `[core: open]`
`targetLayer` reads `options.layerId` (falling back to the trigger payload) and calls
`store.setDefinition(layerId, where)`; the connection's `to` is never consulted. One `filter` connection
therefore re-scopes **every** widget resolving to that layer's `DataSource` — map, table, charts, KPIs — at
once. The documented canonical pattern authors one per consumer widget, which writes the identical clause
twice and emits a duplicate `filterChange`. **Guard:** author **one `filter` connection per emitter**, not
per consumer, and note in the recipe that source-linked widgets follow for free.

**Some emitters hardcode their trigger `source`, so a connection addressed by widget id never fires.** `[core: open]`
*(2026-08-17, climate-risk regulatory reporting)* `ViewsRenderer.go()` emits
`{type:"viewChange", source:"views", …}` — the literal string, and `ViewsNode` carries no `id` key in the
schema at all. `AttributeTablePanel` emits `{type:"rowSelect", source:"table", …}` rather than
`props.id`, although `<StrataApp>` threads the widget's id to it. `wireConnections` drops any trigger
whose `source` does not equal the connection's `from`, so `{from:"my-rack", trigger:"rowSelect"}` **never
fires — silently, with no warning** — and `{from:"table"}` fires from *every* table on the page. **Guard:**
address these two by their literal source, accept that two of either are indistinguishable to the bus,
and check the emitter in the source before designing a wire around a widget id. **Fix:** give `ViewsNode`
an optional `id` and emit `props.id ?? "views"` / `props.id ?? "table"`, and add a debug warning to
`wireConnections` when a connection's `from` never matches any emitted source over the app's lifetime —
that one warning would catch this and every entry below it.

**`export` is a declared action with no dispatcher, so `{action:"export"}` is a silent no-op.** `[core: open]`
*(2026-08-17, climate-risk regulatory reporting)* `export` is in `StrataActionType` but
`defaultDispatchers()` never returns a handler for it, and `wireConnections` does nothing for an action it
cannot find — no warning, no error. A recipe that wires its "Build the pack" button to `export` ships an
app whose primary button does nothing. Two neighbours in the same family: `navigate` passes
`options.viewId` through and `<StrataApp>`'s `onNavigate` handles only `pageId` and `url`, so declarative
view navigation is unreachable; and `setUrlParam` writes an **empty string** for `viewChange` and
`pageChange`, because `valueFromTrigger` reads `payload.value`/`where`/`oids` only while those payloads
are `{viewId}` and `{pageId}` — a deep link that is present and blank is worse than one that is absent.
**Guard:** deep-link from a `button` with an explicit `props.value`; build an export in a widget.
**Fix:** implement an `export` dispatcher routing to a host callback (matching `onNavigate`/`onRefresh`)
or drop it from the type; extend `valueFromTrigger` to read `viewId`/`pageId`.
*(2026-10-22, data compact build)* Two more gaps of this family, from a design that needed them (the house vanilla build worked around both;
the React path was not exercised): `export` acts on a map or a table, so exporting **one drafted record** (a data
request as XML) has no action target — candidate `export` with `{ recordId }`; and a three-phase `views`
lifecycle over **one** mounted map needs the map outside the `views` node with the phase driving the map's mode,
which no connection can express — candidate `viewChange` → `filter` honouring a per-view map state for GeoJSON
sources.

**A `type:"scroll"` page emits nothing on scroll, so the scroll-story loop cannot be wired.** `[core: open]`
*(2026-08-17, climate-risk regulatory reporting)* `type:"scroll"` gives a scrolling body and
`animate:"scroll-reveal"` uses an `IntersectionObserver`, but neither publishes a trigger — so the
archetype's own signature loop (*section scrolls into view → apply a map state diff*) has no declarative
form, and only a `views` node can apply a `mapState`. **Guard:** build the silhouette as a `type:"scroll"`
page whose stage column is a plain `ContainerNode` with `style.position:"sticky"`, holding a
`views`/`slides` node that drives the map, with the narrative numbered to match. **Fix:** have `Animated`
emit a trigger carrying the section's id when it becomes visible, so a `section` can carry a `mapState`
the way a `ViewDef` does.

**The export composers cannot carry a per-page attribution, so a multi-page document cannot be evidenced.** `[core: open]`
*(2026-08-17, climate-risk regulatory reporting)* `PrintComposition` is
`{title, image, legend?, scalebar?, northArrow?, attribution?, layout?}` — it has a footer, so a *single*
figure can carry its source and date. `AtlasPage` is `{title, image}` and has none, so a multi-page pack
cannot. The shipped `print` widget also calls `exportPDF` with `legend:false` and no `attribution` at all.
**Guard:** compose a multi-page evidenced document app-local from `@strata/export`'s pure builders
(`legendHtml`, `scalebarSvg`, `northArrowSvg`, `printLayoutCss`, `esc`) plus `exportImage` per figure.
**Fix:** add `attribution?` (and `legend?`) to `AtlasPage` and render it in `composeAtlasHtml` — a
four-line change that makes `exportAtlas` usable for any document that has to cite its sources.

**A connection authored on a trigger nothing emits is a dead wire.** `[core: open]`
`buttonClick`, `viewChange`, `sketchComplete`, `mapClick`, `rangeSelect` and `brush` all exist as trigger
types with working dispatchers, but **no shipped widget emits them** — `ChartPanel` wires `EChart`'s
`onSelect` to `categorySelect` and leaves `onRange` unwired. The shipped `dashboard` template authors
`{from:"chart", trigger:"rangeSelect", …}`, which therefore never fires. **Guard:** before designing a
control around a trigger, grep for a widget that emits it; the trigger union is the *bus* vocabulary, not
the *emitter* roster.
*(2026-10-21, impact zone build)* Still open for `buttonClick` (from `menu` / `button`) and `sketchComplete`, and `<StrataApp>` supplies no `onSelectByGeometry` host callback — so a select-by-zone app's four signature connections (draw → zone, buffer step, adopt a footprint, context switcher) run only in the house build, wired directly.
*(2026-10-22, live-position build)* Still open for `mapClick` (from `map`), `buttonClick` (from `button` /
`controller`) and the `timer` mount (§9 *`timer → refresh` is declared and never fires*): ten of a
dock-and-cards app's connections ran only in the house build, wired directly.

**`carto` and `chart` render a "no data source" note unless the app passes a query function.** `[core: open]`
Both panels are deliberately data-source-agnostic: `CartoPanel` needs `onQuery(spec)` and `ChartPanel`
needs `onQueryData(source)`, `<StrataApp>` supplies neither, and `WidgetSpec.props` is static JSON that
cannot carry a function. The failure is silent and plausible — the rail lays out correctly and says
nothing. **Guard:** pass both through **`StrataApp.context`**, which is spread onto every widget *after*
its `props`; back them with a group-by over the source's **filtered** view so the charts follow the current
scope; and assert on a rendered category value, never on the widget being present.

**A histogram bin cannot cross-filter a numeric field.** `[core: open]`
`histogram()` labels its bins as range strings (`"60–80"`), and `categoryWhere` turns a bin click into
`ltv = '60–80'` — SQL no service will match, and the failure is silent (an empty map, not an error).
**Guard:** pre-compute a **string band field** on the data (`ltv_band`, `exposure_band`) and render it as a
`bar` chart. It reads identically and produces valid SQL.

**No connection action adds a layer, so "pin this catalog row to the map" cannot be authored.** `[core: open]`
*(2026-10-21, incident situation map build)* A catalog list whose row click should add that dataset to the
map as an operational layer has no `connections` wire to do it: `StrataActionType` offers `filter`,
`zoomTo`, `showHide` and the rest, but nothing that **adds** a layer — `showHide` only toggles a layer the
spec already declares. **Current guard:** declare every pinnable layer in `layers.json` hidden and wire the
row to `showHide`; or handle the row click in app code against the store, and say in the recipe why it is
not declarative. **Fix:** a candidate `addLayer` action whose options carry an ESRI operational-layer
object, dispatched through the store so the layer enters the Layer panel and the undo history.

**The map-controls draw tool emits no "finished" event and exposes no last-sketch accessor.** `[core: open]`
*(2026-10-21, impact zone build)* An app that uses the sketch as **input** (draw a zone, count what is inside) cannot be told when the operator finished. **Current guard:** pass `interaction.setMode` to `mountMapControls`; on the change back to `"identify"` read `controls.tools.toGeoJSON()` and take the newest polygon added since the tool opened — nothing added means nothing changes. **Fix:** `tools.draw.onFinish(feature)` (or a `draw:finish` event) in `@strata/map-controls`. The same tool also exposes **no public clear**: once the app has adopted the sketch as its zone, the operator's orange sketch (fill 0.16) stays drawn over the app's own zone until the operator presses *Clear* in the tool panel, so the zone reads orange, not in its own colour. Editing the vendored copy is not allowed, so the guard is copy that says so; the fix is `tools.draw.clear()` (or `onFinish` returning `false` to discard).

**No connection action sets a layer group's visibility.** `[core: open]`
*(2026-10-21, impact zone build)* A context switcher (*Flood* = two layers, *Seismic* = two, …) cannot be authored in `connections`: `showHide` targets a widget, not a set of map layers. **Current guard:** app code toggles each group through the layer descriptors' `setVisible`. **Fix:** a `setLayerVisibility { layerIds, visible }` action (also wanted by a lifeline board).
*(2026-10-21, lifeline board build)* Confirmed a second time. "Select a lifeline row, show its evidence layers
and dim the rest" could not be authored in `connections`. App code flashes the row's layers and dims the
others through the descriptors, so the behaviour is not declarative and the recipe says so.

**`showHide` cannot toggle.** `[core: open]`
*(2026-10-22, live-position build)* The `showHide` dispatcher reads `to` plus `hidden`, so a dock button that
opens **and** closes the same card cannot be authored as one connection — every press sets the same state.
**Current guard:** app code toggles the card and reflects it in `aria-pressed`. **Fix:**
`showHide { toggle: true }`, flipping the target's current state.

**No nearest-of-a-type primitive.** `[core: open]`
*(2026-10-22, live-position build)* "The closest available unit of this kind" — rank the features of a
kind/type by great-circle distance from a target, with stale candidates kept and labelled rather than
dropped — was hand-written (haversine, R = 6,371.0088 km). **Current guard:** keep it in the app's domain
module, label every distance *straight-line* (a ridge, a river or a closed road is invisible to it), and
assert the ranking on fixed fixtures. **Fix:** `nearest(points, target, { filter, keep })` in
`@strata/processing` with that label contract; a `nearest-card` widget once a second app needs one.

**Buffer, intersection and geodesic area are not available to a vanilla app.** `[core: open]`
*(2026-10-21, impact zone build)* `@strata/processing` is Turf-backed but needs a build, so a house-pattern app that must buffer a zone and apportion tract populations vendors Turf's UMD build (`@turf/turf@7.2.0`, sha256 recorded in `vendor/VENDOR.json`) and loads the same bytes in the browser and in both node suites (`vm.runInNewContext`). **Fix:** a plain-ES geometry module (buffer · intersect · area · point-in-polygon) vendored beside the map controls, with its own drift check.
*(2026-10-21, lifeline board build)* Confirmed a second time, by a different route. Instead of vendoring Turf,
a house-pattern app that needed **area shares** (utility territory per county, outage area per water system)
re-implemented grid-sampled `areaShare` and even-odd ray casting with holes in its own domain module. A build
script imported the same module, so the browser and the coverage table share one implementation. Getting it
right cost three refinements: a finer step to meet the check, a minimum sample count, and a fine re-measure
near the floor (§4, *"intersects" is not "served by"*). Every app that hand-writes it will pay that cost
again. The fix above should include `areaShare` (with the sampling rules) and ray casting.

**Freshness — time of record, time of fetch, cadence, last good read — is re-implemented in every app.**
`[core: open]`
*(2026-10-21, incident situation map build)* Every live app in this file's recent builds hand-wrote the same
machinery: the record's own newest time (§3 *the feed is up but the number is old*), the last successful
fetch against a stated cadence, the last good set held through a blank reload (§2), a body hash to detect
change, and a strip that prints all of it. Each copy differs slightly, which is how a freshness dot comes to
mean different things on two screens. **Current guard:** keep the two clocks separate and assert both in the
live suite. **Fix:** a candidate `freshness` block on `@strata/data-source` sources (record-time field,
expected cadence, last-good retention) and a registry `freshness-strip` widget that renders it.
*(2026-10-21, lifeline board build)* A third hand-written copy, with **16 feeds**. It added three things the
block should carry:
- the time of record taken from the **`Last-Modified` of the response that carried the rows** (§5, *metadata
  and rows come from different CDN cache fills*);
- a **measured** cadence beside the claimed one, and the CDN cache age, both folded into the stale threshold;
- **a parse failure treated as a failed refresh** that keeps last-good (§5, *truncated JSON*).

The feed bar also had to grow to its content: a fixed-height strip clipped its last row until the copy
*"16 of 16 feeds listed"* made the omission countable.
*(2026-10-22, data compact build)* A fourth copy, judging each package against the **cadence its provider agreed to** rather than one the
publisher claims: a per-package `staleAfter` from a register, *delivery stamp* (the query's `Last-Modified`) and
*time of record* (a max statistic) printed apart, an `evidence: none` class that can never be judged on time, and a
per-poll observation log (capped at 5,000 per declaration, the dropped count recorded) feeding an after-action
annex. The block should carry an "on change — not verifiable" state, not only fresh / stale.
*(2026-10-22, live-position build)* A fifth copy, per **feature** rather than per feed: each unit's fix age
from its own fix-time field (§3 *the feed is up but the number is old*), banded against a stated cadence and
re-rendered every second from a clock, without a poll. The block should come with a `fixAge` helper and a
`freshness` visual variable in `@strata/core-map` (opacity plus a ring by band), so a stale unit looks stale
on the map without app code.

**Three widgets keep shipping app-local: a fixed-category status ledger, a cascade lens, and a feed bar.**
`[core: open]`
*(2026-10-21, lifeline board build)*
- *Symptom:* a status board built against FEMA's Community Lifelines needed three widgets the registry does
  not have:
  - a **ledger**: a fixed, never-re-sorted category list whose chips are *suggested* (hollow) by a feed
    and *recommended* (solid) by a person, with an agreement line;
  - a **cascade lens**: a typed, tiered list of what a selected feature touches next, labelled heuristic;
  - a **feed bar**: every source's time of record, fetch, cadence and gap citation.

  All three shipped app-local, each with a named fallback.
- *Cause:* `defaultWidgetRegistry` has no status-ledger, dependency-list or freshness widget. The feed bar
  overlaps the `freshness-strip` candidate above.
- *Guard:* ship them app-local under the freestyle charter (`recipes/COMPONENT-MANIFEST.md` §10) with a
  day-1 fallback.
- *Fix:* promote under §10.2 when a second app needs one. The silhouette is a template candidate,
  **"lifeline-board"**: a fixed-category status ledger with suggested-then-recommended chips, which also
  fits grid operations, ports and campuses.
**Five more widgets shipped app-local: grant matrix, package cards, agreement grid, request queue, withdrawal checklist.** `[core: open]`
*(2026-10-22, data compact build)* A data-sharing compact board (who may use whose data, when a declaration puts it in force) needed a
providers × subscribers **grant-matrix** with glyph states, **package-cards** carrying DCAT-style terms and a
drill, an **agreement-grid** of needs with one headline number and classified gaps, a **request-queue** in
ICS 213RR discipline, and a **withdrawal-checklist** grouped by provider. All five shipped app-local with
named fallbacks (recipe §2.10). Promote under `COMPONENT-MANIFEST.md` §10.2 when a second recipe needs one; the
silhouette is a template candidate, **"data-compact"** (utility mutual aid, health-information exchanges, port
consortia).

**Four more widgets shipped app-local: unit fleet, unit vitals, nearest card, follow card.** `[core: open]`
*(2026-10-22, live-position build)* A live resource-tracking board needed a **unit-fleet** list (units by
kind, with state and fix age), a pinned **unit-vitals** card of counts, a **nearest-card** ranking (§7 *no
nearest-of-a-type primitive*) and a **follow-card** of watched units. All four shipped app-local with named
fallbacks. Promote under `COMPONENT-MANIFEST.md` §10.2 when a second recipe needs one.

**MapLibre's GeoJSON tiler DROPS sub-pixel features, so a choropleth can draw the wrong half of a state.** `[browser]` `[app]`
*(2026-08-17, climate-risk regulatory reporting)* A `geojson` source's default `tolerance` (0.375)
discards features below a size threshold **in the tile**. At statewide zoom that kept the large rural
tracts of the eastern desert and silently dropped the small dense tracts of the coastal corridor — so the
map showed exposure where there is little and blank where the portfolio actually was, which is exactly
backwards. **3,526 features really were rendered**, so every size, count, `addLayer` and
`queryRenderedFeatures`-is-non-zero assertion passed. **Guard:** set `tolerance: 0` on any source you have
already generalised at build time (there is nothing left for the tiler to usefully drop), and assert
coverage **geographically** rather than numerically — project several known places spread across the
study area and require a feature to be rendered **at** each of their coordinates. A count proves
something drew; only a coordinate proves the right thing drew.

**The house alpha floor is for polygons that OVERLAP, not for the layer that IS the figure.** `[app]`
*(2026-08-17, climate-risk regulatory reporting)* `~40/255` exists so overlapping published surfaces stay
readable through each other. Measured over CARTO Positron, `rgba(213,94,0,0.157)` is **invisible**: the
browser suite reported 518 hazard polygons rendered on a map a reader could see nothing on. The same
value hid a grey underlay completely in **dark mode only**. **Guard:** ask what the floor is protecting
before applying it — where the surfaces are mutually exclusive, or the layer beneath is hidden in that
view, the constraint does not bind. Pick a mid-luminance hue so a data colour reads on **both** grounds
(data colours stay identical across themes), and keep a screenshot in each mode in the evidence.

**A sequential ramp with 71 % of the population in one class is not a choropleth.** `[app]`
*(2026-08-17, climate-risk regulatory reporting)* Round-number breaks put 6,528 of 9,129 tracts in one
band and produced a map that showed nothing. **Guard:** cut on **quantiles of the published
distribution** and print the resulting breaks in the legend, so the classes are both visible and
auditable — and give a "no record" class a **different hue** rather than the pale end of the ramp: it is
a different *kind* of answer, and the lightest blue reads as "least".

**Non-solid ESRI fill styles compile to solid.** `[core: open]`
The style compiler warns *"fill style '…' not fully supported; rendered as solid"* for anything that is not
`esriSFSSolid`, so `esriSFSBackwardDiagonal` and friends are unavailable — which matters most for the one
thing hatching conventionally means: **no data**. **Guard:** carry an "unknown/unmapped" class by colour
plus an explicit legend label written as a sentence, and never rely on a pattern to make the distinction.

**`stacked-bar` cannot follow a filter.** `[core: open]`
*(2026-08-18, branch & ATM network operations)* An impact decomposition authored as `stacked-bar` froze
while every other widget on the page re-scoped to the header filter. Its `series` prop is a static
`{label,value,color}[]` with no `dataSource` path, so nothing reaches it. **Guard:** use a source-bound
`chart` (`kind:"bar"`) for any composition that must follow a filter, and reserve `stacked-bar` for a
genuinely fixed one. The fix in core is to accept `stat` + `dataSource` the way `kpi` and `gauge` already
do.

**`queryRenderedFeatures` counts paints, not features.** `[browser]`
*(2026-08-20, financial inclusion & coverage)* A tract layer painted by five MapLibre layers — a fill, two
class outlines, a hairline and the selection ring — returns **every feature once per layer**, so the layer
drawer reported *"45,645 drawn in this view of 9,129"*: a count larger than its own denominator, which is
the only reason anyone noticed. Passing several layers in one call sums their paints; querying them
one-by-one and adding is the same mistake with more steps. **Guard:** dedupe on the layer's identity
field (`new Set(feats.map(f => f.properties[idField])).size`), and assert that any "drawn" count is
**≤ its denominator** — that single assertion catches the whole family.

**…and it describes the frame, so it cannot ride on the repaint path.** `[app]`
*(2026-08-20, financial inclusion & coverage)* The same counts were taken at the end of a `paintMap()`
that short-circuits when the paint **signature** is unchanged. A pan changes the frame and nothing else,
so zoomed into one county the status line still read *"9,129 tracts drawn"* — the whole state — beside a
reading that had correctly re-scoped to 2,033 tracts, which is exactly what made the stale number look
authoritative. Calling `queryRenderedFeatures` synchronously inside `moveend` has the same failure on its
own: the new frame has not rendered yet. **Guard:** recount on `idle`, redraw only the surfaces that
quote the number, and make the browser assertion **wait for `idle`** — otherwise it passes or fails on
machine speed rather than on the app.

**A fixed-viewport page clips; it does not scroll.** `[app]`
*(2026-08-20, financial inclusion & coverage)* `body{display:flex;flex-direction:column;overflow:hidden}`
is the house shape for an operational app, and it is silent when the column adds up to more than the
viewport: on a 1440×900 laptop the status line and every row of the foot table sat below the fold with
**no scrollbar to admit it**. A reader cannot scroll to something they cannot see is there, and every
non-visual suite was green — `getBoundingClientRect()` reports a healthy box for a panel that is entirely
off-screen. **Guard:** `overflow:auto`, so a page that does not fit scrolls instead of truncating; and
assert the rule from the browser — *either the column fits (`scrollHeight - clientHeight <= 1`) or the
page can be scrolled to the rest* — printing every child's height when it fails, because "34px past
804px" is a number nobody can act on and `#foot=168 #status=25` is a fix. Related: `flex:0 1 auto` is
**not** the fix — a panel that can shrink cannot be grown by its own resize grip.

**A popup taller than half its map cannot be anchored inside it by any anchor.** `[app]` `[browser]`
*(2026-08-20, branch & ATM network operations)* A 10-row device popup measured 220 px in a ~390 px map.
MapLibre picks its anchor from the space available, and with the subject flown to the centre there is
~195 px above and ~195 px below — so *neither* anchor fits, it does not flip to a better one because
there is none, and the card hangs 26 px outside a container with `overflow:hidden`. The rendered text was
correct and both non-visual suites were green. **Guard:** treat the popup as a glance and the detail panel
as the record — cap the card at roughly half the map's height with `overflow:auto`, and assert from the
browser that the popup's box sits inside the map's box, not merely that a popup opened.

**Two floating map overlays collide the moment one of them grows.** `[app]`
*(2026-08-20, branch & ATM network operations)* A legend anchored bottom-left grew to 40 % of the map
width once its class labels were long enough to wrap, and the next popup opened straight on top of it.
Neither element moved; the *content* changed. Note also that truncating the legend's labels to fit is not
the fix — those words are the second channel that keeps state from being carried by colour alone.
**Guard:** give the legend a width and a `max-height` as a share of the map, let labels wrap, and assert
in the browser that **no two map overlays intersect** — the popup included — which is the rule rather
than a check on the pair that happened to collide.

**A reading that changes must bring its own view with it.** `[app]`
*(2026-08-20, branch & ATM network operations)* Choosing a scenario moved the headline number to a
different county and left the camera where it was, so the consequence the number described was off
screen. This is the "open on a view where the signature is visible" rule one interaction later, and it is
easier to miss because the first paint is correct. **Guard:** when a control changes *what the number is
about*, fit the map to the subject it now describes — the features and the area they affect — and assert
from the browser that the subject is inside the bounds and that its surface actually rendered there.

**A generated lane drawn at the same weight as the measured one takes the map over.** `[app]`
*(2026-08-20, branch & ATM network operations)* A declared-synthetic estate at twice the count of the
measured estate, drawn at the same radius and stroke, turned a statewide view into a wash of the
generated hue — so the layer the measured figures are actually about was the harder of the two to read.
Every assertion was green; only the screenshot showed it. **Guard:** where a generated lane is permitted
at all, draw it **recessive** — smaller, softer, thinner-ringed — while keeping its own hue and its
legend row, so provenance stays a real channel and the measured layer still leads.
*(2026-10-22, live-position build)* Applied again to a generated fleet beside an empty measured lane (no
open feed publishes the unit positions): the generated lane is drawn recessive, and when a measured lane is
connected it should also default to **off**. Nothing new found.

**An early return in a paint function leaves the previous population's number on screen.** `[app]`
*(2026-08-20, fraud / AML geo-dashboard)* A console whose primary control **swaps the population** — not
filters it — has a lane that is legitimately empty. Its paint function returned early on an empty
reading, before the line that resets a derived cluster count, so the empty lane rendered with `125 of
1,802` still in the legend: a number computed from a different population, sitting under a heading that
says the current one. Nothing threw, and the count was correct for the data it came from. **Guard:**
reset every derived value on the *early* path too, or compute the display values from one function that
cannot be partially skipped; and assert the empty state explicitly — that every derived figure reads
zero or is absent, not merely that the rows are gone.

**`source.setTiles()` does not swap a raster basemap, and skipping a mid-load map is worse than waiting.** `[app]`
*(2026-08-23, property peril report)*
Switching light-to-dark left patches of the old basemap on the hero — cached tiles survive `setTiles` —
and left **all seven inset panes on the light basemap**, because the swap skipped any map whose
`isStyleLoaded()` was still false. Half the app in one theme and half in the other, with every non-visual
assertion green. **Guard:** remove and re-add the raster source, re-inserting it **beneath** the data
layers; and when a map is mid-load **defer** the swap to its next `idle` rather than skipping it, guarding
against a newer choice having since won. Assert the applied tile URL on **every** map, not just the first.

**A legend swatch at the map's own fill alpha is invisible.** `[app]`
*(2026-08-23, property peril report)*
Polygon fills carry alpha 40/255 so overlapping hazard layers stay readable — correct on the map, and at
13 px it reads as white. The legend rendered as a column of empty boxes and every suite passed.
**Guard:** a legend row carries **two** colours — the map fill, and an opaque chip of the same hue for
the swatch. It is the same split as a fill token versus a text token.

**A fixed-height reading band can zoom the map out until the subject is a sliver.** `[app]`
*(2026-08-23, access to care)* A reading column authored at a fixed `300px` left the map **177 px**
tall in a 940-px window once the header, notice bar, evidence strip, status line and footer had taken
their share. `fitBounds` did exactly what it was asked and zoomed to **z5.8**, where the county the app
is about was a sliver among four neighbouring states. Every non-visual assertion was green — the map
existed, the canvas matched its container, the origins were in the source. **Guard:** size the bands
proportionally, and assert in the browser that the map's *rendered bounds actually contain the subject's
bbox*, not merely that `fitBounds` was called.

**A KPI grid that overflows hides the card you most need to defend.** `[app]`
*(2026-08-23, access to care)* Eight cards needed 339 px in a 242 px column, so *Inside but thin* — one
of the two tests the app claims to apply — sat below a scrollbar on first paint. **Guard:** assert
`scrollHeight <= clientHeight` on the reading column in the browser suite, and treat a lasting caveat as
belonging in the notice bar (`app-design.md` §0) rather than as a KPI competing for that space.

**A map-corner readout collides with chrome you do not own.** `[app]`
*(2026-08-23, access to care; recurred 2026-08-25, housing & homelessness services)* A coordinate readout
at `bottom:9px right:9px` sat *under* MapLibre's attribution plate, and once the map box shortened it also
sat under the app's own control cluster. Both are invisible to every DOM assertion.
**This entry has now cost two builds.** The second shipped with 435 assertions green across three suites:
an *opaque* readout painted over the attribution by **152 px** per pane on desktop and **133 px** at phone
width, hiding `…contributors © CARTO` outright, and after that was lifted clear the 32 px cluster — which
reaches the bottom corner once the pane is only ~136 px tall — cut the tail off both. Attribution for
keyless OSM/CARTO tiles is a **licence term, not chrome**: covering it is a licensing defect, not a
cosmetic one. **Guard:** assert the attribution's rectangle against **every** opaque thing the pane paints
(`.coords`, the control cluster, the pane label, any open drawer) — not just the one you suspect — at
**both** widths, and assert its text still names every required source. Give the corner to the attribution
and stack the readout above it; make the readout `pointer-events: none` so the corner still drags the map
and still opens the attribution toggle.

**`loading="lazy"` inside a short drawer shows blank boxes at the moment of choosing.** `[browser]`
*(2026-08-23, access to care)* Five basemap thumbnails, two below the drawer's fold, rendered as empty
grey boxes exactly while the reader was picking between them. Worse, the *suite* then reported them
broken: a single sample at 2.5 s caught `tile.openstreetmap.org` and `opentopomap.org` — volunteer-run
and slower than a CDN — still in flight, and read that as a 404. **Guard:** load a handful of small
thumbnails eagerly; give an unarrived tile a visible *loading* placeholder rather than a blank box; and
**poll** for them in the suite instead of sampling once.

**A legend class whose layer is not loaded reads `0 of 0`, which is a false claim.** `[app]`
*(2026-08-24, shortage-area explorer)* Two legend classes belonged to layers that ship switched off. Their
rows rendered `0 of 0` — indistinguishable from "the register contains none of these", when the truth was
"that layer is not loaded". Both counts were *correct*; the sentence they formed was not. **Guard:** the
house rule that layers are labelled with their real state (*off* · *N in view* · *none in this view* ·
*capped* · *not mappable*) applies to the **legend** as well as to the layer drawer. Map each class to the
layers that can supply it, and print `layer off` / `layer not loaded` / `none in this scope` accordingly.
Assert that **no legend row can ever render `0 of 0`**.

**A panel summary placed below its own list is invisible at real data volumes.** `[app]`
*(2026-08-24, shortage-area explorer)* The tray's running summary — the decomposition bar, the jeopardy
count with its denominator, the recovered share, the per-discipline populations — sat *under* the record
list. With the demo tray of six records it looked correct. With the real tray of 494 it was a screen and a
half below the fold, so the number the app exists to produce was never on screen. **Guard:** a panel's
*reading* is pinned; only its *list* scrolls. Put the summary in its own flex-fixed region outside the
scrolling body, give it `aria-live="polite"`, and assert in the browser harness that its box lies inside
the panel's visible box **with a full-sized dataset loaded** — a fixture of six proves nothing here.

**A round `stroke-linecap` on a zero-length `stroke-dasharray` paints a dot.** `[browser]`
*(2026-08-24, shortage-area explorer)* An arc gauge with `stroke-linecap="round"` and
`stroke-dasharray="0 C"` renders a small coloured mark at the arc's origin — so an *empty* gauge, where no
reading exists, shows a coloured dot that reads as a real value near zero. Every arithmetic assertion stays
green because the value genuinely is null. **Guard:** omit the value path entirely when the reading is null
or zero rather than drawing a zero-length one, and assert the element count (`<path>` occurrences) rather
than the numeric label.

**Two synced map panes oscillate.** `[app]`
*(2026-08-24, housing & homelessness services)* Pane A's `moveend` moves pane B; pane B's `moveend` moves pane A. The panes judder during a drag and
drift apart after it. **Guard:** one re-entrancy flag around the programmatic move, released on the next
animation frame — and assert in the browser suite that after moving each pane in turn the two **centres
converge** and the number of programmatic moves does not grow. A `jumpTo` from inside a `move` handler is
the specific shape to look for.

**A value sitting exactly on a class-break edge lands in the LOWER class.** `[app]`
*(2026-08-24, housing & homelessness services)* Class bounds tested as `lo <= v <= hi` in order mean a value equal to a break edge matches whichever
class is tested **first** — the lower one. With quantile breaks over a small population, edge values are
common: the top class drew empty while the legend claimed members, and the same value could take different
classes in two panes sharing one break set. **Guard:** half-open classes (`lo <= v < hi`) with the last
one closed, and a suite assertion that a value on each edge lands where the legend says it does.

**A "hide" path and an "isolate" path that normalise the empty class differently.** `[app]`
*(2026-08-24, housing & homelessness services)* A legend's hide path mapped "no class at all" to `-1` before testing membership; its isolate path
compared the raw `null` against the same `-1`. Shift-clicking the out-of-ramp `no published count` chip
therefore filtered **everything** away. The offline suite passed because it had isolated a populated
class. **Guard:** normalise the empty class **once**, where the class is computed, not at each call
site — and exercise the out-of-ramp class explicitly, in both the hide and the isolate direction. Any
state that sits outside the ramp is exactly the state a test is least likely to click.

**A MapLibre popup carries no `z-index`, so it opens underneath the map's own chrome.** `[browser]`
`[app]` *(2026-08-25, public health preparedness)* Clicking a row flew the map to the feature and opened
its popup **with the first line — the count and the share, the whole answer — hidden behind an
absolutely-positioned note pinned inside the map box.** The app's chrome sat at `z-index: 3`; a
`.maplibregl-popup` sets none at all, so it resolves to `auto` and loses. Every suite was green: the
popup existed, its markup was correct, its text was right, and the assertion "a popup opened" passed.
One screenshot made it obvious. **Guard:** give `.maplibregl-popup` an explicit `z-index` above every
piece of map chrome — a popup is the reader's direct answer to their own click and outranks chrome that
is merely persistent. Assert it by **hit-testing `document.elementFromPoint` at the popup's own first
line**, not by checking the boxes do not overlap: they should be allowed to overlap, and an assertion
that only passes while they happen not to is not a guard at all.

**A failing basemap tile is not the app failing, and it must not seize the app's status line.** `[app]`
*(2026-08-25, public health preparedness)* The map's `error` handler wrote `map: Failed to fetch` into
`#status` — the one place the app reports **its own** state. So a CDN's bad minute replaced *"332
ED-capable sites · 9,109 tracts · … · no run-time data call"* with a bare failure string, telling the
reader the app was broken while every number on screen was intact and computed from the build cache.
**Guard:** classify the error before writing anything. A tile/network failure is **counted and appended**
to the state readout — saying the reading is unaffected, and naming the key that switches basemap — never
substituted for it; a genuine map fault still speaks up. Assert **both** branches, or the guard is a gag
that hides real faults too. Joins the existing *a caveat that outlives a toast belongs in a persistent
notice* entry from the other direction: that one is about caveats put somewhere too transient, this one
is about transient noise put somewhere too important.

**A `position: sticky` flex item with no background lets the rest of the page render straight through it.**
`[browser]`
*(2026-08-25, mission impact map)* At the phone breakpoint the pinned map column was `position: sticky`
and the narrative rail was reordered beneath it. Sticky does not create a paint barrier and the column had
no background, so the rail scrolled **through** the pinned column: two paragraphs and a headline number
drawn on top of each other, unreadable. Both non-visual harnesses were green — the DOM was correct, the
arithmetic was correct, and the geometry was never asked about. Two fixes, and the second is the better
one: give any sticky element an explicit background **and** a `z-index`; and where only part of a column
should pin, `display: contents` on the wrapper lifts its children into the parent's flex flow so the map
alone sticks while the reading below it scrolls normally. **Guard:** in the browser harness assert
**pairwise non-overlap** of the pinned element against the elements that scroll past it, at the small
breakpoint — a rect test, not a DOM test.

**`queryRenderedFeatures()` counts what your own opaque chrome is covering.** `[app]` `[browser]`
*(2026-08-26, humanitarian response map)* An extent-driven stat strip on a full-bleed map read **401 cells
in view when 290 were visible** - 111 districts, 28 % of the board, counted from behind an opaque panel the
reader cannot see through. The headline said *"people in view"*. **Cause:** `queryRenderedFeatures()` with
no geometry answers for the whole **canvas**, and a full-bleed map's canvas runs underneath every overlay
drawn on it. Here the container was 1060 x 900 and the strip plus chip row covered the bottom 416 px, so
46 % of what the map "held" was invisible. **Guard:** read the **visible region** - the container minus its
opaque overlays, measured from the DOM on each reading rather than hardcoded - as a union of screen-space
rectangles, de-duplicating across them so a feature counts if any part of it is somewhere the reader can
see. Two details decide whether the fix works: subtracting the overlays leaves **hairline slivers** between
and beside them (a chip row inset 12 px and floating 8 px above a strip leaves an 8 px full-width seam), and
that seam alone let **33 wholly-hidden districts back into the reading** - so drop any region thinner than
~24 px on its short edge. Note also the corollary for the *fit*: padding `fitBounds` for the chrome is a
separate fix, and having done it does not make the reading honest.

**`idle` lands up to 1.5 s after the map stops moving, so an extent-driven board holds a confident stale number.** `[app]`
*(2026-08-26, humanitarian response map)* A row click flew the map into one district; `isMoving()` went
false at ~1.4 s and the strip still read the whole-response figures until ~2.5 s. Nothing on screen said
so. **Cause:** the only honest moment to recompute is `idle` - after the new tiles have drawn - and that is
strictly later than the end of the movement. **Guard:** mark the reading stale on `movestart`/`zoomstart`
and clear it in the recompute: dim the numerals and show a live-region *"Recomputing for this view..."*.
The reading is still driven by the map and by nothing else, which is the property that mattered; what
changes is that the gap between the gesture and the truth is visible rather than silent.

**A full-bleed map with an overlay strip collapses to a sliver at the phone breakpoint.** `[app]` `[browser]`
*(2026-08-26, humanitarian response map)* At 420 x 820 the stat strip's five numerals reflowed to two
columns, its bars stacked and its provenance line wrapped to eight lines - about 1,100 px of opaque panel
absolutely positioned over a map that then had **30 px** left. Every numeral read 0, correctly, because
nothing was visible. Every non-visual assertion passed: the numerals existed, none was hidden, the grid was
two columns, the panel had re-docked. **Only the screenshot showed it.** **Cause:** an overlay's height is
authored for the wide case and is a function of its own content everywhere else. **Guard:** below the
breakpoint take the strip **out** of the overlay - give the map a fixed slice of the viewport, let the strip
flow beneath it and the page scroll - which needs the map and its on-map chrome wrapped in their own box so
the strip can be a sibling rather than a child. Then assert it: **the map keeps more than a quarter of the
viewport, and the board still has cells to count.**

**`map.loaded()` goes true while tiles of the PREVIOUS style are still painted.** `[browser]`
*(2026-08-26, humanitarian response map)* A theme flip swapped the basemap to CARTO Dark Matter; the suite
waited for `loaded()`, asserted a dark mean luminance and took the screenshot - which showed a rectangle of
the light basemap still sitting inside the dark map. It settles on its own within a few seconds.
**Cause:** `loaded()` answers about the style and the current render, not about whether every tile on
screen belongs to the style now in force. **Guard:** for a screenshot after a style change, wait for the
canvas to be **steady** - sample mean luminance until two consecutive reads agree - rather than for
`loaded()`. A picture taken in that window is of a state no reader ever sees, which is worse than no
picture.

**`glyphs: undefined` invalidates the ENTIRE MapLibre style, and the rejection reaches only `map.error`.** `[browser]` `[app]`
*(2026-08-26, facility capacity & catchment)* A style object built with `{ version: 8, glyphs: undefined,
sources, layers }` fails validation with `glyphs: string expected, undefined found`. The consequence is
total and completely silent: the style never finishes loading, **no operational layer is ever added**,
`getStyle()` returns undefined, `loaded()` stays false, and camera easing never advances —
`movestart` and `moveend` both fire while the transform never moves and `isEasing()` stays true forever.
The console stays **clean**, because MapLibre routes style and render errors to its own `error` event.
Basemap tiles keep painting, so the map looks alive. **Guard: register `map.on("error", …)` in every app
and surface it to the status line and the console** — that handler found this within seconds of being
added, after an hour of blaming headless Chrome. And omit an optional style key entirely rather than
setting it to `undefined`; a map that draws no text needs no glyph source at all.

**A MapLibre expression may not compare a value to `null`, and the throw is swallowed into `map.error`.** `[browser]` `[app]`
*(2026-08-26, facility capacity & catchment)* A class-breaks compiler emitted
`["all", ["!=", ["get","CASES"], null], ["<=", ["get","CASES"], 19]]` as the guard for "this feature has a
value". MapLibre's comparison operators **throw on a null operand**; `all` short-circuits, so the guard
looked safe, but the expression still evaluates against features whose property is genuinely null — and a
throw inside the render loop stops the map updating with the same silent, total failure as above.
**Guard:** never compare to `null` in an expression. Coerce instead — `["to-number", ["get", f], 0]`
turns null into 0 — and choose a sentinel the data cannot legitimately take, then **assert that** in the
suite (here: no *measured* cell can carry 0 cases). The coerced value then falls through every class into
the renderer's `defaultSymbol`, which is where a "no value" class belongs anyway.

**A flex item sized by `flex-basis` ignores `width`, so a resize grip moves nothing in a browser while every stub reports it working.** `[browser]` `[app]`
*(2026-08-26, facility capacity & catchment)* Three resizable panels declared `flex: 0 0 300px` and their
grips set `panel.style.width`. `flex-basis` wins, so the panels never moved — while the offline suite,
whose DOM stub reads `style.width`, asserted every clamp, floor and ceiling correctly. **Guard:** set
`flexBasis` alongside `width` (and pin `flexGrow`/`flexShrink` to 0) in any resize helper, and make the
browser suite assert the panel's **measured** `getBoundingClientRect().width` after the gesture, not the
style it was told to set.

**A container query cannot style its own container.** `[browser]` `[app]`
*(2026-08-26, facility capacity & catchment)* `container-type: inline-size` on a panel, then
`@container (max-width: …) { #that-panel { flex-direction: column } }` — the rule never applies, silently.
`@container` styles a container's **descendants**. **Guard:** declare `container-type` (and a
`container-name`) on the ancestor whose width you are querying, and put the rules on the children. Worth
the trouble: a panel whose width is set by two *resizable* siblings cannot be laid out with a media query
at all, because its width has nothing to do with the viewport's.

**A raster-only style has no `glyphs`, so a `text-field` symbol layer renders NOTHING -- silently.**
`[core: fixed]` `[browser]` `[app]`

> **Fixed in `@strata/map-controls` 1.0.1 (2026-10-12) — do not apply the old workaround.** Every
> raster (and `"none"`) style `basemapStyle()` / `controls.initialStyle()` builds now carries
> `glyphs: DEFAULT_GLYPHS` — the keyless VersaTiles endpoint
> `https://tiles.versatiles.org/assets/glyphs/{fontstack}/{range}.pbf`, the same one the catalog's
> VersaTiles GL styles use (a GL basemap keeps its own glyphs). Delete an app-side `LABEL_GLYPHS` /
> `map.setGlyphs()` workaround; it is dropped by every `setStyle` anyway. **Use a matching
> `text-font`:** the endpoint serves **one font per request**, so name exactly one stack it has —
> `DEFAULT_TEXT_FONT` (`["noto_sans_regular"]`) or `DEFAULT_TEXT_FONT_BOLD` (`["noto_sans_bold"]`).
> MapLibre's default `["Open Sans Regular", "Arial Unicode MS Regular"]` and any comma-joined stack
> **404**, and the labels vanish exactly as before. An app with its own font server passes
> `mountMapControls({ glyphs })` and it is kept on every raster style. Still assert the **count of
> rendered symbols** in the browser suite. The React path (`MapController`) always created its map with
> glyphs and never `setStyle`s, so it was never affected. `verify:basemaps` probes the glyph URL as
> keyless weekly.


*(2026-08-26, hospital network planning)* The house basemap style is `{version: 8, sources: {base: raster}, layers: [raster]}` -- correct, and
with **no `glyphs` key at all**, which is also correct for a raster style. A symbol layer added over it
with `layout: {"text-field": ["get","RANK"], "text-font": [...]}` validates, adds cleanly, throws nothing
and draws **nothing**. Measured: **14 candidate dots drawn, 0 numerals** -- and the numerals were the
app's entire signature accent. Every non-visual assertion was green; only the browser suite counted the
rendered symbols. Note this is the *opposite* failure from the `glyphs: undefined` entries above, which
invalidate the whole style loudly. **Guard:** never put `text-field` on a raster-basemap style. Rasterise
the glyph into a canvas and `addImage` it, which also keeps the app free of a font server -- an outbound
dependency an on-prem deployment may not have. And assert the **count of rendered symbols**, not the
existence of the layer.

**A data-driven `icon-image` fails the TILE in the worker and takes every other layer on that source with
it -- with a clean console.** `[browser]` `[app]`
*(2026-08-26, hospital network planning)* `layout: {"icon-image": ["concat", "rank_", ["case", ["==", ["get","RANK_CLASS"], "10+"], "10plus",
["get","RANK_CLASS"]]]}` parses, validates and adds without error; `hasImage()` confirms every target
image is registered; the feature property is correct. The source then never tiles:
`querySourceFeatures` returns **0**, and the **circle layers and the selection halo on that same source --
which have nothing to do with the expression -- render nothing either**. No console error, no
`map.on("error")` event, no style error. Isolated by deleting the one symbol layer: 0 dots became 14. The
same failure occurs with the simpler `["get","RANK_ICON"]` resolved onto the feature. **Guard:** give each
class its **own** symbol layer with a **literal** `icon-image` string and a filter -- which is exactly what
a `uniqueValue` renderer already describes -- and assert in the offline suite that no such layer's
`icon-image` is an array. When a source renders nothing, suspect **any** layer bound to it, not only the
one you are looking at.

**A hairline outline on every feature sums into a solid wash, however low the fill alpha is.** `[app]`
*(2026-08-26, hospital network planning)* The demand layer draws **9,106** tracts at fill alpha 40/255 -- the house value, chosen so overlapping
polygons stay readable -- with a `0.2px` outline per polygon. At statewide zoom the outlines alone painted
California a solid green and buried all **446** supply marks under it. The fill alpha was never the
problem: at that feature count the *perimeter* is most of the ink. **Guard:** on a high-cardinality
polygon layer the fill carries the class and the outline is `esriSLSNull`. A per-feature hairline is a
per-feature *area* once the features are small enough.

**Re-targeting an ALREADY-OPEN MapLibre popup fires `close` first -- so "close means release" cancels the
adopt you are in the middle of making.** `[browser]` `[app]`
*(2026-08-26, hospital network planning)* The house rule says whatever adopts must also release, and the canonical wiring is
`popup.on("close", () => { if (selected) release(); })` -- correct, because a reader dismissing the popup
*is* a release. But `popup.setLngLat(...).setHTML(...).addTo(map)` on a popup that is **already attached**
makes MapLibre fire `close` before it re-adds, so adopting straight from one record to another selected
the new record and instantly dropped it. It never showed on the click path (a card click from a released
state has no popup open) -- only on the **keyboard path**, where every step adopts from an already-adopted
state, so every keypress silently self-cancelled. **Guard:** set a `movingPopup` flag around the
re-target and ignore `close` while it is set, so a *reader-initiated* close still releases and yours does
not. And make the stub faithful here: a `PopupStub` whose `addTo()` quietly re-attaches hides this
entirely -- ours now fires `close` on re-add, and the suite asserts both that the adopt survives it and
that a reader-closed popup still releases.

**A hidden element that still has focus swallows every subsequent key.** `[browser]` `[app]`
*(2026-08-26, hospital network planning)* Dismissing a splash by setting `hidden = true` on its container left `document.activeElement` on the
dismiss **button inside it**. Keys still reached `window` -- a capture listener saw every `keydown` -- but
the app's own handler never acted, and `L` / `B` / `G` / `F` and the arrow keys were dead for the rest of
the session. **Guard:** `document.activeElement.blur()` whenever you hide the subtree that contains
focus, and assert a keyboard behaviour **after** any overlay is dismissed rather than before, because
that is the order a reader will meet it in.

**A generic class name is a component boundary you did not declare.** `[app]`
*(2026-08-26, hospital network planning)* A splash panel used `class="box"`. `.box` was already the map drawer's 14 px checkbox/radio, carrying
`height:14px; display:grid; place-items:center`. `#splash .box` overrode the properties it named and
inherited the rest, so the panel rendered as a **14 px strip** with its own paragraphs overflowing below
it and the background painting only the strip. Nothing errored and every id-based assertion passed.
**Guard:** prefix or scope any class that describes a *component* rather than a utility, and assert
containment geometrically -- every `panel > *` must have `bottom <= panel.bottom` -- because "the panel
rendered" and "the panel contains its content" are different claims. Related: a centred flex or grid item
is **shrink-to-fit**, so `max-width` alone gives it no width; the same panel had already collapsed to a
one-word-per-line column until it was given `width: min(640px, calc(100% - 32px))`.

**Moving from a raster basemap to a GL style makes every basemap switch a `setStyle`, and `setStyle`
drops your layers.** `[app]`
*(2026-08-30, ATM cash & service routing)* Swapping the keyed CARTO raster set for keyless vector styles
turned a one-line `source.setTiles()` into `map.setStyle(url)` — which **removes every source and every
layer the app added**. Three things this build had to get right, each of which reads as green until you
look: **(a)** re-hydrate on `styledata` *and* on `idle`, idempotently (`getSource`/`getLayer` first) and
inside a `try`, because `styledata` fires **before** a remote style has finished loading and an `addLayer`
against a half-loaded style throws; **(b)** repaint after re-hydrating, or the sources come back empty and
the map is a bare basemap with every non-visual assertion still passing; **(c)** in the browser suite,
**poll until the remote style has settled** rather than asserting after a fixed sleep — MapLibre replaces
the style when it lands, dropping the layers a *second* time. **Guard:** make the MapLibre stub fire
`styledata`, *then* drop the sources, *then* fire `styledata` again — a stub that keeps them cannot
reproduce a switch that forgets to re-hydrate. Assert the sources, the layers **and** a non-zero rendered
feature count after the swap, in that order.
*(2026-10-22, live-position build)* Make the idempotency check `getSource(id)` / `getLayer(id)` per compiled
id — **not** `map.getStyle()`, which serialises the whole basemap style (hundreds of layers) and, called from
an `idle` handler, pays that serialisation on every frame.

**A full-bleed map flies records underneath its own floating panels.** `[app]`
*(2026-08-30, ATM cash & service routing)* In a hero-map silhouette the docked panel and the floating
cards sit **over** the canvas, so `flyTo`/`fitBounds` centre on the full canvas and put the record behind
a panel. The canvas matches its container, the record is selected, the popup opens — and the user sees
none of it. **Guard:** compute a `padding` from the chrome **actually on screen** (measure the panel, the
card column, the legend and any bottom card) and pass it to every `flyTo` and `fitBounds`; recompute it
as the panel is dragged; and call `fit()` once after boot so the app **opens on** its signature rather
than merely containing it. Assert `padding.left >= panelWidth` after a resize. Related to but distinct
from the earlier `fitBounds`-pads-the-viewport-not-the-app entry: this is a panel that **overlaps** the
map rather than one that shrinks it.

**Two floating surfaces will contend for the same corner, and only a screenshot says which won.** `[app]`
*(2026-08-30, ATM cash & service routing)* The house defaults put the legend bottom-left; this app's
linked series card wanted the same corner, and a coordinate readout ended up under a card column that
grew to the full height. Each surface was individually correct and inside the viewport, so every
positional assertion passed. **Guard:** assert **pairwise non-overlap** across every floating surface as
one rectangle predicate, not just that each is on screen, and include the control cluster and the
readout in the set. Then look at the screenshot anyway.

**An inline width written by a drag outranks BOTH the collapse rule and the responsive breakpoint.**
`[browser]` `[app]`
*(2026-09-03, transaction evidence)* A resizable rail sets `style.width` on every pointer move, which is
correct. Two rules then stopped working, and only in the order a real reader hits them. Collapsing the rail
(`#rail[data-collapsed="1"]{flex-basis:0}`) did nothing at all once it had been dragged, because an inline
declaration beats any stylesheet rule of any specificity. And at the phone breakpoint, where the rail stacks
**above** the map and a horizontal width is meaningless, the 444 px it had been dragged to survived into a
420 px viewport and pushed the whole page sideways. Both passed every DOM assertion: the collapse attribute
flipped, the media query matched, the canvas matched its container.
**Cause:** a dragged size is *session state*, and the stylesheet is the *spec*; nothing reconciles them.
**Guard:** park the dragged width when you collapse and give it back when you expand, so the reader's choice
survives the round trip; and in the small-breakpoint block override it outright — `width:auto!important` —
because below that width the drag axis does not exist. Assert **both**: that a collapse after a drag really
reaches zero, and that at phone width `scrollWidth <= clientWidth`, **naming the widest element** in the
failure message so the next occurrence is one line of output rather than an investigation.

**A coverage state authored at low alpha reads as EMPTY GROUND, which is the one thing it exists to
prevent.** `[app]`
*(2026-09-03, transaction evidence)* This app covers one county of California's 58 and renders the other 57
`NOT COVERED` — never as zero, never as blank — using the house convention that a **dashed** outline says
"a statement about data" where a solid fill says "data". Authored at fill alpha **26/255** with a 1.0 px
dash, the layer was invisible on a light basemap: 57 counties looked exactly like the ocean. Every assertion
passed — the source held 57 features, the dash array was `[3,2]`, the fill colour was the authored one.
**Cause:** an alpha chosen so a wash cannot be mistaken for a measurement can also be an alpha at which
nothing is communicated, and no DOM assertion distinguishes the two.
**Guard:** raise the fill until it reads while keeping it **below the deepest data class** (46/255 here
against a deepest band of 110/255) and let the **dash** carry the semantics, since the dash is what
separates the two meanings rather than the alpha. Then assert it in pixels: `map.project()` a coordinate
inside a not-covered polygon, decode the screenshot, and require the sampled luminance to be measurably
below bare ground. A coverage layer nobody can see is a coverage claim nobody made.

**Three declarative wires that read as obvious and do not work.** `[core: open]`
*(2026-09-07, valuation & taxation base map)* Read out of the shipped dispatchers rather than guessed, and all three would have shipped silently
in a connections table that reads as complete:

- **`extentChange → panTo` between two maps does not sync extents.** `extentChange` carries a `bbox` and
  no `oids`, and `panTo` re-emits it as a `featureSelect`. The receiving map sees an **empty `oids`**,
  which the shipped contract defines as a **release** — so it clears its selection, closes its popup and
  stops flying. The authored wire actively breaks the far pane.
- **`featureSelect → filter` clears a filter rather than scoping it.** `whereFromTrigger` has no
  `featureSelect` branch and falls through to `undefined`; the dispatcher then calls
  `setDefinition(layer, undefined)`, which removes the definition expression.
- **`buttonClick` has no shipped widget emitter.** It is a declared trigger type with its emitters listed
  as pending, so any connection wired to it never fires.

**Guard:** verify that every `from` in a `connections` table is a **shipped emitter** and every `action`
a **shipped dispatcher** before authoring it — a connection that never fires is worse than no connection,
because the design reads as finished. Camera lockstep between two maps needs a small map-tool widget
reaching both through the MapRegistry; a selection-derived filter needs a widget that re-emits a real
`filterChange`. Both are app-local until the core ships them, and both need a named day-1 fallback so the
application is whole either way.

**A state-to-colour lookup keyed on strings that are not keys of the palette throws only when the rare row
appears — and takes the whole pipeline with it.** `[app]`
*(2026-09-07, valuation & taxation base map)* The map from four record states to their hues used the keys `notroll` and `atfloor`. The
palette's keys are `notOnRoll` and `atFloor`. `PALETTE[key][theme]` therefore threw
`Cannot read properties of undefined` the moment **one** gated parcel entered the viewport, and the app's
own `try/catch` around the scope pipeline turned that into *"could not read the parcels in view"* — no
surface, no readout, and nothing in the console a reader would ever see. County-wide the trigger population
is **60,785 off-roll rows, 1,181 lots at or under 100 square feet and 124 sentinels**: not a corner case.
**A live suite of 415 assertions, a browser suite of 144 and a screenshot pass had all reported green**,
because every viewport any of them happened to open on contained only clean parcels. **Guard, two parts.**
Resolve such a lookup through a helper with an **explicit fallback**, so a missing key is a wrong colour and
never an exception — the states are the point of the surface, and losing the surface to protect a hue is
the wrong trade. And make the harness **fly to a named row of each rare state** rather than trusting the
viewport it happens to open on: a fixture carrying one row of every state offline, and a navigation to a
specific record by id in the browser.

**Second occurrence — the pointer path and the keyboard path of the same resize grip disagreed about
direction, and a suite that drove both still missed it.** `[app]`
*(2026-09-07, valuation & taxation base map; first recorded 2026-09-07, development pipeline tracker)*
Recorded again because the mechanism is identical and it was rediscovered independently in the same week,
which says the guard belongs in the harness template rather than in one build's notes. A shared
`apply(start, dx)` resolves which edge a panel's grip faces; the keydown handler applied that sign
**again** before calling it, so the right-hand rail's `ArrowLeft` **narrowed** the panel that dragging its
grip left **widened**. What differs from the first recording is what let it through: this build's suite
*did* drive both the pointer and the keyboard path — but only on the **left** rail, where the double
negation cancels and both paths are correct. **Guard:** drive both gestures on **every** rail, not on a
representative one, and assert the **direction** rather than that the size changed. A sign that appears in
two places is a sign that will be applied twice: resolve it once, inside the helper, and pass that helper a
raw pointer delta.

**Seven per-style basemap previews were one raster tile repeated, from a host the application's own text
calls a placeholder — and not one of them loaded.** `[app]` `[browser]`
*(2026-09-07, valuation & taxation base map)* The basemap drawer's rows each carried an `<img>` whose `src` was built from the current view's
tile coordinates: **the same URL on all seven rows**, in none of the seven styles, pointing at the very
raster host this application's own comments name as answering HTTP 200 with an *"Access blocked"* image. In
a browser the number that actually rendered was **zero**. Three faults in one element, and every non-visual
assertion was green — the row count was seven, the markup was right, the arithmetic was right, and the
drawer cleared the control cluster. The whole reason the house default asks for a live tile per row is that
*a colour swatch cannot tell Positron from Voyager* — and neither can seven copies of one picture.
**Guard:** assert a preview as a **picture** — a canvas per row, sized on screen, its bytes read back and
compared against its siblings, so *"seven previews"* and *"seven **different** previews"* are separate
assertions. Three mechanical notes, each of which cost a run: `toDataURL` on a GL canvas returns an empty
buffer unless the map was created with `preserveDrawingBuffer`, which is how this very assertion first
reported *"1 distinct of 7"* on seven previews that really were seven different styles; a GL map paints its
style's background colour before its tiles arrive, so poll each preview's own
`loaded() && areTilesLoaded()` rather than sleeping a fixed delay; and **mounting one live GL map per row
is not free**. That last one is measured rather than asserted: two probes back to back on a quiet machine,
and the same tier-B jump completes in **2.2 s** without the previews while the page **stops answering CDP
entirely** with seven of them mounted. Nine simultaneous WebGL contexts — two main maps and seven previews
— is more than a heavy page can carry.

**What shipped in the end was neither shape, and it is the cheaper answer.** Each row's swatch is drawn
from **that style's own declared ground, land-cover and water colours**, read once out of the style JSON
through the application's network seam, warmed at boot so opening the drawer never races the page, and
rendered as a small inline SVG with **no GL context at all**. It tells Positron from Dark from Liberty from
Colorful — which is the job the house default actually asks of a preview — and it says on screen that it is
the style's own colours rather than a picture of the reader's ground. One trap inside it: a style's colour
may be a **data-driven expression**, which is an array and not a string, and passing that through to a
`fill` renders the literal text `[object Object]`. Take flat colours only and skip the rest.

⚠ **A correction to an earlier reading of this same episode, kept because the wrong answer is instructive.**
The repeated browser-suite aborts around this drawer were **not** caused by the previews, and **not** by the
screenshots either. A clean run of the shipped design, with screenshots, passes **175/175** with no retries
and no missed captures, and a capture measures **0.0–0.1 s** with the evaluate behind it at 0.0 s. The
aborts came from two Chrome instances driving the same 22 MB application at once. The full account is in
§9, *a harness that spawns browsers is a load generator*.

**A GL → GL basemap swap with MapLibre's default style diff requests glyphs from the OLD style's host --
labels 404 and `style.load` may never fire.** `[core: fixed]` `[browser]`

> **Fixed in `@strata/map-controls` 1.0.2 (2026-10-13) — do not apply the old workaround.** Every basemap
> change is now `map.setStyle(style, { diff: false })` — a full swap that rebuilds the style and always
> fires `style.load` — once per map (the primary and each of `maps`). Delete app-side wrappers that patched
> `setStyle` to force `{ diff: false }` (or re-`setGlyphs` after a swap).

*(2026-10, map-controls migration)* `map.setStyle(url)` defaults to `diff: true`: MapLibre tries to
patch the old style into the new one. Between two **GL** styles from different hosts (VersaTiles ↔
CARTO, or a raster style carrying `DEFAULT_GLYPHS` ↔ a GL style with its own font server) the diff kept
the previous `glyphs` URL, so the new style's label layers asked the wrong host for their fontstacks and
**404'd** — the basemap drew, its labels did not, and the console showed only a run of glyph 404s. In some
swaps the diff succeeded "in place" and **`style.load` never fired**, so an app that re-added its layers
on `style.load` lost them. **Guard:** for a basemap change always `setStyle(style, { diff: false })` and
re-add app layers on `styledata` (the package's `onRestyle`), not on `style.load` alone; assert in the
browser suite that a label layer has rendered symbols **after** a GL → GL swap.

**An unset `*-opacity` (`setPaintProperty(id, prop, undefined)`) left a MapLibre 4.7.1 LINE layer drawing
nothing.** `[core: fixed]` `[browser]`

> **Fixed in `@strata/map-controls` 1.0.2 (2026-10-13) — do not apply the old workaround.**
> `applyLayerState()` never writes `undefined` any more: at 0 % transparency it writes the **authored**
> value back (a number, or the authored expression), and an expression opacity is faded as
> `["*", expr, k]` — or, for a zoom `interpolate` / `step`, by multiplying its output stops (`["zoom"]`
> may only be the input of a top-level interpolate / step, so it cannot be wrapped). Remove the
> `0.999` "never quite opaque" opacity workaround from the descriptors.

*(2026-10, map-controls migration)* The layer list used to "reset" a fully opaque sublayer by unsetting
the paint property — 1 is MapLibre's default for every `*-opacity`, so it looked like a no-op. On a line
layer in MapLibre 4.7.1 it was not: after `setPaintProperty(id, "line-opacity", undefined)` the layer kept
its features (`queryRenderedFeatures` found them) and drew **no pixels** until any other paint change.
Apps worked around it by authoring `0.999` so the module never reached 1. Separately, an authored
**expression** opacity (`["interpolate", …, ["zoom"], …]`, `["get", "alpha"]`) was multiplied as if it were
a number, producing `NaN`. **Guard:** never unset a paint property to restore a default — write the
value; and treat an authored paint value as possibly an expression everywhere you scale it.

**An open drawer hid the map's popup; in dark mode the popup was white-on-white (or bare text with no
`maplibre-gl.css`).** `[core: fixed]` `[browser]`

> **Fixed in `@strata/map-controls` 1.0.3 (2026-10-13) — do not apply the old workaround.** The package
> injects one popup stylesheet: a MapLibre popup inside the container stacks at `--smc-popup-z` (default
> `calc(var(--smc-z,40) + 2)` = 42), above the drawer (40); the cluster and the drawer grip sit at 43, so
> neither a control nor the grip is ever under a popup. With `popupStyles` (default on) the card is themed
> from the `--smc-*` tokens in light and dark. Delete app popup z-index overrides (`calc(var(--smc-z,40) +
> 2)`) and app dark-popup CSS. App modals go at **z-index ≥ 50**.

*(2026-10, thirty vendored apps)* The drawer and the cluster shared `--smc-z` (40); a MapLibre popup has
no z-index of its own, so a popup that opened beside a wide drawer slid under it (seen in about eight
apps). The vanilla package also had nothing like React's `ensurePopupStyles`: `maplibre-gl.css` paints
the card white and sets no `color`, so in a dark app the card inherited near-white text — or, on a page
without `maplibre-gl.css`, the popup was unstyled text at the top-left of the map. **Guard:** a popup is
UI and needs a stacking tier *above* the panels; check `document.elementFromPoint` over a popup that
overlaps an open drawer in the browser suite. Do not give the map element its own `z-index` — that makes
a stacking context that traps the popup below the drawer. A fixed `color` on `.maplibregl-popup-content`
written for light mode outranks the themed card and makes dark popups unreadable again.

**One Esc closed the app's modal AND the map's popup together.** `[core: fixed]` `[app]`

> **Fixed in `@strata/map-controls` 1.0.3 (2026-10-13).** `escape()` closes one layer per press: the
> app's `closePopup()` first — `true` stops there — then MapLibre popups on the next press, then the tool,
> then the drawer. `closePopups()` still closes all. A MapLibre popup *may* be registered as
> `closePopup`; one opened with `closeButton: false` *should* be (the package can only remove its element
> without telling MapLibre). An app modal that must outrank the chrome is checked **before**
> `controls.escape()`. The full-screen Esc guard (`escapeGuardMs`, 300 ms) is time-based: any Esc in that
> window is swallowed.

*(2026-10, thirty vendored apps)* 1.0.2 closed the app's popup and every MapLibre popup in one call, so a
reader who pressed Esc to dismiss a confirmation card also lost the feature popup they were reading.
MapLibre 4.7.1 also has no `map._popups`, so the package finds popups in the map container's DOM and
presses their close button. **Guard:** in an offline suite, stub a popup the 4.7.1 way — a
`.maplibregl-popup` with a `.maplibregl-popup-close-button` inside `map.getContainer()` — not only on
`map._popups`.

**A GL basemap's style, sources and tile hosts are not where a synchronous check looks.** `[browser]`
`[core: fixed in part]`

> **1.0.3:** `BASEMAP_HOSTS` now admits every host / path the catalog's own GL styles delegate to
> (VersaTiles `assets/sprites/` + `tiles/osm/`, CARTO's `tiles.basemaps.cartocdn.com` and
> `tiles-{a-d}.basemaps.cartocdn.com/vectortiles/`), checked offline against a recorded copy of each style
> and live by `verify:basemaps`; `styleDelegateUrls(style)` lists what a style delegates to. A GL style
> that fails to load falls back once to `osm` / `osm-dark` (`basemapFallback`, `basemapTimeoutMs`,
> `onBasemapFallback`). Delete app allow-list extensions and app GL fallbacks.

*(2026-10, thirty vendored apps)* Three traps around a `vt-*` basemap. (1) After a swap,
`map.getStyle()` and the sources an app adds are **not** there synchronously — the style is fetched and
parsed first; read it after `styledata` / `style.load` (the package's `onRestyle`), never on the line
after `setBasemap()`. (2) In headless Chrome a vector style can take **more than 6 s** to paint; a fixed
3 s sleep before a screenshot shows an empty ground — wait for `idle` with a generous timeout. (3) A GL
basemap's tile, glyph and sprite requests run in MapLibre's **worker**, so they never appear in the
page's resource timing; a host check that reads the page's network log sees only the style JSON and
passes anything. **Guard:** read the active style's URLs (`styleDelegateUrls(map.getStyle())` plus each
source's TileJSON `tiles`) and test them against `BASEMAP_HOSTS`.

**An app that called `refreshLayers()` on every `idle` lost clicks in the layer list.** `[core: fixed]` `[app]`

> **Fixed in `@strata/map-controls` 1.0.3.** `refreshLayers()` re-renders only when the list's HTML
> changes, so a call that changes nothing leaves the buttons (and a slider drag) under the pointer.
> Still call it when data changes, not on every `styledata` / `idle`.

*(2026-10, thirty vendored apps)* Each re-render replaced the row buttons; a click whose `pointerdown`
landed on the old button and `pointerup` on the new one never fired. **Guard:** re-render a list on a
data change, not on a map event; and `drawerWidth()` is `0` without layout (jsdom) — assert widths in a
browser, or after `setDrawerWidth()`.
*(2026-10-22, live-position build)* **The same failure from an app's own one-second tick.** A card that
rebuilt its `innerHTML` every second to update fix ages swapped the button under the pointer between
`mousedown` and `click`, and dropped focus from a `<select>` the reader was using. **Guard:** a clock tick
patches text in place (per-node `textContent`, or a small morph); rebuild markup only on a structural
change, and assert in the browser that a click and an open select survive a tick.

**An app's click delegate catches the vendored map controls' own buttons.** `[app]`
*(2026-10-22, live-position build)* The vendored `@strata/map-controls` cluster marks its buttons `data-act`
— the same attribute the app's single document-level click delegate dispatched on. Pressing the cluster's
**Legend** button reached the app's *legend row* case with no dimension: it hid `"undefined:undefined"`,
every legend row read *0 of N*, and MapLibre was handed a filter with an `undefined` value (one console
error per unit layer) — the map emptied. **Guard:** the delegate returns early for any target inside the
vendored chrome (`closest('[class^="smc-"]')`, or the controls' container), or the app namespaces its own
attribute; assert in the browser suite that pressing each cluster button leaves the app's layers drawn, and
negative-test the guard (remove it, watch the assertion fail).

**A submit button that is also a click action fires the action twice.** `[app]`
*(2026-10-22, live-position build)* A *Connect* button was both a case in the app's click delegate and the
form's submit button, so one press ran the click case and then the form's `submit` handler — two reads and
two self-re-arming poll chains. **Guard:** an action belongs to exactly one event: let `submit` own anything
inside a `<form>` (it covers Enter too), make the click case a no-op for it, and assert in the browser that
one press produces exactly one request. Same hazard as §9 *a `keydown` dispatched on both `document` and
`window`*.

**A quick theme switch during a style load surfaces MapLibre's `AbortError` as an uncaught rejection.**
`[browser]`
*(2026-10-22, live-position build)* Flipping light ↔ dark while the previous basemap style was still loading
left MapLibre's superseded style request rejecting with `AbortError` — an `Uncaught (in promise)` in the
console that fails a clean-console assertion although nothing is wrong. **Guard:** in the app's
`unhandledrejection` handler ignore `reason.name === "AbortError"` (a superseded request, not an error) and
let every other rejection through; test with two theme flips inside one style load.

## 8 · Colour, theme and contrast

**Measure the theme; do not argue about it.** `[app]`
`#f59e0b` as text on a white panel is **2.15:1** — under WCAG AA's 4.5 — and it marked the app's biggest
finding. Split into a fill token and `#b45309` (5.02:1) for text. In another build an amber read 3.77:1
light against 7.12:1 dark and looked like proof the app should be dark — until every other state measured
5.57–8.34:1 and the amber turned out to be the **outlier, not the theme**. `#b06f00` → `#8a5700` put it at
5.60:1 and the decision returned to fitness for purpose.

**Data colours are identical in both themes.** `[app]`
A dark-mode override painted light text onto a light amber fill and made a whole navigation band
unreadable. Only the halo changes.

**Mix surface tints against the panel, not `transparent`.** `[app]`
On a dark surface a tint mixed against `transparent` resolves toward the tint itself and produces mud.

**Fill opacity must follow the basemap.** `[app]`
Alpha tuned for pale CARTO Positron is invisible on OpenTopoMap — the basemap a user picks *precisely* to
see terrain context.

**An underlay outline in the class hue is tuned for one ground, and it inverts on the other.** `[app]`
*(2026-08-17, collateral & portfolio risk)* A hazard underlay drew its fill at alpha 40 and its **outline
in the same hue at alpha 170**. On white the fill reads as a pale wash and the outline as a firm edge; on
a near-black ground the fill all but disappears while the outline **glows**, so the layer flips from a
wash under the data to a bright cage over it. Worse where the polygons are many: the layer in question was
2,806 CGS quadrangles, and at statewide zoom its edges laid a lattice across the whole state in the *same
hue as the point symbols beneath it*. Every assertion stayed green — a lattice that hides the payload is
not a wrong number, and only the dark screenshot showed it. **Two guards.** Draw an underlay outline only
where the edge is a **real boundary**: a quadrangle, tile or survey-grid layer asserts a line that means
nothing, so it draws fill only. And derive the ESRI `drawingInfo` outline and the renderer's own
`line-opacity` from **one helper** — as two literals they agree by coincidence, and drift the first time
either is tuned.

**Semantic roles must not conflate two different facts.** `[app]`
"An authority answered" and "an authority answered, and the answer is a hazard" cannot share ink. Painting
*evidenced* in the danger role made a plain factual value draw as a full-width blood-red bar. No assertion
could catch it — the ink was internally consistent and semantically inverted.

**A network-wide verdict is a false statement about a specific asset.** `[app]`
Stamping "unverifiable" on every line because 28.3 % of network mileage is unparseable libels the lines
that file a plain value. Decide per feature and print the reason on the row.

**A caveat that outlives a toast belongs in a persistent notice, not a status line.** `[app]`
A vintage field-rename warning written to a status line was overwritten by load progress and never reached
anyone. *(2026-08-16, collateral & portfolio risk)* The same shape, one step subtler: `boot()` caught a
failing coverage-probe fetch, wrote *"not available"* to the status line, and then finished by writing its
own success message to that same line. The caveat was true for about 200 ms, after which the app read as
healthy with a silently missing lane. **Guard:** a lasting condition goes to the notice bar through a
dedicated `addNotice()` that survives every filter, pan and later status write; the status line carries
transient progress only. Assert the caveat in the **notice**, never in the status line — an assertion
that reads the status line will pass on a caveat nobody can see.

**A contrast checker that parses a computed colour string is wrong the moment a colour is computed.** `[browser]`
*(2026-08-20, financial inclusion & coverage)* Chrome resolves `color-mix(in srgb, var(--warning) 12%,
var(--panel))` to **`color(srgb 0.906 0.886 0.855)`** — three *floats*. A checker that reads the first
three numbers out of `getComputedStyle().backgroundColor` as 0–255 channels turned a pale warm notice bar
into near-black and reported **1.17:1** on a surface that measures ~14:1; dark mode "passed" by the same
error, in reverse. **Guard:** let the browser do the conversion — paint the colour into a 1×1 canvas over
a known base and read the pixel — probe alpha by compositing over black *and* over white and comparing,
rather than parsing a fourth number that may not be there, and composite the whole ancestor stack rather
than stopping at the first non-transparent one. **A contrast check that is itself wrong is worse than
none, because it is believed.** The same parsing assumption breaks on `oklch()`, `lab()` and
`rgb(from …)`, all of which a modern engine may hand back verbatim.

**A hand-built popup inherits half a theme just as the shipped one used to.** `[app]` `[browser]`
*(2026-08-20, branch & ATM network operations)* MapLibre's own CSS paints `.maplibregl-popup-content`
**white and sets no `color`**, so an app that styles the popup's *text* and not its *card* gets a label
grey measuring **3.11:1 on white — in BOTH modes**, which is the tell: a ratio identical across a theme
switch means the element is not taking the theme at all. On the React path `ensurePopupStyles()` handles
this; a house-pattern app owes the same work. **Guard:** take the card, the text, the edge **and the tip**
from the theme in one breath — the tip is four per-anchor border colours — and measure the popup in the
browser suite, where a first `document.querySelector('td')` will find it before any page table.

**A theme swap must not discard an explicit basemap choice.** `[app]`
Re-pair the basemap only while the user has not chosen one; an unknown basemap id falls back rather than
blanking the map.

**A harness that polls the status line can break out on the app's own initial text.** `[app]`
*(2026-08-23, property peril report)*
The browser driver waited until the status line stopped saying *loading*, and the app's static markup
said `Ready.` — so it broke out immediately and asserted against a page whose module had not yet
executed. `window.__app` was `undefined`, with no exception and no console error to show for it.
**Guard:** have the app raise an explicit readiness flag at the end of `boot()` and poll **that**; never
infer readiness from prose that a static page can already be showing.

**Order the boot so the fit has something to fit to.** `[app]`
*(2026-08-23, property peril report)*
The locator was recentred *before* the reading was computed, so the app's own measure line did not exist
yet and the map opened at a fixed close zoom with the far end of a 2 km measurement off the edge of the
screen. **Guard:** re-run the framing step once the reading exists, and assert in the browser harness
that the fitted bounds actually **contain both ends** of whatever the app's signature draws.

**Four states told apart only by hue lose the two that matter.** `[app]`
*(2026-08-26, humanitarian response map)* A board carrying *covered*, *uncovered*, *not reported* and
*no estimate* reads as two states for a reader who cannot separate the hues - and the two it loses are the
honesty states, so *"nobody reported this"* becomes indistinguishable from *"nobody is here"*, which was the
one failure that product could not survive. **Cause:** colour used as the sole channel for a categorical
meaning whose categories are not ordered. **Guard:** give every non-obvious state a **second channel** - a
hatch in the map fill (`esriSFSDiagonalCross`, `esriSFSBackwardDiagonal`) and a spelled-out word in the
popup, the table and every export - and measure all four against the panel in **both** modes, treating the
measured number as the gate rather than the intention.

**A shell rule for `button[aria-pressed="true"]` repaints a legend row's text to the panel colour — white on white.** `[browser]` `[app]`
*(2026-08-26, facility capacity & catchment)* Legend rows are buttons carrying `aria-pressed` so the
"hidden / shown" state reaches assistive tech. The shell's own
`button[aria-pressed="true"] { background: var(--accent); color: var(--panel) }` then applied to them. An
id-scoped rule overrode the background but not the **colour**, so every legend label rendered in the panel
colour on the panel — invisible. The counts survived, because they carry `--muted` explicitly, so the
legend looked plausible in every DOM assertion and every count was correct. **Only the screenshot showed a
legend with five swatches, five counts and no words.** **Guard:** when a control doubles as a toggle,
re-declare **both** background and colour in the component's own scope, and have the browser suite assert
`getComputedStyle(...).color` against the ground it sits on rather than merely that the label exists.

**The house 40/255 fill alpha exists for OVERLAPPING polygons; on a layer that cannot overlap it just makes the data invisible.** `[app]`
*(2026-08-26, facility capacity & catchment)* A catchment layer is one row per chosen facility × origin
ZIP, and ZIP-area polygons tile the plane — exactly one cell covers any point, ever. At 40/255 over a
light basemap the whole catchment was a faint haze: the app's own signature, unreadable, with every
non-visual assertion green. Raised to **110/255**, uniformly across all classes so the lightness ordering
and the greyscale reading are unchanged. **Guard:** the alpha is a default with a *reason*; check whether
the reason applies to your layer before inheriting it, and state the deviation in the recipe and assert it
in the suite (all classes share one alpha) rather than letting it drift per class.

**Data hues measured against a PANEL can vanish against a dark BASEMAP, and a swatch ring cannot save them.** `[app]` `[browser]`
*(2026-08-26, facility capacity & catchment)* A five-class ramp measured 11.79 and 5.84 against white and
**1.57 and 3.17** against the dark app ground — recorded, and accepted, because the house remedy for a
low-contrast fill is a 1 px ring on the swatch. On the **map** there is no ring: over CARTO Dark Matter
the two darkest classes disappeared entirely and dark mode lost the catchment. **Guard:** keep the rule
that a colour means one thing in both modes, and make it true by compositing the class fills over a light
**plate** (a fill layer beneath them at ~0.22 of the light text colour, switched on with the theme). Put
the same plate behind the legend swatch so the key and the map agree. Assert the plate's opacity in both
modes in the browser suite — the failure is invisible to every other harness.

**One accent hex cannot clear 3:1 over BOTH members of a light/dark basemap pair.** `[app]`
*(2026-08-26, hospital network planning)* The house rule is that data colours stay **identical in both themes**, so a mark means the same thing
in either. That rule holds for fills -- but the **selection halo** is meaningful non-text under WCAG
1.4.11 and has to clear **3.0:1 against the ground it sits on**, and that ground swaps with the theme.
Measured: `#5aa9ff` scores **7.70:1** over a dark basemap and **2.35:1** over a light one -- a fail no
panel-based contrast table catches, because the halo is never on a panel. The theme spec itself had
already implied the answer by quoting the halo as *two* numbers. **Guard:** split the rule. Data **fills**
keep one hex in both modes and carry a dark **stroke** for their boundary, which reads on both grounds;
selection, focus and hover affordances that sit over the basemap take a **per-mode** hex, and the suite
recomputes both ratios from the theme file. Assert the negative too -- that a single hex could *not* have
cleared both -- so the pair is not "simplified" away later.

**A label drawn over a bar has a ground that is another token, not a surface — so a
token-against-surface contrast table cannot see it.** `[app]` *(2026-09-03, tenant mix & catchment)*
Forty measurements of every informational token against both surfaces in both modes passed at a floor of
6.07:1, and the app still shipped dark-on-dark text: the chart's category labels were drawn *inside* the
bars, so each label crossed **two** grounds — the pale track behind the bar and the saturated fill of the
bar itself. No surface measurement covers that, and no non-visual assertion sees it. A phone-width
screenshot made it obvious.

**Guard:** enumerate every *ground* a token is drawn on, not every surface. Where a label crosses a
boundary, **draw it twice**: one copy on the track and a second copy inside the fill element, whose own
`overflow: hidden` clips it exactly at the bar's end at any width. Give the clipped copy its own token
(white in light mode, the app background in dark) and **measure that token against each fill** — four
more measurements, which took this build's set from 40 to 44. In the browser suite, assert that the two
copies share a left edge, that the inner one is clipped to the fill, and that their computed colours
differ; a single-copy label passes all three trivially only if you forget the third.

## 9 · Suites and verification

**An unencoded `/../` is not a traversal test — the browser resolves it before the request is sent.**
`[app]`
*(2026-09-07, facilities & space utilisation)* A browser-driven traversal probe fired `fetch("/../../server.mjs")` and got **200**, which
looks like a failed guard. It is not: the URL is resolved against the origin **in the page**, so the
server receives `/server.mjs`, a file that is legitimately inside the served folder. Only
**percent-encoded** segments (`%2e%2e%2f`, `%2e%2e%5c`) survive to reach the handler — which is exactly
why the guard must decode **before** it normalises. Worth knowing alongside it: `node:path` collapses a
leading `..` past the root, so `/%2e%2e%2f%2e%2e%2fpackage.json` normalises to `/package.json` and 404s
inside the folder rather than escaping. **Guard:** test with encoded payloads only, assert the refusal
**and** that a legitimate file is still served, and clear the suite's failed-request tally afterwards —
those deliberate 404s otherwise poison the clean-console assertion.

**A resize helper shared by a left-docked and a right-docked panel needs a direction, or one of them
shrinks when you drag it bigger.** `[app]`
*(2026-09-07, facilities & space utilisation)* Generalising one `resizable()` across the result card, the map drawer (both right-docked) and
the legend (left-docked) inverted the card: the same drag that had widened it now narrowed it, and the
arrow keys went with it. This file already records *pointer-and-keyboard-disagree-about-direction* twice;
this is the sibling — **panel-and-panel disagree about direction**, from one helper with one hard-coded
sign. **Guard:** take the dock edge as a parameter, apply it to the pointer delta **and** to the key step
in the same expression, and assert in the suite that the *same intent* — "make this bigger" — grows every
panel, whichever edge it is docked to.


**A DOM stub's `dataset` must WRITE THROUGH to the attribute, or the harness quietly tests nothing.**
`[app]`
*(2026-09-07, facilities & space utilisation)* The app builds its control cluster with `b.dataset.ctl = key` and the suite reads
`[data-ctl]` — which in a real DOM is the same storage. The stub modelled `dataset` as a plain object, so
the attribute stayed empty and an assertion on the six glyphs' order compared `",,,,,"` against the
expected string. It failed loudly here; the same gap on an assertion phrased as "no row is missing its id"
would have passed for the wrong reason. **Guard:** model `dataset` as a proxy that mirrors into the
attribute map (and have `setAttribute` mirror back). The house rule stands — **the harness accommodates
the app, not the reverse** — and the corollary is that a stub which silently drops a write is worse than
one that throws.

**A deliberate `Page.navigate` aborts every request in flight, and the clean-console guard reads that as a
failed request.** `[app]`
*(2026-09-07, facilities & space utilisation)* A browser suite that navigates more than once — to test a deep link, or to load the page at
phone width — collects two `net::ERR_ABORTED` entries from `Network.loadingFailed` that are entirely its
own doing, and the "no failed network request" assertion goes red on a healthy app. **Guard:** clear the
failure tally **at each navigation** rather than filtering `ERR_ABORTED` out by error text. Filtering by
text would also hide a real abort from the app; clearing at a known, deliberate boundary does not.


**A guard can match the app's own sentence FORBIDDING the thing it guards — and stripping comments does
not help, because the sentence is user-facing prose the app needs.** `[app]`
*(2026-09-07, development pipeline tracker)* Fourth and fifth occurrences of a trap this file already
records twice for `proxy` and once for `createConnection`, and the first where comment-stripping is no
defence. A check that the app builds no committee-style export document grepped the shipped source for
`committee` and matched its own empty-lane statement — *"a generated project cost is the one number an
investment committee would act on."* A check that no geocoder is called grepped for `geocode` and matched
the coverage table's *"six statewide rows geocode into Puerto Rico"*, a line that exists **because** the app
geocodes nothing and reports the publisher's six bad matches instead. Both guards were "passing" only in
the sense that they were failing loudly for the wrong reason. **Guard:** an honesty check that scans text
is testing vocabulary, not behaviour. Assert the behaviour — that the only export entry points are the two
named functions and the only modal is the dismissible splash; that no URL matches a real geocoder API shape
(`findAddressCandidates`, `GeocodeServer`, `nominatim`, `photon`) rather than the English word. Where a
textual scan is genuinely the only option, scan for **API shapes and identifiers**, never for the domain
noun the app is obliged to discuss.

**A status line that reports the app's INTENTION rather than the map's state will confidently describe
an empty map.** `[app]`
@@STAMP@@ The readout said **`540 of 540 jurisdictions drawn`** while not one polygon was installed, because
it counted the jurisdictions whose class passed the legend filter — a fact about application state that
stays true when the map layer does not exist. This is the readout that `building-apps.md` §4 asks for
precisely so that a support question becomes a glance, and it was the thing most confidently lying.
**Guard:** derive the readout from the **map** (`map.getLayer(id)` present, features rendered), and give it
an explicit `MAP LAYER NOT INSTALLED` state distinct from a count. Refresh it on every render, not only on
the events that happen to call it, or it describes a previous state. Then assert in the browser suite that
the status text does **not** report a count while the layer is missing.

**The pointer path and the keyboard path of the same control can disagree about direction, and only a
harness that drives both will notice.** `[app]`
@@STAMP@@ A resize helper resolved which edge a panel's grip faces **inside** `apply()`. The pointer handler
passed a raw delta and was correct; the keyboard handler applied the same sign itself before calling
`apply()`, so the right-hand rail's `ArrowLeft` **narrowed** the panel that dragging left widened. Both
paths "worked"; they simply did opposite things. **Guard:** drive every affordance through **both** its
pointer and its keyboard path in the offline suite, against the same element, and assert the direction
rather than only that the size changed. Resolve a sign in exactly one place.

**A spreadsheet is a service with worse manners — probe it the same way.** `[data]`
*(2026-09-07, portfolio & asset register)* One published inventory carried **148 completely blank trailing
rows** inside its row count (a 2.0 % overstatement of the population), **one String among 7,367 Integers**
in a numeric column, and **235 rows already past the date the column is used to filter on**. None of that
is visible from a header, a column count or a type declaration, and a bulk file invites more trust than a
service because it arrives as one artefact with a name and a date. **Guard:** apply the full seven-step
probe to a bulk file exactly as to a service — count the **real** rows rather than the sheet's, check types
**row by row** rather than from the header, look for duplicates and sentinels, and give every date
predicate a **lower** bound as well as an upper one.

**A regex over XML whose attribute group is GREEDY eats the slash of a self-closing tag, falls through to
the open-tag branch, and swallows the next element whole.** `[app]`
*(2026-09-07, portfolio & asset register)* A zero-dependency `.xlsx` reader matched cells with
`/<c([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g`. On `<c r="U2" s="5"/>` the greedy `[^>]*` consumed
` r="U2" s="5"/`, the `>` branch then matched, and the lazy body ran forward to the **next** `</c>` —
consuming the neighbouring cell and its value. Every empty cell therefore deleted the cell after it. The
file still parsed, every row still had the right column count, the date columns were right, the
square-foot total was right **to the byte**, and the annual-rent total came out at **$5,548,683,056**
against a true **$5,838,396,051**: a 5 % error, entirely plausible, with no error anywhere. **Guard:** make
the attribute group **lazy** — `[^>]*?` — so the engine tries `/>` at the earliest position, and apply the
same fix to every self-closing tag in the format (`<row/>`, `<xf/>`). Then assert a **total you already
know from another tool** before trusting the reader; a shape check would not have caught this.

**A guard can match the sentence saying the thing is absent — three times in one build.** `[app]`
*(2026-09-07, portfolio & asset register)* Already recorded in this file for `proxy` and for
`createConnection`. It happened three more times in a single app, and the pattern is worth stating as a
rule rather than as a list of victims. A money guard `/rent|value|price|cost/i` matched **`rentable_sf`**,
an area column, and reported a clean estate as carrying money. An identity guard `/owner|lessor/i` matched
the tenure label *"1000 — no constraints, private ownership"*, which is a **published classification code**
the application is required to print. And a popup guard on `lessor` matched the popup's own disclosure that
the asset *"carries no lease number and no lessor."* **Guard:** scan **field names and data**, never prose.
Anchor name-level guards on whole words (`/^(.*_)?(rent|value|cost)(_.*)?$/`), collect the bound field list
and test that, and where a claim really is about text, strip the explanatory block first — or assert the
behaviour instead. And **negative-test every guard**: each of these three was written to fail closed and
each passed the thing it was meant to catch.

**A read date compiled into the source is a lie with a delay, and a suite that freezes a live count goes
red on a Tuesday for no reason.** `[app]`
*(2026-09-07, transaction evidence build, re-run four days after it was verified)* An app over a file that
gains rows daily exported `READ_DATE = "2026-09-03"` from its domain module and printed it beside every
figure — the status line, the rail, the exported note. Four days later the app fetched **57,524** rows at
boot and labelled them *read 2026-09-03*. Nothing failed: the constant was correct on the day it was
written, and the whole product rested on carrying an honest vintage. Its three suites had the mirror of the
same defect. Five browser assertions were frozen to counts from that day — `1,237` parcel rows,
`1,060` instruments, `239.2 %`, `2,000 of 4,726 rows listed` — so the suite reported **five failures on an
app that was behaving correctly**, and the reader's next move is to stop believing the suite. The live
suite, whose header already said counts must be asserted as shape, was the only one of the three that
survived the file moving.
**Guard, both halves.** A provenance date is a **fact about the read**, so stamp it when the read happens
(`S.readDate = opts.readDate ?? isoDate()`) and let a suite pin it for determinism; keep the date the
layer's *shape* was verified as a separate constant and say which is which on the face of the app. And
assert a moving file **relationally**: ask the service for the count at run time and require the screen to
agree with it, derive a percentage from the two numbers printed beside it, and match `n of N` against the
panel's own uncapped N rather than a literal. Both are stronger checks than the frozen ones — they prove
the number on screen came from the file rather than from the page.

**A `getBoundingClientRect` check cannot see clipping by an ancestor with `overflow`, so "is it on
screen?" passes on a layout where it is not.** `[app]`
*(2026-09-03, parcel record coverage)* A browser assertion guarded the rule that an app must open on a
view where its own signature is visible: it compared each panel block's rect against `window.innerHeight`.
The rect reports where an element **would** be; an ancestor with `overflow:auto` clips it without changing
that rect by a pixel. So a table scrolled out of its own container reported as on-screen and the assertion
passed on the very defect it existed to catch — which the screenshot then showed plainly.
**Guard:** test visibility against the **scroll container's** box, not the viewport's, and take the
screenshot anyway. Rects describe geometry; only pixels describe visibility.

**A rule that says "always visible" cannot be delegated to scroll position.** `[app]`
*(2026-09-03, parcel record coverage)* A privacy banner was specified as *always visible, never a
disclosure behind a click*. It was placed at the foot of a scrolling panel body, where at the app's own
opening size it sat 910 px down an 845 px viewport — visible only after a gesture, which is what the rule
forbids. **Guard:** a block the design calls permanent belongs **outside** the scrolling region — pinned
to the panel, in its own flex child — and the browser suite asserts its rect is inside the viewport at the
default window size, not merely that it is present in the DOM.

**A privacy scanner that greps raw response text fires on the protocol's own vocabulary.** `[app]`
*(2026-09-03, parcel record coverage)* A suite recorded every network response and grepped it
case-insensitively for twelve excluded owner-identity field names, one of which is `NAME`. It reported a
disclosure. There was none: ArcGIS names its own schema key `"name"`, so `{"name":"APN_DASH"}` appears in
every query response, and one county's `displayFieldName` is literally `SUB_NAME`. A suite that cries wolf
here is worse than none, because the next real hit gets waved through. **Guard:** scan what a response
**carries**, not how its text reads — the keys of each feature's `attributes`, the `fields[].name` list
and `fieldAliases` — and pair it with a **negative control**: a deliberate request for the excluded fields
that must come back carrying them. A green privacy assertion with no negative control cannot distinguish
*nothing leaked* from *the scanner is broken*.

**A live suite that lets one slow service reject kills the run and reports nothing.** `[app]`
*(2026-09-03, parcel record coverage)* An `outStatistics` count over 2.4 million rows exceeded a
60-second deadline once in five runs. The rejection propagated out of an unguarded `await`, Node exited on
the unhandled error, and ninety assertions that had already passed were never summarised — the operator
saw a stack trace where a report should have been. **Guard:** a live harness catches its own transport
errors, retries a timeout once or twice with a backoff, and converts a persistent one into a **red
assertion**. A suite exists to report; a suite that dies has not reported.

**A spec that states its own threshold twice will state it differently.** `[app]`
*(2026-09-03, parcel record coverage)* A design document defined a class as *"= 95 % populated"* in its
state table and, two paragraphs later, *"It is 50 %."* The two are not interchangeable: at 95 % three
cells measured at 90.91 % change class, and the resulting matrix contradicts the same document's own
per-county table. Arithmetic settled it — only 50 % reproduces the recorded matrix.
**Guard:** put an authored threshold in **one** place, in code, and make the suite prove the claim made
about it. Here the claim was that the choice is inert because no measured rate falls between 13.86 % and
90.91 %, so the suite rebuilds the whole matrix at 20 %, 80 % and 95 % and asserts that only the last one
differs. That is a test of the argument, not of the number.

**`--use-gl=swiftshader` leaves part of the map viewport UNPAINTED — a false visual that looks exactly like
a real defect.** `[browser]`
*(2026-09-02, site selection - the swing slate)* A headless screenshot showed a clean rectangle of bare
container background inside the map — 16-17 % of the viewport, hard-edged, present in both themes. It
survived a forced `resize()` and `triggerRepaint()`; `areTilesLoaded()`, `loaded()` and `isMoving()` all
reported healthy; `elementFromPoint` returned the canvas at its full correct size; and the style declared a
`background` layer that should have painted everywhere. It is the software rasteriser. Measured across three
renderers on the same page: `--use-gl=swiftshader` **17.2 %** bare, `--use-angle=swiftshader` **1.3 %**, real
GPU **1.3 %**. Note that `--disable-gpu` **overrides** `--use-angle` and puts you back on the bad path.
**Guard:** drive with `--use-angle=swiftshader --enable-unsafe-swiftshader` and **no** `--disable-gpu`, so
that a screenshot you judge is worth judging. And because a genuine version of this symptom is invisible to
every DOM assertion, decode the screenshot inside the harness and assert that the map paints its viewport:
sample the map's box and require that almost none of it equals the container's own background colour. A PNG
reader is about forty lines against `node:zlib`.

**Assert the product's CLAIM, not the code's behaviour — a solver can satisfy its own predicate and still be
wrong.** `[app]`
*(2026-09-02, site selection - the swing slate)* A sensitivity solver searched for the smallest weight change
making `score_b >= score_a`, which is the published form of the method, and its own unit tests passed. The
live suite instead asserted the *claim the app prints* — "applying this change reverses this pair" — and
caught it at **3 of 4**: two candidates sharing a nearest measurement carry identical normalised inputs, so
driving that weight to its limit makes the two scores **exactly equal**. The pair ties; it does not reverse,
and the chip promised a reversal the user would never observe. **Guard:** where a tool prints a promise about
what will happen, the suite must **apply the change and check the promise**, not check that the solver
satisfied its inequality. Pair it with the negative: assert that **half** the predicted change does *not*
produce the effect, which is what makes the reported margin a threshold rather than a label. Use a strict
`>` with a tolerance where a boundary case means equality, and report "no change achieves it" rather than
reporting the boundary.

**`@strata/export` composes a map, a single feature report and an atlas — but not a multi-row register.** `[core: open]`
*(2026-09-02, land bank & acquisition screening)* `composePrintHtml` takes a map image plus pre-built
legend HTML; `featureReportHtml` handles **one** feature; `composeAtlasHtml` gives one page per feature.
A "tray of findings" document — a screening memo, a disclosure sheet, an evidence list — is none of those,
so it is app-local and reuses `legendHtml` / `scalebarSvg` / `printLayoutCss`.

**A candidate for core:** a `composeRegisterHtml(rows, scope)` primitive. Those three documents are the
same shape — an unordered list of rows, each with a verdict, a source and a vintage, under a scope block —
and three separate builds have now written it by hand.

**A browser harness that queries a layer before it exists manufactures the very errors it is about to
assert are absent.** `[app]`
*(2026-09-02, land bank & acquisition screening)* Once the app accumulated `map.on("error")` into state so
the suite could assert it empty, the assertion failed — with five copies of *"The layer 'counties-fill'
does not exist in the map's style and cannot be queried for features."* The app had not erred. The
**harness** had: its boot-poll and its paint-settle loop both called `queryRenderedFeatures` on the app's
layers during boot and during a `setStyle`, when those layers are legitimately absent.

**Guard: `if (!map.getLayer(id)) continue;` in every polling helper.** A harness that reads state has to
be at least as careful as the app it is judging, or its own noise becomes the finding.

**Comparing `queryRenderedFeatures` counts across an interaction requires the camera to be identical.** `[app]`
*(2026-09-02, land bank & acquisition screening)* An assertion that a legend click removes features from
the map compared 237 before with 288 after, and then 8 after clearing the filter — all while the filter was
working perfectly. `queryRenderedFeatures` reports what is on **screen**, and the previous section had left
the map mid-flight from a `fitBounds`; a "wait until the count is stable" loop happily locks onto a plateau
during an animation.

**Guard: `jumpTo` a fixed camera before each reading, then wait on `!isMoving() && !isZooming() &&
areTilesLoaded()` before counting.** And assert the source data changed as well as the render — the source
proves the filter is a real definition change, the render proves it reached the screen.


**A guard can match the hostname of the thing it is guarding.** `[app]`
*(2026-08-24, health equity overlay)* An assertion enforcing "no bound service is on the 2020 tract
vintage" tested `/CES5|SVI|2020/i` against each service URL. It failed — on `services5.arcgis.com`, the
host of the **2010** geometry spine, because the host `services5.arcgis.com` contains the substring `ces5`. This is the
existing *a guard can match the file it guards* trap wearing a hostname. **Guard:** match whole path
segments (`/(^|[/_-])(CES5|SVI|2020)([/_-]|$)/`) and test `new URL(u).pathname`, never the whole URL; and
prefer asserting a property of the **data** over a pattern in a **string** wherever one exists.

**Rewrite a "never mentions X" guard as behaviour the moment X becomes legitimate anywhere.** `[app]`
*(2026-08-24, health equity overlay)* A rule said a coded field "may never become a filter, a symbology
class or a gate", and the suite enforced it by grepping the source for the field name. Once the field's
code book became retrievable the field legitimately appeared in the record pane and in the export, and
the textual guard went red on correct code. The replacement asserts the *narrow role* instead: flipping
the flag between its two measured codes changes nothing the scope predicate selects, the compiled map
filter never names it, and the renderer never keys on it — while one assertion confirms the single thing
it is allowed to decide. **Guard:** a prohibition expressed as a string search expires; expressed as
"this input cannot change that output", it does not.

**A DOM stub that appends text to its parent loses every interleaved text run.** `[app]`
*(2026-08-24, health equity overlay)* The stack-based parser wrote character data to
`stack.at(-1).text`, so `showing all <b>50</b> tracts` produced children `[<b>]` and a parent whose own
text was discarded — `textContent` read `"50"`. Every assertion about a sentence with a bold number in
it — which is most of an honesty surface — was testing the wrong string. **Guard:** make text a **child
node** (`#text`) like any other, so document order is preserved, and unit-test the parser itself on
interleaved markup before trusting it to test the app.

**A stub that defaults every element to `hidden:false` opens the app's drawers for it.** `[app]`
*(2026-08-24, health equity overlay)* Bare boolean attributes in the shipped markup (`<div id="drawer"
hidden>`) were not reflected into the stub, so the drawer, the table window and the method panel all
started **open**. The first `Esc` closed a drawer nobody had opened, and the Table button *closed* the
table. Both read as app defects. **Guard:** reflect bare boolean attributes from the parsed markup
(`this.hidden = "hidden" in attrs`) — the initial state in the HTML is real state, and a harness that
invents a different one tests a different app.

The three-harness standard and its rationale live in
[`guide/building-apps.md`](guide/building-apps.md) §3; the manual browser checklist is
[`maintainers/testing/browser-smoke-test.md`](maintainers/testing/browser-smoke-test.md). The traps:

**A markup-grepping suite cannot see whether the app runs.** `[app]`
A duplicate `const` introduced a SyntaxError, so the inline module never executed and the page rendered as
a blank shell — and the offline suite found every string it expected and reported **99/99 green**.
**Guard:** `node --check` the shipped module before asserting anything about it, and negative-test that
guard — inject a duplicate `const` and confirm the check fails and names the line. A guard nobody has
watched fail is a guard nobody knows works.

**A suite that greps markup and asserts numbers cannot see what a screen means.** `[app]`
297 passing assertions missed four defects that one screenshot made obvious — all semantic or spatial.

**A backslash escape inside a template literal never reaches the browser.** `[app]`
*(2026-08-17, concentration & exposure analyzer)*
A CDP driver passes its expression as a JS **template literal**, so a lone `\s` in
`evaluate(`… .replace(/\s+/g, " ") …`)` is consumed by the literal and the browser evaluates `/s+/g`
— which deletes every letter *s* from the text under test. The assertion failed against `"expo ure"`,
which reads like an app defect and is not one; worse, the same silent mangling makes a *passing*
assertion meaningless whenever the pattern is used to normalise rather than to match. **Guard:** double
every backslash inside a driver template literal, and prefer sending a plain function body over building
patterns and selectors by interpolation.

**A trap asserted as PRESENT can stop reproducing — and that is a finding, not a failure.** `[app]`
*(2026-08-17, concentration & exposure analyzer)*
A recipe recorded a host that answered **403 to `Mozilla/5.0` and 200 to `curl`** — a User-Agent WAF
verdict, and the reason its first 58-request pull returned 0 of 58. Re-probed on the build date from a
different network, **all four User-Agents returned 200**. The guard in the build script (send a
non-browser User-Agent) costs nothing and stays; the *assertion* must not hard-code the 403, or the suite
goes red for a service that got better. **Guard:** assert a trap in the form "this still behaves as
recorded, or it has changed and here is how", record the re-verification date, and never quietly delete
the workaround — an intermittent WAF verdict is not a repealed one.

*Second instance, and this one had been recorded as a hard rejection:*
*(2026-08-20, fraud / AML geo-dashboard)* A recipe rejected `federalregister.gov`'s own `raw_text_url`,
`body_html_url` and `full_text_xml_url` outright, because on 18 August all three answered a
**byte-identical CAPTCHA page at HTTP 200** while the metadata API that handed out those URLs worked
fine. Re-probed twice per URL two days later, all three serve the document. The build was unaffected —
it had already taken the text from a second publisher (govinfo) at build time — which is the actual
lesson: **prefer a second publisher over waiting for a wall to lift**, and write the suite so the day it
lifts is reported as a change rather than asserted as though it still held.

**"Visible" means visible to a reader — check the clipping ancestors, not just the window.** `[app]`
*(2026-08-12, broadband gap matrix)*
A browser-suite visibility helper compared `getBoundingClientRect()` against the viewport only, so an
element scrolled out of its own `overflow:auto` container measured as visible. The app opened with the
matrix band 30 px too short and its **amber "nobody measured" row — the entire finding — below the
fold**, and the assertion written specifically to catch that passed. The screenshot did not.
**Guard:** walk every scrolling ancestor and intersect; and where a region must fit its content,
size it from the content's measured height rather than an authored constant, because a constant
cannot know how tall the rows render at the reader's font size.

**An "offline" suite is only offline if EVERY call routes through the injectable seam.** `[app]`
One function reached for the module-level `net` instead of the injected one, so the offline harness
silently geocoded against the live internet — it returned a real place for a synthetic fixture, which is
the only reason anyone noticed. A suite that quietly depends on the network is not deterministic and its
green is worth nothing. **Guard:** hold the seam in state (`S.net`), never a module-level default, and
assert in the offline suite that a synthetic fixture produces synthetic answers. *(nearby)*

**Assert behaviour, not prose — and strip comments before you scan.** `[app]`
A keyless-basemap guard grepped `server.mjs` for `proxy` and matched the file's own explanatory comment.
**It happened again**, in a later build, to a guard checking the same file for `createConnection` — which
appeared only in the sentence declaring that the server does not use one. Assert that the server opens no
sockets, and strip comments from the source before any textual scan. Twice is a pattern: a doc entry does
not prevent this, the assertion does. *(pipeline, nearby)*

**A guard can match the DISCLAIMER that denies it.** `[app]`
*(2026-08-20, fraud / AML geo-dashboard)* The entry above is about scanning source; this is the same
shape one level out, on rendered text, and it is worse because the sentence that matches is one you were
right to write. An app forbidden from showing a customer risk score says so in its notice bar — *"not a
customer risk score"* — and the boundary assertion scanning the rendered page matched that. Its exported
case pack ends *"No person, account number, card number or street address appears in this document"*, and
the export's privacy assertion matched **that**. Both guards were checking exactly the right thing and
both were reading the app's own denial as the offence. **Guard:** strip the disclaimer before the scan —
remove `not a/an/the X` clauses from page text, and cut the known footer out of an exported document —
then scan what is left; and keep the positive assertion (that the disclaimer *is* present) as a separate
line, so removing the disclaimer cannot silently make the negative one pass.

**A DOM stub that parses `<script>` as markup makes the app's own source part of the "rendered page".**
`[app]` *(2026-08-20, fraud / AML geo-dashboard)* An offline harness mounts the page's real `<body>` —
which contains the inline module. A stack-based parser that treats `<script>` like any other element
turns every `'<div class="rc-big" id="rc-rate">'` **inside a JS string literal** into a real node in the
stub's tree, and every `//` comment into page text. `getElementById("rc-rate")` then finds an element the
app never rendered, and a boundary scan of `body.textContent` reads the source code — so two guards
failed against the comment explaining the code they were guarding. **Guard:** `<script>` and `<style>`
are **raw text**: consume to the close tag without parsing, and exclude them from `textContent`. Then
assert an element that only exists in one render state is genuinely absent in the others.

**`queryRenderedFeatures` answers about the LAST PAINT, not about the state you just set.** `[app]`
*(2026-08-20, fraud / AML geo-dashboard)* `setFilter`, `setData` and a population swap all take effect on
the next frame. A browser assertion that sets state and queries immediately reads the *previous* frame,
so "the legend isolate did not filter the map", "the empty lane still draws cells" and "the cells are
gone after the theme swap" were all the harness judging a stale paint — three plausible app defects,
none real, each costing a diagnosis. **Guard:** settle on the map's own `idle` event (with a timeout)
before every rendered-feature assertion; do not substitute a longer `sleep`, which is the same bug with
a wider window.

**A build that re-pulls a live register cannot claim byte-reproducibility.** `[app]`
*(2026-08-23, fraud / AML geo-dashboard)* A seeded generator is only reproducible given the same inputs,
and one of its inputs was a live federal register the build re-fetched on every run — and hard-asserted:
`if (estate.length !== 5384) die(...)`. Three days after the reproducibility test passed byte-for-byte,
the register republished (5,384 → 5,381 offices, index `locations_20260814090007` →
`locations_20260821090006`) and the *same* test failed, along with the build itself, for a service that
had done nothing wrong. The seed was never the problem: the snapshot was an undeclared input pretending
to be a constant. **Guard:** cache the raw response beside the other frozen inputs (`build-cache/`) and
reuse it, so a rebuild is reproducible by construction and taking a newer snapshot is a deliberate act
(delete the file); make the build **report drift** against the recorded figure and stop only on a
material move; and have the suite compare the live register against what **provenance records**, never
against a number written in the test. Then rebuild on the new snapshot when you mean to, and re-date the
whole artefact — every generated figure moves with it.

**A fixed sleep is not a wait — and a slow host reads exactly like a broken one.** `[app]`
*(2026-08-20, fraud / AML geo-dashboard)* A basemap thumbnail assertion waited 2.5 s and reported 4 of 5
loaded. The fifth was OpenTopoMap, which answers a tile in **2.7–4.5 s** from this network — measured,
not guessed. A 404 and a slow 200 are indistinguishable to a one-shot check, and the failure reads as a
defect the app caused. **Guard:** poll to a deadline rather than sampling after a guessed interval, and
when a host is simply slow, record the measured latency in the app's honest limits instead of tightening
the test until it passes.

**A retry added to the app does not cover the suite's own probes.** `[app]`
*(2026-08-12, broadband gap matrix)*
After a long run was killed by one transient timeout, a bounded retry went into the domain's fetch
helper — and the next run died at the **first** request with `UND_ERR_CONNECT_TIMEOUT`, because the
suite's own `raw()`/`j()` helpers called `fetch` directly and bypassed it entirely. The host was fine:
five probes answered 200, but its connect latency swings 0.3–3.7 s against undici's 10 s default.
**Guard:** when you add resilience, enumerate **every** path that talks to the network — the domain,
the suite's probes, and the CORS/preflight checks — and fix them together. A partial fix reads as a
fix and fails in a new place.

**The harness accommodates the app, not the reverse.** `[app]`
An id-only DOM scan broke on ordinary descendant selectors; a flat tag-only parse returned `""` from
`textContent` so a passing app read as a failure. Both were replaced with one stack-based parser used for
the body *and* every dynamic `innerHTML`. The harness must also mount the page's real `<body>` and model
`window` as the global object.

**The MapLibre stub must be faithful where the bugs live.** `[app]`
`setStyle` fires `styledata` synchronously and *then* drops every source and layer; a finished render
fires `idle`, so `idle → hydrate → paint → setData → idle` is a real loop.

**Derive counts from state; never hardcode them.** `[app]`
A hardcoded constant meant adding a row silently moved the number on the splash screen — and a test
asserting the constant was itself wrong.

**Regex word boundaries are not semantic boundaries.** `[app]`
A role-tagger matched `\bfass\b` against `CalifAssemSenDists`. *(2026-08-16, collateral & portfolio
risk)* And an unanchored one is worse: a guard asserting an app ships no scenario control searched for
`horizon` and matched **`horizontal`** in the resize helper, reporting a control that does not exist.
In the same suite a guard for `EADDRINUSE` scanned the server source *after* stripping string literals,
so the identifier it was looking for had been removed by its own preprocessing and the guard could never
pass. **Guard:** anchor with `\b`, and where a behaviour can be exercised, exercise it — the port check
became "start two servers on one port and assert the second steps past", which cannot be fooled by
either mistake.

**A CDP screenshot of a WebGL canvas can be stale in a way the canvas itself is not.** `[browser]` `[app]`
*(2026-08-17, climate-risk regulatory reporting)* Headless Chrome with `--disable-gpu` composites a
WebGL canvas into `Page.captureScreenshot` from a stale surface. A rectangle covering a third of the map
came out **blank in every screenshot** while an in-page `getImageData` of the *same rect* read mean 196,
min 74, max 254 — fully painted. Because the house rule is that the first paint is confirmed by a
screenshot, this sent an hour-long search for a rendering bug that did not exist. **Guard:** read the map's
own pixels from **inside the page** (`drawImage` into a 2D canvas, then `getImageData`) when asserting
that something is painted; and for the screenshots a human will actually look at, rasterise in-process
(`--use-angle=swiftshader --enable-unsafe-swiftshader --in-process-gpu`, dropping `--disable-gpu`) and
force a frame plus two `requestAnimationFrame`s before capturing. **A harness that sometimes lies is
worse than one that fails.**

**A flat canvas cell is not a blank one — open water is legitimately one colour.** `[app]`
*(2026-08-17, climate-risk regulatory reporting)* A pixel guard that required variation in every cell of a
grid over the map failed on four cells of open Pacific, which CARTO Positron paints as a single uniform
colour. Loosening it to "flat **and** paper-white" keeps the defect it was written for — the page showing
through where nothing painted — without failing on the sea. **Guard:** where a visual property can be
legitimately uniform, assert the *combination* that only a defect produces, and carry the real coverage
claim on a check a palette cannot fool (project known places, require a feature rendered at each).

**A fixed `sleep` after boot makes a browser suite flap.** `[app]`
*(2026-08-17, climate-risk regulatory reporting)* 629,000 vertices of published geometry take a variable
time to tile. One run reported `"no layer"` on **every** operational layer and five 0×0 basemap
thumbnails; a re-run of identical code passed 146/146. **Guard:** wait on conditions, never on a clock —
style loaded, layers added, a non-zero rendered count — and where a third-party demo tile server is
involved, assert the pair the app itself uses and *report* the rest rather than failing on somebody
else's latency.

**The `time-player` silhouette's own signature element is not in the widget registry.** `[core: open]`
*(2026-08-30, ATM cash & service routing)* `TimeSlider` ships as a control in `@strata/core-map` and as a
plugin, and it is tested — but `defaultWidgetRegistry` (`react/app/registry.ts`) has **no `time-slider`
entry**, and `map.controls` has no time flag either. Verified against `strata/packages` on this date:
the registry carries `date-filter` and not `time-slider`. So a recipe assigned the `time-player`
silhouette **cannot author its dominant element in a JSON `AppLayout`** — it must register the control
app-locally via `mergeRegistry`, or fall back to `date-filter` and lose the motion, which is the one
thing that silhouette is chosen for. **Guard:** before assigning `time-player`, decide which of the two
you are shipping and say so in the recipe. **Proposed fix:** add `"time-slider": TimeSlider` to the
registry and a `map.controls.timeSlider` flag — the component and its tests already exist, so this is a
registry line rather than a build.

**`kpi.delta` is a static prop that the live `stat` path never computes.** `[core: open]`
*(2026-08-30, ATM cash & service routing)* `KpiCard` computes `value` from `source` + `stat` and takes
`delta` / `deltaLabel` as **plain numbers passed in by the author** — verified in
`react/widgets/KpiCard.tsx` on this date. Any design whose headline **is a change** — proposed vs
committed, this quarter vs last, before vs after — therefore either ships two cards and makes the reader
subtract, or writes a widget. For the one number an app exists to publish, making the reader subtract is
a real loss. Same class as the already-recorded `stacked-bar.series` gap: **a widget with a data-shaped
prop and no source path**. **Guard:** when a headline is a delta, check the widget actually derives it
before authoring it. **Proposed fix:** an optional `deltaStat: { field, op, where }` computed from the
same source.

**A liability guard that bans a word also bans its denial.** `[app]`
*(2026-08-17, climate-risk regulatory reporting)* A suite asserting the words "compliant", "approved",
"certified" appear nowhere went red on the app's own disclaimer — *"nothing here is reviewed, approved or
filed"*, which is the sentence that makes the app safe to hand to anyone. **Guard:** assert the word never
appears **as a claim** — check each occurrence sits inside a negation — and separately assert the denial
is present. Banning the string bans the safety statement along with the danger.

**A test can assert its own mistake, and pass for years.** `[app]`
*(2026-08-17, climate-risk regulatory reporting)* Two assertions in one suite were wrong rather than the
app: one expected an "evidenced" count to move when a source was blinded that the evidenced item does not
cite; another asserted a layer was rendering that the current view deliberately hides, and passed only on
the runs where a deep link had not yet applied. Both looked like app defects for as long as it took to
read what the app actually binds. **Guard:** when an assertion fails, check what the app is *supposed* to
do before changing it — and prefer assertions that read the app's own state (which layers are active
*now*) over ones that hard-code a name.

**A noisy console is where a real error goes to hide.** `[app]` Fix the favicon 404.
A dropped third-party basemap tile is a **network** event, not a defect: filtering console errors to
script errors plus **same-origin** resource failures stops a CDN hiccup flapping the suite while still
failing on a file the app itself is missing.

**`timer → refresh` is declared and never fires.** `[core: open]`
*(2026-08-18, branch & ATM network operations)* A `{"trigger":"timer","action":"refresh"}` connection is
accepted by the schema and does nothing. The trigger type, `TimerSource` and the `refresh` dispatcher all
ship, but `<StrataApp>` does not mount a `TimerSource` from a `timer` connection and does not supply the
`onRefresh` callback. **Guard:** express near-real-time as `refreshIntervalSeconds` on the layer — **and
know that it is honoured only for `arcgis-feature` and `strata` sources, not for `geojson`**, so a
template whose data is a build-time GeoJSON has no auto-refresh at all and must say so rather than
implying a live feed. A visible as-of stamp is the honest companion either way.
*(2026-10-21, lifeline board build)* **An interval is not a clock boundary.** Even a working `timer` fires
every *n* seconds from mount. Operational periods (12 h from 07:00 and 19:00 America/Los_Angeles) need a
trigger anchored to the **wall clock in a named time zone**, across DST: 2026-11-01 has a 25-hour day. No
trigger expresses that. *Current guard:* app code computes the next boundary from an injected clock and
re-arms after each one; the suites cross the DST change on a fixed clock. *Fix:* a `TimerSource` option
`{ at: "07:00", timeZone }` (or `every: "12h", anchor: "07:00"`).

**A declared action type does not mean there is a dispatcher — and `export` is the one with none.** `[core: open]`
*(2026-08-18, branch & ATM network operations)* An `[Export …]` button wired as
`{"from":"btn","trigger":"buttonClick","action":"export"}` produced nothing, and both halves of the chain
were at fault: the `button` widget has no `buttonClick` emitter yet, and `defaultDispatchers` implements
no `export` dispatcher at all — even though `export` is a `StrataActionType` and `defaultDataActions`
emits an `export` *trigger*. It is currently the only action in the enum with no default dispatcher.
**Guard:** grep `defaultDispatchers` before wiring any action; ship the behaviour as an app-local
component calling the package directly (`@strata/export`); and author the connection anyway so it lights
up when both ends land.

**`navigate` is declared and has no host callback.** `[core: open]`
*(2026-08-18, branch & ATM network operations)* A `rowSelect → navigate {pageId}` connection is accepted
and nothing happens: the dispatcher ships, `<StrataApp>` does not yet supply `onNavigate`. **Guard:**
author the connection anyway — it is correct and lights up when the callback lands — and give the user a
`page-nav` tab as the day-1 path, with the target page already scoped through a shared `dataSource` so
the arrival is not an empty screen. The same applies to `onSelectByGeometry` and `onUpdateRecord`.

**A MapLibre stub that drops a style without installing the new one is blind to a missing layer.** `[app]`
*(2026-08-20, financial inclusion & coverage)* The offline stub's `setStyle` was faithful about the half
that causes bugs — fire `styledata`, then drop every source and layer — and silently skipped the half that
does not: real MapLibre then installs the **new** style's own sources and layers. A basemap raster the app
never put in its style was therefore invisible, and the assertion could only say *8, expected 9*.
**Guard:** the stub installs the style it is given, in the constructor and in `setStyle`; and the
assertion compares the layer **names**, not the count, so a failure says which one went missing.

**A generated write can leave a raw NUL in a shipped file.** `[app]`
*(2026-08-20, financial inclusion & coverage)* Two `U+0000` bytes reached `index.html` inside a
"nothing is selected" sentinel. They render as a *space* in every terminal, diff and editor, so the file
looked correct; `file(1)` called it `data`, `grep` refused it as binary, and the app and its suite
disagreed over a value neither could print. **Guard:** scan every shipped file for control characters
other than tab/newline as a build assertion, and never let an invisible character *be* a sentinel — name
it (`NO_FEATURE = "__no_feature__"`) and assert its properties: it can never be a real id, and it contains
nothing unprintable.

**`Number(null)` is `0`, so a deep-link reader adopts record 0 on every plain load.** `[app]`
*(2026-08-20, branch & ATM network operations)* `const dev = Number(params.get("device"))` followed by
`Number.isInteger(dev) && dev >= 0` is true for an absent parameter, so the app opened with a feature
selected, a table row highlighted and a detail panel filled that no one had asked for. It looks like a
deliberate default rather than a bug, which is why it survives review. **Guard:** gate on
`params.has(key)` before parsing, and assert from the browser that **a plain load selects nothing** —
that single assertion covers the whole family (`Number("")` is also `0`, and `Number([])` is `0`).

**A scenario control unioned with the live feed makes both readings unreadable.** `[app]`
*(2026-08-20, branch & ATM network operations)* A what-if control that adds its devices to whatever the
live feed already reports produced a headline that was neither: the verified scenario figures are
computed on a clean baseline, so a scenario the recipe records as stranding **0** people read as 22,375
once ~160 unrelated generated failures were counted with it, and the recorded table could no longer be
read back off the screen. **Guard:** compute a what-if **in isolation**, and say which reading is on
screen — in the figure's own label, in a removable chip, and in a persistent notice. A number that
silently changes meaning when a control is touched is worse than two numbers that each say what they are.

**A stub that models half of an API is blind to the half it skipped — and the order matters.** `[app]`
*(2026-08-20, branch & ATM network operations)* Two offline-stub defects each read as an app defect for
as long as it took to check what the app was supposed to do. `textContent` built as
`children.join("") + ownText` loses document order, so an assertion on a sentence broken by a `<b>` fails
against a correct app; and matching only the **last** part of a descendant selector made
`#list tbody tr` return the `<thead>` row and every row of a sibling table, so the "click a row" test
clicked a header. **Guard:** hold text as real `#text` child nodes, match descendant selectors against
the actual ancestor chain, and when an assertion fails read what the app binds before changing it.

**Waiting on a clock after a camera animation makes a browser suite flap.** `[app]`
*(2026-08-20, branch & ATM network operations)* A `sleep(1600)` after a `fitBounds` reported **0**
rendered features on one run and **10** on the next, from identical code — the animation plus re-tiling
takes a variable time, and adding an unrelated `evaluate` call was enough to "fix" it, which is the worst
possible outcome because it looks like a fix. **Guard:** wait on the condition the assertion depends on
— `!map.isMoving()` **and** a non-zero `queryRenderedFeatures` count — and run the suite twice before
believing it.

**An async fetch that early-returns must still invalidate the request in flight.** `[app]`
*(2026-08-20, asset-level exposure scoring)* A per-view underlay loader took its cancellation token
*after* its early returns. Switching to a view with no polygon underlay cleared the source and returned
— then the **previous** view's response landed, matched the still-current token, and drew **2,357
wildfire polygons underneath the earthquake bands**, with a status line calling them "this rung's".
In an app whose whole argument is that every classification names the map behind it, that is the worst
available defect, and it is invisible to every count-based assertion. **Guard:** take the token on the
first line, before any branch; make the empty path reset the state and re-report it; and assert in the
browser suite that the underlay belongs to the view you are on.

**A band-change count needs a DECLARED comparison, not a position in a list.** `[app]`
*(2026-08-20, asset-level exposure scoring)* "Compare each step to the one below it" is wrong the
moment a list mixes sources. California's flood ladder runs 1 % → 200-year → 0.2 %, but the 200-year
rung is a different programme (USACE 2002, one valley) with a different vocabulary — so comparing the
0.2 % rung to it reported **158** movers where the real figure against the 1 % rung is **184**:
arithmetic over incomparable classes, understating the app's own headline, with nothing thrown.
**Guard:** declare the comparison on the item (`comparesTo`), and let an item with no valid comparison
say **"not comparable"** on screen, with the reason. A zero there reads as "nothing moved".

**One sort order cannot serve both a legend and a worklist.** `[app]`
*(2026-08-20, asset-level exposure scoring)* An *unscorable* class must sort **above** the low band in a
legend, so it never reads as the bottom of a severity ramp. Applying that same comparator to the ranked
table buried every exposed asset under **1,397 rows of "no polygon here"** and the table stopped
ranking anything. **Guard:** two comparators with two stated reasons — severity-with-silence-on-top for
legends and bars, severity-with-silence-at-the-bottom for tables. Only a screenshot showed this; every
arithmetic assertion was green.

---

**A DOM stub that returns a constant width makes every clamp assertion vacuous.** `[app]`
*(2026-08-23, access to care)* The offline harness's `getBoundingClientRect()` returned a fixed 400 px,
so each simulated arrow-key resize started from the same number: sixty accumulating steps produced the
same single-step result, and a grip that ran away past its floor and ceiling would have passed.
**Guard:** have the stub report the CSS custom property the app actually writes, then assert that N
steps stop *exactly* at the floor and the ceiling — not merely that the width changed.

**An offline fixture can violate the very geometry rule the app depends on.** `[app]`
*(2026-08-23, access to care)* ESRI outer rings carry a **negative** signed area in x/y order. A helper
written as "reverse the ring to make it an outer ring" produced holes instead, so every synthetic tract
reported its own settlements as outside itself and all three origin-placement branches collapsed into
"unmapped". The app was correct; the fixture was not. **Guard:** assert the fixture's own winding
(`ringArea(outer) < 0`) before asserting anything that depends on it.

**A default that is ON can hide the app's finding from its own headline.** `[app]`
*(2026-08-23, access to care)* With the modelled exception applied by default, the headline KPI read a
green **0** on a county with 4,332 people outside the statutory standard — the app's entire argument
invisible on the first screen, with 86 browser assertions green. **Guard:** the headline states the
figure the app exists to make, and the *modelled* variant sits beside it. Confirm by screenshot: this
class of defect is invisible to every assertion that does not know what the app is *for*.

**A per-mode option that is correctly disabled must be correctly restored.** `[app]`
*(2026-08-23, access to care)* Switching to a service line with no published provider ratio correctly
turned the staffing gate off — and switching back never turned it on again, so the second line vanished
from the chart permanently and the app silently reported one of the two tests it claims to apply.
Caught only because a *phone-layout* assertion counted one curve path where it expected three.
**Guard:** store the reader's preference separately from the effective value, restore it when the mode
allows it again, and say on screen when a mode genuinely has no such test.

**A `keydown` dispatched on both `document` and `window` fires every handler twice.** `[app]`
*(2026-08-24, shortage-area explorer)* A browser harness dispatched each key on `document` *and* on
`window` "to be safe". A `document` dispatch with `bubbles:true` already propagates to `window`, so every
listener ran twice — and every *toggle* (open the layers drawer, open the basemap drawer) opened and then
immediately closed. Two assertions went red against an app that was correct, while `Escape` and `F` passed
because they are idempotent. **Guard:** dispatch once, on `document`, and prefer asserting a toggle by its
resulting state rather than by counting invocations. The same hazard applies to any delegated handler
reached from two roots.

**A resize test must know which direction grows the panel.** `[app]`
*(2026-08-24, shortage-area explorer)* A left rail's grip sits on its **outer** edge, so dragging right
grows it; a right rail's and a bottom strip's grips sit on their **inner** edge, where the same drag
*shrinks* them. A harness that drove `clientX: +5000` at all three asserted the ceiling on one panel and
the floor on the other two, producing six red assertions against correct behaviour. **Guard:** parameterise
the test by the panel's invert flag, and assert the clamp in both directions — including that dragging back
from the ceiling does **not** lag by the overshoot (the clamp must be against the gesture's start size, not
the live one).

**A path-traversal test that resolves to a file inside the served folder proves nothing.** `[app]`
*(2026-08-24, shortage-area explorer)* `GET /../server.mjs` was asserted to return 403. It returned 200 —
correctly: the URL parser normalises `/../server.mjs` to `/server.mjs`, which legitimately lives in the
served directory. The guard was working and the test was wrong. **Guard:** a traversal probe must name a
file that exists **outside** the served root (the recipe one level up, or a system file), and must check
the **body** as well as the status — a 200 serving the wrong file is the failure, and a 404 for a file that
does not exist anywhere proves nothing either.

**Poll for an asynchronous visual, never sleep a fixed interval.** `[app]`
*(2026-08-24, shortage-area explorer)* A fixed `sleep(2600)` before asserting that five basemap thumbnails
had decoded reported 3 of 5, because two tile hosts are slower than the rest — a flaky red that looks
exactly like the real *lazy-loading* defect in §7. **Guard:** poll the condition (`naturalWidth > 0` on
every thumbnail) up to a generous bound and break as soon as it holds. A sleep encodes one machine's
latency as an assertion.

**A fixed sleep before a screenshot photographed two blank map panes — with 321 assertions green.**
`[app]`
*(2026-08-24, housing & homelessness services)* §9 already says to poll rather than sleep, for thumbnails. **This is the same rule costing far more.**
A browser harness slept 2,500 ms after boot, then asserted 44 features drawn per pane, identical class
colours, correct chrome geometry and correct totals — **all true** — and captured a screenshot of two
empty white boxes, because neither map had finished its first render. The app was right; the picture was
not yet drawn; and no assertion could tell the difference. **Guard:** before anything visual, poll
`map.loaded() && map.areTilesLoaded() && map.isStyleLoaded()` on **every** map to a generous deadline, and
re-poll after every style swap, scope change and panel drag. A screenshot taken during boot is not
evidence of anything, and a suite that never looks at one will not tell you.

**On Windows a path-traversal probe cannot reach the guard over HTTP at all.** `[app]`
*(2026-08-24, housing & homelessness services)* Sharpens §9's traversal entry. Every payload — `/../../recipe.md`, `..%2f..%2f`, `%2e%2e%5c`,
`/....//....//`, a bare drive letter — returned **404**, not 403, because `path.normalize` strips leading
`..` from an absolute path: the request resolves *inside* the served folder and simply misses. The guard
never ran. A suite that asserts "traversal is refused" from those 404s is asserting nothing. **Guard:**
exercise the containment check **as a function** — feed it a target that genuinely resolves outside the
root and assert it is refused, plus one inside that is accepted — and keep the HTTP probes as a separate,
weaker check that no payload returns 200 with foreign content.
*(2026-10-22, live-position build)* **And the opposite failure: a decoded backslash opened a real
traversal.** On Windows `\` is a path separator, so a decoded `..%5c..` path normalised past the root while
a naive `startsWith(ROOT)` containment check still passed (a sibling folder such as `ROOT-old` passes that
check too). **Guard:** after decoding, refuse any request with a `..` segment on **either** separator before
normalising, and check containment against `ROOT + path.sep`; exercise it as a function with backslash and
forward-slash payloads, as above.

**It happened again, mirrored: the retry was in the BUILD script and not in the shared domain module.**
`[app]` *(2026-08-25, public health preparedness)* The *a retry added to the app does not cover the
suite's own probes* entry above records one half of this. Here it was the other half: `build-data.mjs`
had a five-try backoff, and `preparedness.mjs` — the module the **live suite** imports and runs on — only
sniffed the body and threw. One transient 12 s timeout on a heavy ids request therefore killed the live
run mid-flight with a raw `DOMException` stack trace, from a service that answered in 1.0 s on the next
three curls. **Guard:** resilience belongs in the **shared** module both the app and the suites import,
not in whichever file first needed it. When you add a guard, grep for every other function in the repo
that calls `fetch` and fix them together — a guard that exists in one of two paths reads as done and
fails in the other.

**A denominator smaller than its own numerator is worse than no denominator at all.** `[app]`
*(2026-08-25, public health preparedness)* A KPI whose whole purpose was *never a bare count* rendered
**"30 in view of 0 in the scenario"** whenever a single area was selected. The numerator was computed
over every area; the denominator was computed over the **scoped** set with the filter applied. Both
halves were individually correct, which is exactly why nothing caught it — and the pair is a visible
self-contradiction that teaches a reader to distrust every other `n of N` on the board. **Guard:** derive
both halves of a ratio from the **same** filtered collection, in one place; then assert the invariant
`n <= N` across several filter states rather than eyeballing one. An invariant is testable where a pair
of individually-correct numbers is not.

**A sovereignty claim checked by grepping the app's own status line proves nothing.** `[app]`
*(2026-08-25, public health preparedness)* An app whose selling point is that it makes **no run-time
data call** asserted exactly that by matching the string `no run-time data call` in its own status bar —
a test equally satisfied whether or not the app was re-querying every bound service on every render.
Replacing it with a CDP `Network` recording over the whole drive-through (boot, both themes, six
restyles, every drawer, phone width, a deep-link reload) took ten lines and immediately found a real
egress the prose had hidden: the renderer itself, pulled from a public CDN. **Guard:** a claim about
what the app *does on the wire* is asserted from the wire. Enable `Network.enable`, collect
`requestWillBeSent`, and judge the hosts — then state the exceptions you find by name, with the reason,
instead of letting a sentence stand in for a measurement. This is the *assert behaviour, not prose* rule
applied to network posture.

**"Contrast measured, not eyeballed" is a testable claim, so test it — from the shipped tokens.** `[app]`
*(2026-08-25, public health preparedness)* A recipe specified measured contrast for every role in both
modes, published the ratio table, and shipped with **no suite computing a single ratio** — the numbers
were measured once, by hand, at design time, and nothing kept them true. **Guard:** parse the `:root` and
`[data-theme=dark]` token blocks **out of the shipped page** — never a retyped copy, or the test and the
app drift apart silently — compute WCAG 2.1 relative luminance, and assert every informational role
against **both** the card and the page ground in **both** modes. Reproduce a few of the recipe's own
published figures too, so the document and the app are provably the same thing. Then assert the rule
that *follows* from the measurement: no data colour clears the 4.5:1 text floor on both grounds, which
is precisely why none of them may be used as text — a premise worth asserting, because it is the reason
the rule exists.

**`\s` inside a JavaScript TEMPLATE LITERAL is the letter `s`.** `[app]`
*(2026-08-26, facility capacity & catchment)* Six browser assertions normalised whitespace with
`.replace(/\s+/g, " ")` written inside a template literal handed to CDP `Runtime.evaluate`. In a template
literal `\s` is an unrecognised escape and collapses to `s`, so the regex becomes `/s+/g` and quietly
**eats every letter *s*** out of the text it was checking. Three assertions failed against text that was
on screen and perfectly correct — and the two that passed did so only because their phrases happened to
contain no `s`. **Guard:** escape the backslash (`\\s`) in any regex you inject as a string, or build it
with `new RegExp("\\s+", "g")`. The same applies to `\d`, `\w`, `\b` and `\n`.

**Headless Chrome can stop ticking `requestAnimationFrame` while screenshots keep working.** `[browser]`
*(2026-08-26, facility capacity & catchment)* On an offscreen `--headless=new` window, rAF can be
throttled to nothing: MapLibre's camera easing never advances, so `flyTo`/`fitBounds` fire `movestart`
**and** `moveend` while the transform stays at the opening centre, `isEasing()` stays true, and
`queryRenderedFeatures` returns nothing anywhere the map was supposed to have flown.
`Page.captureScreenshot` forces a frame, so the screenshots are correct and the failure looks exactly like
an application bug. **Guard:** launch with `--disable-background-timer-throttling`,
`--disable-renderer-backgrounding`, `--disable-backgrounding-occluded-windows` and
`--disable-features=CalculateNativeWinOcclusion`; and when a camera assertion fails, **count rAF ticks
first** (`let n=0; const t=()=>{n++;requestAnimationFrame(t)}`) and try a `jumpTo` — if the jump moves and
the fly does not, it is the harness, not the app.

**A recipe can specify one number three different ways, and the build must choose in writing.** `[app]`
*(2026-08-26, facility capacity & catchment)* A recipe's build step asked for "the volume-weighted roll-up
across its measured cells"; its worked example computed a **ratio of sums over the eight rows it printed**;
its app-verification section then demanded that the worked example's figure appear on screen. Those are
three statistics. Computed as a ratio of sums over *all* the facility's measured cells the headline was
**5.0 %** — arithmetically correct and useless, because a cell contributing twelve cases drags its whole
area's demand into the denominator. **Guard:** when a recipe's §5, §4 and §6 disagree about a number,
neither average them nor pick silently — implement the definition whose **label on screen is true**,
reproduce the recipe's own arithmetic verbatim as a suite assertion so the recipe stays checkable, and
record the divergence in the README's *What building it changed* and in the handback. A number that
differs from the recipe and says so is defensible; one that matches by coincidence is not.

**A "largest" heuristic can open an app on the one view where its signature is invisible.** `[app]`
*(2026-08-26, facility capacity & catchment)* The opening record was chosen as "the complete ledger with
the most drawn cells", and the camera framed their **bounding box**. Both are wrong for the same reason: a
long-tailed spatial distribution's outermost members are the ones that stretch a bbox, so the app opened
zoomed out to an entire state with the catchment an illegible scatter — with every non-visual assertion
green, which is precisely the failure the ship checklist warns about. **Guard:** choose the opening record
by the quantity the app is *about* (here, measured volume) rather than by row count, and frame the
**weighted percentile box** of that quantity rather than its extent — then say on screen what the frame
shows and give the reader one gesture to frame everything. And assert it: count the features actually
painted inside the opening viewport, not the features in the source.

**A CDP "clean console" assertion is blind to `console.error`.** `[app]`
*(2026-08-26, hospital network planning)* `Log.entryAdded` carries browser-generated log entries -- network failures, CSP violations,
deprecations -- but **not** `console.error()` called from page script. A driver collecting only
`Log.entryAdded` reported **0 errors** while the app's own global error handler was logging one on every
load. The app's status line said nothing either, because the failure sat inside a `try/catch` that
reported to a status element the assertion never read. **Guard:** collect **both**
`Runtime.consoleAPICalled` (types `error` and `assert`) and `Runtime.exceptionThrown` alongside
`Log.entryAdded`, and separately assert that the app's **own** self-report -- its status line -- is empty.
Two independent channels, because each is blind to the other.

**The `--disable-gpu` stale-surface entry above has a second symptom: an unpainted rectangle.** `[browser]`
*(2026-08-26, hospital network planning)* With `--disable-gpu`, headless Chrome left a **rectangular block of the WebGL canvas unpainted**
wherever a DOM overlay sat in the same stacking region -- here the legend's own footprint, 260x260,
photographed as a solid black hole in every screenshot, in exactly the theme's page-background colour. It
followed the *screen*, not the map, across two completely different viewports, and `elementFromPoint`
returned the canvas, so it was not an overlay. Hiding the legend made it vanish; **dropping
`--disable-gpu` for `--enable-unsafe-swiftshader` made it vanish for good.** It cost a long hunt for a
tile that was serving perfectly. **Guard:** as the earlier entry already says -- do not run the screenshot
harness with `--disable-gpu`. A suite whose whole justification is *"confirmed by screenshot, not by
reasoning"* must not photograph its own compositor.

**CDP drops non-printing keys sent as `keyDown`; they need `rawKeyDown`.** `[app]`
*(2026-08-26, hospital network planning)* `Input.dispatchKeyEvent` with `{type: "keyDown", key: "ArrowDown", windowsVirtualKeyCode: 40}` never
reached the page, while letter keys sent the same way worked -- because a `keyDown` carrying no `text` is
dropped for keys that generate no character. The asymmetry is what makes it expensive: `L`/`B`/`G` pass,
the arrows and `Escape` fail, and it reads as a bug in the app's arrow handling. **Guard:** send
`rawKeyDown` (plus `keyUp`) with **both** `windowsVirtualKeyCode` and `nativeVirtualKeyCode` for arrows,
`Escape`, `Tab` and the function keys. When a key assertion fails, first prove delivery with a temporary
capture listener that records `e.key` -- that separates "the browser did not deliver it" from "the app
ignored it" in one step.

**Measuring an overlay instead of the panel inside it asserts nothing.** `[app]`
*(2026-08-26, hospital network planning)* A splash assertion checked `#splash` was larger than 400x300. `#splash` is `position:fixed; inset:0`,
so it is *always* viewport-sized -- the assertion passed while the panel inside it had collapsed to a
120 px column. **Guard:** measure the element that can actually be wrong. For a modal, that is the panel,
its line count and its dismiss target; for a map overlay, its position **relative to the map's box**, not
the viewport (two assertions in the same suite reported a correctly-placed control cluster and legend as
misplaced for exactly that reason).

**A generated volume that never reaches its threshold leaves a priced term inert — forever, and
silently.** `[app]`
*(2026-08-30, ATM cash & service routing)* The Federal Reserve cross-shipping fee is `max(0, bundles -
875) x $8.00`, assessed **per institution, per zone, per quarter**. The app generated a flat
per-institution weekly bundle volume, so across 42 sub-zone institutions **not one ever crossed 875** and
the fee was **$0.00 in all 18 weeks** — the app's whole geographic argument produced no number. Every
arithmetic assertion passed, because `crossShipFee(875) === 0` and `crossShipFee(876) === 8` are both
true and both irrelevant. The fix was to scale the generated volume by each institution's **measured**
office count in the zone, which is the quantity the real fee actually tracks. **Guard:** for every priced
term, walk the **whole domain** (every week, every class) and assert the term is **alive** — that it
crosses its threshold somewhere, reaches a plausible peak, and resets where it should. A unit test on the
pricing function cannot tell you its input never reaches the threshold. Generalises: **assert that a term
is exercised, not merely that it is correct.**

**A cost lane scoped to the whole estate prices the estate, not the run.** `[app]`
*(2026-08-30, ATM cash & service routing)* An emergency-run term counted every run-out in the entire
5,377-office published estate that a ~24-stop weekly plan did not visit. At $285 each that reached
**$203,490 against $6,039 of routine cost** — the term drowned the other three by two orders of magnitude
and the comparison the app exists to publish became unreadable. Nothing was arithmetically wrong; the
**population** was. **Guard:** a per-run figure is scoped to that run's own **candidate pool** — the
population the decision is actually taken over — and the suite asserts the ratio between terms stays
inside an order of magnitude, not merely that each term computes. Print every term across the whole
domain once and read the table before trusting any single period.

**The DOM stub's text bucket silently reorders every sentence in mixed markup.** `[app]`
*(2026-08-30, ATM cash & service routing; second occurrence of stub-loses-interleaved-text)* A stub that
keeps element text in a `.text` field and returns `children.join("") + this.text` renders
`a <b>b</b> c` as `"bac"`. Four assertions failed against markup the app was producing **correctly**, and
every assertion reading a sentence out of mixed markup was unreliable. Recorded a second time because it
was already in this file and was written again anyway. **Guard:** make text an ordered `#text` child
node and skip `#TEXT` in `walk`/`firstElementChild` — and hold the rule that **the harness accommodates
the app, not the reverse.** The same pass found the stub's `<img>` not reflecting `src`/`alt`/`loading`
onto attributes, which made a basemap-thumbnail guard pass **vacuously** against empty elements.

**A browser normalises `/../x` before the request leaves, so only encoded payloads test a traversal
guard.** `[app]`
*(2026-08-30, ATM cash & service routing)* `fetch("/../server.mjs")` from the page returned **200** —
Chrome resolved it to `/server.mjs`, a legitimate file inside the app root, and the guard was never
reached. The assertion read as a failure of the server and was a failure of the probe. **Guard:** probe
**percent-encoded** variants only (`/%2e%2e%2f%2e%2e%2f...`, `/..%2f..%2f...`, `/%2e%2e/%2e%2e/...`, and
one nested under a real subdirectory), assert each is 403 or 404, **and** assert an ordinary in-root file
still serves — otherwise a server that 403s everything passes.

**`@strata/export` composes a map, a single-feature report and an atlas — but not a one-subject evidence
note.** `[core: open]`
*(2026-09-03, transaction evidence)* The exportable object here is *one geography's evidence base*: a
subject line, a handful of measured figures, a variable-length row register, a provenance block and a scope
block. `composeFeatureReportHtml` handles one feature's attributes and the atlas handles many pages of the
same layout; neither shape fits, so the note is app-local HTML reusing `legendHtml`, `scalebarSvg` and
`printLayoutCss`. **This is the second recipe to hand-roll the same document.**

**Guard, and a candidate for core:** `composeEvidenceHtml(subject, rows, provenance)` — a screening memo, a
statutory disclosure sheet and an evidence note are one document shape with three sets of words, and each
one currently re-implements pagination, the register table and the scope block from scratch.

**Second occurrence — `areTilesLoaded()` answers about the OLD style, so a theme screenshot shows the
previous basemap and the suite calls it a pass.** `[browser]`
*(2026-09-03, transaction evidence; first recorded 2026-08-26, humanitarian response map)* Recorded again
because every assertion around it was green and the picture was still wrong. After a theme flip the suite
waited on `!isMoving() && areTilesLoaded() && loaded()`, slept 2.5 s, and shot a **light** Positron map
underneath a fully dark interface. The mode was `dark`, the effective basemap resolved to
`openfreemap-dark`, `setStyle` had been called, every layer had survived the swap, and the page background
measured `rgb(15,20,24)`. The map simply had not repainted yet.
**Guard, sharper than waiting for steadiness:** wait for the **new style's own background layer** to arrive
— poll `map.getStyle().layers.find(l => l.type === "background").paint["background-color"]` until it is the
colour the new style declares — and then assert the **mean luminance of the map's pixels**, not of the page.
Here: 33 of 255 in dark, against a light-mode map that is nearly white. A light basemap under a dark
interface is the mismatch a reader notices before anything else, and it is invisible to every DOM check.

**Second occurrence — a floating overlay covers the map at the phone breakpoint, and the numbers on it are
all correct.** `[app]` `[browser]`
*(2026-09-03, transaction evidence; first recorded 2026-08-26, humanitarian response map)* Different shape,
same failure. Here it was the bottom-left legend: 250 px of it over a map about 400 px wide, hiding roughly
four fifths of the surface the app exists to show — while the rail, stacked directly above, carried an
**identical and interactive** copy of the same legend. Every assertion passed, including the ones written
after the first occurrence: the map kept a usable height, the canvas matched its container, the row
collapsed to a column, the page did not scroll sideways.
**Guard:** below the breakpoint, hide the floating copy of anything the flow layout already carries — one
legend on a phone, not two — and make the assertion **general** rather than about the element that failed
last time: compute the intersection of **every** floating element's box with the map viewport and require
the covered fraction under 20 %. An overlay assertion that names one element keeps finding the next one by
hand.

**A map paint requested before the map has its sources is silently dropped — and the opening
view is the thing that gets lost.** `[app]` *(2026-09-03, tenant mix & catchment)* The boot sequence
created the map, resolved the subject, then called `paintMap({ fly: true })` to frame the catchment. The
paint function begins `if (!map.getSource('centres')) return;` — a correct guard, because MapLibre adds
sources on its own `load` event — so at boot it returned immediately and **the fit never happened**. The
app opened on the authored county extent instead, where its 64 peer centres are one blob and its argument
is not legible. Every non-visual assertion passed: the sources were right, the arithmetic was right, the
extent was inside the county, and the rail was fully populated.

**Guard:** make a dropped paint **pending** rather than lost — set a flag when the guard fires with a fly
requested, and have the same idempotent `ensure()` that re-hydrates on `load`, `styledata` **and** `idle`
turn that flag back into the fit. Then assert the opening view **tightly**: not "inside the county" but
"at least this zoom, with the whole signature geometry inside the viewport", and wait for the map to be
still (`!map.isMoving() && map.loaded()`) before sampling it — a single sample races the opening
animation and fails intermittently on a map that is correct a moment later.

**A transcribed count goes stale in days, and an exact assertion against one fails a healthy build.**
`[app]`
*(2026-09-07, valuation & taxation base map)* Between **2026-09-03 and 2026-09-07** this register moved by **58 rows on the layer, 50 on the
current roll and 108 off it**, and its land-value sum fell by **$86 million**. Nothing was wrong: a county
assessment roll is edited continuously. But the bake asserted its walk against a row count transcribed from
the probe four days earlier, so a walk that had read every row it was offered **failed the build**; and the
browser suite asserted a histogram total against the same constant and went red against an application that
was correct. An assertion that fails on healthy behaviour teaches its reader to ignore it, which is worse
than not having written it. **Guard, three parts.** Assert a walk against the count the service gives **at
the moment the walk starts**, because the thing the assertion exists to catch is a *silent truncation*, not
a week of edits. For figures a suite must watch across runs, state a **drift tolerance once** in the domain
— 0.2 % here — assert against that, and **print the actual figure beside the verified one and its date**, so
the drift is visible rather than merely tolerated. And derive every on-screen count from state: a persistent
notice quoting a constant beside a KPI reading the live register is an application contradicting itself in
one screen.

**A worked example computed with per-scope quantiles is not the shipped application's answer when the
application uses fixed class breaks.** `[app]`
*(2026-09-07, valuation & taxation base map)* The research pass scored a 27-parcel block against **that block's own quintiles** and found **one**
divergent parcel — and the design's headline sentence was built on it: *that parcel is the only one on the
block for which "my assessment looks high" has a cause other than the statute*. The shipped application
scores the same block against **county-wide edges cut once at bake time**, which is the entire point of a
fixed edge set, and finds **two** — and both of them read **LOW** rather than HIGH, so on that block
**nobody reads high at all**. The example did not become wrong; it was answering a different question, and
the sentence quoting it inverted. **Guard:** where a design fixes its class breaks, **recompute every worked
example in its research against those fixed breaks** before quoting it as a claim about the product, and
say in the recipe which edge set each published figure was computed against. Two numbers derived from the
same rows by two defensible methods will be read as the same number by everyone except their author.

**A harness that spawns browsers is a load generator, and two of them against one heavy page produce
timeouts that look exactly like a defect in the page.** `[app]` `[browser]`
*(2026-09-07, valuation & taxation base map)* Five browser-suite runs aborted with `Runtime.evaluate timed out` in a **different section each time** —
6, 8, 12, 6, 8. That is the signature of an intermittent hang under load, and it was read as one. Three
causes were proposed and **two of them were wrong**. First the drawer's live map previews, which were a
genuine cost but not this one. Then the screenshots, on the strength of a `--no-shots` run passing
**172/172** while runs with them aborted — which reads like a controlled comparison and was nothing of the
sort: it was simply the run that happened to have the machine to itself. The actual cause was a **diagnostic
probe running alongside the suite**, each instance loading 22 MB of geometry and rasterising 87,633 points
twice on the CPU. The fifth abort had a third cause entirely — the static server had died, so `window.__app`
was never defined and the failure was reported against boot. With the machine to itself the same suite
passes **175/175**, a screenshot costs **0.0–0.1 s**, and every heavy gesture completes: legend filter
18.9 s, `Esc` 7.8 s, theme swap 9.5 s, tier-B jump 2.1 s. **The tell was in the probe's own output and went
unread for three runs: the boot that takes 11–18 s alone took 148.8 s beside a running suite.**
**Guard:** before attributing a timeout to a component, **check what else is running**, and take the
baseline measurement twice — once with the machine busy and once with it quiet. **A moved baseline is the
finding**, and it is cheaper to read than any of the theories it displaces. Make the harness *print what it
measured* — a boot time, a settle time — so the baseline is on screen to be compared rather than buried in
a pass. And when a suite needs the machine, give it the machine: a probe and a suite driving the same page
are not two experiments, they are one confounded one.

**Derive a population bound during research, and make the application assert it can never exceed it.**
`[app]`
*(2026-09-07, property hazard exposure)* Two arithmetic defects in a spatial membership test — one accepting the class that means "no
hazard", one ignoring polygon holes — both produced counts that were internally consistent, smaller than
the total in view, and wrong. Neither was caught by any assertion about the app's own state, because every
such assertion compares the app to itself. What caught them was a number computed **once, in research,
over the complete downloaded geometry**: the whole population is 710, so an in-view count of 726 is
impossible. **Guard:** whenever research computes a total the running app will later compute subsets of,
ship that total as a cited constant with its method and date, print it where the reader can see it, and
assert in the browser suite that the live figure never exceeds it. A bound the app can contradict is worth
more than a dozen assertions it cannot.

**Second occurrence — `load-and-isStyleLoaded-never-fire`, in its other form: `styledata` fires while
the style is NOT loaded and does not fire again once it settles.** `[app]`
*(2026-09-07, property hazard exposure)* With hydration gated on `map.isStyleLoaded()` inside a `styledata` handler, a theme switch left
the map holding **two sources and none of the app's layers** — a basemap with no data on it, after every
source and layer had been correctly re-added on the first paint. The catalogued guard (retry on `load`,
`styledata` **and** `idle`) is the fix, and this is the second build to need it. The new half is why the
offline suite missed it: **the MapLibre stub fired a loaded `styledata` synchronously from `setStyle`**,
which no real map does, so the stub asserted the re-hydrate green while the browser showed an empty map.
**Guard:** the stub must reproduce the sequence, not a convenient version of it — drop the sources, leave
`isStyleLoaded()` **false**, and only then fire `style.load` and `idle` on a later tick. And assert
`queryRenderedFeatures({layers:[...]}).length > 0` **after** a theme switch, not only on first paint.

**Second occurrence — `flex-basis`-beats-`width`, reached through a shared generic class name.**
`[app]`
*(2026-09-07, property hazard exposure)* A splash card rendered **14 px wide** with its text spilling down the page. `#splash .box`
out-specifies `.box` on `width` (1,1,0 against 0,1,0), so specificity was not the problem: the drawer's
checkbox rule `.box{flex:0 0 14px}` sets `flex-basis`, and **flex-basis beats width on a flex item**.
Under the earlier `display:grid; place-items:center` the same collision collapsed the card to min-content
instead — one class name, two layout modes, two different broken results, and every non-visual suite green
both times. **Guard:** the fix is the collision, not the specificity — never share a generic class name
(`box`, `card`, `panel`, `row`) between two unrelated components. And assert **geometry**, not
presence: a browser-suite check that a dialog's body text sits inside its own card's rectangle catches this
class of defect regardless of which CSS mechanism caused it.

## 10 · Environment

**A stale sibling dev server serves *its* app while looking like yours.** `[app]`
The give-away is that your domain module 404s while `layers.mjs` 200s — because the other app has a
`layers.mjs` too. **Check the `<title>` before believing a page.**

**A crash dump on the first command of a demo is a bad first impression.** `[app]`
`node server.mjs` should step to the next free port, bounded, and say so.

**`pnpm test` fails on a fresh clone until you build.** `[app]`
Workspace packages resolve from `dist/`, which does not exist until `pnpm -r build` runs — so the first
`pnpm test` dies with *"Failed to resolve entry for package `@strata/state`"*, which reads like a broken
package rather than a missing build step. **Order:** `pnpm install` → `pnpm -r build` → `pnpm test`.
Verified 2026-10-08: 1,280 tests, 0 failures, across the 19 of 21 packages that carry suites.

**A fresh `pnpm install` needs `.npmrc`.** `[core: fixed]`
The Esri libraries behind `@strata/feature-arcgis` are optional lazily-loaded peers, not published for
public install, so auto-install 404s. `strata/.npmrc` sets `auto-install-peers=false` and
`strict-peer-dependencies=false`. Workspace packages resolve from `dist/`, so `pnpm -r build` must run
before any example's `vite dev`.

**On Windows, binding `127.0.0.1:P` does not collide with an existing `0.0.0.0:P`.** `[browser]`
*(2026-08-20, asset-level exposure scoring)* A sibling dev server held `0.0.0.0:8041`; this app's
server bound `127.0.0.1:8041` and **succeeded** — no `EADDRINUSE`, so the step-to-the-next-port guard
never fired — and it logged `http://localhost:8041/` in good faith. `localhost:8041` then resolved to
the *other* listener, and the browser suite spent a full run asserting against a **different app**,
reporting a blank notice bar and a missing control as defects in this one. **Guard:** have the driver
launch the server and read the port from its stdout (`server.address().port`, not the requested one),
and make the **first browser assertion page identity** — `document.title` and the app's own export
hook — aborting rather than reporting assertions about somebody else's page.
*(2026-10-22, live-position build)* The same wrong-page failure one layer up: two headless Chrome runs must
not share a DevTools (`--remote-debugging-port`) port, or each drives the other's page. Give every run its
own port and its own `--user-data-dir`.

---

## 11 · Fixed in core — do **not** apply the old workaround

Verified against `strata/packages/core-map` on 2026-08-11. Early builds carry workarounds that are now
wrong.

| Trap | Old workaround, now obsolete | Fix in core |
|---|---|---|
| `layerList` / `basemapSwitcher` flags ignored | hand-mount the panels | every `<StrataMap>` mounts the standard map controls (`MapChrome` over `@strata/map-controls`), store-driven; the flags are deprecated and ignored |
| Hand-written six-glyph chrome in vanilla apps drifted from the React one | copy the chrome code between apps | vendor `@strata/map-controls` `dist/` and call `mountMapControls` — one implementation for both paths |
| ArcGIS `{error}` blanked the layer | app-level re-check | `engine/arcgisSource.ts` throws |
| Popups showed labels with blank values on MapServer | lower-case the `popupInfo` | `engine/popups.ts` `propValue()` |
| Renderers matched nothing on MapServer fields | author against lower-cased keys | `engine/styleCompiler.ts` `getField()` coalesce |
| Measure/sketch silently no-op in Vite | — | `controls/terraDraw.ts` literal dynamic imports |
| `onReady` waited on every layer's full load | keep heavy layers out of `layers.json` | `engine/layers.ts` streams pages fire-and-forget |
| Canvas stuck at 400×300 in a flex container | call `resize()` by hand | `StrataMap.tsx` observes its container |
| `<React.StrictMode>` tore the map down mid-load | **don't use StrictMode** | disposal is abort-safe |
| No in-place server-side filtering | remount the map | `store.setDefinition()` → `LayerRegistry.setDefinition` |
| Popup unreadable in a dark theme | hand-write popup CSS per app | `engine/popups.ts` `ensurePopupStyles()`, injected by `initPopups` |
| Legend frozen at the authored layer list | re-author `props.layers` on every change | omit `layers` — `react/useStoreLayers.ts` subscribes to the store |
| Legend omitted service-styled layers | author a dummy `drawingInfo` to force a row | `controls/Legend.tsx` names every visible layer |
| Layer rows showed a generic `▤` | read the legend to identify a layer | `panels/LayerPanel.tsx` renders `legendRows()` swatches |
| Labels (`text-field`) never drew on a raster basemap in a vanilla app (no `glyphs` in the style) | app-side `LABEL_GLYPHS` + `map.setGlyphs()`, or rasterised numerals via `addImage` | `@strata/map-controls` 1.0.1 `basemapStyle()` adds `DEFAULT_GLYPHS`; use `DEFAULT_TEXT_FONT` as the `text-font` (§7) |
| A GL → GL basemap swap 404'd its labels' glyphs / never fired `style.load` | wrap `setStyle` to force `{ diff: false }`; re-`setGlyphs` after a swap | `@strata/map-controls` 1.0.2 calls `setStyle(style, { diff: false })` on every map (§7) |
| A line layer drew nothing after the layer list "reset" its opacity; expression opacities became `NaN` | author `0.999` instead of 1; avoid expression opacities on listed layers | `@strata/map-controls` 1.0.2 writes the authored value back and fades expressions (`scaleOpacity`) (§7) |
| Esc closed the drawer while a popup stayed open | app-side Esc handler that closes the popup before calling `controls.escape()` | `@strata/map-controls` 1.0.2 `escape()` closes popups first (MapLibre popups + `closePopup`) |
| App `button {}` rules restyled the cluster / drawer; the drawer slid under app overlays and over the attribution | app CSS resets scoped to `.smc button`; z-index hacks on `.smc-ctl` / `.smc-drawer`; a hand-set drawer `max-height` | `@strata/map-controls` 1.0.2: a `(0,2,1)` button reset, `--smc-z` (40) and `--smc-drawer-bottom` (44px) tokens |
| An open drawer hid a map popup; dark-mode popups were white-on-white in vanilla apps | `.maplibregl-popup{z-index:calc(var(--smc-z,40) + 2)}` and per-app dark popup CSS | `@strata/map-controls` 1.0.3: `--smc-popup-z` (42, cluster + grip 43) and the themed card (`popupStyles`) (§7) |
| `vt-gray-dark` missing from Recommended in a faint-shading app | `recommendedExtras: ["vt-gray-dark"]` | `@strata/map-controls` 1.0.3 lists both halves of the theme pair under Recommended |
| VersaTiles / CARTO GL internals failed the host allow-list | app-side allow-list extensions | `@strata/map-controls` 1.0.3 `BASEMAP_HOSTS` covers every host the catalog's GL styles delegate to (§7) |
| A GL basemap that never loaded left a blank ground | app-side "switch to OSM after N s" | `@strata/map-controls` 1.0.3 `basemapFallback` (once, to `osm` / `osm-dark`) |
| One Esc closed the app's card and the map popup together | — | `@strata/map-controls` 1.0.3: one layer per Esc, `closePopup` first (§7) |

---

## Adding to this file

An entry earns its place by having cost something. Record **symptom → cause → guard**, and mark it. If it
is a core defect, fix the core first and move the entry to §11 with the workaround marked obsolete — the
value of this file is that it does not accumulate lies.
