/**
 * popups — MapLibre click → identify (queryRenderedFeatures → OID-enrich) → ESRI popupInfo
 * template → popup (MIT).
 *
 * The click runs the shared `identify()` helper (see identify.ts): it prefers the ACTIVE layer,
 * falls back to the topmost hit, then OID-enriches the feature (full attributes via `outFields=*`)
 * before rendering the layer's genuine ESRI `popupInfo`. A layer without `popupInfo` renders a
 * sensible default field table. Popups render on the canvas (default) or into a page slot.
 *
 * `renderPopup` covers the full `popupInfo` element model **synchronously**: title, Arcade
 * `expressionInfos` (via `@strata/arcade`), a `description` template or a `fieldInfos` table, and
 * `mediaInfos` (images + bar/line/pie/column charts of a feature's own fields). Attachments and related
 * records need a network round-trip, so they render as placeholders that {@link enrichPopupElements}
 * fills in asynchronously once the popup is in the DOM.
 *
 * When `getInteractionMode` is supplied, clicks only identify while the mode is `"identify"` — so a
 * measure/sketch interaction can own the canvas without spawning popups.
 */
import type { OperationalLayer } from "@strata/schema";
import { fetchMeta, loadFeatures, type DataClient } from "./arcgisSource.js";
import type { InteractionMode } from "@strata/state";
import { transpileArcade } from "@strata/arcade";
import { categorical } from "@strata/theme";
import { identify } from "./identify.js";

export interface PopupOptions {
  map: any; // maplibre-gl Map
  maplibregl: any;
  /** The operational layers, or a getter for the current set (store-driven maps change over time). */
  layers: OperationalLayer[] | (() => OperationalLayer[]);
  /** "canvas" (default, at feature) or a page-slot selector for surface="page". */
  target?: "canvas" | string;
  /** Read-path client used for OID enrichment (proxy/token). */
  client?: DataClient;
  /** Returns the current active layer id (the preferred identify target). */
  getActiveLayerId?: () => string | null;
  /** Returns the current interaction mode; clicks identify only while `"identify"`. */
  getInteractionMode?: () => InteractionMode;
  /** Notified with the enriched feature after a successful identify. */
  onFeatureSelect?: (feature: unknown) => void;
}

/**
 * The popup surface. Returned by {@link initPopups} — it is callable (the dispose function, so
 * `const off = initPopups(…); off()` still works) and carries the programmatic controls a
 * selection elsewhere needs: a table row adopting a record opens **that record's** popup, and
 * releasing the row closes it.
 */
export interface PopupSurface {
  (): void;
  /** Open the popup for one feature, by OID. Resolves false when the feature cannot be located. */
  showFeature: (layerId: string, oid: number | string) => Promise<boolean>;
  /** Close whatever popup is open. Safe to call when none is. */
  close: () => void;
}

