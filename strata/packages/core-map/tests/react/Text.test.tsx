import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text } from "../../src/react/widgets/Text.js";

describe("Text", () => {
  it("renders content in a <p> by default", () => {
    const { container } = render(<Text content="Hello world" />);
    expect(container.querySelector("p")).not.toBeNull();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders as the requested intrinsic element", () => {
    const { container } = render(<Text content="Heading" as="h2" />);
    const h2 = container.querySelector("h2");
    expect(h2).not.toBeNull();
    expect(h2!.textContent).toBe("Heading");
    expect(container.querySelector("p")).toBeNull();
  });
});
