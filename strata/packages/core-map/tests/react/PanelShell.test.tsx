/**
 * PanelShell resize — the chrome every management panel (Layer / Basemap / AttributeTable / Chart /
 * Carto / Filter / Edit / Attachments / Saved…) inherits, so a regression here would show up in all
 * of them at once. Covers the grips that exist per mode, the pointer drag, the keyboard path, the
 * clamps, and the `resizable={false}` lock.
 *
 * Pointer events are dispatched as MouseEvents typed `pointerdown`/`pointermove`: jsdom does not
 * implement `PointerEvent`, and React reads `clientX`/`clientY` off whatever native event arrives.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PanelShell } from "../../src/react/panels/PanelShell.js";

/** Dispatch a pointer-typed MouseEvent (jsdom has no PointerEvent constructor). */
function pointer(target: Element | Window, type: string, x: number, y: number): void {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  act(() => {
    target.dispatchEvent(ev);
  });
}

/** Drag a grip from (0,0) by (dx,dy) without releasing it. */
function drag(grip: Element, dx: number, dy = 0): void {
  pointer(grip, "pointerdown", 0, 0);
  pointer(grip, "pointermove", dx, dy);
}

const grips = (c: HTMLElement): HTMLElement[] =>
  Array.from(c.querySelectorAll("[data-strata-panel-resize]"));
const gripFor = (c: HTMLElement, axis: string): HTMLElement =>
  c.querySelector(`[data-strata-panel-resize="${axis}"]`) as HTMLElement;
const card = (c: HTMLElement): HTMLElement => c.firstElementChild as HTMLElement;

describe("PanelShell resize", () => {
  it("is resizable by default: a docked panel gets a width grip and nothing else", () => {
    const { container } = render(
      <PanelShell title="Layers" defaultWidth={300}>
        <div>BODY</div>
      </PanelShell>,
    );
    expect(screen.getByText("BODY")).toBeInTheDocument();
    expect(grips(container).map((g) => g.dataset.strataPanelResize)).toEqual(["e"]);
    // A grip is a focusable separator, not decoration.
    const grip = gripFor(container, "e");
    expect(grip.getAttribute("role")).toBe("separator");
    expect(grip.getAttribute("aria-label")).toBe("Resize panel width");
    expect(grip.tabIndex).toBe(0);
  });

  it("gives a floating panel height and corner grips too", () => {
    const { container } = render(
      <PanelShell title="Chart" mode="floating" defaultWidth={300}>
        <div>BODY</div>
      </PanelShell>,
    );
    expect(grips(container).map((g) => g.dataset.strataPanelResize)).toEqual(["e", "s", "se"]);
  });

  it("renders no grips when locked", () => {
    const { container } = render(
      <PanelShell title="Legend" mode="floating" defaultWidth={300} resizable={false}>
        <div>BODY</div>
      </PanelShell>,
    );
    expect(grips(container)).toHaveLength(0);
  });

  it("drags the width grip and applies the new width to the card", () => {
    const { container } = render(
      <PanelShell title="Layers" defaultWidth={300}>
        <div>BODY</div>
      </PanelShell>,
    );
    expect(card(container).style.width).toBe("300px");
    drag(gripFor(container, "e"), 120);
    expect(card(container).style.width).toBe("420px");
  });

  it("clamps to minWidth/maxWidth, and a clamped drag returns with the pointer", () => {
    const { container } = render(
      <PanelShell title="Layers" defaultWidth={300} minWidth={200} maxWidth={500}>
        <div>BODY</div>
      </PanelShell>,
    );
    const grip = gripFor(container, "e");

    pointer(grip, "pointerdown", 0, 0);
    pointer(grip, "pointermove", 5000, 0);
    expect(card(container).style.width).toBe("500px"); // held at the max…
    pointer(grip, "pointermove", 10, 0);
    expect(card(container).style.width).toBe("310px"); // …and back, with no overshoot banked
    pointer(grip, "pointerup", 10, 0);

    drag(grip, -5000);
    expect(card(container).style.width).toBe("200px");
  });

  it("resizes from the keyboard, because a pointer-only grip is not an affordance for everyone", () => {
    const { container } = render(
      <PanelShell title="Layers" defaultWidth={300}>
        <div>BODY</div>
      </PanelShell>,
    );
    const grip = gripFor(container, "e");

    fireEvent.keyDown(grip, { key: "ArrowRight" });
    expect(card(container).style.width).toBe("316px");
    fireEvent.keyDown(grip, { key: "ArrowRight", shiftKey: true });
    expect(card(container).style.width).toBe("364px");
    fireEvent.keyDown(grip, { key: "ArrowLeft" });
    expect(card(container).style.width).toBe("348px");
    fireEvent.keyDown(grip, { key: "Enter" }); // not a resize key → no change
    expect(card(container).style.width).toBe("348px");
  });

  it("a locked panel ignores the keyboard as well as the pointer", () => {
    const { container } = render(
      <PanelShell title="Layers" defaultWidth={300} resizable={false}>
        <div>BODY</div>
      </PanelShell>,
    );
    expect(card(container).style.width).toBe("300px");
    expect(grips(container)).toHaveLength(0);
  });

  it("drags a floating panel taller, overriding the shell's maxHeight so it does not snap back", () => {
    const { container } = render(
      <PanelShell title="Chart" mode="floating" defaultWidth={300} defaultHeight={240}>
        <div>BODY</div>
      </PanelShell>,
    );
    drag(gripFor(container, "s"), 0, 100);
    expect(card(container).style.height).toBe("340px");
    expect(card(container).style.maxHeight).toBe("none");
  });

  it("drags both axes from the corner", () => {
    const { container } = render(
      <PanelShell title="Chart" mode="floating" defaultWidth={300} defaultHeight={240}>
        <div>BODY</div>
      </PanelShell>,
    );
    drag(gripFor(container, "se"), 60, 40);
    expect(card(container).style.width).toBe("360px");
    expect(card(container).style.height).toBe("280px");
  });

  it("reports the new box through onResize, for the map that must call resize()", () => {
    const onResize = vi.fn();
    const { container } = render(
      <PanelShell title="Layers" defaultWidth={300} onResize={onResize}>
        <div>BODY</div>
      </PanelShell>,
    );
    drag(gripFor(container, "e"), 50);
    expect(onResize).toHaveBeenCalledWith({ width: 350 });
  });

  it("keeps the header drag independent of the grips", () => {
    const { container } = render(
      <PanelShell title="Chart" mode="floating" defaultWidth={300} initialX={40} initialY={20}>
        <div>BODY</div>
      </PanelShell>,
    );
    // A grip drag must not move the panel: pointerdown on the grip stops short of the header handler.
    drag(gripFor(container, "e"), 80);
    expect(card(container).style.left).toBe("40px");
    expect(card(container).style.top).toBe("20px");
    expect(card(container).style.width).toBe("380px");
  });
});
