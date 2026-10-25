/**
 * UploadWidget — the customer's own data, from their machine into the app (MIT).
 *
 * `add-data` takes a service URL. This takes a **file**, because the buyer who has the portfolio, the
 * pipeline or the shortlist keeps it in a spreadsheet, not on a FeatureServer. The widget is the visible
 * half of `@strata/data-source`'s ingest module and adds nothing to its logic:
 *
 * 1. **Read** the dropped or chosen file (CSV, GeoJSON or JSON).
 * 2. **Scrub identity immediately** — owner and person columns are dropped before the preview renders,
 *    and the widget **names the columns it dropped** on screen. Nothing is published until this has run.
 * 3. **Show the guessed mapping and let the reader fix it** — identifier, label, coordinates, address.
 *    The mapping is surfaced through `onMappingChange` so an app can persist it in its layout and bind
 *    the same spreadsheet again next session without re-answering.
 * 4. **Place the rows** — from coordinates, or through an injected `geocode` for rows that carry only an
 *    address. Rows that can be placed neither way are kept, counted and shown, never silently dropped.
 * 5. **Publish** the result as an output data source, so `table`, `chart`, `map` and `feature-info`
 *    consume it through `dataSource.fromWidget` with no bespoke wiring.
 *
 * The file never leaves the browser. There is no upload endpoint: "upload" here means *into the page*.
 */
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  readIngestFile,
  inferMapping,
  stripIdentityFields,
  summarise,
  rowsToFeatureCollection,
  geocodeRows,
  type ColumnMapping,
  type GeocodeFn,
  type IngestSummary,
} from "@strata/data-source";

type Row = Record<string, unknown>;

/** The roles offered in the mapping editor, in the order they are shown. */
const ROLES: Array<{ key: keyof ColumnMapping; label: string; hint: string }> = [
  { key: "label", label: "Name", hint: "What the reader sees in a list or a popup title" },
  { key: "id", label: "Identifier", hint: "A stable reference; the row number is used when unset" },
  { key: "lat", label: "Latitude", hint: "Decimal degrees" },
  { key: "lon", label: "Longitude", hint: "Decimal degrees" },
  { key: "address", label: "Address", hint: "Used only for rows with no coordinates" },
];

