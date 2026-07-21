import { describe, it, expect } from "vitest";
import { hiddenTransform, animatedStyle, nextViewIndex } from "../../src/react/app/animation.js";

describe("hiddenTransform", () => {
  it("moves per kind and direction", () => {
    expect(hiddenTransform("fade")).toBe("none");
    expect(hiddenTransform("slide")).toBe("translateY(16px)");
    expect(hiddenTransform("fly", { direction: "left" })).toBe("translateX(16px)");
    expect(hiddenTransform("fly", { direction: "right" })).toBe("translateX(-16px)");
    expect(hiddenTransform("fly", { direction: "down", distance: 40 })).toBe("translateY(-40px)");
    expect(hiddenTransform("zoom")).toBe("scale(0.92)");
    expect(hiddenTransform("rotate")).toBe("rotate(-6deg) scale(0.96)");
  });
});

describe("animatedStyle", () => {
  it("is fully visible when shown and offset/transparent when hidden", () => {
    const shown = animatedStyle("fade", true);
    expect(shown.opacity).toBe(1);
    expect(shown.transform).toBe("none");
    expect(shown.transition).toContain("opacity 400ms ease 0ms");

    const hidden = animatedStyle("fly", false, { direction: "up", duration: 200, delay: 50, easing: "ease-in-out" });
    expect(hidden.opacity).toBe(0);
    expect(hidden.transform).toBe("translateY(16px)");
    expect(hidden.transition).toContain("200ms ease-in-out 50ms");
  });
});

describe("nextViewIndex", () => {
  it("advances, wraps when looping, and clamps otherwise", () => {
    expect(nextViewIndex(0, 3)).toBe(1);
    expect(nextViewIndex(2, 3)).toBe(0); // wrap (loop default)
    expect(nextViewIndex(2, 3, false)).toBe(2); // clamp
    expect(nextViewIndex(0, 0)).toBe(0);
  });
});
