import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatRow } from "../../src/react/widgets/StatRow.js";

describe("StatRow", () => {
  it("renders label, value, and unit", () => {
    render(<StatRow label="Population" value={1200} unit="people" />);
    expect(screen.getByText("Population")).toBeInTheDocument();
    expect(screen.getByText("1200")).toBeInTheDocument();
    expect(screen.getByText("people")).toBeInTheDocument();
  });

  it("draws a bottom border by default and omits it when divider={false}", () => {
    const { container: withDivider } = render(<StatRow label="a" value="1" />);
    expect((withDivider.firstChild as HTMLElement).style.borderBottom).not.toBe("");

    const { container: noDivider } = render(<StatRow label="a" value="1" divider={false} />);
    expect((noDivider.firstChild as HTMLElement).style.borderBottom).toBe("");
  });
});
