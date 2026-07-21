# @strata/plugin-timeslider

A temporal **time slider** with **play/pause** as a `StrataPlugin`. It mounts a plain-DOM slider at the
bottom of the map container and, as it moves (or plays), builds a time `definitionExpression` per configured
layer and hands it to your `onApplyFilter`. Time values are **epoch-millis**. Plain-DOM, uses only
`app.getMap()` — works via the plugin/marketplace route and non-React hosts.

```ts
import { PluginManager } from "@strata/plugins";
import { timeSliderPlugin } from "@strata/plugin-timeslider";

const manager = new PluginManager();
manager.register(
  timeSliderPlugin({
    layers: [{ id: "flood-gauges", timeField: "reading_time" }],
    min: Date.parse("2026-07-01"),
    max: Date.parse("2026-07-14"),
    mode: "instant", // cumulative: reading_time <= t
    onApplyFilter: (layerId, where) => console.log(layerId, where),
  }),
);
manager.activate("strata-timeslider", app);
```

Options: `{ layers, min, max, step?, mode?, onApplyFilter?, playIntervalMs?, windowSize? }`.

- **`mode: "instant"`** builds a cumulative filter `<timeField> <= <t>`.
- **`mode: "window"`** builds a moving window `<timeField> >= <start> AND <timeField> <= <end>`.
- If `onApplyFilter` is omitted, the built `where` is logged to the console instead.

React apps can instead use the **`TimeSlider`** control in `@strata/core-map` (`react/controls`), which takes
the same options and emits `onApplyFilter` / `onChange`. Pair either with the **`TimeSeries`** widget
(`react/widgets`) to draw the flood **hydrograph** or wildfire acres-trend with threshold bands.
