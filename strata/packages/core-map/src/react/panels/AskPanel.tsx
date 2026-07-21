/**
 * @strata/core-map — AskPanel (MIT).
 *
 * The **"Ask the map"** seam — a chat panel for the agentic *Data Explorer* pattern. strata-app-builder keeps
 * **no LLM or embeddings in the core** (per the AI-on-hold decision); instead the app supplies an `onAsk`
 * handler that turns a natural-language query into a reply + a list of **actions**, which this panel
 * dispatches to the `@strata/actions` bus (filter, zoom, select, …). Wire `onAsk` to Claude / an LLM / a
 * deterministic NL→action parser as you see fit.
 */
import React, { useCallback, useRef, useState } from "react";
import { PanelShell, type PanelMode } from "./PanelShell.js";

export interface AskAction {
  type: string;
  payload?: unknown;
}
export interface AskResponse {
  reply?: string;
  actions?: AskAction[];
}
export interface AskMessage {
  role: "user" | "assistant";
  text: string;
}

export interface AskPanelProps {
  /**
   * The app's handler — wire it to Claude / an LLM / a deterministic parser. Given the query + history,
   * return an optional text `reply` and optional `actions` (dispatched to the bus).
   */
  onAsk: (query: string, history: AskMessage[]) => Promise<AskResponse>;
  /** optional `@strata/actions` ActionBus — returned actions are emitted here. */
  bus?: { emit: (t: { type: string; source?: string; payload: unknown }) => void };
  suggestions?: string[];
  placeholder?: string;
  title?: string;
  mode?: PanelMode;
  onClose?: () => void;
}

export function AskPanel(props: AskPanelProps): React.ReactElement {
  const { onAsk, bus, suggestions = [], placeholder = "Ask about the map…" } = props;
  const [messages, setMessages] = useState<AskMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const send = useCallback(
    async (query: string) => {
      const q = query.trim();
      if (!q || busy) return;
      const history = [...messages, { role: "user" as const, text: q }];
      setMessages(history);
      setInput("");
      setBusy(true);
      try {
        const res = await onAsk(q, history);
        if (res.reply) setMessages((m) => [...m, { role: "assistant", text: res.reply as string }]);
        for (const a of res.actions ?? []) bus?.emit({ type: a.type, source: "ask", payload: a.payload });
        requestAnimationFrame(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight));
      } catch (e) {
        setMessages((m) => [...m, { role: "assistant", text: `Sorry — ${(e as Error).message}` }]);
      } finally {
        setBusy(false);
      }
    },
    [messages, onAsk, bus, busy]
  );

  return (
    <PanelShell title={props.title ?? "Ask the map"} mode={props.mode} onClose={props.onClose} defaultWidth={340}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 200 }}>
        <div ref={listRef} style={{ flex: 1, overflowY: "auto", maxHeight: 320, display: "flex", flexDirection: "column", gap: 6 }}>
          {messages.length === 0 && (
            <div style={{ fontSize: 11, color: "var(--strata-muted,#8b96a6)" }}>
              Ask a question — e.g. "show high-income countries", "zoom to Asia", "which are above 50M people".
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                padding: "5px 9px",
                borderRadius: 8,
                fontSize: 12,
                background: m.role === "user" ? "var(--strata-accent,#2b6cb0)" : "var(--strata-border,#2a2f3a)",
                color: "var(--strata-fg,#e8eef5)",
              }}
            >
              {m.text}
            </div>
          ))}
          {busy && <div style={{ fontSize: 11, color: "var(--strata-muted,#8b96a6)" }}>…thinking</div>}
        </div>

        {suggestions.length > 0 && messages.length === 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{ fontSize: 11, borderRadius: 12, border: "1px solid var(--strata-border,#2a2f3a)", background: "transparent", color: "var(--strata-fg,#e8eef5)", padding: "2px 8px", cursor: "pointer" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); void send(input); }} style={{ display: "flex", gap: 6 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            aria-label="Ask the map"
            disabled={busy}
            style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--strata-border,#2a2f3a)", background: "var(--strata-panel-bg,#1a1f27)", color: "var(--strata-fg,#e8eef5)", fontSize: 12 }}
          />
          <button type="submit" disabled={busy || !input.trim()} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "var(--strata-accent,#2b6cb0)", color: "#fff", cursor: "pointer", fontSize: 12 }}>
            Ask
          </button>
        </form>
      </div>
    </PanelShell>
  );
}

export default AskPanel;
