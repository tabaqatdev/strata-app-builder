/**
 * conformance.mjs — the browser conformance checks every app that mounts @strata/map-controls runs
 * from its OWN browser harness (e.g. a vanilla app's CDP `drive.mjs`). Framework-agnostic: the
 * harness supplies the means to run JS in the page, and optionally real clicks and key presses.
 *
 *   import { runMapControlsConformance } from "<repo>/strata/packages/map-controls/scripts/conformance.mjs";
 *   const r = await runMapControlsConformance({ evaluate, click, key, tools: { search: true }, log: console.log });
 *   if (r.failed) process.exitCode = 1;
 *
 * evaluate(jsSource) → Promise<any>   REQUIRED. Runs JS in the page and returns its (JSON) value.
 *     By default `jsSource` is a FUNCTION BODY that ends in `return …` — what the CDP harnesses do
 *     with `(function(){${src}})()`. If yours evaluates an EXPRESSION instead, pass
 *     `evaluateStyle: "expression"`. The value may be a promise (await it; CDP: awaitPromise:true).
 * click(selector) → Promise            optional. A REAL click on the first element matching the
 *     selector (CDP Input.dispatchMouseEvent). Without it the checks call `element.click()` in-page.
 * key(k) → Promise                     optional. A REAL key press, k ∈ "l" | "b" | "Escape". Without
 *     it a `keydown` is dispatched on document.body (the controls listen on window). cdpAdapters()
 *     builds one that also knows ArrowLeft / ArrowRight / ArrowUp / ArrowDown / Home / End / Shift.
 * sleep(ms) → Promise                  optional (default setTimeout).
 * tools = { search, locate, measure, draw, print }   which optional tools the app ENABLES.
 * expect = { home, layers, legend, fullscreen, minLayers, scale, resizable }   the default cluster is fixed —
 *     every member is expected unless set false here (fullscreen is only expected where the browser
 *     supports the Fullscreen API, since the package omits the button otherwise). `minLayers`
 *     (default 0) fails the run if the layer list holds fewer rows. `scale` (default false) — the
 *     optional scale bar is OFF by default: say `true` (or `{ units: "metric"|"imperial"|"both" }`)
 *     exactly when the app passes `scale` to mountMapControls; `.smc-scale` must be present iff so.
 *     `resizable` (default true) — the drawer's edge grip (.smc-dgrip, an ARIA separator) is expected
 *     unless the app mounts with `drawer: { resizable: false }`.
 * log(line, result) optional, called once per check.
 * timeout (ms, default 5000) — every wait POLLS until the condition holds or the timeout ends; no
 *     fixed sleeps decide a result.
 * icons — the package's ICONS map; default: imported from ../dist/icons.js next to this script.
 *
 * Returns { passed, failed, results: [{ name, ok, detail }] }. Never throws for a failed check;
 * throws only if `evaluate` is missing.
 *
 * State: the run RESETS the chrome itself before it starts (closes the drawer, collapses "More
 * basemaps", closes popups) through the instance the package (>= 1.0.2) leaves on its container, and
 * runs the collapsed-More check on a Recommended basemap even when the app opened on "none" or a More
 * basemap — it picks OpenStreetMap for the check and restores the app's basemap afterwards. A harness
 * no longer has to prepare any of this. Since 1.0.3 both halves of the app's theme pair are always
 * under Recommended (e.g. vt-gray AND vt-gray-dark), so an app that follows its theme no longer
 * triggers that OSM detour — and a check asserts the pair is there.
 *
 * The stable DOM contract it relies on (rendered by src/map-controls.ts and src/tools.ts):
 *   .smc (container) › .smc-ctl (the one cluster) › button[data-act]
 *     data-act = zin · zout · fit (Home) · layers · base (Basemap) · legend · fullscreen,
 *     then tool-search · tool-locate · tool-measure · tool-draw · tool-print (each with data-tool)
 *   every icon: svg.smc-i[viewBox="0 0 24 24"], Lucide path data from src/icons.ts
 *   .smc-drawer[data-which="layers"|"base"] (hidden when closed); layers/base buttons aria-expanded
 *   gallery: .bm-follow[role=switch] · [data-section="recommended"] [data-base] · button[data-bmmore]
 *     (aria-expanded, aria-controls → [data-section="more"])
 *   layer list: .ll-row[data-ll-id] › [data-ll-act="eye"|"expand"|"acts"], .ll-legend, .ll-acts ›
 *     [data-ll-cmd="zoom"|"info"|"up"|"down"|"legend"|"reset"] + input[type=range][data-ll-opacity]
 *   fullscreen: button[data-act="fullscreen"][aria-pressed]
 *   scale bar (optional): .smc › .smc-scale[data-units] › .smc-scale-line[data-unit] ("<n> m|km|ft|mi"),
 *     bottom-left of the container, outside the cluster
 *   drawer grip (>= 1.0.2): .smc › .smc-dgrip[role=separator][aria-valuenow|min|max], shown while a
 *     drawer is open; Home / End / arrow keys resize it
 *   credits: the MapLibre attribution (.maplibregl-ctrl-attrib) must not be covered by the cluster or
 *     an open drawer
 */

