# Building an app

What a finished strata-app-builder application **is** — the artifact you hand back, how it is put
together, and the gate it must pass. `app-design.md` covers how to design one; this page covers how to
build and verify it.

Companions: **[`help/find-and-verify-data.md`](../how-to/find-and-verify-data.md)** (before you write
code) · **[`troubleshooting.md`](../troubleshooting.md)** (what goes wrong) ·
**[`app-design.md`](app-design.md)** (how to design what you are building) ·
**[`recipes/README.md`](../../../recipes/README.md)** (what a recipe must supply).
The build gate is §7 of this page.

---

## 1 · The deliverable

A **self-contained application**: MapLibre from a CDN, no bundler, no dependencies, no API keys. It
runs from a folder with `node server.mjs`.

```
app/
  index.html            the shipped app — theme tokens, the shell, one inline module
  <domain>.mjs          the domain. DOM-free. Every network call through an injectable `net.fetch`
  layers.mjs            presentation — the map spec as genuine ESRI Web Map JSON, palette, Esri→GeoJSON
  server.mjs            zero-dependency static server. Opens no sockets of its own
  test-<domain>.mjs     LIVE suite     — arithmetic, service contracts, the traps
  test-render.mjs       OFFLINE suite  — boots the shipped module against a DOM + MapLibre stub
  drive.mjs             BROWSER suite  — real headless Chrome over CDP, no dependencies
  README.md             the record (§5)
  <name>-catalog-<region>.json   generated, never hand-edited
```

Why this shape and not `<StrataApp>`: the React path needs `strata/packages/*` installed and built. When
that is available, render the `AppLayout` the recipe authors. When it is not, this is the house pattern —
and the recipe must say which one it shipped, because the two must eventually be reconciled.

---

## 1b · The shell every app inherits

`index.html` carries the same skeleton in every build, so a reader who has used one recognises the next:

```
┌ header — title · the controls that change the reading ───────────────┐
├ #notice — persistent caveats (vintage, banding, "advertised not measured") ┤
├──────────────────╥───────────────────────────────────────────────────┤
│ the reading      ║  MAP  ── control cluster top-right                │
│ (KPIs, gauge,    ║        drawer opens beside it, one at a time      │
│  derivation)     ║        legend bottom-left · lon/lat/zoom bottom-right │
├──────────────────╨───────────────────────────────────────────────────┤
│ table / detail — scoped to the current reading, re-titled with it     │
└ #status — transient progress only ───────────────────────────────────┘
                   ╨ every panel edge is a grip: drag or arrow-key it
```

**Panels are resizable — the reading column, the drawers, the table.** The width you author is where a
panel *opens*; the reader decides where it sits. A grip on the edge facing the content, a floor below
which the panel stops being readable, arrow keys on the focused grip, and `map.resize()` after the box
changes. In the React path this is the shell's own behaviour (`resizable` defaults true on `PanelShell`
and on the `panel` node); in the house pattern below you write it, and §3's harnesses assert it.

**The map chrome is one cluster and one drawer.** Six glyphs in a 32 px stack — zoom in · zoom out ·
fit · layers · basemap · legend — MapLibre's own zoom suppressed, and a single drawer opening *beside*
the cluster, never over it, never two at once. Layers are square checkboxes (multi-select, each row
saying *off* / *N in view* / *none in this view*); basemaps are **round radios** with a live tile of the
current area in each style, because a colour swatch cannot tell Positron from Voyager. `L` · `B` · `G` ·
`F`, `Esc` closes one thing. The React path ships this as `MapChrome`; the house pattern writes it, and
the two use the same class vocabulary so they look identical.

**The legend is a control surface, and the table row is a toggle.** Click a legend class to hide it,
shift-click to isolate, `Esc` clears — filtering the layer, never fading it, with counts that keep their
denominator. Click a table row to **adopt** the record: the map flies to *that feature* and opens its
popup. Click it again to **release**: selection cleared, popup closed. Whatever adopts must also release,
by the same gesture.

