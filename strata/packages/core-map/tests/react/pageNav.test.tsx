import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { StrataApp } from "../../src/react/app/StrataApp.js";

const page = (id: string, title: string, body: string): AppLayout["pages"][number] => ({
  id,
  title,
  root: {
    kind: "column",
    children: [
      { kind: "widget", widget: { type: "page-nav" } },
      { kind: "widget", widget: { type: "text", props: { content: body } } },
    ],
  },
});

describe("page-nav widget (Phase 7)", () => {
  it("lists the app pages and navigates on click", () => {
    const config: AppLayout = { pages: [page("p1", "One", "BODY ONE"), page("p2", "Two", "BODY TWO")] };
    render(<StrataApp config={config} />);

    expect(screen.getByText("BODY ONE")).toBeInTheDocument();
    // PageNav renders plain <button>s (role "button"); the app tab bar uses role "tab", so this is unambiguous.
    const twoBtn = screen.getByRole("button", { name: "Two" });
    act(() => {
      fireEvent.click(twoBtn);
    });
    expect(screen.getByText("BODY TWO")).toBeInTheDocument();
  });
});
