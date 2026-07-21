import { describe, it, expect, vi, afterEach } from "vitest";
import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimeSlider } from "../../src/react/controls/TimeSlider.js";

const MIN = 1_000_000;
const MAX = 2_000_000;

afterEach(() => {
  vi.useRealTimers();
});

describe("TimeSlider", () => {
  it("emits an instant-mode where clause per configured layer (fires on mount)", () => {
    const onApplyFilter = vi.fn();
    render(
      <TimeSlider
        min={MIN}
        max={MAX}
        mode="instant"
        layers={[{ id: "quakes", timeField: "time" }]}
        onApplyFilter={onApplyFilter}
      />,
    );
    expect(onApplyFilter).toHaveBeenCalled();
    const [layerId, where] = onApplyFilter.mock.calls.at(-1)!;
    expect(layerId).toBe("quakes");
    expect(where).toMatch(/^time <= \d+$/);
  });

  it("emits a BETWEEN-style window clause in window mode", () => {
    const onApplyFilter = vi.fn();
    render(
      <TimeSlider
        min={MIN}
        max={MAX}
        mode="window"
        windowSize={100_000}
        layers={[{ id: "quakes", timeField: "time" }]}
        onApplyFilter={onApplyFilter}
      />,
    );
    const where = onApplyFilter.mock.calls.at(-1)![1] as string;
    expect(where).toMatch(/time >= \d+ AND time <= \d+/);
  });

  it("re-applies the filter when the slider is moved", () => {
    const onChange = vi.fn();
    render(<TimeSlider min={MIN} max={MAX} onChange={onChange} />);
    onChange.mockClear();

    fireEvent.change(screen.getByLabelText("time"), { target: { value: String(MAX) } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ end: MAX }));
  });

  it("advances time and flips the button label while playing", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<TimeSlider min={MIN} max={MAX} step={1000} playIntervalMs={700} onChange={onChange} />);

    const play = screen.getByLabelText("play");
    act(() => {
      fireEvent.click(play);
    });
    expect(screen.getByLabelText("pause")).toBeInTheDocument();

    onChange.mockClear();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(onChange).toHaveBeenCalled();
  });
});
