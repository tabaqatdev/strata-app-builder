// @strata/core-map — the React + MapLibre map component + presentation layer.

// Engine (framework-agnostic)
export { compile, compileLabels, scaleToZoom } from "./engine/styleCompiler.js";
export type { CompileResult, StylePatches } from "./engine/styleCompiler.js";
export { fetchMeta, loadFeatures, queryExtent, queryCount } from "./engine/arcgisSource.js";
export type { DataClient, LayerMeta } from "./engine/arcgisSource.js";
// Optional advanced data path (statistics / related / edits) via @strata/feature-arcgis (Strata + Esri).
export {
  layerStatistics,
  layerRelatedRecords,
  layerAdvancedQuery,
  layerApplyEdits,
} from "./engine/advancedQuery.js";
export type { StatisticDefinition } from "./engine/advancedQuery.js";
export { MapController } from "./engine/MapController.js";
export { LayerRegistry } from "./engine/layers.js";
export {
  buildImageServerTileUrl,
  imageServerSourceDef,
  cogSourceDef,
  registerCogProtocol,
  vectorTileSourceDef,
  pmtilesSourceDef,
  registerPmtilesProtocol,
  type ImageServerOptions,
} from "./engine/raster.js";
export {
  applyBaseMap,
  OPEN_BASEMAPS,
  VECTOR_BASEMAPS,
  RASTER_BASEMAPS,
  basemapUrl,
  defaultBaseMap,
  defaultVectorBaseMap,
  basemapForTheme,
  basemapForThemeFrom,
  baseMapFromPreset,
  prepareVectorBasemap,
  type BasemapPreset,
} from "./engine/basemaps.js";
export {
  initPopups,
  ensurePopupStyles,
  renderPopup,
  enrichPopupElements,
  renderAttachments,
  renderRelated,
  chartSvg,
  type EnrichContext,
} from "./engine/popups.js";
// Expression-not-snapshot re-run helpers (saved charts/tables re-materialize live).
export {
  materializeChart,
  materializeTable,
  aggregate,
  isLiveChart,
  isLiveTable,
  type MaterializedDatum,
} from "./engine/materialize.js";
export { identify, enrichByOid, subLayerIdsFor } from "./engine/identify.js";
export type { IdentifyOptions, IdentifyResult } from "./engine/identify.js";
export { bindStoreToMap } from "./engine/storeBinding.js";
export type { StoreBinding, StoreBindingOptions } from "./engine/storeBinding.js";

// React
export { StrataMap, default as default } from "./react/StrataMap.js";
export type { StrataMapProps, StrataMapControls, StrataMapHandle } from "./react/StrataMap.js";

// The one live subscription to "what layers are on the map" — shared by Legend / MapChrome / LayerPanel.
export { useStoreLayers } from "./react/useStoreLayers.js";

// Internationalization (React binding for @strata/i18n) — I18nProvider + useI18n
export { I18nProvider, useI18n, useOptionalI18n } from "./react/i18n.js";
export type { I18nProviderProps, I18nContextValue } from "./react/i18n.js";

// Error boundary — one broken widget/panel shouldn't take down the app
export { ErrorBoundary } from "./react/ErrorBoundary.js";
export type { ErrorBoundaryProps } from "./react/ErrorBoundary.js";

// On-map controls (§4.5) — implemented
export * from "./react/controls/index.js";

// Store-driven management panels (§4.7) — implemented
export * from "./react/panels/index.js";

// Layout presets (§4.2) — implemented (FullPageMap / MapInScroll / SplitDashboard / MultiMap)
export * from "./layout/index.js";

// KPI / infographic widgets — dependency-light (plain React + inline SVG)
export * from "./react/widgets/index.js";

// Declarative app layout engine (Part J.5) — <StrataApp> + registry + templates
export * from "./react/app/index.js";
