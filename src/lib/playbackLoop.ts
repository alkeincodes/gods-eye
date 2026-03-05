interface RafApi {
  requestAnimationFrame: (cb: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
}

interface StartPlaybackLoopOptions {
  isPlaying: () => boolean;
  onFrame: (timestamp: number) => void;
  setHandle: (id: number | null) => void;
  rafApi?: RafApi;
}

const browserRafApi: RafApi = {
  requestAnimationFrame: (cb) => requestAnimationFrame(cb),
  cancelAnimationFrame: (id) => cancelAnimationFrame(id),
};

export function startPlaybackLoop({
  isPlaying,
  onFrame,
  setHandle,
  rafApi = browserRafApi,
}: StartPlaybackLoopOptions): () => void {
  let stopped = false;
  let handle: number | null = null;

  const tick: FrameRequestCallback = (timestamp) => {
    if (stopped || !isPlaying()) {
      setHandle(null);
      handle = null;
      return;
    }

    onFrame(timestamp);

    if (stopped || !isPlaying()) {
      setHandle(null);
      handle = null;
      return;
    }

    handle = rafApi.requestAnimationFrame(tick);
    setHandle(handle);
  };

  if (isPlaying()) {
    handle = rafApi.requestAnimationFrame(tick);
    setHandle(handle);
  } else {
    setHandle(null);
  }

  return () => {
    stopped = true;
    if (handle !== null) {
      rafApi.cancelAnimationFrame(handle);
      handle = null;
    }
    setHandle(null);
  };
}
