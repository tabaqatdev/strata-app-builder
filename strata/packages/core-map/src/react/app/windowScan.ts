/**
 * Pure layout scan (no React): find `window` nodes that should start CLOSED, so `<StrataApp>` can seed them
 * into the hidden set on first render (no open-then-close flash). A window starts closed unless `open:true`.
 */
import type { AppPage, LayoutNode } from "@strata/schema";

/** Collect the ids of `window` nodes whose `open` is not `true` (i.e. closed by default). */
export function collectClosedWindowIds(pages: AppPage[]): string[] {
  const out: string[] = [];
  const visit = (node: LayoutNode | undefined): void => {
    if (!node) return;
    if (node.kind === "widget") return;
    if (node.kind === "views") {
      for (const v of node.views) visit(v.content);
      return;
    }
    // container node
    if (node.kind === "window" && node.id && node.open !== true) out.push(node.id);
    for (const child of node.children) visit(child);
  };
  for (const page of pages) visit(page.root);
  return out;
}
