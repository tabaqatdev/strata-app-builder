/**
 * @strata/core-map — <StrataApp> (Part J.5, MIT).
 *
 * The declarative layout renderer. Given an `AppLayout` (pages of container/widget nodes) it renders
 * the active page's tree recursively:
 *   - Container nodes (`row`/`column`/`grid`/`section`/`card`) become flex/grid boxes. `mode:"flow"`
 *     is a normal flex/stack; `mode:"fixed"` is `position:relative` so children can be absolutely
 *     placed (Experience-Builder fixed layout).
 *   - Widget nodes resolve `registry[widget.type]` (default registry merged with the `registry` prop)
 *     and render it with `{ ...props, dataSource, ...context }`. Missing types render a placeholder.
 *   - `responsive` overrides are merged into a node by the current breakpoint (small <768, medium
 *     <1200, else large) via the exported `useBreakpoint()` hook.
 * Multi-page layouts render a minimal tab bar; the shown page is `page` (by id) or the first.
 *
 * Dependency-light: plain React + CSS. Themed via CSS custom properties; `config.theme` is applied as
 * inline custom properties on the app root.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AppLayout,
  AppPage,
  LayoutNode,
  ContainerNode,
  ViewsNode,
  ViewDef,
  MapState,
  AnimateKind,
  AnimateOptions,
  WidgetSpec,
} from "@strata/schema";
import {
  ActionBus,
  OutputRegistry,
  wireConnections,
  defaultDispatchers,
  connectOutputToBus,
  TimerSource,
  connectSourceToBus,
  type StoreLike,
  type MessagePayload,
} from "@strata/actions";
import { DataSourceManager, type DataSource } from "@strata/data-source";
import { compileTheme, resolveThemeMode, type Theme } from "@strata/theme";
import type { StrataStore } from "@strata/state";
import { defaultWidgetRegistry, type WidgetComponent } from "./registry.js";
import { StrataAppProvider, useStrataAppEnv, MapRegistry, type StrataAppEnv } from "./interactivity.js";
import { registerAppDataSources } from "./dataSources.js";
import { initialSizes, resizeSplit } from "./splitterMath.js";
import { collectClosedWindowIds } from "./windowScan.js";
import { animatedStyle, nextViewIndex } from "./animation.js";

/** The three layout breakpoints. */
export type Breakpoint = "small" | "medium" | "large";

/** Resolve a breakpoint from a viewport width (px). */
function breakpointForWidth(width: number): Breakpoint {
  if (width < 768) return "small";
  if (width < 1200) return "medium";
  return "large";
}

