---
description: Show what strata-app-builder can do and the task how-tos (create app layouts, symbology, export, publish).
---

Summarize the available commands and point to the task how-tos in `strata/docs/how-to/`:

- **Create an app in a layout** → `strata/docs/how-to/create-app-layouts.md` (`/create-map --preset …`, `/panel …`).
- **Compose a declarative app** (dashboard/gallery/story via `<StrataApp>`) → `/app`.
- **Change symbology** → `strata/docs/how-to/symbology.md` (`/symbology`, `/update-symbology`).
- **Author a popup** → `/popup`, `/update-popup`.
- **Add a panel** (filter/list/table/statistics/chart/**carto**/**edit**/**attachment**/**time-series**/**statusbar**) → `/panel`.
- **Add a time slider** (animate time-aware layers) → `/timeslider`.
- **Enable editing** (writable + authed ESRI backend) → `/edit`; **view attachments** → `/attachments`.
- **Convert & publish data** → `strata/docs/how-to/publish-data.md` (`/convert`, `/publish`, `/update-metadata`).
- **Export a map** → `strata/docs/how-to/export-maps.md` (`/export image|pdf|map|layer` — PDF + layer-data GeoJSON/CSV now real).

Also point to the connectivity how-to → `strata/docs/how-to/cors-and-proxy.md` (blank layers = CORS).

**The onboarding trio — surface this to the user:** **`/new-app` to build · `/guide` to decide · `/help` to
look up.** Use `/what-can-i-do` for a full capability list.

**Docs map:** `strata/docs/README.md` (index) · `strata/docs/guide/` (per component) · `strata/docs/how-to/`
(task how-tos) · `strata/docs/reference/commands.md` · `strata/docs/faq.md` · `strata/docs/troubleshooting.md`.

If the user's request maps to a command, run it; otherwise route them via `/guide` or the closest how-to.
