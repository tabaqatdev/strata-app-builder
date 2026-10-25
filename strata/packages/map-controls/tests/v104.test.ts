// @vitest-environment jsdom
/**
 * 1.0.4 — no blank box through the map under software compositing.
 *
 * Under software compositing (GPU off / blocklisted, RDP, VMs, headless --disable-gpu) Chrome treats an
 * opaque SOLID-colour overflow:auto|scroll box over the MapLibre canvas as an occluder and mis-places the
 * occluded rect, punching a blank page-background box through the map. A one-colour image fill —
 * `linear-gradient(C, C)` — is never an occluder and paints the same colour. Every opaque surface the
 * package puts over the map that can scroll must use that form, and must never fall back to a plain
 * `var()` / colour fill (or an opaque background-color under the image). See
 * strata/docs/troubleshooting.md §7.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as catalog from "../src/basemaps";
import { mountMapControls, POPUP_CSS, ensureMapControlsPopupStyles } from "../src/map-controls";

const RAW = readFileSync(join(__dirname, "../src/map-controls.css"), "utf8");
const CSS = RAW.replace(/\/\*[\s\S]*?\*\//g, "");

/** Every declaration block whose selector list contains `selector` exactly (as one comma-separated member). */
function blocksFor(css: string, selector: string): string[] {
  const out: string[] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const sels = m[1].split(",").map((s) => s.trim());
    if (sels.includes(selector)) out.push(m[2]);
  }
  return out;
}
/** The value of `prop` (background / background-color) in a declaration block, or null. */
const decl = (block: string, prop: string) => {
  const m = block.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`));
  return m ? m[1].trim() : null;
};
/** A one-colour gradient of a single colour expression C: linear-gradient(C,C). */
const oneColourGradient = (v: string | null) => {
  const m = v?.match(/^linear-gradient\((.+)\)$/);
  if (!m) return false;
  // split the two arguments at the top-level comma
  let depth = 0, cut = -1;
  for (let i = 0; i < m[1].length; i++) {
    const c = m[1][i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === "," && depth === 0) { if (cut !== -1) return false; cut = i; }
  }
  return cut > 0 && m[1].slice(0, cut).trim() === m[1].slice(cut + 1).trim();
};
const PLAIN_VAR = /^var\(/;

describe("1.0.4 — the drawer (layer list, basemap gallery, tool panels) is an image fill", () => {
  const drawer = blocksFor(CSS, ".smc .smc-drawer");

  it("the drawer rule is an opaque scroller over the map (the case the fix is for)", () => {
    const main = drawer.find((b) => /overflow-y:auto/.test(b));
    expect(main, "the .smc .smc-drawer rule with overflow-y:auto").toBeTruthy();
    expect(main).toMatch(/position:absolute/);
  });

  it("its fill is linear-gradient(var(--smc-panel),var(--smc-panel)) — the same token, one colour", () => {
    const bg = drawer.map((b) => decl(b, "background")).filter(Boolean);
    expect(bg).toEqual(["linear-gradient(var(--smc-panel),var(--smc-panel))"]);
    expect(oneColourGradient(bg[0]!)).toBe(true);
  });

  it("never a plain var() / colour fill, and no opaque background-color under the image, on any drawer rule", () => {
    for (const b of drawer) {
      const v = decl(b, "background");
      if (v) expect(v, b).not.toMatch(PLAIN_VAR);
      expect(decl(b, "background-color"), b).toBeNull();
    }
    // nowhere in the stylesheet (any selector touching the drawer box itself)
    expect(CSS).not.toMatch(/\.smc-drawer\{[^}]*background:var\(/);
    expect(CSS).not.toMatch(/\.smc-drawer\{[^}]*background-color:/);
  });

  it("dark mode and RTL still work: --smc-panel flips with data-smc-mode, the drawer is positioned with logical properties", () => {
    expect(CSS).toMatch(/\.smc\{[^}]*--smc-panel:var\(--panel,var\(--smc-d-panel\)\)/);
    expect(CSS).toMatch(/\.smc\[data-smc-mode="dark"\]\{[^}]*--smc-d-panel:#1A2027/);
    const main = drawer.find((b) => /overflow-y:auto/.test(b))!;
    expect(main).toMatch(/inset-inline-end:47px/);
  });

  it("the comment on the rule says why, so nobody 'simplifies' it back", () => {
    expect(RAW).toMatch(/one-colour gradient[\s\S]{0,400}occluder[\s\S]{0,600}\.smc \.smc-drawer\{/);
  });
});

describe("1.0.4 — the themed popup card (POPUP_CSS) is an image fill", () => {
  const BG = "var(--smc-popup-bg,var(--smc-bg,#fff))";
  const content = blocksFor(POPUP_CSS, ":where(.smc[data-smc-popups]) .maplibregl-popup-content");

  it("the card's fill is linear-gradient(BG,BG) of the popup token (light / dark via --smc-popup-bg → --smc-bg)", () => {
    expect(content.length).toBe(1);
    expect(decl(content[0], "background")).toBe(`linear-gradient(${BG},${BG})`);
    expect(oneColourGradient(decl(content[0], "background"))).toBe(true);
  });

  it("never a plain var() fill and no background-color on the card", () => {
    expect(decl(content[0], "background")).not.toMatch(PLAIN_VAR);
    expect(decl(content[0], "background-color")).toBeNull();
    expect(POPUP_CSS).not.toMatch(/\.maplibregl-popup-content\{[^}]*background:var\(/);
    expect(POPUP_CSS).not.toMatch(/\.maplibregl-popup-content\{[^}]*background-color:/);
  });

  it("the tip keeps the plain token as its border colour — same colour as the card, not a scroller", () => {
    expect(POPUP_CSS).toMatch(new RegExp(`\\.maplibregl-popup-anchor-top \\.maplibregl-popup-tip\\{[^}]*border-bottom-color:${BG.replace(/[()]/g, "\\$&")}`));
  });

  it("the injected <style data-smc-popup-css> carries the gradient (what a page actually gets)", () => {
    document.head.innerHTML = "";
    const el = ensureMapControlsPopupStyles(document);
    expect(el?.textContent).toContain(`.maplibregl-popup-content{position:relative;pointer-events:auto;padding:10px 26px 10px 12px;border-radius:8px;background:linear-gradient(${BG},${BG});`);
    el?.remove();
  });
});

describe("1.0.4 — the audit: what stays a plain fill, and why", () => {
  it("the cluster stays solid: overflow:hidden, never a scroller", () => {
    const ctl = blocksFor(CSS, ".smc .smc-ctl").find((b) => /position:absolute/.test(b))!;
    expect(ctl).toMatch(/overflow:hidden/);
    expect(ctl).not.toMatch(/overflow(-[xy])?:(auto|scroll)/);
  });

  it("no OTHER rule in the stylesheet is an opaque plain-fill scroller (any new scroller must take the gradient)", () => {
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m: RegExpExecArray | null;
    const offenders: string[] = [];
    while ((m = re.exec(CSS))) {
      const body = m[2];
      if (!/overflow(-[xy])?\s*:\s*(auto|scroll)/.test(body)) continue;
      const bg = decl(body, "background"), bgc = decl(body, "background-color");
      const plain = (v: string | null) => !!v && v !== "none" && v !== "transparent" && !/gradient\(/.test(v) && !/transparent\)$/.test(v);
      if (plain(bg) || plain(bgc)) offenders.push(m[1].trim());
    }
    expect(offenders).toEqual([]);
  });

  it("the scale bar stays a translucent fill (not opaque, so never an occluder)", () => {
    const line = blocksFor(CSS, ".smc .smc-scale-line")[0];
    expect(decl(line, "background")).toBe("color-mix(in srgb,var(--smc-panel) 78%,transparent)");
  });
});

describe("1.0.4 — mounted: the drawer element is the one the rule targets", () => {
  afterEach(() => { document.body.innerHTML = ""; });
  it("mountMapControls renders .smc-drawer inside .smc, so `.smc .smc-drawer` applies", () => {
    const box = document.createElement("div");
    document.body.appendChild(box);
    const map: any = { setStyle: vi.fn(), on: vi.fn(), off: vi.fn(), zoomIn: vi.fn(), zoomOut: vi.fn(), resize: vi.fn(),
      getLayer: () => undefined, moveLayer: vi.fn(), getLayoutProperty: () => undefined, setLayoutProperty: vi.fn(),
      getPaintProperty: () => undefined, setPaintProperty: vi.fn(), getCanvas: () => ({ style: {} }) };
    const c = mountMapControls(map, { container: box, catalog, keyboard: false });
    expect(box.classList.contains("smc")).toBe(true);
    expect(box.querySelector(".smc-drawer")).toBeTruthy();
    c.destroy();
  });
});