export function initPopups(opts: PopupOptions): PopupSurface {
  const { map, maplibregl, target = "canvas", client = {} } = opts;
  const getLayers = typeof opts.layers === "function" ? opts.layers : () => opts.layers as OperationalLayer[];
  // ONE popup at a time. Without a tracked instance every click leaves its predecessor on the map,
  // and nothing can close a popup that was opened by a click somewhere else.
  let current: any = null;
  const closeCurrent = (): void => {
    try {
      current?.remove?.();
    } catch {
      /* already gone with the map */
    }
    current = null;
  };

  const onClick = (e: any) => {
    if (opts.getInteractionMode && opts.getInteractionMode() !== "identify") return;
    void identify({
      map,
      point: e.point,
      layers: getLayers(),
      client,
      activeLayerId: opts.getActiveLayerId?.() ?? null,
    }).then((res) => {
      if (!res) return;
      opts.onFeatureSelect?.({ layerId: res.layer.id, properties: res.properties, feature: res.feature });
      const html = renderPopup(res.properties, res.layer.popupInfo);
      let rootEl: HTMLElement | null = null;
      if (target === "canvas") {
        closeCurrent();
        const popup = new maplibregl.Popup({ maxWidth: "340px", closeOnClick: false })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
        current = popup;
        rootEl = popup.getElement?.() ?? null;
      } else {
        renderToSlot(target, html);
        rootEl = typeof document !== "undefined" ? (document.querySelector(target) as HTMLElement | null) : null;
      }
      // Fill in the async elements (attachments / related records) once the popup is mounted.
      if (rootEl && res.layer.popupInfo) {
        const objectId = objectIdOf(res.properties, res.feature);
        const layerUrl = res.layer.url || res.layer.source?.url;
        if (objectId != null && layerUrl) {
          void enrichPopupElements(rootEl, {
            objectId,
            layerUrl,
            popupInfo: res.layer.popupInfo,
            token: (client as any)?.token,
          });
        }
      }
    });
  };
  map.on("click", onClick);

  /** Open the popup for one record — the map half of "click a row, see that feature". */
  const showFeature = async (layerId: string, oid: number | string): Promise<boolean> => {
    const layer = getLayers().find((l) => l.id === layerId);
    if (!layer) return false;
    const found = await featureByOid(layer, oid, client, map);
    if (!found) return false;
    const html = renderPopup(found.properties, layer.popupInfo);
    if (target !== "canvas") {
      renderToSlot(target, html);
      return true;
    }
    closeCurrent();
    const popup = new maplibregl.Popup({ maxWidth: "340px", closeOnClick: false })
      .setLngLat(found.lngLat)
      .setHTML(html)
      .addTo(map);
    current = popup;
    const rootEl = popup.getElement?.() ?? null;
    if (rootEl && layer.popupInfo) {
      const objectId = objectIdOf(found.properties, found.feature);
      const layerUrl = layer.url || layer.source?.url;
      if (objectId != null && layerUrl) {
        void enrichPopupElements(rootEl, {
          objectId,
          layerUrl,
          popupInfo: layer.popupInfo,
          token: (client as any)?.token,
        });
      }
    }
    return true;
  };

  const surface = (() => {
    map.off("click", onClick);
    closeCurrent();
  }) as PopupSurface;
  surface.showFeature = showFeature;
  surface.close = closeCurrent;
  return surface;
}

/**
 * Locate one feature by OID and give back its properties and a point to anchor a popup at.
 *
 * Server-backed layers are re-queried on their **own** OID field — never an assumed `OBJECTID`,
 * because a service can report `FID` while carrying a different column literally named `OBJECTID`.
 * GeoJSON-backed layers are read from the loaded source instead, so an offline map still works.
 */
export async function featureByOid(
  layer: OperationalLayer,
  oid: number | string,
  client: DataClient,
  map: any,
): Promise<{ properties: Record<string, unknown>; lngLat: [number, number]; feature?: any } | null> {
  const url = layer.url || layer.source?.url;
  const serverBacked = layer.source?.kind === "arcgis-feature" || layer.source?.kind === "strata";

  if (serverBacked && url) {
    try {
      const meta = await fetchMeta(url, client).catch(() => null);
      const oidField = meta?.oidField || "OBJECTID";
      const n = Number(oid);
      const where = Number.isFinite(n) ? `${oidField} = ${n}` : `${oidField} = '${String(oid).replace(/'/g, "''")}'`;
      const fc = await loadFeatures(url, client, { where, outFields: "*", cap: 1 });
      const f = fc.features[0];
      if (f) {
        const at = centroidOf(f.geometry);
        if (at) return { properties: (f.properties ?? {}) as Record<string, unknown>, lngLat: at, feature: f };
      }
    } catch {
      /* fall through to the rendered source */
    }
  }

  // GeoJSON / already-loaded source.
  try {
    const data = map?.getSource?.(`lyr:${layer.id}`)?._data;
    const feats: any[] = data?.features ?? [];
    const hit = feats.find((f) => {
      const p = f.properties ?? {};
      return String(f.id ?? p.OBJECTID ?? p.objectid ?? p.FID ?? p.fid ?? "") === String(oid);
    });
    if (hit) {
      const at = centroidOf(hit.geometry);
      if (at) return { properties: (hit.properties ?? {}) as Record<string, unknown>, lngLat: at, feature: hit };
    }
  } catch {
    /* no source, no anchor */
  }
  return null;
}

