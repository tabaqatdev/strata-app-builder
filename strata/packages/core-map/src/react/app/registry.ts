/**
 * @strata/core-map — widget registry (Part J.5, MIT).
 *
 * Maps a widget `type` (as used in an `AppLayout` `WidgetSpec`) to a React component. `<StrataApp>`
 * looks each widget up here (default registry merged with any per-app overrides) and renders it.
 * Apps extend or replace entries via `mergeRegistry`.
 */
import type React from "react";
import { StrataMap } from "../StrataMap.js";
import {
  Card,
  ListGallery,
  Text,
  Image,
  Embed,
  Video,
  PageNav,
  MeasureWidget,
  DrawWidget,
  CoordinatesWidget,
  SearchWidget,
  DirectionsWidget,
  PrintWidget,
  Button,
  Menu,
  Divider,
  KpiCard,
  RadialGauge,
  Sparkline,
  StackedBar,
  ThemeSwitch,
  LangSwitch,
  Swipe,
  Bookmarks,
  WidgetController,
  Placeholder,
  SharePanel,
  NearMe,
  AddDataWidget,
  WeightedOverlayPanel,
  ElevationProfile,
} from "../widgets/index.js";
import { Legend, StatusBar } from "../controls/index.js";
import {
  LayerPanel,
  BasemapPanel,
  AttributeTablePanel,
  ChartPanel,
  CartoPanel,
  DataActionMenu,
  FilterPanel,
  DateFilter,
  FeatureInfoPanel,
  QueryPanel,
  AnalysisPanel,
} from "../panels/index.js";

/** A registered widget component. Props are resolved dynamically from the layout spec. */
export type WidgetComponent = React.ComponentType<any>;

/** The built-in widget registry: every `type` string a `WidgetSpec` may reference. */
export const defaultWidgetRegistry: Record<string, WidgetComponent> = {
  map: StrataMap,
  card: Card,
  list: ListGallery,
  gallery: ListGallery,
  text: Text,
  image: Image,
  embed: Embed,
  video: Video,
  "page-nav": PageNav,
  measure: MeasureWidget,
  draw: DrawWidget,
  coordinates: CoordinatesWidget,
  search: SearchWidget,
  directions: DirectionsWidget,
  print: PrintWidget,
  button: Button,
  menu: Menu,
  divider: Divider,
  kpi: KpiCard,
  gauge: RadialGauge,
  sparkline: Sparkline,
  "stacked-bar": StackedBar,
  legend: Legend,
  "status-bar": StatusBar,
  "layer-panel": LayerPanel,
  basemap: BasemapPanel,
  table: AttributeTablePanel,
  chart: ChartPanel,
  carto: CartoPanel,
  "theme-switch": ThemeSwitch,
  "lang-switch": LangSwitch,
  "data-actions": DataActionMenu,
  filter: FilterPanel,
  "date-filter": DateFilter,
  query: QueryPanel,
  analysis: AnalysisPanel,
  "feature-info": FeatureInfoPanel,
  swipe: Swipe,
  bookmarks: Bookmarks,
  controller: WidgetController,
  share: SharePanel,
  "near-me": NearMe,
  "add-data": AddDataWidget,
  "weighted-overlay": WeightedOverlayPanel,
  elevation: ElevationProfile,
  placeholder: Placeholder,
};

/**
 * Produce a new registry that is the default registry with `overrides` added/replacing entries.
 * The default registry is never mutated.
 */
export function mergeRegistry(
  overrides?: Record<string, WidgetComponent>,
): Record<string, WidgetComponent> {
  return { ...defaultWidgetRegistry, ...(overrides ?? {}) };
}
