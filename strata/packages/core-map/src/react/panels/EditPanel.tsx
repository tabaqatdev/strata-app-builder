/**
 * EditPanel — edit the selected feature of a layer (MIT).
 *
 * An attribute form (one input per editable field, OBJECTID skipped) that saves through
 * `@strata/feature-arcgis`'s `applyEdits`. Supports three actions:
 *   - Save   → `applyEdits({ updates: [{ attributes: { OBJECTID, ...edited } }] })`
 *   - Delete → `applyEdits({ deletes: [oid] })`
 *   - Add    → `applyEdits({ adds: [{ attributes: { ...edited } }] })` (in "add" mode)
 *
 * ⚠️ Editing requires a WRITABLE + AUTHENTICATED backend: ESRI Enterprise/Online today, or Strata
 * once its editing + auth land (Strata Serve is read-only in this release). The panel always shows a
 * banner saying so; pass an `authentication` manager (from `@strata/auth-arcgis`) or a raw `token`.
 *
 * Layout: renders inside a PanelShell, so it can be `mode="fixed"` (docked, default) or
 * `mode="floating"` (draggable overlay). The panel owns no map state — it reports results via
 * `onSaved` / `onDelete` callbacks so the app refreshes the source.
 */
import React, { useEffect, useMemo, useState } from "react";
import type { EsriField, OperationalLayer } from "@strata/schema";
import { applyEdits } from "@strata/feature-arcgis";
import { PanelShell, type PanelMode } from "./PanelShell.js";

/** The currently-selected feature to edit. */
export interface EditSelection {
  oid: number;
  attributes: Record<string, unknown>;
}

export interface EditPanelProps {
  /** The layer being edited. Its `url` is the FeatureServer layer endpoint (required to save). */
  layer: OperationalLayer;
  /** Editable field descriptors; falls back to `layer.layerDefinition.fields` then the selection keys. */
  fields?: EsriField[];
  /** The selected feature (edit/delete). Omit / pass `null` and set `add` for a new-feature form. */
  selected?: EditSelection | null;
  /** An ArcGIS auth manager (from `@strata/auth-arcgis`) — Esri backends only. */
  authentication?: unknown;
  /** A raw token, forwarded to `applyEdits`. */
  token?: string;
  /** Called with the raw `applyEdits` result after a successful save/add. */
  onSaved?: (result: unknown) => void;
  /** Called with the deleted OID after a successful delete. */
  onDelete?: (oid: number) => void;
  /** Layout mode passed through to PanelShell. Defaults to "fixed". */
  mode?: PanelMode;
  /** Convenience alias for `mode="floating"`. */
  floating?: boolean;
  /** Floating-mode placement / sizing (forwarded to PanelShell). */
  initialX?: number;
  initialY?: number;
  defaultWidth?: number;
  /** Close the panel (floating × button and "Remove" menu item). */
  onClose?: () => void;
  /** "Open" menu item. */
  onOpen?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

/** The OBJECTID / OID field name that is never rendered as an editable input. */
const OID_FIELD = "OBJECTID";

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "error"; message: string }
  | { kind: "success"; message: string };

/** ESRI field types that are read-only / system-managed and skipped in the form. */
const READONLY_TYPES = new Set([
  "esriFieldTypeOID",
  "esriFieldTypeGlobalID",
  "esriFieldTypeGeometry",
  "esriFieldTypeRaster",
  "esriFieldTypeBlob",
]);

/** Whether a field should get an editable input (not OID, not a system type). */
function isEditable(field: EsriField): boolean {
  if (field.name === OID_FIELD) return false;
  return !READONLY_TYPES.has(field.type);
}

/** Map an ESRI field type to an HTML input type. */
function inputTypeFor(field: EsriField): "number" | "date" | "text" {
  switch (field.type) {
    case "esriFieldTypeSmallInteger":
    case "esriFieldTypeInteger":
    case "esriFieldTypeSingle":
    case "esriFieldTypeDouble":
      return "number";
    case "esriFieldTypeDate":
      return "date";
    default:
      return "text";
  }
}