/** Average of every coordinate — good enough to hang a popup on, for any geometry type. */
export function centroidOf(geometry: any): [number, number] | null {
  if (!geometry) return null;
  let n = 0;
  let x = 0;
  let y = 0;
  const walk = (c: any): void => {
    if (typeof c?.[0] === "number" && typeof c?.[1] === "number") {
      x += c[0];
      y += c[1];
      n += 1;
      return;
    }
    if (Array.isArray(c)) c.forEach(walk);
  };
  walk(geometry.coordinates);
  return n ? [x / n, y / n] : null;
}

/** Render popup HTML into a page-slot element (surface="page"). No-op if the slot is missing. */
function renderToSlot(selector: string, html: string): void {
  if (typeof document === "undefined") return;
  const el = document.querySelector(selector);
  if (el) (el as HTMLElement).innerHTML = html;
}

/** The OBJECTID for attachment/related queries (case-tolerant; falls back to the feature id). */
function objectIdOf(props: Record<string, unknown>, feature?: any): number | null {
  const v = propValue(props, "OBJECTID") ?? propValue(props, "FID") ?? feature?.id;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------------------------
// Synchronous rendering — the full popupInfo element model minus the async (attachment/related) bits.
// ---------------------------------------------------------------------------------------------

/**
 * Render an ESRI `popupInfo` to HTML. Supports title, Arcade `expressionInfos`, a `description` template
 * (or a `fieldInfos` table), and `mediaInfos` (images + charts). Attachments (`showAttachments`) and
 * related records (`relatedRecords`) render as placeholders {@link enrichPopupElements} fills in.
 * With no `popupInfo`, falls back to a full field table.
 */
export function renderPopup(props: Record<string, unknown>, popupInfo?: Record<string, any>): string {
  if (!popupInfo) return wrap(defaultTable(props));

  const exprValues = computeExpressions(popupInfo.expressionInfos, props);
  const lookup = makeLookup(props, exprValues);
  const fieldInfoByName = new Map<string, any>((popupInfo.fieldInfos || []).map((fi: any) => [fi.fieldName, fi]));

  const title = popupInfo.title ? `<strong>${escape(substitute(String(popupInfo.title), lookup, fieldInfoByName))}</strong>` : "";

  // description template (HTML allowed; substituted values are escaped) OR a fieldInfos table.
  let body: string;
  if (popupInfo.description) {
    body = `<div class="strata-popup-desc">${substitute(String(popupInfo.description), lookup, fieldInfoByName)}</div>`;
  } else {
    body = fieldTable(popupInfo, props, exprValues);
  }

  const media = (popupInfo.mediaInfos || []).map((m: any) => renderMedia(m, lookup, fieldInfoByName)).join("");

  const attachments = popupInfo.showAttachments
    ? `<div class="strata-popup-attachments" data-strata-attachments>Loading attachments…</div>`
    : "";
  const related = popupInfo.relatedRecords
    ? `<div class="strata-popup-related" data-strata-related>Loading related records…</div>`
    : "";

  return wrap(`${title}${body}${media}${attachments}${related}`);
}

function wrap(inner: string): string {
  return `<div class="strata-popup">${inner}</div>`;
}

/** The no-popupInfo fallback: every property as a labelled row. */
function defaultTable(props: Record<string, unknown>): string {
  const rows = Object.keys(props)
    .map((k) => row(k, formatValue(props[k])))
    .join("");
  return `<table>${rows}</table>`;
}

/** A `fieldInfos` table, including any `expression/<name>` rows. */
function fieldTable(popupInfo: Record<string, any>, props: Record<string, unknown>, exprValues: Record<string, unknown>): string {
  const infos: any[] = popupInfo.fieldInfos && popupInfo.fieldInfos.length
    ? popupInfo.fieldInfos.filter((fi: any) => fi.visible !== false)
    : Object.keys(props).map((k) => ({ fieldName: k, label: k }));
  const rows = infos
    .map((fi) => {
      const name: string = fi.fieldName;
      const value = name.startsWith("expression/") ? exprValues[name.slice("expression/".length)] : propValue(props, name);
      return row(fi.label || labelForExpression(popupInfo, name) || name, formatValue(value, fi));
    })
    .join("");
  return `<table>${rows}</table>`;
}

function row(label: string, value: string): string {
  return `<tr><th style="text-align:start;padding:2px 8px;opacity:.7">${escape(label)}</th><td style="padding:2px 8px">${escape(
    value,
  )}</td></tr>`;
}

/** The `title` of the expressionInfo named by an `expression/<name>` fieldName, if any. */
function labelForExpression(popupInfo: Record<string, any>, name: string): string | undefined {
  if (!name.startsWith("expression/")) return undefined;
  const id = name.slice("expression/".length);
  return (popupInfo.expressionInfos || []).find((e: any) => e.name === id)?.title;
}

/** Evaluate each Arcade `expressionInfos[]` entry against the feature → `{ name: value }`. */
function computeExpressions(expressionInfos: any[] | undefined, props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const info of expressionInfos || []) {
    if (!info?.name || !info?.expression) continue;
    try {
      out[info.name] = transpileArcade(String(info.expression)).evaluate(props);
    } catch {
      out[info.name] = "";
    }
  }
  return out;
}

