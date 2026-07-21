import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Swipe, Bookmarks, WidgetController } from "../../src/react/widgets/DesignWidgets.js";
import { SharePanel } from "../../src/react/widgets/SharePanel.js";

describe("Swipe", () => {
  it("renders both panes and a draggable divider; arrow keys move it", () => {
    render(<Swipe left={<div>LEFT</div>} right={<div>RIGHT</div>} initial={50} />);
    expect(screen.getByText("LEFT")).toBeInTheDocument();
    expect(screen.getByText("RIGHT")).toBeInTheDocument();
    const slider = screen.getByRole("slider", { name: "Swipe divider" });
    expect(slider.getAttribute("aria-valuenow")).toBe("50");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(Number(slider.getAttribute("aria-valuenow"))).toBeGreaterThan(50);
  });
});

describe("Bookmarks", () => {
  it("applies a bookmark's viewpoint to the store and calls onSelect", () => {
    const setView = vi.fn();
    const onSelect = vi.fn();
    render(
      <Bookmarks
        store={{ getState: () => ({ setView }) }}
        onSelect={onSelect}
        bookmarks={[{ name: "Downtown", viewpoint: { center: [1, 2], zoom: 12 } }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Downtown/ }));
    expect(setView).toHaveBeenCalledWith({ center: [1, 2], zoom: 12 });
    expect(onSelect).toHaveBeenCalled();
  });
});

describe("WidgetController (tool dock)", () => {
  it("toggles a tool's content on and off", () => {
    render(
      <WidgetController
        tools={[
          { id: "legend", label: "Legend", content: <div>LEGEND-CONTENT</div> },
          { id: "layers", label: "Layers", content: <div>LAYERS-CONTENT</div> },
        ]}
      />,
    );
    // nothing open initially
    expect(screen.queryByText("LEGEND-CONTENT")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Legend" }));
    expect(screen.getByText("LEGEND-CONTENT")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Legend" }));
    expect(screen.queryByText("LEGEND-CONTENT")).toBeNull();
  });
});

describe("SharePanel", () => {
  it("builds a share link + embed from the store state", () => {
    const store = {
      getState: () => ({
        view: { center: [46.7, 24.7], zoom: 11 },
        baseMap: { title: "Dark" },
        activeLayerId: "parcels",
        layers: [{ id: "parcels", layerDefinition: { definitionExpression: "POP > 1000" } }],
      }),
    };
    render(<SharePanel baseUrl="https://app.example/map" store={store} />);
    const link = screen.getByLabelText("Share link") as HTMLInputElement;
    expect(link.value).toContain("c=46.7%2C24.7");
    expect(link.value).toContain("b=Dark");
    expect(link.value).toContain("a=parcels");
    const embed = screen.getByLabelText("Embed snippet") as HTMLInputElement;
    expect(embed.value).toContain("<iframe");
  });
});
