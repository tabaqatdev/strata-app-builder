# @strata/i18n

A tiny, **dependency-free** internationalization helper for strata-app-builder apps. A dictionary is a plain
`locale -> key -> string` map; `createI18n` gives you `{var}` interpolation, key fallback, and RTL
direction detection. Ships a base **EN + AR** UI dictionary (`baseDict`).

```ts
import { createI18n, baseDict, type Dict } from "@strata/i18n";

const i18n = createI18n(baseDict, "en");

i18n.t("layers");            // "Layers"
i18n.setLocale("ar");
i18n.t("layers");            // "الطبقات"
i18n.dir();                  // "rtl"  → set on your root <html dir=…>
i18n.available();            // ["en", "ar"]

// {var} interpolation, with a fallback to the key when a string is missing:
i18n.t("welcome", { name: "Sara" }); // "welcome" (not defined) → falls back to the key
```

## Extending the dictionary

`Dict` is just data — spread `baseDict` and add your own keys or locales:

```ts
const dict: Dict = {
  en: { ...baseDict.en, welcome: "Welcome, {name}" },
  ar: { ...baseDict.ar, welcome: "مرحبًا، {name}" },
  fr: { welcome: "Bienvenue, {name}" },
};
const i18n = createI18n(dict, "fr");
```

`dir()` returns `"rtl"` for locales beginning `ar` / `he` / `fa` / `ur` (e.g. `ar-SA`), else `"ltr"`.

## React binding

A thin React binding — `I18nProvider` + `useI18n()` — lives in `@strata/core-map`. Wrap your tree,
then read `{ t, dir, locale, setLocale }` from the hook and set `dir` on your root element.
