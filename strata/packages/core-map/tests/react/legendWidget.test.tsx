/**
 * The `legend` widget inside a real `<StrataApp>` — the path the showcase recipe actually uses.
 *
 * `<StrataApp>` threads `id`/`bus`/`outputs`/`store` onto every widget but never `layers`, so an
 * authored `{"type":"legend"}` used to reach `Legend` with `layers === undefined` and throw. The
 * escape hatch — authoring `props.layers` — was worse: a snapshot of the spec that no amount of
 * showing and hiding could change, so the legend and the map drifted apart and the legend was the
 * one being trusted.
 */
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { createStrataStore } from "@strata/state";
import { StrataApp } from "../../src/react/app/StrataApp.js";

/** An app whose only widget is a legend — authored exactly as the recipes author it. */
const CONFIG: AppLayout = {
  pages: [{ id: "p", root: { kind: "widget", widget: { id: "legend", type: "legend" } } }],
};

function storeWithLayers() {
  const store = createStrataStore();
  store.getState().addLayer({
    id: "zones",
    title: "Zones",
    source: { kind: "geojson" },
    visibility: true,
    layerDefinition: {
      drawingInfo: {
        renderer: {
          type: "uniqueValue",
          field: "CLASS",
          uniqueValueInfos: [
            { value: "A", label: "Residential", symbol: { type: "esriSFS", color: [0, 255, 0, 255] } },
          ],
        },
      },
    },
  } as any);
  store.getState().addLayer({
    id: "imagery",
    title: "Imagery",
    source: { kind: "geojson" },
    visibility: true,
  } as any);
  return store;
}

describe("the `legend` widget in an app layout", () => {
  it("renders from the store with no `layers` authored", () => {
    const store = storeWithLayers();
    render(<StrataApp config={CONFIG} context={{ store }} />);
    expect(screen.getByText("Zones")).toBeInTheDocument();
    expect(screen.getByText("Residential")).toBeInTheDocument();
  });

  it("lists the layer whose symbology belongs to the service", () => {
    const store = storeWithLayers();
    render(<StrataApp config={CONFIG} context={{ store }} />);
    // It is drawing on the map; omitting it reads as "that layer isn't on".
    expect(screen.getByText("Imagery")).toBeInTheDocument();
  });

  it("follows a visibility change made anywhere in the app", () => {
    const store = storeWithLayers();
    render(<StrataApp config={CONFIG} context={{ store }} />);

    act(() => store.getState().setVisibility("zones", false));
    expect(screen.queryByText("Zones")).not.toBeInTheDocument();
    expect(screen.getByText("Imagery")).toBeInTheDocument();

    act(() => store.getState().setVisibility("zones", true));
    expect(screen.getByText("Zones")).toBeInTheDocument();
  });

  it("picks up a layer added after mount", () => {
    const store = storeWithLayers();
    render(<StrataApp config={CONFIG} context={{ store }} />);
    act(() =>
      store.getState().addLayer({
        id: "roads",
        title: "Roads",
        source: { kind: "geojson" },
        visibility: true,
      } as any),
    );
    expect(screen.getByText("Roads")).toBeInTheDocument();
  });
});
