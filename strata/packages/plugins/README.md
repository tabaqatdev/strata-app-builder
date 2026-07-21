# @strata/plugins

The strata-app-builder plugin system. It is modelled on [GeoLibre](https://github.com/)'s plugin API
but **ESRI Web Map JSON-native**: plugins operate on `OperationalLayer`s and genuine ESRI
`renderer` / `popupInfo` JSON, never on a bespoke styling DSL.

## The contract

A plugin implements `StrataPlugin`:

```ts
interface StrataPlugin {
  id: string;
  name: string;
  version: string;
  activeByDefault?: boolean;

  activate(app: StrataAppAPI): boolean | void; // return false to veto
  deactivate(app: StrataAppAPI): void;

  getProjectState?(): unknown;                       // persist a slice into a saved project
  applyProjectState?(app: StrataAppAPI, state: unknown): void;

  urlParameterNames?: string[];                      // deep-link params this plugin owns
  handleUrlParameters?(app: StrataAppAPI, params: URLSearchParams): void | Promise<void>;
}
```

The host hands each plugin a `StrataAppAPI`:

```ts
interface StrataAppAPI {
  setBaseMap(bm): void;
  addOperationalLayer(layer): string;   // -> registered layer id
  removeLayer(id): void;
  setRenderer(id, renderer): void;      // genuine ESRI renderer JSON
  setPopup(id, popupInfo): void;        // genuine ESRI popupInfo JSON
  fitBounds(bbox): void;
  getMap?(): unknown;                    // e.g. the MapLibre Map, if exposed
  getStore(): StrataStore;               // the @strata/state store
  registerPanel?(panel): void;           // plain-DOM panels (see below)
  unregisterPanel?(id): void;
  registerToolbarMenu?(menu): void;
  unregisterToolbarMenu?(id): void;
}
```

### Panels are plain DOM

External plugins can't share the host's React tree, so UI contributions use a plain-DOM
contract — exactly like GeoLibre:

```ts
interface StrataPanel {
  id: string;
  title: string;
  placement?: "left" | "right" | "bottom" | "modal";
  render(container: HTMLElement): void | (() => void); // returned fn runs on unmount
}
```

## Writing a plugin

```ts
import type { StrataPlugin } from "@strata/plugins";

export function measurePlugin(): StrataPlugin {
  return {
    id: "acme.measure",
    name: "Measure",
    version: "1.0.0",
    activate(app) {
      app.registerPanel?.({
        id: "acme.measure.panel",
        title: "Measure",
        placement: "right",
        render(container) {
          container.innerHTML = `<button id="m">Measure</button>`;
          const onClick = () => app.fitBounds([-10, -10, 10, 10]);
          container.querySelector("#m")!.addEventListener("click", onClick);
          return () => container.querySelector("#m")?.removeEventListener("click", onClick);
        },
      });
    },
    deactivate(app) {
      app.unregisterPanel?.("acme.measure.panel");
    },
  };
}
```

## Using the manager

```ts
import { PluginManager, basemapPlugin } from "@strata/plugins";

const manager = new PluginManager();
manager.registerAll([basemapPlugin({ /* basemap */ })]);
manager.activateDefaults(app);            // activates activeByDefault plugins
manager.activate("acme.measure", app);
manager.isActive("acme.measure");         // -> boolean
manager.list();                            // -> StrataPlugin[]
```

## Built-in example: `basemapPlugin`

`basemapPlugin(options?)` sets the map's basemap on activate (and restores the prior one on
deactivate), demonstrating the full lifecycle plus `getProjectState` / `applyProjectState`.

## Future work: external plugin manifests

External, non-bundled plugins will ship a `plugin.json` manifest (id, name, version, entry,
declared `urlParameterNames`, capability grants) that the host loads and validates before
activation. Not implemented in this release — the in-process `StrataPlugin`/`PluginManager`
API above is the supported path today.
