import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "../../src/react/widgets/Sparkline.js";

describe("Sparkline", () => {
  it("draws a polyline with one point per datum", () => {
    const { container } = render(<Sparkline data={[1, 2, 3, 4]} />);
    const polyline = container.querySelector("polyline");
    expect(polyline).not.toBeNull();
    expect(polyline!.getAttribute("points")!.trim().split(/\s+/)).toHaveLength(4);
  });

  it("renders no polyline for empty data (degrades to an empty box)", () => {
    const { container } = render(<Sparkline data={[]} />);
    expect(container.querySelector("polyline")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("honors width/height on the svg", () => {
    const { container } = render(<Sparkline data={[1, 2]} width={120} height={40} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("120");
    expect(svg.getAttribute("height")).toBe("40");
  });
});
