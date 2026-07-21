import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { StrataApp } from "../../src/react/app/StrataApp.js";

describe("app-shell (Phase 7)", () => {
  it("renders header + footer regions around the page body", () => {
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          header: { kind: "widget", widget: { type: "text", props: { content: "HEADER" } } },
          footer: { kind: "widget", widget: { type: "text", props: { content: "FOOTER" } } },
          root: { kind: "widget", widget: { type: "text", props: { content: "BODY" } } },
        },
      ],
    };
    const { container } = render(<StrataApp config={config} />);
    expect(screen.getByText("HEADER")).toBeInTheDocument();
    expect(screen.getByText("BODY")).toBeInTheDocument();
    expect(screen.getByText("FOOTER")).toBeInTheDocument();
    expect(container.querySelector("[data-strata-header]")).toBeTruthy();
    expect(container.querySelector("[data-strata-footer]")).toBeTruthy();
  });

  it("shows a dismissible splash overlay and closes it on Continue", () => {
    const config: AppLayout = {
      pages: [{ id: "p", root: { kind: "widget", widget: { type: "text", props: { content: "BODY" } } } }],
      splash: { title: "Welcome", body: "Intro text", dismissible: true },
    };
    render(<StrataApp config={config} />);
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Intro text")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText("Continue"));
    });
    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();
  });

  it("renders no splash when none is configured", () => {
    const config: AppLayout = {
      pages: [{ id: "p", root: { kind: "widget", widget: { type: "text", props: { content: "BODY" } } } }],
    };
    const { container } = render(<StrataApp config={config} />);
    expect(container.querySelector("[data-strata-splash]")).toBeNull();
  });
});
