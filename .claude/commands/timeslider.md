---
description: Add a time slider (play/pause temporal filter) to time-aware layers, driving a definitionExpression on a time field.
argument-hint: <layerId> --field <timeField> [--mode instant|window] [--range <start>..<end>] [--step <ms>]
---

Add the **`TimeSlider` control** (`@strata/core-map/react/controls`) so the user can animate a time-aware
layer over an epoch-millis range. The slider builds a time **`definitionExpression`** on the chosen time
field and filters the layer live:
- **instant** mode → `<field> <= <now>` (cumulative).
- **window** mode → `<field> BETWEEN <a> AND <b>` (a moving window).

## Steps
1. Confirm the layer has a **time field** (epoch millis, or a date the server can compare). Read the real
   field name from the service (`.../<layer>?f=json`) — never invent it.
2. Determine the `[start, end]` range (min/max of the time field, or `--range`), the play `--step`, and
   `--mode` (default `window`).
3. Wire the `TimeSlider` (play/pause) to set the layer's `definitionExpression` as it animates. Pair it with
   a **`TimeSeries`** widget (hydrograph / trend, see `/panel time-series`) when a chart of the same field
   helps.
4. For a plain-DOM / non-React or plugin/marketplace host, use **`@strata/plugin-timeslider`** (the same
   slider as a `StrataPlugin`, uses only `app.getMap()`).

Note the time filter is just an ESRI `definitionExpression` on a time field — it round-trips in `layers.json`
and stacks with any other filter (`/panel filter`). Keep everything EPSG:4326.