Deviate when the business needs it, and say so in the recipe. The full default set — chrome, keyboard,
interaction floor, honesty surfaces, theme — is [`app-design.md`](app-design.md) §0.

## 2 · The rules that make the numbers trustworthy

**One domain module, imported unchanged by the browser and by both suites.** No number can reach the
screen that the suite has not asserted. If the app computes it, the test computes it from the same code.

**The domain is DOM-free and its network is injectable.** `net.fetch` is a parameter, which is what lets
the offline suite run a synthetic dataset through the real logic in a second.

**Derive counts from state; never hardcode them.** A hardcoded total means adding a row silently moves
the number on the splash screen — and a test asserting the constant is itself wrong.

**Assert against live services on purpose.** If the register changes, the suite goes red and the
constants are known stale rather than quietly wrong. A quarterly republication *should* make you re-read
the numbers.

**Nothing is synthesized.** A lane with no data renders **empty with its citation**.
*The one legitimate exception is a demo inventory the app openly generates* — and it earns that only by
being **seeded** (so it is stable across runs), **derived from statutory or published figures rather than
from geometry**, **filtered** so it cannot attach to the wrong features, and **labelled on screen** as
generated. It is never presented as measured, and never mixed into a figure that is. Nine of fourteen
lanes in one shipped pack render empty, because fabricating them in an app whose argument is provenance
would be self-defeating. No sample data, no mock rows, no plausible placeholder.

**Nothing is silently truncated.** Every cap says so on screen: `+N more`, `Capped, not complete`,
`250 of 1,975 rows`. A silent top-N reads as "this is everything."

**No write path.** Reads only, so the app runs identically on Strata and on ArcGIS.

**Keyless basemaps only** — the OpenFreeMap / Versatiles vector styles first, raster OSM / OpenTopoMap
behind them. EPSG:4326 everywhere. "Keyless" is asserted as a *behaviour*, never as a URL pattern: a gated
host answers HTTP 200 with a placeholder that every URL-shaped check calls healthy.

---

## 3 · Three harnesses, because each is blind to what the next one sees

Run all three. They are not redundant; each caught defects the others reported green.

> **How to write them** — the injectable seam, the stack-based DOM stub, the faithful MapLibre stub, the
> hand-rolled CDP driver, and what each harness must assert — is the **`strata-app-build`** skill
> (`.claude/skills/strata-app-build/`). It is instructions, not a library: there is nothing to import.
> This section says what the harnesses are *for*; the skill says how to build them.

### `test-<domain>.mjs` — live
Arithmetic, the join, the reading, **the traps inverted on purpose**, service contracts, geometry,
context layers. Assert each trap's *presence*, so the day a service fixes itself you find out.
Typical size: 130–360 assertions.

### `test-render.mjs` — offline, deterministic
Boots the **shipped** module against a minimal DOM + MapLibre stub over synthetic data and drives every
gesture. Four requirements learned the hard way:

- **`node --check` the shipped module before asserting anything about it.** A duplicate `const` made an
  app a blank shell while this suite grepped the markup and reported **99/99 green**. Negative-test the
  guard: injecting a duplicate `const` must fail and name the line.
- **Mount the page's real `<body>`,** not just what the script creates — a harness that only sees
  generated DOM cannot see the app's static chrome.
- **Model `window` as the global object.** A separate `window` silently swallows the app's export hook.
- **One stack-based parser** for the body *and* every dynamic `innerHTML`, supporting ordinary descendant
  selectors. An id-only scan forces you to rewrite the app to suit its test, which is backwards.

The MapLibre stub is deliberately dumb — it records calls — **except where the bugs live, where it must
be faithful**: `setStyle` fires `styledata` synchronously and *then* drops every source and layer; a
finished render fires `idle`, so `idle → hydrate → paint → setData → idle` is a real loop. A stub that
fires `idle` once from a timer reproduces neither.

