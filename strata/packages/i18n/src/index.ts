/**
 * @strata/i18n — a tiny, dependency-free internationalization helper for strata-app-builder apps.
 *
 * A dictionary is a plain `locale -> key -> string` map. `createI18n` returns a small runtime that
 * looks up a key for the current locale, interpolates `{var}` placeholders, falls back to the key when
 * a string is missing, and reports the writing direction (`ltr`/`rtl`) for the locale. A base bilingual
 * (EN + AR) dictionary of common UI strings ships as `baseDict` so apps get a sensible default.
 *
 * Framework-agnostic and zero runtime dependencies. A thin React binding (`I18nProvider`/`useI18n`)
 * lives in `@strata/core-map`.
 */

/** A dictionary: locale code -> translation key -> translated string. */
export type Dict = Record<string, Record<string, string>>;

/** The runtime returned by {@link createI18n}. */
export interface I18n {
  /** The current locale code (e.g. `"en"`, `"ar"`). */
  locale: string;
  /**
   * Translate `key` for the current locale, interpolating `{var}` placeholders from `vars`.
   * Falls back to the raw `key` when no string is defined.
   */
  t(key: string, vars?: Record<string, string | number>): string;
  /** Switch the active locale in place. */
  setLocale(l: string): void;
  /** Writing direction of the current locale: `"rtl"` for ar/he/fa/ur, else `"ltr"`. */
  dir(): "ltr" | "rtl";
  /** The list of locale codes present in the dictionary. */
  available(): string[];
}

/** Locale-code prefixes that are written right-to-left. */
const RTL_PREFIXES = ["ar", "he", "fa", "ur"] as const;

/** Return the writing direction for a locale code (matches on the language prefix). */
export function dirForLocale(locale: string): "ltr" | "rtl" {
  const lang = locale.toLowerCase().split(/[-_]/)[0] ?? "";
  return RTL_PREFIXES.includes(lang as (typeof RTL_PREFIXES)[number]) ? "rtl" : "ltr";
}

/** Replace `{name}` placeholders in `template` with values from `vars` (missing vars are left as-is). */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value == null ? match : String(value);
  });
}

/**
 * Create an i18n runtime over `dict`, starting at `locale`.
 *
 * @example
 * const i18n = createI18n(baseDict, "ar");
 * i18n.t("search");            // "بحث"
 * i18n.dir();                  // "rtl"
 * i18n.t("results", { n: 3 }); // interpolates {n}
 */
export function createI18n(dict: Dict, locale: string): I18n {
  const api: I18n = {
    locale,
    t(key: string, vars?: Record<string, string | number>): string {
      const table = dict[api.locale];
      const raw = table ? table[key] : undefined;
      return interpolate(raw ?? key, vars);
    },
    setLocale(l: string): void {
      api.locale = l;
    },
    dir(): "ltr" | "rtl" {
      return dirForLocale(api.locale);
    },
    available(): string[] {
      return Object.keys(dict);
    },
  };
  return api;
}

/**
 * A base bilingual dictionary (English + Arabic) of common GIS-app UI strings. Merge or extend it with
 * your own keys/locales, or pass it straight to {@link createI18n}.
 */
export const baseDict: Dict = {
  en: {
    layers: "Layers",
    basemap: "Basemap",
    legend: "Legend",
    search: "Search",
    filter: "Filter",
    export: "Export",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    measure: "Measure",
    sketch: "Sketch",
    identify: "Identify",
    clear: "Clear",
    opacity: "Opacity",
    visibility: "Visibility",
    fullscreen: "Fullscreen",
    locate: "My location",
    loading: "Loading…",
    noResults: "No results",
    close: "Close",
    settings: "Settings",
    language: "Language",
  },
  ar: {
    layers: "الطبقات",
    basemap: "الخريطة الأساسية",
    legend: "مفتاح الخريطة",
    search: "بحث",
    filter: "تصفية",
    export: "تصدير",
    zoomIn: "تكبير",
    zoomOut: "تصغير",
    measure: "قياس",
    sketch: "رسم",
    identify: "تعريف",
    clear: "مسح",
    opacity: "الشفافية",
    visibility: "الظهور",
    fullscreen: "ملء الشاشة",
    locate: "موقعي",
    loading: "جارٍ التحميل…",
    noResults: "لا توجد نتائج",
    close: "إغلاق",
    settings: "الإعدادات",
    language: "اللغة",
  },
};
