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

Where two entries disagree, the newer wins. Sources, newest first: the **resilience disclosure pack**
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

## 2 · Counting and paging — is this all of it?

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

## 3 · Field semantics — does this field mean what it is called?

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

## 4 · Geometry and measurement

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

## 5 · Services and hosts

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
> The eleven docs that named CARTO as the keyless house set — `CLAUDE.md`, `app-design.md`,
> `building-apps.md`, `find-and-verify-data.md`, `map-templates.md`, `human-language.md`,
> `getting-started.md`, `docs/README.md`, `COMPONENT-MANIFEST.md`, `/create-map`, the `strata-map` and
> `strata-symbology` skills — and the `WebMaps/` starters were updated with it.

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
`[browser]` `[app]`
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

## 9 · Suites and verification

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
Verified 2026-09-02: 835 tests, 0 failures, across the 18 of 20 packages that carry suites.

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

---

## 11 · Fixed in core — do **not** apply the old workaround

Verified against `strata/packages/core-map` on 2026-08-11. Early builds carry workarounds that are now
wrong.

| Trap | Old workaround, now obsolete | Fix in core |
|---|---|---|
| `layerList` / `basemapSwitcher` flags ignored | hand-mount the panels | `react/StrataMap.tsx` renders them store-driven |
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

---

## Adding to this file

An entry earns its place by having cost something. Record **symptom → cause → guard**, and mark it. If it
is a core defect, fix the core first and move the entry to §11 with the workaround marked obsolete — the
value of this file is that it does not accumulate lies.
