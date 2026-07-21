import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ActionBus } from "@strata/actions";
import { ChartPanel, MiniChart } from "../../src/react/panels/ChartPanel.js";
import type { SavedChart } from "@strata/schema";

const chart: SavedChart = {
  id: "c1",
  title: "By region",
  kind: "bar",
  source: { layer_id: "L", field: "REGION", value_field: null, stat: "count" },
  data: [
    { label: "North", value: 10 },
    { label: "South", value: 20 },
  ],
};

describe("MiniChart interactivity", () => {
  it("fires onSelect with the clicked datum", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <MiniChart kind="bar" data={chart.data!} onSelect={onSelect} />,
    );
    const bars = container.querySelectorAll("rect");
    fireEvent.click(bars[1]);
    expect(onSelect).toHaveBeenCalledWith({ label: "South", value: 20 }, 1);
  });
});

describe("ChartPanel — bus source (WIF / #5)", () => {
  it("emits categorySelect on a bar click and clears on a second click of the same bar", () => {
    const bus = new ActionBus();
    const events: any[] = [];
    bus.on("categorySelect", (t) => events.push({ source: t.source, payload: t.payload }));
    const { container } = render(<ChartPanel charts={[chart]} bus={bus} widgetId="chart1" />);

    // The EChart renderer falls back to the SVG MiniChart (echarts not installed), so bars are present.
    const bars = () => container.querySelectorAll("rect");
    act(() => {
      fireEvent.click(bars()[1]); // South
    });
    expect(events.at(-1)).toEqual({ source: "chart1", payload: { layerId: "L", field: "REGION", value: "South" } });

    act(() => {
      fireEvent.click(bars()[1]); // same bar → clear
    });
    expect(events.at(-1).payload.value).toBeNull();
  });

  it("does not emit when no bus is provided", () => {
    const { container } = render(<ChartPanel charts={[chart]} />);
    // Clicking is a no-op (no throw); marks are not wired to a bus.
    const bars = container.querySelectorAll("rect");
    expect(() => fireEvent.click(bars[0])).not.toThrow();
  });
});
