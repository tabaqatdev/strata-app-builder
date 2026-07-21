import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import type { AppLayout } from "@strata/schema";
import { StrataStudio } from "../src/StrataStudio.js";

function config(): AppLayout {
  return {
    theme: { "--strata-accent": "#4ea1ff" }, // dark preset accent
    pages: [
      {
        id: "p",
        root: {
          kind: "column",
          children: [{ kind: "widget", widget: { id: "text1", type: "text", props: { content: "Hi" } } }],
        },
      },
    ],
  };
}

describe("StrataStudio (#13)", () => {
  it("renders outline, preview and inspector panes", () => {
    render(<StrataStudio config={config()} />);
    expect(screen.getByLabelText("Outline")).toBeInTheDocument();
    expect(screen.getByLabelText("Preview")).toBeInTheDocument();
    expect(screen.getByLabelText("Inspector")).toBeInTheDocument();
    // outline lists the widget
    expect(screen.getByRole("button", { name: /text #text1/ })).toBeInTheDocument();
  });

  it("selecting a widget shows its inspector; editing props JSON emits an updated layout", () => {
    const onChange = vi.fn();
    render(<StrataStudio config={config()} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /text #text1/ }));
    const propsBox = screen.getByLabelText("Props JSON") as HTMLTextAreaElement;
    expect(propsBox.value).toContain("Hi");
    fireEvent.change(propsBox, { target: { value: '{"content":"Bye"}' } });
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)![0] as AppLayout;
    expect((last.pages[0].root as any).children[0].widget.props.content).toBe("Bye");
  });

  it("the theme picker swaps the layout theme", () => {
    const onChange = vi.fn();
    render(<StrataStudio config={config()} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Theme"), { target: { value: "hazard" } });
    const last = onChange.mock.calls.at(-1)![0] as AppLayout;
    expect(last.theme!["--strata-accent"]).toBe("#ff6b3d"); // hazard accent
  });
});
