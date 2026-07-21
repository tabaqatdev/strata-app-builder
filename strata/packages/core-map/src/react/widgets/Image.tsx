/**
 * @strata/core-map — Image (MIT).
 *
 * A themed image with an object-fit mode. Plain React.
 */
import React from "react";

export interface ImageProps {
  src: string;
  alt?: string;
  /** How the image fills its box (default `"cover"`). */
  fit?: "cover" | "contain";
  className?: string;
  style?: React.CSSProperties;
}

/** A themed image element. */
export function Image(props: ImageProps): React.ReactElement {
  const { src, alt = "", fit = "cover", className, style } = props;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", objectFit: fit, borderRadius: 8, ...style }}
    />
  );
}

export default Image;