/** The fixed default cluster, by data-act, in order. */
export const CLUSTER_ORDER = Object.freeze(["zin", "zout", "fit", "layers", "base", "legend", "fullscreen"]);
/** The optional tools, in their fixed order. */
export const TOOL_ORDER = Object.freeze(["search", "locate", "measure", "draw", "print"]);
/** Which ICONS key each cluster button must draw (fullscreen: either state). */
export const ICON_FOR = Object.freeze({
  zin: ["zoomIn"], zout: ["zoomOut"], fit: ["home"], layers: ["layers"], base: ["basemap"], legend: ["legend"],
  fullscreen: ["fsEnter", "fsExit"],
  "tool-search": ["search"], "tool-locate": ["locate"], "tool-measure": ["measure"], "tool-draw": ["draw"], "tool-print": ["print"],
});
/** The inline actions a layer row's "…" section must offer, in order. */
export const LAYER_ACTIONS = Object.freeze(["zoom", "info", "up", "down", "legend", "reset"]);
/** The Recommended section must open with these. */
export const RECOMMENDED_FIRST = Object.freeze(["osm", "osm-dark"]);

/**
 * A comparable signature of an SVG string: the child elements with their attributes, sorted —
 * immune to how a browser re-serialises (`<path/>` → `<path></path>`, attribute order, spacing).
 * The same function runs in the page (it is stringified into the evaluated source).
 */
export function svgSignature(svgHtml) {
  const s = String(svgHtml ?? "");
  const inner = s.replace(/^\s*<svg\b[^>]*>/i, "").replace(/<\/svg>\s*$/i, "");
  const out = [];
  const re = /<([a-zA-Z][\w-]*)\b([^>]*?)\/?>/g;
  let m;
  while ((m = re.exec(inner))) {
    const attrs = [];
    const ar = /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let a;
    while ((a = ar.exec(m[2]))) attrs.push(`${a[1]}=${(a[3] ?? a[4] ?? "").trim().replace(/\s+/g, " ")}`);
    out.push(`${m[1].toLowerCase()}[${attrs.sort().join(";")}]`);
  }
  return out.join("|");
}

