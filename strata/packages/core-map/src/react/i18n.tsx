/**
 * React binding for @strata/i18n — `I18nProvider` + `useI18n()` (MIT).
 *
 * Wrap your app in `<I18nProvider dict={…} locale="en">` and read the current translation function,
 * direction, and locale from `useI18n()`. Changing the locale via `setLocale` re-renders consumers, so
 * a language switcher just calls it; apps then mirror `dir` onto their root element (e.g. `<html dir>`)
 * so RTL locales flip the layout.
 */
import React, { createContext, useContext, useMemo, useState } from "react";
import { createI18n, type Dict } from "@strata/i18n";

/** The value exposed by {@link useI18n}. */
export interface I18nContextValue {
  /** Translate `key`, interpolating `{var}` placeholders; falls back to the key when missing. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Writing direction of the current locale (`"ltr"` | `"rtl"`). */
  dir: "ltr" | "rtl";
  /** The current locale code. */
  locale: string;
  /** Switch the active locale (re-renders consumers). */
  setLocale: (l: string) => void;
  /** The list of locale codes present in the dictionary. */
  available: string[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  /** The dictionary (`locale -> key -> string`). */
  dict: Dict;
  /** The initial locale code. */
  locale: string;
  children: React.ReactNode;
}

/** Provide an i18n runtime to the tree. Changing `locale` in state re-renders all consumers. */
export function I18nProvider(props: I18nProviderProps): React.ReactElement {
  const { dict, children } = props;
  const [locale, setLocale] = useState<string>(props.locale);

  const value = useMemo<I18nContextValue>(() => {
    const i18n = createI18n(dict, locale);
    return {
      t: i18n.t,
      dir: i18n.dir(),
      locale,
      setLocale,
      available: i18n.available(),
    };
  }, [dict, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Read the i18n context. Returns `{ t, dir, locale, setLocale, available }`.
 * Throws if used outside an {@link I18nProvider}.
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an <I18nProvider>");
  return ctx;
}

/**
 * Like {@link useI18n} but returns `null` instead of throwing when there is no provider — for widgets
 * (e.g. the language switcher) that may be dropped into a layout with or without an `<I18nProvider>`.
 */
export function useOptionalI18n(): I18nContextValue | null {
  return useContext(I18nContext);
}
