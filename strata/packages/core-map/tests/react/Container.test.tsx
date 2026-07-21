import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "../../src/react/widgets/Container.js";

describe("Container", () => {
  it("is a flex box in flow mode with the given direction", () => {
    const { container } = render(
      <Container direction="row">
        <span>child</span>
      </Container>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.display).toBe("flex");
    expect(el.style.flexDirection).toBe("row");
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("is position:relative in fixed mode (for absolutely-positioned children)", () => {
    const { container } = render(<Container direction="column" mode="fixed" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.position).toBe("relative");
    expect(el.style.display).not.toBe("flex");
  });
});
