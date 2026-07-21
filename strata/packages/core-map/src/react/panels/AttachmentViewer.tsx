/**
 * AttachmentViewer — page through a layer's features and show their attachments (MIT).
 *
 * Prev/Next through a supplied list of `features`; for the current feature it calls
 * `@strata/feature-arcgis`'s `queryAttachments` (a dependency-light REST fetch that works on
 * BOTH a Strata Serve and an ESRI FeatureServer) and renders each attachment inline:
 *   - image/*  → <img>
 *   - video/*  → <video controls>
 *   - PDF / other → a download / open link
 *
 * A `token` is forwarded to `queryAttachments`, which appends it to each attachment url so a
 * secured layer's blobs load. The viewer owns no map state — it reports the current feature via
 * `onSelect(oid)` so the app can highlight it on the live map.
 *
 * Layout: renders inside a PanelShell, so it can be `mode="fixed"` (docked, default) or
 * `mode="floating"` (draggable overlay).
 */
import React, { useEffect, useState } from "react";
import type { OperationalLayer } from "@strata/schema";
import { queryAttachments, type FeatureAttachment } from "@strata/feature-arcgis";
import { PanelShell, type PanelMode } from "./PanelShell.js";

/** One feature to page through: its OBJECTID and an optional human title. */
export interface AttachmentFeature {
  oid: number;
  title?: string;
}

export interface AttachmentViewerProps {
  /** The layer whose features carry attachments. Its `url` is the FeatureServer layer endpoint. */
  layer: OperationalLayer;
  /** The features to page through (Prev/Next). */
  features: AttachmentFeature[];
  /** A raw token, forwarded to `queryAttachments` (secured layers). */
  token?: string;
  /** Layout mode passed through to PanelShell. Defaults to "fixed". */
  mode?: PanelMode;
  /** Convenience alias for `mode="floating"`. */
  floating?: boolean;
  /** Floating-mode placement / sizing (forwarded to PanelShell). */
  initialX?: number;
  initialY?: number;
  defaultWidth?: number;
  /** Called with the current feature's OID whenever it changes (highlight on the map). */
  onSelect?: (oid: number) => void;
  /** Close the panel (floating × button and "Remove" menu item). */
  onClose?: () => void;
  /** "Open" menu item. */
  onOpen?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; attachments: FeatureAttachment[] };

/** True for an image content type we can render inline via <img>. */
function isImage(contentType: string): boolean {
  return contentType.startsWith("image/");
}

/** True for a video content type we can render inline via <video>. */
function isVideo(contentType: string): boolean {
  return contentType.startsWith("video/");
}