/** True for the ESRI numeric field types. */
function isNumericType(type: string): boolean {
  return (
    type === "esriFieldTypeSmallInteger" ||
    type === "esriFieldTypeInteger" ||
    type === "esriFieldTypeSingle" ||
    type === "esriFieldTypeDouble"
  );
}

export function EditPanel(props: EditPanelProps): React.ReactElement {
  const { layer, selected, authentication, token, onSaved, onDelete } = props;
  const adding = !selected;

  // Resolve the editable fields: explicit prop → layer definition → keys of the selection.
  const fields = useMemo<EsriField[]>(() => {
    if (props.fields && props.fields.length) return props.fields;
    const defFields = layer.layerDefinition?.fields;
    if (defFields && defFields.length) return defFields;
    const attrs = selected?.attributes ?? {};
    return Object.keys(attrs).map((name) => ({ name, type: "esriFieldTypeString" }));
  }, [props.fields, layer.layerDefinition?.fields, selected]);

  const editableFields = useMemo(() => fields.filter(isEditable), [fields]);

  // Local, editable copy of the attribute values, keyed by field name.
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  // Re-seed the form whenever the selection (or the field set) changes.
  useEffect(() => {
    const seed: Record<string, unknown> = {};
    const attrs = selected?.attributes ?? {};
    for (const f of editableFields) seed[f.name] = attrs[f.name] ?? "";
    setValues(seed);
    setState({ kind: "idle" });
  }, [selected, editableFields]);

  const label = (f: EsriField): string => f.alias ?? f.name;

  const setField = (name: string, raw: string, type: string): void => {
    setValues((v) => ({ ...v, [name]: isNumericType(type) ? (raw === "" ? "" : Number(raw)) : raw }));
  };

  /** Coerce the form values into an attributes bag (drop empty strings → null). */
  const editedAttributes = (): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const f of editableFields) {
      const val = values[f.name];
      out[f.name] = val === "" ? null : val;
    }
    return out;
  };

  const canWrite = Boolean(layer.url);

  const doSave = async (): Promise<void> => {
    if (!layer.url) {
      setState({ kind: "error", message: "This layer has no FeatureServer url to edit." });
      return;
    }
    setState({ kind: "saving" });
    try {
      const attributes = adding
        ? editedAttributes()
        : { [OID_FIELD]: selected!.oid, ...editedAttributes() };
      const result = await applyEdits({
        url: layer.url,
        ...(adding ? { adds: [{ attributes }] } : { updates: [{ attributes }] }),
        authentication,
        token,
      });
      setState({ kind: "success", message: adding ? "Feature added." : "Feature saved." });
      onSaved?.(result);
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : String(err) });
    }
  };

  const doDelete = async (): Promise<void> => {
    if (!layer.url || !selected) return;
    setState({ kind: "saving" });
    try {
      await applyEdits({ url: layer.url, deletes: [selected.oid], authentication, token });
      setState({ kind: "success", message: "Feature deleted." });
      onDelete?.(selected.oid);
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : String(err) });
    }
  };

  const saving = state.kind === "saving";
  const title = adding ? `Add feature — ${layer.title}` : `Edit feature — ${layer.title}`;

  return (
    <PanelShell
      title={title}
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth ?? 340}
      onClose={props.onClose}
      onOpen={props.onOpen}
      className={props.className}
      style={{ ...panelStyle, ...props.style }}
    >
      <div style={bannerStyle} role="note">
        Editing requires a writable, authenticated backend (ESRI Enterprise/Online today; Strata editing
        is planned).
      </div>

      {!canWrite && (
        <div style={{ ...msgStyle, ...errorMsgStyle }}>
          This layer has no FeatureServer <code>url</code>; editing is disabled.
        </div>
      )}

      <div style={formStyle}>
        {!adding && (
          <div style={oidRowStyle}>
            <span style={oidLabelStyle}>{OID_FIELD}</span>
            <span style={oidValueStyle}>{selected!.oid}</span>
          </div>
        )}

        {editableFields.length === 0 && (
          <div style={{ ...msgStyle, color: "#999" }}>No editable fields for this feature.</div>
        )}

        {editableFields.map((f) => (
          <label key={f.name} style={fieldRowStyle}>
            <span style={fieldLabelStyle} title={f.name}>
              {label(f)}
            </span>
            <input
              type={inputTypeFor(f)}
              value={values[f.name] == null ? "" : String(values[f.name])}
              disabled={saving || !canWrite}
              style={inputStyle}
              onChange={(e) => setField(f.name, e.target.value, f.type)}
            />
          </label>
        ))}
      </div>

      {state.kind === "error" && <div style={{ ...msgStyle, ...errorMsgStyle }}>{state.message}</div>}
      {state.kind === "success" && (
        <div style={{ ...msgStyle, ...successMsgStyle }}>{state.message}</div>
      )}

      <div style={actionsStyle}>
        <button
          type="button"
          style={{ ...btnStyle, ...primaryBtnStyle }}
          disabled={saving || !canWrite}
          onClick={() => void doSave()}
        >
          {saving ? "Saving…" : adding ? "Add" : "Save"}
        </button>
        {!adding && (
          <button
            type="button"
            style={{ ...btnStyle, ...dangerBtnStyle }}
            disabled={saving || !canWrite}
            onClick={() => void doDelete()}
          >
            Delete
          </button>
        )}
        {props.onClose && (
          <button type="button" style={btnStyle} disabled={saving} onClick={props.onClose}>
            Cancel
          </button>
        )}
      </div>
    </PanelShell>
  );
}

