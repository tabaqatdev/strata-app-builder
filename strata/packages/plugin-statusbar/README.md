# @strata/plugin-statusbar

A GeoLibre-style **map status bar + scalebar** as a `StrataPlugin`: live cursor **coordinates**, **zoom**
level, a graphic **scalebar** with a distance label, and the **coordinate system (CRS)**. Plain-DOM, uses
only `app.getMap()` — works via the plugin/marketplace route and non-React hosts.

```ts
import { PluginManager } from "@strata/plugins";
import { statusBarPlugin } from "@strata/plugin-statusbar";

const manager = new PluginManager();
manager.register(statusBarPlugin({ crs: "EPSG:4326", precision: 5 }));
manager.activate("strata-statusbar", app);
```

Options: `{ crs?, precision?, scalebarTargetPx? }`. React apps can instead use the **`StatusBar`** control in
`@strata/core-map` (`react/controls`), which takes the live `map` and renders the same info.
