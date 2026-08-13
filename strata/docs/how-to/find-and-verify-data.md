# Find & verify data

How to get from "this app needs flood data" to a layer you can safely put a number on screen from.

**The one rule:** a field name never enters an app until a response has shown it. Not the catalogue's
claim about the field, not the metadata's alias — a real response, in the terminal, before any app code
exists. Every headline figure that shipped wrong across the last twenty builds failed this rule.

Companions: **[`troubleshooting.md`](../troubleshooting.md)** (what goes wrong, with the guard for
each) · **[`guide/building-apps.md`](../guide/building-apps.md)** (what to do with it once verified).

---

## 0 · The house defaults

Every app starts here. A recipe may override any of these **with a stated reason** — a business need that
genuinely conflicts — but the default is what you get when nobody argues, and it is what makes twenty apps
behave like one product.

| Default | Why it is the default |
|---|---|
| **Keyless sources only** | An app that needs a key cannot be handed to anyone. No keyed basemap, no keyed provider, ever — OSM / CARTO raster only |
| **Browser-direct fetching** | The layer answers with `Access-Control-Allow-Origin`, so the app stays a static bundle with nothing to operate. Every recent build is this |
| **EPSG:4326 everywhere** | Reproject on the way in. No exceptions, no per-layer variance |
| **Verify before you bind** | A field name never enters the app until a response has shown it (§2). This is the rule the other defaults protect |
| **Live assertions, not fixtures** | Bind the suite to the real service so a changed register goes red instead of quietly stale |
| **Full resolution to measure, generalised to draw** | Drawing tolerance is for paint only |
| **Read the OID, never assume it** | `objectIdFieldName` from the service, per layer |
| **The page size is what the server returns** | Never what you requested |
| **Nothing silently truncated or fabricated** | Every cap named on screen; no source ⇒ render empty with the citation |
| **Read-only** | No write path unless the recipe explicitly targets a writable, authenticated ESRI backend |

**When a default must break**, say so where the reader is: name the exception in the recipe's §3 and on
the screen it affects. A silent departure from these is indistinguishable from a bug.

---

## 1 · Finding it

**Start from the vertical, not the server.** Ask what authority is obliged to publish this, then find
that authority's server. A layer that no one is required to maintain will be stale in a way nothing in
the response tells you.

**Crawl the catalogue, don't browse it.** Every ArcGIS host enumerates itself:

```bash
ROOT=https://gis.example.gov/arcgis/rest/services
curl -s "$ROOT?f=json" | jq '{folders, services: [.services[].name]}'
curl -s "$ROOT/<folder>?f=json" | jq '[.services[] | {name, type}]'
```

Record what you crawled and when. The California catalogue was built this way — 2,569 endpoints across
10 servers — and it states its own crawl date, because a catalogue without one is a rumour.

**When a vertical looks empty, the server probably wasn't crawled.** This is the highest-yield move in
the whole document. California's entire broadband subject area appeared to be missing until someone read
the `config.js` of the public map at `broadbandmap.ca.gov` — a *Leaflet* app that happens to load
`esri-leaflet` — and found a 36-service ArcGIS server nobody had enumerated. If a public agency has a
web map about your subject, open its network tab or its config: the endpoint it calls is the endpoint you
want.

**Some gaps are structural, and saying so is the finding.** A sweep of every catalogued California
service for municipal public-information roles returns **zero** — no street-works registry, no hearing
calendar, no 311 — because servers #1–#8 are all state agencies. California has 483 incorporated cities.
For a local-government vertical the state catalogue is empty *by construction*, and the right conclusion
is "go to the city's own server", not "this data does not exist".

**Never claim completeness.** Record what a crawl found, on what date, and that it is what the *known*
hosts publish.

---

## 2 · Characterising a layer — the probe

Run this before designing anything. Paste the real output into the recipe's §4. Each step names what
would disqualify the layer.

