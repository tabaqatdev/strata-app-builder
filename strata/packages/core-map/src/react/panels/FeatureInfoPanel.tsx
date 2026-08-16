/**
 * FeatureInfoPanel — a docked/pinned feature-detail panel ([ExB], MIT).
 *
 * The same rich content as an on-map popup (it reuses the #4 `renderPopup` element model), but pinned
 * beside the map — the layout dashboards want. Two ways to drive it:
 *   - **controlled**: pass a `feature` ({ layerId, properties, popupInfo }).
 *   - **bus**: pass a `bus` + `onResolve(layerId, oid)`; the panel listens for `featureSelect`/`rowSelect`
 *     and resolves the clicked feature's attributes, so a selection anywhere fills the panel.
 */
import React, { useEffect, useState } from "react";
import type { DataSource } from "@strata/data-source";
import { PanelShell, type PanelMode } from "./PanelShell.js";
import { renderPopup } from "../../engine/popups.js";

export interface FeatureInfoValue {
  layerId: string;
  properties: Record<string, unknown>;
  popupInfo?: Record<string, any>;
}

export interface FeatureInfoPanelProps {
  /** Controlled selection to display. */
  feature?: FeatureInfoValue | null;
  /** `@strata/actions` bus — when set (with `onResolve`), the panel tracks `featureSelect`/`rowSelect`. */
  bus?: {
    on: (type: string, handler: (t: { source?: string; payload: any }) => void) => () => void;
  };
  /** Resolve a selected feature's attributes (and popupInfo) for bus-driven mode. */
  onResolve?: (
    layerId: string,
    oid: number | string,
  ) => Promise<FeatureInfoValue | null> | FeatureInfoValue | null;
  /**
   * A first-class DataSource (Phase 1). When set with `onResolve`, the panel tracks the source's
   * selection directly — so any widget that selects into the shared source fills this panel, no bus needed.
   */
  source?: DataSource;
  /** Message shown when nothing is selected. */
  emptyText?: string;
  title?: string;
  mode?: PanelMode;
  floating?: boolean;
  initialX?: number;
  initialY?: number;
  defaultWidth?: number;
  onClose?: () => void;
  onOpen?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function FeatureInfoPanel(props: FeatureInfoPanelProps): React.ReactElement {
  const controlled = props.feature !== undefined;
  const [tracked, setTracked] = useState<FeatureInfoValue | null>(null);

  useEffect(() => {
    if (controlled || !props.bus) return;
    const onSel = (t: { payload: any }): void => {
      const layerId: string = t.payload?.layerId;
      const oid: number | undefined = t.payload?.oids?.[0];
      if (layerId == null || oid == null || !props.onResolve) return;
      Promise.resolve(props.onResolve(layerId, oid)).then((v) => setTracked(v ?? null));
    };
    const offs = [
      props.bus.on("featureSelect", onSel),
      props.bus.on("rowSelect", onSel),
      props.bus.on("clear", () => setTracked(null)),
    ];
    return () => offs.forEach((o) => o());
  }, [controlled, props.bus, props.onResolve]);

  // Phase 1: track a bound DataSource's selection directly (in addition to, or instead of, the bus).
  const source = props.source;
  const onResolve = props.onResolve;
  useEffect(() => {
    if (controlled || !source || !onResolve) return;
    const apply = (): void => {
      const sel = source.getSelection();
      const layerId = sel?.layerId;
      const oid = sel?.oids?.[0];
      if (layerId == null || oid == null) {
        setTracked(null);
        return;
      }
      Promise.resolve(onResolve(layerId, oid)).then((v) => setTracked(v ?? null));
    };
    apply();
    return source.subscribe((e) => {
      if (e.type === "selectionChange") apply();
    });
  }, [controlled, source, onResolve]);

  const feature = controlled ? props.feature ?? null : tracked;

  return (
    <PanelShell
      title={props.title ?? "Feature info"}
      mode={props.floating ? "floating" : props.mode}
      initialX={props.initialX}
      initialY={props.initialY}
      defaultWidth={props.defaultWidth ?? 300}
      onClose={props.onClose}
      onOpen={props.onOpen}
      className={props.className}
      style={props.style}
    >
      <div style={{ padding: 12, fontSize: 13 }}>
        {feature ? (
          <div
            className="strata-feature-info"
            data-layer={feature.layerId}
            dangerouslySetInnerHTML={{ __html: renderPopup(feature.properties, feature.popupInfo) }}
          />
        ) : (
          <div style={{ color: "var(--strata-muted,#8b96a6)" }}>{props.emptyText ?? "Select a feature to see its details."}</div>
        )}
      </div>
    </PanelShell>
  );
}

export default FeatureInfoPanel;