export interface UploadWidgetProps {
  /** This widget's id — the output key other widgets bind to. Injected as `id`/`widgetId`. */
  widgetId?: string;
  id?: string;
  /** Output registry — the parsed rows are published here (injected by `<StrataApp>`). */
  outputs?: { publish: (p: { widgetId: string; records: unknown; layerId?: string }) => void };
  /**
   * A mapping saved from a previous session. When it still fits the file's headers it is used as-is and
   * the reader is not asked again.
   */
  mapping?: ColumnMapping;
  /** Called whenever the mapping changes, so the app can persist it in its layout. */
  onMappingChange?: (mapping: ColumnMapping) => void;
  /** Called with the placed features once a file is loaded. */
  onLoad?: (fc: ReturnType<typeof rowsToFeatureCollection>, meta: { rows: Row[]; dropped: string[] }) => void;
  /**
   * Address geocoder. Omit it and the address row simply reports what it could not place — the widget
   * never reaches the network on its own.
   */
  geocode?: GeocodeFn;
  /** Cap on geocoding lookups in one pass. Defaults to 250, which is a public geocoder's patience. */
  geocodeLimit?: number;
  /** Milliseconds between lookups. Defaults to 1000, the public Nominatim policy. */
  geocodeDelayMs?: number;
  /** Columns to keep despite matching the identity deny-list. A deliberate, named act. */
  allowIdentityFields?: string[];
  /** Extra column names to drop as identity. */
  denyIdentityFields?: string[];
  /** Rows shown in the preview table. Defaults to 5. */
  previewRows?: number;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

interface LoadedFile {
  name: string;
  rows: Row[];
  headers: string[];
  dropped: string[];
  format: string;
}

export function UploadWidget(props: UploadWidgetProps): React.ReactElement {
  const widgetId = props.widgetId ?? props.id ?? "upload";
  const previewRows = props.previewRows ?? 5;

  const [file, setFile] = useState<LoadedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>(props.mapping ?? {});
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [geoNote, setGeoNote] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const summary: IngestSummary | null = useMemo(
    () => (file ? summarise(file.rows, mapping) : null),
    [file, mapping],
  );

  const publish = useCallback(
    (rows: Row[], m: ColumnMapping, dropped: string[]) => {
      const fc = rowsToFeatureCollection(rows, m);
      props.outputs?.publish({ widgetId, records: fc });
      props.onLoad?.(fc, { rows, dropped });
    },
    [props, widgetId],
  );

  const accept = useCallback(
    (name: string, text: string) => {
      setError(null);
      setGeoNote(null);
      setProgress(null);
      try {
        const read = readIngestFile(text, name);
        if (read.rows.length === 0) {
          setError("That file produced no rows. A CSV needs a header line and at least one row.");
          return;
        }
        // Identity goes before anything else looks at the data — including the mapping guess.
        const scrub = stripIdentityFields(read.rows, {
          allow: props.allowIdentityFields,
          deny: props.denyIdentityFields,
        });
        const headers = Object.keys(scrub.rows[0]);
        const saved = props.mapping;
        const savedFits =
          saved && Object.values(saved).every((h) => h == null || headers.includes(h as string));
        const next = savedFits ? saved! : inferMapping(headers);
        setFile({ name, rows: scrub.rows, headers, dropped: scrub.dropped, format: read.format });
        setMapping(next);
        props.onMappingChange?.(next);
        publish(scrub.rows, next, scrub.dropped);
      } catch (e) {
        setError(`That file could not be read: ${(e as Error).message}`);
      }
    },
    [props, publish],
  );

  const readFiles = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onerror = () => setError("That file could not be read from disk.");
      reader.onload = () => accept(f.name, String(reader.result ?? ""));
      reader.readAsText(f);
    },
    [accept],
  );

  const setRole = (role: keyof ColumnMapping, header: string): void => {
    const next: ColumnMapping = { ...mapping };
    if (header === "") delete next[role];
    else next[role] = header;
    setMapping(next);
    props.onMappingChange?.(next);
    if (file) publish(file.rows, next, file.dropped);
  };

  const runGeocode = async (): Promise<void> => {
    if (!file || !props.geocode) return;
    setGeoNote(null);
    setProgress({ done: 0, total: summary?.geocodable ?? 0 });
    const res = await geocodeRows(file.rows, mapping, props.geocode, {
      limit: props.geocodeLimit ?? 250,
      delayMs: props.geocodeDelayMs ?? 1000,
      onProgress: (done, total) => setProgress({ done, total }),
    });
    setFile({ ...file, rows: res.rows, headers: Object.keys(res.rows[0] ?? {}) });
    setMapping(res.mapping);
    props.onMappingChange?.(res.mapping);
    publish(res.rows, res.mapping, file.dropped);
    setProgress(null);
    setGeoNote(
      `Placed ${res.located} of ${res.located + res.failed}` +
        (res.failed ? `, ${res.failed} not found` : "") +
        (res.skipped ? `, ${res.skipped} beyond this pass` : "") +
        ".",
    );
  };

  return (
    <div className={props.className} style={{ display: "flex", flexDirection: "column", gap: 10, ...props.style }}>
      {props.title ? <div style={{ fontWeight: 600, fontSize: 12, opacity: 0.8 }}>{props.title}</div> : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          readFiles(e.dataTransfer?.files ?? null);
        }}
        style={{
          border: `1px dashed ${dragging ? "#2563eb" : "#c3ccd4"}`,
          background: dragging ? "rgba(37,99,235,.06)" : "transparent",
          borderRadius: 6,
          padding: "14px 12px",
          textAlign: "center",
          fontSize: 13,
        }}
      >
        <div style={{ marginBottom: 8, opacity: 0.75 }}>Drop a CSV or GeoJSON file here</div>
        <button type="button" style={primaryBtn} onClick={() => inputRef.current?.click()}>
          Choose a file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.geojson,.json,text/csv,application/json,application/geo+json"
          aria-label="Data file"
          style={{ display: "none" }}
          onChange={(e) => readFiles(e.target.files)}
        />
        <div style={{ marginTop: 8, fontSize: 11.5, opacity: 0.6 }}>
          The file stays in this browser. Nothing is sent anywhere.
        </div>
      </div>

      {error ? (
        <div role="alert" style={{ fontSize: 12.5, color: "#9c3226" }}>
          {error}
        </div>
      ) : null}

      {file && summary ? (
        <>
          <div style={{ fontSize: 12.5 }}>
            <b>{file.name}</b> — {summary.total} rows.{" "}
            <span style={{ opacity: 0.8 }}>
              {summary.placed} placed
              {summary.geocodable ? `, ${summary.geocodable} need an address lookup` : ""}
              {summary.unplaceable ? `, ${summary.unplaceable} cannot be placed` : ""}.
            </span>
          </div>

          {file.dropped.length > 0 ? (
            <div style={{ fontSize: 12, background: "rgba(138,94,12,.10)", padding: "8px 10px", borderRadius: 4 }}>
              <b>Dropped as personal data:</b> {file.dropped.join(", ")}.{" "}
              <span style={{ opacity: 0.8 }}>These columns were removed before the file was read in.</span>
            </div>
          ) : null}

          <div style={{ display: "grid", gap: 6 }}>
            {ROLES.map((r) => (
              <label key={r.key} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 8, fontSize: 12.5, alignItems: "center" }}>
                <span title={r.hint}>{r.label}</span>
                <select
                  aria-label={r.label}
                  value={(mapping[r.key] as string) ?? ""}
                  style={selectStyle}
                  onChange={(e) => setRole(r.key, e.target.value)}
                >
                  <option value="">— not set —</option>
                  {file.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {summary.geocodable > 0 && props.geocode ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button type="button" style={primaryBtn} disabled={progress != null} onClick={runGeocode}>
                {progress ? `Looking up ${progress.done} of ${progress.total}…` : `Look up ${summary.geocodable} addresses`}
              </button>
            </div>
          ) : null}

          {geoNote ? <div style={{ fontSize: 12, opacity: 0.8 }}>{geoNote}</div> : null}

          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 11.5, width: "100%" }}>
              <thead>
                <tr>
                  {file.headers.map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {file.rows.slice(0, previewRows).map((row, i) => (
                  <tr key={i}>
                    {file.headers.map((h) => (
                      <td key={h} style={tdStyle}>
                        {String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {file.rows.length > previewRows ? (
            <div style={{ fontSize: 11.5, opacity: 0.6 }}>+{file.rows.length - previewRows} more rows</div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: "5px 10px",
  fontSize: 12.5,
  borderRadius: 4,
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

const selectStyle: React.CSSProperties = {
  padding: "4px 6px",
  fontSize: 12.5,
  borderRadius: 4,
  border: "1px solid #c3ccd4",
  background: "transparent",
  color: "inherit",
  width: "100%",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "4px 8px",
  borderBottom: "1px solid #c3ccd4",
  whiteSpace: "nowrap",
  opacity: 0.75,
  fontWeight: 500,
};

const tdStyle: React.CSSProperties = {
  padding: "4px 8px",
  borderBottom: "1px solid rgba(0,0,0,.06)",
  whiteSpace: "nowrap",
};
