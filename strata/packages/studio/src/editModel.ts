/**
 * editModel — pure, immutable edit operations on an `AppLayout` (the studio's testable core).
 *
 * A **node path** is the array of child indices from a page's `root` (`[]` = the root node,
 * `[1,0]` = root.children[1].children[0]). Every function returns a NEW `AppLayout` — so mouse-edits,
 * hand-edits, and Claude-edits all round-trip through the same JSON. No React here.
 */
import type { AppLayout, AppPage, LayoutNode, ContainerNode, WidgetSpec } from "@strata/schema";

export type NodePath = number[];

/** Children of a node, or [] for a leaf/views node. */
function childrenOf(node: LayoutNode): LayoutNode[] {
  return "children" in node && Array.isArray((node as ContainerNode).children) ? (node as ContainerNode).children : [];
}

/** Get the node at `path` within a page's tree, or null if the path is invalid. */
export function getNode(page: AppPage, path: NodePath): LayoutNode | null {
  let node: LayoutNode | undefined = page.root;
  for (const i of path) {
    const kids: LayoutNode[] = node ? childrenOf(node) : [];
    node = kids[i];
    if (!node) return null;
  }
  return node ?? null;
}

/** Structural clone (JSON round-trip is fine — layouts are plain data). */
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Replace the node at `path` (in the given page) via `fn`, returning a new AppLayout. */
export function mapNodeAt(
  layout: AppLayout,
  pageId: string,
  path: NodePath,
  fn: (node: LayoutNode) => LayoutNode,
): AppLayout {
  const next = clone(layout);
  const page = next.pages.find((p) => p.id === pageId);
  if (!page) return next;
  if (path.length === 0) {
    page.root = fn(page.root);
    return next;
  }
  let parent: LayoutNode = page.root;
  for (let d = 0; d < path.length - 1; d++) {
    parent = childrenOf(parent)[path[d]];
    if (!parent) return next;
  }
  const kids = childrenOf(parent);
  const idx = path[path.length - 1];
  if (kids[idx]) kids[idx] = fn(kids[idx]);
  return next;
}

/** Patch a widget node's `WidgetSpec` (props/type/dataSource/id) at `path`. */
export function updateWidget(layout: AppLayout, pageId: string, path: NodePath, patch: Partial<WidgetSpec>): AppLayout {
  return mapNodeAt(layout, pageId, path, (node) => {
    if (node.kind !== "widget") return node;
    const widget = { ...node.widget, ...patch };
    if (patch.props) widget.props = { ...(node.widget.props ?? {}), ...patch.props };
    if (patch.dataSource) widget.dataSource = { ...(node.widget.dataSource ?? {}), ...patch.dataSource };
    return { ...node, widget };
  });
}

/** Patch a container node's layout props (gap/columns/mode/style) at `path`. */
export function updateContainer(layout: AppLayout, pageId: string, path: NodePath, patch: Partial<ContainerNode>): AppLayout {
  return mapNodeAt(layout, pageId, path, (node) => {
    if (!("children" in node)) return node;
    return { ...(node as ContainerNode), ...patch, kind: (node as ContainerNode).kind, children: (node as ContainerNode).children };
  });
}

/** Reorder a container's children (move `from` → `to`) at the container `path`. */
export function moveChild(layout: AppLayout, pageId: string, containerPath: NodePath, from: number, to: number): AppLayout {
  return mapNodeAt(layout, pageId, containerPath, (node) => {
    if (!("children" in node)) return node;
    const container = node as ContainerNode;
    const kids = [...container.children];
    if (from < 0 || from >= kids.length || to < 0 || to >= kids.length) return node;
    const [moved] = kids.splice(from, 1);
    kids.splice(to, 0, moved);
    return { ...container, children: kids };
  });
}

/** Remove the node at `path` from its parent (no-op for the root). */
export function removeNode(layout: AppLayout, pageId: string, path: NodePath): AppLayout {
  if (path.length === 0) return layout;
  const parentPath = path.slice(0, -1);
  const idx = path[path.length - 1];
  return mapNodeAt(layout, pageId, parentPath, (node) => {
    if (!("children" in node)) return node;
    const container = node as ContainerNode;
    return { ...container, children: container.children.filter((_, i) => i !== idx) };
  });
}

/** Set the whole theme token map. */
export function setTheme(layout: AppLayout, theme: Record<string, string>): AppLayout {
  return { ...layout, theme };
}

/** Find the path to the widget with the given `id` (searches every page's tree). Returns null if absent. */
export function findWidgetPath(page: AppPage, id: string): NodePath | null {
  const walk = (node: LayoutNode, path: NodePath): NodePath | null => {
    if (node.kind === "widget" && node.widget.id === id) return path;
    const kids = childrenOf(node);
    for (let i = 0; i < kids.length; i++) {
      const found = walk(kids[i], [...path, i]);
      if (found) return found;
    }
    return null;
  };
  return walk(page.root, []);
}

/** A flat outline of the page tree (for a layers/outline panel in the editor). */
export interface OutlineEntry {
  path: NodePath;
  kind: string;
  label: string;
  depth: number;
}

export function outline(page: AppPage): OutlineEntry[] {
  const out: OutlineEntry[] = [];
  const walk = (node: LayoutNode, path: NodePath, depth: number): void => {
    const label = node.kind === "widget" ? `${node.widget.type}${node.widget.id ? ` #${node.widget.id}` : ""}` : node.kind;
    out.push({ path, kind: node.kind, label, depth });
    childrenOf(node).forEach((c, i) => walk(c, [...path, i], depth + 1));
  };
  walk(page.root, [], 0);
  return out;
}
