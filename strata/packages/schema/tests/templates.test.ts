/**
 * strata/templates/*.json — structural validation of the 30 Experience-Builder-parity app templates.
 *
 * Each template is a serialized `AppLayout` demonstrated against WebMaps/dc.json or WebMaps/md.json.
 * Code is the source of truth: widget `type` keys are extracted from core-map's registry.ts, and
 * trigger/action names from @strata/actions' index.ts, so this suite fails when the registry and the
 * templates drift apart.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const templatesDir = fileURLToPath(new URL("../../../templates/", import.meta.url));
const files = readdirSync(templatesDir).filter((f) => f.endsWith(".json"));

function read(rel: string): any {
  return JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8"));
}

// --- code-derived vocabularies -----------------------------------------------------------------
const registrySrc = readFileSync(
  fileURLToPath(new URL("../../core-map/src/react/app/registry.ts", import.meta.url)),
  "utf8",
);
const registryBody = registrySrc.split("defaultWidgetRegistry")[1] ?? "";
const WIDGET_TYPES = new Set(
  [...registryBody.matchAll(/^\s{2}(?:"([a-z0-9-]+)"|([a-zA-Z0-9]+)):\s/gm)].map((m) => m[1] ?? m[2]),
);

const actionsSrc = readFileSync(
  fileURLToPath(new URL("../../actions/src/index.ts", import.meta.url)),
  "utf8",
);
function union(name: string): Set<string> {
  const seg = actionsSrc.split(`export type ${name} =`)[1]?.split(";")[0] ?? "";
  return new Set([...seg.matchAll(/"([a-zA-Z]+)"/g)].map((m) => m[1]));
}
const TRIGGERS = union("StrataTriggerType");
const ACTIONS = union("StrataActionType");

const CONTAINER_KINDS = new Set([
  "row", "column", "grid", "section", "card", "accordion", "flow-row", "splitter", "window", "panel",
]);

const webmapLayers: Record<string, Set<string>> = {};
for (const wm of ["dc", "md"]) {
  const doc = read(`../../../../WebMaps/${wm}.json`);
  webmapLayers[wm] = new Set((doc.operationalLayers ?? []).map((l: any) => l.id));
}

// --- tree walkers ------------------------------------------------------------------------------
function* walkNodes(node: any): Generator<any> {
  yield node;
  if (node.kind === "views") {
    for (const v of node.views ?? []) yield* walkNodes(v.content);
  } else if (Array.isArray(node.children)) {
    for (const c of node.children) yield* walkNodes(c);
  }
}
function* allNodes(app: any): Generator<any> {
  for (const p of app.pages ?? []) {
    for (const part of [p.root, p.header, p.footer]) if (part) yield* walkNodes(part);
  }
}

describe("strata/templates", () => {
  it("ships exactly 30 templates", () => {
    expect(files.length).toBe(30);
  });

  it("extracted the widget registry and action vocabularies from source", () => {
    expect(WIDGET_TYPES.has("map")).toBe(true);
    expect(WIDGET_TYPES.has("layer-panel")).toBe(true);
    expect(TRIGGERS.has("featureSelect")).toBe(true);
    expect(ACTIONS.has("zoomTo")).toBe(true);
  });

  for (const file of files) {
    describe(file, () => {
      const app = JSON.parse(readFileSync(templatesDir + file, "utf8"));
      const meta = app["strata:template"];

      it("has template metadata matching its filename", () => {
        expect(meta).toBeTruthy();
        expect(`${meta.id}.json`).toBe(file);
        expect(["map-centric", "dashboard", "web-page", "grid"]).toContain(meta.category);
        expect(["dc", "md"]).toContain(meta.webmap);
        expect(typeof meta.blurb).toBe("string");
      });

      it("has at least one page with a root", () => {
        expect(Array.isArray(app.pages)).toBe(true);
        expect(app.pages.length).toBeGreaterThan(0);
        for (const p of app.pages) {
          expect(typeof p.id).toBe("string");
          expect(p.root).toBeTruthy();
          if (p.type) expect(["fixed", "scroll"]).toContain(p.type);
        }
      });

      it("uses only valid layout node kinds", () => {
        for (const n of allNodes(app)) {
          expect(
            n.kind === "widget" || n.kind === "views" || CONTAINER_KINDS.has(n.kind),
            `unknown node kind '${n.kind}'`,
          ).toBe(true);
          if (n.kind === "views") {
            expect(Array.isArray(n.views)).toBe(true);
            expect(n.views.length).toBeGreaterThan(0);
            for (const v of n.views) expect(typeof v.id).toBe("string");
          }
        }
      });

      it("references only registered widget types", () => {
        for (const n of allNodes(app)) {
          if (n.kind !== "widget") continue;
          expect(WIDGET_TYPES.has(n.widget.type), `unregistered widget type '${n.widget.type}'`).toBe(true);
        }
      });

      it("binds dataSource.layerId and map layerIds to layers of its webmap", () => {
        const layers = webmapLayers[meta.webmap];
        for (const n of allNodes(app)) {
          if (n.kind !== "widget") continue;
          const lid = n.widget.dataSource?.layerId;
          if (lid) expect(layers.has(lid), `unknown layerId '${lid}'`).toBe(true);
          if (n.widget.type === "map") {
            for (const id of n.widget.props?.layerIds ?? []) {
              expect(layers.has(id), `map layerId '${id}' not in ${meta.webmap}.json`).toBe(true);
            }
          }
        }
      });

      it("wires connections to declared widget/window ids with known triggers/actions", () => {
        const ids = new Set<string>();
        for (const n of allNodes(app)) {
          if (n.kind === "widget" && n.widget.id) ids.add(n.widget.id);
          if (n.kind === "window" && n.id) ids.add(n.id);
        }
        for (const c of app.connections ?? []) {
          expect(ids.has(c.from), `connection.from '${c.from}' is not a declared widget id`).toBe(true);
          if (c.to) expect(ids.has(c.to), `connection.to '${c.to}' is not a declared widget id`).toBe(true);
          expect(TRIGGERS.has(c.trigger), `unknown trigger '${c.trigger}'`).toBe(true);
          expect(ACTIONS.has(c.action), `unknown action '${c.action}'`).toBe(true);
        }
      });

      it("is interactive (≥1 connection) unless tiered trivial", () => {
        const n = (app.connections ?? []).length;
        if (meta.tier === "trivial") expect(n).toBeGreaterThanOrEqual(1);
        else expect(n).toBeGreaterThanOrEqual(2);
      });
    });
  }
});
