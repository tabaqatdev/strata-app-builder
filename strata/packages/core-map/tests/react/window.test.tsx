import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { StrataApp } from "../../src/react/app/StrataApp.js";
import { collectClosedWindowIds } from "../../src/react/app/windowScan.js";

describe("collectClosedWindowIds", () => {
  it("collects window ids that start closed (open !== true)", () => {
    const pages = [
      {
        id: "p",
        root: {
          kind: "column",
          children: [
            { kind: "window", id: "w1", open: false, children: [] },
            { kind: "window", id: "w2", open: true, children: [] },
            { kind: "window", children: [] },
          ],
        },
      },
    ] as AppLayout["pages"];
    expect(collectClosedWindowIds(pages).sort()).toEqual(["w1"]);
  });
});

describe("window node", () => {
  it("starts closed, opens via a buttonClick→showHide connection, and closes via ✕", async () => {
    const config: AppLayout = {
      pages: [
        {
          id: "p",
          root: {
            kind: "column",
            children: [
              { kind: "widget", widget: { id: "openBtn", type: "button", props: { label: "Open" } } },
              {
                kind: "window",
                id: "w1",
                title: "Details",
                open: false,
                children: [{ kind: "widget", widget: { type: "text", props: { content: "MODAL BODY" } } }],
              },
            ],
          },
        },
      ],
      connections: [{ from: "openBtn", trigger: "buttonClick", to: "w1", action: "showHide", options: { hidden: false } }],
    };

    render(<StrataApp config={config} />);
    expect(screen.queryByText("MODAL BODY")).not.toBeInTheDocument(); // seeded closed

    act(() => {
      fireEvent.click(screen.getByText("Open"));
    });
    expect(screen.getByText("MODAL BODY")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close"));
    // the window plays a short exit transition before it unmounts
    await waitFor(() => expect(screen.queryByText("MODAL BODY")).not.toBeInTheDocument());
  });
});