/** A case-tolerant value lookup that also resolves `expression/<name>` tokens. */
function makeLookup(props: Record<string, unknown>, exprValues: Record<string, unknown>): (name: string) => unknown {
  return (name: string) =>
    name.startsWith("expression/") ? exprValues[name.slice("expression/".length)] : propValue(props, name);
}

/** Render one `mediaInfos` element: an image or a bar/line/pie/column chart of the feature's fields. */
function renderMedia(m: any, lookup: (n: string) => unknown, fieldInfoByName: Map<string, any>): string {
  const heading = m.title ? `<div class="strata-media-title" style="font-weight:600;margin:6px 0 2px">${escape(substitute(String(m.title), lookup, fieldInfoByName))}</div>` : "";
  const caption = m.caption ? `<div class="strata-media-caption" style="opacity:.7;font-size:11px">${escape(substitute(String(m.caption), lookup, fieldInfoByName))}</div>` : "";
  const type = String(m.type || "").toLowerCase();

  if (type === "image") {
    const src = substitute(String(m.value?.sourceURL || ""), lookup, fieldInfoByName);
    if (!src) return "";
    const img = `<img src="${escapeAttr(src)}" alt="" style="max-width:100%;border-radius:6px;display:block" loading="lazy" />`;
    const link = m.value?.linkURL ? substitute(String(m.value.linkURL), lookup, fieldInfoByName) : "";
    const wrapped = link ? `<a href="${escapeAttr(link)}" target="_blank" rel="noopener">${img}</a>` : img;
    return `<div class="strata-media">${heading}${wrapped}${caption}</div>`;
  }

  if (type === "barchart" || type === "linechart" || type === "piechart" || type === "columnchart") {
    const fields: string[] = m.value?.fields || [];
    const labels = fields.map((f) => String(fieldInfoByName.get(f)?.label ?? f));
    const values = fields.map((f) => Number(lookup(f)) || 0);
    const kind = type === "linechart" ? "line" : type === "piechart" ? "pie" : "bar";
    return `<div class="strata-media">${heading}${chartSvg(kind, labels, values)}${caption}</div>`;
  }

  return "";
}

/**
 * A tiny inline-SVG chart (bar / line / pie) of a single feature's field values, colored from the
 * `@strata/theme` categorical palette. Deliberately dependency-free — popups are HTML strings, not React.
 */