```bash
L="https://gis.example.gov/arcgis/rest/services/Folder/Service/FeatureServer/0"

# ── 1. IDENTITY. Read, never assume.
curl -s "$L?f=json" | jq '{
  objectIdField: .objectIdFieldName,     # NOT necessarily OBJECTID — troubleshooting.md §1
  geometryType, maxRecordCount, capabilities,
  sr: .extent.spatialReference.wkid,
  fields: [.fields[] | {name, type, alias}]
}'
#  ⚠ geometryType null + /query 400  → this is a GROUP layer; use its children
#  ⚠ objectIdFieldName null          → bind read-only
#  ⚠ sr 102100                       → Web Mercator: never measure Shape__Length here

# ── 2. COUNT, and whether the count is honest.
curl -s "$L/query?where=1%3D1&returnCountOnly=true&f=json"
curl -s "$L/query?where=1%3D1&returnIdsOnly=true&f=json" | jq '.objectIds | length'
#  The two must agree. A count of 0 against real ids is a lying layer (troubleshooting.md §2).

# ── 3. THE REAL PAGE SIZE. Ask for more than maxRecordCount and see what comes back.
curl -s "$L/query?where=1%3D1&returnIdsOnly=true&resultRecordCount=5000&f=json" \
  | jq '{returned: (.objectIds|length), exceeded: .exceededTransferLimit}'
#  Whatever this returns IS your page size. Paging against the size you *asked* for
#  silently truncates — the most expensive bug in troubleshooting.md.

# ── 4. FIELD REALITY. For every field the design depends on:
F=EventType
curl -s "$L/query?where=$F+IS+NOT+NULL+AND+$F+%3C%3E+%27%27&returnCountOnly=true&f=json"
#  A published field can be blank on every row. Compare against the total from step 2.

# ── 5. VALUE SHAPE. Before treating a column as a measure or a category:
curl -s "$L/query?where=1%3D1&outFields=$F&returnDistinctValues=true&f=json" \
  | jq '[.features[].attributes] | length'
#  84 distinct forms of a "diameter" means it is a string, not a number (troubleshooting.md §3).
#  Padded CHAR columns need trimming on every comparison.

# ── 6. EXTENT — does it actually cover your area of interest?
curl -s "$L/query?where=1%3D1&returnExtentOnly=true&f=json" | jq '.extent'

# ── 7. CORS POSTURE — decides the delivery route in §3.
curl -sI -H "Origin: http://localhost:8041" "$L?f=json" | grep -i access-control-allow-origin
curl -sI -X OPTIONS -H "Origin: http://localhost:8041" \
     -H "Access-Control-Request-Method: GET" "$L/query"
#  No ACAO header, or a 403 on preflight, means curl works and the browser will not.
```

**Spatial questions go in a POST body.** A long geometry blows past the shell's `ARG_MAX` — a
1,352-vertex polyline cannot ride in a query string. Use `--data-urlencode` against `/query` with
`geometry`, `geometryType` and `spatialRel`.

**Probe more than once before declaring anything dead.** Three consecutive 500s and three consecutive
successes an hour later is one intermittent endpoint, not one broken one. Write the suite so it passes on
either outcome, and say "intermittent" in the recipe.

---

## 3 · Three ways to deliver it, in order of preference

**The full decision — including the SSRF and open-relay rules any proxy must follow — is
[`cors-and-proxy.md`](cors-and-proxy.md).** Read it before writing a proxy.
The app-level summary:

1. **Browser-direct** — the layer answers with `Access-Control-Allow-Origin`. Nothing to run, nothing to
   operate, and the app stays a static bundle. **Every recent build is this. Prefer it.**
2. **A narrow allowlisted proxy** — only when the host answers keyless GETs with 200 and no ACAO, and 403
   to the preflight (curl works, the browser cannot). Allowlist the clients; everything else gets a 403.
   **Design the app to survive the route being deleted** — one build falls back to another register and
   says on screen that the calendar is not published as data. A proxy the app cannot live without is an
   operational dependency you have handed the user.
