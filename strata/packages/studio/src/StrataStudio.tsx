/**
 * StrataStudio — a light visual editor MVP for an `AppLayout` (#13).
 *
 * Three panes: an **outline** of the layout tree (click to select a node), a live **preview** rendered by
 * `<StrataApp>`, and a **property inspector** (widget props / dataSource, container gap/columns/mode, and a
 * theme picker). Every edit runs a pure {@link editModel} operation and emits the new `AppLayout` via
 * `onChange` — so mouse-edits round-trip the same JSON that `/app` and hand-edits use. Not a full ExB
 * WYSIWYG; the escape hatch that makes "great first result + a few clicks" beat re-prompting.
 */
import React, { useMemo, useState } from "react";
import type { AppLayout, ContainerNode, WidgetSpec } from "@strata/schema";
import { StrataApp } from "@strata/core-map";
import { THEME_PRESETS, themeTokens } from "@strata/theme";
import { outline, getNode, updateWidget, updateContainer, moveChild, setTheme, type NodePath } from "./editModel.js";

export interface StrataStudioProps {
  config: AppLayout;
  onChange?: (layout: AppLayout) => void;
  registry?: Record<string, any>;
  context?: Record<string, unknown>;
  /** Page to edit (default the first). */
  pageId?: string;
}

export function StrataStudio(props: StrataStudioProps): React.ReactElement {
  const [layout, setLayout] = useState<AppLayout>(props.config);
  const [selected, setSelected] = useState<NodePath | null>(null);
  const pageId = props.pageId ?? layout.pages[0]?.id;
  const page = layout.pages.find((p) => p.id === pageId) ?? layout.pages[0];

  const commit = (next: AppLayout): void => {
    setLayout(next);
    props.onChange?.(next);
  };

  const entries = useMemo(() => (page ? outline(page) : []), [page]);
  const selectedNode = selected && page ? getNode(page, selected) : null;

  return (
    <div data-strata-studio="" style={rootStyle}>
      {/* Outline */}
      <aside style={paneStyle} aria-label="Outline">
        <div style={paneTitle}>Outline</div>
        {entries.map((e, i) => {
          const active = selected && e.path.join(",") === selected.join(",");
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(e.path)}
              style={{ ...outlineRow, paddingInlineStart: 8 + e.depth * 12, ...(active ? outlineActive : null) }}
            >
              {e.label}
            </button>
          );
        })}
      </aside>

      {/* Preview */}
      <main style={{ ...paneStyle, flex: 1, padding: 0, overflow: "hidden" }} aria-label="Preview">
        <StrataApp config={layout} registry={props.registry} context={props.context} page={pageId} />
      </main>

      {/* Inspector */}
      <aside style={paneStyle} aria-label="Inspector">
        <div style={paneTitle}>Inspector</div>

        <div style={{ marginBottom: 12 }}>
          <label style={fieldLabel}>Theme</label>
          <select
            style={inputStyle}
            aria-label="Theme"
            value={themeNameFor(layout.theme)}
            onChange={(e) => commit(setTheme(layout, themeTokens(e.target.value)))}
          >
            {Object.keys(THEME_PRESETS).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {!selectedNode && <div style={{ fontSize: 12, opacity: 0.6 }}>Select a node in the outline to edit it.</div>}

        {selectedNode && selectedNode.kind === "widget" && (
          <WidgetInspector
            spec={selectedNode.widget}
            onChange={(patch) => selected && commit(updateWidget(layout, page!.id, selected, patch))}
          />
        )}

        {selectedNode && "children" in selectedNode && (
          <ContainerInspector
            node={selectedNode as ContainerNode}
            childCount={(selectedNode as ContainerNode).children.length}
            onChange={(patch) => selected && commit(updateContainer(layout, page!.id, selected, patch))}
            onMove={(from, to) => selected && commit(moveChild(layout, page!.id, selected, from, to))}
          />
        )}
      </aside>
    </div>
  );
}

function WidgetInspector(props: { spec: WidgetSpec; onChange: (patch: Partial<WidgetSpec>) => void }): React.ReactElement {
  const [propsText, setPropsText] = useState(JSON.stringify(props.spec.props ?? {}, null, 2));
  const [err, setErr] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12 }}>
        Type: <strong>{props.spec.type}</strong>
      </div>
      <label style={fieldLabel}>id</label>
      <input style={inputStyle} aria-label="Widget id" value={props.spec.id ?? ""} onChange={(e) => props.onChange({ id: e.target.value || undefined })} />
      <label style={fieldLabel}>dataSource.layerId</label>
      <input
        style={inputStyle}
        aria-label="Layer id"
        value={props.spec.dataSource?.layerId ?? ""}
        onChange={(e) => props.onChange({ dataSource: { layerId: e.target.value || undefined } })}
      />
      <label style={fieldLabel}>props (JSON)</label>
      <textarea
        style={{ ...inputStyle, minHeight: 100, fontFamily: "monospace" }}
        aria-label="Props JSON"
        value={propsText}
        onChange={(e) => {
          setPropsText(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            setErr(null);
            props.onChange({ props: parsed });
          } catch (ex) {
            setErr((ex as Error).message);
          }
        }}
      />
      {err && <div style={{ color: "var(--strata-critical,#e53e3e)", fontSize: 11 }}>Invalid JSON: {err}</div>}
    </div>
  );
}

