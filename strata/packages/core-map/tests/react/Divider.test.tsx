import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Divider } from "../../src/react/widgets/Divider.js";

describe("Divider", () => {
  it("is a separator, horizontal by default", () => {
    render(<Divider />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "horizontal");
    expect(sep.style.height).toBe("1px");
  });

  it("renders a vertical rule when orientation='vertical'", () => {
    render(<Divider orientation="vertical" />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "vertical");
    expect(sep.style.width).toBe("1px");
  });
});
