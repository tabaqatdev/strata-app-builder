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

Where two entries disagree, the newer wins. Sources, newest first: the **`nearby` reference build**
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

**The OID is whatever the service says it is.** `[data]`
`objectIdField` is guaranteed to be `OBJECTID` only on a layer **you** published to Strata Serve (§6).
On a pipeline centerline the OID is `FID`, and a *different* column is literally named `OBJECTID` —
`FID 4` is `OBJECTID 7`. On three SafeGraph slices it is `OBJECTID_1`, and both columns exist. Selecting,
highlighting or joining on the assumed field addresses the wrong rows with no error.
**Guard:** read `objectIdFieldName` from the layer metadata; assert it in the suite.

**Some layers report no OID although one exists.** `[data]`
Three geohazard layers returned `objectIdField: null` while carrying a usable OID column.
**Guard:** bind read-only; never build an edit or selection key on it.

**Identifiers are strings; only magnitudes are numbers.** `[app]`
A zero-padded `String(4)` line id coerced to a number makes every row of an operator's upload miss its
line — and report a cheerful "0 matched". **Guard:** refuse to coerce any cell carrying a leading zero.

**Unidentified rows need unique keys.** `[app]`
Collapsing every unbranded outlet onto one empty brand key rolls them up as a single phantom chain,
inventing a major competitor out of missing data.

## 2 · Counting and paging — is this all of it?

**Paging silently stops short when the server caps below your page size.** `[data]` `[app]`
A paging helper compared the returned page against the *requested* size. The flowline layer caps at
1,000; asking for 2,000 returned exactly 1,000 — no error, no `exceededTransferLimit` — so the loop halted
at 1,000 of 1,619 reaches. That **understated the stream network and inflated the measured share from
11.2 % to 18.0 %**, in the flattering direction. **Guard:** the effective page size is whatever the server
actually returns at its widest, not what you asked for. *The most expensive entry in this file.*

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

## 3 · Field semantics — does this field mean what it is called?

**A field can be published and empty on every row.** `[data]`
One field looks like the USGS quadrangle name a study must cover; it is whitespace on all 2,806 rows, as
are the two coordinate fields beside it. `EventType` and `StreetName` are blank on all 62,306 rows of a
works registry — which is why that app is a map and not a search box. **Guard:** profile
`WHERE field IS NOT NULL AND field <> ''` before designing around a field.

**Numeric-looking columns are often strings.** `[data]`
`naics_code` is a String; use `LIKE '4451%'` or cast. A "diameter" field has **84 distinct forms**
(`8`, `8, 10`, `8.625`, `8"`, ` `) and is not a plain number on 28.3 % of the network. **Guard:**
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

## 5 · Services and hosts

**Group layers are not queryable.** `[data]`
`geometryType: null` and `/query` returns HTTP 400. The data lives in the point/line/polygon children.

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

## 6 · Publishing to Strata Serve

**Points don't render.** The published layer's `objectIdField` must be `OBJECTID`. `object_id_field` only
picks the SOURCE column to cast; a string id (GERS, ministry number) can't be the OID — **omit
`object_id_field`** so it is synthesised. The snapshot query uses `orderByFields=<OID>`; a wrong OID
returns 0 features and points silently don't draw (polygons and lines use the tiled path and are
unaffected). *This is the publishing half of the §1 rule — it does not license assuming `OBJECTID` on a
service you did not publish.*

**Custom markers don't show.** Don't use `esriSMSPath`. Use `esriSMSCircle` / `Square` / `Diamond` /
`Triangle`, and vary colour per layer.

**Overlapping polygons hide each other.** Use a low fill alpha (~40/255).

**Changes don't take effect.** The Serve server has **no hot reload** — restart after any config,
datasource or metadata change (`/restart` or `.claude/scripts/restart_server.sh`).

**Vector tiles are huge.** `tile_fields` controls which attributes are baked into vector tiles — keep it
to a handful. It is **not** the popup field list (FeatureServer `/query` always returns all fields).

**A stray field appears.** pandas-written GeoParquet can carry `__index_level_0__` — drop it on convert
(`SELECT * EXCLUDE(__index_level_0__)`).

## 7 · Rendering and the map

**`element.style.background` is the shorthand — it wipes `background-image`.** `[browser]`
Assigning a fill colour silently erased the hatch carrying an app's entire signature accent. The class was
present, the browser driver counted 8 elements, every suite was green, and **nothing rendered**. Caught
only while building a slide deck that reproduced the markup. **Guard:** use `backgroundColor`.

**An author `display` rule beats the UA stylesheet's `[hidden]{display:none}`.** `[browser]`
`.splash-bg{display:grid}` meant `el.hidden = true` did nothing and the intro overlay sat over the app
forever — then the identical bug reappeared on a radius control. **Guard:** one global
`[hidden]{display:none !important}`, and assert *that rule*.

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

**A basemap drawer that ticks nothing leaves the reader unable to name what they see.** `[app]`
The tick tested `b.id === chosen && !auto` — and "Follow the theme" is the **default**, so opening the
drawer for the first time showed five options and none selected. "Follow the theme" says HOW the choice
is made; it does not stop there being a choice. **Guard:** tick the **effective** basemap, so both the
auto row and the basemap it is choosing are marked. Shipped in `BasemapPanel`/`MapChrome`; assert that at
least one row is ticked on first open.

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

**Semantic roles must not conflate two different facts.** `[app]`
"An authority answered" and "an authority answered, and the answer is a hazard" cannot share ink. Painting
*evidenced* in the danger role made a plain factual value draw as a full-width blood-red bar. No assertion
could catch it — the ink was internally consistent and semantically inverted.

**A network-wide verdict is a false statement about a specific asset.** `[app]`
Stamping "unverifiable" on every line because 28.3 % of network mileage is unparseable libels the lines
that file a plain value. Decide per feature and print the reason on the row.

**A caveat that outlives a toast belongs in a persistent notice, not a status line.** `[app]`
A vintage field-rename warning written to a status line was overwritten by load progress and never reached
anyone.

**A theme swap must not discard an explicit basemap choice.** `[app]`
Re-pair the basemap only while the user has not chosen one; an unknown basemap id falls back rather than
blanking the map.

## 9 · Suites and verification

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
A role-tagger matched `\bfass\b` against `CalifAssemSenDists`.

**A noisy console is where a real error goes to hide.** `[app]` Fix the favicon 404.

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
Verified 2026-08-12: 796 tests, 0 failures, across the 18 of 20 packages that carry suites.

**A fresh `pnpm install` needs `.npmrc`.** `[core: fixed]`
The Esri libraries behind `@strata/feature-arcgis` are optional lazily-loaded peers, not published for
public install, so auto-install 404s. `strata/.npmrc` sets `auto-install-peers=false` and
`strict-peer-dependencies=false`. Workspace packages resolve from `dist/`, so `pnpm -r build` must run
before any example's `vite dev`.

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

---

## Adding to this file

An entry earns its place by having cost something. Record **symptom → cause → guard**, and mark it. If it
is a core defect, fix the core first and move the entry to §11 with the workaround marked obsolete — the
value of this file is that it does not accumulate lies.