export function chartSvg(kind: "bar" | "line" | "pie", labels: string[], values: number[]): string {
  const W = 300;
  const H = 120;
  const colors = categorical(Math.max(values.length, 1));
  const max = Math.max(1, ...values.map((v) => Math.abs(v)));

  if (kind === "pie") {
    const total = values.reduce((a, b) => a + Math.max(0, b), 0) || 1;
    const cx = 60;
    const cy = H / 2;
    const r = 48;
    let angle = -Math.PI / 2;
    const slices = values
      .map((v, i) => {
        const frac = Math.max(0, v) / total;
        const a2 = angle + frac * Math.PI * 2;
        const large = frac > 0.5 ? 1 : 0;
        const x1 = cx + r * Math.cos(angle);
        const y1 = cy + r * Math.sin(angle);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);
        angle = a2;
        if (frac <= 0) return "";
        return `<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${colors[i]}"/>`;
      })
      .join("");
    const legend = labels
      .map((l, i) => `<div style="display:flex;align-items:center;gap:4px;font-size:11px"><span style="width:9px;height:9px;background:${colors[i]};border-radius:2px;display:inline-block"></span>${escape(l)}</div>`)
      .join("");
    return `<div style="display:flex;gap:8px;align-items:center"><svg viewBox="0 0 130 ${H}" width="130" height="${H}" role="img">${slices}</svg><div>${legend}</div></div>`;
  }

  const pad = 8;
  const bw = (W - pad * 2) / Math.max(values.length, 1);
  if (kind === "line") {
    const pts = values
      .map((v, i) => {
        const x = pad + bw * (i + 0.5);
        const y = H - pad - (Math.abs(v) / max) * (H - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    const dots = values
      .map((v, i) => {
        const x = pad + bw * (i + 0.5);
        const y = H - pad - (Math.abs(v) / max) * (H - pad * 2);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="${colors[0]}"/>`;
      })
      .join("");
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img"><polyline points="${pts}" fill="none" stroke="${colors[0]}" stroke-width="2"/>${dots}</svg>`;
  }

  // bar / column
  const bars = values
    .map((v, i) => {
      const h = (Math.abs(v) / max) * (H - pad * 2);
      const x = pad + bw * i + bw * 0.15;
      const y = H - pad - h;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${h.toFixed(1)}" fill="${colors[i]}" rx="2"><title>${escape(labels[i] ?? "")}: ${v}</title></rect>`;
    })
    .join("");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img">${bars}</svg>`;
}

// ---------------------------------------------------------------------------------------------
// Asynchronous enrichment — attachments + related records.
// ---------------------------------------------------------------------------------------------

export interface EnrichContext {
  objectId: number;
  layerUrl: string;
  popupInfo: Record<string, any>;
  token?: string;
}

/**
 * Fill in the async popup elements once the popup is in the DOM: a thumbnail strip of attachments and a
 * nested table of related records. Queries are lazy (only run when the element is present) and read-only,
 * so they work on both Strata Serve and ESRI backends. Errors degrade to a small notice, never throw.
 */
export async function enrichPopupElements(root: HTMLElement, ctx: EnrichContext): Promise<void> {
  const attachEl = root.querySelector("[data-strata-attachments]") as HTMLElement | null;
  const relatedEl = root.querySelector("[data-strata-related]") as HTMLElement | null;
  const fa = attachEl || relatedEl ? await loadFeatureArcgis() : null;
  if (!fa) return;

  if (attachEl) {
    try {
      const items = await fa.queryAttachments(ctx.layerUrl, ctx.objectId, { token: ctx.token });
      attachEl.innerHTML = renderAttachments(items);
    } catch {
      attachEl.innerHTML = `<div style="opacity:.6;font-size:11px">No attachments.</div>`;
    }
  }

  if (relatedEl) {
    const rc = ctx.popupInfo.relatedRecords || {};
    try {
      const result = await fa.queryRelatedRecords({
        url: ctx.layerUrl,
        objectIds: [ctx.objectId],
        relationshipId: Number(rc.relationshipId ?? 0),
        outFields: rc.fields,
        token: ctx.token,
      });
      relatedEl.innerHTML = renderRelated(result, rc.title);
    } catch {
      relatedEl.innerHTML = `<div style="opacity:.6;font-size:11px">No related records.</div>`;
    }
  }
}

/** Load `@strata/feature-arcgis` lazily so the popup renderer has no hard dependency at import time. */
async function loadFeatureArcgis(): Promise<any | null> {
  try {
    return await import("@strata/feature-arcgis");
  } catch {
    return null;
  }
}

/** A thumbnail strip for image attachments; a link list for the rest. */
export function renderAttachments(items: Array<{ id: number; name: string; contentType: string; url: string }>): string {
  if (!items.length) return `<div style="opacity:.6;font-size:11px">No attachments.</div>`;
  const cells = items
    .map((a) => {
      const isImage = /^image\//i.test(a.contentType);
      const inner = isImage
        ? `<img src="${escapeAttr(a.url)}" alt="${escapeAttr(a.name)}" style="width:56px;height:56px;object-fit:cover;border-radius:6px" loading="lazy" />`
        : `<span style="font-size:11px">${escape(a.name)}</span>`;
      return `<a href="${escapeAttr(a.url)}" target="_blank" rel="noopener" style="display:inline-block;margin:2px">${inner}</a>`;
    })
    .join("");
  return `<div class="strata-attachments" style="display:flex;flex-wrap:wrap;gap:2px;margin-top:6px">${cells}</div>`;
}

/** A nested mini-table of related records (first related feature group). */
export function renderRelated(result: any, title?: string): string {
  // arcgis-rest returns { relatedRecordGroups: [{ relatedRecords: [{ attributes }] }] };
  // GeoJSON-shaped clients may return { features: [{ properties }] }. Support both.
  const group = result?.relatedRecordGroups?.[0];
  const records: Array<Record<string, unknown>> = group
    ? group.relatedRecords.map((r: any) => r.attributes)
    : (result?.features || []).map((f: any) => f.properties);
  if (!records.length) return `<div style="opacity:.6;font-size:11px">No related records.</div>`;

  const cols = Object.keys(records[0]);
  const head = `<tr>${cols.map((c) => `<th style="text-align:start;padding:2px 6px;opacity:.7">${escape(c)}</th>`).join("")}</tr>`;
  const body = records
    .slice(0, 25)
    .map((rec) => `<tr>${cols.map((c) => `<td style="padding:2px 6px">${escape(formatValue(rec[c]))}</td>`).join("")}</tr>`)
    .join("");
  const heading = title ? `<div style="font-weight:600;margin:6px 0 2px">${escape(title)}</div>` : "";
  return `${heading}<table style="font-size:11px;border-collapse:collapse">${head}${body}</table>`;
}

// ---------------------------------------------------------------------------------------------
// Shared helpers.
// ---------------------------------------------------------------------------------------------

/**
 * Resolve a field value from a feature's properties, tolerant of case. ESRI `popupInfo` field names
 * are the service's canonical (often mixed/upper) case, but an ArcGIS **MapServer** lowercases every
 * field name in its `f=geojson` output (`NAME` → `name`, `HAZ_CLASS` → `haz_class`). A case-sensitive
 * `props[fieldName]` then yields blank popups. Match the exact key first, else fall back to a
 * case-insensitive scan.
 */
function propValue(props: Record<string, unknown>, name: string): unknown {
  if (name in props) return props[name];
  const lower = name.toLowerCase();
  for (const k in props) if (k.toLowerCase() === lower) return props[k];
  return undefined;
}

/**
 * Substitute `{FIELD}` / `{expression/NAME}` tokens via `lookup`, honoring per-field number formats.
 * Values are escaped so a description template's own HTML is preserved while data stays inert.
 */
function substitute(s: string, lookup: (name: string) => unknown, fieldInfoByName: Map<string, any>): string {
  return s.replace(/\{([\w/]+)\}/g, (_, f: string) => escape(formatValue(lookup(f), fieldInfoByName.get(f))));
}

/**
 * Format a field value with an ESRI `fieldInfo.format` (digitSeparator, places, dateFormat).
 * Unknown/absent formats fall through to a plain string.
 */
function formatValue(value: unknown, fieldInfo?: any): string {
  if (value == null) return "";
  const fmt = fieldInfo?.format;
  if (fmt && typeof value === "number") {
    const places = typeof fmt.places === "number" ? fmt.places : undefined;
    const useGrouping = fmt.digitSeparator === true;
    try {
      return value.toLocaleString(undefined, {
        useGrouping,
        minimumFractionDigits: places,
        maximumFractionDigits: places,
      });
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function escape(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

/** Attribute-context escaping (adds single-quote). */
function escapeAttr(s: string): string {
  return escape(s).replace(/'/g, "&#39;");
}
