/**
 * @vitest-environment jsdom
 *
 * The popup has to survive a dark theme.
 *
 * MapLibre's own CSS paints `.maplibregl-popup-content` white and sets no `color`, so the text
 * colour is inherited from the app root — `var(--strata-fg)`, which is near-white in every dark
 * theme. The popup opened, rendered, and was invisible: white on white, with a white tip pointing at
 * a dark map. It read as "clicking a feature does nothing".
 */
import { describe, it, expect, beforeEach } from "vitest";
import { ensurePopupStyles, initPopups } from "../src/engine/popups.js";

/** The exact surface `initPopups` touches. */
function fakeMap(): any {
  const handlers: Record<string, Array<(e: any) => void>> = {};
  return {
    on: (ev: string, fn: any) => ((handlers[ev] ??= []).push(fn)),
    off: () => {},
    getContainer: () => document.body,
  };
}

function popupStyleEl(): HTMLStyleElement | null {
  return document.head.querySelector("style[data-strata-popup-css]");
}

describe("popup stylesheet", () => {
  beforeEach(() => {
    document.head.querySelectorAll("style[data-strata-popup-css]").forEach((el) => el.remove());
  });

  it("takes the card AND the text from the same theme, never half of each", () => {
    ensurePopupStyles(document);
    const css = popupStyleEl()?.textContent ?? "";
    // The bug was inheriting the colour while keeping MapLibre's hard-coded white card.
    expect(css).toMatch(/\.maplibregl-popup-content\{[^}]*background:var\(--strata-panel-bg/);
    expect(css).toMatch(/\.maplibregl-popup-content\{[^}]*color:var\(--strata-fg/);
  });

  it("repaints the tip too — a white arrow outlives the theme it was drawn for", () => {
    ensurePopupStyles(document);
    const css = popupStyleEl()?.textContent ?? "";
    for (const side of ["border-bottom-color", "border-top-color", "border-left-color", "border-right-color"]) {
      expect(css).toContain(`${side}:var(--strata-panel-bg`);
    }
  });

  it("gives the close button an explicit colour rather than inheriting one", () => {
    ensurePopupStyles(document);
    expect(popupStyleEl()?.textContent).toMatch(
      /\.maplibregl-popup-close-button\{[^}]*color:var\(--strata-fg/,
    );
  });

  it("keeps a light fallback, so a bare <StrataMap> outside a themed app is unchanged", () => {
    ensurePopupStyles(document);
    const css = popupStyleEl()?.textContent ?? "";
    expect(css).toContain("var(--strata-panel-bg,#fff)");
    expect(css).toContain("var(--strata-fg,#1a2230)");
  });

  it("injects once per document, however many maps mount", () => {
    ensurePopupStyles(document);
    ensurePopupStyles(document);
    expect(document.head.querySelectorAll("style[data-strata-popup-css]").length).toBe(1);
  });

  it("is injected by initPopups, so no app has to wire it", () => {
    expect(popupStyleEl()).toBeNull();
    initPopups({ map: fakeMap(), maplibregl: {}, layers: [] });
    expect(popupStyleEl()).not.toBeNull();
  });
});
