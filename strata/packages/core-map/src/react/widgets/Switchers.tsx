/**
 * @strata/core-map — ThemeSwitch + LangSwitch widgets (MIT).
 *
 * Two small header controls that give a generated app cheap perceived polish:
 *   - **ThemeSwitch** (`theme-switch`) — flips the app between `@strata/theme` presets at runtime by
 *     writing that preset's `--strata-*` tokens onto the nearest `[data-strata-app]` root, overriding
 *     the inline `AppLayout.theme`. No context or store needed.
 *   - **LangSwitch** (`lang-switch`) — toggles the active locale through `<I18nProvider>` and mirrors the
 *     writing direction onto the app root (`dir="rtl"` for Arabic). Degrades to a disabled hint when no
 *     provider is present.
 *
 * Plain React + CSS custom properties, matching the other widgets.
 */
import React, { useEffect, useRef, useState } from "react";
import { THEME_PRESETS, compileTheme, presetTheme } from "@strata/theme";
import { useOptionalI18n } from "../i18n.js";

/** Find the app root to theme (the `[data-strata-app]` element), falling back to `<html>`. */
function appRoot(from: HTMLElement | null): HTMLElement | null {
  if (!from) return null;
  return (from.closest("[data-strata-app]") as HTMLElement | null) ?? document.documentElement;
}

const segStyle: React.CSSProperties = {
  display: "inline-flex",
  gap: 2,
  padding: 2,
  borderRadius: 8,
  border: "1px solid var(--strata-border, rgba(255,255,255,0.16))",
  background: "var(--strata-panel-bg, transparent)",
};

function segButtonStyle(active: boolean): React.CSSProperties {
  return {
    font: "inherit",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    color: active ? "#0b0e13" : "var(--strata-fg, #e8ecf1)",
    background: active ? "var(--strata-accent, #4ea1ff)" : "transparent",
  };
}

export interface ThemeSwitchProps {
  /** Theme preset names to offer (default all built-ins: light/dark/hazard/muted). */
  themes?: string[];
  /** The preset selected initially (default `"dark"`). */
  initial?: string;
  /** Called after a theme is applied. */
  onChange?: (name: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

/** Runtime theme-preset switcher. Writes `@strata/theme` tokens onto the app root. */
export function ThemeSwitch(props: ThemeSwitchProps): React.ReactElement {
  const themes = props.themes ?? Object.keys(THEME_PRESETS);
  const [active, setActive] = useState<string>(props.initial ?? "dark");
  const ref = useRef<HTMLDivElement>(null);

  const apply = (name: string): void => {
    const root = appRoot(ref.current);
    if (root) {
      // Swap the full structured preset: apply its --strata-* vars + (re)inject the state/motion stylesheet.
      const preset = presetTheme(name);
      const { vars, css } = compileTheme(preset);
      for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
      root.classList.toggle("light", preset.mode === "light");
      let styleEl = root.querySelector("style[data-strata-theme-switch]") as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.setAttribute("data-strata-theme-switch", "");
        root.appendChild(styleEl);
      }
      styleEl.textContent = css;
    }
    setActive(name);
    props.onChange?.(name);
  };

  // Apply the initial theme once on mount so the widget and the app agree.
  useEffect(() => {
    apply(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} role="group" aria-label="Theme" style={{ ...segStyle, ...props.style }} className={props.className}>
      {themes.map((name) => (
        <button
          key={name}
          type="button"
          aria-pressed={name === active}
          style={segButtonStyle(name === active)}
          onClick={() => apply(name)}
        >
          {name[0].toUpperCase() + name.slice(1)}
        </button>
      ))}
    </div>
  );
}

export interface LangSwitchProps {
  /** Restrict/label the locales offered (default: everything in the dictionary). */
  locales?: Array<{ code: string; label?: string }>;
  style?: React.CSSProperties;
  className?: string;
}

/** Locale switcher bound to `<I18nProvider>`; mirrors writing direction onto the app root. */
export function LangSwitch(props: LangSwitchProps): React.ReactElement {
  const i18n = useOptionalI18n();
  const ref = useRef<HTMLDivElement>(null);

  // Keep the app root's `dir` in sync with the active locale (RTL for Arabic, etc.).
  useEffect(() => {
    if (!i18n) return;
    const root = appRoot(ref.current);
    if (root) root.setAttribute("dir", i18n.dir);
  }, [i18n?.dir, i18n]);

  if (!i18n) {
    return (
      <div ref={ref} style={{ ...segStyle, ...props.style }} className={props.className}>
        <span style={{ fontSize: 12, color: "var(--strata-muted, #8b96a6)", padding: "4px 8px" }}>
          No language provider
        </span>
      </div>
    );
  }

  const codes: Array<{ code: string; label?: string }> =
    props.locales ?? i18n.available.map((code) => ({ code }));

  return (
    <div ref={ref} role="group" aria-label="Language" style={{ ...segStyle, ...props.style }} className={props.className}>
      {codes.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          aria-pressed={code === i18n.locale}
          style={segButtonStyle(code === i18n.locale)}
          onClick={() => i18n.setLocale(code)}
        >
          {label ?? code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
