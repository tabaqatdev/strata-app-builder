import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Menu } from "../../src/react/widgets/Menu.js";

describe("Menu", () => {
  it("renders one entry per item and fires onSelect on click", () => {
    const onSelect = vi.fn();
    render(<Menu items={[{ label: "One", onSelect }, { label: "Two" }]} />);
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    fireEvent.click(screen.getByText("One"));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("renders an item with href as a link", () => {
    render(<Menu items={[{ label: "Home", href: "/home" }]} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
  });
});
