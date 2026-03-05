import { afterEach, describe, expect, it, vi } from "vitest";
import type { Viewer as CesiumViewer } from "cesium";
import { waitForViewerReady } from "./waitForViewerReady";

afterEach(() => {
  vi.useRealTimers();
});

describe("waitForViewerReady", () => {
  it("calls onReady immediately when viewer is already available", () => {
    const viewer = {} as CesiumViewer;
    const onReady = vi.fn();

    const cleanup = waitForViewerReady(() => viewer, onReady, 25);

    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledWith(viewer);
    cleanup();
  });

  it("polls until viewer becomes available and then stops", () => {
    vi.useFakeTimers();
    const viewer = {} as CesiumViewer;
    const onReady = vi.fn();
    let attempts = 0;

    const cleanup = waitForViewerReady(() => {
      attempts += 1;
      return attempts >= 3 ? viewer : null;
    }, onReady, 20);

    expect(onReady).not.toHaveBeenCalled();

    vi.advanceTimersByTime(40);
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledWith(viewer);

    vi.advanceTimersByTime(100);
    expect(onReady).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("stops polling after cleanup", () => {
    vi.useFakeTimers();
    const onReady = vi.fn();

    const cleanup = waitForViewerReady(() => null, onReady, 10);
    cleanup();

    vi.advanceTimersByTime(100);
    expect(onReady).not.toHaveBeenCalled();
  });
});
