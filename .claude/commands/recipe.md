---
description: Build a finished application from a recipe — wizard, verify the data first, build, run three suites, drive it in a browser, then gate.
argument-hint: [recipe name or path to a RECIPE.md, e.g. mapviewer | showcase]
---

Build a **finished** application from a recipe — research verification through to something that can be
handed to someone. Not "scaffold and print the run command."

**Read first, in this order:** `strata/docs/how-to/find-and-verify-data.md` ·
`strata/docs/troubleshooting.md` (the traps) · `strata/docs/guide/app-design.md` (the design rules) ·
`strata/docs/guide/building-apps.md` (the artifact + the gate). Then the recipe, against
`recipes/README.md` ("Recipe anatomy — the contract").

---

## 0. Resolve and read

Match `$ARGUMENTS` to a `RECIPE.md`, in this order:

1. **A path** — use it as given. **This is the usual case:** you bring your own `RECIPE.md`, wherever it
   lives, and point `/recipe` at it.
2. **`recipes/<name>/RECIPE.md`** — the bundled reference recipes (`nearby`, `mapviewer`, `showcase`).
3. **`.private/solution_recipes/<name>/RECIPE.md`** — *if that folder exists in your working copy.* A
   public clone will not have it. `<name>` is `<category>_<solution>`; match on either half, so
   `/recipe flood-early-warning-map` resolves. Proprietary: build them, never publish their contents.
4. **The app the user described**, matched against the folder names in whichever locations exist.

If you cannot find one, ask for the path rather than inventing a recipe. With no argument, list what is in
both locations and ask (or suggest `/new-app`).

The app is built into **`<recipe-folder>/app/`** unless the user says otherwise — beside the recipe that
specifies it, so the two travel together.

Read it whole, then check it against `recipes/README.md` → Required sections. A recipe missing **§3 Data sources**
or **§4 Verify** is a **scaffold**, not a recipe — say so and stop, then offer to run the probe. §5 of the
spec gives the behaviour for every other missing section. **Never invent §3 or §4 content.**

## 1. Wizard, if the recipe has one

If the recipe carries a `## Guided wizard`, run it as the configuration wizard before building: one screen
per group, one line teaching each option, defaults set so "accept all" works, progressive disclosure
(App + Data first). The wizard **only collects properties** — it never invents data or widens scope.
Echo a one-line summary and wait for a go-ahead.

## 2. Verify the data — before writing any code

Run the recipe's §4 verify block. If it has none, run the seven-step probe from
`help/find-and-verify-data.md` §2 against every service the design depends on, and paste the literal
output back into the recipe.

Confirm, per layer: identity (`objectIdFieldName`, geometry type, spatial reference) · count *and* ids ·
**the real page size** · that every field the design needs is actually populated · value shape · extent ·
CORS posture.

**Stop and report if a service disqualifies itself.** A blank field or a missing server is a finding that
reshapes the app — one build became a map rather than a search box for exactly this reason. Surface it;
do not quietly work around it. Probe an apparently-dead endpoint more than once before calling it dead.

## 3. Design

Work from the recipe's §2 under `guide/app-design.md` — silhouette first, then the archetype's signature
loop. Where the recipe leaves the design open, follow `recipes/DESIGN-REQUEST-PROMPT.md`. Bind only to
fields verified in step 2. Choose the delivery route per layer (`help/find-and-verify-data.md` §3);
prefer browser-direct.

Confirm the plan in a few lines before building: the silhouette, the signature loop, the layers and their
routes, and anything step 2 disqualified.

## 4. Build

Load the **`strata-app-build`** skill — it carries how to write the server, the seam and all three
harnesses. Build to the shape in `guide/building-apps.md` §1, holding its §2 rules while writing rather
than afterwards:
one DOM-free domain module with injectable `net.fetch`, counts derived from state, nothing synthesized,
nothing silently truncated, no write path, keyless basemaps, EPSG:4326.

Write the suites **as you build**. Assert each trap the recipe records as present.

## 5. Run all three suites

```bash
node test-<domain>.mjs     # live
node test-render.mjs       # offline — node --check FIRST, then drive the loop
node server.mjs &          # then:
node drive.mjs <port>      # real headless Chrome over CDP
```

All three are required — they are blind to different classes of defect (`guide/building-apps.md` §3). A
green offline suite has reported 99/99 on an app that was a blank shell, and 297 green assertions have
missed four defects one screenshot made obvious.

## 6. Drive it and look at it

Open the running app. Screenshot the first paint. Check that it **opens on a view where its own signature
is visible** — that failure has shipped with every non-visual suite green. Exercise the signature loop,
both themes, every drawer.

Corrections found here go into the README's "What building it changed" with their mechanism; any new trap
goes into `strata/docs/troubleshooting.md`, marked and dated.

## 7. Gate and hand back

Walk `guide/app-design.md` §7 (design) and `guide/building-apps.md` §7 (build) line by line. Report in the
form the handback section specifies: the three assertion counts, the verification date, the run command,
the honest limits, and anything unverified.

**If a section failed, say which and why.** Never report a partial pass as a pass.

---

## Rules

- **Verification precedes code.** A field name never enters the app until a response has shown it. This is
  the rule the other rules exist to protect.
- **Never fabricate** a service, a field, a count, or a sample row. No data ⇒ render empty with the
  citation.
- **Confirm side effects** — publishing, installing, or anything that writes outside the app folder.
- **Preserve the ESRI Web Map JSON contract**: styling is genuine `drawingInfo`, popups are genuine
  `popupInfo`.
- **Later builds outrank earlier ones.** Where two recipes or two app READMEs disagree, the newer date
  wins; the earlier apps are not the quality bar.
- **A `[core]` trap must be re-verified against `strata/packages/` before its workaround is applied** —
  several early workarounds are now obsolete (`strata/docs/troubleshooting.md` §11).
- **Business solution recipes are proprietary.** Reference them by name; never publish their contents.