### `drive.mjs` — real headless Chrome over CDP
No dependencies; a hand-rolled CDP client is ~200 lines. This is not optional. **297 passing assertions
once missed four defects that a single screenshot made obvious** — all semantic or spatial. The static
and render harnesses catch *wiring and arithmetic*; only rendering catches *meaning*.

Drive: the signature loop, the map chrome geometry (that a drawer clears the cluster), both themes,
every toggle, that a resized panel actually changes the map's box (the canvas follows, and no chrome is
stranded), and that the app opens on a view where its own signature is visible.

> **Assert behaviour, not prose.** A keyless-basemap guard once grepped `server.mjs` for `proxy` and
> matched the file's own explanatory comment. Narrowing the regex weakens the guard — instead assert that
> the server opens no sockets: no `fetch(`, no `http.request`, no `createConnection`, and it imports only
> `fs`/`http`/`path`/`url`.

---

## 4 · The app must survive first contact

- **`server.mjs` steps to the next free port**, bounded, and says so. A stack trace on the first command
  of a demo is a bad first impression — and the port *will* be busy, because sibling dev servers are
  often still listening.
- **Path-traversal guard**, verified against encoded payloads.
- **A global error handler.** An app that throws during boot otherwise shows a confident dash where a
  number should be, with nothing in the console.
- **Fix the favicon 404.** A noisy console is where a real error goes to hide.
- **Report your own state.** A status readout that distinguishes `130 drawn` from `130 drawn of 874`
  from `layer not installed` turns a support question into a glance.

---

## 5 · The README is part of the deliverable

Not a description of the code — the record of what was built and what it cost. In this order:

1. **How to run** — the four commands, with assertion counts and timings.
2. **The question** the app answers, in one sentence.
3. **The silhouette** — how the design works, and what the signature interaction is.
4. **The interaction surface** — every wired behaviour, **numbered**, each exercised by a named suite.
   *Enumerating them is not bookkeeping; it is what makes the count visible and therefore honest.*
5. **Files** — one line each, what it owns.
6. **What building it changed** — the corrections, with the mechanism. This is the most valuable
   section in the file and the source the next build harvests.
7. **Theme rationale** — measured, not asserted (see [`troubleshooting.md`](../troubleshooting.md) §8).
8. **Honest limits** — what is not built, what is not measurable, what needs a subscriber file.

### The floor is 3. The shipped bar is 40.

`app-design.md` §0 sets **≥3 live connections** as the minimum an app may ship with. That is a floor, and
a floor is not a target — an app that clears it and stops reads as a demo.

Recent builds land at **40–51 numbered behaviours**, and they got there because §5.4 forces the count to be
written down: a table you must fill in is a target you can see yourself missing. Before calling an app
done, read your own §5.4 and ask what a user would reach for next that is not on the list — the KPI that
should be clickable, the row that should drive the map back, the legend class that should isolate, the
reading that should be shareable as a link.

**The shape of that surface, from the shipped apps:** the signature loop and its release · a second way in
(map click ⇄ list click) · keyboard for the primary dimension · every filter chipped and clearable ·
each KPI selecting the population it counts · legend isolate · layers and basemap drawers · **each panel
resizable, by pointer and by keyboard** · theme · export carrying its caveat · a deep link · `Esc`
unwinding one thing at a time. That is already ~20 before any domain-specific behaviour.

---


## 7 · The build gate

Run this before reporting an app finished. Every line is checkable; none is a judgement call. If a line
fails, the app is not done — fix it or state the failure in the handback. **Never report a partial pass
as a pass.**

**Design acceptance is a separate, earlier gate:** the ship checklist in
[`app-design.md`](app-design.md) §7. Both must pass; this one covers what only exists once the app is
*built*.


### The handback

State plainly:

> **N assertions green** (a live + b offline + c browser), verified `<date>`. Runs at
> `node server.mjs` → `http://localhost:<port>/`.
> **Honest limits:** …
> **Unverified:** …

If any section failed, say which and why. A build that reports green while a section failed is worse than
one that reports the failure — the point of this file is that the numbers on the screen can be defended.
