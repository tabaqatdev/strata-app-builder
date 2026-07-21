import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Embed, Video } from "../../src/react/widgets/Media.js";

describe("Embed", () => {
  it("renders a sandboxed iframe with src + title", () => {
    const { container } = render(<Embed src="https://example.com/map" title="Map" />);
    const f = container.querySelector("iframe")!;
    expect(f.getAttribute("src")).toBe("https://example.com/map");
    expect(f.getAttribute("title")).toBe("Map");
    expect(f.getAttribute("sandbox")).toContain("allow-scripts");
  });

  it("wraps in a fixed aspect-ratio box when aspect is set", () => {
    const { container } = render(<Embed src="https://x" aspect={16 / 9} />);
    const box = container.firstChild as HTMLElement;
    expect(box.style.paddingTop).toBe("56.25%"); // 100 / (16/9)
    expect(container.querySelector("iframe")).toBeTruthy();
  });

  it("omits the sandbox attribute when sandbox is null", () => {
    const { container } = render(<Embed src="https://x" sandbox={null} />);
    expect(container.querySelector("iframe")!.hasAttribute("sandbox")).toBe(false);
  });
});

describe("Video", () => {
  it("renders a video with src and controls on by default", () => {
    const { container } = render(<Video src="clip.mp4" />);
    const v = container.querySelector("video") as HTMLVideoElement;
    expect(v.getAttribute("src")).toBe("clip.mp4");
    expect(v.controls).toBe(true);
  });

  it("auto-mutes when autoplay is set", () => {
    const { container } = render(<Video src="c.mp4" autoplay />);
    const v = container.querySelector("video") as HTMLVideoElement;
    expect(v.muted).toBe(true);
  });
});