3. **Convert and publish to Strata Serve** — when the source is a bulk download, too large to fetch live,
   needs a join REST cannot express, or is a file rather than a service. `/convert` → GeoParquet →
   `/publish`, per [`publish-data.md`](publish-data.md). Also the escape
   hatch when a live host is an undocumented VM that may move — check whether a bulk FGDB or SHP carries
   the same data.

**Never** offer a keyed basemap or a keyed provider as part of the answer. Keyless OSM/CARTO only.

---

## 4 · The catalogue artifact

Each researched recipe produces one machine-readable catalogue, `<name>-catalog-<region>.json`, which is
the contract between research and code. Never hand-edit a generated one.

```jsonc
{
  "meta":   { "verified": "2026-08-09", "region": "California", "crawl": "…" },

  // Feeds this recipe verified on the internet — the part that gets harvested back
  // into whatever shared catalogue your recipe library keeps
  "external": [{
    "id": "ext:cpuc-adoption-100-20",
    "role": "adoption",
    "region": "California",
    "title": "CPUC EOY2024 Broadband Adoption — 100/20 Mbps",
    "url": "https://…/MapServer/0",
    "status": "verified-live",          // verified-live | intermittent | dead | not-mappable
    "count": 264137,                     // from the probe, not from the metadata
    "vintage": "EOY 2024",
    "fields": ["GEOID20", "HH_2020", "ACAT_100_20"],
    "gotcha": "field renamed ACAT_100_20 → ACAT_10020 between vintages"
  }],

  // The crawled estate this app can offer in a layer drawer
  "library": [{
    "id": "calfire-agol:AEU_Admin_Boundary",
    "title": "AEU Admin Boundary",
    "service": "AEU_Admin_Boundary",
    "server": "calfire-agol",
    "agency": "CAL FIRE (hosted)",
    "shelf": "Boundaries & Admin",
    "role": "reporting-frame",
    "queryable": true,                   // ONLY queryable FeatureServers reach a drawer
    "endpoints": { "featureServer": "https://…/FeatureServer" }
  }]
}
```

`status` and `gotcha` are not decoration — they are how a trap discovered once stops being rediscovered.
Harvest the `external` array back into your shared regional catalogue after adding feeds — a discovery
that stays siloed in one recipe folder gets rediscovered by the next recipe. Make the harvest idempotent
(replace a delimited block) so it can be re-run whenever a feed is added or re-verified.

---

## 5 · Roles, shelves and drawers

Tag every library entry with a **role** (what question it answers) and a **shelf** (where it sits in a
list). Roles are what let a layer drawer group 264 services into something navigable, and what lets a
sibling recipe find the layer you already verified.

Two rules the watershed build settled:

- **Only queryable FeatureServers reach a drawer.** A MapServer or a WAF-blocked host is a checkbox that
  ticks and paints nothing.
- **Nothing is silently truncated.** The list says `+N more, narrow the search to reach them`; a capped
  fetch says `Capped, not complete`.

And one caution: an automated role-tagger matched `\bfass\b` against `CalifAssemSenDists`. Word
boundaries are not semantic boundaries — spot-check the tagger's output.

---

## 6 · What disqualifies a layer

Stop and find another source when:

- The fields the design depends on are blank on every row *(and say so — that finding often reshapes the
  app: it is why one build is a map and not a search box)*.
- It publishes no coordinates at all. Mark it **not mappable** and refuse to toggle it.
- It is a group layer. Use the children.
- Its count and its ids disagree.
- Its licence does not permit redistribution, or it needs a key. Keyless or nothing.

None of these is a reason to fabricate. A lane with no data renders **empty with its citation**. Nine of
fourteen lanes in the pipeline pack render empty, because fabricating them in an app whose whole argument
is provenance would be self-defeating.

---

## 7 · Recording it

The recipe's data section carries, per layer: the URL, the authority, the count and date from the probe,
the OID field, the CORS posture, the fields actually used, and the trap. Paste the literal terminal
output — a figure that cannot be reproduced from the recipe is a figure nobody can defend when the
service changes.

Then write the assertions. **Live assertions are deliberate**: if the register changes, the suite goes
red and the constants are known stale rather than quietly wrong.
