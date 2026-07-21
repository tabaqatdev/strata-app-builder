import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { createStrataStore } from "@strata/state";
import { StrataApp } from "../../src/react/app/StrataApp.js";
import { defaultWidgetRegistry } from "../../src/react/app/registry.js";
import { BasemapPanel } from "../../src/react/panels/BasemapPanel.js";

describe("basemap widget (Phase 7)", () => {
  it("is registered as `basemap`", () => {
    expect(defaultWidgetRegistry.basemap).toBe(BasemapPanel);
  });

  it("renders store-driven inside <StrataApp> and switches the basemap via the store", () => {
    const store = createStrataStore();
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "widget",
            widget: {
              type: "basemap",
              props: {
                basemaps: [
                  { id: "osm", title: "OpenStreetMap", templateUrl: "https://t/{z}/{x}/{y}.png" },
                  { id: "positron", title: "CARTO Positron", style: "https://cdn/positron.json" },
                ],
              },
            },
          },
        },
      ],
    };
    render(<StrataApp config={config} context={{ store }} />);
    expect(screen.getByText("OpenStreetMap")).toBeInTheDocument();

    fireEvent.click(screen.getByText("CARTO Positron"));
    expect(store.getState().baseMap).not.toBeNull();
  });
});
