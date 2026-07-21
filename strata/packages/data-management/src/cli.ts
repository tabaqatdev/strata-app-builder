#!/usr/bin/env node
/**
 * strata-data — CLI for convert + publish. v0.1.0 implements `render` (turn a catalog record into the
 * datasource block + metadata bundle). `convert` and `publish` orchestration (calling the .claude/scripts)
 * land in the next release; the commands print the plan today.
 */
import { readFileSync } from "node:fs";
import type { CatalogRecord } from "@strata/schema";
import { renderPublishArtifacts } from "./publish/render.js";

const [cmd, ...args] = process.argv.slice(2);

function usage(): void {
  console.log(`strata-data <command>

  render <catalog-record.json>   Print the [[duckdb.datasources]] block + metadata bundle for a record.
  convert <src> <out.parquet>    (v0.2) Convert to EPSG:4326 GeoParquet via .claude/scripts/convert.sh.
  publish <record.json> <cfg>    (v0.2) Full publish (convert -> place -> block -> bundle -> restart).
`);
}

if (cmd === "render") {
  const rec = JSON.parse(readFileSync(args[0], "utf8")) as CatalogRecord;
  const a = renderPublishArtifacts(rec);
  console.log("# ---- append to server_config.toml ----\n" + a.datasourceBlock);
  console.log("# ---- metadata/<id>/metadata.toml ----\n" + a.metadataToml);
  if (a.drawingInfo) console.log("# ---- metadata/<id>/drawingInfo.json ----\n" + a.drawingInfo);
  if (a.popupInfo) console.log("# ---- metadata/<id>/popupInfo.json ----\n" + a.popupInfo);
  console.log("# FeatureServer URL: " + a.featureServerUrl);
} else if (cmd === "convert" || cmd === "publish") {
  console.log(`[v0.1.0] '${cmd}' orchestration is scaffolded — use the /publish command and .claude/scripts.`);
} else {
  usage();
}
