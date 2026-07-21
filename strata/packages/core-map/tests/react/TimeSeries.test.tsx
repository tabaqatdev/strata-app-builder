import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimeSeries } from "../../src/react/widgets/TimeSeries.js";

const series = [
  { t: 1, value: 10 },
  { t: 2, value: 20 },
  { t: 3, value: 15 },
];

describe("TimeSeries", () => {
  it("draws a line and one marker circle per point", () => {
    const { container } = render(<TimeSeries data={series} />);
    expect(container.querySelector("polyline")).not.toBeNull();
    expect(container.querySelectorAll("circle")).toHaveLength(3);
  });

  it("renders a threshold band rect behind the line", () => {
    const { container } = render(
      <TimeSeries data={series} bands={[{ label: "flood", color: "#f00", min: 12, max: 18 }]} />,
    );
    expect(container.querySelector("rect")).not.toBeNull();
  });

  it("uses the title as the accessible label", () => {
    render(<TimeSeries data={series} title="Hydrograph" />);
    expect(screen.getByRole("img", { name: "Hydrograph" })).toBeInTheDocument();
  });

  it("fires onPointClick with the point index", () => {
    const onPointClick = vi.fn();
    const { container } = render(<TimeSeries data={series} onPointClick={onPointClick} />);
    fireEvent.click(container.querySelectorAll("circle")[1]);
    expect(onPointClick).toHaveBeenCalledWith(1);
  });

  it("renders an empty chart for empty data without throwing", () => {
    const { container } = render(<TimeSeries data={[]} />);
    expect(container.querySelector("polyline")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