/** Escape a value for use inside a double-quoted CSS attribute selector. */
export const cssAttr = (v) => String(v).replace(/["\\]/g, "\\$&");

/** The non-printing keys cdpKeyParams() knows: CDP `key`, `code`, Windows virtual-key code — and no
 *  `text` (a keyDown carrying text would also type it). */
export const CDP_KEYS = Object.freeze({
  Escape: { key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 },
  Enter: { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 },
  Tab: { key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 },
  ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37 },
  ArrowUp: { key: "ArrowUp", code: "ArrowUp", windowsVirtualKeyCode: 38 },
  ArrowRight: { key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 },
  ArrowDown: { key: "ArrowDown", code: "ArrowDown", windowsVirtualKeyCode: 40 },
  Home: { key: "Home", code: "Home", windowsVirtualKeyCode: 36 },
  End: { key: "End", code: "End", windowsVirtualKeyCode: 35 },
  Shift: { key: "Shift", code: "ShiftLeft", windowsVirtualKeyCode: 16 },
});
/**
 * Key parameters for CDP Input.dispatchKeyEvent — handy for a harness's `key(k)`. A named key from
 * CDP_KEYS (no `text`), else a single printable character (a letter → `Key<L>`, a digit → `Digit<n>`,
 * with `text`). `{ shift: true }` adds the Shift modifier (CDP modifiers bit 8) and upper-cases a letter.
 */
export function cdpKeyParams(k, { shift = false } = {}) {
  const mod = shift ? { modifiers: 8 } : {};
  if (CDP_KEYS[k]) return { ...CDP_KEYS[k], ...mod };
  const ch = shift && /^[a-z]$/.test(k) ? k.toUpperCase() : k;
  const up = k.toUpperCase();
  const code = /^[a-z]$/i.test(k) ? `Key${up}` : /^d$/.test(k) ? `Digit${k}` : k === " " ? "Space" : k;
  return { key: ch, code, windowsVirtualKeyCode: up.charCodeAt(0), text: ch, ...mod };
}

/**
 * Build { evaluate, click, key } from a CDP `send(method, params) → Promise<result>` that is already
 * bound to the page's session. Optional sugar for CDP harnesses; any other driver works too.
 */
export function cdpAdapters(send) {
  const evaluate = async (src) => {
    const r = await send("Runtime.evaluate", { expression: `(function(){${src}})()`, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const click = async (selector) => {
    const p = await evaluate(`const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null; el.scrollIntoView({ block: "center", inline: "center" });
      const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };`);
    if (!p) throw new Error(`click: no element matches ${selector}`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "left", buttons: 1, clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.x, y: p.y, button: "left", buttons: 0, clickCount: 1 });
  };
  /** A real key press. `opts.shift` holds Shift for it (Shift down, the key, Shift up). Non-printing keys
   *  are sent as rawKeyDown with no `text`, so nothing is typed into a focused field. */
  const key = async (k, opts = {}) => {
    const p = cdpKeyParams(k, opts);
    if (opts.shift && k !== "Shift") await send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...CDP_KEYS.Shift, modifiers: 8 });
    const { text, ...rest } = p;
    await send("Input.dispatchKeyEvent", text ? { type: "keyDown", ...p } : { type: "rawKeyDown", ...rest });
    await send("Input.dispatchKeyEvent", { type: "keyUp", ...rest });
    if (opts.shift && k !== "Shift") await send("Input.dispatchKeyEvent", { type: "keyUp", ...CDP_KEYS.Shift });
  };
  return { evaluate, click, key };
}

async function loadIcons() {
  try { return (await import(new URL("../dist/icons.js", import.meta.url).href)).ICONS ?? null; } catch { return null; }
}

/** In-page helpers prepended to every evaluated body. */
const PRELUDE = `const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const vis = (el) => !!el && !el.hidden && !el.closest("[hidden]");
const ctl = () => $(".smc-ctl"); const drawer = () => $(".smc-drawer:not(.smc-tpanel)") ?? $(".smc-drawer");
const inst = () => ctl()?.closest(".smc")?.__smc ?? null;
const svgSignature = ${svgSignature.toString()};`;

/**
 * Run the conformance checks. See the file header for every option.
 * @returns {Promise<{ passed: number, failed: number, results: { name: string, ok: boolean, detail: string }[] }>}
 */
export async function runMapControlsConformance({
  evaluate, click, key, sleep, tools = {}, log, expect = {}, icons, timeout = 5000, evaluateStyle = "body",
} = {}) {
  if (typeof evaluate !== "function") throw new Error("runMapControlsConformance: `evaluate(jsSource)` is required");
  const wait = sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  const ICONS = icons === undefined ? await loadIcons() : icons;
  const results = [];
  const record = (name, ok, detail = "") => {
    const r = { name, ok: !!ok, detail: String(detail ?? "") };
    results.push(r);
    log?.(`  ${r.ok ? "✓" : "✗"} ${name}${r.detail ? ` — ${r.detail}` : ""}`, r);
    return r.ok;
  };

  // ── page access ──
  const ev = (body) => evaluate(evaluateStyle === "expression"
    ? `(async () => { ${PRELUDE}\n${body}\n})()`
    : `return (async () => { ${PRELUDE}\n${body}\n})();`);
  /** Poll `body` until its value satisfies `pred` (default: truthy) or the timeout ends; returns the last value. */
  const until = async (body, pred = (v) => !!v, ms = timeout) => {
    const end = Date.now() + ms;
    let v;
    for (;;) {
      try { v = await ev(body); } catch (e) { v = undefined; }
      if (pred(v)) return v;
      if (Date.now() >= end) return v;
      await wait(100);
    }
  };
  const doClick = async (selector) => {
    if (click) return click(selector);
    const okd = await ev(`const el = $(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true;`);
    if (!okd) throw new Error(`no element matches ${selector}`);
  };
  const doKey = async (k) => {
    // a focused input would swallow the shortcut — the controls ignore keys typed into fields
    await ev(`if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur?.(); return true;`);
    if (key) return key(k);
    await ev(`document.body.dispatchEvent(new KeyboardEvent("keydown", { key: ${JSON.stringify(k)}, bubbles: true, cancelable: true })); return true;`);
  };
  const DRAWER_STATE = `const d = drawer(); const open = $$(".smc-drawer").filter(vis);
    const b = (a) => $('.smc-ctl [data-act="' + a + '"]')?.getAttribute("aria-expanded") ?? null;
    return { exists: !!d, openCount: open.length, which: d && vis(d) ? (d.dataset.which || "") : null, layers: b("layers"), base: b("base") };`;
  const closeDrawer = async () => {
    const s = await ev(DRAWER_STATE).catch(() => null);
    if (s?.which) { await doKey("Escape"); await until(DRAWER_STATE, (v) => v && v.which == null, timeout); }
  };
  const check = async (name, fn) => {
    try { const r = await fn(); if (r !== undefined) record(name, r.ok, r.detail); }
    catch (e) { record(name, false, `threw: ${e?.message ?? e}`); }
  };

  const want = { home: true, layers: true, legend: true, fullscreen: true, minLayers: 0, scale: false, resizable: true, ...expect };
  const enabledTools = TOOL_ORDER.filter((t) => tools?.[t]);

  // ── 1. the cluster ──
  const cluster = await until(`const c = $$(".smc-ctl");
    return { n: c.length, buttons: c[0] ? $$("button[data-act]", c[0]).length : 0, inSmc: !!c[0]?.closest(".smc"),
      fsSupported: !!(document.fullscreenEnabled || document.webkitFullscreenEnabled) };`,
    (v) => v && v.n >= 1 && v.buttons > 0);
  await check("cluster: exactly one .smc-ctl, inside the .smc container", async () => ({
    ok: cluster?.n === 1 && cluster.inSmc, detail: cluster ? `${cluster.n} cluster(s), ${cluster.buttons} button(s)` : "no cluster rendered" }));
  if (!cluster?.n) return finish();

  const acts = await ev(`return $$("button[data-act]", ctl()).map((b) => ({ act: b.dataset.act, tool: b.dataset.tool ?? null }));`);
  const expectedDefaults = CLUSTER_ORDER.filter((a) =>
    (a !== "fit" || want.home) && (a !== "layers" || want.layers) && (a !== "legend" || want.legend) &&
    (a !== "fullscreen" || (want.fullscreen && cluster.fsSupported)));
  await check("cluster: default buttons in the fixed order (zoom in · zoom out · home | layers · basemap · legend · full screen)", async () => {
    const got = acts.filter((x) => !x.act.startsWith("tool-")).map((x) => x.act);
    return { ok: JSON.stringify(got) === JSON.stringify(expectedDefaults), detail: `got [${got.join(", ")}], expected [${expectedDefaults.join(", ")}]` };
  });
  await check("cluster: optional tools come after every default button", async () => {
    const firstTool = acts.findIndex((x) => x.act.startsWith("tool-"));
    const lastDefault = acts.map((x) => x.act.startsWith("tool-")).lastIndexOf(false);
    return { ok: firstTool === -1 || firstTool > lastDefault, detail: firstTool === -1 ? "no tools" : `first tool at ${firstTool}, last default at ${lastDefault}` };
  });
  await check(`tools: present iff enabled, in order search · locate · measure · draw · print (enabled: ${enabledTools.join(", ") || "none"})`, async () => {
    const got = acts.filter((x) => x.act.startsWith("tool-"));
    const names = got.map((x) => x.act.slice(5));
    const tagged = got.every((x) => x.tool === x.act.slice(5));
    return { ok: JSON.stringify(names) === JSON.stringify(enabledTools) && tagged,
      detail: `got [${names.join(", ")}]${tagged ? "" : " (a tool button lacks a matching data-tool)"}` };
  });

  // ── 2. icons ──
  await check("icons: every cluster button draws the package's own SVG (svg.smc-i, Lucide path data)", async () => {
    const got = await ev(`return $$("button[data-act]", ctl()).map((b) => { const s = $$("svg", b);
      return { act: b.dataset.act, n: s.length, cls: s[0]?.getAttribute("class") ?? "", vb: s[0]?.getAttribute("viewBox") ?? "",
        sig: s[0] ? svgSignature(s[0].outerHTML) : "" }; });`);
    const bad = [];
    for (const g of got) {
      if (g.n !== 1 || !/\bsmc-i\b/.test(g.cls) || g.vb !== "0 0 24 24") { bad.push(`${g.act}: not one svg.smc-i 24×24`); continue; }
      const keys = ICON_FOR[g.act];
      if (!ICONS || !keys) continue;
      if (!keys.some((k) => ICONS[k] && svgSignature(ICONS[k]) === g.sig)) bad.push(`${g.act}: glyph is not ICONS.${keys.join("|")}`);
    }
    return { ok: bad.length === 0, detail: bad.length ? bad.join("; ") : `${got.length} button(s)${ICONS ? "" : " (structure only: ../dist/icons.js not loadable — build the package)"}` };
  });

  // ── 3. drawers: keyboard, click, exclusivity, Esc ──
  // Reset the chrome ourselves (package >= 1.0.2 leaves its instance on the container): no drawer,
  // "More basemaps" collapsed, no popup — so no harness has to prepare state for these checks.
  await ev(`const c = inst(); if (!c) return false; c.closeAll?.(); c.closePopups?.(); if (c.state) c.state.moreOpen = false; return true;`).catch(() => false);
  await closeDrawer();
  if (want.layers) {
    await check("drawer: L opens the layer list (aria-expanded on Layers)", async () => {
      await doKey("l");
      const s = await until(DRAWER_STATE, (v) => v?.which === "layers" && v.layers === "true");
      return { ok: s?.which === "layers" && s.layers === "true" && s.openCount === 1, detail: JSON.stringify(s) };
    });
  }
  await check("drawer: B opens the basemap gallery — and only one drawer is ever open", async () => {
    await doKey("b");
    const s = await until(DRAWER_STATE, (v) => v?.which === "base" && v.base === "true");
    return { ok: s?.which === "base" && s.base === "true" && s.openCount === 1 && s.layers !== "true", detail: JSON.stringify(s) };
  });
  await check("drawer: Esc closes it (both buttons aria-expanded=false)", async () => {
    await doKey("Escape");
    const s = await until(DRAWER_STATE, (v) => v && v.which == null);
    return { ok: s && s.which == null && s.openCount === 0 && s.base !== "true" && s.layers !== "true", detail: JSON.stringify(s) };
  });
  if (want.layers) {
    await check("drawer: clicking Layers opens the layer list; clicking Basemap swaps to the gallery", async () => {
      await doClick('.smc-ctl [data-act="layers"]');
      const a = await until(DRAWER_STATE, (v) => v?.which === "layers");
      await doClick('.smc-ctl [data-act="base"]');
      const b = await until(DRAWER_STATE, (v) => v?.which === "base");
      return { ok: a?.which === "layers" && b?.which === "base" && b.openCount === 1 && b.layers !== "true",
        detail: `after Layers: ${a?.which ?? "closed"}; after Basemap: ${b?.which ?? "closed"} (${b?.openCount ?? 0} open)` };
    });
  }

  // ── 4. the basemap gallery ──
  const GALLERY = `const d = drawer(); if (!d || !vis(d) || d.dataset.which !== "base") return null;
      const rec = $$('[data-section="recommended"] [data-base]', d).map((b) => b.dataset.base);
      const more = $("[data-bmmore]", d); const body = more ? (document.getElementById(more.getAttribute("aria-controls")) ?? $('[data-section="more"]', d)) : null;
      const checked = $('[data-base][aria-checked="true"]:not(.bm-follow)', d);
      const follow = $(".bm-follow", d);
      return { rec, more: !!more, moreText: more?.textContent ?? "", moreExpanded: more?.getAttribute("aria-expanded") ?? null,
        bodyHidden: body ? !vis(body) : null, selectedInMore: !!(checked && body && body.contains(checked)),
        follow: !!follow, followRole: follow?.getAttribute("role") ?? null, followChecked: follow?.getAttribute("aria-checked") ?? null,
        followText: follow?.textContent ?? "" };`;
  {
    const s = await ev(DRAWER_STATE);
    if (s?.which !== "base") { await doKey("b"); await until(DRAWER_STATE, (v) => v?.which === "base"); }
    const g = await until(GALLERY, (v) => !!v && v.rec.length > 0);
    await check("gallery: Recommended opens with OpenStreetMap, then OpenStreetMap Dark", async () => ({
      ok: !!g && RECOMMENDED_FIRST.every((id, i) => g.rec[i] === id), detail: g ? `[${g.rec.slice(0, 4).join(", ")}${g.rec.length > 4 ? ", …" : ""}]` : "gallery not rendered" }));
    await check('gallery: a collapsed "More basemaps" section', async () => {
      if (!g?.more) return { ok: false, detail: "no [data-bmmore] button" };
      const named = /More basemaps/.test(g.moreText);
      // Opening the gallery on a basemap that is NOT Recommended ("none", or one in More) expands More
      // on purpose. Run the check on a Recommended basemap instead: pick OpenStreetMap, reopen, look,
      // then restore the app's own basemap.
      const prev = await ev(`const c = inst(); if (!c) return null;
        return { auto: !!c.state?.autoBasemap, basemap: c.getBasemap?.() ?? null, effective: c.effectiveBasemap?.() ?? null,
          recommended: (c.recommendedIds?.() ?? []).includes(c.effectiveBasemap?.()) };`).catch(() => null);
      if (prev && !prev.recommended) {
        const pick = `.smc-drawer [data-section="recommended"] [data-base="${RECOMMENDED_FIRST[0]}"]`;
        try {
          await doClick(pick);
          await ev(`const c = inst(); c.closeAll(); c.state.moreOpen = false; return true;`);
          await doKey("b");
          const g2 = await until(GALLERY, (v) => !!v && v.rec.length > 0);
          return { ok: named && g2?.moreExpanded === "false" && g2.bodyHidden === true,
            detail: `on ${RECOMMENDED_FIRST[0]} (the app opened on ${prev.effective ?? "none"}): aria-expanded=${g2?.moreExpanded}, body hidden=${g2?.bodyHidden}` };
        } finally {
          const back = prev.auto ? "null" : JSON.stringify(prev.basemap ?? prev.effective);
          await ev(`const c = inst(); c.setBasemap(${back}); return true;`).catch(() => {});
        }
      }
      // an older package (no instance on the container): the 1.0.1 rule — a basemap in More expands it
      if (g.selectedInMore) return { ok: named && g.moreExpanded === "true" && g.bodyHidden === false, detail: "expanded because the current basemap lives in More (by design)" };
      return { ok: named && g.moreExpanded === "false" && g.bodyHidden === true, detail: `aria-expanded=${g.moreExpanded}, body hidden=${g.bodyHidden}` };
    });
    await check("gallery: both halves of the theme pair are under Recommended (1.0.3)", async () => {
      const pair = await ev(`const c = inst(); if (!c?.themeBasemap) return null;
        return [c.themeBasemap("light"), c.themeBasemap("dark")];`).catch(() => null);
      if (!pair) return { ok: true, detail: "skipped: package < 1.0.3 (no themeBasemap())" };
      if ((await ev(DRAWER_STATE))?.which !== "base") { await doKey("b"); await until(DRAWER_STATE, (v) => v?.which === "base"); }
      const cur = await until(GALLERY, (v) => !!v && v.rec.length > 0);
      const missing = pair.filter((id) => id && !(cur?.rec ?? []).includes(id));
      return { ok: missing.length === 0, detail: missing.length ? `not under Recommended: ${missing.join(", ")}` : `pair ${pair.join(" / ")}` };
    });
    await check('gallery: a "Follow the theme" switch', async () => ({
      ok: !!g?.follow && g.followRole === "switch" && /Follow the theme/.test(g.followText) && ["true", "false"].includes(g.followChecked),
      detail: g?.follow ? `role=${g.followRole}, aria-checked=${g.followChecked}` : "no .bm-follow" }));

    // ── 4b. the drawer's resize grip (resizable by default) ──
    {
      const st = await ev(DRAWER_STATE);
      if (st?.which !== "base") { await doKey("b"); await until(DRAWER_STATE, (v) => v?.which === "base"); }
      const GRIP = `const g = $(".smc-dgrip"); if (!g) return { has: false };
        const n = (a) => (g.getAttribute(a) == null ? null : Number(g.getAttribute(a)));
        return { has: true, shown: vis(g), role: g.getAttribute("role"), tab: g.getAttribute("tabindex"),
          now: n("aria-valuenow"), min: n("aria-valuemin"), max: n("aria-valuemax") };`;
      const g0 = await ev(GRIP);
      if (!want.resizable) {
        await check("drawer grip: absent (the app declared the drawer not resizable)", async () => ({
          ok: !g0?.has || !g0.shown, detail: g0?.has ? "a grip is shown" : "no grip" }));
      } else {
        await check("drawer grip: an ARIA separator on the open drawer (focusable, aria-valuenow / min / max)", async () => ({
          ok: !!g0?.has && g0.shown && g0.role === "separator" && g0.tab === "0" && g0.min > 0 && g0.max >= g0.min,
          detail: g0?.has ? `shown=${g0.shown} role=${g0.role} now=${g0.now} min=${g0.min} max=${g0.max}`
            : "no .smc-dgrip — package < 1.0.2, or the drawer is not resizable (then pass expect.resizable:false)" }));
        if (g0?.has) {
          await check("drawer grip: Home / End / arrow keys resize the drawer, clamped to min / max", async () => {
            const press = (k) => ev(`const g = $(".smc-dgrip"); g.focus?.();
              g.dispatchEvent(new KeyboardEvent("keydown", { key: ${JSON.stringify(k)}, bubbles: true, cancelable: true })); return true;`);
            const rtl = await ev(`return ctl()?.closest(".smc")?.getAttribute("data-smc-dir") === "rtl";`);
            const wider = rtl ? "ArrowRight" : "ArrowLeft", narrower = rtl ? "ArrowLeft" : "ArrowRight";
            await press("Home"); const a = await ev(GRIP);
            await press(wider); const b = await ev(GRIP);
            await press("End"); const c = await ev(GRIP);
            await press(narrower); const d = await ev(GRIP);
            await press("Home");
            return { ok: a.now === a.min && b.now > a.now && c.now >= b.now && d.now < c.now,
              detail: `Home ${a.now} → ${wider} ${b.now} → End ${c.now} → ${narrower} ${d.now}` };
          });
        }
      }
      // ── 4c. credits: the attribution stays visible beside the chrome ──
      await check("credits: the MapLibre attribution is not covered by the cluster or an open drawer", async () => {
        const r = await ev(`const a = $$(".maplibregl-ctrl-attrib,.mapboxgl-ctrl-attrib").find((x) => x.getBoundingClientRect().width > 0);
          if (!a) return { none: true };
          const R = (el) => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width }; };
          const hit = (p, q) => p.w > 0 && q.w > 0 && p.l < q.r - 0.5 && q.l < p.r - 0.5 && p.t < q.b - 0.5 && q.t < p.b - 0.5;
          const A = R(a); const out = [];
          if (hit(A, R(ctl()))) out.push("cluster");
          const d = drawer(); if (d && vis(d) && hit(A, R(d))) out.push("drawer (" + d.dataset.which + ")");
          return { none: false, covered: out };`);
        if (r?.none) return { ok: true, detail: "skipped: no MapLibre attribution laid out on the page" };
        return { ok: !r.covered.length, detail: r.covered.length ? `covered by ${r.covered.join(" and ")} — raise --smc-drawer-bottom` : "clear of the cluster and the open gallery" };
      });
    }
    await closeDrawer();
  }

  // ── 5. the layer list ──
  if (want.layers) {
    await doKey("l");
    await until(DRAWER_STATE, (v) => v?.which === "layers");
    const rows = await until(`const d = drawer(); if (!d || d.dataset.which !== "layers" || !vis(d)) return null;
      return $$(".ll-row[data-ll-id]", d).map((r) => r.dataset.llId);`, (v) => Array.isArray(v));
    if (!rows?.length) {
      record("layers: rows", want.minLayers <= 0, want.minLayers > 0 ? `0 rows, expected ≥ ${want.minLayers}` : "no operational layers — row checks skipped");
    } else {
      if (want.minLayers > 0) record(`layers: at least ${want.minLayers} row(s)`, rows.length >= want.minLayers, `${rows.length} row(s)`);
      const id = rows[0];
      const ROW = `.smc-drawer .ll-row[data-ll-id="${cssAttr(id)}"]`;
      const rowState = `const r = $(${JSON.stringify(ROW)}); if (!r) return null;
        const a = (s) => $(s, r);
        const acts = a(".ll-acts"); const leg = a(".ll-legend");
        return { eye: !!a('[data-ll-act="eye"]'), eyePressed: a('[data-ll-act="eye"]')?.getAttribute("aria-pressed") ?? null,
          eyeSvg: !!a('[data-ll-act="eye"] svg.smc-i'), expand: !!a('[data-ll-act="expand"]'),
          expandExpanded: a('[data-ll-act="expand"]')?.getAttribute("aria-expanded") ?? null,
          more: !!a('[data-ll-act="acts"]'), moreExpanded: a('[data-ll-act="acts"]')?.getAttribute("aria-expanded") ?? null,
          actsOpen: vis(acts), legendOpen: vis(leg),
          cmds: acts ? $$("[data-ll-cmd]", acts).filter((b) => b.closest(".ll-tools")).map((b) => b.dataset.llCmd) : [],
          slider: (() => { const s = acts && $('input[type="range"][data-ll-opacity]', acts);
            return s ? { min: s.getAttribute("min"), max: s.getAttribute("max"), value: s.value } : null; })() };`;
      const r0 = await ev(rowState);
      await check(`layers: row "${id}" has an eye (aria-pressed), a legend chevron and a "…" options button`, async () => ({
        ok: !!r0 && r0.eye && ["true", "false"].includes(r0.eyePressed) && r0.eyeSvg && r0.expand && r0.more,
        detail: r0 ? `eye=${r0.eye}(${r0.eyePressed}) chevron=${r0.expand} more=${r0.more}` : "row not found" }));
      await check("layers: the chevron toggles the inline legend", async () => {
        const before = (await ev(rowState))?.legendOpen;
        await doClick(`${ROW} [data-ll-act="expand"]`);
        const mid = await until(rowState, (v) => v && v.legendOpen !== before);
        await doClick(`${ROW} [data-ll-act="expand"]`);
        const after = await until(rowState, (v) => v && v.legendOpen === before);
        return { ok: mid?.legendOpen === !before && mid.expandExpanded === String(!before) && after?.legendOpen === before,
          detail: `open: ${before} → ${mid?.legendOpen} → ${after?.legendOpen}` };
      });
      await check(`layers: "…" opens an inline actions section — ${LAYER_ACTIONS.join(" · ")} + a transparency slider`, async () => {
        const start = await ev(rowState);
        if (start?.actsOpen) { await doClick(`${ROW} [data-ll-act="acts"]`); await until(rowState, (v) => v && !v.actsOpen); }
        await doClick(`${ROW} [data-ll-act="acts"]`);
        const open = await until(rowState, (v) => v?.actsOpen === true);
        const okCmds = JSON.stringify(open?.cmds ?? []) === JSON.stringify(LAYER_ACTIONS);
        const okSlider = open?.slider && open.slider.min === "0" && open.slider.max === "100";
        return { ok: !!open?.actsOpen && open.moreExpanded === "true" && okCmds && !!okSlider,
          detail: `open=${open?.actsOpen} actions=[${(open?.cmds ?? []).join(", ")}] slider=${open?.slider ? `${open.slider.min}–${open.slider.max} @${open.slider.value}` : "none"}` };
      });
      await check('layers: "…" again collapses the actions section', async () => {
        await doClick(`${ROW} [data-ll-act="acts"]`);
        const s = await until(rowState, (v) => v && v.actsOpen === false);
        return { ok: s?.actsOpen === false && s.moreExpanded === "false", detail: `open=${s?.actsOpen} aria-expanded=${s?.moreExpanded}` };
      });
    }
    await closeDrawer();
  }

  // ── 6. full screen ──
  if (want.fullscreen) {
    const FS = `const b = $('.smc-ctl [data-act="fullscreen"]');
      return { has: !!b, pressed: b?.getAttribute("aria-pressed") ?? null, el: !!(document.fullscreenElement || document.webkitFullscreenElement),
        supported: !!(document.fullscreenEnabled || document.webkitFullscreenEnabled) };`;
    await check("fullscreen: the button toggles aria-pressed", async () => {
      const s0 = await ev(FS);
      if (!s0.has) return { ok: !s0.supported, detail: s0.supported ? "Fullscreen API supported but no button" : "skipped: this browser has no Fullscreen API (the package omits the button)" };
      if (s0.pressed !== "false") return { ok: false, detail: `starts aria-pressed=${s0.pressed}` };
      await doClick('.smc-ctl [data-act="fullscreen"]');
      const s1 = await until(FS, (v) => v?.pressed === "true", Math.min(timeout, 3000));
      if (s1?.pressed !== "true") {
        // headless browsers (or a click without user activation) may refuse requestFullscreen; the
        // button must then stay consistent with the document, never claim a state it is not in
        return { ok: s1?.pressed === "false" && !s1.el, detail: "tolerated: the browser refused full screen (headless / no user activation); aria-pressed stayed false, consistently" };
      }
      await doClick('.smc-ctl [data-act="fullscreen"]');
      let s2 = await until(FS, (v) => v?.pressed === "false", Math.min(timeout, 3000));
      if (s2?.pressed !== "false") { await ev(`await (document.exitFullscreen?.() ?? Promise.resolve()).catch?.(() => {}); return true;`); s2 = await until(FS, (v) => v?.pressed === "false"); }
      return { ok: s2?.pressed === "false", detail: `false → ${s1.pressed} → ${s2?.pressed}` };
    });
  }

  // ── 7. the optional scale bar ──
  {
    const wantScale = !!want.scale;
    const wantUnits = wantScale ? (typeof want.scale === "object" && want.scale.units ? want.scale.units : "metric") : null;
    const SCALE = `const all = $$(".smc-scale"); const el = all[0];
      if (!el) return { n: 0 };
      const lines = $$(".smc-scale-line", el).map((l) => ({ unit: l.dataset.unit ?? null, text: (l.textContent || "").trim(), w: l.getBoundingClientRect().width }));
      const box = el.closest(".smc"); const r = el.getBoundingClientRect(); const b = box ? box.getBoundingClientRect() : null;
      return { n: all.length, inSmc: !!box, inCtl: !!el.closest(".smc-ctl"), units: el.dataset.units ?? null, lines,
        pos: getComputedStyle(el).position, layout: !!b && b.width > 0 && b.height > 0,
        left: b ? r.left - b.left : 0, bottom: b ? b.bottom - r.bottom : 0, bw: b ? b.width : 0, bh: b ? b.height : 0 };`;
    const s = await until(SCALE, (v) => v && (wantScale ? v.n >= 1 && v.lines?.length > 0 : true), wantScale ? timeout : 0);
    await check(`scale bar: .smc-scale present iff enabled (enabled: ${wantScale ? wantUnits : "no"})`, async () => ({
      ok: (s?.n ?? 0) === (wantScale ? 1 : 0), detail: `${s?.n ?? 0} .smc-scale element(s)` }));
    if (wantScale && s?.n === 1) {
      await check("scale bar: inside the .smc container, outside the cluster, bottom-left", async () => {
        const placed = !s.layout || (s.pos === "absolute" && s.left >= 0 && s.left < s.bw / 2 && s.bottom >= 0 && s.bottom < s.bh / 2);
        return { ok: s.inSmc && !s.inCtl && placed,
          detail: s.layout ? `position=${s.pos}, ${Math.round(s.left)}px from the left, ${Math.round(s.bottom)}px from the bottom` : "no layout (position not checked)" };
      });
      await check(`scale bar: ${wantUnits} line(s) with a rounded 1 / 2 / 5 × 10^n distance`, async () => {
        const units = wantUnits === "both" ? ["metric", "imperial"] : [wantUnits];
        const re = { metric: /^(\d+(\.\d+)?) (m|km)$/, imperial: /^(\d+(\.\d+)?) (ft|mi)$/ };
        const nice = (t) => { const n = Number(t); const p = Math.pow(10, Math.floor(Math.log10(n))); return [1, 2, 5].some((d) => Math.abs(n / p - d) < 1e-9); };
        const bad = [];
        if (s.units !== wantUnits) bad.push(`data-units=${s.units}`);
        if (JSON.stringify(s.lines.map((l) => l.unit)) !== JSON.stringify(units)) bad.push(`lines [${s.lines.map((l) => l.unit).join(", ")}]`);
        for (const l of s.lines) { const m = re[l.unit]?.exec(l.text); if (!m || !nice(m[1])) bad.push(`"${l.text}" is not a nice ${l.unit} distance`); }
        return { ok: bad.length === 0, detail: bad.length ? bad.join("; ") : s.lines.map((l) => l.text).join(" / ") };
      });
    }
  }

  await closeDrawer().catch(() => {});
  return finish();

  function finish() {
    const passed = results.filter((r) => r.ok).length;
    return { passed, failed: results.length - passed, results };
  }
}