/** Track `prefers-color-scheme: dark`, updating when the OS setting changes (drives `theme.mode:"auto"`). */
function usePrefersDark(): boolean {
  const [dark, setDark] = useState<boolean>(
    () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = (): void => setDark(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return dark;
}

/** Track the current breakpoint from `window.innerWidth`, updating on resize. */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window === "undefined" ? "large" : breakpointForWidth(window.innerWidth),
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = (): void => setBp(breakpointForWidth(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return bp;
}

export interface StrataAppProps {
  /** The declarative layout to render. */
  config: AppLayout;
  /** Per-app widget overrides merged over the default registry. */
  registry?: Record<string, WidgetComponent>;
  /** Extra props spread onto every widget (e.g. `maplibregl`, a shared `store`). */
  context?: Record<string, unknown>;
  /** Which page to show (by id). Defaults to the first page. */
  page?: string;
  /** Shared action bus (WIF). Defaults to a fresh `ActionBus` created per app. */
  bus?: ActionBus;
  /** Shared output-data-source registry (WIF W2). Defaults to a fresh `OutputRegistry`. */
  outputs?: OutputRegistry;
  /** Handle `message` actions (default: `console.info`). */
  onMessage?: (m: MessagePayload) => void;
}

/** Everything renderNode/renderWidget need beyond the layout node itself. */
interface RenderEnv {
  bus: ActionBus;
  outputs: OutputRegistry;
  dataSources: DataSourceManager;
  hidden: ReadonlySet<string>;
  context: Record<string, unknown>;
}

/** Render a declarative `AppLayout`. */
export function StrataApp(props: StrataAppProps): React.ReactElement {
  const { config, registry, context } = props;
  const merged = useMemo<Record<string, WidgetComponent>>(
    () => ({ ...defaultWidgetRegistry, ...(registry ?? {}) }),
    [registry],
  );
  const bp = useBreakpoint();
  const prefersDark = usePrefersDark();

  // WIF: a shared bus + output registry for the whole app (props override the defaults).
  const bus = useMemo(() => props.bus ?? new ActionBus(), [props.bus]);
  const outputs = useMemo(() => props.outputs ?? new OutputRegistry(), [props.outputs]);
  // Phase 1: the first-class DataSource registry for the whole app (auto-wraps layerId / fromWidget).
  const dataSources = useMemo(() => new DataSourceManager(), []);
  // Phase 7: registry of live maps so sibling tool widgets (measure/draw/…) can reach a `map` widget.
  const maps = useMemo(() => new MapRegistry(), []);
  // Windows start closed unless `open:true` — seed them into the hidden set so they don't flash open.
  const [hidden, setHiddenState] = useState<ReadonlySet<string>>(
    () => new Set(collectClosedWindowIds(config.pages ?? [])),
  );
  const setHidden = useCallback((id: string, hide: boolean) => {
    setHiddenState((prev) => {
      const next = new Set(prev);
      if (hide) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  // Page selection — declared before the dispatch effect so the `navigate` action can switch pages,
  // and `selectPage` emits a `pageChange` trigger (Phase 2).
  const [selected, setSelected] = useState<string | undefined>(props.page);
  const selectPage = useCallback(
    (id: string) => {
      setSelected(id);
      bus.emit({ type: "pageChange", source: "app", payload: { pageId: id } });
    },
    [bus],
  );

  // Wire the declarative `connections` onto the bus, and bridge outputs → recordsChange triggers.
  const store = context?.store as StoreLike | undefined;
  const onMessage = props.onMessage;
  useEffect(() => {
    const dispatch = defaultDispatchers({
      store,
      bus,
      setHidden,
      onMessage: onMessage ?? ((m) => console.info(`[strata:${m.level ?? "info"}] ${m.text}`)),
      setUrlParam: (k, v) => {
        if (typeof window === "undefined") return;
        const url = new URL(window.location.href);
        if (v) url.searchParams.set(k, v);
        else url.searchParams.delete(k);
        window.history.replaceState(null, "", url.toString());
      },
      // Phase 2: page/url navigation and source refresh (view navigation + spatial/edit backends TBD).
      onNavigate: (t) => {
        if (t.pageId != null && props.page == null) setSelected(t.pageId);
        if (t.url && typeof window !== "undefined") window.open(t.url, "_blank", "noopener");
      },
      onRefresh: (t) => {
        const ds = t.sourceId ? dataSources.get(t.sourceId) : undefined;
        (ds as { refresh?: () => void } | undefined)?.refresh?.();
      },
    });
    const offConnections = wireConnections(bus, config.connections, dispatch);
    const offOutputs = connectOutputToBus(outputs, bus);
    return () => {
      offConnections();
      offOutputs();
    };
  }, [bus, outputs, config.connections, store, setHidden, onMessage, dataSources, props.page]);

  // Phase 1: pre-register a DataSource for every widget binding (idempotent, so widgets sharing a
  // layerId share ONE source and therefore link selection/filter with no `connections`).
  const dsStore = context?.store as unknown as StrataStore | undefined;
  useEffect(() => {
    registerAppDataSources(dataSources, config.pages ?? [], { store: dsStore, outputs });
  }, [dataSources, config.pages, dsStore, outputs]);

  // Phase 2: mount a TimerSource for each `timer` connection, and bridge every registered source's
  // `countChange` onto the bus (so connections can react to a filtered-count change).
  useEffect(() => {
    const timers: TimerSource[] = [];
    const seen = new Set<string>();
    for (const c of config.connections ?? []) {
      if (c.trigger === "timer" && !seen.has(c.from)) {
        seen.add(c.from);
        const ms = Number((c.options as Record<string, unknown> | undefined)?.intervalMs ?? 30000);
        const ts = new TimerSource(bus, ms, c.from);
        ts.start();
        timers.push(ts);
      }
    }
    const offBridges = dataSources.ids().map((id) => {
      const ds = dataSources.get(id);
      return ds ? connectSourceToBus(ds, bus) : () => {};
    });
    return () => {
      timers.forEach((t) => t.stop());
      offBridges.forEach((o) => o());
    };
  }, [bus, config.connections, dataSources]);

  const pages = config.pages ?? [];
  const activeId = props.page ?? selected;
  const active: AppPage | undefined =
    (activeId != null ? pages.find((p) => p.id === activeId) : undefined) ?? pages[0];

  const env = useMemo<StrataAppEnv>(
    () => ({
      bus,
      outputs,
      dataSources,
      setHidden,
      isHidden: (id) => hidden.has(id),
      pages: pages.map((p) => ({ id: p.id, title: p.title })),
      activePageId: active?.id,
      navigateToPage: props.page == null ? selectPage : undefined,
      maps,
    }),
    [bus, outputs, dataSources, setHidden, hidden, pages, active?.id, selectPage, props.page, maps],
  );

  // Phase 6: a structured theme (has `colors`) compiles to vars + a scoped stylesheet; a flat map is
  // applied verbatim (back-compat).
  const rawTheme = config.theme;
  const structured = !!rawTheme && typeof rawTheme === "object" && "colors" in rawTheme;
  const compiledTheme = structured
    ? compileTheme({
        ...(rawTheme as unknown as Theme),
        mode: resolveThemeMode((rawTheme as unknown as Theme).mode, prefersDark),
      })
    : null;
  const themeVars = (compiledTheme ? compiledTheme.vars : rawTheme ?? {}) as Record<string, string>;
  const themeCss = compiledTheme?.css ?? "";
  const rootStyle: React.CSSProperties = {
    ...(themeVars as React.CSSProperties),
    color: "var(--strata-fg, #e8ecf1)",
    background: "var(--strata-app-bg, transparent)",
    width: "100%",
    height: active?.type === "scroll" ? undefined : "100%",
    minHeight: active?.type === "scroll" ? "100%" : undefined,
    display: "flex",
    flexDirection: "column",
  };

  const renderEnv: RenderEnv = { bus, outputs, dataSources, hidden, context: context ?? {} };

  return (
    <StrataAppProvider env={env}>
      <div style={rootStyle} data-strata-app="">
        {themeCss ? <style>{themeCss}</style> : null}
        {pages.length > 1 ? (
          <PageTabs
            pages={pages}
            activeId={active?.id}
            onSelect={props.page == null ? selectPage : undefined}
          />
        ) : null}
        {active?.header ? (
          <div data-strata-header="" style={{ flex: "0 0 auto", borderBottom: "1px solid var(--strata-border, rgba(255,255,255,0.08))" }}>
            {renderNode(active.header, merged, renderEnv, bp, "header")}
          </div>
        ) : null}
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflow: active?.type === "scroll" ? "auto" : "hidden",
          }}
        >
          {active ? renderNode(active.root, merged, renderEnv, bp, "root") : null}
        </div>
        {active?.footer ? (
          <div data-strata-footer="" style={{ flex: "0 0 auto", borderTop: "1px solid var(--strata-border, rgba(255,255,255,0.08))" }}>
            {renderNode(active.footer, merged, renderEnv, bp, "footer")}
          </div>
        ) : null}
        <SplashScreen splash={config.splash} />
      </div>
    </StrataAppProvider>
  );
}

/** An intro/splash overlay shown on first load; dismissible, with optional `once` (localStorage) memory. */
function SplashScreen(props: {
  splash?: { title?: string; body?: string; dismissible?: boolean; once?: boolean };
}): React.ReactElement | null {
  const s = props.splash;
  const [open, setOpen] = useState<boolean>(() => {
    if (!s) return false;
    if (s.once && typeof localStorage !== "undefined") return localStorage.getItem("strata:splash") == null;
    return true;
  });
  if (!s || !open) return null;
  const dismissible = s.dismissible !== false;
  const close = (): void => {
    setOpen(false);
    if (s.once && typeof localStorage !== "undefined") localStorage.setItem("strata:splash", "1");
  };
  return (
    <div
      data-strata-splash=""
      role="dialog"
      aria-modal="true"
      onClick={dismissible ? close : undefined}
      style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480,
          padding: "24px 26px",
          background: "var(--strata-panel-bg, #12151b)",
          color: "var(--strata-fg, #e8ecf1)",
          border: "1px solid var(--strata-border, rgba(255,255,255,0.08))",
          borderRadius: "var(--strata-radius-lg, 16px)",
          boxShadow: "var(--strata-elevation-2, 0 4px 12px rgba(0,0,0,0.28))",
          textAlign: "center",
        }}
      >
        {s.title ? <h2 style={{ margin: "0 0 8px", fontSize: "var(--strata-h2, 22px)" }}>{s.title}</h2> : null}
        {s.body ? <p style={{ margin: "0 0 16px", color: "var(--strata-muted, #8b95a5)", fontSize: "var(--strata-body1, 14px)" }}>{s.body}</p> : null}
        {dismissible ? (
          <button
            type="button"
            onClick={close}
            style={{ font: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 18px", border: "none", borderRadius: "var(--strata-radius-md, 10px)", background: "var(--strata-accent, #4ea1ff)", color: "var(--strata-primary-contrast, #0b0e13)", cursor: "pointer" }}
          >
            Continue
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Minimal page tab bar for multi-page layouts. */
function PageTabs(props: {
  pages: AppPage[];
  activeId: string | undefined;
  onSelect?: (id: string) => void;
}): React.ReactElement {
  const { pages, activeId, onSelect } = props;
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: 4,
        padding: "6px 8px",
        borderBottom: "1px solid var(--strata-border, rgba(255,255,255,0.08))",
        background: "var(--strata-panel-bg, #12151b)",
      }}
    >
      {pages.map((p) => {
        const activeTab = p.id === activeId;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={activeTab}
            onClick={onSelect ? () => onSelect(p.id) : undefined}
            style={{
              padding: "6px 12px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: "none",
              cursor: onSelect ? "pointer" : "default",
              color: activeTab ? "#0b0e13" : "var(--strata-fg, #e8ecf1)",
              background: activeTab ? "var(--strata-accent, #4ea1ff)" : "transparent",
            }}
          >
            {p.title ?? p.id}
          </button>
        );
      })}
    </div>
  );
}

/** Merge a node's `responsive[bp]` partial into the node (container nodes only). */
function applyResponsive(node: ContainerNode, bp: Breakpoint): ContainerNode {
  const override = node.responsive?.[bp];
  if (!override) return node;
  // `responsive[bp]` is a `Partial<LayoutNode>`; only the container-shaped fields are meaningful here.
  const containerOverride = override as Partial<ContainerNode>;
  return {
    ...node,
    ...containerOverride,
    // Never let a partial override drop the real children/kind.
    kind: node.kind,
    children: node.children,
    style: { ...(node.style ?? {}), ...(containerOverride.style ?? {}) },
  };
}

/** Recursively render a layout node. */
function renderNode(
  node: LayoutNode,
  registry: Record<string, WidgetComponent>,
  env: RenderEnv,
  bp: Breakpoint,
  key: React.Key,
): React.ReactElement | null {
  if (node.kind === "widget") {
    return renderWidget(node.widget, registry, env, key);
  }
  if (node.kind === "views") {
    return <ViewsRenderer key={key} node={node} registry={registry} env={env} bp={bp} />;
  }
  const resolved = applyResponsive(node, bp);
  const children = resolved.children.map((child, i) => renderNode(child, registry, env, bp, i));
  if (resolved.kind === "accordion") {
    return <AccordionContainer key={key} node={resolved} rendered={children} />;
  }
  if (resolved.kind === "splitter") {
    return <SplitterContainer key={key} node={resolved} rendered={children} />;
  }
  if (resolved.kind === "window") {
    return <WindowContainer key={key} node={resolved} rendered={children} />;
  }
  if (resolved.kind === "panel") {
    return <PanelContainer key={key} node={resolved} rendered={children} />;
  }
  // Phase 7: `animateOptions.stagger` animates each child in turn (index × stagger) instead of the whole box.
  const stagger = resolved.animate && resolved.animateOptions?.stagger ? resolved.animateOptions.stagger : 0;
  const boxChildren = stagger
    ? children.map((child, i) => (
        <Animated
          key={i}
          kind={resolved.animate as AnimateKind}
          options={{ ...resolved.animateOptions, delay: (resolved.animateOptions?.delay ?? 0) + i * stagger }}
        >
          {child}
        </Animated>
      ))
    : children;
  const box = (
    <div key={key} style={containerStyle(resolved)}>
      {boxChildren}
    </div>
  );
  return resolved.animate && !stagger ? (
    <Animated key={key} kind={resolved.animate} options={resolved.animateOptions}>
      {box}
    </Animated>
  ) : (
    box
  );
}

/** A CSS-only entrance animation wrapper (fade / slide / scroll-reveal / fly / zoom / rotate). */
function Animated(props: {
  kind: AnimateKind;
  options?: AnimateOptions;
  children: React.ReactNode;
}): React.ReactElement {
  const [shown, setShown] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (props.kind !== "scroll-reveal") {
      const t = setTimeout(() => setShown(true), 20);
      return () => clearTimeout(t);
    }
    // scroll-reveal: show when the element scrolls into view.
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setShown(true)), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [props.kind]);
  return (
    <div
      ref={ref}
      data-animate={props.kind}
      data-shown={shown ? "" : undefined}
      style={animatedStyle(props.kind, shown, props.options) as React.CSSProperties}
    >
      {props.children}
    </div>
  );
}

/**
 * A splitter: children laid out along an axis with draggable dividers between them (ExB resizable
 * Sidebar / split). Sizes are percentages; dragging re-apportions two neighbors (pure `resizeSplit`).
 */
function SplitterContainer(props: {
  node: ContainerNode;
  rendered: Array<React.ReactElement | null>;
}): React.ReactElement {
  const { node, rendered } = props;
  const horizontal = (node.orientation ?? "h") === "h";
  const resizable = node.resizable !== false;
  const [sizes, setSizes] = useState<number[]>(() => initialSizes(rendered.length, node.sizes));
  const ref = React.useRef<HTMLDivElement>(null);

  const onDown = (i: number) => (e: React.MouseEvent): void => {
    if (!resizable) return;
    e.preventDefault();
    const rect = ref.current?.getBoundingClientRect();
    const total = (horizontal ? rect?.width : rect?.height) ?? 0;
    const start = horizontal ? e.clientX : e.clientY;
    const startSizes = sizes.slice();
    const onMove = (ev: MouseEvent): void => {
      const cur = horizontal ? ev.clientX : ev.clientY;
      const deltaPct = total > 0 ? ((cur - start) / total) * 100 : 0;
      setSizes(resizeSplit(startSizes, i, deltaPct, node.minSizes));
    };
    const onUp = (): void => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={ref}
      data-strata-splitter=""
      style={{
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        ...(node.style as React.CSSProperties),
      }}
    >
      {rendered.map((child, i) => (
        <React.Fragment key={i}>
          <div style={{ flexBasis: `${sizes[i] ?? 0}%`, flexGrow: 0, flexShrink: 0, minWidth: 0, minHeight: 0, overflow: "auto" }}>
            {child}
          </div>
          {i < rendered.length - 1 && (
            <div
              role="separator"
              aria-orientation={horizontal ? "vertical" : "horizontal"}
              data-strata-splitter-handle=""
              onMouseDown={onDown(i)}
              style={{
                flex: "0 0 6px",
                cursor: resizable ? (horizontal ? "col-resize" : "row-resize") : "default",
                background: "var(--strata-border, rgba(255,255,255,0.08))",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * A window/dialog: an overlay hosting the node's children, opened/closed by `showHide`/`navigate` on its
 * `id` (reusing the app hidden-set). Modal by default (backdrop click closes); `modal:false` = non-modal.
 */
function WindowContainer(props: {
  node: ContainerNode;
  rendered: Array<React.ReactElement | null>;
}): React.ReactElement | null {
  const env = useStrataAppEnv();
  const { node } = props;
  const open = node.id ? !(env?.isHidden(node.id) ?? false) : node.open ?? true;
  // Enter/exit animation: keep the window mounted through a short exit transition before removing it.
  const [render, setRender] = useState(open);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (open) {
      setRender(true);
      const t = setTimeout(() => setEntered(true), 15);
      return () => clearTimeout(t);
    }
    if (render) {
      setEntered(false);
      const t = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  if (!render) return null;
  const modal = node.modal !== false;
  const close = (): void => {
    if (node.id) env?.setHidden(node.id, true);
  };
  return (
    <div
      data-strata-window=""
      role="dialog"
      aria-modal={modal}
      onClick={modal ? close : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: modal ? "rgba(0,0,0,0.42)" : "transparent",
        pointerEvents: modal ? "auto" : "none",
        opacity: entered ? 1 : 0,
        transition: "opacity 180ms var(--strata-ease, ease)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          pointerEvents: "auto",
          minWidth: 280,
          maxWidth: "90vw",
          maxHeight: "85vh",
          overflow: "auto",
          background: "var(--strata-panel-bg, #12151b)",
          color: "var(--strata-fg, #e8ecf1)",
          border: "1px solid var(--strata-border, rgba(255,255,255,0.08))",
          borderRadius: "var(--strata-radius-lg, 16px)",
          boxShadow: "var(--strata-elevation-2, 0 4px 12px rgba(0,0,0,0.28))",
          transform: entered ? "none" : "scale(0.96) translateY(8px)",
          transition: "transform 200ms var(--strata-ease, ease)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "10px 14px",
            borderBottom: "1px solid var(--strata-border, rgba(255,255,255,0.08))",
          }}
        >
          <strong style={{ fontSize: 14 }}>{node.title ?? ""}</strong>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: node.gap ?? 8 }}>
          {props.rendered}
        </div>
      </div>
    </div>
  );
}

/**
 * A dockable, collapsible panel: a titled region anchored to an edge (left/right/top/bottom) or floating.
 * Generalizes the per-widget floating chrome — any layout can live in a dockable panel.
 */
function PanelContainer(props: {
  node: ContainerNode;
  rendered: Array<React.ReactElement | null>;
}): React.ReactElement {
  const { node } = props;
  const dock = node.dock ?? "left";
  const collapsible = node.collapsible !== false;
  const [open, setOpen] = useState(node.open ?? true);
  const float = dock === "float";
  const horizontal = dock === "left" || dock === "right";
  const edge = "1px solid var(--strata-border, rgba(255,255,255,0.08))";
  const dockBorder: React.CSSProperties =
    dock === "left" ? { borderRight: edge }
      : dock === "right" ? { borderLeft: edge }
        : dock === "top" ? { borderBottom: edge }
          : dock === "bottom" ? { borderTop: edge }
            : {};

  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: "var(--strata-panel-bg, #12151b)",
    color: "var(--strata-fg, #e8ecf1)",
    minWidth: 0,
    minHeight: 0,
    ...(horizontal && node.width && open ? { width: node.width, flex: "0 0 auto" } : {}),
    ...(!horizontal && node.width && open ? { height: node.width, flex: "0 0 auto" } : {}),
    ...dockBorder,
    ...(float
      ? {
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 500,
          borderRadius: "var(--strata-radius-lg, 16px)",
          border: "1px solid var(--strata-border, rgba(255,255,255,0.08))",
          boxShadow: "var(--strata-elevation-2, 0 4px 12px rgba(0,0,0,0.28))",
          maxHeight: "80vh",
          overflow: "auto",
        }
      : {}),
    ...(node.style as React.CSSProperties),
  };

  return (
    <div data-strata-panel="" data-strata-dock={dock} style={style}>
      {(node.title || collapsible) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "8px 12px",
            borderBottom: open ? "1px solid var(--strata-border, rgba(255,255,255,0.08))" : "none",
            cursor: collapsible ? "pointer" : "default",
          }}
          onClick={collapsible ? () => setOpen((o) => !o) : undefined}
        >
          <strong style={{ fontSize: 13 }}>{node.title ?? ""}</strong>
          {collapsible && (
            <button
              type="button"
              aria-label={open ? "Collapse" : "Expand"}
              aria-expanded={open}
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => !o);
              }}
              style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer", fontSize: 12 }}
            >
              {open ? "▾" : "▸"}
            </button>
          )}
        </div>
      )}
      {open && (
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: node.gap ?? 8, minWidth: 0, minHeight: 0, overflow: "auto" }}>
          {props.rendered}
        </div>
      )}
    </div>
  );
}

/** An accordion: each child in a collapsible section with a header (from `node.titles`). */
function AccordionContainer(props: { node: ContainerNode; rendered: Array<React.ReactElement | null> }): React.ReactElement {
  const titles = props.node.titles ?? [];
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...(props.node.style as React.CSSProperties) }}>
      {props.rendered.map((child, i) => {
        const isOpen = open[i] ?? false;
        return (
          <div key={i} style={{ border: "1px solid var(--strata-border, rgba(255,255,255,0.08))", borderRadius: 8, overflow: "hidden" }}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen((s) => ({ ...s, [i]: !isOpen }))}
              style={{
                width: "100%",
                textAlign: "start",
                font: "inherit",
                fontWeight: 600,
                padding: "8px 12px",
                border: "none",
                cursor: "pointer",
                background: "var(--strata-panel-bg, #12151b)",
                color: "var(--strata-fg, #e8ecf1)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {titles[i] ?? `Section ${i + 1}`}
              <span aria-hidden>{isOpen ? "▾" : "▸"}</span>
            </button>
            {isOpen && <div style={{ padding: 10 }}>{child}</div>}
          </div>
        );
      })}
    </div>
  );
}

