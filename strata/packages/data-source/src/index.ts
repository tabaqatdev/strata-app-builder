/**
 * @strata/data-source — the first-class DataSource layer (Phase 1 of the EB-parity plan).
 *
 * A `DataSource` owns its own schema, query, selection, filtered view, and statistics, so any widget bound
 * to the same source links to every other widget bound to it — with zero `connections`. The
 * `DataSourceManager` auto-wraps existing `layerId` / `fromWidget` bindings, so no recipe changes.
 */
export * from "./types.js";
export {
  matchesWhere,
  applyWhere,
  computeStatistics,
} from "./query.js";
export {
  FeatureLayerDataSource,
  OutputDataSource,
  StatisticsDataSource,
  GeometryDataSource,
  WebMapDataSource,
  recordsToRows,
  type FeatureLayerDataSourceOptions,
  type OutputDataSourceOptions,
  type StatisticsDataSourceOptions,
  type GeometryDataSourceOptions,
  type WebMapDataSourceOptions,
  type QueryFn,
} from "./sources.js";
export { DataSourceManager } from "./manager.js";
export {
  FileDataSource,
  RestDataSource,
  StreamDataSource,
  parseCsv,
  parseGeoJsonRows,
  type FileDataSourceOptions,
  type RestDataSourceOptions,
  type StreamDataSourceOptions,
  type FetchLike,
} from "./extraSources.js";
