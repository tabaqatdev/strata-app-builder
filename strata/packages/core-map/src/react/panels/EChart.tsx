/**
 * EChart — an Apache ECharts renderer behind the `MiniChart` interface (MIT).
 *
 * ECharts is an **optional peer dependency**: this component lazy-loads it and, if it isn't installed,
 * renders the dependency-free SVG `fallback` (so the lean core still works everywhere). When present,
 * ECharts gives richer, canvas-rendered charts and — critically for the WIF pillar — its `click` and
 * `brushSelected`/`dataZoom` events map onto the action bus: a bar click → `onSelect` (→ `categorySelect`),
 * a range brush → `onRange` (→ `rangeSelect`/`brush`). Colors come from the `@strata/theme` palette.
 */
import React, { useEffect, useRef, useState } from "react";
import { categorical } from "@strata/theme";

export interface ChartDatumLike {
  label: string;
  value: number;
}

export interface EChartProps {
  kind: "bar" | "line" | "pie" | "scatter";
  data: ChartDatumLike[];
  width?: number;
  height?: number;
  selected?: string | null;
  /** A category mark was clicked. */
  onSelect?: (d: ChartDatumLike, index: number) => void;
  /** A numeric range was brushed (min/max over the category axis indices → labels). */
  onRange?: (labels: string[]) => void;
  /** The SVG renderer used when ECharts is not installed (kept as the swap seam). */
  fallback: (p: {
    kind: "bar" | "line" | "pie" | "scatter";
    data: ChartDatumLike[];
    width?: number;
    height?: number;
    selected?: string | null;
    onSelect?: (d: ChartDatumLike, index: number) => void;
  }) => React.ReactElement;
}

// A variable specifier so TypeScript does not statically resolve the optional peer dep (it stays a
// runtime-only, lazily-loaded module — the lean core builds without `echarts` installed).
const ECHARTS_MODULE = "echarts";

/** Try to load the optional `echarts` peer dependency once; cache the module (or `null` if absent). */
let echartsModule: any;
let echartsTried = false;
async function loadECharts(): Promise<any | null> {
  if (echartsTried) return echartsModule ?? null;
  echartsTried = true;
  try {
    echartsModule = await import(/* @vite-ignore */ ECHARTS_MODULE);
    return echartsModule;
  } catch {
    echartsModule = null;
    return null;
  }
}

/** Build the ECharts `option` for a datum series. */
function buildOption(kind: EChartProps["kind"], data: ChartDatumLike[], selected?: string | null): any {
  const colors = categorical(Math.max(data.length, 1));
  if (kind === "pie") {
    return {
      color: colors,
      tooltip: { trigger: "item" },
      series: [
        {
          type: "pie",
          radius: ["35%", "70%"],
          data: data.map((d) => ({ name: d.label, value: d.value })),
        },
      ],
    };
  }
  return {
    color: colors,
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 12, top: 12, bottom: 24 },
    xAxis: { type: "category", data: data.map((d) => d.label) },
    yAxis: { type: "value" },
    brush: kind === "bar" ? { toolbox: [], xAxisIndex: 0, brushType: "lineX" } : undefined,
    series: [
      {
        type: kind,
        data: data.map((d) => ({
          value: d.value,
          itemStyle: selected && selected !== d.label ? { opacity: 0.35 } : undefined,
        })),
      },
    ],
  };
}

export function EChart(props: EChartProps): React.ReactElement {
  const { kind, data, onSelect, onRange, selected } = props;
  const [ready, setReady] = useState<boolean | null>(null); // null = probing, false = fallback, true = echarts
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const height = props.height ?? 160;

  useEffect(() => {
    let alive = true;
    void loadECharts().then((mod) => {
      if (!alive) return;
      setReady(!!mod);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (ready !== true || !elRef.current || !echartsModule) return;
    const chart = chartRef.current ?? echartsModule.init(elRef.current);
    chartRef.current = chart;
    chart.setOption(buildOption(kind, data, selected), true);
    const onClick = (params: any): void => {
      const idx = params.dataIndex ?? 0;
      if (data[idx] && onSelect) onSelect(data[idx], idx);
    };
    chart.off("click");
    chart.on("click", onClick);
    if (onRange) {
      chart.off("brushSelected");
      chart.on("brushSelected", (params: any) => {
        const idxs: number[] = params?.batch?.[0]?.selected?.[0]?.dataIndex ?? [];
        onRange(idxs.map((i) => data[i]?.label).filter(Boolean));
      });
    }
    return () => {
      /* keep the instance across renders; disposed on unmount below */
    };
  }, [ready, kind, data, selected, onSelect, onRange]);

  useEffect(
    () => () => {
      chartRef.current?.dispose?.();
      chartRef.current = null;
    },
    [],
  );

  // While probing or when ECharts is unavailable, render the SVG fallback (always works).
  if (ready !== true) {
    return props.fallback({ kind, data, width: props.width, height: props.height, selected, onSelect });
  }
  return <div ref={elRef} style={{ width: "100%", height }} />;
}

export default EChart;
