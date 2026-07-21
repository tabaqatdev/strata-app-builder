/**
 * @strata/core-map — store-driven management panels (MIT).
 *
 * Four implemented panels plus a shared `PanelShell` wrapper and their prop types. Each
 * panel subscribes to the vanilla @strata/state store via React's `useSyncExternalStore`
 * and drives store actions for the state it owns, while delegating live-map-only actions
 * to optional callback props. Every panel renders inside `PanelShell`, which supplies the
 * card chrome and the fixed/floating layout + Open/Remove context menu.
 */
export { PanelShell, default as PanelShellDefault } from "./PanelShell.js";
export type { PanelShellProps, PanelMenuItem, PanelMode } from "./PanelShell.js";

export { LayerPanel, default as LayerPanelDefault } from "./LayerPanel.js";
export type { LayerPanelProps } from "./LayerPanel.js";

export { BasemapPanel, buildBaseMap, default as BasemapPanelDefault } from "./BasemapPanel.js";
export type { BasemapPanelProps, BasemapOption } from "./BasemapPanel.js";

export { AttributeTablePanel, toGeoJson, default as AttributeTablePanelDefault } from "./AttributeTablePanel.js";
export type { AttributeTablePanelProps } from "./AttributeTablePanel.js";

// Feature editing — needs a writable + authenticated backend (ESRI today; Strata editing planned).
export { EditPanel, default as EditPanelDefault } from "./EditPanel.js";
export type { EditPanelProps, EditSelection } from "./EditPanel.js";

// Attachment viewing — pages through features and shows image/video/PDF attachments.
export { AttachmentViewer, default as AttachmentViewerDefault } from "./AttachmentViewer.js";
export type { AttachmentViewerProps, AttachmentFeature } from "./AttachmentViewer.js";

export { ChartPanel, MiniChart, default as ChartPanelDefault } from "./ChartPanel.js";
export type { ChartPanelProps, ChartDatum } from "./ChartPanel.js";

export { EChart, default as EChartDefault } from "./EChart.js";
export type { EChartProps } from "./EChart.js";

// "Ask the map" seam — chat panel; app supplies onAsk (Claude/LLM/parser), actions go to the bus.
export { AskPanel, default as AskPanelDefault } from "./AskPanel.js";
export type { AskPanelProps, AskAction, AskResponse, AskMessage } from "./AskPanel.js";

// CARTO Builder-style combined layer + cross-filtering widgets panel.
export { CartoPanel, default as CartoPanelDefault } from "./CartoPanel.js";
export type {
  CartoPanelProps,
  CartoWidgetSpec,
  CartoWidgetKind,
  CartoOperation,
  CartoCategory,
} from "./CartoPanel.js";

// Data-action menu (WIF W3) — quick actions on a selection, dispatched through the ActionBus.
export { DataActionMenu, default as DataActionMenuDefault } from "./DataActionMenu.js";
export type { DataActionMenuProps } from "./DataActionMenu.js";

// Filter widgets — query builder + calendar date filter → definitionExpression (emit filterChange).
export { FilterPanel, buildWhere, buildWhereGroups, conditionSql, default as FilterPanelDefault } from "./FilterPanel.js";
export type { FilterPanelProps, FilterCondition, FilterField, FilterOperator, FilterGroup } from "./FilterPanel.js";
export { DateFilter, buildDateWhere, default as DateFilterDefault } from "./DateFilter.js";
export type { DateFilterProps } from "./DateFilter.js";

// Query builder — runs a where against a bound source and publishes the result rows as an output.
export { QueryPanel, default as QueryPanelDefault } from "./QueryPanel.js";
export type { QueryPanelProps, QueryResult } from "./QueryPanel.js";

// Analysis shell — a generic UI over an injected spatial-analysis registry (@strata/processing).
export { AnalysisPanel, default as AnalysisPanelDefault } from "./AnalysisPanel.js";
export type { AnalysisPanelProps } from "./AnalysisPanel.js";
export { buildToolArgs, TOOL_ARGS, resultRecords } from "./analysisArgs.js";
export type { AnalysisTool, ToolArgSpec, GenericInputs } from "./analysisArgs.js";

// Docked feature-detail panel — reuses the popup element model beside the map.
export { FeatureInfoPanel, default as FeatureInfoPanelDefault } from "./FeatureInfoPanel.js";
export type { FeatureInfoPanelProps, FeatureInfoValue } from "./FeatureInfoPanel.js";

export { SavedItemsPanel, default as SavedItemsPanelDefault } from "./SavedItemsPanel.js";
export type { SavedItemsPanelProps, SavedItem } from "./SavedItemsPanel.js";
