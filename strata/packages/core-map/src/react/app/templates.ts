/**
 * @strata/core-map — app-layout templates (Part J.5, MIT).
 *
 * Small factory functions that return a ready-to-render `AppLayout`. These are conveniences that
 * cover the common Experience-Builder / CARTO shapes; apps can always hand-author the tree.
 */
import type { AppLayout, LayoutNode, WidgetSpec } from "@strata/schema";

/** A KPI tile spec used by the dashboard template's KPI row. */
export interface KpiTile {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  status?: "ok" | "warn" | "critical";
}

/** A widget leaf helper. */
function widget(spec: WidgetSpec): LayoutNode {
  return { kind: "widget", widget: spec };
}

export interface DashboardTemplateOptions {
  /** Operational layer ids to show on the map (first is the KPI/table binding target). */
  mapLayerIds: string[];
  /** KPI tiles for the top row of the right column. */
  kpis: KpiTile[];
}

/**
 * A split dashboard: a map on the left and a right column of a KPI row, a chart and a table.
 * The primary layer (`mapLayerIds[0]`) binds the KPI/chart/table data sources.
 */
export function dashboardTemplate(options: DashboardTemplateOptions): AppLayout {
  const { mapLayerIds, kpis } = options;
  const primary = mapLayerIds[0];

  const kpiRow: LayoutNode = {
    kind: "grid",
    columns: Math.min(kpis.length || 1, 3),
    gap: 10,
    children: kpis.map((k) =>
      widget({
        type: "kpi",
        props: { label: k.label, value: k.value, unit: k.unit, delta: k.delta, status: k.status },
        dataSource: primary != null ? { layerId: primary } : undefined,
      }),
    ),
  };

  const rightColumn: LayoutNode = {
    kind: "column",
    gap: 12,
    style: { padding: 12, height: "100%", overflow: "auto" },
    children: [
      kpiRow,
      widget({ id: "chart", type: "chart", dataSource: primary != null ? { layerId: primary } : undefined }),
      widget({ id: "table", type: "table", dataSource: primary != null ? { layerId: primary } : undefined }),
    ],
  };

  const root: LayoutNode = {
    kind: "row",
    gap: 0,
    style: { height: "100%" },
    responsive: { small: { kind: "column" } },
    children: [
      {
        kind: "section",
        style: { flex: "1 1 0%", minWidth: 0, height: "100%", padding: 0 },
        children: [widget({ id: "map", type: "map", props: { layerIds: mapLayerIds } })],
      },
      {
        kind: "section",
        style: { flex: "0 0 380px", width: 380, height: "100%", padding: 0 },
        children: [rightColumn],
      },
    ],
  };

  // WIF: wire the dashboard alive on the first build — a chart category/range selection filters the map
  // and table in place; a table row zooms the map to it. Emitted by default so the app cross-filters
  // without the user asking. Requires a `store` in the app context (StrataApp threads the bus).
  const connections =
    primary != null
      ? [
          { from: "chart", trigger: "categorySelect", to: "map", action: "filter", options: { layerId: primary } },
          { from: "chart", trigger: "rangeSelect", to: "map", action: "filter", options: { layerId: primary } },
          { from: "chart", trigger: "categorySelect", to: "table", action: "filter", options: { layerId: primary } },
          { from: "table", trigger: "rowSelect", to: "map", action: "zoomTo", options: { layerId: primary } },
        ]
      : undefined;

  return {
    version: "1.0",
    pages: [{ id: "dashboard", title: "Dashboard", type: "fixed", root }],
    ...(connections ? { connections } : {}),
  };
}

export interface CardGalleryItem {
  title?: string;
  content?: string;
  image?: string;
  href?: string;
}

export interface CardGalleryTemplateOptions {
  items: CardGalleryItem[];
  /** Optional header text (default "Gallery"). */
  heading?: string;
  /** Gallery columns (default 3). */
  columns?: number;
}

/** A header text block above a `gallery` widget of cards. */
export function cardGalleryTemplate(options: CardGalleryTemplateOptions): AppLayout {
  const { items, heading = "Gallery", columns = 3 } = options;

  const root: LayoutNode = {
    kind: "column",
    gap: 16,
    style: { padding: 20 },
    children: [
      widget({ type: "text", props: { content: heading, as: "h2", style: { fontSize: 22, fontWeight: 700 } } }),
      widget({ type: "gallery", props: { items, columns } }),
    ],
  };

  return {
    version: "1.0",
    pages: [{ id: "gallery", title: heading, type: "scroll", root }],
  };
}

export interface StorySection {
  /** Operational layer ids for this section's map. */
  mapLayerIds: string[];
  /** Narrative text for the section. */
  text: string;
  title?: string;
}

export interface ScrollingStoryTemplateOptions {
  sections: StorySection[];
  title?: string;
}

/** A `type:"scroll"` page of stacked sections, each a map plus a text block. */
export function scrollingStoryTemplate(options: ScrollingStoryTemplateOptions): AppLayout {
  const { sections, title = "Story" } = options;

  const children: LayoutNode[] = sections.map((s) => ({
    kind: "section",
    gap: 12,
    style: { padding: 20 },
    children: [
      ...(s.title != null
        ? [widget({ type: "text", props: { content: s.title, as: "h3", style: { fontSize: 18, fontWeight: 700 } } })]
        : []),
      {
        kind: "section",
        style: { height: "60vh", padding: 0, borderRadius: 12, overflow: "hidden" },
        children: [widget({ type: "map", props: { layerIds: s.mapLayerIds } })],
      },
      widget({ type: "text", props: { content: s.text } }),
    ],
  }));

  const root: LayoutNode = { kind: "column", gap: 24, children };

  return {
    version: "1.0",
    pages: [{ id: "story", title, type: "scroll", root }],
  };
}
