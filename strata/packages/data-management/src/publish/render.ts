/**
 * render — turn a CatalogRecord into the two publish artifacts the Strata Serve server reads:
 *   1. a `[[duckdb.datasources]]` TOML block (goes into server_config.toml)
 *   2. a metadata bundle: metadata.toml + drawingInfo.json + popupInfo.json
 *
 * Pure string builders — the CLI/scripts write them to disk and restart the server.
 */
import type { CatalogRecord, EsriField } from "@strata/schema";

function tomlStr(s: string): string {
  return `"${s.replace(/"/g, '\\"')}"`;
}

/** The [[duckdb.datasources]] block for the config TOML. */
export function renderDatasourceBlock(rec: CatalogRecord): string {
  const p = rec.publish;
  if (!p) throw new Error(`catalog record ${rec.id} has no publish{} block`);
  const service = p.serviceName;
  const folder = p.folder ?? "";
  const layerId = p.layerId ?? 0;
  const path = p.path ?? `<PATH_TO>/${rec.id}.parquet`;
  const metaPath = `<METADATA_ROOT>/${rec.id}`;
  const kind = rec.geometry === "table" ? "table" : "feature";
  const lines = [
    `# ${rec.title}`,
    `[[duckdb.datasources]]`,
    `id              = ${tomlStr(rec.id)}`,
    `service         = ${tomlStr(service)}`,
    folder ? `folder          = ${tomlStr(folder)}` : `# folder omitted (service at rest root)`,
    `layer_id        = ${layerId}`,
    `layer_name      = ${tomlStr(rec.title)}`,
    `path            = ${tomlStr(path)}`,
    `geometry_column = "geometry"`,
    `source_wkid     = 4326`,
    `layer_kind      = ${tomlStr(kind)}`,
    `layer_metadata_path = ${tomlStr(metaPath)}`,
  ];
  return lines.join("\n") + "\n";
}

/** metadata.toml: description, displayField, tile_fields, and [fields.<col>] aliases. */
export function renderMetadataToml(rec: CatalogRecord): string {
  const out: string[] = [];
  const desc = [rec.description, rec.description_ar].filter(Boolean).join(" — ");
  out.push(`description  = ${tomlStr(desc)}`);
  if (rec.attribution) out.push(`copyrightText = ${tomlStr(rec.attribution)}`);
  const displayField = rec.fields?.find((f) => /name|title/i.test(f.name))?.name;
  if (displayField) out.push(`displayField = ${tomlStr(displayField)}`);
  const tileFields = (rec.fields ?? []).slice(0, 6).map((f) => tomlStr(f.name)).join(", ");
  if (tileFields) out.push(`tile_fields = [${tileFields}]`);
  out.push("");
  for (const f of rec.fields ?? ([] as EsriField[])) {
    if (!f.alias) continue;
    out.push(`[fields.${f.name}]`);
    out.push(`alias = ${tomlStr(f.alias)}`);
  }
  return out.join("\n") + "\n";
}

/** drawingInfo.json (ESRI renderer). */
export function renderDrawingInfo(rec: CatalogRecord): string | null {
  if (!rec.drawingInfo?.renderer) return null;
  return JSON.stringify({ renderer: rec.drawingInfo.renderer, transparency: 0, labelingInfo: null }, null, 2);
}

/** popupInfo.json. */
export function renderPopupInfo(rec: CatalogRecord): string | null {
  if (!rec.popupInfo) return null;
  return JSON.stringify(rec.popupInfo, null, 2);
}

export interface PublishArtifacts {
  datasourceBlock: string;
  metadataToml: string;
  drawingInfo: string | null;
  popupInfo: string | null;
  featureServerUrl: string;
}

export function renderPublishArtifacts(rec: CatalogRecord): PublishArtifacts {
  const p = rec.publish!;
  const folder = p.folder ? `${p.folder}/` : "";
  return {
    datasourceBlock: renderDatasourceBlock(rec),
    metadataToml: renderMetadataToml(rec),
    drawingInfo: renderDrawingInfo(rec),
    popupInfo: renderPopupInfo(rec),
    featureServerUrl: `/rest/services/${folder}${p.serviceName}/FeatureServer/${p.layerId ?? 0}`,
  };
}
