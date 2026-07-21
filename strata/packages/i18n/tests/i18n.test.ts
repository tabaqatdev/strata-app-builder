import { describe, it, expect } from "vitest";
import { createI18n, dirForLocale, baseDict, type Dict } from "../src/index.js";

describe("dirForLocale", () => {
  it("returns rtl for Arabic/Hebrew/Farsi/Urdu", () => {
    for (const l of ["ar", "he", "fa", "ur"]) expect(dirForLocale(l)).toBe("rtl");
  });
  it("matches on the language prefix (region/script suffixes)", () => {
    expect(dirForLocale("ar-SA")).toBe("rtl");
    expect(dirForLocale("ar_EG")).toBe("rtl");
    expect(dirForLocale("en-US")).toBe("ltr");
  });
  it("defaults to ltr for other languages", () => {
    for (const l of ["en", "fr", "de", "zh", ""]) expect(dirForLocale(l)).toBe("ltr");
  });
});

describe("createI18n", () => {
  const dict: Dict = {
    en: { hello: "Hello", results: "{n} results" },
    ar: { hello: "مرحبا" },
  };

  it("translates for the current locale", () => {
    const i18n = createI18n(dict, "en");
    expect(i18n.t("hello")).toBe("Hello");
  });

  it("interpolates {var} placeholders", () => {
    const i18n = createI18n(dict, "en");
    expect(i18n.t("results", { n: 3 })).toBe("3 results");
  });

  it("leaves unknown placeholders in place", () => {
    const i18n = createI18n({ en: { x: "{a}/{b}" } }, "en");
    expect(i18n.t("x", { a: "1" })).toBe("1/{b}");
  });

  it("falls back to the key when a string is missing", () => {
    const i18n = createI18n(dict, "ar");
    expect(i18n.t("results")).toBe("results");
    expect(i18n.t("totallyMissing")).toBe("totallyMissing");
  });

  it("switches locale in place and reports direction", () => {
    const i18n = createI18n(dict, "en");
    expect(i18n.dir()).toBe("ltr");
    i18n.setLocale("ar");
    expect(i18n.t("hello")).toBe("مرحبا");
    expect(i18n.dir()).toBe("rtl");
  });

  it("lists available locales", () => {
    expect(createI18n(dict, "en").available().sort()).toEqual(["ar", "en"]);
  });
});

describe("baseDict", () => {
  it("ships English and Arabic", () => {
    expect(Object.keys(baseDict).sort()).toEqual(["ar", "en"]);
  });
  it("has full Arabic parity for every English key", () => {
    const enKeys = Object.keys(baseDict.en).sort();
    const arKeys = Object.keys(baseDict.ar).sort();
    expect(arKeys).toEqual(enKeys);
    for (const k of enKeys) expect(baseDict.ar[k].length).toBeGreaterThan(0);
  });
  it("is directly usable by createI18n", () => {
    const i18n = createI18n(baseDict, "ar");
    expect(i18n.t("search")).toBe("بحث");
    expect(i18n.dir()).toBe("rtl");
  });
});
