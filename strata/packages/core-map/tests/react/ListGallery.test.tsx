import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListGallery } from "../../src/react/widgets/ListGallery.js";

describe("ListGallery", () => {
  const items = [{ name: "Alpha" }, { name: "Bravo" }, { name: "Charlie" }];

  it("renders the template once per item", () => {
    render(<ListGallery items={items} renderItem={(it) => <li>{it.name}</li>} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("passes the item index to the template", () => {
    render(<ListGallery items={items} renderItem={(it, i) => <li>{`${i}:${it.name}`}</li>} />);
    expect(screen.getByText("0:Alpha")).toBeInTheDocument();
    expect(screen.getByText("2:Charlie")).toBeInTheDocument();
  });

  it("lays out the requested number of columns", () => {
    const { container } = render(
      <ListGallery items={items} columns={3} renderItem={(it) => <li>{it.name}</li>} />,
    );
    expect((container.firstChild as HTMLElement).style.gridTemplateColumns).toBe(
      "repeat(3, minmax(0, 1fr))",
    );
  });
});
