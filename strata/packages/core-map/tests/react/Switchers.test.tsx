import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSwitch, LangSwitch } from "../../src/react/widgets/Switchers.js";
import { I18nProvider } from "../../src/react/i18n.js";
import { themeTokens } from "@strata/theme";
import { baseDict } from "@strata/i18n";

describe("ThemeSwitch", () => {
  it("renders a button per theme and applies the initial theme to the app root on mount", () => {
    render(
      <div data-strata-app="">
        <ThemeSwitch initial="light" themes={["light", "dark"]} />
      </div>,
    );
    const root = document.querySelector("[data-strata-app]") as HTMLElement;
    // initial "light" tokens applied on mount
    expect(root.style.getPropertyValue("--strata-fg")).toBe(themeTokens("light")["--strata-fg"]);
    expect(screen.getByRole("button", { name: "Light" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("swaps the app-root tokens and fires onChange when another theme is picked", () => {
    const onChange = vi.fn();
    render(
      <div data-strata-app="">
        <ThemeSwitch initial="light" themes={["light", "dark"]} onChange={onChange} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    const root = document.querySelector("[data-strata-app]") as HTMLElement;
    expect(root.style.getPropertyValue("--strata-app-bg")).toBe(themeTokens("dark")["--strata-app-bg"]);
    expect(onChange).toHaveBeenCalledWith("dark");
  });
});

describe("LangSwitch", () => {
  it("toggles the locale and mirrors direction onto the app root", () => {
    render(
      <div data-strata-app="">
        <I18nProvider dict={baseDict} locale="en">
          <LangSwitch locales={[{ code: "en" }, { code: "ar", label: "العربية" }]} />
        </I18nProvider>
      </div>,
    );
    const root = document.querySelector("[data-strata-app]") as HTMLElement;
    expect(root.getAttribute("dir")).toBe("ltr");
    fireEvent.click(screen.getByRole("button", { name: "العربية" }));
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(screen.getByRole("button", { name: "العربية" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("degrades to a hint when there is no I18nProvider", () => {
    render(<LangSwitch />);
    expect(screen.getByText("No language provider")).toBeTruthy();
  });
});

describe("registry", () => {
  it("registers theme-switch and lang-switch widget types", async () => {
    const { defaultWidgetRegistry } = await import("../../src/react/app/registry.js");
    expect(defaultWidgetRegistry["theme-switch"]).toBe(ThemeSwitch);
    expect(defaultWidgetRegistry["lang-switch"]).toBe(LangSwitch);
  });
});
