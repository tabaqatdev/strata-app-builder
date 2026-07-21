/**
 * @strata/studio — a light visual editor for strata-app-builder `AppLayout`s.
 *
 * - {@link StrataStudio} — the React editor shell (preview + outline + inspector).
 * - The pure {@link editModel} operations round-trip the `AppLayout` JSON so mouse-edits, hand-edits, and
 *   Claude-edits all target the same file.
 */
export { StrataStudio, default as StrataStudioDefault } from "./StrataStudio.js";
export type { StrataStudioProps } from "./StrataStudio.js";
export * from "./editModel.js";