export default EditPanel;

// --- inline styles ---------------------------------------------------------
const panelStyle: React.CSSProperties = { maxHeight: 520 };
const bannerStyle: React.CSSProperties = {
  font: "12px system-ui, sans-serif",
  color: "#7a5b00",
  background: "#fff8e1",
  borderBottom: "1px solid #f0e2b0",
  padding: "8px 12px",
};
const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "12px",
  overflow: "auto",
};
const oidRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "4px 0",
  borderBottom: "1px solid #f0f0f0",
};
const oidLabelStyle: React.CSSProperties = { fontSize: 12, color: "#888", fontWeight: 600 };
const oidValueStyle: React.CSSProperties = { fontSize: 12, color: "#555", fontFamily: "monospace" };
const fieldRowStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 3 };
const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#666",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const inputStyle: React.CSSProperties = {
  font: "13px system-ui, sans-serif",
  padding: "6px 8px",
  border: "1px solid #d5d5d5",
  borderRadius: 4,
  boxSizing: "border-box",
  width: "100%",
};
const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  padding: "10px 12px",
  borderTop: "1px solid #eee",
};
const btnStyle: React.CSSProperties = {
  font: "13px system-ui, sans-serif",
  padding: "6px 12px",
  border: "1px solid #d5d5d5",
  borderRadius: 4,
  background: "#fafafa",
  cursor: "pointer",
};
const primaryBtnStyle: React.CSSProperties = {
  background: "#1a73e8",
  borderColor: "#1a73e8",
  color: "#fff",
};
const dangerBtnStyle: React.CSSProperties = {
  background: "#fff",
  borderColor: "#e0b4b4",
  color: "#c53030",
};
const msgStyle: React.CSSProperties = { font: "12px system-ui, sans-serif", padding: "8px 12px" };
const errorMsgStyle: React.CSSProperties = { color: "#c53030", background: "#fdf2f2" };
const successMsgStyle: React.CSSProperties = { color: "#2f855a", background: "#f0fff4" };