export function AttachmentViewer(props: AttachmentViewerProps): React.ReactElement {
  const { layer, features, token, onSelect } = props;
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<LoadState>({ kind: "idle" });

  const count = features.length;
  // Keep the index in range if the feature list shrinks.
  const safeIndex = count === 0 ? 0 : Math.min(index, count - 1);
  const current: AttachmentFeature | undefined = features[safeIndex];

  // Fetch attachments for the current feature; report the selection to the app.
  useEffect(() => {
    if (!current || !layer.url) {
      setState(
        current && !layer.url
          ? { kind: "error", message: "This layer has no FeatureServer url." }
          : { kind: "idle" },
      );
      return;
    }
    const url = layer.url;
    const oid = current.oid;
    let cancelled = false;
    setState({ kind: "loading" });
    onSelect?.(oid);
    queryAttachments(url, oid, { token })
      .then((attachments) => {
        if (!cancelled) setState({ kind: "loaded", attachments });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ kind: "error", message: err instanceof Error ? err.message : String(err) });
        }
      });
    return () => {
      cancelled = true;
    };
    // `onSelect` is intentionally omitted: it should not re-trigger a fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer.url, current?.oid, token]);

  const go = (delta: number): void => {
    setIndex((i) => {
      const next = Math.min(Math.max(0, (count === 0 ? 0 : Math.min(i, count - 1)) + delta), Math.max(0, count - 1));
      return next;
    });
  };

  const featureTitle = current?.title ?? (current ? `Feature ${current.oid}` : "No features");

  return (
    <PanelShell
      title={`Attachments — ${layer.title}`}
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth ?? 360}
      onClose={props.onClose}
      onOpen={props.onOpen}
      className={props.className}
      style={{ ...panelStyle, ...props.style }}
    >
      <div style={navStyle}>
        <button
          type="button"
          style={navBtnStyle}
          disabled={safeIndex <= 0 || count === 0}
          onClick={() => go(-1)}
          aria-label="Previous feature"
        >
          ‹ Prev
        </button>
        <span style={featureTitleStyle} title={featureTitle}>
          {featureTitle}
        </span>
        <span style={counterStyle}>{count === 0 ? "0 / 0" : `${safeIndex + 1} / ${count}`}</span>
        <button
          type="button"
          style={navBtnStyle}
          disabled={safeIndex >= count - 1 || count === 0}
          onClick={() => go(1)}
          aria-label="Next feature"
        >
          Next ›
        </button>
      </div>

      <div style={bodyStyle}>
        {!layer.url && (
          <div style={{ ...msgStyle, color: "#c53030" }}>
            This layer has no FeatureServer <code>url</code>; attachments cannot be loaded.
          </div>
        )}
        {count === 0 && <div style={{ ...msgStyle, color: "#999" }}>No features to show.</div>}
        {state.kind === "loading" && <div style={msgStyle}>Loading attachments…</div>}
        {state.kind === "error" && (
          <div style={{ ...msgStyle, color: "#c53030" }}>{state.message}</div>
        )}
        {state.kind === "loaded" && state.attachments.length === 0 && (
          <div style={{ ...msgStyle, color: "#999" }}>No attachments for this feature.</div>
        )}
        {state.kind === "loaded" &&
          state.attachments.map((a) => (
            <figure key={a.id} style={figureStyle}>
              {isImage(a.contentType) ? (
                <img src={a.url} alt={a.name} style={mediaStyle} loading="lazy" />
              ) : isVideo(a.contentType) ? (
                <video src={a.url} controls style={mediaStyle} />
              ) : (
                <a href={a.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  {a.name} ({a.contentType})
                </a>
              )}
              <figcaption style={captionStyle} title={`${a.name} · ${a.contentType}`}>
                {a.name}
                {typeof a.size === "number" ? ` · ${Math.round(a.size / 1024)} KB` : ""}
              </figcaption>
            </figure>
          ))}
      </div>
    </PanelShell>
  );
}

export default AttachmentViewer;

// --- inline styles ---------------------------------------------------------
const panelStyle: React.CSSProperties = { maxHeight: 560 };
const navStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderBottom: "1px solid #eee",
};
const navBtnStyle: React.CSSProperties = {
  font: "12px system-ui, sans-serif",
  padding: "4px 8px",
  border: "1px solid #d5d5d5",
  borderRadius: 4,
  background: "#fafafa",
  cursor: "pointer",
};
const featureTitleStyle: React.CSSProperties = {
  flex: 1,
  fontWeight: 600,
  fontSize: 12,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  textAlign: "center",
};
const counterStyle: React.CSSProperties = { fontSize: 11, color: "#888" };
const bodyStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: "12px",
  overflow: "auto",
};
const msgStyle: React.CSSProperties = { font: "12px system-ui, sans-serif", padding: "4px 0" };
const figureStyle: React.CSSProperties = { margin: 0, display: "flex", flexDirection: "column", gap: 4 };
const mediaStyle: React.CSSProperties = {
  maxWidth: "100%",
  borderRadius: 6,
  border: "1px solid #eee",
  background: "#f7f7f7",
};
const linkStyle: React.CSSProperties = {
  font: "13px system-ui, sans-serif",
  color: "#1a73e8",
  wordBreak: "break-all",
};
const captionStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#888",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
