/**
 * The map follows the theme: flipping light↔dark swaps the basemap to the paired one, so a light UI is
 * never left sitting on a dark map. The rules that keep it honest are what these tests pin down —
 * the authored basemap wins on mount, an explicit pick outranks the theme, and the swap is not an edit.
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { AppLayout, BaseMap } from "@strata/schema";
import { createStrataStore } from "@strata/state";
import { StrataApp } from "../../src/react/app/StrataApp.js";
import { basemapForTheme, OPEN_BASEMAPS } from "../../src/engine/basemaps.js";

const AUTHORED: BaseMap = {
  title: "House basemap",
  baseMapLayers: [{ id: "house", layerType: "WebTiledLayer", templateUrl: "https://house/{z}/{x}/{y}.png" }],
};

/** An app with a dark theme and a light/dark switcher in its header. */
function appConfig(theme?: AppLayout["theme"]): AppLayout {
  return {
    theme: theme ?? { mode: "dark", colors: { primary: "#4ea1ff" } },
    pages: [
      {
        id: "p",
        root: {
          kind: "widget",
          widget: { type: "theme-switch", props: { initial: "dark", themes: ["dark", "light"] } },
        },
      },
    ],
  };
}

/** The style URL of whichever basemap is currently in force. */
function currentStyle(store: ReturnType<typeof createStrataStore>): string | undefined {
  return store.getState().baseMap?.baseMapLayers?.[0]?.styleUrl;
}

describe("the basemap follows the theme", () => {
  it("leaves the authored basemap alone on mount — first paint is not a theme change", () => {
    const store = createStrataStore();
    store.getState().setBaseMap(AUTHORED);
    render(<StrataApp config={appConfig()} context={{ store }} />);
    expect(store.getState().baseMap?.title).toBe("House basemap");
  });

  it("swaps to the paired basemap when the theme is switched", () => {
    const store = createStrataStore();
    store.getState().setBaseMap(AUTHORED);
    render(<StrataApp config={appConfig()} context={{ store }} />);

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(currentStyle(store)).toBe(basemapForTheme("light").style);

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(currentStyle(store)).toBe(basemapForTheme("dark").style);
  });

  it("swaps transiently — a theme toggle is not an edit to the map spec", () => {
    const store = createStrataStore();
    store.getState().setBaseMap(AUTHORED);
    const depth = store.getState()._past.length;
    render(<StrataApp config={appConfig()} context={{ store }} />);

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(store.getState()._past.length).toBe(depth); // no undo entry for a theme flip
  });

  it("stops choosing once the reader picks a basemap explicitly", () => {
    const store = createStrataStore();
    store.getState().setBaseMap(AUTHORED);
    store.getState().setBaseMapFollowsTheme(false); // what a click in the basemap drawer does
    render(<StrataApp config={appConfig()} context={{ store }} />);

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(store.getState().baseMap?.title).toBe("House basemap");
  });

  it("honors theme.basemap.follow:false — the authored basemap is pinned", () => {
    const store = createStrataStore();
    store.getState().setBaseMap(AUTHORED);
    const config = appConfig({ mode: "dark", colors: { primary: "#4ea1ff" }, basemap: { follow: false } });
    render(<StrataApp config={config} context={{ store }} />);

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(store.getState().baseMap?.title).toBe("House basemap");
  });

  it("honors theme.basemap.light/dark — an app can name its own pair", () => {
    const store = createStrataStore();
    store.getState().setBaseMap(AUTHORED);
    const config = appConfig({
      mode: "dark",
      colors: { primary: "#4ea1ff" },
      basemap: { light: "opentopomap" },
    });
    render(<StrataApp config={config} context={{ store }} />);

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(store.getState().baseMap?.baseMapLayers[0].templateUrl).toBe(
      OPEN_BASEMAPS.find((p) => p.id === "opentopomap")?.templateUrl,
    );
  });

  it("gives the basemap panel the app's mode, so the drawer follows the theme it is in", () => {
    const store = createStrataStore();
    const config: AppLayout = {
      theme: { mode: "dark", colors: { primary: "#4ea1ff" } },
      pages: [{ id: "p", root: { kind: "widget", widget: { type: "basemap", props: {} } } }],
    };
    const { container } = render(<StrataApp config={config} context={{ store }} />);

    // The row exists at all only because the panel could read the mode from the app.
    expect(container.querySelector('[data-basemap="auto"]')).toBeTruthy();
    const ticked = [...container.querySelectorAll('[role="radio"][aria-checked="true"]')].map(
      (r) => (r as HTMLElement).dataset.basemap,
    );
    expect(ticked).toContain("auto");
    expect(ticked).toContain(basemapForTheme("dark").id); // the dark map, not a light default
  });
});
