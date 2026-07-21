import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../../src/react/widgets/Button.js";

describe("Button", () => {
  it("renders a <button> and fires onClick", () => {
    const onClick = vi.fn();
    render(<Button label="Run" onClick={onClick} />);
    const btn = screen.getByRole("button", { name: "Run" });
    expect(btn.tagName).toBe("BUTTON");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders an anchor to href when provided", () => {
    render(<Button label="Docs" href="https://example.com" />);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("applies transparent background for the ghost variant", () => {
    render(<Button label="Ghost" variant="ghost" />);
    expect(screen.getByRole("button", { name: "Ghost" }).style.background).toBe("transparent");
  });

  it("emits a buttonClick trigger on the bus, and still calls onClick (Phase 2)", () => {
    const emit = vi.fn();
    const onClick = vi.fn();
    render(<Button label="Run" id="b1" bus={{ emit }} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledWith({ type: "buttonClick", source: "b1", payload: { value: "Run" } });
  });
});
