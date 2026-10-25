import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { defaultWidgetRegistry } from "../../src/react/app/registry.js";
import { EditPanel } from "../../src/react/panels/EditPanel.js";
import { AttachmentViewer } from "../../src/react/panels/AttachmentViewer.js";

/**
 * The write path has to be REACHABLE, not merely present. `/panel edit`, `/panel attachment`, the
 * `/edit` skill and the `/attachments` skill all offer these, and the layout engine resolves every
 * widget through this registry — so a component that exists but is unregistered cannot be placed in
 * an `AppLayout` at all. It was, until this suite.
 */
describe("the write-path widgets are registered", () => {
  it("registers `edit` as the edit panel", () => {
    expect(defaultWidgetRegistry.edit).toBe(EditPanel);
  });

  it("registers `attachment` as the attachment viewer", () => {
    expect(defaultWidgetRegistry.attachment).toBe(AttachmentViewer);
  });

  it("does not register the Ask panel, which is off in this release", () => {
    expect(defaultWidgetRegistry.ask).toBeUndefined();
  });

  it("renders the edit panel through the registry entry, with its backend banner", () => {
    const Widget = defaultWidgetRegistry.edit;
    render(
      <Widget
        layer={{ id: "l1", title: "Assets", url: "https://example.test/FeatureServer/0" }}
        selected={{ oid: 1, attributes: { OBJECTID: 1, name: "Tower" } }}
      />,
    );
    // The panel's whole safety story is that it says what it needs before anyone presses Save.
    expect(screen.getByText(/writable/i)).toBeTruthy();
  });

  it("renders the attachment viewer through the registry entry", () => {
    const Widget = defaultWidgetRegistry.attachment;
    const { container } = render(
      <Widget layer={{ id: "l1", title: "Assets", url: "https://example.test/FeatureServer/0" }} features={[]} />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
