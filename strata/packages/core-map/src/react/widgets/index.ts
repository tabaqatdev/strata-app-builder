/**
 * @strata/core-map — KPI / infographic widgets (MIT).
 *
 * Dependency-light presentation widgets (plain React + inline SVG, no chart/UI libraries) for the
 * dashboard/panel surfaces around a `<StrataMap>`. All are themed via CSS custom properties with
 * sensible dark defaults (`--strata-panel-bg`, `--strata-fg`, `--strata-muted`, `--strata-border`,
 * `--strata-accent`, `--strata-ok`, `--strata-warn`, `--strata-critical`).
 */
export { KpiCard, default as KpiCardDefault } from "./KpiCard.js";
export type { KpiCardProps, KpiStatus } from "./KpiCard.js";

export { RadialGauge, default as RadialGaugeDefault } from "./RadialGauge.js";
export type { RadialGaugeProps, GaugeThresholds } from "./RadialGauge.js";

export { Sparkline, default as SparklineDefault } from "./Sparkline.js";
export type { SparklineProps } from "./Sparkline.js";

export { StackedBar, default as StackedBarDefault } from "./StackedBar.js";
export type { StackedBarProps, StackedBarSeries } from "./StackedBar.js";

export { StatRow, default as StatRowDefault } from "./StatRow.js";
export type { StatRowProps } from "./StatRow.js";

export { TimeSeries, default as TimeSeriesDefault } from "./TimeSeries.js";
export type { TimeSeriesProps, TimeSeriesPoint, TimeSeriesBand } from "./TimeSeries.js";

// Content / layout widgets (Part J.5) — CARTO / Experience-Builder-class building blocks.
export { Card, default as CardDefault } from "./Card.js";
export type { CardProps } from "./Card.js";

export { ListGallery, default as ListGalleryDefault } from "./ListGallery.js";
export type { ListGalleryProps } from "./ListGallery.js";

export { Text, default as TextDefault } from "./Text.js";
export type { TextProps } from "./Text.js";

export { Image, default as ImageDefault } from "./Image.js";
export type { ImageProps } from "./Image.js";

// Media widgets (Phase 7) — external embeds + video.
export { Embed, Video, default as EmbedDefault } from "./Media.js";
export type { EmbedProps, VideoProps } from "./Media.js";

// Multi-page navigation (Phase 7).
export { PageNav, default as PageNavDefault } from "./PageNav.js";
export type { PageNavProps } from "./PageNav.js";

// Map-tool widgets (Phase 7) — droppable tools that reach a `map` via the MapRegistry.
export { MeasureWidget, DrawWidget, CoordinatesWidget, SearchWidget, DirectionsWidget, PrintWidget } from "./MapTools.js";
export type {
  MeasureWidgetProps,
  DrawWidgetProps,
  CoordinatesWidgetProps,
  SearchWidgetProps,
  DirectionsWidgetProps,
  PrintWidgetProps,
  SearchLike,
  RouteLike,
} from "./MapTools.js";

export { Button, default as ButtonDefault } from "./Button.js";
export type { ButtonProps } from "./Button.js";

export { Menu, default as MenuDefault } from "./Menu.js";
export type { MenuProps, MenuItem } from "./Menu.js";

export { Divider, default as DividerDefault } from "./Divider.js";
export type { DividerProps } from "./Divider.js";

export { Container, default as ContainerDefault } from "./Container.js";
export type { ContainerProps } from "./Container.js";

export { ThemeSwitch, LangSwitch } from "./Switchers.js";
export type { ThemeSwitchProps, LangSwitchProps } from "./Switchers.js";

export { Swipe, Bookmarks, WidgetController, Placeholder } from "./DesignWidgets.js";
export type { SwipeProps, BookmarksProps, Bookmark, WidgetControllerProps, ControllerTool, PlaceholderProps } from "./DesignWidgets.js";

export { SharePanel, default as SharePanelDefault } from "./SharePanel.js";
export type { SharePanelProps } from "./SharePanel.js";

export { NearMe, AddDataWidget, WeightedOverlayPanel, ElevationProfile, terrariumToElevation } from "./AnalysisWidgets.js";
export type {
  NearMeProps,
  NearMeResult,
  AddDataWidgetProps,
  WeightedOverlayPanelProps,
  WeightedCriterion,
  ElevationProfileProps,
  ElevationSample,
} from "./AnalysisWidgets.js";