/** Apply a view/slide's saved map-state to the store (viewpoint + filters + active layer). */
function applyMapState(store: { getState: () => any } | undefined, mapState?: MapState): void {
  if (!store || !mapState) return;
  const s = store.getState();
  if (mapState.viewpoint && s.setView) s.setView({ center: mapState.viewpoint.center, zoom: mapState.viewpoint.zoom });
  if (mapState.definitionExpression && s.setDefinition) {
    for (const [layerId, where] of Object.entries(mapState.definitionExpression)) s.setDefinition(layerId, where);
  }
  if (mapState.activeLayers?.[0] && s.setActiveLayer) s.setActiveLayer(mapState.activeLayers[0]);
}

/** Section + Views: tabs or a slide stepper; each view can drive the map via its saved `mapState`. */
function ViewsRenderer(props: {
  node: ViewsNode;
  registry: Record<string, WidgetComponent>;
  env: RenderEnv;
  bp: Breakpoint;
}): React.ReactElement {
  const { node, registry, env, bp } = props;
  const [active, setActive] = useState(0);
  const activeRef = React.useRef(0);
  const views = node.views ?? [];
  const store = env.context?.store as { getState: () => any } | undefined;

  const go = (i: number): void => {
    const clamped = Math.max(0, Math.min(views.length - 1, i));
    activeRef.current = clamped;
    setActive(clamped);
    applyMapState(store, views[clamped]?.mapState);
    // Phase 2 emitter: announce the view switch on the bus.
    env.bus.emit({ type: "viewChange", source: "views", payload: { viewId: views[clamped]?.id } });
  };

  // Apply the first view's map-state on mount.
  useEffect(() => {
    applyMapState(store, views[0]?.mapState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 7: auto-advance the views on an interval (a self-running slideshow).
  const autoPlay = node.autoPlay;
  useEffect(() => {
    if (!autoPlay || views.length < 2) return;
    const loop = autoPlay.loop !== false;
    const id = setInterval(
      () => go(nextViewIndex(activeRef.current, views.length, loop)),
      Math.max(300, autoPlay.intervalMs),
    );
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay?.intervalMs, autoPlay?.loop, views.length]);

  const current: ViewDef | undefined = views[active];
  const nav = node.nav ?? "tabs";
  const content = current ? renderNode(current.content, registry, env, bp, `view-${active}`) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", ...(node.style as React.CSSProperties) }}>
      {nav === "tabs" ? (
        <div role="tablist" style={{ display: "flex", gap: 4, padding: "6px 8px", borderBottom: "1px solid var(--strata-border, rgba(255,255,255,0.08))" }}>
          {views.map((v, i) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => go(i)}
              style={{
                padding: "5px 12px",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                color: i === active ? "#0b0e13" : "var(--strata-fg, #e8ecf1)",
                background: i === active ? "var(--strata-accent, #4ea1ff)" : "transparent",
              }}
            >
              {v.title ?? v.id}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderBottom: "1px solid var(--strata-border, rgba(255,255,255,0.08))" }}>
          <button type="button" onClick={() => go(active - 1)} disabled={active <= 0} style={stepBtnStyle}>
            ‹
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, flex: 1, textAlign: "center" }}>
            {current?.title ?? `${active + 1} / ${views.length}`}
          </span>
          <button type="button" onClick={() => go(active + 1)} disabled={active >= views.length - 1} style={stepBtnStyle}>
            ›
          </button>
        </div>
      )}
      <div style={{ flex: "1 1 auto", minHeight: 0 }}>
        {node.animate ? (
          <Animated key={active} kind={node.animate} options={node.animateOptions}>
            {content}
          </Animated>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

const stepBtnStyle: React.CSSProperties = {
  font: "inherit",
  width: 30,
  height: 26,
  borderRadius: 6,
  border: "1px solid var(--strata-border, rgba(255,255,255,0.16))",
  background: "transparent",
  color: "var(--strata-fg, #e8ecf1)",
  cursor: "pointer",
};

/** Compute the inline style for a container node. */
function containerStyle(node: ContainerNode): React.CSSProperties {
  const gap = node.gap ?? 12;
  const extra = (node.style ?? {}) as React.CSSProperties;
  const fixed = node.mode === "fixed";

  if (fixed) {
    return { position: "relative", width: "100%", height: "100%", ...extra };
  }

  if (node.kind === "grid") {
    const columns = node.columns ?? 2;
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`,
      gap,
      minWidth: 0,
      ...extra,
    };
  }

  if (node.kind === "flow-row") {
    // A wrapping row — items flow onto the next line (ExB Flow Row).
    return { display: "flex", flexDirection: "row", flexWrap: "wrap", gap, minWidth: 0, ...extra };
  }

  const base: React.CSSProperties = {
    display: "flex",
    flexDirection: node.kind === "row" ? "row" : "column",
    gap,
    minWidth: 0,
    ...extra,
  };

  if (node.kind === "card" || node.kind === "section") {
    return {
      ...base,
      padding: node.kind === "card" ? "14px 16px" : "12px",
      borderRadius: node.kind === "card" ? 10 : 0,
      background: node.kind === "card" ? "var(--strata-panel-bg, #12151b)" : undefined,
      border:
        node.kind === "card" ? "1px solid var(--strata-border, rgba(255,255,255,0.08))" : undefined,
    };
  }
  return base;
}

/** Resolve and render a widget node, or a placeholder if its type is unknown. */
function renderWidget(
  spec: WidgetSpec,
  registry: Record<string, WidgetComponent>,
  env: RenderEnv,
  key: React.Key,
): React.ReactElement | null {
  // Honor the `showHide` action.
  if (spec.id && env.hidden.has(spec.id)) return null;
  const Component = registry[spec.type];
  if (!Component) {
    return (
      <div
        key={key}
        style={{
          padding: "8px 10px",
          fontSize: 12,
          borderRadius: 8,
          color: "var(--strata-critical, #f2545b)",
          border: "1px dashed var(--strata-critical, #f2545b)",
          background: "color-mix(in srgb, var(--strata-critical, #f2545b) 10%, transparent)",
        }}
      >
        unknown widget: {spec.type}
      </div>
    );
  }
  // Phase 1: resolve the binding to a concrete DataSource (sourceId → layerId → fromWidget). Idempotent,
  // so the instance is shared across widgets. `source` is additive — widgets that ignore it are unchanged.
  let source: DataSource | undefined;
  if (spec.dataSource) {
    const bindStore = env.context.store as unknown as StrataStore | undefined;
    const layers = bindStore?.getState().layers;
    source = env.dataSources.resolve(spec.dataSource, {
      store: bindStore,
      outputs: env.outputs,
      layers,
    });
  }
  // Thread the WIF handles onto every widget: its own `id`, the shared `bus`, and the `outputs` registry.
  // Widgets that emit triggers use `id` as the trigger `source`; bus-aware panels honor actions.
  const widgetProps: Record<string, unknown> = {
    id: spec.id,
    widgetId: spec.id,
    bus: env.bus,
    outputs: env.outputs,
    ...(spec.props ?? {}),
    dataSource: spec.dataSource,
    source,
    ...env.context,
  };
  // Phase 6: tag each widget with its type so a theme `overrides.{type}` block can restyle just this widget.
  // `display:contents` keeps layout unchanged; the override's `--strata-*` custom properties inherit through.
  return (
    <div key={key} data-strata-widget={spec.type} style={{ display: "contents" }}>
      <Component {...widgetProps} />
    </div>
  );
}

export default StrataApp;
