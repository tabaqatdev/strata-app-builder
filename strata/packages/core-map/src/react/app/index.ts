/**
 * @strata/core-map — declarative app layout engine (Part J.5, MIT).
 *
 * `<StrataApp>` renders an `AppLayout` (from @strata/schema) — a page/container/widget tree — via a
 * widget registry that maps `type` strings to components. Ships templates for the common shapes.
 */
export { StrataApp, useBreakpoint, default as StrataAppDefault } from "./StrataApp.js";
export type { StrataAppProps, Breakpoint } from "./StrataApp.js";

export { defaultWidgetRegistry, mergeRegistry } from "./registry.js";
export type { WidgetComponent } from "./registry.js";

export { StrataAppProvider, useStrataAppEnv, useOutputData } from "./interactivity.js";
export type { StrataAppEnv } from "./interactivity.js";

export { dashboardTemplate, cardGalleryTemplate, scrollingStoryTemplate } from "./templates.js";
export type {
  KpiTile,
  DashboardTemplateOptions,
  CardGalleryItem,
  CardGalleryTemplateOptions,
  StorySection,
  ScrollingStoryTemplateOptions,
} from "./templates.js";
