/**
 * SharePanel — a Share widget ([ExB] Phase 3, MIT).
 *
 * Serializes the current app state (view, basemap, active layer, filters) into a deep-link URL and an
 * embed snippet via `@strata/export`'s `buildShareUrl` / `buildEmbedSnippet`, with copy buttons. Reads the
 * live view from a `store` when provided (or an explicit `state`).
 */
import React, { useMemo, useState } from "react";
import { buildShareUrl, buildEmbedSnippet, type ShareState } from "@strata/export";

export interface SharePanelProps {
  /** Base URL to share (defaults to the current page). */
  baseUrl?: string;
  /** Optional store to read the current view/basemap/active layer from. */
  store?: { getState: () => any };
  /** Explicit state override (wins over the store). */
  state?: ShareState;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

/** Derive share state from a store snapshot (best-effort; unknown slices are omitted). */
function stateFromStore(store?: { getState: () => any }): ShareState {
  if (!store) return {};
  const s = store.getState();
  const out: ShareState = {};
  if (s.view?.center) out.center = s.view.center;
  if (s.view?.zoom != null) out.zoom = s.view.zoom;
  if (s.baseMap?.title) out.basemap = s.baseMap.title;
  if (s.activeLayerId) out.active = s.activeLayerId;
  const filters: Record<string, string> = {};
  for (const l of s.layers ?? []) {
    const w = l.layerDefinition?.definitionExpression;
    if (w) filters[l.id] = w;
  }
  if (Object.keys(filters).length) out.filters = filters;
  return out;
}

export function SharePanel(props: SharePanelProps): React.ReactElement {
  const base = props.baseUrl ?? (typeof window !== "undefined" ? window.location.href : "https://example.com/");
  const [copied, setCopied] = useState<string | null>(null);

  const { url, embed } = useMemo(() => {
    const state = props.state ?? stateFromStore(props.store);
    const u = buildShareUrl(base, state);
    return { url: u, embed: buildEmbedSnippet(u) };
    // Recompute when inputs change; the store snapshot is read at render time.
  }, [base, props.state, props.store]);

  const copy = (text: string, which: string): void => {
    setCopied(which);
    if (typeof navigator !== "undefined" && navigator.clipboard) void navigator.clipboard.writeText(text);
  };

  return (
    <div className={props.className} style={{ display: "flex", flexDirection: "column", gap: 8, ...props.style }}>
      {props.title ? <div style={{ fontWeight: 600, fontSize: 12, opacity: 0.8 }}>{props.title}</div> : null}
      <label style={{ fontSize: 11, opacity: 0.7 }}>Link</label>
      <div style={{ display: "flex", gap: 4 }}>
        <input readOnly value={url} aria-label="Share link" style={inputStyle} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" style={btnStyle} onClick={() => copy(url, "link")}>
          {copied === "link" ? "✓" : "Copy"}
        </button>
      </div>
      <label style={{ fontSize: 11, opacity: 0.7 }}>Embed</label>
      <div style={{ display: "flex", gap: 4 }}>
        <input readOnly value={embed} aria-label="Embed snippet" style={inputStyle} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" style={btnStyle} onClick={() => copy(embed, "embed")}>
          {copied === "embed" ? "✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  font: "inherit",
  fontSize: 12,
  padding: "5px 7px",
  border: "1px solid var(--strata-border, #d5d5d5)",
  borderRadius: 4,
  flex: 1,
  minWidth: 0,
  background: "var(--strata-panel-bg, #fff)",
  color: "var(--strata-fg, inherit)",
};
const btnStyle: React.CSSProperties = {
  font: "inherit",
  fontSize: 12,
  fontWeight: 600,
  padding: "5px 10px",
  border: "none",
  borderRadius: 6,
  background: "var(--strata-accent, #2b6cb0)",
  color: "#fff",
  cursor: "pointer",
};

export default SharePanel;
