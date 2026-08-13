/**
 * @strata/core-map — on-map controls (§4.5, MIT).
 *
 * Thin React wrappers that mount MapLibre's native controls, plus Terra Draw-backed measure/sketch
 * controls and a renderer-driven Legend. Wired into `<StrataMap>` via its `controls` prop, and
 * exported here for bespoke control bars.
 */
export {
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
  ScaleControl,
} from "./NativeControls.js";
export type {
  ControlContext,
  ControlPosition,
  NativeControlProps,
  ScaleControlProps,
} from "./NativeControls.js";

export { MeasureControl, default as MeasureControlDefault } from "./MeasureControl.js";
export type { MeasureControlProps } from "./MeasureControl.js";

export { SketchControl, default as SketchControlDefault } from "./SketchControl.js";
export type { SketchControlProps } from "./SketchControl.js";

export { Legend, legendRows, legendWhere, rendererField, default as LegendDefault } from "./Legend.js";
export type { LegendProps } from "./Legend.js";

export { MapChrome, CHROME_ICONS, ensureChromeStyles, default as MapChromeDefault } from "./MapChrome.js";
export type { MapChromeProps, DrawerKind } from "./MapChrome.js";

export { StatusBar, default as StatusBarDefault } from "./StatusBar.js";
export type { StatusBarProps } from "./StatusBar.js";

export { TimeSlider, default as TimeSliderDefault } from "./TimeSlider.js";
export type { TimeSliderProps, TimeSliderLayer } from "./TimeSlider.js";

export { loadTerraDraw } from "./terraDraw.js";
export type { TerraDrawModules } from "./terraDraw.js";
