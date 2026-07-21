/**
 * AnalysisPanel — a generic shell over a spatial-analysis registry ([ExB] Analysis widget, MIT).
 *
 * The app injects a `registry` (typically `@strata/processing`'s `registry` — Turf ops keyed by id, each
 * `{ label, description, run(args) }`). The panel lets a user pick a tool, supply a scalar parameter / group
 * field, and Run; the result is **published as an output data source** (its features become records other
 * widgets consume) and handed to `onResult` / `onAddLayer`. Kept dependency-free of `@strata/processing`
 * (the registry is structural + injected), so core-map doesn't pull Turf into its graph.
 *
 * `buildToolArgs` (pure, exported) maps the panel's generic inputs (primary FC, an optional secondary FC,
 * a scalar param, a group field, a predicate) onto each tool's named `run` arguments.
 */
import React, { useState } from "react";
import { PanelShell, type PanelMode } from "./PanelShell.js";
import { TOOL_ARGS, buildToolArgs, resultRecords, type AnalysisTool } from "./analysisArgs.js";

export type { AnalysisTool } from "./analysisArgs.js";

export interface AnalysisPanelProps {
  /** The tool registry (inject `@strata/processing`'s `registry`). */
  registry: Record<string, AnalysisTool>;
  /** Which tool ids to offer (default: every id in `registry` that `TOOL_ARGS` knows). */
  tools?: string[];
  /** The primary input FeatureCollection (the app supplies it, e.g. from a layer). */
  input?: unknown;
  /** A secondary FeatureCollection for two-input ops (mask / join / reference / polygons). */
  secondary?: unknown;
  /** Publish the result's records here (injected by `<StrataApp>`). */
  outputs?: { publish: (p: { widgetId: string; records: unknown; layerId?: string }) => void };
  /** Called with the raw tool result. */
  onResult?: (result: unknown) => void;
  /** Called with a FeatureCollection result to add it to the map as a new layer. */
  onAddLayer?: (fc: unknown) => void;
  widgetId?: string;
  id?: string;
  title?: string;
  mode?: PanelMode;
  floating?: boolean;
  initialX?: number;
  initialY?: number;
  defaultWidth?: number;
  onClose?: () => void;
  onOpen?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function AnalysisPanel(props: AnalysisPanelProps): React.ReactElement {
  const widgetId = props.widgetId ?? props.id ?? "analysis";
  const toolIds = (props.tools ?? Object.keys(props.registry)).filter((id) => props.registry[id]);
  const [toolId, setToolId] = useState<string>(toolIds[0] ?? "");
  const [param, setParam] = useState<string>("");
  const [field, setField] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  const spec = TOOL_ARGS[toolId];

  const run = async (): Promise<void> => {
    const tool = props.registry[toolId];
    if (!tool) return;
    setRunning(true);
    try {
      const args = buildToolArgs(toolId, {
        input: props.input,
        secondary: props.secondary,
        param: param.trim() === "" ? undefined : Number(param),
        field: field.trim() === "" ? undefined : field.trim(),
      });
      const result = await Promise.resolve(tool.run(args));
      const records = resultRecords(result);
      props.outputs?.publish({ widgetId, records });
      props.onResult?.(result);
      props.onAddLayer?.(result);
      setCount(Array.isArray(records) ? records.length : 1);
    } finally {
      setRunning(false);
    }
  };

  return (
    <PanelShell
      title={props.title ?? "Analysis"}
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth ?? 300}
      onClose={props.onClose}
      onOpen={props.onOpen}
      className={props.className}
      style={props.style}
    >
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
          Tool
          <select style={ctl} value={toolId} onChange={(e) => setToolId(e.target.value)} aria-label="Tool">
            {toolIds.map((id) => (
              <option key={id} value={id}>
                {props.registry[id]?.label ?? id}
              </option>
            ))}
          </select>
        </label>

        {spec?.param && (
          <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {spec.param.label}
            <input style={ctl} type="number" value={param} aria-label={spec.param.label} onChange={(e) => setParam(e.target.value)} />
          </label>
        )}
        {spec?.field && (
          <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            Group field
            <input style={ctl} value={field} aria-label="Group field" onChange={(e) => setField(e.target.value)} />
          </label>
        )}

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ flex: 1 }} />
          {count != null && (
            <span style={{ fontSize: 12, color: "var(--strata-muted,#8b95a5)" }} data-testid="analysis-count">
              {count} feature{count === 1 ? "" : "s"}
            </span>
          )}
          <button style={primaryBtn} disabled={running || !toolId} onClick={() => void run()}>
            {running ? "Running…" : "Run"}
          </button>
        </div>
      </div>
    </PanelShell>
  );
}

export default AnalysisPanel;

const ctl: React.CSSProperties = { font: "inherit", fontSize: 12, padding: "4px 6px", border: "1px solid var(--strata-border,#d5d5d5)", borderRadius: 4, background: "var(--strata-panel-bg,#fff)", color: "var(--strata-fg,inherit)" };
const primaryBtn: React.CSSProperties = { font: "inherit", fontSize: 12, fontWeight: 600, padding: "5px 12px", border: "none", borderRadius: 6, background: "var(--strata-accent,#2b6cb0)", color: "#fff", cursor: "pointer" };