function ContainerInspector(props: {
  node: ContainerNode;
  childCount: number;
  onChange: (patch: Partial<ContainerNode>) => void;
  onMove: (from: number, to: number) => void;
}): React.ReactElement {
  const { node } = props;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12 }}>
        Container: <strong>{node.kind}</strong>
      </div>
      <label style={fieldLabel}>gap</label>
      <input type="number" style={inputStyle} aria-label="Gap" value={node.gap ?? 12} onChange={(e) => props.onChange({ gap: Number(e.target.value) })} />
      {node.kind === "grid" && (
        <>
          <label style={fieldLabel}>columns</label>
          <input type="number" style={inputStyle} aria-label="Columns" value={node.columns ?? 2} onChange={(e) => props.onChange({ columns: Number(e.target.value) })} />
        </>
      )}
      <label style={fieldLabel}>mode</label>
      <select style={inputStyle} aria-label="Mode" value={node.mode ?? "flow"} onChange={(e) => props.onChange({ mode: e.target.value as "fixed" | "flow" })}>
        <option value="flow">flow</option>
        <option value="fixed">fixed</option>
      </select>
      <label style={fieldLabel}>animate</label>
      <select style={inputStyle} aria-label="Animate" value={node.animate ?? ""} onChange={(e) => props.onChange({ animate: (e.target.value || undefined) as any })}>
        <option value="">none</option>
        <option value="fade">fade</option>
        <option value="slide">slide</option>
        <option value="scroll-reveal">scroll-reveal</option>
      </select>
      {props.childCount > 1 && (
        <div>
          <label style={fieldLabel}>reorder children</label>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: props.childCount }, (_, i) => (
              <button key={i} type="button" style={miniBtn} title={`Move child ${i} up`} onClick={() => props.onMove(i, Math.max(0, i - 1))}>
                {i}↑
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Match a flat theme token map back to a preset name (by `--strata-accent`); default "dark". A structured
 * `ThemeSpec` (no flat tokens) has no preset name, so it falls through to the default.
 */
function themeNameFor(theme?: AppLayout["theme"]): string {
  if (!theme || typeof theme !== "object") return "dark";
  const flat = theme as Record<string, unknown>;
  for (const [name, preset] of Object.entries(THEME_PRESETS)) {
    if (preset.tokens["--strata-accent"] === flat["--strata-accent"]) return name;
  }
  return "dark";
}

export default StrataStudio;

const rootStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  height: "100%",
  minHeight: 400,
  color: "var(--strata-fg, #e8ecf1)",
  background: "var(--strata-app-bg, #0b0e13)",
};
const paneStyle: React.CSSProperties = {
  width: 240,
  padding: 10,
  overflow: "auto",
  background: "var(--strata-panel-bg, #12151b)",
  border: "1px solid var(--strata-border, rgba(255,255,255,0.08))",
  borderRadius: 8,
};
const paneTitle: React.CSSProperties = { fontWeight: 700, fontSize: 12, textTransform: "uppercase", opacity: 0.7, marginBottom: 8 };
const outlineRow: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "start",
  font: "inherit",
  fontSize: 12,
  padding: "4px 8px",
  border: "none",
  borderRadius: 6,
  background: "transparent",
  color: "var(--strata-fg, #e8ecf1)",
  cursor: "pointer",
};
const outlineActive: React.CSSProperties = { background: "var(--strata-accent, #4ea1ff)", color: "#0b0e13", fontWeight: 600 };
const fieldLabel: React.CSSProperties = { fontSize: 11, opacity: 0.7, display: "block", marginTop: 4 };
const inputStyle: React.CSSProperties = {
  font: "inherit",
  fontSize: 12,
  padding: "5px 7px",
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid var(--strata-border, #333)",
  borderRadius: 4,
  background: "var(--strata-app-bg, #0b0e13)",
  color: "var(--strata-fg, #e8ecf1)",
};
const miniBtn: React.CSSProperties = {
  font: "inherit",
  fontSize: 11,
  padding: "3px 6px",
  border: "1px solid var(--strata-border, #333)",
  borderRadius: 4,
  background: "transparent",
  color: "var(--strata-fg, #e8ecf1)",
  cursor: "pointer",
};
