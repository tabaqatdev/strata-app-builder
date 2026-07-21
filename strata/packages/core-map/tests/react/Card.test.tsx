import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card } from "../../src/react/widgets/Card.js";

describe("Card", () => {
  it("renders a title and body children", () => {
    render(
      <Card title="Summary">
        <span>Body text</span>
      </Card>,
    );
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });

  it("renders as an anchor when href is set", () => {
    render(<Card href="/detail">linked</Card>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/detail");
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>clickable</Card>);
    fireEvent.click(screen.getByText("clickable"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("lifts on hover when interactive", () => {
    const { container } = render(<Card hoverable>hover me</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.transform).toBe("");
    fireEvent.mouseEnter(el);
    expect(el.style.transform).toContain("translateY(-2px)");
    fireEvent.mouseLeave(el);
    expect(el.style.transform).toBe("");
  });
});
