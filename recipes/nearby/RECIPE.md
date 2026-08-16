# Recipe — Nearby (Instant App) on strata-app-builder

Reproduces the ArcGIS **Nearby** Instant App: *find sites of interest close to an address, adjust the search
radius, and get directions.* This is the **search + proximity + routing showcase** — it exercises
`@strata/plugin-search`, `@strata/processing` (within-distance + nearest), and `@strata/plugin-routing`.
Universal data, keyless (OSM/OSRM defaults).

## 1. Study
Nearby helps a user geocode an address, then find focused features (e.g. schools, hospitals — here: cities /
recent earthquakes) **within a distance**, adjust the radius, sort by distance, and **get directions** to a
selected result. Our equivalent: geocode via Nominatim, buffer/within via Turf, route via OSRM.

## 2. UI design spec (Template: `nearby-finder` — the buffer ring is the signature)
- **Layout:** `SplitDashboard` — map left; a right panel with a **search box**, a **radius control** (slider
  / input, km), a **results list** (name + distance, sorted nearest-first; click → highlight + zoom + popup),
  and a **directions** toggle.
- **Interactions:** enter an address → geocode → drop a "from" marker + draw the radius circle → list features
  within the radius (or the **N nearest**); select a result → optional **route line** + distance/time.
- **Theme:** clean; the radius circle in a translucent accent; results highlighted on the map.

## 3. Data (universal, keyless)
- **Natural Earth populated places** (points) as the "sites of interest" — or **USGS earthquakes**
  (`all_month.geojson`) for a live "recent quakes near me" variant.
- **Geocoding:** `@strata/plugin-search` `nominatimProvider` (OSM, keyless). **Routing:**
  `@strata/plugin-routing` `osrmProvider` (public OSRM, driving).

## 4. Verify each source first (terminal)

**Reference recipe** (`../README.md` → Two classes) — universal keyless sources, but still probed.
Literal output recorded **2026-08-11**.

```bash
# ── THE LIVE VARIANT: USGS all-month feed. Keyless, CORS "*", browser-direct.
curl -s "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson" -o q.json
#  -> http 200, 7,733,857 bytes
node -e 'const j=JSON.parse(require("fs").readFileSync("q.json","utf8"));
         console.log(j.features.length, j.metadata.count, typeof j.features[0].id)'
#  -> 10895   10895   string        <- count agrees with metadata.count ✓

# ── TRAP N1 — THE FEATURE ID IS A STRING, NOT A NUMERIC OID.
#    j.features[0].id === "ci40670466". Anything that coerces it to a number matches nothing and
#    reports a cheerful zero. Key selection on the string.

# ── TRAP N2 — `time` IS EPOCH MILLISECONDS, NOT AN ISO STRING.
#    typeof properties.time === "number". A time slider must build its definitionExpression in ms.

# ── FIELD REALITY — the two fields the results list binds to are populated on every row:
#    mag   null on 0 of 10895
#    place empty on 0 of 10895

# ── CORS — browser-direct, no proxy needed:
curl -sI -H "Origin: http://localhost:8041" "https://earthquake.usgs.gov/.../all_month.geojson"   | grep -i access-control-allow-origin
#  -> Access-Control-Allow-Origin: *
```

⚠ The feed is a **rolling month** — the count changes every run. Assert the *shape* (count agrees with
`metadata.count`, id is a string, `mag`/`place` populated), never a fixed feature count.

The **cities** variant uses the bundled `examples/quickstart/data/world-cities.geojson` — offline, no
probe needed, but state which file and its field list in §3.

## Guided wizard (launch like an Instant App)
Claude runs this **configuration wizard** the way ArcGIS Instant Apps do — ask each group, apply the default,
confirm the summary, then build. In **Cowork** ask with the multiple-choice question tool; in **Claude Code**
ask it as a short interview (or run `/recipe nearby`). Every answer feeds a step of the prompt-script (§4).

| # | Wizard question | Options → **default** | Feeds |
|---|---|---|---|
| 1 · App | Title & subtitle? | free text → **"Nearby finder"** | header |
| 2 · Data | Universal sample or your data? | sample cities · **your FeatureServer URL** · Strata dataset · local file → **sample cities** | §A |
| 3 · Sites | Which "sites of interest" layer + geocoder? | the loaded points · Nominatim (OSM) → **loaded points / Nominatim** | §A, §B |
| 4 · Radius | Default search distance + units? | number · km/mi → **5 km** | §B, §C |
| 5 · Results | Max results + sort order? | N · nearest-first/farthest → **25, nearest-first** | §C |
| 6 · Directions | Draw directions to a selected result? | yes (OSRM) / no → **yes** | §D |
| 7 · Theme | Theme + language? | light/dark · EN / EN+AR (RTL) → **light / EN** | styling |
| 8 · Export | Offer image / PDF / data export? | yes / no → **yes** | export |

**Then:** Claude echoes a one-line summary of the choices, waits for confirmation, and runs §4 with them.

## 4. Prompt-script
```
A. /new-app — a "Nearby" finder. SplitDashboard: map left; right panel = search box + radius slider (km) +
   results list + a directions toggle. Load the universal cities layer (or USGS earthquakes for a live
   variant). Install deps + run command.
B. Enable search: register @strata/plugin-search (nominatimProvider). On a geocoded address, drop a marker,
   fit the map, and draw a radius circle (Turf buffer via @strata/processing).
C. Proximity: with @strata/processing, list cities within the radius of the address (withinDistance), sorted
   nearest-first (nearest / haversine). Show name + distance; click a result → highlight + zoom + popup.
D. Directions: register @strata/plugin-routing (osrmProvider). On selecting a result, draw the route line
   from the address and show distance + duration.
E. Let the user change the radius; the list + circle update live.
```

## 5. Verify
Geocoding drops the marker + circle; the results list shows features within the radius sorted by distance;
changing the radius updates live; selecting a result draws a route with distance/time. Matches the Nearby app.

## 6. Harvest
✅ **Shipped:** the reusable **`near-me`** widget (locate → radius slider → results list → select), and
**drive/walk-time isochrones** via `@strata/plugin-routing` `fetchIsochrone` (keyless self-hosted Valhalla or
keyed ORS) — add the returned polygons as a service-area layer instead of a plain radius circle. Remaining: a
built-in radius-circle helper and a directions panel. Note OSRM/Nominatim are public demo services (self-host
or add an API for production). See the [Human Language Reference](../../strata/docs/reference/human-language.md) §6/§9.

## Sources
[Nearby (Instant Apps)](https://doc.arcgis.com/en/instant-apps/latest/create-apps/nearby.htm) · [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/) · [OSRM](http://project-osrm.org/) · `..---

## Modernization (parity release)

- **Declarative proximity:** wire `sketchComplete → selectByGeometry` and use the **`analysis`** widget (buffer / within-distance) so "find sites near here" is authored, not hand-coded.
- **Results in a window/panel:** show the ranked nearby list in a dockable **`panel`** or a **`window`**; add a `basemap` widget.
- **Theme:** structured `theme` for the search + results UI.
