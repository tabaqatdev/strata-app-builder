import { describe, it, expect } from "vitest";
import {
  renderDatasourceBlock,
  renderMetadataToml,
  renderDrawingInfo,
  renderPopupInfo,
  renderPublishArtifacts,
} from "../src/publish/render.js";
import type { CatalogRecord } from "@strata/schema";

function record(overrides: Partial<CatalogRecord> = {}): CatalogRecord {
  return {
    id: "hospitals",
    title: "Hospitals",
    description: "Health facilities",
    geometry: "point",
    source: { kind: "geojson" },
    fields: [
      { name: "NAME", type: "esriFieldTypeString", alias: "Facility Name" },
      { name: "BEDS", type: "esriFieldTypeInteger", alias: "Bed Count" },
    ],
    publish: {
      target: "strata",
      serviceName: "Hospitals",
      folder: "health",
      layerId: 0,
      format: "geoparquet",
      path: "/data/hospitals.parquet",
    },
    ...overrides,
  };
}

describe("renderDatasourceBlock", () => {
  it("renders a [[duckdb.datasources]] TOML block with core keys", () => {
    const toml = renderDatasourceBlock(record());
    expect(toml).toContain("[[duckdb.datasources]]");
    expect(toml).toContain('id              = "hospitals"');
    expect(toml).toContain('service         = "Hospitals"');
    expect(toml).toContain('folder          = "health"');
    expect(toml).toContain("layer_id        = 0");
    expect(toml).toContain('path            = "/data/hospitals.parquet"');
    expect(toml).toContain('geometry_column = "geometry"');
    expect(toml).toContain("source_wkid     = 4326");
    expect(toml).toContain('layer_kind      = "feature"');
  });

  it("marks the folder as omitted when at the rest root", () => {
    const toml = renderDatasourceBlock(record({ publish: { target: "strata", serviceName: "S", format: "geoparquet", layerId: 0, path: "/p.parquet" } }));
    expect(toml).toContain("# folder omitted");
  });

  it("uses layer_kind = table for table records", () => {
    const toml = renderDatasourceBlock(record({ geometry: "table" }));
    expect(toml).toContain('layer_kind      = "table"');
  });

  it("throws when there is no publish block", () => {
    const rec = record();
    delete rec.publish;
    expect(() => renderDatasourceBlock(rec)).toThrow(/no publish/);
  });
});

describe("renderMetadataToml", () => {
  it("includes description, detects a displayField, caps tile_fields, and writes aliases", () => {
    const toml = renderMetadataToml(record());
    expect(toml).toContain('description  = "Health facilities"');
    expect(toml).toContain('displayField = "NAME"');
    expect(toml).toContain('tile_fields = ["NAME", "BEDS"]');
    expect(toml).toContain("[fields.NAME]");
    expect(toml).toContain('alias = "Facility Name"');
  });

  it("joins bilingual descriptions with an em dash", () => {
    const toml = renderMetadataToml(record({ description_ar: "المرافق الصحية" }));
    expect(toml).toContain("Health facilities — المرافق الصحية");
  });

  it("caps tile_fields at six columns", () => {
    const fields = Array.from({ length: 10 }, (_, i) => ({ name: `F${i}`, type: "esriFieldTypeString" }));
    const toml = renderMetadataToml(record({ fields }));
    const line = toml.split("\n").find((l) => l.startsWith("tile_fields"))!;
    expect(line.match(/F\d/g)).toHaveLength(6);
  });
});

describe("renderDrawingInfo / renderPopupInfo", () => {
  it("returns null when there is no renderer / popup", () => {
    expect(renderDrawingInfo(record())).toBeNull();
    expect(renderPopupInfo(record())).toBeNull();
  });

  it("serializes a renderer under { renderer } when present", () => {
    const rec = record({ drawingInfo: { renderer: { type: "simple", symbol: { type: "esriSMS" } } } });
    const out = JSON.parse(renderDrawingInfo(rec)!);
    expect(out.renderer.type).toBe("simple");
    expect(out.transparency).toBe(0);
  });

  it("serializes popupInfo verbatim", () => {
    const rec = record({ popupInfo: { title: "{NAME}" } });
    expect(JSON.parse(renderPopupInfo(rec)!)).toEqual({ title: "{NAME}" });
  });
});

describe("renderPublishArtifacts", () => {
  it("builds the FeatureServer URL from folder/service/layerId", () => {
    const art = renderPublishArtifacts(record());
    expect(art.featureServerUrl).toBe("/rest/services/health/Hospitals/FeatureServer/0");
    expect(art.datasourceBlock).toContain("[[duckdb.datasources]]");
    expect(art.metadataToml).toContain("description");
  });

  it("omits the folder segment when there is none", () => {
    const art = renderPublishArtifacts(
      record({ publish: { target: "strata", serviceName: "Hospitals", format: "geoparquet", layerId: 2, path: "/p.parquet" } }),
    );
    expect(art.featureServerUrl).toBe("/rest/services/Hospitals/FeatureServer/2");
  });
});
