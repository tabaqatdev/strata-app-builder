import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StackedBar } from "../../src/react/widgets/StackedBar.js";

describe("StackedBar", () => {
  const series = [
    { label: "A", value: 30, color: "#f00" },
    { label: "B", value: 70, color: "#0f0" },
  ];

  it("draws one rect segment per positive series and a legend entry each", () => {
    const { container } = render(<StackedBar series={series} title="Split" />);
    expect(container.querySelectorAll("rect")).toHaveLength(2);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("Split")).toBeInTheDocument();
  });

  it("ignores non-positive values in the geometry", () => {
    const { container } = render(
      <StackedBar series={[...series, { label: "Z", value: 0, color: "#00f" }]} />,
    );
    expect(container.querySelectorAll("rect")).toHaveLength(2);
  });

  it("sizes segments proportionally to their share of the total", () => {
    const { container } = render(<StackedBar series={series} />);
    const rects = container.querySelectorAll("rect");
    // total = 100, horizontal viewBox length = 100 → widths are 30 and 70.
    expect(Number(rects[0].getAttribute("width"))).toBeCloseTo(30, 5);
    expect(Number(rects[1].getAttribute("width"))).toBeCloseTo(70, 5);
  });
});
