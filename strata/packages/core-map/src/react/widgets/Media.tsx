/**
 * @strata/core-map — Embed & Video content widgets (Phase 7, MIT).
 *
 * `Embed` hosts external content in a sandboxed `<iframe>` (optionally at a fixed aspect ratio); `Video`
 * plays a media file with the native controls. Plain React, themed via CSS custom properties.
 */
import React from "react";

export interface EmbedProps {
  /** URL to embed. */
  src: string;
  /** Accessible title for the iframe. */
  title?: string;
  /** `allow` policy (e.g. "fullscreen; clipboard-write"). */
  allow?: string;
  /**
   * `sandbox` token list. Defaults to a safe set (`allow-scripts allow-same-origin allow-popups`); pass
   * `""` to fully sandbox, or an explicit string to widen. Pass `null` to omit the attribute entirely.
   */
  sandbox?: string | null;
  /** Fixed width/height aspect ratio (e.g. 16/9). When set, the iframe fills a responsive ratio box. */
  aspect?: number;
  style?: React.CSSProperties;
  className?: string;
}

/** External content in an iframe. */
export function Embed(props: EmbedProps): React.ReactElement {
  const { src, title, allow, aspect } = props;
  const sandbox = props.sandbox === undefined ? "allow-scripts allow-same-origin allow-popups" : props.sandbox;
  const sandboxAttr = sandbox === null ? undefined : sandbox;

  const frame = (
    <iframe
      src={src}
      title={title ?? "embedded content"}
      allow={allow}
      sandbox={sandboxAttr}
      style={
        aspect
          ? { position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }
          : { width: "100%", height: "100%", border: "none", ...props.style }
      }
    />
  );

  if (aspect) {
    return (
      <div
        className={props.className}
        style={{ position: "relative", width: "100%", paddingTop: `${100 / aspect}%`, ...props.style }}
      >
        {frame}
      </div>
    );
  }
  return frame;
}

export interface VideoProps {
  /** Media URL. */
  src: string;
  /** Poster image shown before playback. */
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
  /** Show native controls (default true). */
  controls?: boolean;
  muted?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/** A media video player. */
export function Video(props: VideoProps): React.ReactElement {
  return (
    <video
      className={props.className}
      src={props.src}
      poster={props.poster}
      autoPlay={props.autoplay}
      loop={props.loop}
      controls={props.controls ?? true}
      muted={props.muted ?? props.autoplay}
      style={{ width: "100%", borderRadius: "var(--strata-radius-md, 10px)", ...props.style }}
    />
  );
}

export default Embed;
