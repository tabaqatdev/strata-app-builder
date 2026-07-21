import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// applyEdits does a network write — mock it so the panel never leaves the process.
vi.mock("@strata/feature-arcgis", () => ({
  applyEdits: vi.fn().mockResolvedValue({ updateResults: [{ objectId: 1, success: true }] }),
}));

import { applyEdits } from "@strata/feature-arcgis";
import { EditPanel } from "../../src/react/panels/EditPanel.js";

const layer = {
  id: "cities",
  title: "Cities",
  url: "https://example.com/rest/services/cities/FeatureServer/0",
  layerDefinition: {
    fields: [
      { name: "OBJECTID", type: "esriFieldTypeOID", alias: "OBJECTID" },
      { name: "name", type: "esriFieldTypeString", alias: "Name" },
      { name: "pop", type: "esriFieldTypeInteger", alias: "Population" },
    ],
  },
} as any;

beforeEach(() => {
  vi.mocked(applyEdits).mockClear();
});

describe("EditPanel", () => {
  it("shows the authenticated-backend advisory and editable fields (not OBJECTID)", () => {
    render(<EditPanel layer={layer} selected={{ oid: 1, attributes: { name: "Alpha", pop: 100 } }} />);
    expect(screen.getByRole("note")).toHaveTextContent(/writable, authenticated backend/i);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Population")).toBeInTheDocument();
  });

  it("disables editing when the layer has no FeatureServer url", () => {
    // The message splits "url" into a <code> child, so assert on the container text and the
    // disabled Save button rather than a single text node.
    const { container } = render(
      <EditPanel layer={{ ...layer, url: undefined }} selected={{ oid: 1, attributes: {} }} />,
    );
    expect(container.textContent).toMatch(/no FeatureServer.*editing is disabled/i);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("calls applyEdits with an update payload on Save and reports success", async () => {
    const onSaved = vi.fn();
    render(
      <EditPanel
        layer={layer}
        selected={{ oid: 1, attributes: { name: "Alpha", pop: 100 } }}
        onSaved={onSaved}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(applyEdits).toHaveBeenCalled());
    const payload = vi.mocked(applyEdits).mock.calls[0][0] as any;
    expect(payload.url).toBe(layer.url);
    expect(payload.updates[0].attributes.OBJECTID).toBe(1);
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(screen.getByText("Feature saved.")).toBeInTheDocument();
  });
});
