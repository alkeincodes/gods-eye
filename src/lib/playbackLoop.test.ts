import { describe, expect, it } from "vitest";
import { startPlaybackLoop } from "./playbackLoop";

function createMockRaf() {
  let nextId = 1;
  const callbacks = new Map<number, FrameRequestCallback>();

  return {
    requestAnimationFrame(cb: FrameRequestCallback): number {
      const id = nextId++;
      callbacks.set(id, cb);
      return id;
    },
    cancelAnimationFrame(id: number): void {
      callbacks.delete(id);
    },
    runFrame(id: number, ts: number): void {
      const cb = callbacks.get(id);
      if (!cb) return;
      callbacks.delete(id);
      cb(ts);
    },
    pendingIds(): number[] {
      return [...callbacks.keys()];
    },
  };
}

describe("startPlaybackLoop", () => {
  it("stops scheduling new frames after playback is paused", () => {
    const raf = createMockRaf();
    const handles: Array<number | null> = [];
    let playing = true;
    let frames = 0;

    startPlaybackLoop({
      isPlaying: () => playing,
      setHandle: (id) => handles.push(id),
      onFrame: () => {
        frames += 1;
        playing = false;
      },
      rafApi: {
        requestAnimationFrame: raf.requestAnimationFrame,
        cancelAnimationFrame: raf.cancelAnimationFrame,
      },
    });

    const [first] = raf.pendingIds();
    expect(first).toBeDefined();
    raf.runFrame(first!, 16);

    expect(frames).toBe(1);
    expect(raf.pendingIds()).toHaveLength(0);
    expect(handles[handles.length - 1]).toBeNull();
  });

  it("cancels pending frame on cleanup", () => {
    const raf = createMockRaf();
    let cancelled = false;

    const stop = startPlaybackLoop({
      isPlaying: () => true,
      setHandle: () => {},
      onFrame: () => {},
      rafApi: {
        requestAnimationFrame: raf.requestAnimationFrame,
        cancelAnimationFrame: (id) => {
          cancelled = true;
          raf.cancelAnimationFrame(id);
        },
      },
    });

    expect(raf.pendingIds().length).toBe(1);
    stop();
    expect(cancelled).toBe(true);
    expect(raf.pendingIds()).toHaveLength(0);
  });
});
