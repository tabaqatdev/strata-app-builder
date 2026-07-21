import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Image } from "../../src/react/widgets/Image.js";

describe("Image", () => {
  it("renders an img with src, alt, and default cover fit", () => {
    render(<Image src="/pic.png" alt="a picture" />);
    const img = screen.getByRole("img", { name: "a picture" });
    expect(img).toHaveAttribute("src", "/pic.png");
    expect((img as HTMLElement).style.objectFit).toBe("cover");
  });

  it("supports contain fit", () => {
    const { container } = render(<Image src="/pic.png" fit="contain" />);
    expect((container.querySelector("img") as HTMLElement).style.objectFit).toBe("contain");
  });
});
