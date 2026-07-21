import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SavedItemsPanel } from "../../src/react/panels/SavedItemsPanel.js";

const items = [
  { id: "c1", title: "Parcels by ZONING", subtitle: "bar" },
  { id: "c2", title: "Crashes by ward", subtitle: "pie" },
];

describe("SavedItemsPanel (#4)", () => {
  it("lists items with subtitles and the empty state", () => {
    const { rerender } = render(<SavedItemsPanel title="Charts" items={[]} />);
    expect(screen.getByText("No saved charts.")).toBeInTheDocument();
    rerender(<SavedItemsPanel title="Charts" items={items} />);
    expect(screen.getByText("Parcels by ZONING")).toBeInTheDocument();
    expect(screen.getByText("Crashes by ward")).toBeInTheDocument();
  });

  it("fires onOpen / onAdd / onRemove", () => {
    const onOpen = vi.fn(), onAdd = vi.fn(), onRemove = vi.fn();
    render(<SavedItemsPanel title="Charts" items={items} onOpen={onOpen} onAdd={onAdd} onRemove={onRemove} />);
    fireEvent.click(screen.getByText("Parcels by ZONING"));
    expect(onOpen).toHaveBeenCalledWith("c1");
    fireEvent.click(screen.getByLabelText("Add to Charts"));
    expect(onAdd).toHaveBeenCalled();
    fireEvent.click(screen.getAllByTitle("Remove")[1]);
    expect(onRemove).toHaveBeenCalledWith("c2");
  });
});
