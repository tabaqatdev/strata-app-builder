/**
 * @strata/core-map — ListGallery (MIT).
 *
 * Repeats a card/template over an array of items to build a gallery (multi-column grid) or a list
 * (single column). Dependency-light: plain React. The item template is supplied by `renderItem`.
 */
import React from "react";

export interface ListGalleryProps<T> {
  /** The data to repeat over. */
  items: T[];
  /** Template rendered per item. */
  renderItem: (item: T, i: number) => React.ReactNode;
  /** Number of columns (default 1 → a vertical list). */
  columns?: number;
  /** Gap between items (px, default 12). */
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** A repeating gallery/list of items rendered from a template. */
export function ListGallery<T>(props: ListGalleryProps<T>): React.ReactElement {
  const { items, renderItem, columns = 1, gap = 12, className, style } = props;
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`,
        gap,
        ...style,
      }}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>{renderItem(item, i)}</React.Fragment>
      ))}
    </div>
  );
}

export default ListGallery;
