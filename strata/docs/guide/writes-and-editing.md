# Writes and editing — what an app can change, and what it cannot

Most Strata apps are **read-only by design**, and that is a positioning decision as much as a technical
one. This page says exactly what can be written today, on which backend, and what is planned — so a
recipe promises what it can deliver and a demo is never the place a limit is discovered.

> **The one-line rule.** **Strata Serve is read-only.** Feature edits need a **writable and
> authenticated ESRI backend**. Everything else an app "changes" is a *reading*, and it leaves as an
> **export**.

---

## 1 · The three things people mean by "can it write?"

They are different questions with different answers, and conflating them is how a demo goes wrong.

| What they mean | Answer today |
|---|---|
| *"Can the app change the underlying features — attributes, geometry, add, delete?"* | **Yes, on an ESRI backend.** No, on Strata Serve. See §2. |
| *"Can a person record a decision — a status, a note, an approval — against a feature, and will it still be there tomorrow?"* | **No.** Nothing persists between sessions. This is the gap, and §4 scopes it. |
| *"Can the app change what is on screen — filters, styling, the layer list, the estate itself?"* | **Yes, always.** None of that is a write. It is state, and it round-trips through the share link. |

The third is where most of the apparent "editing" in a Strata app lives, and it is worth being precise
in front of a customer: **changing the reading is not changing the record.**

---

## 2 · Feature edits — the ESRI path, which is supported

A customer who already runs ArcGIS gets real feature editing today. This is the coexistence story
working exactly as positioned: keep the Esri licences, run Strata for the web-facing app.

**What is involved:**

- **`@strata/feature-arcgis`** → `applyEdits({ url, adds, updates, deletes, authentication })`.
- **`@strata/auth-arcgis`** → `createArcGISAuth({ backend, portalUrl, … })`. It **throws for a
  `strata` backend** by design, so a misconfiguration fails loudly at the seam rather than silently at
  the save button.
- **The `edit` widget** (`EditPanel`) — an attribute form that saves, adds and deletes through
  `applyEdits`. **It always shows a banner naming the backend it needs**, before anyone presses Save.
- **The `attachment` widget** (`AttachmentViewer`) — paging and viewing attachments. This one is a
  **read** and works on Strata Serve as well.

**Both are placeable in an `AppLayout`** (`type: "edit"`, `type: "attachment"`) and are configured from
`recipes/COMPONENT-MANIFEST.md`. Reads — query, statistics, related records, viewing attachments — work
against **both** backends and need none of this.

**Never store or print a password.** Mint a short-lived, referer-bound token.

---

## 3 · Everything else leaves as an export

On a Strata Serve backend, an app's output is a **document, not a row**. This is not a workaround; it
is what the read-only suites are built to do, and every export carries its sources and vintages:

- a composed print **PDF**, an image, a **feature report**, an atlas;
- the layer data as **CSV or GeoJSON**;
- a **share link** that reopens the app in the exact state the reader had.

**Say this in the pitch.** An app that assembles evidence and hands over a defensible document is a real
product with a real buyer. What it is not is a system of record, and a customer who needs a queue that
commits should hear that in the first meeting rather than the third.

---

## 4 · Planned (Phase 8) — the annotation store

> **Planned. Not built. Do not design a recipe against it, and do not put it in a proposal as
> shipped.** This section exists so that when it is funded, it is built once and small.

### The problem it solves

Every read-only app hits the same wall at the same moment. The reader has done the work — screened the
site, found the lease event, ranked the retrofit duty — and now wants to **record what they decided**.
Today that decision leaves as an export and the app forgets it. The consequence is commercial, not
technical: **an app that forgets is opened at decision moments, and an app that remembers is opened
weekly.** That difference is the difference between a one-off purchase and a subscription.

### The scope, and it is deliberately tiny

A per-feature annotation. **Not** feature editing, **not** a workflow engine, **not** a system of
record.

```jsonc
{
  "id":        "uuid",
  "layerId":   "sites",           // the layer the note is about
  "featureId": "12345",           // its OID or stable id, as a string
  "status":    "optioned",        // one value from an app-declared list
  "note":      "Walked 12 Mar…",  // free text, optional
  "author":    "…",               // who, from the session
  "createdAt": "2026-09-08T…Z",
  "updatedAt": "2026-09-08T…Z"
}
```

**Five fields and two timestamps.** A status, a note, an author, a time. Nothing else, and specifically:
no assignment, no due dates, no state machine, no approvals, no attachments. Each of those is a product
decision that would have to be made once for every vertical, and making them is how a small capability
becomes a workflow engine nobody asked for.

### What it must satisfy

1. **The annotation is beside the feature, never inside it.** It is stored under its own key and joined
   on read. It never mutates the served feature, so the layer stays exactly as read-only as it is now,
   and a customer's authoritative data is never touched by an app.
2. **The status vocabulary is declared by the app**, in the `AppLayout`, not invented per user — so two
   readers of the same app mean the same thing by "screened".
3. **Identity is required.** An annotation carries an author, so this needs a session identity before
   it needs storage. **Authentication is the real dependency, not the database.**
4. **It reads back as a data source.** An annotation set must be bindable like anything else — a
   `table`, a `chart`, a filter — or it is a note nobody can count.
5. **It exports.** The annotations leave with the reading, or they become a second silo.
6. **Absence is legible.** An app whose store is unreachable renders the annotation column **empty with
   its reason**, exactly as an unsourced lane does, and stays usable.

### What it unlocks, concretely

- The acquisition tray that **commits**: a site marked *optioned* or *walked* is still marked tomorrow.
- The lease-event list a head of real estate **works down** over a quarter.
- The retrofit duty register with **discharged** ticked off against a phase date.

### What it does not become

If the scope grows past the object above, it stops being an annotation store and becomes the workflow
engine — at which point the honest answer is the ESRI path in §2, or a system of record the customer
already owns. **Growth here should be refused by default.**

### Sequencing

It is scoped **after** the customer-data path (the `upload` widget), on purpose: an annotation store is
only worth building over data the customer owns. Building it over a demonstration dataset would prove
nothing.

---

## 5 · What to say, and what not to say

| Say | Do not say |
|---|---|
| "Edits need a writable ArcGIS backend, and we support that today." | "Strata can edit your data." |
| "Strata Serve is read-only. Decisions leave as an export." | "Editing is coming soon." |
| "Recording a decision in the app is planned; here is what it will and will not do." | Any date, or any implication it is present. |
| "Changing the reading is not changing the record." | Demonstrating a filter as though it were a save. |

**Related:** `strata/docs/guide/building-apps.md` (the gate) · `recipes/COMPONENT-MANIFEST.md`
(configuring `edit`, `attachment` and `upload`) · `strata/docs/how-to/export-maps.md` (what an export
actually produces).
